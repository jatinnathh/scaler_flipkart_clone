import "dotenv/config";
import { query } from "../src/config/db.js";

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
};

type ProductImageCandidate = {
  imageUrl: string;
  sourcePage?: string;
};

const MAX_IMAGES_PER_PRODUCT = 5;
const REQUEST_DELAY_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeImageUrl(url: string) {
  const decoded = decodeURIComponent(decodeHtml(url)).trim();
  if (!decoded.startsWith("http")) return null;
  if (decoded.includes("bing.net/th?id=")) return null;
  return decoded;
}

function normalizeSourceUrl(url: string | undefined) {
  if (!url) return undefined;
  const decoded = decodeURIComponent(decodeHtml(url)).trim();
  return decoded.startsWith("http") ? decoded : undefined;
}

function buildQuery(product: ProductRow) {
  const exactName = `"${product.name}"`;
  if (!product.brand) return exactName;
  return `${exactName} ${product.brand}`;
}

function extractImageCandidates(html: string) {
  const candidates: ProductImageCandidate[] = [];
  const seen = new Set<string>();

  const hrefPattern = /href="\/images\/search\?view=detailV2[^"]*?mediaurl=([^"&]+)[^"]*?(?:amp;url=([^"&]+))?[^"]*"/g;
  const metaPattern = /murl&quot;:&quot;([^"]+?)&quot;.*?(?:purl&quot;:&quot;([^"]+?)&quot;)?/g;

  const collect = (rawImageUrl: string, rawSourceUrl?: string) => {
    const imageUrl = normalizeImageUrl(rawImageUrl);
    if (!imageUrl || seen.has(imageUrl)) return;
    seen.add(imageUrl);
    candidates.push({
      imageUrl,
      sourcePage: normalizeSourceUrl(rawSourceUrl),
    });
  };

  for (const match of html.matchAll(hrefPattern)) {
    collect(match[1], match[2]);
  }

  for (const match of html.matchAll(metaPattern)) {
    collect(match[1], match[2]);
  }

  return candidates;
}

async function searchProductImages(product: ProductRow) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(buildQuery(product))}&form=HDRSC3`;
  const response = await fetch(searchUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Image search failed with status ${response.status}`);
  }

  const html = await response.text();
  return extractImageCandidates(html).slice(0, MAX_IMAGES_PER_PRODUCT);
}

async function updateProductImages(product: ProductRow, images: ProductImageCandidate[]) {
  await query("DELETE FROM product_images WHERE product_id = $1", [product.id]);

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    await query(
      `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        product.id,
        image.imageUrl,
        `${product.name} image ${index + 1}`,
        index,
        index === 0,
      ]
    );
  }
}

async function main() {
  console.log("Refreshing product images from web search...\n");

  const products = await query(
    `SELECT id, name, slug, brand
     FROM products
     WHERE is_active = true
     ORDER BY id ASC`
  ) as ProductRow[];

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const images = await searchProductImages(product);

      if (images.length === 0) {
        skipped += 1;
        console.warn(`  Skipped ${product.slug}: no images found`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      await updateProductImages(product, images);
      updated += 1;
      console.log(`  Updated ${product.slug}: ${images.length} images`);
    } catch (error) {
      skipped += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  Skipped ${product.slug}: ${message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\nDone. Updated ${updated} products, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error("Failed to refresh product images:", error);
  process.exit(1);
});

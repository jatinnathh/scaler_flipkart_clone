"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/context/ToastContext";
import { formatPrice, getDiscountLabel, getDeliveryDate } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { FiStar, FiHeart, FiShare2, FiShoppingCart, FiZap, FiCheck, FiTruck, FiShield, FiRefreshCcw } from "react-icons/fi";

function collectDetailCards(specs: Record<string, Record<string, string>>, highlights: string[]) {
  const cards: { label: string; value: string }[] = [];

  for (const [section, fields] of Object.entries(specs)) {
    for (const [key, value] of Object.entries(fields)) {
      if (!value || cards.length >= 6) continue;
      cards.push({ label: `${section} · ${key}`, value: String(value) });
    }
    if (cards.length >= 6) break;
  }

  if (cards.length < 6) {
    highlights.slice(0, 6 - cards.length).forEach((highlight, index) => {
      cards.push({ label: `Highlight ${index + 1}`, value: highlight });
    });
  }

  return cards;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.success) {
          setProduct(res.data);
          // Track recently viewed
          if (isSignedIn) {
            const token = await getToken();
            api.post("/recommendations/recently-viewed", { productId: res.data.id }, token).catch(() => {});
          }
          // Load reviews
          const revRes = await api.get(`/reviews?productId=${res.data.id}`);
          if (revRes.success) setReviews(revRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, isSignedIn, getToken]);

  const handleAddToCart = async () => {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    setAddingToCart(true);
    try {
      await addToCart(product.id);
      showToast("Added to cart!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    try {
      await addToCart(product.id);
      router.push("/checkout");
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "info");
    }
  };

  if (loading) {
    return (
      <div className="container-fk py-4">
        <div className="card p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton w-14 h-14 rounded-lg" />
                ))}
              </div>
              <div className="skeleton flex-1 aspect-square rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="skeleton w-3/4 h-8" />
              <div className="skeleton w-1/4 h-6" />
              <div className="skeleton w-1/2 h-8" />
              <div className="skeleton w-full h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state min-h-[60vh]">
        <h3>Product not found</h3>
        <p>The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-primary mt-4 no-underline">Go Home</Link>
      </div>
    );
  }

  const images = product.images || [];
  const specs = typeof product.specifications === "string" ? JSON.parse(product.specifications) : (product.specifications || {});
  const highlights = product.highlights || [];
  const related = product.relatedProducts || [];
  const wishlisted = isWishlisted(product.id);
  const ratingClass = parseFloat(product.avg_rating) >= 4 ? "high" : parseFloat(product.avg_rating) >= 3 ? "medium" : "low";
  const discountPercent = product.discount_percent || 0;
  const detailCards = collectDetailCards(specs, highlights);

  return (
    <div className="container-fk py-4">
      {/* Breadcrumb */}
      <div className="breadcrumb mb-3">
        <Link href="/">Home</Link>
        <span>/</span>
        {product.category_name && (
          <>
            <Link href={`/category/${product.category_slug}`}>{product.category_name}</Link>
            <span>/</span>
          </>
        )}
        <span className="fk-text truncate max-w-xs">{product.name}</span>
      </div>

      <div className="card p-4 md:p-6">
        <div className="grid md:grid-cols-[420px_1fr] lg:grid-cols-[480px_1fr] gap-6">
          {/* Left: Images with Vertical Thumbnails */}
          <div className="md:sticky md:top-28 self-start">
            <div className="flex gap-3">
              {/* Vertical Thumbnails */}
              {images.length > 1 && (
                <div className="pdp-thumbnails hidden sm:flex">
                  {images.map((img: any, i: number) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`pdp-thumb ${i === selectedImage ? "active" : ""}`}
                    >
                      <img src={img.image_url} alt="" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 pdp-image-stage group">
                <img
                  src={images[selectedImage]?.image_url || "https://via.placeholder.com/500"}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
                {/* Wishlist & Share floating */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={() => { if (!isSignedIn) { router.push("/sign-in"); return; } toggleWishlist(product.id); }}
                    className="floating-icon-btn"
                    title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <FiHeart size={18} fill={wishlisted ? "#FF6161" : "none"} color={wishlisted ? "#FF6161" : "#878787"} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="floating-icon-btn"
                    title="Share"
                  >
                    <FiShare2 size={16} className="fk-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal thumbnails on mobile */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mt-3 sm:hidden">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 border-2 rounded-lg p-1 flex-shrink-0 transition ${i === selectedImage ? "border-flipkart-primary" : "fk-border hover:border-gray-400"}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_quantity <= 0}
                className="btn btn-cart flex-1 text-base py-3.5 rounded-lg"
              >
                <FiShoppingCart size={18} />
                {addingToCart ? "Adding..." : "ADD TO CART"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="btn btn-buy flex-1 text-base py-3.5 rounded-lg"
              >
                <FiZap size={18} />
                BUY NOW
              </button>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Title & Brand */}
            <div>
              {product.brand && (
                <p className="text-sm text-flipkart-primary font-medium mb-1">{product.brand}</p>
              )}
              <h1 className="text-xl font-medium fk-text leading-snug">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {parseFloat(product.avg_rating) > 0 && (
                  <span className={`rating-badge ${ratingClass}`}>
                    {parseFloat(product.avg_rating).toFixed(1)} <FiStar size={11} fill="white" />
                  </span>
                )}
                <span className="text-sm fk-text-secondary">
                  {product.total_ratings} Ratings & {product.total_reviews} Reviews
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="border-b fk-border pb-4">
              {discountPercent > 0 && (
                <div className="super-deal-badge mb-2">
                  <span className="arrow">↓</span>{discountPercent}% Off
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold fk-text">{formatPrice(parseFloat(product.price))}</span>
                {parseFloat(product.mrp) > parseFloat(product.price) && (
                  <>
                    <span className="text-lg fk-text-secondary line-through">{formatPrice(parseFloat(product.mrp))}</span>
                    <span className="text-lg font-semibold text-flipkart-green">{getDiscountLabel(product.discount_percent)}</span>
                  </>
                )}
              </div>
              {product.stock_quantity <= 0 ? (
                <p className="text-flipkart-red font-semibold mt-2">Currently out of stock</p>
              ) : product.stock_quantity <= 5 ? (
                <p className="stock-warning mt-2">Hurry, only {product.stock_quantity} left!</p>
              ) : null}
            </div>

            {/* Offers */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Available Offers</h3>
              <div className="offer-card">
                <h4>Bank Offer</h4>
                <p>10% Instant Discount on HDFC Credit Cards, up to ₹1,500. T&C apply</p>
              </div>
              <div className="offer-card">
                <h4>No Cost EMI</h4>
                <p>Available on select cards for orders above ₹3,000</p>
              </div>
            </div>

            {/* Delivery & Services */}
            <div className="flex flex-wrap gap-6 py-3 border-t border-b fk-border">
              <div className="flex items-center gap-2 text-sm">
                <FiTruck size={18} className="fk-text-secondary" />
                <div>
                  <p className="font-medium fk-text">{getDeliveryDate()}</p>
                  <p className="text-xs fk-text-secondary">
                    {parseFloat(product.price) >= 500 ? "Free Delivery" : "₹40 Delivery"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiRefreshCcw size={18} className="fk-text-secondary" />
                <div>
                  <p className="font-medium fk-text">7 Day Return</p>
                  <p className="text-xs fk-text-secondary">Return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiShield size={18} className="fk-text-secondary" />
                <div>
                  <p className="font-medium fk-text">1 Year Warranty</p>
                  <p className="text-xs fk-text-secondary">Brand warranty</p>
                </div>
              </div>
            </div>

            {detailCards.length > 0 && (
              <div className="pdp-detail-shell">
                <h3 className="font-semibold mb-3 fk-text">Product Highlights</h3>
                <div className="pdp-feature-grid">
                  {detailCards.map((card) => (
                    <div key={card.label} className="pdp-feature-card">
                      <span className="pdp-feature-label">{card.label}</span>
                      <p className="pdp-feature-value">{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="border-b fk-border pb-4">
                <h3 className="font-semibold mb-3 fk-text">Highlights</h3>
                <ul className="space-y-2">
                  {highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm fk-text">
                      <FiCheck size={16} className="text-flipkart-green mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-b fk-border pb-4">
                <h3 className="font-semibold mb-2 fk-text">Description</h3>
                <p className="text-sm fk-text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="border-b fk-border pb-4">
                <h3 className="font-semibold mb-3 fk-text">Specifications</h3>
                <div className="space-y-4">
                  {Object.entries(specs).map(([section, fields]: [string, any]) => (
                    <div key={section}>
                      <h4 className="text-sm font-semibold text-flipkart-primary mb-2">{section}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          {Object.entries(fields).map(([key, value]: [string, any]) => (
                            <tr key={key} className="border-b fk-border">
                              <td className="py-2.5 pr-4 fk-text-secondary w-1/3">{key}</td>
                              <td className="py-2.5 fk-text">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && (
              <div>
                <h3 className="font-semibold mb-4">Ratings & Reviews</h3>
                {/* Distribution */}
                {reviews.ratingDistribution && (
                  <div className="flex items-start gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{parseFloat(product.avg_rating).toFixed(1)}</div>
                      <div className="flex items-center gap-0.5 justify-center mt-1">
                        {[1,2,3,4,5].map(s => (
                          <FiStar key={s} size={14} fill={s <= Math.round(parseFloat(product.avg_rating)) ? "#FF9F00" : "none"} color="#FF9F00" />
                        ))}
                      </div>
                      <p className="text-xs fk-text-secondary mt-1">{product.total_ratings} ratings</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {reviews.ratingDistribution.map((d: any) => (
                        <div key={d.rating} className="flex items-center gap-2 text-sm">
                          <span className="w-3">{d.rating}</span>
                          <FiStar size={12} className="fk-text-secondary" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-flipkart-green" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="text-xs fk-text-secondary w-8">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                {reviews.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.reviews.slice(0, 5).map((rev: any) => (
                      <div key={rev.id} className="pb-4 border-b fk-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`rating-badge ${rev.rating >= 4 ? "high" : rev.rating >= 3 ? "medium" : "low"}`}>
                            {rev.rating} <FiStar size={10} fill="white" />
                          </span>
                          {rev.title && <span className="font-medium text-sm fk-text">{rev.title}</span>}
                        </div>
                        {rev.body && <p className="text-sm fk-text-secondary mb-2">{rev.body}</p>}
                        <p className="text-xs fk-text-secondary">
                          {rev.first_name || "Anonymous"} {rev.last_name || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm fk-text-secondary">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="section-strip mt-3">
          <div className="section-header">
            <h2>Similar Products</h2>
          </div>
          <div className="product-scroll">
            {related.map((p: any) => (
              <div key={p.id} className="product-scroll-item">
                <ProductCard
                  id={p.id} name={p.name} slug={p.slug}
                  price={parseFloat(p.price)} mrp={parseFloat(p.mrp)}
                  discount_percent={p.discount_percent}
                  primary_image={p.primary_image}
                  avg_rating={parseFloat(p.avg_rating || "0")}
                  total_ratings={p.total_ratings || 0}
                  brand={p.brand}
                  stock_quantity={p.stock_quantity}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

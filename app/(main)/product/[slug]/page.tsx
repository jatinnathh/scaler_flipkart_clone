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
import { FiStar, FiHeart, FiShare2, FiShoppingCart, FiZap, FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";

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
            <div className="skeleton w-full aspect-square rounded-lg" />
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
        <span className="text-flipkart-text truncate max-w-xs">{product.name}</span>
      </div>

      <div className="card p-4 md:p-6">
        <div className="grid md:grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr] gap-6">
          {/* Left: Images */}
          <div className="md:sticky md:top-28 self-start">
            {/* Main Image */}
            <div className="border rounded-lg p-4 mb-3 aspect-square flex items-center justify-center bg-white relative group">
              <img
                src={images[selectedImage]?.image_url || "https://via.placeholder.com/500"}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 border-2 rounded p-1 flex-shrink-0 transition ${i === selectedImage ? "border-flipkart-primary" : "border-gray-200 hover:border-gray-400"}`}
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
                className="btn btn-cart flex-1 text-base py-3"
              >
                <FiShoppingCart size={18} />
                {addingToCart ? "Adding..." : "ADD TO CART"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="btn btn-buy flex-1 text-base py-3"
              >
                <FiZap size={18} />
                BUY NOW
              </button>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Title & Actions */}
            <div>
              {product.brand && (
                <p className="text-sm text-flipkart-text-secondary font-medium mb-1">{product.brand}</p>
              )}
              <h1 className="text-xl font-medium text-flipkart-text leading-snug">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {parseFloat(product.avg_rating) > 0 && (
                  <span className={`rating-badge ${ratingClass}`}>
                    {parseFloat(product.avg_rating).toFixed(1)} <FiStar size={11} fill="white" />
                  </span>
                )}
                <span className="text-sm text-flipkart-text-secondary">
                  {product.total_ratings} Ratings & {product.total_reviews} Reviews
                </span>
                <button onClick={handleShare} className="ml-auto p-2 hover:bg-gray-100 rounded-full transition" title="Share">
                  <FiShare2 size={18} className="text-flipkart-text-secondary" />
                </button>
                <button
                  onClick={() => { if (!isSignedIn) { router.push("/sign-in"); return; } toggleWishlist(product.id); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <FiHeart size={18} fill={wishlisted ? "#FF6161" : "none"} color={wishlisted ? "#FF6161" : "#878787"} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="border-b pb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(parseFloat(product.price))}</span>
                {parseFloat(product.mrp) > parseFloat(product.price) && (
                  <>
                    <span className="text-lg text-flipkart-text-secondary line-through">{formatPrice(parseFloat(product.mrp))}</span>
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

            {/* Delivery */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-flipkart-text-secondary">Delivery by</span>
              <span className="font-semibold">{getDeliveryDate()}</span>
              <span className="text-flipkart-text-secondary">|</span>
              <span className="text-flipkart-green font-medium">
                {parseFloat(product.price) >= 500 ? "Free" : "₹40"}
              </span>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Highlights</h3>
                <ul className="space-y-2">
                  {highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-flipkart-text">
                      <FiCheck size={16} className="text-flipkart-green mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-flipkart-text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="space-y-4">
                  {Object.entries(specs).map(([section, fields]: [string, any]) => (
                    <div key={section}>
                      <h4 className="text-sm font-semibold text-flipkart-text-secondary mb-2">{section}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          {Object.entries(fields).map(([key, value]: [string, any]) => (
                            <tr key={key} className="border-b border-flipkart-border/50">
                              <td className="py-2.5 pr-4 text-flipkart-text-secondary w-1/3">{key}</td>
                              <td className="py-2.5 text-flipkart-text">{value}</td>
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
              <div className="border-t pt-4">
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
                      <p className="text-xs text-flipkart-text-secondary mt-1">{product.total_ratings} ratings</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {reviews.ratingDistribution.map((d: any) => (
                        <div key={d.rating} className="flex items-center gap-2 text-sm">
                          <span className="w-3">{d.rating}</span>
                          <FiStar size={12} className="text-flipkart-text-secondary" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-flipkart-green" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="text-xs text-flipkart-text-secondary w-8">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                {reviews.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.reviews.slice(0, 5).map((rev: any) => (
                      <div key={rev.id} className="pb-4 border-b border-flipkart-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`rating-badge ${rev.rating >= 4 ? "high" : rev.rating >= 3 ? "medium" : "low"}`}>
                            {rev.rating} <FiStar size={10} fill="white" />
                          </span>
                          {rev.title && <span className="font-medium text-sm">{rev.title}</span>}
                        </div>
                        {rev.body && <p className="text-sm text-flipkart-text-secondary mb-2">{rev.body}</p>}
                        <p className="text-xs text-flipkart-text-secondary">
                          {rev.first_name || "Anonymous"} {rev.last_name || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-flipkart-text-secondary">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {related.map((p: any) => (
              <div key={p.id} className="min-w-[180px] max-w-[200px] flex-shrink-0">
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

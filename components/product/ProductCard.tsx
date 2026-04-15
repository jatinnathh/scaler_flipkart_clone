"use client";

import Link from "next/link";
import { FiHeart, FiStar } from "react-icons/fi";
import { formatPrice, getDiscountLabel, cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  discount_percent: number;
  primary_image?: string;
  avg_rating?: number;
  total_ratings?: number;
  brand?: string | null;
  stock_quantity?: number;
}

export default function ProductCard({
  id, name, slug, price, mrp, discount_percent,
  primary_image, avg_rating = 0, total_ratings = 0,
  brand, stock_quantity = 100,
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isSignedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const wishlisted = isWishlisted(id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    const result = await toggleWishlist(id);
    showToast(
      result ? "Added to Wishlist" : "Removed from Wishlist",
      result ? "success" : "info"
    );
  };

  const ratingClass = avg_rating >= 4 ? "high" : avg_rating >= 3 ? "medium" : "low";

  return (
    <Link href={`/product/${slug}`} className="product-card block no-underline group">
      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className={cn("product-card-wishlist", wishlisted && "active")}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <FiHeart
          size={16}
          fill={wishlisted ? "#FF6161" : "none"}
          color={wishlisted ? "#FF6161" : "#878787"}
        />
      </button>

      {/* Out of stock overlay */}
      {stock_quantity <= 0 && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
          <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="product-card-image">
        <img
          src={primary_image || "https://via.placeholder.com/300?text=No+Image"}
          alt={name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image";
          }}
        />
      </div>

      {/* Info */}
      <div className="space-y-1">
        {/* Brand */}
        {brand && (
          <p className="text-[11px] text-flipkart-text-secondary font-medium uppercase tracking-wider">
            {brand}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm text-flipkart-text font-medium line-clamp-2 leading-snug min-h-[2.5rem]">
          {name}
        </h3>

        {/* Rating + Price Row */}
        <div className="flex items-center gap-2">
          {avg_rating > 0 && (
            <span className={`rating-badge ${ratingClass}`}>
              {avg_rating.toFixed(1)} <FiStar size={9} fill="white" />
            </span>
          )}
          {total_ratings > 0 && (
            <span className="text-[11px] text-flipkart-text-secondary">
              ({total_ratings.toLocaleString()})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="price-block">
          <span className="price-current">{formatPrice(price)}</span>
          {mrp > price && (
            <>
              <span className="price-mrp">{formatPrice(mrp)}</span>
              <span className="price-discount">{getDiscountLabel(discount_percent)}</span>
            </>
          )}
        </div>

        {/* Stock warning */}
        {stock_quantity > 0 && stock_quantity <= 5 && (
          <p className="stock-warning text-xs">Only {stock_quantity} left!</p>
        )}
      </div>
    </Link>
  );
}

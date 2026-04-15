"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";
import type { WishlistItem } from "@/types";

export default function WishlistPage() {
  const { getToken } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlist() {
    try {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: WishlistItem[] }>("/wishlist", token);
      if (res.success) setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (id: number) => {
    const token = await getToken();
    await api.delete(`/wishlist/${id}`, token);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Removed from wishlist", "info");
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      await addToCart(item.product_id);
      await handleRemove(item.id);
      showToast("Moved to cart!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to move to cart", "error");
    }
  };

  if (loading) {
    return (
      <div className="container-fk py-4">
        <div className="skeleton w-full h-[400px] rounded" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-fk py-4">
        <div className="card empty-state">
          <FiHeart size={80} className="text-flipkart-text-secondary" />
          <h3 className="text-xl font-semibold mt-4">Your wishlist is empty!</h3>
          <p>Save products you love to your wishlist.</p>
          <Link href="/" className="btn btn-primary mt-4 no-underline">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4">
      <div className="card">
        <div className="p-4 border-b border-flipkart-border">
          <h1 className="text-lg font-semibold">My Wishlist ({items.length})</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {items.map((item) => (
            <div key={item.id} className="product-card">
              <Link href={`/product/${item.product_slug}`} className="no-underline">
                <div className="product-card-image">
                  <img
                    src={item.product_image || "https://via.placeholder.com/200"}
                    alt={item.product_name}
                    loading="lazy"
                  />
                </div>
                <p className="text-sm font-medium text-flipkart-text line-clamp-2 mb-2">{item.product_name}</p>
                <div className="price-block mb-2">
                  <span className="price-current text-base">{formatPrice(item.price)}</span>
                  {item.mrp > item.price && (
                    <span className="price-discount text-sm">{item.discount_percent}% off</span>
                  )}
                </div>
              </Link>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleMoveToCart(item)} className="btn btn-cart btn-sm flex-1 text-xs">
                  <FiShoppingCart size={12} /> Move to Cart
                </button>
                <button onClick={() => handleRemove(item.id)} className="btn btn-ghost btn-sm px-2">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

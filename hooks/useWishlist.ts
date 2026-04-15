"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";

export function useWishlist() {
  const { getToken, isSignedIn } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: number[] }>("/wishlist/ids", token);
      if (res.success) setWishlistIds(res.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, [isSignedIn, getToken]);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await api.post<{ success: boolean; wishlisted: boolean }>(
          "/wishlist/toggle",
          { productId },
          token
        );
        if (res.success) {
          setWishlistIds((prev) =>
            res.wishlisted
              ? [...prev, productId]
              : prev.filter((id) => id !== productId)
          );
        }
        return res.wishlisted;
      } catch (err) {
        console.error("Failed to toggle wishlist:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const isWishlisted = useCallback(
    (productId: number) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  useEffect(() => {
    if (isSignedIn) fetchWishlistIds();
  }, [isSignedIn, fetchWishlistIds]);

  return { wishlistIds, isWishlisted, toggleWishlist, loading, fetchWishlistIds };
}

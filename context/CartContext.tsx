"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import type { CartItem, CartSummary } from "@/types";

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  savings: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCartLocal: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [savings, setSavings] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: CartSummary }>("/cart", token);
      if (res.success && res.data) {
        setItems(res.data.items);
        setCartCount(res.data.itemCount);
        setSubtotal(res.data.subtotal);
        setDiscount(res.data.discount);
        setShippingFee(res.data.shippingFee);
        setTotal(res.data.total);
        setSavings(res.data.savings);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  const addToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
      const token = await getToken();
      const res = await api.post("/cart", { productId, quantity }, token);
      if (res.cartCount !== undefined) setCartCount(res.cartCount);
      await fetchCart();
    },
    [getToken, fetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      const token = await getToken();
      await api.patch(`/cart/${itemId}`, { quantity }, token);
      await fetchCart();
    },
    [getToken, fetchCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      const token = await getToken();
      const res = await api.delete(`/cart/${itemId}`, token);
      if (res.cartCount !== undefined) setCartCount(res.cartCount);
      await fetchCart();
    },
    [getToken, fetchCart]
  );

  const clearCartLocal = useCallback(() => {
    setItems([]);
    setCartCount(0);
    setSubtotal(0);
    setDiscount(0);
    setShippingFee(0);
    setTotal(0);
    setSavings(0);
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchCart();
  }, [isSignedIn, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        items, cartCount, subtotal, discount, shippingFee, total, savings, loading,
        fetchCart, addToCart, updateQuantity, removeItem, clearCartLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

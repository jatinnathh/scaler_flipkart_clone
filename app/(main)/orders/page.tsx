"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: Order[] }>("/orders", token);
      if (res.success) setOrders(res.data);
      setLoading(false);
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="container-fk py-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4"><div className="skeleton w-full h-24" /></div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-fk py-4">
        <div className="card empty-state">
          <FiPackage size={80} className="text-flipkart-text-secondary" />
          <h3 className="text-xl font-semibold mt-4">No orders yet</h3>
          <p>Items you order will show up here.</p>
          <Link href="/" className="btn btn-primary mt-4 no-underline">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4">
      <div className="card">
        <div className="p-4 border-b border-flipkart-border">
          <h1 className="text-lg font-semibold">My Orders</h1>
        </div>
        <div className="divide-y divide-flipkart-border/50">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block p-4 hover:bg-gray-50 transition no-underline">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">Order #{order.order_number}</span>
                  <span className="text-xs text-flipkart-text-secondary ml-3">
                    {new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge" style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] + "20", color: ORDER_STATUS_COLORS[order.status] }}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <FiChevronRight size={16} className="text-flipkart-text-secondary" />
                </div>
              </div>
              {/* Items preview */}
              <div className="flex gap-3 items-center">
                {(order.items || []).slice(0, 3).map((item: any, i: number) => (
                  <img key={i} src={item.product_image || "https://via.placeholder.com/48"} alt="" className="w-12 h-12 object-contain rounded border" />
                ))}
                {(order.items || []).length > 3 && (
                  <span className="text-sm text-flipkart-text-secondary">+{(order.items || []).length - 3} more</span>
                )}
                <div className="ml-auto text-right">
                  <p className="font-semibold">{formatPrice(parseFloat(order.total as any))}</p>
                  <p className="text-xs text-flipkart-text-secondary">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "Paid Online"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

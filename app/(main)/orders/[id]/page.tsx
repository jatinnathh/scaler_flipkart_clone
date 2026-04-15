"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { FiCheck } from "react-icons/fi";
import type { Order } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`, token);
      if (res.success) setOrder(res.data);
      setLoading(false);
    }
    load();
  }, [id, getToken]);

  if (loading) return <div className="container-fk py-4"><div className="skeleton w-full h-[500px] rounded" /></div>;

  if (!order) {
    return (
      <div className="container-fk py-4">
        <div className="card empty-state">
          <h3>Order not found</h3>
          <Link href="/orders" className="btn btn-primary mt-4 no-underline">View All Orders</Link>
        </div>
      </div>
    );
  }

  const timeline = order.timeline || [];
  const now = new Date();

  return (
    <div className="container-fk py-4 space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Order #{order.order_number}</h1>
          <span className="badge text-sm" style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] + "20", color: ORDER_STATUS_COLORS[order.status] }}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <p className="text-sm text-flipkart-text-secondary">
          Placed on {new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          {/* Timeline */}
          <div className="card p-4">
            <h2 className="font-semibold mb-4">Order Tracking</h2>
            <div className="timeline">
              {timeline.map((entry: any, i: number) => {
                const isPast = new Date(entry.timestamp) <= now;
                const isCurrent = isPast && (i === timeline.length - 1 || new Date(timeline[i + 1].timestamp) > now);
                return (
                  <div key={entry.id} className="timeline-item">
                    <div className={`timeline-dot ${isCurrent ? "current" : isPast ? "active" : ""}`} />
                    <div>
                      <p className={`font-semibold text-sm ${isPast ? "text-flipkart-text" : "text-flipkart-text-secondary"}`}>
                        {ORDER_STATUS_LABELS[entry.status] || entry.status}
                      </p>
                      <p className={`text-xs ${isPast ? "text-flipkart-text-secondary" : "text-flipkart-text-secondary/50"}`}>
                        {entry.message}
                      </p>
                      <p className="text-xs text-flipkart-text-secondary mt-0.5">
                        {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="card p-4">
            <h2 className="font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product_image || "https://via.placeholder.com/60"} alt="" className="w-16 h-16 object-contain rounded border" />
                  <div className="flex-1">
                    {item.product_slug ? (
                      <Link href={`/product/${item.product_slug}`} className="text-sm font-medium text-flipkart-text hover:text-flipkart-primary no-underline">
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{item.product_name}</p>
                    )}
                    <p className="text-xs text-flipkart-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(parseFloat(item.total))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery Address */}
          <div className="card p-4">
            <h2 className="font-semibold mb-2">Delivery Address</h2>
            <p className="text-sm font-semibold">{order.shipping_name}</p>
            <p className="text-sm text-flipkart-text-secondary">{order.shipping_address}</p>
            <p className="text-sm text-flipkart-text-secondary">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
            <p className="text-sm text-flipkart-text-secondary mt-1">Phone: {order.shipping_phone}</p>
          </div>

          {/* Price */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-flipkart-text-secondary uppercase mb-3">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(parseFloat(order.subtotal as any))}</span></div>
              <div className="flex justify-between text-flipkart-green"><span>Discount</span><span>−{formatPrice(parseFloat(order.discount as any))}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{parseFloat(order.shipping_fee as any) === 0 ? "FREE" : formatPrice(parseFloat(order.shipping_fee as any))}</span></div>
              <hr className="border-dashed" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(parseFloat(order.total as any))}</span></div>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-flipkart-text-secondary">
              Payment: <span className="font-medium text-flipkart-text">{order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}</span>
              {" • "}
              Status: <span className="font-medium" style={{ color: order.payment_status === "paid" ? "#388E3C" : "#FF9F00" }}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

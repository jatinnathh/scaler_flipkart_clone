"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { formatPrice } from "@/lib/utils";
import { FiArrowLeft, FiCheck, FiUser, FiMapPin, FiCreditCard } from "react-icons/fi";

const STATUS_COLORS: Record<string, string> = {
  placed: "#2874F0", confirmed: "#7C3AED", shipped: "#2563EB",
  out_for_delivery: "#F59E0B", delivered: "#10B981", cancelled: "#EF4444",
};
const STATUS_LABELS: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const STATUS_FLOW = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await adminApi.get(`/orders/${id}`, token);
        if (res.success) setOrder(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      await adminApi.patch(`/orders/${id}/status`, { status: newStatus }, token);
      // Reload order
      const res = await adminApi.get(`/orders/${id}`, token);
      if (res.success) setOrder(res.data);
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="admin-card p-8"><div className="skeleton w-full h-96" /></div>;
  if (!order) return <div className="admin-card p-8 text-center">Order not found</div>;

  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div>
      <button onClick={() => router.back()} className="admin-back-btn mb-4">
        <FiArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header */}
      <div className="admin-card mb-4">
        <div className="admin-order-header">
          <div>
            <h2 className="text-xl font-bold">Order #{order.order_number}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className="admin-status-badge large" style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status] }}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Status Update */}
      {order.status !== "cancelled" && order.status !== "delivered" && (
        <div className="admin-card mb-4">
          <h3 className="admin-card-title">Update Status</h3>
          <div className="admin-status-flow">
            {STATUS_FLOW.map((s, i) => {
              const isCurrent = s === order.status;
              const isPast = i < currentIdx;
              const isNext = i === currentIdx + 1;
              return (
                <button
                  key={s}
                  onClick={() => isNext ? handleStatusUpdate(s) : null}
                  disabled={updating || (!isNext && !isCurrent)}
                  className={`admin-status-step ${isPast ? "done" : isCurrent ? "current" : isNext ? "next" : "future"}`}
                >
                  <div className="admin-status-step-dot">
                    {isPast ? <FiCheck size={12} /> : i + 1}
                  </div>
                  <span>{STATUS_LABELS[s]}</span>
                </button>
              );
            })}
          </div>
          {order.status !== "cancelled" && (
            <button onClick={() => handleStatusUpdate("cancelled")} disabled={updating} className="admin-cancel-btn mt-3">
              Cancel Order
            </button>
          )}
        </div>
      )}

      <div className="admin-grid-2">
        {/* Items */}
        <div className="admin-card">
          <h3 className="admin-card-title">Items ({order.items?.length || 0})</h3>
          <div className="admin-order-items">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="admin-order-item">
                <img src={item.product_image || "https://via.placeholder.com/60"} alt="" className="admin-order-item-img" />
                <div className="admin-order-item-info">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(parseFloat(item.price))}</p>
                </div>
                <span className="font-semibold">{formatPrice(parseFloat(item.total))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="admin-card">
            <h3 className="admin-card-title"><FiUser size={16} /> Customer</h3>
            <div className="admin-detail-row">
              <span>Name</span>
              <span>{order.first_name} {order.last_name}</span>
            </div>
            <div className="admin-detail-row">
              <span>Email</span>
              <span>{order.email}</span>
            </div>
            {order.user_phone && (
              <div className="admin-detail-row">
                <span>Phone</span>
                <span>{order.user_phone}</span>
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="admin-card">
            <h3 className="admin-card-title"><FiMapPin size={16} /> Shipping</h3>
            <div className="text-sm space-y-1 p-4">
              <p className="font-semibold">{order.shipping_name}</p>
              <p className="text-gray-500">{order.shipping_address}</p>
              <p className="text-gray-500">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
              <p className="text-gray-500">Phone: {order.shipping_phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="admin-card">
            <h3 className="admin-card-title"><FiCreditCard size={16} /> Payment</h3>
            <div className="admin-detail-row">
              <span>Method</span>
              <span>{order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}</span>
            </div>
            <div className="admin-detail-row">
              <span>Status</span>
              <span className={`font-semibold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
            <div className="admin-detail-row">
              <span>Subtotal</span>
              <span>{formatPrice(parseFloat(order.subtotal))}</span>
            </div>
            <div className="admin-detail-row">
              <span>Discount</span>
              <span className="text-green-600">-{formatPrice(parseFloat(order.discount))}</span>
            </div>
            <div className="admin-detail-row">
              <span>Shipping</span>
              <span>{parseFloat(order.shipping_fee) === 0 ? "FREE" : formatPrice(parseFloat(order.shipping_fee))}</span>
            </div>
            <div className="admin-detail-row total">
              <span>Total</span>
              <span>{formatPrice(parseFloat(order.total))}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="admin-card">
              <h3 className="admin-card-title">Timeline</h3>
              <div className="admin-timeline">
                {order.timeline.map((entry: any) => (
                  <div key={entry.id} className="admin-timeline-item">
                    <div className="admin-timeline-dot" />
                    <div>
                      <p className="text-sm font-medium">{STATUS_LABELS[entry.status] || entry.status}</p>
                      <p className="text-xs text-gray-500">{entry.message}</p>
                      <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

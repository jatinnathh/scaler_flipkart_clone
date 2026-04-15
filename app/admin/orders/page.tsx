"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { formatPrice } from "@/lib/utils";
import { FiSearch, FiFilter, FiEye } from "react-icons/fi";

const STATUS_COLORS: Record<string, string> = {
  placed: "#2874F0", confirmed: "#7C3AED", shipped: "#2563EB",
  out_for_delivery: "#F59E0B", delivered: "#10B981", cancelled: "#EF4444",
};
const STATUS_LABELS: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const PAYMENT_LABELS: Record<string, string> = { razorpay: "Razorpay", cod: "COD" };

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await adminApi.get(`/orders?${params.toString()}`, token);
      if (res.success) {
        setOrders(res.data.orders);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadOrders(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  return (
    <div>
      {/* Filters */}
      <div className="admin-card mb-4">
        <div className="admin-filters">
          <form onSubmit={handleSearch} className="admin-search-form">
            <FiSearch size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by order #, email, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
          </form>
          <div className="admin-filter-group">
            <FiFilter size={14} />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="admin-select"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <span className="admin-filter-count">{total} orders</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="skeleton w-full h-5" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.order_number}</td>
                    <td>
                      <div>{order.first_name} {order.last_name}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </td>
                    <td className="text-sm">{new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>{order.item_count}</td>
                    <td className="font-semibold">{formatPrice(parseFloat(order.total))}</td>
                    <td>
                      <span className={`admin-payment-badge ${order.payment_status}`}>
                        {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                        {order.payment_status === "paid" && " ✓"}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge" style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status] }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="admin-action-btn" title="View">
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="admin-page-btn">Previous</button>
            <span className="admin-page-info">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="admin-page-btn primary">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

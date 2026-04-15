"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { formatPrice } from "@/lib/utils";
import {
  FiDollarSign, FiPackage, FiUsers, FiShoppingBag,
  FiAlertTriangle, FiTrendingUp, FiArrowRight
} from "react-icons/fi";

interface DashboardData {
  stats: {
    revenue: { total_revenue: string; paid_revenue: string; cod_revenue: string };
    orders: { total_orders: string; placed: string; confirmed: string; shipped: string; out_for_delivery: string; delivered: string; cancelled: string };
    users: { total_users: string };
    products: { total_products: string; active_products: string; out_of_stock: string; low_stock: string };
  };
  revenueOverTime: { date: string; order_count: string; revenue: string }[];
  topSelling: { id: number; name: string; slug: string; price: string; brand: string; total_sold: string; total_revenue: string; image: string }[];
  lowStock: { id: number; name: string; slug: string; brand: string; stock_quantity: number; price: string }[];
  recentOrders: { id: string; order_number: string; email: string; first_name: string; last_name: string; total: string; status: string; payment_method: string; payment_status: string; placed_at: string; item_count: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  placed: "#2874F0",
  confirmed: "#7C3AED",
  shipped: "#2563EB",
  out_for_delivery: "#F59E0B",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) { router.replace("/admin/login"); return; }
        const res = await adminApi.get<{ success: boolean; data: DashboardData }>("/dashboard", token);
        if (res.success) setData(res.data);
      } catch (err: any) {
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          localStorage.removeItem("admin_token");
          router.replace("/admin/login");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading || !data) {
    return (
      <div className="admin-grid-4">
        {[1,2,3,4].map(i => <div key={i} className="admin-card admin-stat-card"><div className="skeleton w-full h-24" /></div>)}
      </div>
    );
  }

  const { stats, revenueOverTime, topSelling, lowStock, recentOrders } = data;
  const maxRevenue = Math.max(...revenueOverTime.map(r => parseFloat(r.revenue)), 1);

  return (
    <div className="admin-dashboard">
      {/* Stat Cards */}
      <div className="admin-grid-4">
        <div className="admin-card admin-stat-card stat-revenue">
          <div className="stat-icon"><FiDollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatPrice(parseFloat(stats.revenue.total_revenue))}</span>
            <span className="stat-sub">Paid: {formatPrice(parseFloat(stats.revenue.paid_revenue))}</span>
          </div>
        </div>
        <div className="admin-card admin-stat-card stat-orders">
          <div className="stat-icon"><FiPackage size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.orders.total_orders}</span>
            <span className="stat-sub">{stats.orders.delivered} delivered</span>
          </div>
        </div>
        <div className="admin-card admin-stat-card stat-users">
          <div className="stat-icon"><FiUsers size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.users.total_users}</span>
            <span className="stat-sub">Registered customers</span>
          </div>
        </div>
        <div className="admin-card admin-stat-card stat-products">
          <div className="stat-icon"><FiShoppingBag size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats.products.total_products}</span>
            <span className="stat-sub">{stats.products.active_products} active</span>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="admin-card">
        <h3 className="admin-card-title">Order Status Distribution</h3>
        <div className="order-status-bars">
          {(["placed", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const).map(status => {
            const count = parseInt((stats.orders as any)[status] || "0");
            const total = parseInt(stats.orders.total_orders) || 1;
            const pct = (count / total) * 100;
            return (
              <div key={status} className="order-status-bar-item">
                <div className="order-status-bar-label">
                  <span className="order-status-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="order-status-count">{count}</span>
                </div>
                <div className="order-status-bar-track">
                  <div className="order-status-bar-fill" style={{ width: `${pct}%`, background: STATUS_COLORS[status] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueOverTime.length > 0 && (
        <div className="admin-card">
          <h3 className="admin-card-title">
            <FiTrendingUp size={18} /> Revenue — Last 30 Days
          </h3>
          <div className="admin-chart">
            <div className="admin-chart-bars">
              {revenueOverTime.map((day, i) => {
                const height = (parseFloat(day.revenue) / maxRevenue) * 100;
                return (
                  <div key={i} className="admin-chart-bar-wrapper" title={`${day.date}: ${formatPrice(parseFloat(day.revenue))} (${day.order_count} orders)`}>
                    <div className="admin-chart-bar" style={{ height: `${Math.max(height, 4)}%` }}>
                      <span className="admin-chart-tooltip">
                        {formatPrice(parseFloat(day.revenue))}
                      </span>
                    </div>
                    <span className="admin-chart-label">
                      {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Orders</h3>
            <Link href="/admin/orders" className="admin-link">View All <FiArrowRight size={14} /></Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="cursor-pointer">
                    <td className="font-medium">{order.order_number}</td>
                    <td>{order.first_name || order.email}</td>
                    <td>{formatPrice(parseFloat(order.total))}</td>
                    <td>
                      <span className="admin-status-badge" style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status] }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock + Top Selling */}
        <div className="space-y-4">
          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div className="admin-card">
              <h3 className="admin-card-title admin-card-title-warning">
                <FiAlertTriangle size={18} /> Low Stock Alerts
              </h3>
              <div className="admin-list">
                {lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="admin-list-item">
                    <div>
                      <p className="admin-list-title">{p.name}</p>
                      <p className="admin-list-sub">{p.brand || "—"}</p>
                    </div>
                    <span className={`admin-stock-badge ${p.stock_quantity <= 0 ? "out" : "low"}`}>
                      {p.stock_quantity <= 0 ? "Out of Stock" : `${p.stock_quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Selling */}
          {topSelling.length > 0 && (
            <div className="admin-card">
              <h3 className="admin-card-title">🏆 Top Selling Products</h3>
              <div className="admin-list">
                {topSelling.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="admin-list-item">
                    <div className="admin-list-rank">{i + 1}</div>
                    {p.image && <img src={p.image} alt="" className="admin-list-img" />}
                    <div>
                      <p className="admin-list-title">{p.name}</p>
                      <p className="admin-list-sub">{p.total_sold} sold • {formatPrice(parseFloat(p.total_revenue))}</p>
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

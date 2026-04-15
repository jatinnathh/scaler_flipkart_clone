"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { formatPrice } from "@/lib/utils";
import { FiTrendingUp, FiPieChart, FiUsers, FiDollarSign } from "react-icons/fi";

interface AnalyticsData {
  revenueByCategory: { category: string; revenue: string; orders: string }[];
  topCustomers: { id: string; email: string; first_name: string; last_name: string; total_orders: string; total_spent: string }[];
  paymentMethods: { payment_method: string; count: string; revenue: string }[];
  avgOrderValue: number;
  ordersOverTime: { date: string; orders: string; revenue: string }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await adminApi.get<{ success: boolean; data: AnalyticsData }>("/analytics", token);
        if (res.success) setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="admin-grid-2">
        {[1,2,3,4].map(i => <div key={i} className="admin-card"><div className="skeleton w-full h-64" /></div>)}
      </div>
    );
  }

  const maxCatRevenue = Math.max(...data.revenueByCategory.map(r => parseFloat(r.revenue)), 1);
  const maxDayRevenue = Math.max(...data.ordersOverTime.map(r => parseFloat(r.revenue)), 1);
  const totalPaymentRevenue = data.paymentMethods.reduce((s, p) => s + parseFloat(p.revenue), 0) || 1;

  return (
    <div className="space-y-4">
      {/* Average Order Value */}
      <div className="admin-card admin-stat-card stat-revenue" style={{ maxWidth: 320 }}>
        <div className="stat-icon"><FiDollarSign size={24} /></div>
        <div className="stat-info">
          <span className="stat-label">Average Order Value</span>
          <span className="stat-value">{formatPrice(data.avgOrderValue)}</span>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Revenue by Category */}
        <div className="admin-card">
          <h3 className="admin-card-title"><FiPieChart size={16} /> Revenue by Category</h3>
          <div className="admin-bar-list">
            {data.revenueByCategory.map((cat, i) => {
              const pct = (parseFloat(cat.revenue) / maxCatRevenue) * 100;
              const colors = ["#2874F0", "#10B981", "#F59E0B", "#EF4444", "#7C3AED", "#EC4899", "#06B6D4", "#84CC16"];
              return (
                <div key={i} className="admin-bar-item">
                  <div className="admin-bar-header">
                    <span className="admin-bar-label">{cat.category || "Uncategorized"}</span>
                    <span className="admin-bar-value">{formatPrice(parseFloat(cat.revenue))} ({cat.orders} orders)</span>
                  </div>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                </div>
              );
            })}
            {data.revenueByCategory.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">No data yet</p>
            )}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="admin-card">
          <h3 className="admin-card-title"><FiPieChart size={16} /> Payment Methods</h3>
          <div className="admin-payment-dist">
            {data.paymentMethods.map(pm => {
              const pct = (parseFloat(pm.revenue) / totalPaymentRevenue) * 100;
              const color = pm.payment_method === "razorpay" ? "#2874F0" : "#F59E0B";
              return (
                <div key={pm.payment_method} className="admin-payment-item">
                  <div className="admin-payment-visual">
                    <div className="admin-payment-circle" style={{ background: `conic-gradient(${color} ${pct}%, #e5e7eb ${pct}%)` }}>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{pm.payment_method === "razorpay" ? "Razorpay" : "Cash on Delivery"}</p>
                    <p className="text-sm text-gray-500">{pm.count} orders • {formatPrice(parseFloat(pm.revenue))}</p>
                  </div>
                </div>
              );
            })}
            {data.paymentMethods.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Orders Over Time Chart */}
      {data.ordersOverTime.length > 0 && (
        <div className="admin-card">
          <h3 className="admin-card-title"><FiTrendingUp size={16} /> Daily Orders — Last 30 Days</h3>
          <div className="admin-chart">
            <div className="admin-chart-bars">
              {data.ordersOverTime.map((day, i) => {
                const height = (parseFloat(day.revenue) / maxDayRevenue) * 100;
                return (
                  <div key={i} className="admin-chart-bar-wrapper" title={`${day.date}: ${day.orders} orders, ${formatPrice(parseFloat(day.revenue))}`}>
                    <div className="admin-chart-bar green" style={{ height: `${Math.max(height, 4)}%` }}>
                      <span className="admin-chart-tooltip">{day.orders} orders</span>
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

      {/* Top Customers */}
      <div className="admin-card">
        <h3 className="admin-card-title"><FiUsers size={16} /> Top Customers</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((cust, i) => (
                <tr key={cust.id}>
                  <td className="font-bold text-gray-400">{i + 1}</td>
                  <td>
                    <div>{cust.first_name} {cust.last_name}</div>
                    <div className="text-xs text-gray-500">{cust.email}</div>
                  </td>
                  <td>{cust.total_orders}</td>
                  <td className="font-semibold">{formatPrice(parseFloat(cust.total_spent))}</td>
                </tr>
              ))}
              {data.topCustomers.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiShield, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", data.data.token);
      router.push("/admin");
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Left Panel */}
        <div className="admin-login-left">
          <div className="admin-login-brand">
            <FiShield size={48} />
            <h1>Flipkart Admin</h1>
            <p>Manage your store, orders, and analytics from one powerful dashboard.</p>
          </div>
          <div className="admin-login-features">
            <div className="admin-login-feature">
              <span className="feature-icon">📊</span>
              <span>Real-time Analytics</span>
            </div>
            <div className="admin-login-feature">
              <span className="feature-icon">📦</span>
              <span>Order Management</span>
            </div>
            <div className="admin-login-feature">
              <span className="feature-icon">🛍️</span>
              <span>Product Control</span>
            </div>
            <div className="admin-login-feature">
              <span className="feature-icon">📧</span>
              <span>Email Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="admin-login-right">
          <form onSubmit={handleSubmit} className="admin-login-form">
            <h2>Admin Login</h2>
            <p className="admin-login-subtitle">Enter your credentials to access the dashboard</p>

            {error && (
              <div className="admin-alert admin-alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="admin-form-group">
              <label>Email</label>
              <div className="admin-input-wrapper">
                <FiMail className="admin-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <div className="admin-input-wrapper">
                <FiLock className="admin-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-input-toggle"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="admin-login-btn">
              {loading ? (
                <span className="admin-spinner" />
              ) : (
                <>
                  <FiLock size={16} /> Sign In
                </>
              )}
            </button>

            <p className="admin-login-hint">
              Demo: admin@gmail.com / admin123
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

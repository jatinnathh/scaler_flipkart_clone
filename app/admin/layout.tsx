"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiGrid, FiPackage, FiShoppingBag, FiPlusCircle,
  FiMail, FiBarChart2, FiArrowLeft, FiLogOut, FiMenu, FiX, FiShield
} from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/orders", label: "Orders", icon: FiPackage },
  { href: "/admin/products", label: "Products", icon: FiShoppingBag },
  { href: "/admin/products/new", label: "Add Product", icon: FiPlusCircle },
  { href: "/admin/emails", label: "Email Logs", icon: FiMail },
  { href: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (!saved && pathname !== "/admin/login") {
      router.replace("/admin/login");
    } else {
      setToken(saved);
    }
    setLoading(false);
  }, [pathname, router]);

  // Login page — render without admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner-lg" />
      </div>
    );
  }

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <FiShield size={24} />
            <span>Flipkart Admin</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>
            <FiArrowLeft size={18} />
            <span>Back to Store</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-item admin-logout-btn">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="admin-header-title">
            {NAV_ITEMS.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Admin"}
          </h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

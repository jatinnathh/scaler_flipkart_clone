"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { FiShoppingCart, FiHeart, FiPackage, FiMenu, FiMoon, FiSun, FiShield } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <nav className="navbar">
      <div className="container-fk">
        <div className="flex items-center gap-4 py-2.5">
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col items-center shrink-0 no-underline"
          >
            <span className="text-xl font-bold text-white italic tracking-tight">
              Flipkart
            </span>
            <span className="text-[10px] text-yellow-300 italic -mt-0.5 flex items-center gap-0.5">
              Explore <span className="text-yellow-400 font-bold">Plus</span>
              <img
                src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/header/imgPlus-09a43b.svg"
                alt=""
                className="w-2.5 h-2.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-[580px] hidden sm:block">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Auth */}
            {!isSignedIn ? (
              <Link
                href="/sign-in"
                className="btn btn-sm bg-white text-flipkart-primary font-semibold hover:bg-gray-100 no-underline"
              >
                Login
              </Link>
            ) : (
              <UserButton />
            )}

            {/* Orders */}
            {isSignedIn && (
              <button
                onClick={() => router.push("/orders")}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-white text-sm font-medium hover:bg-white/10 rounded transition"
              >
                <FiPackage size={18} />
                <span>Orders</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => router.push("/wishlist")}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-white text-sm font-medium hover:bg-white/10 rounded transition"
            >
              <FiHeart size={18} />
            </button>

            {/* Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="relative flex items-center gap-1.5 px-3 py-2 text-white text-sm font-medium hover:bg-white/10 rounded transition"
            >
              <FiShoppingCart size={20} />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-flipkart-yellow text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard */}
            <button
              onClick={() => router.push("/admin/login")}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-white text-sm font-medium hover:bg-white/10 rounded transition"
              title="Admin Dashboard"
            >
              <FiShield size={18} />
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDark}
              className="p-2 text-white hover:bg-white/10 rounded transition"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-white sm:hidden"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-2">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-flipkart-border shadow-lg">
          {isSignedIn && (
            <>
              <Link href="/orders" className="block px-4 py-3 text-flipkart-text hover:bg-gray-50 border-b border-gray-100 no-underline" onClick={() => setMenuOpen(false)}>
                <FiPackage className="inline mr-2" /> My Orders
              </Link>
              <Link href="/wishlist" className="block px-4 py-3 text-flipkart-text hover:bg-gray-50 border-b border-gray-100 no-underline" onClick={() => setMenuOpen(false)}>
                <FiHeart className="inline mr-2" /> Wishlist
              </Link>
              <Link href="/account" className="block px-4 py-3 text-flipkart-text hover:bg-gray-50 border-b border-gray-100 no-underline" onClick={() => setMenuOpen(false)}>
                My Account
              </Link>
              <Link href="/admin/login" className="block px-4 py-3 text-flipkart-text hover:bg-gray-50 no-underline" onClick={() => setMenuOpen(false)}>
                <FiShield className="inline mr-2" /> Admin Dashboard
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

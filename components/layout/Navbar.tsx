"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { FiShoppingCart, FiHeart, FiPackage, FiMenu, FiMoon, FiSun, FiShield, FiChevronDown, FiMoreHorizontal } from "react-icons/fi";
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
          {/* Logo - New Flipkart Style */}
          <Link href="/" className="fk-logo-pill shrink-0">
            <span className="fk-logo-f">f</span>
            Flipkart
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-[580px] hidden sm:block">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 ml-auto">
            {/* Auth */}
            {!isSignedIn ? (
              <Link href="/sign-in" className="nav-action">
                Login
                <FiChevronDown size={14} />
              </Link>
            ) : (
              <div className="nav-action">
                <UserButton />
              </div>
            )}

            {/* Orders */}
            {isSignedIn && (
              <button
                onClick={() => router.push("/orders")}
                className="nav-action hidden md:flex"
              >
                <FiPackage size={18} />
                <span>Orders</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => router.push("/wishlist")}
              className="nav-action hidden md:flex"
            >
              <FiHeart size={18} />
            </button>

            {/* Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="nav-action relative"
            >
              <FiShoppingCart size={20} />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 left-5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard */}
            <button
              onClick={() => router.push("/admin/login")}
              className="nav-action hidden md:flex"
              title="Admin Dashboard"
            >
              <FiShield size={18} />
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDark}
              className="nav-action"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="nav-action sm:hidden"
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
        <div className="sm:hidden fk-surface border-t fk-border shadow-lg">
          {isSignedIn && (
            <>
              <Link href="/orders" className="block px-4 py-3 fk-text hover:bg-black/5 dark:hover:bg-white/5 border-b fk-border no-underline" onClick={() => setMenuOpen(false)}>
                <FiPackage className="inline mr-2" /> My Orders
              </Link>
              <Link href="/wishlist" className="block px-4 py-3 fk-text hover:bg-black/5 dark:hover:bg-white/5 border-b fk-border no-underline" onClick={() => setMenuOpen(false)}>
                <FiHeart className="inline mr-2" /> Wishlist
              </Link>
              <Link href="/account" className="block px-4 py-3 fk-text hover:bg-black/5 dark:hover:bg-white/5 border-b fk-border no-underline" onClick={() => setMenuOpen(false)}>
                My Account
              </Link>
              <Link href="/admin/login" className="block px-4 py-3 fk-text hover:bg-black/5 dark:hover:bg-white/5 no-underline" onClick={() => setMenuOpen(false)}>
                <FiShield className="inline mr-2" /> Admin Dashboard
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: FiHome, label: "Home" },
  { href: "/search", icon: FiGrid, label: "Categories" },
  { href: "/cart", icon: FiShoppingCart, label: "Cart", showBadge: true },
  { href: "/wishlist", icon: FiHeart, label: "Wishlist" },
  { href: "/account", icon: FiUser, label: "Account" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  return (
    <div className="mobile-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("mobile-nav-item no-underline", isActive && "active")}
          >
            <div className="relative">
              <Icon />
              {item.showBadge && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-flipkart-yellow text-white text-[9px] font-bold min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-0.5">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

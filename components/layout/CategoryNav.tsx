"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/types";
import {
  FiStar, FiMonitor, FiSmartphone, FiShoppingBag,
  FiHeart, FiHome, FiBook
} from "react-icons/fi";
import { MdSportsCricket, MdFace } from "react-icons/md";

const iconMap: Record<string, any> = {
  electronics: FiMonitor,
  mobiles: FiSmartphone,
  "fashion-men": FiShoppingBag,
  "fashion-women": FiHeart,
  "home-kitchen": FiHome,
  books: FiBook,
  sports: MdSportsCricket,
  beauty: MdFace,
};

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Category[] }>("/categories?flat=true")
      .then((res) => {
        if (res.success) {
          setCategories(res.data.filter((c) => !c.parent_id));
        }
      })
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="category-strip">
      <div className="container-fk">
        <div className="flex">
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug] || FiStar;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="category-item no-underline"
              >
                <div className="cat-icon">
                  <Icon size={24} />
                </div>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

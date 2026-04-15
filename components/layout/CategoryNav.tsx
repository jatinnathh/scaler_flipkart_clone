"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Category[] }>("/categories?flat=true")
      .then((res) => {
        if (res.success) {
          // Only show top-level categories (parent_id is null)
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
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="category-item no-underline"
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/56?text=" + cat.name.charAt(0);
                  }}
                />
              ) : (
                <div className="w-14 h-14 bg-flipkart-primary-light rounded-full flex items-center justify-center text-flipkart-primary text-xl font-bold">
                  {cat.name.charAt(0)}
                </div>
              )}
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

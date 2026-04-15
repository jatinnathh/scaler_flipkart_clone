"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories/${slug}`),
          api.get(`/products?category=${slug}&limit=40`),
        ]);
        if (catRes.success) setCategory(catRes.data);
        if (prodRes.success) setProducts(prodRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-fk py-4">
        <div className="skeleton w-48 h-8 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton w-full aspect-square mb-3" />
              <div className="skeleton w-full h-4 mb-2" />
              <div className="skeleton w-1/2 h-5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4">
      {/* Breadcrumb */}
      <div className="breadcrumb mb-4">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-flipkart-text font-medium">{category?.name || slug}</span>
      </div>

      <div className="card p-4 mb-4">
        <h1 className="text-2xl font-bold">{category?.name || slug}</h1>
        <p className="text-sm text-flipkart-text-secondary mt-1">
          Showing {products.length} products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products in this category</h3>
          <p>Check back later for new arrivals!</p>
          <Link href="/" className="btn btn-primary mt-4">
            Go to Homepage
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={parseFloat(product.price)}
              mrp={parseFloat(product.mrp)}
              discount_percent={product.discount_percent}
              primary_image={product.primary_image}
              avg_rating={parseFloat(product.avg_rating || "0")}
              total_ratings={product.total_ratings || 0}
              brand={product.brand}
              stock_quantity={product.stock_quantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}

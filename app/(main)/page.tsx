"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { BANNER_IMAGES } from "@/lib/constants";
import type { Category, Product } from "@/types";

// ---- Hero Banner Carousel ----
function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[180px] sm:h-[280px] md:h-[340px] overflow-hidden rounded-lg">
      {BANNER_IMAGES.map((img, i) => (
        <Link
          key={i}
          href={img.link}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={img.url}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <p className="text-lg sm:text-2xl font-bold drop-shadow-lg">{img.alt}</p>
          </div>
        </Link>
      ))}
      {/* Controls */}
      <button
        onClick={() => setCurrent((current - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={() => setCurrent((current + 1) % BANNER_IMAGES.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
      >
        <FiChevronRight size={20} />
      </button>
      {/* Dots */}
      <div className="absolute bottom-3 right-6 flex gap-2 z-10">
        {BANNER_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Category Cards ----
function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-flipkart-text">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-flipkart-primary-light transition no-underline group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shadow-sm">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-flipkart-primary bg-flipkart-primary-light">
                  {cat.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-flipkart-text text-center leading-tight group-hover:text-flipkart-primary">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---- Product Carousel ----
function ProductCarousel({ title, products, viewAllLink }: {
  title: string;
  products: Product[];
  viewAllLink?: string;
}) {
  const scrollRef = useState<HTMLDivElement | null>(null);

  if (products.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-flipkart-text">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="btn btn-primary btn-sm no-underline flex items-center gap-1"
          >
            View All <FiArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product: any) => (
          <div key={product.id} className="min-w-[180px] max-w-[200px] snap-start flex-shrink-0">
            <ProductCard
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Deal of the Day ----
function DealOfTheDay({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-flipkart-yellow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-flipkart-text">🔥 Deal of the Day</h2>
          <p className="text-sm text-flipkart-text-secondary">Minimum 40% Off</p>
        </div>
        <Link href="/search?sortBy=discount" className="btn btn-primary btn-sm no-underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products.slice(0, 5).map((product: any) => (
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
    </div>
  );
}

// ---- Homepage ----
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [electronics, setElectronics] = useState<Product[]>([]);
  const [fashion, setFashion] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepage() {
      try {
        const [catRes, dealsRes, newRes, ratedRes, elecRes, fashRes] = await Promise.all([
          api.get("/categories?flat=true"),
          api.get("/products?sortBy=discount&limit=10"),
          api.get("/products?sortBy=newest&limit=10"),
          api.get("/products?sortBy=rating&limit=10"),
          api.get("/products?category=electronics&limit=10"),
          api.get("/products?category=fashion-men&limit=10"),
        ]);

        if (catRes.success) setCategories(catRes.data.filter((c: Category) => !c.parent_id));
        if (dealsRes.success) setTopDeals(dealsRes.data.products);
        if (newRes.success) setNewArrivals(newRes.data.products);
        if (ratedRes.success) setTopRated(ratedRes.data.products);
        if (elecRes.success) setElectronics(elecRes.data.products);
        if (fashRes.success) setFashion(fashRes.data.products);
      } catch (err) {
        console.error("Failed to load homepage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepage();
  }, []);

  if (loading) {
    return (
      <div className="container-fk py-4 space-y-4">
        {/* Skeleton Banner */}
        <div className="skeleton w-full h-[280px] rounded-lg" />
        {/* Skeleton Category Strip */}
        <div className="card p-4">
          <div className="skeleton w-48 h-6 mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="skeleton w-16 h-16 rounded-full" />
                <div className="skeleton w-14 h-3" />
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Products */}
        <div className="card p-4">
          <div className="skeleton w-48 h-6 mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[180px]">
                <div className="skeleton w-full h-[180px] mb-3" />
                <div className="skeleton w-full h-4 mb-2" />
                <div className="skeleton w-2/3 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4 space-y-4">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories */}
      <CategoryCards categories={categories} />

      {/* Deal of the Day */}
      <DealOfTheDay products={topDeals} />

      {/* Top Rated */}
      <ProductCarousel
        title="⭐ Top Rated Products"
        products={topRated}
        viewAllLink="/search?sortBy=rating"
      />

      {/* Electronics */}
      <ProductCarousel
        title="💻 Best of Electronics"
        products={electronics}
        viewAllLink="/category/electronics"
      />

      {/* Fashion */}
      <ProductCarousel
        title="👔 Fashion Top Picks"
        products={fashion}
        viewAllLink="/category/fashion-men"
      />

      {/* New Arrivals */}
      <ProductCarousel
        title="🆕 New Arrivals"
        products={newArrivals}
        viewAllLink="/search?sortBy=newest"
      />
    </div>
  );
}

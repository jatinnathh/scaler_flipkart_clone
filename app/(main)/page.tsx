"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { BANNER_IMAGES } from "@/lib/constants";
import type { Category, Product } from "@/types";

// ---- Multi-Card Banner Carousel ----
function BannerCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <div ref={scrollRef} className="banner-carousel">
        {BANNER_IMAGES.map((img, i) => (
          <Link key={i} href={img.link} className="banner-card no-underline">
            <img
              src={img.url}
              alt={img.alt}
              loading={i < 3 ? "eager" : "lazy"}
            />
            <div className="banner-overlay">
              <h3>{img.alt}</h3>
              <p>{img.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
      {/* Navigation buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
      >
        <FiChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

// ---- Product Carousel Section ----
function ProductSection({ title, products, viewAllLink, bgColor }: {
  title: string;
  products: Product[];
  viewAllLink?: string;
  bgColor?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="section-strip" style={bgColor ? { background: bgColor } : undefined}>
      <div className="section-header">
        <h2>{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="section-link no-underline">
            View All <FiArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="relative">
        <div ref={scrollRef} className="product-scroll">
          {products.map((product: any) => (
            <div key={product.id} className="product-scroll-item">
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
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
        >
          <FiChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition z-10"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ---- Deal of the Day (Grid Style) ----
function DealOfTheDay({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="section-strip">
      <div className="section-header">
        <div>
          <h2>Deal of the Day</h2>
          <p className="text-sm text-flipkart-text-secondary mt-0.5">Minimum 40% Off</p>
        </div>
        <Link href="/search?sortBy=discount" className="section-link no-underline">
          View All <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 px-5 pb-4">
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

// ---- Suggested For You (Grid Layout like new Flipkart) ----
function SuggestedForYou({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="section-strip">
      <div className="section-header">
        <h2>Suggested For You</h2>
        <Link href="/search?sortBy=newest" className="section-link no-underline">
          View All <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-5 pb-4">
        {products.slice(0, 10).map((product: any) => (
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
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [beautyProducts, setBeautyProducts] = useState<Product[]>([]);
  const [sportsProducts, setSportsProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepage() {
      try {
        const [catRes, dealsRes, newRes, ratedRes, elecRes, fashRes, homeRes, beautyRes, sportsRes] = await Promise.all([
          api.get("/categories?flat=true"),
          api.get("/products?sortBy=discount&limit=10"),
          api.get("/products?sortBy=newest&limit=10"),
          api.get("/products?sortBy=rating&limit=10"),
          api.get("/products?category=electronics&limit=10"),
          api.get("/products?category=fashion-men&limit=10"),
          api.get("/products?category=home-kitchen&limit=10"),
          api.get("/products?category=beauty&limit=10"),
          api.get("/products?category=sports&limit=10"),
        ]);

        if (catRes.success) setCategories(catRes.data.filter((c: Category) => !c.parent_id));
        if (dealsRes.success) setTopDeals(dealsRes.data.products);
        if (newRes.success) setNewArrivals(newRes.data.products);
        if (ratedRes.success) setTopRated(ratedRes.data.products);
        if (elecRes.success) setElectronics(elecRes.data.products);
        if (fashRes.success) setFashion(fashRes.data.products);
        if (homeRes.success) setHomeProducts(homeRes.data.products);
        if (beautyRes.success) setBeautyProducts(beautyRes.data.products);
        if (sportsRes.success) setSportsProducts(sportsRes.data.products);
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
      <div className="container-fk py-4 space-y-3">
        {/* Skeleton Banners */}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton min-w-[380px] h-[200px] rounded-xl" />
          ))}
        </div>
        {/* Skeleton Products */}
        <div className="section-strip">
          <div className="px-5 pb-4">
            <div className="skeleton w-48 h-6 mb-4" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[170px]">
                  <div className="skeleton w-full h-[170px] mb-3 rounded-lg" />
                  <div className="skeleton w-full h-4 mb-2" />
                  <div className="skeleton w-2/3 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-3 space-y-3">
      {/* Multi-Card Banner Carousel */}
      <BannerCarousel />

      {/* Deal of the Day */}
      <DealOfTheDay products={topDeals} />

      {/* Trending Now - Top Rated */}
      <ProductSection
        title="Trending Now"
        products={topRated}
        viewAllLink="/search?sortBy=rating"
      />

      {/* Suggested For You */}
      <SuggestedForYou products={newArrivals} />

      {/* Best of Electronics */}
      <ProductSection
        title="Best of Electronics"
        products={electronics}
        viewAllLink="/category/electronics"
      />

      {/* Fashion Top Picks */}
      <ProductSection
        title="Fashion Top Picks"
        products={fashion}
        viewAllLink="/category/fashion-men"
      />

      {/* Home & Kitchen */}
      <ProductSection
        title="Home & Kitchen Essentials"
        products={homeProducts}
        viewAllLink="/category/home-kitchen"
      />

      {/* Beauty & Personal Care */}
      <ProductSection
        title="Beauty & Personal Care"
        products={beautyProducts}
        viewAllLink="/category/beauty"
      />

      {/* Sports & Fitness */}
      <ProductSection
        title="Sports & Fitness"
        products={sportsProducts}
        viewAllLink="/category/sports"
      />

      {/* New Arrivals - Horizontal Scroll */}
      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        viewAllLink="/search?sortBy=newest"
      />
    </div>
  );
}

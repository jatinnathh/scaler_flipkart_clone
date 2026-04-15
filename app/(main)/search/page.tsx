"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { SORT_OPTIONS } from "@/lib/constants";
import { FiFilter, FiX } from "react-icons/fi";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (brand) params.set("brand", brand);
        if (sortBy) params.set("sortBy", sortBy);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        params.set("page", page.toString());
        params.set("limit", "20");

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }

        // Load brands for filter
        const brandParams = category ? `?category=${category}` : "";
        const brandRes = await api.get(`/products/brands${brandParams}`);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, category, brand, sortBy, page, minPrice, maxPrice]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container-fk py-4">
      <div className="flex gap-4">
        {/* Filters Sidebar */}
        <aside className={`w-64 shrink-0 ${showFilters ? "fixed inset-0 z-50 bg-white p-4 overflow-y-auto" : "hidden md:block"}`}>
          <div className="card p-4 space-y-6 sticky top-28">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Filters</h3>
              <button className="md:hidden" onClick={() => setShowFilters(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Sort */}
            <div>
              <h4 className="font-semibold text-sm text-flipkart-text-secondary mb-2">Sort By</h4>
              <div className="space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={sortBy === opt.value}
                      onChange={() => updateParam("sortBy", opt.value)}
                      className="accent-flipkart-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-flipkart-text-secondary mb-2">Brand</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                    <input
                      type="radio"
                      name="brand"
                      checked={!brand}
                      onChange={() => updateParam("brand", "")}
                      className="accent-flipkart-primary"
                    />
                    All Brands
                  </label>
                  {brands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                      <input
                        type="radio"
                        name="brand"
                        checked={brand === b}
                        onChange={() => updateParam("brand", b)}
                        className="accent-flipkart-primary"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-sm text-flipkart-text-secondary mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam("minPrice", e.target.value)}
                  className="input text-sm w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam("maxPrice", e.target.value)}
                  className="input text-sm w-full"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Header */}
          <div className="card p-3 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">
                {search ? `Results for "${search}"` : category ? `Category: ${category}` : "All Products"}
              </h1>
              <p className="text-sm text-flipkart-text-secondary">
                {total.toLocaleString()} products found
              </p>
            </div>
            <button
              className="md:hidden btn btn-outline btn-sm flex items-center gap-1"
              onClick={() => setShowFilters(true)}
            >
              <FiFilter size={14} /> Filters
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton w-full aspect-square mb-3" />
                  <div className="skeleton w-full h-4 mb-2" />
                  <div className="skeleton w-2/3 h-4 mb-2" />
                  <div className="skeleton w-1/2 h-5" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => updateParam("page", (page - 1).toString())}
                    disabled={page <= 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-flipkart-text-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateParam("page", (page + 1).toString())}
                    disabled={page >= totalPages}
                    className="btn btn-primary btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-fk py-8"><div className="skeleton w-full h-96" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

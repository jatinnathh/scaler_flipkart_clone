"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounced = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.length >= 2) {
      api
        .get(`/products?search=${encodeURIComponent(debounced)}&limit=6`)
        .then((res) => {
          if (res.success && res.data?.products) {
            setSuggestions(res.data.products);
            setShowSuggestions(true);
          }
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debounced]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search for products, brands and more"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button type="submit" className="text-flipkart-primary p-1">
          <FiSearch size={20} />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-flipkart-border rounded shadow-lg z-50 mt-1 overflow-hidden">
          {suggestions.map((product: any) => (
            <button
              key={product.id}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-gray-50 transition"
              onClick={() => {
                router.push(`/product/${product.slug}`);
                setShowSuggestions(false);
                setQuery("");
              }}
            >
              <FiSearch size={14} className="text-flipkart-text-secondary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-flipkart-text truncate">{product.name}</p>
                <p className="text-xs text-flipkart-text-secondary">in {product.category_name || "Products"}</p>
              </div>
            </button>
          ))}
          <button
            className="w-full px-4 py-2.5 text-sm text-flipkart-primary font-medium hover:bg-flipkart-primary-light transition text-left border-t"
            onClick={handleSubmit}
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}

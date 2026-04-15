"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { formatPrice } from "@/lib/utils";
import { FiSearch, FiPlus, FiToggleLeft, FiToggleRight, FiEdit } from "react-icons/fi";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await adminApi.get(`/products?${params.toString()}`, token);
      if (res.success) {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleToggle = async (id: number) => {
    try {
      const token = localStorage.getItem("admin_token");
      await adminApi.patch(`/products/${id}/toggle`, {}, token);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      {/* Filters */}
      <div className="admin-card mb-4">
        <div className="admin-filters">
          <form onSubmit={handleSearch} className="admin-search-form">
            <FiSearch size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
          </form>
          <button onClick={() => router.push("/admin/products/new")} className="admin-btn admin-btn-primary">
            <FiPlus size={16} /> Add Product
          </button>
          <span className="admin-filter-count">{total} products</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="skeleton w-full h-5" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No products found</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.primary_image && <img src={product.primary_image} alt="" className="admin-product-thumb" />}
                        <div>
                          <p className="font-medium text-sm">{product.name.substring(0, 50)}{product.name.length > 50 ? "..." : ""}</p>
                          <p className="text-xs text-gray-500">{product.brand || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{product.category_name || "—"}</td>
                    <td className="font-semibold">{formatPrice(parseFloat(product.price))}</td>
                    <td className="text-gray-500">{formatPrice(parseFloat(product.mrp))}</td>
                    <td>
                      <span className={`admin-stock-badge ${product.stock_quantity <= 0 ? "out" : product.stock_quantity <= 5 ? "low" : "ok"}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="text-sm">{parseFloat(product.avg_rating || 0).toFixed(1)} ⭐</td>
                    <td>
                      <button onClick={() => handleToggle(product.id)} className="admin-toggle-btn">
                        {product.is_active ? <FiToggleRight size={24} className="text-green-500" /> : <FiToggleLeft size={24} className="text-gray-400" />}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => router.push(`/admin/products/${product.id}`)} className="admin-action-btn" title="Edit">
                        <FiEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="admin-page-btn">Previous</button>
            <span className="admin-page-info">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="admin-page-btn primary">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

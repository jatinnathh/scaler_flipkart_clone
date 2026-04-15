"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from "react-icons/fi";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", short_description: "",
    price: "", mrp: "", category_id: "", brand: "",
    stock_quantity: "",
  });
  const [images, setImages] = useState<string[]>([""]);
  const [highlights, setHighlights] = useState<string[]>([""]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("admin_token");
      const [catRes, prodRes] = await Promise.all([
        adminApi.get("/categories", token),
        adminApi.get(`/products?search=&page=1&limit=100`, token),
      ]);
      if (catRes.success) setCategories(catRes.data);

      // Find the product
      const product = prodRes.data?.products?.find((p: any) => p.id === parseInt(id as string));
      if (product) {
        setForm({
          name: product.name || "",
          description: product.description || "",
          short_description: product.short_description || "",
          price: product.price?.toString() || "",
          mrp: product.mrp?.toString() || "",
          category_id: product.category_id?.toString() || "",
          brand: product.brand || "",
          stock_quantity: product.stock_quantity?.toString() || "",
        });
        setHighlights(product.highlights?.length ? product.highlights : [""]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload: any = { ...form };
      payload.images = images.filter(i => i.trim());
      payload.highlights = highlights.filter(h => h.trim());
      if (payload.price) payload.price = parseFloat(payload.price);
      if (payload.mrp) payload.mrp = parseFloat(payload.mrp);
      if (payload.category_id) payload.category_id = parseInt(payload.category_id);
      if (payload.stock_quantity) payload.stock_quantity = parseInt(payload.stock_quantity);

      await adminApi.patch(`/products/${id}`, payload, token);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card p-8"><div className="skeleton w-full h-96" /></div>;

  return (
    <div>
      <button onClick={() => router.back()} className="admin-back-btn mb-4">
        <FiArrowLeft size={16} /> Back to Products
      </button>

      <form onSubmit={handleSubmit}>
        {error && <div className="admin-alert admin-alert-error mb-4">⚠️ {error}</div>}

        <div className="admin-grid-2">
          <div className="admin-card">
            <h3 className="admin-card-title">Edit Product</h3>
            <div className="admin-form-fields">
              <div className="admin-form-group">
                <label>Product Name *</label>
                <input className="admin-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Short Description</label>
                <input className="admin-input" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea className="admin-input admin-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input type="number" className="admin-input" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>MRP (₹) *</label>
                  <input type="number" className="admin-input" required value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select className="admin-input" required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Brand</label>
                  <input className="admin-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Stock Quantity</label>
                <input type="number" className="admin-input" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="admin-card">
              <h3 className="admin-card-title">Image URLs</h3>
              <div className="admin-form-fields">
                {images.map((url, i) => (
                  <div key={i} className="admin-array-item">
                    <input className="admin-input" value={url} onChange={e => { const a = [...images]; a[i] = e.target.value; setImages(a); }} placeholder="https://..." />
                    {images.length > 1 && <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="admin-array-remove"><FiTrash2 size={14} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setImages([...images, ""])} className="admin-array-add"><FiPlus size={14} /> Add Image</button>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Highlights</h3>
              <div className="admin-form-fields">
                {highlights.map((h, i) => (
                  <div key={i} className="admin-array-item">
                    <input className="admin-input" value={h} onChange={e => { const a = [...highlights]; a[i] = e.target.value; setHighlights(a); }} placeholder="Feature..." />
                    {highlights.length > 1 && <button type="button" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="admin-array-remove"><FiTrash2 size={14} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setHighlights([...highlights, ""])} className="admin-array-add"><FiPlus size={14} /> Add Highlight</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" onClick={() => router.back()} className="admin-btn admin-btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
            <FiSave size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { FiPlus, FiTrash2, FiImage, FiSave } from "react-icons/fi";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", short_description: "",
    price: "", mrp: "", category_id: "", brand: "",
    stock_quantity: "10",
  });
  const [images, setImages] = useState<string[]>([""]);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [specs, setSpecs] = useState<{ section: string; key: string; value: string }[]>([
    { section: "General", key: "", value: "" },
  ]);

  useEffect(() => {
    async function loadCategories() {
      const token = localStorage.getItem("admin_token");
      const res = await adminApi.get("/categories", token);
      if (res.success) setCategories(res.data);
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Build specifications object
      const specifications: Record<string, Record<string, string>> = {};
      specs.forEach(s => {
        if (s.key && s.value) {
          if (!specifications[s.section]) specifications[s.section] = {};
          specifications[s.section][s.key] = s.value;
        }
      });

      const payload = {
        ...form,
        images: images.filter(i => i.trim()),
        highlights: highlights.filter(h => h.trim()),
        specifications,
      };

      const res = await adminApi.post("/products", payload, token);
      if (res.success) {
        router.push("/admin/products");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="admin-product-form">
        {error && <div className="admin-alert admin-alert-error">⚠️ {error}</div>}

        <div className="admin-grid-2">
          {/* Left — Main Info */}
          <div className="space-y-4">
            <div className="admin-card">
              <h3 className="admin-card-title">Product Information</h3>
              <div className="admin-form-fields">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input className="admin-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., iPhone 15 Pro Max" />
                </div>
                <div className="admin-form-group">
                  <label>Short Description</label>
                  <input className="admin-input" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} placeholder="Brief product summary" />
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea className="admin-input admin-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed product description..." rows={4} />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Price (₹) *</label>
                    <input type="number" className="admin-input" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="499" />
                  </div>
                  <div className="admin-form-group">
                    <label>MRP (₹) *</label>
                    <input type="number" className="admin-input" required value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} placeholder="999" />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select className="admin-input" required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Brand</label>
                    <input className="admin-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g., Apple" />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Stock Quantity</label>
                  <input type="number" className="admin-input" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} placeholder="10" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Media & Extras */}
          <div className="space-y-4">
            {/* Images */}
            <div className="admin-card">
              <h3 className="admin-card-title"><FiImage size={16} /> Product Images (URLs)</h3>
              <div className="admin-form-fields">
                {images.map((url, i) => (
                  <div key={i} className="admin-array-item">
                    <input
                      className="admin-input"
                      value={url}
                      onChange={e => { const arr = [...images]; arr[i] = e.target.value; setImages(arr); }}
                      placeholder="https://example.com/image.jpg"
                    />
                    {images.length > 1 && (
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="admin-array-remove">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setImages([...images, ""])} className="admin-array-add">
                  <FiPlus size={14} /> Add Image
                </button>
              </div>
            </div>

            {/* Highlights */}
            <div className="admin-card">
              <h3 className="admin-card-title">Highlights</h3>
              <div className="admin-form-fields">
                {highlights.map((h, i) => (
                  <div key={i} className="admin-array-item">
                    <input
                      className="admin-input"
                      value={h}
                      onChange={e => { const arr = [...highlights]; arr[i] = e.target.value; setHighlights(arr); }}
                      placeholder="e.g., 128GB Storage"
                    />
                    {highlights.length > 1 && (
                      <button type="button" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="admin-array-remove">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setHighlights([...highlights, ""])} className="admin-array-add">
                  <FiPlus size={14} /> Add Highlight
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="admin-card">
              <h3 className="admin-card-title">Specifications</h3>
              <div className="admin-form-fields">
                {specs.map((spec, i) => (
                  <div key={i} className="admin-spec-item">
                    <input className="admin-input" placeholder="Section" value={spec.section} onChange={e => { const arr = [...specs]; arr[i].section = e.target.value; setSpecs(arr); }} />
                    <input className="admin-input" placeholder="Key" value={spec.key} onChange={e => { const arr = [...specs]; arr[i].key = e.target.value; setSpecs(arr); }} />
                    <input className="admin-input" placeholder="Value" value={spec.value} onChange={e => { const arr = [...specs]; arr[i].value = e.target.value; setSpecs(arr); }} />
                    {specs.length > 1 && (
                      <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="admin-array-remove">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setSpecs([...specs, { section: "General", key: "", value: "" }])} className="admin-array-add">
                  <FiPlus size={14} /> Add Spec
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" onClick={() => router.back()} className="admin-btn admin-btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
            <FiSave size={16} /> {saving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

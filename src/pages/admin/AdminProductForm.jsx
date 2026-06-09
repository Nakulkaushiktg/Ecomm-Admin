import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useCategories } from "../../context/CategoriesContext.jsx";

const EMPTY = {
  name: "", description: "", category: "", material: "",
  price: "", mrp: "", stock: "", weight_grams: 500, images: [], videos: [],
  sizes: "", colors: "",   // raw text; split on space OR comma at save
  is_active: true, is_featured: false, is_bestseller: false,
};

// split on spaces, commas or newlines -> clean list
const toList = (str) => (str || "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

export default function AdminProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // per-variant stock/price/mrp, keyed by "size|color"
  const [variantStock, setVariantStock] = useState({});
  const [variantPrice, setVariantPrice] = useState({});
  const [variantMrp, setVariantMrp] = useState({});

  const vKey = (size, color) => `${size}|${color}`;

  // build the list of variant combos from the entered sizes/colors
  const combos = (() => {
    const sizes = toList(form.sizes);
    const colors = toList(form.colors);
    if (sizes.length && colors.length)
      return sizes.flatMap((s) => colors.map((c) => ({ size: s, color: c })));
    if (sizes.length) return sizes.map((s) => ({ size: s, color: "" }));
    if (colors.length) return colors.map((c) => ({ size: "", color: c }));
    return [];
  })();

  // default category for a new product once categories load
  useEffect(() => {
    if (!editing && !form.category && categories.length) {
      setForm((f) => ({ ...f, category: categories[0].key }));
    }
  }, [categories, editing]);

  useEffect(() => {
    if (!editing) return;
    api.get("/api/admin/products").then((r) => {
      const p = r.data.find((x) => String(x.id) === String(id));
      if (p) {
        setForm({
          ...p, mrp: p.mrp || "", stock: p.stock ?? "", weight_grams: p.weight_grams ?? 500,
          videos: p.videos || [],
          sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "),
        });
        const vs = {}, vp = {}, vm = {};
        (p.variants || []).forEach((v) => {
          const k = `${v.size}|${v.color}`;
          vs[k] = v.stock;
          vp[k] = v.price ? v.price : "";
          vm[k] = v.mrp ? v.mrp : "";
        });
        setVariantStock(vs);
        setVariantPrice(vp);
        setVariantMrp(vm);
      }
    });
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setBool = (k) => (e) => setForm({ ...form, [k]: e.target.checked });

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/api/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, images: [...f.images, data.url] }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addImageUrl = () => {
    const url = prompt("Paste image URL:");
    if (url) setForm((f) => ({ ...f, images: [...f.images, url] }));
  };

  const removeImage = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/api/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, videos: [...f.videos, data.url] }));
    } catch (err) {
      setError(err.response?.data?.detail || "Video upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeVideo = (i) =>
    setForm((f) => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    // build variants from combos (only when sizes/colors exist)
    const variants = combos.map((c) => ({
      size: c.size,
      color: c.color,
      stock: Number(variantStock[vKey(c.size, c.color)]) || 0,
      price: Number(variantPrice[vKey(c.size, c.color)]) || 0,
      mrp: Number(variantMrp[vKey(c.size, c.color)]) || 0,
    }));
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      // when variants exist, total stock is summed on the backend
      stock: variants.length ? 0 : Number(form.stock) || 0,
      weight_grams: Number(form.weight_grams) || 500,
      sizes: toList(form.sizes),
      colors: toList(form.colors),
      variants,
    };
    try {
      if (editing) await api.put(`/api/admin/products/${id}`, payload);
      else await api.post("/api/admin/products", payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-maroon">
        {editing ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-xl border border-sand bg-white p-6">
        <div>
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={set("name")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set("category")}>
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Material</label>
            <input className="input" value={form.material} onChange={set("material")} placeholder="e.g. Handmade Wool" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Price (₹) *</label>
            <input type="number" className="input" value={form.price} onChange={set("price")} />
          </div>
          <div>
            <label className="label">MRP (₹)</label>
            <input type="number" className="input" value={form.mrp} onChange={set("mrp")} />
          </div>
          <div>
            <label className="label">Stock {combos.length > 0 && "(per-variant below)"}</label>
            <input
              type="number"
              className="input"
              value={combos.length ? combos.reduce((s, c) => s + (Number(variantStock[vKey(c.size, c.color)]) || 0), 0) : form.stock}
              onChange={set("stock")}
              disabled={combos.length > 0}
              placeholder={combos.length ? "auto from variants" : ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Weight (grams) — for delivery charge</label>
            <input type="number" className="input" value={form.weight_grams} onChange={set("weight_grams")} placeholder="500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Sizes (separate by space or comma)</label>
            <input
              className="input"
              placeholder="S M L XL"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {toList(form.sizes).map((s, i) => (
                <span key={i} className="rounded-full bg-sand px-2 py-0.5 text-xs text-ink">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Colors (separate by space or comma)</label>
            <input
              className="input"
              placeholder="Maroon Cream Gold"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {toList(form.colors).map((c, i) => (
                <span key={i} className="rounded-full bg-sand px-2 py-0.5 text-xs text-ink">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* per-variant stock + price grid */}
        {combos.length > 0 && (
          <div className="rounded-xl border border-sand bg-sand/20 p-4">
            <label className="label">Stock & Price per variant</label>
            <p className="mb-2 text-xs text-ink/50">
              Set quantity and optional price/MRP for each {form.sizes && form.colors ? "size + color" : form.sizes ? "size" : "color"}.
              Leave price/MRP blank to use the product's base price above.
            </p>
            <div className="grid gap-2">
              {combos.map((c) => {
                const key = vKey(c.size, c.color);
                const label = [c.size, c.color].filter(Boolean).join(" / ");
                return (
                  <div key={key} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2">
                    <span className="min-w-[90px] flex-1 text-sm font-medium">{label}</span>
                    <input
                      type="number" min="0"
                      className="w-20 rounded border border-sand px-2 py-1 text-sm outline-none focus:border-gold"
                      placeholder="qty"
                      value={variantStock[key] ?? ""}
                      onChange={(e) => setVariantStock({ ...variantStock, [key]: e.target.value })}
                    />
                    <input
                      type="number" min="0"
                      className="w-24 rounded border border-sand px-2 py-1 text-sm outline-none focus:border-gold"
                      placeholder="price ₹"
                      value={variantPrice[key] ?? ""}
                      onChange={(e) => setVariantPrice({ ...variantPrice, [key]: e.target.value })}
                    />
                    <input
                      type="number" min="0"
                      className="w-24 rounded border border-sand px-2 py-1 text-sm outline-none focus:border-gold"
                      placeholder="MRP ₹"
                      value={variantMrp[key] ?? ""}
                      onChange={(e) => setVariantMrp({ ...variantMrp, [key]: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={set("description")} />
        </div>

        <div>
          <label className="label">Images</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((im, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-sand">
                <img src={im} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0 top-0 bg-maroon px-1.5 text-xs text-cream"
                >×</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="btn-ghost cursor-pointer">
              {uploading ? "Uploading…" : "Upload Image"}
              <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
            </label>
            <button type="button" onClick={addImageUrl} className="text-sm text-maroon hover:underline">
              or paste URL
            </button>
          </div>
        </div>

        <div>
          <label className="label">Videos (optional)</label>
          <div className="flex flex-wrap gap-3">
            {form.videos.map((v, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-sand bg-ink">
                <video src={v} className="h-full w-full object-cover" muted />
                <button
                  type="button"
                  onClick={() => removeVideo(i)}
                  className="absolute right-0 top-0 bg-maroon px-1.5 text-xs text-cream"
                >×</button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="btn-ghost cursor-pointer">
              {uploading ? "Uploading…" : "Upload Video"}
              <input type="file" accept="video/*" onChange={uploadVideo} className="hidden" />
            </label>
            <span className="ml-3 text-xs text-ink/50">MP4/WebM/MOV, max 50MB</span>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={setBool("is_active")} />
            Active (visible in store)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={setBool("is_featured")} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_bestseller} onChange={setBool("is_bestseller")} />
            Bestseller badge
          </label>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">
            {saving ? "Saving…" : editing ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

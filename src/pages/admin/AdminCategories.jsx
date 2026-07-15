import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useCategories } from "../../context/CategoriesContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";

const EMPTY = { label: "", emoji: "🧶", image: "", sort_order: 0, is_active: true };

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { reload } = useCategories();
  const { confirm } = useConfirm();

  const load = () =>
    api
      .get("/api/admin/categories")
      .then((r) => setCats(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));

  useEffect(() => {
    load();
  }, []);

  const refreshAll = () => {
    load();
    reload(); // update storefront categories everywhere
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      label: form.label.trim(),
      emoji: form.emoji || "🧶",
      image: form.image || "",
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    if (!payload.label) {
      setError("Category name is required.");
      return;
    }
    try {
      if (editId) await api.put(`/api/admin/categories/${editId}`, payload);
      else await api.post("/api/admin/categories", payload);
      setForm(EMPTY);
      setEditId(null);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed.");
    }
  };

  const edit = (c) => {
    setEditId(c.id);
    setForm({ label: c.label, emoji: c.emoji, image: c.image || "", sort_order: c.sort_order, is_active: c.is_active });
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/api/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: data.url }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const del = async (id) => {
    const ok = await confirm({
      title: "Delete category?",
      message: "It will be removed from the store navigation. Products using it must be moved first.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/admin/categories/${id}`);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed.");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Categories</h1>
      <p className="mt-1 text-sm text-ink/50">
        Add or edit categories — they appear automatically on the store navbar, home and shop.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-sand bg-white p-5">
        <div>
          <label className="label">Image</label>
          <div className="flex items-center gap-2">
            {form.image ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-sand">
                <img src={form.image} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, image: "" })}
                  className="absolute right-0 top-0 bg-maroon px-1 text-xs text-cream">×</button>
              </div>
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-lg border border-dashed border-sand text-xs text-ink/40">none</div>
            )}
            <label className="btn-ghost cursor-pointer text-xs">
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="label">Category Name</label>
          <input className="input" placeholder="e.g. Home Decor" value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div>
          <label className="label">Order</label>
          <input type="number" className="input w-20" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Active
        </label>
        <button className="btn-primary">{editId ? "Update" : "Add"}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm(EMPTY); }} className="btn-ghost">
            Cancel
          </button>
        )}
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {/* mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {cats.map((c) => (
          <div key={c.id} className="rounded-xl border border-sand bg-white p-3">
            <div className="flex items-center gap-3">
              {c.image ? (
                <img src={c.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-sand text-xl">{c.emoji}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.label}</p>
                <p className="font-mono text-xs text-ink/50">{c.key} · order {c.sort_order}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {c.is_active ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => edit(c)} className="flex-1 rounded-full border border-maroon/30 py-2 text-sm font-medium text-maroon">Edit</button>
              <button onClick={() => del(c.id)} className="flex-1 rounded-full border border-red-300 py-2 text-sm font-medium text-red-700">Delete</button>
            </div>
          </div>
        ))}
        {cats.length === 0 && <p className="py-6 text-center text-ink/50">No categories yet.</p>}
      </div>

      {/* desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-xl border border-sand bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-sand/60 text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3">Key</th>
              <th className="p-3">Order</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-sand">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {c.image ? (
                      <img src={c.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sand text-lg">{c.emoji}</span>
                    )}
                    {c.label}
                  </div>
                </td>
                <td className="p-3 font-mono text-ink/60">{c.key}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {c.is_active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => edit(c)} className="text-maroon hover:underline">Edit</button>
                  <button onClick={() => del(c.id)} className="ml-4 text-red-700 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-ink/50">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Loader from "../../components/Loader.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";

const EMPTY = { text: "", start_at: "", end_at: "", is_active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const load = () =>
    api
      .get("/api/admin/banners")
      .then((r) => setBanners(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.text.trim()) {
      setError("Banner text is required.");
      return;
    }
    try {
      if (editId) await api.put(`/api/admin/banners/${editId}`, form);
      else await api.post("/api/admin/banners", form);
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed.");
    }
  };

  const edit = (b) => {
    setEditId(b.id);
    setForm({ text: b.text, start_at: b.start_at || "", end_at: b.end_at || "", is_active: b.is_active });
  };

  const del = async (id) => {
    const ok = await confirm({ title: "Delete banner?", confirmText: "Delete" });
    if (!ok) return;
    await api.delete(`/api/admin/banners/${id}`);
    load();
  };

  const status = (b) => {
    const now = Date.now();
    const s = b.start_at ? new Date(b.start_at).getTime() : null;
    const e = b.end_at ? new Date(b.end_at).getTime() : null;
    if (!b.is_active) return ["Off", "bg-sand text-ink/50"];
    if (s && now < s) return ["Scheduled", "bg-blue-100 text-blue-700"];
    if (e && now >= e) return ["Ended", "bg-red-100 text-red-700"];
    return ["Live", "bg-green-100 text-green-700"];
  };

  if (!banners) return <Loader label="Loading banners" />;

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Banners</h1>
      <p className="mt-1 text-sm text-ink/50">
        Add scheduled announcement banners. Only the currently-live one shows on the store (a scheduled one wins over an always-on one).
      </p>

      <form onSubmit={save} className="mt-6 rounded-xl border border-sand bg-white p-5">
        <label className="label">Banner text</label>
        <input
          className="input"
          placeholder="e.g. 🎉 Festive Sale — Flat 10% off with code FESTIVE10!"
          value={form.text}
          onChange={set("text")}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Start (optional)</label>
            <input type="datetime-local" className="input" value={form.start_at} onChange={set("start_at")} />
          </div>
          <div>
            <label className="label">End (optional — auto-hides + countdown)</label>
            <input type="datetime-local" className="input" value={form.end_at} onChange={set("end_at")} />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="h-5 w-5 accent-maroon" />
          Active
        </label>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button className="btn-primary">{editId ? "Update Banner" : "Add Banner"}</button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(EMPTY); }} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {banners.length === 0 ? (
          <p className="text-ink/50">No banners yet.</p>
        ) : (
          banners.map((b) => {
            const [label, cls] = status(b);
            return (
              <div key={b.id} className="flex items-start justify-between gap-3 rounded-xl border border-sand bg-white p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                    <span className="truncate font-medium">{b.text}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    {b.start_at ? `From ${b.start_at.replace("T", " ")}` : "Always"} ·{" "}
                    {b.end_at ? `Until ${b.end_at.replace("T", " ")}` : "No end"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  <button onClick={() => edit(b)} className="text-maroon hover:underline">Edit</button>
                  <button onClick={() => del(b.id)} className="text-red-700 hover:underline">Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

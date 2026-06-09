import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useConfirm } from "../../context/ConfirmContext.jsx";

const EMPTY = { code: "", discount_percent: "", min_order: "", is_active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const load = () =>
    api
      .get("/api/admin/coupons")
      .then((r) => setCoupons(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_percent: Number(form.discount_percent) || 0,
      min_order: Number(form.min_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editId) await api.put(`/api/admin/coupons/${editId}`, payload);
      else await api.post("/api/admin/coupons", payload);
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed.");
    }
  };

  const edit = (c) => {
    setEditId(c.id);
    setForm({ code: c.code, discount_percent: c.discount_percent, min_order: c.min_order, is_active: c.is_active });
  };

  const del = async (id, code) => {
    const ok = await confirm({
      title: "Delete coupon?",
      message: `Coupon "${code}" will stop working immediately.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    await api.delete(`/api/admin/coupons/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Discount Coupons</h1>

      <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-sand bg-white p-5">
        <div>
          <label className="label">Code</label>
          <input className="input w-36" placeholder="CODE" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </div>
        <div>
          <label className="label">Discount %</label>
          <input type="number" className="input w-24" value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
        </div>
        <div>
          <label className="label">Min Order ₹</label>
          <input type="number" className="input w-28" value={form.min_order}
            onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
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

      <div className="mt-6 overflow-hidden rounded-xl border border-sand bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sand/60 text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-sand">
                <td className="p-3 font-mono font-semibold text-maroon">{c.code}</td>
                <td className="p-3">{c.discount_percent}%</td>
                <td className="p-3">₹{c.min_order}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {c.is_active ? "Active" : "Off"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => edit(c)} className="text-maroon hover:underline">Edit</button>
                  <button onClick={() => del(c.id, c.code)} className="ml-4 text-red-700 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-ink/50">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

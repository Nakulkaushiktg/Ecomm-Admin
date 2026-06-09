import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, rupee } from "../../api.js";
import { useCategories } from "../../context/CategoriesContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { labelOf } = useCategories();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/products")
      .then((r) => setProducts(r.data))
      .catch((e) => {
        if (e.response?.status === 401) navigate("/admin/login");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const del = async (id, name) => {
    const ok = await confirm({
      title: "Delete product?",
      message: `"${name}" will be permanently removed from your store.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    await api.delete(`/api/admin/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-maroon">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      {loading ? (
        <p className="mt-8 text-ink/50">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-sand bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-sand">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-sand">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-ink/70">{labelOf(p.category)}</td>
                  <td className="p-3">{rupee(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.stock <= 0
                          ? "bg-red-100 text-red-800"
                          : p.stock <= 5
                          ? "bg-orange-100 text-orange-800"
                          : "text-ink"
                      }`}
                    >
                      {p.stock <= 0 ? "Out of stock" : p.stock <= 5 ? `${p.stock} left` : p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/admin/products/${p.id}`} className="text-maroon hover:underline">Edit</Link>
                    <button onClick={() => del(p.id, p.name)} className="ml-4 text-red-700 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-ink/50">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

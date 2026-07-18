import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, rupee } from "../../api.js";
import Loader from "../../components/Loader.jsx";

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminGifts() {
  const [orders, setOrders] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/admin/gift-orders")
      .then((r) => setOrders(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));
  }, []);

  if (!orders) return <Loader label="Loading gift orders" />;

  const pending = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Gift Claims 🎁</h1>
      <p className="mt-1 text-sm text-ink/50">
        Orders where the customer redeemed a loyalty gift. Include a free gift when you pack these.
      </p>

      {pending.length > 0 && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-maroon">
          🎁 {pending.length} order{pending.length > 1 ? "s" : ""} still to ship with a gift.
        </div>
      )}

      {orders.length === 0 ? (
        <p className="mt-8 text-ink/50">No gift claims yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-sand bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-maroon">#{o.order_number || o.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status] || "bg-sand"}`}>
                    {o.status}
                  </span>
                </div>
                <span className="text-sm text-ink/50">
                  {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {o.customer_name} · {o.phone} · {rupee(o.total)}
              </p>
              <p className="mt-1 text-xs text-ink/50">
                {o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
              </p>
              <Link to="/admin/orders" className="mt-2 inline-block text-sm font-medium text-maroon hover:underline">
                Manage in Orders →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

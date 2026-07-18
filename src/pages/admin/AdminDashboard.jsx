import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, rupee } from "../../api.js";
import Loader from "../../components/Loader.jsx";

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/admin/stats")
      .then((r) => setS(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));
  }, []);

  if (!s) return <Loader label="Loading dashboard" />;

  const Card = ({ label, value, to, tone = "" }) => {
    const body = (
      <div className={`rounded-2xl border border-sand bg-white p-5 shadow-sm transition hover:shadow-md ${tone}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
        <p className="mt-2 font-serif text-3xl text-maroon">{value}</p>
      </div>
    );
    return to ? <Link to={to}>{body}</Link> : body;
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">Your store at a glance.</p>

      {/* today */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-maroon to-maroon-dark p-6 text-cream shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gold-light">Today's Orders</p>
          <p className="mt-2 font-serif text-4xl">{s.today_orders}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-gold to-gold-light p-6 text-ink shadow-sm">
          <p className="text-xs uppercase tracking-wide text-maroon">Today's Revenue</p>
          <p className="mt-2 font-serif text-4xl text-maroon">{rupee(s.today_revenue)}</p>
        </div>
      </div>

      {/* overall */}
      <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card label="Total Revenue" value={rupee(s.revenue)} to="/admin/orders" />
        <Card label="Total Orders" value={s.total_orders} to="/admin/orders" />
        <Card label="Pending Orders" value={s.pending_orders} to="/admin/orders" />
        <Card label="Shipped" value={s.shipped_orders} to="/admin/orders" />
        <Card label="Delivered" value={s.delivered_orders} to="/admin/orders" />
        <Card label="Products" value={s.total_products} to="/admin/products" />
        <Card label="Customers" value={s.total_customers} to="/admin/customers" />
        <Card
          label="Low Stock"
          value={s.low_stock}
          to="/admin/products"
          tone={s.low_stock > 0 ? "ring-1 ring-orange-300" : ""}
        />
        <Card
          label="Gift Claims"
          value={s.gift_claims || 0}
          to="/admin/gifts"
          tone={s.gift_claims > 0 ? "ring-1 ring-gold" : ""}
        />
      </div>

      {s.gift_claims > 0 && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-maroon">
          🎁 {s.gift_claims} order{s.gift_claims > 1 ? "s" : ""} to ship with a free gift.{" "}
          <Link to="/admin/gifts" className="font-medium underline">View gift claims</Link>
        </div>
      )}

      {(s.low_stock > 0 || s.out_of_stock > 0) && (
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          ⚠ {s.out_of_stock > 0 && <>{s.out_of_stock} product(s) out of stock. </>}
          {s.low_stock > 0 && <>{s.low_stock} running low (≤5 left). </>}
          <Link to="/admin/products" className="font-medium underline">Review products</Link>
        </div>
      )}
    </div>
  );
}

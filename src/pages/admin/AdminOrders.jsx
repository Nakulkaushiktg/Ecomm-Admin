import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, rupee } from "../../api.js";
import { useConfirm } from "../../context/ConfirmContext.jsx";

function ShipmentEditor({ order, onSaved }) {
  const [courier, setCourier] = useState(order.courier || "");
  const [tracking, setTracking] = useState(order.tracking_id || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/admin/orders/${order.id}/shipment`, {
        courier,
        tracking_id: tracking,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg bg-sand/40 p-3">
      <h4 className="mb-2 font-semibold text-ink/70">Shipment (Shiprocket / Courier)</h4>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Courier</label>
          <input
            className="input w-40"
            placeholder="Delhivery / DTDC…"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Tracking ID / AWB</label>
          <input
            className="input w-48"
            placeholder="e.g. 1491234567890"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save & Mark Shipped"}
        </button>
        {order.tracking_id && (
          <a
            href={`https://www.shiprocket.in/shipment-tracking/${order.tracking_id}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-maroon hover:underline"
          >
            Track ↗
          </a>
        )}
      </div>
    </div>
  );
}

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

// build a free wa.me link to the CUSTOMER with a polished, professional message.
// You tap it, WhatsApp opens, you press send (free via WhatsApp Business app).
function customerWhatsApp(o) {
  let digits = (o.phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits; // add India code if missing

  const items = o.items
    .map((it) => `• ${it.product_name}  ×${it.quantity}  —  ₹${it.price * it.quantity}`)
    .join("\n");

  const address = `${o.address}, ${[o.city, o.state, o.pincode].filter(Boolean).join(", ")}`;
  const payLine =
    o.payment_method === "cod"
      ? `💵 Payment: Cash on Delivery (₹${o.total})`
      : `✅ Payment: Paid via UPI`;

  // a friendly line based on order status
  const statusLine =
    o.status === "shipped"
      ? "🚚 Great news! Your order is on its way."
      : o.status === "delivered"
      ? "📦 Your order has been delivered. We hope you love it!"
      : o.status === "paid"
      ? "✅ Your payment is confirmed. We're now preparing your order with care."
      : "🙏 Your order is confirmed and is being lovingly prepared.";

  const trackBlock = o.tracking_id
    ? `\n📍 *Shipment Details*\nCourier: ${o.courier || "Courier"}\nTracking ID: ${o.tracking_id}\nTrack here: https://www.shiprocket.in/shipment-tracking/${o.tracking_id}\n`
    : "";

  const msg =
    `Namaste ${o.customer_name} 🙏\n\n` +
    `Thank you for shopping with *Kirti Thread Art* — where every piece is crafted with love. ✨\n\n` +
    `${statusLine}\n\n` +
    `🧾 *Order #${o.id}*\n${items}\n\n` +
    `*Order Total: ₹${o.total}*\n` +
    `${payLine}\n\n` +
    `📦 *Delivery Address*\n${address}\n` +
    trackBlock +
    `\nIf you have any questions, simply reply to this message — we're always happy to help. 💛\n\n` +
    `With gratitude,\n*Team Kirti Thread Art* 🧶🪔`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}
const badge = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/orders")
      .then((r) => setOrders(r.data))
      .catch((e) => {
        if (e.response?.status === 401) navigate("/admin/login");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id, status) => {
    await api.put(`/api/admin/orders/${id}/status`, { status });
    load();
  };

  const emailCustomer = async (o) => {
    try {
      const { data } = await api.post(`/api/admin/orders/${o.id}/email`);
      alert(`Confirmation email sent to ${data.sent_to} ✓`);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not send email.");
    }
  };

  const deleteOrder = async (o) => {
    const ok = await confirm({
      title: `Delete order #${o.id}?`,
      message: "This will permanently remove the order and its items. This cannot be undone.",
      confirmText: "Delete Order",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/admin/orders/${o.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete order.");
    }
  };

  // dashboard stats
  const stats = (() => {
    const earned = (o) => ["paid", "shipped", "delivered"].includes(o.status);
    return {
      total: orders.length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      pending: orders.filter((o) => o.status === "pending").length,
      sales: orders.filter(earned).reduce((s, o) => s + o.total, 0),
    };
  })();

  const StatCard = ({ label, value, color }) => (
    <div className="rounded-xl border border-sand bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color || "text-ink"}`}>{value}</div>
    </div>
  );

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchQuery =
      !q ||
      String(o.id).includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q);
    return matchStatus && matchQuery;
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Orders</h1>

      {/* dashboard */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Orders" value={stats.total} color="text-maroon" />
        <StatCard label="Pending" value={stats.pending} color="text-yellow-700" />
        <StatCard label="Delivered" value={stats.delivered} color="text-green-700" />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-red-700" />
        <StatCard label="Total Sales" value={rupee(stats.sales)} color="text-maroon" />
      </div>

      {/* search + filter */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by name, phone or order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input max-w-[180px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-ink/50">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-ink/50">No orders found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-xl border border-sand bg-white">
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4"
                onClick={() => setOpen(open === o.id ? null : o.id)}
              >
                <div>
                  <span className="font-serif text-lg text-maroon">#{o.id}</span>
                  <span className="ml-3 font-medium">{o.customer_name}</span>
                  <span className="ml-3 text-sm text-ink/50">{o.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{rupee(o.total)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[o.status]}`}>
                    {o.status}
                  </span>
                  <span className="text-xs text-ink/40">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {open === o.id && (
                <div className="border-t border-sand p-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-1 font-semibold text-ink/70">Delivery</h4>
                      <p>{o.address}</p>
                      <p>{[o.city, o.state, o.pincode].filter(Boolean).join(", ")}</p>
                      {o.email && <p className="text-ink/60">{o.email}</p>}
                      {o.note && <p className="mt-1 italic text-ink/60">Note: {o.note}</p>}
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-ink/70">Payment</h4>
                      <p>
                        Method:{" "}
                        <span className={`font-medium ${o.payment_method === "cod" ? "text-orange-700" : "text-green-700"}`}>
                          {o.payment_method === "cod"
                            ? "Cash on Delivery"
                            : o.payment_method === "razorpay"
                            ? "Online (Razorpay) ✓ Paid"
                            : "UPI (Manual)"}
                        </span>
                      </p>
                      {o.payment_method === "upi" && (
                        <p>UTR: <span className="font-mono">{o.upi_txn_ref || "—"}</span></p>
                      )}
                      {o.payment_method === "razorpay" && (
                        <p>Payment ID: <span className="font-mono">{o.razorpay_payment_id || "—"}</span></p>
                      )}
                      <div className="mt-2 text-ink/70">
                        <p>Subtotal: {rupee(o.subtotal)}</p>
                        <p>Delivery: {o.shipping_fee ? rupee(o.shipping_fee) : "FREE"}</p>
                        {o.cod_fee > 0 && <p>COD Fee: {rupee(o.cod_fee)}</p>}
                        <p className="font-semibold text-ink">Total: {rupee(o.total)}</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="mb-1 mt-4 font-semibold text-ink/70">Items</h4>
                  <table className="w-full">
                    <tbody>
                      {o.items.map((it) => (
                        <tr key={it.id} className="border-t border-sand/60">
                          <td className="py-1.5">
                            {it.product_name}
                            {it.variant && <span className="ml-2 text-xs text-ink/50">({it.variant})</span>}
                          </td>
                          <td className="py-1.5 text-center">× {it.quantity}</td>
                          <td className="py-1.5 text-right">{rupee(it.price * it.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-ink/60">Update status:</span>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(o.id, s)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          o.status === s ? "bg-maroon text-cream" : "border border-sand hover:border-maroon"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <ShipmentEditor order={o} onSaved={load} />

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sand/60 pt-4">
                    <a
                      href={customerWhatsApp(o)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      💬 WhatsApp Customer
                    </a>
                    <button
                      onClick={() => emailCustomer(o)}
                      disabled={!o.email}
                      title={o.email ? `Send confirmation to ${o.email}` : "Customer did not provide an email"}
                      className="inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2 text-sm font-medium text-cream hover:bg-maroon-dark disabled:opacity-40"
                    >
                      📧 Email Customer
                    </button>
                    <Link
                      to={`/admin/invoice/${o.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-maroon/30 px-5 py-2 text-sm font-medium text-maroon hover:bg-maroon hover:text-cream"
                    >
                      🧾 Invoice
                    </Link>
                    <button
                      onClick={() => deleteOrder(o)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-600 hover:text-white"
                    >
                      🗑 Delete
                    </button>
                    <span className="text-xs text-ink/50">
                      WhatsApp: tap & send (free) · Email: sent instantly
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

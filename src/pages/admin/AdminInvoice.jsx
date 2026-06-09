import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, rupee } from "../../api.js";

export default function AdminInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [o, setO] = useState(null);

  useEffect(() => {
    api
      .get(`/api/admin/orders/${id}`)
      .then((r) => setO(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));
  }, [id]);

  if (!o) return <p className="p-8 text-ink/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="btn-ghost">← Back</button>
        <button onClick={() => window.print()} className="btn-primary">🖨 Print / Save PDF</button>
      </div>

      <div className="rounded-xl border border-sand bg-white p-8 text-sm text-ink">
        <div className="flex items-start justify-between border-b border-sand pb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kirti Thread Art" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <div className="font-serif text-2xl text-maroon">Kirti Thread Art</div>
              <div className="text-xs text-ink/50">Woolen · Sacred · Crafted</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-lg">INVOICE</div>
            <div className="text-ink/60">#{o.id}</div>
            <div className="text-xs text-ink/50">{new Date(o.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-ink/70">Bill To</div>
            <div>{o.customer_name}</div>
            <div className="text-ink/60">{o.phone}</div>
            {o.email && <div className="text-ink/60">{o.email}</div>}
          </div>
          <div>
            <div className="font-semibold text-ink/70">Ship To</div>
            <div>{o.address}</div>
            <div>{[o.city, o.state, o.pincode].filter(Boolean).join(", ")}</div>
          </div>
        </div>

        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b border-sand text-left text-xs uppercase text-ink/50">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-b border-sand/60">
                <td className="py-2">
                  {it.product_name}
                  {it.variant && <span className="block text-xs text-ink/50">{it.variant}</span>}
                </td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">{rupee(it.price)}</td>
                <td className="py-2 text-right">{rupee(it.price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{rupee(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({o.coupon_code})</span><span>− {rupee(o.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{o.shipping_fee ? rupee(o.shipping_fee) : "FREE"}</span></div>
          {o.cod_fee > 0 && <div className="flex justify-between"><span className="text-ink/60">COD Fee</span><span>{rupee(o.cod_fee)}</span></div>}
          <div className="flex justify-between border-t border-sand pt-1 text-base font-bold text-maroon"><span>Total</span><span>{rupee(o.total)}</span></div>
        </div>

        <div className="mt-6 border-t border-sand pt-4 text-xs text-ink/60">
          Payment: {o.payment_method === "cod" ? "Cash on Delivery" : o.payment_method === "razorpay" ? "Paid Online (Razorpay)" : "UPI"}
          {o.razorpay_payment_id && ` · ${o.razorpay_payment_id}`}
          {o.tracking_id && ` · Tracking: ${o.courier} ${o.tracking_id}`}
        </div>
        <p className="mt-4 text-center text-xs text-ink/50">Thank you for shopping with Kirti Thread Art! 🧶🪔</p>
      </div>
    </div>
  );
}

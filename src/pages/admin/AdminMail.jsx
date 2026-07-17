import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Loader from "../../components/Loader.jsx";

// ready-made content — click to fill, then edit as you like
const TEMPLATES = [
  {
    name: "✨ New Arrivals",
    subject: "✨ Fresh handmade arrivals just for you!",
    message:
      "Hi there,\n\nWe've just added beautiful new handmade pieces to our collection — crafted with love by our artisans.\n\nBe among the first to explore them before they're gone!\n\nWarmly,\nKirti Thread Art",
  },
  {
    name: "🎉 Sale / Offer",
    subject: "🎉 Special offer inside — limited time!",
    message:
      "Hello,\n\nFor a limited time, enjoy an exclusive discount on our handmade collection. Use code SAVE10 at checkout for 10% off.\n\nHurry, the offer ends soon!\n\nHappy shopping,\nKirti Thread Art",
  },
  {
    name: "🔔 Back in Stock",
    subject: "🔔 Your favourites are back in stock!",
    message:
      "Hi,\n\nGood news — some of our most-loved handmade pieces are back in stock!\n\nGrab yours before they sell out again.\n\nWarmly,\nKirti Thread Art",
  },
  {
    name: "🪔 Festival Wishes",
    subject: "🪔 Warm festive wishes from Kirti Thread Art",
    message:
      "Dear friend,\n\nWishing you and your family joy, warmth and prosperity this festive season. 🎉\n\nCelebrate with our handcrafted treasures — made with devotion.\n\nWith love,\nKirti Thread Art",
  },
  {
    name: "💛 Thank You",
    subject: "💛 A heartfelt thank you",
    message:
      "Hi,\n\nThank you for being part of the Kirti Thread Art family. Your support helps our artisans keep traditional crafts alive.\n\nWe're grateful to have you with us.\n\nWarmly,\nKirti Thread Art",
  },
];

const HEADLINES = [
  "Handpicked for You",
  "🔥 Sale on These Products",
  "✨ New Arrivals",
  "⏳ Limited Availability",
  "⭐ Our Bestsellers",
];

export default function AdminMail() {
  const [subs, setSubs] = useState(null);
  const [selected, setSelected] = useState([]); // emails
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  // product showcase
  const [products, setProducts] = useState([]);
  const [includeProducts, setIncludeProducts] = useState(true);
  const [showcaseTitle, setShowcaseTitle] = useState(HEADLINES[0]);
  const [pickedProducts, setPickedProducts] = useState([]); // product ids
  const [newEmails, setNewEmails] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const navigate = useNavigate();

  const addSubscribers = async () => {
    setAddMsg("");
    const emails = newEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return;
    setAdding(true);
    try {
      const { data } = await api.post("/api/admin/subscribers", { emails });
      setNewEmails("");
      load();
      setAddMsg(`Added ${data.added}${data.skipped ? ` · ${data.skipped} skipped (invalid/duplicate)` : ""}.`);
    } catch {
      setAddMsg("Could not add subscribers.");
    } finally {
      setAdding(false);
    }
  };

  const load = () =>
    api
      .get("/api/admin/subscribers")
      .then((r) => setSubs(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));

  useEffect(() => {
    load();
    api.get("/api/admin/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const togglePick = (id) =>
    setPickedProducts((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggle = (email) =>
    setSelected((s) => (s.includes(email) ? s.filter((e) => e !== email) : [...s, email]));

  const allSelected = subs && selected.length === subs.length && subs.length > 0;
  const toggleAll = () => setSelected(allSelected ? [] : subs.map((s) => s.email));

  const send = async (toAll) => {
    setError("");
    setResult(null);
    if (!subject.trim() || !message.trim()) {
      setError("Please enter a subject and message.");
      return;
    }
    const emails = toAll ? null : selected;
    if (!toAll && emails.length === 0) {
      setError("Select at least one subscriber, or use 'Send to All'.");
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/api/admin/send-mail", {
        subject,
        message,
        to_all: toAll,
        emails,
        include_products: includeProducts,
        showcase_title: showcaseTitle,
        product_ids: includeProducts ? pickedProducts : [],
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  if (!subs) return <Loader label="Loading subscribers" />;

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Mail Subscribers</h1>
      <p className="mt-1 text-sm text-ink/50">
        Send a beautiful branded email to all your newsletter subscribers, or pick a few.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* compose */}
        <div className="rounded-xl border border-sand bg-white p-5">
          <label className="label">Quick templates — click to fill</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => {
                  setSubject(t.subject);
                  setMessage(t.message);
                }}
                className="rounded-full border border-maroon/30 px-3 py-1.5 text-xs font-medium text-maroon transition hover:bg-maroon hover:text-cream"
              >
                {t.name}
              </button>
            ))}
          </div>

          <label className="label">Subject</label>
          <input
            className="input"
            placeholder="e.g. ✨ New handmade arrivals just for you!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label className="label mt-4">Message</label>
          <textarea
            className="input"
            rows={9}
            placeholder="Write your message here…&#10;&#10;Line breaks are kept. It will be wrapped in your branded template."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* product showcase controls */}
          <div className="mt-4 rounded-lg border border-sand p-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Include products in email</span>
              <input
                type="checkbox"
                checked={includeProducts}
                onChange={(e) => setIncludeProducts(e.target.checked)}
                className="h-5 w-5 accent-maroon"
              />
            </label>

            {includeProducts && (
              <>
                <label className="label mt-3">Section headline</label>
                <select
                  className="input"
                  value={showcaseTitle}
                  onChange={(e) => setShowcaseTitle(e.target.value)}
                >
                  {HEADLINES.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <p className="label mt-3">
                  Pick products (up to 3) — leave empty to auto-pick featured
                </p>
                <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                  {products.map((p) => {
                    const on = pickedProducts.includes(p.id);
                    const full = pickedProducts.length >= 3 && !on;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={full}
                        onClick={() => togglePick(p.id)}
                        className={`flex items-center gap-2 rounded-lg border p-1.5 text-left text-xs transition ${
                          on ? "border-maroon bg-maroon/5" : "border-sand"
                        } ${full ? "opacity-40" : ""}`}
                      >
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-sand">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          {result && (
            <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              ✓ Sent to {result.sent} of {result.total}
              {result.failed > 0 ? ` · ${result.failed} failed` : ""}.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => send(true)} disabled={sending} className="btn-primary">
              {sending ? "Sending…" : `Send to All (${subs.length})`}
            </button>
            <button onClick={() => send(false)} disabled={sending} className="btn-ghost">
              Send to Selected ({selected.length})
            </button>
          </div>
        </div>

        {/* preview */}
        <div className="rounded-xl border border-sand bg-cream p-5">
          <p className="label">Live Preview</p>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold" />
            <div className="bg-gradient-to-br from-maroon to-maroon-dark px-5 py-5 text-center text-cream">
              <div className="font-serif text-xl font-bold">Kirti Thread Art</div>
              <div className="text-[10px] uppercase tracking-widest text-gold-light">
                Woolen · Sacred · Crafted
              </div>
            </div>
            <div className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-ink/80">
              {message || "Your message preview will appear here…"}
            </div>
            <div className="px-5 pb-4 text-center">
              <span className="inline-block rounded-full bg-maroon px-5 py-2.5 text-xs font-bold text-cream">
                Shop the Collection →
              </span>
            </div>

            {includeProducts && (
              <div className="px-4 pb-4">
                <p className="mb-2 text-center font-serif text-sm text-maroon">{showcaseTitle}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(pickedProducts.length
                    ? products.filter((p) => pickedProducts.includes(p.id))
                    : products.slice(0, 3)
                  )
                    .slice(0, 3)
                    .map((p) => (
                      <div key={p.id} className="text-center">
                        <div className="aspect-square overflow-hidden rounded-lg bg-sand">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <p className="mt-1 truncate text-[10px] text-ink/70">{p.name}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="border-t border-sand p-3 text-center text-xs text-ink/40">
              Handmade with devotion 🧶 · kirti-thread-art.vercel.app
            </div>
          </div>
        </div>
      </div>

      {/* subscriber list */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-maroon">Subscribers ({subs.length})</h2>
          {subs.length > 0 && (
            <button onClick={toggleAll} className="text-sm font-medium text-maroon hover:underline">
              {allSelected ? "Clear all" : "Select all"}
            </button>
          )}
        </div>

        {/* bulk add subscribers */}
        <div className="mt-3 rounded-xl border border-sand bg-white p-4">
          <label className="label">Add subscribers — one email per line</label>
          <textarea
            className="input"
            rows={4}
            placeholder={"priya@gmail.com\nrahul@yahoo.com\nmeera@outlook.com"}
            value={newEmails}
            onChange={(e) => setNewEmails(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-3">
            <button onClick={addSubscribers} disabled={adding} className="btn-primary px-5 py-2 text-sm">
              {adding ? "Adding…" : "Add Emails"}
            </button>
            {addMsg && <span className="text-sm text-green-700">{addMsg}</span>}
          </div>
        </div>

        {subs.length === 0 ? (
          <p className="mt-4 text-ink/50">No subscribers yet.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition ${
                  selected.includes(s.email) ? "border-maroon bg-maroon/5" : "border-sand bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(s.email)}
                  onChange={() => toggle(s.email)}
                  className="accent-maroon"
                />
                <span className="truncate">{s.email}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

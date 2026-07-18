import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Loader from "../../components/Loader.jsx";

export default function AdminSettings() {
  const [cfg, setCfg] = useState(null);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  // change-login form
  const [cred, setCred] = useState({
    current_password: "", new_username: "", new_password: "",
  });
  const [credMsg, setCredMsg] = useState("");
  const [credErr, setCredErr] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/settings")
      .then((r) => setCfg(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));
  }, []);

  const save = async () => {
    setSaved(false);
    const { data } = await api.put("/api/admin/settings", {
      enable_cod: cfg.enable_cod,
      shipping_per_500g: Number(cfg.shipping_per_500g),
      free_shipping_above: Number(cfg.free_shipping_above),
      cod_fee: Number(cfg.cod_fee),
      instagram_url: cfg.instagram_url || "",
      show_stats: cfg.show_stats,
      show_loyalty: cfg.show_loyalty,
      stat_orders: cfg.stat_orders || "500",
      stat_designs: cfg.stat_designs || "50",
    });
    setCfg(data);
    setSaved(true);
  };

  const saveCreds = async () => {
    setCredErr("");
    setCredMsg("");
    try {
      const { data } = await api.put("/api/admin/credentials", {
        current_username: cfg.admin_username,
        current_password: cred.current_password,
        new_username: cred.new_username,
        new_password: cred.new_password,
      });
      setCredMsg(`Login updated. Username: ${data.username}. Use new details next login.`);
      setCred({ current_password: "", new_username: "", new_password: "" });
      setCfg({ ...cfg, admin_username: data.username });
    } catch (err) {
      setCredErr(err.response?.data?.detail || "Update failed.");
    }
  };

  if (!cfg) return <Loader label="Loading settings" />;

  const set = (k) => (e) =>
    setCfg({ ...cfg, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Store Settings</h1>

      <div className="mt-6 space-y-6 rounded-xl border border-sand bg-white p-6">
        {/* COD toggle */}
        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium">Cash on Delivery (COD)</div>
            <div className="text-sm text-ink/50">Enable/disable COD for the whole store</div>
          </div>
          <input
            type="checkbox"
            checked={cfg.enable_cod}
            onChange={set("enable_cod")}
            className="h-6 w-6 accent-maroon"
          />
        </label>

        <div className="grid grid-cols-2 gap-4 border-t border-sand pt-5">
          <div>
            <label className="label">Shipping per 500g (₹)</label>
            <input type="number" className="input" value={cfg.shipping_per_500g} onChange={set("shipping_per_500g")} />
          </div>
          <div>
            <label className="label">Free shipping above (₹)</label>
            <input type="number" className="input" value={cfg.free_shipping_above} onChange={set("free_shipping_above")} />
          </div>
          <div>
            <label className="label">COD extra fee (₹)</label>
            <input type="number" className="input" value={cfg.cod_fee} onChange={set("cod_fee")} />
          </div>
        </div>

        {/* hero sale banner */}
        <div className="border-t border-sand pt-5">
          <div className="font-medium">Homepage Sections</div>
          <div className="text-sm text-ink/50">Show/hide sections & edit the stat numbers on the store home.</div>
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Stats band (counters)</span>
              <input type="checkbox" checked={!!cfg.show_stats} onChange={set("show_stats")} className="h-5 w-5 accent-maroon" />
            </label>
            {cfg.show_stats && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Happy Orders (number)</label>
                  <input className="input" value={cfg.stat_orders || ""} onChange={set("stat_orders")} placeholder="500" />
                </div>
                <div>
                  <label className="label">Unique Designs (number)</label>
                  <input className="input" value={cfg.stat_designs || ""} onChange={set("stat_designs")} placeholder="50" />
                </div>
              </div>
            )}
            <label className="flex items-center justify-between">
              <span className="text-sm">Loyalty promo band (Earn points)</span>
              <input type="checkbox" checked={!!cfg.show_loyalty} onChange={set("show_loyalty")} className="h-5 w-5 accent-maroon" />
            </label>
          </div>
        </div>

        <div className="border-t border-sand pt-5">
          <div className="font-medium">Instagram Profile</div>
          <div className="text-sm text-ink/50">
            Paste your Instagram URL to show a "Follow us" section on the store. Leave blank to hide it.
          </div>
          <input
            className="input mt-3"
            placeholder="https://instagram.com/yourhandle"
            value={cfg.instagram_url || ""}
            onChange={set("instagram_url")}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="btn-primary">Save Settings</button>
          {saved && <span className="text-sm text-green-700">Saved ✓</span>}
        </div>
      </div>

      {/* Change admin login */}
      <div className="mt-8 space-y-4 rounded-xl border border-sand bg-white p-6">
        <div>
          <h2 className="font-serif text-xl text-maroon">Change Admin Login</h2>
          <p className="text-sm text-ink/50">
            Current username: <b>{cfg.admin_username}</b>
          </p>
        </div>

        <div>
          <label className="label">Current Password *</label>
          <input
            type="password"
            className="input"
            value={cred.current_password}
            onChange={(e) => setCred({ ...cred, current_password: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">New Username (optional)</label>
            <input
              className="input"
              placeholder={cfg.admin_username}
              value={cred.new_username}
              onChange={(e) => setCred({ ...cred, new_username: e.target.value })}
            />
          </div>
          <div>
            <label className="label">New Password (optional)</label>
            <input
              type="password"
              className="input"
              placeholder="leave blank to keep"
              value={cred.new_password}
              onChange={(e) => setCred({ ...cred, new_password: e.target.value })}
            />
          </div>
        </div>

        {credErr && <p className="text-sm text-red-700">{credErr}</p>}
        {credMsg && <p className="text-sm text-green-700">{credMsg}</p>}

        <button onClick={saveCreds} className="btn-primary">Update Login</button>
        <p className="text-xs text-ink/50">
          Forgot password? Run <code className="rounded bg-sand px-1">python reset_admin.py &lt;username&gt; &lt;password&gt;</code> in the backend folder.
        </p>
      </div>
    </div>
  );
}

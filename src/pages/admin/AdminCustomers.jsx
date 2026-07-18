import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import Loader from "../../components/Loader.jsx";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetId, setResetId] = useState(null);
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const load = () =>
    api
      .get("/api/admin/customers")
      .then((r) => setCustomers(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submitReset = async (id) => {
    setMsg("");
    if (newPass.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    try {
      const { data } = await api.put(`/api/admin/customers/${id}/reset-password`, {
        new_password: newPass,
      });
      setMsg(`Password reset for ${data.email}. Share it with the customer.`);
      setResetId(null);
      setNewPass("");
    } catch (e) {
      setMsg(e.response?.data?.detail || "Could not reset password.");
    }
  };

  const removeCustomer = async (c) => {
    const ok = await confirm({
      title: "Delete customer?",
      message: `Delete ${c.name} (${c.email})? Their past orders stay but get unlinked. This cannot be undone.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/admin/customers/${c.id}`);
      setCustomers((list) => list.filter((x) => x.id !== c.id));
      setMsg(`${c.email} deleted.`);
    } catch (e) {
      setMsg(e.response?.data?.detail || "Could not delete customer.");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-maroon">Customers</h1>
      <p className="mt-1 text-sm text-ink/50">
        {customers.length} registered customer{customers.length === 1 ? "" : "s"}.
        Passwords are encrypted and cannot be viewed — use “Reset” to set a new one.
      </p>

      {msg && (
        <p className="mt-3 rounded-lg bg-sand/60 px-4 py-2 text-sm text-maroon">{msg}</p>
      )}

      {loading ? (
        <Loader label="Loading customers" />
      ) : customers.length === 0 ? (
        <p className="mt-8 text-ink/50">No customers have signed up yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sand text-left text-ink/60">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Orders</th>
                <th className="p-3 text-center">Points</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-sand/60 align-top">
                  <td className="p-3 font-medium">
                    {c.name}
                    {c.reset_requested && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        🔑 reset requested
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-ink/70">{c.email}</td>
                  <td className="p-3 text-ink/70">{c.phone || "—"}</td>
                  <td className="p-3 text-ink/70">
                    {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="p-3 text-center">{c.order_count}</td>
                  <td className="p-3 text-center font-medium">{c.points || 0}</td>
                  <td className="p-3 text-ink/60">
                    {new Date(c.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-right">
                    {resetId === c.id ? (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <input
                          type="text"
                          className="w-32 rounded border border-sand px-2 py-1 text-sm outline-none focus:border-gold"
                          placeholder="new password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                        <button
                          onClick={() => submitReset(c.id)}
                          className="rounded bg-maroon px-3 py-1 text-xs text-cream hover:bg-maroon-dark"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setResetId(null); setNewPass(""); }}
                          className="text-xs text-ink/50 hover:text-maroon"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setResetId(c.id); setNewPass(""); setMsg(""); }}
                          className="rounded-full border border-maroon/30 px-3 py-1 text-xs font-medium text-maroon hover:bg-maroon hover:text-cream"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => removeCustomer(c)}
                          className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

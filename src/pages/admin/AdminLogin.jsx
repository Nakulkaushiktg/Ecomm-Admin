import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/admin/login", { username, password });
      localStorage.setItem("admin_token", data.access_token);
      navigate("/admin/orders");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-maroon px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-soft">
        <div className="text-center">
          <img src="/logo.png" alt="Kirti Thread Art" className="mx-auto h-12 w-12 rounded-full object-cover" />
          <h1 className="mt-3 font-serif text-2xl text-maroon">Admin Login</h1>
          <p className="text-sm text-ink/50">Kirti Thread Art Dashboard</p>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

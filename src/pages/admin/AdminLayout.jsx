import { useState } from "react";
import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");
  const [open, setOpen] = useState(false); // mobile drawer

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const link = ({ isActive }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive ? "bg-maroon text-cream" : "text-cream/70 hover:bg-maroon-dark"
    }`;

  const close = () => setOpen(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          onClick={close}
        />
      )}

      {/* sidebar: static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-maroon-dark p-4 text-cream transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Kirti Thread Art" className="h-9 w-9 rounded-full bg-cream object-cover" />
            <span className="font-serif text-lg">Kirti Thread Art</span>
          </div>
          <button onClick={close} className="text-2xl text-cream/70 md:hidden">×</button>
        </div>
        <nav className="space-y-1" onClick={close}>
          <NavLink to="/admin/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/admin/orders" className={link}>Orders</NavLink>
          <NavLink to="/admin/products" className={link}>Products</NavLink>
          <NavLink to="/admin/products/new" className={link}>+ Add Product</NavLink>
          <NavLink to="/admin/categories" className={link}>Categories</NavLink>
          <NavLink to="/admin/coupons" className={link}>Coupons</NavLink>
          <NavLink to="/admin/reviews" className={link}>Reviews</NavLink>
          <NavLink to="/admin/customers" className={link}>Customers</NavLink>
          <NavLink to="/admin/settings" className={link}>Settings</NavLink>
        </nav>
        <div className="mt-auto space-y-1">
          <a href={import.meta.env.VITE_STORE_URL || "#"} target="_blank" rel="noreferrer" className="block rounded-lg px-4 py-2.5 text-sm text-cream/70 hover:bg-maroon-dark">
            View Store ↗
          </a>
          <button onClick={logout} className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-cream/70 hover:bg-maroon-dark">
            Logout
          </button>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-sand bg-cream px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg bg-maroon text-lg text-cream"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-serif text-lg text-maroon">Kirti Thread Art</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

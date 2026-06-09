import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const link = ({ isActive }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive ? "bg-maroon text-cream" : "text-cream/70 hover:bg-maroon-dark"
    }`;

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 flex-col bg-maroon-dark p-4 text-cream">
        <div className="mb-6 flex items-center gap-2 px-2">
          <img src="/logo.png" alt="Kirti Thread Art" className="h-9 w-9 rounded-full object-cover bg-cream" />
          <span className="font-serif text-lg">Kirti Thread Art</span>
        </div>
        <nav className="space-y-1">
          <NavLink to="/admin/orders" className={link}>Orders</NavLink>
          <NavLink to="/admin/products" className={link}>Products</NavLink>
          <NavLink to="/admin/products/new" className={link}>+ Add Product</NavLink>
          <NavLink to="/admin/categories" className={link}>Categories</NavLink>
          <NavLink to="/admin/coupons" className={link}>Coupons</NavLink>
          <NavLink to="/admin/reviews" className={link}>Reviews</NavLink>
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
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

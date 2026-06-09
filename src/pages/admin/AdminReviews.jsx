import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Stars from "../../components/Stars.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const load = () =>
    api
      .get("/api/admin/reviews")
      .then((r) => setReviews(r.data))
      .catch((e) => e.response?.status === 401 && navigate("/admin/login"));

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    const ok = await confirm({
      title: "Delete review?",
      message: "This review will be removed from the product page.",
      confirmText: "Delete",
    });
    if (!ok) return;
    await api.delete(`/api/admin/reviews/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon">Customer Reviews</h1>

      <div className="mt-6 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-ink/50">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="flex items-start justify-between rounded-xl border border-sand bg-white p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-ink/70">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink/40">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => del(r.id)} className="text-sm text-red-700 hover:underline">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const CategoriesContext = createContext();
export const useCategories = () => useContext(CategoriesContext);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);

  const load = () =>
    api.get("/api/categories").then((r) => setCategories(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const labelOf = (key) =>
    categories.find((c) => c.key === key)?.label || key;
  const emojiOf = (key) =>
    categories.find((c) => c.key === key)?.emoji || "🧶";

  return (
    <CategoriesContext.Provider value={{ categories, labelOf, emojiOf, reload: load }}>
      {children}
    </CategoriesContext.Provider>
  );
}

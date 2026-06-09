import { createContext, useCallback, useContext, useState } from "react";

const ConfirmContext = createContext();
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { opts, resolve }

  const confirm = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        setState({ opts, resolve });
      }),
    []
  );

  const close = (result) => {
    if (state) state.resolve(result);
    setState(null);
  };

  const o = state?.opts || {};
  const danger = o.danger !== false; // default destructive style

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-cream shadow-soft"
          >
            <div className="flex flex-col items-center px-6 pt-7 text-center">
              <div
                className={`grid h-14 w-14 place-items-center rounded-full text-2xl ${
                  danger ? "bg-red-100 text-red-600" : "bg-gold/20 text-maroon"
                }`}
              >
                {o.icon || (danger ? "🗑" : "❓")}
              </div>
              <h3 className="mt-4 font-serif text-xl text-maroon">
                {o.title || "Are you sure?"}
              </h3>
              {o.message && (
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{o.message}</p>
              )}
            </div>
            <div className="mt-6 flex gap-3 border-t border-sand p-4">
              <button
                onClick={() => close(false)}
                className="flex-1 rounded-full border border-sand px-5 py-2.5 text-sm font-medium text-ink/70 hover:bg-sand/50"
              >
                {o.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-white ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-maroon hover:bg-maroon-dark"
                }`}
              >
                {o.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

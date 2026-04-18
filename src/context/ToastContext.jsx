import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 2600;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ message, tone = "success", duration = DEFAULT_DURATION }) => {
      if (!message) {
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toastSuccess: (message, duration) => pushToast({ message, tone: "success", duration }),
      toastError: (message, duration) => pushToast({ message, tone: "danger", duration }),
      toastInfo: (message, duration) => pushToast({ message, tone: "info", duration })
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-3">
        {toasts.map((toast) => {
          const toneClass =
            toast.tone === "danger"
              ? "border-[#f4c7c7] bg-[#fff5f5] text-[#8f2f2f]"
              : toast.tone === "info"
                ? "border-[#cdd9ff] bg-[#f3f6ff] text-[#2f4e96]"
                : "border-[#c8ecd8] bg-[#f2fcf7] text-[#227348]";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-soft ${toneClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p>{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80 hover:opacity-100"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return value;
}

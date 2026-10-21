import { useEffect, useState } from "react";
import { onToast } from "../services/api";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    });
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    error: <AlertCircle size={18} color="#f43f5e" />,
    success: <CheckCircle size={18} color="#10b981" />,
    info: <Info size={18} color="#38bdf8" />,
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} ${t.type}`}>
          {icons[t.type] || icons.info}
          <span style={{ flex: 1, fontSize: "0.88rem" }}>{t.msg}</span>
          <button
            onClick={() => dismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              opacity: 0.7,
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <XCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-indigo-600" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto p-3.5 rounded-xl border border-slate-200 bg-white shadow-lg flex items-start gap-3 transition"
        >
          <div className="mt-0.5">{icons[t.type] || icons.info}</div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs text-slate-900">{t.title}</h5>
            <p className="text-xs text-slate-600 mt-0.5 break-words">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

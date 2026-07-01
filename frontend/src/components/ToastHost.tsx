import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { ToastPayload } from '../utils/notify';

type ToastState = ToastPayload & { id: string };

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;
      const id = customEvent.detail.id || `${Date.now()}-${Math.random()}`;
      const toast = { ...customEvent.detail, id };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener('mkulima-toast', onToast as EventListener);
    return () => window.removeEventListener('mkulima-toast', onToast as EventListener);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-[min(92vw,24rem)] flex-col gap-3">
      {toasts.map((toast) => {
        const icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const Icon = icon;
        const tone =
          toast.type === 'success'
            ? 'border-[#008D41]/20 bg-white text-[#008D41]'
            : toast.type === 'error'
              ? 'border-red-200 bg-white text-red-600'
              : 'border-sky-200 bg-white text-sky-600';

        return (
          <div key={toast.id} className={`rounded-2xl border p-4 shadow-xl ${tone}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><Icon size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm opacity-80">{toast.message}</p> : null}
              </div>
              <button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="text-current/70 hover:text-current">
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

const AUTO_DISMISS_MS = 5000;

function toastVariantClasses(variant: 'success' | 'error' | 'info'): string {
  switch (variant) {
    case 'success':
      return 'border-green-500/30 bg-green-50 text-green-900';
    case 'error':
      return 'border-red-500/30 bg-red-50 text-red-900';
    case 'info':
    default:
      return 'border-border-sec bg-bg-primary text-text-pri';
  }
}

export function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2 rounded border px-3 py-2 text-[11px] shadow-lg ${toastVariantClasses(toast.variant)}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-[10px] opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

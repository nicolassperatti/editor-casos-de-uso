import type { ToastNotification } from '../../types/useCase';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto shadow-xl rounded-xl p-3 border text-xs flex items-center justify-between gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : isError
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : isWarning
                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
              <span className="font-medium leading-tight">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

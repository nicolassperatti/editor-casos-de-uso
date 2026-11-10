import { AlertTriangle, X } from 'lucide-react';

export type ButtonStyle = 'cancel' | 'danger' | 'accent' | 'accent-outline';

export interface ConfirmModalButton {
  label: string;
  style?: ButtonStyle;
  onClick: () => void;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttons: ConfirmModalButton[];
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  buttons,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getButtonClass = (style?: ButtonStyle) => {
    switch (style) {
      case 'danger':
        return 'px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm';
      case 'accent-outline':
        return 'px-3.5 py-2 rounded-xl text-xs font-semibold accent-outline-btn transition';
      case 'cancel':
        return 'px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300';
      case 'accent':
      default:
        return 'px-3.5 py-2 rounded-xl text-xs font-semibold accent-btn transition';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl accent-outline-btn flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 accent-text" />
            </div>
            <h3 className="font-bold text-base sm:text-lg leading-snug">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {buttons.map((btn, idx) => (
            <button
              key={`${btn.label}-${idx}`}
              type="button"
              onClick={btn.onClick}
              className={getButtonClass(btn.style)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

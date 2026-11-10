import type { AltFlow } from '../../types/useCase';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { Trash2 } from 'lucide-react';

interface AltFlowRowProps {
  altFlow: AltFlow;
  index: number;
  onUpdateRef: (ref: string) => void;
  onUpdateCondition: (condition: string) => void;
  onUpdateAction: (action: string) => void;
  onRemove: () => void;
}

export function AltFlowRow({
  altFlow,
  onUpdateRef,
  onUpdateCondition,
  onUpdateAction,
  onRemove,
}: AltFlowRowProps) {
  return (
    <div className="uc-step-row grid grid-cols-12 text-sm group relative bg-amber-500/5">
      <div className="col-span-7 p-2 sm:p-2.5 flex items-start gap-2">
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          <span className="font-bold text-xs text-amber-600 dark:text-amber-400 select-none">
            Paso ref:
          </span>
          <input
            type="text"
            value={altFlow.pasoRef || ''}
            placeholder="ej. 2.a, 4b"
            onChange={e => onUpdateRef(e.target.value)}
            className="w-16 px-1.5 py-0.5 text-xs font-mono rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
          />
        </div>
        <AutoResizeTextarea
          value={altFlow.condicion}
          onChange={onUpdateCondition}
          placeholder="Si ocurre la condición o fallo..."
        />
      </div>

      <div className="col-span-5 p-2 sm:p-2.5 uc-divider-v flex items-start justify-between gap-1">
        <AutoResizeTextarea
          value={altFlow.accion}
          onChange={onUpdateAction}
          placeholder="Acción alternativa o mensaje de error..."
        />

        <div className="no-export flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition pl-1">
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar flujo alternativo"
            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

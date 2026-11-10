import type { Step } from '../../types/useCase';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface StepRowProps {
  step: Step;
  index: number;
  totalSteps: number;
  onUpdateAction: (action: string) => void;
  onUpdateInfo: (info: string) => void;
  onMoveStep: (direction: -1 | 1) => void;
  onInsertStepBelow: () => void;
  onRemoveStep: () => void;
}

export function StepRow({
  step,
  index,
  totalSteps,
  onUpdateAction,
  onUpdateInfo,
  onMoveStep,
  onInsertStepBelow,
  onRemoveStep,
}: StepRowProps) {
  const stepNum = index + 1;

  return (
    <div className="uc-step-row grid grid-cols-12 text-sm group relative">
      <div className="col-span-7 p-2 sm:p-2.5 flex items-start gap-2">
        <span className="font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400 shrink-0 pt-1 select-none min-w-[22px]">
          {stepNum}.
        </span>
        <AutoResizeTextarea
          id={`step-accion-${index}`}
          value={step.accion}
          onChange={onUpdateAction}
          placeholder="Describa la acción realizada en este paso..."
        />
      </div>

      <div className="col-span-5 p-2 sm:p-2.5 uc-divider-v flex items-start justify-between gap-1">
        <AutoResizeTextarea
          id={`step-info-${index}`}
          value={step.info}
          onChange={onUpdateInfo}
          placeholder="Información vinculada..."
        />

        {/* Controles flotantes por fila (Mover / Insertar / Eliminar) */}
        <div className="no-export flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition pl-1">
          <button
            type="button"
            onClick={() => onMoveStep(-1)}
            disabled={index === 0}
            title="Subir paso"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveStep(1)}
            disabled={index === totalSteps - 1}
            title="Bajar paso"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onInsertStepBelow}
            title="Insertar paso debajo"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemoveStep}
            disabled={totalSteps <= 1}
            title="Eliminar paso"
            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 disabled:opacity-20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

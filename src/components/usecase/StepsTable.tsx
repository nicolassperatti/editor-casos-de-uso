import type { Step } from '../../types/useCase';
import { StepRow } from './StepRow';
import { Plus, PlusCircle, GitPullRequestDraft } from 'lucide-react';

interface StepsTableProps {
  steps: Step[];
  onAddStep: () => void;
  onAddAltFlow: () => void;
  onUpdateStepAction: (index: number, action: string) => void;
  onUpdateStepInfo: (index: number, info: string) => void;
  onMoveStep: (index: number, direction: -1 | 1) => void;
  onInsertStepAt: (index: number) => void;
  onRemoveStep: (index: number) => void;
}

export function StepsTable({
  steps,
  onAddStep,
  onAddAltFlow,
  onUpdateStepAction,
  onUpdateStepInfo,
  onMoveStep,
  onInsertStepAt,
  onRemoveStep,
}: StepsTableProps) {
  return (
    <>
      {/* Encabezado de la tabla de pasos */}
      <div className="uc-header-band grid grid-cols-12 font-bold text-sm">
        <div className="col-span-7 p-2.5 sm:p-3 flex items-center justify-between">
          <span>Pasos realizados (ruta principal)</span>
        </div>
        <div className="col-span-5 p-2.5 sm:p-3 uc-divider-v-strong flex items-center justify-between">
          <span>Información para los pasos</span>
          <button
            type="button"
            onClick={onAddStep}
            title="Agregar un nuevo paso"
            className="no-export px-2 py-0.5 rounded-md text-xs font-semibold accent-btn flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paso</span>
          </button>
        </div>
      </div>

      {/* Contenedor dinámico de filas de pasos */}
      <div>
        {steps.map((step, idx) => (
          <StepRow
            key={step.id || `step-${idx}`}
            step={step}
            index={idx}
            totalSteps={steps.length}
            onUpdateAction={action => onUpdateStepAction(idx, action)}
            onUpdateInfo={info => onUpdateStepInfo(idx, info)}
            onMoveStep={dir => onMoveStep(idx, dir)}
            onInsertStepBelow={() => onInsertStepAt(idx + 1)}
            onRemoveStep={() => onRemoveStep(idx)}
          />
        ))}
      </div>

      {/* Barra inferior para acciones de pasos (se oculta al exportar) */}
      <div className="no-export uc-row bg-slate-100/70 dark:bg-slate-900/60 px-3 py-1.5 flex flex-wrap items-center justify-end gap-3 text-xs">
        <button
          type="button"
          onClick={onAddAltFlow}
          className="font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 py-0.5"
        >
          <GitPullRequestDraft className="w-3.5 h-3.5" />
          <span>+ Flujo Alternativo / Excepción</span>
        </button>
        <button
          type="button"
          onClick={onAddStep}
          className="font-semibold accent-text hover:underline flex items-center gap-1 py-0.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Agregar nuevo paso</span>
        </button>
      </div>
    </>
  );
}

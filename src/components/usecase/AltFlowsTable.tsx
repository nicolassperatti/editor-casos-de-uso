import type { AltFlow } from '../../types/useCase';
import { AltFlowRow } from './AltFlowRow';
import { Plus } from 'lucide-react';

interface AltFlowsTableProps {
  altFlows: AltFlow[];
  onAddAltFlow: () => void;
  onUpdateRef: (index: number, ref: string) => void;
  onUpdateCondition: (index: number, condition: string) => void;
  onUpdateAction: (index: number, action: string) => void;
  onRemoveAltFlow: (index: number) => void;
}

export function AltFlowsTable({
  altFlows,
  onAddAltFlow,
  onUpdateRef,
  onUpdateCondition,
  onUpdateAction,
  onRemoveAltFlow,
}: AltFlowsTableProps) {
  if (altFlows.length === 0) return null;

  return (
    <div id="altFlowsSectionWrapper">
      <div className="uc-header-band grid grid-cols-12 font-bold text-sm">
        <div className="col-span-7 p-2.5 sm:p-3 flex items-center justify-between">
          <span>Flujos alternativos y excepciones</span>
        </div>
        <div className="col-span-5 p-2.5 sm:p-3 uc-divider-v-strong flex items-center justify-between">
          <span>Acción / Resolución</span>
          <button
            type="button"
            onClick={onAddAltFlow}
            title="Agregar flujo alternativo o excepción"
            className="no-export px-2 py-0.5 rounded-md text-xs font-semibold accent-btn flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excepción</span>
          </button>
        </div>
      </div>

      <div>
        {altFlows.map((alt, idx) => (
          <AltFlowRow
            key={alt.id || `alt-${idx}`}
            altFlow={alt}
            index={idx}
            onUpdateRef={ref => onUpdateRef(idx, ref)}
            onUpdateCondition={cond => onUpdateCondition(idx, cond)}
            onUpdateAction={action => onUpdateAction(idx, action)}
            onRemove={() => onRemoveAltFlow(idx)}
          />
        ))}
      </div>
    </div>
  );
}

import { forwardRef } from 'react';
import type { UseCaseData } from '../../types/useCase';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { QuickChips } from '../ui/QuickChips';
import { StepsTable } from './StepsTable';
import { AltFlowsTable } from './AltFlowsTable';
import { ComplexityBadge } from './ComplexityBadge';
import { createStep, createAltFlow, getNextAltFlowRef } from '../../constants/defaultData';

interface UseCaseSheetProps {
  data: UseCaseData;
  saveIndicator: string;
  onUpdate: (updater: (prev: UseCaseData) => UseCaseData, immediateHistory?: boolean) => void;
}

interface SheetTextRowProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}

function SheetTextRow({ id, label, value, placeholder, rows, onChange }: SheetTextRowProps) {
  return (
    <div className="uc-row p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
      <label htmlFor={id} className="font-bold shrink-0 sm:w-48 select-none">
        {label}:
      </label>
      <AutoResizeTextarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

interface SheetSelectRowProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

function SheetSelectRow({ id, label, value, options, placeholder, onChange }: SheetSelectRowProps) {
  return (
    <div className="uc-row p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 flex-1">
        <label htmlFor={id} className="font-bold shrink-0 sm:w-48 select-none">
          {label}:
        </label>
        <AutoResizeTextarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      <QuickChips options={options} currentValue={value} onSelect={onChange} />
    </div>
  );
}

export const UseCaseSheet = forwardRef<HTMLDivElement, UseCaseSheetProps>(
  ({ data, saveIndicator, onUpdate }, ref) => {
    const handleFieldChange = (field: keyof UseCaseData, value: string) => {
      onUpdate(prev => ({ ...prev, [field]: value }));
    };

    const toggleTriggerType = (type: 'externo' | 'temporal') => {
      onUpdate(prev => ({
        ...prev,
        tipoDesencadenador: {
          ...prev.tipoDesencadenador,
          [type]: !prev.tipoDesencadenador[type],
        },
      }), true);
    };

    const addStep = () => {
      onUpdate(prev => ({
        ...prev,
        pasos: [...prev.pasos, createStep()],
      }), true);
    };

    const insertStepAt = (index: number) => {
      onUpdate(prev => {
        const updated = [...prev.pasos];
        updated.splice(index, 0, createStep());
        return { ...prev, pasos: updated };
      }, true);
    };

    const removeStep = (index: number) => {
      onUpdate(prev => {
        if (prev.pasos.length <= 1) return prev;
        const updated = prev.pasos.filter((_, i) => i !== index);
        return { ...prev, pasos: updated };
      }, true);
    };

    const moveStep = (index: number, direction: -1 | 1) => {
      onUpdate(prev => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= prev.pasos.length) return prev;
        const updated = [...prev.pasos];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
        return { ...prev, pasos: updated };
      }, true);
    };

    const updateStepAction = (index: number, action: string) => {
      onUpdate(prev => {
        const updated = [...prev.pasos];
        updated[index] = { ...updated[index], accion: action };
        return { ...prev, pasos: updated };
      });
    };

    const updateStepInfo = (index: number, info: string) => {
      onUpdate(prev => {
        const updated = [...prev.pasos];
        updated[index] = { ...updated[index], info };
        return { ...prev, pasos: updated };
      });
    };

    const addAltFlow = () => {
      onUpdate(prev => ({
        ...prev,
        flujosAlternativos: [
          ...prev.flujosAlternativos,
          createAltFlow(getNextAltFlowRef(prev.flujosAlternativos, 1)),
        ],
      }), true);
    };

    const updateAltFlowRef = (index: number, pasoRef: string) => {
      onUpdate(prev => {
        const updated = [...prev.flujosAlternativos];
        updated[index] = { ...updated[index], pasoRef };
        return { ...prev, flujosAlternativos: updated };
      });
    };

    const updateAltFlowCondition = (index: number, condicion: string) => {
      onUpdate(prev => {
        const updated = [...prev.flujosAlternativos];
        updated[index] = { ...updated[index], condicion };
        return { ...prev, flujosAlternativos: updated };
      });
    };

    const updateAltFlowAction = (index: number, accion: string) => {
      onUpdate(prev => {
        const updated = [...prev.flujosAlternativos];
        updated[index] = { ...updated[index], accion };
        return { ...prev, flujosAlternativos: updated };
      });
    };

    const removeAltFlow = (index: number) => {
      onUpdate(prev => ({
        ...prev,
        flujosAlternativos: prev.flujosAlternativos.filter((_, i) => i !== index),
      }), true);
    };

    return (
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Barra superior de métricas y estado */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
          <ComplexityBadge data={data} />
          <div className="flex items-center gap-1.5 font-mono text-[11px] opacity-80">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />
            <span>{saveIndicator}</span>
          </div>
        </div>

        {/* CONTENEDOR CAPTURABLE DEL FORMULARIO DE CASO DE USO */}
        <div ref={ref} id="useCaseSheet" className="uc-container rounded-xl overflow-hidden text-sm">
          {/* FILA 1: Nombre del caso de uso + ID única */}
          <div className="uc-row grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-8 p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <label htmlFor="field-nombre" className="font-bold shrink-0 sm:w-48 select-none">
                Nombre del caso de uso:
              </label>
              <AutoResizeTextarea
                id="field-nombre"
                value={data.nombre}
                onChange={v => handleFieldChange('nombre', v)}
                className="font-medium"
                placeholder="Ej. Cambiar información de estudiante"
              />
            </div>

            <div className="md:col-span-4 p-2.5 sm:p-3 border-t md:border-t-0 md:uc-divider-v flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 bg-slate-50/40 dark:bg-slate-900/30">
              <label htmlFor="field-id" className="font-bold shrink-0 select-none">
                ID única:
              </label>
              <AutoResizeTextarea
                id="field-id"
                value={data.id}
                onChange={v => handleFieldChange('id', v)}
                className="font-mono font-medium"
                placeholder="Ej. Estudiante UC 005"
              />
            </div>
          </div>

          {/* FILA 2: Área */}
          <SheetTextRow
            id="field-area"
            label="Área"
            value={data.area}
            onChange={v => handleFieldChange('area', v)}
            placeholder="Ej. Sistema de estudiantes, Ventas, Pagos, Logística..."
          />

          {/* FILA 3: Actor(es) Primario y Secundarios */}
          <div className="uc-row grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <label htmlFor="field-actores" className="font-bold shrink-0 sm:w-48 select-none">
                Actor(es):
              </label>
              <AutoResizeTextarea
                id="field-actores"
                value={data.actores}
                onChange={v => handleFieldChange('actores', v)}
                placeholder="Ej. Estudiante, Cliente, Cajero, Administrador..."
              />
            </div>

            <div
              id="secActorsCell"
              className="md:col-span-5 p-2.5 sm:p-3 border-t md:border-t-0 md:uc-divider-v flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 bg-slate-50/40 dark:bg-slate-900/30"
            >
              <label
                htmlFor="field-actoresSecundarios"
                className="font-bold shrink-0 text-xs sm:text-sm select-none flex items-center gap-1"
                title="Actores secundarios, pasarelas de pago, servicios externos o auditores"
              >
                <span>Actor(es) secundario(s):</span>
              </label>
              <AutoResizeTextarea
                id="field-actoresSecundarios"
                value={data.actoresSecundarios}
                onChange={v => handleFieldChange('actoresSecundarios', v)}
                className="text-xs sm:text-sm"
                placeholder="Opcional (ej. Pasarela de Pago, Email...)"
              />
            </div>
          </div>

          {/* FILA 4: Descripción */}
          <SheetTextRow
            id="field-descripcion"
            label="Descripción"
            rows={2}
            value={data.descripcion}
            onChange={v => handleFieldChange('descripcion', v)}
            placeholder="Describa detalladamente el propósito del caso de uso..."
          />

          {/* FILA 5: Evento desencadenador */}
          <SheetTextRow
            id="field-evento"
            label="Evento desencadenador"
            rows={2}
            value={data.evento}
            onChange={v => handleFieldChange('evento', v)}
            placeholder="Describa el evento que inicia el caso de uso..."
          />

          {/* FILA 6: Tipo de desencadenador (Externo / Temporal) */}
          <div className="uc-row p-2.5 sm:p-3 flex flex-wrap items-center gap-4 sm:gap-8">
            <span className="font-bold shrink-0 sm:w-44 select-none">Tipo de desencadenador:</span>
            <div className="flex flex-wrap items-center gap-6 sm:gap-12">
              <button
                type="button"
                onClick={() => toggleTriggerType('externo')}
                className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
              >
                <span className={`custom-checkbox ${data.tipoDesencadenador.externo ? 'checked' : ''}`}>
                  {data.tipoDesencadenador.externo && (
                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <span className="font-medium group-hover:opacity-80">Externo</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTriggerType('temporal')}
                className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
              >
                <span className={`custom-checkbox ${data.tipoDesencadenador.temporal ? 'checked' : ''}`}>
                  {data.tipoDesencadenador.temporal && (
                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <span className="font-medium group-hover:opacity-80">Temporal</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN CENTRAL: TABLA DE PASOS REALIZADOS E INFORMACIÓN */}
          <StepsTable
            steps={data.pasos}
            onAddStep={addStep}
            onAddAltFlow={addAltFlow}
            onUpdateStepAction={updateStepAction}
            onUpdateStepInfo={updateStepInfo}
            onMoveStep={moveStep}
            onInsertStepAt={insertStepAt}
            onRemoveStep={removeStep}
          />

          {/* SECCIÓN OPCIONAL: FLUJOS ALTERNATIVOS Y EXCEPCIONES */}
          <AltFlowsTable
            altFlows={data.flujosAlternativos}
            onAddAltFlow={addAltFlow}
            onUpdateRef={updateAltFlowRef}
            onUpdateCondition={updateAltFlowCondition}
            onUpdateAction={updateAltFlowAction}
            onRemoveAltFlow={removeAltFlow}
          />

          {/* FILAS INFERIORES DE ESPECIFICACIÓN */}
          <SheetTextRow
            id="field-precondiciones"
            label="Pre-condiciones"
            value={data.precondiciones}
            onChange={v => handleFieldChange('precondiciones', v)}
            placeholder="Estado necesario antes de que inicie el caso de uso..."
          />

          <SheetTextRow
            id="field-postcondiciones"
            label="Post-condiciones"
            value={data.postcondiciones}
            onChange={v => handleFieldChange('postcondiciones', v)}
            placeholder="Resultado tras completar exitosamente el caso de uso..."
          />

          <SheetTextRow
            id="field-suposiciones"
            label="Suposiciones"
            value={data.suposiciones}
            onChange={v => handleFieldChange('suposiciones', v)}
            placeholder="Condiciones asumidas como verdaderas..."
          />

          <SheetTextRow
            id="field-requerimientos"
            label="Requerimientos cumplidos"
            value={data.requerimientos}
            onChange={v => handleFieldChange('requerimientos', v)}
            placeholder="Requerimientos funcionales o de negocio vinculados..."
          />

          <SheetTextRow
            id="field-cuestiones"
            label="Cuestiones pendientes"
            value={data.cuestiones}
            onChange={v => handleFieldChange('cuestiones', v)}
            placeholder="Preguntas o definiciones por resolver..."
          />

          {/* Prioridad y Riesgo */}
          <SheetSelectRow
            id="field-prioridad"
            label="Prioridad"
            value={data.prioridad}
            options={['Baja', 'Media', 'Alta']}
            onChange={v => handleFieldChange('prioridad', v)}
            placeholder="Ej. Media, Alta, Baja"
          />

          <SheetSelectRow
            id="field-riesgo"
            label="Riesgo"
            value={data.riesgo}
            options={['Bajo', 'Medio', 'Alto']}
            onChange={v => handleFieldChange('riesgo', v)}
            placeholder="Ej. Medio, Alto, Bajo"
          />
        </div>
      </main>
    );
  }
);

UseCaseSheet.displayName = 'UseCaseSheet';

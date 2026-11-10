import type { UseCaseData } from '../../types/useCase';
import { Gauge } from 'lucide-react';

interface ComplexityBadgeProps {
  data: UseCaseData;
}

export function calculateComplexity(data: UseCaseData): {
  stepsCount: number;
  altCount: number;
  level: 'Baja' | 'Media' | 'Alta';
  colorClass: string;
} {
  const stepsCount = (data.pasos || []).filter(p => (p.accion || '').trim()).length;
  const altCount = (data.flujosAlternativos || []).filter(
    a => (a.condicion || '').trim() || (a.accion || '').trim() || (a.pasoRef || '').trim()
  ).length;

  let level: 'Baja' | 'Media' | 'Alta' = 'Baja';
  let colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (stepsCount > 8 || altCount > 2) {
    level = 'Alta';
    colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (stepsCount > 4 || altCount > 0) {
    level = 'Media';
    colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return { stepsCount, altCount, level, colorClass };
}

export function ComplexityBadge({ data }: ComplexityBadgeProps) {
  const { stepsCount, altCount, level, colorClass } = calculateComplexity(data);

  return (
    <div className="no-export inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition backdrop-blur-xs shadow-2xs">
      <Gauge className="w-3.5 h-3.5 opacity-70" />
      <span className="text-slate-600 dark:text-slate-300">
        {stepsCount} {stepsCount === 1 ? 'paso' : 'pasos'} · {altCount} {altCount === 1 ? 'excepción' : 'excepciones'}
      </span>
      <span className="text-slate-300 dark:text-slate-700">|</span>
      <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wider ${colorClass}`}>
        Complejidad {level}
      </span>
    </div>
  );
}

import { useState } from 'react';
import { TEMPLATES_CATALOG, type UseCaseTemplate } from '../../constants/templates';
import { LayoutTemplate, X, ArrowRight, ShieldCheck, ShoppingCart, Boxes, GraduationCap, FilePlus2 } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: UseCaseTemplate) => void;
}

export function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  if (!isOpen) return null;

  const categories = ['Todas', 'General', 'Seguridad', 'E-Commerce', 'Inventario', 'Educación'];

  const filtered = selectedCategory === 'Todas'
    ? TEMPLATES_CATALOG
    : TEMPLATES_CATALOG.filter(t => t.category === selectedCategory);

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'auth':
        return <ShieldCheck className="w-5 h-5 text-sky-500" />;
      case 'checkout':
        return <ShoppingCart className="w-5 h-5 text-amber-500" />;
      case 'crud':
        return <Boxes className="w-5 h-5 text-emerald-500" />;
      case 'student':
        return <GraduationCap className="w-5 h-5 text-pink-500" />;
      default:
        return <FilePlus2 className="w-5 h-5 accent-text" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-outline-btn flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Catálogo de Plantillas Predefinidas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona una estructura lista para acelerar la documentación de tu sistema
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros por Categoría */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'accent-btn shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de Plantillas */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(template => (
            <div
              key={template.id}
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      {getTemplateIcon(template.id)}
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {template.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {template.data.pasos.length} pasos
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:accent-text transition mb-1">
                  {template.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs font-semibold accent-text">
                <span>Usar esta plantilla</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { FileSpreadsheet } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center accent-btn font-bold text-lg">
          <FileSpreadsheet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
            UseCase Studio
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full accent-outline-btn">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Especificación estructurada de Casos de Uso</p>
        </div>
      </div>
    </div>
  );
}

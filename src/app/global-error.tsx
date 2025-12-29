'use client';
 
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import DragonLogo from "@/components/ui/DragonLogo";
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
 
  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8 flex flex-col items-center gap-4">
              <DragonLogo className="w-16 h-16" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                Drachenboot Manager
              </h1>
            </div>

            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Kritischer Fehler / Critical Error
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
              Ein kritischer Fehler ist aufgetreten und die Anwendung konnte nicht geladen werden.
            </p>
            <p className="text-slate-500 dark:text-slate-500 mb-8 italic">
              A critical error occurred and the application could not be loaded.
            </p>

            <div className="flex justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Neu laden / Reload</span>
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

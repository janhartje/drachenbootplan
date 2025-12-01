import React from 'react';
import { usePathname } from 'next/navigation';
import { Info, X, PlayCircle } from 'lucide-react';
import { useTour } from '@/context/TourContext';

const HelpModal = ({ onClose }) => {
  const { startTour } = useTour();
  const pathname = usePathname();
  
  const handleStartTour = () => {
    onClose();
    if (pathname === '/') {
      startTour('welcome');
    } else if (pathname === '/planner') {
      startTour('planner');
    }
  };

  const renderContent = () => {
    if (pathname === '/planner') {
      return (
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-1 rounded">🚣</span> Bootsbesetzung
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-1">
              <li>Klicke auf einen Paddler in der Liste, um ihn auszuwählen.</li>
              <li>Klicke dann auf einen freien Sitzplatz im Boot.</li>
              <li>Um jemanden zu entfernen, bewege die Maus über den Sitz und klicke auf das kleine <span className="font-bold text-red-500">X</span>.</li>
              <li>Mit der <span className="font-bold">Pin-Nadel</span> (oben links am Sitz) kannst du einen Paddler fixieren. Er wird dann von der <span className="font-bold text-indigo-600 dark:text-indigo-400">Magic KI</span> nicht verschoben.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 p-1 rounded">📦</span> Spezial-Items
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-1">
              <li><span className="font-bold">Kanister:</span> Füge 25kg Platzhalter hinzu.</li>
              <li><span className="font-bold">Gast:</span> Füge temporäre Paddler hinzu, die nicht im Kader sind.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 p-1 rounded">🛠</span> Tools & Statistik
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-1">
              <li><span className="font-bold">Magic KI:</span> Der Zauberstab besetzt das Boot automatisch optimal.</li>
              <li><span className="font-bold">Trimm:</span> Nutze den Slider, um das Zielgewicht (Bug/Heck) anzupassen.</li>
              <li><span className="font-bold">Export:</span> Speichere die Aufstellung als Bild.</li>
            </ul>
          </section>
        </div>
      );
    }

    // Default: Home / Team View
    return (
      <div className="space-y-6">
        <section>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 p-1 rounded">📅</span> Termine verwalten
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-1">
            <li>Erstelle neue Trainings oder Regatten über das Formular links.</li>
            <li>Klicke auf <span className="font-bold">Planen</span>, um die Bootsbesetzung für einen Termin zu starten.</li>
            <li>Verwalte Zu- und Absagen direkt in der Terminliste.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 p-1 rounded">👥</span> Mitglieder
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-1">
            <li>Füge neue Mitglieder über das Formular hinzu.</li>
            <li>Bearbeite Mitglieder durch Klick auf das <span className="font-bold">Stift-Icon</span> im Kader.</li>
            <li>Lösche Mitglieder mit dem <span className="font-bold">Mülleimer-Icon</span> (muss 2x bestätigt werden).</li>
          </ul>
        </section>
      </div>
    );
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Info size={20} className="text-blue-500" /> Hilfe & Anleitung</h2>
        <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
      </div>
      
      <div className="p-6 overflow-y-auto text-sm">
        {renderContent()}
        
        <section className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">🛠 Tools</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Nutze den Slider für die Trimmung und die Magic KI für automatische Besetzung.</p>
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">🎓 Interaktive Einführung</h3>
          <button 
            onClick={handleStartTour} 
            className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-3 rounded-xl transition-colors font-medium border border-blue-100 dark:border-blue-800"
          >
            <PlayCircle size={18} /> Tour starten
          </button>
        </section>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50">
        <button onClick={onClose} className="bg-slate-900 dark:bg-slate-700 text-white px-8 py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 font-medium transition-colors">Verstanden</button>
      </div>
    </div>
  </div>
  );
};

export default HelpModal;

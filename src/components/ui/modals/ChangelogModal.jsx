import React from 'react';
import { X } from 'lucide-react';

const ChangelogModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Changelog</h2>
        <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
      </div>
      <div className="p-6 overflow-y-auto space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">v1.2.0 - User Experience & Magic KI</h3>
          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-400 mt-1 space-y-1">
            <li>Interaktive Guided Tours für Team-View und Planner</li>
            <li>Kontext-sensitive Hilfe & Anleitung</li>
            <li>"Magic KI" Branding für Auto-Fill</li>
            <li>Einheitliches Design aller Dialogfenster</li>
            <li>Erweiterte Erklärungen (z.B. Pin-Nadel)</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">v1.1.0 - Layout Update</h3>
          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-400 mt-1 space-y-1">
            <li>Neues Header-Design für bessere Übersicht</li>
            <li>Footer mit Rechtlichem hinzugefügt</li>
            <li>Dark Mode Toggle verbessert</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">v1.0.0 - Initial Release</h3>
          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-400 mt-1 space-y-1">
            <li>Team Management (Paddler anlegen/bearbeiten)</li>
            <li>Terminplanung mit Zu/Absagen</li>
            <li>Bootsbesetzung mit Drag & Drop (Magic KI)</li>
            <li>Gewichtstrimmung und Balance-Anzeige</li>
          </ul>
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50">
        <button onClick={onClose} className="bg-slate-900 dark:bg-slate-700 text-white px-8 py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 font-medium transition-colors">Schließen</button>
      </div>
    </div>
  </div>
);

export default ChangelogModal;

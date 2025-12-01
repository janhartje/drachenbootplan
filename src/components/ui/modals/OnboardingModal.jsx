import React, { useState } from 'react';
import { Users, Calendar, ShipWheel, Wand2 } from 'lucide-react';
import DragonLogo from '../DragonLogo';

const OnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Willkommen an Bord!', desc: 'Dein neuer Assistent für die Drachenboot-Planung.', icon: <DragonLogo className="w-32 h-32 text-blue-600 dark:text-blue-400 mb-4" /> },
    { title: 'Team & Termine', desc: 'Verwalte Kader und Termine an einem Ort.', icon: <div className="flex gap-6 text-blue-600 dark:text-blue-400 mb-6 justify-center"><Users size={64} /><Calendar size={64} /></div> },
    { title: 'Smarte Planung', desc: 'Magic KI berechnet die beste Sitzordnung.', icon: <div className="flex gap-6 text-blue-600 dark:text-blue-400 mb-6 justify-center"><ShipWheel size={64} /><Wand2 size={64} /></div> },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center relative p-8 border border-slate-100 dark:border-slate-800">
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
          {steps[step].icon}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{steps[step].title}</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{steps[step].desc}</p>
        </div>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 mt-6 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          {step === steps.length - 1 ? "Los geht's!" : 'Weiter'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;

import React, { useState } from 'react';
import { X, UserPlus, Users, Calendar, ShipWheel, Wand2, Info, Scale } from 'lucide-react';
import DragonLogo from './DragonLogo';

export const AddGuestModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [skills, setSkills] = useState({ left: false, right: false, drum: false, steer: false });

  const toggleSkill = (s) => setSkills((prev) => ({ ...prev, [s]: !prev[s] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !weight) return;
    const skillsArr = Object.keys(skills).filter((k) => skills[k]);
    if (skillsArr.length === 0) {
      alert('Bitte mind. eine Rolle wählen');
      return;
    }
    onAdd({ name, weight: parseFloat(weight), skills: skillsArr });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Gast hinzufügen
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
            <input autoFocus className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={name} onChange={(e) => setName(e.target.value)} placeholder="Gast Name" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Gewicht (kg)</label>
            <input type="number" className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fähigkeiten</label>
            <div className="flex gap-2 flex-wrap">
              {['left', 'right', 'drum', 'steer'].map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded border text-sm capitalize ${skills[skill] ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                >
                  {skill === 'steer' ? 'Steuer' : skill === 'drum' ? 'Trommel' : skill}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Abbrechen</button>
            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Hinzufügen</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const OnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Willkommen an Bord!', desc: 'Dein neuer Assistent für die Drachenboot-Planung.', icon: <DragonLogo className="w-32 h-32 text-blue-600 dark:text-blue-400 mb-4" /> },
    { title: 'Team & Termine', desc: 'Verwalte Kader und Termine an einem Ort.', icon: <div className="flex gap-6 text-blue-600 dark:text-blue-400 mb-6 justify-center"><Users size={64} /><Calendar size={64} /></div> },
    { title: 'Smarte Planung', desc: 'Auto-Fill berechnet die beste Sitzordnung.', icon: <div className="flex gap-6 text-blue-600 dark:text-blue-400 mb-6 justify-center"><ShipWheel size={64} /><Wand2 size={64} /></div> },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center relative p-8">
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
          {steps[step].icon}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{steps[step].title}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{steps[step].desc}</p>
        </div>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 mt-6">
          {step === steps.length - 1 ? "Los geht's!" : 'Weiter'}
        </button>
      </div>
    </div>
  );
};

export const HelpModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Info size={20} className="text-blue-500" /> Hilfe</h2>
        <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
      </div>
      <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300">
        <section><h3 className="font-bold text-slate-900 dark:text-white mb-1">👋 Allgemein</h3><p>Verwalte dein Team und plane Bootsbesetzungen.</p></section>
        <section><h3 className="font-bold text-slate-900 dark:text-white mb-1">🛠 Tools</h3><p>Nutze den Slider für die Trimmung und den Zauberstab für Auto-Fill.</p></section>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Verstanden</button>
      </div>
    </div>
  </div>
);

export const ImprintModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500"><X size={20} /></button>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Impressum</h2>
      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
        <p>Jan Hartje<br />Hamburger Allee 6<br />30161 Hannover</p>
        <p>Email: info@janhartje.com</p>
      </div>
    </div>
  </div>
);

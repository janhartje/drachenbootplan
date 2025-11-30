import React from 'react';
import { ArrowRightLeft, User, Box, UserPlus, RefreshCw, Wand2, Camera, AlertCircle, RotateCcw, Target } from 'lucide-react';
import { BalanceBar, TrimBar } from './Stats';
import SeatBox from './SeatBox';
import DragonLogo from '../ui/DragonLogo';

const PlannerView = ({ 
  activeEvent, 
  activeEventTitle, 
  stats, 
  targetTrim, 
  setTargetTrim, 
  runAutoFill, 
  isSimulating, 
  activePaddlerPool, 
  handleExportImage, 
  isExporting, 
  clearBoat, 
  confirmClear, 
  handleAddCanister, 
  setShowGuestModal, 
  setSelectedPaddlerId, 
  assignments, 
  selectedPaddlerId, 
  getSkillBadges, 
  boatRef, 
  cgStats, 
  paddlers, 
  boatConfig, 
  rows, 
  handleSeatClick, 
  handleUnassign, 
  toggleLock, 
  lockedSeats 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        {/* Stats & Tools Panel */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ArrowRightLeft size={16} /> Balance & Schwerpunkt
          </h2>
          <BalanceBar left={stats.l} right={stats.r} diff={stats.diffLR} />
          <TrimBar front={stats.f} back={stats.b} diff={stats.diffFB} />

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Hecklastig</span>
              <span className="text-blue-600 dark:text-blue-400">Ziel: {targetTrim > 0 ? '+' : ''}{targetTrim} kg</span>
              <span>Buglastig</span>
            </div>
            <input type="range" min="-100" max="100" step="5" value={targetTrim} onChange={(e) => setTargetTrim(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>-100kg</span><span>0</span><span>+100kg</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={runAutoFill} disabled={isSimulating || activePaddlerPool.length === 0} className={`py-3 text-sm font-semibold rounded-lg border dark:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm ${isSimulating ? 'bg-indigo-50 text-indigo-400 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'} ${activePaddlerPool.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSimulating ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            </button>
            <button onClick={handleExportImage} className="py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2" title="Bild speichern">
              <Camera size={16} />
            </button>
            <button onClick={clearBoat} className={`py-3 text-sm rounded-lg border dark:border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95 ${confirmClear ? 'bg-red-500 text-white border-red-600 font-bold' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200'}`}>
              {confirmClear ? <AlertCircle size={16} /> : <RotateCcw size={16} />}
            </button>
          </div>
        </div>

        {/* Paddler Pool */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2"><User size={16} /> Verfügbar ({activePaddlerPool.length})</h2>
            <div className="flex gap-1">
              <button onClick={handleAddCanister} className="p-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded hover:bg-amber-100 border border-amber-200 dark:border-amber-800" title="Kanister +25kg"><Box size={14} /></button>
              <button onClick={() => setShowGuestModal(true)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1 text-xs font-bold" title="Gast hinzufügen"><UserPlus size={14} /> Gast+</button>
            </div>
          </div>
          {activePaddlerPool.length === 0 && <div className="text-center p-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">Keine Zusagen.</div>}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {activePaddlerPool.map((p) => {
              const isAssigned = Object.values(assignments).includes(p.id);
              const isSelected = selectedPaddlerId === p.id;
              const st = activeEvent ? activeEvent.attendance[p.id] : null;
              const isMaybe = st === 'maybe';
              return (
                <div key={p.id} onClick={() => setSelectedPaddlerId(isSelected ? null : p.id)} className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md transform scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'} ${isAssigned ? 'opacity-40 grayscale' : ''} ${isMaybe ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700' : ''}`}>
                  <div>
                    <div className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {p.name}
                      {isMaybe && <span className="text-xs opacity-70">(?)</span>}
                      {p.isCanister && <span className="text-xs opacity-70 ml-1">(Box)</span>}
                      {p.isGuest && <span className="text-xs opacity-70 ml-1">(Gast)</span>}
                    </div>
                    <div className={`text-sm mt-0.5 flex items-center gap-2 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}><span>{p.weight} kg</span></div>
                  </div>
                  {p.isCanister ? <Box size={16} className={isSelected ? 'text-white' : 'text-amber-500'} /> : getSkillBadges(p.skills)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Boat Visualization */}
      <div className="lg:col-span-2 pb-10">
        <div className="bg-blue-100/30 dark:bg-blue-900/20 p-4 md:p-8 rounded-3xl border border-blue-100 dark:border-blue-800 min-h-[800px] flex justify-center items-start overflow-y-auto relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #3b82f6 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          <div ref={boatRef} className="relative w-[360px] flex flex-col items-center">
            <div className="z-20 mb-[-15px] relative drop-shadow-xl filter" style={{ zIndex: 30 }}>
              <DragonLogo className="w-24 h-24 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="relative bg-amber-50 dark:bg-amber-900 border-4 border-amber-800 dark:border-amber-950 shadow-xl w-full px-4 py-12 z-10" style={{ clipPath: 'polygon(50% 0%, 80% 2%, 95% 10%, 100% 45%, 100% 55%, 95% 90%, 80% 98%, 50% 100%, 20% 98%, 5% 90%, 0% 55%, 0% 45%, 5% 10%, 20% 2%)', borderRadius: '40px' }}>
              
              {/* CG Dot */}
              <div className="absolute pointer-events-none z-0 transition-all duration-500 ease-out" style={{ left: `${cgStats.x}%`, top: `${cgStats.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="absolute w-px h-full bg-slate-300 left-1/2 top-0 -translate-x-1/2 opacity-30"></div>
                <div className="absolute w-full h-px bg-slate-300 top-1/2 left-0 -translate-y-1/2 opacity-30"></div>
                {!isExporting && (
                  <>
                    <div className="w-6 h-6 rounded-full bg-red-500/30 animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <Target size={10} className="text-white" />
                    </div>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase text-red-500 bg-white/80 px-1 rounded shadow-sm border border-red-100">Schwerpunkt</div>
                  </>
                )}
              </div>

              <div className="space-y-3 pt-6 pb-6 relative z-10">
                {/* Drummer */}
                <div className="flex justify-center mb-8">
                  {(() => {
                    const s = boatConfig[0];
                    const p = paddlers.find((x) => x.id === assignments[s.id]) || activeEvent?.guests?.find((g) => g.id === assignments[s.id]);
                    const isMaybe = activeEvent && activeEvent.attendance[p?.id] === 'maybe';
                    return <SeatBox seat={s} paddler={p} isMaybe={isMaybe} isLocked={lockedSeats.includes(s.id)} isSelected={selectedPaddlerId} onClick={() => handleSeatClick(s.id)} onUnassign={(e) => handleUnassign(s.id, e)} onLock={(e) => toggleLock(s.id, e)} getSkillBadges={getSkillBadges} hideWeight={isExporting} />;
                  })()}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, i) => {
                  const r = i + 1;
                  const ls = `row-${r}-left`, rs = `row-${r}-right`;
                  const pl = activePaddlerPool.find((x) => x.id === assignments[ls]) || paddlers.find((x) => x.id === assignments[ls]);
                  const pr = activePaddlerPool.find((x) => x.id === assignments[rs]) || paddlers.find((x) => x.id === assignments[rs]);
                  const ml = activeEvent && activeEvent.attendance[pl?.id] === 'maybe';
                  const mr = activeEvent && activeEvent.attendance[pr?.id] === 'maybe';
                  return (
                    <div key={r} className="flex items-center justify-between gap-2 relative">
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-900/10 dark:text-amber-100/10 text-4xl font-black pointer-events-none z-0 select-none">{r}</div>
                      <SeatBox seat={{ id: ls, side: 'left' }} paddler={pl} isMaybe={ml} isLocked={lockedSeats.includes(ls)} isSelected={selectedPaddlerId} onClick={() => handleSeatClick(ls)} onUnassign={(e) => handleUnassign(ls, e)} onLock={(e) => toggleLock(ls, e)} getSkillBadges={getSkillBadges} hideWeight={isExporting} />
                      <SeatBox seat={{ id: rs, side: 'right' }} paddler={pr} isMaybe={mr} isLocked={lockedSeats.includes(rs)} isSelected={selectedPaddlerId} onClick={() => handleSeatClick(rs)} onUnassign={(e) => handleUnassign(rs, e)} onLock={(e) => toggleLock(rs, e)} getSkillBadges={getSkillBadges} hideWeight={isExporting} />
                    </div>
                  );
                })}
                {/* Steer */}
                <div className="flex justify-center mt-10">
                  {(() => {
                    const s = boatConfig[boatConfig.length - 1];
                    const p = activePaddlerPool.find((x) => x.id === assignments[s.id]) || paddlers.find((x) => x.id === assignments[s.id]);
                    const isMaybe = activeEvent && activeEvent.attendance[p?.id] === 'maybe';
                    return <SeatBox seat={s} paddler={p} isMaybe={isMaybe} isLocked={lockedSeats.includes(s.id)} isSelected={selectedPaddlerId} onClick={() => handleSeatClick(s.id)} onUnassign={(e) => handleUnassign(s.id, e)} onLock={(e) => toggleLock(s.id, e)} getSkillBadges={getSkillBadges} hideWeight={isExporting} />;
                  })()}
                </div>
              </div>
            </div>
            <div className="text-5xl z-20 mt-[-30px] drop-shadow-lg transform -scale-y-100 filter grayscale-[0.3] relative text-amber-600 dark:text-amber-500" style={{ zIndex: 30 }}>🐉</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerView;

'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Info, Sun, Moon, ArrowLeft, Drum, ShipWheel, Home } from 'lucide-react';
import html2canvas from 'html2canvas';

// Utilities
import { db, seedInitialData } from '@/utils/storage';
import { runAutoFillAlgorithm } from '@/utils/algorithm';

// Components
import DragonLogo from './ui/DragonLogo';
import { AddGuestModal, OnboardingModal, HelpModal, ImprintModal } from './ui/Modals';
import TeamView from './drachenboot/TeamView';
import PlannerView from './drachenboot/PlannerView';

const DrachenbootPlaner = () => {
  // --- UI State ---
  const [view, setView] = useState('team');
  const [activeEventId, setActiveEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showImprint, setShowImprint] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const boatRef = useRef(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- DATEN STATE ---
  const [paddlers, setPaddlers] = useState([]);
  const [events, setEvents] = useState([]);
  const [assignmentsByEvent, setAssignmentsByEvent] = useState({});
  const [targetTrim, setTargetTrim] = useState(0);

  // Locked & Selection State
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedPaddlerId, setSelectedPaddlerId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Forms
  const [paddlerFormName, setPaddlerFormName] = useState('');
  const [paddlerFormWeight, setPaddlerFormWeight] = useState('');
  const [paddlerFormSkills, setPaddlerFormSkills] = useState({ left: false, right: false, drum: false, steer: false });
  const [editingPaddlerId, setEditingPaddlerId] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // --- INITIAL LOAD ---
  useEffect(() => {
    const data = db.load();
    if (data) {
      setPaddlers(data.paddlers || []);
      setEvents(data.events || []);
      setAssignmentsByEvent(data.assignmentsByEvent || {});
      if (data.darkMode !== undefined) setIsDarkMode(data.darkMode);
      if (data.targetTrim !== undefined) setTargetTrim(data.targetTrim);
    } else {
      const initial = seedInitialData();
      setPaddlers(initial.paddlers);
      setEvents(initial.events);
      setAssignmentsByEvent(initial.assignmentsByEvent);
    }
    setIsLoading(false);

    const hasSeenOnboarding = localStorage.getItem('drachenboot_onboarding_seen');
    if (!hasSeenOnboarding) setShowOnboarding(true);
    if (!data && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // --- SAVE EFFECTS ---
  useEffect(() => {
    if (!isLoading) db.save({ paddlers, events, assignmentsByEvent, darkMode: isDarkMode, targetTrim });
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [paddlers, events, assignmentsByEvent, isDarkMode, targetTrim, isLoading]);

  // --- HELPER & COMPUTED ---
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const closeOnboarding = () => {
    localStorage.setItem('drachenboot_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const currentContextId = activeEventId || 'global';
  const assignments = useMemo(() => assignmentsByEvent[currentContextId] || {}, [assignmentsByEvent, currentContextId]);
  
  const updateAssignments = useCallback((newAssignments) => {
    setAssignmentsByEvent((prev) => ({ ...prev, [currentContextId]: newAssignments }));
  }, [currentContextId]);

  const activeEvent = useMemo(() => events.find((e) => e.id === activeEventId), [activeEventId, events]);
  const activeEventTitle = activeEvent ? activeEvent.title : 'Sandbox';

  const activePaddlerPool = useMemo(() => {
    let pool = [];
    if (view === 'team') {
      pool = paddlers.filter((p) => !p.isCanister);
    } else if (activeEventId && activeEvent) {
      const regular = paddlers.filter((p) => !p.isCanister && ['yes', 'maybe'].includes(activeEvent.attendance[p.id]));
      const canisters = paddlers.filter((p) => p.isCanister);
      const guests = activeEvent.guests || [];
      pool = [...regular, ...canisters, ...guests];
    } else {
      pool = paddlers;
    }
    return pool.sort((a, b) => a.name.localeCompare(b.name));
  }, [paddlers, activeEventId, activeEvent, view]);

  const sortedPaddlers = useMemo(() => [...paddlers].filter((p) => !p.isCanister).sort((a, b) => a.name.localeCompare(b.name)), [paddlers]);

  // --- BADGES ---
  const getSkillBadges = (skills) => (
    <div className="flex gap-1 items-center justify-center">
      {skills?.includes('left') && <span className="w-5 h-4 flex items-center justify-center rounded border text-[9px] font-bold bg-red-50 text-red-600 border-red-100 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">L</span>}
      {skills?.includes('right') && <span className="w-5 h-4 flex items-center justify-center rounded border text-[9px] font-bold bg-green-50 text-green-600 border-green-100 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">R</span>}
      {skills?.includes('drum') && <span className="w-5 h-4 flex items-center justify-center rounded border text-[9px] font-bold bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800"><Drum size={10} /></span>}
      {skills?.includes('steer') && <span className="w-5 h-4 flex items-center justify-center rounded border text-[9px] font-bold bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800"><ShipWheel size={10} /></span>}
    </div>
  );

  // --- ACTIONS ---
  const toggleSkill = (skill) => setPaddlerFormSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  
  const resetPaddlerForm = () => {
    setEditingPaddlerId(null);
    setPaddlerFormName('');
    setPaddlerFormWeight('');
    setPaddlerFormSkills({ left: false, right: false, drum: false, steer: false });
  };

  const handleSavePaddler = (e) => {
    e.preventDefault();
    if (!paddlerFormName || !paddlerFormWeight) return;
    const skillsArray = Object.keys(paddlerFormSkills).filter((k) => paddlerFormSkills[k]);
    if (skillsArray.length === 0) { alert('Bitte eine Rolle wählen.'); return; }
    const pData = { name: paddlerFormName, weight: parseFloat(paddlerFormWeight), skills: skillsArray };
    if (editingPaddlerId) {
      setPaddlers((prev) => prev.map((p) => p.id === editingPaddlerId ? { ...p, ...pData } : p));
      setEditingPaddlerId(null);
    } else {
      setPaddlers((prev) => [...prev, { id: Date.now(), ...pData }]);
    }
    resetPaddlerForm();
  };

  const handleAddCanister = () => {
    const canisterId = 'canister-' + Date.now();
    const canister = { id: canisterId, name: 'Kanister', weight: 25, skills: ['left', 'right'], isCanister: true };
    setPaddlers((prev) => [...prev, canister]);
    setSelectedPaddlerId(canisterId);
  };

  const handleAddGuest = (guestData) => {
    const guestId = 'guest-' + Date.now();
    const newGuest = { ...guestData, id: guestId, isGuest: true };
    setEvents((prev) => prev.map((ev) => ev.id === activeEventId ? { ...ev, guests: [...(ev.guests || []), newGuest] } : ev));
    setSelectedPaddlerId(guestId);
  };

  const handleEditPaddler = (p) => {
    setEditingPaddlerId(p.id);
    setPaddlerFormName(p.name);
    setPaddlerFormWeight(p.weight);
    const sObj = { left: false, right: false, drum: false, steer: false };
    if (p.skills) p.skills.forEach((s) => sObj[s] = true);
    setPaddlerFormSkills(sObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerDelete = (id) => {
    if (deleteConfirmId === id) { handleDeletePaddler(id); setDeleteConfirmId(null); }
    else { setDeleteConfirmId(id); setTimeout(() => setDeleteConfirmId(null), 3000); }
  };

  const handleDeletePaddler = (id) => {
    if (id.toString().startsWith('guest-') && activeEvent) {
      setEvents((prev) => prev.map((ev) => ev.id === activeEventId ? { ...ev, guests: (ev.guests || []).filter((g) => g.id !== id) } : ev));
      const nAss = { ...assignments };
      const seat = Object.keys(nAss).find((k) => nAss[k] === id);
      if (seat) { delete nAss[seat]; updateAssignments(nAss); }
      return;
    }
    setAssignmentsByEvent((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => {
        const map = { ...next[eid] };
        let chg = false;
        Object.keys(map).forEach((s) => { if (map[s] === id) { delete map[s]; chg = true; } });
        if (chg) next[eid] = map;
      });
      return next;
    });
    setEvents((prev) => prev.map((ev) => { const att = { ...ev.attendance }; delete att[id]; return { ...ev, attendance: att }; }));
    setPaddlers((prev) => prev.filter((p) => p.id !== id));
    if (editingPaddlerId === id) resetPaddlerForm();
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const nid = Date.now();
    const ne = { id: nid, title: newEventTitle, date: newEventDate, type: 'training', attendance: {}, guests: [] };
    setEvents((prev) => [...prev, ne]);
    setAssignmentsByEvent((prev) => ({ ...prev, [nid]: {} }));
    setNewEventTitle('');
    setNewEventDate('');
  };

  const updateAttendance = (eid, pid, status) => {
    setEvents((prev) => prev.map((ev) => ev.id !== eid ? ev : { ...ev, attendance: { ...ev.attendance, [pid]: status } }));
  };

  const handlePlanEvent = (eid) => {
    setActiveEventId(eid);
    setView('planner');
    setLockedSeats([]);
    setSelectedPaddlerId(null);
    if (!assignmentsByEvent[eid]) setAssignmentsByEvent((prev) => ({ ...prev, [eid]: {} }));
  };

  const goHome = () => { setActiveEventId(null); setView('team'); };

  const handleExportImage = () => {
    if (!boatRef.current) return;
    setIsExporting(true);
    setTimeout(() => {
      html2canvas(boatRef.current, { backgroundColor: null, scale: 3, useCORS: true })
        .then((canvas) => {
          const link = document.createElement('a');
          link.download = `drachenboot-${activeEventTitle.replace(/\s+/g, '-')}.png`;
          link.href = canvas.toDataURL();
          link.click();
          setIsExporting(false);
        })
        .catch((err) => { console.error('Export failed', err); setIsExporting(false); });
    }, 150);
  };

  // --- BOAT CONFIG ---
  const rows = 10;
  const boatConfig = useMemo(() => {
    const s = [{ id: 'drummer', type: 'drummer' }];
    for (let i = 1; i <= rows; i++) { s.push({ id: `row-${i}-left`, type: 'paddler', side: 'left', row: i }); s.push({ id: `row-${i}-right`, type: 'paddler', side: 'right', row: i }); }
    s.push({ id: 'steer', type: 'steer' });
    return s;
  }, []);

  // --- STATS CALC ---
  const stats = useMemo(() => {
    let l = 0, r = 0, t = 0, f = 0, b = 0, c = 0;
    Object.entries(assignments).forEach(([sid, pid]) => {
      const p = activePaddlerPool.find((x) => x.id === pid) || paddlers.find((x) => x.id === pid);
      if (!p) return;
      t += p.weight; c++;
      if (sid.includes('row')) {
        if (sid.includes('left')) l += p.weight; else r += p.weight;
        const rw = parseInt(sid.match(/row-(\d+)/)[1]);
        if (rw <= 5) f += p.weight; else b += p.weight;
      }
    });
    return { l, r, t, diffLR: l - r, f, b, diffFB: f - b, c };
  }, [assignments, paddlers, activePaddlerPool]);

  const cgStats = useMemo(() => {
    let totalWeight = 0, weightedSumX = 0, weightedSumY = 0;
    Object.entries(assignments).forEach(([sid, pid]) => {
      const p = activePaddlerPool.find((x) => x.id === pid) || paddlers.find((x) => x.id === pid);
      if (!p) return;
      totalWeight += p.weight;
      let xPos = 50; if (sid.includes('left')) xPos = 25; else if (sid.includes('right')) xPos = 75;
      let yPos = 50; if (sid === 'drummer') yPos = 4; else if (sid === 'steer') yPos = 96; else if (sid.includes('row')) { const r = parseInt(sid.match(/row-(\d+)/)[1]); yPos = 12 + ((r - 1) / 9) * 70; }
      weightedSumX += p.weight * xPos; weightedSumY += p.weight * yPos;
    });
    const cgX = totalWeight > 0 ? weightedSumX / totalWeight : 50;
    const cgY = totalWeight > 0 ? weightedSumY / totalWeight : 50;
    return { x: cgX, y: cgY, targetY: 50 - targetTrim * 0.1 };
  }, [assignments, paddlers, targetTrim, activePaddlerPool]);

  // --- BOAT INTERACTIONS ---
  const handleSeatClick = (sid) => {
    if (lockedSeats.includes(sid)) return;
    if (selectedPaddlerId) {
      const nAss = { ...assignments };
      Object.keys(nAss).forEach((k) => { if (nAss[k] === selectedPaddlerId) delete nAss[k]; });
      nAss[sid] = selectedPaddlerId;
      updateAssignments(nAss);
      setSelectedPaddlerId(null);
    } else if (assignments[sid]) {
      setSelectedPaddlerId(assignments[sid]);
    }
  };

  const handleUnassign = (sid, e) => {
    e.stopPropagation();
    if (lockedSeats.includes(sid)) return;
    const paddlerId = assignments[sid];
    const paddler = activePaddlerPool.find((p) => p.id === paddlerId);
    const nAss = { ...assignments };
    delete nAss[sid];
    updateAssignments(nAss);
    if (paddler && paddler.isCanister) setPaddlers((prev) => prev.filter((p) => p.id !== paddlerId));
  };

  const toggleLock = (sid, e) => {
    e.stopPropagation();
    if (!assignments[sid]) return;
    setLockedSeats((prev) => prev.includes(sid) ? prev.filter((i) => i !== sid) : [...prev, sid]);
  };

  const clearBoat = () => {
    if (confirmClear) {
      const nAss = { ...assignments };
      Object.keys(nAss).forEach((s) => { if (!lockedSeats.includes(s)) delete nAss[s]; });
      updateAssignments(nAss);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const runAutoFill = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const bestAss = runAutoFillAlgorithm(activePaddlerPool, assignments, lockedSeats, targetTrim);
      if (bestAss) updateAssignments(bestAss);
      setIsSimulating(false);
    }, 50);
  };

  // --- RENDER ---
  return (
    <div className={`min-h-screen font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300 bg-slate-100 dark:bg-slate-950 p-2 md:p-4 pb-20 ${view === 'team' ? '' : ''}`}>
      {/* Global Modals */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showImprint && <ImprintModal onClose={() => setShowImprint(false)} />}
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
      {showGuestModal && <AddGuestModal onClose={() => setShowGuestModal(false)} onAdd={handleAddGuest} />}

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        {view === 'team' ? (
          <header className="mb-6 flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <DragonLogo className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              <div><h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Team Manager</h1><p className="text-xs text-slate-500 dark:text-slate-400">Kader & Termine</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowHelp(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><Info size={20} /></button>
              <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => setView('planner')} className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-lg font-medium flex items-center gap-2">Zum Boots-Planer</button>
            </div>
          </header>
        ) : (
          <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-0 z-30">
            <div>
              <div className="flex items-center gap-3">
                <button onClick={goHome} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"><Home size={20} /></button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <div className="flex items-center gap-2"><div className="text-blue-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div><span className="font-bold text-slate-800 dark:text-white text-sm">{activeEventTitle}</span></div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Planungsmodus</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-center px-2"><div className="text-[10px] text-slate-400 uppercase font-bold">Gesamt</div><div className="font-bold text-sm">{stats.t} kg</div></div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
              <div className="text-center px-2"><div className="text-[10px] text-slate-400 uppercase font-bold">Besetzt</div><div className="font-bold text-sm text-blue-600 dark:text-blue-400">{stats.c} / 22</div></div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-2"></div>
              <button onClick={() => setShowHelp(true)} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700"><Info size={18} /></button>
              <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
          </header>
        )}

        {/* CONTENT */}
        {view === 'team' ? (
          <TeamView 
            events={events}
            paddlers={paddlers}
            sortedPaddlers={sortedPaddlers}
            handleCreateEvent={handleCreateEvent}
            newEventTitle={newEventTitle}
            setNewEventTitle={setNewEventTitle}
            newEventDate={newEventDate}
            setNewEventDate={setNewEventDate}
            updateAttendance={updateAttendance}
            handlePlanEvent={handlePlanEvent}
            handleSavePaddler={handleSavePaddler}
            paddlerFormName={paddlerFormName}
            setPaddlerFormName={setPaddlerFormName}
            paddlerFormWeight={paddlerFormWeight}
            setPaddlerFormWeight={setPaddlerFormWeight}
            paddlerFormSkills={paddlerFormSkills}
            toggleSkill={toggleSkill}
            resetPaddlerForm={resetPaddlerForm}
            editingPaddlerId={editingPaddlerId}
            handleEditPaddler={handleEditPaddler}
            triggerDelete={triggerDelete}
            deleteConfirmId={deleteConfirmId}
            getSkillBadges={getSkillBadges}
          />
        ) : (
          <PlannerView 
            activeEvent={activeEvent}
            activeEventTitle={activeEventTitle}
            stats={stats}
            targetTrim={targetTrim}
            setTargetTrim={setTargetTrim}
            runAutoFill={runAutoFill}
            isSimulating={isSimulating}
            activePaddlerPool={activePaddlerPool}
            handleExportImage={handleExportImage}
            isExporting={isExporting}
            clearBoat={clearBoat}
            confirmClear={confirmClear}
            handleAddCanister={handleAddCanister}
            setShowGuestModal={setShowGuestModal}
            setSelectedPaddlerId={setSelectedPaddlerId}
            assignments={assignments}
            selectedPaddlerId={selectedPaddlerId}
            getSkillBadges={getSkillBadges}
            boatRef={boatRef}
            cgStats={cgStats}
            paddlers={paddlers}
            boatConfig={boatConfig}
            rows={rows}
            handleSeatClick={handleSeatClick}
            handleUnassign={handleUnassign}
            toggleLock={toggleLock}
            lockedSeats={lockedSeats}
          />
        )}

        {/* FOOTER (Only Team View) */}
        {view === 'team' && (
          <footer className="mt-20 pb-10 text-center text-xs text-slate-400">
            <button onClick={() => setShowImprint(true)} className="hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600">Impressum</button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DrachenbootPlaner;

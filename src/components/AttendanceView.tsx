import React, { useState } from 'react';
import { 
  Clock, Coffee, Play, Square, Video, Monitor, AlertTriangle, 
  CheckCircle, Plus, Sparkles, MapPin, Search, CalendarDays 
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../types';

interface AttendanceViewProps {
  employees: Employee[];
  companySettings: any;
  initialAttendanceList: AttendanceRecord[];
}

export default function AttendanceView({
  employees,
  companySettings,
  initialAttendanceList
}: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceList);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDate, setActiveDate] = useState('2026-06-19'); // Simulate active pay period date

  // Simulated active clock-in variables for logged-in user simulation
  const [myClockState, setMyClockState] = useState<'out' | 'in'>('out');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [manualClockForm, setManualClockForm] = useState({
    employeeId: '',
    clockIn: '08:00',
    clockOut: '17:00',
    workMode: 'Présentiel' as AttendanceRecord['workMode'],
    isAbsent: false,
    absentReason: ''
  });

  // Toggle/register personal simulation clocking
  const handleMyClockToggle = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (myClockState === 'out') {
      setMyClockState('in');
      setClockInTime(timeStr);
      
      // Add record to list for emp-01 (Jean Dupont)
      const newRec: AttendanceRecord = {
        id: `att-sim-${Date.now()}`,
        employeeId: 'emp-01',
        employeeName: 'Jean Dupont',
        date: new Date().toISOString().split('T')[0],
        clockIn: timeStr,
        totalHours: 0,
        overtimeHours: 0,
        delayMinutes: now.getHours() > 8 ? (now.getHours() - 8) * 60 + now.getMinutes() : 0,
        isAbsent: false,
        workMode: 'Présentiel'
      };
      setAttendance(prev => [newRec, ...prev]);
    } else {
      setMyClockState('out');
      // Update the record with clock-out
      setAttendance(prev => prev.map(rec => {
        if (rec.employeeId === 'emp-01' && rec.date === new Date().toISOString().split('T')[0]) {
          return {
            ...rec,
            clockOut: timeStr,
            totalHours: 8.5,
            overtimeHours: 0.5
          };
        }
        return rec;
      }));
    }
  };

  // Admin manually adds attendance logs
  const handleAdminAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClockForm.employeeId) return;

    const matched = employees.find(emp => emp.id === manualClockForm.employeeId);
    if (!matched) return;

    // Calculate total hours
    const inH = parseInt(manualClockForm.clockIn.split(':')[0]) || 0;
    const inM = parseInt(manualClockForm.clockIn.split(':')[1]) || 0;
    const outH = parseInt(manualClockForm.clockOut.split(':')[0]) || 0;
    const outM = parseInt(manualClockForm.clockOut.split(':')[1]) || 0;

    let totHours = (outH - inH) + (outM - inM) / 60;
    if (totHours < 0) totHours = 0;
    const overHours = totHours > 8 ? totHours - 8 : 0;
    const delays = (inH > 8 || (inH === 8 && inM > 0)) ? (inH - 8) * 60 + inM : 0;

    const added: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: manualClockForm.employeeId,
      employeeName: `${matched.firstName} ${matched.lastName}`,
      date: activeDate,
      clockIn: manualClockForm.isAbsent ? undefined : manualClockForm.clockIn,
      clockOut: manualClockForm.isAbsent ? undefined : manualClockForm.clockOut,
      totalHours: manualClockForm.isAbsent ? 0 : totHours,
      overtimeHours: manualClockForm.isAbsent ? 0 : overHours,
      delayMinutes: manualClockForm.isAbsent ? 0 : delays,
      isAbsent: manualClockForm.isAbsent,
      absentReason: manualClockForm.isAbsent ? manualClockForm.absentReason : undefined,
      workMode: manualClockForm.workMode
    };

    setAttendance(prev => [added, ...prev]);
    alert(`Pointage enregistré avec succès pour ${matched.firstName} ${matched.lastName}.`);
    setManualClockForm({
      employeeId: '',
      clockIn: '08:00',
      clockOut: '17:00',
      workMode: 'Présentiel',
      isAbsent: false,
      absentReason: ''
    });
  };

  // Helper counters
  const totalOvertimeThisPeriod = attendance.reduce((sum, r) => sum + r.overtimeHours, 0);
  const totalDelayMinutesThisPeriod = attendance.reduce((sum, r) => sum + r.delayMinutes, 0);
  const absenteeismCount = attendance.filter(r => r.isAbsent).length;
  const presenceCount = attendance.filter(r => !r.isAbsent && r.clockIn).length;
  const presenceRate = attendance.length > 0 ? ((presenceCount / (attendance.length)) * 100).toFixed(1) : "100";

  // Filter attendance record array based on search input
  const filteredAttendance = attendance.filter(att => 
    att.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    att.workMode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] bg-purple-50 text-purple-700 py-1 px-3 rounded-full font-black uppercase tracking-widest">TEMPS & PRÉSENCE</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">Pointage, Heures Sup & Retards</h1>
          <p className="text-xs text-slate-400 mt-0.5">Assurez la traçabilité des horaires réels de travail pour alimenter automatiquement vos bulletins de paie.</p>
        </div>

        {/* Live Personal Clocking Simulator */}
        <div className="bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 p-3 rounded-2xl flex items-center gap-3 transition">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Simuler mon Pointage (Jean Dupont)</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-slate-700 font-mono">
                {myClockState === 'in' ? `Inscrit à ${clockInTime}` : 'Déconnecté'}
              </span>
              <button
                onClick={handleMyClockToggle}
                className={`py-1 px-3 rounded-lg text-[9px] font-black cursor-pointer transition uppercase tracking-widest flex items-center gap-1 shadow-sm ${
                  myClockState === 'in' 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {myClockState === 'in' ? (
                  <>
                    <Square size={10} />
                    <span>Pointer Sortie</span>
                  </>
                ) : (
                  <>
                    <Play size={10} className="fill-white" />
                    <span>Pointer Entrée</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl">
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Taux de Présence</p>
              <h4 className="text-lg font-black text-slate-800 mt-0.5">{presenceRate}%</h4>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl">
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Heures Sup</p>
              <h4 className="text-lg font-black text-slate-800 mt-0.5">+{totalOvertimeThisPeriod.toFixed(1)} h</h4>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl">
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Temps de Retard Cumulative</p>
              <h4 className="text-lg font-black text-slate-800 mt-0.5">{totalDelayMinutesThisPeriod} min</h4>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl">
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Absences constatées</p>
              <h4 className="text-lg font-black text-slate-800 mt-0.5">{absenteeismCount} cas</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADMIN CLOCKING SOURCER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-fit">
          <h3 className="font-extrabold text-xs tracking-tight text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus size={15} className="text-indigo-600" />
            <span>Saisir un Pointage (Admin)</span>
          </h3>

          <form onSubmit={handleAdminAddAttendance} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Collaborateur</label>
              <select
                required
                value={manualClockForm.employeeId}
                onChange={(e) => setManualClockForm(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">Sélectionner...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date du pointage</label>
                <input
                  type="date"
                  value={activeDate}
                  onChange={(e) => setActiveDate(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mode d'activité</label>
                <select
                  value={manualClockForm.workMode}
                  onChange={(e) => setManualClockForm(prev => ({ ...prev, workMode: e.target.value as any }))}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Présentiel">🏢 Présentiel</option>
                  <option value="Télétravail">🏠 Télétravail</option>
                  <option value="Hybride">🚗 Hybride Partiel</option>
                </select>
              </div>
            </div>

            {/* Absent checklist toggle */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
              <input
                type="checkbox"
                id="checkbox_is_absent"
                checked={manualClockForm.isAbsent}
                onChange={(e) => setManualClockForm(prev => ({ ...prev, isAbsent: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="checkbox_is_absent" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                Déclarer comme absent ce jour
              </label>
            </div>

            {!manualClockForm.isAbsent ? (
              <div className="grid grid-cols-2 gap-2 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entrée réelle</label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={manualClockForm.clockIn}
                    onChange={(e) => setManualClockForm(prev => ({ ...prev, clockIn: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sortie réelle</label>
                  <input
                    type="text"
                    placeholder="17:00"
                    value={manualClockForm.clockOut}
                    onChange={(e) => setManualClockForm(prev => ({ ...prev, clockOut: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Justificatif de l'absence</label>
                <input
                  type="text"
                  placeholder="Ex: Certificat médical de maladie, Arrêt maladie"
                  value={manualClockForm.absentReason}
                  onChange={(e) => setManualClockForm(prev => ({ ...prev, absentReason: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
            >
              Enregistrer le pointage
            </button>
          </form>
        </div>

        {/* LOGS LIST TRACKER */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-150 rounded-2xl p-4.5 flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Pointages de la période : {activeDate}</h3>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl">
              <Search size={13} className="text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher collaborateur, mode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-[11px] font-semibold text-slate-600 bg-transparent focus:outline-none w-[170px]"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden font-sans text-xs">
            <div className="bg-slate-50 border-b border-slate-150 py-3 px-4 text-[10px] font-black uppercase text-slate-500 tracking-wider grid grid-cols-12">
              <div className="col-span-3">Collaborateur</div>
              <div className="col-span-2">Mode activité</div>
              <div className="col-span-3">Pointages (In / Out)</div>
              <div className="col-span-2 text-right">Heures réelles</div>
              <div className="col-span-2 text-right">Écarts / Retards</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAttendance.map((rec) => (
                <div key={rec.id} className="py-3 px-4 font-semibold text-slate-700 hover:bg-slate-50 transition grid grid-cols-12 items-center">
                  <div className="col-span-3">
                    <p className="font-extrabold text-slate-800">{rec.employeeName}</p>
                    <span className="text-[9px] text-slate-400 font-mono">{rec.date}</span>
                  </div>

                  <div className="col-span-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      rec.workMode === 'Présentiel' ? 'bg-slate-100 text-slate-700' :
                      rec.workMode === 'Télétravail' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {rec.workMode}
                    </span>
                  </div>

                  <div className="col-span-3 font-mono text-[11px] font-bold">
                    {rec.isAbsent ? (
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-sm uppercase text-[9px] tracking-tight">
                        ❌ Absent ({rec.absentReason || 'Non justifié'})
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">{rec.clockIn || '--:--'}</span>
                        <span className="text-slate-300">→</span>
                        <span className={rec.clockOut ? 'text-slate-750' : 'text-slate-400 font-bold'}>{rec.clockOut || 'En cours...'}</span>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 text-right font-mono font-black text-slate-800 text-[11px]">
                    {rec.isAbsent ? '0.0 h' : `${rec.totalHours.toFixed(1)} h`}
                  </div>

                  <div className="col-span-2 text-right font-mono text-[10px]">
                    {!rec.isAbsent && rec.overtimeHours > 0 && (
                      <span className="text-indigo-600 block font-bold">+{rec.overtimeHours.toFixed(1)}h Sup</span>
                    )}
                    {!rec.isAbsent && rec.delayMinutes > 0 && (
                      <span className="text-orange-600 block font-bold">-{rec.delayMinutes} min Retard</span>
                    )}
                    {!rec.isAbsent && rec.delayMinutes === 0 && rec.overtimeHours === 0 && (
                      <span className="text-emerald-600 block font-bold">Conforme ✔</span>
                    )}
                    {rec.isAbsent && (
                      <span className="text-slate-450 block text-[9px] tracking-wide font-black">ABSENCE</span>
                    )}
                  </div>
                </div>
              ))}

              {filteredAttendance.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50">
                  Aucun pointage recensé pour cette sélection.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

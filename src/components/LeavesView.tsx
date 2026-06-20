import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, HelpCircle, Check, X, Plus, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Employee, LeaveRequest } from '../types';

interface LeavesViewProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeaveRequest: (request: LeaveRequest) => void;
}

export default function LeavesView({
  employees,
  leaves,
  onApproveLeave,
  onRejectLeave,
  onAddLeaveRequest,
}: LeavesViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const activeStaff = employees.filter(e => e.status === 'Actif');

  // Group leaves by status
  const pendingLeaves = leaves.filter(l => l.status === 'En attente');
  const pastLeaves = leaves.filter(l => l.status !== 'En attente');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !startDate || !endDate || !reason) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const employeeObj = employees.find(e => e.id === selectedEmployeeId);
    if (!employeeObj) return;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: employeeObj.id,
      employeeName: `${employeeObj.firstName} ${employeeObj.lastName}`,
      position: employeeObj.position,
      startDate,
      endDate,
      reason,
      status: 'En attente',
      requestDate: new Date().toISOString().split('T')[0],
    };

    onAddLeaveRequest(newRequest);

    // reset fields
    setSelectedEmployeeId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsFormOpen(false);
  };

  return (
    <div id="leaves_view_wrapper" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 font-display">
            <Calendar className="text-orange-600 shrink-0" size={18} />
            <span>Gestion des Congés & Absences</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Suivez, planifiez et pilotez les vacances des équipes.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-100"
        >
          <Plus size={16} />
          <span>Demander un congé</span>
        </button>
      </div>

      {/* Leave request form expansion */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-orange-100 rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden space-y-4"
          >
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-850">
              Formulaire de Demande d'Absence
            </h4>
            
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Employé demandeur *</label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Choisir --</option>
                  {activeStaff.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Date d'effet (Du) *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Date de fin (Au) *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs rounded-xl transition cursor-pointer shadow-md shadow-orange-100 uppercase tracking-widest"
                >
                  Soumettre
                </button>
              </div>

              <div className="md:col-span-4">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Motif de l'absence / Description *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Vacances annuelles à Grand-Bassam, Mission, Permissions exceptionnelles parentales..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Pending Actions list */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Demandes en attente d'approbation</h4>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              {pendingLeaves.length} Active(s)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic space-y-1">
                <p>Aucune demande de congé en attente.</p>
                <p className="text-[10px]">Toutes les absences déclarées ont été arbitrées par les RH.</p>
              </div>
            ) : (
              pendingLeaves.map(leave => (
                <div key={leave.id} className="p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{leave.employeeName}</h5>
                      <p className="text-xs text-slate-500">{leave.position}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Inscrit le {leave.requestDate}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-orange-850">Du {leave.startDate} au {leave.endDate}</p>
                    <p className="text-slate-600 mt-1 italic">"{leave.reason}"</p>
                  </div>

                  {/* Actions Approver / Refuser */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onRejectLeave(leave.id)}
                      className="py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <X size={12} />
                      <span>Refuser</span>
                    </button>
                    <button
                      onClick={() => onApproveLeave(leave.id)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check size={12} />
                      <span>Approuver</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Historical Leaves approved or refused */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-150 bg-slate-50/50">
            <h4 className="text-sm font-bold text-slate-800">Historique des arbitrages récents</h4>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {pastLeaves.length === 0 ? (
              <p className="p-8 text-center text-slate-450 text-xs italic">Aucun arbitrage passé.</p>
            ) : (
              pastLeaves.map(leave => (
                <div key={leave.id} className="p-4 text-xs flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">{leave.employeeName}</p>
                    <p className="text-slate-400 text-[10px] truncate max-w-[200px]">{leave.reason}</p>
                    <p className="text-slate-500 font-bold font-mono text-[10px]">Du {leave.startDate} au {leave.endDate}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                    leave.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {leave.status === 'Approuvé' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

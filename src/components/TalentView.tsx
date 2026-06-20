import React, { useState } from 'react';
import { 
  Briefcase, Star, CheckSquare, Plus, Trash2, ArrowUpRight, 
  UserCheck, Send, ClipboardList, Filter, Award, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { Candidate, OnboardingTask, PerformanceReview, Employee } from '../types';
import { formatCurrency } from '../utils/calculator';

interface TalentViewProps {
  employees: Employee[];
  companySettings: any;
  onAddEmployee: (newEmp: Employee) => void;
  // Let's hold state locally but init with imported data
  initialCandidatesList: Candidate[];
  initialOnboardingTaskList: OnboardingTask[];
  initialPerformanceReviewList: PerformanceReview[];
}

export default function TalentView({
  employees,
  companySettings,
  onAddEmployee,
  initialCandidatesList,
  initialOnboardingTaskList,
  initialPerformanceReviewList
}: TalentViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'recruitment' | 'onboarding' | 'performance'>('recruitment');
  
  // State lists
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidatesList);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(initialOnboardingTaskList);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviewList);

  // States for modals/forms
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCand, setNewCand] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: 'Technologie',
    applyDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: '',
    score: 5,
    strengths: '',
    weakPoints: '',
    developmentPlan: ''
  });

  const [onboardingInput, setOnboardingInput] = useState({
    employeeName: '',
    taskName: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });

  // Filters
  const [candFilter, setCandFilter] = useState<string>('Tous');

  // Candidate Status update
  const handleUpdateCandStatus = (candId: string, newStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, status: newStatus } : c));
  };

  // Convert Candidate to Employee (Hire Action)
  const handleHireCandidate = (cand: Candidate) => {
    // Generate new employee structure from recruitment info
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      lastName: cand.name.split(' ')[1] || cand.name,
      firstName: cand.name.split(' ')[0] || '',
      email: cand.email,
      phone: cand.phone,
      position: cand.position,
      department: cand.department,
      hireDate: new Date().toISOString().split('T')[0],
      baseSalary: cand.position.toLowerCase().includes('senior') ? 600000 : 380000,
      bankAccountNumber: `${companySettings.country === 'Cameroun' ? 'CMR' : 'CIV'}-10023-00045-88${Math.floor(100000000 + Math.random() * 900000000)}-45`,
      paymentMethod: 'Banque',
      status: 'Actif',
      address: 'Lieu de recrutement Jefara',
      city: companySettings.country === 'Cameroun' ? 'Douala' : 'Dakar',
      nationality: 'Nationale',
      emergencyContactName: 'RH Jefara',
      emergencyContactPhone: cand.phone,
      emergencyContactRelation: 'Employeur'
    };

    onAddEmployee(newEmp);
    
    // Update candidate status to 'Onboarding'
    handleUpdateCandStatus(cand.id, 'Onboarding');
    
    // Auto seed core onboarding tasks for this new Employee hire
    const tasks: OnboardingTask[] = [
      {
        id: `otask-${Date.now()}-1`,
        employeeId: newEmp.id,
        employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
        taskName: `Briefer ${newEmp.firstName} sur son poste de ${newEmp.position}`,
        status: 'À faire',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        assignedTo: 'Marie Koffi'
      },
      {
        id: `otask-${Date.now()}-2`,
        employeeId: newEmp.id,
        employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
        taskName: "Configurer l'adresse e-mail professionnelle & Slack",
        status: 'À faire',
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
        assignedTo: 'Eric Mbah'
      },
      {
        id: `otask-${Date.now()}-3`,
        employeeId: newEmp.id,
        employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
        taskName: "Signer le contrat de travail électronique Jefara CDI",
        status: 'À faire',
        dueDate: new Date(Date.now()).toISOString().split('T')[0],
        assignedTo: 'Marie Koffi'
      }
    ];

    setOnboardingTasks(prev => [...tasks, ...prev]);
    alert(`🎉 Félicitations ! ${cand.name} a été embauché(e) avec succès comme "${newEmp.position}" et ajouté(e) au registre du personnel Jefara SARL. Des tâches d'onboarding ont été créées.`);
  };

  // Submit new candidate
  const handleAddCandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCand.name || !newCand.email) return;

    const added: Candidate = {
      id: `cand-${Date.now()}`,
      name: newCand.name,
      email: newCand.email,
      phone: newCand.phone,
      position: newCand.position,
      department: newCand.department,
      status: 'Reçu',
      applyDate: newCand.applyDate,
      notes: newCand.notes
    };

    setCandidates(prev => [added, ...prev]);
    setNewCand({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: 'Technologie',
      applyDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddCandidate(false);
  };

  // Toggle onboarding task
  const handleToggleOnboarding = (taskId: string) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus: OnboardingTask['status'] = t.status === 'À faire' ? 'En cours' : t.status === 'En cours' ? 'Terminé' : 'À faire';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Quick Onboarding Add
  const handleQuickOnboardingAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingInput.employeeName || !onboardingInput.taskName) return;

    const newTask: OnboardingTask = {
      id: `ot-${Date.now()}`,
      employeeId: `emp-generic-${Date.now()}`,
      employeeName: onboardingInput.employeeName,
      taskName: onboardingInput.taskName,
      status: 'À faire',
      dueDate: onboardingInput.dueDate,
      assignedTo: onboardingInput.assignedTo || 'Marie Koffi'
    };

    setOnboardingTasks(prev => [newTask, ...prev]);
    setOnboardingInput({
      employeeName: '',
      taskName: '',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: ''
    });
  };

  // Add Performance Review
  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.employeeId) return;

    const matched = employees.find(e => e.id === newReview.employeeId);
    if (!matched) return;

    const created: PerformanceReview = {
      id: `rev-${Date.now()}`,
      employeeId: newReview.employeeId,
      employeeName: `${matched.firstName} ${matched.lastName}`,
      reviewerName: 'Marie Koffi (DRH)',
      reviewDate: new Date().toISOString().split('T')[0],
      score: newReview.score,
      strengths: newReview.strengths,
      weakPoints: newReview.weakPoints,
      developmentPlan: newReview.developmentPlan,
      status: 'Complété'
    };

    setPerformanceReviews(prev => [created, ...prev]);
    setNewReview({
      employeeId: '',
      score: 5,
      strengths: '',
      weakPoints: '',
      developmentPlan: ''
    });
    setShowAddReview(false);
    alert('Évaluation de performance enregistrée avec succès.');
  };

  const filteredCandidates = candFilter === 'Tous' 
    ? candidates 
    : candidates.filter(c => c.status === candFilter);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full font-black uppercase tracking-widest">MODULE RH</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">Recrutement & Gestion des Talents</h1>
          <p className="text-xs text-slate-400 mt-1">Gérez le cycle de vie de vos collaborateurs, du sourcing à l'évaluation annuelle de performance.</p>
        </div>

        {/* Action button */}
        {activeSubTab === 'recruitment' && (
          <button
            onClick={() => setShowAddCandidate(true)}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition uppercase tracking-wider"
          >
            <Plus size={15} />
            <span>Saisir Candidat</span>
          </button>
        )}

        {activeSubTab === 'performance' && (
          <button
            onClick={() => setShowAddReview(true)}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition uppercase tracking-wider"
          >
            <Plus size={15} />
            <span>Lancer Evaluation</span>
          </button>
        )}
      </div>

      {/* Sub tabs navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('recruitment')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeSubTab === 'recruitment' ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Sourcing & Séquence Candidat ({candidates.filter(c => c.status !== 'Onboarding').length})
        </button>
        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeSubTab === 'onboarding' ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Checklists d'Intégration (Onboarding)
        </button>
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeSubTab === 'performance' ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Évaluations de Performance
        </button>
      </div>

      {/*************************
       * TAB 1: RECRUITMENT & SOURCING
       *************************/}
      {activeSubTab === 'recruitment' && (
        <div className="space-y-4">
          {/* Sourcing filter bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2">Filtrer par statut :</span>
            {['Tous', 'Reçu', 'Entretien', 'Accepté', 'Rejeté', 'Onboarding'].map((st) => (
              <button
                key={st}
                onClick={() => setCandFilter(st)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold cursor-pointer transition uppercase tracking-wider border ${
                  candFilter === st 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sourcing grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div key={cand.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-tight">{cand.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400">{cand.applyDate}</p>
                    </div>
                    <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                      cand.status === 'Reçu' ? 'bg-indigo-50 text-indigo-700' :
                      cand.status === 'Entretien' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                      cand.status === 'Accepté' ? 'bg-emerald-50 text-emerald-700' :
                      cand.status === 'Onboarding' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-55 text-slate-400'
                    }`}>
                      {cand.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-650 mb-4 border-b border-slate-100 pb-3">
                    <p className="flex justify-between font-semibold"><span className="text-slate-400">Poste :</span> <span className="font-bold text-slate-700">{cand.position}</span></p>
                    <p className="flex justify-between font-semibold"><span className="text-slate-400">Département :</span> <span>{cand.department}</span></p>
                    <p className="flex justify-between font-semibold"><span className="text-slate-400">Téléphone :</span> <span className="font-mono text-slate-600">{cand.phone}</span></p>
                    <p className="flex justify-between font-semibold"><span className="text-slate-400">Mail :</span> <span>{cand.email}</span></p>
                  </div>

                  {cand.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-xl mb-4">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Commentaires RH :</p>
                      <p className="text-[11px] text-slate-550 italic">"{cand.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Actions area based on candidate workflow */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {cand.status === 'Reçu' && (
                      <button
                        onClick={() => handleUpdateCandStatus(cand.id, 'Entretien')}
                        className="py-1 px-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-lg cursor-pointer transition"
                      >
                        Planifier Entretien
                      </button>
                    )}
                    {cand.status === 'Entretien' && (
                      <>
                        <button
                          onClick={() => handleUpdateCandStatus(cand.id, 'Accepté')}
                          className="py-1 px-2.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg cursor-pointer transition"
                        >
                          Accepter l'offre
                        </button>
                        <button
                          onClick={() => handleUpdateCandStatus(cand.id, 'Rejeté')}
                          className="py-1 px-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-lg cursor-pointer transition"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    {cand.status === 'Accepté' && (
                      <button
                        onClick={() => handleHireCandidate(cand)}
                        className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Plus size={11} />
                        <span>Créer Fiche d'Embauche Jefara</span>
                      </button>
                    )}
                  </div>
                  {cand.status === 'Onboarding' && (
                    <span className="text-[10px] font-bold text-slate-400 italic flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Hired (Actif)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-slate-400 font-bold border rounded-2xl bg-slate-50/40">
                Aucun candidat dans ce pipeline de recrutement.
              </div>
            )}
          </div>
        </div>
      )}

      {/*************************
       * TAB 2: INTEGATION & ONBOARDING
       *************************/}
      {activeSubTab === 'onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add quick task form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-fit">
            <h3 className="font-extrabold text-sm tracking-tight text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList size={16} className="text-indigo-600" />
              <span>Saisir une tâche d'Onboarding</span>
            </h3>

            <form onSubmit={handleQuickOnboardingAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Collaborateur visé</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Koffi Serge ou Jean Dupont"
                  value={onboardingInput.employeeName}
                  onChange={(e) => setOnboardingInput(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Libellé de la tâche d'Intégration</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Remettre PC de service ou Signer CDI"
                  value={onboardingInput.taskName}
                  onChange={(e) => setOnboardingInput(prev => ({ ...prev, taskName: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Échéance</label>
                  <input
                    type="date"
                    value={onboardingInput.dueDate}
                    onChange={(e) => setOnboardingInput(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigné à (RH)</label>
                  <input
                    type="text"
                    placeholder="Ex: Marie Koffi"
                    value={onboardingInput.assignedTo}
                    onChange={(e) => setOnboardingInput(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer uppercase tracking-wider"
              >
                Créer la tâche
              </button>
            </form>
          </div>

          {/* Onboarding Checklist Tracker */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden font-sans text-xs">
              <div className="bg-slate-50 border-b border-slate-150 py-3 px-4 text-[10px] font-black uppercase text-slate-500 tracking-wider grid grid-cols-12">
                <div className="col-span-4">Collaborateur</div>
                <div className="col-span-4">Tâche d'Intégration</div>
                <div className="col-span-2">Assigné par</div>
                <div className="col-span-2 text-right">Statut / Échéance</div>
              </div>

              <div className="divide-y divide-slate-100">
                {onboardingTasks.map((task) => (
                  <div key={task.id} className="py-3 px-4 font-semibold text-slate-700 hover:bg-slate-50 transition grid grid-cols-12 items-center">
                    <div className="col-span-4 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-[30px] rounded-full bg-indigo-500" />
                      <div>
                        <p>{task.employeeName}</p>
                        <span className="text-[10px] text-indigo-400 bg-indigo-50/50 py-0.2 px-1.5 rounded-sm font-bold">Onboarding</span>
                      </div>
                    </div>

                    <div className="col-span-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.status === 'Terminé'}
                        onChange={() => handleToggleOnboarding(task.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-[11px] ${task.status === 'Terminé' ? 'line-through text-slate-400 font-medium' : 'text-slate-600'}`}>
                        {task.taskName}
                      </span>
                    </div>

                    <div className="col-span-2 text-slate-500 font-semibold">{task.assignedTo}</div>

                    <div className="col-span-2 text-right">
                      <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                        task.status === 'À faire' ? 'bg-rose-50 text-rose-700' :
                        task.status === 'En cours' ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {task.status}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1 font-mono">{task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*************************
       * TAB 3: PERFORMANCE RATINGS
       *************************/}
      {activeSubTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceReviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200/70 rounded-2xl p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{rev.employeeName}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Évalué par : {rev.reviewerName} le {rev.reviewDate}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rev.score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-650" /> Point Forts
                  </p>
                  <p className="text-slate-650 text-[11px] leading-relaxed italic">"{rev.strengths}"</p>
                </div>

                {rev.weakPoints && (
                  <div>
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-rose-650" /> Axes d'Amélioration
                    </span>
                    <p className="text-slate-650 text-[11px] leading-relaxed italic">"{rev.weakPoints}"</p>
                  </div>
                )}

                {rev.developmentPlan && (
                  <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/40">
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Award size={11} /> Plan de formation & d'évolution
                    </span>
                    <p className="text-slate-600 text-[11.5px] font-semibold mt-0.5">{rev.developmentPlan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/*************************
       * MODAL 1: ADD CANDIDATE
       *************************/}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-200 flex flex-col justify-between max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm tracking-tight text-slate-800 uppercase tracking-wide">Inscrire une Candidature</h3>
              <button onClick={() => setShowAddCandidate(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <form onSubmit={handleAddCandSubmit} className="space-y-4 py-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abdoulaye Diop"
                  value={newCand.name}
                  onChange={(e) => setNewCand(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: abdoulaye@gmail.com"
                    value={newCand.email}
                    onChange={(e) => setNewCand(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="Ex: +221 77..."
                    value={newCand.phone}
                    onChange={(e) => setNewCand(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Poste ciblé</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Développeur PHP / Directeur Artistique"
                  value={newCand.position}
                  onChange={(e) => setNewCand(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Département</label>
                  <select
                    value={newCand.department}
                    onChange={(e) => setNewCand(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Technologie">Technologie</option>
                    <option value="Finance">Finance</option>
                    <option value="Ressources Humaines">RH</option>
                    <option value="Ventes">Ventes</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    value={newCand.applyDate}
                    onChange={(e) => setNewCand(prev => ({ ...prev, applyDate: e.target.value }))}
                    className="w-full bg-slate-55 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes additionnelles</label>
                <textarea
                  rows={2}
                  placeholder="Ex: CV validé par la tech, entretien à programmer..."
                  value={newCand.notes}
                  onChange={(e) => setNewCand(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer uppercase tracking-wide"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*************************
       * MODAL 2: ADD REVIEW
       *************************/}
      {showAddReview && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-200 flex flex-col justify-between max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm tracking-tight text-slate-800 uppercase tracking-wide">Rédiger une Évaluation</h3>
              <button onClick={() => setShowAddReview(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4 py-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sélectionner l'Employé</label>
                <select
                  required
                  value={newReview.employeeId}
                  onChange={(e) => setNewReview(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">Sélectionner...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Note globale (Étoiles)</label>
                <div className="flex items-center gap-1 shadow-inner p-2 rounded-xl bg-slate-50 w-fit">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewReview(prev => ({ ...prev, score: st }))}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={st <= newReview.score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points forts constatés</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Rédigez les accomplissements majeurs et forces de cette période..."
                  value={newReview.strengths}
                  onChange={(e) => setNewReview(prev => ({ ...prev, strengths: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Axes d'amélioration</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Gestion du temps, compétences rédactionnelles..."
                  value={newReview.weakPoints}
                  onChange={(e) => setNewReview(prev => ({ ...prev, weakPoints: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan de formation & de développement</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Financer une certification AWS, formation management..."
                  value={newReview.developmentPlan}
                  onChange={(e) => setNewReview(prev => ({ ...prev, developmentPlan: e.target.value }))}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReview(false)}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer uppercase tracking-wide"
                >
                  Valider l'Évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

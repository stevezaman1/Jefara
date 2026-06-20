import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShieldCheck, HeartPulse, HelpCircle, Calendar, CreditCard, Clock, 
  FileDown, Plus, CheckCircle2, TrendingUp, HandCoins, LogOut, ArrowRight, 
  Activity, Briefcase, FileText, ChevronRight, AlertCircle, ShieldPlus, 
  Receipt, PlaneTakeoff, Inbox, Building2
} from 'lucide-react';
import { Employee, CompanySettings, PayslipHistoryItem, LeaveRequest, WageAdvance, EmployeeCredit, InsuranceSubscription, ExpenseClaim, ProfileUpdateRequest } from '../types';
import { calculatePayroll, formatCurrency } from '../utils/calculator';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { ShieldAlert, Sparkles, UserCog } from 'lucide-react';

interface EmployeePortalViewProps {
  currentUser: Employee;
  companySettings: CompanySettings;
  payslips: PayslipHistoryItem[];
  leaves: LeaveRequest[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  wageAdvances: WageAdvance[];
  setWageAdvances: React.Dispatch<React.SetStateAction<WageAdvance[]>>;
  employeeCredits: EmployeeCredit[];
  setEmployeeCredits: React.Dispatch<React.SetStateAction<EmployeeCredit[]>>;
  insuranceSubscriptions: InsuranceSubscription[];
  setInsuranceSubscriptions: React.Dispatch<React.SetStateAction<InsuranceSubscription[]>>;
  expenseClaims: ExpenseClaim[];
  setExpenseClaims: React.Dispatch<React.SetStateAction<ExpenseClaim[]>>;
  pushNotification: (title: string, message: string, recipient: string, type: 'payroll' | 'employee' | 'leave') => void;
  onLogout: () => void;
  onSwitchPortal?: () => void;
  profileUpdateRequests?: ProfileUpdateRequest[];
  onAddProfileUpdateRequest?: (req: ProfileUpdateRequest) => void;
}

export default function EmployeePortalView({
  currentUser,
  companySettings,
  payslips,
  leaves,
  onAddLeaveRequest,
  wageAdvances,
  setWageAdvances,
  employeeCredits,
  setEmployeeCredits,
  insuranceSubscriptions,
  setInsuranceSubscriptions,
  expenseClaims,
  setExpenseClaims,
  pushNotification,
  onLogout,
  onSwitchPortal,
  profileUpdateRequests = [],
  onAddProfileUpdateRequest
}: EmployeePortalViewProps) {
  
  // Side tabs: 'home' | 'payslips' | 'leaves' | 'fintech' | 'expenses' | 'profile'
  const [activeMenu, setActiveMenu] = useState<'home' | 'payslips' | 'leaves' | 'fintech' | 'expenses' | 'profile'>('home');
  
  // New Leave Form states
  const [isRequestingLeave, setIsRequestingLeave] = useState(false);
  const [leaveDates, setLeaveDates] = useState({
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    reason: ''
  });

  // Expense claim form states
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    type: 'Transport' as const,
    description: '',
    amount: ''
  });

  // Fintech form state values (EWA & Credit Loans)
  const todayStr = '2026-06-19';
  const workedDays = 19;
  const totalDays = 30;
  
  const accruedSalary = Math.round(currentUser.baseSalary * (workedDays / totalDays));
  const maxEwaAmount = Math.round(accruedSalary * 0.5);
  const [ewaAmount, setEwaAmount] = useState<number>(30000);
  
  const [creditAmount, setCreditAmount] = useState<number>(200000);
  const [creditDuration, setCreditDuration] = useState<number>(6);
  const [creditPurpose, setCreditPurpose] = useState<string>('Scolarité / Frais de formation');

  // Profile update self-updateable form state initialization
  const [profileForm, setProfileForm] = useState({
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: currentUser.address || '',
    city: currentUser.city || '',
    nationality: currentUser.nationality || '',
    emergencyContactName: currentUser.emergencyContactName || '',
    emergencyContactPhone: currentUser.emergencyContactPhone || '',
    emergencyContactRelation: currentUser.emergencyContactRelation || '',
    bankName: currentUser.bankName || '',
    bankAccountNumber: currentUser.bankAccountNumber || '',
    bankAccountName: currentUser.bankAccountName || '',
    paymentMethod: currentUser.paymentMethod || 'Banque',
    additionalNotes: ''
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Filter lists related purely to current logged employee
  const myPayslips = payslips.filter(p => p.employeeId === currentUser.id);
  const myLeaves = leaves.filter(l => l.employeeId === currentUser.id);
  const myWageAdvances = wageAdvances.filter(w => w.employeeId === currentUser.id);
  const myCredits = employeeCredits.filter(c => c.employeeId === currentUser.id);
  const myInsurances = insuranceSubscriptions.filter(is => is.employeeId === currentUser.id && is.status === 'Actif');
  const myExpenses = expenseClaims.filter(c => c.employeeId === currentUser.id);

  // Leave submit logic
  const handleRequestLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDates.reason) {
      alert('Veuillez renseigner un motif pour votre demande de congé s\'il vous plaît.');
      return;
    }

    const req: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      position: currentUser.position,
      startDate: leaveDates.startDate,
      endDate: leaveDates.endDate,
      reason: leaveDates.reason,
      status: 'En attente',
      requestDate: todayStr
    };

    onAddLeaveRequest(req);
    setIsRequestingLeave(false);
    setLeaveDates({
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      reason: ''
    });
    alert('Votre demande de congé payé a été envoyée avec succès à votre gestionnaire RH.');
  };

  // Expense Refund submit logic
  const handleRequestRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(expenseForm.amount);
    if (!expenseForm.description || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez introduire des informations valides.');
      return;
    }

    const claim: ExpenseClaim = {
      id: `claim-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      type: expenseForm.type,
      description: expenseForm.description,
      amount: parsedAmount,
      date: todayStr,
      status: 'En attente'
    };

    setExpenseClaims(prev => [claim, ...prev]);
    pushNotification(
      'Frais professionnels déposés',
      `L'employé(e) ${currentUser.firstName} ${currentUser.lastName} souhaite un remboursement de ${formatCurrency(parsedAmount, companySettings.currency)} pour : "${expenseForm.description}" (${expenseForm.type}).`,
      'zamannando14@gmail.com', // HR admin
      'employee'
    );

    setIsRequestingRefund(false);
    setExpenseForm({
      type: 'Transport',
      description: '',
      amount: ''
    });
    alert('Votre note de frais professionnels a été émise et transmise à la comptabilité pour traitement.');
  };

  // Profile Modification submission handle
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddProfileUpdateRequest) return;

    // Check if anything actually changed to prevent duplicate empty requests
    const changedFields = 
      profileForm.phone !== (currentUser.phone || '') ||
      profileForm.email !== (currentUser.email || '') ||
      profileForm.address !== (currentUser.address || '') ||
      profileForm.city !== (currentUser.city || '') ||
      profileForm.nationality !== (currentUser.nationality || '') ||
      profileForm.emergencyContactName !== (currentUser.emergencyContactName || '') ||
      profileForm.emergencyContactPhone !== (currentUser.emergencyContactPhone || '') ||
      profileForm.emergencyContactRelation !== (currentUser.emergencyContactRelation || '') ||
      profileForm.bankName !== (currentUser.bankName || '') ||
      profileForm.bankAccountNumber !== (currentUser.bankAccountNumber || '') ||
      profileForm.bankAccountName !== (currentUser.bankAccountName || '') ||
      profileForm.paymentMethod !== (currentUser.paymentMethod || 'Banque') ||
      profileForm.additionalNotes.trim() !== '';

    if (!changedFields) {
      alert("Aucune information de profil n'a été révisée. Veuillez éditer au moins un champ avant de soumettre.");
      return;
    }

    const req: ProfileUpdateRequest = {
      id: `profile-req-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address,
      city: profileForm.city,
      nationality: profileForm.nationality,
      
      emergencyContactName: profileForm.emergencyContactName,
      emergencyContactPhone: profileForm.emergencyContactPhone,
      emergencyContactRelation: profileForm.emergencyContactRelation,
      
      paymentMethod: profileForm.paymentMethod,
      bankName: profileForm.bankName,
      bankAccountNumber: profileForm.bankAccountNumber,
      bankAccountName: profileForm.bankAccountName,
      
      status: 'En attente',
      requestDate: todayStr,
      additionalNotes: profileForm.additionalNotes
    };

    onAddProfileUpdateRequest(req);
    setIsEditingProfile(false);
    setProfileForm(prev => ({ ...prev, additionalNotes: '' }));
  };

  // EWA request logic
  const handleEwaSubmit = () => {
    if (ewaAmount <= 0 || ewaAmount > maxEwaAmount) {
      alert(`Montant invalide ou dépassant la limite autorisée de ${formatCurrency(maxEwaAmount, companySettings.currency)}`);
      return;
    }

    const newAdvance: WageAdvance = {
      id: `ewa-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      amount: ewaAmount,
      requestDate: todayStr,
      status: 'En attente',
      month: 'Juin 2026'
    };

    setWageAdvances(prev => [newAdvance, ...prev]);
    pushNotification(
      'Demande d\'avance sur salaire déposée (EWA)',
      `L'employé(e) ${currentUser.firstName} ${currentUser.lastName} sollicite un acompte direct sur salaire de ${formatCurrency(ewaAmount, companySettings.currency)} (Earned Wage Access).`,
      'zamannando14@gmail.com',
      'payroll'
    );
    alert('Votre demande d\'avance de salaire en temps réel (EWA) a été émise avec succès. Les fonds seront transmis dès approbation RH.');
  };

  // Loan credit request logic
  const handleCreditSubmit = () => {
    const rate = 1.5;
    const totalWithInterest = creditAmount * (1 + (creditDuration * (rate / 100)));
    const monthlyVal = Math.round(totalWithInterest / creditDuration);

    const newCredit: EmployeeCredit = {
      id: `loan-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      totalAmount: creditAmount,
      monthlyInstallment: monthlyVal,
      monthsDuration: creditDuration,
      monthsPaidCount: 0,
      interestRate: rate,
      status: 'En attente',
      requestDate: todayStr,
      purpose: creditPurpose
    };

    setEmployeeCredits(prev => [newCredit, ...prev]);
    pushNotification(
      'Demande de prêt social déposée',
      `L'employé(e) ${currentUser.firstName} ${currentUser.lastName} sollicite un micro-crédit de ${formatCurrency(creditAmount, companySettings.currency)} remboursable sur ${creditDuration} mois pour : "${creditPurpose}".`,
      'zamannando14@gmail.com',
      'payroll'
    );
    alert('Votre proposition de micro-crédit salarié Jefara a été émise avec succès. Une notification a été envoyée aux administrateurs pour approbation.');
  };

  // Insurance subscriptions toggling
  const handleToggleInsurance = (type: 'Sante' | 'Auto' | 'Prevoyance' | 'Famille', name: string, premium: number) => {
    const existing = insuranceSubscriptions.find(
      ins => ins.employeeId === currentUser.id && ins.productType === type && ins.status === 'Actif'
    );

    if (existing) {
      setInsuranceSubscriptions(prev => prev.map(ins => ins.id === existing.id ? { ...ins, status: 'Résilié' } : ins));
      pushNotification(
        'Mutuale résiliée',
        `L'employé(e) ${currentUser.firstName} s'est désinscrit(e) de l'assurance : "${name}".`,
        'zamannando14@gmail.com',
        'employee'
      );
    } else {
      const newSub: InsuranceSubscription = {
        id: `ins-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        productType: type,
        productName: name,
        monthlyPremium: premium,
        status: 'Actif',
        startDate: todayStr
      };
      setInsuranceSubscriptions(prev => [newSub, ...prev]);
      pushNotification(
        'Mutuelle souscrite',
        `L'employé(e) ${currentUser.firstName} a souscrit à l'assurance : "${name}" (${formatCurrency(premium, companySettings.currency)}/m).`,
        'zamannando14@gmail.com',
        'employee'
      );
    }
  };

  // Available Insurance Products for display
  const insuranceProducts = [
    {
      type: 'Sante' as const,
      name: 'Mutuelle Santé Jefara Complète',
      premium: 8500,
      description: 'Couverture à 80% des consultations médicales, pharmacie agréée et hospitalisations urgentes.',
      icon: HeartPulse
    },
    {
      type: 'Auto' as const,
      name: 'Assurance Moto & Auto Tiers Plus',
      premium: 12000,
      description: 'Responsabilité civile obligatoire, défense légale et depannage sinistre inclus.',
      icon: ShieldPlus
    },
    {
      type: 'Prevoyance' as const,
      name: 'Rente Éducation & Capital Décès',
      premium: 5000,
      description: 'Garantit l\'éducation des enfants et un capital sécurisé d\'un an de salaire en cas d\'accident.',
      icon: ShieldCheck
    }
  ];

  return (
    <div id="employee_portal_unified" className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0F172A] text-slate-400 flex flex-col justify-between shrink-0 border-r border-slate-800/50 md:h-screen md:sticky md:top-0 shadow-lg">
        <div>
          {/* Employee Avatar Details header */}
          <div className="p-6 border-b border-slate-800/60 pb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600/35 border-2 border-indigo-500/25 flex items-center justify-center font-black text-white text-xl shadow-md mb-3">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <h2 className="text-white font-extrabold text-sm tracking-tight">{currentUser.firstName} {currentUser.lastName}</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 bg-slate-800/80 px-2 py-0.5 rounded-sm">{currentUser.position}</p>
            <p className="text-[9px] text-slate-500 mt-1 mb-2 font-semibold">Matricule: JF-2026-00{currentUser.id.split('-')[1]}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveMenu('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'home' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={15} />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveMenu('payslips')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'payslips' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileDown size={15} />
              <span>Bulletins & Documents</span>
            </button>

            <button
              onClick={() => setActiveMenu('leaves')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'leaves' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={15} />
              <span>Demandes de Congés</span>
            </button>

            <button
              onClick={() => setActiveMenu('fintech')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'fintech' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HandCoins size={15} />
              <span>Intégration Fintech</span>
            </button>

            <button
              onClick={() => setActiveMenu('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'expenses' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt size={15} />
              <span>Mes Notes de Frais</span>
            </button>

            <button
              id="tab_portal_profile"
              onClick={() => setActiveMenu('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all ${
                activeMenu === 'profile' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCog size={15} />
              <span>Mon Profil & RIB</span>
            </button>
          </nav>
        </div>

        {/* Footer actions of logout */}
        <div className="p-4 border-t border-slate-800/60 font-sans space-y-2">
          <div className="bg-indigo-950 p-3 rounded-xl border border-indigo-900/50 text-[10px] text-slate-300 leading-normal text-center">
            <span className="font-bold text-white block mb-0.5">🟢 Portail Sécurisé</span>
            Protocole SSL • Certifié SYSCOHADA
          </div>

          {onSwitchPortal && (
            <button
              onClick={onSwitchPortal}
              className="w-full flex items-center justify-between py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition uppercase"
            >
              <span>Espace RH Admin</span>
              <Building2 size={13} />
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between py-2.5 px-4 bg-slate-800/60 hover:bg-rose-950 hover:text-red-300 text-slate-400 rounded-xl text-xs font-extrabold cursor-pointer transition uppercase"
          >
            <span>Se Déconnecter</span>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* DETAILED VIEWS CONTAINER */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header segment banner */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-indigo-600 stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase text-indigo-750 bg-indigo-50 px-2.5 py-1 rounded-sm">JEFARA PORTAIL COLLABORATEUR</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Bonjour, {currentUser.firstName} !</h1>
            <p className="text-xs text-slate-400">Gérez vos revenus d'activité, téléchargez vos fiches de paie et demandez des avances ou congés en toute liberté.</p>
          </div>

          {/* Quick Date badge */}
          <div className="bg-slate-50 border border-slate-150 py-2.5 px-4 rounded-2xl text-[11px] text-slate-500 font-bold shrink-0 font-sans">
            📅 Simulation Date : <strong className="text-indigo-700 font-mono">{todayStr}</strong>
          </div>
        </div>

        {/* SECTION ROUTING ACTIONS */}
        
        {/* TAB 1: HOME PANEL */}
        {activeMenu === 'home' && (
          <div className="space-y-6">
            {/* Quick overview metric widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-xs">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Salaire Contractuel Brut</span>
                <strong className="text-white font-mono text-lg font-black block mt-1">
                  {formatCurrency(currentUser.baseSalary, companySettings.currency)}
                </strong>
                <p className="text-[10px] text-slate-300 mt-2">Dépôts directs autorisés : <span className="font-bold">{currentUser.paymentMethod}</span></p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Acompte d'Activité EWA (50%)</span>
                <strong className="text-emerald-600 font-mono text-lg font-black block mt-1">
                  {formatCurrency(accruedSalary, companySettings.currency)}
                </strong>
                <p className="text-[10px] text-slate-500 mt-2">Earned Wages au {workedDays} Juin : <span className="font-bold font-mono text-emerald-600">Max {formatCurrency(maxEwaAmount, companySettings.currency)}</span></p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Congés Payés Restants</span>
                <strong className="text-indigo-600 text-lg font-black block mt-1">
                  {26.5 - myLeaves.filter(l => l.status === 'Approuvé').length * 2} jours
                </strong>
                <p className="text-[10px] text-slate-500 mt-2">2.2 jours accumulés par mois travaillé</p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Couverture Mutuelle / Assurances</span>
                <strong className="text-purple-600 text-lg font-black block mt-1">
                  {myInsurances.length} Mutuelles
                </strong>
                <p className="text-[10px] text-slate-500 mt-2">Prélèvement automatique intégré</p>
              </div>

            </div>

            {/* Main dashboard content blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Alerts list and Quick Shortcuts */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual quick EWA / Advance advert banner */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1 max-w-md">
                    <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 rounded-md">LIQUIDITÉS EN DIRECT</span>
                    <h3 className="font-extrabold text-slate-800 text-sm mt-1">Accédez à votre salaire à tout moment (Earned Wage Access)</h3>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">
                      Plus besoin d'attendre la fin du mois pour régler vos factures. Retirez instantanément jusqu'à 50% de la rémunération que vous avez déjà gagnée ce mois-ci.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('fintech')}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                  >
                    <span>Simuler acompte</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Tracking of my overall claims/requests inside the portal */}
                <div className="bg-white border border-slate-00 shadow-xs rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Vos demandes récentes en cours de traitement</h3>
                  
                  {myLeaves.length === 0 && myWageAdvances.length === 0 && myCredits.length === 0 && myExpenses.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 font-medium text-xs flex flex-col items-center gap-2">
                      <Inbox size={24} className="text-slate-300" />
                      <span>Aucune demande récente déposée.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myLeaves.map(l => (
                        <div key={l.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full font-bold">CONGÉ</span>
                            <span className="ml-2 font-bold text-slate-700">Du {l.startDate} au {l.endDate}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">"{l.reason}"</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            l.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                            l.status === 'Refusé' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100/60 text-amber-800'
                          }`}>{l.status}</span>
                        </div>
                      ))}
                      {myExpenses.map(e => (
                        <div key={e.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">FRAIS</span>
                            <span className="ml-2 font-bold text-slate-700">{formatCurrency(e.amount, companySettings.currency)}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">"{e.description}"</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            e.status === 'Approuvé' ? 'bg-teal-50 text-teal-700' :
                            e.status === 'Remboursé' ? 'bg-emerald-50 text-emerald-700' :
                            e.status === 'Refusé' ? 'bg-slate-105 text-slate-400' : 'bg-amber-100/60 text-amber-800'
                          }`}>{e.status}</span>
                        </div>
                      ))}
                      {myWageAdvances.map(w => (
                        <div key={w.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full font-bold">ACOMPTE (EWA)</span>
                            <span className="ml-2 font-bold text-slate-700">{formatCurrency(w.amount, companySettings.currency)}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            w.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                            w.status === 'Payé' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-100/60 text-amber-800'
                          }`}>{w.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Profile specifications card */}
              <div className="space-y-6">
                
                {/* Employee compliance record metadata card */}
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Identité de Régie Locale</h4>
                  <div className="text-xs space-y-2.5">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400">Régime d'Imposition :</span>
                      <strong className="text-slate-700">Zone d'activité : {companySettings.country}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400">Date d'embauche :</span>
                      <strong className="text-slate-700">{currentUser.hireDate}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400">RIB de destination :</span>
                      <strong className="text-slate-600 font-mono text-right max-w-[150px] truncate">{currentUser.bankAccountNumber}</strong>
                    </div>
                  </div>
                </div>

                {/* Insurances card list widget */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Vos assurances actives</h4>
                  
                  {myInsurances.length === 0 ? (
                    <div className="text-[11px] text-slate-400">Aucune assurance facultative contractée. Vous pouvez y souscrire sous l'onglet "Fintech".</div>
                  ) : (
                    <div className="space-y-2">
                      {myInsurances.map((ins) => (
                        <div key={ins.id} className="p-2.5 bg-purple-50/30 border border-purple-100 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 truncate pr-2">{ins.productName}</span>
                          <span className="font-mono text-purple-600 font-bold shrink-0">-{formatCurrency(ins.monthlyPremium, companySettings.currency)}/m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MY PAYSLIPS */}
        {activeMenu === 'payslips' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Vos Bulletins de Paie Officiels</h3>
              <p className="text-xs text-slate-400 mt-1">Consultez en ligne et téléchargez tous vos bulletins et attestations fiscales certifiés.</p>
            </div>

            {myPayslips.length === 0 ? (
              <div className="py-12 text-center border border-dashed rounded-2xl bg-slate-50 text-slate-400 text-xs font-medium">
                Aucun bulletin de salaire n'a été publié pour l'instant pour votre matricule.
              </div>
            ) : (
              <div className="divide-y divide-slate-150 border border-slate-150 rounded-2xl overflow-hidden font-sans text-xs bg-white">
                <div className="grid grid-cols-12 bg-slate-50 py-3 px-4 font-black text-slate-500 text-[10px] uppercase">
                  <div className="col-span-3">Période</div>
                  <div className="col-span-3">Date de Versement</div>
                  <div className="col-span-2 text-right">Salaire Brut</div>
                  <div className="col-span-2 text-right">Salaire Net Payé</div>
                  <div className="col-span-2 text-right">Fiche en Direct</div>
                </div>

                {myPayslips.map((slip) => (
                  <div key={slip.id} className="grid grid-cols-12 py-4 px-4 items-center text-slate-700 font-semibold hover:bg-slate-50/50 transition-all">
                    <div className="col-span-3 font-bold text-slate-800">{slip.month}</div>
                    <div className="col-span-3 text-slate-500">{slip.paymentDate}</div>
                    <div className="col-span-2 text-right font-mono">{formatCurrency(slip.baseSalary, companySettings.currency)}</div>
                    <div className="col-span-2 text-right font-mono text-emerald-600 font-bold">{formatCurrency(slip.netSalary, companySettings.currency)}</div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => generatePayslipPDF(currentUser, slip, companySettings)}
                        className="py-1 px-3 border border-indigo-200 text-indigo-650 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 transition"
                      >
                        <FileDown size={12} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEMANDES DE CONGES */}
        {activeMenu === 'leaves' && (
          <div className="space-y-6">
            
            {/* Header swapper */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm">Vos Demandes d'Absences & Congés Payés</h3>
                <p className="text-xs text-slate-400">Vérifiez l'état de validation de vos demandes de congé.</p>
              </div>

              <button
                onClick={() => setIsRequestingLeave(!isRequestingLeave)}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase h-10 shadow-xs"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Déposer un congé</span>
              </button>
            </div>

            {/* Leave request form */}
            <AnimatePresence>
              {isRequestingLeave && (
                <motion.form
                  onSubmit={handleRequestLeaveSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 overflow-hidden shadow-xs"
                >
                  <h4 className="text-slate-800 text-xs font-black uppercase">Nouvelle Demande d'Absence</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date de début*</label>
                      <input
                        type="date"
                        required
                        value={leaveDates.startDate}
                        onChange={(e) => setLeaveDates(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date de fin*</label>
                      <input
                        type="date"
                        required
                        value={leaveDates.endDate}
                        onChange={(e) => setLeaveDates(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Justification / Motif*</label>
                      <input
                        type="text"
                        required
                        value={leaveDates.reason}
                        onChange={(e) => setLeaveDates(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="Ex: Vacances d'été, raison médicale..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRequestingLeave(false)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition uppercase"
                    >
                      Transmettre rH
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List */}
            {myLeaves.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-white border rounded-3xl">
                Aucun congé déposé à ce jour.
              </div>
            ) : (
              <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs bg-white">
                <div className="grid grid-cols-12 bg-slate-50 py-3 px-4 font-black uppercase text-slate-500 text-[10px]">
                  <div className="col-span-3">Date de la demande</div>
                  <div className="col-span-4">Période d'absence</div>
                  <div className="col-span-3">Motif</div>
                  <div className="col-span-2 text-right">Statut</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {myLeaves.map(l => (
                    <div key={l.id} className="grid grid-cols-12 py-4 px-4 items-center text-slate-700 font-semibold hover:bg-slate-50/50">
                      <span className="col-span-3 text-slate-400">{l.requestDate || todayStr}</span>
                      <strong className="col-span-4 text-slate-800">Du {l.startDate} au {l.endDate}</strong>
                      <span className="col-span-3 text-slate-500 truncate pr-4">{l.reason}</span>
                      <span className="col-span-2 text-right font-black">
                        <span className={`px-2.5 py-0.5 rounded-sm uppercase tracking-wide uppercase text-[10px] ${
                          l.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                          l.status === 'Refusé' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>{l.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: FINTECH INTEGRATION ADVANTAGES */}
        {activeMenu === 'fintech' && (
          <div className="space-y-6">
            
            {/* Split row EWA vs LOANS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              
              {/* Box 1: EWA / Acompte */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-sm">TEMPS RÉEL (EWA)</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">Dépôt d'Acompte sur Salaire en Direct</h4>
                  <p className="text-xs text-slate-400">Demandez instantanément le versement d'une fraction de votre paie déjà capitalisée ce mois-ci.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">Earned Accrued wages (19 jours) :</span>
                    <strong className="block text-slate-800 font-mono font-black mt-0.5">{formatCurrency(accruedSalary, companySettings.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Capacité maximale de tirage (50%) :</span>
                    <strong className="block text-indigo-600 font-mono font-black mt-0.5">{formatCurrency(maxEwaAmount, companySettings.currency)}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Montant désiré :</span>
                    <span className="font-mono text-base text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                      {formatCurrency(ewaAmount, companySettings.currency)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={10000}
                    max={maxEwaAmount || 30000}
                    step={2000}
                    value={ewaAmount}
                    onChange={(e) => setEwaAmount(Number(e.target.value))}
                    className="w-full accent-indigo-650 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleEwaSubmit}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs rounded-xl transition uppercase tracking-wider font-sans cursor-pointer"
                >
                  Débloquer mon argent
                </button>
              </div>

              {/* Box 2: Loans / Credits */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-orange-700 bg-orange-50 px-2.5 py-1 rounded-sm">PARTENAIRE CRÉDIT</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">Demande de Prêt Personnel / Social d'Urgence</h4>
                  <p className="text-xs text-slate-400">Empruntez de manière responsable avec remboursement mensuel direct sur vos prochains bulletins.</p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {/* Select amount */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-400">Montant souhaité :</span>
                      <span className="font-mono">{formatCurrency(creditAmount, companySettings.currency)}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={1000000}
                      step={50000}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Number(e.target.value))}
                      className="w-full accent-orange-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Months */}
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 9, 12].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCreditDuration(m)}
                        className={`py-2 rounded-xl text-center font-bold font-sans cursor-pointer ${
                          creditDuration === m ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {m} mois
                      </button>
                    ))}
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Motif principal du prêt</label>
                    <select
                      value={creditPurpose}
                      onChange={(e) => setCreditPurpose(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Scolarité / Frais de formation">📚 Scolarité / Droits de scolarité</option>
                      <option value="Urgence médicale familiale">🏥 Urgence médicale des proches</option>
                      <option value="Équipement / Fourniture de bureau">💻 Matériel informatique ou de travail</option>
                      <option value="Travaux de rénovation de logement">🏠 Travaux logement urgents</option>
                    </select>
                  </div>

                  {/* Monthly calc pane */}
                  <div className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Remboursement simulé (Prelevé sur paie) :</span>
                    <strong className="text-indigo-650 font-mono text-[13px] font-black">
                      {formatCurrency(
                        Math.round((creditAmount * (1 + (creditDuration * (1.5 / 100)))) / creditDuration),
                        companySettings.currency
                      )} / mois
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreditSubmit}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs rounded-xl transition uppercase tracking-wider font-sans cursor-pointer"
                >
                  Envoyer proposition de financement
                </button>
              </div>

            </div>

            {/* Insurance Packages subscription list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
              <div>
                <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-sm">ASSURANCES COLLECTIVES</span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-2">Souscrivez aux Avantages Jefara d'Assurance PME</h4>
                <p className="text-xs text-slate-400 mt-1">L'entreprise pré-finance votre adhésion. Le prélèvement de la cotisation est lissé chaque mois sur votre bulletin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insuranceProducts.map(p => {
                  const isSub = myInsurances.some(sub => sub.productType === p.type);
                  const IconComp = p.icon;

                  return (
                    <div 
                      key={p.type} 
                      className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-350 ${
                        isSub ? 'border-purple-250 bg-purple-50/10 shadow-inner' : 'border-slate-150 bg-white'
                      }`}
                    >
                      <div className="space-y-2 text-xs font-sans">
                        <div className="flex justify-between items-center">
                          <span className={`p-2 rounded-lg ${isSub ? 'bg-purple-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                            <IconComp size={16} />
                          </span>
                          <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                            {formatCurrency(p.premium, companySettings.currency)}/m
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-800 leading-tight">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 leading-normal">{p.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-2">
                        <span className="text-[9px] font-semibold text-slate-450">{isSub ? '🟢 Couvert' : '🔴 Non Adhérent'}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleInsurance(p.type, p.name, p.premium)}
                          className={`py-1 px-2.5 text-[9px] font-black uppercase rounded-md cursor-pointer border ${
                            isSub ? 'bg-red-50 border-red-150 text-red-650' : 'bg-purple-600 border-purple-600 text-white'
                          }`}
                        >
                          {isSub ? 'Résilier' : 'Adhérer'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: MY EXPENSE CLAIMS */}
        {activeMenu === 'expenses' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-855 text-sm">Gestion Personnelle des Indemnités & Frais</h3>
                <p className="text-xs text-slate-400 mt-1">Déclarez vos notes de frais taxi, hébergement ou repas professionnels pour en obtenir remboursement.</p>
              </div>

              <button
                onClick={() => setIsRequestingRefund(!isRequestingRefund)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase h-10 shadow-xs"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Déclarer une note de frais</span>
              </button>
            </div>

            {/* Expense refund form */}
            <AnimatePresence>
              {isRequestingRefund && (
                <motion.form
                  onSubmit={handleRequestRefundSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 overflow-hidden shadow-xs"
                >
                  <h4 className="text-slate-800 text-xs font-black uppercase text-emerald-700">Nouvelle Indemnisation de frais</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Catégorie de frais*</label>
                      <select
                        value={expenseForm.type}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Transport">🚖 Transport / Taxi</option>
                        <option value="Restauration">🍕 Repas et Restauration client</option>
                        <option value="Hébergement">🏨 Hôtel / Mission</option>
                        <option value="Santé">🩺 Frais Médicaux / Pharmacie</option>
                        <option value="Autre">📦 Fournitures & Divers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Montant requis*</label>
                      <input
                        type="number"
                        required
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                        placeholder="Ex: 15000"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commentaire explicatif*</label>
                      <input
                        type="text"
                        required
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                        placeholder="Ex: Plein carburant déplacement commercial"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRequestingRefund(false)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition uppercase"
                    >
                      Soumettre
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List */}
            {myExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-white border rounded-3xl">
                Aucune note de frais déclarée.
              </div>
            ) : (
              <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs bg-white">
                <div className="grid grid-cols-12 bg-slate-50 py-3 px-4 font-black uppercase text-slate-500 text-[10px]">
                  <div className="col-span-3">Date de soumission</div>
                  <div className="col-span-2">Catégorie</div>
                  <div className="col-span-4">Libellé / Justification</div>
                  <div className="col-span-1.5 text-right font-mono">Montant</div>
                  <div className="col-span-1.5 text-right">Statut</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {myExpenses.map(e => (
                    <div key={e.id} className="grid grid-cols-12 py-3.5 px-4 items-center text-slate-700 font-semibold hover:bg-slate-50/50">
                      <span className="col-span-3 text-slate-400">{e.date}</span>
                      <strong className="col-span-2 text-slate-850 font-bold">{e.type}</strong>
                      <span className="col-span-4 text-slate-500 truncate pr-4">"{e.description}"</span>
                      <span className="col-span-1.5 text-right font-mono font-bold pr-2">{formatCurrency(e.amount, companySettings.currency)}</span>
                      <span className="col-span-1.5 text-right font-black">
                        <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wide text-[9px] ${
                          e.status === 'Remboursé' ? 'bg-emerald-50 text-emerald-700' :
                          e.status === 'Approuvé' ? 'bg-indigo-50 text-indigo-700' :
                          e.status === 'Refusé' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>{e.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Profile and autonomous modifications view segment */}
        {activeMenu === 'profile' && (
          <div className="space-y-6">
            
            {/* Header Title segment */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight font-display mb-1 flex items-center gap-2">
                  <UserCog className="text-indigo-600" size={20} />
                  Mon Portfolio Personnel & RIB
                </h3>
                <p className="text-xs text-slate-500">
                  Gérer de manière autonome vos coordonnées légales, vos coordonnées bancaires de versement et vos contacts d'urgence sécurisés.
                </p>
              </div>
              
              {!isEditingProfile && !profileUpdateRequests.some(r => r.employeeId === currentUser.id && r.status === 'En attente') && (
                <button
                  onClick={() => {
                    setProfileForm({
                      phone: currentUser.phone || '',
                      email: currentUser.email || '',
                      address: currentUser.address || '',
                      city: currentUser.city || '',
                      nationality: currentUser.nationality || '',
                      emergencyContactName: currentUser.emergencyContactName || '',
                      emergencyContactPhone: currentUser.emergencyContactPhone || '',
                      emergencyContactRelation: currentUser.emergencyContactRelation || '',
                      bankName: currentUser.bankName || '',
                      bankAccountNumber: currentUser.bankAccountNumber || '',
                      bankAccountName: currentUser.bankAccountName || '',
                      paymentMethod: currentUser.paymentMethod || 'Banque',
                      additionalNotes: ''
                    });
                    setIsEditingProfile(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100 uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
                >
                  <UserCog size={14} />
                  <span>Actualiser mes informations</span>
                </button>
              )}
            </div>

            {/* Notification alert for pending validation */}
            {profileUpdateRequests.some(r => r.employeeId === currentUser.id && r.status === 'En attente') && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 shadow-xs">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="block font-bold">Demande de modification en cours de validation RH</strong>
                  <p className="mt-0.5 leading-relaxed font-medium">
                    Vous avez soumis une demande d'actualisation de profil le {profileUpdateRequests.find(r => r.employeeId === currentUser.id && r.status === 'En attente')?.requestDate}. Elle est actuellement examinée par le service RH. Les modifications seront appliquées dès approbation.
                  </p>
                </div>
              </div>
            )}

            {/* Notification alert for rejected updates */}
            {profileUpdateRequests.some(r => r.employeeId === currentUser.id && r.status === 'Refusé') && (
              <div className="bg-rose-50 border border-rose-250 p-4 rounded-2xl flex gap-3 text-xs text-rose-950 shadow-xs">
                <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="block font-bold">Dernière mise à jour non conforme ou refusée</strong>
                  <p className="mt-0.5 leading-relaxed font-semibold">
                    Motif de refus RH : <span className="italic font-bold text-rose-800">"{profileUpdateRequests.filter(r => r.employeeId === currentUser.id && r.status === 'Refusé').slice(-1)[0]?.rejectionReason || 'Non spécifié'}"</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium">
                    Vous pouvez soumettre à nouveau une nouvelle demande de mise à jour dès que vous le souhaitez en adaptant les pièces justificatives ou valeurs fournies.
                  </p>
                </div>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                
                {/* Form layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Phase 1: Contact detail inputs */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <span>1. Coordonnées & Informations Personnelles</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Téléphone de contact *</label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ex: +237 699 99 99 99"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adresse E-mail professionnelle *</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Ex: jean.dupont@entreprise.com"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adresse postale de domicile *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Ex: Rue de la Paix, Quartier Bastos"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ville de résidence *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.city}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Ex: Yaoundé"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nationalité légale *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.nationality}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="Ex: Camerounaise"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Emergency contacts */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <span>2. Contact de Secours / d'Urgence</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom complet du contact légal *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.emergencyContactName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                          placeholder="Ex: Marie Dupont"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Relation / Lien de parenté *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.emergencyContactRelation}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                          placeholder="Ex: Épouse, Frère, Mère"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Téléphone direct du contact d'urgence *</label>
                        <input
                          type="tel"
                          required
                          value={profileForm.emergencyContactPhone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                          placeholder="Ex: +237 677 77 77 77"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phase 3: Banking details & RIB */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                    <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <span>3. Mode de Règlement & Coordonnées Bancaires (RIB)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Moyen de versement préféré *</label>
                        <select
                          value={profileForm.paymentMethod}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        >
                          <option value="Banque">🏦 Virement Bancaire</option>
                          <option value="Orange Money">🍊 Orange Money</option>
                          <option value="MTN Mobile Money">📲 MTN Mobile Money</option>
                          <option value="Autre">📦 Espèces / Chèque</option>
                        </select>
                      </div>

                      {profileForm.paymentMethod === 'Banque' && (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dénomination de la Banque *</label>
                            <input
                              type="text"
                              required
                              value={profileForm.bankName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, bankName: e.target.value }))}
                              placeholder="Ex: SGBC, Afriland, Ecobank"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Titulaire officiel du compte *</label>
                            <input
                              type="text"
                              required
                              value={profileForm.bankAccountName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, bankAccountName: e.target.value }))}
                              placeholder="Ex: JEAN DUPONT"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Numéro de RIB / Clé unique de virement *</label>
                            <input
                              type="text"
                              required
                              value={profileForm.bankAccountNumber}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                              placeholder="Format: CodeBanque-CodeGuichet-NumCompte-Clé (e.g. 10025-00045-12345678901-45)"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono"
                            />
                          </div>
                        </>
                      )}

                      {profileForm.paymentMethod !== 'Banque' && (
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Numéro de téléphone lié ou identifiant alternatif *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.bankAccountNumber}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                            placeholder="Ex: +237 699 99 99 99"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment context */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                    <label className="block text-slate-800 text-xs font-black uppercase tracking-wider mb-1">Remarques ou motifs spécifiques pour l'équipe RH</label>
                    <textarea
                      value={profileForm.additionalNotes}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      rows={3}
                      placeholder="Ex: Merci d'appliquer mon nouveau RIB pour le versement du salaire de ce mois de juin s'il vous plaît."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    />
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex justify-end gap-3 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold rounded-xl cursor-pointer transition uppercase"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition uppercase tracking-wider font-display"
                  >
                    Soumettre pour Validation
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active info card list */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                  <h4 className="text-xs font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-3">
                    <span>Informations Personnelles Enregistrées</span>
                  </h4>

                  <div className="space-y-4 font-sans text-xs">
                    {/* Contacts block */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400">1. Coordonnées de contact</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Téléphone mobile</span>
                          <strong className="text-slate-800 font-bold">{currentUser.phone || '(Non renseigné)'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">E-mail personnel / pro</span>
                          <strong className="text-slate-800 font-bold">{currentUser.email || '(Non renseigné)'}</strong>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-400 block mb-0.5">Adresse de résidence</span>
                          <strong className="text-slate-800 font-bold text-slate-700">
                            {currentUser.address || '(Pas d\'adresse enregistrée)'}{currentUser.city ? `, ${currentUser.city}` : ''}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Nationalité légale</span>
                          <strong className="text-slate-800 font-bold">{currentUser.nationality || 'Camerounaise'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Secours block */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400">2. Contact d'Urgence</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="md:col-span-2">
                          <span className="text-slate-400 block mb-0.5">Nom complet du contact d'urgence</span>
                          <strong className="text-slate-800 font-bold">{currentUser.emergencyContactName || '(Aucun contact d\'urgence désigné)'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Relation parentale</span>
                          <strong className="text-slate-800 font-bold">{currentUser.emergencyContactRelation || '(Non spécifié)'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Téléphone direct d'urgence</span>
                          <strong className="text-slate-800 font-bold font-mono">{currentUser.emergencyContactPhone || '(Vide)'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées bancaires block */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400">3. Coordonnées bancaires & RIB de versement</h5>
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Moyen de règlement</span>
                            <strong className="text-slate-800 font-extrabold uppercase">{currentUser.paymentMethod || 'Autre (Chèque / Espèces)'}</strong>
                          </div>
                          {currentUser.bankName && (
                            <div>
                              <span className="text-slate-400 block mb-0.5">Banque bénéficiaire</span>
                              <strong className="text-indigo-950 font-extrabold">{currentUser.bankName}</strong>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">RIB enregistré / Compte Mobile Money</span>
                          <strong className="text-slate-800 font-mono font-bold block bg-white border border-slate-150 px-3 py-2 rounded-xl text-xs select-all">
                            {currentUser.bankAccountNumber || '(Aucun RIB enregistré pour l\'instant)'}
                          </strong>
                        </div>
                        {currentUser.bankAccountName && (
                          <div>
                            <span className="text-slate-400 block mb-0.5">Titulaire du compte bancaire</span>
                            <strong className="text-slate-800 font-extrabold">{currentUser.bankAccountName}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info and helper instructions */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 font-sans">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Pourquoi garder vos données à jour ?</h4>
                    <p className="text-xs text-slate-500 leading-normal">
                      Vos coordonnées postales, nationalité et RIB de versement sont indispensables pour l'établissement des fiches de paie normatives et le reversement de vos charges de cotisations vers l'administration.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 leading-normal font-medium">
                      🔒 <strong className="text-slate-800 font-extrabold">Confidentialité RGPD :</strong> Vos informations privées font l'objet de droits d'accès restreints aux seuls gestionnaires légaux de Jefara.
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}

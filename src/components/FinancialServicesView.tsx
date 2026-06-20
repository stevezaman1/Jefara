import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, CreditCard, ShieldPlus, ChevronRight, Sparkles, 
  Check, X, Clock, HelpCircle, ShieldCheck, AlertCircle, TrendingUp, HandCoins,
  Percent, HeartPulse, Car, BookOpen, UserCheck, ShieldAlert, FileText, ArrowRight
} from 'lucide-react';
import { Employee, CompanySettings, WageAdvance, EmployeeCredit, InsuranceSubscription } from '../types';
import { formatCurrency } from '../utils/calculator';

interface FinancialServicesViewProps {
  employees: Employee[];
  companySettings: CompanySettings;
  wageAdvances: WageAdvance[];
  employeeCredits: EmployeeCredit[];
  insuranceSubscriptions: InsuranceSubscription[];
  setWageAdvances: React.Dispatch<React.SetStateAction<WageAdvance[]>>;
  setEmployeeCredits: React.Dispatch<React.SetStateAction<EmployeeCredit[]>>;
  setInsuranceSubscriptions: React.Dispatch<React.SetStateAction<InsuranceSubscription[]>>;
  pushNotification: (title: string, message: string, recipient: string, type: 'payroll' | 'employee' | 'leave') => void;
}

export default function FinancialServicesView({
  employees,
  companySettings,
  wageAdvances,
  employeeCredits,
  insuranceSubscriptions,
  setWageAdvances,
  setEmployeeCredits,
  setInsuranceSubscriptions,
  pushNotification
}: FinancialServicesViewProps) {
  
  // Modes: 'employee' (Portail Collaborateur) | 'admin' (Espace Administrateur RH)
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  
  // Simulated employee state for the Employee portal
  const activeStaff = employees.filter(e => e.status === 'Actif');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(activeStaff[0]?.id || '');
  
  // Forms states
  const [ewaAmount, setEwaAmount] = useState<number>(50000);
  const [creditAmount, setCreditAmount] = useState<number>(300000);
  const [creditDuration, setCreditDuration] = useState<number>(6);
  const [creditPurpose, setCreditPurpose] = useState<string>('Scolarité / Frais de formation');
  
  // Get active simulated employee
  const currentEmployee = employees.find(e => e.id === selectedEmpId);
  
  // Date definitions
  const todayStr = '2026-06-19'; // Fixed UTC current simulation date
  const workedDays = 19;
  const totalDays = 30;
  
  // Calculate specific figures for current employee EWA
  const baseSalary = currentEmployee ? currentEmployee.baseSalary : 0;
  const accruedSalary = Math.round(baseSalary * (workedDays / totalDays));
  const maxEwa = Math.round(accruedSalary * 0.5); // Allow up to 50% of earned accrued wages
  
  // Handle EWA submit
  const handleRequestEwa = () => {
    if (!currentEmployee) return;
    if (ewaAmount <= 0 || ewaAmount > maxEwa) {
      alert(`Montant invalide ou dépassant la limite autorisée de ${formatCurrency(maxEwa, companySettings.currency)}`);
      return;
    }
    
    const newAdvance: WageAdvance = {
      id: `ewa-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      amount: ewaAmount,
      requestDate: todayStr,
      status: 'En attente',
      month: 'Juin 2026'
    };
    
    setWageAdvances(prev => [newAdvance, ...prev]);
    pushNotification(
      'Demande d\'avance sur salaire déposée',
      `L'employé(e) ${currentEmployee.firstName} ${currentEmployee.lastName} sollicite un acompte sur salaire de ${formatCurrency(ewaAmount, companySettings.currency)} (Earned Wage Access).`,
      'zamannando14@gmail.com', // HR admin
      'payroll'
    );
    
    alert('Votre demande d\'avance de salaire en temps réel (EWA) a été émise avec succès. Elle est en cours de validation par votre service RH.');
  };
  
  // Handle credit request
  const handleRequestCredit = () => {
    if (!currentEmployee) return;
    const rate = 1.5; // Constant standard micro-credit interest rate of 1.5%
    const totalWithInterest = creditAmount * (1 + (creditDuration * (rate / 100)));
    const monthly = Math.round(totalWithInterest / creditDuration);
    
    const newCredit: EmployeeCredit = {
      id: `loan-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      totalAmount: creditAmount,
      monthlyInstallment: monthly,
      monthsDuration: creditDuration,
      monthsPaidCount: 0,
      interestRate: rate,
      status: 'En attente',
      requestDate: todayStr,
      purpose: creditPurpose
    };
    
    setEmployeeCredits(prev => [newCredit, ...prev]);
    pushNotification(
      'Demande de crédit salarié déposée',
      `L'employé(e) ${currentEmployee.firstName} ${currentEmployee.lastName} sollicite un micro-crédit de ${formatCurrency(creditAmount, companySettings.currency)} sur ${creditDuration} mois pour : "${creditPurpose}".`,
      'zamannando14@gmail.com', // HR admin
      'payroll'
    );
    
    alert('Votre proposition de micro-crédit salarié Jefara a été émise avec succès. Une notification a été envoyée aux administrateurs pour approbation.');
  };
  
  // Toggle Insurance Subscriptions
  const handleToggleInsurance = (type: 'Sante' | 'Auto' | 'Prevoyance' | 'Famille', name: string, premium: number) => {
    if (!currentEmployee) return;
    
    const existing = insuranceSubscriptions.find(
      ins => ins.employeeId === currentEmployee.id && ins.productType === type && ins.status === 'Actif'
    );
    
    if (existing) {
      // Cancel subscription
      setInsuranceSubscriptions(prev => prev.map(ins => ins.id === existing.id ? { ...ins, status: 'Résilié' } : ins));
      pushNotification(
        'Subscription insurance terminated',
        `L'employé(e) ${currentEmployee.firstName} ${currentEmployee.lastName} s'est désinscrit(e) de l'assurance : "${name}".`,
        'zamannando14@gmail.com',
        'employee'
      );
    } else {
      // Register subscription
      const newSub: InsuranceSubscription = {
        id: `ins-${Date.now()}`,
        employeeId: currentEmployee.id,
        employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        productType: type,
        productName: name,
        monthlyPremium: premium,
        status: 'Actif',
        startDate: todayStr
      };
      
      setInsuranceSubscriptions(prev => [newSub, ...prev]);
      pushNotification(
        'Subscription insurance activated',
        `L'employé(e) ${currentEmployee.firstName} ${currentEmployee.lastName} a souscrit avec succès à l'assurance : "${name}" à hauteur de ${formatCurrency(premium, companySettings.currency)} par mois, avec prélèvement sur paie.`,
        currentEmployee.email,
        'employee'
      );
    }
  };
  
  // HR approvals
  const handleApproveEwa = (id: string, empEmail: string) => {
    setWageAdvances(prev => prev.map(ewa => ewa.id === id ? { ...ewa, status: 'Approuvé' } : ewa));
    const original = wageAdvances.find(ewa => ewa.id === id);
    if (original) {
      pushNotification(
        'Avance de salaire approuvée',
        `Bonjour ${original.employeeName},\n\nVotre demande d'avance sur salaire en temps réel de ${formatCurrency(original.amount, companySettings.currency)} a été approuvée par l'administration RH.\nLe versement immédiat a été ordonné sur votre compte mobile ou bancaire. Cette somme sera retenue lors de l'édition du bulletin de paie de Juin 2026.`,
        empEmail,
        'payroll'
      );
    }
  };
  
  const handleRejectEwa = (id: string, empEmail: string) => {
    setWageAdvances(prev => prev.map(ewa => ewa.id === id ? { ...ewa, status: 'Refusé' } : ewa));
    const original = wageAdvances.find(ewa => ewa.id === id);
    if (original) {
      pushNotification(
        'Avance de salaire rejetée',
        `Bonjour ${original.employeeName},\n\nNous regrettons de vous informer que votre demande d'avance sur salaire de ${formatCurrency(original.amount, companySettings.currency)} a été refusée par votre service RH.\nVeuillez vous adresser à votre administrateur pour en connaître l'explication.`,
        empEmail,
        'payroll'
      );
    }
  };
  
  const handleApproveCredit = (id: string, empEmail: string) => {
    setEmployeeCredits(prev => prev.map(c => c.id === id ? { ...c, status: 'Actif' } : c));
    const original = employeeCredits.find(c => c.id === id);
    if (original) {
      pushNotification(
        'Crédit salarié approuvé',
        `Bonjour ${original.employeeName},\n\nFélicitations, votre demande de crédit de ${formatCurrency(original.totalAmount, companySettings.currency)} sur ${original.monthsDuration} mois a été validée et débloquée.\n\nLe montant principal a été crédité sur votre compte. Les échéances de remboursement de ${formatCurrency(original.monthlyInstallment, companySettings.currency)} seront prélevées directement sur vos 12 prochains bulletins de paie à venir.`,
        empEmail,
        'payroll'
      );
    }
  };
  
  const handleRejectCredit = (id: string, empEmail: string) => {
    setEmployeeCredits(prev => prev.map(c => c.id === id ? { ...c, status: 'Refusé' } : c));
    const original = employeeCredits.find(c => c.id === id);
    if (original) {
      pushNotification(
        'Crédit de salaire refusé',
        `Bonjour ${original.employeeName},\n\nVotre demande de prêt salarié pour un montant de ${formatCurrency(original.totalAmount, companySettings.currency)} n'a pas pu être retenue pour cette fois par le service des finances.\nN'hésitez pas à solliciter un entretien RH pour évaluer d'autres solutions d'assistance.`,
        empEmail,
        'payroll'
      );
    }
  };
  
  // Available Insurance Packages
  const insuranceProducts = [
    {
      type: 'Sante' as const,
      name: 'Mutuelle Santé Jefara Complète',
      premium: 8500,
      description: 'Couvre 80% des frais médicaux, hospitalisation et ordonnances pour l\'employé et sa famille directe.',
      accent: 'indigo',
      icon: HeartPulse
    },
    {
      type: 'Auto' as const,
      name: 'Assurance Moto & Auto Tiers Plus',
      premium: 12000,
      description: 'Garantie responsabilité civile obligatoire, défense légale, assistance panne 24h/24 et bris de glace.',
      accent: 'orange',
      icon: Car
    },
    {
      type: 'Prevoyance' as const,
      name: 'Prévoyance Jefara Décès & Invalidité',
      premium: 5000,
      description: 'Rente éducation de 100% du salaire et versement de capital à la famille en cas d\'accident invalidant.',
      accent: 'blue',
      icon: ShieldCheck
    },
    {
      type: 'Famille' as const,
      name: 'Assistance Obsèques & Hospitalisation',
      premium: 4000,
      description: 'Prise en charge directe des rapatriements, frais funéraires et soutien financier urgent en 24h.',
      accent: 'purple',
      icon: Users
    }
  ];

  return (
    <div id="financial_services_wrapper" className="space-y-6">
      
      {/* 1. Header segment with view-tab swapper toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-100 rounded-3xl p-6 gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <HandCoins size={20} className="stroke-[2.5]" />
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Services Financiers Intégrés</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Avances sur salaire en direct, micro-crédits d'urgence et couverture d'assurances PME.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto shrink-0 border border-slate-200">
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'employee' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>Portail Collaborateur</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Espace Admin RH</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}
      {activeTab === 'employee' ? (
        <div className="space-y-6">
          {/* Employee simulator picker bar */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-950 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-950/70 border border-indigo-800/40 px-3 py-1 rounded-full">
                SIMULATION PORTAIL EMPLOYÉ
              </span>
              <h4 className="text-sm font-extrabold text-slate-100 mt-2">Connecter un membre de votre personnel pour simuler son espace :</h4>
              <p className="text-[11px] text-slate-300">Testez l'interface qu'utilisent vos collaborateurs de manière autonome pour s'assurer, emprunter ou réclamer un acompte.</p>
            </div>

            <div className="w-full md:w-72">
              <label className="block text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-1">Employé actif connecté</label>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  // Reseed max values
                  const chosen = employees.find(em => em.id === e.target.value);
                  if (chosen) {
                    const acc = Math.round(chosen.baseSalary * (workedDays / totalDays));
                    setEwaAmount(Math.round(acc * 0.3));
                  }
                }}
                className="w-full p-3 bg-indigo-950 text-white rounded-xl border border-indigo-700/60 text-xs focus:ring-2 focus:ring-indigo-550 focus:outline-none focus:bg-indigo-950 font-bold"
              >
                {activeStaff.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.position} ({formatCurrency(emp.baseSalary, companySettings.currency)}/m)</option>
                ))}
              </select>
            </div>
          </div>

          {currentEmployee ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              
              {/* Left & Middle Column: Interactive Products */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* PRODUCT 1: Earned Wage Access */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <TrendingUp size={20} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Acomptes en Temps Réel — Earned Wage Access (EWA)</h4>
                        <p className="text-xs text-slate-400">Retirez instantanément l'argent que vous avez déjà légalement gagné ce mois-ci.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
                      ZÉRO CRÉDIT • ZÉRO INTÉRÊT
                    </span>
                  </div>

                  {/* Calculations breakdown box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Jour de travail complétés</span>
                      <strong className="text-slate-800 text-lg font-black">{workedDays} / {totalDays} jours</strong>
                      <p className="text-[10px] text-indigo-600 font-bold font-mono">Simulé au {todayStr}</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Salaire brut capitalisé</span>
                      <strong className="text-emerald-700 text-lg font-mono font-black">
                        {formatCurrency(accruedSalary, companySettings.currency)}
                      </strong>
                      <p className="text-[10px] text-slate-400 leading-none">Proportion des jours œuvrés.</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                      <span className="text-[10px] text-indigo-600 uppercase font-black tracking-widest block flex items-center gap-1">
                        <span>Limite de retrait EWA</span>
                        <HelpCircle size={10} title="Maximum 50% du salaire brut capitalisé pour préserver votre solde de fin de mois." />
                      </span>
                      <strong className="text-indigo-950 text-lg font-mono font-black">
                        {formatCurrency(maxEwa, companySettings.currency)}
                      </strong>
                      <p className="text-[10px] text-slate-400 leading-none">Capacité de tirage disponible.</p>
                    </div>
                  </div>

                  {/* Range select form */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Sélectionner le montant à débloquer :</span>
                      <span className="font-mono text-base font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        {formatCurrency(ewaAmount, companySettings.currency)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={10000}
                      max={maxEwa || 50000}
                      step={5000}
                      value={ewaAmount}
                      onChange={(e) => setEwaAmount(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                      <span>{formatCurrency(10000, companySettings.currency)}</span>
                      <span>50% maximum : {formatCurrency(maxEwa, companySettings.currency)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-xs text-amber-900 leading-relaxed">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                    <p>
                      <strong>Information réglementaire :</strong> Ce montant sera versé sur votre moyen de paiement actif 
                      (<strong>{currentEmployee.paymentMethod} - {currentEmployee.bankAccountNumber}</strong>) d'ici quelques minutes. il s'agit d'un paiement en cours de mois, déduit directement de votre paie définitive de fin de mois.
                    </p>
                  </div>

                  <button
                    id="btn_submit_ewa_request"
                    onClick={handleRequestEwa}
                    className="w-full md:w-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider shadow-md shadow-indigo-100"
                  >
                    <span>Débloquer mon acompte instantanément</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* PRODUCT 2: Micro-Crédits Salarié */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <HandCoins size={20} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Crédits aux Employés — Prêts à Échéances Flexibles</h4>
                        <p className="text-xs text-slate-400">Bénéficiez de liquidités immédiates d'urgence, remboursables par mensualités lissées sur salaire.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1">
                      PARTENAIRE SOCIAL
                    </span>
                  </div>

                  {/* Calculator block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-4">
                      {/* Mount loan */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <label className="text-slate-500 font-bold">Montant du financement sollicité*</label>
                          <span className="font-mono text-xs font-bold text-slate-800">{formatCurrency(creditAmount, companySettings.currency)}</span>
                        </div>
                        <input
                          type="range"
                          min={100000}
                          max={1500000}
                          step={50000}
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(Number(e.target.value))}
                          className="w-full accent-orange-650 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold mt-1">
                          <span>100 000 FCFA</span>
                          <span>1 500 050 FCFA</span>
                        </div>
                      </div>

                      {/* Duration terms in months list */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Durée de remboursement (en mensualités)*</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 6, 9, 12].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setCreditDuration(m)}
                              className={`py-2 px-3 border text-xs font-bold rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
                                creditDuration === m 
                                  ? 'bg-orange-600 border-orange-600 text-white shadow-xs' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <span>{m} m</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Select purpose from dropdown */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motif principal du prêt</label>
                        <select
                          value={creditPurpose}
                          onChange={(e) => setCreditPurpose(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none focus:bg-white"
                        >
                          <option value="Scolarité / Frais de formation">📚 Scolarité / Frais de formation des enfants</option>
                          <option value="Urgence médicale familiale">🏥 Urgence médicale / Frais de santé</option>
                          <option value="Équipement / Fourniture de bureau">💻 Équipement professionnel ou informatique</option>
                          <option value="Travaux de rénovation de logement">🏠 Amélioration / Rénovation d'habitat</option>
                          <option value="Événement familial imminent">💍 Événement personnel ou fête familiale</option>
                        </select>
                      </div>
                    </div>

                    {/* Results right pane */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400">Simulation de Financement</h5>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Taux d'intérêt annuel :</span>
                            <span className="font-bold text-slate-800 flex items-center gap-0.5">
                              <Percent size={11} />
                              <span>1.5% fixe</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-y border-slate-200/80 py-2">
                            <span className="text-slate-500 font-medium">Coût global des intérêts :</span>
                            <strong className="text-slate-800 font-mono text-[11px]">
                              {formatCurrency(creditAmount * (creditDuration * (1.5 / 100)), companySettings.currency)}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Montant total dû :</span>
                            <strong className="text-slate-800 font-mono text-[11px]">
                              {formatCurrency(creditAmount * (1 + (creditDuration * (1.5 / 100))), companySettings.currency)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-dashed border-slate-200 text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 block">Mensualité prélevée sur Salaire :</span>
                        <span className="text-xl font-black font-mono text-indigo-600 block">
                          {formatCurrency(
                            Math.round((creditAmount * (1 + (creditDuration * (1.5 / 100)))) / creditDuration),
                            companySettings.currency
                          )}
                          <span className="text-xs font-normal text-slate-400"> / mois</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      id="btn_submit_credit_request"
                      onClick={handleRequestCredit}
                      className="w-full md:w-auto py-3 px-6 bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider shadow-md shadow-orange-100"
                    >
                      <HandCoins size={14} />
                      <span>Envoyer ma demande de financement</span>
                    </button>
                  </div>
                </div>

                {/* PRODUCT 3: Micro-Assurances */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <ShieldPlus size={20} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Produits d'Assurance PME Intégrés</h4>
                        <p className="text-xs text-slate-400">Sécurisez votre avenir et celui de vos proches avec des cotisations directes micro-prélèvement sans tracasserie.</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insuranceProducts.map((p) => {
                      const isSubscribed = insuranceSubscriptions.some(
                        ins => ins.employeeId === currentEmployee.id && ins.productType === p.type && ins.status === 'Actif'
                      );
                      const IconComponent = p.icon;

                      return (
                        <div 
                          key={p.type} 
                          className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden ${
                            isSubscribed 
                              ? 'border-purple-250 bg-purple-50/10 shadow-inner' 
                              : 'border-slate-150 hover:border-slate-350 bg-white shadow-xs'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`p-2 rounded-xl flex items-center justify-center bg-slate-50 ${isSubscribed ? 'bg-purple-100 text-purple-600' : 'text-slate-500'}`}>
                                <IconComponent size={18} />
                              </span>
                              <span className="font-mono text-xs font-black text-purple-600 bg-purple-50/80 px-2.5 py-1 rounded-lg">
                                {formatCurrency(p.premium, companySettings.currency)} / mois
                              </span>
                            </div>

                            <h5 className="text-xs font-black text-slate-800 leading-tight">{p.name}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{p.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center mt-3">
                            <span className="text-[10px] text-slate-400">
                              {isSubscribed ? '🟢 Couverture active' : '🔴 Non souscrit(e)'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleInsurance(p.type, p.name, p.premium)}
                              className={`py-1.5 px-3.5 text-[10px] font-black rounded-lg uppercase tracking-wider cursor-pointer border transition-all ${
                                isSubscribed 
                                  ? 'bg-red-50 border-red-150 text-red-600 hover:bg-red-100' 
                                  : 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isSubscribed ? 'Résilié' : 'Souscrire'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* Right Column: Employee Profile Details Summary & History logs */}
              <div className="space-y-6">
                
                {/* Employee Account Detail summary card */}
                <div className="bg-slate-50 rounded-3xl border border-slate-150 p-6 space-y-4 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {currentEmployee.firstName[0]}{currentEmployee.lastName[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm leading-tight">{currentEmployee.firstName} {currentEmployee.lastName}</h5>
                      <span className="text-[10px] bg-slate-200/80 text-slate-500 font-extrabold uppercase px-2 py-0.5 mt-1 rounded-sm inline-block tracking-wider">
                        {currentEmployee.department}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200/80 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400">Poste :</span>
                      <strong className="text-slate-700">{currentEmployee.position}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400">Salaire Mensuel Brut :</span>
                      <strong className="text-slate-700 font-mono">{formatCurrency(currentEmployee.baseSalary, companySettings.currency)}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400">Moyen de réception :</span>
                      <strong className="text-indigo-600 font-bold">{currentEmployee.paymentMethod}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400">RIB / Coordonnées :</span>
                      <strong className="text-slate-700 font-mono break-all font-semibold max-w-[150px] text-right text-[11px]">{currentEmployee.bankAccountNumber}</strong>
                    </div>
                  </div>
                </div>

                {/* Subscriptions summary widget */}
                <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-xs">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Vos Couvertures Actives</h5>
                  
                  {insuranceSubscriptions.filter(ins => ins.employeeId === currentEmployee.id && ins.status === 'Actif').length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-300 font-medium">Aucune assurance active enregistrée.</div>
                  ) : (
                    <div className="space-y-2">
                      {insuranceSubscriptions.filter(ins => ins.employeeId === currentEmployee.id && ins.status === 'Actif').map((ins) => (
                        <div key={ins.id} className="p-3 bg-purple-50/20 border border-purple-100/50 rounded-xl flex justify-between items-center">
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{ins.productName}</p>
                            <span className="text-[9px] text-slate-400">Date d'effet : {ins.startDate}</span>
                          </div>
                          <span className="font-mono text-xs font-black text-purple-700 shrink-0">
                            -{formatCurrency(ins.monthlyPremium, companySettings.currency)}/m
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial histories logs */}
                <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-xs">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tableau de suivi des demandes</h5>
                  
                  {/* Wage advances log */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1">
                      Avances de Salaire (EWA)
                    </span>
                    {wageAdvances.filter(ewa => ewa.employeeId === currentEmployee.id).length === 0 ? (
                      <p className="text-[11px] text-slate-350 italic">Aucune avance demandée ce mois-ci.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {wageAdvances.filter(ewa => ewa.employeeId === currentEmployee.id).map((e) => (
                          <div key={e.id} className="text-xs p-2.5 hover:bg-slate-50 flex justify-between items-center border border-slate-100 rounded-xl">
                            <div>
                              <p className="font-bold text-slate-700 font-mono">{formatCurrency(e.amount, companySettings.currency)}</p>
                              <span className="text-[9px] text-slate-400">Crée le : {e.requestDate}</span>
                            </div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              e.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                              e.status === 'Payé' ? 'bg-indigo-50 text-indigo-700' :
                              e.status === 'Refusé' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {e.status === 'Approuvé' ? 'Attente Payroll' :
                               e.status === 'Payé' ? 'Prélevé' : e.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Credits summary log */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1">
                      Crédits en cours
                    </span>
                    {employeeCredits.filter(c => c.employeeId === currentEmployee.id).length === 0 ? (
                      <p className="text-[11px] text-slate-350 italic">Aucun crédit actif.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {employeeCredits.filter(c => c.employeeId === currentEmployee.id).map((c) => (
                          <div key={c.id} className="text-xs p-2.5 hover:bg-slate-50 flex flex-col gap-1.5 border border-slate-100 rounded-xl">
                            <div className="flex justify-between items-center">
                              <p className="font-black text-slate-700 font-mono text-[11px]">{formatCurrency(c.totalAmount, companySettings.currency)}</p>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                                c.status === 'Actif' ? 'bg-emerald-50 text-emerald-750' :
                                c.status === 'Remboursé' ? 'bg-blue-50 text-blue-700' :
                                c.status === 'Refusé' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                              <span>Prélèvement : <strong>{formatCurrency(c.monthlyInstallment, companySettings.currency)} / mois</strong></span>
                              <span>Échéance : <strong>{c.monthsPaidCount} / {c.monthsDuration} mois</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
              <ShieldAlert className="text-slate-300 mx-auto mb-4" size={32} />
              <p className="text-slate-500 text-sm font-medium">Veuillez d'abord sélectionner un collaborateur valide ci-dessus pour simuler ses données.</p>
            </div>
          )}

        </div>
      ) : (
        /* ADMIN/HR TAB VIEW SCREEN */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Main List Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* WAGE ADVANCES AUDIT PANE */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Demandes d'avances de salaires (Earned Wage Access)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Retrait en cours de mois émis directement de manière autonome par le personnel.</p>
                </div>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 py-0.5 px-2.5 rounded-sm">
                  {wageAdvances.filter(w => w.status === 'En attente').length} À traiter
                </span>
              </div>

              {wageAdvances.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Aucune demande enregistrée à ce jour.</div>
              ) : (
                <div className="divide-y divide-slate-100 font-sans">
                  {wageAdvances.map((ewa) => {
                    const empObj = employees.find(e => e.id === ewa.employeeId);
                    return (
                      <div key={ewa.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-indigo-700 border border-slate-200">
                            {ewa.employeeName.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{ewa.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{empObj?.position || 'Collaborateur'}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Demandé le : {ewa.requestDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Montant réclamé</span>
                            <span className="font-mono text-xs font-black text-indigo-700">
                              {formatCurrency(ewa.amount, companySettings.currency)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {ewa.status === 'En attente' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveEwa(ewa.id, empObj?.email || 'admin@jefara.com')}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition cursor-pointer border border-emerald-150"
                                  title="Approuver la demande"
                                >
                                  <Check size={14} className="stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectEwa(ewa.id, empObj?.email || 'admin@jefara.com')}
                                  className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition cursor-pointer border border-rose-150"
                                  title="Refuser la demande"
                                >
                                  <X size={14} className="stroke-[3]" />
                                </button>
                              </>
                            ) : (
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                                ewa.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                                ewa.status === 'Payé' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {ewa.status === 'Approuvé' ? 'Règlement paie en suspens' :
                                 ewa.status === 'Payé' ? 'Déduit du salaire' : ewa.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* EMPLOYEE LOANS AUDIT PANE */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Dossiers de Crédits aux Employés</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Auditez et autorisez les financements sociaux soutenus par l'entreprise.</p>
                </div>
                <span className="text-[10px] font-black bg-orange-50 text-orange-700 py-0.5 px-2.5 rounded-sm">
                  {employeeCredits.filter(c => c.status === 'En attente').length} En étude
                </span>
              </div>

              {employeeCredits.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Aucun crédit réclamé pour le moment.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {employeeCredits.map((c) => {
                    const empObj = employees.find(e => e.id === c.employeeId);
                    return (
                      <div key={c.id} className="p-5 space-y-4 hover:bg-slate-50/40 transition">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-orange-600 border border-slate-200">
                              {c.employeeName.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{c.employeeName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{empObj?.position || 'Collaborateur'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-4 text-left md:text-right">
                            <div className="grid grid-cols-2 md:flex md:items-center gap-4">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Montant du prêt</span>
                                <span className="font-mono text-xs font-black text-slate-800">
                                  {formatCurrency(c.totalAmount, companySettings.currency)}
                                </span>
                              </div>
                              <div className="md:border-l md:border-slate-200 md:pl-4">
                                <span className="text-[9px] text-indigo-600 uppercase font-black block">Retenue / Mensuel</span>
                                <span className="font-mono text-xs font-black text-indigo-600">
                                  {formatCurrency(c.monthlyInstallment, companySettings.currency)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 self-end md:self-center">
                              {c.status === 'En attente' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCredit(c.id, empObj?.email || 'admin@jefara.com')}
                                    className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition cursor-pointer border border-emerald-150"
                                    title="Approuver et activer l'échéance"
                                  >
                                    <Check size={14} className="stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectCredit(c.id, empObj?.email || 'admin@jefara.com')}
                                    className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition cursor-pointer border border-rose-150"
                                    title="Refuser"
                                  >
                                    <X size={14} className="stroke-[3]" />
                                  </button>
                                </>
                              ) : (
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                                  c.status === 'Actif' ? 'bg-emerald-50 text-emerald-700' :
                                  c.status === 'Remboursé' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {c.status === 'Actif' ? `Prélèvement actif (${c.monthsPaidCount}/${c.monthsDuration}m)` : c.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Motif row details */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px] text-slate-600 leading-relaxed font-sans">
                          <strong>Motif déclaré :</strong> {c.purpose}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column details list for Admin */}
          <div className="space-y-6">
            
            {/* Aggregate Statistics Block */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 text-white space-y-5 border border-indigo-950">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                AUDIT DES SERVICES INTÉGRÉS
              </span>

              <div className="divide-y divide-indigo-900">
                <div className="py-3 flex justify-between items-center">
                  <span className="text-xs text-indigo-300">Crédits globaux actifs :</span>
                  <strong className="text-sm font-mono text-white">
                    {formatCurrency(
                      employeeCredits.filter(c=>c.status === 'Actif').reduce((sum,c)=>sum + c.totalAmount, 0),
                      companySettings.currency
                    )}
                  </strong>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-xs text-indigo-300">Acomptes (EWA) validés :</span>
                  <strong className="text-sm font-mono text-white">
                    {formatCurrency(
                      wageAdvances.filter(w=>w.status === 'Approuvé' || w.status === 'Payé').reduce((sum,w)=>sum + w.amount, 0),
                      companySettings.currency
                    )}
                  </strong>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-xs text-indigo-300">Abonnés Assurance globale :</span>
                  <strong className="text-sm text-white">
                    {insuranceSubscriptions.filter(s=>s.status === 'Actif').length} assureurs
                  </strong>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-xs text-indigo-300">Prélèvements mensuels totaux :</span>
                  <strong className="text-emerald-400 font-mono text-sm">
                    {formatCurrency(
                      // Sum active loan installments + insurance premiums active
                      employeeCredits.filter(c=>c.status === 'Actif').reduce((sum,c)=>sum + c.monthlyInstallment, 0) +
                      insuranceSubscriptions.filter(s=>s.status === 'Actif').reduce((sum,s)=>sum + s.monthlyPremium, 0),
                      companySettings.currency
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* Total Insurance active list widget for administrators */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">État des Abonnements Mutuelles</h5>
                <span className="text-[10px] bg-purple-50 text-purple-700 py-0.5 px-2.5 rounded-full font-bold">
                  {insuranceSubscriptions.filter(s=>s.status==='Actif').length} Actifs
                </span>
              </div>

              {insuranceSubscriptions.filter(s=>s.status === 'Actif').length === 0 ? (
                <p className="text-xs text-slate-300 py-4 text-center font-medium">Aucun abonné enregistré.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {insuranceSubscriptions.filter(s=>s.status === 'Actif').map((sub) => (
                    <div key={sub.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{sub.employeeName}</span>
                        <span className="font-mono font-black text-purple-700">{formatCurrency(sub.monthlyPremium, companySettings.currency)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{sub.productName}</span>
                        <span>Effet : {sub.startDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info compliance segment */}
            <div className="bg-blue-50 border border-blue-150 rounded-3xl p-5 text-blue-900 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="text-blue-600" size={16} />
                <span>Réglementations & Paie locale</span>
              </div>
              <p>
                L'ensemble de ces micro-produits d'épargne d'acomptes et de assurances est conçu conformément au code du travail de votre région réglementaire (<strong>{companySettings.country}</strong>).
                Les retenues sur salaires pour le remboursement des prêts personnels sont paramétrées dans la limite légale de la quotité saisissable du bulletin de paie.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Percent, Calculator, FileSpreadsheet, ArrowRight, Check, X, 
  Download, Sparkles, Coins, HelpCircle, FileText, Plus, AlertCircle, TrendingUp, 
  Printer, ArrowUpRight, ArrowDownLeft, Receipt
} from 'lucide-react';
import { Employee, CompanySettings, PayslipHistoryItem, PayrollRun, ExpenseClaim, ProvisionConfig, WageAdvance, EmployeeCredit } from '../types';
import { formatCurrency } from '../utils/calculator';

interface AccountingViewProps {
  employees: Employee[];
  companySettings: CompanySettings;
  payrollRuns: PayrollRun[];
  payslips: PayslipHistoryItem[];
  expenseClaims: ExpenseClaim[];
  setExpenseClaims: React.Dispatch<React.SetStateAction<ExpenseClaim[]>>;
  provisions: ProvisionConfig[];
  setProvisions: React.Dispatch<React.SetStateAction<ProvisionConfig[]>>;
  wageAdvances: WageAdvance[];
  employeeCredits: EmployeeCredit[];
}

export default function AccountingView({
  employees,
  companySettings,
  payrollRuns,
  payslips,
  expenseClaims,
  setExpenseClaims,
  provisions,
  setProvisions,
  wageAdvances,
  employeeCredits
}: AccountingViewProps) {
  // Navigation tabs: 'dashboard' | 'journal' | 'provisions' | 'expenses'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'provisions' | 'expenses'>('dashboard');

  // Selected Month for journal generation
  const [selectedMonth, setSelectedMonth] = useState<string>('Mai 2026');

  // New claim form state
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newClaim, setNewClaim] = useState({
    employeeId: employees[0]?.id || '',
    type: 'Transport' as const,
    description: '',
    amount: ''
  });

  // Dynamic values based on current payslip history of the selected month
  const slipsOfSelectedMonth = payslips.filter(s => s.month === selectedMonth);
  
  // Calculate aggregate payroll financial numbers for selected month
  const totalBaseOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalNetOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPensionOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.pensionContribution, 0);
  const totalHealthOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.healthContribution, 0);
  const totalTaxOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.incomeTax, 0);
  
  // Patronales (Employer charges)
  const totalEmployerPension = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.employerPension, 0);
  const totalEmployerHealth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.employerHealth, 0);
  const totalEmployerFamily = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.employerFamily, 0);
  const totalEmployerChargesOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + s.slipDetail.totalEmployerCharges, 0);

  // Financial services deductions on chosen month's slips
  const totalEwaDeductionsOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + (s.wageAdvanceDeduction || 0), 0);
  const totalCreditDeductionsOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + (s.creditDeduction || 0), 0);
  const totalInsuranceDeductionsOfSelectedMonth = slipsOfSelectedMonth.reduce((sum, s) => sum + (s.insuranceDeduction || 0), 0);

  // General Dashboard aggregates (Cumulative of everything)
  const allTimeSalariesGross = payslips.reduce((sum, s) => sum + s.baseSalary, 0);
  const allTimeNetPaid = payslips.reduce((sum, s) => sum + s.netSalary, 0);
  const allTimeEmployerCharges = payslips.reduce((sum, s) => sum + s.slipDetail.totalEmployerCharges, 0);
  const totalAccruedProvisions = provisions.reduce((sum, p) => sum + p.accruedAmount, 0);
  const totalReimbursedExpenses = expenseClaims.filter(c => c.status === 'Remboursé').reduce((sum, c) => sum + c.amount, 0);
  const totalEwaPaid = wageAdvances.filter(w => w.status === 'Payé' || w.status === 'Approuvé').reduce((sum, w) => sum + w.amount, 0);
  const totalCreditsActive = employeeCredits.filter(c => c.status === 'Actif').reduce((sum, c) => sum + c.totalAmount, 0);

  // Form submit for quick manual invoice or cost claim entry
  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(newClaim.amount);
    if (!newClaim.description || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez introduire des données de note de frais valides.');
      return;
    }

    const employeeObj = employees.find(emp => emp.id === newClaim.employeeId);
    if (!employeeObj) return;

    const claim: ExpenseClaim = {
      id: `claim-${Date.now()}`,
      employeeId: newClaim.employeeId,
      employeeName: `${employeeObj.firstName} ${employeeObj.lastName}`,
      type: newClaim.type,
      description: newClaim.description,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'En attente'
    };

    setExpenseClaims(prev => [claim, ...prev]);
    setIsAddingClaim(false);
    setNewClaim({
      employeeId: employees[0]?.id || '',
      type: 'Transport',
      description: '',
      amount: ''
    });
  };

  // Claim status handlers
  const handleApproveClaim = (id: string) => {
    setExpenseClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approuvé' } : c));
  };

  const handleRejectClaim = (id: string) => {
    setExpenseClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Refusé' } : c));
  };

  const handleReimburseClaim = (id: string) => {
    setExpenseClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Remboursé' } : c));
  };

  // Provisions adjustment
  const handleAdjustProvisions = (employeeId: string, level: 'leave' | 'retirement', value: number) => {
    setProvisions(prev => prev.map(p => {
      if (p.employeeId === employeeId) {
        if (level === 'leave') {
          return { ...p, monthlyLeaveProvision: value, accruedAmount: p.accruedAmount + (value - p.monthlyLeaveProvision) };
        } else {
          return { ...p, fringeRetirementIndemnity: value, accruedAmount: p.accruedAmount + (value - p.fringeRetirementIndemnity) };
        }
      }
      return p;
    }));
  };

  // Run monthly provisions generation simulation
  const handleTriggerProvisionsAccrual = () => {
    // Increment all accrued values by their relative monthly rates
    setProvisions(prev => prev.map(p => ({
      ...p,
      accruedAmount: p.accruedAmount + p.monthlyLeaveProvision + p.fringeRetirementIndemnity
    })));
    alert('Les provisions pour congés payés et indemnités de fin de carrière pour le mois en cours ont été calculées et comptabilisées avec succès.');
  };

  // Automated SYSCOHADA Ledger Book Generator
  const generateSyscohadaJournal = () => {
    // Standard corporate accounting structure under West & Central Africa SYSCOHADA Code
    const entries = [];
    
    // Check if we have payslips for this month
    if (slipsOfSelectedMonth.length === 0) {
      return [];
    }

    // 1. Base / Gross Salaries (Debit 6611 - Salaires)
    entries.push({
      account: '6611',
      label: `Personnel : Rémunérations salaires de base — Paie ${selectedMonth}`,
      debit: totalBaseOfSelectedMonth,
      credit: 0,
      type: 'charges'
    });

    // 2. Indemnity/reimbursements if there are approved or paid claims this month (Debit 667 - Frais remboursés)
    const approvedClaimsAmount = expenseClaims
      .filter(c => c.status === 'Remboursé' && c.date.includes('2026-06')) // simulated month
      .reduce((sum, c) => sum + c.amount, 0);

    if (approvedClaimsAmount > 0) {
      entries.push({
        account: '667',
        label: `Indemnités et remboursements de frais professionnels — ${selectedMonth}`,
        debit: approvedClaimsAmount,
        credit: 0,
        type: 'charges'
      });
    }

    // 3. Social Charges - Employer portion (Debit 663 - Charges Patronales)
    if (totalEmployerChargesOfSelectedMonth > 0) {
      entries.push({
        account: '6631',
        label: `Charges sociales patronales (CNPS / IPRES) — Paie ${selectedMonth}`,
        debit: totalEmployerChargesOfSelectedMonth,
        credit: 0,
        type: 'charges'
      });
    }

    // 4. Leave & retirement Provisions calculated (Debit 6615 / 6618 - Dotations provisions)
    const monthlyAccruedProvisions = provisions.reduce((sum, p) => sum + p.monthlyLeaveProvision + p.fringeRetirementIndemnity, 0);
    if (monthlyAccruedProvisions > 0) {
      entries.push({
        account: '6615',
        label: `Dotation aux provisions pour congés payés & IFC — ${selectedMonth}`,
        debit: Math.round(monthlyAccruedProvisions),
        credit: 0,
        type: 'provisions'
      });

      entries.push({
        account: '4228',
        label: `Provisions pour congés payés & indemnités du personnel — ${selectedMonth}`,
        debit: 0,
        credit: Math.round(monthlyAccruedProvisions),
        type: 'provisions'
      });
    }

    // 5. Deductible EWA Advance (Credit 421 - Avances et acomptes)
    if (totalEwaDeductionsOfSelectedMonth > 0) {
      entries.push({
        account: '4212',
        label: `Retenue sur acompte d'intégration financière EWA — ${selectedMonth}`,
        debit: 0,
        credit: totalEwaDeductionsOfSelectedMonth,
        type: 'rattachés'
      });
    }

    // 6. Deductible Loans (Credit 4281 - Prêts au personnel)
    if (totalCreditDeductionsOfSelectedMonth > 0) {
      entries.push({
        account: '4281',
        label: `Retenue sur prêt social Jefara Finance — ${selectedMonth}`,
        debit: 0,
        credit: totalCreditDeductionsOfSelectedMonth,
        type: 'rattachés'
      });
    }

    // 7. Deductible Insurances/Benefits (Credit 438 - Assurances prélevées)
    if (totalInsuranceDeductionsOfSelectedMonth > 0) {
      entries.push({
        account: '4382',
        label: `Prélèvements mutuelle santé & assurances collectives — ${selectedMonth}`,
        debit: 0,
        credit: totalInsuranceDeductionsOfSelectedMonth,
        type: 'taxes'
      });
    }

    // 8. Social Security Liabilities Employee + Employer (Credit 4311 - Organismes Sociaux CNPS / IPRES)
    const combinedSocialLiabilities = totalPensionOfSelectedMonth + totalHealthOfSelectedMonth + totalEmployerChargesOfSelectedMonth;
    if (combinedSocialLiabilities > 0) {
      entries.push({
        account: '4311',
        label: `Organismes sociaux (CNPS / Securité Sociale rattachée) — ${selectedMonth}`,
        debit: 0,
        credit: combinedSocialLiabilities,
        type: 'taxes'
      });
    }

    // 9. State Income Taxation (Credit 4421 - État, Impôt sur le revenu retenu à la source)
    if (totalTaxOfSelectedMonth > 0) {
      entries.push({
        account: '4421',
        label: `État : Retenues à la source sur traitements (IRPP / IGR) — ${selectedMonth}`,
        debit: 0,
        credit: totalTaxOfSelectedMonth,
        type: 'taxes'
      });
    }

    // 10. Net Salaries Due to Staff (Credit 422 - Personnel, rémunérations dues)
    entries.push({
      account: '4221',
      label: `Personnel : Rémunérations nettes dues — Paie ${selectedMonth}`,
      debit: 0,
      credit: totalNetOfSelectedMonth,
      type: 'salaires'
    });

    return entries;
  };

  const syscohadaLines = generateSyscohadaJournal();
  const totalDebitSum = syscohadaLines.reduce((sum, l) => sum + l.debit, 0);
  const totalCreditSum = syscohadaLines.reduce((sum, l) => sum + l.credit, 0);

  // File download simulation
  const handleExportFEC = () => {
    alert(`Le fichier standardisé des écritures comptables (FEC) au format d'intégration ERP (SAGE, Odoo, QuickBooks) pour le mois de ${selectedMonth} a été packagé et téléchargé sur votre poste.`);
  };

  return (
    <div id="accounting_module_wrapper" className="space-y-6">
      
      {/* 1. HEADER SECTION & NAVIGATION TABS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white border border-slate-100 rounded-3xl p-6 gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <Calculator size={20} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">MODE COMPTABILITÉ UNIFIÉE</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
            Pilotage Comptable & Financier de la Paie
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Notez les écritures, configurez les dotations aux provisions et approuvez les frais professionnels selon les normes fiscales de l'Afrique Subsaharienne.</p>
        </div>

        {/* Tab-row navigator */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full xl:w-auto overflow-x-auto select-none border border-slate-200">
          {(['dashboard', 'journal', 'provisions', 'expenses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'dashboard' ? 'Indicateurs Financiers' :
               tab === 'journal' ? 'SYSCOHADA Journal' :
               tab === 'provisions' ? 'Gestion des Provisions' : 'Notes de Frais'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB SECTIONS */}

      {/* A. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Masse de Personnel (Brut)</span>
                <strong className="text-slate-800 font-mono text-lg font-black block mt-1">
                  {formatCurrency(allTimeSalariesGross, companySettings.currency)}
                </strong>
                <span className="text-[10px] text-slate-400">Total cumulé versé</span>
              </div>
              <span className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Coins size={20} />
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Charges Sociales Patronales</span>
                <strong className="text-slate-800 font-mono text-lg font-black block mt-1">
                  {formatCurrency(allTimeEmployerCharges, companySettings.currency)}
                </strong>
                <span className="text-[10px] text-slate-400">CNPS, IPRES & Retraite</span>
              </div>
              <span className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <Percent size={20} />
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Provisions Sociales</span>
                <strong className="text-slate-800 font-mono text-lg font-black block mt-1">
                  {formatCurrency(totalAccruedProvisions, companySettings.currency)}
                </strong>
                <span className="text-[10px] text-slate-400">Congés & Indemnités IFC</span>
              </div>
              <span className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Calculator size={20} />
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Frais Professionnels</span>
                <strong className="text-slate-800 font-mono text-lg font-black block mt-1">
                  {formatCurrency(totalReimbursedExpenses, companySettings.currency)}
                </strong>
                <span className="text-[10px] text-slate-400">Note de frais remboursées</span>
              </div>
              <span className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Receipt size={20} />
              </span>
            </div>

          </div>

          {/* Integrated Balance breakdown bento blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left box: Expenditure Distribution visual list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Répartition du Coût Salarial de l'Entreprise</h4>
                <p className="text-[11px] text-slate-400 mt-1">Les salaires réels versés par rapport aux charges et provisions de l'entreprise.</p>
              </div>

              <div className="space-y-4">
                {/* Salaries net */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Salaire Net Déboursé (Compte classe 42)</span>
                    <span className="font-mono">{formatCurrency(allTimeNetPaid, companySettings.currency)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(allTimeNetPaid / (allTimeSalariesGross + allTimeEmployerCharges)) * 100 || 0}%` }} />
                  </div>
                </div>

                {/* Retenues salariales */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Retenues Fiscales & Sociales (Comptes 43 & 44)</span>
                    <span className="font-mono">{formatCurrency(allTimeSalariesGross - allTimeNetPaid, companySettings.currency)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${((allTimeSalariesGross - allTimeNetPaid) / (allTimeSalariesGross + allTimeEmployerCharges)) * 100 || 0}%` }} />
                  </div>
                </div>

                {/* Employer charges */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Charges Patronales Sociales (Compte classe 663)</span>
                    <span className="font-mono">{formatCurrency(allTimeEmployerCharges, companySettings.currency)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(allTimeEmployerCharges / (allTimeSalariesGross + allTimeEmployerCharges)) * 100 || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-[11px] text-slate-500 leading-relaxed font-sans">
                <span className="font-bold text-slate-700 block mb-1">💡 Perspective SYSCOHADA</span>
                L'ensemble de ces charges sont comptabilisées au débit de la classe 66 (Charges de Personnel) et au crédit de la classe 4 (Tiers) dès la fin de calcul de la paie.
              </div>
            </div>

            {/* Middle box: Integration Financial services statistics */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:col-span-2 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Services Financiers & Mouvements de Trésorerie Salarié</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Avances accordées, micro-crédits et versements prélevés directement sur les cycles de paie.</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">Flux du Personnel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Advance mini stat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase">
                    <ArrowUpRight size={14} />
                    <span>Acomptes EWA</span>
                  </div>
                  <h5 className="font-bold text-slate-800 font-mono text-base">{formatCurrency(totalEwaPaid, companySettings.currency)}</h5>
                  <p className="text-[10px] text-slate-400">Total liquidités instantanées débloquées.</p>
                </div>

                {/* Credit mini stat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                  <div className="flex items-center gap-1.5 text-orange-650 font-bold text-xs uppercase">
                    <TrendingUp size={14} />
                    <span>Crédits Actifs</span>
                  </div>
                  <h5 className="font-bold text-slate-800 font-mono text-base">{formatCurrency(totalCreditsActive, companySettings.currency)}</h5>
                  <p className="text-[10px] text-slate-400">Volume principal prêté engagé.</p>
                </div>

                {/* Insurance mini stat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs uppercase">
                    <ArrowDownLeft size={14} />
                    <span>Assurances Mutuelles</span>
                  </div>
                  <h5 className="font-bold text-slate-800 font-mono text-base">
                    {formatCurrency(
                      payslips.reduce((sum, s) => sum + (s.insuranceDeduction || 0), 0),
                      companySettings.currency
                    )}
                  </h5>
                  <p className="text-[10px] text-slate-400">Cumulé des cotisations mutuelles.</p>
                </div>

              </div>

              <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-50 px-4 py-2 font-bold text-slate-500 border-b border-slate-150 text-[10px] uppercase">
                  <span>Collaborateur</span>
                  <span>Produit financier</span>
                  <span className="text-right">Remboursement</span>
                  <span className="text-right">Statut en Paie</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {employeeCredits.map(c => (
                    <div key={c.id} className="grid grid-cols-4 px-4 py-2.5 text-slate-700 font-semibold items-center">
                      <span>{c.employeeName}</span>
                      <span>Prêt - {c.purpose}</span>
                      <span className="text-right font-mono">{formatCurrency(c.monthlyInstallment, companySettings.currency)}/m</span>
                      <span className="text-right text-[10px]">
                        <strong className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">{c.status}</strong>
                      </span>
                    </div>
                  ))}
                  {wageAdvances.map(w => (
                    <div key={w.id} className="grid grid-cols-4 px-4 py-2.5 text-slate-700 font-semibold items-center">
                      <span>{w.employeeName}</span>
                      <span>Acompte sur salaire</span>
                      <span className="text-right font-mono">{formatCurrency(w.amount, companySettings.currency)}</span>
                      <span className="text-right text-[10px]">
                        <strong className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm">{w.status}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* B. SYSCOHADA JOURNAL & FEC EXPORT */}
      {activeTab === 'journal' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Générateur d'Écritures Comptables (Conformité SYSCOHADA)</h3>
              <p className="text-xs text-slate-400 mt-1">Générez dynamiquement toutes les écritures de classe 6 et classe 4 relatives à un cycle d'exécution de paie validé.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Juin 2026">Juin 2026</option>
                <option value="Mai 2026">Mai 2026</option>
                <option value="Avril 2026">Avril 2026</option>
                <option value="Mars 2026">Mars 2026</option>
              </select>

              <button
                type="button"
                onClick={handleExportFEC}
                disabled={syscohadaLines.length === 0}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider h-10 shadow-xs"
              >
                <Download size={14} />
                <span>Exporter FEC</span>
              </button>
            </div>
          </div>

          {syscohadaLines.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <AlertCircle className="text-slate-400 mx-auto mb-2" size={24} />
              <p className="text-slate-600 text-xs font-bold">Aucune transaction de paie comptabilisée pour {selectedMonth}.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">Vous devez au préalable exécuter la paie de cette période dans la section "Exécuter la paie".</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-slate-150 rounded-2xl overflow-hidden font-mono text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-150 py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-2">Compte</div>
                  <div className="col-span-6">Libellé de l'Opération (SYSCOHADA)</div>
                  <div className="col-span-2 text-right">Débit</div>
                  <div className="col-span-2 text-right">Crédit</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto bg-white">
                  {syscohadaLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 py-3 px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-colors items-center">
                      <div className="col-span-2 font-bold text-slate-900">{line.account}</div>
                      <div className="col-span-6 text-slate-600 text-[11px] font-sans truncate pr-4">{line.label}</div>
                      <div className="col-span-2 text-right text-indigo-700">
                        {line.debit > 0 ? formatCurrency(line.debit, companySettings.currency) : '-'}
                      </div>
                      <div className="col-span-2 text-right text-emerald-600 font-bold">
                        {line.credit > 0 ? formatCurrency(line.credit, companySettings.currency) : '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Balanced Summary footer */}
                <div className="grid grid-cols-12 bg-slate-100 py-4 px-4 font-black text-slate-800 border-t border-slate-200">
                  <div className="col-span-8 font-sans font-extrabold text-[11px] flex items-center gap-2">
                    <Check className="text-emerald-600 stroke-[3.5]" size={15} />
                    <span>Écritures comptables équilibrées (Partie Double valide)</span>
                  </div>
                  <div className="col-span-2 text-right font-mono font-black text-indigo-600">
                    {formatCurrency(totalDebitSum, companySettings.currency)}
                  </div>
                  <div className="col-span-2 text-right font-mono font-black text-emerald-600">
                    {formatCurrency(totalCreditSum, companySettings.currency)}
                  </div>
                </div>
              </div>

              <div id="journal_compliance_note" className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 text-[11px] text-indigo-900 font-sans leading-relaxed">
                <HelpCircle className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="block mb-0.5">Note règlementaire Afrique Francophone (SYSCOHADA Révisé) :</strong>
                  Toutes les écritures de paie présentées ci-dessus sont réparties en journaux de personnel conformes et imputables dans votre logiciel comptable local. Elles reprennent de façon distincte les salaires bruts (comptes 6611), les retenues de sécurité sociale salariales (comptes 4311/CNPS/IPRES), les taxes locales sur traitements et salaires prélevées par la source (comptes 4421/IGR/IRPP), et l'en-cours total des net à payer déboursés directement sur banque ou mobile money (compte 4221).
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* C. PROVISIONS SECTION */}
      {activeTab === 'provisions' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Fin de Carrière & Provisions de Rémunération Sociale</h3>
              <p className="text-xs text-slate-400 mt-1">Paramétrez et accumulez les dotations obligatoires (IFC) et les provisions pour congés payés du personnel.</p>
            </div>

            <button
              onClick={handleTriggerProvisionsAccrual}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider h-10 shadow-xs"
            >
              <Sparkles size={14} />
              <span>Calculer dotation du mois</span>
            </button>
          </div>

          <div className="border border-slate-150 rounded-2xl overflow-hidden font-sans text-xs">
            {/* Header row */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-150 py-3 px-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">
              <div className="col-span-3">Collaborateur</div>
              <div className="col-span-3">Provision mensuelle Congés Payés (Ajustable)</div>
              <div className="col-span-3">Prov. mensuelle Indemnité Fin de Carrière</div>
              <div className="col-span-3 text-right">Provision Globale Accumulée</div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {provisions.map((prov) => {
                const empObj = employees.find(e => e.id === prov.employeeId);
                const baseSal = empObj ? empObj.baseSalary : 350000;

                return (
                  <div key={prov.id} className="grid grid-cols-12 py-4 px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-colors items-center">
                    {/* Name */}
                    <div className="col-span-3">
                      <p className="font-bold text-slate-800">{prov.employeeName}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{empObj?.position || 'Membre d\'équipe'}</span>
                    </div>

                    {/* Congés payés inputs */}
                    <div className="col-span-3 pr-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={prov.monthlyLeaveProvision}
                          onChange={(e) => handleAdjustProvisions(prov.employeeId, 'leave', Number(e.target.value))}
                          className="w-full pl-3 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold"
                        />
                        <span className="absolute right-2 top-1.5 text-[9px] text-slate-400 font-bold uppercase font-sans">FCFA</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 inline-block">Suggéré (1/12 du salaire) : {Math.round(baseSal / 12)}</span>
                    </div>

                    {/* Fin de carrières inputs */}
                    <div className="col-span-3 pr-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={prov.fringeRetirementIndemnity}
                          onChange={(e) => handleAdjustProvisions(prov.employeeId, 'retirement', Number(e.target.value))}
                          className="w-full pl-3 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold"
                        />
                        <span className="absolute right-2 top-1.5 text-[9px] text-slate-400 font-bold uppercase font-sans">FCFA</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 inline-block">Suggéré (2% à 5% de base) : {Math.round(baseSal * 0.04)}</span>
                    </div>

                    {/* Cumulative accruals */}
                    <div className="col-span-3 text-right">
                      <strong className="text-purple-600 bg-purple-50 border border-purple-100/50 font-mono text-[13px] font-black px-3 py-1 rounded-lg">
                        {formatCurrency(prov.accruedAmount, companySettings.currency)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* D. NOTES DE FRAIS ET REMBOURSEMENTS */}
      {activeTab === 'expenses' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Gestion des Notes de Frais & Remboursements Professionnels</h3>
              <p className="text-xs text-slate-400 mt-1">Auditez, validez et orchestrez les demandes de note de frais émises par votre personnel.</p>
            </div>

            <button
              onClick={() => setIsAddingClaim(!isAddingClaim)}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider h-10 shadow-xs"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Saisir une note de frais</span>
            </button>
          </div>

          <AnimatePresence>
            {isAddingClaim && (
              <motion.form 
                onSubmit={handleAddClaim}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 rounded-2xl border border-slate-150 p-5 space-y-4 overflow-hidden"
              >
                <h4 className="text-slate-800 text-xs font-black uppercase tracking-wider">Nouvelle indemnisation de frais de mission</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Employee select */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Employé concerné*</label>
                    <select
                      value={newClaim.employeeId}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                    >
                      {employees.filter(e=>e.status==='Actif').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type expense select */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Catégorie de frais*</label>
                    <select
                      value={newClaim.type}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Transport">🚖 Transport / Indemnités km</option>
                      <option value="Restauration">🍕 Restauration / Repas clients</option>
                      <option value="Hébergement">🏨 Hébergement / Hôtel</option>
                      <option value="Santé">🩺 Médical / Assistance</option>
                      <option value="Autre">📦 Fournitures & Divers</option>
                    </select>
                  </div>

                  {/* Mount input */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Montant réclamé (FCFA)*</label>
                    <input
                      type="number"
                      required
                      value={newClaim.amount}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ex: 25000"
                    />
                  </div>

                  {/* Desc comment */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">justification de la dépense*</label>
                    <input
                      type="text"
                      required
                      value={newClaim.description}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ex: Facture taxi Yaoundé mission Douala"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingClaim(false)}
                    className="py-1.5 px-3 border border-slate-200 text-slate-500 font-bold hover:text-slate-800 rounded-lg text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 h-8 uppercase tracking-wide shadow-xs"
                  >
                    <span>Valider & Publier</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Expenses Claims List */}
          {expenseClaims.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium border rounded-2xl bg-slate-50/50">
              Aucune note de frais réclamée pour cette période.
            </div>
          ) : (
            <div className="border border-slate-150 rounded-2xl overflow-hidden font-sans text-xs bg-white">
              <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-150 py-3 px-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <div className="col-span-3">Collaborateur</div>
                <div className="col-span-1.5">Catégorie</div>
                <div className="col-span-4">Libellé / Justification de frais</div>
                <div className="col-span-1.5 text-right">Montant</div>
                <div className="col-span-2 text-right">Statut / Actions</div>
              </div>

              <div className="divide-y divide-slate-100">
                {expenseClaims.map((claim) => (
                  <div key={claim.id} className="grid grid-cols-12 py-3.5 px-4 font-semibold text-slate-700 hover:bg-slate-50/50 transition-colors items-center">
                    {/* Name */}
                    <div className="col-span-3">
                      <p className="font-bold text-slate-800">{claim.employeeName}</p>
                      <span className="text-[9px] text-slate-400">{claim.date}</span>
                    </div>

                    {/* Category */}
                    <div className="col-span-1.5 font-bold">
                      <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md text-[10px] tracking-tight">
                        {claim.type}
                      </span>
                    </div>

                    {/* Libelle */}
                    <div className="col-span-4 text-slate-500 italic truncate pr-4 text-[11px]">
                      "{claim.description}"
                    </div>

                    {/* Amount */}
                    <div className="col-span-1.5 text-right font-mono font-bold text-slate-800 pr-2">
                      {formatCurrency(claim.amount, companySettings.currency)}
                    </div>

                    {/* Status & Actions buttons */}
                    <div className="col-span-2 flex gap-1.5 justify-end items-center">
                      {claim.status === 'En attente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveClaim(claim.id)}
                            className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-150 rounded-lg cursor-pointer transition"
                            title="Approuver la dépense"
                          >
                            <Check size={13} className="stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectClaim(claim.id)}
                            className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-150 rounded-lg cursor-pointer transition"
                            title="Refuser la note de frais"
                          >
                            <X size={13} className="stroke-[3]" />
                          </button>
                        </>
                      )}

                      {claim.status === 'Approuvé' && (
                        <button
                          type="button"
                          onClick={() => handleReimburseClaim(claim.id)}
                          className="py-1 px-2 uppercase tracking-wide font-black text-[9px] bg-indigo-600 font-sans hover:bg-indigo-700 text-white rounded-md cursor-pointer transition flex items-center justify-center"
                        >
                          Rembourser
                        </button>
                      )}

                      {claim.status === 'Remboursé' && (
                        <span className="text-[9px] font-black tracking-wide uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm">
                          🟢 Remboursé (Paie)
                        </span>
                      )}

                      {claim.status === 'Refusé' && (
                        <span className="text-[9px] font-black tracking-wide uppercase px-2 py-0.5 bg-slate-100 text-slate-400 rounded-sm">
                          ❌ Refusé
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

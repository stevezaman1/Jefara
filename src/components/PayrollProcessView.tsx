import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, RotateCcw, AlertCircle, Sparkles, CheckCircle2, ChevronRight, 
  Settings, Banknote, ShieldAlert, FileDown, Eye, Check 
} from 'lucide-react';
import { Employee, CompanySettings, PayslipHistoryItem, PayrollRun, WageAdvance, EmployeeCredit, InsuranceSubscription } from '../types';
import { calculatePayroll, formatCurrency } from '../utils/calculator';
import { generatePayslipPDF } from '../utils/pdfGenerator';

interface PayrollProcessViewProps {
  employees: Employee[];
  companySettings: CompanySettings;
  onPayrollCompleted: (newRun: PayrollRun, newPayslips: PayslipHistoryItem[]) => void;
  activePayrollHistory: PayslipHistoryItem[];
  wageAdvances: WageAdvance[];
  employeeCredits: EmployeeCredit[];
  insuranceSubscriptions: InsuranceSubscription[];
}

export default function PayrollProcessView({
  employees,
  companySettings,
  onPayrollCompleted,
  activePayrollHistory,
  wageAdvances,
  employeeCredits,
  insuranceSubscriptions,
}: PayrollProcessViewProps) {
  const currentMonth = 'Mai 2026';
  const activeStaff = employees.filter(e => e.status === 'Actif');

  // Steps: 'select' | 'calculating' | 'ready'
  const [step, setStep] = useState<'select' | 'calculating' | 'ready'>('select');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(activeStaff.map(e => e.id));
  const [progress, setProgress] = useState(0);

  // Computed totals
  const computedList = activeStaff
    .filter(e => selectedEmployees.includes(e.id))
    .map(emp => {
      const calc = calculatePayroll(emp.baseSalary, companySettings.country);
      
      // Calculate active financial services deductions
      const approvedAdvance = wageAdvances.find(w => w.employeeId === emp.id && w.status === 'Approuvé');
      const wageAdvanceDeduction = approvedAdvance ? approvedAdvance.amount : 0;
      
      const activeCredits = employeeCredits.filter(c => c.employeeId === emp.id && c.status === 'Actif');
      const creditDeduction = activeCredits.reduce((sum, c) => sum + c.monthlyInstallment, 0);
      
      const activeInsurances = insuranceSubscriptions.filter(s => s.employeeId === emp.id && s.status === 'Actif');
      const insuranceDeduction = activeInsurances.reduce((sum, s) => sum + s.monthlyPremium, 0);

      const totalFinancialDeductions = wageAdvanceDeduction + creditDeduction + insuranceDeduction;
      const finalNetSalary = Math.max(0, calc.netSalary - totalFinancialDeductions);

      return {
        employee: emp,
        calculations: calc,
        wageAdvanceDeduction,
        creditDeduction,
        insuranceDeduction,
        finalNetSalary,
      };
    });

  const totalGross = computedList.reduce((sum, item) => sum + item.calculations.baseSalary, 0);
  const totalDeductions = computedList.reduce((sum, item) => {
    return sum + item.calculations.totalDeductions + item.wageAdvanceDeduction + item.creditDeduction + item.insuranceDeduction;
  }, 0);
  const totalNet = computedList.reduce((sum, item) => sum + item.finalNetSalary, 0);

  // Trigger Run Simulation
  const handleRunPayroll = () => {
    if (computedList.length === 0) {
      alert('Veuillez sélectionner au moins un employé pour exécuter la paie.');
      return;
    }
    
    setStep('calculating');
    setProgress(0);

    // Dynamic high fidelity simulation ticker
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Commit to state of history
            const runId = `run-${Date.now()}`;
            const payrollRunObj: PayrollRun = {
              id: runId,
              month: currentMonth,
              runDate: new Date().toISOString().split('T')[0],
              employeeCount: computedList.length,
              totalGross,
              totalDeductions,
              totalNet,
              status: 'Payé',
            };

            const slipsArray: PayslipHistoryItem[] = computedList.map((item, index) => ({
              id: `slip-${Date.now()}-${index}`,
              employeeId: item.employee.id,
              employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
              position: item.employee.position,
              month: currentMonth,
              baseSalary: item.employee.baseSalary,
              deductions: item.calculations.totalDeductions + item.wageAdvanceDeduction + item.creditDeduction + item.insuranceDeduction,
              netSalary: item.finalNetSalary,
              slipDetail: item.calculations,
              paymentDate: new Date().toISOString().split('T')[0],
              bankAccount: item.employee.bankAccountNumber,
              paymentMethod: item.employee.paymentMethod,
              wageAdvanceDeduction: item.wageAdvanceDeduction,
              creditDeduction: item.creditDeduction,
              insuranceDeduction: item.insuranceDeduction,
            }));

            // Callback to App view state
            onPayrollCompleted(payrollRunObj, slipsArray);
            
            // Advance step
            setStep('ready');
          }, 400);

          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === activeStaff.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeStaff.map(e => e.id));
    }
  };

  const toggleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  // Pre-calculated mock breakdown display of example Jean Dupont
  const jeanObj = computedList.find(c => c.employee.firstName === 'Jean');

  return (
    <div id="payroll_module_wrapper" className="space-y-6">
      {/* Steps Indicator top line */}
      <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <CreditCard className="text-indigo-600 shrink-0" size={18} />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Guichet d'Exécution de la Paie</h3>
            <p className="text-xs text-slate-500">Période d'imposition : <span className="font-bold text-indigo-600">{currentMonth}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            step === 'select' ? 'bg-indigo-100 text-indigo-800' :
            step === 'calculating' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-150 text-emerald-800'
          }`}>
            {step === 'select' && '1. Préparation & Sélection'}
            {step === 'calculating' && '2. Calculs locaux en cours...'}
            {step === 'ready' && '3. Paie prête !'}
          </span>
        </div>
      </div>

      {/* STEP 1: Preparation Draft Screen */}
      {step === 'select' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Main Select list of staff */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Sélectionner l'effectif inclut dans la paie</h4>
                <p className="text-xs text-slate-400 mt-0.5">Seuls les employés actifs font l'objet d'un décompte de charges patronales et salariales.</p>
              </div>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-indigo-600 hover:bg-indigo-50 border border-slate-250 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer"
              >
                {selectedEmployees.length === activeStaff.length ? 'Tout désélectionner' : 'Tout inclure'}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-100">
              {activeStaff.map(emp => {
                const isSelected = selectedEmployees.includes(emp.id);
                const computedItem = computedList.find(c => c.employee.id === emp.id);
                const calc = computedItem ? computedItem.calculations : calculatePayroll(emp.baseSalary, companySettings.country);
                
                const hasDeductions = computedItem && (computedItem.wageAdvanceDeduction > 0 || computedItem.creditDeduction > 0 || computedItem.insuranceDeduction > 0);

                return (
                  <div 
                    key={emp.id}
                    onClick={() => toggleSelectEmployee(emp.id)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/55 transition ${
                      isSelected ? 'bg-indigo-50/10' : 'opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check size={14} className="stroke-[3.5]" />}
                      </div>
                      
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: companySettings.logoColor }}>
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-xs">{emp.firstName} {emp.lastName}</p>
                          {hasDeductions && (
                            <span className="text-[9px] font-black bg-purple-50 text-purple-700 py-0.5 px-2 rounded-full">
                              Services financiers
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{emp.position}</p>
                        
                        {/* Deductions visual badges */}
                        {computedItem && isSelected && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {computedItem.wageAdvanceDeduction > 0 && (
                              <span className="text-[9px] text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded-sm font-medium">
                                Acompte : -{formatCurrency(computedItem.wageAdvanceDeduction, companySettings.currency)}
                              </span>
                            )}
                            {computedItem.creditDeduction > 0 && (
                              <span className="text-[9px] text-orange-750 bg-orange-50 px-1.5 py-0.5 rounded-sm font-medium">
                                Prêt : -{formatCurrency(computedItem.creditDeduction, companySettings.currency)}
                              </span>
                            )}
                            {computedItem.insuranceDeduction > 0 && (
                              <span className="text-[9px] text-purple-750 bg-purple-50 px-1.5 py-0.5 rounded-sm font-medium">
                                Assur : -{formatCurrency(computedItem.insuranceDeduction, companySettings.currency)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Salaire Brut</span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {formatCurrency(emp.baseSalary, companySettings.currency)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-600 uppercase font-extrabold block">Salaire Net</span>
                        <span className="font-mono text-xs font-black text-emerald-600">
                          {formatCurrency(computedItem ? computedItem.finalNetSalary : calc.netSalary, companySettings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right hand setup summary */}
          <div className="space-y-6">
            {/* Calculation Framework rules badge */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Settings size={18} />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Configuration Légale</h4>
              </div>

              <div className="bg-indigo-50 p-3.5 rounded-xl text-xs space-y-1.5 text-indigo-950">
                <p><strong>Pays d'application :</strong> {companySettings.country}</p>
                <p><strong>Règlementations :</strong> CNPS / Retraite de base, Contribution Solidarité, IRPP progressif.</p>
                <p className="text-[10px] text-indigo-700 leading-relaxed font-medium pt-1">
                  Les formules analytiques se basent sur les lois fiscales de la zone francophone pour ajuster les taux de cotisation sociale.
                </p>
              </div>

              {/* Calculated Totals Box */}
              <div className="pt-2 divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Collaborateurs sélectionnés :</span>
                  <strong className="text-slate-800">{selectedEmployees.length} employés</strong>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Taxes & Retenues globales :</span>
                  <strong className="text-red-700 font-mono">-{formatCurrency(totalDeductions, companySettings.currency)}</strong>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Masse Salariale Brut :</span>
                  <strong className="text-slate-800 font-mono">{formatCurrency(totalGross, companySettings.currency)}</strong>
                </div>
                <div className="py-3 flex justify-between items-center text-sm border-t border-slate-200">
                  <span className="text-slate-900 font-extrabold">Net Global à Distribuer :</span>
                  <strong className="text-emerald-700 font-mono text-base font-black">
                    {formatCurrency(totalNet, companySettings.currency)}
                  </strong>
                </div>
              </div>

              {/* Central Primary Trigger button */}
              <button
                id="btn_launch_payroll_calc"
                onClick={handleRunPayroll}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Exécuter la Paie - {currentMonth}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Quick calculations focus panel showing Jean Dupont example */}
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 space-y-3">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Exemple de calcul analytique ({companySettings.country})</h5>
              
              <div className="bg-white rounded-xl p-3.5 border border-slate-150 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Jean Dupont (Developer)</span>
                  <span className="font-mono">{formatCurrency(450000, companySettings.currency)} Brut</span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-dotted border-slate-150 font-mono">
                  <div className="flex justify-between">
                    <span>- Cotisation Retraite Salarié:</span>
                    <span>-{formatCurrency(calculatePayroll(450000, companySettings.country).pensionContribution, companySettings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Cotisation Santé / CMU:</span>
                    <span>-{formatCurrency(calculatePayroll(450000, companySettings.country).healthContribution, companySettings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Impôt sur le Revenu (IRPP/IGR):</span>
                    <span>-{formatCurrency(calculatePayroll(450000, companySettings.country).incomeTax, companySettings.currency)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-black text-emerald-700 pt-1.5 border-t border-slate-100">
                  <span>SALAIRE NET A PAYER :</span>
                  <span className="font-mono">{formatCurrency(calculatePayroll(450000, companySettings.country).netSalary, companySettings.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Running Progress screen */}
      {step === 'calculating' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 text-center" id="payroll_calculating_splash">
          <div className="max-w-md mx-auto space-y-6">
            <div className="relative inline-flex items-center justify-center p-6 bg-indigo-50 text-indigo-600 rounded-full animate-pulse">
              <Banknote size={36} className="animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-slate-800 text-lg">Moteur de calcul Jefara actif...</h3>
              <p className="text-xs text-slate-500">
                Vérification de la conformité sociale et génération individuelle des écritures comptables sous la règlementation de la zone {companySettings.country}.
              </p>
            </div>

            {/* Custom Progress Bar tracker */}
            <div className="space-y-1 pt-4">
              <div className="flex justify-between text-xs text-slate-500 font-bold font-mono">
                <span>Calcul en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeInOut' }}
                  className="bg-indigo-600 h-full rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Completed Ready check Screen */}
      {step === 'ready' && (
        <div className="space-y-6" id="payroll_success_screen">
          {/* Header check alert card */}
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
          >
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">✓ Payroll Ready</h3>
                <p className="text-xs text-emerald-800 font-medium mt-1">
                  La paie du mois de <strong>{currentMonth}</strong> a été validée avec succès ! Les bulletins sont chiffrés et archivés.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Nouvelle paie</span>
              </button>
            </div>
          </motion.div>

          {/* Table display allowing immediate generation and verification of all payslips */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Bulletins de salaire disponibles immédiatement</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cliquez sur Generate Payslip pour télécharger l'édition PDF officielle prête à signer.</p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 uppercase font-black px-3 py-1 rounded-full">
                {computedList.length} Employés Payés
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {computedList.map((item, index) => {
                const payslipMockItem: PayslipHistoryItem = {
                  id: `slip-success-${index}`,
                  employeeId: item.employee.id,
                  employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
                  position: item.employee.position,
                  month: currentMonth,
                  baseSalary: item.employee.baseSalary,
                  deductions: item.calculations.totalDeductions,
                  netSalary: item.calculations.netSalary,
                  slipDetail: item.calculations,
                  paymentDate: new Date().toISOString().split('T')[0],
                  bankAccount: item.employee.bankAccountNumber,
                };

                return (
                  <div key={item.employee.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: companySettings.logoColor }}>
                        {item.employee.firstName[0]}{item.employee.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.employee.firstName} {item.employee.lastName}</p>
                        <p className="text-xs text-slate-400">{item.employee.position}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                      <div className="text-xs">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Salaire Brut</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatCurrency(item.employee.baseSalary, companySettings.currency)}
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Retenues locales</span>
                        <span className="font-mono font-bold text-red-600">
                          -{formatCurrency(item.calculations.totalDeductions, companySettings.currency)}
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="text-[9px] text-emerald-600 font-extrabold uppercase block">Salaire Net</span>
                        <span className="font-mono font-black text-emerald-700">
                          {formatCurrency(item.calculations.netSalary, companySettings.currency)}
                        </span>
                      </div>

                      <button
                        id={`generate_payslip_${item.employee.lastName}`}
                        onClick={() => generatePayslipPDF(item.employee, payslipMockItem, companySettings)}
                        className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                      >
                        <FileDown size={14} />
                        <span>Generate Payslip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

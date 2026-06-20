import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, CreditCard, Calendar, Mail, Settings, LogOut, 
  Menu, X, CheckSquare, Bell, FileText, ChevronRight, Globe, ShieldAlert,
  HandCoins, Calculator, Eye, TrendingUp
} from 'lucide-react';

// Models/Types
import { 
  Employee, PayrollRun, PayslipHistoryItem, LeaveRequest, CompanySettings, 
  MailNotification, WageAdvance, EmployeeCredit, InsuranceSubscription, ExpenseClaim, ProvisionConfig, ProfileUpdateRequest 
} from './types';

// Constants/Initial Data
import { 
  initialCompanySettings, initialEmployees, initialLeaves, 
  initialPayslips, initialPayrollRuns, initialNotifications,
  initialWageAdvances, initialEmployeeCredits, initialInsuranceSubscriptions,
  initialExpenseClaims, initialProvisions, initialProfileUpdateRequests
} from './utils/initialData';

// Custom core views
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import EmployeesView from './components/EmployeesView';
import PayrollProcessView from './components/PayrollProcessView';
import LeavesView from './components/LeavesView';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';
import FinancialServicesView from './components/FinancialServicesView';
import AccountingView from './components/AccountingView';
import EmployeePortalView from './components/EmployeePortalView';
import AnalyticsView from './components/AnalyticsView';

// Calculator formatters
import { formatCurrency } from './utils/calculator';
import { generatePayslipPDF } from './utils/pdfGenerator';

export default function App() {
  // Session Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('jefara_logged_in') === 'true';
  });

  // Global Corporate Core state loaded from LocalStorage
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('jefara_company_settings');
    return saved ? JSON.parse(saved) : initialCompanySettings;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('jefara_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('jefara_leaves');
    return saved ? JSON.parse(saved) : initialLeaves;
  });

  const [payslips, setPayslips] = useState<PayslipHistoryItem[]>(() => {
    const saved = localStorage.getItem('jefara_payslips');
    return saved ? JSON.parse(saved) : initialPayslips;
  });

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => {
    const saved = localStorage.getItem('jefara_payroll_runs');
    return saved ? JSON.parse(saved) : initialPayrollRuns;
  });

  const [notifications, setNotifications] = useState<MailNotification[]>(() => {
    const saved = localStorage.getItem('jefara_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [wageAdvances, setWageAdvances] = useState<WageAdvance[]>(() => {
    const saved = localStorage.getItem('jefara_wage_advances');
    return saved ? JSON.parse(saved) : initialWageAdvances;
  });

  const [employeeCredits, setEmployeeCredits] = useState<EmployeeCredit[]>(() => {
    const saved = localStorage.getItem('jefara_employee_credits');
    return saved ? JSON.parse(saved) : initialEmployeeCredits;
  });

  const [insuranceSubscriptions, setInsuranceSubscriptions] = useState<InsuranceSubscription[]>(() => {
    const saved = localStorage.getItem('jefara_insurance_subscriptions');
    return saved ? JSON.parse(saved) : initialInsuranceSubscriptions;
  });

  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem('jefara_expense_claims');
    return saved ? JSON.parse(saved) : initialExpenseClaims;
  });

  const [provisions, setProvisions] = useState<ProvisionConfig[]>(() => {
    const saved = localStorage.getItem('jefara_provisions');
    return saved ? JSON.parse(saved) : initialProvisions;
  });

  const [profileUpdateRequests, setProfileUpdateRequests] = useState<ProfileUpdateRequest[]>(() => {
    const saved = localStorage.getItem('jefara_profile_update_requests');
    return saved ? JSON.parse(saved) : initialProfileUpdateRequests;
  });

  const [activePortal, setActivePortal] = useState<'employer' | 'employee'>(() => {
    return (localStorage.getItem('jefara_active_portal') as 'employer' | 'employee') || 'employer';
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    return localStorage.getItem('jefara_selected_employee_id') || 'emp-01';
  });

  // Sidebar metric tracker states
  const [pendingPayrollCount, setPendingPayrollCount] = useState<number>(() => {
    const saved = localStorage.getItem('jefara_pending_payroll_count');
    return saved ? Number(saved) : 1; 
  });

  // Current active view tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to database LocalStorage
  useEffect(() => {
    localStorage.setItem('jefara_company_settings', JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem('jefara_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('jefara_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('jefara_payslips', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem('jefara_payroll_runs', JSON.stringify(payrollRuns));
  }, [payrollRuns]);

  useEffect(() => {
    localStorage.setItem('jefara_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('jefara_wage_advances', JSON.stringify(wageAdvances));
  }, [wageAdvances]);

  useEffect(() => {
    localStorage.setItem('jefara_employee_credits', JSON.stringify(employeeCredits));
  }, [employeeCredits]);

  useEffect(() => {
    localStorage.setItem('jefara_insurance_subscriptions', JSON.stringify(insuranceSubscriptions));
  }, [insuranceSubscriptions]);

  useEffect(() => {
    localStorage.setItem('jefara_expense_claims', JSON.stringify(expenseClaims));
  }, [expenseClaims]);

  useEffect(() => {
    localStorage.setItem('jefara_provisions', JSON.stringify(provisions));
  }, [provisions]);

  useEffect(() => {
    localStorage.setItem('jefara_profile_update_requests', JSON.stringify(profileUpdateRequests));
  }, [profileUpdateRequests]);

  useEffect(() => {
    localStorage.setItem('jefara_active_portal', activePortal);
  }, [activePortal]);

  useEffect(() => {
    localStorage.setItem('jefara_selected_employee_id', selectedEmployeeId);
  }, [selectedEmployeeId]);

  useEffect(() => {
    localStorage.setItem('jefara_pending_payroll_count', String(pendingPayrollCount));
  }, [pendingPayrollCount]);

  // Handle successful login
  const handleLoginSuccess = (email?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('jefara_logged_in', 'true');
    
    // Check if email corresponds to a real employee in initialData
    const matchedEmployee = employees.find(e => e.email.toLowerCase() === email?.toLowerCase());
    if (matchedEmployee) {
      setActivePortal('employee');
      setSelectedEmployeeId(matchedEmployee.id);
      pushNotification(
        'Connexion Portail Collaborateur',
        `L'employeur ${matchedEmployee.firstName} ${matchedEmployee.lastName} s'est connecté à son espace personnel Jefara.`,
        matchedEmployee.email,
        'employee'
      );
    } else {
      setActivePortal('employer');
      pushNotification(
        'Connexion réussie',
        'Le responsable RH s\'est connecté avec succès au tableau de bord Jefara.',
        'admin@jefara.com',
        'employee'
      );
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('jefara_logged_in');
  };

  // Helper notification dispatcher
  const pushNotification = (title: string, message: string, recipient: string, type: 'payroll' | 'employee' | 'leave') => {
    const newNotif: MailNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      recipient,
      timestamp: new Date().toISOString(),
      type,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Actions: Employees list mutations
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [...prev, newEmp]);
    
    // Auto emit email notifications logs
    pushNotification(
      'Employee added',
      `L'employé(e) ${newEmp.firstName} ${newEmp.lastName} a été enregistré(e) avec succès.\nPoste : ${newEmp.position}\nDépartement : ${newEmp.department}\nSalaire : ${formatCurrency(newEmp.baseSalary, companySettings.currency)}`,
      newEmp.email,
      'employee'
    );
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: 'Inactif' } : emp));
  };

  // Actions: Process and archive payroll runs
  const handlePayrollCompleted = (newRun: PayrollRun, newPayslips: PayslipHistoryItem[]) => {
    setPayrollRuns(prev => [newRun, ...prev]);
    setPayslips(prev => [...newPayslips, ...prev]);
    setPendingPayrollCount(0); // clear count of draft runs

    const processedEmployeeIds = newPayslips.map(s => s.employeeId);

    // Update affected wage advances to 'Payé' status
    setWageAdvances(prev => prev.map(advance => {
      if (processedEmployeeIds.includes(advance.employeeId) && advance.status === 'Approuvé') {
        return { ...advance, status: 'Payé' };
      }
      return advance;
    }));

    // Update active credits: increment paid installment count, close if finished
    setEmployeeCredits(prev => prev.map(credit => {
      if (processedEmployeeIds.includes(credit.employeeId) && credit.status === 'Actif') {
        const nextPaid = credit.monthsPaidCount + 1;
        const fullyReimbursed = nextPaid >= credit.monthsDuration;
        return {
          ...credit,
          monthsPaidCount: nextPaid,
          status: fullyReimbursed ? 'Remboursé' : 'Actif'
        };
      }
      return credit;
    }));

    // Emit completed emails to all payees
    newPayslips.forEach(slip => {
      const emp = employees.find(e => e.id === slip.employeeId);
      if (emp) {
        let extMessage = '';
        if (slip.wageAdvanceDeduction && slip.wageAdvanceDeduction > 0) {
          extMessage += `\n- Retenue acompte EWA : -${formatCurrency(slip.wageAdvanceDeduction, companySettings.currency)}`;
        }
        if (slip.creditDeduction && slip.creditDeduction > 0) {
          extMessage += `\n- Mensualité crédit micro-prêt : -${formatCurrency(slip.creditDeduction, companySettings.currency)}`;
        }
        if (slip.insuranceDeduction && slip.insuranceDeduction > 0) {
          extMessage += `\n- Versement mutuelle santé/assurance : -${formatCurrency(slip.insuranceDeduction, companySettings.currency)}`;
        }

        pushNotification(
          'Payslip generated',
          `Bonjour ${emp.firstName},\n\nVotre bulletin de salaire pour le mois de ${slip.month} a été généré.\n\nSalaire brut de base : ${formatCurrency(slip.baseSalary, companySettings.currency)}\nSalaire net versé : ${formatCurrency(slip.netSalary, companySettings.currency)}${extMessage ? `\n\nDétail des services financiers intégrés prélevés :${extMessage}` : ''}\n\nLe virement a été ordonné sur votre compte : ${slip.bankAccount}. Vous pouvez télécharger votre bulletin de salaire PDF complet depuis votre portail.`,
          emp.email,
          'payroll'
        );
      }
    });

    // General HR digest notification
    pushNotification(
      'Payroll completed',
      `FÉLICITATIONS ! L'exécution de la paie pour ${newRun.month} a été traitée avec succès pour ${newRun.employeeCount} employés.\n\nMasse salariale totale brute décaissée : ${formatCurrency(newRun.totalGross, companySettings.currency)}\nTotal net versé : ${formatCurrency(newRun.totalNet, companySettings.currency)}\nTaxes, cotisations et prélèvements de services financiers reversés : ${formatCurrency(newRun.totalDeductions, companySettings.currency)}`,
      'zamannando14@gmail.com',// Admin email from metadata/auth context
      'payroll'
    );
  };

  // Actions: Absences approval workflow
  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaves(prev => [req, ...prev]);

    // Notification of draft demand
    pushNotification(
      'Demande de congé déposée',
      `L'employé(e) ${req.employeeName} (${req.position}) sollicite un congé d'absence du ${req.startDate} au ${req.endDate} pour le motif suivant :\n"${req.reason}"`,
      'zamannando14@gmail.com',
      'leave'
    );
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approuvé' } : l));
    const leave = leaves.find(l => l.id === id);
    if (leave) {
      const empObj = employees.find(e => e.id === leave.employeeId);
      
      pushNotification(
        'Congé Approuvé',
        `Bonjour ${leave.employeeName},\n\nVotre demande de congé pour la période du ${leave.startDate} au ${leave.endDate} a été AJUGÉE et APPROUVÉE par l'administration RH.\n\nSoyez rassuré(e), vos calculs de rémunération et congés payés seront comptabilisés lors du prochain Run de Paie Jefara.`,
        empObj?.email || 'employe@jefara.com',
        'leave'
      );
    }
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Refusé' } : l));
    const leave = leaves.find(l => l.id === id);
    if (leave) {
      const empObj = employees.find(e => e.id === leave.employeeId);
      
      pushNotification(
        'Congé Refusé',
        `Bonjour ${leave.employeeName},\n\nNous vous informons que votre demande de congé du ${leave.startDate} au ${leave.endDate} a été REFUSÉE pour des motifs d'activité soutenue ou d'organisation d'équipe.\n\nVeuillez vous rapprocher de votre Responsable RH pour en échanger.`,
        empObj?.email || 'employe@jefara.com',
        'leave'
      );
    }
  };

  const handleAddProfileUpdateRequest = (req: ProfileUpdateRequest) => {
    setProfileUpdateRequests(prev => [req, ...prev]);

    // Notification of draft profile update submitted
    pushNotification(
      'Demande de mise à jour de profil',
      `L'employé(e) ${req.employeeName} a soumis une demande autonome de mise à jour de ses informations de profil (coordonnées, adresse, contacts d'urgence ou RIB bancaire). Veuillez l'examiner pour validation.`,
      'zamannando14@gmail.com',
      'employee'
    );
  };

  const handleApproveProfileUpdate = (id: string) => {
    const req = profileUpdateRequests.find(r => r.id === id);
    if (!req) return;

    // Update state of profile update requests
    setProfileUpdateRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approuvé' } : r));

    // Update corresponding employee
    setEmployees(prev => prev.map(emp => {
      if (emp.id === req.employeeId) {
        return {
          ...emp,
          phone: req.phone,
          email: req.email,
          address: req.address,
          city: req.city,
          nationality: req.nationality,
          emergencyContactName: req.emergencyContactName,
          emergencyContactPhone: req.emergencyContactPhone,
          emergencyContactRelation: req.emergencyContactRelation,
          bankName: req.bankName,
          bankAccountNumber: req.bankAccountNumber,
          bankAccountName: req.bankAccountName,
          paymentMethod: req.paymentMethod,
        };
      }
      return emp;
    }));

    // Notification of approval
    pushNotification(
      'Mise à jour du profil approuvée',
      `Bonjour ${req.employeeName},\n\nVotre demande de modification de profil a été APPROUVÉE par l'équipe RH. Vos informations personnelles et bancaires ont été appliquées avec succès dans le système Jefara.`,
      req.email,
      'employee'
    );
  };

  const handleRejectProfileUpdate = (id: string, reason: string) => {
    const req = profileUpdateRequests.find(r => r.id === id);
    if (!req) return;

    // Update state of profile update requests
    setProfileUpdateRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Refusé', rejectionReason: reason } : r));

    // Notification of rejection
    pushNotification(
      'Mise à jour du profil refusée',
      `Bonjour ${req.employeeName},\n\nNous vous informons de la non-conformité constatée par l'administration RH :\n\nVotre demande de mise à jour de profil a été REFUSÉE pour le motif suivant : "${reason || 'Non spécifié'}".\n\nVeuillez soumettre à nouveau vos informations corrigées s'il vous plaît.`,
      req.email,
      'employee'
    );
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    alert('Les paramètres de conformité et l\'entête de l\'entreprise ont été sauvegardés avec succès.');

    pushNotification(
      'Paramètres modifiés',
      `Les paramètres de l'entreprise ont été mis à jour.\nNom complet : ${newSettings.name}\nPays légal de conformité : ${newSettings.country}\nDevise par défaut de versement : ${newSettings.currency}`,
      'zamannando14@gmail.com',
      'employee'
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Helper dynamic statistics
  const activeStaffCount = employees.filter(e => e.status === 'Actif').length;
  const activeMonthlyGrossSum = employees
    .filter(e => e.status === 'Actif')
    .reduce((sum, emp) => sum + emp.baseSalary, 0);

  // If session is closed, lock screen
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const activeEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  if (activePortal === 'employee') {
    return (
      <EmployeePortalView
        currentUser={activeEmployee}
        companySettings={companySettings}
        payslips={payslips}
        leaves={leaves}
        onAddLeaveRequest={handleAddLeaveRequest}
        wageAdvances={wageAdvances}
        setWageAdvances={setWageAdvances}
        employeeCredits={employeeCredits}
        setEmployeeCredits={setEmployeeCredits}
        insuranceSubscriptions={insuranceSubscriptions}
        setInsuranceSubscriptions={setInsuranceSubscriptions}
        expenseClaims={expenseClaims}
        setExpenseClaims={setExpenseClaims}
        pushNotification={pushNotification}
        profileUpdateRequests={profileUpdateRequests}
        onAddProfileUpdateRequest={handleAddProfileUpdateRequest}
        onLogout={() => {
          setActivePortal('employer');
          handleLogout();
        }}
        onSwitchPortal={() => setActivePortal('employer')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* 1. SIDEBAR NAVIGATION PANELS */}
      <aside className="w-full md:w-64 bg-[#0F172A] text-slate-400 flex flex-col justify-between shrink-0 border-r border-slate-800/50 md:h-screen md:sticky md:top-0 shadow-lg">
        
        {/* Brand header panel & Dynamic Side calculations info */}
        <div className="flex-1 overflow-y-auto">
          {/* Logo brand & Name bar */}
          <div className="p-8 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md" style={{ backgroundColor: companySettings.logoColor }}>
                {companySettings.logoText}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-display">Jefara</h1>
                <p className="text-[9px] text-indigo-400 font-black tracking-widest uppercase">CONFORMITÉ PME</p>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Sidebar Stats matching user specifications */}
          <div className="p-4 mx-4 my-6 bg-slate-900/65 rounded-2xl border border-slate-850 space-y-4 shadow-inner">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <span>Employés</span>
                <span className="text-slate-300 font-bold">{activeStaffCount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest pt-1 border-t border-slate-800/50">
                <span>Masse brute</span>
                <span className="text-slate-300 font-mono text-xs">{formatCurrency(activeMonthlyGrossSum, companySettings.currency)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest pt-1 border-t border-slate-800/50">
                <span>En attente</span>
                <span className={`text-xs font-black font-mono ${pendingPayrollCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                  {pendingPayrollCount}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest pt-1 border-t border-slate-800/50">
                <span>Archivés</span>
                <span className="text-slate-300 font-mono text-xs">
                  {payrollRuns.filter(r => r.status === 'Payé').length + 8}
                </span>
              </div>
            </div>

            {/* Quick Run Payroll Sidebar button shortcut */}
            <button
              id="sidebar_run_payroll_btn"
              onClick={() => setCurrentTab('payroll')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl transition text-center text-white cursor-pointer shadow-md shadow-indigo-900/40 uppercase tracking-widest block"
            >
              Exécuter la Paie
            </button>
          </div>

          {/* Sidebar Menu navigation items */}
          <nav className="p-4 space-y-2 text-sm font-medium">
            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={18} />
                <span>Tableau de bord</span>
              </div>
              <ChevronRight size={14} className={currentTab === 'dashboard' ? 'text-indigo-450' : 'opacity-0'} />
            </button>

            <button
              id="tab_employees"
              onClick={() => { setCurrentTab('employees'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'employees' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                <span>Employés</span>
              </div>
              {profileUpdateRequests.filter(r => r.status === 'En attente').length > 0 ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded-md font-bold">
                    {activeStaffCount}
                  </span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black py-0.5 px-1.5 rounded-md animate-pulse">
                    {profileUpdateRequests.filter(r => r.status === 'En attente').length} modif
                  </span>
                </div>
              ) : (
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
                  currentTab === 'employees' ? 'bg-indigo-555/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {activeStaffCount}
                </span>
              )}
            </button>

            <button
              id="tab_payroll"
              onClick={() => { setCurrentTab('payroll'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'payroll' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} />
                <span>Module Paie</span>
              </div>
              {pendingPayrollCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse border border-slate-900" />
              )}
            </button>

            <button
              id="tab_fintech"
              onClick={() => { setCurrentTab('fintech'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'fintech' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <HandCoins size={18} />
                <span>Finances Intégrées</span>
              </div>
              {wageAdvances.filter(w => w.status === 'En attente').length > 0 && (
                <span className="text-[10px] bg-indigo-500 text-white font-bold py-0.5 px-2 rounded-full">
                  {wageAdvances.filter(w => w.status === 'En attente').length}
                </span>
              )}
            </button>

            <button
              id="tab_accounting"
              onClick={() => { setCurrentTab('accounting'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'accounting' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calculator size={18} />
                <span>Comptabilité (SYSCOHADA)</span>
              </div>
              <ChevronRight size={14} className={currentTab === 'accounting' ? 'text-indigo-450' : 'opacity-0'} />
            </button>

            <button
              id="tab_analytics"
              onClick={() => { setCurrentTab('analytics'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'analytics' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={18} />
                <span>Analyses Avancées</span>
              </div>
              <ChevronRight size={14} className={currentTab === 'analytics' ? 'text-indigo-455' : 'opacity-0'} />
            </button>

            <button
              id="tab_leaves"
              onClick={() => { setCurrentTab('leaves'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'leaves' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} />
                <span>Congés & Absences</span>
              </div>
              {leaves.filter(l => l.status === 'En attente').length > 0 ? (
                <span className="text-[10px] bg-amber-500 text-slate-950 py-0.5 px-2 rounded-full font-black">
                  {leaves.filter(l => l.status === 'En attente').length}
                </span>
              ) : (
                <ChevronRight size={14} className={currentTab === 'leaves' ? 'text-indigo-450' : 'opacity-0'} />
              )}
            </button>

            {/* SMTP logs and actions notifier feed */}
            <button
              id="tab_notifications"
              onClick={() => { setCurrentTab('notifications'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'notifications' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>Mails Automatiques</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono py-0.5 px-2 rounded-md font-bold">
                {notifications.length}
              </span>
            </button>

            <button
              id="tab_settings"
              onClick={() => { setCurrentTab('settings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/45 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span>Paramètres CV</span>
              </div>
              <ChevronRight size={14} className={currentTab === 'settings' ? 'text-indigo-450' : 'opacity-0'} />
            </button>
          </nav>
        </div>

        {/* Auth profile segment footer layout */}
        <div className="p-6 mt-auto">
          <div className="bg-slate-800/35 border border-slate-800/40 rounded-2xl p-4 mb-4 text-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center border border-slate-700">
                RH
              </div>
              <div className="truncate">
                <p className="text-white font-bold truncate">{companySettings.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{companySettings.country}</p>
              </div>
            </div>
            <div className="h-0.5 bg-slate-800/50 my-2" />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Infrastructure sécurisée CEMAC / UEMOA</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <LogOut size={13} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB WORKSPACE PANEL */}
      <main className="flex-1 min-w-0 flex flex-col justify-between min-h-screen">
        {/* Top workspace control bar - Height h-20 with responsive padding */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold md:hidden shrink-0" style={{ backgroundColor: companySettings.logoColor }}>
              {companySettings.logoText}
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">ESPACE ADMINISTRATIF DE GESTION</p>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>{companySettings.name}</span>
                <span className="hidden leading-none sm:inline-flex items-center gap-1 text-[10px] font-black bg-indigo-50 text-indigo-700 py-1 px-2.5 rounded-full uppercase tracking-wider">
                  <Globe size={11} />
                  <span>{companySettings.country}</span>
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation double-interface quick switch */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5 px-3">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Simuler :</span>
              <select
                id="select_simulated_employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="text-xs border border-slate-150 bg-white hover:bg-slate-50 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.position})
                  </option>
                ))}
              </select>
              
              <button
                id="btn_launch_employee_portal"
                onClick={() => setActivePortal('employee')}
                className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-purple-600 hover:bg-purple-750 font-sans tracking-wide px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition uppercase"
              >
                <Eye size={12} />
                <span>Portail Personnel</span>
              </button>
            </div>

            {/* Notifications quick counter */}
            <button 
              onClick={() => setCurrentTab('notifications')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition relative cursor-pointer"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Selected currency symbol */}
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-150">
              Devise : {companySettings.currency}
            </span>
          </div>
        </header>

        {/* Content routing container */}
        <div className="flex-grow p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === 'dashboard' && (
                <DashboardView
                  employees={employees}
                  payrollRuns={payrollRuns}
                  companySettings={companySettings}
                  onNavigateToPayroll={() => setCurrentTab('payroll')}
                  onNavigateToEmployees={() => setCurrentTab('employees')}
                  onNavigateToLeaves={() => setCurrentTab('leaves')}
                  pendingPayrollCount={pendingPayrollCount}
                />
              )}

              {currentTab === 'employees' && (
                <EmployeesView
                  employees={employees}
                  leaves={leaves}
                  payslips={payslips}
                  companySettings={companySettings}
                  onAddEmployee={handleAddEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  profileUpdateRequests={profileUpdateRequests}
                  onApproveProfileUpdate={handleApproveProfileUpdate}
                  onRejectProfileUpdate={handleRejectProfileUpdate}
                />
              )}

              {currentTab === 'payroll' && (
                <PayrollProcessView
                  employees={employees}
                  companySettings={companySettings}
                  activePayrollHistory={payslips}
                  onPayrollCompleted={handlePayrollCompleted}
                  wageAdvances={wageAdvances}
                  employeeCredits={employeeCredits}
                  insuranceSubscriptions={insuranceSubscriptions}
                />
              )}

              {currentTab === 'fintech' && (
                <FinancialServicesView
                  employees={employees}
                  companySettings={companySettings}
                  wageAdvances={wageAdvances}
                  employeeCredits={employeeCredits}
                  insuranceSubscriptions={insuranceSubscriptions}
                  setWageAdvances={setWageAdvances}
                  setEmployeeCredits={setEmployeeCredits}
                  setInsuranceSubscriptions={setInsuranceSubscriptions}
                  pushNotification={pushNotification}
                />
              )}

              {currentTab === 'accounting' && (
                <AccountingView
                  employees={employees}
                  companySettings={companySettings}
                  payrollRuns={payrollRuns}
                  payslips={payslips}
                  expenseClaims={expenseClaims}
                  setExpenseClaims={setExpenseClaims}
                  provisions={provisions}
                  setProvisions={setProvisions}
                  wageAdvances={wageAdvances}
                  employeeCredits={employeeCredits}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView
                  employees={employees}
                  companySettings={companySettings}
                  payrollRuns={payrollRuns}
                  payslips={payslips}
                  expenseClaims={expenseClaims}
                  provisions={provisions}
                  wageAdvances={wageAdvances}
                  employeeCredits={employeeCredits}
                />
              )}

              {currentTab === 'leaves' && (
                <LeavesView
                  employees={employees}
                  leaves={leaves}
                  onApproveLeave={handleApproveLeave}
                  onRejectLeave={handleRejectLeave}
                  onAddLeaveRequest={handleAddLeaveRequest}
                />
              )}

              {currentTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onClearAll={handleClearNotifications}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  currentSettings={companySettings}
                  onSaveSettings={handleSaveSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global layout footer details */}
        <footer className="bg-white border-t border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-xs text-slate-400">
          <p>© 2026 Jefara Inc. L'infrastructure de la paie en Afrique francophone.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Conditions Générales</span>
            <span className="hover:underline cursor-pointer">Sécurité & Conformité CEMAC/UEMOA</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

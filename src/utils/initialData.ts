import { Employee, LeaveRequest, PayslipHistoryItem, CompanySettings, MailNotification, PayrollRun, ExpenseClaim, ProvisionConfig, ProfileUpdateRequest } from '../types';
import { calculatePayroll } from './calculator';

export const initialCompanySettings: CompanySettings = {
  name: 'Jefara SARL',
  country: 'Cameroun',
  currency: 'FCFA',
  address: 'Boulevard de la Liberté, Akwa, Douala',
  logoText: 'JF',
  logoColor: '#4f46e5', // Brand Indigo
};

export const initialEmployees: Employee[] = [
  {
    id: 'emp-01',
    lastName: 'Dupont',
    firstName: 'Jean',
    email: 'jean.dupont@jefara.com',
    phone: '+237 677 88 99 00',
    position: 'Développeur Fullstack',
    department: 'Technologie',
    hireDate: '2024-03-15',
    baseSalary: 450000,
    bankAccountNumber: 'CMR-10023-00045-12345678901-45',
    paymentMethod: 'Banque',
    status: 'Actif',
    address: 'Rue de la Joie, Deido',
    city: 'Douala',
    nationality: 'Camerounaise',
    emergencyContactName: 'Louise Dupont',
    emergencyContactPhone: '+237 655 44 33 22',
    emergencyContactRelation: 'Épouse',
    bankName: 'UBA Cameroun',
    bankAccountName: 'JEAN DUPONT',
  },
  {
    id: 'emp-02',
    lastName: 'Koffi',
    firstName: 'Marie',
    email: 'marie.koffi@jefara.com',
    phone: '+225 07 45 89 23 45',
    position: 'Responsable RH',
    department: 'Ressources Humaines',
    hireDate: '2023-01-10',
    baseSalary: 350000,
    bankAccountNumber: 'CIV-05452-12045-98765432109-12',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-03',
    lastName: 'Ndiaye',
    firstName: 'Amadou',
    email: 'amadou.ndiaye@jefara.com',
    phone: '+221 77 560 34 12',
    position: 'Directeur Commercial',
    department: 'Ventes',
    hireDate: '2022-09-01',
    baseSalary: 850000,
    bankAccountNumber: 'SEN-09182-01124-77648392019-33',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-04',
    lastName: 'Fouda',
    firstName: 'Chantal',
    email: 'chantal.fouda@jefara.com',
    phone: '+237 699 11 22 33',
    position: 'Comptable',
    department: 'Finance',
    hireDate: '2025-01-05',
    baseSalary: 400000,
    bankAccountNumber: 'CMR-10023-00045-88776655443-02',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-05',
    lastName: 'Traoré',
    firstName: 'Ousmane',
    email: 'ousmane.traore@jefara.com',
    phone: '+225 01 02 03 04 05',
    position: 'UI/UX Designer',
    department: 'Technologie',
    hireDate: '2024-11-20',
    baseSalary: 420000,
    bankAccountNumber: 'CIV-08129-92318-19283746505-55',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-06',
    lastName: 'Mbah',
    firstName: 'Eric',
    email: 'eric.mbah@jefara.com',
    phone: '+237 680 44 55 66',
    position: 'Administrateur Systèmes',
    department: 'Technologie',
    hireDate: '2023-06-01',
    baseSalary: 380000,
    bankAccountNumber: 'CMR-10023-00045-55667788990-21',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-07',
    lastName: 'Sow',
    firstName: 'Awa',
    email: 'awa.sow@jefara.com',
    phone: '+221 78 120 45 67',
    position: 'Chargée de Recrutement',
    department: 'Ressources Humaines',
    hireDate: '2025-02-15',
    baseSalary: 300000,
    bankAccountNumber: 'SEN-09182-01124-11223344556-78',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-08',
    lastName: 'Kameni',
    firstName: 'Serge',
    email: 'serge.kameni@jefara.com',
    phone: '+237 671 23 45 67',
    position: 'Support Client',
    department: 'Opérations',
    hireDate: '2024-05-10',
    baseSalary: 250000,
    bankAccountNumber: 'CMR-10023-99945-88899911122-34',
    paymentMethod: 'Banque',
    status: 'Actif',
  },
  {
    id: 'emp-09',
    lastName: 'Diop',
    firstName: 'Fatou',
    email: 'fatou.diop@jefara.com',
    phone: '+221 70 888 99 00',
    position: 'Développeur Frontend',
    department: 'Technologie',
    hireDate: '2024-08-01',
    baseSalary: 420000,
    bankAccountNumber: 'SEN-09182-01124-99887766554-11',
    paymentMethod: 'Banque',
    status: 'Actif',
  }
];

// Seed sample leaves
export const initialLeaves: LeaveRequest[] = [
  {
    id: 'leave-01',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    position: 'Développeur Fullstack',
    startDate: '2026-06-25',
    endDate: '2026-07-05',
    reason: 'Vacances annuelles - Voyage familial à l\'Ouest Cameroun',
    status: 'En attente',
    requestDate: '2026-06-18',
  },
  {
    id: 'leave-02',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    position: 'Responsable RH',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    reason: 'Raisons médicales',
    status: 'Approuvé',
    requestDate: '2026-05-30',
  },
  {
    id: 'leave-03',
    employeeId: 'emp-04',
    employeeName: 'Chantal Fouda',
    position: 'Comptable',
    startDate: '2026-07-10',
    endDate: '2026-07-15',
    reason: 'Congé familial',
    status: 'Refusé',
    requestDate: '2026-06-12',
  },
];

// Let's seed initial payslips for past months
const dummyCountry = 'Cameroun';
export const initialPayslips: PayslipHistoryItem[] = [
  // Avril 2026
  {
    id: 'slip-01',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    position: 'Développeur Fullstack',
    month: 'Avril 2026',
    baseSalary: 450000,
    deductions: calculatePayroll(450000, dummyCountry).totalDeductions,
    netSalary: calculatePayroll(450000, dummyCountry).netSalary,
    slipDetail: calculatePayroll(450000, dummyCountry),
    paymentDate: '2026-04-28',
    bankAccount: 'CMR-10023-00045-12345678901-45',
  },
  {
    id: 'slip-02',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    position: 'Responsable RH',
    month: 'Avril 2026',
    baseSalary: 350000,
    deductions: calculatePayroll(350000, dummyCountry).totalDeductions,
    netSalary: calculatePayroll(350000, dummyCountry).netSalary,
    slipDetail: calculatePayroll(350000, dummyCountry),
    paymentDate: '2026-04-28',
    bankAccount: 'CIV-05452-12045-98765432109-12',
  },
  {
    id: 'slip-03',
    employeeId: 'emp-03',
    employeeName: 'Amadou Ndiaye',
    position: 'Directeur Commercial',
    month: 'Avril 2026',
    baseSalary: 850000,
    deductions: calculatePayroll(850000, dummyCountry).totalDeductions,
    netSalary: calculatePayroll(850000, dummyCountry).netSalary,
    slipDetail: calculatePayroll(850000, dummyCountry),
    paymentDate: '2026-04-28',
    bankAccount: 'SEN-09182-01124-77648392019-33',
  },
  // Mars 2026
  {
    id: 'slip-04',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    position: 'Développeur Fullstack',
    month: 'Mars 2026',
    baseSalary: 450000,
    deductions: calculatePayroll(450000, dummyCountry).totalDeductions,
    netSalary: calculatePayroll(450000, dummyCountry).netSalary,
    slipDetail: calculatePayroll(450000, dummyCountry),
    paymentDate: '2026-03-29',
    bankAccount: 'CMR-10023-00045-12345678901-45',
  },
  {
    id: 'slip-05',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    position: 'Responsable RH',
    month: 'Mars 2026',
    baseSalary: 350000,
    deductions: calculatePayroll(350000, dummyCountry).totalDeductions,
    netSalary: calculatePayroll(350000, dummyCountry).netSalary,
    slipDetail: calculatePayroll(350000, dummyCountry),
    paymentDate: '2026-03-29',
    bankAccount: 'CIV-05452-12045-98765432109-12',
  },
];

// Chronological runs history
export const initialPayrollRuns: PayrollRun[] = [
  {
    id: 'run-01',
    month: 'Avril 2026',
    runDate: '2026-04-28',
    employeeCount: 37,
    totalGross: 12500000,
    totalDeductions: 1100000,
    totalNet: 11400000,
    status: 'Payé',
  },
  {
    id: 'run-02',
    month: 'Mars 2026',
    runDate: '2026-03-29',
    employeeCount: 37,
    totalGross: 12500000,
    totalDeductions: 1100000,
    totalNet: 11400000,
    status: 'Payé',
  },
  {
    id: 'run-03',
    month: 'Février 2026',
    runDate: '2026-02-27',
    employeeCount: 36,
    totalGross: 12150000,
    totalDeductions: 1070000,
    totalNet: 11080000,
    status: 'Payé',
  },
];

// Seed notifications
export const initialNotifications: MailNotification[] = [
  {
    id: 'notif-01',
    title: 'Payroll completed',
    message: 'La paie du mois d\'Avril 2026 a été exécutée avec succès pour 37 employés. Les bulletins de salaire sont à présent archivés et téléchargeables.',
    recipient: 'zamannando14@gmail.com',
    timestamp: '2026-04-28T18:00:00Z',
    type: 'payroll',
  },
  {
    id: 'notif-02',
    title: 'Employee added',
    message: 'L\'employé Jean Dupont (Développeur Fullstack) a été enregistré sur la plateforme Jefara. Profil d\'imposition configuré pour la zone Cameroun.',
    recipient: 'zamannando14@gmail.com',
    timestamp: '2026-03-15T10:15:30Z',
    type: 'employee',
  },
];

// Seed initial financial services
import { WageAdvance, EmployeeCredit, InsuranceSubscription } from '../types';

export const initialWageAdvances: WageAdvance[] = [
  {
    id: 'ewa-1',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    amount: 80000,
    requestDate: '2026-06-15',
    status: 'En attente',
    month: 'Juin 2026'
  },
  {
    id: 'ewa-2',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    amount: 50000,
    requestDate: '2026-06-12',
    status: 'Approuvé',
    month: 'Juin 2026'
  }
];

export const initialEmployeeCredits: EmployeeCredit[] = [
  {
    id: 'loan-1',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    totalAmount: 1200000,
    monthlyInstallment: 100000,
    monthsDuration: 12,
    monthsPaidCount: 2,
    interestRate: 1.5,
    status: 'Actif',
    requestDate: '2026-04-10',
    purpose: 'Frais scolaires des enfants'
  },
  {
    id: 'loan-2',
    employeeId: 'emp-04',
    employeeName: 'Chantal Fouda',
    totalAmount: 600000,
    monthlyInstallment: 100000,
    monthsDuration: 6,
    monthsPaidCount: 0,
    interestRate: 1.0,
    status: 'En attente',
    requestDate: '2026-06-05',
    purpose: 'Achat ordinateur de développement'
  }
];

export const initialInsuranceSubscriptions: InsuranceSubscription[] = [
  {
    id: 'ins-1',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    productType: 'Sante',
    productName: 'Mutuelle Santé Jefara Complète',
    monthlyPremium: 8500,
    status: 'Actif',
    startDate: '2026-04-01'
  },
  {
    id: 'ins-2',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    productType: 'Auto',
    productName: 'Assurance Auto Tiers Plus',
    monthlyPremium: 12000,
    status: 'Actif',
    startDate: '2026-05-15'
  }
];

export const initialExpenseClaims: ExpenseClaim[] = [
  {
    id: 'claim-1',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    type: 'Transport',
    description: 'Déplacement rdv client Orange Cameroun à Douala, frais de taxi',
    amount: 15000,
    date: '2026-06-12',
    status: 'Approuvé'
  },
  {
    id: 'claim-2',
    employeeId: 'emp-03',
    employeeName: 'Amadou Ndiaye',
    type: 'Restauration',
    description: 'Déjeuner d\'affaires signature contrat PME à Dakar',
    amount: 45000,
    date: '2026-06-14',
    status: 'En attente'
  },
  {
    id: 'claim-3',
    employeeId: 'emp-04',
    employeeName: 'Chantal Fouda',
    type: 'Hébergement',
    description: 'Nuit d\'hôtel déplacement audit conformité Yaoundé',
    amount: 60000,
    date: '2026-06-10',
    status: 'Remboursé'
  }
];

export const initialProvisions: ProvisionConfig[] = [
  {
    id: 'prov-1',
    employeeId: 'emp-01',
    employeeName: 'Jean Dupont',
    monthlyLeaveProvision: 37500, // 450000 / 12 (approx 1 month per year)
    fringeRetirementIndemnity: 15000,
    accruedAmount: 157500
  },
  {
    id: 'prov-2',
    employeeId: 'emp-02',
    employeeName: 'Marie Koffi',
    monthlyLeaveProvision: 29166,
    fringeRetirementIndemnity: 11666,
    accruedAmount: 122496
  },
  {
    id: 'prov-3',
    employeeId: 'emp-03',
    employeeName: 'Amadou Ndiaye',
    monthlyLeaveProvision: 70833,
    fringeRetirementIndemnity: 28333,
    accruedAmount: 297498
  }
];

export const initialProfileUpdateRequests: ProfileUpdateRequest[] = [
  {
    id: 'req-01',
    employeeId: 'emp-03',
    employeeName: 'Amadou Ndiaye',
    requestDate: '2026-06-18',
    status: 'En attente',
    phone: '+221 77 560 34 12',
    email: 'amadou.ndiaye@jefara.com',
    address: 'Avenue Cheikh Anta Diop, Fann',
    city: 'Dakar',
    nationality: 'Sénégalaise',
    emergencyContactName: 'Fatou Ndiaye',
    emergencyContactPhone: '+221 77 122 34 56',
    emergencyContactRelation: 'Sœur',
    bankName: 'Société Générale Sénégal',
    bankAccountNumber: 'SEN-09182-01124-77648392019-88',
    bankAccountName: 'AMADOU NDIAYE UPDATED',
    paymentMethod: 'Banque',
    additionalNotes: 'Demande de mise à jour des coordonnées bancaires suite à changement de banque et nouvelle adresse à Dakar.'
  }
];



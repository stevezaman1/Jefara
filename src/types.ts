export interface Employee {
  id: string;
  lastName: string; // Nom de famille
  firstName: string; // Prénom
  email: string;
  phone: string;
  position: string; // Poste
  department: string; // Département
  hireDate: string; // Date d'embauche
  baseSalary: number; // Salaire de base (brut)
  bankAccountNumber: string; // Numéro de compte bancaire
  paymentMethod: 'Orange Money' | 'MTN Mobile Money' | 'Banque' | 'Autre'; // Moyen de paiement
  status: 'Actif' | 'Inactif';
}

export type CountryType = 'Cameroun' | "Côte d'Ivoire" | 'Sénégal' | 'Autre (Afrique Francophone)';

export interface CompanySettings {
  name: string;
  country: CountryType;
  currency: string; // e.g. "FCFA"
  address: string;
  logoText: string; // Initials or text-based logo design
  logoColor: string; // Hex color for the logo avatar
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'En attente' | 'Approuvé' | 'Refusé';
  requestDate: string;
}

export interface PayslipDetail {
  baseSalary: number;
  pensionContribution: number; // Retenue CNPS/IPRES (Salarié)
  healthContribution: number;  // Retenue Assurance maladie/Santé
  incomeTax: number;           // Impôt sur le revenu (IRPP/IGR/IS)
  totalDeductions: number;     // Total des retenues
  netSalary: number;           // Salaire Net à payer
  employerPension: number;     // Cotisation patronale retraite/CNPS
  employerHealth: number;      // Cotisation patronale santé
  employerFamily: number;      // Prestations familiales/Accidents travail
  totalEmployerCharges: number; // Total charges patronales
}

export interface PayslipHistoryItem {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  month: string; // "Mai 2026"
  baseSalary: number;
  deductions: number;
  netSalary: number;
  slipDetail: PayslipDetail;
  paymentDate: string;
  bankAccount: string;
}

export interface PayrollRun {
  id: string;
  month: string; // "Mai 2026"
  runDate: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: 'Payé' | 'Brouillon';
}

export interface MailNotification {
  id: string;
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  type: 'payroll' | 'employee' | 'leave';
}

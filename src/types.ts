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
  // Additional self-update fields
  address?: string;
  city?: string;
  nationality?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bankName?: string;
  bankAccountName?: string;
}

export interface ProfileUpdateRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestDate: string;
  status: 'En attente' | 'Approuvé' | 'Refusé';
  // Personal & Contact details
  phone: string;
  email: string;
  address: string;
  city: string;
  nationality: string;
  // Emergency Contact details
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  // Bank details
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  paymentMethod: 'Orange Money' | 'MTN Mobile Money' | 'Banque' | 'Autre';
  // Additional Comments
  additionalNotes?: string;
  rejectionReason?: string;
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
  paymentMethod?: string;
  wageAdvanceDeduction?: number;
  creditDeduction?: number;
  insuranceDeduction?: number;
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

export interface WageAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  requestDate: string;
  status: 'En attente' | 'Approuvé' | 'Refusé' | 'Payé';
  month: string; // The payroll month this is designated for or was paid in, e.g. "Mai 2026"
}

export interface EmployeeCredit {
  id: string;
  employeeId: string;
  employeeName: string;
  totalAmount: number;
  monthlyInstallment: number;
  monthsDuration: number;
  monthsPaidCount: number;
  interestRate: number;
  status: 'En attente' | 'Approuvé' | 'Refusé' | 'Actif' | 'Remboursé';
  requestDate: string;
  purpose: string;
}

export interface InsuranceSubscription {
  id: string;
  employeeId: string;
  employeeName: string;
  productType: 'Sante' | 'Auto' | 'Prevoyance' | 'Famille';
  productName: string;
  monthlyPremium: number;
  status: 'Actif' | 'Résilié';
  startDate: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Transport' | 'Hébergement' | 'Restauration' | 'Santé' | 'Autre';
  description: string;
  amount: number;
  date: string;
  status: 'En attente' | 'Approuvé' | 'Refusé' | 'Remboursé';
  receiptUrl?: string;
}

export interface ProvisionConfig {
  id: string;
  employeeId: string;
  employeeName: string;
  monthlyLeaveProvision: number; // monthly accrued leave value
  fringeRetirementIndemnity: number; // end of career retirement provision
  accruedAmount: number;
}



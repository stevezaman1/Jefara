import { jsPDF } from 'jspdf';
import { Employee, PayslipHistoryItem, CompanySettings } from '../types';
import { formatCurrency } from './calculator';

export function generatePayslipPDF(
  employee: Employee,
  item: PayslipHistoryItem,
  company: CompanySettings
): void {
  // Create jsPDF instance (A4 size format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = company.currency;

  // Add Colors
  const primaryColor = [79, 70, 229]; // Indigo
  const darkTextColor = [31, 41, 55]; // Gray-800
  const lightBgColor = [243, 244, 246]; // Gray-100
  const lineGray = [209, 213, 219]; // Gray-300

  // Standard Left Margin
  const lm = 20;

  // Header Background Accent line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 8, 'F');

  // --- 1. ENTREPRISE (Haut Gauche) ---
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(company.name.toUpperCase(), lm, 25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Pays : ${company.country}`, lm, 31);
  doc.text(`Adresse : ${company.address}`, lm, 36);
  doc.text(`Devise entreprise : ${company.currency}`, lm, 41);

  // --- 2. TITRE BULLETIN (Haut Droite) ---
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(120, 18, 70, 25, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(120, 18, 70, 25, 'D');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BULLETIN DE SALAIRE', 125, 25);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Période : ${item.month}`, 125, 31);
  doc.text(`Date de paiement : ${item.paymentDate}`, 125, 37);

  // Separator
  doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
  doc.setLineWidth(0.3);
  doc.line(lm, 50, 190, 50);

  // --- 3. INFORMATIONS SALARIÉ ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INFORMATIONS EMPLOYÉ', lm, 58);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

  // Col 1
  doc.text(`Nom complet : ${employee.firstName} ${employee.lastName}`, lm, 65);
  doc.text(`Poste : ${employee.position}`, lm, 71);
  doc.text(`Département : ${employee.department}`, lm, 77);
  doc.text(`Date d'embauche : ${employee.hireDate}`, lm, 83);

  // Col 2
  const rightColX = 115;
  doc.text(`Email : ${employee.email}`, rightColX, 65);
  doc.text(`Téléphone : ${employee.phone}`, rightColX, 71);
  doc.text(`Compte bancaire :`, rightColX, 77);
  doc.setFont('Helvetica', 'bold');
  doc.text(employee.bankAccountNumber || 'N/A', rightColX, 83);
  doc.setFont('Helvetica', 'normal');

  // Separator
  doc.line(lm, 90, 190, 90);

  // --- 4. TABLEAU DES CALCULS ---
  // Table Header
  const tableY = 98;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(lm, tableY, 170, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Rubrique de paie', lm + 4, tableY + 5.5);
  doc.text('Part Salarié', lm + 85, tableY + 5.5);
  doc.text('Part Patronale', lm + 130, tableY + 5.5);

  // Reset text color for table body
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('Helvetica', 'normal');

  // Details
  const detail = item.slipDetail;
  const rows = [
    {
      label: 'Salaire Brut de Base',
      employeeVal: formatCurrency(detail.baseSalary, currency),
      employerVal: '-',
      isBold: true,
    },
    {
      label: 'Pension de retraite (Retenue Locale / Retraite)',
      employeeVal: `(${formatCurrency(detail.pensionContribution, currency)})`,
      employerVal: formatCurrency(detail.employerPension, currency),
      isBold: false,
    },
    {
      label: 'Assurance Santé / Maladie locale',
      employeeVal: `(${formatCurrency(detail.healthContribution, currency)})`,
      employerVal: formatCurrency(detail.employerHealth, currency),
      isBold: false,
    },
    {
      label: 'Impôt sur le Revenu (IRPP / IS / IGR)',
      employeeVal: `(${formatCurrency(detail.incomeTax, currency)})`,
      employerVal: '-',
      isBold: false,
    },
    {
      label: 'Prestations familiales & CSS patronales',
      employeeVal: '-',
      employerVal: formatCurrency(detail.employerFamily, currency),
      isBold: false,
    }
  ];

  // Dynamically push integrated financial deductions
  if (item.wageAdvanceDeduction && item.wageAdvanceDeduction > 0) {
    rows.push({
      label: 'Avance sur salaire (Acompte EWA Jefara)',
      employeeVal: `(${formatCurrency(item.wageAdvanceDeduction, currency)})`,
      employerVal: '-',
      isBold: true,
    });
  }

  if (item.creditDeduction && item.creditDeduction > 0) {
    rows.push({
      label: 'Mensualité de Crédit (Crédit Salarié Jefara)',
      employeeVal: `(${formatCurrency(item.creditDeduction, currency)})`,
      employerVal: '-',
      isBold: true,
    });
  }

  if (item.insuranceDeduction && item.insuranceDeduction > 0) {
    rows.push({
      label: 'Cotisation Assurance Intégrée (Jefara Assur)',
      employeeVal: `(${formatCurrency(item.insuranceDeduction, currency)})`,
      employerVal: '-',
      isBold: true,
    });
  }

  let currentY = tableY + 14;
  rows.forEach((row, i) => {
    // Alternating background for legibility
    if (i % 2 === 1) {
      doc.setFillColor(249, 250, 251); // Gray-50
      doc.rect(lm, currentY - 5, 170, 7.5, 'F');
    }

    if (row.isBold) {
      doc.setFont('Helvetica', 'bold');
    } else {
      doc.setFont('Helvetica', 'normal');
    }
    
    doc.text(row.label, lm + 4, currentY);
    doc.text(row.employeeVal, lm + 85, currentY);
    doc.text(row.employerVal, lm + 130, currentY);

    // subtle separation line
    doc.setDrawColor(243, 244, 246);
    doc.line(lm, currentY + 2.5, 190, currentY + 2.5);
    
    currentY += 8.5;
  });

  // Space before Summary
  currentY += 5;

  // --- 5. SYNTHESE DES AGREGATS ---
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.line(lm, currentY, 190, currentY);
  currentY += 6;

  // Summary Grid box
  const summaryX = 110;
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(summaryX, currentY, 80, 32, 'F');
  doc.rect(summaryX, currentY, 80, 32, 'D');

  const totalRetenues = detail.totalDeductions + 
    (item.wageAdvanceDeduction || 0) + 
    (item.creditDeduction || 0) + 
    (item.insuranceDeduction || 0);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('TOTAL DE BASE BRUT :', summaryX + 4, currentY + 6);
  doc.text(formatCurrency(detail.baseSalary, currency), summaryX + 45, currentY + 6);

  doc.text('TOTAL DE RETENUES :', summaryX + 4, currentY + 13);
  doc.text(`- ${formatCurrency(totalRetenues, currency)}`, summaryX + 45, currentY + 13);

  doc.text('CHARGES PATRONALES :', summaryX + 4, currentY + 20);
  doc.text(formatCurrency(detail.totalEmployerCharges, currency), summaryX + 45, currentY + 20);

  // NET SALARY Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(summaryX, currentY + 23, 80, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('NET NET PAYÉ :', summaryX + 4, currentY + 29);
  doc.text(formatCurrency(item.netSalary, currency), summaryX + 45, currentY + 29);


  // Resets
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('Helvetica', 'normal');

  // Notes and signatures
  const signatureY = currentY + 45;
  doc.setFont('Helvetica', 'bold');
  doc.text('Signature de l\'employé(e)', lm, signatureY);
  doc.text('Pour l\'employeur (Visa RH)', 135, signatureY);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('(Précédé de la mention "Lu et approuvé")', lm, signatureY + 5);
  doc.text('Jefara Payroll Automated System', 135, signatureY + 5);

  // Footer text
  doc.setTextColor(156, 163, 175); // Gray-400
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    `Ce bulletin de salaire de l'employé ${employee.firstName} ${employee.lastName} a été généré via Jefara - L'infrastructure moderne de la paie en Afrique.`,
    105,
    280,
    { align: 'center' }
  );

  // Output string for immediate trigger download
  doc.save(`Bulletin_${employee.lastName}_${item.month.replace(' ', '_')}.pdf`);
}

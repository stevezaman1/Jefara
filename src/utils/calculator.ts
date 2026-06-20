import { CountryType, PayslipDetail } from '../types';

/**
 * Calcul précis des cotisations et impôts pour l'Afrique en fonction du pays.
 */
export function calculatePayroll(baseSalary: number, country: CountryType): PayslipDetail {
  let pensionContribution = 0; // Salarié CNPS / IPRES
  let healthContribution = 0;  // Salarié Santé
  let incomeTax = 0;           // Impôt sur le revenu (IRPP / IGR)
  
  let employerPension = 0;     // Patronal Retraite
  let employerHealth = 0;      // Patronal Santé
  let employerFamily = 0;      // Prestations familiales et accident (ex: 5% à 8% patronal)

  const gross = baseSalary;

  switch (country) {
    case 'Cameroun':
      // Salarié pension CNPS : 4.2% plafonné à 750,000 FCFA de salaire brut de base
      const cnpsCeilingCam = 750000;
      const cnpsBaseCam = Math.min(gross, cnpsCeilingCam);
      pensionContribution = Math.round(cnpsBaseCam * 0.042);
      
      // Part patronale retraite : 8.4%
      employerPension = Math.round(cnpsBaseCam * 0.084);
      
      // Prestations familiales + Accidents du travail (patronal uniquement, env. 7%)
      employerFamily = Math.round(gross * 0.07);

      // Santé salarié (estimation standard mutuelle d'entreprise de 2%)
      healthContribution = Math.round(gross * 0.02);
      employerHealth = Math.round(gross * 0.04);

      // Impôt sur le revenu (IRPP Camerounisé simplifié) :
      // Abattement de 500,000 FCFA par an (soit ~41,666 / mois).
      // Progressive brute sur salaire taxable :
      // Portion < 62,000 : 0%
      // Portion 62,000 - 150,000 : 10%
      // Portion 150,000 - 300,000 : 15%
      // Portion 300,000 - 500,000 : 25%
      // Au-delà : 35%
      // Ajout de la taxe d'audiovisuel et centimes additionnels communaux (~10% de l'impôt)
      const taxableCam = Math.max(0, gross - 62000);
      if (taxableCam > 0) {
        let ir = 0;
        if (taxableCam <= 88000) { // 150k - 62k
          ir = taxableCam * 0.10;
        } else if (taxableCam <= 238000) { // 300k - 62k
          ir = (88000 * 0.10) + ((taxableCam - 88000) * 0.15);
        } else if (taxableCam <= 438000) { // 500k - 62k
          ir = (88000 * 0.10) + (150000 * 0.15) + ((taxableCam - 238000) * 0.25);
        } else {
          ir = (88000 * 0.10) + (150000 * 0.15) + (200000 * 0.25) + ((taxableCam - 438000) * 0.35);
        }
        incomeTax = Math.round(ir * 1.1); // Inclusion CAC et autres taxes
      }
      break;

    case "Côte d'Ivoire":
      // Salarié retraite CNPS : 3.2% plafonné à 3,000,000 FCFA
      const cnpsCeilingCiv = 3000000;
      const cnpsBaseCiv = Math.min(gross, cnpsCeilingCiv);
      pensionContribution = Math.round(cnpsBaseCiv * 0.032);
      employerPension = Math.round(cnpsBaseCiv * 0.048); // Part patronale retraite : 4.8%
      
      // Prestations familiales et Accidents (env. 5% + 2% patronal)
      employerFamily = Math.round(gross * 0.07);

      // Assurance maladie universelle (CMU Côte d'Ivoire ou mutuelle : env. 1.5% salarié, 3% patronal)
      healthContribution = Math.round(gross * 0.015);
      employerHealth = Math.round(gross * 0.03);

      // Impôt sur le revenu (IS : 1.2%, CN : progressif, IGR : progressif)
      // Modèle simplifié pour Côte d'Ivoire : IS (1.2% du brut) + CN (progressive) + Impôt de Solidarité Nationale.
      // Modèle global harmonisé à environ 6.5% du salaire brut pour salaries < 500k, et 8.5% au-delà.
      const isTax = gross * 0.012;
      let cnTax = 0;
      const taxableCiv = gross;
      if (taxableCiv > 50000) {
        if (taxableCiv <= 130000) {
          cnTax = (taxableCiv - 50000) * 0.015;
        } else if (taxableCiv <= 200000) {
          cnTax = (130000 - 50000) * 0.015 + (taxableCiv - 130000) * 0.05;
        } else {
          cnTax = (130000 - 50000) * 0.015 + (70000 * 0.05) + (taxableCiv - 200000) * 0.10;
        }
      }
      const igrSimulated = Math.max(0, (gross * 0.03)); // simulation IGR simplifiée
      incomeTax = Math.round(isTax + cnTax + igrSimulated);
      break;

    case 'Sénégal':
      // Réseau de retraite IPRES Sénégal : 5.6% pour le régime général (plafond à 360,000 FCFA/mois)
      // Cadre général IPRES Régime Général + Cadre de solidarité : env. 5.6% salarié
      const ipresCeiling = 360000;
      const ipresBase = Math.min(gross, ipresCeiling);
      pensionContribution = Math.round(ipresBase * 0.056);
      employerPension = Math.round(ipresBase * 0.084); // CNPS / Patronal IPRES : 8.4%
      
      // Prestations familiales & Accidents CSS (env. 7% patronal)
      employerFamily = Math.round(gross * 0.07);

      // Prévoyance IPM (Institution de Prévoyance Maladie) de 1.5% salarié et 1.5% patronal
      healthContribution = Math.round(gross * 0.015);
      employerHealth = Math.round(gross * 0.015);

      // Impôt sur le revenu (Sénégal) : barème progressif mensuel après abattement forfaitaire de 15%
      // Modèle simplifié d'impôt progressif :
      // En dessous de 50 000 : 0%
      // 50 000 à 150 000 : 8%
      // 150 000 à 300 000 : 14%
      // Above 300 000 : 22%
      const netTaxableSen = Math.max(0, (gross * 0.85) - 50000); // abattement charges pro 15%
      if (netTaxableSen > 0) {
        if (netTaxableSen <= 100000) {
          incomeTax = netTaxableSen * 0.08;
        } else if (netTaxableSen <= 250000) {
          incomeTax = (100000 * 0.08) + ((netTaxableSen - 100000) * 0.14);
        } else {
          incomeTax = (100000 * 0.08) + (150000 * 0.14) + ((netTaxableSen - 250000) * 0.22);
        }
      }
      incomeTax = Math.round(incomeTax);
      break;

    default: // Autre (Afrique Francophone) : calcul harmonisé standard
      // Retraite CNPS moyenne : 4% salarié, 8% patronal
      pensionContribution = Math.round(gross * 0.04);
      employerPension = Math.round(gross * 0.08);

      // Santé salarié moyenne : 2%, patronal : 4%
      healthContribution = Math.round(gross * 0.02);
      employerHealth = Math.round(gross * 0.04);

      employerFamily = Math.round(gross * 0.06);

      // Impôt sur le revenu moyen simplifié : 10% de la tranche supérieure à 50 000
      const taxableOther = Math.max(0, gross - 50000);
      incomeTax = Math.round(taxableOther * 0.10);
      break;
  }

  const totalDeductions = pensionContribution + healthContribution + incomeTax;
  const netSalary = gross - totalDeductions;
  const totalEmployerCharges = employerPension + employerHealth + employerFamily;

  return {
    baseSalary,
    pensionContribution,
    healthContribution,
    incomeTax,
    totalDeductions,
    netSalary,
    employerPension,
    employerHealth,
    employerFamily,
    totalEmployerCharges,
  };
}

/**
 * Formate un nombre en FCFA ou autre devise de façon propre.
 */
export function formatCurrency(value: number, currency: string = 'FCFA'): string {
  // e.g. 12500000 -> 12 500 000 FCFA
  const formatted = new Intl.NumberFormat('fr-FR').format(value);
  return `${formatted} ${currency}`;
}

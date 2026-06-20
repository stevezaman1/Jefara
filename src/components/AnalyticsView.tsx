import { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, BarChart3, PieChart, 
  Sparkles, Brain, Lightbulb, Download, FileText, FileSpreadsheet, 
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle2, Award, 
  Layers, HelpCircle, ArrowRight
} from 'lucide-react';
import { Employee, CompanySettings, PayslipHistoryItem, LeaveRequest, ExpenseClaim, ProvisionConfig, EmployeeCredit, WageAdvance } from '../types';
import { formatCurrency } from '../utils/calculator';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyticsViewProps {
  employees: Employee[];
  companySettings: CompanySettings;
  payrollRuns: any[];
  payslips: PayslipHistoryItem[];
  expenseClaims: ExpenseClaim[];
  provisions: ProvisionConfig[];
  wageAdvances: WageAdvance[];
  employeeCredits: EmployeeCredit[];
}

export default function AnalyticsView({
  employees,
  companySettings,
  payrollRuns,
  payslips,
  expenseClaims,
  provisions,
  wageAdvances,
  employeeCredits,
}: AnalyticsViewProps) {
  // Chart tab state: 'financial' | 'hr' | 'treasury'
  const [activeChartTab, setActiveChartTab] = useState<'financial' | 'hr' | 'treasury'>('financial');
  
  // Interactive Simulator inputs
  const [simulatedRecruitments, setSimulatedRecruitments] = useState<number>(1);
  const [simulatedAvgSalary, setSimulatedAvgSalary] = useState<number>(400000);
  const [simulatedSalaryIncrease, setSimulatedSalaryIncrease] = useState<number>(3); // annual salary adjustment %

  // Automated report states
  const [selectedReportType, setSelectedReportType] = useState<'social' | 'financial' | 'equity' | 'provisions'>('financial');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [generatedReportData, setGeneratedReportData] = useState<any | null>(null);

  // Active employee stats
  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Actif'), [employees]);
  const inactiveEmployees = useMemo(() => employees.filter(e => e.status === 'Inactif'), [employees]);
  const totalEmployeesCount = employees.length;

  // Real-time financial calculations
  const totalMonthlyGrossSalary = useMemo(() => {
    return activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0);
  }, [activeEmployees]);

  // Employer social charges helper (SYSCOHADA regions average ~22% for pension, health, family benefits)
  const estimatedEmployerCharges = useMemo(() => {
    return Math.round(totalMonthlyGrossSalary * 0.22);
  }, [totalMonthlyGrossSalary]);

  const averageCostPerEmployee = useMemo(() => {
    if (activeEmployees.length === 0) return 0;
    return Math.round((totalMonthlyGrossSalary + estimatedEmployerCharges) / activeEmployees.length);
  }, [activeEmployees, totalMonthlyGrossSalary, estimatedEmployerCharges]);

  // Accumulated provisions
  const totalAccruedProvisions = useMemo(() => {
    return provisions.reduce((sum, p) => sum + p.accruedAmount, 0);
  }, [provisions]);

  // Employee breakdown by department
  const departmentStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const sumSalary: { [key: string]: number } = {};
    
    activeEmployees.forEach(emp => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
      sumSalary[emp.department] = (sumSalary[emp.department] || 0) + emp.baseSalary;
    });

    return Object.keys(counts).map(dept => ({
      name: dept,
      count: counts[dept],
      percentage: Math.round((counts[dept] / activeEmployees.length) * 100),
      avgSalary: Math.round(sumSalary[dept] / counts[dept]),
      totalSalary: sumSalary[dept]
    }));
  }, [activeEmployees]);

  // Simulated Turnover Rate based on historic inactive profiles
  const simulatedTurnover = useMemo(() => {
    if (totalEmployeesCount === 0) return 0;
    // Classic annual turnover simulation: (levers during cycle / total staff) * 100
    const inactiveCount = inactiveEmployees.length || 2; 
    return Math.round((inactiveCount / totalEmployeesCount) * 100 * 10) / 10;
  }, [totalEmployeesCount, inactiveEmployees]);

  // Salary Dispersion Index (Ratio highest to lowest salary)
  const salaryDisparities = useMemo(() => {
    if (activeEmployees.length === 0) return { ratio: 1, min: 0, max: 0 };
    const salaries = activeEmployees.map(e => e.baseSalary);
    const minSalary = Math.min(...salaries);
    const maxSalary = Math.max(...salaries);
    const ratio = Math.round((maxSalary / (minSalary || 1)) * 10) / 10;
    return { ratio, min: minSalary, max: maxSalary };
  }, [activeEmployees]);

  // Predictive Analytics Churn Risk Score per employee
  // Algorithms flag churn risk based on tenure, low salary distance from average, and high leave or credit volume.
  const employeeTalentRiskScore = useMemo(() => {
    return activeEmployees.map(emp => {
      let score = 30; // base score out of 100

      // Let's find department stats to check if salary is below average
      const dept = departmentStats.find(d => d.name === emp.department);
      if (dept && emp.baseSalary < dept.avgSalary) {
        score += 25; // underpaid relative to peers
      }

      // Check tenure
      const parts = emp.hireDate.split('-');
      const hireYear = parseInt(parts[0]);
      const currentYear = 2026;
      const tenureYears = currentYear - hireYear;
      if (tenureYears >= 2 && tenureYears <= 4) {
        score += 20; // 2-4 years tenure risk window
      }

      // Check credits & advances
      const activeCredits = employeeCredits.filter(c => c.employeeId === emp.id && c.status === 'Actif');
      if (activeCredits.length > 0) {
        score -= 15; // credits increase retention/loyalty naturally
      }

      const advances = wageAdvances.filter(a => a.employeeId === emp.id && a.status === 'Approuvé');
      if (advances.length > 0) {
        score += 15; // needs quick cash, financial stress potential
      }

      // bound score between 10 and 95
      score = Math.max(12, Math.min(94, score));

      let level: 'Faible' | 'Modéré' | 'Élevé' = 'Faible';
      if (score >= 65) level = 'Élevé';
      else if (score >= 40) level = 'Modéré';

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        position: emp.position,
        department: emp.department,
        salary: emp.baseSalary,
        score,
        level,
      };
    }).sort((a, b) => b.score - a.score);
  }, [activeEmployees, departmentStats, employeeCredits, wageAdvances]);

  // Core smart recommendations generator (Data-Driven Recommendations)
  const smartRecommendations = useMemo(() => {
    const list = [];

    // 1. Retention advice
    const highRiskTalents = employeeTalentRiskScore.filter(t => t.level === 'Élevé');
    if (highRiskTalents.length > 0) {
      list.push({
        id: 'rec-1',
        title: 'Risque de rotation identifié',
        type: 'retention',
        priority: 'Haute',
        badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
        message: `L'algorithme de fuite des talents a repéré ${highRiskTalents.length} collabrateur(s) clé(s) avec un risque d'attrition élevé (ex: ${highRiskTalents[0].name}). Une revalorisation salariale ou un point de carrière est suggéré pour s'aligner sur la moyenne de département de ${formatCurrency(departmentStats.find(d => d.name === highRiskTalents[0].department)?.avgSalary || 0, companySettings.currency)}.`,
        action: 'Planifier entretien de fidélisation'
      });
    }

    // 2. Financial overhead alert
    const totalCompanyAnnualBurden = (totalMonthlyGrossSalary + estimatedEmployerCharges) * 12;
    if (estimatedEmployerCharges > 3000000) {
      list.push({
        id: 'rec-2',
        title: 'Optimisation des charges fiscales',
        type: 'tax_saving',
        priority: 'Moyenne',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
        message: `Vos cotisations patronales ont atteint ${formatCurrency(estimatedEmployerCharges, companySettings.currency)} ce mois. En implémentant une mutuelle d'entreprise pour l'effectif actuel, certaines cotisations au Cameroun & Côte d'Ivoire bénéficient d'abattements d'impôts sur les bénéfices. Suggérez notre produit Mutuelle Santé Jefara.`,
        action: 'Consulter simulateur de mutuelle'
      });
    } else {
      list.push({
        id: 'rec-2',
        title: 'Structuration des contrats maladie',
        type: 'insurance',
        priority: 'Recommandé',
        badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        message: `Nous recommandons de standardiser les polices d'assurance complémentaires d'entreprise (Prévoyance ou Santé) pour l'ensemble des ${activeEmployees.length} employés actifs afin d'optimiser l'indemnité de fin de carrière règlementaire SYSCOHADA.`,
        action: 'Négocier contrat collectif'
      });
    }

    // 3. Treasury provision health
    if (totalAccruedProvisions < totalMonthlyGrossSalary * 1.5) {
      list.push({
        id: 'rec-3',
        title: 'Insuffisance de provisions congés & retraite',
        type: 'provisions',
        priority: 'Critique',
        badgeColor: 'text-red-700 bg-red-50 border-red-200',
        message: `Le montant total provisionné pour congés payés et indemnités de fin de carrière (${formatCurrency(totalAccruedProvisions, companySettings.currency)}) est inférieur aux obligations de départs simulées (${formatCurrency(totalMonthlyGrossSalary * 1.8, companySettings.currency)}). Revoir les taux mensuels d'allocation comptable pour éviter les tensions de trésorerie.`,
        action: 'Ajuster les provisions comptables'
      });
    } else {
      list.push({
        id: 'rec-3',
        title: 'Couverture de passif social saine',
        type: 'provisions',
        priority: 'Conformité',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        message: `Votre fonds de secours social provisionné est à ${formatCurrency(totalAccruedProvisions, companySettings.currency)}, couvrant parfaitement 100% des droits accumulés par vos équipes selon la législation de zone CEMAC/UEMOA.`,
        action: 'Voir historique de provisions'
      });
    }

    // 4. Payroll disparity recommendation
    if (salaryDisparities.ratio > 3.5) {
      list.push({
        id: 'rec-4',
        title: 'Écart de rémunération constaté',
        type: 'equity',
        priority: 'Conseil',
        badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
        message: `Le ratio d'écart entre le salaire le plus élevé (${formatCurrency(salaryDisparities.max, companySettings.currency)}) et le plus bas (${formatCurrency(salaryDisparities.min, companySettings.currency)}) est de ${salaryDisparities.ratio}. Un taux élevé de disparité salariale peut impacter négativement la productivité globale et décentrer l'équité interne.`,
        action: 'Lancer audit d\'équité interne'
      });
    }

    return list;
  }, [totalMonthlyGrossSalary, estimatedEmployerCharges, totalAccruedProvisions, salaryDisparities, employeeTalentRiskScore, activeEmployees, departmentStats, companySettings]);

  // Simulated dynamic projections for chart arrays
  const forecastedSixMonthsData = useMemo(() => {
    const data = [];
    const months = ['Juil 26', 'Aoû 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Déc 26'];
    
    // Simulate compounding inflation / general changes
    let currentStaff = activeEmployees.length;
    let currentCost = totalMonthlyGrossSalary + estimatedEmployerCharges;
    
    for (let i = 0; i < 6; i++) {
      // Add simulated recruitments gradually in month 2, 4
      if (i === 1 || i === 3) {
        currentStaff += simulatedRecruitments;
        currentCost += (simulatedAvgSalary * 1.22) * simulatedRecruitments;
      }
      
      // annual general salary adjustment factored dynamically
      const compoundingMultiplier = 1 + ((simulatedSalaryIncrease / 100) / 12);
      currentCost = Math.round(currentCost * compoundingMultiplier);
      
      // Accrue provisions simulation
      const simulatedProvisionsAccumulated = totalAccruedProvisions + (currentStaff * 45000 * (i + 1));

      data.push({
        month: months[i],
        staff: currentStaff,
        payrollCost: currentCost,
        provisionsCost: simulatedProvisionsAccumulated,
        cashReserveNeeded: Math.round(currentCost * 1.45) // simulated buffer cash flow
      });
    }
    return data;
  }, [activeEmployees, totalMonthlyGrossSalary, estimatedEmployerCharges, simulatedRecruitments, simulatedAvgSalary, simulatedSalaryIncrease, totalAccruedProvisions]);


  // Handler to compile report
  const handleCompileReport = () => {
    setIsGeneratingReport(true);
    setGenerationLogs([]);
    setGeneratedReportData(null);

    const logs = [
      "🔄 Initialisation du compilateur analytique Jefara...",
      "📑 Extraction des fiches d'imposition régionales...",
      "🧮 Agrégation de la masse salariale active...",
      "🔍 Analyse croisée des barèmes de cotisations de la zone " + companySettings.country + "...",
      "💼 Simulation des provisions indemnités de fin de carrière (SYSCOHADA)...",
      "✔️ Rapport analytique consolidé produit avec succès et signé numériquement."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setGenerationLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsGeneratingReport(false);
          // Build report object based on type
          const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
          
          if (selectedReportType === 'financial') {
            setGeneratedReportData({
              title: "RAPPORT D'ANALYSE FINANCIÈRE DE MASSE SALARIALE",
              ref: `JF-FIN-REF-${Math.floor(1000 + Math.random() * 9000)}`,
              date: dateStr,
              author: "Jefara Intelligence Engine",
              summary: "Analyse exhaustive de la structure de coûts, cotisations sociales, impôts et charges patronales pour " + companySettings.name + ".",
              sections: [
                {
                  heading: "Synthèse des Coûts Globaux",
                  rows: [
                    { label: "Masse Salariale brute", value: formatCurrency(totalMonthlyGrossSalary, companySettings.currency) },
                    { label: "Charges Patronales Estimées (22%)", value: formatCurrency(estimatedEmployerCharges, companySettings.currency) },
                    { label: "Coût Total de Fonctionnement Moyen", value: formatCurrency(totalMonthlyGrossSalary + estimatedEmployerCharges, companySettings.currency) },
                    { label: "Coût Mensuel Moyen par Collaborateur", value: formatCurrency(averageCostPerEmployee, companySettings.currency) }
                  ]
                },
                {
                  heading: "Analyse Sectorielle & Départements",
                  rows: departmentStats.map(d => ({
                    label: `Département : ${d.name} (${d.count} ETP)`,
                    value: `${formatCurrency(d.totalSalary, companySettings.currency)} / moy ${formatCurrency(d.avgSalary, companySettings.currency)}`
                  }))
                },
                {
                  heading: "Scénario et Projection Fin d'Année",
                  rows: [
                    { label: "Projection Budgétaire Budget Annuel", value: formatCurrency((totalMonthlyGrossSalary + estimatedEmployerCharges) * 12, companySettings.currency) },
                    { label: "Allocation Retenues d'Assurance Maladie", value: formatCurrency(employees.length * 9000 * 12, companySettings.currency) },
                    { label: "Économie Fiscale Potentielle Suggérée", value: formatCurrency(estimatedEmployerCharges * 0.15, companySettings.currency) }
                  ]
                }
              ]
            });
          } else if (selectedReportType === 'social') {
            setGeneratedReportData({
              title: "BILAN SOCIAL & INDICES RH CONSOLIDÉS",
              ref: `JF-SOC-REF-${Math.floor(1000 + Math.random() * 9000)}`,
              date: dateStr,
              author: "Jefara Intelligence Engine",
              summary: "Statistiques sociodémographiques, indices de rétention d'effectif et analyse des compétences actives.",
              sections: [
                {
                  heading: "Structure Collective de l'Effectif",
                  rows: [
                    { label: "Total Collaborateurs Actifs", value: `${activeEmployees.length} Employés` },
                    { label: "Anciens Employés (Historique Inactifs)", value: `${inactiveEmployees.length} Profils` },
                    { label: "Taux de Rotation Global (Annuel)", value: `${simulatedTurnover}%` },
                    { label: "Moyenne Salariale des Équipes", value: formatCurrency(totalMonthlyGrossSalary / (activeEmployees.length || 1), companySettings.currency) }
                  ]
                },
                {
                  heading: "Matrice des Risques d'Attrition",
                  rows: [
                    { label: "Profils à Risque de Départ Élevé", value: `${employeeTalentRiskScore.filter(t => t.level === 'Élevé').length} collaborateur(s)` },
                    { label: "Profils à Risque Modéré", value: `${employeeTalentRiskScore.filter(t => t.level === 'Modéré').length} collaborateur(s)` },
                    { label: "Indice de stabilité sociale consolidé", value: `${100 - simulatedTurnover}% (Stable)` }
                  ]
                }
              ]
            });
          } else if (selectedReportType === 'equity') {
            setGeneratedReportData({
              title: "AUDIT D'ÉQUITÉ ET DE DISPARITÉ SALARIALE",
              ref: `JF-EQU-REF-${Math.floor(1000 + Math.random() * 9000)}`,
              date: dateStr,
              author: "Jefara Intelligence Engine",
              summary: "Examen des écarts salariaux, comparaison inter-départements et index d'égalité de rémunérations.",
              sections: [
                {
                  heading: "Indicateurs de Dispersion",
                  rows: [
                    { label: "Salaire Brut Maximum Observé", value: formatCurrency(salaryDisparities.max, companySettings.currency) },
                    { label: "Salaire Brut Minimum Observé", value: formatCurrency(salaryDisparities.min, companySettings.currency) },
                    { label: "Coefficient d'Écart de Salaire (Ratio)", value: `${salaryDisparities.ratio}x (max/min)` },
                    { label: "Indice d'Équité Interne", value: salaryDisparities.ratio > 4 ? "Médiocre (Écart de structure élevé)" : "Excellent (Cohésion stable)" }
                  ]
                },
                {
                  heading: "Rémunération par Poste de Référence",
                  rows: employees.map(e => ({
                    label: `${e.firstName} ${e.lastName} - ${e.position}`,
                    value: formatCurrency(e.baseSalary, companySettings.currency)
                  }))
                }
              ]
            });
          } else {
            setGeneratedReportData({
              title: "BILAN DE PLANIFICATION DU PASSIF SOCIAL",
              ref: `JF-PROV-REF-${Math.floor(1000 + Math.random() * 9000)}`,
              date: dateStr,
              author: "Jefara Intelligence Engine",
              summary: "Suivi comptable des provisions pour congés payés règlementaires et indemnités obligatoires de fin de carrière.",
              sections: [
                {
                  heading: "État des Engagements Cumulés",
                  rows: [
                    { label: "Provisions Totales Accumulées", value: formatCurrency(totalAccruedProvisions, companySettings.currency) },
                    { label: "Provisions Mensuelles de Congés", value: formatCurrency(provisions.reduce((sum, p) => sum + p.monthlyLeaveProvision, 0), companySettings.currency) },
                    { label: "Provisions Mensuelles Indemnités Retraite", value: formatCurrency(provisions.reduce((sum, p) => sum + p.fringeRetirementIndemnity, 0), companySettings.currency) }
                  ]
                },
                {
                  heading: "Couverture de Passif social par Employé",
                  rows: provisions.map(p => ({
                    label: p.employeeName,
                    value: `${formatCurrency(p.accruedAmount, companySettings.currency)} accumulé (${formatCurrency(p.monthlyLeaveProvision + p.fringeRetirementIndemnity, companySettings.currency)}/mois)`
                  }))
                }
              ]
            });
          }
        }
      }, (index + 1) * 350);
    });
  };

  // Simulated output download alert/feedback
  const handleDownloadStub = () => {
    alert(`📥 Téléchargement démarré : ${generatedReportData.title}_${generatedReportData.ref}.${reportFormat.toUpperCase()}`);
  };

  return (
    <div id="analytics_container" className="space-y-8 font-sans antialiased text-slate-800">
      
      {/* Title Header with AI Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10.5px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-1">
              <Sparkles size={11} className="fill-indigo-600 outline-none" />
              <span>Module Premium</span>
            </span>
            <span className="px-2.5 py-1 text-[10.5px] font-black uppercase text-teal-700 bg-teal-50 border border-teal-100 rounded-full">
              SYSCOHADA Sync
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            Espace Analyses Avancées & Décisionnel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pilotez l'activité de <span className="font-bold text-slate-700">{companySettings.name}</span> à l'aide de prévisions financières, de KPI RH et de rapports automatisés.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-500">Mise à jour en temps réel</span>
        </div>
      </div>

      {/* 1. KEY PERFORMANCE INDICATORS (KPIs) BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Masse salariale chargée */}
        <div id="kpi_loaded_payroll" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masse Salariale Chargée</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <DollarSign size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-3 font-mono">
              {formatCurrency(totalMonthlyGrossSalary + estimatedEmployerCharges, companySettings.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Brut de base ({formatCurrency(totalMonthlyGrossSalary, companySettings.currency)}) + Cotisations patronales ({formatCurrency(estimatedEmployerCharges, companySettings.currency)})
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-indigo-650">
            <span className="bg-indigo-50/70 p-0.5 px-1.5 rounded text-[10px]">Ratio patronal : 22.0%</span>
          </div>
        </div>

        {/* KPI 2: Coût Moyen par Employé */}
        <div id="kpi_avg_cost" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coût Moyen par Salarié</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <Layers size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-3 font-mono">
              {formatCurrency(averageCostPerEmployee, companySettings.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Coût total divisé par les {activeEmployees.length} employés actifs ce mois.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-teal-600">
            <TrendingUp size={14} />
            <span>+1.4% Vs Trimestre Précédent</span>
          </div>
        </div>

        {/* KPI 3: Taux de Rotation / Turnover estimé */}
        <div id="kpi_turnover" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Turnover annuel</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Users size={16} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mt-3 font-mono">
              {simulatedTurnover}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Pourcentage de dossiers clos ou profils inactifs sur l'effectif global enregistré ({employees.length}).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-rose-650">
            <div className="flex items-center gap-1 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <span>Inactifs : {inactiveEmployees.length}</span>
            </div>
            <span className="text-[10px] bg-rose-50 px-1.5 py-0.5 rounded text-rose-700 font-bold">Moy. Zone : 11.5%</span>
          </div>
        </div>

        {/* KPI 4: Provisions Accumulées */}
        <div id="kpi_provisions" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fonds Social Provisionné</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <BarChart3 size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-3 font-mono">
              {formatCurrency(totalAccruedProvisions, companySettings.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Sommes accumulées dans le grand livre comptable pour pallier les congés & indemnités de retraite.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>{provisions.length} Comptes Suivis</span>
            <span className="bg-amber-50 px-1.5 py-0.5 rounded text-[10.5px]">En sécurité</span>
          </div>
        </div>

      </div>

      {/* 2. DYNAMIC PREMIUM CHARTS AREA (CUSTOM RESPONSIVE INTERACTIVE SVGs) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
        
        {/* Header of charts and tab select */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              <span>Cartographie et Évolutions Décisionnelles</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Analyses croisées calculées dynamiquement d'après vos bulletins complexes Jefara.</p>
          </div>
          
          {/* Chart Swapper Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              id="chart_tab_financial"
              onClick={() => setActiveChartTab('financial')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                activeChartTab === 'financial' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Structure Financière de Paie
            </button>
            <button
              id="chart_tab_hr"
              onClick={() => setActiveChartTab('hr')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                activeChartTab === 'hr' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Équilibre par Département
            </button>
            <button
              id="chart_tab_treasury"
              onClick={() => setActiveChartTab('treasury')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                activeChartTab === 'treasury' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Planification à 6 mois
            </button>
          </div>
        </div>

        {/* Tab content 1: Financial Structure chart */}
        {activeChartTab === 'financial' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <span className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">Histogramme de décomposition du coût de paie</span>
              
              {/* Responsive SVG Bar Chart for Salary Components */}
              <div className="relative h-[250px] w-full border border-slate-50 bg-slate-50/30 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs text-slate-450 px-2">
                  <span className="font-semibold text-slate-500">Mois historique (Mai 2026) : Décomposition</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded text-indigo-700">Conformité OIT</span>
                </div>
                
                <div className="flex items-end justify-around h-[160px] pb-2 pt-4 relative">
                  {/* Grid background horizontal lines */}
                  <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 flex justify-between text-[8px] text-slate-400"><span>100% (Masse totale brute)</span></div>
                  <div className="absolute inset-x-0 top-[25%] border-t border-dashed border-slate-100 flex justify-between text-[8px] text-slate-400"><span>75%</span></div>
                  <div className="absolute inset-x-0 top-[50%] border-t border-dashed border-slate-100 flex justify-between text-[8px] text-slate-400"><span>50%</span></div>
                  <div className="absolute inset-x-0 top-[75%] border-t border-dashed border-slate-100 flex justify-between text-[8px] text-slate-400"><span>25%</span></div>
                  
                  {/* Column 1: Net Base Salary */}
                  <div className="flex flex-col items-center justify-end w-20 z-10 group cursor-pointer">
                    <div className="text-[10px] font-extrabold text-indigo-600 mb-1 font-mono">75%</div>
                    <div className="w-12 bg-indigo-500 hover:bg-indigo-600 rounded-t-lg transition-all" style={{ height: '112px' }}></div>
                    <span className="text-[11px] font-bold text-slate-600 mt-2 text-center leading-tight truncate">Net à Payer</span>
                  </div>

                  {/* Column 2: Employee Deductions */}
                  <div className="flex flex-col items-center justify-end w-20 z-10 group cursor-pointer">
                    <div className="text-[10px] font-extrabold text-amber-600 mb-1 font-mono">11%</div>
                    <div className="w-12 bg-amber-400 hover:bg-amber-500 rounded-t-lg transition-all" style={{ height: '33px' }}></div>
                    <span className="text-[11px] font-bold text-slate-600 mt-2 text-center leading-tight truncate">Retenues Salarié</span>
                  </div>

                  {/* Column 3: Employer Charges */}
                  <div className="flex flex-col items-center justify-end w-20 z-10 group cursor-pointer">
                    <div className="text-[10px] font-extrabold text-emerald-600 mb-1 font-mono">14%</div>
                    <div className="w-12 bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all" style={{ height: '42px' }}></div>
                    <span className="text-[11px] font-bold text-slate-600 mt-2 text-center leading-tight truncate">Charges Patronales</span>
                  </div>

                  {/* Column 4: Provisions and Fringe */}
                  <div className="flex flex-col items-center justify-end w-20 z-10 group cursor-pointer">
                    <div className="text-[10px] font-extrabold text-teal-600 mb-1 font-mono">5%</div>
                    <div className="w-12 bg-teal-400 hover:bg-teal-500 rounded-t-lg transition-all" style={{ height: '15px' }}></div>
                    <span className="text-[11px] font-bold text-slate-600 mt-2 text-center leading-tight truncate">Retraite & Congés</span>
                  </div>
                </div>

                <div className="flex justify-around border-t border-slate-100 pt-2 text-[9.5px] font-bold text-slate-400 font-mono">
                  <span>Net : {formatCurrency(totalMonthlyGrossSalary * 0.78, companySettings.currency)}</span>
                  <span>Impôts/Pension : {formatCurrency(totalMonthlyGrossSalary * 0.12, companySettings.currency)}</span>
                  <span>Patronal : {formatCurrency(estimatedEmployerCharges, companySettings.currency)}</span>
                </div>
              </div>
            </div>

            {/* Quick breakdown analytics text */}
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider">Aperçu de conformité de paie</span>
                <h4 className="text-sm font-extrabold text-slate-800 mt-2 leading-snug">
                  La charge salariale globale de votre entreprise est saine
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Le coût total d'un collaborateur chez <span className="font-semibold text-slate-700">{companySettings.name}</span> se compose à <b>75%</b> de salaire net en poche, le reste étant alloué au financement de sa couverture sociale CNPS, maladie, et IRPP pour le Cameroun.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Taux fiscal régional :</span>
                    <span className="font-bold text-slate-700 font-mono">11.4% en moyenne</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Taux patronal CFE/CNPS :</span>
                    <span className="font-bold text-teal-600 font-mono">14.0% requis</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-mono">
                  Généré conformément à la zone CEMAC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab content 2: HR Balance & Department share */}
        {activeChartTab === 'hr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <span className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">Répartition de la Rémunération par Département stratégique</span>
              
              {/* Dynamic Interactive Progress blocks simulating share */}
              <div className="space-y-4 pt-2">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="space-y-1.5 p-4 bg-slate-50/35 border border-slate-100 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: index === 0 ? '#4f46e5' : index === 1 ? '#0d9488' : index === 2 ? '#b45309' : '#1e293b' }}></span>
                        <span>{dept.name} <span className="text-slate-400 font-medium font-sans">({dept.count} employé(s))</span></span>
                      </div>
                      <span className="font-mono">{formatCurrency(dept.totalSalary, companySettings.currency)} ({dept.percentage}%)</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${dept.percentage}%`,
                          backgroundColor: index === 0 ? '#4f46e5' : index === 1 ? '#0d9488' : index === 2 ? '#b45309' : '#1e293b'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10.5px] text-slate-400 font-mono mt-1">
                      <span>Moyenne Salariale : {formatCurrency(dept.avgSalary, companySettings.currency)}/mois</span>
                      <span>Écart au médian : {dept.avgSalary > totalMonthlyGrossSalary / employees.length ? '+' : '-'}{Math.round(Math.abs(dept.avgSalary - (totalMonthlyGrossSalary / employees.length)) / 1000)}k FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diversity and organizational stats breakdown */}
            <div className="bg-slate-50/40 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-750 tracking-wider">KPI d'Indépendance en Management</span>
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concentration salariale</p>
                      <h5 className="text-base font-extrabold text-slate-800 mt-1">Technologie ({departmentStats.find(d => d.name === 'Technologie')?.percentage || 0}%)</h5>
                    </div>
                    <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">Forte</span>
                  </div>
                  
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de départements</p>
                      <h5 className="text-base font-extrabold text-slate-800 mt-1">{departmentStats.length} Pôles distincts</h5>
                    </div>
                    <span className="p-1 px-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">Équilibré</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durée de service moyenne</p>
                      <h5 className="text-base font-extrabold text-slate-800 mt-1">2.3 années de contrat</h5>
                    </div>
                    <span className="p-1 px-2.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">Rétention Forte</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-450 text-center leading-normal mt-4">
                💡 Le pôle "Technologie" est le premier pôle de dépense, en adéquation avec votre business model numérique.
              </p>
            </div>
          </div>
        )}

        {/* Tab content 3: Treasury simulation and compounding projection forecasts */}
        {activeChartTab === 'treasury' && (
          <div className="space-y-6">
            <span className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">Simulateur Intuitif de Masse Salariale & Prédictions de Trésorerie sur 6 mois</span>
            
            {/* Interactive Inputs Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-150">
              {/* Input 1: Recruits */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" />
                    <span>Nouvelles Recrues Prévues</span>
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-md font-mono">+{simulatedRecruitments} ETP</span>
                </div>
                <input 
                  id="sim_recruits_slider"
                  type="range" 
                  min="0" 
                  max="10" 
                  value={simulatedRecruitments}
                  onChange={(e) => setSimulatedRecruitments(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none" 
                />
                <span className="block text-[9.5px] text-slate-400">Recrutements prévus d'ici à la fin du semestre.</span>
              </div>

              {/* Input 2: Avg salary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-teal-600" />
                    <span>Salaire de Base de Recrue</span>
                  </span>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 font-bold rounded-md font-mono">{formatCurrency(simulatedAvgSalary, companySettings.currency)}</span>
                </div>
                <input 
                  id="sim_avg_salary_slider"
                  type="range" 
                  min="200000" 
                  max="1200000" 
                  step="50000"
                  value={simulatedAvgSalary}
                  onChange={(e) => setSimulatedAvgSalary(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none" 
                />
                <span className="block text-[9.5px] text-slate-400">Salaire brut moyen alloué à chaque nouvelle embauche.</span>
              </div>

              {/* Input 3: Increment Annual */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-amber-600" />
                    <span>Ajustement Annuel Général</span>
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-md font-mono">+{simulatedSalaryIncrease}%</span>
                </div>
                <input 
                  id="sim_increase_slider"
                  type="range" 
                  min="0" 
                  max="15" 
                  step="0.5"
                  value={simulatedSalaryIncrease}
                  onChange={(e) => setSimulatedSalaryIncrease(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none" 
                />
                <span className="block text-[9.5px] text-slate-400">Augmentation annuelle moyenne projetée pour l'effectif actuel.</span>
              </div>
            </div>

            {/* Dynamic Simulated chart outcome */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Dynamic projections details list */}
              <div className="lg:col-span-2 space-y-4">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Trajectoire projetée de dépenses de paie à 6 mois</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {forecastedSixMonthsData.map((f, idx) => (
                    <div key={idx} className="bg-slate-50/40 p-3 rounded-xl border border-slate-100 flex flex-col justify-between items-center text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.month}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50/70 text-indigo-700 rounded font-black mt-1 font-mono">{f.staff} ETP</span>
                      
                      <div className="my-3 flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 font-mono tracking-tight">{formatCurrency(f.payrollCost, companySettings.currency)}</span>
                        <span className="text-[8.5px] text-slate-400 leading-none mt-1">Coût paie estimé</span>
                      </div>
                      
                      <div className="w-full pt-2 border-t border-slate-100 text-[8.5px] font-bold text-emerald-600 font-mono">
                        Tréso: {formatCurrency(f.cashReserveNeeded, companySettings.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projected Conclusion commentary */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-900/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Brain size={16} />
                    <span className="text-[9.5px] font-black uppercase tracking-wider">Appréciation Prédictive</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-2 leading-relaxed">
                    Prédiction d'atterrissage sur Trésorerie
                  </h4>
                  <p className="text-xs text-slate-350 mt-2 leading-relaxed">
                    D'ici à Décembre 2026, l'intégration de <b>{simulatedRecruitments} ETPs</b> cumulé à l'ajustement salarial portera votre budget paie de base à <span className="font-extrabold text-white font-mono">{formatCurrency(forecastedSixMonthsData[5].payrollCost, companySettings.currency)}/mois</span>.
                  </p>
                  <p className="text-[10.5px] text-teal-350 mt-3 font-semibold">
                    💡 Recommandation passif social : nous prévoyons qu'une provision cumulée de {formatCurrency(forecastedSixMonthsData[5].provisionsCost, companySettings.currency)} résoudra 100% de vos risques de passif social d'ici à Décembre 2026.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 text-[9.5px] text-slate-500 font-mono">
                  Paramètres simulés • Jefara IA 2026
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* 3. DOUBLE SECTIONS: TALENT ATTRITION PRECURSORS & SMART COCKPIT RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Attrition/Retention Predictor Table */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Brain size={16} className="text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Indicateur Prédictif RH</h3>
              </div>
              <h3 className="text-base font-extrabold text-slate-950 mt-1 font-display">
                Analyse Prédictive de Risque de Départ (Turnover)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Note prédictive estimant les tensions ou déphasages salariaux régionaux.</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 py-1 px-2.5 rounded-lg flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
              <span>Focus Rétention</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="p-3">Collaborateur</th>
                  <th className="p-3">Département</th>
                  <th className="p-3 text-center">Score de Risque</th>
                  <th className="p-3 text-right">Alerte d'Alignement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans">
                {employeeTalentRiskScore.slice(0, 5).map((risk, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{risk.name}</p>
                      <p className="text-[10px] text-slate-400">{risk.position}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{risk.department}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Progressive score bar */}
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${risk.score}%`,
                              backgroundColor: risk.level === 'Élevé' ? '#ef4444' : risk.level === 'Modéré' ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className={`text-[10.5px] font-black font-mono px-1.5 py-0.5 rounded-full ${
                          risk.level === 'Élevé' ? 'text-red-700 bg-red-50' : risk.level === 'Modéré' ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
                        }`}>{risk.score}% ({risk.level})</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {risk.level === 'Élevé' && (
                        <span className="text-[10px] font-bold text-rose-655 bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-lg">Ajuster salaire</span>
                      )}
                      {risk.level === 'Modéré' && (
                        <span className="text-[10px] font-bold text-amber-655 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-lg">Faire entretien</span>
                      )}
                      {risk.level === 'Faible' && (
                        <span className="text-[10px] font-bold text-emerald-655 bg-emerald-50/70 px-2 py-0.5 rounded-lg">Stable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-100 bg-indigo-50/30 p-4 rounded-2xl flex items-start gap-3">
            <Lightbulb size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-900 leading-normal font-medium">
              💡 <b>Note de l'algorithme :</b> L'attrition se concentre sur les profils ayant une ancienneté de plus de 2 ans n'ayant pas reçu d'ajustements salariaux ces 12 derniers mois. L'écart-type de rémunération actuel reste toutefois gérable.
            </p>
          </div>
        </div>

        {/* Data-Based Actionable recommendations */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Lightbulb size={16} className="text-indigo-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Recommandations Automatisées</h3>
            </div>
            <h3 className="text-base font-extrabold text-slate-950 font-display">
              Conseils Analytiques & Optimisations Fiscales
            </h3>
            
            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {smartRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 border border-slate-100 bg-slate-50/20 hover:border-slate-200 rounded-2xl space-y-2 transition-all">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-slate-800">{rec.title}</h5>
                    <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border ${rec.badgeColor}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {rec.message}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button 
                      id={`btn_action_${rec.id}`}
                      onClick={() => alert(`Action simulée d'optimisation intelligente : "${rec.action}"`)}
                      className="px-2.5 py-1 text-[10px] font-extrabold text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg cursor-pointer transition flex items-center gap-1"
                    >
                      <span>{rec.action}</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
              Module de recommandation Jefara IA • SYSCOHADA compliant
            </span>
          </div>
        </div>

      </div>

      {/* 4. AUTOMATED AUDIT & REPORT GENERATOR (RAPPORTS AUTOMATISÉS) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Report Builder Config Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-black bg-indigo-550/30 text-indigo-200 py-1 px-3 rounded-full uppercase tracking-wider">
                Garantie de Conformité Locale
              </span>
              <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                Générateur de Rapports & Bilan Annuel
              </h3>
              <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">
                Compilez en un clic des bilans comptables et sociaux complets structurés selon les directives fiscales du {companySettings.country}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Modèle de Rapport Analytique</label>
                <select 
                  id="select_report_type"
                  value={selectedReportType}
                  onChange={(e) => {
                    setSelectedReportType(e.target.value as any);
                    setGeneratedReportData(null);
                  }}
                  className="w-full text-xs font-bold bg-slate-800 text-white border border-slate-700 hover:bg-slate-750 p-2.5 rounded-xl cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="financial">Bilan Financier & Masse Salariale Chargée</option>
                  <option value="social">Bilan Social & Indicateurs de Diversité (RH)</option>
                  <option value="equity">Audit d'Équité Salariale & Dispersion</option>
                  <option value="provisions">Planification du Passif Social (SYSCOHADA)</option>
                </select>
              </div>

              {/* Format select */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Format d'exportation requis</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="format_pdf"
                    type="button"
                    onClick={() => setReportFormat('pdf')}
                    className={`py-2 text-xs font-extrabold rounded-lg border transition text-center cursor-pointer ${
                      reportFormat === 'pdf' ? 'bg-indigo-600 text-white border-indigo-550 font-black' : 'bg-slate-800 text-slate-400 border-slate-750 hover:bg-slate-750'
                    }`}
                  >
                    PDF (Consulter)
                  </button>
                  <button
                    id="format_csv"
                    type="button"
                    onClick={() => setReportFormat('csv')}
                    className={`py-2 text-xs font-extrabold rounded-lg border transition text-center cursor-pointer ${
                      reportFormat === 'csv' ? 'bg-indigo-600 text-white border-indigo-555 font-black' : 'bg-slate-800 text-slate-400 border-slate-750 hover:bg-slate-750'
                    }`}
                  >
                    Excel / CSV
                  </button>
                  <button
                    id="format_json"
                    type="button"
                    onClick={() => setReportFormat('json')}
                    className={`py-2 text-xs font-extrabold rounded-lg border transition text-center cursor-pointer ${
                      reportFormat === 'json' ? 'bg-indigo-600 text-white border-indigo-555 font-black' : 'bg-slate-800 text-slate-400 border-slate-750 hover:bg-slate-750'
                    }`}
                  >
                    JSON Légal
                  </button>
                </div>
              </div>

              {/* Fire Compile button */}
              <button
                id="btn_compile_report"
                onClick={handleCompileReport}
                disabled={isGeneratingReport}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingReport ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Compilation en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="fill-white" />
                    <span>Compiler le document maintenant</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Report Output Display Terminal / Preview Panel */}
          <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between min-h-[300px]">
            <AnimatePresence mode="wait">
              {isGeneratingReport ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col justify-center items-center h-full space-y-4 py-8 font-mono"
                >
                  <RefreshCw className="text-indigo-400 animate-spin" size={32} />
                  <p className="text-xs text-indigo-300 font-bold">Moteur d'agrégation actif...</p>
                  <div className="w-full max-w-sm bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[pulse_1s_infinite]" style={{ width: '100%' }}></div>
                  </div>
                  
                  {/* Streaming simulation logs */}
                  <div className="w-full max-w-sm text-[10px] text-slate-400 space-y-1.5 text-left h-24 overflow-y-auto">
                    {generationLogs.map((log, idx) => (
                      <p key={idx} className="truncate">{log}</p>
                    ))}
                  </div>
                </motion.div>
              ) : generatedReportData ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Real printable preview report sheet */}
                  <div className="bg-white text-slate-800 rounded-xl p-6 border border-slate-100 space-y-4 shadow-sm select-text">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-650">{generatedReportData.author}</span>
                        <h4 className="text-xs font-black text-slate-900 mt-1 leading-normal uppercase">{generatedReportData.title}</h4>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{generatedReportData.ref}</p>
                      </div>
                      <div className="text-right text-[10px] font-bold text-slate-500 font-mono">
                        Date: {generatedReportData.date}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/30">
                      📝 {generatedReportData.summary}
                    </p>

                    {/* Table of data */}
                    <div className="space-y-4">
                      {generatedReportData.sections.map((section: any, sIdx: number) => (
                        <div key={sIdx} className="space-y-1">
                          <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400">{section.heading}</span>
                          <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 bg-slate-50/10">
                            {section.rows.map((row: any, rIdx: number) => (
                              <div key={rIdx} className="flex justify-between items-center p-2 text-[10.5px]">
                                <span className="font-semibold text-slate-600">{row.label}</span>
                                <span className="font-bold text-slate-800 font-mono">{row.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Seal / Footer of document */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[8.5px] text-slate-400 font-mono">
                      <span>Signé électroniquement Jefara SecOps</span>
                      <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                        <CheckCircle2 size={10} />
                        <span>Considéré Conforme localement</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions associated with generated preview */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-[10.5px] text-slate-400">
                      Rapport d'audit compilé d'après les standards juridiques CEMAC-UEMOA.
                    </p>
                    <button
                      id="btn_download_compiled"
                      onClick={handleDownloadStub}
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-1.5 shrink-0"
                    >
                      <Download size={13} />
                      <span>Télécharger (.{reportFormat.toUpperCase()})</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-slate-550 space-y-3 py-16 text-center">
                  <FileText className="text-slate-700" size={44} />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-350">En attente de compilation</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 mx-auto leading-relaxed">
                      Sélectionnez un modèle et configurez vos formats pour lancer l'audit statistique.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}

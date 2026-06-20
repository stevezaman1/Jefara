import { Users, CreditCard, Banknote, HelpCircle, ArrowUpRight, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';
import { Employee, PayrollRun, CompanySettings } from '../types';
import { formatCurrency } from '../utils/calculator';
import { motion } from 'motion/react';

interface DashboardViewProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  companySettings: CompanySettings;
  onNavigateToPayroll: () => void;
  onNavigateToEmployees: () => void;
  onNavigateToLeaves: () => void;
  pendingPayrollCount: number;
}

export default function DashboardView({
  employees,
  payrollRuns,
  companySettings,
  onNavigateToPayroll,
  onNavigateToEmployees,
  onNavigateToLeaves,
  pendingPayrollCount,
}: DashboardViewProps) {
  
  // Calculate dynamic stats from our active state
  const activeEmployeeCount = employees.filter(e => e.status === 'Actif').length;
  
  // Dynamic monthly gross total for current payroll base
  const dynamicBaseMonthlyGrossSum = employees
    .filter(e => e.status === 'Actif')
    .reduce((sum, emp) => sum + emp.baseSalary, 0);

  // Total completed runs count
  const donePayrollCount = payrollRuns.filter(r => r.status === 'Payé').length + 8; // start with 11 total runs historically

  // Hardcoded payroll evolution data for SVG charting
  const chartData = [
    { month: 'Déc 25', amount: 10800000, count: 34 },
    { month: 'Jan 26', amount: 11400000, count: 35 },
    { month: 'Fév 26', amount: 12150000, count: 36 },
    { month: 'Mar 26', amount: 12500000, count: 37 },
    { month: 'Avr 26', amount: 12500000, count: 37 },
    { month: 'Mai 26', amount: dynamicBaseMonthlyGrossSum, count: activeEmployeeCount },
  ];

  // Helper for SVG chart plotting
  const maxAmount = Math.max(...chartData.map(d => d.amount));
  const minAmount = Math.min(...chartData.map(d => d.amount)) * 0.95;
  const maxCount = Math.max(...chartData.map(d => d.count)) + 2;
  const minCount = Math.min(...chartData.map(d => d.count)) - 2;

  // Render simple beautiful SVG path for charts
  const width = 500;
  const height = 180;
  const padding = 30;

  const pointsMasseSalariale = chartData.map((d, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - ((d.amount - minAmount) * (height - padding * 2)) / (maxAmount - minAmount || 1);
    return { x, y, ...d };
  });

  const pointsEmployees = chartData.map((d, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - ((d.count - minCount) * (height - padding * 2)) / (maxCount - minCount || 1);
    return { x, y, ...d };
  });

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = height - padding;
    return `M ${firstX},${bottomY} L ${pointsStr} L ${lastX},${bottomY} Z`;
  };

  return (
    <div id="dashboard_view" className="space-y-8">
      {/* Alert or action reminder banner if there's pending payroll */}
      {pendingPayrollCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-950">Calcul de paie en attente</p>
              <p className="text-xs text-amber-700">La paie pour la période en cours n'a pas encore été clôturée et payée.</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToPayroll}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
          >
            Lancer la paie maintenant
          </button>
        </motion.div>
      )}

      {/* Main Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Employés */}
        <div id="stat_emp" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employés Actifs</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2 font-mono">
                {activeEmployeeCount}
              </h3>
              <p className="text-[11px] text-indigo-650 font-bold mt-1.5 flex items-center gap-1">
                <span>PME Clé en mains</span>
                <ChevronRight size={10} />
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: Masse Salariale */}
        <div id="stat_gross" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masse Salariale Mensuelle</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2 font-mono truncate max-w-[180px]">
                {formatCurrency(dynamicBaseMonthlyGrossSum, companySettings.currency)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Soutien économique
              </p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Banknote size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: Paie en attente */}
        <div id="stat_pending" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paie en attente</p>
              <h3 className="text-3xl font-black text-amber-500 mt-2 font-mono">
                {pendingPayrollCount}
              </h3>
              <p className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
                {pendingPayrollCount > 0 ? 'Période active à clôturer' : 'À jour pour ce mois'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        {/* Card 4: Paie effectuée */}
        <div id="stat_completed" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulletins Archivés</p>
              <h3 className="text-3xl font-black text-indigo-650 mt-2 font-mono">
                {donePayrollCount}
              </h3>
              <p className="text-[11px] text-emerald-650 font-bold mt-1.5 flex items-center gap-1">
                <CheckCircle size={12} />
                <span>Tous conformes</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold bg-indigo-500/30 text-indigo-200 py-1 px-3 rounded-full uppercase tracking-wider">
            Exécution de Paie
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-3">
            Calculez et distribuez les salaires en un clic.
          </h2>
          <p className="text-sm text-indigo-250 mt-2 leading-relaxed">
            Jefara s'occupe de tout : calcul automatique des bulletins, déductions CNPS, IPRES, impôts et impôts sur le revenu selon la législation locale de votre pays ({companySettings.country}).
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              id="run_payroll_hero_btn"
              onClick={onNavigateToPayroll}
              className="py-3 px-6 bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} className="animate-spin-slow" />
              <span>Lancer le calcul de Paie</span>
            </button>
            <button
              onClick={onNavigateToEmployees}
              className="py-3 px-6 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition border border-indigo-500/20 cursor-pointer"
            >
              Gérer l'effectif
            </button>
          </div>
        </div>
      </div>

      {/* Dual Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolution de la masse salariale card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-display">Évolution de la masse salariale</h3>
              <p className="text-xs text-slate-400 mt-0.5">Montant cumulé du brut de base des employés actifs (en {companySettings.currency})</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-md flex items-center gap-1 font-mono">
              <ArrowUpRight size={14} />
              <span>+3.2%</span>
            </span>
          </div>

          <div className="relative h-[200px] w-full flex flex-col justify-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientMasse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" />

              {/* Area */}
              <path d={buildAreaPath(pointsMasseSalariale)} fill="url(#gradientMasse)" />
              
              {/* Line */}
              <path d={buildPath(pointsMasseSalariale)} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots & Labels */}
              {pointsMasseSalariale.map((p, index) => (
                <g key={index} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                  {/* Tooltip on dot */}
                  <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-bold fill-slate-700 font-mono">
                    {Math.round(p.amount / 1000) / 1000}M
                  </text>
                  {/* Month labels on x-axis */}
                  <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Evolution du nombre d'employés card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-display">Nombre d'employés actifs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Suivi de l'évolution des effectifs depuis 6 mois</p>
            </div>
            <span className="text-xs font-bold text-slate-505 bg-slate-50 py-1 px-2.5 rounded-md font-mono">
              Moyenne: {(chartData.reduce((s,d)=>s+d.count, 0)/chartData.length).toFixed(1)}
            </span>
          </div>

          <div className="relative h-[200px] w-full flex flex-col justify-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientEmployees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" />

              {/* Area */}
              <path d={buildAreaPath(pointsEmployees)} fill="url(#gradientEmployees)" />

              {/* Line */}
              <path d={buildPath(pointsEmployees)} fill="none" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots & Labels */}
              {pointsEmployees.map((p, index) => (
                <g key={index}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 font-mono">
                    {p.count}
                  </text>
                  <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Action Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white hover:bg-slate-50 cursor-pointer p-6 rounded-3xl border border-slate-100 transition duration-200 shadow-sm group flex items-start gap-4" onClick={onNavigateToEmployees}>
          <div className="p-3.5 bg-slate-50 text-indigo-600 rounded-2xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition duration-200 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 font-display">Ajouter des collaborateurs</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Configurez leurs postes, départements et comptes bancaires locaux.</p>
          </div>
        </div>

        <div className="bg-white hover:bg-slate-50 cursor-pointer p-6 rounded-3xl border border-slate-100 transition duration-200 shadow-sm group flex items-start gap-4" onClick={onNavigateToLeaves}>
          <div className="p-3.5 bg-slate-50 text-amber-600 rounded-2xl shadow-inner group-hover:bg-amber-600 group-hover:text-white transition duration-200 shrink-0">
            <HelpCircle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 font-display">Demandes de congés</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Approuvez ou refusez en temps réel les demandes de vacances de l'effectif.</p>
          </div>
        </div>

        <div className="bg-white hover:bg-slate-50 cursor-pointer p-6 rounded-3xl border border-slate-100 transition duration-200 shadow-sm group flex items-start gap-4" onClick={onNavigateToPayroll}>
          <div className="p-3.5 bg-slate-50 text-teal-600 rounded-2xl shadow-inner group-hover:bg-teal-600 group-hover:text-white transition duration-200 shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 font-display">Calculer un bulletin de salaire</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Simulez le décompte des taxes et téléchargez immédiatement le PDF.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

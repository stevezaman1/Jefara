import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, UserPlus, Phone, Mail, Calendar, Banknote, CreditCard, 
  ChevronRight, X, Shield, FileText, CheckCircle2, AlertCircle, Trash2, Edit 
} from 'lucide-react';
import { Employee, LeaveRequest, PayslipHistoryItem, CompanySettings } from '../types';
import { formatCurrency, calculatePayroll } from '../utils/calculator';
import { generatePayslipPDF } from '../utils/pdfGenerator';

interface EmployeesViewProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  payslips: PayslipHistoryItem[];
  companySettings: CompanySettings;
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeesView({
  employees,
  leaves,
  payslips,
  companySettings,
  onAddEmployee,
  onDeleteEmployee,
}: EmployeesViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Tous');
  
  // Modals & Panels State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form Fields State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Technologie');
  const [hireDate, setHireDate] = useState('2026-06-19');
  const [baseSalary, setBaseSalary] = useState('450000');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Orange Money' | 'MTN Mobile Money' | 'Banque' | 'Autre'>('Banque');
  const [formError, setFormError] = useState<string | null>(null);

  const departments = ['Tous', 'Technologie', 'Ressources Humaines', 'Finance', 'Ventes', 'Opérations'];

  // Filtered List
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'Tous' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Handle addition
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const missingFields = [];
    if (!lastName.trim()) missingFields.push("Nom");
    if (!firstName.trim()) missingFields.push("Prénom");
    if (!email.trim()) missingFields.push("E-mail professionnel");
    if (!phone.trim()) missingFields.push("Numéro de Téléphone");
    if (!position.trim()) missingFields.push("Poste occupé");
    if (!hireDate) missingFields.push("Date d'embauche");
    if (!baseSalary || Number(baseSalary) <= 0) missingFields.push("Salaire brut mensuel");
    if (!bankAccountNumber.trim()) {
      if (paymentMethod === 'Banque') missingFields.push("Numéro de compte / RIB");
      else if (paymentMethod === 'Orange Money') missingFields.push("Numéro Orange Money");
      else if (paymentMethod === 'MTN Mobile Money') missingFields.push("Numéro MTN Mobile Money");
      else missingFields.push("Détails / Référence de paiement");
    }

    if (missingFields.length > 0) {
      setFormError(`Veuillez renseigner correctement les champs obligatoires : ${missingFields.join(', ')}.`);
      return;
    }

    // Email format validation check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Le format de l'adresse e-mail professionnel est incorrect.");
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      department,
      hireDate,
      baseSalary: Number(baseSalary),
      bankAccountNumber: bankAccountNumber.trim(),
      paymentMethod,
      status: 'Actif',
    };

    onAddEmployee(newEmp);
    
    // Clear states
    setLastName('');
    setFirstName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setBankAccountNumber('');
    setPaymentMethod('Banque');
    setFormError(null);
    setIsAddModalOpen(false);
    
    // Auto focus on the newly created employee to make the flow beautiful
    setSelectedEmployee(newEmp);
  };

  // Get employee-specific statistics
  const getEmployeePayslips = (id: string) => payslips.filter(p => p.employeeId === id);
  const getEmployeeLeaves = (id: string) => leaves.filter(l => l.employeeId === id);

  return (
    <div id="employees_view_wrapper" className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou poste..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>
          
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`py-1.5 px-3 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  selectedDept === dept ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn_open_add_employee"
          onClick={() => {
            setLastName('');
            setFirstName('');
            setEmail('');
            setPhone('');
            setPosition('');
            setDepartment('Technologie');
            setHireDate('2026-06-19');
            setBaseSalary('450000');
            setBankAccountNumber('');
            setPaymentMethod('Banque');
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100"
        >
          <Plus size={16} />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* Main Staff grid with Detail split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Center: Employees List Table or Card flow */}
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ${selectedEmployee ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2 font-display">
              <span>Effectif du Personnel</span>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black py-0.5 px-2.5 rounded-full">
                {filteredEmployees.length}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table id="employees_table" className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="py-4 px-6">Employé</th>
                  <th className="py-4 px-6">Poste / Département</th>
                  <th className="py-4 px-6">Salaire brut</th>
                  <th className="py-4 px-6 text-center">Statut</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      Aucun employé ne correspond aux critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`hover:bg-slate-50/60 transition cursor-pointer ${
                        selectedEmployee?.id === emp.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white`} style={{ backgroundColor: companySettings.logoColor }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-700 text-sm">{emp.position}</p>
                        <p className="text-xs text-slate-400">{emp.department}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-bold text-slate-800">
                          {formatCurrency(emp.baseSalary, companySettings.currency)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          emp.status === 'Actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Actif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="p-1 px-2.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition flex items-center gap-1"
                          >
                            <span>Fiche</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side drawer: Fiche Employé Detail */}
        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 lg:sticky lg:top-4"
            >
              {/* Quick action button positioned directly above the card */}
              <button
                id="btn_quick_add_from_detail"
                onClick={() => {
                  setLastName('');
                  setFirstName('');
                  setEmail('');
                  setPhone('');
                  setPosition('');
                  setDepartment('Technologie');
                  setHireDate('2026-06-19');
                  setBaseSalary('450000');
                  setBankAccountNumber('');
                  setPaymentMethod('Banque');
                  setFormError(null);
                  setIsAddModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-white hover:bg-indigo-50/40 text-indigo-600 font-extrabold text-xs rounded-2xl border border-slate-150/80 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-sm uppercase tracking-wider"
              >
                <Plus size={14} />
                <span>Ajouter un collaborateur</span>
              </button>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              {/* Header card detail */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl text-lg font-bold text-white flex items-center justify-center" style={{ backgroundColor: companySettings.logoColor }}>
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-none">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{selectedEmployee.position}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{selectedEmployee.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Big salary indicator */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salaire Brut de Base</span>
                  <div className="text-lg font-black text-slate-800 font-mono mt-0.5">
                    {formatCurrency(selectedEmployee.baseSalary, companySettings.currency)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calcul Estimé Net</span>
                  <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                    {formatCurrency(calculatePayroll(selectedEmployee.baseSalary, companySettings.country).netSalary, companySettings.currency)}
                  </div>
                </div>
              </div>

              {/* Employee Information Sections tabs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Informations Personnelles
                </h4>
                
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Embauché(e) le : <strong className="text-slate-700">{selectedEmployee.hireDate}</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CreditCard size={14} className="text-slate-400 shrink-0 mt-1" />
                    <div className="space-y-1.5 w-full">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Canal de paiement</p>
                        <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 mt-0.5 rounded-md ${
                          selectedEmployee.paymentMethod === 'Orange Money' ? 'bg-orange-50 text-orange-700 border border-orange-100/50' :
                          selectedEmployee.paymentMethod === 'MTN Mobile Money' ? 'bg-amber-50 text-amber-800 border border-amber-100/50' :
                          selectedEmployee.paymentMethod === 'Banque' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' :
                          'bg-purple-50 text-purple-700 border border-purple-100/50'
                        }`}>
                          {selectedEmployee.paymentMethod || 'Banque'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {selectedEmployee.paymentMethod === 'Orange Money' || selectedEmployee.paymentMethod === 'MTN Mobile Money'
                            ? 'Numéro de Compte Mobile'
                            : selectedEmployee.paymentMethod === 'Banque'
                            ? 'RIB de virement'
                            : 'Référence de paiement'}
                        </p>
                        <p className="font-mono text-slate-700 font-semibold leading-relaxed break-all text-[11px]">
                          {selectedEmployee.bankAccountNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique des paies pour cet employé */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Historique des paies
                </h4>
                
                {getEmployeePayslips(selectedEmployee.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun historique de bulletin enregistré.</p>
                ) : (
                  <div className="space-y-2">
                    {getEmployeePayslips(selectedEmployee.id).map(slip => (
                      <div key={slip.id} className="bg-slate-50 hover:bg-slate-100/50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div>
                          <p className="font-bold text-slate-800">{slip.month}</p>
                          <p className="text-[10px] text-slate-400">Payé le {slip.paymentDate}</p>
                        </div>
                        <button
                          onClick={() => generatePayslipPDF(selectedEmployee, slip, companySettings)}
                          className="py-1 px-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold text-[10px] rounded transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Congés de l'employé */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Congés & Absences
                </h4>
                
                {getEmployeeLeaves(selectedEmployee.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun congé planifié de façon active.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {getEmployeeLeaves(selectedEmployee.id).map(l => (
                      <div key={l.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{l.startDate} au {l.endDate}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            l.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-700' :
                            l.status === 'Refusé' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">{l.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents de l'employé */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Dossier administratif réclamé
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg text-slate-650">
                    <FileText size={12} className="text-slate-450" />
                    <span>Contrat de Travail</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 p-2 rounded-lg font-bold">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>Immatriculation CNPS</span>
                  </div>
                </div>
              </div>

              {/* Delete employee trigger */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    const confirmDel = window.confirm(`Voulez-vous vraiment désactiver ou retirer l'employé ${selectedEmployee.firstName} ${selectedEmployee.lastName} ?`);
                    if (confirmDel) {
                      onDeleteEmployee(selectedEmployee.id);
                      setSelectedEmployee(null);
                    }
                  }}
                  className="p-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Désactiver l'employé</span>
                </button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Modals Layer: Add Employee Dialog Form */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100"
            >
              {/* Header bar */}
              <div className="bg-indigo-950 text-white p-6 flex justify-between items-center shrink-0 border-b border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-300" />
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider font-display">Fiche d'Embauche d'un Collaborateur</h3>
                    <p className="text-xs text-indigo-200">Enregistrer un nouvel employé pour les calculs de paie du {companySettings.country}.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Container */}
                <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
                  
                  {/* Visual Validation Error Banner */}
                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-950 text-xs"
                    >
                      <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-bold">Informations requises manquantes</p>
                        <p className="mt-1 text-rose-700 leading-relaxed text-[11px]">{formError}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First and Last Name */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Nom *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Dupont"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Prénom *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Jean"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">E-mail professionnel *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean.dupont@entreprise.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Numéro de Téléphone *</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +237 677 88 99 00"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* job and division */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Poste occupé *</label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Développeur Backend"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Département d'affectation</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      >
                        {departments.filter(d => d !== 'Tous').map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Hire Date & Base gross salary */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Date d'embauche *</label>
                      <input
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Salaire brut mensuel ({companySettings.currency}) *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={baseSalary}
                          onChange={(e) => setBaseSalary(e.target.value)}
                          placeholder="e.g. 450000"
                          className="w-full p-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-mono font-bold"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500 font-bold font-mono">
                          {companySettings.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Moyen de paiement Choice option */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Moyen de paiement *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        { id: 'Banque', label: 'Virement/Banque', desc: 'Compte bancaire', accent: 'border-blue-500 text-blue-700 bg-blue-50/20' },
                        { id: 'Orange Money', label: 'Orange Money', desc: 'Mobile Money', accent: 'border-orange-500 text-orange-700 bg-orange-50/20' },
                        { id: 'MTN Mobile Money', label: 'MTN Mobile Money', desc: 'Mobile Money', accent: 'border-yellow-500 text-yellow-800 bg-yellow-50/20' },
                        { id: 'Autre', label: 'Autres', desc: 'Chèque / Autre', accent: 'border-purple-500 text-purple-700 bg-purple-50/20' }
                      ].map((opt) => {
                        const isSelected = paymentMethod === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(opt.id as any);
                              // Provide appropriate defaults based on selected type
                              if (opt.id === 'Orange Money' && (!bankAccountNumber || bankAccountNumber.startsWith('CMR-') || bankAccountNumber.startsWith('CIV-') || bankAccountNumber.startsWith('SEN-'))) {
                                setBankAccountNumber('+237 690 00 00 00');
                              } else if (opt.id === 'MTN Mobile Money' && (!bankAccountNumber || bankAccountNumber.startsWith('CMR-') || bankAccountNumber.startsWith('CIV-') || bankAccountNumber.startsWith('SEN-'))) {
                                setBankAccountNumber('+237 670 00 00 00');
                              } else if (opt.id === 'Banque' && (bankAccountNumber.startsWith('+') || bankAccountNumber.toLowerCase().includes('espèces') || bankAccountNumber.toLowerCase().includes('chèque'))) {
                                setBankAccountNumber('');
                              }
                            }}
                            className={`p-3 border rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                              isSelected 
                                ? `${opt.accent} border-2 font-bold shadow-xs ring-2 ring-indigo-500/10` 
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600'
                            }`}
                          >
                            <span className="text-xs leading-none">{opt.label}</span>
                            <span className="text-[9px] text-slate-400 mt-1 font-medium">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank account routing / Mobile details */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      {paymentMethod === 'Banque' && "Numéro de compte / RIB de virement *"}
                      {paymentMethod === 'Orange Money' && "Numéro de téléphone Orange Money *"}
                      {paymentMethod === 'MTN Mobile Money' && "Numéro de téléphone MTN Mobile Money *"}
                      {paymentMethod === 'Autre' && "Référence ou détails de paiement alternatif *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder={
                        paymentMethod === 'Banque' ? "e.g. CMR-10023-00045-12345678901-45" :
                        paymentMethod === 'Orange Money' ? "e.g. +237 699 99 99 99" :
                        paymentMethod === 'MTN Mobile Money' ? "e.g. +237 677 77 77 77" :
                        "e.g. Chèque de banque ou Paiement en espèces"
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">
                      {paymentMethod === 'Banque' && "Nécessaire à l'édition formelle du virement de la banque."}
                      {(paymentMethod === 'Orange Money' || paymentMethod === 'MTN Mobile Money') && "Nécessaire au transfert de salaire par Mobile Money."}
                      {paymentMethod === 'Autre' && "Nécessaire à la clarification de la méthode de règlement du salaire."}
                    </p>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormError(null);
                    }}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-indigo-100 uppercase tracking-wider animate-pulse-slow font-display"
                  >
                    Ajouter le collaborateur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

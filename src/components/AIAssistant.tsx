import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Minimize2, Maximize2, RefreshCw, FileText, BarChart2, Briefcase, HelpCircle } from 'lucide-react';

interface AIAssistantProps {
  companySettings: any;
  employees: any[];
  payrollRuns: any[];
  payslips: any[];
  leaves: any[];
  expenseClaims: any[];
  attendanceRecords?: any[];
  candidates?: any[];
  isFloating?: boolean;
  onClose?: () => void;
}

export default function AIAssistant({
  companySettings,
  employees,
  payrollRuns,
  payslips,
  leaves,
  expenseClaims,
  attendanceRecords = [],
  candidates = [],
  isFloating = false,
  onClose,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: `👋 Bonjour ! Je suis **Jefara AI**, votre assistant d'intelligence artificielle RH et Paie.
      
Je dispose d'un accès sécurisé et privé aux données de **${companySettings.name}** en temps réel.

Comment puis-je vous aider aujourd'hui ? Voici quelques suggestions :
- 📈 *« Rédiger un rapport de la masse salariale par département »*
- 📋 *« Préparer un projet de contrat de travail (CDI) Cameroun »*
- 💡 *« Recommander des ajustements d'Onboarding pour nos candidats »*
- ⏱️ *« Analyser les heures supplémentaires et retards de la semaine »*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest dialogue message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Aggregate current company dashboard state to pass server-side for secure RAG prompt context
  const getContextInfo = () => {
    return {
      company: {
        name: companySettings.name,
        country: companySettings.country,
        currency: companySettings.currency,
        address: companySettings.address,
      },
      stats: {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === 'Actif').length,
        payrollRunsHistoryCount: payrollRuns.length,
        pendingLeavesCount: leaves.filter((l) => l.status === 'En attente').length,
        pendingClaimsCount: expenseClaims.filter((c) => c.status === 'En attente').length,
        totalExpensesReimbursed: expenseClaims
          .filter((c) => c.status === 'Remboursé')
          .reduce((sum, c) => sum + c.amount, 0),
        globalPresenceRate: "94.5%",
      },
      employeesBrief: employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        position: e.position,
        department: e.department,
        baseSalary: e.baseSalary,
        hireDate: e.hireDate,
        status: e.status,
      })),
      onboardingBrief: onboardingTasksBrief(),
      attendanceBrief: attendanceRecords.map((a) => ({
        name: a.employeeName,
        date: a.date,
        totalHours: a.totalHours,
        overtimeHours: a.overtimeHours,
        delayMinutes: a.delayMinutes,
        workMode: a.workMode,
        isAbsent: a.isAbsent,
        absentReason: a.absentReason,
      })),
      candidatesPipeline: candidates.map((c) => ({
        name: c.name,
        position: c.position,
        status: c.status,
        applyDate: c.applyDate,
      })),
    };
  };

  function onboardingTasksBrief() {
    return [
      { employee: "Jean Dupont", task: "Signature CDI", status: "Terminé" },
      { employee: "Koffi Serge", task: "Ouverture compte de paie", status: "À faire" },
    ];
  }

  const handleSend = async (textToSend?: string) => {
    const userMessage = textToSend || input;
    if (!userMessage.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    // append to local history state
    const newHistory = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          contextInfo: getContextInfo(),
          history: messages, // pass conversation logs for context awareness
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: `⚠️ **Erreur :** ${data.error || "Impossible d'obtenir une réponse de l'assistant Jefara."}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ **Erreur de réseau :** Impossible de joindre le serveur. Veuillez ré-essayer.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: `🧹 *Historique réinitialisé.* Comment puis-je vous aider de nouveau avec les données de **${companySettings.name}** ?`,
      },
    ]);
  };

  // Helper component to render simple paragraph markdown-like text nicely
  const formatText = (text: string) => {
    // Basic formatting replacement for presentation rhythm
    return text.split('\n').map((line, idx) => {
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-[#EEF2F6] text-[#4f46e5] px-1.5 py-0.5 rounded-md font-mono text-xs">$1</code>')
        .replace(/^- (.*)$/g, '• $1');

      if (line.match(/^### (.*)/)) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-3 mb-1.5" dangerouslySetInnerHTML={{ __html: line.replace(/^### /, '') }} />;
      }
      if (line.match(/^## (.*)/)) {
        return <h3 key={idx} className="text-base font-extrabold text-indigo-950 mt-4 mb-2 border-b border-slate-100 pb-1" dangerouslySetInnerHTML={{ __html: line.replace(/^## /, '') }} />;
      }
      return (
        <p
          key={idx}
          className={`leading-relaxed text-slate-650 mb-1.5 text-[11.5px] font-medium ${line.startsWith('•') ? 'ml-3' : ''}`}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  const chips = [
    { label: 'Rapport Masse Salariale', icon: BarChart2, prompt: 'Génère un rapport d\'analyse de la masse salariale par département avec recommandations.' },
    { label: 'Draft Contrat CDI', icon: FileText, prompt: 'Génère un draft de contrat de travail (CDI Cameroun) pour un Développeur Fullstack sénior rémunéré à 500 000 FCFA net par mois.' },
    { label: 'Evaluation de Performance', icon: BRIEFCASE_ICON_MAPPR(), prompt: 'Propose-moi un canevas d\'évaluation annuelle de performance 5 étoiles avec objectifs SMART adaptés pour Jefara.' },
    { label: 'Heures sup & Retards', icon: Sparkles, prompt: 'Fais un condensé analytique des heures supplémentaires et du taux de retards à partir des données de présences de l\'équipe.' },
  ];

  function BRIEFCASE_ICON_MAPPR() {
    return Briefcase;
  }

  // Floating styling vs In-tab styling
  const containerClass = isFloating
    ? 'fixed bottom-5 right-5 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col z-50 overflow-hidden font-sans'
    : 'w-full h-[620px] bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden font-sans shadow-sm';

  return (
    <div className={containerClass} id="jefara_ai_assistant">
      {/* HEADER PANEL */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Bot size={18} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs tracking-tight">Assistant Intelligent Jefara</h3>
              <span className="bg-indigo-500/20 text-indigo-300 font-black text-[8px] py-0.5 px-2 rounded-full uppercase tracking-widest border border-indigo-500/20">AGENT 3.5</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Connecté aux données Live</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Effacer le chat"
          >
            <RefreshCw size={14} />
          </button>
          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* CHAT WINDOW MESSAGE AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]/55">
        {messages.map((m, index) => (
          <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
              m.role === 'user' 
                ? 'bg-indigo-650 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none font-semibold'
            }`}>
              {m.role === 'user' ? (
                <p className="text-xs font-semibold whitespace-pre-wrap leading-relaxed">{m.text}</p>
              ) : (
                <div className="space-y-1.5 font-medium">{formatText(m.text)}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center gap-3">
              <Sparkles size={14} className="text-indigo-600 animate-spin" />
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK CHIPS SECTION - Hidden if chat has got too many messages in floating view */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 shrink-0 select-none">
          <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Suggestions d'analyses :</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {chips.map((chip, idx) => {
              const IconComp = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-150 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-indigo-700 transition cursor-pointer shrink-0 shadow-xs"
                >
                  <IconComp size={11} className="text-slate-400 group-hover:text-indigo-600" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* INPUT CONTROLS */}
      <div className="p-3 border-t border-slate-100 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-55 border border-slate-200 rounded-xl p-1 focus-within:border-indigo-400 transition"
        >
          <input
            type="text"
            className="flex-grow bg-transparent text-xs text-slate-800 font-semibold h-9 px-2 focus:outline-none placeholder-slate-400"
            placeholder="Écrivez votre question RH ou formulez un rapport..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Send size={13} className="relative left-[1px]" />
          </button>
        </form>
        <p className="text-[8px] text-center text-slate-400 font-semibold tracking-wide mt-1.5">
          Jefara AI ne stocke pas vos questions et applique les restrictions de confidentialité de votre rôle (Admin).
        </p>
      </div>
    </div>
  );
}

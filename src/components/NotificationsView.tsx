import React from 'react';
import { Mail, Check, Inbox, Send, ShieldAlert, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { MailNotification } from '../types';

interface NotificationsViewProps {
  notifications: MailNotification[];
  onClearAll: () => void;
}

export default function NotificationsView({ notifications, onClearAll }: NotificationsViewProps) {
  
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div id="notifications_view_wrapper" className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 font-display">
            <Mail className="text-indigo-600 shrink-0" size={18} />
            <span>Serveur de Notifications Mail (SMTP)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Flux d'e-mails automatiques envoyés aux collaborateurs lors des opérations.</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-600 hover:bg-red-50 font-bold border border-red-200 py-2 px-3 rounded-xl transition cursor-pointer"
          >
            Vider l'historique d'envoi
          </button>
        )}
      </div>

      {/* Simulator Inbox Wrapper */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        {/* Simulated top menu */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 block" />
            <span className="w-3 h-3 rounded-full bg-green-500 block" />
            <span className="text-[10px] font-bold font-mono text-slate-500 ml-2">JEFARA SMTP SERVICE STATUS: ACTIVE</span>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold font-mono">
            SSL SECURE
          </span>
        </div>

        {/* Mails panel */}
        <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Inbox size={40} className="mx-auto text-slate-600 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="font-bold text-xs">Aucun e-mail n'a été émis pour le moment</p>
                <p className="text-[10px] text-slate-600">Les e-mails d'inscription, d'exécutions de paie et de congés s'afficheront ici en direct.</p>
              </div>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className="p-5.5 hover:bg-slate-950/40 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg text-xs leading-none ${
                      notif.type === 'payroll' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      notif.type === 'leave' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                      <Send size={11} className="inline mr-1" />
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400"> destinataire : <strong>{notif.recipient}</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold">
                    <Clock size={11} />
                    <span>{formatDate(notif.timestamp)}</span>
                  </div>
                </div>

                {/* Email Subject & Core Simulated block */}
                <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl space-y-1.5">
                  <p className="text-xs font-semibold text-slate-200">Objet: {notif.title} - Jefara Mailer</p>
                  <p className="text-[11px] text-slate-400 whitespace-pre-line leading-relaxed mt-1">
                    {notif.message}
                  </p>
                </div>

                {/* Success SMTP code log */}
                <span className="inline-flex mt-2.5 items-center gap-1 text-[9px] font-mono text-emerald-500 font-semibold uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>250 OK - Message delivered to mail exchange server</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

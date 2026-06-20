import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('admin@jefara.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulate natural premium delay
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 900);
  };

  return (
    <div id="login_container" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased">
      {/* Top Banner / Announcement bar */}
      <div className="bg-indigo-900 text-indigo-100 py-2.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <Globe size={14} />
        <span>Infrastructure de Paie Conforme pour le Cameroun, la Côte d'Ivoire, le Sénégal & l'Afrique Francophone</span>
      </div>

      {/* Main Login Card Portion */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10"
        >
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-3 shadow-md shadow-indigo-200">
              <Briefcase size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Jefara
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs mx-auto">
              Payroll infrastructure for francophone Africa
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs py-2.5 px-4 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Adresse e-mail responsable RH
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="votre.email@entreprise.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-500 font-medium cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2 h-4 w-4" />
                Se souvenir de moi
              </label>
              <span className="text-indigo-600 hover:underline cursor-pointer font-medium">
                Mot de passe oublié ?
              </span>
            </div>

            <button
              id="login_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-150 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Client Target Segment Info Badge */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl">
            <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Accès Démo Sécurisé</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Destiné aux PME de 10 à 200 employés au Cameroun, en Côte d’Ivoire, au Sénégal, et autres pays francophones d'Afrique.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="py-6 px-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>© 2026 Jefara Inc. Tous droits réservés. Pilotage de la paie multinationale d’Afrique Subsaharienne.</p>
      </footer>
    </div>
  );
}

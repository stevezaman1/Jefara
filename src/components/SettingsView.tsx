import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, Sparkles, Building2, MapPin, Globe, Palette, Info } from 'lucide-react';
import { CompanySettings, CountryType } from '../types';

interface SettingsViewProps {
  currentSettings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
}

export default function SettingsView({ currentSettings, onSaveSettings }: SettingsViewProps) {
  const [name, setName] = useState(currentSettings.name);
  const [country, setCountry] = useState<CountryType>(currentSettings.country);
  const [currency, setCurrency] = useState(currentSettings.currency);
  const [address, setAddress] = useState(currentSettings.address);
  const [logoText, setLogoText] = useState(currentSettings.logoText);
  const [logoColor, setLogoColor] = useState(currentSettings.logoColor);

  const countries: CountryType[] = ['Cameroun', "Côte d'Ivoire", 'Sénégal', 'Autre (Afrique Francophone)'];

  const colorPresets = [
    { name: 'Indigo Corporate', hex: '#4f46e5' },
    { name: 'Teal Moderne', hex: '#0d9488' },
    { name: 'Or Profond', hex: '#b45309' },
    { name: 'Slate Élégant', hex: '#334155' },
    { name: 'Emeraude Africaine', hex: '#059669' },
  ];

  const handleCountrySelection = (val: CountryType) => {
    setCountry(val);
    // Auto preset currency based on chosen country for realistic ease
    if (val === 'Cameroun' || val === "Côte d'Ivoire" || val === 'Sénégal') {
      setCurrency('FCFA');
    } else {
      setCurrency('FCFA'); // remains franc zone mostly, but editable
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      alert('Veuillez remplir les informations obligatoires.');
      return;
    }
    
    onSaveSettings({
      name,
      country,
      currency,
      address,
      logoText: logoText || name.substring(0, 2).toUpperCase(),
      logoColor,
    });
  };

  return (
    <div id="settings_view_wrapper" className="max-w-3xl mx-auto space-y-6">
      {/* Alert about configuration influence */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex items-start gap-3 text-indigo-950 text-xs">
        <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
        <div>
          <p className="font-bold">Effet direct sur les calculs & PDFs</p>
          <p className="text-indigo-700 font-medium leading-relaxed mt-0.5">
            Toute modification du Pays d'exploitation modifie de manière sous-jacente les taux d'imposition sur le revenu et les cotisations sécurité sociale (CNPS/IPRES). Le logo et l'adresse de l'entête sont injectés sur les bulletins PDF générés.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-slate-600" size={18} />
            <h4 className="text-sm font-bold text-slate-800">Paramètres de l'entreprise</h4>
          </div>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded-full font-bold">
            Conformité Légale Garantie
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name and logo initial text */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                <Building2 size={12} />
                <span>Raison sociale (Nom entreprise) *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (logoText.length <= 2) {
                    setLogoText(e.target.value.substring(0, 2).toUpperCase());
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                Sigle / Initiales du logo (2 Caractères)
              </label>
              <input
                type="text"
                maxLength={2}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                placeholder="JF"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-bold text-center uppercase tracking-widest"
              />
            </div>

            {/* Geographical settings */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                <Globe size={12} />
                <span>Pays d'exploitation principal *</span>
              </label>
              <select
                value={country}
                onChange={(e) => handleCountrySelection(e.target.value as CountryType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                <Palette size={12} />
                <span>Devise monétaire des salaires</span>
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-bold text-center font-mono"
              />
            </div>

            {/* Full postal physical address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                <MapPin size={12} />
                <span>Adresse physique complète du siège social *</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Boulevard de la Liberté, Douala, Cameroun"
              />
            </div>

            {/* Color Identity selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Identité Visuelle (Couleur du Logo & Fiches d'Équipes)
              </label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {colorPresets.map(col => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setLogoColor(col.hex)}
                    className={`py-2 px-3 text-[11px] font-bold rounded-xl flex items-center gap-2 border transition duration-150 cursor-pointer ${
                      logoColor === col.hex 
                        ? 'border-slate-800 bg-slate-900 text-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.hex }} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              id="settings_submit_btn"
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Save size={14} />
              <span>Sauvegarder les paramètres</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Avatar Preview card */}
      <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">Aperçu Visuel de l'Entête de Paie</h5>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl text-xl font-bold text-white flex items-center justify-center shadow-md shadow-indigo-150 shrink-0" style={{ backgroundColor: logoColor }}>
          {logoText}
        </div>
        <div className="text-center sm:text-left leading-relaxed">
          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">{name || 'VOTRE ENTREPRISE'}</h4>
          <p className="text-[11px] text-slate-500 font-semibold">{address}</p>
          <span className="inline-block mt-1 bg-indigo-100 text-indigo-800 font-black text-[9px] px-2 py-0.5 rounded-md">
            Législation : {country} ({currency})
          </span>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { 
  Palette, 
  Save, 
  RefreshCw, 
  Type, 
  Shield, 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  CheckCircle, 
  Image as ImageIcon, 
  Stamp, 
  FileCheck,
  FileCode,
  Archive,
  Star
} from 'lucide-react';
import { TeamTheme, DocumentStatus } from '../types';

interface SettingsProps {
  theme: TeamTheme;
  onThemeChange: (newTheme: TeamTheme) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = React.useState<TeamTheme>(theme);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DOCUMENTS'>('VISUAL');

  const handleSave = () => {
    onThemeChange(localTheme);
    alert('Identidade visual do clube atualizada com sucesso!');
  };

  const resetTheme = () => {
    const defaultTheme: TeamTheme = {
      primary: '#1e3a8a',
      secondary: '#0f172a',
      accent: '#3b82f6',
      teamName: 'TeamMaster Pro',
      clubDocuments: theme.clubDocuments
    };
    setLocalTheme(defaultTheme);
  };

  // Documentos recomendados que devem estar no dossiê
  const dossierCategories = [
    { id: 'visual', label: 'Identidade Visual', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50', docs: ['Logo Original (Vetor)', 'Manual da Marca', 'Fotos Oficiais'] },
    { id: 'legal', label: 'Documentação Legal', icon: Stamp, color: 'text-emerald-600', bg: 'bg-emerald-50', docs: ['Estatuto Social', 'Ata de Fundação', 'Cartão CNPJ', 'Alvará'] },
    { id: 'others', label: 'Outros Arquivos', icon: FileCheck, color: 'text-amber-600', bg: 'bg-amber-50', docs: ['Contratos de Patrocínio', 'Regulamento Interno'] }
  ];

  const getDocIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('logo') || t.includes('foto') || t.includes('manual')) return <ImageIcon size={28} />;
    if (t.includes('estatuto') || t.includes('ata') || t.includes('cnpj')) return <Stamp size={28} />;
    if (t.includes('contrato') || t.includes('regulamento')) return <FileCheck size={28} />;
    return <FileText size={28} />;
  };

  const getDocColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('logo')) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (t.includes('estatuto')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (t.includes('cnpj')) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações do Clube</h2>
          <p className="text-slate-500 font-medium">Gerencie a alma visual e a burocracia oficial da sua instituição.</p>
        </div>
        <div className="flex items-center bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('VISUAL')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'VISUAL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Palette size={16} />
            <span>Visual</span>
          </button>
          <button 
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'DOCUMENTS' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Archive size={16} />
            <span>Dossiê do Clube</span>
          </button>
        </div>
      </div>

      {activeTab === 'VISUAL' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-4">
                 <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Type size={14} />
                   <span>Nome Oficial do Clube</span>
                 </label>
                 <input 
                   type="text"
                   value={localTheme.teamName}
                   onChange={(e) => setLocalTheme({...localTheme, teamName: e.target.value})}
                   className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-800 font-black text-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Palette size={14} />
                      <span>Cor Primária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.primary}
                        onChange={(e) => setLocalTheme({...localTheme, primary: e.target.value})}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0"
                      />
                      <input 
                        type="text"
                        value={localTheme.primary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-mono font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Palette size={14} />
                      <span>Cor Secundária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.secondary}
                        onChange={(e) => setLocalTheme({...localTheme, secondary: e.target.value})}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0"
                      />
                      <input 
                        type="text"
                        value={localTheme.secondary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-mono font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Palette size={14} />
                      <span>Destaque (Ações)</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.accent}
                        onChange={(e) => setLocalTheme({...localTheme, accent: e.target.value})}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0"
                      />
                      <input 
                        type="text"
                        value={localTheme.accent.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-mono font-bold"
                      />
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                onClick={resetTheme}
                className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl font-bold text-sm transition-all"
              >
                <RefreshCw size={18} />
                <span>Restaurar Padrão</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: localTheme.primary }}
              >
                <Save size={18} />
                <span>Salvar Identidade</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Escudo e Cores do Clube</p>
             
             <div 
               className="aspect-square rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-white relative overflow-hidden group"
               style={{ background: `linear-gradient(160deg, ${localTheme.secondary} 0%, ${localTheme.primary} 100%)` }}
             >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="w-40 h-40 bg-white/10 backdrop-blur-xl border-4 border-white/20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-black/20 transform group-hover:scale-110 transition-transform duration-500">
                   <Shield size={80} className="text-white drop-shadow-lg" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-center uppercase leading-none drop-shadow-md">
                  {localTheme.teamName}
                </h3>
                <div className="mt-4 flex space-x-2 opacity-60">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: localTheme.accent }}></div>
                   <div className="w-3 h-3 rounded-full bg-white/20"></div>
                   <div className="w-3 h-3 rounded-full bg-white/20"></div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Dashboard Dossier Header */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Archive size={160} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                  <Archive className="mr-3 text-blue-600" size={32} />
                  Dossiê Institucional
                </h3>
                <p className="text-slate-500 font-medium mt-1">Armazene de forma segura a Logo Original e documentos vitais do seu time.</p>
              </div>
              <button className="flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 group">
                <Upload size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                <span>Novo Documento</span>
              </button>
            </div>
          </div>

          {/* New Sectioned Grid for Documents */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="h-[2px] flex-1 bg-slate-100"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Arquivos de Alta Importância</p>
              <div className="h-[2px] flex-1 bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Logo Especial Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all group flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Star size={60} className="text-blue-600" />
                </div>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner border border-blue-100">
                  <ImageIcon size={40} />
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">Logo Original (Vetor)</h4>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">IDENTIDADE VISUAL</p>
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                    <CheckCircle size={12} className="mr-1.5" /> Disponível
                  </span>
                </div>
                <div className="flex w-full space-x-2 mt-auto">
                  <button className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center">
                    <Download size={16} className="mr-2" /> Baixar
                  </button>
                </div>
              </div>

              {/* Loop through club documents with enhanced styling */}
              {localTheme.clubDocuments.map((doc) => {
                const docStyles = getDocColor(doc.type);
                return (
                  <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-inner border ${docStyles}`}>
                      {getDocIcon(doc.type)}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 truncate w-full">{doc.type}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate w-full">REF: {doc.documentNumber}</p>
                    <div className="flex items-center justify-center space-x-2 mb-8">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        <CheckCircle size={12} className="mr-1.5" /> Validado
                      </span>
                    </div>
                    <div className="flex w-full space-x-2 mt-auto">
                      <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white">
                        <Download size={16} className="mr-2" /> Baixar
                      </button>
                      <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Mockup Card */}
              <button className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-white transition-all group flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-white text-slate-300 group-hover:text-blue-600 group-hover:scale-110 transition-all rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Adicionar Arquivo</p>
                <p className="text-[10px] font-medium text-slate-400 mt-2">Clique para buscar ou arraste aqui</p>
              </button>
            </div>
          </div>

          {/* Dossier Categories Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dossierCategories.map((cat, idx) => (
              <div key={idx} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-4 rounded-[1.5rem] ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                    <cat.icon size={24} />
                  </div>
                  <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{cat.label}</h4>
                </div>
                <div className="space-y-3">
                  {cat.docs.map((doc, dIdx) => (
                    <div key={dIdx} className="w-full flex items-center justify-between px-5 py-3 bg-white border border-slate-100 rounded-2xl group/item hover:border-blue-200 transition-all">
                      <span className="text-[11px] font-bold text-slate-600">{doc}</span>
                      <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                          <Upload size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {localTheme.clubDocuments.length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <Archive size={60} className="mx-auto text-slate-200 mb-6" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Nenhum documento cadastrado</p>
              <button className="mt-8 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline">
                Iniciar Preenchimento do Dossiê
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;

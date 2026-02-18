
import React, { useState, useRef } from 'react';
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
  Archive,
  Pipette,
  Camera,
  Sparkles
} from 'lucide-react';
import { TeamTheme, DocumentStatus } from '../types';

// DO add comment above each fix.
// Fixed: Added helper function to return appropriate icon based on document type.
const getDocIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('estatuto')) return <Stamp size={40} />;
  if (t.includes('cnpj')) return <FileCheck size={40} />;
  return <FileText size={40} />;
};

// Fixed: Added helper function to return appropriate CSS classes based on document type.
const getDocColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('estatuto')) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (t.includes('cnpj')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
};

interface SettingsProps {
  theme: TeamTheme;
  onThemeChange: (newTheme: TeamTheme) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = React.useState<TeamTheme>(theme);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DOCUMENTS'>('VISUAL');
  const [isExtracting, setIsExtracting] = useState(false);
  
  const crestInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onThemeChange(localTheme);
    alert('Identidade visual do clube atualizada com sucesso! O degradê do sistema foi sincronizado.');
  };

  const resetTheme = () => {
    const defaultTheme: TeamTheme = {
      primary: '#1e3a8a',
      secondary: '#0f172a',
      accent: '#3b82f6',
      teamName: 'TeamMaster Pro',
      crestUrl: undefined,
      clubDocuments: theme.clubDocuments
    };
    setLocalTheme(defaultTheme);
  };

  const handleCrestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalTheme({ ...localTheme, crestUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = () => {
    if (!localTheme.crestUrl) return;
    setIsExtracting(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = localTheme.crestUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 50; 
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      const colorCounts: { [key: string]: number } = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        const a = imageData[i+3];

        if (a < 128) continue; 

        const rgb = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => {
          const [r, g, b] = entry[0].split(',').map(Number);
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        });

      const primary = sortedColors[0] || '#1e3a8a';
      const secondary = sortedColors[1] || '#0f172a';
      const accent = sortedColors[2] || sortedColors[3] || '#3b82f6';

      setLocalTheme({
        ...localTheme,
        primary,
        secondary,
        accent
      });
      
      setIsExtracting(false);
      
      // Notificação visual da mudança
      document.documentElement.style.setProperty('--primary-color', primary);
      document.documentElement.style.setProperty('--accent-color', accent);
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações do Clube</h2>
          <p className="text-slate-500 font-medium">Gerencie a alma visual e a burocracia oficial.</p>
        </div>
        <div className="flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200">
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
            <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
              
              <div className="space-y-4">
                 <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Type size={14} />
                   <span>Nome Oficial do Clube</span>
                 </label>
                 <input 
                   type="text"
                   value={localTheme.teamName}
                   onChange={(e) => setLocalTheme({...localTheme, teamName: e.target.value})}
                   className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-black text-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                 />
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Shield size={14} />
                   <span>Escudo do Clube (PNG/JPG)</span>
                 </label>
                 <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100">
                    <div 
                      onClick={() => crestInputRef.current?.click()}
                      className="w-32 h-32 rounded-[2.2rem] bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm overflow-hidden group relative"
                    >
                      {localTheme.crestUrl ? (
                        <img src={localTheme.crestUrl} className="w-full h-full object-contain p-2" alt="Escudo" />
                      ) : (
                        <>
                          <Camera size={24} className="text-slate-300 mb-1" />
                          <span className="text-[9px] font-black uppercase text-slate-400">Inserir</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                       <h4 className="text-lg font-black text-slate-800 tracking-tight">Sincronização de Cores</h4>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                         Ao carregar seu escudo, use a ferramenta de extração para definir automaticamente as cores do sistema e o <strong>degradê de fundo</strong> de todas as áreas da plataforma.
                       </p>
                       <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => crestInputRef.current?.click()}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-2"
                          >
                            <Upload size={14} />
                            <span>Mudar Escudo</span>
                          </button>
                          {localTheme.crestUrl && (
                            <button 
                              onClick={extractColors}
                              disabled={isExtracting}
                              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                            >
                              <Pipette size={14} />
                              <span>{isExtracting ? 'Analisando...' : 'Puxar Cores do Escudo'}</span>
                            </button>
                          )}
                       </div>
                    </div>
                    <input type="file" ref={crestInputRef} className="hidden" accept="image/*" onChange={handleCrestUpload} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: localTheme.primary}}></div>
                      <span>Cor Primária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.primary}
                        onChange={(e) => setLocalTheme({...localTheme, primary: e.target.value})}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={localTheme.primary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: localTheme.secondary}}></div>
                      <span>Cor Secundária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.secondary}
                        onChange={(e) => setLocalTheme({...localTheme, secondary: e.target.value})}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={localTheme.secondary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: localTheme.accent}}></div>
                      <span>Cor Terciária (Degradê)</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localTheme.accent}
                        onChange={(e) => setLocalTheme({...localTheme, accent: e.target.value})}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={localTheme.accent.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
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
                className="flex items-center space-x-3 text-white px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: localTheme.primary }}
              >
                <Save size={18} />
                <span>Salvar Identidade</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Preview Dinâmico do Fundo</p>
             
             {/* Preview do Degradê de Fundo */}
             <div 
               className="aspect-[4/5] rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 text-white relative overflow-hidden group border-8 border-white/50"
               style={{ background: `linear-gradient(135deg, ${localTheme.primary} 0%, ${localTheme.accent} 100%)` }}
             >
                <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="w-32 h-32 bg-white/20 backdrop-blur-2xl border-2 border-white/30 rounded-[2.2rem] flex items-center justify-center mb-6 shadow-2xl p-4">
                      {localTheme.crestUrl ? (
                        <img src={localTheme.crestUrl} className="w-full h-full object-contain" alt="Escudo" />
                      ) : (
                        <Shield size={60} className="text-white" />
                      )}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Visual das Views</p>
                   <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight drop-shadow-xl mb-6 px-4">
                     {localTheme.teamName}
                   </h3>

                   {/* Simulação de um card interno */}
                   <div className="w-full glass-card p-6 rounded-3xl text-slate-800 text-left space-y-3">
                      <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                      <div className="h-4 w-full bg-slate-100 rounded-lg"></div>
                      <div className="h-4 w-3/4 bg-slate-100 rounded-lg"></div>
                      <div className="pt-2">
                        <div className="w-full h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                           <span className="text-[9px] font-black text-white uppercase tracking-widest">Botão do Menu</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                   <Sparkles size={20} />
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 uppercase">Fundo Automático</p>
                   <p className="text-[10px] font-medium text-slate-400">O degradê acima será aplicado em todos os menus abertos.</p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all group flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner border border-blue-100">
                  <ImageIcon size={40} />
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">Logo Original (Vetor)</h4>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">IDENTIDADE VISUAL</p>
                <div className="flex w-full space-x-2 mt-auto">
                  <button className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center">
                    <Download size={16} className="mr-2" /> Baixar
                  </button>
                </div>
              </div>

              {localTheme.clubDocuments.map((doc) => {
                const docStyles = getDocColor(doc.type);
                return (
                  <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-inner border ${docStyles}`}>
                      {getDocIcon(doc.type)}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 truncate w-full">{doc.type}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate w-full">REF: {doc.documentNumber}</p>
                    <div className="flex w-full space-x-2 mt-auto">
                      <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
                        <Download size={16} className="mr-2" /> Baixar
                      </button>
                      <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-white transition-all group flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-white text-slate-300 group-hover:text-blue-600 group-hover:scale-110 transition-all rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Adicionar Arquivo</p>
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

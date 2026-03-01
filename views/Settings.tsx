
import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  Gavel,
  FileSignature,
  BookOpen,
  Loader2,
  X,
  Copy,
  ChevronRight
} from 'lucide-react';
import { TeamTheme, DocumentStatus, TeamGender, CategoryTheme } from '../types';
import { generateInstitutionalDocumentAI } from '../services/geminiService';

// Helper function to return appropriate icon based on document type.
const getDocIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('estatuto')) return <Stamp size={40} />;
  if (t.includes('cnpj')) return <FileCheck size={40} />;
  return <FileText size={40} />;
};

// Helper function to return appropriate CSS classes based on document type.
const getDocColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('estatuto')) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (t.includes('cnpj')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
};

interface SettingsProps {
  theme: TeamTheme;
  onThemeChange: (newTheme: TeamTheme) => void;
  currentGender: TeamGender;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, currentGender }) => {
  const [localTheme, setLocalTheme] = React.useState<TeamTheme>(theme);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DOCUMENTS'>('VISUAL');
  const [editingGender, setEditingGender] = useState<TeamGender>(currentGender);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // AI Doc States
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedDocContent, setGeneratedDocContent] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const crestInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar tema local quando o tema pai ou gênero mudar
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleSave = () => {
    onThemeChange(localTheme);
    alert(`Configurações de identidade visual salvas com sucesso para todas as categorias!`);
  };

  const currentCategoryTheme = localTheme.categories[editingGender];

  const handleGenerateAiDoc = async (type: string) => {
    setSelectedDocType(type);
    setIsAiGenerating(true);
    const content = await generateInstitutionalDocumentAI(
      type,
      currentCategoryTheme.teamName,
      "Futebol",
      currentGender
    );
    setGeneratedDocContent(content);
    setIsAiGenerating(false);
  };

  const updateCategoryTheme = (updates: Partial<CategoryTheme>) => {
    setLocalTheme({
      ...localTheme,
      categories: {
        ...localTheme.categories,
        [editingGender]: {
          ...localTheme.categories[editingGender],
          ...updates
        }
      }
    });

    // Injetar variáveis CSS imediatamente para preview no sistema se for o gênero atual
    if (editingGender === currentGender) {
      if (updates.primary) document.documentElement.style.setProperty('--primary-color', updates.primary);
      if (updates.accent) document.documentElement.style.setProperty('--accent-color', updates.accent);
    }
  };

  const extractColors = (imageUrl: string) => {
    setIsExtracting(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
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

      updateCategoryTheme({
        primary,
        secondary,
        accent,
        crestUrl: imageUrl
      });
      
      setIsExtracting(false);
    };
  };

  const handleCrestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Chamar extração automática imediatamente após o upload
        extractColors(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCategoryTheme = () => {
    const defaults: Record<TeamGender, CategoryTheme> = {
      [TeamGender.MALE]: { teamName: 'TeamMaster Pro', primary: '#1e3a8a', secondary: '#0f172a', accent: '#3b82f6', crestUrl: undefined },
      [TeamGender.FEMALE]: { teamName: 'TeamMaster Girls', primary: '#9d174d', secondary: '#4c0519', accent: '#f472b6', crestUrl: undefined },
      [TeamGender.YOUTH]: { teamName: 'TeamMaster Base', primary: '#b45309', secondary: '#451a03', accent: '#fbbf24', crestUrl: undefined },
    };
    updateCategoryTheme(defaults[editingGender]);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações do Clube</h2>
          <p className="text-slate-500 font-medium">Gerencie a identidade visual e documentos institucionais.</p>
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
        <div className="space-y-8">
          {/* Seletor de Categoria para Edição */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Selecione a Categoria para Editar</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(TeamGender).map((g) => (
                <button
                  key={g}
                  onClick={() => setEditingGender(g)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    editingGender === g 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center text-white"
                      style={{ backgroundColor: localTheme.categories[g].primary }}
                    >
                      {localTheme.categories[g].crestUrl ? (
                        <img src={localTheme.categories[g].crestUrl} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Shield size={16} />
                      )}
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight ${editingGender === g ? 'text-blue-700' : 'text-slate-600'}`}>
                      {g}
                    </span>
                  </div>
                  {editingGender === g && <CheckCircle size={18} className="text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
                
                <div className="space-y-4">
                   <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                     <Type size={14} />
                     <span>Nome do Time em {editingGender}</span>
                   </label>
                   <input 
                     type="text"
                     value={currentCategoryTheme.teamName}
                     onChange={(e) => updateCategoryTheme({ teamName: e.target.value })}
                     className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-black text-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                   />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                     <Shield size={14} />
                     <span>Escudo da Categoria: {editingGender}</span>
                   </label>
                   <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100">
                      <div 
                        onClick={() => crestInputRef.current?.click()}
                        className={`w-32 h-32 rounded-[2.2rem] bg-white border-2 border-dashed ${isExtracting ? 'border-blue-500 animate-pulse' : 'border-slate-200'} flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm overflow-hidden group relative`}
                      >
                        {currentCategoryTheme.crestUrl ? (
                          <img src={currentCategoryTheme.crestUrl} className="w-full h-full object-contain p-2" alt="Escudo" />
                        ) : (
                          <>
                            <Camera size={24} className="text-slate-300 mb-1" />
                            <span className="text-[9px] font-black uppercase text-slate-400">Upload {editingGender}</span>
                          </>
                        )}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                         <h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center">
                           <Sparkles size={18} className="text-blue-500 mr-2" />
                           Branding Automático Ativo
                         </h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           Ao carregar o escudo de <strong>{editingGender}</strong>, o sistema atualizará automaticamente as cores primária, secundária e o degradê desta categoria para manter a harmonia visual.
                         </p>
                         <div className="flex gap-3 pt-2">
                            <button 
                              onClick={() => crestInputRef.current?.click()}
                              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-2"
                            >
                              <Upload size={14} />
                              <span>{currentCategoryTheme.crestUrl ? 'Trocar Escudo' : 'Selecionar Escudo'}</span>
                            </button>
                         </div>
                      </div>
                      <input type="file" ref={crestInputRef} className="hidden" accept="image/*" onChange={handleCrestUpload} />
                   </div>
                </div>

              {/* Seletor de Cores Dinâmico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: currentCategoryTheme.primary}}></div>
                      <span>Cor Primária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={currentCategoryTheme.primary}
                        onChange={(e) => updateCategoryTheme({ primary: e.target.value })}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={currentCategoryTheme.primary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: currentCategoryTheme.secondary}}></div>
                      <span>Cor Secundária</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={currentCategoryTheme.secondary}
                        onChange={(e) => updateCategoryTheme({ secondary: e.target.value })}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={currentCategoryTheme.secondary.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: currentCategoryTheme.accent}}></div>
                      <span>Cor Destaque / Fundo</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={currentCategoryTheme.accent}
                        onChange={(e) => updateCategoryTheme({ accent: e.target.value })}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input 
                        type="text"
                        value={currentCategoryTheme.accent.toUpperCase()}
                        readOnly
                        className="flex-1 bg-slate-100/50 border-none rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-slate-600"
                      />
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                onClick={resetCategoryTheme}
                className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl font-bold text-sm transition-all"
              >
                <RefreshCw size={18} />
                <span>Restaurar {editingGender}</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-3 text-white px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: currentCategoryTheme.primary }}
              >
                <Save size={18} />
                <span>Salvar Tudo em {editingGender}</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Preview em Tempo Real ({editingGender})</p>
             
             {/* Preview do Degradê de Fundo Dinâmico */}
             <div 
               className="aspect-[4/5] rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 text-white relative overflow-hidden group border-8 border-white/50"
               style={{ background: `linear-gradient(135deg, ${currentCategoryTheme.primary} 0%, ${currentCategoryTheme.accent} 100%)` }}
             >
                <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="w-32 h-32 bg-white/20 backdrop-blur-2xl border-2 border-white/30 rounded-[2.2rem] flex items-center justify-center mb-6 shadow-2xl p-4 transition-all group-hover:scale-105 duration-500">
                      {currentCategoryTheme.crestUrl ? (
                        <img src={currentCategoryTheme.crestUrl} className="w-full h-full object-contain" alt="Escudo" />
                      ) : (
                        <Shield size={60} className="text-white" />
                      )}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Ambiente {editingGender}</p>
                   <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight drop-shadow-xl mb-6 px-4">
                     {currentCategoryTheme.teamName}
                   </h3>

                   <div className="w-full glass-card p-6 rounded-3xl text-slate-800 text-left space-y-3">
                      <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                      <div className="h-4 w-full bg-slate-100 rounded-lg"></div>
                      <div className="h-4 w-3/4 bg-slate-100 rounded-lg"></div>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                   <Palette size={20} />
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 uppercase">Tema Inteligente</p>
                   <p className="text-[10px] font-medium text-slate-400">Cada categoria preserva sua própria identidade de cores e escudo.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
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

          {/* NOVO: GERADOR DE DOCUMENTOS IA */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 ml-4">
                <Sparkles className="text-blue-500" size={20} />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Smart Doc Architect (Gerador IA)</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AiDocCard 
                  title="Estatuto Social" 
                  icon={<Gavel size={24} />} 
                  description="Regras fundamentais do clube" 
                  onClick={() => handleGenerateAiDoc("Estatuto Social")}
                  isLoading={isAiGenerating && selectedDocType === "Estatuto Social"}
                />
                <AiDocCard 
                  title="Contrato Atleta" 
                  icon={<FileSignature size={24} />} 
                  description="Minuta de vínculo esportivo" 
                  onClick={() => handleGenerateAiDoc("Contrato de Atleta Profissional")}
                  isLoading={isAiGenerating && selectedDocType === "Contrato de Atleta Profissional"}
                />
                <AiDocCard 
                  title="Regimento Interno" 
                  icon={<BookOpen size={24} />} 
                  description="Normas de conduta do CT" 
                  onClick={() => handleGenerateAiDoc("Regimento Interno")}
                  isLoading={isAiGenerating && selectedDocType === "Regimento Interno"}
                />
                <AiDocCard 
                  title="Termo de Imagem" 
                  icon={<Camera size={24} />} 
                  description="Autorização para marketing" 
                  onClick={() => handleGenerateAiDoc("Termo de Uso de Imagem")}
                  isLoading={isAiGenerating && selectedDocType === "Termo de Uso de Imagem"}
                />
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

      {/* MODAL PREVIEW DOCUMENTO IA */}
      {generatedDocContent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Sparkles size={120} /></div>
                 <div className="flex items-center space-x-6 relative z-10">
                    <div className="p-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20"><FileSignature size={32} /></div>
                    <div>
                       <h3 className="text-2xl font-black italic tracking-tighter leading-none">{selectedDocType.toUpperCase()}</h3>
                       <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.3em] mt-2">Minuta gerada com inteligência artificial</p>
                    </div>
                 </div>
                 <button onClick={() => setGeneratedDocContent(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all relative z-10"><X size={20} /></button>
              </div>

              <div className="flex-1 bg-slate-50 p-8 overflow-y-auto custom-scrollbar">
                 <div className="bg-white p-12 rounded-[2rem] shadow-inner border border-slate-200 whitespace-pre-wrap font-serif text-slate-700 leading-relaxed min-h-[500px]">
                    {generatedDocContent}
                 </div>
              </div>

              <div className="p-10 border-t bg-white flex flex-col sm:flex-row gap-4">
                 <button 
                  onClick={() => { navigator.clipboard.writeText(generatedDocContent); alert('Documento copiado!'); }}
                  className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-slate-200 transition-all"
                 >
                    <Copy size={20} />
                    <span>Copiar Texto</span>
                 </button>
                 <button className="flex-1 bg-blue-600 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-xl">
                    <Download size={20} />
                    <span>Exportar para Dossiê</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// COMPLEMENTARY UI COMPONENTS
const AiDocCard = ({ title, icon, description, onClick, isLoading }: { title: string, icon: React.ReactNode, description: string, onClick: () => void, isLoading?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={isLoading}
    className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col relative overflow-hidden active:scale-95 disabled:opacity-80"
  >
     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">{icon}</div>
     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
        {isLoading ? <Loader2 size={24} className="animate-spin" /> : icon}
     </div>
     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h4>
     <p className="text-[9px] font-medium text-slate-400 leading-tight mb-6">{description}</p>
     <div className="mt-auto flex items-center text-[8px] font-black text-blue-600 uppercase tracking-widest">
        <span>{isLoading ? "Consultando Gemini..." : "Gerar com IA"}</span>
        <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
     </div>
  </button>
);

export default Settings;

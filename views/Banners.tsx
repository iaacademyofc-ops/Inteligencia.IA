
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  Shield, 
  ArrowDownToLine, 
  X, 
  Loader2,
  User,
  Zap,
  Target,
  Edit3,
  CheckCircle2,
  Copy,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Match, Player, Modality, TeamTheme, TeamGender } from '../types';
import { generateMatchPreview, generateMatchSummary } from '../services/geminiService';
import { toPng } from 'https://esm.sh/html-to-image';

interface BannersProps {
  matches: Match[];
  players: Player[];
  modality: Modality;
  theme: TeamTheme;
  gender: TeamGender;
}

type BannerLayout = 'SCORER' | 'SCORE_FOCUS' | 'MINIMALIST';

const Banners: React.FC<BannersProps> = ({ matches, players, modality, theme, gender }) => {
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(matches[0] || null);
  const [bannerType, setBannerType] = React.useState<'PREVIEW' | 'RESULT'>('PREVIEW');
  const [activeLayout, setActiveLayout] = useState<BannerLayout>('SCORER');
  const [highlightedPlayerIds, setHighlightedPlayerIds] = useState<string[]>([]);
  
  // IA States
  const [draftText, setDraftText] = useState('');
  const [appliedBannerText, setAppliedBannerText] = useState('');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [loading, setLoading] = React.useState(false);
  
  const [downloading, setDownloading] = React.useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const generateAIText = async () => {
    if (!selectedMatch) return;
    setLoading(true);
    setIsAiPanelOpen(true);
    
    const highlightedPlayersList = players.filter(p => highlightedPlayerIds.includes(p.id));
    
    let text = "";
    if (bannerType === 'PREVIEW') {
      text = await generateMatchPreview(selectedMatch, players, modality, gender, highlightedPlayersList);
    } else {
      text = await generateMatchSummary(selectedMatch, players, modality, gender, highlightedPlayersList);
    }
    
    setDraftText(text);
    setLoading(false);
  };

  const applyToBanner = () => {
    // Extrai uma frase curta para o banner ou usa as primeiras 40 letras
    const shortText = draftText.length > 50 ? draftText.substring(0, 47) + "..." : draftText;
    setAppliedBannerText(shortText);
  };

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        pixelRatio: 4, 
        backgroundColor: theme.secondary,
        style: { borderRadius: '0' }
      });
      const fileName = `banner-${activeLayout.toLowerCase()}-${selectedMatch?.opponent.replace(/\s+/g, '-').toLowerCase() || 'jogo'}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Erro ao gerar arquivo de alta resolução.');
    } finally {
      setDownloading(false);
    }
  };

  const togglePlayerHighlight = (playerId: string) => {
    setHighlightedPlayerIds(prev => {
      if (prev.includes(playerId)) return prev.filter(id => id !== playerId);
      if (prev.length < 3) return [...prev, playerId];
      return prev;
    });
  };

  const topScorer = [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0];
  const highlightedPlayers = players.filter(p => highlightedPlayerIds.includes(p.id));
  const getCrestUrl = (name: string) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffffff,f8fafc&padding=10`;

  const isDark = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 155;
  };

  const textClass = isDark(theme.primary) ? 'text-white' : 'text-slate-900';
  const accentBorderClass = isDark(theme.primary) ? 'border-white/20' : 'border-slate-900/10';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerador de Banners</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Marketing Esportivo & IA</p>
        </div>
        <div className="flex items-center bg-white px-4 py-2 rounded-2xl border shadow-sm space-x-2">
           <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }}></div>
           <span className="text-[10px] font-black uppercase text-slate-600">{theme.teamName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            {/* Opções de Layout */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Escolha o Layout Visual</label>
              <div className="grid grid-cols-3 gap-4">
                {(['SCORER', 'SCORE_FOCUS', 'MINIMALIST'] as const).map((layout) => (
                  <button 
                    key={layout}
                    onClick={() => setActiveLayout(layout)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${activeLayout === layout ? 'border-blue-500 bg-blue-50/50 shadow-lg scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {layout === 'SCORER' && <Target size={24} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'SCORE_FOCUS' && <Zap size={24} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'MINIMALIST' && <Minimize2 size={24} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    <span className={`text-[10px] font-black uppercase mt-2 ${activeLayout === layout ? 'text-blue-600' : 'text-slate-500'}`}>
                      {layout === 'SCORER' ? 'Artilheiro' : layout === 'SCORE_FOCUS' ? 'Placar' : 'Clean'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confronto</label>
                   <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                    value={selectedMatch?.id || ''}
                    onChange={(e) => setSelectedMatch(matches.find(m => m.id === e.target.value) || null)}
                  >
                    {matches.map(m => <option key={m.id} value={m.id}>vs {m.opponent}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Post</label>
                   <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value as any)}
                  >
                    <option value="PREVIEW">Matchday / Pré-jogo</option>
                    <option value="RESULT">Placar / Final</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Destaques (Opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerHighlight(player.id)}
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${highlightedPlayerIds.includes(player.id) ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                    >
                      {player.number}. {player.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={generateAIText}
              disabled={loading || !selectedMatch}
              className="w-full flex items-center justify-center space-x-3 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              <span>{loading ? "Processando Ideias..." : "Co-criar com IA"}</span>
            </button>
          </div>

          {/* ÁREA DE PREVIEW E EDIÇÃO IA (STAGING) */}
          {isAiPanelOpen && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Edit3 size={18} /></div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Editor de Conteúdo IA</h4>
                </div>
                <button onClick={() => setIsAiPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="text-blue-500 animate-spin" />
                  <p className="text-slate-400 font-bold text-xs uppercase animate-pulse">Consultando o Gemini...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <textarea 
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-blue-100 text-sm leading-relaxed font-medium min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500/50 transition-all custom-scrollbar"
                      placeholder="O texto gerado aparecerá aqui para você revisar..."
                    />
                    <div className="absolute top-4 right-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Rascunho</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={applyToBanner}
                      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <CheckCircle2 size={18} />
                      <span>Aplicar no Banner</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(draftText);
                        alert('Legenda copiada para área de transferência!');
                      }}
                      className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                    >
                      <Copy size={18} />
                      <span>Copiar Legenda</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PREVIEW PANEL */}
        <div className="space-y-6">
          <div 
            ref={bannerRef}
            className={`aspect-[4/5] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col ${textClass} p-12 border-[12px] ${accentBorderClass}`}
            style={{ background: `linear-gradient(160deg, ${theme.secondary} 0%, ${theme.primary} 100%)` }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              {activeLayout === 'SCORER' && (
                <>
                  <div className="flex justify-between items-start">
                    <p className="text-2xl font-black italic tracking-tighter">{theme.teamName.toUpperCase()}</p>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                       <Shield size={24} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    {appliedBannerText && (
                      <div className="absolute top-0 w-full text-center">
                        <p className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in">
                          "{appliedBannerText}"
                        </p>
                      </div>
                    )}
                    <div className="w-56 h-56 bg-white/10 border-4 border-white/20 backdrop-blur-md rounded-[3rem] flex items-center justify-center relative shadow-2xl overflow-hidden mt-8">
                       <span className="text-[120px] font-black italic opacity-20">#{(highlightedPlayers[0] || topScorer)?.number}</span>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <User size={120} className="opacity-10" />
                       </div>
                    </div>
                    <div className="mt-8 bg-white px-8 py-3 rounded-2xl shadow-2xl transform -rotate-2">
                       <p className="text-slate-900 font-black text-xl italic whitespace-nowrap">
                         {(highlightedPlayers[0] || topScorer)?.name.toUpperCase() || 'NOME DO ATLETA'}
                       </p>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-4xl font-black italic tracking-tighter">
                      {bannerType === 'RESULT' ? `${selectedMatch?.scoreHome} - ${selectedMatch?.scoreAway}` : 'VS ' + selectedMatch?.opponent.toUpperCase()}
                    </p>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.4em] mt-2">{selectedMatch?.date} • {selectedMatch?.venue.toUpperCase()}</p>
                  </div>
                </>
              )}

              {activeLayout === 'SCORE_FOCUS' && (
                <div className="flex-1 flex flex-col justify-center items-center space-y-12">
                   <div className="flex items-center space-x-8">
                      <div className="w-20 h-20 bg-white rounded-3xl p-4 shadow-xl flex items-center justify-center">
                         <img src={getCrestUrl(selectedMatch?.opponent || 'O')} className="w-full h-full" />
                      </div>
                      <span className="text-4xl font-black italic opacity-50">VS</span>
                      <div className="w-20 h-20 bg-white/10 rounded-3xl p-4 border border-white/20 flex items-center justify-center">
                         <Shield size={40} />
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-center">
                     <div className="text-[140px] font-black italic leading-none tracking-tighter drop-shadow-2xl">
                       {bannerType === 'RESULT' ? (
                         <span className="flex items-center space-x-4">
                           <span>{selectedMatch?.scoreHome}</span>
                           <span className="text-[60px] opacity-30">/</span>
                           <span>{selectedMatch?.scoreAway}</span>
                         </span>
                       ) : '00/00'}
                     </div>
                     {appliedBannerText && (
                       <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] opacity-80 animate-in slide-in-from-bottom-2">
                         {appliedBannerText}
                       </p>
                     )}
                   </div>
                   
                   <div className="text-center">
                      <p className="text-3xl font-black italic tracking-tighter">{selectedMatch?.opponent.toUpperCase()}</p>
                      <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-2">{selectedMatch?.venue}</p>
                   </div>
                </div>
              )}

              {activeLayout === 'MINIMALIST' && (
                <div className="flex-1 flex flex-col border border-white/10 rounded-[3rem] p-12 bg-white/5 backdrop-blur-sm">
                   <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.8em] opacity-40 mb-8 leading-none">Match Report</p>
                      <h3 className="text-5xl font-black italic tracking-tighter mb-4 leading-tight">{theme.teamName.toUpperCase()}</h3>
                      {appliedBannerText && (
                        <p className="text-xs font-medium italic opacity-70 mb-4 max-w-[200px] animate-in fade-in">
                          "{appliedBannerText}"
                        </p>
                      )}
                      <div className="w-12 h-1 bg-white/20 rounded-full mb-4"></div>
                      <h4 className="text-2xl font-light opacity-60 uppercase tracking-widest">{selectedMatch?.opponent}</h4>
                   </div>
                   
                   <div className="flex justify-between items-end border-t border-white/10 pt-8">
                      <div className="text-left">
                        <p className="text-4xl font-black">{bannerType === 'RESULT' ? selectedMatch?.scoreHome + '-' + selectedMatch?.scoreAway : 'PREVIEW'}</p>
                        <p className="text-[10px] font-bold uppercase opacity-40">Status</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black">{selectedMatch?.date}</p>
                        <p className="text-[10px] font-bold uppercase opacity-40">{selectedMatch?.time}</p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-[2.2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-50 group"
          >
            {downloading ? <Loader2 size={24} className="animate-spin" /> : <ArrowDownToLine size={24} className="group-hover:translate-y-1 transition-transform" />}
            <span>{downloading ? "Exportando Arte..." : "Baixar Banner"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banners;

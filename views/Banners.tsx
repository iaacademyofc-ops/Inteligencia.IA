
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Share2, 
  Sparkles, 
  Image as ImageIcon, 
  Trophy, 
  Shield, 
  ArrowDownToLine, 
  Send, 
  Upload, 
  X, 
  Loader2,
  Layout as LayoutIcon,
  Maximize2,
  Minimize2,
  User,
  Zap,
  Target
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
  const [aiText, setAiText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const generateAIText = async () => {
    if (!selectedMatch) return;
    setLoading(true);
    
    const highlightedPlayersList = players.filter(p => highlightedPlayerIds.includes(p.id));
    
    let text = "";
    // Adicionamos contexto do layout para a IA
    const layoutContext = activeLayout === 'SCORER' ? "Foco no desempenho individual" : 
                         activeLayout === 'SCORE_FOCUS' ? "Foco total no resultado e placar" : "Estilo sofisticado e direto";

    if (bannerType === 'PREVIEW') {
      text = await generateMatchPreview(selectedMatch, players, modality, gender, highlightedPlayersList);
    } else {
      text = await generateMatchSummary(selectedMatch, players, modality, gender, highlightedPlayersList);
    }
    
    setAiText(text);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: theme.secondary,
        style: { borderRadius: '0' }
      });
      
      const link = document.createElement('a');
      link.download = `banner-${activeLayout.toLowerCase()}-${selectedMatch?.opponent || 'match'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao baixar banner:', err);
      alert('Erro ao processar imagem de alta fidelidade.');
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
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 155;
  };

  const textClass = isDark(theme.primary) ? 'text-white' : 'text-slate-900';
  const accentBorderClass = isDark(theme.primary) ? 'border-white/20' : 'border-slate-900/10';
  const accentBgClass = isDark(theme.primary) ? 'bg-white/10' : 'bg-slate-900/5';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerador de Banners</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Identidade Visual & Marketing Esportivo</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
           <div className={`w-3 h-3 rounded-full animate-pulse mr-2`} style={{ backgroundColor: theme.primary }}></div>
           <span className="text-[10px] font-black uppercase text-slate-600">{theme.teamName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            {/* Opções de Layout Visual */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Selecione o Estilo da Arte</label>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveLayout('SCORER')}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${activeLayout === 'SCORER' ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <Target size={24} className={activeLayout === 'SCORER' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`text-[10px] font-black uppercase mt-2 ${activeLayout === 'SCORER' ? 'text-blue-600' : 'text-slate-500'}`}>Artilheiro</span>
                </button>
                <button 
                  onClick={() => setActiveLayout('SCORE_FOCUS')}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${activeLayout === 'SCORE_FOCUS' ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <Zap size={24} className={activeLayout === 'SCORE_FOCUS' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`text-[10px] font-black uppercase mt-2 ${activeLayout === 'SCORE_FOCUS' ? 'text-blue-600' : 'text-slate-500'}`}>Placar</span>
                </button>
                <button 
                  onClick={() => setActiveLayout('MINIMALIST')}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${activeLayout === 'MINIMALIST' ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <Minimize2 size={24} className={activeLayout === 'MINIMALIST' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`text-[10px] font-black uppercase mt-2 ${activeLayout === 'MINIMALIST' ? 'text-blue-600' : 'text-slate-500'}`}>Minimalista</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jogo</label>
                   <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                    value={selectedMatch?.id || ''}
                    onChange={(e) => setSelectedMatch(matches.find(m => m.id === e.target.value) || null)}
                  >
                    {matches.map(m => <option key={m.id} value={m.id}>vs {m.opponent}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Finalidade</label>
                   <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value as any)}
                  >
                    <option value="PREVIEW">Chamada de Jogo</option>
                    <option value="RESULT">Resultado Final</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Atletas em Destaque</label>
                <div className="flex flex-wrap gap-2">
                  {players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerHighlight(player.id)}
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${highlightedPlayerIds.includes(player.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 bg-white text-slate-500'}`}
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
              className="w-full flex items-center justify-center space-x-3 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95"
              style={{ backgroundColor: theme.primary }}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              <span>{loading ? "Processando Arte..." : "Gerar Legenda IA"}</span>
            </button>
          </div>

          {aiText && (
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 animate-in slide-in-from-bottom-2">
              <p className="text-sm text-indigo-900 font-bold leading-relaxed italic mb-4">"{aiText}"</p>
              <button 
                onClick={() => navigator.clipboard.writeText(aiText)}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                Copiar Legenda
              </button>
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
                    <div className={`w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center`}>
                       {teamLogo ? <img src={teamLogo} className="w-full h-full object-contain p-2" /> : <Shield size={24} />}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-56 h-56 bg-white/10 border-4 border-white/20 backdrop-blur-md rounded-[3rem] flex items-center justify-center relative shadow-2xl overflow-hidden">
                       <span className="text-[120px] font-black italic opacity-20">#{(highlightedPlayers[0] || topScorer)?.number}</span>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <User size={120} className="opacity-10" />
                       </div>
                    </div>
                    <div className="mt-8 bg-white px-8 py-3 rounded-2xl shadow-2xl transform -rotate-2">
                       <p className="text-slate-900 font-black text-xl italic whitespace-nowrap">
                         {(highlightedPlayers[0] || topScorer)?.name.toUpperCase() || 'PLAYER NAME'}
                       </p>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-4xl font-black italic tracking-tighter">
                      {bannerType === 'RESULT' ? `${selectedMatch?.scoreHome} - ${selectedMatch?.scoreAway}` : 'VS ' + selectedMatch?.opponent.toUpperCase()}
                    </p>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.4em] mt-2">{selectedMatch?.date}</p>
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
                         {teamLogo ? <img src={teamLogo} className="w-full h-full object-contain" /> : <Shield size={40} />}
                      </div>
                   </div>
                   
                   <div className="text-[140px] font-black italic leading-none tracking-tighter drop-shadow-2xl">
                     {bannerType === 'RESULT' ? (
                       <span className="flex items-center space-x-4">
                         <span>{selectedMatch?.scoreHome}</span>
                         <span className="text-[60px] opacity-30">/</span>
                         <span>{selectedMatch?.scoreAway}</span>
                       </span>
                     ) : '00/00'}
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
                      <p className="text-[10px] font-black uppercase tracking-[0.8em] opacity-40 mb-8">Match Report</p>
                      <h3 className="text-5xl font-black italic tracking-tighter mb-4">{theme.teamName.toUpperCase()}</h3>
                      <div className="w-12 h-1 bg-white/20 rounded-full mb-4"></div>
                      <h4 className="text-2xl font-light opacity-60 uppercase tracking-widest">{selectedMatch?.opponent}</h4>
                   </div>
                   
                   <div className="flex justify-between items-end border-t border-white/10 pt-8">
                      <div className="text-left">
                        <p className="text-4xl font-black">{bannerType === 'RESULT' ? selectedMatch?.scoreHome + '-' + selectedMatch?.scoreAway : '0-0'}</p>
                        <p className="text-[10px] font-bold uppercase opacity-40">Final Score</p>
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
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-[2.2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={24} className="animate-spin" /> : <ArrowDownToLine size={24} />}
            <span>{downloading ? "Exportando..." : "Baixar Arte em 4K"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banners;

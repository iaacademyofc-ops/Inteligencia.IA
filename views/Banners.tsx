
import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Sparkles, Image as ImageIcon, Trophy, Shield, Users, ArrowDownToLine, Send, CheckCircle2, UserCircle2, Star, UserCheck, Upload, X, Camera, Share, Loader2 } from 'lucide-react';
import { Match, Player, Modality, TeamTheme } from '../types';
import { generateMatchPreview, generateMatchSummary } from '../services/geminiService';
import { toPng } from 'https://esm.sh/html-to-image';

interface BannersProps {
  matches: Match[];
  players: Player[];
  modality: Modality;
  theme: TeamTheme;
}

const Banners: React.FC<BannersProps> = ({ matches, players, modality, theme }) => {
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(matches[0] || null);
  const [bannerType, setBannerType] = React.useState<'PREVIEW' | 'RESULT'>('PREVIEW');
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
    let text = "";
    
    const customHighlights = players.filter(p => highlightedPlayerIds.includes(p.id));
    const customHighlightsContext = customHighlights.length > 0 
      ? `IMPORTANTE: Destaque especificamente os seguintes jogadores nesta arte: ${customHighlights.map(p => `${p.name} (#${p.number})`).join(', ')}.`
      : "";

    if (bannerType === 'PREVIEW') {
      text = await generateMatchPreview(selectedMatch, players);
      if (customHighlightsContext) text = `${text}\n\nFoco nos atletas: ${customHighlights.map(p => p.name).join(', ')}.`;
    } else {
      text = await generateMatchSummary(selectedMatch, players);
      if (customHighlightsContext) text = `${text}\n\nDestaque individual para: ${customHighlights.map(p => p.name).join(', ')}.`;
    }
    setAiText(text);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    
    setDownloading(true);
    try {
      // Pequeno delay para garantir que imagens foram renderizadas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Alta resolução (aprox 3k-4k dependendo do viewport)
        backgroundColor: theme.secondary,
        style: {
          borderRadius: '0', // Remover bordas arredondadas no download se desejar (opcional)
        }
      });
      
      const link = document.createElement('a');
      link.download = `banner-${bannerType.toLowerCase()}-${selectedMatch?.opponent || 'match'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao baixar banner:', err);
      alert('Não foi possível gerar a imagem em alta resolução. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlayerHighlight = (playerId: string) => {
    setHighlightedPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length < 3) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  useEffect(() => {
    if (selectedMatch) {
      setAiText("");
    }
  }, [selectedMatch, bannerType]);

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
  const dividerClass = isDark(theme.primary) ? 'border-white/10' : 'border-slate-900/10';

  const bannerStyle = {
    background: `linear-gradient(160deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerador de Banners</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Crie artes promocionais com Inteligência Artificial</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl bg-white border shadow-sm flex items-center space-x-2`}>
           <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }}></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{theme.teamName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Configuração de Marca</label>
                <div className="flex items-center justify-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
                      {teamLogo ? (
                        <img src={teamLogo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Shield size={32} className="text-slate-200" />
                      )}
                    </div>
                    {teamLogo && (
                      <button 
                        onClick={() => setTeamLogo(null)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 mb-2">Logo do Clube</p>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                    />
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
                    >
                      <Upload size={14} />
                      <span>{teamLogo ? 'Trocar Logo' : 'Fazer Upload'}</span>
                    </button>
                    <p className="text-[8px] text-slate-400 font-medium mt-2 uppercase tracking-tight">PNG ou SVG transparente recomendado</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">1. Selecionar Partida</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedMatch?.id || ''}
                  onChange={(e) => setSelectedMatch(matches.find(m => m.id === e.target.value) || null)}
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>Confronto vs {m.opponent} ({m.date})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">2. Objetivo da Arte</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setBannerType('PREVIEW')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${bannerType === 'PREVIEW' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Matchday (Pré-Jogo)
                  </button>
                  <button 
                    onClick={() => setBannerType('RESULT')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${bannerType === 'RESULT' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Resultado Final
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  <span>3. Destacar Atletas Específicos (Max 3)</span>
                  <span className={`px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600`}>{highlightedPlayerIds.length} selecionados</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar p-1">
                  {players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerHighlight(player.id)}
                      className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                        highlightedPlayerIds.includes(player.id)
                          ? 'border-slate-900 bg-white shadow-md'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center font-black italic text-sm transition-colors ${
                        highlightedPlayerIds.includes(player.id)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {player.number}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[10px] font-black truncate leading-tight ${highlightedPlayerIds.includes(player.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                          {player.name.split(' ')[0]}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{player.position}</p>
                      </div>
                      {highlightedPlayerIds.includes(player.id) && (
                        <div className="absolute top-1 right-1 text-slate-900">
                          <UserCheck size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={generateAIText}
                  disabled={loading || !selectedMatch}
                  className="w-full flex items-center justify-center space-x-3 text-white py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl active:scale-95 shadow-blue-500/30"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles size={22} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? "IA Processando..." : "Gerar Legenda com IA"}</span>
                </button>
              </div>
            </div>
          </div>

          {aiText && (
            <div className="bg-indigo-50/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-indigo-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Sugestão de Cópia IA</span>
              </div>
              <p className="text-sm text-indigo-900 font-bold leading-relaxed italic border-l-4 border-indigo-200 pl-4 py-2">
                "{aiText}"
              </p>
              <div className="mt-6 flex space-x-2">
                <button 
                  onClick={() => navigator.clipboard.writeText(aiText)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Send size={14} />
                  <span>Copiar Texto</span>
                </button>
                <button className="p-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Banner Preview Section */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
              <ImageIcon size={16} className="mr-3" /> Creative Preview
            </span>
          </div>

          <div 
            ref={bannerRef}
            className={`aspect-[4/5] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col ${textClass} p-12 border-[12px] ${accentBorderClass} group`}
            style={bannerStyle}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-50 leading-none mb-2">Matchday</p>
                  <p className="text-2xl font-black italic tracking-tighter leading-none">{theme.teamName.toUpperCase()}</p>
                </div>
                <div className={`w-12 h-12 ${accentBgClass} backdrop-blur-xl rounded-2xl flex items-center justify-center border ${accentBorderClass} shadow-2xl overflow-hidden`}>
                   {teamLogo ? (
                     <img src={teamLogo} alt="Club Logo" className="w-full h-full object-contain p-2" />
                   ) : (
                     <Shield size={24} className={isDark(theme.primary) ? 'text-white' : 'text-slate-900'} />
                   )}
                </div>
              </div>

              <div className="space-y-8 text-center">
                <div className="flex justify-center items-center space-x-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl p-5 transform -rotate-6 hover:rotate-0 transition-all duration-700 overflow-hidden">
                      {teamLogo ? (
                        <img src={teamLogo} alt="Home Team" className="w-full h-full object-contain" />
                      ) : (
                        <img src={getCrestUrl(theme.teamName)} alt="Home" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {bannerType === 'RESULT' ? (
                      <div className="flex items-center justify-center space-x-6">
                        <span className="text-7xl font-black italic tracking-tighter">{selectedMatch?.scoreHome || 0}</span>
                        <div className={`w-1.5 h-12 ${isDark(theme.primary) ? 'bg-white/20' : 'bg-slate-900/10'} rounded-full`}></div>
                        <span className="text-7xl font-black italic tracking-tighter">{selectedMatch?.scoreAway || 0}</span>
                      </div>
                    ) : (
                      <div className={`${accentBgClass} backdrop-blur-xl border ${accentBorderClass} px-8 py-3 rounded-[1.5rem] transform skew-x-[-15deg] shadow-2xl`}>
                        <span className="text-4xl font-black italic tracking-tighter block transform skew-x-[15deg]">VS</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl p-5 transform rotate-6 hover:rotate-0 transition-all duration-700">
                      <img src={getCrestUrl(selectedMatch?.opponent || 'Opponent')} alt="Away" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-6xl font-black italic tracking-tighter leading-none uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]`}>
                    {selectedMatch?.opponent.split(' ')[0]}
                  </h3>
                  <div className={`flex items-center justify-center space-x-4 text-[12px] font-black uppercase tracking-[0.4em] opacity-60`}>
                    <span className={`${accentBgClass} px-3 py-1 rounded-lg backdrop-blur-md`}>{selectedMatch?.date}</span>
                    <span className={`w-2 h-2 ${isDark(theme.primary) ? 'bg-white/40' : 'bg-slate-900/20'} rounded-full`}></span>
                    <span className={`${accentBgClass} px-3 py-1 rounded-lg backdrop-blur-md`}>{selectedMatch?.venue.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <div className={`space-y-6 pt-8 border-t ${dividerClass}`}>
                <div className="flex items-center justify-center space-x-3">
                  <div className={`h-[1px] w-8 bg-gradient-to-r from-transparent ${isDark(theme.primary) ? 'to-white/30' : 'to-slate-900/20'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.5em] opacity-50`}>Squad Highlights</span>
                  <div className={`h-[1px] w-8 bg-gradient-to-l from-transparent ${isDark(theme.primary) ? 'to-white/30' : 'to-slate-900/20'}`}></div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {highlightedPlayers.length > 0 ? (
                    highlightedPlayers.map(p => (
                      <div key={p.id} className={`${accentBgClass} backdrop-blur-2xl border ${accentBorderClass} pl-4 pr-6 py-3 rounded-2xl flex items-center space-x-4 shadow-2xl hover:scale-105 transition-transform`}>
                        <span className="text-2xl font-black italic leading-none opacity-40 tracking-tighter">#{p.number}</span>
                        <div className="text-left">
                          <p className="text-[12px] font-black uppercase leading-none tracking-tight">{p.name.split(' ')[0]}</p>
                          <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter font-mono leading-none mt-1">{p.position}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center opacity-30 py-4">
                      <Users size={24} className="mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Selecione atletas para destacar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 px-2">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-slate-900/40 hover:-translate-y-1 transition-all active:scale-95 group disabled:opacity-50"
            >
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:animate-bounce transition-all">
                 {downloading ? <Loader2 size={20} className="animate-spin" /> : <ArrowDownToLine size={20} />}
               </div>
               <span>{downloading ? 'Processando...' : 'Baixar Banner'}</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-slate-200 text-slate-900 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 transition-all active:scale-95 group">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                 <Share2 size={20} className="text-slate-600" />
               </div>
               <span>Compartilhar</span>
            </button>
          </div>
          
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-60">
            A arte será exportada em formato PNG de alta resolução
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banners;

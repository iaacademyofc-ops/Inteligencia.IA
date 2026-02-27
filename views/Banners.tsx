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
  CheckCircle2,
  Copy,
  Maximize2,
  Minimize2,
  Layout as LayoutIcon,
  Palette,
  Users2,
  Flame
} from 'lucide-react';
import { Match, Player, Staff, Modality, TeamTheme, TeamGender } from '../types';
import { generateMatchPreview, generateMatchSummary, generateSigningBannerAI, AIResponse } from '../services/geminiService';
import { toPng } from 'html-to-image';

interface BannersProps {
  matches: Match[];
  players: Player[];
  staff: Staff[];
  modality: Modality;
  theme: TeamTheme;
  gender: TeamGender;
}

type BannerLayout = 'SCORER' | 'SCORE_FOCUS' | 'MINIMALIST' | 'SQUAD_LIST' | 'VERSUS_WIDE';
type BannerStyle = 'CLASSIC' | 'NOIR' | 'STREET';

const Banners: React.FC<BannersProps> = ({ matches, players, staff, modality, theme, gender }) => {
  // Fix: Explicitly using React.useState or importing it is required. 
  // Adding 'import React' at the top resolves the UMD global reference error.
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(matches[0] || null);
  const [selectedSigningId, setSelectedSigningId] = React.useState<string>('');
  const [signingType, setSigningType] = React.useState<'Atleta' | 'Comissão'>('Atleta');
  const [bannerType, setBannerType] = React.useState<'PREVIEW' | 'RESULT' | 'SIGNING'>('PREVIEW');
  const [activeLayout, setActiveLayout] = useState<BannerLayout>('SCORER');
  const [activeStyle, setActiveStyle] = useState<BannerStyle>('CLASSIC');
  const [highlightedPlayerIds, setHighlightedPlayerIds] = useState<string[]>([]);
  
  // IA States
  const [aiResult, setAiResult] = useState<AIResponse>({ caption: '', headline: '', slogan: '' });
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
    
    try {
      let result: AIResponse;
      if (bannerType === 'PREVIEW') {
        if (!selectedMatch) return;
        result = await generateMatchPreview(selectedMatch, players, modality, gender, highlightedPlayersList);
      } else if (bannerType === 'RESULT') {
        if (!selectedMatch) return;
        result = await generateMatchSummary(selectedMatch, players, modality, gender, highlightedPlayersList);
      } else {
        const signing = signingType === 'Atleta' 
          ? players.find(p => p.id === selectedSigningId)
          : staff.find(s => s.id === selectedSigningId);
        
        if (!signing) {
          alert("Selecione um membro para o anúncio.");
          setLoading(false);
          return;
        }

        result = await generateSigningBannerAI(
          signing.name,
          signingType === 'Atleta' ? (signing as Player).position : (signing as Staff).role,
          modality,
          gender,
          signingType
        );
      }
      setAiResult(result);
    } catch (err) {
      alert("Erro ao consultar IA. Verifique sua chave.");
    } finally {
      setLoading(false);
    }
  };

  const applyToBanner = () => {
    setAppliedBannerText(aiResult.slogan || aiResult.headline);
  };

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // DO: Access primary/secondary colors from theme.categories[gender]
      // Fixed: Accessing secondary color via category theme
      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        pixelRatio: 4, 
        backgroundColor: activeStyle === 'NOIR' ? '#000000' : theme.categories[gender].secondary,
        style: { borderRadius: '0' }
      });
      const fileName = `banner-${activeLayout.toLowerCase()}-${selectedMatch?.opponent.replace(/\s+/g, '-').toLowerCase() || 'jogo'}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Erro ao gerar arquivo de alta resolution.');
    } finally {
      setDownloading(false);
    }
  };

  const togglePlayerHighlight = (playerId: string) => {
    setHighlightedPlayerIds(prev => {
      if (prev.includes(playerId)) return prev.filter(id => id !== playerId);
      if (prev.length < (activeLayout === 'SQUAD_LIST' ? 6 : 3)) return [...prev, playerId];
      return prev;
    });
  };

  const topScorer = [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0];
  const highlightedPlayers = players.filter(p => highlightedPlayerIds.includes(p.id));
  const getCrestUrl = (name: string) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffffff,f8fafc&padding=10`;

  const getBannerBackground = () => {
    if (activeStyle === 'NOIR') return 'bg-black';
    if (activeStyle === 'STREET') return 'bg-slate-900';
    // Fixed: Accessing primary and secondary colors via category theme
    return `linear-gradient(160deg, ${theme.categories[gender].secondary} 0%, ${theme.categories[gender].primary} 100%)`;
  };

  const getTextStyle = () => {
    if (activeStyle === 'NOIR') return 'text-white';
    if (activeStyle === 'STREET') return 'text-white';
    return 'text-white'; // Classic default
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Estúdio de Design</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Crie artes profissionais em segundos</p>
        </div>
        <div className="flex items-center bg-white px-4 py-2 rounded-2xl border shadow-sm space-x-2">
           <LayoutIcon size={16} className="text-blue-600" />
           <span className="text-[10px] font-black uppercase text-slate-600">Modo Designer Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            {/* Seletor de Estilo Visual */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Direção de Arte (Estilo)</label>
              <div className="grid grid-cols-3 gap-3">
                {(['CLASSIC', 'NOIR', 'STREET'] as const).map((style) => (
                  <button 
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border-2 transition-all ${activeStyle === style ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                  >
                    {style === 'CLASSIC' && <Palette size={16} />}
                    {style === 'NOIR' && <Zap size={16} />}
                    {style === 'STREET' && <Flame size={16} />}
                    <span className="text-[10px] font-black uppercase">{style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Layout Estrutural */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Estrutura (Layout)</label>
              <div className="grid grid-cols-5 gap-2">
                {(['SCORER', 'SCORE_FOCUS', 'MINIMALIST', 'SQUAD_LIST', 'VERSUS_WIDE'] as const).map((layout) => (
                  <button 
                    key={layout}
                    onClick={() => setActiveLayout(layout)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${activeLayout === layout ? 'border-blue-500 bg-blue-50 shadow-sm scale-[1.05]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {layout === 'SCORER' && <Target size={18} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'SCORE_FOCUS' && <Zap size={18} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'MINIMALIST' && <Minimize2 size={18} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'SQUAD_LIST' && <Users2 size={18} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    {layout === 'VERSUS_WIDE' && <Maximize2 size={18} className={activeLayout === layout ? 'text-blue-600' : 'text-slate-400'} />}
                    <span className={`text-[8px] font-black uppercase mt-2 text-center leading-tight ${activeLayout === layout ? 'text-blue-600' : 'text-slate-500'}`}>
                      {layout.replace('_', ' ')}
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
                    <option value="SIGNING">Nova Contratação</option>
                  </select>
                </div>
              </div>

              {bannerType === 'SIGNING' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Membro</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                      value={signingType}
                      onChange={(e) => {
                        setSigningType(e.target.value as any);
                        setSelectedSigningId('');
                      }}
                    >
                      <option value="Atleta">Atleta</option>
                      <option value="Comissão">Comissão Técnica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selecionar Membro</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-bold outline-none cursor-pointer"
                      value={selectedSigningId}
                      onChange={(e) => setSelectedSigningId(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {signingType === 'Atleta' 
                        ? players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                        : staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                      }
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Destaques (Contexto IA)</label>
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
              )}
            </div>

            <button 
              onClick={generateAIText}
              disabled={loading || !selectedMatch}
              className="w-full flex items-center justify-center space-x-3 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: theme.categories[gender].primary }}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              <span>{loading ? "Processando Ideias..." : "Criar Slogan com IA"}</span>
            </button>
          </div>

          {/* PAINEL DE EDIÇÃO IA */}
          {isAiPanelOpen && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 text-blue-400">
                  <Sparkles size={18} />
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Copywriting Esportivo</h4>
                </div>
                <button onClick={() => setIsAiPanelOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Slogan Principal (Headline)</label>
                  <input 
                    type="text" 
                    value={aiResult.headline}
                    onChange={(e) => setAiResult({...aiResult, headline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-blue-100 font-black italic outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={applyToBanner}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                      <CheckCircle2 size={18} />
                      <span>Usar no Banner</span>
                    </button>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(aiResult.caption); alert('Legenda copiada!'); }}
                      className="flex items-center justify-center space-x-2 bg-white/5 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10"
                    >
                      <Copy size={18} />
                      <span>Copiar Legenda</span>
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ÁREA DE PREVIEW DINÂMICO */}
        <div className="space-y-6">
          <div 
            ref={bannerRef}
            className={`aspect-[4/5] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col p-12 border-[12px] border-white/10 ${getTextStyle()}`}
            style={{ background: getBannerBackground() }}
          >
            {/* Texturas Visuais de Estilo */}
            {activeStyle === 'STREET' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-30 mix-blend-overlay"></div>}
            {activeStyle === 'NOIR' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-20 mix-blend-multiply"></div>}
            {activeStyle === 'CLASSIC' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>}
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              
              {/* RENDERIZAÇÃO POR LAYOUT */}
              {bannerType === 'SIGNING' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                  <div className="text-center">
                    <p className="text-sm font-black tracking-[0.5em] opacity-60 mb-2 uppercase">BEM-VINDO AO TIME</p>
                    <h3 className="text-7xl font-black italic tracking-tighter leading-none mb-4">
                      {appliedBannerText || 'NOVO REFORÇO'}
                    </h3>
                  </div>
                  
                  <div className="relative">
                    <div className="w-72 h-72 rounded-[5rem] bg-white/10 border-8 border-white/20 overflow-hidden shadow-2xl relative z-10">
                      {(() => {
                        const signing = signingType === 'Atleta' 
                          ? players.find(p => p.id === selectedSigningId)
                          : staff.find(s => s.id === selectedSigningId);
                        return signing?.photoUrl ? (
                          <img src={signing.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <User size={120} className="opacity-20" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-white text-slate-900 px-8 py-4 rounded-3xl shadow-2xl z-20 transform rotate-3">
                      <p className="font-black text-2xl italic uppercase leading-none">
                        {(() => {
                          const signing = signingType === 'Atleta' 
                            ? players.find(p => p.id === selectedSigningId)
                            : staff.find(s => s.id === selectedSigningId);
                          return signing?.name.split(' ')[0] || 'NOME';
                        })()}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">
                        {(() => {
                          const signing = signingType === 'Atleta' 
                            ? players.find(p => p.id === selectedSigningId)
                            : staff.find(s => s.id === selectedSigningId);
                          return signingType === 'Atleta' ? (signing as Player)?.position : (signing as Staff)?.role;
                        })() || 'POSIÇÃO'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 text-center">
                    <p className="text-xl font-black italic tracking-widest opacity-80">
                      {modality.toUpperCase()} • {gender.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : activeLayout === 'SCORER' && (
                <>
                  <div className="flex justify-between items-start">
                    {/* Fixed: Accessing teamName from theme categories correctly */}
                    <p className="text-2xl font-black italic tracking-tighter">{theme.categories[gender].teamName.toUpperCase()}</p>
                    <Shield size={32} className="opacity-40" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    {appliedBannerText && (
                      <div className="absolute top-0 w-full text-center">
                        <p className={`inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl ${activeStyle === 'STREET' ? 'bg-yellow-50 text-black transform rotate-3' : 'bg-blue-600 text-white'}`}>
                          {appliedBannerText}
                        </p>
                      </div>
                    )}
                    <div className={`w-64 h-64 rounded-[4rem] flex items-center justify-center relative shadow-2xl overflow-hidden mt-8 ${activeStyle === 'NOIR' ? 'bg-white/5 border border-white/10' : 'bg-white/10 border-4 border-white/20'}`}>
                       <span className="text-[140px] font-black italic opacity-20">#{(highlightedPlayers[0] || topScorer)?.number}</span>
                       <div className="absolute inset-0 flex items-center justify-center"><User size={140} className="opacity-10" /></div>
                    </div>
                    <div className={`mt-8 px-8 py-3 rounded-2xl shadow-2xl transform ${activeStyle === 'STREET' ? '-rotate-6 bg-slate-900 border-2 border-white' : 'bg-white'}`}>
                       <p className={`font-black text-xl italic uppercase ${activeStyle === 'STREET' ? 'text-white' : 'text-slate-900'}`}>
                         {(highlightedPlayers[0] || topScorer)?.name || 'DESTAQUE'}
                       </p>
                    </div>
                  </div>
                </>
              )}

              {activeLayout === 'SQUAD_LIST' && (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-5xl font-black italic tracking-tighter leading-none mb-2">LISTA DE CONVOCADOS</h3>
                    <p className="text-xs font-bold opacity-50 uppercase tracking-[0.5em]">{selectedMatch?.opponent.toUpperCase()} • {selectedMatch?.date}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 content-center">
                    {(highlightedPlayers.length > 0 ? highlightedPlayers : players.slice(0, 6)).map((p, i) => (
                      <div key={i} className={`p-4 rounded-3xl flex items-center space-x-3 ${activeStyle === 'NOIR' ? 'bg-white/5' : 'bg-white/10'} border border-white/10`}>
                        <span className="text-2xl font-black italic text-blue-400">#{p.number}</span>
                        <div>
                          <p className="font-black text-xs uppercase truncate max-w-[100px]">{p.name}</p>
                          <p className="text-[8px] font-bold opacity-40 uppercase">{p.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeLayout === 'VERSUS_WIDE' && (
                <div className="flex-1 flex flex-col justify-center items-center">
                   <div className="flex items-center space-x-12 mb-12">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center p-4 border-4 border-white/20">
                          <Shield size={60} />
                        </div>
                        {/* Fixed: Accessing teamName from theme categories correctly */}
                        <p className="mt-4 font-black italic text-sm">{theme.categories[gender].teamName.toUpperCase()}</p>
                      </div>
                      <div className={`text-5xl font-black italic ${activeStyle === 'STREET' ? 'text-yellow-500' : 'opacity-30'}`}>VS</div>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-4 border-4 border-slate-200">
                          <img src={getCrestUrl(selectedMatch?.opponent || 'O')} className="w-full h-full" />
                        </div>
                        <p className="mt-4 font-black italic text-sm">{selectedMatch?.opponent.toUpperCase()}</p>
                      </div>
                   </div>
                   {appliedBannerText && (
                      <p className="text-center text-xl font-black italic tracking-widest bg-white text-slate-900 px-8 py-2 transform skew-x-12">
                        {appliedBannerText}
                      </p>
                   )}
                </div>
              )}

              {activeLayout === 'SCORE_FOCUS' && (
                <div className="flex-1 flex flex-col justify-center items-center space-y-12">
                   <div className="text-[160px] font-black italic leading-none tracking-tighter drop-shadow-2xl">
                       {bannerType === 'RESULT' ? (
                         <span className="flex items-center space-x-4">
                           <span className={activeStyle === 'STREET' ? 'text-yellow-400' : ''}>{selectedMatch?.scoreHome}</span>
                           <span className="text-[60px] opacity-20">X</span>
                           <span>{selectedMatch?.scoreAway}</span>
                         </span>
                       ) : 'MATCH'}
                   </div>
                   <div className="text-center">
                      <p className="text-4xl font-black italic tracking-tighter">{selectedMatch?.opponent.toUpperCase()}</p>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-[0.5em] mt-2">{selectedMatch?.venue}</p>
                   </div>
                </div>
              )}

              {activeLayout === 'MINIMALIST' && (
                <div className="flex-1 flex flex-col border border-white/10 rounded-[3rem] p-12 bg-white/5 backdrop-blur-sm">
                   <div className="flex-1 flex flex-col justify-center items-center text-center">
                      {/* Fixed: Accessing teamName from theme categories correctly */}
                      <h3 className="text-6xl font-black italic tracking-tighter mb-4 leading-none">{theme.categories[gender].teamName.toUpperCase()}</h3>
                      <p className="text-sm font-black italic opacity-50 mb-8 uppercase tracking-widest">VS {selectedMatch?.opponent}</p>
                      {appliedBannerText && <p className="text-sm font-black italic bg-blue-600 px-4 py-1 rounded-full">{appliedBannerText}</p>}
                   </div>
                </div>
              )}

              {/* Rodapé Padrão */}
              <div className="text-center pt-8 border-t border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.4em]">{selectedMatch?.date} • {selectedMatch?.time} • {selectedMatch?.venue.toUpperCase()}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-[2.2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={24} className="animate-spin" /> : <ArrowDownToLine size={24} />}
            <span>{downloading ? "Exportando Arte..." : "Baixar Banner Profissional"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banners;
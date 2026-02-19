
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  ChevronRight, 
  Trophy, 
  FileText, 
  Calendar, 
  LogOut, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Hash, 
  Medal, 
  Star, 
  Plus, 
  X, 
  Upload, 
  Eye, 
  FileUp, 
  Download, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Home,
  MapPin,
  TrendingUp,
  History,
  Shield,
  Sparkles,
  Target,
  Zap,
  LayoutDashboard,
  BrainCircuit,
  Loader2,
  BarChart3,
  Dna,
  Dumbbell,
  Timer,
  Utensils
} from 'lucide-react';
import { Player, Modality, Match, DocumentStatus, TeamDocument, TeamTheme, TeamGender } from '../types';
import { generateAthletePerformanceAI, generateScoutingAI, generateTrainingPlanAI, AthleteFeedback, TrainingPlan } from '../services/geminiService';

interface AthletePortalProps {
  players: Player[];
  matches: Match[];
  onAddDocument: (ownerId: string, ownerType: 'Atleta' | 'Comissão', document: TeamDocument) => void;
  onExit: () => void;
  theme: TeamTheme;
  gender: TeamGender;
}

const DOCUMENT_TYPES = [
  { id: 'RG_CNH', label: 'RG ou CNH', icon: CreditCard },
  { id: 'CPF', label: 'CPF', icon: Fingerprint },
  { id: 'TITULO', label: 'Título de Eleitor', icon: Vote },
  { id: 'RESIDENCIA', label: 'Comprovante de Residência', icon: Home },
];

type PortalTab = 'DASHBOARD' | 'PERFORMANCE' | 'DOCUMENTS';

const AthletePortal: React.FC<AthletePortalProps> = ({ players, matches, onAddDocument, onExit, theme, gender }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loggedPlayer, setLoggedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<PortalTab>('DASHBOARD');

  // IA States
  const [aiFeedback, setAiFeedback] = useState<AthleteFeedback | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [scoutingTip, setScoutingTip] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // UI States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedViewDoc, setSelectedViewDoc] = useState<TeamDocument | null>(null);
  const [formDocType, setFormDocType] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = players.find(p => 
      p.number === parseInt(playerNumber) && 
      p.name.toLowerCase().trim().includes(playerName.toLowerCase().trim())
    );

    if (found) {
      setLoggedPlayer(found);
      setIsLoggedIn(true);
      setError('');
      loadAIInsights(found);
    } else {
      setError('Acesso negado. O número da camisa ou o nome não conferem com nossos registros.');
    }
  };

  const loadAIInsights = async (player: Player) => {
    setIsAiLoading(true);
    try {
      // Paraleliza as chamadas de IA para maior performance
      const [feedback, plan] = await Promise.all([
        generateAthletePerformanceAI(player, Modality.FOOTBALL),
        generateTrainingPlanAI(player)
      ]);
      
      setAiFeedback(feedback);
      setTrainingPlan(plan);
      
      const nextMatch = matches.find(m => !m.isFinished);
      if (nextMatch) {
        const tip = await generateScoutingAI(player, nextMatch.opponent, Modality.FOOTBALL);
        setScoutingTip(tip);
      }
    } catch (err) {
      console.error("Erro IA Portal:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFileName(file.name);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedPlayer || !formDocType || !selectedFileName) return;

    const newDoc: TeamDocument = {
      id: Math.random().toString(36).substr(2, 9),
      type: formDocType,
      status: DocumentStatus.PENDING,
      issueDate: new Date().toISOString().split('T')[0],
      documentNumber: 'AT-' + Math.floor(Math.random() * 10000)
    };

    onAddDocument(loggedPlayer.id, 'Atleta', newDoc);
    setLoggedPlayer({ ...loggedPlayer, documents: [...loggedPlayer.documents, newDoc] });
    setShowUploadModal(false);
    setSelectedFileName(null);
  };

  const currentCategory = theme.categories[gender];

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 sports-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        </div>
        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
           <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-2xl border-4 border-white/20 rounded-[2.5rem] shadow-2xl mb-6 overflow-hidden p-4 group">
                 {currentCategory.crestUrl ? (
                    <img src={currentCategory.crestUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                 ) : (
                    <Shield size={60} className="text-white opacity-40" />
                 )}
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{currentCategory.teamName}</h1>
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Área Exclusiva do Atleta</p>
           </div>

           <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8">
              {error && <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-2xl text-[10px] font-black uppercase text-center animate-pulse">{error}</div>}
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº da Camisa</label>
                    <input 
                      type="number" 
                      value={playerNumber}
                      onChange={(e) => setPlayerNumber(e.target.value)}
                      placeholder="Ex: 10"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-black text-2xl italic focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-700" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                    <input 
                      type="text" 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Como você está inscrito"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-700" 
                    />
                 </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center space-x-3">
                 <span>Autenticar</span>
                 <ArrowRight size={20} />
              </button>
              
              <button type="button" onClick={onExit} className="w-full text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Sair para Gestão Administrativa</button>
           </form>
        </div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(m => !m.isFinished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextMatch = upcomingMatches[0];
  const goalsPerMatch = loggedPlayer && loggedPlayer.stats.matches > 0 
    ? (loggedPlayer.stats.goals / loggedPlayer.stats.matches).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-700">
      {/* Navigation Tab Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-white/10 flex items-center space-x-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
         <button onClick={() => setActiveTab('DASHBOARD')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'DASHBOARD' ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-white'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Início</span>
         </button>
         <button onClick={() => setActiveTab('PERFORMANCE')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'PERFORMANCE' ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-white'}`}>
            <Dumbbell size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Treino</span>
         </button>
         <button onClick={() => setActiveTab('DOCUMENTS')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'DOCUMENTS' ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-white'}`}>
            <FileText size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Dossiê</span>
         </button>
         <div className="w-[1px] h-6 bg-white/10"></div>
         <button onClick={() => setIsLoggedIn(false)} className="flex flex-col items-center space-y-1 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Sair</span>
         </button>
      </div>

      <header className="bg-slate-900 p-8 pt-12 pb-24 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
               <div className="w-40 h-40 rounded-[3.5rem] bg-white/5 border-4 border-white/10 p-1.5 transition-all group-hover:scale-105 duration-500">
                  <div className="w-full h-full rounded-[3.2rem] overflow-hidden bg-slate-800 flex items-center justify-center relative shadow-inner">
                     {loggedPlayer?.photoUrl ? (
                       <img src={loggedPlayer.photoUrl} className="w-full h-full object-cover" />
                     ) : (
                       <User size={64} className="text-slate-600" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  </div>
               </div>
               <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center font-black italic text-2xl border-4 border-slate-900 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
                  {loggedPlayer?.number}
               </div>
            </div>
            <div className="text-center md:text-left space-y-4">
               <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center space-x-2">
                    <Star size={10} className="fill-current" />
                    <span>Jogador Elite</span>
                  </div>
                  <span className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">{currentCategory.teamName}</span>
               </div>
               <h2 className="text-6xl font-black italic tracking-tighter leading-none">{loggedPlayer?.name.toUpperCase()}</h2>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="bg-white/5 border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{loggedPlayer?.position}</span>
                  <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                     <span>Ficha Regular</span>
                  </div>
               </div>
            </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
         {activeTab === 'DASHBOARD' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* IA COACH CARD */}
                 <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-blue-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-blue-600/5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700"><BrainCircuit size={150} /></div>
                    
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center space-x-4">
                             <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-500/20"><Sparkles size={24} /></div>
                             <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Personal Coach AI</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Análise de Performance Gemini</p>
                             </div>
                          </div>
                          {isAiLoading ? (
                             <div className="flex items-center space-x-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Analisando Dados...</span>
                             </div>
                          ) : (
                             <button onClick={() => loadAIInsights(loggedPlayer!)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <Zap size={18} />
                             </button>
                          )}
                       </div>

                       {aiFeedback ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center">
                                     <Dna size={12} className="mr-2" /> Feedback Técnico
                                  </p>
                                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                                     <p className="text-base font-bold text-slate-700 leading-relaxed italic">"{aiFeedback.feedback}"</p>
                                  </div>
                               </div>
                               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foco do Treino</p>
                                  <div className="flex items-center space-x-3">
                                     <Target className="text-blue-600" size={18} />
                                     <p className="text-sm font-black text-slate-900">{aiFeedback.focusPoint}</p>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden group/quote shadow-2xl">
                               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/quote:rotate-12 transition-transform"><Sparkles size={100} /></div>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Mentalidade</p>
                               <p className="text-2xl font-black italic text-white/90 leading-tight">"{aiFeedback.motivationalQuote}"</p>
                               <button 
                                  onClick={() => setActiveTab('PERFORMANCE')}
                                  className="mt-8 flex items-center space-x-2 text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors"
                                >
                                  <span>Ver Detalhes do Treino</span>
                                  <ArrowRight size={14} />
                               </button>
                            </div>
                         </div>
                       ) : (
                         <div className="py-20 flex flex-col items-center justify-center opacity-30">
                            <BrainCircuit size={60} className="mb-4 animate-pulse" />
                            <p className="font-black uppercase tracking-widest text-xs">Aguardando IA...</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* NEXT MATCH CARD */}
                 <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="relative z-10 flex-1 flex flex-col">
                       <div className="flex justify-between items-start mb-10">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
                          <span className="bg-blue-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Agenda</span>
                       </div>
                       
                       {nextMatch ? (
                         <div className="space-y-8">
                            <div>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{nextMatch.venue}</p>
                               <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-none mt-1">vs {nextMatch.opponent}</h4>
                            </div>
                            
                            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-3">
                               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
                                  <Zap size={14} className="mr-2" /> Scouting Tip IA
                               </p>
                               <p className="text-sm font-bold text-white/80 leading-relaxed italic">{scoutingTip || "Analisando fraquezas do adversário..."}</p>
                            </div>
                         </div>
                       ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                            <Shield size={60} className="mb-4" />
                            <p className="font-black uppercase tracking-widest">Nenhum Jogo Marcado</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* STATS VISUAL CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <StatSquare label="Jogos" value={loggedPlayer?.stats.matches} color="bg-blue-600" icon={<Activity size={22} />} />
                 <StatSquare label="Gols" value={loggedPlayer?.stats.goals} color="bg-orange-500" icon={<Trophy size={22} />} />
                 <StatSquare label="Assist." value={loggedPlayer?.stats.assists} color="bg-emerald-500" icon={<Medal size={22} />} />
                 <StatSquare label="Gols/J" value={goalsPerMatch} color="bg-indigo-600" icon={<TrendingUp size={22} />} />
              </div>
           </div>
         )}

         {activeTab === 'PERFORMANCE' && (
           <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* TRAINING PLAN HUB */}
                 <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-12 shadow-xl border border-slate-100 space-y-12">
                    <div className="flex items-center justify-between">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-4">
                          <Dumbbell size={32} className="text-blue-600" />
                          <span>Meu Plano de Evolução IA</span>
                       </h3>
                       {isAiLoading && <Loader2 size={24} className="animate-spin text-blue-600" />}
                    </div>

                    {trainingPlan ? (
                       <div className="space-y-12">
                          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                             <p className="text-lg font-bold text-blue-900 leading-relaxed italic">"{trainingPlan.summary}"</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {trainingPlan.exercises.map((ex, idx) => (
                               <div key={idx} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col space-y-4 group hover:bg-white hover:shadow-xl transition-all">
                                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                     <Timer size={24} />
                                  </div>
                                  <div>
                                     <p className="text-base font-black text-slate-900 uppercase tracking-tight">{ex.task}</p>
                                     <p className="text-xl font-black text-blue-600 italic">{ex.reps}</p>
                                  </div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foco: {ex.focus}</p>
                               </div>
                             ))}
                          </div>

                          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center space-x-8">
                             <div className="p-5 bg-white/10 rounded-2xl text-emerald-400"><Utensils size={32} /></div>
                             <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Nutrição & Recuperação</p>
                                <p className="text-sm font-bold text-white/80">{trainingPlan.nutritionTip}</p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
                          <BrainCircuit size={64} className="mb-6 animate-pulse" />
                          <p className="text-xl font-black uppercase tracking-widest">Gerando Plano Tático Individualizado...</p>
                       </div>
                    )}
                 </div>

                 {/* SEASON PROGRESS CARD */}
                 <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-slate-100 flex flex-col space-y-12">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-4">
                       <BarChart3 size={28} className="text-blue-600" />
                       <span>Metas da Época</span>
                    </h3>
                    
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Gols Temporada</p>
                             <p className="text-xl font-black italic text-slate-900">{loggedPlayer?.stats.goals} / 10</p>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(loggedPlayer?.stats.goals || 0) * 10}%` }}></div>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Assis. Temporada</p>
                             <p className="text-xl font-black italic text-slate-900">{loggedPlayer?.stats.assists} / 5</p>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(loggedPlayer?.stats.assists || 0) * 20}%` }}></div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto p-8 bg-blue-50 rounded-[2rem] border border-blue-100 text-center">
                       <Trophy className="mx-auto text-blue-600 mb-4" size={48} />
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Status Carreira</p>
                       <p className="text-xl font-black italic text-slate-900 uppercase">Atleta de Elite</p>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'DOCUMENTS' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
              <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100">
                 <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-4">
                       <FileText size={32} className="text-blue-600" />
                       <span>Meu Dossiê Digital</span>
                    </h3>
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                       <Upload size={18} />
                       <span>Anexar Novo</span>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loggedPlayer?.documents.map(doc => (
                      <div key={doc.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
                         <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform">
                            <FileText size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                         </div>
                         <h4 className="text-xl font-black text-slate-900 uppercase leading-tight mb-2">{doc.type}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">REG: {doc.documentNumber}</p>
                         
                         <button onClick={() => setSelectedViewDoc(doc)} className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center space-x-2">
                            <Eye size={16} />
                            <span>Abrir Dossiê</span>
                         </button>
                      </div>
                    ))}
                    {loggedPlayer?.documents.length === 0 && (
                      <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                         <FileUp size={64} className="mx-auto text-slate-100 mb-6" />
                         <p className="text-slate-400 font-black uppercase tracking-widest">Seu dossiê está vazio.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
         )}
      </main>

      {/* MODAL UPLOAD DOCUMENTO */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5"><Upload size={100} /></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tighter italic uppercase">Upload Segurado</h3>
                <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.3em] mt-2">Dossiê de Performance</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all relative z-10"><X size={20} /></button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handleUploadSubmit}>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo do Documento</label>
                     <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                      required
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {DOCUMENT_TYPES.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                     </select>
                  </div>
                  
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-16 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${selectedFileName ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'}`}
                  >
                     {selectedFileName ? (
                       <div className="text-center">
                          <CheckCircle2 size={54} className="text-emerald-500 mb-4 mx-auto" />
                          <p className="text-sm font-black text-slate-700 uppercase truncate max-w-[250px]">{selectedFileName}</p>
                       </div>
                     ) : (
                       <div className="text-center">
                          <Upload size={32} className="text-slate-300 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-500">Selecione PDF ou Imagem</p>
                       </div>
                     )}
                  </div>
               </div>
               <button 
                type="submit" 
                disabled={!selectedFileName || !formDocType} 
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
               >
                Enviar para Análise
               </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT LIGHTBOX */}
      {selectedViewDoc && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Eye size={120} /></div>
                 <div className="flex items-center space-x-6 relative z-10">
                    <div className="p-5 bg-blue-600/20 text-blue-400 rounded-2xl border border-white/5"><FileText size={32} /></div>
                    <div>
                       <h3 className="text-2xl font-black italic tracking-tighter leading-none">{selectedViewDoc.type.toUpperCase()}</h3>
                       <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.3em] mt-2">Dossiê do Atleta</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedViewDoc(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all relative z-10"><X size={20} /></button>
              </div>
              
              <div className="flex-1 bg-slate-100 p-12 flex items-center justify-center">
                 <div className="w-full max-w-sm aspect-[1/1.414] bg-white rounded-2xl shadow-2xl border-t-[12px] border-blue-600 p-12 flex flex-col">
                    <div className="flex justify-between items-start mb-14">
                       <ShieldCheck className="text-blue-600" size={48} />
                       <div className="text-right">
                          <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">Documento Digital</p>
                          <p className="text-[8px] font-bold text-slate-200 mt-1">ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                       <div className="h-4 bg-slate-50 rounded-lg w-5/6"></div>
                       <div className="h-20 bg-slate-200/20 rounded-2xl border border-dashed border-slate-200"></div>
                    </div>
                    <div className="mt-auto pt-10 border-t border-slate-100 flex flex-col items-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 font-black mb-4">QR</div>
                       <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em]">Autenticado pelo Portal</p>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t bg-white flex space-x-4">
                 <button className="flex-1 bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-xl">
                    <Download size={20} />
                    <span>Baixar PDF</span>
                 </button>
                 <button onClick={() => setSelectedViewDoc(null)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors">
                    Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// UI REUSABLE COMPONENTS
const StatSquare = ({ label, value, color, icon }: { label: string, value: any, color: string, icon: React.ReactNode }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
     <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
        {icon}
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
     <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{value || 0}</p>
  </div>
);

export default AthletePortal;

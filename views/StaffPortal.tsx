
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard, 
  LogOut, 
  Shield, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Map as MapIcon,
  Circle,
  Activity,
  History,
  Info,
  Clock,
  MapPin,
  Trophy,
  Loader2,
  Plus
} from 'lucide-react';
import { Staff, Player, Match, TeamTheme, TeamGender, Modality } from '../types';
import { generateStaffMotivation, StaffMotivation } from '../services/geminiService';

interface StaffPortalProps {
  staff: Staff[];
  players: Player[];
  matches: Match[];
  onExit: () => void;
  theme: TeamTheme;
  gender: TeamGender;
  modality: Modality;
}

type StaffTab = 'DASHBOARD' | 'TACTICAL' | 'ROSTER' | 'MATCHES';

const StaffPortal: React.FC<StaffPortalProps> = ({ staff, players, matches, onExit, theme, gender, modality }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState<StaffTab>('DASHBOARD');
  
  // IA Motivation State
  const [motivation, setMotivation] = useState<StaffMotivation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleLogin = (s: Staff) => {
    setSelectedStaff(s);
    setIsLoggedIn(true);
    fetchMotivation();
  };

  const fetchMotivation = async () => {
    setIsAiLoading(true);
    const result = await generateStaffMotivation();
    setMotivation(result);
    setIsAiLoading(false);
  };

  const currentCategory = theme.categories[gender];

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a] sports-gradient">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl mb-4 p-4">
              {currentCategory.crestUrl ? (
                <img src={currentCategory.crestUrl} className="w-full h-full object-contain" />
              ) : (
                <Briefcase size={40} className="text-white" />
              )}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{currentCategory.teamName}</h1>
            <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Portal da Comissão Técnica</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-4">
            <p className="text-center text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Selecione seu perfil profissional</p>
            <div className="space-y-3">
              {staff.length > 0 ? staff.map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleLogin(s)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-indigo-600 border border-white/5 rounded-2xl transition-all group"
                >
                  <div className="text-left">
                    <p className="text-white font-bold group-hover:scale-105 transition-transform">{s.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{s.role}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white" />
                </button>
              )) : (
                <div className="text-center py-10">
                  <p className="text-white/40 text-sm italic">Nenhum membro da comissão cadastrado.</p>
                </div>
              )}
            </div>
            <button onClick={onExit} className="w-full pt-4 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Voltar para o Painel Admin</button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(m => !m.isFinished).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = matches.filter(m => m.isFinished).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row animate-in fade-in duration-700">
      <nav className="w-full lg:w-20 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-row lg:flex-col items-center py-4 lg:py-10 px-4 lg:px-0 space-x-6 lg:space-x-0 lg:space-y-10 z-[100] fixed lg:sticky bottom-0 lg:top-0 lg:h-screen shadow-2xl">
         <div className="hidden lg:flex w-12 h-12 bg-indigo-600 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-indigo-600/20 overflow-hidden">
           {currentCategory.crestUrl ? <img src={currentCategory.crestUrl} className="w-full h-full object-contain p-2" /> : <Shield size={24} className="text-white" />}
         </div>
         
         <button onClick={() => setActiveTab('DASHBOARD')} className={`flex flex-col items-center group ${activeTab === 'DASHBOARD' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
            <LayoutDashboard size={24} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-widest mt-1">Início</span>
         </button>
         <button onClick={() => setActiveTab('TACTICAL')} className={`flex flex-col items-center group ${activeTab === 'TACTICAL' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
            <MapIcon size={24} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-widest mt-1">Tática</span>
         </button>
         <button onClick={() => setActiveTab('ROSTER')} className={`flex flex-col items-center group ${activeTab === 'ROSTER' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
            <Users size={24} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-widest mt-1">Elenco</span>
         </button>
         <button onClick={() => setActiveTab('MATCHES')} className={`flex flex-col items-center group ${activeTab === 'MATCHES' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
            <History size={24} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-widest mt-1">Jogos</span>
         </button>
         
         <div className="flex-1 lg:flex hidden"></div>
         
         <button onClick={() => setIsLoggedIn(false)} className="flex flex-col items-center text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={24} />
            <span className="text-[7px] font-black uppercase tracking-widest mt-1">Sair</span>
         </button>
      </nav>

      <main className="flex-1 p-6 lg:p-12 pb-32 lg:pb-12 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
         {activeTab === 'DASHBOARD' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">Comando de Elite</h2>
                    <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-1">{selectedStaff?.name} • {selectedStaff?.role}</p>
                 </div>
                 <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <Activity size={18} className="text-indigo-400" />
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Status Clube</p>
                       <p className="text-xs font-bold text-white mt-1">Alta Performance</p>
                    </div>
                 </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-all duration-700">
                      <Sparkles size={160} />
                    </div>
                    <div className="relative z-10">
                       <div className="flex items-center space-x-3 mb-8">
                          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                            <BookOpen size={24} className="text-white" />
                          </div>
                          <h3 className="text-2xl font-black text-white italic">IA Daily Word</h3>
                          {isAiLoading && <Loader2 size={16} className="animate-spin text-indigo-400" />}
                       </div>

                       {motivation ? (
                         <div className="space-y-8">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative">
                               <p className="text-2xl font-black italic text-white/90 leading-tight">"{motivation.verse}"</p>
                               <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mt-6 flex items-center">
                                 <Shield size={14} className="mr-2" /> {motivation.reference}
                               </p>
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aplicação na Liderança</p>
                               <p className="text-sm font-medium text-slate-300 leading-relaxed">{motivation.application}</p>
                            </div>
                         </div>
                       ) : (
                         <div className="py-20 flex flex-col items-center justify-center opacity-30">
                            <Sparkles size={48} className="mb-4 animate-pulse" />
                            <p className="font-black uppercase tracking-widest text-xs">Consultando mentoria digital...</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-xl">
                       <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center">
                         <TrendingUp size={16} className="mr-2 text-indigo-400" /> Métricas Atuais
                       </h4>
                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase">Atletas Ativos</p>
                                <p className="text-3xl font-black text-white italic">{players.length}</p>
                             </div>
                             <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black">100% OK</div>
                          </div>
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase">Partidas Temporada</p>
                                <p className="text-3xl font-black text-white italic">{matches.length}</p>
                             </div>
                             <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-black">EM DIA</div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-2xl shadow-indigo-600/20 text-white group cursor-pointer hover:bg-indigo-500 transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-white/20 rounded-2xl"><MapIcon size={24} /></div>
                          <ChevronRight size={20} className="text-white/40 group-hover:translate-x-1 transition-transform" />
                       </div>
                       <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Mesa Tática</h4>
                       <p className="text-xs font-medium text-white/60 mt-2">Visualizar formações e posicionamentos de jogo.</p>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'ROSTER' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-500">
              <header>
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Relação Analítica do Elenco</h2>
                 <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-1">Prontuário de Performance e Disponibilidade</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {players.map(p => (
                   <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col space-y-6 group hover:bg-white/10 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.4)] hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 overflow-hidden border-2 border-white/10 group-hover:border-indigo-400/50 transition-colors">
                               {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover" /> : <Users size={24} className="m-auto mt-4 text-white/20" />}
                            </div>
                            <div>
                               <h4 className="text-xl font-black text-white italic tracking-tight">{p.name.toUpperCase()}</h4>
                               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{p.position} • #{p.number}</p>
                            </div>
                         </div>
                         <div className="p-3 bg-green-500/20 rounded-2xl border border-green-500/30 group-hover:bg-green-500/30 transition-all">
                            <Activity size={20} className="text-green-500" />
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                         <SquadStat label="Gols" value={p.stats.goals} />
                         <SquadStat label="Assists" value={p.stats.assists} />
                         <SquadStat label="Jogos" value={p.stats.matches} />
                      </div>

                      <button className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Ver Histórico Clínico</button>
                   </div>
                 ))}
              </div>
           </div>
         )}
      </main>
    </div>
  );
};

const TacticalPlayer = ({ x, y, number, name }: { x: string, y: string, number: number, name: string }) => (
  <div 
    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
    style={{ left: x, top: y }}
  >
     <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-xl border-2 border-white/30 group-hover:scale-125 transition-transform">
        {number}
     </div>
     <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
     </div>
  </div>
);

const SquadStat = ({ label, value }: { label: string, value: any }) => (
  <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5 group-hover:border-white/20 transition-all">
     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
     <p className="text-lg font-black text-white italic mt-1">{value}</p>
  </div>
);

export default StaffPortal;

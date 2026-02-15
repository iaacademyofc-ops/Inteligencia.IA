
import React, { useState } from 'react';
import { 
  User, 
  Lock, 
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
  Star
} from 'lucide-react';
import { Player, Modality, Match, DocumentStatus, Achievement } from '../types';

interface AthletePortalProps {
  players: Player[];
  matches: Match[];
  onExit: () => void;
}

const AthletePortal: React.FC<AthletePortalProps> = ({ players, matches, onExit }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loggedPlayer, setLoggedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = players.find(p => 
      p.number === parseInt(playerNumber) && 
      p.name.toLowerCase().trim() === playerName.toLowerCase().trim()
    );

    if (found) {
      setLoggedPlayer(found);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Acesso negado. O número da camisa ou o nome não conferem com nossos registros.');
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VALID: return <CheckCircle2 className="text-green-500" size={18} />;
      case DocumentStatus.EXPIRED: return <AlertCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-yellow-500" size={18} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 sports-gradient">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/40 mb-4 float-animation">
              <Trophy size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Portal do Atleta</h1>
            <p className="text-slate-400 font-medium">Acesse seu desempenho e dossiê</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="text-center mb-2">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Área de Login Segura</p>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número da Camisa</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-black italic">
                   <Hash size={18} />
                </div>
                <input 
                  type="number" 
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  placeholder="Seu número oficial"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Jogador</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nome completo ou de guerra"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Acessar Portal</span>
              <ArrowRight size={20} />
            </button>

            <button 
              type="button"
              onClick={onExit}
              className="w-full py-4 text-slate-400 font-bold text-sm hover:text-white transition-colors"
            >
              Voltar para Gestão Administrativa
            </button>
          </form>
        </div>
      </div>
    );
  }

  const nextMatch = matches.find(m => !m.isFinished);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Profile */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 border-4 border-white/20 p-1">
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-slate-800 flex items-center justify-center">
                {loggedPlayer?.photoUrl ? (
                  <img src={loggedPlayer.photoUrl} alt={loggedPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={60} className="text-slate-600" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-xl border-4 border-slate-900 shadow-lg">
              {loggedPlayer?.number}
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-black tracking-tight italic">{loggedPlayer?.name.toUpperCase()}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {loggedPlayer?.position}
              </span>
              <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                Status: Ativo
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsLoggedIn(false)}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group"
          >
            <LogOut size={24} className="text-slate-400 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Activity size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partidas</p>
               <p className="text-4xl font-black text-slate-900">{loggedPlayer?.stats.matches}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Trophy size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gols</p>
               <p className="text-4xl font-black text-slate-900">{loggedPlayer?.stats.goals}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assistências</p>
               <p className="text-4xl font-black text-slate-900">{loggedPlayer?.stats.assists}</p>
            </div>
          </div>

          {/* Galeria de Conquistas */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-3">
               <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                 <Trophy size={20} />
               </div>
               <span>Galeria de Conquistas</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {loggedPlayer?.achievements && loggedPlayer.achievements.length > 0 ? (
                 loggedPlayer.achievements.map((ach) => (
                   <div key={ach.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                         <div className={`p-3 rounded-2xl ${ach.type === 'COLLECTIVE' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} transition-transform group-hover:scale-110`}>
                            {ach.type === 'COLLECTIVE' ? <Medal size={24} /> : <Star size={24} />}
                         </div>
                         <span className="text-sm font-black text-slate-400">{ach.year}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{ach.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ach.competition}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                         {ach.type === 'COLLECTIVE' ? 'Conquista Coletiva' : 'Prêmio Individual'}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Nenhuma conquista registrada ainda. Continue treinando forte!
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <Calendar size={120} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
              <Calendar size={20} className="text-blue-600" />
              <span>Próximo Compromisso</span>
            </h3>
            
            {nextMatch ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{nextMatch.type}</p>
                  <p className="text-3xl font-black text-slate-900 italic">vs {nextMatch.opponent.toUpperCase()}</p>
                  <div className="flex items-center space-x-4 mt-4 text-slate-500 font-bold">
                    <span className="flex items-center"><Clock size={16} className="mr-1.5" /> {nextMatch.time}</span>
                    <span className="flex items-center"><Activity size={16} className="mr-1.5" /> {nextMatch.venue}</span>
                  </div>
                </div>
                <div className="bg-slate-50 px-8 py-4 rounded-3xl border text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                  <p className="text-2xl font-black text-slate-900">{new Date(nextMatch.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Nenhum jogo agendado no momento.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
            <FileText size={20} className="text-blue-600" />
            <span>Meus Documentos</span>
          </h3>
          <div className="space-y-4">
            {loggedPlayer?.documents.map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{doc.type}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Venc: {doc.expiryDate || 'N/A'}</p>
                  </div>
                </div>
                {getStatusIcon(doc.status)}
              </div>
            ))}
            {loggedPlayer?.documents.length === 0 && (
              <p className="text-center text-slate-400 text-sm italic py-8">Nenhum documento anexado.</p>
            )}
          </div>
          
          <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Aviso do Clube</p>
            <p className="text-sm font-medium leading-relaxed">
              Mantenha seus documentos sempre atualizados para evitar suspensões em jogos oficiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthletePortal;

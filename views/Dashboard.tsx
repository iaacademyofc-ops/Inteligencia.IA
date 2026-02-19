
import React from 'react';
import { Trophy, Users, Calendar, AlertCircle, TrendingUp, ArrowRight, Star, Shield } from 'lucide-react';
import { Player, Match, MatchType, ViewType, TeamTheme, TeamGender } from '../types';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  onViewChange: (view: ViewType) => void;
  theme: TeamTheme;
  gender: TeamGender;
}

const Dashboard: React.FC<DashboardProps> = ({ players, matches, onViewChange, theme, gender }) => {
  const upcomingMatches = matches.filter(m => !m.isFinished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentResults = matches.filter(m => m.isFinished).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalGoals = players.reduce((acc, p) => acc + p.stats.goals, 0);
  const nextMatch = upcomingMatches[0];
  const currentCategory = theme.categories[gender];

  return (
    <div className="space-y-8">
      {/* Header Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo, Coach!</h2>
          <p className="text-slate-500 font-medium">Você está no comando do <strong className="dynamic-text-primary">{currentCategory.teamName}</strong>.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sistema Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Atletas Ativos" 
          value={players.length} 
          icon={<Users size={24} />} 
          color="blue"
          trend="+2 esta semana"
          onClick={() => onViewChange('PLAYERS')}
        />
        <StatCard 
          title="Gols na Temporada" 
          value={totalGoals} 
          icon={<Trophy size={24} />} 
          color="yellow"
          trend="Média 2.4/jogo"
          onClick={() => onViewChange('STATS')}
        />
        <StatCard 
          title="Partidas Oficiais" 
          value={matches.filter(m => m.type === MatchType.OFFICIAL).length} 
          icon={<Calendar size={24} />} 
          color="green"
          trend="85% aproveitamento"
          onClick={() => onViewChange('MATCHES')}
        />
        <StatCard 
          title="Alertas Docs" 
          value={4} 
          icon={<AlertCircle size={24} />} 
          color="red"
          trend="Ação necessária"
          onClick={() => onViewChange('DOCUMENTS')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Match Hero */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[2rem] shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-950 opacity-90"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-all"></div>
          
          <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full mb-6">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Destaque da Semana</span>
              </div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter mb-4 leading-none">
                {nextMatch ? `VS ${nextMatch.opponent.toUpperCase()}` : 'SEM JOGOS'}
              </h3>
              <div className="space-y-2 text-blue-100/70 mb-8">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{nextMatch?.date || '--/--/--'} às {nextMatch?.time || '--:--'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Star size={16} />
                  <span className="text-sm font-medium">{nextMatch?.venue || 'Local não definido'}</span>
                </div>
              </div>
              <button 
                onClick={() => onViewChange('PLAYERS')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 flex items-center justify-center md:inline-flex space-x-2"
              >
                <span>Preparar Elenco</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center space-y-4">
               <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center float-animation overflow-hidden p-4">
                  {currentCategory.crestUrl ? (
                    <img src={currentCategory.crestUrl} className="w-full h-full object-contain" />
                  ) : (
                    <Shield size={64} className="text-blue-400 opacity-80" />
                  )}
               </div>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Matchday Experience</p>
            </div>
          </div>
        </div>

        {/* Recent Results Slim */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Últimos Resultados</h2>
            <button 
              onClick={() => onViewChange('MATCHES')}
              className="text-blue-600 font-bold text-xs hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            {recentResults.slice(0, 4).map(match => (
              <div 
                key={match.id} 
                onClick={() => onViewChange('MATCHES')}
                className="group p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                      match.scoreHome > match.scoreAway ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {match.scoreHome}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none mb-1">vs {match.opponent}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase">{match.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${match.scoreHome > match.scoreAway ? 'text-green-600' : 'text-slate-400'}`}>
                      {match.scoreAway}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentResults.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <Trophy size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm italic">Nenhum resultado registrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend, onClick }: { title: string, value: number | string, icon: React.ReactNode, color: 'blue' | 'yellow' | 'green' | 'red', trend: string, onClick?: () => void }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="bg-slate-50 px-2 py-1 rounded-lg">
          <TrendingUp size={14} className="text-slate-400" />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
        <p className="text-[10px] font-semibold text-slate-500">{trend}</p>
      </div>
    </button>
  );
};

export default Dashboard;

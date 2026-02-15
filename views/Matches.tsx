
import React from 'react';
import { Calendar, MapPin, Clock, Trophy, Plus, ChevronRight } from 'lucide-react';
import { Match, MatchType } from '../types';

interface MatchesProps {
  matches: Match[];
}

const Matches: React.FC<MatchesProps> = ({ matches }) => {
  const [filter, setFilter] = React.useState<'ALL' | 'OFFICIAL' | 'FRIENDLY'>('ALL');

  const filteredMatches = matches.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'OFFICIAL') return m.type === MatchType.OFFICIAL;
    if (filter === 'FRIENDLY') return m.type === MatchType.FRIENDLY;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Agenda de Jogos</h2>
        <div className="flex space-x-2">
          <div className="flex bg-white border rounded-lg p-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('OFFICIAL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'OFFICIAL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Oficiais
            </button>
            <button 
              onClick={() => setFilter('FRIENDLY')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'FRIENDLY' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Amistosos
            </button>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            <span className="hidden sm:inline">Novo Jogo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  match.type === MatchType.OFFICIAL ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {match.type}
                </span>
                <span className={`text-xs font-semibold ${match.isFinished ? 'text-slate-400' : 'text-blue-600 flex items-center'}`}>
                  {match.isFinished ? 'Finalizado' : <><span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"/>Agendado</>}
                </span>
              </div>

              <div className="text-center py-4">
                <h3 className="text-xl font-bold text-slate-800">Nosso Time</h3>
                <div className="flex items-center justify-center space-x-4 my-2">
                  <span className="text-3xl font-black">{match.isFinished ? match.scoreHome : '-'}</span>
                  <span className="text-slate-300 text-xl font-light">vs</span>
                  <span className="text-3xl font-black">{match.isFinished ? match.scoreAway : '-'}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{match.opponent}</h3>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar size={16} className="mr-2" />
                  {match.date}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock size={16} className="mr-2" />
                  {match.time}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin size={16} className="mr-2" />
                  <span className="truncate">{match.venue}</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2 bg-slate-50 border rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center">
              Detalhes da Partida
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;

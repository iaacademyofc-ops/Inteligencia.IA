
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Trophy, Plus, ChevronRight, X, Shield, Globe, Users, Star, History, Goal, CreditCard, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Match, MatchType, Modality, TeamGender, Player, MatchEvent } from '../types';

interface MatchesProps {
  matches: Match[];
  players: Player[];
  onAddMatch?: (match: Match) => void;
  onUpdateMatch?: (match: Match) => void;
  currentModality: Modality;
  currentGender: TeamGender;
}

const Matches: React.FC<MatchesProps> = ({ matches, players, onAddMatch, onUpdateMatch, currentModality, currentGender }) => {
  const [filter, setFilter] = useState<'ALL' | 'OFFICIAL' | 'FRIENDLY'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSummaryMatch, setSelectedSummaryMatch] = useState<Match | null>(null);

  // Event Form State (inside summary)
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventMinute, setEventMinute] = useState('');
  const [eventType, setEventType] = useState<'GOAL' | 'ASSIST' | 'CARD_YELLOW' | 'CARD_RED'>('GOAL');

  // Add Match Form State
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [matchType, setMatchType] = useState<MatchType>(MatchType.OFFICIAL);

  const filteredMatches = matches.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'OFFICIAL') return m.type === MatchType.OFFICIAL;
    if (filter === 'FRIENDLY') return m.type === MatchType.FRIENDLY;
    return true;
  });

  const handleAddMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMatch) return;

    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      opponent,
      date,
      time,
      venue,
      type: matchType,
      gender: currentGender,
      modality: currentModality,
      scoreHome: 0,
      scoreAway: 0,
      events: [],
      isFinished: false
    };

    onAddMatch(newMatch);
    resetMatchForm();
  };

  const handleAddEvent = () => {
    if (!selectedSummaryMatch || !eventPlayerId || !eventMinute || !onUpdateMatch) return;

    const newEvent: MatchEvent = {
      type: eventType,
      playerId: eventPlayerId,
      minute: parseInt(eventMinute)
    };

    const updatedMatch = {
      ...selectedSummaryMatch,
      events: [...selectedSummaryMatch.events, newEvent],
      scoreHome: eventType === 'GOAL' ? selectedSummaryMatch.scoreHome + 1 : selectedSummaryMatch.scoreHome
    };

    onUpdateMatch(updatedMatch);
    setSelectedSummaryMatch(updatedMatch);
    setEventPlayerId('');
    setEventMinute('');
  };

  const removeEvent = (index: number) => {
    if (!selectedSummaryMatch || !onUpdateMatch) return;
    
    const eventToRemove = selectedSummaryMatch.events[index];
    const updatedEvents = [...selectedSummaryMatch.events];
    updatedEvents.splice(index, 1);

    const updatedMatch = {
      ...selectedSummaryMatch,
      events: updatedEvents,
      scoreHome: eventToRemove.type === 'GOAL' ? selectedSummaryMatch.scoreHome - 1 : selectedSummaryMatch.scoreHome
    };

    onUpdateMatch(updatedMatch);
    setSelectedSummaryMatch(updatedMatch);
  };

  const finalizeMatch = () => {
    if (!selectedSummaryMatch || !onUpdateMatch) return;
    const updatedMatch = { ...selectedSummaryMatch, isFinished: true };
    onUpdateMatch(updatedMatch);
    setSelectedSummaryMatch(updatedMatch);
  };

  const resetMatchForm = () => {
    setOpponent('');
    setDate('');
    setTime('');
    setVenue('');
    setMatchType(MatchType.OFFICIAL);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Agenda de Jogos</h2>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">{currentModality} • {currentGender}</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-white border rounded-xl p-1 shadow-sm">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Todos</button>
            <button onClick={() => setFilter('OFFICIAL')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'OFFICIAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Oficiais</button>
            <button onClick={() => setFilter('FRIENDLY')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'FRIENDLY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Amistosos</button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 font-bold text-sm">
            <Plus size={20} />
            <span>Agendar Jogo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Shield size={100} />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                  match.type === MatchType.OFFICIAL ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {match.type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center ${match.isFinished ? 'text-slate-400' : 'text-blue-600'}`}>
                  {!match.isFinished && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"/>}
                  {match.isFinished ? 'Finalizado' : 'Próxima Partida'}
                </span>
              </div>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-6">
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg">
                         <Shield size={32} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">MEU CLUBE</p>
                   </div>
                   
                   <div className="flex flex-col items-center">
                      <div className="text-4xl font-black italic tracking-tighter flex items-center space-x-2">
                        <span>{match.isFinished || match.events.length > 0 ? match.scoreHome : '-'}</span>
                        <span className="text-slate-200 text-xl font-light not-italic px-1">X</span>
                        <span>{match.isFinished || match.events.length > 0 ? match.scoreAway : '-'}</span>
                      </div>
                   </div>

                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-2 border-2 border-dashed border-slate-200">
                         <Globe size={32} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate w-16 text-center">{match.opponent.split(' ')[0]}</p>
                   </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 italic tracking-tight">{match.opponent.toUpperCase()}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center space-x-3">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-[10px] font-black text-slate-700">{new Date(match.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center space-x-3">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-[10px] font-black text-slate-700">{match.time}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedSummaryMatch(match)}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{match.isFinished ? 'Ver Súmula' : 'Abrir Súmula Digital'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL SÚMULA DIGITAL */}
      {selectedSummaryMatch && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><History size={100} /></div>
               <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight italic">SÚMULA OFICIAL DA PARTIDA</h3>
                    <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.3em]">{selectedSummaryMatch.venue} • {selectedSummaryMatch.date}</p>
                  </div>
                  <button onClick={() => setSelectedSummaryMatch(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={20} /></button>
               </div>

               <div className="mt-10 flex items-center justify-center space-x-12">
                  <div className="text-center">
                    <Shield size={48} className="mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-black italic">MEU CLUBE</p>
                  </div>
                  <div className="text-7xl font-black italic tracking-tighter flex items-center space-x-6">
                    <span className="bg-white/5 px-6 py-2 rounded-3xl border border-white/10">{selectedSummaryMatch.scoreHome}</span>
                    <span className="text-3xl text-slate-500">X</span>
                    <span className="bg-white/5 px-6 py-2 rounded-3xl border border-white/10">{selectedSummaryMatch.scoreAway}</span>
                  </div>
                  <div className="text-center">
                    <Globe size={48} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-sm font-black italic uppercase">{selectedSummaryMatch.opponent}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
               {/* Coluna Eventos */}
               <div className="flex-1 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <History size={16} className="mr-2" />
                    Cronologia de Eventos
                  </h4>
                  <div className="space-y-3">
                    {selectedSummaryMatch.events.length > 0 ? selectedSummaryMatch.events.sort((a,b) => a.minute - b.minute).map((ev, idx) => {
                      const p = players.find(player => player.id === ev.playerId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-black text-blue-600 w-8">{ev.minute}'</span>
                            <div className={`p-2 rounded-lg ${
                              ev.type === 'GOAL' ? 'bg-green-100 text-green-600' : 
                              ev.type === 'CARD_YELLOW' ? 'bg-yellow-100 text-yellow-600' : 
                              'bg-red-100 text-red-600'
                            }`}>
                              {ev.type === 'GOAL' ? <Goal size={16} /> : <CreditCard size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900">{p?.name || 'Visitante'}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{ev.type}</p>
                            </div>
                          </div>
                          {!selectedSummaryMatch.isFinished && (
                            <button onClick={() => removeEvent(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )
                    }) : (
                      <div className="py-10 text-center text-slate-300 italic text-sm">Nenhum evento registrado nesta partida.</div>
                    )}
                  </div>
               </div>

               {/* Coluna Ações (apenas se não finalizado) */}
               {!selectedSummaryMatch.isFinished && (
                 <div className="w-full md:w-80 space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <Plus size={16} className="mr-2" />
                      Registrar Novo Evento
                    </h4>
                    
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Atleta</label>
                          <select 
                            value={eventPlayerId}
                            onChange={(e) => setEventPlayerId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                          >
                             <option value="">Selecione...</option>
                             {players.map(p => <option key={p.id} value={p.id}>{p.number}. {p.name}</option>)}
                          </select>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Minuto</label>
                             <input 
                                type="number" 
                                value={eventMinute}
                                onChange={(e) => setEventMinute(e.target.value)}
                                placeholder="ex: 22"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Evento</label>
                             <select 
                               value={eventType}
                               onChange={(e) => setEventType(e.target.value as any)}
                               className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                             >
                                <option value="GOAL">Gol</option>
                                <option value="ASSIST">Assist.</option>
                                <option value="CARD_YELLOW">Cartão Amarelo</option>
                                <option value="CARD_RED">Cartão Vermelho</option>
                             </select>
                          </div>
                       </div>

                       <button 
                        onClick={handleAddEvent}
                        disabled={!eventPlayerId || !eventMinute}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
                       >
                         Confirmar Evento
                       </button>

                       <div className="pt-6 border-t border-slate-200">
                          <button 
                            onClick={finalizeMatch}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2 group hover:bg-black transition-all"
                          >
                            <CheckCircle size={16} />
                            <span>Encerrar Partida</span>
                          </button>
                          <p className="text-[8px] text-center text-slate-400 mt-2 font-bold uppercase tracking-tighter">Atenção: A finalização é irreversível para fins estatísticos.</p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDAMENTO (Original mantido e corrigido) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={80} /></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight">Novo Agendamento</h3>
                <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.2em]">{currentModality} • {currentGender}</p>
              </div>
              <button onClick={resetMatchForm} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={handleAddMatchSubmit}>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oponente</label>
                     <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input type="text" placeholder="Nome do adversário" value={opponent} onChange={(e) => setOpponent(e.target.value)} required className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local / Estádio</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" placeholder="Onde será o jogo?" value={venue} onChange={(e) => setVenue(e.target.value)} required className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" />
                     </div>
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-3">
                <Star size={18} />
                <span>Salvar Partida</span>
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;

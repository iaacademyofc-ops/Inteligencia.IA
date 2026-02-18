
import React, { useRef, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Camera, 
  User, 
  X, 
  Hash, 
  Calendar, 
  ImagePlus, 
  AlertTriangle, 
  Medal, 
  Trophy, 
  Users, 
  Briefcase,
  Stethoscope,
  HeartPulse,
  ClipboardCheck,
  Award,
  ShieldCheck,
  TrendingUp,
  Percent,
  Activity,
  BellRing,
  Save
} from 'lucide-react';
import { Player, Staff, PlayerPosition, StaffRole, Modality, TeamGender, Achievement, Match } from '../types';

interface RosterProps {
  type: 'PLAYERS' | 'STAFF';
  players: Player[];
  staff: Staff[];
  matches: Match[];
  modality: Modality;
  currentGender: TeamGender;
  onAddPlayer?: (player: Player) => void;
  onAddStaff?: (staff: Staff) => void;
  onDeletePlayer?: (id: string) => void;
  onDeleteStaff?: (id: string) => void;
}

const Roster: React.FC<RosterProps> = ({ 
  type, 
  players, 
  staff, 
  matches,
  modality, 
  currentGender,
  onAddPlayer,
  onAddStaff,
  onDeletePlayer,
  onDeleteStaff
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  // Form States
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formPosition, setFormPosition] = useState<PlayerPosition>(PlayerPosition.GOALKEEPER);
  const [formStaffRole, setFormStaffRole] = useState<StaffRole>(StaffRole.HEAD_COACH);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Partial<Achievement>[]>([]);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchYear, setNewAchYear] = useState(new Date().getFullYear().toString());
  
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Cálculos de Estatísticas Coletivas
  const finishedMatches = matches.filter(m => m.isFinished);
  const totalTeamGoals = players.reduce((acc, p) => acc + p.stats.goals, 0);
  const teamGoalsAverage = finishedMatches.length > 0 ? (totalTeamGoals / finishedMatches.length).toFixed(2) : '0.00';
  
  const teamWins = finishedMatches.filter(m => m.scoreHome > m.scoreAway).length;
  const teamPerformance = finishedMatches.length > 0 ? ((teamWins / finishedMatches.length) * 100).toFixed(0) : '0';

  const nextMatch = matches.find(m => !m.isFinished);

  const list = type === 'PLAYERS' 
    ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemberPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAchievement = () => {
    if (!newAchTitle) return;
    const ach: Partial<Achievement> = {
      id: Math.random().toString(36).substr(2, 9),
      title: newAchTitle,
      year: newAchYear,
      type: 'COLLECTIVE'
    };
    setAchievements([...achievements, ach]);
    setNewAchTitle('');
  };

  const removeAchievement = (id: string) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const resetForm = () => {
    setFormName('');
    setFormNumber('');
    setFormBirthDate('');
    setNewMemberPhoto(null);
    setAchievements([]);
    setShowAddModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const id = Math.random().toString(36).substr(2, 9);

    if (type === 'PLAYERS' && onAddPlayer) {
      const newPlayer: Player = {
        id,
        name: formName,
        number: parseInt(formNumber) || 0,
        position: formPosition,
        birthDate: formBirthDate || new Date().toISOString(),
        gender: currentGender,
        photoUrl: newMemberPhoto || undefined,
        documents: [],
        stats: { goals: 0, assists: 0, matches: 0 },
        achievements: achievements as Achievement[]
      };
      onAddPlayer(newPlayer);
    } else if (type === 'STAFF' && onAddStaff) {
      const newStaff: Staff = {
        id,
        name: formName,
        role: formStaffRole,
        gender: currentGender,
        documents: []
      };
      onAddStaff(newStaff);
    }

    resetForm();
  };

  const getModalityTheme = () => {
    if (type === 'STAFF') {
      return { bg: 'bg-slate-900', text: 'text-white', btn: 'bg-indigo-600', accent: 'bg-indigo-400' };
    }
    switch (modality) {
      case Modality.FUTSAL:
        return { bg: 'bg-slate-900', text: 'text-white', btn: 'bg-slate-900', accent: 'bg-orange-600' };
      case Modality.FUT7:
        return { bg: 'bg-emerald-700', text: 'text-white', btn: 'bg-emerald-600', accent: 'bg-emerald-400' };
      default:
        return { bg: 'bg-white', text: 'text-slate-900', btn: 'bg-blue-600', accent: 'bg-blue-600' };
    }
  };

  const theme = getModalityTheme();

  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case StaffRole.HEAD_COACH: return <Briefcase size={16} />;
      case StaffRole.ASSISTANT_COACH: return <ClipboardCheck size={16} />;
      case StaffRole.PHYSIO: return <HeartPulse size={16} />;
      case StaffRole.DOCTOR: return <Stethoscope size={16} />;
      case StaffRole.MANAGER: return <ShieldCheck size={16} />;
      default: return <User size={16} />;
    }
  };

  const getRoleColor = (role: StaffRole) => {
    switch (role) {
      case StaffRole.HEAD_COACH: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case StaffRole.PHYSIO: return 'bg-rose-100 text-rose-700 border-rose-200';
      case StaffRole.DOCTOR: return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case StaffRole.MANAGER: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPositionOptions = () => {
    if (modality === Modality.FUTSAL) {
      return [PlayerPosition.GOALKEEPER, PlayerPosition.FIXO, PlayerPosition.ALA_D, PlayerPosition.ALA_E, PlayerPosition.PIVO];
    }
    if (modality === Modality.FUT7) {
      return [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER, PlayerPosition.ALA_D, PlayerPosition.ALA_E, PlayerPosition.FORWARD];
    }
    return [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.LATERAL, PlayerPosition.VOLANTE, PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD];
  };

  return (
    <div className="space-y-8">
      {/* Seção de Estatísticas Gerais da Equipe */}
      {type === 'PLAYERS' && list.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Gols / Jogo</p>
              <p className="text-2xl font-black text-slate-900">{teamGoalsAverage}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:border-emerald-200 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Percent size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aproveitamento</p>
              <p className="text-2xl font-black text-slate-900">{teamPerformance}%</p>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-4 group hover:bg-blue-600 transition-all text-white">
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aviso de Próximo Jogo</p>
              <p className="text-sm font-black italic truncate max-w-[150px]">{nextMatch ? `vs ${nextMatch.opponent}` : 'Sem agenda'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{type === 'PLAYERS' ? `Elenco ${currentGender}` : `Corpo Técnico ${currentGender}`}</h2>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{modality} • {list.length} Registros</p>
        </div>
        <div className="flex space-x-2">
          {list.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 outline-none w-64 bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          )}
          <button onClick={() => setShowAddModal(true)} className={`flex items-center space-x-2 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${theme.btn}`}>
            <Plus size={20} />
            <span className="font-bold text-sm">Adicionar {type === 'PLAYERS' ? 'Atleta' : 'Membro'}</span>
          </button>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            <div className={`p-8 ${theme.bg} ${theme.text} relative flex-shrink-0 transition-colors`}>
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"><X size={20} /></button>
              <h3 className="text-2xl font-black tracking-tight">Inserir {type === 'PLAYERS' ? 'Atleta' : 'Profissional'}</h3>
              <p className="text-sm font-medium uppercase tracking-widest opacity-60">{currentGender} • {modality}</p>
            </div>

            <form className="p-8 space-y-6 overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div onClick={() => modalFileInputRef.current?.click()} className="relative group cursor-pointer">
                  <div className="w-28 h-28 rounded-[2.2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {newMemberPhoto ? <img src={newMemberPhoto} className="w-full h-full object-cover" /> : <ImagePlus size={32} className="text-slate-300" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Camera size={14} /></div>
                </div>
                <input type="file" ref={modalFileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foto do Perfil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder=""
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  />
                </div>
                {type === 'PLAYERS' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Camisa</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formNumber}
                        onChange={(e) => setFormNumber(e.target.value)}
                        placeholder=""
                        className="w-full bg-slate-900 text-white border-none rounded-2xl py-4 px-6 text-2xl font-black italic tracking-tighter focus:ring-4 focus:ring-blue-500/30 placeholder:text-slate-700 transition-all" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <Hash size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo Técnico</label>
                    <select 
                      value={formStaffRole}
                      onChange={(e) => setFormStaffRole(e.target.value as StaffRole)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    >
                      {Object.values(StaffRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      value={formBirthDate}
                      onChange={(e) => setFormBirthDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>
                {type === 'PLAYERS' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posição tática</label>
                    <select 
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value as PlayerPosition)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    >
                      {getPositionOptions().map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button type="submit" className={`w-full py-5 rounded-[1.8rem] text-white font-black text-sm uppercase tracking-widest shadow-xl ${theme.btn} transition-all active:scale-95 hover:opacity-95 flex items-center justify-center space-x-3`}>
                  <Save size={18} />
                  <span>Salvar Dados no Elenco</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listagem */}
      <div className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden ${type === 'STAFF' ? 'border-t-4 border-t-indigo-600' : ''}`}>
        {list.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === 'PLAYERS' ? 'Atleta' : 'Profissional'}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === 'PLAYERS' ? 'Nascimento' : 'Especialidade'}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === 'PLAYERS' ? 'Desempenho' : 'Status Docs'}</th>
                {type === 'PLAYERS' && <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Camisa</th>}
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((item) => {
                const p = item as Player;
                const goalsPerMatch = p.stats && p.stats.matches > 0 ? (p.stats.goals / p.stats.matches).toFixed(2) : '0.00';
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 ${type === 'STAFF' ? 'border-indigo-100' : 'border-slate-100'} transition-colors group-hover:border-blue-500`}>
                          {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover" /> : <User size={28} className="m-auto text-slate-300 mt-3" />}
                        </div>
                        <div className="px-4 py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-50 group-hover:to-transparent border border-transparent group-hover:border-blue-100/30">
                          <div className="flex items-center space-x-2">
                            <p className="font-black text-slate-900 text-base group-hover:text-blue-700 transition-colors">{item.name}</p>
                            {type === 'PLAYERS' && nextMatch && (
                               <div className="p-1 bg-blue-100 text-blue-600 rounded-lg animate-pulse" title="Próximo Jogo Agendado">
                                  <BellRing size={12} />
                               </div>
                            )}
                          </div>
                          {type === 'STAFF' ? (
                            <div className={`inline-flex items-center space-x-1.5 mt-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tight ${getRoleColor((item as Staff).role)}`}>
                              {getRoleIcon((item as Staff).role)}
                              <span>{(item as Staff).role}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 mt-1">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.position}</p>
                               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                               <div className="flex items-center space-x-1">
                                  <Trophy size={10} className="text-orange-500" />
                                  <span className="text-[9px] font-black text-slate-500">{p.stats.goals} Gols</span>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       {type === 'STAFF' ? (
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-700">Comissão Técnica</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Depart. Profissional</span>
                         </div>
                       ) : (
                         <span className="text-xs font-bold text-slate-500">
                           {p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR') : '-'}
                         </span>
                       )}
                    </td>
                    <td className="px-8 py-5">
                      {type === 'STAFF' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Documentação OK</span>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-1">
                           <div className="flex items-center space-x-2">
                              <Activity size={14} className="text-blue-500" />
                              <span className="text-xs font-black text-slate-900">{goalsPerMatch} G/J</span>
                           </div>
                           <div className="flex items-center space-x-1">
                              {p.achievements?.slice(0, 2).map((a, i) => (
                                <div key={i} className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 border border-amber-100">
                                  <Award size={12} />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </td>
                    {type === 'PLAYERS' && (
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center justify-center min-w-[3.5rem] px-4 py-2 bg-slate-900 rounded-2xl transform -skew-x-12 shadow-lg border border-slate-700">
                          <span className="font-black italic text-white text-xl tracking-tighter">
                            #{p.number}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button className="p-2.5 bg-white shadow-sm border rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => setDeleteConfirmationId(item.id)} className="p-2.5 bg-white shadow-sm border rounded-xl text-slate-400 hover:text-red-600 hover:border-red-200 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <div className={`w-24 h-24 ${type === 'STAFF' ? 'bg-indigo-50 text-indigo-200' : 'bg-slate-50 text-slate-200'} rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner`}>
              {type === 'STAFF' ? <Briefcase size={48} /> : <Users size={48} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              Base de Dados Vazia
            </h3>
            <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed mb-10">
              Prepare seu elenco para a temporada. Comece inserindo os dados {type === 'PLAYERS' ? 'dos atletas' : 'da comissão'} para gerir estatísticas e documentos.
            </p>
            <button 
              onClick={() => setShowAddModal(true)} 
              className={`flex items-center space-x-3 text-white px-10 py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${theme.btn}`}
            >
              <Plus size={20} />
              <span>Inserir Primeiro {type === 'PLAYERS' ? 'Atleta' : 'Membro'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirmar Exclusão?</h3>
              <div className="flex flex-col space-y-2 pt-4">
                <button 
                  onClick={() => {
                    if (type === 'PLAYERS' && onDeletePlayer) onDeletePlayer(deleteConfirmationId);
                    if (type === 'STAFF' && onDeleteStaff) onDeleteStaff(deleteConfirmationId);
                    setDeleteConfirmationId(null);
                  }} 
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase"
                >
                  Excluir Agora
                </button>
                <button onClick={() => setDeleteConfirmationId(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roster;

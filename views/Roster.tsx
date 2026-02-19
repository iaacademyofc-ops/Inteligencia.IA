
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
  Save,
  Cake,
  Gift,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  Upload,
  UserPlus
} from 'lucide-react';
import { Player, Staff, PlayerPosition, StaffRole, Modality, TeamGender, Achievement, Match } from '../types';
import { generateBirthdayMessageAI } from '../services/geminiService';

interface RosterProps {
  type: 'PLAYERS' | 'STAFF';
  players: Player[];
  staff: Staff[];
  matches: Match[];
  modality: Modality;
  currentGender: TeamGender;
  onAddPlayer?: (player: Player) => void;
  onAddStaff?: (staff: Staff) => void;
  onUpdatePlayer?: (player: Player) => void;
  onUpdateStaff?: (staff: Staff) => void;
  onDeletePlayer?: (id: string) => void;
  onDeleteStaff?: (id: string) => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Roster: React.FC<RosterProps> = ({ 
  type, 
  players, 
  staff, 
  matches,
  modality, 
  currentGender,
  onAddPlayer,
  onAddStaff,
  onUpdatePlayer,
  onUpdateStaff,
  onDeletePlayer,
  onDeleteStaff
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState(new Date().getMonth());
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  // Update Photo State
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  // IA States for Birthdays
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [aiBirthdayMessage, setAiBirthdayMessage] = useState<Record<string, string>>({});

  // Form States
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formPosition, setFormPosition] = useState<PlayerPosition>(PlayerPosition.GOALKEEPER);
  const [formStaffRole, setFormStaffRole] = useState<StaffRole>(StaffRole.HEAD_COACH);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Partial<Achievement>[]>([]);
  
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePhotoClick = (id: string) => {
    setUpdatingItemId(id);
    updateFileInputRef.current?.click();
  };

  const handleUpdatePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && updatingItemId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        if (type === 'PLAYERS' && onUpdatePlayer) {
          const player = players.find(p => p.id === updatingItemId);
          if (player) onUpdatePlayer({ ...player, photoUrl });
        } else if (type === 'STAFF' && onUpdateStaff) {
          const member = staff.find(s => s.id === updatingItemId);
          if (member) onUpdateStaff({ ...member, photoUrl: photoUrl }); 
        }
        setUpdatingItemId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemberPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBirthdayMessage = async (player: Player) => {
    setGeneratingId(player.id);
    const msg = await generateBirthdayMessageAI(player);
    setAiBirthdayMessage(prev => ({ ...prev, [player.id]: msg }));
    setGeneratingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Mensagem copiada para o WhatsApp!");
  };

  const finishedMatches = matches.filter(m => m.isFinished);
  const totalTeamGoals = players.reduce((acc, p) => acc + p.stats.goals, 0);
  const teamGoalsAverage = finishedMatches.length > 0 ? (totalTeamGoals / finishedMatches.length).toFixed(2) : '0.00';
  
  const teamWins = finishedMatches.filter(m => m.scoreHome > m.scoreAway).length;
  const teamPerformance = finishedMatches.length > 0 ? ((teamWins / finishedMatches.length) * 100).toFixed(0) : '0';

  const nextMatch = matches.find(m => !m.isFinished);

  // Fix: Defining birthdayPlayers by filtering the players array based on the selected birthdayMonth
  const birthdayPlayers = players.filter(p => {
    if (!p.birthDate) return false;
    const date = new Date(p.birthDate);
    // Use getUTCMonth() for string-based dates to avoid local timezone offset errors
    return date.getUTCMonth() === birthdayMonth;
  });

  const list = type === 'PLAYERS' 
    ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        photoUrl: newMemberPhoto || undefined,
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
      {/* Hidden input for photo updates */}
      <input 
        type="file" 
        ref={updateFileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleUpdatePhotoFile} 
      />

      {/* Seção de Estatísticas Gerais */}
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
          {type === 'PLAYERS' && (
            <button 
              onClick={() => setShowBirthdayModal(true)}
              className="flex items-center space-x-2 bg-pink-50 text-pink-600 px-5 py-2.5 rounded-xl border border-pink-100 hover:bg-pink-100 transition-all shadow-sm active:scale-95 group"
            >
              <Cake size={18} className="group-hover:animate-bounce" />
              <span className="font-bold text-sm">Aniversariantes</span>
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Pesquisar..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 outline-none w-64 bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowAddModal(true)} className={`flex items-center space-x-2 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${theme.btn}`}>
            <Plus size={20} />
            <span className="font-bold text-sm">Adicionar {type === 'PLAYERS' ? 'Atleta' : 'Membro'}</span>
          </button>
        </div>
      </div>

      {/* LISTAGEM PRINCIPAL */}
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
                        <div className="relative group/photo">
                          <div className={`w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 ${type === 'STAFF' ? 'border-indigo-100' : 'border-slate-100'} transition-colors group-hover:border-blue-500 shadow-inner`}>
                            {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <User size={28} className="m-auto text-slate-300 mt-3" />}
                          </div>
                          <button 
                            onClick={() => handleUpdatePhotoClick(item.id)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center rounded-2xl transition-all text-white scale-90 group-hover/photo:scale-100"
                          >
                            <Camera size={16} />
                          </button>
                        </div>
                        <div>
                           <p className="font-black text-slate-900 text-base">{item.name}</p>
                           {type === 'STAFF' ? (
                             <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tight ${getRoleColor((item as Staff).role)}`}>
                               {getRoleIcon((item as Staff).role)}
                               <span>{(item as Staff).role}</span>
                             </div>
                           ) : (
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.position}</p>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-500">
                         {type === 'PLAYERS' && p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR') : 'Profissional CT'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">Regularizado</span>
                       </div>
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
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 bg-white shadow-sm border rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => onDeletePlayer && onDeletePlayer(item.id)} className="p-2.5 bg-white shadow-sm border rounded-xl text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Users size={48} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Nenhum registro encontrado</h3>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO CORRIGIDO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus size={100} /></div>
                 <div className="flex justify-between items-center relative z-10">
                    <div>
                       <h3 className="text-2xl font-black tracking-tight italic uppercase">Novo Cadastro</h3>
                       <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.3em]">{type === 'PLAYERS' ? 'Atleta Elenco' : 'Comissão Técnica'}</p>
                    </div>
                    <button onClick={resetForm} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 {/* Upload de Foto no Cadastro */}
                 <div className="flex flex-col items-center space-y-4 mb-4">
                    <div 
                      onClick={() => modalFileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all relative overflow-hidden group shadow-inner"
                    >
                       {newMemberPhoto ? (
                         <img src={newMemberPhoto} className="w-full h-full object-cover" />
                       ) : (
                         <Camera size={32} className="text-slate-300 group-hover:scale-110 transition-transform" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={18} className="text-white" />
                       </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</p>
                    <input type="file" ref={modalFileInputRef} className="hidden" accept="image/*" onChange={handleModalPhotoUpload} />
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                       <input 
                         type="text" 
                         required 
                         value={formName}
                         onChange={(e) => setFormName(e.target.value)}
                         placeholder="Ex: João Silva"
                         className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                       />
                    </div>

                    {type === 'PLAYERS' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Camisa</label>
                           <input 
                             type="number" 
                             required 
                             value={formNumber}
                             onChange={(e) => setFormNumber(e.target.value)}
                             placeholder="10"
                             className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10" 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nascimento</label>
                           <input 
                             type="date" 
                             required 
                             value={formBirthDate}
                             onChange={(e) => setFormBirthDate(e.target.value)}
                             className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10" 
                           />
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         {type === 'PLAYERS' ? 'Posição Tática' : 'Função'}
                       </label>
                       <select 
                         className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                         value={type === 'PLAYERS' ? formPosition : formStaffRole}
                         onChange={(e) => type === 'PLAYERS' ? setFormPosition(e.target.value as any) : setFormStaffRole(e.target.value as any)}
                       >
                          {type === 'PLAYERS' 
                            ? getPositionOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)
                            : Object.values(StaffRole).map(role => <option key={role} value={role}>{role}</option>)
                          }
                       </select>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center space-x-3"
                 >
                    <Save size={18} />
                    <span>Finalizar Cadastro</span>
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL RADAR ANIVERSARIANTES (Original preservado) */}
      {showBirthdayModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
              <div className="bg-pink-600 p-8 text-white flex justify-between items-center">
                 <h3 className="text-2xl font-black italic">RADAR ANIVERSARIANTES</h3>
                 <button onClick={() => setShowBirthdayModal(false)} className="p-2 bg-white/10 rounded-xl"><X size={20} /></button>
              </div>
              <div className="p-8 overflow-y-auto">
                 {birthdayPlayers.length > 0 ? birthdayPlayers.map(p => (
                   <div key={p.id} className="p-4 bg-slate-50 rounded-2xl mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm">
                            {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-slate-300" />}
                         </div>
                         <div>
                            <p className="font-black text-slate-900">{p.name}</p>
                            <p className="text-[10px] font-bold text-pink-500 uppercase">{new Date(p.birthDate).toLocaleDateString('pt-BR')}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-slate-900">{new Date().getFullYear() - new Date(p.birthDate).getFullYear()}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase">Anos</p>
                      </div>
                   </div>
                 )) : <p className="text-center py-10 text-slate-400">Nenhum aniversariante.</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Roster;

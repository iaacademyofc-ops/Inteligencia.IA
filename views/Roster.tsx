
import React, { useRef, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, Loader2, User, X, Check, Hash, Calendar, ImagePlus, Fingerprint, AlertTriangle, Medal, Trophy, Star } from 'lucide-react';
import { Player, Staff, PlayerPosition, StaffRole, Modality, TeamGender, Achievement } from '../types';

interface RosterProps {
  type: 'PLAYERS' | 'STAFF';
  players: Player[];
  staff: Staff[];
  modality?: Modality;
  currentGender?: TeamGender;
}

const Roster: React.FC<RosterProps> = ({ type, players, staff, modality, currentGender }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Partial<Achievement>[]>([]);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchYear, setNewAchYear] = useState(new Date().getFullYear().toString());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const list = type === 'PLAYERS' 
    ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (selectedPlayerId) {
          simulateUpload(selectedPlayerId);
        } else {
          setNewMemberPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateUpload = (id: string) => {
    setUploadingId(id);
    setTimeout(() => {
      setUploadingId(null);
      setSelectedPlayerId(null);
    }, 2000);
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

  const getModalityTheme = () => {
    switch (modality) {
      case Modality.FUTSAL:
        return { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900', accent: 'slate-900', btn: 'bg-slate-900' };
      case Modality.FUT7:
        return { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-700', accent: 'emerald-600', btn: 'bg-emerald-600' };
      default:
        return { bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', accent: 'blue-600', btn: 'bg-blue-600' };
    }
  };

  const theme = getModalityTheme();

  const getPositionOptions = () => {
    if (modality === Modality.FUTSAL) {
      return [PlayerPosition.GOALKEEPER, PlayerPosition.FIXO, PlayerPosition.ALA_D, PlayerPosition.ALA_E, PlayerPosition.PIVO];
    }
    if (modality === Modality.FUT7) {
      return [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER, PlayerPosition.ALA_D, PlayerPosition.ALA_E, PlayerPosition.FORWARD];
    }
    return [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.LATERAL, PlayerPosition.VOLANTE, PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD];
  };

  const getModalTitle = () => {
    if (currentGender === TeamGender.YOUTH) return 'do Atleta de Base';
    return currentGender === TeamGender.FEMALE ? 'da Atleta' : 'do Atleta';
  };

  return (
    <div className="space-y-6">
      <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />

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
                <button onClick={() => setDeleteConfirmationId(null)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase">Excluir Agora</button>
                <button onClick={() => setDeleteConfirmationId(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            <div className={`p-8 ${theme.bg} ${theme.text} relative flex-shrink-0 transition-colors`}>
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"><X size={20} /></button>
              <h3 className="text-2xl font-black tracking-tight">Cadastro {getModalTitle()}</h3>
              <p className="text-sm font-medium uppercase tracking-widest opacity-60">{currentGender} • {modality}</p>
            </div>

            <form className="p-8 space-y-6 overflow-y-auto custom-scrollbar" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div onClick={() => modalFileInputRef.current?.click()} className="relative group cursor-pointer">
                  <div className="w-28 h-28 rounded-[2.2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {newMemberPhoto ? <img src={newMemberPhoto} className="w-full h-full object-cover" /> : <ImagePlus size={32} className="text-slate-300" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Camera size={14} /></div>
                </div>
                <input type="file" ref={modalFileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Camisa</label>
                  <input type="number" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posição</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20">
                  {getPositionOptions().map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Seção de Títulos - NOVA */}
              {type === 'PLAYERS' && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Medal size={14} />
                    <span>Informar Títulos e Conquistas</span>
                  </label>
                  
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={newAchTitle} 
                      onChange={(e) => setNewAchTitle(e.target.value)}
                      placeholder="Ex: Campeão Regional" 
                      className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-700"
                    />
                    <input 
                      type="number" 
                      value={newAchYear} 
                      onChange={(e) => setNewAchYear(e.target.value)}
                      className="w-20 bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-700"
                    />
                    <button 
                      onClick={addAchievement}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-2 group">
                        <Trophy size={12} />
                        <span>{ach.title} ({ach.year})</span>
                        <button onClick={() => removeAchievement(ach.id!)} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <p className="text-[10px] text-slate-300 italic">Nenhum título informado ainda.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button onClick={() => setShowAddModal(false)} className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl ${theme.btn} transition-colors`}>
                  Finalizar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header e Listagem */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{type === 'PLAYERS' ? `Elenco ${currentGender}` : `Corpo Técnico ${currentGender}`}</h2>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{modality} • {list.length} Registros</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Pesquisar..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 outline-none w-64 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowAddModal(true)} className={`flex items-center space-x-2 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg ${theme.btn}`}>
            <Plus size={20} />
            <span className="font-bold text-sm">Adicionar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Atleta</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Títulos</th>
              {type === 'PLAYERS' && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Camisa</th>}
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border">
                      {(item as Player).photoUrl ? <img src={(item as Player).photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="m-auto text-slate-300 mt-2" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{(item as Player).position || (item as Staff).role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    {(item as Player).achievements?.slice(0, 2).map((a, i) => (
                      <Trophy key={i} size={14} className="text-yellow-500" />
                    ))}
                    {((item as Player).achievements?.length || 0) > 2 && (
                      <span className="text-[10px] font-bold text-slate-400">+{((item as Player).achievements?.length || 0) - 2}</span>
                    )}
                    {((item as Player).achievements?.length || 0) === 0 && (
                      <span className="text-[10px] text-slate-300">-</span>
                    )}
                  </div>
                </td>
                {type === 'PLAYERS' && (
                  <td className="px-6 py-4">
                    <span className="font-black italic text-slate-900">#{(item as Player).number}</span>
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                    <button onClick={() => setDeleteConfirmationId(item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roster;

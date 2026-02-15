
import React, { useState } from 'react';
import { Hash, Search, Filter, ArrowUpDown, User, Edit3, Save, X } from 'lucide-react';
import { Player, Modality } from '../types';

interface OfficialNumbersProps {
  players: Player[];
  modality: Modality;
}

const OfficialNumbers: React.FC<OfficialNumbersProps> = ({ players, modality }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNumber, setTempNumber] = useState<string>('');

  const filteredPlayers = [...players]
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.number - b.number);

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setTempNumber(player.number.toString());
  };

  const handleSave = () => {
    // In a real app, this would call an API or update global state
    console.log(`Saving number ${tempNumber} for player ${editingId}`);
    setEditingId(null);
  };

  const accentColor = modality === Modality.FUTSAL ? 'orange' : 'blue';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Hash className={`text-${accentColor}-600`} size={24} />
            <span>Numeração Oficial</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
            Gestão de dorsais do elenco - {modality}
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlayers.map(player => (
          <div 
            key={player.id} 
            className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Jersey Number Background Decor */}
            <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-black italic">{player.number}</span>
            </div>

            <div className="relative mb-4">
              <div className={`w-24 h-24 rounded-full p-1 border-2 border-${accentColor}-100 group-hover:border-${accentColor}-500 transition-colors`}>
                <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-300" />
                  )}
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="text-white text-xl font-black italic">{player.number}</span>
              </div>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1 truncate w-full px-2">
              {player.name}
            </h3>
            <p className={`text-[10px] font-black uppercase tracking-widest text-${accentColor}-600 mb-6`}>
              {player.position}
            </p>

            {editingId === player.id ? (
              <div className="flex items-center space-x-2 w-full animate-in slide-in-from-bottom-2">
                <input 
                  type="number" 
                  value={tempNumber}
                  onChange={(e) => setTempNumber(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-black focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <button 
                  onClick={handleSave}
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-colors"
                >
                  <Save size={18} />
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleEdit(player)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all group-hover:bg-slate-900 group-hover:text-white"
              >
                <Edit3 size={14} />
                <span>Alterar Número</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="bg-white rounded-3xl p-20 border border-dashed border-slate-200 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Nenhum atleta encontrado</h3>
          <p className="text-slate-500">Tente ajustar seus termos de busca.</p>
        </div>
      )}
    </div>
  );
};

export default OfficialNumbers;


import React, { useState, useRef } from 'react';
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
  History
} from 'lucide-react';
import { Player, Modality, Match, DocumentStatus, TeamDocument } from '../types';

interface AthletePortalProps {
  players: Player[];
  matches: Match[];
  onAddDocument: (ownerId: string, ownerType: 'Atleta' | 'Comissão', document: TeamDocument) => void;
  onExit: () => void;
}

const DOCUMENT_TYPES = [
  { id: 'RG_CNH', label: 'RG ou CNH', icon: CreditCard },
  { id: 'CPF', label: 'CPF', icon: Fingerprint },
  { id: 'TITULO', label: 'Título de Eleitor', icon: Vote },
  { id: 'RESIDENCIA', label: 'Comprovante de Residência', icon: Home },
];

const AthletePortal: React.FC<AthletePortalProps> = ({ players, matches, onAddDocument, onExit }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loggedPlayer, setLoggedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
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
    
    // Atualiza localmente o objeto do jogador para refletir na UI do portal imediatamente
    setLoggedPlayer({
      ...loggedPlayer,
      documents: [...loggedPlayer.documents, newDoc]
    });

    setShowUploadModal(false);
    setSelectedFileName(null);
    setFormDocType('');
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

  const upcomingMatches = matches.filter(m => !m.isFinished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const goalsPerMatch = loggedPlayer && loggedPlayer.stats.matches > 0 
    ? (loggedPlayer.stats.goals / loggedPlayer.stats.matches).toFixed(2) 
    : '0.00';

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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Dossiê do Atleta 2024</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partidas</p>
               <p className="text-3xl font-black text-slate-900">{loggedPlayer?.stats.matches}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-orange-200 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gols Totais</p>
               <p className="text-3xl font-black text-slate-900">{loggedPlayer?.stats.goals}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-200 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assistências</p>
               <p className="text-3xl font-black text-slate-900">{loggedPlayer?.stats.assists}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center group hover:bg-blue-600 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4">
                  <TrendingUp size={24} />
               </div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Gols / Jogo</p>
               <p className="text-3xl font-black text-white italic">{goalsPerMatch}</p>
            </div>
          </div>

          {/* Aviso de Jogos */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Calendar size={140} />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                   <Calendar size={20} />
                 </div>
                 <span>Próximos Confrontos</span>
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{upcomingMatches.length} JOGOS AGENDADOS</span>
            </div>

            <div className="space-y-4 relative z-10">
               {upcomingMatches.length > 0 ? upcomingMatches.slice(0, 2).map((match) => (
                 <div key={match.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-6">
                       <div className="text-center">
                          <p className="text-xs font-black text-blue-600 uppercase">{new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-lg font-black text-slate-900">{match.time}</p>
                       </div>
                       <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ADVERSÁRIO</p>
                          <h4 className="text-xl font-black text-slate-900 italic uppercase">vs {match.opponent}</h4>
                       </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                       <div className="flex items-center space-x-2 text-slate-500 mb-1">
                          <MapPin size={14} />
                          <span className="text-xs font-bold">{match.venue}</span>
                       </div>
                       <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">PARTIDA {match.type.toUpperCase()}</span>
                    </div>
                 </div>
               )) : (
                 <div className="py-10 text-center text-slate-400 italic">Sem jogos agendados no momento.</div>
               )}
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
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Nenhuma conquista registrada ainda. Continue treinando forte!
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <FileText size={20} className="text-blue-600" />
                <span>Meus Documentos</span>
              </h3>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {loggedPlayer?.documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{doc.type}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">{doc.documentNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedViewDoc(doc)}
                      className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    {getStatusIcon(doc.status)}
                  </div>
                </div>
              ))}
              {loggedPlayer?.documents.length === 0 && (
                <div className="text-center py-8">
                  <FileUp size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-xs italic">Nenhum documento enviado.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
            <ShieldCheck size={32} className="mb-4 text-blue-200" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Dossiê Seguro</p>
            <p className="text-sm font-medium leading-relaxed">
              Seus documentos são criptografados e acessíveis apenas pela secretaria do clube.
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center">
             <History size={32} className="mx-auto text-slate-200 mb-4" />
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Resumo da Temporada</h4>
             <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-bold uppercase">Gols p/ Mês</span>
                   <span className="text-slate-900 font-black">2.4</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-bold uppercase">Eficiência</span>
                   <span className="text-emerald-600 font-black">78%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* MODAL UPLOAD DOCUMENTO */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Enviar Documento</h3>
                <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Atualização de Dossiê</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X size={20} /></button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={handleUploadSubmit}>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                     <select 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" 
                      required
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {DOCUMENT_TYPES.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                     </select>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*,.pdf"
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFileName ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                     {selectedFileName ? (
                       <div className="text-center">
                          <CheckCircle2 size={40} className="text-blue-600 mb-2 mx-auto" />
                          <p className="text-xs font-black text-slate-700 uppercase tracking-widest truncate max-w-[200px]">{selectedFileName}</p>
                       </div>
                     ) : (
                       <>
                          <Upload size={40} className="text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-500">Clique para selecionar arquivo</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">PDF ou Imagem</p>
                       </>
                     )}
                  </div>
               </div>
               <button 
                type="submit"
                disabled={!selectedFileName || !formDocType}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
               >
                Enviar Documento
               </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX VISUALIZAÇÃO */}
      {selectedViewDoc && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl"><FileText size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black">{selectedViewDoc.type}</h3>
                       <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">REF: {selectedViewDoc.documentNumber}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedViewDoc(null)} className="p-2 bg-white/5 rounded-2xl hover:bg-white/10"><X size={20} /></button>
              </div>
              
              <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center">
                 {/* Simulação de visualização de documento */}
                 <div className="w-full max-w-sm aspect-[1/1.4] bg-white rounded-xl shadow-2xl border-t-[10px] border-blue-600 p-10 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={80} /></div>
                    <div className="flex justify-between items-start mb-10">
                       <ShieldCheck className="text-blue-600" size={32} />
                       <p className="text-[10px] font-black uppercase text-slate-300">Cópia Digital Oficial</p>
                    </div>
                    <div className="space-y-6 flex-1">
                       <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                       <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                       <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="h-20 bg-slate-50 rounded-lg"></div>
                          <div className="h-20 bg-slate-50 rounded-lg"></div>
                       </div>
                       <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                       <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                    </div>
                    <div className="mt-10 pt-10 border-t border-slate-100 flex flex-col items-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 mb-2">QR</div>
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Autenticação Sistêmica</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t bg-white flex space-x-4">
                 <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all">
                    <Download size={18} />
                    <span>Baixar Arquivo</span>
                 </button>
                 <button onClick={() => setSelectedViewDoc(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                    Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AthletePortal;

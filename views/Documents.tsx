
import React, { useState, useRef } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  X, 
  Eye, 
  Download,
  Plus,
  Fingerprint,
  Home,
  ClipboardList,
  CreditCard,
  Vote,
  FileUp,
  Hash,
  CalendarDays,
  ExternalLink,
  Check
} from 'lucide-react';
import { Player, Staff, TeamDocument, DocumentStatus } from '../types';

interface DocumentsProps {
  players: Player[];
  staff: Staff[];
}

interface FlattenedDocument extends TeamDocument {
  ownerName: string;
  ownerType: 'Atleta' | 'Comissão';
}

const DOCUMENT_TYPES = [
  { id: 'TITULO', label: 'Título de Eleitor', icon: Vote, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'RG_CNH', label: 'RG ou CNH', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'CPF', label: 'CPF', icon: Fingerprint, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'FICHA', label: 'Ficha de Atleta', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'RESIDENCIA', label: 'Comprovante de Residência', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const Documents: React.FC<DocumentsProps> = ({ players, staff }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | DocumentStatus>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<FlattenedDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [preselectedType, setPreselectedType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allDocuments: FlattenedDocument[] = [
    ...players.flatMap(p => p.documents.map(d => ({ ...d, ownerName: p.name, ownerType: 'Atleta' as const }))),
    ...staff.flatMap(s => s.documents.map(d => ({ ...d, ownerName: s.name, ownerType: 'Comissão' as const })))
  ];

  const filteredDocs = allDocuments.filter(doc => {
    const matchesSearch = doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VALID:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={12} className="mr-1.5" /> Válido</span>;
      case DocumentStatus.PENDING:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock size={12} className="mr-1.5" /> Pendente</span>;
      case DocumentStatus.EXPIRED:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle size={12} className="mr-1.5" /> Expirado</span>;
      default: return null;
    }
  };

  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Central de Documentos</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Dossiê e Auditoria Digital</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 border rounded-xl outline-none w-64 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Novo</span>
          </button>
        </div>
      </div>

      <div className="bg-[#020617] rounded-[2.5rem] shadow-2xl border border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Associado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Documento</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.03] transition-colors group cursor-default">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${doc.ownerType === 'Atleta' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                        {doc.ownerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{doc.ownerName}</p>
                        <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">{doc.ownerType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-300">{doc.type}</p>
                        <p className="text-[10px] font-mono text-slate-600">{doc.documentNumber || 'S/N'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-600 italic text-sm">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
            <div className="p-8 bg-gradient-to-br from-slate-900 to-blue-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Anexar Arquivo</h3>
                <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Dossiê Oficial do Clube</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X size={20} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associado</label>
                     <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Selecione um membro...</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                     <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20">
                        {DOCUMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                     </select>
                  </div>
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                     <FileUp size={32} className="text-slate-300 mb-2" />
                     <p className="text-xs font-bold text-slate-500">Clique para selecionar o PDF/Imagem</p>
                  </div>
               </div>
               <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Salvar no Sistema</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full overflow-hidden">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl"><FileText size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black">{selectedDoc.type}</h3>
                       <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{selectedDoc.ownerName}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedDoc(null)} className="p-2 bg-white/5 rounded-xl"><X size={20} /></button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registro</p>
                    <p className="font-mono font-bold">{selectedDoc.documentNumber || '---'}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                    <p className="font-bold">{formatDate(selectedDoc.expiryDate)}</p>
                 </div>
                 <div className="col-span-2 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status de Auditoria</p>
                       <p className="text-lg font-black text-blue-900">{selectedDoc.status === DocumentStatus.VALID ? 'Documento em Vigor' : 'Atenção Necessária'}</p>
                    </div>
                    {getStatusBadge(selectedDoc.status)}
                 </div>
              </div>
              <div className="p-8 border-t flex space-x-3">
                 <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center space-x-2"><ExternalLink size={18} /> <span>Ver Arquivo</span></button>
                 <button className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center space-x-2"><Download size={18} /> <span>Baixar</span></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Documents;


import React, { useState, useRef } from 'react';
import { 
  Search, 
  FileText, 
  X, 
  Eye, 
  Download,
  Plus,
  Fingerprint,
  Home,
  CreditCard,
  Vote,
  FileUp,
  ExternalLink,
  Check,
  Upload
} from 'lucide-react';
import { Player, Staff, TeamDocument, DocumentStatus } from '../types';

interface DocumentsProps {
  players: Player[];
  staff: Staff[];
  onAddDocument?: (ownerId: string, ownerType: 'Atleta' | 'Comissão', document: TeamDocument) => void;
}

interface FlattenedDocument extends TeamDocument {
  ownerName: string;
  ownerType: 'Atleta' | 'Comissão';
}

const DOCUMENT_TYPES = [
  { id: 'RG_CNH', label: 'RG ou CNH', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'CPF', label: 'CPF', icon: Fingerprint, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'TITULO', label: 'Título de Eleitor', icon: Vote, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'RESIDENCIA', label: 'Comprovante de Residência', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const Documents: React.FC<DocumentsProps> = ({ players, staff, onAddDocument }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDoc, setSelectedDoc] = useState<FlattenedDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  // Form states
  const [formAssociateId, setFormAssociateId] = useState<string>('');
  const [formDocType, setFormDocType] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allDocuments: FlattenedDocument[] = [
    ...players.flatMap(p => p.documents.map(d => ({ ...d, ownerName: p.name, ownerType: 'Atleta' as const }))),
    ...staff.flatMap(s => s.documents.map(d => ({ ...d, ownerName: s.name, ownerType: 'Comissão' as const })))
  ];

  const filteredDocs = allDocuments.filter(doc => {
    return doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleQuickUpload = (typeId: string) => {
    const typeLabel = DOCUMENT_TYPES.find(t => t.id === typeId)?.label || '';
    setFormDocType(typeLabel);
    setFormAssociateId('');
    setSelectedFileName(null);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssociateId || !formDocType || !selectedFileName || !onAddDocument) return;

    const isPlayer = players.some(p => p.id === formAssociateId);
    const ownerType = isPlayer ? 'Atleta' : 'Comissão';

    const newDoc: TeamDocument = {
      id: Math.random().toString(36).substr(2, 9),
      type: formDocType,
      status: DocumentStatus.PENDING, // Mantido internamente mas oculto na UI
      issueDate: new Date().toISOString().split('T')[0],
      documentNumber: 'DOC-' + Math.floor(Math.random() * 10000)
    };

    onAddDocument(formAssociateId, ownerType, newDoc);
    
    setShowAddModal(false);
    setSelectedFileName(null);
    setFormAssociateId('');
    setFormDocType('');
  };

  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';

  return (
    <div className="space-y-8">
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
            onClick={() => {
              setFormDocType('');
              setFormAssociateId('');
              setSelectedFileName(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Novo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DOCUMENT_TYPES.map((type) => (
          <div 
            key={type.id} 
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-2xl ${type.bg} ${type.color} mb-3 group-hover:scale-110 transition-transform`}>
              <type.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight leading-none mb-4 min-h-[20px] flex items-center justify-center">
              {type.label}
            </p>
            <button 
              onClick={() => handleQuickUpload(type.id)}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
            >
              <Upload size={12} />
              <span>Enviar</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#020617] rounded-[2.5rem] shadow-2xl border border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Associado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Documento</th>
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
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-600 italic text-sm">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associado</label>
                     <select 
                        value={formAssociateId}
                        onChange={(e) => setFormAssociateId(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20" 
                        required
                      >
                        <option value="">Selecione um membro...</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name} (Atleta)</option>)}
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name} (Comissão)</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                     <select 
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20" 
                      required
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value)}
                    >
                        <option value="">Selecione o tipo...</option>
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
                    onClick={openFileSelector}
                    className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFileName ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                     {selectedFileName ? (
                       <div className="text-center">
                          <Check size={32} className="text-blue-600 mb-2 mx-auto" />
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[200px]">{selectedFileName}</p>
                          <p className="text-[9px] font-bold text-blue-400 mt-1">Clique para trocar</p>
                       </div>
                     ) : (
                       <>
                          <FileUp size={32} className="text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-500">Clique para selecionar o PDF/Imagem</p>
                       </>
                     )}
                  </div>
               </div>
               <button 
                type="submit"
                disabled={!selectedFileName || !formAssociateId || !formDocType}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                Salvar no Sistema
               </button>
            </form>
          </div>
        </div>
      )}

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
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Arquivo Digitalizado</p>
                       <p className="text-lg font-black text-blue-900">Documento pronto para visualização</p>
                    </div>
                    <FileText className="text-blue-400" size={32} />
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

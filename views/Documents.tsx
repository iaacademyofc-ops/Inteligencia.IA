
import React, { useState, useRef } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  X, 
  Eye, 
  ExternalLink,
  Loader2,
  FileUp,
  Hash,
  CalendarDays,
  MousePointer2,
  Download,
  Plus,
  UserCheck,
  Check,
  Fingerprint,
  Home,
  ClipboardList,
  CreditCard,
  Vote
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allDocuments: FlattenedDocument[] = [
    ...players.flatMap(p => p.documents.map(d => ({ ...d, ownerName: p.name, ownerType: 'Atleta' as const }))),
    ...staff.flatMap(s => s.documents.map(d => ({ ...d, ownerName: s.name, ownerType: 'Comissão' as const })))
  ];

  const filteredDocs = allDocuments.filter(doc => {
    const matchesSearch = doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VALID:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> Válido
          </span>
        );
      case DocumentStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" /> Pendente
          </span>
        );
      case DocumentStatus.EXPIRED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" /> Expirado
          </span>
        );
      default:
        return null;
    }
  };

  const openUploadModal = (typeLabel: string = '') => {
    setPreselectedType(typeLabel);
    setShowAddModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload();
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const stats = {
    valid: allDocuments.filter(d => d.status === DocumentStatus.VALID).length,
    pending: allDocuments.filter(d => d.status === DocumentStatus.PENDING).length,
    expired: allDocuments.filter(d => d.status === DocumentStatus.EXPIRED).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Controle de Documentos</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de arquivos e vigência</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">Status: Todos</option>
            <option value={DocumentStatus.VALID}>Válidos</option>
            <option value={DocumentStatus.PENDING}>Pendentes</option>
            <option value={DocumentStatus.EXPIRED}>Expirados</option>
          </select>
          <button 
            onClick={() => openUploadModal()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Novo Anexo</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {DOCUMENT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => openUploadModal(type.label)}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col group active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl ${type.bg} ${type.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <type.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-1">Upload Rápido</p>
            <p className="text-xs font-bold text-slate-800 leading-tight">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-green-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Documentos Válidos</p>
            <p className="text-2xl font-black text-green-600">{stats.valid}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-2xl text-green-600">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-yellow-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Aguardando/Pendente</p>
            <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600">
            <Clock size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Documentos Vencidos</p>
            <p className="text-2xl font-black text-red-600">{stats.expired}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-2xl text-red-600">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Associado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de Documento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nº Registro</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Expiração</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ${doc.ownerType === 'Atleta' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                        {doc.ownerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{doc.ownerName}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">{doc.ownerType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700 font-bold">{doc.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {doc.documentNumber || 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${doc.status === DocumentStatus.EXPIRED ? 'text-red-500' : 'text-slate-600'}`}>
                      {formatDate(doc.expiryDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Baixar"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <FileUp size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Anexar Documento</h3>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-widest">{preselectedType || 'Novo arquivo para o dossiê'}</p>
                </div>
              </div>
            </div>

            <form className="p-8 space-y-5" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Associado</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer">
                  <option value="">Selecione um Atleta ou Staff</option>
                  <optgroup label="Atletas">
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Comissão">
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                  value={preselectedType}
                  onChange={(e) => setPreselectedType(e.target.value)}
                >
                  <option value="">Selecione o tipo...</option>
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.id} value={type.label}>{type.label}</option>
                  ))}
                  <option value="Outro">Outro Documento</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nº Registro</label>
                  <input 
                    type="text" 
                    placeholder="00.000.000-0"
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Data Validade</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative mt-4 flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
                `}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <div className={`p-3 rounded-xl transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <FileUp size={24} />
                </div>
                <p className="text-xs font-black text-slate-700 mt-2">Clique ou arraste o arquivo</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">PDF, JPG ou PNG</p>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <Check size={20} />
                  <span>Salvar Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="sports-gradient px-8 py-6 flex items-center justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <FileText size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Dossiê do Documento</h3>
                  <p className="text-[10px] uppercase font-bold text-blue-300 tracking-[0.2em]">{selectedDoc.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Owner Info */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${selectedDoc.ownerType === 'Atleta' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {selectedDoc.ownerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-none mb-1 tracking-tight">{selectedDoc.ownerName}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${selectedDoc.ownerType === 'Atleta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {selectedDoc.ownerType}
                    </span>
                    <span className="text-xs text-slate-400 font-bold tracking-tight">ASSOCIADO AO ELENCO</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <FileText size={12} className="mr-1.5" /> Tipo de Documento
                  </p>
                  <p className="font-extrabold text-slate-800 text-base">{selectedDoc.type}</p>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <Clock size={12} className="mr-1.5" /> Status Atual
                  </p>
                  <div>{getStatusBadge(selectedDoc.status)}</div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <Hash size={12} className="mr-1.5" /> Número Oficial
                  </p>
                  <p className="font-mono font-bold text-slate-700 text-sm tracking-tight">{selectedDoc.documentNumber || 'NÃO REGISTRADO'}</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <CalendarDays size={12} className="mr-1.5" /> Data Emissão
                  </p>
                  <p className="font-bold text-slate-700">{formatDate(selectedDoc.issueDate)}</p>
                </div>

                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 col-span-2 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle size={80} />
                  </div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center">
                    <AlertTriangle size={14} className="mr-2" /> Validade do Registro
                  </p>
                  <p className="text-xl font-black text-blue-900 tracking-tight">
                    {selectedDoc.expiryDate ? new Date(selectedDoc.expiryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'VIGÊNCIA INDETERMINADA'}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                    <ExternalLink size={18} />
                    <span>Ver Original</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-2xl font-black text-sm hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
                    <Download size={18} />
                    <span>Baixar Cópia</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;

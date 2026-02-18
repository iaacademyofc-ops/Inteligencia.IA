
import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  CalendarDays, 
  FileText, 
  Trophy, 
  Image as ImageIcon,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Settings2,
  Hash,
  UserCircle,
  Palette,
  Users2,
  Baby
} from 'lucide-react';
import { ViewType, Modality, TeamTheme, TeamGender } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  currentModality: Modality;
  onModalityChange: (modality: Modality) => void;
  currentGender: TeamGender;
  onGenderChange: (gender: TeamGender) => void;
  theme: TeamTheme;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange, 
  currentModality, 
  onModalityChange, 
  currentGender,
  onGenderChange,
  theme 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
  }, [theme]);

  const navigation = [
    { id: 'DASHBOARD', name: 'Painel Geral', icon: LayoutDashboard },
    { id: 'PLAYERS', name: 'Atletas', icon: Users },
    { id: 'OFFICIAL_NUMBERS', name: 'Números Oficiais', icon: Hash },
    { id: 'STAFF', name: 'Comissão Técnica', icon: UserCog },
    { id: 'MATCHES', name: 'Agenda de Jogos', icon: CalendarDays },
    { id: 'DOCUMENTS', name: 'Central de Docs', icon: FileText },
    { id: 'STATS', name: 'Resultados', icon: Trophy },
    { id: 'BANNERS', name: 'Marketing', icon: ImageIcon },
    { id: 'SETTINGS', name: 'Personalizar Clube', icon: Palette },
  ];

  if (currentView === 'ATHLETE_PORTAL') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 sports-gradient text-white z-50 transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="sidebar-glow"></div>
        
        <div className="p-8">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onViewChange('DASHBOARD')}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
              <Trophy size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight leading-tight">
              {theme.teamName.split(' ')[0]}<span className="text-white/60 font-medium">{theme.teamName.split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id as ViewType);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                ${currentView === item.id 
                  ? 'active-nav-item text-white font-bold' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} className={currentView === item.id ? 'text-white' : 'group-hover:text-white transition-colors'} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </div>
              {currentView === item.id && <ChevronRight size={14} className="opacity-50" />}
            </button>
          ))}
          
          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={() => {
                onViewChange('ATHLETE_PORTAL');
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <UserCircle size={18} />
              <span className="font-bold text-sm tracking-wide">Portal do Atleta</span>
            </button>
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Dpt. {currentGender}</p>
            <p className="text-xs font-bold text-white">{currentModality}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} className="text-slate-600" />
            </button>
            
            {/* Department Selector */}
            <div className="flex items-center bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
              <button 
                onClick={() => onGenderChange(TeamGender.MALE)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentGender === TeamGender.MALE ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="text-base leading-none">♂</span>
                <span className="hidden sm:inline">Masculino</span>
              </button>
              <button 
                onClick={() => onGenderChange(TeamGender.FEMALE)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentGender === TeamGender.FEMALE ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="text-base leading-none">♀</span>
                <span className="hidden sm:inline">Feminino</span>
              </button>
              <button 
                onClick={() => onGenderChange(TeamGender.YOUTH)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentGender === TeamGender.YOUTH ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Baby size={14} />
                <span className="hidden sm:inline">Base</span>
              </button>
            </div>

            {/* Modality Selector */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => onModalityChange(Modality.FOOTBALL)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentModality === Modality.FOOTBALL ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Campo
              </button>
              <button 
                onClick={() => onModalityChange(Modality.FUTSAL)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentModality === Modality.FUTSAL ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Futsal
              </button>
              <button 
                onClick={() => onModalityChange(Modality.FUT7)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentModality === Modality.FUT7 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Fut7
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:dynamic-text-accent hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Admin Painel</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{currentGender}</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-colors dynamic-bg-primary">
                  AD
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          <div className="mb-6 flex items-center space-x-3 text-slate-400">
            <Users2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentGender} • {currentModality}</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

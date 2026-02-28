
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.ts';
import Layout from './components/Layout.tsx';
import Login from './components/Login.tsx';
import Dashboard from './views/Dashboard.tsx';
import Roster from './views/Roster.tsx';
import Matches from './views/Matches.tsx';
import Banners from './views/Banners.tsx';
import Documents from './views/Documents.tsx';
import OfficialNumbers from './views/OfficialNumbers.tsx';
import AthletePortal from './views/AthletePortal.tsx';
import StaffPortal from './views/StaffPortal.tsx';
import Settings from './views/Settings.tsx';
import { Player, Staff, Match, ViewType, DocumentStatus, Modality, TeamTheme, TeamGender, TeamDocument } from './types.ts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tm_auth') === 'true';
  });
  const [modality, setModality] = useState<Modality>(Modality.FOOTBALL);
  const [gender, setGender] = useState<TeamGender>(TeamGender.MALE);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  
  useEffect(() => {
    const checkSupabase = async () => {
      const { data, error } = await supabase.from('teams').select('count').limit(1);
      if (!error) setIsSupabaseConnected(true);
    };
    checkSupabase();
  }, []);

  const [theme, setTheme] = useState<TeamTheme>({
    categories: {
      [TeamGender.MALE]: { teamName: 'TeamMaster Pro', primary: '#1e3a8a', secondary: '#0f172a', accent: '#3b82f6', crestUrl: undefined },
      [TeamGender.FEMALE]: { teamName: 'TeamMaster Girls', primary: '#9d174d', secondary: '#4c0519', accent: '#f472b6', crestUrl: undefined },
      [TeamGender.YOUTH]: { teamName: 'TeamMaster Base', primary: '#b45309', secondary: '#451a03', accent: '#fbbf24', crestUrl: undefined },
    },
    clubDocuments: [
      { id: 'cd1', type: 'Estatuto Social', status: DocumentStatus.VALID, issueDate: '2020-01-01', documentNumber: 'EST-2020' },
      { id: 'cd2', type: 'Cartão CNPJ', status: DocumentStatus.VALID, issueDate: '2021-05-15', documentNumber: '12.345.678/0001-99' }
    ]
  });
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [matches, setMatches] = useState<Match[]>([]); 

  const filteredPlayers = players.filter(p => p.gender === gender);
  const filteredMatches = matches.filter(m => m.gender === gender && m.modality === modality);
  const filteredStaff = staff.filter(s => s.gender === gender);

  const handleAddPlayer = (newPlayer: Player) => setPlayers(prev => [...prev, newPlayer]);
  const handleUpdatePlayer = (updatedPlayer: Player) => setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  const handleAddStaff = (newStaff: Staff) => setStaff(prev => [...prev, newStaff]);
  const handleUpdateStaff = (updatedStaff: Staff) => setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  const handleDeletePlayer = (id: string) => setPlayers(prev => prev.filter(p => p.id !== id));
  const handleDeleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));
  const handleAddMatch = (newMatch: Match) => setMatches(prev => [...prev, newMatch]);
  const handleUpdateMatch = (updatedMatch: Match) => setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('tm_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tm_auth');
    setCurrentView('DASHBOARD');
  };

  const handleAddDocument = (ownerId: string, ownerType: 'Atleta' | 'Comissão', document: TeamDocument) => {
    if (ownerType === 'Atleta') {
      setPlayers(prev => prev.map(p => p.id === ownerId ? { ...p, documents: [...p.documents, document] } : p));
    } else {
      setStaff(prev => prev.map(s => s.id === ownerId ? { ...s, documents: [...s.documents, document] } : s));
    }
  };

  const handleValidateDocument = (ownerId: string, ownerType: 'Atleta' | 'Comissão', documentId: string) => {
    if (ownerType === 'Atleta') {
      setPlayers(prev => prev.map(p => p.id === ownerId ? {
        ...p,
        documents: p.documents.map(d => d.id === documentId ? { ...d, status: DocumentStatus.VALID } : d)
      } : p));
    } else {
      setStaff(prev => prev.map(s => s.id === ownerId ? {
        ...s,
        documents: s.documents.map(d => d.id === documentId ? { ...d, status: DocumentStatus.VALID } : d)
      } : s));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard players={filteredPlayers} matches={filteredMatches} onViewChange={setCurrentView} theme={theme} gender={gender} />;
      case 'PLAYERS':
        return <Roster type="PLAYERS" players={filteredPlayers} staff={[]} matches={filteredMatches} modality={modality} currentGender={gender} onAddPlayer={handleAddPlayer} onUpdatePlayer={handleUpdatePlayer} onDeletePlayer={handleDeletePlayer} />;
      case 'OFFICIAL_NUMBERS':
        return <OfficialNumbers players={filteredPlayers} modality={modality} />;
      case 'STAFF':
        return <Roster type="STAFF" players={[]} staff={filteredStaff} matches={filteredMatches} modality={modality} currentGender={gender} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} onDeleteStaff={handleDeleteStaff} />;
      case 'MATCHES':
        return <Matches matches={filteredMatches} onAddMatch={handleAddMatch} onUpdateMatch={handleUpdateMatch} players={filteredPlayers} currentModality={modality} currentGender={gender} theme={theme} />;
      case 'BANNERS':
        return <Banners matches={filteredMatches} players={filteredPlayers} staff={filteredStaff} modality={modality} theme={theme} gender={gender} />;
      case 'DOCUMENTS':
        return <Documents players={filteredPlayers} staff={filteredStaff} onAddDocument={handleAddDocument} onValidateDocument={handleValidateDocument} />;
      case 'SETTINGS':
        return <Settings theme={theme} onThemeChange={setTheme} currentGender={gender} />;
      case 'ATHLETE_PORTAL':
        return <AthletePortal players={filteredPlayers} matches={filteredMatches} onAddDocument={handleAddDocument} onExit={() => setCurrentView('DASHBOARD')} theme={theme} gender={gender} />;
      case 'STAFF_PORTAL':
        return <StaffPortal staff={filteredStaff} players={filteredPlayers} matches={filteredMatches} onAddDocument={handleAddDocument} onExit={() => setCurrentView('DASHBOARD')} theme={theme} gender={gender} modality={modality} />;
      case 'STATS':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Resumo da Temporada {gender} - {modality}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold mb-4">Top Goleadores</h3>
                <div className="space-y-4">
                  {[...filteredPlayers].sort((a,b) => b.stats.goals - a.stats.goals).map(p => (
                    <div key={p.id} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-bold dynamic-text-primary">{p.stats.goals} Gols</span>
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && <p className="text-slate-400 italic text-sm">Nenhum dado registrado.</p>}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard players={filteredPlayers} matches={filteredMatches} onViewChange={setCurrentView} theme={theme} gender={gender} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView} 
      currentModality={modality} 
      onModalityChange={setModality}
      currentGender={gender}
      onGenderChange={setGender}
      theme={theme}
      isSupabaseConnected={isSupabaseConnected}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

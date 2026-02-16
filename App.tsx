
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Roster from './views/Roster';
import Matches from './views/Matches';
import Banners from './views/Banners';
import Documents from './views/Documents';
import OfficialNumbers from './views/OfficialNumbers';
import AthletePortal from './views/AthletePortal';
import Settings from './views/Settings';
import { Player, Staff, Match, ViewType, PlayerPosition, StaffRole, MatchType, DocumentStatus, Modality, TeamTheme, TeamGender } from './types';

const INITIAL_PLAYERS: Player[] = [
  { 
    id: '1', 
    name: 'Ricardo Santos', 
    number: 10, 
    position: PlayerPosition.MIDFIELDER, 
    birthDate: '15/05/1998', 
    gender: TeamGender.MALE,
    documents: [
      { id: 'd1', type: 'Ficha de Atleta', status: DocumentStatus.VALID, issueDate: '2022-01-01', expiryDate: '2025-12-31', documentNumber: 'FA-2022-001' },
      { id: 'd2', type: 'Comprovante de Residência', status: DocumentStatus.EXPIRED, issueDate: '2023-01-10', expiryDate: '2024-01-10', documentNumber: 'RES-9982' }
    ], 
    stats: { goals: 5, assists: 8, matches: 12 },
    achievements: [
      { id: 'a1', title: 'Campeão Estadual', year: '2023', competition: 'Campeonato Paulista', type: 'COLLECTIVE' },
      { id: 'a2', title: 'Melhor Meia', year: '2023', competition: 'Copa Regional', type: 'INDIVIDUAL' }
    ]
  },
  { 
    id: '2', 
    name: 'Thiago Silva', 
    number: 4, 
    position: PlayerPosition.DEFENDER, 
    birthDate: '22/09/1994', 
    gender: TeamGender.MALE,
    documents: [
      { id: 'd3', type: 'RG ou CNH', status: DocumentStatus.VALID, issueDate: '2010-05-20', expiryDate: '2030-05-20', documentNumber: '12.345.678-9' },
      { id: 'd4', type: 'CPF', status: DocumentStatus.PENDING, documentNumber: '000.111.222-33' }
    ], 
    stats: { goals: 1, assists: 0, matches: 14 },
    achievements: [
      { id: 'a3', title: 'Campeão da Copa', year: '2022', competition: 'Copa do Brasil', type: 'COLLECTIVE' }
    ]
  },
  { 
    id: 'w1', 
    name: 'Marta Oliveira', 
    number: 10, 
    position: PlayerPosition.FORWARD, 
    birthDate: '19/02/1986', 
    gender: TeamGender.FEMALE,
    documents: [
      { id: 'd5', type: 'Ficha de Atleta', status: DocumentStatus.VALID, issueDate: '2023-01-01', expiryDate: '2025-12-31', documentNumber: 'FA-FEM-001' }
    ], 
    stats: { goals: 15, assists: 10, matches: 20 },
    achievements: [
      { id: 'a4', title: 'Chuteira de Ouro', year: '2023', competition: 'Torneio Internacional', type: 'INDIVIDUAL' },
      { id: 'a5', title: 'Campeã Nacional', year: '2023', competition: 'Brasileirão Feminino', type: 'COLLECTIVE' }
    ]
  },
  { 
    id: 'y1', 
    name: 'Enzo Junior', 
    number: 7, 
    position: PlayerPosition.ALA_D, 
    birthDate: '10/08/2009', 
    gender: TeamGender.YOUTH,
    documents: [
      { id: 'dy1', type: 'Autorização Pais', status: DocumentStatus.VALID, issueDate: '2024-01-10', expiryDate: '2025-01-10', documentNumber: 'AUT-001' }
    ], 
    stats: { goals: 8, assists: 4, matches: 10 },
    achievements: [
      { id: 'ay1', title: 'Destaque Sub-15', year: '2024', competition: 'Copa Futuro', type: 'INDIVIDUAL' }
    ]
  },
  { 
    id: 'f7_1', 
    name: 'Felipe Fut7', 
    number: 9, 
    position: PlayerPosition.FORWARD, 
    birthDate: '05/03/1996', 
    gender: TeamGender.MALE,
    documents: [], 
    stats: { goals: 12, assists: 5, matches: 8 },
    achievements: []
  },
];

const INITIAL_MATCHES: Match[] = [
  { id: 'm1', opponent: 'Flamengo', date: '2024-06-15', time: '16:00', venue: 'Maracanã', type: MatchType.OFFICIAL, gender: TeamGender.MALE, scoreHome: 0, scoreAway: 0, events: [], isFinished: false, modality: Modality.FOOTBALL },
  { id: 'm2', opponent: 'Corinthians Feminino', date: '2024-06-20', time: '15:00', venue: 'Neo Química Arena', type: MatchType.OFFICIAL, gender: TeamGender.FEMALE, scoreHome: 0, scoreAway: 0, events: [], isFinished: false, modality: Modality.FOOTBALL },
  { id: 'm3', opponent: 'Magnus Futsal', date: '2024-05-30', time: '19:30', venue: 'Arena Sorocaba', type: MatchType.OFFICIAL, gender: TeamGender.MALE, scoreHome: 2, scoreAway: 1, events: [], isFinished: true, modality: Modality.FUTSAL },
  { id: 'm4', opponent: 'SA Fut7 Team', date: '2024-07-05', time: '21:00', venue: 'Complexo Esportivo', type: MatchType.OFFICIAL, gender: TeamGender.MALE, scoreHome: 0, scoreAway: 0, events: [], isFinished: false, modality: Modality.FUT7 },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [modality, setModality] = useState<Modality>(Modality.FOOTBALL);
  const [gender, setGender] = useState<TeamGender>(TeamGender.MALE);
  const [theme, setTheme] = useState<TeamTheme>({
    primary: '#1e3a8a',
    secondary: '#0f172a',
    accent: '#3b82f6',
    teamName: 'TeamMaster Pro',
    clubDocuments: [
      { id: 'cd1', type: 'Estatuto Social', status: DocumentStatus.VALID, issueDate: '2020-01-01', documentNumber: 'EST-2020' },
      { id: 'cd2', type: 'Cartão CNPJ', status: DocumentStatus.VALID, issueDate: '2021-05-15', documentNumber: '12.345.678/0001-99' }
    ]
  });
  
  const [players] = useState<Player[]>(INITIAL_PLAYERS);
  const [staff] = useState<Staff[]>([]);
  const [matches] = useState<Match[]>(INITIAL_MATCHES);

  // Filtros Globais
  const filteredPlayers = players.filter(p => p.gender === gender);
  const filteredMatches = matches.filter(m => m.gender === gender && m.modality === modality);
  const filteredStaff = staff.filter(s => s.gender === gender);

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard players={filteredPlayers} matches={filteredMatches} />;
      case 'PLAYERS':
        return <Roster type="PLAYERS" players={filteredPlayers} staff={[]} modality={modality} currentGender={gender} />;
      case 'OFFICIAL_NUMBERS':
        return <OfficialNumbers players={filteredPlayers} modality={modality} />;
      case 'STAFF':
        return <Roster type="STAFF" players={[]} staff={filteredStaff} modality={modality} currentGender={gender} />;
      case 'MATCHES':
        return <Matches matches={filteredMatches} />;
      case 'BANNERS':
        return <Banners matches={filteredMatches} players={filteredPlayers} modality={modality} theme={theme} gender={gender} />;
      case 'DOCUMENTS':
        return <Documents players={filteredPlayers} staff={filteredStaff} />;
      case 'SETTINGS':
        return <Settings theme={theme} onThemeChange={setTheme} />;
      case 'ATHLETE_PORTAL':
        return <AthletePortal players={filteredPlayers} matches={filteredMatches} onExit={() => setCurrentView('DASHBOARD')} />;
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
                  {filteredPlayers.length === 0 && <p className="text-slate-400 italic text-sm">Sem dados registrados.</p>}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard players={filteredPlayers} matches={filteredMatches} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView} 
      currentModality={modality} 
      onModalityChange={setModality}
      currentGender={gender}
      onGenderChange={setGender}
      theme={theme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

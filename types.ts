
export enum Modality {
  FOOTBALL = 'Futebol de Campo',
  FUTSAL = 'Futsal',
  FUT7 = 'Fut7'
}

export enum TeamGender {
  MALE = 'Masculino',
  FEMALE = 'Feminino',
  YOUTH = 'Base'
}

export enum PlayerPosition {
  GOALKEEPER = 'Goleiro',
  DEFENDER = 'Zagueiro',
  LATERAL = 'Lateral',
  VOLANTE = 'Volante',
  MIDFIELDER = 'Meio-Campo',
  FORWARD = 'Atacante',
  FIXO = 'Fixo',
  ALA_D = 'Ala D',
  ALA_E = 'Ala E',
  PIVO = 'Pivô'
}

export enum StaffRole {
  HEAD_COACH = 'Treinador Principal',
  ASSISTANT_COACH = 'Auxiliar Técnico',
  PHYSIO = 'Fisioterapeuta',
  DOCTOR = 'Médico',
  MANAGER = 'Diretor'
}

export enum MatchType {
  OFFICIAL = 'Oficial',
  FRIENDLY = 'Amistoso'
}

export enum DocumentStatus {
  PENDING = 'Pendente',
  VALID = 'Válido',
  EXPIRED = 'Expirado',
  AWAITING_VALIDATION = 'Aguardando Validação'
}

export interface Achievement {
  id: string;
  title: string;
  year: string;
  competition: string;
  type: 'COLLECTIVE' | 'INDIVIDUAL';
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  birthDate: string;
  photoUrl?: string;
  gender: TeamGender;
  documents: TeamDocument[];
  stats: {
    goals: number;
    assists: number;
    matches: number;
  };
  achievements: Achievement[];
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  gender: TeamGender;
  /* Fix: Added photoUrl to Staff interface to allow profile photos and fix TypeScript compilation errors in shared views */
  photoUrl?: string;
  documents: TeamDocument[];
}

export interface TeamDocument {
  id: string;
  type: string;
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string;
  documentNumber?: string;
}

export interface MatchEvent {
  type: 'GOAL' | 'ASSIST' | 'CARD_YELLOW' | 'CARD_RED';
  playerId: string;
  minute: number;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  type: MatchType;
  gender: TeamGender;
  scoreHome: number;
  scoreAway: number;
  events: MatchEvent[];
  isFinished: boolean;
  modality: Modality;
}

export interface CategoryTheme {
  teamName: string;
  primary: string;
  secondary: string;
  accent: string;
  crestUrl?: string;
}

export interface TeamTheme {
  categories: Record<TeamGender, CategoryTheme>;
  clubDocuments: TeamDocument[];
}

export type ViewType = 'DASHBOARD' | 'PLAYERS' | 'STAFF' | 'MATCHES' | 'DOCUMENTS' | 'BANNERS' | 'STATS' | 'OFFICIAL_NUMBERS' | 'ATHLETE_PORTAL' | 'STAFF_PORTAL' | 'SETTINGS';

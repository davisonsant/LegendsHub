/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Position = 'TOP' | 'JNG' | 'MID' | 'ADC' | 'SUP';

export interface PlayerAttributes {
  mechanics: number;      // Mecânica
  macro: number;          // Macro game
  communication: number;  // Comunicação
  leadership: number;     // Liderança
  consistency: number;    // Consistência
  emotionalControl: number; // Controle emocional
  farm: number;           // Farm rate
  mapVision: number;      // Visão de mapa
  playoffPerformance: number; // Força em playoffs
}

export interface Player {
  id: string;
  name: string;
  realName: string;
  nationality: string;
  age: number;
  position: Position;
  attributes: PlayerAttributes;
  overallRating: number;
  potential: number;
  personality: string;
  popularity: number;
  marketValue: number;
  salary: number;
  contractMonths: number;
  motivation: number;      // 0-100
  stamina: number;         // 0-100
  chemistry: number;       // Química com o time (0-100)
  championPool: string[];  // Campeões preferidos/assinatura
  isPlayerControlled: boolean;
  photoUrl?: string;       // Custom photo
  customPlayer?: boolean;  // Se foi criado no Editor
  stats?: {
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    gamesPlayed: number;
    mvps: number;
  };
  signOnFee?: number; // Luvas
  isImported?: boolean;
  visaApproved?: boolean;
  consecutiveBenchCount?: number;
  isMvpBonusExigido?: boolean;
  isTitularidadeExigida?: boolean;
  contractWeeksRemaining?: number;
  isAcademyStarter?: boolean;
}

export type StaffRole = 'Coach' | 'Analyst' | 'Psychologist' | 'StreamManager' | 'PerformanceCoach';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  salary: number;
  level: number; // 1-100 rating
  description: string;
  photoUrl: string;
  hired: boolean;
  attributes: {
    tactical?: number;
    scouting?: number;
    motivationBoost?: number;
    tiltReduction?: number;
    economyManagement?: number;
  };
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  incomePerWeek: number;
  signatureBonus: number;
  termsInWeeks: number;
  minPopularity: number;
  isSigned: boolean;
  activeWeeks?: number;
  objective: string;
  objectiveBonus: number;
}

export interface OrganizationInfrastructure {
  gamingHouseLevel: number; // 1-5
  trainingCenterLevel: number; // 1-5
  mediaTeamLevel: number; // 1-5
}

export interface Team {
  id: string;
  name: string;
  acronym: string;
  logoUrl?: string;
  primaryColor: string; // Tailwind hex color or color class
  secondaryColor: string;
  budget: number;
  popularity: number; // 0-100
  fansSupport: number; // 0-100
  boardTrust: number; // 0-100
  roster: Player[];
  substitutes: Player[];
  academy: Player[];
  sponsors: Sponsor[];
  infrastructure: OrganizationInfrastructure;
  isPlayerControlled: boolean;
  points: number; // League points for standings
  wins: number;
  losses: number;
  gameWins: number; // individual match wins inside series
  gameLosses: number;
  streak: string; // e.g. "3W", "1L"
  matchHistoryIds: string[];
  region?: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP';
  description?: string;
  loans?: { id: string; type: 'Pessoal' | 'Empresarial' | 'Risco'; amount: number; remainingWeeks: number; interestRate: number; totalToPay: number }[];
  creditScore?: number;
  investments?: { fixedIncome: number; sportsFund: number; sharesRivals: number; advancedSponsorWeeks: number; advancedSponsorBudget: number };
  installmentPlans?: { id: string; playerName: string; totalAmount: number; remainingWeeks: number; installmentAmount: number }[];
  vistasAwaiting?: { id: string; playerId: string; name: string; type: 'P-1' | 'EB-1'; weeksRemaining: number; hasDocumentationRequest: boolean }[];
  poachingPenaltiesWeeks?: number;
  ticketPrice?: number;
  jerseyPrice?: number;
}

export interface Champion {
  id: string;
  name: string;
  roles: Position[];
  tier: 'S+' | 'S' | 'A' | 'B' | 'C';
  power: number; // Base tática (e.g. 70-98)
  buffStatus: 'BUFFED' | 'NERFED' | 'NORMAL';
  idealPlaystyle: string;
  counters: string[]; // Champion IDs that this counters
  synergies: string[]; // Champion IDs that synergize well with this
  imageSeed: number; // For generating procedurally beautiful icons
  imageUrl?: string; // Custom uploaded image from computer
}

export interface MatchStats {
  killsBlue: number;
  killsRed: number;
  deathsBlue: number;
  deathsRed: number;
  assistsBlue: number;
  assistsRed: number;
  dragonsBlue: number;
  dragonsRed: number;
  baronsBlue: number;
  baronsRed: number;
  towersBlue: number;
  towersRed: number;
  inhibitorsBlue: number;
  inhibitorsRed: number;
  csBlue: number;
  csRed: number;
  goldBlue: number;
  goldRed: number;
}

export interface MatchLog {
  id: string;
  timestamp: string; // e.g. "12:45"
  type: 'kill' | 'tower' | 'dragon' | 'baron' | 'objective' | 'critical' | 'info';
  message: string;
  goldDelta: number; // Blue side advantage change
}

export interface PickBan {
  blueBans: string[];
  redBans: string[];
  bluePicks: { [key in Position]?: string };
  redPicks: { [key in Position]?: string };
}

export interface MatchSeries {
  id: string;
  teamBlueId: string;
  teamRedId: string;
  scoreBlue: number;
  scoreRed: number;
  isFinished: boolean;
  roundIndex: number;
  stage: 'REGULAR' | 'PLAYOFFS_SEMI' | 'PLAYOFFS_FINAL' | 'MSI' | 'WORLDS_SWISS' | 'WORLDS_PLAYOFFS';
  logs: MatchLog[][]; // logs per game
  pickBans: PickBan[]; // picks & bans per game
  draftPhase?: number; // active draft step if player is manual
  activeGameIndex: number;
}

export interface SocialPost {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string;
  content: string;
  likes: number;
  retweets: number;
  timeAgo: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  verified?: boolean;
}

export interface GamePatch {
  version: string;
  metaDescription: string;
  buffedChampions: string[];
  nerfedChampions: string[];
  date: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  context: string;
  options: {
    text: string;
    trustChange: number;
    fansChange: number;
    chemistryChange: number;
    moneyChange: number;
    socialResponse: string;
  }[];
}

export interface SavedGameHeader {
  slotId: string;
  managerName: string;
  teamName: string;
  date: string;
  season: number;
  score: number;
}

export interface GameState {
  managerName: string;
  season: number; // Ano, e.g. 1, 2, 3...
  week: number; // 1-32 (Offseason, Temporada Regular, Playoffs, MSI, Worlds)
  stage: 'OFFSEASON' | 'SPLIT_REGULAR' | 'SPLIT_PLAYOFFS' | 'MSI' | 'WORLDS' | 'SEASON_COMPLETE';
  playerTeamId: string;
  teams: Team[];
  champions: Champion[];
  currentPatch: GamePatch;
  roundsPlayedThisWeek: boolean;
  calendarSchedule: { [weekNumber: number]: MatchSeries[] };
  socialFeed: SocialPost[];
  sponsorsMarket: Sponsor[];
  availableStaff: Staff[];
  careerHistory: {
    year: number;
    teamName: string;
    standing: string;
    accomplishment: string;
  }[];
  selectedRegion?: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP';
  selectedYear?: number;
  leagues?: { id: string; name: string; logoUrl?: string }[];
  finance?: {
    balance: number;
    currency?: string;
    caixa_bruto?: number;
    caixa_formatado_hud?: string;
  };
}

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
  is_academy?: number;
  team_tier?: string;
  face_blob?: string | null;
  image_blob?: string | null;
  surname?: string;
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

export interface CorporationStaff {
  id: string;
  nome: string;
  cargo: string;
  departamento: 'COMISSÃO TÉCNICA' | 'TI' | 'MARKETING' | 'SAÚDE' | 'JURÍDICO' | 'OLHEIROS' | 'RH';
  salario_semanal: number;
  semanas_contrato: number;
  nivel_eficiencia: number; // 0 a 100
  patrocinio_bonus?: number; // ex: 0.15
  fotoUrl: string;
  nacionalidade: string;
  bandeira: string;
  idade: number;
  especialidade: string;
  atribuido_scouting?: boolean;
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
  logo_blob?: any;
  image_blob?: any;
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
  ffpNonComplianceWeeks?: number;
  ticketPrice?: number;
  jerseyPrice?: number;
  vistoEspecialTorneioAtivo?: boolean;
  vistoEspecialTorneioNome?: string;
  consecutiveWeeksBelow20?: number;
  boardReprobations?: { id: string; week: number; type: string; description: string; cost?: number }[];
  boardLegacy?: { id: string; event: string; week: number; detail: string; category: string }[];
  boardGoals?: { id: string; name: string; description: string; target: string; status: 'pending' | 'achieved' | 'failed' }[];
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
  image_blob?: any; // Binary blob or base64 data for the champion
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

export interface Manager {
  id: string;
  name: string;
  age: number;
  nationality: string;
  photoUrl: string;
  image_blob?: any;
  avatar_blob?: any;
  teamId: string | null; // null if unemployed
  reputationTier: 'S' | 'A' | 'B' | 'C';
  popularity: number; // 0-100
  style: 'Agressivo' | 'Equilibrado' | 'Lento';
  emotionalProfile: 'Estóico' | 'Explosivo' | 'Analítico' | 'Motivador';
  stats: {
    wins: number;
    losses: number;
    titles: number;
    financialEfficiency: number; // 0-100 base
    youthPromotions: number; // base promotions count
  };
  titlesGallery: { date: string; league: string; logoUrl?: string }[];
  previousTeams: { teamName: string; years: string }[];
  recentResults: ('V' | 'D')[];
  topChampions: string[]; // top 3 champions
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
  corporationStaffEmployees?: CorporationStaff[];
  corporationStaffJobPool?: CorporationStaff[];
  managers?: Manager[];
  jobProposals?: any[];
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
  current_week_feed_state?: {
    tweets: {
      id: string;
      username: string;
      handle: string;
      avatar: string;
      content: string;
      likes: number;
      retweets: number;
      timeAgo: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      verified?: boolean;
    }[];
    news: {
      id: string;
      portal_nome: string;
      manchete_texto: string;
      tempo_passado: string;
      impacto_reputacao: 'positivo' | 'negativo' | 'neutro';
    }[];
  };
  lastEditorSyncTimestamp?: number;
  editorSyncStatusMessage?: string;
  currentDay?: number;
  currentMonthIndex?: number;
  gamingHouseActivities?: { [key: string]: any[] };
}

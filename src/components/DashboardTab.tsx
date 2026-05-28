/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Zap, 
  MessageSquare, 
  Plus, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight, 
  Sliders, 
  Volume2,
  ThumbsUp, 
  Clock, 
  Award, 
  Radio,
  Terminal
} from 'lucide-react';
import { GameState, InterviewQuestion, Team } from '../types';
import { formatMoney } from '../utils/currency';
import { INTERVIEW_QUESTIONS } from '../data/initialDatabase';

const TRANSLATIONS = {
  pt: {
    urgent: "URGENTE",
    newsTickerLabel: "SALA DE IMPRENSA: ",
    playerAlert: "Alerta de Jogador",
    bullExpiring: "Contrato de Bull Expirando",
    bullExpiringDesc: "Faltam apenas 2 semanas de contrato! Renove agora antes que ele declare Free Agent.",
    commercialProposal: "Proposta Comercial",
    sponsorDrakos: "Sponsor Drakos Disponível",
    sponsorDrakosDesc: "Proposta ativa para assinar e inflar os cofres com bônus de performance master semanal.",
    fatigueLocker: "Fadiga e Vestiário",
    youngjaeInsatisfeito: "YoungJae Insatisfeito",
    youngjaeDesc: "Atleta relata alta fadiga com treinos. Ajuste planos táticos no roster de jogadores.",
    season: "Temporada",
    weekLabel: "SEMANA",
    transfers: "TRANSFERÊNCIAS: 15 DIAS",
    boardTrust: "Confiança da Diretoria",
    statusExcelent: "Excelente",
    routingOffice: "Roteamento: Escritório",
    popularSupport: "Apoio Popular",
    engagedFans: "Torcida Engajada",
    routingCommunity: "Roteamento: Comunidade",
    teamChemistry: "Química com o Time",
    lockerStable: "Vestiário: Estável",
    routingPlayers: "Roteamento: Jogadores",
    nextChallenge: "Próximo Desafio do Split: Confronto de Elite",
    groupStage: "Fase de Grupos • Série Melhor de 3",
    playoffFinals: "PLAYOFFS FINALS",
    roundLabel: "RODADA",
    seriesResolved: "SÉRIE RESOLVIDA",
    instantSimulate: "Simular Instantâneo",
    startDraft: "Iniciar Draft",
    simNote: "* A simulação instantânea resolve matematicamente a melhor de 3, entregando bônus de torcida e prestígio de imediato. A simulação tática leva você à fase técnica estratégica de Picks & Bans.",
    simResultTitle: "RESULTADO DA SIMULAÇÃO INSTANTÂNEA",
    close: "FECHAR",
    simWinDesc: "🏆 Parabéns! O algoritmo calculou vitória para a equipe. Seus pontos na tabela subiram +3 e recebemos boosts no moral da diretoria e popularidade de torcida!",
    simLossDesc: "⚠️ Derrota computada. Os adversários leram melhor as nuances estruturais do patch atual contra o nosso roster. Revise os treinamentos de químicas no painel de Jogadores!",
    noMatchesScheduled: "Nenhuma partida agendada para esta semana de offseason. Pronto para iniciar o Split!",
    advanceWeek1: "Avançar para Semana 1",
    roundCompleted: "RODADA CONCLUÍDA",
    weekCompletedDesc: "Todas as obrigações e confrontos desta semana foram finalizados. Avance a semana para coletar os dinheiros dos patrocinadores, sofrer patches e evoluir seu time!",
    advanceWeekBtn: "AVANÇAR SEMANA",
    weeklySchedule: "Agenda da Semana",
    monTue: "Seg - Ter",
    scrimsDesc: "Scrims Táticas e Análises VODs",
    wedThu: "Qua - Qui",
    restDesc: "Preparação Física e Folga Mental",
    sunday: "DOMINGO",
    clasicoVsPain: "El Clásico contra paiN Gaming",
    against: "Confronto contra",
    viewFullSchedule: "Ver Programação Completa →",
    standingsLabel: "CLASSIFICAÇÃO",
    viewFullStandings: "Ver Tabela Completa →",
    financialHealth: "Saúde Financeira",
    availableBudget: "Caixa Disponível",
    currentExpense: "Gasto Corrente",
    netWeeklyRevenue: "Receita Líquida",
    estimatedRunway: "Runway Estimada",
    weeksUnit: "Semanas",
    accessFinancials: "Acessar Operações Financeiras →",
    summonersPatch: "Summoner's Rift Patch",
    tacticalGain: "+4 TÁTICO:",
    tacticalLoss: "-4 TÁTICO:",
    analyzeMeta: "Análise do Meta Completo →",
    pressRoomBadge: "SALA DE IMPRENSA",
    pressVibeFeedback: "Suas respostas influenciaram o prestígio da equipe e as opiniões táticas nas redes sociais!",
    feedXTitle: "REDE SOCIAL: FEED DO X (TWITTER)",
    goToComunidade: "IR PARA COMUNIDADE COMPLETA →",
    pressRoomPortalTitle: "SALA DE IMPRENSA (PORTAL DE NOTÍCIAS)",
    trackPressRoom: "ACOMPANHAR PRESS ROOM INTEGRADA →",
    jsonPayloadTitle: "DADOS DINÂMICOS DO MOTOR (DATA ENGINE INTERACTION)",
    apiSimTerminal: "CONSOLE DE PREVIEW DO BANCO DE DADOS LOCAL",
    exibirPayload: "EXIBIR PAYLOAD",
    ocultarPayload: "OCULTAR PAYLOAD",
    apiDesc: "Sistema integrado de persistência direta ao banco de dados e arquivos de saves locais (.json/.db). Reflete atualizações de classificação e feeds de rádio em tempo real.",
  },
  en: {
    urgent: "URGENT",
    newsTickerLabel: "PRESS ROOM: ",
    playerAlert: "Player Alert",
    bullExpiring: "Bull Contract Expiring",
    bullExpiringDesc: "Only 2 weeks left on contract! Renew now before he becomes a Free Agent.",
    commercialProposal: "Commercial Proposal",
    sponsorDrakos: "Sponsor Drakos Available",
    sponsorDrakosDesc: "Active proposal ready to sign and inflate your budget with weekly master performance bonuses.",
    fatigueLocker: "Fatigue & Locker Room",
    youngjaeInsatisfeito: "YoungJae Dissatisfied",
    youngjaeDesc: "Athlete reports high training fatigue. Adjust tactical plans in the player roster.",
    season: "Season",
    weekLabel: "WEEK",
    transfers: "TRANSFERS: 15 DAYS",
    boardTrust: "Board Trust",
    statusExcelent: "Excellent",
    routingOffice: "Routing: Office",
    popularSupport: "Fan Support",
    engagedFans: "Engaged Fans",
    routingCommunity: "Routing: Community",
    teamChemistry: "Team Chemistry",
    lockerStable: "Locker Room: Stable",
    routingPlayers: "Routing: Players",
    nextChallenge: "Next Split Challenge: Elite Showdown",
    groupStage: "Group Stage • Best of 3 Series",
    playoffFinals: "PLAYOFFS FINALS",
    roundLabel: "ROUND",
    seriesResolved: "SERIES RESOLVED",
    instantSimulate: "Instant Simulate",
    startDraft: "Start Draft",
    simNote: "* Instant simulation mathematically resolves the best of 3, delivering instant fan support and prestige. Tactical simulation takes you to the Strategic Pick & Ban phase.",
    simResultTitle: "INSTANT SIMULATION RESULT",
    close: "CLOSE",
    simWinDesc: "🏆 Congratulations! The algorithm calculated a victory for the team. Your points in the table increased by +3 and we received boosts in board trust and fan popularity!",
    simLossDesc: "⚠️ Defeat computed. The adversaries read the structural nuances of the current patch better against our roster. Review chemistry training on the players panel!",
    noMatchesScheduled: "No matches scheduled for this offseason week. Ready to start the Split!",
    advanceWeek1: "Advance to Week 1",
    roundCompleted: "ROUND COMPLETED",
    weekCompletedDesc: "All obligations and matches for this week have been completed. Advance the week to collect sponsor income, receive patch updates and grow your team!",
    advanceWeekBtn: "ADVANCE WEEK",
    weeklySchedule: "Weekly Schedule",
    monTue: "Mon - Tue",
    scrimsDesc: "Tactical Scrims & VOD Reviews",
    wedThu: "Wed - Thu",
    restDesc: "Physical Prep & Mental Day Off",
    sunday: "SUNDAY",
    clasicoVsPain: "El Clásico against paiN Gaming",
    against: "Match against",
    viewFullSchedule: "View Full Schedule →",
    standingsLabel: "STANDINGS",
    viewFullStandings: "View Full Table →",
    financialHealth: "Financial Health",
    availableBudget: "Available Budget",
    currentExpense: "Current Expense",
    netWeeklyRevenue: "Weekly Revenue",
    estimatedRunway: "Estimated Runway",
    weeksUnit: "Weeks",
    accessFinancials: "Access Financial Operations →",
    summonersPatch: "Summoner's Rift Patch",
    tacticalGain: "+4 TACTICAL:",
    tacticalLoss: "-4 TACTICAL:",
    analyzeMeta: "Analyze Full Meta →",
    pressRoomBadge: "PRESS ROOM",
    pressVibeFeedback: "Your answers influenced the team's prestige and tactical opinions on social networks!",
    feedXTitle: "REDE SOCIAL: FEED DO X (TWITTER)",
    goToComunidade: "GO TO FULL COMMUNITY →",
    pressRoomPortalTitle: "SALA DE IMPRENSA (PORTAL DE NOTÍCIAS)",
    trackPressRoom: "TRACK INTEGRATED PRESS ROOM →",
    jsonPayloadTitle: "DYNAMIC ENGINE PAYLOAD (MUTABLE LOCAL ENGINE)",
    apiSimTerminal: "LOCAL DATABASE PREVIEW TERMINAL",
    exibirPayload: "SHOW PAYLOAD",
    ocultarPayload: "HIDE PAYLOAD",
    apiDesc: "Direct integration network to the database and files of local saves (.json/.db). Reflects standings updates and live radio feeds in real time.",
  },
  es: {
    urgent: "URGENTE",
    newsTickerLabel: "SALA DE PRENSA: ",
    playerAlert: "Alerta de Jogador",
    bullExpiring: "Contrato de Bull Expirando",
    bullExpiringDesc: "¡Faltan solo 2 semanas de contrato! Renuévalo ahora antes de que se declare agente libre.",
    commercialProposal: "Propuesta Comercial",
    sponsorDrakos: "Patrocinio de Drakos Disponible",
    sponsorDrakosDesc: "Propuesta activa para firmar e inflar las arcas con bonos de rendimiento máster semanal.",
    fatigueLocker: "Fatiga y Vestuario",
    youngjaeInsatisfeito: "YoungJae Insatisfecho",
    youngjaeDesc: "El atleta reporta alta fatiga en los entrenamientos. ¡Ajusta los planes tácticos en la plantilla!",
    season: "Temporada",
    weekLabel: "SEMANA",
    transfers: "TRANSFERENCIAS: 15 DÍAS",
    boardTrust: "Confianza de la Directiva",
    statusExcelent: "Excelente",
    routingOffice: "Ruta: Oficina",
    popularSupport: "Apoyo Popular",
    engagedFans: "Afición Comprometida",
    routingCommunity: "Ruta: Comunidad",
    teamChemistry: "Química del Equipo",
    lockerStable: "Vestuario: Estable",
    routingPlayers: "Ruta: Jugadores",
    nextChallenge: "Próximo Desafío del Split: Enfrentamiento de Élite",
    groupStage: "Fase de Grupos • Serie al Mejor de 3",
    playoffFinals: "PLAYOFFS FINALS",
    roundLabel: "RONDA",
    seriesResolved: "SERIES RESUELTA",
    instantSimulate: "Simulación Instantánea",
    startDraft: "Iniciar Draft",
    simNote: "* La simulación instantánea resuelve matemáticamente el mejor de 3, entregando bonos de apoyo e inmediato prestigio. La simulación táctica te lleva a la fase estratégica de Selección y Bloqueo.",
    simResultTitle: "RESULTADO DE LA SIMULACIÓN INSTANTÁNEA",
    close: "CERRAR",
    simWinDesc: "🏆 ¡Felicidades! El algoritmo calculó la victoria para el equipo. ¡Tus puntos en la tabla aumentaron +3 y recibimos un impulso en la confianza de la directiva y la popularidad de la afición!",
    simLossDesc: "⚠️ Derrota calculada. Los oponentes leyeron mejor las sutilezas estructurales del parche actual en contra de nuestra alineación. ¡Revisa el entrenamiento de la química en el panel de Jugadores!",
    noMatchesScheduled: "No hay partidos programados para esta semana de descanso. ¡Listo para comenzar el Split!",
    advanceWeek1: "Avanzar a la Semana 1",
    roundCompleted: "RONDA COMPLETADA",
    weekCompletedDesc: "Todas las obligaciones y enfrentamientos de esta semana han finalizado. ¡Avanza la semana para cobrar el dinero de los patrocinadores, aplicar parches y hacer evolucionar a tu equipo!",
    advanceWeekBtn: "AVANZAR SEMANA",
    weeklySchedule: "Agenda de la Semana",
    monTue: "Lun - Mar",
    scrimsDesc: "Scrims Tácticas y Resúmenes de VODs",
    wedThu: "Mié - Jue",
    restDesc: "Preparación Física y Descanso Mental",
    sunday: "DOMINGO",
    clasicoVsPain: "El Clásico contra paiN Gaming",
    against: "Enfrentamiento contra",
    viewFullSchedule: "Ver Programación Completa →",
    standingsLabel: "CLASIFICACIÓN",
    viewFullStandings: "Ver Tabla Completa →",
    financialHealth: "Salud Financiera",
    availableBudget: "Caja Disponible",
    currentExpense: "Gasto Corriente",
    netWeeklyRevenue: "Ingresos Netos",
    estimatedRunway: "Runway Estimada",
    weeksUnit: "Semanas",
    accessFinancials: "Acceder a Operaciones Financieras →",
    summonersPatch: "Parche de Summoner's Rift",
    tacticalGain: "+4 TÁTICO:",
    tacticalLoss: "-4 TÁTICO:",
    analyzeMeta: "Análisis del Meta Completo →",
    pressRoomBadge: "SALA DE PRENSA",
    pressVibeFeedback: "¡Tus respuestas influyeron en el prestigio del equipo y en las opiniones tácticas en las redes sociales!",
    feedXTitle: "REDE SOCIAL: FEED DO X (TWITTER)",
    goToComunidade: "IR A LA COMUNIDAD COMPLETA →",
    pressRoomPortalTitle: "SALA DE PRENSA (PORTAL DE NOTICIAS)",
    trackPressRoom: "SEGUIR SALA DE PRENSA INTEGRADA →",
    jsonPayloadTitle: "DATOS INTERACTIVOS DEL DATA ENGINE",
    apiSimTerminal: "CONSOLE DE PREVIEW DE BASE DE DATOS LOCAL",
    exibirPayload: "MOSTRAR PAYLOAD",
    ocultarPayload: "OCULTAR PAYLOAD",
    apiDesc: "Red de integración directa a la base de datos y archivos de saves con autoguardado (.json/.db). Muestra actualizaciones de ranking y feeds en tiempo real.",
  }
};

interface DashboardTabProps {
  gameState: GameState;
  onNextWeek: () => void;
  onSelectTab: (tab: string) => void;
  onAnswerInterview: (question: InterviewQuestion, optionIndex: number) => void;
  theme?: 'light' | 'dark';
  onInstantSimulate?: (blueScore: number, redScore: number, logs: any[]) => void;
}

export default function DashboardTab({
  gameState,
  onNextWeek,
  onSelectTab,
  onAnswerInterview,
  theme,
  onInstantSimulate
}: DashboardTabProps) {
  // Determine active theme dynamically (monitors both local prop and settings object)
  const settingsTheme = (gameState as any).settings?.theme;
  const isDark = !(theme === 'light' || settingsTheme === 'light_mode' || settingsTheme === 'light');

  // State to track language
  const [langState, setLangState] = useState<'pt' | 'es' | 'en'>(() => {
    const saved = localStorage.getItem('legendshub_lang');
    if (saved === 'es' || saved === 'en' || saved === 'pt') {
      return saved as 'pt' | 'es' | 'en';
    }
    return 'pt';
  });

  // Sync with localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('legendshub_lang');
      if (saved && saved !== langState && (saved === 'pt' || saved === 'en' || saved === 'es')) {
        setLangState(saved as 'pt' | 'es' | 'en');
      }
    }, 1050);
    return () => clearInterval(interval);
  }, [langState]);

  // Determine active language dynamically
  const settingsLang = (gameState as any).settings?.language;
  const lang: 'pt' | 'es' | 'en' = (() => {
    if (settingsLang) {
      const lower = settingsLang.toLowerCase();
      if (lower.startsWith('pt')) return 'pt';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
    return langState;
  })();

  const t = TRANSLATIONS[lang];

  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [showManagerGuide, setShowManagerGuide] = useState(() => {
    return localStorage.getItem('legendshub_guided_seen') !== 'true';
  });
  
  const getS = () => {
    return {
      bgPage: isDark ? 'space-y-6 font-sans bg-slate-950 select-none text-slate-100 p-0' : 'space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800 p-0',
      bgCard: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-white hover:border-[#2a3f5f] transition-all' : 'bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-slate-800 hover:border-slate-300 transition-all',
      bgCardNoFlex: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800',
      bgCardNoFlexP6: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-800',
      textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
      textMain: isDark ? 'text-white' : 'text-slate-800',
      bgInner: isDark ? 'bg-[#070d19]/85 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-100',
      divider: isDark ? 'divide-[#1e2d44]/50' : 'divide-slate-200/50',
      borderLine: isDark ? 'border-[#1e2d44]/50' : 'border-slate-100',
      textWhiteOrSlate: isDark ? 'text-white' : 'text-slate-800',
    };
  };
  const s = getS();

  const { week, stage, season, teams, playerTeamId, currentPatch, roundsPlayedThisWeek } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId) || teams[0];
  const activeRegion = playerTeam.region || 'CBLOL';
  
  const [activeInterview, setActiveInterview] = useState<InterviewQuestion | null>(
    week % 3 === 0 ? INTERVIEW_QUESTIONS[week % INTERVIEW_QUESTIONS.length] : null
  );
  const [interviewAnswered, setInterviewAnswered] = useState(false);
  const [newsFeedCount, setNewsFeedCount] = useState(3);
  const [showSimResult, setShowSimResult] = useState<{
    visible: boolean;
    blueScore: number;
    redScore: number;
    playerWon: boolean;
    opponentName: string;
  } | null>(null);

  const currentRoundMatches = gameState.calendarSchedule[week];
  const playerNextOpponentMatch = currentRoundMatches?.find(
    m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId
  );

  let opponentTeamObj: Team | null = null;
  if (playerNextOpponentMatch) {
    const oppId = playerNextOpponentMatch.teamBlueId === playerTeamId 
      ? playerNextOpponentMatch.teamRedId 
      : playerNextOpponentMatch.teamBlueId;
    opponentTeamObj = teams.find(t => t.id === oppId) || null;
  }

  // Dynamics metrics / Financial Health values
  const sponsorIncome = playerTeam.sponsors?.reduce((acc, s) => acc + s.incomePerWeek, 0) || 0;
  const merchIncome = (playerTeam.popularity || 0) * 1500;
  const athleteCosts = [...(playerTeam.roster || []), ...(playerTeam.substitutes || [])].reduce((acc, p) => acc + p.salary / 24, 0);
  const operatingCosts = ((playerTeam.infrastructure?.gamingHouseLevel || 1) * 8000) + 
                         ((playerTeam.infrastructure?.trainingCenterLevel || 1) * 6000) +
                         ((playerTeam.infrastructure?.mediaTeamLevel || 1) * 4000);
  const staffCosts = (gameState.availableStaff?.filter(s => s.hired) || []).reduce((acc, s) => acc + s.salary, 0);
  
  const weeklyExpense = athleteCosts + operatingCosts + staffCosts;
  const weeklyRevenue = sponsorIncome + merchIncome;
  const netWeekly = weeklyRevenue - weeklyExpense;
  const runwayWeeks = weeklyExpense > 0 ? Math.floor(playerTeam.budget / weeklyExpense) : 99;

  // Standings Mini Table sorting
  const sortedStandings = [...gameState.teams]
    .filter(t => {
      const pReg = playerTeam.region || 'CBLOL';
      const tReg = t.region || 'CBLOL';
      return tReg === pReg;
    })
    .sort((a, b) => b.wins - a.wins || b.points - a.points || b.name.localeCompare(a.name))
    .slice(0, 4);

  // Instant simulator computation loop handler
  const handleTriggerInstantSim = () => {
    if (!playerNextOpponentMatch || roundsPlayedThisWeek || !opponentTeamObj) return;

    // Weights computed based on roster quality ratings
    const powerPlayer = playerTeam.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;
    const powerOpponent = opponentTeamObj.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;

    const tiltPlayer = Math.random() * 5 + (100 - playerTeam.boardTrust) * 0.05;
    const tiltOpponent = Math.random() * 5 + (100 - opponentTeamObj.boardTrust) * 0.05;

    const scorePlayerToWin = powerPlayer - tiltPlayer;
    const scoreOpponentToWin = powerOpponent - tiltOpponent;

    let scorePlayer = 0;
    let scoreOpponent = 0;

    while (scorePlayer < 2 && scoreOpponent < 2) {
      if (Math.random() * scorePlayerToWin > Math.random() * scoreOpponentToWin) {
        scorePlayer++;
      } else {
        scoreOpponent++;
      }
    }

    const isPlayerBlue = playerNextOpponentMatch.teamBlueId === playerTeam.id;
    const finalBlueScore = isPlayerBlue ? scorePlayer : scoreOpponent;
    const finalRedScore = isPlayerBlue ? scoreOpponent : scorePlayer;
    
    const playerWon = scorePlayer > scoreOpponent;

    // Call state engine updater
    if (onInstantSimulate) {
      onInstantSimulate(finalBlueScore, finalRedScore, []);
    }

    // Set internal state to render the complete gratificative card
    setShowSimResult({
      visible: true,
      blueScore: finalBlueScore,
      redScore: finalRedScore,
      playerWon,
      opponentName: opponentTeamObj.name
    });
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (!activeInterview) return;
    onAnswerInterview(activeInterview, optionIndex);
    setInterviewAnswered(true);
    setTimeout(() => {
      setActiveInterview(null);
      setInterviewAnswered(false);
    }, 3800);
  };
  const proceduralTweets = [
    {
      id: "tw_baiano",
      username: "Baiano",
      handle: "@baianolol1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/baianolol1.png",
      content: {
        pt: `O clássico ${playerTeam.name} contra paiN nessa rodada nesta semana vai parar o cenário competitivo de eSports! Disputa acirradíssima pelo topo da liga. Quem perder vai aguentar sarro da torcida rival. Qual seu palpite? 🔥`,
        en: `The classic match of ${playerTeam.name} vs paiN this week will stop the competitive eSports scene! Extremely fierce battle for the top of the league. Whoever loses will be mocked by the rival fans. What is your guess? 🔥`,
        es: `¡El partido clásico de ${playerTeam.name} contra paiN esta semana detendrá la escena competitiva de los eSports! Batalla extremadamente feroz por la cima de la liga. El que pierda será objeto de burlas por parte de la afición rival. ¿Cuál es tu pronóstico? 🔥`
      }[lang],
      likes: 8520,
      retweets: 3200,
      timeAgo: { pt: "23 min atrás", en: "23 min ago", es: "hace 23 min" }[lang]
    },
    {
      id: "tw_brtt",
      username: "Felipe brtt",
      handle: "@brttOficial",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/brttOficial.png",
      content: {
        pt: `${playerTeam.name} contra paiN nos palcos... se vacilarem na fase de rotas ou errarem o pick de escala do patch, já era. Esse duelo de liderança vai ser decidido nos detalhes técnicos! 👊`,
        en: `${playerTeam.name} vs paiN on stage... if they slip up in laning phase or pick the wrong scaling champ for the patch, it's over. This leadership duel will be decided on technical details! 👊`,
        es: `${playerTeam.name} contra paiN en el escenario... si flaquean en la fase de líneas o eligen al campeón equivocado para el parche, se acabó. ¡Este duelo por el liderato se decidirá en los detalles técnicos! 👊`
      }[lang],
      likes: 9340,
      retweets: 4100,
      timeAgo: { pt: "45 min atrás", en: "45 min ago", es: "hace 45 min" }[lang]
    },
    {
      id: "tw_smurfdomuca",
      username: "Muca Esports",
      handle: "@smurfdomuca",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/smurfdomuca.png",
      content: {
        pt: "Clima tenso total! Bull negociando renovação e o YoungJae descontente com treinos exaustivos coletivos. Coach e manager vão ter que operar milagre pra manter o vestiário alinhado essa semana.",
        en: "Total tense atmosphere! Bull negotiating renewal and YoungJae unhappy with exhaustive collective training. Coach and manager will have to work a miracle to keep the locker room aligned this week.",
        es: "¡Clima totalmente tenso! Bull negociando renovación y YoungJae descontento con los entrenamientos colectivos. El entrenador y el mánager tendrán que hacer milagros para mantener el vestuario alineado esta semana."
      }[lang],
      likes: 3820,
      retweets: 740,
      timeAgo: { pt: "1h atrás", en: "1h ago", es: "hace 1h" }[lang]
    },
    {
      id: "tw_ranger",
      username: "Ranger",
      handle: "@rangerlol1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/rangerlol1.png",
      content: {
        pt: `Análise fria: ${playerTeam.name} (${playerTeam.wins}-${playerTeam.losses}) está demonstrando ótimas transições de macro, mas a paiN chega embalada. Jogo chave pra ver quem é o verdadeiro líder de ritmo.`,
        en: `Cold review: ${playerTeam.name} (${playerTeam.wins}-${playerTeam.losses}) is showing great macro transitions, but paiN arrives on fire. Key game to see who is the true rhythm leader.`,
        es: `Análisis frío: ${playerTeam.name} (${playerTeam.wins}-${playerTeam.losses}) está demostrando excelentes transiciones macro, pero paiN llega encendida. Partido clave para ver quién es el verdadero líder de ritmo.`
      }[lang],
      likes: 5690,
      retweets: 1250,
      timeAgo: { pt: "2h atrás", en: "2h ago", es: "hace 2h" }[lang]
    },
    {
      id: "tw_peterjordan",
      username: "Peter Jordan",
      handle: "@peterjordan",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/peterjordan.png",
      content: {
        pt: "Drakos botando uma proposta de patrocínio gigante na mesa e o manager decidindo. O competitivo de eSports brasileiro subiu de patamar absoluto em economia financeira! 🚀",
        en: "Drakos putting a huge sponsorship offer on the table and the manager deciding. Competitive esports has reached an absolute next level in financial economics! 🚀",
        es: "Drakos poniendo una gran oferta de patrocinio sobre la mesa y el mánager decidiendo. ¡El competitivo de los esports ha alcanzado un nivel absoluto en economía financiera! 🚀"
      }[lang],
      likes: 12800,
      retweets: 4500,
      timeAgo: { pt: "3h atrás", en: "3h ago", es: "hace 3h" }[lang]
    },
    {
      id: "tw_fan_1",
      username: "Mateus Silva Esports",
      handle: "@esport_fanatic",
      verified: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "PROCEDURAL" as const,
      profile_image_url: "/assets/profiles/fans/fan_avatar_5.png",
      content: {
        pt: "Se perdermos o Bull e não contratarmos um Atirador peso-pesado essa semana, o split tá completamente comprometido. Manager precisa acordar rápido!",
        en: "If we lose Bull and don't sign a heavyweight ADC this week, our split is completely compromised. Manager needs to wake up fast!",
        es: "Si perdemos a Bull y no firmamos un tirador de peso pesado esta semana, el split estará completamente comprometido. ¡El mánager necesita despertar rápido!"
      }[lang],
      likes: 1420,
      retweets: 305,
      timeAgo: { pt: "3h atrás", en: "3h ago", es: "hace 3h" }[lang]
    },
    {
      id: "tw_fan_2",
      username: "Rafaela Mendes",
      handle: "@rafalol99",
      verified: false,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "PROCEDURAL" as const,
      profile_image_url: "/assets/profiles/fans/fan_avatar_18.png",
      content: {
        pt: `Drakos como novo patrocinador seria incrível para a infraestrutura dos treinos, bora assinar logo essa proposta comercial @${playerTeam.name}!`,
        en: `Drakos as direct sponsor would be amazing for gaming training, let's sign this commercial offer instantly @${playerTeam.name}!`,
        es: `¡Drakos como patrocinador sería increíble para la infraestructura de entrenamiento, firmemos ya esa oferta comercial @${playerTeam.name}!`
      }[lang],
      likes: 2150,
      retweets: 490,
      timeAgo: { pt: "4h atrás", en: "4h ago", es: "hace 4h" }[lang]
    },
    {
      id: "tw_dynquedo",
      username: "dynquedo",
      handle: "@dynquedo1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/dynquedo1.png",
      content: {
        pt: "Foco total na preparação técnica desta rodada. Respeitamos muito o adversário, mas vamos com tudo buscar essa vitória no clássico pra nossa torcida maravilhosa!",
        en: "Total focus on technical preparation for this round. We respect our opponent, but we are going all out to conquer this victory for our wonderful fanbase!",
        es: "Foco total en la preparación técnica de esta ronda. Respetamos mucho a nuestro oponente, ¡pero vamos con todo para lograr esta victoria para nuestra maravillosa afición!"
      }[lang],
      likes: 7200,
      retweets: 1850,
      timeAgo: { pt: "5h atrás", en: "5h ago", es: "hace 5h" }[lang]
    }
  ];

  const pressArticles = [
    {
      id: "art_1",
      outlet: "ESPN Esports",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/espn.png",
      headline: {
        pt: `Drakos anuncia proposta de cooperação comercial bilionária para ${playerTeam.name}`,
        en: `Drakos announces multi-million commercial cooperation proposal for ${playerTeam.name}`,
        es: `Drakos anuncia propuesta de cooperación comercial millonaria para ${playerTeam.name}`
      }[lang],
      commentary: {
        pt: "A marca Drakos pretende injetar verbas expressivas para estampar seu logotipo em canais oficiais e camisetas da organização. A diretoria já sinalizou aprovação, restando a validação final do manager da Gaming House.",
        en: "The Drakos brand intends to inject significant weekly budgets to stamp its logo on official channels and jerseys. The board signaled approval, pending matching manager signature.",
        es: "La marca Drakos pretende inyectar importantes fondos semanales para estampar su logotipo en los canales oficiales y camisetas. La directiva ya aprobó, quedando la validación del mánager."
      }[lang],
      impact: { diretoria: 10, torcida: 5 },
      kpis: ["+10 DIRETORIA", "+5 TORCIDA"]
    },
    {
      id: "art_2",
      outlet: "Mais Esports",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/mais_esports.png",
      headline: {
        pt: `Crise na LOUD? YoungJae relata exaustão física por cargas excessivas de treino`,
        en: `Tension at esports camp? YoungJae reports raw fatigue from heavy training schedules`,
        es: `¿Crisis en el equipo? YoungJae reporta cansancio extremo por altas cargas de entrenamiento`
      }[lang],
      commentary: {
        pt: "Questões de bem-estar na gaming house vêm à tona. Relatos sugerem desgaste e desconforto extremo de YoungJae sobre a atual rotina de preparação, ligando sinal de atenção para a química com o time.",
        en: "Health complaints in the gaming house surfaced. Reports suggest exhaustion and discomfort of YoungJae regarding current routines, raising warning signals for overall chemistry.",
        es: "Surgen quejas de bienestar en la gaming house. Los informes sugerirían agotamiento y descontento de YoungJae respecto a la rutina de preparación, lo que enciende alarmas de química."
      }[lang],
      impact: { vestiario: -10, imprensa: 5 },
      kpis: ["-10 VESTIÁRIO", "+5 IMPRENSA"]
    },
    {
      id: "art_3",
      outlet: "Ilha das Lendas",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/ilha_das_lendas.png",
      headline: {
        pt: "Impasse contratual com Bull acende alerta de perda de joia do CBLOL",
        en: "Contract dispute with Bull raises concerns of losing the superstar botlaner",
        es: "Impasse contractual con Bull enciende las alarmas de perder a la estrella de la botlane"
      }[lang],
      commentary: {
        pt: "Apenas 2 semanas restantes no contrato oficial do atirador Bull. Empresários já admitem propostas externas vigorosas de rivais diretos de tabela, exigindo ação ágil no painel de pessoal da organização.",
        en: "Only 2 weeks remain on Bull's official starting contract. Representatives already receive vigorous target offers from direct table contenders, demanding agile action.",
        es: "Con solo 2 semanas de contrato oficial para Bull, agentes de mercado ya admiten ofertas externas vigorosas de rivales directos de tabla, exigiendo acción de renovación inmediata."
      }[lang],
      impact: { diretoria: -5, vestiario: -5 },
      kpis: ["-5 DIRETORIA", "-5 VESTIÁRIO"]
    },
    {
      id: "art_4",
      outlet: "Riot Games",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/riot_games.png",
      headline: {
        pt: "Novas notas de patch de Summoner's Rift trazem buffs pesados para lutadores",
        en: "New Summoner's Rift patch changes declare substantial buffs for fighters",
        es: "Nuevas notas de parche de Summoner's Rift traen buffs masivos para los luchadores"
      }[lang],
      commentary: {
        pt: "Riot Games decreta a ascensão dos bruisers. Atiradores com escalada longa sofrem abalos táticos pesados baseados em velocidade tática e invasão de selva rápida.",
        en: "Riot Games declares the era of fighters. Long-scaling ADCs suffer heavy tactical blows due to speed dynamics and fast jungle invasions.",
        es: "Riot Games declara la era de los bruisers. Los tiradores de escalado largo sufren duros golpes tácticos debido a la velocidad de juego y las invasiones de jungla."
      }[lang],
      impact: { imprensa: 10 },
      kpis: ["+10 IMPRENSA"]
    },
    {
      id: "art_5",
      outlet: "Summoners News",
      outlet_logo_type: "PROCEDURAL" as const,
      outlet_logo_url: "/assets/press/procedural/blog_logo_1.png",
      headline: {
        pt: "A corrida pelo MVP regional: Quem desponta como favorito?",
        en: "The race for regional MVP: Who stands out as favorite?",
        es: "La carrera por el MVP regional: ¿Quién se destaca como favorito?"
      }[lang],
      commentary: {
        pt: "Com apenas algumas rodadas jogadas, analistas e o público debatem intensamente quem carregará o título da temporada de eSports.",
        en: "With only a few rounds played, analysts and the audience debate intensely who will carry the championship title.",
        es: "Con solo unas pocas rondas jugadas, los analistas y la audiencia debaten intensamente quién se llevará el título del campeonato."
      }[lang],
      impact: { imprensa: 5 },
      kpis: ["+5 IMPRENSA"]
    }
  ];

  // Dynamic system metrics to pass onto the terminal database system console
  const liveJsonResponse = {
    theme_active: isDark ? "DARK_MODE" : "LIGHT_MODE",
    settings: {
      idioma_ativo: lang.toUpperCase(),
      salvamento_automatico: "ATIVADO",
      arquivo_alvo: "database_master_save.db"
    },
    modulo_rede_social_feed_x: {
      titulo_modulo: "REDE SOCIAL: FEED DO X (TWITTER)",
      efeito_transicao: "vertical_infinite_loop_scroll",
      visual_padrao: "GAMING_HOUSE_THEME",
      publicacoes: proceduralTweets.map(pt => ({
        usuario: pt.username,
        arroba: pt.handle,
        conteudo: pt.content,
        likes: pt.likes,
        retweets: pt.retweets,
        tempo: pt.timeAgo
      }))
    },
    modulo_sala_de_imprensa: {
      titulo_modulo: "SALA DE IMPRENSA (PORTAL DE NOTÍCIAS)",
      efeito_transicao: "vertical_infinite_loop_scroll",
      publicacoes: pressArticles.map(pa => ({
        fonte: pa.outlet,
        noticia: pa.headline,
        opiniao_analistas: pa.commentary,
        kpis_modificados: pa.kpis
      }))
    },
    secao_liga_classificacao: {
      titulo_card: `${t.standingsLabel} ${activeRegion}`,
      dados_persistidos: sortedStandings.map((tItem, idx) => ({
        rank: idx + 1,
        time: tItem.name,
        vitorias: tItem.wins,
        derrotas: tItem.losses,
        sigla: tItem.acronym
      }))
    }
  };

  return (
    <div className={s.bgPage}>
      
      {/* 1. HEADER & ALERTS HUD TRAY */}
      <div className="space-y-4">
        {/* News Ticker */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 overflow-hidden ${
          isDark ? 'bg-[#000d1a] border-[#1e2d44]' : 'bg-blue-50/60 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-600 rounded text-white text-[10px] font-black uppercase tracking-wider shrink-0 animate-pulse">
            <Radio className="w-3.5 h-3.5" /> {t.urgent}
          </div>
          <div className="text-xs font-bold truncate leading-none">
            <span className={s.textMuted}>{t.newsTickerLabel}</span>
            <span className={s.textWhiteOrSlate}>
              {lang === 'pt' && `${playerTeam.name} (${playerTeam.wins}V-${playerTeam.losses}D) e paiN Gaming duelam no El Clásico valendo a liderança isolada. Bull tem 2 semanas de contrato restante, nova proposta Drakos disponível!`}
              {lang === 'en' && `${playerTeam.name} (${playerTeam.wins}W-${playerTeam.losses}L) and paiN Gaming duel for the crown at El Clásico. Bull has only 2 weeks left on contract! Drakos offer ready.`}
              {lang === 'es' && `${playerTeam.name} (${playerTeam.wins}V-${playerTeam.losses}D) y paiN Gaming se enfrentan en El Clásico por el liderato. ¡A Bull le quedan 2 semanas de contrato! Drakos disponible.`}
            </span>
          </div>
        </div>

        {/* Urgent Critical Alerts Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contracts Alert */}
          <div 
            onClick={() => onSelectTab('Jogadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-amber-950/15 border-amber-500/20 hover:border-amber-500/40' : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-amber-600">{t.playerAlert}</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>{t.bullExpiring}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {t.bullExpiringDesc}
            </p>
          </div>

          {/* Sponsors Alert */}
          <div 
            onClick={() => onSelectTab('Patrocinadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-emerald-950/15 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-emerald-600">{t.commercialProposal}</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>{t.sponsorDrakos}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {t.sponsorDrakosDesc}
            </p>
          </div>

          {/* Dissatisfaction/Training Alert */}
          <div 
            onClick={() => onSelectTab('Jogadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-rose-950/15 border-rose-500/20 hover:border-rose-500/40' : 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-rose-600">{t.fatigueLocker}</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>{t.youngjaeInsatisfeito}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              {t.youngjaeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE KPI CARDS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Timeline Indicator Card */}
        <div className={s.bgCard}>
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Calendar className={`w-12 h-12 ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>{t.season} {season}</p>
            <h2 className={`font-display ${isDark ? 'text-sky-400' : 'text-blue-600'} text-2xl font-black mt-1`}>{t.weekLabel} {week}</h2>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2 py-0.5 ${isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'} font-mono text-[9px] rounded font-extrabold uppercase`}>
              {t.transfers}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Board Trust - Clickable, redirect to Escritório */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Escritório')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>{t.boardTrust}</p>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
            </div>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1`}>{playerTeam.boardTrust}%</h2>
          </div>
          <div className="mt-4">
            <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${playerTeam.boardTrust}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-400">
              <span>Status: {t.statusExcelent}</span>
              <span>{t.routingOffice}</span>
            </div>
          </div>
        </div>

        {/* Popular Support - Clickable, redirect to Comunidade */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Comunidade')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>{t.popularSupport}</p>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
            </div>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1`}>{playerTeam.fansSupport}%</h2>
          </div>
          <div className="mt-4">
            <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${playerTeam.fansSupport}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-400">
              <span>{t.engagedFans}</span>
              <span>{t.routingCommunity}</span>
            </div>
          </div>
        </div>

        {/* Team Chemistry - Clickable, redirect to Jogadores */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Jogadores')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>{t.teamChemistry}</p>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-pink-500" />
            </div>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1 text-ellipsis whitespace-nowrap overflow-hidden`}>
              {Math.round(playerTeam.roster.reduce((a, b) => a + b.chemistry, 0) / 5)}%
            </h2>
          </div>
          <div className="mt-4">
            <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-pink-500 transition-all duration-500"
                style={{ width: `${Math.round(playerTeam.roster.reduce((a, b) => a + b.chemistry, 0) / 5)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-400">
              <span>{t.lockerStable}</span>
              <span>{t.routingPlayers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Match progression, Schedule, League Standings, finances (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 3. MATCH SIMULATION & ACTION TRIGGERS CARD */}
          <div className={s.bgCardNoFlexP6}>
            <div className={`flex justify-between items-center mb-5 border-b ${s.borderLine} pb-4`}>
              <div>
                <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${s.textWhiteOrSlate}`}>
                  {t.nextChallenge}
                </h3>
                <p className={`text-[10px] ${s.textMuted} font-medium`}>{t.groupStage}</p>
              </div>
              <span className="bg-pink-50 text-pink-600 border border-pink-100 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded uppercase tracking-wider leading-none">
                {stage === 'SPLIT_PLAYOFFS' ? t.playoffFinals : `${t.roundLabel} ${week}`}
              </span>
            </div>

            {opponentTeamObj ? (
              <div className="py-6">
                <div className="grid grid-cols-3 items-center">
                  {/* Home Player Team */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-slate-900 border-emerald-500' : 'bg-slate-50 border-emerald-600'} border-2 flex items-center justify-center font-bold text-xl relative shadow-md`}>
                      <Shield className={`w-7 h-7 text-emerald-500`} />
                    </div>
                    <p className={`font-display text-xs font-bold ${s.textWhiteOrSlate} uppercase mt-3 tracking-wider leading-tight max-w-[120px] truncate`}>
                      {playerTeam.name}
                    </p>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-extrabold mt-1">
                      {playerTeam.wins}{lang === 'en' ? 'W' : 'V'} - {playerTeam.losses}{lang === 'en' ? 'L' : 'D'}
                    </p>
                  </div>

                  {/* VS Middle Hub */}
                  <div className="flex flex-col items-center">
                    <div className={`px-5 py-2.5 ${isDark ? 'bg-[#040914] border-slate-700 text-sky-400' : 'bg-slate-50 border-slate-200 text-blue-800'} border font-mono text-xs font-black tracking-widest rounded-lg`}>
                      VS
                    </div>
                    
                    {/* Two Simulation Pathways */}
                    <div className="flex flex-col gap-2 w-full mt-5 max-w-[170px]">
                      {roundsPlayedThisWeek ? (
                        <div className="text-center bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase font-mono py-2 rounded border border-emerald-150">
                          {t.seriesResolved}
                        </div>
                      ) : (
                        <>
                          {/* Pathway 1: Instant Simulation */}
                          <button
                            onClick={handleTriggerInstantSim}
                            className="bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all text-[9.5px] font-bold uppercase tracking-wider py-2 px-3 rounded-md cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {t.instantSimulate}
                          </button>

                          {/* Pathway 2: Picks and Bans/Draft Center */}
                          <button
                            onClick={() => onSelectTab('Match Center')}
                            className="bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all text-[9.5px] font-bold uppercase tracking-wider py-2  px-3 rounded-md cursor-pointer flex items-center justify-center gap-1 shadow-md"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {t.startDraft}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Away Opponent Team */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl relative shadow-md"
                         style={{ borderColor: opponentTeamObj.primaryColor, backgroundColor: isDark ? '#060f1e' : '#f8fafc' }}>
                      <Shield className="w-7 h-7" style={{ color: opponentTeamObj.primaryColor }} />
                    </div>
                    <p className={`font-display text-xs font-bold ${s.textWhiteOrSlate} mt-3 tracking-wider max-w-[120px] truncate uppercase`}>
                      {opponentTeamObj.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-extrabold mt-1"
                       style={{ color: opponentTeamObj.primaryColor }}>
                      {opponentTeamObj.wins}{lang === 'en' ? 'W' : 'V'} - {opponentTeamObj.losses}{lang === 'en' ? 'L' : 'D'}
                    </p>
                  </div>
                </div>

                {/* Subtext explaining standard layout */}
                <p className={`text-[10.5px] text-center ${s.textMuted} font-medium mt-6 leading-normal`}>
                  {t.simNote}
                </p>
              </div>
            ) : (
              <div className={`text-center py-10 ${s.textMuted} text-xs font-semibold uppercase tracking-widest flex flex-col items-center gap-4 justify-center`}>
                <span>{t.noMatchesScheduled}</span>
                <button
                  onClick={onNextWeek}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-display text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  {t.advanceWeek1}
                </button>
              </div>
            )}

            {/* Simulated match success scoreboard banner */}
            {showSimResult?.visible && (
              <div className="mt-4 p-5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 animate-fade-in space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">{t.simResultTitle}</p>
                  </div>
                  <button 
                    onClick={() => setShowSimResult(null)}
                    className="text-emerald-700 hover:text-emerald-950 font-mono text-[10px] font-bold uppercase cursor-pointer"
                  >
                    {t.close}
                  </button>
                </div>
                <div className="grid grid-cols-3 items-center text-center py-1 bg-black/10 rounded-lg">
                  <span className="font-bold text-xs text-emerald-500">{playerTeam.acronym}</span>
                  <span className="font-mono font-black text-sm text-white">
                    {showSimResult.blueScore} - {showSimResult.redScore}
                  </span>
                  <span className="font-bold text-xs text-slate-300">{showSimResult.opponentName.substring(0, 8).toUpperCase()}</span>
                </div>
                <p className="text-[11px] text-emerald-600 leading-normal font-medium">
                  {showSimResult.playerWon ? t.simWinDesc : t.simLossDesc}
                </p>
              </div>
            )}

            {/* Advance week quick action banner */}
            {roundsPlayedThisWeek && opponentTeamObj && (
              <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'} animate-fade-in flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">{t.roundCompleted}</p>
                  </div>
                  <p className={`text-xs ${s.textMuted} max-w-xl`}>
                    {t.weekCompletedDesc}
                  </p>
                </div>
                <button
                  onClick={onNextWeek}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer w-full md:w-auto text-center shrink-0 animate-pulse"
                >
                  {t.advanceWeekBtn}
                </button>
              </div>
            )}
          </div>

          {/* 4. OTHER CORE INTEGRATION KPI METRICS (Agenda, Standings, Finance, Meta) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Agenda da Semana - Clicking targets Calendário */}
            <div 
              onClick={() => onSelectTab('Calendário')}
              className={`${s.bgCardNoFlex} cursor-pointer group hover:border-blue-500 transition-all`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-rose-500">
                  <Calendar className="w-4 h-4" />
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">{t.weeklySchedule}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 font-mono font-bold rounded">CALENDÁRIO</span>
              </div>
              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between items-center bg-black/5 dark:bg-black/15 p-2 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.monTue}</span>
                  <span className={s.textWhiteOrSlate}>{t.scrimsDesc}</span>
                </div>
                <div className="flex justify-between items-center bg-black/5 dark:bg-black/15 p-2 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.wedThu}</span>
                  <span className={s.textWhiteOrSlate}>{t.restDesc}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-600/10 p-2 rounded border border-blue-500/20">
                  <span className="text-[10px] uppercase font-black text-rose-500">{t.sunday}</span>
                  <span className="font-bold text-rose-500">{t.clasicoVsPain}</span>
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-3.5 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                {t.viewFullSchedule}
              </p>
            </div>

            {/* League Standings Ranking Overview - Clicking targets Liga */}
            <div 
              onClick={() => onSelectTab('Liga')}
              className={`${s.bgCardNoFlex} cursor-pointer group hover:border-violet-500 transition-all`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-violet-500">
                  <Trophy className="w-4 h-4" />
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">{t.standingsLabel}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-600 font-mono font-bold rounded">LIGA</span>
              </div>
              
              <div className="space-y-2 text-xs font-bold font-mono">
                {sortedStandings.map((tItem, idx) => {
                  const isPlayer = tItem.id === playerTeam.id;
                  const isOpp = opponentTeamObj && tItem.id === opponentTeamObj.id;
                  return (
                    <div 
                      key={tItem.id} 
                      className={`flex justify-between items-center p-1.5 rounded ${
                        isPlayer 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : isOpp
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15'
                            : 'bg-black/5 dark:bg-black/15 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                        <span className={s.textWhiteOrSlate}>{tItem.name}</span>
                      </div>
                      <span className="text-[11px]">{tItem.wins}{lang === 'en' ? 'W' : 'V'} - {tItem.losses}{lang === 'en' ? 'L' : 'D'}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4 uppercase tracking-wider group-hover:text-violet-500 transition-colors">
                {t.viewFullStandings}
              </p>
            </div>

            {/* Financial Health - Clicking targets Escritório */}
            <div 
              onClick={() => onSelectTab('Escritório')}
              className={`${s.bgCardNoFlex} cursor-pointer group hover:border-emerald-500 transition-all`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">{t.financialHealth}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-mono font-bold rounded">ESCRITÓRIO</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 text-xs font-bold font-mono">
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">{t.availableBudget}</p>
                  <p className="text-[13px] text-emerald-500 leading-tight mt-1">
                    {formatMoney(playerTeam.budget)}
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">{t.currentExpense}</p>
                  <p className="text-[13px] text-rose-500 leading-tight mt-1">
                    $ {(weeklyExpense / 1000).toFixed(1)}K / {lang === 'en' ? 'wk' : 'sem'}
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">{t.netWeeklyRevenue}</p>
                  <p className="text-[13px] text-sky-400 leading-tight mt-1">
                    $ {(weeklyRevenue / 1000).toFixed(1)}K / {lang === 'en' ? 'wk' : 'sem'}
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase font-bold text-amber-500">{t.estimatedRunway}</p>
                  <p className="text-[13px] text-amber-500 leading-tight mt-1">
                    {runwayWeeks} {t.weeksUnit}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4.5 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">
                {t.accessFinancials}
              </p>
            </div>

            {/* Game Meta State Card - Clicking targets Meta */}
            <div 
              onClick={() => onSelectTab('Meta')}
              className={`${s.bgCardNoFlex} cursor-pointer group hover:border-amber-500 transition-all`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-amber-500">
                  <Sliders className="w-4 h-4" />
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">{t.summonersPatch}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 font-mono font-bold rounded">META</span>
              </div>
              <p className={`${s.textMuted} text-[11px] font-sans leading-normal mb-3`}>
                {currentPatch.metaDescription.substring(0, 75)}...
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-500 mr-1 shrink-0 font-mono">{t.tacticalGain}</span>
                  {currentPatch.buffedChampions.slice(0, 3).map((cid, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 font-mono text-[9px] font-bold uppercase rounded border border-emerald-500/10">
                      {cid.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-rose-500 mr-1 shrink-0 font-mono">{t.tacticalLoss}</span>
                  {currentPatch.nerfedChampions.slice(0, 3).map((cid, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 font-mono text-[9px] font-bold uppercase rounded border border-rose-500/10">
                      {cid.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                {t.analyzeMeta}
              </p>
            </div>
          </div>

          {/* ACTIVE INTERVIEWS DIGITAL PRESS ROOM CONFERENCE */}
          {activeInterview && (
            <div className={`${s.bgCardNoFlexP6} border-2 border-blue-500/10 shadow-md relative animate-fade-in`}>
              <div className={`absolute top-4 right-4 ${isDark ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'} px-3 py-1 font-mono text-[9px] font-bold rounded uppercase tracking-wider flex items-center gap-1`}>
                <MessageSquare className="w-3 h-3" /> SALA DE IMPRENSA
              </div>
              <p className={`text-[10px] ${s.textMuted} font-extrabold uppercase tracking-widest mb-1.5`}>{activeInterview.context}</p>
              <h4 className={`font-display text-sm ${s.textWhiteOrSlate} font-extrabold leading-relaxed mb-6`}>
                "{activeInterview.question}"
              </h4>

              {interviewAnswered ? (
                <div className={`flex items-center gap-3 ${s.bgInner} rounded-lg p-4 animate-fade-in`}>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                    Suas respostas influenciaram o prestígio da equipe e as opiniões táticas nas redes sociais!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activeInterview.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(i)}
                      className={`w-full ${isDark ? 'bg-slate-900 border-slate-700 hover:bg-sky-950/20 text-slate-300 hover:text-sky-400 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600'} border p-4 rounded-lg text-left text-xs font-bold transition-all block leading-normal cursor-pointer`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CBLOL Twitter Feed & Press Articles (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CBLOL FANS FEED - Mapped to Comunidade */}
          <div className={`${isDark ? 'bg-[#0a1424] border border-[#1e2d44]' : 'bg-white border border-slate-200'} rounded-xl p-5 shadow-sm flex flex-col justify-between h-[510px]`}>
            <div>
              <div 
                onClick={() => onSelectTab('Comunidade')}
                className={`flex justify-between items-center mb-4 pb-3 border-b ${s.borderLine} cursor-pointer group`}
              >
                <h4 className={`font-display text-xs font-black uppercase tracking-wider ${s.textWhiteOrSlate} group-hover:text-blue-500 transition-colors`}>
                  {t.feedXTitle}
                </h4>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>

              {/* Feed lists with influencers specified in instructions */}
              <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
                {proceduralTweets.slice(0, newsFeedCount).map((post) => (
                  <div key={post.id} className={`${isDark ? 'bg-slate-900/60 border-slate-700/60 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300'} border rounded-xl p-4 space-y-2 relative overflow-hidden group transition-all`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-200/50 shrink-0">
                        <img 
                          src={post.profile_image_url} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = post.avatarUrl;
                          }}
                          referrerPolicy="no-referrer" 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 truncate">
                          <p className={`text-[11px] font-extrabold ${s.textWhiteOrSlate} leading-tight truncate`}>{post.username}</p>
                          {post.verified && (
                            <span className="text-[7.5px] bg-blue-500/10 text-blue-500 border border-blue-500/25 rounded px-1 shrink-0 scale-90">✓</span>
                          )}
                        </div>
                        <p className={`text-[9.5px] ${s.textMuted} font-mono tracking-tight`}>{post.handle}</p>
                      </div>
                    </div>
                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-650'} text-xs leading-normal`}>
                      {post.content}
                    </p>
                    <div className={`flex justify-between text-[10px] ${s.textMuted} pt-1.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} font-medium`}>
                      <span>❤️ {post.likes}</span>
                      <span>🔄 {post.retweets}</span>
                      <span className="font-mono">{post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load more news feeds */}
            <div className={`pt-4 border-t ${s.borderLine} flex justify-center`}>
              <button
                onClick={() => onSelectTab('Comunidade')}
                className="text-[10px] text-blue-500 hover:underline uppercase font-bold tracking-widest flex items-center gap-1 cursor-pointer"
              >
                {t.goToComunidade}
              </button>
            </div>
          </div>

          {/* SALA DE IMPRENSA / PRESS ROOM - Mapped to Gaming Office */}
          <div className={`${isDark ? 'bg-[#0a1424] border border-[#1e2d44]' : 'bg-white border border-slate-200'} rounded-xl p-5 shadow-sm flex flex-col justify-between h-[510px]`}>
            <div>
              <div 
                onClick={() => onSelectTab('Gaming Office')}
                className={`flex justify-between items-center mb-4 pb-3 border-b ${s.borderLine} cursor-pointer group`}
              >
                <h4 className={`font-display text-xs font-black uppercase tracking-wider ${s.textWhiteOrSlate} group-hover:text-rose-500 transition-colors`}>
                  {t.pressRoomPortalTitle}
                </h4>
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              </div>

              {/* Feed lists with credentials specified in instructions */}
              <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
                {pressArticles.map((art) => (
                  <div key={art.id} className={`${isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3.5 space-y-2 relative overflow-hidden transition-all`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-200/25">
                          <img 
                            src={art.outlet_logo_url} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-[9px] font-black text-rose-500">${art.outlet[0]}</span>`;
                              }
                            }}
                            referrerPolicy="no-referrer"
                            alt="logo" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase text-rose-500 font-mono tracking-wider">
                          {art.outlet}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {art.kpis.map((k, idx) => (
                          <span key={idx} className={`text-[8.5px] font-extrabold font-mono px-1 py-0.5 rounded leading-none ${
                            k.startsWith('-') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className={`text-[11.5px] font-extrabold leading-snug ${s.textWhiteOrSlate}`}>
                      {art.headline}
                    </p>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-[11px] leading-relaxed italic`}>
                      "{art.commentary}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Load more press feeds */}
            <div className={`pt-4 border-t ${s.borderLine} flex justify-center`}>
              <button
                onClick={() => onSelectTab('Gaming Office')}
                className="text-[10px] text-rose-500 hover:underline uppercase font-bold tracking-widest flex items-center gap-1 cursor-pointer"
              >
                {t.trackPressRoom}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* COLLAPSIBLE DATABASE SAVE SYSTEM PREVIEW & DATA ENGINE INTEGRATED VISUALIZATION */}
      <div className={`mt-8 ${isDark ? 'bg-[#060c14] border border-[#1e2d44]/60' : 'bg-slate-50 border border-slate-200'} rounded-xl p-5 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${s.textWhiteOrSlate}`}>
                {t.jsonPayloadTitle}
              </h4>
              <p className={`text-[10px] ${s.textMuted} font-mono mt-0.5 leading-normal`}>
                {t.apiSimTerminal}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            className={`px-4 py-2 text-[10px] uppercase font-mono font-black tracking-widest rounded-lg border shadow-sm transition-all cursor-pointer ${
              isConsoleExpanded 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 hover:bg-rose-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
            }`}
          >
            {isConsoleExpanded ? t.ocultarPayload : t.exibirPayload}
          </button>
        </div>
        <p className={`text-[11px] ${s.textMuted} mt-3.5 leading-normal max-w-4xl`}>
          {t.apiDesc}
        </p>

        {isConsoleExpanded && (
          <div className="mt-4 animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider">
              <span>STATUS: ONLINE</span>
              <span>DATABASE_REGION: {playerTeam.region}</span>
              <span>LANG_SET: {lang.toUpperCase()}</span>
            </div>
            <pre className={`bg-slate-950/95 text-emerald-400 p-4 rounded-lg overflow-x-auto text-[11px] font-mono border ${isDark ? 'border-slate-800' : 'border-slate-200'} shadow-inner max-h-[350px] leading-relaxed`}>
              {JSON.stringify(liveJsonResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ONBOARDING DIALOG: GUIA DO MANAGER */}
      {showManagerGuide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className={`w-full max-w-2xl border ${isDark ? 'bg-[#0d1627] border-[#1e2d44]' : 'bg-white border-slate-200'} rounded-2xl p-7 shadow-2xl relative overflow-hidden`}>
            {/* Absolute accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-2 border-b border-slate-200/10 pb-4">
              <div className="p-2 bg-blue-600/10 text-cyan-400 rounded-xl">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className={`font-display text-sm font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-850'}`}>
                  {lang === 'es' ? 'GUÍA DEL MANAGER' : lang === 'en' ? 'MANAGER GUIDE' : 'GUIA DO MANAGER'}
                </h3>
                <p className={`text-[9px] uppercase tracking-widest font-mono font-bold text-sky-400`}>
                  {lang === 'es' ? 'Cómo funciona el canavas de eSports' : lang === 'en' ? 'How the eSports canvas works' : 'Como funciona o LegendsHub'}
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin my-5 leading-relaxed text-xs">
              <div className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-900/60 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-200'} flex items-start gap-3`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Dashboard / Central</h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] mt-0.5`}>
                    {lang === 'es' ? 'Navega rápidamente, monitorea orbes de presupuesto, controla la confianza de la directiva y avanza semanas.' :
                     lang === 'en' ? 'Monitor budgets, critical press news, board satisfaction index and advance weekly calendar rounds.' :
                     'Monitore orçamentos de caixa, notícias críticas de imprensa, índice de satisfação da diretoria e avance as semanas de jogo.'}
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-900/60 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-200'} flex items-start gap-3`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {lang === 'es' ? 'Gestionar Elenco' : lang === 'en' ? 'Roster Management' : 'Gerenciar Elenco'}
                  </h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] mt-0.5`}>
                    {lang === 'es' ? 'Administra titulares, promueve canteranos de la academia, arregla entrenamientos de química y renueva contratos expirantes.' :
                     lang === 'en' ? 'Promote talented academy rookies to starters, train role-specific chemistry points and extend expiring player contracts.' :
                     'Troque titulares, promova promessas talentosas da youth list acadêmica, treine habilidades de química e renove contratos expirando.'}
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-900/60 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-200'} flex items-start gap-3`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {lang === 'es' ? 'Transferencias' : lang === 'en' ? 'Transfer Operations' : 'Transferências'}
                  </h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] mt-0.5`}>
                    {lang === 'es' ? 'Incursiona en el mercado global, contrata estrellas libres (Free Agents) y evalúa ofertas automatizadas de la IA.' :
                     lang === 'en' ? 'Negotiate contracts with global Free Agents and evaluate automated buy/sell transfer offers bid by the AI.' :
                     'Contrate astros mundiais do pool de Free Agents e avalie propostas financeiras de compra/venda operadas em background pela IA.'}
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-900/60 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-200'} flex items-start gap-3`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {lang === 'es' ? 'Partidas y Simulación' : lang === 'en' ? 'Matches and Simulation' : 'Partidas e Simulação'}
                  </h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] mt-0.5`}>
                    {lang === 'es' ? 'Dispara drafts interactivos de Picks & Bans con combos táticos contra rivales o simula de forma instantánea.' :
                     lang === 'en' ? 'Play highly tactical Pick & Ban draft runs with champion counters or run automated offline simulations.' :
                     'Lembre-se de disputar drafts altamente táticos de Picks & Bans escolhendo counters ou opte por simulações instantâneas automáticas.'}
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-900/60 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-200'} flex items-start gap-3`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {lang === 'es' ? 'Solo Queue y Scouting' : lang === 'en' ? 'Solo Queue and Scouting' : 'Solo Queue e Scouting'}
                  </h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] mt-0.5`}>
                    {lang === 'es' ? 'Envía scouts alrededor del globo y vigila el ranking de cola solista para anticipar el potencial latente.' :
                     lang === 'en' ? 'Keep a close look on server solo rank and dispatch scouts looking for prospective hidden talents.' :
                     'Monitore o ranking de fila solo do servidor e envie recruiters atrás de promessas ocultas de alto potencial de overall.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/10 flex justify-end">
              <button
                onClick={() => {
                  setShowManagerGuide(false);
                  localStorage.setItem('legendshub_guided_seen', 'true');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-[10.5px] uppercase tracking-widest py-3.5 px-6 rounded-lg cursor-pointer transition-all shadow-md shadow-blue-500/15"
              >
                {lang === 'es' ? '¡ENTENDIDO, VAMOS A JUGAR! →' : lang === 'en' ? "UNDERSTOOD, LET'S PLAY! →" : 'ENTENDI, VAMOS JOGAR! →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Zap, Coffee, Activity, Smile, Users, Info, Sparkles, 
  Check, AlertTriangle, Play, BookOpen, Heart, Award,
  Calendar, ChevronLeft, ChevronRight, Plus, Trash
} from 'lucide-react';
import { GameState, Player, Team } from '../types';
import { formatMoney } from '../utils/currency';

interface GamingHouseTabProps {
  gameState: GameState;
  onUpdateGameState?: (nextState: GameState) => void;
  triggerNotification?: (title: string, desc: string) => void;
  theme?: string;
}

// Translations dictionary for PT, EN, ES
const translations = {
  pt: {
    saldo_caixa: "Saldo de Caixa",
    foco_preparacao_semanal: "Foco de Preparação",
    clima_interno_gh: "Clima Interno GH",
    titulo_principal: "CENTRAL DE TREINAMENTO & ROTINAS (GAMING HOUSE)",
    desc_sub: "Acompanhe e organize a rotina diária dos atletas, alinhe blocos de treinos táticos (Scrims) e zele pela saúde mental de toda a equipe para prevenir Burnout.",
    
    // Scrim types
    scrim_early_game_title: "SIMULAÇÃO DE EARLY GAME (SCRIM ALTA INTENSIDADE)",
    scrim_early_game_desc: "Simulação exaustiva focada nos primeiros 15 minutos de jogo, invasões táticas e controle rigoroso de objetivos neutros.",
    scrim_vods_title: "TREINO TÁTICO / ANÁLISE DE VODS",
    scrim_vods_desc: "Revisão detalhada de gravação de partidas passadas, posicionamento de mapa e teorias de draft de adversários sob demanda.",
    scrim_internal_title: "SCRIM INTERNA (MAIN VS ACADEMY)",
    scrim_internal_desc: "Confronto direto sem custos entre o time principal (Titulares) e nossa equipe de base para alinhar comunicação e testar composições secretas.",

    // Well being actions
    wellbeing_psy_title: "SESSÃO COM PSICÓLOGO DO ESPORTE",
    wellbeing_psy_desc: "Aconselhamento psicológico focado em resiliência sob pressão, controle de ansiedade competitiva e redução do estresse acumulado.",
    wellbeing_rest_title: "DIA DE DESCANSO / LAZER DISPONÍVEL",
    wellbeing_rest_desc: "Folga total na GH. Desliga os computadores e libera saídas. Zera o foco de evolução tática, mas restaura toda a energia do time.",
    wellbeing_teambuilding_title: "TEAM BUILDING (DINÂMICA DE GRUPO)",
    wellbeing_teambuilding_desc: "Atividades colaborativas com dinâmicas de entrosamento fora do escritório para quebrar o gelo e aliviar conflitos de ego.",

    // Resident panel
    resident_title: "PAINEL DE ATLETAS RESIDENTES (PRONTIDÃO)",
    titulares_label: "ELENCO TITULAR (MAIN TEAM)",
    academy_label: "ELENCO DE BASE (ACADEMY TEAM)",
    energia: "Energia/Estamina",
    humor: "Humor/Motivação",
    sinergia: "Entrosamento",
    prontidao: "Prontidão de Jogo",
    status_atleta: "Status",
    status_excelente: "Pronto para o Palco",
    status_esgotado: "Risco de Burnout",
    status_regular: "Desgastado / Médio",

    // Action execution outputs
    btn_aplicar: "EXECUTAR ROTINA",
    btn_aplicado: "PROGRAMADO",
    rotina_ativa: "Rotina Ativa:",
    vazio_ativos: "Nenhum bloco ativado. Selecione uma rotina abaixo.",

    // Data Engine simulation console
    json_payload_title: "MOTOR DE DADOS (DATA ENGINE) • ROTINAS GH",
    api_sim_terminal: "Central do Manager API • Sincronização direta de performance ao banco de dados reativo",
    exibir_payload: "Exibir Payload JSON",
    ocultar_payload: "Ocultar Payload",
    api_desc: "Simulador de integridade de dados e alteração de parâmetros em tempo real. Veja o reflexo instantâneo das ações da Gaming House alterando os atributos do squad no JSON abaixo.",
    selecionar_idioma_teste: "Forçar Idioma JSON:",
    enviar_comando: "MANDAR ESTADO REATIVO",
    sucesso_scrim: "Rotina de treinamento contratada! O elenco praticou intensamente.",
    sucesso_bemestar: "Iniciativa de bem-estar realizada! O moral e a saúde dos atletas foram restabelecidos.",
    lucro: "Gastos de Casa",
    gratis: "GRÁTIS",
    caixa_impacto: "Investimento Requerido:",
    foco_early: "EARLY GAME (INTENSIVO)",
    foco_vods: "MACRO & TEORIA VODS",
    foco_internal: "INTEGRAÇÃO MAIN VS ACADEMY",
    foco_rest: "FOLGA COMPLETA",
    clima_excelente: "Excelente (Harmonia Organizada)",
    clima_regular: "Humores Oscilantes",
    clima_tenso: "Fadiga & Desgaste competitivo",
    copiar: "COPIAR JSON",
    copiado: "Copiado!"
  },
  en: {
    saldo_caixa: "Cash Balance",
    foco_preparacao_semanal: "Preparation Focus",
    clima_interno_gh: "GH Synergy Mood",
    titulo_principal: "TRAINING CENTER & ROUTINES (GAMING HOUSE)",
    desc_sub: "Supervise the daily routines of your athletes, schedule strategic scrim blocks, and prioritize player wellness to proactively mitigate competitive burnout.",
    
    scrim_early_game_title: "EARLY GAME SIMULATION (HIGH INTENSITY SCRIM)",
    scrim_early_game_desc: "Rigorous simulation focusing on the first 15 minutes of the game, jungle invades, and tight neutral objective control.",
    scrim_vods_title: "TACTICAL PRACTICE / VOD REVIEW",
    scrim_vods_desc: "In-depth recording review of prior matches, map positioning errors, and theoretical draft counter-strategies.",
    scrim_internal_title: "INTERNAL SCRIM (MAIN VS ACADEMY)",
    scrim_internal_desc: "A zero-cost simulated scrimmage matching the main roster against our academy base to refine communication and test pocket picks.",

    wellbeing_psy_title: "SESSION WITH SPORTS PSYCHOLOGIST",
    wellbeing_psy_desc: "Strategic mental counseling specializing in competitive resilience, high-stress endurance, and generalized anxiety management.",
    wellbeing_rest_title: "REST DAY / OFF-DUTY ACTIVITIES",
    wellbeing_rest_desc: "Complete rest day at the GH. PCs off and outdoor walks enabled. Overrides tactical evolution buffs but fully replenishes physical energy.",
    wellbeing_teambuilding_title: "TEAM BUILDING (GROUP COHESION)",
    wellbeing_teambuilding_desc: "Fun cooperative group challenges outside the office limits to dissolve ego issues, resolve conflicts, and boost chemistry.",

    resident_title: "RESIDENT ATHLETES HEALTH INDEX",
    titulares_label: "STARTING LINEUP (MAIN TEAM)",
    academy_label: "FUTURES SQUAD (ACADEMY TEAM)",
    energia: "Energy/Stamina",
    humor: "Mood/Motivation",
    sinergia: "Chemistry",
    prontidao: "Game Readiness",
    status_atleta: "Status",
    status_excelente: "Stage Ready",
    status_esgotado: "Burnout Threshold",
    status_regular: "Tired / Neutral",

    btn_aplicar: "ENGAGE ROUTINE",
    btn_aplicado: "SCHEDULED",
    rotina_ativa: "Active Routine:",
    vazio_ativos: "No training block assigned yet. Pitch a routine below.",

    json_payload_title: "CORE DATA ENGINE • GH PERFORMANCE PAYLOAD",
    api_sim_terminal: "Manager Central API • Real-time synchronization of performance index directly to database",
    exibir_payload: "Show JSON Payload",
    ocultar_payload: "Hide Payload",
    api_desc: "Live stream showing structural attributes updates of starting lines and academy ranks based on selected sports psychologist visits, scrim formats, and rest blocks.",
    selecionar_idioma_teste: "Forced Language Parser:",
    enviar_comando: "SUBMIT SIM STATEMENT",
    sucesso_scrim: "Tactical training block engaged successfully! Team attributes updated in DB.",
    sucesso_bemestar: "Well-being milestone checked! Restored mental health indexes of all residents.",
    lucro: "House Expenses",
    gratis: "COMPLIMENTARY",
    caixa_impacto: "Projected Cost:",
    foco_early: "EARLY GAME (INTENSIVE)",
    foco_vods: "MACRO & THEORETICAL VODS",
    foco_internal: "MAIN-ACADEMY INTEGRATION",
    foco_rest: "TOTAL RECREATIONAL LEAVE",
    clima_excelente: "Excellent (Healthy Atmosphere)",
    clima_regular: "Fluctuating Atmospheres",
    clima_tenso: "Stressed / Competitive Fatigue",
    copiar: "COPY JSON",
    copiado: "Copied!"
  },
  en_US: {
    // English alias compatibility
    saldo_caixa: "Cash Balance",
    foco_preparacao_semanal: "Preparation Focus",
    clima_interno_gh: "GH Synergy Mood",
    titulo_principal: "TRAINING CENTER & ROUTINES (GAMING HOUSE)",
    desc_sub: "Supervise the daily routines of your athletes, schedule strategic scrim blocks, and prioritize player wellness to proactively mitigate competitive burnout.",
    scrim_early_game_title: "EARLY GAME SIMULATION (HIGH INTENSITY SCRIM)",
    scrim_early_game_desc: "Rigorous simulation focusing on the first 15 minutes of the game, jungle invades, and tight neutral objective control.",
    scrim_vods_title: "TACTICAL PRACTICE / VOD REVIEW",
    scrim_vods_desc: "In-depth recording review of prior matches, map positioning errors, and theoretical draft counter-strategies.",
    scrim_internal_title: "INTERNAL SCRIM (MAIN VS ACADEMY)",
    scrim_internal_desc: "A zero-cost simulated scrimmage matching the main roster against our academy base to refine communication and test pocket picks.",
    wellbeing_psy_title: "SESSION WITH SPORTS PSYCHOLOGIST",
    wellbeing_psy_desc: "Strategic mental counseling specializing in competitive resilience, high-stress endurance, and generalized anxiety management.",
    wellbeing_rest_title: "REST DAY / OFF-DUTY ACTIVITIES",
    wellbeing_rest_desc: "Complete rest day at the GH. PCs off and outdoor walks enabled. Overrides tactical evolution buffs but fully replenishes physical energy.",
    wellbeing_teambuilding_title: "TEAM BUILDING (GROUP COHESION)",
    wellbeing_teambuilding_desc: "Fun cooperative group challenges outside the office limits to dissolve ego issues, resolve conflicts, and boost chemistry.",
    resident_title: "RESIDENT ATHLETES HEALTH INDEX",
    titulares_label: "STARTING LINEUP (MAIN TEAM)",
    academy_label: "FUTURES SQUAD (ACADEMY TEAM)",
    energia: "Energy/Stamina",
    humor: "Mood/Motivation",
    sinergia: "Chemistry",
    prontidao: "Game Readiness",
    status_atleta: "Status",
    status_excelente: "Stage Ready",
    status_esgotado: "Burnout Threshold",
    status_regular: "Tired / Neutral",
    btn_aplicar: "ENGAGE ROUTINE",
    btn_aplicado: "SCHEDULED",
    rotina_ativa: "Active Routine:",
    vazio_ativos: "No training block assigned yet. Pitch a routine below.",
    json_payload_title: "CORE DATA ENGINE • GH PERFORMANCE PAYLOAD",
    api_sim_terminal: "Manager Central API • Real-time synchronization of performance index directly to database",
    exibir_payload: "Show JSON Payload",
    ocultar_payload: "Hide Payload",
    api_desc: "Live stream showing structural attributes updates of starting lines and academy ranks based on selected sports psychologist visits, scrim formats, and rest blocks.",
    selecionar_idioma_teste: "Forced Language Parser:",
    enviar_comando: "SUBMIT SIM STATEMENT",
    sucesso_scrim: "Tactical training block engaged successfully! Team attributes updated in DB.",
    sucesso_bemestar: "Well-being milestone checked! Restored mental health indexes of all residents.",
    lucro: "House Expenses",
    gratis: "COMPLIMENTARY",
    caixa_impacto: "Projected Cost:",
    foco_early: "EARLY GAME (INTENSIVE)",
    foco_vods: "MACRO & THEORETICAL VODS",
    foco_internal: "MAIN-ACADEMY INTEGRATION",
    foco_rest: "TOTAL RECREATIONAL LEAVE",
    clima_excelente: "Excellent (Healthy Atmosphere)",
    clima_regular: "Fluctuating Atmospheres",
    clima_tenso: "Stressed / Competitive Fatigue",
    copiar: "COPY JSON",
    copiado: "Copied!"
  },
  es: {
    saldo_caixa: "Saldo de Caja",
    foco_preparacao_semanal: "Foco de Preparación",
    clima_interno_gh: "Clima Interno GH",
    titulo_principal: "CENTRAL DE ENTRENAMIENTO & RUTINAS (GAMING HOUSE)",
    desc_sub: "Monitoree y organice la agenda diaria de los ciberatletas, configure bloques de entrenamiento competitivo (Scrims) y optimice la salud moral frente a cuadros de estancamiento competitivo.",
    
    scrim_early_game_title: "SIMULACIÓN DE JUEGO TEMPRANO (SCRIM INTENSO)",
    scrim_early_game_desc: "Configuración rigurosa para entrenar los primeros 15 minutos, invadir jungla rival y asegurar el liderazgo de los primeros dragones.",
    scrim_vods_title: "ENTRENAMIENTO TÁCTICO / REVISIÓN VODS",
    scrim_vods_desc: "Estudio detallado de mapas, análisis concienzudo de derrotas previas y aprendizaje exhaustivo de drafts de oponentes.",
    scrim_internal_title: "SCRIM INTERNO (MAIN CONTRA ACADEMY)",
    scrim_internal_desc: "Simulación de partido directo sin costos salariales entre los titulares y el contingente de cantera para coordinar estilos de juego.",

    wellbeing_psy_title: "SESIÓN CON PSICÓLOGO DEPORTIVO",
    wellbeing_psy_desc: "Atención mental dedicada al tratamiento de la presión extrema, mitigación de estrés por el split y mediación de disputas.",
    wellbeing_rest_title: "DÍA DE RECREACIÓN Y DESCANSO",
    wellbeing_rest_desc: "Día libre absoluto en la villa Gaming House, ordenadores apagados. Se anula la evolución semanal, pero refrigera la energía del plantel.",
    wellbeing_teambuilding_title: "TEAM BUILDING (VALORACIÓN GRUPAL)",
    wellbeing_teambuilding_desc: "Paseos grupales y experiencias al aire libre a fin de limar asperezas de ego, forjar lazos de compañerismo sólidos.",

    resident_title: "ESTADO DE SALUD DE ATLETAS RESIDENTES",
    titulares_label: "ELENCO TITULAR (MAIN TEAM)",
    academy_label: "ELENCO JUVENIL (ACADEMY TEAM)",
    energia: "Fuerza/Estamina",
    humor: "Humor/Motivación",
    sinergia: "Sinergia Grupal",
    prontidao: "Preparación Competitiva",
    status_atleta: "Estado",
    status_excelente: "Listo para Competir",
    status_esgotado: "Sobreentrenado / Fatiga",
    status_regular: "Desgastado Moderado",

    btn_aplicar: "FIRMAR RUTINA",
    btn_aplicado: "ASIGNADO",
    rotina_ativa: "Agenda Actual:",
    vazio_ativos: "Ninguna rotina firmada en la villa. Por favor decida una opción inferior.",

    json_payload_title: "MOTOR DE DATOS CENTRAL • DATA METADATA",
    api_sim_terminal: "Manager Central API • Sincronización reativa y auto-salvado inmediato en base de datos local",
    exibir_payload: "Ver Payload JSON",
    ocultar_payload: "Ocultar Payload",
    api_desc: "Representación interactiva de intercambio de ficheros. Vea el flujo dinámico de energía, sinergia y salud de canteranos y capitanes en tiempo real.",
    selecionar_idioma_teste: "Filtro de Idioma Forzado:",
    enviar_comando: "TRANSMITIR COMANDO JSON",
    sucesso_scrim: "¡Plan de entrenamiento aplicado! Rendimiento deportivo modificado convenientemente.",
    sucesso_bemestar: "¡Bono de bienestar asignado! Resiliencia mental restaurada en todos los residentes.",
    lucro: "Gastos Operativos",
    gratis: "GRATUITO",
    caixa_impacto: "Involucración Económica:",
    foco_early: "EARLY GAME INTENSO",
    foco_vods: "MACRO & REVISIONES VODS",
    foco_internal: "INTEGRACIÓN TITULARES-CANTERA",
    foco_rest: "DESCANSO TOTAL ELECTIVO",
    clima_excelente: "Excelente (Alta Convivencia)",
    clima_regular: "Convivencia Neutra",
    clima_tenso: "Tensión acumulada",
    copiar: "COPIAR JSON",
    copiado: "¡Copiado!"
  }
};

export default function GamingHouseTab({
  gameState,
  onUpdateGameState,
  triggerNotification,
  theme
}: GamingHouseTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  // Setup forced simulation states
  const [forcedLang, setForcedLang] = useState<'pt' | 'en' | 'es' | null>(null);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [consoleCommand, setConsoleCommand] = useState('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // States to keep track of active training and active well being programs for this week mockup cycle
  const [activePracticeId, setActivePracticeId] = useState<string>('scrim_vods');
  const [activeWellbeingId, setActiveWellbeingId] = useState<string>('wellbeing_psy');

  // Interactive Operational Calendar (GH Operations) State Declarations
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    return typeof gameState.currentMonthIndex === 'number'
      ? (gameState.currentMonthIndex % 3)
      : (gameState.week <= 4 ? 0 : gameState.week <= 8 ? 1 : 2);
  });
  const [selectedGHDay, setSelectedGHDay] = useState(() => {
    return gameState.currentDay || (10 + (gameState.week * 2) % 19);
  });
  const [modalPeriod, setModalPeriod] = useState<'MANHÃ' | 'TARDE' | 'NOITE' | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<'scrim' | 'descanso' | 'treino_especifico' | null>(null);
  const [scrimOpponentId, setScrimOpponentId] = useState('');
  const [scrimSearchQuery, setScrimSearchQuery] = useState('');
  const [treinoFoco, setTreinoFoco] = useState<'tatico' | 'macro' | 'mecanica' | 'fisico' | null>(null);

  React.useEffect(() => {
    if (gameState.currentDay) {
      setSelectedGHDay(gameState.currentDay);
    }
    if (typeof gameState.currentMonthIndex === 'number') {
      setSelectedMonthIndex(gameState.currentMonthIndex % 3);
    }
  }, [gameState.currentDay, gameState.currentMonthIndex]);

  const handleSetGHDay = (dayNum: number) => {
    setSelectedGHDay(dayNum);
    if (onUpdateGameState) {
      onUpdateGameState({
        ...gameState,
        currentDay: dayNum,
        currentMonthIndex: selectedMonthIndex
      });
    }
  };

  const handleSetGHMonth = (newIdx: number) => {
    setSelectedMonthIndex(newIdx);
    if (onUpdateGameState) {
      onUpdateGameState({
        ...gameState,
        currentMonthIndex: newIdx
      });
    }
  };

  const months = [
    { name: "MAIO, 2026", startDayOfWeek: 4, daysInMonth: 31 },
    { name: "JUNHO, 2026", startDayOfWeek: 0, daysInMonth: 30 },
    { name: "JULHO, 2026", startDayOfWeek: 2, daysInMonth: 31 }
  ];

  // Dynamically verify if on-road league teams have train availability slots
  const isTeamAvailable = (oppTeam: Team, dayNum: number, pIndex: 'MANHÃ' | 'TARDE' | 'NOITE'): boolean => {
    if (oppTeam.id === playerTeam.id) return false;
    
    // Corean rosters / LCK Academy: available at Noite (timezone) or even days for Tarde
    if (oppTeam.region === 'LCK') {
      if (pIndex === 'NOITE') return (dayNum % 2 === 0);
      if (pIndex === 'TARDE') return (dayNum % 3 === 0);
      return false;
    }
    // Chinese rosters / LPL: available at Noite and Tarde alternately
    if (oppTeam.region === 'LPL') {
      if (pIndex === 'NOITE') return (dayNum % 3 !== 0);
      if (pIndex === 'TARDE') return (dayNum % 2 !== 0);
      return false;
    }
    // Local leagues (CBLOL, LEC, LCS): weekdays (Mon to Thu), mornings & afternoons mostly
    const currentMonth = months[selectedMonthIndex];
    const weekdayIdx = (currentMonth.startDayOfWeek + (dayNum - 1)) % 7;
    const isWeekend = weekdayIdx >= 4; // Fri, Sat, Sun are official match blockdates
    if (isWeekend) return false; 
    
    if (pIndex === 'MANHÃ') return (dayNum % 2 === 1);
    if (pIndex === 'TARDE') return (dayNum % 2 === 0);
    if (pIndex === 'NOITE') return (dayNum % 4 === 0);
    return true;
  };

  // Register scheduled activity inside gameState
  const handleScheduleActivity = (dayNum: number, period: 'MANHÃ' | 'TARDE' | 'NOITE', type: 'scrim' | 'descanso' | 'treino_especifico') => {
    if (!onUpdateGameState) return;

    const nextState = { ...gameState };
    const stateTeam = nextState.teams.find(t => t.id === nextState.playerTeamId);
    if (!stateTeam) return;

    let title = '';
    let details = '';
    let activityCode: 'SCRIMS' | 'DESCANSO' | 'TREINOS' = 'TREINOS';

    if (type === 'scrim') {
      const opp = gameState.teams.find(t => t.id === scrimOpponentId);
      if (!opp) return;
      activityCode = 'SCRIMS';
      title = `Scrim vs ${opp.acronym} (${period})`;
      details = `Treino de Scrim simulado contra ${opp.name}. Foco na comunicação e entrosamento.`;

      // Validation check
      if (stateTeam.budget < 500) {
        triggerNotification?.("❌ Saldo Insuficiente", `Saldo de ${formatMoney(stateTeam.budget)} insuficiente para taxas operacionais ($500).`);
        return;
      }
      stateTeam.budget -= 500;

      // Improve team attributes
      stateTeam.roster = (stateTeam.roster || []).map(p => ({
        ...p,
        chemistry: Math.min(100, (p.chemistry ?? 75) + 3),
        stamina: Math.max(10, (p.stamina ?? 85) - 6),
        attributes: {
          ...p.attributes,
          mechanics: Math.min(100, (p.attributes.mechanics ?? 50) + 1)
        }
      }));
      stateTeam.academy = (stateTeam.academy || []).map(p => ({
        ...p,
        chemistry: Math.min(100, (p.chemistry ?? 70) + 2),
        stamina: Math.max(10, (p.stamina ?? 80) - 5)
      }));

      triggerNotification?.("🔵 Scrim Marcada!", `Scrim agendada contra ${opp.name} para o período da ${period.toLowerCase()} (-$500).`);

    } else if (type === 'descanso') {
      activityCode = 'DESCANSO';
      title = `Dia de Descanso / Recovery (${period})`;
      details = `Computadores desligados na GH. Descanso mental electivo para mitigar estresse e burnout.`;

      stateTeam.roster = (stateTeam.roster || []).map(p => ({
        ...p,
        stamina: Math.min(100, (p.stamina ?? 85) + 30),
        motivation: Math.min(100, (p.motivation ?? 80) + 15)
      }));
      stateTeam.academy = (stateTeam.academy || []).map(p => ({
        ...p,
        stamina: Math.min(100, (p.stamina ?? 80) + 25),
        motivation: Math.min(100, (p.motivation ?? 75) + 12)
      }));

      triggerNotification?.("⚪ Recuperação Ativada", `Folga funcional agendada. Atletas descansando.`);

    } else if (type === 'treino_especifico') {
      activityCode = 'TREINOS';
      let focusLabel = '';
      if (treinoFoco === 'tatico') {
        focusLabel = 'Composições e Draft';
        title = `Treino Tático (${period})`;
        details = `Alinhamento de pockepicks e composições de draft. Ganho de bônus na fase tática do palco principal.`;
        stateTeam.roster = (stateTeam.roster || []).map(p => ({
          ...p,
          chemistry: Math.min(100, (p.chemistry ?? 75) + 5),
          stamina: Math.max(10, (p.stamina ?? 85) - 8)
        }));
      } else if (treinoFoco === 'macro') {
        focusLabel = 'Macro & Transições';
        title = `Treino Macro VODs (${period})`;
        details = `Revisões operacionais do mid/late game e controle de zonas de visão.`;
        stateTeam.roster = (stateTeam.roster || []).map(p => ({
          ...p,
          stamina: Math.max(10, (p.stamina ?? 85) - 6),
          attributes: {
            ...p.attributes,
            macro: Math.min(100, (p.attributes.macro ?? 50) + 1),
            mapVision: Math.min(100, (p.attributes.mapVision ?? 50) + 1)
          }
        }));
      } else if (treinoFoco === 'mecanica') {
        focusLabel = 'Mecânica e Reflexos';
        title = `Treino de Mecânica SoloQ (${period})`;
        details = `Maratona individual nas ranqueadas de elite para calibrar reflexos mecânicos e farm.`;
        stateTeam.roster = (stateTeam.roster || []).map(p => ({
          ...p,
          stamina: Math.max(15, (p.stamina ?? 85) - 10),
          attributes: {
            ...p.attributes,
            mechanics: Math.min(100, (p.attributes.mechanics ?? 45) + 2),
            farm: Math.min(100, (p.attributes.farm ?? 45) + 2)
          }
        }));
      } else if (treinoFoco === 'fisico') {
        focusLabel = 'Preparação Física Gym';
        title = `Preparação Física Gym (${period})`;
        details = `Cardio e musculação para combater cansaço fisiológico e dorb muscular.`;
        stateTeam.roster = (stateTeam.roster || []).map(p => ({
          ...p,
          stamina: Math.min(100, (p.stamina ?? 85) + 15)
        }));
      }

      triggerNotification?.("🟢 Treino Específico Agendado", `Prática de ${focusLabel} programada com sucesso!`);
    }

    const key = `${selectedMonthIndex}-${dayNum}`;
    const destActivities = (nextState as any).gamingHouseActivities || {};
    const existing = destActivities[key] || [];

    // Filter overlapping scheduled items for the same period
    const filtered = existing.filter((a: any) => a.time !== period);
    const newId = `${type}-${dayNum}-${period.toLowerCase()}-${Date.now().toString().substring(7)}`;

    filtered.push({
      id: newId,
      type: activityCode,
      title,
      time: period,
      details
    });

    destActivities[key] = filtered;
    (nextState as any).gamingHouseActivities = destActivities;

    onUpdateGameState(nextState);
    
    // Reset modal states
    setSelectedActionType(null);
    setScrimOpponentId('');
    setTreinoFoco(null);
    setModalPeriod(null);
  };

  // Remove scheduled operational activity
  const handleRemoveActivity = (dayNum: number, activityId: string) => {
    if (!onUpdateGameState) return;

    const nextState = { ...gameState };
    const destActivities = (nextState as any).gamingHouseActivities || {};
    const key = `${selectedMonthIndex}-${dayNum}`;
    const existing = destActivities[key] || [];

    const updated = existing.filter((a: any) => a.id !== activityId);
    destActivities[key] = updated;
    (nextState as any).gamingHouseActivities = destActivities;

    onUpdateGameState(nextState);
    triggerNotification?.("⚪ Bloco Desmarcado", "A atividade operacional foi removida do calendário.");
  };

  // Detect language setting
  const settingsLang = (gameState as any).settings?.language;
  const langStored = typeof localStorage !== 'undefined' ? (localStorage.getItem('legendshub_lang') || 'pt') : 'pt';
  const activeLang: 'pt' | 'en' | 'es' = (() => {
    if (forcedLang) return forcedLang;
    if (settingsLang) {
      const lower = settingsLang.toLowerCase();
      if (lower.startsWith('pt')) return 'pt';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
    const lowerStored = langStored.toLowerCase();
    if (lowerStored.startsWith('pt')) return 'pt';
    if (lowerStored.startsWith('es')) return 'es';
    if (lowerStored.startsWith('en')) return 'en';
    return 'pt';
  })();

  const t = translations[activeLang] || translations.pt;

  // Detect theme (Strict UI Theme unification mapping as requested!)
  const settingsTheme = (gameState as any).settings?.theme;
  const systemThemeIsDark = theme === 'dark' || settingsTheme === 'dark_mode';

  // Average values of roster resident attributes
  const mainRosterAvg = useMemo(() => {
    const list = playerTeam.roster || [];
    if (list.length === 0) return { stamina: 100, motivation: 100, chemistry: 100 };
    const staminaSum = list.reduce((acc, p) => acc + (p.stamina ?? 85), 0);
    const motivationSum = list.reduce((acc, p) => acc + (p.motivation ?? 80), 0);
    const chemistrySum = list.reduce((acc, p) => acc + (p.chemistry ?? 75), 0);
    return {
      stamina: Math.round(staminaSum / list.length),
      motivation: Math.round(motivationSum / list.length),
      chemistry: Math.round(chemistrySum / list.length)
    };
  }, [playerTeam.roster]);

  const academyRosterAvg = useMemo(() => {
    const list = playerTeam.academy || [];
    if (list.length === 0) return { stamina: 90, motivation: 85, chemistry: 70 };
    const staminaSum = list.reduce((acc, p) => acc + (p.stamina ?? 80), 0);
    const motivationSum = list.reduce((acc, p) => acc + (p.motivation ?? 75), 0);
    const chemistrySum = list.reduce((acc, p) => acc + (p.chemistry ?? 65), 0);
    return {
      stamina: Math.round(staminaSum / list.length),
      motivation: Math.round(motivationSum / list.length),
      chemistry: Math.round(chemistrySum / list.length)
    };
  }, [playerTeam.academy]);

  // Overall internal atmosphere index
  const climateCalculatedIndex = Math.round((mainRosterAvg.stamina + mainRosterAvg.motivation + academyRosterAvg.motivation) / 3);
  const currentClimateString = (() => {
    if (climateCalculatedIndex >= 82) return t.clima_excelente;
    if (climateCalculatedIndex >= 65) return t.clima_regular;
    return t.clima_tenso;
  })();

  const currentFocoPreparacao = (() => {
    if (activePracticeId === 'scrim_early') return t.foco_early;
    if (activePracticeId === 'scrim_vods') return t.foco_vods;
    if (activePracticeId === 'scrim_internal') return t.foco_internal;
    return t.foco_rest;
  })();

  // Define static data with proper multi-language reactive titles
  const scrimsOptions = [
    {
      id: 'scrim_early',
      title: t.scrim_early_game_title,
      description: t.scrim_early_game_desc,
      cost: 4500,
      mentalWearLabel: "HIGH (-18 " + t.energia + ")",
      attributeImpact: "🚀 Mechanics & Consistency +6",
      action: 'scrim_early'
    },
    {
      id: 'scrim_vods',
      title: t.scrim_vods_title,
      description: t.scrim_vods_desc,
      cost: 1500,
      mentalWearLabel: "LOW (-5 " + t.energia + ")",
      attributeImpact: "🚀 Macro & Map Vision +5",
      action: 'scrim_vods'
    },
    {
      id: 'scrim_internal',
      title: t.scrim_internal_title,
      description: t.scrim_internal_desc,
      cost: 0,
      mentalWearLabel: "MODERATE (-8 " + t.energia + ")",
      attributeImpact: "🚀 Chemistry +10 (Main vs Academy)",
      action: 'scrim_internal'
    }
  ];

  const wellbeingOptions = [
    {
      id: 'wellbeing_psy',
      title: t.wellbeing_psy_title,
      description: t.wellbeing_psy_desc,
      cost: 3200,
      impact: "❤️ Motivation/Mood +25, Team Synergy +5",
      action: 'validate_psy'
    },
    {
      id: 'wellbeing_rest',
      title: t.wellbeing_rest_title,
      description: t.wellbeing_rest_desc,
      cost: 800,
      impact: "❤️ Full Rest (Refills Stamina/Energy up to 100%)",
      action: 'validate_rest'
    },
    {
      id: 'wellbeing_teambuilding',
      title: t.wellbeing_teambuilding_title,
      description: t.wellbeing_teambuilding_desc,
      cost: 2400,
      impact: "❤️ Global Chemistry +15, Resolves Ego tension",
      action: 'validate_teambuilding'
    }
  ];

  // Execute and persist scrim routine impacts to player levels
  const applyScrimRoutine = (option: typeof scrimsOptions[0]) => {
    if (playerTeam.budget < option.cost) {
      if (triggerNotification) triggerNotification("❌ Saldo Insuficiente", "Seu caixa de " + formatMoney(playerTeam.budget) + " é insuficiente para subsidiar este treino de " + formatMoney(option.cost));
      else alert("Capital insuficiente");
      return;
    }

    setActivePracticeId(option.id);

    // Apply stats impact on the teams of the GameState and invoke update state
    const nextState = { ...gameState };
    const stateTeam = nextState.teams.find(t => t.id === nextState.playerTeamId)!;

    // Deduct cost
    stateTeam.budget -= option.cost;

    // Iterate roster and apply attributes / stamina changes
    stateTeam.roster = (stateTeam.roster || []).map(p => {
      const draftAtts = { ...p.attributes };
      let updatedStamina = (p.stamina ?? 85);
      
      if (option.id === 'scrim_early') {
        draftAtts.mechanics = Math.min(100, (draftAtts.mechanics || 50) + 1);
        draftAtts.consistency = Math.min(100, (draftAtts.consistency || 50) + 1);
        p.chemistry = Math.min(100, (p.chemistry || 70) + 2);
        updatedStamina = Math.max(10, updatedStamina - 18);
        p.motivation = Math.max(20, (p.motivation || 75) - 4); // intense training stresses out slightly
      } else if (option.id === 'scrim_vods') {
        draftAtts.macro = Math.min(100, (draftAtts.macro || 50) + 1);
        draftAtts.mapVision = Math.min(100, (draftAtts.mapVision || 50) + 1);
        p.chemistry = Math.min(100, (p.chemistry || 70) + 3);
        updatedStamina = Math.max(10, updatedStamina - 5);
      } else if (option.id === 'scrim_internal') {
        p.chemistry = Math.min(100, (p.chemistry || 70) + 7);
        updatedStamina = Math.max(10, updatedStamina - 8);
        p.motivation = Math.min(100, (p.motivation || 75) + 3); // friendly scrim can boost mood
      }

      return { ...p, attributes: draftAtts, stamina: updatedStamina };
    });

    // Mirror some changes to academy
    stateTeam.academy = (stateTeam.academy || []).map(p => {
      const draftAtts = { ...p.attributes };
      let updatedStamina = (p.stamina ?? 80);
      if (option.id === 'scrim_early') {
        draftAtts.mechanics = Math.min(100, (draftAtts.mechanics || 40) + 1);
        updatedStamina = Math.max(10, updatedStamina - 15);
      } else if (option.id === 'scrim_internal') {
        p.chemistry = Math.min(100, (p.chemistry || 60) + 8);
        updatedStamina = Math.max(10, updatedStamina - 8);
        p.motivation = Math.min(100, (p.motivation || 70) + 4);
      }
      return { ...p, attributes: draftAtts, stamina: updatedStamina };
    });

    if (onUpdateGameState) {
      onUpdateGameState(nextState);
      const titleLabel = activeLang === 'pt' ? '🏋️ Treino Agendado' : activeLang === 'es' ? '🏋️ Entreno Confirmado' : '🏋️ Workout Scheduled';
      triggerNotification?.(titleLabel, `${t.sucesso_scrim} - ${option.attributeImpact} (${option.mentalWearLabel})`);
    }
  };

  // Execute well-being restorations
  const applyWellbeingAction = (option: typeof wellbeingOptions[0]) => {
    if (playerTeam.budget < option.cost) {
      if (triggerNotification) triggerNotification("❌ Saldo Insuficiente", "Seu caixa de " + formatMoney(playerTeam.budget) + " é insuficiente para subsidiar este procedimento de " + formatMoney(option.cost));
      else alert("Capital insuficiente");
      return;
    }

    setActiveWellbeingId(option.id);

    const nextState = { ...gameState };
    const stateTeam = nextState.teams.find(t => t.id === nextState.playerTeamId)!;

    // Deduct cost
    stateTeam.budget -= option.cost;

    // Iterate roster and recover stats
    stateTeam.roster = (stateTeam.roster || []).map(p => {
      let updatedMotivation = p.motivation ?? 75;
      let updatedStamina = p.stamina ?? 85;
      let updatedChem = p.chemistry ?? 70;

      if (option.id === 'wellbeing_psy') {
        updatedMotivation = Math.min(100, updatedMotivation + 25);
        updatedChem = Math.min(100, updatedChem + 5);
      } else if (option.id === 'wellbeing_rest') {
        updatedStamina = 100; // refills fully
        updatedMotivation = Math.min(100, updatedMotivation + 15);
      } else if (option.id === 'wellbeing_teambuilding') {
        updatedChem = Math.min(100, updatedChem + 15);
        updatedMotivation = Math.min(100, updatedMotivation + 10);
      }

      return {
        ...p,
        motivation: updatedMotivation,
        stamina: updatedStamina,
        chemistry: updatedChem
      };
    });

    // Sync to academy as well as they are residents in the GH
    stateTeam.academy = (stateTeam.academy || []).map(p => {
      let updatedMotivation = p.motivation ?? 70;
      let updatedStamina = p.stamina ?? 80;
      let updatedChem = p.chemistry ?? 60;

      if (option.id === 'wellbeing_psy') {
        updatedMotivation = Math.min(100, updatedMotivation + 20);
      } else if (option.id === 'wellbeing_rest') {
        updatedStamina = 100;
        updatedMotivation = Math.min(100, updatedMotivation + 10);
      } else if (option.id === 'wellbeing_teambuilding') {
        updatedChem = Math.min(100, updatedChem + 12);
      }

      return {
        ...p,
        motivation: updatedMotivation,
        stamina: updatedStamina,
        chemistry: updatedChem
      };
    });

    if (onUpdateGameState) {
      onUpdateGameState(nextState);
      const titleLabel = activeLang === 'pt' ? '❤️ Atletas Saudáveis' : activeLang === 'es' ? '❤️ Atletas Saludables' : '❤️ Squad Well-Being';
      triggerNotification?.(titleLabel, `${t.sucesso_bemestar} - ${option.impact}`);
    }
  };

  // Generate dynamic data payload reflecting real-time reactive Windows DB state
  const liveJsonResponse = useMemo(() => {
    return {
      cabecalho_status_gh: {
        saldo_caixa: {
          caixa_bruto: playerTeam.budget,
          caixa_formatado_hud: formatMoney(playerTeam.budget)
        },
        foco_preparacao_semanal: currentFocoPreparacao,
        clima_interno_gh: currentClimateString,
        clima_calculado_index: `${climateCalculatedIndex}%`
      },
      secao_blocos_de_scrim: {
        rotinas_configuradas: [
          {
            id: "scrim_early",
            titulo_rotina: t.scrim_early_game_title,
            situacao: activePracticeId === 'scrim_early' ? "PROGRAMADO_ATIVO" : "DISPONIVEL",
            custo_investimento: 4500,
            desgaste_mensurado: "ALTO (Early focus, estresse mecânico)",
            atributos_incrementados: "Mecânica, Consistência, Prontidão"
          },
          {
            id: "scrim_vods",
            titulo_rotina: t.scrim_vods_title,
            situacao: activePracticeId === 'scrim_vods' ? "PROGRAMADO_ATIVO" : "DISPONIVEL",
            custo_investimento: 1500,
            desgaste_mensurado: "BAIXO (Macros, posicionamento tático)",
            atributos_incrementados: "Macro, Visão de Mapa"
          },
          {
            id: "scrim_internal",
            titulo_rotina: t.scrim_internal_title,
            situacao: activePracticeId === 'scrim_internal' ? "PROGRAMADO_ATIVO" : "DISPONIVEL",
            custo_investimento: 0,
            desgaste_mensurado: "MODERADO (Titulares vs Academy)",
            atributos_incrementados: "Química / Sinergia de Elenco"
          }
        ]
      },
      secao_rotina_e_bem_estar: {
        iniciativas_disponiveis: [
          {
            id: "wellbeing_psy",
            programa: t.wellbeing_psy_title,
            selecionado: activeWellbeingId === 'wellbeing_psy',
            preco: 3200,
            beneficio: "Humor +25, Estabilidade Emocional"
          },
          {
            id: "wellbeing_rest",
            programa: t.wellbeing_rest_title,
            selecionado: activeWellbeingId === 'wellbeing_rest',
            preco: 800,
            beneficio: "Restauração total de Stamina (100%)"
          },
          {
            id: "wellbeing_teambuilding",
            programa: t.wellbeing_teambuilding_title,
            selecionado: activeWellbeingId === 'wellbeing_teambuilding',
            preco: 2400,
            beneficio: "Química global +15"
          }
        ]
      },
      secao_painel_residente: {
        elenco_titular: {
          rotulo: t.titulares_label,
          quantidade_residentes: playerTeam.roster?.length || 5,
          energia_media: `${mainRosterAvg.stamina}%`,
          humor_medio: `${mainRosterAvg.motivation}%`,
          sabor_química_sinergia: `${mainRosterAvg.chemistry}%`,
          prontidao_jogo: mainRosterAvg.stamina >= 80 ? "STAGE READY" : mainRosterAvg.stamina >= 60 ? "TIRED BUT CAPABLE" : "RISK_OF_BURNOUT"
        },
        elenco_cantera_academy: {
          rotulo: t.academy_label,
          quantidade_residentes: playerTeam.academy?.length || 5,
          energia_media: `${academyRosterAvg.stamina}%`,
          humor_medio: `${academyRosterAvg.motivation}%`,
          sinergia_grupo: `${academyRosterAvg.chemistry}%`
        }
      },
      restricao_escopo: {
        patrocinadores_ativos_bloqueados_nesta_tela: true,
        upgrades_de_infraestrutura_bloqueados_nesta_tela: true,
        notas: "Sem excessos de interfaces."
      },
      theme_active: systemThemeIsDark ? "DARK_MODE" : "LIGHT_MODE",
      idioma_sincronizado: activeLang.toUpperCase()
    };
  }, [playerTeam, activePracticeId, activeWellbeingId, currentClimateString, currentFocoPreparacao, climateCalculatedIndex, mainRosterAvg, academyRosterAvg, activeLang, systemThemeIsDark]);

  // Command console statement parsing
  const submitConsoleAction = () => {
    if (!consoleCommand) return;
    try {
      const parsed = JSON.parse(consoleCommand.trim());

      if (parsed.acao === "definir_rotina_scrim" || parsed.action === "define_scrim_routine") {
        const targetId = parsed.id_scrim || parsed.scrim_id || 'scrim_vods';
        const found = scrimsOptions.find(o => o.id === targetId);
        if (found) {
          applyScrimRoutine(found);
          setCommandFeedback(`COMANDO EXECUTADO: Rotina de scrim "${found.title}" aplicada no banco de dados local com sucesso.`);
        } else {
          setCommandFeedback("ERRO: ID_SCRIM inexistente no mercado. Use 'scrim_early', 'scrim_vods' ou 'scrim_internal'.");
        }
      } else if (parsed.acao === "aplicar_acao_bem_estar" || parsed.action === "apply_wellbeing") {
        const targetId = parsed.id_acao || parsed.wellbeing_id || 'wellbeing_psy';
        const found = wellbeingOptions.find(o => o.id === targetId);
        if (found) {
          applyWellbeingAction(found);
          setCommandFeedback(`COMANDO EXECUTADO: Iniciativa "${found.title}" processada. Humores e energia atualizados nas coleções.`);
        } else {
          setCommandFeedback("ERRO: ID_ACAO inexistente. Opções válidas: 'wellbeing_psy', 'wellbeing_rest' ou 'wellbeing_teambuilding'.");
        }
      } else {
        setCommandFeedback("CONSOLA: Payload lido perfeitamente, porém nenhuma ação conhecida simulada.");
      }
    } catch(e) {
      setCommandFeedback("SINTAXE INVÁLIDA: O payload precisa ser um JSON válido (Ex: {\"acao\": \"definir_rotina_scrim\", \"id_scrim\": \"scrim_early\"})");
    }
    setTimeout(() => setCommandFeedback(null), 5000);
  };

  // Clipboard copies
  const triggerCopy = () => {
    const text = JSON.stringify(liveJsonResponse, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className={`p-1 space-y-6 select-none ${systemThemeIsDark ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* HEADER SECTION */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight uppercase flex items-center gap-2">
              <Zap className={`w-6 h-6 ${systemThemeIsDark ? 'text-[#00E5FF]' : 'text-indigo-600'}`} />
              {t.titulo_principal}
            </h2>
            <p className={`text-xs ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mt-1 max-w-4xl`}>
              {t.desc_sub}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] uppercase font-mono font-black border px-2.5 py-1 rounded-lg ${
              systemThemeIsDark 
                ? 'bg-slate-950/60 text-[#00E5FF] border-[#1e2d44]' 
                : 'bg-white text-slate-700 border-slate-200 shadow-sm'
            }`}>
              THEME: {systemThemeIsDark ? 'DARK_MODE' : 'LIGHT_MODE'}
            </span>
          </div>
        </div>
      </div>

      {/* TOP HEADER PANELS */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-xl border ${
        systemThemeIsDark 
          ? 'bg-[#0a1424] border-[#1e2d44]' 
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="space-y-1">
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.saldo_caixa}
          </p>
          <h3 className={`font-display text-2xl font-black tracking-tight ${systemThemeIsDark ? 'text-[#00FF88]' : 'text-emerald-600'}`}>
            {formatMoney(playerTeam.budget)}
          </h3>
        </div>
        
        <div className={`space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 ${systemThemeIsDark ? 'border-[#1e2d44]/60' : 'border-slate-150'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-400'}`}>
            {t.foco_preparacao_semanal}
          </p>
          <h3 className={`font-display text-base md:text-lg font-black tracking-tight ${systemThemeIsDark ? 'text-[#00E5FF]' : 'text-indigo-700'} uppercase mt-0.5`}>
            {currentFocoPreparacao}
          </h3>
        </div>

        <div className={`space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 ${systemThemeIsDark ? 'border-[#1e2d44]/60' : 'border-slate-150'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-400'}`}>
            {t.clima_interno_gh}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="font-display text-base md:text-lg font-black tracking-tight uppercase">
              {currentClimateString}
            </h3>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
              climateCalculatedIndex >= 80 
                ? (systemThemeIsDark ? 'bg-emerald-500/10 text-[#00FF88]' : 'bg-emerald-500/10 text-emerald-700')
                : (systemThemeIsDark ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-600')
            }`}>
              {climateCalculatedIndex}%
            </span>
          </div>
        </div>
      </div>

      {/* SPLIT VIEWS - LEFT AND RIGHT BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCRIMS AND WELL-BEING ACTIONS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SCRIMS VIEW PANEL */}
          <div className={`p-6 rounded-xl border space-y-5 ${
            systemThemeIsDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200/90 shadow-sm'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${systemThemeIsDark ? 'border-[#1e2d44]' : 'border-slate-100'}`}>
              <h4 className={`font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                systemThemeIsDark ? 'text-[#00E5FF]' : 'text-indigo-800'
              }`}>
                <Activity className="w-4 h-4 text-[#00E5FF]" /> 
                {activeLang === 'pt' ? 'DIRETRIZES DE TREINOS COMPETITIVOS (SCRIMS)' : activeLang === 'es' ? 'BLOQUES DE ENTRENAMIENTO COMPETITIVO (SCRIMS)' : 'COMPETITIVE TRAINING BLUEPRINTS (SCRIMS)'}
              </h4>
            </div>

            <div className="space-y-4">
              {scrimsOptions.map(option => {
                const isActive = activePracticeId === option.id;
                return (
                  <div 
                    key={option.id}
                    className={`border rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isActive 
                        ? (systemThemeIsDark ? 'bg-[#0a2033]/60 border-[#00E5FF]/40 shadow-inner' : 'bg-indigo-50/60 border-indigo-300')
                        : (systemThemeIsDark ? 'bg-[#070d19]/80 border-[#1e2d44] hover:border-slate-700' : 'bg-slate-50/80 border-slate-150 hover:bg-slate-100/60')
                    }`}
                  >
                    <div className="space-y-1 text-left flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-display text-xs md:text-sm font-black uppercase tracking-tight">
                          {option.title}
                        </h5>
                        {isActive && (
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase leading-none ${
                            systemThemeIsDark ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-emerald-500/10 text-emerald-700'
                          }`}>
                            ACTIVE NOW
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed max-w-2xl ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {option.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono">
                        <span className="text-amber-500 font-bold">{option.attributeImpact}</span>
                        <span className="text-gray-400">•</span>
                        <span className={systemThemeIsDark ? 'text-red-400 font-black' : 'text-red-700 font-black'}>
                          Wear: {option.mentalWearLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1e2d44]/30">
                      <div>
                        <span className={`text-[10px] block text-right font-bold uppercase ${systemThemeIsDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {t.caixa_impacto}
                        </span>
                        <span className={`text-sm font-black font-mono leading-none block mt-0.5 ${
                          option.cost === 0 
                            ? 'text-emerald-500' 
                            : (systemThemeIsDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {option.cost === 0 ? t.gratis : formatMoney(option.cost)}
                        </span>
                      </div>

                      <button
                        onClick={() => applyScrimRoutine(option)}
                        disabled={isActive}
                        className={`px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                          isActive
                            ? 'bg-gray-800 text-gray-500 cursor-default font-extrabold border border-slate-700'
                            : (systemThemeIsDark 
                                ? 'bg-[#00E5FF] text-black hover:bg-[#33ebff]' 
                                : 'bg-slate-900 text-white hover:bg-slate-800')
                        }`}
                      >
                        {isActive ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-400" /> {t.btn_aplicado}</>
                        ) : (
                          <><Play className="w-3 h-3 fill-current" /> {t.btn_aplicar}</>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* WELL-BEING VIEW PANEL */}
          <div className={`p-6 rounded-xl border space-y-5 ${
            systemThemeIsDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200/90 shadow-sm'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${systemThemeIsDark ? 'border-[#1e2d44]' : 'border-slate-100'}`}>
              <h4 className={`font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                systemThemeIsDark ? 'text-[#00E5FF]' : 'text-indigo-800'
              }`}>
                <Smile className="w-4 h-4 text-[#00E5FF]" /> 
                {activeLang === 'pt' ? 'MANUTENÇÃO DE SAÚDE & PREVENÇÃO DE BURNOUT' : activeLang === 'es' ? 'PREVENCIÓN DE BURNOUT & BIENESTAR DE JUGADORES' : 'ATHLETES WELLNESS & BURNOUT SHIELD'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wellbeingOptions.map(option => {
                const isSelected = activeWellbeingId === option.id;
                return (
                  <div 
                    key={option.id}
                    className={`border rounded-xl p-4 space-y-3.5 flex flex-col justify-between transition-all ${
                      isSelected 
                        ? (systemThemeIsDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-300')
                        : (systemThemeIsDark ? 'bg-[#070d19]/80 border-[#1e2d44] hover:bg-[#091122]' : 'bg-slate-50/80 border-slate-150 hover:bg-slate-100/40')
                    }`}
                  >
                    <div className="space-y-1.5 text-left">
                      <h5 className="font-display text-[11px] font-black text-white uppercase tracking-tight leading-snug">
                        {option.title}
                      </h5>
                      <p className={`text-[10px] leading-relaxed ${systemThemeIsDark ? 'text-slate-400' : 'text-slate-550'}`}>
                        {option.description}
                      </p>
                      <div className="pt-1 text-[9.5px] font-bold text-[#00FF88] uppercase tracking-wide leading-none">
                        {option.impact}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1e2d44]/30 space-y-2">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-gray-500 font-bold uppercase text-[9px]">{t.caixa_impacto}</span>
                        <span className={`font-mono font-black ${systemThemeIsDark ? 'text-[#00FF88]' : 'text-slate-800'}`}>
                          {formatMoney(option.cost)}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => applyWellbeingAction(option)}
                        disabled={isSelected}
                        className={`w-full py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-501/10 text-emerald-500 border border-emerald-500/20'
                            : (systemThemeIsDark 
                                ? 'bg-slate-900 border border-slate-700/60 hover:border-emerald-500/40 text-gray-300 hover:text-white' 
                                : 'bg-slate-900 text-white hover:bg-slate-800')
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        {isSelected ? t.btn_aplicado : t.btn_aplicar}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RESIDENT ROSTER PERFORMANCE FEEDBACK STATUS */}
        <div className="lg:col-span-4 space-y-6">

          <div className={`p-5 rounded-xl border space-y-5 ${
            systemThemeIsDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className={`font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-3 ${
              systemThemeIsDark ? 'border-[#1e2d44] text-[#00E5FF]' : 'border-slate-100 text-indigo-800'
            }`}>
              <Users className="w-4 h-4" /> {t.resident_title}
            </h4>

            {/* Main Roster Panel */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-black/10 dark:bg-black/25 p-2 rounded-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t.titulares_label}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  {playerTeam.roster?.length || 5} Atletas
                </span>
              </div>

              <div className="space-y-2.5 text-[11px] font-mono">
                {/* Stamina */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.energia}</span>
                    <span className={systemThemeIsDark ? 'text-[#00FF88]' : 'text-slate-800'}>{mainRosterAvg.stamina}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        mainRosterAvg.stamina >= 80 ? 'bg-emerald-500' : mainRosterAvg.stamina >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${mainRosterAvg.stamina}%` }} 
                    />
                  </div>
                </div>

                {/* Mood */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.humor}</span>
                    <span className={systemThemeIsDark ? 'text-[#00E5FF]' : 'text-slate-800'}>{mainRosterAvg.motivation}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                      style={{ width: `${mainRosterAvg.motivation}%` }} 
                    />
                  </div>
                </div>

                {/* Sinergy */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.sinergia}</span>
                    <span className="text-white">{mainRosterAvg.chemistry}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300" 
                      style={{ width: `${mainRosterAvg.chemistry}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                  <span>{t.prontidao}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-black ${
                    mainRosterAvg.stamina >= 80 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : mainRosterAvg.stamina >= 55 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : (systemThemeIsDark ? 'bg-rose-500/15 text-rose-500' : 'bg-red-200 text-red-900')
                  }`}>
                    {mainRosterAvg.stamina >= 80 ? t.status_excelente : mainRosterAvg.stamina >= 55 ? t.status_regular : t.status_esgotado}
                  </span>
                </div>
              </div>
            </div>

            {/* Academy Roster Panel */}
            <div className="space-y-3 pt-3 border-t border-[#1e2d44]/30">
              <div className="flex justify-between items-center bg-black/10 dark:bg-black/25 p-2 rounded-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t.academy_label}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  {playerTeam.academy?.length || 5} Atletas
                </span>
              </div>

              <div className="space-y-2.5 text-[11px] font-mono">
                {/* Stamina */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.energia}</span>
                    <span className={systemThemeIsDark ? 'text-[#00FF88]' : 'text-slate-800'}>{academyRosterAvg.stamina}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        academyRosterAvg.stamina >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} 
                      style={{ width: `${academyRosterAvg.stamina}%` }} 
                    />
                  </div>
                </div>

                {/* Mood */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.humor}</span>
                    <span className={systemThemeIsDark ? 'text-[#00E5FF]' : 'text-slate-800'}>{academyRosterAvg.motivation}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                      style={{ width: `${academyRosterAvg.motivation}%` }} 
                    />
                  </div>
                </div>

                {/* Sinergy */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px]">
                    <span>{t.sinergia}</span>
                    <span className="text-white">{academyRosterAvg.chemistry}%</span>
                  </div>
                  <div className="w-full bg-[#070d19] h-2 rounded-full overflow-hidden border border-slate-800/10">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300" 
                      style={{ width: `${academyRosterAvg.chemistry}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scope restrictions badge proofing */}
            <div className={`p-3.5 rounded-lg border flex items-center gap-2 text-[10px] font-medium tracking-wide ${
              systemThemeIsDark ? 'bg-slate-950/40 border-[#1e2d44] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-550'
            }`}>
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 text-center sm:text-left leading-normal">
                {activeLang === 'pt' ? 'Patrocínios e Upgrades físicos de prédios indisponíveis nesta aba.' : 'Sponsors and building upgrades parameters are locked on this dashboard view.'}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 📅 INTERACTIVE OPERATIONAL CALENDAR (GH OPERATIONS) */}
      <div className={`p-6 rounded-xl border mt-6 text-left ${
        systemThemeIsDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2d44]/30 mb-6 font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className={`font-display text-sm font-black uppercase tracking-wider ${systemThemeIsDark ? 'text-[#00E5FF]' : 'text-indigo-900'}`}>
                {activeLang === 'pt' ? 'Calendário Operacional Rotativo' : activeLang === 'es' ? 'Calendario Operacional Rotativo' : 'GH Operational Scheduler'}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 font-sans">
                {activeLang === 'pt' ? 'Planejamento e Simulação de Scrims, Treinos e Folgas do Roster' : 'Schedule scrims, VOD reviews, workouts, and rest slots'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const nextMonth = Math.max(0, selectedMonthIndex - 1);
                handleSetGHMonth(nextMonth);
                handleSetGHDay(1);
                setModalPeriod(null);
                setSelectedActionType(null);
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                systemThemeIsDark 
                  ? 'border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500' 
                  : 'border-slate-300 text-[#0f172a] hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`text-xs font-mono uppercase tracking-widest w-28 text-center select-none ${
              systemThemeIsDark ? 'font-black text-slate-300' : 'font-medium text-[#0f172a]'
            }`}>
              {months[selectedMonthIndex].name}
            </span>
            <button 
              onClick={() => {
                const nextMonth = Math.min(months.length - 1, selectedMonthIndex + 1);
                handleSetGHMonth(nextMonth);
                handleSetGHDay(1);
                setModalPeriod(null);
                setSelectedActionType(null);
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                systemThemeIsDark 
                  ? 'border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500' 
                  : 'border-slate-300 text-[#0f172a] hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar and detail scheduling panel side-by-side (Bento grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Calendar visual Grid: xl:col-span-7 */}
          <div className="xl:col-span-7 space-y-4 font-sans">
            <div className="grid grid-cols-7 gap-1 text-center font-bold font-mono text-[9px] uppercase text-gray-500 tracking-wider">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty placeholder cells for offset of startDayOfWeek */}
              {Array.from({ length: months[selectedMonthIndex].startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 bg-black/5 dark:bg-[#04080e]/40 rounded-lg border border-transparent opacity-30 select-none" />
              ))}

              {/* Day cells of the month */}
              {Array.from({ length: months[selectedMonthIndex].daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const weekdayIndex = (months[selectedMonthIndex].startDayOfWeek + i) % 7;
                const isSelected = selectedGHDay === dayNum;
                const isCompetitionWeek = weekdayIndex === 4 || weekdayIndex === 5; // Fri, Sat
                
                const dayKey = `${selectedMonthIndex}-${dayNum}`;
                const dayCustomActs = (gameState as any).gamingHouseActivities?.[dayKey] || [];

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => {
                      handleSetGHDay(dayNum);
                      setModalPeriod(null);
                      setSelectedActionType(null);
                    }}
                    className={`h-16 text-left p-1.5 relative rounded-lg flex flex-col justify-between transition-all border group text-[10px] uppercase font-bold tracking-tight cursor-pointer ${
                      isSelected 
                        ? (systemThemeIsDark 
                            ? 'bg-indigo-950/40 border-[#00E5FF] text-[#00E5FF]' 
                            : 'bg-indigo-50 border-indigo-500 text-indigo-700')
                        : isCompetitionWeek
                          ? (systemThemeIsDark
                              ? 'bg-rose-500/5 border-rose-500/20 text-rose-500 hover:bg-rose-500/10'
                              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50')
                          : (systemThemeIsDark
                              ? 'bg-[#070d19]/60 border-[#1e2d44]/50 text-slate-300 hover:bg-slate-800/10 hover:border-slate-700'
                              : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#1e293b] hover:bg-[#e2e8f0] hover:border-[#cbd5e1]')
                    }`}
                  >
                    {/* Day number */}
                    <span className={`font-mono text-xs font-black ${
                      systemThemeIsDark ? 'text-slate-300' : isSelected ? 'text-indigo-900' : 'text-[#1e293b]'
                    }`}>{dayNum}</span>

                    {/* Compact Activity Indicators */}
                    <div className="space-y-0.5 w-full">
                      {isCompetitionWeek ? (
                        <div className="text-[7.5px] px-1 py-0.5 bg-rose-550/10 text-rose-400 border border-rose-550/20 rounded font-black leading-none text-center select-none truncate">
                          Oficiais
                        </div>
                      ) : dayCustomActs.length > 0 ? (
                        <div className="flex gap-1 overflow-hidden shrink-0 mt-1">
                          {dayCustomActs.map((act: any, aIdx: number) => {
                            const badgeColor = act.type === 'SCRIMS' ? 'bg-cyan-400' : act.type === 'DESCANSO' ? 'bg-slate-400' : 'bg-emerald-400';
                            return (
                              <span 
                                key={aIdx} 
                                className={`w-2 h-2 rounded-full border border-black/30 shrink-0 ${badgeColor}`} 
                                title={`${act.time}: ${act.title}`}
                              />
                            );
                          })}
                        </div>
                      ) : weekdayIndex === 6 ? (
                        <span className={`text-[7.5px] lowercase leading-none block truncate mt-1 ${
                          systemThemeIsDark ? 'text-gray-500' : 'text-[#475569]/90 font-black'
                        }`}>folga</span>
                      ) : (
                        <span className={`text-[7.5px] lowercase leading-none block truncate mt-1 ${
                          systemThemeIsDark ? 'text-gray-500' : 'text-[#475569]/90 font-black'
                        }`}>treinos</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed scheduling drawer/form: xl:col-span-5 */}
          <div className="xl:col-span-5 flex flex-col justify-between font-sans">
            <div className={`p-4 rounded-xl border h-full flex flex-col justify-between text-left ${
              systemThemeIsDark ? 'bg-[#060c16]/90 border-[#1e2d44]/80' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Header Title */}
              <div>
                <div className="pb-3 border-b border-[#1e2d44]/30 mb-4 flex items-center justify-between">
                  <h4 className={`font-mono text-xs font-black uppercase flex items-center gap-1.5 ${
                    systemThemeIsDark ? 'text-white' : 'text-[#0f172a]'
                  }`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    Janelas de Casa: Dia {selectedGHDay} • {months[selectedMonthIndex].name}
                  </h4>
                </div>

                {/* Day's active slot components */}
                <div className="space-y-3.5 select-none">
                  {(() => {
                    const dayKey = `${selectedMonthIndex}-${selectedGHDay}`;
                    const dayCustomActs = (gameState as any).gamingHouseActivities?.[dayKey] || [];
                    const weekdayIndex = (months[selectedMonthIndex].startDayOfWeek + (selectedGHDay - 1)) % 7;
                    const isCompetitionWeek = weekdayIndex === 4 || weekdayIndex === 5; // Fri/Sat

                    if (isCompetitionWeek) {
                      const activeRegion = playerTeam.region || 'CBLOL';
                      const academyLeagueName = activeRegion === 'CBLOL' ? 'DESAFIANTE' : `Youth Academy ${activeRegion}`;
                      return (
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg border border-rose-500/20 bg-rose-950/10 space-y-2 text-left">
                            <span className="text-[8px] font-black tracking-widest text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase font-mono">
                              Bloqueado • Dia de Jogo Oficial
                            </span>
                            <h5 className="font-display font-black text-xs text-white uppercase">{activeRegion} Split Regular</h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                              Dias de partida da liga principal ({activeRegion}) e base ({academyLeagueName}) são reservados de forma imutável pelo regulamento de eSports competitivo para evitar sobreposições cegas de datas.
                            </p>
                            <div className="pt-2 italic text-[9px] text-gray-400 font-bold uppercase font-mono">
                              Horas Reservadas: Principal 13h / Academy 18h30
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Render morning, afternoon and evening slots
                    const periods: ('MANHÃ' | 'TARDE' | 'NOITE')[] = ['MANHÃ', 'TARDE', 'NOITE'];
                    return (
                      <div className="space-y-3 text-left">
                        {periods.map(period => {
                          const existingAct = dayCustomActs.find((a: any) => a.time === period);
                          const defaultLabel = period === 'MANHÃ' ? '09:00 - 12:00' : period === 'TARDE' ? '14:00 - 18:00' : '19:00 - 22:00';
                          
                          return (
                            <div 
                              key={period}
                              className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition-all ${
                                existingAct
                                  ? (existingAct.type === 'SCRIMS' 
                                      ? (systemThemeIsDark ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900') 
                                      : existingAct.type === 'DESCANSO' 
                                        ? (systemThemeIsDark ? 'bg-slate-900 border-[#1e2d44]/90 text-slate-300' : 'bg-[#f8fafc] border-[#e2e8f0] text-slate-700')
                                        : (systemThemeIsDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-250' : 'bg-emerald-50 border-emerald-200 text-emerald-900'))
                                  : (systemThemeIsDark ? 'bg-[#04080e]/40 border-[#1e2d44]/30 text-slate-300' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]')
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded ${
                                    existingAct 
                                      ? (systemThemeIsDark ? 'bg-black/40 text-slate-300 font-mono' : 'bg-slate-200 text-[#475569] font-mono') 
                                      : (systemThemeIsDark ? 'bg-slate-900 text-slate-400 font-mono' : 'bg-slate-200 text-[#475569] font-mono')
                                  }`}>
                                    {period} ({defaultLabel})
                                  </span>
                                  {existingAct && (
                                    <span className={`text-[7.5px] px-1 rounded uppercase font-black font-mono tracking-wider ${
                                      existingAct.type === 'SCRIMS' ? 'bg-cyan-400 text-black' : existingAct.type === 'DESCANSO' ? 'bg-slate-400 text-black' : 'bg-emerald-400 text-black'
                                    }`}>
                                      {existingAct.type}
                                    </span>
                                  )}
                                </div>
                                <h5 className={`text-[11px] font-black uppercase mt-1.5 leading-tight ${
                                  systemThemeIsDark ? 'text-white' : 'text-[#1e293b]'
                                }`}>
                                  {existingAct ? existingAct.title : 'Slot Operacional Disponível'}
                                </h5>
                                <p className={`text-[9.5px] leading-snug font-medium ${
                                  systemThemeIsDark ? 'text-gray-500' : 'text-[#64748b]'
                                }`}>
                                  {existingAct ? existingAct.details : 'Nenhuma atividade operacional registrada de momento.'}
                                </p>
                              </div>

                              <div>
                                {existingAct ? (
                                  <button
                                    onClick={() => handleRemoveActivity(selectedGHDay, existingAct.id)}
                                    type="button"
                                    className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/20 cursor-pointer transition-colors"
                                    title="Liberar slot de horário"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModalPeriod(period);
                                      setSelectedActionType(null);
                                    }}
                                    className={`py-1 px-2.5 rounded-lg text-[9px] font-black font-mono uppercase tracking-widest cursor-pointer transition-all ${
                                      systemThemeIsDark 
                                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300' 
                                        : 'bg-[#4f46e5] border border-[#4f46e5] text-white hover:bg-[#3730a3]'
                                    }`}
                                  >
                                    Agendar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Status info/indicator */}
              <div className="mt-4 pt-3 border-t border-[#1e2d44]/30 flex items-center gap-2 text-slate-400 text-[10px] leading-tight font-medium font-sans">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>As atividades de Scrim práticos exigem taxa de $500 p/ bloco. Descanso e Treino de Fundamentos são gratuitos.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal-like Interactive scheduler tray */}
        {modalPeriod && (
          <div className={`mt-6 p-5 rounded-xl border relative text-left transition-all font-sans shadow-md ${
            systemThemeIsDark 
              ? 'border-indigo-500/35 bg-[#060b13]' 
              : 'border-[#e2e8f0] bg-white'
          }`}>
            <h4 className={`font-mono font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b ${
              systemThemeIsDark ? 'text-indigo-400 border-indigo-500/10' : 'text-[#4f46e5] border-slate-200'
            }`}>
              <Sparkles className={`w-4 h-4 shrink-0 animate-pulse ${systemThemeIsDark ? 'text-cyan-400' : 'text-[#4f46e5]'}`} />
              🛠️ Agendar Atividade: Bloco da {modalPeriod} • Dia {selectedGHDay} de {months[selectedMonthIndex].name}
            </h4>

            {/* Step 1: Select Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedActionType('scrim');
                  setScrimOpponentId('');
                  setTreinoFoco(null);
                }}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedActionType === 'scrim' 
                    ? (systemThemeIsDark ? 'bg-cyan-500/10 border-cyan-400 text-[#00E5FF]' : 'bg-cyan-50 border-cyan-400 text-cyan-950') 
                    : (systemThemeIsDark ? 'bg-[#04080e] border-[#1e2d44]/50 text-slate-300 hover:bg-slate-800/10' : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#1e293b] hover:bg-[#e2e8f0]')
                }`}
              >
                <span className={`text-[8px] font-black tracking-widest font-mono leading-none ${
                  systemThemeIsDark ? 'text-[#00E5FF]' : 'text-cyan-850'
                }`}>AÇÃO PRÁTICA</span>
                <h5 className={`text-[11px] font-black uppercase mt-2 leading-snug ${systemThemeIsDark ? 'text-white' : 'text-[#1e293b]'}`}>Sessão de Scrim Match</h5>
                <p className={`text-[9px] mt-1 leading-normal font-sans font-medium ${systemThemeIsDark ? 'text-gray-400' : 'text-[#475569]'}`}>
                  Pratique contra equipes rivais da liga regular de eSports. Melhora entrosamento e mecânica. Custo de $500.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedActionType('descanso');
                  setScrimOpponentId('');
                  setTreinoFoco(null);
                }}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedActionType === 'descanso' 
                    ? (systemThemeIsDark ? 'bg-slate-500/10 border-slate-450 text-slate-300' : 'bg-slate-100 border-slate-400 text-slate-900') 
                    : (systemThemeIsDark ? 'bg-[#04080e] border-[#1e2d44]/50 text-slate-300 hover:bg-slate-800/10' : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#1e293b] hover:bg-[#e2e8f0]')
                }`}
              >
                <span className={`text-[8px] font-black tracking-widest font-mono leading-none ${
                  systemThemeIsDark ? 'text-slate-400' : 'text-slate-600'
                }`}>QUALIDADE DE VIDA</span>
                <h5 className={`text-[11px] font-black uppercase mt-2 leading-snug ${systemThemeIsDark ? 'text-white' : 'text-[#1e293b]'}`}>Folga / Recovery</h5>
                <p className={`text-[9px] mt-1 leading-normal font-sans font-medium ${systemThemeIsDark ? 'text-gray-400' : 'text-[#475569]'}`}>
                  Dê folga aos atletas residenciais. Restaura saúde moral e staminas da base & principal. Grátis.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedActionType('treino_especifico');
                  setScrimOpponentId('');
                  setTreinoFoco(null);
                }}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedActionType === 'treino_especifico' 
                    ? (systemThemeIsDark ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300' : 'bg-emerald-50 border-emerald-400 text-emerald-950') 
                    : (systemThemeIsDark ? 'bg-[#04080e] border-[#1e2d44]/50 text-slate-300 hover:bg-slate-800/10' : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#1e293b] hover:bg-[#e2e8f0]')
                }`}
              >
                <span className={`text-[8px] font-black tracking-widest font-mono leading-none ${
                  systemThemeIsDark ? 'text-[#00FF88]' : 'text-emerald-850'
                }`}>EDUCAÇÃO COLETIVA</span>
                <h5 className={`text-[11px] font-black uppercase mt-2 leading-snug ${systemThemeIsDark ? 'text-white' : 'text-[#1e293b]'}`}>Treino em Fundamentos</h5>
                <p className={`text-[9px] mt-1 leading-normal font-sans font-medium ${systemThemeIsDark ? 'text-gray-400' : 'text-[#475569]'}`}>
                  Prática técnica segmentada. Aumenta atributos específicos de macro VODs, reflexos, ou físico individual. Grátis.
                </p>
              </button>
            </div>

            {/* Step 2: Custom details based on Type selection */}
            {selectedActionType === 'scrim' && (
              <div className={`space-y-4 p-4 rounded-lg border mb-5 text-left ${
                systemThemeIsDark ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className={`text-[10px] font-black uppercase tracking-wider font-mono ${
                    systemThemeIsDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Verificar disponibilidade de outras organizações:
                  </label>
                  <input
                    type="text"
                    value={scrimSearchQuery}
                    onChange={(e) => setScrimSearchQuery(e.target.value)}
                    placeholder="Filtrar adversário..."
                    className={`px-2 py-1.5 border rounded text-[10px] font-mono font-bold focus:outline-none focus:border-cyan-400 w-44 ${
                      systemThemeIsDark ? 'border-[#1e2d44] bg-[#03070d] text-white' : 'border-slate-300 bg-white text-slate-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {gameState.teams
                    .filter(tItem => {
                      if (scrimSearchQuery && !tItem.name.toLowerCase().includes(scrimSearchQuery.toLowerCase()) && !tItem.acronym.toLowerCase().includes(scrimSearchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map(tItem => {
                      const avail = isTeamAvailable(tItem, selectedGHDay, modalPeriod);
                      const isSelected = scrimOpponentId === tItem.id;
                      
                      return (
                        <button
                          key={tItem.id}
                          disabled={!avail}
                          type="button"
                          onClick={() => setScrimOpponentId(tItem.id)}
                          className={`p-2 rounded border flex flex-col justify-between items-center h-16 transition-all text-center select-none cursor-pointer ${
                            isSelected 
                              ? (systemThemeIsDark ? 'bg-cyan-500/20 border-cyan-400 text-[#00E5FF] scale-102' : 'bg-cyan-100 border-cyan-500 text-cyan-900 scale-102')
                              : avail 
                                ? (systemThemeIsDark ? 'bg-slate-950 border-[#1e2d44] text-slate-300 hover:border-cyan-500/30' : 'bg-white border-slate-250 text-slate-800 hover:border-cyan-500')
                                : (systemThemeIsDark ? 'bg-slate-950 border-slate-950 text-slate-650 cursor-not-allowed opacity-30' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-30')
                          }`}
                        >
                          <span className="font-mono text-[10.5px] font-black tracking-wider">{tItem.acronym}</span>
                          <span className={`text-[7px] font-black uppercase leading-none px-1 py-0.5 rounded font-sans ${
                            avail ? 'bg-emerald-500/10 text-[#00FF88] dark:text-[#00FF88]' : 'bg-rose-500/5 text-gray-500'
                          }`}>
                            {avail ? 'Livre' : 'Ocupado'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {selectedActionType === 'treino_especifico' && (
              <div className={`space-y-4 p-4 rounded-lg border mb-5 text-left font-sans ${
                systemThemeIsDark ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-2 font-mono ${
                  systemThemeIsDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Selecione o Eixo de Fundamentos para este Bloco Operacional:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'tatico', label: 'Tático / Draft Playstyle', bonus: '+5 Sinergia Roster', details: 'Foco no meta-game competitiva, pocket picks secretos e contra-respostas.' },
                    { id: 'macro', label: 'Tomada de Decisão / Macro', bonus: '+1 Macro & Map Vision', details: 'Foco no roaming da selva, controle tático ao redor de Baron e VOD reviews.' },
                    { id: 'mecanica', label: 'Mecânica Individual SoloQ', bonus: '+2 Farm & Mecânica', details: 'Maratona individual nas filas de elite para otimizar reflexos moleculares.' },
                    { id: 'fisico', label: 'Cardio / Wellness Físico', bonus: '+15 Estamina / Stamina', details: 'Treino regenerativo físico mitigando desgastes crônicos das costas.' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTreinoFoco(f.id as any)}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        treinoFoco === f.id
                          ? (systemThemeIsDark ? 'bg-emerald-500/15 border-emerald-450' : 'bg-emerald-550/15 border-emerald-500')
                          : (systemThemeIsDark ? 'bg-[#04080e] border-[#1e2d44]/50 hover:bg-slate-800/10' : 'bg-white border-slate-250 hover:bg-slate-50')
                      }`}
                    >
                      <h5 className={`font-mono text-[10.5px] font-black uppercase ${systemThemeIsDark ? 'text-white' : 'text-slate-800'}`}>{f.label}</h5>
                      <span className={`${systemThemeIsDark ? 'text-[#00FF88]' : 'text-emerald-700'} text-[9.5px] font-bold uppercase mt-1 leading-none font-mono`}>{f.bonus}</span>
                      <p className={`text-[8.5px] leading-snug mt-1 font-medium font-sans ${systemThemeIsDark ? 'text-gray-500' : 'text-[#475569]'}`}>{f.details}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm & Cancel action tray */}
            <div className={`flex items-center justify-end gap-3 pt-3 border-t font-sans ${
              systemThemeIsDark ? 'border-[#1e2d44]/30' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setModalPeriod(null);
                  setSelectedActionType(null);
                  setScrimOpponentId('');
                  setTreinoFoco(null);
                }}
                className={`py-2 px-4 border rounded-lg text-[10px] font-bold font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                  systemThemeIsDark 
                    ? 'border-slate-700/60 text-slate-300 hover:text-white bg-transparent' 
                    : 'border-[#cbd5e1] text-[#475569] hover:bg-slate-50 bg-transparent'
                }`}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={(() => {
                  if (!selectedActionType) return true;
                  if (selectedActionType === 'scrim' && !scrimOpponentId) return true;
                  if (selectedActionType === 'treino_especifico' && !treinoFoco) return true;
                  return false;
                })()}
                onClick={() => handleScheduleActivity(selectedGHDay, modalPeriod, selectedActionType!)}
                className={`py-2 px-5 rounded-lg text-[10px] font-black font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                  (() => {
                    const isDisabled = !selectedActionType || 
                      (selectedActionType === 'scrim' && !scrimOpponentId) || 
                      (selectedActionType === 'treino_especifico' && !treinoFoco);
                    if (isDisabled) return 'bg-gray-500/55 text-zinc-400 cursor-not-allowed opacity-60';
                    return systemThemeIsDark ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-indigo-600 text-white hover:bg-indigo-700';
                  })()
                }`}
              >
                Confirmar Bloco Operacional
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

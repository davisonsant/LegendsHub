/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Zap, Coffee, Activity, Smile, Users, Info, Sparkles, 
  Terminal, Check, Copy, AlertTriangle, Play, BookOpen, Heart, Award
} from 'lucide-react';
import { GameState, Player } from '../types';
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
                {activeLang === 'pt' ? 'MANTENIMIENTO DE SALÚD & PREVENÇÃO DE BURNOUT' : activeLang === 'es' ? 'PREVENCIÓN DE BURNOUT & BIENESTAR DE JUGADORES' : 'ATHLETES WELLNESS & BURNOUT SHIELD'}
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

      {/* CORE DATA ENGINE / DATABASE PAYLOAD CONSOLE */}
      <div className={`rounded-xl p-5 shadow-lg ${
        systemThemeIsDark ? 'bg-[#040a14] border border-[#1e2d44]/70' : 'bg-slate-100 border border-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              systemThemeIsDark 
                ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20' 
                : 'bg-indigo-600/10 text-indigo-700 border-indigo-500/20'
            }`}>
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                {t.json_payload_title}
                <span className="px-1.5 py-0.5 font-mono text-[8.5px] bg-[#00FF88]/10 text-[#00FF88] rounded-md font-bold uppercase animate-pulse">
                  STATUS: ONLINE
                </span>
                <span className="px-1.5 py-0.5 font-mono text-[8.5px] bg-indigo-500/15 text-indigo-400 rounded-md font-bold uppercase font-sans">
                  ENGINE: ACTIVE
                </span>
              </h4>
              <p className={`text-[10px] font-mono mt-0.5 ${systemThemeIsDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {t.api_sim_terminal}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className={`px-4 py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                isConsoleExpanded 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : (systemThemeIsDark 
                      ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-[#00FF88] border-emerald-500/30' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent')
              }`}
            >
              {isConsoleExpanded ? t.ocultar_payload : t.exibir_payload}
            </button>
          </div>
        </div>

        <p className={`text-[10.5px] leading-relaxed max-w-4xl mt-3 ${systemThemeIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t.api_desc}
        </p>

        {isConsoleExpanded && (
          <div className="mt-5 space-y-3 border-t border-[#1e2d44]/30 pt-4 animate-fade-in text-left">
            
            {/* Interactive Simulators Controls Line */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-gray-500 block leading-none">{t.selecionar_idioma_teste}</label>
                <div className="flex gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-lg border border-[#1e2d44]/50">
                  <button 
                    onClick={() => setForcedLang('pt')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'pt' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    PT-BR
                  </button>
                  <button 
                    onClick={() => setForcedLang('en')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'en' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN-US
                  </button>
                  <button 
                    onClick={() => setForcedLang('es')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'es' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    ES-ES
                  </button>
                  {forcedLang !== null && (
                    <button 
                      onClick={() => setForcedLang(null)} 
                      className="px-1.5 py-1 text-[8.5px] font-mono bg-rose-500/25 text-rose-400 rounded hover:opacity-90 font-black"
                      title="Reset language synchronization"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>

              {/* Reactive Console Inputs Simulator */}
              <div className="md:col-span-6 space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-gray-400 dark:text-gray-500 block leading-none">
                  {t.enviar_comando} (Ex: {"{\"acao\": \"definir_rotina_scrim\", \"id_scrim\": \"scrim_early\"}"})
                </label>
                <div className="flex gap-1 bg-black/10 dark:bg-black/40 p-1 rounded-lg border border-[#1e2d44]/50">
                  <input
                    type="text"
                    value={consoleCommand}
                    onChange={(e) => setConsoleCommand(e.target.value)}
                    placeholder='{"acao": "definir_rotina_scrim", "id_scrim": "scrim_early"}'
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-550 dark:placeholder-slate-600 focus:outline-none font-mono min-w-0"
                  />
                  <button
                    onClick={submitConsoleAction}
                    className="px-3.5 py-1.5 bg-[#00E5FF] text-black text-[9px] font-mono font-black uppercase tracking-wider rounded-md hover:bg-[#33ebff] transition-all cursor-pointer"
                  >
                    SEND
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={triggerCopy}
                  className="w-full bg-slate-900 border border-slate-700/60 hover:border-[#00FF88] text-gray-300 hover:text-white text-[9px] font-mono font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 py-2.5 shadow-md"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {isCopied ? t.copiado : t.copiar}
                </button>
              </div>
            </div>

            {commandFeedback && (
              <div className={`p-3 rounded-lg border font-mono text-[10.5px] leading-relaxed select-none ${
                commandFeedback.includes('ERRO') 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-450' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-[#00FF88]'
              }`}>
                {commandFeedback}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 px-1 uppercase select-none">
                <span>DATABASE STREAM</span>
                <span>Active Language: {activeLang.toUpperCase()}</span>
                <span>Theme Ref: {systemThemeIsDark ? "DARK_MODE" : "LIGHT_MODE"}</span>
              </div>
              <pre className="bg-slate-950/95 text-emerald-400 p-4.5 rounded-lg overflow-x-auto text-[11px] font-mono border border-slate-800/80 shadow-inner max-h-[350px] leading-relaxed">
                {JSON.stringify(liveJsonResponse, null, 2)}
              </pre>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

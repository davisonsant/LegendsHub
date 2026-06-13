/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Users, Shield, Send, AlertTriangle, AlertCircle, 
  Check, UserPlus, Trash2, HelpCircle, DollarSign, Clock, Award, 
  Play, Zap, TrendingUp, UserCheck, Briefcase, Sparkles, Globe
} from 'lucide-react';
import { GameState, Position, Player } from '../types';

interface ScoutingTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  theme?: 'light' | 'dark';
  onSelectPlayer?: (playerId: string) => void;
}

export interface Scout {
  id: string;
  name: string;
  specialty: string;
  stars: number;
  status: 'Disponível' | 'Alocado';
  missionDestination?: string;
  salary: number;
  contractRemaining: number;
  isHead?: boolean;
}

export interface DiscoveredTalent {
  id: string;
  nickname: string;
  fullName: string;
  position: Position;
  age: number;
  potential: 'A+' | 'S' | 'SS' | 'A' | 'B-' | 'B+';
  overallRating: number;
  region: string;
  discoveredBy: string;
  isContracted: boolean;
}

const INITIAL_SCOUTS: Scout[] = [
  { id: 'scout-1', name: 'Guilherme Salles', specialty: 'ROTA INFERIOR (CBLOL)', stars: 5, status: 'Disponível', salary: 3500, contractRemaining: 18, isHead: false },
  { id: 'scout-2', name: 'Aiko Sato', specialty: 'ROTAS SOLO (LCK/LPL)', stars: 5, status: 'Disponível', salary: 4200, contractRemaining: 24, isHead: true },
  { id: 'scout-3', name: 'Jack Marshall', specialty: 'MACRO & VISÃO (LCS)', stars: 4, status: 'Disponível', salary: 2800, contractRemaining: 12, isHead: false },
  { id: 'scout-4', name: 'Helmi Virtanen', specialty: 'NOVAS PROMESSAS (LEC)', stars: 4, status: 'Disponível', salary: 3100, contractRemaining: 16, isHead: false },
  { id: 'scout-5', name: 'Jean-Pierre Laurent', specialty: 'SUPORTES & UTILIDADE (LEC)', stars: 3, status: 'Disponível', salary: 1900, contractRemaining: 8, isHead: false }
];

const INITIAL_DISCOVERED: DiscoveredTalent[] = [
  {
    id: 'dt-1',
    nickname: 'SambaMid',
    fullName: 'Lucas Oliveira Vasconcelos',
    position: 'MID',
    age: 16,
    potential: 'S',
    overallRating: 64,
    region: 'São Paulo (CBLOL)',
    discoveredBy: 'Guilherme Salles',
    isContracted: false
  },
  {
    id: 'dt-2',
    nickname: 'NextFaker',
    fullName: 'Kim Ji-woo',
    position: 'MID',
    age: 15,
    potential: 'SS',
    overallRating: 69,
    region: 'Seul (LCK)',
    discoveredBy: 'Aiko Sato',
    isContracted: false
  },
  {
    id: 'dt-3',
    nickname: 'EuroCarry',
    fullName: 'Lars Nørgaard',
    position: 'ADC',
    age: 17,
    potential: 'A+',
    overallRating: 61,
    region: 'Dinamarca (LEC - Base de Talentos)',
    discoveredBy: 'Helmi Virtanen',
    isContracted: false
  }
];

export default function ScoutingTab({
  gameState,
  onUpdateGameState,
  triggerNotification,
  theme = 'light',
  onSelectPlayer
}: ScoutingTabProps) {
  const isDark = theme === 'dark';

  // State local das Abas de painel
  const [activeTab, setActiveTab] = useState<'map' | 'staff'>('map');

  // Helper to load scouts dynamically from the gameState or local storage
  const getScoutsFromGameStateAndStorage = (): Scout[] => {
    const staffEmps = gameState.corporationStaffEmployees || [];
    const olheiros = staffEmps.filter((emp: any) => emp.departamento === 'OLHEIROS');
    
    let sourceEmployees = olheiros;
    if (sourceEmployees.length === 0) {
      const savedStaff = localStorage.getItem('legendshub_corporation_staff');
      if (savedStaff) {
        try {
          const parsed = JSON.parse(savedStaff);
          sourceEmployees = parsed.filter((emp: any) => emp.departamento === 'OLHEIROS');
        } catch (e) {}
      }
    }

    const mapped: Scout[] = sourceEmployees.map((emp: any) => {
      const starsVal = Math.max(1, Math.min(5, Math.ceil((emp.nivel_eficiencia || emp.nivel_experiencia || 80) / 20)));
      return {
        id: emp.id,
        name: emp.nome,
        specialty: emp.especialidade || `ROTAS E MONITORAMENTO (${emp.cargo || 'Olheiro'})`,
        stars: starsVal,
        status: 'Disponível',
        salary: emp.salario_semanal || emp.salary || 2500,
        contractRemaining: emp.semanas_contrato || emp.contractRemaining || 32,
        isHead: emp.id === 'job-7' || emp.id === 'scout-2'
      };
    });

    if (mapped.length > 0) {
      return mapped;
    }

    return INITIAL_SCOUTS.map(sc => ({
      ...sc
    }));
  };

  // Core internal persisted states
  const [scouts, setScouts] = useState<Scout[]>(() => {
    const rawScouts = getScoutsFromGameStateAndStorage();
    const saved = localStorage.getItem('legendshub_custom_scouts');
    if (!saved) return rawScouts;
    try {
      const parsed = JSON.parse(saved) as Scout[];
      return rawScouts.map(sc => {
        const existing = parsed.find(p => p.id === sc.id);
        if (existing) {
          return {
            ...sc,
            status: existing.status === 'Alocado' ? 'Alocado' : 'Disponível',
            missionDestination: existing.missionDestination,
            isHead: existing.isHead !== undefined ? existing.isHead : sc.isHead
          };
        }
        return sc;
      });
    } catch (e) {
      return rawScouts;
    }
  });

  const [discoveredPool, setDiscoveredPool] = useState<DiscoveredTalent[]>(() => {
    const saved = localStorage.getItem('legendshub_discovered_pool');
    if (!saved) return INITIAL_DISCOVERED;
    try {
      const parsed = JSON.parse(saved) as DiscoveredTalent[];
      return parsed.filter(t => !t.isContracted); // Manter somente ativos não contratados
    } catch (e) {
      return INITIAL_DISCOVERED;
    }
  });

  // Synchronize when gaming office or central de empregos changes the employees list
  useEffect(() => {
    const rawScouts = getScoutsFromGameStateAndStorage();
    setScouts(prev => {
      return rawScouts.map(sc => {
        const existing = prev.find(p => p.id === sc.id);
        if (existing) {
          return {
            ...sc,
            status: existing.status === 'Alocado' ? 'Alocado' : 'Disponível',
            missionDestination: existing.missionDestination,
            isHead: existing.isHead !== undefined ? existing.isHead : sc.isHead
          };
        }
        return sc;
      });
    });
  }, [gameState.corporationStaffEmployees]);

  // Persistência local robusta
  useEffect(() => {
    localStorage.setItem('legendshub_custom_scouts', JSON.stringify(scouts));
  }, [scouts]);

  useEffect(() => {
    localStorage.setItem('legendshub_discovered_pool', JSON.stringify(discoveredPool));
  }, [discoveredPool]);

  // Identificação ativa do Head of Scouting
  const headScout = scouts.find(s => s.isHead) || scouts[0];
  const costDiscountPercentage = 15; // 15% de desconto em expedições de viagem
  const bonusChancePercentage = 5;   // +5% de chance de obter S-tier/SS-tier

  // World region pins list definitions
  const MAP_PINS = [
    { id: 'pin-1', name: 'Califórnia', code: 'LCS', x: 18, y: 35, desc: 'América do Norte - Prospecção de Macro' },
    { id: 'pin-2', name: 'São Paulo', code: 'CBLOL', x: 35, y: 70, desc: 'América do Sul - Jogadas Mecânicas & Ousadia' },
    { id: 'pin-3', name: 'Madrid', code: 'LEC', x: 48, y: 35, desc: 'Europa Ocidental - Visão Tática de Selva' },
    { id: 'pin-4', name: 'Berlim', code: 'LEC', x: 53, y: 31, desc: 'Canal Central LEC - Coordenação de Rota' },
    { id: 'pin-5', name: 'Dinamarca', code: 'LEC - Base de Talentos', x: 53, y: 24, desc: 'Escandinávia - Berço dos Melhores Carries' },
    { id: 'pin-6', name: 'Finlândia', code: 'LEC - Base de Talentos', x: 58, y: 21, desc: 'Norte Europeu - Iniciadores Absolutos' },
    { id: 'pin-7', name: 'Pequim', code: 'LPL', x: 78, y: 33, desc: 'China - Lutas Caóticas e agressividade extrema' },
    { id: 'pin-8', name: 'Seul', code: 'LCK', x: 83, y: 34, desc: 'Coreia do Sul - Microcontrole e Macro Perfeito' },
    { id: 'pin-9', name: 'Japão', code: 'LCP', x: 88, y: 35, desc: 'Ásia-Pacífico - Revelação Rápida no SoloQ' }
  ];

  // Active hover pin index ID state
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Modal target pin and state
  const [modalPin, setModalPin] = useState<typeof MAP_PINS[0] | null>(null);

  // Modal allocations configs
  const [selectedScoutId, setSelectedScoutId] = useState<string>('');
  const [sliderStep, setSliderStep] = useState<number>(1); // 0, 1, 2 default to 1 (45 days)

  // POP-UP / MODAL DE NEGOCIAÇÃO DE CONTRATO (ACADEMY)
  const [negotiatingTalent, setNegotiatingTalent] = useState<DiscoveredTalent | null>(null);
  const [negotiatingSplits, setNegotiatingSplits] = useState<number>(2); // Duração: 1, 2 ou 3 Splits
  const [negotiatingSalary, setNegotiatingSalary] = useState<number>(1200); // Salário base de $300 a $2000
  const [bonusAcademyWin, setBonusAcademyWin] = useState<boolean>(true);
  const [bonusOvrTarget, setBonusOvrTarget] = useState<boolean>(false);
  const [bonusExitClause, setBonusExitClause] = useState<boolean>(false);

  // Auto filter available lists
  const availableScouts = scouts.filter(s => s.status === 'Disponível');

  // Determinar bônus e valores das expedições aplicando o Head of Scouting
  const getSliderPricingAndChance = (step: number) => {
    let baseCost = 0;
    let chanceLabel = '';
    switch (step) {
      case 0:
        baseCost = 1200;
        chanceLabel = headScout ? '40% chance de S-tier' : '35% chance de S-tier';
        break;
      case 1:
        baseCost = 4500;
        chanceLabel = headScout ? '70% chance de S-tier' : '65% chance de S-tier';
        break;
      case 2:
        baseCost = 15000;
        chanceLabel = headScout ? '99% chance de S-tier' : '95% chance de S-tier';
        break;
      default:
        return { originalCost: 0, finalCost: 0, chance: '0%' };
    }

    const discountedCost = headScout ? Math.floor(baseCost * (1 - costDiscountPercentage / 100)) : baseCost;
    return {
      originalCost: baseCost,
      finalCost: discountedCost,
      chance: chanceLabel
    };
  };

  const currentSliderValues = getSliderPricingAndChance(sliderStep);

  const getSliderLabel = (step: number) => {
    switch (step) {
      case 0: return "Duração: 10 Dias (Prospecção rápida de baixo custo)";
      case 1: return "Duração: 45 Dias (Prospecção equilibrada - Padrão)";
      case 2: return "Duração: Permanente (Monitoramento fixo focado em Superestrelas)";
      default: return "";
    }
  };

  const handleOpenPinModal = (pin: typeof MAP_PINS[0]) => {
    // 2. Validação de Olheiros Disponíveis
    if (availableScouts.length === 0) {
      alert("Operação Cancelada: Não há Olheiros (Scouts) disponíveis no momento ou todos estão alocados.");
      return;
    }
    setModalPin(pin);
    setSelectedScoutId(availableScouts[0].id);
    setSliderStep(1);
  };

  const handleStartMission = () => {
    if (!modalPin || !selectedScoutId) return;

    const assignedScout = scouts.find(s => s.id === selectedScoutId);
    if (!assignedScout) return;

    // Check if team can afford applying finalCost with Head discount
    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
    if (playerTeam && playerTeam.budget && playerTeam.budget < currentSliderValues.finalCost) {
      alert(`Fundos insuficientes! Precisamos de pelo menos $${currentSliderValues.finalCost} para financiar esta expedição.`);
      return;
    }

    // 1. Mark Scout as in mission (Alocado)
    setScouts(prev => prev.map(s => {
      if (s.id === selectedScoutId) {
        return { ...s, status: 'Alocado', missionDestination: `${modalPin.name} (${modalPin.code})` };
      }
      return s;
    }));

    // Deduct cost from game money
    if (playerTeam && playerTeam.budget) {
      const updatedTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          return { ...t, budget: t.budget - currentSliderValues.finalCost };
        }
        return t;
      });
      onUpdateGameState({
        ...gameState,
        teams: updatedTeams
      });
    }

    // 2. Procedural Discovery roll generator
    const nicknames = [
      'SambaMid', 'NextFaker', 'CariocaVibe', 'HyperSlay', 'Malignant',
      'QuantumTop', 'GoldenWings', 'SilentSmite', 'PixelCarry', 'ZenVibe',
      'DragonRift', 'EclipseGod', 'CronoZ', 'HextechPacer', 'AeroGamer',
      'BeastMid', 'SnowCarry', 'VortexTOP', 'SlayerSUP', 'ForestJNG'
    ];
    const firstNames = ['Matheus', 'Rodrigo', 'Min-jun', 'Jonas', 'Kenji', 'Arnaud', 'Lucas', 'Thiago', 'Oliver', 'Hans', 'Gabriel', 'Enzo', 'Leonardo', 'Yuki'];
    const lastNames = ['Souza', 'Shin', 'Sato', 'Müller', 'Dupont', 'Azevedo', 'Virtanen', 'Nielsen', 'Silva', 'Kovacs', 'Santos', 'Lima', 'Suzuki'];
    const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];

    const pickedNick = nicknames[Math.floor(Math.random() * nicknames.length)] + Math.floor(Math.random() * 80 + 10);
    const pickedName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const pickedPos = positions[Math.floor(Math.random() * positions.length)];
    
    // Chance de potencial influenciado pelo Head de Scouting
    const rollPot = Math.random();
    let pickedPot: 'A+' | 'S' | 'SS' | 'A' | 'B-' | 'B+' = 'A';
    
    const modifier = headScout ? 0.08 : 0.0; // Ganho de chance adicional pelo Head
    const adjustedRoll = rollPot + modifier;

    if (sliderStep === 0) {
      pickedPot = adjustedRoll > 0.77 ? 'S' : adjustedRoll > 0.45 ? 'A' : 'B-';
    } else if (sliderStep === 1) {
      pickedPot = adjustedRoll > 0.81 ? 'SS' : adjustedRoll > 0.45 ? 'S' : 'A';
    } else {
      pickedPot = adjustedRoll > 0.85 ? 'SS' : adjustedRoll > 0.25 ? 'S' : 'A+';
    }

    const ovr = pickedPot === 'SS' ? Math.floor(Math.random() * 6) + 68 // 68-73
              : pickedPot === 'S' ? Math.floor(Math.random() * 5) + 63  // 63-67
              : pickedPot === 'A+' ? Math.floor(Math.random() * 4) + 60 // 60-63
              : Math.floor(Math.random() * 5) + 55;                     // 55-59

    const newProspect: DiscoveredTalent = {
      id: `dt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nickname: pickedNick,
      fullName: pickedName,
      position: pickedPos,
      age: Math.floor(Math.random() * 4) + 15, // 15-18
      potential: pickedPot,
      overallRating: ovr,
      region: `${modalPin.name} (${modalPin.code})`,
      discoveredBy: assignedScout.name,
      isContracted: false
    };

    // Adiciona ao pool sem limitação de corte rígido
    setDiscoveredPool(prev => {
      return [newProspect, ...prev];
    });

    triggerNotification(
      "🔍 Expedição de Scouting Concluída!",
      `${assignedScout.name} encontrou o promissor ${pickedNick} em ${modalPin.name}! Slot preenchido de observação.`
    );

    setModalPin(null);
  };

  const handleRecallScout = (id: string) => {
    setScouts(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: 'Disponível', missionDestination: undefined };
      }
      return s;
    }));
    triggerNotification("📡 Olheiro De Volta", "O olheiro foi chamado de volta e reatribuído à agência como Disponível.");
  };

  // Intercepta o clique para abrir o Modal de Assinatura / Negociação
  const handleOpenNegotiation = (prospect: DiscoveredTalent) => {
    setNegotiatingTalent(prospect);
    setNegotiatingSplits(2); // Duração inicial padrão de 2 splits
    setNegotiatingSalary(1100); // Salário base padrão
    setBonusAcademyWin(true);
    setBonusOvrTarget(false);
    setBonusExitClause(false);
  };

  // Confirmação final do Contrato com Vínculo de Formação
  const handleConfirmAcademyContract = () => {
    if (!negotiatingTalent) return;

    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
    if (!playerTeam) return;

    if (playerTeam.academy && playerTeam.academy.length >= 8) {
      alert("A academia de base (Academy) já atingiu o limite de 8 ciberatletas! Promova ou dispense alguns talentos antes de selar mais acordos.");
      return;
    }

    // Calcula o potencial numérico representativo
    const numericPotential = negotiatingTalent.potential === 'SS' ? 92 
                           : negotiatingTalent.potential === 'S' ? 88 
                           : negotiatingTalent.potential === 'A+' ? 83 
                           : 75;

    // Convert DiscoveredTalent into normal custom Player inside base draft database
    const newPlayer: Player = {
      id: `academy-${negotiatingTalent.id}`,
      name: negotiatingTalent.nickname,
      realName: negotiatingTalent.fullName,
      nationality: negotiatingTalent.region.split(' ')[0],
      age: negotiatingTalent.age,
      position: negotiatingTalent.position,
      overallRating: negotiatingTalent.overallRating,
      potential: numericPotential,
      personality: 'Promissor Jovem',
      popularity: Math.floor(Math.random() * 30) + 10,
      marketValue: negotiatingTalent.overallRating * 16050,
      salary: negotiatingSalary, // Definido diretamente no pop-up
      contractMonths: negotiatingSplits * 6, // Definido diretamente no pop-up de splits
      motivation: 95,
      stamina: 100,
      chemistry: 40,
      championPool: ['Kai\'sa', 'Xayah', 'Ezreal', 'Jinx'],
      isPlayerControlled: true,
      attributes: {
        mechanics: negotiatingTalent.overallRating + 4,
        macro: negotiatingTalent.overallRating - 5,
        communication: negotiatingTalent.overallRating - 2,
        leadership: negotiatingTalent.overallRating - 8,
        consistency: negotiatingTalent.overallRating,
        emotionalControl: negotiatingTalent.overallRating + 1,
        farm: negotiatingTalent.overallRating + 3,
        mapVision: negotiatingTalent.overallRating - 4,
        playoffPerformance: 60
      }
    };

    // Update real organizational team roster academy
    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          academy: [...(t.academy || []), newPlayer]
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    // Remove instantaneamente o card do Pool liberando o slot
    setDiscoveredPool(prev => prev.filter(dt => dt.id !== negotiatingTalent.id));

    triggerNotification(
      "💎 Contrato de Formação Sólido!",
      `${negotiatingTalent.nickname} assinou contrato por ${negotiatingSplits} Splits ($${negotiatingSalary}/Sem) e entrou para o Academy!`
    );

    setNegotiatingTalent(null);
  };

  const handleDismissDiscovered = (id: string) => {
    setDiscoveredPool(prev => prev.filter(p => p.id !== id));
  };

  // Promover Olheiro a LÍDER ATIVO (Head of Scouting)
  const handlePromoteToHead = (scoutId: string) => {
    setScouts(prev => prev.map(s => ({
      ...s,
      isHead: s.id === scoutId
    })));
    
    const promoted = scouts.find(s => s.id === scoutId);
    if (promoted) {
      triggerNotification(
        "👑 Head of Scouting Selecionado!",
        `${promoted.name} foi nomeado líder administrativo. Ativos os bônus de -15% Custo e +5% S/SS-chance.`
      );
    }
  };

  // Auxiliar para conseguir as iniciais sólidas de Olheiros
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : 'S';
  };

  // Auxiliar estético para a badge do olheiro no avatar
  const getBadgeGradient = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = sum % 4;
    switch (index) {
      case 0: return 'from-blue-600 to-indigo-700 text-indigo-10s';
      case 1: return 'from-amber-500 to-orange-600 text-orange-100';
      case 2: return 'from-emerald-500 to-teal-700 text-teal-100';
      default: return 'from-purple-600 to-pink-700 text-pink-100';
    }
  };

  return (
    <div className={`p-1 select-none transition-colors duration-300 ${
      isDark ? 'text-white' : 'text-slate-800'
    }`}>
      
      {/* 1. VISÃO GERAL E IDENTIDADE VISUAL */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className={`w-5 h-5 ${isDark ? 'text-[#00cbd6]' : 'text-blue-600'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#00cbd6]' : 'text-blue-600'}`}>
              ESPORTS INTEL NETWORK
            </span>
          </div>
          <h2 className={`text-lg font-display font-black uppercase tracking-wide leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Rede de Monitoramento Global
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug font-sans">
            Aloque seus olheiros em servidores mundiais para descobrir talentos ocultos e impulsionar a categoria de base da sua organização de Esports.
          </p>
        </div>

        {/* Funds box info */}
        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
          isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-gray-400 block uppercase text-[8px] tracking-wider mb-0.5">Orçamento da Organização</span>
          <span className="text-emerald-400 font-extrabold text-sm flex items-center">
            <DollarSign className="w-3.5 h-3.5 inline mr-0.5 shrink-0" />
            {(gameState.teams.find(t => t.id === gameState.playerTeamId)?.budget || 0).toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* SISTEMA DE ABAS INTERNAS */}
      <div className="flex gap-2 border-b border-slate-800/60 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wide rounded-lg border transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'bg-[#1458f5] border-[#1458f5] text-white font-extrabold shadow-[0_0_12px_rgba(20,88,245,0.25)]'
              : isDark 
                ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          🌍 Mapa de Monitoramento
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wide rounded-lg border transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-[#1458f5] border-[#1458f5] text-white font-extrabold shadow-[0_0_12px_rgba(20,88,245,0.25)]'
              : isDark 
                ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          💼 Equipe de Olheiros
        </button>
      </div>

      {/* CONTEÚDO DINÂMICO DAS ABAS */}
      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* World map layout container */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className={`p-4 rounded-2xl border relative flex flex-col h-[52vh] min-h-[420px] justify-between overflow-hidden ${
              isDark ? 'bg-[#060c18] border-[#1e2d44]' : 'bg-[#f4f6fa] border-slate-200'
            }`}>

              {/* Simulated Vector lines overlaying background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="35%" y1="70%" x2="18%" y2="35%" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="35%" y1="70%" x2="48%" y2="35%" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="48%" y1="35%" x2="78%" y2="33%" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="78%" y1="33%" x2="83%" y2="34%" stroke="#0ea5e9" strokeWidth="1" />
                <line x1="83%" y1="34%" x2="88%" y2="35%" stroke="#0ea5e9" strokeWidth="1" />
              </svg>

              {/* Interactive geographic pins overlay */}
              <div className="absolute inset-0 w-full h-full">
                {MAP_PINS.map(pin => {
                  const isHovered = hoveredPinId === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => handleOpenPinModal(pin)}
                      onMouseEnter={() => setHoveredPinId(pin.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group transition-all p-2 z-10 cursor-pointer focus:outline-none"
                      title={`Clique para explorar ${pin.name} (${pin.code})`}
                    >
                      {/* Glowing ring */}
                      <span className={`absolute inset-0 rounded-full scale-[2.2] animate-ping duration-[3500ms] opacity-25 ${
                        isHovered ? 'bg-red-500' : 'bg-sky-500'
                      }`} />
                      
                      {/* Circle Pin dot */}
                      <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        isHovered 
                          ? 'bg-[#ef4444] border-white scale-120 shadow-[0_0_12px_rgba(239,68,68,0.7)]' 
                          : 'bg-[#0ea5e9] border-[#070d19] scale-100 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                      }`} />

                      {/* Popover micro details tag */}
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-[#070d19]/90 border border-slate-700/50 flex flex-col w-[130px] shadow-lg pointer-events-none transition-all duration-200 ${
                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}>
                        <span className="text-[9px] font-black text-white leading-none mb-0.5">{pin.name}</span>
                        <span className="text-[7.5px] font-bold text-sky-400 tracking-wider leading-none uppercase">{pin.code}</span>
                        <span className="text-[7.5px] font-semibold text-gray-400 leading-tight mt-1 leading-none">{pin.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend guide tags */}
              <div className={`mt-auto p-3.5 rounded-xl border flex items-center justify-between z-10 ${
                isDark ? 'bg-[#070d19]/90 border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex gap-4 items-center flex-wrap">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shadow-sm" />
                    Pronto para Alocação
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm animate-pulse" />
                    Foco / Selecionado
                  </span>
                </div>
                <span className="text-[8.5px] font-black text-rose-500 tracking-wider uppercase hidden sm:inline">
                  ⚙️ {headScout ? `Bônus do Head ativo! -15% custos de monitorações.` : 'Escolha um Head na aba de Olheiros para obter descontos.'}
                </span>
              </div>
            </div>

            {/* 4. BANCO DE DADOS DE JOVENS TALENTOS DESCOBERTOS - COM LIMITAÇÃO E EXPANSÃO DOS 4 SLOTS ATIVOS */}
            <div className={`p-5 rounded-2xl border flex flex-col ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-3.5">
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  <Award className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Grelha de Scouting Ativo ({discoveredPool.length} / 4 Slots Utilizados)
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Dossiês Limpos com Despedimentos Instantâneos
                </span>
              </div>

              {/* Renderização de Exatamente 4 slots fixos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, slotIndex) => {
                  const talent = discoveredPool[slotIndex];

                  if (talent) {
                    // SLOT ATIVO PREENCHIDO
                    return (
                      <div
                        key={talent.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition duration-150 relative overflow-hidden ${
                          isDark ? 'bg-[#0d1b2e]/60 border-[#1e2d44] hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/40'
                        }`}
                      >
                        {/* Indicador de potencial decorativo */}
                        <div className="absolute top-0 right-0 w-8 h-8 opacity-10 font-bold text-4xl block font-mono select-none pointer-events-none">
                          {talent.potential}
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black border text-sm ${
                            talent.potential === 'SS' ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-extrabold'
                            : talent.potential === 'S' ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                            : 'bg-sky-500/10 border-sky-500 text-sky-400'
                          }`}>
                            {talent.potential}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className={`text-xs md:text-sm font-black truncate leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {talent.nickname}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 font-extrabold shrink-0">OVR {talent.overallRating}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight mt-1 truncate">
                              ({talent.position}) • {talent.age} Anos • {talent.region.split(' ')[0]}
                            </p>
                            <span className="text-[8px] font-semibold text-slate-500 block truncate mt-1">
                              Olheiro: {talent.discoveredBy}
                            </span>
                          </div>
                        </div>

                        {/* Ações do Slot */}
                        <div className="pt-2 border-t border-slate-800/10 dark:border-slate-800/40 flex justify-between items-center">
                          <button
                            onClick={() => handleDismissDiscovered(talent.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isDark ? 'bg-slate-800/40 border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-white border-slate-250 text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Descartar Talentos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenNegotiation(talent)}
                            className="p-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 hover:scale-105 text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <UserPlus className="w-3 h-3" />
                            CONTRATAR PARA O ACADEMY
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    // SLOT VAGO / DISPONÍVEL
                    return (
                      <div
                        key={`vago-${slotIndex}`}
                        className="p-6 rounded-xl border border-dashed border-slate-800/40 bg-slate-900/10 flex flex-col items-center justify-center text-center h-[122px]"
                      >
                        <Compass className="w-5 h-5 text-slate-600 stroke-1 mb-1.5 animate-pulse" />
                        <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-500">
                          [ VAGO / DISPONÍVEL ]
                        </span>
                        <p className="text-[8px] text-slate-500 leading-tight mt-1 px-4">
                          Pronto para acolher o próximo talento descoberto por expedições de monitoramento.
                        </p>
                      </div>
                    );
                  }
                })}
              </div>

            </div>
          </div>
          
          {/* Right sidebar - Staff e Status monitor */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                <Users className="w-4 h-4 text-sky-400" />
                Equipe de Olheiros ({scouts.length})
              </h3>

              <div className="space-y-3.5">
                {scouts.map(scout => {
                  const isBusy = scout.status === 'Alocado';
                  return (
                    <div
                      key={scout.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isBusy 
                          ? 'border-yellow-500/30 bg-yellow-500/5' 
                          : isDark ? 'bg-[#070d19]/85 border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] uppercase font-black px-1 rounded-sm ${
                              scout.isHead 
                                ? 'bg-sky-500/20 text-sky-450 border border-sky-400/30' 
                                : 'bg-slate-700/20 text-slate-400'
                            }`}>
                              {scout.isHead ? 'HEAD' : 'SCOUT'}
                            </span>
                            <span className={`text-xs font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {scout.name}
                            </span>
                          </div>
                          <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold leading-none">
                            {scout.specialty}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[8px] leading-none ${idx < scout.stars ? 'text-yellow-500' : 'text-slate-700'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-850 text-[9px]">
                        <div>
                          <span className={`font-semibold uppercase tracking-wide rounded text-[8px] leading-none ${
                            isBusy 
                              ? 'text-yellow-450 font-bold' 
                              : 'text-emerald-450 font-bold'
                          }`}>
                            ● {scout.status}
                          </span>
                        </div>

                        {isBusy ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] text-slate-400 font-bold max-w-[100px] truncate">
                              {scout.missionDestination?.split(' (')[0]}
                            </span>
                            <button
                              onClick={() => handleRecallScout(scout.id)}
                              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer"
                            >
                              Revogar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[7.5px] text-sky-450 font-black uppercase tracking-wider">
                            Disponível
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Guia do Departamento */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-sky-900/10 border-sky-500/20 text-sky-300' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>💡</span> Guia do Departamento
              </h4>
              <ul className="text-[10px] leading-relaxed font-semibold space-y-1.5 list-disc pl-4 opacity-90">
                <li>O limite estrito é de **4 slots ativos** simultâneos no banco de observação de atletas de base.</li>
                <li>Cada contratação exige um **Contrato de Formação** especial com splits e bônus negociados.</li>
                <li>Olheiros ocupados em missões globais não farão atrito financeiro de viagem extra até retornarem.</li>
                <li>O líder de Scouting reduz custos e aumenta as chances da rede monitorada de prospecção.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* ABA 2: EQUIPE DE OLHEIROS - GERENCIAMENTO CONTRATUAL E HIERÁRQUICO (FOTOS REAIS BANIDAS/AVATAR INICIAL) */
        <div className="space-y-6">
          
          {/* PAINEL SUPERIOR (HEAD OF SCOUTING) - DETALHAMENTO DE BÔNUS */}
          <div className={`p-5 rounded-2xl border-2 border-dashed relative overflow-hidden ${
            isDark ? 'border-blue-500/50 bg-blue-955/10' : 'border-blue-300 bg-blue-50/50 shadow-xs'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none text-blue-500">
              <Shield className="w-full h-full" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 font-sans">
              <div className="flex items-center gap-4">
                {/* Badge com ícone de scouting conforme o padrão Central de Empregos */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
                  isDark 
                    ? 'bg-slate-800/60 border-slate-700/60' 
                    : 'bg-slate-100 border-slate-300'
                }`}>
                  <Globe className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                      isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      Chefe de Operações
                    </span>
                    <span className="flex items-center text-[10px] text-yellow-500 font-bold">
                      {Array.from({ length: headScout ? headScout.stars : 5 }).map((_, i) => '★')}
                    </span>
                  </div>
                  <h3 className={`text-base md:text-lg font-black mt-1 uppercase transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {headScout ? headScout.name : 'Nenhum Líder Ativo'}
                  </h3>
                  <p className={`text-xs font-mono mt-0.5 uppercase tracking-wide transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Especialista: {headScout ? headScout.specialty : 'NENHUMA ESPECIFICAÇÃO'}
                  </p>
                </div>
              </div>

              {/* Bônus corporativos aplicados */}
              <div className={`p-3.5 rounded-xl border max-w-sm space-y-2 text-xs transition-colors ${
                isDark ? 'border-blue-500/20 bg-blue-950/20 text-slate-300' : 'border-blue-200 bg-blue-100/30 text-slate-755'
              }`}>
                <span className={`text-[9px] font-black block uppercase tracking-widest ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  ⚡ EFEITOS DE DIRETORIA CORPORATIVA ATIVOS:
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Redução de Custo de Viagem: <strong className={isDark ? 'text-white' : 'text-slate-900'}>-{costDiscountPercentage}% despesa</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Alcance Global: <strong className={isDark ? 'text-white' : 'text-slate-900'}>+{bonusChancePercentage}% chances</strong> de S/SS-Tiers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRADE INFERIOR - OLHEIROS DISPONÍVEIS (NOME, ESTRELAS, ESPECIALIDADE, MONITORIZAÇÃO, CUSTO, MESES, PROMOVER) */}
          <div className="space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Quadro de Funcionários de Scouting Disponíveis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scouts.map(scout => {
                const isPromoHead = scout.isHead;
                const isBusy = scout.status === 'Alocado';

                return (
                  <div
                    key={scout.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition duration-150 ${
                      isPromoHead 
                        ? 'bg-blue-950/10 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.05)]' 
                        : isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar com ícone de scouting (conforme a imagem referência avatar-scouting.png e avatar-scouting-dark-mode.png) */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isDark 
                            ? 'bg-slate-800/50 border-slate-700/50' 
                            : 'bg-slate-100 border-slate-200'
                        }`} title={scout.name}>
                          <Globe className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className={`text-xs md:text-sm font-black transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {scout.name}
                            </span>
                            {isPromoHead && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[7px] font-black uppercase border border-blue-400/40 tracking-wider">
                                LÍDER
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-[9px] leading-none ${i < scout.stars ? 'text-yellow-500' : (isDark ? 'text-slate-700' : 'text-slate-300')}`}>
                                ★
                              </span>
                            ))}
                          </div>

                          <p className={`text-[9.5px] font-mono transition-colors uppercase tracking-wide mt-1.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Foco: {scout.specialty}
                          </p>
                        </div>
                      </div>

                      {/* Status / Localização */}
                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[7.5px] text-slate-550 dark:text-slate-500 uppercase font-black tracking-wider block mb-1">Status</span>
                          <div className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                            isBusy 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          }`}>
                            {isBusy ? 'ALOCADO' : 'Disponível'}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[7.5px] text-slate-555 dark:text-slate-500 uppercase font-black tracking-wider block mb-1">Localização</span>
                          <div className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                            isBusy 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          }`}>
                            {isBusy ? scout.missionDestination?.split(' (')[0] : 'GAMING OFFICE (QG)'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé contratual do olheiro e ação de promoção */}
                    <div className="pt-3 border-t border-slate-800/10 dark:border-slate-800/40 flex justify-between items-center text-xs">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[7.5px] text-slate-500 uppercase block font-bold leading-none mb-0.5">Custo Mensal</span>
                          <span className={`font-mono font-extrabold text-[11px] transition-colors ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}>$ {scout.salary.toLocaleString('pt-BR')}</span>
                        </div>
                        <div>
                          <span className="text-[7.5px] text-slate-500 uppercase block font-bold leading-none mb-0.5">Vínculo Restante</span>
                          <span className={`font-bold text-[11px] transition-colors ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>{scout.contractRemaining} Meses</span>
                        </div>
                      </div>

                      {isPromoHead ? (
                        <span className="text-[9px] font-black uppercase text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-center gap-1 cursor-default">
                          <UserCheck className="w-3.5 h-3.5" />
                          CHEFE ATIVO
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePromoteToHead(scout.id)}
                          className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Award className="w-3.5 h-3.5" />
                          PROMOVER
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. JANELA POP-UP DE ALOCAÇÃO DE MISSÃO (MODAL ESTREITO) */}
      {modalPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div 
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl border animate-slide-in relative ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}
          >
            {/* Header Contextual */}
            <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-705 dark:border-slate-800/40">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#00cbd6] block mb-0.5">ALOCAÇÃO DE COMISSÃO</span>
                <h3 className={`text-sm font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {modalPin.name} - Monitoramento de Rede da {modalPin.code}
                </h3>
              </div>
              <button 
                onClick={() => setModalPin(null)}
                className="text-gray-400 hover:text-white font-extrabold text-[15px] p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Seleção de Staff (ComboBox styled dropdown) */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                  Selecionar Olheiro (Scout Disponível)
                </label>
                <select
                  value={selectedScoutId}
                  onChange={(e) => setSelectedScoutId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold leading-none focus:ring-1 focus:ring-sky-500 focus:outline-none ${
                    isDark ? 'bg-[#070d19] border-[#1e2d44] text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                  }`}
                >
                  {availableScouts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider Discreto de Tempo */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Definir Duração da Busca
                  </label>
                  <span className="text-[9.5px] font-extrabold text-[#00cbd6]">
                    Passo {sliderStep + 1} de 3
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={sliderStep}
                  onChange={(e) => setSliderStep(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />

                <div className={`mt-2.5 p-3 rounded-xl text-center border font-semibold text-[10.5px] ${
                  isDark ? 'bg-[#070d19] border-[#1e2d44] text-yellow-400' : 'bg-slate-50 border-slate-200 text-blue-700 font-extrabold'
                }`}>
                  {getSliderLabel(sliderStep)}
                </div>
              </div>

              {/* Painel de Custos (com bônus de desconto do Head destacado) */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${
                isDark ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div>
                  <span className="text-[8px] text-gray-400 uppercase block font-bold mb-0.5 leading-none">Custo Estimado da Expedição</span>
                  <div className="flex items-center gap-1.5">
                    {headScout && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        $ {currentSliderValues.originalCost}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-rose-500 font-mono flex items-center">
                      <DollarSign className="w-3.5 h-3.5 inline shrink-0" />
                      {currentSliderValues.finalCost.toLocaleString()}
                    </span>
                  </div>
                  {headScout && (
                    <span className="text-[8px] text-emerald-400 font-extrabold block mt-0.5 leading-none">⚡ Bônus Head Selecionado: -15%</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-gray-400 uppercase block font-bold mb-0.5 leading-none">Taxa tática de Sucesso</span>
                  <span className="text-xs font-black text-emerald-400">
                    {currentSliderValues.chance}
                  </span>
                </div>
              </div>

            </div>

            {/* Action buttons footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/10 dark:border-slate-800/40 flex justify-end gap-3.5">
              <button
                onClick={() => setModalPin(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-slate-800 border ${
                  isDark ? 'bg-[#070d19] border-[#1e2d44] text-slate-300' : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>

              <button
                onClick={handleStartMission}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-450 hover:to-blue-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4 shrink-0" />
                Iniciar Monitoramento
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2B. JANELA POP-UP DE CONTRATAÇÃO DE JOVENS ATLETAS COM NEGOCIAÇÃO DE CONTRATO (ACADEMY) */}
      {negotiatingTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div 
            className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border animate-slide-in relative ${
              isDark ? 'bg-[#0a1424] border-emerald-500/30' : 'bg-white border-emerald-250 shadow-md'
            }`}
          >
            {/* Header com tom esmeralda do Academy */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-emerald-500/20">
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400 block mb-0.5">ACADEMY • ACORDO DE NEGOCIAÇÃO</span>
                <h3 className={`text-base font-black uppercase tracking-wide flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Assinatura de Vínculo de Formação: {negotiatingTalent.nickname}
                </h3>
              </div>
              <button 
                onClick={() => setNegotiatingTalent(null)}
                className="text-gray-400 hover:text-white font-extrabold text-[15px] p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Perfil resumido de Talentos */}
            <div className="p-3.5 rounded-xl bg-[#0a1424]/40 border border-[#1e2d44] mb-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[8px] text-slate-450 block uppercase font-bold mb-0.5">Nome Completo</span>
                <span className="text-white font-bold block truncate">{negotiatingTalent.fullName}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-455 block uppercase font-bold mb-0.5">Função de Rota</span>
                <span className="text-emerald-420 font-black tracking-normal uppercase block">{negotiatingTalent.position}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-455 block uppercase font-bold mb-0.5">Habilidade OVR atual</span>
                <span className="text-emerald-400 font-extrabold font-mono text-sm">OVR {negotiatingTalent.overallRating}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-455 block uppercase font-bold mb-0.5">Potencial Avaliado</span>
                <span className="text-amber-400 font-extrabold font-mono text-sm">{negotiatingTalent.potential} Tier</span>
              </div>
            </div>

            <div className="space-y-5">
              
              {/* CAMPO INTERATIVO 1: TEMPO DE CONTRATO (SLITS SELECTOR) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-300">
                    Duração Contrada (Tempo de Contrato)
                  </label>
                  <span className="text-xs font-mono font-black text-amber-400 block">
                    {negotiatingSplits} Splits ({negotiatingSplits * 6} Meses)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(splitOpt => (
                    <button
                      key={splitOpt}
                      type="button"
                      onClick={() => setNegotiatingSplits(splitOpt)}
                      className={`py-3 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        negotiatingSplits === splitOpt
                          ? 'bg-emerald-600/10 border-emerald-555 text-emerald-400 shadow-md font-bold'
                          : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      {splitOpt} {splitOpt === 1 ? 'Split' : 'Splits'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CAMPO INTERATIVO 2: SALÁRIO BASE SEMANAL (SLIDER DE AJUSTE COM SUB-TETO) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-300">
                    Salário Base Semanal do Jovem
                  </label>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    $ {negotiatingSalary.toLocaleString('pt-BR')} / Sem.
                  </span>
                </div>

                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={negotiatingSalary}
                  onChange={(e) => setNegotiatingSalary(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                  <span>Mín. $ 300</span>
                  <span>Sub-teto Regulamentar de Categorias de Base CBLOL Academy: $ 2.000 max</span>
                  <span>Máx. $ 2.000</span>
                </div>
              </div>

              {/* CAMPO INTERATIVO 3: CLÁUSULAS DE BÔNUS (CHECKBOX COM GATILHOS) */}
              <div className="space-y-2.5">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-300 block">
                  Cláusulas de Bônus de Performance Habilitadas
                </label>

                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-850/60 bg-slate-950/20 text-xs text-slate-300 hover:bg-slate-950/40 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusAcademyWin}
                      onChange={(e) => setBonusAcademyWin(e.target.checked)}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-extrabold block text-white text-[11px]">Bônus de Campeonato Academy (Cláusula Ativa)</span>
                      <span className="text-[9.5px] text-slate-450 block leading-tight">Garante premiação adicional única de **+$1.500 no split** por títulos expressivos na divisão Academy do clube.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-850/60 bg-slate-950/20 text-xs text-slate-300 hover:bg-slate-950/40 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusOvrTarget}
                      onChange={(e) => setBonusOvrTarget(e.target.checked)}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-extrabold block text-white text-[11px]">Bônus de Desenvolvimento Técnico Metas</span>
                      <span className="text-[9.5px] text-slate-450 block leading-tight">Repassa incentivo financeiro adicional de **+$500** de gratificação caso o ciberatleta ganhe +5 de OVR no Split.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-850/60 bg-slate-950/20 text-xs text-slate-300 hover:bg-slate-950/40 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusExitClause}
                      onChange={(e) => setBonusExitClause(e.target.checked)}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-extrabold block text-white text-[11px]">Garantia de Cláusula de Rescisão Externa</span>
                      <span className="text-[9.5px] text-slate-450 block leading-tight">Multa contratual ajustada para o circuito minor caso alguma equipe do Tier 1 major queira propor transferência.</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Ações de Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/10 dark:border-slate-800/20 flex justify-end gap-3.5">
              <button
                onClick={() => setNegotiatingTalent(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-slate-800 border ${
                  isDark ? 'bg-transparent border-[#1e2d44] text-slate-300' : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Voltar
              </button>

              <button
                onClick={handleConfirmAcademyContract}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 shrink-0" />
                CONFIRMAR CONTRATO
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

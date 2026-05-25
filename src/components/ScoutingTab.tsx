/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Users, Shield, Send, AlertTriangle, AlertCircle, 
  Check, UserPlus, Trash2, HelpCircle, DollarSign, Clock, Award, Play
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
  status: 'Disponível' | 'Em Missão';
  missionDestination?: string;
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
  { id: 'scout-1', name: 'Guilherme Salles', specialty: 'Rota Inferior (CBLOL)', stars: 5, status: 'Disponível' },
  { id: 'scout-2', name: 'Aiko Sato', specialty: 'Rotas Solo (LCK/LPL)', stars: 5, status: 'Disponível' },
  { id: 'scout-3', name: 'Jack Marshall', specialty: 'Macro & Visão (LCS)', stars: 4, status: 'Disponível' },
  { id: 'scout-4', name: 'Helmi Virtanen', specialty: 'Novas Promessas (LEC)', stars: 4, status: 'Disponível' },
  { id: 'scout-5', name: 'Jean-Pierre Laurent', specialty: 'Suportes & Utilidade (LEC)', stars: 3, status: 'Disponível' }
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

  // Core internal persisted states
  const [scouts, setScouts] = useState<Scout[]>(() => {
    const saved = localStorage.getItem('legendshub_custom_scouts');
    return saved ? JSON.parse(saved) : INITIAL_SCOUTS;
  });

  const [discoveredPool, setDiscoveredPool] = useState<DiscoveredTalent[]>(() => {
    const saved = localStorage.getItem('legendshub_discovered_pool');
    return saved ? JSON.parse(saved) : INITIAL_DISCOVERED;
  });

  useEffect(() => {
    localStorage.setItem('legendshub_custom_scouts', JSON.stringify(scouts));
  }, [scouts]);

  useEffect(() => {
    localStorage.setItem('legendshub_discovered_pool', JSON.stringify(discoveredPool));
  }, [discoveredPool]);

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

  // Auto filter available lists
  const availableScouts = scouts.filter(s => s.status === 'Disponível');

  // Slider textual description reactives
  const getSliderLabel = (step: number) => {
    switch (step) {
      case 0: return "Duração: 10 Dias (Prospecção rápida de baixo custo)";
      case 1: return "Duração: 45 Dias (Prospecção equilibrada - Padrão)";
      case 2: return "Duração: Permanente (Monitoramento fixo focado em Superestrelas)";
      default: return "";
    }
  };

  const getSliderPricingAndChance = (step: number) => {
    switch (step) {
      case 0: return { cost: 1200, chance: '35% chance de S-tier' };
      case 1: return { cost: 4500, chance: '65% chance de S-tier' };
      case 2: return { cost: 15000, chance: '95% chance de S-tier' };
      default: return { cost: 0, chance: '0%' };
    }
  };

  const currentSliderValues = getSliderPricingAndChance(sliderStep);

  const handleOpenPinModal = (pin: typeof MAP_PINS[0]) => {
    // 5. VALIDATION: Err of empty scouts
    if (availableScouts.length === 0) {
      alert("Operação Cancelada: Não há Olheiros (Scouts) disponíveis no momento ou todos estão em missão.");
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

    // Check if team can afford
    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
    if (playerTeam && playerTeam.budget && playerTeam.budget < currentSliderValues.cost) {
      alert(`Fundos insuficientes! Precisamos de pelo menos $${currentSliderValues.cost} para financiar esta expedição.`);
      return;
    }

    // 1. Mark Scout as in mission
    setScouts(prev => prev.map(s => {
      if (s.id === selectedScoutId) {
        return { ...s, status: 'Em Missão', missionDestination: `${modalPin.name} (${modalPin.code})` };
      }
      return s;
    }));

    // Deduct cost from game money if possible
    if (playerTeam && playerTeam.budget) {
      const updatedTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          return { ...t, budget: t.budget - currentSliderValues.cost };
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
      'DragonRift', 'EclipseGod', 'CronoZ', 'HextechPacer', 'AeroGamer'
    ];
    const firstNames = ['Matheus', 'Rodrigo', 'Min-jun', 'Jonas', 'Kenji', 'Arnaud', 'Lucas', 'Thiago', 'Oliver', 'Hans'];
    const lastNames = ['Souza', 'Shin', 'Sato', 'Müller', 'Dupont', 'Azevedo', 'Virtanen', 'Nielsen', 'Silva', 'Kovacs'];
    const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const potentials: ('A+' | 'S' | 'SS' | 'A' | 'B-' | 'B+')[] = ['B-', 'B+', 'A', 'A+', 'S', 'SS'];

    const pickedNick = nicknames[Math.floor(Math.random() * nicknames.length)] + Math.floor(Math.random() * 80 + 10);
    const pickedName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const pickedPos = positions[Math.floor(Math.random() * positions.length)];
    const rollPot = Math.random();
    let pickedPot: 'A+' | 'S' | 'SS' | 'A' | 'B-' | 'B+' = 'A';
    if (sliderStep === 0) {
      pickedPot = rollPot > 0.8 ? 'S' : rollPot > 0.5 ? 'A' : 'B-';
    } else if (sliderStep === 1) {
      pickedPot = rollPot > 0.85 ? 'SS' : rollPot > 0.5 ? 'S' : 'A';
    } else {
      pickedPot = rollPot > 0.9 ? 'SS' : rollPot > 0.3 ? 'S' : 'A+';
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

    // Inject newly discovered procedural player
    setDiscoveredPool(prev => [newProspect, ...prev]);

    // Success dispatch alerts
    triggerNotification(
      "🔍 Expedição de Scouting Concluída!",
      `${assignedScout.name} encontrou o promissor ${pickedNick} em ${modalPin.name}! Verifique o Banco de Dados.`
    );

    // Close Modal strictly
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

  // Hire player to Organization's youth academy
  const handleContractToAcademy = (prospect: DiscoveredTalent) => {
    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
    if (!playerTeam) return;

    if (playerTeam.academy && playerTeam.academy.length >= 8) {
      alert("A academia de base (Academy) já atingiu o limite de 8 ciberatletas! Promova ou dispense alguns talentos antes de selar mais acordos.");
      return;
    }

    // Convert DiscoveredTalent into normal custom Player inside base draft database
    const newPlayer: Player = {
      id: `academy-${prospect.id}`,
      name: prospect.nickname,
      realName: prospect.fullName,
      nationality: prospect.region.split(' ')[0],
      age: prospect.age,
      position: prospect.position,
      overallRating: prospect.overallRating,
      potential: prospect.potential === 'SS' ? 92 : prospect.potential === 'S' ? 88 : prospect.potential === 'A+' ? 83 : 75,
      personality: 'Promissor Jovem',
      popularity: Math.floor(Math.random() * 30) + 10,
      marketValue: prospect.overallRating * 16000,
      salary: 1500,
      contractMonths: 12,
      motivation: 95,
      stamina: 100,
      chemistry: 40,
      championPool: ['Kai\'sa', 'Xayah', 'Ezreal', 'Jinx'],
      isPlayerControlled: true,
      attributes: {
        mechanics: prospect.overallRating + 4,
        macro: prospect.overallRating - 5,
        communication: prospect.overallRating - 2,
        leadership: prospect.overallRating - 8,
        consistency: prospect.overallRating,
        emotionalControl: prospect.overallRating + 1,
        farm: prospect.overallRating + 3,
        mapVision: prospect.overallRating - 4,
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

    // Mark as contracted locally to disable hiring options from database
    setDiscoveredPool(prev => prev.map(dt => dt.id === prospect.id ? { ...dt, isContracted: true } : dt));

    triggerNotification(
      "💎 Contratação Fechada!",
      `${prospect.nickname} assinou acordo profissional com a nossa divisão Academy e já está disponível para treinar!`
    );
  };

  const handleDismissDiscovered = (id: string) => {
    setDiscoveredPool(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={`p-1 select-none transition-colors duration-300 ${
      isDark ? 'text-white' : 'text-slate-800'
    }`}>
      
      {/* 1. VISÃO GERAL E IDENTIDADE VISUAL */}
      <div className={`p-6 rounded-2xl border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
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
            Rede de Monitoramento Global (Scouting Map)
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug font-sans">
            Aloque seus olheiros em servidores mundiais para descobrir talentos ocultos e impulsionar a categoria de base da sua organização de Esports.
          </p>
        </div>

        {/* Funds box info */}
        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
          isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-gray-405 block uppercase text-[8px] tracking-wider mb-0.5">Orçamento da Organização</span>
          <span className="text-emerald-400 font-extrabold text-sm flex items-center">
            <DollarSign className="w-3.5 h-3.5 inline mr-0.5 shrink-0" />
            {(gameState.teams.find(t => t.id === gameState.playerTeamId)?.budget || 0).toLocaleString('en-US')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* World map layout container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`p-4 rounded-2xl border relative flex flex-col h-[52vh] min-h-[420px] justify-between overflow-hidden ${
            isDark ? 'bg-[#060c18] border-[#1e2d44]' : 'bg-[#f4f6fa] border-slate-200'
          }`}>
            <span className="absolute top-3 left-4 text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
              SaaS Line-Art Minimalist Global Map Grid
            </span>

            {/* Simulated Vector lines overlaying background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              {/* Draw connections from São Paulo / Brazil to international hubs for dynamic aesthetic */}
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
                  Pin Selecionado / Foco
                </span>
              </div>
              <span className="text-[8.5px] font-black text-rose-500 tracking-wider uppercase">
                ⚙️ Clique em algum PIN ativo no mapa para enviar uma expedição de olheiro
              </span>
            </div>
          </div>

          {/* 4. BANCO DE DADOS DE JOVENS TALENTOS DESCOBERTOS */}
          <div className={`p-5 rounded-2xl border flex flex-col ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              <Award className="w-4 h-4 text-yellow-500" />
              Banco de Dados de Jovens Talentos Descobertos ({discoveredPool.length})
            </h3>

            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {discoveredPool.length > 0 ? (
                discoveredPool.map(talent => (
                  <div
                    key={talent.id}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-150 group ${
                      talent.isContracted 
                        ? 'opacity-65 border-slate-500/20 bg-slate-500/5'
                        : isDark ? 'bg-[#0d1b2e]/60 border-[#1e2d44] hover:border-sky-500/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border text-lg ${
                        talent.potential === 'SS' ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-extrabold'
                        : talent.potential === 'S' ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                        : 'bg-blue-500/10 border-blue-500 text-blue-400'
                      }`}>
                        {talent.potential}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black tracking-wide leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {talent.nickname}
                          </span>
                          <span className="text-[9.5px] font-mono font-black text-slate-400 leading-none">
                            ({talent.position}) - {talent.age} Anos
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 capitalize leading-tight mt-1">
                          Nome: {talent.fullName} - {talent.region}
                        </p>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider mt-1 block px-1.5 py-0.5 rounded border inline-block ${
                          isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-600 border-sky-205'
                        }`}>
                          Descoberto por: {talent.discoveredBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="text-[8px] text-gray-450 uppercase block font-bold leading-none">Overall Rating</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-400 pr-2">OVR {talent.overallRating}</span>
                      </div>

                      {talent.isContracted ? (
                        <span className="text-[9.5px] font-black uppercase text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Contratado para a Base
                        </span>
                      ) : (
                        <button
                          onClick={() => handleContractToAcademy(talent)}
                          className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Contratar para Base
                        </button>
                      )}

                      <button
                        onClick={() => handleDismissDiscovered(talent.id)}
                        className={`p-1.5 rounded-lg transition-all border shrink-0 ${
                          isDark ? 'bg-slate-800/50 border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-white border-slate-250 text-slate-450 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Remover talento do banco de dados"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-700/60 rounded-xl">
                  <Compass className="w-8 h-8 mx-auto text-slate-500 stroke-1 animate-spin duration-[6000ms] mb-2" />
                  <p className="text-[10.5px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
                    Nenhum Jovem Talento localizado até o momento.
                  </p>
                  <p className="text-[9px] text-gray-500 mt-1 leading-none">
                    Aloque expedições de olheiros no mapa acima para que comecem a carregar o banco de dados.
                  </p>
                </div>
              )}
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
              Equipe do Departamento de Scouting ({scouts.length})
            </h3>

            <div className="space-y-3.5">
              {scouts.map(scout => {
                const isBusy = scout.status === 'Em Missão';
                return (
                  <div
                    key={scout.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isBusy 
                        ? 'border-yellow-500/30 bg-yellow-500/5' 
                        : isDark ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h4 className={`text-xs font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {scout.name}
                        </h4>
                        <span className="text-[8.5px] text-gray-500 mt-1 block">Esp: {scout.specialty}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span 
                            key={idx} 
                            className={`text-[9px] leading-none ${idx < scout.stars ? 'text-yellow-500' : 'text-gray-600'}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/10 dark:border-slate-800/40 text-[9px]">
                      <div>
                        <span className="text-gray-450 block font-bold leading-none mb-0.5">Status Atual</span>
                        <span className={`font-black uppercase tracking-wide px-1.5 py-0.5 rounded text-[8px] leading-none ${
                          isBusy 
                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          🟢 {scout.status}
                        </span>
                      </div>

                      {isBusy ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[7.5px] text-slate-400 font-bold block max-w-[120px] truncate">
                            Destino: {scout.missionDestination}
                          </span>
                          <button
                            onClick={() => handleRecallScout(scout.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/25 px-2 py-0.8 rounded text-[8px] font-black uppercase cursor-pointer"
                          >
                            Interromper
                          </button>
                        </div>
                      ) : (
                        <span className="text-[8px] text-sky-450 font-black uppercase tracking-wider">
                          Aguardando Alocação
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick FAQ info Card */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-sky-900/10 border-sky-500/20 text-sky-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wide mb-2">💡 Guia do Departamento</h4>
            <ul className="text-[10px] leading-relaxed font-semibold space-y-1.5 list-disc pl-4 opacity-90">
              <li>Cada expedição de scouting consome fundos da sua folha de gastos.</li>
              <li>Quanto maior a duração, maior a probabilidade estatística de encontrar superestrelas S ou SS-tier.</li>
              <li>Olheiros ocupados em missões mundiais não podem ser alocados em novos países até que sejam encerrados.</li>
              <li>O CBLOL e LCK possuem taxas distintas de especialidades (ex: Coreia tem maior OVR inicial).</li>
            </ul>
          </div>
        </div>
      </div>

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

              {/* Painel de Custos (CTkFrame/box) */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${
                isDark ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div>
                  <span className="text-[8px] text-gray-450 uppercase block font-bold mb-0.5 leading-none">Custo Estimado da Expedição</span>
                  <span className="text-sm font-extrabold text-rose-500 font-mono flex items-center">
                    <DollarSign className="w-3.5 h-3.5 inline shrink-0" />
                    {currentSliderValues.cost.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-gray-455 uppercase block font-bold mb-0.5 leading-none">Taxa tática de Sucesso</span>
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

    </div>
  );
}

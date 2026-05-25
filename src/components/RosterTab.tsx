/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Sparkles, TrendingUp, DollarSign, Calendar, Heart, Award, ArrowUp, 
  RefreshCcw, Search, Trash2, SwitchCamera, Check, Play, UserCheck, BarChart2,
  ListFilter, Circle, HelpCircle, Activity, ChevronRight, ChevronLeft, Globe, BrainCircuit, Target, Laptop, Plus
} from 'lucide-react';
import { GameState, Player, Position, Team } from '../types';
import { formatMoney } from '../utils/currency';

interface AnimatedRadarChartProps {
  labels: string[];
  values: number[];
  color: string;
  fillColor: string;
  isDark: boolean;
}

const AnimatedRadarChart: React.FC<AnimatedRadarChartProps> = ({
  labels,
  values,
  color,
  fillColor,
  isDark
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1000;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progressVal = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressVal, 4);
      setProgress(eased);

      if (elapsed < duration) {
        frameId = requestAnimationFrame(step);
      }
    };

    setProgress(0);
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [values]);

  const center = 60;
  const maxR = 42;

  const points = values.map((val, idx) => {
    const angle = (idx * Math.PI / 3) - Math.PI / 2;
    const r = maxR * ((val * progress) / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const gridRadii = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center select-none p-4 bg-slate-50 dark:bg-[#070d19]/80 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm w-full animate-fade-in">
      <div className="relative w-[180px] h-[160px] flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {labels.map((_, i) => {
            const angle = (i * Math.PI / 3) - Math.PI / 2;
            const x2 = center + maxR * Math.cos(angle);
            const y2 = center + maxR * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="0.8"
                strokeDasharray="1 2"
              />
            );
          })}

          {gridRadii.map((ratio, gridIdx) => {
            const r = maxR * ratio;
            const pts = Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * Math.PI / 3) - Math.PI / 2;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
            return (
              <polygon
                key={`grid-${gridIdx}`}
                points={pts}
                fill="none"
                stroke={isDark ? '#1e2d44' : '#e2e8f0'}
                strokeWidth="0.8"
              />
            );
          })}

          <polygon
            points={points}
            fill={fillColor}
            stroke={color}
            strokeWidth="1.8"
          />

          {values.map((val, idx) => {
            const angle = (idx * Math.PI / 3) - Math.PI / 2;
            const r = maxR * ((val * progress) / 100);
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <circle
                key={`vertex-dot-${idx}`}
                cx={x}
                cy={y}
                r="2.5"
                fill={color}
                stroke="#fff"
                strokeWidth="0.8"
              />
            );
          })}
        </svg>

        {labels.map((lbl, i) => {
          const positions = [
            'absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 font-mono tracking-wide',
            'absolute top-[28%] -right-3 text-[9px] font-bold text-slate-400 font-mono tracking-wide text-right',
            'absolute bottom-[28%] -right-3 text-[9px] font-bold text-slate-400 font-mono tracking-wide text-right',
            'absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 font-mono tracking-wide',
            'absolute bottom-[28%] -left-3 text-[9px] font-bold text-slate-400 font-mono tracking-wide text-left',
            'absolute top-[28%] -left-3 text-[9px] font-bold text-slate-400 font-mono tracking-wide text-left',
          ];
          return (
            <span key={`lbl-${i}`} className={positions[i]}>
              {lbl}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5 mt-2.5 text-[10px] font-medium text-slate-500 font-mono">
        {labels.map((lbl, idx) => (
          <div key={`val-${idx}`} className="flex justify-between items-center gap-1">
            <span className="truncate">{lbl}:</span>
            <span className="font-extrabold text-[#006e80] dark:text-sky-400">{values[idx]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helpers for immersive visual features of individual players
const getIsForeign = (player: Player) => {
  const nat = (player.nationality || '').toLowerCase();
  return nat !== 'brasil' && nat !== 'br' && nat !== 'brazil';
};

const getVistoStatus = (player: Player) => {
  if (!getIsForeign(player)) {
    return { label: 'Permanente', visaClass: 'Permanente', timeRemaining: 'Permanente' };
  }
  const visaClass = player.overallRating >= 85 ? 'EB-1 (Extraordinary Ability)' : 'P-1 (Athletic Visa)';
  const months = Math.max(4, (player.contractMonths || 12) + 2);
  return { label: `${months} meses restantes`, visaClass, timeRemaining: `${months} meses` };
};

const getBehavioralAttributes = (player: Player) => {
  const isForeign = getIsForeign(player);
  const adaptacaoCultural = isForeign ? Math.round(65 + (player.chemistry || 70) * 0.3) : 100;
  const humorValue = player.motivation || 75;
  const confianca = Math.round(player.overallRating * 0.75 + (player.stamina || 80) * 0.25);
  const hash = player.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const disciplina = Math.round(72 + (hash % 23)); 
  const motivacao = player.motivation || 75;
  const controleEmocional = player.attributes.emotionalControl;

  return {
    adaptacaoCultural,
    humor: humorValue,
    confianca,
    disciplina,
    motivacao,
    controleEmocional
  };
};

const getPlayerHistory = (player: Player) => {
  const name = player.name.toLowerCase();
  if (name.includes('faker')) {
    return ["SK Telecom T1", "T1 Esports"];
  }
  if (name.includes('brtt')) {
    return ["paiN Gaming", "RED Canids", "Flamengo Esports"];
  }
  if (player.overallRating >= 88) {
    return ["Gen.G", "Team Liquid", "Fnatic", "Cloud9"];
  }
  if (player.overallRating >= 80) {
    return ["paiN Gaming", "LOUD", "RED Canids", "FURIA"];
  }
  return ["Fluxo", "Liberty", "KaBuM! Esports", "Keyd Stars"];
};

const getPlayerAchievements = (player: Player) => {
  const name = player.name.toLowerCase();
  if (name.includes('faker')) {
    return ["4x Worlds Champion", "2x MSI Champion", "10x LCK Champion"];
  }
  if (player.overallRating >= 88) {
    return ["1x Worlds Finalist", "1x MSI Champion", "3x LCK Champion"];
  }
  if (player.overallRating >= 80) {
    return ["2x CBLOL Champion", "1x CBLOL Split MVP"];
  }
  return ["Finalista Superliga LBR", "CBLOL Academy Champion"];
};

const getPlayerClauses = (player: Player) => {
  if (player.overallRating >= 88) {
    return ["Cláusula de rescisão internacional ($ 5M)", "Bônus por vitória no Worlds (+20% de bônus)", "Direitos de imagem globais"];
  }
  if (player.overallRating >= 80) {
    return ["Cláusula de rescisão nacional (1.5M R$)", "Bônus por MVP de Split (+15% de bônus)", "Streamings de patrocínio co-garantidos"];
  }
  return ["Rescisão amigável e desimpedida", "Bônus de alojamento pago pelo patrocinador"];
};

const getMentalHealthStatus = (motivation: number) => {
  if (motivation >= 85) return { label: 'Excelente', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  if (motivation >= 70) return { label: 'Bom', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' };
  if (motivation >= 50) return { label: 'Neutro', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
  if (motivation >= 30) return { label: 'Baixo', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
  return { label: 'Péssimo', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
};

const getRadarPoints = (values: number[]) => {
  const center = 50;
  const maxRadius = 38; // standard safe radius so points don't clip lines
  return values.map((val, idx) => {
    const angle = (idx * Math.PI / 3) - Math.PI / 2; // 6 vertices
    const r = maxRadius * (val / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
};

interface RosterTabProps {
  gameState: GameState;
  onRenewContract: (playerName: string) => void;
  onTransferListPlayer: (player: Player) => void;
  onReleasePlayer: (player: Player) => void;
  onSelectPlayerTraining: (playerName: string, focusArea: string) => void;
  onUpdateGameState?: (state: GameState) => void;
  theme?: 'light' | 'dark';
  selectedPlayerId?: string;
  setSelectedPlayerId?: (id: string) => void;
  isDetailedProfileOpen?: boolean;
  setIsDetailedProfileOpen?: (open: boolean) => void;
}

export default function RosterTab({
  gameState,
  onRenewContract,
  onTransferListPlayer,
  onReleasePlayer,
  onSelectPlayerTraining,
  onUpdateGameState,
  theme,
  selectedPlayerId: controlledPlayerId,
  setSelectedPlayerId: setControlledPlayerId,
  isDetailedProfileOpen: controlledDetailOpen,
  setIsDetailedProfileOpen: setControlledDetailOpen
}: RosterTabProps) {
  const isDark = theme === 'dark';
  const getS = () => {
    return {
      bgPage: isDark ? 'space-y-6 font-sans bg-slate-950 select-none text-slate-100 p-0' : 'space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800 p-0',
      bgCard: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl shadow-none text-white' : 'bg-white border border-slate-200/80 rounded-xl shadow-sm text-slate-800',
      bgCardHeader: isDark ? 'bg-[#0a1424] border border-[#1e2d44] p-6 rounded-xl shadow-none text-white' : 'bg-white border border-slate-200/80 p-6 rounded-xl shadow-sm text-slate-800',
      bgTable: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl overflow-hidden shadow-none' : 'bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm',
      bgTableHeaderRow: isDark ? 'bg-[#070d19] border-b border-[#1e2d44] text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider select-none' : 'grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50/60 border-b border-slate-200/80 text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider select-none',
      textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
      textMain: isDark ? 'text-white' : 'text-slate-850',
      bgInner: isDark ? 'bg-[#070d19] border border-[#1e2d44]' : 'bg-slate-50 border border-slate-100',
      borderLine: isDark ? 'border-[#1e2d44]' : 'border-slate-100',
      bgSelectedRow: isDark ? 'bg-[#006e80]/15 border-l-4 border-[#006e80]' : 'bg-[#006e80]/5 border-l-4 border-[#006e80]',
      hoverRow: isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/40',
      textTitle: isDark ? 'text-white' : 'text-slate-800',
      badgeClass: isDark ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25 text-[8px] font-mono font-black rounded uppercase px-2 py-0.5' : 'bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-mono font-black rounded uppercase px-2 py-0.5',
      badgePinkClass: isDark ? 'bg-pink-500/10 text-pink-400 border border-pink-500/25 text-[8px] font-mono font-black rounded uppercase px-2 py-0.5' : 'bg-pink-50 text-pink-600 border border-pink-100 text-[8px] font-mono font-black rounded uppercase px-2 py-0.5',
      bgBox: isDark ? 'bg-[#070d19]/80 border border-[#1e2d44]/50' : 'bg-slate-50/50 border border-slate-100',
      bgInputBox: isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800',
      textWhiteOrSlate: isDark ? 'text-white' : 'text-slate-800',
    };
  };
  const s = getS();

  const userTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  const handleToggleSquadRole = (player: Player) => {
    if (!onUpdateGameState) return;

    const nextTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        let nextRoster = [...t.roster];
        let nextSubstitutes = [...t.substitutes];

        const rosterIdx = nextRoster.findIndex(p => p.id === player.id);
        const subIdx = nextSubstitutes.findIndex(p => p.id === player.id);

        if (rosterIdx >= 0) {
          // Move from starter to reserve
          const removed = nextRoster.splice(rosterIdx, 1)[0];
          nextSubstitutes.push(removed);
        } else if (subIdx >= 0) {
          // Move from reserve to starter of that position
          const removed = nextSubstitutes.splice(subIdx, 1)[0];
          const existingStarterIdx = nextRoster.findIndex(p => p.position === removed.position);
          if (existingStarterIdx >= 0) {
            const kicked = nextRoster.splice(existingStarterIdx, 1)[0];
            nextSubstitutes.push(kicked);
          }
          nextRoster.push(removed);
        }

        return {
          ...t,
          roster: nextRoster,
          substitutes: nextSubstitutes
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: nextTeams
    });
  };

  const handleRelegatePlayer = (player: Player) => {
    if (!onUpdateGameState) return;

    if (!window.confirm(`Tem certeza que deseja rebaixar o atleta "${player.name}" para a categoria de base (Academy)?`)) {
      return;
    }

    const nextTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        const nextRoster = t.roster.filter(p => p.id !== player.id);
        const nextSubstitutes = t.substitutes.filter(p => p.id !== player.id);
        const nextAcademy = [...(t.academy || [])];

        const clonedPlayer = {
          ...player,
          isAcademyStarter: false
        };
        nextAcademy.push(clonedPlayer);

        return {
          ...t,
          roster: nextRoster,
          substitutes: nextSubstitutes,
          academy: nextAcademy
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: nextTeams
    });
    
    // Clear selection or select another player to prevent UI from breaking
    setSelectedPlayerId('');
    setIsDetailedProfileOpen(false);
  };

  const [localSelectedPlayerId, setLocalSelectedPlayerId] = useState<string>(userTeam.roster[0]?.id || '');
  const [localIsDetailedProfileOpen, setLocalIsDetailedProfileOpen] = useState(false);

  const selectedPlayerId = (controlledPlayerId !== undefined && controlledPlayerId !== '') ? controlledPlayerId : localSelectedPlayerId;
  const isDetailedProfileOpen = controlledDetailOpen !== undefined ? controlledDetailOpen : localIsDetailedProfileOpen;

  const setSelectedPlayerId = setControlledPlayerId || setLocalSelectedPlayerId;
  const setIsDetailedProfileOpen = setControlledDetailOpen || setLocalIsDetailedProfileOpen;

  // Rule-enforced reactive reset:
  // We only force local starter fallback if isDetailedProfileOpen is FALSE (to ensure the inline details card
  // on the right points to a valid corporate player, rather than persisting external/invalid player cache).
  // When isDetailedProfileOpen is TRUE, we are in an EXTERNAL/DETAILED PROFILE CONTEXT, meaning we must 
  // allow displaying external team athletes (like Faker) without force-resetting them.
  useEffect(() => {
    if (!isDetailedProfileOpen) {
      const isPlayerOwned = userTeam.roster.some(p => p.id === selectedPlayerId) || 
                            userTeam.substitutes.some(p => p.id === selectedPlayerId);
      
      if (!selectedPlayerId || !isPlayerOwned) {
        const topStarter = userTeam.roster.find(p => p.position === 'TOP') || userTeam.roster[0];
        if (topStarter) {
          setSelectedPlayerId(topStarter.id);
        }
      }
    }
  }, [isDetailedProfileOpen, selectedPlayerId, userTeam.roster, userTeam.substitutes]);
  
  // Custom view toggle: 'profile' (Screenshot 1) vs 'training' (Screenshot 2)
  const [panelViewMode, setPanelViewMode] = useState<'profile' | 'training'>('profile');
  
  const [trainingFoci, setTrainingFoci] = useState<{ [pId: string]: string }>({
    [userTeam.roster[0]?.id]: 'Laning Phase'
  });

  // Find all players in the league, so we can support viewing any player's individual profile!
  const allPlayers = gameState.teams.flatMap(t => [...t.roster, ...t.substitutes]);
  const activePlayer = isDetailedProfileOpen
    ? (allPlayers.find(p => p.id === selectedPlayerId) || userTeam.roster[0])
    : (userTeam.roster.find(p => p.id === selectedPlayerId) || userTeam.substitutes.find(p => p.id === selectedPlayerId) || userTeam.roster[0]);

  // Find the actual team of the active player dynamically!
  const playerTeam = gameState.teams.find(t => 
    t.roster.some(p => p.id === activePlayer?.id) || 
    t.substitutes.some(p => p.id === activePlayer?.id)
  ) || userTeam;

  const isOwnedByPlayerTeam = userTeam.roster.some(p => p.id === activePlayer?.id) || userTeam.substitutes.some(p => p.id === activePlayer?.id);

  const handleSelectFocus = (pId: string, focus: string) => {
    setTrainingFoci(prev => ({ ...prev, [pId]: focus }));
    onSelectPlayerTraining(pId, focus);
  };

  const renderRadarChart = (
    labels: string[],
    values: number[],
    color: string,
    fillColor: string
  ) => {
    return (
      <AnimatedRadarChart
        labels={labels}
        values={values}
        color={color}
        fillColor={fillColor}
        isDark={isDark}
      />
    );
  };

  const renderDetailedProfile = () => {
    if (!activePlayer) return null;
    
    const behavioral = getBehavioralAttributes(activePlayer);
    const visto = getVistoStatus(activePlayer);
    const mental = getMentalHealthStatus(activePlayer.motivation || 75);
    const history = getPlayerHistory(activePlayer);
    const achievements = getPlayerAchievements(activePlayer);
    const clauses = getPlayerClauses(activePlayer);

    const positionMapping: Record<Position, string> = {
      'TOP': 'Top',
      'JNG': 'Jungle',
      'MID': 'Mid',
      'ADC': 'ADC',
      'SUP': 'Support'
    };
    const mappedPosition = positionMapping[activePlayer.position] || activePlayer.position;

    const fanRep = Math.round(activePlayer.popularity * 0.95 + 4);
    const pressRep = Math.round(activePlayer.overallRating * 0.85 + (activePlayer.attributes.communication || 75) * 0.15);
    const teamClima = activePlayer.chemistry || 72;

    const riftLables = [
      'Mecânica',
      'Macro Game',
      'Controle/Visão',
      'Consistência',
      'Comunicação',
      'Pool Campeões'
    ];
    const riftValues = [
      activePlayer.attributes.mechanics,
      activePlayer.attributes.macro,
      activePlayer.attributes.mapVision || 75,
      activePlayer.attributes.consistency,
      activePlayer.attributes.communication,
      Math.round(activePlayer.overallRating * 0.96)
    ];

    const behavioralLabels = [
      'Adaptação Cult.',
      'Humor',
      'Confiança',
      'Disciplina',
      'Motivação',
      'Ctrl Emocional'
    ];
    const behavioralValues = [
      behavioral.adaptacaoCultural,
      behavioral.humor,
      behavioral.confianca,
      behavioral.disciplina,
      behavioral.motivacao,
      behavioral.controleEmocional
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={s.bgPage + " p-4 lg:p-6 space-y-6"}
      >
        <div className="flex items-center justify-between gap-4 w-full">
          <button
            id="back-to-roster-btn"
            onClick={() => setIsDetailedProfileOpen(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-sky-400' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-755'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Elenco
          </button>

          <span className={`px-3 py-1 font-mono text-[10px] rounded-md uppercase tracking-wider font-extrabold border ${
            isDark ? 'bg-[#006e80]/15 text-[#006e80] border-[#006e80]/30' : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
            Perfil Individual do Jogador
          </span>
        </div>

        <div className={`${s.bgCard} p-6 overflow-hidden relative border-l-4 border-l-[#006e80] shadow-md`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full md:w-auto text-center sm:text-left">
              <div className="relative">
                <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-sky-500/20' : 'border-slate-100'} shadow-md shrink-0`}>
                  <img 
                    src={activePlayer.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=250'} 
                    referrerPolicy="no-referrer"
                    alt={activePlayer.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#006e80] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 tracking-wide">
                  {mappedPosition}
                </span>
              </div>

              <div className="space-y-1.5 flex-1 select-text">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                  <h1 className={`font-display text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight leading-none`}>
                    {activePlayer.name}
                  </h1>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-150 text-slate-500 border border-slate-205'
                  }`}>
                    {activePlayer.realName}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs font-medium">
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-100/80 text-slate-600'
                  }`}>
                    <span>🎂</span> {activePlayer.age} anos
                  </span>
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-100/80 text-slate-600'
                  }`}>
                    <span>🌎</span> {activePlayer.nationality}
                  </span>
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    isDark ? 'bg-[#006e80]/10 text-sky-455' : 'bg-blue-50 text-blue-750 font-black'
                  }`}>
                    <span>🛡️</span> {playerTeam.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 self-center md:self-auto shrink-0 bg-slate-900/20 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/40 dark:border-slate-850 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center">
                <div className="text-4xl font-display font-black text-[#006e80] dark:text-sky-400">{activePlayer.overallRating}</div>
                <div className="text-[9px] font-mono font-extrabold uppercase text-slate-405 mt-1">OVR (Overall)</div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-805"></div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-teal-500">{activePlayer.potential}</div>
                <div className="text-[9px] font-mono font-extrabold uppercase text-slate-405 mt-1">POT (Potencial)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className={`${s.bgCard} p-6 space-y-4 shadow-sm`}>
              <div className={`flex justify-between items-center border-b ${s.borderLine} pb-3`}>
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider">Histórico profissional & Vínculo contratual</h4>
                </div>
                <span className={`text-[8px] font-mono font-black border rounded px-1.5 py-0.5 uppercase ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  Contrato
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wide block">Times defendidos anteriormente</span>
                <div className="flex flex-wrap gap-1.5">
                  {history.map((tName, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[10.5px] font-sans font-bold px-2.5 py-1 rounded transition-all ${
                        isDark ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-slate-100 border border-slate-205 text-slate-700'
                      }`}
                    >
                      {tName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wide block">Títulos e honrarias conquistados</span>
                <div className="flex flex-wrap gap-1.5">
                  {achievements.map((ach, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10.5px] font-sans font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2.5 py-1 rounded flex items-center gap-1"
                    >
                      🏆 {ach}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block font-bold">Salário Semanal</span>
                  <span className="text-sm font-mono font-black text-emerald-500">{formatMoney(activePlayer.salary / 4)}</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-550 block">Split Base: {formatMoney(activePlayer.salary)}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Tempo de Contrato</span>
                  <span className="text-sm font-sans font-extrabold text-slate-700 dark:text-white block">
                    {activePlayer.contractMonths} meses restantes
                  </span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-550 block font-sans">Encerramento ativo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block font-bold font-bold">Visto de permanência</span>
                  <span className="text-sm font-sans font-extrabold text-[#006e80] dark:text-sky-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 inline" /> {visto.visaClass === 'Permanente' ? 'Permanente' : visto.visaClass}
                  </span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-550 block font-sans">
                    {visto.visaClass === 'Permanente' ? 'Permanente no Brasil' : `Expiração em ${visto.timeRemaining}`}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Valor de mercado</span>
                  <span className="text-sm font-mono font-black text-[#006e80] dark:text-sky-400 block">{formatMoney(activePlayer.marketValue)}</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-550 block">Estimativa de multa contratual ativa</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wide block">Cláusulas contratuais ativas</span>
                <ul className="space-y-1.5">
                  {clauses.map((cl, i) => (
                    <li key={i} className="text-[11px] text-slate-550 dark:text-slate-400 flex items-start gap-1 font-medium leading-relaxed">
                      <span className="text-[#006e80] font-black">•</span>
                      <span>{cl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isOwnedByPlayerTeam ? (
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
                  <button
                    onClick={() => onRenewContract(activePlayer.name)}
                    className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                  >
                    Renovar Vínculo Contratual de {activePlayer.name}
                  </button>

                  <button
                    onClick={() => handleToggleSquadRole(activePlayer)}
                    className="w-full bg-[#007BFF] hover:bg-blue-600 text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                  >
                    {userTeam.roster.some(p => p.id === activePlayer.id) ? 'Mover para a Reserva / Substituto' : 'Escalar como Titular (Time Principal)'}
                  </button>

                  <button
                    onClick={() => handleRelegatePlayer(activePlayer)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                  >
                    Rebaixar para o Academy
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onTransferListPlayer(activePlayer)}
                      className="w-full bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 text-rose-500 text-[10px] font-extrabold py-2.5 uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center font-semibold"
                    >
                      Anunciar Listado para Venda
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente rescindir o contrato de ${activePlayer.name}? Esta ação é irreversível e cobrará multas de rescisão se aplicáveis.`)) {
                          onReleasePlayer(activePlayer);
                          setIsDetailedProfileOpen(false);
                        }
                      }}
                      className="w-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:text-slate-250 text-[10px] font-extrabold py-2.5 uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center font-semibold"
                    >
                      Rescindir Amigavelmente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
                  <p className="text-[11px] text-amber-500 font-mono font-bold bg-amber-500/5 px-2 py-3 rounded border border-amber-500/10">
                    🔒 Atleta sob contrato com a rival {playerTeam.name}. Não é possível gerenciar externamente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className={`${s.bgCard} p-6 space-y-5 shadow-sm`}>
              <div className={`flex justify-between items-center border-b ${s.borderLine} pb-3`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#006e80]" />
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider">Humor, saúde mental & comunidade</h4>
                </div>
                <span className="text-[8px] font-mono font-black bg-teal-500/10 text-teal-500 border border-teal-500/20 px-1.5 py-0.5 rounded uppercase">
                  Emocional
                </span>
              </div>

              <div className="space-y-2 pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">Status de Saúde Mental</span>
                  <span className={`text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${mental.color}`}>
                    Humor: {mental.label} ({activePlayer.motivation || 75}%)
                  </span>
                </div>
                
                <div className={`${s.bgBox} p-3 rounded-lg border text-xs`}>
                  <p className={`${s.textMuted} font-sans leading-relaxed text-slate-600 dark:text-slate-300`}>
                    O humor atual do atleta está categorizado como <span className="font-extrabold text-[#006e80] dark:text-sky-400">{mental.label}</span>. 
                    {(activePlayer.motivation || 75) >= 70 
                      ? ' Ele demonstra alto rendimento mental, resiliência excelente e reações rápidas de recuperação após perdas.' 
                      : ' Ele demonstra fadiga latente e sensibilidade ao tilt em partidas de longa duração.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono block">Indicadores Dinâmicos de Comunidade</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10.5px] font-bold">
                      <span className="text-slate-400">Relação com os Fãs (Popularidade)</span>
                      <span className="text-[#006e80] dark:text-sky-400 font-mono font-black">{fanRep}%</span>
                    </div>
                    <div className="w-full bg-slate-205 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full" style={{ width: `${fanRep}%` }}></div>
                    </div>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Reação das arquibancadas e engajamento nas mídias sociais oficiais</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10.5px] font-bold">
                      <span className="text-slate-400">Relação com a Imprensa</span>
                      <span className="text-blue-500 font-mono font-black">{pressRep}%</span>
                    </div>
                    <div className="w-full bg-slate-205 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full" style={{ width: `${pressRep}%` }}></div>
                    </div>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium font-medium">Carisma nas entrevistas coletivas e feedback dos portais de notícias</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10.5px] font-bold">
                      <span className="text-slate-400">Clima Interno com o Time (Sinergia)</span>
                      <span className="text-purple-500 font-mono font-black">{teamClima}%</span>
                    </div>
                    <div className="w-full bg-slate-205 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${teamClima}%` }}></div>
                    </div>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Cooperação interna nas scrims táticas e voz ativa na comunicação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <div className={`${s.bgCard} p-6 space-y-4 shadow-sm`}>
            <div>
              <h4 className="font-display text-sm font-extrabold uppercase tracking-wider">Habilidade em Rift (Performance Técnica)</h4>
              <p className="text-[9.5px] text-slate-405 mt-1 font-sans">
                Atributos mecânicos, macro-estratégia e controle em Summoner's Rift. Em total sinergia matemática com o OVR.
              </p>
            </div>
            
            <div className="pt-2">
              {renderRadarChart(
                riftLables,
                riftValues,
                "#006e80",
                isDark ? "rgba(0, 110, 128, 0.18)" : "rgba(0, 110, 128, 0.12)"
              )}
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 mt-1.5">
              <span className="text-[9.5px] font-mono font-black text-slate-450 uppercase tracking-wide block">Assinatura / Champion Pool (Top 3)</span>
              <div className="flex flex-wrap gap-2 pt-2">
                {activePlayer.championPool && activePlayer.championPool.slice(0, 3).map((cId, i) => (
                  <span key={i} className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-205 dark:border-slate-800 font-mono font-bold uppercase tracking-wide">
                    🎮 {cId}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${s.bgCard} p-6 space-y-4 shadow-sm`}>
            <div>
              <h4 className="font-display text-sm font-extrabold uppercase tracking-wider">Perfil Pessoal (Comportamental)</h4>
              <p className="text-[9.5px] text-slate-405 mt-1 font-sans">
                Atributos mentais, resiliência adaptativa, disciplina no treinamento e temperamento social.
              </p>
            </div>

            <div className="pt-2">
              {renderRadarChart(
                behavioralLabels,
                behavioralValues,
                "#38bdf8",
                isDark ? "rgba(14, 165, 233, 0.15)" : "rgba(14, 165, 233, 0.12)"
              )}
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 mt-1.5">
              <span className="text-[9.5px] font-mono font-black text-slate-455 uppercase tracking-wide block">Personalidade Predominante</span>
              <div className="pt-2">
                <span className="text-xs font-sans font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-3 py-1.5 rounded-lg">
                  💡 {activePlayer.personality || 'Focado no Coletivo (Trabalho em Equipe)'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    );
  };

  // Safe Math formula for the SVG radar coordinates
  const calculateRadarPoints = (player: Player, offsetAngle = 0) => {
    if (!player) return "50,50 50,50 50,50 50,50 50,50 50,50";
    const attrs = player.attributes;
    
    // Normalize rating scale from 0-100 to SVG 100x100
    const scaleValue = (val: number) => {
      return 45 * (val / 100);
    };

    // calculate ratings 
    const rMechanics = scaleValue(attrs.mechanics);
    const rMacro = scaleValue(attrs.macro);
    const rComms = scaleValue(attrs.communication);
    const rConsistency = scaleValue(attrs.consistency);
    const rEmotional = scaleValue(attrs.emotionalControl);
    const rMapVision = scaleValue(attrs.mapVision);

    // Coordinate angles in radians
    const p1 = { x: 50 + rMechanics * Math.cos(-Math.PI/2 + offsetAngle), y: 50 + rMechanics * Math.sin(-Math.PI/2 + offsetAngle) }; 
    const p2 = { x: 50 + rMacro * Math.cos(-Math.PI/6 + offsetAngle), y: 50 + rMacro * Math.sin(-Math.PI/6 + offsetAngle) }; 
    const p3 = { x: 50 + rComms * Math.cos(Math.PI/6 + offsetAngle), y: 50 + rComms * Math.sin(Math.PI/6 + offsetAngle) }; 
    const p4 = { x: 50 + rConsistency * Math.cos(Math.PI/2 + offsetAngle), y: 50 + rConsistency * Math.sin(Math.PI/2 + offsetAngle) }; 
    const p5 = { x: 50 + rEmotional * Math.cos(5*Math.PI/6 + offsetAngle), y: 50 + rEmotional * Math.sin(5*Math.PI/6 + offsetAngle) }; 
    const p6 = { x: 50 + rMapVision * Math.cos(7*Math.PI/6 + offsetAngle), y: 50 + rMapVision * Math.sin(7*Math.PI/6 + offsetAngle) }; 

    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y} ${p6.x},${p6.y}`;
  };

  if (isDetailedProfileOpen && activePlayer) {
    return renderDetailedProfile();
  }

  return (
    <div className={s.bgPage}>
      
      {/* Top Banner layout */}
      <div className={s.bgCardHeader + " flex flex-col md:flex-row justify-between items-start md:items-center gap-4"}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-blue-50 text-blue-600'} rounded-lg`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`font-display text-lg font-black tracking-wide ${s.textWhiteOrSlate} uppercase flex items-center gap-2`}>
              Gestão de Elenco e Atributos dos Jogadores <span className={`${isDark ? 'text-slate-700' : 'text-slate-300'} font-medium text-xs`}>|</span> <span className={`${isDark ? 'text-sky-400' : 'text-blue-500'} font-mono text-sm tracking-widest`}>Orçamento: {formatMoney(userTeam.budget)}</span>
            </h2>
            <p className={`text-xs ${s.textMuted} font-medium font-sans`}>
              Gerencie seus titulares do split, treine atributos mecânicos e ajuste cláusulas de rescisão.
            </p>
          </div>
        </div>

        {/* Panel toggler */}
        <div className={`flex ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/60'} p-1.5 rounded-lg border shrink-0 w-full md:w-auto`}>
          <button
            onClick={() => setPanelViewMode('profile')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              panelViewMode === 'profile'
                ? (isDark ? 'bg-slate-800 text-sky-400' : 'bg-white text-slate-800 shadow-sm border border-slate-200')
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Perfil e Contrato
          </button>
          <button
            onClick={() => setPanelViewMode('training')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              panelViewMode === 'training'
                ? (isDark ? 'bg-slate-800 text-sky-400 border border-slate-700/30' : 'bg-white text-blue-600 shadow-sm border border-slate-200')
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> Dashboard de Treino
          </button>
        </div>
      </div>

      {panelViewMode === 'profile' ? (
        /* SCREEN 1 ROUTING: Lineup List + Profile Contract Details Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Lineup List (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className={`font-display ${s.textWhiteOrSlate} text-sm font-extrabold uppercase tracking-wide leading-none`}>
                  Jogadores Titulares
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 font-sans">Escalação Principal da Organização</p>
              </div>
              <span className={`${isDark ? 'bg-[#006e80]/15 text-[#006e80] border-[#006e80]/30' : 'bg-blue-50/70 text-blue-600 border border-blue-100'} px-3 py-1 font-mono text-[9px] rounded-md uppercase tracking-wider font-extrabold select-none`}>
                SPLIT ATUAL 2026
              </span>
            </div>

            {/* Players list Table - 12 columns responsive configuration */}
            <div className={s.bgTable}>
              <div className="grid grid-cols-12 gap-1 px-4 py-3 bg-slate-50/60 dark:bg-[#070d19] border-b border-slate-200/85 dark:border-[#1e2d44]/80 text-[9px] text-slate-400 font-mono font-black uppercase tracking-wider select-none">
                <div className="col-span-1 text-center">POS</div>
                <div className="col-span-4 pl-2">Jogador</div>
                <div className="col-span-1 text-center">OVR</div>
                <div className="col-span-1 text-center">POT</div>
                <div className="col-span-2 text-center font-bold">Contrato</div>
                <div className="col-span-1 text-center font-bold">Status</div>
                <div className="col-span-2 text-right">Valor</div>
              </div>

              <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                {userTeam.roster.map((player) => {
                  const isSelected = player.id === selectedPlayerId;
                  const hasPatchBuff = gameState.currentPatch.buffedChampions.some(cid => player.championPool.includes(cid));
                  return (
                    <button
                      type="button"
                      key={player.id}
                      onClick={() => {
                        setSelectedPlayerId(player.id);
                        setIsDetailedProfileOpen(true);
                      }}
                      className={`grid grid-cols-12 gap-1 items-center p-3 cursor-pointer transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#006e80]/30 ${
                        isSelected 
                          ? s.bgSelectedRow 
                          : s.hoverRow
                      }`}
                    >
                      {/* Pos label with bright blue outline */}
                      <div className="col-span-1 flex justify-center select-none">
                        <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-sky-450' : 'bg-white border border-slate-200 text-sky-600'} rounded tracking-wide`}>
                          {player.position}
                        </span>
                      </div>

                      {/* Photo + Identity */}
                      <div className="col-span-4 flex items-center gap-2.5 pl-2">
                        <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden border shrink-0`}>
                          <img 
                            src={player.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100'} 
                            referrerPolicy="no-referrer"
                            alt="player" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="truncate">
                          <p className={`font-display text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} leading-none`}>{player.name}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{player.realName}</p>
                        </div>
                      </div>

                      {/* OVR */}
                      <div className="col-span-1 text-center">
                        <span className={`font-display text-xs font-black ${isDark ? 'text-sky-400' : 'text-slate-750'}`}>{player.overallRating}</span>
                      </div>

                      {/* POT */}
                      <div className="col-span-1 text-center font-bold">
                        <span className="font-display text-xs text-teal-500">{player.potential}</span>
                      </div>

                      {/* Contract */}
                      <div className="col-span-2 text-center text-[10px] font-mono text-slate-400">
                        {player.contractMonths} meses
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex justify-center items-center gap-1.5">
                        {hasPatchBuff && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Meta Match Buff" />
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>

                      {/* Value */}
                      <div className="col-span-2 text-right font-mono text-[10px] text-slate-400 font-extrabold pr-1">
                        {formatMoney(player.marketValue)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Substitutos e Reservas */}
            <div className="space-y-3 pt-2">
              <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-slate-400">
                Substitutos e Reservas
              </h4>
              
              <div className={s.bgTable}>
                <div className="grid grid-cols-12 gap-1 px-4 py-3 bg-slate-50/60 dark:bg-[#070d19] border-b border-slate-200/85 dark:border-[#1e2d44]/80 text-[9px] text-slate-400 font-mono font-black uppercase tracking-wider select-none">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-4 pl-2">Jogador</div>
                  <div className="col-span-1 text-center">OVR</div>
                  <div className="col-span-1 text-center">POT</div>
                  <div className="col-span-2 text-center font-bold">Contrato</div>
                  <div className="col-span-1 text-center font-bold">Status</div>
                  <div className="col-span-2 text-right">Valor</div>
                </div>

                <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                  {userTeam.substitutes.length > 0 ? (
                    userTeam.substitutes.map((player) => {
                      const isSelected = player.id === selectedPlayerId;
                      const hasPatchBuff = gameState.currentPatch.buffedChampions.some(cid => player.championPool.includes(cid));
                      return (
                        <button
                          type="button"
                          key={player.id}
                          onClick={() => {
                            setSelectedPlayerId(player.id);
                            setIsDetailedProfileOpen(true);
                          }}
                          className={`grid grid-cols-12 gap-1 items-center p-3 cursor-pointer transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#006e80]/30 ${
                            isSelected 
                              ? s.bgSelectedRow 
                              : s.hoverRow
                          }`}
                        >
                          {/* Pos label */}
                          <div className="col-span-1 flex justify-center select-none">
                            <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-sky-450' : 'bg-white border border-slate-200 text-sky-600'} rounded tracking-wide`}>
                              {player.position}
                            </span>
                          </div>

                          {/* Photo + Identity */}
                          <div className="col-span-4 flex items-center gap-2.5 pl-2">
                            <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden border shrink-0`}>
                              <img 
                                src={player.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100'} 
                                referrerPolicy="no-referrer"
                                alt="player" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="truncate">
                              <p className={`font-display text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} leading-none`}>{player.name}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{player.realName}</p>
                            </div>
                          </div>

                          {/* OVR */}
                          <div className="col-span-1 text-center">
                            <span className={`font-display text-xs font-black ${isDark ? 'text-sky-400' : 'text-[#626d80]'}`}>{player.overallRating}</span>
                          </div>

                          {/* POT */}
                          <div className="col-span-1 text-center font-bold">
                            <span className="font-display text-xs text-teal-500">{player.potential}</span>
                          </div>

                          {/* Contract */}
                          <div className="col-span-2 text-center text-[10px] font-mono text-slate-400 font-medium">
                            {player.contractMonths} meses
                          </div>

                          {/* Status */}
                          <div className="col-span-1 flex justify-center items-center gap-1.5">
                            {hasPatchBuff && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Meta Match Buff" />
                            )}
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Suplente / Reserva" />
                          </div>

                          {/* Value */}
                          <div className="col-span-2 text-right font-mono text-[10px] text-slate-400 font-extrabold pr-1">
                            {formatMoney(player.marketValue)}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum jogador reserva cadastrado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
 
          {/* Right Column: Player Profile details + Contract */}
          <div className="lg:col-span-5 space-y-6">
            {activePlayer ? (
              <div className="space-y-6">
                
                {/* FICHA GERAL E IDENTIFICAÇÃO BÁSICA DO ATLETA */}
                <div className={`${isDark ? 'bg-[#0a1424] border border-[#1e2d44]' : 'bg-white border border-slate-200/80'} rounded-xl overflow-hidden shadow-sm flex flex-col relative`}>
                  <div className="p-5 space-y-5">
                    
                    {/* Identificação Básica */}
                    <button
                      onClick={() => setIsDetailedProfileOpen(true)}
                      className="w-full text-left flex justify-between items-start cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-900/40 p-2.5 -m-2.5 rounded-xl border border-transparent hover:border-slate-200/25 dark:hover:border-slate-800/25 transition-all group focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={activePlayer.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'} 
                            referrerPolicy="no-referrer"
                            alt="active_player" 
                            className={`w-16 h-16 rounded-xl object-cover border-2 ${isDark ? 'border-slate-800 shadow-none' : 'border-slate-100 shadow-sm'} group-hover:scale-105 duration-200`} 
                          />
                          <span className="absolute -bottom-2 -right-1 bg-[#006e80] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-white dark:border-slate-850">
                            {activePlayer.position}
                          </span>
                        </div>
                        <div>
                          <h4 className={`font-display text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-800'} leading-none group-hover:text-[#00cbd6] transition-colors flex items-center gap-1`}>
                            {activePlayer.name}
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-455" />
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wide">
                            {activePlayer.realName}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5 select-none">
                            <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-[8px] font-mono font-black rounded uppercase px-1.5 py-0.5 flex items-center gap-1">
                              {activePlayer.age || 20} ANOS
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-[8px] font-mono font-black rounded uppercase px-1.5 py-0.5">
                              {getIsForeign(activePlayer) ? '🌎 ESTRANGEIRO' : '🇧🇷 BRASILEIRO'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-display ${isDark ? 'text-sky-400' : 'text-[#006e80]'} text-3xl font-black leading-none`}>{activePlayer.overallRating}</div>
                        <p className={`text-[8px] uppercase tracking-wider ${s.textMuted} font-extrabold mt-1`}>OVERALL</p>
                        <div className="text-[10px] text-teal-500 font-mono font-black mt-1">POT: {activePlayer.potential}</div>
                        <span className="text-[8px] text-[#006e80] dark:text-sky-400 font-extrabold uppercase mt-2 group-hover:underline block leading-none">
                          Ver Perfil Completo
                        </span>
                      </div>
                    </button>

                    {/* Meta Status de Saúde Mental e Emocional */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">Saúde Mental & Emocional</span>
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${getMentalHealthStatus(activePlayer.motivation || 75).color}`}>
                          {getMentalHealthStatus(activePlayer.motivation || 75).label} ({activePlayer.motivation || 75}%)
                        </span>
                      </div>
                      <div className={`${s.bgBox} p-2.5 rounded-lg border flex items-center justify-between text-[11px]`}>
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <span>Sentimento do atleta:</span>
                        </div>
                        <span className="font-extrabold text-[#006e80] dark:text-sky-400">
                          {(activePlayer.motivation || 75) >= 70 ? 'Sente-se valorizado pela comissão' : 'Sente-se cobrado sob extrema pressão'}
                        </span>
                      </div>
                    </div>

                    {/* Reputação na Comunidade */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">Reputação na Comunidade & Mídia</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400">Popularidade (Fãs)</span>
                            <span className="text-teal-500 font-mono">{Math.round(activePlayer.overallRating * 0.95 + 4)}%</span>
                          </div>
                          <div className="w-full bg-slate-150 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.round(activePlayer.overallRating * 0.95 + 4)}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400">Carisma / Imagem</span>
                            <span className="text-sky-500 font-mono">{Math.round(activePlayer.overallRating * 0.92 + 2)}%</span>
                          </div>
                          <div className="w-full bg-slate-150 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.round(activePlayer.overallRating * 0.92 + 2)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico de Teias (Radar Chart): Habilidades em Summoner's Rift */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono block">Habilidade em Summoner's Rift</span>
                      <div className={`${s.bgBox} flex justify-center py-4 rounded-xl relative`}>
                        <div className="relative w-[150px] h-[150px]">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Grid hexagons backgrounds */}
                            <polygon points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5" fill="none" stroke={isDark ? '#1e2d44' : '#e2e8f0'} strokeWidth="0.8" />
                            <polygon points="50 20, 77 35, 77 65, 50 80, 23 65, 23 35" fill="none" stroke={isDark ? '#1e2d44' : '#e2e8f0'} strokeWidth="0.8" strokeDasharray="1.5" />
                            <polygon points="50 35, 64 42.5, 64 57.5, 50 65, 36 57.5, 36 42.5" fill="none" stroke={isDark ? '#1e2d44' : '#e2e8f0'} strokeWidth="0.8" />
                            
                            {/* Grid axes */}
                            <line x1="50" y1="50" x2="50" y2="5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            <line x1="50" y1="50" x2="89" y2="27.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            <line x1="50" y1="50" x2="89" y2="72.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            <line x1="50" y1="50" x2="50" y2="95" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            <line x1="50" y1="50" x2="11" y2="72.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            <line x1="50" y1="50" x2="11" y2="27.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                            
                            {/* Selected Attribute Polygon */}
                            <polygon 
                              points={calculateRadarPoints(activePlayer)}
                              fill={isDark ? "rgba(0, 110, 128, 0.15)" : "rgba(0, 110, 128, 0.12)"}
                              stroke="#006e80"
                              strokeWidth="1.8"
                            />
                          </svg>

                          {/* Outer labels */}
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Mecânica</span>
                          <span className="absolute top-[28%] -right-7 text-[8px] font-bold uppercase text-slate-400 font-mono">Macro</span>
                          <span className="absolute bottom-[28%] -right-7 text-[8px] font-bold uppercase text-slate-400 font-mono">Comun.</span>
                          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Visão</span>
                          <span className="absolute bottom-[28%] -left-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Consist.</span>
                          <span className="absolute top-[28%] -left-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Mental</span>
                        </div>
                      </div>
                    </div>

                    {/* Perfil Comportamental (Psicológico / Mental) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono block">Perfil Comportamental (Atributos Mentais)</span>
                      
                      <div className="space-y-2">
                        {/* Trabalho em Equipe */}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="text-slate-550 dark:text-slate-400">Trabalho em Equipe</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{activePlayer.attributes.communication}%</span>
                            <div className="w-24 bg-slate-150 dark:bg-slate-900 h-1 rounded-full">
                              <div className="bg-[#006e80] h-full rounded-full" style={{ width: `${activePlayer.attributes.communication}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Resiliência Mental */}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="text-slate-550 dark:text-slate-400">Resiliência Mental</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{activePlayer.attributes.consistency}%</span>
                            <div className="w-24 bg-slate-150 dark:bg-slate-900 h-1 rounded-full">
                              <div className="bg-[#006e80] h-full rounded-full" style={{ width: `${activePlayer.attributes.consistency}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Liderança sob Pressão */}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="text-slate-550 dark:text-slate-400">Liderança sob Pressão</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{activePlayer.attributes.emotionalControl}%</span>
                            <div className="w-24 bg-slate-150 dark:bg-slate-900 h-1 rounded-full">
                              <div className="bg-[#006e80] h-full rounded-full" style={{ width: `${activePlayer.attributes.emotionalControl}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Comunicação in-game */}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="text-slate-550 dark:text-slate-400">Comunicação in-game</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((activePlayer.attributes.communication + activePlayer.attributes.macro) / 2)}%</span>
                            <div className="w-24 bg-slate-150 dark:bg-slate-900 h-1 rounded-full">
                              <div className="bg-[#006e80] h-full rounded-full" style={{ width: `${Math.round((activePlayer.attributes.communication + activePlayer.attributes.macro) / 2)}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Foco */}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="text-slate-550 dark:text-slate-400">Foco</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{activePlayer.attributes.mechanics}%</span>
                            <div className="w-24 bg-slate-150 dark:bg-slate-900 h-1 rounded-full">
                              <div className="bg-[#006e80] h-full rounded-full" style={{ width: `${activePlayer.attributes.mechanics}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* HISTÓRICO, HISTÓRICO DE TIMES, TÍTULOS E CONTRATO */}
                <div className={`${s.bgCard} p-5 shadow-none space-y-4`}>
                  
                  {/* Título de Organização de Contrato */}
                  <div className={`flex justify-between items-center border-b ${s.borderLine} pb-2.5`}>
                    <div className="flex items-center gap-1.5">
                      <Laptop className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-705'}`} />
                      <h5 className={`font-display text-xs font-extrabold uppercase tracking-wide ${s.textWhiteOrSlate}`}>
                        Histórico & Contrato
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono bg-[#006e80] text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                      VÍNCULO ATIVO
                    </span>
                  </div>

                  {/* Histórico de Times Defendidos */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Times Defendidos</p>
                    <div className="flex flex-wrap gap-1">
                      {getPlayerHistory(activePlayer).map((teamName, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-medium">
                          {teamName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Títulos Conquistados */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Títulos Conquistados</p>
                    <div className="flex flex-wrap gap-1">
                      {getPlayerAchievements(activePlayer).map((ach, i) => (
                        <span key={i} className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          🏆 {ach}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes Financeiros e Cláusulas */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-black font-mono">Salário Semanal</p>
                      <p className={`font-display text-xs font-black text-emerald-500 mt-1`}>
                        {formatMoney(activePlayer.salary / 4)}
                      </p>
                      <p className="text-[8px] text-slate-450 dark:text-slate-500 font-mono font-medium mt-0.5">Base Split: {formatMoney(activePlayer.salary)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-black font-mono">Tempo Restante</p>
                      <p className={`font-display text-xs font-bold ${isDark ? 'text-slate-205' : 'text-slate-800'} mt-1`}>
                        {activePlayer.contractMonths} Meses de Vínculo
                      </p>
                    </div>
                  </div>

                  {/* Cláusulas Ativas */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Cláusulas Ativas</p>
                    <ul className="space-y-1">
                      {getPlayerClauses(activePlayer).map((clause, idx) => (
                        <li key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1 font-sans">
                          <span className="text-[#006e80] font-black">•</span>
                          <span>{clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Valor de Mercado */}
                  <div className="p-3 bg-slate-50/75 dark:bg-slate-900/60 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">VALOR DE MERCADO</span>
                    <span className="text-xs font-mono font-black text-[#006e80] dark:text-sky-400">{formatMoney(activePlayer.marketValue)}</span>
                  </div>

                  {/* Botões de Ação de Contrato */}
                  {isOwnedByPlayerTeam ? (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => onRenewContract(activePlayer.name)}
                        className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Renovar Contrato de {activePlayer.name}
                      </button>

                      <button
                        onClick={() => handleToggleSquadRole(activePlayer)}
                        className="w-full bg-[#007BFF] hover:bg-blue-600 text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        {userTeam.roster.some(p => p.id === activePlayer.id) ? 'Mover para a Reserva / Substituto' : 'Escalar como Titular (Time Principal)'}
                      </button>

                      <button
                        onClick={() => handleRelegatePlayer(activePlayer)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Rebaixar para o Academy
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => alert(`Prospecção iniciada para substituição de ${activePlayer.name}...`)}
                          className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-650'} text-[9px] font-bold py-2.5 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold`}
                        >
                          <Search className="w-3.5 h-3.5" /> SCOUT SUBSTITUTO
                        </button>
                        <button
                          onClick={() => onTransferListPlayer(activePlayer)}
                          className={`${isDark ? 'bg-[#ffebeb]/5 border-pink-100/10 hover:bg-pink-100/10' : 'bg-[#ffebeb] border-pink-100 hover:bg-pink-100/50'} text-pink-500 text-[9px] font-bold py-2.5 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> COLOCAR À VENDA
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] text-amber-500 font-mono font-bold bg-amber-500/5 px-2 py-2.5 rounded border border-amber-500/10 block w-full truncate">
                        🔒 Sob contrato com a rival {playerTeam.name}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className={`text-slate-400 text-center text-xs py-10 uppercase tracking-widest ${s.bgCard} shadow-none`}>
                Selecione um jogador para examinar os atributos detalhados
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SCREEN 2 ROUTING: Viper_Core Training Dashboard (Detailed training screens + week log schedules) */
        <div className="space-y-6">
          <div className={`${s.bgCardHeader} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <div>
              <h2 className={`font-display text-base font-black ${isDark ? 'text-white' : 'text-slate-800'} uppercase leading-none`}>
                {activePlayer.name}_Core Training Dashboard
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">
                Lead {activePlayer.position} • 98th Percentile Mechanics & Strategic Depth
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Histórico de sessões exportado com sucesso para a diretoria!")}
                className={`${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-810 text-slate-300' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'} font-mono text-[9px] font-extrabold px-3.5 py-2 rounded uppercase tracking-wider cursor-pointer shadow-sm`}
              >
                Export Logs
              </button>
              <button 
                onClick={() => alert("Sincronizando com Riot API... Status: 200 OK")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-extrabold px-4 py-2 rounded uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Sync Riot API
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Core Metrics Radar & Grid Focus (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Core Performance metrics radar */}
              <div className={`${s.bgCard} p-5.5 shadow-none`}>
                <div className={`flex justify-between items-center mb-4.5 border-b ${s.borderLine} pb-2`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Core Performance Metrics</span>
                  <span className={`text-[8px] font-bold ${isDark ? 'text-sky-400 bg-sky-500/10' : 'text-sky-500 bg-sky-50'} px-1.5 py-0.5 rounded tracking-wide`}>LIVE FEED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className={`${s.bgBox} flex justify-center p-4 rounded-xl`}>
                    <div className="relative w-[150px] h-[150px]">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <polygon points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5" fill="none" stroke={isDark ? '#1e2d44' : '#e2e8f0'} strokeWidth="0.8" />
                        <polygon points="50 20, 77 35, 77 65, 50 80, 23 65, 23 35" fill="none" stroke={isDark ? '#1e2d44' : '#e2e8f0'} strokeWidth="0.8" strokeDasharray="1.5" />
                        
                        <line x1="50" y1="50" x2="50" y2="5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="89" y2="27.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="89" y2="72.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="50" y2="95" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="11" y2="72.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="11" y2="27.5" stroke={isDark ? '#131e31' : '#edf2f7'} strokeWidth="0.8" />
                        
                        <polygon 
                          points={calculateRadarPoints(activePlayer, 15)}
                          fill={isDark ? "rgba(14, 165, 233, 0.08)" : "rgba(14, 165, 233, 0.15)"}
                          stroke={isDark ? "#38bdf8" : "#0ea5e9"}
                          strokeWidth="2"
                        />
                      </svg>
                      {/* labels aligned to image 2 */}
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Mechanics</span>
                      <span className="absolute top-[35%] -right-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Strategy</span>
                      <span className="absolute bottom-[35%] -right-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Comms</span>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Endurance</span>
                    </div>
                  </div>

                  {/* Rating Progress sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>MECHANICS</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.mechanics}%</span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.mechanics}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>STRATEGIC DEPTH</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.macro}%</span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.macro}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>COMMUNICATION</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.communication}%</span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.communication}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Areas Selection box (Screenshot 2 middle) */}
              <div className={`${s.bgCard} p-5.5 shadow-none space-y-4`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
                  Focus Areas Selection
                </span>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { name: 'Laning Phase', icon: Target },
                    { name: 'Teamfighting', icon: Award },
                    { name: 'Map Awareness', icon: SwitchCamera },
                    { name: 'Objective Control', icon: Activity },
                    { name: 'Mental Reset', icon: Heart },
                    { name: 'Custom (+)', icon: Sparkles }
                  ].map((focusItem) => {
                    const focusName = focusItem.name;
                    const FocusIcon = focusItem.icon;
                    const isCurrent = trainingFoci[activePlayer.id] === focusName || (focusName === 'Laning Phase' && !trainingFoci[activePlayer.id]);
                    return (
                      <button
                        key={focusName}
                        onClick={() => handleSelectFocus(activePlayer.id, focusName)}
                        className={`p-4 h-24 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isCurrent 
                            ? (isDark ? 'border-sky-400 bg-sky-500/10 text-sky-400' : 'border-blue-500 bg-blue-50/30 text-blue-600 shadow-[0_1px_4px_rgba(59,130,246,0.06)]') 
                            : (isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200')
                        }`}
                      >
                        <FocusIcon className={`w-4 h-4 ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="font-display text-[10.5px] font-extrabold uppercase tracking-wide">
                          {focusName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column Boxes (Weekly grid + Academy Growth) (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Weekly training grid */}
              <div className={`${s.bgCard} p-5.5 shadow-none space-y-4.5`}>
                <div className={`flex justify-between items-center border-b ${s.borderLine} pb-2`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Weekly Training Grid</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                    <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 gap-1.5 text-[8.5px] font-mono tracking-wider font-bold text-slate-400 uppercase select-none">
                    <div className="col-span-2">Day</div>
                    <div className="col-span-6">Session</div>
                    <div className="col-span-4 text-right">Status</div>
                  </div>

                  <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'} font-mono text-[10px] space-y-2.5 pt-1`}>
                    <div className={`grid grid-cols-12 items-center ${isDark ? 'text-slate-300' : 'text-slate-600'} pt-2 first:pt-0`}>
                      <div className="col-span-2 text-slate-400 font-bold">MON</div>
                      <div className={`col-span-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>VOD Review</div>
                      <div className="col-span-4 text-right">
                        <span className={`${isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-500 bg-emerald-50'} px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider`}>COMPLETED</span>
                      </div>
                    </div>

                    <div className={`grid grid-cols-12 items-center ${isDark ? 'text-slate-300' : 'text-slate-600'} pt-2`}>
                      <div className="col-span-2 text-blue-500 font-black">TUE</div>
                      <div className={`col-span-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>1v1 Drills</div>
                      <div className="col-span-4 text-right">
                        <span className={`${isDark ? 'text-sky-400 bg-sky-500/10' : 'text-sky-500 bg-sky-50'} px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider`}>IN PROGRESS</span>
                      </div>
                    </div>

                    <div className={`grid grid-cols-12 items-center ${isDark ? 'text-slate-300' : 'text-slate-600'} pt-2`}>
                      <div className="col-span-2 text-slate-400 font-bold">WED</div>
                      <div className={`col-span-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Team Scrims</div>
                      <div className={`col-span-4 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>14:00 GMT</div>
                    </div>

                    <div className={`grid grid-cols-12 items-center ${isDark ? 'text-slate-300' : 'text-slate-600'} pt-2`}>
                      <div className="col-span-2 text-slate-400 font-bold">THU</div>
                      <div className={`col-span-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Draft Sim</div>
                      <div className={`col-span-4 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>09:00 GMT</div>
                    </div>

                    <div className={`grid grid-cols-12 items-center ${isDark ? 'text-slate-300' : 'text-slate-600'} pt-2`}>
                      <div className="col-span-2 text-slate-400 font-bold">FRI</div>
                      <div className={`col-span-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mental Coach</div>
                      <div className={`col-span-4 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>11:30 GMT</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academy growth card */}
              <div className={`${s.bgCard} p-5 shadow-none flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden shrink-0 flex items-center justify-center border`}>
                  <Laptop className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACADEMY GROWTH</p>
                  <p className={`text-[10.5px] font-sans font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-tight mt-0.5`}>
                    Seu percurso tático do Rookie ao Pro Tier.
                  </p>
                  <div className="flex items-center gap-3.5 mt-2.5">
                    <div className={`flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
                      <div className="h-full bg-blue-500" style={{ width: '72%' }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 shrink-0">Level 18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Recent Session Analytics (Screenshot 2 bottom row table) */}
          <div className={`${s.bgTable}`}>
            <div className={`px-5 py-4 border-b ${s.borderLine} ${isDark ? 'bg-[#070d19]' : 'bg-slate-50/50'} flex justify-between items-center`}>
              <span className={`text-[10.5px] uppercase font-extrabold ${s.textWhiteOrSlate} tracking-wider`}>RECENT SESSION ANALYTICS</span>
              <div className="flex gap-2">
                <button className={`p-1 px-2.5 text-[9px] font-mono font-bold text-slate-400 border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-transparent'} rounded uppercase`}>Filters</button>
                <button className={`p-1 px-2.5 text-[9px] font-mono font-bold text-slate-400 border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-transparent'} rounded uppercase`}>Share</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className={`border-b ${s.borderLine} font-mono text-[9px] font-extrabold text-slate-400 uppercase ${isDark ? 'bg-[#081223]/30' : 'bg-slate-50/30'} select-none`}>
                    <th className="p-4 pl-6">DATE</th>
                    <th className="p-4">ACTIVITY</th>
                    <th className="p-4 text-center">PERFORMANCE</th>
                    <th className="p-4 text-center">CONSISTENCY</th>
                    <th className="p-4 text-center">OUTCOME</th>
                    <th className="p-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-850' : 'divide-slate-100'}`}>
                  <tr className={`hover:${isDark ? 'bg-slate-900/35' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 24, 2023</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      High-Intensity Scrim <span className="text-slate-400 text-[10.5px] font-normal">vs. Team Liquid</span>
                    </td>
                    <td className="p-4 text-center font-display text-emerald-600 font-black text-sm">S+</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>VICTORY</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className={`hover:${isDark ? 'bg-slate-900/35' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 23, 2023</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Mechanics Drill #04 <span className="text-slate-400 text-[10.5px] font-normal">Solo Queue Practice</span>
                    </td>
                    <td className="p-4 text-center font-display text-sky-600 font-black text-sm">A</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>STABLE</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className={`hover:${isDark ? 'bg-slate-900/35' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 22, 2023</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Strategy Workshop <span className="text-slate-400 text-[10.5px] font-normal">with Coach K.</span>
                    </td>
                    <td className="p-4 text-center font-display text-slate-500 font-black text-sm">B-</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>RE-FOCUS</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

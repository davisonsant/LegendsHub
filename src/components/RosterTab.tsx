/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Sparkles, TrendingUp, DollarSign, Calendar, Heart, Award, ArrowUp, 
  RefreshCcw, Search, Trash2, SwitchCamera, Check, Play, UserCheck, BarChart2,
  ListFilter, Circle, HelpCircle, Activity, ChevronRight, ChevronLeft, Globe, BrainCircuit, Target, Laptop, Plus, Edit2
} from 'lucide-react';
import { GameState, Player, Position, Team } from '../types';
import { formatMoney } from '../utils/currency';
import { GLOBAL_FREE_AGENTS } from '../utils/freeAgents';
import { getGameAssetUrl } from '../utils/gameAssets';

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
    <div className={`flex flex-col items-center select-none p-4 ${isDark ? 'bg-[#070d19]/80 border-slate-800/60 text-white' : 'bg-slate-50 border-slate-200/50 text-slate-800'} rounded-xl border shadow-sm w-full animate-fade-in`}>
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
const isEuropeanNationality = (nationality: string): boolean => {
  if (!nationality) return false;
  const normalized = nationality.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removes accents
  
  const europeanKeywords = [
    'alemanha', 'germany', 'de', 'deutschland',
    'reino unido', 'united kingdom', 'gb', 'uk', 'england', 'inglaterra',
    'suecia', 'sweden', 'se',
    'franca', 'france', 'fr',
    'espanha', 'spain', 'es',
    'polonia', 'poland', 'pl',
    'portugal', 'pt',
    'italia', 'italy', 'it',
    'grecia', 'greece', 'gr',
    'dinamarca', 'denmark', 'dk',
    'belgica', 'belgium', 'be',
    'noruega', 'norway', 'no',
    'finlandia', 'finland', 'fi',
    'holanda', 'netherlands', 'nl', 'paises baixos',
    'irlanda', 'ireland', 'ie',
    'austria', 'at',
    'suica', 'switzerland', 'ch',
    'ucrania', 'ukraine', 'ua',
    'turquia', 'turkey', 'tr',
    'tcheca', 'czech', 'cz',
    'romenia', 'romania', 'ro',
    'croacia', 'croatia', 'hr',
    'lituania', 'lithuania', 'lt',
    'eslovaquia', 'slovakia', 'sk',
    'eslovenia', 'slovenia', 'si',
    'hungria', 'hungary', 'hu',
    'letonia', 'latvia', 'lv',
    'estonia', 'estonia', 'ee',
    'bulgaria', 'bulgaria', 'bg',
    'islandia', 'iceland', 'is',
    'servia', 'serbia', 'rs',
    'europa', 'europe', 'eu',
    'skewmond'
  ];
  
  return europeanKeywords.some(keyword => normalized.includes(keyword));
};

const getIsForeign = (player: Player, teamRegion?: string) => {
  if (!teamRegion) teamRegion = 'CBLOL';
  const nat = (player.nationality || '').trim().toLowerCase();
  if (teamRegion === 'CBLOL') {
    return nat !== 'brasil' && nat !== 'br' && nat !== 'brazil';
  }
  if (teamRegion === 'LCK') {
    return nat !== 'coreia do sul' && nat !== 'south korea' && nat !== 'kr' && nat !== 'korean' && nat !== 'coreia';
  }
  if (teamRegion === 'LPL') {
    return nat !== 'china' && nat !== 'chinese' && nat !== 'cn';
  }
  if (teamRegion === 'LCS') {
    return nat !== 'eua' && nat !== 'usa' && nat !== 'united states' && nat !== 'canadá' && nat !== 'canada' && nat !== 'norte-americano';
  }
  if (teamRegion === 'LEC') {
    return !isEuropeanNationality(player.nationality);
  }
  return nat !== 'brasil' && nat !== 'br' && nat !== 'brazil';
};

const getVistoStatus = (player: Player, teamRegion?: string, vistoEspecialTorneioAtivo?: boolean, vistoEspecialTorneioNome?: string) => {
  if (vistoEspecialTorneioAtivo) {
    return { label: `[ATIVO] (${vistoEspecialTorneioNome})`, visaClass: 'Visto Especial de Torneio', timeRemaining: 'Temporário' };
  }
  if (!getIsForeign(player, teamRegion)) {
    return { label: '[VISTO PERMANENTE / ATLETA LOCAL]', visaClass: 'Atleta Local', timeRemaining: 'Permanente' };
  }
  const visaClass = player.overallRating >= 85 ? 'Visto EB-1 (Excelência)' : 'Visto P-1 (Atleta Internacional)';
  const months = Math.max(4, (player.contractMonths || 12) + 2);
  return { label: `${months} meses restantes`, visaClass, timeRemaining: `${months} meses` };
};

const getBehavioralAttributes = (player: Player, teamRegion?: string) => {
  const isForeign = getIsForeign(player, teamRegion);
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
  onStartNegotiation?: (playerId: string) => void;
  isAcademy?: boolean;
  onPromoteProspect?: (player: Player) => void;
}

function getChampionAvatarUrl(championName: string): string {
  const cleanName = championName
    .replace('K_sante', 'KSante')
    .replace('Ksante', 'KSante')
    .replace('Wukong', 'MonkeyKing')
    .replace('Lee Sin', 'LeeSin')
    .replace('LeeSin', 'LeeSin')
    .replace('AATROX', 'Aatrox')
    .replace(/\s+/g, '');
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${formattedName}.png`;
}

function getChampionClassInfo(championName: string) {
  const name = championName.toLowerCase();
  if (name.includes('ksante') || name.includes('sante') || name.includes('sion') || name.includes('ornn') || name.includes('malphite') || name.includes('nautilus') || name.includes('leona') || name.includes('sejuani') || name.includes('renekton')) {
    return { label: 'Tanque', emoji: '🛡️', colorClass: 'bg-blue-600 text-white' };
  }
  if (name.includes('azir') || name.includes('ryze') || name.includes('viktor') || name.includes('orianna') || name.includes('syndra') || name.includes('ahri') || name.includes('karma') || name.includes('veigar')) {
    return { label: 'Mago', emoji: '🔮', colorClass: 'bg-[#a855f7] text-white' };
  }
  if (name.includes('jinx') || name.includes('aphelios') || name.includes('kaisa') || name.includes('xayah') || name.includes('tristana') || name.includes('zeri') || name.includes('lucian') || name.includes('ezreal') || name.includes('vayne') || name.includes('sivir') || name.includes('ashe')) {
    return { label: 'Atirador', emoji: '🎯', colorClass: 'bg-emerald-600 text-white' };
  }
  if (name.includes('yasuo') || name.includes('yone') || name.includes('zed') || name.includes('akali') || name.includes('khazix') || name.includes('rengar') || name.includes('talon') || name.includes('leblanc')) {
    return { label: 'Assassino', emoji: '🗡️', colorClass: 'bg-rose-600 text-white' };
  }
  if (name.includes('aatrox') || name.includes('lee') || name.includes('wukong') || name.includes('jax') || name.includes('gnar') || name.includes('fiora') || name.includes('camille') || name.includes('irelia') || name.includes('hecarim')) {
    return { label: 'Lutador', emoji: '⚔️', colorClass: 'bg-amber-650 text-white' };
  }
  if (name.includes('thresh') || name.includes('lulu') || name.includes('rakan') || name.includes('yuumi') || name.includes('janna') || name.includes('soraka') || name.includes('nami') || name.includes('bard')) {
    return { label: 'Suporte', emoji: '✨', colorClass: 'bg-teal-600 text-white' };
  }
  return { label: 'Lutador', emoji: '⚔️', colorClass: 'bg-slate-605 text-white' };
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
  setIsDetailedProfileOpen: setControlledDetailOpen,
  onStartNegotiation,
  isAcademy = false,
  onPromoteProspect
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
  const isAcademyRoster = !!isAcademy;
  const rosterPlayers = isAcademyRoster ? (userTeam.academy || []) : userTeam.roster;
  const substitutesPlayers = isAcademyRoster ? [] : userTeam.substitutes;

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
          const removedPlayer = nextSubstitutes[subIdx];
          const isTravelVisaActive = !!t.vistoEspecialTorneioAtivo;
          
          if (removedPlayer.isImported && !removedPlayer.visaApproved && !isTravelVisaActive) {
            alert(`🚫 [BLOQUEIO DE ESCALAÇÃO] O atleta importado ${removedPlayer.name} não possui o visto regulatório P-1 aprovado e está proibido de disputar partidas oficiais pela liga.`);
            return t; // Abort operation and return unmodified team
          }
          
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

  const [localSelectedPlayerId, setLocalSelectedPlayerId] = useState<string>(rosterPlayers[0]?.id || '');
  const [localIsDetailedProfileOpen, setLocalIsDetailedProfileOpen] = useState(false);

  const selectedPlayerId = (controlledPlayerId !== undefined && controlledPlayerId !== '') ? controlledPlayerId : localSelectedPlayerId;
  const isDetailedProfileOpen = controlledDetailOpen !== undefined ? controlledDetailOpen : localIsDetailedProfileOpen;

  const setSelectedPlayerId = setControlledPlayerId || setLocalSelectedPlayerId;
  const setIsDetailedProfileOpen = setControlledDetailOpen || setLocalIsDetailedProfileOpen;

  // Rule-enforced reactive reset:
  useEffect(() => {
    if (!isDetailedProfileOpen) {
      const isPlayerOwned = rosterPlayers.some(p => p.id === selectedPlayerId) || 
                            substitutesPlayers.some(p => p.id === selectedPlayerId);
      
      if (!selectedPlayerId || !isPlayerOwned) {
        const topStarter = rosterPlayers.find(p => p.position === 'TOP') || rosterPlayers[0];
        if (topStarter) {
          setSelectedPlayerId(topStarter.id);
        }
      }
    }
  }, [isDetailedProfileOpen, selectedPlayerId, rosterPlayers, substitutesPlayers]);
  
  // Custom view toggle: 'profile' (Screenshot 1) vs 'training' (Screenshot 2)
  const [panelViewMode, setPanelViewMode] = useState<'profile' | 'training'>('profile');
  
  const [trainingFoci, setTrainingFoci] = useState<{ [pId: string]: string }>({
    [rosterPlayers[0]?.id]: 'FASE DE ROTAS'
  });

  const [comissaoActive, setComissaoActive] = useState(false);
  const [intensivaoActive, setIntensivaoActive] = useState(false);

  // Scouting states
  const [scoutedPlayers, setScoutedPlayers] = useState<Player[]>([]);
  const [isScoutingActive, setIsScoutingActive] = useState(false);
  const [isScoutingLoading, setIsScoutingLoading] = useState(false);

  // Contract renewal modal states
  const [renewingPlayer, setRenewingPlayer] = useState<Player | null>(null);
  const [renewMonths, setRenewMonths] = useState<number>(24);
  const [renewSalary, setRenewSalary] = useState<number>(0);
  const [hasWorldsBonus, setHasWorldsBonus] = useState<boolean>(false);
  const [worldsBonusValue, setWorldsBonusValue] = useState<number>(50000);
  const [hasMsiBonus, setHasMsiBonus] = useState<boolean>(false);
  const [msiBonusValue, setMsiBonusValue] = useState<number>(25000);
  const [hasLeagueBonus, setHasLeagueBonus] = useState<boolean>(false);
  const [leagueBonusValue, setLeagueBonusValue] = useState<number>(15000);
  const [imageRightsPercent, setImageRightsPercent] = useState<number>(20);

  // Renaming player states
  const [renamingPlayer, setRenamingPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  // --- SISTEMA DE INTERAÇÃO E ASSÉDIO DE MERCADO ---
  const [playerInteractions, setPlayerInteractions] = useState<Record<string, { interest: number; loyalty: number; revealedSalary: boolean; interactionsCount: number }>>(() => {
    try {
      const saved = localStorage.getItem('legendshub_external_interactions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('legendshub_external_interactions', JSON.stringify(playerInteractions));
  }, [playerInteractions]);

  // States for dynamic buyout & proposal popups
  const [selectedExternalPlayer, setSelectedExternalPlayer] = useState<Player | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalTransferValue, setProposalTransferValue] = useState<number>(0);
  const [proposalSalaryWeekly, setProposalSalaryWeekly] = useState<number>(0);
  const [proposalSigningBonus, setProposalSigningBonus] = useState<number>(0);
  const [proposalDuration, setProposalDuration] = useState<number>(18);
  const [proposalResult, setProposalResult] = useState<{ status: 'idle' | 'analyzing' | 'success' | 'rejected' | 'counter'; msg: string; counterAmount?: number } | null>(null);

  const getExternalStats = (p: Player) => {
    const existing = playerInteractions[p.id];
    if (existing) {
      return existing;
    }
    // Deterministic base stats
    let baseComp = 0;
    for (let i = 0; i < p.name.length; i++) {
      baseComp += p.name.charCodeAt(i);
    }
    const baseInterest = ((baseComp + p.overallRating * 7) % 30) + 15; // 15% to 45%
    const baseLoyalty = 100 - ((baseComp + p.age * 9) % 30); // 70% to 100%
    return {
      interest: baseInterest,
      loyalty: baseLoyalty,
      revealedSalary: false,
      interactionsCount: 0
    };
  };

  const updateExternalStats = (playerId: string, updates: Partial<{ interest: number; loyalty: number; revealedSalary: boolean; interactionsCount: number }>) => {
    setPlayerInteractions(prev => {
      const current = prev[playerId] || getExternalStats(gameState.teams.flatMap(t => [...t.roster, ...t.substitutes, ...(t.academy || [])]).find(x => x.id === playerId)!);
      const nextStats = {
        interest: Math.max(0, Math.min(100, updates.interest !== undefined ? updates.interest : current.interest)),
        loyalty: Math.max(0, Math.min(100, updates.loyalty !== undefined ? updates.loyalty : current.loyalty)),
        revealedSalary: updates.revealedSalary !== undefined ? updates.revealedSalary : current.revealedSalary,
        interactionsCount: (updates.interactionsCount !== undefined ? updates.interactionsCount : current.interactionsCount)
      };
      return {
        ...prev,
        [playerId]: nextStats
      };
    });
  };

  const handlePraisePress = (p: Player) => {
    const stats = getExternalStats(p);
    if (stats.interactionsCount >= 5) {
      alert("Limite de interações atingido! O jogador está sobrecarregado de mensagens públicas esta semana.");
      return;
    }
    const bonus = 5 + Math.floor(Math.random() * 4); // 5-8%
    const penalty = 3 + Math.floor(Math.random() * 4); // 3-6%
    updateExternalStats(p.id, {
      interest: stats.interest + bonus,
      loyalty: stats.loyalty - penalty,
      interactionsCount: stats.interactionsCount + 1
    });
    alert(`🎙️ ELOGIO NA COLETIVA DE IMPRENSA DEFERIDO!\n\nVocê elogiou publicamente a mecânica de ${p.name} em entrevistas coletivas oficiais. Os agentes repassaram as falas e o cyberatleta ficou muito honrado!\n\n✔️ Nível de Interesse: +${bonus}%\n❌ Fidelidade com o Clube Atual: -${penalty}%`);
  };

  const handleSondarAgent = (p: Player) => {
    const cost = 5000;
    if (userTeam.budget < cost) {
      alert("Fundos organizacionais insuficientes para pagar o consultor e comissão do empresário ($5.000 necessários).");
      return;
    }
    const stats = getExternalStats(p);
    if (stats.interactionsCount >= 5) {
      alert("A comitiva do agente se recusa a agendar novas reuniões de aproximação esta semana.");
      return;
    }

    // Deduct budget
    if (onUpdateGameState) {
      const nextTeams = gameState.teams.map(t => {
        if (t.id === userTeam.id) {
          return { ...t, budget: t.budget - cost };
        }
        return t;
      });
      onUpdateGameState({ ...gameState, teams: nextTeams });
    }

    const bonus = 8 + Math.floor(Math.random() * 5); // 8-12%
    updateExternalStats(p.id, {
      interest: stats.interest + bonus,
      revealedSalary: true,
      interactionsCount: stats.interactionsCount + 1
    });
    alert(`💼 REUNIÃO SECRETA DE SONDAGEM REALIZADA ($5.000 COBRADOS)!\n\nVocê contratou especialistas e sondou secretamente as aspirações salariais de ${p.name}. O representante deu excelentes sinalizações contratuais.\n\n✔️ Salário de base estimado do atleta: ${formatMoney(Math.round(p.salary / 4))} semanais\n✔️ Multa de liberação imediata (passe): ${formatMoney(p.marketValue)}\n✔️ Nível de Interesse: +${bonus}%`);
  };

  const handleUndergroundPoaching = (p: Player) => {
    const cost = 15000;
    if (userTeam.budget < cost) {
      alert("Fundos insuficientes para financiar acordos confidenciais e taxas privadas de abordagem ($15.000 necessários).");
      return;
    }
    const stats = getExternalStats(p);
    if (stats.interactionsCount >= 5) {
      alert("Contatos offline bloqueados para evitar vazamentos alarmantes na mídia de esports.");
      return;
    }

    // Deduct approach budget
    let nextTeamsBudget = userTeam.budget - cost;
    
    // Check 30% chance of League Fine
    const isCaught = Math.random() < 0.3;
    const fineCost = 45000;

    if (isCaught) {
      nextTeamsBudget -= fineCost;
      if (onUpdateGameState) {
        const nextTeams = gameState.teams.map(t => {
          if (t.id === userTeam.id) {
            return { ...t, budget: nextTeamsBudget };
          }
          return t;
        });
        onUpdateGameState({ ...gameState, teams: nextTeams });
      }
      alert(`🚨 INCIDENTE CRÍTICO: MULTA POR ALICIAMENTO DA LIGA!\n\nA associação brasileira de esports flagrou transferências de DMs diretas não regulamentadas por debaixo dos panos (tempering) com ${p.name}.\n\nA equipe foi penalizada com uma multa estatutária imediata de ${formatMoney(fineCost)} + advertência formal corporativa.\n\nDespesa total da operação (abordagem + multa): ${formatMoney(cost + fineCost)}.`);
      updateExternalStats(p.id, {
        interest: Math.max(0, stats.interest - 10),
        interactionsCount: stats.interactionsCount + 1
      });
    } else {
      if (onUpdateGameState) {
        const nextTeams = gameState.teams.map(t => {
          if (t.id === userTeam.id) {
            return { ...t, budget: nextTeamsBudget };
          }
          return t;
        });
        onUpdateGameState({ ...gameState, teams: nextTeams });
      }
      const bonus = 18 + Math.floor(Math.random() * 8); // 18-25%
      const penalty = 10 + Math.floor(Math.random() * 6); // 10-15%
      updateExternalStats(p.id, {
        interest: stats.interest + bonus,
        loyalty: stats.loyalty - penalty,
        interactionsCount: stats.interactionsCount + 1
      });
      alert(`⚡ SUCESSO COGNITIVO NA ABORDAGEM UNDERGROUND!\n\nVocê contatou diretamente o canal de voz pessoal de ${p.name}. Sem o conhecimento da equipe rival, o cyberatleta ficou empolgadíssimo em ser o novo astro sob suas ordens jurídicas!\n\n✔️ Nível de Interesse em seu Clube: +${bonus}%\n❌ Fidelidade com Equipe Rival: -${penalty}%`);
    }
  };

  const handleOpenProposalSheet = (p: Player) => {
    const stats = getExternalStats(p);
    if (stats.interest < 35) {
      alert(`❌ NEGOCIAÇÃO IMPOSSIBILITADA!\n\nO nível de interesse de ${p.name} em seu projeto é de apenas ${stats.interest}%. Ele se recusa sumariamente a assinar contratos ou interagir com seus representantes comerciais.\n\nUse elogios, sondagens e abordagens no painel de interações para elevar o interesse para pelo menos 35% antes de apresentar propostas financeiras!`);
      return;
    }
    
    // Set default sliders values
    setSelectedExternalPlayer(p);
    setProposalTransferValue(p.marketValue);
    setProposalSalaryWeekly(Math.round(p.salary / 4));
    setProposalSigningBonus(Math.round(p.marketValue * 0.1));
    setProposalDuration(18);
    setProposalResult({ status: 'idle', msg: '' });
    setIsProposalModalOpen(true);
  };

  const handleSubmitBuyoutProposal = () => {
    if (!selectedExternalPlayer) return;
    const p = selectedExternalPlayer;
    const stats = getExternalStats(p);

    if (proposalTransferValue > userTeam.budget) {
      alert("Proposta recusada na mesa de análise interna: O orçamento corporativo é insuficiente para arcar com os valores de aquisição indicados.");
      return;
    }

    setProposalResult({ status: 'analyzing', msg: 'Avaliando parâmetros de mercado...' });

    setTimeout(() => {
      // 1. Club Acceptance Analysis
      const loyaltyMultiplier = 1 + (stats.loyalty / 150); 
      const minAcceptableFee = Math.round(p.marketValue * 0.88 * loyaltyMultiplier);

      if (proposalTransferValue < minAcceptableFee) {
        setProposalResult({
          status: 'rejected',
          msg: `REJEIÇÃO DO CLUBE: O CEO da equipe rival ${playerTeam?.name || 'Rival'} deu uma resposta fulminante: "Consideramos a taxa de transferência proposta de ${formatMoney(proposalTransferValue)} ridícula para o passe comercial de ${p.name}. Exigimos um mínimo substancial de ${formatMoney(minAcceptableFee)} à vista para sentar na mesa de conversações!"`
        });
        return;
      }

      // 2. Player Salary Acceptance Analysis
      const requiredWages = Math.round((p.overallRating * 1250) * (1 - (stats.interest - 35) / 180));
      const wageDissonance = proposalSalaryWeekly / requiredWages;

      if (wageDissonance < 0.9) {
        setProposalResult({
          status: 'rejected',
          msg: `REJEIÇÃO DO ATLETA: O representante de ${p.name} informou que as condições salariais de ${formatMoney(proposalSalaryWeekly)}/semana são desfavoráveis. Ele exige um salário base de pelo menos ${formatMoney(requiredWages)}/semana com luvas adequadas.`
        });
        return;
      }

      // 3. SUCCESS! Offer Approved
      setProposalResult({
        status: 'success',
        msg: `ACORDO EFETIVADO COM SUCESSO!\n\nOs diretores de ambas as organizações assinaram o ofício eletrônico. O cyberatleta ${p.name} celebrou o desligamento, empacotou suas coisas e já se reportou ao quartel-general da sua equipe para dar início às sessões táticas imediatas!`
      });

    }, 1300);
  };

  const handleFinalizeExternalTransfer = () => {
    if (!selectedExternalPlayer) return;
    const p = selectedExternalPlayer;

    // Apply persistent mutations
    if (onUpdateGameState) {
      const totalCost = proposalTransferValue + proposalSigningBonus;

      const nextTeams = gameState.teams.map(t => {
        if (t.id === userTeam.id) {
          const signedPlayer: Player = {
            ...p,
            isPlayerControlled: true,
            salary: proposalSalaryWeekly * 4,
            contractMonths: proposalDuration
          };

          const rosterInstance = [...t.roster];
          const substitutesInstance = t.substitutes ? [...t.substitutes] : [];

          if (rosterInstance.length < 5) {
            rosterInstance.push(signedPlayer);
          } else {
            substitutesInstance.push(signedPlayer);
          }

          return {
            ...t,
            budget: t.budget - totalCost,
            roster: rosterInstance,
            substitutes: substitutesInstance
          };
        }

        if (playerTeam && t.id === playerTeam.id) {
          const cleanRoster = t.roster.filter(item => item.id !== p.id);
          const cleanSubs = t.substitutes ? t.substitutes.filter(item => item.id !== p.id) : [];
          const cleanAcademy = t.academy ? t.academy.filter(item => item.id !== p.id) : [];

          return {
            ...t,
            budget: t.budget + proposalTransferValue,
            roster: cleanRoster,
            substitutes: cleanSubs,
            academy: cleanAcademy
          };
        }

        return t;
      });

      onUpdateGameState({
        ...gameState,
        teams: nextTeams
      });
      
      setIsProposalModalOpen(false);
      setIsDetailedProfileOpen(false);
      alert(`🎉 CONTRATAÇÃO CONFIRMADA!\n\nO astro ${p.name} foi adicionado à escalação da sua equipe de eSports com sucesso!`);
    }
  };

  const renderExternalAthleteSystem = () => {
    if (!activePlayer) return null;
    const stats = getExternalStats(activePlayer);

    return (
      <div className="pt-4 border-t border-slate-205 dark:border-slate-805 space-y-4 text-left">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4.5 h-4.5 text-cyan-500 animate-pulse" />
          <h4 className={`text-[11px] font-mono font-black uppercase tracking-wider ${isDark ? 'text-[#00ffff]' : 'text-[#0B1B3D]'}`}>
            📊 CENTRAL DE INTERAÇÃO & ASSÉDIO (POACHING HUB)
          </h4>
        </div>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          Este atleta é titular exclusivo da rival <strong className={`uppercase ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{playerTeam ? playerTeam.name : 'Outra Equipe'}</strong>. Use nosso painel de interação e assédio de mercado para seduzir e iniciar tratativas fiduciárias secretas com o atleta:
        </p>

        {/* Commitment Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-[9px] font-mono font-extrabold text-slate-400 uppercase">
              <span>Nível de Interesse</span>
              <span className="text-cyan-400 font-black">{stats.interest}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-850">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.interest}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-450 dark:text-slate-500 block leading-tight">Mínimo de 35% necessário para propostas de passe.</span>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-[9px] font-mono font-extrabold text-slate-400 uppercase">
              <span>Fidelidade do Atleta</span>
              <span className="text-rose-450 font-black">{stats.loyalty}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-850">
              <div 
                className="bg-gradient-to-r from-rose-500 to-[#ff4a4a] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.loyalty}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-450 dark:text-slate-500 block leading-tight">Maiores níveis exigem taxas de transferência substanciais.</span>
          </div>
        </div>

        {/* Interaction Actions */}
        <div className="space-y-2">
          <button
            onClick={() => handlePraisePress(activePlayer)}
            className="w-full py-2.5 px-3 rounded bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold tracking-wide uppercase flex items-center justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01]"
          >
            <span>🎙️ Teçar Elogios Públicos (Imprensa)</span>
            <span className="font-mono text-[9px] font-black text-emerald-500 font-semibold">Grátis (+5%-8% int)</span>
          </button>

          <button
            onClick={() => handleSondarAgent(activePlayer)}
            className="w-full py-2.5 px-3 rounded bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold tracking-wide uppercase flex items-center justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01]"
          >
            <span>💼 Sondar Empresário (Acordo Secreto)</span>
            <span className="font-mono text-[9px] font-black text-amber-500 font-semibold">-$5.000 (Revela Info)</span>
          </button>

          <button
            onClick={() => handleUndergroundPoaching(activePlayer)}
            className="w-full py-2.5 px-3 rounded bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold tracking-wide uppercase flex items-center justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01]"
          >
            <span>⚡ Abordagem Direta (Poaching Secreto)</span>
            <span className="font-mono text-[9px] font-black text-rose-500 font-semibold">-$15.000 (Risco de Multa)</span>
          </button>
        </div>

        {/* Open Proposal Sheet Trigger Button */}
        <button
          onClick={() => handleOpenProposalSheet(activePlayer)}
          className="w-full mt-3 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-[10.5px] font-black tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          🤝 APRESENTAR PROPOSTA RESCISÓRIA OFICIAL
        </button>

        {stats.revealedSalary && (
          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center space-y-1 animate-fade-in">
            <p className="text-[10px] text-emerald-400 font-mono font-black tracking-wider uppercase">📂 SONDAGEM COMPLETA ATIVA:</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-sans">
              Salário Semanal: {formatMoney(Math.round(activePlayer.salary / 4))} • Passe de Saída: {formatMoney(activePlayer.marketValue)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderProposalModal = () => {
    if (!isProposalModalOpen || !selectedExternalPlayer) return null;
    const p = selectedExternalPlayer;
    const stats = getExternalStats(p);

    const minRecommendedFee = Math.round(p.marketValue * 0.9 * (1 + stats.loyalty / 150));

    return (
      <div className="fixed inset-0 min-h-screen w-screen z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-8 overflow-y-auto select-none">
        <div className={`w-full max-w-lg ${isDark ? 'bg-[#0b132b] border-[#1c2e5c]' : 'bg-white border-slate-200'} rounded-2xl border p-6 space-y-5 shadow-2xl relative animate-fade-in text-left`}>
          
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-display font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> APRESENTAR PROPOSTA FINANCEIRA DE COMPRA
            </h3>
            <button
              onClick={() => setIsProposalModalOpen(false)}
              className="text-slate-400 hover:text-[#00ffff] text-xs font-mono tracking-widest uppercase cursor-pointer"
            >
              [ FECHAR ]
            </button>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500/30 bg-transparent flex items-center justify-center">
              <img 
                src={getGameAssetUrl('players', p.id, p.photoUrl)} 
                className="w-full h-full object-contain bg-transparent" 
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
              />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">{p.name}</p>
              <p className="text-[9px] text-slate-500 font-mono font-bold mt-1 uppercase">OVR {p.overallRating} • {p.position} • {playerTeam?.name || 'Rival'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[9px] text-slate-450 uppercase font-mono tracking-wider">Seu Saldo</p>
              <p className="text-xs font-mono font-black text-emerald-500">{formatMoney(userTeam.budget)}</p>
            </div>
          </div>

          {proposalResult?.status === 'analyzing' ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCcw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-mono font-black text-slate-450 animate-pulse uppercase tracking-widest text-center">TRANSMITINDO DOCUMENTOS DE TRANSFERÊNCIA DA LIGA...</p>
            </div>
          ) : proposalResult?.status && proposalResult.status !== 'idle' ? (
            <div className="py-2 space-y-4">
              <div className={`p-4 rounded-xl border leading-relaxed text-xs font-medium whitespace-pre-line ${
                proposalResult.status === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}>
                {proposalResult.msg}
              </div>

              <div className="flex gap-3">
                {proposalResult.status === 'success' ? (
                  <button
                    onClick={handleFinalizeExternalTransfer}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                  >
                    CONCLUIR TRANSAÇÃO E INGRESSAR ATLETA
                  </button>
                ) : (
                  <button
                    onClick={() => setProposalResult({ status: 'idle', msg: '' })}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                  >
                    AJUSTAR PROPOSTA FINANCEIRA
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Sliders Inputs */}
              
              {/* 1. Taxa de Transferência */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-400 uppercase">
                  <span>Taxa de Transferência (Oferecido ao Clube)</span>
                  <span className="text-cyan-400 font-extrabold">{formatMoney(proposalTransferValue)}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(p.marketValue * 0.4)}
                  max={Math.round(p.marketValue * 2)}
                  step={5000}
                  value={proposalTransferValue}
                  onChange={(e) => setProposalTransferValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-450"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>MÍN: {formatMoney(Math.round(p.marketValue * 0.4))}</span>
                  <span>ESTIMADO: {formatMoney(minRecommendedFee)}</span>
                  <span>MÁX: {formatMoney(p.marketValue * 2)}</span>
                </div>
              </div>

              {/* 2. Salário Semanal */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-400 uppercase">
                  <span>Salário Semanal (Oferecido ao Atleta)</span>
                  <span className="text-cyan-400 font-extrabold">{formatMoney(proposalSalaryWeekly)}/semana</span>
                </div>
                <input
                  type="range"
                  min={Math.round(p.salary / 6)}
                  max={Math.round(p.salary * 1.5)}
                  step={250}
                  value={proposalSalaryWeekly}
                  onChange={(e) => setProposalSalaryWeekly(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-450"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>MÍN: {formatMoney(Math.round(p.salary / 6))}</span>
                  <span>BASE ATUAL: {formatMoney(Math.round(p.salary / 4))}</span>
                  <span>MÁX: {formatMoney(Math.round(p.salary * 1.5))}</span>
                </div>
              </div>

              {/* 3. Bônus de Assinatura */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-400 uppercase">
                  <span>Luvas de Assinatura (Fidelização imediata)</span>
                  <span className="text-cyan-400 font-extrabold">{formatMoney(proposalSigningBonus)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120000}
                  step={5000}
                  value={proposalSigningBonus}
                  onChange={(e) => setProposalSigningBonus(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-450"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>0 (Sem luvas)</span>
                  <span>RECOMENDADO: $60.000</span>
                  <span>MÁX: $120.000</span>
                </div>
              </div>

              {/* 4. Duração */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase block">Vínculo de Trabalho Proposto</span>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 18, 24].map((m) => (
                    <button
                      key={m}
                      onClick={() => setProposalDuration(m)}
                      className={`py-2 text-[10px] uppercase font-mono font-black rounded-lg border transition-all ${
                        proposalDuration === m 
                          ? 'bg-cyan-500/20 border-cyan-500/75 text-cyan-400' 
                          : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
                      }`}
                    >
                      {m} meses
                    </button>
                  ))}
                </div>
              </div>

              {/* Main submit */}
              <button
                onClick={handleSubmitBuyoutProposal}
                className="w-full mt-2 py-3.5 bg-[#006e80] hover:bg-[#005c6c] text-white text-[11px] font-black tracking-wider uppercase rounded-lg shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                📥 SUBMETER OFERTA OFICIAL DE TRANSFERÊNCIA
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleRenamePlayerConfirm = () => {
    if (!renamingPlayer || !newPlayerName.trim()) return;
    if (!onUpdateGameState) return;

    const targetId = renamingPlayer.id;
    const finalName = newPlayerName.trim();

    const nextTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        const nextRoster = t.roster.map(p => p.id === targetId ? { ...p, name: finalName } : p);
        const nextSubstitutes = t.substitutes.map(p => p.id === targetId ? { ...p, name: finalName } : p);
        const nextAcademy = (t.academy || []).map(p => p.id === targetId ? { ...p, name: finalName } : p);
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

    setRenamingPlayer(null);
  };

  const openRenewNegotiations = (player: Player) => {
    setRenewingPlayer(player);
    setRenewMonths(24);
    setRenewSalary(Math.round((player.salary / 4) * 1.15)); // salário base sugerido +15%
    setHasWorldsBonus(false);
    setWorldsBonusValue(50000);
    setHasMsiBonus(false);
    setMsiBonusValue(25000);
    setHasLeagueBonus(false);
    setLeagueBonusValue(15000);
    setImageRightsPercent(20);
  };

  const handleScoutSubstitutes = (player: Player) => {
    setIsScoutingLoading(true);
    setIsScoutingActive(true);
    setScoutedPlayers([]);
    
    setTimeout(() => {
      // Procurar todos os jogadores do mercado (de rivais e do banco global do mercado)
      const rivalPlayers = gameState.teams
        .filter(t => t.id !== gameState.playerTeamId)
        .flatMap(t => [...t.roster, ...t.substitutes]);
        
      const allMarketPlayers = [...rivalPlayers, ...GLOBAL_FREE_AGENTS];
      
      // Filtrar por mesma posição, excluir o próprio jogador e procurar nível aproximado (diferença <= 8 de OVR)
      const candidates = allMarketPlayers.filter(p => 
        p.position === player.position && 
        p.id !== player.id &&
        Math.abs(p.overallRating - player.overallRating) <= 8
      );
      
      // Ordenar por similaridade de OVR
      candidates.sort((a, b) => Math.abs(a.overallRating - player.overallRating) - Math.abs(b.overallRating - player.overallRating));
      
      // Escolher 3 principais recomendados
      setScoutedPlayers(candidates.slice(0, 3));
      setIsScoutingLoading(false);
    }, 600);
  };

  const calculateRenewProbability = () => {
    if (!renewingPlayer) return 0;
    
    // 1. Salário Oferecido em relação à expectativa baseada no salário atual e OVR do jogador
    const baseExpectedSalary = renewingPlayer.salary / 4;
    const ovrMultiplier = 1 + (renewingPlayer.overallRating - 70) * 0.02;
    const expectedSalary = Math.round(baseExpectedSalary * ovrMultiplier);
    
    const salaryRatio = renewSalary / expectedSalary; 
    let salaryScore = 0;
    if (salaryRatio >= 1.0) {
      salaryScore = 55 + Math.min(25, (salaryRatio - 1.0) * 35);
    } else {
      salaryScore = Math.max(0, Math.round(55 * Math.pow(salaryRatio, 2.5)));
    }
    
    // 2. Duração do Vínculo
    let durationScore = 15;
    if (renewMonths >= 18 && renewMonths <= 30) {
      durationScore += 5;
    } else if (renewMonths < 10) {
      durationScore -= 8;
    } else if (renewMonths > 36) {
      durationScore -= 3;
    }
    
    // 3. Bônus por conquista adicionados
    let bonusScore = 0;
    if (hasWorldsBonus) {
      bonusScore += Math.min(10, (worldsBonusValue / 500000) * 8 + 3);
    }
    if (hasMsiBonus) {
      bonusScore += Math.min(8, (msiBonusValue / 250000) * 6 + 2);
    }
    if (hasLeagueBonus) {
      bonusScore += Math.min(7, (leagueBonusValue / 100000) * 5 + 2);
    }
    
    // 4. Direitos de Imagem
    const imageRightsScore = (imageRightsPercent / 100) * 15;
    
    // 5. Humor/Satisfação do jogador (motivação)
    const motivationBonus = ((renewingPlayer.motivation || 75) - 60) * 0.25; 
    
    // 6. Sinergia de time do jogador
    const teamChemistry = renewingPlayer.chemistry || 70;
    const chemistryBonus = (teamChemistry / 100) * 6;
    
    const totalScore = salaryScore + durationScore + imageRightsScore + bonusScore + motivationBonus + chemistryBonus;
    return Math.max(0, Math.min(100, Math.round(totalScore)));
  };

  // Drag and Drop States and Handlers
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);

  const handleReorder = (draggedId: string, targetId: string, isRoster: boolean) => {
    if (!onUpdateGameState || !gameState) return;
    const list = isRoster ? [...userTeam.roster] : [...userTeam.substitutes];
    const draggedIdx = list.findIndex(p => p.id === draggedId);
    const targetIdx = list.findIndex(p => p.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0) return;
    
    const [removed] = list.splice(draggedIdx, 1);
    list.splice(targetIdx, 0, removed);
    
    const nextTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          roster: isRoster ? list : t.roster,
          substitutes: isRoster ? t.substitutes : list
        };
      }
      return t;
    });
    
    onUpdateGameState({
      ...gameState,
      teams: nextTeams
    });
  };

  const handleMoveToList = (draggedId: string, targetIsRoster: boolean) => {
    if (!onUpdateGameState || !gameState) return;
    
    const isCurrentlyRoster = userTeam.roster.some(p => p.id === draggedId);
    if (isCurrentlyRoster === targetIsRoster) return;
    
    if (isCurrentlyRoster && !targetIsRoster) {
      const player = userTeam.roster.find(p => p.id === draggedId);
      if (!player) return;
      
      const nextTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          return {
            ...t,
            roster: t.roster.filter(p => p.id !== draggedId),
            substitutes: [...t.substitutes, player]
          };
        }
        return t;
      });
      onUpdateGameState({ ...gameState, teams: nextTeams });
    } 
    else if (!isCurrentlyRoster && targetIsRoster) {
      const player = userTeam.substitutes.find(p => p.id === draggedId);
      if (!player) return;
      
      const isTravelVisaActive = !!userTeam.vistoEspecialTorneioAtivo;
      if (player.isImported && !player.visaApproved && !isTravelVisaActive) {
        alert(`🚫 [BLOQUEIO DE ESCALAÇÃO] O atleta importado ${player.name} não possui o visto P-1 aprovado e está proibido de disputar partidas oficiais pela liga.`);
        return;
      }
      
      const nextTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          let nextRoster = [...t.roster];
          let nextSubstitutes = t.substitutes.filter(p => p.id !== draggedId);
          
          const existingStarterIdx = nextRoster.findIndex(p => p.position === player.position);
          if (existingStarterIdx >= 0) {
            const kicked = nextRoster.splice(existingStarterIdx, 1)[0];
            nextSubstitutes.push(kicked);
          }
          nextRoster.push(player);
          
          return {
            ...t,
            roster: nextRoster,
            substitutes: nextSubstitutes
          };
        }
        return t;
      });
      onUpdateGameState({ ...gameState, teams: nextTeams });
    }
  };

  // Find all players in the league, so we can support viewing any player's individual profile!
  const allPlayers = gameState.teams.flatMap(t => [...t.roster, ...t.substitutes, ...(t.academy || [])]);
  
  // Resolve Free Agent player if selected ID starts with 'FA_'
  const isSelectedPlayerFreeAgent = selectedPlayerId?.startsWith('FA_') || selectedPlayerId?.startsWith('mkt-fa-');
  const freeAgentPlayer = isSelectedPlayerFreeAgent ? GLOBAL_FREE_AGENTS.find(p => p.id === selectedPlayerId || p.id === `FA_${selectedPlayerId.replace('mkt-fa-', '')}`) : null;

  const activePlayer = isAcademyRoster
    ? ((userTeam.academy || []).find(p => p.id === selectedPlayerId) || userTeam.academy?.[0])
    : (isDetailedProfileOpen
      ? (freeAgentPlayer || allPlayers.find(p => p.id === selectedPlayerId) || userTeam.roster[0])
      : (userTeam.roster.find(p => p.id === selectedPlayerId) || userTeam.substitutes.find(p => p.id === selectedPlayerId) || userTeam.roster[0]));

  const isFreeAgent = activePlayer?.id?.startsWith('FA_') || activePlayer?.id?.startsWith('mkt-fa-');

  // Find the actual team of the active player dynamically!
  const playerTeam = isFreeAgent
    ? null
    : (gameState.teams.find(t => 
        t.roster.some(p => p.id === activePlayer?.id) || 
        t.substitutes.some(p => p.id === activePlayer?.id) ||
        (t.academy || []).some(p => p.id === activePlayer?.id)
      ) || userTeam);

  const isOwnedByPlayerTeam = isAcademyRoster
    ? (userTeam.academy || []).some(p => p.id === activePlayer?.id)
    : (userTeam.roster.some(p => p.id === activePlayer?.id) || userTeam.substitutes.some(p => p.id === activePlayer?.id));

  const handleSelectFocus = (pId: string, focus: string) => {
    setTrainingFoci(prev => ({ ...prev, [pId]: focus }));
    onSelectPlayerTraining(pId, focus);

    if (onUpdateGameState) {
      const nextTeams = gameState.teams.map(t => {
        const rosterIdx = t.roster.findIndex(p => p.id === pId);
        const subIdx = t.substitutes.findIndex(p => p.id === pId);

        if (rosterIdx >= 0 || subIdx >= 0) {
          const targetArray = rosterIdx >= 0 ? [...t.roster] : [...t.substitutes];
          const idx = rosterIdx >= 0 ? rosterIdx : subIdx;
          const originalPlayer = targetArray[idx];

          const attributes = { ...originalPlayer.attributes };
          let motivation = originalPlayer.motivation || 75;

          // Apply direct feedback training bonuses 
          if (focus === 'FASE DE ROTAS') {
            attributes.mechanics = Math.min(100, attributes.mechanics + 2);
          } else if (focus === 'LUTA EM EQUIPE') {
            attributes.communication = Math.min(100, attributes.communication + 2);
            attributes.emotionalControl = Math.min(100, attributes.emotionalControl + 2);
          } else if (focus === 'VISÃO DE JOGO / MAPA') {
            attributes.mapVision = Math.min(100, attributes.mapVision + 2);
          } else if (focus === 'CONTROLE DE OBJETIVOS') {
            attributes.macro = Math.min(100, attributes.macro + 2);
            attributes.consistency = Math.min(100, attributes.consistency + 2);
          } else if (focus === 'RESTAURAÇÃO MENTAL') {
            motivation = Math.min(100, motivation + 25);
          } else if (focus.startsWith('PERSONALIZADO')) {
            attributes.mechanics = Math.min(100, attributes.mechanics + 1);
            attributes.macro = Math.min(100, attributes.macro + 1);
          }

          const overallRating = Math.min(originalPlayer.potential, Math.round(
            (attributes.mechanics + attributes.macro + attributes.communication + attributes.consistency + attributes.emotionalControl + attributes.mapVision) / 6
          ));

          targetArray[idx] = {
            ...originalPlayer,
            attributes,
            motivation,
            overallRating
          };

          return {
            ...t,
            roster: rosterIdx >= 0 ? targetArray : t.roster,
            substitutes: subIdx >= 0 ? targetArray : t.substitutes
          };
        }
        return t;
      });

      onUpdateGameState({
        ...gameState,
        teams: nextTeams
      });
    }
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

  const renderRenewModal = () => {
    if (!renewingPlayer) return null;
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
        <div className="bg-[#0a1424] border border-[#1e2d44] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in text-white font-sans my-8">
          
          {/* Header */}
          <div className="bg-[#070d19] border-b border-[#1e2d44] p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#006e80]/30 shrink-0 bg-transparent flex items-center justify-center">
                <img 
                  src={getGameAssetUrl('players', renewingPlayer.id, renewingPlayer.photoUrl)} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-transparent" 
                  alt={renewingPlayer.name}
                  onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
                />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-display text-sky-450">
                  NEGOCIAÇÃO DE RENOVAÇÃO
                </h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                  Proposta de Novo Vínculo de {renewingPlayer.name} (OVR {renewingPlayer.overallRating})
                </p>
              </div>
            </div>
            <button 
              onClick={() => setRenewingPlayer(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            
            {/* Box Info - Clima/Humor calculado de forma retroativa dinâmica */}
            {(() => {
              const prob = calculateRenewProbability();
              const getSimulatedHumor = (pScore: number) => {
                if (pScore >= 80) return { text: "Extasiado / Satisfeito", emoji: "🥰", color: "text-emerald-400" };
                if (pScore >= 55) return { text: "Satisfeito / Interessado", emoji: "😊", color: "text-indigo-400" };
                if (pScore >= 35) return { text: "Hesitante / Cético", emoji: "🤔", color: "text-amber-400" };
                return { text: "Insatisfeito / Ofendido", emoji: "🤬", color: "text-rose-500 font-black" };
              };
              const simulated = getSimulatedHumor(prob);

              return (
                <div className="bg-[#070d19]/80 border border-[#1e2d44]/50 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{simulated.emoji}</span>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px]">Clima / Humor Estimado</span>
                      <span className={`font-extrabold ${simulated.color}`}>
                        {simulated.text} ({prob}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-mono text-[9px]">Exigência Semanal</span>
                    <span className="font-bold text-emerald-400">~{formatMoney(Math.round(renewingPlayer.overallRating * 1150 / 4))}/sem</span>
                  </div>
                </div>
              );
            })()}

            {/* Parâmetros de Ajuste de Proposta */}
            <div className="space-y-4 pt-1">
              
              {/* 1. Duração do Vínculo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">
                    Duração do Vínculo (Meses)
                  </label>
                  <span className="text-xs text-sky-450 font-black font-mono">
                    {renewMonths} meses {(renewMonths === 24) ? '(Recomendado)' : ''}
                  </span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="48"
                  step="1"
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>1 MÊS</span>
                  <span>12 MESES (1 Ano)</span>
                  <span>24 MESES (2 Anos)</span>
                  <span>48 MESES (4 Anos)</span>
                </div>
              </div>

              {/* 2. Salário Semanal */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">
                    Salário Semanal Oferecido
                  </label>
                  <span className="text-xs text-emerald-400 font-black font-mono">
                    {formatMoney(renewSalary)} {(renewSalary >= renewingPlayer.salary / 4) ? '📈' : '📉'}
                  </span>
                </div>
                <input 
                  type="range"
                  min={Math.round((renewingPlayer.salary / 4) * 0.7)}
                  max={Math.round((renewingPlayer.salary / 4) * 3)}
                  step="50"
                  value={renewSalary}
                  onChange={(e) => setRenewSalary(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>Mín (${Math.round((renewingPlayer.salary / 4) * 0.7).toLocaleString()})</span>
                  <span>Atual (${Math.round(renewingPlayer.salary / 4).toLocaleString()})</span>
                  <span>Máx (${Math.round((renewingPlayer.salary / 4) * 3).toLocaleString()})</span>
                </div>
              </div>

              {/* 3. Direitos de Imagem */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">
                    Repasse de Direitos de Imagem (%)
                  </label>
                  <span className="text-xs text-purple-400 font-black font-mono">
                    {imageRightsPercent}% para Atleta
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={imageRightsPercent}
                  onChange={(e) => setImageRightsPercent(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>0% (100% do Clube)</span>
                  <span>50% (Sócio)</span>
                  <span>100% (Todo do Atleta)</span>
                </div>
              </div>

              {/* 4. Bônus Financeiros */}
              <div className="space-y-3 pt-2.5 border-t border-slate-800">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  🎁 CLÁUSULAS ADICIONAIS & PREMIAÇÕES POR TÍTULO
                </span>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Worlds Bonus */}
                  <div className="flex items-center justify-between bg-[#070d19] p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={hasWorldsBonus}
                        onChange={(e) => setHasWorldsBonus(e.target.checked)}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-300">Bônus por Título do Worlds</span>
                    </div>
                    <input 
                      type="number"
                      disabled={!hasWorldsBonus}
                      value={worldsBonusValue}
                      onChange={(e) => setWorldsBonusValue(parseInt(e.target.value) || 0)}
                      className={`w-28 text-right py-1 px-2 text-[11px] font-mono font-black rounded bg-slate-950 border ${hasWorldsBonus ? 'border-sky-500/30 text-emerald-400' : 'border-slate-850 text-slate-600'}`}
                    />
                  </div>

                  {/* MSI Bonus */}
                  <div className="flex items-center justify-between bg-[#070d19] p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={hasMsiBonus}
                        onChange={(e) => setHasMsiBonus(e.target.checked)}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-300">Bônus por Campeão do MSI</span>
                    </div>
                    <input 
                      type="number"
                      disabled={!hasMsiBonus}
                      value={msiBonusValue}
                      onChange={(e) => setMsiBonusValue(parseInt(e.target.value) || 0)}
                      className={`w-28 text-right py-1 px-2 text-[11px] font-mono font-black rounded bg-slate-950 border ${hasMsiBonus ? 'border-sky-500/30 text-emerald-400' : 'border-slate-850 text-slate-600'}`}
                    />
                  </div>

                  {/* League Titles bonus */}
                  <div className="flex items-center justify-between bg-[#070d19] p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={hasLeagueBonus}
                        onChange={(e) => setHasLeagueBonus(e.target.checked)}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-300">Premiação pelo Título da Liga</span>
                    </div>
                    <input 
                      type="number"
                      disabled={!hasLeagueBonus}
                      value={leagueBonusValue}
                      onChange={(e) => setLeagueBonusValue(parseInt(e.target.value) || 0)}
                      className={`w-28 text-right py-1 px-2 text-[11px] font-mono font-black rounded bg-slate-950 border ${hasLeagueBonus ? 'border-sky-500/30 text-emerald-400' : 'border-slate-850 text-slate-600'}`}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Barra de Probabilidade de Aceitação Dinâmica */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-baseline select-none">
                <span className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">
                  Probabilidade de Aceite do Atleta:
                </span>
                <span className={`text-xs font-extrabold font-mono ${
                  calculateRenewProbability() >= 75 ? 'text-emerald-400' :
                  calculateRenewProbability() >= 45 ? 'text-amber-400' : 'text-rose-500'
                }`}>
                  {calculateRenewProbability()}% ({
                    calculateRenewProbability() >= 75 ? 'Excelente Proposta!' :
                    calculateRenewProbability() >= 45 ? 'Negociação Desafiadora!' : 'Recusa Imediata!'
                  })
                </span>
              </div>
              
              {/* A Barra Horizontal em Tempo Real */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    calculateRenewProbability() >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    calculateRenewProbability() >= 45 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 
                    'bg-gradient-to-r from-red-600 to-rose-400'
                  }`}
                  style={{ width: `${calculateRenewProbability()}%` }}
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-[#070d19] border-t border-[#1e2d44] p-4 flex gap-3">
            <button 
              onClick={() => setRenewingPlayer(null)}
              className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold py-3 uppercase tracking-wider rounded-lg border border-slate-800 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                const prob = calculateRenewProbability();
                const isSuccess = Math.random() * 100 <= prob;
                
                if (isSuccess) {
                  // Executar renovação de contrato
                  // Descontar luvas de assinatura de 2.5x o salário semanal 
                  const signingGloveFee = Math.round(renewSalary * 2.5);
                  if (userTeam.budget < signingGloveFee) {
                    alert(`🚫 Falha na Contratação: Saldo em Caixa insuficiente ($${userTeam.budget.toLocaleString()} de $${signingGloveFee.toLocaleString()} exigidos) para liquidar as luvas de contratação.`);
                    return;
                  }
                  
                  if (onUpdateGameState && gameState) {
                    const updatedTeams = gameState.teams.map((t) => {
                      if (t.id === gameState.playerTeamId) {
                        const rosterUpdated = t.roster.map(p => {
                          if (p.id === renewingPlayer.id) {
                            return {
                              ...p,
                              salary: renewSalary * 4, // Salario Base = Semanal * 4
                              contractMonths: renewMonths,
                              motivation: Math.min(100, p.motivation + 20) // melhora motivação
                            };
                          }
                          return p;
                        });
                        
                        const subsUpdated = t.substitutes.map(p => {
                          if (p.id === renewingPlayer.id) {
                            return {
                              ...p,
                              salary: renewSalary * 4,
                              contractMonths: renewMonths,
                              motivation: Math.min(100, p.motivation + 20)
                            };
                          }
                          return p;
                        });
                        
                        return {
                          ...t,
                          budget: t.budget - signingGloveFee,
                          roster: rosterUpdated,
                          substitutes: subsUpdated
                        };
                      }
                      return t;
                    });
                    
                    const nextState = {
                      ...gameState,
                      teams: updatedTeams
                    };
                    
                    onUpdateGameState(nextState);
                    alert(`🎉 ACORDO CONCLUÍDO COM SUCESSO!\n\n${renewingPlayer.name} assinou o contrato de ${renewMonths} meses de vigência com salário de $${renewSalary.toLocaleString()}/semana.\n\nBônus de Luvas de Assinatura ($${signingGloveFee.toLocaleString()}) debitado do caixa.`);
                  }
                  setRenewingPlayer(null);
                } else {
                  alert(`❌ PROPOSTA DE RENOVAÇÃO RECUSADA!\n\nO agente oficial do atleta ${renewingPlayer.name} considerou os bônus ou o vencimento semanal incompatíveis com as propostas dos rivais da liga. Melhore sua oferta e tente novamente.`);
                }
              }}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-400 hover:opacity-90 text-slate-950 font-black text-xs py-3 uppercase tracking-wider rounded-lg cursor-pointer transition-all"
            >
              ENVIAR PROPOSTA
            </button>
          </div>

        </div>
      </div>
    );
  };

  const renderRenameModal = () => {
    if (!renamingPlayer) return null;
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
        <div className="bg-[#0a1424] border border-[#1e2d44] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in text-white font-sans">
          {/* Header */}
          <div className="bg-[#070d19] border-b border-[#1e2d44] p-5 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider font-display text-sky-450">
              Renomear Jogador
            </h3>
            <button 
              onClick={() => setRenamingPlayer(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block mb-2">
                Novo Nickname para o Atleta:
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Insira o novo nick..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-white font-display font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRenamingPlayer(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[9px] tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleRenamePlayerConfirm()}
                className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[9px] tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailedProfile = () => {
    if (!activePlayer) return null;
    
    const behavioral = getBehavioralAttributes(activePlayer, playerTeam?.region);
    const visto = getVistoStatus(activePlayer, playerTeam?.region, playerTeam?.vistoEspecialTorneioAtivo, playerTeam?.vistoEspecialTorneioNome);
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
                <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-sky-500/20' : 'border-slate-100'} shadow-md shrink-0 bg-transparent flex items-center justify-center`}>
                  <img 
                    src={getGameAssetUrl('players', activePlayer.id, activePlayer.photoUrl)} 
                    referrerPolicy="no-referrer"
                    alt={activePlayer.name} 
                    className="w-full h-full object-contain bg-transparent" 
                    onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
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
                    <span>🛡️</span> {playerTeam ? playerTeam.name : 'AGENTE LIVRE'}
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
                  isFreeAgent
                    ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                    : (isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-blue-50 text-blue-600 border-blue-100')
                }`}>
                  {isFreeAgent ? 'AGENTE LIVRE' : 'Contrato'}
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
                  {isFreeAgent ? (
                    <>
                      <span className="text-sm font-sans font-extrabold text-emerald-500 block">
                        AGENTE LIVRE
                      </span>
                      <span className="text-[9px] text-slate-450 dark:text-slate-550 block font-sans">Sem contrato ativo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-sans font-extrabold text-slate-700 dark:text-white block">
                        {activePlayer.contractMonths} meses restantes
                      </span>
                      <span className="text-[9px] text-slate-450 dark:text-slate-550 block font-sans">Encerramento ativo</span>
                    </>
                  )}
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
                  {isAcademyRoster ? (
                    <>
                      <button
                        onClick={() => {
                          if (onPromoteProspect) {
                            onPromoteProspect(activePlayer);
                            setSelectedPlayerId('');
                            setIsDetailedProfileOpen(false);
                          }
                        }}
                        className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Promover para o Elenco Profissional (Reserva)
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente rescindir o contrato de ${activePlayer.name}? Esta ação é irreversível e removerá o jogador da Academia.`)) {
                            onReleasePlayer(activePlayer);
                            setIsDetailedProfileOpen(false);
                          }
                        }}
                        className="w-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:text-[#ff4a4a] text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Rescindir Contrato
                      </button>

                      <button
                        onClick={() => {
                          setNewPlayerName(activePlayer.name);
                          setRenamingPlayer(activePlayer);
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Renomear Jogador
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openRenewNegotiations(activePlayer)}
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
                        onClick={() => {
                          if (confirm(`Deseja realmente rescindir o contrato de ${activePlayer.name}? Esta ação é irreversível e cobrará multas de rescisão se aplicáveis.`)) {
                            onReleasePlayer(activePlayer);
                            setIsDetailedProfileOpen(false);
                          }
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-semibold"
                      >
                        Rescindir Contrato
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
                    </>
                  )}
                </div>
              ) : isFreeAgent ? (
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      if (onStartNegotiation) {
                        onStartNegotiation(activePlayer.id);
                      }
                    }}
                    className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10.5px] font-extrabold py-3 uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm text-center font-black"
                  >
                    🤝 INICIAR NEGOCIAÇÃO COM {activePlayer.name}
                  </button>
                  <p className="text-[10.5px] text-emerald-400 text-center font-mono mt-1 font-bold">
                    ⭐ ATLETA LIVRE • DISPONÍVEL IMEDIATAMENTE
                  </p>
                </div>
              ) : (
                renderExternalAthleteSystem()
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
              <span className="text-[9.5px] font-mono font-black text-slate-450 uppercase tracking-wide block mb-3">Assinatura / Champion Pool (Top 3)</span>
              <div className="flex gap-6 pt-1 select-none">
                {activePlayer.championPool && activePlayer.championPool.slice(0, 3).map((cId, i) => {
                  const classInfo = getChampionClassInfo(cId);
                  const imgUrl = getChampionAvatarUrl(cId);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 shrink-0">
                        <img 
                          src={imgUrl}
                          referrerPolicy="no-referrer"
                          alt={cId}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100';
                          }}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#006e80]/60 dark:border-sky-400/40 shadow-md transform hover:scale-110 duration-200"
                        />
                        {/* Mini ícone redondo de alinhamento tático interceptando a borda superior direita */}
                        <div 
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-white dark:border-slate-900 shadow-md ${classInfo.colorClass}`}
                          title={`${classInfo.label}`}
                        >
                          {classInfo.emoji}
                        </div>
                      </div>
                      <span className="text-[10px] font-sans font-extrabold text-[#006e80] dark:text-sky-300 mt-1.5 block text-center truncate w-20">
                        {cId}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest text-center mt-0.5">
                        {classInfo.label}
                      </span>
                    </div>
                  );
                })}
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
    return (
      <>
        {renderDetailedProfile()}
        {renewingPlayer && renderRenewModal()}
        {renamingPlayer && renderRenameModal()}
      </>
    );
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
            <div 
              className={s.bgTable}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId) {
                  handleMoveToList(draggedId, true);
                }
              }}
            >
              <div className={`grid grid-cols-12 gap-1 px-4 py-3 ${isDark ? 'bg-[#070d19] border-[#1e2d44]/80 text-white' : 'bg-slate-100 border-slate-200/85 text-slate-800'} border-b text-[9px] font-mono font-black uppercase tracking-wider select-none`}>
                <div className="col-span-1 text-center font-extrabold">POS</div>
                <div className="col-span-4 pl-2 font-extrabold">JOGADOR</div>
                <div className="col-span-1 text-center font-extrabold">OVR</div>
                <div className="col-span-1 text-center font-extrabold">POT</div>
                <div className="col-span-2 text-center font-extrabold">CONTRATO</div>
                <div className="col-span-1 text-center font-extrabold">STATUS</div>
                <div className="col-span-2 text-right font-extrabold">VALOR</div>
              </div>

              <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                {(() => {
                  const POSITION_ORDER: Record<string, number> = {
                    'TOP': 1,
                    'JNG': 2,
                    'MID': 3,
                    'ADC': 4,
                    'SUP': 5
                  };
                  const sortedRoster = [...rosterPlayers].sort((a, b) => {
                    return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
                  });
                  
                  return sortedRoster.map((player) => {
                    const isSelected = player.id === selectedPlayerId;
                    const hasPatchBuff = gameState.currentPatch.buffedChampions.some(cid => player.championPool.includes(cid));
                    const isDragging = draggedPlayerId === player.id;
                    const isDragOver = dragOverPlayerId === player.id;
                    
                    return (
                      <button
                        type="button"
                        key={player.id}
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', player.id);
                          setDraggedPlayerId(player.id);
                        }}
                        onDragEnd={() => {
                          setDraggedPlayerId(null);
                          setDragOverPlayerId(null);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setDragOverPlayerId(player.id)}
                        onDragLeave={() => setDragOverPlayerId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedId = e.dataTransfer.getData('text/plain');
                          if (draggedId && draggedId !== player.id) {
                            const isRoster_dragged = userTeam.roster.some(p => p.id === draggedId);
                            if (isRoster_dragged) {
                              handleReorder(draggedId, player.id, true);
                            } else {
                              handleMoveToList(draggedId, true);
                            }
                          }
                          setDragOverPlayerId(null);
                        }}
                        onClick={() => {
                          setSelectedPlayerId(player.id);
                          setIsDetailedProfileOpen(true);
                        }}
                        className={`grid grid-cols-12 gap-1 items-center p-3 cursor-grab active:cursor-grabbing transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#006e80]/30 ${
                          isSelected 
                            ? s.bgSelectedRow 
                            : s.hoverRow
                        } ${isDragging ? 'opacity-35 bg-sky-950/10' : ''} ${isDragOver ? 'border-2 border-dashed border-sky-450 dark:border-cyan-400 bg-cyan-500/10 scale-[1.01]' : ''}`}
                      >
                        {/* Pos label with bright blue outline */}
                        <div className="col-span-1 flex justify-center select-none">
                          <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-sky-450' : 'bg-white border border-slate-200 text-sky-600'} rounded tracking-wide`}>
                            {player.position}
                          </span>
                        </div>

                        {/* Photo + Identity */}
                        <div className="col-span-4 flex items-center gap-2.5 pl-2">
                          <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden border shrink-0 bg-transparent flex items-center justify-center`}>
                            <img 
                              src={getGameAssetUrl('players', player.id, player.photoUrl)} 
                              referrerPolicy="no-referrer"
                              alt="player" 
                              className="w-full h-full object-contain bg-transparent" 
                              onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
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
                  });
                })()}
              </div>
            </div>

            {/* Substitutos e Reservas */}
            {!isAcademyRoster && (
              <div className="space-y-3 pt-2">
                <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-slate-400">
                  Substitutos e Reservas
                </h4>
                
                <div 
                  className={s.bgTable}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId) {
                      handleMoveToList(draggedId, false);
                    }
                  }}
                >
                  <div className={`grid grid-cols-12 gap-1 px-4 py-3 ${isDark ? 'bg-[#070d19] border-[#1e2d44]/80 text-white' : 'bg-slate-100 border-slate-200/85 text-slate-800'} border-b text-[9px] font-mono font-black uppercase tracking-wider select-none`}>
                    <div className="col-span-1 text-center font-extrabold">POS</div>
                    <div className="col-span-4 pl-2 font-extrabold">JOGADOR</div>
                    <div className="col-span-1 text-center font-extrabold">OVR</div>
                    <div className="col-span-1 text-center font-extrabold">POT</div>
                    <div className="col-span-2 text-center font-bold">CONTRATO</div>
                    <div className="col-span-1 text-center font-bold">STATUS</div>
                    <div className="col-span-2 text-right font-extrabold">VALOR</div>
                  </div>

                  <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                    {substitutesPlayers.length > 0 ? (() => {
                      const POSITION_ORDER: Record<string, number> = {
                        'TOP': 1,
                        'JNG': 2,
                        'MID': 3,
                        'ADC': 4,
                        'SUP': 5
                      };
                      const sortedSubstitutes = [...substitutesPlayers].sort((a, b) => {
                        return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
                      });
                      
                      return sortedSubstitutes.map((player) => {
                        const isSelected = player.id === selectedPlayerId;
                        const hasPatchBuff = gameState.currentPatch.buffedChampions.some(cid => player.championPool.includes(cid));
                        const isDragging = draggedPlayerId === player.id;
                        const isDragOver = dragOverPlayerId === player.id;
                        
                        return (
                          <button
                            type="button"
                            key={player.id}
                            draggable="true"
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', player.id);
                              setDraggedPlayerId(player.id);
                            }}
                            onDragEnd={() => {
                              setDraggedPlayerId(null);
                              setDragOverPlayerId(null);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDragOverPlayerId(player.id)}
                            onDragLeave={() => setDragOverPlayerId(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              const draggedId = e.dataTransfer.getData('text/plain');
                              if (draggedId && draggedId !== player.id) {
                                const isRoster_dragged = rosterPlayers.some(p => p.id === draggedId);
                                if (!isRoster_dragged) {
                                  handleReorder(draggedId, player.id, false);
                                } else {
                                  handleMoveToList(draggedId, false);
                                }
                              }
                              setDragOverPlayerId(null);
                            }}
                            onClick={() => {
                              setSelectedPlayerId(player.id);
                              setIsDetailedProfileOpen(true);
                            }}
                            className={`grid grid-cols-12 gap-1 items-center p-3 cursor-grab active:cursor-grabbing transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#006e80]/30 ${
                              isSelected 
                                ? s.bgSelectedRow 
                                : s.hoverRow
                            } ${isDragging ? 'opacity-35 bg-sky-950/10' : ''} ${isDragOver ? 'border-2 border-dashed border-sky-450 dark:border-cyan-400 bg-cyan-500/10 scale-[1.01]' : ''}`}
                          >
                            {/* Pos label */}
                            <div className="col-span-1 flex justify-center select-none">
                              <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-sky-450' : 'bg-white border border-slate-200 text-sky-600'} rounded tracking-wide`}>
                                {player.position}
                              </span>
                            </div>

                            {/* Photo + Identity */}
                            <div className="col-span-4 flex items-center gap-2.5 pl-2">
                              <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden border shrink-0 bg-transparent flex items-center justify-center`}>
                                <img 
                                  src={getGameAssetUrl('players', player.id, player.photoUrl)} 
                                  referrerPolicy="no-referrer"
                                  alt="player" 
                                  className="w-full h-full object-contain bg-transparent" 
                                  onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
                                />
                              </div>
                              <div className="truncate">
                                <p className={`font-display text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} leading-none`}>{player.name}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{player.realName}</p>
                              </div>
                            </div>

                            {/* OVR */}
                            <div className="col-span-1 text-center">
                              <span className={`font-display text-xs font-black ${isDark ? 'text-sky-405' : 'text-[#626d80]'}`}>{player.overallRating}</span>
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
                      });
                    })() : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Nenhum jogador reserva cadastrado.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                      className={`w-full text-left flex justify-between items-start cursor-pointer ${isDark ? 'hover:bg-slate-900/40 hover:border-slate-800/25' : 'hover:bg-slate-100/40 hover:border-slate-200/25'} p-2.5 -m-2.5 rounded-xl border border-transparent transition-all group focus:outline-none`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={getGameAssetUrl('players', activePlayer.id, activePlayer.photoUrl)} 
                            referrerPolicy="no-referrer"
                            alt="active_player" 
                            className={`w-16 h-16 rounded-xl object-contain border-2 ${isDark ? 'border-slate-800 shadow-none' : 'border-slate-100 shadow-sm'} group-hover:scale-105 duration-200 bg-transparent`} 
                            onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
                          />
                          <span className={`absolute -bottom-2 -right-1 bg-[#006e80] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${isDark ? 'border-slate-850' : 'border-white'}`}>
                            {activePlayer.position}
                          </span>
                        </div>
                        <div>
                          <h4 className={`font-display text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-800'} leading-none group-hover:text-[#00cbd6] transition-colors flex items-center gap-1`}>
                            {activePlayer.name}
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-455" />
                          </h4>
                          <p className={`text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-700'} mt-0.5 font-extrabold uppercase tracking-wide`}>
                            {activePlayer.realName}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5 select-none">
                            <span className={`border ${isDark ? 'bg-slate-900 border-slate-800 text-[#00ffff]' : 'bg-slate-200 border-slate-300 text-slate-800'} text-[8px] font-mono font-black rounded uppercase px-1.5 py-0.5 flex items-center gap-1`}>
                              {activePlayer.age || 20} ANOS
                            </span>
                            <span className={`border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-555'} text-[8px] font-mono font-black rounded uppercase px-1.5 py-0.5`}>
                              {getIsForeign(activePlayer, userTeam.region) ? '🌎 IMPORTADO / ESTRANGEIRO' : '🛡️ ATLETA LOCAL / VISTO PERMANENTE'}
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
                  <div className="p-3 bg-slate-100 dark:bg-[#070d19] rounded-lg flex justify-between items-center border border-slate-250 dark:border-[#00ffff]/20 shadow-xs dark:shadow-[0_0_10px_rgba(0,110,128,0.2)]">
                    <span className="text-[9px] font-extrabold text-slate-700 dark:text-[#ffffff] uppercase tracking-widest font-mono">VALOR DE MERCADO</span>
                    <span className="text-xs font-mono font-black text-[#006e80] dark:text-[#00ffff]">{formatMoney(activePlayer.marketValue)}</span>
                  </div>

                  {/* PAINEL DE SCOUTING (OLHEIROS) */}
                  {isScoutingActive && (
                    <div className="p-3.5 bg-slate-50 dark:bg-[#070d19] rounded-lg border border-slate-250 dark:border-[#00ffff]/20 shadow-xs space-y-2.5">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9.5px] font-extrabold text-slate-700 dark:text-[#00ffff]/90 uppercase tracking-widest font-mono flex items-center gap-1">
                          <Search className="w-3 h-3 text-cyan-400 animate-pulse" /> OLHEIROS: SUBSTITUTOS
                        </span>
                        <button 
                          onClick={() => setIsScoutingActive(false)} 
                          className="text-[9.5px] text-red-500 hover:text-red-400 uppercase font-black font-mono tracking-wider cursor-pointer"
                        >
                          [ FECHAR ]
                        </button>
                      </div>
                      
                      {isScoutingLoading ? (
                        <div className="flex flex-col items-center py-4 space-y-2">
                          <RefreshCcw className="w-4.5 h-4.5 text-[#006e80] dark:text-sky-400 animate-spin" />
                          <span className="text-[9px] text-slate-400 font-mono font-black tracking-widest">MAPEANDO MERCADO...</span>
                        </div>
                      ) : scoutedPlayers.length === 0 ? (
                        <p className="text-[9.5px] text-slate-400 font-medium">Nenhum jogador similar disponível no mercado atualmente.</p>
                      ) : (
                        <div className="space-y-2.5">
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-sans leading-snug">
                            Nossos analistas listaram os seguintes atletas de {activePlayer.position} com perfil técnico compatível:
                          </p>
                          <div className="divide-y divide-slate-100 dark:divide-slate-805">
                            {scoutedPlayers.map((player) => (
                              <div key={player.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={getGameAssetUrl('players', player.id, player.photoUrl)} 
                                    referrerPolicy="no-referrer"
                                    alt={player.name}
                                    className="w-7 h-7 rounded-full object-contain border border-[#006e80]/30 bg-transparent"
                                    onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
                                  />
                                  <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">{player.name}</p>
                                    <p className="text-[8.5px] text-slate-405 dark:text-slate-500 font-mono font-bold mt-0.5">OVR: {player.overallRating} • POT: {player.potential}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (onStartNegotiation) {
                                      setIsDetailedProfileOpen(false);
                                      onStartNegotiation(player.id);
                                    } else {
                                      alert(`Para propor passe e contratar o atleta ${player.name}, acesse a guia Mercado de Transferências.`);
                                    }
                                  }}
                                  className="px-2 py-1 text-[8.5px] bg-[#006e80] hover:bg-[#005a6a] text-white font-mono font-black uppercase rounded cursor-pointer transition-colors"
                                >
                                  NEGOCIAR
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de Ação de Contrato */}
                  {isOwnedByPlayerTeam ? (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {isAcademyRoster ? (
                        <>
                          <button
                            onClick={() => {
                              if (onPromoteProspect) {
                                onPromoteProspect(activePlayer);
                                setSelectedPlayerId('');
                                setIsDetailedProfileOpen(false);
                              }
                            }}
                            className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold animate-fade-in"
                          >
                            Promover para o Elenco Profissional (Reserva)
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente rescindir o contrato de ${activePlayer.name}? Esta ação é irreversível e removerá o atleta da Academia.`)) {
                                onReleasePlayer(activePlayer);
                              }
                            }}
                            className="w-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:text-[#ff4a4a] text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                          >
                            Rescindir Contrato
                          </button>

                          <button
                            onClick={() => {
                              setNewPlayerName(activePlayer.name);
                              setRenamingPlayer(activePlayer);
                            }}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                          >
                            Renomear Jogador
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openRenewNegotiations(activePlayer)}
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
                            onClick={() => {
                              if (confirm(`Deseja realmente rescindir o contrato de ${activePlayer.name}? Esta ação é irreversível e cobrará multas de rescisão se aplicáveis.`)) {
                                onReleasePlayer(activePlayer);
                                setIsDetailedProfileOpen(false);
                              }
                            }}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-semibold"
                          >
                            Rescindir Contrato
                          </button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setNewPlayerName(activePlayer.name);
                                setRenamingPlayer(activePlayer);
                              }}
                              className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-650'} text-[9px] font-bold py-2.5 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold`}
                            >
                              <Edit2 className="w-3.5 h-3.5" /> RENOMEAR JOGADOR
                            </button>
                            <button
                              onClick={() => onTransferListPlayer(activePlayer)}
                              className={`${isDark ? 'bg-[#ffebeb]/5 border-pink-100/10 hover:bg-pink-100/10' : 'bg-[#ffebeb] border-pink-100 hover:bg-pink-100/50'} text-pink-500 text-[9px] font-bold py-2.5 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> COLOCAR À VENDA
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : isFreeAgent ? (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          if (onStartNegotiation) {
                            onStartNegotiation(activePlayer.id);
                          }
                        }}
                        className="w-full bg-[#006e80] hover:bg-[#005c6c] text-white text-[10px] font-extrabold py-3 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center font-black"
                      >
                        🤝 INICIAR NEGOCIAÇÃO
                      </button>
                      <span className="text-[9px] text-emerald-500 font-mono font-bold block">
                        ⭐ ATLETA LIVRE
                      </span>
                    </div>
                  ) : (
                    renderExternalAthleteSystem()
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
                PAINEL DE TREINAMENTO - {activePlayer.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">
                {activePlayer.position === 'TOP' ? 'TOP LANER' : activePlayer.position === 'JNG' ? 'CAÇADOR' : activePlayer.position === 'MID' ? 'MID LANER' : activePlayer.position === 'ADC' ? 'ATIRADOR' : 'SUPORTE'} TITULAR • PERCENTIL 98% EM MECÂNICA E PROFUNDIDADE ESTRATÉGICA
              </p>
            </div>
            
            <div className="flex gap-2 font-sans">
              <button 
                onClick={() => {
                  const attrsStr = "1. Mecânica\n2. Macro-Estratégia\n3. Comunicação\n4. Visão de Jogo";
                  const choice = prompt(`Reunir Comissão Técnica: Escolha o atributo para bônus temporário de +2% de foco esta semana:\n\n${attrsStr}`, "1");
                  if (choice) {
                    const attrNames = ["Mecânica", "Macro-Estratégia", "Comunicação", "Visão de Jogo"];
                    const chosenIdx = parseInt(choice) - 1;
                    const chosenAttr = attrNames[chosenIdx] || "Mecânica";
                    setComissaoActive(true);
                    
                    if (onUpdateGameState && activePlayer) {
                      const nextTeams = gameState.teams.map(t => {
                        const rIdx = t.roster.findIndex(p => p.id === activePlayer.id);
                        const sIdx = t.substitutes.findIndex(p => p.id === activePlayer.id);
                        if (rIdx >= 0 || sIdx >= 0) {
                          const targetArray = rIdx >= 0 ? [...t.roster] : [...t.substitutes];
                          const idx = rIdx >= 0 ? rIdx : sIdx;
                          const originalPlayer = targetArray[idx];
                          const attributes = { ...originalPlayer.attributes };
                          
                          if (chosenAttr === "Mecânica") attributes.mechanics = Math.min(100, attributes.mechanics + 2);
                          else if (chosenAttr === "Macro-Estratégia") attributes.macro = Math.min(100, attributes.macro + 2);
                          else if (chosenAttr === "Comunicação") attributes.communication = Math.min(100, attributes.communication + 2);
                          else if (chosenAttr === "Visão de Jogo") attributes.mapVision = Math.min(100, attributes.mapVision + 2);
                          
                          const overallRating = Math.min(originalPlayer.potential, Math.round(
                            (attributes.mechanics + attributes.macro + attributes.communication + attributes.consistency + attributes.emotionalControl + attributes.mapVision) / 6
                          ));
                          
                          targetArray[idx] = {
                            ...originalPlayer,
                            attributes,
                            overallRating
                          };
                          
                          return {
                            ...t,
                            roster: rIdx >= 0 ? targetArray : t.roster,
                            substitutes: sIdx >= 0 ? targetArray : t.substitutes
                          };
                        }
                        return t;
                      });
                      
                      onUpdateGameState({
                        ...gameState,
                        teams: nextTeams
                      });
                    }
                    alert(`✅ Comissão Técnica reunida com sucesso! Elenco recebeu bônus adaptativo de +2% no atributo: ${chosenAttr.toUpperCase()}.`);
                  }
                }}
                className={`${isDark ? 'bg-[#0a1424] border-[#1e2d44] hover:bg-slate-900 text-[#00ffff] shadow-[0_0_8px_rgba(0,110,128,0.1)]' : 'bg-[#e0f2fe] border border-sky-300 hover:bg-sky-100 text-sky-800'} font-sans text-[10px] font-extrabold px-3.5 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-sm`}
              >
                REUNIR COMISSÃO TÉCNICA
              </button>
              <button 
                onClick={() => {
                  setIntensivaoActive(true);
                  if (onUpdateGameState && activePlayer) {
                    const nextTeams = gameState.teams.map(t => {
                      const rIdx = t.roster.findIndex(p => p.id === activePlayer.id);
                      const sIdx = t.substitutes.findIndex(p => p.id === activePlayer.id);
                      if (rIdx >= 0 || sIdx >= 0) {
                        const targetArray = rIdx >= 0 ? [...t.roster] : [...t.substitutes];
                        const idx = rIdx >= 0 ? rIdx : sIdx;
                        const originalPlayer = targetArray[idx];
                        
                        const attributes = { ...originalPlayer.attributes };
                        attributes.mechanics = Math.min(100, attributes.mechanics + 2);
                        attributes.macro = Math.min(100, attributes.macro + 2);
                        attributes.communication = Math.min(100, attributes.communication + 2);
                        attributes.consistency = Math.min(100, attributes.consistency + 2);
                        attributes.emotionalControl = Math.min(100, attributes.emotionalControl + 2);
                        attributes.mapVision = Math.min(100, attributes.mapVision + 2);
                        
                        const overallRating = Math.min(originalPlayer.potential, Math.round(
                          (attributes.mechanics + attributes.macro + attributes.communication + attributes.consistency + attributes.emotionalControl + attributes.mapVision) / 6
                        ));
                        
                        targetArray[idx] = {
                          ...originalPlayer,
                          attributes,
                          overallRating,
                          motivation: Math.max(10, (originalPlayer.motivation || 75) - 15)
                        };
                        
                        return {
                          ...t,
                          roster: rIdx >= 0 ? targetArray : t.roster,
                          substitutes: sIdx >= 0 ? targetArray : t.substitutes
                        };
                      }
                      return t;
                    });
                    
                    onUpdateGameState({
                      ...gameState,
                      teams: nextTeams
                    });
                  }
                  alert("⚡ Intensivão agendado! A velocidade de evolução geral (OVR) aumentou e a fádiga física do elenco reduziu a motivação devido ao desgaste.");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px] font-extrabold px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-sm"
              >
                AGENDAR INTENSIVÃO
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Core Metrics Radar & Grid Focus (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Core Performance metrics radar */}
              <div className={`${s.bgCard} p-5.5 shadow-none`}>
                <div className={`flex justify-between items-center mb-4.5 border-b ${s.borderLine} pb-2`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">MÉTRICAS PRINCIPAIS DE DESEMPENHO</span>
                  <span className={`text-[8px] font-bold ${isDark ? 'text-sky-400 bg-sky-500/10' : 'text-sky-500 bg-sky-50'} px-1.5 py-0.5 rounded tracking-wide`}>DADOS EM TEMPO REAL</span>
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
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Mecânica</span>
                      <span className="absolute top-[35%] -right-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Estratégia</span>
                      <span className="absolute bottom-[35%] -right-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Comunicação</span>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Mental</span>
                    </div>
                  </div>

                  {/* Rating Progress sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>MECÂNICA</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.mechanics}%</span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.mechanics}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>PROFUNDIDADE ESTRATÉGICA</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.macro}%</span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.macro}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>COMUNICAÇÃO</span>
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
                  ÁREAS DE FOCO DO TREINAMENTO
                </span>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { name: 'FASE DE ROTAS', desc: 'CS, trocas na rota e controle de wave.', icon: Target },
                    { name: 'LUTA EM EQUIPE', desc: 'Entrosamento coletivo e prioridade de alvos.', icon: Award },
                    { name: 'VISÃO DE JOGO / MAPA', desc: 'Prevenção de ganks e colocação de sentinelas.', icon: SwitchCamera },
                    { name: 'CONTROLE DE OBJETIVOS', desc: 'Decisões táticas de Dragões e Barão.', icon: Activity },
                    { name: 'RESTAURAÇÃO MENTAL', desc: 'Congela atributos e recupera +25% de saúde mental.', icon: Heart },
                    { name: 'PERSONALIZADO (+)', desc: 'Treino em campeão específico do meta.', icon: Sparkles }
                  ].map((focusItem) => {
                    const focusName = focusItem.name;
                    const FocusIcon = focusItem.icon;
                    const isCurrent = (focusName === 'PERSONALIZADO (+)')
                      ? (trainingFoci[activePlayer.id]?.startsWith('PERSONALIZADO') || false)
                      : (trainingFoci[activePlayer.id] === focusName || (focusName === 'FASE DE ROTAS' && !trainingFoci[activePlayer.id]));
                    
                    return (
                      <button
                        key={focusName}
                        onClick={() => {
                          if (focusName === 'PERSONALIZADO (+)') {
                            const champ = prompt("Foco no Metagame: Digite o campeão para focar o treino individual:", "K'Sante");
                            if (champ) {
                              const cleanChamp = champ.trim().toUpperCase();
                              handleSelectFocus(activePlayer.id, `PERSONALIZADO (${cleanChamp})`);
                              alert(`🎯 Foco de metagame personalizado definido para: ${cleanChamp}`);
                            }
                          } else {
                            handleSelectFocus(activePlayer.id, focusName);
                          }
                        }}
                        className={`p-3 h-24 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isCurrent 
                            ? (isDark ? 'border-sky-400 bg-sky-500/10 text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]' : 'border-blue-500 bg-blue-50/30 text-blue-600 shadow-[0_1px_4px_rgba(59,130,246,0.06)]') 
                            : (isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200')
                        }`}
                        title={focusItem.desc}
                      >
                        <div className="flex justify-between items-center w-full">
                          <FocusIcon className={`w-4 h-4 ${isCurrent ? 'text-sky-400 text-blue-500' : 'text-slate-400'}`} />
                          {focusName === 'PERSONALIZADO (+)' && trainingFoci[activePlayer.id]?.startsWith('PERSONALIZADO') && (
                            <span className="text-[7px] text-[#00ffff] bg-[#00ffff]/10 px-1 py-0.5 rounded font-black font-mono uppercase tracking-tight">
                              {trainingFoci[activePlayer.id].substring(14, trainingFoci[activePlayer.id].length - 1)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-display text-[10.5px] font-extrabold uppercase tracking-wide block leading-none">
                            {focusName}
                          </span>
                          <span className="text-[7.5px] text-slate-500 dark:text-slate-400 line-clamp-1 block leading-tight font-medium">
                            {focusItem.desc}
                          </span>
                        </div>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">CRONOGRAMA DE TREINO SEMANAL</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                    <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`} />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 gap-1.5 text-[8.5px] font-mono tracking-wider font-bold text-slate-400 uppercase select-none">
                    <div className="col-span-2">DIA</div>
                    <div className="col-span-6">ATIVIDADE</div>
                    <div className="col-span-4 text-right">SITUAÇÃO</div>
                  </div>

                  <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'} font-mono text-[10px] space-y-2.5 pt-1`}>
                    {(() => {
                      const getExtendedMonthInfo = (weekNum: number) => {
                        if (weekNum <= 4)   return { name: "Janeiro", weeks: [1, 2, 3, 4], totalDays: 31, prevTotalDays: 31, startDayOfWeek: 3, index: 0 };
                        if (weekNum <= 8)   return { name: "Fevereiro", weeks: [5, 6, 7, 8], totalDays: 28, prevTotalDays: 31, startDayOfWeek: 6, index: 1 };
                        if (weekNum <= 12)  return { name: "Março", weeks: [9, 10, 11, 12], totalDays: 31, prevTotalDays: 28, startDayOfWeek: 6, index: 2 };
                        if (weekNum <= 16)  return { name: "Abril", weeks: [13, 14, 15, 16], totalDays: 30, prevTotalDays: 31, startDayOfWeek: 2, index: 3 };
                        if (weekNum <= 20)  return { name: "Maio", weeks: [17, 18, 19, 20], totalDays: 31, prevTotalDays: 30, startDayOfWeek: 4, index: 4 };
                        if (weekNum <= 24)  return { name: "Junho", weeks: [21, 22, 23, 24], totalDays: 30, prevTotalDays: 31, startDayOfWeek: 0, index: 5 };
                        if (weekNum <= 28)  return { name: "Julho", weeks: [25, 26, 27, 28], totalDays: 31, prevTotalDays: 30, startDayOfWeek: 2, index: 6 };
                        return { name: "Agosto", weeks: [29, 30, 31, 32], totalDays: 31, prevTotalDays: 31, startDayOfWeek: 5, index: 7 };
                      };
                      const mInfo = getExtendedMonthInfo(gameState.week);
                      const currentDayNum = gameState.currentDay || (10 + (gameState.week * 2) % 19);
                      const currentWeekdayIdx = (mInfo.startDayOfWeek + (currentDayNum - 1)) % 7;

                      const weekdays = [
                        { idx: 0, label: 'SEG', name: 'Segunda-feira', defaultActivity: 'Análise de VOD', time: '09:00' },
                        { idx: 1, label: 'TER', name: 'Terça-feira', defaultActivity: 'Treino de 1v1 / Mecânica', time: '10:00' },
                        { idx: 2, label: 'QUA', name: 'Quarta-feira', defaultActivity: 'Treino de Scrim (Simulação)', time: '14:00' },
                        { idx: 3, label: 'QUI', name: 'Quinta-feira', defaultActivity: 'Simulação de Drafts Coletivos', time: '09:00' },
                        { idx: 4, label: 'SEX', name: 'Sexta-feira', defaultActivity: 'Acompanhamento Psicológico / Mental', time: '11:00' },
                        { idx: 5, label: 'SÁB', name: 'Sábado', defaultActivity: 'Treino Tático Pré-Jogo', time: '13:00' },
                        { idx: 6, label: 'DOM', name: 'Domingo', defaultActivity: 'Rodada Oficial do Campeonato', time: '13:00' }
                      ];

                      return weekdays.map(day => {
                        const isToday = day.idx === currentWeekdayIdx;
                        const isCompleted = day.idx < currentWeekdayIdx;

                        return (
                          <div 
                            key={day.label} 
                            className={`grid grid-cols-12 items-center pt-2 ${isToday ? 'bg-sky-505/10 bg-indigo-505/10 font-bold p-1 rounded border border-indigo-500/10' : ''}`}
                          >
                            <div className="col-span-2 flex items-center gap-1">
                              <span className={`font-black ${isToday ? 'text-indigo-400 font-extrabold' : 'text-slate-400 font-bold'}`}>
                                {day.label}
                              </span>
                              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                            </div>
                            <div className={`col-span-6 font-semibold ${isToday ? 'text-indigo-300 font-bold' : isDark ? 'text-slate-200' : 'text-slate-850'}`}>
                              {day.defaultActivity}
                            </div>
                            <div className="col-span-4 text-right">
                              {isToday ? (
                                <span className="text-[8.5px] font-mono font-black uppercase text-indigo-450 bg-indigo-400/10 px-2 py-0.5 rounded animate-pulse border border-indigo-400/20">
                                  HOJE • ATIVO
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[8.5px] font-mono font-black uppercase text-emerald-450 bg-emerald-450/5 px-2 py-0.5 rounded opacity-90">
                                  CONCLUÍDO
                                </span>
                              ) : (
                                <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                                  {day.time}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Academy growth card */}
              <div className={`${s.bgCard} p-5 shadow-none flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} overflow-hidden shrink-0 flex items-center justify-center border`}>
                  <Laptop className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CRESCIMENTO DA ACADEMIA</p>
                  <p className={`text-[10.5px] font-sans font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-tight mt-0.5`}>
                    Seu percurso tático do Rookie ao Pro Tier.
                  </p>
                  <div className="flex items-center gap-3.5 mt-2.5">
                    <div className={`flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
                      <div className="h-full bg-blue-500" style={{ width: '72%' }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 shrink-0">Nível 18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Recent Session Analytics (Screenshot 2 bottom row table) */}
          <div className={`${s.bgTable}`}>
            <div className={`px-5 py-4 border-b ${s.borderLine} ${isDark ? 'bg-[#070d19]' : 'bg-slate-50/50'} flex justify-between items-center`}>
              <span className={`text-[10.5px] uppercase font-extrabold text-slate-705 dark:text-[#ffffff] tracking-wider font-mono`}>ANÁLISE DE SESSÕES RECENTES</span>
              <div className="flex gap-2">
                <button className={`p-1 px-2.5 text-[9px] font-mono font-extrabold text-slate-400 border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-transparent'} rounded uppercase`}>Filtros</button>
                <button className={`p-1 px-2.5 text-[9px] font-mono font-extrabold text-slate-400 border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-transparent'} rounded uppercase`}>Compartilhar</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className={`border-b ${s.borderLine} font-mono text-[9px] font-extrabold text-slate-707 dark:text-[#ffffff] uppercase ${isDark ? 'bg-[#081223]/30' : 'bg-slate-50/30'} select-none`}>
                    <th className="p-4 pl-6">DATA</th>
                    <th className="p-4">ATIVIDADE</th>
                    <th className="p-4 text-center">DESEMPENHO</th>
                    <th className="p-4 text-center">CONSISTÊNCIA</th>
                    <th className="p-4 text-center">RESULTADO</th>
                    <th className="p-4 text-center">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-850' : 'divide-slate-100'}`}>
                  <tr className={`hover:${isDark ? 'bg-[#0d1b32]/40' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">24/10/2026</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Treino de Alta Intensidade <span className="text-slate-400 text-[10.5px] font-normal">vs. Team Liquid</span>
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
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>VITÓRIA</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className={`hover:${isDark ? 'bg-[#0d1b32]/40' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">23/10/2026</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Treino de Broca Mecânica #04 <span className="text-slate-400 text-[10.5px] font-normal">(Fila Solo)</span>
                    </td>
                    <td className="p-4 text-center font-display text-sky-600 font-black text-sm">A</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-202'} rounded-full`} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>ESTÁVEL</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className={`hover:${isDark ? 'bg-[#0d1b32]/40' : 'bg-slate-50/30'} transition-colors`}>
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">22/10/2026</td>
                    <td className={`p-4 font-semibold ${isDark ? 'text-slate-205' : 'text-slate-800'}`}>
                      Treino de Broca Mecânica <span className="text-slate-400 text-[10.5px] font-normal">(Oficina de Estratégia)</span>
                    </td>
                    <td className="p-4 text-center font-display text-slate-500 font-black text-sm">B-</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-202'} rounded-full`} />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-202'} rounded-full`} />
                        <span className={`w-1.5 h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-202'} rounded-full`} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 ${isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'} text-[9px] font-extrabold rounded-full uppercase tracking-wide`}>DERROTA</span>
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

      {/* POPUP MODAL INTERATIVO DE NEGOCIAÇÃO DE CONTRATO (ESTILO FOOTBALL MANAGER) */}
      {renewingPlayer && renderRenewModal()}
      {renamingPlayer && renderRenameModal()}
      {isProposalModalOpen && renderProposalModal()}
    </div>
  );
}

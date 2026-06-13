/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Target, Award, Plus, Sparkles, Building2, UserCheck, DollarSign, 
  RefreshCw, Code, Trash2, Database, AlertCircle, Info, ArrowUpRight, 
  Flame, Smile, HelpCircle, CheckCircle, ArrowUp, ArrowRightLeft,
  ChevronRight, Star, Activity, Search
} from 'lucide-react';
import { GameState, Player, Position, Team } from '../types';
import { formatMoney, getCurrencySymbol, getCaixaFormatadoHud } from '../utils/currency';
import { getGameAssetUrl } from '../utils/gameAssets';

interface AcademyTabProps {
  gameState: GameState;
  onPromoteProspect: (player: Player) => void;
  onUpdateGameState?: (state: GameState) => void;
  theme?: 'light' | 'dark';
}

const DEFAULT_YOUTH_PLAYERS: Omit<Player, 'id'>[] = [
  {
    name: 'Frosty_O',
    realName: 'Otávio Silveira',
    nationality: 'Brasil',
    age: 16,
    position: 'TOP',
    attributes: { mechanics: 61, macro: 59, communication: 58, leadership: 42, consistency: 60, emotionalControl: 65, farm: 64, mapVision: 55, playoffPerformance: 50 },
    overallRating: 60,
    potential: 89,
    personality: 'Focado',
    popularity: 35,
    marketValue: 85000,
    salary: 800,
    contractMonths: 24,
    motivation: 98,
    stamina: 100,
    chemistry: 75,
    championPool: ['k_sante', 'aatrox', 'jax'],
    isPlayerControlled: false
  },
  {
    name: 'HypeKid',
    realName: 'Bernardo Castro',
    nationality: 'Brasil',
    age: 15,
    position: 'JNG',
    attributes: { mechanics: 66, macro: 55, communication: 64, leadership: 50, consistency: 58, emotionalControl: 54, farm: 60, mapVision: 62, playoffPerformance: 55 },
    overallRating: 61,
    potential: 94,
    personality: 'Inconstante',
    popularity: 42,
    marketValue: 120000,
    salary: 950,
    contractMonths: 18,
    motivation: 95,
    stamina: 100,
    chemistry: 80,
    championPool: ['viego', 'lee_sin', 'nidalee'],
    isPlayerControlled: false
  },
  {
    name: 'Melt_M',
    realName: 'Luiz Fernando',
    nationality: 'Brasil',
    age: 17,
    position: 'MID',
    attributes: { mechanics: 63, macro: 62, communication: 60, leadership: 48, consistency: 62, emotionalControl: 68, farm: 68, mapVision: 59, playoffPerformance: 60 },
    overallRating: 62,
    potential: 88,
    personality: 'Resiliente',
    popularity: 38,
    marketValue: 95000,
    salary: 900,
    contractMonths: 24,
    motivation: 92,
    stamina: 100,
    chemistry: 72,
    championPool: ['syndra', 'ahri', 'azir'],
    isPlayerControlled: false
  },
  {
    name: 'Slay_B',
    realName: 'Enzo Alencar',
    nationality: 'Brasil',
    age: 16,
    position: 'ADC',
    attributes: { mechanics: 68, macro: 57, communication: 59, leadership: 35, consistency: 55, emotionalControl: 60, farm: 71, mapVision: 52, playoffPerformance: 55 },
    overallRating: 61,
    potential: 92,
    personality: 'Estrela',
    popularity: 47,
    marketValue: 115000,
    salary: 1000,
    contractMonths: 24,
    motivation: 90,
    stamina: 100,
    chemistry: 68,
    championPool: ['jinx', 'aphelios', 'kai_sa'],
    isPlayerControlled: false
  },
  {
    name: 'Warder_X',
    realName: 'Thiago Mendes',
    nationality: 'Brasil',
    age: 17,
    position: 'SUP',
    attributes: { mechanics: 58, macro: 65, communication: 63, leadership: 55, consistency: 61, emotionalControl: 70, farm: 40, mapVision: 66, playoffPerformance: 62 },
    overallRating: 61,
    potential: 89,
    personality: 'Comunicador',
    popularity: 31,
    marketValue: 75000,
    salary: 750,
    contractMonths: 24,
    motivation: 96,
    stamina: 100,
    chemistry: 85,
    championPool: ['thresh', 'leona', 'nautilus'],
    isPlayerControlled: false
  },
  {
    name: 'NextCore',
    realName: 'Shin Jae-min',
    nationality: 'Coreia do Sul',
    age: 18,
    position: 'MID',
    attributes: { mechanics: 67, macro: 60, communication: 50, leadership: 38, consistency: 63, emotionalControl: 58, farm: 70, mapVision: 55, playoffPerformance: 52 },
    overallRating: 61,
    potential: 91,
    personality: 'Focado',
    popularity: 51,
    marketValue: 105000,
    salary: 1100,
    contractMonths: 12,
    motivation: 88,
    stamina: 100,
    chemistry: 55,
    championPool: ['leblanc', 'orianna', 'taliyah'],
    isPlayerControlled: false
  },
  {
    name: 'RebelBoy',
    realName: 'Jonas Müller',
    nationality: 'Alemanha',
    age: 19,
    position: 'TOP',
    attributes: { mechanics: 62, macro: 56, communication: 58, leadership: 46, consistency: 59, emotionalControl: 52, farm: 62, mapVision: 58, playoffPerformance: 58 },
    overallRating: 59,
    potential: 85,
    personality: 'Impulsivo',
    popularity: 33,
    marketValue: 60000,
    salary: 700,
    contractMonths: 18,
    motivation: 85,
    stamina: 100,
    chemistry: 70,
    championPool: ['gnar', 'rumble', 'jax'],
    isPlayerControlled: false
  }
];

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
    </div>
  );
};

export default function AcademyTab({ 
  gameState, 
  onPromoteProspect, 
  onUpdateGameState,
  theme = 'light' 
}: AcademyTabProps) {
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
      bgSelectedRow: isDark ? 'bg-[#00e5ff]/15 border-l-4 border-[#00e5ff]' : 'bg-[#00e5ff]/5 border-l-4 border-[#00e5ff]',
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
  
  // Find current player team structure
  const playerTeam = useMemo(() => {
    return gameState.teams.find(t => t.id === gameState.playerTeamId)!;
  }, [gameState, gameState.playerTeamId]);

  // View switch: DASHBOARD (Escalação da base) or JSON Engine structural visualization
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'JSON'>('DASHBOARD');

  // Load and auto-initialize the Academy roster if it does not exist or has 0 players
  useEffect(() => {
    if (playerTeam && (!playerTeam.academy || playerTeam.academy.length === 0)) {
      // Set the first 5 DEFAULT_YOUTH_PLAYERS as starters to avoid blanks!
      const baseAcademyRoster: Player[] = DEFAULT_YOUTH_PLAYERS.map((pl, idx) => ({
        ...pl,
        id: `academy-contract-pro-${idx}-${Date.now()}`,
        isAcademyStarter: idx <= 4 // First 5 are active starters
      }));

      const updatedTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          return {
            ...t,
            academy: baseAcademyRoster
          };
        }
        return t;
      });

      if (onUpdateGameState) {
        onUpdateGameState({
          ...gameState,
          teams: updatedTeams
        });
      }
    }
  }, [playerTeam, gameState, gameState.playerTeamId, onUpdateGameState]);

  const rawProspectList = playerTeam.academy || [];

  // Starters & substitutes inside Academy
  const { titularesAcademy, reservasAcademy } = useMemo(() => {
    const starters = rawProspectList.filter(p => p.isAcademyStarter);
    const substitutes = rawProspectList.filter(p => !p.isAcademyStarter);

    // Sort starters TOP to SUP
    const posOrderMap: Record<Position, number> = { TOP: 0, JNG: 1, MID: 2, ADC: 3, SUP: 4 };
    const sortedStarters = [...starters].sort((a, b) => posOrderMap[a.position] - posOrderMap[b.position]);

    return {
      titularesAcademy: sortedStarters,
      reservasAcademy: substitutes
    };
  }, [rawProspectList]);

  // Selected player ID state tracker
  const [selectedAtletaId, setSelectedAtletaId] = useState<string>(() => {
    const list = playerTeam.academy || [];
    const starters = list.filter(p => p.isAcademyStarter);
    const posOrderMap: Record<Position, number> = { TOP: 0, JNG: 1, MID: 2, ADC: 3, SUP: 4 };
    const sortedStarters = [...starters].sort((a, b) => posOrderMap[a.position] - posOrderMap[b.position]);
    const firstStarter = sortedStarters[0] || list[0];
    return firstStarter ? firstStarter.id : '';
  });

  // Ensure selection points to a valid athlete if roster changes,
  // and prioritize selecting the first sorted starter (position 'TOP') on reload/mount.
  useEffect(() => {
    const starters = rawProspectList.filter(p => p.isAcademyStarter);
    const posOrderMap: Record<Position, number> = { TOP: 0, JNG: 1, MID: 2, ADC: 3, SUP: 4 };
    const sortedStarters = [...starters].sort((a, b) => posOrderMap[a.position] - posOrderMap[b.position]);
    const firstStarter = sortedStarters[0] || rawProspectList[0];

    const isCurrentValid = rawProspectList.some(p => p.id === selectedAtletaId);

    if (!selectedAtletaId || !isCurrentValid) {
      if (firstStarter) {
        setSelectedAtletaId(firstStarter.id);
      }
    }
  }, [rawProspectList, selectedAtletaId]);

  // Rule-enforced reactive reset on tab mount/focus transition:
  useEffect(() => {
    const starters = rawProspectList.filter(p => p.isAcademyStarter);
    const posOrderMap: Record<Position, number> = { TOP: 0, JNG: 1, MID: 2, ADC: 3, SUP: 4 };
    const sortedStarters = [...starters].sort((a, b) => posOrderMap[a.position] - posOrderMap[b.position]);
    const firstStarter = sortedStarters[0] || rawProspectList[0];
    if (firstStarter) {
      setSelectedAtletaId(firstStarter.id);
    }
  }, []);

  const activeProspect = useMemo(() => {
    return rawProspectList.find(p => p.id === selectedAtletaId) || rawProspectList[0];
  }, [rawProspectList, selectedAtletaId]);

  // Planos de treino focus mapping (safe fallback state logic)
  const [trainingFocusMap, setTrainingFocusMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('legendshub_academy_training_focus');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      'academy-contract-pro-0': 'Treino Mecânico Intenso',
      'academy-contract-pro-1': 'Aprimoramento de Macro',
      'academy-contract-pro-2': 'Aprimoramento de Macro',
      'academy-contract-pro-3': 'Treino Mecânico Intenso',
      'academy-contract-pro-4': 'Treino de Resiliência Mental'
    };
  });

  const handleUpdateTrainingFocus = (playerID: string, focus: string) => {
    const nextMap = { ...trainingFocusMap, [playerID]: focus };
    setTrainingFocusMap(nextMap);
    localStorage.setItem('legendshub_academy_training_focus', JSON.stringify(nextMap));
  };

  const getActiveTrainingFocusForPlayer = (playerID: string) => {
    return trainingFocusMap[playerID] || 'Treino Mecânico Intenso';
  };

  const getDeltaEvolucaoSemanalDesc = (playerID: string) => {
    const focus = getActiveTrainingFocusForPlayer(playerID);
    if (focus === 'Treino Mecânico Intenso') {
      return '+1 Mecânica nesta semana devido ao foco de treino ativo.';
    } else if (focus === 'Aprimoramento de Macro') {
      return '+1 Visão & Macro nesta semana devido ao foco de treino ativo.';
    } else if (focus === 'Treino de Resiliência Mental') {
      return '+1 Controle Emocional & Comunicação devido ao foco de treino ativo.';
    }
    return '+1 Atributo Geral devido ao foco de treino ativo.';
  };

  // Move player from starter to substitute (or vice-versa with swap inside same position)
  const handleToggleAcademyRole = (player: Player) => {
    if (!onUpdateGameState) return;

    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        const nextAcademy = (t.academy || []).map(p => {
          if (p.id === player.id) {
            return {
              ...p,
              isAcademyStarter: !p.isAcademyStarter
            };
          }
          // If moving current player to starter, swap out any other starter with same position
          if (!player.isAcademyStarter && p.isAcademyStarter && p.position === player.position) {
            return {
              ...p,
              isAcademyStarter: false
            };
          }
          return p;
        });

        return {
          ...t,
          academy: nextAcademy
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });
  };

  // Promover pro time principal
  const handlePromoteToPrincipal = (player: Player) => {
    if (!confirm(`Deseja promover o jovem talento "${player.name}" para o time profissional? Ele será adicionado como reserva.`)) {
      return;
    }

    onPromoteProspect(player);
    setSelectedAtletaId('');
  };

  // Dispensar da base
  const handleRescindContract = (player: Player) => {
    if (!window.confirm(`Tem certeza que deseja rescindir o contrato de base de "${player.name}"?\nIsso dispensará o jovem talento instantaneamente.`)) {
      return;
    }

    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          academy: (t.academy || []).filter(p => p.id !== player.id)
        };
      }
      return t;
    });

    if (onUpdateGameState) {
      onUpdateGameState({
        ...gameState,
        teams: updatedTeams
      });
    }

    setSelectedAtletaId('');
  };

  // Live output variables and symbols
  const activeSymbol = getCurrencySymbol();
  const rawBudget = playerTeam?.budget || 1500000;
  const formattedBudgetHud = getCaixaFormatadoHud(rawBudget);

  // Synchronized Reactive JSON object representing current system status
  const liveJsonData = useMemo(() => {
    const mappedTitulares = titularesAcademy.map(pc => ({
      id: pc.id,
      posicao: pc.position,
      nick: pc.name,
      nome_real: pc.realName || pc.name,
      idade: pc.age,
      nacionalidade: pc.nationality,
      label_estrangeiro: pc.nationality !== 'Brasil' ? 'Estrangeiro' : 'Nacional',
      OVR: pc.overallRating,
      POT: pc.potential,
      contrato: `${pc.contractMonths} meses restantes`,
      salario: `${activeSymbol} ${pc.salary.toLocaleString('pt-BR')}/semana`,
      status: "ELEGÍVEL CIRCUITO • TITULAR"
    }));

    const mappedReservas = reservasAcademy.map(pc => ({
      id: pc.id,
      posicao: pc.position,
      nick: pc.name,
      nome_real: pc.realName || pc.name,
      idade: pc.age,
      nacionalidade: pc.nationality,
      label_estrangeiro: pc.nationality !== 'Brasil' ? 'Estrangeiro' : 'Nacional',
      OVR: pc.overallRating,
      POT: pc.potential,
      contrato: `${pc.contractMonths} meses restantes`,
      salario: `${activeSymbol} ${pc.salary.toLocaleString('pt-BR')}/semana`,
      status: "ELEGÍVEL CIRCUITO • RESERVA"
    }));

    const optPlanosDeTreino = [
      'Treino Mecânico Intenso',
      'Aprimoramento de Macro',
      'Treino de Resiliência Mental'
    ];

    const details = activeProspect ? {
      jogador_selecionado: {
        id: activeProspect.id,
        nick: activeProspect.name,
        nome_real: activeProspect.realName || activeProspect.name,
        posicao: activeProspect.position,
        idade: activeProspect.age,
        nacionalidade: activeProspect.nationality
      },
      grafico_radar_atributos: {
        mecanica: activeProspect.attributes.mechanics,
        macro_game: activeProspect.attributes.macro,
        visao: activeProspect.attributes.mapVision,
        consistencia: activeProspect.attributes.consistency,
        mental: activeProspect.attributes.emotionalControl,
        comunicacao: activeProspect.attributes.communication
      },
      aba_foco_treino: {
        foco_ativo: getActiveTrainingFocusForPlayer(activeProspect.id),
        opcoes_disponiveis: optPlanosDeTreino
      },
      delta_evolucao_semanal: getDeltaEvolucaoSemanalDesc(activeProspect.id),
      perfil_comportamental: {
        trabalho_em_equipe: activeProspect.chemistry || 75,
        humor_tempo_jogo: activeProspect.isAcademyStarter ? "95% (Titular Absoluto)" : "62% (Ansioso por Oportunidades)"
      }
    } : null;

    return {
      cabecalho_painel: {
        titulo: "GERENCIAMENTO DE ELENCO ACADEMY",
        subtitulo: "Monitore o desenvolvimento dos jovens talentos, defina os titulares do Desafiante e gerencie a transição para o time principal."
      },
      tabela_jogadores_academy: {
        titulares_circuito_desafiante: mappedTitulares,
        substitutos_e_reservas_base: mappedReservas
      },
      painel_analitico_desenvolvimento: details,
      moeda_ativa: activeSymbol,
      caixa_bruto: rawBudget,
      caixa_formatado_hud: formattedBudgetHud
    };
  }, [playerTeam, titularesAcademy, reservasAcademy, activeProspect, trainingFocusMap, activeSymbol, rawBudget, formattedBudgetHud]);

  return (
    <div className={s.bgPage}>
      
      {/* HEADER INTEGRADO & HUD SUPERIOR */}
      <div className={s.bgCardHeader + " flex flex-col md:flex-row justify-between items-start md:items-center gap-4"}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${isDark ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'bg-teal-50 text-teal-600'} rounded-lg`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`font-display text-lg font-black tracking-wide ${s.textWhiteOrSlate} uppercase flex items-center gap-2`}>
              {liveJsonData.cabecalho_painel.titulo} <span className={`${isDark ? 'text-slate-700' : 'text-slate-300'} font-medium text-xs`}>|</span> <span className={`${isDark ? 'text-[#00e5ff]' : 'text-teal-600'} font-mono text-sm tracking-widest`}>Orçamento: {formattedBudgetHud}</span>
            </h2>
            <p className={`text-xs ${s.textMuted} font-medium font-sans`}>
              {liveJsonData.cabecalho_painel.subtitulo}
            </p>
          </div>
        </div>

        {/* Panel toggler */}
        <div className={`flex ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/60'} p-1.5 rounded-lg border shrink-0 w-full md:w-auto`}>
          <button
            onClick={() => setActiveView('DASHBOARD')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'DASHBOARD'
                ? (isDark ? 'bg-slate-800 text-[#00e5ff]' : 'bg-white text-slate-800 shadow-sm border border-slate-200')
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Elenco Base
          </button>
          <button
            onClick={() => setActiveView('JSON')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'JSON'
                ? (isDark ? 'bg-slate-800 text-[#00e5ff]' : 'bg-white text-slate-800 shadow-sm border border-slate-200')
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Code className="w-3.5 h-3.5" /> JSON Endpoint
          </button>
        </div>
      </div>

      {activeView === 'JSON' ? (
        /* LIVE JSON OUTPUT VISUALIZER */
        <div className={s.bgCard + " p-6"}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00e5ff]" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Academia Motor de Dados (JSON Engine Live View)
              </h3>
            </div>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
              isDark ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'bg-slate-100 text-slate-850'
            }`}>
              200 OK • Sincronizado ({activeSymbol})
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
            Mapeamento em tempo real do estado de atletas, folha de salário e moedas processados para CRM de visualização tática.
          </p>

          <pre className="p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto select-all max-h-[550px] scrollbar bg-[#050a12]/95 text-teal-400 border border-slate-800">
            {JSON.stringify(liveJsonData, null, 2)}
          </pre>
        </div>
      ) : (
        /* DASHBOARD INTERATIVO (DUPLICADO DA TELA JOGADORES) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUNA ESQUERDA: GRIDS (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* TITULARES */}
            <div className="space-y-3">
              <h3 className={`font-display ${s.textWhiteOrSlate} text-sm font-extrabold uppercase tracking-wide leading-none`}>
                Jogadores Titulares (Circuito Desafiante)
              </h3>
              
              <div className={s.bgTable}>
                <div className="grid grid-cols-12 gap-1 px-4 py-3 bg-slate-50/60 dark:bg-[#070d19] border-b border-slate-200/85 dark:border-[#1e2d44]/80 text-[9px] text-slate-400 font-mono font-black uppercase tracking-wider select-none">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-4 pl-2">Jogador</div>
                  <div className="col-span-1 text-center">OVR</div>
                  <div className="col-span-1 text-center">POT</div>
                  <div className="col-span-2 text-center font-bold">Contrato</div>
                  <div className="col-span-1 text-center font-bold">Status</div>
                  <div className="col-span-2 text-right">Salário</div>
                </div>

                <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                  {titularesAcademy.length > 0 ? (
                    titularesAcademy.map((player) => {
                      const isSelected = player.id === selectedAtletaId;
                      const isEstrangeiro = player.nationality !== 'Brasil';
                      return (
                        <button
                          type="button"
                          key={player.id}
                          onClick={() => setSelectedAtletaId(player.id)}
                          className={`grid grid-cols-12 gap-1 items-center p-3 cursor-pointer transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#00e5ff]/30 ${
                            isSelected 
                              ? s.bgSelectedRow 
                              : s.hoverRow
                          }`}
                        >
                          <div className="col-span-1 flex justify-center select-none">
                            <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-[#00e5ff]' : 'bg-white border border-slate-200 text-teal-600'} rounded tracking-wide`}>
                              {player.position}
                            </span>
                          </div>

                          <div className="col-span-4 flex items-center gap-2.5 pl-2 truncate">
                            <div className="truncate">
                              <p className={`font-display text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} leading-none`}>
                                {player.name}
                                {isEstrangeiro && (
                                  <span className="ml-1.5 bg-orange-500/20 text-orange-400 text-[8px] font-black uppercase px-1 py-0.5 rounded tracking-widest inline-block">
                                    EST
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{player.realName || player.name}</p>
                            </div>
                          </div>

                          <div className="col-span-1 text-center">
                            <span className={`font-display text-xs font-black ${isDark ? 'text-[#00e5ff]' : 'text-slate-700'}`}>{player.overallRating}</span>
                          </div>

                          <div className="col-span-1 text-center font-bold">
                            <span className="font-display text-xs text-teal-500">{player.potential}</span>
                          </div>

                          <div className="col-span-2 text-center text-[10px] font-mono text-slate-400">
                            {player.contractMonths} meses
                          </div>

                          <div className="col-span-1 flex justify-center items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow" />
                          </div>

                          <div className="col-span-2 text-right font-mono text-[10px] text-slate-400 font-extrabold pr-1">
                            {formatMoney(player.salary)}/sem
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs uppercase font-bold text-slate-500">
                      Nenhum titular escalado na base.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RESERVAS */}
            <div className="space-y-3 pt-2">
              <h3 className={`font-display ${s.textWhiteOrSlate} text-sm font-extrabold uppercase tracking-wide leading-none`}>
                Lista de Reservas (Academy)
              </h3>
              
              <div className={s.bgTable}>
                <div className="grid grid-cols-12 gap-1 px-4 py-3 bg-slate-50/60 dark:bg-[#070d19] border-b border-slate-200/85 dark:border-[#1e2d44]/80 text-[9px] text-slate-400 font-mono font-black uppercase tracking-wider select-none">
                  <div className="col-span-1 text-center">POS</div>
                  <div className="col-span-4 pl-2">Jogador</div>
                  <div className="col-span-1 text-center">OVR</div>
                  <div className="col-span-1 text-center">POT</div>
                  <div className="col-span-2 text-center font-bold">Contrato</div>
                  <div className="col-span-1 text-center font-bold">Status</div>
                  <div className="col-span-2 text-right">Salário</div>
                </div>

                <div className={`divide-y ${isDark ? 'divide-[#1e2d44]/55' : 'divide-slate-100'}`}>
                  {reservasAcademy.length > 0 ? (
                    reservasAcademy.map((player) => {
                      const isSelected = player.id === selectedAtletaId;
                      const isEstrangeiro = player.nationality !== 'Brasil';
                      return (
                        <button
                          type="button"
                          key={player.id}
                          onClick={() => setSelectedAtletaId(player.id)}
                          className={`grid grid-cols-12 gap-1 items-center p-3 cursor-pointer transition-all w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#00e5ff]/30 ${
                            isSelected 
                              ? s.bgSelectedRow 
                              : s.hoverRow
                          }`}
                        >
                          <div className="col-span-1 flex justify-center select-none">
                            <span className={`font-mono text-[9px] font-black px-2 py-0.5 ${isDark ? 'bg-slate-900 border-slate-750 text-[#00e5ff]' : 'bg-white border border-slate-200 text-teal-600'} rounded tracking-wide`}>
                              {player.position}
                            </span>
                          </div>

                          <div className="col-span-4 flex items-center gap-2.5 pl-2 truncate">
                            <div className="truncate">
                              <p className={`font-display text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} leading-none`}>
                                {player.name}
                                {isEstrangeiro && (
                                  <span className="ml-1.5 bg-orange-500/20 text-orange-400 text-[8px] font-black uppercase px-1 py-0.5 rounded tracking-widest inline-block">
                                    EST
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{player.realName || player.name}</p>
                            </div>
                          </div>

                          <div className="col-span-1 text-center">
                            <span className={`font-display text-xs font-black ${isDark ? 'text-[#00e5ff]' : 'text-slate-700'}`}>{player.overallRating}</span>
                          </div>

                          <div className="col-span-1 text-center font-bold">
                            <span className="font-display text-xs text-teal-500">{player.potential}</span>
                          </div>

                          <div className="col-span-2 text-center text-[10px] font-mono text-slate-400">
                            {player.contractMonths} meses
                          </div>

                          <div className="col-span-1 flex justify-center items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          </div>

                          <div className="col-span-2 text-right font-mono text-[10px] text-slate-400 font-extrabold pr-1">
                            {formatMoney(player.salary)}/sem
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs uppercase font-bold text-slate-500">
                      Nenhum reserva na divisão de base.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: ANALÍTICO COMPARATIVO + RADAR + PLANOS DE TREINO (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {activeProspect ? (
              <div className={`${s.bgCard} p-6 space-y-5 shadow-sm`}>
                
                {/* Atleta Banner Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className={`w-12 h-12 rounded-xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-755' : 'bg-slate-50 border-slate-205'} border shrink-0 bg-transparent flex items-center justify-center`}>
                    <img 
                      src={getGameAssetUrl('players', activeProspect.id, activeProspect.photoUrl)} 
                      referrerPolicy="no-referrer"
                      alt="prospect" 
                      className="w-full h-full object-contain bg-transparent" 
                      onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-player.png'; }}
                    />
                  </div>
                  <div>
                    <h4 className={`font-display text-base font-black uppercase text-cyan-400 dark:text-[#00e5ff] leading-none`}>
                      {activeProspect.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono uppercase tracking-wide">
                      {activeProspect.position} • {activeProspect.realName || activeProspect.name} ({activeProspect.age} anos)
                    </p>
                  </div>
                </div>

                {/* Radar teia chart */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono block">Gráfico de Teia (Atributos)</span>
                  <AnimatedRadarChart
                    labels={['Mecânica', 'Macro', 'Comun.', 'Visão', 'Consist.', 'Mental']}
                    values={[
                      activeProspect.attributes.mechanics,
                      activeProspect.attributes.macro,
                      activeProspect.attributes.communication,
                      activeProspect.attributes.mapVision,
                      activeProspect.attributes.consistency,
                      activeProspect.attributes.emotionalControl
                    ]}
                    color="#00e5ff"
                    fillColor="rgba(0, 229, 255, 0.12)"
                    isDark={isDark}
                  />
                </div>

                {/* ABA PLANOS DE FOCO DO TREINAMENTO */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block font-mono">
                    Plano de Foco Ativo (Desenvolvimento)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { title: 'Treino Mecânico Intenso', desc: 'Maximiza laning phase, skirmishing rápido, reflexos de reflexos.' },
                      { title: 'Aprimoramento de Macro', desc: 'Melhora controle de waves de minions, rotações e visão tática.' },
                      { title: 'Treino de Resiliência Mental', desc: 'Eleva estabilidade emocional em desvantagem e comunicação clara.' }
                    ].map((item) => {
                      const isFocusActive = getActiveTrainingFocusForPlayer(activeProspect.id) === item.title;
                      return (
                        <button
                          key={item.title}
                          onClick={() => handleUpdateTrainingFocus(activeProspect.id, item.title)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-start gap-0.5 ${
                            isFocusActive 
                              ? 'border-cyan-400 bg-cyan-400/5 text-cyan-400 font-bold'
                              : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-extrabold text-[10.5px] uppercase tracking-wide leading-none block">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-slate-400 leading-relaxed block font-medium">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DELTA DE EVOLUÇÃO SEMANAL */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? 'bg-[#080d16] border-[#1e2d44]' : 'bg-[#f8fafc] border-slate-150'
                }`}>
                  <p className="text-[9px] text-cyan-400 font-mono font-black uppercase tracking-wider leading-none">
                    Δ Impacto de Evolução Ativa
                  </p>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    {getDeltaEvolucaoSemanalDesc(activeProspect.id)}
                  </p>
                </div>

                {/* PERFIL COMPORTAMENTAL & HUMOR POR TEMPO DE JOGO */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono block">Saúde Mental & Comportamento</span>
                  
                  {/* Trabalho de equipe */}
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Sinergia / Trabalho Equipe</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">{activeProspect.chemistry || 75}%</span>
                      <div className="w-24 bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#00e5ff] h-full rounded-full" style={{ width: `${activeProspect.chemistry || 75}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Humor de tempo de jogo */}
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Humor por Tempo de Jogo</span>
                    <span className="font-bold text-yellow-500 font-mono">
                      {activeProspect.isAcademyStarter ? "95% (Titular)" : "62% (Reservas)"}
                    </span>
                  </div>
                </div>

                {/* TRANSFER & MOVEMENT SYSTEM ACTIONS */}
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Mover para Reserva / Titular */}
                  <button
                    onClick={() => handleToggleAcademyRole(activeProspect)}
                    className="w-full bg-[#007BFF] hover:bg-blue-600 text-white text-[10px] font-extrabold py-3 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1.5 shrink-0" />
                    {activeProspect.isAcademyStarter ? 'Mover para a Reserva do Academy' : 'Escalar como Titular (Desafiante)'}
                  </button>

                  {/* Promover para profissional */}
                  <button
                    onClick={() => handlePromoteToPrincipal(activeProspect)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-3 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center"
                  >
                    <ArrowUp className="w-3.5 h-3.5 inline mr-1.5 shrink-0" />
                    Promover para o Time Principal
                  </button>

                  <button
                    onClick={() => handleRescindContract(activeProspect)}
                    className="w-full bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/30 text-rose-500 text-[9.5px] font-extrabold py-2.5 uppercase tracking-wider rounded transition-all cursor-pointer text-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-1.5 shrink-0" />
                    Dispensar Jovem Talento
                  </button>

                </div>

              </div>
            ) : (
              <div className={`text-slate-400 text-center text-xs py-12 uppercase tracking-widest ${s.bgCard} shadow-none`}>
                Selecione um atleta nos grids para gerenciar seu plano analítico de foco de desenvolvimento
              </div>
            )}
            
          </div>

        </div>
      )}

    </div>
  );
}

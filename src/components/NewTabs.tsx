/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Keyboard, Trophy, Shield, Building2, Store, Users, DollarSign, 
  TrendingUp, BarChart3, Tv, Award, Play, Sliders, Zap, Gamepad2, 
  Calendar, Check, AlertCircle, Sparkles, ChevronRight, ChevronLeft, ArrowLeft, Heart, Crown, 
  Medal, Save, HardDrive, Trash2, Import, Download, User, Briefcase, Megaphone,
  Percent, Lock, Scale, Clock, AlertTriangle, MapPin, Star
} from 'lucide-react';
import { GameState, Team, Player, Sponsor, Champion, MatchSeries, Position } from '../types';

// ==========================================
// THEME COLORS UTILITY
// ==========================================
export function getThemeStyles(theme?: 'light' | 'dark') {
  const isDark = theme !== 'light';
  return {
    isDark,
    bgCard: isDark ? 'bg-[#0a1424] border border-[#1e2d44] text-white' : 'bg-white border border-slate-200 shadow-sm text-slate-850',
    bgInnerCard: isDark ? 'bg-[#070d19] border border-[#1e2d44]' : 'bg-slate-50 border border-slate-210 text-slate-700',
    bgInnerNoBorder: isDark ? 'bg-[#070d19]' : 'bg-slate-50',
    textMain: isDark ? 'text-white' : 'text-slate-850',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    borderMuted: isDark ? 'border-[#1e2d44]' : 'border-slate-205',
    borderSemiMuted: isDark ? 'border-[#1e2d44]/50' : 'border-slate-100',
    borderLighter: isDark ? 'border-[#1e2d44]/30' : 'border-slate-200/60',
    divider: isDark ? 'divide-[#1e2d44]/50' : 'divide-slate-200/60',
    bgHeaderRow: isDark ? 'bg-[#070d19]/40' : 'bg-slate-100',
    bgHeader: isDark ? 'bg-[#070d19] text-white' : 'bg-slate-100 text-slate-800',
    textTitle: isDark ? 'text-[#00d2fd]' : 'text-blue-600',
    textAccent: isDark ? 'text-[#00cbd6]' : 'text-cyan-600',
    hoverBg: isDark ? 'hover:bg-[#070d19]/40' : 'hover:bg-slate-100/65',
    tagClass: isDark ? 'bg-slate-500/10 text-[#00d2fd]' : 'bg-blue-50 text-blue-650 border border-blue-100',
    textWhiteOrSlate: isDark ? 'text-white' : 'text-slate-800',
  };
}

// ==========================================
// 1. GAMING OFFICE TAB
// ==========================================
interface GamingOfficeProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  theme?: 'light' | 'dark';
}

export function GamingOfficeTab({ gameState, onUpdateGameState, triggerNotification, theme }: GamingOfficeProps) {
  const s = getThemeStyles(theme);
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  // Upgrades local list
  const upgrades = [
    {
      id: 'studio',
      name: 'Estúdio de Mídia Integrado',
      desc: 'Melhora a produção de conteúdo semanal da equipe, aumentando o engajamento e multiplicando torcedores por semana.',
      level: playerTeam.infrastructure.mediaTeamLevel,
      max: 5,
      cost: playerTeam.infrastructure.mediaTeamLevel * 80000,
      benefit: `Impulso de mídia: +${playerTeam.infrastructure.mediaTeamLevel * 10}% Popularidade de torcida semanal.`,
      icon: Tv
    },
    {
      id: 'mental',
      name: 'Sala de Fisioterapia & Psicologia',
      desc: 'Minimiza o estresse das semanas de derrotas, reduz significativamente o "tilt" e acelera a recuperação de energia/estamina dos atletas.',
      level: playerTeam.infrastructure.trainingCenterLevel,
      max: 5,
      cost: playerTeam.infrastructure.trainingCenterLevel * 100000,
      benefit: `Controle emocional: +${playerTeam.infrastructure.trainingCenterLevel * 5} consistência física de treinos.`,
      icon: Heart
    },
    {
      id: 'gaming_room',
      name: 'Computadores Core Extremos',
      desc: 'Estações de simulação de alto desempenho alimentadas por fibra dedicada que reduzem o atraso tático dos treinos do Game.',
      level: playerTeam.infrastructure.gamingHouseLevel,
      max: 5,
      cost: playerTeam.infrastructure.gamingHouseLevel * 125000,
      benefit: `Performance tática: +${playerTeam.infrastructure.gamingHouseLevel * 4} Potencial de Roster por treino.`,
      icon: Keyboard
    }
  ];

  const handleUpgradeOffice = (upgradeId: string, cost: number) => {
    if (playerTeam.budget < cost) {
      alert("Fundos insuficientes para melhorar a Gaming Office!");
      return;
    }

    const nextTeams = teams.map(t => {
      if (t.id === playerTeamId) {
        let infra = { ...t.infrastructure };
        if (upgradeId === 'studio') infra.mediaTeamLevel += 1;
        if (upgradeId === 'mental') infra.trainingCenterLevel += 1;
        if (upgradeId === 'gaming_room') infra.gamingHouseLevel += 1;

        return {
          ...t,
          budget: t.budget - cost,
          infrastructure: infra
        };
      }
      return t;
    });

    const nextState: GameState = {
      ...gameState,
      teams: nextTeams
    };

    onUpdateGameState(nextState);
    triggerNotification("🏢 Gaming Office Melhorado!", `Infraestrutura atualizada. Detalhamento operacional completo aplicado.`);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div className={`${s.bgCard} p-6 rounded-xl flex items-center justify-between`}>
        <div>
          <h3 className={`font-display ${s.textWhiteOrSlate} text-base font-black uppercase tracking-wider`}>Sede Corporativa (Gaming Office)</h3>
          <p className={`text-xs ${s.textMuted} mt-1 max-w-xl`}>
            Invista na modernização das instalações do escritório tático. Salas bem equipadas aumentam o bem-estar da diretoria e estamina dos jogadores.
          </p>
        </div>
        <Building2 className="w-12 h-12 text-[#00d2fd] opacity-20 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upgrades.map(item => {
          const Icon = item.icon;
          const isMaxed = item.level >= item.max;
          return (
            <div key={item.id} className={`${s.bgCard} p-5 rounded-xl flex flex-col justify-between shadow-md space-y-4`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono p-1 rounded font-bold uppercase ${s.tagClass}`}>
                    Level {item.level} / {item.max}
                  </span>
                </div>
                <div>
                  <h4 className={`text-xs uppercase font-extrabold ${s.textWhiteOrSlate}`}>{item.name}</h4>
                  <p className={`text-[10.5px] ${s.textMuted} mt-1.5 leading-relaxed`}>{item.desc}</p>
                </div>
                <div className="text-[10px] font-semibold text-emerald-450 uppercase bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                  ⚡ {item.benefit}
                </div>
              </div>

              <div>
                {isMaxed ? (
                  <button disabled className={`w-full py-2 ${theme === 'light' ? 'bg-slate-205 text-slate-400 border-slate-200' : 'bg-gray-800 text-gray-500 border-gray-700'} text-[10px] uppercase font-black tracking-widest rounded-lg border cursor-not-allowed`}>
                    MELHORIA MÁXIMA
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgradeOffice(item.id, item.cost)}
                    className="w-full py-2 bg-[#00cbd6] hover:bg-[#00d2fd] text-black text-[10px] sm:text-[10.5px] uppercase font-black tracking-widest rounded-lg cursor-pointer transition-all"
                  >
                    UPGRADE: $ {(item.cost / 1000).toLocaleString('pt-BR')}K
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. LIGA TAB (Classificação Standings)
// ==========================================
interface LigaTabProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
}

export function LigaTab({ gameState, theme }: LigaTabProps) {
  const { teams } = gameState;
  const s = getThemeStyles(theme);

  const sortedLeaderboard = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const diffA = a.gameWins - a.gameLosses;
    const diffB = b.gameWins - b.gameLosses;
    return diffB - diffA;
  });

  return (
    <div className="space-y-6 font-sans select-none">
      <div className={`${s.bgCard} rounded-xl overflow-hidden shadow-lg`}>
        <div className={`px-5 py-4 border-b ${s.borderMuted} ${s.bgHeader} flex justify-between items-center`}>
          <div className="flex gap-2 items-center">
            <Trophy className="text-[#00d2fd] w-5 h-5 animate-bounce" />
            <span className={`font-display font-black text-sm uppercase tracking-wider ${s.textWhiteOrSlate}`}>Classificação CBLOL - Temporada Regular</span>
          </div>
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Summer Split</span>
        </div>

        <div className={`grid grid-cols-12 gap-1 px-5 py-3 border-b ${s.borderSemiMuted} text-[9.5px] ${theme === 'light' ? 'text-blue-600' : 'text-[#00d2fd]'} font-extrabold tracking-widest uppercase ${s.bgHeaderRow}`}>
          <div className="col-span-1">#</div>
          <div className="col-span-4">NOME DO CLUBE</div>
          <div className="col-span-2 text-center">VITÓRIAS</div>
          <div className="col-span-2 text-center">DERROTAS</div>
          <div className="col-span-1 text-center">DELTA</div>
          <div className="col-span-2 text-right">STREAK</div>
        </div>

        <div className={`divide-y ${s.divider}`}>
          {sortedLeaderboard.map((team, idx) => {
            const isUserTeam = team.id === gameState.playerTeamId;
            const rank = idx + 1;
            const inPlayoffs = rank <= 4;
            return (
              <div
                key={team.id}
                className={`grid grid-cols-12 gap-1 px-5 py-4 items-center transition-colors ${
                  isUserTeam ? (theme === 'light' ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-[#00d2fd]/5 border-l-4 border-[#00d2fd]') : s.hoverBg
                }`}
              >
                <div className="col-span-1">
                  <span className={`w-5.5 h-5.5 rounded flex items-center justify-center font-bold text-[10px] ${
                    inPlayoffs 
                      ? (theme === 'light' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-500/15 text-[#00d2fd] border border-[#00d2fd]/30') 
                      : (theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-gray-500')
                  }`}>
                    {rank}
                  </span>
                </div>

                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="w-1.5 h-6 rounded" style={{ backgroundColor: team.primaryColor || '#00cbd6' }} />
                  <span className={`text-xs uppercase font-extrabold ${s.textWhiteOrSlate} tracking-wide`}>{team.name}</span>
                </div>

                <div className={`col-span-2 text-center font-mono font-black ${s.textWhiteOrSlate} text-xs`}>
                  {team.wins}
                </div>

                <div className={`col-span-2 text-center font-mono ${s.textMuted} text-xs`}>
                  {team.losses}
                </div>

                <div className={`col-span-1 text-center font-mono text-[11px] ${s.textMuted}`}>
                  {team.gameWins - team.gameLosses > 0 ? `+${team.gameWins - team.gameLosses}` : team.gameWins - team.gameLosses}
                </div>

                <div className="col-span-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    team.streak.startsWith('W') 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {team.streak}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TIMES TAB (League Rosters Explorer with Regional Navigation)
// ==========================================
interface TimesTabProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
  onSelectPlayer?: (playerId: string) => void;
}

const LEAGUE_DATABASE = [
  {
    id: 'CBLOL',
    name: 'CBLOL',
    country: 'Brasil',
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    description: 'A elite do esports brasileiro. Atmosfera eletrizante, paixões gigantes de torcidas e rivalidades históricas.'
  },
  {
    id: 'LCK',
    name: 'LCK',
    country: 'Coreia do Sul',
    img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
    description: 'A liga mais técnica e vitoriosa de todos os tempos. Perfeição estratégica e micro-controle excepcional.'
  },
  {
    id: 'LPL',
    name: 'LPL',
    country: 'China',
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
    description: 'Hiperagressividade característica, confrontos constantes por recursos e lutas impressionantes de equipe.'
  },
  {
    id: 'LEC',
    name: 'LEC',
    country: 'Europa',
    img: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=400',
    description: 'Inovação tática disruptiva nos drafts, humor irreverente e apresentações audiovisuais grandiosas.'
  },
  {
    id: 'LCS',
    name: 'LCS',
    country: 'América do Norte',
    img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400',
    description: 'Investimentos monumentais em grandes estrelas globais, sede de alta performance e showmanship americano.'
  },
  {
    id: 'LCP',
    name: 'LCP',
    country: 'Pacífico',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
    description: 'O novo circuito integrado da Ásia-Pacífico. Elencos velozes e a nova geração de novos talentos regionais.'
  }
];

function getTeamTitles(teamId: string, acronym: string): string[] {
  const idLower = teamId.toLowerCase();
  if (idLower.includes('pain') || idLower.includes('png')) {
    return ['🏆 3x Campeão CBLOL', '🥈 5x Vice-Campeão CBLOL', '⚡ 1x Campeão Superliga ABC'];
  }
  if (idLower.includes('loud') || idLower.includes('llo')) {
    return ['🏆 4x Campeão CBLOL (Em Série)', '⭐ 3x Participante do Worlds Stage', '🔥 1x Campeão CBLOL Academy'];
  }
  if (idLower.includes('red') || idLower.includes('canids')) {
    return ['🏆 3x Campeão CBLOL', '🥉 2x Finalista Superliga'];
  }
  if (idLower.includes('fluxo') || idLower.includes('fx')) {
    return ['🏆 1x Campeão CBLOL Academy', '📈 Revelação Estrutural de Base'];
  }
  if (idLower.includes('t1') || acronym === 'T1' || idLower === 'lck_t1') {
    return ['👑 4x Campeão do Mundo (Worlds)', '🏆 10x Campeão LCK', '🌟 2x Mid-Season Invitational (MSI)'];
  }
  if (idLower.includes('gen') || acronym === 'GEN' || idLower === 'lck_gen') {
    return ['🏆 4x Campeão Consecutivo LCK', '🌟 1x Champion Mid-Season Invitational (MSI)', '🥈 2x Vice Mundiais'];
  }
  if (idLower.includes('dk') || idLower.includes('dplus') || acronym === 'DK') {
    return ['👑 1x Campeão Mundial (Worlds 2020)', '🏆 3x Campeão LCK', '🥈 1x Vice MSI'];
  }
  if (idLower.includes('blg') || acronym === 'BLG') {
    return ['🏆 2x Campeão LPL (Spring/Summer)', '🥈 1x Vice-Campeão do Worlds', '🔥 Campeão Demacia Cup'];
  }
  if (idLower.includes('tes') || acronym === 'TES') {
    return ['🏆 1x Campeão LPL', '🥈 2x Vice-Campeão LPL', '👊 Campeão Demacia Cup'];
  }
  if (idLower.includes('c9') || acronym === 'C9') {
    return ['🏆 6x Campeão LCS', '🌎 Semifinalista Mundial (Worlds 2018)', '🔥 NA Academy Trophy'];
  }
  if (idLower.includes('g2') || acronym === 'G2') {
    return ['🏆 14x Campeão LEC', '🌟 1x Mid-Season Invitational (MSI) Champion', '🥈 Finalista Worlds 2019'];
  }
  if (idLower.includes('fnc') || acronym === 'FNC') {
    return ['👑 1x Campeão do Mundo (Season 1)', '🏆 7x Campeão LEC', '🥈 Finalista Worlds 2018'];
  }
  if (idLower.includes('tl') || acronym === 'TL') {
    return ['🏆 5x Campeão LCS', '🥈 Vice-Campeão MSI (2019)', '⭐ NA LCS Lock-In Cup'];
  }
  
  const hash = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (hash % 3 === 0) {
    return [`🏆 1x Campeão Regional`, `🥈 1x Vice-Campeão do Split`, `📈 Revelação de Elenco`];
  } else if (hash % 3 === 1) {
    return [`🥈 2x Vice-Campeão Regional`, `🔥 1x Campeão de Base Academy`];
  } else {
    return [`🎯 1x Semifinalista de Playoff Regional`, `⚡ Classificado para Phase Stage`];
  }
}

export function TimesTab({ gameState, theme, onSelectPlayer }: TimesTabProps) {
  const { teams } = gameState;
  const s = getThemeStyles(theme);
  const isDark = theme !== 'light';

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const activeTeam = teams.find(t => t.id === selectedTeamId);
  const activeRegion = LEAGUE_DATABASE.find(l => l.id === selectedRegionId);

  // Clear selections
  const handleBackToLeagues = () => {
    setSelectedRegionId(null);
    setSelectedTeamId(null);
  };

  const handleBackToTeams = () => {
    setSelectedTeamId(null);
  };

  // 1. LEAGUE / REGION SELECTION SCREEN
  if (!selectedRegionId) {
    return (
      <div className="space-y-6 select-none font-sans">
        <div className="space-y-1.5 border-b pb-4 border-slate-200/20 dark:border-[#1e2d44]/40">
          <h2 className={`font-display text-lg font-black tracking-wider uppercase flex items-center gap-2 ${s.textWhiteOrSlate}`}>
            <Shield className="w-5 h-5 text-sky-400" /> Circuito Global de Ligas Rivais
          </h2>
          <p className={`text-xs ${s.textMuted} font-medium`}>
            Explore e organize os melhores clubes do mundo por região operacional. Escolha uma das ligas para ver dados de orçamento, infraestrutura dos centros de treinamento e elencos ativos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEAGUE_DATABASE.map((league) => {
            const leagueTeamsCount = teams.filter(t => (t.region || 'CBLOL') === league.id).length;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedRegionId(league.id)}
                className={`relative overflow-hidden rounded-xl border text-left flex flex-col justify-between h-48 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-sky-400/50 group cursor-pointer ${
                  isDark 
                    ? 'border-[#1e2d44] hover:border-sky-500 bg-slate-950/80 hover:shadow-[0_0_20px_rgba(2,132,199,0.15)]' 
                    : 'border-slate-200 hover:border-blue-500 bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {/* Image Backdrop */}
                <div className="absolute inset-0">
                  <img 
                    src={league.img} 
                    alt={league.name} 
                    className="w-full h-full object-cover opacity-35 group-hover:opacity-45 transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative p-4 z-10 w-full flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <span className="bg-sky-500/15 border border-sky-400/35 text-sky-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide">
                      {league.country}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">
                      {leagueTeamsCount} Clubes
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-auto">
                    <h3 className="font-display font-black text-xl text-white tracking-wide flex items-center gap-1.5 group-hover:text-sky-400 transition-colors">
                      {league.name} <ChevronRight className="w-4 h-4 text-sky-400/50 group-hover:translate-x-1 duration-200" />
                    </h3>
                    <p className="text-[10px] text-slate-300 pr-2 line-clamp-2 leading-relaxed">
                      {league.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. TEAMS LIST SCREEN IN SELECTED LEAGUE
  if (selectedRegionId && !selectedTeamId) {
    const regionalTeams = teams.filter(t => (t.region || 'CBLOL') === selectedRegionId);
    return (
      <div className="space-y-6 select-none font-sans">
        <div className="flex items-center justify-between border-b pb-4 border-slate-200/20 dark:border-[#1e2d44]/40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToLeagues}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-[#1e2d44] hover:bg-slate-800 text-sky-400' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Ligas
            </button>
            <div className="hidden sm:block h-5 w-[1px] bg-slate-200/20" />
            <h3 className={`font-display text-base font-black uppercase tracking-wider ${s.textWhiteOrSlate}`}>
              Clubes em atividade na liga {selectedRegionId}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded uppercase">
            {activeRegion?.country}
          </span>
        </div>

        {/* Small League Banner */}
        {activeRegion && (
          <div className="relative overflow-hidden rounded-xl h-24 flex items-center p-5">
            <div className="absolute inset-0 z-0">
              <img src={activeRegion.img} alt={activeRegion.name} className="w-full h-full object-cover opacity-25" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
            </div>
            <div className="relative z-10 space-y-1">
              <h2 className="text-lg font-black font-display tracking-wider text-white uppercase">{activeRegion.name} Professional Circuit</h2>
              <p className="text-[10.5px] text-slate-300 leading-snug max-w-xl">{activeRegion.description}</p>
            </div>
          </div>
        )}

        {/* Teams List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalTeams.map((t) => {
            const teamOvr = Math.floor(t.roster.reduce((sum, p) => sum + p.overallRating, 0) / 5);
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`p-4 rounded-xl border text-left space-y-3.5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-sky-400/50 cursor-pointer group flex flex-col justify-between ${
                  isDark 
                    ? 'border-[#1e2d44] bg-[#0a1424] hover:border-sky-400 hover:shadow-[0_4px_16px_rgba(0,210,253,0.08)]' 
                    : 'border-slate-200 bg-white hover:border-blue-500 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2.5 truncate">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-sm"
                      style={{ backgroundColor: t.primaryColor }}
                    >
                      {t.acronym.substring(0, 3)}
                    </div>
                    <div className="truncate">
                      <h4 className={`text-xs font-black uppercase tracking-wider group-hover:text-sky-400 duration-150 ${s.textWhiteOrSlate}`}>{t.name}</h4>
                      <p className={`text-[9.5px] font-bold ${s.textMuted} font-mono mt-0.5`}>Sigla: {t.acronym}</p>
                    </div>
                  </div>
                  <div className="bg-sky-500/10 border border-sky-400/35 text-sky-400 rounded px-2 py-0.5 text-[9.5px] font-mono font-black">
                    OVR {teamOvr}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-3 border-slate-200/10 dark:border-[#1e2d44]/30 text-[10px] w-full">
                  <div>
                    <span className={`block text-[8px] font-extrabold uppercase tracking-wide ${s.textMuted}`}>Orçamento</span>
                    <span className={`font-mono font-black ${s.textWhiteOrSlate}`}>$ {(t.budget / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="text-right">
                    <span className={`block text-[8px] font-extrabold uppercase tracking-wide ${s.textMuted}`}>Fãs Ativos</span>
                    <span className={`font-mono font-black ${s.textAccent}`}>{t.popularity}%</span>
                  </div>
                </div>

                <div className="w-full text-right pt-1.5 flex justify-end items-center text-sky-400 font-extrabold tracking-wider text-[8px] uppercase group-hover:text-sky-350 transition-colors">
                  Visualizar Perfil Completo <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 duration-150" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. INDIVIDUAL TEAM PROFILE VIEW
  if (activeTeam) {
    const teamOvr = Math.floor(activeTeam.roster.reduce((sum, p) => sum + p.overallRating, 0) / 5);
    const activeLeague = LEAGUE_DATABASE.find(l => l.id === selectedRegionId);
    
    // Get master sponsor
    let sponsorName = "Samsung Odyssey";
    let sponsorIncome = 45000;
    let sponsorBonus = 60000;
    
    if (activeTeam.sponsors && activeTeam.sponsors.length > 0) {
      const activeSponsor = activeTeam.sponsors[0];
      sponsorName = activeSponsor.name;
      sponsorIncome = activeSponsor.incomePerWeek;
      sponsorBonus = activeSponsor.signatureBonus;
    }

    const teamTitles = getTeamTitles(activeTeam.id, activeTeam.acronym);

    return (
      <div className="space-y-6 select-none font-sans">
        {/* Navigation Breadcrumbs / Header */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b pb-4 border-slate-200/20 dark:border-[#1e2d44]/40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToTeams}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-[#1e2d44] hover:bg-slate-800 text-sky-400' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-655'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar para Times
            </button>
            <span className="text-slate-500 font-bold">/</span>
            <span className={`text-xs font-bold font-mono tracking-widest uppercase ${s.textAccent}`}>
              Ficha Técnica do Clube
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase ${s.textMuted}`}>Circuito Integrado:</span>
            {activeLeague && (
              <div className="flex items-center gap-1.5 bg-black/40 text-sky-400 px-2.5 py-1 rounded text-[10px] font-bold border border-sky-400/20 backdrop-blur-sm">
                <img src={activeLeague.img} alt={activeLeague.name} className="w-4 h-4 rounded-full object-cover border border-[#00cbd6]/50" />
                <span>{activeLeague.name} ({activeRegion?.country})</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Custom Banner aligned with Team colors */}
        <div 
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${activeTeam.primaryColor || '#0ea5e9'}eb, ${activeTeam.secondaryColor || '#1e1b4b'}df)` 
          }}
        >
          {/* Decorative Giant Background Logo / Initials */}
          <div className="absolute right-6 bottom-[-20px] font-black text-white/5 text-9xl tracking-tighter uppercase select-none pointer-events-none">
            {activeTeam.acronym}
          </div>

          <div className="flex items-center gap-5 z-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl tracking-widest text-white shadow-lg border border-white/20"
              style={{ backgroundColor: activeTeam.primaryColor }}
            >
              {activeTeam.acronym.substring(0, 3)}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-display tracking-wide uppercase text-white drop-shadow-md">
                {activeTeam.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-100/90">
                <span className="bg-white/10 px-2 py-0.5 rounded uppercase backdrop-blur-sm text-[10px]">Sigla: {activeTeam.acronym}</span>
                <span className="bg-white/15 px-2 py-0.5 rounded uppercase backdrop-blur-sm text-[10px]">Região: {selectedRegionId}</span>
              </div>
            </div>
          </div>

          {/* OVR Team Circle Indicator */}
          <div className="bg-black/40 border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-md z-10 w-28 h-20 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-300">Overall Rival</span>
            <span className="text-2xl font-black font-mono tracking-tighter text-[#00cbd6]">{teamOvr}</span>
          </div>
        </div>

        {/* Bento Grid details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block: Capital, Infrastructure, Sponsor and Honors */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Economic and Capital Bento Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Verba / Budget Card */}
              <div className={`p-5 rounded-xl border ${s.bgCard} shadow-sm space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${s.textMuted}`}>Verba de Caixa</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black font-mono text-[#00cbd6] tracking-tight">
                    $ {activeTeam.budget.toLocaleString('pt-BR')}
                  </h3>
                  <span className={`block text-[9.5px] font-bold ${activeTeam.budget > 1500000 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeTeam.budget > 1500000 ? '● Liquidez de Transferências Alta' : '● Rigor Financeiro Recomendado'}
                  </span>
                </div>
                <p className={`text-[10px] ${s.textMuted} leading-relaxed`}>
                  Orçamento de caixa global garantido para cobrir contratos de atletas, salários semanais da comissão técnica e desenvolvimento comercial do split.
                </p>
              </div>

              {/* Fãs / Fans Support Card */}
              <div className={`p-5 rounded-xl border ${s.bgCard} shadow-sm space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${s.textMuted}`}>Engajamento de Torcida</span>
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black font-mono text-white tracking-tight">
                    {activeTeam.popularity}% Popularidade
                  </h3>
                  <span className={`block text-[9.5px] font-bold text-sky-400`}>
                    ★ Torcida Fanática Regional
                  </span>
                </div>
                <p className={`text-[10px] ${s.textMuted} leading-relaxed`}>
                  Métricas de fãs ativos que impactam diretamente a venda de camisas de split, ingressos das ligas presenciais e estabilidade de acordos com patrocinadores no longo prazo.
                </p>
              </div>

            </div>

            {/* Sede Operacional & Infraestrutura */}
            <div className={`p-5 rounded-xl border ${s.bgCard} shadow-sm space-y-4`}>
              <div className="flex items-center gap-2 border-b border-slate-200/10 dark:border-[#1e2d44]/30 pb-2.5">
                <Building2 className="w-4 h-4 text-sky-450" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Sede Operacional (Gaming House & CT)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-3.5 rounded-lg ${s.bgInnerCard} space-y-1.5`}>
                  <span className={`block text-[9px] uppercase font-bold ${s.textMuted}`}>Estrutura de Gaming House</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black font-mono text-white">Lvl {activeTeam.infrastructure?.gamingHouseLevel || 1}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx < (activeTeam.infrastructure?.gamingHouseLevel || 1) ? 'bg-amber-400' : 'bg-slate-500/30'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9.5px] text-slate-400">Infraestrutura residencial de alojamento para atletas e staff.</p>
                </div>

                <div className={`p-3.5 rounded-lg ${s.bgInnerCard} space-y-1.5`}>
                  <span className={`block text-[9px] uppercase font-bold ${s.textMuted}`}>Centro de Treinamento (CT)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black font-mono text-white">Lvl {activeTeam.infrastructure?.trainingCenterLevel || 1}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx < (activeTeam.infrastructure?.trainingCenterLevel || 1) ? 'bg-[#00cbd6]' : 'bg-slate-500/30'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9.5px] text-slate-400">Salas de scrims dedicadas, simulação tecnológica e hardware.</p>
                </div>
              </div>

              <p className={`text-[10px] ${s.textMuted} leading-relaxed`}>
                O complexo abriga o corpo diretivo do clube com assessoria de mídia. O nível estrutural garante bônus de desenvolvimento semanal nos treinos táticos e mecânicos e reduz a taxa de fadiga de atletas titulares.
              </p>
            </div>

            {/* Patrocinador Principal Card */}
            <div className={`p-5 rounded-xl border ${s.bgCard} shadow-sm space-y-3.5`}>
              <div className="flex items-center justify-between border-b border-slate-200/10 dark:border-[#1e2d44]/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Patrocinador Principal Ativo</h4>
                </div>
                <span className="text-[9.5px] text-emerald-400 font-extrabold uppercase">Contrato Ativo</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-550/10 border border-slate-205/10 flex items-center justify-center text-white/95 font-bold text-center text-[10px] break-words uppercase p-1">
                  {sponsorName.substring(0, 5)}
                </div>
                <div className="flex-1 space-y-1">
                  <h5 className="text-xs font-black text-white uppercase">{sponsorName}</h5>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-[8px] text-slate-400 block tracking-wide uppercase">Rendimento Semanal</span>
                      <span className="text-emerald-400 font-extrabold">$ {sponsorIncome.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block tracking-wide uppercase">Bônus de Assinatura</span>
                      <span className="text-emerald-400/90 font-extrabold">$ {sponsorBonus.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Títulos e Vitrine de Conquistas */}
            <div className={`p-5 rounded-xl border ${s.bgCard} shadow-sm space-y-3`}>
              <div className="flex items-center gap-2 border-b border-slate-200/10 dark:border-[#1e2d44]/30 pb-2.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Histórico de Conquistas & Títulos</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {teamTitles.map((title, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg flex items-center gap-2.5 font-bold text-xs uppercase ${s.bgInnerCard} border-l-2 border-yellow-405/80 text-slate-205`}
                  >
                    <span className="text-slate-300 tracking-wide text-[10.5px]">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Block: Players list split (Starting lineup and substitutes) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className={`p-5 rounded-xl border ${s.bgCard} shadow-lg space-y-5 flex flex-col`}>
              <div className="flex items-center gap-2 border-b border-slate-200/10 dark:border-[#1e2d44]/30 pb-3">
                <Users className="w-4.5 h-4.5 text-sky-450" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Jogadores e Elenco Ativo ({activeTeam.roster.length + activeTeam.substitutes.length})
                </h4>
              </div>

              {/* Titulares Section */}
              <div className="space-y-3">
                <span className="block text-[9.5px] uppercase font-bold text-sky-400 tracking-widest">
                  🛡️ Titulares Primários (Starting Lineup)
                </span>
                <div className="space-y-2">
                  {activeTeam.roster.map((player) => {
                    const posColors: { [key: string]: string } = {
                      TOP: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                      JUG: 'text-green-400 bg-green-500/10 border-green-500/20',
                      MID: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                      ADC: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                      SUP: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                    };
                    const badgeClass = posColors[player.position] || 'text-slate-400 bg-slate-500/10';

                    return (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${s.bgInnerCard} ${s.borderMuted} hover:border-sky-400/50 group`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-10 text-center text-[9px] font-black uppercase tracking-wider py-1 px-1.5 rounded-md border ${badgeClass}`}>
                            {player.position}
                          </span>
                          <div className="truncate">
                            <h5 className="text-[11px] font-black text-white hover:text-sky-400 transition-colors uppercase truncate">
                              {player.name}
                            </h5>
                            <p className="text-[8px] text-slate-400 mt-0.5 font-mono">
                              Idade: {player.age} anos • Potencial: {player.potential}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[11px] font-mono font-extrabold text-[#00cbd6] block">OVR {player.overallRating}</span>
                          </div>
                          {onSelectPlayer && (
                            <button
                              id={`select-player-btn-${player.id}`}
                              onClick={() => onSelectPlayer(player.id)}
                              className="text-[8.5px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 duration-150 px-2 py-1 rounded cursor-pointer"
                            >
                              Ver Atleta
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Substitutes Section */}
              <div className="space-y-3 pt-2">
                <span className="block text-[9.5px] uppercase font-bold text-slate-450 tracking-widest border-t border-slate-200/10 dark:border-[#1e2d44]/30 pt-3">
                  📋 Reservas & Categoria de Base (Substitutes)
                </span>
                
                {activeTeam.substitutes && activeTeam.substitutes.length > 0 ? (
                  <div className="space-y-2">
                    {activeTeam.substitutes.map((player) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border ${s.bgInnerCard} ${s.borderMuted}`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-10 text-center text-[9px] font-bold uppercase py-0.5 px-1 bg-slate-500/10 border border-slate-500/20 text-slate-300 rounded">
                            {player.position}
                          </span>
                          <div className="truncate">
                            <h5 className="text-[11px] font-extrabold text-slate-200 uppercase truncate">
                              {player.name}
                            </h5>
                            <p className="text-[8px] text-slate-400 mt-0.5 font-mono">
                              Idade: {player.age} anos • Potencial: {player.potential}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-300">OVR {player.overallRating}</span>
                          {onSelectPlayer && (
                            <button
                              onClick={() => onSelectPlayer(player.id)}
                              className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 bg-slate-500/10 hover:bg-slate-500/20 duration-150 px-2 py-1 rounded cursor-pointer"
                            >
                              Ver Atleta
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">Nenhum jogador reserva contratado no split principal.</p>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    );
  }

  return null;
}

// ==========================================
// 4. ESCRITÓRIO TAB (Office Panel)
// ==========================================
interface EscritorioTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
}

export function EscritorioTab({ gameState, onUpdateGameState, triggerNotification }: EscritorioTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  // Initialize all dynamic fields immediately
  if (playerTeam.creditScore === undefined) playerTeam.creditScore = 720;
  if (!playerTeam.loans) playerTeam.loans = [];
  if (!playerTeam.investments) {
    playerTeam.investments = { fixedIncome: 0, sportsFund: 0, sharesRivals: 0, advancedSponsorWeeks: 0, advancedSponsorBudget: 0 };
  }
  if (!playerTeam.installmentPlans) playerTeam.installmentPlans = [];
  if (!playerTeam.vistasAwaiting) playerTeam.vistasAwaiting = [];
  if (playerTeam.poachingPenaltiesWeeks === undefined) playerTeam.poachingPenaltiesWeeks = 0;
  if (playerTeam.jerseyPrice === undefined) playerTeam.jerseyPrice = 69;
  if (playerTeam.ticketPrice === undefined) playerTeam.ticketPrice = 25;

  // Sync Pricing inputs
  const [jerseyPrice, setJerseyPrice] = useState(playerTeam.jerseyPrice);
  const [ticketPrice, setTicketPrice] = useState(playerTeam.ticketPrice);

  // New States for Escritório Updates
  const [visaNotifConfig, setVisaNotifConfig] = useState({
    enablePushAlerts: true,
    weeksAdvance: 1,
    notifyOnlyImports: true,
    emailDigest: false
  });

  const [tickingTimer, setTickingTimer] = useState(259); // 4 minutes 19 seconds ticking
  // Active countdown timer simulation for League Compliance Audit
  useEffect(() => {
    const interval = setInterval(() => {
      setTickingTimer((prev) => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  // Historic list for visa processed applicants (last 5 candidates)
  const [visaHistoryList, setVisaHistoryList] = useState([
    { name: 'Reaper', nationality: 'Sul-Coreano', type: 'EB-1', cost: 35000, waitWeeks: 1, approvedWeek: 2 },
    { name: 'Chae', nationality: 'Sul-Coreano', type: 'P-1', cost: 5000, waitWeeks: 3, approvedWeek: 3 },
    { name: 'Sky', nationality: 'Sul-Coreano', type: 'P-1', cost: 5000, waitWeeks: 3, approvedWeek: 4 },
    { name: 'Nova', nationality: 'Norte-Americano', type: 'EB-1', cost: 35000, waitWeeks: 1, approvedWeek: 5 },
    { name: 'Loki', nationality: 'Sul-Coreano', type: 'P-1', cost: 5000, waitWeeks: 3, approvedWeek: 6 },
  ]);

  // Track coordinates and active hovered states for interactive graphics
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [flowTooltip, setFlowTooltip] = useState<'inflow' | 'outflow' | null>(null);
  const [visaSortOrder, setVisaSortOrder] = useState<'expiry_asc' | 'expiry_desc'>('expiry_asc');

  const basePlayerPayrollWeekly = [...playerTeam.roster, ...playerTeam.substitutes].reduce((acc, p) => acc + p.salary / 24, 0);

  // Weekly payroll values over split for Salary Cap Line Monitor
  const [weeklyPayrollHistory, setWeeklyPayrollHistory] = useState([
    22000, // Week 1
    38000, // Week 2
    45000, // Week 3
    61000, // Week 4
    Math.round(basePlayerPayrollWeekly * 0.85), // Week 5
    Math.round(basePlayerPayrollWeekly * 0.95), // Week 6
    Math.round(basePlayerPayrollWeekly), // Week 7 (Current)
    Math.round(basePlayerPayrollWeekly), // Week 8 (Projection)
    Math.round(basePlayerPayrollWeekly), // Week 9
    Math.round(basePlayerPayrollWeekly), // Week 10
  ]);

  const handlePriceUpdate = (jersey: number, ticket: number) => {
    playerTeam.jerseyPrice = jersey;
    playerTeam.ticketPrice = ticket;
    onUpdateGameState({ ...gameState });
  };

  // State for Investments inputs
  const [fixedIncomeInput, setFixedIncomeInput] = useState<number>(10000);
  const [sportsFundInput, setSportsFundInput] = useState<number>(10000);
  const [sharesInput, setSharesInput] = useState<number>(10000);

  // Active Loans input state
  const [localPitchAnswer, setLocalPitchAnswer] = useState('');
  const [lastPitchTime, setLastPitchTime] = useState<number>(0);

  // Helper functions to safeguard types and write state
  const saveState = (updatedTeamState: Team) => {
    const nextTeams = teams.map(t => (t.id === playerTeamId ? { ...updatedTeamState } : t));
    onUpdateGameState({ ...gameState, teams: nextTeams });
  };

  // Finance Status variables
  const budget = playerTeam.budget;
  let budgetColor = 'text-green-400 border-green-500/20 bg-green-500/5';
  let budgetStatusLabel = 'Saúde Financeira Excelente';
  if (budget < 100000 && budget >= 0) {
    budgetColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    budgetStatusLabel = 'Alerta: Caixa Sob Pressão';
  } else if (budget < 0) {
    budgetColor = 'text-red-400 border-red-500/20 bg-red-500/5';
    budgetStatusLabel = 'Dívida / Cheque Especial Atormentador';
  }

  // Calculate detailed week sheet values matching advanceGameWeek algorithm
  const sponsorsInflow = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
  const merchSalesAmount = Math.round(playerTeam.popularity * jerseyPrice * 18);
  const ticketsSalesAmount = Math.round(playerTeam.popularity * ticketPrice * 22);
  const totalEntries = sponsorsInflow + merchSalesAmount + ticketsSalesAmount;

  const infrastructureCostsExpenses = (playerTeam.infrastructure.gamingHouseLevel * 8000) + 
                                       (playerTeam.infrastructure.trainingCenterLevel * 6000) +
                                       (playerTeam.infrastructure.mediaTeamLevel * 4000);
  const hiredStaffCostsWeekly = gameState.availableStaff.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0);
  
  // Calculate special spending outflows from loans & installments
  const activeLoansWeeklyOutflow = playerTeam.loans.reduce((acc, l) => acc + Math.round(l.totalToPay / l.remainingWeeks), 0);
  const activeInstallmentsWeeklyOutflow = playerTeam.installmentPlans.reduce((acc, p) => acc + p.installmentAmount, 0);
  
  // Luxury tax check (Increased limit to $120.000)
  const isSalarCapExceeded = basePlayerPayrollWeekly > 120000;
  const luxuryTaxFine = isSalarCapExceeded ? Math.round((basePlayerPayrollWeekly - 120000) * 1.50) : 0;

  // Total weekly spending
  const totalSpending = basePlayerPayrollWeekly + infrastructureCostsExpenses + hiredStaffCostsWeekly + 
                        activeLoansWeeklyOutflow + activeInstallmentsWeeklyOutflow + luxuryTaxFine;

  const netWeeklyBalance = totalEntries - totalSpending;

  // Dynamic Interest Multiplier based on creditScore (starts at 720, lower range gets higher interest)
  const getInterestMultiplier = () => {
    const score = playerTeam.creditScore || 720;
    return Math.max(0.65, Math.min(1.6, 1 - (score - 720) / 1000));
  };

  const personalLoanRate = Math.round(7 * getInterestMultiplier());
  const corporateLoanRate = Math.round(14 * getInterestMultiplier());
  const riskLoanRate = Math.round(30 * getInterestMultiplier());

  // Board Room action handler
  const pitchBoardRoom = (action: string) => {
    if (Date.now() - lastPitchTime < 2000) return;
    setLastPitchTime(Date.now());

    let trustChange = 0;
    let desc = '';
    let isAccepted = false;

    if (action === 'budget') {
      if (playerTeam.boardTrust >= 80) {
        isAccepted = true;
        playerTeam.budget += 60000;
        trustChange = -15;
        desc = "Aprovado! Injetamos +$60.000 em seu caixa de transferências. Porém, a pressão por resultados imediatos subiu drasticamente (-15% Confiança).";
      } else {
        desc = "Negado! A diretoria julga que você não tem crédito político suficiente para pedir novos aportes orçamentários.";
      }
    } else if (action === 'patience') {
      if (playerTeam.boardTrust < 50) {
        isAccepted = true;
        playerTeam.boardTrust = 60;
        desc = "Ok. Reunimos o conselho técnico e decidimos relevar a fase do time. Concedemos paciência política temporária (Confiança ajustada para 60%).";
      } else {
        desc = "Sua confiança já está estável. Concentre suas atenções em vencer o Rift CBLOL!";
      }
    } else if (action === 'youth_grant') {
      if (playerTeam.popularity >= 75) {
        isAccepted = true;
        playerTeam.budget += 30000;
        trustChange = -10;
        desc = "Apoiado! Devido ao alto retorno de mídia de torcida, liberamos uma subvenção de incentivo à base de +$30.000 (-10% Confiança).";
      } else {
        desc = "Incentivo bloqueado! O clube precisa de maior base de torcedores e popularidade de mídia antes de expandir financiamentos de talentos.";
      }
    }

    if (isAccepted) {
      playerTeam.boardTrust = Math.max(1, Math.min(100, playerTeam.boardTrust + trustChange));
      saveState(playerTeam);
      triggerNotification("🎙️ Board Room Compromisso!", desc);
    }
    setLocalPitchAnswer(desc);
  };

  // Loans borrowing handler
  const borrowCapital = (type: 'Pessoal' | 'Empresarial' | 'Risco', amount: number, weeks: number, rate: number) => {
    if (playerTeam.loans && playerTeam.loans.length >= 3) {
      triggerNotification("🏦 Banco Negado!", "Você já possui o limite máximo de 3 empréstimos simultâneos em andamento.");
      return;
    }
    if ((playerTeam.creditScore || 720) < 350 && type !== 'Risco') {
      triggerNotification("🏦 Crédito Recusado!", "Seu score de crédito está muito baixo. O banco só aprova empréstimos de Risco sob juros abusivos.");
      return;
    }

    const interestAmount = Math.round(amount * (rate / 100));
    const totalToPay = amount + interestAmount;

    const newLoan = {
      id: 'loan_' + Math.random().toString(36).substr(2, 9),
      type,
      amount,
      remainingWeeks: weeks,
      interestRate: rate,
      totalToPay
    };

    playerTeam.budget += amount;
    playerTeam.loans = [...(playerTeam.loans || []), newLoan];
    playerTeam.creditScore = Math.max(100, (playerTeam.creditScore || 720) - 25); // taking debt reduces score slightly
    
    saveState(playerTeam);
    triggerNotification("🏦 Empréstimo Aprovado!", `Injetamos +$${amount.toLocaleString()} em caixa. Você amortizará em parcelas semanais.`);
  };

  // Pay Off loan immediately
  const payoffLoan = (loanId: string) => {
    const loan = playerTeam.loans?.find(l => l.id === loanId);
    if (!loan) return;

    if (playerTeam.budget < loan.totalToPay) {
      triggerNotification("💸 Saldo Insuficiente!", `Você precisa de $${loan.totalToPay.toLocaleString()} em caixa para quitar este compromisso.`);
      return;
    }

    playerTeam.budget -= loan.totalToPay;
    playerTeam.loans = playerTeam.loans?.filter(l => l.id !== loanId) || [];
    playerTeam.creditScore = Math.min(1000, (playerTeam.creditScore || 720) + 35); // pay back early yields higher score!

    saveState(playerTeam);
    triggerNotification("🏦 Dívida Removida!", `Você quitou antecipadamente o empréstimo ${loan.type}. Seu score de crédito subiu!`);
  };

  // Investments methods
  const processInvestment = (field: 'fixedIncome' | 'sportsFund' | 'sharesRivals', action: 'deposit' | 'withdraw', amount: number) => {
    if (action === 'deposit') {
      if (playerTeam.budget < amount) {
        triggerNotification("💸 Erro", "Saldo indisponível no caixa para efetuar este aporte.");
        return;
      }
      playerTeam.budget -= amount;
      playerTeam.investments[field] += amount;
      
      saveState(playerTeam);
      triggerNotification("💼 Investimento Ativo", `Fundo de ${field === 'fixedIncome' ? 'Renda Fixa' : field === 'sportsFund' ? 'Fundo Esportivo' : 'Ações de Rivais'} atualizado.`);
    } else {
      const activeVal = playerTeam.investments[field];
      if (activeVal < amount) {
        triggerNotification("💸 Erro", "Valor excede o total custodiado nesta modalidade.");
        return;
      }
      playerTeam.budget += amount;
      playerTeam.investments[field] -= amount;

      saveState(playerTeam);
      triggerNotification("💼 Saque Efetuado", `Retirados $${amount.toLocaleString()} de volta para o caixa principal.`);
    }
  };

  // Request advanced sponsorship
  const receiveAdvancedSponsor = () => {
    if (playerTeam.investments.advancedSponsorWeeks > 0) {
      triggerNotification("💼 Operação Negada", "Você já possui uma antecipação de patrocínio ativa.");
      return;
    }
    const inflowAmt = 120000;
    playerTeam.budget += inflowAmt;
    playerTeam.investments.advancedSponsorWeeks = 28; // 2 splits
    playerTeam.investments.advancedSponsorBudget = inflowAmt;
    playerTeam.creditScore = Math.max(100, (playerTeam.creditScore || 720) - 30);

    saveState(playerTeam);
    triggerNotification("🤝 Patrocínio Bloqueado", `Você antecipou $${inflowAmt.toLocaleString()} imediatos. Uma taxa de $6.500 semanais será amortizada por 28 semanas.`);
  };

  // Visa application initiator
  const applyImportVisa = (player: Player, type: 'P-1' | 'EB-1') => {
    const cost = type === 'P-1' ? 5000 : 35000;
    const weeks = type === 'P-1' ? 3 : 1;

    if (playerTeam.budget < cost) {
      triggerNotification("✈️ Caixa Baixo", "Orçamento insuficiente para pagar as taxas governamentais do visto.");
      return;
    }

    if (type === 'EB-1' && player.overallRating < 84) {
      triggerNotification("✈️ Requisito Negado", "O visto EB-1 de Habilidade Extraordinária exige atletas de OVR igual ou maior que 84.");
      return;
    }

    // Deduct cost & push waiting list
    playerTeam.budget -= cost;
    playerTeam.vistasAwaiting = [
      ...(playerTeam.vistasAwaiting || []),
      {
        id: 'visa_' + Math.random().toString(36).substr(2, 9),
        playerId: player.id,
        name: player.name,
        type,
        weeksRemaining: weeks,
        hasDocumentationRequest: false
      }
    ];

    saveState(playerTeam);
    triggerNotification("✈️ Processo Submetido", `A petição do visto ${type} para o atleta ${player.name} foi protocolada no consulado.`);
  };

  // Poaching process penalty simulator
  const filePoachProsecution = () => {
    playerTeam.budget = Math.max(0, playerTeam.budget - 45000);
    playerTeam.boardTrust = Math.max(1, playerTeam.boardTrust - 20);
    playerTeam.poachingPenaltiesWeeks = 2; // block recruits for 2 rounds

    saveState(playerTeam);
    triggerNotification("⚖️ Punição de Aliciamento", "Denúncia acatada! A liga processou seu clube: perda de 20% de Confiança, multa de $45.000 e suspensão.");
  };

  // Installment purchase options for high-market values players
  const configureInstallmentForPlayer = (name: string, value: number) => {
    if (playerTeam.installmentPlans.length >= 2) {
      triggerNotification("📜 Limite Atingido!", "Você já acumula o limite de 2 parcelamentos ativos de contratação.");
      return;
    }
    const totalToPay = Math.round(value * 1.35); // 35% compound interest for installments
    const installmentAmount = Math.round(totalToPay / 4); // paid over 4 weeks
    const newPlan = {
      id: 'inst_' + Math.random().toString(36).substr(2, 9),
      playerName: name,
      totalAmount: totalToPay,
      remainingWeeks: 4,
      installmentAmount
    };
    playerTeam.installmentPlans = [...playerTeam.installmentPlans, newPlan];
    saveState(playerTeam);
    triggerNotification("📜 Financiamento!", `Parcelamento aprovado para contratar ${name}: 4 parcelas semanais de $${installmentAmount.toLocaleString()}`);
  };

  // Filter imports lacking visa approval
  const importsEligibleForVisa = [...playerTeam.roster, ...playerTeam.substitutes].filter(
    p => p.isImported && !p.visaApproved && !playerTeam.vistasAwaiting?.some(app => app.playerId === p.id)
  );

  // Deriving the list of all visas for imported players in our club
  const allVisas = [
    // 1. Approved foreign players
    ...[...playerTeam.roster, ...playerTeam.substitutes].filter(p => p.isImported && p.visaApproved).map(p => ({
      id: p.id,
      name: p.name,
      nationality: p.nationality,
      type: p.overallRating && p.overallRating >= 84 ? 'EB-1 (Altíssimo Nível)' : 'P-1 (Atleta)',
      status: 'Concluído' as 'Concluído' | 'Pendente',
      subStatus: 'Visto Aprovado',
      expiryValue: Math.max(2, (p.contractMonths || 12)), // Months left
      expiryLabel: `${Math.max(2, (p.contractMonths || 12))} Meses`,
      isCritical: Math.max(2, (p.contractMonths || 12)) <= 3,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/20'
    })),
    // 2. Foreign players in consulate analysis
    ...(playerTeam.vistasAwaiting || []).map(app => {
      const matchP = [...playerTeam.roster, ...playerTeam.substitutes].find(p => p.id === app.playerId);
      return {
        id: app.id,
        name: app.name,
        nationality: matchP?.nationality || 'Estrangeiro',
        type: app.type,
        status: 'Pendente' as 'Concluído' | 'Pendente',
        subStatus: 'Em Análise no Consulado',
        expiryValue: (app.weeksRemaining || 1) / 4.3, // Approximate months left for sorting
        expiryLabel: `${app.weeksRemaining === undefined ? 1 : app.weeksRemaining} Semanas`,
        isCritical: true,
        iconColor: 'text-yellow-500 animate-pulse',
        bgColor: 'bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/10 hover:border-yellow-500/20'
      };
    }),
    // 3. Foreign players without visa and not applied
    ...[...playerTeam.roster, ...playerTeam.substitutes].filter(p => p.isImported && !p.visaApproved && !playerTeam.vistasAwaiting?.some(app => app.playerId === p.id)).map(p => ({
      id: p.id,
      name: p.name,
      nationality: p.nationality,
      type: p.overallRating && p.overallRating >= 84 ? 'EB-1 Necessário' : 'P-1 Necessário',
      status: 'Pendente' as 'Concluído' | 'Pendente',
      subStatus: 'Sem Visto Ativo',
      expiryValue: 0,
      expiryLabel: '🚨 IMEDIATO / EXPIRADO',
      isCritical: true,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20'
    }))
  ];

  const sortedVisas = [...allVisas].sort((a, b) => {
    if (visaSortOrder === 'expiry_asc') {
      return a.expiryValue - b.expiryValue;
    } else {
      return b.expiryValue - a.expiryValue;
    }
  });

  return (
    <div className="space-y-6 select-none font-sans text-slate-300">
      
      {/* SECTION 1: FINANCIAL GENERAL DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Cash balance display */}
        <div className={`p-5 rounded-2xl border ${budgetColor} shadow-md space-y-2`}>
          <div className="flex justify-between items-center text-xs uppercase font-extrabold tracking-wider opacity-90">
            <span>Caixa de Operações</span>
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-3xl font-black font-mono tracking-tighter">
            $ {budget.toLocaleString('pt-BR')}
          </h2>
          <div className="text-[10px] uppercase font-black tracking-widest leading-loose">
            ★ {budgetStatusLabel}
          </div>
        </div>

        {/* Teto salarial */}
        <div 
          id="financial-status-indicator"
          className="group relative p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-md space-y-2.5 hover:border-sky-500/40 transition-all duration-350 cursor-pointer"
        >
          <div className="flex justify-between items-center text-xs uppercase font-extrabold tracking-wider text-slate-400">
            <span>Orçamento Salarial Atletas</span>
            <Scale className="w-4.5 h-4.5 text-sky-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-mono text-white tracking-tight">
              $ {Math.round(basePlayerPayrollWeekly).toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/ semana</span>
            </h2>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isSalarCapExceeded ? 'bg-red-500' : 'bg-[#00cbd6]'}`} 
                style={{ width: `${Math.min(100, (basePlayerPayrollWeekly / 120000) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <span>Teto Liga: $120.000</span>
              <span className={isSalarCapExceeded ? 'text-red-400 animate-pulse' : 'text-[#00cbd6]'}>
                {isSalarCapExceeded ? 'Excedido (Fins Taxa)' : 'Em Compliance'}
              </span>
            </div>
          </div>

          {/* Interactive Calculator Tooltip */}
          <div className="absolute top-full left-0 right-0 mt-2.5 z-50 p-4 rounded-xl border border-slate-700 bg-slate-950 text-[10.5px] space-y-2.5 shadow-2xl invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <h5 className="font-bold text-sky-400 uppercase flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
              <span>🧮 Auditoria de Taxa de Luxo (Simulação)</span>
            </h5>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Folha Atletas:</span>
                <span className="text-white font-bold">$ {Math.round(basePlayerPayrollWeekly).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Teto Máximo Liga:</span>
                <span className="text-white font-bold">$ 120.000</span>
              </div>
              <div className="border-t border-slate-850 my-1.5 py-1">
                <div className="flex justify-between text-slate-400">
                  <span>Margem Excedida:</span>
                  <span className={isSalarCapExceeded ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    $ {Math.max(0, Math.round(basePlayerPayrollWeekly) - 120000).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Multa Aplicada:</span>
                  <span className="text-white">150% (1.5x)</span>
                </div>
              </div>
              <div className="border-t border-slate-850 pt-1 flex justify-between font-extrabold">
                <span className="text-red-405 uppercase">Total Taxa Devida:</span>
                <span className={luxuryTaxFine > 0 ? 'text-red-450 font-black' : 'text-emerald-400'}>
                  $ {luxuryTaxFine.toLocaleString('pt-BR')} / semana
                </span>
              </div>
            </div>
            {!isSalarCapExceeded ? (
              <p className="text-[9.5px] text-emerald-400 italic font-sans leading-normal pt-1 flex items-center gap-1">
                ✔ Em conformidade absoluta. Seu clube está economizando e mantém ótimo score de crédito!
              </p>
            ) : (
              <p className="text-[9.5px] text-red-400 italic font-sans leading-normal pt-1 bg-red-950/20 p-1.5 rounded border border-red-500/15">
                ⚠ Violação! Reduza a folha de pagamento rescindindo contratos ou vendendo atletas antes do encerramento da rodada semanal.
              </p>
            )}
          </div>
        </div>

        {/* Credit score display */}
        <div className="p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-md space-y-2">
          <div className="flex justify-between items-center text-xs uppercase font-extrabold tracking-wider text-slate-400">
            <span>Score de Crédito do Clube</span>
            <Award className="w-4.5 h-4.5 text-[#00cbd6]" />
          </div>
          <h2 className="text-2xl font-black font-mono text-white tracking-tight">
            {playerTeam.creditScore || 720} <span className="text-xs text-slate-400 font-normal">/ 1000 Pts</span>
          </h2>
          <p className="text-[10px] text-slate-400 leading-snug">
            {playerTeam.creditScore && playerTeam.creditScore >= 700 ? '🟢 Taxas de Juros reduzidas em até 35%.' : '🔴 Crédito restrito: Juros elevados.'}
          </p>
        </div>

      </div>

      {/* SECTION 2: WEEKLY BALANCE SHEET DETAILS */}
      <div className="p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-lg space-y-5">
        <div className="border-b border-sky-500/10 pb-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Balanço Financeiro Semanal do Rift</h4>
          </div>
          <div className={`text-xs font-black flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all duration-300 ${
            netWeeklyBalance >= 0 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-red-400 border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
          }`}>
            <span>Saldo Líquido Semanal:</span>
            <span className="font-mono font-black">$ {netWeeklyBalance.toLocaleString()}</span>
            {netWeeklyBalance >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingUp className="w-4 h-4 rotate-180 text-red-400" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Traditional values (not losing any functions) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-bold">
            
            {/* Inflows Section */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/45 border border-slate-900/60 leading-normal hover:border-emerald-500/10 transition-all duration-300">
              <span className="block text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest border-b border-slate-800/40 pb-2">
                ➕ Entradas Recomendadas (Weekly Inflows)
              </span>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Patrocinadores Corporativos</span>
                  <span className="text-emerald-400">+$ {sponsorsInflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Loja Oficial (Camisas Camisetas)</span>
                  <span className="text-emerald-400">+$ {merchSalesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Produtos Arena & Bilheteria</span>
                  <span className="text-emerald-400">+$ {ticketsSalesAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800/40 pt-1.5 flex justify-between text-white font-bold">
                  <span className="uppercase text-[10px]">Subtotal Entradas</span>
                  <span className="text-emerald-400 font-black">+$ {totalEntries.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Outflows Section */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/45 border border-slate-900/60 leading-normal hover:border-red-500/10 transition-all duration-300">
              <span className="block text-[10px] text-red-430 font-extrabold uppercase tracking-widest border-b border-slate-800/40 pb-2">
                ➖ Saídas Operacionais (Weekly Outflows)
              </span>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Folha Salarial Atletas</span>
                  <span className="text-red-400">-$ {Math.round(basePlayerPayrollWeekly).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Despesas CT e GH Operacional</span>
                  <span className="text-red-400">-$ {infrastructureCostsExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Salário de Staff Contratado</span>
                  <span className="text-red-400">-$ {hiredStaffCostsWeekly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Parcelas Empréstimos Ativos</span>
                  <span className="text-red-400">-$ {activeLoansWeeklyOutflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Financiamentos Internos/Luvas</span>
                  <span className="text-red-400">-$ {activeInstallmentsWeeklyOutflow.toLocaleString()}</span>
                </div>
                {isSalarCapExceeded && (
                  <div className="flex justify-between text-red-300 bg-red-950/30 px-1 py-0.5 rounded border border-red-500/10">
                    <span>🚨 Taxa Luxo Excedente</span>
                    <span className="text-red-400 font-bold">-$ {luxuryTaxFine.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-800/40 pt-1.5 flex justify-between text-white font-bold">
                  <span className="uppercase text-[10px]">Subtotal Saídas</span>
                  <span className="text-red-400 font-black">-$ {totalSpending.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Animated beautiful comparative bar visual chart */}
          <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-xl bg-slate-950/30 border border-slate-900/60 h-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gráfico de Caixa Ativo</span>
              <span className="text-[11.5px] font-black text-white block uppercase">Balanço: Entradas vs Saídas</span>
            </div>

            {/* Custom SVG Dual Bar Chart */}
            <div className="relative my-3 h-28 flex justify-center items-end bg-slate-950/25 rounded-lg border border-slate-900/30 p-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 320 120" fill="none">
                {/* Background Grid Lines */}
                <line x1="10" y1="20" x2="310" y2="20" stroke="#1e2d44" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="10" y1="60" x2="310" y2="60" stroke="#1e2d44" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="10" y1="100" x2="310" y2="100" stroke="#1e2d44" strokeWidth="1" />

                {/* Calculate Bar heights */}
                {(() => {
                  const maxVal = Math.max(120000, totalEntries, totalSpending);
                  const hIn = Math.round((totalEntries / maxVal) * 80);
                  const hOut = Math.round((totalSpending / maxVal) * 80);
                  return (
                    <>
                      {/* Bar 1: Inflow */}
                      <rect 
                        x="75" 
                        y={100 - hIn} 
                        width="45" 
                        height={hIn} 
                        rx="5" 
                        fill="url(#emerald-gradient)" 
                        className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:stroke-emerald-400 hover:stroke-1"
                        onMouseEnter={() => setFlowTooltip('inflow')}
                        onMouseLeave={() => setFlowTooltip(null)}
                      />
                      {/* Bar 2: Outflow */}
                      <rect 
                        x="195" 
                        y={100 - hOut} 
                        width="45" 
                        height={hOut} 
                        rx="5" 
                        fill="url(#rose-gradient)" 
                        className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:stroke-rose-400 hover:stroke-1"
                        onMouseEnter={() => setFlowTooltip('outflow')}
                        onMouseLeave={() => setFlowTooltip(null)}
                      />

                      {/* Text value inside bar area if high enough */}
                      {hIn > 22 && (
                        <text x="97" y={105 - hIn/2} textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="900" fontFamily="monospace">IN</text>
                      )}
                      {hOut > 22 && (
                        <text x="217" y={105 - hOut/2} textAnchor="middle" fill="#991b1b" fontSize="9" fontWeight="900" fontFamily="monospace">OUT</text>
                      )}

                      {/* Gradients declarations */}
                      <defs>
                        <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="rose-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#e11d48" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                    </>
                  );
                })()}
              </svg>

              {/* Hover Tooltip display context */}
              <div className="absolute inset-x-2 bottom-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded text-[9px] font-mono flex justify-between items-center h-7 select-none transition-all">
                {flowTooltip === 'inflow' ? (
                  <span className="text-emerald-400 font-bold uppercase w-full text-center">💸 Total Faturado: $ {totalEntries.toLocaleString('pt-BR')}</span>
                ) : flowTooltip === 'outflow' ? (
                  <span className="text-rose-400 font-bold uppercase w-full text-center">🛡️ Despesas Totais: $ {totalSpending.toLocaleString('pt-BR')}</span>
                ) : (
                  <span className="text-slate-400 w-full text-center">Passe o mouse nas barras para inspecionar</span>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              Investimentos em licenciamento e preços otimizados da loja garantem o crescimento de receitas na vitória!
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2.5: SALARY CAP DYNAMIC LINE MONITOR CARD */}
      <div id="salary-cap-monitor" className="p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-[#1e2d44]/55 pb-2">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-[#00cbd6]" />
              Monitor Dinâmico de Teto Salarial (Salary Cap Match)
            </h4>
            <p className="text-[10px] text-slate-400">Histórico de folha de pagamento semanal vs limite da liga ($120.000) no Split</p>
          </div>
          <span className="text-[9.5px] uppercase font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-extrabold">
            Parâmetro: Split Atual Rift
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Active SVG Line Chart render */}
          <div className="lg:col-span-8 bg-slate-950/35 rounded-xl border border-slate-900 p-3 relative hover:border-sky-500/10 transition-all duration-300">
            
            <svg className="w-full h-44" viewBox="0 0 500 160">
              <defs>
                {/* Horizontal Background Gradients */}
                <linearGradient id="payroll-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00cbd6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00cbd6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="alert-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y Axis markings */}
              <line x1="50" y1="20" x2="50" y2="140" stroke="#1e2d44" strokeWidth="1" />
              <line x1="50" y1="140" x2="480" y2="140" stroke="#1e2d44" strokeWidth="1" />

              <text x="45" y="25" textAnchor="end" fill="#475569" fontSize="8" fontWeight="bold">180k</text>
              <text x="45" y="60" textAnchor="end" fill="#475569" fontSize="8" fontWeight="bold">120k</text>
              <text x="45" y="100" textAnchor="end" fill="#475569" fontSize="8" fontWeight="bold">60k</text>
              <text x="45" y="140" textAnchor="end" fill="#475569" fontSize="8" fontWeight="bold">0</text>

              {/* Week labels on the X Axis */}
              {weeklyPayrollHistory.map((_, idx) => (
                <text 
                  key={idx} 
                  x={50 + (idx * 410 / 9)} 
                  y="152" 
                  textAnchor="middle" 
                  fill={hoveredWeek === idx ? '#00cbd6' : '#475569'} 
                  fontSize="8.5" 
                  fontWeight="bold"
                >
                  S{idx + 1}
                </text>
              ))}

              {/* Background Limit Warning Overlay (above $120k threshold) */}
              <rect x="50" y="20" width="430" height="40" fill="url(#alert-glow)" opacity="0.4" />

              {/* Salary Cap Threshold horizontal ceiling line ($120.000) */}
              {/* mapY(120k) evaluates to height 60 */}
              <line 
                x1="50" 
                y1="60" 
                x2="480" 
                y2="60" 
                stroke="#ef4444" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                className="opacity-80"
              />
              <text x="475" y="55" textAnchor="end" fill="#f43f5e" fontSize="8" fontWeight="black" letterSpacing="0.05em">TETO REGULATÓRIO ($120.000)</text>

              {/* Shaded Area under the curve */}
              <polygon 
                points={`50,140 ` + weeklyPayrollHistory.map((val, idx) => `${50 + (idx * 410 / 9)},${140 - (val / 180000) * 120}`).join(' ') + ` 460,140`}
                fill="url(#payroll-glow)"
              />

              {/* Payroll line plot path */}
              <path 
                d={weeklyPayrollHistory.map((val, idx) => {
                  const x = 50 + (idx * 410 / 9);
                  const y = 140 - (val / 180000) * 120;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none" 
                stroke="#00cbd6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dot vertices */}
              {weeklyPayrollHistory.map((val, idx) => {
                const x = 50 + (idx * 410 / 9);
                const y = 140 - (val / 180000) * 120;
                const isViolation = val > 120000;
                return (
                  <g key={idx} className="cursor-pointer group/node"
                     onMouseEnter={() => setHoveredWeek(idx)}
                     onMouseLeave={() => setHoveredWeek(null)}>
                    
                    {/* Pulsing ring for violation */}
                    {isViolation && (
                      <circle cx={x} cy={y} r="8" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" opacity="0.6"/>
                    )}

                    <circle 
                      cx={x} 
                      cy={y} 
                      r={hoveredWeek === idx ? "5.5" : "4"} 
                      fill={isViolation ? "#f43f5e" : "#0f172a"} 
                      stroke={isViolation ? "#ef4444" : "#00cbd6"} 
                      strokeWidth="2.2" 
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* In-chart Tooltip Disclosure */}
            {hoveredWeek !== null && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-[10px] font-mono shadow-xl flex gap-3 text-white pointer-events-none select-none z-10 transition-all">
                <span>Semana {hoveredWeek + 1}:</span>
                <span className="font-extrabold text-[#00cbd6]">$ {weeklyPayrollHistory[hoveredWeek].toLocaleString('pt-BR')}</span>
                <span className={weeklyPayrollHistory[hoveredWeek] > 120000 ? "text-red-400 font-extrabold" : "text-emerald-400 font-extrabold"}>
                  {weeklyPayrollHistory[hoveredWeek] > 120000 ? "🚨 TETO EXCEDIDO (+Taxa)" : "✔ COMPLIANT"}
                </span>
              </div>
            )}

          </div>

          {/* Quick Stats sidebar mapping */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/20 border border-[#1e2d44]/55 space-y-3">
            <span className="text-[10px] font-black uppercase text-[#00cbd6] block">Análise de Riscos Regulatórios</span>
            <div className="space-y-2 text-[10.5px]">
              
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 flex justify-between items-center text-slate-300">
                <span>Maior Gasto do Split:</span>
                <span className="text-white font-mono font-bold font-mono text-red-400">
                  $ {Math.max(...weeklyPayrollHistory).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 flex justify-between items-center text-slate-300">
                <span>Margem de Segurança:</span>
                <span className={isSalarCapExceeded ? "text-red-400 font-black font-mono" : "text-emerald-400 font-black font-mono"}>
                  {isSalarCapExceeded 
                    ? `-$ ${(basePlayerPayrollWeekly - 120000).toLocaleString()} (Excesso)` 
                    : `$ ${(120000 - basePlayerPayrollWeekly).toLocaleString()} Livres`
                  }
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 flex justify-between items-center text-slate-300">
                <span>Taxa Emergencial Split:</span>
                <span className="text-white font-mono font-bold text-yellow-500">
                  1.5x Multiplicador
                </span>
              </div>

            </div>

            <p className="text-[9.5px] text-slate-400 leading-normal">
              A auditoria da liga compila sua folha todas as sextas-feiras antes da rodada. Lembre-se: folha salarial é dividida em 24 parcelas equivalentes no split.
            </p>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: BANKING AND INVESTMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BANCO E CRÉDITO CENTER */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-md space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#1e2d44] pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs uppercase font-extrabold text-white">Central de Crédito Bancário Rivals</h3>
              </div>
              <span className="text-[10px] bg-indigo-505/10 text-indigo-400 font-extrabold px-2.5 py-0.5 rounded border border-indigo-400/20">
                Score Avaliado: {playerTeam.creditScore || 720}
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-snug">
              Nosso sistema avalia constantemente seu score de crédito baseado no histórico de empréstimos, torcedores ativos, receitas comerciais e desempenho competitivo. Score alto reduz drasticamente as taxas de juros!
            </p>

            {/* Quick Borrow Buttons */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
              
              <button 
                onClick={() => borrowCapital('Pessoal', 30000, 4, personalLoanRate)}
                className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 hover:bg-slate-800 text-slate-200 transition duration-200 uppercase flex flex-col justify-between h-28 cursor-pointer group"
              >
                <span className="font-extrabold group-hover:text-indigo-400">Pessoal</span>
                <span className="text-[12px] font-black font-mono text-white">$ 30k</span>
                <span className="text-[8px] text-slate-400 block font-bold leading-normal">T: 4 Sem • {personalLoanRate}% J</span>
              </button>

              <button 
                onClick={() => borrowCapital('Empresarial', 120000, 10, corporateLoanRate)}
                className="p-3.5 rounded-xl border border-sky-500/10 bg-sky-500/5 hover:bg-slate-800 text-slate-200 transition duration-200 uppercase flex flex-col justify-between h-28 cursor-pointer group"
              >
                <span className="font-extrabold group-hover:text-sky-400">Empresa</span>
                <span className="text-[12px] font-black font-mono text-white">$ 120k</span>
                <span className="text-[8px] text-slate-400 block font-bold leading-normal">T: 10 Sem • {corporateLoanRate}% J</span>
              </button>

              <button 
                onClick={() => borrowCapital('Risco', 250000, 6, riskLoanRate)}
                className="p-3.5 rounded-xl border border-red-500/10 bg-[#2d0f19]/30 hover:bg-[#3d1525]/45 text-slate-200 transition duration-200 uppercase flex flex-col justify-between h-28 cursor-pointer group"
              >
                <span className="font-extrabold group-hover:text-red-400">Contrato Risco</span>
                <span className="text-[12px] font-black font-mono text-white">$ 250k</span>
                <span className="text-[8px] text-red-300 block font-bold leading-normal">T: 6 Sem • {riskLoanRate}% J</span>
              </button>

            </div>
          </div>

          {/* Active loans table listing */}
          <div className="space-y-2.5 pt-3 border-t border-[#1e2d44]/50">
            <h4 className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold">Seus Empréstimos Ativos ({playerTeam.loans.length || 0}/3)</h4>
            
            {playerTeam.loans.length > 0 ? (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {playerTeam.loans.map((loan) => (
                  <div key={loan.id} className="p-2.5 rounded-lg bg-slate-950/45 border border-[#1e2d44]/55 flex justify-between items-center text-[10.5px]">
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Empréstimo {loan.type}</span>
                        <span className="text-[8.5px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded font-mono font-normal">Restam {loan.remainingWeeks} Sem</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Custódia Restante para Amortizar: <strong className="text-slate-200">$ {loan.totalToPay.toLocaleString()}</strong></p>
                    </div>
                    <button
                      onClick={() => payoffLoan(loan.id)}
                      className="px-2.5 py-1 text-[8.5px] font-extrabold bg-indigo-500 hover:bg-indigo-600 text-white rounded uppercase cursor-pointer"
                    >
                      Quitar à Vista ($ {loan.totalToPay.toLocaleString()})
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">Nenhum compromisso pendente com o banco.</p>
            )}
          </div>
        </div>

        {/* PRODUTOS DE INVESTIMENTOS */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-md space-y-4">
          <div className="border-b border-[#1e2d44] pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs uppercase font-extrabold text-white">Painel de Alocação de Investimentos</h3>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Anytime Deposits</span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            
            {/* 1. Renda Fixa */}
            <div className="p-3 rounded-xl bg-slate-950/45 border border-[#1e2d44]/40 space-y-2 text-[10.5px]">
              <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                <span className="font-bold text-slate-100 flex items-center gap-1">🏦 Renda Fixa (Nenhum Risco)</span>
                <span className="text-[#00cbd6] font-mono font-black">+$ {playerTeam.investments.fixedIncome.toLocaleString()} Alocado</span>
              </div>
              <p className="text-[9.5px] text-slate-400">Nenhum risco de perda. Retorna +2% garantidos por split (creditado em frações de 0.14% semanais).</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" 
                  value={fixedIncomeInput} 
                  onChange={(e) => setFixedIncomeInput(Number(e.target.value))} 
                  className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-center text-white"
                />
                <button 
                  onClick={() => processInvestment('fixedIncome', 'deposit', fixedIncomeInput)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Depositar
                </button>
                <button 
                  onClick={() => processInvestment('fixedIncome', 'withdraw', fixedIncomeInput)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Retirar
                </button>
              </div>
            </div>

            {/* 2. Fundo Esportivo */}
            <div className="p-3 rounded-xl bg-slate-950/45 border border-[#1e2d44]/40 space-y-2 text-[10.5px]">
              <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                <span className="font-bold text-slate-100 flex items-center gap-1">🏆 Fundo Esportivo (Risco Baixo)</span>
                <span className="text-[#00cbd6] font-mono font-black">+$ {playerTeam.investments.sportsFund.toLocaleString()} Alocado</span>
              </div>
              <p className="text-[9.5px] text-slate-400">Rendimento de +5% do capital alocado pago unicamente nas semanas que sua equipe vencer partidas.</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" 
                  value={sportsFundInput} 
                  onChange={(e) => setSportsFundInput(Number(e.target.value))} 
                  className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-center text-white"
                />
                <button 
                  onClick={() => processInvestment('sportsFund', 'deposit', sportsFundInput)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Depositar
                </button>
                <button 
                  onClick={() => processInvestment('sportsFund', 'withdraw', sportsFundInput)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Retirar
                </button>
              </div>
            </div>

            {/* 3. Ações de Rivais */}
            <div className="p-3 rounded-xl bg-slate-950/45 border border-[#1e2d44]/40 space-y-2 text-[10.5px]">
              <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                <span className="font-bold text-slate-100 flex items-center gap-1">📊 Ações de Rivais (Volátil)</span>
                <span className="text-[#00cbd6] font-mono font-black">+$ {playerTeam.investments.sharesRivals.toLocaleString()} Alocado</span>
              </div>
              <p className="text-[9.5px] text-slate-400">Rentabilidade altíssima (+10% ou -5% de flutuação semanal). Caso possua mais de $40.000 investidos, sua torcida perderá apoio mensal por crise moral!</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" 
                  value={sharesInput} 
                  onChange={(e) => setSharesInput(Number(e.target.value))} 
                  className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-center text-white"
                />
                <button 
                  onClick={() => processInvestment('sharesRivals', 'deposit', sharesInput)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Depositar
                </button>
                <button 
                  onClick={() => processInvestment('sharesRivals', 'withdraw', sharesInput)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-extrabold uppercase scale-[0.9] cursor-pointer"
                >
                  Retirar
                </button>
              </div>
            </div>

            {/* 4. Patrocínio Antecipado */}
            <div className="p-3.5 rounded-xl bg-slate-950/45 border border-amber-500/20 text-[10.5px] flex justify-between items-center">
              <div>
                <h5 className="font-bold text-amber-400 flex items-center gap-1">🤝 Patrocínio Antecipado</h5>
                <p className="text-[9.2px] text-slate-400 leading-normal max-w-sm pt-0.5">Injeta $120.000 em caixa na hora, mas desconta $6.500 semanais durante 2 splits (28 semanas). Ideal para transferências rápidas!</p>
                {playerTeam.investments.advancedSponsorWeeks > 0 && (
                  <span className="text-[9px] font-mono text-red-400 font-extrabold block pt-1">⚠️ Ativo: Restam {playerTeam.investments.advancedSponsorWeeks} semanas de reembolso.</span>
                )}
              </div>
              <button 
                onClick={receiveAdvancedSponsor}
                disabled={playerTeam.investments.advancedSponsorWeeks > 0}
                className={`px-3 py-1.5 rounded uppercase font-extrabold shadow text-xs cursor-pointer ${
                  playerTeam.investments.advancedSponsorWeeks > 0 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:scale-105 duration-150 text-white'
                }`}
              >
                Bloquear & Sacar $120k
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 4: JURÍDICO, CONTRATOS, VISTOS */}
      <div className="p-5 rounded-2xl border border-[#1e2d44] bg-[#0a1424] shadow-lg space-y-5">
        <div className="border-b border-sky-500/10 pb-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#00cbd6]" />
            <h3 className="text-xs uppercase font-extrabold text-white">Escritório Jurídico, Monitor de Contratos e Centro de Vistos</h3>
          </div>
          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 border border-red-500/20 rounded font-extrabold uppercase">
            Riot Compliance Act No. 16
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Contracts Expiration, MVP Bonus & Titularidade Monitor */}
          <div className="lg:col-span-8 space-y-4">
            <span className="block text-[10px] uppercase font-black tracking-widest text-[#00cbd6]">📜 Mapeador de Contratos Organizacionais (Atletas Principais)</span>
            
            <div className="space-y-2">
              {playerTeam.roster.map((player) => {
                // If months is low, show blinking warning (contractMonths represents remaining splits/months)
                const isNearingExpiration = player.contractMonths <= 3; // roughly 3 splits/months
                const warningBorder = isNearingExpiration ? 'border-amber-500/40 bg-amber-500/5 animate-pulse' : 'border-slate-850 bg-slate-950/45';
                
                return (
                  <div key={player.id} className={`p-3 rounded-xl border flex justify-between items-center text-[10.5px] ${warningBorder}`}>
                    <div className="space-y-1 truncate flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white uppercase">{player.name}</span>
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-normal uppercase">OVR {player.overallRating} • {player.position}</span>
                        {player.isImported && (
                          <span className={`text-[8.5px] px-1 py-0.1 border rounded font-black uppercase ${player.visaApproved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-red-500/40 text-red-450 bg-red-500/5'}`}>
                            {player.visaApproved ? 'Visto OK' : 'Sem Visto Válido'}
                          </span>
                        )}
                        {isNearingExpiration && (
                          <span className="text-[8.5px] text-amber-400 bg-amber-500/10 px-1.5 py-0.1 border border-amber-500/25 rounded font-black font-mono animate-bounce">
                            ⚠️ Alerta de Expiração
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3.5 text-[9.5px] text-slate-400">
                        <span>Luvas de Contratação: <strong className="text-emerald-400">$ {(player.signOnFee || Math.round(player.marketValue * 0.25)).toLocaleString()}</strong></span>
                        <span>Salário Semanal: <strong className="text-slate-200">$ {Math.round(player.salary / 24).toLocaleString()}</strong></span>
                        <span>Multa Rescisória Internacional: <strong className="text-sky-400">$ {Math.round(player.marketValue * 1.8).toLocaleString()}</strong></span>
                      </div>

                      {/* Special Clauses indications */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {player.isMvpBonusExigido && (
                          <span className="text-[8.5px] font-bold text-yellow-405 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.1 rounded uppercase">
                            ⭐ Bônus MVP Exigido Ativo
                          </span>
                        )}
                        {player.isTitularidadeExigida && (
                          <span className="text-[8.5px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.1 rounded uppercase">
                            🛡️ Clausula de Titularidade Exigida
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right pl-3">
                      <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wide">Duração Restante</span>
                      <span className={`text-sm font-extrabold font-mono ${isNearingExpiration ? 'text-amber-500' : 'text-white'}`}>
                        {player.contractMonths} Splits / Meses
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visa Center Progress & Immigration submissions */}
          <div id="visa-processing-center" className="lg:col-span-4 space-y-4">
            <span className="block text-[10px] uppercase font-black tracking-widest text-indigo-400">✈️ Centro de Processamento de Vistos Governamentais</span>
            
            {/* Display list of Waitlisted imported players needing visa approval */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/45 border border-[#1e2d44]/55 text-[10.5px]">
              <span className="block text-[9.5px] font-bold text-slate-300">Candidato Estrangeiro Descoberto</span>
              
              {importsEligibleForVisa.length > 0 ? (
                <div className="space-y-3 border-b border-[#1e2d44]/40 pb-3">
                  {importsEligibleForVisa.map((player) => (
                    <div key={player.id} className="p-2.5 rounded bg-slate-900 flex justify-between items-center">
                      <div>
                        <h6 className="font-extrabold text-white uppercase">{player.name}</h6>
                        <p className="text-[8.5px] text-slate-400">{player.nationality} • OVR {player.overallRating}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => applyImportVisa(player, 'P-1')}
                          className="px-2 py-1 text-[8px] bg-sky-50/20 hover:bg-sky-500/35 border border-sky-400/30 text-sky-400 rounded uppercase font-extrabold cursor-pointer text-center"
                        >
                          P-1 (Barato / 3 Sem)
                        </button>
                        <button
                          onClick={() => applyImportVisa(player, 'EB-1')}
                          disabled={player.overallRating < 84}
                          className={`px-2 py-1 text-[8px] rounded uppercase font-extrabold text-center ${
                            player.overallRating >= 84 
                            ? 'bg-amber-500/20 hover:bg-amber-505 border border-amber-400/30 text-amber-400 cursor-pointer' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          EB-1 (Urgente / 1 Sem)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic pb-2">Nenhum jogador estrangeiro pendente de processamento de visto de importação neste split.</p>
              )}

              {/* Visa Applications Waiting Queue */}
              <div className="space-y-2.5 border-b border-[#1e2d44]/40 pb-3">
                <span className="block text-[9.5px] font-black uppercase text-indigo-400">Processos de Visto em Análise Consulado ({playerTeam.vistasAwaiting?.length || 0})</span>
                {playerTeam.vistasAwaiting && playerTeam.vistasAwaiting.length > 0 ? (
                  <div className="space-y-2">
                    {playerTeam.vistasAwaiting.map((app) => (
                      <div key={app.id} className="p-2 border border-slate-800 rounded bg-slate-950/60 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-white font-bold pb-1 uppercase">
                          <span>{app.name} ({app.type})</span>
                          <span className="text-sky-400">{app.weeksRemaining} Semanas</span>
                        </div>
                        <div className="w-full bg-slate-850 h-1.5 rounded overflow-hidden">
                          <div 
                            className="bg-sky-400 h-full" 
                            style={{ width: `${Math.round(((app.type === 'P-1' ? 3 : 1) - app.weeksRemaining) / (app.type === 'P-1' ? 3 : 1) * 100)}%` }}
                          />
                        </div>
                        {app.hasDocumentationRequest && (
                          <span className="text-[8.5px] text-red-400 font-sans font-bold block pt-1 animate-pulse">⚠️ Exigência Consular Acionada (Atrasado +1 Sem)</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">Sem processos ativos no consulado neste momento.</p>
                )}
              </div>

              {/* INTEGRATED INTERACTIVE VISA STATUS MONITOR & SORT SELECTOR */}
              <div className="space-y-3 pt-2 pb-3 border-b border-[#1e2d44]/40">
                <div className="flex justify-between items-center">
                  <span className="block text-[9.5px] font-black uppercase text-indigo-400">
                    📋 Monitor Integrado de Validade e Status (Alertas)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Ordenação:</span>
                    <select 
                      value={visaSortOrder}
                      onChange={(e) => setVisaSortOrder(e.target.value as 'expiry_asc' | 'expiry_desc')}
                      className="bg-[#070d19] border border-[#1e2d44] text-[8.5px] font-mono text-[#00cbd6] font-extrabold rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="expiry_asc">Imediato / Crítico (Asc)</option>
                      <option value="expiry_desc">Maior Validade (Desc)</option>
                    </select>
                  </div>
                </div>

                {sortedVisas.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {sortedVisas.map((visa) => (
                      <div 
                        key={visa.id} 
                        className={`p-2 rounded-lg border flex justify-between items-center text-[10px] transition-all duration-300 leading-normal ${visa.bgColor}`}
                      >
                        <div className="flex items-center gap-2">
                          {visa.status === 'Concluído' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          ) : visa.subStatus === 'Sem Visto Ativo' ? (
                            <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center shrink-0">
                              <Clock className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                            </div>
                          )}
                          
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white uppercase">{visa.name}</span>
                              <span className={`text-[8.5px] font-mono font-bold uppercase ${visa.status === 'Concluído' ? 'text-emerald-400' : 'text-red-405'}`}>[{visa.status}]</span>
                            </div>
                            <div className="flex items-center gap-2 text-[8.5px] text-slate-400">
                              <span>Classe: <span className="text-slate-300 font-semibold">{visa.type}</span></span>
                              <span>•</span>
                              <span className="font-bold text-slate-300">{visa.subStatus}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-[8px] uppercase text-slate-400 font-bold tracking-wider">Restante</span>
                          <span className={`font-mono font-black text-[10px] ${visa.isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                            {visa.expiryLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">Nenhum atleta estrangeiro integrado ao elenco principal atualmente.</p>
                )}
              </div>

              {/* Simplified Historical Visas Table */}
              <div className="space-y-2 pt-1">
                <span className="block text-[9.5px] font-black uppercase text-indigo-500 flex items-center gap-1">
                  📜 Histórico Simplificado de Atletas Vistos (Últimos 5)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="pb-1">Atleta</th>
                        <th className="pb-1">Nac.</th>
                        <th className="pb-1">Visto</th>
                        <th className="pb-1">Investido</th>
                        <th className="pb-1 text-right">Espera Média</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/45 font-mono">
                      {visaHistoryList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 text-slate-300">
                          <td className="py-1 font-bold text-white">{item.name}</td>
                          <td className="py-1">{item.nationality.substr(0,3).toUpperCase()}</td>
                          <td className="py-1">
                            <span className={`px-1 rounded text-[8px] font-extrabold ${item.type === 'EB-1' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>{item.type}</span>
                          </td>
                          <td className="py-1 text-emerald-400">$ {item.cost.toLocaleString('pt-BR')}</td>
                          <td className="py-1 text-right text-slate-400">{item.waitWeeks} Sem</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Panel de Controle: Visa Notification Settings */}
            <div id="visa-notification-settings" className="p-4 rounded-xl bg-slate-950/45 border border-indigo-550/15 text-[10.5px] space-y-3">
              <span className="block text-[9.5px] font-black uppercase text-indigo-400 border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Configurar Alertas Semanais de Validade
              </span>
              <p className="text-[9.2px] text-slate-400 leading-normal">Configure para despachar lembretes de renovação de vistos para todos os estrangeiros 1 semana antes da perda do licenciamento consular:</p>
              
              <div className="space-y-2 pt-1 font-sans">
                {/* Control 1 */}
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-[9.5px] font-bold text-slate-300">Notificações Push Governamentais</span>
                  <button 
                    onClick={() => setVisaNotifConfig({ ...visaNotifConfig, enablePushAlerts: !visaNotifConfig.enablePushAlerts })}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${visaNotifConfig.enablePushAlerts ? 'bg-emerald-500 flex justify-end' : 'bg-slate-700 flex justify-start'}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white block shadow" />
                  </button>
                </div>

                {/* Control 2 */}
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-[9.5px] font-bold text-slate-300">Filtrar Apenas Atletas Importados</span>
                  <button 
                    onClick={() => setVisaNotifConfig({ ...visaNotifConfig, notifyOnlyImports: !visaNotifConfig.notifyOnlyImports })}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${visaNotifConfig.notifyOnlyImports ? 'bg-emerald-500 flex justify-end' : 'bg-slate-700 flex justify-start'}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white block shadow" />
                  </button>
                </div>

                {/* Control 3 */}
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-[9.5px] font-bold text-slate-300">Notificação Crítica (Limiar 1 Semana)</span>
                  <span className="bg-slate-800 text-sky-400 px-2 py-0.2 rounded text-[9px] font-mono font-bold border border-slate-700">Ativo</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* COMPLIANCE WARNING & AUDITING */}
        <div className="compliance-audit-section relative p-5 rounded-2xl bg-[#1e0a11]/45 border border-red-500/25 text-[10.5px] space-y-3.5 overflow-hidden shadow-lg hover:border-red-500/40 transition duration-300">
          
          {/* Shimmer CSS effect beam */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes compliance-shimmer {
              0% { transform: translateX(-150%) skewX(-15deg); }
              100% { transform: translateX(150%) skewX(-15deg); }
            }
            .animate-compliance-shimmer {
              animation: compliance-shimmer 2.5s ease-in-out infinite;
            }
          `}} />
          <div className="absolute inset-y-0 -left-64 w-36 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-compliance-shimmer pointer-events-none" />

          {/* Countdown timer */}
          <div className="flex justify-between items-center bg-red-950/40 border border-red-500/15 p-2 rounded-lg">
            <span className="font-extrabold text-red-400 flex items-center gap-1.5 uppercase">
              ⏰ Próxima Janela de Auditoria (Riot Compliance):
            </span>
            <span className="font-mono text-red-400 font-bold tracking-wider animate-pulse bg-red-900/25 px-2 py-0.5 rounded text-[11px] border border-red-500/20">
              {formatTimer(tickingTimer)} mins
            </span>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1 leading-relaxed flex-1">
              <h5 className="font-extrabold text-white uppercase text-[11px]">Checklist de Conformidades, Aliciamento e Auditorias Regulatórias</h5>
              <p className="text-slate-300">
                Passar do teto salarial semanal da liga ($120.000) gera uma <strong>Taxa de Luxo de 150% do valor excedido</strong> e reduz severas pontuações estruturais. Além disso, tentativas diretas de contactar e fazer propostas a atletas vinculados a clubes rivais sem rescisão acarretam processos por <strong>Aliciamento (Poaching)</strong>.
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={filePoachProsecution}
                  className="px-3 py-1.5 bg-red-650/20 hover:bg-red-505 border border-red-500/30 text-red-400 uppercase font-extrabold text-[9px] rounded transition cursor-pointer"
                >
                  ⚖️ Simular Auto-Denúncia de Poaching (Auditoria)
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 5: MERCHANDISING (FAN SHOP) & BOARD ROOM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fan Shop Pricing Controls */}
        <div className="lg:col-span-6 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-md space-y-5">
          <div className="border-b border-[#1e2d44] pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#00cbd6]" />
            <h3 className="text-xs uppercase font-extrabold text-white">Gere Loja de Merchandising (Fan Shop)</h3>
          </div>

          <div className="space-y-4">
            
            {/* Jersey pricing */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Preço da Camisa Oficial (Jersey)</span>
                <span className="text-white font-mono font-bold">$ {jerseyPrice} dólares</span>
              </div>
              <input 
                type="range" 
                min={39} 
                max={149} 
                value={jerseyPrice} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setJerseyPrice(val);
                  handlePriceUpdate(val, ticketPrice);
                }} 
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Custom pricing: Produtos Licenciados instead of ticketPrice Arena */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Preço de Produtos Licenciados</span>
                <span className="text-white font-mono font-bold">$ {ticketPrice} dólares</span>
              </div>
              <input 
                type="range" 
                min={15} 
                max={59} 
                value={ticketPrice} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTicketPrice(val);
                  handlePriceUpdate(jerseyPrice, val);
                }} 
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <p className="text-[10.5px] text-slate-400 italic bg-slate-500/5 p-3 rounded-lg border border-slate-205/10 leading-relaxed">
              💡 Nota de Marketing: Preços altos em vestuário e colecionáveis oficiais aumentam os fluxos comerciais na vitória, mas causam perda drástica de suporte e popularidade nas semanas em derrota de split. Encontre o equilíbrio ideal de mercado!
            </p>
          </div>
        </div>

        {/* Board Room */}
        <div className="lg:col-span-6 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-md space-y-5">
          <div className="border-b border-[#1e2d44] pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs uppercase font-extrabold text-white">Sala de Reuniões Táticas (Board Room)</h3>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => pitchBoardRoom('budget')}
              className="w-full text-left p-3 rounded-lg border border-[#1e2d44] bg-[#070d19] hover:bg-slate-800/20 text-xs font-bold text-white flex justify-between items-center transition-all cursor-pointer"
            >
              <div>
                <p>Requisitar Orçamento de Emergência</p>
                <p className="text-[9.5px] text-slate-400 font-normal mt-1 text-slate-500 font-mono">Exige Confiança &ge; 80% • Custo: -15 Confiança</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button 
              onClick={() => pitchBoardRoom('patience')}
              className="w-full text-left p-3 rounded-lg border border-[#1e2d44] bg-[#070d19] hover:bg-slate-800/20 text-xs font-bold text-white flex justify-between items-center transition-all cursor-pointer"
            >
              <div>
                <p>Clamar por Voto de Confiança temporária</p>
                <p className="text-[9.5px] text-slate-400 font-normal mt-1 text-slate-500 font-mono">Exige Confiança &lt; 50% • Restabelece para 60%</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button 
              onClick={() => pitchBoardRoom('youth_grant')}
              className="w-full text-left p-3 rounded-lg border border-[#1e2d44] bg-[#070d19] hover:bg-slate-800/20 text-xs font-bold text-white flex justify-between items-center transition-all cursor-pointer"
            >
              <div>
                <p>Pleitear fomento para a Base Escolar</p>
                <p className="text-[9.5px] text-slate-400 font-normal mt-1 text-slate-500 font-mono">Exige Popularidade &ge; 75% • Custo: -10 Confiança</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {localPitchAnswer && (
            <div className="p-3.5 bg-sky-500/10 border border-sky-400/20 text-[11px] font-semibold text-white rounded-lg flex gap-2 items-start leading-relaxed animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 text-[#00cbd6] shrink-0" />
              <div>{localPitchAnswer}</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 5. FINANÇAS TAB (Financial Sheets)
// ==========================================
interface FinancasTabProps {
  gameState: GameState;
}

export function FinancasTab({ gameState }: FinancasTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  const weeklySponsorInflow = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
  const playerWeeklySalaries = playerTeam.roster.reduce((acc, p) => acc + p.salary, 0);
  const staffWeeklySalaries = 12000; // estimated coaching/staff costs

  const netWeeklyDelta = weeklySponsorInflow - (playerWeeklySalaries + staffWeeklySalaries);

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0a1424] border border-[#1e2d44] p-4.5 rounded-xl shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#00cbd6]" /> Caixa de Negócios
          </span>
          <h3 className="font-display font-black text-[#00d2fd] text-xl mt-2">$ {(playerTeam.budget / 1000).toLocaleString('pt-BR')}k</h3>
        </div>

        <div className="bg-[#0a1424] border border-[#1e2d44] p-4.5 rounded-xl shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-green-400 font-extrabold">Inflow Semanal</span>
          <h3 className="font-display font-black text-[#5dfd35] text-xl mt-2">+$ {(weeklySponsorInflow / 1000).toLocaleString('pt-BR')}k</h3>
        </div>

        <div className="bg-[#0a1424] border border-[#1e2d44] p-4.5 rounded-xl shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-red-400 font-extrabold">Expenso Semanal</span>
          <h3 className="font-display font-black text-[#fd3535] text-xl mt-2">-$ {((playerWeeklySalaries + staffWeeklySalaries) / 1000).toLocaleString('pt-BR')}k</h3>
        </div>

        <div className="bg-[#0a1424] border border-[#1e2d44] p-4.5 rounded-xl shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Fluxo Líquido estimado</span>
          <h3 className={`font-display font-black text-xl mt-2 ${netWeeklyDelta >= 0 ? 'text-[#00cbd6]' : 'text-[#fd5a35]'}`}>
            {netWeeklyDelta >= 0 ? `+$ ${(netWeeklyDelta / 1000).toFixed(1)}k` : `-$ ${(Math.abs(netWeeklyDelta) / 1000).toFixed(1)}k`}
          </h3>
        </div>
      </div>

      <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg space-y-4">
        <span className="block text-xs font-bold text-white uppercase tracking-wider">Balanço de Pagamentos da Rota</span>
        <div className="space-y-3.5">
          <div className="flex justify-between items-center border-b border-[#1e2d44] pb-2 text-slate-400 text-[10px] uppercase font-bold">
            <span>Descrição Fiscal</span>
            <span>Taxa Semanal</span>
          </div>

          <div className="flex justify-between items-center font-bold text-white">
            <span>Contratos de Patrocínio Ativo</span>
            <span className="text-green-400">+$ {(weeklySponsorInflow / 1000).toFixed(1)}k</span>
          </div>

          <div className="flex justify-between items-center font-bold text-white pl-4 text-slate-400 text-[11px]">
            <span>- Patrocínio de Escudo Master</span>
            <span>+$ {(playerTeam.sponsors[0]?.incomePerWeek / 1000 || 0).toFixed(1)}k</span>
          </div>

          <div className="flex justify-between items-center font-bold text-white">
            <span>Folha Mensal dos Atletas</span>
            <span className="text-red-400">-$ {(playerWeeklySalaries / 1000).toFixed(1)}k</span>
          </div>

          <div className="flex justify-between items-center font-bold text-white">
            <span>Pacote Funcional Geral (Staff & Coaches)</span>
            <span className="text-red-400">-$ {(staffWeeklySalaries / 1000).toFixed(1)}k</span>
          </div>

          <div className="border-t border-[#1e2d44] pt-3.5 flex justify-between items-center text-sm font-black uppercase text-white">
            <span>Saldo Operacional Semanal</span>
            <span className={netWeeklyDelta >= 0 ? 'text-green-400' : 'text-red-400'}>
              $ {(netWeeklyDelta / 1000).toLocaleString('pt-BR')}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. ESTATÍSTICAS TAB (League Leaderboards)
// ==========================================
interface EstatisticasTabProps {
  gameState: GameState;
  onSelectPlayer?: (playerId: string) => void;
}

export function EstatisticasTab({ gameState, onSelectPlayer }: EstatisticasTabProps) {
  const { teams } = gameState;

  // Gathering all players
  const allPlayers: Player[] = [];
  teams.forEach(t => {
    t.roster.forEach(p => allPlayers.push({ ...p, customPlayer: t.name as any })); // save team name in customPlayer temporary
  });

  // Top overall
  const topRating = [...allPlayers].sort((a,b) => b.overallRating - a.overallRating).slice(0, 10);

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="panel-header border p-5 rounded-xl transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <h3 className="font-display text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Estatísticas do Splits & CBLOL Superstars</h3>
        <p className="text-[10.5px] mt-1 max-w-xl transition-all duration-200" style={{ color: 'var(--text-muted)' }}>
          Quadro métrico de acompanhamento geral de ratings e desempenhos individuais. Atletas no topo valem milhões no mercado scout.
        </p>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-lg transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <div className="px-5 py-3 border-b text-xs font-extrabold uppercase tracking-wider transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)', color: 'var(--text-main)' }}>
          Top 10 Melhores Jogadores (Ratings)
        </div>

        <div className="grid grid-cols-12 px-5 py-3 border-b text-[9px] font-extrabold uppercase tracking-widest transition-all duration-200" style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-row-even)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-4">ATLETA</div>
          <div className="col-span-2 text-center">ROTA</div>
          <div className="col-span-3">TIME ATUAL</div>
          <div className="col-span-2 text-right">RATING</div>
        </div>

        <div className="divide-y text-[11px] font-semibold transition-all duration-200" style={{ borderColor: 'var(--border-element)' }}>
          {topRating.map((p, idx) => {
            const RowComponent = onSelectPlayer ? 'button' : 'div';
            const isEven = idx % 2 === 1;
            return (
              <RowComponent 
                key={p.id} 
                onClick={onSelectPlayer ? () => onSelectPlayer(p.id) : undefined}
                className={`table-row grid grid-cols-12 px-5 py-3.5 items-center w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#00cbd6]/30 ${onSelectPlayer ? 'cursor-pointer group' : ''}`}
                style={{
                  backgroundColor: isEven ? 'var(--bg-row-even)' : 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-element)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-row-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isEven ? 'var(--bg-row-even)' : 'var(--bg-card)';
                }}
              >
                <div className="col-span-1 font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}</div>
                <div className={`col-span-4 flex items-center gap-1.5 font-bold`} style={{ color: 'var(--text-main)' }}>{p.name}</div>
                <div className="col-span-2 text-center font-mono font-bold text-sky-500">{p.position}</div>
                <div className="col-span-3 uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{p.customPlayer as any}</div>
                <div className="col-span-2 text-right font-mono font-black text-[#00cbd6]">OVR {p.overallRating}</div>
              </RowComponent>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. SOLO QUEUE TAB (Player Ranked Tracker)
// ==========================================
interface SoloQueueTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export interface ScoutingStaff {
  id: string;
  name: string;
  age: number;
  country: string;
  stars: number;
  specialty: string;
  salary: number;
  contractRemaining: number;
  allocatedRegionId: string | null;
  gender?: 'M' | 'F';
  avatar?: string;
  status?: string;
  foto_svg?: string;
}

export interface RegionalPin {
  id: string;
  name: string;
  code: string;
  baseEfficiency: number;
  x: number; // left percentage
  y: number; // top percentage
  focus: 'Mecânicas' | 'Macro' | 'Visão' | 'Mental';
}

export interface SoloQueueRecruit {
  id: string;
  name: string;
  nickname?: string;
  nome_real?: string;
  rota?: string;
  pais_codigo?: string;
  pais_bandeira?: string;
  ranking_elo?: string;
  pos: Position;
  lp: number;
  winrate: number;
  overallRating: number;
  potential: number;
  marketValue: number;
  nationality: string;
  age: number;
  campeoes_preferidos?: string[];
  potencial_oculto?: string;
}

// ==========================================================================
// GERADOR PROCEDURAL DE FOTOS EM SVG
// ==========================================================================
export function gerarFotoProceduralSVG(genero: 'M' | 'F', idUnico: string): string {
    // Transforma o ID em um número semente (seed) simples para manter a foto idêntica no re-render
    let seed = 0;
    for (let i = 0; i < idUnico.length; i++) {
        seed += idUnico.charCodeAt(i);
    }

    // Paletas de Cores de Fundo (Mantendo o padrão Azul/Rosa)
    const bgMales = ["#1E3A8A", "#2563EB", "#1D4ED8", "#0EA5E9", "#0369A1"];
    const bgFemales = ["#701A75", "#9D174D", "#C026D3", "#DB2777", "#BE185D"];
    
    const bgColor = genero === "M" 
        ? bgMales[seed % bgMales.length] 
        : bgFemales[seed % bgFemales.length];

    // Variáveis de customização procedural baseadas na semente (seed)
    const tomPele = ["#FFD1A9", "#FCD34D", "#E0A96D", "#855843", "#633B23"][seed % 5];
    const corCabelo = ["#1E293B", "#78350F", "#F59E0B", "#B91C1C", "#64748B"][Math.floor(seed / 2) % 5];
    const usaOculos = (seed % 3) === 0; // 33% de chance de ter óculos
    
    // Elementos específicos por Gênero (Formatos de Cabelo e Roupas)
    let elementoCabelo = "";
    let elementoRoupa = "";

    if (genero === "M") {
        // Cabelo Curto/Espetado Masculino
        elementoCabelo = `<path d="M24,8 Q35,5 42,14 Q44,22 40,25 Q38,12 24,12 Q10,12 8,25 Q6,22 8,14 Q15,5 24,8 Z" fill="${corCabelo}"/>`;
        // Camisa tática escura
        elementoRoupa = `<path d="M10,48 Q24,40 38,48 L38,60 L10,60 Z" fill="#1E293B"/>
                         <path d="M18,43 L24,50 L30,43" stroke="#3B82F6" stroke-width="2" fill="none"/>`;
    } else {
        // Cabelo Longo/Lateral Feminino
        elementoCabelo = `<path d="M10,24 Q6,12 24,6 Q42,12 38,24 L42,46 Q34,48 36,30 Q24,18 12,30 Q14,48 6,46 Z" fill="${corCabelo}"/>`;
        // Blusa profissional com gola
        elementoRoupa = `<path d="M10,48 Q24,42 38,48 L38,60 L10,60 Z" fill="#475569"/>
                         <path d="M16,45 L24,54 L32,45" stroke="#EC4899" stroke-width="2" fill="none"/>`;
    }

    // Acessório opcional: Óculos
    const elementoOculos = usaOculos ? `
        <circle cx="18" cy="26" r="5" stroke="#FFFFFF" stroke-width="2" fill="none"/>
        <circle cx="30" cy="26" r="5" stroke="#FFFFFF" stroke-width="2" fill="none"/>
        <line x1="23" y1="26" x2="25" y2="26" stroke="#FFFFFF" stroke-width="2"/>
    ` : "";

    // Retorna o SVG completo em string embutida
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="scout-procedural-img w-full h-full">
            <!-- Fundo Esférico com Gradiente Suave -->
            <rect width="48" height="48" rx="8" fill="${bgColor}"/>
            <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            
            <!-- Corpo/Base/Pescoço -->
            <path d="M18,36 L30,36 L30,44 L18,44 Z" fill="${tomPele}"/>
            ${elementoRoupa}

            <!-- Cabeça/Rosto -->
            <circle cx="24" cy="26" r="11" fill="${tomPele}"/>
            
            <!-- Detalhes do Rosto (Olhos e Sorriso) -->
            <circle cx="19" cy="25" r="1.5" fill="#1E293B"/>
            <circle cx="29" cy="25" r="1.5" fill="#1E293B"/>
            <path d="M21,31 Q24,34 27,31" stroke="#1E293B" stroke-width="1.5" fill="none" stroke-linecap="round"/>

            <!-- Cabelo por cima do rosto -->
            ${elementoCabelo}
            
            <!-- Óculos (se ativo) -->
            ${elementoOculos}
        </svg>
    `;
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'BR': '🇧🇷',
    'KR': '🇰🇷',
    'DE': '🇩🇪',
    'US': '🇺🇸',
    'CN': '🇨🇳',
    'ES': '🇪🇸',
    'FI': '🇫🇮',
    'DK': '🇩🇰',
    'CA': '🇨🇦',
    'JP': '🇯🇵',
    'PL': '🇵🇱'
  };
  return flags[countryCode.toUpperCase()] || '🏳️';
}

// SCOUT AVATAR HELPER COMPONENT
export function ScoutAvatar({ scout }: { scout: ScoutingStaff }) {
  const gender = scout.gender || 'M';
  const svgContent = scout.foto_svg || gerarFotoProceduralSVG(gender, scout.id);

  return (
    <div 
      className="scout-avatar-container shrink-0"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

const INITIAL_REGIONS: RegionalPin[] = [
  { id: 'seul_kr', name: 'SEUL, KR', code: 'KR', baseEfficiency: 59, x: 82, y: 43, focus: 'Mecânicas' },
  { id: 'pequim_cn', name: 'PEQUIM, CN', code: 'CN', baseEfficiency: 59, x: 74, y: 38, focus: 'Macro' },
  { id: 'berlin_de', name: 'BERLIN, DE', code: 'DE', baseEfficiency: 59, x: 52, y: 44, focus: 'Visão' },
  { id: 'sao_paulo_br', name: 'SÃO PAULO, BR', code: 'BR', baseEfficiency: 59, x: 32, y: 72, focus: 'Mecânicas' },
  { id: 'california_us', name: 'CALIFORNIA, US', code: 'US', baseEfficiency: 59, x: 12, y: 35, focus: 'Mental' },
  { id: 'madri_es', name: 'MADRI, ES', code: 'ES', baseEfficiency: 59, x: 45, y: 52, focus: 'Macro' },
  { id: 'finlandia_fi', name: 'FINLANDIA, FI', code: 'FI', baseEfficiency: 59, x: 58, y: 25, focus: 'Visão' },
  { id: 'dinamarca_dk', name: 'DINAMARCA, DK', code: 'DK', baseEfficiency: 59, x: 50, y: 32, focus: 'Mecânicas' },
];

const INITIAL_STAFF: ScoutingStaff[] = [
  { id: 'sc_1', name: 'Min-ki "MadLife" Hong', age: 32, country: 'KR', stars: 5, specialty: 'Caçador de Joias da Coreia', salary: 9000, contractRemaining: 12, allocatedRegionId: 'seul_kr', gender: 'M', avatar: 'assets/images/scouts/male_1.png', status: 'DISPONIVEL' },
  { id: 'sc_2', name: 'Wei "Shadow" Chen', age: 29, country: 'CN', stars: 4, specialty: 'Especialista em Rotas Laterais', salary: 6000, contractRemaining: 10, allocatedRegionId: 'pequim_cn', gender: 'M', avatar: 'assets/images/scouts/male_2.png', status: 'DISPONIVEL' },
  { id: 'sc_3', name: 'Hans "Bismark" Müller', age: 41, country: 'DE', stars: 2, specialty: 'Analista de Winrate', salary: 2250, contractRemaining: 8, allocatedRegionId: 'berlin_de', gender: 'M', avatar: 'assets/images/scouts/male_3.png', status: 'DISPONIVEL' },
  { id: 'sc_4', name: 'Renan "DeKar" Silva', age: 27, country: 'BR', stars: 3, specialty: 'Detetor de Prodígios de Fila', salary: 3750, contractRemaining: 14, allocatedRegionId: 'sao_paulo_br', gender: 'M', avatar: 'assets/images/scouts/male_4.png', status: 'DISPONIVEL' },
  { id: 'sc_5', name: 'Jack "Marshall" Cooper', age: 35, country: 'US', stars: 4, specialty: 'Olheiro Geral da LCS', salary: 6000, contractRemaining: 11, allocatedRegionId: 'california_us', gender: 'M', avatar: 'assets/images/scouts/male_5.png', status: 'DISPONIVEL' },
  { id: 'sc_6', name: 'Alvaro "Matador" Diaz', age: 31, country: 'ES', stars: 3, specialty: 'Garimpeiro de Rankings', salary: 3750, contractRemaining: 9, allocatedRegionId: 'madri_es', gender: 'M', avatar: 'assets/images/scouts/male_6.png', status: 'DISPONIVEL' },
  { id: 'sc_7', name: 'Kimi "Finn" Virtanen', age: 28, country: 'FI', stars: 4, specialty: 'Analista Tático de Base', salary: 6000, contractRemaining: 15, allocatedRegionId: 'finlandia_fi', gender: 'M', avatar: 'assets/images/scouts/male_7.png', status: 'DISPONIVEL' },
  { id: 'sc_8', name: 'Mads "Great" Jensen', age: 26, country: 'DK', stars: 3, specialty: 'Caçador de Rotadores', salary: 3750, contractRemaining: 12, allocatedRegionId: 'dinamarca_dk', gender: 'M', avatar: 'assets/images/scouts/male_8.png', status: 'DISPONIVEL' },
];

const INITIAL_RECRUITS: SoloQueueRecruit[] = [
  { 
    id: 'rec_1', 
    name: 'ProdigioBR', 
    nickname: 'ProdigioBR',
    nome_real: 'Gabriel Silva', 
    age: 16, 
    pos: 'MID', 
    rota: 'MID',
    nationality: 'BR', 
    pais_codigo: 'BR',
    pais_bandeira: '🇧🇷', 
    ranking_elo: 'GRÃO-MESTRE',
    lp: 1120, 
    winrate: 64, 
    campeoes_preferidos: ['Azir', 'Ahri', 'Akali'], 
    potencial_oculto: 'PROMISSOR',
    overallRating: 75,
    potential: 92,
    marketValue: 24000
  },
  { 
    id: 'rec_2', 
    name: 'Keuri', 
    nickname: 'Keuri',
    nome_real: 'Min-young Kim', 
    age: 17, 
    pos: 'SUP', 
    rota: 'SUP',
    nationality: 'KR', 
    pais_codigo: 'KR',
    pais_bandeira: '🇰🇷', 
    ranking_elo: 'DESAFIANTE',
    lp: 980, 
    winrate: 61, 
    campeoes_preferidos: ['Thresh', 'Lulu', 'Bard'], 
    potencial_oculto: 'ESTRELA',
    overallRating: 72,
    potential: 88,
    marketValue: 18000
  },
  { 
    id: 'rec_3', 
    name: 'Vanzin', 
    nickname: 'Vanzin',
    nome_real: 'Carlos de Souza', 
    age: 18, 
    pos: 'TOP', 
    rota: 'TOP',
    nationality: 'BR', 
    pais_codigo: 'BR',
    pais_bandeira: '🇧🇷', 
    ranking_elo: 'GRÃO-MESTRE',
    lp: 1050, 
    winrate: 59, 
    campeoes_preferidos: ['Aatrox', 'Jax', 'Fiora'], 
    potencial_oculto: 'PROMISSOR',
    overallRating: 74,
    potential: 85,
    marketValue: 21000
  },
  { 
    id: 'rec_4', 
    name: 'Cariok Jr', 
    nickname: 'Cariok Jr',
    nome_real: 'Eduardo Pereira', 
    age: 16, 
    pos: 'JNG', 
    rota: 'JNG',
    nationality: 'BR', 
    pais_codigo: 'BR',
    pais_bandeira: '🇧🇷', 
    ranking_elo: 'MESTRE',
    lp: 890, 
    winrate: 57, 
    campeoes_preferidos: ['Lee Sin', 'Viego', 'Graves'], 
    potencial_oculto: 'INTERESSANTE',
    overallRating: 70,
    potential: 82,
    marketValue: 16000
  },
  { 
    id: 'rec_5', 
    name: 'Titanzinho', 
    nickname: 'Titanzinho',
    nome_real: 'Heitor Vasconcelos', 
    age: 17, 
    pos: 'ADC', 
    rota: 'ADC',
    nationality: 'BR', 
    pais_codigo: 'BR',
    pais_bandeira: '🇧🇷', 
    ranking_elo: 'GRÃO-MESTRE',
    lp: 1150, 
    winrate: 65, 
    campeoes_preferidos: ['Ezreal', 'Kai\'Sa', 'Jinx'], 
    potencial_oculto: 'PROMISSOR',
    overallRating: 77,
    potential: 94,
    marketValue: 28000
  },
];

const HIRE_POOL_SCOUTS: ScoutingStaff[] = [
  { id: 'sc_h1', name: 'Alex "Scouty" Mercer', age: 24, country: 'CA', stars: 1, specialty: 'Iniciante Local', salary: 1500, contractRemaining: 12, allocatedRegionId: null, gender: 'M', avatar: 'assets/images/scouts/male_1.png', status: 'DISPONIVEL' },
  { id: 'sc_h2', name: 'Yuki "Sora" Sato', age: 26, country: 'JP', stars: 3, specialty: 'Caçador de Promessas de Tóquio', salary: 3750, contractRemaining: 12, allocatedRegionId: null, gender: 'F', avatar: 'assets/images/scouts/female_1.png', status: 'DISPONIVEL' },
  { id: 'sc_h3', name: 'Andrzej "Dudu" Kowalski', age: 33, country: 'PL', stars: 2, specialty: 'Observador da ERL', salary: 2250, contractRemaining: 12, allocatedRegionId: null, gender: 'M', avatar: 'assets/images/scouts/male_2.png', status: 'DISPONIVEL' },
  { id: 'sc_h4', name: 'Julia "Phoenix" Campos', age: 28, country: 'BR', stars: 4, specialty: 'Detetor de Prodígios de Fila', salary: 3750, contractRemaining: 12, allocatedRegionId: null, gender: 'F', avatar: 'assets/images/scouts/female_2.png', status: 'DISPONIVEL' },
];

export function SoloQueueTab({ gameState, onUpdateGameState, triggerNotification, onSelectPlayer }: SoloQueueTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  // 1. Scouting Staff State
  const [scouts, setScouts] = useState<ScoutingStaff[]>(() => {
    const saved = localStorage.getItem('legendshub_scouting_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Preserve Scouts to LocalStorage
  const saveScouts = (updatedScouts: ScoutingStaff[]) => {
    setScouts(updatedScouts);
    localStorage.setItem('legendshub_scouting_staff', JSON.stringify(updatedScouts));
  };

  // Ex-Funcionários State for rehire pool
  const [exScouts, setExScouts] = useState<ScoutingStaff[]>(() => {
    const saved = localStorage.getItem('legendshub_ex_scouts');
    return saved ? JSON.parse(saved) : [];
  });

  const saveExScouts = (pool: ScoutingStaff[]) => {
    setExScouts(pool);
    localStorage.setItem('legendshub_ex_scouts', JSON.stringify(pool));
  };

  // 2. Head of Scouting State
  const [headScoutId, setHeadScoutId] = useState<string | null>(() => {
    const saved = localStorage.getItem('legendshub_head_scout_id');
    return saved || 'sc_5'; // Default to Jack Marshall Cooper
  });

  const saveHeadScout = (id: string | null) => {
    setHeadScoutId(id);
    if (id) {
       localStorage.setItem('legendshub_head_scout_id', id);
    } else {
       localStorage.removeItem('legendshub_head_scout_id');
    }
  };

  // 3. Hireable Pool
  const [hireablePool, setHireablePool] = useState<ScoutingStaff[]>(() => {
    const saved = localStorage.getItem('legendshub_hireable_scouts');
    return saved ? JSON.parse(saved) : HIRE_POOL_SCOUTS;
  });

  const saveHireablePool = (pool: ScoutingStaff[]) => {
    setHireablePool(pool);
    localStorage.setItem('legendshub_hireable_scouts', JSON.stringify(pool));
  };

  // 4. Solo Queue Recruit prospects
  const [recruits, setRecruits] = useState<SoloQueueRecruit[]>(() => {
    const saved = localStorage.getItem('legendshub_solo_queue_recruits');
    return saved ? JSON.parse(saved) : INITIAL_RECRUITS;
  });

  const saveRecruits = (updatedRecruits: SoloQueueRecruit[]) => {
    setRecruits(updatedRecruits);
    localStorage.setItem('legendshub_solo_queue_recruits', JSON.stringify(updatedRecruits));
  };


  // Dialog State for Region Allocation
  const [selectedRegionPin, setSelectedRegionPin] = useState<RegionalPin | null>(null);
  
  // Dialog State for Contract Proposals
  const [activeProposalRecruit, setActiveProposalRecruit] = useState<SoloQueueRecruit | null>(null);
  const [proposedSalary, setProposedSalary] = useState<number>(1850);
  const [proposedMonths, setProposedMonths] = useState<number>(12);
  const [proposedBonus, setProposedBonus] = useState<number>(1500);
  const [negotiationMessage, setNegotiationMessage] = useState<string>('');

  // Active head scout object and bonuses
  const headScout = scouts.find(s => s.id === headScoutId);
  const travelCostDiscount = headScout ? headScout.stars * 5 : 0; // -5% cost per star
  const reachBonus = headScout ? headScout.stars * 2 : 0; // +2% per star on efficiency

  // Live roster stats for Solo Queue (with Gamer Soda buff)
  const [soloStats, setSoloStats] = useState(() => {
    return playerTeam.roster.map(p => {
      const seed = p.overallRating * 11 + (p.name.charCodeAt(0) || 12);
      const lp = (seed % 650) + 600; 
      const wr = 51 + (seed % 9);
      return {
        id: playerTeamId,
        playerId: p.id,
        name: p.name,
        pos: p.position,
        lp,
        winrate: wr,
        rating: p.overallRating,
        isCustom: false
      };
    });
  });

  // Handle allocation of scout to a region
  const handleAllocateScoutToRegion = (scoutId: string | null, regionId: string) => {
    const updated = scouts.map(s => {
      // Clear allocation from this scout if choosing null
      if (s.id === scoutId) {
        return { ...s, allocatedRegionId: regionId };
      }
      // If scout was previously in that region, clear it
      if (s.allocatedRegionId === regionId && s.id !== scoutId) {
        return { ...s, allocatedRegionId: null };
      }
      return s;
    });

    saveScouts(updated);
    
    // Trigger notification
    const scoutObj = scouts.find(sc => sc.id === scoutId);
    const regionName = INITIAL_REGIONS.find(r => r.id === regionId)?.name || regionId;
    if (scoutObj) {
      triggerNotification("🛰️ Olheiro Alocado", `${scoutObj.name} agora monitora ativamente a região de ${regionName}!`);
    } else {
      triggerNotification("🛰️ Monitoramento Parcial", `O monitoramento ativo na região de ${regionName} foi pausado.`);
    }

    setSelectedRegionPin(null);
  };

  // Calculated efficiency for a region
  const getRegionEfficiency = (region: RegionalPin) => {
    const scout = scouts.find(s => s.allocatedRegionId === region.id);
    if (!scout) return region.baseEfficiency; // 59% default
    // Efficiency formula
    const eff = region.baseEfficiency + (scout.stars * 5) + reachBonus;
    return Math.min(99, eff);
  };

  // Count active scouts
  const activeScoutsCount = scouts.filter(s => s.allocatedRegionId !== null).length;

  const handleIncentivizeQueue = (pId: string, lpAdd: number) => {
    // Apply discount based on head scout
    const cost = Math.round(2000 * (1 - travelCostDiscount / 100));

    if (playerTeam.budget < cost) {
       alert(`Precisamos de pelo menos $${cost} para kits nutricionais (Modificado por Head of Scouting)!`);
       return;
    }

    setSoloStats(prev => prev.map(p => {
      if (p.playerId === pId) {
        return {
          ...p,
          lp: p.lp + lpAdd,
          winrate: Math.min(88, p.winrate + 1)
        };
      }
      return p;
    }));

    const updatedTeams = teams.map(t => {
      if (t.id === playerTeamId) {
        const nextRoster = t.roster.map(player => {
          if (player.id === pId) {
            return {
              ...player,
              overallRating: Math.min(99, player.overallRating + 1),
              motivation: Math.min(100, player.motivation + 5)
            };
          }
          return player;
        });
        return {
          ...t,
          budget: t.budget - cost,
          roster: nextRoster
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("🔥 Solo Queue Impulsionada!", `Soda de foco comprada por $${cost}. +1 de treino mecânico adquirido.`);
  };

  // Recruit athlete and add to academy roster
  const handleSendContractProposal = () => {
    if (!activeProposalRecruit) return;

    const r = activeProposalRecruit;
    // Calculate acceptance score
    // Minimum salary estimate based on potential and overall
    const avgScoreNeeded = Math.round((r.overallRating * 40) + (r.potential * 20)); // baseline expectation
    
    // User configuration valuation
    const userOfferValue = (proposedSalary * 35) + (proposedBonus * 2.5) + (proposedMonths * 120);

    const hasFundsForSignon = playerTeam.budget >= proposedBonus;
    if (!hasFundsForSignon) {
      setNegotiationMessage(`❌ Rejeitado! Nossa organização não dispõe de $${proposedBonus} em caixa para pagar as luvas imediatas de contratação!`);
      return;
    }

    if (userOfferValue >= avgScoreNeeded) {
      // Create new Player object for Academy
      const freshPlayer: Player = {
        id: `prop_${Date.now()}`,
        name: r.name,
        realName: `Novo Talento LbH`,
        nationality: r.nationality,
        age: r.age,
        position: r.pos,
        overallRating: r.overallRating,
        potential: r.potential,
        personality: "Focado",
        popularity: 12,
        marketValue: r.marketValue,
        salary: proposedSalary,
        contractMonths: proposedMonths,
        motivation: 95,
        stamina: 100,
        chemistry: 50,
        championPool: r.pos === 'MID' ? ['Ahri', 'Azir'] : r.pos === 'ADC' ? ['Ezreal'] : ['Thresh'],
        isPlayerControlled: true,
        attributes: {
          mechanics: Math.round(r.overallRating * 1.1),
          macro: Math.round(r.overallRating * 0.9 + 5),
          communication: Math.round(65 + Math.random() * 15),
          leadership: Math.round(40 + Math.random() * 30),
          consistency: Math.round(70 + Math.random() * 15),
          emotionalControl: Math.round(68 + Math.random() * 15),
          farm: Math.round(r.overallRating * 1.05),
          mapVision: Math.round(r.overallRating * 0.9),
          playoffPerformance: Math.round(60 + Math.random() * 20),
        }
      };

      // Append player to playerTeam.academy
      const updatedTeams = teams.map(t => {
        if (t.id === playerTeamId) {
          const academyList = t.academy || [];
          return {
            ...t,
            budget: t.budget - proposedBonus, // deduct signon fee
            academy: [...academyList, freshPlayer]
          };
        }
        return t;
      });

      onUpdateGameState({
        ...gameState,
        teams: updatedTeams
      });

      // Remove from recruitable list
      const updatedRecruits = recruits.filter(rec => rec.id !== r.id);
      saveRecruits(updatedRecruits);

      triggerNotification("🏆 Atleta Recrutado!", `${r.name} foi adicionado à sua base de talentos na Academia!`);
      alert(`Contrato aceito! ${r.name} assinou o contrato e foi transferido diretamente para a categoria Academy.`);
      
      setActiveProposalRecruit(null);
      setNegotiationMessage('');
    } else {
      // Counter offer hints
      const expectedSalary = Math.round((avgScoreNeeded - (proposedBonus * 2.5) - (proposedMonths * 120)) / 35);
      setNegotiationMessage(`⚠️ Proposta recusada por ${r.name}. "Achei os valores baixos para um atleta de potencial ${r.potential}. Exijo pelo menos $${Math.max(1200, expectedSalary)} de salário mensal."`);
    }
  };

  // Procedural Generator for Scouting Pool
  const gerarOlheiroProcedural = (): ScoutingStaff => {
    const generos: ('M' | 'F')[] = ["M", "F"];
    const genero = generos[Math.floor(Math.random() * generos.length)];
    
    const femaleNames = [
      "Julia 'Phoenix' Campos",
      "Carolina 'Aura' Silva",
      "Mariana 'Hype' Costa",
      "Gabriela 'Athena' Martins",
      "Beatriz 'Focus' Rodrigues",
      "Larissa 'Storm' Almeida",
      "Amanda 'Valkyrie' Oliveira"
    ];
    const maleNames = [
      "Renan 'DeKar' Silva",
      "Lucas 'Deceiver' Santos",
      "Mateus 'Kaiser' Souza",
      "Felipe 'Poach' Barbosa",
      "Thiago 'Hunter' Guedes",
      "Diego 'Oracle' Ribeiro",
      "Bruno 'Zeus' Lima"
    ];

    const nome = genero === "F" 
      ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
      : maleNames[Math.floor(Math.random() * maleNames.length)];

    const countries = ["BR", "KR", "US", "CN", "DE", "ES", "FI", "DK"];
    const country = countries[Math.floor(Math.random() * countries.length)];

    const stars = Math.floor(Math.random() * 5) + 1;
    const specialties = [
      "Detetor de Prodígios de Fila",
      "Especialista em Rotas Laterais",
      "Analista de Winrate",
      "Observador Psicológico de SoloQ",
      "Caçador de Joias da Coreia",
      "Minerador de Promessas"
    ];
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    
    const avatarUrl = genero === "F" 
      ? `assets/images/scouts/female_${Math.floor(Math.random() * 5) + 1}.png`
      : `assets/images/scouts/male_${Math.floor(Math.random() * 5) + 1}.png`;

    const idUnico = Math.random().toString(36).substring(2, 11);
    return {
      id: idUnico,
      name: nome,
      age: Math.floor(Math.random() * 20) + 21,
      country,
      stars,
      specialty,
      salary: Math.round((stars * 1500) + (Math.random() * 800) + 1000),
      contractRemaining: 14,
      allocatedRegionId: null,
      gender: genero,
      avatar: avatarUrl,
      status: "DISPONIVEL",
      foto_svg: gerarFotoProceduralSVG(genero, idUnico)
    };
  };

  const handleRefreshScoutingPool = () => {
    const newPool: ScoutingStaff[] = [];
    for (let i = 0; i < 4; i++) {
      newPool.push(gerarOlheiroProcedural());
    }
    saveHireablePool(newPool);
    triggerNotification("🔍 Scouting Pool Atualizado", "A agência foi atualizada com novos olheiros qualificados.");
  };

  const handleRefreshSoloQueueRecruits = () => {
    const firstNames = ["Gabriel", "Lucas", "Min-su", "Alex", "Hans", "Pedro", "Ji-hoon", "Enzo", "Felipe", "Sang-yeop"];
    const tags = ["Prodigio", "Hyper", "Rift", "Carry", "Smurf", "King", "Goat", "Sniper", "Vanguard"];
    const routes: Position[] = ["TOP", "JNG", "MID", "ADC", "SUP"];
    const countries = [
      { code: "BR", flag: "🇧🇷", name: "Brasil" },
      { code: "KR", flag: "🇰🇷", name: "Coreia do Sul" },
      { code: "DE", flag: "🇩🇪", name: "Alemanha" },
      { code: "US", flag: "🇺🇸", name: "Estados Unidos" },
      { code: "CN", flag: "🇨🇳", name: "China" }
    ];
    const elos = ["GRÃO-MESTRE", "DESAFIANTE", "MESTRE"];
    const potentials = ["PROMISSOR", "ESTRELA", "INTERESSANTE", "LÉGENDA"];

    const newRecruits: SoloQueueRecruit[] = [];
    for (let i = 0; i < 5; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const pos = routes[Math.floor(Math.random() * routes.length)];
      const overallRating = Math.floor(Math.random() * 15) + 68;
      const potential = Math.floor(Math.random() * 15) + 80;

      const champions = ["Azir", "Ahri", "Akali", "Aatrox", "Thresh", "Jinx", "Lee Sin", "Orianna", "K'Sante", "Kai'Sa", "Ezreal", "Lulu", "Jax", "Fiora", "Viego", "Graves"];
      const PreferredChamps = [...champions].sort(() => 0.5 - Math.random()).slice(0, 3);

      const nickname = tags[Math.floor(Math.random() * tags.length)] + Math.floor(Math.random() * 99);
      newRecruits.push({
        id: 'rec_gen_' + Math.random().toString(36).substring(2, 11),
        name: nickname,
        nickname: nickname,
        nome_real: firstNames[Math.floor(Math.random() * firstNames.length)] + " " + ["Silva", "Souza", "Pereira", "Vasconcelos", "Kim", "Lee", "Müller", "Cooper"][Math.floor(Math.random() * 8)],
        age: Math.floor(Math.random() * 4) + 15,
        pos: pos,
        rota: pos,
        nationality: country.code,
        pais_codigo: country.code,
        pais_bandeira: country.flag,
        ranking_elo: elos[Math.floor(Math.random() * elos.length)],
        lp: Math.floor(Math.random() * 400) + 800,
        winrate: Math.floor(Math.random() * 15) + 55,
        campeoes_preferidos: PreferredChamps,
        potencial_oculto: potentials[Math.floor(Math.random() * potentials.length)],
        overallRating: overallRating,
        potential: potential,
        marketValue: Math.round(overallRating * potential * 3.5)
      });
    }

    saveRecruits(newRecruits);
    triggerNotification("🎯 Fila Solo Atualizada", "Novos prodígios procedurais foram detectados na Solo Queue.");
  };

  // Staff Operations
  const handleHireScout = (newScout: ScoutingStaff) => {
    if (scouts.length >= 8) {
      alert("Comissão técnica cheia! Demita um olheiro ativo (máximo de 8 slots) antes de contratar um novo.");
      return;
    }

    // Check budget sign-on fee (2 months salary as security deposit)
    const setupCost = newScout.salary * 2;
    if (playerTeam.budget < setupCost) {
      alert(`Orçamento insuficiente do clube! Taxa regulatória institucional exige pelo menos $${setupCost} em caixa para habilitar a contratação.`);
      return;
    }

    // Add to scouts, remove from hireable pool
    const updatedScouts = [...scouts, { ...newScout, contractRemaining: 12 }];
    const updatedPool = hireablePool.filter(s => s.id !== newScout.id);

    saveScouts(updatedScouts);
    saveHireablePool(updatedPool);

    // Update GameState budget
    const updatedTeams = teams.map(t => {
      if (t.id === playerTeamId) {
        return { ...t, budget: t.budget - setupCost };
      }
      return t;
    });
    onUpdateGameState({ ...gameState, teams: updatedTeams });

    triggerNotification("🤝 Olheiro Contratado", `${newScout.name} juntou-se ao seu departamento de inteligência!`);
  };

  const handleFireScout = (id: string) => {
    const sObj = scouts.find(sc => sc.id === id);
    if (!sObj) return;

    if (id === headScoutId) {
      setHeadScoutId(null);
      localStorage.removeItem('legendshub_head_scout_id');
    }

    const updatedScouts = scouts.filter(s => s.id !== id);
    saveScouts(updatedScouts);

    // Apply a 10% salary markup for future negotitation/rehire penalty
    const dismissedScout: ScoutingStaff = {
      ...sObj,
      allocatedRegionId: null,
      status: "DEMITIDO",
      salary: Math.round(sObj.salary * 1.10),
      contractRemaining: 12
    };
    saveExScouts([...exScouts, dismissedScout]);

    triggerNotification("💼 Olheiro Demitido", `${sObj.name} foi movido para o banco de candidatos disponíveis.`);
  };

  const handleRehireScout = (id: string) => {
    const sObj = exScouts.find(sc => sc.id === id);
    if (!sObj) return;

    if (scouts.length >= 8) {
      alert("Comissão técnica cheia! Demita um olheiro ativo antes de recontratar.");
      return;
    }

    const setupCost = sObj.salary * 2;
    if (playerTeam.budget < setupCost) {
      alert(`Orçamento insuficiente do clube! Taxa regulatória exige pelo menos $${setupCost} para recontratar.`);
      return;
    }

    const restored: ScoutingStaff = {
      ...sObj,
      allocatedRegionId: null,
      status: "DISPONIVEL",
      contractRemaining: 12 // Novo contrato padrão de 1 ano (12 meses)
    };

    saveScouts([...scouts, restored]);
    saveExScouts(exScouts.filter(s => s.id !== id));

    // Update GameState budget
    const updatedTeams = teams.map(t => {
      if (t.id === playerTeamId) {
        return { ...t, budget: t.budget - setupCost };
      }
      return t;
    });
    onUpdateGameState({ ...gameState, teams: updatedTeams });

    triggerNotification("🤝 Olheiro Recontratado", `${sObj.name} foi recontratado com sucesso.`);
  };

  const handlePromoteToHead = (id: string) => {
    saveHeadScout(id);
    const scoutName = scouts.find(s => s.id === id)?.name || "Olheiro";
    triggerNotification("👑 Novo Head de Scouting", `${scoutName} foi promovido ao cargo supremo do departamento!`);
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      
      {/* 1. BLOCO SUPERIOR: REDE DE MONITORAMENTO GLOBAL */}
      <div className="border rounded-xl p-5 shadow-lg relative transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--border-element)' }}>
          <div>
            <h3 className="font-display text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>REDE DE MONITORAMENTO GLOBAL</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Mapeamento de servidores parceiros e captação de talentos ocultos internacionais.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-450 font-bold uppercase tracking-wider text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            ATIVO • {activeScoutsCount} SCOUTS EM CAMPO
          </div>
        </div>

        {/* Visual Map styled container with SVG background coordinates details */}
        <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-slate-900/30 border flex items-center justify-center" style={{ borderColor: 'var(--border-element)', background: 'linear-gradient(135deg, rgba(16,24,39,0.95), rgba(7,13,25,0.97))' }}>
          
          {/* Conceptual Global Grid Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="160" x2="100%" y2="160" stroke="#3B82F6" strokeDasharray="5,5" strokeWidth="1" />
            <line x1="12%" y1="0" x2="12%" y2="100%" stroke="#3B82F6" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="32%" y1="0" x2="32%" y2="100%" stroke="#3B82F6" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="52%" y1="0" x2="52%" y2="100%" stroke="#3B82F6" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="74%" y1="0" x2="74%" y2="100%" stroke="#3B82F6" strokeDasharray="3,3" strokeWidth="0.5" />
          </svg>

          {/* Map Region Pins */}
          {INITIAL_REGIONS.map(reg => {
            const efficiency = getRegionEfficiency(reg);
            const activeScout = scouts.find(s => s.allocatedRegionId === reg.id);
            return (
              <button
                key={reg.id}
                onClick={() => setSelectedRegionPin(reg)}
                className="map-pin absolute flex items-center gap-1.5 focus:outline-none transition-all hover:scale-105"
                style={{
                  left: `${reg.x}%`,
                  top: `${reg.y}%`,
                  transform: 'translate(-50%, -50%)',
                  border: activeScout ? '2px solid #10B981' : '2px solid #3B82F6',
                  color: activeScout ? '#10B981' : '#3B82F6',
                }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{reg.name} ({efficiency}%)</span>
              </button>
            );
          })}

          {/* No Interactive Pins Center Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-slate-500 uppercase font-display font-black text-[22px] tracking-widest opacity-5 text-center">
            LEGENDS MAP CONTROL
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <span>💡 CLIQUE NAS REGIÕES E PINOS PARA ALOCAR SCOUTS E ALTERAR OS FOCOS DE TALENTOS PROCEDURAIS.</span>
          {headScout && (
            <span className="text-sky-400 font-bold">
              Bônus Head de Scouting ({headScout.name}): +{reachBonus}% Alcance
            </span>
          )}
        </div>
      </div>

      {/* REGION ALLOCATION MODAL POPUP */}
      {selectedRegionPin && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="border text-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl p-5 bg-[#0c1626]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
            <div className="flex justify-between items-center pb-2.5 border-b" style={{ borderColor: 'var(--border-element)' }}>
              <h4 className="font-display font-bold text-sm text-sky-400">GERENCIAR ALOCAÇÃO: {selectedRegionPin.name}</h4>
              <button 
                type="button" 
                onClick={() => setSelectedRegionPin(null)} 
                className="text-slate-400 hover:text-white font-bold"
              >
                ❌
              </button>
            </div>
            
            <div className="my-4 space-y-3 text-xs leading-relaxed">
              <p style={{ color: 'var(--text-main)' }}>
                Esta região foca prioritariamente em revelar atletas de <strong>{selectedRegionPin.focus}</strong>. Escolha um funcionário disponível para alocar no monitoramento desta região:
              </p>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {/* Option to clear allocation */}
                <button
                  onClick={() => handleAllocateScoutToRegion(null, selectedRegionPin.id)}
                  className="w-full text-left p-2.5 rounded border border-dashed text-[11px] hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                  style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)' }}
                >
                  <span>Deixar região sem monitoramento ativo</span>
                  <span className="font-bold text-red-450">Remover Scout</span>
                </button>

                {scouts.map(sc => {
                  const isCurrent = sc.allocatedRegionId === selectedRegionPin.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleAllocateScoutToRegion(sc.id, selectedRegionPin.id)}
                      className="w-full text-left p-2.5 rounded border hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer"
                      style={{ 
                        borderColor: isCurrent ? '#10B981' : 'var(--border-element)',
                        backgroundColor: isCurrent ? 'rgba(16,185,129,0.05)' : 'transparent'
                      }}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                          <span>{sc.name}</span>
                          <span className="text-amber-500 flex gap-0.5 shrink-0 text-[10px]">
                            {Array.from({ length: sc.stars }).map((_, i) => <span key={i}>⭐</span>)}
                          </span>
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {sc.specialty} • Alocado em: {sc.allocatedRegionId ? INITIAL_REGIONS.find(r => r.id === sc.allocatedRegionId)?.name : 'Livre'}
                        </div>
                      </div>
                      <span className="text-sky-400 text-[10.5px] uppercase font-bold">ALOCAR</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'var(--border-element)' }}>
              <button 
                onClick={() => setSelectedRegionPin(null)} 
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 rounded font-bold transition-all text-[11px] cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BLOCO CENTRAL: FILA SOLO QUEUE (RECRUTAMENTO DIRETO) */}
      <div className="border rounded-xl overflow-hidden shadow-lg transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all duration-200 bg-black/5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
          <div>
            <h3 className="font-display text-base font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>FILA SOLO QUEUE (RANKING DE SERVIDOR)</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Acompanhe o rendimento do seu talento nas filas oficiais de rank do servidor. Treinar na solo queue aprimora as mecânicas.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefreshSoloQueueRecruits}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 rounded text-white font-extrabold uppercase text-[9.5px] tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              🔄 GERAR JOVENS TALENTOS
            </button>
            <Tv className="w-10 h-10 text-sky-400 opacity-20 hidden sm:block" />
          </div>
        </div>

        {/* Unified Table */}
        <div className="grid grid-cols-12 px-5 py-3 border-b text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200" style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-row-even)' }}>
          <div className="col-span-3 text-left">ATLETA</div>
          <div className="col-span-1 text-center">ROTA</div>
          <div className="col-span-3 text-center">RANKING ELO</div>
          <div className="col-span-1 text-center font-mono">WINRATE</div>
          <div className="col-span-2 text-center">CAMPEÕES PREFERIDOS</div>
          <div className="col-span-2 text-right">AÇÕES</div>
        </div>

        <div className="divide-y font-semibold transition-all duration-200" style={{ borderColor: 'var(--border-element)' }}>
          {recruits.map((recruit, idx) => {
            const isEven = idx % 2 === 1;
            const preferredChamps = recruit.campeoes_preferidos || ['Azir', 'Ahri', 'Akali'];
            return (
              <div 
                key={`recruit_${recruit.id}`} 
                className="table-row grid grid-cols-12 px-5 py-3.5 items-center transition-all duration-200 gap-1.5"
                style={{
                  backgroundColor: isEven ? 'var(--bg-row-even)' : 'var(--bg-card)',
                  color: 'var(--text-muted)'
                }}
              >
                {/* 1. ATLETA IDENTIFICATION */}
                <div className="col-span-3 flex items-start gap-1.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-extrabold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 mr-1 shrink-0">
                    SCOUTED
                  </span>
                  <div className="flex flex-col text-left min-w-0">
                    <strong className="text-sm font-display font-black text-white truncate leading-tight" style={{ color: 'var(--text-main)' }}>
                      {recruit.name} ({recruit.age}a)
                    </strong>
                    <span className="text-[11px] font-medium text-slate-400 leading-normal truncate" style={{ color: 'var(--text-muted)' }}>
                      {recruit.nome_real || 'Gabriel Silva'} {recruit.pais_bandeira || '🇧🇷'}
                    </span>
                  </div>
                </div>

                {/* 2. ROTA / TAG */}
                <div className="col-span-1 text-center">
                  <span className="px-2 py-0.5 text-xs shrink-0 font-mono font-bold rounded uppercase tracking-wider bg-sky-950 border border-sky-600/25" style={{ color: '#00cbd6', borderColor: 'var(--border-element)' }}>
                    {recruit.pos}
                  </span>
                </div>

                {/* 3. RANKING ELO DISPLAY */}
                <div className="col-span-3 text-center flex flex-col justify-center">
                  <span className="font-extrabold uppercase text-[11.5px] text-[#00cbd6] tracking-wide leading-none">
                    {recruit.ranking_elo || 'GRÃO-MESTRE'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    💎 {recruit.lp} LP
                  </span>
                </div>

                {/* 4. WINRATE DISPLAY */}
                <div className="col-span-1 text-center">
                  <span className="font-mono text-emerald-400 font-bold text-xs shrink-0">
                    {recruit.winrate}% WR
                  </span>
                </div>

                {/* 5. METADATA PREFERRED CHAMPIONS CHIPS */}
                <div className="col-span-2 text-center flex flex-wrap gap-1 justify-center">
                  {preferredChamps.map((champ, cIdx) => (
                    <span 
                      key={cIdx} 
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded border"
                      style={{ 
                        backgroundColor: 'var(--bg-main-panel)', 
                        borderColor: 'var(--border-element)', 
                        color: 'var(--text-main)' 
                      }}
                    >
                      {champ}
                    </span>
                  ))}
                </div>

                {/* 6. RECRUIT ACTION */}
                <div className="col-span-2 text-right">
                  <button
                    onClick={() => {
                      setActiveProposalRecruit(recruit);
                      setProposedSalary(1500);
                      setProposedBonus(recruit.marketValue ? Math.round(recruit.marketValue * 0.1) : 2000);
                      setNegotiationMessage('');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 hover:bg-opacity-95 text-white font-extrabold uppercase text-[9.5px] rounded tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    RECRUTAR ATLETA
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECRUIT CONTRACT PROPOSAL POPUP */}
      {activeProposalRecruit && (
        <div className="fixed inset-0 bg-slate-950/75 z-40 flex items-center justify-center p-4">
          <div className="border text-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl p-6 bg-[#0b1424]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border-element)' }}>
              <div>
                <h4 className="font-display font-black uppercase text-base text-emerald-400">PROPOSTA DE CONTRATO (ACADEMY)</h4>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Proposta de base para ingresso imediato no centro de formação esportiva.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveProposalRecruit(null)} 
                className="text-slate-400 hover:text-white font-bold"
              >
                ❌
              </button>
            </div>

            <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3.5 pr-2 border-r" style={{ borderColor: 'var(--border-element)' }}>
                <h5 className="font-bold text-xs uppercase text-sky-400 tracking-wider">Metadados do Atleta</h5>
                <div className="space-y-1.5 text-xs text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <div>Nome: <strong className="text-white" style={{ color: 'var(--text-main)' }}>{activeProposalRecruit.name}</strong></div>
                  <div>Rota primária: <strong className="text-white" style={{ color: 'var(--text-main)' }}>{activeProposalRecruit.pos}</strong></div>
                  <div>Nacionalidade: <strong className="text-white" style={{ color: 'var(--text-main)' }}>{activeProposalRecruit.nationality}</strong></div>
                  <div>Idade atual: <strong className="text-white" style={{ color: 'var(--text-main)' }}>{activeProposalRecruit.age} anos</strong></div>
                </div>

                <div className="p-3 rounded bg-slate-900/45 border" style={{ borderColor: 'var(--border-element)' }}>
                  <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">Avaliação do Olheiro</span>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                    <div>OVR Presumido: <span className="font-extrabold text-white"> OVR {activeProposalRecruit.overallRating}</span></div>
                    <div>POT Presumido: <span className="font-extrabold text-emerald-400"> POT {activeProposalRecruit.potential}</span></div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block mt-2 leading-none">
                    * {headScout ? `Precisão 100% garantida pelo Head: ${headScout.name}` : "Margem de erro procedural comum na visualização."}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <h5 className="font-bold text-xs uppercase text-sky-400 tracking-wider">Termos do Contrato</h5>
                
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold block flex justify-between" style={{ color: 'var(--text-main)' }}>
                    <span>Salário Mensal:</span>
                    <span className="text-[#00cbd6] font-mono font-black">${proposedSalary}</span>
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="50"
                    value={proposedSalary}
                    onChange={(e) => setProposedSalary(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>$1.000/mês</span>
                    <span>$5.000/mês</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold block flex justify-between" style={{ color: 'var(--text-main)' }}>
                    <span>Duração do Acordo:</span>
                    <span className="text-[#00cbd6] font-mono font-black">{proposedMonths} Semanas</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="24"
                    step="1"
                    value={proposedMonths}
                    onChange={(e) => setProposedMonths(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>6 Semanas</span>
                    <span>24 Semanas</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold block flex justify-between" style={{ color: 'var(--text-main)' }}>
                    <span>Luvas de Assinatura (Fundo Imediato):</span>
                    <span className="text-emerald-400 font-mono font-black">${proposedBonus}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={proposedBonus}
                    onChange={(e) => setProposedBonus(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Negotiation Output Message */}
            {negotiationMessage && (
              <div className="p-3 my-3 rounded text-[11px] leading-relaxed border transition-all duration-200" style={{ backgroundColor: 'rgba(255,160,0,0.05)', borderColor: 'rgba(217,119,6,0.3)', color: 'var(--text-main)' }}>
                {negotiationMessage}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t text-xs" style={{ borderColor: 'var(--border-element)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Seu fundo atual: <span className="text-white font-mono font-bold">${playerTeam.budget}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveProposalRecruit(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 rounded font-bold uppercase tracking-wide text-[10px] transition-colors cursor-pointer"
                  style={{ color: 'var(--text-main)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendContractProposal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-extrabold uppercase tracking-wide text-[10px] transition-colors cursor-pointer"
                >
                  Enviar Proposta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BLOCO INFERIOR: GERENCIAMENTO DE OLHEIROS (STAFF) */}
      <div className="space-y-4">
        
        {/* Head of Scouting highlight cards */}
        <div className="p-5 border rounded-xl shadow-lg transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
          <div className="flex justify-between items-start mb-4 border-b pb-3" style={{ borderColor: 'var(--border-element)' }}>
            <div>
              <h3 className="font-display text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>GERENCIAMENTO DE EQUIPE DE OLHEIROS</h3>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Defina e lidere a comissão de desenvolvimento técnico e inteligência de mercado do clube.</p>
            </div>
            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black">
              LÍDER DE DEPARTAMENTO
            </span>
          </div>

          {/* HEAD OF SCOUT CARD */}
          <div className="head-scout-card flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-200">
            {headScout ? (
              <div className="flex items-center gap-4 w-full">
                <ScoutAvatar scout={headScout} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs uppercase font-extrabold" style={{ color: 'var(--text-main)' }}>{headScout.name} (HEAD OF SCOUTING)</h4>
                    <span className="text-[9.5px] uppercase font-bold text-sky-400">🔥 ATIVO</span>
                  </div>
                  <p className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
                    Especialidade: <strong className="text-white" style={{ color: 'var(--text-main)' }}>{headScout.specialty}</strong> • Atribuindo {headScout.stars} Estrelas Globais
                  </p>
                  <p className="text-[9.5px] leading-relaxed max-w-md italic font-medium" style={{ color: 'var(--text-muted)' }}>
                    🎁 Bônus Administrativo: Reduz o custo operacional de soda e viagem em <strong>-{travelCostDiscount}%</strong> e garante <strong>+{reachBonus}%</strong> de bônus global de alcance.
                  </p>
                </div>
                <button
                  onClick={() => saveHeadScout(null)}
                  className="btn-change-head text-[10px] uppercase font-bold cursor-pointer"
                >
                  Mudar Head
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4 w-full space-y-2">
                <Crown className="w-8 h-8 text-amber-500 animate-bounce" />
                <h4 className="text-xs font-black uppercase" style={{ color: 'var(--text-main)' }}>HEAD DE SCOUTING NULO</h4>
                <p className="text-[10px] max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Não há um líder supremo designado. Atribua um dos olheiros abaixo para receber os bônus operacionais de custos de incentivo e precisão extrema de atributos.
                </p>
              </div>
            )}
          </div>

          {/* Active Scouts List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase mb-2 tracking-wider" style={{ color: 'var(--text-main)' }}>Corpo de Scouts Contratados ({scouts.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scouts.map(sc => {
                const regionName = INITIAL_REGIONS.find(r => r.id === sc.allocatedRegionId)?.name;
                return (
                  <div 
                    key={sc.id} 
                    className="border rounded-xl p-4 flex gap-4 shadow transition-all duration-200"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}
                  >
                    <ScoutAvatar scout={sc} />
                    <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm select-none shrink-0" title={sc.country}>
                              {getCountryFlag(sc.country)}
                            </span>
                            <strong className="text-white truncate" style={{ color: 'var(--text-main)' }}>{sc.name}</strong>
                          </div>
                          <div className="staff-stars flex gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star 
                                key={idx} 
                                className={`w-3.5 h-3.5 ${idx < sc.stars ? 'text-amber-500 fill-amber-500' : 'text-slate-600/30'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono leading-tight uppercase truncate" style={{ color: 'var(--text-muted)' }}>
                          Especialidade: <span className="text-sky-400 font-bold">{sc.specialty}</span>
                        </div>
                        <div className="text-[10.5px] leading-tight truncate" style={{ color: 'var(--text-muted)' }}>
                          Monitoração em: {sc.allocatedRegionId ? (
                            <span className="text-emerald-400 font-extrabold">{regionName}</span>
                          ) : (
                            <span className="text-red-450 font-semibold italic">Aguardando Alocação</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t flex justify-between items-center text-[10px]" style={{ borderColor: 'var(--border-element)' }}>
                        <span className="font-mono text-emerald-400 font-extrabold">$ {sc.salary.toLocaleString()}/mês</span>
                        <span className="text-[9.5px]" style={{ color: 'var(--text-muted)' }}>{sc.contractRemaining} meses de contrato</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => setSelectedRegionPin(INITIAL_REGIONS[0])}
                          className="py-1 bg-sky-650 hover:bg-sky-500 rounded font-black uppercase text-[8.5px] tracking-wide cursor-pointer text-white text-center"
                        >
                          Alocar
                        </button>
                        <button
                          disabled={sc.id === headScoutId}
                          onClick={() => handlePromoteToHead(sc.id)}
                          className={`py-1 rounded font-black uppercase text-[8.5px] tracking-wide cursor-pointer text-center ${
                            sc.id === headScoutId 
                              ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          {sc.id === headScoutId ? 'LIDER' : 'Promover'}
                        </button>
                        <button
                          onClick={() => handleFireScout(sc.id)}
                          className="py-1 bg-red-650 hover:bg-red-500 rounded font-black uppercase text-[8.5px] tracking-wide cursor-pointer text-white text-center"
                        >
                          Demitir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiring Pool Scouts */}
          <div className="pt-5 border-t" style={{ borderColor: 'var(--border-element)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Agência de Olheiros Disponíveis (Scouting Pool)</h4>
              <button
                onClick={handleRefreshScoutingPool}
                className="px-3.5 py-1.5 bg-emerald-650 hover:bg-emerald-500 rounded text-white font-extrabold uppercase text-[9.5px] tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                🔄 LIMPAR E GERAR CANDIDATOS PROCEDURAIS
              </button>
            </div>
            
            {hireablePool.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {hireablePool.map(sc => {
                  const setupCost = sc.salary * 2;
                  return (
                    <div 
                      key={sc.id}
                      className="border rounded-xl p-3 flex gap-3.5 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}
                    >
                      <ScoutAvatar scout={sc} />
                      <div className="flex-1 flex flex-col justify-between space-y-2.5 min-w-0">
                        <div className="min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-sm select-none shrink-0" title={sc.country}>
                              {getCountryFlag(sc.country)}
                            </span>
                            <span className="text-amber-500 flex gap-0.5 font-bold shrink-0 text-[10px]">
                              {Array.from({ length: sc.stars }).map((_, i) => <span key={i}>⭐</span>)}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-[11px] mt-1.5 truncate" style={{ color: 'var(--text-main)' }}>{sc.name}</h5>
                          <p className="text-[10px] italic leading-tight truncate" style={{ color: 'var(--text-muted)' }}>"{sc.specialty}"</p>
                        </div>

                        <div className="text-[10px] space-y-1 font-mono pt-1.5 border-t" style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)' }}>
                          <div>Salário: <strong className="text-emerald-405">$ {sc.salary}/mês</strong></div>
                          <div>Adesão: <strong className="text-emerald-405">${setupCost}</strong></div>
                        </div>

                        <button
                          onClick={() => handleHireScout(sc)}
                          className="w-full py-1.5 bg-emerald-605 hover:bg-emerald-500 rounded font-black text-white uppercase text-[9px] tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Contratar Olheiro
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)' }}>
                Nenhum candidato disponível na agência no momento. Clique no botão acima para requisitar mais olheiros!
              </div>
            )}
          </div>

          {/* Ex-Employees Area */}
          {exScouts.length > 0 && (
            <div className="pt-5 border-t" style={{ borderColor: 'var(--border-element)' }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Demissões Recentes (Histórico de Ex-Funcionários)</h4>
                <span className="text-[9.5px] font-mono" style={{ color: 'var(--text-muted)' }}>Multa inflacionária aplicada (+10% no pedido salarial)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {exScouts.map(sc => {
                  const setupCost = sc.salary * 2;
                  return (
                    <div 
                      key={sc.id}
                      className="border rounded-xl p-3 flex gap-3.5 transition-all duration-200 opacity-80 hover:opacity-100"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}
                    >
                      <ScoutAvatar scout={sc} />
                      <div className="flex-1 flex flex-col justify-between space-y-2.5 min-w-0">
                        <div className="min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-sm select-none shrink-0" title={sc.country}>
                              {getCountryFlag(sc.country)}
                            </span>
                            <span className="text-amber-500 flex gap-0.5 font-bold shrink-0 text-[10px]">
                              {Array.from({ length: sc.stars }).map((_, i) => <span key={i}>⭐</span>)}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-[11px] mt-1.5 truncate" style={{ color: 'var(--text-main)' }}>{sc.name}</h5>
                          <p className="text-[10px] italic leading-tight truncate" style={{ color: 'var(--text-muted)' }}>"{sc.specialty}"</p>
                        </div>

                        <div className="text-[10px] space-y-1 font-mono pt-1.5 border-t" style={{ borderColor: 'var(--border-element)', color: 'var(--text-muted)' }}>
                          <div>Salário Reajustado: <strong className="text-red-400">$ {sc.salary}/mês</strong></div>
                          <div>Custo Readesão: <strong className="text-[#00cbd6]">${setupCost}</strong></div>
                        </div>

                        <button
                          onClick={() => handleRehireScout(sc.id)}
                          className="w-full py-1.5 bg-sky-650 hover:bg-sky-500 rounded font-black text-white uppercase text-[9px] tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Recontratar Olheiro
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

// ==========================================
// 8. ÚLTIMAS PARTIDAS TAB (Match Logs History)
// ==========================================
interface UltimasPartidasTabProps {
  gameState: GameState;
}

export function UltimasPartidasTab({ gameState }: UltimasPartidasTabProps) {
  const { teams, week } = gameState;

  // Let's gather all played schedules
  const matchHistory: any[] = [];
  
  // Find match records in previous weeks
  for (let wk = 1; wk < week; wk++) {
    const list = gameState.calendarSchedule[wk] || [];
    list.forEach(m => {
      if (m.isFinished) {
        const teamBlue = teams.find(t => t.id === m.teamBlueId);
        const teamRed = teams.find(t => t.id === m.teamRedId);
        matchHistory.push({
          weekIdx: wk,
          blueName: teamBlue ? teamBlue.name : 'Blue Team',
          redName: teamRed ? teamRed.name : 'Red Team',
          blueScore: m.scoreBlue,
          redScore: m.scoreRed,
          blueColor: teamBlue ? teamBlue.primaryColor : '#aaa',
          redColor: teamRed ? teamRed.primaryColor : '#777'
        });
      }
    });
  }

  const reversedLogs = [...matchHistory].reverse().slice(0, 15);

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl">
        <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Histórico de Resultados / Últimas Partidas no CBLOL</h3>
        <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
          Visualização cronológica das disputas completadas no servidor. Acompanhe a curva de evolução dos adversários.
        </p>
      </div>

      <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-[#1e2d44] bg-[#070d19] text-white font-extrabold uppercase tracking-wider flex justify-between">
          <span>Série de Partidas CBLOL</span>
          <span className="text-[10px] text-slate-400 text-right uppercase font-bold text-[#00cbd6]">TOTAL DE SÉRIES: {matchHistory.length}</span>
        </div>

        <div className="divide-y divide-[#1e2d44]/50">
          {reversedLogs.length > 0 ? (
            reversedLogs.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-[#070d19]/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 font-mono text-[9px] rounded font-bold uppercase">SEMANA {item.weekIdx}</span>
                </div>

                <div className="flex-1 max-w-md mx-auto grid grid-cols-7 gap-1.5 items-center font-extrabold text-[12px] uppercase">
                  <div className="col-span-3 text-right text-white truncate">{item.blueName}</div>
                  
                  <div className="col-span-1 text-center bg-[#070d19] py-1 border border-[#1e2d44] text-[#00cbd6] text-xs rounded font-bold">
                    {item.blueScore} - {item.redScore}
                  </div>

                  <div className="col-span-3 text-left text-white truncate">{item.redName}</div>
                </div>

                <div className="hidden sm:block text-[10px] text-slate-505 font-medium tracking-wide">
                  COMPLETADO ✔️
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 uppercase tracking-widest font-black">
              Nenhuma série de partidas jogada até o momento na Temporada. Avance a semana para iniciar as rodadas CBLOL.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. META TAB (Champion Meta Tierlist)
// ==========================================
interface MetaTabProps {
  gameState: GameState;
}

export function MetaTab({ gameState }: MetaTabProps) {
  const { champions } = gameState;

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="panel-header border p-5 rounded-xl flex items-center justify-between transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <div>
          <h3 className="font-display text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Patch Tático da Operação (Summoner's Rift Meta)</h3>
          <p className="text-[10.5px] mt-1 max-w-xl transition-all duration-200" style={{ color: 'var(--text-muted)' }}>
            Acompanhe o balanceamento do patch de Summoner's Rift corrente. Escolher campeões com maior tactical power amplifica as chances de draft.
          </p>
        </div>
        <span className="px-2.5 py-1.5 bg-[#00cbd6]/10 text-[#00cbd6] border border-[#00cbd6]/25 rounded text-[10.5px] font-mono uppercase font-black tracking-widest leading-none">
          PATCH OPERACIONAL {gameState.currentPatch?.version || '15.1'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {(champions || []).slice(0, 15).map(c => (
          <div key={c.id} className="champion-card p-4 rounded-xl flex flex-col justify-between shadow-md space-y-3 transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-element)' }}>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b transition-all duration-200" style={{ borderColor: 'var(--border-element)' }}>
                <span className="text-xs uppercase font-black" style={{ color: 'var(--text-main)' }}>{c.name}</span>
                <span className="w-5.5 h-5.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {c.tier}
                </span>
              </div>
              <div className="text-[9px] font-mono leading-none transition-all duration-200" style={{ color: 'var(--text-muted)' }}>
                ROTAS HABILITADAS: <span className="font-extrabold uppercase text-sky-500" style={{ color: 'var(--text-main)' }}>{c.roles.join(', ')}</span>
              </div>
              <p className="text-[10px] leading-relaxed italic truncate transition-all duration-200" style={{ color: 'var(--text-muted)' }}>"{c.idealPlaystyle}"</p>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t text-[9.5px] transition-all duration-200" style={{ borderColor: 'var(--border-element)' }}>
              <span className="font-mono font-bold transition-all duration-200" style={{ color: 'var(--text-muted)' }}>POWER CAP: {c.power}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                c.buffStatus === 'BUFFED' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : c.buffStatus === 'NERFED' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {c.buffStatus || 'NORMAL'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. CARREIRA TAB (Manager Milestones Resume)
// ==========================================
interface CarreiraTabProps {
  gameState: GameState;
}

export function CarreiraTab({ gameState }: CarreiraTabProps) {
  const { managerName, teams, playerTeamId, week } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  const milestones = [
    {
      name: 'Pioneiro da Tactical Era',
      desc: 'Alcançou mais de $1.200.000 em caixa de negócios corporativos do clube.',
      unlocked: playerTeam.budget >= 1200000,
      badge: Trophy
    },
    {
      name: 'Voto de Confiança',
      desc: 'Obteve 90% ou mais de Confiança política de Diretoria do clube.',
      unlocked: playerTeam.boardTrust >= 90,
      badge: Crown
    },
    {
      name: 'Comunidade Próspera',
      desc: 'Superou os 80% de apoio popular de torcida CBLOL em marketing de fãs.',
      unlocked: playerTeam.fansSupport >= 80,
      badge: Users
    }
  ];

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="panel-header border p-5.5 rounded-xl flex items-center gap-4 transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-element)' }}>
        <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center font-black text-sky-500 border border-blue-500/25 text-sm uppercase shrink-0">
          {managerName.charAt(0)}
        </div>
        <div>
          <h3 className="font-display text-base font-black uppercase tracking-wider transition-all duration-200" style={{ color: 'var(--text-main)' }}>{managerName}</h3>
          <p className="text-[10px] mt-1 uppercase transition-all duration-200" style={{ color: 'var(--text-muted)' }}>Manager Oficial • Status CBLOL • Split Ativo Semana {week}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((item, id) => {
          const Badge = item.badge;
          return (
            <div 
              key={id} 
              className="achievement-card p-4 rounded-xl border flex flex-col justify-between space-y-3.5 shadow transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: item.unlocked ? '#38bdf8' : 'var(--border-element)',
                opacity: item.unlocked ? 1 : 0.55,
              }}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 bg-slate-500/10 rounded-lg ${item.unlocked ? 'text-sky-400' : 'text-slate-500'}`}>
                  <Badge className="w-5 h-5" />
                </div>
                {item.unlocked ? (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded uppercase">LIBERADO</span>
                ) : (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-850 text-slate-500 rounded uppercase">BLOQUEADO</span>
                )}
              </div>
              <div>
                <h4 className="text-xs uppercase font-extrabold transition-all duration-200" style={{ color: 'var(--text-main)' }}>{item.name}</h4>
                <p className="text-[10px] mt-1 leading-relaxed transition-all duration-200" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 11. SALVAR JOGO TAB (Saves Slot Manager & Export)
// ==========================================
interface SalvarJogoTabProps {
  gameState: GameState;
  onManualSave: (slotIdx: number) => void;
  triggerNotification: (title: string, desc: string) => void;
}

export function SalvarJogoTab({ gameState, onManualSave, triggerNotification }: SalvarJogoTabProps) {
  const [saveSlotHeaders, setSaveSlotHeaders] = useState<any[]>([]);

  const fetchSaveSlotsFromBrowser = () => {
    const list = [1, 2, 3].map(i => {
      const raw = localStorage.getItem(`legendshub_save_slot_${i}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const savedDate = localStorage.getItem(`legendshub_save_slot_${i}_date`) || 'N/A';
          const pTeam = parsed.teams?.find((t: any) => t.id === parsed.playerTeamId);
          return {
            slotIndex: i,
            filled: true,
            teamName: pTeam ? pTeam.name : 'Org Desconhecida',
            managerName: parsed.managerName || 'Manager',
            week: parsed.week || 1,
            season: parsed.season || 2025,
            savedDate
          };
        } catch {
          return { slotIndex: i, filled: false };
        }
      }
      return { slotIndex: i, filled: false };
    });
    setSaveSlotHeaders(list);
  };

  useEffect(() => {
    fetchSaveSlotsFromBrowser();
  }, [gameState]);

  const handleSaveToSlotLocal = (slotIdx: number) => {
    onManualSave(slotIdx);
    setTimeout(() => {
      fetchSaveSlotsFromBrowser();
    }, 200);
  };

  const handleDeleteSlotLocal = (slotIdx: number) => {
    if (confirm(`Excluir permanentemente o Slot de Salvamento ${slotIdx}?`)) {
      localStorage.removeItem(`legendshub_save_slot_${slotIdx}`);
      localStorage.removeItem(`legendshub_save_slot_${slotIdx}_date`);
      fetchSaveSlotsFromBrowser();
      triggerNotification("🗑️ Save Excluído!", `O Slot de salvamento local ${slotIdx} foi limpo.`);
    }
  };

  // Export saving string
  const handleExportSaveFile = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `legendshub_fullbackup_coach.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerNotification("📂 Exportação Concluída!", "O arquivo JSON de backup foi baixado.");
    } catch {
      alert("Falha ao exportar backup.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Painel Executivo de Gravação e Slots</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
            Salve com segurança seu histórico da carreira CBLOL nos cookies locales permanentes do seu navegador ou descarregue um backup de segurança físico.
          </p>
        </div>
        <Save className="w-12 h-12 text-[#00cbd6] opacity-15 shrink-0 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {saveSlotHeaders.map((slot) => (
          <div key={slot.slotIndex} className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex flex-col justify-between shadow-md space-y-4">
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-[10px] text-[#00cbd6] tracking-widest font-extrabold uppercase pb-2 border-b border-[#1e2d44]">
                <span>SLOT LOCAL {slot.slotIndex}</span>
                {slot.filled && (
                  <button 
                    onClick={() => handleDeleteSlotLocal(slot.slotIndex)}
                    className="p-1 text-slate-500 hover:text-red-500 cursor-pointer"
                    title="Limpar Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {slot.filled ? (
                <div className="space-y-1 text-white text-[11px] font-semibold uppercase">
                  <p className="text-xs font-extrabold pb-0.5">{slot.teamName}</p>
                  <p className="text-slate-400 font-normal">MGR: {slot.managerName}</p>
                  <p className="text-[#00cbd6] text-[10px] font-mono leading-relaxed mt-1">{`Temp ${slot.season} • Sem ${slot.week - 1}`}</p>
                  <p className="text-[8.5px] text-slate-500 font-mono mt-1 uppercase">ÚLTIMO SALVE: {slot.savedDate}</p>
                </div>
              ) : (
                <div className="text-slate-500 uppercase tracking-wider font-mono text-[10.5px] py-4 text-center">
                  Espaço de Memória Vazio
                </div>
              )}
            </div>

            <button 
              onClick={() => handleSaveToSlotLocal(slot.slotIndex)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition-colors"
            >
              Gravar Progresso Corrente
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#0a1424] border border-dashed border-[#1e2d44] rounded-xl flex items-center justify-between">
        <div>
          <h4 className="font-extrabold uppercase text-white tracking-wide">Backup Físico de Carreira</h4>
          <p className="text-[10px] text-slate-405 mt-0.5">Faça o download das coordenadas do manager para transferir para outro navegador ou guardar fora da nuvem.</p>
        </div>
        <button 
          onClick={handleExportSaveFile}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" /> Exportar Dados (.json)
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 12. COMUNIDADE TAB (Fans Board & Marketing)
// ==========================================
interface ComunidadeTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
}

export function ComunidadeTab({ gameState, onUpdateGameState, triggerNotification }: ComunidadeTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId);

  if (!playerTeam) {
    return (
      <div className="text-center py-10 bg-[#0a1424] border border border-[#1e2d44] rounded-xl p-8">
        <p className="text-slate-400 font-bold uppercase tracking-wider">Você não possui um clube de eSports ativo.</p>
      </div>
    );
  }

  // Active campaigns or fan boost events
  const executeCampaign = (campaignId: string, cost: number, supportBoost: number, popBoost: number, label: string) => {
    if (playerTeam.budget < cost) {
      triggerNotification("❌ Saldo Insuficiente", "Seu clube não possui fundos suficientes para lançar este evento comunitário.");
      return;
    }

    playerTeam.budget -= cost;
    playerTeam.fansSupport = Math.min(100, playerTeam.fansSupport + supportBoost);
    playerTeam.popularity = Math.min(100, playerTeam.popularity + popBoost);

    const nextTeams = teams.map(t => t.id === playerTeamId ? { ...playerTeam } : t);
    onUpdateGameState({
      ...gameState,
      teams: nextTeams
    });

    triggerNotification("📣 Campanha Concluída!", `Sucesso ao lançar "${label}"! Satisfação dos torcedores subiu +${supportBoost}% e popularidade +${popBoost}%.`);
  };

  const socioTorcedores = Math.round(playerTeam.popularity * 145);

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Centro de Gestão de Comunidades e Torcidas</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
            Monitore o humor dos fãs, controle o apoio popular da torcida organizada e execute campanhas exclusivas de engajamento social.
          </p>
        </div>
        <Users className="w-12 h-12 text-blue-500 opacity-20 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl space-y-3.5 shadow-md">
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Satisfação da Torcida</span>
          <div className="flex justify-between items-end border-b border-[#1e2d44] pb-3">
            <h4 className="font-display font-black text-white text-2xl">{playerTeam.fansSupport}%</h4>
            <span className="text-[10px] text-slate-400 uppercase font-bold">{playerTeam.fansSupport >= 80 ? 'EXCELENTE 🔥' : playerTeam.fansSupport >= 50 ? 'ESTÁVEL 🤝' : 'PRESSIONADO ⏳'}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${playerTeam.fansSupport}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed pt-1">Torcedores felizes apoiam o time mesmo na adversidade e lotam a arena, aumentando a receita de bilheteria e vendas de camisas.</p>
        </div>

        <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl space-y-3.5 shadow-md">
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Quadro de Sócio-Torcedores</span>
          <div className="flex justify-between items-end border-b border-[#1e2d44] pb-3">
            <h4 className="font-display font-black text-white text-2xl">{socioTorcedores.toLocaleString('pt-BR')}</h4>
            <span className="text-[10px] text-slate-400 uppercase font-bold">INSCRITOS</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-[#00cbd6]" style={{ width: `${playerTeam.popularity}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed pt-1">O tamanho da fã-base cresce em conformidade com sua popularidade na mídia geral e os resultados de vitórias consecutivas.</p>
        </div>

        <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl space-y-3.5 shadow-md">
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Mídia & Sentimento Geral</span>
          <div className="flex justify-between items-end border-b border-[#1e2d44] pb-3">
            <h4 className="font-display font-black text-white text-2xl">{playerTeam.popularity}%</h4>
            <span className="text-[10px] text-slate-400 uppercase font-bold">REPUTAÇÃO</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${playerTeam.popularity}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed pt-1">A percepção externa atrai novos patrocinadores de elite e possibilita a contratação de astros ou veteranos badalados.</p>
        </div>
      </div>

      <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-[#1e2d44] pb-3">
          <Sparkles className="w-4 h-4 text-amber-400" /> Ações Ativas de Marketing Comunitário
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#070d19] border border-[#1e2d44] p-4 rounded-lg flex flex-col justify-between space-y-4 shadow">
            <div>
              <h5 className="font-bold text-white uppercase text-xs">Encontro de Fãs Presencial</h5>
              <p className="text-[10.5px] text-slate-400 mt-1">Promova uma sessão de autógrafos e fotos entre os torcedores e o elenco na Gaming House.</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-mono font-bold text-blue-400">$4.000 (Custo)</span>
              <button 
                onClick={() => executeCampaign('meetup', 4000, 6, 2, 'Encontro de Fãs Presencial')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                Lançar Campanha
              </button>
            </div>
          </div>

          <div className="bg-[#070d19] border border-[#1e2d44] p-4 rounded-lg flex flex-col justify-between space-y-4 shadow">
            <div>
              <h5 className="font-bold text-white uppercase text-xs">Distribuição de Ingressos Sociais</h5>
              <p className="text-[10.5px] text-slate-400 mt-1">Compre e distribua cargas de ingressos de arquibancada para estudantes e fãs de baixa renda.</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-mono font-bold text-blue-400">$8.000 (Custo)</span>
              <button 
                onClick={() => executeCampaign('tickets', 8000, 11, 1, 'Distribuição de Ingressos Sociais')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                Lançar Campanha
              </button>
            </div>
          </div>

          <div className="bg-[#070d19] border border-[#1e2d44] p-4 rounded-lg flex flex-col justify-between space-y-4 shadow">
            <div>
              <h5 className="font-bold text-white uppercase text-xs">Ação Social Solidária</h5>
              <p className="text-[10.5px] text-slate-400 mt-1">Engaje sua organização em campanhas locais de doação e patrocínio filantrópico.</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-mono font-bold text-blue-400">$5.000 (Custo)</span>
              <button 
                onClick={() => executeCampaign('charity', 5000, 8, 3, 'Ação Social Solidária')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                Lançar Campanha
              </button>
            </div>
          </div>

          <div className="bg-[#070d19] border border-[#1e2d44] p-4 rounded-lg flex flex-col justify-between space-y-4 shadow">
            <div>
              <h5 className="font-bold text-white uppercase text-xs">Transmissão com Influenciadores</h5>
              <p className="text-[10.5px] text-slate-400 mt-1">Contrate streamers de elite para transmitir treinos abertos de sábado e reações ao vivo.</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-mono font-bold text-blue-400">$12.000 (Custo)</span>
              <button 
                onClick={() => executeCampaign('streamers', 12000, 4, 10, 'Transmissão com Influenciadores')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                Lançar Campanha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. CENTRAL DE EMPREGOS TAB (Job Center & Resignation)
// ==========================================
interface CentralDeEmpregosTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
}

export function CentralDeEmpregosTab({ gameState, onUpdateGameState, triggerNotification }: CentralDeEmpregosTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId);

  const applyForJob = (targetTeam: Team) => {
    // Logic to sign with local team
    const updatedTeams = teams.map(t => {
      if (t.id === playerTeamId) {
        return { ...t, isPlayerControlled: false };
      }
      if (t.id === targetTeam.id) {
        return { ...t, isPlayerControlled: true, boardTrust: 70 };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      playerTeamId: targetTeam.id,
      teams: updatedTeams
    });

    triggerNotification("✍️ Novo Vínculo Contratual!", `Parabéns! Contrato firmado com êxito! Você assumiu o cargo de Manager Oficial da organização "${targetTeam.name}" com metas revisadas.`);
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Central Profissional de Oportunidades & Empregos</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
            Encontre propostas corporativas de outras equipes na liga de eSports ou peça demissão de forma imediata do seu cargo atual.
          </p>
        </div>
        <Briefcase className="w-12 h-12 text-[#00cbd6] opacity-20 shrink-0" />
      </div>

      {playerTeam ? (
        <div className="bg-red-500/5 border border-red-500/25 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-extrabold uppercase text-white mb-0.5 tracking-wide text-xs">Você está Ativo na Organização: <span className="text-red-400 font-bold">{playerTeam.name}</span></h4>
            <p className="text-[10px] text-slate-400">Se você desejar abandonar seu time e buscar novos desafios pelo cenário livre, peça demissão no botão ao lado.</p>
          </div>
          <button 
            onClick={() => {
              if (confirm("🚨 ATENÇÃO: Tem certeza de que deseja pedir demissão de forma imediata de seu clube? Você perderá todo seu crédito e prestígio de liderança local!")) {
                const nextTeams = teams.map(t => t.id === playerTeamId ? { ...t, isPlayerControlled: false } : t);
                onUpdateGameState({
                  ...gameState,
                  playerTeamId: '',
                  teams: nextTeams
                });
                triggerNotification("⚠️ Demissão Declarada!", `Você rescindiu unilateralmente o contrato com a ${playerTeam.name}. Agora você é um Free Agent!`);
              }
            }}
            className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Pedir Demissão Imediata
          </button>
        </div>
      ) : (
        <div className="bg-amber-600/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
          <div>
            <h4 className="font-extrabold uppercase text-amber-500 tracking-wide text-xs">Você é Atualmente um Free Agent (Desempregado)</h4>
            <p className="text-[10.5px] text-slate-300">Escolha uma das organizações operacionais abaixo para aceitar sua proposta contratual e liderar o clube a glórias na Superliga!</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-white">Vagas Disponíveis na Liga</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => {
            const isCurrent = t.id === playerTeamId;
            return (
              <div key={t.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 shadow transition-all ${
                isCurrent 
                  ? 'bg-blue-500/5 border-blue-500/40' 
                  : 'bg-[#0a1424] border-[#1e2d44] hover:border-slate-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white uppercase text-xs shadow" 
                      style={{ backgroundColor: t.primaryColor || '#1e293b' }}
                    >
                      {t.acronym || t.name.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[11px] uppercase tracking-wide">{t.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Orçamento: $ {t.budget.toLocaleString('pt-BR')} | Pop: {t.popularity}%</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[8px] bg-blue-500/15 border border-blue-500/35 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase font-mono animate-pulse">
                      SEU CLUBE ATUAL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#1e2d44] pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-450 uppercase font-bold block">Status da Vaga</span>
                    <span className="text-[10px] text-emerald-450 font-bold uppercase font-mono">Disponível</span>
                  </div>
                  {!isCurrent && (
                    <button 
                      onClick={() => applyForJob(t)}
                      className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                    >
                      Assinar Contrato
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

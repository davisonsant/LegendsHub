/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Keyboard, Trophy, Shield, Building2, Store, Users, DollarSign, 
  TrendingUp, BarChart3, Tv, Award, Play, Sliders, Zap, Gamepad2, 
  Calendar, Check, AlertCircle, Sparkles, ChevronRight, Heart, Crown, 
  Medal, Save, HardDrive, Trash2, Import, Download, User, Briefcase, Megaphone
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
// 3. TIMES TAB (League Rosters Explorer)
// ==========================================
interface TimesTabProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
  onSelectPlayer?: (playerId: string) => void;
}

export function TimesTab({ gameState, theme, onSelectPlayer }: TimesTabProps) {
  const { teams } = gameState;
  const s = getThemeStyles(theme);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans">
      <div className="lg:col-span-4 space-y-2.5">
        <span className={`block text-[9px] uppercase font-bold ${s.textMuted} tracking-wider`}>Selecione o Clube rivals</span>
        <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
          {teams.map(t => {
            const isSel = t.id === selectedTeamId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`w-full p-2.5 text-left rounded-lg border uppercase tracking-wider flex justify-between items-center transition-all cursor-pointer ${
                  isSel 
                    ? 'border-sky-500 bg-sky-500/15 font-black text-sky-650' 
                    : `${s.borderMuted} ${s.bgCard} text-slate-400 ${s.hoverBg}`
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                  <span className="text-xs truncate">{t.name}</span>
                </div>
                <span className={`text-[10px] font-mono ${s.textMuted}`}>OVR {Math.floor(t.roster.reduce((a, b) => a + b.overallRating, 0) / 5)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`lg:col-span-8 ${s.bgCard} rounded-xl p-5 shadow-lg space-y-6`}>
        {activeTeam && (
          <>
            <div className={`flex justify-between items-center border-b ${s.borderMuted} pb-4`}>
              <div>
                <h3 className={`font-display ${s.textWhiteOrSlate} text-base font-black uppercase tracking-wider`}>{activeTeam.name} ({activeTeam.acronym})</h3>
                <p className={`text-[10px] ${s.textMuted} mt-1 uppercase`}>Região Oficial: {activeTeam.region || 'CBLOL'} • Fans: {activeTeam.popularity}%</p>
              </div>
              <div className="px-3 py-1.5 bg-sky-500/10 rounded border border-sky-400/25">
                <span className="text-[10px] font-mono text-[#00cbd6] font-bold">OVR TEAM: {Math.floor(activeTeam.roster.reduce((a, b) => a + b.overallRating, 0) / 5)}</span>
              </div>
            </div>

            <div className="space-y-3.5">
              <span className={`block text-[9.5px] uppercase font-bold ${s.textMuted}`}>Escalação Atleta de Rote</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {activeTeam.roster.map((player) => {
                  const CardComponent = onSelectPlayer ? 'button' : 'div';
                  return (
                    <CardComponent 
                      key={player.id} 
                      onClick={onSelectPlayer ? () => onSelectPlayer(player.id) : undefined}
                      className={`w-full text-center ${s.bgInnerCard} p-3 rounded-lg text-center space-y-2 relative group focus:outline-none focus:ring-1 focus:ring-sky-400/50 ${onSelectPlayer ? 'cursor-pointer hover:bg-slate-100/55 dark:hover:bg-slate-900/55 transition-all hover:scale-[1.02]' : ''}`}
                    >
                      <span className="absolute top-1 right-1 text-[#00cbd6] font-mono text-[9px] font-extrabold">OVR {player.overallRating}</span>
                      <div className="w-10 h-10 rounded-full mx-auto bg-slate-500/10 flex items-center justify-center font-bold text-blue-400 border border-blue-500/20 text-xs group-hover:scale-105 duration-200">
                        {player.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`text-[11px] font-black ${s.textWhiteOrSlate} truncate uppercase group-hover:text-sky-400 transition-colors`} title={player.name}>{player.name}</h4>
                        <p className={`text-[8px] font-mono ${s.textMuted} font-extrabold mt-0.5`}>{player.position}</p>
                        {onSelectPlayer && (
                          <span className="text-[7.5px] text-sky-400 font-bold uppercase mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">Ver Perfil</span>
                        )}
                      </div>
                    </CardComponent>
                  );
                })}
              </div>
            </div>

            <div className={`p-4 ${s.bgInnerCard} rounded-xl space-y-2`}>
              <h4 className="text-[10px] text-sky-400 uppercase tracking-wider font-extrabold">Sede Operacional</h4>
              <p className={`text-[10.5px] ${s.textMuted} leading-relaxed`}>
                Nível estrutural de Gaming House: {activeTeam.infrastructure.gamingHouseLevel} • Centro de Jogos: {activeTeam.infrastructure.trainingCenterLevel}. Caixa aproximado de Orçamento: <strong className={s.textWhiteOrSlate}>$ {(activeTeam.budget / 1000).toLocaleString('pt-BR')}k</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
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

  // Pricing inputs
  const [jerseyPrice, setJerseyPrice] = useState(69);
  const [ticketPrice, setTicketPrice] = useState(25);

  const [lastPitchTime, setLastPitchTime] = useState<number>(0);
  const [pitchAnswer, setPitchAnswer] = useState('');

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
      const nextTeams = teams.map(t => (t.id === playerTeamId ? { ...playerTeam } : t));
      onUpdateGameState({ ...gameState, teams: nextTeams });
      triggerNotification("🎙️ Board Room Compromisso!", desc);
    }
    setPitchAnswer(desc);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans">
      <div className="lg:col-span-6 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-md space-y-5">
        <div className="border-b border-[#1e2d44] pb-3 flex items-center gap-2">
          <Store className="w-5 h-5 text-[#00cbd6]" />
          <h3 className="text-xs uppercase font-extrabold text-white">Gere Loja de Merchandising (Fan Shop)</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Preço da Camisa Oficial</span>
              <span className="text-white font-mono font-bold">$ {jerseyPrice} dólares</span>
            </div>
            <input 
              type="range" 
              min={39} 
              max={149} 
              value={jerseyPrice} 
              onChange={(e) => setJerseyPrice(Number(e.target.value))} 
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Preço do Ingresso na Arena</span>
              <span className="text-white font-mono font-bold">$ {ticketPrice} dólares</span>
            </div>
            <input 
              type="range" 
              min={15} 
              max={59} 
              value={ticketPrice} 
              onChange={(e) => setTicketPrice(Number(e.target.value))} 
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <p className="text-[10.5px] text-slate-400 italic bg-slate-500/5 p-3 rounded-lg border border-slate-205/10 leading-relaxed">
            💡 Nota de Marketing: Preços altos maximizam o ganho em semanas vitoriosas, mas podem irritar os fãs em oscilações de derrotas. Encontre a estabilidade ideal.
          </p>
        </div>
      </div>

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

        {pitchAnswer && (
          <div className="p-3.5 bg-sky-500/10 border border-sky-400/20 text-[11px] font-semibold text-white rounded-lg flex gap-2 items-start leading-relaxed animate-fade-in">
            <AlertCircle className="w-4.5 h-4.5 text-[#00cbd6] shrink-0" />
            <div>{pitchAnswer}</div>
          </div>
        )}
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
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl">
        <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Estatísticas do Splits & CBLOL Superstars</h3>
        <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
          Quadro métrico de acompanhamento geral de ratings e desempenhos individuais. Atletas no topo valem milhões no mercado scout.
        </p>
      </div>

      <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-[#1e2d44] bg-[#070d19] text-white font-extrabold uppercase tracking-wider">
          Top 10 Melhores Jogadores (Ratings)
        </div>

        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#1e2d44] text-[9px] text-[#00d2fd] font-extrabold uppercase tracking-widest bg-[#0a1424]">
          <div className="col-span-1">#</div>
          <div className="col-span-4">ATLETA</div>
          <div className="col-span-2 text-center">ROTA</div>
          <div className="col-span-3">TIME ATUAL</div>
          <div className="col-span-2 text-right">RATING</div>
        </div>

        <div className="divide-y divide-[#1e2d44]/50 text-[11px] font-semibold text-white">
          {topRating.map((p, idx) => {
            const RowComponent = onSelectPlayer ? 'button' : 'div';
            return (
              <RowComponent 
                key={p.id} 
                onClick={onSelectPlayer ? () => onSelectPlayer(p.id) : undefined}
                className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[#070d19]/60 w-full text-left border-none focus:outline-none focus:ring-1 focus:ring-[#00cbd6]/30 ${onSelectPlayer ? 'cursor-pointer group' : ''}`}
              >
                <div className="col-span-1 font-mono text-slate-500 font-bold">{idx + 1}</div>
                <div className={`col-span-4 flex items-center gap-1.5 font-bold ${onSelectPlayer ? 'text-sky-400 group-hover:text-[#00cbd6] transition-colors' : ''}`}>{p.name}</div>
                <div className="col-span-2 text-center text-sky-400 font-mono font-bold font-extrabold">{p.position}</div>
                <div className="col-span-3 text-slate-400 uppercase font-bold">{p.customPlayer as any}</div>
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

export function SoloQueueTab({ gameState, onUpdateGameState, triggerNotification, onSelectPlayer }: SoloQueueTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  // Let's create an elegant ranked list
  const [soloStats, setSoloStats] = useState(() => {
    return playerTeam.roster.map(p => {
      // procedural rank points based on player ratings
      const seed = p.overallRating * 11 + (p.name.charCodeAt(0) || 12);
      const lp = (seed % 650) + 600; // Masters to Challenger range 600-1250 LP
      const wr = 51 + (seed % 9);
      return {
        id: playerTeamId,
        playerId: p.id,
        name: p.name,
        pos: p.position,
        lp,
        winrate: wr,
        rating: p.overallRating
      };
    });
  });

  const handleIncentivizeQueue = (pId: string, lpAdd: number) => {
    if (playerTeam.budget < 2000) {
      alert("Precisamos de pelo menos $2.000 para kits nutricionais e energia!");
      return;
    }

    // modify lp stats inside table list
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

    // grant subtle overall rating bonus to athlete
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
          budget: t.budget - 2000,
          roster: nextRoster
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("🔥 Solo Queue Impulsionada!", `Focus drill aplicado para jogador, garantindo +1 no treino mecânico!`);
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-display text-white text-base font-black uppercase tracking-wider">Fila Solo Queue (Rift Core Rank)</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
            Acompanhe o rendimento do seu roster nas filas oficiais de rank do servidor. Treinar na solo queue aprimora as mecânicas.
          </p>
        </div>
        <Tv className="w-12 h-12 text-[#00cbd6] opacity-15 shrink-0" />
      </div>

      <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl overflow-hidden shadow-lg">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#1e2d44] text-[9px] text-[#00cbd6] font-extrabold uppercase tracking-widest bg-[#070d19]/40">
          <div className="col-span-3">ATLETA</div>
          <div className="col-span-2 text-center">ROTA</div>
          <div className="col-span-3 text-center">RANKING ELO</div>
          <div className="col-span-2 text-center">CS WINRATE</div>
          <div className="col-span-2 text-right">AÇÕES</div>
        </div>

        <div className="divide-y divide-[#1e2d44]/50 font-semibold text-white">
          {soloStats.map(item => (
            <div key={item.playerId} className="grid grid-cols-12 px-5 py-4 items-center">
              <div className="col-span-3 flex items-center gap-1.5">
                {onSelectPlayer ? (
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(item.playerId)}
                    className="hover:underline hover:text-sky-305 font-bold focus:outline-none transition-colors duration-150 cursor-pointer text-left flex items-center gap-1 bg-transparent border-none text-sky-400"
                  >
                    {item.name}
                  </button>
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
              <div className="col-span-2 text-center font-mono font-bold text-slate-400">{item.pos}</div>
              <div className="col-span-3 text-center">
                <span className="text-[#00cbd6] font-black uppercase">Challenger 💎 {item.lp} LP</span>
              </div>
              <div className="col-span-2 text-center text-emerald-400 text-[11.5px] font-mono leading-none">
                {item.winrate}% WR
              </div>
              <div className="col-span-2 text-right">
                <button
                  onClick={() => handleIncentivizeQueue(item.playerId, 35)}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 hover:bg-opacity-95 text-white font-extrabold uppercase text-[9.5px] rounded tracking-wider transition-colors cursor-pointer"
                >
                  Gamer Soda: $2k
                </button>
              </div>
            </div>
          ))}
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
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-display text-white text-sm font-black uppercase tracking-wider">Patch Tático da Operação (Summoner's Rift Meta)</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">
            Acompanhe o balanceamento do patch de Summoner's Rift corrente. Escolher campeões com maior tactical power amplifica as chances de draft.
          </p>
        </div>
        <span className="px-2.5 py-1.5 bg-[#00cbd6]/10 text-[#00cbd6] border border-[#00cbd6]/25 rounded text-[10.5px] font-mono uppercase font-black tracking-widest leading-none">
          PATCH OPERACIONAL {gameState.currentPatch?.version || '15.1'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {(champions || []).slice(0, 15).map(c => (
          <div key={c.id} className="bg-[#0a1424] border border-[#1e2d44] hover:border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-md space-y-3">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#1e2d44]/65">
                <span className="text-xs uppercase font-black text-white">{c.name}</span>
                <span className="w-5.5 h-5.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {c.tier}
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 leading-none">
                ROTAS HABILITADAS: <span className="text-sky-300 font-extrabold uppercase">{c.roles.join(', ')}</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed italic truncate">"{c.idealPlaystyle}"</p>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-[#1e2d44]/35 text-[9.5px]">
              <span className="text-slate-500 font-mono font-bold">POWER CAP: {c.power}</span>
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
      <div className="bg-[#0a1424] border border-[#1e2d44] p-5.5 rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center font-black text-[#00cbd6] border border-blue-500/25 text-sm uppercase shrink-0">
          {managerName.charAt(0)}
        </div>
        <div>
          <h3 className="font-display text-white text-base font-black uppercase tracking-wider">{managerName}</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase">Manager Oficial • Status CBLOL • Split Ativo Semana {week}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((item, id) => {
          const Badge = item.badge;
          return (
            <div key={id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3.5 shadow transition-all ${
              item.unlocked 
                ? 'bg-blue-500/5 border-sky-400/35' 
                : 'bg-[#0a1424] border-[#1e2d44] opacity-50'
            }`}>
              <div className="flex justify-between items-start">
                <div className={`p-2 bg-slate-500/10 rounded-lg ${item.unlocked ? 'text-sky-400' : 'text-slate-505'}`}>
                  <Badge className="w-5 h-5" />
                </div>
                {item.unlocked ? (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded uppercase">LIBERADO</span>
                ) : (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded uppercase">BLOQUEADO</span>
                )}
              </div>
              <div>
                <h4 className="text-xs uppercase font-extrabold text-white">{item.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
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

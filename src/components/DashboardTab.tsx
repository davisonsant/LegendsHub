/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { GameState, InterviewQuestion, Team } from '../types';
import { formatMoney } from '../utils/currency';
import { INTERVIEW_QUESTIONS } from '../data/initialDatabase';

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
  const isDark = theme === 'dark';
  
  const getS = () => {
    return {
      bgPage: isDark ? 'space-y-6 font-sans bg-slate-950 select-none text-slate-100 p-0' : 'space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800 p-0',
      bgCard: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-white hover:border-[#2a3f5f] transition-all' : 'bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-slate-800 hover:border-slate-300 transition-all',
      bgCardNoFlex: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800',
      bgCardNoFlexP6: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-850',
      textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
      textMain: isDark ? 'text-white' : 'text-slate-800',
      bgInner: isDark ? 'bg-[#070d19]/85 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-100',
      divider: isDark ? 'divide-[#1e2d44]/50' : 'divide-slate-200/50',
      borderLine: isDark ? 'border-[#1e2d44]/50' : 'border-slate-100',
      textWhiteOrSlate: isDark ? 'text-white' : 'text-slate-850',
    };
  };
  const s = getS();

  const { week, stage, season, teams, playerTeamId, currentPatch, roundsPlayedThisWeek } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId) || teams[0];
  
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
    .filter(t => t.region === playerTeam.region || !t.region)
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

  // Redes Sociais & Press Feed databases (handles aligned to requirements)
  const proceduralTweets = [
    {
      id: "tw_baiano",
      username: "Baiano",
      handle: "@baianolol1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/baianolol1.png",
      content: "O clássico LOUD vs paiN nessa rodada nesta semana vai parar o cenário competitivo de eSports! Disputa acirradíssima pelo topo da liga. Quem perder vai aguentar sarro da torcida rival. Qual seu palpite? 🔥",
      likes: 8520,
      retweets: 3200,
      timeAgo: "23 min atrás"
    },
    {
      id: "tw_brtt",
      username: "Felipe brtt",
      handle: "@brttOficial",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/brttOficial.png",
      content: "LOUD contra paiN nos palcos... se vacilarem na fase de rotas ou errarem o pick de escala do patch, já era. Esse duelo de liderança do CBLOL vai ser decidido nos detalhes técnicos! 👊",
      likes: 9340,
      retweets: 4100,
      timeAgo: "45 min atrás"
    },
    {
      id: "tw_smurfdomuca",
      username: "Muca Esports",
      handle: "@smurfdomuca",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/smurfdomuca.png",
      content: "Clima tenso total! Bull negociando renovação e o YoungJae descontente com treinos exaustivos coletivos. Coach e manager vão ter que operar milagre pra manter o vestiário alinhado essa semana.",
      likes: 3820,
      retweets: 740,
      timeAgo: "1h atrás"
    },
    {
      id: "tw_ranger",
      username: "Ranger",
      handle: "@rangerlol1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/rangerlol1.png",
      content: "Análise fria: LOUD (2-1) está demonstrando ótimas transições de macro, mas a paiN (3-0) chega embalada e dominante. Jogo chave no CBLOL pra ver quem é o verdadeiro líder de ritmo.",
      likes: 5690,
      retweets: 1250,
      timeAgo: "2h atrás"
    },
    {
      id: "tw_peterjordan",
      username: "Peter Jordan",
      handle: "@peterjordan",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/peterjordan.png",
      content: "Drakos botando uma proposta de patrocínio gigante na mesa e o manager decidindo. O competitivo de eSports brasileiro subiu de patamar absoluto em economia financeira! 🚀",
      likes: 12800,
      retweets: 4500,
      timeAgo: "3h atrás"
    },
    {
      id: "tw_fan_1",
      username: "Mateus Silva Esports",
      handle: "@esport_fanatic",
      verified: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "PROCEDURAL" as const,
      profile_image_url: "/assets/profiles/fans/fan_avatar_5.png",
      content: "Se perdermos o Bull e não contratarmos um Atirador peso-pesado essa semana, o split tá completamente comprometido. Manager precisa acordar rápido!",
      likes: 1420,
      retweets: 305,
      timeAgo: "3h atrás"
    },
    {
      id: "tw_fan_2",
      username: "Rafaela Mendes",
      handle: "@rafalol99",
      verified: false,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "PROCEDURAL" as const,
      profile_image_url: "/assets/profiles/fans/fan_avatar_18.png",
      content: "Drakos como novo patrocinador seria incrível para a infraestrutura dos treinos, bora assinar logo essa proposta comercial @LOUD_eSports!",
      likes: 2150,
      retweets: 490,
      timeAgo: "4h atrás"
    },
    {
      id: "tw_dynquedo",
      username: "dynquedo",
      handle: "@dynquedo1",
      verified: true,
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100",
      profile_image_type: "FIXED" as const,
      profile_image_url: "/assets/profiles/dynquedo1.png",
      content: "Foco total na preparação técnica desta rodada. Respeitamos muito o adversário, mas vamos com tudo buscar essa vitória no clássico pra nossa torcida maravilhosa!",
      likes: 7200,
      retweets: 1850,
      timeAgo: "5h atrás"
    }
  ];

  const pressArticles = [
    {
      id: "art_1",
      outlet: "ESPN",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/espn.png",
      headline: "Drakos anuncia proposta de cooperação comercial bilionária para LOUD",
      commentary: "A marca Drakos pretende injetar verbas expressivas para estampar seu logotipo em canais oficiais e camisetas da organização. A diretoria já sinalizou aprovação, restando a validação final do manager da Gaming House.",
      impact: { diretoria: 10, torcida: 5 },
      kpis: ["+10 DIRETORIA", "+5 TORCIDA"]
    },
    {
      id: "art_2",
      outlet: "Mais Esports",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/mais_esports.png",
      headline: "Crise na LOUD? YoungJae relata exaustão física por cargas excessivas de treino",
      commentary: "Questões de bem-estar na gaming house vêm à tona. Relatos sugerem desgaste e desconforto extremo de YoungJae sobre a atual rotina de preparação, ligando sinal de atenção para a química com o time.",
      impact: { vestiario: -10, imprensa: 5 },
      kpis: ["-10 VESTIÁRIO", "+5 IMPRENSA"]
    },
    {
      id: "art_3",
      outlet: "Ilha das Lendas",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/ilha_das_lendas.png",
      headline: "Impasse contratual com Bull acende alerta de perda de joia do CBLOL",
      commentary: "Apenas 2 semanas restantes no contrato oficial do atirador Bull. Empresários já admitem propostas externas vigorosas de rivais diretos de tabela, exigindo ação ágil no painel de pessoal da organização.",
      impact: { diretoria: -5, vestiario: -5 },
      kpis: ["-5 DIRETORIA", "-5 VESTIÁRIO"]
    },
    {
      id: "art_4",
      outlet: "Riot Games",
      outlet_logo_type: "FIXED" as const,
      outlet_logo_url: "/assets/press/riot_games.png",
      headline: "Novas notas de patch de Summoner's Rift trazem buffs pesados para lutadores",
      commentary: "Riot Games decreta a ascensão dos bruisers. Atiradores com escalada longa sofrem abalos táticos pesados baseados em velocidade tática e invasão de selva rápida.",
      impact: { imprensa: 10 },
      kpis: ["+10 IMPRENSA"]
    },
    {
      id: "art_5",
      outlet: "Gank Diário",
      outlet_logo_type: "PROCEDURAL" as const,
      outlet_logo_url: "/assets/press/procedural/blog_logo_3.png",
      headline: "A corrida pelo MVP do CBLOL: Quem desponta como favorito?",
      commentary: "Com apenas algumas rodadas jogadas, analistas e o público debatem intensamente quem carregará o título da temporada de eSports.",
      impact: { imprensa: 5 },
      kpis: ["+5 IMPRENSA"]
    },
    {
      id: "art_6",
      outlet: "Summoners News",
      outlet_logo_type: "PROCEDURAL" as const,
      outlet_logo_url: "/assets/press/procedural/blog_logo_1.png",
      headline: "Comunidade reage ao patch: 'A selva nunca esteve tão perigosa'",
      commentary: "Os caçadores profissionais estão correndo contra o tempo para dominar novos tempos de surgimento de monstros e taxas de cura.",
      impact: { torcida: 5 },
      kpis: ["+5 TORCIDA"]
    }
  ];

  return (
    <div className={s.bgPage}>
      
      {/* 1. HEADER & ALERTS HUD TRAY */}
      <div className="space-y-4">
        {/* News Ticker */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 overflow-hidden ${
          isDark ? 'bg-indigo-950/20 border-indigo-900/30' : 'bg-blue-50/60 border-blue-105'
        }`}>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500 rounded text-white text-[10px] font-black uppercase tracking-wider shrink-0 animate-pulse">
            <Radio className="w-3.5 h-3.5" /> URGENTE
          </div>
          <div className="text-xs font-bold truncate leading-none">
            <span className={s.textMuted}>[SALA DE IMPRENSA]: </span>
            <span className={s.textWhiteOrSlate}>LOUD (2V-1D) e paiN Gaming (3V-0D) duelam no El Clásico na rodada 3 valendo a liderança isolada. Bull tem 2 semanas de contrato restante, nova proposta Drakos disponível!</span>
          </div>
        </div>

        {/* Urgent Critical Alerts Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contracts Alert */}
          <div 
            onClick={() => onSelectTab('Jogadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-amber-955/10 border-amber-500/20 hover:border-amber-500/40' : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-amber-600">Alerta de Jogador</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>Contrato de Bull Expirando</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Faltam apenas <strong>2 semanas</strong> de contrato! Renove agora antes que ele declare Free Agent.
            </p>
          </div>

          {/* Sponsors Alert */}
          <div 
            onClick={() => onSelectTab('Patrocinadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-emerald-955/10 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-emerald-600">Proposta Comercial</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>Sponsor Drakos Disponível</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Proposta ativa para assinar e inflar os cofres com bônus de performance master semanal.
            </p>
          </div>

          {/* Dissatisfaction/Training Alert */}
          <div 
            onClick={() => onSelectTab('Jogadores')}
            className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${
              isDark ? 'bg-rose-955/10 border-rose-500/20 hover:border-rose-500/40' : 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-mono font-black text-rose-600">Fadiga e Vestiário</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className={`text-xs font-black ${s.textWhiteOrSlate}`}>YoungJae Insatisfeito</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Atleta relata alta fadiga com treinos. Ajuste planos táticos no roster de jogadores.
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
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Temporada {season}</p>
            <h2 className={`font-display ${isDark ? 'text-sky-400' : 'text-blue-600'} text-2xl font-black mt-1`}>SEMANA {week}</h2>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2 py-0.5 ${isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'} font-mono text-[9px] rounded font-extrabold uppercase`}>
              TRANSFERÊNCIAS: 15 DIAS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Board Trust - Clickable, redirect to Escritório */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Escritório')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Confiança da Diretoria</p>
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
              <span>Status: Excelente</span>
              <span>Roteamento: Escritório</span>
            </div>
          </div>
        </div>

        {/* Popular Support - Clickable, redirect to Comunidade */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Comunidade')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Apoio Popular</p>
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
              <span>Torcida Engajada</span>
              <span>Roteamento: Comunidade</span>
            </div>
          </div>
        </div>

        {/* Team Chemistry - Clickable, redirect to Jogadores */}
        <div className={`${s.bgCard} cursor-pointer group`} onClick={() => onSelectTab('Jogadores')}>
          <div>
            <div className="flex justify-between items-center">
              <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Química com o Time</p>
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
              <span>Vestiário: Estável</span>
              <span>Roteamento: Jogadores</span>
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
                  Próximo Desafio do Split: Confronto de Elite
                </h3>
                <p className={`text-[10px] ${s.textMuted} font-medium`}>Fase de Grupos • Série Melhor de 3</p>
              </div>
              <span className="bg-pink-50 text-pink-600 border border-pink-100 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded uppercase tracking-wider leading-none">
                {stage === 'SPLIT_PLAYOFFS' ? 'PLAYOFF FINALS' : `RODADA ${week}`}
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
                      {playerTeam.wins}V - {playerTeam.losses}D
                    </p>
                  </div>

                  {/* VS Middle Hub */}
                  <div className="flex flex-col items-center">
                    <div className={`px-5 py-2.5 ${isDark ? 'bg-slate-900 border-slate-700 text-sky-400' : 'bg-slate-50 border-slate-200 text-blue-650'} border font-mono text-xs font-black tracking-widest rounded-lg`}>
                      VS
                    </div>
                    
                    {/* Two Simulation Pathways */}
                    <div className="flex flex-col gap-2 w-full mt-5 max-w-[170px]">
                      {roundsPlayedThisWeek ? (
                        <div className="text-center bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase font-mono py-2 rounded border border-emerald-150">
                          SÉRIE RESOLVIDA
                        </div>
                      ) : (
                        <>
                          {/* Pathway 1: Instant Simulation */}
                          <button
                            onClick={handleTriggerInstantSim}
                            className="bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all text-[9.5px] font-bold uppercase tracking-wider py-2 px-3 rounded-md cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Simular Instantâneo
                          </button>

                          {/* Pathway 2: Picks and Bans/Draft Center */}
                          <button
                            onClick={() => onSelectTab('Match Center')}
                            className="bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all text-[9.5px] font-bold uppercase tracking-wider py-2  px-3 rounded-md cursor-pointer flex items-center justify-center gap-1 shadow-md"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Iniciar Draft
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
                      {opponentTeamObj.wins}V - {opponentTeamObj.losses}D
                    </p>
                  </div>
                </div>

                {/* Subtext explaining standard layout */}
                <p className={`text-[10.5px] text-center ${s.textMuted} font-medium mt-6 leading-normal`}>
                  * A simulação instantânea resolve matematicamente a melhor de 3, entregando bônus de torcida e prestígio de imediato. A simulação tática leva você à fase técnica estratégica de Picks & Bans.
                </p>
              </div>
            ) : (
              <div className={`text-center py-10 ${s.textMuted} text-xs font-semibold uppercase tracking-widest flex flex-col items-center gap-4 justify-center`}>
                <span>Nenhuma partida agendada para esta semana de offseason. Pronto para iniciar o Split!</span>
                <button
                  onClick={onNextWeek}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-display text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Avançar para Semana 1
                </button>
              </div>
            )}

            {/* Simulated match success scoreboard banner */}
            {showSimResult?.visible && (
              <div className="mt-4 p-5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 animate-fade-in space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">RESULTADO DA SIMULAÇÃO INSTANTÂNEA</p>
                  </div>
                  <button 
                    onClick={() => setShowSimResult(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-mono text-[10px] font-bold uppercase"
                  >
                    FECHAR
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
                  {showSimResult.playerWon 
                    ? `🏆 Parabéns! O algoritmo calculou vitória para a ${playerTeam.name}. Seus pontos na tabela subiram +3 e recebemos boosts no moral da diretoria e popularidade de torcida!`
                    : `⚠️ Derrota computada. Os adversários leram melhor as nuances estruturais do patch atual contra o nosso roster. Revise os treinamentos de químicas no painel de Jogadores!`
                  }
                </p>
              </div>
            )}

            {/* Advance week quick action banner */}
            {roundsPlayedThisWeek && opponentTeamObj && (
              <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'} animate-fade-in flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">RODADA CONCLUÍDA</p>
                  </div>
                  <p className={`text-xs ${s.textMuted} max-w-xl`}>
                    Todas as obrigações e confrontos desta semana foram finalizados. Avance a semana para coletar os dinheiros dos patrocinadores, sofrer patches e evoluir seu time!
                  </p>
                </div>
                <button
                  onClick={onNextWeek}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer w-full md:w-auto text-center shrink-0 animate-pulse"
                >
                  AVANÇAR SEMANA
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
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">Agenda da Semana</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 font-mono font-bold rounded">CALENDÁRIO</span>
              </div>
              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between items-center bg-black/5 dark:bg-black/15 p-2 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Seg - Ter</span>
                  <span className={s.textWhiteOrSlate}>Scrims Táticas e Análises VODs</span>
                </div>
                <div className="flex justify-between items-center bg-black/5 dark:bg-black/15 p-2 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Qua - Qui</span>
                  <span className={s.textWhiteOrSlate}>Preparação Física e Folga Mental</span>
                </div>
                <div className="flex justify-between items-center bg-blue-600/10 p-2 rounded border border-blue-500/20">
                  <span className="text-[10px] uppercase font-black text-rose-500">DOMINGO</span>
                  <span className="font-bold text-rose-500">El Clásico contra paiN Gaming</span>
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-3.5 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                Ver Programação Completa →
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
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">Classificação CBLOL</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-600 font-mono font-bold rounded">LIGA</span>
              </div>
              
              <div className="space-y-2 text-xs font-bold font-mono">
                {sortedStandings.map((t, idx) => {
                  const isPlayer = t.id === playerTeam.id;
                  const isOpp = opponentTeamObj && t.id === opponentTeamObj.id;
                  return (
                    <div 
                      key={t.id} 
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
                        <span className={s.textWhiteOrSlate}>{t.name}</span>
                      </div>
                      <span className="text-[11px]">{t.wins}V - {t.losses}D</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4 uppercase tracking-wider group-hover:text-violet-500 transition-colors">
                Ver Tabela Completa →
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
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">Saúde Financeira</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-mono font-bold rounded">ESCRITÓRIO</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 text-xs font-bold font-mono">
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">Caixa Disponível</p>
                  <p className="text-[13px] text-emerald-500 leading-tight mt-1">
                    {formatMoney(playerTeam.budget)}
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">Gasto Corrente</p>
                  <p className="text-[13px] text-rose-500 leading-tight mt-1">
                    $ {(weeklyExpense / 1000).toFixed(1)}K / sem
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase">Receita Líquida</p>
                  <p className="text-[13px] text-sky-400 leading-tight mt-1">
                    $ {(weeklyRevenue / 1000).toFixed(1)}K / sem
                  </p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-black/15 rounded">
                  <p className="text-[9px] text-slate-500 uppercase font-bold text-amber-500">Runway Estimada</p>
                  <p className="text-[13px] text-amber-500 leading-tight mt-1">
                    {runwayWeeks} Semanas
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4.5 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">
                Acessar Operações Financeiras →
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
                  <span className="font-display text-xs font-black uppercase tracking-wider text-slate-400">Summoner's Rift Patch</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 font-mono font-bold rounded">META</span>
              </div>
              <p className={`${s.textMuted} text-[11px] font-sans leading-normal mb-3`}>
                {currentPatch.metaDescription.substring(0, 75)}...
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-500 mr-1 shrink-0 font-mono">+4 TÁTICO:</span>
                  {currentPatch.buffedChampions.slice(0, 3).map((cid, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 font-mono text-[9px] font-bold uppercase rounded border border-emerald-500/10">
                      {cid.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-rose-500 mr-1 shrink-0 font-mono">-4 TÁTICO:</span>
                  {currentPatch.nerfedChampions.slice(0, 3).map((cid, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 font-mono text-[9px] font-bold uppercase rounded border border-rose-500/10">
                      {cid.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold mt-4 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                Análise do Meta Completo →
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
                  (X)Twitter - FEED
                </h4>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>

              {/* Feed lists with influencers specified in instructions */}
              <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
                {proceduralTweets.slice(0, newsFeedCount).map((post) => (
                  <div key={post.id} className={`${isDark ? 'bg-slate-900/60 border-slate-700/60 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-350'} border rounded-xl p-4 space-y-2 relative overflow-hidden group transition-all`}>
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
                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-xs leading-normal`}>
                      {post.content}
                    </p>
                    <div className={`flex justify-between text-[10px] ${s.textMuted} pt-1.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-250/50'} font-medium`}>
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
                IR PARA COMUNIDADE COMPLETA →
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
                  SALA DE IMPRENSA
                </h4>
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              </div>

              {/* Feed lists with credentials specified in instructions */}
              <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
                {pressArticles.map((art) => (
                  <div key={art.id} className={`${isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3.5 space-y-2 relative overflow-hidden transition-all`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-200/20">
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
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-550'} text-[11px] leading-relaxed italic`}>
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
                ACOMPANHAR PRESS ROOM INTEGRADA →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

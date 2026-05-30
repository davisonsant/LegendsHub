/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, Activity, Trophy, Play, FastForward, ChevronRight, Sparkles, 
  Ban, Award, HelpCircle, Check, CheckCircle, TrendingUp, X, 
  Tv, Compass, Map, Sun, Moon, Info, RefreshCw, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ReferenceLine, BarChart, Bar, Cell 
} from 'recharts';
import { GameState, Team, Champion, Position, PickBan, MatchLog, MatchStats, Player } from '../types';
import { CHAMPIONS_LIST } from '../data/initialDatabase';
import { analyzeComposition, generateGameStep } from '../utils/matchSimulator';

interface MatchSimulatorFlowProps {
  gameState: GameState;
  onFinishMatchSeries: (scoreBlue: number, scoreRed: number, logs: MatchLog[]) => void;
  onBackToHub: () => void;
  theme?: 'light' | 'dark';
}

type StepType = 'BRIEFING' | 'DRAFT' | 'MATCH' | 'REPORT';

// Strategic choices cards from reference JPGs
interface StrategicCard {
  id: 'aggressive' | 'defensive' | 'objectives' | 'focusBot' | 'focusTop';
  title: string;
  description: string;
}

const STRATEGIC_CARDS: StrategicCard[] = [
  { id: 'aggressive', title: 'Dominar Early Game', description: 'Besodica apres stratego sees munocolones.' },
  { id: 'defensive', title: 'Teamfight de Mid Game', description: 'Boscadice teennlich de cenforto Game.' },
  { id: 'objectives', title: 'Split Push', description: 'Rollmenna de de foho sou anereninontes.' },
  { id: 'focusBot', title: 'Poke/Siege', description: 'Pectanimeme de traepão com hero evalidade.' }
];

const DRAGON_FILES = ['dg-infernal.png', 'dg-montanha.png', 'dg-nuvem.png', 'dg-oceano.png'];

export default function MatchSimulatorFlow({
  gameState,
  onFinishMatchSeries,
  onBackToHub,
  theme = 'dark'
}: MatchSimulatorFlowProps) {
  const { currentPatch, playerTeamId, teams, week, champions } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;
  const championsToUse = champions && champions.length > 0 ? champions : CHAMPIONS_LIST;

  // Local theme toggle state so the user can change live
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme);
  const isDark = localTheme === 'dark';

  // Opponent Calculation
  const currentWeekMatches = gameState.calendarSchedule[week];
  const playerNextOpponentMatch = currentWeekMatches?.find(
    m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId
  );

  let fallbackOpponent = teams.find(t => t.id !== playerTeamId)!;
  let defaultPlayerBlue = true;

  if (playerNextOpponentMatch) {
    const oppId = playerNextOpponentMatch.teamBlueId === playerTeamId 
      ? playerNextOpponentMatch.teamRedId 
      : playerNextOpponentMatch.teamBlueId;
    fallbackOpponent = teams.find(t => t.id === oppId) || fallbackOpponent;
    defaultPlayerBlue = playerNextOpponentMatch.teamBlueId === playerTeamId;
  }

  // Series state (MD3)
  const [currentGameIndex, setCurrentGameIndex] = useState(1); // 1, 2 or 3
  const [blueSeriesScore, setBlueSeriesScore] = useState(0);
  const [redSeriesScore, setRedSeriesScore] = useState(0);
  const [selectedChampsInSeries, setSelectedChampsInSeries] = useState<string[]>([]);
  const [allLogsSeries, setAllLogsSeries] = useState<MatchLog[]>([]);

  // Derived Series format (Bo3 vs Bo5)
  const isBo5 = playerNextOpponentMatch?.stage === 'PLAYOFFS_SEMI' || 
                playerNextOpponentMatch?.stage === 'PLAYOFFS_FINAL' || 
                playerNextOpponentMatch?.stage === 'WORLDS_PLAYOFFS';
  const winsNeeded = isBo5 ? 3 : 2;
  const seriesFormatName = isBo5 ? 'MD5' : 'MD3';

  // State to hold post-game simulated player performances
  interface PlayerMatchPerformance {
    player: Player;
    teamName: string;
    position: Position;
    championName: string;
    championId: string;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    damage: number;
    gold: number;
    mvpScore: number;
  }

  const [bluePerformance, setBluePerformance] = useState<PlayerMatchPerformance[]>([]);
  const [redPerformance, setRedPerformance] = useState<PlayerMatchPerformance[]>([]);

  const generatePlayerPerformance = (
    team: Team, 
    picks: { [key in Position]?: string }, 
    kills: number, 
    deaths: number, 
    isWinner: boolean,
    objectivesControlled: number
  ): PlayerMatchPerformance[] => {
    const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const pool = championsToUse;

    const playersByPos = positions.map(pos => {
      let p = team.roster.find(player => player.position === pos);
      if (!p) {
        p = team.roster[positions.indexOf(pos)] || team.substitutes[0] || {
          id: `mock-${pos}-${team.id}`,
          name: `${team.acronym} Player`,
          position: pos,
          overallRating: 75,
        } as Player;
      }
      return p;
    });

    let killsLeft = kills;
    const killWeights = { TOP: 0.18, JNG: 0.16, MID: 0.31, ADC: 0.32, SUP: 0.03 };
    const playerKills = { TOP: 0, JNG: 0, MID: 0, ADC: 0, SUP: 0 };
    
    const posKeys: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    while (killsLeft > 0) {
      const r = Math.random();
      let acc = 0;
      for (const pos of posKeys) {
        acc += killWeights[pos];
        if (r <= acc) {
          playerKills[pos]++;
          killsLeft--;
          break;
        }
      }
    }

    let deathsLeft = deaths;
    const deathWeights = { TOP: 0.24, JNG: 0.22, MID: 0.18, ADC: 0.14, SUP: 0.22 };
    const playerDeaths = { TOP: 0, JNG: 0, MID: 0, ADC: 0, SUP: 0 };
    while (deathsLeft > 0) {
      const r = Math.random();
      let acc = 0;
      for (const pos of posKeys) {
        acc += deathWeights[pos];
        if (r <= acc) {
          playerDeaths[pos]++;
          deathsLeft--;
          break;
        }
      }
    }

    const totalAssists = Math.round(kills * 1.4) + Math.floor(Math.random() * 3);
    let assistsLeft = totalAssists;
    const assistWeights = { TOP: 0.14, JNG: 0.21, MID: 0.18, ADC: 0.12, SUP: 0.35 };
    const playerAssists = { TOP: 0, JNG: 0, MID: 0, ADC: 0, SUP: 0 };
    while (assistsLeft > 0) {
      const r = Math.random();
      let acc = 0;
      for (const pos of posKeys) {
        acc += assistWeights[pos];
        if (r <= acc) {
          playerAssists[pos]++;
          assistsLeft--;
          break;
        }
      }
    }

    const baseCS = { TOP: 255, JNG: 175, MID: 275, ADC: 305, SUP: 52 };
    const baseGold = { TOP: 12200, JNG: 10800, MID: 13200, ADC: 14800, SUP: 8200 };
    const baseDamage = { TOP: 21500, JNG: 14500, MID: 31000, ADC: 35000, SUP: 7800 };

    return positions.map((pos, idx) => {
      const p = playersByPos[idx];
      const cid = picks[pos] || 'LeeSin';
      const champ = pool.find(c => c.id === cid);
      const championName = champ ? champ.name : 'Unknown';

      const pKills = playerKills[pos];
      const pDeaths = playerDeaths[pos];
      const pAssists = playerAssists[pos];

      const cs = Math.round(baseCS[pos] * (0.85 + Math.random() * 0.3));
      let gold = Math.round(baseGold[pos] * (0.8 + Math.random() * 0.4) + (pKills * 300) + (pAssists * 150));
      if (isWinner) gold += 1500;
      const damage = Math.round(baseDamage[pos] * (0.7 + Math.random() * 0.6) + (pKills * 800));

      const partWeight = { TOP: 0.1, JNG: 0.3, MID: 0.2, ADC: 0.15, SUP: 0.25 }[pos];
      const pObj = objectivesControlled * partWeight;

      const mvpScore = ((pKills * 3) + (pAssists * 2)) / (pDeaths + 1) + pObj;

      return {
        player: p,
        teamName: team.name,
        position: pos,
        championName,
        championId: cid,
        kills: pKills,
        deaths: pDeaths,
        assists: pAssists,
        cs,
        damage,
        gold,
        mvpScore
      };
    });
  };

  const getPlayerPhoto = (p: Player) => {
    if (p.photoUrl) return p.photoUrl;
    const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatars = [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1507591064344-4c6b5614d601?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    ];
    return avatars[hash % avatars.length];
  };

  // Linear flow step for the CURRENT game
  const [currentStep, setCurrentStep] = useState<StepType>('BRIEFING');

  // X-1 BRIEFING STATE
  const [isPlayerBlue, setIsPlayerBlue] = useState(defaultPlayerBlue);
  const [activeStrategy, setActiveStrategy] = useState<'aggressive' | 'defensive' | 'objectives' | 'focusBot' | 'focusTop'>('objectives');

  // Coin Flip/Cara ou Coroa states
  const [isCoinFlipped, setIsCoinFlipped] = useState(false);
  const [coinResult, setCoinResult] = useState<'CARA (Lado Azul)' | 'COROA (Lado Vermelho)' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlipCoin = () => {
    setIsFlipping(true);
    setCoinResult(null);
    setTimeout(() => {
      const isBlue = Math.random() < 0.5;
      setIsPlayerBlue(isBlue);
      setCoinResult(isBlue ? 'CARA (Lado Azul)' : 'COROA (Lado Vermelho)');
      setIsCoinFlipped(true);
      setIsFlipping(false);
    }, 1000);
  };

  // X-2 DRAFT STATE
  const draftSteps = [
    // Phase 1 Bans
    'BAN_B1', 'BAN_R1', 'BAN_B2', 'BAN_R2', 'BAN_B3', 'BAN_R3',
    // Phase 1 Picks
    'PICK_TOP_B', 'PICK_TOP_R',
    'PICK_JNG_B', 'PICK_JNG_R',
    'PICK_MID_B', 'PICK_MID_R',
    // Phase 2 Bans
    'BAN_R4', 'BAN_B4', 'BAN_R5', 'BAN_B5',
    // Phase 2 Picks
    'PICK_ADC_B', 'PICK_ADC_R',
    'PICK_SUP_B', 'PICK_SUP_R'
  ];
  const [draftStepIndex, setDraftStepIndex] = useState(0);
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);
  const [bluePicks, setBluePicks] = useState<{ [key in Position]?: string }>({});
  const [redPicks, setRedPicks] = useState<{ [key in Position]?: string }>({});
  const [focusedChampId, setFocusedChampId] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<Position | 'ALL'>('ALL');

  // X-3 REALTIME STATE
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMinute, setActiveMinute] = useState(0);
  const [speedMs, setSpeedMs] = useState(800);
  const [gameLogs, setGameLogs] = useState<MatchLog[]>([]);
  const [stats, setStats] = useState<MatchStats>({
    killsBlue: 0, killsRed: 0,
    deathsBlue: 0, deathsRed: 0,
    assistsBlue: 0, assistsRed: 0,
    towersBlue: 0, towersRed: 0,
    dragonsBlue: 0, dragonsRed: 0,
    baronsBlue: 0, baronsRed: 0
  });
  const [goldDelta, setGoldDelta] = useState(0);
  const [advantageHistory, setAdvantageHistory] = useState<{ minute: number; gold: number; xp: number }[]>([
    { minute: 0, gold: 0, xp: 0 }
  ]);
  const [activeChartTab, setActiveChartTab] = useState<'gold' | 'xp'>('gold');
  const [currentClashArea, setCurrentClashArea] = useState<string | null>(null);

  // X-4 REPORT SPECIAL FEEDBACK & DATA
  const [mapWinners, setMapWinners] = useState<string[]>([]);
  const [finalGoldHistory, setFinalGoldHistory] = useState<{ minute: number; gold: number; xp: number }[]>([]);
  const [gameOutcome, setGameOutcome] = useState<'victory' | 'defeat'>('victory');

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Scroll narration box to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLogs]);

  // Blue / Red teams for the current layout
  const currentBlueTeam = isPlayerBlue ? playerTeam : fallbackOpponent;
  const currentRedTeam = isPlayerBlue ? fallbackOpponent : playerTeam;

  const blueAnalysis = useMemo(() => {
    return analyzeComposition(bluePicks, currentBlueTeam, currentPatch.buffedChampions, currentPatch.nerfedChampions, championsToUse);
  }, [bluePicks, currentBlueTeam, currentPatch, championsToUse]);

  const redAnalysis = useMemo(() => {
    return analyzeComposition(redPicks, currentRedTeam, currentPatch.buffedChampions, currentPatch.nerfedChampions, championsToUse);
  }, [redPicks, currentRedTeam, currentPatch, championsToUse]);

  // Automated Drafting bot turns step logic
  useEffect(() => {
    if (currentStep !== 'DRAFT') return;
    if (draftStepIndex >= draftSteps.length) {
      // Completed, linear transition directly to Realtime engine
      setDraftStepIndex(0);
      setupMatchStart();
      setCurrentStep('MATCH');
      return;
    }

    const currentStepStr = draftSteps[draftStepIndex];
    if (!currentStepStr) return;
    const isBlueStep = currentStepStr.includes('_B');
    const isRedStep = currentStepStr.includes('_R');

    const isBotTurn = 
      (isBlueStep && !isPlayerBlue) || 
      (isRedStep && isPlayerBlue);

    if (isBotTurn) {
      const timer = setTimeout(() => {
        executeBotDraftChoice();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentStep, draftStepIndex, isPlayerBlue]);

  const executeBotDraftChoice = () => {
    const stepStr = draftSteps[draftStepIndex];
    if (!stepStr) return;
    const bannedChampIds = [...blueBans, ...redBans];
    const unavailable = [...bannedChampIds, ...Object.values(bluePicks), ...Object.values(redPicks), ...selectedChampsInSeries].filter(Boolean) as string[];
    const candidates = championsToUse.filter(c => !unavailable.includes(c.id));

    if (stepStr.startsWith('BAN')) {
      const sorted = [...candidates].sort((a, b) => b.power - a.power);
      const chosenBan = sorted[0]?.id || candidates[0]?.id;
      if (chosenBan) {
        if (stepStr.includes('_B')) {
          setBlueBans(prev => [...prev, chosenBan]);
        } else {
          setRedBans(prev => [...prev, chosenBan]);
        }
        setDraftStepIndex(i => i + 1);
      }
    } else {
      const posExtract = stepStr.split('_')[1] as Position;
      const roleChamps = candidates.filter(c => c.roles.includes(posExtract));
      const chosenPick = roleChamps[0]?.id || candidates[0]?.id;
      if (chosenPick) {
        if (stepStr.endsWith('B')) {
          setBluePicks(p => ({ ...p, [posExtract]: chosenPick }));
        } else {
          setRedPicks(p => ({ ...p, [posExtract]: chosenPick }));
        }
        setDraftStepIndex(i => i + 1);
      }
    }
  };

  const handleSelectChampionUser = (champId: string) => {
    const bannedChampIds = [...blueBans, ...redBans];
    const unavailable = [...bannedChampIds, ...Object.values(bluePicks), ...Object.values(redPicks), ...selectedChampsInSeries].filter(Boolean) as string[];
    if (unavailable.includes(champId)) return;

    const stepStr = draftSteps[draftStepIndex];
    if (!stepStr) return;
    if (stepStr.startsWith('BAN')) {
      if (stepStr.includes('_B')) {
        setBlueBans(prev => [...prev, champId]);
      } else {
        setRedBans(prev => [...prev, champId]);
      }
      setDraftStepIndex(i => i + 1);
    } else {
      const posExtract = stepStr.split('_')[1] as Position;
      if (stepStr.endsWith('B')) {
        setBluePicks(p => ({ ...p, [posExtract]: champId }));
      } else {
        setRedPicks(p => ({ ...p, [posExtract]: champId }));
      }
      setDraftStepIndex(i => i + 1);
    }
  };

  // Realtime Simulation loop parameters
  useEffect(() => {
    if (currentStep !== 'MATCH' || !isPlaying) return;

    if (activeMinute >= 30) {
      setIsPlaying(false);
      concludeRealtimeGame();
      return;
    }

    const timer = setInterval(() => {
      const stepIndex = activeMinute + 2;
      const stepResult = generateGameStep(
        stepIndex,
        blueAnalysis.draftPower,
        redAnalysis.draftPower,
        activeStrategy,
        currentBlueTeam.name,
        currentRedTeam.name,
        bluePicks,
        redPicks,
        stats,
        championsToUse
      );

      // Track location based on event logs
      if (stepResult.log.message.includes('baron') || stepResult.log.message.includes('BARÃO')) {
        setCurrentClashArea('BARON');
      } else if (stepResult.log.message.includes('dragon') || stepResult.log.message.includes('DRAGÃO')) {
        setCurrentClashArea('DRAGON');
      } else if (stepResult.log.message.includes('rota inferior') || stepResult.log.message.includes('botlane')) {
        setCurrentClashArea('BOT');
      } else if (stepResult.log.message.includes('rota do topo') || stepResult.log.message.includes('topo')) {
        setCurrentClashArea('TOP');
      } else if (Math.random() > 0.5) {
        setCurrentClashArea('MID');
      } else {
        setCurrentClashArea('JUNGLE');
      }

      setStats(prev => {
        const nextStats = { ...prev, ...stepResult.statsChange };
        setAdvantageHistory(h => {
          const lastH = h[h.length - 1] || { minute: 0, gold: 0, xp: 0 };
          const nextGold = lastH.gold + stepResult.goldChange;
          const nextXP = Math.round(nextGold * 0.85 + (Math.random() - 0.5) * 110);
          return [...h, { minute: stepIndex, gold: nextGold, xp: nextXP }];
        });
        return nextStats;
      });

      setGoldDelta(prev => prev + stepResult.goldChange);
      setGameLogs(g => [...g, stepResult.log]);
      setActiveMinute(stepIndex);
    }, speedMs);

    return () => clearInterval(timer);
  }, [currentStep, isPlaying, activeMinute, speedMs, stats, goldDelta, blueAnalysis, redAnalysis]);

  const setupMatchStart = () => {
    setActiveMinute(0);
    setGoldDelta(0);
    setAdvantageHistory([{ minute: 0, gold: 0, xp: 0 }]);
    setGameLogs([
      {
        id: 'start-0',
        timestamp: '00:00',
        type: 'info',
        message: '🎙️ Boas-vindas a Summoner\'s Rift! O jogo MD3 está ativado e as lineups estão definidas. [SUCCESS]',
        goldDelta: 0
      }
    ]);
    setStats({
      killsBlue: 0, killsRed: 0,
      deathsBlue: 0, deathsRed: 0,
      assistsBlue: 0, assistsRed: 0,
      towersBlue: 0, towersRed: 0,
      dragonsBlue: 0, dragonsRed: 0,
      baronsBlue: 0, baronsRed: 0
    });
  };

  const triggerInstantMatch = () => {
    const tempStats = { ...stats };
    let tempGold = goldDelta;
    const history = [...advantageHistory];
    const logsAdded = [...gameLogs];

    for (let m = activeMinute; m < 30; m += 2) {
      const stepIndex = m + 2;
      const stepResult = generateGameStep(
        stepIndex,
        blueAnalysis.draftPower,
        redAnalysis.draftPower,
        activeStrategy,
        currentBlueTeam.name,
        currentRedTeam.name,
        bluePicks,
        redPicks,
        tempStats,
        championsToUse
      );
      Object.assign(tempStats, stepResult.statsChange);
      tempGold += stepResult.goldChange;
      history.push({
        minute: stepIndex,
        gold: tempGold,
        xp: Math.round(tempGold * 0.85 + (Math.random() - 0.5) * 110)
      });
      logsAdded.push(stepResult.log);
    }

    setStats(tempStats);
    setGoldDelta(tempGold);
    setAdvantageHistory(history);
    setGameLogs(logsAdded);
    setActiveMinute(30);

    // Dynamic win computation
    const evalBlue = (tempStats.killsBlue * 350) + (tempStats.towersBlue * 1000) + (tempStats.dragonsBlue * 500) + (tempStats.baronsBlue * 1500) + tempGold;
    const evalRed = (tempStats.killsRed * 350) + (tempStats.towersRed * 1000) + (tempStats.dragonsRed * 500) + (tempStats.baronsRed * 1500) - tempGold;
    const blueWon = evalBlue > evalRed;

    // Series update
    let nextBlueScore = blueSeriesScore;
    let nextRedScore = redSeriesScore;
    let victorName = '';

    if (blueWon) {
      nextBlueScore += 1;
      setBlueSeriesScore(prev => prev + 1);
      victorName = currentBlueTeam.name;
    } else {
      nextRedScore += 1;
      setRedSeriesScore(prev => prev + 1);
      victorName = currentRedTeam.name;
    }

    const mapOutcome = (blueWon && isPlayerBlue) || (!blueWon && !isPlayerBlue) ? 'victory' : 'defeat';
    setGameOutcome(mapOutcome);
    setMapWinners(prev => [...prev, victorName]);

    // Generate simulated individual player statistics
    const totalBlueObjs = tempStats.dragonsBlue + tempStats.baronsBlue + tempStats.towersBlue;
    const totalRedObjs = tempStats.dragonsRed + tempStats.baronsRed + tempStats.towersRed;
    const bPerf = generatePlayerPerformance(currentBlueTeam, bluePicks, tempStats.killsBlue, tempStats.killsRed, blueWon, totalBlueObjs);
    const rPerf = generatePlayerPerformance(currentRedTeam, redPicks, tempStats.killsRed, tempStats.killsBlue, !blueWon, totalRedObjs);
    setBluePerformance(bPerf);
    setRedPerformance(rPerf);

    // Push definitive logs
    logsAdded.push({
      id: "nexus-explode",
      timestamp: "32:00",
      type: "info",
      message: `💥 [NEXUS DESTRUÍDO] Vitória consagrada do elenco ${victorName}! Com investidas potentes de cerco, o Nexus racha gerando chamas infinitas!`,
      goldDelta: 0
    });
    setGameLogs(logsAdded);

    // Cache list of used champions for Fearless Draft
    const picksThisMatch = [...Object.values(bluePicks), ...Object.values(redPicks)].filter(Boolean) as string[];
    setSelectedChampsInSeries(prev => [...prev, ...picksThisMatch]);
    setFinalGoldHistory(history);
    setAllLogsSeries(prev => [...prev, ...logsAdded]);

    setCurrentStep('REPORT');
  };

  const concludeRealtimeGame = () => {
    const evalBlue = (stats.killsBlue * 350) + (stats.towersBlue * 1000) + (stats.dragonsBlue * 500) + (stats.baronsBlue * 1500) + goldDelta;
    const evalRed = (stats.killsRed * 350) + (stats.towersRed * 1000) + (stats.dragonsRed * 500) + (stats.baronsRed * 1500) - goldDelta;
    const blueWon = evalBlue > evalRed;

    let nextBlueScore = blueSeriesScore;
    let nextRedScore = redSeriesScore;
    let victorName = '';

    if (blueWon) {
      nextBlueScore += 1;
      setBlueSeriesScore(prev => prev + 1);
      victorName = currentBlueTeam.name;
    } else {
      nextRedScore += 1;
      setRedSeriesScore(prev => prev + 1);
      victorName = currentRedTeam.name;
    }

    const mapOutcome = (blueWon && isPlayerBlue) || (!blueWon && !isPlayerBlue) ? 'victory' : 'defeat';
    setGameOutcome(mapOutcome);
    setMapWinners(prev => [...prev, victorName]);

    // Generate simulated individual player statistics
    const totalBlueObjs = stats.dragonsBlue + stats.baronsBlue + stats.towersBlue;
    const totalRedObjs = stats.dragonsRed + stats.baronsRed + stats.towersRed;
    const bPerf = generatePlayerPerformance(currentBlueTeam, bluePicks, stats.killsBlue, stats.killsRed, blueWon, totalBlueObjs);
    const rPerf = generatePlayerPerformance(currentRedTeam, redPicks, stats.killsRed, stats.killsBlue, !blueWon, totalRedObjs);
    setBluePerformance(bPerf);
    setRedPerformance(rPerf);

    const updatedLogs = [...gameLogs, {
      id: "nexus-explode-realtime",
      timestamp: "32:00",
      type: "info",
      message: `💥 [NEXUS DESTRUÍDO] Vitória consagrada do elenco ${victorName}! Com investidas potentes de cerco, o Nexus racha gerando chamas infinitas!`,
      goldDelta: 0
    }];
    setGameLogs(updatedLogs);

    // Cache list of used champions for Fearless Draft
    const picksThisMatch = [...Object.values(bluePicks), ...Object.values(redPicks)].filter(Boolean) as string[];
    setSelectedChampsInSeries(prev => [...prev, ...picksThisMatch]);
    setFinalGoldHistory(advantageHistory);
    setAllLogsSeries(prev => [...prev, ...updatedLogs]);

    setCurrentStep('REPORT');
  };

  const advanceNextMatchOrFinish = () => {
    // If series is finished (one team reached winsNeeded)
    if (blueSeriesScore >= winsNeeded || redSeriesScore >= winsNeeded) {
      onFinishMatchSeries(blueSeriesScore, redSeriesScore, allLogsSeries);
    } else {
      // Loop back with incremented game counter
      setCurrentGameIndex(idx => idx + 1);
      setBlueBans([]);
      setRedBans([]);
      setBluePicks({});
      setRedPicks({});
      setActiveMinute(0);
      setGoldDelta(0);
      setAdvantageHistory([{ minute: 0, gold: 0, xp: 0 }]);
      setCurrentStep('BRIEFING');
    }
  };

  // Formatting helpers for narration log rows
  const formatLogRow = (log: MatchLog) => {
    let text = log.message;
    let textColorClass = isDark ? 'text-white' : 'text-slate-800';
    let isPulsing = false;
    let label = '';

    const lowercase = text.toLowerCase();
    if (log.type === 'dragon' || log.type === 'baron' || lowercase.includes('dragão') || lowercase.includes('conquistado') || lowercase.includes('barão')) {
      if (!text.includes('[SUCCESS]')) {
        text = `${text} [SUCCESS]`;
      }
      text = text.replace('[PULSINGS ALERT]', '').replace('[PULSING ALERT]', '');
      textColorClass = 'text-emerald-500 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded block mb-1';
      label = 'OBJ';
    } else if (log.type === 'kill' || lowercase.includes('abate') || lowercase.includes('kill') || lowercase.includes('perigo')) {
      if (!text.includes('[PULSING ALERT]')) {
        text = `${text} [PULSING ALERT]`;
      }
      text = text.replace('[SUCCESS]', '');
      textColorClass = 'text-red-500 font-extrabold bg-red-500/10 border border-red-550/20 px-2.5 py-1 rounded block mb-1';
      isPulsing = true;
      label = 'CLASH';
    } else {
      textColorClass = `${isDark ? 'text-[#b4c6ef]' : 'text-slate-700'} font-semibold block mb-1 opacity-95`;
    }

    return { text, textColorClass, isPulsing, label };
  };

  const getChampAvatar = (champId: string) => {
    const champ = championsToUse.find(c => c.id === champId);
    if (champ) {
      if (champ.imageUrl) return champ.imageUrl;
      const ideal = champ.idealPlaystyle;
      const anyIdeal = ideal && (ideal.startsWith('http') || ideal.startsWith('data:image') || ideal.includes('.'));
      if (anyIdeal) return ideal;
    }
    const seed = champ ? champ.imageSeed : 0;
    const images = [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=120", 
      "https://images.unsplash.com/photo-1548685913-fe6574ab8d14?auto=format&fit=crop&q=80&w=120", 
    ];
    return images[seed % images.length];
  };

  // Dragon PNG lookup corresponding sequentially to index
  const getDragonConqueredList = (count: number) => {
    return DRAGON_FILES.slice(0, Math.min(count, 4));
  };

  const lastBanId = draftStepIndex - 1 >= 0 && draftSteps[draftStepIndex - 1]?.startsWith('BAN')
    ? (draftSteps[draftStepIndex - 1].includes('_B') ? blueBans[blueBans.length - 1] : redBans[redBans.length - 1])
    : null;
  const currentOpBannedName = lastBanId ? championsToUse.find(c => c.id === lastBanId)?.name || 'LEE SIN' : 'LEE SIN';

  return (
    <div className={`min-h-screen font-sans select-none relative transition-colors duration-300 ${
      isDark ? 'bg-[#070d19] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* GLOBAL BANNER HEADER */}
      <div className={`border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-700'}`}>
                Série MD3 · JOGO {currentGameIndex}
              </span>
              <span className={`text-[9px] font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                FEARLESS DRAFT ATIVO
              </span>
            </div>
            <h1 className={`text-base font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentBlueTeam.acronym} vs {currentRedTeam.acronym}
            </h1>
          </div>
        </div>

        {/* Global score indicator */}
        <div className="flex items-center gap-5">
          <div className="text-center">
            <span className="text-[8px] font-black tracking-widest text-gray-500 block uppercase mb-1">PLACAR DA SÉRIE</span>
            <div className={`font-mono text-base font-black px-4 py-1.5 rounded-lg border ${
              isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-100 border-slate-300'
            }`}>
              <span className="text-sky-400">{blueSeriesScore}</span> 
              <span className="px-1.5 text-gray-500">x</span> 
              <span className="text-red-500">{redSeriesScore}</span>
            </div>
          </div>

          {/* Theme custom toggle */}
          <button
            onClick={() => setLocalTheme(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-yellow-400' : 'bg-slate-200 border-slate-300 text-[#070d19]'
            }`}
            title="Alternar Modo Visual"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onBackToHub}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border transition-colors ${
              isDark ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Abandonar Série
          </button>
        </div>
      </div>

      {/* RENDER CURRENT STAGE TELA */}

      {/* ======================= TELA X-1: BRIEFING & PRÉ-JOGO ======================= */}
      {currentStep === 'BRIEFING' && (
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className={`p-8 rounded-3xl border shadow-xl ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <span className="text-xs text-sky-400 font-extrabold uppercase tracking-widest block text-center mb-1">
              Etapa 1 · Digital o Pré-Jogo
            </span>
            <h2 className={`text-xl font-display font-black text-center uppercase tracking-wide mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Análise Tática e Seleção de Lado
            </h2>

            {/* Cabeçalho de seleção de lado ou sorteio ("Lado Azul" com moeda central "L" e "Lado Vermelho") */}
            <div className="mb-10 text-center">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2">
                Decisão de Lado: Cara ou Coroa
              </span>
              <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                Clique na moeda central para sortear o lado ou selecione manualmente clicando nos botões de azul/vermelho abaixo.
              </p>
            </div>

            <div className="flex justify-center items-center gap-6 mb-12">
              <button
                onClick={() => {
                  setIsPlayerBlue(true);
                  setCoinResult(null);
                }}
                className={`flex-1 py-5 px-6 rounded-2xl border transition-all text-center relative overflow-hidden ${
                  isPlayerBlue 
                    ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.25)] scale-[1.02]' 
                    : isDark ? 'border-[#1e2d44] bg-[#070d19] opacity-75 hover:opacity-100' : 'border-slate-250 bg-slate-50 opacity-75 hover:opacity-100'
                }`}
              >
                <span className="text-sm font-black uppercase tracking-widest text-[#00d2fd] block">LADO AZUL</span>
                <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">First Pick / Prioridade</span>
                {isPlayerBlue && <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-sky-500" />}
              </button>

              {/* Moeda Central interativa "Cara ou Coroa" */}
              <button
                type="button"
                onClick={handleFlipCoin}
                disabled={isFlipping}
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-yellow-300 text-slate-900 text-lg font-display font-black flex items-center justify-center shadow-2xl shrink-0 transition-transform cursor-pointer relative hover:scale-110 active:scale-95 ${
                  isFlipping ? 'animate-spin' : ''
                }`}
                title="Girar Moeda (Cara ou Coroa)"
              >
                🪙
              </button>

              <button
                onClick={() => {
                  setIsPlayerBlue(false);
                  setCoinResult(null);
                }}
                className={`flex-1 py-5 px-6 rounded-2xl border transition-all text-center relative overflow-hidden ${
                  !isPlayerBlue 
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.25)] scale-[1.02]' 
                    : isDark ? 'border-[#1e2d44] bg-[#070d19] opacity-75 hover:opacity-100' : 'border-slate-250 bg-slate-50 opacity-75 hover:opacity-100'
                }`}
              >
                <span className="text-sm font-black uppercase tracking-widest text-red-500 block">LADO VERMELHO</span>
                <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">Counter Pick / Resposta</span>
                {!isPlayerBlue && <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500" />}
              </button>
            </div>

            {/* Resultado do sorteio se houver */}
            {isFlipping && (
              <div className="text-center mb-8 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl animate-pulse">
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider">🪙 Girando Moeda... Escolhendo Lado...</span>
              </div>
            )}

            {!isFlipping && coinResult && (
              <div className="text-center mb-8 bg-emerald-500/15 border border-emerald-500/25 p-3 rounded-xl animate-bounce">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  🎉 Resultado do Sorteio: <strong className="underline">{coinResult}</strong> selecionado!
                </span>
              </div>
            )}

            {/* Painel "Escolha sua Macroestratégia" com 4 cards selecionáveis estruturados lado a lado */}
            <div className={`border-t pt-8 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
              <h3 className={`text-sm font-black uppercase tracking-wide mb-4 text-center ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>
                Escolha sua Macroestratégia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {STRATEGIC_CARDS.map(card => {
                  const isSelected = activeStrategy === card.id;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setActiveStrategy(card.id)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-[150px] transition-all hover:scale-102 ${
                        isSelected 
                          ? isDark 
                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                            : 'border-amber-500 bg-amber-50 border-2'
                          : isDark ? 'border-[#1e2d44] bg-[#070d19]/60' : 'border-slate-200 bg-slate-50/60'
                      }`}
                    >
                      <div>
                        {/* Custom vectors / icons representing macro concept */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <Activity className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className="text-[10px] text-slate-500 font-black uppercase font-mono">MACRO</span>
                        </div>
                        <h4 className={`text-xs font-black uppercase leading-tight tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {card.title}
                        </h4>
                      </div>
                      <p className={`text-[9.5px] leading-snug font-semibold select-none ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rodapé com indicação de prioridade de pick baseado no lado escolhido */}
            <div className={`border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                    Lado Azul - First Pick
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                    Lado Vermelho - Counter Pick
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('DRAFT')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-display text-[11px] font-black tracking-widest uppercase py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                PROSSEGUIR PARA DRAFT <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TELA X-2: SIMULADOR DE DRAFT (PICKS & BANS) ======================= */}
      {currentStep === 'DRAFT' && (
        <div className="py-8 px-6">
          
          {/* Topo: Exibição limpa de exatamente 10 BANIMENTOS competitivos divididos em fases */}
          <div className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">FASE DE BANIMENTOS</span>
            </div>

            {/* Bans Blue Side (5 total: 3 phase 1, 2 phase 2) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider font-mono">AZUL BANS:</span>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2, 3, 4].map((idx, banIdx) => {
                  const bId = blueBans[idx];
                  return (
                    <div key={idx} className={`relative w-7 h-7 rounded border border-rose-500/30 bg-rose-950/10 overflow-hidden flex items-center justify-center shrink-0 ${
                      banIdx === 2 ? 'mr-2.5 border-r-2 border-rose-500/60' : ''
                    }`} title={banIdx < 3 ? "Ban Fase 1" : "Ban Fase 2"}>
                      {bId ? (
                        <>
                          <img src={getChampAvatar(bId)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-650 rotate-45 transform" />
                        </>
                      ) : (
                        <Ban className="w-3 text-red-500/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-1.5 bg-red-600/15 border border-red-500/20 rounded-md text-center max-w-[220px]">
              <span className="text-[10px] font-black tracking-widest text-red-400 block uppercase">
                OPONENTE BANIOU {currentOpBannedName?.toUpperCase()}
              </span>
            </div>

            {/* Bans Red Side (5 total: 3 phase 1, 2 phase 2) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider font-mono">VERMELHO BANS:</span>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2, 3, 4].map((idx, banIdx) => {
                  const bId = redBans[idx];
                  return (
                    <div key={idx} className={`relative w-7 h-7 rounded border border-rose-500/30 bg-rose-950/10 overflow-hidden flex items-center justify-center shrink-0 ${
                      banIdx === 2 ? 'mr-2.5 border-r-2 border-rose-500/60' : ''
                    }`} title={banIdx < 3 ? "Ban Fase 1" : "Ban Fase 2"}>
                      {bId ? (
                        <>
                          <img src={getChampAvatar(bId)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-650 rotate-45 transform" />
                        </>
                      ) : (
                        <Ban className="w-3 text-red-500/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DRAFT COLUMNS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left team card */}
            <div className={`lg:col-span-3 rounded-2xl p-5 border flex flex-col justify-between h-[550px] shadow-sm ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className={`border-b pb-3 mb-4 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-sky-400">
                    {currentBlueTeam.name.toUpperCase()}
                  </h4>
                  <span className="text-[9px] text-gray-500 block uppercase font-bold mt-1">LADO AZUL</span>
                </div>

                <div className="space-y-3">
                  {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                    const champId = bluePicks[pos];
                    const champ = championsToUse.find(c => c.id === champId);
                    const isPicking = draftSteps[draftStepIndex] === `PICK_${pos}_B`;

                    return (
                      <div key={pos} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isPicking 
                          ? 'border-sky-400 bg-sky-400/5 ring-2 ring-sky-400/20' 
                          : isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-250'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-[9px] font-black px-1.5 py-0.5 bg-sky-600 text-white rounded uppercase">{pos}</span>
                          <strong className={`text-xs uppercase tracking-wider font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {champ ? champ.name : isPicking ? 'Escolhendo...' : 'Aguardando'}
                          </strong>
                        </div>
                        {champ && <img src={getChampAvatar(champ.id)} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-sky-400/20" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isDark ? 'border-sky-500/10 bg-sky-500/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-400 font-bold text-[10px]">Poder de Composição:</span>
                  <strong className="text-sky-400 font-black">{blueAnalysis.draftPower}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold text-[10px]">Sinergia Geral:</span>
                  <strong className="text-emerald-500 font-black">{blueAnalysis.synergyLevel}%</strong>
                </div>
              </div>
            </div>

            {/* Center Area: grid and explain popover (Span 6) */}
            <div className={`lg:col-span-6 rounded-2xl p-5 border h-[550px] flex flex-col justify-between shadow-sm ${
              isDark ? 'bg-[#0A0E17] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              
              <div>
                {/* Insights de Matchup */}

                {/* Filters */}
                <div className="flex justify-center gap-1.5 mb-4 overflow-x-auto py-1">
                  {(['ALL', 'TOP', 'JNG', 'MID', 'ADC', 'SUP'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setRouteFilter(role)}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded border transition-all shrink-0 ${
                        routeFilter === role 
                          ? 'bg-sky-400 text-black border-sky-400' 
                          : isDark ? 'bg-[#070d19] border-[#1e2d44] text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-250 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Grid com os retratos dos campeões da pool. Se Fearless Draft active, used champs are blocked */}
                <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-1.5 max-h-[295px] overflow-y-auto pr-1">
                  {championsToUse
                    .filter(c => routeFilter === 'ALL' || c.roles.includes(routeFilter as Position))
                    .map(champ => {
                      const isBanned = blueBans.includes(champ.id) || redBans.includes(champ.id);
                      const isSelected = Object.values(bluePicks).includes(champ.id) || Object.values(redPicks).includes(champ.id);
                      const isFearlessBanned = selectedChampsInSeries.includes(champ.id);
                      const isAvailable = !isBanned && !isSelected && !isFearlessBanned;

                      const isFocused = focusedChampId === champ.id;
                      const activeStepStr = draftSteps[draftStepIndex] || 'PICK_TOP_B';
                      const posExtract = activeStepStr.split('_')[1] as Position;
                      const isMatchesRole = champ.roles.includes(posExtract);

                      return (
                        <button
                          key={champ.id}
                          onMouseEnter={() => setFocusedChampId(champ.id)}
                          onMouseLeave={() => setFocusedChampId(null)}
                          onClick={() => isAvailable && handleSelectChampionUser(champ.id)}
                          disabled={!isAvailable}
                          className={`aspect-square p-2.5 rounded-xl border flex flex-col justify-between relative transition-all overflow-hidden ${
                            isAvailable 
                              ? isFocused 
                                ? 'border-sky-400 bg-sky-400/5 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.7)]' 
                                : isMatchesRole
                                  ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500'
                                  : isDark ? 'border-[#1e2d44] bg-[#070d19] hover:border-sky-500/50' : 'border-slate-200 bg-slate-50 hover:border-sky-400'
                              : isFearlessBanned
                                ? 'bg-slate-900/60 border-transparent text-gray-600 cursor-not-allowed opacity-30 select-none'
                                : 'bg-gray-800/20 border-transparent text-gray-600 cursor-not-allowed opacity-40 select-none'
                          }`}
                        >
                          <img 
                            src={getChampAvatar(champ.id)} 
                            alt={champ.name} 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-45 transition-opacity"
                          />
                          <span className="font-display text-[10px] font-black uppercase text-center truncate w-full z-10">
                            {champ.name}
                          </span>
                          
                          <div className="flex justify-between items-center w-full z-10 mt-auto">
                            {isFearlessBanned ? (
                              <span className="text-[7.5px] font-black text-rose-500 px-1 bg-rose-500/15 rounded">FEARLESS</span>
                            ) : (
                              <span className="text-[9px] font-bold text-gray-400">{champ.power} Rating</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className={`p-3 text-[10px] font-bold uppercase tracking-wider text-center border-t select-none ${
                isDark ? 'border-[#1e2d44] text-gray-500' : 'border-slate-200 text-slate-400'
              }`}>
                📌 Pare o mouse sobre qualquer campeão para obter insights de matchup em tempo real!
              </div>
            </div>

            {/* Right team card */}
            <div className={`lg:col-span-3 rounded-2xl p-5 border flex flex-col justify-between h-[550px] shadow-sm ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className={`border-b pb-3 mb-4 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-red-500">
                    {currentRedTeam.name.toUpperCase()}
                  </h4>
                  <span className="text-[9px] text-gray-500 block uppercase font-bold mt-1">LADO VERMELHO</span>
                </div>

                <div className="space-y-3">
                  {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                    const champId = redPicks[pos];
                    const champ = championsToUse.find(c => c.id === champId);
                    const isPicking = draftSteps[draftStepIndex] === `PICK_${pos}_R`;

                    return (
                      <div key={pos} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isPicking 
                          ? 'border-red-400 bg-red-400/5 ring-2 ring-red-400/20' 
                          : isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-250'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-[9px] font-black px-1.5 py-0.5 bg-red-650 text-white rounded uppercase mr-2">{pos}</span>
                          <strong className={`text-xs uppercase tracking-wider font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {champ ? champ.name : isPicking ? 'Escolhendo...' : 'Aguardando'}
                          </strong>
                        </div>
                        {champ && <img src={getChampAvatar(champ.id)} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-red-400/20" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isDark ? 'border-red-500/10 bg-red-500/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-400 font-bold text-[10px]">Poder de Composição:</span>
                  <strong className="text-red-500 font-black">{redAnalysis.draftPower}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold text-[10px]">Sinergia Geral:</span>
                  <strong className="text-emerald-500 font-black">{redAnalysis.synergyLevel}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TELA X-3: PARTIDA EM TEMPO REAL ======================= */}
      {currentStep === 'MATCH' && (
        <div className="py-8 px-6">
          
          {/* Header Dashboard stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 border p-5 rounded-2xl mb-6 shadow-sm items-center ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="text-left">
              <span className="text-[9px] text-sky-400 uppercase font-black tracking-wider">LADO AZUL</span>
              <h4 className={`font-display text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentBlueTeam.name}
              </h4>
              
              {/* Sequential Dragon rendering using accurate files */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[8px] font-bold text-slate-500 mr-1">DRAGÕES:</span>
                {stats.dragonsBlue > 0 ? getDragonConqueredList(stats.dragonsBlue).map((fn, idx) => (
                  <div key={idx} className="w-6 h-6 rounded-full border border-sky-500 bg-sky-500/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" title="Dragão Blue">
                    <img 
                      src={fn} 
                      alt={fn} 
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.dragon-fallback')) {
                          const fb = document.createElement('span');
                          fb.className = 'dragon-fallback text-[8px] font-black text-sky-400';
                          fb.innerText = fn.split('-')[1].split('.')[0].toUpperCase().substring(0,3);
                          parent.appendChild(fb);
                        }
                      }}
                    />
                  </div>
                )) : <span className="text-[8.5px] text-gray-500 font-semibold italic">Nenhum</span>}
              </div>
            </div>

            <div className="text-center">
              <span className="text-[9px] font-mono font-black text-slate-400 tracking-widest block uppercase mb-1">K/D/A DE EQUIPE</span>
              <div className="flex gap-4 items-center justify-center font-display text-3xl font-black">
                <span className="text-sky-400">{stats.killsBlue}</span>
                <span className="text-gray-500 font-normal">/</span>
                <span className="text-red-500">{stats.killsRed}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-red-500 uppercase font-black tracking-wider">LADO VERMELHO</span>
              <h4 className={`font-display text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentRedTeam.name}
              </h4>

              {/* Sequential Dragon rendering */}
              <div className="flex items-center gap-1.5 mt-2 justify-end">
                {stats.dragonsRed > 0 ? getDragonConqueredList(stats.dragonsRed).map((fn, idx) => (
                  <div key={idx} className="w-6 h-6 rounded-full border border-red-500 bg-red-500/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" title="Dragão Red">
                    <img 
                      src={fn} 
                      alt={fn} 
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.dragon-fallback')) {
                          const fb = document.createElement('span');
                          fb.className = 'dragon-fallback text-[8px] font-black text-red-400';
                          fb.innerText = fn.split('-')[1].split('.')[0].toUpperCase().substring(0,3);
                          parent.appendChild(fb);
                        }
                      }}
                    />
                  </div>
                )) : <span className="text-[8.5px] text-gray-500 font-semibold italic">Nenhum</span>}
                <span className="text-[8px] font-bold text-slate-500 ml-1">DRAGÕES:</span>
              </div>
            </div>
          </div>

          {/* MAIN SIMULATOR VISUAL CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            
            {/* Lado Esquerdo: O mapa "SummonerRift_Atualizado_Mapa.jpg" DEVE aparecer como background */}
            <div className="lg:col-span-7">
              <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-sky-400 mb-3 block">
                  Summoner's Rift Map View
                </h3>

                {/* Minimapa Tático with actual image background & clashing SVG overlay */}
                <div className={`relative overflow-hidden h-[340px] flex items-center justify-center rounded-xl border ${
                  isDark ? 'bg-black border-slate-800' : 'bg-slate-100 border-slate-350'
                }`}>
                  {/* Background absolute img of Rift */}
                  <img 
                    src="SummonerRift_Atualizado_Mapa.jpg" 
                    alt="Map Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                    onError={(e) => {
                      // fallback backdrop is nicely stylized SVG gradient!
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />

                  {/* SVG paths overlays */}
                  <div className="absolute inset-0 w-full h-full">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      
                      {/* Translucent translation / clash routes */}
                      {/* TOP rota */}
                      <path d="M 12 88 L 12 12 L 88 12" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 12 88 L 12 12 L 88 12" fill="none" stroke={isDark ? "rgba(56, 189, 248, 0.35)" : "rgba(30, 41, 59, 0.25)"} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

                      {/* BOT rota */}
                      <path d="M 12 88 L 88 88 L 88 12" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 12 88 L 88 88 L 88 12" fill="none" stroke={isDark ? "rgba(239, 68, 68, 0.35)" : "rgba(30, 41, 59, 0.25)"} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

                      {/* MID rota */}
                      <path d="M 12 88 L 88 12" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 12 88 L 88 12" fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.35)" : "rgba(30, 41, 59, 0.25)"} strokeWidth="1.5" strokeLinecap="round" />

                      {/* Selva pits */}
                      <circle cx="36" cy="36" r="4.5" fill="none" stroke="#a855f7" strokeWidth="0.8" className="animate-pulse" />
                      <circle cx="64" cy="64" r="4.5" fill="none" stroke="#eab308" strokeWidth="0.8" className="animate-pulse" />

                      <text x="36" y="30" fontSize="4" textAnchor="middle" fill="#a855f7" className="font-mono font-black">BARÃO</text>
                      <text x="64" y="73" fontSize="4" textAnchor="middle" fill="#eab308" className="font-mono font-black">DRAGÃO</text>

                      {/* CLASH ANIMATION PIN OR POINTERS SPREADING */}
                      {currentClashArea === 'BARON' && (
                        <g transform="translate(36, 36)" className="animate-ping">
                          <circle cx="0" cy="0" r="8" fill="rgba(168, 85, 247, 0.3)" />
                        </g>
                      )}
                      {currentClashArea === 'DRAGON' && (
                        <g transform="translate(64, 64)" className="animate-ping">
                          <circle cx="0" cy="0" r="8" fill="rgba(234, 179, 8, 0.3)" />
                        </g>
                      )}
                      {currentClashArea === 'TOP' && (
                        <g transform="translate(12, 12)" className="animate-ping">
                          <circle cx="0" cy="0" r="8" fill="rgba(59, 130, 246, 0.3)" />
                        </g>
                      )}
                      {currentClashArea === 'BOT' && (
                        <g transform="translate(88, 88)" className="animate-ping">
                          <circle cx="0" cy="0" r="8" fill="rgba(239, 68, 68, 0.3)" />
                        </g>
                      )}
                      {currentClashArea === 'MID' && (
                        <g transform="translate(50, 50)" className="animate-ping">
                          <circle cx="0" cy="0" r="8" fill="rgba(244, 63, 94, 0.3)" />
                        </g>
                      )}

                      {/* Standard champion miniature pointers/vectors moving and colliding */}
                      {/* Active Blue champions */}
                      <g>
                        <circle cx="18" cy="20" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                        <text x="18" y="21.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">TOP</text>

                        <circle cx="42" cy="46" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                        <text x="42" y="47.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">JNG</text>

                        <circle cx="48" cy="51" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" className="animate-bounce" />
                        <text x="48" y="52.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">MID</text>

                        <circle cx="70" cy="85" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                        <text x="70" y="86.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">ADC</text>

                        <circle cx="76" cy="80" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                        <text x="76" y="81.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">SUP</text>
                      </g>

                      {/* Active Red champions */}
                      <g>
                        <circle cx="30" cy="14" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                        <text x="30" y="15.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">TOP</text>

                        <circle cx="58" cy="42" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                        <text x="58" y="43.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">JNG</text>

                        <circle cx="52" cy="48" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" className="animate-bounce" />
                        <text x="52" y="49.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">MID</text>

                        <circle cx="82" cy="62" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                        <text x="82" y="63.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">ADC</text>

                        <circle cx="76" cy="56" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                        <text x="76" y="57.2" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">SUP</text>
                      </g>

                    </svg>
                  </div>
                </div>

                {/* Macrostrategy and collision control */}
                <div className="mt-4 pt-4 border-t border-slate-500/15 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase">MACRO ATIVA MARCIAL:</span>
                    <strong className="text-[10px] text-amber-500 font-extrabold uppercase font-mono">
                      {activeStrategy.toUpperCase()}
                    </strong>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-bold">
                    ⚔️ Suas estratégias estão gerando skirmishes adicionais nas rotas!
                  </span>
                </div>

              </div>
            </div>

            {/* Lado Direito: Gráfico (Linha Cartesiana) + Log de Narração (Caixa de Narração) (Span 5) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Lado Direito Superior: Gráfico de linha cartesiano em tempo real showing advantage */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-[200px] ${
                isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10.5px] text-sky-400 font-bold uppercase tracking-wider">
                    Análise Cartesiana
                  </span>

                  {/* Advantage tabs */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActiveChartTab('gold')}
                      className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase ${
                        activeChartTab === 'gold' ? 'bg-sky-400 text-black' : isDark ? 'bg-[#070d19] text-gray-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Vantagem Ouro
                    </button>
                    <button
                      onClick={() => setActiveChartTab('xp')}
                      className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase ${
                        activeChartTab === 'xp' ? 'bg-sky-400 text-black' : isDark ? 'bg-[#070d19] text-gray-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Vantagem XP
                    </button>
                  </div>
                </div>

                {/* Line advantage charting */}
                <div className="flex-1 w-full min-h-[120px] select-none">
                  <ResponsiveContainer width="100%" height={125}>
                    <AreaChart data={advantageHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="minute" stroke={isDark ? "#4b5563" : "#94a3b8"} fontSize={8} />
                      <YAxis stroke={isDark ? "#4b5563" : "#94a3b8"} fontSize={8} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#070d19' : '#ffffff', 
                          borderColor: isDark ? '#1e2d44' : '#e2e8f0',
                          color: isDark ? '#ffffff' : '#000000',
                          fontSize: '10px'
                        }} 
                      />
                      <ReferenceLine y={0} stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(30, 41, 59, 1.25)"} strokeDasharray="3 3" />
                      <Area 
                        type="monotone" 
                        dataKey={activeChartTab === 'gold' ? 'gold' : 'xp'} 
                        stroke={goldDelta >= 0 ? '#38bdf8' : '#ef4444'} 
                        fill={goldDelta >= 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)'} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lado Direito Inferior: "Caixa de Narração" (Log de eventos de texto) */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-[300px] ${
                isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-500/10 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Caixa de Narração
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                      isDark ? 'bg-slate-950 text-sky-400' : 'bg-slate-100 text-slate-800'
                    }`}>
                      ⏱️ {activeMinute.toString().padStart(2, '0')}:00 M
                    </span>

                    {activeMinute < 30 ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1 rounded bg-sky-400 text-[#070d19] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                          title={isPlaying ? 'Pausar' : 'Iniciar'}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={triggerInstantMatch}
                          className="px-2 py-1 bg-slate-800 text-slate-100 border border-slate-700 text-[8px] font-black uppercase rounded hover:text-white"
                        >
                          Simular Insta
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-black text-[9px] uppercase animate-pulse">TERMINADO</span>
                    )}
                  </div>
                </div>

                {/* Event logger wrapper */}
                <div className={`flex-1 overflow-y-auto p-3 rounded-lg border font-mono text-[10px] space-y-1.5 mb-3 max-h-[180px] ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  {gameLogs.map((lg, i) => {
                    const row = formatLogRow(lg);
                    return (
                      <div key={lg.id || i} className={`${row.textColorClass} flex items-start gap-1 p-1`}>
                        <span className="text-gray-500 font-extrabold mr-1 shadow-sm font-mono flex-shrink-0">
                          [{lg.timestamp}]
                        </span>
                        <span className="leading-normal flex-1 capitalize-first whitespace-pre-line">{row.text}</span>
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>

                {/* Footer action */}
                <div>
                  {activeMinute >= 30 ? (
                    <button
                      onClick={concludeRealtimeGame}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display text-[10px] font-black py-2.5 uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-lg"
                    >
                      FINALIZAR MAPA E VER RELATÓRIO <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[8px] text-gray-550 font-black tracking-widest block text-center uppercase">
                      🔧 O controle de velocidade regula a atualização dinâmica minuto a minuto!
                    </span>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {currentStep === 'REPORT' && (
        <div className="py-8 px-6 max-w-6xl mx-auto">
          {(() => {
            const playersAllPerformance = [...bluePerformance, ...redPerformance];
            const mvpPerformance = playersAllPerformance.length > 0 
              ? playersAllPerformance.reduce((prev, current) => (prev.mvpScore > current.mvpScore) ? prev : current)
              : null;

            const golds = finalGoldHistory.map(d => d.gold);
            const maxGold = Math.max(...golds, 1);
            const minGold = Math.min(...golds, -1);
            const zeroOffset = Math.max(0.01, Math.min(0.99, maxGold / (maxGold - minGold)));

            return (
              <>
                {/* Cabeçalho de confirmação do resultado da série */}
                <div className={`p-6 rounded-2xl border mb-6 text-center ${
                  gameOutcome === 'victory' 
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow'
                    : isDark ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-red-50 border-red-300 text-red-800 shadow'
                }`}>
                  <span className="text-[10px] uppercase font-black tracking-widest block mb-1">
                    Fim da Partida {currentGameIndex} · Série de {seriesFormatName}
                  </span>
                  <h2 className="text-2xl font-display font-black uppercase tracking-wide">
                    {gameOutcome === 'victory' 
                      ? `🏆 VITÓRIA DO SEU TIME (${currentGameIndex === 1 ? '1x0' : `${blueSeriesScore}x${redSeriesScore}`})` 
                      : `🚫 DERROTA EM CAMPO (${currentGameIndex === 1 ? '0x1' : `${blueSeriesScore}x${redSeriesScore}`})`}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1.5 font-semibold">
                    Placar da Série: {currentBlueTeam.acronym} {blueSeriesScore} x {redSeriesScore} {currentRedTeam.acronym}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-stretch">
                  
                  {/* PAINEL A: MVP DA PARTIDA */}
                  {mvpPerformance && (
                    <div className="lg:col-span-4 flex">
                      <div className={`flex flex-col items-center justify-between p-6 rounded-2xl border text-center relative overflow-hidden transition-all shadow-md w-full ${
                        isDark ? 'bg-[#161a23] border-[#1e2d44]' : 'bg-white border-slate-205'
                      }`}>
                        {/* Selo destacado */}
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-bounce">
                          <Trophy className="w-3 h-3" /> MVP DA PARTIDA
                        </div>

                        {/* Foto do Jogador */}
                        <div className="mt-8 relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-md bg-slate-950">
                          <img 
                            src={getPlayerPhoto(mvpPerformance.player)} 
                            alt={mvpPerformance.player.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        {/* Dados */}
                        <div className="mt-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 mb-0.5 block">
                            {mvpPerformance.position}
                          </span>
                          <h3 className={`text-xl font-display font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {mvpPerformance.player.name}
                          </h3>
                          <span className="text-[10px] text-gray-500 font-extrabold block uppercase mt-1">
                            {mvpPerformance.teamName}
                          </span>
                        </div>

                        {/* Campeão Utilizado */}
                        <div className="my-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-950/40 border-slate-700/20">
                          <img 
                            src={getChampAvatar(mvpPerformance.championId)} 
                            alt={mvpPerformance.championName} 
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover border border-amber-400/50" 
                          />
                          <span className="text-[9.5px] font-extrabold uppercase text-amber-500 tracking-wider">
                            {mvpPerformance.championName}
                          </span>
                        </div>

                        {/* Estatísticas KDA & CS */}
                        <div className="grid grid-cols-3 gap-2 w-full border-t border-solid pt-4 border-slate-500/10">
                          <div>
                            <span className="text-[8px] font-bold text-gray-500 block uppercase">KDA FINAL</span>
                            <strong className="text-[11px] font-mono font-black mt-0.5 block">{mvpPerformance.kills}/{mvpPerformance.deaths}/{mvpPerformance.assists}</strong>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-500 block uppercase">DANO</span>
                            <strong className="text-[11px] font-mono font-black mt-0.5 block text-amber-500">{mvpPerformance.damage.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-500 block uppercase">FARM (CS)</span>
                            <strong className="text-[11px] font-mono font-black mt-0.5 block text-sky-400">{mvpPerformance.cs} CS</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAINEL B: GRÁFICO DE EVOLUÇÃO DE OURO (GOLD GRAPH) */}
                  <div className={`lg:col-span-8 p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                    isDark ? 'bg-[#161a23] border-[#1e2d44]' : 'bg-white border-slate-205'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-sky-400' : 'text-blue-600'}`}>
                          Histórico de Diferencial de Ouro (Minuto a Minuto)
                        </h3>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase">
                          <span className="text-sky-400">▲ LADO AZUL Vantagem</span>
                          <span className="text-neutral-500">|</span>
                          <span className="text-red-500">▼ LADO VERMELHO Vantagem</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mb-3">
                        A linha de referência 0 indica equilíbrio absoluto. Curvas ascendentes beneficiam o Lado Azul, descendentes o Lado Vermelho.
                      </p>
                    </div>

                    <div className="h-[210px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={finalGoldHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="splitColor" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                              <stop offset={`${zeroOffset * 100}%`} stopColor="#38bdf8" stopOpacity={0.06} />
                              <stop offset={`${zeroOffset * 100}%`} stopColor="#ef4444" stopOpacity={0.06} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="minute" stroke={isDark ? "#4b5563" : "#94a3b8"} fontSize={9} label={{ value: 'Minuto', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke={isDark ? "#4b5563" : "#94a3b8"} fontSize={9} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: isDark ? '#070d19' : '#ffffff', 
                              borderColor: isDark ? '#1e2d44' : '#e2e8f0',
                              color: isDark ? '#ffffff' : '#000000',
                              fontSize: '10px'
                            }} 
                            formatter={(value: any) => [
                              `${value > 0 ? '+' : ''}${value.toLocaleString()} Ouro`,
                              value >= 0 ? `Vantagem ${currentBlueTeam.acronym}` : `Vantagem ${currentRedTeam.acronym}`
                            ]}
                          />
                          <ReferenceLine y={0} stroke={isDark ? "#374151" : "#cbd5e1"} strokeWidth={1} />
                          <Area 
                            type="monotone" 
                            dataKey="gold" 
                            stroke={goldDelta >= 0 ? '#38bdf8' : '#ef4444'} 
                            fill="url(#splitColor)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pequena recapitulação de neutros no painel B */}
                    <div className="grid grid-cols-2 gap-4 mt-3 border-t border-solid pt-3 border-slate-500/10 text-center text-xs">
                      <div className="text-sky-400 font-bold">
                        {currentBlueTeam.acronym} Neutros: {stats.baronsBlue} Barões / {stats.dragonsBlue} Dragões / {stats.towersBlue} Torres
                      </div>
                      <div className="text-red-500 font-bold">
                        {currentRedTeam.acronym} Neutros: {stats.baronsRed} Barões / {stats.dragonsRed} Dragões / {stats.towersRed} Torres
                      </div>
                    </div>
                  </div>

                </div>

                {/* PAINEL C: TABELAS DE DESEMPENHO (LADO AZUL VS LADO VERMELHO) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  
                  {/* Tabela Lado Azul */}
                  <div className={`p-5 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#161a23] border-[#1f2937]' : 'bg-[#ffffff] border-slate-205'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block" />
                        {currentBlueTeam.name} (Lado Azul)
                      </h3>
                      <span className={`text-[9px] font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded ${
                        gameOutcome === 'victory' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {gameOutcome === 'victory' ? 'VENCEDOR' : 'DERROTADO'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b border-solid text-[9px] font-black uppercase tracking-wider ${
                            isDark ? 'border-[#1f2937] text-gray-400' : 'border-[#f1f5f9] text-slate-400'
                          }`}>
                            <th className="py-2 pb-2.5">Jogador (Campeão)</th>
                            <th className="py-2 pb-2.5 text-center">KDA</th>
                            <th className="py-2 pb-2.5 text-center">Farm (CS)</th>
                            <th className="py-2 pb-2.5 text-center">Dano Causado</th>
                            <th className="py-2 pb-2.5 text-right">Ouro Final</th>
                          </tr>
                        </thead>
                        <tbody className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                          {bluePerformance.map((item, idx) => (
                            <tr key={idx} className={`border-b border-solid transition-colors hover:bg-slate-500/5 ${
                              isDark ? 'border-[#1f2937]/50' : 'border-[#f1f5f9]/50'
                            }`}>
                              <td className="py-2.5 flex items-center gap-2">
                                <img 
                                  src={getChampAvatar(item.championId)} 
                                  alt={item.championName} 
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover border border-slate-705/10" 
                                />
                                <div>
                                  <span className="font-bold block text-[11px] leading-tight">{item.player.name}</span>
                                  <span className="text-[8px] text-gray-500 uppercase font-bold">{item.position} · {item.championName}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold text-[11px]">
                                {item.kills} / <span className="text-red-500 font-bold">{item.deaths}</span> / {item.assists}
                              </td>
                              <td className="py-2.5 text-center font-mono text-slate-400 font-normal text-[10.5px]">
                                {item.cs} CS
                              </td>
                              <td className="py-2.5 text-center font-mono text-amber-500 font-bold text-[10.5px]">
                                {item.damage.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-right font-mono text-emerald-500 font-bold text-[10.5px]">
                                ${item.gold.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabela Lado Vermelho */}
                  <div className={`p-5 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#161a23] border-[#1f2937]' : 'bg-[#ffffff] border-slate-205'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                        {currentRedTeam.name} (Lado Vermelho)
                      </h3>
                      <span className={`text-[9px] font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded ${
                        gameOutcome !== 'victory' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {gameOutcome !== 'victory' ? 'VENCEDOR' : 'DERROTADO'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b border-solid text-[9px] font-black uppercase tracking-wider ${
                            isDark ? 'border-[#1f2937] text-gray-400' : 'border-[#f1f5f9] text-slate-400'
                          }`}>
                            <th className="py-2 pb-2.5">Jogador (Campeão)</th>
                            <th className="py-2 pb-2.5 text-center">KDA</th>
                            <th className="py-2 pb-2.5 text-center">Farm (CS)</th>
                            <th className="py-2 pb-2.5 text-center">Dano Causado</th>
                            <th className="py-2 pb-2.5 text-right">Ouro Final</th>
                          </tr>
                        </thead>
                        <tbody className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                          {redPerformance.map((item, idx) => (
                            <tr key={idx} className={`border-b border-solid transition-colors hover:bg-slate-500/5 ${
                              isDark ? 'border-[#1f2937]/50' : 'border-[#f1f5f9]/50'
                            }`}>
                              <td className="py-2.5 flex items-center gap-2">
                                <img 
                                  src={getChampAvatar(item.championId)} 
                                  alt={item.championName} 
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover border border-slate-705/10" 
                                />
                                <div>
                                  <span className="font-bold block text-[11px] leading-tight">{item.player.name}</span>
                                  <span className="text-[8px] text-gray-500 uppercase font-bold">{item.position} · {item.championName}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold text-[11px]">
                                {item.kills} / <span className="text-red-500 font-bold">{item.deaths}</span> / {item.assists}
                              </td>
                              <td className="py-2.5 text-center font-mono text-slate-400 font-normal text-[10.5px]">
                                {item.cs} CS
                              </td>
                              <td className="py-2.5 text-center font-mono text-amber-500 font-bold text-[10.5px]">
                                {item.damage.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-right font-mono text-emerald-500 font-bold text-[10.5px]">
                                ${item.gold.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </>
            );
          })()}

          {/* Navigation action Footer */}
          <div className="mt-10 flex justify-center border-t border-solid pt-8 border-slate-500/10">
            <button
              onClick={advanceNextMatchOrFinish}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display text-xs font-black py-3.5 px-12 rounded-xl tracking-widest uppercase flex items-center gap-2.5 shadow-lg transition-transform hover:scale-[1.03]"
            >
              {blueSeriesScore >= winsNeeded || redSeriesScore >= winsNeeded ? (
                <>
                  CONCLUIR SÉRIE E SALVAR <Trophy className="w-4 h-4 text-yellow-350" />
                </>
              ) : (
                <>
                  AVANÇAR PARA JOGO {currentGameIndex + 1} DE {seriesFormatName} <ChevronRight className="w-4 h-4 text-sky-300" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

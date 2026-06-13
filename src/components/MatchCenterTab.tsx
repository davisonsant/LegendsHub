/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Target, Shield, Award, Sparkles, ChevronRight, Play, FastForward, HelpCircle, Activity, Trophy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { GameState, Team, PickBan, MatchSeries, MatchLog, MatchStats } from '../types';
import { generateGameStep } from '../utils/matchSimulator';

interface MatchCenterTabProps {
  gameState: GameState;
  bluePicks: { [key: string]: string };
  redPicks: { [key: string]: string };
  onFinishMatchSeries: (scoreBlue: number, scoreRed: number, logs: MatchLog[]) => void;
  theme?: 'light' | 'dark';
}

export default function MatchCenterTab({
  gameState,
  bluePicks,
  redPicks,
  onFinishMatchSeries,
  theme = 'dark'
}: MatchCenterTabProps) {
  const isDark = theme === 'dark';
  const { playerTeamId, teams, week } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

  // Find opponent
  const currentWeekMatches = gameState.calendarSchedule[week];
  const playerNextOpponentMatch = currentWeekMatches?.find(
    m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId
  );

  let opponentTeamObj = teams.find(t => t.id !== playerTeamId)!;
  let isPlayerBlue = true;

  if (playerNextOpponentMatch) {
    const oppId = playerNextOpponentMatch.teamBlueId === playerTeamId 
      ? playerNextOpponentMatch.teamRedId 
      : playerNextOpponentMatch.teamBlueId;
    opponentTeamObj = teams.find(t => t.id === oppId) || opponentTeamObj;
    isPlayerBlue = playerNextOpponentMatch.teamBlueId === playerTeamId;
  }

  // Tactical simulations
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMinute, setActiveMinute] = useState(0);
  const [speedMs, setSpeedMs] = useState(1000); 
  const [gameLogs, setGameLogs] = useState<MatchLog[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<'aggressive' | 'defensive' | 'objectives' | 'focusBot' | 'focusTop'>('objectives');
  
  // Gold and XP oscillation history
  const [advantageHistory, setAdvantageHistory] = useState<{ minute: number; gold: number; xp: number }[]>([
    { minute: 0, gold: 0, xp: 0 }
  ]);
  const [activeChartTab, setActiveChartTab] = useState<'gold' | 'xp'>('gold');

  // Game metrics
  const [stats, setStats] = useState<MatchStats>({
    killsBlue: 0,
    killsRed: 0,
    deathsBlue: 0,
    deathsRed: 0,
    assistsBlue: 0,
    assistsRed: 0,
    towersBlue: 0,
    towersRed: 0,
    dragonsBlue: 0,
    dragonsRed: 0,
    baronsBlue: 0,
    baronsRed: 0
  });

  const [goldDelta, setGoldDelta] = useState(0); 

  // Bo3 Match series score keepers
  const [currentMapIndex, setCurrentMapIndex] = useState(1);
  const [blueSeriesScore, setBlueSeriesScore] = useState(0);
  const [redSeriesScore, setRedSeriesScore] = useState(0);
  const [mapWinners, setMapWinners] = useState<string[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLogs]);

  // Game step simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    if (activeMinute >= 32) {
      setIsPlaying(false);
      concludeMapWithStats(stats, goldDelta);
      return;
    }

    const timer = setInterval(() => {
      const stepIndex = activeMinute + 2;
      const stepResult = generateGameStep(
        stepIndex,
        150, 
        140, 
        activeStrategy,
        isPlayerBlue ? playerTeam.name : opponentTeamObj.name,
        isPlayerBlue ? opponentTeamObj.name : playerTeam.name,
        bluePicks,
        redPicks,
        stats,
        gameState.champions,
        isPlayerBlue ? playerTeam : opponentTeamObj,
        isPlayerBlue ? opponentTeamObj : playerTeam
      );

      // Apply increments and timeline graphing
      setStats(prev => {
        const nextStats = { ...prev, ...stepResult.statsChange };
        
        // Append value to charting history
        setAdvantageHistory(h => {
          const lastH = h[h.length - 1] || { minute: 0, gold: 0, xp: 0 };
          const nextGold = lastH.gold + stepResult.goldChange;
          const nextXP = Math.round(nextGold * 0.85 + (Math.random() - 0.5) * 120);
          return [...h, { minute: stepIndex, gold: nextGold, xp: nextXP }];
        });

        return nextStats;
      });

      setGoldDelta(prev => prev + stepResult.goldChange);
      setGameLogs(g => [...g, stepResult.log]);
      setActiveMinute(stepIndex);
    }, speedMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeMinute, activeStrategy, speedMs, stats, goldDelta]);

  const concludeMapWithStats = (mapStats: MatchStats, finalGoldDelta: number) => {
    // Decide winner based on metric evaluation
    const evaluation = (mapStats.killsBlue * 350) + (mapStats.towersBlue * 1000) + (mapStats.dragonsBlue * 500) + (mapStats.baronsBlue * 1500) + finalGoldDelta;
    const opponentEvaluation = (mapStats.killsRed * 350) + (mapStats.towersRed * 1000) + (mapStats.dragonsRed * 500) + (mapStats.baronsRed * 1500) - finalGoldDelta;

    const blueWon = evaluation > opponentEvaluation;
    let winnerName = "";
    
    if (blueWon) {
      setBlueSeriesScore(b => b + 1);
      winnerName = isPlayerBlue ? playerTeam.name : opponentTeamObj.name;
    } else {
      setRedSeriesScore(r => r + 1);
      winnerName = isPlayerBlue ? opponentTeamObj.name : playerTeam.name;
    }

    const indexStr = `${activeMinute + 2}:00`;
    setGameLogs(g => [...g, {
      id: Math.random().toString(),
      timestamp: indexStr,
      type: 'info',
      message: `💥 [NEXUS DESTRUÍDO] Com um avanço maciço na rota do meio, a equipe do ${winnerName} explode o Nexus defensivo e vence a partida!`,
      goldDelta: 0
    }]);

    setMapWinners(m => [...m, winnerName]);
  };

  const handleNextMap = () => {
    setActiveMinute(0);
    setGoldDelta(0);
    setAdvantageHistory([{ minute: 0, gold: 0, xp: 0 }]);
    setStats({
      killsBlue: 0,
      killsRed: 0,
      deathsBlue: 0,
      deathsRed: 0,
      assistsBlue: 0,
      assistsRed: 0,
      towersBlue: 0,
      towersRed: 0,
      dragonsBlue: 0,
      dragonsRed: 0,
      baronsBlue: 0,
      baronsRed: 0
    });
    setGameLogs([]);
    setCurrentMapIndex(idx => idx + 1);
  };

  const skipRemainingSim = () => {
    const newHistory = [...advantageHistory];
    let currentGold = goldDelta;
    const tempStats = { ...stats };

    for (let m = activeMinute; m < 32; m += 2) {
      const step = generateGameStep(
        m,
        150,
        140,
        activeStrategy,
        isPlayerBlue ? playerTeam.name : opponentTeamObj.name,
        isPlayerBlue ? opponentTeamObj.name : playerTeam.name,
        bluePicks,
        redPicks,
        tempStats,
        gameState.champions,
        isPlayerBlue ? playerTeam : opponentTeamObj,
        isPlayerBlue ? opponentTeamObj : playerTeam
      );
      Object.assign(tempStats, step.statsChange);
      currentGold += step.goldChange;
      newHistory.push({
        minute: m,
        gold: currentGold,
        xp: Math.round(currentGold * 0.85 + (Math.random() - 0.5) * 120)
      });
      gameLogs.push(step.log);
    }
    setActiveMinute(32);
    setStats({ ...tempStats });
    setGoldDelta(currentGold);
    setAdvantageHistory(newHistory);
    setGameLogs([...gameLogs]);
    concludeMapWithStats(tempStats, currentGold);
  };

  const handleFinishBo3Series = () => {
    onFinishMatchSeries(blueSeriesScore, redSeriesScore, gameLogs);
  };

  const seriesOver = blueSeriesScore >= 2 || redSeriesScore >= 2;
  const isMapFinished = activeMinute >= 32;

  // Last log info indicator
  const lastLogType = gameLogs[gameLogs.length - 1]?.type || 'info';

  // Dragões conquistas mapping sequencial utilizando rigorosamente os arquivos vinculados no estado
  const DRAGON_FILES = ['dg-infernal.png', 'dg-montanha.png', 'dg-nuvem.png', 'dg-oceano.png'];
  const blueDragonsConquered = DRAGON_FILES.slice(0, Math.min(stats.dragonsBlue, 4));
  const redDragonsConquered = DRAGON_FILES.slice(0, Math.min(stats.dragonsRed, 4));

  // Logger formatted helper style (normal: black/white, deaths/kills: red pulse alert, dragons: green success)
  const formatLog = (log: MatchLog) => {
    let text = log.message;
    let textColorClass = isDark ? 'text-white' : 'text-slate-800';
    let isAlert = false;
    let isSuccess = false;

    const lower = text.toLowerCase();
    
    if (log.type === 'dragon' || log.type === 'baron' || lower.includes('dragon') || lower.includes('conquistado') || lower.includes('abutou') || lower.includes('dragão') || lower.includes('barão')) {
      if (!text.includes('[SUCCESS]')) {
        text = `${text} [SUCCESS]`;
      }
      text = text.replace('[PULSINGS ALERT]', ''); 
      textColorClass = 'text-green-500 font-extrabold bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 block mb-1';
      isSuccess = true;
    } else if (log.type === 'kill' || lower.includes('abate') || lower.includes('perigo') || lower.includes('mortes') || lower.includes('destruído') || lower.includes('perda') || lower.includes('derruba')) {
      if (!text.includes('[PULSINGS ALERT]')) {
        text = `${text} [PULSINGS ALERT]`;
      }
      text = text.replace('[SUCCESS]', ''); 
      textColorClass = 'text-red-500 font-extrabold animate-pulse bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 block mb-1';
      isAlert = true;
    } else {
      textColorClass = `${isDark ? 'text-white' : 'text-slate-700'} font-semibold block mb-1 opacity-90`;
    }

    return { text, textColorClass, isAlert, isSuccess };
  };

  return (
    <div className={`min-h-screen py-8 px-6 font-sans select-none transition-colors duration-300 ${
      isDark ? 'bg-[#070d19] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* BO3 Score banner header top */}
      <div className={`grid grid-cols-1 md:grid-cols-3 border p-5 rounded-2xl mb-6 shadow-sm items-center ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        {/* Blue organization */}
        <div className="text-left">
          <p className="text-[9px] text-[#00d2fd] uppercase font-black tracking-widest">Equipe Azul (Esquerda)</p>
          <h4 className={`font-display text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{isPlayerBlue ? playerTeam.name : opponentTeamObj.name}</h4>
          
          {/* Blue Dragons sequential targets rendering */}
          <div className="flex gap-1.5 mt-2 items-center">
            <span className="text-[8px] font-bold text-gray-400 mr-1 uppercase">DRAGÕES:</span>
            {blueDragonsConquered.length > 0 ? blueDragonsConquered.map((fn, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full border border-blue-500 bg-blue-500/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" title="Dragão conquistado">
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
                      fb.className = 'dragon-fallback text-[8px] font-black text-blue-400';
                      fb.innerText = fn.split('-')[1].split('.')[0].toUpperCase().substring(0,3);
                      parent.appendChild(fb);
                    }
                  }}
                />
              </div>
            )) : <span className="text-[8.5px] text-gray-500 font-semibold italic">Nenhum</span>}
          </div>
        </div>

        {/* Global scoreboard Bo3 */}
        <div className="text-center">
          <p className="text-[9.5px] text-gray-400 font-black uppercase tracking-widest mb-1">MAPA COVIL {currentMapIndex}</p>
          <div className="flex gap-4 items-center justify-center font-display text-2xl font-black">
            <span className={blueSeriesScore > redSeriesScore ? 'text-[#00d2fd]' : ''}>{blueSeriesScore}</span>
            <span className="text-gray-500">x</span>
            <span className={redSeriesScore > blueSeriesScore ? 'text-red-500' : ''}>{redSeriesScore}</span>
          </div>
        </div>

        {/* Red organization */}
        <div className="text-right">
          <p className="text-[9px] text-red-500 uppercase font-black tracking-widest">Equipe Vermelha (Direita)</p>
          <h4 className={`font-display text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{isPlayerBlue ? opponentTeamObj.name : playerTeam.name}</h4>
          
          {/* Red Dragons sequential targets rendering */}
          <div className="flex gap-1.5 mt-2 items-center justify-end">
            {redDragonsConquered.length > 0 ? redDragonsConquered.map((fn, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full border border-red-500 bg-red-500/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" title="Dragão conquistado">
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
            <span className="text-[8px] font-bold text-gray-400 ml-1 uppercase">DRAGÕES:</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* 1. Lado Esquerdo (Minimapa Tático - summoner's rift paths SVG) (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`rounded-xl p-5 border shadow-sm ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <h5 className={`font-display text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>SUMMONER'S RIFT FIELD VISION</h5>
            
            {/* Placar Superior do Mapa */}
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900/40 border border-[#1e2d44]/50 rounded-xl mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-400">BLUE SIDE</span>
                <span className="text-xs font-black text-white ml-1">{stats.killsBlue} K</span>
                <span className="text-[10px] font-bold text-slate-500">/ {stats.towersBlue} T</span>
              </div>

              <div className="text-center">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block leading-none">K/D GLOBAL</span>
                <strong className="text-xs font-black text-amber-400">
                  {stats.deathsBlue + stats.deathsRed > 0 
                    ? ((stats.killsBlue + stats.killsRed) / Math.max(1, stats.deathsBlue + stats.deathsRed)).toFixed(2) 
                    : "1.00"}
                </strong>
              </div>

              <div className="flex items-center gap-1.5 text-right">
                <span className="text-[10px] font-bold text-slate-500">{stats.towersRed} T /</span>
                <span className="text-xs font-black text-white mr-1">{stats.killsRed} K</span>
                <span className="text-[10px] font-bold text-red-500">RED SIDE</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            {/* Minimapa Tático (Paths + Player pointers + Collision arrows) */}
            <div className={`relative overflow-hidden h-[300px] flex items-center justify-center rounded-xl border ${
              isDark ? 'bg-black/90 border-slate-800' : 'bg-slate-150 border-slate-300'
            }`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px]">
                <svg className="w-full h-full" viewBox="0 0 100 100" style={{ backgroundImage: isDark ? "linear-gradient(to bottom right, #090e17, #0d1a2d)" : "linear-gradient(to bottom right, #f1f5f9, #e2e8f0)" }}>
                  
                  {/* TOP Lane */}
                  <path d="M 12 88 L 12 12 L 88 12" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.06)"} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 12 88 L 12 12 L 88 12" fill="none" stroke={isDark ? "#1b293e" : "#cbd5e1"} strokeWidth="1.5" strokeLinecap="round" />

                  {/* BOT Lane */}
                  <path d="M 12 88 L 88 88 L 88 12" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.06)"} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 12 88 L 88 88 L 88 12" fill="none" stroke={isDark ? "#1b293e" : "#cbd5e1"} strokeWidth="1.5" strokeLinecap="round" />

                  {/* MID Lane */}
                  <path d="M 12 88 L 88 12" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.06)"} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 12 88 L 88 12" fill="none" stroke={isDark ? "#1b293e" : "#cbd5e1"} strokeWidth="1.5" strokeLinecap="round" />

                  {/* Jungle Paths */}
                  <path d="M 28 12 L 50 50 L 72 88" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="3" />
                  <path d="M 12 28 L 50 50 L 88 72" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="3" />

                  {/* Base structures */}
                  <rect x="5" y="83" width="12" height="12" rx="2" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" />
                  <rect x="83" y="5" width="12" height="12" rx="2" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />

                  {/* Neutral pits */}
                  <circle cx="36" cy="36" r="4" fill="none" stroke="#d946ef" strokeWidth="0.8" />
                  <text x="36" y="32" fontSize="4.5" textAnchor="middle" fill="#d946ef" className="font-mono font-bold">BARON</text>

                  <circle cx="64" cy="64" r="4" fill="none" stroke="#eab308" strokeWidth="0.8" />
                  <text x="64" y="70" fontSize="4.5" textAnchor="middle" fill="#eab308" className="font-mono font-bold">DRAGON</text>

                  {/* Translucent arrows indicating recent movements & collisions */}
                  <g opacity="0.65" className="animate-pulse">
                    <path d="M 20 74 L 34 76 L 46 82" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                    <polygon points="46,82 40,83 45,78" fill="#3b82f6" />
                    
                    <path d="M 76 38 L 63 50 L 52 58" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                    <polygon points="52,58 59,57 54,63" fill="#ef4444" />
                    
                    {/* Mid clash indicators */}
                    <path d="M 38 62 L 44 56" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    <polygon points="44,56 39,57 41,61" fill="#3b82f6" />
                    <path d="M 62 38 L 56 44" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    <polygon points="56,44 61,43 59,39" fill="#ef4444" />
                  </g>

                  {/* Player miniature circular dots - Azul */}
                  <g>
                    <circle cx="20" cy="24" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                    <text x="20" y="25" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">TOP</text>

                    <circle cx="42" cy="46" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                    <text x="42" y="47" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">JNG</text>

                    <circle cx="48" cy="52" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" className="animate-bounce" />
                    <text x="48" y="53" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">MID</text>

                    <circle cx="68" cy="84" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                    <text x="68" y="85" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">ADC</text>

                    <circle cx="74" cy="81" r="2.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                    <text x="74" y="82" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">SUP</text>
                  </g>

                  {/* Player miniature circular dots - Vermelho */}
                  <g>
                    <circle cx="32" cy="14" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                    <text x="32" y="15" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">TOP</text>

                    <circle cx="58" cy="42" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                    <text x="58" y="43" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">JNG</text>

                    <circle cx="53" cy="48" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" className="animate-bounce" />
                    <text x="53" y="49" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">MID</text>

                    <circle cx="82" cy="62" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                    <text x="82" y="63" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">ADC</text>

                    <circle cx="78" cy="55" r="2.2" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                    <text x="78" y="56" fontSize="2.5" textAnchor="middle" fill="#fff" className="font-bold">SUP</text>
                  </g>

                </svg>
              </div>
            </div>
            
            {/* Strategy Selectors */}
            <div className="mt-4 pt-4 border-t border-[#1e2d44]/30">
              <span className="text-[10px] font-black text-[#00d2fd] block mb-2 uppercase">AJUSTAR INSTRUÇÕES TÁTICAS</span>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {[
                  { id: 'aggressive', label: 'AGRESSIVO' },
                  { id: 'defensive', label: 'DECON REC' },
                  { id: 'objectives', label: 'SELVA OBJ' },
                  { id: 'focusBot', label: 'BOT ROUTE' },
                  { id: 'focusTop', label: 'TOP FORCE' }
                ].map(strat => (
                  <button
                    key={strat.id}
                    onClick={() => setActiveStrategy(strat.id as any)}
                    className={`py-1.5 px-2 text-[8.5px] rounded border font-black uppercase transition-all ${
                      activeStrategy === strat.id 
                        ? 'bg-amber-500 text-slate-950 border-amber-500' 
                        : isDark ? 'bg-[#070d19] border-[#1e2d44] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {strat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Lateral Direita: Gráfico + Narração (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Top: Gráfico cartesiano Vantagem Ouro / Vantagem XP */}
          <div className={`rounded-xl p-4 border shadow-sm flex flex-col justify-between h-[230px] ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[10px] font-black uppercase ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>SUMMONER'S RIFT GRAPHS</span>
              
              {/* Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveChartTab('gold')}
                  className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase ${
                    activeChartTab === 'gold' ? 'bg-[#00d2fd] text-black' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Vantagem Ouro
                </button>
                <button
                  onClick={() => setActiveChartTab('xp')}
                  className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase ${
                    activeChartTab === 'xp' ? 'bg-[#00d2fd] text-black' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Vantagem XP
                </button>
              </div>
            </div>

            {/* continuous oscillating timeline AreaChart */}
            <div className="flex-1 w-full min-h-[140px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={advantageHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="minute" stroke={isDark ? "#475569" : "#94a3b8"} fontSize={8.5} />
                  <YAxis stroke={isDark ? "#475569" : "#94a3b8"} fontSize={8.5} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#070d19' : '#ffffff', 
                      borderColor: isDark ? '#1e2d44' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '10px'
                    }} 
                  />
                  <ReferenceLine y={0} stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth={1} />
                  <Area 
                    type="monotone" 
                    dataKey={activeChartTab === 'gold' ? 'gold' : 'xp'} 
                    stroke={goldDelta >= 0 ? '#3b82f6' : '#ef4444'} 
                    fill={goldDelta >= 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)'} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom: Caixa de Narração logs */}
          <div className={`rounded-xl p-4 border shadow-sm flex flex-col h-[280px] justify-between ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#1e2d44]/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Caixa de Narração</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black px-2 py-0.5 rounded ${isDark ? 'bg-slate-950 text-emerald-400' : 'bg-slate-100 text-slate-800'}`}>
                  ⏱️ {activeMinute.toString().padStart(2, '0')}:00 Min
                </span>
                
                {!isMapFinished ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 rounded bg-[#00d2fd] text-slate-950 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={skipRemainingSim}
                      className="text-[8.5px] font-black uppercase px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded hover:text-white"
                    >
                      Insta
                    </button>
                  </div>
                ) : (
                  <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-pulse">OVER</span>
                )}
              </div>
            </div>

            {/* scrolling block wrapper */}
            <div className={`flex-1 overflow-y-auto p-3 rounded-lg border font-mono text-[10.5px] space-y-2 mb-3.5 max-h-[165px] ${
              isDark ? 'bg-[#070d19] border-slate-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-900'
            }`}>
              {gameLogs.length > 0 ? gameLogs.map((log, idx) => {
                const formatted = formatLog(log);
                return (
                  <div key={log.id || idx} className={`${formatted.textColorClass} flex items-start gap-1 p-1`}>
                    <span className="text-slate-500 font-extrabold mr-1 shrink-0">[{log.timestamp}]</span>
                    <span className="leading-relaxed whitespace-pre-line">{formatted.text}</span>
                  </div>
                );
              }) : (
                <p className="text-center text-gray-500 italic mt-10">Aperte Play para iniciar os relatórios da partida em tempo real...</p>
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Footer triggers */}
            <div>
              {isMapFinished ? (
                seriesOver ? (
                  <button
                    onClick={handleFinishBo3Series}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#070d19] font-display text-[10px] font-black py-2.5 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-transform"
                  >
                    CONCLUIR SÉRIE E SALVAR <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextMap}
                    className="w-full bg-[#1e2d44] hover:bg-[#283e5c] text-[#00d2fd] font-display text-[10px] font-black py-2.5 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    AVANÇAR PARA PROX MAPA <ChevronRight className="w-4 h-4" />
                  </button>
                )
              ) : (
                <p className="text-[8.5px] text-gray-500 font-black uppercase tracking-widest text-center select-none">
                  Controle a velocidade da simulacao para monitorar taticas e obter buffs!
                </p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

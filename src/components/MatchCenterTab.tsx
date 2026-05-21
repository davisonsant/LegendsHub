/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Target, Shield, Award, Sparkles, ChevronRight, Play, FastForward, HelpCircle } from 'lucide-react';
import { GameState, Team, PickBan, MatchSeries, MatchLog, MatchStats } from '../types';
import { generateGameStep } from '../utils/matchSimulator';

interface MatchCenterTabProps {
  gameState: GameState;
  bluePicks: { [key: string]: string };
  redPicks: { [key: string]: string };
  onFinishMatchSeries: (scoreBlue: number, scoreRed: number, logs: MatchLog[]) => void;
}

export default function MatchCenterTab({
  gameState,
  bluePicks,
  redPicks,
  onFinishMatchSeries
}: MatchCenterTabProps) {
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
  const [speedMs, setSpeedMs] = useState(1000); // simulation clock speed
  const [gameLogs, setGameLogs] = useState<MatchLog[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<'aggressive' | 'defensive' | 'objectives' | 'focusBot' | 'focusTop'>('objectives');
  
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
    // scroll logs to end
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLogs]);

  // Game step simulation clock loop
  useEffect(() => {
    if (!isPlaying) return;

    if (activeMinute >= 32) {
      // Game Over Map threshold check! Decide map winner based on gold, kills, towers
      setIsPlaying(false);
      concludeMap();
      return;
    }

    const timer = setInterval(() => {
      const stepIndex = activeMinute + 2;
      const stepResult = generateGameStep(
        stepIndex,
        150, // blue comps power average estimate
        140, // red comps power average estimate
        activeStrategy,
        isPlayerBlue ? playerTeam.name : opponentTeamObj.name,
        isPlayerBlue ? opponentTeamObj.name : playerTeam.name,
        bluePicks,
        redPicks,
        stats
      );

      // Apply increments
      setStats(prev => ({
        ...prev,
        ...stepResult.statsChange
      }));
      setGoldDelta(prev => prev + stepResult.goldChange);
      setGameLogs(g => [...g, stepResult.log]);
      setActiveMinute(stepIndex);
    }, speedMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeMinute, activeStrategy, speedMs]);

  const concludeMap = () => {
    // Decide winner based on metric
    const evaluation = (stats.killsBlue * 350) + (stats.towersBlue * 1000) + (stats.dragonsBlue * 500) + (stats.baronsBlue * 1500) + goldDelta;
    const opponentEvaluation = (stats.killsRed * 350) + (stats.towersRed * 1000) + (stats.dragonsRed * 500) + (stats.baronsRed * 1500) - goldDelta;

    const blueWon = evaluation > opponentEvaluation;
    let winnerName = "";
    
    if (blueWon) {
      setBlueSeriesScore(b => b + 1);
      winnerName = isPlayerBlue ? playerTeam.name : opponentTeamObj.name;
    } else {
      setRedSeriesScore(r => r + 1);
      winnerName = isPlayerBlue ? opponentTeamObj.name : playerTeam.name;
    }

    // append conclusive nexus log
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
    // Reset individual map metrics but keep BO3 scores
    setActiveMinute(0);
    setGoldDelta(0);
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
    // Fast-simulates remainder fields instantly
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
        stats
      );
      // mutably apply inline
      Object.assign(stats, step.statsChange);
    }
    setActiveMinute(32);
    setStats({ ...stats });
    concludeMap();
  };

  const handleFinishBo3Series = () => {
    onFinishMatchSeries(blueSeriesScore, redSeriesScore, gameLogs);
  };

  const seriesOver = blueSeriesScore >= 2 || redSeriesScore >= 2;
  const isMapFinished = activeMinute >= 32;

  // Render tactical map pointers coordinates based on last log type
  const lastLogType = gameLogs[gameLogs.length - 1]?.type || 'info';

  return (
    <div className="min-h-screen bg-[#070d19] text-white py-8 px-6 font-sans">
      
      {/* Top row: Series scoreboard indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl mb-6 shadow-md select-none items-center">
        {/* Blue Side info */}
        <div className="text-left">
          <p className="text-[9px] text-[#00d2fd] uppercase font-bold tracking-widest">Equipe Azul</p>
          <h4 className="font-display-lg text-sm font-bold text-white uppercase">{isPlayerBlue ? playerTeam.name : opponentTeamObj.name}</h4>
        </div>

        {/* BO3 Large Numbers Scoreboard */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">SÉRIE MELHOR DE 3 (MAPA {currentMapIndex})</p>
          <div className="flex gap-4 items-center justify-center font-display-lg font-black text-2xl">
            <span className={blueSeriesScore > redSeriesScore ? 'text-[#00d2fd]' : 'text-white'}>{blueSeriesScore}</span>
            <span className="text-gray-600">-</span>
            <span className={redSeriesScore > blueSeriesScore ? 'text-red-400' : 'text-white'}>{redSeriesScore}</span>
          </div>
        </div>

        {/* Red Side info */}
        <div className="text-right">
          <p className="text-[9px] text-red-400 uppercase font-bold tracking-widest">Equipe Vermelha</p>
          <h4 className="font-display-lg text-sm font-bold text-white uppercase">{isPlayerBlue ? opponentTeamObj.name : playerTeam.name}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Tactical Map Monitor & Adaptive Strategy (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Animated Tactical Map SVG representation of Rift lanes */}
          <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 relative overflow-hidden h-[300px] flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Rift lanes bounding squares */}
                <path d="M 10,10 L 90,10 L 90,90 L 10,90 Z" fill="none" stroke="#1e2d44" strokeWidth="1" strokeDasharray="3" />
                <line x1="10" y1="90" x2="90" y2="10" stroke="#1e2d44" strokeWidth="1.5" /> {/* Midlane */}
                
                {/* Base fountains */}
                <rect x="5" y="85" width="10" height="10" fill="rgba(0, 210, 253, 0.15)" stroke="#00d2fd" strokeWidth="1" /> {/* Blue Fountain */}
                <rect x="85" y="5" width="10" height="10" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" /> {/* Red Fountain */}

                {/* Cover pits Baron/Dragon circles */}
                <circle cx="35" cy="35" r="5" fill="none" stroke="#1e2d44" strokeWidth="0.8" /> {/* Baron Pit */}
                <circle cx="65" cy="65" r="5" fill="none" stroke="#1e2d44" strokeWidth="0.8" /> {/* Dragon Pit */}

                {/* Animated active alert nodes */}
                {lastLogType === 'kill' && (
                  <circle cx="50" cy="50" r="4" fill="#ffaa00" className="animate-ping" />
                )}
                {lastLogType === 'baron' && (
                  <circle cx="35" cy="35" r="4" fill="#c541ff" className="animate-ping" />
                )}
                {lastLogType === 'dragon' && (
                  <circle cx="65" cy="65" r="4" fill="#00d2fd" className="animate-ping" />
                )}
                {lastLogType === 'tower' && (
                  <circle cx="40" cy="80" r="3" fill="#ff3333" className="animate-ping" />
                )}
              </svg>

              {/* Labels overlay */}
              <span className="absolute bottom-1 left-2 text-[8px] text-[#00d2fd] uppercase font-black tracking-widest uppercase">Base Azul</span>
              <span className="absolute top-1 right-2 text-[8px] text-red-500 uppercase font-black tracking-widest uppercase">Base Vermelha</span>
              <span className="absolute top-1/4 left-1/4 text-[8px] text-purple-400 font-bold uppercase">Barão Pit</span>
              <span className="absolute bottom-1/4 right-1/4 text-[8px] text-[#00d2fd] font-bold uppercase">Dragão Pit</span>
            </div>

            <div className="absolute top-4 left-4 font-display-lg text-xs font-black tracking-wider text-white">
              SISTEMA DE VISÃO TÁTICA (SUMMONER'S RIFT COORDS)
            </div>
          </div>

          {/* Strategic midgame Adaptation selectors */}
          <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg space-y-4">
            <h5 className="font-display-lg text-xs font-black uppercase tracking-widest text-[#00d2fd] border-b border-[#1e2d44] pb-2">Instruções Táticas em Tempo Real</h5>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: 'aggressive', title: 'Jogar Agressivo' },
                { id: 'defensive', title: 'Recuar e Farmar' },
                { id: 'objectives', title: 'Focar Objetivos/Selva' },
                { id: 'focusBot', title: 'Rotacionar Rota Bot' },
                { id: 'focusTop', title: 'Forçar Rota Top' }
              ].map(strat => {
                const isCurrent = activeStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    onClick={() => setActiveStrategy(strat.id as any)}
                    className={`py-2 px-3 rounded text-[10px] font-bold uppercase tracking-wider text-left border transition-all ${
                      isCurrent 
                        ? 'border-[#00d2fd] bg-[#00d2fd]/10 text-[#00d2fd]' 
                        : 'border-[#1e2d44] bg-[#070d19] text-gray-500 hover:border-[#1e2d44]/80'
                    }`}
                  >
                    {strat.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scrolling logs Feed & Series triggers (Span 5) */}
        <div className="lg:col-span-5 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg flex flex-col justify-between h-[490px]">
          <div>
            {/* Headers clock indicator */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1e2d44]">
              <span className="font-display-lg text-white text-base font-black">
                ⏱️ {activeMinute.toString().padStart(2, '0')}:00
              </span>
              
              {/* Controls triggers row */}
              {!isMapFinished ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded bg-[#00d2fd] text-black hover:opacity-90 transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={skipRemainingSim}
                    className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white border border-[#1e2d44] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2"
                  >
                    <FastForward className="w-3.5 h-3.5" /> Insta-Sim
                  </button>
                </div>
              ) : (
                <span className="text-green-400 text-xs font-bold uppercase animate-pulse">Partida Encerrada</span>
              )}
            </div>

            {/* scrolling block wrapper */}
            <div className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 h-[280px] overflow-y-auto space-y-4">
              {gameLogs.map((log, idx) => (
                <div key={log.id || idx} className="text-[11px] leading-relaxed">
                  <span className="font-mono text-gray-400 font-bold mr-2">[{log.timestamp}]</span>
                  <span className={log.type === 'kill' ? 'text-amber-400 font-medium' : log.type?.startsWith('baron') || log.type?.startsWith('dragon') ? 'text-[#00d2fd] font-semibold' : 'text-gray-300'}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Series triggers: Next Map, Finish series */}
          <div className="pt-4 border-t border-[#1e2d44] flex justify-end">
            {isMapFinished ? (
              seriesOver ? (
                <button
                  onClick={handleFinishBo3Series}
                  className="w-full bg-[#00d2fd] text-black font-display-lg text-xs font-bold py-3 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  CONCLUIR SÉRIE E SALVAR <ChevronRight className="w-4.5 h-4.5" />
                </button>
              ) : (
                <button
                  onClick={handleNextMap}
                  className="w-full bg-[#1e2d44] text-[#00d2fd] font-display-lg text-xs font-bold py-3 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  AVANÇAR PARA O PRÓXIMO MAPA <ChevronRight className="w-4.5 h-4.5" />
                </button>
              )
            ) : (
              <p className="text-[9.5px] text-gray-500 font-extrabold uppercase tracking-widest text-center w-full select-none">
                Acompanhe o mapa tático ou utilize o Insta-Sim para progressão relâmpago!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

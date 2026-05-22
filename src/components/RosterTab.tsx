/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, Sparkles, TrendingUp, DollarSign, Calendar, Heart, Award, ArrowUp, 
  RefreshCcw, Search, Trash2, SwitchCamera, Check, Play, UserCheck, BarChart2,
  ListFilter, Circle, HelpCircle, Activity, ChevronRight, BrainCircuit, Target, Laptop, Plus
} from 'lucide-react';
import { GameState, Player, Position, Team } from '../types';
import { formatMoney } from '../utils/currency';

interface RosterTabProps {
  gameState: GameState;
  onRenewContract: (playerName: string) => void;
  onTransferListPlayer: (player: Player) => void;
  onReleasePlayer: (player: Player) => void;
  onSelectPlayerTraining: (playerName: string, focusArea: string) => void;
}

export default function RosterTab({
  gameState,
  onRenewContract,
  onTransferListPlayer,
  onReleasePlayer,
  onSelectPlayerTraining
}: RosterTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(playerTeam.roster[0]?.id || '');
  
  // Custom view toggle: 'profile' (Screenshot 1) vs 'training' (Screenshot 2)
  const [panelViewMode, setPanelViewMode] = useState<'profile' | 'training'>('profile');
  
  const [trainingFoci, setTrainingFoci] = useState<{ [pId: string]: string }>({
    [playerTeam.roster[0]?.id]: 'Laning Phase'
  });

  const allPlayers = [...playerTeam.roster, ...playerTeam.substitutes];
  const activePlayer = allPlayers.find(p => p.id === selectedPlayerId) || allPlayers[0];

  const handleSelectFocus = (pId: string, focus: string) => {
    setTrainingFoci(prev => ({ ...prev, [pId]: focus }));
    onSelectPlayerTraining(pId, focus);
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

  return (
    <div className="space-y-6 select-none font-sans bg-[#f5f7fa]">
      
      {/* Top Banner layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-black tracking-wide text-slate-800 uppercase flex items-center gap-2">
              TEAM ROSTER <span className="text-slate-300 font-medium text-xs">|</span> <span className="text-blue-500 font-mono text-sm tracking-widest">BUDGET: {formatMoney(playerTeam.budget)}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium font-sans">
              Gerencie seus titulares do split, treine atributos mecânicos e ajuste cláusulas de rescisão.
            </p>
          </div>
        </div>

        {/* Panel toggler to choose Screenshot 1 (Profile & Contract) vs Screenshot 2 (Detailed Training Core) */}
        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200/60 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setPanelViewMode('profile')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              panelViewMode === 'profile'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> PERFIL & CONTRATO
          </button>
          <button
            onClick={() => setPanelViewMode('training')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              panelViewMode === 'training'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> DASHBOARD DE TREINO
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
                <h3 className="font-display text-slate-800 text-sm font-extrabold uppercase tracking-wider leading-none">
                  Active Starters
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Main League Composition</p>
              </div>
              <span className="bg-blue-50/70 text-blue-600 border border-blue-100 px-3 py-1 font-mono text-[9px] rounded-md uppercase tracking-wider font-extrabold select-none">
                SUMMER SPLIT 2024
              </span>
            </div>

            {/* Players list Table - Light Sleek Mode (Screenshot 1) */}
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-slate-50/60 border-b border-slate-200/80 text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider select-none">
                <div className="col-span-2">Pos</div>
                <div className="col-span-5">Player ID</div>
                <div className="col-span-3 text-center">Rating</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              <div className="divide-y divide-slate-100">
                {playerTeam.roster.map((player) => {
                  const isSelected = player.id === selectedPlayerId;
                  const hasPatchBuff = gameState.currentPatch.buffedChampions.some(cid => player.championPool.includes(cid));
                  return (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`grid grid-cols-12 gap-2 items-center p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50/25 border-l-4 border-blue-500' 
                          : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Pos label with bright blue outline */}
                      <div className="col-span-2 select-none">
                        <span className="font-mono text-[10px] font-black px-2.5 py-1 bg-white border border-slate-200 rounded text-sky-600 tracking-wider">
                          {player.position}
                        </span>
                      </div>

                      {/* Photo + Identity */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          <img 
                            src={player.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100'} 
                            referrerPolicy="no-referrer"
                            alt="player" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-display text-xs font-bold text-slate-800 leading-none">{player.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{player.realName}</p>
                        </div>
                      </div>

                      {/* Rating (Big deep bold) */}
                      <div className="col-span-3 text-center">
                        <span className="font-display text-base font-black text-slate-700">{player.overallRating}</span>
                      </div>

                      {/* Status indicator dot matching Screen 1 */}
                      <div className="col-span-2 text-right flex justify-end items-center gap-2 pr-2">
                        {hasPatchBuff && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Meta Match Buff" />
                        )}
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Substitutes & Reserves panels styled as dotted blocks (Screenshot 1 bottom) */}
            <div className="space-y-3">
              <h4 className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                SUBSTITUTES & RESERVES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playerTeam.substitutes.length > 0 ? (
                  playerTeam.substitutes.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedPlayerId(sub.id)}
                      className={`bg-slate-50/50 hover:bg-slate-50 border-2 border-dashed p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        sub.id === selectedPlayerId ? 'border-blue-500' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 shrink-0">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-display text-xs font-bold text-slate-700 leading-none">{sub.name} (Sub)</h5>
                          <p className="text-[9px] text-slate-400 font-mono font-bold tracking-wider mt-0.5">
                            OVR: {sub.overallRating} • {sub.position}
                          </p>
                        </div>
                      </div>
                      <span className="text-[15px] font-mono text-slate-300 font-bold">=</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-inner">+</div>
                        <span>Aegis (Sub) | OVR: 82 • Jungle</span>
                      </div>
                      <span className="text-slate-300">=</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-inner">+</div>
                        <span>Echo (Sub) | OVR: 79 • Mid</span>
                      </div>
                      <span className="text-slate-300">=</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Player Profile details + Contract renew card (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {activePlayer ? (
              <div className="space-y-6">
                
                {/* Active Starter Details Card */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                  <div className="p-6">
                    
                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={activePlayer.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'} 
                            referrerPolicy="no-referrer"
                            alt="active_player" 
                            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-100 shadow-sm" 
                          />
                          <span className="absolute -bottom-2 -right-1 bg-slate-800 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                            {activePlayer.position}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-slate-800 leading-none">{activePlayer.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wide">
                            Lee Sang-hyuk
                          </p>
                          <div className="flex gap-1.5 mt-2 select-none">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-mono font-black rounded uppercase">
                              VETERAN
                            </span>
                            <span className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[8px] font-mono font-black rounded uppercase">
                              WORLD CHAMPION
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-slate-800 text-4xl font-extrabold leading-none">{activePlayer.overallRating}</div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">OVERALL</p>
                      </div>
                    </div>

                    {/* Interactive SVG Radar Spider Chart in Screen 1 style (Light Mode Grid) */}
                    <div className="flex justify-center py-6 bg-slate-50/50 border border-slate-100 rounded-xl mb-6 relative">
                      <div className="relative w-[180px] h-[180px]">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Grid hexagons backgrounds */}
                          <polygon points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                          <polygon points="50 20, 77 35, 77 65, 50 80, 23 65, 23 35" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="1.5" />
                          <polygon points="50 35, 64 42.5, 64 57.5, 50 65, 36 57.5, 36 42.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                          
                          {/* Grid axes */}
                          <line x1="50" y1="50" x2="50" y2="5" stroke="#edf2f7" strokeWidth="0.8" />
                          <line x1="50" y1="50" x2="89" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                          <line x1="50" y1="50" x2="89" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                          <line x1="50" y1="50" x2="50" y2="95" stroke="#edf2f7" strokeWidth="0.8" />
                          <line x1="50" y1="50" x2="11" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                          <line x1="50" y1="50" x2="11" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                          
                          {/* Selected Attribute Polygon */}
                          <polygon 
                            points={calculateRadarPoints(activePlayer)}
                            fill="rgba(56, 189, 248, 0.15)"
                            stroke="#0284c7"
                            strokeWidth="1.8"
                          />
                        </svg>

                        {/* Outer labels */}
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">Mechanics</span>
                        <span className="absolute top-[28%] -right-7 text-[8px] font-bold uppercase text-slate-400 font-mono">Macro</span>
                        <span className="absolute bottom-[28%] -right-7 text-[8px] font-bold uppercase text-slate-400 font-mono">Comms</span>
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-slate-400 font-mono">CHAMPION POOL</span>
                        <span className="absolute bottom-[28%] -left-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Consistency</span>
                        <span className="absolute top-[28%] -left-8 text-[8px] font-bold uppercase text-slate-400 font-mono">Control</span>
                      </div>
                    </div>

                    {/* Bottom stats parameters matching Screenshot 1 */}
                    <div className="grid grid-cols-3 gap-2.5 pb-2 border-b border-slate-100">
                      <div className="bg-slate-50/40 p-3 rounded-lg text-center border border-slate-200/50">
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold font-mono">CS/MIN</p>
                        <p className="font-display text-[#0ea5e9] text-sm font-black mt-0.5">9.4</p>
                      </div>
                      <div className="bg-slate-50/40 p-3 rounded-lg text-center border border-slate-200/50">
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold font-mono">KDA</p>
                        <p className="font-display text-[#0ea5e9] text-sm font-black mt-0.5">4.2</p>
                      </div>
                      <div className="bg-slate-50/40 p-3 rounded-lg text-center border border-slate-200/50">
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold font-mono">WIN %</p>
                        <p className="font-display text-[#0ea5e9] text-sm font-black mt-0.5">68%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Details Card (Screenshot 1) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-slate-700" />
                      <h5 className="font-display text-xs font-extrabold uppercase tracking-wide text-slate-800">
                        Contract Details
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono bg-sky-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                      EXPIRES 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-black font-mono">BASE SALARY</p>
                      <p className="font-display text-xs font-bold text-slate-800 mt-1">$450K / Split</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-black font-mono">DURATION</p>
                      <p className="font-display text-xs font-bold text-slate-800 mt-1">24 Months Left</p>
                    </div>
                  </div>

                  {/* Renew Action buttons in Screenshot 1 custom palette */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => onRenewContract(activePlayer.name)}
                      className="w-full bg-[#006e80] hover:bg-[#005a69] text-white text-[10px] font-extrabold py-3.5 uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm text-center"
                    >
                      RENEW CONTRACT
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => alert("Scouting candidates initiated...")}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[9px] font-bold py-2 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" /> SCOUT REPLACEMENT
                      </button>
                      <button
                        onClick={() => onTransferListPlayer(activePlayer)}
                        className="bg-[#ffebeb] border border-pink-100 hover:bg-pink-100/50 text-pink-600 text-[9px] font-bold py-2 px-3 uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> TRANSFER LIST
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match History Trend (Screenshot 1 bottom right) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <h5 className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                        Match History Trend
                      </h5>
                    </div>
                  </div>

                  {/* Simulated vertical match bars */}
                  <div className="flex items-end justify-between h-14 pb-2 border-b border-slate-100">
                    <div className="w-12 bg-emerald-100/70 border-t-2 border-emerald-500 h-10 rounded-sm" />
                    <div className="w-12 bg-emerald-100/70 border-t-2 border-emerald-500 h-11 rounded-sm" />
                    <div className="w-12 bg-pink-100/70 border-t-2 border-pink-500 h-6 rounded-sm" />
                    <div className="w-12 bg-slate-100 h-2 rounded-sm" />
                    <div className="w-12 bg-emerald-100/70 border-t-2 border-emerald-500 h-8 rounded-sm" />
                    <div className="w-12 bg-teal-100/70 border-t-2 border-teal-500 h-7 rounded-sm" />
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    <span>Past 5 Matches</span>
                    <span className="text-teal-600 animate-pulse">CURRENT: IN-MATCH</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center text-xs py-10 uppercase tracking-widest bg-white border border-slate-200 rounded-xl">
                Selecione um jogador para examinar os atributos detalhados
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SCREEN 2 ROUTING: Viper_Core Training Dashboard (Detailed training screens + week log schedules) */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div>
              <h2 className="font-display text-base font-black text-slate-800 uppercase leading-none">
                {activePlayer.name}_Core Training Dashboard
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">
                Lead {activePlayer.position} • 98th Percentile Mechanics & Strategic Depth
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Histórico de sessões exportado com sucesso para a diretoria!")}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-mono text-[9px] font-extrabold px-3.5 py-2 rounded uppercase tracking-wider cursor-pointer shadow-sm"
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
              <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm">
                <div className="flex justify-between items-center mb-4.5 border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Core Performance Metrics</span>
                  <span className="text-[8px] font-bold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded tracking-wide">LIVE FEED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center bg-slate-50/40 p-4 border border-slate-100 rounded-xl">
                    <div className="relative w-[150px] h-[150px]">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <polygon points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                        <polygon points="50 20, 77 35, 77 65, 50 80, 23 65, 23 35" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="1.5" />
                        
                        <line x1="50" y1="50" x2="50" y2="5" stroke="#edf2f7" strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="89" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="89" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="50" y2="95" stroke="#edf2f7" strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="11" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                        <line x1="50" y1="50" x2="11" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                        
                        <polygon 
                          points={calculateRadarPoints(activePlayer, 15)}
                          fill="rgba(14, 165, 233, 0.15)"
                          stroke="#0ea5e9"
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
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.mechanics}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>STRATEGIC DEPTH</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.macro}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.macro}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wide font-mono mb-1">
                        <span>COMMUNICATION</span>
                        <span className="text-blue-500 font-extrabold">{activePlayer.attributes.communication}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${activePlayer.attributes.communication}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Areas Selection box (Screenshot 2 middle) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm space-y-4">
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
                            ? 'border-blue-500 bg-blue-50/30 text-blue-600 shadow-[0_1px_4px_rgba(59,130,246,0.06)]' 
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
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
              <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm space-y-4.5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Weekly Training Grid</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 gap-1.5 text-[8.5px] font-mono tracking-wider font-bold text-slate-400 uppercase select-none">
                    <div className="col-span-2">Day</div>
                    <div className="col-span-6">Session</div>
                    <div className="col-span-4 text-right">Status</div>
                  </div>

                  <div className="divide-y divide-slate-100 font-mono text-[10px] space-y-2.5 pt-1">
                    <div className="grid grid-cols-12 items-center text-slate-600 pt-2 first:pt-0">
                      <div className="col-span-2 text-slate-400 font-bold">MON</div>
                      <div className="col-span-6 font-bold text-slate-800">VOD Review</div>
                      <div className="col-span-4 text-right">
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">COMPLETED</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center text-slate-600 pt-2">
                      <div className="col-span-2 text-blue-500 font-black">TUE</div>
                      <div className="col-span-6 font-bold text-slate-800">1v1 Drills</div>
                      <div className="col-span-4 text-right">
                        <span className="text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">IN PROGRESS</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center text-slate-600 pt-2">
                      <div className="col-span-2 text-slate-400 font-bold">WED</div>
                      <div className="col-span-6 font-bold text-slate-800">Team Scrims</div>
                      <div className="col-span-4 text-right text-slate-500 font-bold">14:00 GMT</div>
                    </div>

                    <div className="grid grid-cols-12 items-center text-slate-600 pt-2">
                      <div className="col-span-2 text-slate-400 font-bold">THU</div>
                      <div className="col-span-6 font-bold text-slate-800">Draft Sim</div>
                      <div className="col-span-4 text-right text-slate-500 font-bold">09:00 GMT</div>
                    </div>

                    <div className="grid grid-cols-12 items-center text-slate-600 pt-2">
                      <div className="col-span-2 text-slate-400 font-bold">FRI</div>
                      <div className="col-span-6 font-bold text-slate-800">Mental Coach</div>
                      <div className="col-span-4 text-right text-slate-500 font-bold">11:30 GMT</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academy growth card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                  <Laptop className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACADEMY GROWTH</p>
                  <p className="text-[10.5px] font-sans font-medium text-slate-500 leading-tight mt-0.5">
                    Seu percurso tático do Rookie ao Pro Tier.
                  </p>
                  <div className="flex items-center gap-3.5 mt-2.5">
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '72%' }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 shrink-0">Level 18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Recent Session Analytics (Screenshot 2 bottom row table) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10.5px] uppercase font-extrabold text-slate-800 tracking-wider">RECENT SESSION ANALYTICS</span>
              <div className="flex gap-2">
                <button className="p-1 px-2.5 text-[9px] font-mono font-bold text-slate-400 border border-slate-200 rounded uppercase">Filters</button>
                <button className="p-1 px-2.5 text-[9px] font-mono font-bold text-slate-400 border border-slate-200 rounded uppercase">Share</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-mono text-[9px] font-extrabold text-slate-400 uppercase bg-slate-50/30 select-none">
                    <th className="p-4 pl-6">DATE</th>
                    <th className="p-4">ACTIVITY</th>
                    <th className="p-4 text-center">PERFORMANCE</th>
                    <th className="p-4 text-center">CONSISTENCY</th>
                    <th className="p-4 text-center">OUTCOME</th>
                    <th className="p-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 24, 2023</td>
                    <td className="p-4 font-semibold text-slate-800">
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
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-extrabold rounded-full uppercase tracking-wide">VICTORY</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 23, 2023</td>
                    <td className="p-4 font-semibold text-slate-800">
                      Mechanics Drill #04 <span className="text-slate-400 text-[10.5px] font-normal">Solo Queue Practice</span>
                    </td>
                    <td className="p-4 text-center font-display text-sky-600 font-black text-sm">A</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-extrabold rounded-full uppercase tracking-wide">STABLE</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-300 font-bold">—</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 pl-6 text-slate-400 font-medium font-mono">Oct 22, 2023</td>
                    <td className="p-4 font-semibold text-slate-800">
                      Strategy Workshop <span className="text-slate-400 text-[10.5px] font-normal">with Coach K.</span>
                    </td>
                    <td className="p-4 text-center font-display text-slate-500 font-black text-sm">B-</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 bg-pink-50 text-pink-600 text-[9px] font-extrabold rounded-full uppercase tracking-wide">RE-FOCUS</span>
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

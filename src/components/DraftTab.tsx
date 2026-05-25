/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, Shield, Award, Sparkles, ChevronRight, Ban, Check, UserPlus } from 'lucide-react';
import { GameState, Team, Champion, Position, PickBan } from '../types';
import { CHAMPIONS_LIST } from '../data/initialDatabase';
import { analyzeComposition } from '../utils/matchSimulator';

interface DraftTabProps {
  gameState: GameState;
  onConfirmDraft: (
    bluePicks: { [key in Position]?: string },
    redPicks: { [key in Position]?: string },
    pickBans: PickBan[]
  ) => void;
  onBackToHub: () => void;
  theme?: 'light' | 'dark';
}

const getChampAvatar = (champId: string, seed: number) => {
  const images = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=120", // blue gaming
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=120", // red/black neon
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=120", // purple setup
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=120", // yellow lighting
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=120", // cyber workspace
    "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=120", // professional game
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=120", // game pad
    "https://images.unsplash.com/photo-1548685913-fe6574ab8d14?auto=format&fit=crop&q=80&w=120", // gamer
  ];
  return images[seed % images.length];
};

export default function DraftTab({
  gameState,
  onConfirmDraft,
  onBackToHub,
  theme = 'dark'
}: DraftTabProps) {
  const isDark = theme === 'dark';
  const { currentPatch, playerTeamId, teams, week, champions } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;
  const championsToUse = champions && champions.length > 0 ? champions : CHAMPIONS_LIST;

  // Next Opponent Setup
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

  // Steps
  const draftSteps = [
    'BAN_B1', 'BAN_R1', 'BAN_B2', 'BAN_R2',
    'PICK_TOP_B', 'PICK_TOP_R',
    'PICK_JNG_B', 'PICK_JNG_R',
    'PICK_MID_B', 'PICK_MID_R',
    'PICK_ADC_B', 'PICK_ADC_R',
    'PICK_SUP_B', 'PICK_SUP_R',
    'DRAFT_DONE'
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bans, setBans] = useState<string[]>([]);
  const [bluePicks, setBluePicks] = useState<{ [key in Position]?: string }>({});
  const [redPicks, setRedPicks] = useState<{ [key in Position]?: string }>({});
  const [pickBansList, setPickBansList] = useState<PickBan[]>([]);
  const [focusedChampId, setFocusedChampId] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<Position | 'ALL'>('ALL');

  const currentStep = draftSteps[currentStepIndex] || 'DRAFT_DONE';

  // Calculations
  const blueAnalysis = analyzeComposition(bluePicks, isPlayerBlue ? playerTeam : opponentTeamObj, currentPatch.buffedChampions, currentPatch.nerfedChampions);
  const redAnalysis = analyzeComposition(redPicks, isPlayerBlue ? opponentTeamObj : playerTeam, currentPatch.buffedChampions, currentPatch.nerfedChampions);

  // Auto Bot draft step loop
  useEffect(() => {
    if (currentStep === 'DRAFT_DONE') return;

    const isBotTurn = 
      (currentStep.endsWith('R') && isPlayerBlue) || 
      (currentStep.endsWith('B') && !isPlayerBlue) ||
      (currentStep === 'BAN_R1' && isPlayerBlue) ||
      (currentStep === 'BAN_R2' && isPlayerBlue) ||
      (currentStep === 'BAN_B1' && !isPlayerBlue) ||
      (currentStep === 'BAN_B2' && !isPlayerBlue);

    if (isBotTurn) {
      const timer = setTimeout(() => {
        executeBotTurn();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  const executeBotTurn = () => {
    const unavailable = [...bans, ...Object.values(bluePicks), ...Object.values(redPicks)].filter(Boolean) as string[];
    const candidates = championsToUse.filter(c => !unavailable.includes(c.id));

    if (currentStep.startsWith('BAN')) {
      const sorted = [...candidates].sort((a, b) => b.power - a.power);
      const chosenBan = sorted[0]?.id || candidates[0]?.id;
      if (chosenBan) {
        setBans(p => [...p, chosenBan]);
        setPickBansList(p => [...p, { id: generateId(), championId: chosenBan, isBan: true, teamId: currentStep.endsWith('B') ? 'BLUE' : 'RED', position: 'TOP' }]);
        setCurrentStepIndex(i => i + 1);
      }
    } else {
      const posExtract = currentStep.split('_')[1] as Position;
      const validRoleChamps = candidates.filter(c => c.roles.includes(posExtract));
      const chosenPick = validRoleChamps[0]?.id || candidates[0]?.id;
      
      if (chosenPick) {
        if (currentStep.endsWith('B')) {
          setBluePicks(p => ({ ...p, [posExtract]: chosenPick }));
          setPickBansList(p => [...p, { id: generateId(), championId: chosenPick, isBan: false, teamId: 'BLUE', position: posExtract }]);
        } else {
          setRedPicks(p => ({ ...p, [posExtract]: chosenPick }));
          setPickBansList(p => [...p, { id: generateId(), championId: chosenPick, isBan: false, teamId: 'RED', position: posExtract }]);
        }
        setCurrentStepIndex(i => i + 1);
      }
    }
  };

  const handleSelectChampion = (champId: string) => {
    const unavailable = [...bans, ...Object.values(bluePicks), ...Object.values(redPicks)];
    if (unavailable.includes(champId)) return;

    if (currentStep.startsWith('BAN')) {
      setBans(p => [...p, champId]);
      setPickBansList(p => [...p, { id: generateId(), championId: champId, isBan: true, teamId: currentStep.endsWith('B') ? 'BLUE' : 'RED', position: 'TOP' }]);
      setCurrentStepIndex(i => i + 1);
    } else {
      const posExtract = currentStep.split('_')[1] as Position;
      if (currentStep.endsWith('B')) {
        setBluePicks(p => ({ ...p, [posExtract]: champId }));
        setPickBansList(p => [...p, { id: generateId(), championId: champId, isBan: false, teamId: 'BLUE', position: posExtract }]);
      } else {
        setRedPicks(p => ({ ...p, [posExtract]: champId }));
        setPickBansList(p => [...p, { id: generateId(), championId: champId, isBan: false, teamId: 'RED', position: posExtract }]);
      }
      setCurrentStepIndex(i => i + 1);
    }
  };

  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  const activePositionTarget = currentStep.startsWith('PICK') ? currentStep.split('_')[1] as Position : null;

  // Split bans
  const blueBans = bans.filter((_, idx) => idx % 2 === 0);
  const redBans = bans.filter((_, idx) => idx % 2 === 1);

  const getBannedChampName = (cId: string | null) => {
    if (!cId) return null;
    const c = championsToUse.find(x => x.id === cId);
    return c ? c.name : null;
  };

  // Dynamic analysis text
  const getAICounterCommentary = (focusedId: string) => {
    const ch = championsToUse.find(c => c.id === focusedId);
    if (!ch) return "Selecione um campeão para ver a análise estratégica da IA.";
    const countersList = ch.counters.map(c => c.toUpperCase()).join(', ');
    const synergyList = ch.synergies.map(s => s.toUpperCase()).join(', ');
    return `EXPLICAÇÃO SENSÍVEL DE LOCK-IN COM ${ch.name.toUpperCase()}: É forte nas lutas, tendo counters recomendados como: ${countersList}. Possui forte sinergia com ${synergyList}. Playstyle ideal: ${ch.idealPlaystyle}`;
  };

  // AICounters sidebar
  const getAICountersList = (focusedId: string | null) => {
    const defaultRecs = [
      { champion: "Ezreal", role: "Jinx Counter", desc: "Meos monnvester pareielign ses counter assode matchups." },
      { champion: "Graves", role: "Lee Sin Counter", desc: "Idos Counter, oecepeto de teameleretes matchups." },
      { champion: "Ezreal", role: "Jinx Counter", desc: "Jins counter, sooxxt atrengico." },
      { champion: "Ezreal", role: "Jinx Counter", desc: "Sone ceuniers, oeoepete mella poasitsen." }
    ];
    if (!focusedId) return defaultRecs;
    const ch = championsToUse.find(c => c.id === focusedId);
    if (!ch) return defaultRecs;
    
    // Create custom
    return [
      { champion: ch.counters[0] ? ch.counters[0].toUpperCase() : 'EZREAL', role: `${ch.name} Counter`, desc: `Excelente matchup recomendado para conter a presença e mitigação de ${ch.name} no game.` },
      { champion: ch.synergies[0] ? ch.synergies[0].toUpperCase() : 'GRAVES', role: `${ch.name} Sinergy`, desc: `Parceiro de rota ou selva perfeito que maximiza a agressividade nas skirmishes táticas.` },
      ...defaultRecs.slice(2)
    ];
  };

  const currentOpBanName = bans.length > 0 ? getBannedChampName(bans[bans.length - 1]) : "LEE SIN";

  return (
    <div className={`min-h-screen py-8 px-6 font-sans select-none relative transition-colors duration-300 ${
      isDark ? 'bg-[#070d19] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Upper header */}
      <div className={`flex justify-between items-center border p-4 rounded-xl mb-6 shadow-sm ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className="text-[10px] text-[#00d2fd] uppercase font-black tracking-widest block mb-0.5">ESTÁGIO DRAFT-DECK HUD</span>
          <h2 className={`font-display text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {playerTeam.acronym} VS {opponentTeamObj.acronym}
          </h2>
        </div>
        <div className="text-center font-black px-4 py-1.5 bg-rose-600/10 border border-rose-500/20 rounded flex items-center gap-1.5 text-xs text-rose-500 animate-pulse">
          <Ban className="w-4 h-4" />
          FASE DE PICKS & BANS ACTIVES
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* 1. Lado Azul Picks (Span 3) */}
        <div className={`lg:col-span-3 rounded-xl p-4 flex flex-col justify-between h-[550px] border shadow-sm ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className={`border-b pb-2 mb-4 ${isDark ? 'border-blue-500/20' : 'border-slate-200'}`}>
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-[#00d2fd]">EQUIPE AZUL (BLUE SIDE)</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-black">
                {isPlayerBlue ? 'Sua Organização' : 'Oponente'}
              </p>
            </div>

            <div className="space-y-2.5">
              {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                const champId = bluePicks[pos];
                const activeChamp = championsToUse.find(c => c.id === champId);
                const isPickingNow = currentStep === `PICK_${pos}_B`;
                
                return (
                  <div key={pos} className={`border rounded-xl p-3 flex items-center justify-between transition-all ${
                    isPickingNow 
                      ? 'border-[#00d2fd] bg-[#00d2fd]/5 ring-2 ring-[#00d2fd]/30' 
                      : isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="font-display text-[9px] font-black px-1.5 py-0.5 bg-blue-600 text-white rounded uppercase mr-2">{pos}</span>
                      <strong className={`text-xs uppercase tracking-widest font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {activeChamp ? activeChamp.name : isPickingNow ? 'Escolhendo...' : 'Aguardando'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-3 text-xs border ${isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 font-bold text-[10px]">Poder de Composição:</span>
              <strong className="text-[#00d2fd] font-black">{blueAnalysis.draftPower}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold text-[10px]">Sinergia Geral:</span>
              <strong className="text-emerald-500 font-black">{blueAnalysis.synergyLevel}%</strong>
            </div>
          </div>
        </div>

        {/* 2. Central Draft Simulator Board Area (Span 6) */}
        <div className={`lg:col-span-6 rounded-xl p-5 h-[550px] flex flex-col justify-between border shadow-sm ${
          isDark ? 'bg-[#0A0E17] border-[#1e2d44]' : 'bg-white border-slate-200'
        }`}>
          <div>
            {/* Top of the block: Circular ban slots inside two rows */}
            <div className={`border-b pb-4 mb-4 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
              <div className="flex justify-between items-center gap-3">
                {/* Lado Azul Bans */}
                <div className="flex gap-1.5 items-center">
                  <span className="text-[9px] font-black text-blue-400 mr-1 uppercase">AZUL:</span>
                  {[0, 1, 2].map(idx => {
                    const bId = blueBans[idx];
                    return (
                      <div key={idx} className="relative w-8 h-8 rounded-full border border-red-500 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                        {bId ? (
                          <>
                            <img src={getChampAvatar(bId, idx)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-1 bg-red-600 rotate-45 transform" />
                            </div>
                          </>
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-gray-500/50" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Central Banned text banner */}
                <div className="px-3 py-1 bg-red-600/15 border border-red-500/20 rounded-md text-center max-w-[200px]">
                  <span className="text-[9.5px] font-black tracking-widest text-red-500 block uppercase">
                    OPONENTE BANIOU {currentOpBanName?.toUpperCase() || 'LEE SIN'}
                  </span>
                </div>

                {/* Lado Vermelho Bans */}
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(idx => {
                    const bId = redBans[idx];
                    return (
                      <div key={idx} className="relative w-8 h-8 rounded-full border border-red-500 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                        {bId ? (
                          <>
                            <img src={getChampAvatar(bId, idx + 4)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-1 bg-red-600 rotate-45 transform" />
                            </div>
                          </>
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-gray-500/50" />
                        )}
                      </div>
                    );
                  })}
                  <span className="text-[9px] font-black text-red-400 ml-1 uppercase">VERM:</span>
                </div>
              </div>
            </div>

            {/* AI Analysis matches tooltip */}
            {focusedChampId && (
              <div className={`mb-3 p-3 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-black text-slate-100 border-cyan-500/80 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                  : 'bg-blue-50 text-slate-900 border-blue-200'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-rose-500">EXPLAIN COMMETA MATCHUPS</span>
                </div>
                <p className="text-[10.5px] leading-relaxed font-semibold">
                  {getAICounterCommentary(focusedChampId)}
                </p>
              </div>
            )}

            {/* Filters */}
            {currentStep !== 'DRAFT_DONE' && (
              <div className="flex gap-1 mb-3 justify-center">
                {(['ALL', 'TOP', 'JNG', 'MID', 'ADC', 'SUP'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRouteFilter(role)}
                    className={`px-2 py-1 text-[9px] font-black uppercase rounded border transition-all ${
                      routeFilter === role 
                        ? 'bg-[#00d2fd] text-black border-[#00d2fd]' 
                        : isDark ? 'bg-[#070d19] border-[#1e2d44] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            {/* Centro: Grid de Seleção em formato quadrado com cantos ligeramente arredondados */}
            {currentStep !== 'DRAFT_DONE' ? (
              <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {championsToUse
                  .filter(c => routeFilter === 'ALL' || c.roles.includes(routeFilter as Position))
                  .map(champ => {
                    const isBanned = bans.includes(champ.id);
                    const isSelected = Object.values(bluePicks).includes(champ.id) || Object.values(redPicks).includes(champ.id);
                    const isAvailable = !isBanned && !isSelected;
                    const matchesRole = activePositionTarget && champ.roles.includes(activePositionTarget);
                    
                    const isFocused = focusedChampId === champ.id;
                    const isBuffed = currentPatch.buffedChampions.includes(champ.id);
                    const isNerfed = currentPatch.nerfedChampions.includes(champ.id);

                    return (
                      <button
                        key={champ.id}
                        onMouseEnter={() => setFocusedChampId(champ.id)}
                        onMouseLeave={() => setFocusedChampId(null)}
                        onClick={() => isAvailable && handleSelectChampion(champ.id)}
                        disabled={!isAvailable}
                        className={`aspect-square p-2 rounded-xl border flex flex-col items-center justify-between relative transition-all duration-200 overflow-hidden ${
                          isAvailable 
                            ? isFocused 
                              ? 'border-[#00d2fd] bg-[#00d2fd]/10 scale-105 shadow-[0_0_12px_rgba(0,210,253,0.8)] focus:ring-2 focus:ring-[#00d2fd]' 
                              : matchesRole 
                                ? 'border-amber-500/50 bg-amber-500/5 cursor-pointer' 
                                : isDark ? 'border-[#1e2d44] bg-[#070d19] hover:border-gray-600' : 'border-slate-200 bg-slate-50 hover:border-slate-400'
                            : 'bg-gray-800/20 border-transparent text-gray-600 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <img 
                          src={getChampAvatar(champ.id, champ.imageSeed)} 
                          alt={champ.name} 
                          className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-40 transition-opacity"
                        />
                        <span className="font-display text-[10px] font-black uppercase tracking-wide text-center truncate w-full z-10">{champ.name}</span>
                        
                        <div className="flex items-center gap-1 select-none z-10">
                          {isBuffed && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Buffed Patch" />}
                          {isNerfed && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Nerfed Patch" />}
                          <span className="text-[9px] font-black text-gray-400">{champ.power}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col justify-center items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-base font-black uppercase text-emerald-400">LINEUP TRAVADO COM SUCESSO!</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                    Composição técnica finalizada e assinada pela diretoria. Pronto para marchar para Summoner's Rift!
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={onBackToHub}
                    className={`tracking-widest font-black py-2.5 px-5 rounded-lg text-[10px] uppercase border ${
                      isDark ? 'border-[#1e2d44] hover:bg-white/5 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    VOLTAR AO HUB
                  </button>
                  <button
                    onClick={() => onConfirmDraft(bluePicks, redPicks, pickBansList)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display text-[10px] font-black py-2.5 px-5 rounded-lg uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    ENTRAR EM WRift <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentStep !== 'DRAFT_DONE' && (
            <div className={`text-[9px] font-bold uppercase tracking-wider text-center pt-2 border-t ${isDark ? 'border-[#1e2d44] text-gray-500' : 'border-slate-200 text-slate-400'}`}>
              📌 Hover os campeões para acionar a explicação de Matchups e consultar recomendações!
            </div>
          )}
        </div>

        {/* 3. Lateral Direita (AI Recommendations Panel) (Span 3) */}
        <div className="lg:col-span-3 h-[550px] flex flex-col justify-between">
          <div className={`rounded-xl p-4 border flex flex-col h-full shadow-sm ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="border-b pb-2 mb-3">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-cyan-400">RECOMENDAÇÕES DE IA</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-semibold">Táticas Ativas</p>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {getAICountersList(focusedChampId).map((rec, idx) => (
                <div key={idx} className={`p-3 rounded-xl border transition-all hover:scale-102 ${
                  isDark ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">AI COUNTER</span>
                    <span className={`text-[8px] font-bold px-1 rounded uppercase ${isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-600'}`}>{rec.role}</span>
                  </div>
                  <h5 className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>{rec.champion}</h5>
                  <p className="text-[9.5px] font-semibold text-gray-400 mt-1 leading-snug line-clamp-2">
                    {rec.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className={`mt-3 p-2.5 border rounded-lg text-center ${isDark ? 'border-[#1e2d44]/50' : 'border-slate-200'}`}>
              <span className={`text-[9px] font-black block uppercase ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>COMISSÃO TÉCNICA LIVE:</span>
              <p className="text-[8.5px] text-gray-400 font-semibold mt-0.5">Clique em qualquer campeão da grid para travar o pick!</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

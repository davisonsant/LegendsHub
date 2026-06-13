/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, Shield, Award, Sparkles, ChevronRight, Ban, Check } from 'lucide-react';
import { GameState, Team, Champion, Position, PickBan } from '../types';
import { CHAMPIONS_LIST } from '../data/initialDatabase';
import { analyzeComposition } from '../utils/matchSimulator';
import { getGameAssetUrl, getImageUrl } from '../utils/gameAssets';

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
  const customUrl = getGameAssetUrl('champions', champId);
  if (customUrl && customUrl !== '/perfil-default.jpeg' && customUrl !== '/assets/ui/fallback-silhouette.png' && !customUrl.endsWith('fallback-silhouette.png')) {
    return customUrl;
  }
  let customChamps: any[] = [];
  try {
    const saved = localStorage.getItem('legendshub_custom_champions');
    if (saved) {
      customChamps = JSON.parse(saved);
    }
  } catch (e) {}

  const champ = customChamps.find((c: any) => c.id === champId) || CHAMPIONS_LIST.find((c: any) => c.id === champId);
  if (champ) {
    if (champ.image_blob) {
      return getImageUrl(champ.image_blob);
    }
    if (champ.imageUrl) return champ.imageUrl;
    const ideal = champ.idealPlaystyle;
    const anyIdeal = ideal && (ideal.startsWith('http') || ideal.startsWith('data:image') || ideal.includes('.'));
    if (anyIdeal) return ideal;
  }

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
  // 10 bans and 10 picks
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
    'PICK_SUP_B', 'PICK_SUP_R',
    'DRAFT_DONE'
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);
  const [bluePicks, setBluePicks] = useState<{ [key in Position]?: string }>({});
  const [redPicks, setRedPicks] = useState<{ [key in Position]?: string }>({});
  const [pickBansList, setPickBansList] = useState<PickBan[]>([]);
  const [routeFilter, setRouteFilter] = useState<Position | 'ALL'>('ALL');

  const currentStep = draftSteps[currentStepIndex] || 'DRAFT_DONE';

  const blueTeamObj = isPlayerBlue ? playerTeam : opponentTeamObj;
  const redTeamObj = isPlayerBlue ? opponentTeamObj : playerTeam;

  // Calculations
  const blueAnalysis = analyzeComposition(bluePicks, blueTeamObj, currentPatch.buffedChampions, currentPatch.nerfedChampions);
  const redAnalysis = analyzeComposition(redPicks, redTeamObj, currentPatch.buffedChampions, currentPatch.nerfedChampions);

  // Auto Bot draft step loop
  useEffect(() => {
    if (currentStep === 'DRAFT_DONE') return;

    const isBlueStep = currentStep.includes('_B');
    const isRedStep = currentStep.includes('_R');

    const isBotTurn = 
      (isBlueStep && !isPlayerBlue) || 
      (isRedStep && isPlayerBlue);

    if (isBotTurn) {
      const timer = setTimeout(() => {
        executeBotTurn();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  const executeBotTurn = () => {
    const bannedChampIds = [...blueBans, ...redBans];
    const unavailable = [...bannedChampIds, ...Object.values(bluePicks), ...Object.values(redPicks)].filter(Boolean) as string[];
    const candidates = championsToUse.filter(c => !unavailable.includes(c.id));

    if (currentStep.startsWith('BAN')) {
      const sorted = [...candidates].sort((a, b) => b.power - a.power);
      const chosenBan = sorted[0]?.id || candidates[0]?.id;
      if (chosenBan) {
        if (currentStep.includes('_B')) {
          setBlueBans(p => [...p, chosenBan]);
        } else {
          setRedBans(p => [...p, chosenBan]);
        }
        setCurrentStepIndex(i => i + 1);
      }
    } else {
      const posExtract = currentStep.split('_')[1] as Position;
      const validRoleChamps = candidates.filter(c => c.roles.includes(posExtract));
      const chosenPick = validRoleChamps[0]?.id || candidates[0]?.id;
      
      if (chosenPick) {
        if (currentStep.endsWith('B')) {
          setBluePicks(p => ({ ...p, [posExtract]: chosenPick }));
        } else {
          setRedPicks(p => ({ ...p, [posExtract]: chosenPick }));
        }
        setCurrentStepIndex(i => i + 1);
      }
    }
  };

  const handleSelectChampion = (champId: string) => {
    const bannedChampIds = [...blueBans, ...redBans];
    const unavailable = [...bannedChampIds, ...Object.values(bluePicks), ...Object.values(redPicks)];
    if (unavailable.includes(champId)) return;

    if (currentStep.startsWith('BAN')) {
      if (currentStep.includes('_B')) {
        setBlueBans(p => [...p, champId]);
      } else {
        setRedBans(p => [...p, champId]);
      }
      setCurrentStepIndex(i => i + 1);
    } else {
      const posExtract = currentStep.split('_')[1] as Position;
      if (currentStep.endsWith('B')) {
        setBluePicks(p => ({ ...p, [posExtract]: champId }));
      } else {
        setRedPicks(p => ({ ...p, [posExtract]: champId }));
      }
      setCurrentStepIndex(i => i + 1);
    }
  };

  const activePositionTarget = currentStep.startsWith('PICK') ? currentStep.split('_')[1] as Position : null;

  const getLastBannedName = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex < 0) return 'NENHUM';
    const prevStep = draftSteps[prevIndex];
    if (prevStep && prevStep.startsWith('BAN')) {
      const isBlue = prevStep.includes('_B');
      const banArr = isBlue ? blueBans : redBans;
      const lastId = banArr[banArr.length - 1];
      if (lastId) {
        return championsToUse.find(c => c.id === lastId)?.name || 'LEE SIN';
      }
    }
    return 'AHRI';
  };

  const currentOpBanName = getLastBannedName();

  return (
    <div className={`min-h-screen py-8 px-6 font-sans select-none relative transition-colors duration-300 ${
      isDark ? 'bg-[#070d19] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Upper header */}
      <div className={`flex justify-between items-center border p-4 rounded-xl mb-6 shadow-sm ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className="text-[10px] text-[#00d2fd] uppercase font-black tracking-widest block mb-0.5 font-mono">ESTÁGIO DRAFT-DECK HUD</span>
          <h2 className={`font-display text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {blueTeamObj.acronym} VS {redTeamObj.acronym}
          </h2>
        </div>
        <div className="text-center font-black px-4 py-1.5 bg-rose-600/10 border border-rose-500/20 rounded flex items-center gap-1.5 text-xs text-rose-500 animate-pulse">
          <Ban className="w-4 h-4" />
          FASE DE PICKS & BANS ATIVA
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* 1. Lado Azul Picks (Span 3) */}
        <div className={`lg:col-span-3 rounded-xl p-4 flex flex-col justify-between h-[560px] border shadow-sm ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className={`border-b pb-2 mb-4 ${isDark ? 'border-sky-500/20' : 'border-slate-200'}`}>
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-sky-400">G2 ESPORTS (BLUE SIDE)</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-black font-mono">
                {isPlayerBlue ? 'Seu Elenco' : 'Oponente'}
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
                      ? 'border-sky-400 bg-sky-400/5 ring-1 ring-sky-400/30' 
                      : isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[9px] font-black px-1.5 py-0.5 bg-sky-600 text-white rounded uppercase mr-2">{pos}</span>
                      <strong className={`text-xs uppercase tracking-widest font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {activeChamp ? activeChamp.name : isPickingNow ? 'Escolhendo...' : 'Aguardando'}
                      </strong>
                    </div>
                    {activeChamp && <img src={getChampAvatar(activeChamp.id, activeChamp.imageSeed)} alt="vtr" className="w-6 h-6 rounded-full object-cover" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-3 text-xs border ${isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 font-bold text-[10px]">Poder de Composição:</span>
              <strong className="text-sky-400 font-black">{blueAnalysis.draftPower}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold text-[10px]">Sinergia Geral:</span>
              <strong className="text-emerald-500 font-black">{blueAnalysis.synergyLevel}%</strong>
            </div>
          </div>
        </div>

        {/* 2. Central Draft Simulator Board Area (Span 6) */}
        <div className={`lg:col-span-6 rounded-xl p-5 h-[560px] flex flex-col justify-between border shadow-sm ${
          isDark ? 'bg-[#0A0E17] border-[#1e2d44]' : 'bg-white border-slate-200'
        }`}>
          <div>
            {/* Top of the block: 10 ban slots (5 each side) separated in Phase 1 & 2 */}
            <div className={`border-b pb-4 mb-4 ${isDark ? 'border-[#1e2d44]' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3">
                
                {/* Lado Azul Bans */}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] font-black text-sky-400 uppercase font-mono">AZUL BANS:</span>
                  <div className="flex gap-1 items-center">
                    {/* Fase 1 (3 bans) */}
                    <div className="flex gap-1 pr-1 border-r border-[#1e2d44]">
                      {[0, 1, 2].map(idx => {
                        const bId = blueBans[idx];
                        return (
                          <div key={idx} className="relative w-6 h-6 rounded border border-red-500/40 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                            {bId ? (
                              <>
                                <img src={getChampAvatar(bId, idx)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-0.5 bg-red-650 rotate-45 transform" />
                                </div>
                              </>
                            ) : (
                              <Ban className="w-2.5 h-2.5 text-gray-500/55" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Fase 2 (2 bans) */}
                    <div className="flex gap-1">
                      {[3, 4].map(idx => {
                        const bId = blueBans[idx];
                        return (
                          <div key={idx} className="relative w-6 h-6 rounded border border-red-500/40 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                            {bId ? (
                              <>
                                <img src={getChampAvatar(bId, idx)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-0.5 bg-red-650 rotate-45 transform" />
                                </div>
                              </>
                            ) : (
                              <Ban className="w-2.5 h-2.5 text-gray-500/55" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Central Notification Box */}
                <div className="px-2.5 py-1 bg-red-600/15 border border-red-500/20 rounded text-center whitespace-nowrap">
                  <span className="text-[9px] font-black tracking-widest text-red-500 block uppercase font-mono">
                    ÚLTIMO BAN: {currentOpBanName?.toUpperCase() || 'LEE SIN'}
                  </span>
                </div>

                {/* Lado Vermelho Bans */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-rose-500 uppercase font-mono">VERMELHO BANS:</span>
                  <div className="flex gap-1 items-center">
                    {/* Fase 1 (3 bans) */}
                    <div className="flex gap-1 pr-1 border-r border-[#1e2d44]">
                      {[0, 1, 2].map(idx => {
                        const bId = redBans[idx];
                        return (
                          <div key={idx} className="relative w-6 h-6 rounded border border-red-500/40 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                            {bId ? (
                              <>
                                <img src={getChampAvatar(bId, idx + 5)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-0.5 bg-red-650 rotate-45 transform" />
                                </div>
                              </>
                            ) : (
                              <Ban className="w-2.5 h-2.5 text-gray-500/55" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Fase 2 (2 bans) */}
                    <div className="flex gap-1">
                      {[3, 4].map(idx => {
                        const bId = redBans[idx];
                        return (
                          <div key={idx} className="relative w-6 h-6 rounded border border-red-500/40 bg-red-500/10 overflow-hidden flex items-center justify-center shrink-0">
                            {bId ? (
                              <>
                                <img src={getChampAvatar(bId, idx + 5)} alt="banned" className="w-full h-full object-cover filter grayscale opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-0.5 bg-red-650 rotate-45 transform" />
                                </div>
                              </>
                            ) : (
                              <Ban className="w-2.5 h-2.5 text-gray-500/55" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Filters */}
            {currentStep !== 'DRAFT_DONE' && (
              <div className="flex gap-1 mb-3.5 justify-center">
                {(['ALL', 'TOP', 'JNG', 'MID', 'ADC', 'SUP'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRouteFilter(role)}
                    className={`px-2.5 py-1 text-[9.5px] font-black uppercase rounded border transition-all ${
                      routeFilter === role 
                        ? 'bg-[#00d2fd] text-black border-[#00d2fd]' 
                        : isDark ? 'bg-[#070d19] border-[#1e2d44] text-gray-400' : 'bg-slate-100 border-slate-205 text-slate-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            {/* Centro: Grid de Seleção Compacto de Imagens Pequenas (small_icon) */}
            {currentStep !== 'DRAFT_DONE' ? (
              <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {championsToUse
                  .filter(c => routeFilter === 'ALL' || c.roles.includes(routeFilter as Position))
                  .map(champ => {
                    const isBanned = blueBans.includes(champ.id) || redBans.includes(champ.id);
                    const isSelected = Object.values(bluePicks).includes(champ.id) || Object.values(redPicks).includes(champ.id);
                    const isAvailable = !isBanned && !isSelected;
                    const matchesRole = activePositionTarget && champ.roles.includes(activePositionTarget);
                    
                    const isBuffed = currentPatch.buffedChampions.includes(champ.id);
                    const isNerfed = currentPatch.nerfedChampions.includes(champ.id);

                    return (
                      <button
                        key={champ.id}
                        onClick={() => isAvailable && handleSelectChampion(champ.id)}
                        disabled={!isAvailable}
                        className={`aspect-square rounded-lg border flex flex-col items-center justify-end p-1 relative transition-all duration-150 overflow-hidden ${
                          isAvailable 
                            ? matchesRole 
                              ? 'border-amber-500 bg-amber-500/5 cursor-pointer scale-98 shadow hover:scale-102 focus:ring-1 focus:ring-amber-400' 
                              : isDark ? 'border-[#1e2d44] bg-[#070d19] hover:border-gray-600 hover:scale-102' : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:scale-102'
                            : 'bg-gray-800/20 border-transparent text-gray-600 cursor-not-allowed opacity-35'
                        }`}
                      >
                        <img 
                          src={getChampAvatar(champ.id, champ.imageSeed)} 
                          alt={champ.name} 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 hover:opacity-50 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                        <span className="font-display text-[8.5px] font-black uppercase tracking-tighter text-center truncate w-full z-20 text-slate-100">
                          {champ.name}
                        </span>
                        
                        <div className="absolute top-1 right-1 flex items-center gap-0.5 z-20">
                          {isBuffed && <span className="w-1 h-1 rounded-full bg-green-500" />}
                          {isNerfed && <span className="w-1 h-1 rounded-full bg-red-500" />}
                          <span className="text-[7.5px] font-bold text-gray-400 bg-black/40 px-0.5 rounded">{champ.power}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col justify-center items-center gap-4">
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
            <div className={`text-[9px] font-bold uppercase tracking-wider text-center pt-2 border-t ${isDark ? 'border-[#1e2d44]' : 'border-slate-205'} text-gray-500`}>
              📌 Trave todas as fases de bans e picks clicando nos retratos destacados!
            </div>
          )}
        </div>

        {/* 3. Lado Vermelho Picks (Span 3) */}
        <div className={`lg:col-span-3 rounded-xl p-4 flex flex-col justify-between h-[560px] border shadow-sm ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className={`border-b pb-2 mb-4 ${isDark ? 'border-red-500/20' : 'border-slate-200'}`}>
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-red-500">SHIFTERS (RED SIDE)</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-black font-mono">
                {!isPlayerBlue ? 'Seu Elenco' : 'Oponente'}
              </p>
            </div>

            <div className="space-y-2.5">
              {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                const champId = redPicks[pos];
                const activeChamp = championsToUse.find(c => c.id === champId);
                const isPickingNow = currentStep === `PICK_${pos}_R`;
                
                return (
                  <div key={pos} className={`border rounded-xl p-3 flex items-center justify-between transition-all ${
                    isPickingNow 
                      ? 'border-red-400 bg-red-400/5 ring-1 ring-red-400/30' 
                      : isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[9px] font-black px-1.5 py-0.5 bg-red-650 text-white rounded uppercase mr-2">{pos}</span>
                      <strong className={`text-xs uppercase tracking-widest font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {activeChamp ? activeChamp.name : isPickingNow ? 'Escolhendo...' : 'Aguardando'}
                      </strong>
                    </div>
                    {activeChamp && <img src={getChampAvatar(activeChamp.id, activeChamp.imageSeed + 4)} alt="vtr" className="w-6 h-6 rounded-full object-cover" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-3 text-xs border ${isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 font-bold text-[10px]">Poder de Composição:</span>
              <strong className="text-rose-500 font-black">{redAnalysis.draftPower}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold text-[10px]">Sinergia Geral:</span>
              <strong className="text-emerald-500 font-black">{redAnalysis.synergyLevel}%</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

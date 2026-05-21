/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, Shield, Award, Sparkles, ChevronRight } from 'lucide-react';
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
}

export default function DraftTab({
  gameState,
  onConfirmDraft,
  onBackToHub
}: DraftTabProps) {
  const { currentPatch, playerTeamId, teams, week } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;

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

  // Draft Phase Machines
  // Steps: BAN_B1, BAN_R1, BAN_B2, BAN_R2, PICK_TOP_B, PICK_TOP_R, PICK_JNG_B, PICK_JNG_R, PICK_MID_B, PICK_MID_R, PICK_ADC_B, PICK_ADC_R, PICK_SUP_B, PICK_SUP_R, DRAFT_DONE
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

  const currentStep = draftSteps[currentStepIndex] || 'DRAFT_DONE';

  // Computed analyzers
  const blueAnalysis = analyzeComposition(bluePicks, isPlayerBlue ? playerTeam : opponentTeamObj, currentPatch.buffedChampions, currentPatch.nerfedChampions);
  const redAnalysis = analyzeComposition(redPicks, isPlayerBlue ? opponentTeamObj : playerTeam, currentPatch.buffedChampions, currentPatch.nerfedChampions);

  // Auto Bot draft step calculations
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
    // Collect banned lists
    const unavailable = [...bans, ...Object.values(bluePicks), ...Object.values(redPicks)].filter(Boolean) as string[];
    const candidates = CHAMPIONS_LIST.filter(c => !unavailable.includes(c.id));

    if (currentStep.startsWith('BAN')) {
      // Ban random or high power
      const sorted = [...candidates].sort((a, b) => b.power - a.power);
      const chosenBan = sorted[0]?.id || candidates[0]?.id;
      if (chosenBan) {
        setBans(p => [...p, chosenBan]);
        setPickBansList(p => [...p, { id: generateId(), championId: chosenBan, isBan: true, teamId: currentStep.endsWith('B') ? 'BLUE' : 'RED', position: 'TOP' }]);
        setCurrentStepIndex(i => i + 1);
      }
    } else {
      // Pick matching position
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
    // Check if unavailable
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

  return (
    <div className="min-h-screen bg-[#070d19] text-white py-8 px-6 font-sans select-none relative overflow-hidden">
      
      {/* Upper header match telemetry */}
      <div className="flex justify-between items-center bg-[#0a1424] border border-[#1e2d44] p-4 rounded-xl mb-6">
        <div>
          <span className="text-[10px] text-[#00d2fd] uppercase font-bold tracking-widest block mb-0.5">ESTÁGIO DRAFT-DECK HUD</span>
          <h2 className="font-display-lg text-sm font-black uppercase tracking-wider text-white">
            {playerTeam.acronym} VS {opponentTeamObj.acronym}
          </h2>
        </div>
        <div className="text-center font-bold px-4 py-1 bg-red-600/10 border border-red-500/20 rounded flex items-center gap-1.5 text-xs text-red-500 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          FASE DE PICKS & BANS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Left Column: Blue Side Picks (Span 3) */}
        <div className="lg:col-span-3 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between h-[510px]">
          <div>
            <div className="border-b border-blue-500/20 pb-2 mb-4">
              <h4 className="font-display-lg text-xs font-black uppercase tracking-widest text-[#00d2fd]">EQUIPE AZUL (BLUE SIDE)</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-semibold">
                {isPlayerBlue ? 'Sua Organização' : 'Oponente'}
              </p>
            </div>

            {/* Picks listing slots */}
            <div className="space-y-3">
              {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                const champId = bluePicks[pos];
                const activeChamp = CHAMPIONS_LIST.find(c => c.id === champId);
                const isPickingNow = currentStep === `PICK_${pos}_B`;
                
                return (
                  <div key={pos} className={`bg-[#070d19] border rounded-lg p-3 flex items-center justify-between transition-all ${
                    isPickingNow ? 'border-[#00d2fd] bg-[#00d2fd]/5' : 'border-[#1e2d44]'
                  }`}>
                    <div>
                      <span className="font-display-lg text-[9px] font-extrabold px-1.5 py-0.5 bg-black text-[#00d2fd] rounded border border-blue-500/10 uppercase mr-2">{pos}</span>
                      <strong className="text-xs uppercase text-white tracking-widest font-black">
                        {activeChamp ? activeChamp.name : isPickingNow ? 'Escolhendo...' : 'Bloqueado'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis indicator blue */}
          <div className="bg-[#070d19] rounded-lg p-3 text-xs border border-[#1e2d44] mt-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Poder de Composição:</span>
              <strong className="text-[#00d2fd]">{blueAnalysis.draftPower}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sinergia:</span>
              <strong className="text-emerald-400">{blueAnalysis.synergyLevel}%</strong>
            </div>
          </div>
        </div>

        {/* Central Grid: Champions Catalog selection (Span 6) */}
        <div className="lg:col-span-6 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 h-[510px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#1e2d44]">
              <h4 className="font-display-lg text-xs font-bold uppercase tracking-widest text-[#00d2fd]">
                {currentStep === 'DRAFT_DONE' ? 'Fase de Draft Concluída!' : `Escolhendo para: ${currentStep}`}
              </h4>
              
              {/* Ban listing visualizer */}
              <div className="flex gap-1.5">
                {bans.map((bId, idx) => {
                  const bc = CHAMPIONS_LIST.find(c => c.id === bId);
                  return (
                    <span key={idx} className="w-5 h-5 bg-red-500/10 border border-red-500/30 text-[8px] font-black tracking-widest rounded text-red-500 flex items-center justify-center uppercase" title={`Banido: ${bc?.name}`}>
                      {bc?.name.substring(0, 2)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Champions selection grid */}
            {currentStep !== 'DRAFT_DONE' ? (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[355px] overflow-y-auto pr-1">
                {CHAMPIONS_LIST.map(champ => {
                  const isBanned = bans.includes(champ.id);
                  const isSelected = Object.values(bluePicks).includes(champ.id) || Object.values(redPicks).includes(champ.id);
                  const isAvailable = !isBanned && !isSelected;
                  
                  // Highlight roles matching active slot
                  const matchesRole = activePositionTarget && champ.roles.includes(activePositionTarget);
                  
                  // Patch buff
                  const isBuffed = currentPatch.buffedChampions.includes(champ.id);
                  const isNerfed = currentPatch.nerfedChampions.includes(champ.id);

                  return (
                    <button
                      key={champ.id}
                      onClick={() => isAvailable && handleSelectChampion(champ.id)}
                      disabled={!isAvailable}
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-between relative transition-all ${
                        isAvailable 
                          ? matchesRole 
                            ? 'border-[#00d2fd] bg-[#00d2fd]/5 hover:scale-105' 
                            : 'border-[#1e2d44] bg-[#070d19] hover:border-[#1e2d44]/90'
                          : 'bg-gray-800/20 border-transparent text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-display-lg text-[9px] font-black uppercase text-center truncate w-full text-white">{champ.name}</span>
                      
                      <div className="flex items-center gap-1 mt-1.5 select-none">
                        {isBuffed && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Buffed Patch" />}
                        {isNerfed && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Nerfed Patch" />}
                        <span className="text-[9px] font-semibold text-gray-400">{champ.power}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* DRAFT WRAPPED SUCCESS MESSAGE */
              <div className="text-center py-20 animate-fade-in flex flex-col justify-center items-center gap-6">
                <div>
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-display-lg text-lg font-black uppercase tracking-wider text-green-400">LINEUP BLOQUEADO COM SUCESSO!</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Tanto a equipe azul quanto a vermelha assinaram e travaram suas escolhas. Prontos para marchar em direção ao covil no mapa tático!
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onBackToHub}
                    className="bg-transparent text-gray-400 hover:text-white border border-[#1e2d44] uppercase tracking-widest font-bold py-3 px-6 rounded-lg text-xs"
                  >
                    VOLTAR AO HUB
                  </button>
                  <button
                    onClick={() => onConfirmDraft(bluePicks, redPicks, pickBansList)}
                    className="bg-[#00d2fd] hover:bg-opacity-95 text-black font-display-lg text-xs font-black py-3 px-6 rounded-lg uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    ENTRAR EM WRift <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines notes */}
          {currentStep !== 'DRAFT_DONE' && (
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-gray-500 pt-3 border-t border-[#1e2d44] select-none text-center">
              📌 Escolha campeões com círculos de buff, ou que correspondam a assinatura do time para bônus de draft de até +8 draftech!
            </div>
          )}
        </div>

        {/* Right Column: Red Side Picks (Span 3) */}
        <div className="lg:col-span-3 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between h-[510px]">
          <div>
            <div className="border-b border-red-500/20 pb-2 mb-4 text-right">
              <h4 className="font-display-lg text-xs font-black uppercase tracking-widest text-red-400">EQUIPE VERMELHA (RED SIDE)</h4>
              <p className="text-[9px] text-gray-500 mt-1 uppercase font-semibold">
                {!isPlayerBlue ? 'Sua Organização' : 'Oponente'}
              </p>
            </div>

            {/* Picks listing slots */}
            <div className="space-y-3">
              {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                const champId = redPicks[pos];
                const activeChamp = CHAMPIONS_LIST.find(c => c.id === champId);
                const isPickingNow = currentStep === `PICK_${pos}_R`;
                
                return (
                  <div key={pos} className={`bg-[#070d19] border rounded-lg p-3 flex items-center justify-between transition-all ${
                    isPickingNow ? 'border-red-500/30 bg-red-500/5' : 'border-[#1e2d44]'
                  }`}>
                    <span className="font-display-lg text-[9px] font-extrabold px-1.5 py-0.5 bg-black text-gray-500 rounded border border-[#1e2d44] uppercase mr-2">{pos}</span>
                    <strong className="text-xs uppercase text-white tracking-widest font-black text-right">
                      {activeChamp ? activeChamp.name : isPickingNow ? 'Escolhendo...' : 'Bloqueado'}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis indicator red */}
          <div className="bg-[#070d19] rounded-lg p-3 text-xs border border-[#1e2d44] mt-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Poder de Composição:</span>
              <strong className="text-red-400">{redAnalysis.draftPower}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sinergia:</span>
              <strong className="text-emerald-400">{redAnalysis.synergyLevel}%</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

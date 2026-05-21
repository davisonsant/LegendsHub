/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, MapPin, Award, Plus, Compass } from 'lucide-react';
import { GameState, Player, Position } from '../types';

interface AcademyTabProps {
  gameState: GameState;
  onPromoteProspect: (player: Player) => void;
}

export default function AcademyTab({ gameState, onPromoteProspect }: AcademyTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
  const [selectedProspectId, setSelectedProspectId] = useState<string>('');
  const [regionPlacements, setRegionPlacements] = useState<{ [reg: string]: string }>({
    'KR': 'Ativo (Eficiência: 89.2%)',
    'DE': 'Ativo (Eficiência: 74.5%)',
    'BR': 'Ativo (Eficiência: 78.4%)'
  });

  const prospectList = playerTeam.academy;
  const activeProspect = prospectList.find(p => p.id === selectedProspectId) || prospectList[0];

  const handleScoutRegion = (region: string) => {
    setRegionPlacements(p => ({
      ...p,
      [region]: p[region] ? '' : 'Buscando Atletas...'
    }));
  };

  const handlePromote = (p: Player) => {
    if (playerTeam.roster.length + playerTeam.substitutes.length >= 8) {
      alert("Seu elenco de starters e reservas está lotado! Dispense algum jogador profissional antes de subir talentos da base.");
      return;
    }
    onPromoteProspect(p);
  };

  // SVG spider comparer points (compares prospect stats vs player team average stats)
  const calculateCompareRadarPoints = (prospect: Player, isProspect: boolean) => {
    if (!prospect) return "50,50 50,50 50,50 50,50 50,50 50,50";
    
    // Average team stats
    const teamAvg = {
      mechanics: playerTeam.roster.reduce((a, b) => a + b.attributes.mechanics, 0) / 5,
      macro: playerTeam.roster.reduce((a, b) => a + b.attributes.macro, 0) / 5,
      comms: playerTeam.roster.reduce((a, b) => a + b.attributes.communication, 0) / 5,
      consistency: playerTeam.roster.reduce((a, b) => a + b.attributes.consistency, 0) / 5,
      emotional: playerTeam.roster.reduce((a, b) => a + b.attributes.emotionalControl, 0) / 5,
      vision: playerTeam.roster.reduce((a, b) => a + b.attributes.mapVision, 0) / 5
    };

    const target = isProspect ? prospect.attributes : {
      mechanics: teamAvg.mechanics,
      macro: teamAvg.macro,
      communication: teamAvg.comms,
      consistency: teamAvg.consistency,
      emotionalControl: teamAvg.emotional,
      mapVision: teamAvg.vision
    };

    const scaleValue = (val: number) => 45 * (val / 100);

    const rMechanics = scaleValue(target.mechanics);
    const rMacro = scaleValue(target.macro);
    const rComms = scaleValue(target.communication);
    const rConsistency = scaleValue(target.consistency);
    const rEmotional = scaleValue(target.emotionalControl);
    const rMapVision = scaleValue(target.mapVision);

    const p1 = { x: 50 + rMechanics * Math.cos(-Math.PI/2), y: 50 + rMechanics * Math.sin(-Math.PI/2) };
    const p2 = { x: 50 + rMacro * Math.cos(-Math.PI/6), y: 50 + rMacro * Math.sin(-Math.PI/6) };
    const p3 = { x: 50 + rComms * Math.cos(Math.PI/6), y: 50 + rComms * Math.sin(Math.PI/6) };
    const p4 = { x: 50 + rConsistency * Math.cos(Math.PI/2), y: 50 + rConsistency * Math.sin(Math.PI/2) };
    const p5 = { x: 50 + rEmotional * Math.cos(5*Math.PI/6), y: 50 + rEmotional * Math.sin(5*Math.PI/6) };
    const p6 = { x: 50 + rMapVision * Math.cos(7*Math.PI/6), y: 50 + rMapVision * Math.sin(7*Math.PI/6) };

    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y} ${p6.x},${p6.y}`;
  };

  return (
    <div className="space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-display text-slate-800 text-sm font-extrabold uppercase tracking-wider leading-none">Scout e Academia</h3>
          <p className="text-xs text-slate-400 font-medium tracking-tight mt-1">Supervisão de novos talentos e posicionamento regional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Placements Map panel (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scout Deploy Map Mock */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden h-[240px] flex flex-col justify-between shadow-sm">
            <div className="absolute top-0 left-0 w-full h-full bg-slate-50/20 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:16px_16px] z-0" />
            
            <div className="z-10 flex justify-between select-none">
              <span className="font-display text-xs font-black uppercase tracking-wider text-slate-700">REDE DE MONITORAMENTO GLOBAL</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase animate-pulse">Ativo • 3 Scouts em Campo</span>
            </div>

            {/* Simulated target pins */}
            <div className="relative h-28 z-10">
              <div 
                onClick={() => handleScoutRegion('KR')}
                className={`absolute top-6 left-1/4 p-2 bg-white border rounded-lg cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm ${
                  regionPlacements['KR'] ? 'border-blue-500 text-blue-600 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-display text-[9px] font-extrabold uppercase">Seul, KR (89%)</span>
              </div>

              <div 
                onClick={() => handleScoutRegion('DE')}
                className={`absolute top-12 left-2/3 p-2 bg-white border rounded-lg cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm ${
                  regionPlacements['DE'] ? 'border-blue-500 text-blue-600 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-display text-[9px] font-extrabold uppercase">Berlin, DE (74%)</span>
              </div>

              <div 
                onClick={() => handleScoutRegion('BR')}
                className={`absolute bottom-2 left-1/2 -translate-x-12 p-2 bg-white border rounded-lg cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm ${
                  regionPlacements['BR'] ? 'border-blue-500 text-blue-600 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-display text-[9px] font-extrabold uppercase">São Paulo, BR (78%)</span>
              </div>
            </div>

            <div className="z-10 text-[9px] text-slate-400 font-bold uppercase tracking-wider select-none">
              💡 Clique nas regiões e pinos para alocar scouts e alterar os focos de talentos procedurais.
            </div>
          </div>

          {/* Prospects list table panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-150 bg-slate-50 select-none text-[10px] font-display font-extrabold uppercase tracking-wide text-slate-700">
              ATLETAS PROSPECTADOS DA BASE
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[220px]">
              {prospectList.map(pc => {
                const isSelected = pc.id === selectedProspectId;
                return (
                  <div
                    key={pc.id}
                    onClick={() => setSelectedProspectId(pc.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50/25 border-l-4 border-blue-500' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 uppercase">{pc.position}</span>
                      <div>
                        <h5 className="font-display text-xs font-bold text-slate-800 leading-none">{pc.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{pc.nationality} • {pc.age} anos • Potencial: {pc.potential}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center select-none">
                        <span className="font-display text-sm font-black text-slate-800">{pc.overallRating}</span>
                        <p className="text-[8px] text-slate-400 uppercase font-black font-mono">OVR</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromote(pc);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-black tracking-widest px-3.5 py-2.5 rounded uppercase cursor-pointer"
                      >
                        SUBIR PRO JOGO
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Analytical delta (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm select-none flex flex-col justify-between h-[525px]">
          {activeProspect ? (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div>
                <h4 className="font-display text-xs font-extrabold uppercase tracking-wide text-slate-800 border-b border-slate-100 pb-2 mb-4">
                  COMPARAÇÃO DE PROSPECTO VS TIME PRINCIPAL
                </h4>
                
                {/* Details line */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-display text-sm font-bold text-slate-800">{activeProspect.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">Atributo de base em comparação com a média da sua titularidade atual.</p>
                  </div>
                  <span className="font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-black px-2 py-1 rounded uppercase">
                    Potencial {activeProspect.potential}
                  </span>
                </div>

                {/* Micro SVG comparative spider radar */}
                <div className="flex justify-center py-4 bg-slate-50/50 border border-slate-100 rounded-xl relative">
                  <div className="relative w-[150px] h-[150px]">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <polygon points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="50" y2="5" stroke="#edf2f7" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="89" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="89" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="50" y2="95" stroke="#edf2f7" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="11" y2="72.5" stroke="#edf2f7" strokeWidth="0.8" />
                      <line x1="50" y1="50" x2="11" y2="27.5" stroke="#edf2f7" strokeWidth="0.8" />
                      
                      {/* Grey Team Avg Polygon */}
                      <polygon 
                        points={calculateCompareRadarPoints(activeProspect, false)}
                        fill="rgba(156, 163, 175, 0.08)"
                        stroke="#9ca3af"
                        strokeWidth="1"
                        strokeDasharray="2"
                      />

                      {/* Cyan Prospect active Polygon */}
                      <polygon 
                        points={calculateCompareRadarPoints(activeProspect, true)}
                        fill="rgba(2, 132, 199, 0.12)"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Comparison details box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[9px] text-[#006a80] font-mono font-bold uppercase tracking-wider mb-2">Delta Analítico de Qualificação</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Mecânica:</span>
                    <span className={activeProspect.attributes.mechanics >= 80 ? 'text-emerald-600 font-extrabold' : 'text-slate-800'}>
                      {activeProspect.attributes.mechanics}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Macro Game:</span>
                    <span className={activeProspect.attributes.macro >= 80 ? 'text-emerald-600 font-extrabold' : 'text-slate-800'}>
                      {activeProspect.attributes.macro}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center text-xs py-10 uppercase tracking-widest h-full flex items-center justify-center">
              Nenhum prospecto selecionado para análise de delta de competência
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

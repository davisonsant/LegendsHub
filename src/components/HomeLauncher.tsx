/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, FolderOpen, Edit, Settings, Trash2, Shield, Circle, User, ChevronRight, Calendar, Globe } from 'lucide-react';
import { INITIAL_TEAMS_DATA, REGIONAL_TEAMS_DATABASE } from '../data/initialDatabase';
import { SavedGameHeader } from '../types';

interface HomeLauncherProps {
  onStartNewGame: (managerName: string, selectedTeamId: string, region: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP', year: number) => void;
  onLoadGame: (slotId: string) => void;
  onOpenEditor: () => void;
  onOpenSettings: () => void;
}

export default function HomeLauncher({
  onStartNewGame,
  onLoadGame,
  onOpenEditor,
  onOpenSettings
}: HomeLauncherProps) {
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [managerName, setManagerName] = useState('Alex Rivers');
  const [selectedRegion, setSelectedRegion] = useState<'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP'>('CBLOL');
  const [selectedTeamId, setSelectedTeamId] = useState('cblol_loud');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [saveSlots, setSaveSlots] = useState<SavedGameHeader[]>([]);
  const [showSavesModal, setShowSavesModal] = useState(false);

  // Sync selected team ID when region changes
  useEffect(() => {
    const list = REGIONAL_TEAMS_DATABASE[selectedRegion];
    if (list && list.length > 0) {
      setSelectedTeamId(list[0].id);
    }
  }, [selectedRegion]);

  useEffect(() => {
    const loadedSlots: SavedGameHeader[] = [];
    
    // Manual slots 1 to 3
    for (let i = 1; i <= 3; i++) {
      const savedDataStr = localStorage.getItem(`legendshub_save_slot_${i}`);
      if (savedDataStr) {
        try {
          const parsed = JSON.parse(savedDataStr);
          const savedDate = localStorage.getItem(`legendshub_save_slot_${i}_date`) || new Date().toLocaleDateString('pt-BR');
          loadedSlots.push({
            slotId: `slot_${i}`,
            managerName: parsed.managerName || 'Manager',
            teamName: parsed.teams?.find((t: any) => t.id === parsed.playerTeamId)?.name || 'Organização',
            date: savedDate,
            season: parsed.season || 2025,
            score: parsed.week || 1
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Auto-save slot
    const autosaveStr = localStorage.getItem(`legendshub_save_slot_autosave`);
    if (autosaveStr) {
      try {
        const parsed = JSON.parse(autosaveStr);
        const savedDate = localStorage.getItem(`legendshub_save_slot_autosave_date`) || new Date().toLocaleDateString('pt-BR');
        loadedSlots.push({
          slotId: `slot_autosave`,
          managerName: parsed.managerName || 'Manager',
          teamName: parsed.teams?.find((t: any) => t.id === parsed.playerTeamId)?.name || 'Organização',
          date: savedDate,
          season: parsed.season || 2025,
          score: parsed.week || 1
        });
      } catch (e) {
        console.error(e);
      }
    }

    setSaveSlots(loadedSlots);
  }, [showSavesModal]);

  const handleStartGame = () => {
    if (!managerName.trim()) return;
    onStartNewGame(managerName, selectedTeamId, selectedRegion, selectedYear);
  };

  const handleDeleteSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = slotId.replace('slot_', '');
    localStorage.removeItem(`legendshub_save_slot_${index}`);
    setSaveSlots(saveSlots.filter(s => s.slotId !== slotId));
  };

  // Find currently selected team details from active region list
  const currentRegionTeams = REGIONAL_TEAMS_DATABASE[selectedRegion] || REGIONAL_TEAMS_DATABASE.CBLOL;
  const activeTeamData = currentRegionTeams.find(t => t.id === selectedTeamId) || currentRegionTeams[0];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1e293b] flex flex-col justify-between py-12 px-6 relative overflow-hidden font-sans">
      
      {/* Absolute grid decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Hexagonal blue brand logo (centered, Image #4 style) */}
      <div className="flex flex-col items-center text-center z-10 select-none mt-10">
        <div className="relative mb-3 flex flex-col items-center">
          {/* Custom SVG Hexagon outline icon */}
          <svg className="w-24 h-24 text-blue-500 fill-none" viewBox="0 0 100 100">
            {/* outer hexagon */}
            <polygon 
              points="50 5, 90 28, 90 72, 50 95, 10 72, 10 28" 
              className="stroke-blue-500 stroke-[3.5px]" 
            />
            {/* inner geometrical diamond and shape matching Image #4 */}
            <polygon 
              points="50 20, 80 43, 80 57, 50 80, 20 57, 20 43" 
              className="fill-blue-500/10 stroke-blue-400 stroke-1" 
            />
            {/* inner core elements */}
            <path 
              d="M32 38 L50 62 L68 38" 
              className="stroke-blue-600 stroke-[4px] stroke-round" 
            />
            <polygon 
              points="50 26, 64 36, 50 50, 36 36" 
              className="fill-blue-500" 
            />
          </svg>
          <h1 className="font-display text-lg font-black tracking-[0.25em] text-[#0f2d59] mt-3 uppercase leading-none">
            LEGENDS HUB
          </h1>
          <p className="text-[10px] text-blue-500/80 font-mono tracking-widest font-bold uppercase mt-1">
            TACTICAL EDITION
          </p>
        </div>
      </div>

      {/* Menu buttons container matching Image #4 */}
      <div className="w-full max-w-sm mx-auto flex flex-col gap-2.5 z-10 my-auto">
        
        {/* NOVA CARREIRA */}
        <button
          onClick={() => setShowNewGameModal(true)}
          className="group w-full bg-white hover:bg-slate-50 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-6 py-4.5 rounded-lg flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Play className="w-4 h-4 text-blue-600 fill-blue-600/15" />
            <span className="font-display text-[11.5px] font-bold tracking-[0.1em] text-slate-800 uppercase">
              NOVA CARREIRA
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        </button>

        {/* CARREGAR JOGO */}
        <button
          onClick={() => setShowSavesModal(true)}
          className="group w-full bg-white hover:bg-slate-50 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-6 py-4.5 rounded-lg flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span className="font-display text-[11.5px] font-bold tracking-[0.1em] text-slate-800 uppercase">
              CARREGAR JOGO
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        </button>

        {/* EDITOR DE JOGO */}
        <button
          onClick={onOpenEditor}
          className="group w-full bg-white hover:bg-slate-50 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-6 py-4.5 rounded-lg flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Edit className="w-4 h-4 text-blue-600" />
            <span className="font-display text-[11.5px] font-bold tracking-[0.1em] text-slate-800 uppercase">
              EDITOR DE JOGO
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        </button>

        {/* CONFIGURAÇÕES */}
        <button
          onClick={onOpenSettings}
          className="group w-full bg-white hover:bg-slate-50 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-6 py-4.5 rounded-lg flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="font-display text-[11.5px] font-bold tracking-[0.1em] text-slate-800 uppercase">
              CONFIGURAÇÕES
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      {/* MODAL: CONFIGURAÇÃO DE INICIO DE CARREIRA */}
      {showNewGameModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative my-8">
            <h3 className="font-display text-base font-bold tracking-wider uppercase border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-slate-850">
              <Shield className="text-blue-650 w-5 h-5 animate-pulse" /> Configuração de Inicio de Carreira
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-normal">
              
              {/* LEFT FORM FIELD CONTROLS (Span 5) */}
              <div className="md:col-span-5 space-y-5">
                {/* Manager Name Input */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">
                    Nome do Pro Manager / Técnico
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                      placeholder="Seu Nome do Treinador"
                      maxLength={25}
                    />
                  </div>
                </div>

                {/* Region Selector Box */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">
                    Selecione a Região Competitiva
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-bold transition-all cursor-pointer"
                    >
                      <option value="CBLOL">CBLOL (Brasil)</option>
                      <option value="LCK">LCK (Coreia do Sul)</option>
                      <option value="LPL">LPL (China)</option>
                      <option value="LEC">LEC (Europa)</option>
                      <option value="LCS">LCS (América do Norte)</option>
                      <option value="LCP">LCP (Pacífico)</option>
                    </select>
                  </div>
                </div>

                {/* Season Year Selector */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">
                    Escolha o Ano Vigente do Split
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedYear(2025)}
                      className={`py-3.5 px-4 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedYear === 2025 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Split 2025
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedYear(2026)}
                      className={`py-3.5 px-4 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedYear === 2026 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Split 2026
                    </button>
                  </div>
                </div>
              </div>

              {/* LIST OF TEAMS AND ACTIVE SELECTION (Span 7) */}
              <div className="md:col-span-7 bg-[#0b1329]/5 border border-[#1e2d44]/15 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[300px]">
                
                {/* Scrollable teams list */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="block text-[8.5px] uppercase tracking-wider font-extrabold text-slate-450 mb-1 border-b border-slate-200/20 pb-1">
                    Equipes do {selectedRegion}
                  </span>
                  <div className="flex-1 max-h-[280px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {currentRegionTeams.map((t) => {
                      const isSelected = selectedTeamId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white border-blue-500 shadow-[0_1px_5px_rgba(59,130,246,0.12)] font-black'
                              : 'bg-white/60 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt={t.name} className="w-4 h-4 object-contain rounded shrink-0 referrerPolicy='no-referrer'" />
                            ) : (
                              <div 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: t.primaryColor }}
                              />
                            )}
                            <span className="font-display text-[11px] text-slate-800 leading-tight truncate">
                              {t.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {t.acronym}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Large Team detail viewer on right side */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-sm">
                  {activeTeamData ? (
                    <>
                      <div className="flex flex-col items-center mt-2 w-full">
                        {/* Shield icon simulation / Custom Logo */}
                        {activeTeamData.logoUrl ? (
                          <img 
                            src={activeTeamData.logoUrl} 
                            alt={activeTeamData.name} 
                            className="w-16 h-16 object-contain rounded-xl shadow-sm mb-2 shrink-0 select-none referrerPolicy='no-referrer'" 
                          />
                        ) : (
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center border-4 font-display text-xl font-extrabold text-white shadow-md mb-2 shrink-0 select-none animate-pulse"
                            style={{ 
                              backgroundColor: activeTeamData.primaryColor || '#2563eb',
                              borderColor: activeTeamData.secondaryColor || '#ffffff'
                            }}
                          >
                            {activeTeamData.acronym}
                          </div>
                        )}
                        <h4 className="font-display text-xs font-black text-slate-850 mt-1 truncate max-w-full">
                          {activeTeamData.name} ({activeTeamData.acronym})
                        </h4>
                        <p className="text-[10px] text-slate-420 font-bold tracking-widest uppercase text-blue-600 mt-0.5">
                          FRANQUIA OFICIAL
                        </p>
                        
                        <div className="mt-3 text-left w-full h-24 overflow-y-auto pr-1 text-[10.5px] leading-relaxed text-slate-500 font-medium scrollbar-thin">
                          {activeTeamData.description}
                        </div>
                      </div>

                      {/* Financial info deck */}
                      <div className="border-t border-slate-100 pt-3 mt-3 w-full grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">BUDGET</span>
                          <span className="font-display text-slate-800 text-[11px] font-bold">
                            $ {(activeTeamData.budget / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">TORCIDA</span>
                          <span className="font-display text-blue-600 text-[11px] font-bold">
                            {activeTeamData.popularity}% Ativa
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-xs my-auto select-none">
                      Carregando franquia...
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Action buttons footer */}
            <div className="flex gap-2.5 justify-end border-t border-slate-100 pt-6 mt-6">
              <button
                onClick={() => setShowNewGameModal(false)}
                className="bg-transparent text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-widest py-3.5 px-6 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={handleStartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-display text-[10px] font-bold uppercase tracking-widest py-3.5 px-7 rounded-lg transition-all shadow-md shadow-blue-500/15 cursor-pointer"
              >
                INICIAR REGIONAL E ANUAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARREGAR SAVES */}
      {showSavesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <h3 className="font-display text-base font-bold tracking-wider uppercase border-b border-slate-100 pb-4 mb-5 flex items-center gap-2 text-slate-800">
              <FolderOpen className="text-blue-500 w-5 h-5" /> Carregamento de Carreira
            </h3>

            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-5 scrollbar-thin mb-6">
              {/* Manual slots listing */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Slots de Salvamento Manual
                </span>
                {[1, 2, 3].map((slotIndex) => {
                  const header = saveSlots.find((s) => s.slotId === `slot_${slotIndex}`);
                  if (header) {
                    return (
                      <div
                        key={slotIndex}
                        onClick={() => onLoadGame(`slot_${slotIndex}`)}
                        className="group cursor-pointer bg-slate-50 hover:bg-blue-50/40 border border-slate-200 p-4 rounded-xl flex justify-between items-center transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight truncate">
                            {header.teamName}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider truncate">
                            MGR: {header.managerName} • TEMP {header.season} • SEM {header.score - 1}
                          </p>
                          <span className="text-[8px] text-slate-400 font-mono mt-1.5 block">
                            {header.date}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSlot(`slot_${slotIndex}`, e)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={slotIndex}
                        className="bg-slate-50/30 border-2 border-dashed border-slate-200 p-4 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase select-none h-[64px]"
                      >
                        SLOTE {slotIndex} DISPONÍVEL
                      </div>
                    );
                  }
                })}
              </div>

              {/* Unique Auto-saved section */}
              {saveSlots.some((s) => s.slotId === 'slot_autosave') && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-extrabold text-sky-600 uppercase tracking-widest mb-2.5 block flex items-center gap-1.5 leading-none">
                    <Circle className="w-2 h-2 fill-sky-400 text-sky-455 animate-pulse" />
                    Auto-Guardado Automático
                  </span>
                  {(() => {
                    const header = saveSlots.find((s) => s.slotId === 'slot_autosave');
                    if (header) {
                      return (
                        <div
                          onClick={() => onLoadGame('slot_autosave')}
                          className="group cursor-pointer bg-sky-50/30 hover:bg-sky-50 border border-sky-100/60 p-4 rounded-xl flex justify-between items-center transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-xs font-bold text-slate-800 group-hover:text-sky-650 transition-colors leading-tight truncate">
                              {header.teamName}
                            </p>
                            <p className="text-[9px] text-sky-600 mt-1 font-bold uppercase tracking-wider truncate">
                              MGR: {header.managerName} • TEMP {header.season} • SEM {header.score - 1}
                            </p>
                            <span className="text-[8.5px] text-slate-455 font-mono mt-1.5 block">
                              {header.date}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSlot('slot_autosave', e)}
                            className="text-slate-405 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button
                onClick={() => setShowSavesModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all cursor-pointer"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer release brandings matching Screenshot #4 exactly */}
      <div className="text-center z-10 select-none pb-4">
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">
          V12.4 STABLE RELEASE BUILD PRO
        </p>
        <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-1">
          © 2024 LegendHub Studios
        </p>
      </div>
    </div>
  );
}

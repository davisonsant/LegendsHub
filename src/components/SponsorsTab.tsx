/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Zap, TrendingUp, Sparkles, Building2, HelpCircle, AlertCircle, DollarSign } from 'lucide-react';
import { GameState, Sponsor } from '../types';

interface SponsorsTabProps {
  gameState: GameState;
  onSignSponsor: (sponsorId: string) => void;
  onUpgradeInfrastructure: (facilityType: 'gamingHouseLevel' | 'trainingCenterLevel' | 'mediaTeamLevel') => void;
}

export default function SponsorsTab({
  gameState,
  onSignSponsor,
  onUpgradeInfrastructure
}: SponsorsTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  const handleUpgrade = (type: 'gamingHouseLevel' | 'trainingCenterLevel' | 'mediaTeamLevel', cost: number) => {
    if (playerTeam.budget < cost) {
      alert("Fundos insuficientes para realizar esta melhoria estrutural!");
      return;
    }
    onUpgradeInfrastructure(type);
  };

  // Facility Levels
  const ghLevel = playerTeam.infrastructure.gamingHouseLevel;
  const tcLevel = playerTeam.infrastructure.trainingCenterLevel;
  const mtLevel = playerTeam.infrastructure.mediaTeamLevel;

  // Pricing arrays multiplier
  const upgradeCostGH = ghLevel * 125000;
  const upgradeCostTC = tcLevel * 100000;
  const upgradeCostMT = mtLevel * 80000;

  return (
    <div className="space-y-6">
      
      {/* Upper Grid: Finance Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl select-none">
        <div>
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Saldo de Caixa</p>
          <h3 className="font-display-lg text-white text-xl font-black mt-1">$ {(playerTeam.budget / 1000).toLocaleString('pt-BR')}k</h3>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Inflow Semanal (Patrocínios)</p>
          <h3 className="font-display-lg text-green-400 text-xl font-black mt-1">
            + $ {(playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0) / 1000).toLocaleString('pt-BR')}k
          </h3>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Métricas de Fãs (Mídia)</p>
          <h3 className="font-display-lg text-[#00d2fd] text-xl font-black mt-1">Popularidade {playerTeam.popularity}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sponsor Contracts management (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Sponsorship layout */}
          <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-[#00d2fd] flex items-center gap-2 border-b border-[#1e2d44] pb-2">
              <Award className="w-4 h-4" /> PATROCINADORES ATIVOS
            </h4>

            <div className="space-y-3">
              {playerTeam.sponsors.length > 0 ? (
                playerTeam.sponsors.map((s, idx) => (
                  <div key={idx} className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-display-lg text-xs font-bold text-white uppercase">{s.name}</strong>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-bold rounded uppercase">ASSINADO</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1.5">
                        Meta: <span className="text-white font-medium">{s.objective}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display-lg text-green-400 text-xs font-black">+$ {(s.incomePerWeek / 1000).toFixed(0)}k / semana</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Termo: {s.activeWeeks || s.termsInWeeks} semanas</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 uppercase tracking-widest font-semibold border-2 border-dashed border-[#1e2d44] rounded-xl">
                  Nenhum patrocinador assinado. Verifique as propostas abertas abaixo.
                </div>
              )}
            </div>
          </div>

          {/* Open Market Sponsor Proposals */}
          <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="font-display-lg text-xs font-bold uppercase tracking-widest text-white border-b border-[#1e2d44] pb-2">
              PROPOSTAS DE PATROCÍNIO EM MERCADO
            </h4>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {gameState.sponsorsMarket.length > 0 ? (
                gameState.sponsorsMarket.map(s => {
                  const popularityCheck = playerTeam.popularity >= s.minPopularity;
                  return (
                    <div key={s.id} className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-display-lg text-xs font-bold text-white uppercase leading-none">{s.name}</h5>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">
                          BÔNUS DE ASSINATURA: <span className="text-[#00d2fd] font-bold">$ {(s.signatureBonus / 1000).toFixed(0)}k</span>
                        </p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">META: {s.objective}</p>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-display-lg text-emerald-400 text-sm font-black">+$ {(s.incomePerWeek / 1000).toFixed(0)}k/sem</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black">Min. Fãs: {s.minPopularity}%</p>
                        </div>
                        <button
                          onClick={() => onSignSponsor(s.id)}
                          disabled={!popularityCheck}
                          className={`px-4 py-2 font-display-lg text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                            popularityCheck 
                              ? 'bg-[#00d2fd] text-black hover:bg-opacity-95' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          ASSINAR
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 uppercase tracking-widest">
                  Aguardando novas propostas do mercado corporativo...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Facilities and upgrades (Span 5) */}
        <div className="lg:col-span-5 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg space-y-4">
          <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-[#00d2fd] border-b border-[#1e2d44] pb-2 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> MEIAS DE INFRAESTRUTURA
          </h4>

          <div className="space-y-4">
            
            {/* Gaming House */}
            <div className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-display-lg text-xs font-bold text-white uppercase leading-none">Gaming House (Nível {ghLevel})</h5>
                  <p className="text-[9px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Aumenta motivação e química base do time.</p>
                </div>
                <span className="font-display-lg text-[#00d2fd] text-xs font-extrabold">Max Level 5</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e2d44]/50">
                <span className="text-gray-400 font-medium text-xs font-display-lg">CUSTO: $ {(upgradeCostGH / 1000).toFixed(0)}k</span>
                <button
                  onClick={() => handleUpgrade('gamingHouseLevel', upgradeCostGH)}
                  disabled={ghLevel >= 5}
                  className={`px-3 py-1.5 font-display-lg text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                    ghLevel >= 5 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00d2fd] text-black hover:opacity-90'
                  }`}
                >
                  UPGRADE
                </button>
              </div>
            </div>

            {/* Training Center */}
            <div className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-display-lg text-xs font-bold text-white uppercase leading-none">Centro de Treinamento (Nível {tcLevel})</h5>
                  <p className="text-[9px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Acelera o desenvolvimento e potencialização do elenco.</p>
                </div>
                <span className="font-display-lg text-[#00d2fd] text-xs font-extrabold">Max Level 5</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e2d44]/50">
                <span className="text-gray-400 font-medium text-xs font-display-lg">CUSTO: $ {(upgradeCostTC / 1000).toFixed(0)}k</span>
                <button
                  onClick={() => handleUpgrade('trainingCenterLevel', upgradeCostTC)}
                  disabled={tcLevel >= 5}
                  className={`px-3 py-1.5 font-display-lg text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                    tcLevel >= 5 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00d2fd] text-black hover:opacity-90'
                  }`}
                >
                  UPGRADE
                </button>
              </div>
            </div>

            {/* Media/Publishing group */}
            <div className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-display-lg text-xs font-bold text-white uppercase leading-none">Equipe de Mídia (Nível {mtLevel})</h5>
                  <p className="text-[9px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Recruta novos torcedores e expande tickets de arrecadação.</p>
                </div>
                <span className="font-display-lg text-[#00d2fd] text-xs font-extrabold">Max Level 5</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e2d44]/50">
                <span className="text-gray-400 font-medium text-xs font-display-lg">CUSTO: $ {(upgradeCostMT / 1000).toFixed(0)}k</span>
                <button
                  onClick={() => handleUpgrade('mediaTeamLevel', upgradeCostMT)}
                  disabled={mtLevel >= 5}
                  className={`px-3 py-1.5 font-display-lg text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                    mtLevel >= 5 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00d2fd] text-black hover:opacity-90'
                  }`}
                >
                  UPGRADE
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

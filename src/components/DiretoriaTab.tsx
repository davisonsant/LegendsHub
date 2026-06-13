/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, AlertTriangle, Trophy, Landmark, DollarSign, Users, Building2, Zap,
  TrendingUp, Award, Clock, FileWarning, HelpCircle, Activity, Skull, Scale, Search, Heart, Smile, Globe
} from 'lucide-react';
import { GameState, Team } from '../types';

interface DiretoriaTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState | ((prev: GameState | null) => GameState)) => void;
  theme: 'light' | 'dark';
}

export default function DiretoriaTab({ gameState, onUpdateGameState, theme }: DiretoriaTabProps) {
  // Find playing team
  const playerTeamId = gameState.playerTeamId;
  const rawPlayerTeam = gameState.teams.find(t => t.id === playerTeamId);

  // Lazy initialize dynamic boardroom properties if not existing
  useEffect(() => {
    if (rawPlayerTeam && (
      rawPlayerTeam.boardTrust === undefined || 
      !rawPlayerTeam.boardGoals || 
      !rawPlayerTeam.boardReprobations || 
      !rawPlayerTeam.boardLegacy
    )) {
      onUpdateGameState((prev) => {
        if (!prev) return prev;
        const updatedTeams = prev.teams.map(t => {
          if (t.id === playerTeamId) {
            const hasTrust = t.boardTrust !== undefined ? t.boardTrust : 80;
            const hasWeeksBelow20 = t.consecutiveWeeksBelow20 !== undefined ? t.consecutiveWeeksBelow20 : 0;
            const hasLegacy = t.boardLegacy || [];
            const hasReprobations = t.boardReprobations || [];
            const hasGoals = t.boardGoals || [
              { id: 'goal-sports', name: 'Expectativa Esportiva', description: 'Garantir classificação para os Playoffs terminando no G4.', target: 'Playoffs / Top 4', status: 'pending' },
              { id: 'goal-finance', name: 'Expectativa Financeira', description: 'Manter folha salarial balanceada e evitar taxa de luxo.', target: 'Cumprir FFP', status: 'pending' },
              { id: 'goal-infra', name: 'Expectativa de Infraestrutura', description: 'Melhorar a Gaming House ou o Gaming Office para o Nível 2 ou contratar equipe de especialistas.', target: 'Instalações / Staff', status: 'pending' }
            ];
            
            return {
              ...t,
              boardTrust: hasTrust,
              consecutiveWeeksBelow20: hasWeeksBelow20,
              boardLegacy: hasLegacy,
              boardReprobations: hasReprobations,
              boardGoals: hasGoals
            };
          }
          return t;
        });

        return {
          ...prev,
          teams: updatedTeams
        };
      });
    }
  }, [rawPlayerTeam, playerTeamId, onUpdateGameState]);

  if (!rawPlayerTeam) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-bold">Erro de Sincronização</h3>
        <p className="text-sm">Seu clube controlado não foi identificado. Retorne à Central.</p>
      </div>
    );
  }

  const isDark = theme === 'dark';

  // Active processed state properties
  const trust = rawPlayerTeam.boardTrust !== undefined ? rawPlayerTeam.boardTrust : 80;
  const consecutiveWeeksBelow20 = rawPlayerTeam.consecutiveWeeksBelow20 || 0;
  const boardGoals = rawPlayerTeam.boardGoals || [
    { id: 'goal-sports', name: 'Expectativa Esportiva', description: 'Garantir classificação para os Playoffs terminando no G4.', target: 'Playoffs / Top 4', status: 'pending' as const },
    { id: 'goal-finance', name: 'Expectativa Financeira', description: 'Manter folha salarial balanceada e evitar taxa de luxo.', target: 'Cumprir FFP', status: 'pending' as const },
    { id: 'goal-infra', name: 'Expectativa de Infraestrutura', description: 'Melhorar a Gaming House ou o Gaming Office para o Nível 2 ou contratar equipe de especialistas.', target: 'Instalações / Staff', status: 'pending' as const }
  ];
  const boardReprobations = rawPlayerTeam.boardReprobations || [];
  const boardLegacy = rawPlayerTeam.boardLegacy || [];

  // Determine trust feedback
  let trustLabel = 'Estável';
  let trustColor = 'text-amber-500 border-amber-550/20 bg-amber-550/5';
  let trustGaugeGradient = 'from-red-500 via-amber-500 to-[#00E5FF]';

  if (trust >= 75) {
    trustLabel = 'Excelente';
    trustColor = 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
  } else if (trust >= 50) {
    trustLabel = 'Estável';
    trustColor = 'text-sky-400 border-sky-400/20 bg-sky-400/5';
  } else if (trust >= 25) {
    trustLabel = 'Instável';
    trustColor = 'text-orange-500 border-orange-550/20 bg-orange-550/5';
  } else {
    trustLabel = 'CRÍTICO';
    trustColor = 'text-red-500 border-red-500/20 bg-red-500/10 animate-pulse font-black';
  }

  // Calculate dynamic sector calculations
  const rosterPayroll = rawPlayerTeam.roster.reduce((acc, p) => acc + p.salary, 0);
  const substitutePayroll = rawPlayerTeam.substitutes.reduce((acc, p) => acc + p.salary, 0);
  const academyPayroll = (rawPlayerTeam.academy || []).reduce((acc, p) => acc + p.salary, 0);
  const staffPayroll = (gameState.corporationStaffEmployees || []).reduce((acc, s) => acc + s.salario_semanal, 0);
  const totalSalaries = rosterPayroll + substitutePayroll + academyPayroll + staffPayroll;
  const sponsorsIncome = rawPlayerTeam.sponsors?.reduce((acc, s) => acc + (s.isSigned ? s.incomePerWeek : 0), 0) || 12000;
  const financeBalanceWeek = sponsorsIncome - totalSalaries;
  const projectionTrend = financeBalanceWeek >= 0 ? "📈 Superávit saudável" : "📉 Reduzindo reservas";

  const academyCount = (rawPlayerTeam.academy || []).length;
  const avgAcademyOvr = academyCount > 0 ? Math.round(rawPlayerTeam.academy!.reduce((acc, p) => acc + p.overallRating, 0) / academyCount) : 64;
  const avgAcademyPot = academyCount > 0 ? Math.round(rawPlayerTeam.academy!.reduce((acc, p) => acc + p.potential, 0) / academyCount) : 81;
  const topProspects = (rawPlayerTeam.academy || []).filter(p => p.potential >= 83).length;

  const avgStamina = Math.round(rawPlayerTeam.roster.reduce((acc, p) => acc + p.stamina, 0) / (rawPlayerTeam.roster.length || 1));
  const fatiguePercent = Math.max(0, 100 - avgStamina);

  const avgMotivation = Math.round(rawPlayerTeam.roster.reduce((acc, p) => acc + p.motivation, 0) / (rawPlayerTeam.roster.length || 1));
  const avgChemistry = Math.round(rawPlayerTeam.roster.reduce((acc, p) => acc + p.chemistry, 0) / (rawPlayerTeam.roster.length || 1));

  // Stats
  const totalReprobationsCount = boardReprobations.length;
  const totalReprobationsFines = boardReprobations.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const finishedGoalsCount = boardGoals.filter(g => g.status === 'achieved').length;

  // Visual Theme Variables
  const textTitleClass = isDark ? 'text-white' : 'text-[#000000]';
  const textSubtitleClass = isDark ? 'text-slate-400' : 'text-slate-650';
  const cardBgClass = isDark ? 'bg-[#0a1424]/90 border-[#1e2d44]' : 'bg-white border-slate-200/90 shadow-sm';
  const innerCardBgClass = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200';
  const borderClass = isDark ? 'border-[#1e2d44]' : 'border-slate-200/90';
  const textSecondaryClass = isDark ? 'text-slate-300' : 'text-slate-800';
  const textMutedClass = isDark ? 'text-slate-500' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-md border ${isDark ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
              <Landmark className="w-5 h-5" />
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-extrabold ${textSubtitleClass}`}>CONSELHO SUPERIOR</span>
          </div>
          <h1 className={`${textTitleClass} text-xl md:text-2xl font-black uppercase tracking-tight mt-1`}>
            Diretoria & Relacionamento
          </h1>
          <p className={`text-xs mt-0.5 ${textSubtitleClass}`}>
            Gerencie os objetivos, prestação de contas fiscais, heranças da carreira e atritos regulatórios com a diretoria do {rawPlayerTeam.name}.
          </p>
        </div>

        {/* Informações rápidas do clube */}
        <div className={`p-3 rounded-lg border flex items-center gap-4 text-xs ${isDark ? 'bg-[#0a1424]/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`flex items-center gap-1.5 pr-3 border-r ${borderClass}`}>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <div>
              <span className={`${textMutedClass} block text-[9.5px] font-bold uppercase`}>CAIXA</span>
              <span className={`${isDark ? 'text-white' : 'text-slate-950'} font-mono font-bold`}>$ {rawPlayerTeam.budget.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <div>
              <span className={`${textMutedClass} block text-[9.5px] font-bold uppercase`}>SEMANA ATUAL</span>
              <span className={`${isDark ? 'text-white' : 'text-slate-950'} font-bold`}>Semana {gameState.week}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 1: CAMADA SUPERIOR (STATUS GERAL E EXPECTATIVAS CORPORATIVAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Bloco Esquerdo: Termômetro de Confiança */}
        <div className={`col-span-1 border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden h-full ${cardBgClass}`}>
          {isDark && <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 to-transparent pointer-events-none" />}
          
          <div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className={`text-[10px] font-black uppercase tracking-wider ${textSubtitleClass}`}>AVALIAÇÃO GERAL</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${trustColor}`}>
                {trustLabel}
              </span>
            </div>

            {/* Dial gauge com gradiente de alta legibilidade */}
            <div className="my-5 relative flex flex-col items-center z-10">
              <div className={`w-full h-3 rounded-full p-0.5 border overflow-hidden relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${trustGaugeGradient} transition-all duration-500`} 
                  style={{ width: `${trust}%` }}
                />
              </div>

              {/* Exact percentile display */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{trust}%</span>
                <span className={`font-bold text-xs ${textSubtitleClass}`}>de Confiança</span>
              </div>
            </div>
          </div>

          <p className={`text-[11px] leading-relaxed text-center mt-2 ${textSubtitleClass}`}>
            A opinião dos sócios reflete diretamente seus resultados esportivos, saúde orçamentária e conformidade jurídica.
          </p>

          {/* Critério crítico de demissão */}
          {trust < 20 && (
            <div className="mt-4 p-3 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-left text-[11px] leading-relaxed animate-pulse">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Skull className="w-3.5 h-3.5 shrink-0" />
                <span className="font-extrabold uppercase tracking-wide">COMPULSÓRIA</span>
              </div>
              <span>
                Confiança abaixo do limite por <strong>{consecutiveWeeksBelow20}/3 semanas</strong>. Caso não eleve, seu cargo será encerrado!
              </span>
            </div>
          )}
        </div>

        {/* Bloco Direito: Expectativas Anuais da Diretoria */}
        <div className={`col-span-1 lg:col-span-3 border rounded-2xl p-5 flex flex-col justify-between h-full ${cardBgClass}`}>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>EXPECTATIVAS ANUAIS DA DIRETORIA</h3>
            </div>
            <p className={`text-xs mb-4 ${textSubtitleClass}`}>
              Objetivos macro corporativos estabelecidos pelos sócios majoritários para o split corrente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {boardGoals.map((g) => {
              const isPending = g.status === 'pending';
              const isAchieved = g.status === 'achieved';
              const isFailed = g.status === 'failed';

              let statusColor = 'border-slate-300 text-slate-500 bg-slate-50';
              let statusLabel = 'Pendente';
              if (isAchieved) {
                statusColor = isDark ? 'border-cyan-400/20 text-cyan-400 bg-cyan-400/5' : 'border-cyan-200 text-cyan-600 bg-cyan-50';
                statusLabel = 'ALCANÇADA';
              } else if (isFailed) {
                statusColor = 'border-red-500/20 text-red-500 bg-red-500/5';
                statusLabel = 'FALHADA';
              } else if (isDark) {
                statusColor = 'border-slate-800 text-slate-400 bg-slate-900/40';
              }

              return (
                <div key={g.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-4 text-xs ${innerCardBgClass}`}>
                  <div>
                    <div className="flex justify-between items-start gap-1 pb-2 border-b border-slate-500/10">
                      <span className={`font-extrabold leading-tight block tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {g.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border tracking-wider shrink-0 uppercase ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed mt-2.5 ${textSecondaryClass}`}>
                      {g.description}
                    </p>
                  </div>

                  <div className={`p-2 rounded-lg text-[10px] ${isDark ? 'bg-slate-950/40' : 'bg-white border border-slate-200'}`}>
                    <span className="font-extrabold block text-slate-500 tracking-wider">REQUISITO:</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{g.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TIER 2: CAMADA CENTRAL (PAINEL DE FEEDBACK DOS SETORES EM TEMPO REAL) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 pl-1">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
            FEEDBACK E RELATÓRIOS DOS DEPARTAMENTOS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Finanças */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black tracking-wider uppercase">FINANÇAS</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${financeBalanceWeek >= 0 ? (isDark ? 'text-emerald-400 border-emerald-450/20 bg-emerald-450/5' : 'text-emerald-600 border-emerald-200 bg-emerald-50') : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                {financeBalanceWeek >= 0 ? 'Lucrativo' : 'Déficit'}
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Caixa Atual:</span>
                <span className="font-mono font-semibold">$ {rawPlayerTeam.budget.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Folha Semanal:</span>
                <span className="font-mono text-red-400">-$ {totalSalaries.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Patrocínios /sem:</span>
                <span className="font-mono text-emerald-400">+$ {sponsorsIncome.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Projeção:</span>
              <span className="font-bold">{projectionTrend}</span>
            </div>
          </div>

          {/* Card 2: Marketing */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black tracking-wider uppercase">MARKETING</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${rawPlayerTeam.popularity >= 70 ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                Engajado
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Marca Estimada:</span>
                <span className="font-semibold">$ {(rawPlayerTeam.popularity * 14500).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Pop. Comercial:</span>
                <span className="font-bold">{rawPlayerTeam.popularity}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Apoio da Torcida:</span>
                <span className="font-bold">{rawPlayerTeam.fansSupport}%</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Campanha RP:</span>
              <span className="text-cyan-400 font-bold">+{(rawPlayerTeam.popularity / 12).toFixed(1)}% engajamento</span>
            </div>
          </div>

          {/* Card 3: Infraestrutura */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase">INFRAESTRUTURA</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${isDark ? 'text-[#00E5FF] border-[#00E5FF]/20 bg-[#00E5FF]/5' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                Nível {rawPlayerTeam.infrastructure?.gamingHouseLevel || 1}
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Gaming House:</span>
                <span className="font-bold">Nível {rawPlayerTeam.infrastructure?.gamingHouseLevel || 1} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Training Center:</span>
                <span className="font-bold">Nível {rawPlayerTeam.infrastructure?.trainingCenterLevel || 1} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Setor de Mídia:</span>
                <span className="font-bold">Nível {rawPlayerTeam.infrastructure?.mediaTeamLevel || 1} / 5</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Vistorias:</span>
              <span className="text-emerald-400 font-bold">Instalações em ordem</span>
            </div>
          </div>

          {/* Card 4: Esportivo */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ffd700]" />
                <span className="text-xs font-black tracking-wider uppercase">ESPORTIVO</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${rawPlayerTeam.wins >= rawPlayerTeam.losses ? (isDark ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-emerald-600 border-emerald-250 bg-emerald-50') : 'text-orange-400 border-orange-500/10'}`}>
                {rawPlayerTeam.wins}V - {rawPlayerTeam.losses}D
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Elenco Pro OVR:</span>
                <span className="font-bold">{Math.round(rawPlayerTeam.roster.reduce((acc, p) => acc + p.overallRating, 0) / (rawPlayerTeam.roster.length || 1))} Rating</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Vitórias / Derrotas:</span>
                <span className="font-bold">{rawPlayerTeam.wins} - {rawPlayerTeam.losses}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Sequência na Liga:</span>
                <span className={`font-mono font-black ${rawPlayerTeam.streak?.includes('W') ? 'text-emerald-400' : 'text-pink-400'}`}>{rawPlayerTeam.streak || 'N/A'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Status Líder:</span>
              <span className="text-indigo-400 font-bold">Foco no CBLOL Playoffs</span>
            </div>
          </div>

          {/* Card 5: Jurídico */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase">JURÍDICO</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${rawPlayerTeam.ffpNonComplianceWeeks ? 'text-red-400 border-red-500/20 bg-red-500/5 animate-pulse' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'}`}>
                {rawPlayerTeam.ffpNonComplianceWeeks ? 'Irregularidade' : 'Em Ordem'}
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Multas Ativas:</span>
                <span className="font-mono text-red-400">$ {totalReprobationsFines.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Status FFP:</span>
                <span className="font-bold">{rawPlayerTeam.ffpNonComplianceWeeks ? "Penalidade Pendente" : "Regularidade Total"}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Análise de Visto:</span>
                <span className="font-bold">{rawPlayerTeam.vistasAwaiting?.length || 0} Processos</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Cumplice FFP:</span>
              <span className="text-emerald-400 font-bold">Regulamentos Cumpridos</span>
            </div>
          </div>

          {/* Card 6: Scouting */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black tracking-wider uppercase">SCOUTING / BASE</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${academyCount > 0 ? 'text-cyan-400 border-cyan-450/20 bg-cyan-450/5' : 'text-slate-500 border-slate-800 bg-slate-900/10'}`}>
                Academy Ativo
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Atletas na Base:</span>
                <span className="font-semibold">{academyCount} cadastrados</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Rating Médio Base:</span>
                <span className="font-mono font-bold">{avgAcademyOvr} OVR</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Super Talentos (POT ≥ 83):</span>
                <span className="font-bold text-cyan-400">{topProspects} revelações</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Relatório:</span>
              <span className="font-bold text-cyan-400">{avgAcademyPot} Potencial Médio</span>
            </div>
          </div>

          {/* Card 7: Saúde */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-black tracking-wider uppercase">SAÚDE CLÍNICA</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${avgStamina >= 80 ? (isDark ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-emerald-600 border-emerald-200 bg-emerald-50') : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                {avgStamina >= 80 ? 'Estável' : 'Estresse Mod.'}
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Estamina Média:</span>
                <span className="font-bold text-emerald-400">{avgStamina}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Fadiga Acumulada:</span>
                <span className="font-bold text-amber-500">{fatiguePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Psicólogo Ativo:</span>
                <span className="font-semibold">{gameState.corporationStaffEmployees?.some(e => e.departamento === 'SAÚDE') ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Risco Burnout:</span>
              <span className={`font-bold ${avgStamina < 70 ? 'text-red-400' : 'text-emerald-400'}`}>{avgStamina < 70 ? 'Risco Ativo' : 'Baixo Risco'}</span>
            </div>
          </div>

          {/* Card 8: RH */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black tracking-wider uppercase">RECURSOS HUMANOS</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${avgMotivation >= 75 ? (isDark ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' : 'text-cyan-600 border-cyan-200 bg-cyan-50') : 'text-amber-500'}`}>
                Harmonia {avgChemistry}%
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Motivação do Elenco:</span>
                <span className="font-bold text-cyan-400">{avgMotivation}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Química Geral:</span>
                <span className="font-bold text-sky-400">{avgChemistry}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Comissão Técnica:</span>
                <span className="font-semibold">Foco nos Treinos</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Clima Geral:</span>
              <span className="font-bold text-cyan-400">{avgMotivation >= 75 ? 'Excelente' : 'Estável'}</span>
            </div>
          </div>

          {/* Card 9: Relações Públicas */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
            <div className="flex items-start justify-between pb-2 border-b border-slate-500/10">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black tracking-wider uppercase">RELAÇÕES PÚBLICAS</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${rawPlayerTeam.fansSupport >= 70 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-indigo-400'}`}>
                Ativo
              </span>
            </div>
            
            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Aprovação Popular:</span>
                <span className="font-bold text-cyan-450">{rawPlayerTeam.fansSupport}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Ingressos Arena:</span>
                <span className="font-bold">$ {rawPlayerTeam.ticketPrice || 35}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSubtitleClass}>Mídia & Redes:</span>
                <span className="font-semibold">Engajamento Alto</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-[10px] font-mono flex justify-between items-center ${isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
              <span className="font-sans font-bold">Feedback RP:</span>
              <span className="font-bold text-[#00E5FF]">Sentimento Positivo</span>
            </div>
          </div>

        </div>
      </div>

      {/* TIER 3: CAMADA INFERIOR (SUCESSÃO DE HISTÓRICOS E REGISTROS DE CARREIRA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Coluna 1: HISTÓRICO DE REPROVAÇÕES */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${cardBgClass}`}>
          <div>
            <div className="flex justify-between items-center mb-1 pb-2 border-b border-slate-500/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">HISTÓRICO DE REPROVAÇÕES</h3>
                <span className="text-[10px] text-slate-500">Atritos regulatórios e incidentes</span>
              </div>
              <span className="p-1 px-1.5 rounded bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20">
                {totalReprobationsCount} INFRAÇÕES
              </span>
            </div>

            {boardReprobations.length === 0 ? (
              <div className={`py-12 mt-4 text-center border border-dashed rounded-xl ${isDark ? 'border-slate-800/60' : 'border-slate-300'}`}>
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-cyan-400" />
                <p className="text-[11px] font-bold">Ficha de Compliance Limpa</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Nenhuma infração regulatória registrada!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mt-4 scrollbar-thin">
                {boardReprobations.slice().reverse().map((rep) => (
                  <div key={rep.id} className={`p-3 rounded-lg border text-[11px] leading-relaxed ${isDark ? 'bg-slate-950' : 'bg-slate-50'} ${borderClass}`}>
                    <div className="flex justify-between items-center font-bold text-[10px] mb-1">
                      <span className="font-extrabold uppercase text-amber-500 tracking-wider">
                        {rep.type} (Sem. {rep.week})
                      </span>
                      {rep.cost ? (
                        <span className="text-red-500 font-bold font-mono">-$ {rep.cost.toLocaleString('pt-BR')}</span>
                      ) : null}
                    </div>
                    <p className={textSecondaryClass}>{rep.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalReprobationsFines > 0 && (
            <div className={`pt-3 border-t mt-4 flex justify-between items-center text-xs font-mono font-bold ${textSecondaryClass} ${borderClass}`}>
              <span>TOTAL EM DEBÍTOS / MULTAS:</span>
              <span className="text-red-500">$ {totalReprobationsFines.toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Coluna 2: METAS DO ANO CORRENTE */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${cardBgClass}`}>
          <div>
            <div className="flex justify-between items-center mb-1 pb-2 border-b border-slate-500/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">METAS DO ANO CORRENTE</h3>
                <span className="text-[10px] text-slate-500">Condução de tarefas e split ativo</span>
              </div>
              <span className="p-1 px-1.5 rounded bg-cyan-450/10 text-cyan-450 text-[10px] font-black border border-cyan-450/20">
                {finishedGoalsCount}/{boardGoals.length} COMPLETAS
              </span>
            </div>

            {boardLegacy.filter(l => l.week <= gameState.week).length === 0 ? (
              <div className={`py-12 mt-4 text-center border border-dashed rounded-xl ${isDark ? 'border-slate-800/60' : 'border-slate-300'}`}>
                <Award className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                <p className="text-[11px] font-bold">Nenhum marco obtido</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Vistoria e relatórios estruturais pendentes.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mt-4 scrollbar-thin">
                {boardLegacy.filter(l => l.week <= gameState.week).map((leg) => (
                  <div key={leg.id} className={`p-3 rounded-lg border text-[11px] leading-relaxed ${isDark ? 'bg-slate-950' : 'bg-slate-50'} ${borderClass}`}>
                    <div className="flex items-center gap-1.5 text-cyan-450 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{leg.event}</span>
                    </div>
                    <p className={textSecondaryClass}>{leg.detail}</p>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-2 pt-2 border-t border-slate-500/10">
                      <span>Cat: {leg.category}</span>
                      <span>Sem. {leg.week}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: HISTÓRICO DA GERÊNCIA */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${cardBgClass}`}>
          <div>
            <div className="flex justify-between items-center mb-1 pb-2 border-b border-slate-500/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">HISTÓRICO DA GERÊNCIA</h3>
                <span className="text-[10px] text-slate-500">Registro acumulado do seu legado</span>
              </div>
              <span className={`p-1 px-1.5 rounded text-[10px] font-black border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                {rawPlayerTeam.wins} VITÓRIAS
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`p-4 rounded-xl space-y-2.5 ${innerCardBgClass}`}>
                <div className={`flex justify-between items-center pb-1.5 border-b border-slate-500/10 ${textSecondaryClass}`}>
                  <span>Campanha Geral (Split):</span>
                  <span className="font-bold">{rawPlayerTeam.wins}V - {rawPlayerTeam.losses}D</span>
                </div>

                <div className={`flex justify-between items-center pb-1.5 border-b border-slate-500/10 ${textSecondaryClass}`}>
                  <span>Score de Crédito Financeiro:</span>
                  <span className={`font-mono font-bold ${
                    (rawPlayerTeam.creditScore || 600) >= 700 ? 'text-emerald-400' :
                    (rawPlayerTeam.creditScore || 600) >= 400 ? 'text-cyan-400' : 'text-red-400'
                  }`}>
                    {rawPlayerTeam.creditScore || 650} / 1000
                  </span>
                </div>

                <div className={`flex justify-between items-center pb-1.5 border-b border-slate-500/10 ${textSecondaryClass}`}>
                  <span>Apoio Popular (Fãs):</span>
                  <span className="font-bold">{rawPlayerTeam.fansSupport}%</span>
                </div>

                <div className={`flex justify-between items-center ${textSecondaryClass}`}>
                  <span>Nível Geral de Instalações:</span>
                  <span className="text-[#00E5FF] font-bold">Nível {rawPlayerTeam.infrastructure?.gamingHouseLevel || 1}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border border-dashed text-[10.5px] leading-relaxed ${isDark ? 'border-slate-800 text-slate-400 bg-slate-950/20' : 'border-slate-300 text-slate-650 bg-slate-100/10'}`}>
                <span className={`font-extrabold block uppercase text-[8.5px] tracking-wider mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  📄 CERTIFICAÇÃO PROFISSIONAL:
                </span>
                Comprometimento fiscal regular de {rawPlayerTeam.roster.length} atletas titulares e {rawPlayerTeam.substitutes.length} suplentes sob as regras oficiais contratadas do CBLOL.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

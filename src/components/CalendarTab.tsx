/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Activity, Trophy, Users, 
  Clock, Shield, Award, AlertCircle, Sparkles, Check, Info, Flame, Zap
} from 'lucide-react';
import { GameState, Position, Team } from '../types';
import { getGameAssetUrl } from '../utils/gameAssets';

interface CalendarTabProps {
  gameState: GameState;
  theme?: string;
  selectedCalendarWeek?: number;
  setSelectedCalendarWeek?: (week: number) => void;
  onUpdateGameState?: (state: GameState) => void;
  onNavigate?: (tab: string) => void;
  setLigaInitialTab?: (tab: 'Torneios' | 'Classificação' | 'Calendário' | 'Regras' | 'Jogos' | undefined) => void;
}

type ActivityType = 'COMPETIÇÃO' | 'MEDIA DAY' | 'SCRIMS' | 'TREINOS' | 'DESCANSO';

interface DayActivity {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  details: string;
}

interface CalendarDay {
  dayNumber: number;
  isCurrentDay?: boolean;
  activities: DayActivity[];
}

export default function CalendarTab({ 
  gameState, 
  theme = 'dark',
  selectedCalendarWeek, 
  setSelectedCalendarWeek,
  onUpdateGameState,
  onNavigate,
  setLigaInitialTab
}: CalendarTabProps) {
  const { teams, week, calendarSchedule, playerTeamId } = gameState;
  const isDark = theme === 'dark';

  // Sub-tab logic to switch between Month Grid and Absolute Weeks History
  const [activeSubTab, setActiveSubTab] = useState<'MONTH' | 'TIMELINE'>('TIMELINE');

  // Precise mapping from calculated day/month to absolute game weeks (1 to dynamic maxWeeks)
  const maxWeeks = useMemo(() => {
    const keys = Object.keys(calendarSchedule).map(Number).filter(k => !isNaN(k));
    return keys.length > 0 ? Math.max(...keys) : 17;
  }, [calendarSchedule]);

  const getWeekFromDayAndMonth = (dayNum: number, monthIdx: number): number => {
    const currentDayVal = gameState.currentDay || (10 + (gameState.week * 2) % 19);
    const initialMonthIdx = typeof gameState.currentMonthIndex === 'number'
      ? (gameState.currentMonthIndex % 3)
      : (gameState.week <= 4 ? 0 : gameState.week <= 8 ? 1 : 2);
    
    // Day of currently active game week
    if (dayNum === currentDayVal && monthIdx === initialMonthIdx) {
      return gameState.week;
    }
    
    if (monthIdx === 0) { // Maio
      if (dayNum <= 6) return 1;
      if (dayNum <= 12) return 2;
      if (dayNum <= 18) return 3;
      if (dayNum <= 24) return 4;
      return 5;
    } else if (monthIdx === 1) { // Junho
      if (dayNum <= 6) return 6;
      if (dayNum <= 12) return 7;
      if (dayNum <= 18) return 8;
      if (dayNum <= 24) return 9;
      return 10;
    } else { // Julho
      if (maxWeeks <= 17) {
        if (dayNum <= 6) return 11;
        if (dayNum <= 12) return 12;
        if (dayNum <= 18) return 13;
        if (dayNum <= 24) return 14;
        if (dayNum <= 28) return 15;
        if (dayNum <= 30) return 16;
        return 17;
      } else {
        if (dayNum <= 3) return 11;
        if (dayNum <= 7) return 12;
        if (dayNum <= 11) return 13;
        if (dayNum <= 15) return 14;
        if (dayNum <= 18) return 15;
        if (dayNum <= 21) return 16;
        if (dayNum <= 24) return 17;
        if (dayNum <= 27) return 18;
        return 19;
      }
    }
  };

  // State to track selected filter activities
  const [filters, setFilters] = useState({
    competicao: true,
    mediaday: true,
    rotinabase: true // scrims, treinos & descanso
  });

  // Current month reference based on week selection
  const initialMonthIdx = typeof gameState.currentMonthIndex === 'number'
    ? (gameState.currentMonthIndex % 3)
    : (gameState.week <= 4 ? 0 : gameState.week <= 8 ? 1 : 2);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(initialMonthIdx);
  const months = [
    { name: "MAIO, 2026", startDayOfWeek: 4 }, // Seg=1, ... Qui=4. 31 days.
    { name: "JUNHO, 2026", startDayOfWeek: 0 }, // Seg=0. 30 days.
    { name: "JULHO, 2026", startDayOfWeek: 2 }  // Qua=2. 31 days.
  ];
  const currentMonth = months[selectedMonthIndex];

  // Selected calendar day number
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    return gameState.currentDay || (10 + (gameState.week * 2) % 19);
  });

  React.useEffect(() => {
    if (gameState.currentDay) {
      setSelectedDayNumber(gameState.currentDay);
    }
    if (typeof gameState.currentMonthIndex === 'number') {
      setSelectedMonthIndex(gameState.currentMonthIndex % 3);
    }
  }, [gameState.currentDay, gameState.currentMonthIndex]);

  const handleSetMonthIndex = (newIdx: number) => {
    setSelectedMonthIndex(newIdx);
    if (onUpdateGameState) {
      onUpdateGameState({
        ...gameState,
        currentMonthIndex: newIdx
      });
    }
  };

  const playerTeam = teams.find(t => t.id === playerTeamId) || teams[0];
  const opponentMatch = calendarSchedule[week]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
  const nextOpponentId = opponentMatch 
    ? (opponentMatch.teamBlueId === playerTeamId ? opponentMatch.teamRedId : opponentMatch.teamBlueId)
    : teams.find(t => t.id !== playerTeamId)?.id || '';
  const opponentTeam = teams.find(t => t.id === nextOpponentId) || teams[1];

  // Helper calculating projected FFP compliance deadline based on simulated 24 weeks limit
  const getFutureFFPDeadlineDate = (currentDay: number, currentMonthIndex: number, remainingWeeks: number) => {
    let day = currentDay;
    let mIdx = currentMonthIndex;
    let daysToAdd = remainingWeeks * 7;
    const monthLengths = [31, 30, 31, 31, 30, 31, 30, 31];
    
    while (daysToAdd > 0) {
      const currentMonthMax = monthLengths[mIdx % monthLengths.length] || 30;
      const daysLeftInMonth = currentMonthMax - day;
      if (daysToAdd <= daysLeftInMonth) {
        day += daysToAdd;
        daysToAdd = 0;
      } else {
        daysToAdd -= (daysLeftInMonth + 1);
        day = 1;
        mIdx++;
      }
    }
    const monthNames = [
      "MAIO, 2026", "JUNHO, 2026", "JULHO, 2026", "AGOSTO, 2026", 
      "SETEMBRO, 2026", "OUTUBRO, 2026", "NOVEMBRO, 2026", "DEZEMBRO, 2026"
    ];
    return {
      day,
      monthName: monthNames[mIdx % monthNames.length] || "FUTURO, 2026",
      monthIdx: mIdx
    };
  };

  const ffpNonComplianceWeeks = (playerTeam as any).ffpNonComplianceWeeks || 0;
  const isFFPViolationActive = ffpNonComplianceWeeks > 0;
  const FFPWeeksRemaining = isFFPViolationActive ? (24 - ffpNonComplianceWeeks) : 24;

  const deadlineInfo = useMemo(() => {
    if (!isFFPViolationActive) return null;
    const currentDayVal = gameState.currentDay || 10;
    const currentMonthIdx = typeof gameState.currentMonthIndex === 'number' ? gameState.currentMonthIndex : 0;
    return getFutureFFPDeadlineDate(currentDayVal, currentMonthIdx, FFPWeeksRemaining);
  }, [gameState.currentDay, gameState.currentMonthIndex, FFPWeeksRemaining, isFFPViolationActive]);

  // Helper lists of activities generator
  const getActivitiesForDay = (dayNum: number, dayOfWeekIndex: number): DayActivity[] => {
    const activeRegion = playerTeam.region || 'CBLOL';
    const academyLeagueName = activeRegion === 'CBLOL' ? 'DESAFIANTE' : `Youth Academy ${activeRegion}`;
    
    const key = `${selectedMonthIndex}-${dayNum}`;
    const customGHActs = (gameState as any).gamingHouseActivities?.[key];

    const acts: DayActivity[] = [];

    // FFP Critical Sanction Deadline projecter
    if (deadlineInfo && selectedMonthIndex === (deadlineInfo.monthIdx % 3) && dayNum === deadlineInfo.day) {
      acts.push({
        id: `ffp-deadline-${dayNum}`,
        type: 'COMPETIÇÃO',
        title: '⚠️ [ EXCESSO DE INADIMPLÊNCIA: LIMITE FFP ]',
        time: 'Toda Semana',
        details: `AVISO DE SPORTING PENALTY (-3 PONTOS): Sua organização completará 24 semanas consecutivas fora de conformidade do FFP. Evite a perda imediata salvando saldo de caixa, amortizando empréstimos e cortando folha excedente!`
      });
    }

    // Biweekly Compliance Audit Marker (day 15 & day 30 each month)
    if (dayNum === 15 || dayNum === 30) {
      acts.push({
        id: `audit-${selectedMonthIndex}-${dayNum}`,
        type: 'COMPETIÇÃO',
        title: '🚨 [ AUDITORIA RIOT compliance ]',
        time: 'Fim do Dia',
        details: 'Fim do ciclo de conformidade quinzenal (15 dias simulados). Auditoria ativa e varredura de Teto Salarial ($120.000) e fluxo do Split.'
      });
    }

    // Prioritize or overlay custom-scheduled operational activities from Gaming House in real-time
    if (customGHActs && customGHActs.length > 0) {
      customGHActs.forEach((act: any) => {
        acts.push({
          id: act.id,
          type: act.type,
          title: act.title,
          time: act.time,
          details: act.details
        });
      });
    }

    // Weekend (Fri - Sat) competition matches: Dual-Channel with Academy integration
    if (dayOfWeekIndex === 4 || dayOfWeekIndex === 5) {
      let weekForThisDay = getWeekFromDayAndMonth(dayNum, selectedMonthIndex);
      const currentDayVal = gameState.currentDay || (10 + (gameState.week * 2) % 19);
      const isActuallyCurrentDay = dayNum === currentDayVal && selectedMonthIndex === initialMonthIdx;
      if (isActuallyCurrentDay) {
        weekForThisDay = gameState.week;
      }
      
      let dayOpponentMatch = calendarSchedule[weekForThisDay]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
      const currentWeekMatch = calendarSchedule[gameState.week]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
      if (isActuallyCurrentDay && currentWeekMatch) {
        dayOpponentMatch = currentWeekMatch;
      }
      
      if (dayOpponentMatch) {
        const dayOpponentId = dayOpponentMatch.teamBlueId === playerTeamId ? dayOpponentMatch.teamRedId : dayOpponentMatch.teamBlueId;
        const dayOpponentTeam = teams.find(t => t.id === dayOpponentId) || opponentTeam;
        
        const matchFormat = (dayOpponentMatch?.stage && dayOpponentMatch.stage !== 'REGULAR' && dayOpponentMatch.stage !== 'WORLDS_SWISS') || weekForThisDay >= 16 ? 'MD5' : 'MD3';

        const cleanAcademyName = (name: string) => {
          return name.replace(/\s*Gaming\s*$/i, '').replace(/\s*Esports\s*$/i, '').replace(/\s*Canids\s*$/i, '').trim() + ' Academy';
        };

        const mainTitle = `${activeRegion} - ${playerTeam.name} VS ${dayOpponentTeam.name} - ${matchFormat}`;

        let academyTitle = '';
        if (activeRegion === 'CBLOL') {
          academyTitle = `DESAFIANTE CBLOL - ${cleanAcademyName(playerTeam.name)} VS ${cleanAcademyName(dayOpponentTeam.name)} - ${matchFormat}`;
        } else {
          academyTitle = `Youth ${activeRegion} - ${cleanAcademyName(playerTeam.name)} VS ${dayOpponentTeam.acronym}A - ${matchFormat}`;
        }
        
        // Main team duel channel
        if (dayOfWeekIndex === 5) {
          acts.push({
            id: `comp-${dayNum}`,
            type: 'COMPETIÇÃO',
            title: mainTitle,
            time: '13:00 - 18:00',
            details: 'Partida Oficial - Elenco Principal. Confronto oficial válido para a tabela regular do Split.'
          });
        }

        // Academy team duel channel
        if (dayOfWeekIndex === 4) {
          acts.push({
            id: `comp-academy-${dayNum}`,
            type: 'COMPETIÇÃO',
            title: academyTitle,
            time: '18:30 - 21:00',
            details: 'Partida Oficial - Youth Academy. Confronto válido pelo calendário de base para mitigar burnout.'
          });
        }
      } else if (!customGHActs || customGHActs.length === 0) {
        acts.push({
          id: `offseason-${dayNum}`,
          type: 'DESCANSO',
          title: 'Folga Semanal / Offseason',
          time: 'Dia Inteiro',
          details: 'Nenhum confronto oficial agendado para este dia no calendário competitivo.'
        });
      }
    } else if (!customGHActs || customGHActs.length === 0) {
      // Show baseline schedules only if not overridden by custom operational activities
      if (dayOfWeekIndex >= 0 && dayOfWeekIndex <= 2) {
        // Mon - Wed
        acts.push({
          id: `treino-${dayNum}`,
          type: 'TREINOS',
          title: 'Análise de VODs & Mecânica',
          time: '09:00 - 12:00',
          details: 'Reunião tática com a comissão técnica para calibrar matchups e rotações de selva.'
        });
        acts.push({
          id: `scrim-${dayNum}`,
          type: 'SCRIMS',
          title: 'Block Prático de Scrim',
          time: '14:00 - 18:00',
          details: 'Simulação competitiva de confrontos diretos contra elencos qualificados da elite.'
        });
      } else if (dayOfWeekIndex === 3) {
        // Thurs
        acts.push({
          id: `media-${dayNum}`,
          type: 'MEDIA DAY',
          title: 'Sessão Oficial Mídia / Presença',
          time: '11:00 - 16:00',
          details: 'Ensaios fotográficos da organização, gravações de patrocinadores e entrevistas exclusivas.'
        });
      } else if (dayOfWeekIndex === 6) {
        // Sun
        acts.push({
          id: `desc-${dayNum}`,
          type: 'DESCANSO',
          title: 'Folga Médica & Reset Mental',
          time: 'Dia Inteiro',
          details: 'Recuperação de fadiga tática e burnout tático. Lazer livre dos ciberatletas.'
        });
      }
    }

    return acts;
  };

  // Generate complete structure of calendar days
  const calendarDaysList: CalendarDay[] = useMemo(() => {
    const daysInMonth = selectedMonthIndex === 1 ? 30 : 31;
    const list: CalendarDay[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      // determine weekday based on starting offset
      const weekdayIdx = (currentMonth.startDayOfWeek + (d - 1)) % 7;
      const allActs = getActivitiesForDay(d, weekdayIdx);

      // Filter activities based on toggle selections
      const filteredActs = allActs.filter(act => {
        if (act.type === 'COMPETIÇÃO') return filters.competicao;
        if (act.type === 'MEDIA DAY') return filters.mediaday;
        return filters.rotinabase; // Scrims, Treinos, Descanso
      });

      const currentDayVal = gameState.currentDay || (10 + (gameState.week * 2) % 19);
      list.push({
        dayNumber: d,
        isCurrentDay: d === currentDayVal, // Destaque para o dia atual no meio do mês
        activities: filteredActs
      });
    }

    return list;
  }, [selectedMonthIndex, filters, opponentTeam]);

  // Dynamic status estimations helper
  const statusEstimations = useMemo(() => {
    let trainingCount = 0;
    let scrimCount = 0;
    let restCount = 0;
    let mediaCount = 0;
    let compCount = 0;

    calendarDaysList.forEach(day => {
      day.activities.forEach(act => {
        if (act.type === 'TREINOS') trainingCount++;
        if (act.type === 'SCRIMS') scrimCount++;
        if (act.type === 'DESCANSO') restCount++;
        if (act.type === 'MEDIA DAY') mediaCount++;
        if (act.type === 'COMPETIÇÃO') compCount++;
      });
    });

    // Entrosamento: aumenta com treinos e scrims
    const entrosamentoBase = Math.min(98, 60 + (trainingCount * 1.5) + (scrimCount * 2.0));
    // Fadiga: aumenta com mídia e competição, diminui com descanso
    const estresseBase = Math.max(8, Math.min(95, 45 + (mediaCount * 3.5) + (compCount * 4) - (restCount * 5)));

    return {
      entrosamento: Math.round(entrosamentoBase),
      estresse: Math.round(estresseBase)
    };
  }, [calendarDaysList]);

  // Selected Day detailed info lookup
  const selectedDayInfo = useMemo(() => {
    return calendarDaysList.find(d => d.dayNumber === selectedDayNumber);
  }, [calendarDaysList, selectedDayNumber]);

  const getActivityColorClass = (type: ActivityType) => {
    switch (type) {
      case 'COMPETIÇÃO':
        return isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'MEDIA DAY':
        return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      case 'SCRIMS':
        return isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-750 border-cyan-250 font-bold';
      case 'TREINOS':
        return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#e2e8f0] text-[#1e293b] border-[#cbd5e1] font-extrabold';
      case 'DESCANSO':
        return isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0] font-extrabold';
    }
  };

  const getActivityIndicator = (type: ActivityType) => {
    switch (type) {
      case 'COMPETIÇÃO': return '🔴';
      case 'MEDIA DAY': return '🟣';
      case 'SCRIMS': return '🔵';
      case 'TREINOS': return '🟢';
      case 'DESCANSO': return '⚪';
    }
  };

  return (
    <div className={`p-1 select-none transition-colors duration-300 ${
      isDark ? 'text-white' : 'text-slate-800'
    }`}>
      
      {/* SEÇÃO A: BARRA DE CONTROLE SUPERIOR (HEADER) */}
      <div className={`border p-6 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
            <span className={`text-[10px] font-black tracking-widest uppercase ${isDark ? 'text-sky-400' : 'text-blue-600'}`}>
              Cronograma Semanal & Calendário de Rotna
            </span>
          </div>
          <h2 className={`text-lg font-display font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Planejamento e Cronograma da Organização
          </h2>
        </div>

        {/* Mnth Navigation controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSetMonthIndex(Math.max(0, selectedMonthIndex - 1))}
            disabled={selectedMonthIndex === 0}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedMonthIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : isDark 
                  ? 'bg-[#070d19] border-[#1e2d44] text-slate-350 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-[#0f172a] hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className={`px-5 py-2 rounded-xl text-center min-w-[140px] border font-display text-xs uppercase tracking-widest ${
            isDark 
              ? 'bg-[#070d19] border-[#1e2d44] font-black text-white' 
              : 'bg-white border-slate-250 text-[#0f172a] font-medium'
          }`}>
            {currentMonth.name}
          </div>

          <button
            onClick={() => handleSetMonthIndex(Math.min(months.length - 1, selectedMonthIndex + 1))}
            disabled={selectedMonthIndex === months.length - 1}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedMonthIndex === months.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : isDark 
                  ? 'bg-[#070d19] border-[#1e2d44] text-slate-350 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-[#0f172a] hover:bg-slate-50'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filtro rápido por tipo de atividade (Checkbox interativo) */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.competicao} 
              onChange={(e) => setFilters(f => ({ ...f, competicao: e.target.checked }))}
              className="rounded text-red-500 focus:ring-red-500 bg-slate-800 border-slate-700 w-4 h-4"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-red-400">🔴 Competição</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.mediaday} 
              onChange={(e) => setFilters(f => ({ ...f, mediaday: e.target.checked }))}
              className="rounded text-purple-500 focus:ring-purple-500 bg-slate-800 border-slate-700 w-4 h-4"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-purple-400">🟣 Mídia</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.rotinabase} 
              onChange={(e) => setFilters(f => ({ ...f, rotinabase: e.target.checked }))}
              className="rounded text-teal-500 focus:ring-teal-500 bg-slate-800 border-slate-700 w-4 h-4"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-teal-400">🔵 Rotina Base</span>
          </label>
        </div>
      </div>
      <div className={`p-5 rounded-2xl mb-6 border transition-all ${
        isFFPViolationActive 
          ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.07)]' 
          : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isFFPViolationActive ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350">
                Monitor de Conformidade Financeira (Fair-Play Financeiro & Auditoria)
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isFFPViolationActive 
                ? `⚠️ ESTADO DE INADIMPLÊNCIA ATIVO: Sua organização ultrapassou o teto salarial de $120.000 ou possui parcelas faltantes de empréstimo. Você está sob notificação há ${ffpNonComplianceWeeks} semanas consecutivas.`
                : '✅ ORGANIZAÇÃO EM DIA (COMPLIANT): Sua folha de pagamentos, amortizações e caixa estão abaixo dos limites estatutários da Riot Games. Nenhuma punição esportiva ativa.'
              }
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            {isFFPViolationActive ? (
              <div className="text-right">
                <span className="text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/35 px-2.5 py-1 rounded tracking-widest animate-pulse inline-block">
                  🚨 {FFPWeeksRemaining} Semanas de Carência
                </span>
                {deadlineInfo && (
                  <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase leading-none">
                    Punição de Ponto (-3 Pts) em: {deadlineInfo.day} de {deadlineInfo.monthName.split(',')[0]}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-1 rounded tracking-widest inline-block">
                🎉 Totalmente Regularizado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SELETOR DE MODO DE VISUALIZAÇÃO DO CALENDÁRIO */}
      <div className="flex gap-2.5 mb-6 select-none leading-none">
        <button
          onClick={() => setActiveSubTab('TIMELINE')}
          className={`px-4 py-2.5 rounded-xl border font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'TIMELINE'
              ? 'bg-[#00cbd6]/10 border-[#00cbd6] text-[#00cbd6] shadow-[0_0_15px_rgba(0,203,214,0.08)]'
              : isDark
                ? 'bg-slate-900/40 border-[#1e2d44] text-slate-400 hover:text-white hover:bg-slate-800/40'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-100/50'
          }`}
        >
          🏆 Histórico Absoluto do Campeonato (Semana 1 - {maxWeeks})
        </button>
        <button
          onClick={() => setActiveSubTab('MONTH')}
          className={`px-4 py-2.5 rounded-xl border font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'MONTH'
              ? 'bg-[#1A5CFF]/10 border-[#1A5CFF] text-[#1A5CFF] shadow-[0_0_15px_rgba(26,92,255,0.08)]'
              : isDark
                ? 'bg-slate-900/40 border-[#1e2d44] text-slate-400 hover:text-white hover:bg-slate-800/40'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-100/50'
          }`}
        >
          📅 Grade de Atividades Táticas (Nível Mensal)
        </button>
      </div>

      {/* CONTEÚDO CONDICIONAL DAS SUB-ABAS */}
      {activeSubTab === 'TIMELINE' ? (
        <div className="space-y-4 animate-slide-in">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0a1424] border-[#1e2d44] text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'} text-xs font-bold leading-relaxed flex items-center gap-2 mb-2`}>
            <Award className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Abaixo está o cronograma absoluto contendo todos os confrontos da sua organização em cada semana do Split competitivo.</span>
          </div>
          
          {(() => {
            // Acha a primeira semana a partir da semana atual em que o jogo ainda não terminou
            let nextFixtureWeek = gameState.week;
            for (let wk = gameState.week; wk <= maxWeeks; wk++) {
              const userMatch = calendarSchedule[wk]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
              if (userMatch && !userMatch.isFinished) {
                nextFixtureWeek = wk;
                break;
              }
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: maxWeeks }).map((_, i) => {
                  const wk = i + 1;
                  const isCurrentWeek = wk === gameState.week;
                  const isNextMatch = wk === nextFixtureWeek;
                  const userMatch = calendarSchedule[wk]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
                  
                  const opponentId = userMatch
                    ? (userMatch.teamBlueId === playerTeamId ? userMatch.teamRedId : userMatch.teamBlueId)
                    : undefined;
                  const opponent = opponentId ? teams.find(t => t.id === opponentId) : undefined;
                  
                  const teamBlueObj = userMatch ? teams.find(t => t.id === userMatch.teamBlueId) : playerTeam;
                  const teamRedObj = userMatch ? teams.find(t => t.id === userMatch.teamRedId) : opponent;
                  
                  const getLogo = (t: Team | undefined) => {
                    if (!t) return '/default-escudo.png';
                    const customLogo = getGameAssetUrl('teams', t.id, t.logoUrl);
                    if (customLogo && customLogo !== '/assets/ui/fallback-silhouette.png' && customLogo !== '/perfil-default.jpeg') {
                      return customLogo;
                    }
                    if (t.logoUrl) return t.logoUrl;
                    const activeRegion = playerTeam?.region || 'CBLOL';
                    if (t.id.endsWith('-academy')) {
                      return `/escudos/${activeRegion === 'CBLOL' ? 'cblol-academy' : 'lcs-academy'}/${t.acronym.toLowerCase()}.png`;
                    }
                    return `/escudos/${activeRegion === 'CBLOL' ? 'cblol-main' : 'lcs-main'}/${t.acronym.toLowerCase()}.png`;
                  };

                  // Assist de fallback caso imagem falhe ou não exista
                  const dbTeamLogoWithAcademyInheritanceHelper = (team: any, activeDb: any) => {
                    const custom = getGameAssetUrl('teams', team.id, team.logoUrl);
                    if (custom && custom !== '/assets/ui/fallback-silhouette.png') return custom;
                    if (team.logoUrl) return team.logoUrl;
                    if (team.logo) return team.logo;
                    if (team.isAcademy && !team.logo && !team.logoUrl && team.parentId) {
                      const parent = activeDb?.teams?.find((tp: any) => tp.id === team.parentId);
                      if (parent) {
                        const parentCustom = getGameAssetUrl('teams', parent.id, parent.logoUrl);
                        return parentCustom || parent.logoUrl || parent.logo || null;
                      }
                    }
                    return null;
                  };

                  const isFinished = userMatch?.isFinished || false;
                  
                  let resultBadge = null;
                  let userScore = 0;
                  let oppScore = 0;
                  
                  if (userMatch) {
                    userScore = userMatch.teamBlueId === playerTeamId ? userMatch.scoreBlue : userMatch.scoreRed;
                    oppScore = userMatch.teamBlueId === playerTeamId ? userMatch.scoreRed : userMatch.scoreBlue;
                  }
                  
                  if (isFinished) {
                    const hasWon = userScore > oppScore;
                    resultBadge = hasWon ? (
                      <span className="px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        Vitória ({userScore} - {oppScore})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
                        Derrota ({userScore} - {oppScore})
                      </span>
                    );
                  } else {
                    resultBadge = (
                      <span className="px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-slate-500/10 border border-slate-750 text-slate-400">
                        Agendado
                      </span>
                    );
                  }

                  const activeRegion = playerTeam?.region || 'CBLOL';

                  return (
                    <div 
                      key={wk}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentWeek 
                          ? 'current-week-card' 
                          : isDark 
                            ? 'bg-[#0a1424] border-[#1e2d44] hover:bg-[#0c1a30]/60' 
                            : 'bg-white border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                            isCurrentWeek 
                              ? 'bg-sky-500/10 text-sky-450 border border-sky-400/20' 
                              : isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-700'
                          }`}>
                            Semana {wk}
                          </span>
                          
                          {isCurrentWeek && (
                            <span className="text-[9px] font-black tracking-widest text-[#00E5FF] uppercase animate-pulse border border-[#00cbd6]/20 px-1.5 py-0.5 rounded bg-cyan-950/20">
                              ⚡ Atual
                            </span>
                          )}
                          
                          {isNextMatch && (
                            <span className="text-[9px] font-black tracking-widest text-emerald-450 uppercase border border-emerald-500/20 px-1.5 py-0.5 rounded bg-emerald-950/20 flex items-center gap-1">
                              🔥 Próximo Confronto
                            </span>
                          )}
                        </div>
                        {resultBadge}
                      </div>

                      {userMatch ? (
                        <div className="flex items-center justify-between gap-2.5 py-2">
                          {/* Player Team */}
                          <div className="flex items-center gap-2 w-[42%] min-w-0">
                            <img 
                              src={getLogo(playerTeam)} 
                              alt={playerTeam.name} 
                              className={`w-7 h-7 object-contain rounded p-0.5 shrink-0 ${isDark ? 'bg-slate-900 border border-white/5' : 'bg-slate-100 border border-slate-250'}`}
                              onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-logo.png'; }}
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className={`text-xs font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{playerTeam.name}</p>
                              <p className="text-[9px] font-mono text-gray-500 uppercase">{playerTeam.acronym}</p>
                            </div>
                          </div>

                          {/* VS Indicator */}
                          <div className="text-center shrink-0 w-[16%]">
                            <span className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">VS</span>
                            <span className="text-[8px] font-bold text-gray-500 font-mono">
                              {userMatch.stage === 'REGULAR' || wk < 16 ? 'MD3' : 'MD5'}
                            </span>
                          </div>

                          {/* Opponent Team */}
                          <div className="flex items-center gap-2 justify-end w-[42%] min-w-0 text-right">
                            <div className="min-w-0">
                              <p className={`text-xs font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {opponent ? opponent.name : 'SHF'}
                              </p>
                              <p className="text-[9px] font-mono text-gray-500 uppercase">
                                {opponent ? opponent.acronym : 'SHF'}
                              </p>
                            </div>
                            <img 
                              src={getLogo(opponent || teams[1])} 
                              alt={opponent ? opponent.name : 'SHF'} 
                              className={`w-7 h-7 object-contain rounded p-0.5 shrink-0 ${isDark ? 'bg-slate-900 border border-white/5' : 'bg-slate-100 border border-slate-250'}`}
                              onError={(e) => { e.currentTarget.src = 'assets/ui/fallback-logo.png'; }}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl text-[10px] text-slate-500 uppercase font-black">
                          Nenhum jogo programado para a semana {wk}
                        </div>
                      )}

                      <div className={`mt-2 pt-2 border-t flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider">
                          Etapa: {userMatch?.stage || 'Fase Regular'}
                        </span>
                        
                        {userMatch && (
                          <button 
                            onClick={() => {
                              if (onNavigate) {
                                if (setLigaInitialTab) {
                                  setLigaInitialTab('Jogos');
                                }
                                onNavigate('Liga');
                              }
                            }}
                            className={`text-[8.5px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors ${
                              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <span>Central de Jogos ↗</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SEÇÃO B: GRADE PRINCIPAL DO CALENDÁRIO */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Weekday indicator labels */}
            <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black tracking-widest uppercase text-slate-400 pb-1">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
    
            <div className="grid grid-cols-7 gap-2.5">
              {/* Pad dynamic empty day spacers based on starting month offset */}
              {Array.from({ length: currentMonth.startDayOfWeek }).map((_, idx) => (
                 <div 
                   key={`empty-${idx}`} 
                   className={`aspect-square rounded-xl opacity-20 border border-dashed ${
                     isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-slate-200/40 border-slate-350'
                   }`}
                 />
               ))}
    
               {/* Render concrete month calendar days list grid pattern */}
               {calendarDaysList.map(day => {
                 const acts = day.activities;
                 const hasEvents = acts.length > 0;
                 const isSelected = selectedDayNumber === day.dayNumber;
                 
                 const isAuditDay = day.dayNumber === 15 || day.dayNumber === 30;
                 const isFfpDeadlineDay = deadlineInfo && selectedMonthIndex === (deadlineInfo.monthIdx % 3) && day.dayNumber === deadlineInfo.day;
    
                 return (
                   <button
                     key={day.dayNumber}
                     onClick={() => {
                       setSelectedDayNumber(day.dayNumber);
                       if (onUpdateGameState) {
                         onUpdateGameState({
                           ...gameState,
                           currentDay: day.dayNumber,
                           currentMonthIndex: selectedMonthIndex
                         });
                       }
                     }}
                     className={`aspect-square p-2 rounded-xl flex flex-col justify-between border relative transition-all group overflow-hidden ${
                       isFfpDeadlineDay
                         ? 'border-red-650 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.45)] border-2 animate-pulse font-black'
                         : day.isCurrentDay 
                           ? 'border-sky-400 bg-sky-500/5 shadow-[0_0_12px_rgba(56,189,248,0.2)] font-black' 
                           : isSelected
                             ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500'
                             : isAuditDay
                               ? 'border-amber-500/55 bg-amber-500/5 hover:border-amber-500 text-amber-400'
                               : isDark
                                 ? 'bg-[#0a1424]/80 border-[#1e2d44] hover:border-sky-500/45'
                                 : 'bg-[#f1f5f9] border-[#e2e8f0] hover:bg-[#e2e8f0] text-[#1e293b]'
                     }`}
                     title={isFfpDeadlineDay ? 'LIMITE EXTREMO DE INADIMPLÊNCIA FFP!' : isAuditDay ? 'Auditoria Oficial Regulamentar Riot Games' : undefined}
                   >
                     {/* Número do dia posicionado de forma sutil no de cima à direita */}
                     <span className={`text-[11px] font-black block text-right w-full absolute top-2 right-2.5 opacity-60 ${
                       isFfpDeadlineDay 
                         ? 'text-red-400' 
                         : isAuditDay 
                           ? 'text-amber-400' 
                           : day.isCurrentDay 
                             ? 'text-sky-400' 
                             : isDark ? 'text-gray-400' : 'text-[#1e293b]'
                     }`}>
                       {day.dayNumber}
                     </span>
    
                     {day.isCurrentDay && (
                       <span className="absolute top-2 left-2.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                     )}
                     {isFfpDeadlineDay && (
                       <span className="absolute top-2 left-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                     )}
                     {isAuditDay && !day.isCurrentDay && !isFfpDeadlineDay && (
                       <span className="absolute top-2 left-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                     )}
    
                     {/* Espaço empilhado para mini-cards ou marcadores de atividades */}
                     <div className="w-full flex flex-col gap-1 mt-6 h-full justify-end">
                       {hasEvents ? acts.slice(0, 3).map((act, index) => {
                         const isRiotAudit = act.title.includes('AUDITORIA');
                         const isFfpCrit = act.title.includes('EXCESSO');
                         const pillColorClass = isFfpCrit 
                           ? 'bg-red-900/30 text-red-400 border-red-500/50 font-black animate-pulse'
                           : isRiotAudit
                             ? 'bg-amber-900/20 text-amber-405 border-amber-500/30'
                             : getActivityColorClass(act.type);
                         
                         return (
                           <div 
                             key={index} 
                             className={`text-[8.5px] font-bold py-0.5 px-1.5 rounded border truncate text-left tracking-wide leading-none ${pillColorClass}`}
                           >
                             <span className="mr-0.5">{isFfpCrit ? '🚨' : isRiotAudit ? '⚖️' : getActivityIndicator(act.type)}</span>
                             {isFfpCrit ? 'RISCO FFP' : isRiotAudit ? 'AUDITORIA' : act.type}
                           </div>
                         );
                       }) : (
                         <span className="text-[7.5px] text-gray-500 uppercase tracking-widest text-center py-2 font-bold w-full">Filtro Ativo</span>
                       )}
                     </div>
                   </button>
                 );
              })}
            </div>
          </div>
  
          {/* SEÇÃO C: PAINEL LATERAL DE DETALHES (SIDEBAR DIREITA) */}
          <div className="lg:col-span-4 h-full flex flex-col gap-6">
            
            {/* Detailed Agenda Panel of Select card */}
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col h-[340px] justify-between ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className={`w-4 h-4 ${isDark ? 'text-[#00d2fd]' : 'text-blue-600'}`} />
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-[#00d2fd]' : 'text-blue-600'}`}>
                    Foco do Dia Selecionado: Dia {selectedDayNumber}
                  </h4>
                </div>
  
                {selectedDayInfo && selectedDayInfo.activities.length > 0 ? (
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {selectedDayInfo.activities.map((act, idx) => {
                      const isCompGame = act.type === 'COMPETIÇÃO' && (act.id.startsWith('comp-') || act.id.startsWith('comp-academy-'));
                      
                      const handleSelectGameActivity = () => {
                        if (isCompGame && onNavigate) {
                          if (setLigaInitialTab) {
                            setLigaInitialTab('Jogos');
                          }
                          onNavigate('Liga');
                        }
                      };
  
                      return (
                        <div 
                          key={idx} 
                          onClick={handleSelectGameActivity}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCompGame
                              ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10'
                              : ''
                          } ${
                            isDark ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.5 border rounded uppercase ${getActivityColorClass(act.type)}`}>
                              {act.type}
                            </span>
                            <span className="text-[9px] font-extrabold text-gray-400 font-mono">
                              {act.time}
                            </span>
                          </div>
                          <h5 className={`text-xs font-black uppercase tracking-wide leading-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                            {act.title}
                          </h5>
                          <p className={`text-[10px] leading-snug font-semibold mt-1.5 opacity-90 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            {act.details}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[180px] border border-dashed border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xl mb-2">📅</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Inexistência de Atividades ou Filtros Ativos para Exclusão
                    </p>
                  </div>
                )}
              </div>
  
              <div className={`border-t pt-3 flex items-center gap-2.5 text-[9.5px] font-bold ${isDark ? 'border-[#1e2d44] text-gray-500' : 'border-slate-150 text-slate-400'}`}>
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Clique em qualquer dia do grid mensal para ver as sessões detalhadas na sidebar!</span>
              </div>
            </div>
  
            {/* Barra de progresso ou medidores de status da equipe */}
            <div className={`p-6 rounded-2xl border shadow-sm ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Estimativas de Performance da Organização
              </h4>
  
              {/* Entrosamento Bar progress */}
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold uppercase">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Users className="w-3.5 h-3.5 text-emerald-400 scale-102" />
                    Nível de Entrosamento
                  </span>
                  <span className="text-emerald-400 font-extrabold">{statusEstimations.entrosamento}%</span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${statusEstimations.entrosamento}%` }}
                  />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500 mt-1 block leading-none">
                  Aumentado através de blocks de Scrims práticos e Treinos de selva.
                </span>
              </div>
  
              {/* Estresse/Fadiga Bar progress */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold uppercase">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    Nível de Estresse / Fadiga
                  </span>
                  <span className="text-rose-400 font-extrabold">{statusEstimations.estresse}%</span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${statusEstimations.estresse}%` }}
                  />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500 mt-1 block leading-none">
                  Aumenta bruscamente em dias de Competição e Mídias, diminui com Descanso.
                </span>
              </div>
  
            </div>
  
          </div>
  
        </div>
      )}

    </div>
  );
}

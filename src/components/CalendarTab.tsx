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

interface CalendarTabProps {
  gameState: GameState;
  theme?: string;
  selectedCalendarWeek?: number;
  setSelectedCalendarWeek?: (week: number) => void;
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
  setSelectedCalendarWeek 
}: CalendarTabProps) {
  const { teams, week, calendarSchedule, playerTeamId } = gameState;
  const isDark = theme === 'dark';

  // State to track selected filter activities
  const [filters, setFilters] = useState({
    competicao: true,
    mediaday: true,
    rotinabase: true // scrims, treinos & descanso
  });

  // Current month reference based on week selection
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const months = [
    { name: "MAIO, 2026", startDayOfWeek: 4 }, // Seg=1, ... Qui=4. 31 days.
    { name: "JUNHO, 2026", startDayOfWeek: 0 }, // Seg=0. 30 days.
    { name: "JULHO, 2026", startDayOfWeek: 2 }  // Qua=2. 31 days.
  ];
  const currentMonth = months[selectedMonthIndex];

  // Selected calendar day number
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(15);

  const playerTeam = teams.find(t => t.id === playerTeamId) || teams[0];
  const opponentMatch = calendarSchedule[week]?.find(m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId);
  const nextOpponentId = opponentMatch 
    ? (opponentMatch.teamBlueId === playerTeamId ? opponentMatch.teamRedId : opponentMatch.teamBlueId)
    : teams.find(t => t.id !== playerTeamId)?.id || '';
  const opponentTeam = teams.find(t => t.id === nextOpponentId) || teams[1];

  // Helper lists of activities generator
  const getActivitiesForDay = (dayNum: number, dayOfWeekIndex: number): DayActivity[] => {
    // dayOfWeekIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    const acts: DayActivity[] = [];
    
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
    } else if (dayOfWeekIndex === 4 || dayOfWeekIndex === 5) {
      // Fri - Sat (Competición)
      const weekForThisDay = Math.min(17, Math.max(1, Math.floor(dayNum / 2) + 1));
      acts.push({
        id: `comp-${dayNum}`,
        type: 'COMPETIÇÃO',
        title: `CBLOL - R${weekForThisDay} - MD3 vs ${opponentTeam.acronym}`,
        time: '13:00 - 18:00',
        details: 'Partida oficial válida para o Split. Foco absoluto no palco e execução de macro.'
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

      list.push({
        dayNumber: d,
        isCurrentDay: d === 15, // Destaque para o dia atual arbitrário no meio do mês
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
        return isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200';
      case 'MEDIA DAY':
        return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'SCRIMS':
        return isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200';
      case 'TREINOS':
        return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-250';
      case 'DESCANSO':
        return isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-650 border-slate-200';
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
            onClick={() => setSelectedMonthIndex(i => Math.max(0, i - 1))}
            disabled={selectedMonthIndex === 0}
            className={`p-2.5 rounded-xl border transition-all ${
              selectedMonthIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : isDark ? 'bg-[#070d19] border-[#1e2d44] hover:bg-slate-800' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className={`px-5 py-2 rounded-xl text-center min-w-[140px] border font-display text-xs font-black uppercase tracking-widest ${
            isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-55 border-slate-250'
          }`}>
            {currentMonth.name}
          </div>

          <button
            onClick={() => setSelectedMonthIndex(i => Math.min(months.length - 1, i + 1))}
            disabled={selectedMonthIndex === months.length - 1}
            className={`p-2.5 rounded-xl border transition-all ${
              selectedMonthIndex === months.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : isDark ? 'bg-[#070d19] border-[#1e2d44] hover:bg-slate-800' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
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

              return (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`aspect-square p-2 rounded-xl flex flex-col justify-between border relative transition-all group overflow-hidden ${
                    day.isCurrentDay 
                      ? 'border-sky-400 bg-sky-500/5 shadow-[0_0_12px_rgba(56,189,248,0.2)] font-black' 
                      : isSelected
                        ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500'
                        : isDark
                          ? 'bg-[#0a1424]/80 border-[#1e2d44] hover:border-sky-500/45'
                          : 'bg-white border-slate-200 hover:border-blue-400 shadow-xs'
                  }`}
                >
                  {/* Número do dia posicionado de forma sutil no de cima à direita */}
                  <span className={`text-[11px] font-black block text-right w-full absolute top-2 right-2.5 opacity-60 ${
                    day.isCurrentDay ? 'text-sky-400' : isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>
                    {day.dayNumber}
                  </span>

                  {day.isCurrentDay && (
                    <span className="absolute top-2 left-2.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  )}

                  {/* Espaço empilhado para mini-cards ou marcadores de atividades */}
                  <div className="w-full flex flex-col gap-1 mt-6 h-full justify-end">
                    {hasEvents ? acts.slice(0, 3).map((act, index) => (
                      <div 
                        key={index} 
                        className={`text-[8.5px] font-bold py-0.5 px-1.5 rounded border truncate text-left tracking-wide leading-none ${getActivityColorClass(act.type)}`}
                      >
                        <span className="mr-0.5">{getActivityIndicator(act.type)}</span>
                        {act.type}
                      </div>
                    )) : (
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
                  {selectedDayInfo.activities.map((act, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border transition-all ${
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
                  ))}
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

    </div>
  );
}

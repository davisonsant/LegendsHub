/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Calendar, Trophy, Medal, ChevronRight } from 'lucide-react';
import { GameState, Team, MatchSeries } from '../types';

interface CalendarTabProps {
  gameState: GameState;
  theme?: string;
  selectedCalendarWeek?: number;
  setSelectedCalendarWeek?: (week: number) => void;
}

export default function CalendarTab({ gameState, selectedCalendarWeek, setSelectedCalendarWeek }: CalendarTabProps) {
  const { teams, week, calendarSchedule, selectedRegion } = gameState;
  const [localWeek, setLocalWeek] = useState(week);

  const currentSelectedWeek = selectedCalendarWeek !== undefined ? selectedCalendarWeek : localWeek;
  const changeSelectedWeek = setSelectedCalendarWeek !== undefined ? setSelectedCalendarWeek : setLocalWeek;

  // Filter teams list so we only display standings for the active region!
  const regionalTeams = teams.filter(t => t.region === (selectedRegion || 'CBLOL'));

  // Sorting teams correctly according to competitive standings rules:
  // 1. Wins (desc)
  // 2. Points/Tie-breaker (desc)
  // 3. GameWins - GameLosses delta (desc)
  const sortedLeaderboard = [...regionalTeams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const diffA = a.gameWins - a.gameLosses;
    const diffB = b.gameWins - b.gameLosses;
    return diffB - diffA;
  });

  const getTeamName = (tId: string) => {
    const t = teams.find(tm => tm.id === tId);
    return t ? t.name : 'Unknown Team';
  };

  const getTeamColor = (tId: string) => {
    const t = teams.find(tm => tm.id === tId);
    return t ? t.primaryColor : '#1e2d44';
  };

  const weekMatches = calendarSchedule[currentSelectedWeek] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Tabela de Classificação Standings (Span 7) */}
      <div className="lg:col-span-7 bg-[#0a1424] border border-[#1e2d44] rounded-xl overflow-hidden shadow-lg h-fit select-none">
        <div className="px-5 py-4 border-b border-[#1e2d44] bg-[#070d19] flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Trophy className="text-[#00d2fd] w-5 h-5" />
            <h3 className="font-display-lg text-sm font-bold uppercase tracking-wider text-white">Classificação Geral - {selectedRegion || 'CBLOL'}</h3>
          </div>
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Split Verão</span>
        </div>

        {/* Leaders header row */}
        <div className="grid grid-cols-12 gap-1 px-5 py-3 border-b border-[#1e2d44] text-[9px] text-[#00d2fd] font-display-lg font-black tracking-widest uppercase">
          <div className="col-span-1">#</div>
          <div className="col-span-5">ORGANIZAÇÃO</div>
          <div className="col-span-2 text-center">W - L</div>
          <div className="col-span-2 text-center">JOGOS</div>
          <div className="col-span-2 text-right">STREAK</div>
        </div>

        {/* Standing items */}
        <div className="divide-y divide-[#1e2d44]/50">
          {sortedLeaderboard.map((team, idx) => {
            const isUserTeam = team.id === gameState.playerTeamId;
            const rank = idx + 1;
            const playoffSlotCheck = rank <= 4; // top 4 qualify
            return (
              <div
                key={team.id}
                className={`grid grid-cols-12 gap-1 px-5 py-4 items-center transition-colors ${
                  isUserTeam ? 'bg-[#00d2fd]/5 border-l-4 border-[#00d2fd]' : 'hover:bg-[#070d19]/40'
                }`}
              >
                {/* rank placements indicator */}
                <div className="col-span-1 flex items-center font-display-lg text-xs leading-none">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                    playoffSlotCheck 
                      ? 'bg-blue-500/10 text-[#00d2fd] border border-[#00d2fd]/20' 
                      : 'bg-[#070d19] text-gray-500'
                  }`}>
                    {rank}
                  </span>
                </div>

                {/* Team brand and label */}
                <div className="col-span-5 flex items-center gap-3">
                  <div
                    className="w-1.5 h-6 rounded-sm bg-gray-500"
                    style={{ backgroundColor: team.primaryColor }}
                  />
                  <div>
                    <h4 className="font-display-lg text-xs font-bold text-white leading-tight uppercase flex items-center gap-1">
                      {team.name}
                      {isUserTeam && <span className="text-[7px] text-[#00d2fd] font-extrabold tracking-widest border border-[#00d2fd]/30 px-1 rounded uppercase">VOCÊ</span>}
                    </h4>
                    <p className="text-[9px] text-gray-500 font-semibold mt-0.5">{team.acronym} Club</p>
                  </div>
                </div>

                {/* Match Wins/Losses ratios */}
                <div className="col-span-2 text-center font-display-lg text-sm font-black text-white">
                  {team.wins} - {team.losses}
                </div>

                {/* Games Win/Loss ratios */}
                <div className="col-span-2 text-center text-[10px] text-gray-400 font-semibold">
                  {team.gameWins} - {team.gameLosses}
                </div>

                {/* Streak marker */}
                <div className="col-span-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-display-lg font-bold uppercase ${
                    team.streak.startsWith('W') 
                      ? 'bg-green-500/10 text-green-400' 
                      : team.streak.startsWith('L') 
                      ? 'bg-red-500/10 text-red-500' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {team.streak}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footnotes qualifying info */}
        <div className="p-4 bg-[#070d19] text-[9.5px] text-gray-500 border-t border-[#1e2d44] font-medium leading-relaxed">
          🔷 Placements destacadas em azul qualificam-se diretamente para a Grande Final do Split CBLOL e vagas para o MSI.
        </div>
      </div>

      {/* Right Column: Calendário Semanal (Span 5) */}
      <div className="lg:col-span-5 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-lg flex flex-col justify-between h-[525px]">
        <div>
          <div className="flex justify-between items-center mb-5 border-b border-[#1e2d44] pb-4">
            <div className="flex gap-2 items-center">
              <Calendar className="text-[#00d2fd] w-4 h-4" />
              <h3 className="font-display-lg text-xs font-bold uppercase tracking-widest text-[#00d2fd]">Calendário de Rodadas</h3>
            </div>
            
            {/* Quick dropdown select week */}
            <select
              value={currentSelectedWeek}
              onChange={(e) => changeSelectedWeek(parseInt(e.target.value))}
              className="bg-[#070d19] border border-[#1e2d44] text-[10px] font-display-lg font-bold uppercase text-[#00d2fd] rounded px-2.5 py-1 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(wk => (
                <option key={wk} value={wk}>Semana {wk}</option>
              ))}
            </select>
          </div>

          {/* Matches listings */}
          <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
            {weekMatches.length > 0 ? (
              weekMatches.map(match => {
                const isFinished = match.isFinished;
                const isBlueWinner = isFinished && match.scoreBlue > match.scoreRed;
                const isRedWinner = isFinished && match.scoreRed > match.scoreBlue;
                
                return (
                  <div key={match.id} className="bg-[#070d19] border border-[#1e2d44] rounded-xl p-4 flex flex-col justify-between hover:border-[#00d2fd]/30 transition-all">
                    <div className="grid grid-cols-7 items-center text-xs">
                      {/* team Blue */}
                      <div className="col-span-3 flex items-center gap-2">
                        <div
                          className="w-1 h-4 rounded-sm"
                          style={{ backgroundColor: getTeamColor(match.teamBlueId) }}
                        />
                        <span className={`font-display-lg font-bold uppercase truncate max-w-[80px] ${
                          isFinished ? (isBlueWinner ? 'text-white' : 'text-gray-500') : 'text-gray-300'
                        }`}>
                          {getTeamName(match.teamBlueId)}
                        </span>
                      </div>

                      {/* score markers */}
                      <div className="col-span-1 text-center font-display-lg font-black">
                        {isFinished ? (
                          <span className="text-[#00d2fd] text-xs">
                            {match.scoreBlue} - {match.scoreRed}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-[10px] tracking-widest font-bold">VS</span>
                        )}
                      </div>

                      {/* team Red */}
                      <div className="col-span-3 flex justify-end items-center gap-2">
                        <span className={`font-display-lg font-bold uppercase truncate max-w-[80px] text-right ${
                          isFinished ? (isRedWinner ? 'text-white' : 'text-gray-500') : 'text-gray-300'
                        }`}>
                          {getTeamName(match.teamRedId)}
                        </span>
                        <div
                          className="w-1 h-4 rounded-sm"
                          style={{ backgroundColor: getTeamColor(match.teamRedId) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-xs text-gray-500 uppercase tracking-widest border border-dashed border-[#1e2d44] rounded-xl">
                Nenhum partida agendada para esta semana no split
              </div>
            )}
          </div>
        </div>

        {/* Summary note details bottom */}
        <div className="border-t border-[#1e2d44] pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Partidas da rodada atual são simuladas automaticamente!
          </p>
        </div>
      </div>
    </div>
  );
}

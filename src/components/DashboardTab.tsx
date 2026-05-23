/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, TrendingUp, Trophy, Calendar, Zap, MessageSquare, Plus, Check } from 'lucide-react';
import { GameState, InterviewQuestion } from '../types';
import { INTERVIEW_QUESTIONS } from '../data/initialDatabase';

interface DashboardTabProps {
  gameState: GameState;
  onNextWeek: () => void;
  onSelectTab: (tab: string) => void;
  onAnswerInterview: (question: InterviewQuestion, optionIndex: number) => void;
  theme?: 'light' | 'dark';
}

export default function DashboardTab({
  gameState,
  onNextWeek,
  onSelectTab,
  onAnswerInterview,
  theme
}: DashboardTabProps) {
  const isDark = theme === 'dark';
  
  const getS = () => {
    return {
      bgPage: isDark ? 'space-y-6 font-sans bg-slate-950 select-none text-slate-100 p-0' : 'space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800 p-0',
      bgCard: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm text-slate-800',
      bgCardNoFlex: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800',
      bgCardNoFlexP6: isDark ? 'bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow-sm text-white' : 'bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-850',
      textMuted: isDark ? 'text-slate-450' : 'text-slate-500',
      textMain: isDark ? 'text-white' : 'text-slate-800',
      bgInner: isDark ? 'bg-[#070d19]/85 border border-[#1e2d44]/55' : 'bg-slate-50 border border-slate-100',
      divider: isDark ? 'divide-[#1e2d44]/50' : 'divide-slate-200/50',
      borderLine: isDark ? 'border-[#1e2d44]/50' : 'border-slate-100',
      textWhiteOrSlate: isDark ? 'text-white' : 'text-slate-850',
    };
  };
  const s = getS();

  const { week, stage, season, teams, playerTeamId, currentPatch, roundsPlayedThisWeek, socialFeed } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId)!;
  
  const [activeInterview, setActiveInterview] = useState<InterviewQuestion | null>(
    week % 3 === 0 ? INTERVIEW_QUESTIONS[week % INTERVIEW_QUESTIONS.length] : null
  );
  const [interviewAnswered, setInterviewAnswered] = useState(false);
  const [newsFeedCount, setNewsFeedCount] = useState(3);

  const currentRoundMatches = gameState.calendarSchedule[week];
  const playerNextOpponentMatch = currentRoundMatches?.find(
    m => m.teamBlueId === playerTeamId || m.teamRedId === playerTeamId
  );

  let opponentTeamObj = null;
  if (playerNextOpponentMatch) {
    const oppId = playerNextOpponentMatch.teamBlueId === playerTeamId 
      ? playerNextOpponentMatch.teamRedId 
      : playerNextOpponentMatch.teamBlueId;
    opponentTeamObj = teams.find(t => t.id === oppId);
  }

  const handleSelectAnswer = (optionIndex: number) => {
    if (!activeInterview) return;
    onAnswerInterview(activeInterview, optionIndex);
    setInterviewAnswered(true);
    setTimeout(() => {
      setActiveInterview(null);
      setInterviewAnswered(false);
    }, 3800);
  };

  return (
    <div className={s.bgPage}>
      
      {/* Upper Grid: Fast Core Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Weekly Header Card */}
        <div className={s.bgCard}>
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Calendar className={`w-12 h-12 ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Temporada {season}</p>
            <h2 className={`font-display ${isDark ? 'text-sky-400' : 'text-blue-600'} text-2xl font-black mt-1`}>SEMANA {week}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 ${isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'} font-mono text-[9px] rounded font-extrabold uppercase`}>
              {stage.replace('_', ' ')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Board Trust Level */}
        <div className={s.bgCard}>
          <div>
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Confiança da Diretoria</p>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1`}>{playerTeam.boardTrust}%</h2>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full mt-4 overflow-hidden`}>
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${playerTeam.boardTrust}%` }}
            />
          </div>
        </div>

        {/* Torcida / Public Fans Support */}
        <div className={s.bgCard}>
          <div>
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Apoio Popular</p>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1`}>{playerTeam.fansSupport}%</h2>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full mt-4 overflow-hidden`}>
            <div 
              className="h-full bg-blue-500 transition-all duration-500 hover:opacity-90"
              style={{ width: `${playerTeam.fansSupport}%` }}
            />
          </div>
        </div>

        {/* Core Roster Chemistry */}
        <div className={s.bgCard}>
          <div>
            <p className={`text-[10px] uppercase ${s.textMuted} tracking-wider font-extrabold`}>Química com o Time</p>
            <h2 className={`font-display ${s.textWhiteOrSlate} text-2xl font-black mt-1 text-ellipsis whitespace-nowrap overflow-hidden`}>
              {Math.round(playerTeam.roster.reduce((a, b) => a + b.chemistry, 0) / 5)}%
            </h2>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1.5 rounded-full mt-4 overflow-hidden`}>
            <div 
              className="h-full bg-pink-500 transition-all duration-500"
              style={{ width: `${Math.round(playerTeam.roster.reduce((a, b) => a + b.chemistry, 0) / 5)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Match schedule & Active Meta (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Opponent Widget / Next Match Info */}
          <div className={s.bgCard}>
            {/* Header top row */}
            <div className={`flex justify-between items-center mb-5 border-b ${s.borderLine} pb-4`}>
              <div>
                <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${s.textWhiteOrSlate}`}>
                  Próximo Desafio do Split
                </h3>
                <p className={`text-[10px] ${s.textMuted} font-medium`}>Fase de Grupos • Série Melhor de 3</p>
              </div>
              <span className="bg-pink-50 text-pink-600 border border-pink-100 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded uppercase tracking-wider leading-none">
                {stage === 'SPLIT_PLAYOFFS' ? 'PLAYOFF FINALS' : `RODADA ${week}`}
              </span>
            </div>

            {/* Combat Center Visual UI */}
            {opponentTeamObj ? (
              <div className="grid grid-cols-3 items-center py-6">
                
                {/* Home Team */}
                <div className="flex flex-col items-center text-center">
                  <div 
                    className={`w-16 h-16 rounded-full ${isDark ? 'bg-slate-900 border-sky-400' : 'bg-slate-50 border-blue-500'} border-2 flex items-center justify-center font-bold text-xl relative`}
                  >
                    <Shield className={`w-7 h-7 ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                  </div>
                  <p className={`font-display text-xs font-bold ${s.textWhiteOrSlate} uppercase mt-3 tracking-wider leading-tight max-w-[120px] truncate`}>
                    {playerTeam.name}
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-sky-400' : 'text-blue-600'} uppercase tracking-widest font-extrabold mt-1`}>
                    {playerTeam.wins}V - {playerTeam.losses}D
                  </p>
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`px-5 py-2.5 ${isDark ? 'bg-slate-900 border-slate-700 text-sky-455' : 'bg-slate-50 border-slate-200 text-blue-600'} border font-mono text-xs font-black tracking-widest rounded-lg`}>
                    VS
                  </div>
                  <button
                    onClick={() => onSelectTab('Match Center')}
                    disabled={roundsPlayedThisWeek}
                    className={`mt-6 text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      roundsPlayedThisWeek
                        ? 'bg-[#ffebeb] text-pink-600 border border-pink-100 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {roundsPlayedThisWeek ? 'SÉRIE RESOLVIDA' : 'INICIAR DRAFT'}
                  </button>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center">
                  <div 
                    className={`w-16 h-16 rounded-full ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border-2 flex items-center justify-center font-bold text-xl relative`}
                    style={{ borderColor: opponentTeamObj.primaryColor }}
                  >
                    <Shield 
                      className="w-7 h-7" 
                      style={{ color: opponentTeamObj.primaryColor }}
                    />
                  </div>
                  <p className={`font-display text-xs font-bold ${s.textWhiteOrSlate} mt-3 tracking-wider max-w-[120px] truncate uppercase`}>
                    {opponentTeamObj.name}
                  </p>
                  <p 
                    className="text-[10px] uppercase tracking-widest font-extrabold mt-1"
                    style={{ color: opponentTeamObj.primaryColor }}
                  >
                    {opponentTeamObj.wins}V - {opponentTeamObj.losses}D
                  </p>
                </div>
              </div>
            ) : (
              <div className={`text-center py-10 ${s.textMuted} text-xs font-semibold uppercase tracking-widest flex flex-col items-center gap-4 justify-center`}>
                <span>Nenhuma partida agendada para esta semana de offseason. Pronto para iniciar o Split!</span>
                <button
                  onClick={onNextWeek}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-display text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Avançar para Semana 1
                </button>
              </div>
            )}

            {/* Advance week quick action banner */}
            {roundsPlayedThisWeek && opponentTeamObj && (
              <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'} animate-fade-in flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">RODADA CONCLUÍDA</p>
                  </div>
                  <p className={`text-xs ${s.textMuted} max-w-xl`}>
                    Todas as obrigações e confrontos desta semana foram finalizados. Avance a semana para coletar os dinheiros dos patrocinadores, sofrer patches e evoluir seu time!
                  </p>
                </div>
                <button
                  onClick={onNextWeek}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer w-full md:w-auto text-center shrink-0 animate-bounce"
                >
                  AVANÇAR SEMANA
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE INTERVIEWS HUD CONFERENCES */}
          {activeInterview && (
            <div className={`${s.bgCardNoFlexP6} border-2 border-blue-500/10 shadow-md relative animate-fade-in`}>
              <div className={`absolute top-4 right-4 ${isDark ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'} px-3 py-1 font-mono text-[9px] font-bold rounded uppercase tracking-wider flex items-center gap-1`}>
                <MessageSquare className="w-3 h-3" /> SALA DE IMPRENSA
              </div>
              <p className={`text-[10px] ${s.textMuted} font-extrabold uppercase tracking-widest mb-1.5`}>{activeInterview.context}</p>
              <h4 className={`font-display text-sm ${s.textWhiteOrSlate} font-extrabold leading-relaxed mb-6`}>
                "{activeInterview.question}"
              </h4>

              {interviewAnswered ? (
                <div className={`flex items-center gap-3 ${s.bgInner} rounded-lg p-4 animate-fade-in`}>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                    Suas respostas influenciaram o prestígio da equipe e as opiniões táticas nas redes sociais!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activeInterview.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(i)}
                      className={`w-full ${isDark ? 'bg-slate-900 border-slate-700 hover:bg-sky-950/20 text-slate-300 hover:text-sky-400 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-blue-350 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600'} border p-4 rounded-lg text-left text-xs font-bold transition-all block leading-normal cursor-pointer`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Active Patch Notes */}
          <div className={s.bgCardNoFlexP6}>
            <div className={`flex justify-between items-center mb-4 pb-3 border-b ${s.borderLine}`}>
              <div className="flex items-center gap-2">
                <Zap className="text-blue-600 w-4 h-4" />
                <h4 className={`font-display text-xs font-bold uppercase tracking-wider ${s.textWhiteOrSlate}`}>
                  Ajustes da Atualização de Summoner's Rift
                </h4>
              </div>
              <span className={`text-[10px] font-mono font-bold ${s.textMuted} tracking-wider`}>VERSÃO {currentPatch.version}</span>
            </div>
            <p className={`${s.textMuted} text-xs leading-relaxed mb-4`}>{currentPatch.metaDescription}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buffed */}
              <div className={`${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-50 border-emerald-100'} p-3.5 rounded-lg border`}>
                <p className="text-emerald-700 font-mono text-[9px] font-black uppercase tracking-wider mb-2">BUFFADOS (+4 Tático)</p>
                <div className="flex gap-1.5 flex-wrap">
                  {currentPatch.buffedChampions.map((cid, i) => {
                    const champName = gameState.champions?.find(c => c.id === cid)?.name || cid.replace('_', ' ');
                    return (
                      <span key={i} className="px-2 py-1 bg-emerald-100/50 text-emerald-700 text-[10px] font-mono font-bold uppercase rounded border border-emerald-200">
                        {champName}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Nerfed */}
              <div className={`${isDark ? 'bg-pink-500/5 border-pink-500/10' : 'bg-slate-50 border-pink-100'} p-3.5 rounded-lg border`}>
                <p className="text-pink-700 font-mono text-[9px] font-black uppercase tracking-wider mb-2">NERFADOS (-4 Tático)</p>
                <div className="flex gap-1.5 flex-wrap">
                  {currentPatch.nerfedChampions.map((cid, i) => {
                    const champName = gameState.champions?.find(c => c.id === cid)?.name || cid.replace('_', ' ');
                    return (
                      <span key={i} className="px-2 py-1 bg-pink-100/50 text-pink-700 text-[10px] font-mono font-bold uppercase rounded border border-pink-200">
                        {champName}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Social feed (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`${isDark ? 'bg-[#0a1424] border border-[#1e2d44]' : 'bg-white border border-slate-200'} rounded-xl p-5 shadow-sm flex flex-col justify-between h-[525px]`}>
            <div>
              <div className={`flex justify-between items-center mb-4 pb-3 border-b ${s.borderLine}`}>
                <h4 className={`font-display text-xs font-bold uppercase tracking-wider ${s.textWhiteOrSlate}`}>
                  CBLOL FANS FEED
                </h4>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>

              {/* Feed lists */}
              <div className="space-y-4 max-h-[385px] overflow-y-auto pr-1">
                {socialFeed.slice(0, newsFeedCount).map((post, i) => (
                  <div key={post.id} className={`${isDark ? 'bg-slate-900/60 border-slate-700/60 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300'} border rounded-xl p-4 space-y-2 relative overflow-hidden group transition-colors`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-200 shrink-0">
                        <img src={post.avatarUrl} referrerPolicy="no-referrer" alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 truncate">
                          <p className={`text-[11px] font-bold ${s.textWhiteOrSlate} leading-tight truncate`}>{post.username}</p>
                          {post.verified && (
                            <span className="text-[7.5px] bg-blue-50 text-blue-600 border border-blue-100 rounded px-1 shrink-0 scale-90">✓</span>
                          )}
                        </div>
                        <p className={`text-[9px] ${s.textMuted} tracking-tight font-medium`}>{post.handle}</p>
                      </div>
                    </div>
                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-xs leading-normal`}>
                      {post.content}
                    </p>
                    <div className={`flex justify-between text-[10px] ${s.textMuted} pt-1.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-200/60'} font-medium`}>
                      <span>❤️ {post.likes}</span>
                      <span>🔄 {post.retweets}</span>
                      <span>⏱ {post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load more news feeds */}
            <div className={`pt-4 border-t ${s.borderLine} flex justify-center`}>
              <button
                onClick={() => setNewsFeedCount(c => Math.min(socialFeed.length, c + 3))}
                className="text-xs text-blue-600 hover:underline uppercase font-bold tracking-widest flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> VER MAIS NOTÍCIAS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

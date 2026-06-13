/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Team, MatchSeries, Player, Sponsor, Staff, GamePatch, Position, CorporationStaff } from '../types';
import { CHAMPIONS_LIST, SPONSOR_PRESETS, STAFF_PRESETS, INITIAL_TEAMS_DATA, REGIONAL_TEAMS_DATABASE, INITIAL_PLAYER_ROSTER, INITIAL_PLAYER_SUBS } from '../data/initialDatabase';
import { generateProceduralPlayer, generateProceduralProfile, generateDynamicPatch, generateSocialFeed, generateId, generateProceduralAcademyPlayer } from './generators';
import { simulateBotMatch } from './matchSimulator';
import { getPlayersForTeam } from '../data/realPlayers';
import { loadEditorDatabase, hasCustomEditorData, getEditorTimestamp } from './editorSync';

export function initializeNewGame(
  managerName: string,
  selectedTeamId: string,
  selectedRegion: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' = 'CBLOL',
  selectedYear: number = 2026
): GameState {
  const isBrowser = typeof window !== 'undefined';
  const payload = loadEditorDatabase();
  
  // Load database structures prioritising the editor values if custom modifications are found
  let activeDb = payload?.teams || REGIONAL_TEAMS_DATABASE;
  let activeChamps = payload?.champions || CHAMPIONS_LIST;
  let activeSponsors = payload?.sponsors || [...SPONSOR_PRESETS];
  let customPlayersDict = payload?.playersDict || {};


  const regions: ('CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP')[] = ['CBLOL', 'LCK', 'LPL', 'LEC', 'LCS', 'LCP'];
  const allTeams: Team[] = [];

  regions.forEach(reg => {
    const regionalData = activeDb[reg] || [];
    regionalData.forEach(tData => {
      const isPlayer = tData.id === selectedTeamId;
      
      // Load real players for this team from realPlayers.ts database
      const matched = getPlayersForTeam(tData.id, isPlayer);
      let roster = matched.roster;
      let substitutes = matched.substitutes;
      
      // Fallback generator in case any team wasn't mapped
      if (roster.length === 0) {
        const ratings = Math.min(95, Math.max(76, 74 + Math.floor(tData.popularity * 0.18)));
        roster = [
          generateProceduralPlayer('TOP', ratings - 2, false, reg),
          generateProceduralPlayer('JNG', ratings, false, reg),
          generateProceduralPlayer('MID', ratings + 3, false, reg),
          generateProceduralPlayer('ADC', ratings + 1, false, reg),
          generateProceduralPlayer('SUP', ratings - 1, false, reg)
        ];
        substitutes = [
          generateProceduralPlayer('MID', ratings - 8, false, reg)
        ];
      }

      // Map dynamic local overrides on individual custom player profiles edited in our Database Editor
      const mapCustomAttributes = (pList: Player[]): Player[] => {
        return pList.map(p => {
          const dictKey = `${tData.id}_${p.id}_${p.name}`;
          const dictKeyAlt = p.id;
          const override = customPlayersDict[dictKey] || customPlayersDict[dictKeyAlt];
          if (override) {
            return {
              ...p,
              name: override.name || p.name,
              realName: override.realName || p.realName,
              overallRating: Number(override.overallRating ?? p.overallRating),
              age: Number(override.age ?? p.age),
              nationality: override.nationality || p.nationality,
              photoUrl: override.photoUrl || p.photoUrl
            };
          }
          return p;
        });
      };

      roster = mapCustomAttributes(roster);
      substitutes = mapCustomAttributes(substitutes);
      
      const proceduralizePlayer = (p: Player): Player => {
        if (p.id.startsWith('pl_real_') || 
            ['pl_shadow', 'pl_flow', 'pl_neon', 'pl_viper', 'pl_zen', 'pl_sub_aegis', 'pl_sub_echo'].includes(p.id)) {
          return p;
        }
        const profile = generateProceduralProfile(p.position, reg);
        return {
          ...p,
          name: profile.name,
          realName: profile.realName,
          nationality: profile.nationality,
          personality: profile.personality
        };
      };

      roster = roster.map(proceduralizePlayer);
      substitutes = substitutes.map(proceduralizePlayer);
      
      // Use seeded and custom-edited academy players from database if available, otherwise generate them procedurally
      let academy = (tData as any).academy && (tData as any).academy.length >= 5
        ? JSON.parse(JSON.stringify((tData as any).academy))
        : [
            generateProceduralAcademyPlayer('TOP', reg, 1, tData.id),
            generateProceduralAcademyPlayer('JNG', reg, 2, tData.id),
            generateProceduralAcademyPlayer('MID', reg, 3, tData.id),
            generateProceduralAcademyPlayer('ADC', reg, 4, tData.id),
            generateProceduralAcademyPlayer('SUP', reg, 5, tData.id),
            generateProceduralAcademyPlayer(
              (['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[])[Math.floor(Math.random() * 5)],
              reg,
              6,
              tData.id
            )
          ];

      // Add a 6th player to the academy if it only has 5, to fuel standard draft reserve requirements
      if (academy.length === 5) {
        academy.push(
          generateProceduralAcademyPlayer(
            (['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[])[Math.floor(Math.random() * 5)],
            reg,
            6,
            tData.id
          )
        );
      }

      academy = mapCustomAttributes(academy);

      allTeams.push({
        id: tData.id,
        name: tData.name,
        acronym: tData.acronym,
        primaryColor: tData.primaryColor,
        secondaryColor: tData.secondaryColor,
        budget: tData.budget,
        popularity: tData.popularity,
        fansSupport: 70 + Math.floor(Math.random() * 15),
        boardTrust: 80,
        roster,
        substitutes,
        academy,
        sponsors: isPlayer ? [] : [activeSponsors[0]],
        infrastructure: {
          gamingHouseLevel: 1,
          trainingCenterLevel: 1,
          mediaTeamLevel: 1
        },
        isPlayerControlled: isPlayer,
        points: 0,
        wins: 0,
        losses: 0,
        gameWins: 0,
        gameLosses: 0,
        streak: '-',
        matchHistoryIds: [],
        region: reg,
        description: tData.description
      });
    });
  });

  allTeams.forEach(setupTeamPlayersVisas);

  // Filter out teams in the active selected region for scheduling league matches
  const activeLeagueTeams = allTeams.filter(t => t.region === selectedRegion);
  const calendarSchedule = scheduleDoubleRoundRobin(activeLeagueTeams);

  // Available staff recruiters
  const availableStaff = [...STAFF_PRESETS];

  // Starting social feed items
  const startingSocial = [
    ...generateSocialFeed(activeLeagueTeams[0]?.name || 'Esports Club', 'general', 'neutral'),
    ...generateSocialFeed(activeLeagueTeams[1]?.name || 'Competitive Team', 'general', 'positive')
  ];

  const defaultLeagues = [
    { id: 'CBLOL', name: 'CBLOL', logoUrl: '' },
    { id: 'LCK', name: 'LCK', logoUrl: '' },
    { id: 'LPL', name: 'LPL', logoUrl: '' },
    { id: 'LEC', name: 'LEC', logoUrl: '' },
    { id: 'LCS', name: 'LCS', logoUrl: '' },
    { id: 'LCP', name: 'LCP', logoUrl: '' },
    { id: 'CBLAO', name: 'CBLÃO (Amadora)', logoUrl: '' },
    { id: 'DESAFIANTE', name: 'Desafiante (Amadora)', logoUrl: '' },
    { id: 'LCK_YOUTH', name: 'LCK Youth (Amadora)', logoUrl: '' },
    { id: 'LPL_YOUTH', name: 'LPL Youth (Amadora)', logoUrl: '' },
    { id: 'LEC_YOUTH', name: 'LEC Youth (Amadora)', logoUrl: '' },
    { id: 'LCS_YOUTH', name: 'LCS Youth (Amadora)', logoUrl: '' },
    { id: 'LCP_YOUTH', name: 'LCP Youth (Amadora)', logoUrl: '' }
  ];

  const selectedTeam = allTeams.find(t => t.id === selectedTeamId);
  const initialBudget = selectedTeam ? selectedTeam.budget : 1500050;

  const formattedHud = initialBudget < 1000000 
    ? `$ ${initialBudget.toLocaleString('pt-BR')}`
    : `$ ${(initialBudget / 1000000).toFixed(2)}M`;

  const initialJobPool: CorporationStaff[] = [];
  const categoriesList: CorporationStaff['departamento'][] = [
    'COMISSÃO TÉCNICA', 'TI', 'MARKETING', 'SAÚDE', 'JURÍDICO', 'OLHEIROS', 'RH'
  ];
  categoriesList.forEach(cat => {
    for (let i = 0; i < 5; i++) {
      initialJobPool.push(generateProceduralStaff(cat));
    }
  });

  return {
    managerName,
    season: selectedYear,
    week: 1,
    stage: 'OFFSEASON',
    currentDay: 12,
    currentMonthIndex: 0,
    gamingHouseActivities: {},
    playerTeamId: selectedTeamId,
    teams: allTeams, // contains all 60 teams globally loaded in memory
    champions: activeChamps,
    currentPatch: generateDynamicPatch(0),
    roundsPlayedThisWeek: false,
    calendarSchedule,
    socialFeed: startingSocial,
    sponsorsMarket: [...activeSponsors],
    availableStaff,
    corporationStaffJobPool: initialJobPool,
    careerHistory: [],
    selectedRegion,
    selectedYear,
    leagues: defaultLeagues,
    finance: {
      balance: initialBudget,
      caixa_bruto: initialBudget,
      caixa_formatado_hud: formattedHud
    },
    lastEditorSyncTimestamp: payload?.lastModified || 0,
    editorSyncStatusMessage: payload ? `[STATUS: ONLINE] [ENGINE: ACTIVE] Editor Payload Synced Successfully.` : `[STATUS: ONLINE] [ENGINE: ACTIVE] Init completed.`
  };
}

export function scheduleDoubleRoundRobin(teams: Team[]): { [weekNumber: number]: MatchSeries[] } {
  const schedule: { [weekNumber: number]: MatchSeries[] } = {};
  const numTeams = teams.length;
  const numRounds = (numTeams - 1) * 2; // Double round robin (14 weeks)
  const matchesPerRound = numTeams / 2;

  // Let's create an elegant circle method robin generator
  const list = [...teams];
  
  for (let round = 0; round < numRounds; round++) {
    const weekNum = round + 2; // Week 1 is Offseason, Week 2 is Split start
    schedule[weekNum] = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = list[i];
      const away = list[numTeams - 1 - i];

      // Alternates home & away inside double split
      const teamBlueVal = round % 2 === 0 ? home : away;
      const teamRedVal = round % 2 === 0 ? away : home;

      schedule[weekNum].push({
        id: `ms_${round}_${i}_${generateId()}`,
        teamBlueId: teamBlueVal.id,
        teamRedId: teamRedVal.id,
        scoreBlue: 0,
        scoreRed: 0,
        isFinished: false,
        roundIndex: round,
        stage: 'REGULAR',
        logs: [],
        pickBans: [],
        activeGameIndex: 0
      });
    }

    // Rotate elements for circle algorithm, keeping index 0 fixed
    const first = list[0];
    const rest = list.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    list[0] = first;
    for (let k = 0; k < rest.length; k++) {
      list[k + 1] = rest[k];
    }
  }

  return schedule;
}

export function advanceGameWeek(gameState: GameState): GameState {
  let updatedState = { ...gameState };
  const currentWeek = updatedState.week;
  const playerTeam = updatedState.teams.find(t => t.id === updatedState.playerTeamId);

  // Replenish the Job Pool procedural to keep it alive
  if (!updatedState.corporationStaffJobPool) {
    updatedState.corporationStaffJobPool = [];
  }
  const categoriesList: CorporationStaff['departamento'][] = [
    'COMISSÃO TÉCNICA', 'TI', 'MARKETING', 'SAÚDE', 'JURÍDICO', 'OLHEIROS', 'RH'
  ];
  categoriesList.forEach(cat => {
    const currentCount = updatedState.corporationStaffJobPool!.filter(j => j.departamento === cat).length;
    if (currentCount < 5) {
      const needed = 5 - currentCount;
      for (let i = 0; i < needed; i++) {
        updatedState.corporationStaffJobPool!.push(generateProceduralStaff(cat));
      }
    }
  });

  // Reset any active temporary travel visas when advancing past Week 1 (offseason window ends)
  if (currentWeek === 1) {
    updatedState.teams.forEach(t => {
      t.vistoEspecialTorneioAtivo = false;
      t.vistoEspecialTorneioNome = undefined;
    });
  }

  // 1. Simulate matches of other teams if the player has finished their current matches
  const currentWeekMatches = updatedState.calendarSchedule[currentWeek];
  if (currentWeekMatches) {
    currentWeekMatches.forEach(match => {
      // If player match, it should already be simulated or finished before stepping week.
      // If it is bot vs bot match, simulate it!
      const isPlayerParticipant = playerTeam ? (match.teamBlueId === playerTeam.id || match.teamRedId === playerTeam.id) : false;
      if (!match.isFinished && !isPlayerParticipant) {
        const teamBlue = updatedState.teams.find(t => t.id === match.teamBlueId)!;
        const teamRed = updatedState.teams.find(t => t.id === match.teamRedId)!;
        const botSim = simulateBotMatch(teamBlue, teamRed, match.roundIndex, match.stage);
        
        match.scoreBlue = botSim.scoreBlue;
        match.scoreRed = botSim.scoreRed;
        match.isFinished = true;

        // Update score rankings points
        const scoreBlueWins = botSim.scoreBlue;
        const scoreRedWins = botSim.scoreRed;
        
        if (scoreBlueWins > scoreRedWins) {
          teamBlue.wins++;
          teamRed.losses++;
          teamBlue.points += 3;
          teamBlue.streak = 'W' + (parseInt(teamBlue.streak.replace(/\D/g, '')) + 1 || 1);
          teamRed.streak = 'L' + (parseInt(teamRed.streak.replace(/\D/g, '')) + 1 || 1);
        } else {
          teamRed.wins++;
          teamBlue.losses++;
          teamRed.points += 3;
          teamRed.streak = 'W' + (parseInt(teamRed.streak.replace(/\D/g, '')) + 1 || 1);
          teamBlue.streak = 'L' + (parseInt(teamBlue.streak.replace(/\D/g, '')) + 1 || 1);
        }
        teamBlue.gameWins += scoreBlueWins;
        teamBlue.gameLosses += scoreRedWins;
        teamRed.gameWins += scoreRedWins;
        teamRed.gameLosses += scoreBlueWins;
      }
    });
  }

  // ==========================================================================
  // PARALLEL SIMULATION OF OTHER REGIONS & DETAILED PLAYER STATS
  // ==========================================================================
  const regionsList: ('CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP')[] = ['CBLOL', 'LCK', 'LPL', 'LEC', 'LCS', 'LCP'];
  regionsList.forEach(reg => {
    if (reg === updatedState.selectedRegion) {
      return;
    }
    const regTeams = updatedState.teams.filter(t => t.region === reg);
    if (regTeams.length === 0) return;

    const regSchedule = scheduleDoubleRoundRobin(regTeams);
    const weekMatches = regSchedule[currentWeek];
    if (!weekMatches) return;

    weekMatches.forEach(match => {
      const teamBlue = updatedState.teams.find(t => t.id === match.teamBlueId)!;
      const teamRed = updatedState.teams.find(t => t.id === match.teamRedId)!;
      if (!teamBlue || !teamRed) return;

      const OVR_Blue = teamBlue.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;
      const OVR_Red = teamRed.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;

      const powerBlue = teamBlue.popularity * 0.4 + OVR_Blue * 0.6;
      const powerRed = teamRed.popularity * 0.4 + OVR_Red * 0.6;

      const rngBlue = 1 + (Math.random() - 0.5) * 0.15;
      const rngRed = 1 + (Math.random() - 0.5) * 0.15;

      const finalBlue = (powerBlue + 5) * rngBlue;
      const finalRed = powerRed * rngRed;

      const isBlueWinner = finalBlue > finalRed;
      const isBo3 = reg === 'LCK' || reg === 'LPL';
      let scoreBlue = 0;
      let scoreRed = 0;

      if (isBo3) {
        if (isBlueWinner) {
          scoreBlue = 2;
          scoreRed = Math.random() > 0.5 ? 1 : 0;
        } else {
          scoreRed = 2;
          scoreBlue = Math.random() > 0.5 ? 1 : 0;
        }
      } else {
        if (isBlueWinner) {
          scoreBlue = 1;
          scoreRed = 0;
        } else {
          scoreRed = 1;
          scoreBlue = 0;
        }
      }

      match.scoreBlue = scoreBlue;
      match.scoreRed = scoreRed;
      match.isFinished = true;

      if (scoreBlue > scoreRed) {
        teamBlue.wins++;
        teamRed.losses++;
        teamBlue.points += 3;
        teamBlue.streak = 'W' + (parseInt(teamBlue.streak.replace(/\D/g, '')) + 1 || 1);
        teamRed.streak = 'L' + (parseInt(teamRed.streak.replace(/\D/g, '')) + 1 || 1);
      } else {
        teamRed.wins++;
        teamBlue.losses++;
        teamRed.points += 3;
        teamRed.streak = 'W' + (parseInt(teamRed.streak.replace(/\D/g, '')) + 1 || 1);
        teamBlue.streak = 'L' + (parseInt(teamBlue.streak.replace(/\D/g, '')) + 1 || 1);
      }
      teamBlue.gameWins += scoreBlue;
      teamBlue.gameLosses += scoreRed;
      teamRed.gameWins += scoreRed;
      teamRed.gameLosses += scoreBlue;

      const numGames = scoreBlue + scoreRed;
      const teamBlueWinner = scoreBlue > scoreRed;

      const simulateRosterStats = (t: Team, isWinner: boolean) => {
        const mvpIndex = Math.floor(Math.random() * t.roster.length);
        t.roster.forEach((p, idx) => {
          if (!p.stats) {
            p.stats = { kills: 0, deaths: 0, assists: 0, cs: 0, gamesPlayed: 0, mvps: 0 };
          }
          let baseKills = 3, baseDeaths = 3, baseAssists = 6, baseCs = 240;
          switch (p.position) {
            case 'TOP': baseKills = 3; baseDeaths = 3; baseAssists = 5; baseCs = 245; break;
            case 'JNG': baseKills = 4; baseDeaths = 3; baseAssists = 7; baseCs = 185; break;
            case 'MID': baseKills = 5; baseDeaths = 3; baseAssists = 6; baseCs = 265; break;
            case 'ADC': baseKills = 6; baseDeaths = 2; baseAssists = 5; baseCs = 290; break;
            case 'SUP': baseKills = 1; baseDeaths = 4; baseAssists = 10; baseCs = 45; break;
          }
          const mult = p.overallRating / 80;
          const gKills = Math.round(baseKills * mult * (0.6 + Math.random() * 0.8)) * numGames;
          const gDeaths = Math.round(baseDeaths / mult * (0.6 + Math.random() * 0.8)) * numGames;
          const gAssists = Math.round(baseAssists * mult * (0.6 + Math.random() * 0.8)) * numGames;
          const gCs = Math.round(baseCs * mult * (0.8 + Math.random() * 0.4)) * numGames;

          p.stats.kills += gKills;
          p.stats.deaths += gDeaths;
          p.stats.assists += gAssists;
          p.stats.cs += gCs;
          p.stats.gamesPlayed += numGames;

          if (isWinner && idx === mvpIndex) {
            p.stats.mvps++;
          }
        });
      };

      simulateRosterStats(teamBlue, teamBlueWinner);
      simulateRosterStats(teamRed, !teamBlueWinner);
    });
  });

  // Accumulate play-by-play metrics for the active region teams too
  if (currentWeekMatches) {
    currentWeekMatches.forEach(match => {
      if (match.isFinished) {
        const teamBlue = updatedState.teams.find(t => t.id === match.teamBlueId)!;
        const teamRed = updatedState.teams.find(t => t.id === match.teamRedId)!;
        if (!teamBlue || !teamRed) return;

        const scoreBlue = match.scoreBlue || 0;
        const scoreRed = match.scoreRed || 0;
        const numGames = Math.max(1, scoreBlue + scoreRed);
        const teamBlueWinner = scoreBlue > scoreRed;

        const simulateActiveRegionPlayerStats = (t: Team, isWinner: boolean) => {
          const mvpIndex = Math.floor(Math.random() * t.roster.length);
          t.roster.forEach((p, idx) => {
            if (!p.stats) {
              p.stats = { kills: 0, deaths: 0, assists: 0, cs: 0, gamesPlayed: 0, mvps: 0 };
            }
            if (p.stats.gamesPlayed >= currentWeek) {
              return;
            }
            let baseKills = 3, baseDeaths = 3, baseAssists = 6, baseCs = 240;
            switch (p.position) {
              case 'TOP': baseKills = 3; baseDeaths = 3; baseAssists = 5; baseCs = 245; break;
              case 'JNG': baseKills = 4; baseDeaths = 3; baseAssists = 7; baseCs = 185; break;
              case 'MID': baseKills = 5; baseDeaths = 3; baseAssists = 6; baseCs = 265; break;
              case 'ADC': baseKills = 6; baseDeaths = 2; baseAssists = 5; baseCs = 290; break;
              case 'SUP': baseKills = 1; baseDeaths = 4; baseAssists = 10; baseCs = 45; break;
            }
            const mult = p.overallRating / 80;
            const gKills = Math.round(baseKills * mult * (0.6 + Math.random() * 0.8)) * numGames;
            const gDeaths = Math.round(baseDeaths / mult * (0.6 + Math.random() * 0.8)) * numGames;
            const gAssists = Math.round(baseAssists * mult * (0.6 + Math.random() * 0.8)) * numGames;
            const gCs = Math.round(baseCs * mult * (0.8 + Math.random() * 0.4)) * numGames;

            p.stats.kills += gKills;
            p.stats.deaths += gDeaths;
            p.stats.assists += gAssists;
            p.stats.cs += gCs;
            p.stats.gamesPlayed += numGames;

            if (isWinner && idx === mvpIndex) {
              p.stats.mvps++;
            }
          });
        };

        simulateActiveRegionPlayerStats(teamBlue, teamBlueWinner);
        simulateActiveRegionPlayerStats(teamRed, !teamBlueWinner);
      }
    });
  }

  // ==========================================================================
  // B. AUTONOMOUS PROMOTION OF JUVENILE TALENTS (PRODUCE PROMISES)
  // ==========================================================================
  updatedState.teams.forEach(team => {
    if (team.isPlayerControlled) return;
    if (!team.academy || team.academy.length === 0) return;

    team.academy.forEach((academyPlayer, academyIdx) => {
      const starterPos = academyPlayer.position;
      const starterIdx = team.roster.findIndex(p => p.position === starterPos);
      if (starterIdx === -1) return;

      const starterPlayer = team.roster[starterIdx];
      const hasPerformanceDrop = Math.random() < 0.04 || (academyPlayer.overallRating > starterPlayer.overallRating - 5 && Math.random() < 0.08);

      if (hasPerformanceDrop) {
        team.roster[starterIdx] = {
          ...academyPlayer,
          isAcademyStarter: true
        };
        team.academy[academyIdx] = {
          ...starterPlayer,
          isAcademyStarter: false
        };

        updatedState.socialFeed.unshift({
          id: `promo-${Date.now()}-${team.id}-${academyPlayer.id}`,
          username: `${team.name} News`,
          handle: `@${team.acronym.toLowerCase()}_news`,
          avatarUrl: ``,
          content: `🚨 [PROMESSA DA BASE] Visando reestruturar a equipe titular após oscilações de rendimento de ${starterPlayer.name}, a diretoria da ${team.name} promove ${academyPlayer.name} diretamente da Academy! O jovem de ${academyPlayer.age} anos fará sua estreia oficial na rota ${academyPlayer.position}! 🦾`,
          likes: 120 + Math.floor(Math.random() * 400),
          retweets: 20 + Math.floor(Math.random() * 80),
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: true
        });
      }
    });
  });

  // ==========================================================================
  // C. PROCEDURAL AI TRANSFERS & S-TIER ALERTS
  // ==========================================================================
  if (Math.random() < 0.18) {
    const aiTeams = updatedState.teams.filter(t => !t.isPlayerControlled);
    if (aiTeams.length >= 2) {
      const buyerIndex = Math.floor(Math.random() * aiTeams.length);
      let sellerIndex = Math.floor(Math.random() * aiTeams.length);
      while (sellerIndex === buyerIndex) {
        sellerIndex = Math.floor(Math.random() * aiTeams.length);
      }

      const buyerTeam = aiTeams[buyerIndex];
      const sellerTeam = aiTeams[sellerIndex];

      const rosterSource = sellerTeam.roster;
      if (rosterSource.length > 0) {
        const playerIdx = Math.floor(Math.random() * rosterSource.length);
        const playerToTransfer = rosterSource[playerIdx];

        if (buyerTeam.budget >= playerToTransfer.marketValue * 0.4) {
          const buyerPosIdx = buyerTeam.roster.findIndex(p => p.position === playerToTransfer.position);
          if (buyerPosIdx !== -1) {
            const outgoingPlayer = buyerTeam.roster[buyerPosIdx];

            buyerTeam.roster[buyerPosIdx] = { ...playerToTransfer };
            sellerTeam.roster[playerIdx] = { ...outgoingPlayer };

            const transValue = Math.round(playerToTransfer.marketValue * (0.8 + Math.random() * 0.4));
            buyerTeam.budget -= transValue;
            sellerTeam.budget += transValue;

            const isTierS = playerToTransfer.overallRating >= 85;

            if (isTierS) {
              updatedState.socialFeed.unshift({
                id: `trans-s-${Date.now()}`,
                username: 'Esports Global Portal',
                handle: '@esports_portal',
                avatarUrl: '',
                content: `🔥 [BOMBA NO MERCADO] Histórico! A organização ${buyerTeam.name} (${buyerTeam.region}) contrata em definitivo o astro super/S-Tier ${playerToTransfer.name} vindo da equipe ${sellerTeam.name}! O acerto financeiro totalizou a incrível quantia de $ ${transValue.toLocaleString('pt-BR')}! Segundo as fontes, o atleta assinou contrato de elite imediato. 👑`,
                likes: 1540 + Math.floor(Math.random() * 5000),
                retweets: 450 + Math.floor(Math.random() * 1500),
                timeAgo: 'Agora',
                sentiment: 'positive',
                verified: true
              });

              if (typeof window !== 'undefined') {
                const raw = localStorage.getItem('legendshub_custom_events_emails');
                let current: any[] = [];
                if (raw) {
                  try { current = JSON.parse(raw); } catch (e) {}
                }
                const newEmail = {
                  id: `email-trans-${Date.now()}`,
                  sender: 'Jornalístico Daily Esports',
                  senderRole: 'Editor de Mercado Global',
                  subject: `🚨 [TRANSFERÊNCIA HISTÓRICA] ${playerToTransfer.name} assina com ${buyerTeam.name}!`,
                  body: `Caro Manager,\n\nO mercado internacional de Esports foi abalado hoje por uma transação gigantesca na liga ${buyerTeam.region}.\n\nA equipe ${buyerTeam.name} concluiu a contratação de ${playerToTransfer.name} (${playerToTransfer.realName}), um dos principais jogadores na posição ${playerToTransfer.position} do mundo.\n\nO valor do acordo atingiu cerca de $ ${transValue.toLocaleString('pt-BR')} em custos imediatos de passe. Com esse investimento colossal, a ${buyerTeam.name} desponta como favorita aos playoffs globais e desafia o equilíbrio das demais potências mundiais!\n\nEstaremos acompanhando de perto o desenrolar das novas escalações! Ao trabalho!\n\nAtenciosamente,\nRedação Daily Esports`,
                  date: 'Semana Atual',
                  category: 'Propostas',
                  read: false
                };
                localStorage.setItem('legendshub_custom_events_emails', JSON.stringify([newEmail, ...current]));
              }
            } else {
              updatedState.socialFeed.unshift({
                id: `trans-normal-${Date.now()}`,
                username: 'Radar de Transferências',
                handle: '@radar_transfers',
                avatarUrl: '',
                content: `📢 [MERCADO] Acordo fechado entre ${sellerTeam.name} e ${buyerTeam.name}! O jogador ${playerToTransfer.name} (${playerToTransfer.position}) foi negociado e passa a integrar a gaming house da ${buyerTeam.name}. Transação avaliada em $ ${transValue.toLocaleString('pt-BR')}.`,
                likes: 240 + Math.floor(Math.random() * 500),
                retweets: 40 + Math.floor(Math.random() * 90),
                timeAgo: 'Agora',
                sentiment: 'neutral'
              });
            }
          }
        }
      }
    }
  }

  // ==========================================================================
  // D. PROCEDURAL CASH FLOWS (FINANCES BOOST & PENALTIES)
  // ==========================================================================
  updatedState.teams.forEach(team => {
    if (team.budget === undefined) team.budget = 1000000;

    const baseGain = 45000 + (team.popularity * 1500);
    team.budget += baseGain;

    const hasWonThisWeek = team.streak.startsWith('W');
    const streakCount = parseInt(team.streak.replace(/\D/g, '')) || 0;

    if (hasWonThisWeek) {
      const bonus = 15000 + (streakCount * 12050);
      team.budget += bonus;
      team.popularity = Math.min(100, team.popularity + 1);
    } else {
      const penalty = 12000 + (streakCount * 8000);
      team.budget = Math.max(100000, team.budget - penalty);
      team.popularity = Math.max(10, team.popularity - 1);

      if (team.budget < 300000 && team.roster.length > 0 && !team.isPlayerControlled) {
        const sortedRoster = [...team.roster].sort((a, b) => b.marketValue - a.marketValue);
        const playerToSell = sortedRoster[0];

        if (playerToSell && playerToSell.overallRating >= 80) {
          const wealthyTeams = updatedState.teams.filter(t => !t.isPlayerControlled && t.id !== team.id && t.budget > playerToSell.marketValue);
          if (wealthyTeams.length > 0) {
            const buyer = wealthyTeams[Math.floor(Math.random() * wealthyTeams.length)];
            const buyerPosIdx = buyer.roster.findIndex(p => p.position === playerToSell.position);

            if (buyerPosIdx !== -1) {
              const outgoing = buyer.roster[buyerPosIdx];

              buyer.roster[buyerPosIdx] = { ...playerToSell };
              team.roster[team.roster.indexOf(playerToSell)] = { ...outgoing };

              const salePrice = Math.round(playerToSell.marketValue * 0.95);
              team.budget += salePrice;
              buyer.budget -= salePrice;

              updatedState.socialFeed.unshift({
                id: `forced-sale-${Date.now()}`,
                username: 'Radar Financeiro',
                handle: '@esports_economics',
                avatarUrl: '',
                content: `📉 [CRISE FINANCEIRA] Devido a pressões de caixa causadas por derrotas consecutivas, a equipe ${team.name} foi forçada a vender o astro ${playerToSell.name} para a potência ${buyer.name} por $ ${salePrice.toLocaleString('pt-BR')} para cumprir as obrigações imediatas de folha de pagamento!`,
                likes: 910 + Math.floor(Math.random() * 2000),
                retweets: 180 + Math.floor(Math.random() * 500),
                timeAgo: 'Agora',
                sentiment: 'negative'
              });
            }
          }
        }
      }
    }
  });

  // 2. Financial weekly accounting & Game Engine Ticking Module
  if (playerTeam) {
    if (playerTeam.creditScore === undefined) playerTeam.creditScore = 720;
    if (!playerTeam.loans) playerTeam.loans = [];
    if (!playerTeam.investments) {
      playerTeam.investments = { fixedIncome: 0, sportsFund: 0, sharesRivals: 0, advancedSponsorWeeks: 0, advancedSponsorBudget: 0 };
    }
    if (!playerTeam.installmentPlans) playerTeam.installmentPlans = [];
    if (!playerTeam.vistasAwaiting) playerTeam.vistasAwaiting = [];
    if (playerTeam.poachingPenaltiesWeeks === undefined) playerTeam.poachingPenaltiesWeeks = 0;

    // Safeguard custom contract structure on every roster/substitute player
    setupTeamPlayersVisas(playerTeam);
    const initContractProps = (p: Player) => {
      if (p.signOnFee === undefined) p.signOnFee = Math.round(p.marketValue * 0.25);
      if (p.consecutiveBenchCount === undefined) p.consecutiveBenchCount = 0;
      if (p.isMvpBonusExigido === undefined) p.isMvpBonusExigido = Math.random() < 0.2;
      if (p.isTitularidadeExigida === undefined) p.isTitularidadeExigida = Math.random() < 0.15;
    };
    playerTeam.roster.forEach(initContractProps);
    playerTeam.substitutes.forEach(initContractProps);

    const sponsorsInflow = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
  
  // Custom user ticket and merchandising fan shop pricing calculations:
  const usrJerseyPrice = playerTeam.jerseyPrice || 69;
  const usrTicketPrice = playerTeam.ticketPrice || 25;
  const socioTorcedores = Math.round(playerTeam.popularity * 145);
  const socioMultiplier = 1 + (socioTorcedores / 10000);
  const merchSalesAmount = Math.round(playerTeam.popularity * usrJerseyPrice * 18 * socioMultiplier);
  const ticketsSalesAmount = Math.round(playerTeam.popularity * usrTicketPrice * 22);
  const coreEarningsTotal = sponsorsInflow + merchSalesAmount + ticketsSalesAmount;

  const basePlayerPayrollWeekly = [...playerTeam.roster, ...playerTeam.substitutes].reduce((acc, p) => acc + p.salary / 4, 0);
  const infrastructureCostsExpenses = (playerTeam.infrastructure.gamingHouseLevel * 8000) + 
                                       (playerTeam.infrastructure.trainingCenterLevel * 6000) +
                                       (playerTeam.infrastructure.mediaTeamLevel * 4000);
  const hiredStaffCostsWeekly = updatedState.availableStaff.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0);
  const coreSpendingTotal = basePlayerPayrollWeekly + infrastructureCostsExpenses + hiredStaffCostsWeekly;

  let extraEarningsInflow = 0;
  let extraSpendingOutflow = 0;

  // A. Bank Loans Weekly Ticking (Empréstimos)
  const updatedLoansList = [];
  for (const loan of playerTeam.loans) {
    if (loan.remainingWeeks > 0) {
      const weeklyPaymentValue = Math.round(loan.totalToPay / loan.remainingWeeks);
      extraSpendingOutflow += weeklyPaymentValue;
      loan.totalToPay -= weeklyPaymentValue;
      loan.remainingWeeks--;
      
      if (loan.remainingWeeks > 0 && loan.totalToPay > 0) {
        updatedLoansList.push(loan);
      } else {
        // Loan paid off!
        playerTeam.creditScore = Math.min(1000, playerTeam.creditScore + 50);
        playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 3);
        updatedState.socialFeed.unshift({
          id: 'payoff_' + generateId(),
          username: 'Rivals_Financial_Desk',
          handle: '@BancoRivals',
          avatarUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=100',
          content: `✅ [QUITAÇÃO] O clube ${playerTeam.name} quitou integralmente seu Empréstimo do tipo "${loan.type}". Excelente sinal de responsabilidade financeira! Score de crédito reajustado para cima.`,
          likes: 512,
          retweets: 95,
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: true
        });
      }
    }
  }
  playerTeam.loans = updatedLoansList;

  // B. Investments Returns Weekly Ticking
  // B1. Renda Fixa (+2% per split, split is 14 weeks. Growth = +0.14% per week on alocated)
  if (playerTeam.investments.fixedIncome > 0) {
    const fixedInterestAdd = Math.round(playerTeam.investments.fixedIncome * 0.0014);
    playerTeam.investments.fixedIncome += fixedInterestAdd;
  }
  // B2. Fundo Esportivo (+5% if playerTeam won last match)
  if (playerTeam.investments.sportsFund > 0) {
    const lastPlayedWeek = currentWeek; // checking player team score in current week before incrementing week
    const matchesList = updatedState.calendarSchedule[lastPlayedWeek];
    const playerMatch = matchesList?.find(m => m.teamBlueId === playerTeam.id || m.teamRedId === playerTeam.id);
    if (playerMatch && playerMatch.isFinished) {
      const isPlayerBlue = playerMatch.teamBlueId === playerTeam.id;
      const didPlayerWinMatch = (isPlayerBlue && playerMatch.scoreBlue > playerMatch.scoreRed) || (!isPlayerBlue && playerMatch.scoreRed > playerMatch.scoreBlue);
      if (didPlayerWinMatch) {
        const dividendAmount = Math.round(playerTeam.investments.sportsFund * 0.05);
        extraEarningsInflow += dividendAmount;
        updatedState.socialFeed.unshift({
          id: 'sports_fund_' + generateId(),
          username: 'Fundo_Consilium',
          handle: '@FundoEsportivoRivals',
          avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
          content: `💰 [FUNDO ESPORTIVO] Vitória na rodada pagou dividendos de +$ ${dividendAmount.toLocaleString('pt-BR')} (5% de ganho sobre o capital do ${playerTeam.name}). A Diretoria parabeniza o Manager pela pressão suportada!`,
          likes: 420,
          retweets: 62,
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: true
        });
      }
    }
  }
  // B3. Ações de Rivais (+10% or -5% volatility)
  if (playerTeam.investments.sharesRivals > 0) {
    const rateFluct = (Math.random() * 0.15) - 0.05; // -5% to +10%
    const sharesChange = Math.round(playerTeam.investments.sharesRivals * rateFluct);
    playerTeam.investments.sharesRivals += sharesChange;
    // Moral Dilemma
    if (playerTeam.investments.sharesRivals > 40000) {
      playerTeam.boardTrust = Math.max(1, playerTeam.boardTrust - 1);
      playerTeam.fansSupport = Math.max(1, playerTeam.fansSupport - 1);
    }
  }
  // B4. Patrocínio Antecipado Ticking
  if (playerTeam.investments.advancedSponsorWeeks > 0) {
    playerTeam.investments.advancedSponsorWeeks--;
    const paybackValue = 6500;
    extraSpendingOutflow += paybackValue;
    if (playerTeam.investments.advancedSponsorWeeks <= 0) {
      playerTeam.investments.advancedSponsorWeeks = 0;
      playerTeam.investments.advancedSponsorBudget = 0;
    }
  }

  // C. Installment Payments for Sign-ons (Financiamento de Contratações)
  const remainingInstallments = [];
  for (const installment of playerTeam.installmentPlans) {
    if (installment.remainingWeeks > 0) {
      extraSpendingOutflow += installment.installmentAmount;
      installment.remainingWeeks--;
      if (installment.remainingWeeks > 0) {
        remainingInstallments.push(installment);
      } else {
        updatedState.socialFeed.unshift({
          id: 'inst_complete_' + generateId(),
          username: 'Juridico_Rivals',
          handle: '@JuridicoRivals',
          avatarUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=100',
          content: `📜 [CONTRATO QUITADO] Concluído o pagamento das luvas financiadas do atleta ${installment.playerName}. Caixa jurídica limpo!`,
          likes: 180,
          retweets: 24,
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: true
        });
      }
    }
  }
  playerTeam.installmentPlans = remainingInstallments;

  // D. Visa Approvals Ticking (Centro de Processamento de Vistos)
  const activeAwaitingVisas = [];
  for (const app of playerTeam.vistasAwaiting) {
    if (app.weeksRemaining > 0) {
      if (app.hasDocumentationRequest) {
        // Congela temporariamente se houver inconsistência pendente de correção!
        activeAwaitingVisas.push(app);
      } else {
        // Sem pendências: progride uma semana!
        app.weeksRemaining--;

        // Standard P-1 Visa has 15% random delay chance
        if (app.type === 'P-1' && Math.random() < 0.15) {
          app.weeksRemaining += 1;
          app.hasDocumentationRequest = true;
          updatedState.socialFeed.unshift({
            id: 'visa_doc_needed_' + generateId(),
            username: 'Consulado_Rivals',
            handle: '@ImigracaoGlobal',
            avatarUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=100',
            content: `⚠️ [DOCUMENTO ADICIONAL] Imigração emitiu restrição temporária para liberação do Visto P-1 de ${app.name}. Tempo estimado de processamento acrescido em +1 semana. [DOCUMENTAÇÃO REQUERIDA]`,
            likes: 1200,
            retweets: 480,
            timeAgo: 'Agora',
            sentiment: 'negative',
            verified: true
          });
        }

        if (app.weeksRemaining <= 0) {
          // Find player and approve visa
          const matchPlayer = [...playerTeam.roster, ...playerTeam.substitutes, ...playerTeam.academy].find(p => p.id === app.playerId);
          if (matchPlayer) {
            matchPlayer.visaApproved = true;
            updatedState.socialFeed.unshift({
              id: 'visa_approved_' + generateId(),
              username: 'Rival_Press_News',
              handle: '@RiftNoticias',
              avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
              content: `✈️ [LIBERADO] Aprovado o visto governamental para o coreano/estrangeiro ${matchPlayer.name}! Atleta oficialmente inscrito na liga e pronto para jogar.`,
              likes: 5400,
              retweets: 990,
              timeAgo: 'Agora',
              sentiment: 'positive',
              verified: true
            });
          }
        } else {
          activeAwaitingVisas.push(app);
        }
      }
    }
  }
  playerTeam.vistasAwaiting = activeAwaitingVisas;

  // E. Salary Cap Regulatory Audits (Compliance)
  const salaryCapThreshold = 120000;
  if (basePlayerPayrollWeekly > salaryCapThreshold) {
    const exceededAmount = basePlayerPayrollWeekly - salaryCapThreshold;
    const luxuryTaxFine = Math.round(exceededAmount * 1.50);
    extraSpendingOutflow += luxuryTaxFine;
    playerTeam.creditScore = Math.max(0, playerTeam.creditScore - 20);
    updatedState.socialFeed.unshift({
      id: 'salary_cap_audit_' + generateId(),
      username: 'Compliance_Officer_League',
      handle: '@AuditoriaRivals',
      avatarUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=100',
      content: `🚨 [VIOLAÇÃO REGULATÓRIA] O clube ${playerTeam.name} excedeu o teto salarial da liga ($120.000). Uma Taxa de Luxo de multa de $ ${luxuryTaxFine.toLocaleString('pt-BR')} foi cobrada e o Score de Crédito caiu.`,
      likes: 4100,
      retweets: 930,
      timeAgo: 'Agora',
      sentiment: 'negative',
      verified: true
    });
  }

  // E2. Fair-Play Financeiro (FFP) Cumulative Tracking & Sporting Penalties
  if (playerTeam.ffpNonComplianceWeeks === undefined) {
    playerTeam.ffpNonComplianceWeeks = 0;
  }
  const isBudgetViolation = playerTeam.budget < 0;
  const isSalaryGapViolation = basePlayerPayrollWeekly > salaryCapThreshold;
  const hasActiveLoansViolation = playerTeam.loans && playerTeam.loans.length > 0;

  if (isBudgetViolation || isSalaryGapViolation || hasActiveLoansViolation) {
    // Accumulate weeks in financial non-compliance
    playerTeam.ffpNonComplianceWeeks++;
    
    // Check if the critical limit of 6 months (24 weekly periods) is reached
    if (playerTeam.ffpNonComplianceWeeks >= 24) {
      playerTeam.points = Math.max(0, (playerTeam.points || 0) - 3);
      playerTeam.ffpNonComplianceWeeks = 0; // reset accumulated indicator after penalty
      
      updatedState.socialFeed.unshift({
        id: 'ffp_points_loss_' + generateId(),
        username: 'Riot_Compliance_Officer',
        handle: '@RiotCompliance',
        avatarUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=100',
        content: `🚨 [PUNIÇÃO EXTREMA - FFP] O clube ${playerTeam.name} superou o limite regulatório de 6 meses (24 semanas) com saldo de caixa negativo, empréstimos prolongados pendentes ou estouro salarial. Perda imediata de 3 pontos na classificação da liga!`,
        likes: 15400,
        retweets: 4500,
        timeAgo: 'Agora',
        sentiment: 'negative',
        verified: true
      });
    }
  } else {
    // Graceful recovery: decay non-compliance weeks if compliant
    playerTeam.ffpNonComplianceWeeks = Math.max(0, playerTeam.ffpNonComplianceWeeks - 1);
  }

  // E3. Rival AI Teams Poaching Simulation (Every week, 12% probability of a compliance action on rival)
  if (Math.random() < 0.12) {
    const aiTeams = updatedState.teams.filter(t => !t.isPlayerControlled);
    if (aiTeams.length >= 2) {
      const offendingTeam = aiTeams[Math.floor(Math.random() * aiTeams.length)];
      const victimTeam = aiTeams.filter(t => t.id !== offendingTeam.id)[Math.floor(Math.random() * (aiTeams.length - 1))];
      const victimPlayers = [...victimTeam.roster, ...(victimTeam.substitutes || [])];
      
      if (victimPlayers.length > 0) {
        const poachedPlayer = victimPlayers[Math.floor(Math.random() * victimPlayers.length)];
        offendingTeam.budget = Math.max(0, offendingTeam.budget - 45000);
        
        updatedState.socialFeed.unshift({
          id: 'rival_poaching_fine_' + generateId(),
          username: 'Riot_Compliance_Officer',
          handle: '@RiotCompliance',
          avatarUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=100',
          content: `⚖️ [MULTA POR ALICIAMENTO] A organização ${offendingTeam.name} foi multada em $45.000 por assediar e contatar sem formalidade prévia o atleta ${poachedPlayer.name} de ${victimTeam.name}.`,
          likes: 5400,
          retweets: 1200,
          timeAgo: 'Agora',
          sentiment: 'negative',
          verified: true
        });
      }
    }
  }

  // F. Poaching Penalty reduction
  if (playerTeam.poachingPenaltiesWeeks && playerTeam.poachingPenaltiesWeeks > 0) {
    playerTeam.poachingPenaltiesWeeks--;
  }

  // Calculate Net Profit and assign to cash
  const finalWeeklyInflowSum = coreEarningsTotal + extraEarningsInflow;
  const finalWeeklyOutflowSum = coreSpendingTotal + extraSpendingOutflow;
  const netProfitTotalCalculated = finalWeeklyInflowSum - finalWeeklyOutflowSum;

  playerTeam.budget = Math.round(playerTeam.budget + netProfitTotalCalculated);

  // Bench check clause
  // "Se o jogador ficar no banco por mais de 2 rodadas consecutivas, a multa cai para zero."
  playerTeam.substitutes.forEach(p => {
    p.consecutiveBenchCount = (p.consecutiveBenchCount || 0) + 1;
  });
  playerTeam.roster.forEach(p => {
    p.consecutiveBenchCount = 0;
  });

  // G. Out Of Cash & Debt Consequences (Cobrança, Inadimplência, Recuperação Judicial)
  if (playerTeam.budget < 0) {
    const debtAmount = Math.abs(playerTeam.budget);
    const debtFee = Math.round(debtAmount * 0.08); // 8% overdraft penalty fee
    playerTeam.budget = Math.round(playerTeam.budget - debtFee);
    playerTeam.creditScore = Math.max(0, playerTeam.creditScore - 50);
    playerTeam.boardTrust = Math.max(1, playerTeam.boardTrust - 15);

    updatedState.socialFeed.unshift({
      id: 'overdraft_alert_' + generateId(),
      username: 'Rivals_Financial_Desk',
      handle: '@BancoRivals',
      avatarUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=100',
      content: `⚠️ [INDIPLÊNCIA] O orçamento do clube ${playerTeam.name} atingiu saldo vermelho de $ -${debtAmount.toLocaleString('pt-BR')}! Juros de cheque especial cobrados. A Diretoria estuda severas intervenções administrativas em splits futuros.`,
      likes: 1250,
      retweets: 350,
      timeAgo: 'Agora',
      sentiment: 'negative',
      verified: true
    });

    // Forced recuperation if deep in debt
    if (playerTeam.budget < -120000) {
      updatedState.socialFeed.unshift({
        id: 'recup_judicial_' + generateId(),
        username: 'Tribunal_Esportivo',
        handle: '@AuditoriaRivals',
        avatarUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=100',
        content: `⚖️ [RECUPERAÇÃO JUDICIAL] Organização ${playerTeam.name} declarou insolvência parcial! O controle financeiro foi assumido por split regulatório, e o Manager teve sua autoridade restrita.`,
        likes: 9200,
        retweets: 2400,
        timeAgo: 'Agora',
        sentiment: 'negative',
        verified: true
      });
      // Force sell highest-value bench athlete to recover cash immediately to show consequences
      const valuableSubstitute = [...playerTeam.substitutes, ...playerTeam.academy].sort((a, b) => b.marketValue - a.marketValue)[0];
      if (valuableSubstitute) {
        playerTeam.budget += Math.round(valuableSubstitute.marketValue * 0.75); // liquid sell
        // Remove player
        playerTeam.substitutes = playerTeam.substitutes.filter(p => p.id !== valuableSubstitute.id);
        playerTeam.academy = playerTeam.academy.filter(p => p.id !== valuableSubstitute.id);
        updatedState.socialFeed.unshift({
          id: 'forced_sell_' + generateId(),
          username: 'Rival_Transfer_Desk',
          handle: '@TransfersRivals',
          avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
          content: `💸 [VENDA INVOLUNTÁRIA] Para conter juros do cheque especial e insolvência judicial, o clube vendeu forçadamente o atleta ${valuableSubstitute.name} pelo valor liquidado de $ ${(valuableSubstitute.marketValue * 0.75).toLocaleString()}`,
          likes: 2100,
          retweets: 480,
          timeAgo: 'Agora',
          sentiment: 'neutral',
          verified: true
        });
      }
    }
  }
  }

  // 3. Player stamina recovery & minor training boosts
  if (playerTeam) {
    playerTeam.roster.forEach(p => {
      // recover stamina
      p.stamina = Math.min(100, p.stamina + 15);
      // chance of slight skill increase from active gaming center training
      const centerTLevel = playerTeam.infrastructure.trainingCenterLevel;
      if (Math.random() < 0.1 * centerTLevel) {
        const keys = Object.keys(p.attributes) as (keyof typeof p.attributes)[];
        const randomAttr = keys[Math.floor(Math.random() * keys.length)];
        if (p.attributes[randomAttr] < p.potential) {
          p.attributes[randomAttr]++;
          p.overallRating = Math.round(Object.values(p.attributes).reduce((a, b) => a + b, 0) / 9);
        }
      }
    });

    // 4. Contract months check, decrement and alert
    playerTeam.roster.forEach(p => {
      if (p.contractMonths > 0) {
        p.contractMonths--;
      }
    });
  }

  // 5. Dynamic match patches changes (every 4 weeks)
  if (currentWeek % 4 === 0) {
    const patchIndex = Math.floor(currentWeek / 4);
    updatedState.currentPatch = generateDynamicPatch(patchIndex, updatedState.champions);
    // append announcement post
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: 'LoL_Brasil_Updates',
      handle: '@LoLUpdatesBR',
      avatarUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=100',
      content: `⚠️ [PATCH NOTAS] Saiu a versão ${updatedState.currentPatch.version}! ${updatedState.currentPatch.metaDescription}. Campeões buffados: ${updatedState.currentPatch.buffedChampions.join(', ')}.`,
      likes: 1200,
      retweets: 430,
      timeAgo: 'Agora',
      sentiment: 'neutral',
      verified: true
    });
  }

  // 6. Generate academy scout updates or random talent
  if (playerTeam && Math.random() < 0.3) {
    const freshKid = generateProceduralPlayer('TOP', 60, true);
    playerTeam.academy.push(freshKid);
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: `${playerTeam.acronym}_Academy`,
      handle: `@${playerTeam.acronym}_Base`,
      avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
      content: `💎 Scouting update: Um novo talento promissor de posição ${freshKid.position} (${freshKid.name}, OVR ${freshKid.overallRating}, Potencial ${freshKid.potential}) foi detectado e ingressou na nossa academia de base!`,
      likes: 240,
      retweets: 55,
      timeAgo: 'Agora',
      sentiment: 'positive',
      verified: true
    });
  }

  // 7. Cycle available sponsors
  if (Math.random() < 0.25) {
    // Generate a fresh random sponsor
    const randomNames = ['Prudential', 'Nivea Man', 'Subway', 'Heineken 0.0', 'Intel Core', 'Samsung Odyssey'];
    const sId = 'sp_' + generateId();
    updatedState.sponsorsMarket.push({
      id: sId,
      name: randomNames[Math.floor(Math.random() * randomNames.length)],
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
      incomePerWeek: 30000 + Math.floor(Math.random() * 40000),
      signatureBonus: 50000 + Math.floor(Math.random() * 80000),
      termsInWeeks: 12,
      minPopularity: 30 + Math.floor(Math.random() * 30),
      isSigned: false,
      objective: 'Garantir KDA acima de 3.5 nos playoffs',
      objectiveBonus: 40000
    });
    if (updatedState.sponsorsMarket.length > 6) {
      updatedState.sponsorsMarket.shift(); // keep list clean
    }
  }

  // 8. Progress target weeks & handle tournament stage flow
  let playerMatchThisRound = currentWeekMatches?.find(m => m.teamBlueId === playerTeam?.id || m.teamRedId === playerTeam?.id);
  
  if (currentWeek >= 15) {
    if (updatedState.stage === 'SPLIT_REGULAR') {
      updatedState.stage = 'SPLIT_PLAYOFFS';
      // filter teams of active region for top 4
      const activeRegionTeams = updatedState.teams.filter(t => t.region === updatedState.selectedRegion);
      const topTeams = sortTeamsByLeagueRules(activeRegionTeams, updatedState.calendarSchedule);
      const team1 = topTeams[0] || updatedState.teams[0];
      const team2 = topTeams[1] || updatedState.teams[1];
      const team3 = topTeams[2] || updatedState.teams[2];
      const team4 = topTeams[3] || updatedState.teams[3];

      // Playoff Semifinals schedule for Week 16
      updatedState.calendarSchedule[16] = [
        {
          id: `sem_1_${generateId()}`,
          teamBlueId: team1.id,
          teamRedId: team4.id,
          scoreBlue: 0,
          scoreRed: 0,
          isFinished: false,
          roundIndex: 16,
          stage: 'PLAYOFFS_SEMI',
          logs: [],
          pickBans: [],
          activeGameIndex: 0
        },
        {
          id: `sem_2_${generateId()}`,
          teamBlueId: team2.id,
          teamRedId: team3.id,
          scoreBlue: 0,
          scoreRed: 0,
          isFinished: false,
          roundIndex: 16,
          stage: 'PLAYOFFS_SEMI',
          logs: [],
          pickBans: [],
          activeGameIndex: 0
        }
      ];
    } else if (currentWeek === 16) {
      // Transition Semis to Finals on Week 17
      const semiMatches = updatedState.calendarSchedule[16] || [];
      if (semiMatches.every(m => m.isFinished)) {
        const winner1Id = semiMatches[0].scoreBlue > semiMatches[0].scoreRed ? semiMatches[0].teamBlueId : semiMatches[0].teamRedId;
        const winner2Id = semiMatches[1].scoreBlue > semiMatches[1].scoreRed ? semiMatches[1].teamBlueId : semiMatches[1].teamRedId;

        updatedState.calendarSchedule[17] = [
          {
            id: `fin_1_${generateId()}`,
            teamBlueId: winner1Id,
            teamRedId: winner2Id,
            scoreBlue: 0,
            scoreRed: 0,
            isFinished: false,
            roundIndex: 17,
            stage: 'PLAYOFFS_FINAL',
            logs: [],
            pickBans: [],
            activeGameIndex: 0
          }
        ];
      }
    } else if (currentWeek === 17) {
      // Complete split. Trigger the Annual Offseason transition!
      const finalMatches = updatedState.calendarSchedule[17] || [];
      if (finalMatches.every(m => m.isFinished)) {
        const winnerId = finalMatches[0].scoreBlue > finalMatches[0].scoreRed ? finalMatches[0].teamBlueId : finalMatches[0].teamRedId;
        const championTeam = updatedState.teams.find(t => t.id === winnerId)!;

        // Post grand champion news!
        updatedState.socialFeed.unshift({
          id: generateId(),
          username: 'LoL_Esports_Global',
          handle: '@LoLEsports',
          avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
          content: `🏆 CAMPEÃO DO SPLIT! Parabéns à grande campeã ${championTeam.name} (${championTeam.acronym}) por conquistar o troféu máximo de ${updatedState.selectedRegion}! Que performance memorável!`,
          likes: 5400,
          retweets: 1800,
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: true
        });

        // Trigger International Tournament Special Visa Mechanism on qualification
        const qualTourneys = getInternationalTourneysQualified(updatedState);
        if (qualTourneys.length > 0 && playerTeam) {
          const mainTourney = qualTourneys[0];
          const taxCost = 15000;
          playerTeam.budget = Math.max(0, playerTeam.budget - taxCost);
          playerTeam.vistoEspecialTorneioAtivo = true;
          playerTeam.vistoEspecialTorneioNome = mainTourney;

          updatedState.socialFeed.unshift({
            id: 'intl_visa_tax_' + generateId(),
            username: 'Riot_Consul_Esports',
            handle: '@RiotJuris',
            avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
            content: `✈️ [CONEXÃO INTERNACIONAL] O clube ${playerTeam.name} qualificou-se com sucesso para o ${mainTourney}! Para a viagem internacional de toda a delegação de atletas e comissão técnica, foi debitada a taxa compulsória de $15.000 para "Emissão de Vistos Especiais de Torneio". O visto está ativo temporariamente!`,
            likes: 6200,
            retweets: 1540,
            timeAgo: 'Agora',
            sentiment: 'positive',
            verified: true
          });
        }

        // Run full offseason transitions!
        updatedState = executeOffseasonTransition(updatedState);
        return updatedState;
      }
    }
  }

  // --- MÓDULO DIRETORIA (BOARDROOM MANAGEMENT) TICK ENGINE ---
  if (playerTeam) {
    // 1. Garante inicialização
    if (playerTeam.boardTrust === undefined) playerTeam.boardTrust = 80;
    if (playerTeam.consecutiveWeeksBelow20 === undefined) playerTeam.consecutiveWeeksBelow20 = 0;
    if (!playerTeam.boardReprobations) playerTeam.boardReprobations = [];
    if (!playerTeam.boardLegacy) playerTeam.boardLegacy = [];
    if (!playerTeam.boardGoals) {
      playerTeam.boardGoals = [
        { id: 'goal-sports', name: 'Expectativa Esportiva', description: 'Garantir classificação para os Playoffs terminando no G4.', target: 'Playoffs / Top 4', status: 'pending' },
        { id: 'goal-finance', name: 'Expectativa Financeira', description: 'Manter folha salarial balanceada e evitar taxa de luxo.', target: 'Cumprir FFP', status: 'pending' },
        { id: 'goal-infra', name: 'Expectativa de Infraestrutura', description: 'Melhorar a Gaming House ou o Gaming Office para o Nível 2 ou contratar equipe de especialistas.', target: 'Instalações / Staff', status: 'pending' }
      ];
    }

    // 2. Cálculo do humor e comportamento semanal da diretoria
    // Vitória / Derrota mais recente
    const matchesList = updatedState.calendarSchedule[currentWeek];
    const playerMatch = matchesList?.find(m => m.teamBlueId === playerTeam.id || m.teamRedId === playerTeam.id);
    let playerTeamWonLatest = false;
    let playedMatchThisWeek = false;
    if (playerMatch && playerMatch.isFinished) {
      playedMatchThisWeek = true;
      const isPlayerBlue = playerMatch.teamBlueId === playerTeam.id;
      playerTeamWonLatest = (isPlayerBlue && playerMatch.scoreBlue > playerMatch.scoreRed) || (!isPlayerBlue && playerMatch.scoreRed > playerMatch.scoreBlue);
    }

    // Aumentos
    if (playedMatchThisWeek) {
      if (playerTeamWonLatest) {
        playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 4);
      } else {
        playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 3);
      }
    }

    // Caixa equilibrado e sem multas FFP
    const isBudgetViolation = playerTeam.budget < 0;
    const salaryCapThreshold = 120000;
    const basePlayerPayrollWeekly = playerTeam.roster.reduce((acc, p) => acc + p.salary / 4, 0);
    const isSalaryGapViolation = basePlayerPayrollWeekly > salaryCapThreshold;
    
    if (playerTeam.budget > 120000 && !isBudgetViolation && !isSalaryGapViolation) {
      playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 1);
    }

    // Quedas / Penas administrativas
    // A. Estouro de FFP / Multas
    if (playerTeam.ffpNonComplianceWeeks && playerTeam.ffpNonComplianceWeeks > 0) {
      playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 4);
      const wasRegistered = playerTeam.boardReprobations.some(r => r.type === 'Compliance' && r.week === currentWeek);
      if (!wasRegistered) {
        const detailStr = isBudgetViolation ? 'Orçamento negativo (Cheque Especial)' : (isSalaryGapViolation ? 'Folha semanal excede teto salarial' : 'Débitos de empréstimos ativos');
        playerTeam.boardReprobations.push({
          id: `ffp-fail-${currentWeek}-${Date.now()}`,
          week: currentWeek,
          type: 'Compliance',
          description: `Violação persistente das normas de Fairplay Financeiro: ${detailStr}. Tolerância em ${playerTeam.ffpNonComplianceWeeks}/24 semanas críticas.`,
          cost: isSalaryGapViolation ? 10000 : 2500
        });
      }
    }

    // B. Aliciamento (Poaching)
    if (playerTeam.poachingPenaltiesWeeks && playerTeam.poachingPenaltiesWeeks > 0) {
      playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 5);
      const wasRegistered = playerTeam.boardReprobations.some(r => r.type === 'Aliciamento' && r.week === currentWeek);
      if (!wasRegistered) {
        playerTeam.boardReprobations.push({
          id: `poach-fail-${currentWeek}-${Date.now()}`,
          week: currentWeek,
          type: 'Aliciamento',
          description: `Sanção regulatória por aliciamento investigado de atletas do circuito. Reclamação das organizações rivais aceita pelo júri.`,
          cost: 45000
        });
      }
    }

    // C. Vistos consular de atletas suspensos/reprovados
    const visaAtrs = playerTeam.vistasAwaiting?.filter(v => v.hasDocumentationRequest) || [];
    if (visaAtrs.length > 0) {
      playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 2 * visaAtrs.length);
      const wasRegistered = playerTeam.boardReprobations.some(r => r.type === 'Imigração' && r.week === currentWeek);
      if (!wasRegistered) {
        playerTeam.boardReprobations.push({
          id: `visto-fail-${currentWeek}-${Date.now()}`,
          week: currentWeek,
          type: 'Imigração',
          description: `Visto consular do atleta ${visaAtrs[0].name} travado por inconsistência documental e multas atrasadas.`,
          cost: 2500
        });
      }
    }

    // D. Baixo nível de apoio da torcida
    if (playerTeam.fansSupport < 50) {
      playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 1);
      if (currentWeek % 4 === 0) {
        const wasRegistered = playerTeam.boardReprobations.some(r => r.type === 'Opinião Pública' && r.week === currentWeek);
        if (!wasRegistered) {
          playerTeam.boardReprobations.push({
            id: `fans-complaint-${currentWeek}-${Date.now()}`,
            week: currentWeek,
            type: 'Opinião Pública',
            description: `A torcida do time realizou boicote e pichações de protesto devido à fraca popularidade (${playerTeam.fansSupport}%) do elenco atual.`
          });
        }
      }
    }

    // 3. Verificação de Metas / Expectativas e Legados
    // A. Expectativa Esportiva (Garantir Playoffs no Split Atual - Fim da Semana 15)
    if (currentWeek === 15) {
      const activeRegionTeams = updatedState.teams.filter(t => t.region === updatedState.selectedRegion);
      const topTeams = activeRegionTeams.sort((a, b) => b.wins - a.wins || (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses) || b.budget - a.budget);
      const isUserInTop4 = topTeams.slice(0, 4).some(t => t.id === playerTeam.id);
      const sportsGoal = playerTeam.boardGoals.find(g => g.id === 'goal-sports');
      if (sportsGoal && sportsGoal.status === 'pending') {
        if (isUserInTop4) {
          sportsGoal.status = 'achieved';
          playerTeam.boardLegacy.push({
            id: `sports-ach-${currentWeek}-${Date.now()}`,
            event: 'Classificação Garantida nos Playoffs',
            week: currentWeek,
            detail: `Garantida a presença nas semifinais da liga terminando no bloco dos quatro melhores times do campeonato (Top 4).`,
            category: 'Competição'
          });
          playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 15);
        } else {
          sportsGoal.status = 'failed';
          playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 20);
          playerTeam.boardReprobations.push({
            id: `sports-fail-${currentWeek}-${Date.now()}`,
            week: currentWeek,
            type: 'Competição',
            description: `O time foi eliminado na fase de pontos do split regular, falhando o objetivo primário de consolidação de playoffs.`
          });
        }
      }
    }

    // B. Expectativa Financeira (Evitar Multas e Manter Superávit - Fim do Split Semana 17)
    if (currentWeek === 17) {
      const financeGoal = playerTeam.boardGoals.find(g => g.id === 'goal-finance');
      if (financeGoal && financeGoal.status === 'pending') {
        const totalReprobationsFinance = playerTeam.boardReprobations.filter(r => r.type === 'Compliance').length;
        if (totalReprobationsFinance === 0 && playerTeam.budget > 120000) {
          financeGoal.status = 'achieved';
          playerTeam.boardLegacy.push({
            id: `finance-ach-${currentWeek}-${Date.now()}`,
            event: 'Contabilidade Perfeita',
            week: currentWeek,
            detail: `Parabenização por manter uma folha extremamente balanceada e superávit sólido ao final do campeonato sem registrar alertas de luxo.`,
            category: 'Finanças'
          });
          playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 12);
        } else {
          financeGoal.status = 'failed';
          playerTeam.boardTrust = Math.max(0, playerTeam.boardTrust - 15);
          playerTeam.boardReprobations.push({
            id: `finance-fail-${currentWeek}-${Date.now()}`,
            week: currentWeek,
            type: 'Financeiro',
            description: `O balanço de encerramento revelou folha salarial excessiva, empréstimos impagos ou estouro recorrente de juros.`
          });
        }
      }
    }

    // C. Expectativa de Infraestrutura / Desenvolvimento (Evoluir Ghana/Office de nível ou contratar especialista)
    const infraGoal = playerTeam.boardGoals.find(g => g.id === 'goal-infra');
    if (infraGoal && infraGoal.status === 'pending') {
      const levelGH = playerTeam.infrastructure?.gamingHouseLevel || 1;
      const levelTC = playerTeam.infrastructure?.trainingCenterLevel || 1;
      const levelMT = playerTeam.infrastructure?.mediaTeamLevel || 1;
      const hiredStaffCount = updatedState.availableStaff?.filter(s => s.hired).length || 0;
      const corpStaffCount = updatedState.corporationStaffEmployees?.length || 0;
      if (levelGH > 1 || levelTC > 1 || levelMT > 1 || hiredStaffCount > 1 || corpStaffCount > 0) {
        infraGoal.status = 'achieved';
        playerTeam.boardLegacy.push({
          id: `infra-ach-${currentWeek}-${Date.now()}`,
          event: 'Expansão Estrutural',
          week: currentWeek,
          detail: `Ampliação material das instalações e infraestrutura profissional (Gaming House/Training Center) ou consolidação de comissão especializada.`,
          category: 'Instalações'
        });
        playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 10);
      }
    }

    // Vistoria de sucesso como legado
    if ((currentWeek % 8 === 3 || currentWeek % 8 === 7) && (!isBudgetViolation && !isSalaryGapViolation)) {
      playerTeam.boardTrust = Math.min(100, playerTeam.boardTrust + 3);
      const wasRegistered = playerTeam.boardLegacy.some(l => l.id && l.id.startsWith(`compliance-sec-${currentWeek}`));
      if (!wasRegistered) {
        playerTeam.boardLegacy.push({
          id: `compliance-sec-${currentWeek}-${Date.now()}`,
          event: 'Conformidade de Auditoria',
          week: currentWeek,
          detail: `Licenciamento legal auditado pela Riot aprovado em perfeitas condições, sem atritos ou inconformidades no Fair-Play Financeiro.`,
          category: 'Licenciamento'
        });
      }
    }

    // 4. Mecânica Crítica de Queda: Demissão se ficar abaixo de 20% por 3 semanas consecutivas
    if (playerTeam.boardTrust < 20) {
      playerTeam.consecutiveWeeksBelow20++;
      if (playerTeam.consecutiveWeeksBelow20 >= 3) {
        const wasFiredLogged = playerTeam.boardReprobations.some(r => r.type === 'Incompetência Administrativa');
        if (!wasFiredLogged) {
          playerTeam.boardReprobations.push({
            id: `demission-notice-${currentWeek}-${Date.now()}`,
            week: currentWeek,
            type: 'Incompetência Administrativa',
            description: `PARECER DA JUNTA EXECUTIVA DO CLUBE: O conselho decidiu de forma unânime e irremediável rescindir o vínculo de emprego técnica com o Manager por desconfiança geral crônica.`,
            cost: 0
          });

          // Disparar e-mail urgente de demissão
          try {
            const existingEmailsRaw = localStorage.getItem('legendshub_custom_events_emails');
            let currentEmails = [];
            if (existingEmailsRaw) {
              currentEmails = JSON.parse(existingEmailsRaw);
            }
            const demissionEmail = {
              id: `email-demission-${Date.now()}`,
              sender: 'Presidente do Conselho Deliberativo',
              senderRole: 'Líder Executivo',
              subject: `🚨 NOTIFICAÇÃO COMPULSÓRIA DE DEMISSÃO: Rescisão Unilateral de Contrato`,
              body: `Caro Diretor Técnico, comunicamos com pesar que diante de seu baixo desempenho fiscal e gerencial e do índice crítico e continuado de desconfiança da diretoria (${playerTeam.boardTrust}%), o conselho deliberativo aprovou a sua dispensa oficial. Você está demitido.`,
              date: `Semana ${currentWeek}`,
              category: 'Direção' as const,
              read: false,
              actionLabel: 'Ver Quadro de Propostas',
              linkTab: 'Central de Empregos'
            };
            localStorage.setItem('legendshub_custom_events_emails', JSON.stringify([demissionEmail, ...currentEmails]));
            window.dispatchEvent(new Event('emails-updated'));
          } catch (e) {
            console.warn("Could not dispatch demission email:", e);
          }

          // Brasfoot Fire Trigger: Disconnect player and reset playerTeamId to let them face proposals popup
          updatedState.playerTeamId = '';
          if (updatedState.managers) {
            const playerMgr = updatedState.managers.find(m => m.id === 'player-manager');
            if (playerMgr) {
              playerMgr.teamId = null;
            }
          }
        }
      }
    } else {
      playerTeam.consecutiveWeeksBelow20 = 0;
    }
  }

  updatedState.week++;
  
  const getExtendedMonthIndex = (weekNum: number): number => {
    if (weekNum <= 4)   return 0;
    if (weekNum <= 8)   return 1;
    if (weekNum <= 12)  return 2;
    if (weekNum <= 16)  return 3;
    if (weekNum <= 20)  return 4;
    if (weekNum <= 24)  return 5;
    if (weekNum <= 28)  return 6;
    return 7;
  };
  
  updatedState.currentDay = 10 + (updatedState.week * 2) % 19;
  updatedState.currentMonthIndex = getExtendedMonthIndex(updatedState.week);
  updatedState.roundsPlayedThisWeek = false;

  return updatedState;
}

// Full Offseason system wrapping: aging, attribute evolution, retirements and IA transfers
export function executeOffseasonTransition(gameState: GameState): GameState {
  const updatedState = { ...gameState };
  if (updatedState.selectedYear) {
    updatedState.selectedYear++;
  } else {
    updatedState.selectedYear = updatedState.season + 1;
  }
  updatedState.season = updatedState.selectedYear;
  updatedState.week = 1;
  updatedState.currentDay = 12;
  updatedState.currentMonthIndex = 0;
  updatedState.stage = 'OFFSEASON';

  let retiredNames: string[] = [];

  // 1. AGE INCREMENT AND ATTRIBUTE EVOLUTION
  updatedState.teams.forEach(team => {
    // Process main roster, subs, and academy
    const allPlayersList = [...team.roster, ...team.substitutes, ...team.academy];
    
    allPlayersList.forEach(p => {
      p.age++; // increment age yearly
      
      // Evolution of attributes by age
      const keys = Object.keys(p.attributes) as (keyof typeof p.attributes)[];
      
      if (p.age <= 21) {
        // High evolution for young players
        keys.forEach(k => {
          if (p.attributes[k] < p.potential && Math.random() < 0.6) {
            p.attributes[k] = Math.min(99, p.attributes[k] + Math.floor(Math.random() * 3) + 1);
          }
        });
      } else if (p.age >= 22 && p.age <= 25) {
        // Stable prime years (minor macro & communication increases)
        keys.forEach(k => {
          if ((k === 'macro' || k === 'communication' || k === 'leadership') && p.attributes[k] < p.potential && Math.random() < 0.3) {
            p.attributes[k] = Math.min(99, p.attributes[k] + 1);
          }
        });
      } else {
        // Age decay for veterans (decline in mechanics/emotional control, growth in macro/leadership/experiência)
        keys.forEach(k => {
          if (k === 'mechanics' || k === 'consistency') {
            if (p.attributes[k] > 50 && Math.random() < 0.45) {
              p.attributes[k] = Math.max(50, p.attributes[k] - Math.floor(Math.random() * 2) - 1);
            }
          } else if (k === 'macro' || k === 'leadership' || k === 'communication') {
            if (p.attributes[k] < 99 && Math.random() < 0.4) {
              p.attributes[k] = Math.min(99, p.attributes[k] + 1);
            }
          }
        });
      }

      // Recalculate overall rating
      const sum = Object.values(p.attributes).reduce((a, b) => a + b, 0);
      p.overallRating = Math.round(sum / keys.length);
    });
  });

  // 2. AUTOMATIC RETIREMENTS
  updatedState.teams.forEach(team => {
    const startSize = team.roster.length;
    
    // Check main roster for retirement
    const retiredRoster: Player[] = [];
    team.roster = team.roster.filter(p => {
      if (p.age >= 28) {
        const retireChance = p.age === 28 ? 0.20 : p.age === 29 ? 0.50 : 0.85;
        if (p.name !== 'Faker' || p.age >= 31) { // Faker has a bit more stamina/longevity!
          if (Math.random() < retireChance) {
            retiredNames.push(p.name);
            return false;
          }
        }
      }
      return true;
    });

    // Check substitutes
    team.substitutes = team.substitutes.filter(p => {
      if (p.age >= 28) {
        const retireChance = p.age === 28 ? 0.25 : p.age === 29 ? 0.55 : 0.90;
        if (Math.random() < retireChance) {
          retiredNames.push(p.name);
          return false;
        }
      }
      return true;
    });
  });

  // Share retirement headlines
  if (retiredNames.length > 0) {
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: 'LoL_Legends_Legacy',
      handle: '@LegendsLegacy',
      avatarUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=100',
      content: `📰 APOSENTADORIA: Os veteranos do League competitivo [${retiredNames.slice(0, 5).join(', ')}] anunciaram oficialmente suas aposentadorias das quadras nesta virada de ano! Que carreira vitoriosa!`,
      likes: 3800,
      retweets: 980,
      timeAgo: 'Fim de Temporada',
      sentiment: 'neutral',
      verified: true
    });
  }

  // 3. REFILL RETIREMENT CAUTIOUS VACANCIES (Ensure everyone has active 5 starting positions)
  updatedState.teams.forEach(team => {
    const roles: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    roles.forEach(role => {
      const hasPos = team.roster.some(p => p.position === role);
      if (!hasPos) {
        // Look in substitutes first
        const subIndex = team.substitutes.findIndex(p => p.position === role);
        if (subIndex >= 0) {
          const promo = team.substitutes.splice(subIndex, 1)[0];
          team.roster.push(promo);
        } else {
          // Look in academy base
          const acadIndex = team.academy.findIndex(p => p.position === role);
          if (acadIndex >= 0) {
            const promo = team.academy.splice(acadIndex, 1)[0];
            team.roster.push(promo);
          } else {
            // Generate procedurally generated talent
            const targetOvr = Math.min(88, Math.max(70, 68 + Math.floor(team.popularity * 0.15)));
            const replacement = generateProceduralPlayer(role, targetOvr, false);
            replacement.name = replacement.name + ' Jr.'; // aesthetic label
            team.roster.push(replacement);
          }
        }
      }
    });
  });

  // 4. AI TRANSFER SYSTEMS (Bot teams evaluate and sign higher-rated replacements)
  const transferLogList: string[] = [];
  updatedState.teams.forEach(team => {
    if (!team.isPlayerControlled && Math.random() < 0.35) {
      // Find weakest starting position below 82 OVR
      const sortedByOvr = [...team.roster].sort((a, b) => a.overallRating - b.overallRating);
      const weakPlayer = sortedByOvr[0];
      
      if (weakPlayer && weakPlayer.overallRating < 84) {
        // Scan other teams' bench or free pools
        let bestCandidate: Player | null = null;
        let candidateTeam: Team | null = null;
        
        updatedState.teams.forEach(otherTeam => {
          if (otherTeam.id !== team.id && !otherTeam.isPlayerControlled) {
            otherTeam.substitutes.forEach(sub => {
              if (sub.position === weakPlayer.position && sub.overallRating > weakPlayer.overallRating + 2) {
                if (!bestCandidate || sub.overallRating > bestCandidate.overallRating) {
                  bestCandidate = sub;
                  candidateTeam = otherTeam;
                }
              }
            });
          }
        });

        if (bestCandidate && candidateTeam) {
          // Swap positions of this bench player!
          const actualPl: Player = bestCandidate;
          if (team.budget >= actualPl.marketValue * 0.8) {
            // Remove bench player from old team
            candidateTeam.substitutes = candidateTeam.substitutes.filter(p => p.id !== actualPl.id);
            
            // Move weak player to the bench of the new team
            team.roster = team.roster.filter(p => p.id !== weakPlayer.id);
            candidateTeam.substitutes.push(weakPlayer);
            
            // Add actualPl to the starting roster
            team.roster.push(actualPl);
            
            // Re-map colors/controlled variables
            actualPl.isPlayerControlled = false;
            weakPlayer.isPlayerControlled = false;
            
            // Trade budget
            team.budget -= Math.round(actualPl.marketValue * 0.8);
            candidateTeam.budget += Math.round(actualPl.marketValue * 0.8);

            transferLogList.push(`${team.acronym} contratou ${actualPl.name} da ${candidateTeam.acronym}`);
          }
        }
      }
    }
  });

  if (transferLogList.length > 0) {
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: 'eSports_Mercado',
      handle: '@LigueMercado',
      avatarUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100',
      content: `💥 JANELA DE TRANSFERÊNCIAS: Negociações intensas concluídas! Destaques: [${transferLogList.slice(0, 4).join(' | ')}]. Roster competitivo renovado!`,
      likes: 1200,
      retweets: 410,
      timeAgo: 'Período de Contratos',
      sentiment: 'positive',
      verified: true
    });
  }

  // 5. RESTORE WINS/STANDINGS FOR ALL 60 TEAMS
  updatedState.teams.forEach(team => {
    team.wins = 0;
    team.losses = 0;
    team.points = 0;
    team.gameWins = 0;
    team.gameLosses = 0;
    team.streak = '-';
  });

  // 6. GENERATE FRESH SCHEDULE FOR ACTIVE REGION
  const activeRegionTeams = updatedState.teams.filter(t => t.region === updatedState.selectedRegion);
  updatedState.calendarSchedule = scheduleDoubleRoundRobin(activeRegionTeams);

  // Re-roll sponsor market
  updatedState.sponsorsMarket = [...SPONSOR_PRESETS];

  // Meta Shifts Event by Riot Games exactly every cycle of 7 months (7 months * 4 weeks = 28 weeks)
  if (updatedState.week > 0 && updatedState.week % 28 === 0) {
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: "Riot @riot",
      handle: "@riot",
      avatarUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100",
      content: "🚨 Anúncio oficial de atualização drástica e mudanças nas diretrizes do Meta competitivo de League of Legends (alterando coeficientes de draft e prioridades de rota).",
      likes: 62000,
      retweets: 24000,
      timeAgo: "Agora",
      sentiment: "neutral",
      verified: true
    });
    
    updatedState.socialFeed.unshift({
      id: generateId(),
      username: "Riot Esports @riotesports",
      handle: "@riotesports",
      avatarUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100",
      content: "📢 RIOT OFFICIAL: Estão sendo alterados todos os pesos estratégicos de lanes de rotas e prioridades de Picks & Bans competitivos em League of Legends. Ajustem suas drafts!",
      likes: 45000,
      retweets: 12500,
      timeAgo: "Agora",
      sentiment: "neutral",
      verified: true
    });
  }

  return updatedState;
}

export function signSponsorContract(gameState: GameState, sponsorId: string): GameState {
  const updated = { ...gameState };
  const team = updated.teams.find(t => t.id === updated.playerTeamId)!;
  const sponsor = updated.sponsorsMarket.find(s => s.id === sponsorId);

  if (sponsor && team.popularity >= sponsor.minPopularity) {
    // apply signing bonus
    team.budget += sponsor.signatureBonus;
    sponsor.isSigned = true;
    team.sponsors.push({
      ...sponsor,
      activeWeeks: sponsor.termsInWeeks
    });
    // clean from market
    updated.sponsorsMarket = updated.sponsorsMarket.filter(s => s.id !== sponsorId);
    
    // add news item
    updated.socialFeed.unshift({
      id: generateId(),
      username: 'eSportsFinancas',
      handle: '@EsportsFinance',
      avatarUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100',
      content: `💰 NEGÓCIO FECHADO! ${team.name} fechou patrocínio de alto impacto com a ${sponsor.name}! Estimativas apontam bônus de assinatura imediato de $${sponsor.signatureBonus / 1000}k no cofre da organização.`,
      likes: 680,
      retweets: 140,
      timeAgo: 'Agora',
      sentiment: 'positive',
      verified: true
    });
  }

  return updated;
}

export function hireStaffMember(gameState: GameState, staffId: string): GameState {
  const updated = { ...gameState };
  const team = updated.teams.find(t => t.id === updated.playerTeamId)!;
  const staff = updated.availableStaff.find(s => s.id === staffId);

  if (staff && !staff.hired && team.budget >= staff.salary * 4) {
    // Hire staff
    staff.hired = true;
    
    // add news item
    updated.socialFeed.unshift({
      id: generateId(),
      username: `${team.acronym}_News`,
      handle: `@${team.acronym}News`,
      avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
      content: `🧠 Bem-vindo, Professor! O manager assinou novo acordo e integrou ${staff.name} como nosso novo ${staff.role}! O rating tático da equipe subiu consideravelmente.`,
      likes: 540,
      retweets: 95,
      timeAgo: 'Agora',
      sentiment: 'positive',
      verified: true
    });
  }

  return updated;
}

export function isEuropeanNationality(nationality: string): boolean {
  if (!nationality) return false;
  const normalized = (nationality || '').trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removes accents
  
  const europeanKeywords = [
    'alemanha', 'germany', 'de', 'deutschland',
    'reino unido', 'united kingdom', 'gb', 'uk', 'england', 'inglaterra',
    'suecia', 'sweden', 'se',
    'franca', 'france', 'fr',
    'espanha', 'spain', 'es',
    'polonia', 'poland', 'pl',
    'portugal', 'pt',
    'italia', 'italy', 'it',
    'grecia', 'greece', 'gr',
    'dinamarca', 'denmark', 'dk',
    'belgica', 'belgium', 'be',
    'noruega', 'norway', 'no',
    'finlandia', 'finland', 'fi',
    'holanda', 'netherlands', 'nl', 'paises baixos',
    'irlanda', 'ireland', 'ie',
    'austria', 'at',
    'suica', 'switzerland', 'ch',
    'ucrania', 'ukraine', 'ua',
    'turquia', 'turkey', 'tr',
    'tcheca', 'czech', 'cz',
    'romenia', 'romania', 'ro',
    'croacia', 'croatia', 'hr',
    'lituania', 'lithuania', 'lt',
    'eslovaquia', 'slovakia', 'sk',
    'eslovenia', 'slovenia', 'si',
    'hungria', 'hungary', 'hu',
    'letonia', 'latvia', 'lv',
    'estonia', 'estonia', 'ee',
    'bulgaria', 'bulgaria', 'bg',
    'islandia', 'iceland', 'is',
    'servia', 'serbia', 'rs',
    'europa', 'europe', 'eu',
    'skewmond'
  ];
  
  return europeanKeywords.some(keyword => normalized.includes(keyword));
}

export function getPlayerRegion(nationality: string): string {
  const nat = (nationality || '').trim().toLowerCase();
  if (nat === 'brasil' || nat === 'brazil' || nat === 'br') return 'CBLOL';
  if (nat === 'coreia do sul' || nat === 'south korea' || nat === 'kr' || nat === 'korean' || nat === 'coreia') return 'LCK';
  if (nat === 'china' || nat === 'chinese' || nat === 'cn') return 'LPL';
  if (nat === 'eua' || nat === 'usa' || nat === 'united states' || nat === 'canadá' || nat === 'canada' || nat === 'norte-americano') return 'LCS';
  
  if (isEuropeanNationality(nationality)) return 'LEC';
  
  return '';
}

export function getIsForeign(nationality: string, teamRegion?: string): boolean {
  if (!teamRegion) teamRegion = 'CBLOL';
  
  // Geopolitical custom rule: European to LEC is always local
  if (teamRegion === 'LEC' && isEuropeanNationality(nationality)) {
    return false;
  }
  
  const pRegion = getPlayerRegion(nationality);
  return pRegion !== teamRegion;
}

export function setupTeamPlayersVisas(team: Team) {
  const processPlayer = (p: Player) => {
    const isForeign = getIsForeign(p.nationality, team.region);
    p.isImported = isForeign;
    if (!isForeign) {
      p.visaApproved = true;
    } else {
      if (p.visaApproved === undefined) {
        p.visaApproved = false;
      }
    }
  };
  if (team.roster) team.roster.forEach(processPlayer);
  if (team.substitutes) team.substitutes.forEach(processPlayer);
  if (team.academy) team.academy.forEach(processPlayer);

  // Expurgo check & Bypass for legitimate Europeans / local players in the visa waitlist (vistasAwaiting)
  if (team.vistasAwaiting && team.vistasAwaiting.length > 0) {
    team.vistasAwaiting = team.vistasAwaiting.filter(app => {
      const matchP = [...(team.roster || []), ...(team.substitutes || []), ...(team.academy || [])].find(p => p.id === app.playerId);
      if (matchP) {
        const isForeign = getIsForeign(matchP.nationality, team.region);
        if (!isForeign) {
          matchP.isImported = false;
          matchP.visaApproved = true;
          return false; // Force remove card from the visa waitlist!
        }
      }
      return true;
    });
  }
}

export function sortTeamsByLeagueRules(
  teams: Team[],
  calendarSchedule?: { [weekNumber: number]: MatchSeries[] }
): Team[] {
  return [...teams].sort((a, b) => {
    // Primary: Series wins
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    
    // Fewer losses is better
    if (a.losses !== b.losses) {
      return a.losses - b.losses;
    }

    // 1. MW - Map Wins (gameWins)
    if (b.gameWins !== a.gameWins) {
      return b.gameWins - a.gameWins;
    }

    // 2. SD - Score Delta (gameWins - gameLosses)
    const aDelta = a.gameWins - a.gameLosses;
    const bDelta = b.gameWins - b.gameLosses;
    if (bDelta !== aDelta) {
      return bDelta - aDelta;
    }

    // 3. Head-to-Head (Confronto Direto)
    if (calendarSchedule) {
      let aWinsAgainstB = 0;
      let bWinsAgainstA = 0;

      Object.values(calendarSchedule).forEach((weekMatches) => {
        if (!Array.isArray(weekMatches)) return;
        weekMatches.forEach((m) => {
          if (!m.isFinished) return;
          
          if (m.teamBlueId === a.id && m.teamRedId === b.id) {
            if (m.scoreBlue > m.scoreRed) aWinsAgainstB++;
            else if (m.scoreRed > m.scoreBlue) bWinsAgainstA++;
          } else if (m.teamBlueId === b.id && m.teamRedId === a.id) {
            if (m.scoreBlue > m.scoreRed) bWinsAgainstA++;
            else if (m.scoreRed > m.scoreBlue) aWinsAgainstB++;
          }
        });
      });

      if (bWinsAgainstA !== aWinsAgainstB) {
        return bWinsAgainstA - aWinsAgainstB;
      }
    }

    // Fallback: Points
    const bPoints = b.points || 0;
    const aPoints = a.points || 0;
    if (bPoints !== aPoints) {
      return bPoints - aPoints;
    }

    // Fallback: Popularity
    const bPopularity = b.popularity || 0;
    const aPopularity = a.popularity || 0;
    if (bPopularity !== aPopularity) {
      return bPopularity - aPopularity;
    }

    return a.name.localeCompare(b.name);
  });
}

export function getInternationalTourneysQualified(gameState: GameState): string[] {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
  if (!playerTeam) return [];
  
  const qualified: string[] = [];
  const region = playerTeam.region || 'CBLOL';
  const regionalTeams = gameState.teams.filter(t => (t.region || 'CBLOL') === region);
  const sorted = sortTeamsByLeagueRules(regionalTeams, gameState.calendarSchedule);
  
  const rank = sorted.findIndex(t => t.id === playerTeam.id) + 1; // 1-indexed rank
  
  if (rank <= 2) {
    qualified.push('MSI');
  }
  if (rank <= 3) {
    qualified.push('Worlds (Mundial)');
  }
  if (rank <= 3) {
    qualified.push('CBOLÃO');
  }
  
  return qualified;
}

export function generateProceduralStaff(departamento: CorporationStaff['departamento']): CorporationStaff {
  const maleFirst = ['Rodrigo', 'Bruno', 'Marcelo', 'Gustavo', 'Caio', 'Thiago', 'Felipe', 'Rafael', 'Matheus', 'Lucas', 'Gabriel', 'Daniel', 'Carlos', 'Guilherme', 'Leonardo', 'Roberto', 'Alexandre', 'Fábio'];
  const femaleFirst = ['Camila', 'Beatriz', 'Juliana', 'Mariana', 'Letícia', 'Amanda', 'Carolina', 'Gabriela', 'Larissa', 'Luana', 'Fernanda', 'Aline', 'Isabela', 'Clara', 'Patrícia', 'Vanessa', 'Bruna'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Moraes', 'Mendes', 'Nascimento'];

  const nationalities = [
    { nome: 'Brasil', band: '🇧🇷' },
    { nome: 'Coreia do Sul', band: '🇰🇷' },
    { nome: 'China', band: '🇨🇳' },
    { nome: 'Suécia', band: '🇸🇪' },
    { nome: 'Alemanha', band: '🇩🇪' },
    { nome: 'França', band: '🇫🇷' },
    { nome: 'Estados Unidos', band: '🇺🇸' }
  ];

  const isFemale = Math.random() < 0.35;
  const firstName = isFemale 
    ? femaleFirst[Math.floor(Math.random() * femaleFirst.length)]
    : maleFirst[Math.floor(Math.random() * maleFirst.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const nome = `${firstName} ${lastName}`;

  const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
  const idade = Math.floor(24 + Math.random() * 21); // 24 to 44
  const nivel_eficiencia = Math.floor(65 + Math.random() * 31); // 65 to 95
  const salario_semanal = Math.round((1200 + (nivel_eficiencia - 65) * 100) * (0.9 + Math.random() * 0.2));

  let cargo = '';
  let especialidade = '';
  let fotoUrl = '';

  if (departamento === 'COMISSÃO TÉCNICA') {
    const cargos = ['Head Coach', 'Assistant Coach', 'Analista Sniper', 'Analista Macro', 'Positional Coach'];
    const specs = [
      'Controle de Wave e Prioridade de Rota',
      'Drafting sob Pressão e Combinações de Counters',
      'Desenvolvimento de Jovens Talentos da Academy',
      'Análise Estatística de Win-rate por Composição',
      'Gestão de Crise e Comunicação Interna'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else if (departamento === 'TI') {
    const cargos = ['Engenheiro de Redes', 'Analista de Big Data desportivo', 'Desenvolvedor da Ferramenta de Tracking', 'Arquiteto de Banco de Dados de Scrims', 'Administrador de Hardware e Ping'];
    const specs = [
      'Mitigação de Latência em Ambiente de Competição',
      'Análise Preditiva de Padrões de Ward de Bots',
      'Plataforma Integrada de Análise de Vídeos de Partida',
      'Análise de Heatmaps de Movimentação no Rift',
      'Customização de Conectores de API do Servidor'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else if (departamento === 'MARKETING') {
    const cargos = ['Brand Manager', 'Social Media Lead', 'Videomaker Executivo', 'Designer de Uniformes & Merch', 'Gerente de Patrocínios / PR'];
    const specs = [
      'Campanhas de Lançamento de Jerseys Premium',
      'Conteúdo Audiovisual e Reels para Redes',
      'Gestão de Direitos de Imagem de Criadores',
      'Ativação de Patrocinadores em Streamings',
      'Engajamento Orgânico de Comunidade Ativa'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else if (departamento === 'SAÚDE') {
    const cargos = ['Psicólogo de Performance', 'Fisioterapeuta Postural', 'Nutricionista de E-sports', 'Mental Coach', 'Personal Trainer de Delegação'];
    const specs = [
      'Controle de Ansiedade em Palco e Respiração',
      'Prevenção de Síndrome do Túnel do Carpo e LER',
      'Suplementação Focada em Concentração Prolongada',
      'Gestão do Sono de Atletas Profissionais',
      'Prevenção de Burnout e Equilíbrio de Rotina'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else if (departamento === 'JURÍDICO') {
    const cargos = ['Diretor Jurídico', 'Advogado Desportivo', 'Especialista em Contratos Internacionais', 'Consultor Jurídico de Marcas', 'Compliance Officer de E-sports'];
    const specs = [
      'Bylaws Desportivos da Liga e Transferências',
      'Minutas de Contratos de Atletas e Direitos Civis',
      'Garantias Contratuais e Prevenção de Multas',
      'Compliance de Parcerias e Patrocínios',
      'Resolução de Conflitos e Mediação de Disputas'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1507591064344-4c6b5614d601?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else if (departamento === 'OLHEIROS') {
    const cargos = ['Scout Internacional', 'Analista de Jogadores Amadores', 'Head of Scouting', 'Talent Finder'];
    const specs = [
      'Mapeamento de SoloQ de Alta Classificação (KR/CN)',
      'Avaliação de Potencial Mecânico de Atletas Academy',
      'Busca de Talentos Amadores em Campeonatos de Base',
      'Relatórios Estatísticos de Pool de Campeões de Atletas'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  } else { // 'RH'
    const cargos = ['Gerente Geral do Gaming House', 'People & Culture Lead', 'Coordenador de Bem-Estar', 'Recrutador Executivo de Staff'];
    const specs = [
      'Onboarding de Staff e Clima de Trabalho',
      'Integração Cultural de Atletas Estrangeiros',
      'Organização de Retiros de Team Building',
      'Otimização de Produtividade em Ambientes Compartilhados'
    ];
    const pics = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
    ];
    cargo = cargos[Math.floor(Math.random() * cargos.length)];
    especialidade = specs[Math.floor(Math.random() * specs.length)];
    fotoUrl = pics[Math.floor(Math.random() * pics.length)];
  }

  return {
    id: 'job-procedural-' + generateId(),
    nome,
    cargo,
    departamento,
    salario_semanal,
    semanas_contrato: 32,
    nivel_eficiencia,
    patrocinio_bonus: Math.random() < 0.4 ? Number((0.05 + Math.random() * 0.15).toFixed(2)) : undefined,
    fotoUrl,
    nacionalidade: nat.nome,
    bandeira: nat.band,
    idade,
    especialidade
  };
}

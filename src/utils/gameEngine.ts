/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Team, MatchSeries, Player, Sponsor, Staff, GamePatch, Position } from '../types';
import { CHAMPIONS_LIST, SPONSOR_PRESETS, STAFF_PRESETS, INITIAL_TEAMS_DATA, REGIONAL_TEAMS_DATABASE, INITIAL_PLAYER_ROSTER, INITIAL_PLAYER_SUBS } from '../data/initialDatabase';
import { generateProceduralPlayer, generateDynamicPatch, generateSocialFeed, generateId } from './generators';
import { simulateBotMatch } from './matchSimulator';
import { getPlayersForTeam } from '../data/realPlayers';

export function initializeNewGame(
  managerName: string,
  selectedTeamId: string,
  selectedRegion: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' = 'CBLOL',
  selectedYear: number = 2026
): GameState {
  // Load ALL 60 teams across all 6 regions to allow full global system (transfers, scouting, etc.)
  const regions: ('CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP')[] = ['CBLOL', 'LCK', 'LPL', 'LEC', 'LCS', 'LCP'];
  const allTeams: Team[] = [];

  regions.forEach(reg => {
    const regionalData = REGIONAL_TEAMS_DATABASE[reg] || [];
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
          generateProceduralPlayer('TOP', ratings - 2),
          generateProceduralPlayer('JNG', ratings),
          generateProceduralPlayer('MID', ratings + 3),
          generateProceduralPlayer('ADC', ratings + 1),
          generateProceduralPlayer('SUP', ratings - 1)
        ];
        substitutes = [
          generateProceduralPlayer('MID', ratings - 8)
        ];
      }
      
      // Generate 3 young academy talents for every team to fuel "drafts and academy"
      const academy = [
        generateProceduralPlayer('MID', 60 + Math.floor(Math.random() * 8), true),
        generateProceduralPlayer('SUP', 58 + Math.floor(Math.random() * 8), true),
        generateProceduralPlayer('TOP', 59 + Math.floor(Math.random() * 8), true)
      ];

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
        sponsors: isPlayer ? [] : [SPONSOR_PRESETS[0]],
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

  return {
    managerName,
    season: selectedYear,
    week: 1,
    stage: 'OFFSEASON',
    playerTeamId: selectedTeamId,
    teams: allTeams, // contains all 60 teams globally loaded in memory
    champions: CHAMPIONS_LIST,
    currentPatch: generateDynamicPatch(0),
    roundsPlayedThisWeek: false,
    calendarSchedule,
    socialFeed: startingSocial,
    sponsorsMarket: [...SPONSOR_PRESETS],
    availableStaff,
    careerHistory: [],
    selectedRegion,
    selectedYear,
    leagues: defaultLeagues
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
  const playerTeam = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

  // 1. Simulate matches of other teams if the player has finished their current matches
  const currentWeekMatches = updatedState.calendarSchedule[currentWeek];
  if (currentWeekMatches) {
    currentWeekMatches.forEach(match => {
      // If player match, it should already be simulated or finished before stepping week.
      // If it is bot vs bot match, simulate it!
      const isPlayerParticipant = match.teamBlueId === playerTeam.id || match.teamRedId === playerTeam.id;
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

  // 2. Financial weekly accounting
  // Weekly incomes
  const sponsorsIncome = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
  const ticketsPopularitySale = playerTeam.popularity * 1500; // ticket and shirt merch sales
  
  // Weekly costs
  const playerPayroll = [...playerTeam.roster, ...playerTeam.substitutes].reduce((acc, p) => acc + p.salary / 24, 0); // monthly salary normalized weekly
  const infrastructureOperatingExpenses = (playerTeam.infrastructure.gamingHouseLevel * 8000) + 
                                          (playerTeam.infrastructure.trainingCenterLevel * 6000) +
                                          (playerTeam.infrastructure.mediaTeamLevel * 4000);

  const activeStaffHiredPayroll = updatedState.availableStaff.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0);

  const netWeeklyGoldChange = sponsorsIncome + ticketsPopularitySale - playerPayroll - infrastructureOperatingExpenses - activeStaffHiredPayroll;
  playerTeam.budget = Math.round(playerTeam.budget + netWeeklyGoldChange);

  // 3. Player stamina recovery & minor training boosts
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
  if (Math.random() < 0.3) {
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
  let playerMatchThisRound = currentWeekMatches?.find(m => m.teamBlueId === playerTeam.id || m.teamRedId === playerTeam.id);
  
  if (currentWeek >= 15) {
    if (updatedState.stage === 'SPLIT_REGULAR') {
      updatedState.stage = 'SPLIT_PLAYOFFS';
      // filter teams of active region for top 4
      const activeRegionTeams = updatedState.teams.filter(t => t.region === updatedState.selectedRegion);
      const topTeams = [...activeRegionTeams].sort((a, b) => b.wins - a.wins || b.points - a.points);
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

        // Run full offseason transitions!
        updatedState = executeOffseasonTransition(updatedState);
        return updatedState;
      }
    }
  }

  updatedState.week++;
  updatedState.roundsPlayedThisWeek = false;

  return updatedState;
}

// Full Offseason system wrapping: aging, attribute evolution, retirements and IA transfers
export function executeOffseasonTransition(gameState: GameState): GameState {
  const updatedState = { ...gameState };
  updatedState.selectedYear++;
  updatedState.season = updatedState.selectedYear;
  updatedState.week = 1;
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

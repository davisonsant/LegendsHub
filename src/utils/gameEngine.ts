/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Team, MatchSeries, Player, Sponsor, Staff, GamePatch } from '../types';
import { CHAMPIONS_LIST, SPONSOR_PRESETS, STAFF_PRESETS, INITIAL_TEAMS_DATA, REGIONAL_TEAMS_DATABASE, INITIAL_PLAYER_ROSTER, INITIAL_PLAYER_SUBS } from '../data/initialDatabase';
import { generateProceduralPlayer, generateDynamicPatch, generateSocialFeed, generateId } from './generators';
import { simulateBotMatch } from './matchSimulator';

export function initializeNewGame(
  managerName: string,
  selectedTeamId: string,
  selectedRegion: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' = 'CBLOL',
  selectedYear: number = 2025
): GameState {
  // Set up teams and initial player rosters based on selected region
  const regionalData = REGIONAL_TEAMS_DATABASE[selectedRegion] || REGIONAL_TEAMS_DATABASE.CBLOL;
  
  const teams: Team[] = regionalData.map(tData => {
    const isPlayer = tData.id === selectedTeamId;
    
    // Generate parodied players if bot team, or load main roster if player
    let roster: Player[] = [];
    let substitutes: Player[] = [];
    let academy: Player[] = [];

    if (isPlayer) {
      roster = [...INITIAL_PLAYER_ROSTER];
      substitutes = [...INITIAL_PLAYER_SUBS];
      // Generate 3 academy kids
      academy = [
        generateProceduralPlayer('MID', 64, true),
        generateProceduralPlayer('SUP', 62, true),
        generateProceduralPlayer('ADC', 65, true)
      ];
    } else {
      // Bot roster generators
      // Scale rating dynamically based on popularity to give high-performing bots more flavor!
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
      academy = [
        generateProceduralPlayer('TOP', 60, true)
      ];
    }

    return {
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
      sponsors: isPlayer ? [] : [SPONSOR_PRESETS[0]], // assign one to bot by default
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
      region: selectedRegion,
      description: tData.description
    };
  });

  // Assign standard patch
  const currentPatch = generateDynamicPatch(0);

  // Generate calendar schedules
  const calendarSchedule = scheduleDoubleRoundRobin(teams);

  // Available staff
  const availableStaff = [...STAFF_PRESETS];

  // Starting social feed items
  const startingSocial = [
    ...generateSocialFeed(regionalData[0]?.name || 'Esports Club', 'general', 'neutral'),
    ...generateSocialFeed(regionalData[1]?.name || 'Competitive Team', 'general', 'positive')
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
    teams,
    champions: CHAMPIONS_LIST,
    currentPatch,
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
  const updatedState = { ...gameState };
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
    updatedState.currentPatch = generateDynamicPatch(patchIndex);
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
    // regular season concluded, trigger playoff brackets!
    if (updatedState.stage === 'SPLIT_REGULAR') {
      updatedState.stage = 'SPLIT_PLAYOFFS';
      // simple bot placements logic: take top 4 teams
      const topTeams = [...updatedState.teams].sort((a, b) => b.wins - a.wins || b.points - a.points);
      // semi matches
      const team1 = topTeams[0];
      const team2 = topTeams[1];
      const team3 = topTeams[2];
      const team4 = topTeams[3];

      // Reset playoff weeks matches
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
    }
  }

  updatedState.week++;
  updatedState.roundsPlayedThisWeek = false;

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

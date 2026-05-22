/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchSeries, MatchLog, MatchStats, Team, Player, Champion, Position, PickBan } from '../types';
import { CHAMPIONS_LIST } from '../data/initialDatabase';
import { generateId } from './generators';

// Calculates draft impact parameters: Counter bonus, synergy bonus, favorite champ signature pick bonus
export interface CompositionAnalysis {
  draftPower: number; // calculated total compositions power
  synergyLevel: number; // 0-100 rating
  countersDiscovered: number; // matching counters
  signaturePicks: string[]; // nicknames who picked signature champions
}

export function analyzeComposition(
  picks: { [key in Position]?: string },
  team: Team,
  currentPatchBuffs: string[],
  currentPatchNerfs: string[],
  championsPool?: Champion[]
): CompositionAnalysis {
  const pool = championsPool && championsPool.length > 0 ? championsPool : CHAMPIONS_LIST;
  let draftPower = 0;
  let signaturePicks: string[] = [];
  let synergyCount = 0;
  let countersDiscovered = 0;

  const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];

  positions.forEach(pos => {
    const champId = picks[pos];
    if (!champId) return;

    const champion = pool.find(c => c.id === champId);
    const player = team.roster.find(p => p.position === pos) || team.substitutes.find(p => p.position === pos);
    
    if (!champion || !player) return;

    // 1. Base power adjusted by player's overall rating
    let playerContribution = player.overallRating * 0.6 + champion.power * 0.4;

    // 2. Patch adjustment
    if (currentPatchBuffs.includes(champId)) {
      playerContribution += 4; // Buffed champ!
    } else if (currentPatchNerfs.includes(champId)) {
      playerContribution -= 4; // Nerfed champ
    }

    // 3. Signature Pick favorite champion bonus
    if (player.championPool.includes(champId)) {
      playerContribution += 4;
      signaturePicks.push(player.name);
    }

    // 4. Role match check (some champions have multirole but perfect match is ideal)
    if (champion.roles.includes(pos)) {
      playerContribution += 2;
    } else {
      playerContribution -= 5; // Offmeta/troll role pick has penalty
    }

    draftPower += playerContribution;
  });

  // Calculate synergy matches
  const activeChamps = Object.values(picks).filter(Boolean) as string[];
  activeChamps.forEach(champId => {
    const champ = pool.find(c => c.id === champId);
    if (!champ) return;
    
    // Check inside comp for synergy
    champ.synergies.forEach(synId => {
      if (activeChamps.includes(synId)) {
        synergyCount++;
        draftPower += 1.5;
      }
    });
  });

  const synergyLevel = Math.min(100, (synergyCount / 5) * 100);

  return {
    draftPower: Math.round(draftPower),
    synergyLevel: Math.round(synergyLevel),
    countersDiscovered: countersDiscovered,
    signaturePicks
  };
}

// Full background match simulator for non-controlled teams
export function simulateBotMatch(teamBlue: Team, teamRed: Team, roundIndex: number, stage: string): MatchSeries {
  const isFinished = true;
  
  // Weights based on overall rosters strength
  const powerBlue = teamBlue.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;
  const powerRed = teamRed.roster.reduce((acc, p) => acc + p.overallRating, 0) / 5;

  const tiltFactorBlue = Math.random() * 5 + (100 - teamBlue.boardTrust) * 0.05;
  const tiltFactorRed = Math.random() * 5 + (100 - teamRed.boardTrust) * 0.05;

  const scoreBlueToWin = powerBlue - tiltFactorBlue;
  const scoreRedToWin = powerRed - tiltFactorRed;

  let scoreBlue = 0;
  let scoreRed = 0;

  // Best of 3 simulation
  while (scoreBlue < 2 && scoreRed < 2) {
    if (Math.random() * scoreBlueToWin > Math.random() * scoreRedToWin) {
      scoreBlue++;
    } else {
      scoreRed++;
    }
  }

  // Create empty stats and logs for simulated bot matches
  return {
    id: 'mat_' + generateId(),
    teamBlueId: teamBlue.id,
    teamRedId: teamRed.id,
    scoreBlue,
    scoreRed,
    isFinished,
    roundIndex,
    stage: stage as any,
    logs: [],
    pickBans: [],
    activeGameIndex: scoreBlue + scoreRed
  };
}

// Simulated chronological logs generator based on current state of match simulation
export function generateGameStep(
  minute: number,
  blueDraft: number,
  redDraft: number,
  blueStrategy: 'aggressive' | 'defensive' | 'objectives' | 'focusBot' | 'focusTop',
  blueName: string,
  redName: string,
  bComp: { [key in Position]?: string },
  rComp: { [key in Position]?: string },
  stats: MatchStats,
  championsPool?: Champion[]
): { log: MatchLog; statsChange: Partial<MatchStats>; goldChange: number } {
  
  const events: ('kill' | 'tower' | 'dragon' | 'baron' | 'objective' | 'info')[] = [];
  
  // Decide event probabilities based on game minute
  if (minute === 0) {
    return {
      log: {
        id: generateId(),
        timestamp: '00:00',
        type: 'info',
        message: '🎙️ Boas-vindas a Summoner\'s Rift! As equipes se espalham pelas rotas para a invasão defensiva inicial.',
        goldDelta: 0
      },
      statsChange: {},
      goldChange: 0
    };
  }

  // Set strategic weights
  let killWeight = 0.15;
  let objWeight = 0.08;
  let towerWeight = 0.06;

  if (blueStrategy === 'aggressive') {
    killWeight = 0.25;
  } else if (blueStrategy === 'objectives') {
    objWeight = 0.15;
  } else if (blueStrategy === 'defensive') {
    killWeight = 0.08;
    towerWeight = 0.04;
  }

  const roll = Math.random();
  const advantageFactor = (blueDraft - redDraft) / 20; // range around -2 to +2
  const blueRollModifier = 0.5 + advantageFactor * 0.1;

  let chosenType: 'kill' | 'tower' | 'dragon' | 'baron' | 'objective' | 'info' = 'info';
  let message = '';
  let goldChange = 0;
  const statsChange: Partial<MatchStats> = {};

  const bPicks = Object.values(bComp).filter(Boolean);
  const rPicks = Object.values(rComp).filter(Boolean);

  const getChampName = (list: string[], defaultName: string) => {
    if (list.length === 0) return defaultName;
    const cid = list[Math.floor(Math.random() * list.length)];
    const pool = championsPool && championsPool.length > 0 ? championsPool : CHAMPIONS_LIST;
    const ch = pool.find(c => c.id === cid);
    return ch ? ch.name : defaultName;
  };

  const bChamp = getChampName(bPicks as string[], 'Aether');
  const rChamp = getChampName(ricksName(rComp) as string[], 'Colossus');

  function ricksName(comp: { [key in Position]?: string }): string[] {
    return Object.values(comp).filter(Boolean) as string[];
  }

  if (roll < killWeight) {
    chosenType = 'kill';
    const isBlueKill = Math.random() < blueRollModifier;
    if (isBlueKill) {
      statsChange.killsBlue = (stats.killsBlue || 0) + 1;
      statsChange.deathsRed = (stats.deathsRed || 0) + 1;
      statsChange.assistsBlue = (stats.assistsBlue || 0) + (Math.random() > 0.4 ? 1 : 0);
      goldChange = 300 + Math.floor(Math.random() * 150);
      
      const killMessages = [
        `⚔️ [ABATE] Lindas mecânicas! Com a ajuda de ${bChamp}, a equipe do ${blueName} garante uma eliminação na rota!`,
        `⚔️ [KILL] Jogo rápido! Gank preciso resulta no abate de ${rChamp} pela equipe do ${blueName}.`,
        `⚔️ [ABATE] Luta rápida na selva! O elenco do ${blueName} captura o caçador adversário desposicionado.`
      ];
      message = killMessages[Math.floor(Math.random() * killMessages.length)];
    } else {
      statsChange.killsRed = (stats.killsRed || 0) + 1;
      statsChange.deathsBlue = (stats.deathsBlue || 0) + 1;
      statsChange.assistsRed = (stats.assistsRed || 0) + (Math.random() > 0.4 ? 1 : 0);
      goldChange = -(300 + Math.floor(Math.random() * 150));
      
      const killMessages = [
        `🚫 [PERIGO] Erro tático! ${rChamp} pune severamente o avanço do ${blueName} e garante a kill.`,
        `🚫 [ABATE] O ${redName} engaja de forma agressiva na rota inferior e abate a botlane do ${blueName}!`,
        `🚫 [TIILT] ${blueName} sofre com pressão de mapa e o caçador do ${redName} rouba o acampamento garantindo eliminação.`
      ];
      message = killMessages[Math.floor(Math.random() * killMessages.length)];
    }
  } else if (roll < killWeight + towerWeight) {
    chosenType = 'tower';
    const isBlueTower = Math.random() < blueRollModifier;
    if (isBlueTower) {
      statsChange.towersBlue = (stats.towersBlue || 0) + 1;
      goldChange = 500 + Math.floor(Math.random() * 100);
      
      const messages = [
        `🏰 [TORRE] Pressão gigante! A equipe do ${blueName} derruba a torre de proteção e abre o mapa.`,
        `🏰 [ESTRUTURA] Excelente push na botlane. A primeira barreira de defesa do ${redName} veio abaixo!`
      ];
      message = messages[Math.floor(Math.random() * messages.length)];
    } else {
      statsChange.towersRed = (stats.towersRed || 0) + 1;
      goldChange = -(500 + Math.floor(Math.random() * 100));
      
      const messages = [
        `🏰 [TORRE PERDIDA] O contra-ataque do ${redName} surte efeito e destrói uma das torres do ${blueName}.`,
        `🏰 [DEFESA VULNERÁVEL] A investida adversária destrói a rota do topo do ${blueName}.`
      ];
      message = messages[Math.floor(Math.random() * messages.length)];
    }
  } else if (roll < killWeight + towerWeight + objWeight) {
    // Objectives: Dragon or Baron
    const isBaronTime = minute >= 20 && Math.random() > 0.7;
    if (isBaronTime) {
      chosenType = 'baron';
      const isBlueBaron = Math.random() < blueRollModifier;
      if (isBlueBaron) {
        statsChange.baronsBlue = (stats.baronsBlue || 0) + 1;
        goldChange = 1500;
        message = `🟣 [BARÃO] CHAMBER DOS CAMPEÕES! O ${blueName} executa o Barão com velocidade e garante o buff roxo definitivo!`;
      } else {
        statsChange.baronsRed = (stats.baronsRed || 0) + 1;
        goldChange = -1500;
        message = `🚨 [PERIGO] ROUBO DO BARÃO! O ${redName} garante o Barão de Nashor em uma contestação desastrosa para o ${blueName}!`;
      }
    } else {
      chosenType = 'dragon';
      const isBlueDragon = Math.random() < (blueRollModifier + (blueStrategy === 'objectives' ? 0.15 : 0));
      if (isBlueDragon) {
        statsChange.dragonsBlue = (stats.dragonsBlue || 0) + 1;
        goldChange = 400;
        message = `🐉 [DRAGÃO] Controle excelente! O caçador do ${blueName} finaliza o Dragão Elemental, acumulando buffs valiosos.`;
      } else {
        statsChange.dragonsRed = (stats.dragonsRed || 0) + 1;
        goldChange = -400;
        message = `🚨 [DRAGÃO PERDIDO] O caçador do ${redName} foca a rota inferior e assegura o bônus do dragão elemental.`;
      }
    }
  } else {
    // Normal laning reports or small skirmishes
    chosenType = 'info';
    const isBlueFav = Math.random() < blueRollModifier;
    const farmBonus = isBlueFav ? 100 : -100;
    goldChange = farmBonus + Math.floor((Math.random() - 0.5) * 80);

    const normalMsgs = [
      `🌾 [FARM] Disputa intensa por minions. O farm dos carregadores segue altíssimo.`,
      `👁️ [VISÃO] As sentinelas de visão de mapa estão bem distribuídas em Summoner's Rift.`,
      `🛡️ [TÁTICA] Fase de rotas morna. Ambas as equipes reposicionam suas sentinelas de visão controlando os ganks.`,
      `🎯 [CHAMPION] ${bChamp} do ${blueName} tenta desviar das habilidades do ${rChamp} no meio.`
    ];
    message = normalMsgs[Math.floor(Math.random() * normalMsgs.length)];
  }

  const timestamp = `${minute.toString().padStart(2, '0')}:00`;

  return {
    log: {
      id: generateId(),
      timestamp,
      type: chosenType,
      message,
      goldDelta: goldChange
    },
    statsChange,
    goldChange
  };
}

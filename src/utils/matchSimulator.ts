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
  championsPool?: Champion[],
  teamBlue?: Team,
  teamRed?: Team
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

  // --- BLOODBATH PROTOCOL: CALIBRAÇÃO DE ATRIBUTOS, AGRESSIVIDADE E VISÃO ---
  const getAvgAttr = (team: Team | undefined, attr: keyof Player['attributes']): number => {
    if (!team || !team.roster || team.roster.length === 0) return 75;
    const vals = team.roster.map(p => p.attributes?.[attr] ?? 75);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const blueMech = getAvgAttr(teamBlue, 'mechanics');
  const redMech = getAvgAttr(teamRed, 'mechanics');
  
  const blueHasAggressivePersonality = teamBlue?.roster?.some(p => p.personality === 'Agressivo') ?? false;
  const redHasAggressivePersonality = teamRed?.roster?.some(p => p.personality === 'Agressivo') ?? false;

  const isBlueHighlyAggressive = blueMech >= 78 || blueHasAggressivePersonality || blueStrategy === 'aggressive';
  const isRedHighlyAggressive = redMech >= 78 || redHasAggressivePersonality;

  // Vision control calculation
  const blueVisionAttr = getAvgAttr(teamBlue, 'mapVision');
  const redVisionAttr = getAvgAttr(teamRed, 'mapVision');

  const blueVisionControl = Math.max(15, Math.min(100, blueVisionAttr - (blueStrategy === 'defensive' ? -10 : 5)));
  const redVisionControl = Math.max(15, Math.min(100, redVisionAttr - 5));

  // --- RECALIBRAÇÃO DE PESOS DE EVENTOS (HIGH-KILL METAGAME) ---
  // Elevando a média global de abates para o alvo de 22 a 38 total somados por partida
  let killWeight = 0.42;   // Base elevada de 0.15
  let objWeight = 0.18;    // Base elevada de 0.08
  let towerWeight = 0.08;  // Base elevada de 0.06

  // Ajustes estratégicos
  if (blueStrategy === 'aggressive') {
    killWeight = 0.58;
  } else if (blueStrategy === 'objectives') {
    objWeight = 0.28;
  } else if (blueStrategy === 'defensive') {
    killWeight = 0.18;
    towerWeight = 0.05;
  }

  // Aumentar em 40% a probabilidade de geração de eventos de Luta por Objetivo
  objWeight = objWeight * 1.4;

  // Impacto de Atributos no início (primeiros 15 min): +25% de chance de abates
  if (minute <= 15 && (isBlueHighlyAggressive || isRedHighlyAggressive)) {
    killWeight = killWeight * 1.25;
  }

  // Efeito Snowball (Bola de Neve): abates estimulam agressividade futura e subsequente
  const currentKillsBlue = stats.killsBlue || 0;
  const currentKillsRed = stats.killsRed || 0;
  const killDiff = Math.abs(currentKillsBlue - currentKillsRed);
  let blueRollModifierMultiplier = 1.0;

  if (killDiff > 0) {
    // Aumento progressivo de ritmo de abates conforme o snowball avança
    killWeight += Math.min(0.20, killDiff * 0.03);
    
    // Favorece ligeiramente quem está à frente em pickoffs
    if (currentKillsBlue > currentKillsRed) {
      blueRollModifierMultiplier = 1.12;
    } else {
      blueRollModifierMultiplier = 0.88;
    }
  }

  // Redução de tempos mortos de transição neutra (farming passivo)
  // Forçar colisão e lutas sangrentas se houver agressividade mútua ou equilíbrio em ouro
  const totalWeight = killWeight + towerWeight + objWeight;
  if (totalWeight < 0.92) {
    // Reduz drasticamente a chance de "info/neutral" inflecionando o ritmo
    const multiplier = 0.92 / totalWeight;
    killWeight *= multiplier;
    towerWeight *= multiplier;
    objWeight *= multiplier;
  }

  // Penalidade por FALTA DE VISÃO (<40% de controle de visão dobra chance de emboscada sofrida)
  let baseBlueRoll = 0.5 + ((blueDraft - redDraft) / 20) * 0.1;
  let blueSuccessChance = baseBlueRoll * blueRollModifierMultiplier;

  if (blueVisionControl < 40) {
    // Red Vision pickoff chance is doubled, meaning Blue's success chance drops
    blueSuccessChance = Math.max(0.15, blueSuccessChance - 0.25);
  }
  if (redVisionControl < 40) {
    // Blue Vision pickoff chance is doubled, meaning Blue's success chance rises
    blueSuccessChance = Math.min(0.85, blueSuccessChance + 0.25);
  }

  const roll = Math.random();
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

  // --- DETECCÃO DE COMPOSIÇÃO BURST & ENGAGE ---
  const BURST_ENGAGE_CHAMPS = [
    'Ahri', 'LeBlanc', 'Zed', 'Syndra', 'Zoe', 'Yone', 'Jax', 'Malphite', 'Nautilus', 'Leona', 'Rell', 'Alistar',
    'LeeSin', 'KhaZix', 'Viego', 'Nocturne', 'Ezreal', 'Draven', 'Jinx', 'KaiSa', 'Kalista', 'Aatrox', 'Hecarim',
    'Sejuani', 'Maokai', 'Pyke', 'Thresh', 'Amumu', 'Rakan', 'Xayah', 'Renekton', 'Diana', 'Katarina', 'Rengar', 'Elise'
  ];
  
  const bBurstCount = bPicks.filter(c => BURST_ENGAGE_CHAMPS.includes(c as string)).length;
  const rBurstCount = rPicks.filter(c => BURST_ENGAGE_CHAMPS.includes(c as string)).length;
  const isBlueBurstComp = bBurstCount >= 2;
  const isRedBurstComp = rBurstCount >= 2;

  if (roll < killWeight) {
    chosenType = 'kill';
    const isBlueKill = Math.random() < blueSuccessChance;
    
    // FATOR DE FATALIDADE: Número mínimo de 2 a 4 abates gerados em combates táticos agressivos
    let numKills = 1;
    const isTacticalEngagement = (isBlueKill && isBlueBurstComp) || (!isBlueKill && isRedBurstComp) || (minute >= 15);
    
    if (isTacticalEngagement) {
      // 2 a 4 abates gerados naquela instância de combate em equipe
      numKills = Math.floor(Math.random() * 3) + 2; 
    } else {
      // Pequeno skirmish ou pickoff comum pode ter 1 ou 2 abates
      numKills = Math.random() > 0.4 ? 2 : 1;
    }

    // Dynamic ceiling calibration to avoid extreme numbers, keeping sums within 22-38 range perfectly
    const totalAccumulatedKills = currentKillsBlue + currentKillsRed;
    if (totalAccumulatedKills >= 32) {
      numKills = Math.max(1, numKills - 1);
    }
    
    if (isBlueKill) {
      statsChange.killsBlue = (stats.killsBlue || 0) + numKills;
      statsChange.deathsRed = (stats.deathsRed || 0) + numKills;
      
      const assistsMultiplier = numKills > 1 ? Math.floor(numKills * 0.8) + 1 : (Math.random() > 0.4 ? 1 : 0);
      statsChange.assistsBlue = (stats.assistsBlue || 0) + assistsMultiplier;
      
      goldChange = numKills * (300 + Math.floor(Math.random() * 150));
      
      const killMessages = [
        `⚔️ [COLO LAPSO] Combate devastador! O ${blueName} engaja de surpresa na rota e explode as linhas inimigas: +${numKills} abates para o elenco azul!`,
        `⚔️ [KILL] Ritual de Sangue! Execução tática rápida liderada por ${bChamp} garante ${numKills} abates limpos em Summoner\'s Rift.`,
        `⚔️ [COMBATE TÁTICO] Luta feroz na selva! A equipe do ${blueName} pune um erro de posicionamento e garante ${numKills} eliminações consecutivas.`,
        `⚔️ [BLOODBATH OVERLORD] Iniciação cirúrgica clássica! Com extrema fatalidade, o oponente não consegue fugir das garras do elenco do ${blueName}: +${numKills} Kills!`
      ];
      message = killMessages[Math.floor(Math.random() * killMessages.length)];
    } else {
      statsChange.killsRed = (stats.killsRed || 0) + numKills;
      statsChange.deathsBlue = (stats.deathsBlue || 0) + numKills;
      
      const assistsMultiplier = numKills > 1 ? Math.floor(numKills * 0.8) + 1 : (Math.random() > 0.4 ? 1 : 0);
      statsChange.assistsRed = (stats.assistsRed || 0) + assistsMultiplier;
      
      goldChange = -numKills * (300 + Math.floor(Math.random() * 150));
      
      const killMessages = [
        `🚫 [FLANK TÁTICO] Pressão implacável! ${rChamp} explode o alvo e ajuda o ${redName} a desmantelar a defesa adversária com +${numKills} abates rápidos!`,
        `🚫 [ABATE MULTIPLO] Erro grave! O elenco do ${redName} inicia perfeitamente de forma brutal, punindo o ${blueName} com ${numKills} mortes consecutivas!`,
        `🚫 [TIILT TOTAL] Emboscada sob luzes vermelhas! Em desvantagem de visão, a equipe azul entra às cegas na selva e assiste ao atropelo: +${numKills} abates inimigos.`,
        `🚫 [FATOR FATALIDADE] Combater virou carnificina! O dano de burst do ${redName} impede qualquer tentativa de fuga limpa e resulta em +${numKills} kills!`
      ];
      message = killMessages[Math.floor(Math.random() * killMessages.length)];
    }
  } else if (roll < killWeight + towerWeight) {
    chosenType = 'tower';
    const isBlueTower = Math.random() < blueSuccessChance;
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
    
    // Lutas por objetivo também geram confrontos sangrentos!
    const battleKills = Math.floor(Math.random() * 3) + 1; // 1-3 abates adicionais gerados na luta pelo objetivo!
    
    if (isBaronTime) {
      chosenType = 'baron';
      const isBlueBaron = Math.random() < blueSuccessChance;
      if (isBlueBaron) {
        statsChange.baronsBlue = (stats.baronsBlue || 0) + 1;
        statsChange.killsBlue = (stats.killsBlue || 0) + battleKills;
        statsChange.deathsRed = (stats.deathsRed || 0) + battleKills;
        goldChange = 1500 + (battleKills * 300);
        message = `🟣 [BARÃO & LUTA] COMBATE HISTÓRICO! O ${blueName} executa o Barão com velocidade e engaja na retaguarda garantindo +${battleKills} abates e o buff roxo definitivo!`;
      } else {
        statsChange.baronsRed = (stats.baronsRed || 0) + 1;
        statsChange.killsRed = (stats.killsRed || 0) + battleKills;
        statsChange.deathsBlue = (stats.deathsBlue || 0) + battleKills;
        goldChange = -1500 - (battleKills * 300);
        message = `🚨 [ROUBO & MASSACRE] ROUBO DO BARÃO! O ${redName} rouba o Nashor e engaja um combate impiedoso que ceifa +${battleKills} vidas azuis!`;
      }
    } else {
      chosenType = 'dragon';
      const isBlueDragon = Math.random() < (blueSuccessChance + (blueStrategy === 'objectives' ? 0.15 : 0));
      if (isBlueDragon) {
        statsChange.dragonsBlue = (stats.dragonsBlue || 0) + 1;
        statsChange.killsBlue = (stats.killsBlue || 0) + Math.floor(battleKills / 2);
        statsChange.deathsRed = (stats.deathsRed || 0) + Math.floor(battleKills / 2);
        goldChange = 400 + (Math.floor(battleKills / 2) * 300);
        message = `🐉 [DRAGÃO & SKIRMISH] Controle excelente! O caçador do ${blueName} finaliza o Dragão Elemental e na dispersão garante +${Math.floor(battleKills / 2)} abates de brinde.`;
      } else {
        statsChange.dragonsRed = (stats.dragonsRed || 0) + 1;
        statsChange.killsRed = (stats.killsRed || 0) + Math.floor(battleKills / 2);
        statsChange.deathsBlue = (stats.deathsBlue || 0) + Math.floor(battleKills / 2);
        goldChange = -400 - (Math.floor(battleKills / 2) * 300);
        message = `🚨 [DRAGÃO PERDIDO & RUÍNA] O caçador do ${redName} foca o covil do Dragão e atropela a rota inferior eliminando +${Math.floor(battleKills / 2)} atletas do ${blueName}!`;
      }
    }
  } else {
    // Normal laning reports or small skirmishes (minimized neutrals)
    chosenType = 'info';
    const isBlueFav = Math.random() < blueSuccessChance;
    const farmBonus = isBlueFav ? 100 : -100;
    goldChange = farmBonus + Math.floor((Math.random() - 0.5) * 80);

    const normalMsgs = [
      `🌾 [FARM ATIVO] Carregadores de ambos os times disputam minions com ritmo frenético na rota.`,
      `👁️ [CONTROLE DE MAPA] Sentinelas distribuídas limitam pickoffs fáceis de ambos os lados neste momento.`,
      `🛡️ [PREPARAÇÃO] Equipes recuam temporariamente para curar e gastar ouro acumulado na loja.`,
      `🎯 [ZONEAMENTO] ${bChamp} do ${blueName} e ${rChamp} do ${redName} trocam skills de média distância disputando prioridade de midlane.`
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

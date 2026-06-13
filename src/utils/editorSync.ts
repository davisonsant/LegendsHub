import { GameState, Team, Player, Champion, Sponsor, PlayerAttributes, Position } from '../types';

export interface EditorPayload {
  teams?: { [region: string]: any[] };
  champions?: Champion[];
  sponsors?: Sponsor[];
  playersDict?: { [id: string]: any };
  press?: any[];
  influencers?: any[];
  managers?: any[];
  lastModified?: number;
}

/**
 * Checks if custom editor modifications exist.
 */
export function hasCustomEditorData(): boolean {
  if (typeof window === 'undefined') return false;
  
  const keys = [
    'legendshub_custom_db',
    'legendshub_custom_champions',
    'legendshub_custom_sponsors',
    'legendshub_custom_players_dict',
    'editor_database.json'
  ];
  
  return keys.some(k => {
    const val = localStorage.getItem(k);
    if (!val) return false;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.length > 0;
      if (typeof parsed === 'object') return Object.keys(parsed).length > 0;
      return true;
    } catch (e) {
      return false;
    }
  });
}

/**
 * Returns the timestamp of the last editor modifications.
 */
export function getEditorTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  const ts = localStorage.getItem('editor_last_modified_timestamp');
  if (ts) return parseInt(ts, 10);
  
  if (hasCustomEditorData()) {
    const now = Date.now();
    localStorage.setItem('editor_last_modified_timestamp', String(now));
    return now;
  }
  return 0;
}

/**
 * Loads and consolidates all individual editor keys into editor_database.json representation.
 */
export function loadEditorDatabase(): EditorPayload | null {
  if (typeof window === 'undefined') return null;
  
  let payload: EditorPayload = {};
  
  // Directly build the payload starting from individual keys to prevent caching stale 'editor_database.json' values
  const customDbRaw = localStorage.getItem('legendshub_custom_db');
  if (customDbRaw) {
    try {
      payload.teams = JSON.parse(customDbRaw);
    } catch (e) {}
  }
  
  const customChampsRaw = localStorage.getItem('legendshub_custom_champions');
  if (customChampsRaw) {
    try {
      payload.champions = JSON.parse(customChampsRaw);
    } catch (e) {}
  }

  const customSponsorsRaw = localStorage.getItem('legendshub_custom_sponsors');
  if (customSponsorsRaw) {
    try {
      payload.sponsors = JSON.parse(customSponsorsRaw);
    } catch (e) {}
  }

  const customPlayersDictRaw = localStorage.getItem('legendshub_custom_players_dict');
  if (customPlayersDictRaw) {
    try {
      payload.playersDict = JSON.parse(customPlayersDictRaw);
    } catch (e) {}
  }

  const customPressRaw = localStorage.getItem('legendshub_custom_press');
  if (customPressRaw) {
    try {
      payload.press = JSON.parse(customPressRaw);
    } catch (e) {}
  }

  const customInfRaw = localStorage.getItem('legendshub_custom_influencers');
  if (customInfRaw) {
    try {
      payload.influencers = JSON.parse(customInfRaw);
    } catch (e) {}
  }

  const customMgrRaw = localStorage.getItem('legendshub_custom_managers');
  if (customMgrRaw) {
    try {
      payload.managers = JSON.parse(customMgrRaw);
    } catch (e) {}
  }

  // Fallback to editor_database.json if we have no individual storage entries but have the legacy combined block
  if (!payload.teams && !payload.champions && !payload.sponsors && !payload.playersDict) {
    const savedCombined = localStorage.getItem('editor_database.json');
    if (savedCombined) {
      try {
        payload = JSON.parse(savedCombined);
      } catch (e) {
        console.error('Error parsing editor_database.json', e);
      }
    }
  } else {
    payload.lastModified = getEditorTimestamp() || Date.now();
    localStorage.setItem('editor_database.json', JSON.stringify(payload));
  }
  
  if (Object.keys(payload).length === 0 || (!payload.teams && !payload.champions && !payload.sponsors && !payload.playersDict)) {
    return null;
  }
  
  return payload;
}

/**
 * Finds custom player overrides for a specific player by precise key, id, or template match
 */
export function findPlayerOverride(teamId: string, playerId: string, playerName: string, playersDict: { [id: string]: any } | undefined): any | null {
  if (!playersDict) return null;
  
  // 1. Try precise composite key: e.g. "teamId_playerId_playerName"
  const preciseKey = `${teamId}_${playerId}_${playerName}`;
  if (playersDict[preciseKey]) return playersDict[preciseKey];
  
  // 2. Try direct ID key match
  if (playersDict[playerId]) return playersDict[playerId];
  
  // 3. Match keys containing the player ID
  const matchedKey = Object.keys(playersDict).find(k => {
    const parts = k.split('_');
    return parts.includes(playerId) || k === playerId;
  });
  if (matchedKey) return playersDict[matchedKey];
  
  return null;
}

/**
 * Surgical deep-merge between the Active Career game save and the Editor payloads, preserving volatility.
 */
export function syncGameWithEditor(gameState: GameState): { syncedState: GameState; keysUpdated: number } {
  const payload = loadEditorDatabase();
  if (!payload) return { syncedState: gameState, keysUpdated: 0 };
  
  const nextState = JSON.parse(JSON.stringify(gameState)) as GameState;
  let keysUpdated = 0;
  
  // --- A. GATHER ALL EXISTENT CAREER PLAYERS ---
  const careerPlayersMap = new Map<string, Player & { originalTeamId: string }>();
  if (nextState.teams) {
    nextState.teams.forEach(team => {
      const pGroup = [
        ...(team.roster || []).map(p => ({ ...p, originalTeamId: team.id })),
        ...(team.substitutes || []).map(p => ({ ...p, originalTeamId: team.id })),
        ...(team.academy || []).map(p => ({ ...p, originalTeamId: team.id }))
      ];
      pGroup.forEach(p => {
        careerPlayersMap.set(p.id, p);
      });
    });
  }

  // --- B. BUILD CUSTOM ADDED PLAYERS FROM EDITOR ---
  const customNewPlayers: Player[] = [];
  if (payload.playersDict) {
    Object.keys(payload.playersDict).forEach(key => {
      const override = payload.playersDict![key];
      if (override && override.isCustomNewPlayer) {
        const skillRating = Number(override.overallRating || 70);
        const attrs: PlayerAttributes = {
          mechanics: skillRating,
          macro: skillRating,
          communication: skillRating,
          leadership: skillRating,
          consistency: skillRating,
          emotionalControl: skillRating,
          farm: skillRating,
          mapVision: skillRating,
          playoffPerformance: skillRating
        };
        const pObj: Player = {
          id: override.id || key,
          name: override.name || 'Nova Lenda',
          realName: override.realName || 'Nome Completo',
          nationality: override.nationality || 'Brasil',
          age: Number(override.age || 18),
          position: (override.position || 'MID') as Position,
          attributes: attrs,
          overallRating: skillRating,
          potential: Math.min(99, skillRating + 10),
          personality: 'Equilibrante',
          popularity: Number(override.popularity || 50),
          marketValue: 120000,
          salary: 20050,
          contractMonths: 24,
          motivation: 95,
          stamina: 100,
          chemistry: 80,
          championPool: ['azir', 'syndra'],
          isPlayerControlled: false,
          photoUrl: override.photoUrl || '',
          isAcademyStarter: !!override.isAcademyStarter,
          customPlayer: true
        };
        customNewPlayers.push(pObj);
      }
    });
  }

  // --- C. SYNC TEAMS & THEIR ROSTERS (Preserving points, matches, budget) ---
  if (payload.teams && nextState.teams) {
    nextState.teams = nextState.teams.map(team => {
      let customTeamData: any = null;
      for (const region of Object.keys(payload.teams || {})) {
        const match = payload.teams![region]?.find((t: any) => t.id === team.id);
        if (match) {
          customTeamData = match;
          break;
        }
      }
      
      if (customTeamData) {
        // Sync static traits
        if (team.name !== customTeamData.name) { team.name = customTeamData.name; keysUpdated++; }
        if (team.acronym !== customTeamData.acronym) { team.acronym = customTeamData.acronym; keysUpdated++; }
        if (team.primaryColor !== customTeamData.primaryColor) { team.primaryColor = customTeamData.primaryColor; keysUpdated++; }
        if (team.secondaryColor !== customTeamData.secondaryColor) { team.secondaryColor = customTeamData.secondaryColor; keysUpdated++; }
        if (customTeamData.logoUrl && team.logoUrl !== customTeamData.logoUrl) { team.logoUrl = customTeamData.logoUrl; keysUpdated++; }
        if (customTeamData.description && team.description !== customTeamData.description) { team.description = customTeamData.description; keysUpdated++; }
        if (customTeamData.popularity && team.popularity !== customTeamData.popularity) { team.popularity = Number(customTeamData.popularity); keysUpdated++; }
      }
      
      // Determine players for this team (including original career players, moves, deletes, and adds)
      const teamPlayers: Player[] = [];
      
      careerPlayersMap.forEach((p) => {
        const override = findPlayerOverride(p.originalTeamId, p.id, p.name, payload.playersDict);
        let activeTeamId = p.originalTeamId;
        if (override) {
          if (override.deleted) return; // skipped because deleted
          if (override.newTeamId) {
            activeTeamId = override.newTeamId;
          }
        }
        
        if (activeTeamId === team.id) {
          const clonedPlayer = JSON.parse(JSON.stringify(p)) as Player;
          if (override) {
            if (override.name) clonedPlayer.name = override.name;
            if (override.realName) clonedPlayer.realName = override.realName;
            if (override.age) clonedPlayer.age = Number(override.age);
            if (override.nationality) clonedPlayer.nationality = override.nationality;
            if (override.photoUrl) clonedPlayer.photoUrl = override.photoUrl;
            if (override.position) clonedPlayer.position = override.position;
            if (override.isAcademyStarter !== undefined) clonedPlayer.isAcademyStarter = !!override.isAcademyStarter;
            
            const nextOvr = Number(override.overallRating);
            if (nextOvr && clonedPlayer.overallRating !== nextOvr) {
              const diff = nextOvr - clonedPlayer.overallRating;
              clonedPlayer.overallRating = nextOvr;
              clonedPlayer.potential = Math.max(nextOvr, Math.min(99, clonedPlayer.potential + diff));
              if (clonedPlayer.attributes) {
                const attrKeys = Object.keys(clonedPlayer.attributes) as (keyof PlayerAttributes)[];
                attrKeys.forEach(k => {
                  clonedPlayer.attributes[k] = Math.max(30, Math.min(99, Math.round(clonedPlayer.attributes[k] + diff)));
                });
              }
            }
          }
          teamPlayers.push(clonedPlayer);
          keysUpdated++;
        }
      });
      
      // Add custom newly added players belonging to this team
      customNewPlayers.forEach(p => {
        const override = payload.playersDict?.[p.id];
        let activeTeamId = override?.teamId || team.id;
        if (override && override.newTeamId) {
          activeTeamId = override.newTeamId;
        }
        if (override && override.deleted) return; // deleted
        
        if (activeTeamId === team.id) {
          teamPlayers.push(p);
          keysUpdated++;
        }
      });
      
      // Partition players into core roster, substitutes, and academy
      const academyList = teamPlayers.filter(p => p.isAcademyStarter);
      const mainList = teamPlayers.filter(p => !p.isAcademyStarter);
      
      const finalRoster: Player[] = [];
      const finalSubs: Player[] = [];
      const filledPositions = new Set<string>();
      
      mainList.forEach(p => {
        if (!filledPositions.has(p.position) && finalRoster.length < 5) {
          finalRoster.push(p);
          filledPositions.add(p.position);
        } else {
          finalSubs.push(p);
        }
      });
      
      team.roster = finalRoster;
      team.substitutes = finalSubs;
      team.academy = academyList;
      
      return team;
    });
  }
  
  // --- 2. SYNC CHAMPIONS LIST ---
  if (payload.champions && nextState.champions) {
    nextState.champions = nextState.champions.map(champ => {
      const customChamp = payload.champions?.find(c => c.id === champ.id);
      if (customChamp) {
        let changed = false;
        if (champ.name !== customChamp.name) { champ.name = customChamp.name; changed = true; }
        if (champ.tier !== customChamp.tier) { champ.tier = customChamp.tier; changed = true; }
        if (champ.power !== customChamp.power) { champ.power = Number(customChamp.power); changed = true; }
        if (champ.buffStatus !== customChamp.buffStatus) { champ.buffStatus = customChamp.buffStatus; changed = true; }
        if (customChamp.roles && JSON.stringify(champ.roles) !== JSON.stringify(customChamp.roles)) { champ.roles = customChamp.roles; changed = true; }
        
        if (changed) {
          keysUpdated++;
        }
      }
      return champ;
    });
  }
  
  // --- 3. SYNC SPONSORS MARKET & ACTIVE SPONSORS ---
  if (payload.sponsors) {
    if (nextState.sponsorsMarket) {
      nextState.sponsorsMarket = nextState.sponsorsMarket.map(sMarket => {
        const customSponsor = payload.sponsors?.find(s => s.id === sMarket.id);
        if (customSponsor) {
          let spMod = false;
          if (sMarket.name !== customSponsor.name) { sMarket.name = customSponsor.name; spMod = true; }
          if (sMarket.incomePerWeek !== customSponsor.incomePerWeek) { sMarket.incomePerWeek = Number(customSponsor.incomePerWeek); spMod = true; }
          if (sMarket.termsInWeeks !== customSponsor.termsInWeeks) { sMarket.termsInWeeks = Number(customSponsor.termsInWeeks); spMod = true; }
          if (customSponsor.logoUrl && sMarket.logoUrl !== customSponsor.logoUrl) { sMarket.logoUrl = customSponsor.logoUrl; spMod = true; }
          if (customSponsor.objective && sMarket.objective !== customSponsor.objective) { sMarket.objective = customSponsor.objective; spMod = true; }
          
          const rawPop = (customSponsor as any).minPopularity || (customSponsor as any).minTrustRequired;
          if (rawPop && sMarket.minPopularity !== Number(rawPop)) {
            sMarket.minPopularity = Number(rawPop);
            spMod = true;
          }
          
          if (spMod) {
            keysUpdated++;
          }
        }
        return sMarket;
      });
    }
    
    if (nextState.teams) {
      nextState.teams.forEach(team => {
        if (team.sponsors) {
          team.sponsors = team.sponsors.map(activeSponsor => {
            const customSponsor = payload.sponsors?.find(s => s.id === activeSponsor.id);
            if (customSponsor) {
              const prevWeeksRemaining = activeSponsor.activeWeeks;
              
              activeSponsor.name = customSponsor.name;
              activeSponsor.incomePerWeek = Number(customSponsor.incomePerWeek);
              activeSponsor.termsInWeeks = Number(customSponsor.termsInWeeks);
              if (customSponsor.logoUrl) activeSponsor.logoUrl = customSponsor.logoUrl;
              if (customSponsor.objective) activeSponsor.objective = customSponsor.objective;
              
              const activeRawPop = (customSponsor as any).minPopularity || (customSponsor as any).minTrustRequired;
              if (activeRawPop) {
                activeSponsor.minPopularity = Number(activeRawPop);
              }
              
              activeSponsor.activeWeeks = prevWeeksRemaining;
            }
            return activeSponsor;
          });
        }
      });
    }
  }
  
  // Update sync logs
  nextState.lastEditorSyncTimestamp = payload.lastModified || Date.now();
  if (keysUpdated > 0) {
    nextState.editorSyncStatusMessage = `[STATUS: ONLINE] [ENGINE: ACTIVE] Editor Payload Synced Successfully. ${keysUpdated} keys updated.`;
  } else {
    nextState.editorSyncStatusMessage = `[STATUS: ONLINE] [ENGINE: ACTIVE] Editor Payload Synced. State is fully up to date.`;
  }
  
  return { syncedState: nextState, keysUpdated };
}

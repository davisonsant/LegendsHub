import { GameState, Team, Player, Champion, Sponsor, PlayerAttributes } from '../types';

export interface EditorPayload {
  teams?: { [region: string]: any[] };
  champions?: Champion[];
  sponsors?: Sponsor[];
  playersDict?: { [id: string]: any };
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
  
  const savedCombined = localStorage.getItem('editor_database.json');
  if (savedCombined) {
    try {
      payload = JSON.parse(savedCombined);
    } catch (e) {
      console.error('Error parsing editor_database.json', e);
    }
  }
  
  let importedAny = false;
  
  // Check and merge separate editor storage keys so they are unified
  const customDbRaw = localStorage.getItem('legendshub_custom_db');
  if (customDbRaw && !payload.teams) {
    try {
      payload.teams = JSON.parse(customDbRaw);
      importedAny = true;
    } catch (e) {}
  }
  
  const customChampsRaw = localStorage.getItem('legendshub_custom_champions');
  if (customChampsRaw && !payload.champions) {
    try {
      payload.champions = JSON.parse(customChampsRaw);
      importedAny = true;
    } catch (e) {}
  }

  const customSponsorsRaw = localStorage.getItem('legendshub_custom_sponsors');
  if (customSponsorsRaw && !payload.sponsors) {
    try {
      payload.sponsors = JSON.parse(customSponsorsRaw);
      importedAny = true;
    } catch (e) {}
  }

  const customPlayersDictRaw = localStorage.getItem('legendshub_custom_players_dict');
  if (customPlayersDictRaw && !payload.playersDict) {
    try {
      payload.playersDict = JSON.parse(customPlayersDictRaw);
      importedAny = true;
    } catch (e) {}
  }
  
  if (importedAny || !payload.lastModified) {
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
  
  // --- 1. SYNC TEAMS & THEIR ROSTERS (Preserving points, matches, budget) ---
  if (payload.teams && nextState.teams) {
    nextState.teams = nextState.teams.map(team => {
      // Look up team metadata in any of the regional tables of our Editor payload
      let customTeamData: any = null;
      for (const region of Object.keys(payload.teams || {})) {
        const match = payload.teams![region]?.find((t: any) => t.id === team.id);
        if (match) {
          customTeamData = match;
          break;
        }
      }
      
      if (customTeamData) {
        // Sync static immutable and aesthetic traits
        if (team.name !== customTeamData.name) { team.name = customTeamData.name; keysUpdated++; }
        if (team.acronym !== customTeamData.acronym) { team.acronym = customTeamData.acronym; keysUpdated++; }
        if (team.primaryColor !== customTeamData.primaryColor) { team.primaryColor = customTeamData.primaryColor; keysUpdated++; }
        if (team.secondaryColor !== customTeamData.secondaryColor) { team.secondaryColor = customTeamData.secondaryColor; keysUpdated++; }
        if (customTeamData.logoUrl && team.logoUrl !== customTeamData.logoUrl) { team.logoUrl = customTeamData.logoUrl; keysUpdated++; }
        if (customTeamData.description && team.description !== customTeamData.description) { team.description = customTeamData.description; keysUpdated++; }
        if (customTeamData.popularity && team.popularity !== customTeamData.popularity) { team.popularity = Number(customTeamData.popularity); keysUpdated++; }
      }
      
      // Merge players inside this team (roster, substitutes, academy)
      const syncPlayerGroup = (pList: Player[]): Player[] => {
        if (!pList) return [];
        return pList.map(p => {
          const override = findPlayerOverride(team.id, p.id, p.name, payload.playersDict);
          if (override) {
            let playerModified = false;
            
            if (override.name && p.name !== override.name) { p.name = override.name; playerModified = true; }
            if (override.realName && p.realName !== override.realName) { p.realName = override.realName; playerModified = true; }
            if (override.age && p.age !== Number(override.age)) { p.age = Number(override.age); playerModified = true; }
            if (override.nationality && p.nationality !== override.nationality) { p.nationality = override.nationality; playerModified = true; }
            if (override.photoUrl && p.photoUrl !== override.photoUrl) { p.photoUrl = override.photoUrl; playerModified = true; }
            
            // Sync ratings and potential
            const nextOvr = Number(override.overallRating ?? override.baseRating ?? p.overallRating);
            if (nextOvr && p.overallRating !== nextOvr) {
              const diff = nextOvr - p.overallRating;
              p.overallRating = nextOvr;
              p.potential = Math.max(nextOvr, Math.min(99, p.potential + diff));
              
              // Proportionally adjust internal performance attributes to maintain balance
              if (p.attributes) {
                const keys = Object.keys(p.attributes) as (keyof PlayerAttributes)[];
                keys.forEach(k => {
                  p.attributes[k] = Math.max(30, Math.min(99, Math.round(p.attributes[k] + diff)));
                });
              }
              playerModified = true;
            }
            
            if (playerModified) {
              keysUpdated++;
            }
          }
          return p;
        });
      };
      
      team.roster = syncPlayerGroup(team.roster || []);
      team.substitutes = syncPlayerGroup(team.substitutes || []);
      team.academy = syncPlayerGroup(team.academy || []);
      
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
    // Sync presets list in market
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
    
    // Sync active signed sponsors on all teams
    if (nextState.teams) {
      nextState.teams.forEach(team => {
        if (team.sponsors) {
          team.sponsors = team.sponsors.map(activeSponsor => {
            const customSponsor = payload.sponsors?.find(s => s.id === activeSponsor.id);
            if (customSponsor) {
              const prevWeeksRemaining = activeSponsor.activeWeeks; // preserve volatility field
              
              activeSponsor.name = customSponsor.name;
              activeSponsor.incomePerWeek = Number(customSponsor.incomePerWeek);
              activeSponsor.termsInWeeks = Number(customSponsor.termsInWeeks);
              if (customSponsor.logoUrl) activeSponsor.logoUrl = customSponsor.logoUrl;
              if (customSponsor.objective) activeSponsor.objective = customSponsor.objective;
              
              const activeRawPop = (customSponsor as any).minPopularity || (customSponsor as any).minTrustRequired;
              if (activeRawPop) {
                activeSponsor.minPopularity = Number(activeRawPop);
              }
              
              // Keep active contract countdown intact
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

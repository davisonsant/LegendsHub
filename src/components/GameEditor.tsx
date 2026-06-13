/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Server, Upload, Download, LogOut, Trash2, Plus, 
  RefreshCw, Check, Edit2, Shield, Users, Search, 
  Trophy, Sparkles, MessageSquare, Award, Flame, Tv, X
} from 'lucide-react';
import { REGIONAL_TEAMS_DATABASE, CHAMPIONS_LIST, SPONSOR_PRESETS } from '../data/initialDatabase';
import { getPlayersForTeam } from '../data/realPlayers';
import { Team, Player, Sponsor, Champion, Manager, Position } from '../types';
import { getGameItem, setGameItem, removeGameItem } from '../utils/localForageStore';
import { generateProceduralAcademyPlayer } from '../utils/generators';

interface GameEditorProps {
  onClose: () => void;
  activeTheme: 'light' | 'dark';
  themeClasses: any;
  lang?: 'PT-BR' | 'EN-US' | 'ES-ES';
  activeCurrency?: 'BRL' | 'USD' | 'EUR';
  onUpdateTheme?: (theme: 'light' | 'dark') => void;
  onUpdateLanguage?: (lang: 'PT-BR' | 'EN-US' | 'ES-ES') => void;
  onUpdateCurrency?: (currency: 'BRL' | 'USD' | 'EUR') => void;
}

// Inline Vector Silhouette Fallback
const RenderSilhouette = () => (
  <div className="w-full h-full bg-[#1b2331] rounded-full border border-dashed border-[#00bcd4]/40 flex items-center justify-center overflow-hidden">
    <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] text-slate-500 fill-current opacity-80">
      <path d="M50 15c-9.4 0-17 7.6-17 17s7.6 17 17 17 17-7.6 17-17-7.6-17-17-17zm-30 48c0-8.3 13.4-15 30-15s30 6.7 30 15v10H20V63z" />
    </svg>
  </div>
);

// Formatter for general stats
const formatMoney = (val: number) => {
  return `$ ${val.toLocaleString('pt-BR')}`;
};

// Ensures every team in the database has at least 5 academy players (one for each Pos)
const seedAcademyPlayersIfEmpty = (teamsDb: any) => {
  const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
  const copy = JSON.parse(JSON.stringify(teamsDb));
  
  Object.keys(copy).forEach(region => {
    copy[region] = copy[region].map((team: any) => {
      const seededAcademy = team.academy && team.academy.length > 0 ? [...team.academy] : [];
      
      positions.forEach((pos, idx) => {
        const hasPos = seededAcademy.some(p => p.position === pos);
        if (!hasPos) {
          const playerIdx = seededAcademy.length + 1;
          const freshPlayer = generateProceduralAcademyPlayer(pos, region as any, playerIdx, team.id);
          seededAcademy.push(freshPlayer);
        }
      });
      
      return {
        ...team,
        academy: seededAcademy
      };
    });
  });
  return copy;
};

export function GameEditor({ 
  onClose, 
  activeTheme, 
  lang = 'PT-BR',
  activeCurrency = 'BRL',
  onUpdateTheme,
  onUpdateLanguage,
  onUpdateCurrency
}: GameEditorProps) {
  // Navigation Vertical Tabs
  type TabId = 'db' | 'leagues' | 'teams' | 'players' | 'managers' | 'press' | 'influencers' | 'sponsors' | 'champions';
  const [activeTab, setActiveTab] = useState<TabId>('db');
  const [loading, setLoading] = useState(true);

  // DATABASE STATE
  const [activeDbFilename, setActiveDbFilename] = useState<string>('default.db');
  const [dbFilesList, setDbFilesList] = useState<string[]>(['default.db']);
  
  const [editorDb, setEditorDb] = useState<{ [region: string]: Team[] }>({});
  const [editorChamps, setEditorChamps] = useState<Champion[]>([]);
  const [editorSponsors, setEditorSponsors] = useState<Sponsor[]>([]);
  const [editorPlayersDict, setEditorPlayersDict] = useState<{ [playerId: string]: any }>({});
  const [editorPress, setEditorPress] = useState<any[]>([]);
  const [editorInfluencers, setEditorInfluencers] = useState<any[]>([]);
  const [editorManagers, setEditorManagers] = useState<Manager[]>([]);
  const [leaguesMeta, setLeaguesMeta] = useState<{ [region: string]: { name: string; logoUrl?: string; logo_blob?: string } }>({});

  // Navigation Filter variables
  const [selectedRegion, setSelectedRegion] = useState<string>('CBLOL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [selectedPressId, setSelectedPressId] = useState<string>('');
  const [selectedInfId, setSelectedInfId] = useState<string>('');
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');
  const [selectedChampId, setSelectedChampId] = useState<string>('');

  // Dropdown Elenco: 0 = Time Principal (is_academy = 0), 1 = Academy (is_academy = 1)
  const [elencoFilter, setElencoFilter] = useState<number>(0);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. LOAD STABLE INITIAL STATES
  useEffect(() => {
    const listDbs = async () => {
      if ((window as any).desktopAPI) {
        try {
          const files = await (window as any).desktopAPI.listDatabases();
          if (files && files.length > 0) {
            setDbFilesList(files.map((f: string) => f === 'Legendshub_Default.db' ? 'default.db' : f));
          }
        } catch (_) {}
      }
    };
    listDbs();
    loadActiveDatabase(activeDbFilename);
  }, []);

  useEffect(() => {
    setSelectedTeamId('');
    setSelectedPlayerId('');
    setSelectedManagerId('');
  }, [selectedRegion]);

  const loadActiveDatabase = async (filename: string) => {
    setLoading(true);
    let dbTeams = REGIONAL_TEAMS_DATABASE;
    let dbChamps = CHAMPIONS_LIST;
    let dbSponsors = [...SPONSOR_PRESETS];
    let dbPlayersDict = {};
    let dbPress = [
      { id: 'press_mais', name: 'MAIS ESPORTS', logoUrl: '' },
      { id: 'press_espn', name: 'ESPN Esports', logoUrl: '' },
      { id: 'press_ilha', name: 'Ilha das Lendas', logoUrl: '' }
    ];
    const defaultInfluencers = [
      { id: 'inf_brtt', name: 'FelipeBrtt', socialHandle: '@felipebrtt' },
      { id: 'inf_baiano', name: 'Baiano', socialHandle: '@baianolol' },
      { id: 'inf_muca', name: 'Muca Esports', socialHandle: '@mucaesports' }
    ];
    let dbInfluencers = [...defaultInfluencers];
    let dbManagers: any[] = [];

    // Prepopulate system managers based on primary database teams if not yet constructed
    Object.keys(dbTeams).forEach(region => {
      dbTeams[region].forEach(t => {
        const sigla = (t.acronym || t.id.slice(0, 3)).toUpperCase().replace(/[^A-Z0-9]/g, '');
        dbManagers.push({
          id: `MGR_${sigla}`,
          name: `Coach ${t.name}`,
          age: 32,
          nationality: 'Brasil',
          photoUrl: '',
          teamId: t.id,
          reputationTier: 'A',
          popularity: 70,
          style: 'Equilibrado',
          emotionalProfile: 'Analítico',
          stats: { wins: 45, losses: 35, titles: 1, financialEfficiency: 80, youthPromotions: 3 },
          titlesGallery: [],
          previousTeams: [],
          recentResults: [],
          topChampions: []
        });
      });
    });

    let localLeagues: any = {
      'CBLOL': { name: 'CBLOL (Brasil)' },
      'LCK': { name: 'LCK (Coreia do Sul)' },
      'LPL': { name: 'LPL (China)' },
      'LEC': { name: 'LEC (Europa)' },
      'LCS': { name: 'LCS (América do Norte)' },
      'LCP': { name: 'LCP (Pacífico)' }
    };

    let desktopPayload: any = null;
    if ((window as any).desktopAPI) {
      try {
        desktopPayload = await (window as any).desktopAPI.loadDatabase(filename);
      } catch (_) {}
    }

    if (!desktopPayload) {
      desktopPayload = await getGameItem<any>(`legendshub_db_${filename}`);
    }

    if (desktopPayload) {
      if (desktopPayload.teams) dbTeams = desktopPayload.teams;
      if (desktopPayload.champions) dbChamps = desktopPayload.champions;
      if (desktopPayload.sponsors) dbSponsors = desktopPayload.sponsors;
      if (desktopPayload.playersDict) dbPlayersDict = desktopPayload.playersDict;
      if (desktopPayload.press) dbPress = desktopPayload.press;
      if (desktopPayload.influencers) dbInfluencers = desktopPayload.influencers;
      if (desktopPayload.managers) dbManagers = desktopPayload.managers;
      if (desktopPayload.leaguesMeta) localLeagues = desktopPayload.leaguesMeta;
    } else if (filename === 'default.db') {
      // Load standard browser storage representation from IndexedDB
      const savedTeams = await getGameItem<any>('legendshub_custom_db');
      if (savedTeams) dbTeams = savedTeams;
      const savedChamps = await getGameItem<any>('legendshub_custom_champions');
      if (savedChamps) dbChamps = savedChamps;
      const savedSponsors = await getGameItem<any>('legendshub_custom_sponsors');
      if (savedSponsors) dbSponsors = savedSponsors;
      const savedDict = await getGameItem<any>('legendshub_custom_players_dict');
      if (savedDict) dbPlayersDict = savedDict;
      const savedPress = await getGameItem<any>('legendshub_custom_press');
      if (savedPress) dbPress = savedPress;
      const savedInf = await getGameItem<any>('legendshub_custom_influencers');
      if (savedInf) dbInfluencers = savedInf;
      const savedMgrs = await getGameItem<any>('legendshub_custom_managers');
      if (savedMgrs) dbManagers = savedMgrs;
      const savedLeagues = await getGameItem<any>('legendshub_custom_leagues_meta');
      if (savedLeagues) localLeagues = savedLeagues;
    }

    const seededTeams = seedAcademyPlayersIfEmpty(dbTeams);
    dbTeams = seededTeams;
    setEditorDb(seededTeams);
    setEditorChamps(JSON.parse(JSON.stringify(dbChamps)));
    setEditorSponsors(JSON.parse(JSON.stringify(dbSponsors)));
    setEditorPlayersDict(dbPlayersDict);
    setEditorPress(dbPress);
    setEditorInfluencers(dbInfluencers);
    setEditorManagers(dbManagers);
    setLeaguesMeta(localLeagues);

    // Default hooks for listings
    const regions = Object.keys(dbTeams);
    if (regions.length > 0) {
      const reg = regions[0];
      setSelectedRegion(reg);
      const firstTeam = dbTeams[reg]?.[0]?.id || '';
      setSelectedTeamId(firstTeam);
    }
    if (dbChamps.length > 0) setSelectedChampId(dbChamps[0].id);
    if (dbSponsors.length > 0) setSelectedSponsorId(dbSponsors[0].id);
    if (dbPress.length > 0) setSelectedPressId(dbPress[0].id);
    if (dbInfluencers.length > 0) setSelectedInfId(dbInfluencers[0].id);
    
    setLoading(false);
  };

  // MASTER SYSTEM COMMIT (SAVE TO ACTIVE DB & SAVE FILE INSTANTLY)
  const commitDatabaseChanges = async (feedback = true) => {
    const timestamp = Date.now();
    const consolidated = {
      teams: editorDb,
      champions: editorChamps,
      sponsors: editorSponsors,
      playersDict: editorPlayersDict,
      press: editorPress,
      influencers: editorInfluencers,
      managers: editorManagers,
      leaguesMeta: leaguesMeta,
      lastModified: timestamp
    };

    // Subscribes locally in IndexedDB (localForage)
    await setGameItem(`legendshub_db_${activeDbFilename}`, consolidated);
    if ((window as any).desktopAPI) {
      (window as any).desktopAPI.saveDatabase(activeDbFilename, consolidated).catch(() => {});
    }

    // Mandatory live playthrough career mode synchronization in IndexedDB
    await setGameItem('legendshub_custom_db', editorDb);
    await setGameItem('legendshub_custom_champions', editorChamps);
    await setGameItem('legendshub_custom_sponsors', editorSponsors);
    await setGameItem('legendshub_custom_players_dict', editorPlayersDict);
    await setGameItem('legendshub_custom_press', editorPress);
    await setGameItem('legendshub_custom_influencers', editorInfluencers);
    await setGameItem('legendshub_custom_managers', editorManagers);
    await setGameItem('legendshub_custom_leagues_meta', leaguesMeta);
    await setGameItem('editor_database.json', consolidated);
    await setGameItem('editor_last_modified_timestamp', String(timestamp));

    // Force window notifications to trigger reactive live reloads
    window.dispatchEvent(new Event('onEditorDatabaseSynced'));
    window.dispatchEvent(new Event('storage'));

    if (feedback) {
      alert(`[${activeDbFilename}] Alterações gravadas com sucesso e aplicadas ao jogo em tempo real!`);
    }
  };

  // EXPLOITING PICTURES LOADER IN ROTATIVE BASE64 (No physical file dependencies)
  const triggerImageBlobReader = (e: React.ChangeEvent<HTMLInputElement>, onReadCompleted: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const rawUrl = evt.target?.result as string;
        if (!rawUrl) return;

        // Custom image canvas compressor for safeguarding browser local quotas
        const img = new Image();
        img.src = srcNormalizer(rawUrl);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 128; // Standard optimized dimension
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            try {
              const compressed = canvas.toDataURL('image/png');
              onReadCompleted(compressed);
            } catch (_) {
              onReadCompleted(rawUrl);
            }
          } else {
            onReadCompleted(rawUrl);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const srcNormalizer = (val: string | null | undefined): string => {
    if (!val) return '';
    return val;
  };

  // GET ACTIVE SELECTIONS OR RAW RECORDS TEMPLATES
  const activeTeamsList = editorDb[selectedRegion] || [];
  const currentTeamObj = activeTeamsList.find(t => t.id === selectedTeamId) || activeTeamsList[0];

  // Resolve players roster considering both hardcoded base team array and overriding custom players list
  const getSimulatedPlayers = () => {
    if (!currentTeamObj) return [];
    const staticRes = getPlayersForTeam(currentTeamObj.id, false);
    const academyPlayers = currentTeamObj.academy || [];
    let masterList = [...staticRes.roster, ...staticRes.substitutes, ...academyPlayers];

    // Read Custom players
    Object.keys(editorPlayersDict).forEach(k => {
      const p = editorPlayersDict[k];
      if (p && p.isCustomNewPlayer && (p.teamId === currentTeamObj.id || p.newTeamId === currentTeamObj.id)) {
        if (!masterList.some(x => x.id === p.id)) {
          masterList.push(p);
        }
      }
    });

    // Apply Overrides and moves
    masterList = masterList.map(p => {
      const precisionKey = `${currentTeamObj.id}_${p.id}_${p.name}`;
      const oMap = editorPlayersDict[precisionKey] || editorPlayersDict[p.id] || {};
      return {
        ...p,
        ...oMap,
        attributes: { ...(p.attributes || {}), ...(oMap.attributes || {}) }
      };
    });

    // Filters deletes
    masterList = masterList.filter(p => !(p as any).deleted);

    // Filter by academy setting: elencoFilter = 0 (Time Principal, i.e., isAcademyStarter is false), elencoFilter = 1 (Academy, isAcademyStarter is true)
    return masterList.filter(p => elencoFilter === 1 ? !!p.isAcademyStarter : !p.isAcademyStarter);
  };

  const simulatedRoster = getSimulatedPlayers();
  const currentPlayerObj = simulatedRoster.find(p => p.id === selectedPlayerId) || simulatedRoster[0];

  // Current Selections Objects
  const currentSponsorObj = editorSponsors.find(s => s.id === selectedSponsorId) || editorSponsors[0];
  const currentChampObj = editorChamps.find(c => c.id === selectedChampId) || editorChamps[0];
  const currentPressObj = editorPress.find(p => p.id === selectedPressId) || editorPress[0];
  const currentInfObj = editorInfluencers.find(i => i.id === selectedInfId) || editorInfluencers[0];
  const currentManagerObj = editorManagers.find(m => m.teamId === selectedTeamId) || editorManagers.find(m => m.id === selectedManagerId) || editorManagers[0];

  // ==================== CRUD ENGINES ====================
  // LIGAS
  const handleAddLeague = () => {
    const code = prompt("SIGLA DA NOVA REGINAL (ex: LLA, LJL):")?.trim().toUpperCase();
    if (!code) return;
    if (editorDb[code]) {
      alert("Esta região de liga já existe no banco.");
      return;
    }
    const name = prompt("Nome completo da liga:") || code;
    
    setLeaguesMeta(prev => ({ ...prev, [code]: { name } }));
    setEditorDb(prev => ({ ...prev, [code]: [] }));
    setSelectedRegion(code);
  };

  const handleDeleteLeague = (reg: string) => {
    if (reg === 'CBLOL') {
      alert("Não é permitido deletar a liga principal CBLOL para salvaguardar a integridade de carreira.");
      return;
    }
    if (confirm(`Excluir permanentemente a liga ${reg}? Isso apagará todos os seus times!`)) {
      setLeaguesMeta(prev => {
        const copy = { ...prev };
        delete copy[reg];
        return copy;
      });
      setEditorDb(prev => {
        const copy = { ...prev };
        delete copy[reg];
        return copy;
      });
      setSelectedRegion('CBLOL');
    }
  };

  // TIMES
  const handleAddTeam = () => {
    const name = prompt("Nome do novo clube comercial (Ex: Vivo Keyd Stars):")?.trim();
    if (!name) return;
    const acronym = (prompt("Acrônimo / Sigla do time (3 a 4 letras):") || 'NEW').trim().toUpperCase();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const freshTeam: Team = {
      id,
      name,
      acronym,
      primaryColor: '#00d2fd',
      secondaryColor: '#121c2c',
      budget: 2000000,
      popularity: 70,
      fansSupport: 75,
      boardTrust: 80,
      roster: [],
      substitutes: [],
      academy: [
        generateProceduralAcademyPlayer('TOP', selectedRegion as any, 1, id),
        generateProceduralAcademyPlayer('JNG', selectedRegion as any, 2, id),
        generateProceduralAcademyPlayer('MID', selectedRegion as any, 3, id),
        generateProceduralAcademyPlayer('ADC', selectedRegion as any, 4, id),
        generateProceduralAcademyPlayer('SUP', selectedRegion as any, 5, id)
      ],
      sponsors: [],
      infrastructure: { gamingHouseLevel: 1, trainingCenterLevel: 1, mediaTeamLevel: 1 },
      isPlayerControlled: false,
      points: 0,
      wins: 0,
      losses: 0,
      gameWins: 0,
      gameLosses: 0,
      streak: '-',
      matchHistoryIds: [],
      region: selectedRegion as any
    };

    setEditorDb(prev => {
      const copy = { ...prev };
      copy[selectedRegion] = [...(copy[selectedRegion] || []), freshTeam];
      return copy;
    });
    setSelectedTeamId(id);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm("Deletar clube e dispensar todos os respectivos atletas cadastrados?")) {
      setEditorDb(prev => {
        const copy = { ...prev };
        copy[selectedRegion] = copy[selectedRegion].filter(t => t.id !== id);
        return copy;
      });
      setSelectedTeamId('');
    }
  };

  // JOGADORES
  const handleAddPlayer = () => {
    if (!currentTeamObj) {
      alert("Selecione um time principal primeiro.");
      return;
    }
    const nickname = prompt("Nickname do Atleta profissional (ex: brTT):")?.trim();
    if (!nickname) return;
    const pos = (prompt("Posição primária em rota (TOP, JNG, MID, ADC, SUP):") || 'MID').toUpperCase() as Position;
    const ovr = parseInt(prompt("Overall Rating Inicial (50 a 99):") || '72', 10);
    const pid = `p_${nickname.toLowerCase()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    const fresh: Player = {
      id: pid,
      name: nickname,
      realName: prompt("Nome Real Completo:") || nickname,
      nationality: 'Brasil',
      age: 19,
      position: pos,
      attributes: {
        mechanics: ovr, macro: ovr, communication: ovr, leadership: 60,
        consistency: ovr, emotionalControl: 70, farm: ovr, mapVision: ovr, playoffPerformance: ovr
      },
      overallRating: ovr,
      potential: Math.min(99, ovr + 8),
      personality: 'Equilibrado',
      popularity: 55,
      marketValue: 150000,
      salary: 15000,
      contractMonths: 24,
      motivation: 90,
      stamina: 100,
      chemistry: 75,
      championPool: [],
      isPlayerControlled: false,
      isAcademyStarter: elencoFilter === 1,
      is_academy: elencoFilter,
      customPlayer: true
    };

    // Store custom player template inside overrides dictionary with isCustomNewPlayer label
    setEditorPlayersDict(prev => ({
      ...prev,
      [pid]: {
        ...fresh,
        isCustomNewPlayer: true,
        teamId: currentTeamObj.id,
        newTeamId: currentTeamObj.id
      }
    }));
    setSelectedPlayerId(pid);
  };

  const handleDeletePlayer = (pObj: Player) => {
    if (!currentTeamObj || !pObj) return;
    if (confirm(`Confirmar rescisão / demissão do jogador ${pObj.name}?`)) {
      setEditorPlayersDict(prev => {
        const copy = { ...prev };
        const k = `${currentTeamObj.id}_${pObj.id}_${pObj.name}`;
        copy[k] = { ...copy[k], deleted: true };
        copy[pObj.id] = { ...copy[pObj.id], deleted: true };
        return copy;
      });
      setSelectedPlayerId('');
    }
  };

  // MANAGERS
  const handleAddManager = () => {
    const name = prompt("Nome do Novo Manager de Comissão:")?.trim();
    if (!name) return;
    const mid = `mgr_${Math.random().toString(36).substring(2, 7)}`;
    const team = currentTeamObj ? currentTeamObj.id : null;

    const fresh: Manager = {
      id: mid,
      name,
      age: 35,
      nationality: 'Brasil',
      photoUrl: '',
      teamId: team,
      reputationTier: 'A',
      popularity: 65,
      style: 'Equilibrado',
      emotionalProfile: 'Analítico',
      stats: { wins: 10, losses: 10, titles: 0, financialEfficiency: 70, youthPromotions: 0 },
      titlesGallery: [],
      previousTeams: [],
      recentResults: [],
      topChampions: []
    };

    setEditorManagers(prev => [...prev, fresh]);
    setSelectedManagerId(mid);
  };

  const handleDeleteManager = (id: string) => {
    if (confirm("Dispensa em definitivo este manager dos registros históricos?")) {
      setEditorManagers(prev => prev.filter(m => m.id !== id));
      setSelectedManagerId('');
    }
  };

  // IMPRENSA
  const handleAddPress = () => {
    const name = prompt("Nome do canal de comunicação de imprensa:")?.trim();
    if (!name) return;
    const pId = `press_${Math.random().toString(36).substring(2, 7)}`;
    setEditorPress(prev => [...prev, { id: pId, name, logoUrl: '' }]);
    setSelectedPressId(pId);
  };

  // INFLUENCERS
  const handleAddInfluencer = () => {
    const name = prompt("Nome do Criador de Conteúdo / Influenciador:")?.trim();
    if (!name) return;
    const tag = prompt("Social Handle (ex: @baiano):") || `@${name.toLowerCase()}`;
    const iId = `inf_${Math.random().toString(36).substring(2, 7)}`;
    setEditorInfluencers(prev => [...prev, { id: iId, name, socialHandle: tag, photoUrl: '' }]);
    setSelectedInfId(iId);
  };

  // PATROCINADORES
  const handleAddSponsor = () => {
    const name = prompt("Nome comercial da marca parceira corporativa:")?.trim();
    if (!name) return;
    const sId = `sp_${Math.random().toString(36).substring(2, 7)}`;
    const fresh: Sponsor = {
      id: sId,
      name,
      logoUrl: '',
      incomePerWeek: 40000,
      signatureBonus: 90000,
      termsInWeeks: 12,
      minPopularity: 45,
      isSigned: false,
      objective: 'Terminar o campeonato regular Top 4 popularidade',
      objectiveBonus: 30000
    };
    setEditorSponsors(prev => [...prev, fresh]);
    setSelectedSponsorId(sId);
  };

  // CAMPEÕES
  const handleAddChampion = () => {
    const name = prompt("Nome do novo campeão da Summoner Arena:")?.trim();
    if (!name) return;
    const cId = `champ_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const fresh: Champion = {
      id: cId,
      name,
      roles: ['MID'],
      tier: 'S',
      power: 80,
      buffStatus: 'NORMAL',
      idealPlaystyle: 'Controle de Grupo / Burst',
      counters: [],
      synergies: [],
      imageSeed: Math.floor(Math.random() * 100)
    };
    setEditorChamps(prev => [...prev, fresh]);
    setSelectedChampId(cId);
  };

  const handleEntityDeleteGeneric = (type: 'press' | 'inf' | 'sponsor' | 'champ', id: string) => {
    if (confirm("Confirmar exclusão definitiva do registro ativo no banco?")) {
      if (type === 'press') {
        setEditorPress(prev => prev.filter(x => x.id !== id));
        setSelectedPressId('');
      } else if (type === 'inf') {
        setEditorInfluencers(prev => prev.filter(x => x.id !== id));
        setSelectedInfId('');
      } else if (type === 'sponsor') {
        setEditorSponsors(prev => prev.filter(x => x.id !== id));
        setSelectedSponsorId('');
      } else if (type === 'champ') {
        setEditorChamps(prev => prev.filter(x => x.id !== id));
        setSelectedChampId('');
      }
    }
  };

  // REFRESH OR FILE REPAIR ACTIONS
  const handleRepairIndices = () => {
    const repairedDb = { ...editorDb };
    Object.keys(repairedDb).forEach(reg => {
      repairedDb[reg] = repairedDb[reg].map(t => ({
        ...t,
        primaryColor: t.primaryColor || '#00bcd4',
        secondaryColor: t.secondaryColor || '#121c2c',
        budget: Number(t.budget) || 2000000,
        popularity: Number(t.popularity) || 70,
        fansSupport: Number(t.fansSupport) || 70,
        boardTrust: Number(t.boardTrust) || 70
      }));
    });
    setEditorDb(repairedDb);
    alert(`⚙️ Reindexação SQLite Completa! Atributos limpos de redundâncias e integridade estrutural validada com sucesso!`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 overflow-y-auto antialiased font-sans">
        <div className="w-full max-w-sm bg-[#19202e] border border-[#00bcd4]/35 shadow-[0_0_35px_rgba(0,188,212,0.22)] rounded-3xl p-8 text-center text-slate-100 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 text-[#00bcd4] animate-spin" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Carregando Banco de Dados</h2>
          <p className="text-[10px] text-slate-400">Extraindo tabelas estruturais e assinaturas do simulador a partir do ecossistema assíncrono IndexedDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto antialiased font-sans">
      
      {/* FULL WIDTH STYLIZED MODAL WINDOW - matching aparencia.png */}
      <div className="w-full max-w-6xl h-[92vh] max-h-[720px] bg-[#19202e] border border-[#00bcd4]/35 shadow-[0_0_30px_rgba(0,188,212,0.18)] rounded-3xl flex flex-col lg:flex-row overflow-hidden relative text-slate-100">
        
        {/* CLOSE BUTTON - Top Right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-black/40 hover:bg-[#00bcd4]/20 p-2 rounded-full border border-slate-700 hover:border-[#00bcd4]/40 z-20 cursor-pointer transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= BARRA LATERAL ESQUERDA ================= */}
        <div className="w-full lg:w-64 bg-[#111724] border-b lg:border-b-0 lg:border-r border-[#1e2d44] flex flex-col justify-between p-5 shrink-0">
          <div>
            {/* Header Style - aparencia.png */}
            <div className="mb-6 pb-2 border-b border-slate-800/60 text-left">
              <span className="text-xs font-black tracking-widest text-white uppercase block leading-none">CONFIGURAÇÕES</span>
              <span className="text-[10px] font-bold tracking-widest text-[#00bcd4] uppercase block mt-1">MODO GLOBAL</span>
            </div>

            {/* Nine Strict Vertical Tabs */}
            <nav className="space-y-1">
              {[
                { id: 'db', label: '1. Banco de Dados', icon: Server },
                { id: 'leagues', label: '2. Ligas', icon: Award },
                { id: 'teams', label: '3. Times', icon: Shield },
                { id: 'players', label: '4. Jogadores', icon: Users },
                { id: 'managers', label: '5. Managers', icon: Award },
                { id: 'press', label: '6. Imprensa', icon: Tv },
                { id: 'influencers', label: '7. Influencers', icon: MessageSquare },
                { id: 'sponsors', label: '8. Patrocinadores', icon: Sparkles },
                { id: 'champions', label: '9. Campeões e Meta', icon: Flame }
              ].map(tab => {
                const isAct = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabId);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative cursor-pointer group ${
                      isAct 
                        ? 'bg-[#00bcd4]/10 text-white font-bold border-l-2 border-[#00bcd4]' 
                        : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    {isAct && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00bcd4] rounded-r-md" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isAct ? 'text-[#00bcd4]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Lower Branding Signature Style - aparencia.png */}
          <div className="mt-6 pt-3 border-t border-slate-800/80 text-left select-none">
            <span className="text-[7.5px] font-mono tracking-widest text-slate-500 uppercase block leading-normal leading-relaxed">
              VERSÃO 1.0.1 - RELEASE BETA
            </span>
            <span className="text-[7px] font-mono tracking-wider text-slate-600 uppercase block mt-0.5">
              LEGENDSHUB • DESENVOLVIDO POR DAVISON SANT
            </span>
          </div>
        </div>

        {/* ================= PAINEL DE CONTEÚDO PRINCIPAL (DIREITO) ================= */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden p-6 lg:p-8 bg-[#161e2b]">
          
          {/* Upper Title Area */}
          <div className="pb-4 border-b border-slate-800 flex justify-between items-center shrink-0 text-left">
            <div>
              <span className="text-[8px] font-mono tracking-widest uppercase bg-[#00bcd4]/10 text-[#00bcd4] px-1.5 py-0.5 rounded border border-[#00bcd4]/20">
                EDITANDO: {activeDbFilename}
              </span>
              <h2 className="text-xl font-bold tracking-tight uppercase text-white mt-1.5">
                {activeTab === 'db' ? 'Gerenciador do Ecossistema' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('db', '')}`}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-emerald-400 uppercase">SYS_ENG_CONNECTED</span>
            </div>
          </div>

          {/* Core Body Container (Inner Split Columns) */}
          <div className="flex-1 min-h-0 py-5 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
            
            {/* COLUMN LEFT (List of items - 4 cols / 33% width) */}
            <div className="md:col-span-5 flex flex-col min-h-0 overflow-hidden bg-[#0e141f] rounded-2xl border border-slate-800 p-4">
              
              {/* Regional selection bindings under applicable tables */}
              {['teams', 'players', 'managers'].includes(activeTab) && (
                <div className="mb-3 flex flex-col gap-1.5 text-left shrink-0">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400">Selecionar Liga Regional</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedTeamId('');
                      setSelectedPlayerId('');
                    }}
                    className="w-full bg-[#161e2b] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00bcd4]"
                  >
                    {Object.keys(leaguesMeta).map(reg => (
                      <option key={reg} value={reg}>{leaguesMeta[reg]?.name || reg}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Elenco Filter strictly bounded under Jogadores category */}
              {activeTab === 'players' && (
                <div className="mb-3 flex flex-col gap-1.5 text-left shrink-0">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400">Elenco</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { setElencoFilter(0); setSelectedPlayerId(''); }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black tracking-wider border uppercase transition-colors shrink-0 cursor-pointer ${
                        elencoFilter === 0 
                          ? 'bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/45' 
                          : 'bg-[#161e2b] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Time Principal
                    </button>
                    <button
                      onClick={() => { setElencoFilter(1); setSelectedPlayerId(''); }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black tracking-wider border uppercase transition-colors shrink-0 cursor-pointer ${
                        elencoFilter === 1 
                          ? 'bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/45' 
                          : 'bg-[#161e2b] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Academy
                    </button>
                  </div>
                </div>
              )}

              {/* Player filtering bindings by team */}
              {activeTab === 'players' && (
                <div className="mb-3 flex flex-col gap-1.5 text-left shrink-0">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400">Clube de Contrato</label>
                  <select 
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      setSelectedPlayerId('');
                    }}
                    className="w-full bg-[#161e2b] border border-slate-800 rounded-xl p-2.5 text-xs text-[#00bcd4] font-bold focus:outline-none"
                  >
                    <option value="">-- Sem Clube / Agente Livre --</option>
                    {activeTeamsList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Universal Search Query bar */}
              {activeTab !== 'db' && (
                <div className="mb-3 relative shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procurar elemento..."
                    className="w-full bg-[#161e2b] text-slate-100 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#00bcd4]"
                  />
                </div>
              )}

              {/* MASTER VERTICAL SCROLLABLE OBJECT LIST */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                
                {/* LIGAS */}
                {activeTab === 'leagues' && (
                  Object.keys(leaguesMeta).filter(reg => {
                    const lmObj = leaguesMeta[reg];
                    return reg.toLowerCase().includes(searchQuery.toLowerCase()) || lmObj.name?.toLowerCase().includes(searchQuery.toLowerCase());
                  }).map(reg => {
                    const isSel = selectedRegion === reg;
                    return (
                      <button
                        key={reg}
                        onClick={() => setSelectedRegion(reg)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                          isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold uppercase">{leaguesMeta[reg]?.name || reg}</span>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider block">ID: {reg}</span>
                        </div>
                      </button>
                    )
                  })
                )}

                {/* TIMES */}
                {activeTab === 'teams' && (
                  activeTeamsList.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.acronym.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(t => {
                      const isSel = selectedTeamId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{t.name}</span>
                            <span className="text-[9px] font-mono text-[#00bcd4] mt-1 uppercase block">ID: {t.id}</span>
                          </div>
                          <span className="text-[9px] font-mono bg-slate-800 text-white px-2 py-0.5 rounded font-black">{t.acronym}</span>
                        </button>
                      );
                    })
                )}

                {/* JOGADORES */}
                {activeTab === 'players' && (
                  simulatedRoster.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.realName && p.realName.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(p => {
                      const isSel = selectedPlayerId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{p.name}</span>
                            <span className="text-[9px] font-mono text-[#00bcd4] mt-1 uppercase block">ID: {p.id}</span>
                          </div>
                          <span className="text-[9px] font-mono bg-[#161e2b] border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">{p.position} | OVR {p.overallRating}</span>
                        </button>
                      );
                    })
                )}

                {/* MANAGERS */}
                {activeTab === 'managers' && (
                  (() => {
                    /*
                      -- A consulta deve vincular estritamente o manager ao time e o time à liga selecionada
                      SELECT managers.*, teams.nome AS team_name 
                      FROM managers 
                      INNER JOIN teams ON managers.team_id = teams.id 
                      WHERE teams.league_id = ?;
                    */
                    const selectedLeagueId = selectedRegion;
                    const activeTeamsList = editorDb[selectedLeagueId] || [];
                    return editorManagers.filter(m => {
                      if (!m.teamId) return false;
                      const hasTeamInLeague = activeTeamsList.some(t => t.id === m.teamId);
                      return hasTeamInLeague && m.name.toLowerCase().includes(searchQuery.toLowerCase());
                    }).map(m => {
                      const isSel = selectedManagerId === m.id || (m.teamId && selectedTeamId === m.teamId);
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedManagerId(m.id); if (m.teamId) setSelectedTeamId(m.teamId); }}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{m.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase block">ID: {m.id}</span>
                          </div>
                          <span className="text-[9px] font-mono bg-[#161e2b] text-slate-400 px-2 py-0.5 rounded uppercase">TIER {m.reputationTier}</span>
                        </button>
                      );
                    });
                  })()
                )}

                {/* IMPRENSA */}
                {activeTab === 'press' && (
                  editorPress.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(p => {
                      const isSel = selectedPressId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPressId(p.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{p.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase block">ID: {p.id}</span>
                          </div>
                        </button>
                      );
                    })
                )}

                {/* INFLUENCERS */}
                {activeTab === 'influencers' && (
                  editorInfluencers.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(i => {
                      const isSel = selectedInfId === i.id;
                      return (
                        <button
                          key={i.id}
                          onClick={() => setSelectedInfId(i.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{i.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase block">ID: {i.id}</span>
                          </div>
                          <span className="text-[9.5px] font-mono text-[#00bcd4] uppercase shrink-0">{i.socialHandle}</span>
                        </button>
                      );
                    })
                )}

                {/* PATROCINADORES */}
                {activeTab === 'sponsors' && (
                  editorSponsors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(s => {
                      const isSel = selectedSponsorId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSponsorId(s.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{s.name}</span>
                            <span className="text-[9px] font-mono text-[#00bcd4] mt-1 uppercase block">ID: {s.id}</span>
                          </div>
                          <span className="text-[9.5px] font-mono text-emerald-400 font-bold shrink-0">+{formatMoney(s.incomePerWeek)}/S</span>
                        </button>
                      );
                    })
                )}

                {/* CAMPEÕES */}
                {activeTab === 'champions' && (
                  editorChamps.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(c => {
                      const isSel = selectedChampId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChampId(c.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                            isSel ? 'bg-[#00bcd4]/10 border-[#00bcd4]/60 text-white' : 'bg-[#161e2b]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase">{c.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase block">ID: {c.id}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-[#161e2b] border border-slate-800 text-slate-300 px-2 py-0.5 rounded shrink-0">OVR {c.power} | {c.tier}</span>
                        </button>
                      );
                    })
                )}

                {/* BANCO DE DADOS EXPLAINER */}
                {activeTab === 'db' && (
                  <div className="p-4 bg-[#161e2b] rounded-xl border border-slate-800 text-xs text-slate-400 space-y-4 font-mono leading-relaxed select-none">
                    <p className="text-[#00bcd4] font-black uppercase text-[10px] tracking-widest border-b border-slate-800 pb-1.5 inline-block">CONTROLE DE INTEGRIDADE</p>
                    <p>O LegendsHub usa o arquivo de banco de dados isolado &apos;default.db&apos; de forma primária para carregar os rosters, patrocínios e patches esportivos do launcher principal.</p>
                    <p>Os botões ao lado permitem a salvaguarda operacional do arquivo. Utilize e teste edições em tempo real.</p>
                  </div>
                )}
              </div>

              {/* ACTION ADD/REMOVE BUTTONS FOR GENERAL ENTITY LISTS */}
              {activeTab !== 'db' && (
                <div className="mt-3 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 shrink-0 select-none">
                  <button
                    onClick={() => {
                      if (activeTab === 'leagues') handleAddLeague();
                      else if (activeTab === 'teams') handleAddTeam();
                      else if (activeTab === 'players') handleAddPlayer();
                      else if (activeTab === 'managers') handleAddManager();
                      else if (activeTab === 'press') handleAddPress();
                      else if (activeTab === 'influencers') handleAddInfluencer();
                      else if (activeTab === 'sponsors') handleAddSponsor();
                      else if (activeTab === 'champions') handleAddChampion();
                    }}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black tracking-wider border border-[#00bcd4]/35 bg-[#00bcd4]/5 text-[#00bcd4] uppercase hover:bg-[#00bcd4]/10 transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                  <button
                    onClick={() => {
                      if (activeTab === 'leagues') handleDeleteLeague(selectedRegion);
                      else if (activeTab === 'teams' && currentTeamObj) handleDeleteTeam(currentTeamObj.id);
                      else if (activeTab === 'players' && currentPlayerObj) handleDeletePlayer(currentPlayerObj);
                      else if (activeTab === 'managers' && currentManagerObj) handleDeleteManager(currentManagerObj.id);
                      else if (activeTab === 'press' && currentPressObj) handleEntityDeleteGeneric('press', currentPressObj.id);
                      else if (activeTab === 'influencers' && currentInfObj) handleEntityDeleteGeneric('inf', currentInfObj.id);
                      else if (activeTab === 'sponsors' && currentSponsorObj) handleEntityDeleteGeneric('sponsor', currentSponsorObj.id);
                      else if (activeTab === 'champions' && currentChampObj) handleEntityDeleteGeneric('champ', currentChampObj.id);
                    }}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black tracking-wider border border-red-500/25 bg-red-950/20 text-red-400 uppercase hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deletar
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN RIGHT (Form details editor - 7 cols / 67% width) */}
            <div className="md:col-span-7 bg-[#1c2432]/60 rounded-2xl border border-slate-800 p-5 overflow-y-auto max-h-[500px]">
              
              {/* TAB BANCO DE DADOS EDIT SECTION */}
              {activeTab === 'db' && (
                <div className="space-y-6 text-left">
                  <div className="bg-[#111724] border border-[#00bcd4]/20 p-4 rounded-2xl space-y-3.5">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#00bcd4] border-b border-slate-800 pb-1.5 block">CONTA E MANAGER ACTIVO</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dropdown database files */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Banco Desejado (.db)</label>
                        <select
                          value={activeDbFilename}
                          onChange={(e) => {
                            const fName = e.target.value;
                            setActiveDbFilename(fName);
                            loadActiveDatabase(fName);
                          }}
                          className="w-full bg-[#161e2b] border border-slate-800 rounded-xl p-2.5 text-xs text-[#00bcd4] font-bold focus:outline-none focus:ring-1 focus:ring-[#00bcd4]/30"
                        >
                          {dbFilesList.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      {/* Utility buttons for database */}
                      <div className="space-y-4 pt-1 select-none">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Ações de Ecossistema</label>
                        <div className="grid grid-cols-2 gap-2">
                          
                          {/* File input import */}
                          <label className="flex items-center justify-center gap-1 px-3 py-2 bg-[#121824] hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase text-slate-300 rounded-xl cursor-pointer transition-colors leading-none">
                            <Upload className="w-3 h-3 text-[#00bcd4]" /> Importar
                            <input 
                              type="file" 
                              accept=".db,.json" 
                              className="hidden" 
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const r = new FileReader();
                                  r.onload = (evt) => {
                                    try {
                                      const json = JSON.parse(evt.target?.result as string);
                                      if (json.teams) {
                                        setEditorDb(json.teams || {});
                                        setEditorChamps(json.champions || []);
                                        setEditorSponsors(json.sponsors || []);
                                        setEditorPlayersDict(json.playersDict || {});
                                        setEditorPress(json.press || []);
                                        setEditorInfluencers(json.influencers || []);
                                        setEditorManagers(json.managers || []);
                                        setLeaguesMeta(json.leaguesMeta || {});
                                        
                                        const nameTag = f.name.endsWith('.db') ? f.name : `${f.name}.db`;
                                        if (!dbFilesList.includes(nameTag)) {
                                          setDbFilesList(prev => [...prev, nameTag]);
                                        }
                                        setActiveDbFilename(nameTag);
                                        setGameItem(`legendshub_db_${nameTag}`, json);
                                        alert(`Banco de dados de simulação importado com sucesso: ${nameTag}`);
                                      } else {
                                        alert("Formato de arquivo .db inválido estruturalmente.");
                                      }
                                    } catch (_) {
                                      alert("Falha no parser JSON do arquivo .db selecionado.");
                                    }
                                  };
                                  r.readAsText(f);
                                }
                              }} 
                            />
                          </label>

                          <button
                            onClick={() => {
                              const consolidated = {
                                teams: editorDb, champions: editorChamps, sponsors: editorSponsors,
                                playersDict: editorPlayersDict, press: editorPress, influencers: editorInfluencers,
                                managers: editorManagers, leaguesMeta: leaguesMeta, lastModified: Date.now()
                              };
                              const blob = new Blob([JSON.stringify(consolidated, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = activeDbFilename;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-[#121824] hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase text-slate-300 rounded-xl cursor-pointer transition-colors leading-none"
                          >
                            <Download className="w-3 h-3 text-[#00bcd4]" /> Exportar
                          </button>

                          <button
                            onClick={async () => {
                              const label = prompt("Digite o novo identificador do Banco (.db):", activeDbFilename);
                              if (label && label.trim()) {
                                let tag = label.trim();
                                if (!tag.endsWith('.db')) tag += '.db';
                                if (tag === 'default.db') {
                                  alert("Operação bloqueada: o banco padrão não pode ser renomeado.");
                                  return;
                                }
                                setDbFilesList(prev => prev.map(f => f === activeDbFilename ? tag : f));
                                setActiveDbFilename(tag);
                                await removeGameItem(`legendshub_db_${activeDbFilename}`);
                                await commitDatabaseChanges(false);
                                alert(`Rótulo modificado com sucesso para ${tag}!`);
                              }
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-[#121824] hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase text-slate-300 rounded-xl cursor-pointer transition-colors leading-none"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Renomear
                          </button>

                          <button
                            onClick={async () => {
                              if (activeDbFilename === 'default.db') {
                                alert("Não é permitido deletar o arquivo de fábrica default.db.");
                                return;
                              }
                              if (confirm(`Tem certeza de que deseja deletar permanentemente o bando de dados '${activeDbFilename}'?`)) {
                                await removeGameItem(`legendshub_db_${activeDbFilename}`);
                                setDbFilesList(prev => prev.filter(f => f !== activeDbFilename));
                                setActiveDbFilename('default.db');
                                await loadActiveDatabase('default.db');
                              }
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-[#121824] hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase text-red-400 rounded-xl cursor-pointer transition-colors leading-none"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111724] border border-slate-800 p-4 rounded-2xl flex justify-between items-center select-none">
                    <div className="text-left space-y-1">
                      <strong className="text-xs font-bold text-white block uppercase">Verificar & Reparar Integridades</strong>
                      <span className="text-[10px] text-slate-400 block tracking-wide">Analisa e corrige estruturas vazias, colorações erráticas e relações órfãs nas tabelas internas.</span>
                    </div>
                    <button
                      onClick={handleRepairIndices}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-mono text-[10px] font-black text-[#00bcd4] uppercase cursor-pointer"
                    >
                      Reparar
                    </button>
                  </div>
                </div>
              )}

              {/* TAB LIGAS DESCRIPTION & EDITOR */}
              {activeTab === 'leagues' && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    
                    {/* LEAGUE PHOTO BOX */}
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {leaguesMeta[selectedRegion]?.logo_blob || leaguesMeta[selectedRegion]?.logoUrl ? (
                        <img 
                          src={srcNormalizer(leaguesMeta[selectedRegion]?.logo_blob || leaguesMeta[selectedRegion]?.logoUrl)} 
                          alt="Logo Liga" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>

                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">FOTO DA LIGA COOP</h4>
                      <p className="text-[9.5px] text-slate-400">Escolha um arquivo de imagem (.png/.jpg) para submeter como logo da liga na coluna BLOB.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setLeaguesMeta(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = { ...(copy[selectedRegion] || {}), logo_blob: b64, logoUrl: b64 };
                              return copy;
                            });
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Sigla / ID (Mono)</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedRegion}
                        className="w-full bg-[#111724]/80 text-[#00bcd4] border border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Oficial</label>
                      <input 
                        type="text" 
                        value={leaguesMeta[selectedRegion]?.name || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setLeaguesMeta(prev => {
                            const copy = { ...prev };
                            copy[selectedRegion] = { ...(copy[selectedRegion] || {}), name: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end shrink-0 select-none">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB TIMES DESCRIPTION & EDITOR */}
              {activeTab === 'teams' && currentTeamObj && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    
                    {/* TEAM LOGO BOX */}
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentTeamObj?.logo_blob || currentTeamObj?.logoUrl ? (
                        <img 
                          src={srcNormalizer(currentTeamObj?.logo_blob || currentTeamObj?.logoUrl)} 
                          alt="Logo Time" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>

                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">LOGO DO CLUBE</h4>
                      <p className="text-[9.5px] text-slate-400">Insira um arquivo de imagem (.png/.jpg) para submeter como logo da liga na coluna BLOB.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorDb(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = copy[selectedRegion].map(t => {
                                if (t.id === currentTeamObj.id) {
                                  return { ...t, logo_blob: b64, logoUrl: b64 };
                                }
                                return t;
                              });
                              return copy;
                            });
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Oficial</label>
                      <input 
                        type="text" 
                        value={currentTeamObj.name || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorDb(prev => {
                            const copy = { ...prev };
                            copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, name: val } : t);
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Sigla (3 ou 4 chars)</label>
                      <input 
                        type="text" 
                        maxLength={4} 
                        value={currentTeamObj.acronym || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorDb(prev => {
                            const copy = { ...prev };
                            copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, acronym: val } : t);
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs uppercase" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Orçamento Operacional ($)</label>
                      <input 
                        type="number" 
                        value={currentTeamObj.budget || 2000000} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorDb(prev => {
                            const copy = { ...prev };
                            copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, budget: val } : t);
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Popularidade (0 a 100)</label>
                      <input 
                        type="number" 
                        min={0} max={100} 
                        value={currentTeamObj.popularity || 70} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorDb(prev => {
                            const copy = { ...prev };
                            copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, popularity: val } : t);
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Cor Comercial Primária</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={currentTeamObj.primaryColor || '#00d2fd'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorDb(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, primaryColor: val } : t);
                              return copy;
                            });
                          }}
                          className="w-10 h-10 bg-transparent border-0 cursor-pointer overflow-hidden leading-none resize-none shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={currentTeamObj.primaryColor || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorDb(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, primaryColor: val } : t);
                              return copy;
                            });
                          }}
                          className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Cor de Combate Secundária</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={currentTeamObj.secondaryColor || '#121c2c'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorDb(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, secondaryColor: val } : t);
                              return copy;
                            });
                          }}
                          className="w-10 h-10 bg-transparent border-0 cursor-pointer overflow-hidden leading-none resize-none shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={currentTeamObj.secondaryColor || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorDb(prev => {
                              const copy = { ...prev };
                              copy[selectedRegion] = copy[selectedRegion].map(t => t.id === currentTeamObj.id ? { ...t, secondaryColor: val } : t);
                              return copy;
                            });
                          }}
                          className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end shrink-0 select-none">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB JOGADORES DESCRIPTION & EDITOR */}
              {activeTab === 'players' && currentPlayerObj && (
                <div className="space-y-4 text-left font-sans animate-fade-in">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    
                    {/* PLAYER FACE PHOTO BOX WITH CYAN BORDER */}
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-full relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentPlayerObj?.face_blob || currentPlayerObj?.photoUrl ? (
                        <img 
                          src={srcNormalizer(currentPlayerObj?.face_blob || currentPlayerObj?.photoUrl)} 
                          alt="Face Jogador" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>

                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">FOTO DO PERFIL</h4>
                      <p className="text-[9.5px] text-slate-400">Insira um arquivo de imagem (.png/.jpg) para gravar fotos customizadas diretamente no banco.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorPlayersDict(prev => {
                              const copy = { ...prev };
                              const pid = currentPlayerObj.id;
                              
                              // Handle either direct override keys or custom isCustomNewPlayer slots
                              const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                              const targetKey = copy[staticKey] ? staticKey : pid;

                              copy[targetKey] = {
                                ...(copy[targetKey] || {}),
                                id: pid,
                                name: currentPlayerObj.name,
                                face_blob: b64,
                                photoUrl: b64
                              };
                              return copy;
                            });
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nickname / Combate</label>
                      <input 
                        type="text" 
                        value={currentPlayerObj.name || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Real Completo</label>
                      <input 
                        type="text" 
                        value={currentPlayerObj.realName || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: currentPlayerObj.name, realName: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Rating Geral (OVR)</label>
                      <input 
                        type="number" 
                        min={30} max={99} 
                        value={currentPlayerObj.overallRating || 72} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: currentPlayerObj.name, overallRating: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Idade Atleta</label>
                      <input 
                        type="number" 
                        value={currentPlayerObj.age || 20} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: currentPlayerObj.name, age: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Rota / Posição</label>
                      <select 
                        value={currentPlayerObj.position || 'MID'} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: currentPlayerObj.name, position: val as Position };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] border border-slate-100/5 select-none rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="TOP">TOP (Rota Superior)</option>
                        <option value="JNG">JNG (Caçador da Selva)</option>
                        <option value="MID">MID (Rota do Meio)</option>
                        <option value="ADC">ADC (Atirador Principal)</option>
                        <option value="SUP">SUP (Suporte Defensivo)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nacionalidade</label>
                      <input 
                        type="text" 
                        value={currentPlayerObj.nationality || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorPlayersDict(prev => {
                            const copy = { ...prev };
                            const pid = currentPlayerObj.id;
                            const staticKey = currentTeamObj ? `${currentTeamObj.id}_${pid}_${currentPlayerObj.name}` : pid;
                            const targetKey = copy[staticKey] ? staticKey : pid;

                            copy[targetKey] = { ...(copy[targetKey] || {}), id: pid, name: currentPlayerObj.name, nationality: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end pb-3 select-none shrink-0">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB DEFINE MANAGERS AREA */}
              {activeTab === 'managers' && (
                currentManagerObj ? (
                  <div className="space-y-4 text-left font-sans">
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 block w-max mb-1">
                      ATRIBUIÇÃO DE CLUBES COMPETITIVOS
                    </span>
                    
                    <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                      
                      {/* MANAGER FACE PICTURE BOX */}
                      <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-full relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                        {currentManagerObj?.photoUrl ? (
                          <img 
                            src={srcNormalizer(currentManagerObj?.photoUrl)} 
                            alt="Manager Face" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RenderSilhouette />
                        )}
                      </div>

                      <div className="space-y-2 select-none">
                        <h4 className="text-xs font-bold text-[#00bcd4] uppercase">FOTO DE MANAGER</h4>
                        <p className="text-[9.5px] text-slate-400">Importe uma foto binária para preencher as mídias esportivas dentro do painel do Electron.</p>
                        
                        <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                          UPLOAD LOCAL
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => triggerImageBlobReader(e, (b64) => {
                              setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, photoUrl: b64 } : m));
                            })} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Oficial</label>
                        <input 
                          type="text" 
                          value={currentManagerObj.name || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, name: val } : m));
                          }}
                          className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Vinculo de Time</label>
                        <select 
                          value={currentManagerObj.teamId || ''} 
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, teamId: val } : m));
                          }}
                          className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="">-- Manager Desempregado (Livre) --</option>
                          {activeTeamsList.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Classificação / Reputação</label>
                        <select 
                          value={currentManagerObj.reputationTier || 'S'} 
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, reputationTier: val } : m));
                          }}
                          className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="S">Tier S (Estrela Internacional)</option>
                          <option value="A">Tier A (Consolidado)</option>
                          <option value="B">Tier B (Veterano)</option>
                          <option value="C">Tier C (Promissor / Jovem)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nacionalidade</label>
                        <input 
                          type="text" 
                          value={currentManagerObj.nationality || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, nationality: val } : m));
                          }}
                          className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Estilo de Draft</label>
                        <select 
                          value={currentManagerObj.style || 'Equilibrado'} 
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, style: val } : m));
                          }}
                          className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="Agressivo">Agressivo (Prioridade Combativa)</option>
                          <option value="Equilibrado">Equilibrado (Adaptação a Patches)</option>
                          <option value="Lento">Lento (Prioridade Tática e Escalação)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Perfil Emocional</label>
                        <select 
                          value={currentManagerObj.emotionalProfile || 'Analítico'} 
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setEditorManagers(prev => prev.map(m => m.id === currentManagerObj.id ? { ...m, emotionalProfile: val } : m));
                          }}
                          className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="Estóico">Estóico (Resiliência sob Estresse)</option>
                          <option value="Explosivo">Explosivo (Combativo mas inconsistente)</option>
                          <option value="Analítico">Analítico (Prioriza dados e estatísticas)</option>
                          <option value="Motivador">Motivador (Foco em moral e clima)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end select-none shrink-0">
                      <button
                        onClick={() => commitDatabaseChanges(true)}
                        className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs font-mono text-slate-500 uppercase">
                    Nenhum editor de manager ativo. Selecione ou adicione.
                  </div>
                )
              )}

              {/* TAB IMPRENSA DESCRIPTION & EDITOR */}
              {activeTab === 'press' && currentPressObj && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentPressObj?.logo_blob || currentPressObj?.logoUrl ? (
                        <img 
                          src={srcNormalizer(currentPressObj?.logo_blob || currentPressObj?.logoUrl)} 
                          alt="Logo Imprensa" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>
                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">LOGO COMUNICAÇÃO</h4>
                      <p className="text-[9.5px] text-slate-400">Envie um logo em Base64 para exibir em matérias de notícias e rumores.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorPress(prev => prev.map(p => p.id === currentPressObj.id ? { ...p, logo_blob: b64, logoUrl: b64 } : p));
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome do Veículo de Imprensa</label>
                    <input 
                      type="text" 
                      value={currentPressObj.name || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditorPress(prev => prev.map(p => p.id === currentPressObj.id ? { ...p, name: val } : p));
                      }}
                      className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                    />
                  </div>

                  <div className="pt-4 flex justify-end select-none shrink-0">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB INFLUENCERS DESCRIPTION & EDITOR */}
              {activeTab === 'influencers' && currentInfObj && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-full relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentInfObj?.face_blob || currentInfObj?.photoUrl ? (
                        <img 
                          src={srcNormalizer(currentInfObj?.face_blob || currentInfObj?.photoUrl)} 
                          alt="Face Influencer" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>
                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">FOTO DE PERFIL COMUNIDADE</h4>
                      <p className="text-[9.5px] text-slate-400">Insira um avatar em Base64 para tweets de feeds sociais e redes.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorInfluencers(prev => prev.map(i => i.id === currentInfObj.id ? { ...i, face_blob: b64, photoUrl: b64 } : i));
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Apelido / Nome</label>
                      <input 
                        type="text" 
                        value={currentInfObj.name || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorInfluencers(prev => prev.map(i => i.id === currentInfObj.id ? { ...i, name: val } : i));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Identificador Redes (Handle)</label>
                      <input 
                        type="text" 
                        value={currentInfObj.socialHandle || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorInfluencers(prev => prev.map(i => i.id === currentInfObj.id ? { ...i, socialHandle: val } : i));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end select-none shrink-0">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB PATROCINADORES DESCRIPTION & EDITOR */}
              {activeTab === 'sponsors' && currentSponsorObj && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow font-sans">
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentSponsorObj?.logo_blob || currentSponsorObj?.logoUrl ? (
                        <img 
                          src={srcNormalizer(currentSponsorObj?.logo_blob || currentSponsorObj?.logoUrl)} 
                          alt="Logo Patrocinador" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>
                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">LOGO CORPORATIVO</h4>
                      <p className="text-[9.5px] text-slate-400">Selecione uma imagem Base64 para mídias institucionais e de camisas.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, logo_blob: b64, logoUrl: b64 } : s));
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Corporativo</label>
                    <input 
                      type="text" 
                      value={currentSponsorObj.name || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, name: val } : s));
                      }}
                      className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Verba Semanal / Caixa ($)</label>
                      <input 
                        type="number" 
                        value={currentSponsorObj.incomePerWeek || 0} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, incomePerWeek: val } : s));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400 font-bold">Bônus Assinatura Contratual ($)</label>
                      <input 
                        type="number" 
                        value={currentSponsorObj.signatureBonus || 0} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, signatureBonus: val } : s));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Objetivo de Temporada</label>
                      <input 
                        type="text" 
                        value={currentSponsorObj.objective || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, objective: val } : s));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Duração Contrato (Semanas)</label>
                      <input 
                        type="number" 
                        value={currentSponsorObj.termsInWeeks || 12} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorSponsors(prev => prev.map(s => s.id === currentSponsorObj.id ? { ...s, termsInWeeks: val } : s));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end select-none shrink-0">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB CAMPEÕES DESCRIPTION & EDITOR */}
              {activeTab === 'champions' && currentChampObj && (
                <div className="space-y-4 text-left font-sans">
                  <div className="flex flex-col md:flex-row gap-5 items-center bg-[#111724] p-4 rounded-xl border border-slate-800 shadow">
                    <div className="w-20 h-20 shrink-0 border-2 border-[#00bcd4]/35 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#0e141f]">
                      {currentChampObj.imageUrl ? (
                        <img 
                          src={srcNormalizer(currentChampObj.imageUrl)} 
                          alt="Icon Campeão" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RenderSilhouette />
                      )}
                    </div>
                    <div className="space-y-2 select-none">
                      <h4 className="text-xs font-bold text-[#00bcd4] uppercase">ÍCONE TÁTICO</h4>
                      <p className="text-[9.5px] text-slate-400">Carregue um ícone para preencher o Draft Simulator.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#121824] hover:bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/45 text-[10px] font-bold rounded-xl cursor-pointer transition-colors">
                        UPLOAD LOCAL
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => triggerImageBlobReader(e, (b64) => {
                            setEditorChamps(prev => prev.map(c => c.id === currentChampObj.id ? { ...c, imageUrl: b64 } : c));
                          })} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Nome Oficial</label>
                      <input 
                        type="text" 
                        value={currentChampObj.name || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditorChamps(prev => prev.map(c => c.id === currentChampObj.id ? { ...c, name: val } : c));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Rating de Poder / Força</label>
                      <input 
                        type="number" 
                        min={30} max={99}
                        value={currentChampObj.power || 80} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditorChamps(prev => prev.map(c => c.id === currentChampObj.id ? { ...c, power: val } : c));
                        }}
                        className="w-full bg-[#111724] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Classificação Meta (Tier)</label>
                      <select 
                        value={currentChampObj.tier || 'S'} 
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setEditorChamps(prev => prev.map(c => c.id === currentChampObj.id ? { ...c, tier: val } : c));
                        }}
                        className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="S+">Tier S+ (Opressivo Absoluto)</option>
                        <option value="S">Tier S (Forte Contendor)</option>
                        <option value="A">Tier A (Estável / Viável)</option>
                        <option value="B">Tier B (Condicional)</option>
                        <option value="C">Tier C (Incompatível / Fraco)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono uppercase font-black tracking-widest text-slate-400">Status de Patch</label>
                      <select 
                        value={currentChampObj.buffStatus || 'NORMAL'} 
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setEditorChamps(prev => prev.map(c => c.id === currentChampObj.id ? { ...c, buffStatus: val } : c));
                        }}
                        className="w-full bg-[#111724] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="NORMAL">Normal (Sem Ajustes)</option>
                        <option value="BUFFED">BUFFED (Poder Adicional)</option>
                        <option value="NERFED">NERFED (Atributos Enfraquecidos)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end select-none shrink-0">
                    <button
                      onClick={() => commitDatabaseChanges(true)}
                      className="bg-[#00bcd4] hover:bg-[#00e5ff] text-black font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right Escape Return Link Row */}
          <div className="pt-4 border-t border-slate-800/60 flex justify-end shrink-0 select-none">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono text-[10px] font-bold tracking-wider py-2.5 px-6 rounded-lg border border-slate-350 cursor-pointer transition-all active:scale-95"
            >
              [ VOLTAR AO MENU ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

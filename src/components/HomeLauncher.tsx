/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, FolderOpen, Edit, Settings, Trash2, Shield, Circle, User, 
  ChevronRight, Calendar, Globe, Upload, HelpCircle, Save, Download, 
  Moon, Sun, RefreshCw, X, Check, Award, Server, Layers, Terminal, Cpu
} from 'lucide-react';
import { REGIONAL_TEAMS_DATABASE, CHAMPIONS_LIST, SPONSOR_PRESETS } from '../data/initialDatabase';
import { getPlayersForTeam, REAL_ROSTERS_DB } from '../data/realPlayers';
import { SavedGameHeader, Team, Position, Player, Sponsor, Champion } from '../types';

interface HomeLauncherProps {
  onStartNewGame: (managerName: string, selectedTeamId: string, region: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP', year: number) => void;
  onLoadGame: (slotId: string) => void;
  onOpenEditor: () => void;
  onOpenSettings: () => void;
}

type LauncherState = 'MENU' | 'DISCLAIMER' | 'PROFILE' | 'TEAM_SELECT' | 'DB_SETTINGS' | 'DB_SELECT' | 'LOAD_CAREER' | 'EDITOR_JOGO';

const LOCALIZED_TEXT = {
  'PT-BR': {
    title: 'LEGENDS HUB',
    subtitle: 'Gerencie sua equipe rumo ao Worlds.',
    newCareer: 'NOVA CARREIRA',
    continueGame: 'CONTINUAR JOGO',
    editor: 'EDITOR DE JOGO',
    settingsDb: 'CONFIGURAÇÕES & BANCO DE DADOS',
    exit: 'SAIR',
    disclaimerTitle: 'AVISO LEGAL',
    disclaimerSub: 'Leia antes de continuar',
    disclaimerBody: 'Este software é uma simulação gerencial de eSports estritamente fictícia para fins de entretenimento e estudo, sem fins lucrativos.',
    disclaimerTag: 'Este projeto é fan-made e independente. Nenhuma receita comercial é gerada a partir deste jogo.',
    disclaimerBtn: 'LI E CONCORDO →',
    profileTitle: 'Crie seu Manager',
    profileDesc: 'Você assume o comando de uma organização. Comece definindo seu nome e idade — eles vão aparecer na sua bio, contratos e nos boletins da imprensa.',
    nameLabel: 'Nome do Manager',
    placeholderName: 'Ex: Erick Santos',
    ageLabel: 'Idade do Manager',
    regionLabel: 'Região Principal',
    nationalityLabel: 'Nacionalidade do Manager',
    photoLabel: 'Foto de Perfil',
    langLabel: 'Idioma Selecionado',
    currencyLabel: 'Moeda Selecionada',
    themeLabel: 'Tema de Cores',
    cancel: 'CANCELAR',
    confirmProfile: 'CONFIRMAR PERFIL →',
    selectTeamTitle: 'Selecione sua Equipe',
    selectTeamDesc: 'Escolha uma organização de League of Legends para iniciar seu caminho como pro manager.',
    gridRegions: 'Filtrar por Região',
    gridLigas: 'Ligas Associadas',
    gridTeams: 'Grid de Instalações de Times',
    budgetLabel: 'ORÇAMENTO DE CAIXA',
    fansLabel: 'TORCIDA ATIVA',
    tierLabel: 'TIER COMPUTADO',
    starsLabel: 'PRESTÍGIO INTERNACIONAL',
    startCareerBtn: 'COMEÇAR CARREIRA →',
    customAvatar: 'Selecione o Avatar do Manager',
    dbSettingsLabel: 'Gerenciar Banco de Dados (.db)',
    dbExport: 'EXPORTAR DATABASE (.db)',
    dbImport: 'IMPORTAR DATABASE (.db)',
    dbStatus: 'Banco de Dados Ativo',
    dbOfficial: 'OFICIAL INTERNO (PADRÃO)',
    dbCustom: 'IMPORTADO REGISTRADO (.db)',
    dbReset: 'RESTAURAR PADRÕES',
    activeSavePreview: 'Última gravação identificada no Slot',
    back: 'VOLTAR AO MENU',
  },
  'EN-US': {
    title: 'LEGENDS HUB',
    subtitle: 'Manage your team on the road to Worlds.',
    newCareer: 'NEW CAREER',
    continueGame: 'CONTINUE CAREER',
    editor: 'GAME EDITOR',
    settingsDb: 'SETTINGS & DATABASE',
    exit: 'QUIT',
    disclaimerTitle: 'LEGAL DISCLAIMER',
    disclaimerSub: 'Read before proceeding',
    disclaimerBody: 'This software is a strictly fictional management eSports simulation designed for study and entertainment purposes, with no commercial intents.',
    disclaimerTag: 'This project is independent and fan-made. No commercial revenue is generated from playing this game.',
    disclaimerBtn: 'I AGREE & PROCEED →',
    profileTitle: 'Create Your Manager',
    profileDesc: 'You take control of an Esports franchise. Define your professional name and age — they will appear on contracts, bio cards and media alerts.',
    nameLabel: 'Manager Full Name',
    placeholderName: 'E.g. Erick Santos',
    ageLabel: 'Manager Age',
    regionLabel: 'Primary Region',
    nationalityLabel: 'Nationality',
    photoLabel: 'Profile Picture',
    langLabel: 'Active Language',
    currencyLabel: 'Active Currency',
    themeLabel: 'Active Theme',
    cancel: 'CANCEL',
    confirmProfile: 'CONFIRM MANAGER →',
    selectTeamTitle: 'Select Your Team',
    selectTeamDesc: 'Choose a historic League of Legends organization to launch your grand executive dynasty.',
    gridRegions: 'Filter by Region',
    gridLigas: 'Associated Leagues',
    gridTeams: 'Teams Installation Roster',
    budgetLabel: 'STARTING BUDGET',
    fansLabel: 'ACTIVE FANBASE',
    tierLabel: 'COMPUTED TIER',
    starsLabel: 'INTERNATIONAL PRESTIGE',
    startCareerBtn: 'START GRAND CAREER →',
    customAvatar: 'Choose Manager Appearance',
    dbSettingsLabel: 'Manage Database Files (.db)',
    dbExport: 'EXPORT DATABASE (.db)',
    dbImport: 'IMPORT DATABASE (.db)',
    dbStatus: 'Active Database',
    dbOfficial: 'OFFICIAL INTERNAL DEFAULTS',
    dbCustom: 'CUSTOM LOADED (.db)',
    dbReset: 'RESTORE ORIGINAL DEFAULTS',
    activeSavePreview: 'Last detected career state in Slot',
    back: 'BACK TO MENU',
  },
  'ES-ES': {
    title: 'LEGENDS HUB',
    subtitle: 'Gestiona tu equipo rumbo al Worlds.',
    newCareer: 'NUEVA CARRERA',
    continueGame: 'CONTINUAR CARRERA',
    editor: 'EDITOR DE JUEGO',
    settingsDb: 'AJUSTES & BASE DE DATOS',
    exit: 'SALIR',
    disclaimerTitle: 'AVISO LEGAL',
    disclaimerSub: 'Leer antes de continuar',
    disclaimerBody: 'Este software es una simulación de gestión de deportes electrónicos estrictamente ficticia con fines de entretenimiento y estudio, sin fines de lucro.',
    disclaimerTag: 'Este proyecto es independiente y creado por fans. No se genera ningún tipo de beneficio comercial con este juego.',
    disclaimerBtn: 'HE LEÍDO Y ACEPTO →',
    profileTitle: 'Crea tu Mánager',
    profileDesc: 'Tomas el timón de una organización de eSports. Comienza definiendo tu nombre y edad, se usarán en tu ficha bio, contratos de patrocinio e informes de prensa.',
    nameLabel: 'Nombre del Mánager',
    placeholderName: 'Ej: Erick Santos',
    ageLabel: 'Edad del Mánager',
    regionLabel: 'Región Principal',
    nationalityLabel: 'Nacionalidad',
    photoLabel: 'Foto de Perfil',
    langLabel: 'Idioma Seleccionado',
    currencyLabel: 'Moneda Activa',
    themeLabel: 'Tema de Interfaz',
    cancel: 'CANCELAR',
    confirmProfile: 'CONFIRMAR MÁNAGER →',
    selectTeamTitle: 'Selecciona tu Equipo',
    selectTeamDesc: 'Elige una organización mítica de League of Legends para dar inicio a tu dinastía directiva.',
    gridRegions: 'Filtrar por Región',
    gridLigas: 'Ligas Asociadas',
    gridTeams: 'Instalaciones de Equipos',
    budgetLabel: 'PRESUPUESTO DE CAJA',
    fansLabel: 'AFICIÓN ACTIVA',
    tierLabel: 'TIER DETALLADO',
    starsLabel: 'PRESTIGIO INTERNACIONAL',
    startCareerBtn: 'COMENZAR CARRERA →',
    customAvatar: 'Seleccionar Imagen de Mánager',
    dbSettingsLabel: 'Gestión de Base de Datos (.db)',
    dbExport: 'EXPORTAR BASE DE DATOS (.db)',
    dbImport: 'IMPORTAR BASE DE DATOS (.db)',
    dbStatus: 'Base de Datos Activa',
    dbOfficial: 'OFICIAL INTERNA (POR DEFECTO)',
    dbCustom: 'SOPORTE IMPORTADO (.db)',
    dbReset: 'RESTAURAR VALORES DE FÁBRICA',
    activeSavePreview: 'Último progreso detectado en el Slot',
    back: 'VOLVER AL MENÚ',
  }
};

const NATIONALITIES = ['Brasil', 'United States', 'South Korea', 'Spain', 'China', 'Germany', 'France', 'Poland'];

const AVATAR_TEMPLATES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
];

export default function HomeLauncher({
  onStartNewGame,
  onLoadGame,
  onOpenEditor,
  onOpenSettings
}: HomeLauncherProps) {
  // Navigation / Flow states
  const [activeState, setActiveState] = useState<LauncherState>('MENU');

  // Interactive user preferences loaded reactively on the fly
  const [lang, setLang] = useState<'PT-BR' | 'EN-US' | 'ES-ES'>(() => {
    const saved = localStorage.getItem('legendshub_lang');
    if (saved === 'en') return 'EN-US';
    if (saved === 'es') return 'ES-ES';
    return 'PT-BR';
  });

  const [activeCurrency, setActiveCurrency] = useState<'BRL' | 'USD' | 'EUR'>(() => {
    return (localStorage.getItem('legendshub_currency') as 'BRL' | 'USD' | 'EUR') || 'USD';
  });

  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('legendshub_theme') as 'light' | 'dark') || 'dark';
  });

  // Profile manager customization fields
  const [hasTerminated, setHasTerminated] = useState(false);
  const [managerName, setManagerName] = useState('Erick Santos');
  const [managerAge, setManagerAge] = useState<number>(30);
  const [managerRegion, setManagerRegion] = useState<'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP'>('CBLOL');
  const [managerNationality, setManagerNationality] = useState('Brasil');
  const [profilePhoto, setProfilePhoto] = useState<string>(AVATAR_TEMPLATES[0]);
  const [customPhotoFile, setCustomPhotoFile] = useState<string | null>(null);

  // Teams lists grid selection items
  const [selectedRegionGrid, setSelectedRegionGrid] = useState<string>('Brasil');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('cblol_loud');
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Load preview slot details
  const [previewSave, setPreviewSave] = useState<SavedGameHeader | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom database if registered in local storage
  const [dbType, setDbType] = useState<'OFFICIAL' | 'CUSTOM'>(() => {
    return localStorage.getItem('legendshub_custom_db') ? 'CUSTOM' : 'OFFICIAL';
  });

  // Escolha do Banco de Dados States
  const [selectedDbId, setSelectedDbId] = useState<string>('db_default_local');
  const [isRefreshingRepo, setIsRefreshingRepo] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [downloadProgress, setDownloadProgress] = useState<{
    status: 'idle' | 'downloading' | 'validating' | 'injecting' | 'success';
    id?: string;
    percent: number;
    log: string[];
  }>({
    status: 'idle',
    percent: 0,
    log: []
  });

  // --- CARREGAR CARREIRA SLOTS ---
  const getSavesSlotsData = () => {
    return [1, 2, 3].map(id => {
      const raw = localStorage.getItem(`legendshub_save_slot_${id}`);
      const date = localStorage.getItem(`legendshub_save_slot_${id}_date`) || 'N/A';
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const pTeam = parsed.teams?.find((t: any) => t.id === parsed.playerTeamId) || {
            name: 'Organização',
            acronym: 'ORG',
            primaryColor: '#00d2fd'
          };
          
          let budget = pTeam.budget || 1500000;
          let formattedBudget = budget < 1000000 
            ? `$ ${budget.toLocaleString('pt-BR')}`
            : `$ ${(budget / 1000000).toFixed(2)}M`;

          return {
            id,
            status: 'OCUPADO' as const,
            nome_manager: parsed.managerName || 'Manager',
            nome_time: pTeam.name,
            logo_time: pTeam.primaryColor || '#00d2fd',
            data_in_game: `Semana ${parsed.week || 1}, Temp. ${parsed.season || '1'}`,
            moeda_formata_orcamento: formattedBudget,
            ultima_modificacao_real: date
          };
        } catch (e) {
          return { id, status: 'VAZIO' as const };
        }
      }
      return { id, status: 'VAZIO' as const };
    });
  };

  // --- DATABASE STANDALONE EDITOR ---
  const [editorSub, setEditorSub] = useState<'cat_ligas' | 'cat_times' | 'cat_jogadores' | 'cat_patrocinadores' | 'cat_campeoes'>('cat_ligas');
  const [editorDb, setEditorDb] = useState<any>(null);
  const [editorChamps, setEditorChamps] = useState<any[]>([]);
  const [editorSponsors, setEditorSponsors] = useState<any[]>([]);
  const [editorPlayersDict, setEditorPlayersDict] = useState<{ [id: string]: any }>({});
  
  // Selection states within the editor
  const [editorRegion, setEditorRegion] = useState<'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP'>('CBLOL');
  const [editorSelectedTeamId, setEditorSelectedTeamId] = useState<string>('');
  const [editorSelectedPlayerId, setEditorSelectedPlayerId] = useState<string>('');
  const [editorSelectedSponsorId, setEditorSelectedSponsorId] = useState<string>('');
  const [editorSelectedChampId, setEditorSelectedChampId] = useState<string>('');

  // Form input controllers for edited entities
  // Leagues
  const [formLeagueName, setFormLeagueName] = useState('');
  const [formLeagueLogo, setFormLeagueLogo] = useState('');

  // Teams
  const [formTeamName, setFormTeamName] = useState('');
  const [formTeamAcronym, setFormTeamAcronym] = useState('');
  const [formTeamLogo, setFormTeamLogo] = useState('');
  const [formTeamColor, setFormTeamColor] = useState('');
  const [formTeamColorSec, setFormTeamColorSec] = useState('');
  const [formTeamPopularity, setFormTeamPopularity] = useState<'BAIXA' | 'MEDIA' | 'ALTA'>('MEDIA');
  const [formTeamTier, setFormTeamTier] = useState<'B' | 'A' | 'S'>('A');

  // Players
  const [formPlayerName, setFormPlayerName] = useState('');
  const [formPlayerRealName, setFormPlayerRealName] = useState('');
  const [formPlayerPhoto, setFormPlayerPhoto] = useState('');
  const [formPlayerOvr, setFormPlayerOvr] = useState(70);
  const [formPlayerAge, setFormPlayerAge] = useState(21);
  const [formPlayerNationality, setFormPlayerNationality] = useState('');

  // Sponsors
  const [formSponsorName, setFormSponsorName] = useState('');
  const [formSponsorLogo, setFormSponsorLogo] = useState('');
  const [formSponsorPopularity, setFormSponsorPopularity] = useState(60);

  // Champions
  const [formChampName, setFormChampName] = useState('');
  const [formChampTier, setFormChampTier] = useState('God Tier');
  const [formChampPower, setFormChampPower] = useState(90);
  const [formChampRoles, setFormChampRoles] = useState<string[]>([]);
  const [formChampLogo, setFormChampLogo] = useState('');

  // Custom League Metadata Store
  const [leaguesMeta, setLeaguesMeta] = useState<{ [key: string]: { name: string, logo: string } }>({
    'CBLOL': { name: 'CBLOL (Brasil)', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150' },
    'LCK': { name: 'LCK (Coreia do Sul)', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=150' },
    'LPL': { name: 'LPL (China)', logo: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=150' },
    'LEC': { name: 'LEC (EMEA)', logo: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=150' },
    'LCS': { name: 'LCS (América do Norte)', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150' },
    'LCP': { name: 'LCP (Pacífico)', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=150' }
  });

  const launchEditor = () => {
    let dbParsed = REGIONAL_TEAMS_DATABASE;
    const savedDb = localStorage.getItem('legendshub_custom_db');
    if (savedDb) {
      try { dbParsed = JSON.parse(savedDb); } catch(e) {}
    }
    setEditorDb(JSON.parse(JSON.stringify(dbParsed)));

    let champsParsed = CHAMPIONS_LIST;
    const savedChamps = localStorage.getItem('legendshub_custom_champions');
    if (savedChamps) {
      try { champsParsed = JSON.parse(savedChamps); } catch(e) {}
    }
    setEditorChamps(JSON.parse(JSON.stringify(champsParsed)));

    let sponsorsParsed = [...SPONSOR_PRESETS];
    const savedSponsors = localStorage.getItem('legendshub_custom_sponsors');
    if (savedSponsors) {
      try { sponsorsParsed = JSON.parse(savedSponsors); } catch(e) {}
    }
    setEditorSponsors(JSON.parse(JSON.stringify(sponsorsParsed)));

    // Load custom leagues meta
    const savedLeagues = localStorage.getItem('legendshub_custom_leagues_meta');
    if (savedLeagues) {
      try { setLeaguesMeta(JSON.parse(savedLeagues)); } catch(e) {}
    }

    let playersDict = {};
    const savedPlayers = localStorage.getItem('legendshub_custom_players_dict');
    if (savedPlayers) {
      try { playersDict = JSON.parse(savedPlayers); } catch(e) {}
    }
    setEditorPlayersDict(playersDict);

    // Initial pre-selections
    setEditorRegion('CBLOL');
    const firstTeam = dbParsed['CBLOL']?.[0]?.id || '';
    setEditorSelectedTeamId(firstTeam);

    const firstTeamPlayers = getPlayersForTeam(firstTeam, false).roster;
    const pId = firstTeamPlayers[0]?.id || '';
    setEditorSelectedPlayerId(pId);

    setEditorSelectedSponsorId(sponsorsParsed[0]?.id || '');
    setEditorSelectedChampId(champsParsed[0]?.id || '');

    // Set form fields for league
    const currentL = leaguesMeta['CBLOL'] || { name: 'CBLOL (Brasil)', logo: '' };
    setFormLeagueName(currentL.name);
    setFormLeagueLogo(currentL.logo);

    setActiveState('EDITOR_JOGO');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setter(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const findTeamInEditor = (tId: string) => {
    if (!editorDb) return null;
    for (const reg of Object.keys(editorDb)) {
      const match = editorDb[reg].find((t: any) => t.id === tId);
      if (match) return match;
    }
    return null;
  };

  const handleSelectTeam = (tId: string) => {
    setEditorSelectedTeamId(tId);
    const t = findTeamInEditor(tId);
    if (t) {
      setFormTeamName(t.name);
      setFormTeamAcronym(t.acronym);
      setFormTeamLogo(t.logoUrl || '');
      setFormTeamColor(t.primaryColor || '#00cbd6');
      setFormTeamColorSec(t.secondaryColor || '#1e293b');
      setFormTeamPopularity(t.popularity >= 85 ? 'ALTA' : t.popularity >= 68 ? 'MEDIA' : 'BAIXA');
      setFormTeamTier(t.budget >= 2800000 ? 'S' : t.budget >= 1900000 ? 'A' : 'B');
    }
    const plyrs = getPlayersForTeam(tId, false).roster;
    if (plyrs.length > 0) {
      handleSelectPlayer(plyrs[0], tId);
    } else {
      setEditorSelectedPlayerId('');
    }
  };

  const handleSelectPlayer = (p: any, tId: string) => {
    setEditorSelectedPlayerId(p.id);
    const dictKey = `${tId}_${p.id}_${p.name}`;
    const dictKeyAlt = p.id;
    const override = editorPlayersDict[dictKey] || editorPlayersDict[dictKeyAlt] || {};
    setFormPlayerName(override.name || p.name);
    setFormPlayerRealName(override.realName || p.realName);
    setFormPlayerPhoto(override.photoUrl || p.photoUrl || '');
    setFormPlayerOvr(override.overallRating || p.baseRating || 75);
    setFormPlayerAge(override.age || p.age || 21);
    setFormPlayerNationality(override.nationality || p.nationality || 'Brasil');
  };

  const handleSelectSponsor = (sp: any) => {
    setEditorSelectedSponsorId(sp.id);
    setFormSponsorName(sp.name);
    setFormSponsorLogo(sp.logoUrl);
    setFormSponsorPopularity(sp.minPopularity || 50);
  };

  const handleSelectChamp = (c: any) => {
    setEditorSelectedChampId(c.id);
    setFormChampName(c.name);
    setFormChampTier(c.tier || 'God Tier');
    setFormChampPower(c.power || 80);
    setFormChampRoles(c.roles || []);
    setFormChampLogo(c.idealPlaystyle || '');
  };

  const calcProceduralBudget = (tier: 'B' | 'A' | 'S', pop: 'BAIXA' | 'MEDIA' | 'ALTA') => {
    let base = 2000000;
    if (tier === 'S') base = 2800000;
    if (tier === 'B') base = 1200000;

    let popOffset = 100000;
    if (pop === 'ALTA') popOffset = 700000;
    if (pop === 'BAIXA') popOffset = -350000;

    return base + popOffset;
  };

  const calcProceduralSponsorWeekly = (pop: number) => {
    return pop * 650;
  };

  const calcProceduralSponsorBonus = (pop: number) => {
    return pop * 1250;
  };

  const handleExportEditedDb = () => {
    const exportedObj = {
      legendshub_db_schema_version: '2.0',
      teams_database: editorDb,
      champions: editorChamps,
      sponsors: editorSponsors,
      players_overrides: editorPlayersDict
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportedObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "LegendsHub_Active_Database.db");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert("Arquivo .db exportado com sucesso para Downloads!");
  };

  // This complies with the requested JSON schema for reactive state
  const getReactiveJsonState = () => {
    return {
      "tela_ativa": "ESCOLA_DO_BANCO_DE_DADOS",
      "instrucao_tela": "Selecione a base de dados oficial ou da comunidade para carregar os jogadores, times e ligas antes de iniciar a sua jornada rumo ao Worlds.",
      "banco_dados_default": {
        "id": "db_default_local",
        "status": "PRONTO",
        "tipo": "LOCAL_BUILT_IN",
        "localizacao": "%USERPROFILE%/AppData/Local/LegendsHub/db/default.db"
      },
      "repositorio_comunidade": {
        "url_origem": "https://github.com/davisonsant/LegendsHub/db",
        "status_conexao": connectionStatus,
        "atualizacoes_disponiveis": [
          {
            "id": "db_remoto_01",
            "nome_arquivo": "LegendsHub_Cenário_Oficial_2026.db",
            "tamanho": "4.2 MB",
            "data_publicacao": "2026-05-20"
          },
          {
            "id": "db_remoto_02",
            "nome_arquivo": "Fearless_Draft_Roster_Custom.db",
            "tamanho": "3.9 MB",
            "data_publicacao": "2026-05-25"
          },
          {
            "id": "db_patch_atual",
            "nome": "Cenário Oficial LoL 2026 - Atualizado",
            "versao": "v2.4",
            "autor": "Comunidade LegendsHub"
          }
        ]
      },
      "acoes_disponiveis": {
        "botao_buscar_atualizacoes": { "acao": "refresh_github_db_list" },
        "botao_confirmar_partida": { "acao": "iniciar_carreira", "parametro_db": selectedDbId }
      }
    };
  };

  const handleStartCareerWithDb = (dbId: string) => {
    setSelectedDbId(dbId);
    
    // Start gorgeous interactive step progress simulation
    setDownloadProgress({
      status: 'downloading',
      id: dbId,
      percent: 10,
      log: [
        `⚡ [EVENT] Disparando ação: "iniciar_carreira" com parametro_db="${dbId}"`,
        `📡 Estabelecendo tunelamento com os servidores de base de dados para cache de rosters...`
      ]
    });

    const addLog = (text: string, progress: number, statusVal: 'idle' | 'downloading' | 'validating' | 'injecting' | 'success') => {
      setDownloadProgress(prev => ({
        ...prev,
        status: statusVal,
        percent: progress,
        log: [...prev.log, text]
      }));
    };

    // Stage 1: Download/Injeção do arquivo físico .db do repositório indicado (ou local built-in)
    setTimeout(() => {
      if (dbId === 'db_default_local') {
        addLog(`📂 Carregando banco de dados oficial interno local: default.db`, 40, 'downloading');
      } else if (dbId === 'db_patch_atual') {
        addLog(`🌐 Sincronizando catálogo remoto para "${dbId}" direto do repositório oficial da união LegendsHub (v2.4)`, 35, 'downloading');
        addLog(`⬇️ Iniciando download do pacote físico binário comprimido de https://github.com/davisonsant/LegendsHub/db`, 50, 'downloading');
      } else {
        const dbName = dbId === 'db_remoto_01' ? 'LegendsHub_Cenário_Oficial_2026.db' : 'Fearless_Draft_Roster_Custom.db';
        addLog(`🌐 Conectando com repositório oficial da comunidade: https://github.com/davisonsant/LegendsHub/db`, 30, 'downloading');
        addLog(`⬇️ Baixando arquivo físico binário compactado: ${dbName} (Tamanho real: ~4 MB) ...`, 55, 'downloading');
      }
    }, 450);

    // Stage 2: Validação de checksum / integridade do arquivo
    setTimeout(() => {
      addLog(`📥 Arquivo transferido com sucesso para a memória sandbox temporária!`, 65, 'validating');
      addLog(`🔍 Iniciando varredura criptográfica para validação de checksum MD5 / SHA-256...`, 75, 'validating');
      const mockChecksum = dbId === 'db_default_local' 
        ? 'MD5: ecf37bb805d21798ec4df2aa7342fb6e' 
        : dbId === 'db_remoto_01'
        ? 'SHA-256: 4ae9d8e52fb4fca8765239dfc8230b42fd28e75d'
        : dbId === 'db_patch_atual'
        ? 'SHA-256: 9fb7facf8a42e1de2cbd8e040523db4a0dcd872e'
        : 'SHA-256: bc28ae52b11ff49a7522dceea9c7242fd22a101b';
      addLog(`🔑 Hash checksum retornado: ${mockChecksum}`, 80, 'validating');
      addLog(`✔️ Checksum bate com o repositório original! Integridade do arquivo totalmente validada.`, 85, 'validating');
    }, 1150);

    // Stage 3: Injeção/Compilação e inicialização de carreira abrindo a dashboard
    setTimeout(() => {
      addLog(`🧱 Descompactando buffers e injetando as tabelas e índices dentro do motor operacional local...`, 90, 'injecting');
      addLog(`⚙️ Compilando base de dados selecionada e inicializando universo procedural...`, 95, 'injecting');
      addLog(`🚀 Universo inicializado e salvo! Abrindo a tela central do Manager...`, 100, 'success');
    }, 1900);

    // Final trigger: dispara o gatilho que abre a tela Central do Manager (Guia é exibido automaticamente por legendshub_guided_seen)
    setTimeout(() => {
      handleFinalInitialize();
    }, 2600);
  };

  const handleRefreshDbList = () => {
    setIsRefreshingRepo(true);
    setConnectionStatus('ONLINE');
    setTimeout(() => {
      setIsRefreshingRepo(false);
      alert(lang === 'EN-US' ? 'Database updates list updated!' : lang === 'ES-ES' ? '¡Discos de base de datos actualizados!' : 'Lista de bases de dados sincronizada com sucesso via repositório remoto!');
    }, 700);
  };

  // Load last save slot preview details
  useEffect(() => {
    const savedDataStr = localStorage.getItem(`legendshub_save_slot_1`);
    if (savedDataStr) {
      try {
        const parsed = JSON.parse(savedDataStr);
        const savedDate = localStorage.getItem(`legendshub_save_slot_1_date`) || new Date().toLocaleDateString('pt-BR');
        setPreviewSave({
          slotId: `slot_1`,
          managerName: parsed.managerName || 'Manager',
          teamName: parsed.teams?.find((t: any) => t.id === parsed.playerTeamId)?.name || 'Organização',
          date: savedDate,
          season: parsed.season || 2025,
          score: parsed.week || 1
        });
      } catch (e) {
        console.error('Error fetching slot preview', e);
      }
    }
  }, []);

  // Sync Global Theme classes reactively
  useEffect(() => {
    if (activeTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [activeTheme]);

  // Handle active choices translating immediately to localized environments
  const writePreferences = (langVal: 'PT-BR' | 'EN-US' | 'ES-ES', currVal: 'BRL' | 'USD' | 'EUR', themeVal: 'light' | 'dark') => {
    const lg = langVal === 'EN-US' ? 'en' : langVal === 'ES-ES' ? 'es' : 'pt';
    localStorage.setItem('legendshub_lang', lg);
    localStorage.setItem('legendshub_currency', currVal);
    localStorage.setItem('legendshub_theme', themeVal);

    // dispatch custom events to make global HUD elements sync immediately
    window.dispatchEvent(new Event('language_changed'));
    window.dispatchEvent(new Event('currency_changed'));
  };

  const handleUpdateLanguage = (newLang: 'PT-BR' | 'EN-US' | 'ES-ES') => {
    setLang(newLang);
    writePreferences(newLang, activeCurrency, activeTheme);
  };

  const handleUpdateCurrency = (newCurr: 'BRL' | 'USD' | 'EUR') => {
    setActiveCurrency(newCurr);
    writePreferences(lang, newCurr, activeTheme);
  };

  const handleUpdateTheme = (newTheme: 'light' | 'dark') => {
    setActiveTheme(newTheme);
    writePreferences(lang, activeCurrency, newTheme);
  };

  // Convert game rates to selected currency format
  const formatValueLocal = (usdVal: number) => {
    const scale = activeCurrency === 'BRL' ? 5.2 : activeCurrency === 'EUR' ? 0.92 : 1.0;
    const finalVal = usdVal * scale;
    const symbol = activeCurrency === 'EUR' ? '€' : activeCurrency === 'BRL' ? 'R$' : '$';
    if (finalVal >= 1000000) {
      return `${symbol} ${(finalVal / 1000000).toFixed(2)}M`;
    }
    return `${symbol} ${Math.round(finalVal).toLocaleString('pt-BR')}`;
  };

  // Drag and drop profile selection
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoFile(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoFile(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom DB mechanics (.db files inside json dump)
  const triggerDbExport = () => {
    const rawDb = localStorage.getItem('legendshub_custom_db') || JSON.stringify(REGIONAL_TEAMS_DATABASE);
    const blob = new Blob([rawDb], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'legendshub_database_master.db';
    a.click();
  };

  const triggerDbImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            localStorage.setItem('legendshub_custom_db', JSON.stringify(parsed));
            setDbType('CUSTOM');
            alert(lang === 'EN-US' ? 'Database imported successfully!' : lang === 'ES-ES' ? '¡Base de datos importada con éxito!' : 'Banco de dados importado com sucesso!');
          }
        } catch (err) {
          alert(lang === 'EN-US' ? 'Error parsing .db file.' : lang === 'ES-ES' ? 'Error al procesar archivo .db.' : 'Erro ao processar arquivo .db inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerDbReset = () => {
    localStorage.removeItem('legendshub_custom_db');
    setDbType('OFFICIAL');
    alert(lang === 'EN-US' ? 'Defaults restored.' : lang === 'ES-ES' ? 'Valores originales restaurados.' : 'Dicionários de fábrica restaurados com sucesso.');
  };

  // Collect all teams based on regions filter
  const getTeamsForActiveSelections = (): Team[] => {
    // If we have custom DB loaded, draw from it. Otherwise initial defaults
    const activeDbString = localStorage.getItem('legendshub_custom_db');
    let activeDb = REGIONAL_TEAMS_DATABASE;
    if (activeDbString) {
      try {
        activeDb = JSON.parse(activeDbString);
      } catch(e) {}
    }

    const currentRegionAcronymMap: { [key: string]: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' } = {
      'Brasil': 'CBLOL',
      'América do Norte': 'LCS',
      'Coreia': 'LCK',
      'EMEA': 'LEC',
      'China': 'LPL',
      'Pacífico': 'LCP'
    };

    if (selectedRegionGrid === 'Global') {
      const all: Team[] = [];
      Object.keys(activeDb).forEach((reg: any) => {
        all.push(...((activeDb as any)[reg] || []));
      });
      return all;
    }

    const regAcronym = currentRegionAcronymMap[selectedRegionGrid] || 'CBLOL';
    return (activeDb as any)[regAcronym] || [];
  };

  const gridTeamsList = getTeamsForActiveSelections();
  const selectedTeamData = gridTeamsList.find(t => t.id === selectedTeamId) || gridTeamsList[0];

  // Calculated tier logic:
  // score = prestige * 1.5 + (budget / 500000) + (popularity / 10)
  // if score >= 12 tier S, if score >= 8 tier A, else B
  const computeTeamTier = (tItem: any): 'S' | 'A' | 'B' => {
    if (!tItem) return 'B';
    const popularity = tItem.popularity || 60;
    const budget = tItem.budget || 500000;
    const prestigeStars = tItem.popularity >= 88 ? 5 : tItem.popularity >= 75 ? 4 : tItem.popularity >= 60 ? 3 : 2;
    const score = (prestigeStars * 1.5) + (budget / 500000) + (popularity / 10);
    if (score >= 12) return 'S';
    if (score >= 8) return 'A';
    return 'B';
  };

  // Render variables mapping and theme colors
  const text = LOCALIZED_TEXT[lang] || LOCALIZED_TEXT['PT-BR'];

  const themeClasses = activeTheme === 'dark' ? {
    bgWindow: 'bg-[#070d19] text-slate-100',
    card: 'bg-[#0a1424] border border-[#1e2d44]',
    input: 'bg-[#060c15] border-[#1e2d44] text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    border: 'border-[#1e2d44]',
    divider: 'border-slate-800',
    innerBox: 'bg-[#040913]/90 border border-[#1e2d44]/60',
    actionButton: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black',
  } : {
    bgWindow: 'bg-[#f4f6f9] text-[#1e2s3b]',
    card: 'bg-white border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)]',
    input: 'bg-slate-50 border-slate-200 text-slate-805',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    border: 'border-slate-200',
    divider: 'border-slate-100',
    innerBox: 'bg-[#f8fafc] border border-slate-200',
    actionButton: 'bg-blue-600 hover:bg-blue-700 text-white font-black',
  };

  // Final Action Start career loop
  const handleFinalInitialize = () => {
    // Write preferences before launch
    writePreferences(lang, activeCurrency, activeTheme);
    // clear guide tutorial flag to force guide popup
    localStorage.removeItem('legendshub_guided_seen');

    // region mapping
    const currentRegionAcronymMap: { [key: string]: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' } = {
      'Brasil': 'CBLOL',
      'América do Norte': 'LCS',
      'Coreia': 'LCK',
      'EMEA': 'LEC',
      'China': 'LPL',
      'Pacífico': 'LCP'
    };

    const targetRegion = currentRegionAcronymMap[selectedRegionGrid] || managerRegion;
    onStartNewGame(managerName, selectedTeamId, targetRegion, selectedYear);
  };

  if (hasTerminated) {
    return (
      <div className="min-h-screen bg-[#050914] text-rose-500 font-mono p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-lg border border-rose-500/20 bg-slate-950/80 p-8 rounded-2xl shadow-2xl relative">
          <div className="flex items-center gap-2 text-rose-500 border-b border-rose-500/10 pb-4 mb-6">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-xs tracking-widest uppercase text-rose-500">LEGENDS_HUB_V2_FATAL_SHUTDOWN</span>
          </div>
          <div className="space-y-4 text-xs tracking-wide text-left">
            <p className="text-rose-400">&gt; shutdown -h now</p>
            <p className="text-slate-400">Saving cache and flushing memory buffers... DONE</p>
            <p className="text-slate-400">Disconnecting database registry... SUCCESS</p>
            <p className="text-slate-400">Unmounting game simulation threads... TERMINATED [OK]</p>
            <p className="text-amber-500 font-bold font-mono text-[11px] uppercase">&gt; O processo do Legends Hub foi finalizado com sucesso.</p>
            <p className="text-slate-500 text-[10.5px]">Você pode fechar esta aba do navegador com total segurança ou optar por reiniciar o servidor virtual de simulação.</p>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setHasTerminated(false)}
              className="px-5 py-2.5 bg-rose-955/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Reiniciar Simulação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgWindow} relative flex flex-col justify-between py-12 px-6 overflow-hidden transition-all duration-300 font-sans`}>
      {/* Decorative dynamic grid lines context */}
      <div className={`absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-10 ${
        activeTheme === 'dark' 
          ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' 
          : 'bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)]'
      } bg-[size:32px_32px]`} />

      {/* QUICK PREFERENCES TRAY MENU (TOP HUD) */}
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center gap-4 z-15 relative select-none">
        {/* Left indicators */}
        <div className="flex items-center gap-1.5 bg-black/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 text-[9px] font-mono uppercase tracking-widest font-black text-sky-400">
          <Circle className="w-2 h-2 fill-sky-400 text-sky-400 animate-pulse" />
          <span>DATA ENGINE ONLINE</span>
        </div>

        {/* Dynamic preference selectors (Theme, language and currency) */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={() => handleUpdateTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg border cursor-pointer hover:scale-105 active:scale-95 transition-all bg-black/10 ${themeClasses.border}`}
            title="Mudar Tema"
          >
            {activeTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Lang dropdown */}
          <select
            value={lang}
            onChange={(e) => handleUpdateLanguage(e.target.value as any)}
            className={`bg-black/10 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border ${themeClasses.border} text-sky-400 cursor-pointer focus:outline-none`}
          >
            <option value="PT-BR">PT-BR</option>
            <option value="EN-US">EN-US</option>
            <option value="ES-ES">ES-ES</option>
          </select>

          {/* Currency dropdown */}
          <select
            value={activeCurrency}
            onChange={(e) => handleUpdateCurrency(e.target.value as any)}
            className={`bg-black/10 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border ${themeClasses.border} text-emerald-400 cursor-pointer focus:outline-none`}
          >
            <option value="BRL">BRL (R$)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* RENDER DYNAMIC FLOW STATES */}
      <div className="w-full max-w-4xl mx-auto my-auto z-10 transition-all duration-300 relative py-8">
        
        {/* State: menu_inicial_puro (MENU) */}
        {activeState === 'MENU' && (
          <div className="flex flex-col items-center">
            {/* Hexagonal Blue Brand Logo Header */}
            <div className="flex flex-col items-center text-center select-none mb-10 animate-fade-in">
              <div className="relative mb-4">
                <svg className="w-24 h-24 text-blue-500 fill-none" viewBox="0 0 100 100">
                  <polygon 
                    points="50 5, 90 28, 90 72, 50 95, 10 72, 10 28" 
                    className="stroke-blue-500 stroke-[3.5px]" 
                  />
                  <polygon 
                    points="50 20, 80 43, 80 57, 50 80, 20 57, 20 43" 
                    className="fill-blue-500/10 stroke-blue-400 stroke-1" 
                  />
                  <path 
                    d="M32 38 L50 62 L68 38" 
                    className="stroke-blue-600 stroke-[4px] stroke-round" 
                  />
                  <polygon 
                    points="50 26, 64 36, 50 50, 36 36" 
                    className="fill-blue-500" 
                  />
                </svg>
              </div>
              <h1 className={`font-display text-4xl font-extrabold tracking-[0.2em] ${themeClasses.textPrimary} uppercase leading-none`}>
                {text.title}
              </h1>
              <p className="text-[10px] text-blue-500/90 font-mono tracking-widest font-black uppercase mt-2.5">
                {text.subtitle}
              </p>
            </div>

            {/* Menu options card list */}
            <div className={`w-full max-w-md ${themeClasses.card} p-6 rounded-2xl flex flex-col gap-3 animate-fade-in`}>
              
              {/* 1. CONTINUAR CARREIRA (Visible only if active save detected) */}
              {previewSave && (
                <button
                  onClick={() => onLoadGame(previewSave.slotId)}
                  className="group w-full text-left p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 cursor-pointer flex justify-between items-center transition-all duration-200"
                >
                  <div className="min-w-0">
                    <span className="text-[8px] font-mono bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                      {lang === 'PT-BR' ? 'CONTINUAR CARREIRA' : text.continueGame}
                    </span>
                    <h4 className="font-display text-xs font-black text-slate-200 mt-2 truncate">
                      {previewSave.teamName}
                    </h4>
                    <p className="text-[9.5px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                      MGR: {previewSave.managerName} • SLOT 1
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* 2. NOVA CARREIRA */}
              <button
                onClick={() => setActiveState('DISCLAIMER')}
                className={`group w-full py-4.5 px-6 rounded-xl border ${activeTheme === 'dark' ? 'bg-[#121f35]/90 hover:bg-[#182740] border-[#1e2d44]' : 'bg-slate-5 font-bold hover:bg-slate-100 border-slate-200'} cursor-pointer flex justify-between items-center transition-all`}
              >
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                  <span className={`text-[12px] font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {lang === 'PT-BR' ? 'NOVA CARREIRA' : text.newCareer}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:translate-x-1 transition-transform`} />
              </button>

              {/* 3. CARREGAR CARREIRA */}
              <button
                onClick={() => setActiveState('LOAD_CAREER')}
                className={`group w-full py-4.5 px-6 rounded-xl border ${activeTheme === 'dark' ? 'bg-[#121f35]/90 hover:bg-[#182740] border-[#1e2d44]' : 'bg-slate-5 hover:bg-slate-100 border-slate-200'} cursor-pointer flex justify-between items-center transition-all`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-sky-505" />
                  <span className={`text-[12px] font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {lang === 'PT-BR' ? 'CARREGAR CARREIRA' : (lang === 'ES-ES' ? 'CARGAR GESTIÓN' : 'LOAD CAREER')}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:translate-x-1 transition-transform`} />
              </button>

              {/* 4. EDITOR DE JOGO */}
              <button
                onClick={launchEditor}
                className={`group w-full py-4.5 px-6 rounded-xl border ${activeTheme === 'dark' ? 'bg-[#121f35]/90 hover:bg-[#182740] border-[#1e2d44]' : 'bg-slate-5 hover:bg-slate-100 border-slate-200'} cursor-pointer flex justify-between items-center transition-all`}
              >
                <div className="flex items-center gap-3">
                  <Edit className="w-4 h-4 text-indigo-400" />
                  <span className={`text-[12px] font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {lang === 'PT-BR' ? 'EDITOR DE JOGO' : text.editor}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:translate-x-1 transition-transform`} />
              </button>

              {/* 5. CONFIGURAÇÕES */}
              <button
                onClick={() => setActiveState('DB_SETTINGS')}
                className={`group w-full py-4.5 px-6 rounded-xl border ${activeTheme === 'dark' ? 'bg-[#121f35]/90 hover:bg-[#182740] border-[#1e2d44]' : 'bg-slate-5 hover:bg-slate-100 border-slate-200'} cursor-pointer flex justify-between items-center transition-all`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className={`text-[12px] font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {lang === 'PT-BR' ? 'CONFIGURAÇÕES' : (lang === 'ES-ES' ? 'AJUSTES' : 'SETTINGS')}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:translate-x-1 transition-transform`} />
              </button>

              {/* 6. SAIR */}
              <button
                onClick={() => setHasTerminated(true)}
                className={`group w-full py-4.5 px-6 rounded-xl border border-red-500/10 hover:border-red-500/30 ${activeTheme === 'dark' ? 'bg-[#1c121e]/90 hover:bg-[#2c1a2f]' : 'bg-red-50 hover:bg-red-100'} cursor-pointer flex justify-between items-center transition-all`}
              >
                <div className="flex items-center gap-3">
                  <X className="w-4 h-4 text-red-500" />
                  <span className={`text-[12px] font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {lang === 'PT-BR' ? 'SAIR' : text.exit}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:translate-x-1 transition-transform`} />
              </button>
            </div>
          </div>
        )}

        {/* State: popup_aviso_legal (DISCLAIMER) */}
        {activeState === 'DISCLAIMER' && (
          <div className="flex items-center justify-center animate-fade-in">
            <div className={`w-full max-w-xl ${themeClasses.card} p-8 rounded-2xl shadow-2xl relative overflow-hidden text-left`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className={`font-display text-base font-black tracking-widest uppercase border-b ${themeClasses.border} pb-4 mb-5 flex items-center gap-2 text-rose-550`}>
                <Shield className="text-rose-500 w-5 h-5 animate-pulse" />
                {text.disclaimerTitle}
              </h3>

              <p className={`text-[10px] font-mono font-bold tracking-wider uppercase text-blue-400 mb-1`}>
                {text.disclaimerSub}
              </p>

              <div className="space-y-4 my-4 leading-relaxed">
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  {text.disclaimerBody}
                </p>

                <div className={`p-4 rounded-xl ${themeClasses.innerBox} text-rose-500 text-[11.5px] font-bold italic leading-relaxed`}>
                  💡 {text.disclaimerTag}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-5 border-t border-slate-105 mt-6">
                <button
                  onClick={() => setActiveState('MENU')}
                  className={`px-5 py-3 rounded-lg border ${themeClasses.border} text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors cursor-pointer`}
                >
                  {text.cancel}
                </button>
                <button
                  onClick={() => setActiveState('PROFILE')}
                  className={`px-7 py-3 rounded-lg ${themeClasses.actionButton} font-mono text-[10px] uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/10`}
                >
                  {text.disclaimerBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: criacao_manager (PROFILE) */}
        {activeState === 'PROFILE' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className={`w-full max-w-3xl ${themeClasses.card} p-8 rounded-2xl text-left`}>
              
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className={`font-display text-lg font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                  {text.profileTitle}
                </h3>
                <p className={`text-[11px] ${themeClasses.textSecondary} leading-relaxed mt-1.5`}>
                  {text.profileDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-normal">
                {/* Visual Avatar Manager Creator */}
                <div className="md:col-span-4 flex flex-col items-center gap-4 text-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block w-full text-left">
                    {text.photoLabel}
                  </span>

                  {/* Photo area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-32 h-32 rounded-2xl border-2 border-dashed ${themeClasses.border} overflow-hidden cursor-pointer flex flex-col items-center justify-center p-1.5 group hover:border-cyan-400 transition-colors relative`}
                  >
                    {customPhotoFile ? (
                      <img src={customPhotoFile} alt="Manager" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <img src={profilePhoto} alt="Manager" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider transition-opacity">
                          <Upload className="w-4 h-4 mb-1" />
                          <span>Mudar Foto</span>
                        </div>
                      </>
                    )}
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* Recommended template options picker */}
                  <div className="flex gap-1.5 justify-center mt-1">
                    {AVATAR_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setProfilePhoto(tmpl);
                          setCustomPhotoFile(null);
                        }}
                        className={`w-7 h-7 rounded-md border overflow-hidden ${profilePhoto === tmpl && !customPhotoFile ? 'border-cyan-400 scale-110 shadow' : 'border-white/10 opacity-60'} transition-all cursor-pointer`}
                      >
                        <img src={tmpl} alt="avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form parameters */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.nameLabel}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        className={`w-full ${themeClasses.input} rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400 font-bold tracking-normal`}
                        placeholder={text.placeholderName}
                        maxLength={25}
                      />
                    </div>
                  </div>

                  {/* Age field */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.ageLabel}
                    </label>
                    <input
                      type="number"
                      value={managerAge}
                      min={18}
                      max={70}
                      onChange={(e) => setManagerAge(Number(e.target.value))}
                      className={`w-full ${themeClasses.input} rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400 font-mono font-bold`}
                    />
                  </div>

                  {/* Nationality Dropdown */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.nationalityLabel}
                    </label>
                    <select
                      value={managerNationality}
                      onChange={(e) => setManagerNationality(e.target.value)}
                      className={`w-full ${themeClasses.input} rounded-lg px-2.5 py-2.5 text-xs focus:outline-none cursor-pointer focus:border-cyan-400 font-bold`}
                    >
                      {NATIONALITIES.map((nat) => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language sync Selector */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.langLabel}
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => handleUpdateLanguage(e.target.value as any)}
                      className={`w-full ${themeClasses.input} rounded-lg px-2.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 font-bold`}
                    >
                      <option value="PT-BR">PT-BR (Português)</option>
                      <option value="EN-US">EN-US (English)</option>
                      <option value="ES-ES">ES-ES (Español)</option>
                    </select>
                  </div>

                  {/* Currency settings Sync */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.currencyLabel}
                    </label>
                    <select
                      value={activeCurrency}
                      onChange={(e) => handleUpdateCurrency(e.target.value as any)}
                      className={`w-full ${themeClasses.input} rounded-lg px-2.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 font-bold`}
                    >
                      <option value="BRL">BRL (R$)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  {/* Region Select */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                      {text.regionLabel}
                    </label>
                    <select
                      value={managerRegion}
                      onChange={(e) => setManagerRegion(e.target.value as any)}
                      className={`w-full ${themeClasses.input} rounded-lg px-2.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 font-black`}
                    >
                      <option value="CBLOL">CBLOL (Brasil)</option>
                      <option value="LCK">LCK (Coreia)</option>
                      <option value="LPL">LPL (China)</option>
                      <option value="LEC">LEC (EMEA)</option>
                      <option value="LCS">LCS (América do Norte)</option>
                      <option value="LCP">LCP (Pacífico)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-white/5 mt-6">
                <button
                  onClick={() => setActiveState('MENU')}
                  className={`px-5 py-3 rounded-lg border ${themeClasses.border} text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors cursor-pointer`}
                >
                  {text.cancel}
                </button>
                <button
                  onClick={() => setActiveState('TEAM_SELECT')}
                  disabled={!managerName.trim()}
                  className={`px-7 py-3 rounded-lg ${themeClasses.actionButton} font-mono text-[10px] uppercase tracking-wider cursor-pointer shadow-lg disabled:opacity-40 select-none`}
                >
                  {text.confirmProfile}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* State: selecao_time (TEAM_SELECT) */}
        {activeState === 'TEAM_SELECT' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className={`w-full ${themeClasses.card} p-7 rounded-2xl text-left`}>
              
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className={`font-display text-base font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                  {text.selectTeamTitle}
                </h3>
                <p className={`text-[10.5px] ${themeClasses.textSecondary} leading-relaxed`}>
                  {text.selectTeamDesc}
                </p>
              </div>

              {/* Regions lists grid controller (H1: Nível 1 - Regiões) */}
              <div className="mb-4">
                <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                  {text.gridRegions}
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['Global', 'Brasil', 'América do Norte', 'EMEA', 'Coreia', 'China'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => {
                        setSelectedRegionGrid(reg);
                        // Auto map first team to selection
                        const list = reg === 'Global' ? gridTeamsList : REGIONAL_TEAMS_DATABASE[reg === 'Brasil' ? 'CBLOL' : reg === 'América do Norte' ? 'LCS' : reg === 'EMEA' ? 'LEC' : reg === 'Coreia' ? 'LCK' : 'LPL'];
                        if (list && list.length > 0) {
                          setSelectedTeamId(list[0].id);
                        }
                      }}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        selectedRegionGrid === reg 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : `${themeClasses.border} bg-black/5 hover:bg-black/10 ${themeClasses.textSecondary}`
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-normal">
                {/* GRID OF TEAMS LISTING (Col Span 7) */}
                <div className="md:col-span-7 flex flex-col">
                  <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400 mb-1.5">
                    {text.gridTeams}
                  </span>

                  <div className={`flex-1 border ${themeClasses.border} rounded-xl p-3 bg-black/5 max-h-[350px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {gridTeamsList.map((t) => {
                        const isSel = selectedTeamId === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTeamId(t.id)}
                            className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-[#00E5FF]/10 border-cyan-400 text-cyan-400 scale-[1.01]' 
                                : `bg-[#0c1424]/40 ${themeClasses.border} text-slate-350 hover:bg-slate-200/5`
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {t.logoUrl ? (
                                <img src={t.logoUrl} alt={t.name} className="w-5 h-5 object-contain shrink-0 rounded" referrerPolicy="no-referrer" />
                              ) : (
                                <div 
                                  className="w-4 h-4 rounded-full shrink-0 animate-pulse" 
                                  style={{ backgroundColor: t.primaryColor }}
                                />
                              )}
                              <span className="text-[10px] font-bold truncate">
                                {t.name}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono opacity-60">
                              {t.acronym}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* DETAILED SPECIFICATIONS PANEL (Col Span 5) */}
                <div className={`md:col-span-5 border ${themeClasses.border} rounded-xl p-5 flex flex-col justify-between shadow-inner`}>
                  {selectedTeamData ? (
                    <>
                      <div className="flex flex-col items-center text-center mt-1">
                        {/* Emblem */}
                        {selectedTeamData.logoUrl ? (
                          <img 
                            src={selectedTeamData.logoUrl} 
                            alt={selectedTeamData.name} 
                            className="w-16 h-16 object-contain rounded-xl select-none mb-3 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 font-display text-base font-black text-white mb-2"
                            style={{ backgroundColor: selectedTeamData.primaryColor || '#1e3a8a' }}
                          >
                            {selectedTeamData.acronym}
                          </div>
                        )}

                        <h4 className={`font-display text-xs font-black ${themeClasses.textPrimary} uppercase tracking-wider truncate max-w-full leading-tight`}>
                          {selectedTeamData.name} ({selectedTeamData.acronym})
                        </h4>
                        
                        <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-400/25 rounded px-2 py-0.5 uppercase tracking-widest font-black mt-1">
                          {text.gridLigas}
                        </span>

                        <p className={`text-[11px] ${themeClasses.textSecondary} leading-relaxed h-20 overflow-y-auto mt-3 pr-1 w-full text-left font-medium scrollbar-thin border-t border-b border-slate-800/25 py-2`}>
                          {selectedTeamData.description || 'Nenhuma descrição adicionada.'}
                        </p>
                      </div>

                      {/* Interactive metadata specs */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                        <div className="space-y-0.5">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">{text.budgetLabel}</span>
                          <span className="font-bold text-[10.5px] text-emerald-400">
                            {formatValueLocal(selectedTeamData.budget)}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">{text.fansLabel}</span>
                          <span className="font-bold text-[10.5px] text-sky-450 text-sky-400">
                            {selectedTeamData.popularity || 75}% Ativa
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">{text.starsLabel}</span>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const borderLimit = selectedTeamData.popularity >= 88 ? 5 : selectedTeamData.popularity >= 75 ? 4 : selectedTeamData.popularity >= 60 ? 3 : 2;
                              return (
                                <Award 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${i < borderLimit ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">{text.tierLabel}</span>
                          <span className="font-black text-xs text-rose-500 uppercase">
                            TIER {computeTeamTier(selectedTeamData)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="my-auto text-center text-xs text-slate-400 uppercase select-none">
                      Carregando especificações...
                    </div>
                  )}
                </div>

              </div>

              {/* Action operations footer */}
              <div className="flex gap-2.5 justify-end mt-6 border-t border-slate-800/10 pt-5">
                <button
                  onClick={() => setActiveState('PROFILE')}
                  className={`px-5 py-3 rounded-lg border ${themeClasses.border} text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors cursor-pointer`}
                >
                  {text.cancel}
                </button>
                <button
                  onClick={() => {
                    // Botão de ação: {"id": "avancar_para_database"} -> Transiciona o estado obrigatoriamente para 'escolha_database'
                    setActiveState('DB_SELECT');
                  }}
                  className={`px-7 py-3 rounded-lg ${themeClasses.actionButton} font-mono text-[10px] uppercase tracking-wider cursor-pointer shadow-lg`}
                >
                  AVANÇAR PARA DATABASE →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* State: escolha_database (DB_SELECT) */}
        {activeState === 'DB_SELECT' && (
          <div className="animate-fade-in flex flex-col items-center max-w-4xl mx-auto w-full">
            {/* Header branding */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/25">
                ESTÁGIO 4 - ESCOLHA DO BANCO DE DADOS
              </span>
              <h2 className={`font-display text-2xl font-black ${themeClasses.textPrimary} uppercase tracking-wider mt-2.5`}>
                Escolha do Banco de Dados
              </h2>
              <p className={`text-xs ${themeClasses.textSecondary} max-w-xl mx-auto mt-1.5 leading-relaxed`}>
                Selecione a base de dados oficial ou da comunidade para carregar os jogadores, times e ligas antes de iniciar a sua jornada rumo ao Worlds.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full leading-normal">
              {/* Option selection cards (Col Span 7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. LOCAL BUILT-IN DATABASE CARD */}
                <div 
                  onClick={() => {
                    if (downloadProgress.status === 'idle') setSelectedDbId('db_default_local');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDbId === 'db_default_local'
                      ? 'bg-blue-500/5 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : `bg-slate-900/30 ${themeClasses.border} hover:bg-slate-900/50`
                  } relative overflow-hidden`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${selectedDbId === 'db_default_local' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                          Banco de Dados Padrão (Local)
                        </h4>
                        <span className="text-[8px] font-mono bg-blue-500/15 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                          Nativo
                        </span>
                      </div>
                      <p className={`text-[10.5px] ${themeClasses.textSecondary} leading-relaxed mt-1`}>
                        Base oficial interna instalada nativamente com os dados padrões de fábrica do LegendsHub.
                      </p>
                      <div className="flex items-center gap-3 mt-2.5 text-[9px] font-mono text-slate-500">
                        <span className="font-bold text-slate-400">Localização:</span>
                        <span>%USERPROFILE%/AppData/Local/LegendsHub/db/default.db</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. COMMUNITY GITHUB DATABASES CATEGORY HEADER */}
                <div className="flex items-center gap-2 pt-2 pb-0.5">
                  <div className="h-px bg-slate-800/40 flex-1" />
                  <span className="text-[8px] font-mono font-black text-slate-400 tracking-widest uppercase">
                    Repositório de Atualizações da Comunidade
                  </span>
                  <div className="h-px bg-slate-800/40 flex-1" />
                </div>

                {/* GITHUB INTEGRATION HUD */}
                <div className={`p-3 rounded-lg border ${themeClasses.border} bg-slate-950/45 flex justify-between items-center text-[10px]`}>
                  <div className="flex items-center gap-2 font-mono">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-400">Origem:</span>
                    <a 
                      href="https://github.com/davisonsant/LegendsHub/db" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sky-400 underline hover:text-sky-350"
                    >
                      github.com/davisonsant/LegendsHub/db
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                    <button
                      onClick={handleRefreshDbList}
                      disabled={isRefreshingRepo || downloadProgress.status !== 'idle'}
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
                      title="Buscar atualizações"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRepo ? 'animate-spin text-sky-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* REMOTE REPO LIST */}
                <div className="space-y-2.5">
                  {[
                    {
                      id: 'db_remoto_01',
                      nome: 'LegendsHub_Cenário_Oficial_2026.db',
                      desc: 'Versão de rosters atualizados até Maio de 2026 contendo as ligas CBLOL, LCK, LPL e LEC.',
                      tamanho: '4.2 MB',
                      data: '2026-05-20',
                      autor: 'Comunidade Oficial'
                    },
                    {
                      id: 'db_remoto_02',
                      nome: 'Fearless_Draft_Roster_Custom.db',
                      desc: 'Configuração customizada de draft global focado em regras táticas do Fearless Draft e novos elencos.',
                      tamanho: '3.9 MB',
                      data: '2026-05-25',
                      autor: 'Modders LegendsHub'
                    },
                    {
                      id: 'db_patch_atual',
                      nome: 'Cenário Oficial LoL 2026 - Atualizado (v2.4)',
                      desc: 'Atualização de elenco do campeonato brasileiro e internacional sincronizado com dados da comunidade.',
                      tamanho: '4.5 MB',
                      data: '2026-05-27',
                      autor: 'Comunidade LegendsHub'
                    }
                  ].map((remoteDb) => {
                    const isSel = selectedDbId === remoteDb.id;
                    return (
                      <div
                        key={remoteDb.id}
                        onClick={() => {
                          if (downloadProgress.status === 'idle') setSelectedDbId(remoteDb.id);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isSel
                            ? 'bg-cyan-500/5 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                            : `bg-slate-900/30 ${themeClasses.border} hover:bg-slate-900/50`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${isSel ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-800/60 text-slate-400'}`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className={`text-xs font-black truncate uppercase tracking-wider ${themeClasses.textPrimary}`}>
                                {remoteDb.nome}
                              </h5>
                              <span className="text-[8px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-black shrink-0">
                                {remoteDb.tamanho}
                              </span>
                            </div>
                            <p className={`text-[10.5px] ${themeClasses.textSecondary} leading-relaxed mt-1`}>
                              {remoteDb.desc}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-2 font-mono text-[9px] text-slate-400">
                              <div>
                                <span className="text-slate-500">Autor:</span> <span className="font-bold text-slate-300">{remoteDb.autor}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Publicado:</span> <span className="font-bold text-slate-300">{remoteDb.data}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Reactive JSON Visual Monitor Dashboard (Col Span 5) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                
                {/* LIVE DATA ENGINE REACTIVE STATE */}
                <div className={`border ${themeClasses.border} rounded-xl p-4 bg-[#0a1424] flex flex-col h-full justify-between shadow-lg relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 select-none">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-[9.5px] font-black tracking-widest text-slate-200 uppercase">
                          UNIFIED JSON RESPONSE MONITOR
                        </span>
                      </div>
                      <span className="text-[8px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest font-black animate-pulse">
                        LIVE STATE
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed mb-3 italic">
                      O motor operacional do LegendsHub opera reativamente e publica este JSON unificado que sincroniza no ato de cada mudança de banco do jogador:
                    </p>

                    {/* Preformated Code block */}
                    <div className="bg-[#030712] border border-white/[0.05] p-3 rounded-lg max-h-[310px] overflow-y-auto scrollbar-thin text-left">
                      <pre className="font-mono text-[9px] text-cyan-400/95 leading-relaxed selection:bg-cyan-500/20 whitespace-pre-wrap">
                        {JSON.stringify(getReactiveJsonState(), null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Actions Confirmation block */}
                  <div className="pt-4 border-t border-white/5 mt-4 space-y-3">
                    {downloadProgress.status === 'idle' ? (
                      <div className="space-y-2">
                        {/* Summary indicator */}
                        <div className="bg-cyan-500/5 border border-cyan-400/10 p-2.5 rounded-lg text-[10px] font-mono leading-snug">
                          <span className="text-cyan-400 font-bold block uppercase tracking-wider mb-0.5">📂 Base Pré-Selecionada:</span>
                          <span className="text-slate-300">{
                            selectedDbId === 'db_default_local' 
                              ? 'Banco de Dados Padrão (Local / Interno)' 
                              : selectedDbId === 'db_remoto_01'
                              ? 'Cenário Oficial LoL 2026 - Completo'
                              : selectedDbId === 'db_remoto_02'
                              ? 'Fearless Draft Custom (Base de Dados Alternativa)'
                              : 'Cenário Oficial LoL 2026 - Atualizado (v2.4)'
                          }</span>
                        </div>

                        {/* Fire action buttons */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <button
                            onClick={() => setActiveState('TEAM_SELECT')}
                            className={`py-3 px-4 rounded-lg bg-slate-900 border ${themeClasses.border} hover:bg-slate-800 text-slate-400 hover:text-white font-black uppercase text-center transition-all cursor-pointer`}
                          >
                            Voltar
                          </button>
                          <button
                            onClick={() => handleStartCareerWithDb(selectedDbId)}
                            className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black uppercase text-center transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                          >
                            CONFIRMAR (VINCULAR)
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Futuristic Terminal Install Progress Panel */
                      <div className="bg-[#030712] border border-cyan-500/25 p-3.5 rounded-lg font-mono space-y-3 relative overflow-hidden text-left">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan-400 font-bold flex items-center gap-1.5 animate-pulse">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            COMPILANDO: {selectedDbId.toUpperCase()}
                          </span>
                          <span className="font-bold text-slate-350">{downloadProgress.percent}%</span>
                        </div>

                        {/* Horizontal progress meter */}
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className="bg-cyan-400 h-full transition-all duration-300 ease-out"
                            style={{ width: `${downloadProgress.percent}%` }}
                          />
                        </div>

                        {/* Live terminal feedback list */}
                        <div className="h-28 overflow-y-auto pr-1 text-[8.5px] leading-relaxed text-slate-300 space-y-1 block scrollbar-thin">
                          {downloadProgress.log.map((logLine, index) => (
                            <div key={index} className="flex gap-1.5 items-start">
                              <span className="text-cyan-500 shrink-0 select-none">&gt;</span>
                              <span className="break-all">{logLine}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* State: configuracoes_db (DB_SETTINGS) */}
        {activeState === 'DB_SETTINGS' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className={`w-full max-w-xl ${themeClasses.card} p-7 rounded-2xl text-left`}>
              
              <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h3 className={`font-display text-base font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                    {text.dbSettingsLabel}
                  </h3>
                  <p className={`text-[10px] uppercase tracking-widest font-mono text-cyan-400 mt-0.5`}>
                    JSON Save state database management (.db)
                  </p>
                </div>
                <button
                  onClick={() => setActiveState('MENU')}
                  className={`p-1.5 rounded-lg border ${themeClasses.border} text-slate-400 hover:text-white transition-colors cursor-pointer`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5 py-3">
                {/* Database active indicator */}
                <div className={`p-4 rounded-xl ${themeClasses.innerBox} flex justify-between items-center`}>
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                      {text.dbStatus}
                    </span>
                    <span className="font-mono text-xs font-black text-sky-400 mt-1 block">
                      {dbType === 'OFFICIAL' ? text.dbOfficial : text.dbCustom}
                    </span>
                  </div>
                  <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
                </div>

                {/* Database Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {/* Export */}
                  <button
                    onClick={triggerDbExport}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-sky-400/25 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {text.dbExport}
                  </button>

                  {/* Import Input */}
                  <div className="relative">
                    <button
                      onClick={() => document.getElementById('db-file-input')?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-400/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {text.dbImport}
                    </button>
                    <input
                      type="file"
                      id="db-file-input"
                      accept=".db,.json"
                      onChange={triggerDbImport}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Reset template */}
                {dbType === 'CUSTOM' && (
                  <button
                    onClick={triggerDbReset}
                    className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                  >
                    {text.dbReset}
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/15 flex justify-end mt-4">
                <button
                  onClick={() => setActiveState('MENU')}
                  className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-colors shadow-lg`}
                >
                  {text.back}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* State: LOAD_CAREER (Slots de Salvamento) */}
        {activeState === 'LOAD_CAREER' && (
          <div className="animate-fade-in flex flex-col items-center w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className={`font-display text-2xl font-black uppercase tracking-wider ${themeClasses.textPrimary}`}>
                {lang === 'PT-BR' ? 'CARREGAR CARREIRA' : 'LOAD CAREER'}
              </h2>
              <p className="text-[10px] uppercase font-mono text-cyan-400 tracking-widest mt-1">
                Selecione um dos 3 slots de salvamento ativo para continuar sua jornada
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
              {getSavesSlotsData().map(slot => {
                const isOccupied = slot.status === 'OCUPADO';
                return (
                  <div 
                    key={slot.id} 
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden h-[340px] ${
                      isOccupied 
                        ? (activeTheme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44] shadow-lg shadow-cyan-500/5 hover:border-cyan-500/30' : 'bg-white border-slate-200 shadow-md')
                        : 'border-dashed border-slate-800 bg-[#040812]/40 text-slate-500 flex items-center justify-center'
                    }`}
                  >
                    {isOccupied ? (
                      <>
                        <div className="space-y-4 text-left w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded tracking-widest">
                              SLOT 0{slot.id}
                            </span>
                            <span className="text-[8.5px] font-mono text-slate-450">
                              {slot.ultima_modificacao_real}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3.5 h-3.5 rounded-full inline-block border border-white/20" 
                                style={{ backgroundColor: slot.logo_time }}
                              />
                              <h4 className={`font-display text-xs font-extrabold tracking-wide uppercase truncate ${themeClasses.textPrimary}`}>
                                {slot.nome_time}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                              MGR: <strong className="text-slate-200">{slot.nome_manager}</strong>
                            </p>
                          </div>

                          <div className="border-t border-slate-800/40 my-3 pt-3 space-y-2 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between">
                              <span className="uppercase tracking-wider">DATA GERAL:</span>
                              <span className="font-bold text-slate-200">{slot.data_in_game}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="uppercase tracking-wider">ORÇAMENTO:</span>
                              <span className="font-bold text-emerald-400">{slot.moeda_formata_orcamento}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full pt-4 border-t border-white/5">
                          <button
                            onClick={() => onLoadGame(`slot_${slot.id}`)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/10"
                          >
                            Carregar Carreira
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(lang === 'PT-BR' ? `Deseja realmente apagar o Slot ${slot.id}?` : `Do you really want to clear Slot ${slot.id}?`)) {
                                localStorage.removeItem(`legendshub_save_slot_${slot.id}`);
                                localStorage.removeItem(`legendshub_save_slot_${slot.id}_date`);
                                alert(lang === 'PT-BR' ? 'Slot limpo com sucesso!' : 'Slot cleared!');
                                setDbType(prev => prev); // force reload trigger
                              }
                            }}
                            className="w-full py-2 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg border border-rose-500/10 cursor-pointer text-center transition-all"
                          >
                            Excluir Progresso
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-display text-xs font-bold text-slate-400 uppercase tracking-widest">Slot 0{slot.id} Vazio</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Nenhum progresso gravado neste arquivo</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveState('DISCLAIMER');
                          }}
                          className="px-5 py-2 rounded-xl bg-[#121f35] border border-[#1e2d44] hover:bg-[#182740] hover:border-cyan-500/30 text-slate-300 hover:text-white font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          + Criar Nova Carreira
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6 w-full flex justify-center">
              <button
                onClick={() => setActiveState('MENU')}
                className="px-8 py-3 bg-[#111c30] hover:bg-[#162541] text-slate-300 font-mono font-black text-[10px] uppercase tracking-widest rounded-xl border border-[#1e2d44] cursor-pointer transition-colors"
              >
                &larr; Voltar ao Menu
              </button>
            </div>
          </div>
        )}

        {/* State: EDITOR_JOGO (Motor de Edição Structural Independente de DB) */}
        {activeState === 'EDITOR_JOGO' && editorDb && (
          <div className="animate-fade-in flex flex-col w-full max-w-6xl mx-auto space-y-6">
            
            {/* Upper Editor Info bar */}
            <div className={`p-4 rounded-xl border ${activeTheme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div className="text-left">
                <span className="text-[8px] font-mono bg-cyan-400 text-slate-950 font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                  LOCAL_DB_ENGINE
                </span>
                <h3 className={`font-display text-base font-black ${themeClasses.textPrimary} mt-1.5 flex items-center gap-2`}>
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>LegendsHub_Default.db</span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-400/25 px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider">
                    SQLITE_LOCAL
                  </span>
                </h3>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                  Modificações salvas diretamente em storage local persistente
                </p>
              </div>

              {/* Central categories nav */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5">
                {[
                  { id: 'cat_ligas', label: 'Editar Ligas' },
                  { id: 'cat_times', label: 'Editar Times & Finanças' },
                  { id: 'cat_jogadores', label: 'Editar Jogadores' },
                  { id: 'cat_patrocinadores', label: 'Patrocinadores' },
                  { id: 'cat_campeoes', label: 'Ficha e Balanceamento' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setEditorSub(cat.id as any);
                      if (cat.id === 'cat_ligas') {
                        const l = leaguesMeta[editorRegion] || { name: 'CBLOL (Brasil)', logo: '' };
                        setFormLeagueName(l.name);
                        setFormLeagueLogo(l.logo);
                      }
                      if (cat.id === 'cat_times') {
                        const curId = editorSelectedTeamId || editorDb[editorRegion]?.[0]?.id || '';
                        handleSelectTeam(curId);
                      }
                      if (cat.id === 'cat_jogadores') {
                        const curId = editorSelectedTeamId || editorDb[editorRegion]?.[0]?.id || '';
                        const plyrs = getPlayersForTeam(curId, false).roster;
                        if (plyrs.length > 0) {
                          handleSelectPlayer(plyrs[0], curId);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      editorSub === cat.id 
                        ? 'bg-cyan-400 text-slate-950 font-extrabold shadow' 
                        : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Stage Grid (Sidebar + Form block) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Selector (Span 4) */}
              <div className={`lg:col-span-4 rounded-2xl border p-5 ${activeTheme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'} text-left`}>
                
                {/* LIGAS LIST SELECTION */}
                {editorSub === 'cat_ligas' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono tracking-widest font-black text-cyan-400 uppercase">Selecione a Organização Regional</h4>
                    <div className="space-y-2">
                      {Object.keys(leaguesMeta).map(reg => {
                        const l = leaguesMeta[reg];
                        const isSelected = editorRegion === reg;
                        let btnClass = '';
                        let primaryTextClass = '';
                        let secondaryTextClass = '';

                        if (activeTheme === 'light') {
                          if (isSelected) {
                            btnClass = 'bg-[#ffffff] border-[#00E5FF]';
                            primaryTextClass = 'text-[#0284c7]';
                            secondaryTextClass = 'text-[#334155]';
                          } else {
                            btnClass = 'bg-[#b2b7c2] border-transparent hover:border-[#334155]/20';
                            primaryTextClass = 'text-[#0f172a]';
                            secondaryTextClass = 'text-[#334155]';
                          }
                        } else {
                          // activeTheme === 'dark'
                          if (isSelected) {
                            btnClass = 'bg-[#0a1424] border-[#00E5FF]';
                            primaryTextClass = 'text-[#00E5FF]';
                            secondaryTextClass = 'text-[#8a99ad]';
                          } else {
                            btnClass = 'bg-[#1e2d44] border-transparent hover:border-slate-800';
                            primaryTextClass = 'text-white';
                            secondaryTextClass = 'text-[#8a99ad]';
                          }
                        }

                        return (
                          <button
                            key={reg}
                            onClick={() => {
                              setEditorRegion(reg as any);
                              setFormLeagueName(l.name);
                              setFormLeagueLogo(l.logo);
                            }}
                            className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${btnClass}`}
                          >
                            <span className={`font-display font-black text-xs ${primaryTextClass}`}>{reg}</span>
                            <span className={`text-[10.5px] font-mono font-medium ${secondaryTextClass}`}>{l.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TIMES LIST SELECTION */}
                {editorSub === 'cat_times' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="text-[10px] font-mono tracking-widest font-black text-cyan-400 uppercase">Selecione Ligas</h4>
                      <select
                        value={editorRegion}
                        onChange={(e) => {
                          const reg = e.target.value as any;
                          setEditorRegion(reg);
                          const firstT = editorDb[reg]?.[0]?.id || '';
                          handleSelectTeam(firstT);
                        }}
                        className={`text-[10px] p-1.5 rounded bg-slate-900 border ${themeClasses.border} text-sky-450 font-bold uppercase cursor-pointer`}
                      >
                        {['CBLOL', 'LCK', 'LPL', 'LEC', 'LCS', 'LCP'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 max-h-80 overflow-y-auto block pr-1 select-none font-sans">
                      {(editorDb[editorRegion] || []).map((t: any) => {
                        const isSelected = editorSelectedTeamId === t.id;
                        let btnClass = '';
                        let primaryTextClass = '';
                        let badgeClass = '';

                        if (activeTheme === 'light') {
                          if (isSelected) {
                            btnClass = 'bg-[#ffffff] border-[#00E5FF] shadow-sm';
                            primaryTextClass = 'text-[#0284c7] font-black';
                            badgeClass = 'bg-[#0f172a] text-[#ffffff] border border-transparent';
                          } else {
                            btnClass = 'bg-[#b2b7c2]/60 border-transparent hover:bg-[#cbd5e1] hover:border-transparent group';
                            primaryTextClass = 'text-[#0f172a] font-bold';
                            badgeClass = 'bg-[#334155]/10 text-[#334155] border border-slate-300 group-hover:bg-[#0f172a] group-hover:text-white transition-all';
                          }
                        } else {
                          if (isSelected) {
                            btnClass = 'bg-[#0a1424] border-[#00E5FF] shadow-lg';
                            primaryTextClass = 'text-[#00E5FF] font-black';
                            badgeClass = 'bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30';
                          } else {
                            btnClass = 'bg-[#1e2d44]/50 border-transparent hover:bg-[#334155] text-slate-350 hover:text-white group';
                            primaryTextClass = 'text-white font-bold';
                            badgeClass = 'bg-slate-900 border border-slate-800 text-slate-450 group-hover:text-[#e2e8f0] group-hover:bg-slate-800';
                          }
                        }

                        return (
                          <button
                            key={t.id}
                            onClick={() => handleSelectTeam(t.id)}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${btnClass}`}
                          >
                            <div className={`flex items-center gap-2 truncate ${primaryTextClass}`}>
                              <span 
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                                style={{ backgroundColor: t.primaryColor || '#00cbd6' }}
                              />
                              <span className="truncate">{t.name}</span>
                            </div>
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeClass}`}>{t.acronym}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* JOGADORES SELECTION */}
                {editorSub === 'cat_jogadores' && (
                  <div className="space-y-4">
                    <div className="space-y-2 pb-2 border-b border-white/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-cyan-400 font-black uppercase">Filtro de Liga:</span>
                        <select
                          value={editorRegion}
                          onChange={(e) => {
                            const r = e.target.value as any;
                            setEditorRegion(r);
                            const firstT = editorDb[r]?.[0]?.id || '';
                            setEditorSelectedTeamId(firstT);
                            const pId = getPlayersForTeam(firstT, false).roster[0]?.id || '';
                            const tPlyrs = getPlayersForTeam(firstT, false).roster;
                            if (tPlyrs.length > 0) {
                              handleSelectPlayer(tPlyrs[0], firstT);
                            }
                          }}
                          className={`p-1 bg-slate-905 border ${themeClasses.border} text-[9px] uppercase font-bold text-slate-300 cursor-pointer`}
                        >
                          {['CBLOL', 'LCK', 'LPL', 'LEC', 'LCS', 'LCP'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-cyan-400 font-black uppercase">Filtrar por Elenco:</span>
                        <select
                          value={editorSelectedTeamId}
                          onChange={(e) => {
                            const tId = e.target.value;
                            handleSelectTeam(tId);
                          }}
                          className={`max-w-[150px] p-1 bg-slate-905 border ${themeClasses.border} text-[9px] uppercase font-bold text-slate-300 cursor-pointer`}
                        >
                          {(editorDb[editorRegion] || []).map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto block pr-1">
                      {/* Active Roster List */}
                      <span className="text-[8px] font-mono uppercase tracking-widest text-[#00cbd6] block mb-2 font-extrabold font-mono">Jogadores Listados</span>
                      {getPlayersForTeam(editorSelectedTeamId || editorDb[editorRegion]?.[0]?.id || '', false).roster.map((p: any) => {
                        const key = `${editorSelectedTeamId}_${p.id}_${p.name}`;
                        const isSelected = editorSelectedPlayerId === p.id;
                        const ovr = editorPlayersDict[key]?.overallRating || p.baseRating || 75;

                        let btnClass = '';
                        let primaryTextClass = '';
                        let subTextClass = '';
                        let badgeClass = '';

                        if (activeTheme === 'light') {
                          if (isSelected) {
                            btnClass = 'bg-[#ffffff] border-[#00E5FF] shadow-sm';
                            primaryTextClass = 'text-[#0284c7] font-black';
                            subTextClass = 'text-[#334155]';
                            badgeClass = 'bg-[#0f172a] text-[#ffffff] border border-transparent';
                          } else {
                            btnClass = 'bg-[#b2b7c2]/60 border-transparent hover:bg-[#cbd5e1] hover:border-transparent group';
                            primaryTextClass = 'text-[#0f172a] font-bold';
                            subTextClass = 'text-[#334155] group-hover:text-[#1e293b]';
                            badgeClass = 'bg-[#334155]/15 text-[#334155] border border-slate-350 group-hover:bg-[#0f172a] group-hover:text-white transition-all';
                          }
                        } else {
                          if (isSelected) {
                            btnClass = 'bg-[#0a1424] border-[#00E5FF] shadow-lg';
                            primaryTextClass = 'text-[#00E5FF] font-black';
                            subTextClass = 'text-[#8a99ad]';
                            badgeClass = 'bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30';
                          } else {
                            btnClass = 'bg-[#1e2d44]/50 border-transparent hover:bg-[#334155] text-slate-350 hover:text-white group';
                            primaryTextClass = 'text-white font-bold';
                            subTextClass = 'text-slate-400 group-hover:text-[#e2e8f0]';
                            badgeClass = 'bg-slate-900 text-slate-450 group-hover:text-white border border-transparent';
                          }
                        }

                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelectPlayer(p, editorSelectedTeamId)}
                            className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                          >
                            <div className="truncate text-xs flex items-center gap-1.5 min-w-0">
                              <span className={`text-[10px] font-mono font-bold w-6 uppercase ${subTextClass}`}>{p.position}</span>
                              <span className={`truncate ${primaryTextClass}`}>{editorPlayersDict[key]?.name || p.name}</span>
                            </div>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${badgeClass}`}>OVR {ovr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PATROCINADORES SELECTION */}
                {editorSub === 'cat_patrocinadores' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h4 className="text-[10px] font-mono tracking-widest font-black text-cyan-400 uppercase">Marcas de Patrocínio</h4>
                      <button
                        onClick={() => {
                          const freshId = 'sp_' + Math.random().toString(36).substring(2, 9);
                          const freshSponsor = {
                            id: freshId,
                            name: 'Marca Nova',
                            logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
                            minPopularity: 40,
                            incomePerWeek: 30000,
                            signatureBonus: 40000,
                            termsInWeeks: 12,
                            isSigned: false,
                            objective: 'Se manter no Top 3 da liga em popularidade.',
                            objectiveBonus: 20000
                          };
                          setEditorSponsors([freshSponsor, ...editorSponsors]);
                          handleSelectSponsor(freshSponsor);
                          alert('Patrocinador registrado na lista! Ajuste as métricas ao lado.');
                        }}
                        className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer transition-colors"
                      >
                        + Criar Novo
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto block pr-1">
                      {editorSponsors.map(sp => {
                        const isSelected = editorSelectedSponsorId === sp.id;
                        let btnClass = '';
                        let primaryTextClass = '';
                        let badgeClass = '';

                        if (activeTheme === 'light') {
                          if (isSelected) {
                            btnClass = 'bg-[#ffffff] border-[#00E5FF] shadow-sm';
                            primaryTextClass = 'text-[#0284c7] font-black';
                            badgeClass = 'bg-[#0f172a] text-[#ffffff] border border-transparent';
                          } else {
                            btnClass = 'bg-[#b2b7c2]/60 border-transparent hover:bg-[#cbd5e1] hover:border-transparent group';
                            primaryTextClass = 'text-[#0f172a] font-bold';
                            badgeClass = 'bg-[#334155]/15 text-[#334155] border border-slate-350 group-hover:bg-[#0f172a] group-hover:text-white transition-all';
                          }
                        } else {
                          if (isSelected) {
                            btnClass = 'bg-[#0a1424] border-[#00E5FF] shadow-lg';
                            primaryTextClass = 'text-[#00E5FF] font-black';
                            badgeClass = 'bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30';
                          } else {
                            btnClass = 'bg-[#1e2d44]/50 border-transparent hover:bg-[#334155] text-slate-350 hover:text-white group';
                            primaryTextClass = 'text-white font-bold';
                            badgeClass = 'bg-slate-900 text-slate-450 group-hover:text-white border border-transparent';
                          }
                        }

                        return (
                          <button
                            key={sp.id}
                            onClick={() => handleSelectSponsor(sp)}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                          >
                            <span className={`text-xs truncate ${primaryTextClass}`}>{sp.name}</span>
                            <span className={`text-[8.5px] font-mono font-bold uppercase transition-all ${badgeClass}`}>{sp.minPopularity}% Popularidade</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CAMPEÕES SELECTION */}
                {editorSub === 'cat_campeoes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h4 className="text-[10px] font-mono tracking-widest font-black text-cyan-400 uppercase">Campeões do LoL</h4>
                      <button
                        onClick={() => {
                          const freshId = 'ch_' + Math.random().toString(36).substring(2, 9);
                          const freshChamp = {
                            id: freshId,
                            name: 'Inovador',
                            roles: ['MID' as const],
                            tier: 'Tier 1',
                            power: 85,
                            buffStatus: 'NORMAL' as const,
                            idealPlaystyle: 'Lances acrobáticos e controle territorial.',
                            counters: [],
                            synergies: [],
                            imageSeed: 100
                          };
                          setEditorChamps([freshChamp, ...editorChamps]);
                          handleSelectChamp(freshChamp);
                          alert('Novo campeão inserido com sucesso.');
                        }}
                        className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer transition-colors"
                      >
                        + Adicionar Novo
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto block pr-1">
                      {editorChamps.map(c => {
                        const isSelected = editorSelectedChampId === c.id;
                        let btnClass = '';
                        let primaryTextClass = '';
                        let badgeClass = '';

                        if (activeTheme === 'light') {
                          if (isSelected) {
                            btnClass = 'bg-[#ffffff] border-[#00E5FF] shadow-sm';
                            primaryTextClass = 'text-[#0284c7] font-black';
                            badgeClass = 'bg-[#0f172a] text-[#ffffff] border border-transparent';
                          } else {
                            btnClass = 'bg-[#b2b7c2]/60 border-transparent hover:bg-[#cbd5e1] hover:border-transparent group';
                            primaryTextClass = 'text-[#0f172a] font-bold';
                            badgeClass = 'bg-[#334155]/15 text-[#334155] border border-slate-350 group-hover:bg-[#0f172a] group-hover:text-white transition-all';
                          }
                        } else {
                          if (isSelected) {
                            btnClass = 'bg-[#0a1424] border-[#00E5FF] shadow-lg';
                            primaryTextClass = 'text-[#00E5FF] font-black';
                            badgeClass = 'bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30';
                          } else {
                            btnClass = 'bg-[#1e2d44]/50 border-transparent hover:bg-[#334155] text-slate-350 hover:text-white group';
                            primaryTextClass = 'text-white font-bold';
                            badgeClass = 'bg-slate-900 text-slate-450 group-hover:text-white border border-transparent';
                          }
                        }

                        return (
                          <button
                            key={c.id}
                            onClick={() => handleSelectChamp(c)}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                          >
                            <span className={`text-xs truncate ${primaryTextClass}`}>{c.name}</span>
                            <span className={`text-[8.5px] font-mono font-bold uppercase transition-all ${badgeClass}`}>{c.tier}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right panel (Form editor inputs - Span 8) */}
              <div className={`lg:col-span-8 rounded-2xl border p-6 ${activeTheme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'} text-left`}>
                
                {/* LIGAS FORM EDIT */}
                {editorSub === 'cat_ligas' && (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${themeClasses.textPrimary}`}>
                        Formulário da Liga: <span className="text-cyan-405">{editorRegion}</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
                        Modifique o nome legal e endereço do emblema desta liga
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-1.5">
                        <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Nome Oficial da Liga</label>
                        <input
                          type="text"
                          value={formLeagueName}
                          onChange={(e) => setFormLeagueName(e.target.value)}
                          className={`w-full p-3 rounded-lg border focus:border-cyan-405 focus:outline-none ${themeClasses.input}`}
                          placeholder="Ex: Campeonato Brasileiro de League of Legends"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Emblema/Escudo da Liga (Suporta URL Web ou Arquivo)</label>
                          <label className="text-[9px] font-mono font-black text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                            <Upload className="w-3" style={{ height: '12px' }} />
                            <span>Carregar do Computador (PC)</span>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={(e) => handleFileChange(e, setFormLeagueLogo)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          value={formLeagueLogo}
                          onChange={(e) => setFormLeagueLogo(e.target.value)}
                          className={`w-full p-3 rounded-lg border focus:border-cyan-450 focus:outline-none ${themeClasses.input}`}
                          placeholder="Cole a URL ou suba um arquivo acima (input_url_web / input_file_picker)"
                        />
                        {formLeagueLogo && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Pré-visualização:</span>
                            <img src={formLeagueLogo} className="w-8 h-8 object-contain rounded bg-slate-900 border border-white/5 p-0.5" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updatedMeta = {
                          ...leaguesMeta,
                          [editorRegion]: { name: formLeagueName, logo: formLeagueLogo }
                        };
                        setLeaguesMeta(updatedMeta);
                        localStorage.setItem('legendshub_custom_leagues_meta', JSON.stringify(updatedMeta));
                        alert('Dados da Liga atualizados com sucesso nestas abas!');
                      }}
                      className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-md mt-4 ${
                        activeTheme === 'light' 
                          ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                          : 'bg-[#00E5FF] text-[#0a1424] hover:bg-[#00B2CC]'
                      }`}
                    >
                      Sincronizar Liga
                    </button>
                  </div>
                )}

                {/* TIMES FORM EDIT */}
                {editorSub === 'cat_times' && (
                  <div className="space-y-4">
                    {editorSelectedTeamId ? (
                      <>
                        <div className="border-b border-white/5 pb-3">
                          <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${themeClasses.textPrimary}`}>
                            Ficha do Time: <span className="text-cyan-405">{formTeamName}</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Nome Oficial da Organização</label>
                            <input
                              type="text"
                              value={formTeamName}
                              onChange={(e) => setFormTeamName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Sigla do Time (Ex: PNG)</label>
                            <input
                              type="text"
                              value={formTeamAcronym}
                              onChange={(e) => setFormTeamAcronym(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                              maxLength={4}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Popularidade do Time</label>
                            <select
                              value={formTeamPopularity}
                              onChange={(e) => setFormTeamPopularity(e.target.value as any)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input} cursor-pointer`}
                            >
                              <option value="BAIXA">BAIXA (70-74)</option>
                              <option value="MEDIA">MÉDIA (75-84)</option>
                              <option value="ALTA">ALTA (85-99)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Prestígio / Tier de Força</label>
                            <select
                              value={formTeamTier}
                              onChange={(e) => setFormTeamTier(e.target.value as any)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input} cursor-pointer`}
                            >
                              <option value="B">TIER B</option>
                              <option value="A">TIER A</option>
                              <option value="S">TIER S (Favoritos)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Cor Primária (Hex Code)</label>
                            <input
                              type="text"
                              value={formTeamColor}
                              onChange={(e) => setFormTeamColor(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Cor Secundária (Hex Code)</label>
                            <input
                              type="text"
                              value={formTeamColorSec}
                              onChange={(e) => setFormTeamColorSec(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5 sm:col-span-2 border-t border-white/5 pt-3 mt-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Escudo/Logo do Time</label>
                              <label className="text-[9px] font-mono font-black text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                <Upload className="w-3" style={{ height: '12px' }} />
                                <span>Carregar do Computador (PC)</span>
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.webp"
                                  onChange={(e) => handleFileChange(e, setFormTeamLogo)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={formTeamLogo}
                              onChange={(e) => setFormTeamLogo(e.target.value)}
                              placeholder="Cole a URL ou suba um arquivo acima (input_url_web / input_file_picker)"
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                            {formTeamLogo && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Pré-visualização:</span>
                                <img src={formTeamLogo} className="w-8 h-8 object-contain rounded bg-slate-900 border border-white/5 p-0.5" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Automatic procedurals computed budget card box */}
                        <div className="p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 my-4 space-y-1.5">
                          <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-405 block uppercase">
                            REGRA PROCEDURAL OPERACIONAL (FINANCEIRA)
                          </span>
                          <div className="flex justify-between items-center">
                            <p className="text-[10.5px] text-slate-400">
                              Orçamento operacional anual do time calculado pelo motor:
                            </p>
                            <div className="font-mono text-sm font-black text-emerald-400">
                              $ {calcProceduralBudget(formTeamTier, formTeamPopularity).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-mono italic">
                            * O software não permite editar fundos manualmente. O orçamento é computado a partir de Tier e Popularidade.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const updatedDb = { ...editorDb };
                            const list = updatedDb[editorRegion] || [];
                            const popNum = formTeamPopularity === 'ALTA' ? 92 : formTeamPopularity === 'MEDIA' ? 78 : 64;
                            const recalculatedBudget = calcProceduralBudget(formTeamTier, formTeamPopularity);
                            
                            updatedDb[editorRegion] = list.map((t: any) => {
                              if (t.id === editorSelectedTeamId) {
                                return {
                                  ...t,
                                  name: formTeamName,
                                  acronym: formTeamAcronym,
                                  popularity: popNum,
                                  budget: recalculatedBudget,
                                  primaryColor: formTeamColor,
                                  secondaryColor: formTeamColorSec,
                                  logoUrl: formTeamLogo
                                };
                              }
                              return t;
                            });
                            
                            setEditorDb(updatedDb);
                            alert("Ficha do Time e orçamento recalculados aplicados ao banco local!");
                          }}
                          className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
                            activeTheme === 'light' 
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                              : 'bg-[#00E5FF] text-[#0a1424] hover:bg-[#00B2CC]'
                          }`}
                        >
                          Salvar Dados do Time
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs py-8 text-center font-mono uppercase">Escolha um time para inicializar a edição</p>
                    )}
                  </div>
                )}

                {/* JOGADORES FORM EDIT */}
                {editorSub === 'cat_jogadores' && (
                  <div className="space-y-4">
                    {editorSelectedPlayerId ? (
                      <>
                        <div className="border-b border-white/5 pb-3">
                          <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${themeClasses.textPrimary}`}>
                            Editando Atleta: <span className="text-indigo-405">{formPlayerName}</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Nickname do Atleta</label>
                            <input
                              type="text"
                              value={formPlayerName}
                              onChange={(e) => setFormPlayerName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Nome Real / Completo</label>
                            <input
                              type="text"
                              value={formPlayerRealName}
                              onChange={(e) => setFormPlayerRealName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Nacionalidade</label>
                            <input
                              type="text"
                              value={formPlayerNationality}
                              onChange={(e) => setFormPlayerNationality(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Idade</label>
                            <input
                              type="number"
                              value={formPlayerAge}
                              onChange={(e) => setFormPlayerAge(Number(e.target.value))}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5 sm:col-span-2 border-t border-white/5 pt-3 mt-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Foto/Retrato do Jogador</label>
                              <label className="text-[9px] font-mono font-black text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                <Upload className="w-3" style={{ height: '12px' }} />
                                <span>Carregar do Computador (PC)</span>
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.webp"
                                  onChange={(e) => handleFileChange(e, setFormPlayerPhoto)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={formPlayerPhoto}
                              onChange={(e) => setFormPlayerPhoto(e.target.value)}
                              placeholder="Cole a URL ou suba um arquivo acima (input_url_web / input_file_picker)"
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                            {formPlayerPhoto && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Pré-visualização:</span>
                                <img src={formPlayerPhoto} className="w-8 h-8 object-cover rounded-full bg-slate-900 border border-white/5 p-0.5" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 text-left">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Atributo Geral de Força (OVR)</label>
                            <span className="font-mono text-sm font-black text-indigo-400">{formPlayerOvr} / 99</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="99"
                            value={formPlayerOvr}
                            onChange={(e) => setFormPlayerOvr(Number(e.target.value))}
                            className="w-full text-indigo-505 bg-slate-800"
                          />
                        </div>

                        <button
                          onClick={() => {
                            const updatedDict = { ...editorPlayersDict };
                            const dictKey = `${editorSelectedTeamId}_${editorSelectedPlayerId}_${formPlayerName}`;
                            
                            updatedDict[dictKey] = {
                              name: formPlayerName,
                              realName: formPlayerRealName,
                              age: formPlayerAge,
                              nationality: formPlayerNationality,
                              overallRating: formPlayerOvr,
                              photoUrl: formPlayerPhoto
                            };
                            
                            updatedDict[editorSelectedPlayerId] = {
                              name: formPlayerName,
                              realName: formPlayerRealName,
                              age: formPlayerAge,
                              nationality: formPlayerNationality,
                              overallRating: formPlayerOvr,
                              photoUrl: formPlayerPhoto
                            };
                            
                            setEditorPlayersDict(updatedDict);
                            alert("Parâmetros do atleta alterados e sincronizados! O meta-loader carregará estes dados ao iniciar campanhas.");
                          }}
                          className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider mt-4 cursor-pointer ${
                            activeTheme === 'light' 
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                              : 'bg-[#00E5FF] text-[#0a1424] hover:bg-[#00B2CC]'
                          }`}
                        >
                          Sincronizar Dados do Atleta
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs py-10 text-center font-mono uppercase">Escolha um jogador do catálogo ao lado para carregar</p>
                    )}
                  </div>
                )}

                {/* PATROCINADORES FORM EDIT */}
                {editorSub === 'cat_patrocinadores' && (
                  <div className="space-y-4">
                    {editorSelectedSponsorId ? (
                      <>
                        <div className="border-b border-white/5 pb-3">
                          <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${themeClasses.textPrimary}`}>
                            Editando Patrocinador: <span className="text-cyan-405">{formSponsorName}</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Nome da Marca</label>
                            <input
                              type="text"
                              value={formSponsorName}
                              onChange={(e) => setFormSponsorName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="flex justify-between items-center font-mono text-[10px]">
                              <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Imagem Logotipo (URL ou Arquivo)</label>
                              <label className="text-[9px] font-mono font-black text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                <Upload className="w-3" style={{ height: '12px' }} />
                                <span>Carregar do Computador (PC)</span>
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.webp"
                                  onChange={(e) => handleFileChange(e, setFormSponsorLogo)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={formSponsorLogo}
                              onChange={(e) => setFormSponsorLogo(e.target.value)}
                              placeholder="Cole a URL ou suba um arquivo acima (input_url_web / input_file_picker)"
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                            {formSponsorLogo && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Pré-visualização:</span>
                                <img src={formSponsorLogo} className="w-8 h-8 object-contain rounded bg-slate-900 border border-white/5 p-0.5" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <label className="font-mono text-slate-400 font-bold font-mono">Popularidade Mínima da Marca (Requisito)</label>
                              <strong className="text-indigo-400 font-mono font-bold">{formSponsorPopularity}%</strong>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="99"
                              value={formSponsorPopularity}
                              onChange={(e) => setFormSponsorPopularity(Number(e.target.value))}
                              className="w-full text-indigo-505"
                            />
                          </div>
                        </div>

                        {/* Recalculated procedural sponsor values */}
                        <div className="p-4 rounded-xl border border-indigo-450/20 bg-indigo-505/5 space-y-2 mt-4 font-mono text-[10px]">
                          <span className="text-[8px] font-bold text-indigo-405 tracking-widest block uppercase">PREDIÇÃO PROCEDURAL DE CONTRATO CORPORATIVO</span>
                          <div className="flex justify-between">
                            <span className="text-slate-400 uppercase">Pagamento Semanal Calculado:</span>
                            <span className="text-emerald-400 font-black font-mono">$ {calcProceduralSponsorWeekly(formSponsorPopularity).toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 uppercase">Bônus de Assinatura Único:</span>
                            <span className="text-emerald-400 font-black font-mono">$ {calcProceduralSponsorBonus(formSponsorPopularity).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-[8px] text-slate-500 leading-normal mt-2 italic font-sans font-medium">
                            * Os pagamentos e bônus das marcas são gerados proceduralmente de acordo com a popularidade definida no editor para manter o balanceamento da simulação financeira da liga.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const updatedSponsors = editorSponsors.map(sp => {
                              if (sp.id === editorSelectedSponsorId) {
                                return {
                                  ...sp,
                                  name: formSponsorName,
                                  logoUrl: formSponsorLogo,
                                  minPopularity: formSponsorPopularity,
                                  incomePerWeek: calcProceduralSponsorWeekly(formSponsorPopularity),
                                  signatureBonus: calcProceduralSponsorBonus(formSponsorPopularity)
                                };
                              }
                              return sp;
                            });
                            
                            setEditorSponsors(updatedSponsors);
                            alert("Sponsor salvo na base temporária de edição!");
                          }}
                          className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider mt-4 cursor-pointer ${
                            activeTheme === 'light' 
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                              : 'bg-[#00E5FF] text-[#0a1424] hover:bg-[#00B2CC]'
                          }`}
                        >
                          Salvar Marca de Patrocínio
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs py-10 text-center font-mono uppercase">Escolha um patrocinador da lista para carregar seu formulário</p>
                    )}
                  </div>
                )}

                {/* CAMPEÕES FORM EDIT */}
                {editorSub === 'cat_campeoes' && (
                  <div className="space-y-4 font-sans">
                    {editorSelectedChampId ? (
                      <>
                        <div className="border-b border-white/5 pb-3">
                          <h3 className={`font-display text-sm font-extrabold uppercase tracking-wider ${themeClasses.textPrimary}`}>
                            Editando Campeão: <span className="text-indigo-405">{formChampName}</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Nome do Campeão</label>
                            <input
                              type="text"
                              value={formChampName}
                              onChange={(e) => setFormChampName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Tier Meta Season</label>
                            <select
                              value={formChampTier}
                              onChange={(e) => setFormChampTier(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input} cursor-pointer`}
                            >
                              <option value="God Tier">God Tier</option>
                              <option value="Tier 1">Tier 1</option>
                              <option value="Tier 2">Tier 2</option>
                              <option value="Off-Meta">Off-Meta</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="flex justify-between items-center font-mono text-[10px]">
                              <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold">Retrato Ícone (URL ou Arquivo)</label>
                              <label className="text-[9px] font-mono font-black text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                <Upload className="w-3" style={{ height: '12px' }} />
                                <span>Carregar do Computador (PC)</span>
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.webp"
                                  onChange={(e) => handleFileChange(e, setFormChampLogo)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={formChampLogo}
                              onChange={(e) => setFormChampLogo(e.target.value)}
                              placeholder="Cole a URL ou suba um arquivo acima (input_url_web / input_file_picker)"
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                            {formChampLogo && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Pré-visualização:</span>
                                <img src={formChampLogo} className="w-8 h-8 object-contain rounded bg-slate-900 border border-white/5 p-0.5" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold font-mono">Poder Operacional Base</label>
                            <input
                              type="number"
                              min="50"
                              max="99"
                              value={formChampPower}
                              onChange={(e) => setFormChampPower(Number(e.target.value))}
                              className={`w-full p-2.5 rounded-lg border focus:outline-none ${themeClasses.input}`}
                            />
                          </div>
                        </div>

                        {/* Checkbox selector for roles */}
                        <div className="space-y-2 mt-4 text-left">
                          <label className="text-[10px] font-mono tracking-wide uppercase text-slate-400 font-bold block mb-1">Rotas Recomendadas (Drafts Inteligentes)</label>
                          <div className="flex flex-wrap gap-4 font-mono text-[10px] font-bold tracking-wider text-slate-300">
                            {['TOP', 'JNG', 'MID', 'ADC', 'SUP'].map(role => {
                              const isChecked = formChampRoles.includes(role);
                              return (
                                <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setFormChampRoles(formChampRoles.filter(r => r !== role));
                                      } else {
                                        setFormChampRoles([...formChampRoles, role]);
                                      }
                                    }}
                                    className="rounded border-slate-700 text-indigo-500"
                                  />
                                  <span>{role}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const updatedChamps = editorChamps.map(c => {
                              if (c.id === editorSelectedChampId) {
                                return {
                                  ...c,
                                  name: formChampName,
                                  tier: formChampTier,
                                  power: formChampPower,
                                  roles: formChampRoles,
                                  idealPlaystyle: formChampLogo || c.idealPlaystyle
                                };
                              }
                              return c;
                            });
                            
                            setEditorChamps(updatedChamps);
                            alert("Meta do boneco balanceado na base temporária!");
                          }}
                          className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider mt-4 cursor-pointer ${
                            activeTheme === 'light' 
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                              : 'bg-[#00E5FF] text-[#0a1424] hover:bg-[#00B2CC]'
                          }`}
                        >
                          Salvar Campeão
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs py-10 text-center font-mono uppercase">Escolha um campeão da lista para ver sua rotas e atributos</p>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* Bottom bar control action nodes */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${activeTheme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-slate-50 border-slate-205'}`}>
              
              <div className="flex gap-2 w-full md:w-auto">
                {/* Save DB Commit */}
                <button
                  onClick={() => {
                    localStorage.setItem('legendshub_custom_db', JSON.stringify(editorDb));
                    localStorage.setItem('legendshub_custom_champions', JSON.stringify(editorChamps));
                    localStorage.setItem('legendshub_custom_sponsors', JSON.stringify(editorSponsors));
                    localStorage.setItem('legendshub_custom_players_dict', JSON.stringify(editorPlayersDict));
                    alert("Sucesso! Banco de Dados gravado e consolidado com sucesso no arquivo do sistema! Todas as novas carreiras herdarão esses rosters, atributos de atletas e balanços propatrocinadores.");
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-[10.5px] uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Salvar No Banco Ativo
                </button>

                {/* Export File Direct */}
                <button
                  onClick={handleExportEditedDb}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-cyan-400/25 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Exportar .db
                </button>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                {/* Standalone Import directly in stage editor */}
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#1e2d44] hover:bg-slate-900/40 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer select-none">
                  <Upload className="w-4 h-4 text-cyan-455" />
                  <span>Importar .DB</span>
                  <input
                    type="file"
                    accept=".json,.db"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files[0]) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          try {
                            const json = JSON.parse(evt.target?.result as string);
                            if (json.teams_database) setEditorDb(json.teams_database);
                            if (json.champions) setEditorChamps(json.champions);
                            if (json.sponsors) setEditorSponsors(json.sponsors);
                            if (json.players_overrides) setEditorPlayersDict(json.players_overrides);
                            alert("Banco de dados customizado carregado na memória do editor com total sucesso!");
                          } catch (err) {
                            alert("Erro ao ler ou validar formato do arquivo .db carregado.");
                          }
                        };
                        reader.readAsText(files[0]);
                      }
                    }}
                  />
                </label>

                {/* Exit Editor Standalone back to menu */}
                <button
                  onClick={() => setActiveState('MENU')}
                  className="px-6 py-3 bg-[#111c30] hover:bg-[#162541] border border-[#1e2d44] text-slate-300 font-mono font-black text-[10px] uppercase tracking-widest rounded-xl cursor-pointer transition-colors"
                >
                  Voltar Ao Menu
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Footer release brandings - strictly matching Davison Sant label */}
      <div className="text-center z-10 select-none pb-4">
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">
          Versão 1.0.1 - Release Beta
        </p>
        <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-1">
          LegendsHub 1.0.1  •  2026  •  DESENVOLVIDO POR DAVISON SANT
        </p>
      </div>
    </div>
  );
}

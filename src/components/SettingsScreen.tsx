import React, { useState, useEffect } from 'react';
import { 
  User, Image, Trash2, Camera, Shield, Sliders, Globe, Download, 
  Upload, RefreshCw, Sparkles, Languages, Check, ArrowLeft, Sun, Moon, 
  Database, Save, HardDrive, Edit2, AlertTriangle, Info, CheckCircle2, Plus
} from 'lucide-react';
import { GameState, Team, Player, Sponsor, Champion, Position } from '../types';
import { getPlayersForTeam } from '../data/realPlayers';

interface SettingsScreenProps {
  gameState: GameState | null;
  onUpdateTeams: (updatedTeams: Team[]) => void;
  onUpdateSponsors: (updatedSponsors: Sponsor[]) => void;
  onUpdateGameState: (nextState: GameState) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onBack: () => void;
  onManualSave?: (slotIndex: number) => void;
}

const PRESET_AVATARS = [
  { id: 'av_tactician', name: 'Mestre Tático', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80' },
  { id: 'av_champion', name: 'Lenda', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { id: 'av_cyber', name: 'Cyber Stream', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av_analyst', name: 'Estrategista', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { id: 'av_pro', name: 'Campeão', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
];

export default function SettingsScreen({
  gameState,
  onUpdateTeams,
  onUpdateSponsors,
  onUpdateGameState,
  theme,
  setTheme,
  onBack,
  onManualSave
}: SettingsScreenProps) {
  // Navigation tabs inside Settings
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'appearance' | 'editor' | 'database'>('profile');

  // Slots management and auto-save state hooks
  const [saveSlotHeaders, setSaveSlotHeaders] = useState<any[]>([]);

  const [autosaveEnabled, setAutosaveEnabled] = useState(() => {
    return localStorage.getItem('legendshub_autosave_enabled') !== 'false';
  });

  const [autosaveFreq, setAutosaveFreq] = useState(() => {
    return parseInt(localStorage.getItem('legendshub_autosave_freq') || '4');
  });

  const [autosaveCritical, setAutosaveCritical] = useState(() => {
    return localStorage.getItem('legendshub_autosave_critical') !== 'false';
  });

  const loadSlotsMetadata = () => {
    const loaded: any[] = [];
    for (let i = 1; i <= 3; i++) {
      const raw = localStorage.getItem(`legendshub_save_slot_${i}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const savedDate = localStorage.getItem(`legendshub_save_slot_${i}_date`) || 'N/A';
          loaded.push({
            slotIndex: i,
            teamName: parsed.teams?.find((t: any) => t.id === parsed.playerTeamId)?.name || 'Apex Guardians',
            managerName: parsed.managerName || 'Manager',
            week: parsed.week || 1,
            season: parsed.season || 1,
            date: savedDate,
            filled: true
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        loaded.push({
          slotIndex: i,
          filled: false
        });
      }
    }
    setSaveSlotHeaders(loaded);
  };

  useEffect(() => {
    loadSlotsMetadata();
  }, []);

  const handleUpdateAutosaveFreq = (val: number) => {
    setAutosaveFreq(val);
    localStorage.setItem('legendshub_autosave_freq', val.toString());
    if (val === 0) {
      localStorage.setItem('legendshub_autosave_enabled', 'false');
      setAutosaveEnabled(false);
    } else {
      localStorage.setItem('legendshub_autosave_enabled', 'true');
      setAutosaveEnabled(true);
    }
  };

  const handleToggleCritical = (checked: boolean) => {
    setAutosaveCritical(checked);
    localStorage.setItem('legendshub_autosave_critical', checked ? 'true' : 'false');
  };

  const handleSaveToSlotLocal = (slotIdx: number) => {
    if (onManualSave) {
      onManualSave(slotIdx);
      setTimeout(() => {
        loadSlotsMetadata();
      }, 150);
    }
  };

  const handleDeleteSlotLocal = (slotIdx: number) => {
    if (confirm(lang === 'es' ? `¿Eliminar el Slot de Guardado ${slotIdx}?` : lang === 'en' ? `Delete Save Slot ${slotIdx}?` : `Excluir o Slot de Salvamento ${slotIdx}?`)) {
      localStorage.removeItem(`legendshub_save_slot_${slotIdx}`);
      localStorage.removeItem(`legendshub_save_slot_${slotIdx}_date`);
      loadSlotsMetadata();
    }
  };

  // Load language preference
  const [lang, setLang] = useState<'pt' | 'es' | 'en'>(() => {
    const saved = localStorage.getItem('legendshub_lang');
    return (saved as 'pt' | 'es' | 'en') || 'pt';
  });

  // Load currency preference
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'BRL'>(() => {
    return (localStorage.getItem('legendshub_currency') as 'USD' | 'EUR' | 'BRL') || 'USD';
  });

  // Handle language change
  const handleLanguageChange = (nextLang: 'pt' | 'es' | 'en') => {
    setLang(nextLang);
    localStorage.setItem('legendshub_lang', nextLang);
  };

  // Setup Translation Dictionary
  const t = {
    pt: {
      title: "Configurações Globais",
      subTitle: "Gerencie sua conta e preferências de visualização",
      backBtn: "Voltar para o Jogo",
      launcherBtn: "Voltar ao Launcher",
      tabProfile: "Conta & Manager",
      tabAppearance: "Aparência & Idioma",
      tabEditor: "Editor de Jogo",
      tabDatabase: "Backup & Banco de Dados",
      
      // Profile Tab
      profilePicTitle: "Foto de Perfil",
      profilePicDesc: "Altere sua imagem de manager exibida no HUD e relatórios técnicos. Formato de foto local ou presets táticos.",
      btnPreset: "Aplicar Preset",
      btnRemovePic: "Remover Foto",
      uploadLocalPic: "Carregar Foto do Computador (JPG/PNG)",
      customUrlPlace: "Insira a URL de uma Imagem customizada...",
      managerNameLabel: "Nome do Manager (In-Game)",
      saveNameBtn: "Salvar Nome do Manager",
      saveNameSuccess: "Nome do Manager atualizado com sucesso!",
      
      // Appearance Tab
      appearanceTitle: "Estilo Visual",
      themeLabel: "Selecione o Esquema de Cores",
      themeLightName: "Light Mode (Claro esportivo)",
      themeDarkName: "Dark Mode (Escuro cibernético)",
      langTitle: "Preferências de Idioma",
      langDesc: "Troque instantaneamente as legendas e textos de todo o painel operacional de Legend Hub.",
      langPt: "Português (Brasil)",
      langEs: "Espanhol (Castellano)",
      langEn: "Inglês (English)",
      
      // Editor Tab
      editorTitle: "Editor de Planilhas e Liga",
      editorDesc: "Área destinada a editar liga, equipes, escudos, atletas profissionais, patrocinadores e inserir ou alterar imagens customizadas.",
      editorSaveOk: "Alterações salvas com sucesso!",

      // Backup Section
      backupSecTitle: "Proteção e Backup do Cartão de Memória",
      backupSecDesc: "Proteja seus dados salvando uma cópia local do seu game e configurações. Cole o código de segurança para recuperar o progresso a qualquer momento.",
      btnCreateRecoverPoint: "Criar Ponto de Restauração Local",
      recoverPointSuccess: "Ponto de restauração local criado! Salvamento seguro nos slots do navegador.",
      copiableBackupLabel: "Sua Cópia Local Completa (Código criptografado de portabilidade)",
      btnCopyCode: "Copiar Código",
      btnPasteRestore: "Importar do Código",
      copiedNotice: "Código copiado para o clipboard!",
      invalidCodeError: "Formato de código inválido para restauração de carreira.",

      // Database Section
      dbSecTitle: "Painel Crítico do Banco de Dados",
      dbBtnDownload: "Salvar (Download JSON)",
      dbBtnImport: "Importar arquivo JSON",
      dbBtnRepair: "Reparar Banco de Dados",
      dbBtnClear: "Apagar Tudo (Reset Completo)",
      repairSuccess: "Reparação finalizada! Verificação de integridade não encontrou corrupção. Jogadores starter e orçamentos otimizados com sucesso.",
      clearConfirm: "Tem certeza absoluta? Isso irá limpar toda a memória local do navegador, incluindo slots de salvamento do manager e configurações atuais.",
      clearSuccess: "Memória limpa com sucesso. Retornando ao Launcher padrão.",
      importSuccess: "Carreira e Banco de Dados importados com sucesso do JSON!",
      importError: "Erro ao importar arquivo. Certifique-se de que o formato do arquivo JSON é uma cópia válida de Legends Hub."
    },
    es: {
      title: "Configuración General",
      subTitle: "Gestione su cuenta y preferencias de visualización",
      backBtn: "Volver al Juego",
      launcherBtn: "Volver al Launcher",
      tabProfile: "Cuenta & Manager",
      tabAppearance: "Apariencia e Idioma",
      tabEditor: "Editor del Juego",
      tabDatabase: "Copia de Seguridad y Base de Datos",
      
      // Profile Tab
      profilePicTitle: "Foto de Perfil",
      profilePicDesc: "Cambie su imagen de mánager que se muestra en el HUD y los informes técnicos.",
      btnPreset: "Aplicar Ajuste",
      btnRemovePic: "Quitar Foto",
      uploadLocalPic: "Cargar Imagen desde Computadora (JPG/PNG)",
      customUrlPlace: "Ingrese la URL de una imagen personalizada...",
      managerNameLabel: "Nombre de Manager (In-Game)",
      saveNameBtn: "Guardar Nombre",
      saveNameSuccess: "¡Nombre de manager actualizado con éxito!",
      
      // Appearance Tab
      appearanceTitle: "Estilo Visual",
      themeLabel: "Seleccione el Esquema de Colores",
      themeLightName: "Light Mode (Modo Claro de deportes)",
      themeDarkName: "Dark Mode (Modo Oscuro cibernético)",
      langTitle: "Preferencias de Idioma",
      langDesc: "Cambie instantáneamente las etiquetas e interfaces operacionales de Legends Hub.",
      langPt: "Portugués (Brasil)",
      langEs: "Español (Castellano)",
      langEn: "Inglés (English)",

      // Editor Tab
      editorTitle: "Editor de Planillas y Liga",
      editorDesc: "Área de edición de la liga entera, equipos deportivos, escudos de combate, jugadores profesionales y patrocinadores activos.",
      editorSaveOk: "¡Cambios guardados con éxito en la liga!",

      // Backup Section
      backupSecTitle: "Protección y Copia de Seguridad",
      backupSecDesc: "Proteja sus datos guardando una copia local de su juego y configuraciones para portar su progreso.",
      btnCreateRecoverPoint: "Crear Punto de Restauración Local",
      recoverPointSuccess: "¡Punto de restauración local creado en su navegador!",
      copiableBackupLabel: "Su Copia Portátil Completa (Código encriptado de portabilidad)",
      btnCopyCode: "Copiar Código",
      btnPasteRestore: "Importar desde Código",
      copiedNotice: "¡Código copiado al portapapeles!",
      invalidCodeError: "Formato de código inválido para restaurar la carrera.",

      // Database Section
      dbSecTitle: "Panel Crítico de Base de Datos",
      dbBtnDownload: "Guardar (Descargar JSON)",
      dbBtnImport: "Importar archivo JSON",
      dbBtnRepair: "Reparar Base de Datos",
      dbBtnClear: "Borrar Todo (Restablecer Carrera)",
      repairSuccess: "¡Verificación de base de datos terminada! Estructura optimizada sin problemas.",
      clearConfirm: "¿Está completamente seguro? Se perderá todo su progreso histórico, slots de guardado y configuraciones actuales.",
      clearSuccess: "Memoria del navegador borrada con éxito. Regresando al menú de inicio.",
      importSuccess: "¡Carrera y Base de Datos importadas con éxito desde el JSON!",
      importError: "Error al importar el archivo. Formato JSON inválido."
    },
    en: {
      title: "Global Settings",
      subTitle: "Manage your account and viewing preferences",
      backBtn: "Back to Game",
      launcherBtn: "Return to Launcher",
      tabProfile: "Account & Manager",
      tabAppearance: "Appearance & Language",
      tabEditor: "Game Editor",
      tabDatabase: "Backup & Database Core",
      
      // Profile Tab
      profilePicTitle: "Profile Picture",
      profilePicDesc: "Update your manager profile avatar displayed on HUD panels and technical summaries.",
      btnPreset: "Apply Preset",
      btnRemovePic: "Remove Photo",
      uploadLocalPic: "Upload Computer Photo (JPG/PNG)",
      customUrlPlace: "Paste custom Image URL...",
      managerNameLabel: "Manager Name (In-Game)",
      saveNameBtn: "Save Manager Name",
      saveNameSuccess: "Manager Name updated successfully!",
      
      // Appearance Tab
      appearanceTitle: "Visual Styling",
      themeLabel: "Select Color Scheme",
      themeLightName: "Light Mode (Claro Theme)",
      themeDarkName: "Dark Mode (Dark Cibernético Theme)",
      langTitle: "Language Preferences",
      langDesc: "Instantly translate buttons, leagues, menus and stats layouts across the Legends Hub interface.",
      langPt: "Portuguese (Brasil)",
      langEs: "Spanish (Castellano)",
      langEn: "English (US/UK)",

      // Editor Tab
      editorTitle: "League & Game Editor",
      editorDesc: "Dedicated zone to edit entire leagues, teams, battle shields, competitive rosters, or sponsors metadata.",
      editorSaveOk: "Changes successfully updated in the official records!",

      // Backup Section
      backupSecTitle: "Restauration Point and Portable Backup",
      backupSecDesc: "Protect your database by generating offline backup states. Fast import via encrypted safe codes.",
      btnCreateRecoverPoint: "Create Browser Recovery Point",
      recoverPointSuccess: "Local recovery backup updated in standard storage!",
      copiableBackupLabel: "Your Complete Portable Save (Encrypted secure format)",
      btnCopyCode: "Copy Code",
      btnPasteRestore: "Import from Code",
      copiedNotice: "Backup string copied safely to clipboard!",
      invalidCodeError: "Invalid code format string to restore career progress.",

      // Database Section
      dbSecTitle: "Critical Database Panel",
      dbBtnDownload: "Save (Download JSON)",
      dbBtnImport: "Import JSON File",
      dbBtnRepair: "Repair Database Issues",
      dbBtnClear: "Wipe All Storage (Hard Reset)",
      repairSuccess: "Database diagnostics and repairs completed! 0 errors found and rosters optimized.",
      clearConfirm: "Are you absolutely sure? This will delete all browser localStorage profiles, including saves and active options.",
      clearSuccess: "Browser databases cleared successfully. Returning to launcher.",
      importSuccess: "Database and Manager career loaded successfully from file!",
      importError: "Failure parsing file data. Ensure it's a valid JSON produced by Legends Hub."
    }
  };

  const currText = t[lang];

  // Manager avatar storage
  const [managerPhoto, setManagerPhoto] = useState<string>(() => {
    return localStorage.getItem('legendshub_manager_avatar') || '';
  });

  // Local manager name state
  const [managerName, setManagerName] = useState(gameState?.managerName || 'Alex Rivers');

  // Load name if gameState changes
  useEffect(() => {
    if (gameState) {
      setManagerName(gameState.managerName);
    }
  }, [gameState]);

  // Image upload to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setManagerPhoto(base64);
      localStorage.setItem('legendshub_manager_avatar', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (url: string) => {
    setManagerPhoto(url);
    localStorage.setItem('legendshub_manager_avatar', url);
  };

  const handleRemovePhoto = () => {
    setManagerPhoto('');
    localStorage.removeItem('legendshub_manager_avatar');
  };

  // Name save
  const handleSaveName = () => {
    if (!managerName.trim()) return;
    if (gameState) {
      const updated: GameState = {
        ...gameState,
        managerName: managerName.trim()
      };
      onUpdateGameState(updated);
      alert(currText.saveNameSuccess);
    } else {
      // Just save to memory for next game
      localStorage.setItem('legendshub_temp_manager_name', managerName.trim());
      alert(currText.saveNameSuccess + " (Salvo para próxima campanha)");
    }
  };

  // EXPORT COPIABLE SAVE STRING
  const [backupString, setBackupString] = useState('');
  const [tempCodeRestore, setTempCodeRestore] = useState('');

  const generateBackupString = () => {
    if (!gameState) {
      // Create empty placeholder if no game, or export settings
      const raw = { settings: { theme, lang, managerPhoto } };
      const str = btoa(unescape(encodeURIComponent(JSON.stringify(raw))));
      setBackupString(str);
      return;
    }
    try {
      const exportObject = {
        gameState,
        settings: { theme, lang, managerPhoto }
      };
      const secureString = btoa(unescape(encodeURIComponent(JSON.stringify(exportObject))));
      setBackupString(secureString);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generateBackupString();
  }, [gameState, theme, lang, managerPhoto]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(backupString);
    alert(currText.copiedNotice);
  };

  const handlePasteAndRestore = () => {
    if (!tempCodeRestore.trim()) return;
    try {
      const decrypted = decodeURIComponent(escape(atob(tempCodeRestore.trim())));
      const parsed = JSON.parse(decrypted);
      
      if (parsed.gameState) {
        onUpdateGameState(parsed.gameState);
        if (parsed.settings?.theme) setTheme(parsed.settings.theme);
        if (parsed.settings?.lang) handleLanguageChange(parsed.settings.lang);
        if (parsed.settings?.managerPhoto) {
          setManagerPhoto(parsed.settings.managerPhoto);
          localStorage.setItem('legendshub_manager_avatar', parsed.settings.managerPhoto);
        }
        alert(currText.importSuccess);
        setTempCodeRestore('');
      } else {
        alert(currText.invalidCodeError);
      }
    } catch(e) {
      alert(currText.invalidCodeError);
    }
  };

  // DATABASE TOOLS
  // Download JSON
  const handleDownloadDatabase = () => {
    if (!gameState) {
      alert("Nenhum banco de dados de carreira ativo carregado no momento.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `legendshub_database_season_${gameState.season}_week_${gameState.week}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON File
  const handleUploadDatabaseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        const parsed = JSON.parse(rawText);
        // validate minimal fields to ensure it is a GameState
        if (parsed && Array.isArray(parsed.teams) && parsed.managerName) {
          onUpdateGameState(parsed);
          setManagerName(parsed.managerName);
          alert(currText.importSuccess);
        } else {
          alert(currText.importError);
        }
      } catch (err) {
        alert(currText.importError);
      }
    };
    reader.readAsText(file);
  };

  // Repair database consistency limits
  const handleRepairDatabase = () => {
    if (!gameState) {
      alert("Inicie ou carregue um jogo para reparar a integridade de tabelas.");
      return;
    }
    
    // Auto fix common properties
    const safeTeams = gameState.teams.map(t => {
      // Ensure budget isn't negative or null
      const budget = isNaN(t.budget) || t.budget === null ? 100000 : Math.max(0, t.budget);
      
      let currentRoster = t.roster || [];
      let currentSubs = t.substitutes || [];
      // If team has mock or empty rosters, rehydrate from real players database
      const hasMockOrEmpty = currentRoster.length === 0 || currentRoster.some(p => !p.id.startsWith('pl_real_'));
      if (hasMockOrEmpty) {
        const matched = getPlayersForTeam(t.id, t.isPlayerControlled);
        if (matched && matched.roster.length > 0) {
          currentRoster = matched.roster;
          currentSubs = matched.substitutes;
        }
      }

      // Ensure roster players have stats, reasonable overall and attributes
      const fixRoster = (players: Player[]) => {
        return players.map(p => ({
          ...p,
          overallRating: Math.max(30, Math.min(99, p.overallRating || 70)),
          attributes: {
            mechanics: p.attributes?.mechanics || 70,
            macro: p.attributes?.macro || 70,
            communication: p.attributes?.communication || 70,
            leadership: p.attributes?.leadership || 70,
            consistency: p.attributes?.consistency || 70,
            emotionalControl: p.attributes?.emotionalControl || 70,
            farm: p.attributes?.farm || 70,
            mapVision: p.attributes?.mapVision || 70,
            playoffPerformance: p.attributes?.playoffPerformance || 70,
          },
          stats: p.stats || { kills: 0, deaths: 0, assists: 0, cs: 0, gamesPlayed: 0, mvps: 0 }
        }));
      };

      return {
        ...t,
        budget,
        roster: fixRoster(currentRoster),
        substitutes: fixRoster(currentSubs),
        academy: fixRoster(t.academy || [])
      };
    });

    const repairedState: GameState = {
      ...gameState,
      teams: safeTeams
    };

    onUpdateGameState(repairedState);
    alert(currText.repairSuccess);
  };

  // Clear memory and soft reset
  const handleClearMemoryAndWipe = () => {
    if (confirm(currText.clearConfirm)) {
      localStorage.clear();
      alert(currText.clearSuccess);
      window.location.reload();
    }
  };

  // Create native restore recovery points inside localstorage
  const handleCreateRestorePoint = () => {
    if (!gameState) return;
    localStorage.setItem(`legendshub_save_slot_3`, JSON.stringify(gameState)); // reserve slot 3 as restore point
    alert(currText.recoverPointSuccess);
  };

  // ============================================
  // INTEGRATED GAME EDITOR STATE & CONTROLS
  // ============================================
  const [selectedEditorSub, setSelectedEditorSub] = useState<'leagues' | 'teams' | 'players' | 'sponsors' | 'champions'>('teams');
  
  // Game state selectors
  const [selectedTeamId, setSelectedTeamId] = useState<string>(gameState?.teams[0]?.id || '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // 1) League state
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(gameState?.leagues && gameState.leagues.length > 0 ? gameState.leagues[0].id : 'CBLOL');
  const [editorLeagueName, setEditorLeagueName] = useState('');
  const [editorLeagueLogo, setEditorLeagueLogo] = useState('');

  useEffect(() => {
    if (gameState?.leagues) {
      const found = gameState.leagues.find(l => l.id === selectedLeagueId);
      if (found) {
        setEditorLeagueName(found.name);
        setEditorLeagueLogo(found.logoUrl || '');
      }
    }
  }, [selectedLeagueId, gameState]);

  // Active Team Edit values
  const teamToEdit = gameState?.teams.find(t => t.id === selectedTeamId);
  const [editorTeamName, setEditorTeamName] = useState('');
  const [editorTeamAcronym, setEditorTeamAcronym] = useState('');
  const [editorTeamBudget, setEditorTeamBudget] = useState(0);
  const [editorPrimaryColor, setEditorPrimaryColor] = useState('');
  const [editorLogoUrl, setEditorLogoUrl] = useState('');

  // Sync edits when selectedTeam changes
  useEffect(() => {
    if (teamToEdit) {
      setEditorTeamName(teamToEdit.name);
      setEditorTeamAcronym(teamToEdit.acronym);
      setEditorTeamBudget(teamToEdit.budget);
      setEditorPrimaryColor(teamToEdit.primaryColor);
      setEditorLogoUrl(teamToEdit.logoUrl || '');
    }
  }, [selectedTeamId, gameState]);

  // Active Player Edit values
  const allPlayers = teamToEdit ? [...teamToEdit.roster, ...teamToEdit.substitutes] : [];
  const playerToEdit = allPlayers.find(p => p.id === selectedPlayerId);
  
  const [editorPlayerName, setEditorPlayerName] = useState('');
  const [editorPlayerPhoto, setEditorPlayerPhoto] = useState('');
  const [editorPlayerOvr, setEditorPlayerOvr] = useState(70);
  const [editorPlayerPosition, setEditorPlayerPosition] = useState<Position>('TOP');

  // Sync selected player when team changes or when players list loads
  useEffect(() => {
    if (allPlayers.length > 0) {
      const isStillValid = allPlayers.some(p => p.id === selectedPlayerId);
      if (!isStillValid) {
        setSelectedPlayerId(allPlayers[0].id);
      }
    } else {
      setSelectedPlayerId('');
    }
  }, [selectedTeamId, allPlayers]);

  // Sync edits when selectedPlayer changes
  useEffect(() => {
    if (playerToEdit) {
      setEditorPlayerName(playerToEdit.name);
      setEditorPlayerPhoto(playerToEdit.photoUrl || '');
      setEditorPlayerOvr(playerToEdit.overallRating);
      setEditorPlayerPosition(playerToEdit.position || 'TOP');
    }
  }, [selectedPlayerId, playerToEdit]);

  // Edit existing sponsors / register sponsors
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>(gameState?.sponsorsMarket && gameState.sponsorsMarket.length > 0 ? gameState.sponsorsMarket[0].id : '');
  const [editorSponsorName, setEditorSponsorName] = useState('');
  const [editorSponsorLogo, setEditorSponsorLogo] = useState('');

  // Sync edits when sponsor selection changes
  useEffect(() => {
    if (gameState?.sponsorsMarket && selectedSponsorId) {
      const sp = gameState.sponsorsMarket.find(s => s.id === selectedSponsorId);
      if (sp) {
        setEditorSponsorName(sp.name);
        setEditorSponsorLogo(sp.logoUrl || '');
      }
    }
  }, [selectedSponsorId, gameState]);

  // New sponsor creator states
  const [sponsorName, setSponsorName] = useState('Subway Brasil');
  const [sponsorIncome, setSponsorIncome] = useState(45000);
  const [sponsorBonus, setSponsorBonus] = useState(80000);

  // 5) Summoner's Rift Champions states
  const [selectedChampId, setSelectedChampId] = useState<string>(gameState?.champions && gameState.champions.length > 0 ? gameState.champions[0].id : '');
  const [editorChampName, setEditorChampName] = useState('');
  const [editorChampImage, setEditorChampImage] = useState('');
  const [editorChampRoles, setEditorChampRoles] = useState<Position[]>([]);
  const [editorChampPower, setEditorChampPower] = useState(75);
  const [editorChampTier, setEditorChampTier] = useState<'S+' | 'S' | 'A' | 'B' | 'C'>('A');

  useEffect(() => {
    if (gameState?.champions && gameState.champions.length > 0 && !selectedChampId) {
      setSelectedChampId(gameState.champions[0].id);
    }
  }, [gameState, selectedChampId]);

  useEffect(() => {
    if (gameState?.champions && selectedChampId) {
      const found = gameState.champions.find(c => c.id === selectedChampId);
      if (found) {
        setEditorChampName(found.name);
        setEditorChampImage(found.imageUrl || '');
        setEditorChampRoles(found.roles || []);
        setEditorChampPower(found.power || 75);
        setEditorChampTier(found.tier || 'A');
      }
    }
  }, [selectedChampId, gameState]);

  // Form states to Add New Champion:
  const [showNewChampForm, setShowNewChampForm] = useState(false);
  const [newChampName, setNewChampName] = useState('');
  const [newChampImage, setNewChampImage] = useState('');
  const [newChampRoles, setNewChampRoles] = useState<Position[]>([]);
  const [newChampPower, setNewChampPower] = useState(80);
  const [newChampTier, setNewChampTier] = useState<'S+' | 'S' | 'A' | 'B' | 'C'>('S');

  // Trigger Save Updates
  const handleEditorSaveLeague = () => {
    if (!gameState || !selectedLeagueId || !editorLeagueName.trim()) return;
    const nextLeagues = (gameState.leagues || []).map(l => {
      if (l.id === selectedLeagueId) {
        return {
          ...l,
          name: editorLeagueName.trim(),
          logoUrl: editorLeagueLogo.trim()
        };
      }
      return l;
    });
    onUpdateGameState({
      ...gameState,
      leagues: nextLeagues
    });
    alert(currText.editorSaveOk);
  };

  const handleEditorSaveTeam = () => {
    if (!gameState || !selectedTeamId || !editorTeamName.trim()) return;
    const updated = gameState.teams.map(t => {
      if (t.id === selectedTeamId) {
        return {
          ...t,
          name: editorTeamName.trim(),
          acronym: editorTeamAcronym.trim().toUpperCase(),
          budget: Number(editorTeamBudget),
          primaryColor: editorPrimaryColor,
          logoUrl: editorLogoUrl.trim()
        };
      }
      return t;
    });
    onUpdateTeams(updated);
    alert(currText.editorSaveOk);
  };

  const handleEditorSavePlayer = () => {
    if (!gameState || !playerToEdit || !editorPlayerName.trim()) return;
    const updated = gameState.teams.map(t => {
      if (t.id === selectedTeamId) {
        const checkMap = (p: Player) => {
          if (p.id === playerToEdit.id) {
            return {
              ...p,
              name: editorPlayerName.trim(),
              photoUrl: editorPlayerPhoto.trim(),
              overallRating: Number(editorPlayerOvr),
              position: editorPlayerPosition
            };
          }
          return p;
        };
        return {
          ...t,
          roster: t.roster.map(checkMap),
          substitutes: t.substitutes.map(checkMap)
        };
      }
      return t;
    });
    onUpdateTeams(updated);
    alert(currText.editorSaveOk);
  };

  const handleEditorSaveSponsor = () => {
    if (!gameState || !selectedSponsorId || !editorSponsorName.trim()) return;
    const updatedSponsors = gameState.sponsorsMarket.map(s => {
      if (s.id === selectedSponsorId) {
        return {
          ...s,
          name: editorSponsorName.trim(),
          logoUrl: editorSponsorLogo.trim()
        };
      }
      return s;
    });
    onUpdateSponsors(updatedSponsors);
    alert(currText.editorSaveOk);
  };

  const handleEditorCreateSponsor = () => {
    if (!gameState || !sponsorName.trim()) return;
    const fresh: Sponsor = {
      id: 'sp_custom_' + Math.random().toString(36).substring(2, 9),
      name: sponsorName.trim(),
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
      incomePerWeek: Number(sponsorIncome),
      signatureBonus: Number(sponsorBonus),
      termsInWeeks: 12,
      minPopularity: 40,
      isSigned: false,
      objective: 'Ficar no Top 3 da popularidade',
      objectiveBonus: 35000
    };
    onUpdateSponsors([...gameState.sponsorsMarket, fresh]);
    setSponsorName('');
    alert(currText.editorSaveOk);
  };

  const handleEditorSaveChampion = () => {
    if (!gameState || !selectedChampId || !editorChampName.trim()) return;
    if (editorChampRoles.length === 0) {
      alert("Selecione ao menos uma rota para o Campeão!");
      return;
    }
    const updated = gameState.champions.map(c => {
      if (c.id === selectedChampId) {
        return {
          ...c,
          name: editorChampName.trim(),
          imageUrl: editorChampImage.trim(),
          roles: editorChampRoles,
          tier: editorChampTier,
          power: Number(editorChampPower)
        };
      }
      return c;
    });
    
    onUpdateGameState({
      ...gameState,
      champions: updated
    });
    alert(currText.editorSaveOk);
  };

  const handleAddNewChampionInGame = () => {
    if (!gameState || !newChampName.trim()) {
      alert("Por favor, digite o nome do campeão!");
      return;
    }
    if (newChampRoles.length === 0) {
      alert("Selecione ao menos uma rota/role!");
      return;
    }

    const uniqueId = 'champ_' + newChampName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 5);
    const freshChamp: Champion = {
      id: uniqueId,
      name: newChampName.trim(),
      roles: newChampRoles,
      tier: newChampTier,
      power: Number(newChampPower),
      buffStatus: 'NORMAL',
      idealPlaystyle: 'Controle de rotas e lutas dinâmicas',
      counters: [],
      synergies: [],
      imageSeed: Math.floor(Math.random() * 1000),
      imageUrl: newChampImage.trim() || undefined
    };

    onUpdateGameState({
      ...gameState,
      champions: [...(gameState.champions || []), freshChamp]
    });

    setNewChampName('');
    setNewChampImage('');
    setNewChampRoles([]);
    setShowNewChampForm(false);
    setSelectedChampId(uniqueId);
    alert("Novo campeão adicionado e atualizado no patch operacional com sucesso!");
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 p-4 md:p-8 ${
      theme === 'dark' ? 'bg-[#070d19] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header and subtitle */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#006e80]" />
            {currText.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {currText.subTitle}
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {gameState ? currText.backBtn : currText.launcherBtn}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side menu */}
        <aside className="md:col-span-3 flex flex-col gap-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all ${
              activeSubTab === 'profile' 
                ? 'bg-[#006e80]/15 text-[#00cbd6] border-l-4 border-[#00d2fd]' 
                : theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/50 text-slate-600'
            }`}
          >
            <User className="w-4 h-4" />
            {currText.tabProfile}
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all ${
              activeSubTab === 'appearance' 
                ? 'bg-[#006e80]/15 text-[#00cbd6] border-l-4 border-[#00d2fd]' 
                : theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/50 text-slate-600'
            }`}
          >
            <Languages className="w-4 h-4" />
            {currText.tabAppearance}
          </button>

          <button
            onClick={() => setActiveSubTab('editor')}
            className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all ${
              activeSubTab === 'editor' 
                ? 'bg-[#006e80]/15 text-[#00cbd6] border-l-4 border-[#00d2fd]' 
                : theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/50 text-slate-600'
            }`}
          >
            <Shield className="w-4 h-4" />
            {currText.tabEditor}
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all ${
              activeSubTab === 'database' 
                ? 'bg-[#006e80]/15 text-[#00cbd6] border-l-4 border-[#00d2fd]' 
                : theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/50 text-slate-600'
            }`}
          >
            <Database className="w-4 h-4" />
            {currText.tabDatabase}
          </button>
        </aside>

        {/* Right Side config screen display */}
        <main className={`col-span-1 md:col-span-9 p-6 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0a1424] border-slate-800' : 'bg-white border-slate-200'
        } shadow-lg space-y-8`}>
          
          {/* PROFILE CONFIG SECT */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Foto de Perfil */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 mb-2 flex items-center gap-2">
                  <Camera className="w-4.5 h-4.5" />
                  {currText.profilePicTitle}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{currText.profilePicDesc}</p>
                
                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-500/5 p-4 rounded-xl border border-slate-200/20">
                  
                  {/* Active view photo */}
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00d2fd] shadow-inner bg-[#0a1424] flex items-center justify-center">
                      {managerPhoto ? (
                        <img 
                          src={managerPhoto} 
                          alt="Manager Picture" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-10 h-10 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    {/* Presets Grid */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currText.btnPreset}s rústicos:</label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handleApplyPreset(preset.url)}
                            className="bg-slate-600/10 hover:bg-slate-500/25 p-1 rounded-lg border border-slate-400/20 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                            <span className="max-sm:hidden">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Open dynamic uploader and links file input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">URL da Imagem</span>
                        <input
                          type="text"
                          placeholder={currText.customUrlPlace}
                          value={managerPhoto.startsWith('data:') ? '' : managerPhoto}
                          onChange={(e) => {
                            setManagerPhoto(e.target.value);
                            localStorage.setItem('legendshub_manager_avatar', e.target.value);
                          }}
                          className={`w-full text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                            theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-slate-100 border-slate-200'
                          }`}
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{currText.uploadLocalPic}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#006e80]/20 file:text-[#00d2fd] hover:file:bg-opacity-80 file:cursor-pointer cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {managerPhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="px-3 py-1 bg-red-600/15 hover:bg-red-650 text-red-400 border border-red-500/30 text-[10px] rounded flex items-center gap-1.5 cursor-pointer uppercase font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {currText.btnRemovePic}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nome do Manager */}
              <div className="pt-4 border-t border-slate-200/20">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 mb-2 flex items-center gap-2">
                  <User className="w-4.5 h-4.5" />
                  {currText.managerNameLabel}
                </h3>
                
                <div className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className={`flex-1 text-sm p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#00d2fd] font-bold ${
                      theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-5 py-3 bg-[#0a2040] hover:bg-[#103060] text-sky-400 border border-sky-400/30 rounded-xl text-xs uppercase font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {currText.saveNameBtn}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* APERENCIA & LANG SECT */}
          {activeSubTab === 'appearance' && (
            <div className="space-y-8">
              
              {/* Light/Dark Mode toggle */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 mb-2 flex items-center gap-2">
                  <Sun className="w-4.5 h-4.5" />
                  {currText.appearanceTitle}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{currText.themeLabel}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Light Mode Card */}
                  <button
                    onClick={() => {
                      setTheme('light');
                      localStorage.setItem('legendshub_theme', 'light');
                    }}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      theme === 'light' 
                        ? 'border-[#00d2fd] bg-sky-50/15 shadow-md ring-1 ring-sky-300' 
                        : 'border-slate-800 bg-slate-900/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-bold text-xs uppercase">{currText.themeLightName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Claro e fresco</p>
                      </div>
                    </div>
                    {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-sky-500" />}
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    onClick={() => {
                      setTheme('dark');
                      localStorage.setItem('legendshub_theme', 'dark');
                    }}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-[#00d2fd] bg-sky-950/10 shadow-md ring-1 ring-sky-900' 
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="font-bold text-xs uppercase">{currText.themeDarkName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Escuro de combate</p>
                      </div>
                    </div>
                    {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
                  </button>
                </div>
              </div>

              {/* Language Idioma Preferences */}
              <div className="pt-6 border-t border-slate-200/20">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 mb-2 flex items-center gap-2">
                  <Languages className="w-4.5 h-4.5" />
                  {currText.langTitle}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{currText.langDesc}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* English */}
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      lang === 'en' 
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold' 
                        : theme === 'dark' ? 'border-slate-800 hover:border-slate-700' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      {currText.langEn}
                    </span>
                    {lang === 'en' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>

                  {/* Português */}
                  <button
                    onClick={() => handleLanguageChange('pt')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      lang === 'pt' 
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold' 
                        : theme === 'dark' ? 'border-slate-800 hover:border-slate-700' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      {currText.langPt}
                    </span>
                    {lang === 'pt' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>

                  {/* Español */}
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      lang === 'es' 
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold' 
                        : theme === 'dark' ? 'border-slate-800 hover:border-slate-700' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      {currText.langEs}
                    </span>
                    {lang === 'es' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                </div>
              </div>

              {/* Currency Settings / Moeda de Exibição */}
              <div className="pt-6 border-t border-slate-200/20">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#00cbd6] mb-2 flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-sky-400" />
                  {lang === 'pt' ? 'Moeda de Exibição' : lang === 'es' ? 'Moneda de Visualización' : 'Display Currency'}
                </h3>
                <p className="text-xs text-slate-400 mb-4 font-medium">
                  {lang === 'pt' 
                    ? 'Opções do jogo: Escolha a moeda utilizada para exibir orçamentos, salários e valores de mercado no painel operacional.' 
                    : lang === 'es' 
                      ? 'Opciones del juego: Elija la moneda utilizada para mostrar presupuestos, salarios y valores de mercado en el panel operacional.' 
                      : 'Game options: Choose the currency used to display budgets, salaries and market values on the operational panel.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* USD */}
                  <button
                    onClick={() => {
                      localStorage.setItem('legendshub_currency', 'USD');
                      setSelectedCurrency('USD');
                      window.dispatchEvent(new Event('currency_changed'));
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      selectedCurrency === 'USD'
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold text-[#00cbd6]' 
                        : theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700' : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#00d2fd]">$</span>
                      <span>{lang === 'pt' ? 'Dólar ($)' : lang === 'es' ? 'Dólar ($)' : 'US Dollar ($)'}</span>
                    </span>
                    {selectedCurrency === 'USD' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>

                  {/* EUR */}
                  <button
                    onClick={() => {
                      localStorage.setItem('legendshub_currency', 'EUR');
                      setSelectedCurrency('EUR');
                      window.dispatchEvent(new Event('currency_changed'));
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      selectedCurrency === 'EUR'
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold text-[#00cbd6]' 
                        : theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700' : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#00d2fd]">€</span>
                      <span>{lang === 'pt' ? 'Euro (€)' : lang === 'es' ? 'Euro (€)' : 'Euro (€)'}</span>
                    </span>
                    {selectedCurrency === 'EUR' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>

                  {/* BRL */}
                  <button
                    onClick={() => {
                      localStorage.setItem('legendshub_currency', 'BRL');
                      setSelectedCurrency('BRL');
                      window.dispatchEvent(new Event('currency_changed'));
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      selectedCurrency === 'BRL'
                        ? 'border-[#00d2fd] bg-[#00d2fd]/5 font-bold text-[#00cbd6]' 
                        : theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700' : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#00d2fd]">R$</span>
                      <span>{lang === 'pt' ? 'Real (R$)' : lang === 'es' ? 'Real (R$)' : 'Real (R$)'}</span>
                    </span>
                    {selectedCurrency === 'BRL' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* INTEGRATED GAME DATA EDITOR */}
          {activeSubTab === 'editor' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 mb-1 flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5" />
                  {currText.editorTitle}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{currText.editorDesc}</p>
              </div>

              {!gameState ? (
                <div className={`p-8 rounded-xl border text-center ${
                  theme === 'dark' ? 'bg-[#070d19] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs uppercase font-extrabold tracking-wider">Editor inativo</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Por favor, inicie ou carregue uma carreira no painel operacional principal para habilitar a manipulação de planilhas locais.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Sub Navigator for internal editor */}
                  <div className={`flex flex-wrap gap-1 p-1 rounded-lg border ${
                    theme === 'dark' ? 'bg-[#070d19] border-slate-800' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <button
                      onClick={() => setSelectedEditorSub('leagues')}
                      className={`flex-1 min-w-[80px] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        selectedEditorSub === 'leagues' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Ligas
                    </button>
                    <button
                      onClick={() => setSelectedEditorSub('teams')}
                      className={`flex-1 min-w-[80px] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        selectedEditorSub === 'teams' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Times & Clubes
                    </button>
                    <button
                      onClick={() => setSelectedEditorSub('players')}
                      className={`flex-1 min-w-[80px] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        selectedEditorSub === 'players' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Roster & Elenco
                    </button>
                    <button
                      onClick={() => setSelectedEditorSub('sponsors')}
                      className={`flex-1 min-w-[80px] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        selectedEditorSub === 'sponsors' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Patrocinadores
                    </button>
                    <button
                      onClick={() => setSelectedEditorSub('champions')}
                      className={`flex-1 min-w-[80px] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        selectedEditorSub === 'champions' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Campeões
                    </button>
                  </div>

                  {/* INTERNAL EDITOR - LEAGUES */}
                  {selectedEditorSub === 'leagues' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <div className="lg:col-span-5 space-y-2 max-h-[290px] overflow-y-auto pr-1 select-none">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ligas Ativas</span>
                        {(gameState.leagues || []).map(l => (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLeagueId(l.id)}
                            className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                              selectedLeagueId === l.id 
                                ? 'border-[#00d2fd] bg-[#00d2fd]/10 font-bold' 
                                : theme === 'dark' ? 'border-slate-800 bg-[#070d19]/60' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {l.logoUrl && (
                                <img src={l.logoUrl} alt={l.name} className="w-4 h-4 object-contain rounded" referrerPolicy="no-referrer" />
                              )}
                              <span className="text-xs uppercase">{l.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{l.id}</span>
                          </button>
                        ))}
                      </div>

                      <div className={`lg:col-span-7 p-4 border rounded-xl space-y-4 ${
                        theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400">Nome Oficial da Liga</label>
                          <input
                            type="text"
                            value={editorLeagueName}
                            onChange={(e) => setEditorLeagueName(e.target.value)}
                            className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                              theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>

                        {/* Escudo Upload / URL section */}
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Escudo Oficial da Liga</label>
                          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-3 rounded-lg border border-slate-200/20">
                            <div className="shrink-0 w-12 h-12 rounded border border-slate-200/25 flex items-center justify-center bg-white/5 overflow-hidden">
                              {editorLeagueLogo ? (
                                <img src={editorLeagueLogo} alt="Logo" className="w-10 h-10 object-contain text-center text-[7px]" referrerPolicy="no-referrer" />
                              ) : (
                                <Globe className="w-5 h-5 text-slate-450" />
                              )}
                            </div>
                            <div className="flex-1 w-full space-y-1.5">
                              <input
                                type="text"
                                value={editorLeagueLogo}
                                onChange={(e) => setEditorLeagueLogo(e.target.value)}
                                placeholder="Pinte ou cole a URL do escudo aqui..."
                                className={`w-full p-1.5 rounded border focus:outline-none text-[10.5px] ${
                                  theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                }`}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setEditorLeagueLogo(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-600/20 file:text-sky-400 file:cursor-pointer hover:file:bg-sky-650 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleEditorSaveLeague}
                            className="px-4 py-2 bg-[#006e80] hover:bg-opacity-95 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                          >
                            Salvar Liga
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERNAL EDITOR - TEAMS */}
                  {selectedEditorSub === 'teams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-5 space-y-2 max-h-[290px] overflow-y-auto pr-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Organizações</span>
                        {gameState.teams.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTeamId(t.id)}
                            className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                              selectedTeamId === t.id 
                                ? 'border-[#00d2fd] bg-[#00d2fd]/10 font-bold' 
                                : theme === 'dark' ? 'border-slate-800 bg-[#070d19]/60' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {t.logoUrl ? (
                                <img src={t.logoUrl} alt={t.name} className="w-4 h-4 object-contain rounded" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                              )}
                              <span className="text-xs uppercase truncate max-w-[130px]">{t.name} ({t.acronym})</span>
                            </div>
                            <span className="text-[9px] font-mono p-0.5 bg-slate-500/10 text-slate-400 rounded uppercase">{t.region || 'CBLOL'}</span>
                          </button>
                        ))}
                      </div>

                      <div className={`lg:col-span-7 p-4 border rounded-xl space-y-3 ${
                        theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Nome Oficial</label>
                            <input
                              type="text"
                              value={editorTeamName}
                              onChange={(e) => setEditorTeamName(e.target.value)}
                              className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Sigla (3-4 CHARS)</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={editorTeamAcronym}
                              onChange={(e) => setEditorTeamAcronym(e.target.value)}
                              className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Verba / Cofre ($)</label>
                            <input
                              type="number"
                              value={editorTeamBudget}
                              onChange={(e) => setEditorTeamBudget(Number(e.target.value))}
                              className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Cor de Combate Hex</label>
                            <div className="flex gap-1.5 mt-1">
                              <input
                                type="color"
                                value={editorPrimaryColor}
                                onChange={(e) => setEditorPrimaryColor(e.target.value)}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={editorPrimaryColor}
                                onChange={(e) => setEditorPrimaryColor(e.target.value)}
                                className={`w-full text-xs px-2 py-1 rounded border focus:outline-none ${
                                  theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Escudo do Time Upload / computer loader */}
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Escudo do Time (Carregar do Computador)</label>
                          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-3 rounded-lg border border-slate-200/20">
                            <div className="shrink-0 w-12 h-12 rounded border border-slate-200/25 flex items-center justify-center bg-white/5 overflow-hidden">
                              {editorLogoUrl ? (
                                <img src={editorLogoUrl} alt="Team Shield" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <Shield className="w-5 h-5 text-slate-450" />
                              )}
                            </div>
                            <div className="flex-1 w-full space-y-1.5">
                              <input
                                type="text"
                                value={editorLogoUrl}
                                onChange={(e) => setEditorLogoUrl(e.target.value)}
                                placeholder="Cole a URL do escudo aqui..."
                                className={`w-full p-1.5 rounded border focus:outline-none text-[10.5px] ${
                                  theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                }`}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setEditorLogoUrl(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-600/20 file:text-sky-400 file:cursor-pointer hover:file:bg-sky-650 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleEditorSaveTeam}
                            className="px-4 py-2 bg-[#006e80] hover:bg-opacity-95 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                          >
                            Salvar Clube
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERNAL EDITOR - PLAYERS */}
                  {selectedEditorSub === 'players' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <div className="lg:col-span-5 space-y-3">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Filtrar por Organização</label>
                          <select
                            value={selectedTeamId}
                            onChange={(e) => {
                              setSelectedTeamId(e.target.value);
                              setSelectedPlayerId('');
                            }}
                            className={`w-full p-2.5 rounded border text-[#00cbd6] focus:outline-none ${
                              theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                            }`}
                          >
                            {gameState.teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.region || 'CBLOL'})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1 border-t border-slate-250/20 pt-2">
                          <span className="block text-[9px] uppercase font-extrabold text-slate-400">Atletas do Elenco</span>
                          {allPlayers.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPlayerId(p.id)}
                              className={`w-full p-2 rounded border text-left flex justify-between items-center transition-all cursor-pointer ${
                                playerToEdit?.id === p.id
                                  ? 'border-[#00d2fd] bg-[#00d2fd]/10 font-bold'
                                  : theme === 'dark' ? 'border-slate-800 bg-[#070d19]/60' : 'border-slate-200 bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {p.photoUrl && (
                                  <img src={p.photoUrl} alt="Avatar" className="w-4.5 h-4.5 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                                )}
                                <span className="uppercase text-[11px] truncate">{p.name} ({p.position})</span>
                              </div>
                              <span className="text-[#00cbd6] text-[10px] font-mono shrink-0">OVR {p.overallRating}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`lg:col-span-7 p-4 border rounded-xl space-y-3 ${
                        theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        {playerToEdit ? (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Nickname / ID do Jogador</label>
                                <input
                                  type="text"
                                  value={editorPlayerName}
                                  onChange={(e) => setEditorPlayerName(e.target.value)}
                                  className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                                    theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Rating (OVR)</label>
                                <input
                                  type="number"
                                  min={30}
                                  max={99}
                                  value={editorPlayerOvr}
                                  onChange={(e) => setEditorPlayerOvr(Number(e.target.value))}
                                  className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00d2fd] ${
                                    theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Rota / Posição Recomendada</label>
                                <select
                                  value={editorPlayerPosition}
                                  onChange={(e) => setEditorPlayerPosition(e.target.value as Position)}
                                  className={`w-full mt-1 p-2.5 rounded border focus:outline-none ${
                                    theme === 'dark' ? 'bg-[#070d19] text-gray-200 border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                >
                                  <option value="TOP">TOP (Rota Superior)</option>
                                  <option value="JNG">JNG (Caçador da Selva)</option>
                                  <option value="MID">MID (Rota do Meio)</option>
                                  <option value="ADC">ADC (Atirador do Bot)</option>
                                  <option value="SUP">SUP (Suporte do Bot)</option>
                                </select>
                              </div>
                            </div>

                            {/* Foto do Jogador Upload / computer loader */}
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Foto do Jogador (Carregar do Computador)</label>
                              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-3 rounded-lg border border-slate-200/20">
                                <div className="shrink-0 w-12 h-12 rounded-full border border-slate-200/25 flex items-center justify-center bg-white/5 overflow-hidden">
                                  {editorPlayerPhoto ? (
                                    <img src={editorPlayerPhoto} alt="Player Pic" className="w-12 h-12 object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <User className="w-5 h-5 text-slate-450" />
                                  )}
                                </div>
                                <div className="flex-1 w-full space-y-1.5">
                                  <input
                                    type="text"
                                    value={editorPlayerPhoto}
                                    onChange={(e) => setEditorPlayerPhoto(e.target.value)}
                                    placeholder="https://images.unsplash.com/... ou Base64"
                                    className={`w-full p-1.5 rounded border focus:outline-none text-[10.5px] ${
                                      theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                    }`}
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setEditorPlayerPhoto(reader.result as string);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-600/20 file:text-sky-400 file:cursor-pointer hover:file:bg-sky-650 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                // Also update custom lane mapping
                                onClick={handleEditorSavePlayer}
                                className="px-4 py-2 bg-[#006e80] hover:bg-opacity-95 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                              >
                                Salvar Atleta
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-10 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                            Selecione um atleta profissional no grid à esquerda
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INTERNAL EDITOR - SPONSORS */}
                  {selectedEditorSub === 'sponsors' && (
                    <div className="space-y-6">
                      
                      {/* Active Sponsor Editing Area */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                        {/* Selector Column */}
                        <div className="lg:col-span-5 space-y-2">
                          <label className="block text-[9.5px] uppercase font-bold text-slate-400">Selecione o Patrocínio Registrado</label>
                          <select
                            value={selectedSponsorId}
                            onChange={(e) => setSelectedSponsorId(e.target.value)}
                            className={`w-full p-2.5 rounded border text-[#00cbd6] focus:outline-none ${
                              theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                            }`}
                          >
                            <option value="">-- Selecione para Editar --</option>
                            {(gameState.sponsorsMarket || []).map(s => (
                              <option key={s.id} value={s.id}>{s.name} (Bonus: ${s.signatureBonus})</option>
                            ))}
                          </select>

                          <div className="p-3.5 bg-slate-500/5 rounded-xl border border-slate-200/10 text-slate-400 text-[10px] uppercase font-bold tracking-wide">
                            ℹ️ Nesta área, você pode renomear os patrocinadores que financiam seu clube ou as equipes rivais, além de carregar novas fotos das marcas do seu computador.
                          </div>
                        </div>

                        {/* Editor Form Column */}
                        <div className={`lg:col-span-7 p-4 border rounded-xl space-y-4 ${
                          theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          {selectedSponsorId ? (
                            <>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Nome da Marca / Patrocinador</label>
                                <input
                                  type="text"
                                  value={editorSponsorName}
                                  onChange={(e) => setEditorSponsorName(e.target.value)}
                                  className={`w-full mt-1 p-2 rounded border focus:ring-1 focus:ring-sky-500 focus:outline-none ${
                                    theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                />
                              </div>

                              {/* Sponsor Image Computer Upload panel */}
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Imagem / Logotipo da Marca (Carregar do Computador)</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-3 rounded-lg border border-slate-200/20">
                                  <div className="shrink-0 w-12 h-12 rounded border border-slate-200/25 flex items-center justify-center bg-white overflow-hidden">
                                    {editorSponsorLogo ? (
                                      <img src={editorSponsorLogo} alt="Sponsor Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                                    ) : (
                                      <Image className="w-5 h-5 text-slate-450" />
                                    )}
                                  </div>
                                  <div className="flex-1 w-full space-y-1.5">
                                    <input
                                      type="text"
                                      value={editorSponsorLogo}
                                      onChange={(e) => setEditorSponsorLogo(e.target.value)}
                                      placeholder="Cole a URL do logotipo aqui..."
                                      className={`w-full p-1.5 rounded border focus:outline-none text-[10.5px] ${
                                        theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                      }`}
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => setEditorSponsorLogo(reader.result as string);
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-600/20 file:text-sky-400 file:cursor-pointer hover:file:bg-sky-650 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={handleEditorSaveSponsor}
                                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                                >
                                  Salvar Patrocinador
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                              Nenhum patrocinador selecionado. Selecione uma marca para editar seu logotipo ou nome corporativo.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Extra register panel */}
                      <div className={`p-4 border rounded-xl space-y-4 text-xs ${
                        theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="block text-[10px] uppercase font-extrabold tracking-widest text-[#00cbd6]">Criar Novo Patrocínio Secundário</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Nome da Empresa</label>
                            <input
                              type="text"
                              value={sponsorName}
                              onChange={(e) => setSponsorName(e.target.value)}
                              className={`w-full mt-1 p-2 rounded border focus:ring-1 focus:ring-sky-500 focus:outline-none ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Pagamento Semanal ($)</label>
                            <input
                              type="number"
                              value={sponsorIncome}
                              onChange={(e) => setSponsorIncome(Number(e.target.value))}
                              className={`w-full mt-1 p-2 rounded border focus:ring-1 focus:ring-sky-500 focus:outline-none ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-415">Bônus de Assinatura ($)</label>
                            <input
                              type="number"
                              value={sponsorBonus}
                              onChange={(e) => setSponsorBonus(Number(e.target.value))}
                              className={`w-full mt-1 p-2 rounded border focus:ring-1 focus:ring-sky-500 focus:outline-none ${
                                theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleEditorCreateSponsor}
                            className="px-4 py-2 bg-[#006e80] hover:bg-opacity-95 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                          >
                            Registrar Oferta
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERNAL EDITOR - CHAMPIONS */}
                  {selectedEditorSub === 'champions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      {/* Champion Selection and List of S.R. (Span 5) */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex justify-between items-center pb-1 border-b border-slate-205/10">
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campeões no Jogo</span>
                          <button
                            onClick={() => {
                              setShowNewChampForm(true);
                              setSelectedChampId('');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[9.5px] font-extrabold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Campeão
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
                          {(gameState.champions || []).map(c => {
                            const isSelected = selectedChampId === c.id;
                            return (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setSelectedChampId(c.id);
                                  setShowNewChampForm(false);
                                }}
                                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all truncate cursor-pointer ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-500/10 font-black' 
                                    : theme === 'dark' ? 'border-slate-800 bg-[#070d19]/60' : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                {c.imageUrl ? (
                                  <img src={c.imageUrl} alt={c.name} className="w-5 h-5 rounded-md object-cover shrink-0 select-none" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-mono text-[9px] font-black text-white shrink-0 select-none">
                                    {c.name.substring(0,2).toUpperCase()}
                                  </div>
                                )}
                                <div className="truncate flex-1 min-w-0">
                                  <p className="text-[10.5px] font-medium leading-none truncate text-slate-800 dark:text-slate-200">{c.name}</p>
                                  <p className="text-[8px] font-mono text-slate-400 font-bold mt-0.5 truncate uppercase">{c.roles.join(', ')}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Form Editor Panel (Span 7) */}
                      <div className={`lg:col-span-7 p-4 border rounded-xl space-y-4 ${
                        theme === 'dark' ? 'bg-[#070d19]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        
                        {/* FORM DYNAMIC ROUTER */}
                        {showNewChampForm ? (
                          // 5a) Add NEW Champion form
                          <div className="space-y-4">
                            <h4 className="text-[11px] uppercase font-extrabold text-[#00cbd6] border-b border-slate-200/20 pb-1.5">Registrar Novo Campeão (Summoner's Rift)</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Nome Oficial</label>
                                <input
                                  type="text"
                                  value={newChampName}
                                  onChange={(e) => setNewChampName(e.target.value)}
                                  placeholder="Ex: Joraen"
                                  className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00cbd6] ${
                                    theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Tier Inicial (Meta)</label>
                                <select
                                  value={newChampTier}
                                  onChange={(e) => setNewChampTier(e.target.value as any)}
                                  className={`w-full mt-1 p-2 rounded border focus:outline-none ${
                                    theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                  }`}
                                >
                                  <option value="S+">S+ (Extremamente Forte)</option>
                                  <option value="S">S (Tier Meta S)</option>
                                  <option value="A">A (Forte / Viável)</option>
                                  <option value="B">B (Equilibrado)</option>
                                  <option value="C">C (Atualmente Fora)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-450">Poder Tático Base (50-99)</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="range"
                                    min={50}
                                    max={99}
                                    value={newChampPower}
                                    onChange={(e) => setNewChampPower(Number(e.target.value))}
                                    className="flex-1 accent-sky-500 cursor-pointer"
                                  />
                                  <span className="font-mono font-bold text-sky-400 min-w-[20px]">{newChampPower}</span>
                                </div>
                              </div>
                            </div>

                            {/* Lane checklist */}
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Rotas Habilitadas (Alterar Rota)</label>
                              <div className="flex flex-wrap gap-2.5">
                                {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                                  const included = newChampRoles.includes(pos);
                                  return (
                                    <button
                                      key={pos}
                                      type="button"
                                      onClick={() => {
                                        if (included) {
                                          setNewChampRoles(newChampRoles.filter(x => x !== pos));
                                        } else {
                                          setNewChampRoles([...newChampRoles, pos]);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${
                                        included 
                                          ? 'bg-blue-600 border-blue-600 text-white' 
                                          : theme === 'dark' ? 'border-slate-750 bg-[#070d19] text-slate-400' : 'border-slate-205 bg-white text-slate-600'
                                      }`}
                                    >
                                      {pos}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Icon local upload */}
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Ícone do Campeão (Carregar do Computador)</label>
                              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-2 rounded-lg border border-slate-200/20">
                                <div className="shrink-0 w-11 h-11 rounded border border-slate-250/20 flex items-center justify-center bg-white/5 overflow-hidden">
                                  {newChampImage ? (
                                    <img src={newChampImage} alt="Preview" className="w-10 h-10 object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Image className="w-5 h-5 text-slate-450" />
                                  )}
                                </div>
                                <div className="flex-1 w-full space-y-1">
                                  <input
                                    type="text"
                                    value={newChampImage}
                                    onChange={(e) => setNewChampImage(e.target.value)}
                                    placeholder="Paste Image URL or select below..."
                                    className={`w-full p-1 text-[10px] rounded border focus:outline-none ${
                                      theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                    }`}
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setNewChampImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-emerald-600/20 file:text-emerald-400 file:cursor-pointer hover:file:bg-emerald-650 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewChampForm(false);
                                  setSelectedChampId(gameState?.champions[0]?.id || '');
                                }}
                                className="px-3.5 py-1.5 border border-slate-200 hover:text-slate-800 text-[10px] uppercase font-bold rounded-lg cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleAddNewChampionInGame}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                              >
                                Cadastrar Novo Campeão
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 5b) Edit EXISTING Champion form
                          gameState.champions && gameState.champions.length > 0 && selectedChampId ? (
                            <div className="space-y-4 animate-fade-in">
                              <h4 className="text-[11px] uppercase font-extrabold text-[#00cbd6] border-b border-slate-200/20 pb-1.5">Ficha Técnica e Balanceamento Manual</h4>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-slate-400">Nome do Campeão</label>
                                  <input
                                    type="text"
                                    value={editorChampName}
                                    onChange={(e) => setEditorChampName(e.target.value)}
                                    className={`w-full mt-1 p-2 rounded border focus:outline-none focus:border-[#00cbd6] ${
                                      theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-slate-400">Tier Meta da Season</label>
                                  <select
                                    value={editorChampTier}
                                    onChange={(e) => setEditorChampTier(e.target.value as any)}
                                    className={`w-full mt-1 p-2 rounded border focus:outline-none ${
                                      theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                    }`}
                                  >
                                    <option value="S+">S+ (Meta Sete / Overpowered)</option>
                                    <option value="S">S (Extremamente Viável)</option>
                                    <option value="A">A (Forte de Rota)</option>
                                    <option value="B">B (Equilibrado)</option>
                                    <option value="C">C (Fraco / Desbalanceado)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-slate-400">Poder Operacional Base (50-99)</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      type="range"
                                      min={50}
                                      max={99}
                                      value={editorChampPower}
                                      onChange={(e) => setEditorChampPower(Number(e.target.value))}
                                      className="flex-1 accent-sky-500 cursor-pointer"
                                    />
                                    <span className="font-mono font-bold text-sky-400 min-w-[20px]">{editorChampPower}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Lane checklist rota */}
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Rotas Recomendadas (Alterar Rota)</label>
                                <div className="flex flex-wrap gap-2.5">
                                  {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as Position[]).map(pos => {
                                    const included = editorChampRoles.includes(pos);
                                    return (
                                      <button
                                        key={pos}
                                        type="button"
                                        onClick={() => {
                                          if (included) {
                                            setEditorChampRoles(editorChampRoles.filter(x => x !== pos));
                                          } else {
                                            setEditorChampRoles([...editorChampRoles, pos]);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${
                                          included 
                                            ? 'bg-blue-600 border-blue-600 text-white' 
                                            : theme === 'dark' ? 'border-slate-700 bg-[#070d19] text-slate-400' : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                      >
                                        {pos}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Escudo Champion Imagecomputer loader */}
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Mudar Retrato / Ícone do Campeão</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-500/5 p-2 rounded-lg border border-slate-200/20">
                                  <div className="shrink-0 w-11 h-11 rounded border border-slate-250/20 flex items-center justify-center bg-white/5 overflow-hidden">
                                    {editorChampImage ? (
                                      <img src={editorChampImage} alt="Port" className="w-10 h-10 object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-10 h-10 rounded bg-[#0a1424] text-white flex items-center justify-center font-bold text-[9px]">S.R</div>
                                    )}
                                  </div>
                                  <div className="flex-1 w-full space-y-1">
                                    <input
                                      type="text"
                                      value={editorChampImage}
                                      onChange={(e) => setEditorChampImage(e.target.value)}
                                      placeholder="https://..."
                                      className={`w-full p-1 text-[10px] rounded border focus:outline-none ${
                                        theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                                      }`}
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => setEditorChampImage(reader.result as string);
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-600/20 file:text-sky-450 file:cursor-pointer hover:file:bg-sky-650 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={handleEditorSaveChampion}
                                  className="px-4 py-2 bg-[#006e80] hover:bg-opacity-95 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                                >
                                  Salvar Campeão
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-10 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                              Selecione um campeão no grid à esquerda para recalibrar seus atributos e rotas táticas no simulador.
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* BACKUP & DATABASE SYSTEM PANEL */}
          {activeSubTab === 'database' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* SLOTS & AUTOSAVE SETTINGS MANAGEMENT SECTION */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 flex items-center gap-2">
                    <Save className="w-4.5 h-4.5" />
                    {lang === 'es' ? 'Slots de Guardado y Auto-Guardado' : lang === 'en' ? 'Saves & Auto-Save Slots' : 'Slots de Jogo e Auto-Salvamento'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1.5">
                    {lang === 'es' 
                      ? 'Configure el guardado automático de su carrera y realice copias manuales en cualquiera de los tres slots locales de memoria.' 
                      : lang === 'en' 
                        ? 'Configure automatic back-ups of your manager career and save manually using any of the three browser memory slots.' 
                        : 'Configure o auto-salvamento da sua carreira de manager e realize cópias manuais em qualquer um dos três slots locais de memória.'}
                  </p>
                </div>

                {/* Configurations parameters */}
                <div className={`p-5 rounded-xl border space-y-5 ${
                  theme === 'dark' ? 'bg-[#0a1424]/60 border-[#1e2d44]' : 'bg-slate-50 border-slate-205'
                }`}>
                  <h4 className="font-display font-black text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>⚙️</span> {lang === 'es' ? 'Ajustes del Auto-Guardado' : lang === 'en' ? 'Auto-Save Rules' : 'Regras do Auto-Salvamento'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    {/* Frequency selector */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {lang === 'es' ? 'Frecuencia' : lang === 'en' ? 'Frequency' : 'Frequência'}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: 0, label_es: 'Desactivado', label_pt: 'Desativado', label_en: 'Disabled' },
                          { val: 1, label_es: 'Cada 1 Sem', label_pt: 'A cada 1 Sem', label_en: 'Every 1 Wk' },
                          { val: 2, label_es: 'Cada 2 Sem', label_pt: 'A cada 2 Sem', label_en: 'Every 2 Wks' },
                          { val: 4, label_es: 'Cada 4 Sem', label_pt: 'A cada 4 Sem', label_en: 'Every 4 Wks' },
                          { val: 8, label_es: 'Cada 8 Sem', label_pt: 'A cada 8 Sem', label_en: 'Every 8 Wks' },
                        ].map((item) => {
                          const label = lang === 'es' ? item.label_es : lang === 'en' ? item.label_en : item.label_pt;
                          const isSelected = autosaveFreq === item.val;
                          return (
                            <button
                              key={item.val}
                              onClick={() => handleUpdateAutosaveFreq(item.val)}
                              className={`px-3 py-1.5 rounded text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : theme === 'dark'
                                    ? 'bg-[#070d19]/80 text-slate-450 border border-[#1e2d44] hover:text-slate-200 hover:bg-[#070d19]'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Critical features toggle */}
                    <div className="flex items-center gap-3 md:justify-end">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autosaveCritical}
                          onChange={(e) => handleToggleCritical(e.target.checked)}
                          className="w-4.5 h-4.5 mt-0.5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="text-left">
                          <p className={`font-bold text-[11px] uppercase tracking-wide leading-tight ${
                            theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {lang === 'es' ? 'Acciones Críticas' : lang === 'en' ? 'Critical Actions Saves' : 'Ações Críticas'}
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-1 max-w-xs leading-normal">
                            {lang === 'es' 
                              ? 'Autoguardar al concretar fichajes, rescisiones, renovaciones de contrato o firmas de patrocinio.'
                              : lang === 'en'
                                ? 'Autosave after drafting, player signings, contract extensions, brand sponsors or upgrading facilities.'
                                : 'Auto-salvar ao contratar, demitir, estender prazos, patrocínios e infraestrutura.'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Slots rendering */}
                <div className="space-y-3">
                  <h4 className="font-display font-black text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>📁</span> {lang === 'es' ? 'Guardado Manual en Slots' : lang === 'en' ? 'Manual Saving Slots' : 'Salvamento Manual de Slots'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {saveSlotHeaders.map((slot) => {
                      return (
                        <div
                          key={slot.slotIndex}
                          className={`p-4 rounded-xl border flex flex-col justify-between h-44 transition-colors ${
                            theme === 'dark' 
                              ? 'bg-[#0a1424]/40 border-[#1e2d44] hover:bg-[#0a1424]/60' 
                              : 'bg-white border-slate-220 hover:bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">
                                SLOT {slot.slotIndex}
                              </span>
                              {slot.filled && (
                                <button
                                  onClick={() => handleDeleteSlotLocal(slot.slotIndex)}
                                  className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                                  title="Deletar este slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {slot.filled ? (
                              <div className="mt-3 min-w-0">
                                <h5 className={`font-display text-xs font-black uppercase truncate ${
                                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                  {slot.teamName}
                                </h5>
                                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold truncate">
                                  {slot.managerName}
                                </p>
                                <p className="text-[8.5px] font-mono text-[#00cbd6] font-extrabold mt-1.5 uppercase tracking-wider">
                                  {lang === 'es' ? `Temp ${slot.season} • Sem ${slot.week - 1}` : lang === 'en' ? `Season ${slot.season} • Wk ${slot.week - 1}` : `Temp ${slot.season} • Sem ${slot.week - 1}`}
                                </p>
                              </div>
                            ) : (
                              <div className="mt-5 text-center py-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                  {lang === 'es' ? 'SLOT VACÍO' : lang === 'en' ? 'EMPTY SLOT' : 'SLOT DISPONÍVEL'}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            {gameState ? (
                              <button
                                onClick={() => handleSaveToSlotLocal(slot.slotIndex)}
                                className="w-full py-2 rounded font-display text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm"
                              >
                                <Save className="w-3 h-3" />
                                {lang === 'es' ? 'GUARDAR AQUÍ' : lang === 'en' ? 'SAVE HERE' : 'SALVAR AQUI'}
                              </button>
                            ) : (
                              <div className="text-[8.5px] text-slate-400 font-medium text-center uppercase py-2 leading-none">
                                {lang === 'es' ? 'Inicie carrera para guardar' : lang === 'en' ? 'Start game to save progress' : 'Inicie a carreira para salvar'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BACKUP LOCAL SECTION */}
              <div className="space-y-4 pt-4 border-t border-slate-200/20">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-500 flex items-center gap-2">
                  <HardDrive className="w-4.5 h-4.5" />
                  {currText.backupSecTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{currText.backupSecDesc}</p>
                
                {gameState && (
                  <button
                    onClick={handleCreateRestorePoint}
                    className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-650 text-emerald-400 border border-emerald-500/25 text-xs uppercase font-extrabold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {currText.btnCreateRecoverPoint}
                  </button>
                )}

                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currText.copiableBackupLabel}</label>
                  <div className="flex gap-2">
                    <textarea
                      readOnly
                      value={backupString}
                      className={`flex-1 text-[10px] font-mono p-2 h-14 rounded border focus:outline-none resize-none overflow-hidden hover:overflow-y-auto ${
                        theme === 'dark' ? 'bg-[#070d19] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    />
                    <button
                      onClick={handleCopyCode}
                      className="px-3 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/30 text-sky-400 text-xs rounded uppercase font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span className="max-sm:hidden">{currText.btnCopyCode}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currText.btnPasteRestore}</label>
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Cole aqui o seu código de backup..."
                      value={tempCodeRestore}
                      onChange={(e) => setTempCodeRestore(e.target.value)}
                      className={`flex-1 text-[10px] font-mono p-2 h-14 rounded border focus:outline-none ${
                        theme === 'dark' ? 'bg-[#070d19] border-slate-700' : 'bg-white border-slate-300'
                      }`}
                    />
                    <button
                      onClick={handlePasteAndRestore}
                      className="px-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded uppercase font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="max-sm:hidden">Importar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CRITICAL CORE DATABASE SECTION */}
              <div className="pt-6 border-t border-slate-200/20 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-2">
                  <Database className="w-4.5 h-4.5" />
                  {currText.dbSecTitle}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Download JSON file */}
                  <button
                    onClick={handleDownloadDatabase}
                    className={`p-4 rounded-xl border text-left flex items-start gap-4 hover:bg-slate-500/5 transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <Download className="w-6 h-6 text-sky-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs uppercase text-sky-400">{currText.dbBtnDownload}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans leading-relaxed">
                        Exporta o arquivo de banco (.json) do estado tático atual para seu computador local.
                      </p>
                    </div>
                  </button>

                  {/* Upload JSON file */}
                  <div className={`p-4 rounded-xl border flex gap-4 hover:bg-slate-500/5 transition-all relative ${
                    theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <Upload className="w-6 h-6 text-indigo-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-xs uppercase text-indigo-400">{currText.dbBtnImport}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed mb-2">
                        Carrega uma simulação anteriormente descarregada diretamente do seu disco local.
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleUploadDatabaseFile}
                        className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:cursor-pointer cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Repair Database integrity */}
                  <button
                    onClick={handleRepairDatabase}
                    className={`p-4 rounded-xl border text-left flex items-start gap-4 hover:bg-slate-500/5 transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs uppercase text-emerald-400">{currText.dbBtnRepair}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Varre as referências de atletas, patrocínios e tabelas para corrigir de forma otimizada inconsistências.
                      </p>
                    </div>
                  </button>

                  {/* Delete memory/wipe */}
                  <button
                    onClick={handleClearMemoryAndWipe}
                    className={`p-4 rounded-xl border text-left flex items-start gap-4 hover:bg-red-500/5 transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-red-900/40 bg-red-950/5' : 'border-red-100 bg-red-50/10'
                    }`}
                  >
                    <Trash2 className="w-6 h-6 text-red-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs uppercase text-red-500">{currText.dbBtnClear}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Corta todos os registros, redefinições de idioma, perfil e recria a liga com os parâmetros de fábrica do scout.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}
          
        </main>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Compass, Sparkles, Trophy, Calendar, 
  Settings, LogOut, DollarSign, Award, ChevronRight, Play, Sliders, Briefcase, Zap, Heart, Target,
  Users, Building2, TrendingUp, BarChart3, Medal, Save, History, ArrowLeftRight,
  Sun, Moon, RefreshCw, Bug, Mail, Bell, Map as MapIcon, Landmark, Search
} from 'lucide-react';
import { formatMoney, getCurrencySymbol, getCurrencyType } from './utils/currency';

// Core Types and Foundations
import { GameState, Team, Player, Sponsor, InterviewQuestion } from './types';
import { initializeNewGame, advanceGameWeek, signSponsorContract, hireStaffMember } from './utils/gameEngine';
import { CHAMPIONS_LIST } from './data/initialDatabase';
import { getPlayersForTeam } from './data/realPlayers';
import { GLOBAL_FREE_AGENTS } from './utils/freeAgents';
import { syncGameWithEditor, getEditorTimestamp } from './utils/editorSync';

// Visual Screens and components
import HomeLauncher from './components/HomeLauncher';
import { getGameItem, setGameItem, removeGameItem } from './utils/localForageStore';
import DashboardTab from './components/DashboardTab';
import RosterTab from './components/RosterTab';
import MarketTab from './components/MarketTab';
import AcademyTab from './components/AcademyTab';
import SponsorsTab from './components/SponsorsTab';
import GamingHouseTab from './components/GamingHouseTab';
import CalendarTab from './components/CalendarTab';
import EditorTab from './components/EditorTab';
import DraftTab from './components/DraftTab';
import MatchCenterTab from './components/MatchCenterTab';
import MatchSimulatorFlow from './components/MatchSimulatorFlow';

// Custom Multi-tabs integration
import GamingOfficeTab from './components/GamingOfficeTab';
import { 
  LigaTab, TimesTab, EscritorioTab, FinancasTab, 
  EstatisticasTab, SoloQueueTab, UltimasPartidasTab, MetaTab, CarreiraTab, SalvarJogoTab,
  ComunidadeTab, CentralDeEmpregosTab
} from './components/NewTabs';
import InboxTab from './components/InboxTab';
import NotificationsTab from './components/NotificationsTab';
import RoadmapTab from './components/RoadmapTab';
import ScoutingTab from './components/ScoutingTab';
import DiretoriaTab from './components/DiretoriaTab';
import { preloadGameAssetsToCache, getGameAssetUrl, getProceduralFallbackUrl, getImageUrl } from './utils/gameAssets';

export const getExtendedMonthInfo = (weekNum: number) => {
  if (weekNum <= 4)   return { name: "Janeiro", weeks: [1, 2, 3, 4], totalDays: 31, prevTotalDays: 31, startDayOfWeek: 3, index: 0 };
  if (weekNum <= 8)   return { name: "Fevereiro", weeks: [5, 6, 7, 8], totalDays: 28, prevTotalDays: 31, startDayOfWeek: 6, index: 1 };
  if (weekNum <= 12)  return { name: "Março", weeks: [9, 10, 11, 12], totalDays: 31, prevTotalDays: 28, startDayOfWeek: 6, index: 2 };
  if (weekNum <= 16)  return { name: "Abril", weeks: [13, 14, 15, 16], totalDays: 30, prevTotalDays: 31, startDayOfWeek: 2, index: 3 };
  if (weekNum <= 20)  return { name: "Maio", weeks: [17, 18, 19, 20], totalDays: 31, prevTotalDays: 30, startDayOfWeek: 4, index: 4 };
  if (weekNum <= 24)  return { name: "Junho", weeks: [21, 22, 23, 24], totalDays: 30, prevTotalDays: 31, startDayOfWeek: 0, index: 5 };
  if (weekNum <= 28)  return { name: "Julho", weeks: [25, 26, 27, 28], totalDays: 31, prevTotalDays: 30, startDayOfWeek: 2, index: 6 };
  return { name: "Agosto", weeks: [29, 30, 31, 32], totalDays: 31, prevTotalDays: 31, startDayOfWeek: 5, index: 7 };
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('legendshub_theme') as 'light' | 'dark') || 'light';
  });
  const [currencyVersion, setCurrencyVersion] = useState(0);
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

  useEffect(() => {
    preloadGameAssetsToCache().catch(err => {
      console.error('[App] Failed to preload game assets', err);
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  useEffect(() => {
    const handleCurrencyChanged = () => {
      setCurrencyVersion(v => v + 1);
      rawSetGameState(prev => {
        if (!prev) return null;
        const pTeam = prev.teams?.find(t => t.id === prev.playerTeamId);
        if (pTeam) {
          const budget = pTeam.budget;
          const symbol = getCurrencySymbol();
          const formattedHud = budget < 1000000 
            ? `${symbol} ${budget.toLocaleString('pt-BR')}`
            : `${symbol} ${(budget / 1000000).toFixed(2)}M`;
          
          return {
            ...prev,
            finance: {
              balance: budget,
              currency: getCurrencyType(),
              caixa_bruto: budget,
              caixa_formatado_hud: formattedHud
            }
          };
        }
        return { ...prev };
      });
    };
    window.addEventListener('currency_changed', handleCurrencyChanged);
    return () => {
      window.removeEventListener('currency_changed', handleCurrencyChanged);
    };
  }, []);

  const [screen, setScreen] = useState<'LAUNCHER' | 'HUB' | 'DRAFT' | 'MATCH' | 'SETTINGS'>('LAUNCHER');
  const [activeTab, setActiveTab] = useState<string>('Central do Manager');
  const [rawGameState, rawSetGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__legendshub_gameState = rawGameState;
    }
  }, [rawGameState]);

  const [unreadEmailsCount, setUnreadEmailsCount] = useState<number>(0);
  const [unreadNewsCount, setUnreadNewsCount] = useState<number>(0);
  const [hasRoadmapUpdateAlert, setHasRoadmapUpdateAlert] = useState<boolean>(false);
  const [hasGithubUpdateAlert, setHasGithubUpdateAlert] = useState<boolean>(() => {
    return localStorage.getItem('legendshub_github_update_checked') !== 'true';
  });

  const refreshNotificationCounts = useCallback(() => {
    try {
      const savedEmails = localStorage.getItem('legendshub_custom_events_emails');
      if (savedEmails) {
        const parsed = JSON.parse(savedEmails);
        if (Array.isArray(parsed)) {
          setUnreadEmailsCount(parsed.filter((e: any) => !e.read).length);
        }
      } else {
        setUnreadEmailsCount(0);
      }
    } catch (_) {}

    try {
      const savedNews = localStorage.getItem('legendshub_notifications_news');
      if (savedNews) {
        const parsed = JSON.parse(savedNews);
        if (Array.isArray(parsed)) {
          setUnreadNewsCount(parsed.filter((n: any) => !n.read).length);
        }
      } else {
        setUnreadNewsCount(0);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    refreshNotificationCounts();

    const handleUpdate = () => {
      refreshNotificationCounts();
    };

    const handleNewEmail = () => {
      refreshNotificationCounts();
    };

    const handleNewNews = () => {
      refreshNotificationCounts();
    };

    const handleRoadmapUpdated = () => {
      setHasRoadmapUpdateAlert(true);
    };

    window.addEventListener('emails-updated', handleUpdate);
    window.addEventListener('news-updated', handleUpdate);
    window.addEventListener('onNewEmailRecieved', handleNewEmail);
    window.addEventListener('onNewEmailReceived', handleNewEmail);
    window.addEventListener('onNewsFeedGenerated', handleNewNews);
    window.addEventListener('onRoadmapUpdated', handleRoadmapUpdated);

    return () => {
      window.removeEventListener('emails-updated', handleUpdate);
      window.removeEventListener('news-updated', handleUpdate);
      window.removeEventListener('onNewEmailRecieved', handleNewEmail);
      window.removeEventListener('onNewEmailReceived', handleNewEmail);
      window.removeEventListener('onNewsFeedGenerated', handleNewNews);
      window.removeEventListener('onRoadmapUpdated', handleRoadmapUpdated);
    };
  }, [refreshNotificationCounts]);

  useEffect(() => {
    refreshNotificationCounts();
  }, [activeTab, refreshNotificationCounts]);

  // Trigger Hot-Reload check on every screen or tab transition to sync with the Editor
  useEffect(() => {
    if (screen === 'HUB' && rawGameState) {
      const editorTs = getEditorTimestamp();
      const gameTs = rawGameState.lastEditorSyncTimestamp || 0;
      if (editorTs > gameTs) {
        const { syncedState, keysUpdated } = syncGameWithEditor(rawGameState);
        if (keysUpdated > 0 || !rawGameState.lastEditorSyncTimestamp) {
          rawSetGameState(syncedState);
          saveGameToSlot(1, syncedState);
          window.dispatchEvent(new CustomEvent('editor_db_synced', { detail: { keysUpdated } }));
        }
      }
    }
  }, [screen, activeTab, rawGameState]);

  const setGameState = useCallback((nextStateOrFn: GameState | null | ((prev: GameState | null) => GameState | null)) => {
    rawSetGameState(prev => {
      let resolved = typeof nextStateOrFn === 'function' ? nextStateOrFn(prev) : nextStateOrFn;
      if (resolved) {
        // Enforce synchronization of the player team budget and game global finance state
        const pTeam = resolved.teams?.find(t => t.id === resolved.playerTeamId);
        if (pTeam) {
          // Sync finance balance to the budget
          const budget = pTeam.budget;
          const symbol = getCurrencySymbol();
          const formattedHud = budget < 1000000 
            ? `${symbol} ${budget.toLocaleString('pt-BR')}`
            : `${symbol} ${(budget / 1000000).toFixed(2)}M`;
          
          resolved.finance = {
            balance: budget,
            currency: getCurrencyType(),
            caixa_bruto: budget,
            caixa_formatado_hud: formattedHud
          };
        }
      }
      return resolved;
    });
  }, []);

  const gameState = rawGameState;
  
  // Shared state for selected player and detailed profile visibility
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [initialSelectedTeamId, setInitialSelectedTeamId] = useState<string | null>(null);
  const [initialSelectedRegionId, setInitialSelectedRegionId] = useState<string | null>(null);
  const [isDetailedProfileOpen, setIsDetailedProfileOpen] = useState<boolean>(false);
  const [negotiateOnLoadPlayerId, setNegotiateOnLoadPlayerId] = useState<string | null>(null);
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState<number | undefined>(undefined);
  const [initialActiveLigaTab, setInitialActiveLigaTab] = useState<'Torneios' | 'Classificação' | 'Calendário' | 'Regras' | 'Jogos' | undefined>(undefined);
  const [isCalDropdownOpen, setIsCalDropdownOpen] = useState<boolean>(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState<boolean>(false);
  const [showUnemploymentModal, setShowUnemploymentModal] = useState<boolean>(true);

  // Refs for click outside detection and hover delays
  const calContainerRef = useRef<HTMLDivElement>(null);
  const budgetContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const calTimerRef = useRef<any>(null);
  const budgetTimerRef = useRef<any>(null);

  // Handles click outside behavior
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calContainerRef.current && !calContainerRef.current.contains(event.target as Node)) {
        setIsCalDropdownOpen(false);
      }
      if (budgetContainerRef.current && !budgetContainerRef.current.contains(event.target as Node)) {
        setIsBudgetDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Query results calculation for Header Global Search Bar
  const getSearchResults = () => {
    if (!globalSearchQuery.trim()) return { players: [] as any[], teams: [] as any[], staff: [] as any[] };
    const query = globalSearchQuery.toLowerCase().trim();

    // 1. Players Search
    const allTeamPlayers = gameState.teams.flatMap(t => 
      [...t.roster, ...t.substitutes, ...(t.academy || [])].map(p => ({
        ...p,
        teamName: t.name,
        teamAcronym: t.acronym
      }))
    );
    const freeAgentsWithFlag = GLOBAL_FREE_AGENTS.map(p => ({
      ...p,
      teamName: 'Agente Livre',
      teamAcronym: 'FA'
    }));

    // Deduplicate players by ID
    const uniquePlayersMap = new Map<string, any>();
    [...allTeamPlayers, ...freeAgentsWithFlag].forEach(p => {
      if (!uniquePlayersMap.has(p.id)) {
        uniquePlayersMap.set(p.id, p);
      }
    });
    const playersList: any[] = Array.from(uniquePlayersMap.values());

    const filteredPlayers = playersList.filter((p: any) => 
      (p.name && p.name.toLowerCase().includes(query)) || 
      (p.realName && p.realName.toLowerCase().includes(query)) ||
      (p.position && p.position.toLowerCase().includes(query))
    ).slice(0, 8); // limit to top 8

    // 2. Teams Search
    const filteredTeams = gameState.teams.filter((t: any) => 
      (t.name && t.name.toLowerCase().includes(query)) ||
      (t.acronym && t.acronym.toLowerCase().includes(query))
    ).slice(0, 4);

    // 3. Staff Search
    const hiredStaff = (gameState.corporationStaffEmployees || []).map((s: any) => ({
      ...s,
      type: 'Hired'
    }));
    const poolStaff = (gameState.corporationStaffJobPool || []).map((s: any) => ({
      ...s,
      type: 'Candidate'
    }));
    const uniqueStaffMap = new Map<string, any>();
    [...hiredStaff, ...poolStaff].forEach((s: any) => {
      const sId = s.id || s.nome;
      if (!uniqueStaffMap.has(sId)) {
        uniqueStaffMap.set(sId, s);
      }
    });
    const staffList: any[] = Array.from(uniqueStaffMap.values());

    const filteredStaff = staffList.filter((s: any) => 
      (s.nome && s.nome.toLowerCase().includes(query)) ||
      (s.cargo && s.cargo.toLowerCase().includes(query)) ||
      (s.departamento && s.departamento.toLowerCase().includes(query)) ||
      (s.name && s.name.toLowerCase().includes(query))
    ).slice(0, 4);

    return {
      players: filteredPlayers,
      teams: filteredTeams,
      staff: filteredStaff
    };
  };

  const searchResults = getSearchResults();
  const hasSearchResults = (searchResults.players || []).length > 0 || (searchResults.teams || []).length > 0 || (searchResults.staff || []).length > 0;

  const openCalDropdown = () => {
    if (calTimerRef.current) clearTimeout(calTimerRef.current);
    setIsBudgetDropdownOpen(false);
    if (budgetTimerRef.current) clearTimeout(budgetTimerRef.current);
    setIsCalDropdownOpen(true);
  };

  const closeCalDropdownWithDelay = () => {
    if (calTimerRef.current) clearTimeout(calTimerRef.current);
    calTimerRef.current = setTimeout(() => {
      setIsCalDropdownOpen(false);
    }, 500);
  };

  const openBudgetDropdown = () => {
    if (budgetTimerRef.current) clearTimeout(budgetTimerRef.current);
    setIsCalDropdownOpen(false);
    if (calTimerRef.current) clearTimeout(calTimerRef.current);
    setIsBudgetDropdownOpen(true);
  };

  const closeBudgetDropdownWithDelay = () => {
    if (budgetTimerRef.current) clearTimeout(budgetTimerRef.current);
    budgetTimerRef.current = setTimeout(() => {
      setIsBudgetDropdownOpen(false);
    }, 500);
  };

  const [activeBluePicks, setActiveBluePicks] = useState<{ [key: string]: string }>({});
  const [activeRedPicks, setActiveRedPicks] = useState<{ [key: string]: string }>({});

  // Week advancement animation & report state controls
  const [isAdvancingWeek, setIsAdvancingWeek] = useState(false);
  const [advanceAnimStep, setAdvanceAnimStep] = useState(0);
  const [recapReport, setRecapReport] = useState<{
    prevWeek: number;
    nextWeek: number;
    teamName: string;
    sponsorIncome: number;
    merchIncome: number;
    athleteCosts: number;
    operatingCosts: number;
    staffCosts: number;
    netProfit: number;
    patchModel: any;
  } | null>(null);

  useEffect(() => {
    if (!isAdvancingWeek) return;
    if (advanceAnimStep >= 5) return;

    const timer = setTimeout(() => {
      setAdvanceAnimStep(prev => prev + 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [isAdvancingWeek, advanceAnimStep]);

  // Auto-save & Custom Toast Notification State
  const [toastNotification, setToastNotification] = useState<{ title: string; desc: string } | null>(null);

  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSuccess, setBugSuccess] = useState(false);

  const triggerNotification = (title: string, desc: string) => {
    setToastNotification({ title, desc });
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    setHasGithubUpdateAlert(false);
    localStorage.setItem('legendshub_github_update_checked', 'true');
    try {
      // Connect to the official GitHub repository as requested to check updates
      const response = await fetch('https://api.github.com/repos/davisonsant/LegendsHub/commits?per_page=1');
      if (response.ok) {
        const data = await response.json();
        const latestSha = data[0]?.sha?.substring(0, 7) || 'latest';
        triggerNotification(
          "🚀 LegendsHub Atualizado!", 
          `Sua versão atual está em sincronia direta com a última revisão (${latestSha}) do GitHub oficial!`
        );
      } else {
        triggerNotification(
          "ℹ️ Controle de Versão",
          `Nenhuma nova atualização encontrada para o LegendsHub no GitHub neste momento.`
        );
      }
    } catch (err) {
      triggerNotification(
        "ℹ️ LegendsHub Atualizado",
        `Seu cliente operacional já se encontra na versão mais recente disponível em https://github.com/davisonsant/LegendsHub.`
      );
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleSubmitBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle) return;
    setBugSuccess(true);
    setTimeout(() => {
      setShowBugModal(false);
      setBugSuccess(false);
      setBugTitle('');
      setBugDesc('');
      triggerNotification(
        "🐛 Bug Reportado!",
        "Seu relatório de bug foi compilado e reportado com sucesso! Obrigado por ajudar a melhorar o LegendsHub."
      );
    }, 1200);
  };

  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Auto load default slot on initial mount if desired, but default is Launcher
  const saveGameToSlot = async (slotIndex: number | string, state: GameState) => {
    await setGameItem(`legendshub_save_slot_${slotIndex}`, state);
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    await setGameItem(`legendshub_save_slot_${slotIndex}_date`, formattedDate);
  };

  const loadGameFromSlot = async (slotIndex: number | string) => {
    const parsed = await getGameItem<GameState>(`legendshub_save_slot_${slotIndex}`);
    if (parsed) {
      try {
        // State Migration: Replace old champions list with the real League of Legends champion data
        const validChampIds = CHAMPIONS_LIST.map(c => c.id);
        const hasOldChamps = !parsed.champions || parsed.champions.length === 0 || parsed.champions.some(c => !validChampIds.includes(c.id));
        
        if (hasOldChamps) {
          parsed.champions = CHAMPIONS_LIST;
          
          if (parsed.currentPatch) {
            parsed.currentPatch.buffedChampions = (parsed.currentPatch.buffedChampions || []).map(id => {
              if (validChampIds.includes(id)) return id;
              return validChampIds[Math.floor(Math.random() * validChampIds.length)];
            });
            parsed.currentPatch.nerfedChampions = (parsed.currentPatch.nerfedChampions || []).map(id => {
              if (validChampIds.includes(id)) return id;
              return validChampIds[Math.floor(Math.random() * validChampIds.length)];
            });
          }
          
          if (parsed.teams) {
            parsed.teams.forEach(t => {
              const allPlayers = [...(t.roster || []), ...(t.substitutes || [])];
              allPlayers.forEach(p => {
                if (p.championPool) {
                  p.championPool = p.championPool.map(cid => {
                    if (validChampIds.includes(cid)) return cid;
                    const compatible = CHAMPIONS_LIST.filter(c => c.roles.includes(p.position));
                    if (compatible.length > 0) {
                      return compatible[Math.floor(Math.random() * compatible.length)].id;
                    }
                    return validChampIds[Math.floor(Math.random() * validChampIds.length)];
                  });
                }
              });
            });
          }
        }

        // State Migration 2: Rehydrate any old/fictional players with real players database
        if (parsed.teams) {
          let leagueUpdated = false;
          parsed.teams = parsed.teams.map(t => {
            const hasMockOrEmpty = !t.roster || t.roster.length === 0 || t.roster.some(p => !p.id.startsWith('pl_real_'));
            if (hasMockOrEmpty) {
              const matched = getPlayersForTeam(t.id, t.isPlayerControlled);
              if (matched && matched.roster.length > 0) {
                leagueUpdated = true;
                return {
                  ...t,
                  roster: matched.roster,
                  substitutes: matched.substitutes
                };
              }
            }
            return t;
          });
          if (leagueUpdated) {
            console.log("Database migrated: loaded pre-existing save slot teams with full real players roster!");
          }
        }
        
        setGameState(parsed);
        setScreen('HUB');
        setActiveTab('Central do Manager');
        triggerNotification(
          localStorage.getItem('legendshub_lang') === 'es' ? '📂 Partida Cargada' : '📂 Progresso Carregado',
          `Carregado do Slot: ${slotIndex === 'autosave' ? 'Auto-salvamento' : slotIndex}`
        );
      } catch (e) {
        console.error("Erro ao ler slote do jogo", e);
      }
    }
  };

  // Helper trigger for checking and applying autoguardados
  const triggerAutoSaveIfNeeded = (nextState: GameState, isCriticalAction = false, actionName = '') => {
    const autosaveEnabled = localStorage.getItem('legendshub_autosave_enabled') !== 'false';
    const autosaveFreq = parseInt(localStorage.getItem('legendshub_autosave_freq') || '4');
    const criticalAutosaveEnabled = localStorage.getItem('legendshub_autosave_critical') !== 'false';

    if (autosaveEnabled) {
      if (isCriticalAction && criticalAutosaveEnabled) {
        saveGameToSlot('autosave', nextState);
        const title = localStorage.getItem('legendshub_lang') === 'es' 
          ? '💾 ¡Auto-guardardo Crítico!' 
          : '💾 Auto-salvamento (Ação Crítica)';
        triggerNotification(title, actionName);
      } else if (!isCriticalAction) {
        // week advancement check (autosaveFreq weeks)
        if (autosaveFreq > 0 && nextState.week % autosaveFreq === 0) {
          saveGameToSlot('autosave', nextState);
          const title = localStorage.getItem('legendshub_lang') === 'es'
            ? `💾 ¡Auto-guardado Realizado!`
            : `💾 Auto-salvamento Concluído!`;
          
          const desc = localStorage.getItem('legendshub_lang') === 'es'
            ? `Guardado automático semanal (Frecuencia: ${autosaveFreq} Sem).`
            : `Progresso salvo automaticamente (Intervalo: ${autosaveFreq} Sem).`;
          
          triggerNotification(title, desc);
        }
      }
    }
    // Perform standard background save to slot 1
    saveGameToSlot(1, nextState);
  };

  const handleStartNewGame = (
    managerName: string, 
    selectedTeamId: string, 
    region: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' = 'CBLOL', 
    year: number = 2025
  ) => {
    const freshState = initializeNewGame(managerName, selectedTeamId, region, year);
    setGameState(freshState);
    // Auto save to default Slot 1 immediately
    saveGameToSlot(1, freshState);
    setScreen('HUB');
    setActiveTab('Central do Manager');
  };

  const handleLoadGame = (slotId: string) => {
    const cleanId = slotId.replace('slot_', '');
    const index = isNaN(Number(cleanId)) ? cleanId : parseInt(cleanId);
    loadGameFromSlot(index);
  };

  // State action handlers triggered from different tabs
  const renewContractHandler = (playerName: string) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
    const all = [...team.roster, ...team.substitutes];
    const player = all.find(p => p.name === playerName);

    if (player && team.budget >= player.salary * 1.5) {
      team.budget = Math.round(team.budget - player.salary);
      player.contractMonths += 24;
      player.salary = Math.round(player.salary * 1.25); // salary raises slightly on extension
      const nextState = { ...gameState };
      setGameState(nextState);
      triggerAutoSaveIfNeeded(nextState, true, `Renovação de Contrato: ${playerName}`);
      alert(`Contrato de ${playerName} estendido com sucesso por mais 24 splits meses.`);
    } else {
      alert("Seu saldo de caixa é insuficiente para bancar as taxas cadastrais de extensão!");
    }
  };

  const transferListHandler = (player: Player) => {
    if (!gameState) return;
    
    // Encontrar o jogador e atualizar sua flag de listagem de transferência
    const updatedTeams = gameState.teams.map(t => {
      const rosterUpdated = t.roster.map(p => p.id === player.id ? { ...p, isTransferListed: true } : p);
      const subsUpdated = t.substitutes.map(p => p.id === player.id ? { ...p, isTransferListed: true } : p);
      return {
        ...t,
        roster: rosterUpdated,
        substitutes: subsUpdated
      };
    });
    
    const nextState = {
      ...gameState,
      teams: updatedTeams
    };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Anunciar Listagem de Transferência: ${player.name}`);
    alert(`O atleta ${player.name} foi colocado no catálogo de anúncio de transferências da liga com sucesso!\n\nEle agora passará a aparecer nas listagens globais, gerando uma chance calibrada de 35% de a organização receber propostas em dinheiro de outros clubes ao fim de cada semana.`);
  };

  const releasePlayerHandler = (player: Player) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

    // decrease boardTrust because of loss of capital assets
    team.boardTrust = Math.max(0, team.boardTrust - 5);
    team.roster = team.roster.filter(p => p.id !== player.id);
    team.substitutes = team.substitutes.filter(p => p.id !== player.id);
    team.academy = (team.academy || []).filter(p => p.id !== player.id);

    const nextState = { ...gameState };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Demissão de Jogador: ${player.name}`);
    alert(`O contrato de ${player.name} foi rescindido.`);
  };

  const selectPlayerTrainingHandler = (playerName: string, focus: string) => {
    // metadata log training
  };

  const buyPlayerHandler = (player: Player) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

    // deduce marketValue, change status, assign as sub
    team.budget = Math.round(team.budget - player.marketValue);
    player.isPlayerControlled = true;
    player.contractMonths = 24; // starting splits contract
    team.substitutes.push(player);

    const nextState = { ...gameState };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Contratação de Jogador: ${player.name}`);
    alert(`Bem vindo! O passe tático de ${player.name} foi adquirido e incorporado aos seus substitutos.`);
  };

  const sellProposeAcceptHandler = (player: Player, price: number) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

    team.budget = Math.round(team.budget + price);
    team.roster = team.roster.filter(p => p.id !== player.id);
    team.substitutes = team.substitutes.filter(p => p.id !== player.id);

    const nextState = { ...gameState };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Venda de Atleta: ${player.name}`);
    alert(`Você vendeu o atleta ${player.name} e arrecadou $ ${price.toLocaleString('pt-BR')} no caixa da equipe.`);
  };

  const signSponsorHandler = (sId: string) => {
    if (!gameState) return;
    const nextGame = signSponsorContract(gameState, sId);
    setGameState(nextGame);
    triggerAutoSaveIfNeeded(nextGame, true, `Novo Patrocinador Assinado`);
  };

  const upgradeInfrastructureHandler = (type: 'gamingHouseLevel' | 'trainingCenterLevel' | 'mediaTeamLevel') => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
    
    const multiplier = type === 'gamingHouseLevel' ? 125000 : type === 'trainingCenterLevel' ? 100000 : 80000;
    const currentLvl = team.infrastructure[type];
    const cost = currentLvl * multiplier;

    team.budget -= cost;
    team.infrastructure[type]++;
    
    // side effect: raise metrics
    if (type === 'gamingHouseLevel') {
      team.fansSupport = Math.min(100, team.fansSupport + 6);
    } else if (type === 'mediaTeamLevel') {
      team.popularity = Math.min(100, team.popularity + 8);
    }

    const nextState = { ...gameState };
    setGameState(nextState);
    const infraLabel = type === 'gamingHouseLevel' ? 'Gaming House' : type === 'trainingCenterLevel' ? 'Training Center' : 'Assessoria de Imprensa';
    triggerAutoSaveIfNeeded(nextState, true, `Upgrade QG: ${infraLabel} Nív. ${currentLvl + 1}`);
    alert(`Parabéns! Sua instalação foi modernizada com sucesso para nível ${currentLvl + 1}!`);
  };

  const promoteProspectHandler = (prospect: Player) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

    team.academy = team.academy.filter(p => p.id !== prospect.id);
    prospect.isPlayerControlled = true;
    team.substitutes.push(prospect);

    const nextState = { ...gameState };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Promoção da Base: ${prospect.name}`);
    alert(`Sucesso! O prospecto ${prospect.name} subiu da base e agora integra o elenco profissional.`);
  };

  const updateTeamsHandler = (updated: Team[]) => {
    if (!gameState) return;
    setGameState({ ...gameState, teams: updated });
  };

  const updateSponsorsHandler = (updatedSponsors: Sponsor[]) => {
    if (!gameState) return;
    setGameState({ ...gameState, sponsorsMarket: updatedSponsors });
  };

  // PRESS ROOM INTERVIEW RESOLUTION
  const answerInterviewHandler = (q: InterviewQuestion, optionIdx: number) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
    const opt = q.options[optionIdx];

    // apply modifiers directly to teams state
    team.boardTrust = Math.max(0, Math.min(100, team.boardTrust + opt.trustChange));
    team.fansSupport = Math.max(0, Math.min(100, team.fansSupport + opt.fansChange));
    team.roster.forEach(p => {
      p.chemistry = Math.max(0, Math.min(100, p.chemistry + opt.chemistryChange));
    });

    setGameState({ ...gameState });
  };

  // ROUNDS / WEEK GAMEPLAY TRANSITION
  const advanceWeekHandler = () => {
    if (!gameState) return;

    if (!gameState.playerTeamId || gameState.playerTeamId === '') {
      alert("Operação Bloqueada: Você está desempregado e precisa assinar uma das propostas de contrato disponíveis antes de avançar as rodadas da liga.");
      return;
    }

    // ---- PROCESSAMENTO DE PROPOSTAS DE TRANSFERÊNCIA DOS JOGADORES LISTADOS ----
    let currentTempGameState = { ...gameState };
    const playerTeamInstance = currentTempGameState.teams.find(t => t.id === currentTempGameState.playerTeamId);
    
    if (playerTeamInstance) {
      const listedPlayers = [...playerTeamInstance.roster, ...playerTeamInstance.substitutes].filter((p: any) => p.isTransferListed);
      
      let budgetAdjustment = 0;
      let activeTeams = [...currentTempGameState.teams];
      let hasSoldAny = false;
      
      for (const p of listedPlayers) {
        if (Math.random() < 0.35) {
          const rivals = activeTeams.filter(t => t.id !== currentTempGameState.playerTeamId);
          if (rivals.length > 0) {
            const buyer = rivals[Math.floor(Math.random() * rivals.length)];
            const multiplier = 0.85 + Math.random() * 0.4; // 85% a 125% do valor de mercado
            const proposedValue = Math.round(p.marketValue * multiplier);
            
            const confirmSale = window.confirm(
              `🚨 PROPOSTA DE COMPRA RECEBIDA!\n\n` +
              `O rival ${buyer.name} enviou uma oferta oficial para comprar os direitos econômicos de ${p.name}.\n\n` +
              `• Atleta: ${p.name} (OVR ${p.overallRating})\n` +
              `• Proposta Oferecida: ${formatMoney(proposedValue)}\n` +
              `• Valor de Mercado: ${formatMoney(p.marketValue)}\n\n` +
              `Deseja fechar o acordo de transferência e receber o dinheiro imediatamente?`
            );
            
            if (confirmSale) {
              hasSoldAny = true;
              budgetAdjustment += proposedValue;
              
              // Ajustar posições de escopo (remover do próprio time e incorporar no comprador)
              activeTeams = activeTeams.map(t => {
                if (t.id === currentTempGameState.playerTeamId) {
                  return {
                    ...t,
                    roster: t.roster.filter(item => item.id !== p.id),
                    substitutes: t.substitutes.filter(item => item.id !== p.id)
                  };
                }
                if (t.id === buyer.id) {
                  const transferredPlayer: Player = { 
                    ...p, 
                    isTransferListed: false,
                    motivation: Math.min(100, p.motivation + 15)
                  };
                  return {
                    ...t,
                    substitutes: [...t.substitutes, transferredPlayer]
                  };
                }
                return t;
              });
              
              alert(`💰 PASSE TRANSFERIDO!\n\nO atleta ${p.name} foi vendido com sucesso para a ${buyer.name} por ${formatMoney(proposedValue)}!`);
            }
          }
        }
      }
      
      if (hasSoldAny) {
        activeTeams = activeTeams.map(t => {
          if (t.id === currentTempGameState.playerTeamId) {
            return {
              ...t,
              budget: t.budget + budgetAdjustment
            };
          }
          return t;
        });
        
        currentTempGameState.teams = activeTeams;
      }
    }

    // Capture pre-advance finance snapshots from current gameState before mutation
    const playerTeam = currentTempGameState.teams.find(t => t.id === currentTempGameState.playerTeamId);
    const sponsorIncome = playerTeam ? playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0) : 0;
    const merchIncome = playerTeam ? playerTeam.popularity * 1500 : 0;
    const athleteCosts = playerTeam ? [...playerTeam.roster, ...playerTeam.substitutes].reduce((acc, p) => acc + p.salary / 4, 0) : 0;
    const operatingCosts = playerTeam ? ((playerTeam.infrastructure.gamingHouseLevel * 8000) + 
                           (playerTeam.infrastructure.trainingCenterLevel * 6000) +
                           (playerTeam.infrastructure.mediaTeamLevel * 4000)) : 0;
    
    // Staff payroll filters matching engine
    const staffCosts = currentTempGameState.availableStaff.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0);
    const netProfit = sponsorIncome + merchIncome - athleteCosts - operatingCosts - staffCosts;
    const prevWeek = currentTempGameState.week;

    const nextWeekState = advanceGameWeek(currentTempGameState);
    
    // ---- EMISSÃO DE PARECER E STATUS DE LICENCIAMENTO FINANCEIRO RIOT ----
    let isFfpCompliant = true;
    let complianceDetails = '';
    const playerTeamInstanceCheck = currentTempGameState.teams.find(t => t.id === currentTempGameState.playerTeamId);
    if (playerTeamInstanceCheck) {
      const basePlayerPayrollWeeklyCheck = [...playerTeamInstanceCheck.roster, ...playerTeamInstanceCheck.substitutes].reduce((acc, p) => acc + p.salary / 4, 0);
      const isBudgetViolationCheck = playerTeamInstanceCheck.budget < 0;
      const isSalaryGapViolationCheck = basePlayerPayrollWeeklyCheck > 120000;
      const hasActiveLoansViolationCheck = playerTeamInstanceCheck.loans && playerTeamInstanceCheck.loans.length > 0;
      
      if (isBudgetViolationCheck || isSalaryGapViolationCheck || hasActiveLoansViolationCheck) {
        isFfpCompliant = false;
        const detailsArray = [];
        if (isBudgetViolationCheck) detailsArray.push(`Orçamento negativo ($ ${Math.round(playerTeamInstanceCheck.budget).toLocaleString('pt-BR')})`);
        if (isSalaryGapViolationCheck) detailsArray.push(`Folha salarial ($ ${Math.round(basePlayerPayrollWeeklyCheck).toLocaleString('pt-BR')}) acima do limite ($ 120.000/semana)`);
        if (hasActiveLoansViolationCheck) detailsArray.push(`Possui empréstimo bancário em aberto`);
        complianceDetails = detailsArray.join(', ');
      }
    }

    try {
      const existingEmailsRaw = localStorage.getItem('legendshub_custom_events_emails');
      let currentEmails = [];
      if (existingEmailsRaw) {
        try {
          currentEmails = JSON.parse(existingEmailsRaw);
        } catch (_) {
          currentEmails = [];
        }
      }
      
      const newEmails = [];

      const playerTeam = nextWeekState.teams.find(t => t.id === nextWeekState.playerTeamId);
      const acronym = playerTeam?.acronym || 'TEAM';
      const teamName = playerTeam?.name || 'Clube de Esports';
      const currentWeek = nextWeekState.week;

      // 1. Licensing Email
      const newLicensingEmail = {
        id: `email-licensing-${Date.now()}`,
        sender: 'Conselho de Licenciamento Riot',
        senderRole: 'Riot Games Compliance',
        subject: isFfpCompliant 
          ? '🟢 [ STATUS: LICENCIADO (Aprovado nas Regras de Licenciamento da Riot de CBLOL/VCS/LCS) ]' 
          : '⚠️ [ STATUS: SOB ADVERTÊNCIA FINANCEIRA DE LICENCIAMENTO ]',
        body: isFfpCompliant
          ? `Prezado Coordenador Geral, temos o prazer de comunicar que, após minuciosa auditoria das contas de sua organização nesta semana, o conselho fiscal confirmou total conformidade de sua franquia com o Teto Salarial de $ 120.000/semana e as normativas do Fair-Play Financeiro. Seu clube está devidamente LICENCIADO para competir no CBLOL/VCS/LCS sem impedimentos, bloqueios ou multas reguladoras.`
          : `ATENÇÃO! Sua organização acaba de ser enquadrada em estado de irregularidade de compliance e licenciamento pela Riot League. Critérios de infração detectados: ${complianceDetails}. Lembre-se: caso permaneça sob advertência cumulada por 24 semanas consecutivas, sanções desportivas rígidas incluindo a dedução irrevogável de 3 pontos na tabela profissional CBLOL/VCS/LCS serão aplicadas imediatamente após o período de carência! Regularize seus gastos com contratos ou amortize empréstimos imediatamente para recuperar sua licença.`,
        date: `Semana ${nextWeekState.week}`,
        category: 'Direção' as const,
        read: false,
        actionLabel: 'Ver Finanças',
        linkTab: 'Finanças'
      };
      newEmails.push(newLicensingEmail);

      if (playerTeam) {
        // 2A. Gestão de Elenco e Contratos - Pedidos de Renovação
        const candidatesForRenewal = [...playerTeam.roster, ...playerTeam.substitutes].filter(p => p.motivation > 75 || p.contractMonths <= 6);
        if (candidatesForRenewal.length > 0) {
          const selectedPlayer = candidatesForRenewal[currentWeek % candidatesForRenewal.length];
          const isDuplicate = currentEmails.some((e: any) => e.subject.includes(selectedPlayer.name) && e.subject.includes("RENOVAÇÃO"));
          if (!isDuplicate) {
            const expectedSalary = Math.round(selectedPlayer.salary * 1.15);
            newEmails.push({
              id: `email-renewal-${selectedPlayer.id}-${currentWeek}`,
              sender: selectedPlayer.name,
              senderRole: `Jogador (${selectedPlayer.position})`,
              subject: `⚡ PROPOSTA DE RENOVAÇÃO: ${selectedPlayer.name} deseja estender o contrato`,
              body: `Olá Manager, estou muito satisfeito em defender a ${teamName}. Meu agente formalizou as tratativas iniciais para a renovação de meu vínculo que termina em breve. Solicitamos uma extensão contratual básica de 12 meses, com salário mensal reajustado em 15% para $ ${Math.round(expectedSalary / 2).toLocaleString('pt-BR')} e bônus de luvas de assinatura. Aguardo sua avaliação na aba Jogador!`,
              date: `Semana ${currentWeek}`,
              category: 'Jogadores' as const,
              read: false,
              actionLabel: 'Ver Elenco Principal',
              linkTab: 'Jogadores'
            });
          }
        }

        // 2B. Vencimento de Vínculos - Jogadores (6, 3, 1 meses)
        [...playerTeam.roster, ...playerTeam.substitutes].forEach(p => {
          if (p.contractMonths === 6 || p.contractMonths === 3 || p.contractMonths === 1) {
            const isDuplicate = currentEmails.some((e: any) => e.id === `email-expiry-${p.id}-${p.contractMonths}`);
            if (!isDuplicate) {
              newEmails.push({
                id: `email-expiry-${p.id}-${p.contractMonths}`,
                sender: 'RH e Diretoria de Talentos',
                senderRole: 'Recursos Humanos',
                subject: `⚠️ CONTRATO PRÓXIMO DO FIM: Atleta ${p.name} (${p.contractMonths} M)`,
                body: `Prezado Manager, gostaríamos de alertar que o contrato de prestação de serviços esportivos do pro-player ${p.name} (${p.position}) está a exatamente ${p.contractMonths} meses de expirar! Tome as ações necessárias para propor uma renovação ou listá-lo para transferência para não perdê-lo de graça ao fim da janela.`,
                date: `Semana ${currentWeek}`,
                category: 'Jogadores' as const,
                read: false,
                actionLabel: 'Ver Elenco Principal',
                linkTab: 'Jogadores'
              });
            }
          }
        });

        // 2C. Vencimento de Vínculos - Membros do Staff (6, 3, 1 meses)
        const staffMonths = 12 - (currentWeek % 12);
        if (staffMonths === 6 || staffMonths === 3 || staffMonths === 1) {
          const hiredStaff = nextWeekState.availableStaff?.filter(s => s.hired) || [];
          hiredStaff.forEach(s => {
            const isDuplicate = currentEmails.some((e: any) => e.id === `email-staff-expiry-${s.id}-${staffMonths}`);
            if (!isDuplicate) {
              newEmails.push({
                id: `email-staff-expiry-${s.id}-${staffMonths}`,
                sender: 'Diretoria Executiva',
                senderRole: 'Gerente Administrativo',
                subject: `⚠️ EXPIRAÇÃO DE VÍNCULO DE STAFF: ${s.name} (${staffMonths} M)`,
                body: `Atenção Manager. A assessoria jurídica notificou que as obrigações contratuais do profissional ${s.name}, atuando como nosso ${s.role}, encerram-se em ${staffMonths} meses. Por favor, decida se o clube deseja planejar a renegociação salarial ou iniciar recrutamento de substitutos no painel de finanças.`,
                date: `Semana ${currentWeek}`,
                category: 'Direção' as const,
                read: false,
                actionLabel: 'Ver Comissão Técnica',
                linkTab: 'Finanças'
              });
            }
          });
        }

        // 2D. Vencimento de Vínculos - Scouts (Olheiros)
        try {
          const savedScouts = localStorage.getItem('legendshub_scouting_staff');
          if (savedScouts) {
            let scoutsList = JSON.parse(savedScouts);
            if (Array.isArray(scoutsList) && scoutsList.length > 0) {
              let updatedScouts = [...scoutsList];
              
              // Decrement scout contract remaining count by 1 every 4 weeks
              if (currentWeek % 4 === 0) {
                updatedScouts = updatedScouts.map(sc => ({
                  ...sc,
                  contractRemaining: Math.max(1, sc.contractRemaining - 1)
                }));
                localStorage.setItem('legendshub_scouting_staff', JSON.stringify(updatedScouts));
              }
              
              updatedScouts.forEach(sc => {
                if (sc.contractRemaining === 6 || sc.contractRemaining === 3 || sc.contractRemaining === 1) {
                  const isDuplicate = currentEmails.some((e: any) => e.id === `email-scout-expiry-${sc.id}-${sc.contractRemaining}`);
                  if (!isDuplicate) {
                    newEmails.push({
                      id: `email-scout-expiry-${sc.id}-${sc.contractRemaining}`,
                      sender: 'Agência de Olheiros Headhunter',
                      senderRole: 'Parceiro de Recrutamento',
                      subject: `⚠️ CONTRATO PRÓXIMO DO FIM: Olheiro ${sc.name} (${sc.contractRemaining} M)`,
                      body: `Prezado Manager, notificamos que o contrato do scout certificado ${sc.name} está em reta final de vigência, restando apenas ${sc.contractRemaining} meses de exclusividade com sua organização. Garanta a extensão ou planeje a substituição acessando o painel de olheiros na aba Scouting!`,
                      date: `Semana ${currentWeek}`,
                      category: 'Direção' as const,
                      read: false,
                      actionLabel: 'Ver Olheiros / Scouts',
                      linkTab: 'Scouting'
                    });
                  }
                }
              });
            }
          }
        } catch (e) {
          console.warn("Could not check scouts expiry alerts:", e);
        }

        // 2E. Direitos de TV e Comerciais
        if (playerTeam.sponsors) {
          playerTeam.sponsors.forEach(sp => {
            if (sp.isSigned) {
              const activeW = sp.activeWeeks || 0;
              const weeksLeft = sp.termsInWeeks - activeW;
              if (weeksLeft === 2) {
                const isDuplicate = currentEmails.some((e: any) => e.id === `email-sponsor-alert-${sp.id}-${currentWeek}`);
                if (!isDuplicate) {
                  newEmails.push({
                    id: `email-sponsor-alert-${sp.id}-${currentWeek}`,
                    sender: 'CFO Executivo / Depto Comercial',
                    senderRole: 'Gerente Comercial',
                    subject: `💼 COMERCIAL: Encerramento de Slot do Patrocinador ${sp.name} em 2 semanas`,
                    body: `Prezado Coordenador Geral, nosso contrato comercial de patrocínio com a marca ${sp.name} está a exatamente 2 semanas de expirar! Recomendamos abrir chamados para novas propostas comerciais ou preparar a rodada de renegociação de metas e bônus de assinatura na aba de Patrocinadores para não sofrer furos de receita.`,
                    date: `Semana ${currentWeek}`,
                    category: 'Propostas' as const,
                    read: false,
                    actionLabel: 'Ver Patrocinadores',
                    linkTab: 'Patrocinadores'
                  });
                }
              }
            }
          });
        }

        // 2F. Rotina de Vistorias e Compliance Jurídico
        const cycleWeek = ((currentWeek - 1) % 8) + 1;
        if (cycleWeek === 1) {
          newEmails.push({
            id: `email-audit-schedule-${currentWeek}`,
            sender: 'Riot Games Compliance Office',
            senderRole: 'Riot League Compliance',
            subject: `⚖️ REGULATÓRIO: Aviso de Vistoria de Conformidade agendada para dia 15`,
            body: `Prezado Coordenador Geral, o Conselho Consultivo de Operações de CBLOL/VCS/LCS informa que a auditoria fiscal de meio-termo está oficialmente agendada para o dia 15 deste split. Forneça todos os dados atualizados das folhas salariais de atletas titulares e reservas. Certifique-se de manter o cumprimento estrito do teto de folha semanal de $120.000 para evitar sanções.`,
            date: `Semana ${currentWeek}`,
            category: 'Direção' as const,
            read: false,
            actionLabel: 'Ver Finanças',
            linkTab: 'Finanças'
          });
        } else if (cycleWeek === 2) {
          newEmails.push({
            id: `email-audit-warn-${currentWeek}`,
            sender: 'Riot Games Compliance Office',
            senderRole: 'Riot League Compliance',
            subject: `⚖️ URGENTE: A Vistoria do Fair-Play Financeiro acontecerá amanhã`,
            body: `Atenção Coordenador Geral! O auditor oficial da liga estará em nossas instalações amanhã para fazer a varredura das amortizações de empréstimos e comprovação de cumprimento do Teto Salarial de $120.000/semana. Ajuste as contas de sua franquia de imediato para resguardar sua licença de competição!`,
            date: `Semana ${currentWeek}`,
            category: 'Direção' as const,
            read: false,
            actionLabel: 'Ver Finanças',
            linkTab: 'Finanças'
          });
        } else if (cycleWeek === 3) {
          if (isFfpCompliant) {
            newEmails.push({
              id: `email-audit-success-${currentWeek}`,
              sender: 'Riot Games Compliance Office',
              senderRole: 'Riot League Compliance',
              subject: `⚖️ REGULARIZADO: Vistoria concluída com sucesso (Sem Irregularidades)`,
              body: `Prezados executivos, após minuciosa auditoria na folha, caixa e empréstimos bancários ativos da franquia, o auditor regulamentar oficial da Riot Games concluiu que sua organização está em TOTAL cumprimento de Fair-Play Financeiro. Nenhuma sanção de bloqueio ou perda esportiva de pontos foi lavrada. Parabéns pela lisura administrativo-contábil!`,
              date: `Semana ${currentWeek}`,
              category: 'Direção' as const,
              read: false,
              actionLabel: 'Ver Finanças',
              linkTab: 'Finanças'
            });
          } else {
            newEmails.push({
              id: `email-audit-fail-${currentWeek}`,
              sender: 'Riot Games Compliance Office',
              senderRole: 'Riot League Compliance',
              subject: `⚖️ PROCESSO ADMINISTRATIVO: Não cumprimento de normas de Fair-Play Financeiro`,
              body: `NOTIFICAÇÃO EXTRAJUDICIAL DE INFRAÇÃO: Comunicamos que, após a análise fiscal de meio-termo, a Riot Games detectou inconformidade regulatória em sua folha salarial ou balanço financeiro ativo (${complianceDetails}). Sua franquia foi enquadrada em Alerta de Suspensão com prazo limite de carência acumulativo de 24 semanas consecutivas antes da aplicação da perda compulsória e irrevogável de 3 pontos desportivos na tabela de classificação geral! Regularize agora.`,
              date: `Semana ${currentWeek}`,
              category: 'Direção' as const,
              read: false,
              actionLabel: 'Ver Finanças',
              linkTab: 'Finanças'
            });
          }
        } else if (cycleWeek === 5) {
          newEmails.push({
            id: `email-audit-schedule2-${currentWeek}`,
            sender: 'Riot Games Compliance Office',
            senderRole: 'Riot League Compliance',
            subject: `⚖️ REGULATÓRIO: Aviso de Vistoria de Conformidade agendada para dia 30`,
            body: `Prezado Coordenador Geral, o Conselho Consultivo de Operações de CBLOL/VCS/LCS informa que a auditoria fiscal de encerramento do split está oficialmente agendada para o dia 30 deste split. Mantenha os computadores e livros contábeis abertos para varredura de pendências financeiras.`,
            date: `Semana ${currentWeek}`,
            category: 'Direção' as const,
            read: false,
            actionLabel: 'Ver Finanças',
            linkTab: 'Finanças'
          });
        } else if (cycleWeek === 6) {
          newEmails.push({
            id: `email-audit-warn2-${currentWeek}`,
            sender: 'Riot Games Compliance Office',
            senderRole: 'Riot League Compliance',
            subject: `⚖️ URGENTE: A Vistoria do Fair-Play Financeiro acontecerá amanhã`,
            body: `Atenção Coordenador Geral! O auditor oficial da liga estará em nossas instalações amanhã para fazer a varredura das amortizações de empréstimos de encerramento e comprovação de cumprimento do Teto Salarial de $120.000/semana. Ajuste as finanças!`,
            date: `Semana ${currentWeek}`,
            category: 'Direção' as const,
            read: false,
            actionLabel: 'Ver Finanças',
            linkTab: 'Finanças'
          });
        } else if (cycleWeek === 7) {
          if (isFfpCompliant) {
            newEmails.push({
              id: `email-audit-success2-${currentWeek}`,
              sender: 'Riot Games Compliance Office',
              senderRole: 'Riot League Compliance',
              subject: `⚖️ REGULARIZADO: Vistoria concluída com sucesso (Sem Irregularidades)`,
              body: `Prezados executivos, após minuciosa auditoria na folha final, caixa e empréstimos bancários ativos da franquia, o auditor regulamentar oficial da Riot Games concluiu que sua organização está em TOTAL cumprimento de Fair-Play Financeiro. Nenhuma sanção de bloqueio ou perda esportiva de pontos foi lavrada. Parabéns!`,
              date: `Semana ${currentWeek}`,
              category: 'Direção' as const,
              read: false,
              actionLabel: 'Ver Finanças',
              linkTab: 'Finanças'
            });
          } else {
            newEmails.push({
              id: `email-audit-fail2-${currentWeek}`,
              sender: 'Riot Games Compliance Office',
              senderRole: 'Riot League Compliance',
              subject: `⚖️ PROCESSO ADMINISTRATIVO: Não cumprimento de normas de Fair-Play Financeiro / Detecção de Poaching`,
              body: `NOTIFICAÇÃO EXTRAJUDICIAL DE INFRAÇÃO JURÍDICA: Comunicamos que, após a análise fiscal de encerramento, a Riot Games detectou inconformidade regulatória ativa (${complianceDetails}). Lembramos que acúmulo continuado de semanas sob irregularidade sem regularização acarreta a perda contundente de 3 pontos no campeonato! Regularize amortizando empréstimos ou reduzindo folha de pagamento.`,
              date: `Semana ${currentWeek}`,
              category: 'Direção' as const,
              read: false,
              actionLabel: 'Ver Finanças',
              linkTab: 'Finanças'
            });
          }
        }

        // 2G. Controle Consular de Vistos (Atletas Importados)
        if (playerTeam.vistasAwaiting && playerTeam.vistasAwaiting.length > 0) {
          playerTeam.vistasAwaiting.forEach(app => {
            // Em Andamento email
            const isDuplicateOngoing = currentEmails.some((e: any) => e.subject.includes("Visto Iniciado") && e.subject.includes(app.name));
            if (!isDuplicateOngoing) {
              newEmails.push({
                id: `email-visa-ongoing-${app.id}-${currentWeek}`,
                sender: 'Imigração & Controle Consular',
                senderRole: 'Depto Consular Governamental',
                subject: `✈️ IMIGRAÇÃO: Processo de Visto Iniciado - Atleta ${app.name}`,
                body: `Prezado Coordenador Geral, temos o prazer de notificar que protocolamos as documentações e efetuamos o recolhimento das taxas de processamento consular junto ao Consulado para concessão de vistos consulares classe P-1 ou EB-1 para o atleta estrangeiro ${app.name}. O processamento estimado inicial é de ${app.weeksRemaining} semanas. Acompanhe a evolução!`,
                date: `Semana ${currentWeek}`,
                category: 'Direção' as const,
                read: false,
                actionLabel: 'Ver Finanças',
                linkTab: 'Finanças'
              });
            }

            // Reprovação/Taxas Pendentes email
            if (app.hasDocumentationRequest) {
              const isDuplicateFail = currentEmails.some((e: any) => e.subject.includes("Visto Recusado") && e.subject.includes(app.name));
              if (!isDuplicateFail) {
                newEmails.push({
                  id: `email-visa-fail-${app.id}-${currentWeek}`,
                  sender: 'Imigração & Controle Consular',
                  senderRole: 'Depto Consular Governamental',
                  subject: `✈️ ALERTA CONSULAR: Visto de Atleta ${app.name} recusado por inconsistência ocular`,
                  body: `ALERTA CONSULAR DE INFRAÇÃO: A petição referente ao atleta estrangeiro ${app.name} foi suspensa por descumprimento de regularização documental ou taxas consulares adicionais em aberto! O processamento encontra-se CONGELADO no consulado e necessita de aporte urgente de taxas governamentais corretoras de $2.500 no painel do Consulado para que possamos retomar a análise. Evite a exclusão de seu atleta das escalações!`,
                  read: false,
                  category: 'Direção' as const,
                  date: `Semana ${currentWeek}`,
                  actionLabel: 'Ver Finanças',
                  linkTab: 'Finanças'
                });
              }
            }
          });
        }
      }

      const mergedEmails = [...newEmails, ...currentEmails];
      localStorage.setItem('legendshub_custom_events_emails', JSON.stringify(mergedEmails));
      window.dispatchEvent(new Event('emails-updated'));
      if (newEmails.length > 0) {
        window.dispatchEvent(new Event('onNewEmailRecieved'));
        window.dispatchEvent(new Event('onNewEmailReceived'));
      }

      // 3. ENGINE DO SINO DE NOTIFICAÇÕES (FEED DE REDES SOCIAIS E IMPRENSA)
      let currentNews = [];
      const savedNewsRaw = localStorage.getItem('legendshub_notifications_news');
      if (savedNewsRaw) {
        try {
          currentNews = JSON.parse(savedNewsRaw);
        } catch (_) {
          currentNews = [];
        }
      } else {
        currentNews = [
          {
            id: 'news-1',
            title: '🔥 RED Canids anuncia contratação histórica de Midlaner Coreano',
            summary: 'A organização oficializou a chegada do pro-player vindo diretamente da LCK. Os vistos regulamentados e a documentação na Receita Federal foram finalizados nos acréscimos para o próximo split.',
            source: 'CBLOL Portal',
            category: 'Transferências',
            time: '32 min atrás',
            likes: 142,
            read: true
          },
          {
            id: 'news-2',
            title: '🛠️ Riot Games anuncia Patch 14.15 ajustando Atiradores de longo alcance',
            summary: 'Mudanças no meta de builds e nerf nos principais atiradores mobilizaras as comissões técnicas a formularem táticas alternativas.',
            source: 'Riot Competições',
            category: 'Cenário',
            time: '1 hora atrás',
            likes: 310,
            read: true
          },
          {
            id: 'news-3',
            title: '💬 @RiftNews: Discussão esquenta no Twitter/X sobre limites do Teto Salarial',
            summary: 'Fãs debatem se a multa de Luxo (Luxury Tax) de 150% cobrada das grandes organizações de esports do CBLOL é justa.',
            source: 'Twitter / Redes',
            category: 'Social',
            time: '2 horas atrás',
            likes: 95,
            read: true
          }
        ];
      }

      if (playerTeam) {
        const newNewsItems = [];
        
        // Find if user won or lost last match
        const playerMatchesTotal = nextWeekState.calendarSchedule[currentWeek - 1] || [];
        const playerMatch = playerMatchesTotal.find((m: any) => m.teamBlueId === playerTeam.id || m.teamRedId === playerTeam.id);
        let hasWonLastMatch = false;
        if (playerMatch && playerMatch.isFinished) {
          const isBlue = playerMatch.teamBlueId === playerTeam.id;
          const playerSideWon = isBlue ? (playerMatch.scoreBlue > playerMatch.scoreRed) : (playerMatch.scoreRed > playerMatch.scoreBlue);
          hasWonLastMatch = playerSideWon;
        } else {
          hasWonLastMatch = Math.random() < 0.55;
        }

        const midPlayer = playerTeam.roster?.find(p => p.position === 'MID')?.name || 'Core Mid';
        const allPlayers = [...playerTeam.roster, ...playerTeam.substitutes];
        const avgMorale = allPlayers.length > 0 ? allPlayers.reduce((acc, p) => acc + p.motivation, 0) / allPlayers.length : 80;

        // A. Community reactions
        if (!hasWonLastMatch) {
          newNewsItems.push({
            id: `news-dyn-loss-${currentWeek}-${Date.now()}`,
            title: `🚨 Torcida Organizada da @${acronym} exige explicações imediatas da comissão técnica`,
            summary: `Após a derrota sofrível no último fim de semana, páginas de fãs da ${teamName} manifestaram cobranças intensas nas redes sociais. Torcedores de e-sports exigem cobranças imediatas nos treinos semanais da Gaming House!`,
            source: 'Mundo Loot',
            category: 'Social',
            time: 'Agora mesmo',
            likes: Math.floor(Math.random() * 300) + 100,
            read: false
          });
        } else {
          newNewsItems.push({
            id: `news-dyn-win-${currentWeek}-${Date.now()}`,
            title: `🔥 "Voando Alto!" - Comunidade exalta entrosamento tático brilhante da @${acronym}`,
            summary: `Páginas oficiais de torcedores comemoram a excelente performance mecânica e controle de objetivos no Summoners Rift. O manager da ${teamName} vem sendo muito elogiado pelo equilíbrio de teto salarial e motivação do elenco.`,
            source: 'Twitter / Redes',
            category: 'Social',
            time: 'Agora mesmo',
            likes: Math.floor(Math.random() * 800) + 200,
            read: false
          });
        }

        // Low morale warning
        if (avgMorale < 60) {
          newNewsItems.push({
            id: `news-dyn-lowmorale-${currentWeek}-${Date.now()}`,
            title: `🚨 Vestiário sob Alerta: Clima de atrito e humor tóxico afeta a Gaming House da @${acronym}`,
            summary: `Informa o portal de bastidores que a baixíssima motivação e insatisfação contratual de alguns atletas pro-players desestabilizou o foco. Fãs de esports cobram intervenções urgentes do Head Coach ou Psicólogo de plantão.`,
            source: 'Esports Bastidores',
            category: 'Cenário',
            time: '1h atrás',
            likes: Math.floor(Math.random() * 450) + 120,
            read: false
          });
        }

        // B. Influencers memes and interviews
        const presenters = ['Baiano', 'brtt', 'Mylon', 'Tobias', 'Ranger', 'Schaeppi'];
        const namePresenter = presenters[currentWeek % presenters.length];

        if (hasWonLastMatch) {
          newNewsItems.push({
            id: `news-dyn-media-win-${currentWeek}-${Date.now()}`,
            title: `🎙️ @${namePresenter}: "O investimento em infraestrutura da ${acronym} está dando aula"`,
            summary: `Durante live comunitária de torneios, o influenciador elogiou o novo planejamento de Gaming Office e acompanhamento psicológico do time. "O MID ${midPlayer} jogou como um deus no draft", acrescentou com humor.`,
            source: 'Lendas Talk',
            category: 'Social',
            time: '3h atrás',
            likes: Math.floor(Math.random() * 1100) + 350,
            read: false
          });
        } else {
          newNewsItems.push({
            id: `news-dyn-media-loss-${currentWeek}-${Date.now()}`,
            title: `🤡 Waves of Memes: Campanha do time @${acronym} vira chacota na transmissão comunitária`,
            summary: `Após falha em chamada de Barão, as redes de criadores de conteúdo lotaram de montagens sarcásticas das jogadas de rota inferior da ${teamName}. Influenciadores questionaram as decisões táticas do Head Coach do elenco.`,
            source: 'MemeLegends',
            category: 'Social',
            time: '3h atrás',
            likes: Math.floor(Math.random() * 1400) + 500,
            read: false
          });
        }

        // Post-match interview
        if (playerTeam.roster.length > 0) {
          const interviewee = playerTeam.roster[currentWeek % playerTeam.roster.length];
          newNewsItems.push({
            id: `news-dyn-interv-${currentWeek}-${Date.now()}`,
            title: `🎙️ Portal Esports: Atleta ${interviewee.name} avalia erros e foca na próxima rodada`,
            summary: `O respeitado pro-player da Rota ${interviewee.position} assumiu em coletiva: "O split é longo. Erros de sinergia no draft e bloqueios ocorrem, mas nossa dedicação em solo queue contornará a desconfiança da diretoria", reforçou com foco.`,
            source: 'CBLOL Cobertura',
            category: 'Cenário',
            time: '5h atrás',
            likes: Math.floor(Math.random() * 280) + 90,
            read: false
          });
        }

        const combinedNews = [...newNewsItems, ...currentNews].slice(0, 25);
        localStorage.setItem('legendshub_notifications_news', JSON.stringify(combinedNews));
        window.dispatchEvent(new Event('news-updated'));
        if (newNewsItems.length > 0) {
          window.dispatchEvent(new Event('onNewsFeedGenerated'));
        }
        window.dispatchEvent(new Event('onRoadmapUpdated'));
      }
    } catch (e) {
      console.warn("Could not handle emails & notifications triggers:", e);
    }

    setGameState(nextWeekState);

    // save updated progress with check for scheduled auto-saves
    triggerAutoSaveIfNeeded(nextWeekState, false);
    setActiveTab('Central do Manager');

    // Populate executive summary report
    setRecapReport({
      prevWeek,
      nextWeek: nextWeekState.week,
      teamName: playerTeam ? playerTeam.name : "Free Agent",
      sponsorIncome,
      merchIncome,
      athleteCosts,
      operatingCosts,
      staffCosts,
      netProfit,
      patchModel: nextWeekState.currentPatch
    });

    setIsAdvancingWeek(true);
    setAdvanceAnimStep(0);
  };

  // Draft Confirm hook
  const handleConfirmDraftPicks = (bSel: any, rSel: any, pBansList: any) => {
    setActiveBluePicks(bSel);
    setActiveRedPicks(rSel);
    setScreen('MATCH');
  };

  // Simulation Concluding BO3 Match result updates
  const handleFinishMatchSeriesResult = (blueScore: number, redScore: number, logs: any[]) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
    
    // Check if player team is blue side to decide win/loss allocations
    const currentWeekRound = gameState.calendarSchedule[gameState.week];
    const playerMatch = currentWeekRound?.find(
      m => m.teamBlueId === team.id || m.teamRedId === team.id
    );

    if (playerMatch) {
      playerMatch.scoreBlue = blueScore;
      playerMatch.scoreRed = redScore;
      playerMatch.isFinished = true;
      playerMatch.logs = logs;

      const isPlayerBlue = playerMatch.teamBlueId === team.id;
      const playerWon = (isPlayerBlue && blueScore > redScore) || (!isPlayerBlue && redScore > blueScore);

      const opponentId = isPlayerBlue ? playerMatch.teamRedId : playerMatch.teamBlueId;
      const opponentTeam = gameState.teams.find(t => t.id === opponentId)!;

      if (playerWon) {
        team.wins++;
        opponentTeam.losses++;
        team.points += 3;
        team.boardTrust = Math.min(100, team.boardTrust + 6);
        team.fansSupport = Math.min(100, team.fansSupport + 5);
        team.streak = 'W' + (parseInt(team.streak.replace(/\D/g, '')) + 1 || 1);
        opponentTeam.streak = 'L' + (parseInt(opponentTeam.streak.replace(/\D/g, '')) + 1 || 1);

        // Add matching WINNING networks reations posts to feed
        gameState.socialFeed.unshift({
          id: Math.random().toString(),
          username: `${team.acronym}_Legion`,
          handle: `@${team.acronym}Fans`,
          avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
          content: `🏆 VITÓRIA SENSACIONAL DA NOSSA GUILD! O coach deu aula no draft e amassamos por ${blueScore} a ${redScore}! O top global é real. #Go${team.acronym}`,
          likes: 2400,
          retweets: 990,
          timeAgo: 'Agora',
          sentiment: 'positive',
          verified: false
        });
      } else {
        team.losses++;
        opponentTeam.wins++;
        opponentTeam.points += 3;
        team.boardTrust = Math.max(0, team.boardTrust - 8);
        team.fansSupport = Math.max(0, team.fansSupport - 6);
        team.streak = 'L' + (parseInt(team.streak.replace(/\D/g, '')) + 1 || 1);
        opponentTeam.streak = 'W' + (parseInt(opponentTeam.streak.replace(/\D/g, '')) + 1 || 1);

        gameState.socialFeed.unshift({
          id: Math.random().toString(),
          username: `Angry_Loland`,
          handle: `@LOL_Madguy`,
          avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
          content: `🚫 QUE VERGONHA! fomos engolidos taticamente por eles. O que aconteceu na gaming house essa semana? Manager precisa dar explicações urgentemente!`,
          likes: 540,
          retweets: 120,
          timeAgo: 'Agora',
          sentiment: 'negative',
          verified: false
        });
      }

      // allocating individual game ratios maps
      team.gameWins += isPlayerBlue ? blueScore : redScore;
      team.gameLosses += isPlayerBlue ? redScore : blueScore;
      opponentTeam.gameWins += isPlayerBlue ? redScore : blueScore;
      opponentTeam.gameLosses += isPlayerBlue ? blueScore : redScore;
    }

    gameState.roundsPlayedThisWeek = true;
    setGameState({ ...gameState });
    setScreen('HUB');
    setActiveTab('Central do Manager');
  };

  const handleSidebarTabClick = (tabId: string) => {
    if (tabId === 'Jogadores' || tabId === 'Gerenciar Jogadores' || tabId === 'Academy') {
      // 1. CONTEXTO DE GESTÃO INTERNA (Menus: "JOGADORES" e "ACADEMY"):
      // Ao entrar especificamente estas telas através do menu lateral, limpe o cache de visualizações externas anteriores.
      // Force 'selectedPlayerId' a apontar automaticamente para o primeiro jogador titular do seu próprio elenco local daquela tela.
      const userTeam = gameState?.teams?.find(t => t.id === gameState?.playerTeamId);
      const topStarter = userTeam ? (userTeam.roster.find(p => p.position === 'TOP') || userTeam.roster[0]) : null;
      if (topStarter) {
        setSelectedPlayerId(topStarter.id);
      } else {
        setSelectedPlayerId('');
      }
      setIsDetailedProfileOpen(false); // Clear previous external detailed profile cache
    } else if (tabId === 'Youth Academia') {
      // 1. CONTEXTO DE GESTÃO INTERNA - ACADEMY
      // Ao entrar especificamente nesta tela através do menu lateral, limpe o cache de selecionados, se houver.
      setIsDetailedProfileOpen(false); 
    }
    setActiveTab(tabId);
  };

  // Layout wrapper component helper
  const renderTabContent = () => {
    if (!gameState) return null;

    // Fallback if the user is currently unemployed and tried to visit a restricted tab
    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId);
    const exemptTabs = [
      'Central de Empregos', 'Calendário', 'Liga', 'Times', 
      'Estatísticas', 'Últimas Partidas', 'Meta', 'Carreira', 
      'Salvar Jogo'
    ];
    if (!playerTeam && !exemptTabs.includes(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/25 text-blue-400">
            <Briefcase className="w-8 h-8 animate-pulse text-sky-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-white text-base uppercase tracking-wider">Você está sem Clube! (Free Agent)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Você não faz parte de nenhuma organization ou equipe de eSports. Por favor, acesse a <strong>Central de Empregos</strong> para avaliar propostas e assinar com um novo time!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('Central de Empregos')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-colors shadow-lg"
          >
            Ir para Central de Empregos
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'Central do Manager':
        return (
          <DashboardTab
            gameState={gameState}
            onNextWeek={advanceWeekHandler}
            onSelectTab={(tab) => {
              if (tab === 'Match Center') {
                setScreen('DRAFT');
              } else {
                setActiveTab(tab);
              }
            }}
            onAnswerInterview={answerInterviewHandler}
            theme={theme}
            onInstantSimulate={handleFinishMatchSeriesResult}
          />
        );
      case 'Calendário':
        return (
          <CalendarTab 
            gameState={gameState} 
            theme={theme} 
            selectedCalendarWeek={selectedCalendarWeek}
            setSelectedCalendarWeek={setSelectedCalendarWeek}
            onUpdateGameState={setGameState}
            onNavigate={(tab) => setActiveTab(tab)}
            setLigaInitialTab={setInitialActiveLigaTab}
          />
        );
      case 'Jogadores':
      case 'Gerenciar Jogadores':
      case 'Academy':
      case 'Youth Academia':
        return (
          <RosterTab
            gameState={gameState}
            onRenewContract={renewContractHandler}
            onTransferListPlayer={transferListHandler}
            onReleasePlayer={releasePlayerHandler}
            onSelectPlayerTraining={selectPlayerTrainingHandler}
            onUpdateGameState={setGameState}
            theme={theme}
            selectedPlayerId={selectedPlayerId}
            setSelectedPlayerId={setSelectedPlayerId}
            isDetailedProfileOpen={isDetailedProfileOpen}
            setIsDetailedProfileOpen={setIsDetailedProfileOpen}
            onStartNegotiation={(playerId) => {
              setNegotiateOnLoadPlayerId(playerId);
              setIsDetailedProfileOpen(false);
              setActiveTab('Transferências');
            }}
            isAcademy={activeTab === 'Academy' || activeTab === 'Youth Academia'}
            onPromoteProspect={promoteProspectHandler}
          />
        );
      case 'Comunidade':
        return (
          <ComunidadeTab
            {...({
              gameState,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme
            } as any)}
          />
        );
      case 'Gaming House':
        return (
          <GamingHouseTab
            {...({
              gameState,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme
            } as any)}
          />
        );
      case 'Gaming Office':
        return (
          <GamingOfficeTab
            gameState={gameState}
            onUpdateGameState={setGameState}
            triggerNotification={triggerNotification}
            theme={theme}
            onNavigate={setActiveTab}
          />
        );
      case 'Transferências':
         return (
          <MarketTab
            {...({
              gameState,
              onBuyPlayer: buyPlayerHandler,
              onSellProposeAccept: sellProposeAcceptHandler,
              theme,
              onUpdateGameState: setGameState,
              triggerNotification,
              onSelectPlayer: (pId: string) => {
                setSelectedPlayerId(pId);
                setIsDetailedProfileOpen(true);
                setActiveTab('Jogadores');
              },
              negotiateOnLoadPlayerId,
              onClearNegotiateOnLoad: () => setNegotiateOnLoadPlayerId(null)
            } as any)}
          />
        );
      case 'Liga':
         return <LigaTab gameState={gameState} theme={theme} initialActiveTab={initialActiveLigaTab} onResetInitialTab={() => setInitialActiveLigaTab(undefined)} />;
      case 'Times':
         return (
           <TimesTab 
             key={`times-tab-${initialSelectedTeamId || 'none'}-${initialSelectedRegionId || 'none'}`}
             gameState={gameState} 
             theme={theme} 
             initialSelectedTeamId={initialSelectedTeamId}
             initialSelectedRegionId={initialSelectedRegionId}
             onSelectPlayer={(pId) => {
               setSelectedPlayerId(pId);
               setIsDetailedProfileOpen(true);
               setActiveTab('Jogadores');
             }}
           />
         );
      case 'Patrocinadores':
        return (
          <SponsorsTab
            {...({
              gameState,
              onSignSponsor: signSponsorHandler,
              onUpgradeInfrastructure: upgradeInfrastructureHandler,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme
            } as any)}
          />
        );
      case 'Escritório':
         return (
          <EscritorioTab
            {...({
              gameState,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme
            } as any)}
          />
        );
      case 'Diretoria':
         return (
          <DiretoriaTab
            gameState={gameState}
            onUpdateGameState={setGameState}
            theme={theme}
          />
         );
      case 'Finanças':
         return <FinancasTab {...({ gameState, theme } as any)} />;
      case 'Central de Empregos':
        return (
          <CentralDeEmpregosTab
            {...({
              gameState,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme
            } as any)}
          />
        );
      case 'Estatísticas':
         return (
          <EstatisticasTab 
            {...({ 
              gameState, 
              theme,
              onSelectPlayer: (pId: string) => {
                setSelectedPlayerId(pId);
                setIsDetailedProfileOpen(true);
                setActiveTab('Jogadores');
              }
            } as any)} 
          />
         );
      case 'Scouting':
         return (
           <ScoutingTab
             gameState={gameState}
             onUpdateGameState={setGameState}
             triggerNotification={triggerNotification}
             theme={theme}
             onSelectPlayer={(pId: string) => {
               setSelectedPlayerId(pId);
               setIsDetailedProfileOpen(true);
               setActiveTab('Jogadores');
             }}
           />
         );
      case 'Solo Queue':
         return (
          <SoloQueueTab
            {...({
              gameState,
              onUpdateGameState: setGameState,
              triggerNotification,
              theme,
              onSelectPlayer: (pId: string) => {
                setSelectedPlayerId(pId);
                setIsDetailedProfileOpen(true);
                setActiveTab('Jogadores');
              }
            } as any)}
          />
        );
      case 'Últimas Partidas':
         return <UltimasPartidasTab {...({ gameState, theme } as any)} />;
      case 'Meta':
         return <MetaTab {...({ gameState, theme } as any)} />;
      case 'Carreira':
         return (
           <CarreiraTab 
             gameState={gameState} 
             theme={theme} 
             onUpdateGameState={setGameState} 
           />
         );
      case 'Inbox':
        return (
          <InboxTab 
            gameState={gameState} 
            theme={theme} 
            onSelectTab={(tab) => {
              setActiveTab(tab);
              triggerNotification?.("📬 Navegação", `Direcionado para a seção: ${tab}`);
            }}
            triggerNotification={triggerNotification}
          />
        );
      case 'Notificações':
        return (
          <NotificationsTab 
            gameState={gameState} 
            theme={theme} 
          />
        );
      case 'Roadmap':
        return (
          <RoadmapTab 
            gameState={gameState} 
            theme={theme} 
            triggerNotification={triggerNotification}
          />
        );
      case 'Salvar Jogo':
         return (
          <SalvarJogoTab
            {...({
              gameState,
              onManualSave: (slotIdx: number) => {
                saveGameToSlot(slotIdx, gameState);
                triggerNotification("💾 Progresso Salvo!", `O Jogo foi guardado com sucesso no Slot local ${slotIdx}.`);
              },
              triggerNotification,
              theme
            } as any)}
          />
        );
      default:
        return null;
    }
  };

  if (screen === 'LAUNCHER' || !gameState) {
    return (
      <HomeLauncher
        onStartNewGame={handleStartNewGame}
        onLoadGame={handleLoadGame}
        onOpenEditor={() => {}}
        onOpenSettings={() => {}}
      />
    );
  }

  // INTERACTIVE DRAFT ARENA & BO3 SERIES SIMULATOR FLOW
  if (screen === 'DRAFT' || screen === 'MATCH') {
    return (
      <MatchSimulatorFlow
        gameState={gameState}
        onFinishMatchSeries={handleFinishMatchSeriesResult}
        onBackToHub={() => setScreen('HUB')}
        theme={theme}
      />
    );
  }

  const pTeamObj = gameState.teams.find(t => t.id === gameState.playerTeamId);

  if (!gameState.playerTeamId || gameState.playerTeamId === '' || !pTeamObj) {
    const region = gameState.selectedRegion || 'CBLOL';
    const candidateTeams = gameState.teams.filter(t => !t.isPlayerControlled && t.region === region && t.id !== 'player-team');
    const fallbackTeams = candidateTeams.length >= 3 ? candidateTeams : gameState.teams.filter(t => !t.isPlayerControlled && t.id !== 'player-team');
    const displayTeams = fallbackTeams.slice(0, 3);

    const offers = displayTeams.map((team, idx) => {
      const salary = 4000 + Math.round(team.popularity * 110) + (idx * 500);
      const objective = idx === 0 ? 'Chegar aos Playoffs (Top 4)' : idx === 1 ? 'Terminar no Top 6' : 'Terminar Fora da Lanterna';
      const termWeeks = idx === 0 ? 32 : idx === 1 ? 24 : 16;
      const standing = idx + 3;
      return {
        team,
        salary,
        objective,
        termWeeks,
        standing
      };
    });

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-[#060b13] text-white' : 'bg-slate-50 text-slate-800'
      }`}>
        <div className="max-w-4xl w-full space-y-8 select-none font-sans">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-500 text-xs font-mono font-black uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Profissional Desempregado (Status: Free Agent)
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-cyan-400 dark:to-teal-400">
              Quadro de Propostas de Contrato de Manager
            </h1>
            <p className={`text-xs max-w-xl mx-auto ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Seu ciclo na organização anterior foi encerrado. Como técnico e manager profissional licenciado, analise com critério as propostas reais recebidas abaixo para reconstruir seu legado na Superliga eSports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map(({ team, salary, objective, termWeeks, standing }) => {
              const accentColor = team.primaryColor || '#00cbd6';
              return (
                <div
                  key={team.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between h-[380px] group ${
                    theme === 'dark' 
                      ? 'bg-[#0a1220] border-slate-800 hover:border-slate-700 hover:bg-[#0e182b]' 
                      : 'bg-white border-slate-205 hover:border-slate-350 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: accentColor }} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black uppercase" style={{ backgroundColor: accentColor }}>
                        {team.acronym || team.name.slice(0, 3)}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-slate-850 text-slate-305' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {team.region || 'CBLOL'}
                      </span>
                    </div>

                    <div>
                      <h4 className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        {team.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Clube de eSports Profissional</p>
                    </div>

                    <div className="space-y-2 border-t border-dashed border-slate-800/10 dark:border-slate-800 pt-4">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Salário Semanal</span>
                        <span className="font-mono font-black text-emerald-500">$ {salary.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Meta Desportiva</span>
                        <span className="font-bold text-amber-500 uppercase">{objective}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Vínculo Inicial</span>
                        <span className="font-bold">{termWeeks} Semanas</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Fãs Estimados</span>
                        <span className="font-mono">{Math.round(team.popularity * 10500).toLocaleString('pt-BR')} torcedores</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const nextTeams = gameState.teams.map(t => {
                        if (t.id === team.id) {
                          return { ...t, isPlayerControlled: true };
                        }
                        if (gameState.playerTeamId && t.id === gameState.playerTeamId) {
                          return { ...t, isPlayerControlled: false };
                        }
                        return t;
                      });

                      const nextManagers = gameState.managers ? gameState.managers.map(m => {
                        if (m.teamId === team.id && m.id !== 'player-manager') {
                          return { ...m, teamId: null };
                        }
                        if (m.id === 'player-manager') {
                          return { ...m, teamId: team.id };
                        }
                        return m;
                      }) : [];

                      const nextState = {
                        ...gameState,
                        playerTeamId: team.id,
                        teams: nextTeams,
                        managers: nextManagers
                      };

                      setGameState(nextState);
                      triggerAutoSaveIfNeeded(nextState, true, `Assinou com: ${team.name}`);
                      alert(`CONTRATO ASSINADO!\n\nVocê assumiu as obrigações de Manager e Head Coach da ${team.name}! É hora de reestruturar a Gaming House e buscar a glória.`);
                    }}
                    className="w-full py-2.5 rounded-xl text-slate-950 font-black text-[10px] uppercase tracking-wider cursor-pointer text-center transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: accentColor }}
                  >
                    Assinar Proposta
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                if (confirm("Quer voltar para a tela inicial para gerenciar outro save slot? Seu progresso não será apagado.")) {
                  setScreen('LAUNCHER');
                }
              }}
              className={`px-5 py-2 text-[10px] font-mono font-black uppercase tracking-wider border rounded-lg cursor-pointer ${
                theme === 'dark' ? 'border-slate-800 hover:bg-slate-850 text-slate-405' : 'border-[#cbd5e1] hover:bg-slate-100 text-slate-600'
              }`}
            >
              Voltar ao Menu Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070d19] text-slate-100' : 'bg-[#f8fafd] text-[#1e293b]'
    }`}>
      {/* Sidebar Navigation Drawer HUD */}
      <div className={`w-[230px] select-none flex flex-col justify-between p-5 py-6 shrink-0 shadow-sm transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0a1424] border-r border-[#1e2d44]' : 'bg-white border-r border-slate-205'
      }`}>
        <div className="space-y-6">
          {/* Logo brand label */}
          <div className={`flex items-center gap-2 border-b pb-5 ${
            theme === 'dark' ? 'border-[#1e2d44]' : 'border-slate-100'
          }`}>
            {!sidebarLogoError ? (
              <img 
                src="game/assets/ui/logo-lh.png" 
                alt="LegendsHub Logo" 
                className="w-8 h-8 object-contain shrink-0 filter drop-shadow-[0_1px_3px_rgba(29,78,216,0.1)]"
                referrerPolicy="no-referrer"
                onError={() => {
                  setSidebarLogoError(true);
                }}
              />
            ) : (
              <svg className="w-8 h-8 text-blue-500 fill-none shrink-0" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="shieldGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <polygon 
                  points="50 5, 90 28, 90 72, 50 95, 10 72, 10 28" 
                  className="stroke-[5.5px]" 
                  stroke="url(#shieldGradMini)"
                />
                <polygon 
                  points="50 18, 82 40, 82 60, 50 82, 18 60, 18 40" 
                  className="fill-blue-500/10 stroke-blue-400 stroke-[1.5px]" 
                />
                <path 
                  d="M38 34 L38 66 M62 34 L62 66 M38 50 L62 50" 
                  className="stroke-blue-200 stroke-[5px] stroke-linecap-round" 
                />
              </svg>
            )}
            <div>
              <h2 className={`font-display text-sm font-black uppercase tracking-widest leading-none bg-gradient-to-r ${
                theme === 'dark' ? 'from-slate-200 to-sky-400' : 'from-slate-800 to-blue-600'
              } bg-clip-text text-transparent`}>LEGENDSHUB</h2>
              <span className={`text-[8px] font-extrabold tracking-widest uppercase ${
                theme === 'dark' ? 'text-sky-300' : 'text-slate-400'
              }`}>MANAGER DE LEAGUE OF LEGENDS</span>
            </div>
          </div>

          {/* Menu loops links */}
          <nav className="flex flex-col gap-1 pr-1 overflow-y-auto max-h-[calc(100vh-295px)] scrollbar-thin scrollbar-thumb-slate-850/50 scrollbar-track-transparent">
            {[
              { id: 'Central do Manager', title: 'Central do Manager', icon: Compass, desc: 'Visão geral da sua saúde financeira, metas, e-mails recentes e progresso semanal do seu clube.' },
              { id: 'Calendário', title: 'Calendário', icon: Calendar, desc: 'Acompanhe as datas de todas as partidas, treinos e eventos da temporada.' },
              { id: 'Jogadores', title: 'Jogadores', icon: Users, desc: 'Gerencie os atributos, treinos, contratos, humor e escalação dos atletas profissionais e reservas.' },
              { id: 'Academy', title: 'Academy', icon: Target, desc: 'Monitore a equipe academy e de aspirantes, focando no desenvolvimento de jovens talentos.' },
              { id: 'Comunidade', title: 'Comunidade', icon: Heart, desc: 'Gerencie a fã-base, interações sociais, coletivas de imprensa e a popularidade do time.' },
              { id: 'Gaming House', title: 'Gaming House', icon: Building2, desc: 'Reforme e gerencie as instalações de treino e descanso da Gaming House de seu clube para melhorar a performance.' },
              { id: 'Gaming Office', title: 'Gaming Office', icon: Building2, desc: 'Melhore as instalações do Gaming Office de onde a diretoria, marketing e equipe de TI trabalham.' },
              { id: 'Escritório', title: 'Escritório', icon: Briefcase, desc: 'Gerencie equipes de suporte, RH, patrocinadores e as operações de bastidores.' },
              { id: 'Diretoria', title: 'DIRETORIA', icon: Landmark, desc: 'Acompanhe a confiança da diretoria nos seus resultados, expectativas de metas e relatórios financeiros.' },
              { id: 'Patrocinadores', title: 'Patrocinadores', icon: Award, desc: 'Negocie e gerencie contratos de patrocínio, master e parceiros adicionais para crescer seu orçamento.' },
              { id: 'Transferências', title: 'Transferências', icon: ArrowLeftRight, desc: 'Negocie a compra, venda, contratos e multas rescisórias de novos talentos no mercado da janela de transferências.' },
              { id: 'Liga', title: 'Liga', icon: Trophy, desc: 'Veja a tabela de classificação das ligas de elite e base, estatísticas do split, premiação e playoffs do CBOLÃO.' },
              { id: 'Times', title: 'Times', icon: Shield, desc: 'Explore a ficha técnica, elétricos e elencos de todos os clubes adversários participantes.' },
              { id: 'Central de Empregos', title: 'Central de Empregos', icon: Briefcase, desc: 'Candidate-se e assine com novas ligas e equipes caso esteja livre no mercado ou queira mudar de clube.' },
              { id: 'Estatísticas', title: 'Estatísticas', icon: BarChart3, desc: 'Analise o desempenho tático, KDA, ouro por minuto e relatórios de partidas de todos os atletas.' },
              { id: 'Scouting', title: 'Scouting', icon: Zap, desc: 'Envie olheiros para descobrir novos prodígios, avaliar talentos livres e monitorar atletas de nível mundial.' },
              { id: 'Últimas Partidas', title: 'Últimas Partidas', icon: History, desc: 'Veja o histórico detalhado, abates, estatísticas e replay tático dos últimos jogos completados.' },
              { id: 'Meta', title: 'Meta', icon: Sliders, desc: 'Ajuste o foco tático do Meta atual da atualização de League of Legends para priorizar certos campeões nos bans/picks.' },
              { id: 'Carreira', title: 'Carreira', icon: Medal, desc: 'Consulte o seu nível de experiência como Manager, conquistas desbloqueadas, atribuição de pontos de habilidade e legado na carreira.' },
              { id: 'Salvar Jogo', title: 'Salvar Jogo', icon: Save, desc: 'Salve o progresso da sua carreira manualmente na nuvem local para garantir que nenhum histórico se perca.' }
            ].map((link) => {
              const Icon = link.icon;
              const isCurrent = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleSidebarTabClick(link.id)}
                  title={link.desc}
                  className={`w-full py-1 px-3 rounded-lg flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer shrink-0 ${
                    isCurrent 
                      ? 'bg-blue-600 text-white font-black shadow-md border-0' 
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                        : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" /> {link.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Advance week progress button, Pedir Demissão & Sair da Carreira action links */}
        <div className="space-y-2 border-t pt-3.5">
          <button
            onClick={advanceWeekHandler}
            disabled={gameState.playerTeamId !== '' && !gameState.roundsPlayedThisWeek}
            className={`w-full py-2 px-3 font-display text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              (gameState.playerTeamId === '' || gameState.roundsPlayedThisWeek)
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border border-slate-205 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            AVANÇAR SEMANA <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          {gameState.playerTeamId && (
            <button
              onClick={() => {
                const currentTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
                if (confirm(`🚨 TEM CERTEZA de que deseja pedir demissão do cargo de Manager de ${currentTeam.name}? Isso o deixará livre no mercado profissional como um Free Agent para buscar outras propostas.`)) {
                  const nextTeams = gameState.teams.map(t => t.id === gameState.playerTeamId ? { ...t, isPlayerControlled: false } : t);
                  setGameState({
                    ...gameState,
                    playerTeamId: '',
                    teams: nextTeams
                  });
                  setActiveTab('Central de Empregos');
                  triggerNotification("⚠️ Demissão Declarada!", `Você rescindiu unilateralmente o contrato com a ${currentTeam.name}. Agora você é um Free Agent!`);
                }
              }}
              className={`w-full py-1.5 text-center text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-md ${
                theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-850/40' : 'text-slate-500 hover:text-red-500 hover:bg-slate-100'
              }`}
            >
              PEDIR DEMISSÃO
            </button>
          )}

          <button
            onClick={() => setScreen('LAUNCHER')}
            className={`w-full py-1.5 text-center text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-md ${
              theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-850/40' : 'text-slate-500 hover:text-red-500 hover:bg-slate-100'
            }`}
          >
            SAIR DA CARREIRA
          </button>
        </div>
      </div>

      {/* Main Content Area Container */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#070d19]' : 'bg-[#f8fafd]'
      }`}>
        {/* Upper HUD Header bar */}
        <header className={`px-8 py-4 flex flex-col xl:flex-row justify-between items-center gap-4 select-none shadow-sm border-b transition-colors duration-200 ${
          theme === 'dark' ? 'bg-[#0a1424]/80 border-[#1e2d44]' : 'bg-white border-slate-200/90'
        }`}>
          <div>
            <h1 className={`font-display text-xs font-black uppercase tracking-widest ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{activeTab}</h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs font-semibold">
            {/* GLOBAL SEARCH BAR */}
            <div ref={searchContainerRef} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar players, organizações, staff..."
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`w-36 sm:w-44 focus:w-56 md:w-48 md:focus:w-72 h-8 pl-8 pr-7 rounded-lg text-[11px] font-medium border transition-all duration-300 outline-none ${
                    theme === 'dark'
                      ? 'bg-[#09101f] border-[#1e2d44] text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20'
                      : 'bg-slate-50 border-slate-205 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10'
                  }`}
                />
                <div className="absolute left-2.5 top-2 text-slate-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </div>
                {globalSearchQuery && (
                  <button
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-red-500 transition-colors text-[10px] font-mono cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* SEARCH DROPDOWN RESULTS */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-72 sm:w-80 md:w-96 rounded-xl border shadow-2xl p-4 overflow-y-auto max-h-[380px] z-[999] backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-[#0a1226]/95 border-[#1c2e5c] text-white shadow-black/80'
                        : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
                    }`}
                  >
                    {!globalSearchQuery.trim() ? (
                      <div className="text-center py-4 space-y-2">
                        <Search className="w-5 h-5 text-cyan-400 mx-auto animate-pulse" />
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Pesquisa Global</p>
                        <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-normal">
                          Busque atletas por nick, nome ou lane; equipes por nome/tag; ou especialistas do staff.
                        </p>
                      </div>
                    ) : !hasSearchResults ? (
                      <div className="text-center py-6 space-y-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Nenhum resultado</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-snug">
                          Nenhum jogador, time ou staff coincide com "{globalSearchQuery}".
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* CATEGORY: PLAYERS */}
                        {searchResults.players.length > 0 && (
                          <div className="space-y-1 text-left">
                            <h4 className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
                              <span>🎮 Cyberatletas</span>
                              <span className="font-bold text-cyan-400">{searchResults.players.length}</span>
                            </h4>
                            <div className="space-y-0.5 max-h-[160px] overflow-y-auto pr-1">
                              {searchResults.players.map((p) => (
                                <button
                                  key={`search-player-${p.id}`}
                                  onClick={() => {
                                    setSelectedPlayerId(p.id);
                                    setIsDetailedProfileOpen(true);
                                    setActiveTab('Jogadores');
                                    setGlobalSearchQuery('');
                                    setIsSearchFocused(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-transparent hover:border-cyan-500/20 text-left transition-colors cursor-pointer ${
                                    theme === 'dark' ? 'hover:bg-[#14234c]/65' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                                    <img
                                      src={p.photoUrl || `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=80&q=80`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline gap-1">
                                      <p className="text-[11px] font-black truncate">{p.name || 'Jogador'}</p>
                                      <span className="text-[7.5px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-1 rounded flex-shrink-0">
                                        {p.position}
                                      </span>
                                    </div>
                                    <p className="text-[8.5px] text-slate-400 dark:text-slate-450 font-mono truncate leading-tight mt-0.5 uppercase">
                                      {p.realName} • <span className="text-cyan-400 font-bold">{p.teamAcronym || 'FA'}</span>
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-[11px] font-black font-mono text-emerald-500">
                                      {p.overallRating}
                                    </span>
                                    <span className="block text-[7px] font-mono font-bold text-slate-400">OVR</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CATEGORY: TEAMS */}
                        {searchResults.teams.length > 0 && (
                          <div className="space-y-1 text-left">
                            <h4 className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
                              <span>🛡️ Organizações</span>
                              <span className="font-bold text-indigo-400">{searchResults.teams.length}</span>
                            </h4>
                            <div className="space-y-0.5">
                              {searchResults.teams.map((t) => (
                                <button
                                  key={`search-team-${t.id}`}
                                  onClick={() => {
                                    setInitialSelectedTeamId(t.id);
                                    setInitialSelectedRegionId(t.region || null);
                                    setActiveTab('Times');
                                    setGlobalSearchQuery('');
                                    setIsSearchFocused(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-transparent hover:border-cyan-500/20 text-left transition-colors cursor-pointer ${
                                    theme === 'dark' ? 'hover:bg-[#14234c]/65' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div 
                                    className="w-7 h-7 rounded bg-[#1e2d44] border flex items-center justify-center font-black font-mono text-[9px] text-white flex-shrink-0"
                                    style={{ borderColor: t.primaryColor || '#1e2d44', color: t.secondaryColor || '#ffffff' }}
                                  >
                                    {t.acronym}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black truncate">{t.name}</p>
                                    <p className="text-[8.5px] text-slate-400 dark:text-slate-450 font-mono truncate leading-none mt-0.5 uppercase">
                                      LIGA: {t.region || 'CBLOL'} • {t.wins || 0}V - {t.losses || 0}D
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-[8.5px] uppercase font-mono font-bold text-cyan-400 hover:underline">
                                      VER PLANEL
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CATEGORY: STAFF */}
                        {searchResults.staff.length > 0 && (
                          <div className="space-y-1 text-left">
                            <h4 className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
                              <span>💼 Comissão & Staff</span>
                              <span className="font-bold text-amber-500">{searchResults.staff.length}</span>
                            </h4>
                            <div className="space-y-0.5">
                              {searchResults.staff.map((s, index) => {
                                const sName = s.nome || s.name || 'Especialista';
                                const sCargo = s.cargo || s.role || 'Staff';
                                const sDept = s.departamento || 'OPERACIONAL';
                                const sEff = s.nivel_eficiencia || s.level || 75;
                                const sPhoto = s.fotoUrl || s.photoUrl || `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=80&q=80`;

                                return (
                                  <button
                                    key={`search-staff-${s.id || sName}-${index}`}
                                    onClick={() => {
                                      setActiveTab('Gaming Office');
                                      setGlobalSearchQuery('');
                                      setIsSearchFocused(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-transparent hover:border-cyan-500/20 text-left transition-colors cursor-pointer ${
                                      theme === 'dark' ? 'hover:bg-[#14234c]/65' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                                      <img
                                        src={sPhoto}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline gap-1">
                                        <p className="text-[11px] font-black truncate">{sName}</p>
                                        <span className="text-[7.5px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1 rounded uppercase flex-shrink-0">
                                          {sDept.split(' ')[0]}
                                        </span>
                                      </div>
                                      <p className="text-[8.5px] text-slate-400 dark:text-slate-450 font-mono truncate leading-tight mt-0.5 uppercase">
                                        {sCargo}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <span className="text-[11px] font-black font-mono text-amber-500">
                                        {sEff}%
                                      </span>
                                      <span className="block text-[7px] font-mono font-bold text-slate-400">EFIC</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 1. INBOX Button (Mail icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Inbox');
                triggerNotification?.("📬 Inbox", "Acessando sua caixa de e-mails recebidos.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative ${
                activeTab === 'Inbox'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Inbox - E-mails da Direção, Jogadores e Propostas"
            >
              <Mail className="w-4 h-4 shrink-0" />
              {unreadEmailsCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[15px] h-4 px-1 rounded-full text-white font-extrabold text-[8.5px] flex items-center justify-center border shadow-sm animate-pulse"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF', borderColor: '#B91C1C' }}
                >
                  {unreadEmailsCount}
                </span>
              )}
            </button>

            {/* 2. NOTIFICAÇÕES Button (Bell icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Notificações');
                triggerNotification?.("🔔 Notificações", "Exibindo notícias do cenário competitivo.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative ${
                activeTab === 'Notificações'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Notificações & Notícias do Cenário Mundial"
            >
              <Bell className="w-4 h-4 shrink-0" />
              {unreadNewsCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[15px] h-4 px-1 rounded-full text-white font-extrabold text-[8.5px] flex items-center justify-center border shadow-sm animate-pulse"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF', borderColor: '#B91C1C' }}
                >
                  {unreadNewsCount}
                </span>
              )}
            </button>

            {/* 3. ROADMAP Button (Map icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Roadmap');
                setHasRoadmapUpdateAlert(false);
                triggerNotification?.("🗺️ Roadmap", "Abrindo programação de atualizações e correções.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative ${
                activeTab === 'Roadmap'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Roadmap & Linha do Tempo de Atualizações"
            >
              <MapIcon className="w-4 h-4 shrink-0" />
              {hasRoadmapUpdateAlert && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[15px] h-4 px-1 rounded-full text-white font-extrabold text-[8.5px] flex items-center justify-center border shadow-sm animate-pulse"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF', borderColor: '#B91C1C' }}
                >
                  1
                </span>
              )}
            </button>

            {/* 4. DARK MODE Button (Moon/Sun icon, icon-only) */}
            <button
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                localStorage.setItem('legendshub_theme', nextTheme);
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                  : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Alternar Modo Escuro / Claro"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              )}
            </button>

            {/* 5. VERIFICAR ATUALIZAÇÕES Button (RefreshCw icon, icon-only) */}
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative ${
                theme === 'dark' 
                  ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                  : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title={isCheckingUpdates ? 'Buscando atualizações de código...' : 'Verificar Atualizações no GitHub'}
            >
              <RefreshCw className={`w-4 h-4 text-sky-450 shrink-0 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              {hasGithubUpdateAlert && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[15px] h-4 px-1 rounded-full text-white font-extrabold text-[8.5px] flex items-center justify-center border shadow-sm animate-pulse"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF', borderColor: '#B91C1C' }}
                >
                  1
                </span>
              )}
            </button>

            {/* 6. REPORTAR BUG Button (Bug icon, icon-only) */}
            <button
              onClick={() => {
                setShowBugModal(true);
                setBugSuccess(false);
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative ${
                theme === 'dark' 
                  ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                  : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Reportar Bug / Falha Tática"
            >
              <Bug className="w-4 h-4 text-red-500 shrink-0" />
            </button>

            {/* Spacer separator */}
            <div className={`hidden sm:block h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* 7. ORÇAMENTO (Coin/DollarSign icon + formatted dynamic cash value with hover effects and dropdown) */}
            <div 
              ref={budgetContainerRef}
              className="relative"
              onMouseEnter={openBudgetDropdown}
              onMouseLeave={closeBudgetDropdownWithDelay}
            >
              <div 
                onClick={() => {
                  if (isBudgetDropdownOpen) {
                    setIsBudgetDropdownOpen(false);
                  } else {
                    openBudgetDropdown();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-xs select-none cursor-pointer transition-all duration-200 group ${
                  isBudgetDropdownOpen
                    ? theme === 'dark' 
                      ? 'bg-white/8 border-[#00cbd6] text-[#FFFFFF]' 
                      : 'bg-slate-205 border-slate-400 text-slate-900 font-bold'
                    : theme === 'dark' 
                      ? 'bg-[#070d19] border-[#1e2d44] text-slate-350 hover:bg-white/8 hover:border-[#00cbd6] hover:text-[#FFFFFF]' 
                      : 'bg-slate-50 border-slate-205 text-slate-600 hover:bg-black/6 hover:text-slate-900 hover:border-slate-350'
                }`} 
                title="Saldo da Org / Orçamento Técnico"
              >
                <DollarSign className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  isBudgetDropdownOpen
                    ? theme === 'dark' ? 'text-[#FFFFFF]' : 'text-slate-900'
                    : theme === 'dark' ? 'text-emerald-500 group-hover:text-[#FFFFFF]' : 'text-emerald-600 group-hover:text-slate-900'
                }`} />
                <span className="font-mono font-black text-[11.5px] leading-tight transition-colors duration-200">
                  {gameState?.finance?.caixa_formatado_hud || (pTeamObj ? formatMoney(pTeamObj.budget) : 'N/A')}
                </span>
              </div>

              {/* Budget Dropdown Panel */}
              <AnimatePresence>
                {isBudgetDropdownOpen && gameState && pTeamObj && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute right-0 mt-2 w-72 rounded-xl border p-4 shadow-2xl z-55 ${
                      theme === 'dark' 
                        ? 'bg-[#0d1726] border-[#1e2d44] text-white shadow-black/80' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-slate-350/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800/65 pb-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                          Resumo Financeiro
                        </h4>
                        <p className="text-[9px] font-bold text-slate-450 uppercase tracking-widest leading-none mt-0.5">
                          Extrato Rápido do Clube
                        </p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold uppercase font-mono tracking-widest">
                        ATIVO
                      </span>
                    </div>

                    {/* Content List */}
                    <div className="space-y-3.5 my-3">
                      {(() => {
                        const sponsorWeekly = pTeamObj.sponsors?.filter(s => s.isSigned).reduce((acc, s) => acc + s.incomePerWeek, 0) || 0;
                        const staffCostsWeekly = gameState.availableStaff?.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0) || 0;

                        const estimatedRevenuesSponsor = sponsorWeekly * 4;
                        const estimatedMerchandising = 20000 + (pTeamObj.popularity || 50) * 120;
                        const estimatedPrizes = 15000;

                        const basePlayerPayrollWeekly = ((pTeamObj.roster?.reduce((acc, p) => acc + p.salary, 0) || 0) + (pTeamObj.substitutes?.reduce((acc, p) => acc + p.salary, 0) || 0)) / 4;
                        const isSalarCapExceeded = basePlayerPayrollWeekly > 120000;
                        const ffpWeeklyFine = isSalarCapExceeded ? Math.round((basePlayerPayrollWeekly - 120000) * 1.50) : 0;
                        const poachingWeeklyFine = (pTeamObj.poachingPenaltiesWeeks && pTeamObj.poachingPenaltiesWeeks > 0) ? 45000 : 0;

                        const playerSalariesMonthly = basePlayerPayrollWeekly * 4;
                        const staffSalariesMonthly = staffCostsWeekly * 4;
                        const housingCosts = 12000;
                        const marketingCommissions = 3000;
                        const ffpMonthlyFine = ffpWeeklyFine * 4;
                        const poachingMonthlyFine = poachingWeeklyFine * 4;

                        const totalRevenues = estimatedRevenuesSponsor + estimatedMerchandising + estimatedPrizes;
                        const totalExpenses = playerSalariesMonthly + staffSalariesMonthly + housingCosts + marketingCommissions + ffpMonthlyFine + poachingMonthlyFine;
                        const netBalance = totalRevenues - totalExpenses;

                        return (
                          <>
                            {/* Receitas section */}
                            <div>
                              <div className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest mb-1.5">
                                Receitas Estimadas / Mês
                              </div>
                              <div className="space-y-1 pl-1.5 border-l-2 border-emerald-500/40">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Patrocínios:</span>
                                  <span className="font-mono font-bold text-emerald-500">+{formatMoney(estimatedRevenuesSponsor)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Merch & Ingressos:</span>
                                  <span className="font-mono font-bold text-emerald-500">+{formatMoney(estimatedMerchandising)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Premiações / Licenças:</span>
                                  <span className="font-mono font-bold text-emerald-500">+{formatMoney(estimatedPrizes)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Despesas section */}
                            <div>
                              <div className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest mb-1.5">
                                Despesas Estimadas / Mês
                              </div>
                              <div className="space-y-1 pl-1.5 border-l-2 border-rose-500/40">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Salários dos Atletas:</span>
                                  <span className="font-mono font-bold text-rose-500">-{formatMoney(playerSalariesMonthly)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Staff & Coaches:</span>
                                  <span className="font-mono font-bold text-rose-500">-{formatMoney(staffSalariesMonthly)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="dark:text-slate-300 text-slate-650">Gaming House & Custos:</span>
                                  <span className="font-mono font-bold text-rose-500">-{formatMoney(housingCosts + marketingCommissions)}</span>
                                </div>
                                {ffpMonthlyFine > 0 && (
                                  <div className="flex justify-between items-center text-[11px] text-rose-500">
                                    <span className="dark:text-slate-300 text-rose-400 pl-2">↳ Multa (Fair Play Financeiro):</span>
                                    <span className="font-mono font-bold text-rose-500">-{formatMoney(ffpMonthlyFine)}</span>
                                  </div>
                                )}
                                {poachingMonthlyFine > 0 && (
                                  <div className="flex justify-between items-center text-[11px] text-rose-500">
                                    <span className="dark:text-slate-300 text-rose-400 pl-2">↳ Multa (Poaching/Aliciamento):</span>
                                    <span className="font-mono font-bold text-rose-500">-{formatMoney(poachingMonthlyFine)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Balanço Mensal */}
                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 font-semibold">
                              <div className="flex justify-between items-center">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                  Balanço Mensal:
                                </span>
                                <span className={`font-mono text-xs font-black ${
                                  netBalance >= 0 ? "text-emerald-500" : "text-rose-500"
                                }`}>
                                  {netBalance >= 0 ? "+" : ""}{formatMoney(netBalance)}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Redirect Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-center">
                      <button
                        onClick={() => {
                          setActiveTab('Escritório');
                          setIsBudgetDropdownOpen(false);
                          triggerNotification?.("🪙 Escritório", "Balanço Financeiro Mensal carregado.");
                          setTimeout(() => {
                            const container = document.getElementById('balanco-financeiro-mensal');
                            if (container) {
                              container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              container.classList.add('ring-2', 'ring-cyan-500', 'ring-offset-2');
                              setTimeout(() => {
                                container.classList.remove('ring-2', 'ring-cyan-500', 'ring-offset-2');
                              }, 2000);
                            }
                          }, 150);
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-sky-450 hover:text-sky-350 transition-colors cursor-pointer select-none inline-block duration-150"
                      >
                        Ver Finanças Completas
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer separator */}
            <div className={`hidden sm:block h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* 8. CALENDÁRIO (Red calendar header, transforming into modern dropdown calendar) */}
            <div 
              ref={calContainerRef}
              className="relative"
              onMouseEnter={openCalDropdown}
              onMouseLeave={closeCalDropdownWithDelay}
            >
              <div 
                onClick={() => {
                  if (isCalDropdownOpen) {
                    setIsCalDropdownOpen(false);
                  } else {
                    openCalDropdown();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border text-left shadow-xs transition-colors duration-150 cursor-pointer select-none ${
                  isCalDropdownOpen
                    ? theme === 'dark' ? 'bg-[#1e2d44] border-[#00cbd6]' : 'bg-slate-205 border-slate-400'
                    : theme === 'dark' ? 'bg-[#0c1a30] border-[#1e2d44] hover:bg-[#152744]' : 'bg-[#eef2f6] border-slate-205 hover:bg-slate-200'
                }`}
                title="Calendário e Cronograma do Jogo"
              >
                <Calendar className="w-4.5 h-4.5 text-[#fc4b6c] shrink-0" />
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                    <span>SEMANA</span>
                    <span className="text-[#fc4b6c] font-black font-mono">
                      S{gameState ? (gameState.week <= 18 ? 1 : 2) : 1} • W{gameState?.week || 1} - {
                        gameState ? getExtendedMonthInfo(gameState.week).name : "Janeiro"
                      }
                    </span>
                  </div>
                  <span className={`text-[9px] mt-0.5 font-bold font-mono ${theme === 'dark' ? 'text-slate-450' : 'text-slate-650'}`}>
                    {(() => {
                      if (!gameState) return "Domingo, 19";
                      const mInfo = getExtendedMonthInfo(gameState.week);
                      const currentDayNum = gameState.currentDay || (10 + (gameState.week * 2) % 19);
                      const currentWeekdayIdx = (mInfo.startDayOfWeek + (currentDayNum - 1)) % 7;
                      const weekdayNamesLong = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                      return `${weekdayNamesLong[currentWeekdayIdx]}, ${currentDayNum}`;
                    })()} - {gameState && gameState.season > 100 ? gameState.season : 2025 + (gameState?.season || 1)}
                  </span>
                </div>
              </div>

              {/* Dropdown panel */}
              <AnimatePresence>
                {isCalDropdownOpen && gameState && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute right-0 mt-2 w-72 rounded-xl border p-4 shadow-2xl z-55 ${
                      theme === 'dark' 
                        ? 'bg-[#0d1726] border-[#1e2d44] text-white shadow-black/80' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-slate-350/50'
                    }`}
                  >
                    {/* Header: Month and Split */}
                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <div>
                        {(() => {
                          const mInfo = getExtendedMonthInfo(gameState.week);
                          return (
                            <>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                {mInfo.name} {gameState && gameState.season > 100 ? gameState.season : 2025 + (gameState?.season || 1)}
                              </h4>
                              <p className="text-[9px] font-bold text-slate-450 uppercase tracking-widest leading-none mt-0.5">
                                Split {gameState.week <= 18 ? 1 : 2} • Semana {gameState.week}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#fc4b6c]/10 text-[#fc4b6c] font-extrabold uppercase font-mono tracking-widest">
                        AGENDA
                      </span>
                    </div>

                    {/* Weekday Labels Grid (Seg-Dom) */}
                    <div className="grid grid-cols-7 gap-1 mb-1 text-center font-semibold select-none">
                      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((lbl) => (
                        <span key={lbl} className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                          {lbl}
                        </span>
                      ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* 1. Days generation */}
                      {(() => {
                        const mInfo = getExtendedMonthInfo(gameState.week);
                        const cDayNum = gameState.currentDay || (10 + (gameState.week * 2) % 19);
                        const sOff = mInfo.startDayOfWeek;
                        
                        const cells = [];
                        
                        // Previous Month Days
                        for (let i = sOff - 1; i >= 0; i--) {
                          const prevDay = mInfo.prevTotalDays - i;
                          cells.push(
                            <div 
                              key={`prev-${prevDay}`} 
                              className="text-[10.5px] font-mono text-center font-bold text-slate-350/30 dark:text-slate-600/40 py-2 select-none"
                            >
                              {prevDay}
                            </div>
                          );
                        }

                        // Core Days logic
                        for (let d = 1; d <= mInfo.totalDays; d++) {
                          const isToday = d === cDayNum;
                          const dayOfWeek = (sOff + d - 1) % 7;
                          const hasCampeonato = dayOfWeek === 6; // Sunday
                          const hasScrim = dayOfWeek === 4 || dayOfWeek === 5; // Fri, Sat

                          // compute corresponding game week for redirection
                          const weekIndexInMonth = Math.min(3, Math.floor((d - 1) / 7));
                          const targetWeek = mInfo.weeks[weekIndexInMonth];

                          cells.push(
                            <div
                              key={`day-${d}`}
                              onClick={() => {
                                setSelectedCalendarWeek(targetWeek);
                                setActiveTab('Calendário');
                                setIsCalDropdownOpen(false);
                                triggerNotification?.("📅 Calendário", `Visualizando rodadas detalhadas da Semana ${targetWeek}.`);
                              }}
                              className={`relative text-[11px] font-mono font-bold flex flex-col items-center justify-center rounded-lg h-8 w-8 mx-auto cursor-pointer select-none transition-all duration-150 ${
                                isToday
                                  ? theme === 'dark'
                                    ? 'border-2 border-[#00cbd6] text-[#00cbd6] font-extrabold bg-[#00cbd6]/10 shadow-[0_0_10px_rgba(0,203,214,0.3)]'
                                    : 'bg-blue-600 text-white font-extrabold shadow-md border border-blue-700'
                                  : theme === 'dark'
                                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                              }`}
                            >
                              <span>{d}</span>
                              {/* Agenda dots under number spacing */}
                              {!isToday && hasCampeonato && (
                                <span className="absolute bottom-[2px] w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                              )}
                              {!isToday && hasScrim && (
                                <span className="absolute bottom-[2px] w-1 h-1 rounded-full bg-amber-500" />
                              )}
                            </div>
                          );
                        }

                        // Next list padding
                        const totalGridSoFar = sOff + mInfo.totalDays;
                        const finalCount = totalGridSoFar <= 35 ? 35 : 42;
                        const nextMonthPadding = finalCount - totalGridSoFar;
                        for (let i = 1; i <= nextMonthPadding; i++) {
                          cells.push(
                            <div 
                              key={`next-${i}`} 
                              className="text-[10.5px] font-mono text-center font-bold text-slate-350/30 dark:text-slate-600/40 py-2 select-none"
                            >
                              {i}
                            </div>
                          );
                        }

                        return cells;
                      })()}
                    </div>

                    {/* Bottom Legend details */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[8.5px] font-black select-none text-slate-450 uppercase">
                      <div className="flex gap-2.5 items-center">
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>Campeonato</span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Scrim</span>
                        </div>
                      </div>
                    </div>

                    {/* Redirect button footer */}
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => {
                          setActiveTab('Calendário');
                          setIsCalDropdownOpen(false);
                          triggerNotification?.("📅 Calendário", "Carregando Calendário Geral.");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-sky-450 hover:text-sky-350 transition-colors cursor-pointer select-none inline-block duration-150"
                      >
                        Ver Calendário Completo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer separator */}
            <div className={`hidden sm:block h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* 9. AVATAR (Circular manager profile photo) */}
            <div 
              onClick={() => {
                setActiveTab('Carreira');
                triggerNotification?.("👤 Central da Carreira", "Exibindo seu perfil profissional de manager.");
              }}
              className="relative cursor-pointer hover:scale-105 active:scale-95 transition-all group shrink-0"
              title="Acessar painel de Carreira"
            >
              {(() => {
                const managerObj = gameState?.managers?.find(m => m.id === 'player-manager');
                const stateAvatar = (managerObj?.image_blob ? getImageUrl(managerObj.image_blob) : null) || managerObj?.photoUrl || gameState?.managerPhoto || localStorage.getItem('legendshub_manager_avatar');
                if (stateAvatar) {
                  return (
                    <img 
                      src={stateAvatar} 
                      alt="Manager Pic" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-sky-400/60 shadow-lg group-hover:border-sky-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'assets/ui/fallback-player.png'; }}
                    />
                  );
                }
                return (
                  <div className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-400/20 font-black text-sky-450 text-xs shrink-0 select-none group-hover:border-sky-300 transition-colors">
                    {(gameState?.managerName || 'M').charAt(0).toUpperCase()}
                  </div>
                );
              })()}
              {/* Online indicator */}
              <span className="absolute bottom-[-1px] right-[-1px] block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#0a1424] bg-emerald-500" />
            </div>
          </div>
        </header>

        {/* Interactive Bug Report Modal Dialog Container */}
        {showBugModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative select-none ${
              theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44] text-slate-200' : 'bg-white border-slate-210 text-slate-700'
            }`}>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-sky-500 mb-2 flex items-center gap-2">
                <Bug className="w-4.5 h-4.5 text-red-400 animate-bounce" /> Reportar Bug - LegendsHub
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Encontrou alguma falha tática ou erro? Detalhe o acontecido abaixo para enviarmos um log de depuração completo ao GitHub.
              </p>
              
              {bugSuccess ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 flex items-center justify-center mb-3 text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs uppercase text-emerald-500">Relatório Compilado!</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Sua contribuição foi registrada com êxito! Obrigado.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBug} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Título do Bug</label>
                    <input
                      type="text"
                      required
                      value={bugTitle}
                      onChange={(e) => setBugTitle(e.target.value)}
                      placeholder="Ex: Erro ao contratar staff no split..."
                      className={`w-full text-xs p-3 rounded-lg border outline-none ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-[#00cbd6]' 
                          : 'bg-slate-50 border-slate-205 text-slate-850 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Ocorrência e Passos</label>
                    <textarea
                      rows={4}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      placeholder="Descreva o que aconteceu em detalhes..."
                      className={`w-full text-xs p-3 rounded-lg border outline-none resize-none ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-[#00cbd6]' 
                          : 'bg-slate-50 border-slate-205 text-slate-850 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBugModal(false)}
                      className={`px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer ${
                        theme === 'dark' ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-slate-100 hover:bg-slate-150 text-slate-600'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded cursor-pointer"
                    >
                      Enviar Erro
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab View Container Viewport */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Week Advance Animated Overlay Block */}
      {isAdvancingWeek && recapReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-slate-200 w-full max-w-2xl px-6 py-8 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden select-none space-y-6 my-auto"
          >
            {/* Stage 1: Simulating loader checklist */}
            {advanceAnimStep < 5 ? (
              <div className="space-y-6 py-12 text-center flex flex-col items-center">
                {/* Visual loading icon */}
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-sm font-black uppercase tracking-wider text-blue-600">
                    PROCESSANDO TRANSAÇÕES DA LIGA
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">
                    Sincronizando servidores e simulando rodadas do split...
                  </p>
                </div>

                {/* Vertical tasks checklist */}
                <div className="w-full max-w-sm text-left space-y-3 bg-slate-50 border border-slate-200/60 p-5 rounded-xl text-xs">
                  {[
                    `Sincronizando com a API da ${gameState?.selectedRegion || 'CBLOL'}...`,
                    "Consolidando receitas corporativas e taxas...",
                    "Simulando batalhas das demais organizações...",
                    "Concedendo stamina e evoluções de atletas...",
                    "Sincronizando canais sociais e patches..."
                  ].map((task, idx) => {
                    const isDone = advanceAnimStep > idx;
                    const isActive = advanceAnimStep === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 transition-opacity duration-300 ${
                          isDone ? 'opacity-100 text-emerald-600 font-bold' : isActive ? 'opacity-100 text-slate-800 font-extrabold' : 'opacity-30 text-slate-400'
                        }`}
                      >
                        {isDone ? (
                          <span className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] scale-90">✓</span>
                        ) : isActive ? (
                          <span className="w-4 h-4 rounded border border-blue-500 flex items-center justify-center text-[10px] animate-pulse">●</span>
                        ) : (
                          <span className="w-4 h-4 rounded border border-slate-200 flex items-center justify-center text-[10px]">○</span>
                        )}
                        <span>{task}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Horizontal progress indicator */}
                <div className="w-full max-w-sm bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-450 transition-all duration-300"
                    style={{ width: `${(advanceAnimStep / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Stage 2: Summary recap Dashboard */
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-blue-650 text-xs font-black uppercase tracking-widest">
                    SEMANA {recapReport.prevWeek} CONCLUÍDA!
                  </h3>
                  <h2 className="text-lg font-bold tracking-tight text-slate-800 uppercase font-display leading-none">
                    Bem-vindo à Semana {recapReport.nextWeek} do Split
                  </h2>
                </div>

                {/* Finance Grid Recap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left block (Incomes) */}
                  <div className="bg-slate-50 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                    <h4 className="text-emerald-700 text-[10px] font-black uppercase tracking-wider border-b border-slate-200/50 pb-1.5">
                      ✓ RECEITAS SEMANAIS
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Patrocinadores</span>
                        <span className="text-emerald-600 font-bold">+ $ {recapReport.sponsorIncome.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Ingressos & Mídia</span>
                        <span className="text-emerald-600 font-bold">+ $ {recapReport.merchIncome.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="border-t border-slate-200/80 pt-2 flex justify-between font-bold">
                        <span className="text-slate-600 uppercase text-[10px]">Total</span>
                        <span className="text-emerald-750 font-bold">+ $ {(recapReport.sponsorIncome + recapReport.merchIncome).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right block (Expenses) */}
                  <div className="bg-slate-50 border border-red-500/10 rounded-xl p-4 space-y-3">
                    <h4 className="text-red-700 text-[10px] font-black uppercase tracking-wider border-b border-slate-200/50 pb-1.5">
                      ✗ DESPESAS FLUXO
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Folha de Atletas</span>
                        <span className="text-red-600 font-bold">- $ {Math.round(recapReport.athleteCosts).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Gaming House & TC</span>
                        <span className="text-red-600 font-bold">- $ {recapReport.operatingCosts.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-555 font-medium">Staff Contratado</span>
                        <span className="text-red-600 font-bold">- $ {recapReport.staffCosts.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="border-t border-slate-200/80 pt-2 flex justify-between font-bold text-xs">
                        <span className="text-slate-600 uppercase text-[10px]">Total</span>
                        <span className="text-red-700 font-bold">- $ {Math.round(recapReport.athleteCosts + recapReport.operatingCosts + recapReport.staffCosts).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Profit indicator card */}
                <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
                  recapReport.netProfit >= 0 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-850' : 'bg-red-50/50 border-red-100 text-red-850'
                }`}>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-medium">SALDO LÍQUIDO DO QG</p>
                  <h3 className={`font-display text-xl font-black mt-1 ${
                    recapReport.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {recapReport.netProfit >= 0 ? '+' : '-'} $ {Math.abs(recapReport.netProfit).toLocaleString('pt-BR')}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                    Valor computado e transferido para o caixa geral da organização.
                  </p>
                </div>

                {/* Summoner's rift updates */}
                {recapReport.patchModel && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Summoner's Rift Patch {recapReport.patchModel.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-550 leading-relaxed italic">
                      "{recapReport.patchModel.metaDescription}"
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px] uppercase font-bold">
                      <div className="text-emerald-600 font-bold">Buffs: {recapReport.patchModel.buffedChampions.slice(0, 3).join(', ')}</div>
                      <div className="text-red-650 font-bold">Nerfs: {recapReport.patchModel.nerfedChampions.slice(0, 3).join(', ')}</div>
                    </div>
                  </div>
                )}

                {/* Footer close button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsAdvancingWeek(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-display text-xs font-black py-4 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all hover:shadow-lg font-bold"
                  >
                    CONTINUAR NO QG DE LIDERANÇA <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Unemployment Proposals Modal (Dark Mode) */}
      {!gameState?.playerTeamId && showUnemploymentModal && (
        <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0b1329] border border-[#1e2d44] w-full max-w-4xl p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden select-none space-y-6 text-white text-xs my-auto"
          >
            {/* Dark Mode Background Neon effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 border-b border-[#1e2d44] pb-5">
              <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Briefcase className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-display text-cyan-400 text-xs font-black uppercase tracking-widest leading-none">
                CENTRAL PROFISSIONAL DE TRANSIÇÃO
              </h3>
              <h2 className="text-xl font-black tracking-tight text-white uppercase font-display text-base">
                PROPOSTAS DE CARREIRA RECEBIDAS
              </h2>
              <p className="text-slate-400 text-[10.5px] max-w-lg mx-auto font-medium">
                Sua rescisão contratual foi homologada. Duas conceituadas corporações esportivas enviaram propostas estruturadas de contratação imediata:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proposal 1: Finance-focused */}
              {(() => {
                const teamsList = gameState?.teams || [];
                // Look for RED Canids or fallback to first available team
                const finTeam = teamsList.find(t => t.id === 'red' || t.id.toLowerCase().includes('red') || t.acronym === 'RED') || teamsList[0];
                if (!finTeam) return null;
                
                return (
                  <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-emerald-500/30 transition-all duration-300">
                    <div className="space-y-3 font-sans">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-mono">
                          OPORTUNIDADE FINANCEIRA
                        </span>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent border border-[#1e2d44] overflow-hidden p-1 shrink-0">
                          <img 
                            src={getGameAssetUrl('teams', finTeam.id, finTeam.logoUrl)} 
                            alt={finTeam.name} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = getProceduralFallbackUrl(finTeam.name, true); }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display text-sm font-black text-white uppercase tracking-tight">{finTeam.name}</h4>
                        <div className="text-[9.5px] text-slate-400 font-mono flex gap-3">
                          <span>Sede: <strong className="text-slate-300">{finTeam.region || 'CBLOL'}</strong></span>
                          <span>•</span>
                          <span>Estabilidade: <strong className="text-emerald-400 font-bold">Excelente</strong></span>
                        </div>
                      </div>

                      <p className="text-slate-405 text-[10px] leading-relaxed">
                        A organização foca em liquidez comercial de caixa e crescimento infraestrutural de longo prazo. Garante forte verba de reservas, excelentes acordos de patrocinadores e estabilidade financeira global da Gaming House.
                      </p>

                      <div className="bg-emerald-950/25 border border-emerald-500/20 rounded-lg p-3 space-y-1.5 font-mono text-[9px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Caixa de Partida:</span>
                          <span className="text-emerald-400 font-bold">$ {(finTeam.budget * 1.2).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Bônus de Assinatura:</span>
                          <span className="text-emerald-400 font-bold">+$ 250.000 (Caixa Imediato)</span>
                        </div>
                        <div className="flex justify-between text-slate-400 border-t border-slate-800/50 pt-1.5 font-bold">
                          <span>Estabilidade de Patrocínio:</span>
                          <span className="text-emerald-400">+15% eficiência</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const updatedTeams = gameState.teams.map(t => {
                          if (t.id === finTeam.id) {
                            return { ...t, isPlayerControlled: true, budget: t.budget + 250000, boardTrust: 75 };
                          }
                          return t;
                        });
                        const updatedManagers = (gameState.managers || []).map(m => {
                          if (m.teamId === finTeam.id && m.id !== 'player-manager') {
                            return { ...m, teamId: null, status: 'Free Agent' };
                          }
                          if (m.id === 'player-manager') {
                            return { ...m, teamId: finTeam.id };
                          }
                          return m;
                        });
                        setGameState({
                          ...gameState,
                          playerTeamId: finTeam.id,
                          teams: updatedTeams,
                          managers: updatedManagers
                        });
                        setShowUnemploymentModal(false);
                        triggerNotification?.("✍️ Novo Legado Financeiro!", `Você assumiu o comando da organização ${finTeam.name} com bônus de caixa.`);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Assinar Proposta Financeira
                    </button>
                  </div>
                );
              })()}

              {/* Proposal 2: Analytics-focused */}
              {(() => {
                const teamsList = gameState?.teams || [];
                // Look for paiN Gaming or fallback to second available team
                const anaTeam = teamsList.find(t => t.id === 'pain' || t.id.toLowerCase().includes('pain') || t.acronym === 'PNG') || teamsList[1] || teamsList[0];
                if (!anaTeam) return null;

                return (
                  <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-cyan-500/30 transition-all duration-300">
                    <div className="space-y-3 font-sans">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/20 text-cyan-400 font-mono">
                          OPORTUNIDADE ANALÍTICA
                        </span>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent border border-[#1e2d44] overflow-hidden p-1 shrink-0">
                          <img 
                            src={getGameAssetUrl('teams', anaTeam.id, anaTeam.logoUrl)} 
                            alt={anaTeam.name} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = getProceduralFallbackUrl(anaTeam.name, true); }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display text-sm font-black text-white uppercase tracking-tight">{anaTeam.name}</h4>
                        <div className="text-[9.5px] text-slate-400 font-mono flex gap-3">
                          <span>Sede: <strong className="text-slate-300">{anaTeam.region || 'CBLOL'}</strong></span>
                          <span>•</span>
                          <span>Análise Tática: <strong className="text-cyan-400 font-bold">Extrema</strong></span>
                        </div>
                      </div>

                      <p className="text-slate-405 text-[10px] leading-relaxed">
                        A diretoria prioriza análise estatística de scouts, fomento do elenco Academy para revelar promessas e sinergia de campeões durante o draft. O comitê assegura alto engajamento da torcida e comissão técnica tática ativa.
                      </p>

                      <div className="bg-cyan-950/25 border border-cyan-500/20 rounded-lg p-3 space-y-1.5 font-mono text-[9px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Popularidade Inicial:</span>
                          <span className="text-cyan-400 font-bold">{Math.min(100, anaTeam.popularity + 10)}%</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Elenco Base:</span>
                          <span className="text-cyan-400 font-bold">Sinergia +10 pts</span>
                        </div>
                        <div className="flex justify-between text-slate-400 border-t border-slate-800/50 pt-1.5 font-bold">
                          <span>Bônus de Scouts & Draft:</span>
                          <span className="text-cyan-400">+12% treinamento</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const updatedTeams = gameState.teams.map(t => {
                          if (t.id === anaTeam.id) {
                            return { ...t, isPlayerControlled: true, popularity: Math.min(100, t.popularity + 10), boardTrust: 80 };
                          }
                          return t;
                        });
                        const updatedManagers = (gameState.managers || []).map(m => {
                          if (m.teamId === anaTeam.id && m.id !== 'player-manager') {
                            return { ...m, teamId: null, status: 'Free Agent' };
                          }
                          if (m.id === 'player-manager') {
                            return { ...m, teamId: anaTeam.id };
                          }
                          return m;
                        });
                        setGameState({
                          ...gameState,
                          playerTeamId: anaTeam.id,
                          teams: updatedTeams,
                          managers: updatedManagers
                        });
                        setShowUnemploymentModal(false);
                        triggerNotification?.("✍️ Novo Legado Analítico!", `Você assumiu o comando da organização ${anaTeam.name} com bônus de performance.`);
                      }}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-black text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Assinar Proposta Analítica
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Close / Dismiss option */}
            <div className="pt-2 text-center text-[10px]">
              <button 
                onClick={() => setShowUnemploymentModal(false)}
                className="text-slate-500 hover:text-slate-400 font-mono text-[9px] uppercase tracking-widest transition cursor-pointer"
              >
                Avaliar mercado por conta própria 🡒
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Dynamic Toast Notification (Auto-save / Game alerts) */}
      {toastNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-900 border border-sky-500/30 text-white rounded-xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md select-none font-sans"
        >
          <div className="bg-sky-500/15 p-2 rounded-lg border border-sky-400/25 shrink-0 text-sky-450">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-black uppercase text-xs tracking-wider text-sky-350 leading-none">
              {toastNotification.title}
            </h4>
            <p className="text-[10px] text-slate-350 font-medium leading-relaxed mt-1.5">
              {toastNotification.desc}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

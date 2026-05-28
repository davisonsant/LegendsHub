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
  Sun, Moon, RefreshCw, Bug, Mail, Bell, Map
} from 'lucide-react';
import { formatMoney, getCurrencySymbol } from './utils/currency';

// Core Types and Foundations
import { GameState, Team, Player, Sponsor, InterviewQuestion } from './types';
import { initializeNewGame, advanceGameWeek, signSponsorContract, hireStaffMember } from './utils/gameEngine';
import { CHAMPIONS_LIST } from './data/initialDatabase';
import { getPlayersForTeam } from './data/realPlayers';

// Visual Screens and components
import HomeLauncher from './components/HomeLauncher';
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

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('legendshub_theme') as 'light' | 'dark') || 'light';
  });
  const [currencyVersion, setCurrencyVersion] = useState(0);

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
              currency: symbol,
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
            currency: symbol,
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
  const [isDetailedProfileOpen, setIsDetailedProfileOpen] = useState<boolean>(false);
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState<number | undefined>(undefined);
  const [isCalDropdownOpen, setIsCalDropdownOpen] = useState<boolean>(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState<boolean>(false);

  // Refs for click outside detection and hover delays
  const calContainerRef = useRef<HTMLDivElement>(null);
  const budgetContainerRef = useRef<HTMLDivElement>(null);
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  const saveGameToSlot = (slotIndex: number | string, state: GameState) => {
    localStorage.setItem(`legendshub_save_slot_${slotIndex}`, JSON.stringify(state));
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    localStorage.setItem(`legendshub_save_slot_${slotIndex}_date`, formattedDate);
  };

  const loadGameFromSlot = (slotIndex: number | string) => {
    const raw = localStorage.getItem(`legendshub_save_slot_${slotIndex}`);
    if (raw) {
      try {
        const parsed: GameState = JSON.parse(raw);
        
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
    alert(`O atleta ${player.name} foi colocado no catálogo de transferência da liga. Aguarde ofertas na aba Mercado.`);
  };

  const releasePlayerHandler = (player: Player) => {
    if (!gameState) return;
    const team = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

    // decrease boardTrust because of loss of capital assets
    team.boardTrust = Math.max(0, team.boardTrust - 5);
    team.roster = team.roster.filter(p => p.id !== player.id);
    team.substitutes = team.substitutes.filter(p => p.id !== player.id);

    const nextState = { ...gameState };
    setGameState(nextState);
    triggerAutoSaveIfNeeded(nextState, true, `Demissão de Jogador: ${player.name}`);
    alert(`O contrato do ala/cyberatleta ${player.name} foi rescindido de forma amigável.`);
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

    // Capture pre-advance finance snapshots from current gameState before mutation
    const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
    const sponsorIncome = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
    const merchIncome = playerTeam.popularity * 1500;
    const athleteCosts = [...playerTeam.roster, ...playerTeam.substitutes].reduce((acc, p) => acc + p.salary / 24, 0);
    const operatingCosts = (playerTeam.infrastructure.gamingHouseLevel * 8000) + 
                           (playerTeam.infrastructure.trainingCenterLevel * 6000) +
                           (playerTeam.infrastructure.mediaTeamLevel * 4000);
    
    // Staff payroll filters matching engine
    const staffCosts = gameState.availableStaff.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0);
    const netProfit = sponsorIncome + merchIncome - athleteCosts - operatingCosts - staffCosts;
    const prevWeek = gameState.week;

    const nextWeekState = advanceGameWeek(gameState);
    setGameState(nextWeekState);

    // save updated progress with check for scheduled auto-saves
    triggerAutoSaveIfNeeded(nextWeekState, false);
    setActiveTab('Central do Manager');

    // Populate executive summary report
    setRecapReport({
      prevWeek,
      nextWeek: nextWeekState.week,
      teamName: playerTeam.name,
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
    if (tabId === 'Jogadores' || tabId === 'Gerenciar Jogadores') {
      // 1. CONTEXTO DE GESTÃO INTERNA (Menus: "JOGADORES" e "ACADEMY"):
      // Ao entrar especificamente nestas duas telas através do menu lateral, limpe o cache de visualizações externas anteriores.
      // Force 'selectedPlayerId' a apontar automaticamente para o primeiro jogador titular do seu próprio elenco local daquela tela.
      const userTeam = gameState?.teams?.find(t => t.id === gameState?.playerTeamId);
      const topStarter = userTeam ? (userTeam.roster.find(p => p.position === 'TOP') || userTeam.roster[0]) : null;
      if (topStarter) {
        setSelectedPlayerId(topStarter.id);
      } else {
        setSelectedPlayerId('');
      }
      setIsDetailedProfileOpen(false); // Clear previous external detailed profile cache
    } else if (tabId === 'Academy' || tabId === 'Youth Academia') {
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
          />
        );
      case 'Jogadores':
      case 'Gerenciar Jogadores':
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
          />
        );
      case 'Academy':
      case 'Youth Academia':
        return (
          <AcademyTab
            {...({
              gameState,
              onPromoteProspect: promoteProspectHandler,
              onUpdateGameState: setGameState,
              theme
            } as any)}
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
              }
            } as any)}
          />
        );
      case 'Liga':
         return <LigaTab gameState={gameState} theme={theme} />;
      case 'Times':
         return (
           <TimesTab 
             gameState={gameState} 
             theme={theme} 
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
         return <CarreiraTab {...({ gameState, theme } as any)} />;
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

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070d19] text-slate-100' : 'bg-[#f5f7fa] text-[#1e293b]'
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
            <Shield className="w-6 h-6 text-blue-600 animate-pulse" />
            <div>
              <h2 className={`font-display text-sm font-black uppercase tracking-widest leading-none bg-gradient-to-r ${
                theme === 'dark' ? 'from-slate-200 to-sky-400' : 'from-slate-800 to-blue-600'
              } bg-clip-text text-transparent`}>LEGENDS HUB</h2>
              <span className={`text-[8px] font-extrabold tracking-widest uppercase ${
                theme === 'dark' ? 'text-sky-300' : 'text-slate-400'
              }`}>MANAGER DE LEAGUE OF LEGENDS</span>
            </div>
          </div>

          {/* Menu loops links */}
          <nav className="flex flex-col gap-1 pr-1 overflow-y-auto max-h-[calc(100vh-295px)] scrollbar-thin scrollbar-thumb-slate-850/50 scrollbar-track-transparent">
            {[
              { id: 'Central do Manager', title: 'Central do Manager', icon: Compass },
              { id: 'Calendário', title: 'Calendário', icon: Calendar },
              { id: 'Jogadores', title: 'Jogadores', icon: Users },
              { id: 'Academy', title: 'Academy', icon: Target },
              { id: 'Comunidade', title: 'Comunidade', icon: Heart },
              { id: 'Gaming House', title: 'Gaming House', icon: Building2 },
              { id: 'Gaming Office', title: 'Gaming Office', icon: Building2 },
              { id: 'Escritório', title: 'Escritório', icon: Briefcase },
              { id: 'Patrocinadores', title: 'Patrocinadores', icon: Award },
              { id: 'Transferências', title: 'Transferências', icon: ArrowLeftRight },
              { id: 'Liga', title: 'Liga', icon: Trophy },
              { id: 'Times', title: 'Times', icon: Shield },
              { id: 'Central de Empregos', title: 'Central de Empregos', icon: Briefcase },
              { id: 'Estatísticas', title: 'Estatísticas', icon: BarChart3 },
              { id: 'Scouting', title: 'Scouting', icon: Zap },
              { id: 'Últimas Partidas', title: 'Últimas Partidas', icon: History },
              { id: 'Meta', title: 'Meta', icon: Sliders },
              { id: 'Carreira', title: 'Carreira', icon: Medal },
              { id: 'Salvar Jogo', title: 'Salvar Jogo', icon: Save }
            ].map((link) => {
              const Icon = link.icon;
              const isCurrent = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleSidebarTabClick(link.id)}
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
            disabled={!gameState.roundsPlayedThisWeek}
            className={`w-full py-2 px-3 font-display text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              gameState.roundsPlayedThisWeek
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
        theme === 'dark' ? 'bg-[#070d19]' : 'bg-[#f5f7fa]'
      }`}>
        {/* Upper HUD Header bar */}
        <header className={`px-8 py-4 flex flex-col xl:flex-row justify-between items-center gap-4 select-none shadow-sm border-b transition-colors duration-200 ${
          theme === 'dark' ? 'bg-[#0a1424]/80 border-[#1e2d44]' : 'bg-white border-slate-200/90'
        }`}>
          <div>
            <h1 className={`font-display text-xs font-black uppercase tracking-widest ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{activeTab} Panel</h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs font-semibold">
            {/* 1. INBOX Button (Mail icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Inbox');
                triggerNotification?.("📬 Inbox", "Acessando sua caixa de e-mails recebidos.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                activeTab === 'Inbox'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Inbox - E-mails da Direção, Jogadores e Propostas"
            >
              <Mail className="w-4 h-4 shrink-0" />
            </button>

            {/* 2. NOTIFICAÇÕES Button (Bell icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Notificações');
                triggerNotification?.("🔔 Notificações", "Exibindo notícias do cenário competitivo.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                activeTab === 'Notificações'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Notificações & Notícias do Cenário Mundial"
            >
              <Bell className="w-4 h-4 shrink-0" />
            </button>

            {/* 3. ROADMAP Button (Map icon, icon-only) */}
            <button
              onClick={() => {
                setActiveTab('Roadmap');
                triggerNotification?.("🗺️ Roadmap", "Abrindo programação de atualizações e correções.");
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                activeTab === 'Roadmap'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-md'
                  : theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title="Roadmap & Linha do Tempo de Atualizações"
            >
              <Map className="w-4 h-4 shrink-0" />
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
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                  : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
              }`}
              title={isCheckingUpdates ? 'Buscando atualizações de código...' : 'Verificar Atualizações no GitHub'}
            >
              <RefreshCw className={`w-4 h-4 text-sky-450 shrink-0 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
            </button>

            {/* 6. REPORTAR BUG Button (Bug icon, icon-only) */}
            <button
              onClick={() => {
                setShowBugModal(true);
                setBugSuccess(false);
              }}
              className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
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
                        const athleteCostsWeekly = (pTeamObj.roster?.reduce((acc, p) => acc + p.salary, 0) || 0) + (pTeamObj.substitutes?.reduce((acc, p) => acc + p.salary, 0) || 0);
                        const staffCostsWeekly = gameState.availableStaff?.filter(s => s.hired).reduce((acc, s) => acc + s.salary, 0) || 0;

                        const estimatedRevenuesSponsor = sponsorWeekly * 4;
                        const estimatedMerchandising = 20000 + (pTeamObj.popularity || 50) * 120;
                        const estimatedPrizes = 15000;

                        const playerSalariesMonthly = athleteCostsWeekly * 4;
                        const staffSalariesMonthly = staffCostsWeekly * 4;
                        const housingCosts = 12000;
                        const marketingCommissions = 3000;

                        const totalRevenues = estimatedRevenuesSponsor + estimatedMerchandising + estimatedPrizes;
                        const totalExpenses = playerSalariesMonthly + staffSalariesMonthly + housingCosts + marketingCommissions;
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
                          setActiveTab('Finanças');
                          setIsBudgetDropdownOpen(false);
                          triggerNotification?.("🪙 Finanças", "Carregando área financeira da organização.");
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
                        gameState ? (
                          gameState.week <= 4 ? "Janeiro" :
                          gameState.week <= 8 ? "Fevereiro" :
                          gameState.week <= 12 ? "Março" :
                          gameState.week <= 16 ? "Abril" :
                          gameState.week <= 20 ? "Maio" :
                          gameState.week <= 24 ? "Junho" :
                          gameState.week <= 28 ? "Julho" : "Agosto"
                        ) : "Abril"
                      }
                    </span>
                  </div>
                  <span className={`text-[9px] mt-0.5 font-bold font-mono ${theme === 'dark' ? 'text-slate-450' : 'text-slate-650'}`}>
                    Dom, {gameState ? (10 + (gameState.week * 2) % 19) : 19} - {2025 + (gameState?.season || 1)}
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
                          const getExtendedMonthInfo = (weekNum: number) => {
                            if (weekNum <= 4)   return { name: "Janeiro", weeks: [1, 2, 3, 4], totalDays: 31, prevTotalDays: 31 };
                            if (weekNum <= 8)   return { name: "Fevereiro", weeks: [5, 6, 7, 8], totalDays: 28, prevTotalDays: 31 };
                            if (weekNum <= 12)  return { name: "Março", weeks: [9, 10, 11, 12], totalDays: 31, prevTotalDays: 28 };
                            if (weekNum <= 16)  return { name: "Abril", weeks: [13, 14, 15, 16], totalDays: 30, prevTotalDays: 31 };
                            if (weekNum <= 20)  return { name: "Maio", weeks: [17, 18, 19, 20], totalDays: 31, prevTotalDays: 30 };
                            if (weekNum <= 24)  return { name: "Junho", weeks: [21, 22, 23, 24], totalDays: 30, prevTotalDays: 31 };
                            if (weekNum <= 28)  return { name: "Julho", weeks: [25, 26, 27, 28], totalDays: 31, prevTotalDays: 30 };
                            return { name: "Agosto", weeks: [29, 30, 31, 32], totalDays: 31, prevTotalDays: 31 };
                          };
                          const mInfo = getExtendedMonthInfo(gameState.week);
                          return (
                            <>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                {mInfo.name} {2025 + (gameState?.season || 1)}
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
                        const getExtendedMonthInfo = (weekNum: number) => {
                          if (weekNum <= 4)   return { name: "Janeiro", weeks: [1, 2, 3, 4], totalDays: 31, prevTotalDays: 31 };
                          if (weekNum <= 8)   return { name: "Fevereiro", weeks: [5, 6, 7, 8], totalDays: 28, prevTotalDays: 31 };
                          if (weekNum <= 12)  return { name: "Março", weeks: [9, 10, 11, 12], totalDays: 31, prevTotalDays: 28 };
                          if (weekNum <= 16)  return { name: "Abril", weeks: [13, 14, 15, 16], totalDays: 30, prevTotalDays: 31 };
                          if (weekNum <= 20)  return { name: "Maio", weeks: [17, 18, 19, 20], totalDays: 31, prevTotalDays: 30 };
                          if (weekNum <= 24)  return { name: "Junho", weeks: [21, 22, 23, 24], totalDays: 30, prevTotalDays: 31 };
                          if (weekNum <= 28)  return { name: "Julho", weeks: [25, 26, 27, 28], totalDays: 31, prevTotalDays: 30 };
                          return { name: "Agosto", weeks: [29, 30, 31, 32], totalDays: 31, prevTotalDays: 31 };
                        };
                        const mInfo = getExtendedMonthInfo(gameState.week);
                        const cDayNum = 10 + (gameState.week * 2) % 19;
                        const sOff = (6 - (cDayNum - 1) % 7 + 7) % 7;
                        
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
              {localStorage.getItem('legendshub_manager_avatar') ? (
                <img 
                  src={localStorage.getItem('legendshub_manager_avatar')!} 
                  alt="Manager Pic" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-sky-400/60 shadow-lg group-hover:border-sky-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-400/20 font-black text-sky-450 text-xs shrink-0 select-none group-hover:border-sky-300 transition-colors">
                  {(gameState?.managerName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
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
                    "Sincronizando com a API do CBLOL...",
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

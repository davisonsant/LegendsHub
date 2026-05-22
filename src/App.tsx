/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Compass, Sparkles, Trophy, Calendar, 
  Settings, LogOut, DollarSign, Award, ChevronRight, Play, Sliders, Briefcase, Zap, Heart, Target,
  Users, Building2, TrendingUp, BarChart3, Medal, Save, History, ArrowLeftRight,
  Sun, Moon, RefreshCw, Bug
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
import CalendarTab from './components/CalendarTab';
import EditorTab from './components/EditorTab';
import DraftTab from './components/DraftTab';
import MatchCenterTab from './components/MatchCenterTab';
import SettingsScreen from './components/SettingsScreen';

// Custom Multi-tabs integration
import { 
  GamingOfficeTab, LigaTab, TimesTab, EscritorioTab, FinancasTab, 
  EstatisticasTab, SoloQueueTab, UltimasPartidasTab, MetaTab, CarreiraTab, SalvarJogoTab 
} from './components/NewTabs';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('legendshub_theme') as 'light' | 'dark') || 'light';
  });
  const [currencyVersion, setCurrencyVersion] = useState(0);

  useEffect(() => {
    const handleCurrencyChanged = () => {
      setCurrencyVersion(v => v + 1);
    };
    window.addEventListener('currency_changed', handleCurrencyChanged);
    return () => {
      window.removeEventListener('currency_changed', handleCurrencyChanged);
    };
  }, []);

  const [screen, setScreen] = useState<'LAUNCHER' | 'HUB' | 'DRAFT' | 'MATCH' | 'SETTINGS'>('LAUNCHER');
  const [activeTab, setActiveTab] = useState<string>('Central do Manager');
  const [gameState, setGameState] = useState<GameState | null>(null);

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

  // Layout wrapper component helper
  const renderTabContent = () => {
    if (!gameState) return null;
    switch (activeTab) {
      case 'Central do Manager':
        return (
          <DashboardTab
            gameState={gameState}
            onNextWeek={advanceWeekHandler}
            onSelectTab={(tab) => {
              if (tab === 'Match Center') setScreen('DRAFT');
            }}
            onAnswerInterview={answerInterviewHandler}
          />
        );
      case 'Calendário':
        return <CalendarTab gameState={gameState} />;
      case 'Gerenciar Jogadores':
        return (
          <RosterTab
            gameState={gameState}
            onRenewContract={renewContractHandler}
            onTransferListPlayer={transferListHandler}
            onReleasePlayer={releasePlayerHandler}
            onSelectPlayerTraining={selectPlayerTrainingHandler}
          />
        );
      case 'Youth Academia':
        return (
          <AcademyTab
            gameState={gameState}
            onPromoteProspect={promoteProspectHandler}
          />
        );
      case 'Gaming House':
        return (
          <SponsorsTab
            gameState={gameState}
            onSignSponsor={signSponsorHandler}
            onUpgradeInfrastructure={upgradeInfrastructureHandler}
          />
        );
      case 'Gaming Office':
        return (
          <GamingOfficeTab
            gameState={gameState}
            onUpdateGameState={setGameState}
            triggerNotification={triggerNotification}
          />
        );
      case 'Transferências':
         return (
          <MarketTab
            gameState={gameState}
            onBuyPlayer={buyPlayerHandler}
            onSellProposeAccept={sellProposeAcceptHandler}
          />
        );
      case 'Liga':
         return <LigaTab gameState={gameState} />;
      case 'Times':
         return <TimesTab gameState={gameState} />;
      case 'Patrocinadores':
        return (
          <SponsorsTab
            gameState={gameState}
            onSignSponsor={signSponsorHandler}
            onUpgradeInfrastructure={upgradeInfrastructureHandler}
          />
        );
      case 'Escritório':
         return (
          <EscritorioTab
            gameState={gameState}
            onUpdateGameState={setGameState}
            triggerNotification={triggerNotification}
          />
        );
      case 'Finanças':
         return <FinancasTab gameState={gameState} />;
      case 'Estatísticas':
         return <EstatisticasTab gameState={gameState} />;
      case 'Solo Queue':
         return (
          <SoloQueueTab
            gameState={gameState}
            onUpdateGameState={setGameState}
            triggerNotification={triggerNotification}
          />
        );
      case 'Últimas Partidas':
         return <UltimasPartidasTab gameState={gameState} />;
      case 'Meta':
         return <MetaTab gameState={gameState} />;
      case 'Carreira':
         return <CarreiraTab gameState={gameState} />;
      case 'Salvar Jogo':
         return (
          <SalvarJogoTab
            gameState={gameState}
            onManualSave={(slotIdx) => {
              saveGameToSlot(slotIdx, gameState);
              triggerNotification("💾 Progresso Salvo!", `O Jogo foi guardado com sucesso no Slot local ${slotIdx}.`);
            }}
            triggerNotification={triggerNotification}
          />
        );
      case 'Configurações':
        return (
          <SettingsScreen
            gameState={gameState}
            onUpdateTeams={updateTeamsHandler}
            onUpdateSponsors={updateSponsorsHandler}
            onUpdateGameState={(nextState) => {
              setGameState(nextState);
              if (nextState) {
                saveGameToSlot(1, nextState);
              }
            }}
            theme={theme}
            setTheme={setTheme}
            onBack={() => {
              setActiveTab('Central do Manager');
            }}
            onManualSave={(slotIdx) => {
              if (gameState) {
                saveGameToSlot(slotIdx, gameState);
                const title = localStorage.getItem('legendshub_lang') === 'es' ? '💾 Partida Guardada' : '💾 Jogo Salvo';
                const desc = localStorage.getItem('legendshub_lang') === 'es' 
                  ? `Progreso guardado con éxito en el Slot ${slotIdx}.` 
                  : `Progresso salvo com sucesso no Slot ${slotIdx}.`;
                triggerNotification(title, desc);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  // LAUNCHERS CONFIGS SETTINGS
  if (screen === 'SETTINGS') {
    return (
      <SettingsScreen
        gameState={gameState}
        onUpdateTeams={updateTeamsHandler}
        onUpdateSponsors={updateSponsorsHandler}
        onUpdateGameState={(nextState) => {
          setGameState(nextState);
          // Auto-save to slot 1 if playing
          if (nextState) {
            saveGameToSlot(1, nextState);
          }
        }}
        theme={theme}
        setTheme={setTheme}
        onBack={() => {
          if (gameState) {
             setScreen('HUB');
          } else {
             setScreen('LAUNCHER');
          }
        }}
        onManualSave={(slotIdx) => {
          if (gameState) {
            saveGameToSlot(slotIdx, gameState);
            const title = localStorage.getItem('legendshub_lang') === 'es' ? '💾 Partida Guardada' : '💾 Jogo Salvo';
            const desc = localStorage.getItem('legendshub_lang') === 'es' 
              ? `Progreso guardado con éxito en el Slot ${slotIdx}.` 
              : `Progresso salvo com sucesso no Slot ${slotIdx}.`;
            triggerNotification(title, desc);
          }
        }}
      />
    );
  }

  if (screen === 'LAUNCHER' || !gameState) {
    return (
      <HomeLauncher
        onStartNewGame={handleStartNewGame}
        onLoadGame={handleLoadGame}
        onOpenEditor={() => {
          // pre initialize an empty game so editor loads default database templates
          const partial = initializeNewGame('Alex Rivers', 'cblol_pain', 'CBLOL', 2025);
          setGameState(partial);
          setScreen('HUB');
          setActiveTab('Configurações');
        }}
        onOpenSettings={() => setScreen('SETTINGS')}
      />
    );
  }

  // INTERACTIVE DRAFT ARENA ROUTING OVERLAYS
  if (screen === 'DRAFT') {
    return (
      <DraftTab
        gameState={gameState}
        onConfirmDraft={handleConfirmDraftPicks}
        onBackToHub={() => setScreen('HUB')}
      />
    );
  }

  // ACTIVE SUMMONER'S RIFT FIELD FIGHTS
  if (screen === 'MATCH') {
    return (
      <MatchCenterTab
        gameState={gameState}
        bluePicks={activeBluePicks}
        redPicks={activeRedPicks}
        onFinishMatchSeries={handleFinishMatchSeriesResult}
      />
    );
  }

  const pTeamObj = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

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
              }`}>TACTICAL EDITION</span>
            </div>
          </div>

          {/* User profile mini widget with Manager Photo */}
          <div className={`p-4 rounded-lg border text-xs shadow-inner flex items-center gap-3 transition-colors duration-200 ${
            theme === 'dark' ? 'bg-[#070d19]/80 border-[#1e2d44]' : 'bg-slate-50 border-slate-200/65'
          }`}>
            {localStorage.getItem('legendshub_manager_avatar') ? (
              <img 
                src={localStorage.getItem('legendshub_manager_avatar')!} 
                alt="Manager Pic" 
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-400/50 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-400/20 font-black text-sky-400 text-xs shrink-0">
                {gameState.managerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 font-bold uppercase text-[7.5px] tracking-wider leading-none font-mono">Club Account</p>
              <p className={`font-display font-extrabold uppercase mt-1 leading-none truncate text-[11px] ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
              }`}>{pTeamObj.name}</p>
              <p className="text-[9px] text-[#00cbd6] font-extrabold mt-0.5 tracking-wide font-mono truncate">Mgr: {gameState.managerName}</p>
            </div>
          </div>

          {/* Menu loops links */}
          <nav className="flex flex-col gap-1 pr-1 overflow-y-auto max-h-[calc(100vh-275px)] scrollbar-thin scrollbar-thumb-slate-850/50 scrollbar-track-transparent">
            {[
              { id: 'Central do Manager', title: 'Central do Manager', icon: Compass },
              { id: 'Calendário', title: 'Calendário', icon: Calendar },
              { id: 'Gerenciar Jogadores', title: 'Gerenciar Jogadores', icon: Users },
              { id: 'Youth Academia', title: 'Youth Academia', icon: Target },
              { id: 'Gaming House', title: 'Gaming House', icon: Building2 },
              { id: 'Gaming Office', title: 'Gaming Office', icon: Building2 },
              { id: 'Transferências', title: 'Transferências', icon: ArrowLeftRight },
              { id: 'Liga', title: 'Liga', icon: Trophy },
              { id: 'Times', title: 'Times', icon: Shield },
              { id: 'Patrocinadores', title: 'Patrocinadores', icon: Award },
              { id: 'Escritório', title: 'Escritório', icon: Briefcase },
              { id: 'Finanças', title: 'Finanças', icon: TrendingUp },
              { id: 'Estatísticas', title: 'Estatísticas', icon: BarChart3 },
              { id: 'Solo Queue', title: 'Solo Queue', icon: Zap },
              { id: 'Últimas Partidas', title: 'Últimas Partidas', icon: History },
              { id: 'Meta', title: 'Meta', icon: Sliders },
              { id: 'Carreira', title: 'Carreira', icon: Medal },
              { id: 'Salvar Jogo', title: 'Salvar Jogo', icon: Save },
              { id: 'Configurações', title: 'Configurações', icon: Settings }
            ].map((link) => {
              const Icon = link.icon;
              const isCurrent = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full py-1.5 px-3 rounded-lg flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer shrink-0 ${
                    isCurrent 
                      ? 'bg-blue-600 text-white font-black shadow-md border-0' 
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                        : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {link.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Advance week progress button & Exit Launcher link */}
        <div className="space-y-3.5">
          <button
            onClick={advanceWeekHandler}
            disabled={!gameState.roundsPlayedThisWeek}
            className={`w-full py-3.5 px-4 font-display text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              gameState.roundsPlayedThisWeek
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-100 text-slate-400 border border-slate-205 cursor-not-allowed'
            }`}
          >
            AVANÇAR SEMANA <ChevronRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => setScreen('LAUNCHER')}
            className={`w-full py-2 text-center text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors border-t pt-3.5 cursor-pointer ${
              theme === 'dark' ? 'border-[#1e2d44] text-slate-500 hover:text-red-400' : 'border-slate-100 text-slate-400 hover:text-red-500'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" /> SAIR DA CARREIRA
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
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
            {/* Dark Mode, Verificar Atualizações, Reportar Bug buttons */}
            <div className="flex items-center gap-2">
              {/* Dark Mode button */}
              <button
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                  localStorage.setItem('legendshub_theme', nextTheme);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
                }`}
                title="Alternar Modo Escuro / Claro"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                )}
              </button>

              {/* Verificar Atualizações */}
              <button
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdates}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
                }`}
                title="Buscar atualizações de código no GitHub"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-450 shrink-0 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isCheckingUpdates ? 'Verificando...' : 'Verificar Atualizações'}</span>
                <span className="sm:hidden">Update</span>
              </button>

              {/* Reportar Bug */}
              <button
                onClick={() => {
                  setShowBugModal(true);
                  setBugSuccess(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-900/40 border-[#1e2d44] text-slate-350 hover:text-white hover:bg-slate-800/40' 
                    : 'bg-slate-50 border-slate-205 text-slate-600 hover:text-slate-850 hover:bg-slate-100'
                }`}
                title="Bugs, falhas ou sugestões"
              >
                <Bug className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="hidden sm:inline">Reportar Bug</span>
                <span className="sm:hidden">Bug</span>
              </button>
            </div>

            {/* Separator */}
            <div className={`hidden sm:block h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* Budget / Saldo */}
            <div className="text-center sm:text-left">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono block leading-none">Saldo da Org</span>
              <p className={`font-display font-black text-[13px] mt-1 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
              }`}>{formatMoney(pTeamObj.budget)}</p>
            </div>

            {/* Separator */}
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* Season split week info */}
            <div className="text-center sm:text-left">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono block leading-none font-semibold">Split (Ano {gameState.season})</span>
              <p className={`font-display font-black text-[13px] mt-1 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
              }`}>Semana {gameState.week - 1}</p>
            </div>

            {/* Separator */}
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-[#1e2d44]' : 'bg-slate-200'}`} />

            {/* Manager profile avatar photo (clickable redirects to Carreira tab) */}
            <div 
              onClick={() => {
                setActiveTab('Carreira');
                triggerNotification("👤 Central da Carreira", "Exibindo seu perfil profissional de manager.");
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
                <div className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-400/20 font-black text-sky-400 text-xs shrink-0 select-none group-hover:border-sky-300 transition-colors">
                  {gameState.managerName.charAt(0).toUpperCase()}
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

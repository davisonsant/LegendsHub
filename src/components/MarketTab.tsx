/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Shield, Sparkles, AlertCircle, TrendingUp, DollarSign, 
  ArrowUpRight, HelpCircle, Bell, MessageSquare, ChevronDown, Eye, Star,
  User, Compass, Mail, Clock, Calendar, ChevronRight, CheckCircle2, XCircle,
  ArrowLeftRight
} from 'lucide-react';
import { GameState, Player, Position, Team } from '../types';
import { generateProceduralPlayer } from '../utils/generators';
import { formatMoney } from '../utils/currency';

interface MarketTabProps {
  gameState: GameState;
  onBuyPlayer: (player: Player) => void;
  onSellProposeAccept: (player: Player, bidPrice: number) => void;
  theme?: 'light' | 'dark';
  onUpdateGameState?: (state: GameState) => void;
  triggerNotification?: (title: string, desc: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export default function MarketTab({
  gameState,
  onBuyPlayer,
  onSellProposeAccept,
  theme = 'light',
  onUpdateGameState,
  triggerNotification,
  onSelectPlayer
}: MarketTabProps) {
  const isDark = theme === 'dark';
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  // Active Main tab: Todos, Free Agents, Listados, Em Observação
  const [activeMarketTab, setActiveMarketTab] = useState<'Todos' | 'Free Agents' | 'Listados' | 'Em Observação'>('Todos');

  // Search and traditional filters
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<Position | 'ALL'>('ALL');
  const [filterMinOvr, setFilterMinOvr] = useState(70);
  const [filterRegion, setFilterRegion] = useState('Global');
  const [filterSalary, setFilterSalary] = useState('All');

  // Watchlist state backed by localStorage
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('legendshub_watchlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('legendshub_watchlist_ids', JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  // Scouting monitored state backed by localStorage (Rule 4)
  const [monitoredIds, setMonitoredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('legendshub_scout_monitored_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('legendshub_scout_monitored_ids', JSON.stringify(monitoredIds));
  }, [monitoredIds]);

  // Base list of procedural characters
  const [extraFreeAgents, setExtraFreeAgents] = useState<Player[]>(() => {
    // Generate a diverse pool of free agents and short contract players
    const names = ['FallenSon', 'MambaMid', 'ViperX', 'AeroSlay', 'SlayHer', 'TonicJng', 'Raptor', 'Vanguard', 'HexaG', 'ZenithPlayer'];
    const realNames = ['Felipe Silva', 'Lucas Kim', 'Gisela Santos', 'Eric Nielsen', 'Chloe Dubois', 'Matheus Souza', 'Arthur Azevedo', 'Diego Ramos', 'Lívia Neves', 'Shin Ji-hoon'];
    const nations = ['Brazil', 'South Korea', 'Sweden', 'Finland', 'Brazil', 'Brazil', 'Finland', 'Sweden', 'Brazil', 'South Korea'];
    const positions: Position[] = ['MID', 'TOP', 'JNG', 'ADC', 'SUP', 'JNG', 'MID', 'TOP', 'SUP', 'ADC'];
    const ovrs = [88, 85, 83, 79, 87, 84, 86, 91, 78, 93];
    const potentials = [92, 89, 85, 82, 90, 86, 91, 94, 80, 95];

    return names.map((name, i) => ({
      id: `mkt-fa-${name.toLowerCase()}`,
      name,
      realName: realNames[i],
      nationality: nations[i],
      age: 18 + (i % 6),
      position: positions[i],
      overallRating: ovrs[i],
      potential: potentials[i],
      personality: i % 2 === 0 ? 'Clutch' : 'Solid',
      popularity: Math.floor(Math.random() * 40) + 40,
      marketValue: ovrs[i] * 12000 + (potentials[i] - ovrs[i]) * 15000,
      salary: ovrs[i] * 1200,
      contractMonths: 0, // Free agent is 0
      motivation: 100,
      stamina: 100,
      chemistry: 60,
      championPool: ['Azir', 'Jinx', 'Lee Sin', 'Thresh'].slice(0, 2 + (i % 2)),
      isPlayerControlled: false,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&q=80&w=150`
    }));
  });

  // Calculate Unified Interactive Player Database (Rule 1, 4 & 5)
  const unifiedDatabase = useMemo(() => {
    const playersMap = new Map<string, { player: Player; team: Team | null; isListed: boolean; isPreContract: boolean }>();

    // 1. Gather players from all simulation teams
    gameState.teams.forEach(t => {
      const isPlayerTeam = t.id === gameState.playerTeamId;

      const processPlayer = (p: Player) => {
        // Exclude players already in our player-controlled team
        if (isPlayerTeam) return;

        // Ensure stable contractMonths in range of 1-28. Check remaining window (Rule 5)
        // Let's procedurally assign remaining contract split months based on ID if missing
        let months = p.contractMonths;
        if (months === undefined || months === 0) {
          const charSum = p.id.split('').reduce((sum, h) => sum + h.charCodeAt(0), 0);
          months = 5 + (charSum % 20); // 5 to 25 months range
        }

        const isPre = months <= 6;

        // A player from an AI team is listed on the transfer market based on deterministic formula
        const charSum = p.id.split('').reduce((sum, h) => sum + h.charCodeAt(0), 0);
        const isListed = charSum % 4 === 0; // 25% of candidates are listed

        playersMap.set(p.id, {
          player: { ...p, contractMonths: months },
          team: t,
          isListed,
          isPreContract: isPre
        });
      };

      t.roster.forEach(processPlayer);
      if (t.substitutes) t.substitutes.forEach(processPlayer);
      if (t.academy) t.academy.forEach(processPlayer);
    });

    // 2. Add extra free agents
    extraFreeAgents.forEach(p => {
      playersMap.set(p.id, {
        player: p,
        team: null,
        isListed: false,
        isPreContract: false
      });
    });

    return Array.from(playersMap.values());
  }, [gameState.teams, extraFreeAgents, gameState.playerTeamId]);

  // Watchlist & monitored state computed flags
  const databaseWithObs = useMemo(() => {
    return unifiedDatabase.map(item => {
      const monitored = monitoredIds.includes(item.player.id);
      const watched = watchlistIds.includes(item.player.id);
      return {
        ...item,
        isWatched: watched,
        isMonitored: monitored
      };
    });
  }, [unifiedDatabase, watchlistIds, monitoredIds]);

  // Active Filter Application
  const filteredOutput = useMemo(() => {
    return databaseWithObs.filter(item => {
      const p = item.player;

      // Filter 1: Main tab
      if (activeMarketTab === 'Free Agents' && item.team !== null) return false;
      if (activeMarketTab === 'Listados' && !item.isListed) return false;
      if (activeMarketTab === 'Em Observação' && !item.isWatched) return false;

      // Filter 2: Search term
      if (search) {
        const query = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query) || p.realName.toLowerCase().includes(query);
        if (!matchName) return false;
      }

      // Filter 3: Position
      if (filterPos !== 'ALL' && p.position !== filterPos) return false;

      // Filter 4: OVR
      if (p.overallRating < filterMinOvr) return false;

      // Filter 5: Nationality
      if (filterRegion !== 'Global' && p.nationality !== filterRegion) return false;

      // Filter 6: Salary cap
      if (filterSalary !== 'All') {
        const limit = parseInt(filterSalary.replace('k', '')) * 1000;
        if (p.salary > limit) return false;
      }

      return true;
    });
  }, [databaseWithObs, activeMarketTab, search, filterPos, filterMinOvr, filterRegion, filterSalary]);

  // Toggle watchlist (Em observação tab)
  const toggleWatchlist = (id: string, name: string) => {
    if (watchlistIds.includes(id)) {
      setWatchlistIds(prev => prev.filter(x => x !== id));
      triggerNotification?.("👀 Observação Parada", `${name} foi removido dos observados.`);
    } else {
      setWatchlistIds(prev => [...prev, id]);
      triggerNotification?.("⭐ Adicionado aos Observados", `${name} agora está sob radar prioritário!`);
    }
  };

  // Toggle scout monitoring (Rule 4 alocation)
  const toggleScoutMonitored = (id: string, name: string) => {
    if (monitoredIds.includes(id)) {
      setMonitoredIds(prev => prev.filter(x => x !== id));
      triggerNotification?.("📡 Monitoramento Desativado", `Olheiro retirado do monitoramento de ${name}.`);
    } else {
      setMonitoredIds(prev => [...prev, id]);
      triggerNotification?.("🔍 Olheiro Alocado", `O player ${name} foi marcado para coleta ativa de desempenho!`);
    }
  };

  // Dynamic email sender utility for testing (Rule 4 & 5 integration)
  const generateScoutEmail = (type: 'performance' | 'alerta', player: Player, team: Team | null, scoutName?: string) => {
    const acronym = team ? team.acronym : 'FREE AGENT';
    const teamName = team ? team.name : 'Sem Clube';
    
    // Base email structure
    let subject = '';
    let body = '';
    let category: 'Direção' | 'Jogadores' | 'Propostas' = 'Jogadores';
    const sender = scoutName || 'Aliança de Scouting';
    const senderRole = scoutName ? 'Olheiro Deslocado' : 'Olheiro-Chefe Executivo';

    if (type === 'performance') {
      subject = `🔍 Relatório de Performance: Evolução de ${player.name} (${acronym})`;
      body = `Olá, Manager. Nosso setor analítico emitiu o relatório de monitoramento semanal de ${player.name} (${player.realName}).\n\nEle tem demonstrado uma evolução tática considerável em partidas simuladas da liga. O seu Overall Rating consolidado de OVR ${player.overallRating} tem sido mantido por ótimos scores de KDA. A evolução em mecânica está em ${(player.attributes?.mechanics || 80) + 2} e macro em ${(player.attributes?.macro || 80) + 1}. Seu valor atual de mercado é de ${formatMoney(player.marketValue)} com base na sua pretensão de splits. Recomendamos propor termos comerciais brevemente!`;
      category = 'Jogadores';
    } else {
      subject = `⚠️ Alerta Contratual: Janela de Pré-Contrato para ${player.name}`;
      body = `ATENÇÃO CRÍTICA, MANAGER!\n\nNossos informantes nos times rivais confirmaram que resta exatos 6 meses de contrato restante para o jogador ${player.name} em seu vínculo contratual ativo com a prestigiada franquia ${teamName}.\n\nPara fins das diretrizes de negociações da liga, ele está agora legalmente classificado com o status de PRÉ-CONTRATO DISPONÍVEL! Isso significa que podemos contornar totalmente a multa e o passe rescisório do clube detentor ${teamName}. Se formalizarmos um pré-contrato de salários elevados com sucesso agora, ele assinará a custo zero para desembarcar no nosso time substituto ao término da Copa atual.`;
      category = 'Propostas';
    }

    try {
      const savedEmails = localStorage.getItem('legendshub_custom_events_emails');
      const currentList = savedEmails ? JSON.parse(savedEmails) : [];
      const newEmail = {
        id: `scout-mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender,
        senderRole,
        subject,
        body,
        date: 'Hoje / Mensagem Instantânea',
        category,
        read: false,
        actionLabel: 'Ver Mercado de Transferências',
        linkTab: 'Transferências'
      };
      localStorage.setItem('legendshub_custom_events_emails', JSON.stringify([newEmail, ...currentList]));
      triggerNotification?.("📬 Email Adicionado", `Veja a Inbox! Novo email: "${subject}"`);
      alert(`O olheiro ${sender} enviou o e-mail formal de monitoramento sobre ${player.name} para a sua inbox! Vá até a aba "Inbox" para ler o corpo completo.`);
    } catch (e) {
      alert("Erro ao gravar e-mail no banco do localStorage.");
    }
  };

  // Scouting assignments state
  const [scoutAssignments, setScoutAssignments] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('legendshub_scouting_assignments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('legendshub_scouting_assignments', JSON.stringify(scoutAssignments));
  }, [scoutAssignments]);

  const [allocatingPlayer, setAllocatingPlayer] = useState<Player | null>(null);
  const [allocatingTeam, setAllocatingTeam] = useState<Team | null>(null);

  const hiredScouts = useMemo(() => {
    try {
      const saved = localStorage.getItem('legendshub_scouting_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return [
      { id: 'sc_1', name: 'Min-ki "MadLife" Hong', age: 32, country: 'KR', stars: 5, specialty: 'Caçador de Joias da Coreia', salary: 9000, contractRemaining: 12, allocatedRegionId: 'seul_kr', gender: 'M', avatar: 'assets/images/scouts/male_1.png', status: 'DISPONIVEL' },
      { id: 'sc_2', name: 'Wei "Shadow" Chen', age: 29, country: 'CN', stars: 4, specialty: 'Especialista em Rotas Laterais', salary: 6000, contractRemaining: 10, allocatedRegionId: 'pequim_cn', gender: 'M', avatar: 'assets/images/scouts/male_2.png', status: 'DISPONIVEL' },
      { id: 'sc_4', name: 'Renan "DeKar" Silva', age: 27, country: 'BR', stars: 3, specialty: 'Detetor de Prodígios de Fila', salary: 3750, contractRemaining: 14, allocatedRegionId: 'sao_paulo_br', gender: 'M', avatar: 'assets/images/scouts/male_4.png', status: 'DISPONIVEL' },
      { id: 'sc_5', name: 'Jack "Marshall" Cooper', age: 35, country: 'US', stars: 4, specialty: 'Olheiro Geral da LCS', salary: 6000, contractRemaining: 11, allocatedRegionId: 'california_us', gender: 'M', avatar: 'assets/images/scouts/male_5.png', status: 'DISPONIVEL' },
    ];
  }, []);

  const handleOpenScoutAllocation = (player: Player, team: Team | null) => {
    setAllocatingPlayer(player);
    setAllocatingTeam(team);
  };

  const handleConfirmScoutAllocation = (scoutId: string, scoutName: string) => {
    if (!allocatingPlayer) return;
    const p = allocatingPlayer;
    const t = allocatingTeam;

    // Remove any previous assignments for this scout ID
    setScoutAssignments(prev => ({
      ...prev,
      [scoutId]: p.id
    }));

    // Add player ID to monitoredIds so it is watched
    if (!monitoredIds.includes(p.id)) {
      setMonitoredIds(prev => [...prev, p.id]);
    }

    triggerNotification?.(
      "🔍 Olheiro Alocado",
      `O olheiro ${scoutName} foi designado para monitorar ${p.name}.`
    );

    // Immediately send simulation emails using this scout's name!
    generateScoutEmail('performance', p, t, scoutName);
    generateScoutEmail('alerta', p, t, scoutName);

    // Close Modal
    setAllocatingPlayer(null);
    setAllocatingTeam(null);
  };

  // Negotiation Modal States
  const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
  const [negotiatingTeam, setNegotiatingTeam] = useState<Team | null>(null);
  const [isPreContrato, setIsPreContrato] = useState(false);

  // Input Fields
  const [offerTransferValue, setOfferTransferValue] = useState<number>(0);
  const [offerSalaryWeekly, setOfferSalaryWeekly] = useState<number>(0);
  const [offerSplits, setOfferSplits] = useState<number>(2); // slider splits (1-4)

  // Negotiation state machine
  const [negotiationState, setNegotiationState] = useState<'idle' | 'analyzing' | 'accepted' | 'rejected' | 'counterClub' | 'counterPlayer'>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [counterSalary, setCounterSalary] = useState(0);

  // Open negotiation terms sheet
  const handleOpenNegotiation = (player: Player, team: Team | null, isPre: boolean) => {
    setNegotiatingPlayer(player);
    setNegotiatingTeam(team);
    setIsPreContrato(isPre);

    // Initial default recommendations
    setOfferTransferValue(player.marketValue);
    setOfferSalaryWeekly(player.salary || player.overallRating * 1100);
    setOfferSplits(2);
    setNegotiationState('idle');
    setResultMessage('');
    setCounterValue(0);
    setCounterSalary(0);
  };

  // Send interactive proposal logic (Rule 3)
  const submitProposal = () => {
    if (!negotiatingPlayer) return;
    
    // Start mathematical analysis loop
    setNegotiationState('analyzing');
    
    setTimeout(() => {
      const p = negotiatingPlayer;
      const t = negotiatingTeam;
      const budget = playerTeam.budget;

      // Financial balance validations
      if (!isPreContrato && t && offerTransferValue > budget) {
        setNegotiationState('rejected');
        setResultMessage(`A mesa de finanças da liga barrou as negociações. O valor de transferência sugerido ($${offerTransferValue.toLocaleString()}) ultrapassa suas reservas líquidas de capital de $${budget.toLocaleString()}.`);
        return;
      }

      // Check remaining spots before final completion
      const totalRosterSpots = playerTeam.roster.length + (playerTeam.substitutes?.length || 0);
      if (totalRosterSpots >= 8) {
        setNegotiationState('rejected');
        setResultMessage(`Cancelado: Seu elenco principal já atingiu a lotação regulamentada de 8 atletas. Você precisa dispensar algum reserva na aba "Jogadores" antes de assinar novas propostas.`);
        return;
      }

      // NEGOTIATION LOGIC BRANCHES:

      // Branch 1: REJEIÇÃO CRÍTICA (Jogador Imprescindível)
      // If of high overall (e.g. >= 92) and in roster, AI club considers them non-negotiable
      if (!isPreContrato && t && p.overallRating >= 92) {
        setNegotiationState('rejected');
        setResultMessage(`REJEIÇÃO SUMÁRIA: O Diretor Executivo da equipe rival ${t.name} enviou uma resposta definitiva. "${p.name} é considerado intransferível da nossa escalação oficial. Ele é o capitão tático absoluto para esta fase competitiva e nenhuma proposta financeira será considerada."`);
        return;
      }

      // Branch 2: REJEIÇÃO POR VALOR INSUFICIENTE
      // If offered transfer value is too low compared to market value
      if (!isPreContrato && t && offerTransferValue < p.marketValue * 0.85) {
        setNegotiationState('rejected');
        setResultMessage(`PROPOSTA RECUSADA: O gerente financeiro da ${t.acronym} considerou a oferta de transferência de $${offerTransferValue.toLocaleString()} embaraçosamente desrespeitosa para o passe técnico de ${p.name}. As conversas foram encerradas abruptamente.`);
        return;
      }

      // Branch 3: CONTRA-PROPOSTA DO CLUBE (Foco Financeiro)
      // If offered transfer value is slightly below expectations, AI counter-proposes a higher purchase value
      if (!isPreContrato && t && offerTransferValue < p.marketValue * 1.15) {
        const minAcceptable = Math.round(p.marketValue * 1.18);
        setCounterValue(minAcceptable);
        setNegotiationState('counterClub');
        setResultMessage(`CONTRA-PROPOSTA COMERCIAL: A diretoria de ${t.name} achou o valor inicial um pouco abaixo do teto de liquidação. No entanto, eles aceitam liberar o passe comercial do cyberatleta imediatamente sob o pagamento fixo de $${minAcceptable.toLocaleString()} à vista.`);
        return;
      }

      // Branch 4: CONTRA-PROPOSTA DO JOGADOR (Foco Contratual)
      // Accept club deal (or Free Agent / Pre-contract) but salary is below expectation
      const expectedSalaryBasedOnOvr = p.overallRating * 1350;
      if (offerSalaryWeekly < expectedSalaryBasedOnOvr * 0.95) {
        const requiredSalary = Math.round(expectedSalaryBasedOnOvr * 1.05);
        setCounterSalary(requiredSalary);
        setNegotiationState('counterPlayer');
        setResultMessage(`CONTRA-PROPOSTA DO ATLETA: O representante de ${p.name} está empolgado com o projeto esportivo, mas as exigências fiduciárias não foram atendidas. Ele aceita ingressar se o salário semanal for elevado para $${requiredSalary.toLocaleString()}/semana, acompanhado de luvas mínimas de assinatura.`);
        return;
      }

      // SUCCESS: Agreement fully completed!
      setNegotiationState('accepted');
      setResultMessage(`ACORDO COMERCIAL FECHADO! Os papéis da federação de esports foram deferidos. O ciberatleta ${p.name} assinou o seu novo vínculo e vai se reportar ao quartel general do clube imediatamente!`);
    }, 1200);
  };

  // Complete transfer applying modifications to the persistent game state
  const finalizeNegotiatedDeal = (overrideTransferValue?: number, overrideSalary?: number) => {
    if (!negotiatingPlayer) return;

    const p = negotiatingPlayer;
    const t = negotiatingTeam;
    const finalTransfer = isPreContrato ? 0 : (overrideTransferValue !== undefined ? overrideTransferValue : offerTransferValue);
    const finalSalary = overrideSalary !== undefined ? overrideSalary : offerSalaryWeekly;
    const splitsNum = offerSplits;

    // Direct balance double checks
    if (finalTransfer > playerTeam.budget) {
      alert("Operação bloqueada: Finanças organizacionais insuficientes.");
      return;
    }

    // Clone the state to operate safely (No Tech-Larping, clean data updates)
    const nextState = { ...gameState };

    // Find the player's team and remove from original roster in deep nested state
    if (t) {
      const tInState = nextState.teams.find(x => x.id === t.id);
      if (tInState) {
        tInState.roster = tInState.roster.filter(item => item.id !== p.id);
        if (tInState.substitutes) {
          tInState.substitutes = tInState.substitutes.filter(item => item.id !== p.id);
        }
        if (tInState.academy) {
          tInState.academy = tInState.academy.filter(item => item.id !== p.id);
        }
      }
    }

    // Deduct the transfer fee from player-controlled team
    const updatedTeams = nextState.teams.map(item => {
      if (item.id === gameState.playerTeamId) {
        const rosterInstance = [...item.roster];
        const subInstance = item.substitutes ? [...item.substitutes] : [];

        // Setup newly acquired player properties
        const signedPlayer: Player = {
          ...p,
          isPlayerControlled: true,
          salary: finalSalary,
          contractMonths: splitsNum * 6, // splits are mapped to contract expiration intervals
          chemistry: 65,
          motivation: 100,
          stamina: 100
        };

        subInstance.push(signedPlayer);

        return {
          ...item,
          budget: Math.round(item.budget - finalTransfer),
          substitutes: subInstance
        };
      }
      return item;
    });

    nextState.teams = updatedTeams;

    // Safe dispatch callback in high-level state
    if (onUpdateGameState) {
      onUpdateGameState(nextState);
    }

    // Trigger local user notifications
    triggerNotification?.(
      "📝 Contratação Confirmada!",
      `${p.name} foi incorporado com sucesso à sua equipe reserva!`
    );

    alert(`Parabéns! ${p.name} assinou o contrato formal por ${splitsNum} Splits. Salário semanal: $${finalSalary.toLocaleString()}. Passe comercial de $${finalTransfer.toLocaleString()} liquidado.`);

    // Remove from the free agents draft listings so they do not show anymore
    setExtraFreeAgents(prev => prev.filter(x => x.id !== p.id));
    setNegotiatingPlayer(null);
  };

  return (
    <div className={`space-y-6 font-sans select-none min-h-screen ${
      isDark ? 'bg-[#0b1329] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* 1. TOOBAR DE METADADOS & CABEÇALHO */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        isDark ? 'bg-[#1c2541] border-[#3a506b]' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              INTERACTIVE TRANSFERS MARKETPLACE
            </span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-wide leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Mercado de Transferências
          </h1>
          <p className="text-[11px] text-slate-401 leading-snug mt-1 max-w-xl font-medium">
            Gerencie propostas, contrate agentes livres a custo zero, ou assine pré-contratos de atletas prestes a finalizar seus acordos vigentes na liga.
          </p>
        </div>

        {/* HUD de Capital de Transferência do Time do Player */}
        <div className={`px-5 py-3 rounded-2xl border flex flex-col items-end shrink-0 ${
          isDark ? 'bg-[#1c2541] border-[#3a506b]' : 'bg-slate-50 border-slate-200 shadow-xs'
        }`}>
          <span className="text-slate-400 text-[8.5px] font-bold uppercase tracking-wider block leading-none mb-1">
            Orçamento da Franquia
          </span>
          <span className="text-xl font-bold font-mono text-emerald-500 font-extrabold tracking-tight flex items-center">
            <DollarSign className="w-4 h-4 text-emerald-500 scale-110" />
            {playerTeam.budget.toLocaleString('en-US')}
          </span>
          <span className="text-[9px] text-slate-401 mt-1 font-semibold leading-none">
            Vagas no Elenco: {playerTeam.roster.length + (playerTeam.substitutes?.length || 0)} / 8
          </span>
        </div>
      </div>

      {/* 2. FILTRAGENS DE ABAS ATIVAS (STRICTLY Todos, Free Agents, Listados, Em Observação) */}
      <div className={`flex flex-wrap items-center justify-between border-b pb-1 gap-4 ${
        isDark ? 'border-[#3a506b]' : 'border-slate-200'
      }`}>
        {/* Strictly required tabs */}
        <div className="flex gap-2">
          {(['Todos', 'Free Agents', 'Listados', 'Em Observação'] as const).map(tab => {
            const isActive = activeMarketTab === tab;
            
            // Calculate count for styling
            let count = 0;
            if (tab === 'Todos') count = unifiedDatabase.length;
            else if (tab === 'Free Agents') count = unifiedDatabase.filter(x => x.team === null).length;
            else if (tab === 'Listados') count = unifiedDatabase.filter(x => x.isListed).length;
            else if (tab === 'Em Observação') count = databaseWithObs.filter(x => x.isWatched).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveMarketTab(tab)}
                className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border ${
                  isActive
                    ? isDark 
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-620/10'
                    : isDark ? 'bg-[#1c2541] border-[#3a506b] text-[#5bc0be] hover:text-white hover:bg-slate-900' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {tab} <span className="ml-1 opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Auto Search overlay */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar nome do atleta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full py-2.5 pl-10 pr-4 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-1 ${
              isDark 
                ? 'bg-[#1c2541] border-[#3a506b] text-white focus:ring-cyan-500 focus:border-cyan-500' 
                : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* 3. FILTROS TÁTICOS COMPLEMENTARES */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border ${
        isDark ? 'bg-[#1c2541] border-[#3a506b]' : 'bg-slate-50 border-slate-200 shadow-xs'
      }`}>
        {/* ROTA / POSITION */}
        <div className="flex flex-col">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Função (Posição)</label>
          <div className="relative">
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value as any)}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:ring-cyan-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500'
              }`}
            >
              <option value="ALL">Todas as Rotas</option>
              <option value="TOP">MID-LANER (Top)</option>
              <option value="JNG">CAÇADOR (Jungle)</option>
              <option value="MID">MID (Meio)</option>
              <option value="ADC">ATIRADOR (Sniper)</option>
              <option value="SUP">SUPORTE (Suporte)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>

        {/* HABILIDADE MINIMA OVR */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Global OVR Mínimo</label>
            <span className={`text-[11px] font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{filterMinOvr}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min="70"
              max="95"
              value={filterMinOvr}
              onChange={(e) => setFilterMinOvr(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* NACIONALIDADE / REGION */}
        <div className="flex flex-col">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nacionalidade / País Encarte</label>
          <div className="relative">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:ring-cyan-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500'
              }`}
            >
              <option value="Global">Todos os Países</option>
              <option value="Brazil">Brasil (BR)</option>
              <option value="South Korea">Coreia do Sul (KR)</option>
              <option value="Sweden">Suécia (SE)</option>
              <option value="Finland">Finlândia (FI)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>

        {/* SALARY CAP */}
        <div className="flex flex-col">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Teto Salarial Semanal</label>
          <div className="relative">
            <select
              value={filterSalary}
              onChange={(e) => setFilterSalary(e.target.value)}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:ring-cyan-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500'
              }`}
            >
              <option value="All">Abaixo de Qualquer Custo</option>
              <option value="150k">Abaixo de $150.000</option>
              <option value="120k">Abaixo de $120.000</option>
              <option value="80k">Abaixo de $80.000</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. GRID DE DUAS COLUNAS: LISTA GLOBAL VS SIDEBAR DE OLHEIROS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PRODUTOS / ATLETAS INTERATIVOS (Coluna da Esquerda - Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredOutput.length > 0 ? (
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'border-[#3a506b] bg-[#1c2541]/20' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              
              {/* Desktop responsive Table Headers */}
              <div className={`hidden md:grid grid-cols-12 gap-1.5 px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 border-b select-none ${
                isDark ? 'bg-[#1c2541]/90 border-[#3a506b]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="col-span-3">Jogador</div>
                <div className="col-span-2">Função</div>
                <div className="col-span-1 text-center">OVR</div>
                <div className="col-span-1 text-center">POT</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right pr-4">Valor / Salário</div>
                <div className="col-span-1 text-right">Ação</div>
              </div>

              {/* Items row iterator */}
              <div className={`divide-y ${isDark ? 'divide-[#3a506b]/40' : 'divide-slate-200'}`}>
                {filteredOutput.map(({ player, team, isListed, isPreContract, isWatched, isMonitored }) => {
                  
                  // Extract detailed POT characteristics (Grade Letter + Trend Arrow)
                  const potDetails = (() => {
                    const value = player.potential;
                    if (value >= 94) return { grade: 'A+', trend: '↑', text: 'Excelente', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' };
                    if (value >= 91) return { grade: 'A', trend: '↑', text: 'Forte', color: 'bg-green-500/10 text-green-400 border border-green-500/20' };
                    if (value >= 88) return { grade: 'B+', trend: '↗', text: 'Forte', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
                    if (value >= 84) return { grade: 'B', trend: '↗', text: 'Estável', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
                    return { grade: 'C', trend: '→', text: 'Maduro', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' };
                  })();

                  // League of Legends official roles (TOP, JG, MID, ADC, SUP)
                  const tactical = (() => {
                    switch (player.position) {
                      case 'TOP': return { code: 'TOP', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' };
                      case 'JNG':
                      case 'JG': return { code: 'JG', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' };
                      case 'MID': return { code: 'MID', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20' };
                      case 'ADC': return { code: 'ADC', color: 'bg-orange-500/15 text-orange-455 border border-orange-500/20' };
                      case 'SUP': return { code: 'SUP', color: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' };
                      default: return { code: player.position, color: 'bg-slate-550/15 text-slate-400 border border-slate-700/50' };
                    }
                  })();

                  // Country Flag maps
                  const country = (() => {
                    const nat = player.nationality.toLowerCase();
                    if (nat.includes('korea') || nat.includes('kr')) return { flag: '🇰🇷', code: 'KR' };
                    if (nat.includes('sweden') || nat.includes('se')) return { flag: '🇸🇪', code: 'SE' };
                    if (nat.includes('finland') || nat.includes('fi')) return { flag: '🇫🇮', code: 'FI' };
                    if (nat.includes('brazil') || nat.includes('br')) return { flag: '🇧🇷', code: 'BR' };
                    return { flag: '🏳️', code: 'GBL' };
                  })();

                  // Dynamic Contrast Badge Style based on Theme - Rule 2 Integration
                  const ovrBadgeStyle = (() => {
                    if (isDark) {
                      if (player.overallRating >= 90) {
                        return 'text-cyan-400 border-cyan-500/25 bg-cyan-500/10';
                      } else if (player.overallRating >= 85) {
                        return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10';
                      } else {
                        return 'text-slate-400 border-slate-700 bg-slate-900';
                      }
                    } else {
                      // Light mode: Highly legible, Soft borders, NO dark/black backgrounds
                      if (player.overallRating >= 90) {
                        return 'text-[#0369a1] border-[#b3e0ff] bg-[#e0f2fe]';
                      } else if (player.overallRating >= 85) {
                        return 'text-[#1e293b] border-[#e2e8f0] bg-[#f1f5f9]';
                      } else {
                        return 'text-[#1e293b] border-[#e2e8f0] bg-[#f1f5f9]';
                      }
                    }
                  })();

                  return (
                    <div 
                      key={player.id} 
                      className={`grid grid-cols-1 md:grid-cols-12 gap-1.5 px-4 py-4 items-center transition-all ${
                        isDark 
                          ? 'bg-[#0f172a]/20 hover:bg-[#1e293b]/30' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Column 1: "Jogador" image + nickname + realName + Observar triggers */}
                      <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                        {/* Eye Tracker Trigger */}
                        <button
                          onClick={() => toggleWatchlist(player.id, player.name)}
                          className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                            isWatched 
                              ? 'text-yellow-400' 
                              : isDark ? 'text-slate-650 hover:text-slate-400' : 'text-slate-350 hover:text-slate-500'
                          }`}
                          title={isWatched ? "Remover dos Observados" : "Marcar como Observado"}
                        >
                          <Star className="w-4 h-4 fill-current stroke-1.5" />
                        </button>

                        {/* Player Thumbnail portrait */}
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-700/60 flex items-center justify-center shrink-0 bg-slate-905">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} referrerPolicy="no-referrer" alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-500" />
                          )}
                          <span className="absolute bottom-0 right-0 text-[10px] bg-black/8 w-4 h-4 rounded-full flex items-center justify-center leading-none">
                            {country.flag}
                          </span>
                        </div>

                        {/* Text fields */}
                        <div className="truncate min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => onSelectPlayer && onSelectPlayer(player.id)}
                              className={`text-sm font-black tracking-wide leading-none cursor-pointer ${
                                isDark ? 'text-slate-200 hover:text-cyan-400' : 'text-slate-900 hover:text-indigo-600'
                              }`}
                            >
                              {player.name}
                            </span>
                            
                            {/* Scout monitoring tag overlay */}
                            {isMonitored && (
                              <span className="bg-cyan-500/10 text-cyan-400 text-[7px] font-black uppercase px-1 py-0.2 rounded border border-cyan-500/20 tracking-wider">
                                Olheiro ativo
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[9px] text-slate-400 block mt-0.5 truncate leading-none capitalize">
                            {player.realName} • {player.age} anos ({country.code})
                          </span>
                        </div>
                      </div>

                      {/* Column 2: "Função" Badges */}
                      <div className="col-span-12 md:col-span-2 flex items-center mt-2 md:mt-0">
                        {/* League of Legends official role badge */}
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider ${tactical?.color}`}>
                          {tactical?.code}
                        </span>
                      </div>

                      {/* Column 3: "OVR" Badge */}
                      <div className="col-span-12 md:col-span-1 flex items-center md:justify-center mt-1 md:mt-0">
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border leading-none ${ovrBadgeStyle}`}>
                          {player.overallRating}
                        </span>
                      </div>

                      {/* Column 4: "POT" Trend */}
                      <div className="col-span-12 md:col-span-1 flex items-center md:justify-center mt-1 md:mt-0">
                        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-black ${potDetails.color}`} title={`Capacidade máxima potencial estimada em ${player.potential}`}>
                          <span>{potDetails.grade}</span>
                          <span className="text-[8px] opacity-70">{potDetails.trend}</span>
                        </div>
                      </div>

                      {/* Column 5: "Time" */}
                      <div className="col-span-12 md:col-span-2 flex items-center gap-1.5 mt-1 md:mt-0">
                        {team ? (
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.primaryColor || '#94a3b8' }} />
                            <span className={`text-xs font-bold truncate uppercase tracking-widest leading-none ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {team.acronym}
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-500 text-[8.5px] font-black uppercase bg-emerald-500/10 px-2.5 py-1 rounded tracking-widest leading-none border border-emerald-500/20">
                            FREE AGENT
                          </span>
                        )}
                      </div>

                      {/* Column 6: "Valor" e "Salário" - Expanded to Span 2 with right padding pr-4 to prevent truncation/collisions */}
                      <div className="col-span-12 md:col-span-2 text-left md:text-right flex md:flex-col justify-between items-baseline md:items-end mt-2 md:mt-0 pt-2 md:pt-0 border-t border-slate-800/10 md:border-0 md:pr-4">
                        <div>
                          <span className="text-[7.5px] font-mono text-slate-400 uppercase font-black block md:hidden">Valor</span>
                          <span className="text-xs font-black text-emerald-500 leading-none block">
                            {formatMoney(player.marketValue)}
                          </span>
                        </div>
                        <span className="text-[8.5px] font-mono font-semibold text-slate-400 mt-1 block">
                          ${(player.salary || player.overallRating * 1100).toLocaleString('en-US')}/sem
                        </span>
                      </div>

                      {/* Column 7: Action Buttons (Allocated with Observar Jogador secondary trigger + Oferta/Transferência circular button) */}
                      <div className="col-span-12 md:col-span-1 flex justify-end items-center gap-1.5 mt-3 md:mt-0">
                        {/* Monitor Scout allocation trigger */}
                        <button
                          onClick={() => handleOpenScoutAllocation(player, team)}
                          className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer flex items-center justify-center border shrink-0 ${
                            isDark 
                              ? 'bg-[#1c2541] border-[#3a506b] hover:bg-slate-805 text-[#5bc0be]' 
                              : 'bg-slate-50 border-slate-250 hover:bg-slate-100 text-slate-700'
                          }`}
                          title="Observar Jogador (Alocar Olheiro)"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenNegotiation(player, team, isPreContract)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-md shrink-0 border ${
                            isPreContract
                              ? 'bg-rose-600 border-rose-500 hover:bg-rose-550 text-white shadow-rose-500/10'
                              : team
                                ? 'bg-indigo-600 border-indigo-550 hover:bg-indigo-500 text-white shadow-indigo-500/10'
                                : 'bg-emerald-600 border-emerald-555 hover:bg-emerald-500 text-white shadow-emerald-500/10'
                          }`}
                          title={isPreContract ? 'Assinar Pré-Contrato' : team ? 'Enviar Proposta de Transferência' : 'Contratar Agente Livre'}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`p-16 text-center border-2 border-dashed rounded-2xl ${
              isDark ? 'border-[#3a506b] bg-[#1c2541]/10 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              <AlertCircle className="w-8 h-8 mx-auto text-slate-500 stroke-1 mb-2 animate-bounce" />
              <p className="text-sm font-black uppercase tracking-widest">Nenhum jogador localizado</p>
              <p className="text-xs text-slate-401 mt-1 font-medium">Reajuste seus filtros táteis para prospectar novos candidatos.</p>
            </div>
          )}
        </div>

        {/* COLUNA DA DIREITA: CENTRAL DE MONITORAMENTO & SCOUT MONITOR (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PAINEL DE OLHEIROS ALOCADOS (Rule 4 Implementation) */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0a1329] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800/20 dark:border-slate-800/40 pb-3 mb-4">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">
                Scouting Monitor de Olheiros ({monitoredIds.length})
              </span>
            </div>

            {/* List Monitored items directly */}
            {monitoredIds.length > 0 ? (
              <div className="space-y-4">
                {databaseWithObs.filter(x => x.isMonitored).map(({ player, team }) => (
                  <div key={player.id} className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h4 className="font-bold text-xs leading-none">{player.name}</h4>
                        <span className="text-[8px] font-mono text-slate-500 mt-0.5 block uppercase font-bold">
                          {team ? team.name : 'Agente Livre'} • OVR {player.overallRating}
                        </span>
                      </div>

                      {/* Retirar olheiro trigger */}
                      <button
                        onClick={() => toggleScoutMonitored(player.id, player.name)}
                        className="text-[8px] font-mono font-black text-rose-500 uppercase bg-rose-500/10 px-1.5 py-0.5 rounded hover:bg-rose-500/20 leading-none cursor-pointer"
                      >
                        Desalocar
                      </button>
                    </div>

                    {/* Email triggers simulated flows (Rule 4 Requirements) */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {/* Email performance report */}
                      <button
                        onClick={() => generateScoutEmail('performance', player, team)}
                        className={`py-2 px-2.5 rounded-lg font-mono text-[8px] font-black text-center uppercase tracking-wider cursor-pointer border ${
                          isDark 
                            ? 'bg-slate-900 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10' 
                            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        }`}
                        title="Simular e-mail detalhando atributos, evolução e rendimento"
                      >
                        📧 Relatório Performance
                      </button>

                      {/* Email contractual report */}
                      <button
                        onClick={() => generateScoutEmail('alerta', player, team)}
                        className={`py-2 px-2.5 rounded-lg font-mono text-[8px] font-black text-center uppercase tracking-wider cursor-pointer border ${
                          isDark 
                            ? 'bg-slate-900 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10' 
                            : 'bg-white border-amber-205 text-amber-700 hover:bg-amber-50'
                        }`}
                        title="Simular e-mail de alerta contratual de pré-contrato"
                      >
                        🚨 Alerta Contrato 6 meses
                      </button>
                    </div>
                  </div>
                ))}

                <p className="text-[9.5px] font-semibold text-slate-400 leading-snug italic p-1 border-t border-slate-800/10 dark:border-slate-800/30">
                  💡 Clique nos botões acima para forçar o Olheiro a estruturar e enviar e-mails de performance ou avisos de pré-contratos direto para a sua pasta "Inbox".
                </p>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Mail className="w-7 h-7 mx-auto text-slate-550 stroke-1 mb-2 opacity-50" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-normal">
                  Nenhum Olheiro Alocado
                </p>
                <p className="text-[9px] text-slate-500 mt-1 max-w-[220px] mx-auto leading-normal">
                  Designar olheiros monitora metas e rendimentos dos atletas. Para alocar, clique em "Olheiro ativo" ou no perfil de algum atleta.
                </p>
              </div>
            )}
          </div>

          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0a1329] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Tendências Globais do Split
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Demanda p/ Suportes (CTRL)</span>
                <span className="text-emerald-500 font-extrabold">+24.5%</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Valores de Franquias (LCK)</span>
                <span className="text-slate-350">Média $1.1M</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Tempo Limite Registros</span>
                <span className="text-yellow-500">2 Semanas</span>
              </div>
            </div>
          </div>

          {/* INSTALAÇÕES DE SCOUT CONSELHO */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h5 className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1">
              💡 Dicas Importantes p/ o Manager
            </h5>
            <ul className="text-[10px] text-slate-400 leading-relaxed font-medium space-y-2 list-disc pl-4.5">
              <li>
                Sempre monitore atletas com a <span className="font-bold text-white uppercase">Star</span> para os agrupar na aba prioritária "Em Observação".
              </li>
              <li>
                Os olheiros alocados em monitoramentos geram relatórios aprofundados periódicos na inbox e notificações instantâneas do mercado.
              </li>
              <li>
                Se o contrato possuir <span className="font-bold text-amber-400">menos de 6 meses</span>, a multa rescisória cai para zero e o atleta fica elegível para assinar pré-acordo direto.
              </li>
            </ul>
             <div className="mt-4 pt-3 border-t border-slate-800/20 max-h-[85px] overflow-hidden">
               <button
                 onClick={() => {
                   // Quickly decrease first AI player's contract to 5 to trigger precontract validation
                   const listAll = [...extraFreeAgents];
                   if (listAll[0]) {
                     listAll[0].contractMonths = 5;
                     setExtraFreeAgents(listAll);
                     alert("Forçado contrato do FallenSon para 5 meses para fins de testes rápidos de Pré-Contrato! Agora ele aparecerá com status de Pré-Acordo elegível.");
                   }
                 }}
                 className="w-full text-center py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-mono text-[8.5px] font-black uppercase tracking-wider rounded border border-indigo-500/20 cursor-pointer"
               >
                 Forçar Caso de Pré-Contrato p/ Testes
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* 5. MODAL DE NEGOCIAÇÃO ULTRA POLIDO (Backdrop-filter blur + Lógica IA de canais) */}
      {negotiatingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 select-none animate-fade-in">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl relative overflow-hidden flex flex-col ${
            isDark ? 'bg-[#090f1d] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-5 flex justify-between items-center border-b ${
              isDark ? 'bg-[#0f1931]/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[8.5px] font-black tracking-widest uppercase block ${isDark ? 'text-cyan-455' : 'text-indigo-650'}`}>
                    {isPreContrato ? 'Assinatura de Pré-Contrato' : negotiatingTeam ? 'Negociação com Franquia' : 'Termos de Agente Livre'}
                  </span>
                  <h3 className="text-base font-black uppercase tracking-wide mt-0.5">
                    {isPreContrato ? 'FIRMANDO PRÉ-CONTRATO' : 'CANAIS DE TRANSFERÊNCIA DE PASSES'}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={() => setNegotiatingPlayer(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-black p-1 leading-none cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* Context player status Card */}
              <div className={`p-4 rounded-xl border flex gap-4 ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-750">
                  <img src={negotiatingPlayer.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={negotiatingPlayer.name} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black uppercase">{negotiatingPlayer.name}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold capitalize">({negotiatingPlayer.realName})</span>
                  </div>
                  <p className="text-[10px] text-slate-401 mt-1 leading-tight font-semibold">
                    Classificação: OVR {negotiatingPlayer.overallRating} • Idade: {negotiatingPlayer.age} anos • País: {negotiatingPlayer.nationality}
                  </p>
                  <p className="text-[10.5px] text-sky-400 mt-1 font-bold leading-none">
                    {isPreContrato 
                      ? '⚠️ PRÉ-CONTRATO DISPONÍVEL: Restam menos de 6 meses. O passe é de graça! O atleta migrará ao término do split atual.' 
                      : negotiatingTeam 
                        ? `Pertence ao clube: ${negotiatingTeam.name} (${negotiatingTeam.acronym})` 
                        : 'Atleta Agente Livre: Sem multa rescisória, negociação facilitada.'}
                  </p>
                </div>
              </div>

              {/* LOADING STEP OR RESPONSIVE ALERTS */}
              {negotiationState === 'analyzing' ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Compass className="w-10 h-10 text-cyan-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-[#00cbd6]">Simulando Resposta da IA</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-none">Analisando balanço de mercado, folha disponível e reações contratuais...</p>
                  </div>
                </div>
              ) : negotiationState !== 'idle' ? (
                // NEGOTIATION ANSWER CARD
                <div className={`p-5 rounded-2xl border flex flex-col ${
                  negotiationState === 'accepted' 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                    : negotiationState === 'rejected' 
                      ? 'border-rose-500/20 bg-rose-500/5 text-rose-400' 
                      : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2 border-b pb-2 border-slate-800/10 dark:border-slate-850/50">
                    {negotiationState === 'accepted' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : negotiationState === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 animate-pulse" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider font-mono">
                      {negotiationState === 'accepted' ? 'PROPOSTA ACEITA!' : negotiationState === 'rejected' ? 'NEGOCIAÇÃO REJEITADA' : 'CONTRA-PROPOSTA RECEBIDA'}
                    </span>
                  </div>

                  <p className={`text-xs font-semibold leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-700'
                  }`}>
                    {resultMessage}
                  </p>

                  {/* Actions depending on state */}
                  <div className="mt-5 flex gap-3 justify-end">
                    {negotiationState === 'counterClub' && (
                      <button
                        onClick={() => finalizeNegotiatedDeal(counterValue, offerSalaryWeekly)}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide bg-yellow-500 hover:bg-yellow-400 text-slate-900 cursor-pointer transition-colors"
                      >
                        Aceitar $ {counterValue.toLocaleString()} de Passe
                      </button>
                    )}

                    {negotiationState === 'counterPlayer' && (
                      <button
                        onClick={() => finalizeNegotiatedDeal(isPreContrato ? 0 : offerTransferValue, counterSalary)}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer transition-colors"
                      >
                        Aceitar $ {counterSalary.toLocaleString()} semanais
                      </button>
                    )}

                    {negotiationState === 'accepted' && (
                      <button
                        onClick={() => finalizeNegotiatedDeal(isPreContrato ? 0 : offerTransferValue, offerSalaryWeekly)}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
                      >
                        Finalizar e Assinar
                      </button>
                    )}

                    <button
                      onClick={() => setNegotiationState('idle')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isDark ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-slate-10 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {negotiationState === 'accepted' || negotiationState === 'rejected' ? 'Fechar' : 'Voltar e Ajustar'}
                    </button>
                  </div>
                </div>
              ) : (
                // IDLE INPUT FORM STATE (SCENARIO A and B)
                <div className="space-y-4">
                  
                  {/* Campo 1: VALOR DA TRANSFERÊNCIA (Oculto se for Free Agent ou Pré-Contrato!) */}
                  {!isPreContrato && negotiatingTeam && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                          VALOR DA TRANSFERÊNCIA (PASSE AO CLUBE)
                        </label>
                        <span className="text-xs text-slate-400 font-bold">
                          Estimado: {formatMoney(negotiatingPlayer.marketValue)}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          value={offerTransferValue}
                          onChange={(e) => setOfferTransferValue(parseInt(e.target.value) || 0)}
                          className={`w-full py-2.5 pl-8 pr-4 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-cyan-500' : 'bg-white border-slate-250 text-slate-800 focus:ring-indigo-505'
                          }`}
                        />
                      </div>

                      {/* Shortcuts */}
                      <div className="flex gap-2 text-[9px] font-mono font-black text-slate-410 leading-none">
                        <button
                          onClick={() => setOfferTransferValue(negotiatingPlayer.marketValue)}
                          className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          [Mercado]
                        </button>
                        <button
                          onClick={() => setOfferTransferValue(Math.round(negotiatingPlayer.marketValue * 1.2))}
                          className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          [+20%]
                        </button>
                        <button
                          onClick={() => setOfferTransferValue(Math.min(playerTeam.budget, Math.round(negotiatingPlayer.marketValue * 2)))}
                          className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          [Máx]
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Campo 2: SALÁRIO SEMANAL */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                        SALÁRIO SEMANAL DO ATLETA (VENCIMENTOS)
                      </label>
                      <span className="text-xs text-slate-400 font-bold">
                        Base Atual: ${negotiatingPlayer.salary?.toLocaleString() || (negotiatingPlayer.overallRating * 1100).toLocaleString()}/sem
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">$</span>
                      <input
                        type="number"
                        value={offerSalaryWeekly}
                        onChange={(e) => setOfferSalaryWeekly(parseInt(e.target.value) || 0)}
                        className={`w-full py-2.5 pl-8 pr-4 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-cyan-500' : 'bg-white border-slate-250 text-slate-800 focus:ring-indigo-505'
                        }`}
                      />
                    </div>

                    {/* Shortcuts */}
                    <div className="flex gap-2 text-[9px] font-mono font-black text-slate-420 leading-none">
                      <button
                        onClick={() => setOfferSalaryWeekly(negotiatingPlayer.salary || negotiatingPlayer.overallRating * 1100)}
                        className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        [Base]
                      </button>
                      <button
                        onClick={() => setOfferSalaryWeekly(Math.round((negotiatingPlayer.salary || negotiatingPlayer.overallRating * 1100) * 1.25))}
                        className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        [+25%]
                      </button>
                      <button
                        onClick={() => setOfferSalaryWeekly(Math.round((negotiatingPlayer.salary || negotiatingPlayer.overallRating * 1100) * 1.5))}
                        className={`px-2.5 py-1.5 rounded cursor-pointer ${isDark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        [+50%]
                      </button>
                    </div>
                  </div>

                  {/* Slider: SPLITS */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                        SPLITS DE VIGÊNCIA (TEMPO DO ACORDO)
                      </label>
                      <span className={`text-xs font-black font-mono ${isDark ? 'text-cyan-400' : 'text-indigo-650'}`}>
                        {offerSplits} Splits ({offerSplits * 6} meses)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={offerSplits}
                      onChange={(e) => setOfferSplits(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />

                    <div className="flex justify-between text-[8.5px] font-mono text-slate-500 font-bold">
                      <span>1 Split (Curto)</span>
                      <span>2 Splits (Padrão)</span>
                      <span>3 Splits (Longo)</span>
                      <span>4 Splits (Franquizado)</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            {negotiationState === 'idle' && (
              <div className={`p-5 flex justify-end gap-3 border-t select-none ${
                isDark ? 'bg-[#0f1931]/40 border-[#3a506b]' : 'bg-slate-55 border-slate-200'
              }`}>
                <button
                  onClick={() => setNegotiatingPlayer(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-slate-900 border border-[#3a506b] text-slate-300 hover:bg-slate-800' : 'bg-white border border-slate-250 text-slate-705 hover:bg-slate-50'
                  }`}
                >
                  Desistir
                </button>

                <button
                  onClick={submitProposal}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-150 cursor-pointer shadow-md ${
                    isDark
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  Enviar Proposta Oficial
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MON-1: MODAL SECUNDÁRIO DE ALOCAÇÃO DE OLHEIROS */}
      {allocatingPlayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 select-none animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl relative overflow-hidden flex flex-col ${
            isDark ? 'bg-[#090f1d] border-[#3a506b] text-white' : 'bg-white border-slate-205 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 flex justify-between items-center border-b ${
              isDark ? 'bg-[#0f1931]/60 border-[#3a506b]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wide">
                  Designar Olheiro do Clube
                </h3>
              </div>
              <button
                onClick={() => setAllocatingPlayer(null)}
                className="text-slate-400 hover:text-white font-bold p-1 leading-none cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Target Athlete details */}
              <div className={`p-3 rounded-xl border flex gap-3 items-center ${
                isDark ? 'bg-slate-950/40 border-[#3a506b]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-700/50">
                  <img src={allocatingPlayer.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={allocatingPlayer.name} />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase leading-none text-cyan-400">{allocatingPlayer.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Posição: {allocatingPlayer.position} • OVR: {allocatingPlayer.overallRating} • Valor: {formatMoney(allocatingPlayer.marketValue)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Selecione um dos olheiros disponíveis da comissão técnica abaixo para iniciar o monitoramento ativo deste jogador.
              </p>

              {/* Scouts listing */}
              <div className="space-y-2.5">
                {hiredScouts.map(scout => {
                  const assignedPlayerId = scoutAssignments[scout.id];
                  const isAssignedToThis = assignedPlayerId === allocatingPlayer.id;
                  const isOccupied = !isAssignedToThis && !!assignedPlayerId;

                  let statusText = 'Disponível';
                  let statusColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';

                  if (isAssignedToThis) {
                    statusText = 'Monitorando Ativo';
                    statusColor = 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
                  } else if (isOccupied) {
                    statusText = 'Ocupado';
                    statusColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
                  }

                  return (
                    <div 
                      key={scout.id}
                      className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                        isDark ? 'bg-[#0f1931]/40 border-[#3a506b]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate block max-w-[180px]">{scout.name}</span>
                          <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded border ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                        {/* Scouting level */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-slate-400 font-mono">Scouting:</span>
                          <div className="flex gap-0.5 text-[10px] text-amber-500 font-bold leading-none">
                            {'★'.repeat(scout.stars)}{'☆'.repeat(5 - scout.stars)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmScoutAllocation(scout.id, scout.name)}
                        disabled={isAssignedToThis}
                        className={`text-[9px] font-mono font-black px-2.5 py-1.5 rounded-lg uppercase cursor-pointer active:scale-95 transition-all text-center ${
                          isAssignedToThis
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-450/10'
                        }`}
                      >
                        {isAssignedToThis ? 'VINCULADO' : 'DESIGNAR'}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 flex justify-end border-t ${
              isDark ? 'bg-[#0f1931]/40 border-[#3a506b]' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => setAllocatingPlayer(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDark ? 'bg-slate-900 border border-[#3a506b] text-slate-300 hover:bg-slate-800' : 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Voltar ao Mercado
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Award, Zap, TrendingUp, Sparkles, HelpCircle, 
  AlertTriangle, DollarSign, Terminal, Copy, Check, 
  RefreshCw, Percent, ShieldAlert 
} from 'lucide-react';
import { GameState, Sponsor } from '../types';
import { formatMoney, getCurrencySymbol } from '../utils/currency';

interface SponsorsTabProps {
  gameState: GameState;
  onSignSponsor: (sponsorId: string) => void;
  onUpgradeInfrastructure?: (facilityType: 'gamingHouseLevel' | 'trainingCenterLevel' | 'mediaTeamLevel') => void;
  onUpdateGameState?: (nextState: GameState) => void;
  triggerNotification?: (title: string, desc: string) => void;
  theme?: string;
}

// Full-scale multi-language dynamic translation dictionary
const translations = {
  pt: {
    saldo_caixa: "Saldo de Caixa",
    inflow_semanal_patrocinio: "Inflow Semanal (Patrocínios)",
    metricas_de_fas: "Métricas de Fãs (Popularidade)",
    titulo_ativos: "PATROCINADORES ATIVOS",
    status_firmado: "ASSINADO",
    meta_contratual: "Meta Contratual",
    termo_restante: "Termo Restante",
    multa_rescisoria: "Multa de Rescisão",
    btn_rescindir: "RESCINDIR CONTRATO",
    titulo_propostas: "PROPOSTAS DE PATROCÍNIO EM MERCADO",
    bonus_assinatura: "BÔNUS DE ASSINATURA",
    requisitos_minimos: "Mín. Popularidade",
    btn_assinar: "ASSINAR CONTRATO",
    vazio_mercado: "Aguardando novas propostas do mercado corporativo...",
    vazio_ativos: "Nenhum patrocinador assinado nesta vaga corporativa.",
    progresso_porcentagem: "CONFIABILIDADE COMERCIAL",
    clausula_hype_performance: "CLÁUSULA DE HYPE & PERFORMANCE (+10% BÔNUS ATIVO)",
    clausula_hype_desc_active: "🔥 Time voando! Sequência de vitórias ativa concede +10% de rendimento de patrocinador aos cofres semanais.",
    clausula_hype_desc_inactive: "Estabilidade comercial regular. Conquiste mais vitórias sequenciais para ativar o multiplicador de +10% por Hype.",
    confiabilidade_desc: "Histórico comercial impecável e estável garante maior confiabilidade e multas de rescisão menores.",
    json_payload_title: "MOTOR DE DADOS (DATA ENGINE) - PAYLOAD INTEGRADO",
    api_sim_terminal: "Central do Manager API • Sincronização em tempo de execução via Auto-Save local",
    exibir_payload: "Exibir Payload JSON",
    ocultar_payload: "Ocultar Payload",
    api_desc: "Simulação reativa entre o backend do Central do Manager e os bancos de dados. Envie comandos no console ou mude o idioma acima para atualizar todos os textos e chaves JSON no momento exato de execução.",
    fãs: "Fãs",
    semanas: "semanas",
    validade: "Válido por mais",
    slot_master: "1. SLOT PRINCIPAL (MASTER)",
    slot_sec_1: "2. SLOT SECUNDÁRIO 1",
    slot_sec_2: "3. SLOT SECUNDÁRIO 2",
    slot_sec_3: "4. SLOT SECUNDÁRIO 3",
    vazio: "SLOT VAGO",
    requisito_fãs_erro: "Popularidade insuficiente para assinar com esta parceira comercial!",
    limite_master_erro: "O Slot Master já está ocupado por outro contrato longo! Rescinda o ativo primeiro.",
    limite_secundario_erro: "Todos os 3 Slots Secundários já estão ocupados! Rescinda algum para liberar espaço.",
    rescisao_sucesso: "Contrato rescindido com sucesso! Multa debitada:",
    rescisao_erro: "Saldo insuficiente para pagar a multa de rescisão de",
    assinatura_sucesso: "Contrato firmado com sucesso! Luvas recebidas:",
    moeda_ativa: "Moeda Ativa",
    status_excelente: "Excelente",
    status_bom: "Bom",
    status_regular: "Regular",
    enviar_comando: "MANDAR COMANDO REATIVO",
    selecionar_idioma_teste: "Forçar Idioma JSON no Data Engine:",
    alerta_geral: "Painel reativo atualizado no banco de dados.",
    meta_exigida: "Meta Exigida",
    motivo_ausente: "Nenhuma meta contratual definida",
    vence_em: "Vence em",
    copiar: "COPIAR JSON",
    copiado: "Copiado!"
  },
  en: {
    saldo_caixa: "Cash Balance",
    inflow_semanal_patrocinio: "Weekly Inflow (Sponsorships)",
    metricas_de_fas: "Fandom Metrics (Popularity)",
    titulo_ativos: "ACTIVE SPONSORS",
    status_firmado: "SIGNED",
    meta_contratual: "Contract Objective",
    termo_restante: "Weeks Remaining",
    multa_rescisoria: "Termination Penalty",
    btn_rescindir: "TERMINATE CONTRACT",
    titulo_propostas: "OPEN MARKET SPONSOR PROPOSALS",
    bonus_assinatura: "SIGNING BONUS",
    requisitos_minimos: "Min. Popularity",
    btn_assinar: "SIGN CONTRACT",
    vazio_mercado: "Awaiting new corporate market proposals...",
    vazio_ativos: "No active sponsorship. Check the open market below.",
    progresso_porcentagem: "COMMERCIAL TRUST INDEX",
    clausula_hype_performance: "HYPE & PERFORMANCE CLAUSE (+10% ACTIVE BONUS)",
    clausula_hype_desc_active: "🔥 On fire! Active winning streak grants a +10% efficiency bonus on weekly sponsor inflows.",
    clausula_hype_desc_inactive: "Neutral commercial momentum. Secure sequential series wins to toggle the +10% Performance Hype.",
    confiabilidade_desc: "An impeccable trade history guarantees maximum trust and premium business offerings.",
    json_payload_title: "DATA ENGINE CONSOLE - INTEGRATED PAYLOAD INDEX",
    api_sim_terminal: "Manager Central API • Real-time runtime synchronization with local database auto-saves",
    exibir_payload: "Show JSON Payload",
    ocultar_payload: "Hide Payload",
    api_desc: "Reactive pipeline between Central do Manager and active local databases. Send commands or toggle localized settings to verify payload updates instantly.",
    fãs: "Fans",
    semanas: "weeks",
    validade: "Valid for",
    slot_master: "1. MAIN SLOT (MASTER)",
    slot_sec_1: "2. SECONDARY SLOT 1",
    slot_sec_2: "3. SECONDARY SLOT 2",
    slot_sec_3: "4. SECONDARY SLOT 3",
    vazio: "VACANT SLOT",
    requisito_fãs_erro: "Insufficient fandom popularity to sign with this corporate partner!",
    limite_master_erro: "The Master Slot is already occupied by a long-term contract! Terminate it first.",
    limite_secundario_erro: "All 3 Secondary Slots are occupied! Terminate an active one to free up space.",
    rescisao_sucesso: "Contract successfully terminated! Penalty debited:",
    rescisao_erro: "Insufficient capital to cover the termination penalty of",
    assinatura_sucesso: "Partnership signed successfully! Signature bonus credited:",
    moeda_ativa: "Active Currency",
    status_excelente: "Excellent",
    status_bom: "Good",
    status_regular: "Average",
    enviar_comando: "SEND REACTIVE STATEMENT",
    selecionar_idioma_teste: "Force Custom JSON Language Preview:",
    alerta_geral: "Reactive payload parameters evaluated successfully.",
    meta_exigida: "Required Goal",
    motivo_ausente: "No contract objective specified",
    vence_em: "Expires in",
    copiar: "COPY JSON",
    copiado: "Copied!"
  },
  es: {
    saldo_caixa: "Saldo de Caja",
    inflow_semanal_patrocinio: "Ingreso Semanal (Patrocinios)",
    metricas_de_fas: "Métricas de Fans (Popularidad)",
    titulo_ativos: "PATROCINADORES ACTIVOS",
    status_firmado: "FIRMADO",
    meta_contratual: "Meta Contractual",
    termo_restante: "Término Restante",
    multa_rescisoria: "Multa por Rescisión",
    btn_rescindir: "RESCINDIR CONTRATO",
    titulo_propostas: "PROPUESTAS DE PATROCINIO EN MERCADO",
    bonus_assinatura: "BONO POR FIRMA",
    requisitos_minimos: "Mín. Popularidad",
    btn_assinar: "FIRMAR CONTRATO",
    vazio_mercado: "Esperando nuevas propuestas del mercado corporativo...",
    vazio_ativos: "Ningún patrocinador firmado en esta vacante corporativa.",
    progresso_porcentagem: "ÍNDICE DE CONFIABILIDAD INTEGRAL",
    clausula_hype_performance: "CLÁUSULA HYPE & PERFORMANCE (+10% BONO ACTIVO)",
    clausula_hype_desc_active: "🔥 ¡Racha de triunfos! La secuencia ganadora otorga un +10% de rendimiento de patrocinador semanal.",
    clausula_hype_desc_inactive: "Estabilidad de mercado normal. Consiga victorias consecutivas para activar el multiplicador por Hype.",
    confiabilidade_desc: "Su impecable historial comercial le garantiza alianzas estratégicas excelentes con marcas Tier-1.",
    json_payload_title: "CONSOLA DEL MOTOR DE DATOS - PAYLOAD JSON REATIVO",
    api_sim_terminal: "Manager Central API • Sincronización en tiempo de ejecución de guardado local automátizado",
    exibir_payload: "Ver Payload JSON",
    ocultar_payload: "Ocultar Payload",
    api_desc: "Simulación de protocolos de red entre Central do Manager y bases de datos locales. Altere la moneda o el idioma para probar la reactividad instantánea.",
    fãs: "Fans",
    semanas: "semanas",
    validade: "Válido por más",
    slot_master: "1. SLOT PRINCIPAL (MASTER)",
    slot_sec_1: "2. SLOT SECUNDARIO 1",
    slot_sec_2: "3. SLOT SECUNDARIO 2",
    slot_sec_3: "4. SLOT SECUNDARIO 3",
    vazio: "SLOT VACANTE",
    requisito_fãs_erro: "¡Popularidad insuficiente de la afición para firmar con esta marca!",
    limite_master_erro: "¡El Slot Master ya está ocupado por un compromiso a largo plazo! Rescíndalo primero.",
    limite_secundario_erro: "¡Los 3 Slots Secundarios ya están ocupados! Rescinda un contrato para liberar espacio.",
    rescisao_sucesso: "¡Contrato rescindido con éxito! Multa abonada:",
    rescisao_erro: "¡Fondos insuficientes para abonar la multa por rescisión de",
    assinatura_sucesso: "¡Alianza firmada con éxito! Bono acreditado:",
    moeda_ativa: "Moneda de Cambio",
    status_excelente: "Excelente",
    status_bom: "Bueno",
    status_regular: "Regular",
    enviar_comando: "ENVIAR COMANDO REATIVO",
    selecionar_idioma_teste: "Forzar Idioma de Análisis JSON:",
    alerta_geral: "Parámetros del payload evaluados de manera reactiva.",
    meta_exigida: "Meta Requerida",
    motivo_ausente: "Ninguna meta estipulada",
    vence_em: "Vence en",
    copiar: "COPIAR JSON",
    copiado: "¡Copiado!"
  }
};

export default function SponsorsTab({
  gameState,
  onSignSponsor,
  onUpdateGameState,
  triggerNotification,
  theme
}: SponsorsTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  // Track forced simulation configurations
  const [forcedLang, setForcedLang] = useState<'pt' | 'en' | 'es' | null>(null);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [consoleCommand, setConsoleCommand] = useState('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-detect settings language
  const settingsLang = (gameState as any).settings?.language;
  const langStored = typeof localStorage !== 'undefined' ? (localStorage.getItem('legendshub_lang') || 'pt') : 'pt';
  const activeLang: 'pt' | 'en' | 'es' = (() => {
    if (forcedLang) return forcedLang;
    if (settingsLang) {
      const lower = settingsLang.toLowerCase();
      if (lower.startsWith('pt')) return 'pt';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
    const lowerStored = langStored.toLowerCase();
    if (lowerStored.startsWith('pt')) return 'pt';
    if (lowerStored.startsWith('es')) return 'es';
    if (lowerStored.startsWith('en')) return 'en';
    return 'pt';
  })();

  const t = translations[activeLang];

  // Helper classifier to identify MASTER vs SECUNDARIO contracts
  const getSponsorClass = (s: Sponsor): 'MASTER' | 'SECUNDARIO' => {
    // If weeks duration >= 24 or id/name maps, classify it as MASTER
    if (s.termsInWeeks >= 20 || s.name.toLowerCase().includes('arena') || s.name.toLowerCase().includes('master') || s.id === 'sp3') {
      return 'MASTER';
    }
    return 'SECUNDARIO';
  };

  // Organize Player Sponsors in Slot constraints (Exactly 1 Master and 3 Secondary)
  const masterSponsor = useMemo(() => {
    return playerTeam.sponsors.find(s => getSponsorClass(s) === 'MASTER') || null;
  }, [playerTeam.sponsors]);

  const secondarySponsors = useMemo(() => {
    return playerTeam.sponsors.filter(s => getSponsorClass(s) === 'SECUNDARIO').slice(0, 3);
  }, [playerTeam.sponsors]);

  // Intercept open market in reactive manner - Ensure Master contracts always present
  const enrichedMarketProposals = useMemo(() => {
    const list = [...gameState.sponsorsMarket];
    // If no premium long-term Master contract is in the open market, inject custom presets procedurally
    const hasMaster = list.some(s => getSponsorClass(s) === 'MASTER');
    if (!hasMaster) {
      list.push({
        id: 'sp_major_itau',
        name: 'Itaú Arena Corp',
        logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100',
        incomePerWeek: 110000,
        signatureBonus: 280000,
        termsInWeeks: 48,
        minPopularity: 65,
        isSigned: false,
        objective: activeLang === 'pt' ? 'Classificar para os Playoffs' : activeLang === 'es' ? 'Clasificar para los Playoffs' : 'Qualify for Playoffs',
        objectiveBonus: 100000
      });
      list.push({
        id: 'sp_major_drakos',
        name: 'Drakos Tech Master',
        logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100',
        incomePerWeek: 165000,
        signatureBonus: 450000,
        termsInWeeks: 96,
        minPopularity: 80,
        isSigned: false,
        objective: activeLang === 'pt' ? 'Conquistar o Título do Split' : activeLang === 'es' ? 'Conquistar el Título del Split' : 'Conquer the Split Trophy',
        objectiveBonus: 250000
      });
    }

    // Add visual validity countdowns (regra de validade procedural)
    return list.map((s, index) => {
      const classType = getSponsorClass(s);
      return {
        ...s,
        classType,
        validityWeeks: ((index + 3) % 4) + 1 // procedurally alternates between 1 to 4 weeks left
      };
    });
  }, [gameState.sponsorsMarket, activeLang]);

  // Handle Sign Sponsor Contract
  const executeSignSponsor = (sponsorId: string) => {
    const s = enrichedMarketProposals.find(item => item.id === sponsorId);
    if (!s) return;

    // Check popularity requirement
    if (playerTeam.popularity < s.minPopularity) {
      const msg = t.requisito_fãs_erro;
      if (triggerNotification) triggerNotification('⚠️ Operação Recusada', msg);
      else alert(msg);
      return;
    }

    const type = getSponsorClass(s);
    const updatedState = { ...gameState };
    const team = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

    if (type === 'MASTER') {
      if (masterSponsor) {
        const msg = t.limite_master_erro;
        if (triggerNotification) triggerNotification('⚠️ Limite Excedido', msg);
        else alert(msg);
        return;
      }
    } else {
      if (secondarySponsors.length >= 3) {
        const msg = t.limite_secundario_erro;
        if (triggerNotification) triggerNotification('⚠️ Slots Esgotados', msg);
        else alert(msg);
        return;
      }
    }

    // Apply signing transaction
    team.budget += s.signatureBonus;
    team.sponsors.push({
      ...s,
      activeWeeks: s.termsInWeeks,
      isSigned: true
    });

    // Remove from active market
    updatedState.sponsorsMarket = updatedState.sponsorsMarket.filter(m => m.id !== sponsorId);

    // Save state globally
    if (onUpdateGameState) {
      onUpdateGameState(updatedState);
      const successMsg = `${t.assinatura_sucesso} ${formatMoney(s.signatureBonus)}`;
      if (triggerNotification) {
        triggerNotification('💼 ' + t.status_firmado, successMsg);
      }
    } else {
      onSignSponsor(sponsorId);
    }
  };

  // Handle Terminate/Rescindir contract with penalty fee calculations
  const executeRescindSponsor = (sponsorId: string, currentSponsor: Sponsor) => {
    // Penalty calculation: 3.5 weeks of income, representing standard clause penalty
    const penaltyFee = Math.round(currentSponsor.incomePerWeek * 3.5);

    if (playerTeam.budget < penaltyFee) {
      const errorMsg = `${t.rescisao_erro} ${formatMoney(penaltyFee)}`;
      if (triggerNotification) triggerNotification('❌ Saldo Insuficiente', errorMsg);
      else alert(errorMsg);
      return;
    }

    const updatedState = { ...gameState };
    const team = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

    // Deduct penalty fee
    team.budget -= penaltyFee;

    // Remove from team sponsors
    team.sponsors = team.sponsors.filter(s => s.id !== sponsorId);

    // Create fresh proposal on market
    updatedState.sponsorsMarket.push({
      ...currentSponsor,
      isSigned: false,
      activeWeeks: undefined
    });

    // Save state globally
    if (onUpdateGameState) {
      onUpdateGameState(updatedState);
      const successMsg = `${t.rescisao_sucesso} ${formatMoney(penaltyFee)}`;
      if (triggerNotification) {
        triggerNotification('💼 Contrato Rescindido', successMsg);
      }
    }
  };

  // Evaluate dynamic cláusula Hype multiplier
  const isWinningStreak = playerTeam.streak ? playerTeam.streak.toUpperCase().includes('W') : false;
  const hasHighlyPopularPlayer = playerTeam.roster.some(p => p.popularity >= 85);
  const isHypeActive = isWinningStreak || hasHighlyPopularPlayer;
  const hypeBonusMultiplier = isHypeActive ? 1.10 : 1.00;

  // Calculate actual total weekly sponsor inflow in real time
  const rawWeeklySponsorInflow = playerTeam.sponsors.reduce((acc, s) => acc + s.incomePerWeek, 0);
  const totalSponsorInflowCurrent = Math.round(rawWeeklySponsorInflow * hypeBonusMultiplier);

  // Generate dynamic data payload representing real-time Windows DB output
  const liveJsonResponse = useMemo(() => {
    const symbol = getCurrencySymbol();
    
    // Slotted active sponsors
    const slots_ativos = [
      {
        slot: "1. SLOT MAIN (MASTER)",
        detalhes: masterSponsor ? {
          id: masterSponsor.id,
          nome_marca: masterSponsor.name,
          label_status: t.status_firmado,
          meta_contratual: masterSponsor.objective || t.motivo_ausente,
          repasse_semanal: masterSponsor.incomePerWeek,
          termo_restante: `${masterSponsor.activeWeeks || masterSponsor.termsInWeeks} ${t.semanas}`,
          multa_rescisoria: Math.round(masterSponsor.incomePerWeek * 3.5)
        } : t.vazio
      },
      ...[0, 1, 2].map((idx) => {
        const s = secondarySponsors[idx];
        return {
          slot: `2. SLOT SECUNDARIO ${idx + 1}`,
          detalhes: s ? {
            id: s.id,
            nome_marca: s.name,
            label_status: t.status_firmado,
            meta_contratual: s.objective || t.motivo_ausente,
            repasse_semanal: s.incomePerWeek,
            termo_restante: `${s.activeWeeks || s.termsInWeeks} ${t.semanas}`,
            multa_rescisoria: Math.round(s.incomePerWeek * 3.5)
          } : t.vazio
        };
      })
    ];

    // Market offers translated nodes
    const propostas_mercado = enrichedMarketProposals.map(s => ({
      id: s.id,
      nome_marca: s.name,
      bonus_assinatura: s.signatureBonus,
      meta_exigida: s.objective,
      repasse_semanal: s.incomePerWeek,
      requisitos_minimos_de_fas: s.minPopularity,
      validade_semanas: s.validityWeeks
    }));

    return {
      cabecalho_metricas_financeiras: {
        saldo_caixa: {
          caixa_bruto: playerTeam.budget,
          caixa_formatado_hud: formatMoney(playerTeam.budget)
        },
        inflow_semanal_patrocinio: `+ ${formatMoney(totalSponsorInflowCurrent)}`,
        metricas_de_fas: `${t.metricas_de_fas} - ${playerTeam.popularity}%`
      },
      secao_patrocinadores_ativos: slots_ativos,
      secao_propostas_em_mercado: propostas_mercado,
      clausula_hype_performance: {
        ativo: isHypeActive,
        multiplicador: isHypeActive ? 1.10 : 1.00,
        mensagem: isHypeActive ? t.clausula_hype_desc_active : t.clausula_hype_desc_inactive
      },
      nivel_confiabilidade_comercial: {
        progresso_porcentagem: 85,
        status: t.status_excelente,
        mensagem: t.confiabilidade_desc
      },
      moeda_ativa: symbol,
      data_engine_status: "ONLINE",
      linguagem_ativa: activeLang.toUpperCase()
    };
  }, [playerTeam, masterSponsor, secondarySponsors, enrichedMarketProposals, activeLang, totalSponsorInflowCurrent, isHypeActive]);

  // Execute manual JSON Command dispatchers for testing
  const submitTerminalCommand = () => {
    if (!consoleCommand) return;
    try {
      const clean = consoleCommand.trim();
      const parsed = JSON.parse(clean);

      if (parsed.acao === "abrir_tela_patrocinadores" || parsed.action === "open_sponsors") {
        if (parsed.idioma || parsed.language) {
          const l = String(parsed.idioma || parsed.language).toLowerCase();
          if (l.includes('en') || l === 'en-us') {
            setForcedLang('en');
            setCommandFeedback("COMANDO EN-US PROCESSADO: Filtro reativo reconfigurado para Inglês com sucesso.");
          } else if (l.includes('es') || l === 'es-es') {
            setForcedLang('es');
            setCommandFeedback("COMANDO ES-ES PROCESSADO: Filtro reativo reconfigurado para Espanhol com sucesso.");
          } else {
            setForcedLang('pt');
            setCommandFeedback("COMANDO PT-BR PROCESSADO: Filtro reativo reconfigurado para Português com sucesso.");
          }
        } else {
          setCommandFeedback("COMANDO PROCESSADO: Tela carregada com sucesso.");
        }
      } else {
        setCommandFeedback("CONSOLA DE DADOS: Comando analisado sem ações registradas.");
      }
    } catch (e) {
      setCommandFeedback("ERRO DE SINTAXE: O payload do comando precisa ser um objeto JSON válido (Ex: {\"acao\":\"abrir_tela_patrocinadores\",\"idioma\":\"EN-US\"})");
    }
    setTimeout(() => setCommandFeedback(null), 5000);
  };

  // Trigger quick clipboard actions
  const triggerCopyPayload = () => {
    const text = JSON.stringify(liveJsonResponse, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0a1424] border border-[#1e2d44] p-5 rounded-xl select-none">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
            {t.saldo_caixa}
          </p>
          <h3 className="font-display text-[#00FF88] text-2xl font-black tracking-tight">
            {formatMoney(playerTeam.budget)}
          </h3>
        </div>
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#1e2d44]/60 pt-3 md:pt-0 md:pl-4">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none flex items-center gap-1.5">
            {t.inflow_semanal_patrocinio}
            {isHypeActive && <Sparkles className="w-3.5 h-3.5 text-[#00FF88] animate-pulse" />}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-[#00E5FF] text-2xl font-black tracking-tight">
              + {formatMoney(totalSponsorInflowCurrent)}
            </h3>
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">/ {langStored === 'en' ? 'wk' : 'sem'}</span>
          </div>
        </div>
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#1e2d44]/60 pt-3 md:pt-0 md:pl-4">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">
            {t.metricas_de_fas}
          </p>
          <h3 className="font-display text-white text-2xl font-black tracking-tight">
            Popularity {playerTeam.popularity}%
          </h3>
        </div>
      </div>

      <div className="w-full space-y-6">
        
        {/* 2. SLOOTED ACTIVE SPONSORS VIEW (Occupies FULL width of the container!) */}
        <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow-lg space-y-5">
          <div className="flex justify-between items-center border-b border-[#1e2d44] pb-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-[#00E5FF] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00E5FF]" /> {t.titulo_ativos}
            </h4>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-black rounded uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SLOTS 4 / 4 OK
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Slot 1: Master Slot */}
            <div className={`rounded-xl p-4 border flex flex-col justify-between min-h-[220px] transition-all duration-300 relative overflow-hidden group ${
              masterSponsor 
                ? 'bg-[#0b1b34]/95 border-[#00E5FF]/40 hover:border-[#00E5FF]/80 shadow-[0_0_15px_-3px_rgba(0,229,255,0.15)]' 
                : 'bg-[#070d19]/80 border-dashed border-[#1e2d44] hover:bg-[#081224]/80'
            }`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono font-black uppercase rounded tracking-wider">
                    {t.slot_master}
                  </span>
                  {masterSponsor && <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-bounce" />}
                </div>

                {masterSponsor ? (
                  <div className="space-y-2">
                    <h5 className="font-display text-sm font-black text-white uppercase tracking-tight">{masterSponsor.name}</h5>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                        {t.meta_contratual}: <span className="text-white font-medium block mt-0.5">{masterSponsor.objective}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                        {t.termo_restante}: <span className="text-white block mt-0.5">{masterSponsor.activeWeeks || masterSponsor.termsInWeeks} {t.semanas}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold italic mt-4">
                    {t.vazio_ativos}
                  </p>
                )}
              </div>

              {masterSponsor ? (
                <div className="border-t border-[#1e2d44] pt-3 mt-4 space-y-2.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400 font-bold">{t.saldo_caixa}</span>
                    <span className="text-[#00FF88] font-black">+{formatMoney(Math.round(masterSponsor.incomePerWeek * hypeBonusMultiplier))} / sem</span>
                  </div>
                  <button
                    onClick={() => executeRescindSponsor(masterSponsor.id, masterSponsor)}
                    className="w-full py-1.5 bg-[#0e1726] hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3" /> {t.btn_rescindir}
                  </button>
                </div>
              ) : (
                <div className="text-[9px] text-[#00E5FF]/70 font-mono tracking-tight mt-6 uppercase">
                  {t.vazio}
                </div>
              )}
            </div>

            {/* Slots 2, 3, 4: Secondary Slots */}
            {[0, 1, 2].map((idx) => {
              const s = secondarySponsors[idx];
              return (
                <div key={idx} className={`rounded-xl p-4 border flex flex-col justify-between min-h-[220px] transition-all duration-300 group ${
                  s 
                    ? 'bg-[#0f172a]/95 border-emerald-500/20 hover:border-emerald-500/60 shadow-inner' 
                    : 'bg-[#070d19]/80 border-dashed border-[#1e2d44] hover:bg-[#081224]/80'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-400 font-mono font-extrabold uppercase rounded tracking-wider">
                        {idx === 0 ? t.slot_sec_1 : idx === 1 ? t.slot_sec_2 : t.slot_sec_3}
                      </span>
                    </div>

                    {s ? (
                      <div className="space-y-2">
                        <h5 className="font-display text-sm font-black text-white uppercase tracking-tight">{s.name}</h5>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                            {t.meta_contratual}: <span className="text-white block mt-0.5 font-medium">{s.objective}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                            {t.termo_restante}: <span className="text-white block mt-0.5">{s.activeWeeks || s.termsInWeeks} {t.semanas}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 leading-relaxed font-semibold italic mt-4">
                        {t.vazio_ativos}
                      </p>
                    )}
                  </div>

                  {s ? (
                    <div className="border-t border-[#1e2d44] pt-3 mt-4 space-y-2.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-400 font-bold">{t.saldo_caixa}</span>
                        <span className="text-[#00FF88] font-black">+{formatMoney(Math.round(s.incomePerWeek * hypeBonusMultiplier))} / sem</span>
                      </div>
                      <button
                        onClick={() => executeRescindSponsor(s.id, s)}
                        className="w-full py-1.5 bg-[#0e1726] hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3" /> {t.btn_rescindir}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[9px] text-[#00FF88]/40 font-mono tracking-tight mt-6 uppercase font-bold">
                      {t.vazio}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* 3. OPEN MARKET SPONSOR PROPOSALS LIST */}
        <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2d44] pb-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-white">
              {t.titulo_propostas}
            </h4>
            <div className="text-[9px] font-mono font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Fãs Atuais da Organização: <span className="font-bold text-white">{playerTeam.popularity}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedMarketProposals.length > 0 ? (
              enrichedMarketProposals.map(s => {
                const popularityCheck = playerTeam.popularity >= s.minPopularity;
                const isMasterSpon = getSponsorClass(s) === 'MASTER';
                
                return (
                  <div key={s.id} className="relative bg-[#070d19] border border-[#1e2d44] rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h5 className="font-display text-sm font-black text-white uppercase tracking-tight">{s.name}</h5>
                          <span className={`text-[8px] px-1.5 py-0.5 font-mono font-black uppercase rounded tracking-wider border ${
                            isMasterSpon 
                              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isMasterSpon ? 'MASTER' : 'SECONDARY'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                          🛡️ {t.vence_em}: {s.validityWeeks || 2}w
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10.5px] border-y border-[#1e2d44]/50 py-3">
                        <div>
                          <p className="text-gray-500 font-extrabold uppercase text-[9px]">{t.bonus_assinatura}</p>
                          <p className="text-white font-black mt-0.5">{formatMoney(s.signatureBonus)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-extrabold uppercase text-[9px]">{t.saldo_caixa}</p>
                          <p className="text-[#00FF88] font-black mt-0.5">+{formatMoney(s.incomePerWeek)}/sem</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 font-extrabold uppercase text-[9px]">{t.meta_exigida}</p>
                          <p className="text-white mt-0.5 font-medium">{s.objective}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-[9.5px]">
                        <p className="text-gray-400 font-bold uppercase">
                          {t.requisitos_minimos}: <strong className="text-gray-200">{s.minPopularity}% {t.fãs}</strong>
                        </p>
                        <p className="text-gray-500 font-medium">Term: {s.termsInWeeks} {t.semanas}</p>
                      </div>
                      
                      <button
                        onClick={() => executeSignSponsor(s.id)}
                        disabled={!popularityCheck}
                        className={`px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                          popularityCheck 
                            ? 'bg-[#00E5FF] text-black hover:bg-[#33ebff] active:scale-95 shadow-md shadow-[#00E5FF]/10' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        }`}
                      >
                        {t.btn_assinar}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8 text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                {t.vazio_mercado}
              </div>
            )}
          </div>
        </div>

        {/* 4. IMMERSIVE EXPERIENCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 space-y-3 shadow-md">
            <h5 className="text-[10px] uppercase font-black tracking-widest text-[#00E5FF] flex items-center gap-1.5 select-none">
              <Percent className="w-4 h-4" /> {t.progresso_porcentagem}
            </h5>
            <div className="flex justify-between items-center font-mono text-xs font-black select-none mt-1">
              <span className="text-gray-400">STATUS: {t.status_excelente}</span>
              <span className="text-[#00FF88]">85%</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00E5FF] rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[10.5px] text-gray-400 leading-normal leading-relaxed">
              {t.confiabilidade_desc}
            </p>
          </div>

          <div className={`border rounded-xl p-5 space-y-3 shadow-md transition-all duration-300 ${
            isHypeActive 
              ? 'bg-[#082025]/30 border-[#00E5FF]/20 shadow-[0_0_15px_-4px_rgba(0,229,255,0.1)]' 
              : 'bg-[#0a1424] border-[#1e2d44]'
          }`}>
            <h5 className="text-[10px] uppercase font-black tracking-widest text-[#00E5FF] flex items-center gap-1.5 select-none">
              <Zap className="w-4 h-4 fill-current text-amber-400" /> {t.clausula_hype_performance}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                isHypeActive ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-gray-800 text-gray-500'
              }`}>
                {isHypeActive ? 'ACTIVE (+10%)' : 'INACTIVE'}
              </span>
              <span className="text-gray-400 font-mono text-xs font-bold">Streak: {playerTeam.streak || '-'}</span>
            </div>
            <p className="text-[10.5px] text-gray-400 leading-relaxed font-medium">
              {isHypeActive ? t.clausula_hype_desc_active : t.clausula_hype_desc_inactive}
            </p>
          </div>

        </div>

      </div>

      {/* 5. COLLAPSIBLE DATA ENGINE / DATABASE PAYLOAD CONSOLE */}
      <div className="bg-[#040a14] border border-[#1e2d44]/70 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0 border border-[#00E5FF]/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                {t.json_payload_title}
                <span className="px-1.5 py-0.5 font-mono text-[8.5px] bg-[#00FF88]/10 text-[#00FF88] rounded-md font-bold uppercase animate-pulse">
                  STATUS: ONLINE
                </span>
              </h4>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                {t.api_sim_terminal}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className={`px-4 py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                isConsoleExpanded 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-[#00FF88] border-emerald-500/30'
              }`}
            >
              {isConsoleExpanded ? t.ocultar_payload : t.exibir_payload}
            </button>
          </div>
        </div>

        <p className="text-[10.5px] text-gray-400 leading-relaxed max-w-4xl mt-3">
          {t.api_desc}
        </p>

        {isConsoleExpanded && (
          <div className="mt-5 space-y-3 border-t border-[#1e2d44] pt-4 animate-fade-in">
            
            {/* Interactive Simulators Controls Line */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-gray-500 block leading-none">{t.selecionar_idioma_teste}</label>
                <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-[#1e2d44]/50">
                  <button 
                    onClick={() => setForcedLang('pt')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'pt' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    PT-BR
                  </button>
                  <button 
                    onClick={() => setForcedLang('en')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'en' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN-US
                  </button>
                  <button 
                    onClick={() => setForcedLang('es')} 
                    className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded text-center transition-all cursor-pointer ${activeLang === 'es' ? 'bg-[#00E5FF] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    ES-ES
                  </button>
                  {forcedLang !== null && (
                    <button 
                      onClick={() => setForcedLang(null)} 
                      className="px-1.5 py-1 text-[8.5px] font-mono font-black bg-rose-500/20 text-rose-400 rounded hover:opacity-90"
                      title="Reset language synchronization"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>

              {/* Reactive Console Inputs Simulator */}
              <div className="md:col-span-6 space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-gray-500 block leading-none">
                  {t.enviar_comando} (Ex: {"{\"acao\":\"abrir_tela_patrocinadores\",\"idioma\":\"EN-US\"}"})
                </label>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-[#1e2d44]/50">
                  <input
                    type="text"
                    value={consoleCommand}
                    onChange={(e) => setConsoleCommand(e.target.value)}
                    placeholder='{"acao": "abrir_tela_patrocinadores", "idioma": "EN-US"}'
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono min-w-0"
                  />
                  <button
                    onClick={submitTerminalCommand}
                    className="px-3.5 py-1.5 bg-[#00E5FF] text-black text-[9px] font-mono font-black uppercase tracking-wider rounded-md hover:bg-[#33ebff] transition-all cursor-pointer"
                  >
                    SEND
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={triggerCopyPayload}
                  className="w-full py-2 bg-slate-900 border border-slate-700/60 hover:border-[#00FF88] text-gray-300 hover:text-white text-[9px] font-mono font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 py-2.5 shadow-md"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {isCopied ? t.copiado : t.copiar}
                </button>
              </div>
            </div>

            {commandFeedback && (
              <div className={`p-3 rounded-lg border font-mono text-[10.5px] leading-relaxed select-none ${
                commandFeedback.includes('ERRO') 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-[#00FF88]'
              }`}>
                {commandFeedback}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 px-1 uppercase select-none">
                <span>DATABASE STREAM</span>
                <span>REGION: {playerTeam.region || 'CBLOL'}</span>
                <span>Active Locale: {activeLang.toUpperCase()}</span>
              </div>
              <pre className="bg-slate-950/95 text-emerald-400 p-4.5 rounded-lg overflow-x-auto text-[11px] font-mono border border-slate-800/80 shadow-inner max-h-[350px] leading-relaxed">
                {JSON.stringify(liveJsonResponse, null, 2)}
              </pre>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

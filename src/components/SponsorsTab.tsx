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
import { getGameAssetUrl, getImageUrl } from '../utils/gameAssets';

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

  // Modals & Selection States for Contract Actions and Substitution (Troca Direta)
  const [activeModal, setActiveModal] = useState<'NONE' | 'RESCIND_CONFIRM' | 'SWAP_SELECT' | 'SWAP_CONFIRM'>('NONE');
  const [sponsorToRescind, setSponsorToRescind] = useState<Sponsor | null>(null);
  const [newSponsorToSign, setNewSponsorToSign] = useState<Sponsor | null>(null);
  const [oldSponsorToReplace, setOldSponsorToReplace] = useState<Sponsor | null>(null);
  const [commercialTrust, setCommercialTrust] = useState<number>(() => {
    const saved = localStorage.getItem('legendshub_commercial_trust');
    return saved ? Math.max(0, Math.min(100, parseInt(saved))) : 85;
  });

  const injectEmailIntoInbox = (sender: string, senderRole: string, subject: string, body: string, category: 'Direção' | 'Jogadores' | 'Propostas') => {
    const raw = localStorage.getItem('legendshub_custom_events_emails');
    let current: any[] = [];
    if (raw) {
      try {
        current = JSON.parse(raw);
      } catch (e) {
        current = [];
      }
    }
    const newEmail = {
      id: `email-sponsor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      senderRole,
      subject,
      body,
      date: 'Hoje / Semana Atual',
      category,
      read: false
    };
    localStorage.setItem('legendshub_custom_events_emails', JSON.stringify([newEmail, ...current]));
  };

  // Direct registration when slot is vacant
  const completeSignDirect = (s: Sponsor) => {
    const updatedState = { ...gameState };
    const team = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

    // Apply BOTH signature bonus and first weekly inflow immediately
    team.budget += s.signatureBonus + s.incomePerWeek;

    team.sponsors.push({
      ...s,
      activeWeeks: s.termsInWeeks,
      isSigned: true
    });

    // Remove from active market
    updatedState.sponsorsMarket = updatedState.sponsorsMarket.filter(m => m.id !== s.id);

    // Save state globally
    if (onUpdateGameState) {
      onUpdateGameState(updatedState);
      const successMsg = `Contrato firmado! Foram creditados ${formatMoney(s.signatureBonus)} (luvas) e ${formatMoney(s.incomePerWeek)} (primeiro inflow semanal) imediatamente!`;
      if (triggerNotification) {
        triggerNotification('💼 ' + t.status_firmado, successMsg);
      }
    }
  };

  // Handle active sponsor contract signing with Troca Direta fallback
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
    if (type === 'MASTER') {
      if (masterSponsor) {
        // TROCA DIRETA! Slot occupied. Show swap confirm.
        setNewSponsorToSign(s);
        setOldSponsorToReplace(masterSponsor);
        setActiveModal('SWAP_CONFIRM');
        return;
      }
    } else {
      if (secondarySponsors.length >= 3) {
        // TROCA DIRETA! All secondary slots occupied. Choose which one to swap.
        setNewSponsorToSign(s);
        setActiveModal('SWAP_SELECT');
        return;
      }
    }

    // Direct vacant slot sign
    completeSignDirect(s);
  };

  // Confirm standard contract termination
  const confirmRescindSponsor = () => {
    if (!sponsorToRescind) return;
    
    // Penalty calculation: 3 weeks of income as requested!
    const penaltyFee = Math.round(sponsorToRescind.incomePerWeek * 3);

    const updatedState = { ...gameState };
    const team = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

    if (team.budget < penaltyFee) {
      const errorMsg = `Saldo insuficiente para quitar a multa rescisória de ${formatMoney(penaltyFee)}!`;
      if (triggerNotification) triggerNotification('❌ Saldo Insuficiente', errorMsg);
      else alert(errorMsg);
      setActiveModal('NONE');
      setSponsorToRescind(null);
      return;
    }

    // Deduct penalty fee
    team.budget -= penaltyFee;

    // Deduct popularity matching proportional remaining term: 5% to 15%
    const weeksRemaining = sponsorToRescind.activeWeeks || sponsorToRescind.termsInWeeks;
    const termsInWeeks = sponsorToRescind.termsInWeeks;
    const ratio = weeksRemaining / termsInWeeks;
    const popularityPenalty = Math.max(5, Math.min(15, Math.round(ratio * 15)));
    team.popularity = Math.max(0, team.popularity - popularityPenalty);

    // Deduct Commercial trust by 20 points
    const nextTrust = Math.max(0, commercialTrust - 20);
    setCommercialTrust(nextTrust);
    localStorage.setItem('legendshub_commercial_trust', String(nextTrust));

    // Remove from team sponsors
    team.sponsors = team.sponsors.filter(s => s.id !== sponsorToRescind.id);

    // Create fresh proposal on market
    const exists = updatedState.sponsorsMarket.some(m => m.id === sponsorToRescind.id);
    if (!exists) {
      updatedState.sponsorsMarket.push({
        ...sponsorToRescind,
        isSigned: false,
        activeWeeks: undefined
      });
    }

    // Email trigger A (Queda na confiabilidade)
    injectEmailIntoInbox(
      'Head de Marketing',
      'Diretor Comercial',
      'Alerta Crítico: Nossa reputação no mercado corporativo despencou',
      `Manager, a nossa recente instabilidade com parceiros comerciais afetou drasticamente nossa Confiabilidade Comercial (atualmente em ${nextTrust}%). O mercado está nos enxergando como uma organização instável. Se não estabilizarmos nossos contratos ativos, as próximas marcas de grande porte que analisarem nossa equipe vão exigir metas muito mais agressivas ou oferecerão bônus de assinatura reduzidos. Sugiro cautela nas próximas decisões.`,
      'Direção'
    );

    // Save state globally
    if (onUpdateGameState) {
      onUpdateGameState(updatedState);
      const successMsg = `Contrato rescindido! Penalidade paga: ${formatMoney(penaltyFee)}. Confiabilidade Comercial faliu por -20pts.`;
      if (triggerNotification) {
        triggerNotification('💼 Contrato Rescindido', successMsg);
      }
    }

    setActiveModal('NONE');
    setSponsorToRescind(null);
  };

  // Confirm direct sponsor replace/swap
  const confirmSponsorSwap = () => {
    if (!newSponsorToSign || !oldSponsorToReplace) return;

    // Penalty: 3x old sponsor inflow
    const penaltyFee = Math.round(oldSponsorToReplace.incomePerWeek * 3);

    const updatedState = { ...gameState };
    const team = updatedState.teams.find(t => t.id === updatedState.playerTeamId)!;

    if (team.budget < penaltyFee) {
      const errorMsg = `Saldo insuficiente para pagar a multa de rescisão de ${formatMoney(penaltyFee)}!`;
      if (triggerNotification) triggerNotification('❌ Saldo Insuficiente', errorMsg);
      else alert(errorMsg);
      setActiveModal('NONE');
      setNewSponsorToSign(null);
      setOldSponsorToReplace(null);
      return;
    }

    // Deduct penalty
    team.budget -= penaltyFee;

    // Deduct popularity: 5% to 15%
    const weeksRemaining = oldSponsorToReplace.activeWeeks || oldSponsorToReplace.termsInWeeks;
    const termsInWeeks = oldSponsorToReplace.termsInWeeks;
    const ratio = weeksRemaining / termsInWeeks;
    const popularityPenalty = Math.max(5, Math.min(15, Math.round(ratio * 15)));
    team.popularity = Math.max(0, team.popularity - popularityPenalty);

    // Deduct Commercial trust by 20 points
    const nextTrust = Math.max(0, commercialTrust - 20);
    setCommercialTrust(nextTrust);
    localStorage.setItem('legendshub_commercial_trust', String(nextTrust));

    // Remove old sponsor
    team.sponsors = team.sponsors.filter(s => s.id !== oldSponsorToReplace.id);

    // Add new sponsor - BOTH signature bonus and first weekly inflow computed immediately
    team.budget += newSponsorToSign.signatureBonus + newSponsorToSign.incomePerWeek;

    team.sponsors.push({
      ...newSponsorToSign,
      activeWeeks: newSponsorToSign.termsInWeeks,
      isSigned: true
    });

    // Remove new sponsor from market
    updatedState.sponsorsMarket = updatedState.sponsorsMarket.filter(m => m.id !== newSponsorToSign.id);

    // Put old sponsor back into market
    const exists = updatedState.sponsorsMarket.some(m => m.id === oldSponsorToReplace.id);
    if (!exists) {
      updatedState.sponsorsMarket.push({
        ...oldSponsorToReplace,
        isSigned: false,
        activeWeeks: undefined
      });
    }

    // TRIGGERS FOR EMAILS
    // GATILHO A
    injectEmailIntoInbox(
      'Head de Marketing',
      'Diretor Comercial',
      'Alerta Crítico: Nossa reputação no mercado corporativo despencou',
      `Manager, a nossa recente instabilidade com parceiros comerciais afetou drasticamente nossa Confiabilidade Comercial (atualmente em ${nextTrust}%). O mercado está nos enxergando como uma organização instável. Se não estabilizarmos nossos contratos ativos, as próximas marcas de grande porte que analisarem nossa equipe vão exigir metas muito mais agressivas ou oferecerão bônus de assinatura reduzidos. Sugiro cautela nas próximas decisões.`,
      'Direção'
    );

    // GATILHO B
    const valorNovo = newSponsorToSign.incomePerWeek;
    const penalty = 3 * oldSponsorToReplace.incomePerWeek;
    const newTerm = newSponsorToSign.termsInWeeks || 12;
    const multaFracionada = penalty / newTerm;
    const comparisonVal = oldSponsorToReplace.incomePerWeek + multaFracionada;

    if (valorNovo > comparisonVal) {
      injectEmailIntoInbox(
        'Diretoria Executiva',
        'Conselho Executivo',
        'Feedback de Gestão: Excelente movimentação de mercado',
        `Prezado Manager, analisamos os termos da troca do slot corporativo. Embora a rescisão tenha gerado custos imediatos e uma leve turbulência na nossa confiabilidade, o novo aporte financeiro semanal de ${formatMoney(valorNovo)} compensa amplamente o movimento a médio prazo. Você conseguiu valorizar a nossa camisa. Bom trabalho.`,
        'Direção'
      );
    } else {
      injectEmailIntoInbox(
        'Diretoria Executiva',
        'Conselho Executivo',
        'Alerta de Gestão: Preocupação com os termos do novo patrocínio',
        `Manager, fomos notificados sobre a substituição de patrocinador e estamos seriamente preocupados. O valor do novo contrato (${formatMoney(valorNovo)}) não justifica a multa que pagamos e o desgaste desnecessário da nossa imagem pública. Foi um mau negócio financeiro que estrangula nossa margem de lucro semanal. Esperamos critérios mais rigorosos de sua parte nas próximas propostas.`,
        'Direção'
      );
    }

    // Save Game State
    if (onUpdateGameState) {
      onUpdateGameState(updatedState);
    }

    if (triggerNotification) {
      triggerNotification('🔄 Troca de Patrocinador', `Substituição efetuada! Sua caixa postal foi atualizada com relatórios de performance.`);
    }

    setActiveModal('NONE');
    setNewSponsorToSign(null);
    setOldSponsorToReplace(null);
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
      data_engine_log: gameState?.editorSyncStatusMessage || "[STATUS: ONLINE] [ENGINE: ACTIVE] Editor Payload Synced Successfully. 0 keys updated.",
      linguagem_ativa: activeLang.toUpperCase()
    };
  }, [playerTeam, masterSponsor, secondarySponsors, enrichedMarketProposals, activeLang, totalSponsorInflowCurrent, isHypeActive, gameState]);

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

  const isDark = theme !== 'light';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Status Bar */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-xl select-none border ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            {t.saldo_caixa}
          </p>
          <h3 className={`font-display text-2xl font-black tracking-tight ${isDark ? 'text-[#00FF88]' : 'text-emerald-600'}`}>
            {formatMoney(playerTeam.budget)}
          </h3>
        </div>
        <div className={`space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 ${isDark ? 'border-[#1e2d44]/60' : 'border-slate-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
            {t.inflow_semanal_patrocinio}
            {isHypeActive && <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#00FF88]' : 'text-amber-500'}`} />}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`font-display text-2xl font-black tracking-tight ${isDark ? 'text-[#00E5FF]' : 'text-cyan-600'}`}>
              + {formatMoney(totalSponsorInflowCurrent)}
            </h3>
            <span className={`text-[9px] font-mono font-bold uppercase ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>/ {langStored === 'en' ? 'wk' : 'sem'}</span>
          </div>
        </div>
        <div className={`space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 ${isDark ? 'border-[#1e2d44]/60' : 'border-slate-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            {activeLang === 'pt' ? 'Fãs Ativos' : t.metricas_de_fas}
          </p>
          <h3 className={`font-display text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeLang === 'pt' ? `Popularidade ${playerTeam.popularity}%` : `Popularity {playerTeam.popularity}%`}
          </h3>
        </div>
      </div>

      <div className="w-full space-y-6">
        
        {/* 2. SLOOTED ACTIVE SPONSORS VIEW (Occupies FULL width of the container!) */}
        <div className={`rounded-xl p-6 shadow-lg space-y-5 border ${isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-[#1e2d44]' : 'border-slate-100'}`}>
            <h4 className={`font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-[#00E5FF]' : 'text-cyan-700'}`}>
              <Award className="w-4 h-4" /> {t.titulo_ativos}
            </h4>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-black rounded uppercase ${
              isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SLOTS 4 / 4 OK
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Slot 1: Master Slot */}
            <div className={`rounded-xl p-4 border flex flex-col justify-between min-h-[220px] transition-all duration-300 relative overflow-hidden group ${
              masterSponsor 
                ? (isDark 
                    ? 'bg-[#0b1b34]/95 border-[#00E5FF]/40 hover:border-[#00E5FF]/80 shadow-[0_0_15px_-3px_rgba(0,229,255,0.15)]' 
                    : 'bg-cyan-50/65 border-cyan-200/80 hover:border-cyan-300 shadow-sm')
                : (isDark 
                    ? 'bg-[#070d19]/80 border-dashed border-[#1e2d44] hover:bg-[#081224]/80' 
                    : 'bg-slate-50/50 border-dashed border-slate-200 hover:bg-slate-50')
            }`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] px-1.5 py-0.5 font-mono font-black uppercase rounded tracking-wider border ${
                    isDark ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/10' : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                  }`}>
                    {t.slot_master}
                  </span>
                  {masterSponsor && <Sparkles className={`w-3.5 h-3.5 animate-bounce ${isDark ? 'text-[#00E5FF]' : 'text-cyan-600'}`} />}
                </div>

                {masterSponsor ? (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg border border-slate-700/10 dark:border-sky-500/15 overflow-hidden shrink-0 bg-transparent flex items-center justify-center p-0.5">
                        <img 
                          src={masterSponsor.logo_blob ? getImageUrl(masterSponsor.logo_blob) : getGameAssetUrl('sponsors', masterSponsor.id, 'assets/ui/fallback-sponsor.png')} 
                          alt="Sponsor Logo" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain bg-transparent"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'assets/ui/fallback-sponsor.png'; }}
                        />
                      </div>
                      <h5 className={`font-display text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{masterSponsor.name}</h5>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {t.meta_contratual}: <span className={`font-medium block mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{masterSponsor.objective}</span>
                      </p>
                      <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {t.termo_restante}: <span className={`block mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{masterSponsor.activeWeeks || masterSponsor.termsInWeeks} {t.semanas}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-[11px] leading-relaxed font-semibold italic mt-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                    {t.vazio_ativos}
                  </p>
                )}
              </div>

              {masterSponsor ? (
                <div className={`border-t pt-3 mt-4 space-y-2.5 ${isDark ? 'border-[#1e2d44]' : 'border-cyan-100'}`}>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t.saldo_caixa}</span>
                    <span className={`font-black ${isDark ? 'text-[#00FF88]' : 'text-emerald-600'}`}>+{formatMoney(Math.round(masterSponsor.incomePerWeek * hypeBonusMultiplier))} / sem</span>
                  </div>
                  <button
                    onClick={() => {
                      setSponsorToRescind(masterSponsor);
                      setActiveModal('RESCIND_CONFIRM');
                    }}
                    className={`w-full py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 ${
                      isDark 
                        ? 'bg-[#0e1726] hover:bg-[#ffebee]/10 text-rose-500 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30' 
                        : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 shadow-sm'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" /> {t.btn_rescindir}
                  </button>
                </div>
              ) : (
                <div className={`text-[9px] font-mono tracking-tight mt-6 uppercase ${isDark ? 'text-[#00E5FF]/70' : 'text-slate-400'}`}>
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
                    ? (isDark 
                        ? 'bg-[#0f172a]/95 border-emerald-500/20 hover:border-emerald-500/60 shadow-inner' 
                        : 'bg-emerald-58/60 border-emerald-200/80 hover:border-emerald-300 shadow-sm')
                    : (isDark 
                        ? 'bg-[#070d19]/80 border-dashed border-[#1e2d44] hover:bg-[#081224]/80' 
                        : 'bg-slate-50/50 border-dashed border-slate-200 hover:bg-slate-50')
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] px-1.5 py-0.5 font-mono font-extrabold uppercase rounded tracking-wider border ${
                        isDark ? 'bg-gray-800 text-gray-400 border-transparent' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {idx === 0 ? t.slot_sec_1 : idx === 1 ? t.slot_sec_2 : t.slot_sec_3}
                      </span>
                    </div>

                    {s ? (
                      <div className="space-y-3">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-lg border border-slate-700/10 dark:border-sky-500/15 overflow-hidden shrink-0 bg-transparent flex items-center justify-center p-0.5">
                            <img 
                              src={s.logo_blob ? getImageUrl(s.logo_blob) : getGameAssetUrl('sponsors', s.id, 'assets/ui/fallback-sponsor.png')} 
                              alt="Sponsor Logo" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain bg-transparent lg:max-h-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/ui/fallback-sponsor.png'; }}
                            />
                          </div>
                          <h5 className={`font-display text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</h5>
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {t.meta_contratual}: <span className={`block mt-0.5 font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.objective}</span>
                          </p>
                          <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {t.termo_restante}: <span className={`block mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.activeWeeks || s.termsInWeeks} {t.semanas}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-[11px] leading-relaxed font-semibold italic mt-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                        {t.vazio_ativos}
                      </p>
                    )}
                  </div>

                  {s ? (
                    <div className={`border-t pt-3 mt-4 space-y-2.5 ${isDark ? 'border-[#1e2d44]' : 'border-emerald-100'}`}>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t.saldo_caixa}</span>
                        <span className={`font-black ${isDark ? 'text-[#00FF88]' : 'text-emerald-700'}`}>+{formatMoney(Math.round(s.incomePerWeek * hypeBonusMultiplier))} / sem</span>
                      </div>
                      <button
                        onClick={() => {
                          setSponsorToRescind(s);
                          setActiveModal('RESCIND_CONFIRM');
                        }}
                        className={`w-full py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 ${
                          isDark 
                            ? 'bg-[#0e1726] hover:bg-[#ffebee]/10 text-rose-500 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30' 
                            : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 shadow-sm'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" /> {t.btn_rescindir}
                      </button>
                    </div>
                  ) : (
                    <div className={`text-[9px] font-mono tracking-tight mt-6 uppercase font-bold ${isDark ? 'text-[#00FF88]/40' : 'text-slate-400'}`}>
                      {t.vazio}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* 3. OPEN MARKET SPONSOR PROPOSALS LIST */}
        <div className={`rounded-xl p-6 shadow-lg space-y-5 border ${isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-[#1e2d44]' : 'border-slate-100'}`}>
            <h4 className={`font-display text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.titulo_propostas}
            </h4>
            <div className={`text-[9.5px] font-mono font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> {activeLang === 'pt' ? 'Popularidade Atual:' : 'Current Popularity:'} <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{playerTeam.popularity}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedMarketProposals.length > 0 ? (
              enrichedMarketProposals.map(s => {
                const popularityCheck = playerTeam.popularity >= s.minPopularity;
                const isMasterSpon = getSponsorClass(s) === 'MASTER';
                
                return (
                  <div key={s.id} className={`relative rounded-xl p-5 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4 border ${
                    isDark ? 'bg-[#070d19] border-[#1e2d44] hover:border-slate-700' : 'bg-white border-slate-200 hover:shadow-md'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-slate-700/10 dark:border-sky-500/15 overflow-hidden shrink-0 bg-transparent flex items-center justify-center p-0.5">
                            <img 
                              src={s.logo_blob ? getImageUrl(s.logo_blob) : getGameAssetUrl('sponsors', s.id, 'assets/ui/fallback-sponsor.png')} 
                              alt="Sponsor Logo" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain bg-transparent"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/ui/fallback-sponsor.png'; }}
                            />
                          </div>
                          <div>
                            <h5 className={`font-display text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</h5>
                            <span className={`text-[8px] px-1.5 py-0.5 font-mono font-black uppercase rounded tracking-wider border inline-block mt-0.5 ${
                              isMasterSpon 
                                ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                              {isMasterSpon ? 'MASTER' : 'SECONDARY'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-1 bg-rose-500/10 dark:bg-rose-950/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                          🛡️ {t.vence_em}: {s.validityWeeks || 2}w
                        </span>
                      </div>

                      <div className={`grid grid-cols-2 gap-2 text-[10.5px] border-y py-3 ${isDark ? 'border-[#1e2d44]/50' : 'border-slate-100'}`}>
                        <div>
                          <p className={`font-extrabold uppercase text-[9px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t.bonus_assinatura}</p>
                          <p className={`font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatMoney(s.signatureBonus)}</p>
                        </div>
                        <div>
                          <p className={`font-extrabold uppercase text-[9px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t.saldo_caixa}</p>
                          <p className={`font-black mt-0.5 ${isDark ? 'text-[#00FF88]' : 'text-emerald-600'}`}>+{formatMoney(s.incomePerWeek)}/sem</p>
                        </div>
                        <div className="col-span-2">
                          <p className={`font-extrabold uppercase text-[9px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t.meta_exigida}</p>
                          <p className={`mt-0.5 font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{s.objective}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-[9.5px]">
                        <p className={`font-bold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          {t.requisitos_minimos}: <strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>{s.minPopularity}% {t.fãs}</strong>
                        </p>
                        <p className={isDark ? 'text-gray-500' : 'text-slate-400'}>Term: {s.termsInWeeks} {t.semanas}</p>
                      </div>
                      
                      <button
                        onClick={() => executeSignSponsor(s.id)}
                        disabled={!popularityCheck}
                        className={`px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                          popularityCheck 
                            ? (isDark 
                                ? 'bg-[#00E5FF] text-black hover:bg-[#33ebff] active:scale-95 shadow-md shadow-[#00E5FF]/10' 
                                : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95 shadow-sm')
                            : 'bg-gray-800 dark:bg-slate-800 text-gray-500 cursor-not-allowed border border-gray-700 dark:border-slate-700'
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
          
          <div className={`border rounded-xl p-5 space-y-3 shadow-md ${isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h5 className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 select-none ${isDark ? 'text-[#00E5FF]' : 'text-cyan-600'}`}>
              <Percent className="w-4 h-4" /> Nível de Confiabilidade Comercial
            </h5>
            <div className="flex justify-between items-center font-mono text-xs font-black select-none mt-1">
              <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                STATUS: {commercialTrust >= 80 ? t.status_excelente : commercialTrust >= 50 ? t.status_bom : t.status_regular}
              </span>
              <span className={isDark ? 'text-[#00FF88]' : 'text-emerald-600'}>{commercialTrust}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00E5FF] rounded-full" style={{ width: `${commercialTrust}%` }} />
            </div>
            <p className={`text-[10.5px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              {t.confiabilidade_desc}
            </p>
          </div>

          <div className={`border rounded-xl p-5 space-y-3 shadow-md transition-all duration-300 ${
            isHypeActive 
              ? (isDark 
                  ? 'bg-[#082025]/30 border-[#00E5FF]/20 shadow-[0_0_15px_-4px_rgba(0,229,255,0.1)]' 
                  : 'bg-[#f0fdf4] border-[#bbf7d0] shadow-sm')
              : (isDark 
                  ? 'bg-[#0a1424] border-[#1e2d44]' 
                  : 'bg-white border-slate-200 shadow-sm')
          }`}>
            <h5 className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 select-none ${isDark ? 'text-[#00E5FF]' : 'text-cyan-600'}`}>
              <Zap className="w-4 h-4 fill-current text-amber-400 animate-bounce" /> {t.clausula_hype_performance}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                isHypeActive 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {isHypeActive ? 'ACTIVE (+10%)' : 'INACTIVE'}
              </span>
              <span className={isDark ? 'text-gray-400 font-mono text-xs font-bold' : 'text-slate-500 font-mono text-xs font-bold'}>Streak: {playerTeam.streak || '-'}</span>
            </div>
            <p className={`text-[10.5px] leading-relaxed font-semibold ${
              isHypeActive 
                ? (isDark ? 'text-[#00E5FF]' : 'text-[#166534]')
                : (isDark ? 'text-gray-400' : 'text-slate-500')
            }`}>
              {isHypeActive ? t.clausula_hype_desc_active : t.clausula_hype_desc_inactive}
            </p>
          </div>

        </div>

      </div>

      {/* --- CONFIRMATION AND SUBSTITUTION MODALS STACK --- */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scale-up">
            
            {activeModal === 'RESCIND_CONFIRM' && sponsorToRescind && (
              <>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Quebra de Vínculo Contratual</h3>
                  <p className="text-xs text-slate-400">Você está rescindindo precocemente o patrocinador <strong className="text-white">{sponsorToRescind.name}</strong>.</p>
                </div>
                
                <div className="bg-slate-950/70 p-4 rounded-xl border border-rose-500/25 space-y-3.5">
                  <h4 className="text-[10.5px] font-bold uppercase text-rose-400 tracking-wide">Cláusulas de Penalidade:</h4>
                  <ul className="text-xs text-slate-300 space-y-2 font-medium">
                    <li className="flex justify-between">
                      <span>• Multa Financeira de Rescisão:</span>
                      <strong className="text-rose-400">{formatMoney(sponsorToRescind.incomePerWeek * 3)}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>• Recuo de Popularidade Org:</span>
                      <strong className="text-rose-400">- {Math.max(5, Math.min(15, Math.round(((sponsorToRescind.activeWeeks || sponsorToRescind.termsInWeeks) / sponsorToRescind.termsInWeeks) * 15)))}%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>• Confiabilidade Comercial:</span>
                      <strong className="text-rose-400">- 20 Pontos</strong>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setActiveModal('NONE');
                      setSponsorToRescind(null);
                    }}
                    className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={confirmRescindSponsor}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                  >
                    Rescindir
                  </button>
                </div>
              </>
            )}

            {activeModal === 'SWAP_SELECT' && newSponsorToSign && (
              <>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Slots de Patrocínio Cheios</h3>
                  <p className="text-xs text-slate-400">Você já conta com os 3 slots corporativos secundários preenchidos. Escolha qual deles você deseja substituir (Troca Direta):</p>
                </div>
                
                <div className="space-y-2">
                  {secondarySponsors.map((act, index) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        setOldSponsorToReplace(act);
                        setActiveModal('SWAP_CONFIRM');
                      }}
                      className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-black text-white uppercase">{act.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Inflow Semanal: {formatMoney(act.incomePerWeek)}</p>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono font-extrabold uppercase group-hover:translate-x-1 transition-transform">Substituir →</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setActiveModal('NONE');
                      setNewSponsorToSign(null);
                    }}
                    className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {activeModal === 'SWAP_CONFIRM' && newSponsorToSign && oldSponsorToReplace && (
              <>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Confirmação de Troca Direta</h3>
                  <p className="text-xs text-slate-400">Você está descontinuando o patrocínio de <strong className="text-rose-400">{oldSponsorToReplace.name}</strong> para assinar com <strong className="text-emerald-400">{newSponsorToSign.name}</strong>.</p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 space-y-3.5">
                  <h4 className="text-[10.5px] font-bold uppercase text-rose-400 tracking-wide">Encargos de Quebra e Troca:</h4>
                  <ul className="text-xs text-slate-300 space-y-2 font-medium border-b border-slate-800 pb-3">
                    <li className="flex justify-between">
                      <span>• Multa de Quebra (3x antigo inflow):</span>
                      <strong className="text-rose-400">{formatMoney(oldSponsorToReplace.incomePerWeek * 3)}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>• Queda de Popularidade:</span>
                      <strong className="text-rose-400">- {Math.max(5, Math.min(15, Math.round(((oldSponsorToReplace.activeWeeks || oldSponsorToReplace.termsInWeeks) / oldSponsorToReplace.termsInWeeks) * 15)))}%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>• Redução Reputação Comercial:</span>
                      <strong className="text-rose-400">- 20 Pts</strong>
                    </li>
                  </ul>
                  
                  <h4 className="text-[10.5px] font-bold uppercase text-emerald-400 tracking-wide">Retorno Imediato Estimado:</h4>
                  <ul className="text-xs text-slate-300 space-y-2 font-medium">
                    <li className="flex justify-between">
                      <span>• Luvas + 1º Inflow (Creditado Agora):</span>
                      <strong className="text-emerald-400">+{formatMoney(newSponsorToSign.signatureBonus + newSponsorToSign.incomePerWeek)}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>• Novo Inflow Semanal Corrente:</span>
                      <strong className="text-emerald-400">+{formatMoney(newSponsorToSign.incomePerWeek)}/sem</strong>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (getSponsorClass(newSponsorToSign) === 'SECUNDARIO') {
                        setActiveModal('SWAP_SELECT');
                      } else {
                        setActiveModal('NONE');
                        setNewSponsorToSign(null);
                        setOldSponsorToReplace(null);
                      }
                    }}
                    className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={confirmSponsorSwap}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
                  >
                    Confirmar Troca
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

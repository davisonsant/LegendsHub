/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Tv, Heart, Keyboard, Users, ShieldAlert, Globe, 
  MapPin, DollarSign, Calendar, Check, Play, UserMinus, Plus,
  Sparkles, Award, FileText, X, AlertCircle, Terminal, Copy, RefreshCw
} from 'lucide-react';
import { GameState, Team, Player, Staff } from '../types';
import { getOrCreateWeekFeedState, RssFeedX, MarqueeNews } from '../utils/feedHelper';

interface GamingOfficeTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  theme?: 'light' | 'dark';
}

// 2. Staff Roster schema
export interface CorporationStaff {
  id: string;
  nome: string;
  cargo: string;
  salario_semanal: number;
  semanas_contrato: number;
  nivel_eficiencia: number; // 0 a 100
  patrocinio_bonus?: number; // ex: 0.15
}

// 4. TV Rights slots schema
export interface TvRightsSlot {
  id: string;
  status: 'OCUPADO' | 'VAGO';
  emissora?: string;
  vigencia_restante?: number; // semanas
  repasse_semanal?: number;
  meta_contratual?: string;
  multa_rescisao?: number;
}

const INITIAL_STAFF_EMPLOYEES: CorporationStaff[] = [
  {
    id: 'emp-1',
    nome: 'Maurício "Spacca" Ramos',
    cargo: 'Head Coach',
    salario_semanal: 3500,
    semanas_contrato: 12,
    nivel_eficiencia: 85,
    patrocinio_bonus: 0.05
  },
  {
    id: 'emp-2',
    nome: 'Ana Lívia Santos',
    cargo: 'Gerente de Marketing',
    salario_semanal: 2800,
    semanas_contrato: 24,
    nivel_eficiencia: 90,
    patrocinio_bonus: 0.15
  },
  {
    id: 'emp-3',
    nome: 'Dr. Roberto de Souza',
    cargo: 'Psicólogo de Linha',
    salario_semanal: 2500,
    semanas_contrato: 8,
    nivel_eficiencia: 78
  }
];

const JOB_MARKET_POOL: CorporationStaff[] = [
  { id: 'job-1', nome: 'Felipe "YoDa" Noronha', cargo: 'Analista de Macro', salario_semanal: 3200, semanas_contrato: 16, nivel_eficiencia: 88, patrocinio_bonus: 0.1 },
  { id: 'job-2', nome: 'Sulamita Vieira', cargo: 'Fisioterapeuta Postural', salario_semanal: 2200, semanas_contrato: 20, nivel_eficiencia: 82 },
  { id: 'job-3', nome: 'Gabriel "Kami" Bohm', cargo: 'Gerente de Conteúdo', salario_semanal: 4000, semanas_contrato: 30, nivel_eficiencia: 94, patrocinio_bonus: 0.2 },
  { id: 'job-4', nome: 'Juliana Paes', cargo: 'Relações Públicas / PR', salario_semanal: 2600, semanas_contrato: 12, nivel_eficiencia: 80, patrocinio_bonus: 0.08 }
];

const OFFERS_TV_POOL = [
  { emissora: 'CBLOL TV Premium', repasse_semanal: 8500, meta: 'Ficar no Top 4 do campeonato', multa: 25000, vigencia: 10 },
  { emissora: 'Riot Network BR', repasse_semanal: 12000, meta: 'Ser o campeão do Split', multa: 40000, vigencia: 14 },
  { emissora: 'Twitch Play-In Broadcast', repasse_semanal: 5000, meta: 'Garantir no mínimo 5 vitórias', multa: 15000, vigencia: 8 },
  { emissora: 'Esports Brasil HD', repasse_semanal: 7000, meta: 'Vencer a rodada de Supersemana', multa: 20000, vigencia: 12 }
];

const TRANSLATIONS = {
  pt: {
    cabecalho: {
      titulo: "GAMING OFFICE E CENTRAL DE MÍDIA",
      subtitulo: "Gerencie a infraestrutura corporativa avançada, contratos de transmissão e monitore o fluxo de notícias globais da liga.",
    },
    infra: "Infraestrutura Operacional Avançada",
    staff: "Listagem Corporativa de Staff",
    contratar: "Contratar Novo Funcionário",
    tv: "Direitos de TV & Transmissão (Slots Comerciais)",
    bootcamp: "Painel Organizador de Bootcamp Internacional",
    saldo: "Saldo Monetário",
    max: "Melhoria Total Atingida",
    upgrade: "UPGRADE",
    eficiencia: "Eficiência Operacional",
    contrato: "Vigência Contrato",
    custo: "Custo Folha",
    ativoComercial: "ATIVO COMERCIALMENTE",
    repasse: "Repasse Semanal",
    duracao: "Duração Contratual",
    metas: "Metas/Patrocínio",
    rescindir: "Rescindir",
    vago: "SLOT EMISSORA VAGO",
    receberPropostas: "Disponibilize para receber e analisar propostas lucrativas baseadas na torcida.",
    avaliarPropostas: "Avaliar Propostas Comerciais",
    convocacaoPrincipal: "Convocação: Line-up Principal",
    convocacaoAcademy: "Convocação: Academy / Base",
    nenhumAcademy: "Nenhum atleta na academia de base CBLOL.",
    configRoteiro: "Configurador de Roteiro de Viagem",
    destinoInternacional: "Destino Internacional",
    duracaoEstadia: "Duração da Estadia",
    estadiaEm: "Estada em",
    atletasConvocados: "Atletas Convocados",
    diasTotais: "Dias Totais",
    taxativo: "Taxativo da Passagem",
    iniciarViagem: "Iniciar Viagem de Bootcamp Internacional",
    centralNoticias: "SALA DE IMPRENSA (PORTAL DE NOTÍCIAS)",
    feedComunidade: "REDE SOCIAL: FEED DO X (TWITTER)",
    noticiasLoop: "Rolagem Vertical em Loop Infinito",
    feedLoop: "Rolagem Vertical Contínua",
    impactoPos: "Impacto: Positivo",
    impactoNeg: "Impacto: Negativo",
    engineConsole: "CONSOLE DE MOTOR DE DATOS DO GAMING OFFICE (JSON REAL-TIME)",
    engineStatus: "Status do Motor: ATIVO",
    rodarComando: "Simular Comando do Motor",
    cmdAbrir: "Abrir Gaming Office",
    cmdAtualizar: "Atualizar Notícias da Semana",
    copiarJson: "Copiar JSON do Motor",
    copiado: "Copiado!",
    explicacaoEngine: "Este console expõe as respostas JSON estruturadas retornadas em tempo real pelo motor de mídia para a UI.",
    upgrades: {
      marketing: {
        name: "Escritório de Marketing",
        desc: "Desenvolve campanhas publicitárias de alto engajamento. Aumenta a popularidade da torcida e o apoio global semanal.",
        benefit: "+15% Popularidade de Torcida Semanal"
      },
      juridico: {
        name: "Departamento Jurídico",
        desc: "Garante amparo integral nos contratos comerciais. Reduz multas rescisórias de transmissões de TV e patrocinadores.",
        benefit: "Economia e amparo nas multas jurídicas de TV"
      },
      recursos_humanos: {
        name: "Setor de Recursos Humanos (RH)",
        desc: "Gerencia talentos da organização de eSports, reduzindo tributos internos de contratação e custos trabalhistas.",
        benefit: "+10% Eficiência de Staff e desconto monetário por nível"
      }
    }
  },
  en: {
    cabecalho: {
      titulo: "GAMING OFFICE AND MEDIA HEADQUARTERS",
      subtitulo: "Manage advanced corporate infrastructure, broadcast contracts, and monitor global league news feeds.",
    },
    infra: "Advanced Operational Infrastructure",
    staff: "Corporate Staff Roster",
    contratar: "Hire New Employee",
    tv: "TV & Broadcast Rights (Commercial Slots)",
    bootcamp: "International Bootcamp Panel",
    saldo: "Financial Balance",
    max: "Maximum Upgrade Reached",
    upgrade: "UPGRADE",
    eficiencia: "Operational Efficiency",
    contrato: "Contract Duration",
    custo: "Payroll Cost",
    ativoComercial: "COMMERCIALLY ACTIVE",
    repasse: "Weekly Fee",
    duracao: "Contract Duration",
    metas: "Sponsorship Goals",
    rescindir: "Terminate",
    vago: "BROADCASTER SLOT VACANT",
    receberPropostas: "Enable slot to receive and analyze lucrative sponsorship proposals.",
    avaliarPropostas: "Review Commercial Offers",
    convocacaoPrincipal: "Roster: Main Line-up",
    convocacaoAcademy: "Roster: Academy / Base",
    nenhumAcademy: "No players in the Academy team list.",
    configRoteiro: "Travel Itinerary Builder",
    destinoInternacional: "International Destination",
    duracaoEstadia: "Stay Duration",
    estadiaEm: "Stay at",
    atletasConvocados: "Called Players",
    diasTotais: "Total Days",
    taxativo: "Expected Ticket Fee",
    iniciarViagem: "Begin International Bootcamp Journey",
    centralNoticias: "PRESS ROOM (NEWS PORTAL)",
    feedComunidade: "SOCIAL NETWORKS: FEED X (TWITTER)",
    noticiasLoop: "Infinite Loop Vertical Scrolling",
    feedLoop: "Continuous Vertical Scrolling",
    impactoPos: "Impact: Positive",
    impactoNeg: "Impact: Negative",
    engineConsole: "GAMING OFFICE DATA ENGINE CONSOLE (REAL-TIME JSON)",
    engineStatus: "Engine Status: ACTIVE",
    rodarComando: "Simulate Engine Action",
    cmdAbrir: "Open Gaming Office",
    cmdAtualizar: "Update Weekly News",
    copiarJson: "Copy Engine JSON",
    copiado: "Copied!",
    explicacaoEngine: "This console exposes the structured JSON responses returned in real-time by the media engine to the game's UI.",
    upgrades: {
      marketing: {
        name: "Marketing Office",
        desc: "Develops premium advertising campaigns. Amplifies fanbase support and global weekly popularity stats.",
        benefit: "+15% Weekly Fan Base Popularity Growth"
      },
      juridico: {
        name: "Legal Department",
        desc: "Ensures legal safety. Reduces contract termination penalties and handles corporate television pacts.",
        benefit: "Slashes TV and sponsor contract penalties"
      },
      recursos_humanos: {
        name: "Human Resources Department (HR)",
        desc: "Talent and workspace management. Direct savings on staff payroll tax and weekly specialist overheads.",
        benefit: "+10% Efficiency & staff operational discount per level"
      }
    }
  },
  es: {
    cabecalho: {
      titulo: "GAMING OFFICE Y CENTRAL DE MEDIOS",
      subtitulo: "Gestione la infraestructura corporativa avanzada, los contratos de transmisión y supervise el flujo de noticias de la liga mundial.",
    },
    infra: "Infraestructura Operativa Avanzada",
    staff: "Plantilla Corporativa de Staff",
    contratar: "Contratar Nuevo Empleado",
    tv: "Derechos de TV y Transmisión (Slots Comerciales)",
    bootcamp: "Panel Organizador de Bootcamp Internacional",
    saldo: "Saldo Monetario",
    max: "Mejora Máxima Alcanzada",
    upgrade: "MEJORAR",
    eficiencia: "Eficiencia Operativa",
    contrato: "Vigencia del Contrato",
    custo: "Costo de Nómina",
    ativoComercial: "ACTIVO COMERCIALMENTE",
    repasse: "Pago Semanal",
    duracao: "Duración de Contrato",
    metas: "Objetivos de Patrocinio",
    rescindir: "Rescindir",
    vago: "SLOT EMISORA VACANTE",
    receberPropostas: "Habilite este slot para recibir y analizar lucrativas ofertas comerciales de patrocinio.",
    avaliarPropostas: "Evaluar Ofertas Comerciales",
    convocacaoPrincipal: "Convocatoria: Alineación Principal",
    convocacaoAcademy: "Convocatoria: Academia / Juvenil",
    nenhumAcademy: "No hay jugadores en la plantilla de la academia.",
    configRoteiro: "Planificador de Itinerario de Viaje",
    destinoInternacional: "Destino Internacional",
    duracaoEstadia: "Duración de Estancia",
    estadiaEm: "Estancia en",
    atletasConvocados: "Jugadores Convocados",
    diasTotais: "Días Totales",
    taxativo: "Tarifa Estimulada de Pasaje",
    iniciarViagem: "Iniciar Viaje de Bootcamp Internacional",
    centralNoticias: "SALA DE PRENSA (PORTAL DE NOTÍCIAS)",
    feedComunidade: "RED SOCIAL: FEED DE X (TWITTER)",
    noticiasLoop: "Desplazamiento Vertical en Bucle Infinito",
    feedLoop: "Desplazamiento Vertical Continuo",
    impactoPos: "Impacto: Positivo",
    impactoNeg: "Impacto: Negativo",
    engineConsole: "CONSOLA DEL MOTOR DE DATOS DEL GAMING OFFICE (JSON EN TIEMPO REAL)",
    engineStatus: "Estado del Motor: ACTIVO",
    rodarComando: "Simular Acción del Motor",
    cmdAbrir: "Abrir Gaming Office",
    cmdAtualizar: "Actualizar Noticias Semanales",
    copiarJson: "Copiar JSON del Motor",
    copiado: "¡Copiado!",
    explicacaoEngine: "Esta consola expone las respuestas de JSON estructurado devueltas por el motor de medios de comunicación en tiempo real.",
    upgrades: {
      marketing: {
        name: "Oficina de Marketing",
        desc: "Desarrolla campañas publicitarias premium. Aumenta el apoyo del público y la popularidad semanal global.",
        benefit: "+15% Popularidad de Afición Semanal"
      },
      juridico: {
        name: "Departamento Jurídico",
        desc: "Garantiza seguridad legal integral. Reduce las multas de rescisión televisiva y contratos de la liga.",
        benefit: "Ahorro en multas de contratos televisivos o marcas"
      },
      recursos_humanos: {
        name: "Sector de Recursos Humanos (RRHH)",
        desc: "Gestiona el ambiente y los talentos de la sede. Reduce gastos y impuestos laborales del elenco operativo.",
        benefit: "+10% Eficiencia y descuento salarial de staff por nivel"
      }
    }
  }
};

const NEWS_LIST_TEMPLATE = {
  pt: [
    { id: 'news-1', portal_nome: 'Mais Esports', manchete_texto: 'Rumores apontam Faker vindo fazer bootcamp no Brasil com a T1. Torcida vai à loucura!', tempo_passado: '5m atrás', impacto_reputacao: 'positivo' },
    { id: 'news-2', portal_nome: 'Dot Esports', manchete_texto: 'Caps estaria avaliando propostas da LCS para a próxima temporada de eSports. Fim da era G2?', tempo_passado: '20m atrás', impacto_reputacao: 'negativo' },
    { id: 'news-3', portal_nome: 'Draft5', manchete_texto: 'Análise de Draft do Manager aponta estratégias de equipe em alta sintonia com o meta do jogo.', tempo_passado: '1h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-4', portal_nome: 'GE Globo', manchete_texto: 'Entrevista exclusiva: CEO do clube revela grandes expansões na infraestrutura e novo marketing.', tempo_passado: '2h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-5', portal_nome: 'Esports Insider', manchete_texto: 'Valores de direitos de TV de eSports disparam 15% após novas rodadas de acordos na liga.', tempo_passado: '4h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-6', portal_nome: 'Basement eSports', manchete_texto: 'Estrela da rota central do time rival foi avistado treinando de madrugada. Preparação extrema!', tempo_passado: '6h atrás', impacto_reputacao: 'negativo' },
    { id: 'news-7', portal_nome: 'ESPN', manchete_texto: 'Investidores globais elogiam a transparência operacional e novos departamentos da organização.', tempo_passado: '9h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-8', portal_nome: 'Riot eSports', manchete_texto: 'Riot Games oficializa novo regulamento para bootcamps internacionais na Ásia: visto facilitado!', tempo_passado: '12h atrás', impacto_reputacao: 'positivo' }
  ],
  en: [
    { id: 'news-1', portal_nome: 'Dot Esports', manchete_texto: 'Rumors hint Faker might hold an off-season bootcamp with T1 in South America. Fans thrilled!', tempo_passado: '5m ago', impacto_reputacao: 'positivo' },
    { id: 'news-2', portal_nome: 'Esports Heaven', manchete_texto: 'Caps is reportedly evaluating lucrative LCS contracts for the upcoming year. G2 era ending?', tempo_passado: '20m ago', impacto_reputacao: 'negativo' },
    { id: 'news-3', portal_nome: 'Medium Esports', manchete_texto: "Manager's advanced draft analysis showcases a flawless high-tier synergy with the current patch.", tempo_passado: '1h ago', impacto_reputacao: 'positivo' },
    { id: 'news-4', portal_nome: 'Esports Insider', manchete_texto: 'Exclusive interview: Manager CEO details massive physical facility upgrades and active marketing.', tempo_passado: '2h ago', impacto_reputacao: 'positivo' },
    { id: 'news-5', portal_nome: 'TV Media Daily', manchete_texto: 'Broadcasting rights overall values jump 15% globally following strategic sponsor negotiations.', tempo_passado: '4h ago', impacto_reputacao: 'positivo' },
    { id: 'news-6', portal_nome: 'Lolesports Web', manchete_texto: 'Rival midlaner spotted practicing soloQ late-night. Intense play-offs preparations underway.', tempo_passado: '6h ago', impacto_reputacao: 'negativo' },
    { id: 'news-7', portal_nome: 'Global Esports', manchete_texto: "Financial analysts congratulate the transparency of Manager's corporate departments.", tempo_passado: '9h ago', impacto_reputacao: 'positivo' },
    { id: 'news-8', portal_nome: 'Riot Media', tempo_passado: '12h ago', manchete_texto: 'Riot Games officially approves new ruleset for international bootcamps: expedited visa process!', impacto_reputacao: 'positivo' }
  ],
  es: [
    { id: 'news-1', portal_nome: 'Esportmaníacos', manchete_texto: 'Los rumores indican que Faker viajaría para entrenar en servidor latino con T1. ¡Furor en redes!', tempo_passado: '5m atrás', impacto_reputacao: 'positivo' },
    { id: 'news-2', portal_nome: 'Marca Gaming', manchete_texto: 'Caps estaría evaluando ofertas de la LCS para la próxima copa. ¿Termina la era en G2?', tempo_passado: '20m atrás', impacto_reputacao: 'negativo' },
    { id: 'news-3', portal_nome: 'El Hype', manchete_texto: 'Estudio estratégico de los drafts del manager muestra un acoplamiento perfecto con el último parche.', tempo_passado: '1h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-4', portal_nome: 'Esports Bureau', manchete_texto: 'Entrevista exclusiva: el CEO del club detalla ambiciosos planes de remodelamiento y oficinas operativas.', tempo_passado: '2h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-5', portal_nome: 'Mundo Deportivo', manchete_texto: 'Los derechos de televisación de deportes electrónicos crecen un 15% por el interés de las marcas.', tempo_passado: '4h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-6', portal_nome: 'Esports Latam', manchete_texto: 'La estrella de carril central del rival es visto practicando SoloQ de madrugada. ¡Régimen salvaje!', tempo_passado: '6h atrás', impacto_reputacao: 'negativo' },
    { id: 'news-7', portal_nome: 'Forbes Esports', manchete_texto: 'Analistas elogian los controles monetarios internos y el orden fiscal del club en la liga global.', tempo_passado: '9h atrás', impacto_reputacao: 'positivo' },
    { id: 'news-8', portal_nome: 'Riot Esports', manchete_texto: 'Riot Games formaliza la nueva reglamentación de visas para viajes de Bootcamp internacionales.', tempo_passado: '12h atrás', impacto_reputacao: 'positivo' }
  ]
};

const TWEETS_LIST_TEMPLATE = (playerTeamAcronym: string) => ({
  pt: [
    { id: 'tw-1', username: 'Lucas Silva', handle: 'lucas_lolesports', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', content: `Espera aí, os novos computadores do gaming office do time @${playerTeamAcronym || 'TEAM'} são uma nave! Quero ver segurar esse draft agora!`, likes: 142, retweets: 24 },
    { id: 'tw-2', username: 'Rafaela Costa', handle: 'rafalol', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', content: `O novo departamento jurídico do @${playerTeamAcronym || 'TEAM'} economizou uma fortuna cancelando aquele contrato de TV abusivo. Excelente governança corporativa!`, likes: 98, retweets: 12 },
    { id: 'tw-3', username: 'Gustavo Santos', handle: 'guste_lol', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', content: `Se o marketing do @${playerTeamAcronym || 'TEAM'} continuar fazendo esses vídeos de bastidores, eu vou assinar o plano premium de fã ainda hoje!`, likes: 211, retweets: 47 },
    { id: 'tw-4', username: 'Pedro MonoYasuo', handle: 'yasuo_wind', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', content: `Acabei de ver @${playerTeamAcronym || 'TEAM'} convocando a galera pro bootcamp na Coreia. O overall e a mecânica deles vão disparar!`, likes: 64, retweets: 8 },
    { id: 'tw-5', username: 'Catarina Mendes', handle: 'catmendes_esports', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80', content: `O cenário profissionalizou num ponto absurdo. Escritórios de marketing, psicologia, RH... Antigamente era só lan house improvisada.`, likes: 310, retweets: 89 },
    { id: 'tw-6', username: 'Matheus Prado', handle: 'math_analyst', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80', content: `A saúde financeira do @${playerTeamAcronym || 'TEAM'} está impecável sob esta gestão. Sem dívidas absurdas e com investimentos ativos.`, likes: 175, retweets: 33 }
  ],
  en: [
    { id: 'tw-1', username: 'John Doe', handle: 'john_esports', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', content: `Hold on, @${playerTeamAcronym || 'TEAM'}'s new gaming office computers are a beast! Fiber-dedicated high tiers. Can't wait!`, likes: 142, retweets: 24 },
    { id: 'tw-2', username: 'Sarah Connor', handle: 'sarah_scout', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', content: `Their corporate legal desk literally saved them a fortune in broadcast penalty terminations. Pure business class!`, likes: 98, retweets: 12 },
    { id: 'tw-3', username: 'Ryan Gos', handle: 'ryan_mkt', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', content: `If @${playerTeamAcronym || 'TEAM'}'s marketing office continues producing these mini-documents, I'm buying the elite fan token soon.`, likes: 211, retweets: 47 },
    { id: 'tw-4', username: 'Wind Yasuo', handle: 'yasuo_99', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', content: `Just saw that @${playerTeamAcronym || 'TEAM'} sent the starting line on a flight to Seoul for a focused bootcamp. Dynamic improvement incoming!`, likes: 64, retweets: 8 },
    { id: 'tw-5', username: 'Elena Gilbert', handle: 'elena_lol', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80', content: `Professional league standards are skyrocketing. HR setups, legal departments, psychological coaches... Superb evolution, fellas!`, likes: 310, retweets: 89 },
    { id: 'tw-6', username: 'Ben Affleck', handle: 'ben_biz', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80', content: `Budgetary discipline at @${playerTeamAcronym || 'TEAM'} is so polished. Strong sponsorship, low overheads, top-notch staff results.`, likes: 175, retweets: 33 }
  ],
  es: [
    { id: 'tw-1', username: 'Carlos Ruiz', handle: 'carlos_esports', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', content: `¡Caramba, las nuevas computadoras de la gaming office de @${playerTeamAcronym || 'TEAM'} son brutales! 0 ping en fibra óptica garantizada.`, likes: 142, retweets: 24 },
    { id: 'tw-2', username: 'Marta Díaz', handle: 'marta_esports', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', content: `El departamento legal de @${playerTeamAcronym || 'TEAM'} evitó pagar miles de dólares en multas por la rescisión de contrato televisivo. ¡Increíble!`, likes: 98, retweets: 12 },
    { id: 'tw-3', username: 'Javier Soler', handle: 'javi_marketing', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', content: `Si la Oficina de Marketing de @${playerTeamAcronym || 'TEAM'} sigue produciendo estos espectaculares documentales, renuevo mi pase hoy mismo.`, likes: 211, retweets: 47 },
    { id: 'tw-4', username: 'Aitor Yasuo', handle: 'yasuo_viento', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', content: `Acabo de ver que @${playerTeamAcronym || 'TEAM'} convocó a la academia para el bootcamp intensivo en Madrid. Una apuesta fenomenal.`, likes: 64, retweets: 8 },
    { id: 'tw-5', username: 'Sofía Vergara', handle: 'sofia_gamer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80', content: `La escena de eSports ha madurado tanto. Oficinas reales, RRHH, contratos bien formados. Hermoso de ver.`, likes: 310, retweets: 89 },
    { id: 'tw-6', username: 'Alejandro Sanz', handle: 'sanz_manager', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80', content: `La estructura financiera que tiene @${playerTeamAcronym || 'TEAM'} es impecable. El control de sueldos y la solvencia son ejemplares.`, likes: 175, retweets: 33 }
  ]
});

export default function GamingOfficeTab({
  gameState,
  onUpdateGameState,
  triggerNotification,
  theme = 'light'
}: GamingOfficeTabProps) {
  const isDark = theme === 'dark';
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  // State to track language dynamically
  const [lang, setLang] = useState<'pt' | 'es' | 'en'>(() => {
    const saved = localStorage.getItem('legendshub_lang');
    if (saved === 'es' || saved === 'en' || saved === 'pt') {
      return saved;
    }
    return 'pt';
  });

  // Keep synced with changes to localStorage language
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('legendshub_lang');
      if (saved && saved !== lang && (saved === 'pt' || saved === 'en' || saved === 'es')) {
        setLang(saved);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Data Engine cycle simulator tracker
  const [newsCycle, setNewsCycle] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>(['[System Initialization] Data Engine online & listening on port 3000...']);
  const [showConsole, setShowConsole] = useState<boolean>(true);

  // 1. Physical Infrastructure level trackers in state
  const studioLevel = playerTeam.infrastructure?.mediaTeamLevel || 1;
  const mentalLevel = playerTeam.infrastructure?.trainingCenterLevel || 1;
  const gamingRoomLevel = playerTeam.infrastructure?.gamingHouseLevel || 1;

  const unifiedFeed = getOrCreateWeekFeedState(gameState, lang);

  // Hired staff list state
  const [employees, setEmployees] = useState<CorporationStaff[]>(() => {
    const saved = localStorage.getItem('legendshub_corporation_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_EMPLOYEES;
  });

  // Hirable Employment Center Job pool
  const [jobPool, setJobPool] = useState<CorporationStaff[]>(() => {
    const saved = localStorage.getItem('legendshub_jobs_market');
    return saved ? JSON.parse(saved) : JOB_MARKET_POOL;
  });

  // TV rights list state (exactly 3 slots)
  const [tvSlots, setTvSlots] = useState<TvRightsSlot[]>(() => {
    const saved = localStorage.getItem('legendshub_tv_slots');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'slot-1', status: 'OCUPADO', emissora: 'CBLOL TV Premium', vigencia_restante: 8, repasse_semanal: 8500, meta_contratual: 'Ficar no Top 4 do campeonato', multa_rescisao: 25000 },
      { id: 'slot-2', status: 'VAGO' },
      { id: 'slot-3', status: 'VAGO' }
    ];
  });

  // Save to persistence
  useEffect(() => {
    localStorage.setItem('legendshub_corporation_staff', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('legendshub_jobs_market', JSON.stringify(jobPool));
  }, [jobPool]);

  useEffect(() => {
    localStorage.setItem('legendshub_tv_slots', JSON.stringify(tvSlots));
  }, [tvSlots]);

  // Modals / Tabs internal layout
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [isTvSelectorOpen, setIsTvSelectorOpen] = useState<string | null>(null); // slot id
  const [selectedBootcampDest, setSelectedBootcampDest] = useState<string>('Seul');
  const [bootcampDays, setBootcampDays] = useState<number>(20);
  const [selectedAthletesIds, setSelectedAthletesIds] = useState<string[]>([]);

  // Destinations list
  const DESTINOS_BOOTCAMP = [
    { nome: 'Seul', pais: 'Coreia do Sul', mult: 1.5, desc: 'Microcontrole perfeito e treinos exaustivos' },
    { nome: 'Pequim', pais: 'China', mult: 1.5, desc: 'Lutas caóticas intensas e tomadas de decisão sob pressão' },
    { nome: 'Califórnia', pais: 'América do Norte', mult: 1.0, desc: 'Infraestrutura de alta tecnologia e networking' },
    { nome: 'São Paulo', pais: 'Brasil', mult: 1.0, desc: 'Adaptação regional e inteligência competitiva' },
    { nome: 'Madrid', pais: 'Espanha', mult: 1.0, desc: 'Resiliência psicológica e tática no servidor europeu' },
    { nome: 'Berlim', pais: 'Alemanha', mult: 1.0, desc: 'Coordenação estratégica rápida da rota central' },
    { nome: 'Dinamarca', pais: 'Dinamarca', mult: 1.0, desc: 'Foco técnico em ciberatletas carregadores' },
    { nome: 'Finlândia', pais: 'Finlândia', mult: 1.0, desc: 'Trabalho de posições iniciadoras e entrosamento' },
    { nome: 'Japão', pais: 'Japão', mult: 1.0, desc: 'Habilidades individuais de mecânica limpa no soloQ' }
  ];

  // Upgrades configurations dynamically localized
  const upgrades = [
    {
      id: 'studio',
      name: TRANSLATIONS[lang].upgrades.marketing.name,
      desc: TRANSLATIONS[lang].upgrades.marketing.desc,
      level: studioLevel,
      max: 5,
      cost: studioLevel * 80000,
      benefit: TRANSLATIONS[lang].upgrades.marketing.benefit,
      icon: Tv
    },
    {
      id: 'mental',
      name: TRANSLATIONS[lang].upgrades.juridico.name,
      desc: TRANSLATIONS[lang].upgrades.juridico.desc,
      level: mentalLevel,
      max: 5,
      cost: mentalLevel * 100000,
      benefit: TRANSLATIONS[lang].upgrades.juridico.benefit,
      icon: ShieldAlert
    },
    {
      id: 'gaming_room',
      name: TRANSLATIONS[lang].upgrades.recursos_humanos.name,
      desc: TRANSLATIONS[lang].upgrades.recursos_humanos.desc,
      level: gamingRoomLevel,
      max: 5,
      cost: gamingRoomLevel * 125000,
      benefit: TRANSLATIONS[lang].upgrades.recursos_humanos.benefit,
      icon: Users
    }
  ];

  // Logic to simulate command actions of Data Engine
  const simulateAction = (actionName: string) => {
    if (actionName === 'abrir_tela_gaming_office') {
      const msgs = {
        pt: "Ação 'abrir_tela_gaming_office' processada pelo motor de dados. Sincronização integral concluída.",
        en: "Command 'abrir_tela_gaming_office' processed by the data engine. Full synchronization done.",
        es: "Acción 'abrir_tela_gaming_office' ejecutada en el motor de datos. Sincronización finalizada."
      };
      triggerNotification("📡 Data Engine CMD", msgs[lang]);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] INBOUND CMD: {"acao": "abrir_tela_gaming_office"} -> SUCESS (Status 200 - OK)`, ...prev]);
    } else if (actionName === 'atualizar_noticias_semana') {
      const msgs = {
        pt: "Ação 'atualizar_noticias_semana' processada. Compilados novas manchetes e posts do X.",
        en: "Command 'atualizar_noticias_semana' completed. Compiled fresh news headlines and community posts.",
        es: "Acción 'atualizar_noticias_semana' completada. Se generaron titulares de inmediato."
      };
      triggerNotification("📡 Data Engine CMD", msgs[lang]);
      
      // Slight financial dynamic
      const updatedTeams = gameState.teams.map(t => {
        if (t.id === gameState.playerTeamId) {
          const fee = (employees.reduce((acc, e) => acc + e.salario_semanal, 0)) || 5000;
          return {
            ...t,
            budget: Math.max(1000, t.budget - Math.floor(fee * 0.15))
          };
        }
        return t;
      });
      onUpdateGameState({
        ...gameState,
        teams: updatedTeams
      });

      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] INBOUND CMD: {"acao": "atualizar_noticias_semana"} -> DATA_REFRESHED_OK`,
        `[${new Date().toLocaleTimeString()}] SYSTEM: Deducted weekly specialist operation taxes from bank accounts`,
        ...prev
      ]);
      setNewsCycle(prev => prev + 1);
    }
  };

  // Get reactive arrays shifted by simulated events
  const getShiftedNewsList = () => {
    return unifiedFeed.news;
  };

  const getShiftedTweetsList = () => {
    return unifiedFeed.tweets;
  };

  const getCompiledDataEngineJSON = () => {
    return JSON.stringify({
      cabecalho_gaming_office: {
        titulo: TRANSLATIONS[lang].cabecalho.titulo,
        subtitulo: TRANSLATIONS[lang].cabecalho.subtitulo
      },
      secao_infraestrutura_operacional_avancada: {
        marketing_office: {
          nome: TRANSLATIONS[lang].upgrades.marketing.name,
          level: studioLevel,
          max_level: 5,
          custo_upgrade: studioLevel * 80000,
          status: "ATIVO"
        },
        legal_department: {
          nome: TRANSLATIONS[lang].upgrades.juridico.name,
          level: mentalLevel,
          max_level: 5,
          custo_upgrade: mentalLevel * 100000,
          status: "ATIVO"
        },
        recursos_humanos: {
          nome: TRANSLATIONS[lang].upgrades.recursos_humanos.name,
          level: gamingRoomLevel,
          max_level: 5,
          custo_upgrade: gamingRoomLevel * 125000,
          status: "ATIVO"
        }
      },
      card_sala_de_imprensa_expandido: {
        efeito_transicao: "vertical_infinite_loop_scroll",
        lista_noticias: getShiftedNewsList()
      },
      card_feed_comunidade_x: {
        efeito_transicao: "vertical_continuous_scroll",
        posts: getShiftedTweetsList()
      },
      last_simulated_command_offset: newsCycle,
      database_persistence_mode: "auto-save"
    }, null, 2);
  };

  // Reactives for athletes list divided in Starting Line and Academy
  const linePrincipal = playerTeam.roster || [];
  const lineAcademy = playerTeam.academy || [];

  const toggleSelectAthlete = (id: string) => {
    setSelectedAthletesIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getAthleteDisplayStatus = (p: Player) => {
    return p.stamina && p.stamina > 30 ? 'Disponível' : 'Indisponível (Sem Estamina)';
  };

  // Get active destination multiplier
  const currentDest = DESTINOS_BOOTCAMP.find(d => d.nome === selectedBootcampDest) || DESTINOS_BOOTCAMP[0];
  const calculatedBootcampCost = selectedAthletesIds.length * bootcampDays * 250 * currentDest.mult;

  const handleStartBootcamp = () => {
    if (selectedAthletesIds.length === 0) {
      alert("Ação Rejeitada: Você precisa convocar ao menos um atleta para a viagem de Bootcamp.");
      return;
    }

    if (playerTeam.budget < calculatedBootcampCost) {
      alert(`Você não tem caixa disponível suficiente para pagar pelos custos da viagem de Bootcamp ($ ${calculatedBootcampCost.toLocaleString('pt-BR')})`);
      return;
    }

    // Decrement from budget
    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        // Boost stamina and motivation of all selected athletes
        const boostAtheltes = (roster: Player[]) => roster.map(p => {
          if (selectedAthletesIds.includes(p.id)) {
            return {
              ...p,
              motivation: Math.min(100, (p.motivation || 80) + 15),
              stamina: Math.min(100, (p.stamina || 70) + 20),
              overallRating: Math.min(99, p.overallRating + 1),
              attributes: {
                ...p.attributes,
                mechanics: Math.min(99, p.attributes.mechanics + 2),
                macro: Math.min(99, p.attributes.macro + 2)
              }
            };
          }
          return p;
        });

        return {
          ...t,
          budget: t.budget - calculatedBootcampCost,
          roster: boostAtheltes(t.roster),
          academy: boostAtheltes(t.academy || [])
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification(
      "✈️ Bootcamp Internacional Concluído!",
      `Seu pelotão retornou de ${selectedBootcampDest} após ${bootcampDays} dias de imersão. Atletas evoluíram em Overall (+1 OVR) e estamina!`
    );

    // Reset selected
    setSelectedAthletesIds([]);
  };

  // Upgrades
  const handleUpgradePhysic = (upgradeId: string, cost: number) => {
    if (playerTeam.budget < cost) {
      alert("Orçamento Escasso: Não há recursos monetários para efetuar esta melhoria no momento.");
      return;
    }

    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        const infra = { ...t.infrastructure };
        if (upgradeId === 'studio') infra.mediaTeamLevel = Math.min(5, (infra.mediaTeamLevel || 1) + 1);
        if (upgradeId === 'mental') infra.trainingCenterLevel = Math.min(5, (infra.trainingCenterLevel || 1) + 1);
        if (upgradeId === 'gaming_room') infra.gamingHouseLevel = Math.min(5, (infra.gamingHouseLevel || 1) + 1);

        return {
          ...t,
          budget: t.budget - cost,
          infrastructure: infra
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("🏢 Sede Corporativa Atualizada", "Sua equipe obteve novas vantagens em virtude do novo patamar das instalações corporativas!");
  };

  // Staff events
  const handleHireEmployee = (employee: CorporationStaff) => {
    if (playerTeam.budget < employee.salario_semanal * 2) {
      alert("Verbas Insuficientes: Não possuímos caixa suficiente para garantir os adiantamentos e luvas contratuais deste profissional.");
      return;
    }

    setEmployees(prev => [...prev, { ...employee, id: `emp-hired-${Date.now()}` }]);
    setJobPool(prev => prev.filter(j => j.id !== employee.id));
    setIsHiringModalOpen(false);

    // Deduct hiring setup fee from balance
    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          budget: t.budget - employee.salario_semanal
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("🤝 Staff Contratado!", `${employee.nome} iniciou suas atividades corporativas como ${employee.cargo}.`);
  };

  const handleFireEmployee = (id: string, name: string) => {
    const filterOut = employees.filter(e => e.id !== id);
    setEmployees(filterOut);
    triggerNotification("📡 Staff Desligado", `${name} foi demitido e não faz mais parte da listagem de despesas financeiras.`);
  };

  // TV Rights slots logic
  const handleOpenTvProposal = (slotId: string) => {
    setIsTvSelectorOpen(slotId);
  };

  const handleSignContractTv = (slotId: string, offer: typeof OFFERS_TV_POOL[0]) => {
    setTvSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          id: slotId,
          status: 'OCUPADO',
          emissora: offer.emissora,
          repasse_semanal: offer.repasse_semanal,
          vigencia_restante: offer.vigencia,
          meta_contratual: offer.meta,
          multa_rescisao: offer.multa
        };
      }
      return slot;
    }));

    setIsTvSelectorOpen(null);

    // Update budget with dynamic signature bonus
    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          budget: t.budget + Math.floor(offer.repasse_semanal * 1.5)
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("📺 Acordo Comercial Assinado!", `Contrato estabelecido comercialmente com a emissora ${offer.emissora}. Adiantamento depositado!`);
  };

  const handleTerminateTv = (slotId: string, penalty: number) => {
    if (playerTeam.budget < penalty) {
      alert(`Você precisa ter pelo menos $ ${penalty.toLocaleString('pt-BR')} em caixa para cobrir o custo da quebra contratual.`);
      return;
    }

    setTvSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return { id: slotId, status: 'VAGO' };
      }
      return slot;
    }));

    // Penalty payment deduction
    const updatedTeams = gameState.teams.map(t => {
      if (t.id === gameState.playerTeamId) {
        return {
          ...t,
          budget: t.budget - penalty
        };
      }
      return t;
    });

    onUpdateGameState({
      ...gameState,
      teams: updatedTeams
    });

    triggerNotification("⚠️ Contrato Comercial Rescindido", "O vínculo de direitos de transmissão foi sumariamente quebrado mediante desembolso de multa.");
  };

  return (
    <div className={`p-1 select-none transition-colors duration-350 ${
      isDark ? 'text-white' : 'text-slate-800'
    }`}>
      
      {/* HEADER SECTION */}
      <div className={`p-6 rounded-2xl border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-[#fcfdfe] border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className={`w-5 h-5 ${isDark ? 'text-[#00cbd6]' : 'text-cyan-600'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#00E5FF]' : 'text-cyan-600'}`}>
              CENTRAL CORPORATIVA & OPERAÇÕES
            </span>
          </div>
          <h2 className={`text-lg font-display font-black uppercase tracking-wide leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {TRANSLATIONS[lang].cabecalho.titulo}
          </h2>
          <p className="text-[10.5px] text-slate-400 mt-1.5 leading-snug">
            {TRANSLATIONS[lang].cabecalho.subtitulo}
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
          isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-[#ffffff] border-slate-200 shadow-sm'
        }`}>
          <span className="text-gray-450 block uppercase text-[8px] tracking-wider mb-0.5">{TRANSLATIONS[lang].saldo}</span>
          <span className="text-emerald-400 font-extrabold text-sm flex items-center">
            <DollarSign className="w-3.5 h-3.5 inline mr-0.5 shrink-0" />
            {playerTeam.budget.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      <div className="space-y-6">

        {/* 1. INFRAESTRUTURA FÍSICA UPGRADES PANEL */}
        <section className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            <Plus className="w-4 h-4 text-[#00E5FF]" />
            {TRANSLATIONS[lang].infra}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upgrades.map(item => {
              const Icon = item.icon;
              const isMaxed = item.level >= item.max;
              return (
                <div key={item.id} className={`p-4.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isDark ? 'bg-[#070d19] border-[#1e2d44] hover:bg-[#0d172a]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/30'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-mono font-black tracking-wide px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-sky-500/15 text-[#00E5FF] font-bold' : 'bg-slate-200 text-slate-700 font-bold'
                        }`}>
                          LVL {item.level} / {item.max}
                        </span>

                        {/* Active indicators in ciano neon */}
                        <div className="flex gap-1 mt-2 justify-end w-20">
                          {Array.from({ length: item.max }).map((_, stepIdx) => (
                            <div 
                              key={stepIdx} 
                              className={`h-1 w-2.5 rounded-sm transition-all duration-300 ${
                                stepIdx < item.level 
                                  ? 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]' 
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-wide text-slate-300 dark:text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{item.desc}</p>
                    </div>

                    <div className="text-[9.5px] font-black text-emerald-450 uppercase bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 flex items-center gap-1">
                      ⚡ Bônus: {item.benefit}
                    </div>
                  </div>

                  <div className="mt-4 pt-1">
                    {isMaxed ? (
                      <button disabled className="w-full py-2 bg-slate-500/15 text-slate-500 text-[9px] uppercase font-black rounded-lg border border-slate-500/20 cursor-not-allowed">
                        {TRANSLATIONS[lang].max}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpgradePhysic(item.id, item.cost)}
                        className="w-full py-2 bg-cyan-600 hover:bg-[#00E5FF] hover:text-black text-white text-[9px] uppercase font-black tracking-widest rounded-lg cursor-pointer transition-all"
                      >
                        {TRANSLATIONS[lang].upgrade}: $ {item.cost.toLocaleString('pt-BR')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* 2. GESTÃO DE FUNCIONÁRIOS (Staff Roster) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`p-5 rounded-2xl border lg:col-span-7 ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                <Users className="w-4 h-4 text-[#00E5FF]" />
                {TRANSLATIONS[lang].staff} ({employees.length})
              </h3>
              <button
                onClick={() => setIsHiringModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-[#00E5FF] hover:text-black text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {TRANSLATIONS[lang].contratar}
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {employees.length > 0 ? (
                employees.map(employee => (
                  <div key={employee.id} className={`p-3.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs uppercase font-extrabold text-blue-500">{employee.nome}</h4>
                        <span className={`text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded-md ${
                          isDark ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-indigo-50 text-indigo-650 font-bold'
                        }`}>
                          {employee.cargo}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
                        <span>{TRANSLATIONS[lang].eficiencia}: <strong className="text-cyan-400">{employee.nivel_eficiencia}%</strong></span>
                        <span>•</span>
                        <span>{TRANSLATIONS[lang].contrato}: <strong>{employee.semanas_contrato} sem</strong></span>
                        {employee.patrocinio_bonus && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-extrabold">+{(employee.patrocinio_bonus * 10).toFixed(0)}% receita mkt</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-800/20 md:border-t-0 pt-2.5 md:pt-0">
                      <div>
                        <span className="text-[7.5px] uppercase text-gray-400 block font-bold leading-none mb-0.5">{TRANSLATIONS[lang].custo}</span>
                        <span className="text-xs font-mono font-black text-rose-500">$ {employee.salario_semanal.toLocaleString()}/sem</span>
                      </div>
                      <button
                        onClick={() => handleFireEmployee(employee.id, employee.nome)}
                        className={`p-1.5 rounded-lg border transition ${
                          isDark ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-slate-250 text-slate-400 hover:text-red-650 hover:bg-red-50'
                        }`}
                        title="Demitir do elenco corporativo"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-[10px] uppercase font-black border border-dashed border-slate-800/40 rounded-xl">
                  Nenhum funcionário na sede corporativa. Contrate novos na agência.
                </div>
              )}
            </div>
          </div>

          {/* 4. DIREITOS DE TRANSMISSÃO TV (3 slots) */}
          <div className={`p-5 rounded-2xl border lg:col-span-5 ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              <Tv className="w-4 h-4 text-cyan-400" />
              {TRANSLATIONS[lang].tv}
            </h3>

            <div className="space-y-4">
              {tvSlots.map((slot, idx) => {
                const isOccupied = slot.status === 'OCUPADO';
                return (
                  <div key={slot.id} className={`p-3.5 rounded-xl border relative overflow-hidden transition ${
                    isOccupied 
                      ? 'border-cyan-500/30 bg-cyan-500/5' 
                      : 'border-dashed border-slate-800/70 bg-slate-500/5'
                  }`}>
                    <span className="absolute top-2.5 right-3 text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">
                      Slot {idx + 1}
                    </span>

                    {isOccupied ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] tracking-widest font-black uppercase text-[#00E5FF]">{TRANSLATIONS[lang].ativoComercial}</span>
                          <h4 className="text-xs font-extrabold text-blue-500">{slot.emissora}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9.5px] border-y border-slate-800/10 dark:border-slate-800/45 py-2">
                          <div>
                            <span className="text-[7.5px] text-gray-400 block mb-0.5 uppercase leading-none">{TRANSLATIONS[lang].repasse}</span>
                            <span className="text-emerald-400 font-extrabold">$ {slot.repasse_semanal?.toLocaleString()}/sem</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-gray-400 block mb-0.5 uppercase leading-none">{TRANSLATIONS[lang].duracao}</span>
                            <span className="font-extrabold text-slate-350">{slot.vigencia_restante} semanas</span>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-slate-400 flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-500 grow-0 shrink-0 mt-0.5" />
                          <span>{TRANSLATIONS[lang].metas}: {slot.meta_contratual || 'Ficar no Top 4 do campeonato ou superior.'}</span>
                        </div>

                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => handleTerminateTv(slot.id, slot.multa_rescisao || 25000)}
                            className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest bg-red-650/10 text-red-400 hover:bg-red-500/15 rounded border border-red-500/20 cursor-pointer"
                          >
                            {TRANSLATIONS[lang].rescindir} (Multa: $ {slot.multa_rescisao?.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">{TRANSLATIONS[lang].vago}</p>
                        <p className="text-[8.5px] text-gray-500 mt-1 mb-3.5">{TRANSLATIONS[lang].receberPropostas}</p>
                        <button
                          onClick={() => handleOpenTvProposal(slot.id)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[9px] uppercase rounded-lg shadow-sm cursor-pointer transition"
                        >
                          {TRANSLATIONS[lang].avaliarPropostas}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* 3. PAINEL BOOTCAMP INTERNACIONAL */}
        <section className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/10 dark:border-slate-800/40 pb-3">
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                <Globe className="w-4 h-4 text-cyan-400" />
                Painel Organizador de Bootcamp Internacional
              </h3>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Prepare expedições internacionais de imersão competitiva com atletas do bota principal ou academy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Athlete list split in Line Principal and Academy */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold block mb-2">Convocação: Line-up Principal ({linePrincipal.length})</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {linePrincipal.map(p => {
                    const isSelected = selectedAthletesIds.includes(p.id);
                    const statusText = getAthleteDisplayStatus(p);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelectAthlete(p.id)}
                        className={`p-2 rounded-xl border flex justify-between items-center transition cursor-pointer select-none ${
                          isSelected 
                            ? 'border-cyan-500 bg-cyan-500/10' 
                            : 'border-slate-800 bg-slate-500/5 hover:bg-slate-800/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <div>
                            <span className="text-xs font-extrabold text-blue-500 pr-1">{p.name}</span>
                            <span className="text-[8px] font-mono text-slate-400">({p.position}) - OVR {p.overallRating}</span>
                          </div>
                        </div>
                        <span className={`text-[8.5px] font-bold ${
                          statusText.startsWith('Disp') ? 'text-emerald-400' : 'text-rose-500'
                        }`}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold block mb-2">Convocação: Academy / Base ({lineAcademy.length})</span>
                <div className="space-y-2 max-h-[16 0px] overflow-y-auto custom-scrollbar">
                  {lineAcademy.length > 0 ? (
                    lineAcademy.map(p => {
                      const isSelected = selectedAthletesIds.includes(p.id);
                      const statusText = getAthleteDisplayStatus(p);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleSelectAthlete(p.id)}
                          className={`p-2 rounded-xl border flex justify-between items-center transition cursor-pointer select-none ${
                            isSelected 
                              ? 'border-cyan-500 bg-cyan-500/10' 
                              : 'border-slate-800 bg-slate-500/5 hover:bg-slate-800/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <div>
                              <span className="text-xs font-extrabold text-blue-500 pr-1">{p.name}</span>
                              <span className="text-[8px] font-mono text-slate-400">({p.position}) - OVR {p.overallRating}</span>
                            </div>
                          </div>
                          <span className={`text-[8.5px] font-bold ${
                            statusText.startsWith('Disp') ? 'text-emerald-400' : 'text-rose-500'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 bg-slate-500/5 border border-slate-800/20 rounded-xl text-[8.5px] text-gray-500 uppercase font-bold leading-none">
                      Nenhum atleta na academia de base CBLOL.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Travel itinerary config */}
            <div className={`lg:col-span-7 p-4.5 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-[#070d19]' : 'bg-slate-50 border-slate-205'
            }`}>
              <div className="space-y-4">
                <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Configurador de Roteiro de Viagem</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8.5px] text-slate-400 uppercase font-bold block mb-1">Destino Internacional</label>
                    <select
                      value={selectedBootcampDest}
                      onChange={(e) => setSelectedBootcampDest(e.target.value)}
                      className={`w-full px-2.5 py-1.8 border text-xs font-bold leading-none rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                        isDark ? 'bg-[#0a1424] border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                      }`}
                    >
                      {DESTINOS_BOOTCAMP.map(d => (
                        <option key={d.nome} value={d.nome}>
                          {d.nome} ({d.pais}) - Multiplicador {d.mult}x
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[8.5px] text-slate-400 uppercase font-bold block mb-1">Duração da Estadia (Sld)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="45"
                        value={bootcampDays}
                        onChange={(e) => setBootcampDays(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-450"
                      />
                      <span className="text-xs font-mono font-black text-white px-2.5 py-1 bg-cyan-550 rounded inline-block">
                        {bootcampDays}D
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[9.5px] text-slate-400 leading-relaxed border-t border-slate-800/10 dark:border-slate-800/30 pt-2.5">
                  🌍 <strong>Estada em {currentDest.nome}:</strong> {currentDest.desc}.
                </div>

                {/* Costs details summary */}
                <div className="flex justify-between items-center border-t border-slate-800/10 dark:border-slate-800/35 pt-4">
                  <div>
                    <span className="text-[7.5px] block font-bold text-gray-400 uppercase leading-none mb-0.5">Atletas Convocados</span>
                    <span className="text-xs font-extrabold text-blue-400 leading-none">{selectedAthletesIds.length} Atletas</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] block font-bold text-gray-400 uppercase leading-none mb-0.5">Dias Totais</span>
                    <span className="text-xs font-extrabold text-indigo-400 leading-none">{bootcampDays} Dias</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] block font-bold text-gray-400 uppercase leading-none mb-0.5">Taxativo da Passagem</span>
                    <span className="text-xs font-extrabold text-rose-400 leading-none font-mono">$ {calculatedBootcampCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={handleStartBootcamp}
                  disabled={selectedAthletesIds.length === 0}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow transition-all ${
                    selectedAthletesIds.length === 0 
                      ? 'bg-slate-500/15 text-slate-500 cursor-not-allowed border border-slate-500/20' 
                      : 'bg-[#00cbd6] hover:bg-[#00d2fd] text-black cursor-pointer'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Iniciar Viagem de Bootcamp Internacional
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MEDIA & COMMUNITY CHANNELS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PRESS ROOM (SALA DE IMPRENSA) CARD */}
          <div className={`p-5 rounded-2xl border flex flex-col h-[400px] overflow-hidden ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/10 dark:border-slate-800/40 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">
                  SALA DE IMPRENSA
                </h3>
              </div>
              <span className="text-[7.5px] font-mono uppercase text-[#00cbd6] font-bold tracking-widest text-right">
                ROLAGEM VERTICAL EM LOOP INFINITO / MARQUEE
              </span>
            </div>

            <MarqueeNews news={unifiedFeed.news} isDark={isDark} />
          </div>

          {/* SOCIAL NETWORK COMPONENT (FEED X/TWITTER) */}
          <div className={`p-5 rounded-2xl border flex flex-col h-[400px] overflow-hidden ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/10 dark:border-slate-800/40 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">
                  REDE SOCIAL: FEED DO X (Twitter)
                </h3>
              </div>
              <span className="text-[7.5px] font-mono uppercase text-[#00cbd6] font-bold tracking-widest text-right">
                ROLAGEM VERTICAL EM LOOP INFINITO / MARQUEE
              </span>
            </div>

            <RssFeedX tweets={unifiedFeed.tweets} isDark={isDark} />
          </div>

        </section>

        {/* DATA ENGINE CONSOLE BOX (JSON AGGREGATOR) */}
        <section className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-250'
        }`}>
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/20 dark:border-slate-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-[#00E5FF]" />
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-[#00E5FF] tracking-wider font-mono">
                {TRANSLATIONS[lang].engineConsole}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-500/20 font-mono">
                {TRANSLATIONS[lang].engineStatus}
              </span>
              <button 
                onClick={() => setShowConsole(!showConsole)}
                className="text-gray-400 hover:text-white text-[10px] font-bold uppercase select-none transition border border-slate-800 rounded px-2.5 py-1 text-[8.5px]"
              >
                {showConsole ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showConsole && (
            <div className="space-y-4">
              <p className="text-[9.5px] text-slate-400 leading-snug">
                {TRANSLATIONS[lang].explicacaoEngine}
              </p>

              {/* INTERACTIVE CONTROLS */}
              <div className="p-3 bg-[#0a1424]/90 border border-[#1e2d44] rounded-xl flex flex-wrap gap-3 items-center justify-between">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">
                  {TRANSLATIONS[lang].rodarComando}:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => simulateAction('abrir_tela_gaming_office')}
                    className="px-3 py-1 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 font-black text-[9px] uppercase rounded-lg cursor-pointer transition flex items-center gap-1.5 font-mono"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin duration-10000" />
                    {TRANSLATIONS[lang].cmdAbrir}
                  </button>
                  <button
                    onClick={() => simulateAction('atualizar_noticias_semana')}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition flex items-center gap-1.5 font-mono"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {TRANSLATIONS[lang].cmdAtualizar}
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getCompiledDataEngineJSON());
                    triggerNotification("🖥️ Data Engine System", "JSON payload successfully copied to your clipboard!");
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white font-black text-[9px] uppercase rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition flex items-center gap-1.5 font-mono"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  {TRANSLATIONS[lang].copiarJson}
                </button>
              </div>

              {/* CONSOLE DISPLAY AND LOGS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* JSON Aggregated Output */}
                <div className="lg:col-span-7 bg-[#050b14] border border-[#1e2d44] rounded-xl p-4 overflow-x-auto h-[240px]">
                  <pre className="text-[9px] font-mono text-cyan-300 leading-normal selection:bg-cyan-500/20 whitespace-pre-wrap">
                    {getCompiledDataEngineJSON()}
                  </pre>
                </div>

                {/* Event logs */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 h-[240px] overflow-y-auto">
                  <span className="text-[8px] font-black text-gray-500 block mb-2 font-mono uppercase tracking-widest border-b border-slate-800/40 pb-1.5">
                    Engine Log Stack
                  </span>
                  <div className="space-y-1.5 font-mono text-[8.5px] text-emerald-400">
                    {logs.map((log, idx) => (
                      <div key={idx} className="leading-snug">
                        <span className="text-gray-550 select-none">&gt;&gt;</span> {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </section>

      </div>

      {/* HIRING EMPLOYMENT CENTER POPUP MODAL */}
      {isHiringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-xl relative animate-slide-in ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-205'
          }`}>
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/5 dark:border-slate-800/30">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 block mb-0.5">CENTRAL DE EMPREGOS</span>
                <h3 className={`text-sm font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Casting de Candidatos à Disponiveis
                </h3>
              </div>
              <button 
                onClick={() => setIsHiringModalOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-[15px] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {jobPool.length > 0 ? (
                jobPool.map(job => (
                  <div key={job.id} className={`p-3 rounded-xl border flex justify-between items-center ${
                    isDark ? 'bg-[#070d19] border-slate-850' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-blue-500 leading-none">{job.nome}</h4>
                      <div className="text-[9.5px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Cargo: <strong>{job.cargo}</strong></span>
                        <span>•</span>
                        <span>Eficiência: <strong className="text-cyan-400">{job.nivel_eficiencia}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[7.5px] text-gray-405 block font-bold leading-none mb-0.5">Salário</span>
                        <span className="text-xs font-mono font-black text-rose-500">$ {job.salario_semanal}/sem</span>
                      </div>
                      <button
                        onClick={() => handleHireEmployee(job)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Recrutar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-[10px] uppercase font-black border border-dashed border-slate-850 rounded-xl">
                  Nenhum profissional qualificado no mercado. Volte amanhã!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TV OFFERS LIST MODAL */}
      {isTvSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl animate-slide-in ${
            isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-805 dark:border-slate-800/30">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#00cbd6] block mb-0.5 font-bold">OFERTAS DE NEGÓCIOS</span>
                <h3 className={`text-md font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Selecionar Patrocínio de Transmissão TV
                </h3>
              </div>
              <button 
                onClick={() => setIsTvSelectorOpen(null)}
                className="text-gray-405 hover:text-white font-extrabold text-[15px] p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {OFFERS_TV_POOL.map((offer, oIdx) => (
                <div key={oIdx} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  isDark ? 'bg-[#070d19] border-slate-850' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-500 uppercase leading-none">{offer.emissora}</h4>
                    <p className="text-[9.5px] text-gray-500 mt-1 leading-relaxed">Meta Contratual: {offer.meta}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-slate-800/10 dark:border-slate-800/40 pt-2.5">
                    <div>
                      <span className="text-[7.5px] block font-bold text-gray-450 leading-none mb-0.5">Repasse Semanal</span>
                      <span className="text-emerald-400 font-extrabold">$ {offer.repasse_semanal.toLocaleString()}/sem</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] block font-bold text-gray-455 leading-none mb-0.5">Vigência</span>
                      <span className="font-extrabold text-slate-350">{offer.vigencia} sem</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleSignContractTv(isTvSelectorOpen, offer)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-[9.5px] font-black uppercase px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Assinar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

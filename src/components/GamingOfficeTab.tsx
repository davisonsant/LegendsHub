/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Tv, Heart, Keyboard, Users, ShieldAlert, Globe, 
  MapPin, DollarSign, Calendar, Check, Play, UserMinus, Plus,
  Sparkles, Award, FileText, X, AlertCircle, Terminal, Copy, RefreshCw, Star, StarHalf, TrendingUp, Scale
} from 'lucide-react';
import { GameState, Team, Player, Staff, CorporationStaff } from '../types';
import { getOrCreateWeekFeedState, RssFeedX, MarqueeNews } from '../utils/feedHelper';

interface GamingOfficeTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  theme?: 'light' | 'dark';
  onNavigate?: (tabName: string) => void;
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
    departamento: 'COMISSÃO TÉCNICA',
    salario_semanal: 3500,
    semanas_contrato: 32,
    nivel_eficiencia: 85,
    patrocinio_bonus: 0.05,
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 37,
    especialidade: 'Leitura Tática de Rift e Vetos de Patch'
  },
  {
    id: 'emp-2',
    nome: 'Ana Lívia Santos',
    cargo: 'Gerente de Marketing',
    departamento: 'MARKETING',
    salario_semanal: 2800,
    semanas_contrato: 48,
    nivel_eficiencia: 90,
    patrocinio_bonus: 0.15,
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 29,
    especialidade: 'Campanhas de Engajamento e Expansão Digital'
  },
  {
    id: 'emp-3',
    nome: 'Dr. Roberto de Souza',
    cargo: 'Psicólogo',
    departamento: 'SAÚDE',
    salario_semanal: 2500,
    semanas_contrato: 24,
    nivel_eficiencia: 78,
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 43,
    especialidade: 'Trabalho Psicológico de Pressão e Foco Mental'
  }
];

const JOB_MARKET_POOL: CorporationStaff[] = [
  {
    id: 'job-1',
    nome: 'Felipe "YoDa" Noronha',
    cargo: 'Coach',
    departamento: 'COMISSÃO TÉCNICA',
    salario_semanal: 3200,
    semanas_contrato: 32,
    nivel_eficiencia: 90,
    patrocinio_bonus: 0.1,
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 28,
    especialidade: 'Trabalho de Motivação Externa e Comunicação'
  },
  {
    id: 'job-2',
    nome: 'Sulamita Vieira',
    cargo: 'Fisioterapeuta Postural',
    departamento: 'SAÚDE',
    salario_semanal: 2200,
    semanas_contrato: 32,
    nivel_eficiencia: 85,
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 32,
    especialidade: 'Prevenção de Lesões RPG e Ergonomia'
  },
  {
    id: 'job-3',
    nome: 'Gabriel "Kami" Bohm',
    cargo: 'Analista Macro',
    departamento: 'COMISSÃO TÉCNICA',
    salario_semanal: 4000,
    semanas_contrato: 64,
    nivel_eficiencia: 95,
    patrocinio_bonus: 0.2,
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 29,
    especialidade: 'Controle de Macrogame Geral e Lutas Controladas'
  },
  {
    id: 'job-4',
    nome: 'Juliana Paes',
    cargo: 'Relações Públicas / PR',
    departamento: 'RH',
    salario_semanal: 2605,
    semanas_contrato: 32,
    nivel_eficiencia: 80,
    patrocinio_bonus: 0.08,
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 31,
    especialidade: 'Media Training e Gestão de Crise de Torcida'
  },
  {
    id: 'job-5',
    nome: 'Arthur Pendragon',
    cargo: 'Analista de TI',
    departamento: 'TI',
    salario_semanal: 1900,
    semanas_contrato: 32,
    nivel_eficiencia: 75,
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Reino Unido',
    bandeira: '🇬🇧',
    idade: 25,
    especialidade: 'Redes Isoladas e Mitigação de Ping'
  },
  {
    id: 'job-6',
    nome: 'Guilherme Salles',
    cargo: 'Olheiro',
    departamento: 'OLHEIROS',
    salario_semanal: 2400,
    semanas_contrato: 32,
    nivel_eficiencia: 88,
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 33,
    especialidade: 'Deteção de Rota Inferior (CBLOL/Amador)'
  },
  {
    id: 'job-7',
    nome: 'Aiko Sato',
    cargo: 'Olheiro',
    departamento: 'OLHEIROS',
    salario_semanal: 3500,
    semanas_contrato: 64,
    nivel_eficiencia: 96,
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Japão',
    bandeira: '🇯🇵',
    idade: 36,
    especialidade: 'Análise de Solo-lanes de Alta Classificação (LCK/LPL)'
  },
  {
    id: 'job-8',
    nome: 'Dr. Lucas Montenegro',
    cargo: 'Advogado',
    departamento: 'JURÍDICO',
    salario_semanal: 3100,
    semanas_contrato: 32,
    nivel_eficiencia: 82,
    fotoUrl: 'https://images.unsplash.com/photo-1507591064344-4c6b5614d601?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 39,
    especialidade: 'Contratos de Atletas e Multas Trabalhistas'
  },
  {
    id: 'job-9',
    nome: 'Dra. Sofia Alencar',
    cargo: 'Advogado',
    departamento: 'JURÍDICO',
    salario_semanal: 3600,
    semanas_contrato: 48,
    nivel_eficiencia: 91,
    fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    nacionalidade: 'Brasil',
    bandeira: '🇧🇷',
    idade: 30,
    especialidade: 'Tratativa de Direitos Desportivos de Atletas'
  }
];

const getStaffIcon = (cargo: string, departamento?: string) => {
  const dept = (departamento || '').toUpperCase();
  const c = (cargo || '').toUpperCase();
  
  if (dept.includes('TI') || c.includes('ANALISTA') || c.includes('DATA')) {
    return <Terminal className="w-5 h-5 text-cyan-400" />;
  }
  if (dept.includes('SAÚDE') || dept.includes('SAUDE') || c.includes('PSICÓLOGO') || c.includes('PSICOLOGO') || c.includes('MEDICO') || c.includes('FISIOTERAPEUTA')) {
    return <Heart className="w-5 h-5 text-rose-400" />;
  }
  if (dept.includes('MARKETING') || c.includes('PR') || c.includes('DESIGNER') || c.includes('GERENTE DE MARKETING')) {
    return <TrendingUp className="w-5 h-5 text-emerald-400" />;
  }
  if (dept.includes('JURÍDICO') || dept.includes('JURIDICO') || c.includes('ADVOGADO')) {
    return <FileText className="w-5 h-5 text-indigo-400" />;
  }
  if (dept.includes('OLHEIRO') || c.includes('SCOUT')) {
    return <Globe className="w-5 h-5 text-blue-400" />;
  }
  if (c.includes('COACH') || c.includes('TREINADOR') || dept.includes('TÉCNICA') || dept.includes('TECNICA')) {
    return <Award className="w-5 h-5 text-amber-400" />;
  }
  return <Users className="w-5 h-5 text-slate-400" />;
};

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
    bootcamp: "International Bootcamp",
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
    bootcamp: "Organizador de Bootcamp Internacional",
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
  theme = 'light',
  onNavigate
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
  const [logs, setLogs] = useState<string[]>(['[System Initialization] Painel administrativo do clube carregado e sincronizado...']);
  const [showConsole, setShowConsole] = useState<boolean>(true);

  // 1. Physical Infrastructure level trackers in state
  const studioLevel = playerTeam.infrastructure?.mediaTeamLevel || 1;
  const mentalLevel = playerTeam.infrastructure?.trainingCenterLevel || 1;
  const gamingRoomLevel = playerTeam.infrastructure?.gamingHouseLevel || 1;

  const unifiedFeed = getOrCreateWeekFeedState(gameState, lang);

  // Synchronized Scouts config and properties helpers
  const DEFAULT_INITIAL_SCOUTS = [
    { id: 'scout-1', name: 'Guilherme Salles', specialty: 'ROTA INFERIOR (CBLOL)', stars: 5, status: 'Disponível', salary: 3500, contractRemaining: 18, isHead: false },
    { id: 'scout-2', name: 'Aiko Sato', specialty: 'ROTAS SOLO (LCK/LPL)', stars: 5, status: 'Disponível', salary: 4200, contractRemaining: 24, isHead: true },
    { id: 'scout-3', name: 'Jack Marshall', specialty: 'MACRO & VISÃO (LCS)', stars: 4, status: 'Disponível', salary: 2800, contractRemaining: 12, isHead: false },
    { id: 'scout-4', name: 'Helmi Virtanen', specialty: 'NOVAS PROMESSAS (LEC)', stars: 4, status: 'Disponível', salary: 3100, contractRemaining: 16, isHead: false },
    { id: 'scout-5', name: 'Jean-Pierre Laurent', specialty: 'SUPORTES & UTILIDADE (LEC)', stars: 3, status: 'Disponível', salary: 1900, contractRemaining: 8, isHead: false }
  ];

  const scoutPhotoUrl = (id: string) => {
    if (id === 'scout-1') return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200';
    if (id === 'scout-2') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    if (id === 'scout-3') return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200';
    if (id === 'scout-4') return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
    return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200';
  };

  const scoutNacionalidade = (id: string) => {
    if (id === 'scout-1') return 'Brasil';
    if (id === 'scout-2') return 'Japão';
    if (id === 'scout-3') return 'EUA';
    if (id === 'scout-4') return 'Finlândia';
    return 'França';
  };

  const scoutBandeira = (id: string) => {
    if (id === 'scout-1') return '🇧🇷';
    if (id === 'scout-2') return '🇯🇵';
    if (id === 'scout-3') return '🇺🇸';
    if (id === 'scout-4') return '🇫🇮';
    return '🇫🇷';
  };

  const scoutIdade = (id: string) => {
    if (id === 'scout-1') return 33;
    if (id === 'scout-2') return 36;
    if (id === 'scout-3') return 31;
    if (id === 'scout-4') return 28;
    return 34;
  };

  const getMergedEmployees = (baseEmployees: CorporationStaff[]): CorporationStaff[] => {
    let scoutsList: any[] = [];
    const savedScouts = localStorage.getItem('legendshub_custom_scouts');
    if (savedScouts) {
      try {
        scoutsList = JSON.parse(savedScouts);
      } catch (e) {}
    }
    if (!scoutsList || scoutsList.length === 0) {
      scoutsList = DEFAULT_INITIAL_SCOUTS;
    }

    const mappedScouts: CorporationStaff[] = scoutsList.map(sc => ({
      id: sc.id,
      nome: sc.name,
      cargo: sc.isHead ? 'Olheiro Chefe (Head of Scouting)' : 'Olheiro',
      departamento: 'OLHEIROS',
      salario_semanal: sc.salary,
      semanas_contrato: sc.contractRemaining * 4,
      nivel_eficiencia: sc.stars * 20,
      patrocinio_bonus: 0,
      fotoUrl: scoutPhotoUrl(sc.id),
      nacionalidade: scoutNacionalidade(sc.id),
      bandeira: scoutBandeira(sc.id),
      idade: scoutIdade(sc.id),
      especialidade: sc.specialty
    }));

    const withoutOldScouts = baseEmployees.filter(e => e.departamento !== 'OLHEIROS' && !e.id.includes('scout'));
    return [...withoutOldScouts, ...mappedScouts];
  };

  // Hired staff list state (including Scouts synced from ScoutingTab)
  const [employees, setEmployees] = useState<CorporationStaff[]>(() => {
    let baseStaff: CorporationStaff[] = [];
    if (gameState.corporationStaffEmployees && gameState.corporationStaffEmployees.length > 0) {
      baseStaff = [...gameState.corporationStaffEmployees];
    } else {
      const saved = localStorage.getItem('legendshub_corporation_staff');
      baseStaff = saved ? JSON.parse(saved) : [...INITIAL_STAFF_EMPLOYEES];
    }
    return getMergedEmployees(baseStaff);
  });

  // Hirable Employment Center Job pool
  const [jobPool, setJobPool] = useState<CorporationStaff[]>(() => {
    if (gameState.corporationStaffJobPool && gameState.corporationStaffJobPool.length > 0) return gameState.corporationStaffJobPool;
    const saved = localStorage.getItem('legendshub_jobs_market');
    return saved ? JSON.parse(saved) : JOB_MARKET_POOL;
  });

  // Watch for external sync (so CentralDeEmpregos changes apply instantly) and synchronize list on Mount
  useEffect(() => {
    const saved = localStorage.getItem('legendshub_corporation_staff');
    const baseStaff = saved ? JSON.parse(saved) : [...INITIAL_STAFF_EMPLOYEES];
    setEmployees(getMergedEmployees(gameState.corporationStaffEmployees || baseStaff));
  }, [gameState.corporationStaffEmployees]);

  useEffect(() => {
    if (gameState.corporationStaffJobPool) {
      setJobPool(gameState.corporationStaffJobPool);
    }
  }, [gameState.corporationStaffJobPool]);

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

  // 1. New Operational Leader Id state and persistence
  const [leaderId, setLeaderId] = useState<string | null>(() => {
    return localStorage.getItem('legendshub_operations_leader') || null;
  });

  useEffect(() => {
    if (leaderId) {
      localStorage.setItem('legendshub_operations_leader', leaderId);
    } else {
      localStorage.removeItem('legendshub_operations_leader');
    }
  }, [leaderId]);

  const activeLeader = employees.find(e => e.id === leaderId);

  // Return icons based on staff position and department similar to staffing list
  const getStaffIcon = (cargo: string, departamento?: string, sizeClass: string = "w-5 h-5") => {
    const dept = (departamento || '').toUpperCase();
    const c = (cargo || '').toUpperCase();
    
    if (dept.includes('TI') || c.includes('ANALISTA') || c.includes('DATA')) {
      return <Terminal className={`${sizeClass} text-cyan-400`} />;
    }
    if (dept.includes('SAÚDE') || dept.includes('SAUDE') || c.includes('PSICÓLOGO') || c.includes('PSICOLOGO') || c.includes('MEDICO') || c.includes('FISIOTERAPEUTA')) {
      return <Heart className={`${sizeClass} text-rose-500`} />;
    }
    if (dept.includes('MARKETING') || c.includes('PR') || c.includes('DESIGNER') || c.includes('GERENTE DE MARKETING') || c.includes('GERENTE DE CONTEÚDO') || c.includes('CONTEUDO')) {
      return <TrendingUp className={`${sizeClass} text-emerald-500`} />;
    }
    if (dept.includes('JURÍDICO') || dept.includes('JURIDICO') || c.includes('ADVOGADO')) {
      return <Scale className={`${sizeClass} text-indigo-500`} />;
    }
    if (dept.includes('OLHEIRO') || c.includes('SCOUT')) {
      return <Globe className={`${sizeClass} text-blue-500`} />;
    }
    if (c.includes('COACH') || c.includes('TREINADOR') || dept.includes('TÉCNICA') || dept.includes('TECNICA')) {
      return <Award className={`${sizeClass} text-amber-500`} />;
    }
    return <Users className={`${sizeClass} text-slate-400`} />;
  };

  // Initials generator (removes fotografias humanas override)
  const getInitials = (nome: string) => {
    const parts = nome.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return nome[0] ? nome[0].toUpperCase() : 'ST';
  };

  // Solid/gradient badge coloring based on employee id hashed
  const getBadgeGradient = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = sum % 5;
    switch (index) {
      case 0: return 'from-cyan-600 to-indigo-700 text-cyan-100';
      case 1: return 'from-amber-500 to-orange-600 text-amber-100';
      case 2: return 'from-emerald-500 to-teal-700 text-emerald-100';
      case 3: return 'from-purple-600 to-pink-700 text-purple-100';
      default: return 'from-rose-500 to-red-600 text-rose-100';
    }
  };

  // Dynamic operations leader bonus resolver based on role / department / specialty
  const getLeaderBonusInfo = (emp: CorporationStaff) => {
    const cargo = (emp.cargo || '').toUpperCase();
    const dept = (emp.departamento || '').toUpperCase();

    // Se escolher o Head Coach / Coach / Técnico
    if (cargo.includes('COACH') || cargo.includes('TREINADOR') || dept.includes('TÉCNICA') || dept.includes('TECNICA')) {
      return {
        tipo: 'COACH',
        titulo: "Comissão Técnica & Preparação Sênior",
        bonus: "+10% de ganho de eficiência em treinos e preparação tática para as simulações de partida"
      };
    }
    // Se escolher o Gerente de Marketing / PR / Designer
    if (cargo.includes('MARKETING') || cargo.includes('PR') || cargo.includes('RELAÇÕES PÚBLICAS') || dept.includes('MARKETING')) {
      return {
        tipo: 'MARKETING',
        titulo: "Diretoria de Marketing & Eventos",
        bonus: "+15% de receita fixa de patrocínios e bônus de venda de camisas (Fan Shop)"
      };
    }
    // Se escolher o Psicólogo de Linha / Equipe Psicológica / Médico / Fisioterapeuta
    if (cargo.includes('PSICÓLOGO') || cargo.includes('PSICOLOGO') || cargo.includes('MEDICO') || cargo.includes('FISIOTERAPEUTA') || dept.includes('SAÚDE') || dept.includes('SAUDE')) {
      return {
        tipo: 'SAUDE',
        titulo: "Coordenação Mental & Fisioterapia",
        bonus: "Reduz em 25% a velocidade de queda de humor e insatisfação do elenco face a derrotas ou cobranças da torcida"
      };
    }
    // Se escolher o Advogado / Compliance / Jurídico / TI
    if (cargo.includes('ADVOGADO') || cargo.includes('COMPLIANCE') || cargo.includes('JURÍDICO') || cargo.includes('JURIDICO') || dept.includes('JURÍDICO') || dept.includes('JURIDICO')) {
      return {
        tipo: 'JURIDICO',
        titulo: "Direção de Compliance & Advocacia",
        bonus: "Reduz os riscos de falsos positivos na Auditoria Interna e concede 10% de desconto em taxas consulares de vistos"
      };
    }

    // Default general manager bonus fallback
    return {
      tipo: 'GERAL',
      titulo: "Chefe Geral de Central Operativa",
      bonus: "+5% de eficiência operacional e controle administrativo geral da gaming house"
    };
  };

  // Save to persistence
  useEffect(() => {
    localStorage.setItem('legendshub_corporation_staff', JSON.stringify(employees));
    if (JSON.stringify(gameState.corporationStaffEmployees) !== JSON.stringify(employees)) {
      onUpdateGameState({
        ...gameState,
        corporationStaffEmployees: employees
      });
    }
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('legendshub_jobs_market', JSON.stringify(jobPool));
    if (JSON.stringify(gameState.corporationStaffJobPool) !== JSON.stringify(jobPool)) {
      onUpdateGameState({
        ...gameState,
        corporationStaffJobPool: jobPool
      });
    }
  }, [jobPool]);

  useEffect(() => {
    localStorage.setItem('legendshub_tv_slots', JSON.stringify(tvSlots));
  }, [tvSlots]);

  // Modals / Tabs internal layout
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [negotiatingEmployee, setNegotiatingEmployee] = useState<CorporationStaff | null>(null);
  const [negotiationWeeks, setNegotiationWeeks] = useState<number>(32);
  const [negotiationSalary, setNegotiationSalary] = useState<number>(2000);
  const [negotiationSector, setNegotiationSector] = useState<CorporationStaff['departamento']>('COMISSÃO TÉCNICA');

  const handleOpenNegotiation = (emp: CorporationStaff) => {
    setNegotiatingEmployee(emp);
    setNegotiationWeeks(emp.semanas_contrato || 32);
    setNegotiationSalary(emp.salario_semanal || 2000);
    setNegotiationSector(emp.departamento || 'COMISSÃO TÉCNICA');
    setIsNegotiating(true);
  };

  const getNegotiationAcceptanceChance = (emp: CorporationStaff, proposedSalary: number, weeks: number) => {
    const baseExpected = emp.salario_semanal || 2000;
    
    // Higher efficiency demands more salary
    const efficiencyFactor = 1 + ((emp.nivel_eficiencia || 70) - 70) * 0.015;
    const adjustedExpected = Math.round(baseExpected * efficiencyFactor);
    
    // If proposed is below adjustedExpected, the chance drops fast
    const ratio = proposedSalary / adjustedExpected;
    
    let baseChance = 0;
    if (ratio >= 1.0) {
      baseChance = 75 + Math.min(25, Math.round((ratio - 1.0) * 150));
    } else {
      baseChance = Math.max(0, Math.round(75 * Math.pow(ratio, 2.5)));
    }
    
    // Impact of contract duration on risk
    let durationMod = 0;
    if (weeks < 24) {
      durationMod = -10;
    } else if (weeks > 64) {
      if (ratio < 1.1) {
        durationMod = -15;
      } else {
        durationMod = 5;
      }
    }
    
    // Prestige of the club (using playerTeam.popularity, 0 to 100)
    const prestigeBonus = Math.round(((playerTeam.popularity || 50) - 50) * 0.3); // ranges from -15 to +15
    
    const finalChance = Math.min(100, Math.max(0, baseChance + durationMod + prestigeBonus));
    return finalChance;
  };

  const handleApplyNegotiation = () => {
    if (!negotiatingEmployee) return;
    
    const chance = getNegotiationAcceptanceChance(negotiatingEmployee, negotiationSalary, negotiationWeeks);
    const roll = Math.floor(Math.random() * 101);
    
    if (roll <= chance) {
      // SUCCESS!
      // Assign appropriate cargo/role names depending on new department
      let nextCargo = negotiatingEmployee.cargo || 'Especialista';
      if (negotiatingEmployee.departamento !== negotiationSector) {
        switch (negotiationSector) {
          case 'COMISSÃO TÉCNICA':
            nextCargo = 'Auxiliar Técnico Operativo';
            break;
          case 'TI':
            nextCargo = 'Administrador de Rede LAN';
            break;
          case 'MARKETING':
            nextCargo = 'Coordenador de Expansão';
            break;
          case 'SAÚDE':
            nextCargo = 'Psicólogo Corporativo';
            break;
          case 'JURÍDICO':
            nextCargo = 'Consultor Legal Executivo';
            break;
          case 'OLHEIROS':
            nextCargo = 'Olheiro Integrado';
            break;
          case 'RH':
            nextCargo = 'Agente de Clima Corporativo';
            break;
          default:
            nextCargo = 'Especialista de Divisão';
        }
      }

      const isScout = negotiatingEmployee.id.startsWith('scout-') || negotiatingEmployee.id.includes('scout');
      if (isScout) {
        const saved = localStorage.getItem('legendshub_custom_scouts');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const updatedScoutsList = parsed.map((s: any) => {
              if (s.id === negotiatingEmployee.id) {
                return {
                  ...s,
                  salary: negotiationSalary,
                  contractRemaining: Math.max(1, Math.round(negotiationWeeks / 4))
                };
              }
              return s;
            });
            localStorage.setItem('legendshub_custom_scouts', JSON.stringify(updatedScoutsList));
          } catch (e) {}
        }
      }

      const updated = employees.map(e => {
        if (e.id === negotiatingEmployee.id) {
          return {
            ...e,
            semanas_contrato: negotiationWeeks,
            salario_semanal: negotiationSalary,
            departamento: negotiationSector,
            cargo: nextCargo
          };
        }
        return e;
      });
      
      setEmployees(updated);
      
      let extraMsg = "";
      if (negotiatingEmployee.departamento !== negotiationSector) {
        extraMsg = ` Transição de carreira para o setor de ${negotiationSector} efetuada com sucesso!`;
      }
      
      triggerNotification(
        "🤝 Contrato Assinado!",
        `Ótimo trabalho! ${negotiatingEmployee.nome} aceitou os termos propostos (Salário: $${negotiationSalary.toLocaleString('pt-BR')}/sem, Duração: ${negotiationWeeks} Semanas).` + extraMsg
      );
      setIsNegotiating(false);
      setNegotiatingEmployee(null);
    } else {
      // DECLINE!
      // penalize efficiency slightly to show frustration
      const updated = employees.map(e => {
        if (e.id === negotiatingEmployee.id) {
          return {
            ...e,
            nivel_eficiencia: Math.max(10, (e.nivel_eficiencia || 70) - 3)
          };
        }
        return e;
      });
      setEmployees(updated);
      
      triggerNotification(
        "❌ Cláusula Rejeitada",
        `${negotiatingEmployee.nome} recusou as condições propostas e ficou ligeiramente desmotivado (-3 eficiência). Melhore a proposta salarial!`
      );
    }
  };

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
    const isScout = id.startsWith('scout-') || id.includes('scout');
    if (isScout) {
      const saved = localStorage.getItem('legendshub_custom_scouts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.filter((s: any) => s.id !== id);
          localStorage.setItem('legendshub_custom_scouts', JSON.stringify(updated));
        } catch (e) {}
      }
    }
    const filterOut = employees.filter(e => e.id !== id);
    setEmployees(filterOut);
    triggerNotification("📡 Staff Desligado", `${name} foi demitido e não faz mais parte da listagem de despesas financeiras.`);
  };

  const handlePromoteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;

    let nextCargo = '';
    if (target.cargo === 'Advogado') nextCargo = 'Gerente Jurídico';
    else if (target.cargo === 'Analista de TI') nextCargo = 'Gerente de TI';
    else if (target.cargo === 'Analista de Marketing') nextCargo = 'Gerente de Marketing';
    else if (target.cargo === 'Coach') nextCargo = 'Head Coach';
    else if (target.cargo === 'Analista Macro') nextCargo = 'Coordenador Técnico';
    else if (target.cargo === 'Olheiro' || target.cargo.includes('Olheiro')) nextCargo = 'Olheiro Sênior';
    else if (target.cargo === 'Psicólogo') nextCargo = 'Coordenador Mental';
    else nextCargo = `Chefe Executivo / ${target.cargo}`;

    const isScout = id.startsWith('scout-') || id.includes('scout');
    if (isScout) {
      const saved = localStorage.getItem('legendshub_custom_scouts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.map((s: any) => {
            if (s.id === id) {
              const prevStars = s.stars || 3;
              const nextStars = Math.min(5, prevStars + 1);
              return {
                ...s,
                salary: Math.round(s.salary * 1.25),
                stars: nextStars
              };
            }
            return s;
          });
          localStorage.setItem('legendshub_custom_scouts', JSON.stringify(updated));
        } catch (e) {}
      }
    }

    const updated = employees.map(e => {
      if (e.id === id) {
        return {
          ...e,
          cargo: nextCargo,
          salario_semanal: Math.round(e.salario_semanal * 1.25),
          nivel_eficiencia: Math.min(100, (e.nivel_eficiencia || 70) + 12)
        };
      }
      return e;
    });

    setEmployees(updated);
    triggerNotification("📈 Cargos & Carreira Atualizados", `Parabéns! ${target.nome} foi promovido a ${nextCargo} com +12% de eficiência operacional e +25% de reajuste salarial.`);
  };

  const handleProlongEmployee = (id: string, extWeeks: number) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;

    const isScout = id.startsWith('scout-') || id.includes('scout');
    if (isScout) {
      const saved = localStorage.getItem('legendshub_custom_scouts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.map((s: any) => {
            if (s.id === id) {
              const prevRemaining = s.contractRemaining || 12;
              const extMonths = Math.max(1, Math.round(extWeeks / 4));
              return {
                ...s,
                contractRemaining: prevRemaining + extMonths
              };
            }
            return s;
          });
          localStorage.setItem('legendshub_custom_scouts', JSON.stringify(updated));
        } catch (e) {}
      }
    }

    const updated = employees.map(e => {
      if (e.id === id) {
        return {
          ...e,
          semanas_contrato: e.semanas_contrato + extWeeks
        };
      }
      return e;
    });

    setEmployees(updated);
    triggerNotification("🤝 Contrato Estendido!", `O contrato de ${target.nome} foi prolongado por mais ${extWeeks} semanas para consolidação do trabalho.`);
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
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* A. SLOT DE LIDERANÇA DINÂMICA (HEAD OF OPERATIONS / DIRETOR GERAL) - COLUMN SPAN 5 */}
            <div className={`p-5 rounded-2xl border-2 border-dashed lg:col-span-12 xl:col-span-5 flex flex-col justify-between transition-all ${
              isDark 
                ? 'bg-[#0a1424] shadow-[0_0_15px_rgba(0,180,255,0.04)]' 
                : 'bg-blue-50/40 shadow-sm'
            }`} style={{ borderColor: isDark ? 'rgba(0, 229, 255, 0.45)' : '#3b82f6' }}>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-sky-400" />
                    <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                      isDark ? 'text-sky-300' : 'text-blue-700 font-bold'
                    }`}>
                      Líder de Operações (Head of Operations)
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 font-mono uppercase bg-sky-500/10 text-[#00cbd6] rounded-md font-extrabold animate-pulse">
                    Mesa de Comando
                  </span>
                </div>

                {activeLeader ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {/* Functional role icon badge similar to central jobs */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                        isDark ? 'bg-slate-900 border-[#1e2d44] text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-600'
                      } shadow-sm`}>
                        {getStaffIcon(activeLeader.cargo, activeLeader.departamento, "w-7 h-7")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-sky-400 uppercase leading-none truncate">{activeLeader.nome}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-medium">{activeLeader.idade} anos</span>
                          <span className="text-slate-650">•</span>
                          <span className="text-[10px] text-slate-400 font-medium">{activeLeader.bandeira || '🇧🇷'} {activeLeader.nacionalidade || 'BR'}</span>
                        </div>
                        
                        {/* Star Rating visualization (1 to 5 stars) */}
                        <div className="flex items-center text-amber-400 mt-2 gap-1 bg-slate-900/40 py-1 px-2 rounded-md inline-flex border border-slate-800/10">
                          <span className="text-[9px] text-slate-500 font-mono font-black uppercase mr-1">Rank:</span>
                          {(() => {
                            const starsCount = Math.round((activeLeader.nivel_eficiencia || 70) / 10) / 2;
                            const fullStars = Math.floor(starsCount);
                            const halfStar = starsCount % 1 !== 0;
                            return Array.from({ length: 5 }).map((_, idx) => {
                              if (idx < fullStars) {
                                return <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />;
                              } else if (idx === fullStars && halfStar) {
                                return <StarHalf key={idx} className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse shrink-0" />;
                              } else {
                                return <Star key={idx} className="w-3 h-3 text-slate-600 shrink-0" />;
                              }
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounding-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[8.5px] font-mono tracking-widest px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] rounded-md font-black uppercase">
                          {activeLeader.cargo ? activeLeader.cargo.toUpperCase() : 'ESPECIALISTA'}
                        </span>
                        <span className="text-[9px] text-[#00E5FF]/70 uppercase font-mono font-black">
                          {activeLeader.departamento || 'OPERACIONAL'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 leading-tight">
                        Espec.: <span className="text-slate-350 dark:text-slate-250 font-bold">{activeLeader.especialidade}</span>
                      </div>

                      {/* Dynamic Calculated Operational Leadership Bonus banner */}
                      <div className={`mt-3.5 p-3 rounded-xl border flex items-start gap-2.5 transition-all duration-300 ${
                        isDark ? 'bg-cyan-950/20 border-cyan-500/25' : 'bg-cyan-50 border-cyan-200'
                      }`}>
                        <Sparkles className="w-4 h-4 text-cyan-405 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9.5px] font-black uppercase tracking-wider text-cyan-400">
                            EFICÁCIA DINÂMICA ({getLeaderBonusInfo(activeLeader).titulo})
                          </p>
                          <p className={`text-[10px] font-medium mt-1 leading-snug ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {getLeaderBonusInfo(activeLeader).bonus}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-slate-800/20">
                      <div>
                        <span className="text-[7.5px] text-slate-400 block uppercase font-mono font-bold font-black">Salário do Cargo</span>
                        <span className="font-mono font-extrabold text-red-400 text-xs">$ {activeLeader.salario_semanal?.toLocaleString()}/sem</span>
                      </div>
                      <div>
                        <span className="text-[7.5px] text-slate-400 block uppercase font-mono font-bold font-black">Duração de Vínculo</span>
                        <span className="font-bold text-slate-300 dark:text-slate-200">{activeLeader.semanas_contrato} sem</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 border border-blue-500/20 animate-pulse">
                      <Award className="w-8 h-8 shrink-0" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-sky-405 tracking-wider">Mesa de Comando Vaga</h4>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                        Nenhum funcionário do Staff está assumindo a liderança operativa. Clique em <strong className="text-sky-400">PROMOVER</strong> em qualquer card subordinado abaixo para promover o funcionário e aplicar o bônus departamental do clube!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {activeLeader && (
                <div className="mt-5 pt-3 border-t border-[#1e2d44] flex gap-2">
                  <button
                    onClick={() => {
                      setLeaderId(null);
                      triggerNotification("📋 Mudança na Liderança", "Liderança de operações destituída com sucesso do Gaming Office.");
                    }}
                    className={`flex-1 py-2 rounded-xl text-[9px] uppercase font-mono font-black tracking-widest text-center transition-all duration-200 cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
                        : 'bg-white border border-slate-300 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    DESTITUIR LÍDER
                  </button>
                  <button
                    onClick={() => handleOpenNegotiation(activeLeader)}
                    className="flex-1 py-2 bg-amber-600 hover:bg-[#ffb000] text-black rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all cursor-pointer shadow-sm"
                  >
                    🚀 NEGOCIAR
                  </button>
                </div>
              )}
            </div>

            {/* B. GRADE DE FUNCIONÁRIOS SUBORDINADOS ATIVOS (GRID DE DUAS COLUNAS) - COLUMN SPAN 7 */}
            <div className={`p-5 rounded-2xl border lg:col-span-12 xl:col-span-7 flex flex-col justify-between ${
              isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 gap-2">
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                      <Users className="w-4 h-4 text-cyan-400" />
                      Grade de Funcionários Ativos ({employees.filter(e => e.id !== leaderId).length})
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-0.5">Profissionais corporativos e táticos subordinados que prestam assessoria operacional.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('Central de Empregos');
                      } else {
                        setIsHiringModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-[#00E5FF] hover:text-black hover:scale-[1.02] text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Central de Empregos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {employees.filter(e => e.id !== leaderId).length > 0 ? (
                    employees.filter(e => e.id !== leaderId).map(employee => {
                      const starsCount = Math.round((employee.nivel_eficiencia || 70) / 10) / 2;
                      const fullStars = Math.floor(starsCount);
                      const halfStar = starsCount % 1 !== 0;

                      return (
                        <div key={employee.id} className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                          isDark ? 'bg-[#070d19] border-[#1e2d44] hover:bg-[#09152a]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                        } transition-all duration-200`}>
                          <div className="flex items-start gap-3">
                            {/* Functional role icon badge similar to central jobs */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isDark ? 'bg-[#0d1b3e] border-[#1e2d44] text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-600'
                            } shadow-xs`}>
                              {getStaffIcon(employee.cargo, employee.departamento, "w-5 h-5")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs uppercase font-extrabold text-[#00cbd6] truncate" title={employee.nome}>
                                {employee.nome}
                              </h4>
                              
                              <p className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-blue-400 mt-0.5 leading-none">
                                {employee.cargo ? employee.cargo.toUpperCase() : 'ESPECIALISTA'}
                              </p>

                              {/* Star Ratings */}
                              <div className="flex items-center text-amber-400 mt-1.5">
                                {Array.from({ length: 5 }).map((_, idx) => {
                                  if (idx < fullStars) {
                                    return <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />;
                                  } else if (idx === fullStars && halfStar) {
                                    return <StarHalf key={idx} className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse shrink-0" />;
                                  } else {
                                    return <Star key={idx} className="w-3 h-3 text-slate-600 shrink-0" />;
                                  }
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 border-t border-slate-800/30 pt-2 text-[9.5px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400 uppercase text-[8px] font-bold">Duração Contrato:</span>
                              <span className="text-slate-300 dark:text-slate-200 font-bold">{employee.semanas_contrato} Semanas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 uppercase text-[8px] font-bold">Salário Semanal:</span>
                              <span className="text-rose-400 font-mono font-bold">$ {employee.salario_semanal?.toLocaleString()}/sem</span>
                            </div>
                          </div>

                          {/* Action footer tray for subordinate staff */}
                          <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-[#1e2d44]/30">
                            {/* FIRE STAFF */}
                            <button
                              onClick={() => {
                                if (confirm(`Deseja realmente demitir ${employee.nome}?`)) {
                                  handleFireEmployee(employee.id, employee.nome);
                                }
                              }}
                              className={`p-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                                isDark ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50'
                              }`}
                              title="Demitir profissional"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>

                            {/* NEGOTIATE BUTTON */}
                            <button
                              onClick={() => handleOpenNegotiation(employee)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition duration-150 cursor-pointer ${
                                isDark 
                                  ? 'bg-[#00ebd6]/10 text-[#00cbd6] hover:bg-[#00ebd6]/20 border border-[#00cbd6]/30' 
                                  : 'bg-emerald-50 text-emerald-850 hover:bg-emerald-100 border border-emerald-250'
                              }`}
                              title="Negociar Salário, Vínculo ou Setor"
                            >
                              NEGOCIAR
                            </button>

                            {/* SELECT AS OPERATIONS LEADER */}
                            <button
                              onClick={() => {
                                setLeaderId(employee.id);
                                triggerNotification("👑 Novo Líder Escalado", `${employee.nome} assumiu o cargo de Líder de Operações.`);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition duration-150 ${
                                isDark 
                                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/25 border border-[#00E5FF]/30' 
                                  : 'bg-blue-100 text-indigo-700 hover:bg-blue-200 border border-blue-200'
                              }`}
                            >
                              <Award className="w-3 h-3 shrink-0" /> PROMOVER
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-10 text-slate-500 text-[10px] uppercase font-black border border-dashed border-slate-800/40 rounded-xl">
                      Nenhum outro funcionário na grade corporativa. Contrate novos acima.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. REFORMULAÇÃO COMPLETA: DIREITOS DE TELEVISÃO & TRANSMISSÃO EM PAISAGEM */}
        <section className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                DIREITOS DE TV & TRANSMISSÃO (SLOTS COMERCIAIS HORIZONTAIS)
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Painel de slots de TV estendidos lateralmente. Libere slots para novas avaliações de proposta de transmissão de central corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {tvSlots.map((slot, idx) => {
              const isOccupied = slot.status === 'OCUPADO';
              return (
                <div key={slot.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 relative overflow-hidden transition-all duration-200 h-full ${
                  isOccupied 
                    ? isDark 
                      ? 'border-cyan-500/30 bg-cyan-950/20 shadow-[inset_0_0_12px_rgba(0,180,255,0.05)]' 
                      : 'border-cyan-200 bg-cyan-50/50 shadow-xs'
                    : 'border-dashed border-slate-700 bg-slate-800/10 hover:bg-slate-800/20'
                }`}>
                  <div className="absolute top-2.5 right-3 text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-800/30 px-1.5 py-0.5 rounded font-mono">
                    SLOT {idx + 1}
                  </div>

                  {isOccupied ? (
                    <div className="space-y-4 flex flex-col justify-between h-full">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono tracking-widest font-black uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md leading-none inline-block">
                          ATV. COMERCIAL
                        </span>
                        <h4 className="text-xs font-black text-[#00cbd6] mt-1 pr-16 truncate leading-tight">{slot.emissora}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] border-y border-slate-800/15 dark:border-slate-800/60 py-2.5">
                        <div>
                          <span className="text-[7.5px] text-slate-400 block mb-0.5 uppercase tracking-wide">Repasse Semanal</span>
                          <span className="text-emerald-400 font-mono font-extrabold text-xs">$ {slot.repasse_semanal?.toLocaleString()}/sem</span>
                        </div>
                        <div>
                          <span className="text-[7.5px] text-slate-400 block mb-0.5 uppercase tracking-wide">Duração restante</span>
                          <span className="font-extrabold text-slate-305 font-mono text-xs">{slot.vigencia_restante} semanas</span>
                        </div>
                      </div>

                      <div className="text-[9.5px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                        <span>Metas: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{slot.meta_contratual || 'Ficar no Top 4 do campeonato ou superior.'}</strong></span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/15 dark:border-slate-800/40">
                        <button
                          onClick={() => handleTerminateTv(slot.id, slot.multa_rescisao || 20000)}
                          className="w-full py-1.5 text-[8.5px] font-black uppercase tracking-widest bg-red-650/15 text-red-400 hover:bg-red-500 hover:text-white rounded border border-red-500/30 transition duration-150 cursor-pointer"
                        >
                          Rescindir (Multa: $ {slot.multa_rescisao?.toLocaleString()})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col justify-center items-center text-center gap-3.5 h-full">
                      <div className="p-3.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 shadow-sm animate-pulse">
                        <Tv className="w-6 h-6 shrink-0" />
                      </div>
                      <div>
                        <div className="text-[10px] text-yellow-500 uppercase tracking-widest font-black">[ SLOT VAGO ]</div>
                        <p className="text-[8.5px] text-slate-400 mt-1 max-w-[180px] leading-relaxed mx-auto">
                          Disponível para propostas econômicas e acordos de transmissão de central corporativa.
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenTvProposal(slot.id)}
                        className="px-4 py-1.5 mt-2 bg-[#00cbd6] hover:bg-cyan-500 hover:scale-[1.03] text-black font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-all duration-150"
                      >
                        Avaliar Propostas
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
            </div>

            <RssFeedX tweets={unifiedFeed.tweets} isDark={isDark} />
          </div>

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

      {/* 2. JANELA POP-UP DE NEGOCIAÇÃO DE CONTRATO (CORPORATIVO) */}
      {isNegotiating && negotiatingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div 
            className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border animate-slide-in relative ${
              isDark ? 'bg-[#0a1424] border-[#00cbd6]/30 text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-700/30">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
                  Mesa de Negociação Corporativa
                </span>
                <h3 className={`text-base font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Negociar Termos: {negotiatingEmployee.nome}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsNegotiating(false);
                  setNegotiatingEmployee(null);
                }}
                className="text-gray-400 hover:text-white font-extrabold text-[15px] p-2 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5">
              
              {/* CURRENT STATISTICS INFOCARD */}
              <div className={`p-3.5 rounded-xl border flex justify-between items-center text-xs ${
                isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[7.5px] text-slate-400 block uppercase font-bold">Função Atual</span>
                  <span className="font-mono text-[10px] uppercase font-black text-blue-400">
                    {negotiatingEmployee.cargo || 'Especialista'} ({negotiatingEmployee.departamento})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[7.5px] text-slate-400 block uppercase font-bold">Nível Eficiência</span>
                  <span className="font-mono text-[11px] font-extrabold text-[#00cbd6]">
                    {negotiatingEmployee.nivel_eficiencia}% OVR
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[7.5px] text-slate-400 block uppercase font-bold font-black">Salário Atual</span>
                  <span className="font-mono text-[11px] font-extrabold text-rose-450">
                    $ {negotiatingEmployee.salario_semanal?.toLocaleString('pt-BR')}/sem
                  </span>
                </div>
              </div>

              {/* 1. DUARATION SLIDER */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Duração do Contrato (Vínculo)
                  </label>
                  <span className="text-[10px] font-mono font-black text-amber-500">
                    {negotiationWeeks} Semanas (~{Math.round(negotiationWeeks / 32 * 10) / 10} Splits)
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  step="4"
                  value={negotiationWeeks}
                  onChange={(e) => setNegotiationWeeks(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-805 rounded-lg cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                  <span>12s (Curto)</span>
                  <span>32s (1 Split)</span>
                  <span>48s (Meio)</span>
                  <span>64s (2 Splits)</span>
                  <span>96s (Máximo)</span>
                </div>
              </div>

              {/* 2. SALARY PROPOSAL FIELD */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Proposta de Salário Semanal
                  </label>
                  <span className="text-[10.5px] text-red-400 font-mono font-bold">
                    Total Folha: +$ {negotiationSalary.toLocaleString('pt-BR')}/sem
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="200"
                    max="100000"
                    value={negotiationSalary}
                    onChange={(e) => setNegotiationSalary(Math.max(200, parseInt(e.target.value) || 0))}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-black font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-[#070d19]'
                    }`}
                  />
                </div>
                {/* Micro Adjustment Increments */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    { label: '-$100', val: -100 },
                    { label: '+$100', val: 100 },
                    { label: '+$500', val: 500 },
                    { label: '+$1.000', val: 1000 },
                    { label: 'Estimativa Justa', val: 'reset' }
                  ].map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => {
                        if (btn.val === 'reset') {
                          const baseExp = negotiatingEmployee.salario_semanal || 2000;
                          const efficiencyFactor = 1 + ((negotiatingEmployee.nivel_eficiencia || 70) - 70) * 0.015;
                          setNegotiationSalary(Math.round(baseExp * efficiencyFactor));
                        } else {
                          setNegotiationSalary(prev => Math.max(200, prev + (btn.val as number)));
                        }
                      }}
                      className={`px-2 py-1 rounded text-[8px] font-mono font-black border transition cursor-pointer ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. SETOR DE SELEÇÃO E TRANSIÇÃO DE CARREIRA */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Atribuição de Setor / Transição de Carreira
                </label>
                <select
                  value={negotiationSector}
                  onChange={(e) => setNegotiationSector(e.target.value as CorporationStaff['departamento'])}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold leading-none focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                  }`}
                >
                  <option value="COMISSÃO TÉCNICA">Comissão Técnica (Coach/Analistas)</option>
                  <option value="TI">Tecnologia de Informação (LAN & Performance)</option>
                  <option value="MARKETING">Marketing & Campanhas Digitais</option>
                  <option value="SAÚDE">Saúde e Psicologia de Elenco</option>
                  <option value="JURÍDICO">Compliance & Departamento Jurídico</option>
                  <option value="OLHEIROS">Olheiros e Inteligência de Mercado (Scouting)</option>
                  <option value="RH">Recursos Humanos & Relações Públicas (PR)</option>
                </select>
                <p className="text-[8px] leading-tight text-slate-500 mt-1.5">
                  {negotiationSector === negotiatingEmployee.departamento ? (
                    <span className="text-emerald-500 font-semibold">✓ Permanecer na divisão original ({negotiatingEmployee.departamento}). Tudo estável.</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">⚡ Alterar divisão! O funcionário migrará de cargo e passará a contribuir com passivos e bônus da nova divisão. Se removido de Olheiro, sairá das missões de Scouting.</span>
                  )}
                </p>
              </div>

              {/* ACCEPTANCE CHANCE BOX (REAL-TIME ESTIMATION) */}
              {(() => {
                const probability = getNegotiationAcceptanceChance(negotiatingEmployee, negotiationSalary, negotiationWeeks);
                let bgStyle = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                let badgeStr = "CRÍTICO";
                let detailStr = "Termos muito desvantajosos! Risco iminente de desmotivar o profissional.";
                if (probability >= 80) {
                  bgStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  badgeStr = "ALTA CHANCE";
                  detailStr = "Termos excelentes! O profissional certamente firmará o novo compromisso.";
                } else if (probability >= 50) {
                  bgStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                  badgeStr = "MODERADO";
                  detailStr = "A proposta está equilibrada, há chances tangíveis de aceitação.";
                }

                return (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${bgStyle}`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-black tracking-tight font-mono">
                          PROBABILIDADE DE SUCESSO: {probability}%
                        </span>
                        <span className="px-1.5 py-0.5 text-[7.5px] font-black tracking-widest rounded uppercase bg-current/10 font-bold leading-none">
                          {badgeStr}
                        </span>
                      </div>
                      <p className="text-[9.5px] mt-1 font-semibold leading-relaxed opacity-90 font-mono">
                        {detailStr} (Expectativa ajustada à eficiência e prestígio do clube: <strong className="underline">+{Math.round(((playerTeam.popularity || 50) - 50) * 0.3)}% pelo renome da organização</strong>).
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Footer Buttons */}
            <div className="mt-6 pt-3.5 border-t border-slate-700/30 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsNegotiating(false);
                  setNegotiatingEmployee(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  isDark ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                }`}
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApplyNegotiation}
                className="flex-1 py-2.5 bg-[#00E5FF] hover:bg-cyan-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 animate-pulse font-mono shadow-md cursor-pointer"
              >
                APLICAR CONTRATO
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, Zap, AlertCircle, Sparkles, Heart, DollarSign, Megaphone, 
  Percent, Lock, Scale, Clock, AlertTriangle, Globe, Terminal
} from 'lucide-react';
import { GameState, Team } from '../types';
import { getOrCreateWeekFeedState, RssFeedX } from '../utils/feedHelper';
import { formatMoney, getCurrencySymbol, getCaixaFormatadoHud } from '../utils/currency';

interface ComunidadeTabProps {
  gameState: GameState;
  onUpdateGameState: (state: GameState) => void;
  triggerNotification: (title: string, desc: string) => void;
  theme?: 'light' | 'dark';
}

export function ComunidadeTab({ gameState, onUpdateGameState, triggerNotification, theme }: ComunidadeTabProps) {
  const { teams, playerTeamId } = gameState;
  const playerTeam = teams.find(t => t.id === playerTeamId);

  // State to track active subview (Dashboard vs Crisis Management)
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'crises'>('dashboard');

  // Collapse or expand state of JSON payload console
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);

  // State to track language
  const [langState, setLangState] = useState<'pt' | 'es' | 'en'>(() => {
    const saved = localStorage.getItem('legendshub_lang');
    if (saved === 'es' || saved === 'en' || saved === 'pt') {
      return saved as 'pt' | 'es' | 'en';
    }
    return 'pt';
  });

  // Hot sync with language switcher
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('legendshub_lang');
      if (saved && saved !== langState && (saved === 'pt' || saved === 'en' || saved === 'es')) {
        setLangState(saved as 'pt' | 'es' | 'en');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [langState]);

  // Determine active language dynamically
  const settingsLang = (gameState as any).settings?.language;
  const lang: 'pt' | 'es' | 'en' = (() => {
    if (settingsLang) {
      const lower = settingsLang.toLowerCase();
      if (lower.startsWith('pt')) return 'pt';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
    return langState;
  })();

  const unifiedFeed = getOrCreateWeekFeedState(gameState, lang);

  // Determine active theme dynamically (monitors both local prop and settings object)
  const settingsTheme = (gameState as any).settings?.theme;
  const isDark = !(theme === 'light' || settingsTheme === 'light_mode' || settingsTheme === 'light');

  const colors = {
    themeActive: isDark ? "DARK_MODE" : "LIGHT_MODE",
    bgContainer: isDark ? "bg-[#0b1324] border-[#1e2d44]" : "bg-white border-slate-200 shadow",
    bgCard: isDark ? "bg-[#0a1424] border-[#1e2d44]" : "bg-slate-50 border-slate-250/70 shadow-sm",
    bgInner: isDark ? "bg-[#070d19] border-slate-800" : "bg-white border-slate-200",
    bgDarker: isDark ? "bg-[#040810] border-slate-850" : "bg-slate-100/70 border-slate-200",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textMuted: isDark ? "text-slate-500" : "text-slate-405",
    textAccent: isDark ? "text-[#00E5FF]" : "text-blue-600",
    borderPrimary: isDark ? "border-[#1e2d44]" : "border-slate-200",
    borderInner: isDark ? "border-slate-800" : "border-slate-200",
    btnPrimary: isDark ? "bg-blue-600 hover:bg-[#00E5FF] hover:text-black text-white" : "bg-blue-600 hover:bg-blue-700 text-white",
    badgeAccent: isDark ? "bg-cyan-500/10 text-[#00E5FF] border-[#00E5FF]/20" : "bg-blue-50 text-blue-700 border-blue-200/60",
    badgeDanger: isDark ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-700 border-rose-200/60",
    badgeSuccess: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };

  // Track resolved corporate crises list
  const [resolvedCrises, setResolvedCrises] = useState<string[]>(() => {
    const saved = localStorage.getItem(`resolved_crises_${playerTeamId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Local state for tweets feed (unified)
  const [localTweets, setLocalTweets] = useState<any[]>([]);

  // Translations
  const TRANSLATIONS = {
    pt: {
      title: "CENTRO DE GESTÃO DE COMUNIDADES E TORCIDAS",
      subtitle: "Monitore o humor dos fãs, controle o apoio popular da torcida organizada e execute campanhas exclusivas de engajamento social.",
      dashBtn: "DASHBOARD DE COMUNIDADES",
      crisesBtn: "GESTÃO DE CRISES",
      fansSupport: "Satisfação da Torcida",
      members: "Quadro de Sócio-Torcedores",
      reputation: "Mídia & Sentimento Geral",
      excellent: "EXCELENTE 🔥",
      stable: "ESTÁVEL 🤝",
      pressured: "PRESSIONADO ⏳",
      membersStatus: "INSCRITOS",
      repStatus: "REPUTAÇÃO",
      descFans: "Torcedores felizes apoiam o time mesmo na adversidade e lotam a arena, aumentando a receita de bilheteria e vendas de camisas.",
      descMembers: "O tamanho da fã-base cresce em conformidade com sua popularidade na mídia geral e os resultados de vitórias consecutivas.",
      descRep: "A percepção externa atrai novos patrocinadores de elite e possibilita a contratação de astros ou veteranos badalados.",
      activeMarketing: "Ações Ativas de Marketing Comunitário",
      costLabel: "Custo do Evento",
      launchBtn: "[LANÇAR CAMPANHA]",
      feedTitle: "REDE SOCIAL: FEED DO X (TWITTER)",
      liveBadge: "Ao Vivo",
      noTweets: "Nenhum comentário detectado no feed.",
      organizadasTitle: "NOVO CARD DE GESTÃO DE MASSA",
      organizadasSub: "Gestão de Relacionamento da Torcida",
      supportLabel: "Nível de Apoio",
      unconditionalSupport: "APOIO ORGANIZADO (95%)",
      actionsTorcida: "Opções de Ações de Liderança Presenciais:",
      mosaicTitle: "FINANCIAR MOSAICO E BANDEIRÕES",
      mosaicDesc: "Aumenta a pressão de arena em jogos em casa, reduzindo levemente o bônus de performance mental do time rival.",
      meetingTitle: "REUNIÃO DIRETORIA & LIDERANÇAS",
      meetingDesc: "Alinha expectativas e acalma torcedores após derrotas amargas. Estabiliza a queda abrupta da Satisfação da Torcida.",
      freeCost: "Sem Custo",
      launchSuccess: "📣 Campanha Concluída!",
      insufficientFunds: "❌ Saldo Insuficiente",
      budgetProblem: "Seu clube não possui fundos suficientes para lançar esta ação.",
      jsonPayloadTitle: "Visualizar Carga Útil do Motor de Dados",
      jsonPayloadDesc: "Toda modificação é persistida imediatamente no banco de dados local do Windows (Auto-Save instantâneo).",
      apiSimTerminal: "Simulador de Payload JSON",
      mosaicSuccess: "📣 Mosaico Financiado!",
      mosaicSuccessDesc: "Os bandeirões e mosaico 3D estão prontos! A moral da torcida organizada subiu!",
      meetingSuccess: "📣 Reunião Concluída!",
      meetingSuccessDesc: "As lideranças concordam em dar voto de confiança à gestão técnica pela temporada corrente!",
      solveCrisis: "Resolver Crise",
      solvedCrisisBadge: "Saneada",
      crisisTitleMain: "SALA DE SEVERIDADE & GESTÃO DE CRISES CORPORATIVAS",
      crisisSubtitleMain: "Enfrente incidentes de relações públicas, polêmicas digitais e vazamentos estratégicos antes que destruam a reputação da organização.",
      activeCrisisBadge: "Ativa",
      noCrises: "Nenhuma crise corporativa ativa detectada! A reputação do clube está intacta."
    },
    en: {
      title: "COMMUNITY & FAN BASE MANAGEMENT CENTER",
      subtitle: "Monitor fan sentiment, control the organized supporters support rate, and run exclusive social engagement campaigns.",
      dashBtn: "COMMUNITY DASHBOARD",
      crisesBtn: "CRISIS MANAGEMENT",
      fansSupport: "Fan Satisfaction",
      members: "Supporters Club Members",
      reputation: "Media & Overall Sentiment",
      excellent: "EXCELLENT 🔥",
      stable: "STABLE 🤝",
      pressured: "UNDER PRESSURE ⏳",
      membersStatus: "REGISTERED",
      repStatus: "REPUTATION",
      descFans: "Happy fans support the team even during adversity and fill the arena, boosting ticket and merchandise sales.",
      descMembers: "The size of your fanbase grows in accordance with overall media popularity and consecutive victory streaks.",
      descRep: "External perception attracts elite sponsors and allows the signing of high-profile superstars or veterans.",
      activeMarketing: "Active Community Marketing Campaigns",
      costLabel: "Event Cost",
      launchBtn: "[LAUNCH CAMPAIGN]",
      feedTitle: "SOCIAL NETWORKS: FEED X (TWITTER)",
      liveBadge: "Live",
      noTweets: "No community comments found on the feed.",
      organizadasTitle: "NEW MASS MANAGEMENT CARD",
      organizadasSub: "Supporters Relationship Management",
      supportLabel: "Support Level",
      unconditionalSupport: "ORGANIZED SUPPORT (95%)",
      actionsTorcida: "Direct Leadership Action Options:",
      mosaicTitle: "FINANCE MOSAIC & BANNER DISPLAY",
      mosaicDesc: "Increases home arena atmosphere, slightly decreasing mental performance bonus of rival teams.",
      meetingTitle: "BOARD & FAN LEADERS MEETING",
      meetingDesc: "Aligns expectations and calms fans down after harsh defeats. Stabilizes abrupt satisfaction drops.",
      freeCost: "No Cost",
      launchSuccess: "📣 Campaign Executed!",
      insufficientFunds: "❌ Insufficient Funds",
      budgetProblem: "Your club does not have enough funds for this action.",
      jsonPayloadTitle: "View Data Engine Payload",
      jsonPayloadDesc: "Every modification is saved immediately to the local Windows database (instant Auto-Save).",
      apiSimTerminal: "JSON Payload Simulator",
      mosaicSuccess: "📣 Mosaic Financed!",
      mosaicSuccessDesc: "The custom banners and 360° mosaic are ready! Organized fan club morale has surged!",
      meetingSuccess: "📣 Meeting Concluded!",
      meetingSuccessDesc: "Supporters club leaders have agreed to back the current technical management's long-term plan!",
      solveCrisis: "Resolve Crisis",
      solvedCrisisBadge: "Resolved",
      crisisTitleMain: "SEVERITY PR ROOM & CORPORATE CRISIS MANAGEMENT",
      crisisSubtitleMain: "Face toxic incidents, digital controversies, and tactical leaks before they damage your brand reputation.",
      activeCrisisBadge: "Active",
      noCrises: "No active corporate crisis found! Brand reputation is clean."
    },
    es: {
      title: "CENTRO DE GESTIÓN DE COMUNIDADES Y AFICIONADOS",
      subtitle: "Monitorea el humor de los fans, controla el apoyo de la barra brava organizada y realiza campañas de marketing social.",
      dashBtn: "TABLERO DE COMUNIDADES",
      crisesBtn: "GESTIÓN DE CRISIS",
      fansSupport: "Satisfacción de los Fans",
      members: "Club de Socios Aficionados",
      reputation: "Media y Sentimiento General",
      excellent: "EXCELENTE 🔥",
      stable: "ESTABLE 🤝",
      pressured: "PRESIONADO ⏳",
      membersStatus: "INSCRITOS",
      repStatus: "REPUTACIÓN",
      descFans: "Los aficionados felices apoyan al equipo incluso en momentos difíciles y llenan el estadio, aumentando ingresos.",
      descMembers: "El tamaño de la afición crece de acuerdo con la popularidad general de los medios y victorias consecutivas.",
      descRep: "La reputación externa atrae patrocinadores de élite y posibilita la incorporación de estrellas o veteranos cotizados.",
      activeMarketing: "Campañas Activas de Marketing Comunitario",
      costLabel: "Costo del Evento",
      launchBtn: "[LANZAR CAMPAÑA]",
      feedTitle: "RED SOCIAL: FEED DE X (TWITTER)",
      liveBadge: "En Vivo",
      noTweets: "No se encontraron comentarios en el feed.",
      organizadasTitle: "NUEVO CARD DE GESTIÓN DE MASAS",
      organizadasSub: "Gestión de Relación con la Barra Brava",
      supportLabel: "Nivel de Apoyo",
      unconditionalSupport: "APOYO ORGANIZADO (95%)",
      actionsTorcida: "Opciones de Acciones de Liderazgo Directo:",
      mosaicTitle: "FINANCIAR MOSAICO Y BANDERAS GIGANTES",
      mosaicDesc: "Aumenta la presión ambiental en casa, reduciendo levemente la confianza mental del equipo rival.",
      meetingTitle: "REUNIÓN DE DIRECTIVA Y LÍDERES",
      meetingDesc: "Alinea expectativas y tranquiliza a la afición tras derrotas amargas. Estabiliza caídas rápidas de felicidad.",
      freeCost: "Sin Costo",
      launchSuccess: "📣 ¡Campaña Realizada!",
      insufficientFunds: "❌ Saldo Inuficiente",
      budgetProblem: "Su club no tiene fondos suficientes para realizar esta acción.",
      jsonPayloadTitle: "Ver Carga de Datos útil del Motor",
      jsonPayloadDesc: "Toda modificación se guarda inmediatamente en la base de datos de Windows (Guardado automático).",
      apiSimTerminal: "Simulador de Payload JSON",
      mosaicSuccess: "📣 ¡Mosaico Financiado!",
      mosaicSuccessDesc: "¡Las banderas gigantes y el mosaico 3D listos! ¡Subió la moral de la barra brava!",
      meetingSuccess: "📣 ¡Reunión Finalizada!",
      meetingSuccessDesc: "¡Los líderes de la barra brava acordaron dar un voto de confianza a la gestión técnico-deportiva actual!",
      solveCrisis: "Resolver Crisis",
      solvedCrisisBadge: "Resuelta",
      crisisTitleMain: "SALA DE PR Y GESTIÓN DE CRISIS CORPORATIVAS",
      crisisSubtitleMain: "Gestione incidentes tóxicos, polémicas digitales y filtraciones de tácticas antes de que destruyan su marca.",
      activeCrisisBadge: "Activa",
      noCrises: "¡No se detectaron crisis corporativas activas! La reputación del club está intacta."
    }
  };

  const t = TRANSLATIONS[lang];

  // Campaign datasets
  const campaignTrans = {
    pt: {
      meetup: { title: "ENCONTRO DE FÃS PRESENCIAL", desc: "Fotos e autógrafos com o time principal na Gaming House." },
      tickets: { title: "DISTRIBUIÇÃO DE INGRESSOS SOCIAIS", desc: "Distribui ingressos grátis para estudantes locais." },
      charity: { title: "AÇÃO SOCIAL SOLIDÁRIA", desc: "Campanha comunitária beneficente em nome do clube." },
      streamers: { title: "TRANSMISSÃO COM INFLUENCIADORES", desc: "Contrata criadores para reações de lives." },
      fanfest: { title: "ORGANIZAR FAN FEST (DIAS DE PLAYOFF)", desc: "Telões de LED de alta definição públicos." },
      globaltour: { title: "LEAGUE OF LEGENDS TOUR GLOBAL", desc: "Caravana de amistosos por LCK, LPL e LEC." }
    },
    en: {
      meetup: { title: "MEET AND GREET FAN SESSION", desc: "Autographs and photos with starting lineup at Gaming House." },
      tickets: { title: "SOCIAL TICKETS DISTRIBUTION", desc: "Donate stadium tickets to youth student bases." },
      charity: { title: "SOLIDARITY CHARITY DRIVE", desc: "Philanthropy donation campaign under brand label." },
      streamers: { title: "PREMIUM STREAMER WATCH PARTY", desc: "Host tier-1 streamers for live react and scrim casts." },
      fanfest: { title: "ORGANIZE FAN FEST (PLAYOFF DAYS)", desc: "Giant public LED screens in street festivals." },
      globaltour: { title: "LEAGUE OF LEGENDS GLOBAL TOUR", desc: "Amicable showmatches against LCK, LPL, and LEC teams." }
    },
    es: {
      meetup: { title: "ENCUENTRO DE FANS PRESENCIAL", desc: "Se saca fotos con la plantilla titular en la sede." },
      tickets: { title: "DISTRIBUCIÓN DE ENTRADAS SOCIALES", desc: "Aporta entradas gratuitas para estudiantes de recursos limitados." },
      charity: { title: "ACCIÓN SOCIAL SOLIDÁRIA", desc: "Donativos benéficos locales promovidos por el club." },
      streamers: { title: "TRANSMISIÓN CON INFLUENCERS", desc: "Retransmisiones y análisis en vivo con streamers famosos." },
      fanfest: { title: "ORGANIZAR FAN FEST (DÍAS DE PLAYOFF)", desc: "Fórmula de pantallas LED gigantes presenciales." },
      globaltour: { title: "COLLECTIVE GLOBAL TOUR RIVALS", desc: "Amistosos e interacciones de exhibición por LCK/LPL/LEC." }
    }
  };

  const campaignsMap = campaignTrans[lang];

  // Preset Corporate Crises List
  const crisesData = [
    {
      id: "patrocinador_panico",
      title: {
        pt: "Patrocinador em Pânico",
        en: "Sponsor in Panic",
        es: "Patrocinador en Pánico"
      },
      desc: {
        pt: "O principal patrocinador do clube ameaça rescindir devido ao comportamento polêmico do elenco no chat global do jogo.",
        en: "The primary club sponsor is threatening to terminate after the roster's trash-talking behavior in global chat.",
        es: "El patrocinador principal del club amenaza con rescindir debido al comportamiento polémico de la de la plantilla."
      },
      cost: 15000,
      supportBoost: 5,
      popBoost: 15,
      rewardDesc: {
        pt: "+15% Sentimento Geral & Aliança de Mídia",
        en: "+15% Media Reputation & Retain Partner",
        es: "+15% Reputación en Medios & Pacto Comercial"
      }
    },
    {
      id: "scrim_vazamento",
      title: {
        pt: "Vazamento de Treino Tático",
        en: "Tactical Scrim Leak",
        es: "Filtración de Entrenamiento"
      },
      desc: {
        pt: "Gravações sigilosas do treino tático contra o rival direto vazaram nas comunidades do Reddit e Discord.",
        en: "Confidential scrim recordings against a direct rival have leaked on Reddit and Discord community boards.",
        es: "Grabaciones secretas de la práctica contra el rival directo se filtraron en los foros externos."
      },
      cost: 7500,
      supportBoost: 12,
      popBoost: 5,
      rewardDesc: {
        pt: "+12% Satisfação da Torcida ao criptografar rede",
        en: "+12% Fan Support after securing network protocols",
        es: "+12% Apoyo de Afición al encriptar servidor"
      }
    },
    {
      id: "polemica_entrevista",
      title: {
        pt: "Declaração Polêmica do Atleta",
        en: "Athlete Interview Backlash",
        es: "Declaración Polémica de Atleta"
      },
      desc: {
        pt: "Um jogador declarou publicamente em stream pessoal que a diretoria do time 'está ultrapassada'.",
        en: "A key team member publicly complained on personal streams that the club board is 'outdated'.",
        es: "Un jugador declaró en stream que el consejo de administración 'está obsoleto'."
      },
      cost: 5000,
      supportBoost: 8,
      popBoost: 8,
      rewardDesc: {
        pt: "+8% Satisfação & Alinhamento de Imagem",
        en: "+8% Fan Support & Media Alignment",
        es: "+8% Satisfacción y Alianza en Redes"
      }
    },
    {
      id: "ataque_bots",
      title: {
        pt: "Invasão de Bots Adversários",
        en: "Rival Supporters Bot Raid",
        es: "Invasión de Bots Rivales"
      },
      desc: {
        pt: "Ofensiva do rival usando perfis robotizados para atacar e spamar fotos do seu midlaner.",
        en: "Coordinated social raid of duplicate robot handles spamming toxicity onto your midlaner's web tags.",
        es: "Ataque coordinado con bots automatizados bombardeando perfiles sociales de tu carrilero central."
      },
      cost: 3000,
      supportBoost: 10,
      popBoost: 2,
      rewardDesc: {
        pt: "+10% Moral de Apoio ao implementar filtros de spam",
        en: "+10% Organized Morale after deploying spam firewall",
        es: "+10% Apoyo de la Barra al aplicar filtros de spam"
      }
    }
  ];

  // Setup Initial tweets feed
  useEffect(() => {
    if (playerTeam && localTweets.length === 0) {
      const mid = playerTeam.roster.find(p => p.position === 'MID')?.name || "nosso midlaner";
      const adc = playerTeam.roster.find(p => p.position === 'ADC')?.name || "nosso atirador";
      const wr = playerTeam.wins + playerTeam.losses > 0 ? (playerTeam.wins / (playerTeam.wins + playerTeam.losses)) * 100 : 50;

      const items = [
        {
          id: 't1',
          nome_usuario: lang === 'en' ? 'Rift Insights' : lang === 'es' ? 'Eco de la Grieta' : 'Eco do Rift',
          handle_twitter: '@rift_insider',
          tempo_publicacao: lang === 'en' ? '12m ago' : lang === 'es' ? 'hace 12m' : 'há 12m',
          texto_post: wr >= 60 
            ? `A @${playerTeam.acronym} tá voando baixo! O MID deles ${mid} tá solando todo mundo no rift! Vitória atrás de vitória! 🔥`
            : `A torcida da @${playerTeam.acronym} tá tensa. O time tem potencial técnico com ${mid}, mas falta encaixar a sinergia de lutas.`,
          quantidade_likes: 312,
          quantidade_retweets: 89
        },
        {
          id: 't2',
          nome_usuario: 'eSports Analyst',
          handle_twitter: '@esports_analyst',
          tempo_publicacao: lang === 'en' ? '45m ago' : lang === 'es' ? 'hace 45m' : 'há 45m',
          texto_post: `Se o ADC ${adc} da @${playerTeam.acronym} continuar com essa média absurda de Farm por minuto, os patrocinadores vão fazer fila!`,
          quantidade_likes: 541,
          quantidade_retweets: 98
        }
      ];
      setLocalTweets(items);
    }
  }, [playerTeam?.id, lang]);

  if (!playerTeam) {
    return (
      <div className="text-center py-10 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-8 text-white">
        <p className="text-slate-405 font-bold uppercase tracking-wider">Você não possui um clube de eSports ativo.</p>
      </div>
    );
  }

  const socioTorcedores = Math.round(playerTeam.popularity * 145);
  const activeSymbol = getCurrencySymbol();
  const formatValueHud = getCaixaFormatadoHud(playerTeam.budget);

  const supportStatus = playerTeam.fansSupport >= 80 ? t.excellent : playerTeam.fansSupport >= 50 ? t.stable : t.pressured;
  const torcidaName = `${lang === 'en' ? 'Organized Supporters of' : lang === 'es' ? 'Barra Brava de' : 'Torcida Organizada'} ${playerTeam.name}`;

  // Execute Organized Fan Action (Mosaic / Meeting)
  const handleOrganizadaAction = (actionId: 'mosaic' | 'meeting') => {
    if (actionId === 'mosaic') {
      const cost = 3500;
      if (playerTeam.budget < cost) {
        triggerNotification(t.insufficientFunds, t.budgetProblem);
        return;
      }
      playerTeam.budget -= cost;
      playerTeam.fansSupport = Math.min(100, playerTeam.fansSupport + 5);

      const addedTweet = {
        id: `t_mosaic_${Date.now()}`,
        nome_usuario: lang === 'en' ? 'Fan Base Leader' : lang === 'es' ? 'Capo de la Barra' : 'Líder da Torcida',
        handle_twitter: '@lider_organizada',
        tempo_publicacao: lang === 'en' ? 'few seconds ago' : lang === 'es' ? 'hace segundos' : 'há segundos',
        texto_post: lang === 'en'
          ? `Massive banners and 3D mosaics are coming to home games! Morale of @${playerTeam.acronym} is through the roof! 🥁`
          : lang === 'es'
          ? `¡Mosaicos 3D y banderas gigantes financiadas gracias a la directiva de @${playerTeam.acronym}! ¡Arde la casa! 🥁`
          : `Mosaicos 3D e bandeirões gigantes financiados graças ao apoio de @${playerTeam.acronym}! O caldeirão vai ferver! 🥁`,
        quantidade_likes: 215,
        quantidade_retweets: 45
      };
      setLocalTweets(prev => [addedTweet, ...prev]);

      updateState(playerTeam);
      triggerNotification(t.mosaicSuccess, t.mosaicSuccessDesc);
    } else {
      // Board meeting with leaders (Free cost)
      const bonus = playerTeam.fansSupport < 50 ? 8 : 2;
      playerTeam.fansSupport = Math.min(100, playerTeam.fansSupport + bonus);

      const addedTweet = {
        id: `t_meet_${Date.now()}`,
        nome_usuario: 'eSports Portal',
        handle_twitter: '@esports_portal',
        tempo_publicacao: lang === 'en' ? 'few seconds ago' : lang === 'es' ? 'hace segundos' : 'há segundos',
        texto_post: lang === 'en'
          ? `Official meeting between board members and organized fans of @${playerTeam.acronym} concluded. Total unity sealed!`
          : lang === 'es'
          ? `Concluye reunión de diálogo de directivos con líderes de la barra de @${playerTeam.acronym}. Pacto de apoyo.`
          : `Reunião selada entre a diretoria e líderes da torcida organizada da @${playerTeam.acronym}. Alinhamento total pactuado!`,
        quantidade_likes: 187,
        quantidade_retweets: 24
      };
      setLocalTweets(prev => [addedTweet, ...prev]);

      updateState(playerTeam);
      triggerNotification(t.meetingSuccess, t.meetingSuccessDesc);
    }
  };

  // Launch community marketing campaign
  const handleLaunchCampaign = (campaignId: string, cost: number, supportBoost: number, popBoost: number, label: string) => {
    if (playerTeam.budget < cost) {
      triggerNotification(t.insufficientFunds, `${t.budgetProblem} (${formatMoney(cost)})`);
      return;
    }

    playerTeam.budget -= cost;
    playerTeam.fansSupport = Math.min(100, playerTeam.fansSupport + supportBoost);
    playerTeam.popularity = Math.min(100, playerTeam.popularity + popBoost);

    const accountsMap: Record<string, string> = {
      meetup: '@Fas_LendasHub',
      tickets: '@ComunidadeEngajada',
      charity: '@FilantropiaGamer',
      streamers: '@RiftStreamers',
      fanfest: '@FanFestOficial',
      globaltour: '@GloboTourRivals'
    };

    const usersMap: Record<string, string> = {
      meetup: 'Lorena Santos',
      tickets: 'Felipe Jovem',
      charity: 'Ação Social CBLOL',
      streamers: 'Kael Streamer',
      fanfest: 'Torcedor Camarote',
      globaltour: 'Lenda Estrangeira'
    };

    const textsMap: Record<string, Record<string, string>> = {
      pt: {
        meetup: `Sem palavras! Fui no Encontro de Fãs presencial na Gaming House da @${playerTeam.acronym}! Tirei foto com as lendas e comi pizza com eles! 😭💙`,
        tickets: `Incrível a doação em massa de ingressos sociais de arquibancada da @${playerTeam.acronym} pra molecada de baixa renda! Grande respeito.`,
        charity: `Orgulho de apoiar a @${playerTeam.acronym}! Essa Ação Social Solidária filantrópica mostra o gigante coração desses cyber-atletas! ❤️`,
        streamers: `A watch party de treinos abertos no sábado com streamers de elite da @${playerTeam.acronym} quebrou o chat das transmissões! Sincronia pura!`,
        fanfest: `Que estrutura monumental essa FAN FEST oficial da @${playerTeam.acronym}! Telão gigante, som eletrizante e torcida cantando tudo! 🏆🎉`,
        globaltour: `Histórico! O Tour Global da @${playerTeam.acronym} em caravana pelas ligas estrangeiras rompeu barreiras mundiais da marca!`
      },
      en: {
        meetup: `Absolutely amazing! Visited the Fan Meetup Session at @${playerTeam.acronym} Gaming House! Took photos and shared snacks! 😭💙`,
        tickets: `Awesome move by @${playerTeam.acronym} donating bulk stadium match seats to low income students in local communities!`,
        charity: `Super proud of supporting @${playerTeam.acronym}! This Philanthropy & Charity Drive proves the noble heart of this roster. ❤️`,
        streamers: `The live Saturday watch party cast and scrim streams by elite host players of @${playerTeam.acronym} crashed the server spike!`,
        fanfest: `This public Fan Fest set up by @${playerTeam.acronym} is insane! Giant LED setups, massive subwoofers and absolute hype! 🏆🎉`,
        globaltour: `Elite! The global tour popups set up by @${playerTeam.acronym}'s staff across foreign leagues proved their global status!`
      },
      es: {
        meetup: `¡Espectacular! ¡Volví del Encuentro de Fans en la Gaming House de @${playerTeam.acronym}! ¡Se tomaron fotos y cominos pizza! 😭💙`,
        tickets: `¡Gigantes en @${playerTeam.acronym}! Donaron entradas sociales de gradería para estudiantes locales marginados. ¡Total respeto!`,
        charity: `¡Qué orgullo presenciar esta Acción Social del club @${playerTeam.acronym}! Arrecoltaron toneladas de alimentos. ❤️`,
        streamers: `¡La watch party interactiva con streamers estrella de @${playerTeam.acronym} saturó los canales virtuales! ¡De locura!`,
        fanfest: `¡Vaya despliegue de audio y pantallas LED gigantes de la Fan Fest de @${playerTeam.acronym}! Las finales vibran en la plaza pública. 🏆🎉`,
        globaltour: `¡Histórico! El Tour de Exhibición de @${playerTeam.acronym} en el extranjero consagró nuestro estandarte ante los colosos mundiales.`
      }
    };

    const nextTweet = {
      id: `t_camp_${Date.now()}`,
      nome_usuario: usersMap[campaignId] || 'Sócio Torcedor',
      handle_twitter: accountsMap[campaignId] || '@socio_torcedor',
      tempo_publicacao: lang === 'en' ? 'few seconds ago' : lang === 'es' ? 'hace segundos' : 'há poucos segundos',
      texto_post: textsMap[lang]?.[campaignId] || `Amei a nova ação lançada pela diretoria da @${playerTeam.acronym}!`,
      quantidade_likes: 180,
      quantidade_retweets: 38
    };

    setLocalTweets(prev => [nextTweet, ...prev]);
    updateState(playerTeam);
    triggerNotification(t.launchSuccess, `"${label}"`);
  };

  // Solve Corporate PR Crisis
  const handleResolveCrisis = (crisisId: string, cost: number, supportBoost: number, popBoost: number, title: string) => {
    if (playerTeam.budget < cost) {
      triggerNotification(t.insufficientFunds, `${t.budgetProblem} (${formatMoney(cost)})`);
      return;
    }

    playerTeam.budget -= cost;
    playerTeam.fansSupport = Math.min(100, playerTeam.fansSupport + supportBoost);
    playerTeam.popularity = Math.min(100, playerTeam.popularity + popBoost);

    const nextResolved = [...resolvedCrises, crisisId];
    setResolvedCrises(nextResolved);
    localStorage.setItem(`resolved_crises_${playerTeamId}`, JSON.stringify(nextResolved));

    const addedTweet = {
      id: `t_crisis_sol_${crisisId}_${Date.now()}`,
      nome_usuario: 'PR Specialist',
      handle_twitter: '@pr_manager',
      tempo_publicacao: lang === 'en' ? 'few seconds ago' : lang === 'es' ? 'hace segundos' : 'há poucos segundos',
      texto_post: lang === 'en'
        ? `PR UPDATE: The administration of @${playerTeam.acronym} has handled the public relations issue with complete integrity and aligned with community policies! 🛡️`
        : lang === 'es'
        ? `COMUNICADO: ¡La directiva de @${playerTeam.acronym} solventó el conflicto de relaciones públicas de forma cabal y responsable! 🛡️`
        : `COMUNICADO CORPORATIVO: A administração da @${playerTeam.acronym} sanou as pendências de imagem de forma ágil, ética e transparente! 🛡️`,
      quantidade_likes: 380,
      quantidade_retweets: 74
    };

    setLocalTweets(prev => [addedTweet, ...prev]);
    updateState(playerTeam);
    
    triggerNotification(
      lang === 'en' ? "🚨 Crisis Resolved!" : lang === 'es' ? "🚨 ¡Crisis Saneada!" : "🚨 Crise Resolvida!",
      `"${title}" - +${supportBoost}% Fans & +${popBoost}% Media.`
    );
  };

  const updateState = (updatedTeam: Team) => {
    const nextTeams = teams.map(t => t.id === playerTeamId ? { ...updatedTeam } : t);
    onUpdateGameState({
      ...gameState,
      teams: nextTeams,
      finance: {
        balance: updatedTeam.budget,
        currency: activeSymbol,
        caixa_bruto: updatedTeam.budget,
        caixa_formatado_hud: getCaixaFormatadoHud(updatedTeam.budget)
      }
    });
  };

  // Modern backend compiled JSON representation (Matching the exact schema requested!)
  const liveJsonResponse = {
    theme_active: isDark ? "DARK_MODE" : "LIGHT_MODE",
    cabecalho_painel: {
      titulo: t.title,
      subtitulo: t.subtitle,
      botoes_acao: ["DASHBOARD DE COMUNIDADES", "GESTÃO DE CRISES"]
    },
    grid_metricas_principais: {
      satisfacao_torcida: {
        porcentagem: playerTeam.fansSupport,
        status: supportStatus,
        descricao: t.descFans
      },
      quadro_socio_torcedores: {
        total_inscritos: socioTorcedores,
        status: t.membersStatus,
        descricao: t.descMembers
      },
      midia_sentimento_geral: {
        porcentagem: playerTeam.popularity,
        status: t.repStatus,
        descricao: t.descRep
      }
    },
    secao_novo_card_gestao_de_massa: {
      nome_torcida_organizada: torcidaName,
      nivel_apoio: t.unconditionalSupport,
      opcoes_acoes_lideranca: [
        {
          id: "mosaic",
          titulo: t.mosaicTitle,
          custo_evento: 3500,
          descricao: t.mosaicDesc
        },
        {
          id: "meeting",
          titulo: t.meetingTitle,
          custo_evento: 0,
          descricao: t.meetingDesc
        }
      ]
    },
    secao_acoes_marketing: [
      {
        id: "meetup",
        titulo_campanha: campaignsMap.meetup.title,
        descricao: campaignsMap.meetup.desc,
        bonus_fas_porcentagem: 6,
        custo_evento: 4000,
        custo_formatado: formatMoney(4000)
      },
      {
        id: "tickets",
        titulo_campanha: campaignsMap.tickets.title,
        descricao: campaignsMap.tickets.desc,
        bonus_fas_porcentagem: 11,
        custo_evento: 8000,
        custo_formatado: formatMoney(8000)
      },
      {
        id: "charity",
        titulo_campanha: campaignsMap.charity.title,
        descricao: campaignsMap.charity.desc,
        bonus_fas_porcentagem: 8,
        custo_evento: 5000,
        custo_formatado: formatMoney(5000)
      },
      {
        id: "streamers",
        titulo_campanha: campaignsMap.streamers.title,
        descricao: campaignsMap.streamers.desc,
        bonus_fas_porcentagem: 4,
        custo_evento: 12000,
        custo_formatado: formatMoney(12000)
      },
      {
        id: "fanfest",
        titulo_campanha: campaignsMap.fanfest.title,
        descricao: campaignsMap.fanfest.desc,
        bonus_fas_porcentagem: 15,
        custo_evento: 25000,
        custo_formatado: formatMoney(25000)
      },
      {
        id: "globaltour",
        titulo_campanha: campaignsMap.globaltour.title,
        descricao: campaignsMap.globaltour.desc,
        bonus_fas_porcentagem: 20,
        custo_evento: 60000,
        custo_formatado: formatMoney(60000)
      }
    ],
    modulo_rede_social_feed_x: {
      titulo_modulo: t.feedTitle,
      efeito_transicao: "vertical_infinite_loop_scroll",
      visual_padrao: "GAMING_HOUSE_THEME",
      publicacoes: localTweets.map(lt => ({
        usuario: lt.nome_usuario,
        arroba: lt.handle_twitter,
        conteudo: lt.texto_post,
        likes: lt.quantidade_likes,
        retweets: lt.quantidade_retweets,
        tempo: lt.tempo_publicacao
      }))
    },
    gestao_crises: crisesData.map(c => ({
      id: c.id,
      titulo: c.title[lang],
      descricao: c.desc[lang],
      custo: c.cost,
      status: resolvedCrises.includes(c.id) ? t.solvedCrisisBadge : t.activeCrisisBadge
    })),
    moeda_ativa: activeSymbol,
    caixa_bruto: playerTeam.budget,
    caixa_formatado_hud: formatValueHud,
    status_auto_save: {
      auto_saved: true,
      arquivo_modificado: "database_master.db",
      tabela_alterada: "comunidade_torcidas"
    }
  };

  return (
    <div className={`space-y-6 select-none font-sans text-xs ${colors.textPrimary}`}>
      {/* Header Panel (Dynamically styled to prevent Light/Dark clash) */}
      <div className={`${colors.bgContainer} p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#00E5FF]' : 'bg-blue-600'} animate-pulse`} />
            <h3 className={`font-display ${colors.textAccent} text-sm font-black uppercase tracking-wider`}>
              {t.title}
            </h3>
          </div>
          <p className={`text-[10.5px] ${colors.textSecondary} mt-1 max-w-xl leading-relaxed`}>
            {t.subtitle}
          </p>
        </div>
        
        {/* UPPER RIGHT ACTIONS - STRICT COERCIVE NO WORLD TOUR OR LIVE JSON LABELS */}
        <div className={`flex items-center gap-2 border-t ${isDark ? 'border-slate-805/40' : 'border-slate-200'} md:border-t-0 pt-2 md:pt-0`}>
          <button
            onClick={() => setActiveSubView('dashboard')}
            className={`px-3.5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all cursor-pointer ${
              activeSubView === 'dashboard'
                ? isDark
                  ? 'bg-cyan-500/20 text-[#00E5FF] border-[#00E5FF] shadow-sm shadow-cyan-455/15'
                  : 'bg-blue-50 text-blue-650 border-blue-400 shadow-sm'
                : isDark
                  ? 'bg-[#070d19] text-gray-400 border-slate-800 hover:border-slate-600 hover:text-white'
                  : 'bg-white text-slate-500 border-slate-205 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {t.dashBtn}
          </button>
          <button
            onClick={() => setActiveSubView('crises')}
            className={`px-3.5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all cursor-pointer ${
              activeSubView === 'crises'
                ? isDark
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm shadow-rose-555/15'
                  : 'bg-rose-50 text-rose-650 border-rose-450 shadow-sm'
                : isDark
                  ? 'bg-[#070d19] text-gray-400 border-slate-800 hover:border-slate-600 hover:text-white'
                  : 'bg-white text-slate-500 border-slate-205 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {t.crisesBtn}
          </button>
        </div>
      </div>

      {/* Grid of the 3 main metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Fan Satisfaction */}
        <div className={`${colors.bgCard} p-5 rounded-2xl space-y-4 hover:border-cyan-500/25 transition-all`}>
          <span className={`text-[9.5px] ${colors.textAccent} font-black uppercase tracking-wider block`}>{t.fansSupport}</span>
          <div className={`flex justify-between items-end border-b ${colors.borderInner} pb-3`}>
            <h4 className={`font-display font-black text-3xl`}>
              {liveJsonResponse.grid_metricas_principais.satisfacao_torcida.porcentagem}%
            </h4>
            <span className={`text-[9.5px] ${colors.textAccent} uppercase font-bold tracking-widest font-mono`}>
              {liveJsonResponse.grid_metricas_principais.satisfacao_torcida.status}
            </span>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-205 border-slate-200'} h-2.5 rounded-full overflow-hidden p-[1px] border`}>
            <div className={`h-full ${isDark ? 'bg-[#00E5FF]' : 'bg-blue-600'} rounded-full transition-all duration-500`} style={{ width: `${liveJsonResponse.grid_metricas_principais.satisfacao_torcida.porcentagem}%` }} />
          </div>
          <p className={`text-[10px] ${colors.textSecondary} leading-relaxed`}>
            {liveJsonResponse.grid_metricas_principais.satisfacao_torcida.descricao}
          </p>
        </div>

        {/* Card 2: Registered Members */}
        <div className={`${colors.bgCard} p-5 rounded-2xl space-y-4 hover:border-cyan-500/25 transition-all`}>
          <span className={`text-[9.5px] ${colors.textAccent} font-black uppercase tracking-wider block`}>{t.members}</span>
          <div className={`flex justify-between items-end border-b ${colors.borderInner} pb-3`}>
            <h4 className={`font-display font-black text-3xl`}>
              {liveJsonResponse.grid_metricas_principais.quadro_socio_torcedores.total_inscritos.toLocaleString('pt-BR')}
            </h4>
            <span className={`text-[9.5px] ${colors.textAccent} uppercase font-bold tracking-widest font-mono`}>
              {liveJsonResponse.grid_metricas_principais.quadro_socio_torcedores.status}
            </span>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-205 border-slate-200'} h-2.5 rounded-full overflow-hidden p-[1px] border`}>
            <div className={`h-full ${isDark ? 'bg-blue-500' : 'bg-indigo-600'} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, liveJsonResponse.grid_metricas_principais.quadro_socio_torcedores.total_inscritos / 150)}%` }} />
          </div>
          <p className={`text-[10px] ${colors.textSecondary} leading-relaxed`}>
            {liveJsonResponse.grid_metricas_principais.quadro_socio_torcedores.descricao}
          </p>
        </div>

        {/* Card 3: Media Sentiment Reputation */}
        <div className={`${colors.bgCard} p-5 rounded-2xl space-y-4 hover:border-cyan-500/25 transition-all`}>
          <span className={`text-[9.5px] ${colors.textAccent} font-black uppercase tracking-wider block`}>{t.reputation}</span>
          <div className={`flex justify-between items-end border-b ${colors.borderInner} pb-3`}>
            <h4 className={`font-display font-black text-3xl`}>
              {liveJsonResponse.grid_metricas_principais.midia_sentimento_geral.porcentagem}%
            </h4>
            <span className={`text-[9.5px] ${colors.textAccent} uppercase font-bold tracking-widest font-mono`}>
              {liveJsonResponse.grid_metricas_principais.midia_sentimento_geral.status}
            </span>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-205 border-slate-200'} h-2.5 rounded-full overflow-hidden p-[1px] border`}>
            <div className={`h-full ${isDark ? 'bg-indigo-500' : 'bg-purple-600'} rounded-full transition-all duration-500`} style={{ width: `${liveJsonResponse.grid_metricas_principais.midia_sentimento_geral.porcentagem}%` }} />
          </div>
          <p className={`text-[10px] ${colors.textSecondary} leading-relaxed`}>
            {liveJsonResponse.grid_metricas_principais.midia_sentimento_geral.descricao}
          </p>
        </div>
      </div>

      {/* Main Swappable Subview Block (Forced Dark Mode SaaS cards) */}
      {activeSubView === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white">
          {/* Column Left: Organized Fans Card + Campaign Cards (Span 7) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            {/* Section 3: Organized Fan Relationship Card */}
            <div className={`${colors.bgCard} p-5 rounded-2xl space-y-4 shadow`}>
              <div className={`border-b ${colors.borderInner} pb-3 flex items-center justify-between`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${colors.textAccent} flex items-center gap-1.5`}>
                  <Users className="w-4 h-4" />
                  {t.organizadasTitle}
                </h4>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${isDark ? 'border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF]' : 'border-blue-200 bg-blue-50 text-blue-700'} font-mono uppercase tracking-widest`}>
                  RELATIONSHIP ENGINE
                </span>
              </div>

              <div className={`${colors.bgInner} p-4 rounded-xl space-y-4`}>
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${colors.bgDarker} p-3 rounded-lg border ${colors.borderInner}/40`}>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest">{t.organizadasSub}</span>
                    <h5 className={`text-[11px] font-black uppercase ${colors.textPrimary} mt-0.5`}>{liveJsonResponse.secao_novo_card_gestao_de_massa.nome_torcida_organizada}</h5>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none mb-0.5">{t.supportLabel}</span>
                    <span className={`${colors.textAccent} font-black text-[10px] uppercase font-mono`}>{liveJsonResponse.secao_novo_card_gestao_de_massa.nivel_apoio}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className={`text-[9px] uppercase font-extrabold ${colors.textSecondary} tracking-wider block`}>{t.actionsTorcida}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mosaic Card */}
                    <div className={`${colors.bgDarker} p-3.5 rounded-lg flex flex-col justify-between space-y-3`}>
                      <div>
                        <h6 className={`text-[10px] font-black ${colors.textPrimary} uppercase`}>{t.mosaicTitle}</h6>
                        <p className={`text-[10px] ${colors.textSecondary} mt-1 leading-relaxed`}>{t.mosaicDesc}</p>
                      </div>
                      <div className={`flex items-center justify-between pt-2.5 border-t ${colors.borderInner} mt-1`}>
                        <span className={`text-[10.5px] font-mono font-black ${colors.textAccent}`}>$ 3.500</span>
                        <button 
                          onClick={() => handleOrganizadaAction('mosaic')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-[#00E5FF] hover:text-black rounded text-[9px] font-black uppercase cursor-pointer tracking-wider select-none transition-all duration-300"
                        >
                          [Lançar]
                        </button>
                      </div>
                    </div>

                    {/* Board Meeting Card */}
                    <div className={`${colors.bgDarker} p-3.5 rounded-lg flex flex-col justify-between space-y-3`}>
                      <div>
                        <h6 className={`text-[10px] font-black ${colors.textPrimary} uppercase`}>{t.meetingTitle}</h6>
                        <p className={`text-[10px] ${colors.textSecondary} mt-1 leading-relaxed`}>{t.meetingDesc}</p>
                      </div>
                      <div className={`flex items-center justify-between pt-2.5 border-t ${colors.borderInner} mt-1`}>
                        <span className="text-[10.5px] font-mono font-bold text-emerald-450">{t.freeCost}</span>
                        <button 
                          onClick={() => handleOrganizadaAction('meeting')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-black uppercase cursor-pointer tracking-wider select-none transition-all duration-300"
                        >
                          [Reunir]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: secao_acoes_marketing (Active Campaigns list) */}
            <div className={`${colors.bgCard} p-5 rounded-2xl space-y-4 shadow flex-1`}>
              <div className={`border-b ${colors.borderInner} px-0.5 pb-3 flex items-center justify-between`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${colors.textAccent} flex items-center gap-1.5`}>
                  <Sparkles className="w-4 h-4" />
                  {t.activeMarketing}
                </h4>
                <div className={`text-[9.5px] ${colors.textSecondary} font-mono`}>
                  Caixa: <span className={`${colors.textAccent} font-black`}>{liveJsonResponse.caixa_formatado_hud}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveJsonResponse.secao_acoes_marketing.map((cam) => (
                  <div key={cam.id} className={`${colors.bgInner} p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/10 transition-all`}>
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <h5 className={`font-extrabold text-[10.5px] ${colors.textPrimary} uppercase truncate`}>{cam.titulo_campanha}</h5>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-cyan-500/10 ${colors.textAccent} shrink-0`}>
                          +{cam.bonus_fas_porcentagem}% FÃS
                        </span>
                      </div>
                      <p className={`text-[10px] ${colors.textSecondary} mt-1.5 leading-relaxed`}>{cam.descricao}</p>
                    </div>

                    <div className={`flex justify-between items-center pt-3 border-t ${colors.borderInner}`}>
                      <div className="flex flex-col">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-mono">{t.costLabel}</span>
                        <span className={`${colors.textAccent} font-mono font-black text-[11px]`}>{cam.custo_formatado}</span>
                      </div>
                      <button
                        onClick={() => handleLaunchCampaign(
                          cam.id, 
                          cam.custo_evento, 
                          cam.bonus_fas_porcentagem, 
                          cam.id === 'globaltour' ? 20 : cam.id === 'fanfest' ? 12 : 3, 
                          cam.titulo_campanha
                        )}
                        className="px-3 py-2 bg-blue-600 hover:bg-[#00E5FF] hover:text-black rounded text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300"
                      >
                        {t.launchBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column Right: X (Twitter) unificado procedural feed (Span 5) */}
          <div className={`lg:col-span-5 ${colors.bgCard} p-5 rounded-2xl space-y-4 flex flex-col h-full min-h-[580px] overflow-hidden`}>
            <div className={`border-b ${colors.borderInner} pb-3 flex items-center justify-between shrink-0 gap-2`}>
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-cyan-500 animate-pulse shrink-0" />
                <h4 className={`text-xs font-black uppercase tracking-wider ${colors.textAccent} group-hover:text-cyan-500 transition-colors truncate`}>
                  REDE SOCIAL: FEED DO X (Twitter)
                </h4>
              </div>
              <span className="text-[7.5px] font-mono uppercase text-[#00cbd6] font-bold tracking-widest text-right shrink-0">
                ROLAGEM VERTICAL EM LOOP INFINITO / MARQUEE
              </span>
            </div>

            <RssFeedX tweets={unifiedFeed.tweets} isDark={isDark} />
          </div>
        </div>
      ) : (
        /* View 2: PR CRISIS MANAGEMENT PLATFORM (Forced Dark Mode card details) */
        <div className={`${colors.bgCard} p-5 rounded-2xl space-y-5 shadow-md`}>
          <div className={`border-b ${colors.borderInner} pb-3 flex items-center justify-between`}>
            <div>
              <h4 className="text-xs font-black uppercase text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                {t.crisisTitleMain}
              </h4>
              <p className={`text-[10px] ${colors.textSecondary} mt-1 max-w-xl`}>
                {t.crisisSubtitleMain}
              </p>
            </div>
            <div className={`text-[9.5px] ${colors.textSecondary} font-mono`}>
              Caixa PR: <span className={`${colors.textAccent} font-mono font-black`}>{liveJsonResponse.caixa_formatado_hud}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crisesData.map((crisis) => {
              const idx = resolvedCrises.includes(crisis.id);
              return (
                <div key={crisis.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 shadow transition-all ${
                  idx 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-85' 
                    : `${colors.bgInner} ${colors.borderInner} hover:border-rose-500/20`
                }`}>
                  <div className="flex justify-between items-start gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${idx ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`} />
                        <h5 className={`font-black ${colors.textPrimary} uppercase text-[11px] tracking-wide`}>{crisis.title[lang]}</h5>
                      </div>
                      <p className={`text-[10px] ${colors.textSecondary} leading-relaxed`}>{crisis.desc[lang]}</p>
                    </div>

                    <span className={`text-[8px] font-mono uppercase tracking-widest font-black px-2 py-0.5 rounded leading-none ${
                      idx 
                        ? `${colors.badgeSuccess}` 
                        : `${colors.badgeDanger}`
                    }`}>
                      {idx ? t.solvedCrisisBadge : t.activeCrisisBadge}
                    </span>
                  </div>

                  <div className={`flex flex-col x-spacing xs:flex-row justify-between items-start xs:items-center pt-3 border-t ${colors.borderInner} gap-2.5`}>
                    <div>
                      <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-mono block leading-none mb-1">Efeito Resolutivo</span>
                      <strong className="text-emerald-500 text-[10px] uppercase font-mono">{crisis.rewardDesc[lang]}</strong>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono font-black text-rose-500">$ {crisis.cost.toLocaleString('pt-BR')}</span>
                      <button
                        onClick={() => handleResolveCrisis(crisis.id, crisis.cost, crisis.supportBoost, crisis.popBoost, crisis.title[lang])}
                        disabled={idx}
                        className={`px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-wider shadow cursor-pointer transition-all ${
                          idx 
                            ? 'bg-emerald-950/20 text-emerald-500 border border-emerald-500/40 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {idx ? t.solvedCrisisBadge : t.solveCrisis}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COLLAPSIBLE DATA ENGINE PAYLOAD SIMULATOR - SUPER PROFESSIONAL, EXTREMELY HUMBLE INDEED */}
      <div className={`${colors.bgContainer} rounded-2xl p-4 shadow-md`}>
        <div
          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
          className="flex justify-between items-center cursor-pointer select-none pb-0.5 hover:opacity-90"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConsoleExpanded ? (isDark ? 'bg-[#00E5FF]' : 'bg-blue-600') : 'bg-slate-500 animate-pulse'}`} />
            <span className={`text-[9.5px] font-black tracking-widest ${colors.textAccent} font-mono uppercase flex items-center gap-1.5`}>
              <Terminal className="w-3.5 h-3.5" />
              {"{ }"} {t.jsonPayloadTitle}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-[8px] font-mono ${colors.textSecondary} ${isDark ? 'bg-slate-950' : 'bg-slate-100'} px-2.5 py-0.5 rounded border ${colors.borderInner}`}>
            <span>{isConsoleExpanded ? 'OCULTAR PAYLOAD' : 'EXIBIR TRANSATIVO'}</span>
          </div>
        </div>

        {isConsoleExpanded && (
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t ${colors.borderInner}`}>
            {/* Left Col: Aggregated JSON Preview */}
            <div className="lg:col-span-8 flex flex-col space-y-2">
              <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-500 block">{t.apiSimTerminal}</span>
              <pre className={`${isDark ? 'bg-[#050c18] text-[#00E5FF] border-slate-850' : 'bg-slate-900 text-emerald-400 border-slate-800'} font-mono text-[9px] leading-relaxed p-4 rounded-xl border max-h-[300px] overflow-y-auto select-text overflow-x-auto`}>
                {JSON.stringify(liveJsonResponse, null, 2)}
              </pre>
            </div>

            {/* Right Col: Explanation */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-500 block">STATE MACHINE AUTOSAVE</span>
                <div className={`${isDark ? 'bg-[#050c18] border-[#1e2d44]/60' : 'bg-slate-100 border-slate-200'} p-3.5 rounded-xl border space-y-2 font-mono text-[9.5px]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">status:</span>
                    <span className="text-emerald-500 font-extrabold">"sucesso"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">arquivo_salvo:</span>
                    <span className={`${colors.textPrimary}`}>"database_master.db"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">tabela:</span>
                    <span className={`${colors.textAccent} font-bold`}>"comunidade_torcidas"</span>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-slate-950/80 border-slate-850' : 'bg-slate-200/55 border-slate-300/40'} p-3.5 rounded-xl border text-[10px] ${colors.textSecondary} leading-normal`}>
                <span className={`${colors.textAccent} font-black block mb-1`}>🖥️ DATA ENGINE SYSTEM</span>
                {t.jsonPayloadDesc}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

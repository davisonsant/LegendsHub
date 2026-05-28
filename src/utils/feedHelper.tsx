import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';

export interface UnifiedNews {
  id: string;
  portal_nome: string;
  manchete_texto: string;
  commentary: string;
  tempo_passado: string;
  impacto_reputacao: 'positivo' | 'negativo' | 'neutro';
  // DashboardTab compatible layout fields
  outlet?: string;
  headline?: string;
  impact?: { [key: string]: number };
  kpis?: string[];
}

export interface UnifiedTweet {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  likes: number;
  retweets: number;
  timeAgo: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  verified?: boolean;
}

export interface UnifiedFeedState {
  tweets: UnifiedTweet[];
  news: UnifiedNews[];
}

const normLang = (lang: string): 'pt' | 'en' | 'es' => {
  const l = lang.toLowerCase();
  if (l.includes('pt') || l.includes('br')) return 'pt';
  if (l.includes('es')) return 'es';
  return 'en';
};

export function getOrCreateWeekFeedState(gameState: GameState, langCode: string): UnifiedFeedState {
  const lang = normLang(langCode);
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId) || gameState.teams[0];
  const teamName = playerTeam?.name || 'Esports Club';
  const teamAcronym = playerTeam?.acronym || 'TEAM';
  
  // Find notable roster players to name in tweets & news dynamically
  const midPlayer = playerTeam?.roster?.find(p => p.position === 'MID')?.name || 'Core Mid';
  const adcPlayer = playerTeam?.roster?.find(p => p.position === 'ADC')?.name || 'Core ADC';
  const supportPlayer = playerTeam?.roster?.find(p => p.position === 'SUP')?.name || 'Core Supp';

  // Seed with gameState's week to keep it deterministic but progressing weekly
  const weekNum = gameState.week;

  // Let's generate consistent tweets based on week number and team state
  const tweetsTemplates = {
    pt: [
      {
        id: `tw-${weekNum}-1`,
        username: 'Baiano',
        handle: 'baianolol1',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        content: `O clássico @${teamAcronym} contra a paiN nessa semana vai parar o cenário competitivo de eSports! Disputa acirradíssima pelo topo da liga. Quem perder vai aguentar sarro da torcida rival. Qual seu palpite? 🔥`,
        likes: 8500 + weekNum * 123,
        retweets: 3200 + weekNum * 47,
        timeAgo: '23 min atrás',
        sentiment: 'neutral' as const
      },
      {
        id: `tw-${weekNum}-2`,
        username: 'Felipe brtt',
        handle: 'brttOficial',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        content: `@${teamAcronym} contra paiN nos palcos... se vacilarem na fase de rotas ou errarem o pick de escala do patch, já era. Esse duelo de liderança com ${midPlayer} vai ser decidido nos detalhes técnicos! 👊`,
        likes: 9340 + weekNum * 111,
        retweets: 4100 + weekNum * 39,
        timeAgo: '45 min atrás',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-3`,
        username: 'Muca Esports',
        handle: 'smurfdomuca',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        content: `Clima tenso total na botlane com o ${adcPlayer} e o suporte ${supportPlayer}. Coach e manager vão ter que operar milagre pra manter o vestiário da @${teamAcronym} alinhado essa semana.`,
        likes: 3820 + weekNum * 95,
        retweets: 740 + weekNum * 12,
        timeAgo: '1h atrás',
        sentiment: 'negative' as const
      },
      {
        id: `tw-${weekNum}-4`,
        username: 'Rift Insights',
        handle: 'rift_insider',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        content: `A @${teamAcronym} tá voando baixo no ranking! O MID deles ${midPlayer} tá solando todo mundo no rift! Vitória atrás de vitória nas simulações táticas de treino! 🔥`,
        likes: 3512 + weekNum * 150,
        retweets: 890 + weekNum * 25,
        timeAgo: '2h atrás',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-5`,
        username: 'eSports Analyst',
        handle: 'esports_analyst',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
        content: `Se o ADC ${adcPlayer} da @${teamAcronym} continuar com essa média absurda de Farm por minuto, os patrocinadores de alto calibre vão fazer fila na gaming house de eSports!`,
        likes: 5412 + weekNum * 78,
        retweets: 980 + weekNum * 15,
        timeAgo: '3h atrás',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-6`,
        username: 'Lucas Silva',
        handle: 'lucas_lolesports',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
        content: `Espera aí, os novos computadores e escritórios de media da equipe @${teamAcronym} são uma nave espacial real! Quero ver segurar esse draft agora no novo split!`,
        likes: 1420 + weekNum * 31,
        retweets: 240 + weekNum * 5,
        timeAgo: '5h atrás',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-7`,
        username: 'Rafaela Costa',
        handle: 'rafalol',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
        content: `O novo departamento jurídico da @${teamAcronym} economizou uma fortuna ao cancelar termos abusivos. Excelente governança financeira por parte do manager.`,
        likes: 980 + weekNum * 42,
        retweets: 120 + weekNum * 8,
        timeAgo: '8h atrás',
        sentiment: 'positive' as const
      }
    ],
    en: [
      {
        id: `tw-${weekNum}-1`,
        username: 'Baiano',
        handle: 'baianolol1',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        content: `The classic match of @${teamAcronym} vs paiN this week will stop the competitive eSports scene! Extremely fierce battle for the top. What is your guess? 🔥`,
        likes: 8500 + weekNum * 123,
        retweets: 3200 + weekNum * 47,
        timeAgo: '23 min ago',
        sentiment: 'neutral' as const
      },
      {
        id: `tw-${weekNum}-2`,
        username: 'Felipe brtt',
        handle: 'brttOficial',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
        content: `@${teamAcronym} vs paiN on stage... if they slip up in laning phase or select the wrong draft champ, it's over. This duel with midlaner ${midPlayer} is decided on details! 👊`,
        likes: 9340 + weekNum * 111,
        retweets: 4100 + weekNum * 39,
        timeAgo: '45 min ago',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-3`,
        username: 'Muca Esports',
        handle: 'smurfdomuca',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        content: `Total tense atmosphere under botlane with ${adcPlayer} and ${supportPlayer}. Coach and manager will have to work a miracle at @${teamAcronym} this week.`,
        likes: 3820 + weekNum * 95,
        retweets: 740 + weekNum * 12,
        timeAgo: '1h ago',
        sentiment: 'negative' as const
      },
      {
        id: `tw-${weekNum}-4`,
        username: 'Rift Insights',
        handle: 'rift_insider',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        content: `@${teamAcronym} is flying high! Their MID player ${midPlayer} is solokilling everyone in the rift! Flawless team synergy 🔥`,
        likes: 3512 + weekNum * 150,
        retweets: 890 + weekNum * 25,
        timeAgo: '2h ago',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-5`,
        username: 'eSports Analyst',
        handle: 'esports_analyst',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
        content: `If ADC ${adcPlayer} from @${teamAcronym} continues with this absurd CS per minute, top tier dynamic sponsors will line up at the gaming house!`,
        likes: 5412 + weekNum * 78,
        retweets: 980 + weekNum * 15,
        timeAgo: '3h ago',
        sentiment: 'positive' as const
      }
    ],
    es: [
      {
        id: `tw-${weekNum}-1`,
        username: 'Baiano',
        handle: 'baianolol1',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
        content: `¡El partido clásico de @${teamAcronym} contra paiN esta semana parará la escena competitiva! Una batalla feroz por la cima de la tabla. ¿Cuál es tu pronóstico? 🔥`,
        likes: 8500 + weekNum * 123,
        retweets: 3200 + weekNum * 47,
        timeAgo: 'hace 23 min',
        sentiment: 'neutral' as const
      },
      {
        id: `tw-${weekNum}-2`,
        username: 'Felipe brtt',
        handle: 'brttOficial',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
        content: `@${teamAcronym} contra paiN en el escenario... si fallan en fase de líneas o eligen el draft equivocado para el parche se acabó. ¡Duelo estelar para ${midPlayer}! 👊`,
        likes: 9340 + weekNum * 111,
        retweets: 4100 + weekNum * 39,
        timeAgo: 'hace 45 min',
        sentiment: 'positive' as const
      },
      {
        id: `tw-${weekNum}-3`,
        username: 'Muca Esports',
        handle: 'smurfdomuca',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
        content: `¡Clima totalmente tenso en la botlane! ${adcPlayer} y ${supportPlayer} con desacuerdos. El manager tendrá que hacer milagros esta semana en @${teamAcronym}.`,
        likes: 3820 + weekNum * 95,
        retweets: 740 + weekNum * 12,
        timeAgo: 'hace 1h',
        sentiment: 'negative' as const
      },
      {
        id: `tw-${weekNum}-4`,
        username: 'Rift Insights',
        handle: 'rift_insider',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        content: `¡La escuadra de @${teamAcronym} está volando! Su MID canterano ${midPlayer} está logrando un ratio de solokills perfecto en la grieta! 🔥`,
        likes: 3512 + weekNum * 150,
        retweets: 890 + weekNum * 25,
        timeAgo: 'hace 2h',
        sentiment: 'positive' as const
      }
    ]
  };

  const newsTemplates = {
    pt: [
      {
        id: `art-${weekNum}-1`,
        outlet: 'ESPN Esports',
        portal_nome: 'ESPN eSports',
        headline: `Drakos anuncia proposta de cooperação comercial para a equipe ${teamName}`,
        manchete_texto: `Drakos anuncia proposta de cooperação comercial para a equipe ${teamName}`,
        commentary: 'A famosa marca Drakos pretende injetar verbas expressivas do caixa para estampar seu logotipo em canais oficiais e camisetas da organização. A diretoria já sinalizou aprovação, restando a validação final do manager da Gaming House.',
        tempo_passado: '5m atrás',
        impacto_reputacao: 'positivo' as const,
        impact: { diretoria: 10, torcida: 5 },
        kpis: ['+10 DIRETORIA', '+5 TORCIDA']
      },
      {
        id: `art-${weekNum}-2`,
        outlet: 'Mais Esports',
        portal_nome: 'Mais Esports',
        headline: `Crise na escalação? Atletas relatam exaustão física por cargas de treino pesadas`,
        manchete_texto: `Crise na escalação? Atletas relatam exaustão física por cargas de treino pesadas`,
        commentary: `Questões de bem-estar na gaming house vêm à tona. Relatos sugerem desgaste e desconforto extremo de ${midPlayer} sobre a atual rotina de preparação intensiva, ligando sinal de atenção para a química com o time.`,
        tempo_passado: '20m atrás',
        impacto_reputacao: 'negativo' as const,
        impact: { vestiario: -10, imprensa: 5 },
        kpis: ['-10 VESTIÁRIO', '+5 IMPRENSA']
      },
      {
        id: `art-${weekNum}-3`,
        outlet: 'Ilha das Lendas',
        portal_nome: 'Ilha das Lendas',
        headline: `Impasse contratual com ${adcPlayer} acende alerta de perda de joia para a liga`,
        manchete_texto: `Impasse contratual com ${adcPlayer} acende alerta de perda de joia para a liga`,
        commentary: `Apenas poucas semanas restantes no contrato oficial de ${adcPlayer}. Empresários já admitem propostas externas vigorosas de rivais diretos, exigindo ação ágil no painel de pessoal da organização.`,
        tempo_passado: '1h atrás',
        impacto_reputacao: 'negativo' as const,
        impact: { diretoria: -5, vestiario: -5 },
        kpis: ['-5 DIRETORIA', '-5 VESTIÁRIO']
      },
      {
        id: `art-${weekNum}-4`,
        outlet: 'Dot Esports',
        portal_nome: 'Dot Esports',
        headline: `Rumores apontam Faker vindo fazer bootcamp no Brasil com a T1. Torcida vai à loucura!`,
        manchete_texto: `Rumores apontam Faker vindo fazer bootcamp no Brasil com a T1. Torcida vai à loucura!`,
        commentary: 'Rumores apontam que a lenda do eSports Faker está avaliando de perto as condições e o calor da torcida sul-americana para um bootcamp prolongado offline com a equipe principal da T1 nas próximas semanas.',
        tempo_passado: '2h atrás',
        impacto_reputacao: 'positivo' as const,
        impact: { imprensa: 10, torcida: 15 },
        kpis: ['+10 IMPRENSA', '+15 TORCIDA']
      },
      {
        id: `art-${weekNum}-5`,
        outlet: 'Draft5',
        portal_nome: 'Draft5',
        headline: 'Análise de Draft do Manager aponta estratégias de equipe em alta sintonia com o meta do jogo',
        manchete_texto: 'Análise de Draft do Manager aponta estratégias de equipe em alta sintonia com o meta do jogo',
        commentary: `Especialistas de eSports elogiam os drafts recentes focando na rota do ${midPlayer}. A capacidade da equipe de neutralizar composições adversárias elevou o prestígio tático do clube.`,
        tempo_passado: '4h atrás',
        impacto_reputacao: 'positivo' as const,
        impact: { imprensa: 8, diretoria: 5 },
        kpis: ['+8 IMPRENSA', '+5 DIRETORIA']
      },
      {
        id: `art-${weekNum}-6`,
        outlet: 'ESPN',
        portal_nome: 'ESPN',
        headline: 'Investidores globais elogiam a transparência operacional e novos departamentos da organização',
        manchete_texto: 'Investidores globais elogiam a transparência operacional e novos departamentos da organização',
        commentary: 'Investidores de capital de risco divulgaram um relatório elogiando ativamente os processos financeiros internos e a governança corporativa transparente introduzida pelo novo manager do clube de eSports.',
        tempo_passado: '9h atrás',
        impacto_reputacao: 'positivo' as const,
        impact: { diretoria: 12, torcida: 2 },
        kpis: ['+12 DIRETORIA', '+2 TORCIDA']
      }
    ],
    en: [
      {
        id: `art-${weekNum}-1`,
        outlet: 'ESPN Esports',
        portal_nome: 'ESPN eSports',
        headline: `Drakos announces multi-million commercial cooperation proposal for ${teamName}`,
        manchete_texto: `Drakos announces multi-million commercial cooperation proposal for ${teamName}`,
        commentary: 'The Drakos brand intends to inject significant weekly budgets to stamp its logo on official channels and jerseys. The board signaled approval, pending matching manager signature.',
        tempo_passado: '5m ago',
        impacto_reputacao: 'positivo' as const,
        impact: { diretoria: 10, torcida: 5 },
        kpis: ['+10 BOARD', '+5 FANS']
      },
      {
        id: `art-${weekNum}-2`,
        outlet: 'Mais Esports',
        portal_nome: 'Mais Esports',
        headline: 'Tension at esports camp? Athletes report raw fatigue from heavy training schedules',
        manchete_texto: 'Tension at esports camp? Athletes report raw fatigue from heavy training schedules',
        commentary: `Health complaints in the gaming house surfaced. Reports suggest exhaustion and discomfort of ${midPlayer} regarding current routines, raising warning signals for overall chemistry.`,
        tempo_passado: '20m ago',
        impacto_reputacao: 'negativo' as const,
        impact: { vestiario: -10, imprensa: 5 },
        kpis: ['-10 LOCKER', '+5 PRESS']
      },
      {
        id: `art-${weekNum}-3`,
        outlet: 'Ilha das Lendas',
        portal_nome: 'Ilha das Lendas',
        headline: `Contract dispute with ${adcPlayer} raises concerns of losing the superstar botlaner`,
        manchete_texto: `Contract dispute with ${adcPlayer} raises concerns of losing the superstar botlaner`,
        commentary: `Only few weeks remain on ${adcPlayer}'s official starting contract. Representatives already receive vigorous target offers from direct table contenders, demanding agile action.`,
        tempo_passado: '1h ago',
        impacto_reputacao: 'negativo' as const,
        impact: { diretoria: -5, vestiario: -5 },
        kpis: ['-5 BOARD', '-5 LOCKER']
      },
      {
        id: `art-${weekNum}-4`,
        outlet: 'Dot Esports',
        portal_nome: 'Dot Esports',
        headline: 'Rumors hint Faker might hold an off-season bootcamp with T1 in South America',
        manchete_texto: 'Rumors hint Faker might hold an off-season bootcamp with T1 in South America',
        commentary: 'Riot Games and tournament organizers are looking at facilitating visas for T1 squads to host a massive fan meeting and offline scrim session in Brazil next month.',
        tempo_passado: '2h ago',
        impacto_reputacao: 'positivo' as const,
        impact: { imprensa: 10, torcida: 15 },
        kpis: ['+10 PRESS', '+15 FANS']
      }
    ],
    es: [
      {
        id: `art-${weekNum}-1`,
        outlet: 'ESPN Esports',
        portal_nome: 'ESPN eSports',
        headline: `Drakos anuncia propuesta de cooperación comercial millonaria para ${teamName}`,
        manchete_texto: `Drakos anuncia propuesta de cooperación comercial millonaria para ${teamName}`,
        commentary: 'La marca Drakos pretende inyectar importantes fondos semanales para estampar su logotipo en los canales oficiales y camisetas. La directiva ya aprobó, quedando la validación del mánager.',
        tempo_passado: '5m atrás',
        impacto_reputacao: 'positivo' as const,
        impact: { diretoria: 10, torcida: 5 },
        kpis: ['+10 DIRECTIVA', '+5 AFICIÓN']
      },
      {
        id: `art-${weekNum}-2`,
        outlet: 'Mais Esports',
        portal_nome: 'Mais Esports',
        headline: '¿Crisis en el equipo? Deportes reportan cansancio extremo por altas cargas',
        manchete_texto: '¿Crisis en el equipo? Deportes reportan cansancio extremo por altas cargas',
        commentary: `Surgen quejas de bienestar en la gaming house. Los informes sugerirían agotamiento y descontento de ${midPlayer} respecto a la rutina de preparación, lo que enciende alarmas de química.`,
        tempo_passado: '20m atrás',
        impacto_reputacao: 'negativo' as const,
        impact: { vestiario: -10, imprensa: 5 },
        kpis: ['-10 VESTUARIO', '+5 PRENSA']
      },
      {
        id: `art-${weekNum}-3`,
        outlet: 'Ilha das Lendas',
        portal_nome: 'Ilha das Lendas',
        headline: `Impasse contractual con ${adcPlayer} enciende las alarmas de perder a la estrella`,
        manchete_texto: `Impasse contractual con ${adcPlayer} enciende las alarmas de perder a la estrella`,
        commentary: `Con pocas semanas de contrato oficial para ${adcPlayer}, agentes de mercado ya admiten ofertas externas de rivales, exigiendo acción de renovación inmediata.`,
        tempo_passado: '1h atrás',
        impacto_reputacao: 'negativo' as const,
        impact: { diretoria: -5, vestiario: -5 },
        kpis: ['-5 DIRECTIVA', '-5 VESTUARIO']
      }
    ]
  };

  const tweets = tweetsTemplates[lang] || tweetsTemplates.pt;
  const news = newsTemplates[lang] || newsTemplates.pt;

  return { tweets, news };
}

export function RssFeedX({ tweets, isDark }: { tweets: any[]; isDark: boolean }) {
  return (
    <div className="relative flex-1 overflow-hidden h-full">
      <style>{`
        @keyframes marquee-vertical-tweets {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical-tweets {
          animation: marquee-vertical-tweets 40s linear infinite;
        }
        .animate-marquee-vertical-tweets:hover {
          animation-play-state: paused;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full animate-marquee-vertical-tweets space-y-3.5 pr-0.5">
        {[...tweets, ...tweets].map((tweet, idx) => (
          <div
            key={`${tweet.id}-${idx}`}
            className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col ${
              isDark 
                ? 'bg-[#070d19] border-[#1e2d44]/60 hover:bg-[#0c182c]' 
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <img 
                src={tweet.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
                alt="avatar" 
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-cyan-500/20 shrink-0 object-cover" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <h4 className={`text-[10.5px] font-bold truncate ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                    {tweet.username}
                  </h4>
                  {tweet.verified && <span className="text-[8px] text-sky-400 font-extrabold shrink-0">✓</span>}
                </div>
                <span className={`text-[8.5px] font-mono block leading-none ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                  @{tweet.handle}
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-mono shrink-0">
                {tweet.timeAgo}
              </span>
            </div>
            
            <p className={`text-[10.5px] leading-relaxed mt-2.5 font-sans select-text ${isDark ? 'text-slate-300' : 'text-[#1e293b]'}`}>
              {tweet.content}
            </p>

            <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-slate-800/10 dark:border-slate-800/35 text-[8.5px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 select-none">
                ❤️ {tweet.likes}
              </span>
              <span className="flex items-center gap-1 select-none">
                🔁 {tweet.retweets}
              </span>
              <span className="ml-auto text-[7px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-black font-mono tracking-widest uppercase select-none">
                X_API
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Seamless vertical fade overlays */}
      <div className={`absolute top-0 left-0 w-full h-8 pointer-events-none bg-gradient-to-b ${isDark ? 'from-[#0a1424] to-transparent' : 'from-white to-transparent'} z-10`} />
      <div className={`absolute bottom-0 left-0 w-full h-8 pointer-events-none bg-gradient-to-t ${isDark ? 'from-[#0a1424] to-transparent' : 'from-white to-transparent'} z-10`} />
    </div>
  );
}

export function MarqueeNews({ news, isDark }: { news: any[]; isDark: boolean }) {
  return (
    <div className="relative flex-1 overflow-hidden h-full">
      <style>{`
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical-unified {
          animation: marquee-vertical 35s linear infinite;
        }
        .animate-marquee-vertical-unified:hover {
          animation-play-state: paused;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full animate-marquee-vertical-unified space-y-3.5 pr-0.5">
        {[...news, ...news].map((item, idx) => {
          const isPos = item.impacto_reputacao === 'positivo' || 
                        (item.impact && !Object.values(item.impact as Record<string, number>).some(v => (v as number) < 0));
          return (
            <div 
              key={`${item.id}-${idx}`} 
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-[#070d19] border-[#1e2d44]/60 hover:bg-[#0c182c]' 
                  : 'bg-white border-slate-205 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-black uppercase text-cyan-400 font-mono tracking-wider">
                  📰 {item.portal_nome || item.outlet}
                </span>
                <span className="text-[8px] text-slate-405 font-mono font-medium">
                  {item.tempo_passado || item.timeAgo}
                </span>
              </div>
              
              <p className={`text-[10.5px] font-semibold mt-2 leading-relaxed font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {item.manchete_texto || item.headline}
              </p>
              
              {item.commentary && (
                <p className={`text-[9.5px] mt-1 italic leading-snug font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.commentary}
                </p>
              )}

              {item.kpis && item.kpis.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.kpis.map((kp: string, kIdx: number) => (
                    <span key={kIdx} className={`text-[7.5px] font-extrabold font-mono px-1.5 py-0.5 rounded leading-none ${
                      kp.startsWith('-') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {kp}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/10 dark:border-slate-800/35">
                {isPos ? (
                  <span className="text-[7.5px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                    IMPACTO POSITIVO
                  </span>
                ) : (
                  <span className="text-[7.5px] font-black bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                    IMPACTO NEGATIVO
                  </span>
                )}

                <span className="text-[7.5px] text-slate-400 font-mono uppercase font-bold tracking-wider select-none">
                  DATA ENGINE • LIVE HOOK
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seamless vertical fade overlays */}
      <div className={`absolute top-0 left-0 w-full h-8 pointer-events-none bg-gradient-to-b ${isDark ? 'from-[#0a1424] to-transparent' : 'from-white to-transparent'} z-10`} />
      <div className={`absolute bottom-0 left-0 w-full h-8 pointer-events-none bg-gradient-to-t ${isDark ? 'from-[#0a1424] to-transparent' : 'from-white to-transparent'} z-10`} />
    </div>
  );
}

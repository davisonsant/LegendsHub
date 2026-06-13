/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Newspaper, Tv, RefreshCw, Send, Radio } from 'lucide-react';
import { GameState } from '../types';
import { getGameAssetUrl, getImageUrl } from '../utils/gameAssets';

interface NotificationsTabProps {
  gameState: GameState;
  theme: 'light' | 'dark';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: 'Transferências' | 'Cenário' | 'Social';
  time: string;
  likes: number;
  read?: boolean;
}

const ALL_NEWS_POOL: NewsItem[] = [
  {
    id: 'news-1',
    title: '🔥 RED Canids anuncia contratação histórica de Midlaner Coreano',
    summary: 'A organização oficializou a chegada do pro-player vindo diretamente da LCK. Os vistos regulamentados e a documentação na Receita Federal foram finalizados nos acréscimos para o próximo split.',
    source: 'CBLOL Portal',
    category: 'Transferências',
    time: '32 min atrás',
    likes: 142
  },
  {
    id: 'news-2',
    title: '🛠️ Riot Games anuncia Patch 14.15 ajustando Atiradores de longo alcance',
    summary: 'Mudanças no meta de builds e nerf nos principais atiradores mobilizaram as comissões técnicas a formularem táticas alternativas. Scrims da semana ditarão como as orgs vão se adaptar.',
    source: 'Riot Competições',
    category: 'Cenário',
    time: '1 hora atrás',
    likes: 310
  },
  {
    id: 'news-3',
    title: '💬 @RiftNews: Discussão esquenta no Twitter/X sobre limites do Teto Salarial',
    summary: 'Fãs debatem se a multa de Luxo (Luxury Tax) de 150% cobrada das grandes organizações de esports do CBLOL é justa para incentivar a revelação de novatos da Academy.',
    source: 'Twitter / Redes',
    category: 'Social',
    time: '2 horas atrás',
    likes: 95
  },
  {
    id: 'news-4',
    title: '✈️ Consulado aprova liberação de Vistos de Trabalho para 4 atletas estrangeiros',
    summary: 'Em contato com a imigração, as autorizações consulares de visto P-1 e EB-1 foram despachadas. Menos pressão de aliciamento (poaching) no mercado de transferências nacional.',
    source: 'Imigração Informes',
    category: 'Transferências',
    time: '4 horas atrás',
    likes: 88
  },
  {
    id: 'news-5',
    title: '🏆 Novo formato da Chave Suíça do Mundial de League of Legends é revelada',
    summary: 'Representantes brasileiros do CBLOL enfrentarão maior amostragem de partidas BO3 na fase inicial de grupos. Treinamento na Gaming House será redobrado pelas orgs candidatas.',
    source: 'Riot Games Oficial',
    category: 'Cenário',
    time: 'Ontem',
    likes: 420
  },
  {
    id: 'news-6',
    title: '🗣️ @BrTT1: "A união do elenco dita quem beija a taça no fim do split"',
    summary: 'Mito do cenário nacional interage com a torcida frisando a relevância da saúde mental dos atletas titulares versus os reservas e a carga horária em Solo Queue.',
    source: 'Cenário Social',
    category: 'Social',
    time: '2 dias atrás',
    likes: 580
  },
  {
    id: 'news-7',
    title: '💼 paiN Gaming reestrutura equipe de Infraestrutura de Dados e Staff técnico',
    summary: 'Renovação completa de treinadores assistentes e psicólogos táticos para o CBLOL. A folha semanal da paiN passa a ser a segunda maior da história da liga nacional.',
    source: 'Esports Brasil',
    category: 'Transferências',
    time: '3 dias atrás',
    likes: 215
  },
  {
    id: 'news-8',
    title: '⚡ KaBuM! Esports inaugura Gaming Office de Última Geração em São Paulo',
    summary: 'Um espaço tecnológico de 600m² com salas de stream redundantes, psicólogos especializados e salas dedicadas de VOD review automatizadas por algoritmos proprietários.',
    source: 'KaBuM! Press',
    category: 'Cenário',
    time: '3 dias atrás',
    likes: 180
  },
  {
    id: 'news-9',
    title: '🎙️ @Baiano: Arena Ilha das Lendas bate recorde de públicos concorrentes',
    summary: 'A transmissão comunitária de playoffs alcançou a histórica marca de 250 mil telespectadores sintonizados em tempo simultâneo na Twitch e YouTube.',
    source: 'Comunidade Lendas',
    category: 'Social',
    time: '4 dias atrás',
    likes: 890
  },
  {
    id: 'news-10',
    title: '🧠 LOUD recruta Cientista de Dados focado em análises mecânicas de Draft',
    summary: 'Doutorando do ITA chega à verdinha com soluções dinâmicas de regressão estatística nos bloqueios e escolhas do cenário para mitigar counterpicks indesejados.',
    source: 'LOUD Analytics',
    category: 'Transferências',
    time: '5 dias atrás',
    likes: 1040
  },
  {
    id: 'news-11',
    title: '📈 Estudo de mercado aponta crescimento de 45% na audiência do CBLOL Academy',
    summary: 'Os campeonatos de jovens talentos capturaram maior preferência de marcas não-endêmicas do varejo que desejam conversar com gerações hiperconectadas.',
    source: 'Esports Insights',
    category: 'Cenário',
    time: '5 dias atrás',
    likes: 312
  },
  {
    id: 'news-12',
    title: '💥 @Robolol: "Nosso objetivo nesta temporada é disputar os playoffs do Mundial"',
    summary: 'O combativo jogador de rota superior da matilha reiterou sua ambição global na busca do topo contra gigantes coreanas e chinesas nas eliminatórias internacionais.',
    source: 'Social Press',
    category: 'Social',
    time: '6 dias atrás',
    likes: 720
  },
  {
    id: 'news-13',
    title: '🔄 Liberty anuncia promoção de caçador titular adaptando rodagens táticas',
    summary: 'A staff tática justificou a alteração afirmando que o novo caçador possui taxa superior de lutas por objetivos primários de mapa em comparação com a concorrência.',
    source: 'Staff Report',
    category: 'Transferências',
    time: '1 semana atrás',
    likes: 155
  },
  {
    id: 'news-14',
    title: '🎮 Patch Notes 14.16 projeta remodelação forte para Dragões de Montanha',
    summary: 'A Riot sinalizou aumento pontual na porcentagem defensiva extra das almas de dragão terrestres. O remanejamento tático deve ser crucial para composições defensivas.',
    source: 'Balance League',
    category: 'Cenário',
    time: '1 semana atrás',
    likes: 495
  },
  {
    id: 'news-15',
    title: '🔥 @Tinowns: "O entrosamento do Mid-Jungle dita o ritmo estratégico em 2026"',
    summary: 'O experiente jogador da rota central expressou de forma enfática que a comunicação e sincronicidade dos caçadores com o meio resolvem combates de início de partida.',
    source: 'Mid Chronicles',
    category: 'Social',
    time: '1 semana atrás',
    likes: 1210
  }
];

export default function NotificationsTab({ gameState, theme }: NotificationsTabProps) {
  const [filter, setFilter] = useState<'Todas' | 'Transferências' | 'Cenário' | 'Social'>('Todas');

  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('legendshub_notifications_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    const initialPool = ALL_NEWS_POOL.map(n => ({ ...n, read: true }));
    try {
      localStorage.setItem('legendshub_notifications_news', JSON.stringify(initialPool));
    } catch (_) {}
    return initialPool;
  });

  useEffect(() => {
    // Mark all as read when opening the NotificationsTab
    try {
      const saved = localStorage.getItem('legendshub_notifications_news');
      let currentList = [];
      if (saved) {
        currentList = JSON.parse(saved);
      } else {
        currentList = [...news];
      }
      const updated = currentList.map((n: any) => ({ ...n, read: true }));
      localStorage.setItem('legendshub_notifications_news', JSON.stringify(updated));
      setNews(updated);
      window.dispatchEvent(new Event('news-updated'));
    } catch (e) {
      console.warn("Could not mark news as read:", e);
    }
  }, []);

  // Index pointer tracking pool rotation in circular loop
  const [rotationIndex, setRotationIndex] = useState(0);

  const filteredNews = filter === 'Todas' ? news : news.filter(n => n.category === filter);

  const handleLike = (id: string) => {
    setNews(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n);
      try {
        localStorage.setItem('legendshub_notifications_news', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Infinite sliding loop: Rotates the feed items keeping exactly max 15 items in active view
  const triggerInfiniteLoop = () => {
    setNews(prev => {
      // Rotate 3 items at a time
      const shiftCount = 3;
      
      // Items that are kept from the previous state
      const remainingItems = prev.slice(shiftCount);

      // Create new fresh looped items from the pool
      const newIncoming: NewsItem[] = [];
      for (let i = 0; i < shiftCount; i++) {
        const nextPoolIndex = (rotationIndex + i) % ALL_NEWS_POOL.length;
        const template = ALL_NEWS_POOL[nextPoolIndex];
        
        // Feed newest timestamp first, and random offset to likes for dynamism
        newIncoming.push({
          ...template,
          id: `news-rot-${nextPoolIndex}-${Date.now()}-${i}`,
          time: 'Agora mesmo',
          likes: Math.max(10, template.likes + Math.floor(Math.random() * 40) - 15),
          read: true // Read true as the user is actively viewing the screen
        });
      }

      setRotationIndex(prevIdx => (prevIdx + shiftCount) % ALL_NEWS_POOL.length);

      const updated = [...remainingItems, ...newIncoming];
      try {
        localStorage.setItem('legendshub_notifications_news', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // When scroll reaches near 80% scroll bottom, trigger infinite news loop loaders
    if (target.scrollHeight - target.scrollTop <= target.clientHeight * 1.6) {
      triggerInfiniteLoop();
    }
  };

  const getCategoryBadge = (cat: NewsItem['category']) => {
    switch (cat) {
      case 'Transferências':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cenário':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Social':
        return 'bg-[#00cbd6]/10 text-[#00cbd6] border border-[#00cbd6]/20';
    }
  };

  const renderCard = (item: NewsItem, isDup = false) => {
    const itemAny = item as any;
    const imageUrl = (itemAny.portal?.logo_blob)
      ? getImageUrl(itemAny.portal.logo_blob)
      : (itemAny.logo_blob)
      ? getImageUrl(itemAny.logo_blob)
      : (itemAny.image_blob)
      ? getImageUrl(itemAny.image_blob)
      : getGameAssetUrl('press', item.source || item.id, 'assets/ui/fallback-press.png');
    
    return (
      <div 
        key={`${isDup ? 'dup-' : ''}${item.id}-${filter}`}
        className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.006] animate-slide-in ${
          theme === 'dark' 
            ? 'bg-[#0d1b2e]/35 border-[#1e2d44]/65 hover:border-sky-500/25' 
            : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/30'
        }`}
      >
        <div className="flex gap-3.5 items-start">
          {/* Logo Portal de Imprensa */}
          <div className="w-12 h-12 rounded-lg border border-slate-700/10 dark:border-sky-540/15 overflow-hidden shrink-0 bg-transparent flex items-center justify-center p-0.5">
            <img 
              src={imageUrl} 
              alt="Portal Logo" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-transparent"
              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/ui/fallback-press.png'; }}
            />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className={`text-[8.5px] font-mono leading-none tracking-widest font-black uppercase px-2 py-0.5 rounded ${getCategoryBadge(item.category)}`}>
                {item.category}
              </span>
              <span className="text-[8px] font-mono text-slate-400">{item.time}</span>
            </div>

            <h4 className={`text-xs font-black leading-snug truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {item.title}
            </h4>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
              {item.summary}
            </p>
          </div>
        </div>

        {/* Footer and interaction */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800/10 dark:border-slate-800/40 mt-3 text-[9px] font-mono">
          <span className="text-sky-400 font-bold flex items-center gap-1">
            <Tv className="w-3 h-3 text-sky-400 shrink-0" />
            {item.source}
          </span>
          
          <button 
            onClick={() => handleLike(item.id)}
            className="flex items-center gap-1.5 px-2 py-0.8 rounded hover:bg-red-500/10 hover:text-red-400 transition text-slate-450 uppercase cursor-pointer text-[9px]"
          >
            ❤️ {item.likes} Likes
          </button>
        </div>

      </div>
    );
  };

  return (
    <div id="notifications-panel-root" className={`p-5 rounded-2xl border flex flex-col h-[72vh] shadow-lg select-none ${
      theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
    }`}>
      <style>{`
        @keyframes marqueeVertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        .marquee-container-wrapper {
          overflow: hidden;
          position: relative;
          height: 680px; /* Ajuste para cobrir a altura visível ideal do painel */
        }

        .animate-marquee-vertical-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: marqueeVertical 30s linear infinite;
        }

        .animate-marquee-vertical-grid:hover {
          animation-play-state: paused; /* Pausa o feed quando o usuário passa o mouse */
        }
      `}</style>
      
      {/* Upper header notifications */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800/20 dark:border-slate-805">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500 animate-pulse" />
          <div>
            <h3 className={`font-display text-sm font-black uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>Cenário Competitivo & Notícias</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Acompanhe as notícias de bastidores e coberturas do League of Legends global.</p>
          </div>
        </div>

        {/* Categories toggles selector */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={triggerInfiniteLoop}
            title="Popular mais notícias em loop infinito"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide border transition duration-150 ${
              theme === 'dark' 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20' 
                : 'bg-sky-50 border-sky-300 text-sky-600 hover:bg-sky-100'
            }`}
          >
            <RefreshCw className="w-3 h-3 animate-spin duration-[4000ms]" />
            Feed Infinito
          </button>

          <div className={`flex rounded-lg p-0.5 border ${
            theme === 'dark' ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
          }`}>
            {(['Todas', 'Transferências', 'Cenário', 'Social'] as const).map((tab) => {
              const isSel = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition duration-150 cursor-pointer ${
                    isSel 
                      ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                      : theme === 'dark'
                        ? 'text-slate-450 hover:text-slate-200'
                        : 'text-slate-650 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of feed reports */}
      <div 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar p-1 pt-4"
      >
        {filteredNews.length > 0 ? (
          <div className="space-y-4">
            <div className="marquee-container-wrapper">
              <div className="animate-marquee-vertical-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNews.map((item) => renderCard(item, false))}
                </div>
                
                {/* Duplicated layout for seamless continuous marquee loop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-hidden="true">
                  {filteredNews.map((item) => renderCard(item, true))}
                </div>
              </div>
            </div>

            {/* Visual infinite load status tracker bar */}
            <div className={`py-4 rounded-xl border text-center flex items-center justify-center gap-2 ${
              theme === 'dark' ? 'bg-[#0d1b2e]/15 border-[#1e2d44]/50 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Você chegou ao fim provisório. Role para baixo para carregar mais do Feed Infinito... ({news.length} lidas)
              </span>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-2">
            <Newspaper className="w-10 h-10 text-slate-550 stroke-1" />
            <p className="text-[10.5px] text-slate-500 italic">Nenhuma notícia correspondente no momento.</p>
          </div>
        )}
      </div>

    </div>
  );
}

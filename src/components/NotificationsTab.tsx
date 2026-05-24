import React, { useState } from 'react';
import { Bell, Newspaper, Tv, RefreshCw, Send, Radio } from 'lucide-react';
import { GameState } from '../types';

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
}

export default function NotificationsTab({ gameState, theme }: NotificationsTabProps) {
  const [filter, setFilter] = useState<'Todas' | 'Transferências' | 'Cenário' | 'Social'>('Todas');

  const [news, setNews] = useState<NewsItem[]>(() => {
    return [
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
      }
    ];
  });

  const filteredNews = filter === 'Todas' ? news : news.filter(n => n.category === filter);

  const handleLike = (id: string) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n));
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

  return (
    <div id="notifications-panel-root" className={`p-5 rounded-2xl border flex flex-col h-[72vh] shadow-lg select-none ${
      theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
    }`}>
      
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

      {/* Grid of feed reports */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4 pt-4">
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.006] ${
                  theme === 'dark' 
                    ? 'bg-[#0d1b2e]/35 border-[#1e2d44]/65 hover:border-sky-500/25' 
                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8.5px] font-mono leading-none tracking-widest font-black uppercase px-2 py-0.5 rounded ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">{item.time}</span>
                  </div>

                  <h4 className={`text-xs font-black leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {item.summary}
                  </p>
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
            ))}
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

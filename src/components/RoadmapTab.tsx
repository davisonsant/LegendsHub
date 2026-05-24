import React, { useState, useEffect } from 'react';
import { Milestone, Compass, Lock, Unlock, Plus, Trash2, Edit2, Check, AlertTriangle, HelpCircle, Save } from 'lucide-react';
import { GameState } from '../types';

interface RoadmapTabProps {
  gameState: GameState;
  theme: 'light' | 'dark';
  triggerNotification?: (title: string, desc: string) => void;
}

interface RoadmapItem {
  id: string;
  quarter: string; // e.g. "Q2 2026"
  title: string;
  description: string;
  status: 'Em Desenvolvimento' | 'Planejado' | 'Pesquisado';
  priority: 'low' | 'medium' | 'high';
  isChangelog?: boolean; // if true, it's in the changelog section!
}

export default function RoadmapTab({ gameState, theme, triggerNotification }: RoadmapTabProps) {
  // Authentication states
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('legendshub_admin_auth') === 'true';
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Roadmap & Changelog items list stored in state & synchronized with localStorage
  const [items, setItems] = useState<RoadmapItem[]>(() => {
    const saved = localStorage.getItem('legendshub_roadmap_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return [
      // Roadmap items
      {
        id: 'road-1',
        quarter: 'Fase 1: Próximo Mês',
        title: '🎯 Simulador Avançado de Draft de Campeões 2.0',
        description: 'Implementação de algoritmo de Inteligência Artificial para as escolhas de Ban/Pick das equipes rivais baseadas nas estatísticas de vitórias e sinergia do patch.',
        status: 'Em Desenvolvimento',
        priority: 'high'
      },
      {
        id: 'road-2',
        quarter: 'Fase 2: Próximo Split',
        title: '🏆 Campeonatos de Base Multinacionais da Academy',
        description: 'Inserção de novos olheiros e torneios amadores regionais para revelar atletas estrangeiros e facilitar a tramitação de vistos diretamente da juventude.',
        status: 'Planejado',
        priority: 'medium'
      },
      {
        id: 'road-3',
        quarter: 'Fase 3: Novas Ligas',
        title: '🌍 Ligas Coreanas (LCK) e Europeias (LEC) Jogáveis',
        description: 'Suporte completo para migrar de país assumindo elencos globais e contratando de qualquer lugar com orçamentos em dólares e euros regulados.',
        status: 'Pesquisado',
        priority: 'low'
      },
      // Changelog items (isChangelog: true)
      {
        id: 'change-1',
        quarter: 'V1.0.2 - Correção Crucial',
        title: '⚖️ Ajuste do Coeficiente de Visto EB-1 e Luxury Tax',
        description: 'Teto salarial elevado para $120.000 semanais. Correção nos prazos no Consulado Americano e redução da taxa de luxo recursiva para 150% do valor excedido.',
        status: 'Em Desenvolvimento',
        priority: 'high',
        isChangelog: true
      },
      {
        id: 'change-2',
        quarter: 'V1.0.1 - Minor Update',
        title: '🎨 Novo painel do Escritório e Calendário CBLOL',
        description: 'Desenho visual moderno com filtros semanais rápidos, sistema de licenciamento e relatórios fiscais semanais no recap da org.',
        status: 'Planejado',
        priority: 'medium',
        isChangelog: true
      },
      {
        id: 'change-3',
        quarter: 'V1.0.0 - Versão Incial',
        title: '🚀 Lançamento Oficial do Portal LegendsHub',
        description: 'Lançamento original com inteligência tática, estatísticas, transferências no CBLOL e simulação de partidas BO3/BO5.',
        status: 'Em Desenvolvimento',
        priority: 'low',
        isChangelog: true
      }
    ];
  });

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('legendshub_roadmap_items', JSON.stringify(items));
  }, [items]);

  // Form states for creating or editing items
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [formInput, setFormInput] = useState<Partial<RoadmapItem>>({
    quarter: '',
    title: '',
    description: '',
    status: 'Planejado',
    priority: 'medium',
    isChangelog: false
  });

  // Authentication Flow Handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin-gaming@developer.com') {
      setIsAdmin(true);
      localStorage.setItem('legendshub_admin_auth', 'true');
      setLoginForm({ username: '', password: '' });
      setLoginError('');
      setShowAuthModal(false);
      if (triggerNotification) {
        triggerNotification("🔓 Autenticado!", "Privilégios de Administrador ativados para editar o Roadmap.");
      }
    } else {
      setLoginError('Credenciais inválidas! Tente novamente.');
      if (triggerNotification) {
        triggerNotification("❌ Falha de Login", "Código ou senha incorretos.");
      }
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.setItem('legendshub_admin_auth', 'false');
    setIsEditingId(null);
    if (triggerNotification) {
      triggerNotification("🔒 Desconectado", "Seu acesso de admin foi revogado.");
    }
  };

  // CRUD Operations (Only accessible with isAdmin = true)
  const handleAddNewItem = () => {
    if (!isAdmin) {
      triggerNotification?.("🔒 Bloqueado", "Apenas usuários com privilégios de Admin podem mudar os dados.");
      return;
    }
    const newItem: RoadmapItem = {
      id: 'road_' + Math.random().toString(36).substr(2, 9),
      quarter: formInput.quarter || 'Q3 2026',
      title: formInput.title || 'Nova Função',
      description: formInput.description || 'Descrição detalhada do lançamento.',
      status: (formInput.status as any) || 'Planejado',
      priority: (formInput.priority as any) || 'medium',
      isChangelog: formInput.isChangelog || false
    };

    setItems(prev => [newItem, ...prev]);
    setFormInput({
      quarter: '',
      title: '',
      description: '',
      status: 'Planejado',
      priority: 'medium',
      isChangelog: false
    });
    if (triggerNotification) {
      triggerNotification("✨ Cadastrado com Êxito!", `Item "${newItem.title}" adicionado.`);
    }
  };

  const handleStartEdit = (item: RoadmapItem) => {
    if (!isAdmin) return;
    setIsEditingId(item.id);
    setFormInput({ ...item });
  };

  const handleSaveEdit = () => {
    if (!isAdmin || !isEditingId) return;
    setItems(prev => prev.map(item => {
      if (item.id === isEditingId) {
        return {
          ...item,
          quarter: formInput.quarter || item.quarter,
          title: formInput.title || item.title,
          description: formInput.description || item.description,
          status: (formInput.status as any) || item.status,
          priority: (formInput.priority as any) || item.priority,
          isChangelog: formInput.isChangelog !== undefined ? formInput.isChangelog : item.isChangelog
        };
      }
      return item;
    }));
    setIsEditingId(null);
    setFormInput({
      quarter: '',
      title: '',
      description: '',
      status: 'Planejado',
      priority: 'medium',
      isChangelog: false
    });
    if (triggerNotification) {
      triggerNotification("📝 Alteração Gravada!", "Suas edições foram salvas com sucesso.");
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!isAdmin) return;
    if (confirm("🚨 DELETAR ITEM? Tem certeza que deseja excluir esta entrada?")) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (triggerNotification) {
        triggerNotification("🗑️ Excluído!", "Entrada deletada da linha do tempo permanente.");
      }
    }
  };

  const getPriorityInfo = (pri: RoadmapItem['priority']) => {
    switch (pri) {
      case 'high':
        return { label: 'Crítico / Alta Urgência', color: 'text-red-400 border-red-500/20 bg-red-500/5 hover:border-red-500/35' };
      case 'medium':
        return { label: 'Média Urgência', color: 'text-amber-400 border-amber-500/25 bg-amber-500/5 hover:border-amber-500/35' };
      case 'low':
        return { label: 'Baixa Urgência', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30' };
    }
  };

  return (
    <div id="roadmap-changelog-panel-root" className="space-y-6 h-[72vh] overflow-y-auto custom-scrollbar pr-1 select-none">
      
      {/* Header section with credentials locking status representation */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <Milestone className="w-5.5 h-5.5 text-blue-400 shrink-0" />
          <div>
            <h3 className={`font-display text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Roadmap & Histórico de Atualizações (Changelog)
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">Explore o planejamento tecnológico de próximas versões do game ou alterne para o modo admin.</p>
          </div>
        </div>

        {/* Credentials Protection Status bar */}
        <div>
          {isAdmin ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
              <Unlock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-[9.5px] font-extrabold text-emerald-400 uppercase leading-none">Acesso Admin: Liberado</p>
                <button 
                  onClick={handleLogout}
                  className="text-[8.5px] text-slate-400 hover:text-white underline block text-left mt-0.5 cursor-pointer"
                >
                  Sair do Modo Admin
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/15 px-3 py-1.5 rounded-lg">
              <Lock className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-[9.5px] font-extrabold text-[#fc4b6c] uppercase leading-none">Edição Tabela: Bloqueado</p>
                <button 
                  onClick={() => {
                    setLoginError('');
                    setShowAuthModal(true);
                  }}
                  className="text-[8.5px] text-sky-450 hover:text-[#00cbd6] hover:scale-102 transition duration-150 block text-left mt-0.5 font-bold cursor-pointer"
                >
                  🔑 Autenticar-se (Login: admin)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRUD PANEL (Visible only when Admin is active) */}
      {isAdmin && (
        <div className={`p-5 rounded-2xl border space-y-4 animate-fade-in ${
          theme === 'dark' ? 'bg-[#0d1c31]/50 border-blue-500/25' : 'bg-blue-50/20 border-blue-200/50'
        }`}>
          <div className="border-b border-blue-550/15 pb-2">
            <h4 className="font-display text-xs font-black uppercase text-[#00cbd6] flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> 
              {isEditingId ? '⚙️ Editar Entrada Existente' : '✨ Cadastrar Entrada no Roadmap / Changelog'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[10.5px]">
            <div className="space-y-1">
              <label className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Versão / Fase / Período</label>
              <input 
                type="text"
                placeholder="Ex: Fase 1 ou V1.1.0"
                value={formInput.quarter || ''}
                onChange={(e) => setFormInput({ ...formInput, quarter: e.target.value })}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-sky-500' : 'bg-white border-slate-205 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Título da Função / Correção</label>
              <input 
                type="text"
                placeholder="Ex: Novo algoritmo de contratação"
                value={formInput.title || ''}
                onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-sky-500' : 'bg-white border-slate-205 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Seção de Enquadramento</label>
              <select 
                value={formInput.isChangelog ? 'changelog' : 'roadmap'}
                onChange={(e) => setFormInput({ ...formInput, isChangelog: e.target.value === 'changelog' })}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white cursor-pointer' : 'bg-white border-slate-205 text-slate-800 cursor-pointer'
                }`}
              >
                <option value="roadmap">📆 Roadmap Futuro</option>
                <option value="changelog">📜 Changelog Antigo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[10.5px]">
            <div className="space-y-1 md:col-span-2">
              <label className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Descrição Detalhada</label>
              <input 
                type="text"
                placeholder="Ex: Detalhamento do que essa função adiciona para a economia..."
                value={formInput.description || ''}
                onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-sky-500' : 'bg-white border-slate-205 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Urgência / Prioridade</label>
              <select 
                value={formInput.priority || 'medium'}
                onChange={(e) => setFormInput({ ...formInput, priority: e.target.value as any })}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white cursor-pointer' : 'bg-white border-slate-205 text-slate-800 cursor-pointer'
                }`}
              >
                <option value="low">🟢 Baixa Prioridade</option>
                <option value="medium">🟡 Média Prioridade</option>
                <option value="high">🔴 Alta / Crítica</option>
              </select>
            </div>

            <div className="flex items-end">
              {isEditingId ? (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-transform cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingId(null);
                      setFormInput({
                        quarter: '',
                        title: '',
                        description: '',
                        status: 'Planejado',
                        priority: 'medium',
                        isChangelog: false
                      });
                    }}
                    className="py-2.5 px-3 bg-slate-800 text-slate-350 hover:bg-slate-700 text-[10px] uppercase font-bold rounded-lg cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddNewItem}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-550 text-white text-[10px] uppercase font-black tracking-widest rounded-lg font-mono cursor-pointer"
                >
                  ➕ Adicionar Entrada
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROADMAP VS CHANGELOG DISPLAY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        
        {/* Left Column: FUTURE ROADMAP */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/20 dark:border-slate-850 pb-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h4 className={`font-display text-sm font-black uppercase text-indigo-400`}>📆 Linha do Tempo: Próximas Funções</h4>
          </div>

          <div className="space-y-3">
            {items.filter(i => !i.isChangelog).map((item) => {
              const pri = getPriorityInfo(item.priority || 'medium');
              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border relative transition-all duration-350 flex flex-col justify-between ${
                    theme === 'dark' 
                      ? 'bg-[#0d1b2e]/30 border-[#1e2d44]/70 hover:border-indigo-400/25' 
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-12">
                      <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest leading-none">
                        {item.quarter}
                      </span>
                      <span className={`text-[8.5px] font-mono font-bold leading-none tracking-wider px-2 py-0.5 rounded border ${pri?.color}`}>
                        {pri?.label}
                      </span>
                    </div>

                    <h5 className={`text-xs font-black leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-850'}`}>
                      {item.title}
                    </h5>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{item.description}</p>
                  </div>

                  {/* Admin inline management buttons */}
                  {isAdmin && (
                    <div className="absolute top-4 right-3 flex items-center gap-1 opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 rounded bg-[#1c2d44] hover:bg-sky-500/20 text-sky-400 border border-slate-705 cursor-pointer text-[8px]"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded bg-red-950/40 hover:bg-red-500/20 text-red-400 border border-red-500/25 cursor-pointer text-[8px]"
                        title="Deletar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: HISTORICAL CHANGELOG */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/20 dark:border-slate-850 pb-2">
            <Milestone className="w-5 h-5 text-emerald-400" />
            <h4 className={`font-display text-sm font-black uppercase text-emerald-400`}>📜 Changelog: Mudanças & Versões</h4>
          </div>

          <div className="space-y-3">
            {items.filter(i => i.isChangelog).map((item) => {
              const pri = getPriorityInfo(item.priority || 'medium');
              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border relative transition-all duration-350 flex flex-col justify-between ${
                    theme === 'dark' 
                      ? 'bg-[#0d1b2e]/30 border-[#1e2d44]/70 hover:border-emerald-500/25' 
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-12">
                      <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest leading-none">
                        {item.quarter}
                      </span>
                      <span className={`text-[8.5px] font-mono leading-none tracking-wider px-2 py-0.5 rounded border ${pri?.color}`}>
                        ✓ Estável
                      </span>
                    </div>

                    <h5 className={`text-xs font-black leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-850'}`}>
                      {item.title}
                    </h5>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{item.description}</p>
                  </div>

                  {/* Admin inline management buttons */}
                  {isAdmin && (
                    <div className="absolute top-4 right-3 flex items-center gap-1 opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 rounded bg-[#1c2d44] hover:bg-sky-500/20 text-sky-400 border border-slate-705 cursor-pointer text-[8px]"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded bg-red-950/40 hover:bg-red-500/20 text-red-400 border border-red-500/25 cursor-pointer text-[8px]"
                        title="Deletar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CREDENTIALS DIALOG MODAL (Apenas para autenticar o admin) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl relative ${
            theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44] text-slate-200' : 'bg-white border-slate-210 text-slate-850'
          }`}>
            <h4 className="font-display font-black text-sm uppercase text-sky-450 mb-1">🔐 Login de Segurança - ADMIN</h4>
            <p className="text-[9.5px] text-slate-400 mb-4">Apenas desenvolvedores auditados podem liberar as edições na tabela de controle de roadmap público.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[8.5px] font-mono font-bold uppercase text-slate-400">Usuário de Acesso</label>
                <input 
                  type="text"
                  required
                  placeholder="admin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none mt-1 ${
                    theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-sky-500' : 'bg-white border-slate-205 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[8.5px] font-mono font-bold uppercase text-slate-400">Senha do Sistema</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none mt-1 ${
                    theme === 'dark' ? 'bg-slate-900 border-[#1e2d44] text-white focus:border-sky-500' : 'bg-white border-slate-205 text-slate-800'
                  }`}
                />
                <span className="block text-[8px] text-slate-450 mt-1 italic leading-normal">
                  Dica de Teste: Login: <strong className="text-slate-350">admin</strong> / Senha: <strong className="text-slate-350">admin-gaming@developer.com</strong>
                </span>
              </div>

              {loginError && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/15 text-red-400 text-[9px] font-bold">
                  {loginError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-550 text-white text-[10px] uppercase font-black tracking-widest rounded-lg cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 bg-slate-800/60 text-slate-400 hover:bg-slate-750 text-[10px] uppercase font-bold rounded-lg cursor-pointer"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

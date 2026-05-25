/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Tv, Heart, Keyboard, Users, ShieldAlert, Globe, 
  MapPin, DollarSign, Calendar, Check, Play, UserMinus, Plus,
  Sparkles, Award, FileText, X, AlertCircle
} from 'lucide-react';
import { GameState, Team, Player, Staff } from '../types';

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

export default function GamingOfficeTab({
  gameState,
  onUpdateGameState,
  triggerNotification,
  theme = 'light'
}: GamingOfficeTabProps) {
  const isDark = theme === 'dark';
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;

  // 1. Physical Infrastructure level trackers in state
  const studioLevel = playerTeam.infrastructure?.mediaTeamLevel || 1;
  const mentalLevel = playerTeam.infrastructure?.trainingCenterLevel || 1;
  const gamingRoomLevel = playerTeam.infrastructure?.gamingHouseLevel || 1;

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

  // Upgrades configurations
  const upgrades = [
    {
      id: 'studio',
      name: 'Estúdio de Mídia Integrado',
      desc: 'Melhora a produção de conteúdo semanal da equipe, aumentando o engajamento e multiplicando torcedores por semana.',
      level: studioLevel,
      max: 5,
      cost: studioLevel * 80000,
      benefit: '+10% Popularidade de Torcida Semanal',
      icon: Tv
    },
    {
      id: 'mental',
      name: 'Sala de Fisioterapia & Psicologia',
      desc: 'Minimiza o estresse das semanas de derrotas, reduz significativamente o "tilt" e acelera a recuperação de energia/estamina dos atletas.',
      level: mentalLevel,
      max: 5,
      cost: mentalLevel * 100000,
      benefit: '+5 Consistência Física de Treinos',
      icon: Heart
    },
    {
      id: 'gaming_room',
      name: 'Computadores Core Extremos',
      desc: 'Estações de simulação de alta performance alimentadas por fibra dedicada que reduzem o atraso tático dos treinos do Game.',
      level: gamingRoomLevel,
      max: 5,
      cost: gamingRoomLevel * 125000,
      benefit: '+4 Potencial de Roster por Treino',
      icon: Keyboard
    }
  ];

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
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#00cbd6]' : 'text-cyan-600'}`}>
              CENTRAL CORPORATIVA & OPERAÇÕES
            </span>
          </div>
          <h2 className={`text-lg font-display font-black uppercase tracking-wide leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sede Corporativa (Gaming Office)
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            Gerencie o crescimento de infraestrutura, supervise a contratação de especialistas, feche contratos de de TV e lance bootcamps mundiais.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
          isDark ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-[#ffffff] border-slate-200 shadow-sm'
        }`}>
          <span className="text-gray-450 block uppercase text-[8px] tracking-wider mb-0.5">Saldo Monetário</span>
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
            <Plus className="w-4 h-4 text-cyan-400" />
            Infraestrutura Operacional Avançada
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
                      <span className={`text-[9px] font-mono font-black tracking-wide px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-sky-500/15 text-sky-400 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        NíVEL {item.level} / {item.max}
                      </span>
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
                        Melhoria Total Atingida
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpgradePhysic(item.id, item.cost)}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] uppercase font-black tracking-widest rounded-lg cursor-pointer transition-all"
                      >
                        UPGRADE: $ {item.cost.toLocaleString('pt-BR')}
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
                <Users className="w-4 h-4 text-cyan-400" />
                Listagem Corporativa de Staff ({employees.length})
              </h3>
              <button
                onClick={() => setIsHiringModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Contratar Novo Funcionário
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
                          isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-650 font-bold'
                        }`}>
                          {employee.cargo}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
                        <span>Eficiência Operacional: <strong className="text-cyan-400">{employee.nivel_eficiencia}%</strong></span>
                        <span>•</span>
                        <span>Vigência Contrato: <strong>{employee.semanas_contrato} semanas</strong></span>
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
                        <span className="text-[7.5px] uppercase text-gray-400 block font-bold leading-none mb-0.5">Custo Folha</span>
                        <span className="text-xs font-mono font-black text-rose-500">$ {employee.salario_semanal.toLocaleString()}/sem</span>
                      </div>
                      <button
                        onClick={() => handleFireEmployee(employee.id, employee.nome)}
                        className={`p-1.5 rounded-lg border transition ${
                          isDark ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-slate-250 text-slate-400 hover:text-red-600 hover:bg-red-50'
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
              Direitos de TV & Transmissão (Slots Comerciais)
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
                          <span className="text-[8px] tracking-widest font-black uppercase text-cyan-400">ATIVO COMERCIALMENTE</span>
                          <h4 className="text-xs font-extrabold text-blue-500">{slot.emissora}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9.5px] border-y border-slate-800/10 dark:border-slate-800/45 py-2">
                          <div>
                            <span className="text-[7.5px] text-gray-400 block mb-0.5 uppercase leading-none">Repasse Semanal</span>
                            <span className="text-emerald-400 font-extrabold">$ {slot.repasse_semanal?.toLocaleString()}/sem</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-gray-400 block mb-0.5 uppercase leading-none">Duração Contratual</span>
                            <span className="font-extrabold text-slate-350">{slot.vigencia_restante} semanas</span>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-slate-400 flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-500 grow-0 shrink-0 mt-0.5" />
                          <span>Metas: Ficar no Top 4 do campeonato ou superior.</span>
                        </div>

                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => handleTerminateTv(slot.id, slot.multa_rescisao || 10000)}
                            className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest bg-red-650/10 text-red-400 hover:bg-red-500/15 rounded border border-red-500/20 cursor-pointer"
                          >
                            Rescindir (Multa: $ {slot.multa_rescisao?.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">SLOT EMMISSORA VAGO</p>
                        <p className="text-[8.5px] text-gray-500 mt-1 mb-3.5">Disponibilize para receber e analisar propostas lucrativas baseadas na torcida.</p>
                        <button
                          onClick={() => handleOpenTvProposal(slot.id)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[9px] uppercase rounded-lg shadow-sm cursor-pointer transition"
                        >
                          Avaliar Propostas Comerciais
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, Sparkles, AlertCircle, TrendingUp, DollarSign, ArrowUpRight, HelpCircle, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { GameState, Player, Position } from '../types';
import { generateProceduralPlayer } from '../utils/generators';
import { formatMoney } from '../utils/currency';

interface MarketTabProps {
  gameState: GameState;
  onBuyPlayer: (player: Player) => void;
  onSellProposeAccept: (player: Player, bidPrice: number) => void;
}

export default function MarketTab({
  gameState,
  onBuyPlayer,
  onSellProposeAccept
}: MarketTabProps) {
  const playerTeam = gameState.teams.find(t => t.id === gameState.playerTeamId)!;
  
  const [filterPos, setFilterPos] = useState<Position | 'ALL'>('ALL');
  const [filterMinOvr, setFilterMinOvr] = useState(85);
  const [filterRegion, setFilterRegion] = useState('Global');
  const [filterSalary, setFilterSalary] = useState('All');
  const [searchUrl, setSearchUrl] = useState('');
  
  const [availableListings, setAvailableListings] = useState<Player[]>([]);

  // Pre-populate with Screenshot 3's exact players 
  useEffect(() => {
    const s7v3n: Player = {
      id: 'market_s7v3n',
      name: 'S7V3N',
      realName: 'Seven Larsson',
      nationality: 'Sweden',
      age: 23,
      position: 'MID', // Mid-laner
      attributes: {
        mechanics: 92, macro: 90, communication: 89, leadership: 85, consistency: 93,
        emotionalControl: 91, farm: 94, mapVision: 88, playoffPerformance: 92
      },
      overallRating: 92,
      potential: 94,
      personality: 'Clutch',
      popularity: 88,
      marketValue: 840000,
      salary: 120000,
      contractMonths: 24,
      motivation: 100, stamina: 100, chemistry: 78,
      championPool: ['Azir', 'Orianna', 'Syndra'],
      isPlayerControlled: false,
      photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'
    };

    const nova: Player = {
      id: 'market_nova',
      name: 'NOVA',
      realName: 'Kim Ji-won',
      nationality: 'South Korea',
      age: 21,
      position: 'MID', // IGL
      attributes: {
        mechanics: 88, macro: 92, communication: 95, leadership: 94, consistency: 89,
        emotionalControl: 90, farm: 85, mapVision: 93, playoffPerformance: 91
      },
      overallRating: 89,
      potential: 92,
      personality: 'IGL',
      popularity: 91,
      marketValue: 1100000,
      salary: 150000,
      contractMonths: 24,
      motivation: 100, stamina: 100, chemistry: 83,
      championPool: ['Ryze', 'Twisted Fate', 'Galio'],
      isPlayerControlled: false,
      photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150'
    };

    const recoil: Player = {
      id: 'market_recoil',
      name: 'RECOIL',
      realName: 'Elias Virtanen',
      nationality: 'Finland',
      age: 22,
      position: 'ADC', // Sniper
      attributes: {
        mechanics: 96, macro: 85, communication: 82, leadership: 78, consistency: 95,
        emotionalControl: 84, farm: 96, mapVision: 85, playoffPerformance: 95
      },
      overallRating: 94,
      potential: 96,
      personality: 'Carry',
      popularity: 86,
      marketValue: 1400000,
      salary: 180000,
      contractMonths: 24,
      motivation: 100, stamina: 100, chemistry: 80,
      championPool: ['Aphelios', 'Jinx', 'Ezreal'],
      isPlayerControlled: false,
      photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'
    };

    const oracle: Player = {
      id: 'market_oracle',
      name: 'ORACLE',
      realName: 'Arthur Silva',
      nationality: 'Brazil',
      age: 19,
      position: 'SUP', // Support
      attributes: {
        mechanics: 85, macro: 88, communication: 91, leadership: 81, consistency: 87,
        emotionalControl: 93, farm: 62, mapVision: 95, playoffPerformance: 88
      },
      overallRating: 86,
      potential: 90,
      personality: 'Playmaker',
      popularity: 79,
      marketValue: 320000,
      salary: 50000,
      contractMonths: 24,
      motivation: 100, stamina: 100, chemistry: 85,
      championPool: ['Thresh', 'Rakan', 'Nautilus'],
      isPlayerControlled: false,
      photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'
    };

    // Generic fallback fillers if week advances
    const fillers = [
      generateProceduralPlayer('TOP', 86, false),
      generateProceduralPlayer('JNG', 83, false)
    ];

    setAvailableListings([s7v3n, nova, recoil, oracle, ...fillers]);
  }, [gameState.week]);

  const filteredBuyListings = availableListings.filter(p => {
    const matchesPos = filterPos === 'ALL' || p.position === filterPos;
    const matchesOvr = p.overallRating >= filterMinOvr - 2; // Tolerance range for flexibility
    const matchesSearch = !searchUrl || p.name.toLowerCase().includes(searchUrl.toLowerCase());
    return matchesPos && matchesOvr && matchesSearch;
  });

  const handleBuy = (player: Player) => {
    if (playerTeam.roster.length + playerTeam.substitutes.length >= 8) {
      alert("Seu elenco já está lotado! Dispense algum jogador primeiro antes de fazer novas aquisições.");
      return;
    }
    if (playerTeam.budget < player.marketValue) {
      alert("Finanças insuficientes! Seu budget disponível é menor do que o valor do passe do jogador.");
      return;
    }
    onBuyPlayer(player);
    setAvailableListings(prev => prev.filter(l => l.id !== player.id));
  };

  return (
    <div className="space-y-6 font-sans bg-[#f5f7fa] select-none text-slate-800">
      
      {/* Search Header Bar with tabs (Top level Screenshot 3) */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-6 py-3 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search database..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Navigation tags */}
          <div className="hidden lg:flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">
            <span className="text-sky-500 border-b-2 border-sky-500 pb-3 mt-3 cursor-pointer">Transfer Market</span>
            <span className="hover:text-slate-600 pb-3 mt-3 cursor-pointer" onClick={() => alert("Youth Scout alocado.")}>Scouting</span>
            <span className="hover:text-slate-600 pb-3 mt-3 cursor-pointer" onClick={() => alert("Youth Academy details.")}>Youth Academy</span>
            <span className="hover:text-slate-600 pb-3 mt-3 cursor-pointer" onClick={() => alert("Staff Recruiter panel.")}>Staff</span>
          </div>
        </div>

        {/* Budget Tracker summary details */}
        <div className="flex items-center gap-4 self-end md:self-auto uppercase tracking-wide">
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 block leading-none">TEAM BUDGET</span>
            <span className="font-display font-black text-blue-600 text-lg">{formatMoney(playerTeam.budget)}</span>
          </div>
          <Bell className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100" referrerPolicy="no-referrer" alt="Mgr" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Main title & filter actions blocks */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-800">
            Mercado de Transferências
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Analyze 420 active listings for the Summer Split.
          </p>
        </div>

        {/* Quick action triggers */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => alert("Parâmetros de busca refinados")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[9px] font-black px-4 py-2.5 rounded uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" /> TACTICAL FILTERS
          </button>
          
          <button 
            onClick={() => alert("Auto-Scout AI procurou 4 candidatos de Nível S!")}
            className="flex items-center gap-1.5 bg-[#006a80] hover:bg-[#005466] text-white font-mono text-[9px] font-black px-4 py-2.5 rounded uppercase tracking-wider shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> AUTO-SCOUT
          </button>
        </div>
      </div>

      {/* Sub-header Filter cards parameters (Screenshot 3) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* POSITION */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm select-none">
          <label className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">POSITION</label>
          <div className="relative">
            <select 
              value={filterPos} 
              onChange={(e) => setFilterPos(e.target.value as any)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 text-[11px] text-slate-700 font-bold focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="TOP">Top Laner</option>
              <option value="JNG">Jungle</option>
              <option value="MID">Mid Laner</option>
              <option value="ADC">Sniper (ADC)</option>
              <option value="SUP">Support</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* MIN. RATING Slider */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm select-none">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">MIN. RATING</label>
            <span className="text-[11px] font-bold text-sky-600 font-mono">{filterMinOvr}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input 
              type="range"
              min={75}
              max={95}
              value={filterMinOvr}
              onChange={(e) => setFilterMinOvr(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* NATIONALITY */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm select-none">
          <label className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">NATIONALITY</label>
          <div className="relative">
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 text-[11px] text-slate-700 font-bold focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Global">Global</option>
              <option value="Sweden">Sweden</option>
              <option value="South Korea">Korea</option>
              <option value="Finland">Finland</option>
              <option value="Brazil">Brazil</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* SALARY CAP */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm select-none">
          <label className="block text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">SALARY CAP</label>
          <div className="relative">
            <select 
              value={filterSalary}
              onChange={(e) => setFilterSalary(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 text-[11px] text-slate-700 font-bold focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">&lt; All CAPS</option>
              <option value="500k">&lt; 500k</option>
              <option value="300k">&lt; 300k</option>
              <option value="150k">&lt; 150k</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid containing Available listings and Right side Capital stats (Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: available player listings in Screenshot 3 beautiful bento styles (Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {filteredBuyListings.length > 0 ? (
            filteredBuyListings.map(player => {
              // Map label strings appropriately
              const posLabel = player.position === 'MID' 
                ? (player.name === 'NOVA' ? 'IGL' : 'MID-LANER') 
                : player.position === 'ADC' 
                  ? 'SNIPER' 
                  : player.position === 'SUP' 
                    ? 'SUPPORT' 
                    : 'TOP-LANER';

              return (
                <div 
                  key={player.id} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex h-40 hover:border-slate-300 transition-colors"
                >
                  {/* Left Dark Portrait Block with overlaid Position indicator */}
                  <div className="w-[110px] bg-slate-900 relative flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={player.photoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'} 
                      referrerPolicy="no-referrer"
                      alt={player.name} 
                      className="w-full h-full object-cover opacity-75 grayscale" 
                    />
                    
                    {/* Bottom position ribbon */}
                    <div className="absolute bottom-0 left-0 w-full bg-blue-600/90 py-1 text-center select-none">
                      <span className="font-mono text-[8px] font-black tracking-widest text-white uppercase">
                        {posLabel}
                      </span>
                    </div>
                  </div>

                  {/* Right side data details */}
                  <div className="flex-1 p-4.5 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Name + rating */}
                      <div className="flex justify-between items-start gap-1 pb-1">
                        <div className="truncate">
                          <h4 className="font-display text-sm font-bold text-slate-800 leading-none">{player.name}</h4>
                          <span className="text-[8px] font-mono text-slate-400 font-extrabold tracking-wider uppercase mt-1 block">
                            {player.name === 'S7V3N' ? 'TEAM ZENITH • SWEDEN' : player.name === 'NOVA' ? 'KORE DYNAMICS • KR' : player.name === 'RECOIL' ? 'ARCTIC STORM • FI' : 'VISIONARY GAMING • BR'}
                          </span>
                        </div>
                        
                        <div className="text-right select-none shrink-0">
                          <span className="text-[8px] font-mono font-bold text-slate-400 block tracking-wider uppercase">RATING</span>
                          <span className="font-display font-black text-sky-600 text-[17px] leading-none">{player.overallRating}</span>
                        </div>
                      </div>

                      {/* Impact & Clutch meters (Bright blue bars) */}
                      <div className="space-y-1.5 mt-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[7.5px] font-mono font-black text-slate-400 uppercase w-9 shrink-0">IMPACT</span>
                          <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: player.name === 'S7V3N' ? '82%' : player.name === 'RECOIL' ? '93%' : '75%' }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[7.5px] font-mono font-black text-slate-400 uppercase w-9 shrink-0">CLUTCH</span>
                          <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: player.name === 'S7V3N' ? '91%' : player.name === 'NOVA' ? '85%' : '65%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Value label & hire buttons */}
                    <div className="flex justify-between items-end border-t border-slate-100 pt-2 shrink-0">
                      <div>
                        <span className="text-[7px] font-mono font-bold text-slate-400 block uppercase leading-none">VALUE</span>
                        <span className="font-display font-black text-[#0ea5e9] text-xs leading-none">
                          {formatMoney(player.marketValue)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleBuy(player)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[8.5px] font-black px-3.5 py-1.5 rounded uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
                      >
                        CONTRATAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-slate-400 font-bold text-center py-20 text-xs border-2 border-dashed border-slate-200 rounded-xl uppercase tracking-widest bg-white">
              Nenhum jogador S+ encontrado para estes filtros de slider
            </div>
          )}
        </div>

        {/* Right Area: Capital Budget projections + Active operations list (Screenshot 3 RHS) (Span 4) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          
          {/* AVAILABLE CAPITAL Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm space-y-4">
            <div>
              <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase block tracking-wider">AVAILABLE CAPITAL</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display font-black text-slate-800 text-2xl">$2,400,000</span>
                <span className="text-[10px] font-mono font-bold text-emerald-500">+5.2%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 select-none">
              <div>
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Projected Spend</span>
                <span className="font-mono text-[11.5px] font-bold text-slate-700">-$1.2M</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full self-center overflow-hidden">
                <div className="h-full bg-[#006e80]" style={{ width: '50%' }} />
              </div>
            </div>

            <p className="text-[9.5px] font-sans font-semibold text-[#006e80] bg-slate-50 border border-slate-150 px-2.5 py-2 rounded-lg leading-tight">
              Budget optimized for 2 Tier-S acquisitions.
            </p>
          </div>

          {/* TRANSFER LIST: 3 ACTIVE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">TRANSFER LIST</span>
              <span className="text-[8.5px] font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded tracking-widest">3 ACTIVE</span>
            </div>

            {/* active listing rows mirroring Screenshot 3 */}
            <div className="divide-y divide-slate-100">
              
              {/* Buy Offer: S7V3N */}
              <div className="py-3 flex items-center justify-between gap-2.5 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-display text-[10px] font-bold text-slate-800 leading-tight">Buy Offer: S7V3N</h5>
                    <p className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">Waiting for Team Zenith response</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-extrabold text-slate-800 block">$840k</span>
                  <span className="text-[7.5px] font-mono font-black text-sky-500 bg-sky-50 px-1 py-0.2 rounded uppercase">PENDING</span>
                </div>
              </div>

              {/* Sell Offer: PHOENIX */}
              <div className="py-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 animate-pulse">
                    <ArrowUpRight className="w-4 h-4 rotate-180" />
                  </div>
                  <div>
                    <h5 className="font-display text-[10px] font-bold text-slate-800 leading-tight">Sell Offer: PHOENIX</h5>
                    <p className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">Bid from Rogue Legion</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-extrabold text-slate-800 block">$1.2M</span>
                  <span className="text-[7.5px] font-mono font-black text-emerald-500 bg-emerald-50 px-1 py-0.2 rounded uppercase">IN REVIEW</span>
                </div>
              </div>

              {/* Scout: JAX-9 */}
              <div className="py-3 pb-0 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 opacity-50">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-display text-[10px] font-bold text-slate-700 leading-tight opacity-70">Scout: JAX-9</h5>
                    <p className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-70">Offer Rejected</p>
                  </div>
                </div>
                <div className="text-right shrink-0 opacity-70">
                  <span className="text-[10px] font-mono font-extrabold text-slate-700 block">$600k</span>
                  <span className="text-[7.5px] font-mono font-black text-pink-500 bg-pink-50 px-1 py-0.2 rounded uppercase">EXPIRED</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("Exibindo todas as operações financeiras históricas do Split...")}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-mono text-[8.5px] font-black text-center py-2.5 rounded uppercase border border-slate-200 cursor-pointer"
            >
              VIEW ALL OPERATIONS
            </button>
          </div>

          {/* MARKET TRENDS card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider font-mono">MARKET TRENDS</span>
            </div>

            <ul className="space-y-3 font-sans text-[10.5px] text-slate-500 leading-normal list-disc pl-4">
              <li>
                Demand for <span className="text-slate-800 font-bold">Support players</span> increased by 22% this week.
              </li>
              <li>
                Average valuation in <span className="text-slate-800 font-bold">NA Region</span> has stabilized at $750k.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Edit2, Shield, Plus, Upload, Trash2, Globe, Sparkles, Sliders } from 'lucide-react';
import { GameState, Team, Player, Sponsor, Champion } from '../types';

interface EditorTabProps {
  gameState: GameState;
  onUpdateTeams: (updatedTeams: Team[]) => void;
  onUpdateSponsors: (updatedSponsors: Sponsor[]) => void;
}

export default function EditorTab({
  gameState,
  onUpdateTeams,
  onUpdateSponsors
}: EditorTabProps) {
  const [selectedEditorSub, setSelectedEditorSub] = useState<'teams' | 'players' | 'sponsors'>('teams');
  
  // States for active selections
  const [selectedTeamId, setSelectedTeamId] = useState<string>(gameState.teams[0]?.id || '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Team Edit controllers
  const teamToEdit = gameState.teams.find(t => t.id === selectedTeamId)!;
  const [teamName, setTeamName] = useState(teamToEdit?.name || '');
  const [teamAcronym, setTeamAcronym] = useState(teamToEdit?.acronym || '');
  const [teamBudget, setTeamBudget] = useState(teamToEdit?.budget || 0);
  const [primaryColor, setPrimaryColor] = useState(teamToEdit?.primaryColor || '#00d2fd');

  // Player Edit controllers
  const allPlayers = teamToEdit ? [...teamToEdit.roster, ...teamToEdit.substitutes] : [];
  const playerToEdit = allPlayers.find(p => p.id === selectedPlayerId) || allPlayers[0];
  const [playerName, setPlayerName] = useState(playerToEdit?.name || '');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(playerToEdit?.photoUrl || '');
  const [playerOvr, setPlayerOvr] = useState(playerToEdit?.overallRating || 70);

  // New Sponsor forms
  const [newSponsorName, setNewSponsorName] = useState('Subway Brasil');
  const [newSponsorPay, setNewSponsorPay] = useState(45000);
  const [newSponsorBonus, setNewSponsorBonus] = useState(80000);

  const handleSaveTeam = () => {
    if (!teamName.trim()) return;
    const updated = gameState.teams.map(t => {
      if (t.id === selectedTeamId) {
        return {
          ...t,
          name: teamName,
          acronym: teamAcronym,
          budget: Number(teamBudget),
          primaryColor
        };
      }
      return t;
    });
    onUpdateTeams(updated);
    alert("Dados do Clube salvos com sucesso na liga!");
  };

  const handleSavePlayer = () => {
    if (!playerToEdit || !playerName.trim()) return;
    const updated = gameState.teams.map(t => {
      if (t.id === selectedTeamId) {
        // update matches rosters or sub array
        const rosterUp = t.roster.map(p => {
          if (p.id === playerToEdit.id) {
            return { ...p, name: playerName, photoUrl: playerPhotoUrl, overallRating: Number(playerOvr) };
          }
          return p;
        });
        const subUp = t.substitutes.map(p => {
          if (p.id === playerToEdit.id) {
            return { ...p, name: playerName, photoUrl: playerPhotoUrl, overallRating: Number(playerOvr) };
          }
          return p;
        });
        return { ...t, roster: rosterUp, substitutes: subUp };
      }
      return t;
    });
    onUpdateTeams(updated);
    alert("Dados do Atleta atualizados na planilha da liga!");
  };

  const handleCreateSponsor = () => {
    if (!newSponsorName.trim()) return;
    const fresh: Sponsor = {
      id: 'sp_' + Math.random().toString(36).substring(2, 9),
      name: newSponsorName,
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
      incomePerWeek: newSponsorPay,
      signatureBonus: newSponsorBonus,
      termsInWeeks: 12,
      minPopularity: 40,
      isSigned: false,
      objective: 'Ficar no Top 3 do ranking de popularidade',
      objectiveBonus: 35000
    };
    onUpdateSponsors([...gameState.sponsorsMarket, fresh]);
    setNewSponsorName('');
    alert("Oferta de Patrocínio registrada no Scout corporativo!");
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation tab */}
      <div className="flex gap-2 bg-[#0a1424] border border-[#1e2d44] p-4 rounded-xl">
        <button
          onClick={() => setSelectedEditorSub('teams')}
          className={`flex items-center gap-2 px-5 py-2.5 font-display-lg text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            selectedEditorSub === 'teams' ? 'bg-[#00d2fd] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" /> Editar Equipes da Liga
        </button>
        <button
          onClick={() => setSelectedEditorSub('players')}
          className={`flex items-center gap-2 px-5 py-2.5 font-display-lg text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            selectedEditorSub === 'players' ? 'bg-[#00d2fd] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Editar Atletas / Elencos
        </button>
        <button
          onClick={() => setSelectedEditorSub('sponsors')}
          className={`flex items-center gap-2 px-5 py-2.5 font-display-lg text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            selectedEditorSub === 'sponsors' ? 'bg-[#00d2fd] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Editor de Patrocinadores
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EDIT TEAMS SECTION */}
        {selectedEditorSub === 'teams' && (
          <>
            {/* Left list (Span 5) */}
            <div className="lg:col-span-5 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow h-fit">
              <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-[#00d2fd] mb-4">Escolha a Organização</h4>
              <div className="grid grid-cols-1 gap-2">
                {gameState.teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      setTeamName(t.name);
                      setTeamAcronym(t.acronym);
                      setTeamBudget(t.budget);
                      setPrimaryColor(t.primaryColor);
                    }}
                    className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                      selectedTeamId === t.id ? 'border-[#00d2fd] bg-[#00d2fd]/5 text-white' : 'border-[#1e2d44] text-gray-400 hover:border-[#1e2d44]/85'
                    }`}
                  >
                    <span className="font-display-lg text-xs font-bold uppercase leading-none">{t.name}</span>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right form editor (Span 7) */}
            <div className="lg:col-span-7 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow space-y-4">
              <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-white border-b border-[#1e2d44] pb-2 mb-2">Editar Propriedades do Clube</h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs select-none">
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase font-black tracking-wider block text-[10px]">Nome Completo</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase font-black tracking-wider block text-[10px]">Sigla / Acrônimo (3 chars)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={teamAcronym}
                    onChange={(e) => setTeamAcronym(e.target.value)}
                    className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs select-none">
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase font-black tracking-wider block text-[10px]">Orçamento Inicial ($)</label>
                  <input
                    type="number"
                    value={teamBudget}
                    onChange={(e) => setTeamBudget(Number(e.target.value))}
                    className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase font-black tracking-wider block text-[10px]">Cor Geral de Combate (Ex: #ff0000)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveTeam}
                  className="bg-[#00d2fd] hover:bg-opacity-95 text-black font-display-lg text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Salvar Clube
                </button>
              </div>
            </div>
          </>
        )}

        {/* EDIT PLAYERS SECTION */}
        {selectedEditorSub === 'players' && (
          <>
            {/* Left selector Team+Players (Span 5) */}
            <div className="lg:col-span-5 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-5 shadow space-y-4">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase font-black tracking-widest block text-[9px] mb-1">Filtrar por Organização</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setSelectedPlayerId('');
                  }}
                  className="w-full bg-[#070d19] border border-[#1e2d44] text-[#00d2fd] text-xs rounded p-2 focus:outline-none"
                >
                  {gameState.teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 border-t border-[#1e2d44] pt-3">
                <label className="text-gray-400 uppercase font-black tracking-widest block text-[9px]">Atletas de Lineup</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {allPlayers.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlayerId(p.id);
                        setPlayerName(p.name);
                        setPlayerPhotoUrl(p.photoUrl || '');
                        setPlayerOvr(p.overallRating);
                      }}
                      className={`p-2.5 rounded border text-left text-xs font-semibold uppercase tracking-wider flex justify-between items-center transition-all ${
                        playerToEdit?.id === p.id ? 'border-[#00d2fd] bg-[#00d2fd]/10 text-white' : 'border-[#1e2d44] text-gray-400'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[#00d2fd] text-[10px]">OVR {p.overallRating} ({p.position})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form editor (Span 7) */}
            <div className="lg:col-span-7 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow space-y-4">
              <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-white border-b border-[#1e2d44] pb-2">Editar Ficha Cadastral do Jogador</h4>
              
              {playerToEdit ? (
                <div className="space-y-4 text-xs leading-normal">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 block font-bold text-[10px] uppercase">Nickname / Nome de Combate</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block font-bold text-[10px] uppercase">Nível Geral / Rating (OVR)</label>
                      <input
                        type="number"
                        min={30}
                        max={99}
                        value={playerOvr}
                        onChange={(e) => setPlayerOvr(Number(e.target.value))}
                        className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 block font-bold text-[10px] uppercase">URL de Imagem / Foto do Atleta</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={playerPhotoUrl}
                        onChange={(e) => setPlayerPhotoUrl(e.target.value)}
                        className="w-full bg-[#070d19] border border-[#1e2d44] rounded pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                        placeholder="https://images.unsplash.com/... (ou deixe vazio para padrão)"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSavePlayer}
                      className="bg-[#00d2fd] hover:bg-opacity-95 text-black font-display-lg text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      Salvar Cadastro
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12 uppercase tracking-wider text-xs">
                  Aguardando seleção do atleta no grid lateral
                </div>
              )}
            </div>
          </>
        )}

        {/* SPONSOR SYSTEM EDITOR */}
        {selectedEditorSub === 'sponsors' && (
          <div className="lg:col-span-12 bg-[#0a1424] border border-[#1e2d44] rounded-xl p-6 shadow space-y-6">
            <h4 className="font-display-lg text-xs font-extrabold uppercase tracking-widest text-[#00d2fd] border-b border-[#1e2d44] pb-2 mb-2">Cadastrar Novo Patrocinador e Campanhas</h4>
            
            <div className="grid grid-cols-3 gap-4 text-xs select-none">
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Nome Corporativo</label>
                <input
                  type="text"
                  value={newSponsorName}
                  onChange={(e) => setNewSponsorName(e.target.value)}
                  className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Income Semanal ($)</label>
                <input
                  type="number"
                  value={newSponsorPay}
                  onChange={(e) => setNewSponsorPay(Number(e.target.value))}
                  className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Bônus de Assinatura ($)</label>
                <input
                  type="number"
                  value={newSponsorBonus}
                  onChange={(e) => setNewSponsorBonus(Number(e.target.value))}
                  className="w-full bg-[#070d19] border border-[#1e2d44] rounded p-2.5 text-white focus:outline-none focus:border-[#00d2fd]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreateSponsor}
                className="bg-[#00d2fd] hover:bg-opacity-95 text-black font-display-lg text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Registrar no Hub
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

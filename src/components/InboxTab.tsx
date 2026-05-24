import React, { useState } from 'react';
import { Mail, ChevronRight, CornerDownRight, Trash2, ArrowLeftRight, Users, Briefcase, Eye } from 'lucide-react';
import { GameState } from '../types';
import { formatMoney } from '../utils/currency';

interface InboxTabProps {
  gameState: GameState;
  theme: 'light' | 'dark';
  onSelectTab: (tab: string) => void;
  triggerNotification?: (title: string, desc: string) => void;
}

interface Email {
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  body: string;
  date: string;
  category: 'Direção' | 'Jogadores' | 'Propostas';
  read: boolean;
  actionLabel?: string;
  linkTab?: string;
}

export default function InboxTab({ gameState, theme, onSelectTab, triggerNotification }: InboxTabProps) {
  const currentTeamName = gameState.teams.find(t => t.id === gameState.playerTeamId)?.name || 'Organização';
  
  // Local state for emails to support mark as read and delete actions!
  const [emails, setEmails] = useState<Email[]>(() => {
    return [
      {
        id: 'email-1',
        sender: 'Conselho Executivo',
        senderRole: 'Presidente da Org',
        subject: '⚠️ Alerta de Fair Play Financeiro e Teto Salarial',
        body: `Prezado Manager da ${currentTeamName}, o Conselho Executivo exige máxima atenção quanto ao teto salarial semanal regulamentado pela liga ($120.000). Qualquer estouro acarretará uma Taxa de Luxo de 150% do valor excedente, drenando nossas finanças. Além disso, cuide ativamente das renovações de vistos no Consulado para evitar interdição de estrangeiros na escalação principal.`,
        date: 'Hoje / Semana Atual',
        category: 'Direção',
        read: false,
        actionLabel: 'Ver Finanças',
        linkTab: 'Finanças'
      },
      {
        id: 'email-2',
        sender: 'CFO Executivo',
        senderRole: 'Gerente Financeiro',
        subject: '📈 Projeções Trimestrais & Caixa Adicional',
        body: `Manager, os relatórios de venda de merchandising estão ótimos graças à alta popularidade da equipe. Projetamos receber bônus promocionais adicionais no próximo trimestre se mantivermos a curva de vitórias ativa. Parabéns pelo controle de caixa!`,
        date: 'Ontem',
        category: 'Direção',
        read: false,
        actionLabel: 'Ver Infraestrutura',
        linkTab: 'Patrocinadores'
      },
      {
        id: 'email-3',
        sender: 'Agente do Atleta',
        senderRole: 'Representante de Jogador',
        subject: '⚡ Intenção de Extensão Contratual Antecipada',
        body: `Olá! Nosso atleta que atua na organização está muito satisfeito com as instalações da Gaming House. Ele deseja assinar uma extensão de contrato de 12 meses antes dos playoffs da liga para garantir foco absoluto. Solicitamos uma rodada de conversações ou reajuste contratual básico.`,
        date: 'Semana Atual',
        category: 'Jogadores',
        read: false,
        actionLabel: 'Ver Elenco Principal',
        linkTab: 'Jogadores'
      },
      {
        id: 'email-4',
        sender: 'Capitão do Time',
        senderRole: 'Pro-Player Líder',
        subject: '🏋️ Sugestão de Foco em Treinamento Macro / Micro',
        body: `Manager, o grupo andou conversando após o último split. Sentimos que poderíamos explorar treinos mais específicos para entrosar a nossa rota inferior com o caçador. Se puder focar as diretrizes semanais em Solo Queue ou Scrims de alta voltagem, faremos valer a pena na tabela!`,
        date: 'Semana Atual',
        category: 'Jogadores',
        read: true,
        actionLabel: 'Ver Solo Queue',
        linkTab: 'Scouting'
      },
      {
        id: 'email-5',
        sender: 'Head de Esports - LOUD',
        senderRole: 'Diretor de Transferências',
        subject: '🤝 Proposta de Transferência: Sondagem Oficial',
        body: `Saudações. Temos interesse mútuo na aquisição do passe contratual de um dos seus reservas da Academy. Oferecemos cobrir a multa rescisória no valor de $60.000 para transferência na próxima janela de segunda-feira. Aguardamos resposta formal.`,
        date: '2 dias atrás',
        category: 'Propostas',
        read: false,
        actionLabel: 'Ver Mercado de Transferências',
        linkTab: 'Transferências'
      },
      {
        id: 'email-6',
        sender: 'Comitê de Expansão VORTAX',
        senderRole: 'Recrutador de Característica',
        subject: '💼 Oferta de Emprego: Nova Oportunidade',
        body: `Temos acompanhado seu crescimento como manager nesta temporada. Sentimos que seu perfil se encaixa perfeitamente no novo modelo de negócios da VORTAX Sports para o CBLOL no próximo ano. Oferecemos salário em dobro e bonificações robustas. Dê uma olhada na Central de Empregos!`,
        date: 'Semana Anterior',
        category: 'Propostas',
        read: true,
        actionLabel: 'Ver Central de Empregos',
        linkTab: 'Central de Empregos'
      }
    ];
  });

  const [activeSubTab, setActiveSubTab] = useState<'Direção' | 'Jogadores' | 'Propostas'>('Direção');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const filteredEmails = emails.filter(e => e.category === activeSubTab);

  const handleReadEmail = (email: Email) => {
    setSelectedEmail(email);
    // Mark as read in state
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    if (triggerNotification && !email.read) {
      triggerNotification("📬 E-mail Lido", `Você leu: "${email.subject}"`);
    }
  };

  const handleDeleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev => prev.filter(email => email.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    if (triggerNotification) {
      triggerNotification("🗑️ E-mail Excluído", "Mensagem removida da sua caixa de entrada.");
    }
  };

  const handleMarkAllRead = () => {
    setEmails(prev => prev.map(e => ({ ...e, read: true })));
    if (triggerNotification) {
      triggerNotification("📬 Limpeza de Inbox", "Todas as mensagens marcadas como lidas.");
    }
  };

  return (
    <div id="inbox-panel-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-1">
      
      {/* Left List Pane: Span 5 */}
      <div className={`col-span-1 lg:col-span-5 rounded-2xl border flex flex-col overflow-hidden h-[72vh] shadow-md ${
        theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          theme === 'dark' ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-400" />
            <h3 className={`font-display text-sm font-black uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>Caixa de Entrada</h3>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="text-[9.5px] font-extrabold uppercase text-sky-400 hover:text-sky-305 transition duration-150 border border-sky-400/25 px-2 py-0.5 rounded"
          >
            Lidas
          </button>
        </div>

        {/* Categories / Internal filter tabs */}
        <div className={`flex border-b text-[10px] font-bold ${
          theme === 'dark' ? 'border-[#1e2d44] bg-[#0d1b2e]/55' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {(['Direção', 'Jogadores', 'Propostas'] as const).map((tab) => {
            const count = emails.filter(e => e.category === tab && !e.read).length;
            const isSel = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveSubTab(tab);
                  setSelectedEmail(null);
                }}
                className={`flex-1 text-center py-2.5 transition duration-150 uppercase tracking-widest font-black border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSel 
                    ? 'border-sky-400 text-sky-400 font-extrabold bg-sky-400/5' 
                    : theme === 'dark' 
                      ? 'border-transparent text-slate-400 hover:text-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'Propostas' ? 'Propostas' : tab}
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[8px] flex items-center justify-center animate-bounce">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mail Listing */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleReadEmail(email)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 relative overflow-hidden group ${
                    isSelected 
                      ? theme === 'dark' 
                        ? 'bg-sky-500/10 border-sky-500/40 text-white' 
                        : 'bg-blue-500/5 border-blue-400/40'
                      : !email.read 
                        ? theme === 'dark' 
                          ? 'bg-[#122239] border-[#293d56]/75 hover:bg-[#152742]' 
                          : 'bg-blue-50/20 border-blue-200/50 hover:bg-sky-50/10'
                        : theme === 'dark'
                          ? 'bg-[#09101d]/45 border-[#1e2d44]/40 text-slate-400 hover:bg-[#0c1628]'
                          : 'bg-slate-50/50 border-slate-105 text-slate-500 hover:bg-slate-100/50'
                  }`}
                >
                  {/* Read/Unread dot indicator */}
                  {!email.read && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center pr-3">
                      <span className={`text-[9.5px] font-black uppercase ${!email.read ? 'text-[#00cbd6]' : 'text-slate-400'}`}>
                        {email.sender}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">{email.date}</span>
                    </div>
                    <h4 className={`text-[11px] leading-tight font-extrabold ${isSelected || !email.read ? 'text-white dark:text-white' : 'text-slate-400'}`}>
                      {email.subject}
                    </h4>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed">
                      {email.body}
                    </p>
                  </div>

                  {/* Actions wrapper show on hover */}
                  <div className="absolute bottom-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                    <button
                      onClick={(e) => handleDeleteEmail(email.id, e)}
                      className="p-1 rounded bg-[#1e2d44] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-705 cursor-pointer"
                      title="Excluir E-mail"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
              <Mail className="w-8 h-8 text-slate-550 stroke-1" />
              <p className="text-[10px] text-slate-500 italic">Nenhum e-mail nesta categoria atualmente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Pane: Span 7 */}
      <div className={`col-span-1 lg:col-span-7 rounded-2xl border flex flex-col overflow-hidden h-[72vh] shadow-md ${
        theme === 'dark' ? 'bg-[#0a1424] border-[#1e2d44]' : 'bg-white border-slate-200'
      }`}>
        {selectedEmail ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'bg-[#070d19] border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold bg-[#00cbd6]/10 text-[#00cbd6] px-1.5 py-0.5 rounded border border-[#00cbd6]/20 uppercase">
                    {selectedEmail.category}
                  </span>
                  <h3 className={`text-base font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {selectedEmail.subject}
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 shrink-0">{selectedEmail.date}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-3.5 text-[10.5px]">
                <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center font-black text-sky-400 border border-sky-500/20 text-[10px]">
                  {selectedEmail.sender[0]}
                </div>
                <div>
                  <p className="font-extrabold text-[#00cbd6] leading-none">{selectedEmail.sender}</p>
                  <p className="text-[8.5px] text-slate-400 mt-0.5">{selectedEmail.senderRole}</p>
                </div>
              </div>
            </div>

            {/* Email message body */}
            <div className={`flex-1 p-6 overflow-y-auto leading-relaxed text-[11px] font-sans ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <div className="whitespace-pre-line space-y-4">
                <p className="font-medium">Prezado Manager,</p>
                {selectedEmail.body}
                <div className="pt-8 border-t border-slate-800/10 dark:border-slate-800/40 text-[9.5px] text-slate-400">
                  <p>Atenciosamente,</p>
                  <p className="font-bold text-white dark:text-[#00cbd6]/80 mt-1">{selectedEmail.sender}</p>
                  <p className="text-[8.2px] italic">{selectedEmail.senderRole} • LegendsHub Admin Suite</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            {selectedEmail.linkTab && (
              <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
                theme === 'dark' ? 'bg-[#070d19]/60 border-[#1e2d44]' : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  onClick={() => onSelectTab(selectedEmail.linkTab!)}
                  className="px-4 py-1.8 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-[#00cbd6] text-[10px] font-black uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  {selectedEmail.actionLabel || 'Acessar Central'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none">
            <div className="w-14 h-14 rounded-full bg-slate-900/40 flex items-center justify-center border border-slate-800 border-dashed mb-4 animate-pulse">
              <Eye className="w-6 h-6 text-slate-550 stroke-1" />
            </div>
            <h4 className="font-bold text-xs uppercase text-slate-300">Escolha um E-mail</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1">Selecione uma mensagem recebida na lista à esquerda para expandir e interagir com as propostas táticas.</p>
          </div>
        )}
      </div>

    </div>
  );
}

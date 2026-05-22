/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Position, PlayerAttributes, SocialPost, Champion, GamePatch } from '../types';
import { FIRST_NAMES, LAST_NAMES, NICKNAMES, NATIONALITIES, PERSONALITIES, CHAMPIONS_LIST } from '../data/initialDatabase';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateProceduralPlayer(
  fixedPosition?: Position,
  avgRating: number = 72,
  isYouth: boolean = false
): Player {
  const positions: Position[] = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
  const pos = fixedPosition || positions[Math.floor(Math.random() * positions.length)];
  
  // Custom procedural attributes centered around avgRating
  const dev = 8; // standard deviation
  const roll = (bonus: number = 0) => {
    const val = Math.round(avgRating + (Math.random() - 0.5) * dev * 2 + bonus);
    return Math.max(45, Math.min(99, val));
  };

  // Positions specialize in attributes:
  // TOP: Macro & consistency
  // JNG: Map vision & macro
  // MID: Mechanics & playoff performance
  // ADC: Mechanics & farm
  // SUP: Communication & leadership
  const posBonus = (attr: keyof PlayerAttributes): number => {
    if (pos === 'TOP' && (attr === 'macro' || attr === 'consistency')) return 4;
    if (pos === 'JNG' && (attr === 'mapVision' || attr === 'macro')) return 4;
    if (pos === 'MID' && (attr === 'mechanics' || attr === 'playoffPerformance')) return 4;
    if (pos === 'ADC' && (attr === 'mechanics' || attr === 'farm')) return 4;
    if (pos === 'SUP' && (attr === 'communication' || attr === 'leadership')) return 4;
    return 0;
  };

  const attributes: PlayerAttributes = {
    mechanics: roll(posBonus('mechanics')),
    macro: roll(posBonus('macro')),
    communication: roll(posBonus('communication')),
    leadership: roll(posBonus('leadership')),
    consistency: roll(posBonus('consistency')),
    emotionalControl: roll(posBonus('emotionalControl')),
    farm: roll(posBonus('farm')),
    mapVision: roll(posBonus('mapVision')),
    playoffPerformance: roll(posBonus('playoffPerformance'))
  };

  // Net rating is simple average
  const ratingSum = Object.values(attributes).reduce((a, b) => a + b, 0);
  const overallRating = Math.round(ratingSum / Object.values(attributes).length);

  const age = isYouth ? Math.floor(Math.random() * 3) + 15 : Math.floor(Math.random() * 11) + 17; // 15-17 for youth, 17-27 for standard
  const potential = Math.round(overallRating + Math.random() * (28 - (age - 15) * 2));
  const finalPotential = Math.max(overallRating, Math.min(99, potential));

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] + '_' + Math.floor(Math.random() * 9);
  
  const originalNationality = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
  
  const popularity = Math.round(overallRating * 0.7 + Math.random() * 30);
  const marketValue = Math.round((overallRating ** 3) * (100 + (finalPotential - overallRating) * 5));
  const salary = Math.round((overallRating ** 2) * 50);

  // Pick random standard favorites from champion pool
  const compatibleChampions = CHAMPIONS_LIST.filter(c => c.roles.includes(pos));
  const poolSize = Math.floor(Math.random() * 2) + 3; // 3 to 4 starting picks
  const favoriteChamps: string[] = [];
  for (let i = 0; i < poolSize; i++) {
    const candidate = compatibleChampions[Math.floor(Math.random() * compatibleChampions.length)];
    if (candidate && !favoriteChamps.includes(candidate.id)) {
      favoriteChamps.push(candidate.id);
    }
  }

  return {
    id: 'pl_' + generateId(),
    name: nickname,
    realName: `${firstName} ${lastName}`,
    nationality: originalNationality.name,
    age,
    position: pos,
    attributes,
    overallRating,
    potential: finalPotential,
    personality,
    popularity,
    marketValue: Math.max(50000, marketValue),
    salary: Math.max(12000, salary),
    contractMonths: Math.floor(Math.random() * 18) + 6,
    motivation: 80 + Math.floor(Math.random() * 21),
    stamina: 95 + Math.floor(Math.random() * 6),
    chemistry: 70 + Math.floor(Math.random() * 21),
    championPool: favoriteChamps,
    isPlayerControlled: false
  };
}

export function generateDynamicPatch(patchIndex: number, customs?: Champion[]): GamePatch {
  // Select random champions to buff and nerf
  const allChamps = customs && customs.length > 0 ? [...customs] : [...CHAMPIONS_LIST];
  const numBuffs = 3;
  const numNerfs = 3;

  const shuffled = allChamps.sort(() => 0.5 - Math.random());
  const buffed = shuffled.slice(0, numBuffs).map(c => c.id);
  const nerfed = shuffled.slice(numBuffs, numBuffs + numNerfs).map(c => c.id);

  const versions = ['15.1', '15.2', '15.3', '15.4', '15.5', '15.6', '15.7', '15.8', '15.9'];
  const version = versions[patchIndex % versions.length] || `15.${patchIndex + 1}`;

  const metaDescriptions = [
    'Meta focado em lutadores no topo e caçadores velozes na selva. Atiradores com escalada estão sofrendo.',
    'A ascensão dos tanques! Feitiços utilitários estão fortíssimos na rota inferior, ideal para sinergias densas.',
    'Assassinos na selva ganham duto de mana! O ritmo de jogo acelerou drasticamente nas rotas laterais.',
    'Ajustes nos itens de crítico deixam atiradores muito perigosos após o terceiro item do inventário.',
    'Controle de mapa se tornou vital. Magos de utilidade no meio dominam os combates por dragões.'
  ];
  
  const metaDescription = metaDescriptions[patchIndex % metaDescriptions.length];

  return {
    version,
    metaDescription,
    buffedChampions: buffed,
    nerfedChampions: nerfed,
    date: `Split Semestre - Patch ${version}`
  };
}

export function generateSocialFeed(
  subjectName: string,
  eventType: 'win' | 'loss' | 'transfer' | 'general' | 'draft' | 'sponsor' | 'staff',
  sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
): SocialPost[] {
  const handles = [
    '@CBLOL_Tracker', '@ShaoLingo', '@LoLEsportsFans', '@MaestroTatico', '@SkinsEDraft',
    '@IlustreLoles', '@NextSplitBR', '@FofocasDoCompetitive', '@Baiano_Parody', '@AnalistaDaVila'
  ];

  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100'
  ];

  const templates: { [key: string]: string[] } = {
    win: [
      `A vitória da #TEAM# foi absurda! Esse plano tático de jogo encaixou como uma luva.`,
      `Estou sem palavras para a aula de rotação que a #TEAM# deu hoje. Macro game cirúrgico.`,
      `Vitória sensacional e segura da #TEAM#. Se jogarem assim nos playoffs, ninguém segura!`,
      `O draft da #TEAM# simplesmente engoliu a composição adversária. GG WP!`
    ],
    loss: [
      `Que desastre tático da #TEAM#. Parecia que os jogadores estavam jogando em patches diferentes.`,
      `Estou tiltado só de ver esse midgame da #TEAM#. Precisamos urgentemente de um psicólogo esportivo...`,
      `Seleção de picks horrorosa da #TEAM#. Deixaram todos os bonecos S+ livres. Que decepção.`,
      `A #TEAM# perdeu um Barão de graça hoje... Falta de visão de mapa bizarra. Alguém salva esse split!`
    ],
    transfer: [
      `Contratação bombástica no mercado! #SUBJECT# acaba de assinar contrato. Vai dar bom?`,
      `Que movimentação absurda da gerência. Trazer #SUBJECT# vai colocar o time no topo das expectativas.`,
      `EITA! #SUBJECT# mudando de ares. A janela de transferências deste split está simplesmente insana!`,
      `Não sei se a química do time vai funcionar com #SUBJECT#. O manager correu um risco enorme com esse salário.`
    ],
    draft: [
      `O draft que a #TEAM# montou focado em #SUBJECT# foi uma obra prima! A draftech está real.`,
      `Ninguém joga tão bem de #SUBJECT# quanto o nosso meta do split. Que pick assinatura seguro!`,
      `Priorizar #SUBJECT# de primeiro pick foi ousado, mas a sinergia na botlane pagou a conta.`
    ],
    sponsor: [
      `Novos patrocinadores chegando com malas cheias de grana pra nossa gaming house! Finanças a mil!`,
      `Org de Lol voando alto! Novo patrocínio mostra a moral excelente da nossa equipe no cenário.`
    ],
    staff: [
      `Nova comissão técnica trazendo disciplina de verdade. Finalmente investindo em infraestrutura de alto nível.`,
      `Disseram que o novo staff é ultra exigente taticamente. Vai ajudar muito os garotos da academia.`
    ],
    general: [
      `O split está insano! O meta rotativo de LOL realmente muda como as ligas se comportam.`,
      `Ansioso pelos próximos drafts. Qual equipe vai se adaptar mais rápido ao novo buff?`,
      `Scouts da academia trabalhando pesado. Tem muito talento novo aparecendo de graça na base.`
    ]
  };

  const selectedTemplates = templates[eventType] || templates.general;
  const posts: SocialPost[] = [];

  const size = 3;
  for (let i = 0; i < size; i++) {
    const handle = handles[Math.floor(Math.random() * handles.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    let content = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    
    // Replace markers
    content = content.replace(/#TEAM#/g, subjectName).replace(/#SUBJECT#/g, subjectName);

    const likes = Math.floor(Math.random() * 450) + 50;
    const retweets = Math.floor(likes * 0.2) + 5;

    posts.push({
      id: 'soc_' + generateId(),
      username: handle.substring(1),
      handle,
      avatarUrl: avatar,
      content,
      likes,
      retweets,
      timeAgo: `${i + 1}h atrás`,
      sentiment,
      verified: Math.random() > 0.7
    });
  }

  return posts;
}

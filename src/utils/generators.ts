/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Position, PlayerAttributes, SocialPost, Champion, GamePatch } from '../types';
import { FIRST_NAMES, LAST_NAMES, NICKNAMES, NATIONALITIES, PERSONALITIES, CHAMPIONS_LIST } from '../data/initialDatabase';
import { calcularValorMercado, calcularSalarioSemanal } from './currency';

export const REGIONAL_NAME_CONFIGS: {
  [key in 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP']: {
    firstNames: string[];
    lastNames: string[];
    nationalities: { name: string; flag: string }[];
    nicknames: string[];
  }
} = {
  CBLOL: {
    firstNames: [
      'Arthur', 'Bruno', 'Gabriel', 'Lucas', 'Matheus', 'Felipe', 'Thiago', 'Pedro', 'Guilherme', 'Gustavo',
      'Rodrigo', 'Henrique', 'Daniel', 'Marcos', 'Rafael', 'Diego', 'André', 'Eduardo', 'Caio', 'Heitor',
      'Agustín', 'Mateo', 'Benjamín', 'Tomás', 'Francisco', 'Joaquín', 'Santiago', 'Nicolás', 'Felipe', 'Mariano'
    ],
    lastNames: [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
      'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Teixeira', 'Mendonça', 'Guimarães', 'Nascimento', 'Araújo',
      'González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero', 'Sánchez'
    ],
    nationalities: [
      { name: 'Brasil', flag: 'BR' }, { name: 'Brasil', flag: 'BR' }, { name: 'Brasil', flag: 'BR' },
      { name: 'Argentina', flag: 'AR' }, { name: 'Chile', flag: 'CL' }
    ],
    nicknames: [
      'Robo', 'Cariok', 'Tinowns', 'TitaN', 'Ceos', 'Brance', 'fNb', 'dyNquedo', 'RedBert', 'Ranger',
      'ProDelta', 'Grevthar', 'SuperCleber', 'Wizer', 'Netuno', 'croco', 'Kuri', 'Damage', 'Bvoy', 'Sarkis',
      'Envy', 'shini', 'kr_and', 'Guigo', 'Beta', 'Shield', 'Spark', 'Cogu', 'Klaus', 'Aloned', 'Jojo', 'Frost'
    ]
  },
  LCK: {
    firstNames: [
      'Sang-hyuk', 'Ji-hoon', 'Geon-bu', 'Min-seok', 'Hyeon-jun', 'Woo-je', 'Jae-hyuk', 'Min-hyeong', 'Bo-seong',
      'Gi-in', 'Hyeon-joon', 'Su-hwan', 'Hyeok-gyu', 'Geon-woo', 'Kwang-hee', 'Yong-jun', 'Si-woo', 'Dong-ha', 'Chang-dong'
    ],
    lastNames: [
      'Lee', 'Kim', 'Park', 'Choi', 'Jeong', 'Han', 'Cho', 'Kang', 'Yoo', 'Yoon', 'Jang', 'Lim', 'Shin', 'Song', 'Oh'
    ],
    nationalities: [
      { name: 'Coreia do Sul', flag: 'KR' }
    ],
    nicknames: [
      'Faker', 'Chovy', 'Canyon', 'Oner', 'Zeus', 'Keria', 'Ruler', 'Gumayusi', 'Doran', 'Peyz', 'ShowMaker', 'Bdd',
      'Lucid', 'Aiming', 'Delight', 'Kingen', 'Zeka', 'Deft', 'Pyosik', 'Viper', 'Peanut', 'Rascal', 'Cuzz', 'Clozer',
      'Karis', 'Jiwoo', 'Effort', 'Duro', 'Ted', 'PerfecT', 'Lehends', 'BeryL', 'Gori', 'Kellin', 'Peter', 'Execute'
    ]
  },
  LPL: {
    firstNames: [
      'Jian', 'Zihao', 'Zhuo', 'Ding', 'Zian', 'Rui', 'Ming', 'Chao', 'Tian', 'Bo', 'Hao', 'Jie', 'Yang', 'Yu',
      'Wei', 'Yi', 'Cheng', 'Jun', 'Long', 'Ke', 'Zhen', 'Yao', 'Fan', 'Sen', 'Peng', 'Xiang', 'Heng', 'Qi'
    ],
    lastNames: [
      'Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu',
      'Guo', 'He', 'Lin', 'Gao', 'Liang'
    ],
    nationalities: [
      { name: 'China', flag: 'CN' }
    ],
    nicknames: [
      'Uzi', 'Knight', 'Xiaohu', 'JackeyLove', 'Tian', 'Bin', 'Xun', 'Elk', 'Meiko', 'Crisp', 'GALA', '369', 'Leyan',
      'Care', 'Creme', 'Yagao', 'Hope', 'Shanks', 'Tangyuan', 'Huanfeng', 'Lwx', 'Missing', 'Mark', 'Breathe', 'Fopo',
      'Heng', 'Fisher', 'Xiaolaohu', 'Wayward', 'Shanji', 'Zika', 'Cryin', 'Photic', 'Iwandy', 'Light', 'Ning', 'Baolan'
    ]
  },
  LEC: {
    firstNames: [
      'Emil', 'Sven', 'Martin', 'Luka', 'Rasmus', 'Marc', 'Hans', 'Paul', 'Leon', 'Noah', 'Jan', 'Szymon', 'Sergio',
      'David', 'Arthur', 'Lucas', 'Pierre', 'Alexander', 'Javier', 'Irfan', 'Thomas', 'Steven', 'Tim', 'Dennis'
    ],
    lastNames: [
      'Larsson', 'Hansen', 'Schmidt', 'Müller', 'Schneider', 'Novak', 'Kowalski', 'Garcia', 'Rodriguez', 'Martin',
      'Dubois', 'Thomas', 'Brown', 'Smith', 'Nielsen', 'Andersson', 'Berg', 'Johansson', 'Van Dyck', 'Lefebvre'
    ],
    nationalities: [
      { name: 'Alemanha', flag: 'DE' }, { name: 'França', flag: 'FR' }, { name: 'Espanha', flag: 'ES' },
      { name: 'Suécia', flag: 'SE' }, { name: 'Dinamarca', flag: 'DK' }, { name: 'Polônia', flag: 'PL' },
      { name: 'Reino Unido', flag: 'GB' }, { name: 'Bélgica', flag: 'BE' }, { name: 'Noruega', flag: 'NO' }
    ],
    nicknames: [
      'Caps', 'Perkz', 'Rekkles', 'Jankos', 'Wunder', 'Mikyx', 'Carzzy', 'Humanoid', 'Elyoya', 'Razork', 'HansSama',
      'BrokenBlade', 'Larssen', 'BB', 'Finn', 'Vetheo', 'Yike', 'Sheo', 'Flakked', 'Trymbi', 'Labrov', 'Nisqy', 'Oscarinin',
      'Comp', 'Hylissang', 'Szygenda', 'Patrik', 'Ignar', 'Noah', 'Jun', 'Peach', 'Lyncas', 'Zoelys', 'Supa', 'Alvaro'
    ]
  },
  LCS: {
    firstNames: [
      'Joseph', 'Matthew', 'Daniel', 'David', 'William', 'Tyler', 'Zachary', 'Robert', 'Brandon', 'John', 'Kevin',
      'Christian', 'Alexander', 'Eric', 'Jonathan', 'Andrew', 'Ryan', 'Nicholas', 'Justin', 'Samuel'
    ],
    lastNames: [
      'Smith', 'Johnson', 'Miller', 'Davis', 'Williams', 'Jones', 'Brown', 'Wilson', 'Taylor', 'Thomas', 'Martin',
      'Jackson', 'Harris', 'White', 'Clark', 'Lewis', 'Young', 'Walker', 'Hall', 'Allen'
    ],
    nationalities: [
      { name: 'EUA', flag: 'US' }, { name: 'EUA', flag: 'US' }, { name: 'Canadá', flag: 'CA' }
    ],
    nicknames: [
      'Doublelift', 'Bjergsen', 'Blaber', 'Licorice', 'Vulcan', 'Jojo', 'Sniper', 'Yeon', 'CoreJJ', 'Huhi', 'Busio',
      'Massu', 'APA', 'Spica', 'Impact', 'Jensen', 'Contractz', 'Zven', 'Inspired', 'Bugi', 'Quid', 'Armut', 'Dhokla',
      'FBI', 'Tomo', 'Rich', 'Rivers', 'Palafox', 'Luger', 'Poome', 'Eyla', 'Castaway', 'Solo', 'Neo'
    ]
  },
  LCP: {
    firstNames: [
      'An', 'Binh', 'Cuong', 'Dung', 'Duy', 'Giang', 'Hai', 'Huy', 'Hoang', 'Khanh', 'Minh', 'Nam', 'Phong', 'Quan',
      'Søn', 'Thang', 'Tuan', 'Viet', 'Chih-Yuan', 'Chia-Wei', 'Yu-Cheng', 'Guan-Yu', 'Shu-Wei', 'Wen-Chieh', 'Chun-Kai'
    ],
    lastNames: [
      'Nguyen', 'Tran', 'Le', 'Pham', 'Huynh', 'Hoang', 'Phan', 'Vu', 'Vo', 'Dang', 'Chen', 'Lin', 'Huang', 'Chang',
      'Li', 'Wu', 'Tsai'
    ],
    nationalities: [
      { name: 'Vietnã', flag: 'VN' }, { name: 'Taiwan', flag: 'TW' }, { name: 'Hong Kong', flag: 'HK' },
      { name: 'Singapura', flag: 'SG' }, { name: 'Filipinas', flag: 'PH' }
    ],
    nicknames: [
      'Levi', 'Shogun', 'Maple', 'Betty', 'Chiu', 'Woody', 'Karsa', 'SwordArt', 'Rest', 'Junjia', 'Hanabi', 'Wako',
      'Driver', 'Renie', 'Hasmed', 'Palette', 'Kiaya', 'Artemis', 'Gury', 'Taya', 'Kati', 'Optimus', 'Divkid', 'Deray',
      'Duran', 'Bacon', 'Aliez', 'Yuta', 'Evi', 'Aria', 'Harp', 'Tol2', 'Sola', 'Yapo', 'Phoebe', 'Enzo', 'Sparda'
    ]
  }
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateProceduralProfile(
  pos: Position,
  region: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP'
): { name: string; realName: string; nationality: string; personality: string } {
  const config = REGIONAL_NAME_CONFIGS[region] || REGIONAL_NAME_CONFIGS.CBLOL;
  const firstName = config.firstNames[Math.floor(Math.random() * config.firstNames.length)];
  const lastName = config.lastNames[Math.floor(Math.random() * config.lastNames.length)];
  const natInfo = config.nationalities[Math.floor(Math.random() * config.nationalities.length)];
  const baseNick = config.nicknames[Math.floor(Math.random() * config.nicknames.length)];
  const suffix = Math.random() < 0.2 ? String(Math.floor(Math.random() * 99)) : '';
  const nickname = baseNick + suffix;
  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
  return {
    name: nickname,
    realName: `${firstName} ${lastName}`,
    nationality: natInfo.name,
    personality
  };
}

export function generateProceduralPlayer(
  fixedPosition?: Position,
  avgRating: number = 72,
  isYouth: boolean = false,
  region?: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP'
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

  let firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  let nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] + '_' + Math.floor(Math.random() * 9);
  
  let originalNationality = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];

  if (region && REGIONAL_NAME_CONFIGS[region]) {
    const config = REGIONAL_NAME_CONFIGS[region];
    firstName = config.firstNames[Math.floor(Math.random() * config.firstNames.length)];
    lastName = config.lastNames[Math.floor(Math.random() * config.lastNames.length)];
    originalNationality = config.nationalities[Math.floor(Math.random() * config.nationalities.length)];
    
    const baseNick = config.nicknames[Math.floor(Math.random() * config.nicknames.length)];
    const suffix = Math.random() < 0.25 ? String(Math.floor(Math.random() * 99)) : '';
    nickname = baseNick + suffix;
  }
  
  const popularity = Math.round(overallRating * 0.7 + Math.random() * 30);
  const marketValue = calcularValorMercado(overallRating, finalPotential);
  const weeklySalaryDecimal = calcularSalarioSemanal(marketValue);
  const salary = weeklySalaryDecimal * 4;

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
    signOnFee: Math.round(marketValue * (0.2 + Math.random() * 0.2)),
    isImported: originalNationality.name !== 'Brasil',
    visaApproved: originalNationality.name === 'Brasil',
    consecutiveBenchCount: 0,
    isMvpBonusExigido: Math.random() < 0.2,
    isTitularidadeExigida: Math.random() < 0.15,
    contractMonths: Math.floor(Math.random() * 18) + 6,
    motivation: 80 + Math.floor(Math.random() * 21),
    stamina: 95 + Math.floor(Math.random() * 6),
    chemistry: 70 + Math.floor(Math.random() * 21),
    championPool: favoriteChamps,
    isPlayerControlled: false
  };
}

export function generateProceduralAcademyPlayer(
  position: Position,
  region: 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP' | string,
  index: number,
  teamId: string
): Player {
  // Simple seedable pseudo-random generator
  const seedStr = `${teamId}_academy_${position}_${index}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  }
  const rand = function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const selectRandom = <T>(arr: T[]): T => {
    return arr[Math.floor(rand() * arr.length)];
  };

  let firstNames: string[] = ['Ruan', 'Igor', 'Kaio', 'Vinicius', 'Yuri', 'Guilherme', 'Enzo', 'Vitor', 'Danilo', 'Otavio', 'Rodrigo', 'Renan'];
  let lastNames: string[] = ['Sanches', 'Melo', 'Campos', 'Nunes', 'Vieira', 'Cardoso', 'Pinto', 'Teixeira', 'Leal', 'Farias', 'Mendes', 'Carvalho'];
  let nationalities: { name: string; flag: string }[] = [{ name: 'Brasil', flag: 'BR' }];
  let nicknames: string[] = ['Krow', 'Sky', 'Storm', 'Zenith', 'Apex', 'Nova', 'Vipe', 'Hyper', 'Giga', 'Frost', 'Spark', 'Calyx', 'Rune', 'Helix'];

  const normRegion = (region || 'CBLOL').toUpperCase();

  if (normRegion === 'LEC' || normRegion.includes('LEC')) {
    firstNames = ['Bastian', 'Kasper', 'Jonas', 'Niklas', 'Soren', 'Oliver', 'Liam', 'Elias', 'Finn', 'Max', 'Hans', 'Martin', 'Alex'];
    lastNames = ['Nielsen', 'Jensen', 'Petersen', 'Weber', 'Becker', 'Gomez', 'Lefebvre', 'Dubois', 'Abbott', 'Carter'];
    nationalities = [
      { name: 'Alemanha', flag: 'DE' }, { name: 'França', flag: 'FR' }, { name: 'Espanha', flag: 'ES' },
      { name: 'Suécia', flag: 'SE' }, { name: 'Dinamarca', flag: 'DK' }, { name: 'Polônia', flag: 'PL' },
      { name: 'Reino Unido', flag: 'GB' }
    ];
    nicknames = ['Spectre', 'Phantasm', 'Mirage', 'Wraith', 'Echo', 'Drift', 'Aero', 'Zephyr', 'Blaze', 'Cinder', 'Silt', 'Kael', 'Aris', 'Nox', 'Lumi', 'Vecto', 'Alex'];
  } else if (normRegion === 'CBLOL' || normRegion.includes('CBLOL')) {
    firstNames = ['Ruan', 'Igor', 'Kaio', 'Vinicius', 'Yuri', 'Guilherme', 'Enzo', 'Vitor', 'Danilo', 'Otavio', 'Rodrigo', 'Renan', 'Thiago', 'Matheus'];
    lastNames = ['Sanches', 'Melo', 'Campos', 'Nunes', 'Vieira', 'Cardoso', 'Pinto', 'Teixeira', 'Leal', 'Farias', 'Mendes', 'Carvalho'];
    nationalities = [{ name: 'Brasil', flag: 'BR' }];
    nicknames = ['Krow', 'Sky', 'Storm', 'Zenith', 'Apex', 'Nova', 'Vipe', 'Hyper', 'Giga', 'Frost', 'Spark', 'Calyx', 'Rune', 'Helix', 'Ravanha', 'Gusta'];
  } else if (normRegion === 'LCK' || normRegion.includes('LCK')) {
    firstNames = ['Do-hyeon', 'Min-woo', 'Tae-yoon', 'Sung-min', 'Young-jae', 'Jae-won', 'Jun-young', 'Hyun-woo', 'Min-seok', 'Ji-hoon'];
    lastNames = ['Kang', 'Shin', 'Song', 'Seo', 'Hwang', 'Ahn', 'Lim', 'Pae'];
    nationalities = [{ name: 'Coreia do Sul', flag: 'KR' }];
    nicknames = ['Trapper', 'Gleam', 'Solace', 'Pioneer', 'Quill', 'Pulse', 'Roamer', 'Clutch', 'Saber', 'Vortex', 'Starlight', 'Moondust', 'Siren', 'Kael', 'Lucid'];
  } else if (normRegion === 'LPL' || normRegion.includes('LPL')) {
    firstNames = ['Haoran', 'Zeyu', 'Yuchen', 'Tianyu', 'Zihan', 'Xinyu', 'Zonghang', 'Shaoqi'];
    lastNames = ['Huang', 'Zhou', 'Wu', 'Xu', 'Sun', 'Ma', 'Hu', 'Zhu'];
    nationalities = [{ name: 'China', flag: 'CN' }];
    nicknames = ['Wind', 'Cloud', 'Yuan', 'Luo', 'Mo', 'Ye', 'He', 'Bai', 'Gong', 'Ran', 'Xuan', 'Lin', 'Ji', 'Fei', 'Shan'];
  } else if (normRegion === 'LCS' || normRegion.includes('LCS')) {
    firstNames = ['Tyler', 'Brandon', 'Logan', 'Dylan', 'Caleb', 'Nathan', 'Connor', 'Austin'];
    lastNames = ['Cooper', 'Ward', 'Watson', 'Brooks', 'Gray', 'James', 'Hughes', 'Price'];
    nationalities = [{ name: 'EUA', flag: 'US' }, { name: 'Canadá', flag: 'CA' }];
    nicknames = ['Blip', 'Zap', 'Echo', 'Tango', 'Comet', 'Rover', 'Ranger', 'Striker', 'Shadow', 'Frost', 'Titan', 'Oasis', 'Warp'];
  } else {
    firstNames = ['Minh', 'Khang', 'Tuan', 'Phong', 'Thong', 'Quoc', 'Phat'];
    lastNames = ['Ngo', 'Vu', 'Do', 'Dang', 'Duong', 'Dinh', 'Lam'];
    nationalities = [{ name: 'Vietnã', flag: 'VN' }, { name: 'Taiwan', flag: 'TW' }, { name: 'Hong Kong', flag: 'HK' }];
    nicknames = ['Alpha', 'Tempo', 'Zero', 'Beta', 'Gamma', 'Omega', 'Neo', 'Quantum', 'Phase', 'Static', 'Cipher', 'Volt'];
  }

  const firstName = selectRandom(firstNames);
  const lastName = selectRandom(lastNames);
  const natInfo = selectRandom(nationalities);
  const baseNick = selectRandom(nicknames);
  // Deterministic nickname suffix to guarantee uniqueness and no clash
  const nickSuffix = 10 + Math.floor(rand() * 89);
  const nickname = baseNick + nickSuffix;

  const age = Math.floor(rand() * 4) + 16; // 16 to 19 years old (realistic academy)
  const overallRating = Math.floor(rand() * 21) + 45; // Varying from 45 to 65 overall
  const potential = Math.min(99, overallRating + Math.floor(rand() * 15) + 10);

  const roll = () => Math.max(30, Math.min(99, overallRating + Math.floor((rand() - 0.5) * 10)));
  const attributes: PlayerAttributes = {
    mechanics: roll(),
    macro: roll(),
    communication: roll(),
    leadership: roll(),
    consistency: roll(),
    emotionalControl: roll(),
    farm: roll(),
    mapVision: roll(),
    playoffPerformance: roll()
  };

  const marketValue = 35000 + (overallRating - 45) * 2800;
  const salary = 8000 + (overallRating - 45) * 600;

  // Print/log the exact SQL Insert structure specified for database synchronisation audits
  console.log(`[SQLITE.DB BATCH INSERT] INSERT INTO players (name, surname, nationality, age, position, overall, team_id, is_academy, face_blob) ` +
              `VALUES ('${nickname}', '${lastName}', '${natInfo.name}', ${age}, '${position}', ${overallRating}, '${teamId}', 1, NULL);`);

  return {
    id: `pl_academy_seq_${teamId}_${position}_${index}`,
    name: nickname,
    realName: `${firstName} ${lastName}`,
    nationality: natInfo.name,
    age,
    position,
    attributes,
    overallRating,
    potential,
    personality: 'Jovem Promessa',
    popularity: Math.floor(overallRating * 0.4 + rand() * 15),
    marketValue,
    salary,
    contractMonths: 24,
    motivation: 95,
    stamina: 100,
    chemistry: 75,
    championPool: ['ryze', 'garen', 'lux'],
    isPlayerControlled: false,
    isAcademyStarter: true,
    // Unified database compatibility fields
    is_academy: 1,
    team_tier: 'academy',
    face_blob: null,
    image_blob: null
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

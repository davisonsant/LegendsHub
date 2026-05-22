import { Player, Position, PlayerAttributes } from '../types';

// Helper to calculate overall rating from attributes
function getOverallRating(attr: PlayerAttributes): number {
  const sum = Object.values(attr).reduce((a, b) => a + b, 0);
  return Math.round(sum / Object.values(attr).length);
}

// Map of real rosters for all 60 teams
export const REAL_ROSTERS_DB: {
  [teamId: string]: {
    name: string;
    realName: string;
    position: Position;
    age: number;
    nationality: string;
    baseRating: number; // Used to seed attributes dynamically while keeping them cohesive
    personality: string;
    popularity: number;
    championPool: string[];
  }[];
} = {
  // --- LCK (10 teams) ---
  lck_t1: [
    { name: 'Doran', realName: 'Choi Hyeon-joon', position: 'TOP', age: 25, nationality: 'Coreia do Sul', baseRating: 90, personality: 'Resiliente', popularity: 86, championPool: ['aatrox', 'jax', 'gragas'] },
    { name: 'Oner', realName: 'Mun Hyeon-jun', position: 'JNG', age: 23, nationality: 'Coreia do Sul', baseRating: 92, personality: 'Agressivo', popularity: 89, championPool: ['lee_sin', 'sejuani', 'viego'] },
    { name: 'Faker', realName: 'Lee Sang-hyuk', position: 'MID', age: 29, nationality: 'Coreia do Sul', baseRating: 95, personality: 'Líder NATO', popularity: 99, championPool: ['azir', 'orianna', 'ryze'] },
    { name: 'Peyz', realName: 'Kim Su-hwan', position: 'ADC', age: 20, nationality: 'Coreia do Sul', baseRating: 93, personality: 'Perfeccionista (Calmo)', popularity: 90, championPool: ['zeri', 'aphelios', 'jinx'] },
    { name: 'Keria', realName: 'Ryu Min-seok', position: 'SUP', age: 23, nationality: 'Coreia do Sul', baseRating: 94, personality: 'Estrela (Ambicioso)', popularity: 92, championPool: ['bard', 'thresh', 'lux'] }
  ],
  lck_geng: [
    { name: 'Kiin', realName: 'Kim Gi-in', position: 'TOP', age: 26, nationality: 'Coreia do Sul', baseRating: 93, personality: 'Resiliente', popularity: 88, championPool: ['k_sante', 'rumble', 'gnar'] },
    { name: 'Canyon', realName: 'Kim Geon-bu', position: 'JNG', age: 24, nationality: 'Coreia do Sul', baseRating: 94, personality: 'Focado', popularity: 91, championPool: ['lee_sin', 'nidalee', 'khazix'] },
    { name: 'Chovy', realName: 'Jeong Ji-hoon', position: 'MID', age: 25, nationality: 'Coreia do Sul', baseRating: 96, personality: 'Perfeccionista (Calmo)', popularity: 95, championPool: ['yone', 'azir', 'corki'] },
    { name: 'Ruler', realName: 'Park Jae-hyuk', position: 'ADC', age: 27, nationality: 'Coreia do Sul', baseRating: 94, personality: 'Líder NATO', popularity: 93, championPool: ['zeri', 'ezreal', 'kalista'] },
    { name: 'Duro', realName: 'Min Seon-ji', position: 'SUP', age: 21, nationality: 'Coreia do Sul', baseRating: 88, personality: 'Tímido (Focado)', popularity: 75, championPool: ['alistar', 'leona', 'rell'] }
  ],
  lck_hle: [
    { name: 'Zeus', realName: 'Choi Woo-je', position: 'TOP', age: 22, nationality: 'Coreia do Sul', baseRating: 94, personality: 'Estrela (Ambicioso)', popularity: 91, championPool: ['yone', 'aatrox', 'jayce'] },
    { name: 'Kanavi', realName: 'Seo Jin-hyeok', position: 'JNG', age: 25, nationality: 'Coreia do Sul', baseRating: 91, personality: 'Agressivo', popularity: 85, championPool: ['wukong', 'graves', 'belveth'] },
    { name: 'Zeka', realName: 'Kim Geon-woo', position: 'MID', age: 23, nationality: 'Coreia do Sul', baseRating: 92, personality: 'Focado', popularity: 87, championPool: ['akali', 'yone', 'sylas'] },
    { name: 'Gumayusi', realName: 'Lee Min-hyeong', position: 'ADC', age: 24, nationality: 'Coreia do Sul', baseRating: 91, personality: 'Estrela (Ambicioso)', popularity: 92, championPool: ['varus', 'jinx', 'caitlyn'] },
    { name: 'Delight', realName: 'Yoo Hwan-joong', position: 'SUP', age: 23, nationality: 'Coreia do Sul', baseRating: 92, personality: 'Líder NATO', popularity: 84, championPool: ['alistar', 'rakan', 'nautilus'] }
  ],
  lck_kt: [
    { name: 'PerfecT', realName: 'Lee Seung-min', position: 'TOP', age: 21, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Tímido (Focado)', popularity: 70, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Cuzz', realName: 'Moon Woo-chan', position: 'JNG', age: 26, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Resiliente', popularity: 78, championPool: ['sejuani', 'maokai', 'viego'] },
    { name: 'Bdd', realName: 'Gwak Bo-seong', position: 'MID', age: 26, nationality: 'Coreia do Sul', baseRating: 89, personality: 'Líder NATO', popularity: 85, championPool: ['azir', 'taliyah', 'syndra'] },
    { name: 'Aiming', realName: 'Kim Ha-ram', position: 'ADC', age: 25, nationality: 'Coreia do Sul', baseRating: 89, personality: 'Estrela (Ambicioso)', popularity: 82, championPool: ['zeri', 'ezreal', 'kai_sa'] },
    { name: 'Effort', realName: 'Lee Sang-ho', position: 'SUP', age: 25, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Resiliente', popularity: 74, championPool: ['alistar', 'nautilus', 'leona'] },
    { name: 'Ghost', realName: 'Jang Yong-jun', position: 'ADC', age: 27, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Resiliente', popularity: 79, championPool: ['jhin', 'ashe', 'ezreal'] } // SUB
  ],
  lck_ns: [
    { name: 'Kingen', realName: 'Hwang Seong-hoon', position: 'TOP', age: 26, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Resiliente', popularity: 80, championPool: ['aatrox', 'gnar', 'k_sante'] },
    { name: 'Sponge', realName: 'Bae Young-jun', position: 'JNG', age: 21, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Tímido (Focado)', popularity: 65, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Scout', realName: 'Lee Ye-chan', position: 'MID', age: 27, nationality: 'Coreia do Sul', baseRating: 90, personality: 'Líder NATO', popularity: 88, championPool: ['azir', 'sylas', 'leblanc'] },
    { name: 'Taeyoon', realName: 'Kim Tae-yoon', position: 'ADC', age: 23, nationality: 'Coreia do Sul', baseRating: 80, personality: 'Focado', popularity: 66, championPool: ['aphelios', 'jinx', 'ezreal'] },
    { name: 'Lehends', realName: 'Son Si-woo', position: 'SUP', age: 27, nationality: 'Coreia do Sul', baseRating: 90, personality: 'Brincalhão (Química)', popularity: 87, championPool: ['singed', 'blitzcrank', 'rakan'] }
  ],
  lck_dk: [
    { name: 'Siwoo', realName: 'Yoo Si-woo', position: 'TOP', age: 20, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Tímido (Focado)', popularity: 68, championPool: ['rumble', 'k_sante', 'gnar'] },
    { name: 'Lucid', realName: 'Choi Yong-hyeok', position: 'JNG', age: 21, nationality: 'Coreia do Sul', baseRating: 87, personality: 'Agressivo', popularity: 78, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'ShowMaker', realName: 'Heo Su', position: 'MID', age: 25, nationality: 'Coreia do Sul', baseRating: 91, personality: 'Brincalhão (Química)', popularity: 93, championPool: ['syndra', 'leblanc', 'katarina'] },
    { name: 'Smash', realName: 'Sin Geum-jae', position: 'ADC', age: 20, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 72, championPool: ['ezreal', 'kai_sa', 'jinx'] },
    { name: 'Career', realName: 'Oh Hyeong-seok', position: 'SUP', age: 19, nationality: 'Coreia do Sul', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lck_ds: [
    { name: 'DuDu', realName: 'Lee Dong-ju', position: 'TOP', age: 24, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 72, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Pyosik', realName: 'Hong Chang-hyeon', position: 'JNG', age: 26, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Brincalhão (Química)', popularity: 83, championPool: ['kindred', 'viego', 'lee_sin'] },
    { name: 'Clozer', realName: 'Lee Ju-hyeon', position: 'MID', age: 23, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Agressivo', popularity: 76, championPool: ['sylas', 'irelia', 'akali'] },
    { name: 'deokdam', realName: 'Seo Dae-gil', position: 'ADC', age: 26, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 75, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Peter', realName: 'Jeong Yoon-su', position: 'SUP', age: 23, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Tímido (Focado)', popularity: 68, championPool: ['alistar', 'leona', 'lulu'] }
  ],
  lck_drx: [
    { name: 'Rich', realName: 'Lee Jae-won', position: 'TOP', age: 26, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 74, championPool: ['aatrox', 'jax', 'rumble'] },
    { name: 'Vincenzo', realName: 'Vincenzo Jng', position: 'JNG', age: 22, nationality: 'Coreia do Sul', baseRating: 80, personality: 'Resiliente', popularity: 60, championPool: ['lee_sin', 'nidalee', 'maokai'] },
    { name: 'ucal', realName: 'Son Woo-hyeon', position: 'MID', age: 25, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 76, championPool: ['azir', 'taliyah', 'syndra'] },
    { name: 'Jiwoo', realName: 'Jung Ji-woo', position: 'ADC', age: 21, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Tímido (Focado)', popularity: 69, championPool: ['zeri', 'aphelios', 'ezreal'] },
    { name: 'Andil', realName: 'Andil Choi', position: 'SUP', age: 22, nationality: 'Coreia do Sul', baseRating: 79, personality: 'Resiliente', popularity: 61, championPool: ['leona', 'rell', 'rakan'] }
  ],
  lck_fox: [
    { name: 'Clear', realName: 'Song Hyeon-min', position: 'TOP', age: 21, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Resiliente', popularity: 63, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Raptor', realName: 'Jeon Eo-jin', position: 'JNG', age: 22, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['lee_sin', 'vi', 'sejuani'] },
    { name: 'VicLa', realName: 'Lee Dae-kwang', position: 'MID', age: 23, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Agressivo', popularity: 72, championPool: ['sylas', 'yone', 'azir'] },
    { name: 'Diable', realName: 'Diable Park', position: 'ADC', age: 20, nationality: 'Coreia do Sul', baseRating: 80, personality: 'Resiliente', popularity: 60, championPool: ['ezreal', 'jinx', 'varus'] },
    { name: 'Kellin', realName: 'Kim Hyeong-gyu', position: 'SUP', age: 24, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Focado', popularity: 73, championPool: ['alistar', 'lulu', 'nautilus'] }
  ],
  lck_bro: [
    { name: 'Casting', realName: 'Shin Min-je', position: 'TOP', age: 21, nationality: 'Coreia do Sul', baseRating: 79, personality: 'Tímido (Focado)', popularity: 58, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'GIDEON', realName: 'Kim Min-seong', position: 'JNG', age: 22, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Agressivo', popularity: 66, championPool: ['lee_sin', 'viego', 'graves'] },
    { name: 'Fisher', realName: 'Lee Jeong-tae', position: 'MID', age: 21, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['taliyah', 'azir', 'yone'] },
    { name: 'Teddy', realName: 'Park Jin-seong', position: 'ADC', age: 27, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Líder NATO', popularity: 82, championPool: ['ezreal', 'jinx', 'varus'] },
    { name: 'Namgung', realName: 'Namgung Gwang', position: 'SUP', age: 21, nationality: 'Coreia do Sul', baseRating: 78, personality: 'Resiliente', popularity: 55, championPool: ['leona', 'alistar', 'nautilus'] }
  ],

  // --- LPL (16 teams total, including Rare Atom and RNG to reach 60) ---
  lpl_blg: [
    { name: 'Bin', realName: 'Chen Ze-bin', position: 'TOP', age: 23, nationality: 'China', baseRating: 95, personality: 'Estrela (Ambicioso)', popularity: 94, championPool: ['jax', 'camille', 'fiora'] },
    { name: 'Xun', realName: 'Peng Li-xun', position: 'JNG', age: 24, nationality: 'China', baseRating: 91, personality: 'Agressivo', popularity: 87, championPool: ['viego', 'nidalee', 'kindred'] },
    { name: 'Knight', realName: 'Zhuo Ding', position: 'MID', age: 26, nationality: 'China', baseRating: 95, personality: 'Perfeccionista (Calmo)', popularity: 92, championPool: ['syndra', 'ahri', 'azir'] },
    { name: 'Viper', realName: 'Park Do-hyeon', position: 'ADC', age: 25, nationality: 'Coreia do Sul', baseRating: 94, personality: 'Perfeccionista (Calmo)', popularity: 93, championPool: ['aphelios', 'ezreal', 'kai_sa'] },
    { name: 'ON', realName: 'Luo Wen-jun', position: 'SUP', age: 23, nationality: 'China', baseRating: 90, personality: 'Brincalhão (Química)', popularity: 86, championPool: ['rakan', 'thresh', 'blitzcrank'] }
  ],
  lpl_al: [
    { name: 'Flandre', realName: 'Li Xuan-Jun', position: 'TOP', age: 27, nationality: 'China', baseRating: 88, personality: 'Líder NATO', popularity: 83, championPool: ['gwen', 'graves', 'aatrox'] },
    { name: 'Tarzan', realName: 'Lee Seung-yong', position: 'JNG', age: 26, nationality: 'Coreia do Sul', baseRating: 90, personality: 'Focado', popularity: 85, championPool: ['lee_sin', 'sejuani', 'maokai'] },
    { name: 'Shanks', realName: 'Cui Ya-zhou', position: 'MID', age: 24, nationality: 'China', baseRating: 88, personality: 'Resiliente', popularity: 76, championPool: ['azir', 'corki', 'taliyah'] },
    { name: 'Hope', realName: 'Wang Jie', position: 'ADC', age: 25, nationality: 'China', baseRating: 87, personality: 'Focado', popularity: 79, championPool: ['aphelios', 'jinx', 'zeri'] },
    { name: 'Kael', realName: 'Kim Jin-hong', position: 'SUP', age: 22, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Resiliente', popularity: 71, championPool: ['leona', 'alistar', 'rakan'] }
  ],
  lpl_jdg: [
    { name: 'Xiaoxu', realName: 'Xu Xing-zu', position: 'TOP', age: 22, nationality: 'China', baseRating: 85, personality: 'Tímido (Focado)', popularity: 71, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'JunJia', realName: 'Yu Chun-chia', position: 'JNG', age: 24, nationality: 'Taiwan', baseRating: 84, personality: 'Focado', popularity: 72, championPool: ['maokai', 'sejuani', 'viego'] },
    { name: 'HongQ', realName: 'HongQ Mid', position: 'MID', age: 21, nationality: 'China', baseRating: 83, personality: 'Resiliente', popularity: 65, championPool: ['yone', 'azir', 'taliyah'] },
    { name: 'GALA', realName: 'Chen Wei', position: 'ADC', age: 25, nationality: 'China', baseRating: 92, personality: 'Perfeccionista (Calmo)', popularity: 90, championPool: ['kai_sa', 'aphelios', 'jinx'] },
    { name: 'Vampire', realName: 'Zhao Zhe', position: 'SUP', age: 23, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 68, championPool: ['leona', 'nautilus', 'rell'] }
  ],
  lpl_tes: [
    { name: '369', realName: 'Bai Jia-hao', position: 'TOP', age: 24, nationality: 'China', baseRating: 91, personality: 'Resiliente', popularity: 88, championPool: ['k_sante', 'gragas', 'gnar'] },
    { name: 'naiyou', realName: 'naiyou Jng', position: 'JNG', age: 20, nationality: 'China', baseRating: 84, personality: 'Tímido (Focado)', popularity: 67, championPool: ['viego', 'lee_sin', 'brand'] },
    { name: 'Creme', realName: 'Lin Jian', position: 'MID', age: 22, nationality: 'China', baseRating: 89, personality: 'Agressivo', popularity: 82, championPool: ['akali', 'sylas', 'yone'] },
    { name: 'JackeyLove', realName: 'Yu Wen-bo', position: 'ADC', age: 25, nationality: 'China', baseRating: 93, personality: 'Estrela (Ambicioso)', popularity: 95, championPool: ['draven', 'ezreal', 'kai_sa'] },
    { name: 'fengyue', realName: 'fengyue Sup', position: 'SUP', age: 21, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 64, championPool: ['leona', 'rell', 'alistar'] },
    { name: 'JiaQi', realName: 'JiaQi ADC', position: 'ADC', age: 19, nationality: 'China', baseRating: 81, personality: 'Tímido (Focado)', popularity: 60, championPool: ['aphelios', 'jinx', 'ezreal'] } // SUB
  ],
  lpl_wbg: [
    { name: 'Zika', realName: 'Tang Hua-yu', position: 'TOP', age: 22, nationality: 'China', baseRating: 88, personality: 'Focado', popularity: 81, championPool: ['jax', 'rumble', 'gnar'] },
    { name: 'Jiejie', realName: 'Zhao Li-jie', position: 'JNG', age: 24, nationality: 'China', baseRating: 89, personality: 'Líder NATO', popularity: 85, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Xiaohu', realName: 'Li Yuan-hao', position: 'MID', age: 28, nationality: 'China', baseRating: 90, personality: 'Líder NATO', popularity: 91, championPool: ['syndra', 'taliyah', 'azir'] },
    { name: 'Elk', realName: 'Zhao Jia-hao', position: 'ADC', age: 24, nationality: 'China', baseRating: 92, personality: 'Estrela (Ambicioso)', popularity: 89, championPool: ['ezreal', 'jinx', 'varus'] },
    { name: 'Erha', realName: 'Erha Sup', position: 'SUP', age: 21, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 62, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lpl_edg: [
    { name: 'Zdz', realName: 'Zhu De-zhang', position: 'TOP', age: 24, nationality: 'China', baseRating: 83, personality: 'Resiliente', popularity: 72, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Xiaohao', realName: 'Peng Hao', position: 'JNG', age: 23, nationality: 'China', baseRating: 84, personality: 'Focado', popularity: 71, championPool: ['lee_sin', 'viego', 'maokai'] },
    { name: 'Angel', realName: 'Xiang Tao', position: 'MID', age: 25, nationality: 'China', baseRating: 85, personality: 'Resiliente', popularity: 78, championPool: ['azir', 'corki', 'taliyah'] },
    { name: 'Leave', realName: 'Hu Xian-zhao', position: 'ADC', age: 23, nationality: 'China', baseRating: 83, personality: 'Agressivo', popularity: 74, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Parukia', realName: 'Parukia Sup', position: 'SUP', age: 21, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 61, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lpl_ig: [
    { name: 'Soboro', realName: 'Soboro Top', position: 'TOP', age: 22, nationality: 'China', baseRating: 83, personality: 'Focado', popularity: 70, championPool: ['k_sante', 'gnar', 'rumble'] },
    { name: 'Wei', realName: 'Yan Yang-wei', position: 'JNG', age: 23, nationality: 'China', baseRating: 89, personality: 'Líder NATO', popularity: 84, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Rookie', realName: 'Song Eui-jin', position: 'MID', age: 29, nationality: 'Coreia do Sul', baseRating: 92, personality: 'Líder NATO', popularity: 93, championPool: ['leblanc', 'syndra', 'azir'] },
    { name: 'Photic', realName: 'Ying Qi-shen', position: 'ADC', age: 23, nationality: 'China', baseRating: 86, personality: 'Agressivo', popularity: 79, championPool: ['zeri', 'aphelios', 'ezreal'] },
    { name: 'Meiko', realName: 'Tian Ye', position: 'SUP', age: 27, nationality: 'China', baseRating: 91, personality: 'Líder NATO', popularity: 90, championPool: ['thresh', 'alistar', 'lulu'] },
    { name: 'Jwei', realName: 'Jwei Sup', position: 'SUP', age: 22, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 66, championPool: ['rell', 'leona', 'rakan'] } // SUB
  ],
  lpl_lgd: [
    { name: 'sasi', realName: 'sasi Top', position: 'TOP', age: 21, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 64, championPool: ['k_sante', 'aatrox', 'rumble'] },
    { name: 'Heng', realName: 'Yang Cui-heng', position: 'JNG', age: 23, nationality: 'China', baseRating: 82, personality: 'Focado', popularity: 66, championPool: ['lee_sin', 'viego', 'maokai'] },
    { name: 'Tangyuan', realName: 'Lin Yu-hong', position: 'MID', age: 21, nationality: 'China', baseRating: 83, personality: 'Tímido (Focado)', popularity: 68, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Shaoye', realName: 'Shaoye ADC', position: 'ADC', age: 22, nationality: 'China', baseRating: 81, personality: 'Focado', popularity: 65, championPool: ['jinx', 'ezreal', 'aphelios'] },
    { name: 'Ycx', realName: 'Ycx Sup', position: 'SUP', age: 21, nationality: 'China', baseRating: 79, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_lng: [
    { name: 'LNG_Top', realName: 'Lng TopName', position: 'TOP', age: 22, nationality: 'China', baseRating: 83, personality: 'Resiliente', popularity: 70, championPool: ['k_sante', 'jax', 'gnar'] },
    { name: 'Croco', realName: 'Kim Dong-beom', position: 'JNG', age: 24, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Agressivo', popularity: 78, championPool: ['viego', 'lee_sin', 'graves'] },
    { name: 'LNG_Mid', realName: 'Lng MidName', position: 'MID', age: 22, nationality: 'China', baseRating: 84, personality: 'Focado', popularity: 72, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'BuLLDoG', realName: 'Lee Tae-young', position: 'ADC', age: 21, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Perfeccionista (Calmo)', popularity: 76, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'LNG_Sup', realName: 'Lng SupName', position: 'SUP', age: 21, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 65, championPool: ['rakan', 'leona', 'alistar'] }
  ],
  lpl_omg: [
    { name: 'OMG_Top', realName: 'Omg TopName', position: 'TOP', age: 22, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 68, championPool: ['aatrox', 'k_sante', 'rumble'] },
    { name: 'Juhan', realName: 'Lee Ju-han', position: 'JNG', age: 24, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Focado', popularity: 72, championPool: ['maokai', 'viego', 'lee_sin'] },
    { name: 'OMG_Mid', realName: 'Omg MidName', position: 'MID', age: 21, nationality: 'China', baseRating: 81, personality: 'Tímido (Focado)', popularity: 64, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'OMG_ADC', realName: 'Omg AdcName', position: 'ADC', age: 22, nationality: 'China', baseRating: 82, personality: 'Focado', popularity: 66, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'OMG_Sup', realName: 'Omg SupName', position: 'SUP', age: 21, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 59, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_up: [
    { name: 'UP_Top', realName: 'Up TopName', position: 'TOP', age: 23, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 63, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'UP_Jng', realName: 'Up JngName', position: 'JNG', age: 21, nationality: 'China', baseRating: 81, personality: 'Focado', popularity: 64, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'UP_Mid', realName: 'Up MidName', position: 'MID', age: 22, nationality: 'China', baseRating: 81, personality: 'Tímido (Focado)', popularity: 62, championPool: ['azir', 'sylas', 'corki'] },
    { name: 'Hena', realName: 'Park Jeog-hwan', position: 'ADC', age: 26, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Focado', popularity: 75, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Grizzly', realName: 'Grizzly Sup', position: 'SUP', age: 21, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lpl_tt: [
    { name: 'TT_Top', realName: 'Tt TopName', position: 'TOP', age: 21, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 62, championPool: ['k_sante', 'aatrox', 'rumble'] },
    { name: 'TT_Jng', realName: 'Tt JngName', position: 'JNG', age: 22, nationality: 'China', baseRating: 82, personality: 'Agressivo', popularity: 65, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'TT_Mid', realName: 'Tt MidName', position: 'MID', age: 23, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 64, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'TT_ADC', realName: 'Tt AdcName', position: 'ADC', age: 22, nationality: 'China', baseRating: 83, personality: 'Focado', popularity: 66, championPool: ['ezreal', 'jinx', 'aphelios'] },
    { name: 'TT_Sup', realName: 'Tt SupName', position: 'SUP', age: 21, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_nip: [
    { name: 'Shanji', realName: 'Deng Zi-jian', position: 'TOP', age: 24, nationality: 'China', baseRating: 85, personality: 'Brincalhão (Química)', popularity: 78, championPool: ['rumble', 'k_sante', 'gwen'] },
    { name: 'Aki', realName: 'Mao An', position: 'JNG', age: 23, nationality: 'China', baseRating: 83, personality: 'Focado', popularity: 72, championPool: ['lee_sin', 'maokai', 'sejuani'] },
    { name: 'NIP_Mid', realName: 'Nip MidName', position: 'MID', age: 22, nationality: 'China', baseRating: 84, personality: 'Resiliente', popularity: 70, championPool: ['azir', 'sylas', 'taliyah'] },
    { name: 'NIP_ADC', realName: 'Nip AdcName', position: 'ADC', age: 22, nationality: 'China', baseRating: 84, personality: 'Focado', popularity: 71, championPool: ['jinx', 'ezreal', 'aphelios'] },
    { name: 'NIP_Support', realName: 'Nip SupName', position: 'SUP', age: 22, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 65, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_we: [
    { name: 'WE_Top', realName: 'We TopName', position: 'TOP', age: 21, nationality: 'China', baseRating: 80, personality: 'Tímido (Focado)', popularity: 61, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'WE_Jungle', realName: 'We JngName', position: 'JNG', age: 22, nationality: 'China', baseRating: 81, personality: 'Focado', popularity: 62, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'WE_Mid', realName: 'We MidName', position: 'MID', age: 23, nationality: 'China', baseRating: 82, personality: 'Resiliente', popularity: 64, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'WE_ADC', realName: 'We AdcName', position: 'ADC', age: 22, nationality: 'China', baseRating: 83, personality: 'Focado', popularity: 66, championPool: ['ezreal', 'jinx', 'aphelios'] },
    { name: 'WE_Support', realName: 'We SupName', position: 'SUP', age: 21, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_ra: [
    { name: 'RA_Top', realName: 'Ra TopName', position: 'TOP', age: 21, nationality: 'China', baseRating: 81, personality: 'Resiliente', popularity: 60, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'RA_Jng', realName: 'Ra JngName', position: 'JNG', age: 22, nationality: 'China', baseRating: 82, personality: 'Focado', popularity: 63, championPool: ['lee_sin', 'viego', 'maokai'] },
    { name: 'RA_Mid', realName: 'Ra MidName', position: 'MID', age: 21, nationality: 'China', baseRating: 81, personality: 'Tímido (Focado)', popularity: 61, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'RA_ADC', realName: 'Ra AdcName', position: 'ADC', age: 22, nationality: 'China', baseRating: 83, personality: 'Focado', popularity: 65, championPool: ['ezreal', 'jinx', 'aphelios'] },
    { name: 'RA_Support', realName: 'Ra SupName', position: 'SUP', age: 21, nationality: 'China', baseRating: 80, personality: 'Resiliente', popularity: 57, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lpl_rng: [
    { name: 'RNG_Top', realName: 'Rng TopName', position: 'TOP', age: 23, nationality: 'China', baseRating: 83, personality: 'Resiliente', popularity: 78, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'RNG_Jng', realName: 'Rng JngName', position: 'JNG', age: 22, nationality: 'China', baseRating: 84, personality: 'Agressivo', popularity: 77, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'RNG_Mid', realName: 'Rng MidName', position: 'MID', age: 24, nationality: 'China', baseRating: 85, personality: 'Líder NATO', popularity: 81, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'RNG_ADC', realName: 'Rng AdcName', position: 'ADC', age: 23, nationality: 'China', baseRating: 85, personality: 'Focado', popularity: 82, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'RNG_Support', realName: 'Rng SupName', position: 'SUP', age: 24, nationality: 'China', baseRating: 84, personality: 'Resiliente', popularity: 79, championPool: ['alistar', 'leona', 'rakan'] }
  ],

  // --- LEC (10 teams) ---
  lec_g2: [
    { name: 'BrokenBlade', realName: 'Sergen Çelik', position: 'TOP', age: 26, nationality: 'Alemanha', baseRating: 89, personality: 'Brincalhão (Química)', popularity: 88, championPool: ['k_sante', 'yasuo', 'aatrox'] },
    { name: 'SkewMond', realName: 'Rudy Hertz', position: 'JNG', age: 21, nationality: 'França', baseRating: 87, personality: 'Agressivo', popularity: 80, championPool: ['lee_sin', 'viego', 'khazix'] },
    { name: 'Caps', realName: 'Rasmus Winther', position: 'MID', age: 26, nationality: 'Dinamarca', baseRating: 93, personality: 'Líder NATO', popularity: 96, championPool: ['azir', 'leblanc', 'syndra'] },
    { name: 'Hans Sama', realName: 'Steven Liv', position: 'ADC', age: 26, nationality: 'França', baseRating: 90, personality: 'Focado', popularity: 89, championPool: ['draven', 'jinx', 'kalista'] },
    { name: 'Labrov', realName: 'Labros Papoutsakis', position: 'SUP', age: 24, nationality: 'Grécia', baseRating: 87, personality: 'Resiliente', popularity: 81, championPool: ['alistar', 'leona', 'rell'] }
  ],
  lec_fnc: [
    { name: 'Empyros', realName: 'Empyros Top', position: 'TOP', age: 22, nationality: 'Europa', baseRating: 83, personality: 'Focado', popularity: 72, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'Razork', realName: 'Iván Martín', position: 'JNG', age: 25, nationality: 'Espanha', baseRating: 89, personality: 'Brincalhão (Química)', popularity: 86, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Vladi', realName: 'Vladis Mid', position: 'MID', age: 22, nationality: 'Grécia', baseRating: 83, personality: 'Focado', popularity: 74, championPool: ['yone', 'azir', 'taliyah'] },
    { name: 'Upset', realName: 'Elias Lipp', position: 'ADC', age: 26, nationality: 'Alemanha', baseRating: 88, personality: 'Perfeccionista (Calmo)', popularity: 85, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Lospa', realName: 'Lospa Sup', position: 'SUP', age: 21, nationality: 'Portugal', baseRating: 82, personality: 'Resiliente', popularity: 65, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lec_koi: [
    { name: 'Myrwn', realName: 'Alex Pastorini', position: 'TOP', age: 23, nationality: 'Espanha', baseRating: 84, personality: 'Resiliente', popularity: 75, championPool: ['graves', 'gnar', 'jax'] },
    { name: 'Elyoya', realName: 'Javier Prades', position: 'JNG', age: 25, nationality: 'Espanha', baseRating: 89, personality: 'Líder NATO', popularity: 88, championPool: ['lee_sin', 'vi', 'sejuani'] },
    { name: 'Jojopyun', realName: 'Joseph Joon Pyun', position: 'MID', age: 21, nationality: 'Canadá', baseRating: 88, personality: 'Estrela (Ambicioso)', popularity: 86, championPool: ['sylas', 'ahri', 'azir'] },
    { name: 'Supa', realName: 'David Martínez', position: 'ADC', age: 24, nationality: 'Espanha', baseRating: 85, personality: 'Agressivo', popularity: 76, championPool: ['zeri', 'ezreal', 'jinx'] },
    { name: 'Alvaro', realName: 'Álvaro Fernández', position: 'SUP', age: 23, nationality: 'Espanha', baseRating: 85, personality: 'Brincalhão (Química)', popularity: 78, championPool: ['rakan', 'alistar', 'nautilus'] }
  ],
  lec_kc: [
    { name: 'Canna', realName: 'Kim Chang-dong', position: 'TOP', age: 25, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Resiliente', popularity: 81, championPool: ['jayce', 'gnar', 'jax'] },
    { name: 'Yike', realName: 'Martin Sundelin', position: 'JNG', age: 24, nationality: 'Suécia', baseRating: 87, personality: 'Focado', popularity: 82, championPool: ['viego', 'belveth', 'maokai'] },
    { name: 'Kyeahoo', realName: 'Cha Hee-min', position: 'MID', age: 21, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Tímido (Focado)', popularity: 71, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Caliste', realName: 'Caliste Henry-Gillet', position: 'ADC', age: 19, nationality: 'França', baseRating: 86, personality: 'Estrela (Ambicioso)', popularity: 85, championPool: ['ezreal', 'jinx', 'aphelios'] },
    { name: 'Busio', realName: 'Alan Cwalina', position: 'SUP', age: 23, nationality: 'EUA', baseRating: 84, personality: 'Focado', popularity: 76, championPool: ['alistar', 'rell', 'leona'] }
  ],
  lec_sk: [
    { name: 'Wunder', realName: 'Martin Hansen', position: 'TOP', age: 27, nationality: 'Dinamarca', baseRating: 85, personality: 'Resiliente', popularity: 84, championPool: ['k_sante', 'gnar', 'gragas'] },
    { name: 'Skeanz', realName: 'Duncan Marquet', position: 'JNG', age: 25, nationality: 'França', baseRating: 83, personality: 'Focado', popularity: 71, championPool: ['lee_sin', 'maokai', 'sejuani'] },
    { name: 'LIDER', realName: 'Adam Ilyasov', position: 'MID', age: 26, nationality: 'Noruega', baseRating: 84, personality: 'Agressivo', popularity: 76, championPool: ['yasuo', 'irelia', 'zed'] },
    { name: 'Jopa', realName: 'Jopa Mid', position: 'ADC', age: 22, nationality: 'Europa', baseRating: 82, personality: 'Resiliente', popularity: 66, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Mikyx', realName: 'Mihael Mehle', position: 'SUP', age: 27, nationality: 'Eslovênia', baseRating: 89, personality: 'Líder NATO', popularity: 89, championPool: ['bard', 'rakan', 'thresh'] }
  ],
  lec_gx: [
    { name: 'Lot', realName: 'Lot Top', position: 'TOP', age: 22, nationality: 'Europa', baseRating: 81, personality: 'Resiliente', popularity: 62, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'ISMA', realName: 'Ismaïl Boulebda', position: 'JNG', age: 23, nationality: 'França', baseRating: 83, personality: 'Agressivo', popularity: 68, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Jackies', realName: 'Jackies Mid', position: 'MID', age: 21, nationality: 'República Tcheca', baseRating: 83, personality: 'Resiliente', popularity: 69, championPool: ['azir', 'sylas', 'yone'] },
    { name: 'Noah', realName: 'Oh Hyeon-taek', position: 'ADC', age: 24, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Perfeccionista (Calmo)', popularity: 80, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Jun', realName: 'Yoon Se-jun', position: 'SUP', age: 25, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Resiliente', popularity: 78, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lec_vit: [
    { name: 'Naak Nako', realName: 'Naak Nako', position: 'TOP', age: 21, nationality: 'Turquia', baseRating: 82, personality: 'Tímido (Focado)', popularity: 69, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Lyncas', realName: 'Lyncas Jng', position: 'JNG', age: 22, nationality: 'Lituânia', baseRating: 83, personality: 'Focado', popularity: 71, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Humanoid', realName: 'Marek Brázda', position: 'MID', age: 26, nationality: 'República Tcheca', baseRating: 87, personality: 'Focado', popularity: 83, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Carzzy', realName: 'Matyáš Orság', position: 'ADC', age: 24, nationality: 'República Tcheca', baseRating: 87, personality: 'Brincalhão (Química)', popularity: 84, championPool: ['ezreal', 'kai_sa', 'jinx'] },
    { name: 'Fleshy', realName: 'Fleshy Sup', position: 'SUP', age: 22, nationality: 'Europa', baseRating: 81, personality: 'Resiliente', popularity: 64, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lec_sh: [
    { name: 'Rooster', realName: 'Rooster Top', position: 'TOP', age: 22, nationality: 'Europa', baseRating: 81, personality: 'Focado', popularity: 61, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'Boukada', realName: 'Boukada Jng', position: 'JNG', age: 23, nationality: 'França', baseRating: 82, personality: 'Resiliente', popularity: 64, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'nuc', realName: 'Ilias Bizriken', position: 'MID', age: 23, nationality: 'França', baseRating: 84, personality: 'Focado', popularity: 75, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Paduck', realName: 'Paduck Adc', position: 'ADC', age: 21, nationality: 'Polônia', baseRating: 80, personality: 'Resiliente', popularity: 62, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Trymbi', realName: 'Adrian Trybus', position: 'SUP', age: 25, nationality: 'Polônia', baseRating: 85, personality: 'Líder NATO', popularity: 82, championPool: ['alistar', 'lulu', 'rakan'] }
  ],
  lec_th: [
    { name: 'Tracyn', realName: 'Tracyn Top', position: 'TOP', age: 21, nationality: 'Europa', baseRating: 80, personality: 'Tímido (Focado)', popularity: 60, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Sheo', realName: 'Sheo Jng', position: 'JNG', age: 24, nationality: 'França', baseRating: 83, personality: 'Focado', popularity: 70, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Serin', realName: 'Fatih Yardım', position: 'MID', age: 24, nationality: 'Turquia', baseRating: 83, personality: 'Resiliente', popularity: 68, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Ice', realName: 'Yoon Sang-hoon', position: 'ADC', age: 24, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Focado', popularity: 76, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Stend', realName: 'Stend Sup', position: 'SUP', age: 22, nationality: 'França', baseRating: 80, personality: 'Resiliente', popularity: 59, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lec_navi: [
    { name: 'Maynter', realName: 'Maynter Top', position: 'TOP', age: 21, nationality: 'Ucrânia', baseRating: 81, personality: 'Resiliente', popularity: 65, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'Rhilech', realName: 'Rhilech Jng', position: 'JNG', age: 22, nationality: 'Ucrânia', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['lee_sin', 'viego', 'maokai'] },
    { name: 'Poby', realName: 'Yoon Sung-won', position: 'MID', age: 20, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Resiliente', popularity: 75, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'SamD', realName: 'Lee Jae-hoon', position: 'ADC', age: 26, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Resiliente', popularity: 72, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Parus', realName: 'Parus Sup', position: 'SUP', age: 21, nationality: 'Ucrânia', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['leona', 'rell', 'alistar'] }
  ],

  // --- LCS (8 teams) ---
  lcs_lyon: [
    { name: 'Zamudo', realName: 'Zamudo Top', position: 'TOP', age: 22, nationality: 'México', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Inspired', realName: 'Kacper Słoma', position: 'JNG', age: 24, nationality: 'Polônia', baseRating: 88, personality: 'Líder NATO', popularity: 84, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Saint', realName: 'Saint Mid', position: 'MID', age: 22, nationality: 'EUA', baseRating: 82, personality: 'Focado', popularity: 66, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'Berserker', realName: 'Kim Min-cheol', position: 'ADC', age: 22, nationality: 'Coreia do Sul', baseRating: 90, personality: 'Perfeccionista (Calmo)', popularity: 88, championPool: ['ezreal', 'zeri', 'aphelios'] },
    { name: 'Isles', realName: 'Jonah Rosario', position: 'SUP', age: 25, nationality: 'Austrália', baseRating: 81, personality: 'Resiliente', popularity: 70, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lcs_c9: [
    { name: 'Thanatos', realName: 'Park Seung-gyu', position: 'TOP', age: 21, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Agressivo', popularity: 78, championPool: ['gnar', 'jax', 'k_sante'] },
    { name: 'Blaber', realName: 'Robert Huang', position: 'JNG', age: 26, nationality: 'EUA', baseRating: 88, personality: 'Agressivo', popularity: 89, championPool: ['lee_sin', 'kindred', 'sejuani'] },
    { name: 'APA', realName: 'Eain Stearns', position: 'MID', age: 23, nationality: 'EUA', baseRating: 87, personality: 'Estrela (Ambicioso)', popularity: 85, championPool: ['ziggs', 'aurelion_sol', 'syndra'] },
    { name: 'Zven', realName: 'Jesper Svenningsen', position: 'ADC', age: 28, nationality: 'Dinamarca', baseRating: 86, personality: 'Líder NATO', popularity: 88, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Vulcan', realName: 'Philippe Laflamme', position: 'SUP', age: 26, nationality: 'Canadá', baseRating: 85, personality: 'Brincalhão (Química)', popularity: 81, championPool: ['alistar', 'rell', 'leona'] }
  ],
  lcs_tl: [
    { name: 'Morgan', realName: 'Park Gi-tae', position: 'TOP', age: 25, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 83, championPool: ['renekton', 'gnar', 'k_sante'] },
    { name: 'Josedeodo', realName: 'Brandon Joel Villegas', position: 'JNG', age: 25, nationality: 'Argentina', baseRating: 84, personality: 'Brincalhão (Química)', popularity: 82, championPool: ['viego', 'lee_sin', 'graves'] },
    { name: 'Quid', realName: 'Lim Hyeon-seung', position: 'MID', age: 22, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Focado', popularity: 79, championPool: ['yone', 'azir', 'taliyah'] },
    { name: 'Yeon', realName: 'Sean Sung', position: 'ADC', age: 24, nationality: 'EUA', baseRating: 87, personality: 'Focado', popularity: 81, championPool: ['ezreal', 'varus', 'aphelios'] },
    { name: 'CoreJJ', realName: 'Jo Yong-in', position: 'SUP', age: 31, nationality: 'Coreia do Sul', baseRating: 88, personality: 'Líder NATO', popularity: 90, championPool: ['thresh', 'alistar', 'rakan'] }
  ],
  lcs_fly: [
    { name: 'Gakgos', realName: 'Gakgos Top', position: 'TOP', age: 21, nationality: 'EUA', baseRating: 81, personality: 'Tímido (Focado)', popularity: 63, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Gryffinn', realName: 'Gryffinn Jng', position: 'JNG', age: 20, nationality: 'EUA', baseRating: 83, personality: 'Agressivo', popularity: 71, championPool: ['viego', 'lee_sin', 'graves'] },
    { name: 'Quad', realName: 'Song Su-hyeong', position: 'MID', age: 24, nationality: 'Coreia do Sul', baseRating: 86, personality: 'Perfeccionista (Calmo)', popularity: 81, championPool: ['azir', 'sylas', 'taliyah'] },
    { name: 'Massu', realName: 'Fahad Abdulmalek', position: 'ADC', age: 21, nationality: 'Canadá', baseRating: 85, personality: 'Focado', popularity: 78, championPool: ['zeri', 'ezreal', 'varus'] },
    { name: 'Cryogen', realName: 'Cryogen Sup', position: 'SUP', age: 21, nationality: 'EUA', baseRating: 80, personality: 'Resiliente', popularity: 60, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcs_dig: [
    { name: 'Photon', realName: 'Gyeong Gyu-tae', position: 'TOP', age: 24, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 76, championPool: ['jax', 'rumble', 'gnar'] },
    { name: 'eXyu', realName: 'Lawrence Xu', position: 'JNG', age: 24, nationality: 'EUA', baseRating: 82, personality: 'Focado', popularity: 68, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Palafox', realName: 'Cristian Palafox', position: 'MID', age: 26, nationality: 'EUA', baseRating: 84, personality: 'Resiliente', popularity: 78, championPool: ['taliyah', 'azir', 'syndra'] },
    { name: 'FBI', realName: 'Victor Huang', position: 'ADC', age: 26, nationality: 'Austrália', baseRating: 85, personality: 'Agressivo', popularity: 81, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'IgNar', realName: 'Lee Dong-geun', position: 'SUP', age: 29, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Líder NATO', popularity: 79, championPool: ['alistar', 'blitzcrank', 'rakan'] }
  ],
  lcs_sen: [
    { name: 'Impact', realName: 'Jeong Eon-yeong', position: 'TOP', age: 31, nationality: 'Coreia do Sul', baseRating: 87, personality: 'Líder NATO', popularity: 90, championPool: ['jax', 'gnar', 'k_sante'] },
    { name: 'HamBak', realName: 'Bang Min-woo', position: 'JNG', age: 22, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 68, championPool: ['maokai', 'viego', 'lee_sin'] },
    { name: 'DARKWINGS', realName: 'Darkwings Mid', position: 'MID', age: 22, nationality: 'EUA', baseRating: 82, personality: 'Resiliente', popularity: 65, championPool: ['azir', 'sylas', 'taliyah'] },
    { name: 'Rahel', realName: 'Cho Min-seong', position: 'ADC', age: 22, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Perfeccionista (Calmo)', popularity: 74, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'huhi', realName: 'Choi Jae-hyun', position: 'SUP', age: 31, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Líder NATO', popularity: 83, championPool: ['alistar', 'rakan', 'leona'] }
  ],
  lcs_sr: [
    { name: 'SR_Top', realName: 'Sr TopName', position: 'TOP', age: 21, nationality: 'EUA', baseRating: 80, personality: 'Tímido (Focado)', popularity: 58, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'SR_Jungle', realName: 'Sr JngName', position: 'JNG', age: 22, nationality: 'EUA', baseRating: 81, personality: 'Focado', popularity: 61, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Zinie', realName: 'Yoo Baek-jin', position: 'MID', age: 21, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Focado', popularity: 69, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'SR_ADC', realName: 'Sr AdcName', position: 'ADC', age: 22, nationality: 'EUA', baseRating: 82, personality: 'Resiliente', popularity: 62, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'SR_Support', realName: 'Sr SupName', position: 'SUP', age: 21, nationality: 'EUA', baseRating: 80, personality: 'Resiliente', popularity: 57, championPool: ['alistar', 'rell', 'leona'] }
  ],
  lcs_dsg: [
    { name: 'DSG_Top', realName: 'Dsg TopName', position: 'TOP', age: 21, nationality: 'EUA', baseRating: 80, personality: 'Brincalhão (Química)', popularity: 68, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'DSG_Jungle', realName: 'Dsg JngName', position: 'JNG', age: 22, nationality: 'EUA', baseRating: 81, personality: 'Focado', popularity: 65, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'DSG_Mid', realName: 'Dsg MidName', position: 'MID', age: 22, nationality: 'EUA', baseRating: 81, personality: 'Resiliente', popularity: 64, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'DSG_ADC', realName: 'Dsg AdcName', position: 'ADC', age: 21, nationality: 'EUA', baseRating: 82, personality: 'Focado', popularity: 69, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'DSG_Support', realName: 'Dsg SupName', position: 'SUP', age: 21, nationality: 'EUA', baseRating: 80, personality: 'Resiliente', popularity: 62, championPool: ['alistar', 'leona', 'rell'] }
  ],

  // --- CBLOL (8 teams) ---
  cblol_loud: [
    { name: 'xyno', realName: 'Luiz xyno', position: 'TOP', age: 21, nationality: 'Brasil', baseRating: 82, personality: 'Focado', popularity: 75, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Youngjae', realName: 'Go Young-jae', position: 'JNG', age: 23, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Resiliente', popularity: 77, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Jean Mago', realName: 'Jean Mago', position: 'MID', age: 22, nationality: 'Brasil', baseRating: 85, personality: 'Estrela (Ambicioso)', popularity: 94, championPool: ['yone', 'leblanc', 'syndra'] },
    { name: 'Bull', realName: 'Song Jin-hyun', position: 'ADC', age: 23, nationality: 'Coreia do Sul', baseRating: 84, personality: 'Perfeccionista (Calmo)', popularity: 78, championPool: ['aphelios', 'ezreal', 'varus'] },
    { name: 'Redbert', realName: 'Ygor Flores', position: 'SUP', age: 26, nationality: 'Brasil', baseRating: 83, personality: 'Líder NATO', popularity: 81, championPool: ['alistar', 'rakan', 'thresh'] }
  ],
  cblol_pain: [
    { name: 'Robo', realName: 'Leonardo Souza', position: 'TOP', age: 27, nationality: 'Brasil', baseRating: 86, personality: 'Líder NATO', popularity: 95, championPool: ['k_sante', 'garen', 'jax'] },
    { name: 'Cariok', realName: 'Marcos Oliveira', position: 'JNG', age: 25, nationality: 'Brasil', baseRating: 84, personality: 'Brincalhão (Química)', popularity: 88, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'tinowns', realName: 'Thiago Sartori', position: 'MID', age: 28, nationality: 'Brasil', baseRating: 86, personality: 'Perfeccionista (Calmo)', popularity: 92, championPool: ['ahri', 'azir', 'syndra'] },
    { name: 'TitaN', realName: 'Alexandre Lima', position: 'ADC', age: 25, nationality: 'Brasil', baseRating: 87, personality: 'Estrela (Ambicioso)', popularity: 93, championPool: ['ezreal', 'kalista', 'jinx'] },
    { name: 'Kuri', realName: 'Choi Won-yeong', position: 'SUP', age: 25, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Resiliente', popularity: 82, championPool: ['rakan', 'leona', 'alistar'] }
  ],
  cblol_furia: [
    { name: 'Guigo', realName: 'Francisco Guigo', position: 'TOP', age: 24, nationality: 'Brasil', baseRating: 81, personality: 'Resiliente', popularity: 75, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Tatu', realName: 'Tatu Jng', position: 'JNG', age: 20, nationality: 'Brasil', baseRating: 81, personality: 'Tímido (Focado)', popularity: 69, championPool: ['maokai', 'viego', 'sejuani'] },
    { name: 'Tutsz', realName: 'Arthur Machado', position: 'MID', age: 23, nationality: 'Brasil', baseRating: 83, personality: 'Focado', popularity: 74, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Ayu', realName: 'Ayu Adc', position: 'ADC', age: 20, nationality: 'Brasil', baseRating: 83, personality: 'Agressivo', popularity: 76, championPool: ['ezreal', 'jinx', 'aphelios'] },
    { name: 'Jojo', realName: 'Gabriel de Oliveira', position: 'SUP', age: 25, nationality: 'Brasil', baseRating: 81, personality: 'Brincalhão (Química)', popularity: 71, championPool: ['alistar', 'nautilus', 'rell'] }
  ],
  cblol_red: [
    { name: 'fNb', realName: 'Francisco Natanael', position: 'TOP', age: 25, nationality: 'Brasil', baseRating: 84, personality: 'Resiliente', popularity: 80, championPool: ['aatrox', 'orinn', 'jax'] },
    { name: 'DOOM', realName: 'Doom Jng', position: 'JNG', age: 22, nationality: 'Brasil', baseRating: 80, personality: 'Resiliente', popularity: 62, championPool: ['lee_sin', 'sejuani', 'viego'] },
    { name: 'Kaze', realName: 'Kaze Mid', position: 'MID', age: 23, nationality: 'Brasil', baseRating: 82, personality: 'Focado', popularity: 68, championPool: ['azir', 'taliyah', 'sylas'] },
    { name: 'Rabelo', realName: 'Rabelo Adc', position: 'ADC', age: 21, nationality: 'Brasil', baseRating: 82, personality: 'Resiliente', popularity: 69, championPool: ['jinx', 'ezreal', 'aphelios'] },
    { name: 'frosty', realName: 'frosty Sup', position: 'SUP', age: 21, nationality: 'Brasil', baseRating: 81, personality: 'Focado', popularity: 65, championPool: ['leona', 'rell', 'alistar'] }
  ],
  cblol_vks: [
    { name: 'Boal', realName: 'Felipe Boal', position: 'TOP', age: 23, nationality: 'Brasil', baseRating: 81, personality: 'Resiliente', popularity: 74, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Disamis', realName: 'Hugo Disamis', position: 'JNG', age: 22, nationality: 'Brasil', baseRating: 83, personality: 'Agressivo', popularity: 75, championPool: ['viego', 'lee_sin', 'graves'] },
    { name: 'Mireu', realName: 'Jeong Jo-bin', position: 'MID', age: 24, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Perfeccionista (Calmo)', popularity: 81, championPool: ['azir', 'yone', 'syndra'] },
    { name: 'Morttheus', realName: 'Morttheus Adc', position: 'ADC', age: 22, nationality: 'Brasil', baseRating: 81, personality: 'Resiliente', popularity: 67, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Kaiwing', realName: 'Ling Kai Wing', position: 'SUP', age: 28, nationality: 'Hong Kong', baseRating: 83, personality: 'Líder NATO', popularity: 79, championPool: ['alistar', 'rakan', 'leona'] }
  ],
  cblol_fluxo: [
    { name: 'curty', realName: 'Curty Top', position: 'TOP', age: 21, nationality: 'Brasil', baseRating: 80, personality: 'Tímido (Focado)', popularity: 60, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Peach', realName: 'Peach Jng', position: 'JNG', age: 24, nationality: 'Coreia do Sul', baseRating: 82, personality: 'Focado', popularity: 72, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Hauz', realName: 'Bruno Hauz', position: 'MID', age: 24, nationality: 'Brasil', baseRating: 82, personality: 'Agressivo', popularity: 76, championPool: ['yone', 'azir', 'taliyah'] },
    { name: 'Bao', realName: 'Bao Adc', position: 'ADC', age: 24, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Resiliente', popularity: 75, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'ProDelta', realName: 'ProDelta Sup', position: 'SUP', age: 22, nationality: 'Brasil', baseRating: 81, personality: 'Resiliente', popularity: 66, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  cblol_leviathan: [
    { name: 'Devost', realName: 'Devost Top', position: 'TOP', age: 21, nationality: 'Brasil', baseRating: 78, personality: 'Resiliente', popularity: 58, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Booki', realName: 'Booki Jng', position: 'JNG', age: 22, nationality: 'Brasil', baseRating: 79, personality: 'Focado', popularity: 59, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Enga', realName: 'Enga Mid', position: 'MID', age: 23, nationality: 'Argentina', baseRating: 80, personality: 'Resiliente', popularity: 62, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Ceo', realName: 'Lorenzo Tévez', position: 'ADC', age: 24, nationality: 'Argentina', baseRating: 82, personality: 'Focado', popularity: 70, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'TopLop', realName: 'TopLop Sup', position: 'SUP', age: 21, nationality: 'Brasil', baseRating: 78, personality: 'Resiliente', popularity: 55, championPool: ['leona', 'rell', 'alistar'] }
  ],
  cblol_los: [
    { name: 'Zest', realName: 'Shin Ji-min', position: 'TOP', age: 23, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Resiliente', popularity: 71, championPool: ['renekton', 'jax', 'k_sante'] },
    { name: 'Drakehero', realName: 'Drakehero Jng', position: 'JNG', age: 21, nationality: 'Brasil', baseRating: 80, personality: 'Focado', popularity: 62, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Feisty', realName: 'Min Seong-min', position: 'MID', age: 22, nationality: 'Coreia do Sul', baseRating: 81, personality: 'Resiliente', popularity: 68, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'Duduhh', realName: 'Duduhh Adc', position: 'ADC', age: 20, nationality: 'Brasil', baseRating: 80, personality: 'Tímido (Focado)', popularity: 64, championPool: ['ezreal', 'jinx', 'varus'] },
    { name: 'Ackerman', realName: 'Ackerman Sup', position: 'SUP', age: 22, nationality: 'Brasil', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['alistar', 'nautilus', 'leona'] }
  ],

  // --- LCP (8 teams) ---
  lcp_cfo: [
    { name: 'Rest', realName: 'Chang Yu-Ming', position: 'TOP', age: 26, nationality: 'Taiwan', baseRating: 84, personality: 'Líder NATO', popularity: 75, championPool: ['k_sante', 'gnar', 'jax'] },
    { name: 'Shad0w', realName: 'Zhiqiang Zhao', position: 'JNG', age: 25, nationality: 'China', baseRating: 85, personality: 'Focado', popularity: 74, championPool: ['lee_sin', 'viego', 'sejuani'] },
    { name: 'Pungyeon', realName: 'Lee Jong-hyeok', position: 'MID', age: 23, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Resiliente', popularity: 71, championPool: ['syndra', 'azir', 'yone'] },
    { name: 'Doggo', realName: 'Chiu Tzu-Chuan', position: 'ADC', age: 23, nationality: 'Taiwan', baseRating: 86, personality: 'Estrela (Ambicioso)', popularity: 82, championPool: ['ezreal', 'aphelios', 'jinx'] },
    { name: 'Orca', realName: 'Orca Sup', position: 'SUP', age: 21, nationality: 'Taiwan', baseRating: 81, personality: 'Resiliente', popularity: 60, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_gam: [
    { name: 'Kiaya', realName: 'Trần Duy Sang', position: 'TOP', age: 24, nationality: 'Vietnã', baseRating: 85, personality: 'Resiliente', popularity: 81, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Draktharr', realName: 'Draktharr Jng', position: 'JNG', age: 22, nationality: 'Vietnã', baseRating: 82, personality: 'Focado', popularity: 72, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Aress', realName: 'Aress Mid', position: 'MID', age: 21, nationality: 'Vietnã', baseRating: 82, personality: 'Resiliente', popularity: 68, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Artemis', realName: 'Trần Quốc Hưng', position: 'ADC', age: 24, nationality: 'Vietnã', baseRating: 85, personality: 'Agressivo', popularity: 79, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Taki', realName: 'Đinh Anh Tài', position: 'SUP', age: 22, nationality: 'Vietnã', baseRating: 82, personality: 'Resiliente', popularity: 70, championPool: ['alistar', 'nautilus', 'leona'] }
  ],
  lcp_shg: [
    { name: 'Evi', realName: 'Shunsuke Murase', position: 'TOP', age: 30, nationality: 'Japão', baseRating: 84, personality: 'Líder NATO', popularity: 85, championPool: ['k_sante', 'aatrox', 'gnar'] },
    { name: 'Van', realName: 'Van Jng', position: 'JNG', age: 22, nationality: 'Japão', baseRating: 81, personality: 'Resiliente', popularity: 61, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Aria', realName: 'Lee Ga-eul', position: 'MID', age: 25, nationality: 'Coreia do Sul', baseRating: 85, personality: 'Resiliente', popularity: 79, championPool: ['syndra', 'azir', 'taliyah'] },
    { name: 'Marble', realName: 'Marble Adc', position: 'ADC', age: 23, nationality: 'Japão', baseRating: 82, personality: 'Focado', popularity: 70, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Vsta', realName: 'Oh Hyo-seong', position: 'SUP', age: 25, nationality: 'Coreia do Sul', baseRating: 83, personality: 'Focado', popularity: 74, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_tsw: [
    { name: 'Ironveil', realName: 'Ironveil Top', position: 'TOP', age: 22, nationality: 'Leste Asiático', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Phantom', realName: 'Phantom Jng', position: 'JNG', age: 21, nationality: 'Leste Asiático', baseRating: 81, personality: 'Focado', popularity: 62, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Stormrix', realName: 'Stormrix Mid', position: 'MID', age: 23, nationality: 'Leste Asiático', baseRating: 81, personality: 'Resiliente', popularity: 60, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Dawnshot', realName: 'Dawnshot Adc', position: 'ADC', age: 22, nationality: 'Leste Asiático', baseRating: 82, personality: 'Focado', popularity: 63, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Tidecaller', realName: 'Tidecaller Sup', position: 'SUP', age: 22, nationality: 'Leste Asiático', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_dfm: [
    { name: 'Obsidian', realName: 'Obsidian Top', position: 'TOP', age: 22, nationality: 'Japão', baseRating: 80, personality: 'Resiliente', popularity: 62, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Flashpoint', realName: 'Flashpoint Jng', position: 'JNG', age: 22, nationality: 'Japão', baseRating: 81, personality: 'Focado', popularity: 61, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Nullwave', realName: 'Nullwave Mid', position: 'MID', age: 23, nationality: 'Japão', baseRating: 82, personality: 'Resiliente', popularity: 63, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'Recoil', realName: 'Recoil Adc', position: 'ADC', age: 22, nationality: 'Japão', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['aphelios', 'ezreal', 'jinx'] },
    { name: 'Vigil', realName: 'Vigil Sup', position: 'SUP', age: 21, nationality: 'Japão', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_mvk: [
    { name: 'Crestone', realName: 'Crestone Top', position: 'TOP', age: 21, nationality: 'Leste Asiático', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Razorwing', realName: 'Razorwing Jng', position: 'JNG', age: 22, nationality: 'Leste Asiático', baseRating: 81, personality: 'Focado', popularity: 59, championPool: ['viego', 'lee_sin', 'sejuani'] },
    { name: 'Voltex', realName: 'Voltex Mid', position: 'MID', age: 23, nationality: 'Leste Asiático', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Mirrorshot', realName: 'Mirrorshot Adc', position: 'ADC', age: 22, nationality: 'Leste Asiático', baseRating: 82, personality: 'Focado', popularity: 63, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Emberglow', realName: 'Emberglow Sup', position: 'SUP', age: 21, nationality: 'Leste Asiático', baseRating: 80, personality: 'Resiliente', popularity: 56, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_dcg: [
    { name: 'Fracture', realName: 'Fracture Top', position: 'TOP', age: 22, nationality: 'Taiwan', baseRating: 80, personality: 'Resiliente', popularity: 60, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Crosspath', realName: 'Crosspath Jng', position: 'JNG', age: 21, nationality: 'Taiwan', baseRating: 81, personality: 'Focado', popularity: 61, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Depthseeker', realName: 'Depthseeker Mid', position: 'MID', age: 22, nationality: 'Taiwan', baseRating: 81, personality: 'Resiliente', popularity: 62, championPool: ['azir', 'syndra', 'yone'] },
    { name: 'Splitmark', realName: 'Splitmark Adc', position: 'ADC', age: 23, nationality: 'Taiwan', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Voidpulse', realName: 'Voidpulse Sup', position: 'SUP', age: 21, nationality: 'Taiwan', baseRating: 80, personality: 'Resiliente', popularity: 57, championPool: ['leona', 'rell', 'alistar'] }
  ],
  lcp_gz: [
    { name: 'Ashfall', realName: 'Ashfall Top', position: 'TOP', age: 22, nationality: 'Austrália', baseRating: 80, personality: 'Resiliente', popularity: 61, championPool: ['k_sante', 'aatrox', 'jax'] },
    { name: 'Groundbreaker', realName: 'Groundbreaker Jng', position: 'JNG', age: 21, nationality: 'Austrália', baseRating: 81, personality: 'Focado', popularity: 61, championPool: ['viego', 'lee_sin', 'maokai'] },
    { name: 'Zeronova', realName: 'Zeronova Mid', position: 'MID', age: 23, nationality: 'Austrália', baseRating: 81, personality: 'Resiliente', popularity: 62, championPool: ['azir', 'syndra', 'taliyah'] },
    { name: 'Lastlight', realName: 'Lastlight Adc', position: 'ADC', age: 22, nationality: 'Austrália', baseRating: 82, personality: 'Focado', popularity: 64, championPool: ['ezreal', 'varus', 'jinx'] },
    { name: 'Bastion', realName: 'Bastion Sup', position: 'SUP', age: 21, nationality: 'Austrália', baseRating: 80, personality: 'Resiliente', popularity: 58, championPool: ['leona', 'rell', 'alistar'] }
  ]
};

// Generates attributes based on a target starting baseRating
export function generateRealAttributes(pos: Position, baseRating: number): PlayerAttributes {
  const dev = 4;
  const roll = (bonus = 0) => {
    const val = Math.round(baseRating + (Math.random() - 0.5) * dev * 2 + bonus);
    return Math.max(45, Math.min(99, val));
  };

  const posBonus = (attr: keyof PlayerAttributes): number => {
    if (pos === 'TOP' && (attr === 'macro' || attr === 'consistency')) return 2;
    if (pos === 'JNG' && (attr === 'mapVision' || attr === 'macro')) return 2;
    if (pos === 'MID' && (attr === 'mechanics' || attr === 'playoffPerformance')) return 2;
    if (pos === 'ADC' && (attr === 'mechanics' || attr === 'farm')) return 2;
    if (pos === 'SUP' && (attr === 'communication' || attr === 'leadership')) return 2;
    return 0;
  };

  return {
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
}

// Instantiate fully populated Player items from the databases
export function getPlayersForTeam(teamId: string, isPlayer: boolean): { roster: Player[], substitutes: Player[] } {
  const realPlayers = REAL_ROSTERS_DB[teamId];
  if (!realPlayers || realPlayers.length === 0) {
    return { roster: [], substitutes: [] };
  }

  const rosterPlayers: Player[] = [];
  const subPlayers: Player[] = [];

  realPlayers.forEach((rp, idx) => {
    const attrs = generateRealAttributes(rp.position, rp.baseRating);
    const overall = getOverallRating(attrs);
    const devPot = isPlayer ? 4 : 2;
    const pot = Math.max(overall, Math.min(99, overall + Math.floor(Math.random() * devPot) + (28 - (rp.age - 15))));

    const marketValue = Math.round((overall ** 3) * (110 + (pot - overall) * 6));
    const salary = Math.round((overall ** 2) * 48);

    const playerObj: Player = {
      id: `pl_real_${teamId}_${idx}_${rp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: rp.name,
      realName: rp.realName,
      nationality: rp.nationality,
      age: rp.age,
      position: rp.position,
      attributes: attrs,
      overallRating: overall,
      potential: pot,
      personality: rp.personality,
      popularity: rp.popularity,
      marketValue: Math.max(70000, marketValue),
      salary: Math.max(15000, salary),
      contractMonths: Math.floor(Math.random() * 18) + 12,
      motivation: 85 + Math.floor(Math.random() * 15),
      stamina: 100,
      chemistry: 75 + Math.floor(Math.random() * 20),
      championPool: rp.championPool,
      isPlayerControlled: isPlayer
    };

    // If roster is full (5 positions) or if we already have this position filled, send to subs
    const isPosFilled = rosterPlayers.some(p => p.position === rp.position);
    if (!isPosFilled && rosterPlayers.length < 5) {
      rosterPlayers.push(playerObj);
    } else {
      subPlayers.push(playerObj);
    }
  });

  return { roster: rosterPlayers, substitutes: subPlayers };
}

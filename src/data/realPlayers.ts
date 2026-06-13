import { Player, Position, PlayerAttributes } from '../types';
import { calcularValorMercado, calcularSalarioSemanal } from '../utils/currency';

// Helper to calculate overall rating from attributes
function getOverallRating(attr: PlayerAttributes): number {
  const sum = Object.values(attr).reduce((a, b) => a + b, 0);
  return Math.round(sum / Object.values(attr).length);
}

const getChampsByPos = (pos: Position): string[] => {
  switch (pos) {
    case 'TOP': return ['k_sante', 'aatrox', 'jax', 'gnar', 'rumble'];
    case 'JNG': return ['lee_sin', 'viego', 'sejuani', 'maokai', 'xin_zhao'];
    case 'MID': return ['azir', 'syndra', 'yone', 'oriana', 'taliyah'];
    case 'ADC': return ['ezreal', 'varus', 'jinx', 'aphelios', 'kai_sa'];
    case 'SUP': return ['alistar', 'nautilus', 'leona', 'rakan', 'rell'];
    default: return [];
  }
};

interface CompactPlayer {
  name: string;
  realName: string;
  position: Position;
  age: number;
  nationality: string;
  baseRating: number;
  personality: string;
  popularity: number;
  championPool: string[];
}

const COMPACT_TEAMS: { [teamId: string]: string[] } = {
  // CBLOL
  cblol_pain: [
    "Boal||TOP|23|Brasil|81|Resiliente|73",
    "Cariok||JNG|25|Brasil|83|Brincalhão (Química)|84",
    "Keine||MID|24|Coreia do Sul|82|Focado|75",
    "Trigger||ADC|24|Coreia do Sul|83|Perfeccionista (Calmo)|78",
    "Kuri||SUP|25|Coreia do Sul|82|Resiliente|79"
  ],
  cblol_loud: [
    "Xyno||TOP|21|Brasil|81|Focado|72",
    "YoungJae||JNG|23|Coreia do Sul|82|Resiliente|75",
    "Envy||MID|25|Brasil|82|Resiliente|71",
    "Bull||ADC|22|Coreia do Sul|81|Agressivo|70",
    "uZent||SUP|22|Brasil|80|Resiliente|65"
  ],
  cblol_vks: [
    "Wizer||TOP|24|Coreia do Sul|85|Resiliente|80",
    "Sarolu||JNG|22|Coreia do Sul|81|Focado|69",
    "Mireu||MID|24|Coreia do Sul|83|Perfeccionista (Calmo)|79",
    "Ceo||ADC|22|Argentina|83|Perfeccionista (Calmo)|78",
    "Kaiwing||SUP|28|Hong Kong|82|Líder NATO|77"
  ],
  cblol_red: [
    "Zynts||TOP|22|Brasil|80|Resiliente|61",
    "Stepz||JNG|21|Brasil|81|Focado|68",
    "Kaze||MID|23|Taiwan|82|Resiliente|71",
    "Morttheus||ADC|22|Brasil|80|Resiliente|66",
    "Frosty||SUP|21|Brasil|81|Brincalhão (Química)|74"
  ],
  cblol_furia: [
    "Guigo||TOP|24|Brasil|82|Resiliente|78",
    "Tatu||JNG|21|Brasil|81|Brincalhão (Química)|73",
    "Tutsz||MID|23|Brasil|82|Focado|73",
    "Ayu||ADC|20|Brasil|82|Agressivo|75",
    "JoJo||SUP|25|Brasil|83|Líder NATO|81"
  ],
  cblol_fluxo: [
    "Curty||TOP|21|Brasil|79|Resiliente|60",
    "Peach||JNG|23|Coreia do Sul|82|Focado|74",
    "Cody||MID|22|Chile|81|Agressivo|68",
    "BAO||ADC|22|Coreia do Sul|83|Resiliente|77",
    "Momochi||SUP|22|Brasil|80|Resiliente|63"
  ],
  cblol_los: [
    "Zest||TOP|22|Coreia do Sul|81|Tímido (Focado)|65",
    "Curse||JNG|23|Brasil|80|Resiliente|61",
    "Feisty||MID|21|Coreia do Sul|81|Tímido (Focado)|62",
    "Duduhh||ADC|19|Brasil|80|Tímido (Focado)|63",
    "Ackerman||SUP|23|Argentina|81|Resiliente|69"
  ],
  cblol_leviathan: [
    "Devost||TOP|22|Argentina|80|Resiliente|62",
    "Booki||JNG|21|Argentina|79|Focado|58",
    "Enga||MID|23|Chile|80|Resiliente|61",
    "Snaker||ADC|22|Argentina|81|Focado|67",
    "TopLop||SUP|21|Peru|80|Resiliente|60"
  ],

  // LCK
  lck_t1: [
    "Doran|Choi Hyeon-joon|TOP|25|Coreia do Sul|89|Resiliente|86",
    "Oner|Mun Hyeon-jun|JNG|23|Coreia do Sul|91|Agressivo|89",
    "Faker|Lee Sang-hyuk|MID|29|Coreia do Sul|94|Líder NATO|99",
    "Peyz|Kim Su-hwan|ADC|20|Coreia do Sul|91|Perfeccionista (Calmo)|90",
    "Keria|Ryu Min-seok|SUP|23|Coreia do Sul|93|Estrela (Ambicioso)|92"
  ],
  lck_geng: [
    "Kiin|Kim Gi-in|TOP|26|Coreia do Sul|92|Resiliente|88",
    "Canyon|Kim Geon-bu|JNG|24|Coreia do Sul|93|Focado|91",
    "Chovy|Jeong Ji-hoon|MID|25|Coreia do Sul|95|Perfeccionista (Calmo)|95",
    "Ruler|Park Jae-hyuk|ADC|27|Coreia do Sul|93|Líder NATO|93",
    "Duro|Min Seon-ji|SUP|21|Coreia do Sul|87|Tímido (Focado)|75"
  ],
  lck_dk: [
    "Siwoo|Yoo Si-woo|TOP|20|Coreia do Sul|83|Tímido (Focado)|68",
    "Lucid|Choi Yong-hyeok|JNG|21|Coreia do Sul|86|Agressivo|78",
    "ShowMaker|Heo Su|MID|25|Coreia do Sul|90|Brincalhão (Química)|93",
    "Smash|Sin Geum-jae|ADC|20|Coreia do Sul|82|Focado|72",
    "Career|Oh Hyeong-seok|SUP|19|Coreia do Sul|81|Resiliente|61"
  ],
  lck_hle: [
    "Zeus|Woo Je-jeon|TOP|21|Coreia do Sul|92|Resiliente|90",
    "Kanavi|Seo Jin-hyeok|JNG|25|Coreia do Sul|91|Líder NATO|88",
    "Zeka|Kim Geon-woo|MID|23|Coreia do Sul|91|Focado|87",
    "Gumayusi|Lee Min-hyeong|ADC|23|Coreia do Sul|91|Líder NATO|92",
    "Delight|Yoo Hwan-joong|SUP|23|Coreia do Sul|91|Líder NATO|84"
  ],
  lck_kt: [
    "PerfecT|Lee Seung-min|TOP|21|Coreia do Sul|84|Tímido (Focado)|70",
    "Cuzz|Moon Woo-chan|JNG|26|Coreia do Sul|86|Brincalhão (Química)|83",
    "Bdd|Gwak Bo-seong|MID|26|Coreia do Sul|88|Líder NATO|85",
    "Aiming|Kim Ha-ram|ADC|25|Coreia do Sul|87|Resiliente|84",
    "Effort|Lee Sang-ho|SUP|25|Coreia do Sul|83|Resiliente|74"
  ],
  lck_ds: [
    "DuDu|Lee Dong-ju|TOP|24|Coreia do Sul|84|Resiliente|72",
    "Pyosik|Hong Chang-hyeon|JNG|26|Coreia do Sul|85|Brincalhão (Química)|83",
    "Clozer|Lee Ju-hyeon|MID|23|Coreia do Sul|85|Resiliente|75",
    "deokdam|Seo Dae-gil|ADC|26|Coreia do Sul|84|Resiliente|74",
    "Peter|Lee Do-gyu|SUP|23|Coreia do Sul|81|Focado|66"
  ],
  lck_fox: [
    "Clear|Song Hyeon-min|TOP|21|Coreia do Sul|82|Focado|64",
    "Raptor|Jeon Eo-jin|JNG|22|Coreia do Sul|81|Agressivo|65",
    "VicLa|Lee Dae-kwang|MID|23|Coreia do Sul|83|Líder NATO|72",
    "Diable|Seol Min-je|ADC|21|Coreia do Sul|81|Agressivo|61",
    "Kellin|Kim Hyeong-gyu|SUP|25|Coreia do Sul|83|Resiliente|76"
  ],
  lck_drx: [
    "Rich|Lee Jae-won|TOP|26|Coreia do Sul|81|Resiliente|70",
    "Willer|Kim Jeong-hyeon|JNG|23|Coreia do Sul|82|Agressivo|68",
    "Ucal|Sohn Woo-hyeon|MID|25|Coreia do Sul|83|Brincalhão (Química)|72",
    "LazyFeel|Ji Heon-min|ADC|20|Coreia do Sul|81|Focado|60",
    "Andil|Moon Gwan-bin|SUP|22|Coreia do Sul|81|Resiliente|61"
  ],
  lck_bro: [
    "Casting|Shin Min-je|TOP|22|Coreia do Sul|80|Focado|58",
    "GIDEON|Kim Min-seong|JNG|21|Coreia do Sul|82|Resiliente|64",
    "Roamer|Lee Woo-beom|MID|21|Coreia do Sul|80|Resiliente|55",
    "Teddy|Park Jin-seong|ADC|26|Coreia do Sul|84|Líder NATO|80",
    "Namgung|Lee Nam-gung|SUP|21|Coreia do Sul|80|Focado|54"
  ],
  lck_ns: [
    "Kingen|Hwang Seong-hoon|TOP|26|Coreia do Sul|86|Resiliente|81",
    "Sponge|Bae Young-jun|JNG|21|Coreia do Sul|81|Focado|60",
    "Scout|Lee Ye-chan|MID|27|Coreia do Sul|91|Líder NATO|90",
    "Taeyoon|Kim Tae-yoon|ADC|23|Coreia do Sul|81|Resiliente|61",
    "Lehends|Son Si-woo|SUP|26|Coreia do Sul|89|Brincalhão (Química)|88"
  ],

  // LEC
  lec_g2: [
    "BrokenBlade|Sergen Çelik|TOP|24|Alemanha|88|Líder NATO|85",
    "SkewMond|Rudy Gelin|JNG|21|França|85|Focado|76",
    "Caps|Rasmus Winther|MID|25|Dinamarca|92|Estrela (Ambicioso)|95",
    "Hans Sama|Steven Liv|ADC|25|França|89|Perfeccionista (Calmo)|88",
    "Labrov|Labros Papoutsakis|SUP|23|Grécia|86|Resiliente|78"
  ],
  lec_koi: [
    "Myrwn|Alex Pastorini|TOP|21|Espanha|83|Agressivo|71",
    "Elyoya|Javier Prades|JNG|24|Espanha|87|Líder NATO|84",
    "Jojopyun|Joseph Joon Pyun|MID|20|Canadá|84|Brincalhão (Química)|80",
    "Supa|David García|ADC|23|Espanha|84|Focado|72",
    "Alvaro|Álvaro Fernández|SUP|21|Espanha|83|Resiliente|71"
  ],
  lec_kc: [
    "Canna|Kim Chang-dong|TOP|24|Coreia do Sul|85|Resiliente|78",
    "Yike|Martin Sundelin|JNG|24|Suécia|86|Resiliente|79",
    "Kyeahoo|Kang Ye-hoo|MID|20|Coreia do Sul|81|Focado|64",
    "Caliste|Caliste Henry-Hennebert|ADC|18|França|84|Estrela (Ambicioso)|82",
    "Busio|Alan Cwalina|SUP|21|EUA|82|Resiliente|71"
  ],
  lec_fnc: [
    "Empyros||TOP|21|Grécia|81|Resiliente|62",
    "Razork|Iván Martín|JNG|24|Espanha|88|Líder NATO|85",
    "Vladi|Vladimiros Kourtidis|MID|19|Grécia|82|Focado|68",
    "Upset|Elias Lipp|ADC|25|Alemanha|86|Perfeccionista (Calmo)|82",
    "Lospa||SUP|21|França|81|Focado|61"
  ],
  lec_vit: [
    "Naak Nako||TOP|21|Turquia|81|Agressivo|63",
    "Lyncas||JNG|21|Lituânia|82|Resiliente|66",
    "Humanoid|Marek Brázda|MID|24|República Tcheca|87|Resiliente|81",
    "Carzzy|Matyáš Orság|ADC|22|República Tcheca|86|Brincalhão (Química)|82",
    "Fleshy||SUP|21|Bulgária|81|Focado|62"
  ],
  lec_th: [
    "Tracyn||TOP|21|Polônia|80|Resiliente|58",
    "Sheo||JNG|22|França|82|Resiliente|68",
    "Serin||MID|23|Turquia|82|Focado|65",
    "Ice||ADC|22|Coreia do Sul|83|Focado|70",
    "Way||SUP|21|Suécia|80|Resiliente|59"
  ],
  lec_gx: [
    "Lot||TOP|21|Ucrânia|81|Focado|60",
    "ISMA||JNG|22|França|81|Resiliente|62",
    "Jackies||MID|19|República Tcheca|83|Focado|67",
    "Noah||ADC|22|Coreia do Sul|83|Perfeccionista (Calmo)|71",
    "Jun||SUP|23|Coreia do Sul|83|Resiliente|70"
  ],
  lec_sh: [
    "Rooster||TOP|21|Espanha|80|Focado|55",
    "Boukada||JNG|22|França|80|Resiliente|57",
    "nuc||MID|23|França|83|Focado|71",
    "Paduck||ADC|21|Polônia|80|Tímido (Focado)|58",
    "Trymbi||SUP|24|Polônia|83|Líder NATO|74"
  ],
  lec_navi: [
    "Maynter||TOP|21|Sérvia|80|Focado|54",
    "Rhilech||JNG|21|Reino Unido|80|Resiliente|55",
    "Poby||MID|19|Coreia do Sul|80|Tímido (Focado)|60",
    "SamD||ADC|23|Coreia do Sul|81|Focado|62",
    "Parus||SUP|21|Bulgária|81|Focado|61"
  ],
  lec_sk: [
    "Wunder|Martin Hansen|TOP|26|Dinamarca|84|Resiliente|78",
    "Skeanz||JNG|23|França|81|Resiliente|63",
    "LIDER||MID|24|Noruega|82|Agressivo|68",
    "Jopa||ADC|21|Sérvia|81|Focado|61",
    "Mikyx|Mihael Mehle|SUP|26|Eslovênia|85|Líder NATO|82"
  ],

  // LPL
  lpl_blg: [
    "Bin|Chen Zebin|TOP|23|China|94|Líder NATO|95",
    "Xun|Peng Zhao-Jun|JNG|23|China|90|Agressivo|88",
    "knight|Zhuo Ding|MID|24|China|94|Focado|93",
    "Viper|Park Do-hyeon|ADC|25|Coreia do Sul|93|Perfeccionista (Calmo)|93",
    "ON|Luo Wen-Jun|SUP|21|China|89|Brincalhão (Química)|86"
  ],
  lpl_tes: [
    "ZUIAN||TOP|20|China|82|Focado|61",
    "Tian|Gao Tian-Liang|JNG|24|China|89|Resiliente|85",
    "Creme|Lin Jian|MID|21|China|88|Focado|82",
    "JackeyLove|Yu Wen-Bo|ADC|24|China|92|Estrela (Ambicioso)|94",
    "fengyue||SUP|19|China|81|Tímido (Focado)|60"
  ],
  lpl_jdg: [
    "Xiaoxu||TOP|21|China|83|Resiliente|67",
    "JunJia||JNG|22|Taiwan|84|Focado|70",
    "HongQ||MID|20|China|81|Tímido (Focado)|62",
    "GALA|Chen Wei|ADC|23|China|91|Perfeccionista (Calmo)|89",
    "Vampire||SUP|21|China|81|Focado|63"
  ],
  lpl_wbg: [
    "Zika|Tang Hua-Yu|TOP|21|China|87|Resiliente|78",
    "Jiejie|Zhao Li-Jie|JNG|24|China|87|Líder NATO|81",
    "Xiaohu|Li Yuan-Hao|MID|27|China|89|Líder NATO|89",
    "Elk|Zhao Jia-Hao|ADC|23|China|91|Perfeccionista (Calmo)|90",
    "Hang|Fu Ming-Hang|SUP|22|China|85|Focado|76"
  ],
  lpl_lng: [
    "sheer||TOP|19|China|82|Focado|65",
    "Croco||JNG|24|Coreia do Sul|84|Resiliente|74",
    "BuLLDoG||MID|21|Coreia do Sul|83|Resiliente|70",
    "1xn||ADC|21|China|83|Focado|68",
    "MISSING|Lou Yun-Feng|SUP|23|China|86|Resiliente|78"
  ],
  lpl_nip: [
    "HOYA||TOP|23|Coreia do Sul|82|Resiliente|68",
    "Guwon||JNG|22|Coreia do Sul|81|Focado|62",
    "Care||MID|21|China|83|Resiliente|70",
    "Assum||ADC|22|China|82|Focado|66",
    "Zhuo||SUP|23|China|82|Resiliente|67"
  ],
  lpl_al: [
    "Flandre|Li Xuan-Jun|TOP|26|China|84|Líder NATO|79",
    "Tarzan|Lee Seung-yong|JNG|25|Coreia do Sul|87|Focado|81",
    "Shanks||MID|23|China|84|Resiliente|72",
    "Hope||ADC|24|China|84|Focado|73",
    "Kael||SUP|21|Coreia do Sul|84|Resiliente|71"
  ],
  lpl_we: [
    "Cube||TOP|22|China|81|Resiliente|65",
    "Monki||JNG|21|China|81|Focado|60",
    "Karis||MID|22|Coreia do Sul|82|Resiliente|66",
    "About||ADC|21|China|80|Tímido (Focado)|58",
    "Erha||SUP|21|China|80|Focado|57"
  ],
  lpl_ig: [
    "Breath|Chen Bo-Yuan|TOP|24|China|84|Resiliente|78",
    "Wei|Yan Yang-Wei|JNG|24|China|85|Líder NATO|80",
    "Renard||MID|20|China|80|Focado|55",
    "JiaQi||ADC|19|China|80|Tímido (Focado)|54",
    "Meiko|Tian Ye|SUP|26|China|88|Líder NATO|86"
  ],
  lpl_edg: [
    "Zdz||TOP|22|China|82|Resiliente|67",
    "Xiaohao||JNG|22|China|82|Focado|67",
    "Angel||MID|24|China|83|Focado|71",
    "Leave||ADC|21|China|81|Agressivo|64",
    "Jwei||SUP|21|China|81|Focado|61"
  ],
  lpl_omg: [
    "Hery||TOP|21|China|81|Resiliente|62",
    "re0||JNG|20|China|81|Focado|58",
    "haichao||MID|22|China|82|Resiliente|66",
    "Starry||ADC|21|China|81|Agressivo|63",
    "Moham||SUP|21|China|81|Focado|62"
  ],
  lpl_tt: [
    "Keshi||TOP|20|China|80|Focado|52",
    "Junhao||JNG|21|China|80|Resiliente|53",
    "Heru||MID|20|China|80|Focado|51",
    "Ahn||ADC|22|China|81|Agressivo|62",
    "Feather||SUP|21|China|80|Focado|53"
  ],
  lpl_lgd: [
    "Burdol||TOP|21|Coreia do Sul|81|Resiliente|65",
    "Heng||JNG|22|China|81|Focado|63",
    "Tangyuan||MID|20|China|82|Focado|67",
    "Shaoye||ADC|21|China|81|Agressivo|61",
    "Ycx||SUP|21|China|58|Focado|58"
  ],
  lpl_up: [
    "sasi||TOP|20|China|80|Focado|50",
    "climber||JNG|20|China|80|Resiliente|51",
    "Saber||MID|21|China|80|Focado|50",
    "Hena||ADC|23|Coreia do Sul|81|Resiliente|64",
    "Xiaoxia||SUP|21|China|80|Focado|51"
  ],

  // LCS
  lcs_c9: [
    "Thanatos|Park Seung-gyu|TOP|21|Coreia do Sul|84|Resiliente|74",
    "Blaber|Robert Huang|JNG|24|EUA|87|Líder NATO|82",
    "APA|Eain Stearns|MID|22|EUA|84|Brincalhão (Química)|78",
    "Zven|Jesper Svenningsen|ADC|27|Dinamarca|84|Resiliente|80",
    "Vulcan|Philippe Laflamme|SUP|25|Canadá|84|Líder NATO|79"
  ],
  lcs_fly: [
    "Gakgos||TOP|21|Coreia do Sul|81|Resiliente|62",
    "Gryffinn||JNG|20|EUA|82|Focado|68",
    "Quad|Song Su-hyeong|MID|23|Coreia do Sul|85|Perfeccionista (Calmo)|79",
    "Massu|Fahad Abdulmalek|ADC|20|Canadá|83|Focado|72",
    "Cryogen||SUP|20|EUA|80|Focado|58"
  ],
  lcs_tl: [
    "Morgan|Park Gi-tae|TOP|24|Coreia do Sul|84|Resiliente|77",
    "Josedeodo|Brandon Joel Villegas|JNG|24|Argentina|83|Brincalhão (Química)|75",
    "Quid|Lim Hyeon-seung|MID|21|Coreia do Sul|84|Focado|74",
    "Yeon|Sean Yeon|ADC|23|EUA|84|Perfeccionista (Calmo)|77",
    "CoreJJ|Jo Yong-in|SUP|29|Coreia do Sul|86|Líder NATO|85"
  ],
  lcs_sen: [
    "Impact|Jeon Eon-yeong|TOP|29|Coreia do Sul|86|Líder NATO|82",
    "Hambak||JNG|22|Coreia do Sul|81|Focado|64",
    "DARKWINGS||MID|21|Alemanha|80|Resiliente|58",
    "Rahel|Cho Min-seong|ADC|21|Coreia do Sul|82|Focado|69",
    "huhi|Choi Jae-hyun|SUP|29|Coreia do Sul|82|Líder NATO|75"
  ],
  lcs_dig: [
    "Photon|Gyeong Gyu-tae|TOP|23|Coreia do Sul|84|Resiliente|71",
    "eXyu||JNG|22|EUA|81|Resiliente|63",
    "Palafox|Cristian Palafox|MID|25|EUA|82|Focado|71",
    "FBI|Victor Huang|ADC|25|Austrália|83|Resiliente|75",
    "ignar|Lee Dong-geun|SUP|27|Coreia do Sul|82|Resiliente|72"
  ],
  lcs_sr: [
    "Fudge|Ibrahim Allami|TOP|23|Austrália|83|Agressivo|76",
    "Contractz|Juan Arturo Garcia|JNG|25|EUA|82|Resiliente|71",
    "Zinie||MID|20|Coreia do Sul|81|Focado|62",
    "Bvoy|Ju Yeong-hoon|ADC|26|Coreia do Sul|82|Resiliente|71",
    "Ceos|Denilson Oliveira|SUP|24|Brasil|82|Resiliente|71"
  ],
  lcs_lyon: [
    "Dhokla|Niship Doshi|TOP|25|EUA|81|Resiliente|69",
    "Inspired|Kacper Słoma|JNG|23|Polônia|84|Líder NATO|78",
    "Saint||MID|21|EUA|80|Focado|58",
    "Berserker|Kim Min-cheol|ADC|21|Coreia do Sul|84|Perfeccionista (Calmo)|79",
    "Isles|Jonah Rosario|SUP|23|Austrália|80|Focado|61"
  ],
  lcs_dsg: [
    "Castle|Cho Hyeon-seon|TOP|22|Coreia do Sul|81|Focado|64",
    "KryRa||JNG|21|EUA|80|Resiliente|58",
    "Callme|Oh Ji-hoon|MID|21|Coreia do Sul|81|Focado|63",
    "sajed||ADC|20|EUA|80|Tímido (Focado)|55",
    "Lyonz||SUP|21|Canadá|80|Focado|58"
  ],

  // LCP
  lcp_gam: [
    "Kiaya|Trần Duy Sang|TOP|23|Vietnã|84|Resiliente|76",
    "Draktharr|Lê Ngọc Toàn|JNG|22|Vietnã|81|Resiliente|64",
    "Aress|Lương Văn Đạt|MID|21|Vietnã|80|Focado|59",
    "Artemis|Trần Quốc Hưng|ADC|23|Vietnã|82|Agressivo|71",
    "Taki|Đinh Anh Tài|SUP|21|Vietnã|81|Focado|64"
  ],
  lcp_tsw: [
    "Pun||TOP|21|Vietnã|80|Focado|58",
    "Hizto||JNG|21|Vietnã|80|Resiliente|56",
    "Dire||MID|21|Vietnã|80|Focado|55",
    "Eddie||ADC|21|Vietnã|81|Focado|60",
    "Bie||SUP|23|Vietnã|81|Líder NATO|65"
  ],
  lcp_cfo: [
    "Rest|Chiu Chi-Chuan|TOP|24|Taiwan|82|Resiliente|71",
    "Shad0w|Shao Yu-Qun|JNG|23|China|82|Focado|69",
    "Pungyeon||MID|22|Coreia do Sul|81|Resiliente|64",
    "Doggo|Chiu Tzu-Chuan|ADC|21|Taiwan|83|Resiliente|76",
    "2274||SUP|21|Taiwan|80|Focado|57"
  ],
  lcp_shg: [
    "Evi|Shunsuke Murase|TOP|28|Japão|82|Líder NATO|80",
    "Van||JNG|21|Coreia do Sul|80|Resiliente|55",
    "Aria|Lee Ga-eul|MID|24|Coreia do Sul|82|Focado|72",
    "Marble||ADC|21|Japão|81|Focado|62",
    "Vsta|Oh Hyo-seong|SUP|23|Coreia do Sul|81|Resiliente|68"
  ],
  lcp_dfm: [
    "Momo||TOP|21|Japão|80|Focado|54",
    "Citrus||JNG|21|Japão|80|Resiliente|55",
    "Fisher|Yoo Tae-shu|MID|20|Coreia do Sul|81|Resiliente|64",
    "Kakkun||ADC|21|Japão|80|Focado|52",
    "Woody||SUP|21|Taiwan|81|Focado|61"
  ],
  lcp_dcg: [
    "Flauren||TOP|21|Taiwan|80|Focado|56",
    "POP9||JNG|21|Taiwan|80|Resiliente|55",
    "HongSuo||MID|21|Taiwan|80|Focado|55",
    "Feng||ADC|21|Taiwan|81|Focado|60",
    "ShiauC|Liu Chia-Hao|SUP|23|Taiwan|81|Líder NATO|67"
  ],
  lcp_mvk: [
    "Kratos||TOP|21|Vietnã|80|Focado|56",
    "Gury||JNG|21|Vietnã|81|Resiliente|62",
    "Chika||MID|20|Vietnã|80|Focado|55",
    "Harky||ADC|21|Vietnã|81|Focado|59",
    "SiuLoong||SUP|21|Vietnã|81|Resiliente|60"
  ],
  lcp_gz: [
    "1Jiang||TOP|21|Taiwan|81|Resiliente|64",
    "Husha||JNG|22|Taiwan|81|Resiliente|63",
    "JimieN||MID|21|Taiwan|81|Focado|62",
    "Shunn||ADC|21|Taiwan|81|Agressivo|64",
    "Orca||SUP|21|Taiwan|80|Focado|56"
  ]
};

// Map of real rosters for the teams hydrates dynamically
export const REAL_ROSTERS_DB: {
  [teamId: string]: CompactPlayer[];
} = {};

// Parse and Hydrate
Object.entries(COMPACT_TEAMS).forEach(([teamId, players]) => {
  REAL_ROSTERS_DB[teamId] = players.map(p => {
    const [name, realName, position, age, nationality, baseRating, personality, popularity] = p.split('|');
    const pos = position as Position;
    return {
      name,
      realName: realName || name,
      position: pos,
      age: parseInt(age, 10),
      nationality,
      baseRating: parseInt(baseRating, 10),
      personality,
      popularity: parseInt(popularity, 10),
      championPool: getChampsByPos(pos)
    };
  });
});

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

    const marketValue = calcularValorMercado(overall, pot);
    const weeklySalary = calcularSalarioSemanal(marketValue);
    const salary = weeklySalary * 4;

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
      marketValue: Math.max(50000, marketValue),
      salary: Math.max(12000, salary),
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

const fs = require('fs');
const path = require('path');

function initializeGameFiles() {
  const rootDir = process.cwd();
  console.log(`[LegendsHub FS] Inicializando sistema de arquivos na raiz: ${rootDir}`);

  // 1. Criar pasta 'databases' se não existir
  const databasesDir = path.join(rootDir, 'databases');
  if (!fs.existsSync(databasesDir)) {
    fs.mkdirSync(databasesDir, { recursive: true });
    console.log('[LegendsHub FS] Direitório /databases/ criado com sucesso.');
  }

  // 2. Criar ou validar 'Default.db' e 'default.db' (banco original e protegido)
  const defaultData = {
    version: "1.0.0",
    description: "Banco de dados oficial protegido do LegendsHub Manager.",
    lastModified: Date.now(),
    teams: {
      "CBLOL": [
        { id: "pain-gaming", name: "paiN Gaming", acronym: "PNG", popularity: "ALTA", budget: 3500000, primaryColor: "#000000", secondaryColor: "#FF0000", logoUrl: "" },
        { id: "loud-gaming", name: "LOUD", acronym: "LLL", popularity: "ALTA", budget: 3600000, primaryColor: "#00FF00", secondaryColor: "#000000", logoUrl: "" },
        { id: "vivo-keyd-stars", name: "Vivo Keyd Stars", acronym: "VKS", popularity: "MEDIA", budget: 2800000, primaryColor: "#0000FF", secondaryColor: "#FFFFFF", logoUrl: "" },
        { id: "red-canids", name: "RED Canids", acronym: "RED", popularity: "MEDIA", budget: 2500000, primaryColor: "#FF0000", secondaryColor: "#333333", logoUrl: "" },
        { id: "furia-esports", name: "FURIA", acronym: "FUR", popularity: "MEDIA", budget: 2600000, primaryColor: "#FFFFFF", secondaryColor: "#000000", logoUrl: "" },
        { id: "fluxo-w7m", name: "Fluxo Esports", acronym: "FLX", popularity: "BAIXA", budget: 1800000, primaryColor: "#5B21B6", secondaryColor: "#111827", logoUrl: "" }
      ],
      "LCK": [
        { id: "lck_t1", name: "T1", acronym: "T1", popularity: "ALTA", budget: 8500000, primaryColor: "#E50914", secondaryColor: "#222222", logoUrl: "" },
        { id: "lck_geng", name: "Gen.G", acronym: "GEN", popularity: "ALTA", budget: 8800000, primaryColor: "#D4AF37", secondaryColor: "#111111", logoUrl: "" },
        { id: "lck_dplus", name: "Dplus KIA", acronym: "DK", popularity: "MEDIA", budget: 6200000, primaryColor: "#000000", secondaryColor: "#00E5FF", logoUrl: "" }
      ]
    },
    champions: [
      { id: "aatrox", name: "Aatrox", tier: "A", power: 85, roles: ["TOP"], buffStatus: "NORMAL" },
      { id: "ahri", name: "Ahri", tier: "S+", power: 96, roles: ["MID"], buffStatus: "BUFFED" },
      { id: "azir", name: "Azir", tier: "S", power: 91, roles: ["MID"], buffStatus: "NORMAL" },
      { id: "jinx", name: "Jinx", tier: "A", power: 84, roles: ["ADC"], buffStatus: "NORMAL" },
      { id: "keria", name: "Keria", tier: "S+", power: 95, roles: ["SUP"], buffStatus: "NORMAL" }
    ],
    sponsors: [
      { id: "spon_intel", name: "Intel Gaming", incomePerWeek: 154000, termsInWeeks: 12, minPopularity: 60, logoUrl: "" },
      { id: "spon_coca", name: "Coca-Cola Essentials", incomePerWeek: 210000, termsInWeeks: 8, minPopularity: 75, logoUrl: "" },
      { id: "spon_redbull", name: "Red Bull Energy", incomePerWeek: 180500, termsInWeeks: 16, minPopularity: 65, logoUrl: "" },
      { id: "spon_razer", name: "Razer Equipment", incomePerWeek: 132000, termsInWeeks: 24, minPopularity: 50, logoUrl: "" },
      { id: "spon_bmw", name: "BMW Esports", incomePerWeek: 310000, termsInWeeks: 16, minPopularity: 80, logoUrl: "" }
    ]
  };

  const dbDataString = JSON.stringify(defaultData, null, 2);

  // Criar default.db (Minúsculo)
  const defaultDbFileLower = path.join(databasesDir, 'default.db');
  if (!fs.existsSync(defaultDbFileLower)) {
    fs.writeFileSync(defaultDbFileLower, dbDataString, 'utf-8');
    console.log('[LegendsHub FS] Banco oficial /databases/default.db inicializado.');
  }

  // 3. Criar diretório 'game' e subpastas de assets conforme a nova estrutura
  const gameDir = path.join(rootDir, 'game');
  if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir, { recursive: true });
    console.log('[LegendsHub FS] Direitório /game/ criado.');
  }

  const assetsDir = path.join(gameDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('[LegendsHub FS] Direitório /game/assets/ criado.');
  }

  const assetCategories = [
    'leagues',
    'teams',
    'players',
    'managers',
    'sponsors',
    'press',
    'influencers',
    'champions',
    'ui'
  ];

  // Mapeamentos para preencher os arquivos ID -> Nome em formato [ID=Nome]
  const defaultIndexes = {
    players: [
      "faker=Lee 'Faker' Sang-hyuk",
      "keria=Ryu 'Keria' Min-seok",
      "oner=Mun 'Oner' Hyeon-jun",
      "doran=Choi 'Doran' Hyeon-joon",
      "peyz=Kim 'Peyz' Su-hwan",
      "cariok=Marcos 'Cariok' Oliveira",
      "tinowns=Thiago 'Tinowns' Sartori",
      "robo=Leonardo 'Robo' Souza",
      "brtt=Felipe 'brTT' Gonçalves",
      "wizer=Choi 'Wizer' Ui-seok",
      "ceo=Matías 'Ceo' Arrua",
      "mireu=Jeong 'Mireu' Jo-bin"
    ],
    teams: [
      "pain-gaming=paiN Gaming",
      "loud-gaming=LOUD",
      "vivo-keyd-stars=Vivo Keyd Stars",
      "red-canids=RED Canids Kalunga",
      "furia-esports=FURIA",
      "fluxo-w7m=Fluxo Esports",
      "lck_t1=T1",
      "lck_geng=Gen.G Esports",
      "lck_dplus=Dplus KIA"
    ],
    managers: [
      "head_coach=Felipe Maestro",
      "analyst=Abelardo Abe",
      "scout=Dmitry Djoko",
      "psychologist=Alessandra Psico",
      "physio=Gustavo Fisio"
    ],
    leagues: [
      "cblol=CBLOL (Brasil)",
      "lck=LCK (Coreia)",
      "lpl=LPL (China)",
      "lec=LEC (EMEA)",
      "lcs=LCS (América do Norte)",
      "lcp=LCP (Pacífico)"
    ],
    sponsors: [
      "spon_intel=Intel Gaming",
      "spon_coca=Coca-Cola Essentials",
      "spon_redbull=Red Bull Energy",
      "spon_razer=Razer Equipment",
      "spon_bmw=BMW Esports"
    ],
    press: [
      "press_mais=MAIS ESPORTS",
      "press_espn=ESPN Esports",
      "press_ilha=Ilha das Lendas",
      "press_ge=GE Esports",
      "press_cblol=CBLOL News"
    ],
    influencers: [
      "inf_brtt=FelipeBrtt",
      "inf_muca=Muca Esports",
      "inf_analyst=esports Analyst",
      "inf_baiano=Baiano",
      "inf_casimiro=Casimiro",
      "inf_revolta=Revolta"
    ],
    champions: [
      "aatrox=Aatrox",
      "ahri=Ahri",
      "azir=Azir",
      "jinx=Jinx",
      "keria=Keria"
    ]
  };

  // Mapeamento de categoria -> arquivo indexador correspondente (conforme especificação)
  const indexerFilesConfig = {
    leagues: 'league.txt',
    teams: 'teams.txt',
    players: 'players.txt',
    managers: 'managers.txt',
    sponsors: 'sponsors.txt',
    press: 'press.txt',
    influencers: 'influencers.txt',
    champions: 'champions.txt'
  };

  assetCategories.forEach(category => {
    const categoryDir = path.join(assetsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
      console.log(`[LegendsHub FS] Subpasta /game/assets/${category}/ criada.`);
    }

    const indexerFilename = indexerFilesConfig[category];
    if (indexerFilename) {
      const indexerFile = path.join(categoryDir, indexerFilename);
      if (!fs.existsSync(indexerFile)) {
        const defaultContent = (defaultIndexes[category] || []).join('\n');
        fs.writeFileSync(indexerFile, defaultContent, 'utf-8');
        console.log(`[LegendsHub FS] Indexador /game/assets/${category}/${indexerFilename} criado.`);
      }
    }
  });

  // Criar logo oficial em /game/assets/ui/logo-lh.png
  const uiDir = path.join(assetsDir, 'ui');
  const logoLhFile = path.join(uiDir, 'logo-lh.png');
  if (!fs.existsSync(logoLhFile)) {
    fs.writeFileSync(logoLhFile, 'LegendsHub UI Brand Logo Asset Placeholder', 'utf-8');
    console.log('[LegendsHub FS] Placeholder de logo-lh.png criado em /game/assets/ui/.');
  }

  console.log('[LegendsHub FS] Estrutura de arquivos inicializada com sucesso.');
}

module.exports = { initializeGameFiles };

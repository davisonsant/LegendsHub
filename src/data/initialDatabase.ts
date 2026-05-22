/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Champion, Sponsor, Staff, Team, Position, PlayerAttributes, InterviewQuestion } from '../types';

export const CHAMPIONS_LIST: Champion[] = [
  {
    "id": "aatrox",
    "name": "Aatrox",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "azir",
      "gangplank"
    ],
    "synergies": [
      "cho_gath",
      "kassadin"
    ],
    "imageSeed": 1
  },
  {
    "id": "ahri",
    "name": "Ahri",
    "roles": [
      "MID"
    ],
    "tier": "S+",
    "power": 96,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "bard",
      "garen"
    ],
    "synergies": [
      "corki",
      "katarina"
    ],
    "imageSeed": 2
  },
  {
    "id": "akali",
    "name": "Akali",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "bel_veth",
      "gnar"
    ],
    "synergies": [
      "darius",
      "kayle"
    ],
    "imageSeed": 3
  },
  {
    "id": "akshan",
    "name": "Akshan",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "blitzcrank",
      "gragas"
    ],
    "synergies": [
      "diana",
      "kayn"
    ],
    "imageSeed": 4
  },
  {
    "id": "alistar",
    "name": "Alistar",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "brand",
      "graves"
    ],
    "synergies": [
      "dr__mundo",
      "kennen"
    ],
    "imageSeed": 5
  },
  {
    "id": "ambessa",
    "name": "Ambessa",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "braum",
      "gwen"
    ],
    "synergies": [
      "draven",
      "kha_zix"
    ],
    "imageSeed": 6
  },
  {
    "id": "amumu",
    "name": "Amumu",
    "roles": [
      "JNG",
      "SUP"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "briar",
      "hecarim"
    ],
    "synergies": [
      "ekko",
      "kindred"
    ],
    "imageSeed": 7
  },
  {
    "id": "anivia",
    "name": "Anivia",
    "roles": [
      "MID"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "caitlyn",
      "heimerdinger"
    ],
    "synergies": [
      "elise",
      "kled"
    ],
    "imageSeed": 8
  },
  {
    "id": "annie",
    "name": "Annie",
    "roles": [
      "MID"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "camille",
      "hwei"
    ],
    "synergies": [
      "evelynn",
      "kog_maw"
    ],
    "imageSeed": 9
  },
  {
    "id": "aphelios",
    "name": "Aphelios",
    "roles": [
      "ADC"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "cassiopeia",
      "illaoi"
    ],
    "synergies": [
      "ezreal",
      "k_sante"
    ],
    "imageSeed": 10
  },
  {
    "id": "ashe",
    "name": "Ashe",
    "roles": [
      "ADC",
      "SUP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "cho_gath",
      "irelia"
    ],
    "synergies": [
      "fiddlesticks",
      "leblanc"
    ],
    "imageSeed": 11
  },
  {
    "id": "aurelion_sol",
    "name": "Aurelion Sol",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "corki",
      "ivern"
    ],
    "synergies": [
      "fiora",
      "lee_sin"
    ],
    "imageSeed": 12
  },
  {
    "id": "aurora",
    "name": "Aurora",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "darius",
      "janna"
    ],
    "synergies": [
      "fizz",
      "leona"
    ],
    "imageSeed": 13
  },
  {
    "id": "azir",
    "name": "Azir",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "diana",
      "jarvan_iv"
    ],
    "synergies": [
      "galio",
      "lillia"
    ],
    "imageSeed": 14
  },
  {
    "id": "bard",
    "name": "Bard (Bardo)",
    "roles": [
      "SUP"
    ],
    "tier": "C",
    "power": 75,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "dr__mundo",
      "jax"
    ],
    "synergies": [
      "gangplank",
      "lissandra"
    ],
    "imageSeed": 15
  },
  {
    "id": "bel_veth",
    "name": "Bel'Veth",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "draven",
      "jayce"
    ],
    "synergies": [
      "garen",
      "lucian"
    ],
    "imageSeed": 16
  },
  {
    "id": "blitzcrank",
    "name": "Blitzcrank",
    "roles": [
      "SUP"
    ],
    "tier": "C",
    "power": 79,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "ekko",
      "jhin"
    ],
    "synergies": [
      "gnar",
      "lulu"
    ],
    "imageSeed": 17
  },
  {
    "id": "brand",
    "name": "Brand",
    "roles": [
      "JNG",
      "MID",
      "SUP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "elise",
      "jinx"
    ],
    "synergies": [
      "gragas",
      "lux"
    ],
    "imageSeed": 18
  },
  {
    "id": "braum",
    "name": "Braum",
    "roles": [
      "SUP"
    ],
    "tier": "C",
    "power": 74,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "evelynn",
      "kai_sa"
    ],
    "synergies": [
      "graves",
      "malphite"
    ],
    "imageSeed": 19
  },
  {
    "id": "briar",
    "name": "Briar",
    "roles": [
      "JNG"
    ],
    "tier": "C",
    "power": 76,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "ezreal",
      "kalista"
    ],
    "synergies": [
      "gwen",
      "malzahar"
    ],
    "imageSeed": 20
  },
  {
    "id": "caitlyn",
    "name": "Caitlyn",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "fiddlesticks",
      "karma"
    ],
    "synergies": [
      "hecarim",
      "maokai"
    ],
    "imageSeed": 21
  },
  {
    "id": "camille",
    "name": "Camille",
    "roles": [
      "TOP",
      "SUP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "fiora",
      "karthus"
    ],
    "synergies": [
      "heimerdinger",
      "master_yi"
    ],
    "imageSeed": 22
  },
  {
    "id": "cassiopeia",
    "name": "Cassiopeia",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "fizz",
      "kassadin"
    ],
    "synergies": [
      "hwei",
      "mel"
    ],
    "imageSeed": 23
  },
  {
    "id": "cho_gath",
    "name": "Cho'Gath",
    "roles": [
      "TOP",
      "MID"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "galio",
      "katarina"
    ],
    "synergies": [
      "illaoi",
      "milio"
    ],
    "imageSeed": 24
  },
  {
    "id": "corki",
    "name": "Corki",
    "roles": [
      "MID",
      "ADC"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "gangplank",
      "kayle"
    ],
    "synergies": [
      "irelia",
      "miss_fortune"
    ],
    "imageSeed": 25
  },
  {
    "id": "darius",
    "name": "Darius",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 94,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "garen",
      "kayn"
    ],
    "synergies": [
      "ivern",
      "mordekaiser"
    ],
    "imageSeed": 26
  },
  {
    "id": "diana",
    "name": "Diana",
    "roles": [
      "JNG",
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "gnar",
      "kennen"
    ],
    "synergies": [
      "janna",
      "morgana"
    ],
    "imageSeed": 27
  },
  {
    "id": "dr__mundo",
    "name": "Dr. Mundo",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "C",
    "power": 74,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "gragas",
      "kha_zix"
    ],
    "synergies": [
      "jarvan_iv",
      "naafiri"
    ],
    "imageSeed": 28
  },
  {
    "id": "draven",
    "name": "Draven",
    "roles": [
      "ADC"
    ],
    "tier": "C",
    "power": 75,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "graves",
      "kindred"
    ],
    "synergies": [
      "jax",
      "nami"
    ],
    "imageSeed": 29
  },
  {
    "id": "ekko",
    "name": "Ekko",
    "roles": [
      "JNG",
      "MID"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "gwen",
      "kled"
    ],
    "synergies": [
      "jayce",
      "nasus"
    ],
    "imageSeed": 30
  },
  {
    "id": "elise",
    "name": "Elise",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "hecarim",
      "kog_maw"
    ],
    "synergies": [
      "jhin",
      "nautilus"
    ],
    "imageSeed": 31
  },
  {
    "id": "evelynn",
    "name": "Evelynn",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "heimerdinger",
      "k_sante"
    ],
    "synergies": [
      "jinx",
      "neeko"
    ],
    "imageSeed": 32
  },
  {
    "id": "ezreal",
    "name": "Ezreal",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "hwei",
      "leblanc"
    ],
    "synergies": [
      "kai_sa",
      "nidalee"
    ],
    "imageSeed": 33
  },
  {
    "id": "fiddlesticks",
    "name": "Fiddlesticks",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "illaoi",
      "lee_sin"
    ],
    "synergies": [
      "kalista",
      "nilah"
    ],
    "imageSeed": 34
  },
  {
    "id": "fiora",
    "name": "Fiora",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "irelia",
      "leona"
    ],
    "synergies": [
      "karma",
      "nocturne"
    ],
    "imageSeed": 35
  },
  {
    "id": "fizz",
    "name": "Fizz",
    "roles": [
      "MID"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "ivern",
      "lillia"
    ],
    "synergies": [
      "karthus",
      "nunu_willump"
    ],
    "imageSeed": 36
  },
  {
    "id": "galio",
    "name": "Galio",
    "roles": [
      "MID",
      "SUP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "janna",
      "lissandra"
    ],
    "synergies": [
      "kassadin",
      "olaf"
    ],
    "imageSeed": 37
  },
  {
    "id": "gangplank",
    "name": "Gangplank",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 95,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "jarvan_iv",
      "lucian"
    ],
    "synergies": [
      "katarina",
      "orianna"
    ],
    "imageSeed": 38
  },
  {
    "id": "garen",
    "name": "Garen",
    "roles": [
      "TOP"
    ],
    "tier": "S",
    "power": 90,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "jax",
      "lulu"
    ],
    "synergies": [
      "kayle",
      "ornn"
    ],
    "imageSeed": 39
  },
  {
    "id": "gnar",
    "name": "Gnar",
    "roles": [
      "TOP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "jayce",
      "lux"
    ],
    "synergies": [
      "kayn",
      "pantheon"
    ],
    "imageSeed": 40
  },
  {
    "id": "gragas",
    "name": "Gragas",
    "roles": [
      "TOP",
      "JNG",
      "MID"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "jhin",
      "malphite"
    ],
    "synergies": [
      "kennen",
      "poppy"
    ],
    "imageSeed": 41
  },
  {
    "id": "graves",
    "name": "Graves",
    "roles": [
      "JNG"
    ],
    "tier": "C",
    "power": 79,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "jinx",
      "malzahar"
    ],
    "synergies": [
      "kha_zix",
      "pyke"
    ],
    "imageSeed": 42
  },
  {
    "id": "gwen",
    "name": "Gwen",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "kai_sa",
      "maokai"
    ],
    "synergies": [
      "kindred",
      "qiyana"
    ],
    "imageSeed": 43
  },
  {
    "id": "hecarim",
    "name": "Hecarim",
    "roles": [
      "JNG"
    ],
    "tier": "C",
    "power": 77,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "kalista",
      "master_yi"
    ],
    "synergies": [
      "kled",
      "quinn"
    ],
    "imageSeed": 44
  },
  {
    "id": "heimerdinger",
    "name": "Heimerdinger",
    "roles": [
      "TOP",
      "SUP",
      "MID"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "karma",
      "mel"
    ],
    "synergies": [
      "kog_maw",
      "rakan"
    ],
    "imageSeed": 45
  },
  {
    "id": "hwei",
    "name": "Hwei",
    "roles": [
      "MID",
      "SUP"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "karthus",
      "milio"
    ],
    "synergies": [
      "k_sante",
      "rammus"
    ],
    "imageSeed": 46
  },
  {
    "id": "illaoi",
    "name": "Illaoi",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "kassadin",
      "miss_fortune"
    ],
    "synergies": [
      "leblanc",
      "rek_sai"
    ],
    "imageSeed": 47
  },
  {
    "id": "irelia",
    "name": "Irelia",
    "roles": [
      "TOP",
      "MID"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "katarina",
      "mordekaiser"
    ],
    "synergies": [
      "lee_sin",
      "rell"
    ],
    "imageSeed": 48
  },
  {
    "id": "ivern",
    "name": "Ivern",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "kayle",
      "morgana"
    ],
    "synergies": [
      "leona",
      "renata_glasc"
    ],
    "imageSeed": 49
  },
  {
    "id": "janna",
    "name": "Janna",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "kayn",
      "naafiri"
    ],
    "synergies": [
      "lillia",
      "renekton"
    ],
    "imageSeed": 50
  },
  {
    "id": "jarvan_iv",
    "name": "Jarvan IV",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "kennen",
      "nami"
    ],
    "synergies": [
      "lissandra",
      "rengar"
    ],
    "imageSeed": 51
  },
  {
    "id": "jax",
    "name": "Jax",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "kha_zix",
      "nasus"
    ],
    "synergies": [
      "lucian",
      "riven"
    ],
    "imageSeed": 52
  },
  {
    "id": "jayce",
    "name": "Jayce",
    "roles": [
      "TOP",
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "kindred",
      "nautilus"
    ],
    "synergies": [
      "lulu",
      "rumble"
    ],
    "imageSeed": 53
  },
  {
    "id": "jhin",
    "name": "Jhin",
    "roles": [
      "ADC"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "kled",
      "neeko"
    ],
    "synergies": [
      "lux",
      "ryze"
    ],
    "imageSeed": 54
  },
  {
    "id": "jinx",
    "name": "Jinx",
    "roles": [
      "ADC"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "kog_maw",
      "nidalee"
    ],
    "synergies": [
      "malphite",
      "samira"
    ],
    "imageSeed": 55
  },
  {
    "id": "kai_sa",
    "name": "Kai'Sa",
    "roles": [
      "ADC"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "k_sante",
      "nilah"
    ],
    "synergies": [
      "malzahar",
      "sejuani"
    ],
    "imageSeed": 56
  },
  {
    "id": "kalista",
    "name": "Kalista",
    "roles": [
      "ADC"
    ],
    "tier": "S",
    "power": 90,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "leblanc",
      "nocturne"
    ],
    "synergies": [
      "maokai",
      "senna"
    ],
    "imageSeed": 57
  },
  {
    "id": "karma",
    "name": "Karma",
    "roles": [
      "SUP",
      "MID"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "lee_sin",
      "nunu_willump"
    ],
    "synergies": [
      "master_yi",
      "seraphine"
    ],
    "imageSeed": 58
  },
  {
    "id": "karthus",
    "name": "Karthus",
    "roles": [
      "JNG",
      "ADC"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "leona",
      "olaf"
    ],
    "synergies": [
      "mel",
      "sett"
    ],
    "imageSeed": 59
  },
  {
    "id": "kassadin",
    "name": "Kassadin",
    "roles": [
      "MID"
    ],
    "tier": "C",
    "power": 79,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "lillia",
      "orianna"
    ],
    "synergies": [
      "milio",
      "shaco"
    ],
    "imageSeed": 60
  },
  {
    "id": "katarina",
    "name": "Katarina",
    "roles": [
      "MID"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "lissandra",
      "ornn"
    ],
    "synergies": [
      "miss_fortune",
      "shen"
    ],
    "imageSeed": 61
  },
  {
    "id": "kayle",
    "name": "Kayle",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 94,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "lucian",
      "pantheon"
    ],
    "synergies": [
      "mordekaiser",
      "shyvana"
    ],
    "imageSeed": 62
  },
  {
    "id": "kayn",
    "name": "Kayn",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "lulu",
      "poppy"
    ],
    "synergies": [
      "morgana",
      "singed"
    ],
    "imageSeed": 63
  },
  {
    "id": "kennen",
    "name": "Kennen",
    "roles": [
      "TOP"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "lux",
      "pyke"
    ],
    "synergies": [
      "naafiri",
      "sion"
    ],
    "imageSeed": 64
  },
  {
    "id": "kha_zix",
    "name": "Kha'Zix",
    "roles": [
      "JNG"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "malphite",
      "qiyana"
    ],
    "synergies": [
      "nami",
      "sivir"
    ],
    "imageSeed": 65
  },
  {
    "id": "kindred",
    "name": "Kindred",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "malzahar",
      "quinn"
    ],
    "synergies": [
      "nasus",
      "skarner"
    ],
    "imageSeed": 66
  },
  {
    "id": "kled",
    "name": "Kled",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "maokai",
      "rakan"
    ],
    "synergies": [
      "nautilus",
      "smolder"
    ],
    "imageSeed": 67
  },
  {
    "id": "kog_maw",
    "name": "Kog'Maw",
    "roles": [
      "ADC"
    ],
    "tier": "C",
    "power": 77,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "master_yi",
      "rammus"
    ],
    "synergies": [
      "neeko",
      "sona"
    ],
    "imageSeed": 68
  },
  {
    "id": "k_sante",
    "name": "K'Sante",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "mel",
      "rek_sai"
    ],
    "synergies": [
      "nidalee",
      "soraka"
    ],
    "imageSeed": 69
  },
  {
    "id": "leblanc",
    "name": "LeBlanc",
    "roles": [
      "MID"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "milio",
      "rell"
    ],
    "synergies": [
      "nilah",
      "swain"
    ],
    "imageSeed": 70
  },
  {
    "id": "lee_sin",
    "name": "Lee Sin",
    "roles": [
      "JNG"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "miss_fortune",
      "renata_glasc"
    ],
    "synergies": [
      "nocturne",
      "sylas"
    ],
    "imageSeed": 71
  },
  {
    "id": "leona",
    "name": "Leona",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "mordekaiser",
      "renekton"
    ],
    "synergies": [
      "nunu_willump",
      "syndra"
    ],
    "imageSeed": 72
  },
  {
    "id": "lillia",
    "name": "Lillia",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "morgana",
      "rengar"
    ],
    "synergies": [
      "olaf",
      "tahm_kench"
    ],
    "imageSeed": 73
  },
  {
    "id": "lissandra",
    "name": "Lissandra",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "naafiri",
      "riven"
    ],
    "synergies": [
      "orianna",
      "taliyah"
    ],
    "imageSeed": 74
  },
  {
    "id": "lucian",
    "name": "Lucian",
    "roles": [
      "ADC",
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "nami",
      "rumble"
    ],
    "synergies": [
      "ornn",
      "talon"
    ],
    "imageSeed": 75
  },
  {
    "id": "lulu",
    "name": "Lulu",
    "roles": [
      "SUP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "nasus",
      "ryze"
    ],
    "synergies": [
      "pantheon",
      "taric"
    ],
    "imageSeed": 76
  },
  {
    "id": "lux",
    "name": "Lux",
    "roles": [
      "MID",
      "SUP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "nautilus",
      "samira"
    ],
    "synergies": [
      "poppy",
      "teemo"
    ],
    "imageSeed": 77
  },
  {
    "id": "malphite",
    "name": "Malphite",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 96,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "neeko",
      "sejuani"
    ],
    "synergies": [
      "pyke",
      "thresh"
    ],
    "imageSeed": 78
  },
  {
    "id": "malzahar",
    "name": "Malzahar",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "nidalee",
      "senna"
    ],
    "synergies": [
      "qiyana",
      "tristana"
    ],
    "imageSeed": 79
  },
  {
    "id": "maokai",
    "name": "Maokai",
    "roles": [
      "SUP",
      "JNG",
      "TOP"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "nilah",
      "seraphine"
    ],
    "synergies": [
      "quinn",
      "trundle"
    ],
    "imageSeed": 80
  },
  {
    "id": "master_yi",
    "name": "Master Yi",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "nocturne",
      "sett"
    ],
    "synergies": [
      "rakan",
      "tryndamere"
    ],
    "imageSeed": 81
  },
  {
    "id": "mel",
    "name": "Mel",
    "roles": [
      "MID"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "nunu_willump",
      "shaco"
    ],
    "synergies": [
      "rammus",
      "twisted_fate"
    ],
    "imageSeed": 82
  },
  {
    "id": "milio",
    "name": "Milio",
    "roles": [
      "SUP"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "olaf",
      "shen"
    ],
    "synergies": [
      "rek_sai",
      "twitch"
    ],
    "imageSeed": 83
  },
  {
    "id": "miss_fortune",
    "name": "Miss Fortune",
    "roles": [
      "ADC"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "orianna",
      "shyvana"
    ],
    "synergies": [
      "rell",
      "udyr"
    ],
    "imageSeed": 84
  },
  {
    "id": "mordekaiser",
    "name": "Mordekaiser",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "C",
    "power": 75,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "ornn",
      "singed"
    ],
    "synergies": [
      "renata_glasc",
      "urgot"
    ],
    "imageSeed": 85
  },
  {
    "id": "morgana",
    "name": "Morgana",
    "roles": [
      "SUP",
      "JNG"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "pantheon",
      "sion"
    ],
    "synergies": [
      "renekton",
      "varus"
    ],
    "imageSeed": 86
  },
  {
    "id": "naafiri",
    "name": "Naafiri",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "poppy",
      "sivir"
    ],
    "synergies": [
      "rengar",
      "vayne"
    ],
    "imageSeed": 87
  },
  {
    "id": "nami",
    "name": "Nami",
    "roles": [
      "SUP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "pyke",
      "skarner"
    ],
    "synergies": [
      "riven",
      "veigar"
    ],
    "imageSeed": 88
  },
  {
    "id": "nasus",
    "name": "Nasus",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "qiyana",
      "smolder"
    ],
    "synergies": [
      "rumble",
      "vel_koz"
    ],
    "imageSeed": 89
  },
  {
    "id": "nautilus",
    "name": "Nautilus",
    "roles": [
      "SUP"
    ],
    "tier": "S+",
    "power": 96,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "quinn",
      "sona"
    ],
    "synergies": [
      "ryze",
      "vex"
    ],
    "imageSeed": 90
  },
  {
    "id": "neeko",
    "name": "Neeko",
    "roles": [
      "MID",
      "SUP"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "rakan",
      "soraka"
    ],
    "synergies": [
      "samira",
      "vi"
    ],
    "imageSeed": 91
  },
  {
    "id": "nidalee",
    "name": "Nidalee",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "rammus",
      "swain"
    ],
    "synergies": [
      "sejuani",
      "viego"
    ],
    "imageSeed": 92
  },
  {
    "id": "nilah",
    "name": "Nilah",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "rek_sai",
      "sylas"
    ],
    "synergies": [
      "senna",
      "viktor"
    ],
    "imageSeed": 93
  },
  {
    "id": "nocturne",
    "name": "Nocturne",
    "roles": [
      "JNG"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "rell",
      "syndra"
    ],
    "synergies": [
      "seraphine",
      "vladimir"
    ],
    "imageSeed": 94
  },
  {
    "id": "nunu_willump",
    "name": "Nunu e Willump",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "renata_glasc",
      "tahm_kench"
    ],
    "synergies": [
      "sett",
      "volibear"
    ],
    "imageSeed": 95
  },
  {
    "id": "olaf",
    "name": "Olaf",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "renekton",
      "taliyah"
    ],
    "synergies": [
      "shaco",
      "warwick"
    ],
    "imageSeed": 96
  },
  {
    "id": "orianna",
    "name": "Orianna",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "rengar",
      "talon"
    ],
    "synergies": [
      "shen",
      "wukong"
    ],
    "imageSeed": 97
  },
  {
    "id": "ornn",
    "name": "Ornn",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "riven",
      "taric"
    ],
    "synergies": [
      "shyvana",
      "xayah"
    ],
    "imageSeed": 98
  },
  {
    "id": "pantheon",
    "name": "Pantheon",
    "roles": [
      "TOP",
      "MID",
      "SUP"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "rumble",
      "teemo"
    ],
    "synergies": [
      "singed",
      "xerath"
    ],
    "imageSeed": 99
  },
  {
    "id": "poppy",
    "name": "Poppy",
    "roles": [
      "TOP",
      "JNG",
      "SUP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "ryze",
      "thresh"
    ],
    "synergies": [
      "sion",
      "xin_zhao"
    ],
    "imageSeed": 100
  },
  {
    "id": "pyke",
    "name": "Pyke",
    "roles": [
      "SUP",
      "MID"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "samira",
      "tristana"
    ],
    "synergies": [
      "sivir",
      "yasuo"
    ],
    "imageSeed": 101
  },
  {
    "id": "qiyana",
    "name": "Qiyana",
    "roles": [
      "MID"
    ],
    "tier": "S+",
    "power": 94,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "sejuani",
      "trundle"
    ],
    "synergies": [
      "skarner",
      "yone"
    ],
    "imageSeed": 102
  },
  {
    "id": "quinn",
    "name": "Quinn",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "senna",
      "tryndamere"
    ],
    "synergies": [
      "smolder",
      "yorick"
    ],
    "imageSeed": 103
  },
  {
    "id": "rakan",
    "name": "Rakan",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "seraphine",
      "twisted_fate"
    ],
    "synergies": [
      "sona",
      "yuumi"
    ],
    "imageSeed": 104
  },
  {
    "id": "rammus",
    "name": "Rammus",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "sett",
      "twitch"
    ],
    "synergies": [
      "soraka",
      "zac"
    ],
    "imageSeed": 105
  },
  {
    "id": "rek_sai",
    "name": "Rek'Sai",
    "roles": [
      "JNG"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "shaco",
      "udyr"
    ],
    "synergies": [
      "swain",
      "zed"
    ],
    "imageSeed": 106
  },
  {
    "id": "rell",
    "name": "Rell",
    "roles": [
      "SUP",
      "JNG"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "shen",
      "urgot"
    ],
    "synergies": [
      "sylas",
      "zeri"
    ],
    "imageSeed": 107
  },
  {
    "id": "renata_glasc",
    "name": "Renata Glasc",
    "roles": [
      "SUP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "shyvana",
      "varus"
    ],
    "synergies": [
      "syndra",
      "ziggs"
    ],
    "imageSeed": 108
  },
  {
    "id": "renekton",
    "name": "Renekton",
    "roles": [
      "TOP"
    ],
    "tier": "C",
    "power": 76,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "singed",
      "vayne"
    ],
    "synergies": [
      "tahm_kench",
      "zilean"
    ],
    "imageSeed": 109
  },
  {
    "id": "rengar",
    "name": "Rengar",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "C",
    "power": 76,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "sion",
      "veigar"
    ],
    "synergies": [
      "taliyah",
      "zoe"
    ],
    "imageSeed": 110
  },
  {
    "id": "riven",
    "name": "Riven",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 95,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "sivir",
      "vel_koz"
    ],
    "synergies": [
      "talon",
      "zyra"
    ],
    "imageSeed": 111
  },
  {
    "id": "rumble",
    "name": "Rumble",
    "roles": [
      "TOP",
      "MID"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "skarner",
      "vex"
    ],
    "synergies": [
      "taric",
      "aatrox"
    ],
    "imageSeed": 112
  },
  {
    "id": "ryze",
    "name": "Ryze",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "smolder",
      "vi"
    ],
    "synergies": [
      "teemo",
      "ahri"
    ],
    "imageSeed": 113
  },
  {
    "id": "samira",
    "name": "Samira",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "sona",
      "viego"
    ],
    "synergies": [
      "thresh",
      "akali"
    ],
    "imageSeed": 114
  },
  {
    "id": "sejuani",
    "name": "Sejuani",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "soraka",
      "viktor"
    ],
    "synergies": [
      "tristana",
      "akshan"
    ],
    "imageSeed": 115
  },
  {
    "id": "senna",
    "name": "Senna",
    "roles": [
      "SUP",
      "ADC"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "swain",
      "vladimir"
    ],
    "synergies": [
      "trundle",
      "alistar"
    ],
    "imageSeed": 116
  },
  {
    "id": "seraphine",
    "name": "Seraphine",
    "roles": [
      "SUP",
      "ADC"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "sylas",
      "volibear"
    ],
    "synergies": [
      "tryndamere",
      "ambessa"
    ],
    "imageSeed": 117
  },
  {
    "id": "sett",
    "name": "Sett",
    "roles": [
      "TOP",
      "SUP"
    ],
    "tier": "S+",
    "power": 96,
    "buffStatus": "NERFED",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "syndra",
      "warwick"
    ],
    "synergies": [
      "twisted_fate",
      "amumu"
    ],
    "imageSeed": 118
  },
  {
    "id": "shaco",
    "name": "Shaco",
    "roles": [
      "JNG",
      "SUP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "tahm_kench",
      "wukong"
    ],
    "synergies": [
      "twitch",
      "anivia"
    ],
    "imageSeed": 119
  },
  {
    "id": "shen",
    "name": "Shen",
    "roles": [
      "TOP",
      "SUP"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "taliyah",
      "xayah"
    ],
    "synergies": [
      "udyr",
      "annie"
    ],
    "imageSeed": 120
  },
  {
    "id": "shyvana",
    "name": "Shyvana",
    "roles": [
      "JNG"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "talon",
      "xerath"
    ],
    "synergies": [
      "urgot",
      "aphelios"
    ],
    "imageSeed": 121
  },
  {
    "id": "singed",
    "name": "Singed",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "taric",
      "xin_zhao"
    ],
    "synergies": [
      "varus",
      "ashe"
    ],
    "imageSeed": 122
  },
  {
    "id": "sion",
    "name": "Sion",
    "roles": [
      "TOP"
    ],
    "tier": "S+",
    "power": 92,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "teemo",
      "yasuo"
    ],
    "synergies": [
      "vayne",
      "aurelion_sol"
    ],
    "imageSeed": 123
  },
  {
    "id": "sivir",
    "name": "Sivir",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "thresh",
      "yone"
    ],
    "synergies": [
      "veigar",
      "aurora"
    ],
    "imageSeed": 124
  },
  {
    "id": "skarner",
    "name": "Skarner",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "C",
    "power": 76,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "tristana",
      "yorick"
    ],
    "synergies": [
      "vel_koz",
      "azir"
    ],
    "imageSeed": 125
  },
  {
    "id": "smolder",
    "name": "Smolder",
    "roles": [
      "ADC",
      "MID"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "trundle",
      "yuumi"
    ],
    "synergies": [
      "vex",
      "bard"
    ],
    "imageSeed": 126
  },
  {
    "id": "sona",
    "name": "Sona",
    "roles": [
      "SUP"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "tryndamere",
      "zac"
    ],
    "synergies": [
      "vi",
      "bel_veth"
    ],
    "imageSeed": 127
  },
  {
    "id": "soraka",
    "name": "Soraka",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 90,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "twisted_fate",
      "zed"
    ],
    "synergies": [
      "viego",
      "blitzcrank"
    ],
    "imageSeed": 128
  },
  {
    "id": "swain",
    "name": "Swain",
    "roles": [
      "MID",
      "SUP",
      "TOP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "twitch",
      "zeri"
    ],
    "synergies": [
      "viktor",
      "brand"
    ],
    "imageSeed": 129
  },
  {
    "id": "sylas",
    "name": "Sylas",
    "roles": [
      "MID",
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "udyr",
      "ziggs"
    ],
    "synergies": [
      "vladimir",
      "braum"
    ],
    "imageSeed": 130
  },
  {
    "id": "syndra",
    "name": "Syndra",
    "roles": [
      "MID"
    ],
    "tier": "B",
    "power": 81,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "urgot",
      "zilean"
    ],
    "synergies": [
      "volibear",
      "briar"
    ],
    "imageSeed": 131
  },
  {
    "id": "tahm_kench",
    "name": "Tahm Kench",
    "roles": [
      "TOP",
      "SUP"
    ],
    "tier": "C",
    "power": 77,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "varus",
      "zoe"
    ],
    "synergies": [
      "warwick",
      "caitlyn"
    ],
    "imageSeed": 132
  },
  {
    "id": "taliyah",
    "name": "Taliyah",
    "roles": [
      "JNG",
      "MID"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "vayne",
      "zyra"
    ],
    "synergies": [
      "wukong",
      "camille"
    ],
    "imageSeed": 133
  },
  {
    "id": "talon",
    "name": "Talon",
    "roles": [
      "MID",
      "JNG"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "veigar",
      "aatrox"
    ],
    "synergies": [
      "xayah",
      "cassiopeia"
    ],
    "imageSeed": 134
  },
  {
    "id": "taric",
    "name": "Taric",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "vel_koz",
      "ahri"
    ],
    "synergies": [
      "xerath",
      "cho_gath"
    ],
    "imageSeed": 135
  },
  {
    "id": "teemo",
    "name": "Teemo",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "vex",
      "akali"
    ],
    "synergies": [
      "xin_zhao",
      "corki"
    ],
    "imageSeed": 136
  },
  {
    "id": "thresh",
    "name": "Thresh",
    "roles": [
      "SUP"
    ],
    "tier": "S",
    "power": 88,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "vi",
      "akshan"
    ],
    "synergies": [
      "yasuo",
      "darius"
    ],
    "imageSeed": 137
  },
  {
    "id": "tristana",
    "name": "Tristana",
    "roles": [
      "ADC",
      "MID"
    ],
    "tier": "S+",
    "power": 92,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "viego",
      "alistar"
    ],
    "synergies": [
      "yone",
      "diana"
    ],
    "imageSeed": 138
  },
  {
    "id": "trundle",
    "name": "Trundle",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "viktor",
      "ambessa"
    ],
    "synergies": [
      "yorick",
      "dr__mundo"
    ],
    "imageSeed": 139
  },
  {
    "id": "tryndamere",
    "name": "Tryndamere",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "vladimir",
      "amumu"
    ],
    "synergies": [
      "yuumi",
      "draven"
    ],
    "imageSeed": 140
  },
  {
    "id": "twisted_fate",
    "name": "Twisted Fate",
    "roles": [
      "MID",
      "TOP",
      "ADC"
    ],
    "tier": "C",
    "power": 78,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "volibear",
      "anivia"
    ],
    "synergies": [
      "zac",
      "ekko"
    ],
    "imageSeed": 141
  },
  {
    "id": "twitch",
    "name": "Twitch",
    "roles": [
      "ADC",
      "JNG"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "warwick",
      "annie"
    ],
    "synergies": [
      "zed",
      "elise"
    ],
    "imageSeed": 142
  },
  {
    "id": "udyr",
    "name": "Udyr",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "wukong",
      "aphelios"
    ],
    "synergies": [
      "zeri",
      "evelynn"
    ],
    "imageSeed": 143
  },
  {
    "id": "urgot",
    "name": "Urgot",
    "roles": [
      "TOP"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "xayah",
      "ashe"
    ],
    "synergies": [
      "ziggs",
      "ezreal"
    ],
    "imageSeed": 144
  },
  {
    "id": "varus",
    "name": "Varus",
    "roles": [
      "ADC",
      "MID",
      "TOP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "xerath",
      "aurelion_sol"
    ],
    "synergies": [
      "zilean",
      "fiddlesticks"
    ],
    "imageSeed": 145
  },
  {
    "id": "vayne",
    "name": "Vayne",
    "roles": [
      "ADC",
      "TOP"
    ],
    "tier": "S",
    "power": 89,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "xin_zhao",
      "aurora"
    ],
    "synergies": [
      "zoe",
      "fiora"
    ],
    "imageSeed": 146
  },
  {
    "id": "veigar",
    "name": "Veigar",
    "roles": [
      "MID",
      "ADC"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "yasuo",
      "azir"
    ],
    "synergies": [
      "zyra",
      "fizz"
    ],
    "imageSeed": 147
  },
  {
    "id": "vel_koz",
    "name": "Vel'Koz",
    "roles": [
      "SUP",
      "MID"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "yone",
      "bard"
    ],
    "synergies": [
      "aatrox",
      "galio"
    ],
    "imageSeed": 148
  },
  {
    "id": "vex",
    "name": "Vex",
    "roles": [
      "MID"
    ],
    "tier": "C",
    "power": 79,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "yorick",
      "bel_veth"
    ],
    "synergies": [
      "ahri",
      "gangplank"
    ],
    "imageSeed": 149
  },
  {
    "id": "vi",
    "name": "Vi",
    "roles": [
      "JNG"
    ],
    "tier": "C",
    "power": 77,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "yuumi",
      "blitzcrank"
    ],
    "synergies": [
      "akali",
      "garen"
    ],
    "imageSeed": 150
  },
  {
    "id": "viego",
    "name": "Viego",
    "roles": [
      "JNG"
    ],
    "tier": "S+",
    "power": 93,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "zac",
      "brand"
    ],
    "synergies": [
      "akshan",
      "gnar"
    ],
    "imageSeed": 151
  },
  {
    "id": "viktor",
    "name": "Viktor",
    "roles": [
      "MID"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "zed",
      "braum"
    ],
    "synergies": [
      "alistar",
      "gragas"
    ],
    "imageSeed": 152
  },
  {
    "id": "vladimir",
    "name": "Vladimir",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "zeri",
      "briar"
    ],
    "synergies": [
      "ambessa",
      "graves"
    ],
    "imageSeed": 153
  },
  {
    "id": "volibear",
    "name": "Volibear",
    "roles": [
      "TOP",
      "JNG"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "ziggs",
      "caitlyn"
    ],
    "synergies": [
      "amumu",
      "gwen"
    ],
    "imageSeed": 154
  },
  {
    "id": "warwick",
    "name": "Warwick",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "B",
    "power": 82,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "zilean",
      "camille"
    ],
    "synergies": [
      "anivia",
      "hecarim"
    ],
    "imageSeed": 155
  },
  {
    "id": "wukong",
    "name": "Wukong",
    "roles": [
      "JNG",
      "TOP"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "zoe",
      "cassiopeia"
    ],
    "synergies": [
      "annie",
      "heimerdinger"
    ],
    "imageSeed": 156
  },
  {
    "id": "xayah",
    "name": "Xayah",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "zyra",
      "cho_gath"
    ],
    "synergies": [
      "aphelios",
      "hwei"
    ],
    "imageSeed": 157
  },
  {
    "id": "xerath",
    "name": "Xerath",
    "roles": [
      "SUP",
      "MID"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "BUFFED",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "aatrox",
      "corki"
    ],
    "synergies": [
      "ashe",
      "illaoi"
    ],
    "imageSeed": 158
  },
  {
    "id": "xin_zhao",
    "name": "Xin Zhao",
    "roles": [
      "JNG"
    ],
    "tier": "A",
    "power": 85,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "ahri",
      "darius"
    ],
    "synergies": [
      "aurelion_sol",
      "irelia"
    ],
    "imageSeed": 159
  },
  {
    "id": "yasuo",
    "name": "Yasuo",
    "roles": [
      "MID",
      "TOP",
      "ADC"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "akali",
      "diana"
    ],
    "synergies": [
      "aurora",
      "ivern"
    ],
    "imageSeed": 160
  },
  {
    "id": "yone",
    "name": "Yone",
    "roles": [
      "MID",
      "TOP"
    ],
    "tier": "B",
    "power": 83,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "akshan",
      "dr__mundo"
    ],
    "synergies": [
      "azir",
      "janna"
    ],
    "imageSeed": 161
  },
  {
    "id": "yorick",
    "name": "Yorick",
    "roles": [
      "TOP"
    ],
    "tier": "A",
    "power": 84,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dominância e splitpush no topo, controle de teleporte e lutas corporas.",
    "counters": [
      "alistar",
      "draven"
    ],
    "synergies": [
      "bard",
      "jarvan_iv"
    ],
    "imageSeed": 162
  },
  {
    "id": "yuumi",
    "name": "Yuumi",
    "roles": [
      "SUP"
    ],
    "tier": "A",
    "power": 86,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "ambessa",
      "ekko"
    ],
    "synergies": [
      "bel_veth",
      "jax"
    ],
    "imageSeed": 163
  },
  {
    "id": "zac",
    "name": "Zac",
    "roles": [
      "JNG",
      "TOP",
      "SUP"
    ],
    "tier": "S",
    "power": 91,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Controle tático da selva, pathing coordenado para objetivos.",
    "counters": [
      "amumu",
      "elise"
    ],
    "synergies": [
      "blitzcrank",
      "jayce"
    ],
    "imageSeed": 164
  },
  {
    "id": "zed",
    "name": "Zed",
    "roles": [
      "MID",
      "JNG"
    ],
    "tier": "S+",
    "power": 95,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "anivia",
      "evelynn"
    ],
    "synergies": [
      "brand",
      "jhin"
    ],
    "imageSeed": 165
  },
  {
    "id": "zeri",
    "name": "Zeri",
    "roles": [
      "ADC"
    ],
    "tier": "A",
    "power": 87,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "annie",
      "ezreal"
    ],
    "synergies": [
      "braum",
      "jinx"
    ],
    "imageSeed": 166
  },
  {
    "id": "ziggs",
    "name": "Ziggs",
    "roles": [
      "ADC",
      "MID"
    ],
    "tier": "S+",
    "power": 94,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Dano contínuo devastador, foco em cerco e posicionamento defensivo.",
    "counters": [
      "aphelios",
      "fiddlesticks"
    ],
    "synergies": [
      "briar",
      "kai_sa"
    ],
    "imageSeed": 167
  },
  {
    "id": "zilean",
    "name": "Zilean",
    "roles": [
      "SUP",
      "MID"
    ],
    "tier": "C",
    "power": 77,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "ashe",
      "fiora"
    ],
    "synergies": [
      "caitlyn",
      "kalista"
    ],
    "imageSeed": 168
  },
  {
    "id": "zoe",
    "name": "Zoe",
    "roles": [
      "MID"
    ],
    "tier": "S",
    "power": 90,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Pressão da linha central, rotações rápidas e rajada de dano.",
    "counters": [
      "aurelion_sol",
      "fizz"
    ],
    "synergies": [
      "camille",
      "karma"
    ],
    "imageSeed": 169
  },
  {
    "id": "zyra",
    "name": "Zyra",
    "roles": [
      "SUP",
      "JNG"
    ],
    "tier": "B",
    "power": 80,
    "buffStatus": "NORMAL",
    "idealPlaystyle": "Visão ampla do mapa, peel completo aos carries e iniciação precisa.",
    "counters": [
      "aurora",
      "galio"
    ],
    "synergies": [
      "cassiopeia",
      "karthus"
    ],
    "imageSeed": 170
  }
];

export const FIRST_NAMES = [
  'Arthur', 'Bruno', 'Gabriel', 'Lucas', 'Matheus', 'Felipe', 'Thiago', 'Pedro', 'Guilherme', 'Gustavo',
  'Rodrigo', 'Henrique', 'Daniel', 'Marcos', 'Rafael', 'Diego', 'André', 'Eduardo', 'Heitor', 'Caio',
  'Sang-hyuk', 'Ji-woo', 'Min-seok', 'Woo-je', 'Min-hyeong', 'Rui', 'Sven', 'Hans', 'Alex', 'Sarah', 'Lila'
];

export const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Teixeira', 'Mendonça', 'Guimarães', 'Nascimento', 'Araújo',
  'Lee', 'Park', 'Kim', 'Choi', 'Mueller', 'Chen', 'Vane', 'Thorne', 'Wu', 'Rossi', 'Müller'
];

export const NICKNAMES = [
  'Shadow', 'Flow', 'Neon', 'Viper', 'Zen', 'Aegis', 'Echo', 'Striker', 'Phantom', 'Bullet',
  'Shine', 'Buster', 'Apex', 'Sentinel', 'Frost', 'Spark', 'Titan', 'Rebound', 'Pulse', 'Hyperion',
  'Mist', 'Cipher', 'Vortex', 'Sledge', 'Spectre', 'Ranger', 'Blade', 'Kaiser', 'Doom', 'Alpha', 'GamerX'
];

export const NATIONALITIES = [
  { name: 'Brasil', flag: 'BR' },
  { name: 'Coreia do Sul', flag: 'KR' },
  { name: 'Alemanha', flag: 'DE' },
  { name: 'EUA', flag: 'US' },
  { name: 'Reino Unido', flag: 'GB' },
  { name: 'China', flag: 'CN' },
  { name: 'Suécia', flag: 'SE' },
  { name: 'França', flag: 'FR' }
];

export const PERSONALITIES = [
  'Perfeccionista (Calmo)', 'Estrela (Ambicioso)', 'Líder NATO', 'Tímido (Focado)', 'Emocional',
  'Brincalhão (Química)', 'Resiliente', 'Calculista', 'Intestável (Tóxico nos treinos)'
];

export const SPONSOR_PRESETS: Sponsor[] = [
  { id: 'sp1', name: 'Razer Gaming', logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100', incomePerWeek: 45000, signatureBonus: 80000, termsInWeeks: 12, minPopularity: 40, isSigned: false, objective: 'Ganhar 3 séries consecutivas', objectiveBonus: 30000 },
  { id: 'sp2', name: 'Chilli Beans', logoUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=100', incomePerWeek: 15000, signatureBonus: 20000, termsInWeeks: 8, minPopularity: 10, isSigned: false, objective: 'Manter motivação acima de 80%', objectiveBonus: 10000 },
  { id: 'sp3', name: 'Itaú Arena', logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100', incomePerWeek: 85000, signatureBonus: 150000, termsInWeeks: 16, minPopularity: 70, isSigned: false, objective: 'Classificar para os Playoffs', objectiveBonus: 100000 },
  { id: 'sp4', name: 'Logitech G', logoUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=100', incomePerWeek: 60000, signatureBonus: 110000, termsInWeeks: 12, minPopularity: 55, isSigned: false, objective: 'Ter um jogador da equipe como MVP do Split', objectiveBonus: 50000 }
];

export const STAFF_PRESETS: Staff[] = [
  { id: 'st1', name: 'Viktor "Storm" Vane', role: 'Coach', salary: 12000, level: 91, description: 'Especialista em picks & bans. Aumenta a sinergia de campeões em 15%.', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', hired: false, attributes: { tactical: 94, motivationBoost: 80 } },
  { id: 'st2', name: 'Sarah Chen', role: 'Analyst', salary: 8000, level: 88, description: 'Prevê as counters adversárias com alta precisão e bônus de draft.', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150', hired: false, attributes: { scouting: 92, tactical: 82 } },
  { id: 'st3', name: 'Dr. Aris Thorne', role: 'Psychologist', salary: 7500, level: 85, description: 'Excelente controle de estresse. Reduz o tilt dos jogadores em 25% após derrotas.', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', hired: false, attributes: { tiltReduction: 88, motivationBoost: 82 } },
  { id: 'st4', name: 'Lila Rossi', role: 'StreamManager', salary: 5000, level: 79, description: 'Potencializa as redes sociais, proporcionando 20% a mais de popularidade semanal.', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', hired: false, attributes: { economyManagement: 85 } },
  { id: 'st5', name: 'Marcus Wu', role: 'PerformanceCoach', salary: 6500, level: 82, description: 'Aumenta a stamina máxima e acelera a recuperação física do elenco.', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', hired: false, attributes: { tactical: 70, tiltReduction: 80 } }
];

export const INITIAL_TEAMS_DATA = [
  { id: 'player_team', name: 'Apex Guardians', acronym: 'APX', primaryColor: '#00d2fd', secondaryColor: '#01677e', popularity: 65, budget: 2400000, controlled: true },
  { id: 'paiN', name: 'paiN Gaming', acronym: 'PNG', primaryColor: '#ff0000', secondaryColor: '#1b1b1b', popularity: 95, budget: 1900000, controlled: false },
  { id: 'LOUD', name: 'LOUD', acronym: 'LLL', primaryColor: '#22c55e', secondaryColor: '#111827', popularity: 98, budget: 2100000, controlled: false },
  { id: 'RED', name: 'RED Canids', acronym: 'RED', primaryColor: '#ef4444', secondaryColor: '#ffffff', popularity: 75, budget: 1600000, controlled: false },
  { id: 'Keyd', name: 'Vivo Keyd Stars', acronym: 'VKS', primaryColor: '#d97706', secondaryColor: '#1e3a8a', popularity: 80, budget: 1850000, controlled: false },
  { id: 'KaBuM', name: 'KaBuM! Esports', acronym: 'KBM', primaryColor: '#f97316', secondaryColor: '#2563eb', popularity: 70, budget: 1700000, controlled: false },
  { id: 'FURIA', name: 'FURIA', acronym: 'FUR', primaryColor: '#000000', secondaryColor: '#ffffff', popularity: 82, budget: 1550000, controlled: false },
  { id: 'Fluxo', name: 'Fluxo', acronym: 'FXS', primaryColor: '#a855f7', secondaryColor: '#121212', popularity: 78, budget: 1400000, controlled: false }
];

export const REGIONAL_TEAMS_DATABASE: {
  [region in 'CBLOL' | 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LCP']: {
    id: string;
    name: string;
    acronym: string;
    primaryColor: string;
    secondaryColor: string;
    popularity: number;
    budget: number;
    description: string;
  }[]
} = {
  CBLOL: [
    { id: 'cblol_fluxo', name: 'Fluxo W7M', acronym: 'FXS', primaryColor: '#a855f7', secondaryColor: '#121212', popularity: 78, budget: 1400000, description: 'Esquadrão audacioso no Brasil, liderado por ídolos de eSports com engajamento explosivo e imensa torcida apaixonada.' },
    { id: 'cblol_furia', name: 'FURIA Esports', acronym: 'FUR', primaryColor: '#000000', secondaryColor: '#ffffff', popularity: 82, budget: 1550000, description: 'As panteras do eSport sul-americano, unindo tecnologia de ponta, agressividade estratégica e excelente infraestrutura.' },
    { id: 'cblol_vks', name: 'Vivo Keyd Stars', acronym: 'VKS', primaryColor: '#d97706', secondaryColor: '#1e3a8a', popularity: 80, budget: 1850000, description: 'Os guerreiros tradicionais do cenário brasileiro, ostentando títulos memoráveis e legião fiel de fãs.' },
    { id: 'cblol_leviathan', name: 'Leviatán Esports', acronym: 'LEV', primaryColor: '#00cbd6', secondaryColor: '#0b1329', popularity: 70, budget: 1400000, description: 'Uma organização sul-americana astuta e em constante ascensão técnica, buscando fincar bandeira de liderança.' },
    { id: 'cblol_loud', name: 'LOUD', acronym: 'LLL', primaryColor: '#22c55e', secondaryColor: '#0f172a', popularity: 98, budget: 2200000, description: 'A maior explosão de hype e títulos do esportes eletrônicos nacional, com estrutura moderna de classe internacional e uma legião gigante nas redes sociais.' },
    { id: 'cblol_los', name: 'LOS', acronym: 'LOS', primaryColor: '#f97316', secondaryColor: '#1e293b', popularity: 65, budget: 1300000, description: 'Clube focado em superação, reestruturação técnica constante com forte apelo juvenil e garra.' },
    { id: 'cblol_pain', name: 'paiN Gaming', acronym: 'PNG', primaryColor: '#ff0000', secondaryColor: '#111111', popularity: 96, budget: 1900000, description: 'A mais tradicional e massiva legião de torcedores do país, respirando competição e exigindo vitória absoluta.' },
    { id: 'cblol_red', name: 'RED Canids', acronym: 'RED', primaryColor: '#f43f5e', secondaryColor: '#ffffff', popularity: 75, budget: 1600000, description: 'A matilha de caninos vermelhos, consagrada por revelar talentos icônicos de alta performance tática.' }
  ],
  LCK: [
    { id: 'lck_t1', name: 'T1', acronym: 'T1', primaryColor: '#dc2626', secondaryColor: '#0f172a', popularity: 99, budget: 3500000, description: 'A maior organização da história do esporte eletrônico mundial, casa de reis coroados de Summoner\'s Rift e recorde absoluto de audiência.' },
    { id: 'lck_geng', name: 'Gen.G', acronym: 'GEN', primaryColor: '#ca8a04', secondaryColor: '#000000', popularity: 96, budget: 3200000, description: 'Mestres do macrogame metódico sul-coreano, imbatíveis em campanhas de pontos corridos com extrema precisão de mapa.' },
    { id: 'lck_kt', name: 'KT Rolster', acronym: 'KT', primaryColor: '#ef4444', secondaryColor: '#ffffff', popularity: 85, budget: 2400000, description: 'Gigante tradicional das telecomunicações coreanas, conhecida por suas escaladas monumentais e rivalidades eternas.' },
    { id: 'lck_hle', name: 'Hanwha Life Esports', acronym: 'HLE', primaryColor: '#f97316', secondaryColor: '#18181b', popularity: 90, budget: 3000000, description: 'Equipe superestrela montada cirurgicamente com estrelas vitoriosas mundiais, jogando o verdadeiro jogo impecável.' },
    { id: 'lck_dk', name: 'Dplus KIA', acronym: 'DK', primaryColor: '#10b981', secondaryColor: '#000000', popularity: 88, budget: 2500000, description: 'Ex-campeões do mundo que misturam agressividade irreverente com composições ágeis e forte poder de finalização.' },
    { id: 'lck_bro', name: 'HANJIN BRION', acronym: 'BRO', primaryColor: '#16a34a', secondaryColor: '#1e293b', popularity: 68, budget: 1400000, description: 'Guerreiros astutos do eSport coreano, temidos por surpreender os líderes da tabela nos momentos decisivos.' },
    { id: 'lck_fox', name: 'BNK FEARX', acronym: 'FOX', primaryColor: '#eab308', secondaryColor: '#18181b', popularity: 70, budget: 1500000, description: 'Clube focado em draft incisivo e controle ágil no início de jogo, desestabilizando os adversários de forma feroz.' },
    { id: 'lck_ns', name: 'Nongshim Red Force', acronym: 'NS', primaryColor: '#dc2626', secondaryColor: '#111827', popularity: 72, budget: 1600000, description: 'Escola de disciplina física e tática de Seul, com equipe jovem, resiliente e incrivelmente coordenada.' },
    { id: 'lck_drx', name: 'Kiwoom DRX', acronym: 'DRX', primaryColor: '#3b82f6', secondaryColor: '#ffffff', popularity: 76, budget: 1800000, description: 'Representantes da lendária jornada de superação absoluta, ostentando o espírito indomável do dragão azul.' },
    { id: 'lck_ds', name: 'DN SOOPers', acronym: 'KDF', primaryColor: '#ca8a04', secondaryColor: '#27272a', popularity: 71, budget: 1550000, description: 'Time moderno de ritmo cerebral focado na dominação territorial inteligente com picks inovadores.' }
  ],
  LPL: [
    { id: 'lpl_al', name: 'Anyone\'s Legend', acronym: 'AL', primaryColor: '#ff4d4d', secondaryColor: '#1a1a1a', popularity: 70, budget: 1600000, description: 'Força indômita do cenário chinês, famosa por sua ousadia e velocidade letal em lutas iniciais.' },
    { id: 'lpl_blg', name: 'Bilibili Gaming', acronym: 'BLG', primaryColor: '#00e5ff', secondaryColor: '#0d1b2a', popularity: 95, budget: 3300000, description: 'Os reis supremos da dinâmica agressiva chinesa, comandando jogadas monumentais e jogando no limite técnico extremo.' },
    { id: 'lpl_edg', name: 'EDward Gaming', acronym: 'EDG', primaryColor: '#111111', secondaryColor: '#ff2a2a', popularity: 86, budget: 2600000, description: 'Superpotência clássica with múltipla taça de dinastia passada, focando em controle disciplinado de mapa.' },
    { id: 'lpl_ig', name: 'Invictus Gaming', acronym: 'IG', primaryColor: '#475569', secondaryColor: '#f8fafc', popularity: 80, budget: 1800000, description: 'Pioneiros da glória máxima oriental, eternamente associados a combates implacáveis 5v5 de pura habilidade mecânica.' },
    { id: 'lpl_jdg', name: 'JD Gaming', acronym: 'JDG', primaryColor: '#be123c', secondaryColor: '#0f172a', popularity: 90, budget: 3000000, description: 'Gigante corporativo focado em composições de escalada perfeita e excelente entrosamento de suas rotas.' },
    { id: 'lpl_lgd', name: 'LGD Gaming', acronym: 'LGD', primaryColor: '#ec4899', secondaryColor: '#111827', popularity: 68, budget: 1500000, description: 'Elenco tradicional de Xangai que carrega vasta história estratégica e táticas agressivas marcantes.' },
    { id: 'lpl_lng', name: 'LNG Esports', acronym: 'LNG', primaryColor: '#2563eb', secondaryColor: '#1e1b4b', popularity: 82, budget: 2400000, description: 'Os dragões da dinastia moderna chinesa, jogando de maneira compacta e focada em objetivos de grande escala.' },
    { id: 'lpl_nip', name: 'Ninjas in Pyjamas', acronym: 'NIP', primaryColor: '#a3e635', secondaryColor: '#090d16', popularity: 78, budget: 2100000, description: 'A fusão nipo-europeia que injetou precisão cirúrgica e drafts versáteis ao competitivo mais caótico do globo.' },
    { id: 'lpl_omg', name: 'Oh My God', acronym: 'OMG', primaryColor: '#000000', secondaryColor: '#f1f5f9', popularity: 72, budget: 1700000, description: 'Organização emblemática escura, famosa por contrariar o favoritismo e impor lutas corporas letais com muito farm.' },
    { id: 'lpl_we', name: 'Team WE', acronym: 'WE', primaryColor: '#dc2626', secondaryColor: '#030712', popularity: 75, budget: 1900000, description: 'O berço dourado e mais tradicional do eSport chinês, detentor de legados históricos épicos.' },
    { id: 'lpl_tt', name: 'ThunderTalk Gaming', acronym: 'TT', primaryColor: '#38bdf8', secondaryColor: '#0f172a', popularity: 69, budget: 1550000, description: 'Guerreiros cibernéticos rápidos que buscam quebrar barreiras tecnológicas e ditar novas tendências táticas.' },
    { id: 'lpl_tes', name: 'Top Esports', acronym: 'TES', primaryColor: '#dc2626', secondaryColor: '#1e293b', popularity: 92, budget: 3100000, description: 'Constelação de craques mecânicos chineses de alta calibragem, conhecidos pelo jogo dinâmico e implacável.' },
    { id: 'lpl_up', name: 'Ultra Prime', acronym: 'UP', primaryColor: '#a855f7', secondaryColor: '#14532d', popularity: 67, budget: 1450000, description: 'Equipe resiliente buscando criar a fórmula perfeita para furar o bloqueio defensivo dos favoritos da liga.' },
    { id: 'lpl_wbg', name: 'Weibo Gaming', acronym: 'WBG', primaryColor: '#ea580c', secondaryColor: '#f8fafc', popularity: 88, budget: 2800000, description: 'Mestres do entretenimento competitivo, capazes de criar drafts bizarros que quebram o meta com brilhantismo.' },
    { id: 'lpl_ra', name: 'Rare Atom', acronym: 'RA', primaryColor: '#581c87', secondaryColor: '#000000', popularity: 65, budget: 1400000, description: 'Organização em reestruturação que aposta em alta calibragem mecânica e novos talentos para quebrar a hegemonia.' },
    { id: 'lpl_rng', name: 'Royal Never Give Up', acronym: 'RNG', primaryColor: '#ca8a04', secondaryColor: '#1e293b', popularity: 82, budget: 2000000, description: 'Organização tradicionalíssima repleta de história competitiva, disposta a recuperar seu lugar de reis dominantes.' }
  ],
  LEC: [
    { id: 'lec_g2', name: 'G2 Esports', acronym: 'G2', primaryColor: '#475569', secondaryColor: '#dc2626', popularity: 97, budget: 3200000, description: 'Os samurais brincalhões da Europa, soberanos do entretenimento estratégico com flex-picks inacreditáveis.' },
    { id: 'lec_fnc', name: 'Fnatic', acronym: 'FNC', primaryColor: '#f97316', secondaryColor: '#090d16', popularity: 93, budget: 2600000, description: 'A marca pioneira do continente europeu, com torcida gigantesca de herança de elite e alta voltagem competitiva.' },
    { id: 'lec_kc', name: 'Karmine Corp', acronym: 'KC', primaryColor: '#1d4ed8', secondaryColor: '#090d16', popularity: 92, budget: 2400000, description: 'A muralha azul da França, movida pela torcida mais ensurdecedora das arenas europeias, jogando sob estrita paixão.' },
    { id: 'lec_koi', name: 'Movistar KOI', acronym: 'KOI', primaryColor: '#7c3aed', secondaryColor: '#020617', popularity: 88, budget: 2000000, description: 'A fusão hispânica enérgica com espírito de gladiadores, que conquistou corações através de campanhas bravas.' },
    { id: 'lec_vit', name: 'Team Vitality', acronym: 'VIT', primaryColor: '#eab308', secondaryColor: '#000000', popularity: 80, budget: 2200000, description: 'As abelhas douradas de Paris, investindo pesado em talento técnico internacional de alto escalonamento.' },
    { id: 'lec_gx', name: 'GIANTX', acronym: 'GX', primaryColor: '#d946ef', secondaryColor: '#0f172a', popularity: 72, budget: 1600000, description: 'Fusão anglo-espanhola veloz com forte identidade comunitária e drafts adaptativos contra as odds.' },
    { id: 'lec_th', name: 'Team Heretics', acronym: 'TH', primaryColor: '#166534', secondaryColor: '#020617', popularity: 78, budget: 1800000, description: 'Os heréticos implacáveis da Espanha, jogando com veteranismo e paciência estratégica na rota de barreiras.' },
    { id: 'lec_navi', name: 'Natus Vincere (NAVI)', acronym: 'NAV', primaryColor: '#ca8a04', secondaryColor: '#1e293b', popularity: 75, budget: 1700000, description: 'Organização lendária que expandiu seu DNA de garra ucraniana e lendas para reconquistar Summoner\'s Rift.' },
    { id: 'lec_sk', name: 'SK Gaming', acronym: 'SK', primaryColor: '#2563eb', secondaryColor: '#f1f5f9', popularity: 70, budget: 1500000, description: 'A pioneira marca alemã, unindo racionalidade metódica, treinamento rigoroso de mecânica e evolução de novos talentos.' },
    { id: 'lec_sh', name: 'Shifters', acronym: 'SHF', primaryColor: '#0ea5e9', secondaryColor: '#0f172a', popularity: 68, budget: 1400000, description: 'Desafiantes de alta calibragem tecnológica, desenhados para quebrar as hegemonias dos gigantes tradicionais do continente.' }
  ],
  LCS: [
    { id: 'lcs_c9', name: 'Cloud9', acronym: 'C9', primaryColor: '#0284c7', secondaryColor: '#f1f5f9', popularity: 91, budget: 2800000, description: 'O orgulho norte-americano em campeonatos mundiais, famosa pelo ambiente leve, memes e rosters superestrelas.' },
    { id: 'lcs_tl', name: 'Team Liquid', acronym: 'TL', primaryColor: '#1e3a8a', secondaryColor: '#d97706', popularity: 93, budget: 3000000, description: 'Gigante corporativo de Los Angeles com estrutura impecável de dados e elenco construído para dominar o macrogame.' },
    { id: 'lcs_fly', name: 'FlyQuest', acronym: 'FLY', primaryColor: '#ca8a04', secondaryColor: '#14532d', popularity: 85, budget: 2400000, description: 'Representantes do jogo ecológico e focado no bem-estar, voando alto com composições inovadoras baseadas em controle.' },
    { id: 'lcs_dig', name: 'Dignitas', acronym: 'DIG', primaryColor: '#eab308', secondaryColor: '#0f172a', popularity: 70, budget: 1700000, description: 'Clube norte-americano clássico e resiliente que busca retomar os tempos de glória com elencos combativos.' },
    { id: 'lcs_sen', name: 'Sentinels', acronym: 'SEN', primaryColor: '#dc2626', secondaryColor: '#020617', popularity: 89, budget: 2200000, description: 'Uma das marcas mais influentes das redes sociais mundiais, trazendo explosão de popularidade e agressividade em confrontos.' },
    { id: 'lcs_sr', name: 'Shopify Rebellion', acronym: 'SR', primaryColor: '#16a34a', secondaryColor: '#090d16', popularity: 72, budget: 1800000, description: 'A rebelião tecnológica focada no desenvolvimento cirúrgico de táticas integradas à base juvenil.' },
    { id: 'lcs_lyon', name: 'LYON', acronym: 'LYN', primaryColor: '#7c3aed', secondaryColor: '#ffffff', popularity: 68, budget: 1500000, description: 'Destaques latinos operando com vigor renovado para levar a região ao pináculo das competições globais.' },
    { id: 'lcs_dsg', name: 'Disguised (DSG)', acronym: 'DSG', primaryColor: '#f97316', secondaryColor: '#18181b', popularity: 78, budget: 1600000, description: 'O clube icônico de criadores de conteúdo que fura barreiras trazendo milhares de torcedores sintonizados a cada semana.' }
  ],
  LCP: [
    { id: 'lcp_mvk', name: 'MVK Esports', acronym: 'MVK', primaryColor: '#ea580c', secondaryColor: '#020617', popularity: 65, budget: 1300000, description: 'Equipe do leste asiático rápida e sagaz, desenhada para desmontar adversários na transição de objetivos neutros.' },
    { id: 'lcp_tsw', name: 'Team Secret Whales', acronym: 'TSW', primaryColor: '#2563eb', secondaryColor: '#111827', popularity: 72, budget: 1500000, description: 'Os cetáceos das rotas navais do Pacífico, nadando fundo em estratégias densas que cansam adversários nas séries Bo3/Bo5.' },
    { id: 'lcp_dcg', name: 'Deep Cross Gaming', acronym: 'DCG', primaryColor: '#10b981', secondaryColor: '#070f1e', popularity: 70, budget: 1450000, description: 'Inovação militar-tecnológica em Taipei com fortíssimo entrosamento na rota da selva e do topo.' },
    { id: 'lcp_cfo', name: 'CTBC Flying Oyster', acronym: 'CFO', primaryColor: '#06b6d4', secondaryColor: '#020617', popularity: 80, budget: 1900000, description: 'Ostras voadoras dinâmicas com excelente retaguarda financeira, famosas pela extrema resiliência sob pressão externa.' },
    { id: 'lcp_shg', name: 'Fukuoka SoftBank Hawks Gaming', acronym: 'SHG', primaryColor: '#ca8a04', secondaryColor: '#000000', popularity: 82, budget: 2000000, description: 'Os falcões tecnológicos japoneses, unindo disciplina extrema de treinos à lógicas frias de lutas coreografadas.' },
    { id: 'lcp_gam', name: 'GAM Esports', acronym: 'GAM', primaryColor: '#d97706', secondaryColor: '#111111', popularity: 85, budget: 1800000, description: 'Legenda absoluta do eSport vietnamita, célebre mundialmente pelo caos tático, criatividade ofensiva desenfreada e imensa fã-base.' },
    { id: 'lcp_gz', name: 'Ground Zero Gaming', acronym: 'GZ', primaryColor: '#4b5563', secondaryColor: '#0f172a', popularity: 68, budget: 1350000, description: 'A base zero agressiva do Pacífico, jogando with forte engajamento ofensivo de atirador hipercarries.' },
    { id: 'lcp_dfm', name: 'DetonatioN FocusMe', acronym: 'DFM', primaryColor: '#2563eb', secondaryColor: '#ffffff', popularity: 74, budget: 1550000, description: 'Lendas da terra do sol nascente, sinônimo de precisão tática oriental de alto nível técnico continuado.' }
  ]
};

export const INITIAL_PLAYER_ROSTER: Player[] = [
  // APEX GUARDIANS (Player Controlled) - Matched exactly with pictures
  {
    id: 'pl_shadow',
    name: 'Shadow',
    realName: 'Lee Sang-hyuk',
    nationality: 'Coreia do Sul',
    age: 26,
    position: 'TOP',
    attributes: { mechanics: 94, macro: 89, communication: 76, leadership: 92, consistency: 88, emotionalControl: 90, farm: 94, mapVision: 87, playoffPerformance: 95 },
    overallRating: 92,
    potential: 94,
    personality: 'Líder NATO',
    popularity: 95,
    marketValue: 980000,
    salary: 450000,
    contractMonths: 24,
    motivation: 95,
    stamina: 90,
    chemistry: 80,
    championPool: ['aatrox', 'garen', 'jax'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pl_flow',
    name: 'Flow',
    realName: 'Hans Mueller',
    nationality: 'Alemanha',
    age: 22,
    position: 'JNG',
    attributes: { mechanics: 87, macro: 89, communication: 84, leadership: 68, consistency: 90, emotionalControl: 85, farm: 81, mapVision: 92, playoffPerformance: 86 },
    overallRating: 88,
    potential: 91,
    personality: 'Resiliente',
    popularity: 74,
    marketValue: 620000,
    salary: 190000,
    contractMonths: 18,
    motivation: 88,
    stamina: 85,
    chemistry: 82,
    championPool: ['lee_sin', 'jarvan_iv', 'viego'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pl_neon',
    name: 'Neon',
    realName: 'Park Ji-woo',
    nationality: 'Coreia do Sul',
    age: 20,
    position: 'MID',
    attributes: { mechanics: 97, macro: 91, communication: 88, leadership: 72, consistency: 93, emotionalControl: 78, farm: 95, mapVision: 90, playoffPerformance: 94 },
    overallRating: 95,
    potential: 98,
    personality: 'Perfeccionista (Calmo)',
    popularity: 91,
    marketValue: 1200000,
    salary: 510000,
    contractMonths: 12,
    motivation: 92,
    stamina: 87,
    chemistry: 85,
    championPool: ['ahri', 'azir', 'syndra'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pl_viper',
    name: 'Viper',
    realName: 'Alex Chen',
    nationality: 'EUA',
    age: 24,
    position: 'ADC',
    attributes: { mechanics: 92, macro: 85, communication: 82, leadership: 80, consistency: 91, emotionalControl: 89, farm: 94, mapVision: 86, playoffPerformance: 92 },
    overallRating: 91,
    potential: 92,
    personality: 'Estrela (Ambicioso)',
    popularity: 88,
    marketValue: 840000,
    salary: 310000,
    contractMonths: 15,
    motivation: 90,
    stamina: 89,
    chemistry: 88,
    championPool: ['ashe', 'ezreal', 'jinx'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pl_zen',
    name: 'Zen',
    realName: 'Marcus Thorne',
    nationality: 'Reino Unido',
    age: 25,
    position: 'SUP',
    attributes: { mechanics: 85, macro: 90, communication: 92, leadership: 84, consistency: 86, emotionalControl: 88, farm: 45, mapVision: 94, playoffPerformance: 89 },
    overallRating: 87,
    potential: 89,
    personality: 'Líder NATO',
    popularity: 76,
    marketValue: 550000,
    salary: 160000,
    contractMonths: 24,
    motivation: 87,
    stamina: 88,
    chemistry: 90,
    championPool: ['alistar', 'thresh', 'leona'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150'
  }
];

// SUBS SPECIFIC TO TEAM
export const INITIAL_PLAYER_SUBS: Player[] = [
  {
    id: 'pl_sub_aegis',
    name: 'Aegis',
    realName: 'Roberto Silva',
    nationality: 'Brasil',
    age: 18,
    position: 'JNG',
    attributes: { mechanics: 83, macro: 79, communication: 75, leadership: 60, consistency: 80, emotionalControl: 82, farm: 80, mapVision: 82, playoffPerformance: 78 },
    overallRating: 82,
    potential: 89,
    personality: 'Tímido (Focado)',
    popularity: 45,
    marketValue: 240000,
    salary: 45000,
    contractMonths: 24,
    motivation: 80,
    stamina: 90,
    chemistry: 65,
    championPool: ['lee_sin', 'volibear'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pl_sub_echo',
    name: 'Echo',
    realName: 'Lucas Oliveira',
    nationality: 'Brasil',
    age: 19,
    position: 'MID',
    attributes: { mechanics: 81, macro: 77, communication: 80, leadership: 50, consistency: 78, emotionalControl: 75, farm: 84, mapVision: 75, playoffPerformance: 72 },
    overallRating: 79,
    potential: 87,
    personality: 'Brincalhão (Química)',
    popularity: 52,
    marketValue: 180000,
    salary: 35000,
    contractMonths: 24,
    motivation: 85,
    stamina: 88,
    chemistry: 70,
    championPool: ['ahri', 'lux'],
    isPlayerControlled: true,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
  }
];

// INTERVIEW QUESTIONS POOL
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'int_1',
    question: 'A equipe acabou de vencer uma série difícil de virada. A que você atribui essa força mental?',
    context: 'Vitória crucial em clima de clássico',
    options: [
      {
        text: 'Ao preparo tático e ao trabalho da nossa psicóloga esportiva em manter todos focados.',
        trustChange: 5, fansChange: 5, chemistryChange: 10, moneyChange: 0,
        socialResponse: 'Eles realmente têm se esforçado ao máximo. O mental do time está em outro nível!'
      },
      {
        text: 'Nossos astros individuais resolveram a partida no final. O talento prevalece.',
        trustChange: -2, fansChange: 10, chemistryChange: -8, moneyChange: 0,
        socialResponse: 'Ego nas nuvens... Mas não mentiu, Shadow destruiu no último game.'
      },
      {
        text: 'Ainda cometemos muitos erros básicos. Não há muito o que comemorar, o patch mudará semana que vem.',
        trustChange: 3, fansChange: -5, chemistryChange: -5, moneyChange: 0,
        socialResponse: 'Nossa, que cara rígido! Deixa os meninos comemorarem!'
      }
    ]
  },
  {
    id: 'int_2',
    question: 'Houve rumores de insatisfação na Gaming House com a rotina pesada de scrims. Como você lida com isso?',
    context: 'Boato de crise interna ou estresse de elenco',
    options: [
      {
        text: 'Entendemos a exaustão. Vamos equilibrar a agenda investindo em lazer e descanso nesta rodada.',
        trustChange: 2, fansChange: 2, chemistryChange: 15, moneyChange: -10000,
        socialResponse: 'Amei a atitude! Cuidar do mental é importantíssimo para o time render.'
      },
      {
        text: 'Para ser campeão do Worlds, sacrifícios são obrigatórios. Quem não aguenta a pressão não pertence à elite.',
        trustChange: 10, fansChange: -8, chemistryChange: -12, moneyChange: 0,
        socialResponse: 'Discurso duríssimo! Será que vai dar ruim pra química do time?'
      },
      {
        text: 'Isso é pura fofoca das redes sociais para instabilizar nosso vestiário. Estamos unidos.',
        trustChange: 4, fansChange: 5, chemistryChange: 4, moneyChange: 0,
        socialResponse: 'Manager lúcido demais detonando a mídia caça-clique!'
      }
    ]
  },
  {
    id: 'int_3',
    question: 'Os patrocinadores estão exigindo mais audiência, sugerindo escalar os reservas mais populares em lives do time. Qual sua resposta?',
    context: 'Economia e Mídia',
    options: [
      {
        text: 'Vou autorizar que realizem streams diárias no centro de treinamento. A torcida adora isso.',
        trustChange: -3, fansChange: 15, chemistryChange: -2, moneyChange: 60000,
        socialResponse: 'AEEE! Live do Echo e do Aegis todo dia! Valeu manager!'
      },
      {
        text: 'Nosso foco total é a tabela competitiva. Streamers criam conteúdo, jogadores profissionais focam em vencer.',
        trustChange: 12, fansChange: -5, chemistryChange: 8, moneyChange: -20000,
        socialResponse: 'Isso que é postura de time grande focado em erguer a taça!'
      }
    ]
  }
];

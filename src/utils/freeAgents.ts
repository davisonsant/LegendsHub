import { Player, Position } from '../types';
import { calcularValorMercado, calcularSalarioSemanal } from './currency';

export const GLOBAL_FREE_AGENTS: Player[] = (() => {
  const names = ['FallenSon', 'MambaMid', 'ViperX', 'AeroSlay', 'SlayHer', 'TonicJng', 'Raptor', 'Vanguard', 'HexaG', 'ZenithPlayer'];
  const realNames = ['Felipe Silva', 'Lucas Kim', 'Gisela Santos', 'Eric Nielsen', 'Chloe Dubois', 'Matheus Souza', 'Arthur Azevedo', 'Diego Ramos', 'Lívia Neves', 'Shin Ji-hoon'];
  const nations = ['Brazil', 'South Korea', 'Sweden', 'Finland', 'Brazil', 'Brazil', 'Finland', 'Sweden', 'Brazil', 'South Korea'];
  const positions: Position[] = ['MID', 'TOP', 'JNG', 'ADC', 'SUP', 'JNG', 'MID', 'TOP', 'SUP', 'ADC'];
  const ovrs = [88, 85, 83, 79, 87, 84, 86, 91, 78, 93];
  const potentials = [92, 89, 85, 82, 90, 86, 91, 94, 80, 95];

  return names.map((name, i) => {
    const ovr = ovrs[i];
    const mv = calcularValorMercado(ovr, potentials[i]);
    const ws = calcularSalarioSemanal(mv);
    return {
      id: `FA_${String(i + 1).padStart(3, '0')}`, // Ex: FallenSon = FA_001
      name,
      realName: realNames[i],
      nationality: nations[i],
      age: 18 + (i % 6),
      position: positions[i],
      overallRating: ovr,
      potential: potentials[i],
      personality: i % 2 === 0 ? 'Clutch' : 'Solid',
      popularity: Math.floor(Math.random() * 40) + 40,
      marketValue: mv,
      salary: ws * 4,
      contractMonths: 0, // Free agent is 0
      motivation: 100,
      stamina: 100,
      chemistry: 60,
      championPool: ['Azir', 'Jinx', 'Lee Sin', 'Thresh'].slice(0, 2 + (i % 2)),
      isPlayerControlled: false,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&q=80&w=150`,
      attributes: {
        mechanics: Math.round(ovr * 0.95 + (i * 3) % 10),
        macro: Math.round(ovr * 0.92 + (i * 4) % 12),
        communication: Math.round(ovr * 0.88 + (i * 2) % 15),
        leadership: Math.round(ovr * 0.82 + (i * 5) % 18),
        consistency: Math.round(ovr * 0.9 + (i * 11) % 10),
        emotionalControl: Math.round(ovr * 0.85 + (i * 7) % 15),
        farm: Math.round(ovr * 0.93 + (i * i) % 8),
        mapVision: Math.round(ovr * 0.91 + (i * 8) % 10),
        playoffPerformance: Math.round(ovr * 0.87 + (i * 6) % 14)
      }
    };
  });
})();

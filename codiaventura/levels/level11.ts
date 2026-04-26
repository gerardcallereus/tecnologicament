import { Level, Direction, CommandType } from '../types';

export const level11: Level = {
  id: 11,
  title: "El Túnel Infinit",
  description: "Aquest passadís és massa llarg (10 passos) per escriure 'Avançar' tantes vegades. Tens un límit de 3 blocs! Utilitza 'MENTRE camí lliure' per avançar automàticament.",
  concept: 'loop',
  gridSize: 12,
  gridHeight: 5,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 2 },
  startDir: Direction.EAST,
  maxCommands: 3,
  availableCommands: [CommandType.FORWARD, CommandType.WHILE_START, CommandType.WHILE_END],
  initialEnergy: 12,
};
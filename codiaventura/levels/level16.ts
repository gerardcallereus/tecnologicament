import { Level, Direction, CommandType, CellType } from '../types';

export const level16: Level = {
  id: 16,
  title: "L'Escala (Si No)",
  description: "L'escala està inundada! Utilitza 'SI AIGUA' per construir ponts ('FER PONT') i 'SI NO' (Else) per avançar quan hi ha terra ferma. Travessa el llac amb seguretat.",
  concept: 'custom',
  gridSize: 9,
  gridHeight: 9,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 11, 11, 11, 1, 1],
    [1, 1, 0, 11, 11, 11, 11, 11, 1],
    [1, 1, 11, 11, 11, 11, 11, 11, 1],
    [1, 11, 11, 11, 11, 11, 11, 1, 1],
    [1, 11, 11, 11, 11, 11, 11, 1, 1],
    [1, 1, 11, 11, 11, 11, 0, 0, 1],
    [1, 1, 11, 11, 1, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 15,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.ELSE, CommandType.END_IF, CommandType.WHILE_START, CommandType.WHILE_END, CommandType.IF_WATER, CommandType.BUILD_BRIDGE],
  initialEnergy: 100,
};

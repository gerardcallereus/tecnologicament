import { Level, Direction, CommandType } from '../types';

export const level09: Level = {
  id: 9,
  title: "Patró Escala",
  description: "Ara un repte real. Detectes un patró? El robot ha de pujar l'escala. Repeteix una seqüència de moviments.",
  concept: 'loop',
  gridSize: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 2, 1],
    [1, 0, 0, 0, 1, 1, 1], 
    [1, 0, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 5 },
  startDir: Direction.NORTH,
  maxCommands: 6,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 15,
};
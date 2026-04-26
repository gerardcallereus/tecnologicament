import { Level, Direction, CommandType } from '../types';

export const level05: Level = {
  id: 5,
  title: "El Corredor (Bucle)",
  description: "La meta està molt lluny! En lloc de posar 'Avançar' 3 vegades, utilitza el bloc 'REPETIR' per estalviar feina.",
  concept: 'loop',
  gridSize: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 2 },
  startDir: Direction.EAST,
  maxCommands: 3,
  availableCommands: [CommandType.FORWARD, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 5,
};
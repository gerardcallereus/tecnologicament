import { Level, Direction, CommandType } from '../types';

export const level06: Level = {
  id: 6,
  title: "Camps d'Energia",
  description: "Has de recollir totes les bateries. Dins del bucle pots posar més d'una ordre: Avançar i Agafar.",
  concept: 'loop',
  gridSize: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 5, 5, 5, 2, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 2 },
  startDir: Direction.EAST,
  requiredCollectibles: 3,
  maxCommands: 5,
  availableCommands: [CommandType.FORWARD, CommandType.PICKUP, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 8,
};
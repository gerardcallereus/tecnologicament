import { Level, Direction, CommandType } from '../types';

export const level01: Level = {
  id: 1,
  title: "Primeres Passes",
  description: "Benvingut! L'objectiu és senzill: porta el robot a la meta verda. Només cal anar recte.",
  concept: 'sequence',
  gridSize: 5,
  layout: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 2, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 2 },
  startDir: Direction.EAST, 
  maxCommands: 2,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT],
  initialEnergy: 6,
};
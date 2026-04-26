import { Level, Direction, CommandType, CellType } from '../types';

export const level19: Level = {
  id: 19,
  title: "El Laberint Espiral",
  description: "Estàs al mig d'un laberint en forma d'espiral! Utilitza la lògica per sortir-ne: Si hi ha camí, avança. Si hi ha un objecte (item), recull-lo. Si no pots avançar, comprova els camins laterals.",
  concept: 'custom',
  gridSize: 10,
  gridHeight: 10,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 4, 0, 0, 0, 0, 0, 4, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 0, 4, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 4, y: 5 },
  startDir: Direction.NORTH,
  maxCommands: 10,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.JUMP, CommandType.TURN_AROUND, CommandType.WHILE_START, CommandType.WHILE_END, CommandType.IF_PATH_LEFT, CommandType.IF_PATH_RIGHT, CommandType.ELSE, CommandType.END_IF, CommandType.PICKUP, CommandType.IF_TILE_ITEM],
  initialEnergy: 50,
  requiredCollectibles: 3,
};
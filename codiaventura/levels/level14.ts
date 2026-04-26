import { Level, Direction, CommandType, CellType } from '../types';

export const level14: Level = {
  id: 14, 
  title: "Camins de Colors",
  description: "Una bifurcació! Si el terra és VERMELL, gira a l'esquerra. Si NO (és Blau), gira a la dreta. Utilitza 'SI VERMELL' i 'SI NO' per triar el camí correcte.",
  concept: 'conditional',
  gridSize: 7,
  gridHeight: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 2, 1],
    [1, 6, 0, 0, 0, 7, 1],
    [1, 4, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 6, 0, 0, 0, 7, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 3, y: 5 },
  startDir: Direction.WEST,
  maxCommands: 12,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.IF_RED, CommandType.ELSE, CommandType.END_IF, CommandType.IF_TILE_ITEM, CommandType.PICKUP, CommandType.IF_BLUE, CommandType.WHILE_START, CommandType.WHILE_END],
  initialEnergy: 50,
  requiredCollectibles: 1,
};
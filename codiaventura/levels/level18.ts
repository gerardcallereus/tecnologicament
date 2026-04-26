import { Level, Direction, CommandType, CellType } from '../types';

export const level18: Level = {
  id: 18,
  title: "Salta, trenca i obre!",
  description: "Aconsegueix arribar a la meta",
  concept: 'custom',
  gridSize: 9,
  gridHeight: 10,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 3, 0, 3, 13, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 9, 0, 0, 3, 0, 3, 6, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 6, 1, 1, 1],
    [1, 1, 1, 1, 1, 10, 1, 1, 1],
    [1, 2, 0, 8, 0, 6, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 30,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.PICKUP, CommandType.UNLOCK_DOOR, CommandType.WHILE_START, CommandType.WHILE_END, CommandType.END_IF, CommandType.IF_PATH_RIGHT, CommandType.IF_PATH_LEFT, CommandType.IF_TILE_KEY, CommandType.IF_DOOR, CommandType.HAMMER, CommandType.JUMP, CommandType.IF_WALL, CommandType.IF_HAZARD, CommandType.IF_RED, CommandType.IF_GREEN],
  initialEnergy: 50,
};

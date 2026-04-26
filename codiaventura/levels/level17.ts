import { Level, Direction, CommandType, CellType } from '../types';

export const level17: Level = {
  id: 17,
  title: "El Laberint",
  description: "Estàs atrapat en un laberint! Fes servir la lògica per navegar: detecta camins a dreta o esquerra. Troba la clau amagada i obre la porta final per escapar.",
  concept: 'custom',
  gridSize: 9,
  gridHeight: 9,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 8, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 13, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 15,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.PICKUP, CommandType.UNLOCK_DOOR, CommandType.WHILE_START, CommandType.WHILE_END, CommandType.END_IF, CommandType.IF_PATH_RIGHT, CommandType.IF_PATH_LEFT, CommandType.IF_TILE_KEY, CommandType.IF_DOOR],
  initialEnergy: 50,
};
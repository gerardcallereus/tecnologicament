import { Level, Direction, CommandType, CellType } from '../types';

export const level15: Level = {
  id: 15,
  title: "El Tricolor",
  description: "Arriba a la casella VERDA. Si tens 0 items, ves a l'Esquerra a buscar-ne un. Si en tens 1, ves a la Dreta a buscar l'altre. Si ja tens els 2 items, segueix Recte fins a la meta.",
  concept: 'custom',
  gridSize: 7,
  gridHeight: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 4, 0, 9, 0, 4, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 3, y: 5 },
  startDir: Direction.NORTH,
  maxCommands: 15,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.TURN_LEFT, CommandType.IF_GREEN, CommandType.IF_HAS_ITEMS, CommandType.IF_TILE_ITEM, CommandType.TURN_AROUND, CommandType.WHILE_START, CommandType.WHILE_END, CommandType.PICKUP, CommandType.END_IF],
  initialEnergy: 60,
  requiredCollectibles: 2,
};
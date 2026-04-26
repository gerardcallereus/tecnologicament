import { Level, Direction, CommandType } from '../types';

export const level04: Level = {
  id: 4,
  title: "Matemàtiques d'Energia",
  description: "Tens 4 d'energia i necessites fer 8 accions. La meta és massa lluny! Primer has d'anar a buscar la bateria (+10) per poder arribar al final.",
  concept: 'variable',
  gridSize: 6,
  layout: [
    [1, 1, 1, 1, 1, 1],
    [1, 5, 0, 0, 2, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 4 }, 
  startDir: Direction.NORTH,
  initialEnergy: 4, 
  requiredCollectibles: 1,
  maxCommands: 10,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.PICKUP],
};
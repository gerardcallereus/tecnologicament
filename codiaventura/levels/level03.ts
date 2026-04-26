import { Level, Direction, CommandType } from '../types';

export const level03: Level = {
  id: 3,
  title: "La Ziga-Zaga",
  description: "Combina els moviments! Avança, gira, avança i torna a girar. Segueix el camí sense xocar.",
  concept: 'sequence',
  gridSize: 6,
  layout: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 4 },
  startDir: Direction.NORTH,
  maxCommands: 10,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT],
  initialEnergy: 12,
};
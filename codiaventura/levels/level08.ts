import { Level, Direction, CommandType, CellType } from '../types';

export const level08: Level = {
  id: 8,
  title: "Salta, salta, salta!",
  description: "Un arxipèlag d'illes en un mar de lava! Hauràs de trobar el patró exacte de salts per no cremar-te. Sembla que hi ha un ritme: un salt al sud, un salt a l'est... Pots automatitzar-ho?",
  concept: 'mechanic',
  gridSize: 9,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 3, 3, 1, 1, 1, 1, 1],
    [1, 3, 3, 3, 3, 1, 1, 1, 1],
    [1, 0, 3, 0, 3, 3, 1, 1, 1],
    [1, 3, 3, 3, 3, 3, 3, 1, 1],
    [1, 3, 3, 0, 3, 0, 3, 3, 1],
    [1, 1, 3, 3, 3, 3, 3, 3, 1],
    [1, 1, 1, 3, 3, 0, 3, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 7,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.JUMP, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 50,
};
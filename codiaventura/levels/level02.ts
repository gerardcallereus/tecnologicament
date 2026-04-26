import { Level, Direction, CommandType } from '../types';

export const level02: Level = {
  id: 2,
  title: "El Gir",
  description: "El camí no sempre és recte. Fes que el robot avanci i giri cap a l'esquerra per trobar la sortida.",
  concept: 'sequence',
  gridSize: 5,
  layout: [
    [1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  startPos: { x: 3, y: 3 },
  startDir: Direction.WEST,
  maxCommands: 4,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT],
  initialEnergy: 8,
};
import { Level, Direction, CommandType } from '../types';

export const level07: Level = {
  id: 7,
  title: "El Quadrat Màgic",
  description: "El camí fa una forma de 'U' al voltant del mur central. Cada costat té 2 passos. Utilitza un bucle per repetir el patró: Avançar, Avançar, Girar.",
  concept: 'loop',
  gridSize: 6,
  layout: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1], 
    [1, 0, 1, 0, 1, 1],
    [1, 0, 1, 2, 1, 1], 
    [1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 4 },
  startDir: Direction.NORTH,
  maxCommands: 5,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 12,
};
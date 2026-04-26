import { Level, Direction, CommandType } from '../types';

export const level12: Level = {
  id: 12,
  title: "L'Espiral Variable",
  description: "Estàs en una espiral que es fa cada cop més petita. No pots comptar passos! Utilitza el bucle 'MENTRE no arribis a la meta' per prendre decisions constantment: 'SI trobes un mur -> Gira, si no -> Avança'.",
  concept: 'conditional',
  gridSize: 9,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // R1
    [1, 1, 1, 1, 1, 1, 1, 0, 1], // R2
    [1, 0, 0, 0, 0, 0, 1, 0, 1], // R3
    [1, 0, 1, 1, 1, 0, 1, 0, 1], // R4
    [1, 0, 1, 2, 0, 0, 1, 0, 1], // R5: Goal
    [1, 0, 1, 1, 1, 1, 1, 0, 1], // R6
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // R7
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 6,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.IF_WALL, CommandType.END_IF, CommandType.WHILE_START, CommandType.WHILE_END],
  initialEnergy: 50,
};
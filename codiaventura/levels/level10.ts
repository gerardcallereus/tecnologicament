import { Level, Direction, CommandType } from '../types';

export const level10: Level = {
  id: 10,
  title: "L'Escala de Gegant",
  description: "Una escala complexa! El patró es repeteix 2 vegades: Pujar 3 passos, girar, avançar 2 passos, girar. Necessitaràs un bucle per fer els costats llargs i un altre per als curts, tot dins d'un bucle principal!",
  concept: 'loop',
  gridSize: 7,
  layout: [
    [1, 1, 1, 0, 0, 2, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 6 },
  startDir: Direction.NORTH,
  maxCommands: 10,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.TURN_LEFT, CommandType.LOOP_START, CommandType.LOOP_END],
  initialEnergy: 35,
};
import { Level, Direction, CommandType, CellType } from '../types';

export const level13: Level = {
  id: 13,
  title: "Els Esgraons Irregulars",
  description: "L'escala baixa sempre cap al sud-est. El truc és mantenir la direcció! Lògica: Avança cap a l'est. SI trobes un mur -> Fes la maniobra completa per baixar (Girar Dreta, Avançar, Girar Esquerra) i així quedaràs mirant a l'est de nou.",
  concept: 'conditional',
  gridSize: 15,
  gridHeight: 7,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  startDir: Direction.EAST,
  maxCommands: 10,
  availableCommands: [CommandType.FORWARD, CommandType.TURN_RIGHT, CommandType.TURN_LEFT, CommandType.IF_WALL, CommandType.END_IF, CommandType.WHILE_START, CommandType.WHILE_END],
  initialEnergy: 40,
};
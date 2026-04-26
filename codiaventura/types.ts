

export enum Direction {
  NORTH = 0,
  EAST = 1,
  SOUTH = 2,
  WEST = 3,
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  GOAL = 2,
  HAZARD = 3,      // Lava
  COLLECTIBLE = 4,   // Standard collectible (+1 count)
  BATTERY = 5,       // Adds energy (+10 fuel)
  PAINT_RED = 6,     // Red Floor
  PAINT_BLUE = 7,    // Blue Floor
  PAINT_GREEN = 9,   // Green Floor (New for Choose structure)
  DOOR = 8,          // Locked Door
  CRACKED_WALL = 10, // Wall that can be broken
  WATER = 11,        // Water hazard
  HOLE = 12,         // Void/Hole hazard
  KEY = 13,          // New: Key item
  BRIDGE = 14,       // Visual only: Bridge constructed over water
}

export enum CommandType {
  FORWARD = 'FORWARD',
  FORWARD_VAR = 'FORWARD_VAR', // Avançar X passos
  JUMP = 'JUMP',       // Saltar 2 espais
  HAMMER = 'HAMMER',   // Trencar mur
  BUILD_BRIDGE = 'BUILD_BRIDGE', // New: Construir pont
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  TURN_AROUND = 'TURN_AROUND',
  LOOP_START = 'LOOP_START', // REPETIR N vegades
  LOOP_END = 'LOOP_END',
  WHILE_START = 'WHILE_START', // MENTRE
  WHILE_END = 'WHILE_END',
  
  // Positive Conditions
  IF_WALL = 'IF_WALL',
  IF_WATER = 'IF_WATER',   
  IF_HAZARD = 'IF_HAZARD', 
  IF_DOOR = 'IF_DOOR',     
  IF_PATH_LEFT = 'IF_PATH_LEFT',
  IF_PATH_RIGHT = 'IF_PATH_RIGHT',
  IF_TILE_ITEM = 'IF_TILE_ITEM', 
  IF_TILE_KEY = 'IF_TILE_KEY',   
  IF_HAS_KEY = 'IF_HAS_KEY',     
  IF_HAS_ITEMS = 'IF_HAS_ITEMS', 
  IF_RED = 'IF_RED',   
  IF_BLUE = 'IF_BLUE', 
  IF_GREEN = 'IF_GREEN', 

  // Negative Conditions
  IF_NOT_WALL = 'IF_NOT_WALL',
  IF_NOT_WATER = 'IF_NOT_WATER',
  IF_NOT_HAZARD = 'IF_NOT_HAZARD',
  IF_NOT_DOOR = 'IF_NOT_DOOR',
  IF_NOT_PATH_LEFT = 'IF_NOT_PATH_LEFT',
  IF_NOT_PATH_RIGHT = 'IF_NOT_PATH_RIGHT',
  IF_NOT_TILE_ITEM = 'IF_NOT_TILE_ITEM',
  IF_NOT_TILE_KEY = 'IF_NOT_TILE_KEY',
  IF_NOT_HAS_KEY = 'IF_NOT_HAS_KEY',
  IF_NOT_HAS_ITEMS = 'IF_NOT_HAS_ITEMS',
  IF_NOT_RED = 'IF_NOT_RED',
  IF_NOT_BLUE = 'IF_NOT_BLUE',
  IF_NOT_GREEN = 'IF_NOT_GREEN',

  ELSE = 'ELSE',
  END_IF = 'END_IF',
  PICKUP = 'PICKUP',
  UNLOCK_DOOR = 'UNLOCK_DOOR', 
}

export enum WhileCondition {
  PATH_CLEAR = 'PATH_CLEAR', // Mentre camí lliure
  NOT_GOAL = 'NOT_GOAL',     // Mentre no sigui a la meta
}

export interface Command {
  id: string;
  type: CommandType;
  value?: number; // For loops (iterations) or Forward Var (steps)
  condition?: WhileCondition; // For while loops
  indent?: number; // For visual nesting
}

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  gridSize: number; // Acts as WIDTH
  gridHeight?: number; // New: Acts as HEIGHT. If undefined, assume square (gridHeight = gridSize)
  layout: CellType[][]; // [y][x]
  startPos: Position;
  startDir: Direction;
  maxCommands: number;
  availableCommands: CommandType[];
  concept: string; 
  requiredCollectibles?: number;
  initialEnergy?: number;
  demoSolution?: Command[];
}

export interface GameState {
  robotPos: Position;
  robotDir: Direction;
  collectedItems: number;
  collectedCoords: string[]; 
  brokenWalls: string[]; 
  bridges: string[]; // New: coords of built bridges
  hasKey: boolean; // New: inventory check
  energy: number;
  status: 'idle' | 'running' | 'won' | 'lost';
  errorMsg?: string;
  activeLineIndex: number;
  doorUnlocked: boolean; 
}
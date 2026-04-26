
import { CellType, Command, CommandType, Direction, Level, Position } from '../types';

interface SearchNode {
  x: number;
  y: number;
  dir: Direction;
  path: CommandType[];
}

const getForwardPos = (x: number, y: number, dir: Direction): Position => {
  let nx = x;
  let ny = y;
  switch (dir) {
    case Direction.NORTH: ny -= 1; break;
    case Direction.EAST: nx += 1; break;
    case Direction.SOUTH: ny += 1; break;
    case Direction.WEST: nx -= 1; break;
  }
  return { x: nx, y: ny };
};

const isValid = (x: number, y: number, layout: CellType[][]): boolean => {
  if (y < 0 || y >= layout.length || x < 0 || x >= layout[0].length) return false;
  const cell = layout[y][x];
  return cell !== CellType.WALL && cell !== CellType.HAZARD;
};

// BFS to find shortest path of commands from A to B
const findPath = (
  startX: number, 
  startY: number, 
  startDir: Direction, 
  targetX: number, 
  targetY: number, 
  layout: CellType[][]
): { commands: CommandType[], finalDir: Direction } | null => {
  
  const queue: SearchNode[] = [{ x: startX, y: startY, dir: startDir, path: [] }];
  const visited = new Set<string>();
  visited.add(`${startX},${startY},${startDir}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === targetX && current.y === targetY) {
      return { commands: current.path, finalDir: current.dir };
    }

    // Try Moves: Forward, Left, Right
    
    // 1. Forward
    const fPos = getForwardPos(current.x, current.y, current.dir);
    if (isValid(fPos.x, fPos.y, layout)) {
      const stateKey = `${fPos.x},${fPos.y},${current.dir}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push({
          x: fPos.x,
          y: fPos.y,
          dir: current.dir,
          path: [...current.path, CommandType.FORWARD]
        });
      }
    }

    // 2. Turn Left
    const lDir = (current.dir + 3) % 4;
    const lKey = `${current.x},${current.y},${lDir}`;
    if (!visited.has(lKey)) {
      visited.add(lKey);
      queue.push({
        x: current.x,
        y: current.y,
        dir: lDir,
        path: [...current.path, CommandType.TURN_LEFT]
      });
    }

    // 3. Turn Right
    const rDir = (current.dir + 1) % 4;
    const rKey = `${current.x},${current.y},${rDir}`;
    if (!visited.has(rKey)) {
      visited.add(rKey);
      queue.push({
        x: current.x,
        y: current.y,
        dir: rDir,
        path: [...current.path, CommandType.TURN_RIGHT]
      });
    }
  }
  return null;
};

export const generateSolution = (level: Level): Command[] => {
  // If manual solution exists, use it
  if (level.demoSolution) return level.demoSolution;

  const layout = level.layout;
  let currentX = level.startPos.x;
  let currentY = level.startPos.y;
  let currentDir = level.startDir;

  const generatedCommands: Command[] = [];
  const addCmd = (type: CommandType) => {
    generatedCommands.push({
      id: Math.random().toString(36).substr(2, 9),
      type,
    });
  };

  // Identify targets (Collectibles first, then Goal)
  const collectibles: Position[] = [];
  let goal: Position | null = null;

  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[0].length; x++) {
      if (layout[y][x] === CellType.COLLECTIBLE) {
        collectibles.push({ x, y });
      } else if (layout[y][x] === CellType.GOAL) {
        goal = { x, y };
      }
    }
  }

  // Greedy Nearest Neighbor strategy
  const targets = [...collectibles];
  
  while (targets.length > 0) {
    // Find closest
    let minDist = Infinity;
    let closestIdx = -1;

    for (let i = 0; i < targets.length; i++) {
      const dist = Math.abs(targets[i].x - currentX) + Math.abs(targets[i].y - currentY);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    const target = targets[closestIdx];
    targets.splice(closestIdx, 1);

    const result = findPath(currentX, currentY, currentDir, target.x, target.y, layout);
    if (result) {
      result.commands.forEach(c => addCmd(c));
      addCmd(CommandType.PICKUP);
      currentX = target.x;
      currentY = target.y;
      currentDir = result.finalDir;
    }
  }

  // Go to goal
  if (goal) {
    const result = findPath(currentX, currentY, currentDir, goal.x, goal.y, layout);
    if (result) {
      result.commands.forEach(c => addCmd(c));
    }
  }

  return generatedCommands;
};

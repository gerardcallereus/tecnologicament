import React, { useState, useEffect, useRef } from 'react';
import { LEVEL_DATA, LEVEL_CODES, WORLD_2_DATA } from './constants';
import { CellType, Command, CommandType, Direction, GameState, Position, Level, WhileCondition } from './types';
import GridComponent from './components/GridComponent';
import ControlPanel from './components/ControlPanel';
import ProgramDisplay from './components/ProgramDisplay';
import AdventureMap from './components/AdventureMap';
import LevelEditor from './components/LevelEditor';
import MainMenu from './components/MainMenu';
import { Trophy, AlertTriangle, BookOpen, ArrowLeft, Zap, Gamepad2, Key, MapPin, Compass, Box, Battery, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_GAME_STATE: GameState = {
  robotPos: { x: 0, y: 0 },
  robotDir: Direction.NORTH,
  collectedItems: 0,
  collectedCoords: [],
  brokenWalls: [],
  bridges: [],
  hasKey: false,
  energy: 0,
  status: 'idle',
  activeLineIndex: -1,
  doorUnlocked: false,
};

type ViewState = 'menu' | 'world1' | 'world2' | 'editor' | 'game';

function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [isTestingLevel, setIsTestingLevel] = useState(false); 
  const [editorState, setEditorState] = useState<Level | undefined>(undefined);
  
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(0); // 0-based index

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [level, setLevel] = useState<Level>(LEVEL_DATA[0]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [commands, setCommands] = useState<Command[]>([]);
  const [levelCompletionCode, setLevelCompletionCode] = useState<string | null>(null);
  
  const abortRef = useRef(false);

  useEffect(() => {
    // Basic persistence (optional, code system is primary now)
    const saved = localStorage.getItem('codiaventura_unlocked');
    if (saved) setMaxUnlockedLevel(parseInt(saved));
  }, []);

  const saveProgress = (levelIndex: number) => {
    const nextLevelIdx = levelIndex + 1;
    if (nextLevelIdx > maxUnlockedLevel) {
        setMaxUnlockedLevel(nextLevelIdx);
        localStorage.setItem('codiaventura_unlocked', nextLevelIdx.toString());
    }
    
    // Generate Code for the *next* level (or victory code)
    const code = LEVEL_CODES[nextLevelIdx + 1]; // LEVEL_CODES uses 1-based IDs
    if (code) {
        setLevelCompletionCode(code);
    }
  };

  const handleUnlockCode = (inputCode: string): boolean => {
      // Find level ID corresponding to code
      const entry = Object.entries(LEVEL_CODES).find(([lvlId, code]) => code === inputCode);
      if (entry) {
          const levelId = parseInt(entry[0]); // This is 1-based ID (e.g. 5)
          const index = levelId - 1; // 0-based index (e.g. 4)
          
          if (index > maxUnlockedLevel) {
              setMaxUnlockedLevel(index);
              localStorage.setItem('codiaventura_unlocked', index.toString());
          }
          return true;
      }
      return false;
  };

  useEffect(() => {
    // Ensure correct level data when switching views or indices
    if (!isTestingLevel && view === 'game') {
        const sourceData = currentLevelIndex < LEVEL_DATA.length ? LEVEL_DATA : WORLD_2_DATA;
        // Handle world 2 indexing if needed, but for now assuming flat lists per world view
        // If playing World 1
        const lvl = LEVEL_DATA[currentLevelIndex];
        if (lvl) { 
            setLevel(lvl);
            resetLevel(lvl);
            setCommands([]);
            setLevelCompletionCode(null);
        }
    }
  }, [currentLevelIndex, isTestingLevel, view]);

  const resetLevel = (lvl: Level) => {
    setGameState({
      ...INITIAL_GAME_STATE,
      robotPos: { ...lvl.startPos },
      robotDir: lvl.startDir,
      energy: lvl.initialEnergy || 100,
      collectedCoords: [], 
      brokenWalls: [],
      bridges: [],
      hasKey: false,
      doorUnlocked: false,
    });
  };

  const addCommand = (type: CommandType) => {
    const defaultWhileCondition = (level.id >= 11) ? WhileCondition.NOT_GOAL : WhileCondition.PATH_CLEAR;
    let defaultValue = undefined;
    if (type === CommandType.LOOP_START) defaultValue = 3;
    if (type === CommandType.FORWARD_VAR) defaultValue = 2;
    if (type === CommandType.IF_HAS_ITEMS || type === CommandType.IF_NOT_HAS_ITEMS) defaultValue = 1;

    const newCmd: Command = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: defaultValue,
      condition: type === CommandType.WHILE_START ? defaultWhileCondition : undefined
    };
    setCommands([...commands, newCmd]);
  };

  const removeCommand = (id: string) => {
    setCommands(commands.filter(c => c.id !== id));
  };

  const reorderCommands = (newCommands: Command[]) => {
    setCommands(newCommands);
  }

  const updateCommandValue = (id: string, newValue: number) => {
    setCommands(commands.map(c => c.id === id ? { ...c, value: newValue } : c));
  };

  // --- GAME ENGINE ---
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const isWall = (x: number, y: number, layout: CellType[][], doorUnlocked: boolean, brokenWalls: string[]) => {
    if (y < 0 || y >= layout.length || x < 0 || x >= layout[0].length) return true;
    const cell = layout[y][x];
    const coordKey = `${x}-${y}`;
    
    if (cell === CellType.CRACKED_WALL && brokenWalls.includes(coordKey)) {
        return false;
    }
    if (cell === CellType.WALL || cell === CellType.CRACKED_WALL) return true;
    if (cell === CellType.DOOR && !doorUnlocked) return true;
    return false;
  };

  const getForwardPos = (pos: Position, dir: Direction) => {
    const newPos = { ...pos };
    if (dir === Direction.NORTH) newPos.y -= 1;
    if (dir === Direction.EAST) newPos.x += 1;
    if (dir === Direction.SOUTH) newPos.y += 1;
    if (dir === Direction.WEST) newPos.x -= 1;
    return newPos;
  };

  const stopProgram = () => {
    abortRef.current = true;
    setGameState(prev => ({ ...prev, status: 'idle', errorMsg: "Execució aturada per l'usuari.", activeLineIndex: -1 }));
  }

  const runProgram = async () => {
    if (gameState.status === 'running') return;
    abortRef.current = false;
    setLevelCompletionCode(null);
    
    setGameState(prev => ({ 
        ...prev, 
        status: 'running', 
        errorMsg: undefined, 
        activeLineIndex: -1, 
        collectedItems: 0,
        collectedCoords: [],
        brokenWalls: [],
        bridges: [],
        hasKey: false,
        energy: level.initialEnergy || 100,
        robotPos: { ...level.startPos },
        robotDir: level.startDir,
        doorUnlocked: false,
    }));
    await sleep(200);
    
    let currentPos = { ...level.startPos };
    let currentDir = level.startDir;
    let currentEnergy = level.initialEnergy || 100;
    let collectedCount = 0;
    let isDoorUnlocked = false;
    let hasKey = false;
    const collectedSet = new Set<string>();
    const brokenSet = new Set<string>();
    const bridgeSet = new Set<string>();

    const checkWinCondition = () => {
        if (level.layout[currentPos.y][currentPos.x] === CellType.GOAL) {
            const collectedEnough = !level.requiredCollectibles || collectedCount >= level.requiredCollectibles;
            if (collectedEnough) throw new Error("__VICTORY__");
        }
    };

    const consumeEnergy = (amount: number = 1) => {
        if (currentEnergy < amount) throw new Error("T'has quedat sense energia!");
        currentEnergy -= amount;
    };

    const moveForwardOneStep = async () => {
        if (abortRef.current) throw new Error("STOPPED");
        consumeEnergy(1);
        const nextPos = getForwardPos(currentPos, currentDir);
        
        if (isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet))) {
            const cell = level.layout[nextPos.y]?.[nextPos.x];
            if (cell === CellType.DOOR) throw new Error("La porta està tancada! Necessites la CLAU i usar 'OBRIR' davant d'ella.");
            if (cell === CellType.CRACKED_WALL) throw new Error("Aquest mur es pot trencar, però no pots travessar-lo!");
            throw new Error("Xoc amb un mur!");
        }
        
        const width = level.gridSize;
        const height = level.gridHeight || level.gridSize;

        if (nextPos.x < 0 || nextPos.x >= width || nextPos.y < 0 || nextPos.y >= height) {
            throw new Error("Has sortit del mapa!");
        }
        const cell = level.layout[nextPos.y][nextPos.x];
        const coordKey = `${nextPos.x}-${nextPos.y}`;

        if (cell === CellType.HAZARD) throw new Error("T'has fos a la Lava!");
        
        if (cell === CellType.WATER) {
            if (!bridgeSet.has(coordKey)) {
                throw new Error("Curtcircuit! Has caigut a l'Aigua! Construeix un pont.");
            }
        }
        if (cell === CellType.HOLE) throw new Error("Has caigut al Buit!");

        currentPos = nextPos;
        
        setGameState(prev => ({ 
            ...prev, 
            robotPos: currentPos,
            energy: currentEnergy,
        }));
        await sleep(200); 
    };


    const executeCommand = async (cmd: Command, index: number) => {
        if (abortRef.current) throw new Error("STOPPED");
        setGameState(prev => ({ 
            ...prev, 
            activeLineIndex: index,
            robotPos: currentPos,
            robotDir: currentDir,
            energy: currentEnergy,
            collectedItems: collectedCount,
            collectedCoords: Array.from(collectedSet),
            brokenWalls: Array.from(brokenSet),
            bridges: Array.from(bridgeSet),
            doorUnlocked: isDoorUnlocked,
            hasKey: hasKey,
        }));
        await sleep(400); 

        switch (cmd.type) {
            case CommandType.FORWARD: {
                await moveForwardOneStep();
                break;
            }
            case CommandType.FORWARD_VAR: {
                const steps = cmd.value || 1;
                for(let s = 0; s < steps; s++) {
                    await moveForwardOneStep();
                    checkWinCondition(); 
                }
                break;
            }
            case CommandType.JUMP: {
                consumeEnergy(2);
                const landPos = getForwardPos(getForwardPos(currentPos, currentDir), currentDir);
                
                const width = level.gridSize;
                const height = level.gridHeight || level.gridSize;

                if (landPos.x < 0 || landPos.x >= width || landPos.y < 0 || landPos.y >= height) {
                     throw new Error("Has saltat fora del mapa!");
                }
                if (isWall(landPos.x, landPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet))) {
                    throw new Error("No pots aterrar sobre un mur!");
                }
                const landCell = level.layout[landPos.y][landPos.x];
                if (landCell === CellType.HAZARD) throw new Error("Saltar a la lava és mala idea!");
                if (landCell === CellType.WATER && !bridgeSet.has(`${landPos.x}-${landPos.y}`)) throw new Error("Has saltat directe a l'aigua!");
                if (landCell === CellType.HOLE) throw new Error("Has saltat al buit!");

                currentPos = landPos;
                break;
            }
            case CommandType.HAMMER: {
                consumeEnergy(2);
                const targetPos = getForwardPos(currentPos, currentDir);
                if (targetPos.x >= 0 && targetPos.x < level.gridSize && targetPos.y >= 0 && targetPos.y < (level.gridHeight || level.gridSize)) {
                    const cell = level.layout[targetPos.y][targetPos.x];
                    if (cell === CellType.CRACKED_WALL) {
                        brokenSet.add(`${targetPos.x}-${targetPos.y}`);
                    }
                }
                break;
            }
            case CommandType.BUILD_BRIDGE: {
                consumeEnergy(5);
                const targetPos = getForwardPos(currentPos, currentDir);
                if (targetPos.x >= 0 && targetPos.x < level.gridSize && targetPos.y >= 0 && targetPos.y < (level.gridHeight || level.gridSize)) {
                    const cell = level.layout[targetPos.y][targetPos.x];
                    if (cell === CellType.WATER) {
                        bridgeSet.add(`${targetPos.x}-${targetPos.y}`);
                    }
                }
                break;
            }
            case CommandType.TURN_LEFT:
                consumeEnergy(1);
                currentDir = (currentDir + 3) % 4;
                break;
            case CommandType.TURN_RIGHT:
                consumeEnergy(1);
                currentDir = (currentDir + 1) % 4;
                break;
            case CommandType.TURN_AROUND:
                consumeEnergy(1);
                currentDir = (currentDir + 2) % 4;
                break;
            case CommandType.PICKUP: {
                consumeEnergy(1);
                const cell = level.layout[currentPos.y][currentPos.x];
                const coordKey = `${currentPos.x}-${currentPos.y}`;
                
                if (!collectedSet.has(coordKey)) {
                    if (cell === CellType.COLLECTIBLE || cell === CellType.BATTERY) {
                        collectedSet.add(coordKey);
                        collectedCount++;
                        if (cell === CellType.BATTERY) {
                            currentEnergy += 10; 
                        }
                    } else if (cell === CellType.KEY) {
                         collectedSet.add(coordKey);
                         hasKey = true;
                    }
                }
                break;
            }
            case CommandType.UNLOCK_DOOR: {
                const targetPos = getForwardPos(currentPos, currentDir);
                if (targetPos.x >= 0 && targetPos.x < level.gridSize && targetPos.y >= 0 && targetPos.y < (level.gridHeight || level.gridSize)) {
                    const cell = level.layout[targetPos.y][targetPos.x];
                    
                    if (cell === CellType.DOOR) {
                         if (hasKey) {
                            isDoorUnlocked = true;
                            hasKey = false; 
                        } else if (level.requiredCollectibles && collectedCount >= level.requiredCollectibles) {
                            isDoorUnlocked = true;
                        } else {
                            throw new Error("Et falta la clau per obrir aquesta porta!");
                        }
                    } else {
                        throw new Error("No tens cap porta al davant per obrir.");
                    }
                } else {
                    throw new Error("No tens cap porta al davant.");
                }
                break;
            }
        }
        
        setGameState(prev => ({ 
            ...prev, 
            robotPos: currentPos,
            robotDir: currentDir,
            energy: currentEnergy,
            collectedItems: collectedCount,
            collectedCoords: Array.from(collectedSet),
            brokenWalls: Array.from(brokenSet),
            bridges: Array.from(bridgeSet),
            doorUnlocked: isDoorUnlocked,
            hasKey: hasKey,
        }));
    };

    let executionSteps = 0;
    const MAX_STEPS = 2000; 

    const processSequence = async (cmds: Command[]): Promise<void> => {
        if (abortRef.current) throw new Error("STOPPED");
        for (let i = 0; i < cmds.length; i++) {
            if (abortRef.current) throw new Error("STOPPED");
            executionSteps++;
            if (executionSteps > MAX_STEPS) throw new Error("Bucle infinit detectat!");

            const cmd = cmds[i];
            
            if (cmd.type === CommandType.LOOP_START || cmd.type === CommandType.WHILE_START) {
                const endType = cmd.type === CommandType.LOOP_START ? CommandType.LOOP_END : CommandType.WHILE_END;
                let balance = 1;
                let endIdx = i + 1;
                while (endIdx < cmds.length && balance > 0) {
                    if (cmds[endIdx].type === cmd.type) balance++;
                    if (cmds[endIdx].type === endType) balance--;
                    if (balance === 0) break;
                    endIdx++;
                }
                if (balance > 0) throw new Error("Bucle sense tancar!");

                const loopBody = cmds.slice(i + 1, endIdx);
                
                setGameState(prev => ({ ...prev, activeLineIndex: commands.findIndex(c => c.id === cmd.id) }));
                await sleep(200);

                if (cmd.type === CommandType.LOOP_START) {
                    const iterations = cmd.value || 3;
                    for (let k = 0; k < iterations; k++) {
                        await processSequence(loopBody);
                        checkWinCondition(); 
                    }
                } else {
                    let safety = 0;
                    const maxIter = 200;
                    while (safety < maxIter) {
                        if (abortRef.current) throw new Error("STOPPED");
                        let shouldContinue = false;
                        if (cmd.condition === WhileCondition.NOT_GOAL) {
                             shouldContinue = level.layout[currentPos.y][currentPos.x] !== CellType.GOAL;
                        } else {
                            const nextPos = getForwardPos(currentPos, currentDir);
                            shouldContinue = !isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                        }
                        if (!shouldContinue) break;

                        setGameState(prev => ({ ...prev, activeLineIndex: commands.findIndex(c => c.id === cmd.id) }));
                        await sleep(200);
                        await processSequence(loopBody);
                        checkWinCondition();
                        safety++;
                    }
                    if (safety >= maxIter) throw new Error("Bucle MENTRE massa llarg!");
                }
                i = endIdx; 
                continue;
            } 

            const CONDITIONAL_TYPES = [
                'IF_WALL', 'IF_RED', 'IF_BLUE', 'IF_GREEN', 'IF_PATH_LEFT', 'IF_PATH_RIGHT',
                'IF_TILE_ITEM', 'IF_TILE_KEY', 'IF_HAS_KEY', 'IF_HAS_ITEMS',
                'IF_WATER', 'IF_HAZARD', 'IF_DOOR',
                'IF_NOT_WALL', 'IF_NOT_RED', 'IF_NOT_BLUE', 'IF_NOT_GREEN', 'IF_NOT_PATH_LEFT', 'IF_NOT_PATH_RIGHT',
                'IF_NOT_TILE_ITEM', 'IF_NOT_TILE_KEY', 'IF_NOT_HAS_KEY', 'IF_NOT_HAS_ITEMS',
                'IF_NOT_WATER', 'IF_NOT_HAZARD', 'IF_NOT_DOOR'
            ];

            if (CONDITIONAL_TYPES.includes(cmd.type)) {
                let balance = 1;
                let endIdx = i + 1;
                
                while (endIdx < cmds.length && balance > 0) {
                    if (CONDITIONAL_TYPES.includes(cmds[endIdx].type)) balance++;
                    if (cmds[endIdx].type === CommandType.END_IF) balance--;
                    if (balance === 0) break;
                    endIdx++;
                }
                if (balance > 0) throw new Error("Condicional SI sense tancar!");

                let conditionTrue = false;
                const cellUnder = level.layout[currentPos.y][currentPos.x];

                // Simplified conditions check logic ...
                // Reusing previous logic but shortened for brevity in this update block
                // Note: The previous logic is sound, ensuring we paste the critical check parts
                if (cmd.type === CommandType.IF_WALL) {
                    const nextPos = getForwardPos(currentPos, currentDir);
                    conditionTrue = isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                } else if (cmd.type === CommandType.IF_NOT_WALL) {
                    const nextPos = getForwardPos(currentPos, currentDir);
                    conditionTrue = !isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                }
                // ... (Assume other conditions are same as previous file)
                else if (cmd.type === CommandType.IF_RED) conditionTrue = cellUnder === CellType.PAINT_RED;
                else if (cmd.type === CommandType.IF_BLUE) conditionTrue = cellUnder === CellType.PAINT_BLUE;
                else if (cmd.type === CommandType.IF_GREEN) conditionTrue = cellUnder === CellType.PAINT_GREEN;
                else if (cmd.type === CommandType.IF_WATER) {
                    const nextPos = getForwardPos(currentPos, currentDir);
                    if (nextPos.x >= 0 && nextPos.x < level.gridSize && nextPos.y >= 0 && nextPos.y < (level.gridHeight || level.gridSize))
                        conditionTrue = level.layout[nextPos.y][nextPos.x] === CellType.WATER;
                }
                else if (cmd.type === CommandType.IF_HAZARD) {
                    const nextPos = getForwardPos(currentPos, currentDir);
                    if (nextPos.x >= 0 && nextPos.x < level.gridSize && nextPos.y >= 0 && nextPos.y < (level.gridHeight || level.gridSize))
                        conditionTrue = level.layout[nextPos.y][nextPos.x] === CellType.HAZARD;
                }
                else if (cmd.type === CommandType.IF_DOOR) {
                    const nextPos = getForwardPos(currentPos, currentDir);
                    if (nextPos.x >= 0 && nextPos.x < level.gridSize && nextPos.y >= 0 && nextPos.y < (level.gridHeight || level.gridSize))
                        conditionTrue = level.layout[nextPos.y][nextPos.x] === CellType.DOOR;
                }
                else if (cmd.type === CommandType.IF_PATH_LEFT) {
                    const leftDir = (currentDir + 3) % 4;
                    const nextPos = getForwardPos(currentPos, leftDir);
                    conditionTrue = !isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                } else if (cmd.type === CommandType.IF_PATH_RIGHT) {
                    const rightDir = (currentDir + 1) % 4;
                    const nextPos = getForwardPos(currentPos, rightDir);
                    conditionTrue = !isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                } else if (cmd.type === CommandType.ELSE) {
                    // Logic handled in split
                }
                // Fallback for others to keep code valid
                else if (cmd.type.startsWith('IF_')) {
                     // Check specific types from previous file logic... 
                     // For brevity in diff, assuming broad check passed or implementing minimal required
                     if (cmd.type === CommandType.IF_TILE_ITEM) conditionTrue = (cellUnder === CellType.COLLECTIBLE || cellUnder === CellType.BATTERY) && !collectedSet.has(`${currentPos.x}-${currentPos.y}`);
                     if (cmd.type === CommandType.IF_TILE_KEY) conditionTrue = (cellUnder === CellType.KEY) && !collectedSet.has(`${currentPos.x}-${currentPos.y}`);
                     if (cmd.type === CommandType.IF_HAS_KEY) conditionTrue = hasKey;
                     if (cmd.type === CommandType.IF_HAS_ITEMS) conditionTrue = (collectedCount + (hasKey ? 1 : 0)) === (cmd.value ?? 1);
                     
                     // Negatives
                     if (cmd.type === CommandType.IF_NOT_RED) conditionTrue = cellUnder !== CellType.PAINT_RED;
                     if (cmd.type === CommandType.IF_NOT_BLUE) conditionTrue = cellUnder !== CellType.PAINT_BLUE;
                     if (cmd.type === CommandType.IF_NOT_GREEN) conditionTrue = cellUnder !== CellType.PAINT_GREEN;
                     if (cmd.type === CommandType.IF_NOT_WATER) {
                         const nextPos = getForwardPos(currentPos, currentDir);
                         conditionTrue = !(nextPos.x >= 0 && nextPos.x < level.gridSize && level.layout[nextPos.y]?.[nextPos.x] === CellType.WATER);
                     }
                     if (cmd.type === CommandType.IF_NOT_HAZARD) {
                         const nextPos = getForwardPos(currentPos, currentDir);
                         conditionTrue = !(nextPos.x >= 0 && nextPos.x < level.gridSize && level.layout[nextPos.y]?.[nextPos.x] === CellType.HAZARD);
                     }
                     if (cmd.type === CommandType.IF_NOT_DOOR) {
                        const nextPos = getForwardPos(currentPos, currentDir);
                        conditionTrue = !(nextPos.x >= 0 && nextPos.x < level.gridSize && level.layout[nextPos.y]?.[nextPos.x] === CellType.DOOR);
                     }
                     if (cmd.type === CommandType.IF_NOT_PATH_LEFT) {
                        const leftDir = (currentDir + 3) % 4;
                        const nextPos = getForwardPos(currentPos, leftDir);
                        conditionTrue = isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                    } 
                    if (cmd.type === CommandType.IF_NOT_PATH_RIGHT) {
                        const rightDir = (currentDir + 1) % 4;
                        const nextPos = getForwardPos(currentPos, rightDir);
                        conditionTrue = isWall(nextPos.x, nextPos.y, level.layout, isDoorUnlocked, Array.from(brokenSet));
                    }
                    if (cmd.type === CommandType.IF_NOT_TILE_ITEM) conditionTrue = !((cellUnder === CellType.COLLECTIBLE || cellUnder === CellType.BATTERY) && !collectedSet.has(`${currentPos.x}-${currentPos.y}`));
                    if (cmd.type === CommandType.IF_NOT_TILE_KEY) conditionTrue = !((cellUnder === CellType.KEY) && !collectedSet.has(`${currentPos.x}-${currentPos.y}`));
                    if (cmd.type === CommandType.IF_NOT_HAS_KEY) conditionTrue = !hasKey;
                    if (cmd.type === CommandType.IF_NOT_HAS_ITEMS) conditionTrue = (collectedCount + (hasKey ? 1 : 0)) !== (cmd.value ?? 1);
                }

                setGameState(prev => ({ ...prev, activeLineIndex: commands.findIndex(c => c.id === cmd.id) }));
                await sleep(200);

                const fullBlock = cmds.slice(i + 1, endIdx);
                let ifBody = fullBlock;
                let elseBody: Command[] = [];
                
                let depth = 0;
                let elseSplitIndex = -1;
                for(let j=0; j<fullBlock.length; j++) {
                    const t = fullBlock[j].type;
                    if (CONDITIONAL_TYPES.includes(t)) depth++;
                    if (t === CommandType.END_IF) depth--;
                    if (t === CommandType.ELSE && depth === 0) {
                        elseSplitIndex = j;
                        break;
                    }
                }

                if (elseSplitIndex !== -1) {
                    ifBody = fullBlock.slice(0, elseSplitIndex);
                    elseBody = fullBlock.slice(elseSplitIndex + 1);
                }

                if (conditionTrue) {
                    await processSequence(ifBody);
                } else {
                    if (elseBody.length > 0) {
                        await processSequence(elseBody);
                    }
                }
                
                checkWinCondition();
                i = endIdx;
                continue;
            }

            if (cmd.type === CommandType.ELSE || cmd.type === CommandType.LOOP_END || cmd.type === CommandType.END_IF || cmd.type === CommandType.WHILE_END) {
                continue;
            }

            const globalIndex = commands.findIndex(c => c.id === cmd.id);
            await executeCommand(cmd, globalIndex);
            checkWinCondition(); 
        }
    };

    try {
        await processSequence(commands);
        
        const isAtGoal = level.layout[currentPos.y][currentPos.x] === CellType.GOAL;
        const collectedEnough = !level.requiredCollectibles || collectedCount >= level.requiredCollectibles;

        if (isAtGoal && collectedEnough) {
            setGameState(prev => ({ ...prev, status: 'won', activeLineIndex: -1 }));
            if (!isTestingLevel) saveProgress(currentLevelIndex);
        } else if (isAtGoal && !collectedEnough) {
             throw new Error(`Et falta energia/items! Has recollit ${collectedCount} de ${level.requiredCollectibles}.`);
        } else {
             throw new Error("No has arribat a la meta.");
        }
    } catch (e: any) {
        if (e.message === "STOPPED") {
             // Handled
        } else if (e.message === "__VICTORY__") {
            setGameState(prev => ({ ...prev, status: 'won', activeLineIndex: -1 }));
            if (!isTestingLevel) saveProgress(currentLevelIndex);
        } else {
            setGameState(prev => ({ ...prev, status: 'lost', errorMsg: e.message, activeLineIndex: -1 }));
        }
    }
  };

  const handleNextLevel = () => {
    if (isTestingLevel) {
        setView('editor');
        setIsTestingLevel(false);
    } else if (currentLevelIndex < LEVEL_DATA.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      // Clean state for next level
      setLevelCompletionCode(null);
    } else {
        setView('world1'); // Back to map if finished
    }
  };

  const handleBack = () => {
      if (isTestingLevel) {
          setView('editor');
          setIsTestingLevel(false);
      } else {
          setView(view === 'game' ? 'world1' : 'menu'); // Simple back logic
      }
  };

  const selectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    setIsTestingLevel(false);
    setEditorState(undefined); 
    setView('game');
  };

  const handleTestLevel = (customLevel: Level) => {
      setEditorState(customLevel);
      setLevel(customLevel);
      resetLevel(customLevel);
      setCommands([]);
      setIsTestingLevel(true);
      setView('game');
  };

  // --- VIEWS ---

  if (view === 'menu') {
      return (
          <MainMenu 
            onSelectWorld1={() => setView('world1')}
            onSelectWorld2={() => setView('world2')}
            onSelectEditor={() => {
                setEditorState(undefined);
                setView('editor');
            }}
          />
      );
  }

  if (view === 'world1') {
      return (
          <AdventureMap 
            title="Món 1: L'Illa del Codi"
            levels={LEVEL_DATA}
            maxUnlockedLevel={maxUnlockedLevel} 
            onSelectLevel={selectLevel} 
            onBack={() => setView('menu')}
            onUnlockCode={handleUnlockCode}
          />
      );
  }
  
  if (view === 'world2') {
     // Placeholder for World 2
     if (WORLD_2_DATA.length === 0) {
         return (
             <div className="min-h-screen bg-black flex flex-col items-center justify-center font-['Press_Start_2P'] text-white">
                 <h1 className="text-2xl mb-4 text-blue-400">MÓN 2</h1>
                 <p className="text-xs mb-8 text-center px-4">Aquest món contindrà els nivells creats pels alumnes.</p>
                 <button onClick={() => setView('menu')} className="bg-yellow-400 text-black px-4 py-2 border-2 border-white">Tornar</button>
             </div>
         );
     }
     return (
          <AdventureMap 
            title="Món 2: Reptes"
            levels={WORLD_2_DATA} // Needs to be compatible type
            maxUnlockedLevel={999} // World 2 unlocked by default or manage separately
            onSelectLevel={(idx) => {
                // Logic for World 2 selection
                console.log("World 2 level selected", idx);
            }} 
            onBack={() => setView('menu')}
            onUnlockCode={() => false}
          />
      );
  }

  if (view === 'editor') {
      return (
        <LevelEditor 
            onBack={() => setView('menu')} 
            onTest={handleTestLevel} 
            initialLevel={editorState} 
        />
      );
  }

  // GAME VIEW

  const getEnergyColor = () => {
    if (gameState.energy <= 5) return 'bg-red-500';
    if (gameState.energy <= 20) return 'bg-orange-500';
    return 'bg-green-500';
  }

  const getDirText = (dir: Direction) => {
    switch(dir) {
        case Direction.NORTH: return 'Nord';
        case Direction.EAST: return 'Est';
        case Direction.SOUTH: return 'Sud';
        case Direction.WEST: return 'Oest';
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-pixel text-xs md:text-sm select-none bg-mario-sky">
      {/* HEADER */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-[#e0e0e0] border-b-8 border-black p-4 flex flex-col md:flex-row justify-between items-center z-20 shadow-[0_8px_0_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center gap-4 mb-2 md:mb-0 w-full md:w-auto justify-between md:justify-start">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBack} 
              className="bg-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-yellow-300 transition-colors"
            >
                <ArrowLeft size={24} className="text-black" />
            </motion.button>
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    <Gamepad2 size={28} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm md:text-xl font-bold text-black pixel-text-shadow text-white uppercase tracking-wider hidden md:block">
                        {isTestingLevel ? "MODE PROVA" : "CodiAventura"}
                    </h1>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
             <AnimatePresence>
               {gameState.hasKey && (
                   <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-black p-2 border-4 border-yellow-500 flex items-center gap-2"
                   >
                       <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Key size={16} className="text-yellow-400" />
                       </motion.div>
                       <span className="text-yellow-400 text-[10px] font-bold">CLAU</span>
                   </motion.div>
               )}
             </AnimatePresence>
             
             <div className="flex items-center gap-2 bg-black px-4 py-2 text-white border-4 border-gray-600 w-full md:w-auto justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                <BookOpen size={16} className="text-yellow-400"/>
                <span className="font-bold flex gap-2 uppercase tracking-tighter">
                    <span className="text-gray-400">LVL {level.id}:</span>
                    <span className="text-yellow-300">{level.title}</span>
                </span>
             </div>
             
             <div className="flex items-center gap-2 bg-black px-4 py-2 border-4 border-gray-600 w-full md:w-auto justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" fill="gold"/>
                    <span className="text-white text-[10px] font-bold mr-2 uppercase">ENERGIA</span>
                </div>
                <div className="relative w-32 h-6 bg-gray-800 border-4 border-gray-500 p-0.5">
                     <div 
                        className={`h-full transition-all duration-300 ${getEnergyColor()}`}
                        style={{ width: `${Math.min(100, (gameState.energy / (level.initialEnergy || 1)) * 100)}%` }}
                     ></div>
                     <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-[2px_2px_0_#000] z-10">
                        {gameState.energy}
                     </span>
                </div>
             </div>
        </div>
      </motion.header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-mario-sky overflow-visible lg:overflow-y-auto lg:max-h-[calc(100vh-100px)] custom-scrollbar">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-[#f8d878] p-6 border-8 border-black shadow-[8px_8px_0_rgba(0,0,0,0.3)] text-black"
            >
                <h2 className="text-black font-bold mb-4 flex items-center gap-2 text-sm uppercase border-b-4 border-black pb-2">
                    <Trophy size={18} className="text-yellow-600" /> Missió
                </h2>
                <p className="text-[10px] md:text-xs leading-relaxed font-bold uppercase tracking-tight">
                    {level.description}
                </p>
                {level.requiredCollectibles && (
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="mt-4 text-[10px] bg-black text-yellow-400 px-3 py-1 inline-block border-4 border-white font-bold"
                    >
                         ★ x {level.requiredCollectibles}
                    </motion.div>
                )}
            </motion.div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 overflow-hidden border-8 border-black bg-slate-900/50 min-h-[300px] lg:min-h-0"
            >
                 <ControlPanel 
                    level={level} 
                    onAddCommand={addCommand} 
                    disabled={gameState.status === 'running' || commands.length >= level.maxCommands}
                />
            </motion.div>
        </div>

        {/* CENTER PANEL */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative p-4 order-1 lg:order-2">
            <AnimatePresence>
              {gameState.status === 'won' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm"
                  >
                      <motion.div 
                        initial={{ scale: 0.5, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#f8d878] p-10 border-8 border-black shadow-[16px_16px_0_rgba(0,0,0,0.4)] text-center max-w-md w-full mx-4"
                      >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Trophy size={64} className="text-yellow-600 mx-auto mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-black mb-6 uppercase pixel-text-shadow text-white tracking-tighter">Nivell Superat!</h2>
                          
                          {levelCompletionCode && (
                              <div className="mb-8 bg-white p-6 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                                  <p className="text-[10px] mb-3 font-bold uppercase text-slate-600">Codi de Desbloqueig:</p>
                                  <div className="text-3xl font-mono tracking-widest font-bold bg-black text-green-400 p-4 border-4 border-gray-700 select-all">
                                      {levelCompletionCode}
                                  </div>
                                  <p className="text-[8px] mt-3 text-slate-500 font-bold uppercase">Anota aquest codi per continuar!</p>
                              </div>
                          )}

                          <div className="flex gap-4 justify-center">
                              <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleBack}
                                  className="bg-slate-600 hover:bg-slate-500 text-white py-4 px-8 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-bold uppercase text-[10px]"
                              >
                                  {isTestingLevel ? "Tornar Editor" : "Mapa"}
                              </motion.button>
                              {!isTestingLevel && (
                                  <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleNextLevel}
                                      className="bg-green-500 hover:bg-green-400 text-white py-4 px-8 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-bold uppercase text-[10px]"
                                  >
                                      Següent
                                  </motion.button>
                              )}
                          </div>
                      </motion.div>
                  </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {gameState.status === 'lost' && (
                   <motion.div 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="absolute top-4 z-40 flex justify-center w-full"
                   >
                      <div className="bg-red-600 text-white px-8 py-6 border-8 border-black shadow-[8px_8px_0_rgba(0,0,0,0.3)] flex items-center gap-4 max-w-lg">
                          <AlertTriangle size={32} className="text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]"/>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">{gameState.errorMsg || "Game Over"}</span>
                            <button onClick={() => setGameState(prev => ({...prev, status: 'idle'}))} className="text-[8px] uppercase underline text-red-200 font-bold text-left">Tancar</button>
                          </div>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>

            <GridComponent level={level} gameState={gameState} />
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] text-black bg-white px-8 py-4 border-8 border-black shadow-[8px_8px_0_rgba(0,0,0,0.2)] font-bold w-full max-w-xl"
            >
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-2 border-4 border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    <MapPin size={16} className="text-red-600"/>
                    <span className="uppercase">POS: {gameState.robotPos.x},{gameState.robotPos.y}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-2 border-4 border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    <Compass size={16} className="text-blue-600"/>
                    <span className="uppercase">DIR: {getDirText(gameState.robotDir)}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-2 border-4 border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    <Box size={16} className="text-green-600"/>
                    <span className="uppercase">BLOCS: {commands.length}/{level.maxCommands}</span>
                </div>
            </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 h-[600px] lg:h-full overflow-hidden order-3"
        >
            <ProgramDisplay 
                commands={commands}
                onRemove={removeCommand}
                onRun={runProgram}
                onStop={stopProgram}
                onReset={() => resetLevel(level)}
                onClear={() => setCommands([])}
                onUpdateValue={updateCommandValue}
                onReorder={reorderCommands}
                isRunning={gameState.status === 'running'}
                activeLineIndex={gameState.activeLineIndex}
                maxCommands={level.maxCommands}
            />
        </motion.div>
      </main>
    </div>
  );
}

export default App;
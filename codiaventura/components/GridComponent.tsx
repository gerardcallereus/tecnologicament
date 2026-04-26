import React from 'react';
import { CellType, Direction, GameState, Level } from '../types';
import { Bot, Zap, Lock, LockKeyholeOpen, Hammer, Waves, Key, Star, Flag, ArrowBigUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GridComponentProps {
  level: Level;
  gameState: GameState;
}

const GridComponent: React.FC<GridComponentProps> = ({ level, gameState }) => {
  const { layout, gridSize, gridHeight } = level;
  const { robotPos, robotDir, collectedCoords, doorUnlocked, brokenWalls, bridges } = gameState;

  const width = gridSize;
  const height = gridHeight || gridSize;
  
  const arrowSize = width > 8 ? 20 : 32;

  const getRotation = (dir: Direction) => {
    switch (dir) {
      case Direction.NORTH: return 0;
      case Direction.EAST: return 90;
      case Direction.SOUTH: return 180;
      case Direction.WEST: return 270;
      default: return 0;
    }
  };

  return (
    <div 
      className="relative bg-[#000] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-black overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        gap: '0px', 
        width: '100%',
        maxWidth: '70vh', 
        margin: '0 auto',
        aspectRatio: `${width}/${height}`
      }}
    >
      {layout.map((row, y) => (
        row.map((cell, x) => {
          const isRobotHere = robotPos.x === x && robotPos.y === y;
          const coordKey = `${x}-${y}`;
          const isCollected = collectedCoords.includes(coordKey);
          const isBroken = brokenWalls?.includes(coordKey);
          const hasDynamicBridge = bridges?.includes(coordKey);
          const isStaticBridge = cell === CellType.BRIDGE;
          const hasBridge = hasDynamicBridge || isStaticBridge;
          
          let cellContent = null;
          let cellStyle = "bg-[#2ecc71] border-[1px] border-black/10"; // Grass

          // --- TERRAIN ---
          if (cell === CellType.WALL) {
            cellStyle = "bg-[#b84900] border-4 border-black relative shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.3)]";
            cellContent = (
              <div className="absolute inset-0 flex flex-col justify-between py-1">
                <div className="h-1 w-full bg-black/20"></div>
                <div className="h-1 w-full bg-black/20"></div>
              </div>
            );
          } else if (cell === CellType.CRACKED_WALL) {
            if (isBroken) {
              cellStyle = "bg-[#5d4037] border-[1px] border-black/20";
            } else {
              cellStyle = "bg-gray-600 border-4 border-black relative shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)]";
              cellContent = <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">#</div>;
            }
          } else if (cell === CellType.HAZARD) {
            cellStyle = "bg-[#e74c3c] border-2 border-red-900 overflow-hidden";
            cellContent = (
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ff6b6b_0%,_#c0392b_100%)]"
              />
            );
          } else if (cell === CellType.WATER || cell === CellType.BRIDGE) {
            cellStyle = "bg-[#3498db] relative border border-blue-700 overflow-hidden";
            if (hasBridge) {
              cellContent = (
                <div className="absolute inset-0 bg-[#8d6e63] flex flex-col justify-between p-1 border-2 border-black z-10 shadow-lg">
                  <div className="h-1 bg-black/20 w-full"></div>
                  <div className="h-1 bg-black/20 w-full"></div>
                </div>
              );
            } else {
              cellContent = (
                <motion.div 
                  animate={{ x: [-10, 0, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,transparent_10px,transparent_20px)]"
                />
              );
            }
          } else if (cell === CellType.HOLE) {
            cellStyle = "bg-black";
          } else if (cell === CellType.PAINT_RED) {
            cellStyle = "bg-red-500/80 border-2 border-red-900";
          } else if (cell === CellType.PAINT_BLUE) {
            cellStyle = "bg-blue-500/80 border-2 border-blue-900";
          } else if (cell === CellType.PAINT_GREEN) {
            cellStyle = "bg-green-500/80 border-2 border-green-900";
          }

          // --- OBJECTS ---
          let objectContent = null;

          if (cell === CellType.GOAL) {
            objectContent = (
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <Flag className="text-white fill-red-600 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] w-3/4 h-3/4" strokeWidth={3} />
              </motion.div>
            );
          } else if (cell === CellType.COLLECTIBLE && !isCollected) {
            objectContent = (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <Star size={24} className="text-yellow-400 fill-yellow-400 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" strokeWidth={3} stroke="black" />
              </motion.div>
            );
          } else if (cell === CellType.KEY && !isCollected) {
            objectContent = (
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <Key size={24} className="text-yellow-400 fill-yellow-400 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" strokeWidth={3} stroke="black" />
              </motion.div>
            );
          } else if (cell === CellType.BATTERY && !isCollected) {
            objectContent = (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <Zap size={24} className="text-green-400 fill-green-400 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" stroke="black" strokeWidth={3} />
              </motion.div>
            );
          } else if (cell === CellType.DOOR) {
            cellStyle = "bg-[#5d4037] border-4 border-black relative shadow-inner"; 
            objectContent = (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div 
                  animate={doorUnlocked ? { scale: 0.8, opacity: 0.5 } : { scale: 1, opacity: 1 }}
                  className="w-3/4 h-3/4 bg-[#3e2723] border-4 border-black flex items-center justify-center shadow-lg"
                >
                  {doorUnlocked ? 
                    <LockKeyholeOpen className="text-green-400 w-2/3 h-2/3" /> : 
                    <Lock className="text-red-500 w-2/3 h-2/3" />
                  }
                </motion.div>
              </div>
            );
          }

          return (
            <div 
              key={`${x}-${y}`} 
              className={`relative aspect-square flex items-center justify-center ${isRobotHere ? 'z-40' : 'z-0'}`}
            >
              <div className={`absolute inset-0 w-full h-full ${cellStyle}`}>
                {cellContent}
              </div>

              <AnimatePresence>
                {objectContent}
              </AnimatePresence>
              
              {isRobotHere && (
                <motion.div 
                  layoutId="robot"
                  initial={false}
                  animate={{ 
                    x: 0, 
                    y: 0, 
                    rotate: getRotation(robotDir) 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center z-50"
                >
                  <div className="relative w-[90%] h-[90%] bg-slate-200 rounded-none border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,0.5)] flex items-center justify-center overflow-visible">
                    <Bot className="text-slate-800 w-full h-full p-1" strokeWidth={2} />
                    
                    <motion.div 
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 z-30"
                    >
                      <ArrowBigUp 
                        size={arrowSize} 
                        className="fill-yellow-400 text-black stroke-[3px] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" 
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default GridComponent;
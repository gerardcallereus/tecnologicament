import React from 'react';
import { CommandType, Level } from '../types';
import { ArrowUp, RotateCcw, RotateCw, Repeat, CornerDownRight, Grab, GitBranch, Infinity as InfinityIcon, Split, Key, Palette, RefreshCcw, ChevronsUp, ArrowUpFromDot, Hammer, BrickWall, ScanLine, HelpCircle, ShoppingBag, Waves, Flame, DoorOpen, Ban } from 'lucide-react';
import { COMMAND_DESCRIPTIONS } from '../constants';
import { motion } from 'motion/react';

interface ControlPanelProps {
  level: Level;
  onAddCommand: (type: CommandType) => void;
  disabled: boolean;
}

// Define categories and their command order
const CATEGORIES = {
  "Moviment": [
    CommandType.FORWARD,
    CommandType.FORWARD_VAR,
    CommandType.TURN_LEFT,
    CommandType.TURN_RIGHT,
    CommandType.TURN_AROUND,
    CommandType.JUMP
  ],
  "Accions": [
    CommandType.PICKUP,
    CommandType.HAMMER,
    CommandType.BUILD_BRIDGE,
    CommandType.UNLOCK_DOOR
  ],
  "Control de Flux": [
    CommandType.LOOP_START,
    CommandType.LOOP_END,
    CommandType.WHILE_START,
    CommandType.WHILE_END
  ],
  "Sensors i Condicions": [
    CommandType.ELSE, 
    CommandType.END_IF, // Moved here
    
    // Walls/Obstacles
    CommandType.IF_WALL,
    CommandType.IF_NOT_WALL,
    
    // Water
    CommandType.IF_WATER,
    CommandType.IF_NOT_WATER,

    // Hazard
    CommandType.IF_HAZARD,
    CommandType.IF_NOT_HAZARD,

    // Door
    CommandType.IF_DOOR,
    CommandType.IF_NOT_DOOR,

    // Path
    CommandType.IF_PATH_LEFT,
    CommandType.IF_NOT_PATH_LEFT,
    CommandType.IF_PATH_RIGHT,
    CommandType.IF_NOT_PATH_RIGHT,

    // Colors
    CommandType.IF_RED,
    CommandType.IF_NOT_RED,
    CommandType.IF_BLUE,
    CommandType.IF_NOT_BLUE,
    CommandType.IF_GREEN,
    CommandType.IF_NOT_GREEN,

    // Tiles
    CommandType.IF_TILE_ITEM,
    CommandType.IF_NOT_TILE_ITEM,
    CommandType.IF_TILE_KEY,
    CommandType.IF_NOT_TILE_KEY,

    // Inventory
    CommandType.IF_HAS_KEY,
    CommandType.IF_NOT_HAS_KEY,
    CommandType.IF_HAS_ITEMS,
    CommandType.IF_NOT_HAS_ITEMS,
  ]
};

const ControlPanel: React.FC<ControlPanelProps> = ({ level, onAddCommand, disabled }) => {
  const getIcon = (type: CommandType, size: number = 20) => {
    // Helper for "NOT" icons - we layer a Ban icon or just return the base icon
    const banSize = size * 0.6;
    
    switch (type) {
      case CommandType.FORWARD: return <ArrowUp size={size} />;
      case CommandType.FORWARD_VAR: return <ChevronsUp size={size} />;
      case CommandType.JUMP: return <ArrowUpFromDot size={size} />;
      case CommandType.HAMMER: return <Hammer size={size} />;
      case CommandType.BUILD_BRIDGE: return <BrickWall size={size} />;
      case CommandType.TURN_LEFT: return <RotateCcw size={size} />;
      case CommandType.TURN_RIGHT: return <RotateCw size={size} />;
      case CommandType.TURN_AROUND: return <RefreshCcw size={size} />;
      case CommandType.LOOP_START: return <Repeat size={size} />;
      case CommandType.LOOP_END: return <CornerDownRight size={size} />;
      case CommandType.WHILE_START: return <InfinityIcon size={size} />;
      case CommandType.WHILE_END: return <CornerDownRight size={size} />;
      case CommandType.PICKUP: return <Grab size={size} />;
      
      case CommandType.IF_WALL: return <GitBranch size={size} />;
      case CommandType.IF_NOT_WALL: return <div className="relative" style={{width: size, height: size}}><GitBranch size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;
      
      case CommandType.IF_WATER: return <Waves size={size} />;
      case CommandType.IF_NOT_WATER: return <div className="relative" style={{width: size, height: size}}><Waves size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_HAZARD: return <Flame size={size} />;
      case CommandType.IF_NOT_HAZARD: return <div className="relative" style={{width: size, height: size}}><Flame size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_DOOR: return <DoorOpen size={size} />;
      case CommandType.IF_NOT_DOOR: return <div className="relative" style={{width: size, height: size}}><DoorOpen size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_PATH_LEFT: return <GitBranch size={size} className="rotate-90" />;
      case CommandType.IF_NOT_PATH_LEFT: return <div className="relative" style={{width: size, height: size}}><GitBranch size={size} className="rotate-90" /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_PATH_RIGHT: return <GitBranch size={size} className="-rotate-90" />;
      case CommandType.IF_NOT_PATH_RIGHT: return <div className="relative" style={{width: size, height: size}}><GitBranch size={size} className="-rotate-90" /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_TILE_ITEM: return <ScanLine size={size} />;
      case CommandType.IF_NOT_TILE_ITEM: return <div className="relative" style={{width: size, height: size}}><ScanLine size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_TILE_KEY: return <Key size={size} />;
      case CommandType.IF_NOT_TILE_KEY: return <div className="relative" style={{width: size, height: size}}><Key size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_HAS_KEY: return <Key size={size} className="text-yellow-400" />;
      case CommandType.IF_NOT_HAS_KEY: return <div className="relative" style={{width: size, height: size}}><Key size={size} className="text-gray-400" /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.IF_HAS_ITEMS: return <ShoppingBag size={size} />;
      case CommandType.IF_NOT_HAS_ITEMS: return <div className="relative" style={{width: size, height: size}}><ShoppingBag size={size} /><Ban size={banSize} className="absolute -top-1 -right-1 text-red-500" /></div>;

      case CommandType.ELSE: return <Split size={size} />;
      case CommandType.END_IF: return <CornerDownRight size={size} />;
      
      case CommandType.IF_RED: return <Palette size={size} className="text-red-200" />;
      case CommandType.IF_NOT_RED: return <div className="relative" style={{width: size, height: size}}><Palette size={size} className="text-red-200" /><Ban size={banSize} className="absolute -top-1 -right-1 text-white" /></div>;

      case CommandType.IF_BLUE: return <Palette size={size} className="text-blue-200" />;
      case CommandType.IF_NOT_BLUE: return <div className="relative" style={{width: size, height: size}}><Palette size={size} className="text-blue-200" /><Ban size={banSize} className="absolute -top-1 -right-1 text-white" /></div>;

      case CommandType.IF_GREEN: return <Palette size={size} className="text-green-200" />;
      case CommandType.IF_NOT_GREEN: return <div className="relative" style={{width: size, height: size}}><Palette size={size} className="text-green-200" /><Ban size={banSize} className="absolute -top-1 -right-1 text-white" /></div>;

      case CommandType.UNLOCK_DOOR: return <Key size={size} />;
      default: return <HelpCircle size={size} />;
    }
  };

  const getColor = (type: CommandType) => {
     switch (type) {
      case CommandType.FORWARD: 
      case CommandType.FORWARD_VAR: 
      case CommandType.JUMP: return 'bg-blue-600 hover:bg-blue-500 border-blue-800';
      case CommandType.HAMMER: 
      case CommandType.BUILD_BRIDGE: return 'bg-orange-700 hover:bg-orange-600 border-orange-900';
      case CommandType.TURN_LEFT: 
      case CommandType.TURN_RIGHT: 
      case CommandType.TURN_AROUND: return 'bg-purple-600 hover:bg-purple-500 border-purple-800';
      case CommandType.LOOP_START: 
      case CommandType.LOOP_END: 
      case CommandType.END_IF: return 'bg-orange-600 hover:bg-orange-500 border-orange-800'; // END_IF changed to orange like LOOP_END
      case CommandType.WHILE_START: 
      case CommandType.WHILE_END: return 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800';
      case CommandType.PICKUP: return 'bg-yellow-600 hover:bg-yellow-500 border-yellow-800';
      case CommandType.ELSE: return 'bg-pink-700 hover:bg-pink-600 border-pink-900';
      
      // All IF conditions (Positive and Negative)
      case CommandType.IF_WALL:
      case CommandType.IF_NOT_WALL:
      case CommandType.IF_WATER:
      case CommandType.IF_NOT_WATER:
      case CommandType.IF_HAZARD:
      case CommandType.IF_NOT_HAZARD:
      case CommandType.IF_DOOR:
      case CommandType.IF_NOT_DOOR:
      case CommandType.IF_PATH_LEFT:
      case CommandType.IF_NOT_PATH_LEFT:
      case CommandType.IF_PATH_RIGHT: 
      case CommandType.IF_NOT_PATH_RIGHT: 
      case CommandType.IF_TILE_ITEM:
      case CommandType.IF_NOT_TILE_ITEM:
      case CommandType.IF_TILE_KEY:
      case CommandType.IF_NOT_TILE_KEY:
      case CommandType.IF_HAS_KEY:
      case CommandType.IF_NOT_HAS_KEY:
      case CommandType.IF_HAS_ITEMS:
      case CommandType.IF_NOT_HAS_ITEMS:
        return 'bg-pink-600 hover:bg-pink-500 border-pink-800';
      
      case CommandType.IF_RED: 
      case CommandType.IF_NOT_RED: return 'bg-red-600 hover:bg-red-500 border-red-800';
      
      case CommandType.IF_BLUE: 
      case CommandType.IF_NOT_BLUE: return 'bg-blue-600 hover:bg-blue-500 border-blue-800';
      
      case CommandType.IF_GREEN: 
      case CommandType.IF_NOT_GREEN: return 'bg-green-600 hover:bg-green-500 border-green-800';
      
      case CommandType.UNLOCK_DOOR: return 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800';
      default: return 'bg-slate-600';
    }
  }

  // Create a set for O(1) lookup
  const availableSet = new Set(level.availableCommands);

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/80 border-4 border-black h-full overflow-y-auto custom-scrollbar">
      {Object.entries(CATEGORIES).map(([categoryName, commandTypes]) => {
        const commandsInCategory = commandTypes.filter(cmd => availableSet.has(cmd));
        if (commandsInCategory.length === 0) return null;

        return (
          <div key={categoryName} className="flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest px-2 py-1 bg-black/40 border-l-4 border-yellow-400">
              {categoryName}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commandsInCategory.map((cmd) => {
                  const info = COMMAND_DESCRIPTIONS[cmd] || { label: cmd, desc: '' };
                  return (
                    <motion.button
                      key={cmd}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 0 }}
                      onClick={() => onAddCommand(cmd)}
                      disabled={disabled}
                      className={`
                          ${getColor(cmd)} 
                          text-white p-2 border-b-4 shadow-[4px_4px_0_rgba(0,0,0,0.5)]
                          flex flex-col items-center justify-center gap-1
                          disabled:opacity-50 disabled:cursor-not-allowed
                          h-16 w-full transition-colors
                      `}
                      title={info.desc}
                    >
                      {getIcon(cmd, 18)}
                      <span className="text-[7px] font-bold text-center leading-tight line-clamp-2 uppercase">
                        {info.label}
                      </span>
                    </motion.button>
                  );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ControlPanel;
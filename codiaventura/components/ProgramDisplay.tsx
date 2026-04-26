import React, { useState } from 'react';
import { Command, CommandType } from '../types';
import { Trash2, RefreshCw, GripVertical, Minus, Plus, Box, Square, Play } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';

interface ProgramDisplayProps {
  commands: Command[];
  onRemove: (id: string) => void;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onClear: () => void;
  onUpdateValue?: (id: string, newValue: number) => void;
  onReorder?: (newCommands: Command[]) => void; 
  isRunning: boolean;
  activeLineIndex: number;
  maxCommands: number;
}

const ProgramDisplay: React.FC<ProgramDisplayProps> = ({ 
  commands, onRemove, onRun, onStop, onReset, onClear, onUpdateValue, onReorder, isRunning, activeLineIndex, maxCommands
}) => {
  
  const getIndentedCommands = () => {
    let currentIndent = 0;
    return commands.map(cmd => {
        if (cmd.type === CommandType.LOOP_END || 
            cmd.type === CommandType.END_IF || 
            cmd.type === CommandType.WHILE_END ||
            cmd.type === CommandType.ELSE) {
            currentIndent = Math.max(0, currentIndent - 1);
        }

        const indent = currentIndent;

        if (cmd.type === CommandType.LOOP_START || 
            cmd.type === CommandType.WHILE_START || 
            cmd.type === CommandType.ELSE ||
            cmd.type.startsWith('IF_')) {
            currentIndent++;
        }
        
        return { ...cmd, indent };
    });
  };

  const indentedCommands = getIndentedCommands();

  const getStyle = (type: CommandType) => {
     if (type.startsWith('IF_') || type === CommandType.ELSE || type === CommandType.END_IF) {
         return 'text-pink-600 bg-pink-50 border-pink-400';
     }
     switch (type) {
      case CommandType.FORWARD: 
      case CommandType.FORWARD_VAR: 
      case CommandType.JUMP: return 'text-blue-600 bg-blue-50 border-blue-400';
      case CommandType.HAMMER: 
      case CommandType.BUILD_BRIDGE: return 'text-orange-800 bg-orange-100 border-orange-400';
      case CommandType.TURN_LEFT: 
      case CommandType.TURN_RIGHT: 
      case CommandType.TURN_AROUND: return 'text-purple-600 bg-purple-50 border-purple-400';
      case CommandType.LOOP_START: 
      case CommandType.LOOP_END: return 'text-orange-600 bg-orange-50 border-orange-400';
      case CommandType.WHILE_START: 
      case CommandType.WHILE_END: return 'text-indigo-600 bg-indigo-50 border-indigo-400';
      case CommandType.PICKUP: 
      case CommandType.UNLOCK_DOOR: return 'text-yellow-700 bg-yellow-50 border-yellow-400';
      default: return 'text-black bg-white border-gray-400';
    }
  };

  const updateValue = (cmd: Command, delta: number) => {
    if (isRunning || !onUpdateValue || cmd.value === undefined) return;
    const minVal = (cmd.type === CommandType.IF_HAS_ITEMS || cmd.type === CommandType.IF_NOT_HAS_ITEMS) ? 0 : 2;
    const maxVal = 20;
    const newVal = Math.max(minVal, Math.min(maxVal, cmd.value + delta)); 
    onUpdateValue(cmd.id, newVal);
  };

  const renderContent = (cmd: Command) => {
    switch(cmd.type) {
        case CommandType.FORWARD: return "AVANÇAR";
        case CommandType.FORWARD_VAR:
            return (
                <div className="flex items-center gap-2">
                    <span>AVANÇAR {cmd.value}</span>
                    <div className="flex gap-1 ml-2">
                         <button onClick={() => updateValue(cmd, -1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Minus size={12} />
                         </button>
                         <button onClick={() => updateValue(cmd, 1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Plus size={12} />
                         </button>
                    </div>
                </div>
            );
        case CommandType.JUMP: return "SALTAR";
        case CommandType.HAMMER: return "TRENCAR";
        case CommandType.BUILD_BRIDGE: return "FER PONT";
        case CommandType.TURN_LEFT: return "GIRAR ESQ";
        case CommandType.TURN_RIGHT: return "GIRAR DRETA";
        case CommandType.TURN_AROUND: return "GIRAR 180º";
        case CommandType.LOOP_START: 
            return (
                <div className="flex items-center gap-2">
                    <span>REPETIR {cmd.value}</span>
                    <div className="flex gap-1 ml-2">
                         <button onClick={() => updateValue(cmd, -1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Minus size={12} />
                         </button>
                         <button onClick={() => updateValue(cmd, 1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Plus size={12} />
                         </button>
                    </div>
                </div>
            );
        case CommandType.LOOP_END: return "FI REPETIR";
        case CommandType.WHILE_START: return "MENTRE";
        case CommandType.WHILE_END: return "FI MENTRE";
        case CommandType.IF_WALL: return "SI MUR";
        case CommandType.IF_WATER: return "SI AIGUA";
        case CommandType.IF_HAZARD: return "SI LAVA";
        case CommandType.IF_DOOR: return "SI PORTA";
        case CommandType.IF_PATH_LEFT: return "SI CAMÍ ESQ.";
        case CommandType.IF_PATH_RIGHT: return "SI CAMÍ DRETA";
        case CommandType.IF_TILE_ITEM: return "SI CASELLA TÉ ITEM";
        case CommandType.IF_TILE_KEY: return "SI CASELLA TÉ CLAU";
        case CommandType.IF_HAS_KEY: return "SI TINC CLAU";
        case CommandType.IF_NOT_HAS_KEY: return "SI NO TINC CLAU";
        case CommandType.IF_HAS_ITEMS: 
             return (
                <div className="flex items-center gap-2">
                    <span>SI TINC {cmd.value} ITEM(S)</span>
                    <div className="flex gap-1 ml-2">
                         <button onClick={() => updateValue(cmd, -1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Minus size={12} />
                         </button>
                         <button onClick={() => updateValue(cmd, 1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Plus size={12} />
                         </button>
                    </div>
                </div>
            );
        case CommandType.IF_NOT_HAS_ITEMS: 
             return (
                <div className="flex items-center gap-2">
                    <span>SI NO TINC {cmd.value} ITEM(S)</span>
                    <div className="flex gap-1 ml-2">
                         <button onClick={() => updateValue(cmd, -1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Minus size={12} />
                         </button>
                         <button onClick={() => updateValue(cmd, 1)} className="bg-black text-white p-1 border-b-2 border-gray-700 active:border-b-0 active:translate-y-[1px] flex items-center justify-center w-5 h-5">
                            <Plus size={12} />
                         </button>
                    </div>
                </div>
            );
        case CommandType.ELSE: return "SI NO (ELSE)";
        case CommandType.END_IF: return "FI SI";
        case CommandType.IF_RED: return "SI VERMELL";
        case CommandType.IF_BLUE: return "SI BLAU";
        case CommandType.IF_GREEN: return "SI VERD";
        case CommandType.PICKUP: return "AGAFAR";
        case CommandType.UNLOCK_DOOR: return "OBRIR PORTA";
        default: return cmd.type;
    }
  }

  const usagePercent = Math.min(100, (commands.length / maxCommands) * 100);
  const isLimitReached = commands.length >= maxCommands;

  return (
    <div className="flex flex-col h-full bg-[#2d2d2d] border-8 border-black p-0 shadow-2xl select-none">
      <div className="bg-[#4a4a4a] p-4 text-white border-b-8 border-black flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                <Box size={16} className="text-yellow-400" /> PROGRAMA
            </span>
            <span className={`text-[8px] font-bold px-2 py-1 border-2 border-black ${isLimitReached ? 'bg-red-500 text-white' : 'bg-black text-green-400'}`}>
                {commands.length} / {maxCommands} BLOCS
            </span>
        </div>
        <div className="w-full h-4 bg-black border-2 border-gray-600 p-0.5">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className={`h-full transition-colors duration-300 ${isLimitReached ? 'bg-red-500' : 'bg-green-500'}`}
             ></motion.div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#1a1a1a] relative">
        {commands.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-[10px] font-bold opacity-50 gap-4 pointer-events-none">
             <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Box size={48} />
             </motion.div>
             <span className="uppercase tracking-widest">ARROSSEGA COMANDES AQUÍ</span>
          </div>
        )}
        
        <Reorder.Group 
            axis="y" 
            values={commands} 
            onReorder={(newOrder) => {
                if (newOrder.length === 0 && commands.length > 0) return;
                if (onReorder) onReorder(newOrder);
            }} 
            className="h-full overflow-y-auto p-4 space-y-2 custom-scrollbar" 
            layoutScroll
        >
            {commands.map((cmd, idx) => {
              const indent = indentedCommands[idx]?.indent || 0;
              return (
              <Reorder.Item 
                key={cmd.id} 
                value={cmd}
                dragListener={!isRunning}
                dragMomentum={false}
                className="relative"
              >
                <div 
                    className={`
                      flex justify-between items-center p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all
                      ${getStyle(cmd.type)}
                      ${activeLineIndex === idx ? 'ring-4 ring-yellow-400 z-10 scale-[1.02] brightness-125' : 'hover:brightness-110'}
                      cursor-grab active:cursor-grabbing
                    `}
                    style={{ 
                        marginLeft: `${indent * 16}px`,
                        width: `calc(100% - ${indent * 16}px)`
                    }}
                >
                    <div className="flex items-center gap-3">
                        <GripVertical size={16} className="opacity-30" />
                        <div className="font-bold text-[10px] uppercase tracking-tight">{renderContent(cmd)}</div>
                    </div>
                    {!isRunning && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(cmd.id); }} 
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-black/10 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                    )}
                </div>
              </Reorder.Item>
            )})}
        </Reorder.Group>
      </div>

      <div className="p-4 grid grid-cols-4 gap-4 bg-[#4a4a4a] border-t-8 border-black">
         {!isRunning ? (
             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRun}
                disabled={commands.length === 0}
                className="col-span-2 bg-green-500 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-green-400 active:shadow-none active:translate-x-1 active:translate-y-1 font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
             >
                <Play size={18} fill="currentColor" /> EXECUTAR
             </motion.button>
         ) : (
             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStop}
                className="col-span-2 bg-red-600 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-red-500 active:shadow-none active:translate-x-1 active:translate-y-1 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
             >
                <Square size={18} fill="currentColor" /> ATURAR
             </motion.button>
         )}
         
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          disabled={isRunning}
          className="bg-blue-500 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-blue-400 active:shadow-none active:translate-x-1 active:translate-y-1 font-bold disabled:opacity-50 flex items-center justify-center"
        >
          <RefreshCw size={20} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          disabled={isRunning}
          className="bg-red-500 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-red-400 active:shadow-none active:translate-x-1 active:translate-y-1 font-bold disabled:opacity-50 flex items-center justify-center"
        >
          <Trash2 size={20} />
        </motion.button>
      </div>
    </div>
  );
};

export default ProgramDisplay;
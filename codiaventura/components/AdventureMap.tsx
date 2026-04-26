import React, { useState } from 'react';
import { LEVEL_DATA } from '../constants';
import { Lock, Star, Crown, Castle, ArrowLeft, Unlock, Check, Cloud, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdventureMapProps {
  maxUnlockedLevel: number;
  onSelectLevel: (index: number) => void;
  onBack: () => void;
  title: string;
  levels: typeof LEVEL_DATA;
  onUnlockCode: (code: string) => boolean;
}

const AdventureMap: React.FC<AdventureMapProps> = ({ maxUnlockedLevel, onSelectLevel, onBack, title, levels, onUnlockCode }) => {
  
  const [code, setCode] = useState("");
  const [unlockStatus, setUnlockStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const success = onUnlockCode(code);
      if (success) {
          setUnlockStatus('success');
          setCode("");
          setTimeout(() => setUnlockStatus('idle'), 2000);
      } else {
          setUnlockStatus('error');
          setTimeout(() => setUnlockStatus('idle'), 2000);
      }
  };

  const ITEMS_PER_ROW = 4;
  const rows: any[][] = [];
  for (let i = 0; i < levels.length; i += ITEMS_PER_ROW) {
      const chunk = levels.slice(i, i + ITEMS_PER_ROW);
      rows.push(chunk);
  }

  return (
    <div className="min-h-screen bg-[#5c94fc] overflow-y-auto overflow-x-hidden font-pixel relative selection:bg-yellow-400 custom-scrollbar">
      
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div animate={{ x: [-100, 1000] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-10 left-0 text-white/40"><Cloud size={100} /></motion.div>
          <motion.div animate={{ x: [1000, -100] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute top-40 right-0 text-white/30"><Cloud size={80} /></motion.div>
          <motion.div animate={{ x: [-200, 1200] }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute bottom-40 left-0 text-white/20"><Cloud size={120} /></motion.div>
          
          <div className="absolute bottom-0 w-full h-64 bg-green-600/20"></div>
          <div className="absolute bottom-0 w-full h-48 bg-green-500/20 skew-y-1"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-12 flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex justify-between items-center px-6 mb-12"
        >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack} 
              className="bg-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-yellow-300"
            >
                <ArrowLeft size={24} className="text-black" />
            </motion.button>
            
            <div className="bg-black/40 px-8 py-4 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.3)] backdrop-blur-md text-center">
                <h1 className="text-xl md:text-3xl text-yellow-400 pixel-text-shadow uppercase tracking-tighter">
                    {title}
                </h1>
            </div>
            
            <div className="w-12"></div>
        </motion.div>

        {/* Unlock Code */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-16 bg-white/90 p-6 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.2)] w-11/12 max-w-md"
        >
            <h3 className="text-[10px] text-center mb-4 font-bold text-slate-700 uppercase tracking-widest">CODI DE GUARDAT</h3>
            <form onSubmit={handleCodeSubmit} className="flex gap-3">
                <input 
                    type="text" 
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="*****"
                    className="flex-1 bg-slate-100 border-4 border-black p-3 font-mono text-center tracking-[0.5em] uppercase focus:outline-none focus:bg-white"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className={`p-3 border-4 border-black text-white shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-colors ${unlockStatus === 'success' ? 'bg-green-500' : (unlockStatus === 'error' ? 'bg-red-500' : 'bg-blue-600')}`}
                >
                    {unlockStatus === 'success' ? <Check size={24}/> : <Unlock size={24}/>}
                </motion.button>
            </form>
            <AnimatePresence>
              {unlockStatus === 'error' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[8px] text-red-600 text-center mt-3 font-bold">CODI INCORRECTE!</motion.p>
              )}
              {unlockStatus === 'success' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[8px] text-green-600 text-center mt-3 font-bold">NIVELLS DESBLOQUEJATS!</motion.p>
              )}
            </AnimatePresence>
        </motion.div>

        {/* THE MAP */}
        <div className="flex flex-col gap-0 w-full px-6 items-center pb-32">
            {rows.map((rowLevels, rowIndex) => {
                const isReverse = rowIndex % 2 !== 0;
                const displayLevels = isReverse ? [...rowLevels].reverse() : rowLevels;
                
                return (
                    <div key={rowIndex} className="relative flex flex-col w-full max-w-2xl">
                        <div className={`flex justify-around items-center w-full py-12 relative ${isReverse ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Path Line */}
                            <div className="absolute top-1/2 left-10 right-10 h-6 bg-[#f8d878] border-y-4 border-black -z-10 shadow-inner"></div>
                            
                            {displayLevels.map((level: any) => {
                                const index = levels.findIndex(l => l.id === level.id);
                                const isUnlocked = index <= maxUnlockedLevel;
                                const isCompleted = index < maxUnlockedLevel;
                                const isCurrent = index === maxUnlockedLevel;

                                return (
                                    <div key={level.id} className="relative group">
                                        <motion.button 
                                            whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                                            whileTap={isUnlocked ? { scale: 0.9 } : {}}
                                            onClick={() => isUnlocked && onSelectLevel(index)}
                                            disabled={!isUnlocked}
                                            className={`
                                                w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-4 border-black
                                                transition-all duration-300 relative z-20
                                                ${isCompleted 
                                                    ? 'bg-yellow-400' 
                                                    : (isUnlocked ? 'bg-red-500' : 'bg-slate-800')}
                                                ${isCurrent ? 'shadow-[0_0_30px_rgba(255,255,0,0.8)]' : 'shadow-[4px_4px_0_rgba(0,0,0,0.5)]'}
                                                ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {isCurrent && (
                                              <motion.div 
                                                animate={{ y: [-10, 0, -10] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className="absolute -top-8 text-yellow-400 drop-shadow-[2px_2px_0_#000]"
                                              >
                                                ▼
                                              </motion.div>
                                            )}
                                            {isCompleted ? (
                                                <Star size={32} className="text-white drop-shadow-[2px_2px_0_#000]" fill="white" />
                                            ) : (
                                                isUnlocked ? (
                                                    <span className="text-white text-xl md:text-2xl pixel-text-shadow font-bold">{level.id}</span>
                                                ) : (
                                                    <Lock size={24} className="text-slate-500" />
                                                )
                                            )}
                                        </motion.button>

                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[7px] px-3 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border-2 border-white uppercase tracking-tighter">
                                            {level.title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Turn Connector */}
                        {rowIndex < rows.length - 1 && (
                            <div className={`absolute h-24 w-6 bg-[#f8d878] border-x-4 border-black -z-20 top-1/2 mt-6 
                                ${isReverse ? 'left-8 md:left-14' : 'right-8 md:right-14'}
                            `}></div>
                        )}
                    </div>
                );
            })}

            {/* End Game Castle */}
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              className={`flex flex-col items-center mt-8 relative z-10 
                 ${rows.length % 2 === 0 ? 'self-start ml-14' : 'self-end mr-14'}
            `}>
                 <div className="bg-[#f8d878] p-6 border-4 border-black rounded-t-[40px] shadow-[8px_8px_0_rgba(0,0,0,0.2)] relative flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [-10, 0, -10] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-10"
                    >
                        <Crown className="text-yellow-400 w-12 h-12 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" fill="gold" />
                    </motion.div>
                    <Castle className="text-pink-600 w-20 h-20" strokeWidth={1.5} />
                 </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdventureMap;
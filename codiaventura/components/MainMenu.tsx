import React from 'react';
import { Play, Map, Hammer, Info, Cloud } from 'lucide-react';
import { motion } from 'motion/react';

interface MainMenuProps {
  onSelectWorld1: () => void;
  onSelectWorld2: () => void;
  onSelectEditor: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectWorld1, onSelectWorld2, onSelectEditor }) => {
  return (
    <div className="min-h-screen bg-[#5c94fc] flex flex-col items-center justify-center font-pixel p-6 relative overflow-y-auto custom-scrollbar">
      
      {/* Background Clouds Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [-200, 1200] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-20 left-0 text-white/30"><Cloud size={120} /></motion.div>
        <motion.div animate={{ x: [1200, -200] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-60 right-0 text-white/20"><Cloud size={100} /></motion.div>
        <motion.div animate={{ x: [-300, 1500] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute bottom-40 left-0 text-white/10"><Cloud size={150} /></motion.div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 max-w-4xl w-full flex flex-col items-center gap-12"
      >
        
        {/* Title */}
        <div className="text-center">
          <motion.h1 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl md:text-8xl text-yellow-400 font-bold mb-6 pixel-text-shadow drop-shadow-[6px_6px_0_#000] uppercase tracking-tighter"
          >
            CodiAventura
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-sm md:text-2xl pixel-text-shadow uppercase tracking-widest"
          >
            L'Odissea del Robot
          </motion.h2>
        </div>

        {/* Description Box */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-[#f8d878] border-8 border-black p-8 shadow-[12px_12px_0_rgba(0,0,0,0.3)] max-w-2xl text-center relative"
        >
          <div className="absolute -top-6 -left-6 bg-blue-600 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <Info size={24} />
          </div>
          <p className="text-black text-xs md:text-sm leading-relaxed font-bold tracking-tight">
            Per poder tancar aquesta proposta hauràs de finalitzar el <span className="text-blue-700 underline decoration-4">Món 1</span> i crear un escenari nou en l'<span className="text-purple-700 underline decoration-4">Editor de Nivells</span>. 
            <br/><br/>
            Quan el teu nivell estigui acabat, hauràs d'enviar el codi generat a:
            <br/>
            <span className="bg-black text-yellow-400 px-4 py-2 mt-4 inline-block border-4 border-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] font-mono select-all text-sm">gerard.calle@ietramuntana.cat</span>
          </p>
        </motion.div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* World 1 */}
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelectWorld1}
            className="group bg-green-500 border-8 border-black p-8 shadow-[12px_12px_0_rgba(0,0,0,0.4)] hover:bg-green-400 transition-colors flex flex-col items-center gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-3 py-1 border-l-4 border-b-4 border-black font-bold uppercase">
              PRINCIPAL
            </div>
            <Play size={64} className="text-white drop-shadow-[4px_4px_0_#000] fill-white" />
            <div className="text-center">
              <h3 className="text-white text-xl font-bold pixel-text-shadow mb-2 uppercase">MÓN 1</h3>
              <span className="text-green-900 text-[10px] font-bold uppercase tracking-widest">L'Illa del Codi</span>
            </div>
          </motion.button>

          {/* World 2 */}
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelectWorld2}
            className="group bg-blue-500 border-8 border-black p-8 shadow-[12px_12px_0_rgba(0,0,0,0.4)] hover:bg-blue-400 transition-colors flex flex-col items-center gap-6 relative overflow-hidden"
          >
            <Map size={64} className="text-white drop-shadow-[4px_4px_0_#000]" />
            <div className="text-center">
              <h3 className="text-white text-xl font-bold pixel-text-shadow mb-2 uppercase">MÓN 2</h3>
              <span className="text-blue-900 text-[10px] font-bold uppercase tracking-widest">Reptes dels Alumnes</span>
            </div>
          </motion.button>

          {/* Editor */}
          <motion.button 
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectEditor}
            className="md:col-span-2 group bg-purple-600 border-8 border-black p-8 shadow-[12px_12px_0_rgba(0,0,0,0.4)] hover:bg-purple-500 transition-colors flex flex-row items-center justify-center gap-8"
          >
            <Hammer size={56} className="text-white drop-shadow-[4px_4px_0_#000]" />
            <div className="text-left">
              <h3 className="text-white text-2xl font-bold pixel-text-shadow mb-2 uppercase">EDITOR DE NIVELLS</h3>
              <span className="text-purple-200 text-[10px] font-bold uppercase tracking-widest">Crea, Prova i Comparteix</span>
            </div>
          </motion.button>

        </div>

        <div className="text-[10px] text-white/40 mt-12 uppercase tracking-[0.5em]">
            v1.1.0 - CodiAventura
        </div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
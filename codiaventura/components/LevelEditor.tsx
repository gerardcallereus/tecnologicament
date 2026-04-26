import React, { useState, useEffect } from 'react';
import { CellType, CommandType, Direction, Level } from '../types';
import { Save, ArrowLeft, Eraser, Box, Flag, Bot, Zap, Star, AlertTriangle, Lock, Palette, Grid3X3, Code, FileDown, Hammer, Waves, CircleDashed, Key, Play, BrickWall, HelpCircle, X, FileUp } from 'lucide-react';
import { LEVEL_DATA, COMMAND_DESCRIPTIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LevelEditorProps {
  onBack: () => void;
  onTest: (level: Level) => void;
  initialLevel?: Level;
}

const LevelEditor: React.FC<LevelEditorProps> = ({ onBack, onTest, initialLevel }) => {
  // Config State
  const [title, setTitle] = useState(initialLevel?.title || "El Meu Nivell");
  const [description, setDescription] = useState(initialLevel?.description || "Descripció del nivell...");
  
  // Dimensions
  const [gridWidth, setGridWidth] = useState(initialLevel?.gridSize || 9);
  const [gridHeight, setGridHeight] = useState(initialLevel?.gridHeight || initialLevel?.gridSize || 9);

  const [maxCommands, setMaxCommands] = useState(initialLevel?.maxCommands || 10);
  const [initialEnergy, setInitialEnergy] = useState(initialLevel?.initialEnergy || 50);
  const [reqCollectibles, setReqCollectibles] = useState(initialLevel?.requiredCollectibles || 0);
  
  // Grid State
  const [layout, setLayout] = useState<CellType[][]>(initialLevel?.layout || []);
  const [startPos, setStartPos] = useState(initialLevel?.startPos || { x: 1, y: 1 });
  const [startDir, setStartDir] = useState<Direction>(initialLevel?.startDir ?? Direction.EAST);

  // Tools
  const [selectedTool, setSelectedTool] = useState<CellType | 'START'>(CellType.WALL);
  const [availableCmds, setAvailableCmds] = useState<CommandType[]>(
      initialLevel?.availableCommands || [CommandType.FORWARD, CommandType.TURN_LEFT, CommandType.TURN_RIGHT]
  );

  // Output & UI State
  const [generatedCode, setGeneratedCode] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const EDITOR_CATEGORIES = {
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
        CommandType.END_IF, 
        CommandType.IF_WALL, CommandType.IF_NOT_WALL,
        CommandType.IF_WATER, CommandType.IF_NOT_WATER,
        CommandType.IF_HAZARD, CommandType.IF_NOT_HAZARD,
        CommandType.IF_DOOR, CommandType.IF_NOT_DOOR,
        CommandType.IF_PATH_LEFT, CommandType.IF_NOT_PATH_LEFT,
        CommandType.IF_PATH_RIGHT, CommandType.IF_NOT_PATH_RIGHT,
        CommandType.IF_RED, CommandType.IF_NOT_RED,
        CommandType.IF_BLUE, CommandType.IF_NOT_BLUE,
        CommandType.IF_GREEN, CommandType.IF_NOT_GREEN,
        CommandType.IF_TILE_ITEM, CommandType.IF_NOT_TILE_ITEM,
        CommandType.IF_TILE_KEY, CommandType.IF_NOT_TILE_KEY,
        CommandType.IF_HAS_KEY, CommandType.IF_NOT_HAS_KEY,
        CommandType.IF_HAS_ITEMS, CommandType.IF_NOT_HAS_ITEMS,
      ]
  };

  // Init Grid
  useEffect(() => {
    if (layout.length !== gridHeight || (layout[0] && layout[0].length !== gridWidth)) {
        const newLayout = Array(gridHeight).fill(null).map((_, y) => 
            Array(gridWidth).fill(null).map((_, x) => {
                if (layout[y] && layout[y][x] !== undefined) return layout[y][x];
                if (x === 0 || x === gridWidth - 1 || y === 0 || y === gridHeight - 1) return CellType.WALL;
                return CellType.EMPTY;
            })
        );
        setLayout(newLayout);
    }
  }, [gridWidth, gridHeight]);

  // Basic Parsing Logic to Import Code
  const handleImportCode = () => {
      try {
          // Extract basic fields using Regex
          const titleMatch = importText.match(/title:\s*"([^"]+)"/);
          const descMatch = importText.match(/description:\s*"([^"]+)"/);
          const widthMatch = importText.match(/gridSize:\s*(\d+)/);
          const heightMatch = importText.match(/gridHeight:\s*(\d+)/);
          const maxCmdMatch = importText.match(/maxCommands:\s*(\d+)/);
          const energyMatch = importText.match(/initialEnergy:\s*(\d+)/);
          const collectMatch = importText.match(/requiredCollectibles:\s*(\d+)/);
          
          const startPosMatch = importText.match(/startPos:\s*\{\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}/);
          const startDirMatch = importText.match(/startDir:\s*Direction\.([A-Z]+)/);

          // Extract Layout: Look for content between layout: [ and ]
          const layoutContentMatch = importText.match(/layout:\s*\[([\s\S]*?)\]\s*,\s*startPos/);
          
          // Extract Commands
          const cmdsMatch = importText.match(/availableCommands:\s*\[([\s\S]*?)\]/);

          if (titleMatch) setTitle(titleMatch[1]);
          if (descMatch) setDescription(descMatch[1]);
          if (widthMatch) setGridWidth(parseInt(widthMatch[1]));
          
          // Height might not be present in old code, default to width
          const h = heightMatch ? parseInt(heightMatch[1]) : (widthMatch ? parseInt(widthMatch[1]) : 9);
          setGridHeight(h);

          if (maxCmdMatch) setMaxCommands(parseInt(maxCmdMatch[1]));
          if (energyMatch) setInitialEnergy(parseInt(energyMatch[1]));
          if (collectMatch) setReqCollectibles(parseInt(collectMatch[1]));

          if (startPosMatch) {
              setStartPos({ x: parseInt(startPosMatch[1]), y: parseInt(startPosMatch[2]) });
          }
          if (startDirMatch) {
              const dirStr = startDirMatch[1];
              if (dirStr === 'NORTH') setStartDir(Direction.NORTH);
              if (dirStr === 'EAST') setStartDir(Direction.EAST);
              if (dirStr === 'SOUTH') setStartDir(Direction.SOUTH);
              if (dirStr === 'WEST') setStartDir(Direction.WEST);
          }

          if (layoutContentMatch) {
              const rawLayout = layoutContentMatch[1];
              // Parse the array string. 
              // It looks like: [1, 1, 1], \n [1, 0, 1]...
              const rows = rawLayout.split('],').map(row => row.replace(/[\[\]\n\s]/g, ''));
              const newLayout: CellType[][] = [];
              rows.forEach(r => {
                  if (r.length > 0) {
                      const cells = r.split(',').filter(c => c !== '').map(c => parseInt(c) as CellType);
                      if (cells.length > 0) newLayout.push(cells);
                  }
              });
              if (newLayout.length > 0) setLayout(newLayout);
          }

          if (cmdsMatch) {
              const rawCmds = cmdsMatch[1];
              // Looks like: CommandType.FORWARD, CommandType.TURN...
              const newCmds: CommandType[] = [];
              const parts = rawCmds.split(',');
              parts.forEach(p => {
                  const clean = p.trim().replace('CommandType.', '');
                  if (clean && CommandType[clean as keyof typeof CommandType]) {
                      newCmds.push(clean as CommandType);
                  }
              });
              setAvailableCmds(newCmds);
          }

          setShowImport(false);
          setImportText("");
          alert("Nivell carregat correctament!");

      } catch (e) {
          alert("Error carregant el codi. Assegura't que has copiat tot el bloc de codi correctament.");
          console.error(e);
      }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = parseInt(e.target.value);
      if (isNaN(val)) return;
      if (val < 5) val = 5;
      if (val > 15) val = 15;
      setGridWidth(val);
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = parseInt(e.target.value);
      if (isNaN(val)) return;
      if (val < 5) val = 5;
      if (val > 15) val = 15;
      setGridHeight(val);
  }

  const handleLoadLevel = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.value);
      if (isNaN(idx)) return;
      const level = LEVEL_DATA[idx];
      
      setTitle(level.title);
      setDescription(level.description);
      
      const width = level.gridSize;
      const height = level.gridHeight || level.gridSize;
      
      setGridWidth(width);
      setGridHeight(height);

      setMaxCommands(level.maxCommands);
      setInitialEnergy(level.initialEnergy || 50);
      setReqCollectibles(level.requiredCollectibles || 0);
      setStartPos(level.startPos);
      setStartDir(level.startDir);
      setAvailableCmds(level.availableCommands);
      
      const newLayout = level.layout.map(row => [...row]);
      setLayout(newLayout);
  };

  const handleCellClick = (x: number, y: number) => {
    if (selectedTool === 'START') {
        if (startPos.x === x && startPos.y === y) {
            setStartDir((prev) => (prev + 1) % 4);
        } else {
            setStartPos({ x, y });
        }
    } else {
        const newLayout = [...layout];
        newLayout[y] = [...newLayout[y]];
        newLayout[y][x] = selectedTool;
        setLayout(newLayout);
    }
  };

  const toggleCommand = (cmd: CommandType) => {
    if (availableCmds.includes(cmd)) {
        setAvailableCmds(availableCmds.filter(c => c !== cmd));
    } else {
        setAvailableCmds([...availableCmds, cmd]);
    }
  };

  const buildLevelObject = (): Level => {
      return {
          id: 99,
          title,
          description,
          concept: 'custom',
          gridSize: gridWidth,
          gridHeight: gridHeight,
          layout,
          startPos,
          startDir,
          maxCommands,
          availableCommands: availableCmds,
          initialEnergy,
          requiredCollectibles: reqCollectibles > 0 ? reqCollectibles : undefined,
      };
  };

  const generateCode = () => {
    const layoutString = layout.map(row => `    [${row.join(', ')}],`).join('\n');
    const cmdsString = availableCmds.map(c => `CommandType.${c}`).join(', ');

    const code = `import { Level, Direction, CommandType, CellType } from '../types';

export const customLevel: Level = {
  id: 99, // Canvia-ho
  title: "${title}",
  description: "${description}",
  concept: 'custom',
  gridSize: ${gridWidth},
  gridHeight: ${gridHeight},
  layout: [
${layoutString}
  ],
  startPos: { x: ${startPos.x}, y: ${startPos.y} },
  startDir: Direction.${Direction[startDir]},
  maxCommands: ${maxCommands},
  availableCommands: [${cmdsString}],
  initialEnergy: ${initialEnergy},
  ${reqCollectibles > 0 ? `requiredCollectibles: ${reqCollectibles},` : ''}
};`;
    setGeneratedCode(code);
  };

  const handleTest = () => {
      const level = buildLevelObject();
      onTest(level);
  };

  const getToolIcon = (tool: CellType | 'START') => {
      switch(tool) {
          case CellType.EMPTY: return <Eraser size={20}/>;
          case CellType.WALL: return <Box size={20} className="text-green-600"/>;
          case CellType.GOAL: return <Flag size={20} className="text-red-500"/>;
          case 'START': return <Bot size={20} className="text-black"/>;
          case CellType.HAZARD: return <AlertTriangle size={20} className="text-orange-500"/>;
          case CellType.COLLECTIBLE: return <Star size={20} className="text-yellow-400"/>;
          case CellType.BATTERY: return <Zap size={20} className="text-yellow-600"/>;
          case CellType.DOOR: return <Lock size={20} className="text-brown-500"/>;
          case CellType.KEY: return <Key size={20} className="text-yellow-400"/>;
          case CellType.PAINT_RED: return <Palette size={20} className="text-red-500"/>;
          case CellType.PAINT_BLUE: return <Palette size={20} className="text-blue-500"/>;
          case CellType.PAINT_GREEN: return <Palette size={20} className="text-green-500"/>;
          case CellType.CRACKED_WALL: return <Hammer size={20} className="text-gray-400"/>;
          case CellType.WATER: return <Waves size={20} className="text-blue-500"/>;
          case CellType.HOLE: return <CircleDashed size={20} className="text-gray-400"/>;
          case CellType.BRIDGE: return <BrickWall size={20} className="text-amber-800"/>;
          default: return <Box size={20}/>;
      }
  };

  const getToolLabel = (tool: CellType | 'START') => {
    switch(tool) {
        case CellType.EMPTY: return "Esborrar";
        case CellType.WALL: return "Mur";
        case CellType.GOAL: return "Meta";
        case 'START': return "Robot";
        case CellType.HAZARD: return "Lava";
        case CellType.WATER: return "Aigua";
        case CellType.HOLE: return "Buit";
        case CellType.COLLECTIBLE: return "Item";
        case CellType.BATTERY: return "Bateria";
        case CellType.DOOR: return "Porta";
        case CellType.KEY: return "Clau";
        case CellType.PAINT_RED: return "Vermell";
        case CellType.PAINT_BLUE: return "Blau";
        case CellType.PAINT_GREEN: return "Verd";
        case CellType.CRACKED_WALL: return "Mur Trencat";
        case CellType.BRIDGE: return "Pont";
        default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#2d2d2d] text-white p-0 font-pixel flex flex-col h-screen overflow-hidden">
      
      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-[#3a3a3a] p-8 border-8 border-black shadow-[16px_16px_0_rgba(0,0,0,0.4)] max-w-2xl w-full"
                >
                    <h3 className="text-yellow-400 font-bold mb-4 uppercase tracking-widest border-b-4 border-black pb-2">Importar Nivell (TypeScript)</h3>
                    <textarea 
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full h-64 bg-black text-green-400 font-mono text-[10px] p-4 mb-6 border-4 border-gray-700 custom-scrollbar"
                      placeholder="Enganxa aquí el codi que comença per 'export const customLevel...'"
                    />
                    <div className="flex justify-end gap-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowImport(false)} className="bg-slate-600 px-6 py-3 border-4 border-black font-bold uppercase text-[10px]">Cancel·lar</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleImportCode} className="bg-green-600 px-6 py-3 border-4 border-black font-bold uppercase text-[10px]">Carregar</motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-[#f8d878] text-black p-8 border-8 border-black shadow-[16px_16px_0_rgba(0,0,0,0.4)] max-w-lg w-full relative"
                >
                    <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 hover:scale-110 transition-transform"><X /></button>
                    <h3 className="text-lg font-bold mb-6 uppercase text-center border-b-4 border-black pb-2 tracking-tighter">Com crear un nivell</h3>
                    <div className="space-y-4 text-[10px] leading-relaxed font-bold uppercase tracking-tight">
                        <p className="flex gap-3"><span className="bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">1</span> <span><strong className="text-blue-700">Configuració:</strong> A l'esquerra, posa-li nom i defineix la mida del mapa (Ex: 9x9).</span></p>
                        <p className="flex gap-3"><span className="bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">2</span> <span><strong className="text-green-700">Dibuixar:</strong> Selecciona una eina a la dreta (Mur, Robot, Meta...) i clica a la graella central per pintar.</span></p>
                        <p className="flex gap-3"><span className="bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">3</span> <span><strong className="text-red-700">Regles:</strong> Defineix quanta energia té el robot i quines comandes pot fer servir (checkboxes a l'esquerra).</span></p>
                        <p className="flex gap-3"><span className="bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">4</span> <span><strong className="text-orange-700">Provar:</strong> Clica el botó taronja "PROVAR" per jugar el teu nivell.</span></p>
                        <p className="flex gap-3"><span className="bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">5</span> <span><strong className="text-purple-700">Exportar:</strong> Quan acabis, clica "CODI", copia el text i envia'l al professor!</span></p>
                    </div>
                    <div className="mt-8 text-center">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowTutorial(false)} 
                          className="bg-blue-600 text-white px-8 py-3 border-4 border-black font-bold hover:bg-blue-500 uppercase text-[10px] shadow-[4px_4px_0_rgba(0,0,0,1)]"
                        >
                            Entesos!
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center bg-[#4a4a4a] p-4 border-b-8 border-black z-10 shadow-lg"
      >
        <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack} 
              className="bg-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-yellow-300"
            >
                <ArrowLeft size={24} className="text-black" />
            </motion.button>
            <h1 className="text-xl font-bold text-yellow-400 pixel-text-shadow uppercase tracking-tighter hidden md:block">Editor de Nivells</h1>
            
            <div className="flex items-center gap-2 ml-4">
                 <FileDown size={18} className="text-gray-400"/>
                 <select 
                    onChange={handleLoadLevel} 
                    className="bg-black text-white text-[10px] p-2 border-4 border-gray-600 w-32 md:w-auto uppercase font-bold"
                    defaultValue=""
                 >
                     <option value="" disabled>Carregar Món 1...</option>
                     {LEVEL_DATA.map((l, i) => (
                         <option key={l.id} value={i}>{l.id}. {l.title}</option>
                     ))}
                 </select>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowImport(true)} 
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 text-[10px] border-4 border-slate-500 font-bold uppercase"
            >
                <FileUp size={16}/> Importar
            </motion.button>
        </div>
        <div className="flex gap-2 md:gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTutorial(true)} 
              className="bg-blue-500 text-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
            >
                <HelpCircle size={24}/>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTest} 
              className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 font-bold border-4 border-black flex items-center gap-2 text-[10px] shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-widest"
            >
                <Play size={18} fill="currentColor"/> <span className="hidden md:inline">PROVAR</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateCode} 
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 font-bold border-4 border-black flex items-center gap-2 text-[10px] shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-widest"
            >
                <Code size={18}/> <span className="hidden md:inline">CODI</span>
            </motion.button>
        </div>
      </motion.div>

      <div className="flex flex-1 gap-0 overflow-hidden flex-col md:flex-row">
          
          {/* Left: Configuration */}
          <motion.div 
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="w-full md:w-1/4 bg-[#3a3a3a] p-6 overflow-y-auto border-r-8 border-black flex flex-col gap-8 order-2 md:order-1 h-1/3 md:h-full custom-scrollbar"
          >
              
              <div className="space-y-4">
                  <h3 className="font-bold border-b-4 border-black pb-2 text-yellow-400 uppercase text-[10px] tracking-widest">Configuració General</h3>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-400 uppercase font-bold">Títol</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold text-white focus:border-yellow-400 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-400 uppercase font-bold">Descripció</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold text-white h-20 focus:border-yellow-400 outline-none resize-none" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 uppercase font-bold">Amplada (5-15)</label>
                      <input type="number" value={gridWidth} onChange={handleWidthChange} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 uppercase font-bold">Alçada (5-15)</label>
                      <input type="number" value={gridHeight} onChange={handleHeightChange} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 uppercase font-bold">Max Comandes</label>
                      <input type="number" value={maxCommands} onChange={e => setMaxCommands(parseInt(e.target.value))} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 uppercase font-bold">Energia Inicial</label>
                      <input type="number" value={initialEnergy} onChange={e => setInitialEnergy(parseInt(e.target.value))} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold" />
                  </div>
                  <div className="col-span-2 space-y-1">
                      <label className="text-[8px] text-gray-400 uppercase font-bold">Items Necessaris</label>
                      <input type="number" value={reqCollectibles} onChange={e => setReqCollectibles(parseInt(e.target.value))} className="w-full bg-black border-4 border-gray-700 p-2 text-[10px] font-bold" />
                  </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                  <h3 className="font-bold border-b-4 border-black pb-2 mb-4 text-yellow-400 uppercase text-[10px] tracking-widest">Comandes Disponibles</h3>
                  <div className="flex-1 overflow-y-auto p-2 bg-black/40 border-4 border-black custom-scrollbar">
                      {Object.entries(EDITOR_CATEGORIES).map(([catName, cmds]) => (
                        <div key={catName} className="mb-6">
                            <h4 className="text-[8px] uppercase font-bold text-slate-500 mb-2 border-l-4 border-slate-500 pl-2">{catName}</h4>
                            <div className="flex flex-col gap-2 pl-2">
                                {cmds.map(cmd => {
                                    const info = COMMAND_DESCRIPTIONS[cmd] || { label: cmd, desc: '' };
                                    const isSelected = availableCmds.includes(cmd);
                                    return (
                                        <label key={cmd} className={`flex items-start gap-3 p-2 border-2 transition-colors cursor-pointer ${isSelected ? 'bg-yellow-400/20 border-yellow-400' : 'bg-black/20 border-transparent hover:border-gray-600'}`} title={info.desc}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={() => toggleCommand(cmd)}
                                                className="accent-yellow-500 mt-1 w-4 h-4"
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-yellow-400' : 'text-gray-300'}`}>{info.label}</span>
                                                <span className="text-[7px] text-gray-500 leading-tight line-clamp-2 uppercase tracking-tighter">{info.desc}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </motion.div>

          {/* Center: Grid */}
          <div className="flex-1 flex items-center justify-center bg-mario-sky relative border-b-8 md:border-b-0 border-black overflow-auto p-8 order-1 md:order-2 h-1/2 md:h-full">
             <motion.div 
                layout
                className="bg-black/20 p-4 border-8 border-black shadow-[16px_16px_0_rgba(0,0,0,0.2)]"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridWidth}, 48px)`,
                    gridTemplateRows: `repeat(${gridHeight}, 48px)`,
                    gap: '2px'
                }}
             >
                 {layout.map((row, y) => row.map((cell, x) => {
                     const isRobot = startPos.x === x && startPos.y === y;
                     
                     let bgClass = "bg-[#f8d878]"; // Empty
                     if (cell === CellType.WALL) bgClass = "bg-[#00cc00]";
                     if (cell === CellType.GOAL) bgClass = "bg-purple-600";
                     if (cell === CellType.HAZARD) bgClass = "bg-orange-600";
                     if (cell === CellType.PAINT_RED) bgClass = "bg-red-400";
                     if (cell === CellType.PAINT_BLUE) bgClass = "bg-blue-400";
                     if (cell === CellType.PAINT_GREEN) bgClass = "bg-green-400";
                     if (cell === CellType.DOOR) bgClass = "bg-amber-900";
                     if (cell === CellType.CRACKED_WALL) bgClass = "bg-slate-500";
                     if (cell === CellType.WATER) bgClass = "bg-blue-600";
                     if (cell === CellType.HOLE) bgClass = "bg-slate-900";
                     if (cell === CellType.BRIDGE) bgClass = "bg-amber-800";

                     return (
                         <motion.div 
                            key={`${x}-${y}`} 
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            onClick={() => handleCellClick(x, y)}
                            className={`w-12 h-12 ${bgClass} flex items-center justify-center cursor-pointer relative border border-black/10`}
                         >
                             {cell === CellType.COLLECTIBLE && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><Star size={24} className="text-yellow-400 fill-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"/></motion.div>}
                             {cell === CellType.BATTERY && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={24} className="text-green-400 fill-green-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"/></motion.div>}
                             {cell === CellType.KEY && <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2 }}><Key size={24} className="text-yellow-500 fill-yellow-500 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"/></motion.div>}
                             {cell === CellType.GOAL && <motion.div animate={{ y: [-5, 0, -5] }} transition={{ repeat: Infinity, duration: 2 }}><Flag size={24} className="text-white fill-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"/></motion.div>}
                             {cell === CellType.DOOR && <Lock size={24} className="text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"/>}
                             {cell === CellType.CRACKED_WALL && <Hammer size={18} className="text-black opacity-40"/>}
                             {cell === CellType.WATER && <Waves size={24} className="text-white opacity-30"/>}
                             {cell === CellType.BRIDGE && <BrickWall size={24} className="text-white opacity-60" />}

                             {isRobot && (
                                 <motion.div 
                                    layoutId="robot"
                                    className="absolute inset-0 flex items-center justify-center z-10 bg-slate-700 border-4 border-black shadow-lg w-10 h-10 m-auto"
                                    animate={{ rotate: startDir * 90 }}
                                 >
                                     <Bot className="text-slate-300" size={24} />
                                     <div className="absolute -top-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-yellow-400"></div>
                                 </motion.div>
                             )}
                         </motion.div>
                     );
                 }))}
             </motion.div>
          </div>

          {/* Right: Tools & Output */}
          <motion.div 
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            className="w-full md:w-1/4 flex flex-col gap-0 order-3 h-1/3 md:h-full border-l-8 border-black"
          >
              
              <div className="bg-[#3a3a3a] p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <h3 className="font-bold mb-6 text-yellow-400 uppercase text-[10px] tracking-widest border-b-4 border-black pb-2">Eines de Dibuix</h3>
                  <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
                      {[
                          { id: CellType.EMPTY },
                          { id: CellType.WALL },
                          { id: 'START' },
                          { id: CellType.GOAL },
                          { id: CellType.HAZARD },
                          { id: CellType.WATER },
                          { id: CellType.BRIDGE },
                          { id: CellType.HOLE },
                          { id: CellType.CRACKED_WALL },
                          { id: CellType.COLLECTIBLE },
                          { id: CellType.BATTERY },
                          { id: CellType.KEY },
                          { id: CellType.DOOR },
                          { id: CellType.PAINT_RED },
                          { id: CellType.PAINT_BLUE },
                          { id: CellType.PAINT_GREEN },
                      ].map((tool) => (
                          <motion.button
                            key={tool.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTool(tool.id as any)}
                            className={`
                                p-3 flex flex-col items-center gap-2 border-4 text-[8px] font-bold transition-all uppercase tracking-tighter
                                ${selectedTool === tool.id ? 'bg-yellow-400 text-black border-white shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}
                            `}
                          >
                              {getToolIcon(tool.id as any)}
                              <span className="text-center leading-none">{getToolLabel(tool.id as any)}</span>
                          </motion.button>
                      ))}
                  </div>
              </div>

              <div className="bg-black p-6 border-t-8 border-black flex flex-col h-1/2">
                  <h3 className="font-bold mb-4 text-green-500 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Code size={16} /> Codi Generat
                  </h3>
                  <textarea 
                    readOnly 
                    value={generatedCode} 
                    className="flex-1 w-full bg-[#1a1a1a] text-green-400 font-mono text-[9px] p-4 resize-none border-4 border-gray-800 focus:outline-none custom-scrollbar"
                    placeholder="Dibuixa un nivell i prem 'CODI' per generar el text."
                  />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        alert("Codi copiat!");
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white py-4 text-[10px] font-bold border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-widest"
                  >
                      Copiar al Porta-retalls
                  </motion.button>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default LevelEditor;
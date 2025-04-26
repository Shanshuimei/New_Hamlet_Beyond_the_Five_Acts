import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'loaders.css/loaders.min.css';  
import 'animate.css';
import './index.css';
import Transition from './components/Transition';
import CharacterIntro from './components/CharacterIntro';
import Guide from './components/Guide'; // 导入新的引导组件
import MapSelection from './components/MapSelection';  // 导入新组件
import GameScene from './components/GameScene';
import Ending from './components/Ending';

// 添加角色目标状态类型
type CharacterGoals = Record<string, string>;


type GameState = 'start' | 'transition' | 'guide' | 'character_intro' | 'map_selection' | 'game_scene' | 'ending'; // 添加 guide 状态

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [sceneCharacters, setSceneCharacters] = useState<string[]>([]);
  // 添加全局记忆状态
  const [globalMemories, setGlobalMemories] = useState<Record<string, string>>({});
  // 添加角色目标状态
  const [characterGoals, setCharacterGoals] = useState<CharacterGoals>({});

  // 添加目标更新处理函数
  const handleGoalsUpdate = (newGoals: Record<string, string>) => {
    setCharacterGoals(prev => ({
      ...prev,
      ...newGoals
    }));
  };
  // 添加剧本记录状态
  const [script, setScript] = useState<string[]>([]);
  const [sceneCount, setSceneCount] = useState<number>(0);

  // 添加记忆更新处理函数
  const handleMemoriesUpdate = (newMemories: Record<string, string>) => {
    setGlobalMemories(prev => ({
      ...prev,
      ...newMemories
    }));
    // console.log('更新全局记忆:', newMemories);
  };

  // 添加剧本更新处理函数
  const handleScriptUpdate = (dialogues: Record<string, string>) => {
    // 只在结束对话时更新剧本
    const sceneTitle = `第${script.length + 1}场 ${selectedMap}`;
    const sceneContent = Object.entries(dialogues)
      .map(([character, content]) => `${character}：${content}`)
      .join('\n');
    
    const newScene = `${sceneTitle}\n${sceneContent}\n\n`;
    // 只有当对话内容非空时才添加场景并增加计数
    if (sceneContent.trim()) {
      setScript(prev => [...prev, newScene]);
      setSceneCount(prev => prev + 1);
    }

    // 输出剧本更新信息
    console.log('剧本更新：', {
      场次: script.length + 1,
      场景: selectedMap,
      参与角色: Object.keys(dialogues),
      对话内容: dialogues,
      完整场景: newScene
    });
  };

  // 添加结局到剧本的处理函数
  const handleAddEndingToScript = (endingText: string) => {
    const endingTitle = `最终幕 结局`;
    const endingScene = `${endingTitle}\n${endingText}\n\n`;
    setScript(prev => [...prev, endingScene]);
    console.log('结局已添加到剧本:', endingScene);
  };

  // 将 handleMapSelectionComplete 函数移到组件内部
  const handleMapSelectionComplete = (map: string, characters: string[]) => {
    setSelectedMap(map);
    setSceneCharacters(characters);
    
    // 根据map参数决定跳转到哪个页面
    if (map === 'ending') {
      setGameState('ending');
    } else {
      setGameState('game_scene');
    }
    
    // 可以在控制台输出调试信息
    // console.log(`选择的场景: ${map}`);
    // console.log(`场景中的人物: ${characters.join(', ')}`);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameState === 'start') {
        setGameState('transition');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameState]);

  return (
    <AnimatePresence mode="wait">
      {gameState === 'start' && (
        <motion.div
          key="start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4" style={{ backgroundImage: `url('images/home.png')`, backgroundSize: '100vw 100vh', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-10">
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-7xl lg:text-9xl tracking-[0.2em] text-white" 
                        style={{ fontFamily: "ZiXinFang, 'Times New Roman', serif" }}>
                    哈姆雷特
                  </span>
                  <span className="text-2xl md:text-5xl lg:text-7xl tracking-[0.2em] text-white mt-4" 
                        style={{ fontFamily: "ZiXinFang, 'Times New Roman', serif" }}>
                    五幕之外
                  </span>
                </div>
              </div>
              <div className="mt-12 space-y-4">
                <button 
                  onClick={() => setGameState('transition')}
                  className="bg-white py-3 px-8 inline-block hover:bg-white/90 transition-colors"
                >
                  <span className="font-serif text-xl tracking-[0.2em] uppercase">
                    ENTER
                  </span>
                </button>
                <p className="text-white/60 text-sm mt-8 tracking-wider animate-pulse">
                  PRESS ENTER TO START
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {gameState === 'transition' && (
        <motion.div
          key="transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Transition onComplete={() => setGameState('guide')} /> // 过渡动画完成后跳转到引导页面
        </motion.div>
      )}
      {gameState === 'guide' && (
        <motion.div
          key="guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Guide onContinue={() => setGameState('character_intro')} /> {/* 显示引导页面，点击继续后跳转到角色介绍 */}
        </motion.div>
      )}
      {gameState === 'character_intro' && (
        <motion.div
          key="character_intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CharacterIntro onComplete={() => setGameState('map_selection')} />
        </motion.div>
      )}
      {gameState === 'map_selection' && (
        <motion.div
          key="map_selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MapSelection 
            onComplete={handleMapSelectionComplete} 
            sceneCount={sceneCount} 
          />
        </motion.div>
      )}
      {/* 添加 game_scene 状态的渲染 */}
      {gameState === 'game_scene' && (
        <motion.div
          key="game_scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GameScene
            selectedMap={selectedMap}
            sceneCharacters={sceneCharacters}
            onComplete={handleMemoriesUpdate}
            onScriptUpdate={handleScriptUpdate}
            characterMemories={globalMemories}
            characterGoals={characterGoals}
            onGoalsUpdate={handleGoalsUpdate}
            onExit={() => {
              // 达到5幕后直接进入结局状态，不再传递endingContent
              if (sceneCount >= 5) {
                setGameState('ending');
              } else {
                setGameState('map_selection');
              }
            }}
          />
        </motion.div>
      )}
      {/* 添加结局场景的渲染 */}
      {gameState === 'ending' && (
        <motion.div
          key="ending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Ending 
            onAddEndingToScript={handleAddEndingToScript} // 传递添加结局的函数
            onComplete={() => {
              // 回到主页时重置所有流程相关状态，防止直接跳转ending和结局重复
              setGameState('start');
              setSceneCount(0);
              setScript([]);
              setSelectedMap('');
              setSceneCharacters([]);
              setGlobalMemories({});
              setCharacterGoals({});
              // 不再需要重置 endingContent
            }} 
            sceneCharacters={sceneCharacters}
            characterMemories={globalMemories}
            characterGoals={characterGoals}
            script={script} // 确保传递 script
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;

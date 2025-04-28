import React, { useEffect, useState, useRef } from 'react';
import CircularGallery from './CircularGallery';

interface MapSelectionProps {
  onComplete: (selectedMap: string, characters: string[]) => void;
  sceneCount?: number;
}

// 添加场景人物概率表
const sceneCharacterProbabilities: Record<string, Record<string, number>> = {
  "城堡露台": {
    "霍拉旭": 60,
    "鬼魂": 70
  },
  "城堡大厅": {
    "克劳狄斯": 30,
    "王后": 10,
    "波洛涅斯": 40,
    "雷欧提斯": 30,
    "霍拉旭": 40,
    "鬼魂": 10,
    "奥菲利娅": 20
  },
  "波洛涅斯家中一室": {
    "雷欧提斯": 70,
    "奥菲利娅": 70,
    "波洛涅斯": 20
  },
  "城堡中一室": {
    "克劳狄斯": 70,
    "王后": 20,
    "波洛涅斯": 40,
    "奥菲利娅": 20,
    "鬼魂": 10
  },
  "王后寝宫": {
    "王后": 70,
    "波洛涅斯": 20,
    "鬼魂": 10
  }
};

const MapSelection: React.FC<MapSelectionProps> = ({ onComplete, sceneCount = 0 }) => {
  const [showGuide, setShowGuide] = useState(false);
  // 添加useEffect监听sceneCount变化
  useEffect(() => {
    if (sceneCount >= 5) {
      onComplete('ending', []);
    }
  }, [sceneCount, onComplete]);
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const sceneCharactersRef = useRef<string[]>([]);
  
  const maps = [
    { image: "images/波洛涅斯家中一室.png", text: "波洛涅斯家中一室" },
    { image: "images/城堡大厅.png", text: "城堡大厅" },
    { image: "images/城堡露台.png", text: "城堡露台" },
    { image: "images/城堡中一室.png", text: "城堡中一室" },
    { image: "images/王后寝宫.png", text: "王后寝宫" }
  ];

  // 添加函数：根据场景和概率生成人物列表
  const generateCharacters = (sceneName: string): string[] => {
    const characters: string[] = [];
    const probabilities = sceneCharacterProbabilities[sceneName];
    
    if (!probabilities) return characters;
    
    // 遍历每个可能出现的人物，根据概率决定是否出现
    Object.entries(probabilities).forEach(([character, probability]) => {
      const randomValue = Math.floor(Math.random() * 100) + 1; // 生成1-100的随机数
      if (randomValue <= probability) {
        characters.push(character);
      }
    });
    
    return characters;
  };

  // 处理地图选择变化
  const handleMapChange = (index: number) => {
    // console.log(`地图选择变更为索引: ${index}, 地图名称: ${maps[index].text}, 之前索引: ${selectedMapIndex}`);
    setSelectedMapIndex(index);
  };

  // 处理地图点击确认
  const handleMapClick = (index: number) => {
    // console.log(`点击确认选择地图: ${maps[index].text}`);
    const selectedMap = maps[index].text;
    const characters = generateCharacters(selectedMap);
    sceneCharactersRef.current = characters;
    
    // console.log(`选择了地图: ${selectedMap}, 索引: ${index}`);
    // console.log(`生成的人物: ${characters.join(', ')}`);
    
    // 检查是否有人物在场景中
    if (characters.length === 0) {
      // 显示提示信息
      const message = document.createElement('div');
      message.className = 'fixed inset-0 flex items-center justify-center z-50';
      message.innerHTML = `
        <div class="bg-black/80 text-white px-8 py-6 rounded-lg animate__animated animate__fadeIn">
          <p class="text-xl">这个场景中没有人呢，请去别的地方逛逛吧</p>
        </div>
      `;
      document.body.appendChild(message);

      // 2秒后移除提示并返回地图选择
      setTimeout(() => {
        message.classList.add('animate__fadeOut');
        setTimeout(() => {
          document.body.removeChild(message);
        }, 500);
      }, 2000);
      
      return;
    }
    
    // 如果有人物，则正常进行
    onComplete(selectedMap, characters);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black" onClick={() => setShowGuide(false)}>
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={(event: React.MouseEvent) => {
  setShowGuide(true);
  event.stopPropagation();
}}
          className="absolute top-4 left-4 z-50 bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold text-white hover:text-white/80 transition-colors"
        >
          ?
        </button>
      </div>
      {/* 游戏引导弹窗 */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-auto flex items-center justify-center p-4">
          <div className="max-w-2xl rounded-lg p-4 bg-black/40 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">游戏引导</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-white space-y-4">
              <p>你可以随意进入任何场景，点击确认选择进入对应场景。</p>
              <p className="mt-4">每个场景中出现的角色都是随机的，但是角色出现概率不同。</p>
              <p className="mt-4">你一共有5次进入场景与场景中所有角色对话的机会，对应5幕。</p>
              <p className="mt-4">当你完成5幕对话后，将立马进入结局页面。</p>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-white text-4xl mb-4 font-['字心坊李林哥特体简体中文'] z-10">选择场景</h1>
      {/* 添加剩余幕数提示 */} 
      {sceneCount < 5 && (
        <div className="text-white text-2xl font-['字心坊李林哥特体简体中文'] mb-4 z-10"> {/* 调整位置和样式 */}
          距离最终幕还剩{5 - sceneCount}幕
        </div>
      )}
      <div style={{ height: '600px', width: '100%', position: 'relative', zIndex: 1 }}>
        <CircularGallery 
          items={maps}
          bend={3} 
          textColor="#ffffff" 
          borderRadius={0.05}
          font="bold 36px '字心坊李林哥特体简体中文', sans-serif"
          onItemSelect={handleMapChange}
        />
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        <button 
          className="px-6 py-3 bg-transparent text-white border border-white rounded-lg hover:bg-white hover:text-black transition-colors font-['字心坊李林哥特体简体中文'] text-xl"
          onClick={() => handleMapClick(selectedMapIndex)}
        >
          确认选择
        </button>
        {/* 移除进入结局按钮 */}
      </div>
    </div>
  );
};

export default MapSelection;

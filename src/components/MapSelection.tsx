import React, { useState } from 'react';
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
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const [, setSceneCharacters] = useState<string[]>([]);
  
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
    setSceneCharacters(characters);
    
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-white text-4xl mb-8 font-['字心坊李林哥特体简体中文'] z-10">选择场景</h1>
      
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

        {sceneCount >= 5 && (
          <button
            className="px-6 py-3 bg-white text-black border border-black rounded-lg hover:bg-black hover:text-white transition-colors font-['字心坊李林哥特体简体中文'] text-xl"
            onClick={() => {
              onComplete('ending', []);
            }}
          >
            进入结局
          </button>
        )}
      </div>
    </div>
  );
};

export default MapSelection;
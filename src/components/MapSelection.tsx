import React, { useEffect, useState, useRef } from 'react';
import CircularGallery from './CircularGallery';
import { FaBookOpen } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

interface MapSelectionProps {
  onComplete: (selectedMap: string, characters: string[]) => void;
  sceneCount?: number;
  characterGoals?: Record<string, string>;
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

  const MapSelection: React.FC<MapSelectionProps> = ({ onComplete, sceneCount = 0, characterGoals = {} }) => {
  const [localGoals, setLocalGoals] = useState(characterGoals || {});
  const [showGuide, setShowGuide] = useState(false);
  const [showIntelPanel, setShowIntelPanel] = useState(false);
  const [collectedIntel, setCollectedIntel] = useState<string[]>([]);
  const [isCollectingIntel, setIsCollectingIntel] = useState(false);
  const [intelCollectedForScene, setIntelCollectedForScene] = useState(0);

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

  const handleCollectIntel = async () => {
    setIsCollectingIntel(true);
    setCollectedIntel(prev => [...prev, `开始为第 ${sceneCount} 幕收集情报...`]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            scene_number: sceneCount,
            ghost_goal: localGoals.ghost_goal || '',
            aofeiliya_goal: localGoals.aofeiliya_goal || '',
            boluoniesi_goal: localGoals.boluoniesi_goal || '',
            kelaodisi_goal: localGoals.kelaodisi_goal || '',
            huolaxu_goal: localGoals.huolaxu_goal || '',
            wanghou_goal: localGoals.wanghou_goal || '',
            leioutisi_goal: localGoals.leioutisi_goal || ''
          },
          query: "收集情报", // 或者更具体的指令，例如 "为当前幕收集情报"
          response_mode: "streaming",
          user: "hamlet", // 或者其他用户标识
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('情报收集 API Error:', errorText);
        setCollectedIntel(prev => [...prev, `情报收集失败: ${errorText}`]);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setCollectedIntel(prev => [...prev, '无法读取情报响应流。']);
        setIsCollectingIntel(false);
        return;
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = '';
      let intelReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!intelReceived) {
            setCollectedIntel(prev => [...prev, `第 ${sceneCount} 幕情报收集完毕，但未收到具体情报内容。`]);
          } else {
            setCollectedIntel(prev => [...prev, `第 ${sceneCount} 幕情报收集完毕。`]);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const jsonData = line.slice(6).trim();
          if (!jsonData || jsonData === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonData);
            // console.log('情报收集事件:', event); // 调试用

            if (event.event === 'node_finished') {
              if (event.data?.title === "收集情报" && event.data?.outputs?.text) {
                intelReceived = true;
                setCollectedIntel(prev => [...prev, event.data.outputs.text]);
              }
            } else if (event.error) {
              console.error('情报流错误:', event.error);
              setCollectedIntel(prev => [...prev, `情报流错误: ${event.error}`]);
            }
          } catch (e) {
            console.error('解析情报JSON错误:', e, '原始数据:', jsonData);
            setCollectedIntel(prev => [...prev, '解析情报时发生错误。']);
          }
        }
      }
    } catch (error) {
      console.error('收集情报失败:', error);
      setCollectedIntel(prev => [...prev, `收集情报时发生网络或未知错误: ${error instanceof Error ? error.message : String(error)}`]);
    }

    setIntelCollectedForScene(sceneCount);
    setIsCollectingIntel(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black" onClick={() => { setShowGuide(false); /* setShowIntelPanel(false); */ }}>
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={(event: React.MouseEvent) => {
            setShowGuide(true);
            event.stopPropagation();
          }}
          className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold text-white hover:text-white/80 transition-colors"
        >
          ?
        </button>
      </div>
      {/* 情报收集图标按钮 */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(event: React.MouseEvent) => {
            setShowIntelPanel(prev => !prev);
            event.stopPropagation();
          }}
          className="bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors"
        >
          <FaBookOpen size={20} />
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
      {/* 情报面板 */}
      {showIntelPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] overflow-auto flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="max-w-2xl w-full rounded-lg p-6 bg-black/50 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold font-['字心坊李林哥特体简体中文']">情报</h2>
              <button
                onClick={() => setShowIntelPanel(false)}
                className="text-white/70 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="text-white space-y-3 h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent mb-4">
              {collectedIntel.length === 0 && !isCollectingIntel && (
                <p className="text-white/70 italic">当前没有情报。完成一幕对话后可收集。</p>
              )}
              {collectedIntel.map((intel, index) => (
                <p key={index} className="text-sm leading-relaxed">{intel}</p>
              ))}
              {isCollectingIntel && collectedIntel.length > 0 && (
                 <p className="text-sm leading-relaxed animate-pulse text-yellow-400">正在接收情报...</p>
              )}
            </div>
            <button
              onClick={handleCollectIntel}
              disabled={isCollectingIntel || sceneCount <= intelCollectedForScene || sceneCount === 0}
              className="w-full mt-4 px-6 py-3 bg-yellow-500/80 text-black border border-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors font-['字心坊李林哥特体简体中文'] text-lg disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isCollectingIntel ? '收集中...' : (sceneCount <= intelCollectedForScene && sceneCount !== 0) ? `第 ${sceneCount} 幕情报已收集` : '收集当前幕情报'}
            </button>
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

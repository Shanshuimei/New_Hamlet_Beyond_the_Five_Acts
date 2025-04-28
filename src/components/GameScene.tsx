import React, { useState, useRef } from 'react';
import 'animate.css';
import CharacterInfoPopup from './CharacterInfoPopup';

interface GameSceneProps {
  selectedMap: string;
  sceneCharacters: string[];
  onComplete: (newMemories: Record<string, string>) => void;
  onScriptUpdate: (dialogues: Record<string, string>) => void;
  characterMemories?: Record<string, string>;
  characterGoals?: Record<string, string>;
  onGoalsUpdate: (newGoals: Record<string, string>) => void;
  onExit: () => void;
}

interface CharacterSpeech {
  character: string;
  content: string;
  isActive: boolean;
}

const GameScene: React.FC<GameSceneProps> = ({ 
  selectedMap, 
  sceneCharacters, 
  onComplete,
  onScriptUpdate,
  characterMemories,
  characterGoals,
  onGoalsUpdate,
  onExit
}) => {
  const [message, setMessage] = useState('');
  const [speeches, setSpeeches] = useState<CharacterSpeech[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const toggleGuide = () => setShowGuide(!showGuide);
  
  const handleCharacterClick = (character: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCharacter(character);
    setShowCharacterInfo(true);
  };
  
  // 添加本地记忆状态
  const [localMemories, setLocalMemories] = useState(characterMemories || {});
  // 修改为使用传入的初始目标状态
  const [localGoals, setLocalGoals] = useState(characterGoals || {});
  const inputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  // Move all function definitions here
  const getBackgroundImage = () => {
    return `images/${selectedMap}.png`;
  };

  const getCharacterImage = (character: string) => {
    const characterMap: Record<string, string> = {
      '鬼魂': '老国王',
    };
    const imageName = characterMap[character] || character;
    return `images/${imageName}.png`;
  };

  const calculateCharacterStyles = (characters: string[] = []) => {
    const positions: Record<string, React.CSSProperties> = {};
    const characterList = Array.isArray(characters) ? characters : [];
    
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: '2vw',
      width: '100%',
      maxWidth: '100vw',
      padding: 0,        // 移除所有内边距
      margin: 0,         // 移除所有外边距
    };
    
    characterList.forEach((character, index) => {
      positions[character] = {
        height: '90vh',
        width: 'auto',
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 10 + index,
        position: 'relative',
        padding: 0,      // 移除所有内边距
        margin: 0,       // 移除所有外边距
      };
    });
    
    return { container: containerStyle, characters: positions };
  };

  // 修改图片样式部分
  // 添加发送消息的函数
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    // 不再在第一条消息时更新剧本

    try {
      console.log('发送请求参数:', {
        npc: sceneCharacters.join(','),
        people: sceneCharacters.length,
        query: message,
        conversation_id: conversationId || undefined,
        memories: localMemories,
        goals: characterGoals  // 新增目标参数
      });
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            npc: sceneCharacters.join(','),
            people: sceneCharacters.length,
            ghost_memory: localMemories.ghost_memory || '',
            aofeiliya_memory: localMemories.aofeiliya_memory || '',
            boluoniesi_memory: localMemories.boluoniesi_memory || '',
            kelaodisi_memory: localMemories.kelaodisi_memory || '',
            huolaxu_memory: localMemories.huolaxu_memory || '',
            wanghou_memory: localMemories.wanghou_memory || '',
            leioutisi_memory: localMemories.leioutisi_memory || '',
            // 新增目标输入
            ghost_goal: localGoals.ghost_goal || '',
            aofeiliya_goal: localGoals.aofeiliya_goal || '',
            boluoniesi_goal: localGoals.boluoniesi_goal || '',
            kelaodisi_goal: localGoals.kelaodisi_goal || '',
            huolaxu_goal: localGoals.huolaxu_goal || '',
            wanghou_goal: localGoals.wanghou_goal || '',
            leioutisi_goal: localGoals.leioutisi_goal || ''
          },
          query: message,
          response_mode: "streaming",
          conversation_id: conversationId || undefined,
          user: "hamlet",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) return;

      // 添加玩家消息到对话列表
      setSpeeches(prev => [...prev, {
        character: '哈姆雷特',
        content: message,
        isActive: false
      }]);
      
      // 初始化解码器和缓冲区
      const decoder = new TextDecoder("utf-8");
      let buffer = '';
      let currentAnswers: Record<string, string> = {};
      let currentSpeaker = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 不在这里更新剧本，而是在结束对话时更新
          break;
        }
      
        // 将新数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true });
        
        // 处理完整的行
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保存不完整的行到缓冲区
      
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const jsonData = line.slice(6).trim();
          if (!jsonData || jsonData === '[DONE]') continue;
      
          try {
            const event = JSON.parse(jsonData);
            // console.log('解析的事件数据:', event); // 调试用
            
            if (event.event === 'node_started') {
              const speakerTitle = event.data?.title;
              if (speakerTitle && sceneCharacters.includes(speakerTitle)) {
                // 将前一个说话者的内容设置为非活跃
                if (currentSpeaker && currentAnswers[currentSpeaker]) {
                  setSpeeches(prev => prev.map(speech => 
                    speech.character === currentSpeaker ? { ...speech, isActive: false } : speech
                  ));
                }
                currentSpeaker = speakerTitle;
                currentAnswers[currentSpeaker] = '';
              }
            } else if (event.answer && currentSpeaker) {
              currentAnswers[currentSpeaker] = (currentAnswers[currentSpeaker] || '') + event.answer;
              
              // 更新当前说话者的对话
              setSpeeches(prev => {
                const withoutActive = prev.filter(speech => 
                  speech.character !== currentSpeaker || !speech.isActive
                );
                const updatedSpeeches = [...withoutActive, {
                  character: currentSpeaker,
                  content: currentAnswers[currentSpeaker],
                  isActive: true
                }];

                // 不再实时更新剧本，只在结束对话时更新

                return updatedSpeeches;
              });
            }
      
            // 保存会话ID
            if (event.conversation_id) {
              setConversationId(event.conversation_id);
            }
          } catch (error) {
            console.error('JSON解析错误:', error, '原始数据:', jsonData);
            // 继续处理下一行
            continue;
          }
        }
      }
      
      // console.log('完整响应数据:', fullResponse);
    } catch (error) {
      console.error('请求错误:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  // 更新表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  // 切换历史对话显示
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // 修改结束对话处理函数

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* 问号按钮 */}
      <button 
        className="absolute top-4 left-4 z-50 bg-black/20 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold text-white hover:text-white/80 transition-colors"
        onClick={() => setShowGuide(true)}
      >
        ?
      </button>
      
      {/* 引导弹窗 */}
      {showGuide && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-auto p-4">
          <div className="max-w-2xl mx-auto rounded-lg p-4 my-8 bg-black/40 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">游戏引导</h2>
              <button
                onClick={toggleGuide}
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-white space-y-4">
              <p>点击底部对话框输入文字。</p>
              <p>发送对话请点击对话框右侧的箭头或者按enter键。</p>
              <p>结束对话请点击对话框左侧的x。</p>
              <p>点击角色立绘可以查看角色信息。</p>
              <p>点击右上角时钟图标查看历史对话。</p>
              <p>场景中所有角色都会听见你所说的话。</p>
              <p>他们会回应你，同时也可能与其他在场角色进行交谈。</p>
              <p>如果你仅仅想对某一人交谈，请在对话开头加上TA的名字。</p>
              <p>如果对话正在正常加载，却没有得到回复，这代表他们已读不回，请换一种措辞再次对话。</p>
              <p>没想到吧！我游戏里的角色还能不理你嘿嘿嘿。</p>
            </div>
          </div>
        </div>
      )}
      {showCharacterInfo && (
        <CharacterInfoPopup 
          character={selectedCharacter}
          onClose={() => setShowCharacterInfo(false)}
        />
      )}
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      />
      
      {/* Character images */}
      {Array.isArray(sceneCharacters) && (
        <div className="absolute inset-0" style={{ bottom: '0' }} onClick={() => setShowCharacterInfo(false)}>
          <div style={calculateCharacterStyles(sceneCharacters).container}>
            {sceneCharacters.map(character => (
              <div key={character} style={calculateCharacterStyles(sceneCharacters).characters[character]}>
                <img 
                  src={getCharacterImage(character)} 
                  alt={character} 
                  className="h-full w-auto object-contain cursor-pointer"
                  style={{ 
                    maxHeight: '90vh',
                    marginBottom: 0,    // 确保图片底部无边距
                    display: 'block'    // 移除图片默认的行内间距
                  }}
                  onClick={(e) => handleCharacterClick(character, e)}
                />
                {/* 在 return 语句中修改对话气泡部分 */}
                {speeches.filter(speech => speech.character === character && speech.isActive).map((speech, index) => (
                  <div 
                    key={index}
                    className="absolute transform -translate-x-1/2
                              px-6 py-4 rounded-lg animate__animated animate__bounceIn"
                    style={{ 
                      minWidth: '280px', 
                      minHeight: '80px',
                      bottom: '10%',
                      left: '0',  // 确保水平居中
                      zIndex: 20,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      backdropFilter: 'blur(3px)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',  // 确保绝对定位
                      maxWidth: '100%',      // 确保不超出角色立绘宽度
                      width: 'fit-content'    // 根据内容自适应宽度
                    }}
                  >
                    <div className="text-base break-words text-center">{speech.content}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 底部输入区域 */}
      <div className="w-full px-4 py-6 bg-black/70 border-t border-white/20 mt-auto z-30">
        <form onSubmit={handleSubmit} className="flex gap-4 items-center">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              
              // 检查是否有对话记录
              if (!conversationId) {
                // 如果没有对话直接退出
                onExit();
                return;
              }

              // 收集当前场景中的所有对话
              const dialogues: Record<string, string> = {};
              speeches.forEach(speech => {
                if (speech.content.trim()) {
                  dialogues[speech.character] = speech.content.trim();
                }
              });
              
              setIsLoading(true);
              
              // 在结束对话按钮的 onClick 处理函数中修改
              // 如果没有对话记录，直接退出
              if (speeches.length === 0) {
                onExit();
                return;
              }

              try {
                console.log('发送结束对话请求...');
                const response = await fetch(API_URL, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    inputs: {
                      npc: sceneCharacters.join(','),
                      people: sceneCharacters.length,
                      ghost_memory: localMemories.ghost_memory || '',
                      aofeiliya_memory: localMemories.aofeiliya_memory || '',
                      boluoniesi_memory: localMemories.boluoniesi_memory || '',
                      kelaodisi_memory: localMemories.kelaodisi_memory || '',
                      huolaxu_memory: localMemories.huolaxu_memory || '',
                      wanghou_memory: localMemories.wanghou_memory || '',
                      leioutisi_memory: localMemories.leioutisi_memory || '',
                      // 新增目标输入
                      ghost_goal: localGoals.ghost_goal || '',
                      aofeiliya_goal: localGoals.aofeiliya_goal || '',
                      boluoniesi_goal: localGoals.boluoniesi_goal || '',
                      kelaodisi_goal: localGoals.kelaodisi_goal || '',
                      huolaxu_goal: localGoals.huolaxu_goal || '',
                      wanghou_goal: localGoals.wanghou_goal || '',
                      leioutisi_goal: localGoals.leioutisi_goal || ''
                    },
                    query: "结束对话",
                    response_mode: "streaming",
                    conversation_id: conversationId,
                    user: "hamlet",
                  }),
                });
              
              if (!response.ok) {
                throw new Error('结束对话请求失败');
              }
              
              console.log('开始处理结束对话响应...');
              const reader = response.body?.getReader();
              if (!reader) return;
              
              const decoder = new TextDecoder();
              let buffer = '';
              const newMemories: Record<string, string> = {};
              const newGoals: Record<string, string> = {}; // 新增目标状态
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
              
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
              
                for (const line of lines) {
                  if (!line.trim() || !line.startsWith('data: ')) continue;
                  
                  const jsonData = line.slice(6).trim();
                  if (!jsonData || jsonData === '[DONE]') continue;
              
                  try {
                    const event = JSON.parse(jsonData);
                    console.log('收到事件:', event);  // 添加事件日志
                    
                    // 修改记忆和目标更新逻辑
                    if (event.event === 'node_finished') {
                      if (event.data?.title === "记忆系统" && event.data?.outputs?.text) {
                        console.log('收到记忆系统事件，处理记忆:', event.data.outputs.text);
                        // 更新所有在场角色的记忆
                        sceneCharacters.forEach(character => {
                          const memoryKey = {
                            '奥菲利娅': 'aofeiliya_memory',
                            '雷欧提斯': 'leioutisi_memory',
                            '鬼魂': 'ghost_memory',
                            '波洛涅斯': 'boluoniesi_memory',
                            '克劳狄斯': 'kelaodisi_memory',
                            '霍拉旭': 'huolaxu_memory',
                            '王后': 'wanghou_memory'
                          }[character];
                          
                          if (memoryKey) {
                            const existingMemory = localMemories[memoryKey] || '';
                            const updatedMemory = existingMemory + event.data.outputs.text + '\n';
                            
                            // 更新本地记忆状态
                            setLocalMemories(prev => ({
                              ...prev,
                              [memoryKey]: updatedMemory
                            }));
                            
                            // 更新要传递的记忆
                            newMemories[memoryKey] = updatedMemory;
                          }
                        });
                      } else if (event.data?.title?.endsWith('目标') && event.data?.outputs?.text) {
                        console.log('收到目标系统事件，处理目标:', {
                          character: event.data.title.replace('目标', ''),
                          goal: event.data.outputs.text
                        });
                        
                        const characterName = event.data.title.replace('目标', '').trim();
                        const goalMapping = {
                          '奥菲利娅': 'aofeiliya_goal',
                          '雷欧提斯': 'leioutisi_goal',
                          '鬼魂': 'ghost_goal',
                          '波洛涅斯': 'boluoniesi_goal',
                          '克劳狄斯': 'kelaodisi_goal',
                          '霍拉旭': 'huolaxu_goal',
                          '王后': 'wanghou_goal'
                        } as const;
                        
                        const goalKey = goalMapping[characterName as keyof typeof goalMapping];
                        
                        if (goalKey) {
                          newGoals[goalKey] = event.data.outputs.text;
                          // 立即更新本地目标状态
                          setLocalGoals(prev => {
                            const updatedGoals = {
                              ...prev,
                              [goalKey]: event.data.outputs.text
                            };
                            console.log(`更新角色 ${characterName} 的目标:`, event.data.outputs.text);
                            return updatedGoals;
                          });
                        }
                      }
                    }
                  } catch (error) {
                    console.error('解析记忆数据错误:', error);
                    continue;
                  }
                }
              }
              
              
              // 收集当前场景中的所有对话
              const dialogues: Record<string, string> = {};
              speeches.forEach(speech => {
                if (speech.content.trim()) {
                  dialogues[speech.character] = speech.content.trim();
                }
              });

              // 更新剧本
              if (Object.keys(dialogues).length > 0) {
                onScriptUpdate(dialogues);
              }

              // 确保记忆和目标被正确传递
              console.log('对话结束，最终记忆状态:', newMemories);
              console.log('对话结束，最终目标状态:', newGoals);
              
              // 分别处理记忆和目标数据
              const finalMemories = {
                ...localMemories,
                ...Object.fromEntries(
                  Object.entries(newMemories).filter(([key]) => key.endsWith('_memory'))
                )
              };
              
              // 目标数据直接使用新目标，不合并旧目标
              const finalGoals = Object.fromEntries(
                Object.entries(newGoals).filter(([key]) => key.endsWith('_goal'))
              );
              
              onComplete({ ...finalMemories });
              onGoalsUpdate({ ...finalGoals });
              onExit();
              
            } catch (error) {
              console.error('结束对话错误:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          className="text-white/60 hover:text-white/90 transition-colors"
          title="结束对话"
        >
          ✕
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入你想说的话..."
          className="flex-1 bg-transparent text-white border-none outline-none placeholder-white/40"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`text-white/60 ${isLoading ? 'opacity-50' : ''}`}
          disabled={isLoading}
        >
          →
        </button>
      </form>
    </div>
    
    {/* 历史对话按钮 - 右上角 */}
    <button
      onClick={toggleHistory}
      className="absolute top-4 right-4 z-50 bg-black/50 text-white/80 hover:text-white p-2 rounded-full"
      title="查看历史对话"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
    
    {/* 加载指示器 - 居中显示 */}
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-black/30 p-4 rounded-full backdrop-blur-sm">
          <div className="loader">
            <div className="loader-inner ball-pulse">
              <div style={{ backgroundColor: 'white' }}></div>
              <div style={{ backgroundColor: 'white' }}></div>
              <div style={{ backgroundColor: 'white' }}></div>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* 历史对话面板 */}
    {showHistory && (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-auto p-4">
        <div className="max-w-2xl mx-auto rounded-lg p-4 my-8 bg-black/40 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold">历史对话</h2>
            <button 
              onClick={toggleHistory}
              className="text-white/60 hover:text-white/90 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {speeches
              .filter(speech => {
                const trimmedContent = speech.content.trim();
                if (!trimmedContent) return false;
                
                // 修改过滤规则，确保保留用户（哈姆雷特）的消息
                if (speech.character === '哈姆雷特') return true;
                
                // 其他角色的消息仍然需要过滤
                if (/^[?？!！.,。，：:；;()（）""'']+$/.test(trimmedContent)) return false;
                if (/\\u[0-9a-fA-F]{4}/.test(trimmedContent)) return false;
                
                return true;
              })
              .slice()
              .reverse()
              .map((speech, index) => (
                <div key={index} className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="font-bold text-white/80 mb-1">{speech.character}:</div>
                  <div className="text-white">{speech.content.trim()}</div>
                </div>
              ))}
              
            {speeches.filter(speech => speech.content.trim()).length === 0 && (
              <div className="text-white/60 text-center py-8">暂无对话记录</div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default GameScene;
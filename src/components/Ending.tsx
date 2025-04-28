import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface EndingProps {
  conversationId?: string;
  onComplete: () => void;
  onAddEndingToScript: (endingText: string) => void; // 添加新属性
  sceneCharacters?: string[];
  characterMemories?: Record<string, string>;
  characterGoals?: Record<string, string>;
  script?: string[];
}

const Ending: React.FC<EndingProps> = ({ onComplete, onAddEndingToScript, sceneCharacters = [], characterMemories = {}, characterGoals = {}, script = [] }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // 使用 useRef 创建持久化标志

  useEffect(() => {
    // 移除旧的 called 变量
    const fetchEnding = async () => {
    // 获取结局内容并处理流式响应
      try {
        const response = await fetch(import.meta.env.VITE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {
              npc: sceneCharacters.join(','),
              people: sceneCharacters.length,
              ghost_memory: characterMemories.ghost_memory || '',
              aofeiliya_memory: characterMemories.aofeiliya_memory || '',
              boluoniesi_memory: characterMemories.boluoniesi_memory || '',
              kelaodisi_memory: characterMemories.kelaodisi_memory || '',
              huolaxu_memory: characterMemories.huolaxu_memory || '',
              wanghou_memory: characterMemories.wanghou_memory || '',
              leioutisi_memory: characterMemories.leioutisi_memory || '',
              ghost_goal: characterGoals.ghost_goal || '',
              aofeiliya_goal: characterGoals.aofeiliya_goal || '',
              boluoniesi_goal: characterGoals.boluoniesi_goal || '',
              kelaodisi_goal: characterGoals.kelaodisi_goal || '',
              huolaxu_goal: characterGoals.huolaxu_goal || '',
              wanghou_goal: characterGoals.wanghou_goal || '',
              leioutisi_goal: characterGoals.leioutisi_goal || ''
            },
            query: '结局撰写',
            response_mode: "streaming",
            user: "hamlet",
          })
        });
        
        if (!response.ok) {
          throw new Error('获取结局失败');
        }
        
        const reader = response.body?.getReader();
        if (!reader) return;
        
        const decoder = new TextDecoder();
        let buffer = '';
      setDisplayedText(''); // 清空初始文本
        
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
              console.log('收到事件:', event);
              
            if (event.event === 'node_finished' && event.data?.title === '结局撰写') {
              if (event.data?.outputs?.text) {
                const finalEndingText = event.data.outputs.text;
                setDisplayedText(finalEndingText);
                setIsLoading(false);
                // 在结局加载完成后调用函数将其添加到剧本
                onAddEndingToScript(finalEndingText);
                break; // 获取到完整结局后跳出循环
              }
            }
            } catch (error) {
              console.error('JSON解析错误:', error);
              continue;
            }
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        setIsLoading(false);
      }
    };
    if (!hasFetched.current) { // 检查 ref 的 current 值
      hasFetched.current = true; // 设置 ref 的 current 值为 true
      fetchEnding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({sceneCharacters, characterMemories, characterGoals, script})]);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  
  const handleDownload = () => {
    const markdownContent = script.join('\n\n');
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.download = `哈姆雷特五幕之外_${new Date().toISOString().slice(0, 10)}.md`;
      downloadRef.current.click();
    }
    
    URL.revokeObjectURL(url);
  };

  const handleReturnToHome = () => {
    // 清空本地存储
    localStorage.clear();
    // 调用onComplete回到主页
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black p-8 overflow-auto relative"
    >
      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 bg-white text-black p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </motion.button>
      <a ref={downloadRef} style={{ display: 'none' }} />
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-white text-center py-8">加载中...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <><pre
                              className="text-white font-serif whitespace-pre-wrap text-lg leading-relaxed"
                              style={{ fontFamily: "'字心坊李林哥特体简体中文', serif" }}
                          >
                              {displayedText}
                          </pre><motion.button
                              onClick={handleReturnToHome}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-8 px-6 py-3 bg-transparent text-white border border-white rounded-lg hover:bg-white hover:text-black transition-colors mx-auto block font-['字心坊李林哥特体简体中文'] text-xl" // 修改这里的 className
                          >
                                  <span className="text-xl tracking-[0.2em] uppercase" style={{ fontFamily: "'字心坊李林哥特体简体中文', serif" }}>
                                      回到主页
                                  </span>
                              </motion.button></>
        )}
      </div>
    </motion.div>
  );
};

export default Ending;
import Stack from './Stack';
import { useEffect, useState } from 'react';
import 'animate.css';

interface CharacterIntroProps {
  onComplete: () => void;
}

// 添加角色描述数据
const characterDescriptions = {
  "霍拉旭": {
    name: "霍拉旭",
    identity: "哈姆雷特的好友，维滕贝格大学的学生，理性且谨慎的旁观者。",
    relationships: "哈姆雷特的挚友，两人关系亲密且相互信任。对克劳狄斯和宫廷政治持保留态度，但保持礼貌。"
  },
  "克劳狄斯": {
    name: "克劳狄斯",
    identity: "现任丹麦国王，哈姆雷特的叔叔。",
    relationships: "娶了哈姆雷特的母亲格特鲁德，成为他的继父。作为新登基的国王，他努力巩固自己的权力，并试图赢得臣民的支持。"
  },
  "哈姆雷特": {
    name: "哈姆雷特",
    identity: "丹麦王子，已故国王的儿子。",
    relationships: "对母亲格特鲁德（现任王后）感到失望。对叔叔克劳狄斯（新任国王）心存疑虑。与奥菲莉娅有一段暧昧未明的感情。"
  },
  "波洛涅斯": {
    name: "波洛涅斯",
    identity: "丹麦宫廷大臣，奥菲莉娅和雷欧提斯的父亲。",
    relationships: "忠诚于克劳狄斯。对女儿奥菲莉娅严格管教。注重维护家族利益和社会地位。"
  },
  "奥菲利娅": {
    name: "奥菲利娅",
    identity: "波洛涅斯的女儿，哈姆雷特的恋人。",
    relationships: "深爱哈姆雷特。听从父亲波洛涅斯。"
  },
  "老国王": {
    name: "老国王",
    identity: "已故的丹麦国王，哈姆雷特的父亲，克劳狄斯的哥哥。",
    relationships: ""
  },
  "雷欧提斯": {
    name: "雷欧提斯",
    identity: "波洛涅斯的儿子，奥菲莉娅的哥哥。",
    relationships: "忠诚于家族，对父亲波洛涅斯尊敬。与哈姆雷特有复杂的关系。"
  },
  "格特鲁德": {
    name: "格特鲁德",
    identity: "哈姆雷特的母亲，现任王后。",
    relationships: "再婚嫁给克劳狄斯，这让哈姆雷特对你感到失望。 尽管如此，她仍然深爱自己的儿子，并希望缓和他与克劳狄斯之间的紧张关系。 "
  }
};

const characters = [
  { id: 1, img: "/New_Hamlet/images/奥菲利娅.png", name: "奥菲利娅" },
  { id: 2, img: "/New_Hamlet/images/波洛涅斯.png", name: "波洛涅斯" },
  { id: 3, img: "/New_Hamlet/images/霍拉旭.png", name: "霍拉旭" },
  { id: 4, img: "/New_Hamlet/images/克劳狄斯.png", name: "克劳狄斯" },
  { id: 5, img: "/New_Hamlet/images/老国王.png", name: "老国王" },
  { id: 6, img: "/New_Hamlet/images/雷欧提斯.png", name: "雷欧提斯" },
  { id: 7, img: "/New_Hamlet/images/王后.png", name: "格特鲁德"}
];

const CharacterIntro: React.FC<CharacterIntroProps> = ({ onComplete }) => {
  // 添加状态来跟踪当前选中的角色
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onComplete();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [onComplete]);

  // 处理角色选择
  const handleCharacterSelect = (name: string) => {
    setSelectedCharacter(name);
  };

  return (
    <div className="relative flex items-center justify-center w-screen h-screen">
      <div className="flex w-full max-w-6xl mx-auto">
        {/* 左侧卡片区域 */}
        <div className="w-1/2 flex justify-center items-center">
          <Stack
            randomRotation={true}
            sensitivity={180}
            sendToBackOnClick={false}
            cardDimensions={{ width: 400, height: 500 }}
            cardsData={characters}
            onCardFocus={handleCharacterSelect}
          />
        </div>
        
        {/* 右侧角色介绍区域 */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="text-white p-8 max-w-md font-['字心坊李林哥特体简体中文'] text-shadow-lg">
            {selectedCharacter && characterDescriptions[selectedCharacter as keyof typeof characterDescriptions] ? (
              <div className="animate__animated animate__fadeIn">
                <h2 className="text-4xl font-bold mb-6 text-shadow-md">{characterDescriptions[selectedCharacter as keyof typeof characterDescriptions].name}</h2>
                <div className="mb-6">
                  <h3 className="text-3xl font-semibold mb-4 text-shadow-sm">身份</h3>
                  <p className="text-white text-shadow-sm text-xl mb-6 ">{characterDescriptions[selectedCharacter as keyof typeof characterDescriptions].identity}</p>
                </div>
                {characterDescriptions[selectedCharacter as keyof typeof characterDescriptions].relationships && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-4 text-shadow-sm ">人物关系</h3>
                    <p className="text-white text-shadow-sm text-xl ">{characterDescriptions[selectedCharacter as keyof typeof characterDescriptions].relationships}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white font-['字心坊李林哥特体简体中文']">
                <p className="text-xl">请选择一个角色查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 text-white text-2xl animate-pulse font-['字心坊李林哥特体简体中文'] text-shadow-md text-stroke-sm">
        按回车键继续
      </div>
    </div>
  );
}

export default CharacterIntro;
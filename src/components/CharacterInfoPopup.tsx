import React from 'react';
import { motion } from 'framer-motion';

// 从CharacterIntro导入角色描述数据
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
    relationships: "忠诚于家族，对父亲波洛涅斯尊敬。"
  },
  "格特鲁德": {
    name: "格特鲁德",
    identity: "哈姆雷特的母亲，现任王后。",
    relationships: "再婚嫁给克劳狄斯，这让哈姆雷特对你感到失望。 尽管如此，她仍然深爱自己的儿子，并希望缓和他与克劳狄斯之间的紧张关系。 "
  }
};

interface CharacterInfoPopupProps {
  character: string;
  onClose: () => void;
}

const CharacterInfoPopup: React.FC<CharacterInfoPopupProps> = ({ character, onClose }) => {
  const description = characterDescriptions[character as keyof typeof characterDescriptions];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
      onClick={onClose}
    >
      <motion.div 
        className="bg-black border border-white p-6 rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-2xl mb-4 font-serif">{character}</h2>
        {description ? (
          <div className="text-white font-serif">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">身份</h3>
              <p>{description.identity}</p>
            </div>
            {description.relationships && (
              <div>
                <h3 className="text-xl font-semibold mb-2">人物关系</h3>
                <p>{description.relationships}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white font-serif">暂无角色介绍信息</p>
        )}
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
        >
          关闭
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CharacterInfoPopup;
import React from 'react';
import { motion } from 'framer-motion';

interface GuideProps {
  onContinue: () => void;
}

const Guide: React.FC<GuideProps> = ({ onContinue }) => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl text-2xl space-y-4 mb-8 text-center" style={{ fontFamily: "ZiXinFang, 'Times New Roman', serif", letterSpacing: '0.1em' }}>
        <p>桀桀桀！当你点击开始游戏的那一刻后，你的一部分灵魂被我转移到哈姆雷特身上啦！</p>
        <p>你问谁是哈姆雷特？哈姆雷特是由英国剧作家威廉·莎士比亚创作于1599年至1602年间的一部悲剧作品的主角。戏剧讲述了叔叔克劳狄斯谋害了哈姆雷特的父亲，篡取了王位，并娶了国王的遗孀乔特鲁德；哈姆雷特王子因此为父王向叔叔复仇。</p>
        <p>所以，你的目标是扮演哈姆雷特，向当朝的国王复仇？</p>
        <p>大错特错！你可是一个完全自由的人，你可以做任何你想做的事情，创造只属于你的结局。</p>
        <p>举个例子，你可以复仇，相反也可以认贼做父。结局？取决于每个角色的意图。</p>
        <p>哦对！我还要提醒你，每个角色意图对结局影响不会亚于你哦！</p>
        <p>总而言之，这个游戏没有任务，没有目标，没有奖励，没有惩罚，没有限制。</p>
        <p>告诉我你的答案吧，”哈姆雷特“。</p>
        <p>你会演绎出什么样的结局呢？</p>
      </div>
      <motion.button
        onClick={onContinue}
        className="bg-black border border-white py-3 px-8 inline-block hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl tracking-[0.2em] uppercase" style={{ fontFamily: "'字心坊李林哥特体简体中文', serif" }}>
          角色介绍
        </span>
      </motion.button>
    </motion.div>
  );
};

export default Guide;
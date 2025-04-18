import React from 'react';
import { motion } from 'framer-motion';
import SplitText from './SplitText';

interface TransitionProps {
  onComplete: () => void;
}

const Transition: React.FC<TransitionProps> = ({ onComplete }) => {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
    // 动画完成后延迟一段时间再触发完成回调
    setTimeout(onComplete, 1000);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SplitText
        text="生存还是毁灭，取决于你的选择"
        className="text-6xl font-semibold text-center"
        delay={150}
        animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        easing={(t) => t}
        threshold={0.2}
        rootMargin="-50px"
        onLetterAnimationComplete={handleAnimationComplete}
      />
    </motion.div>
  );
};

export default Transition;
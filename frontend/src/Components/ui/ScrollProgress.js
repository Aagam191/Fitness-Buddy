import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5px',
        background: 'linear-gradient(90deg, #ff0000 0%, #ff5e00 50%, #ff0055 100%)',
        transformOrigin: '0%',
        zIndex: 9999,
        boxShadow: '0 0 12px rgba(255, 0, 0, 0.8), 0 0 4px rgba(255, 94, 0, 0.6)',
      }}
    />
  );
}

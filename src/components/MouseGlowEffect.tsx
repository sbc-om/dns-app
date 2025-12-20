'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseGlowEffect() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isActive, setIsActive] = useState(false);

  // Smooth spring configuration
  const springConfig = { damping: 30, stiffness: 200, mass: 0.3 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!isActive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Main spotlight effect */}
      <motion.div
        className="absolute w-[800px] h-[800px]"
        style={{
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(168, 85, 247, 0.1) 25%, rgba(236, 72, 153, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Secondary glow layer */}
      <motion.div
        className="absolute w-[600px] h-[600px]"
        style={{
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(96, 165, 250, 0.08) 40%, transparent 65%)',
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Inner bright core */}
      <motion.div
        className="absolute w-[400px] h-[400px]"
        style={{
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 35%, rgba(96, 165, 250, 0.05) 60%, transparent 80%)',
          filter: 'blur(30px)',
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Subtle outer atmosphere */}
      <motion.div
        className="absolute w-[1000px] h-[1000px]"
        style={{
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.04) 30%, transparent 60%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

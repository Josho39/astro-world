'use client';

import { useState, useEffect } from 'react';

const AnimatedParticles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    width: string;
    height: string;
    top: string;
    left: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);
  
  useEffect(() => {
    const newParticles = [...Array(6)].map((_, i) => ({
      id: i,
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 10 + 5}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`
    }));
    
    setParticles(newParticles);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(particle => (
        <div 
          key={particle.id}
          className="absolute rounded-full bg-primary/30 animate-float"
          style={{
            width: particle.width,
            height: particle.height,
            top: particle.top,
            left: particle.left,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedParticles;
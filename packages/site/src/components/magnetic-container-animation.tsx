import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.5 };
const MAX_DISTANCE = 0.08;

export default function MagneticContainer({
    children,
    className,
    style
}: { 
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      if (isHovered) {
        x.set(distanceX * MAX_DISTANCE);
        y.set(distanceY * MAX_DISTANCE);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        //position: 'relative',
        ...style,
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  );
}
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Avatar, { AvatarItem, AvatarWrapper } from './avatar';

interface AvatarGroupProps {
  items: AvatarItem[];
  className?: string;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarGroup = ({ items, className, maxVisible = 5, size = 'md' }: AvatarGroupProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleItems = items.slice(0, maxVisible);

  return (
    <div className={cn('flex items-center justify-center -space-x-2', className)}>
      {visibleItems.map((item, index) => (
        <motion.div
          key={index}
          className="relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          animate={{
            x: hoveredIndex !== null && index > hoveredIndex ? 16 : 0, // <-- The push distance
          }}
          style={{ zIndex: visibleItems.length + index }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Avatar name={item.name} url={item.url} image={item.image} size={size} />
        </motion.div>
      ))}

      <AvatarWrapper name='Browse all' url='/medusa-plugins'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-ui-border-base bg-ui-bg-base text-muted-foreground font-medium',
            size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12',
            'relative'
          )}
          style={{ zIndex: 0 }}
		  >
	          {/* TODO: make it better */}
	          <span className="text-ui-fg-muted">+83</span>
        </motion.div>
      </AvatarWrapper>
    </div>
  );
};

export default AvatarGroup;

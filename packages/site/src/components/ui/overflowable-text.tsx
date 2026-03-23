'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from '@/components/ui/marquee';

export default function OverflowableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  if (isOverflowing) {
    return (
      <Marquee className={className}>
        <MarqueeContent speed={40}>
          <MarqueeItem className="text-sm text-ui-fg-subtle">{text}</MarqueeItem>
        </MarqueeContent>
        <MarqueeFade side="left" className="w-6" />
        <MarqueeFade side="right" className="w-6" />
      </Marquee>
    );
  }

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}

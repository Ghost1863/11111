'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from '@medusajs/icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function PluginInfoSupportBanner({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollY } = useScroll({
    target: containerRef,
    axis: 'y',
    offset: ['start end', 'end start'],
  });

  const [hidden, setHidden] = useState(false);
  const t = useTranslations('MedusaPluginsDetailPage');

  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    defaultValue: true,
    initializeWithValue: false,
  });
  const isMobile = useMediaQuery('(max-width: 639px)', {
    defaultValue: false,
    initializeWithValue: false,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (!containerRef.current || !isDesktop) return;
    setHidden(containerRef.current.clientHeight - latest < 350);
  });

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, height: isMobile ? 'auto' : 90, marginBottom: 0 }}
      animate={
        isDesktop && hidden
          ? { y: -800, opacity: 0, height: 0, marginBottom: -32 }
          : { y: 0, opacity: 1, height: isMobile ? 'auto' : 90 }
      }
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex container mx-auto border-b flex-col text-center gap-2 sm:flex-row sm:text-left justify-between items-center px-6 sm:px-8  py-4 animate-slide-bg bg-size-[1000px] bg-pattern"
    >
      <h4 className="text-lg sm:max-w-44 text-ui-fg-base">{t('needSupport')}</h4>
      <Button size="large" variant="accent" asChild>
        <Link href="/about">
          {t('getInTouch')}
          <ArrowRight />
        </Link>
      </Button>
    </motion.div>
  );
}

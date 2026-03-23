'use client';

import { Book, MagnifyingGlass } from '@medusajs/icons';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type React from 'react';
import MagneticContainer from '@/components/magnetic-container';
import { Button } from '@/components/ui/button';
import useGorgoDocsLink from '@/hooks/useGorgoHomeLink';

type Part = {
  text?: string;
  textKey: string;
  spaceRight?: boolean;
  dx: number;
  dy: number;
  delay: number;
  dur: number;
  blur: number;
  blurDur?: number;
  style?: React.CSSProperties;
};

const HEADLINE_PARTS: { line1: Part[]; line2: Part[] } = {
  line1: [
    {
      textKey: 'heroTitle1',
      spaceRight: false,
      dx: 0,
      dy: -35,
      delay: 0.0,
      dur: 1.25,
      blur: 12,
      blurDur: 0.8,
      style: {
        whiteSpace: 'nowrap',
      },
    },
  ],
  line2: [
    {
      textKey: 'heroTitle2',
      spaceRight: true,
      dx: -18,
      dy: -20,
      delay: 0.2,
      dur: 1.25,
      blur: 12,
      blurDur: 0.8,
      style: {
        whiteSpace: 'nowrap',
      },
    },
    {
      textKey: 'heroTitle3',
      spaceRight: true,
      dx: 0,
      dy: -25,
      delay: 0,
      dur: 0.7,
      blur: 12,
      blurDur: 0.9,
      style: {
        background: 'linear-gradient(128deg, #DEBA92 35.7%, #9F724E 61.98%, #32150C 96.98%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
    {
      textKey: 'heroTitle4',
      dx: 18,
      dy: -20,
      delay: 0.28,
      dur: 1.25,
      blur: 12,
      blurDur: 0.8,
      style: {
        whiteSpace: 'nowrap',
      },
    },
  ],
};

const SUBTITLE_PARTS: { line1: Part[]; line2: Part[] } = {
  line1: [
    {
      textKey: 'heroSubtitle1',
      spaceRight: true,
      dx: -10,
      dy: -25,
      delay: 0.4,
      dur: 0.9,
      blur: 10,
      blurDur: 0.5,
    },
    {
      textKey: 'heroSubtitle2',
      spaceRight: true,
      dx: 0,
      dy: -25,
      delay: 0.37,
      dur: 0.9,
      blur: 10,
      blurDur: 0.5,
    },
    {
      textKey: 'heroSubtitle3',
      spaceRight: true,
      dx: 10,
      dy: -25,
      delay: 0.4,
      dur: 0.9,
      blur: 10,
      blurDur: 0.5,
    },
  ],
  line2: [
    {
      textKey: 'heroSubtitle4',
      spaceRight: true,
      dx: 0,
      dy: -15,
      delay: 0.43,
      dur: 0.9,
      blur: 10,
      blurDur: 0.5,
    },
  ],
};

const BUTTON_REVEALS = {
  secondary: { dx: -13, dy: -14, delay: 0.46, dur: 1.2, blur: 10, blurDur: 0.45 },
  accent: { dx: 13, dy: -18, delay: 0.46, dur: 1.2, blur: 10, blurDur: 0.45 },
};

function Chunk({
  text,
  spaceRight,
  dx,
  dy,
  delay,
  dur,
  blur,
  blurDur,
  prefersReduced,
  style,
}: Part & { prefersReduced: boolean }) {
  const content = spaceRight ? `${text}\u00A0` : text;
  const outerInitial = prefersReduced ? { opacity: 0 } : { x: dx, y: dy, opacity: 0 };
  const outerAnimate = prefersReduced ? { opacity: 1 } : { x: 0, y: 0, opacity: 1 };
  const blurInitial = prefersReduced ? { filter: 'blur(0px)' } : { filter: `blur(${blur}px)` };
  const blurAnimate = { filter: 'blur(0px)' };
  const blurDuration = Math.max(0.001, blurDur ?? dur * 0.95);

  return (
    <motion.span
      className="inline-block align-baseline transform-gpu will-change-transform"
      initial={outerInitial}
      animate={outerAnimate}
      transition={{ delay, duration: dur, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <motion.span
        className="inline-block will-change-[filter] "
        initial={blurInitial}
        animate={blurAnimate}
        transition={{ delay, duration: blurDuration, ease: 'linear' }}
        style={{
          ...style,
        }}
      >
        {content}
      </motion.span>
    </motion.span>
  );
}

function RevealIn({
  children,
  dx,
  dy,
  delay,
  dur,
  blur,
  blurDur,
  prefersReduced,
  className,
}: {
  children: React.ReactNode;
  dx: number;
  dy: number;
  delay: number;
  dur: number;
  blur: number;
  blurDur?: number;
  prefersReduced: boolean;
  className?: string;
}) {
  const outerInitial = prefersReduced ? { opacity: 0 } : { x: dx, y: dy, opacity: 0 };
  const outerAnimate = prefersReduced ? { opacity: 1 } : { x: 0, y: 0, opacity: 1 };
  const blurInitial = prefersReduced ? { filter: 'blur(0px)' } : { filter: `blur(${blur}px)` };
  const blurDuration = Math.max(0.001, blurDur ?? dur * 0.9);

  return (
    <motion.div
      className={className}
      initial={outerInitial}
      animate={outerAnimate}
      transition={{ delay, duration: dur, ease: [0.22, 1, 0.36, 1] }}
      style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
    >
      <motion.div
        initial={blurInitial}
        animate={{ filter: 'blur(0px)' }}
        transition={{ delay, duration: blurDuration, ease: 'linear' }}
        style={{ willChange: 'filter' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const t = useTranslations('HomePage');
  const prefersReduced = !!useReducedMotion();
  const gorgoDocsLink = useGorgoDocsLink();

  return (
    <section className="flex flex-col justify-center items-center pb-0 px-6 pt-16 md:pt-52">
      <h1 className="text-4xl lg:text-6xl tracking-tight text-center pb-2 text-ui-fg-base leading-tight">
        {HEADLINE_PARTS.line1.map((p, i) => (
          <Chunk key={`hl1-${i}`} {...p} text={t(p.textKey)} prefersReduced={prefersReduced} />
        ))}
        <br />
        {HEADLINE_PARTS.line2.map((p, i) => (
          <Chunk key={`hl2-${i}`} {...p} text={t(p.textKey)} prefersReduced={prefersReduced} />
        ))}
      </h1>

      <p className="text-lg text-ui-fg-subtle max-w-2xl text-center leading-relaxed mt-3">
        <span className="inline-block">
          {SUBTITLE_PARTS.line1.map((p, i) => (
            <Chunk key={`st1-${i}`} {...p} text={t(p.textKey)} prefersReduced={prefersReduced} />
          ))}
        </span>
        <br />
        <span className="inline-block">
          {SUBTITLE_PARTS.line2.map((p, i) => (
            <Chunk key={`st2-${i}`} {...p} text={t(p.textKey)} prefersReduced={prefersReduced} />
          ))}
        </span>
      </p>

      <div className="mt-8 flex gap-3">
        <MagneticContainer>
          <RevealIn {...BUTTON_REVEALS.secondary} prefersReduced={prefersReduced}>
            <Button size="large" variant="secondary" asChild>
              <Link href={gorgoDocsLink} target="_blank" rel="noreferrer">
                <span className="flex flex-col">
                  <span className="opacity-56 text-xs whitespace-nowrap">
                    {t('readDocsSubtitle')}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <Book />
                    <span className="whitespace-nowrap">{t('readDocs')}</span>
                  </span>
                </span>
              </Link>
            </Button>
          </RevealIn>
        </MagneticContainer>
        <MagneticContainer>
          <RevealIn {...BUTTON_REVEALS.accent} prefersReduced={prefersReduced}>
            <Button size="large" variant="accent" asChild>
              <Link href="/medusa/plugins">
                <span className="flex flex-col">
                  <span className="opacity-56 text-xs whitespace-nowrap">
                    {t('browsePluginsSubtitle')}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <MagnifyingGlass />
                    <span className="whitespace-nowrap">
                      {t('browsePlugins')}
                    </span>
                  </span>
                </span>
              </Link>
            </Button>
          </RevealIn>
        </MagneticContainer>
      </div>
    </section>
  );
}

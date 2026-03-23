'use client'

import React, { useEffect, useMemo, useRef, useState, useId, useCallback } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  type MotionValue,
  animate,
} from 'framer-motion'
import { createPortal } from 'react-dom'
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"

import { useMagnet } from '@/components/useMagnet'
import Avatar from '@/components/ui/avatar'
import { useRefContext } from '@/components/ref-provider'

import Amazon from '@/svg/icons/amazon-icon-dark.svg'
import Contentful from '@/svg/icons/contentful-icon.svg'
import Github from '@/svg/icons/github-icon-dark.svg'
import Google from '@/svg/icons/google.svg'
import Yandex from '@/svg/icons/yandex-ru-icon.svg'
import Telegram from '@/svg/icons/telegram-icon.svg'
import YooKassa from '@/svg/icons/yookassa-icon.svg'
import OneC from '@/svg/icons/1c-icon.svg'
import Stripe from '@/svg/icons/stripe-icon.svg'
import Odoo from '@/svg/icons/odoo-icon-dark.svg'
import paypal from '@/svg/icons/paypal.svg'
import Tbank from '@/svg/icons/tbank-icon.svg'

const DELAY_ALL = 0.4

const BLUR = 12

const assembledScale = 0.5
const targetSize = 59

const SNAP_AT = 0.5
const SNAP_AT_2 = 0.7
const HYST = 0.02

const SNAP_EASE = [0.22, 1, 0.36, 1] as const
const SNAP_OUT_DUR = 0.45
const SNAP_BACK_DUR = 0.35
const SNAP_OUT_DUR_2 = .5
const SNAP_BACK_DUR_2 = .5

const SNAP_SHOW_AT = 0.999
const EPS = 0.001

const ARRIVE = 0
const waitUntil = (fn: () => boolean) =>
  new Promise<void>((resolve) => {
    const loop = () => (fn() ? resolve() : requestAnimationFrame(loop))
    loop()
  })

const PHASE1_OFFSETS: [`end ${number}%`, `end ${number}%`] = ['end 105%', 'end 70%']
const PHASE2_OFFSETS: [`start ${number}%`, `start ${number}%`] = ['start 0%', 'start -20%']

const VIEW_SAFE = 0

type IconSpec = {
  component: React.ComponentType<{ className?: string }>
  size: number
  finalX: number
  finalY: number
  tilt: number
  durarion: number
  logoX: number
  logoY: number
  iconScale?: number
}

const icons: IconSpec[] = [
  { component: Telegram, size: 75, finalX: -150, finalY: -150, tilt: 15, durarion: 0.8, logoX: 0, logoY: -134 },
  { component: Yandex, size: 50, finalX: 85, finalY: -160, tilt: 30, durarion: 0.5, logoX: 60, logoY: -107 },
  { component: Tbank, size: 65, finalX: 230, finalY: -160, tilt: -25, durarion: 0.3, logoX: 117, logoY: -67 },
  { component: Amazon, size: 60, finalX: 320, finalY: -60, tilt: -30, durarion: 0.8, logoX: 122, logoY: 0 },
  { component: Github, size: 45, finalX: 170, finalY: 20, tilt: 30, durarion: 0.7, logoX: 117, logoY: 67 },
  { component: OneC, size: 65, finalX: 260, finalY: 155, tilt: 25, durarion: 0.7, logoX: 60, logoY: 107 },
  { component: Stripe, size: 45, finalX: 120, finalY: 140, tilt: -30, durarion: 0.8, logoX: 0, logoY: 134 },
  { component: Google, size: 75, finalX: -85, finalY: 165, tilt: 30, durarion: 0.3, logoX: -60, logoY: 107 },
  { component: YooKassa, size: 60, finalX: -320, finalY: 140, tilt: -35, durarion: 0.1, logoX: -117, logoY: 67 },
  { component: Odoo, size: 50, finalX: -200, finalY: 80, tilt: 30, durarion: 0.2, logoX: -122, logoY: 0 },
  { component: Contentful, size: 50, finalX: -250, finalY: -30, tilt: -30, durarion: 0.8, logoX: -117, logoY: -67 },
  { component: paypal, size: 50, finalX: -290, finalY: -150, tilt: -15, durarion: 0.6, logoX: -60, logoY: -107 },
]

function useResponsivePositions(baseIcons: IconSpec[]) {
  const [scale, setScale] = React.useState(1)

  useEffect(() => {
    const calc = () => {
      const width = window.innerWidth
      let scale = 1
      if (width <= 360) scale = 0.50
      else if (width <= 420) scale = 0.65
      else if (width <= 480) scale = 0.75
      else if (width <= 640) scale = 0.8
      else if (width <= 768) scale = 0.9
      else scale = 1
      setScale(scale)
    }
    calc()
    window.addEventListener('resize', calc, { passive: true })
    return () => window.removeEventListener('resize', calc)
  }, [])

  return useMemo(
    () => baseIcons.map(i => ({ x: Math.round(i.finalX * scale), y: Math.round(i.finalY * scale) })),
    [baseIcons, scale]
  )
}

function useResponsiveCanvas(baseCanvasSize: number) {
  const [scale, setScale] = React.useState(1)

  useEffect(() => {
    const calc = () => {
      const width = window.innerWidth
      let scale = 1
      if (width <= 360) scale = 0.50
      else if (width <= 480) scale = 0.6
      else if (width <= 640) scale = 0.8
      else if (width <= 768) scale = 0.9
      else scale = 1
      setScale(scale)
    }
    calc()
    window.addEventListener('resize', calc, { passive: true })
    return () => window.removeEventListener('resize', calc)
  }, [])

  return useMemo(
    () => baseCanvasSize * scale,
    [baseCanvasSize, scale]
  )
}

function useResponsiveSizes(baseIcons: IconSpec[]) {
  const [scale, setScale] = React.useState(1)

  useEffect(() => {
    const calc = () => {
      const width = window.innerWidth
      let scale = 1
      if (width <= 360) scale = 0.75
      else if (width <= 420) scale = 0.85
      else if (width <= 480) scale = 0.9
      else if (width <= 640) scale = 0.95
      else scale = 1
      setScale(scale)
    }
    calc()
    window.addEventListener('resize', calc, { passive: true })
    return () => window.removeEventListener('resize', calc)
  }, [])

  return useMemo(
    () => baseIcons.map(i => Math.max(36, Math.round(i.size * scale))),
    [baseIcons, scale]
  )
}

function useCenterBoxSize(centerAnchorRef: { current: HTMLElement | null }) {
  const [centerBoxSize, setCenterBoxSize] = useState(0)

  const recalcCenterBoxSize = useCallback(() => {
    const anchorRect = centerAnchorRef.current?.getBoundingClientRect()
    if (!anchorRect) return
    const viewportWidth = window.innerWidth
    const clampedWidth = Math.min(anchorRect.width, viewportWidth)
    setCenterBoxSize(Math.max(1, Math.floor(clampedWidth)))
  }, [centerAnchorRef])

  useEffect(() => {
    recalcCenterBoxSize()
    const ro = new ResizeObserver(recalcCenterBoxSize)
    if (centerAnchorRef.current) ro.observe(centerAnchorRef.current)
    window.addEventListener('resize', recalcCenterBoxSize, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recalcCenterBoxSize)
    }
  }, [recalcCenterBoxSize, centerAnchorRef])
  return centerBoxSize
}

function MedusaLogo({
  isVisible,
  delay = 0.5,
  fadeDuration = 0.8,
  blurDuration = 0.8,
  initialBlur = `blur(${BLUR}px)`,
  maskRadius,
  logoScale,
  disableBlur = false,
}: {
  isVisible: boolean
  delay?: number
  fadeDuration?: number
  blurDuration?: number
  initialBlur?: string
  maskRadius: MotionValue<number>
  logoScale: MotionValue<number>
  disableBlur?: boolean
}) {
  const maskId = useId()
  const ease = [0, 0.71, 0.2, 1.01] as const
  const holeRadius = 40.51

  const fillProgress = useTransform(maskRadius, r => 1 - Math.min(1, Math.max(0, r / holeRadius)))
  const maskVelocity = useVelocity(maskRadius)

  const dynamicBlur = useTransform<number, number>(
    [useTransform(fillProgress, [0, SNAP_AT, 1], [0, 0, 12]), maskVelocity],
    ([base, velocity]) => (velocity < -0.01 ? base : 0)
  )

  const blurFilter = useTransform(dynamicBlur, blur => `blur(${blur}px)`)

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 size-[170px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{ scale: logoScale, willChange: 'transform' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, filter: disableBlur ? 'blur(0)' : initialBlur }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5, filter: 'blur(0)' }}
        transition={{
          opacity: { duration: fadeDuration, delay, ease },
          scale: { duration: fadeDuration, delay, ease },
          filter: { duration: disableBlur ? 0 : blurDuration, delay, ease: 'easeOut' },
        }}
        style={{ willChange: 'transform, opacity, filter' }}
      >
        <svg width="158" height="170" viewBox="0 0 158 170" fill="none">
          <defs>
            <mask id={maskId}>
              <rect width="158" height="170" fill="white" />
              <motion.circle
                cx="79.083"
                cy="85"
                r={maskRadius}
                fill="black"
                style={{ filter: disableBlur ? 'blur(0)' : (blurFilter as unknown as string) }}
              />
            </mask>
          </defs>

          {/* внешняя оболочка логотипа */}
          <path
            d="M137.951 27.5951L99.4739 5.44813C86.8844 -1.81604 71.4583 -1.81604 58.8688 5.44813L20.214 27.5951C7.8019 34.8593 0 48.3247 0 62.6759V107.147C0 121.676 7.8019 134.964 20.214 142.228L58.6916 164.551C71.281 171.816 86.7079 171.816 99.2964 164.551L137.774 142.228C150.363 134.964 157.988 121.676 157.988 107.147V62.6759C158.343 48.3247 150.541 34.8593 137.951 27.5951ZM79.083 124.51C57.2731 124.51 39.5414 106.793 39.5414 85C39.5414 63.2074 57.2731 45.4898 79.083 45.4898C100.893 45.4898 118.802 63.2074 118.802 85C118.802 106.793 101.07 124.51 79.083 124.51Z"
            className="fill-dark dark:fill-white"
          />
          {/* затычка, которая закрывает отверстие в нужный момент */}
          <g mask={`url(#${maskId})`}>
            <circle
              cx="79.083"
              cy="85"
              r={holeRadius + 0.75}
              className="fill-dark dark:fill-white"
            />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}

type IconMotionProps = {
  icon: IconSpec
  assembleProgress: MotionValue<number>
  position: { x: number, y: number }
  size: number
  inkSpinProgressMV: MotionValue<number>
  delay: number
  initialBlur: string
  blurDuration: number
  isVisible: boolean
  logoScale: MotionValue<number>
  disableMagnet?: boolean
}

function IconMotion({
  icon,
  assembleProgress,
  position,
  size,
  inkSpinProgressMV,
  delay,
  initialBlur,
  blurDuration,
  isVisible,
  logoScale,
  disableMagnet = false,
}: IconMotionProps) {
  // траектория
  const FIRST_OVERSHOOT_AT = 0.35
  const SECOND_OVERSHOOT_AT = 0.5
  const SPAWN_RADIUS_PX = 600
  const FIRST_OVERSHOOT_PX = 2
  const SECOND_OVERSHOOT_PX = 1

  // конечная точка
  const endX = position.x
  const endY = position.y

  // направление луча из центра
  const length = Math.hypot(endX, endY) || 1
  const dirX = endX / length
  const dirY = endY / length

  // старт далеко за кругом
  const startX = dirX * SPAWN_RADIUS_PX
  const startY = dirY * SPAWN_RADIUS_PX

  // две точки «перелёта» у финиша
  const firstX = endX - dirX * FIRST_OVERSHOOT_PX
  const firstY = endY - dirY * FIRST_OVERSHOOT_PX
  const secondX = endX + dirX * SECOND_OVERSHOOT_PX
  const secondY = endY + dirY * SECOND_OVERSHOOT_PX

  // дуга start -> first (квадр. Безье со смещением по нормали), затем second -> end
  function buildArcKeyframes({
    start, viaFirst, viaSecond, end,
    firstAt, secondAt, curvature = 0.1, samples = 100,
  }: {
    start: { x: number, y: number }
    viaFirst: { x: number, y: number }
    viaSecond: { x: number, y: number }
    end: { x: number, y: number }
    firstAt: number
    secondAt: number
    curvature?: number
    samples?: number
  }) {
    const dx = viaFirst.x - start.x, dy = viaFirst.y - start.y
    const seg = Math.hypot(dx, dy) || 1
    const nX = dy / seg, nY = -dx / seg
    const midX = start.x + dx * 0.5, midY = start.y + dy * 0.5
    const cX = midX + nX * (curvature * seg)
    const cY = midY + nY * (curvature * seg)

    const kx: number[] = [], ky: number[] = [], kt: number[] = []
    for (let i = 0; i <= samples; i++) {
      const t = i / samples, omt = 1 - t
      kx.push(omt * omt * start.x + 2 * omt * t * cX + t * t * viaFirst.x)
      ky.push(omt * omt * start.y + 2 * omt * t * cY + t * t * viaFirst.y)
      kt.push(firstAt * t)
    }
    kx.push(viaSecond.x, end.x)
    ky.push(viaSecond.y, end.y)
    kt.push(secondAt, 1)
    return { kx, ky, kt }
  }

  const { kx, ky, kt } = buildArcKeyframes({
    start: { x: startX, y: startY },
    viaFirst: { x: firstX, y: firstY },
    viaSecond: { x: secondX, y: secondY },
    end: { x: endX, y: endY },
    firstAt: FIRST_OVERSHOOT_AT,
    secondAt: SECOND_OVERSHOOT_AT,
  })

  const headerX = useTransform(logoScale, s => icon.logoX * s)
  const headerY = useTransform(logoScale, s => icon.logoY * s)

  // смещение к хедеру по прогрессу сборки
  const shiftX = useTransform<number, number>([assembleProgress, headerX], ([p, hx]) => p * (hx - endX))
  const shiftY = useTransform<number, number>([assembleProgress, headerY], ([p, hy]) => p * (hy - endY))

  // масштаб к targetSize с учётом responsive-иконки
  const targetScale = useTransform(logoScale, s => (targetSize * s) / size)
  const scaleOnAssemble = useTransform<number, number>([assembleProgress, targetScale], ([p, ts]) => 1 + (ts - 1) * p)

  // эффекты
  const spin = useTransform(inkSpinProgressMV, [0, 1], [0, 180])
  const maskDotOpacity = useTransform(assembleProgress, [0, SNAP_AT, 1], [0, 0, 1])

  const magnet = useMagnet(3)
  const moveX = useTransform<number, number>([shiftX, magnet.x], ([dx, mx]) => (disableMagnet ? dx : dx + mx))
  const moveY = useTransform<number, number>([shiftY, magnet.y], ([dy, my]) => (disableMagnet ? dy : dy + my))
  const magnetHandlers = disableMagnet ? {} : magnet.handlers

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <motion.div
        className="flex items-center justify-center"
        initial={{ x: startX, y: startY, scale: 0.25, opacity: 0, filter: initialBlur }}
        animate={isVisible
          ? { x: kx, y: ky, scale: 1, opacity: 1, filter: 'blur(0px)' }
          : { x: startX, y: startY, scale: 0.25, opacity: 0, filter: initialBlur }}
        transition={{
          x: { delay, duration: icon.durarion, times: kt, ease: 'easeInOut' },
          y: { delay, duration: icon.durarion, times: kt, ease: 'easeInOut' },
          scale: { delay, duration: icon.durarion * 0.85, ease: [0.2, 0.8, 0.2, 1] },
          opacity: { delay, duration: icon.durarion * 0.5, ease: 'easeOut' },
          filter: { delay, duration: blurDuration, ease: 'easeOut' },
        }}
        style={{ willChange: 'transform, opacity, filter' }}
        suppressHydrationWarning
      >
        <motion.div
          ref={magnet.ref}
          {...magnetHandlers}
          style={{
            x: moveX, y: moveY, scale: scaleOnAssemble,
            width: `${size - 2}px`, height: `${size - 2}px`,
            borderRadius: '9999px', backgroundColor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            willChange: 'transform', pointerEvents: 'auto',
          }}
        >
          <motion.div
            initial={{ rotate: icon.tilt }}
            animate={{ rotate: [icon.tilt - 120, icon.tilt] }}
            transition={{ delay, duration: icon.durarion, times: [0, 1], ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transformOrigin: '50% 50%' }}
          >
            <motion.div style={{ rotate: spin, willChange: 'transform', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: icon.iconScale ? `scale(${icon.iconScale})` : undefined }}>
              <Avatar size="xl" image={icon.component} style={{ width: `${size}px`, height: `${size}px` }} />
            </motion.div>
          </motion.div>

          <motion.svg className="absolute inset-0 z-10" style={{ opacity: maskDotOpacity, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <circle cx="50" cy="50" r="50" className="fill-dark dark:fill-white" />
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Scene({
  isFullyVisible,
  delayAll,
  blurTotalDuration,
  initialBlur,
  rMask,
  scaleMV,
  NO_BLUR,
  inkSpinProgressMV,
  approachProgress,
  positions,
  sizes,
  disableMagnet = false,
}: {
  isFullyVisible: boolean
  delayAll: number
  blurTotalDuration: number
  initialBlur: string
  rMask: MotionValue<number>
  scaleMV: MotionValue<number>
  NO_BLUR: boolean
  inkSpinProgressMV: MotionValue<number>
  approachProgress: MotionValue<number>
  positions: { x: number, y: number }[]
  sizes: number[]
  disableMagnet?: boolean
}) {
  return (
    <>
      <MedusaLogo
        isVisible={isFullyVisible}
        delay={delayAll}
        fadeDuration={2}
        blurDuration={blurTotalDuration * 0.8}
        initialBlur={initialBlur}
        maskRadius={rMask}
        logoScale={scaleMV}
        disableBlur={NO_BLUR}
      />
      {icons.map((icon, index) => (
        <IconMotion
          key={index}
          icon={icon}
          isVisible={isFullyVisible}
          delay={delayAll}
          initialBlur={initialBlur}
          blurDuration={blurTotalDuration}
          inkSpinProgressMV={inkSpinProgressMV}
          assembleProgress={approachProgress}
          position={positions[index]}
          size={sizes[index]}
          logoScale={scaleMV}
          disableMagnet={disableMagnet}
        />
      ))}
    </>
  )
}

export default function AnimatedLogos() {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const centerAnchorRef = useRef<HTMLDivElement | null>(null)
  const { headerLogoRef } = useRefContext()
  if (!headerLogoRef) throw new Error('Header logo ref is not available')

  const pathname = usePathname()
  const locale = useLocale()

  const [isFullyVisible, setIsFullyVisible] = useState(true)
  const prefersReduced = useReducedMotion()
  const NO_BLUR = !!prefersReduced

  const canvasWidth = "100%"
  const canvasHeight = useResponsiveCanvas(620)
  const positions = useResponsivePositions(icons)
  const sizes = useResponsiveSizes(icons)
  const centerBox = useCenterBoxSize(centerAnchorRef)

  /** Фаза 1: тайминги подлёта */
  const totalDuration = 2
  const blurTotalDuration = NO_BLUR ? 0 : totalDuration * 0.6

  const overlayinkSpinProgressMV = useMotionValue(1)
  const overlayApproachProgress = useMotionValue(1)

  useEffect(() => {
    if (!triggerRef.current) return
    const el = triggerRef.current
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) setIsFullyVisible(true)
      }),
      { threshold: [0.4, 1.0] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggerRef])

  const distances = positions.map(p => Math.hypot(p.x, p.y))
  const maxDistance = Math.max(...distances)
  icons.forEach((icon, index) => { icon.durarion = totalDuration * (distances[index] / maxDistance) })

  const initialBlur = NO_BLUR ? 'blur(0px)' : `blur(${BLUR}px)`

  const { scrollYProgress: assembleScrollRaw } = useScroll({ target: triggerRef, offset: PHASE1_OFFSETS })
  const assembleScrollVel = useVelocity(assembleScrollRaw)
  const pendingRevealRef = useRef<{ from: number } | null>(null)
  const approachLinear = useTransform(assembleScrollRaw, [0, 1], [0, 1])
  const approachProgress = useSpring(approachLinear, { stiffness: 140, damping: 18, mass: 0.35 })
  const scrollP = approachProgress
  const assembleSnap = useMotionValue(0) // 0=center, 1=assembled
  const assembleProgressHybrid = useTransform<number, number>([scrollP, assembleSnap], ([p, t]) => p + (1 - p) * t)

  const holeR = 39.51
  const logoHoleRadiusMV = useTransform(assembleSnap, [0, 1], [holeR, 0])
  const logoScaleOnAssembleMV = useTransform(assembleProgressHybrid, [0, 1], [1, assembledScale])
  const inkSpinProgressMV = useTransform<number, number>(
    [scrollP, assembleSnap],
    ([p, t]) => (p < SNAP_AT ? t : p + (1 - p) * t)
  )

  /** ——— Перелёт (snap #2) — time-based ——— */
  const { scrollYProgress: flyScrollRaw } = useScroll({ target: triggerRef, offset: PHASE2_OFFSETS })

  const flyScrollLinear = useTransform(flyScrollRaw, [0, 1], [0, 1])
  const flyScrollP = useSpring(flyScrollLinear, { stiffness: 140, damping: 18, mass: 0.35 })

  // снап-тумблер фазы 2: 0 — тянем скроллом, 1 — дожимаем таймлайном
  const flySnap = useMotionValue(0)

  // гибрид: сначала идём по скроллу, потом дожимаем снапом
  const flyProgressMV = useTransform<number, number>(
    [flyScrollP, flySnap],
    ([p, t]) => p + (1 - p) * t
  )

  // ДОБАВЛЕНО: флаг «прилетели в центр» по реальному flyProgressMV
  const hasArrivedRef = useRef(flyProgressMV.get() <= ARRIVE)
  useEffect(() => {
    const u = flyProgressMV.on('change', (v) => { hasArrivedRef.current = v <= ARRIVE })
    hasArrivedRef.current = flyProgressMV.get() <= ARRIVE
    return () => u()
  }, [flyProgressMV])

  // orchestrator: целевая фаза, 0/1/2
  const desiredPhaseTargetRef = useRef<0 | 1 | 2>(0)

  // анимационные контролы
  const assembleAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const flyAnimRef = useRef<ReturnType<typeof animate> | null>(null)

  const isFlyingBackRef = useRef(false)
  const pendingPhaseTargetRef = useRef<0 | 1 | 2>(0)

  const tween = useCallback((
    motionValue: MotionValue<number>,
    target: number,
    unitDuration: number
  ) => {
    const current = motionValue.get()
    const duration = Math.abs(target - current) * unitDuration
    assembleAnimRef.current?.stop()
    const controls = animate(motionValue, target, {
      duration: Math.max(0, duration),
      ease: SNAP_EASE,
    })
    return controls
  }, [])

  const revealGuardRef = useRef(false)
  const prevAssembleRawRef = useRef(assembleScrollRaw.get())

  useEffect(() => {
    const unsub = assembleScrollRaw.on('change', (v) => {
      const prev = prevAssembleRawRef.current
      prevAssembleRawRef.current = v

      if (v > (SNAP_AT + HYST)) return      // работаем только в первой подфазе
      if (flySnap.get() > EPS) return         // не во время перелёта
      if (assembleSnap.get() <= EPS) return        // сборка начата?
      if (v >= prev) return                  // направление должно быть вверх
      if (revealGuardRef.current) return

      revealGuardRef.current = true
      assembleAnimRef.current?.stop()
      const start = assembleSnap.get()
      assembleAnimRef.current = animate(assembleSnap, 0, {
        duration: Math.max(0.18, start * SNAP_BACK_DUR),
        ease: SNAP_EASE,
      })
      assembleAnimRef.current.finished.finally(() => { revealGuardRef.current = false })
    })
    return () => unsub()
  }, [assembleScrollRaw, assembleSnap, flySnap])

  const prevAssembleRawCrossRef = useRef(assembleScrollRaw.get())

  useEffect(() => {
    const unsub = assembleScrollRaw.on('change', (v) => {
      const prev = prevAssembleRawCrossRef.current
      const crossedDown =
        prev > (SNAP_AT + HYST) && v < (SNAP_AT - HYST)
      prevAssembleRawCrossRef.current = v

      if (crossedDown && flySnap.get() <= EPS && assembleSnap.get() > EPS) {
        assembleAnimRef.current?.stop()
        const start = assembleSnap.get()
        assembleAnimRef.current = animate(assembleSnap, 0, {
          duration: Math.max(0.18, start * SNAP_BACK_DUR),
          ease: SNAP_EASE,
        })
      }
    })
    return () => unsub()
  }, [assembleScrollRaw, assembleSnap, flySnap])

  const runPlan = useCallback((target: 0 | 1 | 2) => {
    desiredPhaseTargetRef.current = target
    assembleAnimRef.current?.stop()
    flyAnimRef.current?.stop()

    const toSnap = (to: 0 | 1, base: number) => new Promise<void>((resolve) => {
      if (pendingRevealRef.current) { resolve(); return }

      if (flySnap.get() > EPS || isFlyingBackRef.current || !hasArrivedRef.current) { resolve(); return }
      assembleAnimRef.current = tween(assembleSnap, to, base)
      assembleAnimRef.current!.finished.then(() => resolve())
    })

    const toFlySnap = (to: 0 | 1, base: number) => new Promise<void>((resolve) => {
      flyAnimRef.current = tween(flySnap, to, base)
      flyAnimRef.current!.finished.then(() => resolve())
    })

    if (target === 2) {
      const chain = async () => {
        if (assembleSnap.get() < 1 - 1e-3) await toSnap(1, SNAP_OUT_DUR)
        await toFlySnap(1, SNAP_OUT_DUR_2)
      }
      void chain()
    } else if (target === 1) {
      const chain = async () => {
        if (flySnap.get() > 1e-3) {
          isFlyingBackRef.current = true
          await toFlySnap(0, SNAP_BACK_DUR_2)
          isFlyingBackRef.current = false
          await waitUntil(() => flyProgressMV.get() <= ARRIVE)

          const post = pendingPhaseTargetRef.current
          if (post === 0) await toSnap(0, SNAP_BACK_DUR)
          else await toSnap(1, SNAP_OUT_DUR)
          return
        }
        if (assembleSnap.get() < 1 - 1e-3) await toSnap(1, SNAP_OUT_DUR)
      }
      void chain()
    } else {
      const chain = async () => {
        if (flySnap.get() > 1e-3) {
          isFlyingBackRef.current = true
          await toFlySnap(0, SNAP_BACK_DUR_2)
          isFlyingBackRef.current = false
          await waitUntil(() => flyProgressMV.get() <= ARRIVE)

          const post = pendingPhaseTargetRef.current
          if (post === 0) await toSnap(0, SNAP_BACK_DUR)
          else await toSnap(1, SNAP_OUT_DUR)
          return
        }
        if (assembleSnap.get() > 1e-3) await toSnap(0, SNAP_BACK_DUR)
      }
      void chain()
    }
  }, [tween, assembleSnap, flySnap, flyProgressMV])

  useEffect(() => {
    const decidePhase = () => {
      const assembleProgress = assembleScrollRaw.get()
      const flyProgress = flyScrollRaw.get()
      const shouldBePhase2 = flyProgress >= SNAP_AT_2
      const shouldBePhase1 = !shouldBePhase2 && assembleProgress >= SNAP_AT
      const targetPhase: 0 | 1 | 2 = shouldBePhase2 ? 2 : (shouldBePhase1 ? 1 : 0)

      pendingPhaseTargetRef.current = targetPhase
      if (!isFlyingBackRef.current && targetPhase !== desiredPhaseTargetRef.current) {
        runPlan(targetPhase)
      }
    }
    const unSubAssemble = assembleScrollRaw.on('change', decidePhase)
    const unSubFly = flyScrollRaw.on('change', decidePhase)
    decidePhase()
    return () => {
      unSubAssemble()
      unSubFly()
    }
  }, [assembleScrollRaw, flyScrollRaw, runPlan])

  const overlayScale = useMotionValue(1)
  const overlayCenterX = useMotionValue(0)
  const overlayCenterY = useMotionValue(0)

  useEffect(() => {
    // TODO set headerLogo: {x, y, w} on resize
    // const headerLogoRect = headerLogoRef.current!.getBoundingClientRect()
    // headerLogoCenterX = headerLogoRect.left + headerLogoRect.width / 2
    // headerLogoCenterY = headerLogoRect.top + headerLogoRect.height / 2
    // headerLogoWidth = headerLogoRect.width:
    // setHeaderLogo
  }, [headerLogoRef])

  const recomputeFlyGeometry = useCallback((flyProgress: number) => {
    const headerRect = headerLogoRef.current?.getBoundingClientRect()
    if (!headerRect) return

    const headerCenterX = headerRect.left + headerRect.width / 2
    const headerCenterY = headerRect.top + headerRect.height / 2
    const headerWidth = headerRect.width

    const centerRect = centerAnchorRef.current?.getBoundingClientRect()
    if (!centerRect) return

    const centerX = centerRect.left + centerRect.width / 2
    const centerY = centerRect.top + centerRect.height / 2

    const flyCenterX = centerX + (headerCenterX - centerX) * flyProgress
    const flyCenterY = centerY + (headerCenterY - centerY) * flyProgress

    const targetSceneWidth = headerWidth * 2
    const scale = centerRect.width > 0
      ? 1 + (targetSceneWidth / centerRect.width - 1) * flyProgress
      : 1
    overlayScale.set(scale)

    const halfBoxSize = (centerRect.width * scale) / 2

    const viewportWidth = window.innerWidth

    const minX = halfBoxSize + VIEW_SAFE
    const maxX = viewportWidth - halfBoxSize - VIEW_SAFE
    const minY = halfBoxSize + VIEW_SAFE + 8

    const clampedX = Math.max(minX, Math.min(maxX, flyCenterX))
    const clampedY = Math.max(minY, flyCenterY)

    overlayCenterX.set(clampedX)
    overlayCenterY.set(clampedY)
  }, [
    overlayCenterX,
    overlayCenterY,
    overlayScale,
    headerLogoRef,
    centerAnchorRef
  ])

  useEffect(() => {
    const u = flyProgressMV.on('change', (p) => recomputeFlyGeometry(p))
    recomputeFlyGeometry(flyProgressMV.get())
    return () => u()
  }, [flyProgressMV, recomputeFlyGeometry])

  useEffect(() => {
    const upd = () => recomputeFlyGeometry(flyProgressMV.get())
    window.addEventListener('resize', upd)
    return () => { window.removeEventListener('resize', upd) }
  }, [flyProgressMV, recomputeFlyGeometry])

  const assembledConst = useMotionValue(assembledScale)
  const totalSceneScaleOverlay = overlayScale

  const baseSceneOpacity = useTransform(flyProgressMV, [0.00, 0.0001, 0.00011, 1], [1, 1, 0, 0])
  const overlayOpacity = useTransform(flyProgressMV, [0.00, 0.0001, 0.00011, 0.999, 1], [0, 0, 1, 1, 0])

  const headerLogoVisibleMV = useTransform<number, number>([flySnap, flyProgressMV], ([t, p]) =>
    (t >= EPS && p >= SNAP_SHOW_AT) ? 1 : 0
  )

  const isHome = useCallback(() => {
    return pathname === `/${locale}` || pathname === `/`
  }, [pathname, locale])

  const CANCEL_DOWN_VEL = 0.1
  const PENDING_MAX_MS = 500
  const VIS_THR = 0.9

  const JUMP_UP_THR = 0.18
  const TRIGGER_COOLDOWN = 150

  useEffect(() => {
    const FAST_UP_VEL = -2
    let stopOpacity: (() => void) | null = null
    const pendingAtRef = { t: 0 }

    let prevRaw = assembleScrollRaw.get()
    let lastTriggerAt = 0

    const unsub = assembleScrollRaw.on('change', (v) => {
      const flying = flySnap.get() > EPS
      const assembling = assembleSnap.get() > EPS
      const belowGate = v < (SNAP_AT - HYST)
      const vel = assembleScrollVel.get()

      const now = performance.now()
      const drop = prevRaw - v
      const teleportUp = drop > JUMP_UP_THR
      prevRaw = v

      const allowTrigger = (vel <= FAST_UP_VEL) || teleportUp
      const cooledDown = (now - lastTriggerAt) > TRIGGER_COOLDOWN

      if (!flying && assembling && belowGate && allowTrigger && cooledDown && !pendingRevealRef.current) {
        lastTriggerAt = now

        const from = assembleSnap.get()
        pendingRevealRef.current = { from }
        pendingAtRef.t = now

        assembleAnimRef.current?.stop()
        assembleSnap.set(from)

        const tryRevealNow = () => {
          if (!pendingRevealRef.current) return
          const startFrom = pendingRevealRef.current.from
          pendingRevealRef.current = null
          assembleAnimRef.current = animate(assembleSnap, 0, {
            duration: Math.max(0.15, startFrom * SNAP_BACK_DUR),
            ease: SNAP_EASE,
          })
        }

        const curOpacity = baseSceneOpacity.get()
        if (curOpacity >= VIS_THR) {
          tryRevealNow()
        } else {
          stopOpacity?.()
          stopOpacity = baseSceneOpacity.on('change', (o) => {
            if (o >= VIS_THR) {
              stopOpacity?.()
              stopOpacity = null
              tryRevealNow()
            }
          })
        }
      }

      if (pendingRevealRef.current) {
        const tooLong = (now - pendingAtRef.t) > PENDING_MAX_MS
        if (vel >= CANCEL_DOWN_VEL || tooLong) {
          pendingRevealRef.current = null
          stopOpacity?.()
          stopOpacity = null
        }
      }
    })
    return () => { unsub(); stopOpacity?.() }
  }, [assembleScrollRaw, assembleScrollVel, assembleSnap, flySnap, baseSceneOpacity])

  useEffect(() => {
    const apply = (v: number) => {
      if (v >= 1) {
        headerLogoRef.current!.classList.toggle('opacity-100', true)
      } else {
        headerLogoRef.current!.classList.toggle('opacity-100', false)
        headerLogoRef.current!.classList.toggle('opacity-0', true)
      }
    }

    apply(headerLogoVisibleMV.get())
    const unsub = headerLogoVisibleMV.on('change', apply)
    return () => unsub()
  }, [pathname, locale, headerLogoRef, headerLogoVisibleMV, isHome])

  const rMaskZero = useMotionValue(0)

  const [isInHeader, setIsInHeader] = useState(false)
  useEffect(() => {
    const unsub = flyProgressMV.on('change', (v) => {
      setIsInHeader((prev) => (prev ? v > 0.90 : v > 0.98))
    })
    setIsInHeader(flyProgressMV.get() > 0.98)
    return () => unsub()
  }, [flyProgressMV])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="relative w-full overflow-x-clip">
      <div className="flex items-center justify-center">
        <div ref={triggerRef} style={{ width: canvasWidth, height: canvasHeight }} className="relative">
          <div
            ref={centerAnchorRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: `min(90vw, 323px)`,
              height: `min(90vw, 323px)`,
              opacity: 0
            }}
          />
          <motion.div style={{ opacity: baseSceneOpacity, willChange: 'opacity' }}>
            <Scene
              isFullyVisible={isFullyVisible}
              delayAll={DELAY_ALL}
              blurTotalDuration={blurTotalDuration}
              initialBlur={initialBlur}
              rMask={logoHoleRadiusMV}
              scaleMV={logoScaleOnAssembleMV}
              NO_BLUR={NO_BLUR}
              inkSpinProgressMV={inkSpinProgressMV}
              approachProgress={assembleProgressHybrid}
              positions={positions}
              sizes={sizes}
              disableMagnet={false}
            />
          </motion.div>
        </div>
      </div>
      {mounted && createPortal(
        <motion.div
          className="fixed z-[110] pointer-events-none"
          style={{
            left: overlayCenterX,
            top: overlayCenterY,
            translateX: '-50%',
            translateY: '-50%',
            width: centerBox,
            height: centerBox,
            scale: totalSceneScaleOverlay,
            transformOrigin: 'center',
            opacity: overlayOpacity,
            willChange: 'transform,opacity',
          }}
        >
          <div className="relative w-full h-full">
            <Scene
              isFullyVisible={true}
              delayAll={DELAY_ALL}
              blurTotalDuration={blurTotalDuration}
              initialBlur={initialBlur}
              rMask={rMaskZero}
              scaleMV={assembledConst}
              NO_BLUR={NO_BLUR}
              inkSpinProgressMV={overlayinkSpinProgressMV}
              approachProgress={overlayApproachProgress}
              positions={positions}
              sizes={sizes}
              disableMagnet={isInHeader}
            />
          </div>
        </motion.div>,
        document.body
      )}
    </div>
  )
}

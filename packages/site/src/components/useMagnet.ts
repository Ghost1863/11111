import { useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

const SPRING = { damping: 15, stiffness: 150, mass: 0.5 }

export function useMagnet(maxOffsetPx = 12) {
  const ref = useRef<HTMLDivElement | null>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING)
  const y = useSpring(rawY, SPRING)

  const update = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const dist = Math.hypot(dx, dy) || 1
    const k = Math.min(1, maxOffsetPx / dist) // «мягкий» колпачок
    rawX.set(dx * k)
    rawY.set(dy * k)
  }

  const onPointerMove = (e: React.PointerEvent) => update(e.clientX, e.clientY)
  const onPointerEnter = (e: React.PointerEvent) => update(e.clientX, e.clientY) // сразу ставим корректное положение
  const onPointerLeave = () => { rawX.set(0); rawY.set(0) }

  return { ref, x, y, handlers: { onPointerMove, onPointerEnter, onPointerLeave } }
}
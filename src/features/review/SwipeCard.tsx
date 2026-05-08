"use client"

import { useState, useRef, useEffect } from "react"

type Direction = "left" | "right" | "up"

interface Props {
  onSwipe: (dir: Direction) => void
  onTap: () => void
  canGoLeft?: boolean
  canGoRight?: boolean
  children: React.ReactNode
}

const SWIPE_THRESHOLD = 70
const TAP_THRESHOLD = 12

export default function SwipeCard({ onSwipe, onTap, canGoLeft = true, canGoRight = true, children }: Props) {
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<Direction | null>(null)
  const [springing, setSpringing] = useState(false)
  const dragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const latestDrag = useRef({ x: 0, y: 0 }) // ref avoids stale closure in release()
  const onSwipeRef = useRef(onSwipe)
  const onTapRef = useRef(onTap)
  useEffect(() => { onSwipeRef.current = onSwipe; onTapRef.current = onTap })

  // Fire parent action after exit animation
  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => onSwipeRef.current(exiting), 230)
    return () => clearTimeout(t)
  }, [exiting])

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":  onSwipeRef.current("left"); break
        case "ArrowRight": onSwipeRef.current("right"); break
        case "ArrowUp":    e.preventDefault(); onSwipeRef.current("up"); break
        case " ":
        case "Enter":      e.preventDefault(); onTapRef.current(); break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function onTouchStart(e: React.TouchEvent) {
    dragging.current = true
    setSpringing(false)
    latestDrag.current = { x: 0, y: 0 }
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current || exiting) return
    const dx = e.touches[0].clientX - startPos.current.x
    const dy = e.touches[0].clientY - startPos.current.y
    // Downward gesture → browser handles (pull-to-refresh), don't animate
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) return
    const next = { x: dx, y: Math.min(dy, 0) }
    latestDrag.current = next
    setDrag(next)
  }

  function release() {
    if (!dragging.current) return
    dragging.current = false
    const { x: dx, y: dy } = latestDrag.current

    const reset = () => {
      latestDrag.current = { x: 0, y: 0 }
      setDrag({ x: 0, y: 0 })
    }

    // Tap: minimal movement
    if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
      reset()
      onTapRef.current()
      return
    }

    const isHoriz = Math.abs(dx) >= Math.abs(dy)

    // Up swipe
    if (!isHoriz && dy < -SWIPE_THRESHOLD) {
      reset()
      setExiting("up")
      return
    }

    // Horizontal swipe
    if (isHoriz && Math.abs(dx) >= SWIPE_THRESHOLD) {
      const dir = dx < 0 ? "left" : "right"
      // At boundary: spring back
      if ((dir === "left" && !canGoLeft) || (dir === "right" && !canGoRight)) {
        reset()
        setSpringing(true)
        return
      }
      reset()
      setExiting(dir)
      return
    }

    // Below threshold: spring back
    reset()
    setSpringing(true)
  }

  // Indicator label during drag
  const ax = Math.abs(drag.x), ay = Math.abs(drag.y)
  let label: string | null = null
  let labelColor = "#a1a1aa"
  if (!exiting && (ax > 20 || ay > 20)) {
    if (ax >= ay) {
      if (drag.x < -20 && canGoLeft)  { label = "← Précédent" }
      if (drag.x >  20 && canGoRight) { label = "→ Suivant" }
    } else if (drag.y < -20) {
      label = "↑ Maîtrisé"; labelColor = "#22c55e"
    }
  }

  const exitTransforms: Record<Direction, string> = {
    left:  "translateX(-130%) rotate(-12deg)",
    right: "translateX( 130%) rotate( 12deg)",
    up:    "translateY(-130%)",
  }

  const transform = exiting
    ? exitTransforms[exiting]
    : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.04}deg)`

  const transition = (exiting || springing)
    ? "transform 0.23s cubic-bezier(0.25, 1, 0.5, 1)"
    : "none"

  return (
    <div
      className="relative h-full w-full flex items-center justify-center overflow-hidden"
      style={{ touchAction: "pan-down" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      {label && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-sm font-semibold px-3 py-1 rounded-full pointer-events-none whitespace-nowrap"
          style={{
            color: labelColor,
            backgroundColor: "rgba(255,255,255,0.92)",
            border: `1.5px solid ${labelColor}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{ transform, transition, willChange: "transform" }}
        onTransitionEnd={() => { if (springing) setSpringing(false) }}
      >
        {children}
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"

type Direction = "left" | "right" | "up" | "down"

interface Props {
  onSwipe: (dir: Direction) => void
  side: "recto" | "verso"
  children: React.ReactNode
}

const THRESHOLD = 75

export default function SwipeCard({ onSwipe, side, children }: Props) {
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<Direction | null>(null)
  const [springing, setSpringing] = useState(false)
  const dragging = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  const onSwipeRef = useRef(onSwipe)
  useEffect(() => { onSwipeRef.current = onSwipe })

  // Fire parent action after exit animation completes
  useEffect(() => {
    if (!exiting) return
    const timer = setTimeout(() => onSwipeRef.current(exiting), 230)
    return () => clearTimeout(timer)
  }, [exiting])

  // Keyboard — registered once, always reads latest onSwipe via ref
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      }
      const dir = map[e.key]
      if (!dir) return
      if (dir === "up" || dir === "down") e.preventDefault()
      onSwipeRef.current(dir)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function onTouchStart(e: React.TouchEvent) {
    dragging.current = true
    setSpringing(false)
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current || exiting) return
    setDrag({
      x: e.touches[0].clientX - start.current.x,
      y: e.touches[0].clientY - start.current.y,
    })
  }

  function release() {
    if (!dragging.current) return
    dragging.current = false
    const { x: dx, y: dy } = drag

    if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) {
      setSpringing(true)
      setDrag({ x: 0, y: 0 })
      return
    }

    const dir: Direction = Math.abs(dx) >= Math.abs(dy)
      ? (dx < 0 ? "left" : "right")
      : (dy < 0 ? "up" : "down")

    // Flip / unflip: reset in place, call immediately (the card flips via CSS)
    const isInPlace =
      (dir === "right" && side === "recto") ||
      (dir === "left" && side === "verso")

    if (isInPlace) {
      setDrag({ x: 0, y: 0 })
      onSwipeRef.current(dir)
      return
    }

    // Invalid gesture (e.g. right from verso): spring back silently
    if (
      (dir === "right" && side === "verso") ||
      (dir === "down" && side === "recto")
    ) {
      setSpringing(true)
      setDrag({ x: 0, y: 0 })
      return
    }

    // Exit animation
    setDrag({ x: 0, y: 0 })
    setExiting(dir)
  }

  // Dynamic indicator label during drag
  const ax = Math.abs(drag.x)
  const ay = Math.abs(drag.y)
  let label: string | null = null
  let labelColor = "#71717a"

  if (!exiting && (ax > 20 || ay > 20)) {
    if (ax >= ay) {
      if (drag.x < 0) {
        label = side === "verso" ? "← Retour" : "← Passer"
      } else if (side === "recto") {
        label = "→ Retourner"; labelColor = "#6366f1"
      }
    } else {
      if (drag.y < 0) {
        label = "↑ Maîtrisé"; labelColor = "#22c55e"
      } else if (side === "verso") {
        label = "↓ À revoir"; labelColor = "#ef4444"
      }
    }
  }

  const exitTransforms: Record<Direction, string> = {
    left:  "translateX(-130%) rotate(-12deg)",
    right: "translateX(130%)  rotate( 12deg)",
    up:    "translateY(-130%)",
    down:  "translateY( 130%)",
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
      style={{ touchAction: "none" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      {/* Directional hint badge */}
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

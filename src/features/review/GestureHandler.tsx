"use client"

import { useRef, useEffect } from "react"

type Direction = "left" | "right" | "up" | "down"

interface Props {
  onGesture: (direction: Direction) => void
  children: React.ReactNode
}

const THRESHOLD = 50

export default function GestureHandler({ onGesture, children }: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const onGestureRef = useRef(onGesture)
  useEffect(() => { onGestureRef.current = onGesture })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft": onGestureRef.current("left"); break
        case "ArrowRight": onGestureRef.current("right"); break
        case "ArrowUp": e.preventDefault(); onGestureRef.current("up"); break
        case "ArrowDown": e.preventDefault(); onGestureRef.current("down"); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!startRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - startRef.current.x
    const dy = touch.clientY - startRef.current.y
    startRef.current = null

    if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return

    if (Math.abs(dx) >= Math.abs(dy)) {
      onGestureRef.current(dx < 0 ? "left" : "right")
    } else {
      onGestureRef.current(dy < 0 ? "up" : "down")
    }
  }

  return (
    <div
      className="h-full w-full"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

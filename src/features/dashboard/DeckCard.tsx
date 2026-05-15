"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

interface Props {
  id: string
  name: string
  accentColor: string
  cardCount: number
  rotation: string
}

export default function DeckCard({ id, name, accentColor, cardCount, rotation }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  return (
    <div
      ref={ref}
      onClick={() => setOpen(o => !o)}
      className={`relative group w-36 aspect-[3/4] rounded-[18px] flex-shrink-0 cursor-pointer ${rotation} hover:rotate-0 hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
      style={{ backgroundColor: accentColor }}
    >
      {/* Card content */}
      <div className="h-full p-4 flex flex-col pointer-events-none">
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          {cardCount} carte{cardCount !== 1 ? "s" : ""}
        </span>
        <span
          className="mt-auto font-semibold text-[15px] leading-snug text-white"
          style={{ fontFamily: "var(--font-spectral), serif" }}
        >
          {name}
        </span>
      </div>

      {/* Overlay — hover (CSS) ou tap (state) */}
      <div
        className={`absolute inset-0 rounded-[18px] flex flex-col items-center justify-center gap-2 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } group-hover:opacity-100 group-hover:pointer-events-auto`}
        style={{ background: "rgba(0,0,0,0.62)" }}
      >
        <Link
          href={`/review?deckId=${id}&mode=browse`}
          onClick={e => e.stopPropagation()}
          className="w-[112px] text-center rounded-[9px] bg-white text-zinc-900 py-2 text-[11px] font-semibold hover:bg-zinc-100 transition-colors"
        >
          Voir
        </Link>
        <Link
          href={`/review?deckId=${id}&mode=learn`}
          onClick={e => e.stopPropagation()}
          className="w-[112px] text-center rounded-[9px] py-2 text-[11px] font-semibold text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          Mémoriser
        </Link>
        <Link
          href={`/decks/${id}`}
          onClick={e => e.stopPropagation()}
          className="w-[112px] text-center rounded-[9px] py-2 text-[11px] font-semibold text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          Modifier
        </Link>
      </div>
    </div>
  )
}

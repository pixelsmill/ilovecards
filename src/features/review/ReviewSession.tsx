"use client"

import { useReducer, useState, useRef, useEffect } from "react"
import Link from "next/link"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import SwipeCard from "./SwipeCard"

interface ReviewCard {
  id: string
  notion: string
  developpement: string | null
  source: string | null
  template: string
  imageUrl?: string | null
  verified: boolean
  easeFactor: number
  interval: number
  repetitions: number
  deck: { accentColor: string; name: string; id: string }
}

interface SessionState {
  cards: ReviewCard[]
  index: number
  side: "recto" | "verso"
  dismissed: number
}

type SessionAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "FLIP" }
  | { type: "DISMISS" }
  | { type: "FAIL" }
  | { type: "REMOVE" }
  | { type: "TOGGLE_VERIFIED"; cardId: string; verified: boolean }

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const { cards, index } = state

  switch (action.type) {
    case "FLIP":
      return { ...state, side: state.side === "recto" ? "verso" : "recto" }

    case "NEXT":
      return { ...state, index: (index + 1) % cards.length, side: "recto" }

    case "PREV":
      return { ...state, index: (index - 1 + cards.length) % cards.length, side: "recto" }

    case "DISMISS": {
      const newCards = cards.filter((_, i) => i !== index)
      const newIndex = Math.max(0, Math.min(index, newCards.length - 1))
      return { cards: newCards, index: newIndex, side: "recto", dismissed: state.dismissed + 1 }
    }

    case "FAIL": {
      const card = cards[index]
      const remaining = cards.filter((_, i) => i !== index)
      return { cards: [...remaining, card], index: Math.min(index, remaining.length - 1), side: "recto", dismissed: state.dismissed }
    }

    case "REMOVE": {
      const newCards = cards.filter((_, i) => i !== index)
      const newIndex = Math.max(0, Math.min(index, newCards.length - 1))
      return { cards: newCards, index: newIndex, side: "recto", dismissed: state.dismissed }
    }

    case "TOGGLE_VERIFIED": {
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.cardId ? { ...c, verified: action.verified } : c),
      }
    }
  }
}

async function postReview(cardId: string, action: "dismiss" | "fail") {
  await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, action }),
  }).catch(() => null)
}

function buildNavBackground(colors: string[]): string {
  const unique = [...new Set(colors)]
  if (unique.length === 1) return unique[0]
  return `linear-gradient(135deg, ${unique.join(", ")})`
}

interface Props {
  initialCards: ReviewCard[]
  mode: "browse" | "learn"
  backHref: string
  initialCardId?: string
}

export default function ReviewSession({ initialCards, mode, backHref, initialCardId }: Props) {
  const total = initialCards.length
  const [state, dispatch] = useReducer(sessionReducer, {
    cards: initialCards,
    index: initialCardId ? Math.max(0, initialCards.findIndex(c => c.id === initialCardId)) : 0,
    side: "recto",
    dismissed: 0,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const navBackground = buildNavBackground(initialCards.map(c => c.deck.accentColor))

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [menuOpen])

  const current = state.cards[state.index] ?? null
  const progress = total > 0 ? (state.dismissed / total) * 100 : 100

  function handleSwipe(dir: "left" | "right" | "up" | "down") {
    if (!current) return
    if (mode === "browse") {
      if (dir === "left") dispatch({ type: "PREV" })
      if (dir === "right") dispatch({ type: "NEXT" })
    } else {
      if (dir === "up") { postReview(current.id, "dismiss"); dispatch({ type: "DISMISS" }) }
      if (dir === "down") { postReview(current.id, "fail"); dispatch({ type: "FAIL" }) }
    }
  }

  async function handleDelete() {
    if (!current) return
    setMenuOpen(false)
    await fetch(`/api/cards/${current.id}`, { method: "DELETE" }).catch(() => null)
    dispatch({ type: "REMOVE" })
  }

  async function handleToggleVerified() {
    if (!current) return
    setMenuOpen(false)
    const newVerified = !current.verified
    await fetch(`/api/cards/${current.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: newVerified }),
    }).catch(() => null)
    dispatch({ type: "TOGGLE_VERIFIED", cardId: current.id, verified: newVerified })
  }

  if (!current) {
    return (
      <main className="h-[calc(100dvh-3.5rem)] bg-zinc-700 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">✓</p>
          <p className="text-white text-xl font-semibold">Session terminée</p>
          <p className="text-zinc-300 text-sm">
            {state.dismissed} maîtrisée{state.dismissed !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href={backHref}
          className="rounded-lg bg-zinc-600 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-500 transition-colors"
        >
          Retour
        </Link>
      </main>
    )
  }

  const editHref = `/decks/${current.deck.id}/cards/${current.id}/edit?returnTo=${encodeURIComponent(`/review?deckId=${current.deck.id}&mode=${mode}&cardId=${current.id}`)}`

  return (
    <>
      {mode === "learn" && (
        <div
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4"
          style={{ height: "3.5rem", background: navBackground }}
        >
          <div className="w-8" />
          <span className="text-white/90 text-sm font-medium tracking-wide">Mémorisation en cours</span>
          <Link href={backHref} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors" aria-label="Quitter la session">
            <span className="text-white text-xl leading-none">×</span>
          </Link>
        </div>
      )}

      <main className="h-[calc(100dvh-3.5rem)] bg-zinc-700 flex flex-col select-none">
        {mode === "learn" && (
          <div className="flex-shrink-0 h-0.5 bg-zinc-600">
            <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: navBackground }} />
          </div>
        )}

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
          <span className="text-zinc-400 text-xs">{state.index + 1} / {state.cards.length}</span>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(o => !o)} className="flex flex-col gap-[3px] items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-600 transition-colors" aria-label="Actions sur la carte">
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white shadow-lg overflow-hidden z-30">
                <Link
                  href={editHref}
                  className="block px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Modifier
                </Link>
                {!current.verified && (
                  <button onClick={handleToggleVerified} className="w-full text-left px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Valider le contenu
                  </button>
                )}
                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card area */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <SwipeCard key={current.id} mode={mode} onSwipe={handleSwipe} onTap={() => dispatch({ type: "FLIP" })}>
            <CardRenderer
              card={current}
              size="full"
              flipped={state.side === "verso"}
              accentColor={current.deck.accentColor}
              deckName={current.deck.name}
            />
          </SwipeCard>
        </div>

        {/* Gesture hints */}
        <div className="flex-shrink-0 flex justify-center gap-5 py-4 text-zinc-500 text-xs">
          {mode === "browse" ? (
            <>
              <span>← préc</span>
              <span>· clic : retourner ·</span>
              <span>suiv →</span>
            </>
          ) : (
            <>
              <span style={{ color: "#ef4444" }}>↓ à revoir</span>
              <span>· clic : retourner ·</span>
              <span style={{ color: "#22c55e" }}>↑ maîtrisé</span>
            </>
          )}
        </div>
      </main>
    </>
  )
}

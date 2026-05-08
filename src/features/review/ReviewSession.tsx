"use client"

import { useReducer } from "react"
import Link from "next/link"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import SwipeCard from "./SwipeCard"

interface ReviewCard {
  id: string
  notion: string
  developpement: string | null
  source: string | null
  template: string
  easeFactor: number
  interval: number
  repetitions: number
  deck: { accentColor: string }
}

interface SessionState {
  cards: ReviewCard[]
  side: "recto" | "verso"
  stats: { dismissed: number; failed: number; passed: number }
}

type SessionAction =
  | { type: "PASS" }
  | { type: "FLIP" }
  | { type: "UNFLIP" }
  | { type: "DISMISS" }
  | { type: "FAILED" }

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const [current, ...rest] = state.cards

  switch (action.type) {
    case "FLIP":
      return { ...state, side: "verso" }

    case "UNFLIP":
      return { ...state, side: "recto" }

    case "PASS": {
      const next = [...rest, current]
      return { ...state, cards: next, side: "recto", stats: { ...state.stats, passed: state.stats.passed + 1 } }
    }

    case "DISMISS":
      return { cards: rest, side: "recto", stats: { ...state.stats, dismissed: state.stats.dismissed + 1 } }

    case "FAILED": {
      const pos = Math.min(2, rest.length)
      const requeued = [...rest.slice(0, pos), current, ...rest.slice(pos)]
      return { cards: requeued, side: "recto", stats: { ...state.stats, failed: state.stats.failed + 1 } }
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

interface Props {
  initialCards: ReviewCard[]
}

export default function ReviewSession({ initialCards }: Props) {
  const total = initialCards.length
  const [state, dispatch] = useReducer(sessionReducer, {
    cards: initialCards,
    side: "recto",
    stats: { dismissed: 0, failed: 0, passed: 0 },
  })

  const current = state.cards[0] ?? null
  const progress = total > 0 ? (state.stats.dismissed / total) * 100 : 100

  function handleGesture(direction: "left" | "right" | "up" | "down") {
    if (!current) return
    switch (direction) {
      case "left":
        if (state.side === "recto") dispatch({ type: "PASS" })
        else dispatch({ type: "UNFLIP" })
        break
      case "right":
        if (state.side === "recto") dispatch({ type: "FLIP" })
        break
      case "up":
        postReview(current.id, "dismiss")
        dispatch({ type: "DISMISS" })
        break
      case "down":
        if (state.side === "verso") {
          postReview(current.id, "fail")
          dispatch({ type: "FAILED" })
        }
        break
    }
  }

  if (!current) {
    return (
      <main className="h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">✓</p>
          <p className="text-white text-xl font-semibold">Session terminée</p>
          <p className="text-zinc-400 text-sm">
            {state.stats.dismissed} maîtrisée{state.stats.dismissed !== 1 ? "s" : ""}
            {state.stats.failed > 0 && ` · ${state.stats.failed} à revoir`}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </main>
    )
  }

  return (
    <main className="h-dvh bg-zinc-950 flex flex-col select-none">
      {/* Progress bar */}
      <div className="flex-shrink-0 h-0.5 bg-zinc-800">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: current.deck.accentColor }}
        />
      </div>

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <span className="text-zinc-500 text-xs">
          {state.cards.length} restante{state.cards.length !== 1 ? "s" : ""}
        </span>
        <Link href="/dashboard" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
          Terminer
        </Link>
      </div>

      {/* Card area — SwipeCard fills this zone */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <SwipeCard key={current.id} onSwipe={handleGesture} side={state.side}>
          <CardRenderer
            card={current}
            size="full"
            flipped={state.side === "verso"}
            accentColor={current.deck.accentColor}
          />
        </SwipeCard>
      </div>

      {/* Gesture hints */}
      <div className="flex-shrink-0 flex justify-center gap-6 py-4 text-zinc-700 text-xs">
        {state.side === "recto" ? (
          <>
            <span>← passer</span>
            <span>→ retourner</span>
            <span>↑ maîtrisé</span>
          </>
        ) : (
          <>
            <span>← retour</span>
            <span>↑ maîtrisé</span>
            <span>↓ à revoir</span>
          </>
        )}
      </div>
    </main>
  )
}

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
  imageUrl?: string | null
  easeFactor: number
  interval: number
  repetitions: number
  deck: { accentColor: string; name: string }
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
      // Move card to end of queue so it comes back
      const card = cards[index]
      const remaining = cards.filter((_, i) => i !== index)
      return { cards: [...remaining, card], index: Math.min(index, remaining.length - 1), side: "recto", dismissed: state.dismissed }
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
  mode: "browse" | "learn"
}

export default function ReviewSession({ initialCards, mode }: Props) {
  const total = initialCards.length
  const [state, dispatch] = useReducer(sessionReducer, {
    cards: initialCards,
    index: 0,
    side: "recto",
    dismissed: 0,
  })

  const current = state.cards[state.index] ?? null
  const progress = total > 0 ? (state.dismissed / total) * 100 : 100

  function handleSwipe(dir: "left" | "right" | "up" | "down") {
    if (!current) return
    if (mode === "browse") {
      if (dir === "left")  dispatch({ type: "PREV" })
      if (dir === "right") dispatch({ type: "NEXT" })
    } else {
      if (dir === "up") {
        postReview(current.id, "dismiss")
        dispatch({ type: "DISMISS" })
      }
      if (dir === "down") {
        postReview(current.id, "fail")
        dispatch({ type: "FAIL" })
      }
    }
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
          href="/dashboard"
          className="rounded-lg bg-zinc-600 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-500 transition-colors"
        >
          Retour au dashboard
        </Link>
      </main>
    )
  }

  return (
    <main className="h-[calc(100dvh-3.5rem)] bg-zinc-700 flex flex-col select-none">
      {/* Progress bar — only in learn mode */}
      {mode === "learn" && (
        <div className="flex-shrink-0 h-0.5 bg-zinc-600">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: current.deck.accentColor }}
          />
        </div>
      )}

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center px-4 py-3 pr-16">
        <span className="text-zinc-400 text-xs">
          {mode === "browse"
            ? `${state.index + 1} / ${state.cards.length}`
            : `${state.index + 1} / ${state.cards.length}`}
        </span>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <SwipeCard
          key={current.id}
          mode={mode}
          onSwipe={handleSwipe}
          onTap={() => dispatch({ type: "FLIP" })}
        >
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
  )
}

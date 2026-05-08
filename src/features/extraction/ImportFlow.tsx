"use client"

import { useState } from "react"
import Link from "next/link"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import { TEMPLATES } from "@/lib/schemas/card"

interface Deck {
  id: string
  name: string
  accentColor: string
}

interface CardCandidate {
  notion: string
  developpement: string
  source: string
  template: string
  accepted: boolean
}

type Phase = "input" | "extracting" | "review" | "saving" | "done"

const TEMPLATE_LABELS: Record<string, string> = {
  minimaliste: "Minimaliste", poster: "Poster", quote: "Citation",
  magazine: "Magazine", "color-block": "Bloc", "photo-overlay": "Overlay",
  equation: "Équation", sature: "Saturé",
}

interface Props {
  decks: Deck[]
  defaultDeckId?: string
}

export default function ImportFlow({ decks, defaultDeckId }: Props) {
  const [phase, setPhase] = useState<Phase>("input")
  const [deckId, setDeckId] = useState(defaultDeckId ?? decks[0]?.id ?? "")
  const [text, setText] = useState("")
  const [cards, setCards] = useState<CardCandidate[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const charCount = text.length
  const isTooBig = charCount > 50000
  const selectedDeck = decks.find(d => d.id === deckId)
  const acceptedCount = cards.filter(c => c.accepted).length

  function updateCard(index: number, updates: Partial<CardCandidate>) {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c))
  }

  async function handleExtract() {
    if (!deckId || !text.trim() || isTooBig) return
    setPhase("extracting")
    setCards([])
    setError(null)

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, text }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error ?? "Erreur lors de l'extraction")
        setPhase("input")
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const card = JSON.parse(trimmed)
            if (card._error) { setError("Erreur lors de l'extraction IA"); continue }
            if (card.notion) {
              setCards(prev => [...prev, {
                notion: card.notion,
                developpement: card.developpement ?? "",
                source: card.source ?? "",
                template: TEMPLATES.includes(card.template) ? card.template : "minimaliste",
                accepted: true,
              }])
            }
          } catch {}
        }
      }

      setPhase("review")
    } catch {
      setError("Erreur réseau")
      setPhase("input")
    }
  }

  async function handleSave() {
    const accepted = cards.filter(c => c.accepted)
    if (!accepted.length) return
    setPhase("saving")

    let count = 0
    for (const card of accepted) {
      try {
        const res = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deckId,
            notion: card.notion,
            developpement: card.developpement || undefined,
            source: card.source || undefined,
            template: card.template,
          }),
        })
        if (res.ok) count++
      } catch {}
    }
    setSavedCount(count)
    setPhase("done")
  }

  if (phase === "done") {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-3xl">✓</p>
        <p className="text-lg font-semibold text-zinc-900">
          {savedCount} carte{savedCount !== 1 ? "s" : ""} enregistrée{savedCount !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-zinc-500">dans le deck « {selectedDeck?.name} »</p>
        <div className="flex gap-2 justify-center pt-2">
          <Link href={`/decks/${deckId}`} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
            Voir le deck
          </Link>
          <button onClick={() => { setPhase("input"); setText(""); setCards([]) }}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Nouvel import
          </button>
        </div>
      </div>
    )
  }

  if (phase === "saving") {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-600">Enregistrement des cartes…</p>
      </div>
    )
  }

  if (phase === "review" || (phase === "extracting" && cards.length > 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-700">
            {phase === "extracting" ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin inline-block" />
                Extraction en cours… {cards.length} carte{cards.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>{cards.length} cartes extraites — {acceptedCount} sélectionnée{acceptedCount !== 1 ? "s" : ""}</span>
            )}
          </p>
          {phase === "review" && (
            <button
              onClick={handleSave}
              disabled={acceptedCount === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {acceptedCount === 0 ? "Aucune carte à enregistrer" : `Enregistrer ${acceptedCount} carte${acceptedCount !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`rounded-lg border bg-white overflow-hidden transition-opacity ${card.accepted ? "border-zinc-200 opacity-100" : "border-zinc-100 opacity-50"}`}
            >
              <div className="flex gap-3 p-3">
                {/* Thumb preview */}
                <div className="flex-shrink-0">
                  <CardRenderer
                    card={card}
                    size="thumb"
                    accentColor={selectedDeck?.accentColor}
                  />
                </div>

                {/* Editable fields */}
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    value={card.notion}
                    onChange={e => updateCard(i, { notion: e.target.value })}
                    maxLength={500}
                    className="w-full text-sm font-medium text-zinc-900 border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 outline-none bg-transparent py-0.5"
                  />
                  <textarea
                    value={card.developpement}
                    onChange={e => updateCard(i, { developpement: e.target.value })}
                    maxLength={2000}
                    rows={2}
                    className="w-full text-xs text-zinc-600 border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 outline-none bg-transparent resize-none py-0.5"
                    placeholder="Développement (optionnel)"
                  />
                  <select
                    value={card.template}
                    onChange={e => updateCard(i, { template: e.target.value })}
                    className="text-xs text-zinc-500 bg-transparent border border-zinc-200 rounded px-1.5 py-0.5 outline-none"
                  >
                    {TEMPLATES.map(t => (
                      <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                {/* Accept/reject toggle */}
                <button
                  type="button"
                  onClick={() => updateCard(i, { accepted: !card.accepted })}
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                    card.accepted ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {card.accepted ? "✓" : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {phase === "review" && cards.length > 3 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={acceptedCount === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {acceptedCount === 0 ? "Aucune carte à enregistrer" : `Enregistrer ${acceptedCount} carte${acceptedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (phase === "extracting") {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-600">Extraction en cours…</p>
        <p className="text-xs text-zinc-400">Jusqu'à 15 secondes</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="deck">Deck cible</label>
        <select
          id="deck"
          value={deckId}
          onChange={e => setDeckId(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 bg-white"
        >
          {decks.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700" htmlFor="text">Document</label>
          <span className={`text-xs ${isTooBig ? "text-red-500 font-medium" : "text-zinc-400"}`}>
            {charCount.toLocaleString()} / 50 000
          </span>
        </div>
        <textarea
          id="text"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={10}
          placeholder="Colle ton cours, tes notes, un article…"
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-1 resize-none ${
            isTooBig
              ? "border-red-300 focus:border-red-400 focus:ring-red-400"
              : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
          }`}
        />
        {isTooBig && (
          <p className="text-xs text-red-500">Document trop volumineux — supprime du contenu ou divise-le en plusieurs parties.</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleExtract}
        disabled={!text.trim() || isTooBig || !deckId}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Extraire les flashcards
      </button>
    </div>
  )
}

"use client"

import { useState } from "react"

interface SuggestedCard {
  notion: string
  developpement?: string
  template: string
}

interface Props {
  deckId: string
  accentColor: string
}

export default function CompleteDeck({ deckId, accentColor }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<SuggestedCard[]>([])
  const [saved, setSaved] = useState<Set<number>>(new Set())

  async function generate() {
    setOpen(true)
    setLoading(true)
    setCards([])
    setSaved(new Set())

    const res = await fetch("/api/ai/complete-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId }),
    }).catch(() => null)

    if (!res?.ok || !res.body) {
      setLoading(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("{")) continue
        try {
          const obj = JSON.parse(trimmed)
          if (obj._done || obj._error) continue
          if (obj.notion) setCards(prev => [...prev, obj as SuggestedCard])
        } catch {}
      }
    }
    setLoading(false)
  }

  async function saveCard(card: SuggestedCard, index: number) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckId,
        notion: card.notion,
        developpement: card.developpement,
        template: card.template || "minimaliste",
        verified: true,
      }),
    }).catch(() => null)
    if (res?.ok) setSaved(prev => new Set([...prev, index]))
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
      >
        {loading ? "Génération…" : "✦ Compléter ce deck"}
      </button>

      {open && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">Suggestions IA</p>
            <button
              type="button"
              onClick={() => { setOpen(false); setCards([]) }}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Fermer
            </button>
          </div>

          {loading && cards.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">Analyse du deck en cours…</p>
          )}

          <div className="space-y-2">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2.5 flex items-start gap-3 transition-opacity ${saved.has(i) ? "opacity-50" : "border-zinc-200"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{card.notion}</p>
                  {card.developpement && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{card.developpement}</p>
                  )}
                </div>
                {saved.has(i) ? (
                  <span className="text-xs text-zinc-400 flex-shrink-0 mt-0.5">Ajoutée</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveCard(card, i)}
                    className="text-xs font-semibold text-white rounded-md px-2.5 py-1 flex-shrink-0 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: accentColor }}
                  >
                    Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>

          {!loading && cards.length > 0 && saved.size < cards.length && (
            <button
              type="button"
              onClick={() => cards.forEach((c, i) => { if (!saved.has(i)) saveCard(c, i) })}
              className="w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Tout ajouter
            </button>
          )}
        </div>
      )}
    </div>
  )
}

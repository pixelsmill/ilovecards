"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImportFlow from "@/features/extraction/ImportFlow"

interface SuggestedCard {
  notion: string
  developpement?: string
  template: string
}

interface Props {
  deckId: string
  accentColor: string
  credits: number
  cardCount: number
}

export default function DeckAIActions({ deckId, accentColor, credits, cardCount }: Props) {
  const router = useRouter()
  const [panel, setPanel] = useState<"complete" | "import" | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedCard[]>([])
  const [saved, setSaved] = useState<Set<number>>(new Set())

  function openComplete() {
    if (panel === "complete") { setPanel(null); return }
    setPanel("complete")
    runComplete()
  }

  async function runComplete() {
    setLoading(true)
    setSuggestions([])
    setSaved(new Set())

    const res = await fetch("/api/ai/complete-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId }),
    }).catch(() => null)

    if (!res?.ok || !res.body) { setLoading(false); return }

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
          if (obj.notion) setSuggestions(prev => [...prev, obj as SuggestedCard])
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
    if (res?.ok) {
      setSaved(prev => new Set([...prev, index]))
      router.refresh()
    }
  }

  function handleImportSaved() {
    router.refresh()
    setPanel(null)
  }

  const unsaved = suggestions.filter((_, i) => !saved.has(i))

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPanel(p => p === "import" ? null : "import")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            panel === "import"
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          ✦ Importer
        </button>
        <button
          type="button"
          onClick={openComplete}
          disabled={cardCount < 3 || (loading && panel === "complete")}
          title={cardCount < 3 ? "3 cartes minimum" : undefined}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            panel === "complete"
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {loading && panel === "complete" ? "Génération…" : cardCount < 3 ? "✦ Compléter (3 cartes mini)" : "✦ Compléter"}
        </button>
      </div>

      {panel === "complete" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">Suggestions IA</p>
            {!loading && (
              <button
                type="button"
                onClick={runComplete}
                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                ↺ Regénérer
              </button>
            )}
          </div>

          {loading && suggestions.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">Analyse du deck en cours…</p>
          )}

          <div className="space-y-2">
            {suggestions.map((card, i) => (
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
                    className="text-xs font-semibold text-white rounded-md px-2.5 py-1 flex-shrink-0 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>

          {!loading && unsaved.length > 1 && (
            <button
              type="button"
              onClick={() => unsaved.forEach((c, i) => saveCard(c, suggestions.indexOf(c)))}
              className="w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Tout ajouter ({unsaved.length})
            </button>
          )}
        </div>
      )}

      {panel === "import" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <ImportFlow
            decks={[]}
            fixedDeckId={deckId}
            credits={credits}
            onSaved={handleImportSaved}
          />
        </div>
      )}
    </div>
  )
}

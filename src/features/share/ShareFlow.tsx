"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ACCENT_COLORS } from "@/lib/schemas/deck"

interface Deck {
  id: string
  name: string
  accentColor: string
}

interface Props {
  decks: Deck[]
  pendingImageUrl: string | null
}

export default function ShareFlow({ decks, pendingImageUrl }: Props) {
  const router = useRouter()
  const [deckMode, setDeckMode] = useState<"existing" | "new">(decks.length > 0 ? "existing" : "new")
  const [deckId, setDeckId] = useState(decks[0]?.id ?? "")
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckColor, setNewDeckColor] = useState(ACCENT_COLORS[0])
  const [notion, setNotion] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deckReady = deckMode === "existing" ? !!deckId : !!newDeckName.trim()

  async function handleSave() {
    if (!notion.trim() || !deckReady) return
    setSaving(true)
    setError(null)

    let targetDeckId = deckId

    if (deckMode === "new") {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName.trim(), accentColor: newDeckColor }),
      }).catch(() => null)
      if (!res?.ok) { setError("Impossible de créer le deck"); setSaving(false); return }
      const deck = await res.json()
      targetDeckId = deck.id
    }

    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckId: targetDeckId,
        notion: notion.trim(),
        template: pendingImageUrl ? "photo-overlay" : "minimaliste",
        imageUrl: pendingImageUrl ?? undefined,
        verified: true,
      }),
    }).catch(() => null)

    if (!res?.ok) { setError("Impossible de créer la carte"); setSaving(false); return }

    router.push(`/decks/${targetDeckId}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Nouvelle carte</h1>
          <p className="text-sm text-zinc-400">Photo partagée depuis ton appareil</p>
        </div>

        {pendingImageUrl ? (
          <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "2/3" }}>
            <img src={pendingImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-zinc-300 py-8 text-center text-sm text-zinc-400">
            Aucune image reçue
          </div>
        )}

        {/* Deck selector */}
        <div className="space-y-2">
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-sm">
            {decks.length > 0 && (
              <button
                type="button"
                onClick={() => setDeckMode("existing")}
                className={`flex-1 py-2 font-medium transition-colors ${deckMode === "existing" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Deck existant
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeckMode("new")}
              className={`flex-1 py-2 font-medium transition-colors ${deckMode === "new" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
            >
              + Nouveau deck
            </button>
          </div>

          {deckMode === "existing" && (
            <select
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 bg-white"
            >
              {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}

          {deckMode === "new" && (
            <div className="space-y-2">
              <input
                type="text"
                value={newDeckName}
                onChange={e => setNewDeckName(e.target.value)}
                placeholder="Nom du deck"
                maxLength={100}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <div className="flex gap-2">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewDeckColor(color)}
                    className={`w-6 h-6 rounded-full flex-shrink-0 transition-transform ${newDeckColor === color ? "scale-125 ring-2 ring-offset-2 ring-zinc-400" : "hover:scale-110"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="notion">Notion *</label>
          <input
            id="notion"
            type="text"
            value={notion}
            onChange={e => setNotion(e.target.value)}
            maxLength={500}
            placeholder="Ce que cette photo représente…"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !notion.trim() || !deckReady}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Créer la carte"}
        </button>
      </div>
    </main>
  )
}

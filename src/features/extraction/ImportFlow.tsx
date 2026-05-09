"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import { TEMPLATES } from "@/lib/schemas/card"
import { ACCENT_COLORS } from "@/lib/schemas/deck"

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
  imageUrl?: string
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
  credits?: number
}

export default function ImportFlow({ decks, defaultDeckId, credits }: Props) {
  const [phase, setPhase] = useState<Phase>("input")
  const [deckMode, setDeckMode] = useState<"existing" | "new">(decks.length > 0 ? "existing" : "new")
  const [deckId, setDeckId] = useState(defaultDeckId ?? decks[0]?.id ?? "")
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckColor, setNewDeckColor] = useState(ACCENT_COLORS[0])
  const [prompt, setPrompt] = useState("")
  const [url, setUrl] = useState("")
  const [showUrl, setShowUrl] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [cards, setCards] = useState<CardCandidate[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [creditsLeft, setCreditsLeft] = useState<number | undefined>(credits)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedDeck = deckMode === "new"
    ? { id: "", name: newDeckName, accentColor: newDeckColor }
    : decks.find(d => d.id === deckId)
  const acceptedCount = cards.filter(c => c.accepted).length
  const hasInput = prompt.trim() || url.trim() || !!file
  const deckReady = deckMode === "existing" ? !!deckId : !!newDeckName.trim()

  function updateCard(index: number, updates: Partial<CardCandidate>) {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") { setError("Seuls les fichiers PDF sont acceptés"); return }
    if (f.size > 20 * 1024 * 1024) { setError("PDF trop volumineux (max 20 Mo)"); return }
    setFile(f)
    setError(null)
  }

  async function handleGenerate() {
    if (!hasInput || !deckReady) return
    setPhase("extracting")
    setCards([])
    setError(null)

    try {
      const form = new FormData()
      form.append("deckId", deckMode === "existing" ? deckId : (decks[0]?.id || "pending"))
      if (prompt.trim()) form.append("prompt", prompt.trim())
      if (url.trim()) form.append("url", url.trim())
      if (file) form.append("file", file)

      const res = await fetch("/api/generate", { method: "POST", body: form })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error ?? "Erreur lors de la génération")
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
            if (card._error) { setError("Erreur lors de la génération IA"); continue }
            if (card._usage) { setCreditsLeft(card._usage.creditsLeft); continue }
            if (card.notion) {
              setCards(prev => [...prev, {
                notion: card.notion,
                developpement: card.developpement ?? "",
                source: card.source ?? "",
                template: TEMPLATES.includes(card.template) ? card.template : "minimaliste",
                imageUrl: typeof card.imageUrl === "string" ? card.imageUrl : undefined,
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

    let targetDeckId = deckId

    if (deckMode === "new") {
      try {
        const res = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newDeckName.trim(), accentColor: newDeckColor }),
        })
        if (!res.ok) { setError("Impossible de créer le deck"); setPhase("review"); return }
        const deck = await res.json()
        targetDeckId = deck.id
        setDeckId(deck.id)
      } catch {
        setError("Erreur réseau lors de la création du deck")
        setPhase("review")
        return
      }
    }

    let count = 0
    for (const card of accepted) {
      try {
        const res = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deckId: targetDeckId,
            notion: card.notion,
            developpement: card.developpement || undefined,
            source: card.source || undefined,
            template: card.template,
            imageUrl: card.imageUrl || undefined,
            verified: false,
          }),
        })
        if (res.ok) count++
      } catch {}
    }
    setSavedCount(count)
    setPhase("done")
  }

  function resetInput() {
    setPhase("input")
    setPrompt("")
    setUrl("")
    setFile(null)
    setShowUrl(false)
    setCards([])
    setError(null)
    setNewDeckName("")
    setNewDeckColor(ACCENT_COLORS[0])
    if (fileInputRef.current) fileInputRef.current.value = ""
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
          <button onClick={resetInput}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Nouvelle génération
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
                Génération en cours… {cards.length} carte{cards.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>{cards.length} cartes générées — {acceptedCount} sélectionnée{acceptedCount !== 1 ? "s" : ""}</span>
            )}
          </p>
          {phase === "review" && (
            <button
              onClick={handleSave}
              disabled={acceptedCount === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {acceptedCount === 0 ? "Aucune carte" : `Enregistrer ${acceptedCount}`}
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
                <div className="flex-shrink-0">
                  <CardRenderer card={card} size="thumb" accentColor={selectedDeck?.accentColor} />
                </div>
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
                <button
                  type="button"
                  onClick={() => updateCard(i, { accepted: !card.accepted })}
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold transition-colors ${card.accepted ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"}`}
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
              {acceptedCount === 0 ? "Aucune carte" : `Enregistrer ${acceptedCount}`}
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
        <p className="text-sm text-zinc-600">Génération en cours…</p>
        <p className="text-xs text-zinc-400">Jusqu'à 20 secondes</p>
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
            {decks.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
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

      {/* Main prompt area */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="prompt">
          Sur quoi créer des cartes ?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={6}
          placeholder={
            file ? "Instructions ou focus particulier (optionnel)…"
            : url ? "Instructions ou focus particulier (optionnel)…"
            : "Décris un sujet, colle tes notes, un article, un cours…"
          }
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
        />
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              file
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
            }`}
          >
            📎 {file ? file.name : "Joindre un PDF"}
          </button>
          <button
            type="button"
            onClick={() => { setShowUrl(v => !v); if (showUrl) setUrl("") }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showUrl
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
            }`}
          >
            🔗 Ajouter une URL
          </button>
          {(file || showUrl) && (
            <button
              type="button"
              onClick={() => { setFile(null); setUrl(""); setShowUrl(false); if (fileInputRef.current) fileInputRef.current.value = "" }}
              className="ml-auto text-xs text-zinc-400 hover:text-zinc-600"
            >
              Tout effacer
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {showUrl && (
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        )}
      </div>

      {creditsLeft !== undefined && (
        <p className={`text-xs text-center ${creditsLeft > 0 ? "text-zinc-400" : "text-amber-600 font-medium"}`}>
          {creditsLeft > 0
            ? `${creditsLeft} crédit${creditsLeft > 1 ? "s" : ""} restant${creditsLeft > 1 ? "s" : ""}`
            : "Crédits épuisés — +1 carte disponible demain"}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!hasInput || !deckReady || creditsLeft === 0}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Générer les flashcards
      </button>
    </div>
  )
}

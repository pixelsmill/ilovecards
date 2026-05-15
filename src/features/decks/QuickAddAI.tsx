"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  deckId: string
  deckName: string
  accentColor: string
}

export default function QuickAddAI({ deckId, deckName, accentColor }: Props) {
  const router = useRouter()
  const [notion, setNotion] = useState("")
  const [developpement, setDeveloppement] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasDraft = !!developpement

  async function generate() {
    const trimmed = notion.trim()
    if (!trimmed || generating) return
    setGenerating(true)
    setDeveloppement("")
    setSaved(false)
    try {
      const res = await fetch("/api/ai/developpement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notion: trimmed, deckName }),
      }).catch(() => null)
      if (res?.ok) {
        const data = await res.json()
        if (data.developpement) setDeveloppement(data.developpement)
      }
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    if (!notion.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId,
          notion: notion.trim(),
          developpement: developpement || undefined,
          template: "minimaliste",
          verified: true,
        }),
      }).catch(() => null)
      if (res?.ok) {
        setSaved(true)
        setNotion("")
        setDeveloppement("")
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDeveloppement("")
    setSaved(false)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-zinc-700">Ajout rapide par IA</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={notion}
          onChange={e => { setNotion(e.target.value); setDeveloppement(""); setSaved(false) }}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), generate())}
          placeholder="Taper une notion…"
          maxLength={200}
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
        <button
          type="button"
          onClick={generate}
          disabled={!notion.trim() || generating}
          className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:opacity-80"
          style={{ backgroundColor: accentColor }}
        >
          {generating ? "…" : "✦ Générer"}
        </button>
      </div>

      {hasDraft && (
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 space-y-1">
          <p className="text-sm font-medium text-zinc-800">{notion.trim()}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{developpement}</p>
        </div>
      )}

      {saved && (
        <p className="text-xs text-center text-zinc-500">Carte ajoutée ✓</p>
      )}

      {hasDraft && !saved && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: accentColor }}
          >
            {saving ? "…" : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}

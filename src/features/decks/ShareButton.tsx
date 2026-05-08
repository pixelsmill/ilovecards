"use client"

import { useState } from "react"

interface Props {
  deckId: string
  initialToken?: string | null
}

export default function ShareButton({ deckId, initialToken }: Props) {
  const [token, setToken] = useState<string | null>(initialToken ?? null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function enableShare() {
    setLoading(true)
    try {
      const res = await fetch(`/api/decks/${deckId}/share`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setToken(data.shareToken)
      }
    } finally {
      setLoading(false)
    }
  }

  async function disableShare() {
    setLoading(true)
    try {
      await fetch(`/api/decks/${deckId}/share`, { method: "DELETE" })
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!token) return
    const url = `${window.location.origin}/s/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!token) {
    return (
      <button
        onClick={enableShare}
        disabled={loading}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Partager"}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        {copied ? "✓ Lien copié !" : "Copier le lien"}
      </button>
      <button
        onClick={disableShare}
        disabled={loading}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
      >
        Désactiver
      </button>
    </div>
  )
}

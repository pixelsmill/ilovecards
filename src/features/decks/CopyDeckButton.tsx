"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  shareToken: string
  isLoggedIn: boolean
  callbackUrl: string
}

export default function CopyDeckButton({ shareToken, isLoggedIn, callbackUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  if (!isLoggedIn) {
    return (
      <a
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="inline-block rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: "#FBF9F4", color: "#1A1814" }}
      >
        Créer un compte pour copier ce deck
      </a>
    )
  }

  async function handleCopy() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/decks/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken }),
      })
      if (!res.ok) { setError(true); setLoading(false); return }
      const { id } = await res.json()
      router.push(`/decks/${id}`)
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCopy}
        disabled={loading}
        className="rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "#FBF9F4", color: "#1A1814" }}
      >
        {loading ? "Copie en cours…" : "Copier dans mon compte"}
      </button>
      {error && <p className="text-xs" style={{ color: "#f97316" }}>Une erreur s&apos;est produite, réessaie.</p>}
    </div>
  )
}

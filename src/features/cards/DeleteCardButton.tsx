"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  cardId: string
  deckId: string
}

export default function DeleteCardButton({ cardId, deckId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Supprimer cette carte ? Cette action est irréversible.")) return
    setLoading(true)
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" })
    router.push(`/decks/${deckId}`)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Suppression…" : "Supprimer la carte"}
    </button>
  )
}

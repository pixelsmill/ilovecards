"use client"

import { useRouter } from "next/navigation"

export default function DeleteDeckButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Supprimer ce deck et toutes ses cartes ? Cette action est irréversible.")) return
    const res = await fetch(`/api/decks/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/decks")
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
    >
      Supprimer
    </button>
  )
}

"use client"

import { useRouter } from "next/navigation"

export default function DeleteAccountButton() {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Supprimer définitivement ton compte ? Cette action est irréversible.")) return
    const res = await fetch("/api/account", { method: "DELETE" })
    if (res.ok) router.push("/login")
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
    >
      Supprimer mon compte
    </button>
  )
}

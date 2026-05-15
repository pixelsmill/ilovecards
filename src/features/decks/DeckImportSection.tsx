"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImportFlow from "@/features/extraction/ImportFlow"

interface Props {
  deckId: string
  credits: number
}

export default function DeckImportSection({ deckId, credits }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSaved() {
    router.refresh()
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        {open ? "Fermer l'import" : "✦ Importer par IA"}
      </button>

      {open && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <ImportFlow
            decks={[]}
            fixedDeckId={deckId}
            credits={credits}
            onSaved={handleSaved}
          />
        </div>
      )}
    </div>
  )
}

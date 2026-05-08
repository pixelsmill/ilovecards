"use client"

import { useState } from "react"
import TemplatePicker from "./TemplatePicker"

interface Props {
  deckId: string
  action: (formData: FormData) => void
  accentColor?: string
  defaultValues?: {
    notion?: string
    developpement?: string
    source?: string
    template?: string
  }
  submitLabel?: string
}

export default function CardForm({ deckId, action, accentColor, defaultValues, submitLabel = "Créer la carte" }: Props) {
  const [template, setTemplate] = useState(defaultValues?.template ?? "minimaliste")

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="template" value={template} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="notion">Notion *</label>
        <input
          id="notion"
          name="notion"
          type="text"
          required
          maxLength={500}
          defaultValue={defaultValues?.notion}
          placeholder="Ex: La photosynthèse"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="developpement">Développement (optionnel)</label>
        <textarea
          id="developpement"
          name="developpement"
          rows={4}
          maxLength={2000}
          defaultValue={defaultValues?.developpement}
          placeholder="Explication, définition, contexte..."
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="source">Source (optionnel)</label>
        <input
          id="source"
          name="source"
          type="text"
          maxLength={200}
          defaultValue={defaultValues?.source}
          placeholder="Ex: Livre p.42, Wikipedia..."
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Template visuel</p>
        <TemplatePicker selected={template} onChange={setTemplate} accentColor={accentColor} />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}

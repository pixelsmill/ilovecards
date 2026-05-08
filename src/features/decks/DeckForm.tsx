"use client"

import { useState } from "react"
import { ACCENT_COLORS } from "@/lib/schemas/deck"

interface DeckFormProps {
  action: (formData: FormData) => void
  defaultValues?: { name?: string; description?: string; accentColor?: string }
  submitLabel?: string
}

export default function DeckForm({ action, defaultValues, submitLabel = "Créer" }: DeckFormProps) {
  const [selectedColor, setSelectedColor] = useState(defaultValues?.accentColor ?? "#6366f1")

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="name">Nom du deck</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="Ex: Vocabulaire espagnol"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700" htmlFor="description">Description (optionnel)</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          placeholder="À quoi sert ce deck ?"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Couleur d'accent</p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className="w-8 h-8 rounded-full transition-all"
              style={{
                backgroundColor: color,
                outline: selectedColor === color ? `2px solid ${color}` : "2px solid transparent",
                outlineOffset: "2px",
                transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <input type="hidden" name="accentColor" value={selectedColor} />
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

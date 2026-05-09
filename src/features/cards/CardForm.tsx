"use client"

import { useRef, useState } from "react"
import TemplatePicker from "./TemplatePicker"

const MAX_PX = 800

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("resize failed"))), "image/jpeg", 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load failed")) }
    img.src = url
  })
}

interface Props {
  deckId: string
  action: (formData: FormData) => void
  accentColor?: string
  cardId?: string
  defaultValues?: {
    notion?: string
    developpement?: string
    source?: string
    template?: string
    imageUrl?: string | null
  }
  submitLabel?: string
}

export default function CardForm({ deckId, action, accentColor, cardId, defaultValues, submitLabel = "Créer la carte" }: Props) {
  const [template, setTemplate] = useState(defaultValues?.template ?? "minimaliste")
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? null)
  const [changingPhoto, setChangingPhoto] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const form = new FormData()
      form.append("file", resized, "photo.jpg")
      const res = await fetch("/api/upload", { method: "POST", body: form }).catch(() => null)
      if (res?.ok) {
        const data = await res.json()
        setImageUrl(data.url)
        setTemplate("photo-overlay")
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleChangePhoto() {
    if (!cardId) return
    setChangingPhoto(true)
    const res = await fetch(`/api/cards/${cardId}`, { method: "PATCH" }).catch(() => null)
    if (res?.ok) {
      const data = await res.json()
      setImageUrl(data.imageUrl)
    }
    setChangingPhoto(false)
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="template" value={template} />
      {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

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

      {template === "photo-overlay" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Photo</p>

          {imageUrl ? (
            <>
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "2/3" }}>
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                >
                  {uploading ? "Envoi…" : "📷 Depuis l'appareil"}
                </button>
                {cardId && (
                  <button
                    type="button"
                    onClick={handleChangePhoto}
                    disabled={changingPhoto}
                    className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                  >
                    {changingPhoto ? "Chargement…" : "↻ Autre Unsplash"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border-2 border-dashed border-zinc-300 px-4 py-8 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40"
            >
              {uploading ? "Redimensionnement et envoi…" : "📷 Ajouter une photo"}
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}

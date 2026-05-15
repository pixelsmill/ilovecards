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
  returnTo?: string
  defaultValues?: {
    notion?: string
    developpement?: string
    source?: string
    template?: string
    imageUrl?: string | null
    verified?: boolean
  }
  submitLabel?: string
}

export default function CardForm({ deckId, action, accentColor, cardId, returnTo, defaultValues, submitLabel = "Créer la carte" }: Props) {
  const [template, setTemplate] = useState(defaultValues?.template ?? "minimaliste")
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? null)
  const [verified, setVerified] = useState(defaultValues?.verified ?? true)
  const [imageSource, setImageSource] = useState<"picker" | "url">("picker")
  const [loadingUnsplash, setLoadingUnsplash] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleTemplateChange(t: string) {
    setTemplate(t)
    if (t !== "photo-overlay") setImageSource("picker")
  }

  function applyUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    try { new URL(trimmed) } catch { return }
    setImageUrl(trimmed)
    setUrlInput("")
    setImageSource("picker")
  }

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

  async function handleUnsplash() {
    if (!cardId) return
    setLoadingUnsplash(true)
    const res = await fetch(`/api/cards/${cardId}`, { method: "PATCH" }).catch(() => null)
    if (res?.ok) {
      const data = await res.json()
      setImageUrl(data.imageUrl)
    }
    setLoadingUnsplash(false)
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="template" value={template} />
      {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <input type="hidden" name="verified" value={verified ? "true" : "false"} />

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
        <TemplatePicker selected={template} onChange={handleTemplateChange} accentColor={accentColor} />
      </div>

      {template === "photo-overlay" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Photo</p>

          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "2/3" }}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex gap-2">
            {cardId && (
              <button
                type="button"
                onClick={handleUnsplash}
                disabled={loadingUnsplash}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
              >
                {loadingUnsplash ? "…" : "Unsplash"}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
            >
              {uploading ? "…" : "Appareil"}
            </button>
            <button
              type="button"
              onClick={() => setImageSource(imageSource === "url" ? "picker" : "url")}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${imageSource === "url" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}
            >
              URL
            </button>
          </div>

          {imageSource === "url" && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyUrl())}
                placeholder="Coller une URL d'image…"
                autoFocus
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="button"
                onClick={applyUrl}
                disabled={!urlInput.trim()}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setVerified(v => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-colors hover:bg-zinc-50"
      >
        <span className="text-sm font-medium text-zinc-700">Carte vérifiée</span>
        <span
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${verified ? "bg-zinc-900" : "bg-zinc-300"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${verified ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </span>
      </button>

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}

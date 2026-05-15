"use client"

import { useRef, useState } from "react"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import TemplatePicker from "./TemplatePicker"
import DeleteCardButton from "./DeleteCardButton"
import type { UnsplashPhoto } from "@/lib/unsplash"

function TapIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12m0 0v-2a1.5 1.5 0 0 1 3 0v2m0 0a1.5 1.5 0 0 1 3 0v1m0 0a5 5 0 0 1-5 6H9a5 5 0 0 1-5-5v-2a1.5 1.5 0 0 1 3 0v2" />
    </svg>
  )
}

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

function imageSourceLabel(url: string | null): string | null {
  if (!url) return null
  if (url.includes("unsplash.com")) return "Unsplash"
  if (url.includes("vercel-storage.com")) return "Appareil"
  return "URL"
}

interface Props {
  deckId: string
  cardId?: string
  deckName: string
  accentColor: string
  action: (formData: FormData) => void
  returnTo?: string
  submitLabel?: string
  defaultValues: {
    notion: string
    developpement?: string
    source?: string
    template: string
    imageUrl?: string | null
    verified: boolean
  }
}

export default function CardEditClient({ deckId, cardId, deckName, accentColor, action, returnTo, submitLabel = "Enregistrer", defaultValues }: Props) {
  const [notion, setNotion] = useState(defaultValues.notion)
  const [developpement, setDeveloppement] = useState(defaultValues.developpement ?? "")
  const [source, setSource] = useState(defaultValues.source ?? "")
  const [template, setTemplate] = useState(defaultValues.template)
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValues.imageUrl ?? null)
  const [verified, setVerified] = useState(defaultValues.verified)
  const [flipped, setFlipped] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [loadingUnsplash, setLoadingUnsplash] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleTemplateChange(t: string) {
    setTemplate(t)
    if (t !== "photo-overlay") {
      setUnsplashResults([])
      setShowUrlInput(false)
    }
  }

  function applyUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    try { new URL(trimmed) } catch { return }
    setImageUrl(trimmed)
    setTemplate("photo-overlay")
    setUrlInput("")
    setShowUrlInput(false)
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
    const query = notion.trim()
    if (!query) return
    setLoadingUnsplash(true)
    const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`).catch(() => null)
    if (res?.ok) {
      const data = await res.json()
      const photos: UnsplashPhoto[] = data.photos ?? []
      setUnsplashResults(photos)
      if (photos.length > 0 && !imageUrl) {
        setImageUrl(photos[0].regular)
        setTemplate("photo-overlay")
      }
    }
    setLoadingUnsplash(false)
  }

  const previewCard = {
    notion: notion || " ",
    developpement: developpement || null,
    source: source || null,
    template,
    imageUrl: template === "photo-overlay" ? imageUrl : null,
    verified,
  }

  const nonUnsplashImage = imageUrl && !unsplashResults.find(p => p.regular === imageUrl) ? imageUrl : null
  const showGrid = unsplashResults.length > 0 || !!nonUnsplashImage

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* Live preview */}
      <div className="flex flex-col items-center gap-3 py-8 rounded-2xl bg-zinc-700">
        <div className="cursor-pointer" style={{ zoom: 1.6 }} onClick={() => setFlipped(f => !f)}>
          <CardRenderer
            card={previewCard}
            size="preview"
            flipped={flipped}
            accentColor={accentColor}
            deckName={deckName}
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1"><TapIcon /> retourner</span>
          {template === "photo-overlay" && imageUrl && (
            <span className="rounded-full bg-zinc-600 px-2 py-0.5 text-zinc-300">
              {imageSourceLabel(imageUrl)}
            </span>
          )}
        </div>

        {template === "photo-overlay" && (
          <div className="w-full px-4 space-y-2">
            <div className="flex gap-2">
              <button type="button" onClick={handleUnsplash} disabled={loadingUnsplash}
                className="flex-1 rounded-lg bg-zinc-600 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-500 transition-colors disabled:opacity-40">
                {loadingUnsplash ? "…" : "Unsplash"}
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex-1 rounded-lg bg-zinc-600 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-500 transition-colors disabled:opacity-40">
                {uploading ? "…" : "Appareil"}
              </button>
              <button type="button" onClick={() => setShowUrlInput(v => !v)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${showUrlInput ? "bg-white text-zinc-900" : "bg-zinc-600 text-zinc-200 hover:bg-zinc-500"}`}>
                URL
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2">
                <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyUrl())}
                  placeholder="Coller une URL…" autoFocus
                  className="flex-1 rounded-lg bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-400" />
                <button type="button" onClick={applyUrl} disabled={!urlInput.trim()}
                  className="rounded-lg bg-zinc-600 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-500 transition-colors disabled:opacity-40">
                  OK
                </button>
              </div>
            )}

            {showGrid && (
              <div className="grid grid-cols-5 gap-1">
                {unsplashResults.map(p => (
                  <button key={p.id} type="button" onClick={() => setImageUrl(p.regular)}
                    className={`aspect-[2/3] rounded overflow-hidden transition-all ${imageUrl === p.regular ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-700" : "opacity-60 hover:opacity-100"}`}>
                    <img src={p.thumb} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
                {nonUnsplashImage && (
                  <div className="aspect-[2/3] rounded overflow-hidden ring-2 ring-white ring-offset-1 ring-offset-zinc-700">
                    <img src={nonUnsplashImage} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <form action={action} className="space-y-5">
        <input type="hidden" name="deckId" value={deckId} />
        <input type="hidden" name="template" value={template} />
        {imageUrl && template === "photo-overlay" && <input type="hidden" name="imageUrl" value={imageUrl} />}
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
        <input type="hidden" name="verified" value={verified ? "true" : "false"} />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="notion">Notion *</label>
          <input
            id="notion"
            name="notion"
            type="text"
            required
            maxLength={500}
            value={notion}
            onChange={e => setNotion(e.target.value)}
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
            value={developpement}
            onChange={e => setDeveloppement(e.target.value)}
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
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Ex: Livre p.42, Wikipedia..."
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Template visuel</p>
          <TemplatePicker selected={template} onChange={handleTemplateChange} accentColor={accentColor} />
        </div>

        <button type="button" onClick={() => setVerified(v => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-colors hover:bg-zinc-50">
          <span className="text-sm font-medium text-zinc-700">Carte vérifiée</span>
          <span className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${verified ? "bg-zinc-900" : "bg-zinc-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${verified ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
        </button>

        <button type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
          {submitLabel}
        </button>
      </form>

      {cardId && (
        <div className="pt-2 pb-8">
          <DeleteCardButton cardId={cardId} deckId={deckId} />
        </div>
      )}
    </>
  )
}

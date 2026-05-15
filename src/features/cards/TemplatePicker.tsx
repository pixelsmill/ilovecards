"use client"

import CardRenderer from "@/components/card-renderer/CardRenderer"
import { TEMPLATES } from "@/lib/schemas/card"

const TEMPLATE_LABELS: Record<string, string> = {
  minimaliste: "Minimal",
  poster: "Poster",
  quote: "Citation",
  magazine: "Magazine",
  "color-block": "Bloc",
  "photo-overlay": "Image",
  equation: "Équation",
  sature: "Saturé",
}

const SAMPLE_NOTION = "Concept"

interface Props {
  selected: string
  onChange: (template: string) => void
  accentColor?: string
}

export default function TemplatePicker({ selected, onChange, accentColor = "#6366f1" }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TEMPLATES.map(template => (
        <button
          key={template}
          type="button"
          onClick={() => onChange(template)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div
            style={{
              outline: selected === template ? `2px solid ${accentColor}` : "2px solid transparent",
              outlineOffset: "2px",
              borderRadius: "6px",
              transition: "outline-color 0.15s",
            }}
          >
            <CardRenderer
              card={{
                notion: SAMPLE_NOTION,
                template,
                ...(template === "photo-overlay" ? { imageUrl: "/placeholder-photo.svg" } : {}),
              }}
              size="thumb"
              accentColor={accentColor}
            />
          </div>
          <span
            className={`text-[9px] leading-none font-medium transition-colors ${
              selected === template ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
            }`}
          >
            {TEMPLATE_LABELS[template]}
          </span>
        </button>
      ))}
    </div>
  )
}

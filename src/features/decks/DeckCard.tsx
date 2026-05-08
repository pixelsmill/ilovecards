import Link from "next/link"

interface DeckCardProps {
  id: string
  name: string
  description?: string | null
  accentColor: string
  cardCount: number
  dueCount?: number
}

export default function DeckCard({ id, name, description, accentColor, cardCount, dueCount }: DeckCardProps) {
  return (
    <Link
      href={`/decks/${id}`}
      className="block rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-2" style={{ backgroundColor: accentColor }} />
      <div className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-zinc-900">{name}</p>
          {dueCount != null && dueCount > 0 && (
            <span className="shrink-0 text-xs font-medium rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: accentColor }}>
              {dueCount} due{dueCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-zinc-500 line-clamp-2">{description}</p>}
        <p className="text-xs text-zinc-400">{cardCount} carte{cardCount !== 1 ? "s" : ""}</p>
      </div>
    </Link>
  )
}

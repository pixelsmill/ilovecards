import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DeleteDeckButton from "./DeleteDeckButton"

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { cards: { orderBy: { createdAt: "desc" } } },
  })

  if (!deck || deck.userId !== session.user.id) notFound()

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deck.accentColor }} />
          <h1 className="text-xl font-bold tracking-tight flex-1">{deck.name}</h1>
        </div>

        {deck.description && <p className="text-sm text-zinc-500">{deck.description}</p>}

        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/decks/${id}/cards/new`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Nouvelle carte
          </Link>
          <Link
            href={`/decks/${id}/edit`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Modifier
          </Link>
          <DeleteDeckButton id={id} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">{deck.cards.length} carte{deck.cards.length !== 1 ? "s" : ""}</p>
          {deck.cards.length === 0 ? (
            <p className="text-sm text-zinc-400 py-8 text-center">
              Aucune carte. <Link href={`/decks/${id}/cards/new`} className="underline">Ajouter une carte</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {deck.cards.map(card => (
                <div key={card.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3 flex items-center justify-between">
                  <p className="text-sm text-zinc-800 truncate">{card.notion}</p>
                  <Link href={`/decks/${id}/cards/${card.id}/edit`} className="text-xs text-zinc-400 hover:text-zinc-600 ml-4 flex-shrink-0">
                    Modifier
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/decks" className="block text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Retour aux decks
        </Link>
      </div>
    </main>
  )
}

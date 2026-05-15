import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DeckCard from "@/features/decks/DeckCard"
import Breadcrumb from "@/components/Breadcrumb"

export default async function DecksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { cards: true } },
      cards: {
        where: { nextReviewAt: { lte: endOfToday } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Mes decks" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Mes decks</h1>
          <Link
            href="/decks/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Nouveau deck
          </Link>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-sm">Aucun deck pour l'instant.</p>
            <Link href="/decks/new" className="text-sm text-zinc-600 underline mt-2 inline-block">
              Créer mon premier deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decks.map(deck => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                description={deck.description}
                accentColor={deck.accentColor}
                cardCount={deck._count.cards}
                dueCount={deck.cards.length}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

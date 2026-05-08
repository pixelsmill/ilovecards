import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ImportFlow from "@/features/extraction/ImportFlow"

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ deckId?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { deckId } = await searchParams

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, accentColor: true },
    orderBy: { createdAt: "desc" },
  })

  if (decks.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-8">
        <div className="max-w-sm mx-auto text-center space-y-4 py-12">
          <p className="text-zinc-500 text-sm">Crée d&apos;abord un deck pour pouvoir importer des cartes.</p>
          <Link href="/decks/new" className="inline-block rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
            Créer un deck
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Import IA</h1>
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Dashboard
          </Link>
        </div>
        <ImportFlow decks={decks} defaultDeckId={deckId} />
      </div>
    </main>
  )
}

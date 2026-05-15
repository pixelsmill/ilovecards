import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ImportFlow from "@/features/extraction/ImportFlow"
import Breadcrumb from "@/components/Breadcrumb"

const MS_PER_DAY = 86_400_000
const MAX_CREDITS = 30

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ deckId?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { deckId } = await searchParams

  const [decks, user] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, accentColor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiCredits: true, lastCreditAt: true },
    }),
  ])

  const daysSince = user ? Math.floor((Date.now() - user.lastCreditAt.getTime()) / MS_PER_DAY) : 0
  const credits = user ? Math.min(MAX_CREDITS, user.aiCredits + daysSince) : 0

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Import IA" }]} />
        <h1 className="text-xl font-bold tracking-tight">Générer des cartes</h1>
        <ImportFlow decks={decks} defaultDeckId={deckId} credits={credits} />
      </div>
    </main>
  )
}

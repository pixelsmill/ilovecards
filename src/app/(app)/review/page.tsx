import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReviewSession from "@/features/review/ReviewSession"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string; deckId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { all, deckId } = await searchParams
  const forceAll = all === "1"

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const cards = await prisma.card.findMany({
    where: {
      deck: {
        userId: session.user.id,
        ...(deckId ? { id: deckId } : {}),
      },
      ...(forceAll ? {} : { nextReviewAt: { lte: endOfToday } }),
    },
    include: { deck: { select: { accentColor: true } } },
    orderBy: { nextReviewAt: "asc" },
  })

  const backHref = deckId ? `/decks/${deckId}` : "/dashboard"

  if (cards.length === 0) {
    return (
      <main className="h-dvh bg-zinc-700 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="text-white text-xl font-semibold">Rien à réviser aujourd&apos;hui !</p>
          <p className="text-zinc-300 text-sm">Toutes tes cartes sont à jour.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Link
            href={`/review?all=1${deckId ? `&deckId=${deckId}` : ""}`}
            className="rounded-lg bg-zinc-600 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-500 transition-colors"
          >
            Réviser quand même
          </Link>
          <Link
            href={backHref}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </main>
    )
  }

  return <ReviewSession initialCards={cards} />
}

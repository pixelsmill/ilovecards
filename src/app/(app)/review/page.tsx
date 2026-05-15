import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReviewSession from "@/features/review/ReviewSession"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string; deckId?: string; mode?: string; cardId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { all, deckId, mode: modeParam, cardId } = await searchParams
  const mode = modeParam === "learn" ? "learn" : "browse"
  const forceAll = all === "1" || mode === "browse"

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
    include: { deck: { select: { accentColor: true, name: true, id: true } } },
    orderBy: { createdAt: mode === "browse" ? "asc" : undefined, nextReviewAt: mode === "learn" ? "asc" : undefined },
  })

  const backHref = deckId ? `/decks/${deckId}` : "/dashboard"

  if (cards.length === 0) {
    return (
      <main className="h-[calc(100dvh-3.5rem)] bg-zinc-700 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🃏</p>
          <p className="text-white text-xl font-semibold">Ce deck est vide.</p>
        </div>
        <Link
          href={backHref}
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Retour
        </Link>
      </main>
    )
  }

  return <ReviewSession initialCards={cards} mode={mode} backHref={backHref} initialCardId={cardId} />
}

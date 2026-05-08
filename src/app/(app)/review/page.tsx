import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReviewSession from "@/features/review/ReviewSession"

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { all } = await searchParams
  const forceAll = all === "1"

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const cards = await prisma.card.findMany({
    where: {
      deck: { userId: session.user.id },
      ...(forceAll ? {} : { nextReviewAt: { lte: endOfToday } }),
    },
    include: { deck: { select: { accentColor: true } } },
    orderBy: { nextReviewAt: "asc" },
  })

  if (cards.length === 0) {
    return (
      <main className="h-dvh bg-zinc-900 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="text-white text-xl font-semibold">Rien à réviser aujourd&apos;hui !</p>
          <p className="text-zinc-400 text-sm">Toutes tes cartes sont à jour.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/review?all=1"
            className="rounded-lg bg-zinc-700 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-600 transition-colors"
          >
            Réviser quand même
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>
      </main>
    )
  }

  return <ReviewSession initialCards={cards} />
}

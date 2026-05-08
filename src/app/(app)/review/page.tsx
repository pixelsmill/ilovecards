import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReviewSession from "@/features/review/ReviewSession"

export default async function ReviewPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const cards = await prisma.card.findMany({
    where: {
      deck: { userId: session.user.id },
      nextReviewAt: { lte: endOfToday },
    },
    include: { deck: { select: { accentColor: true } } },
    orderBy: { nextReviewAt: "asc" },
  })

  if (cards.length === 0) {
    return (
      <main className="h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="text-white text-xl font-semibold">Rien à réviser aujourd&apos;hui !</p>
          <p className="text-zinc-400 text-sm">Toutes tes cartes sont à jour.</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </main>
    )
  }

  return <ReviewSession initialCards={cards} />
}

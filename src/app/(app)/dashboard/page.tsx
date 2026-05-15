import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import RetentionChart from "@/features/dashboard/RetentionChart"

function computeStreak(reviewedAts: (Date | null)[]): number {
  const dateSet = new Set(
    reviewedAts
      .filter((d): d is Date => d !== null)
      .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)
  )
  let streak = 0
  const cursor = new Date()
  while (true) {
    const ds = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    if (dateSet.has(ds)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }
  return streak
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date(startOfToday)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [dueDecks, allCards, recentReviews, decks] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        cards: {
          where: { nextReviewAt: { lte: endOfToday } },
          select: { id: true },
        },
      },
    }),
    prisma.card.findMany({
      where: { deck: { userId: session.user.id }, lastReviewAt: { not: null } },
      select: { lastReviewAt: true },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id, reviewedAt: { gte: thirtyDaysAgo } },
      select: { action: true, reviewedAt: true, deckId: true },
    }),
    prisma.deck.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    }),
  ])

  const dueCount = dueDecks.reduce((sum, d) => sum + d.cards.length, 0)
  const dueByDeck = dueDecks.filter(d => d.cards.length > 0)
  const streak = computeStreak(allCards.map(c => c.lastReviewAt))

  // Build 30-day retention data for chart
  const reviewMap = new Map<string, { dismiss: number; total: number }>()
  const deckReviewMap = new Map<string, Map<string, { dismiss: number; total: number }>>()

  for (const r of recentReviews) {
    const d = r.reviewedAt
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    const global = reviewMap.get(ds) ?? { dismiss: 0, total: 0 }
    global.total++
    if (r.action === "dismiss") global.dismiss++
    reviewMap.set(ds, global)

    const deckMap = deckReviewMap.get(r.deckId) ?? new Map()
    const deckDay = deckMap.get(ds) ?? { dismiss: 0, total: 0 }
    deckDay.total++
    if (r.action === "dismiss") deckDay.dismiss++
    deckMap.set(ds, deckDay)
    deckReviewMap.set(r.deckId, deckMap)
  }

  const chartDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(startOfToday)
    d.setDate(d.getDate() - (29 - i))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

  const globalChartData = chartDays.map(date => ({
    date: date.slice(5),
    ...( reviewMap.get(date) ?? { dismiss: 0, total: 0 }),
  }))

  const deckChartData = decks.map(deck => ({
    id: deck.id,
    name: deck.name,
    data: chartDays.map(date => ({
      date: date.slice(5),
      ...(deckReviewMap.get(deck.id)?.get(date) ?? { dismiss: 0, total: 0 }),
    })),
  }))

  const sessionCount = new Set(recentReviews.map(r => {
    const d = r.reviewedAt
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })).size

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">ilovecards</h1>

      {streak > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-full px-4 py-1.5">
          <span>🔥</span>
          <span>{streak} jour{streak !== 1 ? "s" : ""} de streak</span>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/review?mode=browse"
          className="flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Voir les cartes
        </Link>
        <Link
          href="/decks"
          className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Mes decks
        </Link>
        <Link
          href="/import"
          className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Import IA
        </Link>
        <Link
          href="/account"
          className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Mon compte
        </Link>
      </div>

      <div className="w-full max-w-xs">
        <RetentionChart
          globalData={globalChartData}
          deckData={deckChartData}
          sessionCount={sessionCount}
        />
      </div>
    </main>
  )
}

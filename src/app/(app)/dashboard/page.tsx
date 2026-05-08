import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const dueCount = await prisma.card.count({
    where: {
      deck: { userId: session.user.id },
      nextReviewAt: { lte: endOfToday },
    },
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 gap-6">
      <h1 className="text-2xl font-bold tracking-tight">ilovecards</h1>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {dueCount > 0 ? (
          <Link
            href="/review"
            className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <span>Réviser</span>
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{dueCount} due{dueCount !== 1 ? "s" : ""}</span>
          </Link>
        ) : (
          <div className="flex items-center justify-between rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-400">
            <span>Réviser</span>
            <span className="text-xs">À jour ✓</span>
          </div>
        )}
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
    </main>
  )
}

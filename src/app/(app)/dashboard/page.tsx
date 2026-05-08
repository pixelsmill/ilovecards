import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 gap-6">
      <h1 className="text-2xl font-bold tracking-tight">ilovecards</h1>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/decks"
          className="flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Mes decks
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

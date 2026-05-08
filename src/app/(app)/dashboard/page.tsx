import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 gap-4">
      <h1 className="text-2xl font-bold tracking-tight">ilovecards</h1>
      <p className="text-sm text-zinc-500">Dashboard — à implémenter en story 5.1</p>
      <Link href="/account" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
        Mon compte
      </Link>
    </main>
  )
}

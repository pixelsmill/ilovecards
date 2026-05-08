import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import DeleteAccountButton from "./DeleteAccountButton"

export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <main className="flex min-h-screen items-start justify-center bg-zinc-50 pt-16">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Mon compte</h1>
          <p className="text-sm text-zinc-500">{session.user?.email}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-700">Mes données</h2>
          <a
            href="/api/export"
            download="ilovecards-export.json"
            className="flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Exporter mes données
          </a>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-700">Zone dangereuse</h2>
          <DeleteAccountButton />
        </div>

        <Link
          href="/dashboard"
          className="block text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </main>
  )
}

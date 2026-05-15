"use client"

import { useState } from "react"

export default function VIPForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null)
    setStatus("done")
  }

  if (status === "done") {
    return (
      <p className="text-sm text-center py-2" style={{ color: "#C68A3A" }}>
        Demande enregistrée — on vous contacte bientôt.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.com"
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        style={{ background: "rgba(251,249,244,0.08)", color: "#FBF9F4", border: "1px solid rgba(251,249,244,0.12)" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "#C68A3A", color: "#1A1814" }}
      >
        {status === "loading" ? "…" : "Demander l'accès VIP"}
      </button>
    </form>
  )
}

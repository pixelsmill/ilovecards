"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  cardId: string
  verified: boolean
  accentColor: string
}

export default function VerifyCardButton({ cardId, verified: initialVerified, accentColor }: Props) {
  const [verified, setVerified] = useState(initialVerified)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const newVerified = !verified
    const res = await fetch(`/api/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: newVerified }),
    }).catch(() => null)
    if (res?.ok) {
      setVerified(newVerified)
      router.refresh()
    }
    setLoading(false)
  }

  const title = verified ? "Marquer comme non vérifiée" : "Marquer comme vérifiée"

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={title}
      aria-label={title}
      className="flex-shrink-0 w-5 h-5 rounded-full transition-opacity disabled:opacity-40"
      style={verified
        ? { backgroundColor: accentColor }
        : { border: `2px solid ${accentColor}`, backgroundColor: "transparent" }
      }
    />
  )
}

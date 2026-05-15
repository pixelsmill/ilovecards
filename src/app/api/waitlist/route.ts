import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}))
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 })
  }
  try {
    await prisma.vipWaitlist.create({ data: { email: email.toLowerCase().trim() } })
    return NextResponse.json({ ok: true })
  } catch {
    // email déjà enregistré (contrainte unique)
    return NextResponse.json({ ok: true })
  }
}

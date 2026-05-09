import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ShareFlow from "@/features/share/ShareFlow"

export default async function SharePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/share")

  const cookieStore = await cookies()
  const pendingUrl = cookieStore.get("pending_share_url")?.value ?? null

  // Clear the cookie
  cookieStore.set("pending_share_url", "", { maxAge: 0, path: "/" })

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, accentColor: true },
    orderBy: { updatedAt: "desc" },
  })

  return <ShareFlow decks={decks} pendingImageUrl={pendingUrl} />
}

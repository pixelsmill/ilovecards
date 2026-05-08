import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("Non authentifié", "UNAUTHORIZED", 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, createdAt: true },
  })

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      email: user?.email,
      createdAt: user?.createdAt,
    },
    decks: [],
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ilovecards-export.json"`,
    },
  })
}

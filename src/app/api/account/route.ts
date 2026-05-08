import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("Non authentifié", "UNAUTHORIZED", 401)
  }

  await prisma.user.delete({ where: { id: session.user.id } })

  return Response.json({ success: true })
}

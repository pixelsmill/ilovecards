import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const formData = await req.formData().catch(() => null)
  if (!formData) return apiError("Données invalides", "INVALID_INPUT", 400)

  const file = formData.get("file") as File | null
  if (!file || !file.type.startsWith("image/")) return apiError("Fichier image requis", "INVALID_INPUT", 400)
  if (file.size > 5 * 1024 * 1024) return apiError("Image trop volumineuse (max 5 Mo)", "FILE_TOO_LARGE", 400)

  const blob = await put(`cards/${session.user.id}/${Date.now()}.jpg`, file, {
    access: "public",
  })

  return Response.json({ url: blob.url })
}

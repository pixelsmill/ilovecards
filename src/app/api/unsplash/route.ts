import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"
import { searchUnsplashImages } from "@/lib/unsplash"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")?.trim()
  if (!query) return apiError("Requête manquante", "INVALID_INPUT", 400)

  const photos = await searchUnsplashImages(query)
  return Response.json({ photos })
}

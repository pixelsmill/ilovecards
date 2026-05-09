import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/share")

  const formData = await req.formData().catch(() => null)
  if (!formData) redirect("/share")

  // Handle shared image file
  const file = formData.get("file") as File | null
  if (file && file.type.startsWith("image/") && file.size > 0) {
    const blob = await put(
      `cards/${session.user.id}/share-${Date.now()}.jpg`,
      file,
      { access: "public" }
    ).catch(() => null)

    if (blob) {
      const cookieStore = await cookies()
      cookieStore.set("pending_share_url", blob.url, {
        maxAge: 600,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    }
  }

  // Handle shared URL (text/url field)
  const sharedUrl = (formData.get("url") as string | null)?.trim()
  if (!file && sharedUrl) {
    try {
      new URL(sharedUrl)
      const cookieStore = await cookies()
      cookieStore.set("pending_share_url", sharedUrl, {
        maxAge: 600,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    } catch {}
  }

  redirect("/share")
}

import { signIn } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams
  const redirectTo = callbackUrl ?? "/dashboard"

  const cookieStore = await cookies()
  const vipUnlocked = cookieStore.get("vip_unlocked")?.value === "1"

  return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "#1A1814" }}>
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-spectral), serif", color: "#FBF9F4" }}>
            ilovecards
          </h1>
          <p className="text-sm" style={{ color: "#6B6356" }}>
            {vipUnlocked ? "Entrez votre email pour recevoir un lien de connexion" : "Entrez votre code VIP pour accéder"}
          </p>
        </div>

        {!vipUnlocked ? (
          <form
            action={async (fd: FormData) => {
              "use server"
              const code = fd.get("code") as string
              if (code?.trim() === process.env.VIP_CODE) {
                const store = await cookies()
                store.set("vip_unlocked", "1", { httpOnly: true, maxAge: 60 * 60 * 24 * 90, path: "/" })
                redirect("/login")
              }
            }}
            className="space-y-3"
          >
            <input
              type="password"
              name="code"
              required
              placeholder="Code VIP"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(251,249,244,0.08)", color: "#FBF9F4", border: "1px solid rgba(251,249,244,0.12)" }}
            />
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#C68A3A", color: "#1A1814" }}
            >
              Accéder
            </button>
          </form>
        ) : (
          <form
            action={async (formData: FormData) => {
              "use server"
              await signIn("resend", {
                email: formData.get("email") as string,
                redirectTo,
              })
            }}
            className="space-y-3"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="votre@email.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(251,249,244,0.08)", color: "#FBF9F4", border: "1px solid rgba(251,249,244,0.12)" }}
            />
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#FBF9F4", color: "#1A1814" }}
            >
              Envoyer le lien
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

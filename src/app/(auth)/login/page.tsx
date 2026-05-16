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
            action={async () => {
              "use server"
              await signIn("google", { redirectTo })
            }}
          >
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-3"
              style={{ background: "#FBF9F4", color: "#1A1814" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

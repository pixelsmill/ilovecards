import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">ilovecards</h1>
          <p className="text-sm text-zinc-500">Entre ton email pour recevoir un lien de connexion</p>
        </div>
        <form
          action={async (formData: FormData) => {
            "use server"
            await signIn("resend", {
              email: formData.get("email") as string,
              redirectTo: "/dashboard",
            })
          }}
          className="space-y-4"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="ton@email.com"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Envoyer le lien
          </button>
        </form>
      </div>
    </main>
  )
}

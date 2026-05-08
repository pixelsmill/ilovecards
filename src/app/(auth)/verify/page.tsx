export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Vérifie tes emails</h1>
        <p className="text-sm text-zinc-500">
          Un lien de connexion a été envoyé à ton adresse email.
          <br />
          Le lien est valable 24h et à usage unique.
        </p>
        <a href="/login" className="text-sm text-zinc-900 underline underline-offset-4">
          Renvoyer un lien
        </a>
      </div>
    </main>
  )
}

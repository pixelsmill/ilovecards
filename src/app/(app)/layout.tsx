import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import TopBar from "@/components/nav/TopBar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <>
      <TopBar userEmail={session.user?.email ?? null} />
      <div className="pt-14">{children}</div>
    </>
  )
}

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import BurgerMenu from "@/components/nav/BurgerMenu"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <>
      <BurgerMenu userEmail={session.user?.email ?? null} />
      {children}
    </>
  )
}

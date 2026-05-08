import Link from "next/link"
import BurgerMenu from "./BurgerMenu"

interface Props {
  userEmail: string | null
}

export default function TopBar({ userEmail }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4"
      style={{ backgroundColor: '#1A1814', borderBottom: '1px solid rgba(251,249,244,0.06)' }}
    >
      <Link
        href="/dashboard"
        className="text-lg font-semibold tracking-tight select-none"
        style={{ fontFamily: "var(--font-spectral), serif", color: '#FBF9F4' }}
      >
        ilovecards
      </Link>
      <BurgerMenu userEmail={userEmail} />
    </header>
  )
}

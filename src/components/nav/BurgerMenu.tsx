"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"

const NAV = [
  { href: "/dashboard", label: "Dashboard",  num: "01" },
  { href: "/review",    label: "Réviser",    num: "02" },
  { href: "/decks",     label: "Mes decks",  num: "03" },
  { href: "/import",    label: "Import IA",  num: "04" },
  { href: "/account",   label: "Mon compte", num: "05" },
]

interface Props {
  userEmail: string | null
}

export default function BurgerMenu({ userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      {/* Trigger — inline in TopBar, pas fixed */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: open ? '#FBF9F4' : 'transparent' }}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span className="flex flex-col gap-[5px] w-[18px]">
          <span className="block h-[1.5px] rounded-full origin-center transition-all duration-300"
            style={{
              backgroundColor: open ? '#1A1814' : '#FBF9F4',
              transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }} />
          <span className="block h-[1.5px] rounded-full transition-all duration-200"
            style={{
              backgroundColor: open ? '#1A1814' : '#FBF9F4',
              opacity: open ? 0 : 1,
            }} />
          <span className="block h-[1.5px] rounded-full origin-center transition-all duration-300"
            style={{
              backgroundColor: open ? '#1A1814' : '#FBF9F4',
              transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }} />
        </span>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(26,24,20,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-40 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          backgroundColor: '#1A1814',
          width: 'min(320px, 88vw)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="h-14 flex-shrink-0" />

        <nav className="flex-1 flex flex-col justify-center px-10 gap-1">
          {NAV.map((item, i) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + "/"))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-3"
                style={{
                  borderBottom: '1px solid rgba(251,249,244,0.07)',
                  opacity: open ? (isActive ? 1 : 0.5) : 0,
                  transform: open ? 'none' : 'translateY(12px)',
                  transition: `opacity 0.35s ${i * 55}ms, transform 0.35s ${i * 55}ms`,
                }}
              >
                <span
                  className="text-[10px] tracking-widest flex-shrink-0 w-5"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: '#6B6356' }}
                >
                  {item.num}
                </span>
                <span
                  className="text-[26px] font-semibold leading-none tracking-tight"
                  style={{
                    fontFamily: "var(--font-spectral), serif",
                    color: isActive ? '#FBF9F4' : '#C9B99A',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div
          className="flex-shrink-0 px-10 pb-10 flex items-center justify-between"
          style={{
            opacity: open ? 1 : 0,
            transition: `opacity 0.4s ${NAV.length * 55 + 100}ms`,
          }}
        >
          {userEmail && (
            <p className="text-[11px] truncate max-w-[180px]" style={{ color: '#6B6356' }}>
              {userEmail}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[11px] hover:opacity-80 transition-opacity ml-auto"
            style={{ color: '#6B6356' }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </>
  )
}

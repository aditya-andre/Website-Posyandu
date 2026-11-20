'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getInitials } from '@/lib/utils'

interface User {
  email?: string
  photoURL?: string
}

interface SidebarProps {
  user: User
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const NAV_ITEMS = [
  { href: '/kader', label: 'Dashboard', icon: '🏠' },
  { href: '/kader/grafik', label: 'Grafik Pertumbuhan', icon: '📊' },
  { href: '/kader/laporan', label: 'Laporan Bulanan', icon: '📋' },
]

export default function Sidebar({ user, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const collapsed = !sidebarOpen

  // Escape menutup sidebar
  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen, setSidebarOpen])

  // Di mobile: tutup setelah klik menu. Di desktop: biarkan apa adanya.
  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) setSidebarOpen(false)
  }

  const isActive = (href: string) =>
    href === '/kader' ? pathname === href : pathname.startsWith(href)

  const username = user.email?.split('@')[0] ?? 'Pengguna'

  // class untuk teks yang disembunyikan saat mini (hanya desktop)
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''

  return (
    <>
      {/* Backdrop (mobile saja) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        id="sidebar"
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white
          transition-all duration-300 ease-in-out
          lg:translate-x-0 ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header: logo + toggle */}
        <div
          className={`flex border-b border-gray-200 p-3 ${
            collapsed ? 'lg:flex-col lg:items-center lg:gap-2' : 'items-center justify-between'
          } items-center justify-between`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Logo: selalu terlihat, ini yang "tersisa" saat ditutup */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              PD
            </div>
            <div className={hideWhenCollapsed}>
              <h1 className="whitespace-nowrap text-base font-bold leading-tight text-gray-900">
                Posyandu Digital
              </h1>
              <p className="whitespace-nowrap text-xs text-gray-500">Kelurahan Sejahtera</p>
            </div>
          </div>

          {/* Tombol toggle: tutup/buka */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label={sidebarOpen ? 'Perkecil sidebar' : 'Perbesar sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={closeOnMobile}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  collapsed ? 'lg:justify-center lg:px-0' : ''
                } ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span aria-hidden="true" className="text-base">{icon}</span>
                <span className={`whitespace-nowrap ${hideWhenCollapsed}`}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profil */}
        <div className="border-t border-gray-200 p-3">
          <div className={`flex items-center ${collapsed ? 'lg:justify-center' : ''}`}>
            <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100`}
            title={user.email}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {getInitials(user.email || 'U')}
              </span>
            )}
          </div>
            <div className={`ml-3 min-w-0 ${hideWhenCollapsed}`}>
              <p className="truncate text-sm font-medium text-gray-700">{username}</p>
              <p className="text-xs text-gray-500">Kader</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
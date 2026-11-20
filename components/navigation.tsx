'use client'

import Link from 'next/link'

interface NavLink {
  href: string
  label: string
  icon?: string
}

interface NavigationProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Navigation({ sidebarOpen, setSidebarOpen }: NavigationProps) {
  const navLinks: NavLink[] = [
    { href: '/kader', label: 'Dashboard', icon: '📊' },
    { href: '/kader/grafik', label: 'Grafik Pertumbuhan', icon: '📈' },
    { href: '/kader/laporan', label: 'Laporan Bulanan', icon: '📋' },
  ]

  return (
    <nav className="flex-1 p-2 space-y-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 ${sidebarOpen ? '' : 'hidden'} flex-1`}
          onClick={() => setSidebarOpen(false)}
        >
          {link.icon && <span className="mr-2">{link.icon}</span>}
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
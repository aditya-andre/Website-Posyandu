'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'

interface Props {
  user: { email?: string }
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function KaderShell({ user, title, subtitle, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(window.matchMedia('(min-width: 1024px)').matches)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 rounded-md p-2 hover:bg-gray-100 lg:hidden"
            aria-label="Buka menu"
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import { useRealtimeRefresh } from '@/hooks/use-realtime-refresh'



interface Stats {
  totalBalita: number
  avgUmurBulan: number
  stunting: number
  normal: number
  underweight: number
}

interface Balita {
  id: string
  nama: string
  tglahir: string
}

interface Props {
  user: { email?: string; photoURL?: string }
  stats: Stats
  balita: Balita[] | null
}


// TODO: ambil dari database / props, jangan hardcode
const INFO_POSYANDU = [
  { label: 'Nama Posyandu', value: 'Posyandu Sejahtera' },
  { label: 'Kelurahan', value: 'Kelurahan Sejahtera' },
  { label: 'Kecamatan', value: 'Bendang Hidiri' },
]

function hitungUmurBulan(tglLahir?: string): number | null {
  if (!tglLahir) return null
  const tanggal = new Date(tglLahir)
  if (Number.isNaN(tanggal.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - tanggal.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
}

export default function DashboardContent({ user, stats, balita }: Props) {
  useRealtimeRefresh()
  // Mulai tertutup agar di mobile tidak langsung terbuka
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Di desktop, buka sidebar saat pertama dimuat
  useEffect(() => {
    setSidebarOpen(window.matchMedia('(min-width: 1024px)').matches)
  }, [])

  const username = user.email?.split('@')[0] ?? 'Pengguna'

  const statCards = [
    { label: 'Total Balita', value: stats.totalBalita, color: 'text-blue-600' },
    { label: 'Normal', value: `${stats.normal}%`, color: 'text-green-600' },
    { label: 'Stunting', value: `${stats.stunting}%`, color: 'text-orange-600' },
    { label: 'Underweight', value: `${stats.underweight}%`, color: 'text-yellow-600' },
    { label: 'Umur Rata-rata (bln)', value: stats.avgUmurBulan, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Konten bergeser: 64 saat terbuka, 16 (lebar mini sidebar) saat tertutup */}
      <div
        className={`transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
          {/* Hamburger hanya di mobile; di desktop toggle ada di sidebar */}
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
            <h1 className="text-xl font-bold text-gray-900">Dashboard Kader</h1>
            <p className="text-sm text-gray-500">Selamat datang, {username}!</p>
          </div>
        </header>

        <main className="p-4 pb-24 lg:p-6 lg:pb-28">
          {/* Statistik */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className={`rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm ${
                  i === statCards.length - 1 ? 'col-span-2 lg:col-span-1' : ''
                }`}
              >
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="mt-1 text-xs text-gray-500">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Info Posyandu */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Info Posyandu</h2>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              {INFO_POSYANDU.map((item) => (
                <div key={item.label}>
                  <p className="text-gray-500">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Balita */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Data Balita</h2>
            </div>

            {balita && balita.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Umur</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {balita.slice(0, 10).map((b) => {
                      const umur = hitungUmurBulan(b.tglahir)
                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.nama}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {umur === null ? '-' : `${umur} bulan`}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <Link href={`/kader/balita/${b.id}`} className="text-blue-600 hover:text-blue-800">
                              Detail
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">Belum ada data balita</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FAB tambah balita */}
      <Link
        href="/kader/balita/new"
        aria-label="Tambah balita"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}
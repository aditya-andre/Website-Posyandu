import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import KaderShell from '@/components/kader-shell'

export const instant = false

export default async function GrafikPage() {
  const supabase = createClient(await cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: balita } = await supabase.from('balita').select('id, jenis_kelamin')
  const { data: pengukuran } = await supabase.from('pengukuran').select('id')

  const boys = (balita ?? []).filter((b) => b.jenis_kelamin === 'L').length
  const girls = (balita ?? []).filter((b) => b.jenis_kelamin === 'P').length
  const totalPengukuran = pengukuran?.length ?? 0

  return (
    <KaderShell user={{ email: user.email }} title="Grafik Pertumbuhan Balita">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Statistik Balita</h2>
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-600">{boys}</p>
            <p className="text-xs text-gray-600">Laki-laki</p>
          </div>
          <div className="rounded-lg bg-pink-50 p-4">
            <p className="text-2xl font-bold text-pink-600">{girls}</p>
            <p className="text-xs text-gray-600">Perempuan</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-600">{totalPengukuran}</p>
            <p className="text-xs text-gray-600">Pengukuran</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Grafik Status Gizi</h3>
        {totalPengukuran > 0 ? (
          <div className="py-8 text-center">
            <div className="inline-flex h-64 w-64 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
              <span className="text-gray-400">Grafik akan ditampilkan di sini</span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Belum ada data pengukuran</p>
          </div>
        )}
      </div>
    </KaderShell>
  )
}
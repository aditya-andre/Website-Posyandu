import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatTanggal } from '@/lib/utils'
import KaderShell from '@/components/kader-shell'
import ExportButton from '@/components/export-button'

export const instant = false

interface PageProps {
  searchParams: Promise<{ bulan?: string; tahun?: string }>
}

interface Pengukuran {
  id: string
  tgl_ukur: string
  berat_kg: number
  tinggi_cm: number
  status_gizi: string | null
  balita_id: string
}

interface Balita {
  id: string
  nama: string
}

export default async function LaporanPage({ searchParams }: PageProps) {
  const { bulan, tahun } = await searchParams

  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Filter bulan/tahun
  const filterBulan = bulan || new Date().getMonth() + 1
  const filterTahun = tahun || new Date().getFullYear()

  const { data: pengukuran } = await supabase
    .from('pengukuran')
    .select('id, tgl_ukur, berat_kg, tinggi_cm, status_gizi, balita_id')
    .gte('tgl_ukur', `${filterTahun}-${filterBulan}-01`)
    .lt('tgl_ukur', `${filterTahun}-${filterBulan}-${new Date(Number(filterTahun), Number(filterBulan), 0).getDate() + 1}`)
    .order('tgl_ukur', { ascending: false })

  const pengukuranData = pengukuran ?? []

  // Ambil detail balita
  const balitaIds = [...new Set(pengukuranData.map((p) => p.balita_id))]
  const { data: balitaList } = await supabase
    .from('balita')
    .select('id, nama')
    .in('id', balitaIds)

  const balitaMap = new Map(
    (balitaList ?? []).map((b: Balita) => [b.id, b.nama])
  )

  const totalUkuran = pengukuranData.length

  // Status gizi
  const statusCount = pengukuranData.reduce(
    (acc, p) => {
      const s = (p.status_gizi ?? '').toLowerCase()
      if (s.includes('stunt')) acc.stunting++
      else if (s.includes('underweight') || s.includes('kurang')) acc.underweight++
      else if (s === 'normal') acc.normal++
      else acc.lain++
      return acc
    },
    { normal: 0, stunting: 0, underweight: 0, lain: 0 }
  )

  const persen = (n: number) => totalUkuran === 0 ? 0 : Math.round((n / totalUkuran) * 100)

  // CSV content
  const csvHeader = 'Nama Balita,Tanggal,Berat (kg),Tinggi (cm),Status Gizi\n'
  const csvRows = pengukuranData
    .map((p) => `${balitaMap.get(p.balita_id) ?? '-'},${formatTanggal(p.tgl_ukur)},${p.berat_kg},${p.tinggi_cm},"${p.status_gizi ?? '-'}"`)
    .join('\n')
  const csvContent = csvHeader + csvRows

  return (
    <KaderShell user={{ email: user.email }} title="Laporan Bulanan">
      <div className="space-y-6">
        {/* Filter bulan/tahun + export */}
        <div className="flex gap-4 items-center">
          <form className="flex gap-4 flex-1">
            <select name="bulan" defaultValue={filterBulan.toString()} className="rounded-lg border border-gray-300 px-3 py-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
                <option key={b} value={b}>{b} {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][b-1]}</option>
              ))}
            </select>
            <input 
              name="tahun" 
              type="number" 
              defaultValue={filterTahun} 
              className="w-24 rounded-lg border border-gray-300 px-3 py-2" 
            />
          </form>
          <ExportButton csvContent={csvContent} filename={`laporan-posyandu-${filterTahun}-${filterBulan}.csv`} />
        </div>

        {/* Ringkasan statistik */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalUkuran}</p>
            <p className="text-xs text-gray-500">Total Pengukuran</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{persen(statusCount.normal)}</p>
            <p className="text-xs text-gray-500">Normal (%)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{persen(statusCount.stunting)}</p>
            <p className="text-xs text-gray-500">Stunting (%)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{persen(statusCount.underweight)}</p>
            <p className="text-xs text-gray-500">Kurang (%) </p>
          </div>
        </div>

        {/* Ringkasan data */}
        {totalUkuran > 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Rekap Pengukuran {filterBulan}/{filterTahun}</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nama Balita</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tanggal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">BB</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">TB</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pengukuranData.slice(0, 20).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {balitaMap.get(p.balita_id) ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatTanggal(p.tgl_ukur)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{p.berat_kg} kg</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{p.tinggi_cm} cm</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {(p.status_gizi ?? '–').split(' ')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Belum ada data pengukuran untuk bulan ini</p>
          </div>
        )}
      </div>
    </KaderShell>
  )
}
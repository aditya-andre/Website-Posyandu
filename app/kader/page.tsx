import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard-content'

export const instant = false

type Kategori = 'normal' | 'stunting' | 'underweight' | 'lain'

// Sesuaikan dengan isi kolom status_gizi di databasemu
function kategori(status?: string | null): Kategori {
  const s = (status ?? '').toLowerCase()
  if (s.includes('stunt')) return 'stunting'
  if (s.includes('underweight') || s.includes('kurang')) return 'underweight'
  if (s === 'normal') return 'normal'
  return 'lain'
}

function hitungUmurBulan(tglLahir?: string | null): number | null {
  if (!tglLahir) return null
  const tanggal = new Date(tglLahir)
  if (Number.isNaN(tanggal.getTime())) return null
  return Math.max(
    0,
    Math.floor((Date.now() - tanggal.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  )
}

export default async function KaderPage() {
  const supabase = createClient(await cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: balitaData }, { data: pengukuranData }] = await Promise.all([
    supabase.from('balita').select('id, nama, tglahir').order('nama', { ascending: true }),
    supabase
      .from('pengukuran')
      .select('balita_id, tgl_ukur, status_gizi')
      .order('tgl_ukur', { ascending: false })
      .limit(10000),
  ])

  const balita = balitaData ?? []

  // Status terbaru per balita (data sudah urut dari yang terbaru)
  const statusTerbaru = new Map<string, string | null>()
  for (const p of pengukuranData ?? []) {
    if (!statusTerbaru.has(p.balita_id)) statusTerbaru.set(p.balita_id, p.status_gizi)
  }

  const hitung = { normal: 0, stunting: 0, underweight: 0 }
  for (const status of statusTerbaru.values()) {
    const k = kategori(status)
    if (k !== 'lain') hitung[k]++
  }

  // Persentase dibagi jumlah balita yang sudah pernah diukur
  const diukur = statusTerbaru.size
  const persen = (n: number) => (diukur === 0 ? 0 : Math.round((n / diukur) * 100))

  const umur = balita
    .map((b) => hitungUmurBulan(b.tglahir))
    .filter((u): u is number => u !== null)

  const stats = {
    totalBalita: balita.length,
    avgUmurBulan: umur.length ? Math.round(umur.reduce((a, b) => a + b, 0) / umur.length) : 0,
    normal: persen(hitung.normal),
    stunting: persen(hitung.stunting),
    underweight: persen(hitung.underweight),
  }

  return <DashboardContent user={{ email: user.email }} stats={stats} balita={balita} />
}
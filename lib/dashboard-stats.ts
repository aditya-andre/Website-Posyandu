import type { SupabaseClient } from '@supabase/supabase-js'
import { hitungUmurBulan } from '@/lib/utils'

export interface Stats {
  totalBalita: number
  avgUmurBulan: number
  stunting: number // persen
  normal: number // persen
  underweight: number // persen
}

type Kategori = 'normal' | 'stunting' | 'underweight' | 'lain'

function kategori(status?: string | null): Kategori {
  const s = (status ?? '').toLowerCase()
  if (s.includes('stunt')) return 'stunting'
  if (s.includes('underweight') || s.includes('kurang')) return 'underweight'
  if (s === 'normal') return 'normal'
  return 'lain'
}

export async function getDashboardStats(supabase: SupabaseClient) {
  const [{ data: balita }, { data: pengukuran }] = await Promise.all([
    supabase.from('balita').select('id, nama, tglahir').order('nama', { ascending: true }),
    supabase
      .from('pengukuran')
      .select('balita_id, tgl_ukur, status_gizi')
      .order('tgl_ukur', { ascending: false })
      .limit(10000),
  ])

  const daftar = balita ?? []

  // Status terbaru per balita (data sudah urut dari yang terbaru)
  const statusTerbaru = new Map<string, string | null>()
  for (const p of pengukuran ?? []) {
    if (!statusTerbaru.has(p.balita_id)) statusTerbaru.set(p.balita_id, p.status_gizi)
  }

  const hitung = { normal: 0, stunting: 0, underweight: 0 }
  for (const status of statusTerbaru.values()) {
    const k = kategori(status)
    if (k !== 'lain') hitung[k]++
  }
  const diukur = statusTerbaru.size
  const persen = (n: number) => (diukur === 0 ? 0 : Math.round((n / diukur) * 100))

  const umur = daftar
    .map((b) => hitungUmurBulan(b.tglahir))
    .filter((u): u is number => u !== null)
  const avgUmurBulan = umur.length
    ? Math.round(umur.reduce((a, b) => a + b, 0) / umur.length)
    : 0

  const stats: Stats = {
    totalBalita: daftar.length,
    avgUmurBulan,
    normal: persen(hitung.normal),
    stunting: persen(hitung.stunting),
    underweight: persen(hitung.underweight),
  }

  return { stats, balita: daftar }
}
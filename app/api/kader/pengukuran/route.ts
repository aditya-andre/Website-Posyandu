import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient(await cookies())

  const formData = await request.formData()
  const balita_id = formData.get('balita_id')?.toString()
  const tgl_ukur = formData.get('tgl_ukur')?.toString()
  const berat_kg = parseFloat(formData.get('berat_kg')?.toString() || '0')
  const tinggi_cm = parseFloat(formData.get('tinggi_cm')?.toString() || '0')

  if (!balita_id || !tgl_ukur || !berat_kg || !tinggi_cm) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  const { data: balita, error: balitaErr } = await supabase
    .from('balita')
    .select('*')
    .eq('id', balita_id)
    .single()

  if (balitaErr || !balita) {
    return NextResponse.json({ error: 'Balita tidak ditemukan' }, { status: 404 })
  }

  const tglLahir = new Date(balita.tglahir)
  const tglUkur = new Date(tgl_ukur)
  const umurBulan = Math.floor(
    (tglUkur.getTime() - tglLahir.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )

  const { calculateGrowthStatus } = await import('@/lib/growth')
  const growth = calculateGrowthStatus(
    balita.jenis_kelamin,
    umurBulan,
    tinggi_cm,
    berat_kg
  )

  const { data, error } = await supabase
    .from('pengukuran')
    .insert({
      balita_id,
      tgl_ukur,
      berat_kg,
      tinggi_cm,
      umur_bulan: umurBulan,
      zscore_tb_u: growth.z_hfa,
      status_gizi: growth.status_hfa,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.redirect(new URL(`/kader/balita/${balita_id}`, request.url), 303)
}
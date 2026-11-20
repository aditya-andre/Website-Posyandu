import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateGrowthStatus } from '@/lib/growth'

export async function createPengukuran(formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const balita_id = formData.get('balita_id')?.toString()
  const tgl_ukur = formData.get('tgl_ukur')?.toString()
  const berat_kg = parseFloat(formData.get('berat_kg')?.toString() || '0')
  const tinggi_cm = parseFloat(formData.get('tinggi_cm')?.toString() || '0')

  if (!balita_id || !tgl_ukur || !berat_kg || !tinggi_cm) {
    throw new Error('Semua field wajib diisi')
  }

  const { data: balita, error: balitaErr } = await supabase
    .from('balita')
    .select('*')
    .eq('id', balita_id)
    .single()

  if (balitaErr || !balita) throw new Error('Balita tidak ditemukan')

  const tglLahir = new Date(balita.tglahir)
  const tglUkur = new Date(tgl_ukur)
  const umurBulan = Math.floor(
    (tglUkur.getTime() - tglLahir.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )

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

  if (error) throw new Error(error.message)

  revalidatePath(`/kader/balita/${balita_id}`)
  revalidatePath(`/kader/balita/${balita_id}/pengukuran`)
  redirect(`/kader/balita/${balita_id}`)
}
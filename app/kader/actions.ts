import { cookies } from 'next/headers'
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateGrowthStatus } from '@/lib/growth'

export async function createBalita(formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const nama = formData.get('nama')?.toString().trim()
  const tgl_lahir = formData.get('tgl_lahir')?.toString()
  const jenis_kelamin = formData.get('jenis_kelamin')?.toString() as 'L' | 'P'

  if (!nama || !tgl_lahir || !jenis_kelamin) {
    return { error: 'Semua field wajib diisi' }
  }

  const { data, error } = await supabase
    .from('balita')
    .insert({
      nama,
      tgl_lahir,
      jenis_kelamin,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/kader')
  return { success: true, data }
}

export async function createPengukuran(formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const balita_id = formData.get('balita_id')?.toString()
  const tgl_ukur = formData.get('tgl_ukur')?.toString()
  const berat_kg = parseFloat(formData.get('berat_kg')?.toString() || '0')
  const tinggi_cm = parseFloat(formData.get('tinggi_cm')?.toString() || '0')

  if (!balita_id || !tgl_ukur || !berat_kg || !tinggi_cm) {
    return { error: 'Semua field wajib diisi' }
  }

  // Ambil data balita untuk hitung umur & status gizi
  const { data: balita, error: balitaErr } = await supabase
    .from('balita')
    .select('*')
    .eq('id', balita_id)
    .single()

  if (balitaErr || !balita) return { error: 'Balita tidak ditemukan' }

  const tglLahir = new Date(balita.tgl_lahir)
  const tglUkur = new Date(tgl_ukur)
  const umurBulan = Math.floor((tglUkur.getTime() - tglLahir.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

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

  if (error) return { error: error.message }

  revalidatePath('/kader')
  revalidatePath(`/kader/balita/${balita_id}`)
  return { success: true, data, growth }
}

export async function deletePengukuran(id: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('pengukuran')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/kader')
  return { success: true }
}
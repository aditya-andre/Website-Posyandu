import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient(await cookies())

  const formData = await request.formData()
  const nama = formData.get('nama')?.toString().trim()
  const tglahir = formData.get('tglahir')?.toString()
  const jenis_kelamin = formData.get('jenis_kelamin')?.toString() as 'L' | 'P'

  if (!nama || !tglahir || !jenis_kelamin) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('balita')
    .insert({
      nama,
      tglahir,
      jenis_kelamin,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.redirect(new URL(`/kader/balita/${data.id}`, request.url), 303)
}
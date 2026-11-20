import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function kembaliKeLogin(request: Request, pesan: string) {
  const url = new URL('/login', request.url)
  url.searchParams.set('error', pesan)
  return NextResponse.redirect(url, 303)
}

export async function POST(request: Request) {
  const supabase = createClient(await cookies())

  const formData = await request.formData()
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return kembaliKeLogin(request, 'Email dan kata sandi wajib diisi')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Pesan generik: jangan bocorkan apakah email terdaftar atau tidak
    return kembaliKeLogin(request, 'Email atau kata sandi salah')
  }

  return NextResponse.redirect(new URL('/kader', request.url), 303)
}
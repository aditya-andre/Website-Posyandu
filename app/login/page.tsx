import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const instant = false

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'

export default async function LoginPage({ searchParams }: PageProps) {
  const { error: pesanError } = await searchParams

  const supabase = createClient(await cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/kader')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Posyandu Digital</h1>
          <p className="text-sm text-gray-500">Selamat datang, silakan masuk</p>
        </div>

        <form action="/api/login" method="POST" className="space-y-4">
          {pesanError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {pesanError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="Masukkan kata sandi"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  )
}
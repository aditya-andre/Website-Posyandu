import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hariIniWIB } from '@/lib/utils'
import KaderShell from '@/components/kader-shell'

export const instant = false

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500'

// Batas tanggal lahir: maksimal 5 tahun ke belakang sampai hari ini
function batasMinTglLahir(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 5)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

export default async function NewBalitaPage({ searchParams }: PageProps) {
  const { error: pesanError } = await searchParams

  const supabase = createClient(await cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <KaderShell user={{ email: user.email }} title="Registrasi Balita Baru">
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form action="/api/kader/balita" method="POST" className="space-y-4">
          {pesanError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {pesanError}
            </p>
          )}

          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium text-gray-700">
              Nama Balita
            </label>
            <input
              id="nama"
              type="text"
              name="nama"
              required
              minLength={2}
              maxLength={50}
              pattern=".*\S.*"
              title="Nama tidak boleh hanya berisi spasi"
              autoComplete="off"
              className={inputClass}
              placeholder="Contoh: Budi"
            />
          </div>

          <div>
            <label htmlFor="jenis_kelamin" className="mb-1 block text-sm font-medium text-gray-700">
              Jenis Kelamin
            </label>
            <select id="jenis_kelamin" name="jenis_kelamin" required className={inputClass}>
              <option value="">Pilih...</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label htmlFor="tglahir" className="mb-1 block text-sm font-medium text-gray-700">
              Tanggal Lahir
            </label>
            <input
              id="tglahir"
              type="date"
              name="tglahir"
              required
              min={batasMinTglLahir()}
              max={hariIniWIB()}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Simpan
          </button>
        </form>
      </div>
    </KaderShell>
  )
}
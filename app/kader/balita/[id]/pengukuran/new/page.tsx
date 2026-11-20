import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const instant = false

export async function simpanPengukuran(formData: FormData) {
  'use server'
  const balitaId = String(formData.get('balita_id') ?? '')
  const tglUkur = String(formData.get('tgl_ukur') ?? '')
  const berat = Number(formData.get('berat_kg'))
  const tinggi = Number(formData.get('tinggi_cm'))

  const kembali = (pesan: string) =>
    redirect(`/kader/balita/${balitaId}/pengukuran/new?error=${encodeURIComponent(pesan)}`)

  if (!balitaId || !tglUkur) return kembali('Data tidak lengkap')
  if (!Number.isFinite(berat) || berat < 1 || berat > 30) return kembali('Berat badan harus 1–30 kg')
  if (!Number.isFinite(tinggi) || tinggi < 30 || tinggi < 0 || tinggi > 130) return kembali('Tinggi badan harus 30–130 cm')

  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('pengukuran').insert({
    balita_id: balitaId,
    tgl_ukur: tglUkur,
    berat_kg: berat,
    tinggi_cm: tinggi,
  })

  if (error) return kembali('Gagal menyimpan pengukuran')

  redirect(`/kader/balita/${balitaId}`)
  }

  export default function PengukuranPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Tambah Pengukuran</h1>
      <form action={simpanPengukuran} className="space-y-4">
        <input type="hidden" name="balita_id" value={params.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal Ukur</label>
          <input name="tgl_ukur" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Berat (kg)</label>
          <input name="berat_kg" type="number" step="0.01" min="1" max="30" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tinggi (cm)</label>
          <input name="tinggi_cm" type="number" step="0.01" min="30" max="130" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Simpan
        </button>
      </form>
    </div>
  )
}
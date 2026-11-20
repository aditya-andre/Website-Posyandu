import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hitungUmurBulan, formatTanggal } from '@/lib/utils'
import KaderShell from '@/components/kader-shell'
import StatusBadge from '@/components/status-badge'

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BalitaDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: balita, error: balitaErr } = await supabase
    .from('balita')
    .select('id, nama, tglahir, jenis_kelamin')
    .eq('id', id)
    .single()

  if (balitaErr || !balita) notFound()

  const { data: pengukuran } = await supabase
    .from('pengukuran')
    .select('id, tgl_ukur, umur_bulan, berat_kg, tinggi_cm, zscore_tb_u, status_gizi')
    .eq('balita_id', id)
    .order('tgl_ukur', { ascending: false }) // terbaru di atas

  const latest = pengukuran?.[0]
  const umurBulan = hitungUmurBulan(balita.tglahir)

  return (
    <KaderShell user={{ email: user.email }} title={balita.nama} subtitle="Detail Balita">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href="/kader" className="text-sm text-blue-600 hover:text-blue-800">
          ← Kembali
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            {balita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Lahir{' '}
            {formatTanggal(balita.tglahir)}
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Umur: {umurBulan === null ? '-' : `${umurBulan} bulan`}
          </p>

          {latest && (
            <div className="my-4 grid grid-cols-3 items-center gap-3 rounded-lg bg-gray-50 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{latest.berat_kg} kg</p>
                <p className="text-xs text-gray-500">Berat</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{latest.tinggi_cm} cm</p>
                <p className="text-xs text-gray-500">Tinggi</p>
              </div>
              <div className="text-center">
                <StatusBadge status={latest.status_gizi} />
              </div>
            </div>
          )}

          <Link
            href={`/kader/balita/${id}/pengukuran/new`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            + Catat Pengukuran Baru
          </Link>
        </div>

        {pengukuran && pengukuran.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Riwayat Pengukuran</h2>
            <div className="space-y-2">
              {pengukuran.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTanggal(p.tgl_ukur)} • Umur {p.umur_bulan ?? '-'} bln
                    </p>
                    <p className="text-xs text-gray-500">
                      BB: {p.berat_kg} kg • TB: {p.tinggi_cm} cm • Z-score TB/U:{' '}
                      {p.zscore_tb_u != null ? p.zscore_tb_u.toFixed(2) : '-'}
                    </p>
                  </div>
                  <StatusBadge status={p.status_gizi} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </KaderShell>
  )
}
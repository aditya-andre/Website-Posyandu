export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
export function hitungUmurBulan(tglLahir?: string | null): number | null {
  if (!tglLahir) return null
  const tanggal = new Date(tglLahir)
  if (Number.isNaN(tanggal.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - tanggal.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
}

// Tanggal hari ini dalam zona WIB, format YYYY-MM-DD
export function hariIniWIB(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}
export function formatTanggal(tgl?: string | null): string {
  if (!tgl) return '-'
  const d = new Date(tgl)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC', // untuk kolom bertipe date (YYYY-MM-DD)
  })
}
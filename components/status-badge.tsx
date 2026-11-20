export default function StatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return (
      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
        Belum dinilai
      </span>
    )
  }

  const s = status.toLowerCase()
  const color =
    s === 'normal'
      ? 'bg-green-100 text-green-700'
      : s.includes('stunt')
        ? 'bg-orange-100 text-orange-700'
        : 'bg-red-100 text-red-700'

  return <span className={`rounded px-2 py-1 text-xs font-medium ${color}`}>{status}</span>
}
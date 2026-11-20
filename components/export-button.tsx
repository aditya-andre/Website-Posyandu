'use client'

import { useState } from 'react'

interface ExportButtonProps {
  csvContent: string
  filename: string
}

export default function ExportButton({ csvContent, filename }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      📥 Export CSV
    </button>
  )
}
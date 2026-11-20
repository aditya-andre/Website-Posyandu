'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TABLES = ['balita', 'pengukuran']
const POLL_MS = 30_000

export function useRealtimeRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout> | undefined

    // Debounce: banyak perubahan beruntun cukup satu refresh
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), 500)
    }

    const channel = supabase.channel('dashboard-kader')
    TABLES.forEach((table) =>
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
    )
    channel.subscribe()

    // Cadangan kalau Realtime belum aktif di tabel
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, POLL_MS)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [router])
}
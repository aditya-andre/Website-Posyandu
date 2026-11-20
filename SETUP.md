# Posyandu Digital — Setup Guide

## Prasyarat
- Node.js 18+ & npm
- Akun Supabase (https://supabase.com)
- VS Code dengan ekstensi: Tailwind CSS, ESLint, Prettier

## 1. Setup Supabase

1. Buat project baru di Supabase → https://app.supabase.com
2. Copy **URL** & **anon key** di Settings → API
3. Buka file `.env.local` (buat jika belum ada)

## 2. Konfigurasi Environment

```bash
# .env.local
```

## 3. Buat Tabel

Buka SQL Editor di Supabase → paste schema:

```sql
-- Run file ini di SQL Editor
-- Atau pakai script di bawah
```

Lihat file: `supabase_schema.sql`

## 4. Install Dependencies

```bash
npm install @supabase/ssr @supabase/auth-helpers-nextjs
```

## 5. Setup Auth (Next.js Middleware)

Buat `middleware.ts` di root:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## 6. Jalankan Development

```bash
npm run dev
```

Buka: http://localhost:3000/kader

## 7. Test Fitur

1. `/kader` → lihat daftar balita
2. `/kader/balita/new` → tambah data balita
3. `/kader/balita/[id]` → detail + riwayat
4. `/kader/balita/[id]/pengukuran/new` → input pengukuran

## Struktur File

```
posyandu/
├── app/
│   ├── kader/           # Dashboard kader
│   │   ├── page.tsx
│   │   ├── actions.ts   # Server actions
│   │   └── balita/
│   │       ├── new/     # Tambah balita
│   │       └── [id]/    # Detail balita
├── lib/
│   ├── supabase.ts      # Client setup
│   ├── growth.ts        # WHO Z-score calculator
│   └── who-growth.ts    # WHO LMS data
├── supabase_schema.sql  # SQL schema
├── SETUP.md             # This file
└── .env.local           # Environment variables
```

## Catatan

- Auth belum tampil di UI (placeholder redirect ke /login)
- RLS (Row Level Security) aktifkan nanti
- Grafik pertumbuhan akan ditambahkan di detail balita
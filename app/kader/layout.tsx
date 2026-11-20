import '../../app/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posyandu Digital',
  description: 'Aplikasi pencatatan pertumbuhan balita',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
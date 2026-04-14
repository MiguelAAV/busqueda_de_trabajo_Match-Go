import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Match&Go - Encuentra trabajos temporales',
  description: 'Plataforma de matching entre empresas y trabajadores temporales en Chile',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'P75 Code Search | Dr. Tontz',
  description: 'Professional P75 code search tool for medical professionals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
          {children}
        </main>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // Make sure this import is present

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Our Restaurant Menu',
  description: 'Delicious food, served fresh!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
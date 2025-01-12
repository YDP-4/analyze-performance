import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Performance 4 U',
  description: 'Measure web performance by entering url',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased`}>{children}</body>
    </html>
  )
}

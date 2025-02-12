import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "sonner";

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
      <body className={`antialiased`}>
        {children}
        <Toaster position="top-right" toastOptions={{
          duration: 1500,
        }}/>
      </body>
    </html>
  )
}

import './globals.css'
import type { Metadata } from 'next'
import { ToastProvider } from '@/components/Toast'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Inno3 Buchungssystem',
  description: 'Moderne Raumbuchungsplattform',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <AuthProvider>
        <ToastProvider>
          <Header />
          <div className="h-[calc(100vh-3rem)] overflow-hidden">{children}</div>
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
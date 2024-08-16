
import '../globals.css'
import 'katex/dist/katex.min.css'
import { Inter as FontSans } from 'next/font/google'
import Layout from '@/components/dbchat/layout'
import Providers from '@/components/dbchat/providers'
import { cn } from '@/lib/utils'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function DbChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={cn('bg-background font-sans antialiased h-full', fontSans.variable)}>
      <Providers>
        <Layout>{children}</Layout>
      </Providers>
    </div>
  )
}

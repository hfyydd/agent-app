import { GeistSans } from "geist/font/sans";
import "./globals.css";
import NavBar from '@/components/NavBar';
import { Providers } from '@/components/Providers'
import DynamicBackground from "@/components/DynamicBackground";

export const metadata = {
  title: '考拉的交易市集',
  icons: {
    icon: '/favicon.ico',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <Providers>
          <DynamicBackground />
          <NavBar />
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
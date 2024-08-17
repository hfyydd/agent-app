import { GeistSans } from "geist/font/sans";
import "./globals.css";
import NavBar from '@/components/NavBar';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <NavBar />
        <main className="flex-grow">
            {children}
        </main>
      </body>
    </html>
  );
}
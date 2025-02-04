import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavBar from '@/components/navigation/NavBar';
import { ThemeProvider } from '@/components/theme-provider';
import { WalletProvider } from '@/context/WalletContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Astro World',
  description: 'Advanced tools for Kaspa ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <WalletProvider>
            <div className="min-h-screen bg-background">
              <NavBar />
              <main className="pl-20">
                <div className="max-w-8xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
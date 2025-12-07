// app/layout.tsx
import GlobalNav from '@/components/GlobalNav';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* GlobalNav will show on all pages EXCEPT login/register */}
        {children}
      </body>
    </html>
  );
}
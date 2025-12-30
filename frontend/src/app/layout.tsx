// src/app/layout.tsx
import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '600', '700'], variable: '--font-poppins' });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Remove ALL default spacing */}
      <body className={`${poppins.variable} font-sans antialiased m-0 p-0 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
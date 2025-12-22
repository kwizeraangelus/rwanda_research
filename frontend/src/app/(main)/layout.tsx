// src/app/(main)/layout.tsx
'use client';

import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { Menu, X, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthModal from '@/components/AuthModal';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '600', '700'], variable: '--font-poppins' });

const navLinks = [
  { name: 'home', href: '/' },
  { name: 'research', href: '/publications' },
  { name: 'innovation', href: '/innovation' },
  { name: 'about', href: '/about' },
  { name: 'events', href: '/events' },
  { name: 'contact', href: '/contact' },
] as const;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);
  const [authData, setAuthData] = useState<{ user: any; loading: boolean }>({ user: null, loading: true });

  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (user && token) setAuthData({ user: JSON.parse(user), loading: false });
    else setAuthData({ user: null, loading: false });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuthData({ user: null, loading: false });
    window.location.reload();
  };

  const isLoggedIn = !!authData.user;

  return (
    <div className={`${poppins.variable} font-sans text-white`}>
      <nav className={`fixed inset-x-0 top-0 z-50 flex justify-between items-center px-8 lg:px-[50px] py-6 transition-all ${scrolled ? 'bg-[#0c1e30ee] backdrop-blur-xl py-4 shadow-2xl' : 'bg-transparent'}`}>
        <Link href="/" className="text-[40px] font-bold uppercase italic tracking-[3px] hover:text-[#FFD700]">
          RIRI
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden lg:flex gap-10 items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className={`text-lg capitalize transition ${pathname === link.href ? 'text-[#FFD700] font-bold border-b-2 border-[#FFD700]' : 'hover:text-[#FFD700]'}`}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <div className="hidden md:flex gap-4">
              <button onClick={() => setModalType('login')} className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10">Login</button>
              <button onClick={() => setModalType('signup')} className="px-6 py-2 bg-[#FFD700] text-black font-bold rounded-full">Sign Up</button>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
              <LogOut size={20} /> Logout
            </button>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X size={34} /> : <Menu size={34} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0c1e30] pt-24 px-8 space-y-6 lg:hidden">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-2xl">
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <main className="pt-24">{children}</main>

      {modalType && (
        <AuthModal 
          type={modalType} 
          onClose={(switchTo) => setModalType(switchTo || null)} 
          onAuthSuccess={() => window.location.reload()} 
        />
      )}
    </div>
  );
}
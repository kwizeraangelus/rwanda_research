// app/layout.tsx
'use client';

import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { Menu, X, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthModal from '@/components/AuthModal';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '600', '700'], variable: '--font-poppins' });

const navLinks = [
  { name: 'home', href: '/' },
  { name: 'publications', href: '/publications' },
  { name: 'innovation', href: '/innovation' },
  { name: 'about', href: '/about' },
  { name: 'events', href: '/events' },
] as const;

interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;
  first_name: string;
  last_name: string;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);

  const [authData, setAuthData] = useState<{ user: UserData | null; loading: boolean }>({
    user: null,
    loading: true,
  });

  const pathname = usePathname();

  // Load user from localStorage once
  useEffect(() => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      if (user && token) {
        setAuthData({ user: JSON.parse(user), loading: false });
      } else {
        setAuthData({ user: null, loading: false });
      }
    } catch {
      setAuthData({ user: null, loading: false });
    }
  }, []);

  const handleAuthSuccess = () => {
    const user = localStorage.getItem('user');
    if (user) setAuthData({ user: JSON.parse(user), loading: false });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAuthData({ user: null, loading: false });
    setDropdownOpen(false);
    alert('Logged out successfully!');
  };

  const getUserInitial = (user: UserData | null) => {
    if (!user) return 'G';
    return user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase() || 'U';
  };

  const getInitialColor = (initial: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600',
    ];
    return `bg-gradient-to-br ${colors[initial.charCodeAt(0) % colors.length]}`;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (modalType) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [modalType]);

  const userInitial = getUserInitial(authData.user);
  const isLoggedIn = !!authData.user;
{if (authData.loading) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}  // ← This kills the Grammarly hydration warning forever
        className="bg-[#050A14] flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </body>
    </html>
  );
}}

  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-[#050A14] min-h-screen overflow-x-hidden`}>
        {/* NAVBAR - Shared everywhere */}
        <nav className={`fixed inset-x-0 top-0 z-50 flex justify-between items-center px-8 lg:px-[50px] py-6 lg:py-[25px] text-white transition-all ${scrolled ? 'bg-[#0c1e30ee] backdrop-blur-xl shadow-2xl py-4' : 'bg-transparent'}`}>
          <Link href="/" className="text-[40px] lg:text-[45px] font-bold uppercase italic tracking-[3px] hover:text-[#FFD700] transition">
            RIRI
          </Link>

          <ul className="hidden lg:flex gap-10 items-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`text-lg capitalize transition ${pathname === link.href ? 'text-[#FFD700] font-bold border-b-2 border-[#FFD700]' : 'hover:text-[#FFD700]'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            {/* Desktop Auth Buttons - Hidden when logged in */}
            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-4">
                <button onClick={() => setModalType('login')} className="px-6 py-3 border border-white/30 rounded-full hover:bg-white/10 transition">
                  Login
                </button>
                <button onClick={() => setModalType('signup')} className="px-7 py-3 bg-[#FFD700] text-black font-bold rounded-full hover:bg-yellow-400 hover:scale-105 transition shadow-xl">
                  Sign Up
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition ${isLoggedIn ? getInitialColor(userInitial) : 'bg-gradient-to-br from-gray-200 to-gray-400'}`}
              >
                {isLoggedIn ? <span className="text-white font-bold text-xl">{userInitial}</span> : <User size={26} className="text-black" />}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-[#0f2238]/97 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl">
                  <div className="px-6 py-5 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${getInitialColor(userInitial)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">{userInitial}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-xl font-bold text-[#FFD700]">{authData.user?.username || 'Guest'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-3">
                    {isLoggedIn ? (
                      <>
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-4 px-6 py-3 hover:bg-white/10">
                          <User size={22} /> My Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-4 px-6 py-3 text-red-400 hover:bg-red-400/10">
                          <LogOut size={22} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setModalType('login'); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-4 px-6 py-3 hover:bg-white/10">
                          <LogIn size={22} /> Sign In
                        </button>
                        <button onClick={() => { setModalType('signup'); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-4 px-6 py-3 hover:bg-white/10 text-[#FFD700]">
                          <UserPlus size={22} /> Create Account
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X size={34} /> : <Menu size={34} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-20 z-40 bg-[#0c1e30ee] backdrop-blur-xl md:hidden">
            <div className="py-8 px-10 space-y-6">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={pathname === link.href ? 'text-[#FFD700] font-bold block text-xl' : 'block text-xl hover:text-[#FFD700]'}>
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-6 border-t border-white/20 space-y-4">
                  <button onClick={() => { setModalType('login'); setMobileMenuOpen(false); }} className="w-full py-4 border rounded-xl">Login</button>
                  <button onClick={() => { setModalType('signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-[#FFD700] text-black font-bold rounded-xl">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main>{children}</main>

        {/* AUTH MODAL - Global */}
        {modalType && (
          <AuthModal
            type={modalType}
            onClose={(switchTo) => setModalType(switchTo || null)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </body>
    </html>
  );
}
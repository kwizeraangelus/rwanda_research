// src/app/(main)/layout.tsx
'use client';

import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { Menu, X, User, LogOut, UserPlus, LogIn } from 'lucide-react';
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

interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;
  first_name: string;
  last_name: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);

  const [authData, setAuthData] = useState<{ user: UserData | null; loading: boolean }>({
    user: null,
    loading: true,
  });

  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('access_token');
      if (storedUser && storedToken) {
        setAuthData({
          user: JSON.parse(storedUser),
          loading: false,
        });
      } else {
        setAuthData({ user: null, loading: false });
      }
    } catch {
      setAuthData({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Optional: remove refresh_token if you use it
    setAuthData({ user: null, loading: false });
    setDropdownOpen(false);
    window.location.reload(); // or redirect to '/' if preferred
  };

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuthData({
        user: JSON.parse(storedUser),
        loading: false,
      });
    }
    setModalType(null);
  };

  const getUserInitial = (user: UserData | null) => {
    if (!user) return 'G';
    return user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
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
    const colorClass = colors[initial.charCodeAt(0) % colors.length];
    return `bg-gradient-to-br ${colorClass}`;
  };

  const isLoggedIn = !!authData.user;
  const userInitial = getUserInitial(authData.user);

  return (
    <div className={`${poppins.variable} font-sans text-white`}>
      <nav
        className={`
          fixed inset-x-0 top-0 z-50 flex justify-between items-center 
          px-8 lg:px-[50px] py-6 transition-all duration-300
          ${scrolled ? 'bg-[#0c1e30ee] backdrop-blur-xl shadow-2xl py-4' : 'bg-transparent'}
        `}
      >
        <Link href="/" className="text-[40px] font-bold uppercase italic tracking-[3px] hover:text-[#FFD700]">
          RIRI
        </Link>

        {/* DESKTOP LINKS - same for everyone */}
        <ul className="hidden lg:flex gap-10 items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`text-lg capitalize transition ${
                  pathname === link.href ? 'text-[#FFD700] font-bold border-b-2 border-[#FFD700]' : 'hover:text-[#FFD700]'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT SIDE - THIS CHANGES AFTER LOGIN */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            // Before login: simple buttons
            <div className="hidden md:flex gap-4">
              <button
                onClick={() => setModalType('login')}
                className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition"
              >
                Login
              </button>
              <button
                onClick={() => setModalType('signup')}
                className="px-6 py-2 bg-[#FFD700] text-black font-bold rounded-full hover:bg-yellow-400 transition"
              >
                Sign Up
              </button>
            </div>
          ) : (
            // After login: colorful avatar + dropdown
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition ${getInitialColor(userInitial)}`}
              >
                <span className="text-white font-bold text-lg md:text-xl">{userInitial}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0f2238] backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInitialColor(userInitial)}`}>
                        <span className="text-white font-bold text-lg">{userInitial}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-base font-semibold text-[#FFD700]">
                          {authData.user?.username || authData.user?.email?.split('@')[0] || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition"
                    >
                      <User size={20} /> My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle - always visible on small screens */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X size={34} /> : <Menu size={34} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU - keep simple or enhance if needed */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0c1e30] pt-24 px-8 space-y-6 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl capitalize"
            >
              {link.name}
            </Link>
          ))}
          {!isLoggedIn ? (
            <div className="pt-8 border-t border-white/20 space-y-4">
              <button
                onClick={() => {
                  setModalType('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-4 border rounded-xl"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setModalType('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-[#FFD700] text-black font-bold rounded-xl"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="pt-8 border-t border-white/20 space-y-4">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-4 text-xl">
                My Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left py-4 text-xl text-red-400">
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      <main className="pt-0">{children}</main>

      {modalType && (
        <AuthModal
          type={modalType}
          onClose={(switchTo) => setModalType(switchTo || null)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
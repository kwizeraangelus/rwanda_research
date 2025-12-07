'use client';

import { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, User, LogOut, LogIn, UserPlus, Loader2 } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-poppins',
});

const navLinks = [
  { name: 'home', href: '/' },
  { name: 'publications', href: '/publications' },
  { name: 'innovation', href: '/innovation' },
  { name: 'about', href: '/about' },
  { name: 'events', href: '/events' },
] as const;

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Types
interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;


}

interface AuthResponse {
  access: string;
  refresh: string;
  user: UserData;
}

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;

}

// Helper function to get user initial
const getUserInitial = (user: UserData | null): string => {
  if (!user) return 'G'; // 'G' for Guest
  
  

  
  // Use username
  if (user.username && user.username.trim().length > 0) {
    return user.username.charAt(0).toUpperCase();
  }
  
  // Use email
  if (user.email && user.email.trim().length > 0) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U'; // 'U' for User (fallback)
};

// Reusable Auth Modal
type ModalType = 'login' | 'signup' | null;

const AuthModal = ({ 
  type, 
  onClose,
  onAuthSuccess 
}: { 
  type: ModalType; 
  onClose: (switchTo?: ModalType) => void;
  onAuthSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',

  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = type === 'login';

  if (!type) return null;

  // API Functions
  const loginUser = async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  };

  const signupUser = async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = 'Signup failed';
      if (errorData.username) errorMessage = `Username: ${errorData.username.join(', ')}`;
      if (errorData.email) errorMessage = `Email: ${errorData.email.join(', ')}`;
      if (errorData.password) errorMessage = `Password: ${errorData.password.join(', ')}`;
      throw new Error(errorMessage);
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      let response: AuthResponse;
      
      if (isLogin) {
        response = await loginUser({
          username: formData.username,
          password: formData.password,
        });
      } else {
        response = await signupUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,

        });
      }

      // Save tokens and user data to localStorage
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',

      });

      // Notify parent component
      onAuthSuccess();
      
      // Show success message
      alert(isLogin ? 'Welcome back!' : 'Account created successfully!');
      
      // Close modal
      onClose();

    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-20 overflow-y-auto"
      onClick={() => onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl m-6 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {isLogin ? (
              <>
                <LogIn className="text-blue-600" size={32} />
                Log In
              </>
            ) : (
              <>
                <UserPlus className="text-green-600" size={32} />
                Create Account
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close modal"
            disabled={loading}
          >
            <X size={28} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Signup Fields */}
          {!isLogin && (
            <>
             
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition"
                disabled={loading}
              />
            </>
          )}

          {/* Login Field */}
          {isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
          )}

          {/* Password Fields */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition"
            disabled={loading}
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition"
              disabled={loading}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
              isLogin
                ? 'bg-[#FFD700] hover:bg-yellow-400 text-black'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              <>{isLogin ? 'Log In →' : 'Create Account'}</>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 text-center text-gray-600">
          <p className="text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => onClose(isLogin ? 'signup' : 'login')}
              className="font-bold text-blue-600 hover:underline disabled:opacity-50"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [authData, setAuthData] = useState<{
    user: UserData | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('access_token');
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          setAuthData({
            user,
            loading: false,
          });
        } else {
          setAuthData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthData({ user: null, loading: false });
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthData({
        user,
        loading: false,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAuthData({ user: null, loading: false });
    setDropdownOpen(false);
    alert('Logged out successfully!');
  };

  const fetchProfile = async () => {
    if (!authData.user) return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setAuthData(prev => ({ ...prev, user: userData }));
      localStorage.setItem('user', JSON.stringify(userData));
      alert('Profile refreshed successfully!');
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleLogout();
    }
  };

  const isLoggedIn = !!authData.user;
  const userName = authData.user?.username || 'Guest';
  const userEmail = authData.user?.email || '';
  const userInitial = getUserInitial(authData.user);


  const getInitialColor = (initial: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-cyan-400 to-cyan-600',
    ];
    
    // Use the character code to pick a consistent color for each initial
    const charCode = initial.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalType ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  const openModal = (type: 'login' | 'signup') => {
    setModalType(type);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const closeModal = (switchTo?: ModalType) => {
    if (switchTo) {
      setModalType(switchTo);
    } else {
      setModalType(null);
    }
  };

  if (authData.loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${poppins.variable} font-sans bg-[#050A14] text-white min-h-screen overflow-x-hidden`}>
        {/* NAVBAR */}
        <nav
          className={`fixed inset-x-0 top-0 z-50 flex justify-between items-center px-8 lg:px-[50px] py-6 lg:py-[25px] transition-all duration-500 ${
            scrolled
              ? 'bg-[#0c1e30ee] backdrop-blur-xl shadow-2xl py-4 lg:py-[15px]'
              : 'bg-transparent'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="text-[40px] lg:text-[45px] font-bold uppercase italic tracking-[3px] hover:text-[#FFD700] transition">
            RIRI
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex gap-10 items-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-lg capitalize hover:text-[#FFD700] transition">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {/* Desktop Auth Buttons */}
            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => openModal('login')}
                  className="px-6 py-3 border border-white/30 rounded-full hover:bg-white/10 transition font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal('signup')}
                  className="px-7 py-3 bg-[#FFD700] text-black font-bold rounded-full hover:bg-yellow-400 hover:scale-105 transition shadow-xl"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`
                  w-11 h-11 lg:w-12 lg:h-12 
                  ${isLoggedIn ? getInitialColor(userInitial) : 'bg-gradient-to-br from-gray-200 to-gray-400'}
                  rounded-full flex items-center justify-center 
                  shadow-xl hover:scale-110 transition ring-4 ring-white/10
                `}
                aria-label="Account menu"
              >
                {isLoggedIn ? (
                  <span className="text-white font-bold text-xl">
                    {userInitial}
                  </span>
                ) : (
                  <User size={26} className="text-black" />
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-[#0f2238]/97 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="px-6 py-5 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${getInitialColor(userInitial)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">
                          {userInitial}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-xl font-bold text-[#FFD700] truncate">{userName}</p>
                        {isLoggedIn && userEmail && (
                          <p className="text-sm text-gray-400 mt-1 truncate">{userEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition"
                        >
                          <User size={22} />
                          My Profile
                        </Link>
                        <button
                          onClick={fetchProfile}
                          className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition text-left"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-4 px-6 py-3 text-red-400 hover:bg-red-400/10 transition text-left"
                        >
                          <LogOut size={22} />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openModal('login')}
                          className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition text-left"
                        >
                          <LogIn size={22} />
                          Sign In
                        </button>
                        <button
                          onClick={() => openModal('signup')}
                          className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition text-left font-medium text-[#FFD700]"
                        >
                          <UserPlus size={22} />
                          Create Account
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X size={34} /> : <Menu size={34} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-20 z-40 bg-[#0c1e30ee] backdrop-blur-xl border-b border-white/10 md:hidden">
            <div className="py-8 px-10 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xl capitalize hover:text-[#FFD700] transition"
                >
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-6 border-t border-white/20 space-y-4">
                  <button onClick={() => openModal('login')} className="w-full py-4 border border-white/30 rounded-xl hover:bg-white/10 transition">
                    Login
                  </button>
                  <button onClick={() => openModal('signup')} className="w-full py-4 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-yellow-400 transition">
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <header
          className="h-screen bg-cover bg-center flex items-center justify-center text-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.6)), url('/home.jpg')`,
          }}
        >
          <div className="px-8 max-w-6xl mx-auto">
            <h1 className="text-[45px] lg:text-[70px] leading-tight mb-10 font-bold">
              Discover a New Era of Books,<br />
              <span className="text-[#FFD700]">Creativity, and Innovation</span>
            </h1>
            <input
              type="text"
              placeholder="Search books, authors, creativity..."
              className="w-full max-w-3xl mx-auto px-12 py-6 rounded-full bg-white/95 backdrop-blur-md text-black placeholder-gray-600 text-lg shadow-2xl border border-white/20 focus:outline-none focus:shadow-yellow-400/60 transition-all"
            />
          </div>
        </header>

        {/* PUBLISHED BOOKS SECTION */}
        <section className="py-[100px] px-[50px] text-center">
          <h2 className="text-[36px] mb-12 capitalize">Published Books</h2>
          <div className="flex justify-center gap-10 flex-wrap">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-80 bg-[#0b1a30] rounded-2xl p-8 text-center hover:-translate-y-4 hover:shadow-2xl transition-all duration-500">
                <div className="bg-white/10 h-64 rounded-xl flex items-center justify-center mb-6">
                  <Image 
                    src="/old.jpg" 
                    width={120} 
                    height={120} 
                    alt="book" 
                    className="rounded object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">The Runner</h3>
                <p><strong>Author:</strong> Keza Angelus</p>
                <p><strong>Supervisor:</strong> Mugabo Uluje</p>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTS SECTION */}
        <section className="py-[100px] px-[50px] bg-[#0a1524]">
          <h2 className="text-[36px] mb-12 text-center capitalize">Upcoming Events</h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            {[
              { title: 'Book Launch', date: 'Dec 15, 2024', location: 'Kigali Convention Center' },
              { title: 'Authors Meet', date: 'Jan 20, 2025', location: 'University Auditorium' },
              { title: 'Creative Writing Workshop', date: 'Feb 5, 2025', location: 'Innovation Lab' },
            ].map((event, i) => (
              <div key={i} className="bg-[#0f2238] p-8 rounded-2xl hover:scale-105 transition duration-500">
                <h3 className="text-2xl font-bold mb-3 text-[#FFD700]">{event.title}</h3>
                <p className="mb-2"><strong>Date:</strong> {event.date}</p>
                <p><strong>Venue:</strong> {event.location}</p>
                <button className="mt-6 px-6 py-3 bg-[#FFD700] text-black font-bold rounded-full hover:bg-yellow-400 transition">
                  Register Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* TOMORROW'S READING SECTION */}
        <section className="py-[100px] px-[50px] text-center">
          <h2 className="text-[36px] mb-12 capitalize">Tomorrow's Reading</h2>
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#1a2a40] to-[#0f2238] rounded-2xl p-10">
            <p className="text-xl leading-relaxed mb-8">
              "The future of literature lies in the intersection of technology and creativity. 
              At RIRI, we're pioneering new ways to experience stories, connect authors with readers, 
              and foster innovation in the literary world."
            </p>
            <p className="text-lg text-[#FFD700]">— Keza Angelus, Founder</p>
          </div>
        </section>

        {/* VIDEO SECTION */}
        <section className="py-[100px] px-[50px]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[36px] mb-12 text-center capitalize">Featured Video</h2>
            <div className="relative aspect-video bg-[#0b1a30] rounded-2xl overflow-hidden">
              {/* Video placeholder - replace with actual video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition">
                    <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[24px] border-l-black border-b-[16px] border-b-transparent ml-2"></div>
                  </div>
                  <p className="text-xl">Play Introduction Video</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-24 px-12 border-t border-[#1a2a40] text-center">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
              <p className="text-lg">hello@riri.com</p>
              <p className="mt-2 text-gray-400">Kigali, Rwanda</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-6">Follow Us</h3>
              <div className="flex justify-center gap-8 text-2xl">
                {['Facebook', 'WhatsApp', 'Instagram', 'TikTok'].map((social) => (
                  <span 
                    key={social} 
                    className="cursor-pointer hover:text-[#FFD700] transition"
                    onClick={() => alert(`Redirecting to ${social}`)}
                  >
                    {social}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-400">
              © {new Date().getFullYear()} RIRI. All rights reserved. | 
              {isLoggedIn ? ` Welcome back, ${userName}!` : ' Discover your next read.'}
            </p>
          </div>
        </footer>
      </div>

      {/* AUTH MODAL */}
      {modalType && (
        <AuthModal 
          type={modalType} 
          onClose={closeModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}
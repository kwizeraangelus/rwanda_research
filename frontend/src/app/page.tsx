// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// Import the AuthModal from a separate component
import AuthModal from '@/components/AuthModal';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Types (keep the same)
interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;
  first_name: string;
  last_name: string;

}

interface AuthResponse {
  access: string;
  refresh: string;
  user: UserData;
}

export default function HomePage() {
  const [authData, setAuthData] = useState<{
    user: UserData | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });

  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);

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

  const closeModal = (switchTo?: 'login' | 'signup') => {
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
      {/* HERO SECTION */}
      <header
        className="h-screen bg-cover bg-center flex items-center justify-center text-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.6)), url('/home.jpg')`,
        }}
      >
        <div className="px-8 max-w-6xl mx-auto">
          <h1 className="text-[45px] lg:text-[70px] leading-tight mb-10 font-bold text-white">
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
            {authData.user ? ` Welcome back, ${authData.user.username}!` : ' Discover your next read.'}
          </p>
        </div>
      </footer>

      {/* AUTH MODAL - If you want to keep it on home page */}
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
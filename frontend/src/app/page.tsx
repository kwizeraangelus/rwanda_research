// app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// Import the AuthModal from a separate component
import AuthModal from '@/components/AuthModal';

// --- Constants & Types ---
interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;
  first_name: string;
  last_name: string;
}

// Data for repeatable sections
const DUMMY_BOOKS = [
  { title: 'The Runner', author: 'Keza Angelus', supervisor: 'Mugabo Uluje' },
  { title: 'Silent Codes', author: 'Jane Doe', supervisor: 'John Smith' },
  { title: 'Deep Learning', author: 'Alex King', supervisor: 'Maria Bell' },
];

const EVENTS_DATA = [
  { title: 'Book Launch', date: 'Dec 15, 2024', location: 'Kigali Convention Center' },
  { title: 'Authors Meet', date: 'Jan 20, 2025', location: 'University Auditorium' },
  { title: 'Creative Writing Workshop', date: 'Feb 5, 2025', location: 'Innovation Lab' },
];

const SOCIAL_LINKS = ['Facebook', 'WhatsApp', 'Instagram', 'TikTok'];

// --- CUSTOM STYLES (UPDATED ACCENT COLOR TO A SOFTER BLUE: text-blue-400) ---
const SMOKE_WHITE_BG = 'bg-gray-50';
const SKY_BLUE_CARD_BG = 'bg-blue-100';
// NEW SOFTER ACCENT COLOR: text-blue-400
const SOFT_ACCENT_COLOR_TEXT = 'text-blue-400';
const DARK_ACCENT_HOVER = 'hover:bg-blue-200';

// --- IMAGE FILE NAME ---
const FEATURED_IMAGE_SRC = '/thesis.jpg';

// --- DESCRIPTIVE TEXT FOR BELOW CARDS ---
const SECTION_DESCRIPTION = {
    short: "We believe in the power of every story.",
    medium: "Our curated collection represents the forefront of modern literary and academic thought.",
    long: "From compelling fiction to groundbreaking research, discover a world where creativity and knowledge intersect, driving innovation one page at a time."
};

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
  const initializeAuth = useCallback(() => {
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
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

  // --- 1. Loading State ---
  if (authData.loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#FFD700] animate-spin mx-auto mb-4" /> 
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // --- 2. Main Page Rendering ---
  return (
    <>
      {/* 1. HERO SECTION */}
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

      <main className="text-gray-900">
        {/* 2. PUBLISHED BOOKS SECTION (CARDS & NEW TEXT AREA) */}
        <section className={`py-[100px] px-[50px] text-center ${SMOKE_WHITE_BG}`}>
          <h2 className="text-4xl mb-12 font-extrabold leading-tight">
            Explore the <span className={SOFT_ACCENT_COLOR_TEXT}>Latest Published Books</span> and Literary Works
          </h2>
          {/* Card Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
            {DUMMY_BOOKS.map((book, i) => (
              <div 
                key={i} 
                className={`w-full ${SKY_BLUE_CARD_BG} rounded-2xl p-8 text-center hover:-translate-y-4 hover:shadow-xl transition-all duration-500`}
              >
                <div className="bg-white/90 h-64 rounded-xl flex items-center justify-center mb-6">
                  <Image 
                    src="/old.jpg" 
                    width={120} 
                    height={120} 
                    alt={book.title} 
                    className="rounded object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Supervisor:</strong> {book.supervisor}</p>
              </div>
            ))}
          </div>

          {/* Free Space Below Cards for Description */}
          <div className="max-w-4xl mx-auto pt-8 border-t border-gray-300">
            {/* Short Sentence: Large, Bold, Soft Accent Color */}
            <p className={`text-2xl font-extrabold mb-4 ${SOFT_ACCENT_COLOR_TEXT}`}>
                {SECTION_DESCRIPTION.short}
            </p>
            {/* Medium Sentence: Increased size to text-2xl */}
            <p className="text-2xl font-medium text-gray-700 mb-3">
                {SECTION_DESCRIPTION.medium}
            </p>
            {/* Long Sentence: Increased size to text-lg */}
            <p className="text-lg text-gray-600">
                {SECTION_DESCRIPTION.long}
            </p>
          </div>
        </section>

        {/* 3. FEATURED MEDIA SECTION (UPDATED TEXT) */}
        <section className={`py-[100px] px-[50px] ${SMOKE_WHITE_BG}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl mb-12 text-center font-extrabold leading-tight">
              A Glimpse into Our <span className={SOFT_ACCENT_COLOR_TEXT}>Creative Community</span>
            </h2>
            <div className={`relative aspect-video ${SKY_BLUE_CARD_BG} rounded-2xl overflow-hidden shadow-lg border-4 border-blue-200`}>
              <Image
                src={FEATURED_IMAGE_SRC}
                alt="Featured RIRI Promotional Image"
                layout="fill"
                objectFit="cover"
                quality={90}
                className="hover:scale-[1.02] transition duration-500"
              />
              <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center pointer-events-none p-8">
                {/* REPLACED: "View Our Featured Content" with two medium-sized white sentences */}
                <p className="text-white text-xl font-bold p-1 text-center">
                    Dive into our latest multimedia features.
                </p>
                <p className="text-white text-xl font-medium p-1 text-center">
                    Where stories transcend the written word.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TOMORROW'S READING SECTION (Quote) */}
        <section className={`py-[100px] px-[50px] text-center ${SMOKE_WHITE_BG}`}>
          <h2 className="text-4xl mb-12 font-extrabold leading-tight">
            What <span className={SOFT_ACCENT_COLOR_TEXT}>Tomorrow's Reading</span> Will Bring
          </h2>
          <div className={`max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-blue-200 rounded-2xl p-10 shadow-lg border border-blue-300`}>
            <p className="text-xl leading-relaxed mb-8 text-gray-700">
              "The future of literature lies in the intersection of technology and creativity. 
              At RIRI, we're pioneering new ways to experience stories, connect authors with readers, 
              and foster innovation in the literary world."
            </p>
            <p className={`text-lg ${SOFT_ACCENT_COLOR_TEXT}`}>— Keza Angelus, Founder</p>
          </div>
        </section>

        {/* 5. EVENTS SECTION (Uses grid for alignment) */}
        <section className={`py-[100px] px-[50px] ${SMOKE_WHITE_BG}`}>
          <h2 className="text-4xl mb-12 text-center font-extrabold leading-tight">
            Join Our <span className={SOFT_ACCENT_COLOR_TEXT}>Upcoming Events</span> and Workshops
          </h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            {EVENTS_DATA.map((event, i) => (
              <div key={i} className={`${SKY_BLUE_CARD_BG} p-8 rounded-2xl ${DARK_ACCENT_HOVER} hover:scale-105 transition duration-500 shadow-md`}>
                <h3 className={`text-2xl font-bold mb-3 ${SOFT_ACCENT_COLOR_TEXT}`}>{event.title}</h3>
                <p className="mb-2 text-gray-700"><strong>Date:</strong> {event.date}</p>
                <p className="text-gray-700"><strong>Venue:</strong> {event.location}</p>
                <button className="mt-6 px-6 py-3 bg-[#FFD700] text-black font-bold rounded-full hover:bg-yellow-400 transition shadow-md">
                  Register Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 6. FOOTER (Dark background, reduced size, white text) */}
      <footer className={`py-12 px-12 border-t border-gray-200 text-center bg-gray-900 text-white`}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">Contact Us</h3>
            <p className="text-lg text-gray-300">hello@riri.com</p>
            <p className="mt-2 text-gray-500">Kigali, Rwanda</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">Follow Us</h3>
            <div className="flex justify-center gap-8 text-2xl">
              {SOCIAL_LINKS.map((social) => (
                <span 
                  key={social} 
                  className={`cursor-pointer text-[#FFD700] hover:text-yellow-400 transition`}
                  onClick={() => alert(`Redirecting to ${social}`)}
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RIRI. All rights reserved. | 
            {authData.user ? ` Welcome back, ${authData.user.username}!` : ' Discover your next read.'}
          </p>
        </div>
      </footer>

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
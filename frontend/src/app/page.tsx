// app/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from "next/link";

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`${poppins.className} bg-[#050A14] text-white overflow-x-hidden`}>
      {/* NAVBAR */}
      <nav className={`fixed inset-x-0 top-0 z-50 flex justify-between items-center px-[50px] py-[25px] transition-all duration-[400ms] ${scrolled ? 'bg-[#0c1e30ee] py-[15px] shadow-2xl' : 'bg-transparent'} animate-fadeDown`}>
        <div className="text-[45px] font-bold uppercase italic tracking-[2px]">RIRI</div>
        <ul className="flex gap-[30px]">
  {['home', 'publications', 'Innovation', 'About', 'events'].map((item) => (
    <li key={item}>
      <Link 
        href={`/${item.toLowerCase()}`} 
        className="text-base hover:text-[#FFD700] transition"
      >
        {item}
      </Link>
    </li>
  ))}
</ul>
        <div className="w-[45px] h-[45px] bg-[#D9D9D9] rounded-full" />
      </nav>

      {/* HERO – EXACTLY LIKE ORIGINAL */}
      <header
        className="h-screen bg-cover bg-center flex items-center justify-center text-center animate-heroFadeIn"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.6)), url('/home.jpg')` }}
      >
        <div className="hero-content">
          {/* Title – slides up */}
          <h1 className="text-[50px] leading-[1.2] mb-[25px] animate-slideUp">
            Discover a New Era of Books,<br />
            <span className="text-[#FFD700]">Creativity, and Innovation,</span>
          </h1>

          {/* Search bar – appears with delay, exact size & style */}
          <div className="animate-searchFade">
           <input
  type="text"
  placeholder="Search books, creativity..."
  className="w-80 max-w-full px-8 py-4 rounded-full bg-white/90 backdrop-blur-sm text-black placeholder-gray-600 outline-none text-lg shadow-2xl border border-white/20 focus:bg-white focus:shadow-yellow-400/50 transition-all"
/>
          </div>
        </div>
      </header>

      {/* PUBLISHED BOOKS */}
      <section className="py-[80px] px-[50px] text-center">
        <h2 className="text-[33px] mb-10 capitalize">published books</h2>
        <div className="flex justify-center gap-[30px] flex-wrap">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="w-[250px] bg-[#0b1a30] rounded-lg p-[15px] text-center hover:-translate-y-2 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-[350ms] animate-floatUp" style={{ animationDelay: `${i * 0.25}s` }}>
              <div className="bg-white/10 h-[150px] rounded flex items-center justify-center mb-[15px]">
                <Image src="/old.jpg" width={80} height={80} alt="book" />
              </div>
              <h3>the runner</h3>
              <p><strong>author:</strong> keza angelus</p>
              <p><strong>supervisor:</strong> mugabo uluje</p>
              <p className="mt-3 text-[10px] opacity-60">exerpt|writer|review|draft</p>
            </div>
          ))}
        </div>
      </section>

      {/* REST OF SECTIONS – unchanged & perfect */}
      <section className="py-[80px] px-[50px] text-center">
        <h1 className="text-[50px] leading-[1.3] animate-heroFadeIn">Tomorrow's<br />Reading Experience</h1>
      </section>

      <section className="py-[80px] px-[50px] text-center">
        <h1 className="text-[40px] mb-10">Events</h1>
        <div className="flex justify-center gap-10 flex-wrap">
          {[
            { img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=400&auto=format&fit=crop", date: "11/22/2025" },
            { img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop", date: "07/23/2025" },
          ].map((e, i) => (
            <div key={i} className="w-[300px] bg-[#0b1a30] rounded-lg overflow-hidden hover:-translate-y-[10px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition-all duration-[350ms] animate-floatUp" style={{ animationDelay: `${0.6 + i * 0.3}s` }}>
              <img src={e.img} alt="" className="w-full h-[180px] object-cover" />
              <div className="p-[20px]">
                <p><strong>Date:</strong> {e.date}</p>
                <p><strong>Link:</strong> google.com</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-[80px] px-[50px] text-center">
        <h2 className="text-[33px] capitalize">universities dissertation and theses</h2>
      </section>

      <section className="h-[60vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')` }}>
        <h2 className="text-[40px] lowercase animate-heroFadeIn">video section</h2>
      </section>

      <footer className="py-[80px] px-[50px] border-t border-[#1a2a40] flex justify-center gap-[100px] flex-wrap text-center md:text-left">
        <div>
          <h3 className="text-2xl font-bold mb-4">contact us</h3>
          <p>contact us</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4">contact</h3>
          <ul className="space-y-3 text-[#ccc]">
            {['facebook', 'whatsapp', 'instagram', 'tiktok'].map((s) => (
              <li key={s} className="cursor-pointer hover:text-white hover:pl-[5px] transition">{s}</li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
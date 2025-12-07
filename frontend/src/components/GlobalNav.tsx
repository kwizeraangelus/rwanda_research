'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Home, BookOpen, Lightbulb, User, Calendar, LogOut, ChevronRight } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Publications', href: '/publications', icon: BookOpen },
  { name: 'Innovation', href: '/innovation', icon: Lightbulb },
  { name: 'About', href: '/about', icon: User },
  { name: 'Events', href: '/events', icon: Calendar },
];

export default function GlobalNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {/* TOP NAVBAR - Always visible */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#0c1e30ee] backdrop-blur-md border-b border-white/10 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo + Hamburger */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:text-[#FFD700] transition lg:hidden"
            >
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <Link href="/" className="text-[32px] font-bold uppercase italic tracking-[2px]">
              RIRI
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex gap-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-lg hover:text-[#FFD700] transition flex items-center gap-2"
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-11 h-11 bg-gradient-to-br from-[#FFD700] to-yellow-600 rounded-full flex items-center justify-center text-black font-bold shadow-lg hover:scale-110 transition"
            >
              U
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-[#0f2238] border border-white/20 rounded-lg shadow-2xl overflow-hidden">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={18} />
                  My Profile
                </Link>
                <hr className="border-white/10" />
                <button
                  onClick={() => {
                    // Add your logout logic here (e.g. signOut())
                    alert('Logged out!');
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-400/10 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* COURSES-STYLE LEFT SIDEBAR - Collapsible */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0a1828] border-r border-white/10 z-40 transform transition-transform duration-300 pt-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-[#FFD700] flex items-center gap-3">
            <ChevronRight size={20} className="text-gray-400" />
            Menu
          </h2>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700] transition group"
                >
                  <Icon size={22} className="group-hover:scale-110 transition" />
                  <span className="text-lg">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/profile"
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={22} />
              <span>My Profile</span>
            </Link>
            <button
              onClick={() => {
                setSidebarOpen(false);
                alert('Logged out!');
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition mt-2"
            >
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Push content when sidebar is open (optional) */}
      <div className="lg:pl-72 min-h-screen">
        {/* Your page content goes here */}
      </div>
    </>
  );
}
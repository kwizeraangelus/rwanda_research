'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // PUBLIC FETCH — NO CREDENTIALS
        const res = await fetch('http://localhost:8000/api/events/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // NO credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // Always return array
        const eventList = Array.isArray(data)
          ? data
          : Array.isArray(data.events)
            ? data.events
            : [];

        setEvents(eventList);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#d8e5c7] flex flex-col">
      {/* NAVIGATION */}
      <nav className="bg-[#4a772e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <div className="w-8 h-8 bg-[#4a772e] rounded-full"></div>
              </div>
              <span className="text-xl font-bold">Rwanda Research Hub</span>
            </Link>

            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-[#f7f7e8] transition">Home</Link>
              <Link href="/events" className="text-[#f7f7e8]">Events</Link>
              <Link href="/books" className="hover:text-[#f7f7e8] transition">Books</Link>
              <Link href="/about" className="hover:text-[#f7f7e8] transition">About</Link>
            </div>

            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#4a772e] to-[#8c9c6f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Join researchers, universities, and innovators at Rwanda's leading academic events.
          </p>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4a772e] border-t-transparent"></div>
              <p className="mt-4 text-[#4a772e] font-medium">Loading events...</p>
            </div>
          ) : !Array.isArray(events) || events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl text-gray-600">No upcoming events</p>
              <p className="text-sm text-gray-500 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => event.link && window.open(event.link, '_blank')}
                >
                  {/* PLACEHOLDER IMAGE */}
                  <div className="h-48 bg-gradient-to-br from-[#4a772e] to-[#8c9c6f] flex items-center justify-center">
                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#4a772e] mb-2">{event.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(event.date), 'PPP p')}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>

                    {event.link && (
                      <p className="mt-4 text-xs text-blue-600 underline flex items-center gap-1">
                        Click to register
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#4a772e] text-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-2 rounded-full">
                <div className="w-8 h-8 bg-[#4a772e] rounded-full"></div>
              </div>
              <span className="text-xl font-bold">Rwanda Research Hub</span>
            </div>
            <p className="text-sm text-[#d8e5c7]">
              Advancing research and innovation in Rwanda since 2025.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#d8e5c7]">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/events" className="hover:text-white transition">Events</Link></li>
              <li><Link href="/books" className="hover:text-white transition">Publications</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Contact</h4>
            <p className="text-sm text-[#d8e5c7]">
              Kigali, Rwanda<br />
              info@research.rw<br />
              +250 788 000 000
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#8c9c6f] text-center text-xs text-[#d8e5c7]">
          © 2025 Rwanda Research Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
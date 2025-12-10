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
        const res = await fetch('http://localhost:8000/api/events/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

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
    <div className="min-h-screen bg-[#E0F2FE] text-gray-900">
      {/* DARK NAVY BAND — same color as before, but no navigation */}
      <div className="h-32 bg-[#050A14]" aria-hidden="true" />

      {/* HERO — overlaps the dark band beautifully */}
      <section className="relative -mt-32 pt-40 pb-24 bg-gradient-to-b from-[#050A14] via-blue-950 to-[#0a1f3d] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Upcoming <span className="text-[#FFD700]">Events</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300 leading-relaxed">
            Join researchers, innovators, and academic leaders at Rwanda's premier research and innovation events.
          </p>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="py-16 px-6 -mt-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-[#FFD700] border-t-transparent mx-auto" />
              <p className="mt-6 text-2xl text-[#050A14] font-medium">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-32 bg-white/95 rounded-3xl shadow-2xl">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-3xl font-bold text-gray-700">No upcoming events</p>
              <p className="text-gray-500 mt-4 text-lg">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-gray-100"
                  onClick={() => event.link && window.open(event.link, '_blank')}
                >
                  {/* EVENT IMAGE */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/800x600/050A14/FFD700?text=EVENT';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#050A14] to-blue-900 flex items-center justify-center">
                        <svg className="w-20 h-20 text-[#FFD700] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#050A14] mb-4 line-clamp-2 group-hover:text-blue-700 transition">
                      {event.title}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-[#050A14]">{format(new Date(event.date), 'PPP p')}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="mt-6 text-gray-600 line-clamp-3 leading-relaxed">{event.description}</p>

                    {event.link && (
                      <div className="mt-6 flex items-center text-[#FFD700] font-bold hover:text-yellow-400 transition">
                        Register Now
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OPTIONAL: Suggest Event Button */}
      <Link
        href="/login"
        className="fixed right-8 bottom-8 z-50 flex items-center gap-3 bg-[#FFD700] text-[#050A14] px-8 py-5 rounded-full shadow-2xl hover:scale-110 transition-all font-bold uppercase text-sm tracking-wider"
      >
        Suggest Event
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* FOOTER */}
      <footer className="bg-[#050A14] text-white py-16 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-6xl font-bold uppercase italic tracking-wider text-[#FFD700] mb-4">RIRI</div>
          <p className="text-xl text-gray-300">Rwanda Innovation & Research Institute</p>
          <p className="text-sm text-gray-500 mt-10">© 2025 RIRI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
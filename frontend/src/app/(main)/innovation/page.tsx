'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Innovation {
  id: number;
  name: string;
  status: 'approved'| 'pending'| 'rejected';
  description: string;
  photo: string | null;
  sponsorship_needed: 'sponsored' | 'unsponsored' | 'no-need';
  innovator_name?: string; // If you add user.get_full_name or username in serializer
  created_at?: string;
}

interface Counts {
  total: number;
  sponsored: number;
  unsponsored: number;
  no_need: number;
}

const SPONSORSHIP_OPTIONS = [
  { label: 'Sponsored', value: 'sponsored', color: 'bg-green-600' },
  { label: 'Unsponsored', value: 'unsponsored', color: 'bg-orange-600' },
  { label: 'No Need', value: 'no-need', color: 'bg-gray-600' },
];

const InnovationCard: React.FC<Innovation> = ({
  id, name, description, photo, sponsorship_needed
}) => {
  const imageSrc = photo?.trim() || 'https://placehold.co/600x400/E0E7FF/1E40AF?text=No+Photo';

  const sponsorshipInfo = SPONSORSHIP_OPTIONS.find(opt => opt.value === sponsorship_needed);

  return (
    <div 
      onClick={() => window.location.href = `${id}`}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/E0E7FF/1E40AF?text=No+Photo'; }}
        />
        {sponsorship_needed && sponsorshipInfo && (
          <div className="absolute top-3 right-3">
            <span className={`px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider ${sponsorshipInfo.color}`}>
              {sponsorshipInfo.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-700 transition">
          {name}
        </h3>
        <p className="text-gray-600 line-clamp-3 text-sm mt-5 mb-6 leading-relaxed">
          {description || 'No description available.'}
        </p>
        <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-800">
          Read More
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function InnovationsPage() {
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0, sponsored: 0, unsponsored: 0, no_need: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSponsorship, setSelectedSponsorship] = useState<string | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      const term = searchTerm.trim();
      params.append('search', term); // Assuming you use DRF search filter on name & description
    }

    if (selectedSponsorship) {
      params.append('sponsorship_needed', selectedSponsorship);
    }

    const base = 'http://127.0.0.1:8000/api/innovations/public-lists/';
    return params.toString() ? `${base}?${params.toString()}` : base;
  }, [searchTerm, selectedSponsorship]);

  const fetchInnovations = useCallback(async () => {
  setIsLoading(true);
  try {
    const url = buildApiUrl();
    console.log('Fetching from:', url); // ← Check URL

    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const responseData = await res.json();
      
      console.log('Raw API response:', responseData); // ← THIS IS KEY
      console.log('Type of responseData:', typeof responseData);
      console.log('Is array?', Array.isArray(responseData));
      console.log('Has results key?', 'results' in responseData);

      let data: Innovation[] = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData && Array.isArray(responseData.results)) {
        data = responseData.results;
      } else {
        console.error('Unexpected response format:', responseData);
        data = [];
      }

      console.log('Extracted innovations:', data);
      console.log('Number of items:', data.length);

      setInnovations(data);
    } else {
      console.error('Fetch failed:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    setInnovations([]);
  } finally {
    setIsLoading(false);
  }
}, [buildApiUrl]);
  const fetchCounts = useCallback(async () => {
    const url = 'http://127.0.0.1:8000/api/innovations/public-countss/';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: Partial<Counts> = await res.json();
        setCounts(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Counts error:', err);
    }
  }, []);

  useEffect(() => {
    fetchInnovations();
  }, [searchTerm, selectedSponsorship]);

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#E0F2FE] text-gray-900">
      {/* DARK NAVY TOP BAND */}
      <div className="h-28 bg-[#050A14]" aria-hidden="true" />

      {/* HERO */}
      <section className="relative -mt-28 pt-36 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#050A14] mb-6">
            Browse <span className="text-[#FFD700]">Innovations</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore groundbreaking innovations from Rwanda's creative community.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* SEARCH BAR */}
          <div className="flex justify-center mb-12">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search by name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-12 py-5 rounded-full bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:shadow-xl transition-all text-lg shadow-lg"
              />
              <svg className="absolute left-5 top-6 w-7 h-7 text-[#050A14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-5 top-6 text-[#050A14] hover:text-red-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sponsorship Filter Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
            {SPONSORSHIP_OPTIONS.map((opt) => {
              const count = counts[opt.value as keyof Counts] || 0;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedSponsorship(prev => prev === opt.value ? null : opt.value)}
                  disabled={count === 0}
                  className={`py-6 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all shadow-xl flex flex-col items-center ${
                    selectedSponsorship === opt.value
                      ? 'bg-[#050A14] text-[#FFD700] scale-105 shadow-2xl'
                      : count === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-white text-[#050A14] border-4 border-gray-300 hover:border-[#FFD700] hover:scale-105'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-xs mt-2 opacity-80">{count} items</span>
                </button>
              );
            })}
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-[#FFD700] border-t-transparent"></div>
              <p className="mt-6 text-xl text-[#050A14] font-medium">Loading innovations...</p>
            </div>
          ) : innovations.length === 0 ? (
            <div className="text-center py-32 bg-white/90 rounded-3xl shadow-2xl">
              <p className="text-3xl font-bold text-gray-600">No innovations found</p>
              <p className="text-gray-500 mt-4">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {innovations.map((innovation) => (
                <InnovationCard key={innovation.id} {...innovation} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upload Button */}
      <Link href="/login" className="fixed right-6 bottom-6 z-50 flex items-center gap-3 bg-[#FFD700] text-[#050A14] px-7 py-4 rounded-full shadow-2xl hover:scale-110 transition-all font-bold text-sm uppercase">
        Upload Innovation
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* Footer */}
      <footer className="bg-[#050A14] text-white py-16 mt-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-6xl font-bold uppercase italic tracking-wider mb-4">RIRI</div>
          <p className="text-gray-300 text-lg">Rwanda Innovation & Research Institute</p>
          <p className="text-sm text-gray-500 mt-8">© 2025 RIRI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
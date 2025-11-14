'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

// --- Data & Types ---
interface Publication {
  id: number;
  title: string;
  authors: string;
  description: string;
  cover_image: string;
  file_url: string;
}

const CORE_FIELDS = [
  'Engineering', 'Medicine/Health Sciences', 'Arts & Humanities', 'Natural Sciences',
  'Social Sciences', 'Business & Economics', 'Computer Science/IT', 'Education',
];

// --- Publication Card ---
const PublicationCard: React.FC<Publication> = ({ id, title, authors, description, cover_image }) => {
  // FALLBACK IF NO COVER
  const imageSrc = cover_image && cover_image.trim() !== ''
    ? cover_image
    : 'https://placehold.co/600x400/d8e5c7/4a772e?text=No+Cover';

  return (
    <Link
      href={`/book/${id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer block"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400/d8e5c7/4a772e?text=No+Cover';
          }}
        />
        {/* Optional: Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-[#4a772e] mb-2 line-clamp-2 group-hover:text-[#6b8e4f] transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-600 italic mb-1">By: {authors}</p>

        <p className="text-sm text-gray-700 line-clamp-3 mb-3">{description}</p>

        <div className="flex items-center text-xs font-semibold text-[#4a772e] group-hover:text-[#6b8e4f] transition-colors">
          Read Full Article
          <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

// --- Data Fetch ---
async function getPublications(): Promise<Publication[]> {
  const API_URL = 'http://127.0.0.1:8000/api/innovations/public-list/';
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// --- Main Component ---
export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getPublications();
      setPublications(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Filter by field + search
  const filteredPublications = useMemo(() => {
    if (isLoading) return [];
    let filtered = publications;

    if (selectedField) {
      filtered = filtered.filter(pub => pub.title.includes(selectedField) || pub.authors.includes(selectedField));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(pub =>
        pub.title.toLowerCase().includes(lower) ||
        pub.authors.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [selectedField, searchTerm, publications, isLoading]);

  const handleFieldClick = (field: string) => {
    setSelectedField(prev => (prev === field ? null : field));
  };

  return (
    <div className="min-h-screen bg-[#d8e5c7] flex flex-col">
      {/* === NAVIGATION === */}
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
              <Link href="/publications" className="text-[#f7f7e8]">Publications</Link>
              <Link href="/events" className="hover:text-[#f7f7e8] transition">Events</Link>
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

      {/* === HERO SECTION === */}
      <section className="bg-gradient-to-b from-[#4a772e] to-[#8c9c6f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Research Publications</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Explore peer-reviewed papers, books, and innovations from Rwanda's academic community.
          </p>
        </div>
      </section>

      {/* === SEARCH & FILTERS === */}
      <section className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-[#8c9c6f] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a772e] focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-[#4a772e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-[#4a772e] hover:text-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Field Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {CORE_FIELDS.map((field) => (
              <button
                key={field}
                onClick={() => handleFieldClick(field)}
                className={`
                  w-full h-16 font-semibold text-xs sm:text-sm uppercase rounded-lg shadow-md transition duration-200 ease-in-out
                  ${selectedField === field
                    ? 'bg-[#4a772e] text-white ring-4 ring-[#8c9c6f]/50'
                    : 'bg-white text-[#4a772e] hover:bg-[#f7f7e8] border border-[#8c9c6f]'
                  }
                `}
              >
                {field}
              </button>
            ))}
          </div>

          {/* Results Title */}
          <h2 className="text-2xl font-bold text-[#4a772e] mb-6 text-center">
            {selectedField || searchTerm 
              ? `Results for: "${selectedField || searchTerm}"` 
              : 'Latest Publications'}
          </h2>

          {/* === PUBLICATION GRID === */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4a772e] border-t-transparent"></div>
              <p className="mt-4 text-[#4a772e] font-medium">Loading publications...</p>
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xl text-gray-600">No publications found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublications.map((pub) => (
                <PublicationCard key={pub.id} {...pub} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === FOOTER === */}
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
              <li><Link href="/publications" className="hover:text-white transition">Publications</Link></li>
              <li><Link href="/events" className="hover:text-white transition">Events</Link></li>
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
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────
interface Publication {
  id: number;
  title: string;
  status: string;
  authors: string;
  description: string;
  cover_image: string | null;
  file_url: string;
  supervisor_name?: string;
  submission_type?: string;
  degree_type?: 'thesis' | 'dissertation';
  university?: string;
}

interface Counts {
  thesis: number;
  dissertation: number;
  engineering: number;
  medicine_health_sciences: number;
  arts_humanities: number;
  natural_sciences: number;
  social_sciences: number;
  business_economics: number;
  computer_science_it: number;
  education: number;
}

// ──────────────────────────────────────────────────────
// FIXED FIELD NAMES — 100% CONSISTENT
// ──────────────────────────────────────────────────────
const CORE_FIELDS = [
  'Engineering',
  'Medicine/Health Sciences',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
  'Business & Economics',
  'Computer Science/IT',
  'Education',
];

const FIELD_TO_KEY: Record<string, keyof Counts> = {
  'Engineering': 'engineering',
  'Medicine/Health Sciences': 'medicine_health_sciences',
  'Arts & Humanities': 'arts_humanities',
  'Natural Sciences': 'natural_sciences',
  'Social Sciences': 'social_sciences',
  'Business & Economics': 'business_economics',
  'Computer Science/IT': 'computer_science_it',
  'Education': 'education',
};

const FIELD_KEYWORDS: Record<string, string[]> = {
  'Engineering': ['engineering', 'electrical', 'mechanical', 'civil', 'iot', 'robotics'],
  'Medicine/Health Sciences': ['medicine', 'health', 'nursing', 'pharmacy', 'clinical', 'public health'],
  'Arts & Humanities': ['law', 'literature', 'philosophy', 'history', 'arts', 'humanities', 'language'],
  'Natural Sciences': ['biology', 'chemistry', 'physics', 'mathematics', 'geology', 'environment'],
  'Social Sciences': ['sociology', 'psychology', 'anthropology', 'political', 'social', 'development'],
  'Business & Economics': ['business', 'economics', 'finance', 'management', 'accounting', 'marketing'],
  'Computer Science/IT': ['computer', 'it', 'informatics', 'ai', 'software', 'data', 'cyber'],
  'Education': ['education', 'pedagogy', 'teaching', 'curriculum', 'learning'],
};

const formatFieldName = (submissionType?: string): string => {
  if (!submissionType) return 'Unknown Field';
  return submissionType
    .replace('thesis-', '')
    .replace('dissertation-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ──────────────────────────────────────────────────────
// Publication Card
// ──────────────────────────────────────────────────────
const PublicationCard: React.FC<Publication> = ({
  id, title, authors, description, cover_image,
  supervisor_name, university, degree_type, submission_type
}) => {
  const imageSrc = cover_image?.trim() || 'https://placehold.co/600x400/E0E7FF/1E40AF?text=No+Cover';
  const fieldName = formatFieldName(submission_type);

  return (
    <Link href={`/books/${id}`} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/E0E7FF/1E40AF?text=No+Cover'; }}
        />
        {degree_type && (
          <div className="absolute top-3 right-3">
            <span className={`px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider ${degree_type === 'thesis' ? 'bg-blue-600' : 'bg-purple-600'}`}>
              {degree_type === 'thesis' ? 'Thesis' : 'Dissertation'}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-700 transition">{title}</h3>
        <div className="space-y-3 text-sm">
          {university && (
            <p className="font-semibold text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-4m-6 0H5" />
              </svg>
              {university}
            </p>
          )}
          <p className="text-gray-700"><span className="text-gray-500 font-medium">Author:</span> {authors}</p>
          {supervisor_name && <p className="text-gray-700"><span className="text-gray-500 font-medium">Supervisor:</span> {supervisor_name}</p>}
          {submission_type && <p className="text-indigo-700 font-semibold"><span className="text-gray-500 font-medium">Field:</span> {fieldName}</p>}
        </div>
        <p className="text-gray-600 line-clamp-3 text-sm mt-5 mb-6 leading-relaxed">{description || 'No description available.'}</p>
        <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-800">
          Read More
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

// ──────────────────────────────────────────────────────
// Main Page — 100% WORKING SEARCH + FILTERS
// ──────────────────────────────────────────────────────
export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [counts, setCounts] = useState<Counts>({
    thesis: 0, dissertation: 0,
    engineering: 0, medicine_health_sciences: 0, arts_humanities: 0,
    natural_sciences: 0, social_sciences: 0, business_economics: 0,
    computer_science_it: 0, education: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [degreeFilter, setDegreeFilter] = useState<'all' | 'thesis' | 'dissertation'>('all');
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      const term = searchTerm.trim();
      params.append('search', term);
      params.append('authors__icontains', term);
      params.append('supervisor_name__icontains', term);
      params.append('university__icontains', term);
      params.append('submission_type__icontains', term);
    }

    if (degreeFilter !== 'all') {
      params.append('degree_type', degreeFilter);
    }

    if (selectedField && FIELD_KEYWORDS[selectedField]) {
      FIELD_KEYWORDS[selectedField].forEach(keyword => {
        params.append('submission_type__icontains', keyword);
      });
    }

    const base = 'http://127.0.0.1:8000/api/innovations/public-list/';
    return params.toString() ? `${base}?${params.toString()}` : base;
  }, [searchTerm, degreeFilter, selectedField]);

  const fetchPublications = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = buildApiUrl();
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data: Publication[] = await res.json();
        setPublications(data.filter(p => p.status === 'approved'));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buildApiUrl]);

  const fetchCounts = useCallback(async () => {
    const url = `http://127.0.0.1:8000/api/innovations/public-counts/?degree_type=${degreeFilter === 'all' ? '' : degreeFilter}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: Partial<Counts> = await res.json();
        setCounts(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Counts error:', err);
    }
  }, [degreeFilter]);

  // Re-fetch on any change
  useEffect(() => {
    fetchPublications();
  }, [searchTerm, degreeFilter, selectedField]);

  useEffect(() => {
    fetchCounts();
  }, [degreeFilter]);

  return (
    <div className="min-h-screen bg-[#E0F2FE] text-gray-900">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 flex justify-between items-center px-[50px] py-[25px] bg-[#050A14] text-white shadow-2xl">
        <div className="text-[45px] font-bold uppercase italic tracking-[2px]">RIRI</div>
        <ul className="flex gap-[40px]">
          {['home', 'publications', 'innovation', 'about', 'events'].map((item) => (
            <li key={item}>
              <Link href={`/${item === 'home' ? '' : item.toLowerCase()}`}
                className={`text-base font-medium capitalize transition hover:text-[#FFD700] ${item === 'publications' ? 'text-[#FFD700]' : ''}`}>
                {item}
              </Link>
            </li>
          ))}
        </ul>
        <div className="w-[45px] h-[45px] bg-[#D9D9D9] rounded-full" />
      </nav>

      <div className="h-28" />

      {/* HERO */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#050A14] mb-6">
            Browse Research <span className="text-[#FFD700]">Publications</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore peer-reviewed theses and dissertations from Rwanda's academic community.
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
                placeholder="Search by title, author, supervisor, university, field..."
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

          {/* Thesis / Dissertation Buttons */}
          <div className="flex justify-center gap-12 mb-12">
            <button onClick={() => setDegreeFilter(degreeFilter === 'thesis' ? 'all' : 'thesis')}
              className={`px-16 py-6 rounded-full text-2xl font-bold transition-all shadow-2xl flex items-center gap-4 ${degreeFilter === 'thesis' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white scale-105' : 'bg-white text-blue-700 border-4 border-blue-400 hover:border-blue-700'}`}>
              Theses <span className="text-lg font-normal opacity-90">({counts.thesis})</span>
            </button>
            <button onClick={() => setDegreeFilter(degreeFilter === 'dissertation' ? 'all' : 'dissertation')}
              className={`px-16 py-6 rounded-full text-2xl font-bold transition-all shadow-2xl flex items-center gap-4 ${degreeFilter === 'dissertation' ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white scale-105' : 'bg-white text-purple-700 border-4 border-purple-400 hover:border-purple-700'}`}>
              Dissertations <span className="text-lg font-normal opacity-90">({counts.dissertation})</span>
            </button>
          </div>

          {/* Field Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            {CORE_FIELDS.map((field) => {
              const key = FIELD_TO_KEY[field];
              const count = counts[key] || 0;
              return (
                <button
                  key={field}
                  onClick={() => setSelectedField(prev => prev === field ? null : field)}
                  disabled={count === 0}
                  className={`py-6 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all shadow-xl flex flex-col items-center ${
                    selectedField === field
                      ? 'bg-[#050A14] text-[#FFD700] scale-105 shadow-2xl'
                      : count === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-white text-[#050A14] border-4 border-gray-300 hover:border-[#FFD700] hover:scale-105'
                  }`}
                >
                  <span>{field}</span>
                  <span className="text-xs mt-2 opacity-80">{count} items</span>
                </button>
              );
            })}
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-[#FFD700] border-t-transparent"></div>
              <p className="mt-6 text-xl text-[#050A14] font-medium">Loading publications...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-32 bg-white/90 rounded-3xl shadow-2xl">
              <p className="text-3xl font-bold text-gray-600">No publications found</p>
              <p className="text-gray-500 mt-4">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {publications.map((pub) => (
                <PublicationCard key={pub.id} {...pub} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upload Button */}
      <Link href="/login" className="fixed right-6 bottom-6 z-50 flex items-center gap-3 bg-[#FFD700] text-[#050A14] px-7 py-4 rounded-full shadow-2xl hover:scale-110 transition-all font-bold text-sm uppercase">
        Upload Book
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
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ──────────────────────────────────────────────────────
// Types & Constants (unchanged)
// ──────────────────────────────────────────────────────
interface Publication {
  id: number;
  title: string;
  status: string;
  authors: string;
  description: string;
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
// Mini Card for search dropdown (box style)
// ──────────────────────────────────────────────────────
const MiniPublicationCard: React.FC<Publication & { onClick: () => void }> = ({
  id, title, authors, university, degree_type, onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 cursor-pointer flex flex-col h-full min-h-[140px]"
    >
      {/* Small colored header bar */}
      <div className={`h-2 ${degree_type === 'thesis' ? 'bg-blue-500' : 'bg-purple-500'}`} />

      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-700 mb-2">
          {title}
        </h4>

        {/* Meta */}
        <div className="mt-auto space-y-1 text-xs">
          <p className="text-gray-700 line-clamp-1">
            <span className="text-gray-500">By:</span> {authors}
          </p>
          {university && (
            <p className="text-gray-600 line-clamp-1">
              {university}
            </p>
          )}
        </div>

        {/* Degree badge at bottom */}
        {degree_type && (
          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-1 rounded text-[10px] font-medium text-white uppercase tracking-wide ${
                degree_type === 'thesis' ? 'bg-blue-600' : 'bg-purple-600'
              }`}
            >
              {degree_type === 'thesis' ? 'Thesis' : 'Dissertation'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Full Publication Card (unchanged)
// ──────────────────────────────────────────────────────
const PublicationCard: React.FC<Publication> = ({
  id, title, authors, description,
  supervisor_name, university, degree_type, submission_type
}) => {
  const router = useRouter();
  const fieldName = formatFieldName(submission_type);

  const handleUniversityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (university) {
      router.push(`/university/${encodeURIComponent(university)}`);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer flex flex-col h-full">
      <div className="h-10 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        {degree_type && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider ${
                degree_type === 'thesis' ? 'bg-blue-600' : 'bg-purple-600'
              }`}
            >
              {degree_type === 'thesis' ? 'Thesis' : 'Dissertation'}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-700 transition">
          {title}
        </h3>

        <div className="space-y-4 text-base flex-1">
          {university && (
            <button
              onClick={handleUniversityClick}
              className="font-semibold text-green-700 hover:underline text-left p-0 bg-transparent border-none cursor-pointer"
            >
              <span className="text-gray-500 font-medium">University: </span>{university}
            </button>
          )}
          <p className="text-gray-700">
            <span className="text-gray-500 font-medium">Author by:</span> {authors}
          </p>
          {supervisor_name && (
            <p className="text-gray-700">
              <span className="text-gray-500 font-medium">Supervisor by:</span> {supervisor_name}
            </p>
          )}
          {submission_type && (
            <p className="text-indigo-700 font-semibold">
              <span className="text-gray-500 font-medium">Field:</span> {fieldName}
            </p>
          )}

          <p className="text-gray-600 line-clamp-3 text-base mt-6 leading-relaxed">
            {description || 'No description available.'}
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/books/${id}`);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-blue-50 to-indigo-70 text-black font-bold rounded-full hover:bg-yellow-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Abstract
            <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Main Component
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
  const [showSearchResults, setShowSearchResults] = useState(false);

  const router = useRouter();
  const MAX_QUICK_RESULTS = 6;

  // Debounced search
  const debouncedSearchTerm = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (term: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setSearchTerm(term), 400);
    };
  }, []);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (degreeFilter !== 'all') params.append('degree_type', degreeFilter);
    if (selectedField && FIELD_KEYWORDS[selectedField]) {
      params.append('field_keywords', FIELD_KEYWORDS[selectedField].join(','));
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
    let url = 'http://127.0.0.1:8000/api/innovations/public-counts/';
    if (degreeFilter !== 'all') url += `?degree_type=${degreeFilter}`;
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

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    fetchCounts();
  }, [degreeFilter]);

  const isSearching = searchTerm.trim().length > 1;

  return (
    <div className="min-h-screen bg-[#E0F2FE] text-gray-900 relative">
      <div className="h-28 bg-[#050A14]" aria-hidden="true" />

      <section className="relative -mt-28 pt-36 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#050A14] mb-6">
            Browse Research <span className="text-[#FFD700]">Publications</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore peer-reviewed theses and dissertations from Rwanda's academic community.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search + Dropdown with mini cards grid */}
          <div className="relative flex justify-center mb-12 z-30">
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                placeholder="Search by title, author, supervisor, university, field..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  debouncedSearchTerm(val);
                  setShowSearchResults(val.trim().length > 1);
                }}
                onFocus={() => {
                  if (searchTerm.trim().length > 1) setShowSearchResults(true);
                }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 180)}
                className="w-full pl-14 pr-12 py-5 rounded-full bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:shadow-xl transition-all text-lg shadow-lg"
              />
              <svg className="absolute left-5 top-6 w-7 h-7 text-[#050A14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-5 top-6 text-[#050A14] hover:text-red-600"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Floating Results Panel – now with grid of mini cards */}
            {showSearchResults && isSearching && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[70vh] overflow-y-auto z-40">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : publications.length === 0 ? (
                  <div className="p-10 text-center text-gray-600">
                    No matches found for <strong>"{searchTerm}"</strong>
                  </div>
                ) : (
                  <>
                    <div className="p-4 border-b border-gray-100 bg-gray-50 sticky top-0 z-10 flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-600">
                        {publications.length} result{publications.length !== 1 ? 's' : ''} found
                        {publications.length > MAX_QUICK_RESULTS && ` – showing first ${MAX_QUICK_RESULTS}`}
                      </p>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {publications.slice(0, MAX_QUICK_RESULTS).map((pub) => (
                        <MiniPublicationCard
                          key={pub.id}
                          {...pub}
                          onClick={() => router.push(`/books/${pub.id}`)}
                        />
                      ))}
                    </div>

                    {publications.length > MAX_QUICK_RESULTS && (
                      <div className="p-5 text-center border-t border-gray-100">
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          See all {publications.length} results ↓
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Filters + Full Grid – hidden during active search */}
          {!showSearchResults && (
            <>
              <div className="flex justify-center gap-12 mb-12">
                <button
                  onClick={() => setDegreeFilter(degreeFilter === 'thesis' ? 'all' : 'thesis')}
                  className={`px-16 py-6 rounded-full text-2xl font-bold transition-all shadow-2xl flex items-center gap-4 ${
                    degreeFilter === 'thesis'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white scale-105'
                      : 'bg-white text-blue-700 border-4 border-blue-400 hover:border-blue-700'
                  }`}
                >
                  Theses <span className="text-lg font-normal opacity-90">({counts.thesis})</span>
                </button>

                <button
                  onClick={() => setDegreeFilter(degreeFilter === 'dissertation' ? 'all' : 'dissertation')}
                  className={`px-16 py-6 rounded-full text-2xl font-bold transition-all shadow-2xl flex items-center gap-4 ${
                    degreeFilter === 'dissertation'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white scale-105'
                      : 'bg-white text-purple-700 border-4 border-purple-400 hover:border-purple-700'
                  }`}
                >
                  Dissertations <span className="text-lg font-normal opacity-90">({counts.dissertation})</span>
                </button>
              </div>

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
            </>
          )}
        </div>
      </section>

      <Link
        href="/login"
        className="fixed right-6 bottom-6 z-50 flex items-center gap-3 bg-[#FFD700] text-[#050A14] px-7 py-4 rounded-full shadow-2xl hover:scale-110 transition-all font-bold text-sm uppercase"
      >
        Upload Book
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      <footer className="bg-[#050A14] text-white py-16 mt-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-6xl font-bold uppercase italic tracking-wider mb-4">RIRI</div>
          <p className="text-gray-300 text-lg">Rwanda Innovation & Research Institute</p>
          <p className="text-sm text-gray-500 mt-8">© 2026 RIRI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
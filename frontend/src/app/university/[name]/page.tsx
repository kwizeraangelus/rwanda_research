// app/university/[name]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  year?: number;
}

interface UniversityStats {
  total: number;
  theses: number;
  dissertations: number;
  topFields: { field: string; count: number }[];
  recentYear?: number;
}

export default function UniversityPage() {
  const params = useParams();
  const universityName = decodeURIComponent(params.name as string);
  
  const [publications, setPublications] = useState<Publication[]>([]);
  const [universityPublications, setUniversityPublications] = useState<Publication[]>([]);
  const [stats, setStats] = useState<UniversityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'thesis' | 'dissertation'>('all');

  useEffect(() => {
    fetchUniversityData();
  }, [universityName, activeFilter]);

  const fetchUniversityData = async () => {
    setIsLoading(true);
    try {
      // Fetch all publications
      const url = 'http://127.0.0.1:8000/api/innovations/public-list/';
      const res = await fetch(url);
      
      if (res.ok) {
        const allPublications: Publication[] = await res.json();
        setPublications(allPublications.filter(p => p.status === 'approved'));
        
        // Filter for this university
        const uniPubs = allPublications.filter(p => 
          p.status === 'approved' && 
          p.university?.toLowerCase().includes(universityName.toLowerCase())
        );
        
        // Apply degree filter
        const filteredPubs = activeFilter === 'all' 
          ? uniPubs 
          : uniPubs.filter(p => p.degree_type === activeFilter);
        
        setUniversityPublications(filteredPubs);
        
        // Calculate stats
        const theses = uniPubs.filter(p => p.degree_type === 'thesis').length;
        const dissertations = uniPubs.filter(p => p.degree_type === 'dissertation').length;
        
        // Calculate top fields
        const fieldCounts: Record<string, number> = {};
        uniPubs.forEach(pub => {
          if (pub.submission_type) {
            const field = pub.submission_type
              .replace('thesis-', '')
              .replace('dissertation-', '')
              .split('-')[0] || 'Other';
            const formattedField = field
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            fieldCounts[formattedField] = (fieldCounts[formattedField] || 0) + 1;
          }
        });
        
        const topFields = Object.entries(fieldCounts)
          .map(([field, count]) => ({ field, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Get most recent year
        const years = uniPubs
          .filter(p => p.year)
          .map(p => p.year!)
          .sort((a, b) => b - a);
        
        setStats({
          total: uniPubs.length,
          theses,
          dissertations,
          topFields,
          recentYear: years.length > 0 ? years[0] : undefined
        });
      }
    } catch (error) {
      console.error('Error fetching university data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getDegreeColor = (degreeType?: string) => {
    return degreeType === 'thesis' 
      ? 'bg-blue-600' 
      : degreeType === 'dissertation' 
        ? 'bg-purple-600' 
        : 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-[#050A14] border-t-transparent"></div>
          <p className="mt-6 text-xl text-[#050A14] font-medium">Loading {universityName} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#050A14] to-[#1a237e] text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="mb-8">
            <Link 
              href="/publications" 
              className="inline-flex items-center gap-2 text-[#FFD700] hover:underline font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Publications
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{universityName}</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Academic research and publications from {universityName}
          </p>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-[#FFD700] mb-2">{stats.total}</div>
                <div className="text-gray-200 font-semibold">Total Publications</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-blue-300 mb-2">{stats.theses}</div>
                <div className="text-gray-200 font-semibold">Theses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-300 mb-2">{stats.dissertations}</div>
                <div className="text-gray-200 font-semibold">Dissertations</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all shadow-lg ${
              activeFilter === 'all'
                ? 'bg-[#050A14] text-[#FFD700] scale-105'
                : 'bg-white text-[#050A14] border-2 border-gray-300 hover:border-[#050A14] hover:scale-105'
            }`}
          >
            All ({stats?.total || 0})
          </button>
          <button
            onClick={() => setActiveFilter('thesis')}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all shadow-lg ${
              activeFilter === 'thesis'
                ? 'bg-blue-600 text-white scale-105'
                : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-600 hover:scale-105'
            }`}
          >
            Theses ({stats?.theses || 0})
          </button>
          <button
            onClick={() => setActiveFilter('dissertation')}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all shadow-lg ${
              activeFilter === 'dissertation'
                ? 'bg-purple-600 text-white scale-105'
                : 'bg-white text-purple-600 border-2 border-purple-300 hover:border-purple-600 hover:scale-105'
            }`}
          >
            Dissertations ({stats?.dissertations || 0})
          </button>
        </div>

        {/* Top Fields */}
        {stats && stats.topFields.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[#050A14] mb-6 text-center">
              Top Research Fields
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {stats.topFields.map(({ field, count }) => (
                <div 
                  key={field} 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border-2 border-blue-100 hover:border-blue-300 transition-all"
                >
                  <div className="text-3xl font-bold text-[#050A14] mb-2">{count}</div>
                  <div className="text-sm font-semibold text-gray-700">{field}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications Grid */}
        {universityPublications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-2xl">
            <div className="text-4xl text-gray-300 mb-4">📚</div>
            <p className="text-2xl font-bold text-gray-600">No publications found from {universityName}</p>
            <p className="text-gray-500 mt-4">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">
              Research Publications from {universityName}
              <span className="block text-lg font-normal text-gray-600 mt-2">
                Showing {universityPublications.length} publication{universityPublications.length !== 1 ? 's' : ''}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {universityPublications.map(publication => (
                <div
                  key={publication.id}
                  onClick={() => window.location.href = `/books/${publication.id}`}
                  className="cursor-pointer group transform transition-all hover:scale-[1.02]"
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-2xl transition-all">
                    {/* Cover Image */}
                    <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                      {publication.cover_image ? (
                        <img
                          src={publication.cover_image}
                          alt={publication.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/E0E7FF/1E40AF?text=No+Cover';
                          }}
                        />
                      ) : (
                        <>
                          <span className="text-6xl text-gray-300">📖</span>
                          <p className="text-xl font-medium text-gray-500 mt-4 tracking-wider">
                            {publication.degree_type?.toUpperCase() || 'RESEARCH'}
                          </p>
                        </>
                      )}
                      {/* Degree Badge */}
                      {publication.degree_type && (
                        <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${getDegreeColor(publication.degree_type)}`}>
                          {publication.degree_type === 'thesis' ? 'THESIS' : 'DISSERTATION'}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h4 className="font-bold text-gray-800 text-lg line-clamp-2 mb-3 group-hover:text-blue-700 transition">
                        {publication.title}
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-700 text-sm">
                          <span className="text-gray-500 font-medium">Author:</span> {publication.authors}
                        </p>
                        {publication.supervisor_name && (
                          <p className="text-gray-700 text-sm">
                            <span className="text-gray-500 font-medium">Supervisor:</span> {publication.supervisor_name}
                          </p>
                        )}
                        {publication.year && (
                          <p className="text-gray-700 text-sm">
                            <span className="text-gray-500 font-medium">Year:</span> {publication.year}
                          </p>
                        )}
                        {publication.submission_type && (
                          <p className="text-blue-700 font-semibold text-sm">
                            <span className="text-gray-500 font-medium">Field:</span> {formatFieldName(publication.submission_type)}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {publication.description || 'No description available.'}
                      </p>
                      
                      <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-800">
                        Read Publication
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        
      </div>

      {/* Footer */}
      <footer className="bg-[#050A14] text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-6xl font-bold uppercase italic tracking-wider mb-4">RIRI</div>
          <p className="text-gray-300 text-lg">Rwanda Innovation & Research Institute</p>
          <p className="text-sm text-gray-500 mt-8">© 2025 RIRI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
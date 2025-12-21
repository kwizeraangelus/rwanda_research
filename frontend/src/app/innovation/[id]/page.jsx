'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';

export default function InnovationDetailPage({ params }) {
  const resolvedParams = use(params);
  const [innovation, setInnovation] = useState(null);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchInnovation();
  }, [resolvedParams.id]);

  const fetchInnovation = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/innovation/${resolvedParams.id}/`);

      if (res.status === 404) {
        setError('Innovation not found');
      } else if (!res.ok) {
        setError('Failed to load innovation');
      } else {
        const data = await res.json();
        setInnovation(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center">
        <div className="text-[#050A14] text-xl font-bold flex items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-8 border-[#FFD700] border-t-transparent"></div>
          Loading innovation...
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-8 text-lg">{error}</p>
          <button
            onClick={() => router.push('/innovations')}
            className="px-8 py-4 bg-[#FFD700] text-[#050A14] font-bold rounded-full hover:scale-105 transition-all shadow-xl text-lg"
          >
            Back to Innovations
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS
  return (
    <div className="min-h-screen bg-[#E0F2FE] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">

        {/* Header */}
        <div className="border-b-8 border-double border-[#FFD700] p-10 bg-gradient-to-b from-[#050A14] to-[#0f1a2e] text-white">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {innovation.name}
          </h1>
          <p className="text-2xl md:text-3xl mt-6 opacity-90">
            Submitted on{' '}
            <span className="font-semibold text-[#FFD700]">
              {new Date(innovation.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-10">
          {/* Photo */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              {innovation.photo ? (
                <Image
                  src={innovation.photo}
                  alt={innovation.name}
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-2xl shadow-2xl border-8 border-white object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-8 border-dashed border-gray-400 rounded-2xl w-full h-96 flex items-center justify-center shadow-xl">
                  <span className="text-gray-600 text-2xl font-bold">No Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-10">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed text-justify text-lg whitespace-pre-wrap">
                {innovation.description}
              </p>
            </div>

            <div className="border-t-4 border-[#FFD700] pt-8 text-base grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-2xl shadow-inner">
              <div>
                <strong className="text-[#050A14] text-lg">Status:</strong>{' '}
                <span className={`font-bold text-xl block mt-2 ${
                  innovation.status === 'approved' ? 'text-green-600' :
                  innovation.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {innovation.status.charAt(0).toUpperCase() + innovation.status.slice(1)}
                </span>
              </div>

              <div>
                <strong className="text-[#050A14] text-lg">Sponsorship Needed:</strong>{' '}
                <span className={`font-bold text-xl block mt-2 ${
                  innovation.sponsorship_needed === 'sponsored' ? 'text-blue-600' :
                  innovation.sponsorship_needed === 'unsponsored' ? 'text-purple-700' :
                  'text-gray-700'
                }`}>
                  {innovation.sponsorship_needed === 'no-need' 
                    ? 'No Need' 
                    : innovation.sponsorship_needed.charAt(0).toUpperCase() + innovation.sponsorship_needed.slice(1)}
                </span>
              </div>

              <div className="md:col-span-2">
                <strong className="text-[#050A14] text-lg">Submitted by:</strong>{' '}
                <span className="text-[#050A14] font-medium text-lg">
                  {innovation.innovator_username || innovation.innovator || 'Anonymous'}
                </span>
              </div>
            </div>

            {/* Optional CTA Section */}
            <div className="text-center mt-12">
              <p className="text-2xl font-bold text-[#050A14] mb-6">
                Interested in supporting this innovation?
              </p>
             <Link
                   href="/contact"
                   className="inline-block px-10 py-5 bg-[#FFD700] text-[#050A14] font-bold text-xl rounded-full shadow-2xl hover:scale-110 transition-all"
                 >
                   Contact Innovator
             </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
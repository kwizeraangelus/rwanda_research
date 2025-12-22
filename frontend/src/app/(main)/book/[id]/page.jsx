'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function BookDetailPage({ params }) {
  const resolvedParams = use(params);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBook();
  }, [resolvedParams.id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/book/${resolvedParams.id}/`, {
        credentials: 'include',
      });

      if (res.status === 404) {
        setError('Book not found');
      } else if (res.status === 403) {
        setError('You do not have permission to view this book');
      } else if (!res.ok) {
        setError('Failed to load book');
      } else {
        const data = await res.json();
        setBook(data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const openPDF = () => {
    if (book?.file_url) {
      window.open(book.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center">
        <div className="text-[#4a772e] text-xl font-bold">Loading article...</div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/researcher')}
            className="px-6 py-2 bg-[#8c9c6f] text-white font-bold rounded-lg hover:bg-[#7a885d]"
          >
            Back to My Uploads
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS
  return (
    <div className="min-h-screen bg-[#f7f7e8] py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">

        {/* Header */}
        <div className="border-b-8 border-double border-[#8c9c6f] p-6 bg-gradient-to-b from-[#ffffdd] to-white">
          <h1 className="text-4xl md:text-6xl font-bold text-[#4a772e] leading-tight">
            {book.title}
          </h1>
          <p className="text-xl md:text-2xl text-[#7a885d] mt-3 italic">
            By <span className="font-semibold">{book.authors}</span> • {book.year}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {/* Cover */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              {book.cover_image ? (
                <Image
                  src={book.cover_image}
                  alt={book.title}
                  width={350}
                  height={500}
                  className="w-full h-auto rounded-lg shadow-xl border-4 border-[#8c9c6f]"
                  unoptimized
                />
              ) : (
                <div className="bg-gray-200 border-4 border-dashed rounded-lg w-full h-96 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-medium">No Cover</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed text-justify whitespace-pre-wrap">
                {book.description}
              </p>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={openPDF}
                className="inline-flex items-center px-8 py-4 bg-[#8c9c6f] text-white font-bold text-lg rounded-lg shadow-lg hover:bg-[#7a885d] transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Read Full Book
              </button>
            </div>

            <div className="border-t pt-6 text-sm text-gray-600 grid grid-cols-2 gap-4">
              <div>
                <strong>Category:</strong> {book.submission_type.replace('_', ' ').toUpperCase()}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`font-bold ${
                  book.status === 'approved' ? 'text-green-600' :
                  book.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {book.status_display}
                </span>
              </div>
              {book.university && (
                <div className="col-span-2">
                  <strong>Institution:</strong> {book.university}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
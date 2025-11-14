'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/innovations/public-detail/${id}/`);
        if (res.status === 404) {
          setError('Article not found.');
        } else if (!res.ok) {
          setError('Failed to load article.');
        } else {
          const data = await res.json();
          setBook(data);
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const openPDF = () => {
    if (book?.file_url) {
      window.open(book.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading…</p></div>;
  if (error)   return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  return (
    <article className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <header className="p-8 bg-gradient-to-b from-gray-50 to-white text-center border-b-4 border-double border-gray-400">
          <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Research Publication</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">{book.title}</h1>
          <p className="mt-3 text-lg text-gray-600 italic">
            By <span className="font-semibold text-gray-800">{book.authors || 'Unknown'}</span>
          </p>
        </header>

        {/* Cover */}
        {book.cover_image && (
          <div className="p-8 flex justify-center">
            <Image
              src={book.cover_image}
              alt={book.title}
              width={600}
              height={400}
              className="rounded-lg shadow-lg border-4 border-gray-200"
              unoptimized
            />
          </div>
        )}

        {/* Description */}
        <section className="px-8 py-10 text-justify columns-1 md:columns-2 gap-8">
          <p className="text-lg leading-relaxed text-gray-800 first-letter:text-6xl first-letter:font-bold first-letter:text-green-700 first-letter:float-left first-letter:mr-3">
            {book.description}
          </p>
        </section>

        {/* PDF button */}
        <div className="px-8 pb-10 text-center">
          <button
            onClick={openPDF}
            className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-800 transition"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Read Full PDF
          </button>
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 px-8 py-6 text-center text-sm text-gray-600 border-t">
          © 2025 Rwanda Research Hub. All rights reserved.
        </footer>
      </div>
    </article>
  );
}
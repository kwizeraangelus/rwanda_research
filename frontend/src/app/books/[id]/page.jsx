'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const [authorUploads, setAuthorUploads] = useState([]);
  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-500';
    return 'bg-gray-500';
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const bookId = Array.isArray(id) ? id[0] : id;
      try {
        const detailRes = await fetch(`http://127.0.0.1:8000/api/innovations/public-detail/${bookId}/`);
       
        if (detailRes.status === 404) {
          setError('Article not found.');
          setLoading(false);
          return;
        } else if (!detailRes.ok) {
          setError('Failed to load article.');
          setLoading(false);
          return;
        }
       
        const detailData = await detailRes.json();
        setBook(detailData);
        const uploaderId = detailData.user_id;
        if (uploaderId) {
          const listRes = await fetch(`http://127.0.0.1:8000/api/innovations/public-list/?user=${uploaderId}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            const otherBooksByAuthor = listData.filter(item =>
              String(item.id) !== String(bookId)
            );
            setAuthorUploads(otherBooksByAuthor);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading…</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">No book data available.</p></div>;
  return (
    <article className="min-h-screen bg-[#d8e5c7] py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <header className="p-8 bg-gradient-to-b from-gray-50 to-white text-center border-b-4 border-double border-gray-400">
          <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Research Publication</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">{book.title}</h1>
          <p className="mt-3 text-lg text-gray-600 italic">
            By <span className="font-semibold text-gray-800">{book.authors || 'Unknown'}</span>
          </p>
        </header>
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
        <section className="px-8 py-10 text-justify columns-1 md:columns-2 gap-8">
          <p className="text-lg leading-relaxed text-gray-800 first-letter:text-6xl first-letter:font-bold first-letter:text-green-700 first-letter:float-left first-letter:mr-3">
            {book.description}
          </p>
        </section>
        {/* PDF BUTTONS */}
        <div className="px-8 pb-10 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {book?.file_url && (
              <button
                onClick={() => router.push(`/reader/${book.id}`)}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Read Online (Instant)
              </button>
            )}
            {book?.file_url && (
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-800 transition"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download / Open PDF
              </a>
            )}
          </div>
        </div>
        {/* MORE FROM THIS RESEARCHER — DIRECT NAVIGATION */}
        {authorUploads.length > 0 && (
          <div className="bg-gray-50 p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">
              More from this Researcher
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {authorUploads.map(upload => (
                <div
                  key={upload.id}
                  onClick={() => router.push(`/books/${upload.id}`)}
                  className="cursor-pointer group transform transition-all hover:scale-105"
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-blue-200 bg-blue-50">
                    <div className="h-64 bg-white flex flex-col items-center justify-center border-b-2 border-gray-100 relative">
                      {upload.cover_image ? (
                        <Image src={upload.cover_image} alt={upload.title} fill className="object-cover" unoptimized />
                      ) : (
                        <>
                          <span className="text-9xl text-gray-300">Thesis</span>
                          <p className="text-2xl font-medium text-gray-500 mt-4 tracking-wider">THESIS</p>
                        </>
                      )}
                    </div>
                    <div className={`absolute top-4 right-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg ${getStatusBadge(upload.status)}`}>
                      {upload.status_display || upload.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h4 className="font-bold text-gray-800 text-lg line-clamp-2 px-2">{upload.title}</h4>
                    <p className="text-gray-600 mt-1">{upload.year}</p>
                    {upload.supervisor_name && (
                      <p className="text-sm font-medium text-blue-700 mt-2">Supervisor: {upload.supervisor_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* NO OTHER BOOKS */}
        {authorUploads.length === 0 && !loading && !error && (
          <div className="bg-gray-50 p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">More from this Researcher</h3>
            <p className="text-center text-gray-500 py-10 text-lg">No other approved research found by this author.</p>
          </div>
        )}
        <footer className="bg-gray-100 px-8 py-6 text-center text-sm text-gray-600 border-t">
          © 2025 Rwanda Research Hub. All rights reserved.
        </footer>
      </div>
    </article>
  );
}
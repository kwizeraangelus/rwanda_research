// app/books/[id]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Share2, 
  ThumbsUp, 
  ThumbsUp as ThumbsUpFilled,
  BookOpen,
  Download,
  ExternalLink,
  User,
  Calendar,
  Award,
  ChevronLeft
} from 'lucide-react';

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorUploads, setAuthorUploads] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Load like status from localStorage on mount
  useEffect(() => {
    if (!id) return;
    
    const bookId = Array.isArray(id) ? id[0] : id;
    const likedStatus = localStorage.getItem(`book_liked_${bookId}`);
    const likeCountStr = localStorage.getItem(`book_like_count_${bookId}`);
    
    if (likedStatus === 'true') {
      setLiked(true);
    }
    
    if (likeCountStr) {
      setLikeCount(parseInt(likeCountStr));
    }
  }, [id]);

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
        
        // Set initial like count from backend if available
        if (detailData.likes_count !== undefined) {
          setLikeCount(detailData.likes_count);
        }
        
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

  const handleLike = async () => {
    const bookId = Array.isArray(id) ? id[0] : id;
    
    if (liked) {
      // Unlike
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
      localStorage.removeItem(`book_liked_${bookId}`);
      
      // Update like count in localStorage
      localStorage.setItem(`book_like_count_${bookId}`, Math.max(0, likeCount - 1).toString());
      
      // Send unlike to backend if you have an endpoint
      try {
        await fetch(`http://127.0.0.1:8000/api/innovations/${bookId}/unlike/`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error unliking:', error);
      }
    } else {
      // Like
      setLiked(true);
      setLikeCount(prev => prev + 1);
      localStorage.setItem(`book_liked_${bookId}`, 'true');
      
      // Update like count in localStorage
      localStorage.setItem(`book_like_count_${bookId}`, (likeCount + 1).toString());
      
      // Send like to backend if you have an endpoint
      try {
        await fetch(`http://127.0.0.1:8000/api/innovations/${bookId}/like/`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error liking:', error);
      }
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      // Use Web Share API if available
      try {
        await navigator.share({
          title: book?.title || 'Research Publication',
          text: `Check out this research: ${book?.title}`,
          url: currentUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      } catch (error) {
        // Last resort: open share dialog
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(book?.title || 'Check out this research')}&url=${encodeURIComponent(currentUrl)}`,
          '_blank'
        );
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Loading research details…</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <button 
          onClick={goBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={20} />
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!book) return (
    <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center">
      <p className="text-gray-600">No research data available.</p>
    </div>
  );

  return (
    <article className="min-h-screen bg-[#d8e5c7] py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header with Back Button */}
        <header className="p-8 bg-gradient-to-b from-gray-50 to-white text-center border-b-4 border-double border-gray-400 relative">
          <button
            onClick={goBack}
            className="absolute left-8 top-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ChevronLeft size={24} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Research Publication</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">{book.title}</h1>
          <p className="mt-3 text-lg text-gray-600 italic">
            By <span className="font-semibold text-gray-800">{book.authors || 'Unknown'}</span>
          </p>
          
          {/* Quick Info Bar */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-gray-700">
            {book.year && (
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <span>{book.year}</span>
              </div>
            )}
            {book.supervisor_name && (
              <div className="flex items-center gap-2">
                <User size={18} className="text-green-600" />
                <span>Supervisor: {book.supervisor_name}</span>
              </div>
            )}
            {book.status_display && (
              <div className="flex items-center gap-2">
                <Award size={18} className="text-yellow-600" />
                <span>Status: {book.status_display}</span>
              </div>
            )}
          </div>
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

        {/* Description Section with Share/ Buttons */}
        <section className="px-8 py-10 text-justify columns-1 md:columns-2 gap-8">
          <p className="text-lg leading-relaxed text-gray-800 first-letter:text-6xl first-letter:font-bold first-letter:text-green-700 first-letter:float-left first-letter:mr-3 mb-8">
            {book.description}
          </p>
          
          {/* Share and  Section - Under Description */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition group"
                >
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
                
                {showShareTooltip && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
                    Link copied to clipboard!
                  </div>
                )}
              </div>
              
              
            </div>
            
            {/* Stats */}
            <div className="text-sm text-gray-500">
              {book.views_count && (
                <span>{book.views_count.toLocaleString()} views • </span>
              )}
              <span>Shared via URL</span>
            </div>
          </div>
        </section>

        {/* PDF BUTTONS */}
        <div className="px-8 pb-10 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {book?.file_url && (
              <button
                onClick={() => router.push(`/reader/${book.id}`)}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Read Online (Instant)
              </button>
            )}
            {book?.file_url && (
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-800 transition transform hover:scale-105"
              >
                <Download className="w-6 h-6 mr-3" />
                Download / Open PDF
              </a>
            )}
            {book?.external_link && (
              <a
                href={book.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-purple-700 transition transform hover:scale-105"
              >
                <ExternalLink className="w-6 h-6 mr-3" />
                External Source
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
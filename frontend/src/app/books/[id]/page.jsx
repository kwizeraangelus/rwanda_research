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
  ChevronLeft,
  FileText,
  Book,
  GraduationCap,
  Newspaper
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

  // Get icon based on publication type
  const getPublicationIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'journal':
        return <Newspaper className="w-5 h-5" />;
      case 'phd':
      case 'thesis':
      case 'dissertation':
        return <GraduationCap className="w-5 h-5" />;
      case 'book':
      case 'book chapter':
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Format publication type for display
  const formatPublicationType = (type) => {
    switch(type?.toLowerCase()) {
      case 'journal':
        return 'Journal Article';
      case 'phd':
        return 'Ph.D. Thesis';
      case 'thesis':
        return 'Master Thesis';
      case 'book':
        return 'Book';
      case 'book chapter':
        return 'Book Chapter';
      default:
        return type || 'Research Publication';
    }
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
    <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Loading research details…</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center">
      <p className="text-gray-600">No research data available.</p>
    </div>
  );

  return (
    <article className="min-h-screen bg-[#E0F2FE] py-8 px-4">
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
                Open PDF
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

        {/* MORE FROM THIS RESEARCHER - Academic Format */}
        {authorUploads.length > 0 && (
          <div className="bg-gray-50 p-8 border-t">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">
              More Publications by this Researcher
            </h3>
            <div className="max-w-4xl mx-auto space-y-6">
              {authorUploads.map(upload => (
                <div
                  key={upload.id}
                  onClick={() => router.push(`/books/${upload.id}`)}
                  className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Publication Type Badge */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition">
                      {getPublicationIcon(upload.publication_type)}
                    </div>
                    
                    <div className="flex-1">
                      {/* Publication Type Label */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                          {formatPublicationType(upload.publication_type)}
                        </span>
                        {upload.status_display && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(upload.status)} text-white`}>
                            {upload.status_display}
                          </span>
                        )}
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition">
                        {upload.title}
                      </h4>
                      
                      {/* Authors */}
                      <p className="text-gray-700 mb-3 italic">
                        {upload.authors || 'Unknown Authors'}
                      </p>
                      
                      {/* Publication Details */}
                      <div className="text-gray-600 space-y-1">
                        {upload.journal_name && (
                          <p className="font-medium">
                            <span className="text-blue-600">In:</span> {upload.journal_name}
                            {upload.year && <span>, {upload.year}</span>}
                          </p>
                        )}
                        
                        {upload.publisher && !upload.journal_name && (
                          <p className="font-medium">
                            <span className="text-blue-600">Published by:</span> {upload.publisher}
                            {upload.year && <span>, {upload.year}</span>}
                          </p>
                        )}
                        
                        {upload.institution && !upload.publisher && !upload.journal_name && (
                          <p className="font-medium">
                            <span className="text-blue-600">Institution:</span> {upload.institution}
                            {upload.year && <span>, {upload.year}</span>}
                          </p>
                        )}
                      </div>
                      
                      {/* Abstract Preview */}
                      {upload.description && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                           
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {upload.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="mt-6 flex items-center gap-4">
                        {upload.description && (
                          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            <FileText size={16} />
                            Abstract
                          </button>
                        )}
                        
                        {upload.file_url && (
                          <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium">
                            <Download size={16} />
                            PDF
                          </button>
                        )}
                        
                        <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium ml-auto">
                          <ExternalLink size={16} />
                          View Details
                        </button>
                      </div>
                      
                      {/* Citations (if available) */}
                      {upload.citations_count > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            Citations: <span className="font-bold text-gray-700">{upload.citations_count}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NO OTHER PUBLICATIONS */}
        {authorUploads.length === 0 && !loading && !error && (
          <div className="bg-gray-50 p-8 border-t">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">More from this Researcher</h3>
            <div className="text-center text-gray-500 py-10">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Book className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg">No other research publications found by this author.</p>
            </div>
          </div>
        )}

        <footer className="bg-gray-100 px-8 py-6 text-center text-sm text-gray-600 border-t">
          © 2025 Rwanda Research Hub. All rights reserved.
        </footer>
      </div>
    </article>
  );
}
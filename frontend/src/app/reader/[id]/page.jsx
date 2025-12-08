// app/reader/[id]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2, FileText, ExternalLink, Star, Save, X } from 'lucide-react';

export default function ReaderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [hasDeclinedRating, setHasDeclinedRating] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [ratingPromptCount, setRatingPromptCount] = useState(0);
  const [shouldShowAutoPrompt, setShouldShowAutoPrompt] = useState(true);

  const [documentData, setDocumentData] = useState({
    pdfUrl: '',
    title: 'Loading...',
    author: '',
    loading: true,
    error: null,
  });

  // Load rating status from localStorage
  useEffect(() => {
    const rated = localStorage.getItem(`document_rating_${id}`);
    const declined = localStorage.getItem(`document_rating_declined_${id}`);
    const promptCount = localStorage.getItem(`rating_prompt_count_${id}`);

    if (rated) {
      setUserRating(parseInt(rated));
      setHasRated(true);
    }
    if (declined === 'true') {
      setHasDeclinedRating(true);
    }
    if (promptCount) {
      setRatingPromptCount(parseInt(promptCount));
    }
  }, [id]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-show rating modal after 30s, up to 2.5 times (3 times total)
  useEffect(() => {
    // Don't show if already rated, declined, or shown too many times
    if (hasRated || hasDeclinedRating || !shouldShowAutoPrompt) return;
    
    // Check if 30 seconds have passed AND we haven't exceeded max prompts
    if (timeSpent >= 30 && ratingPromptCount < 3) {
      const timer = setTimeout(() => {
        setShowRating(true);
        // Increment prompt count
        const newCount = ratingPromptCount + 1;
        setRatingPromptCount(newCount);
        localStorage.setItem(`rating_prompt_count_${id}`, newCount.toString());
        
        // If this is the 3rd time, don't show auto prompts anymore
        if (newCount >= 3) {
          setShouldShowAutoPrompt(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [timeSpent, hasRated, hasDeclinedRating, ratingPromptCount, shouldShowAutoPrompt, id]);

  // Fetch document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/innovations/public-detail/${id}/`);
        if (!res.ok) throw new Error('Failed to load');

        const data = await res.json();
        if (!data.file_url) throw new Error('No PDF');

        let pdfUrl = data.file_url;
        if (!pdfUrl.startsWith('http')) {
          pdfUrl = `http://127.0.0.1:8000${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
        }

        setDocumentData({
          pdfUrl,
          title: data.title || 'Untitled',
          author: data.authors || 'Unknown',
          loading: false,
          error: null,
        });
      } catch (err) {
        setDocumentData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };
    fetchDocument();
  }, [id]);

  // Save rating
  const saveRating = async (rating) => {
    localStorage.setItem(`document_rating_${id}`, rating.toString());
    localStorage.removeItem(`document_rating_declined_${id}`);
    // Reset prompt count when user finally rates
    localStorage.removeItem(`rating_prompt_count_${id}`);

    try {
      await fetch(`http://127.0.0.1:8000/api/innovations/rate/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch (e) { /* fail silently */ }
  };

  // Handle rating
  const handleRate = async (rating) => {
    await saveRating(rating);
    setUserRating(rating);
    setHasRated(true);
    setShowRating(false);
    alert(`Thank you for rating ${rating} star${rating > 1 ? 's' : ''}!`);
  };

  // Handle skip rating (permanently)
  const handleSkip = () => {
    localStorage.setItem(`document_rating_declined_${id}`, 'true');
    setHasDeclinedRating(true);
    setShowRating(false);
  };

  // Handle close modal without rating/skipping (will reappear later)
  const handleCloseModal = () => {
    setShowRating(false);
    // Don't mark as declined, allow it to reappear
    // The ratingPromptCount is already incremented when modal shows
  };

  // Show rating modal manually (for testing or if user wants to rate later)
  const showRatingManually = () => {
    if (!hasRated && !hasDeclinedRating) {
      setShowRating(true);
    }
  };

  // Back button → always works normally
  const handleBack = () => {
    router.back();
  };

  // Loading
  if (documentData.loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (documentData.error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 text-center">
        <FileText className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <p className="text-red-300 mb-6">{documentData.error}</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-blue-600 rounded-lg text-white flex items-center gap-2 mx-auto">
          <ArrowLeft /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div>
            <h1 className="text-lg font-bold text-white truncate max-w-xl">{documentData.title}</h1>
            <p className="text-sm text-gray-400">by {documentData.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Debug info - you can remove this */}
          <div className="text-xs text-gray-500 hidden">
            Time: {timeSpent}s | Prompts: {ratingPromptCount}/3
          </div>
          
          {/* Manual rate button - shows only if not rated/skipped */}
          {!hasRated && !hasDeclinedRating && ratingPromptCount > 0 && (
            <button
              onClick={showRatingManually}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-1 text-sm"
            >
              <Star size={14} />
              Rate
            </button>
          )}
          
          {hasRated && (
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-900/30 rounded-full">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-yellow-500 font-bold">{userRating}.0</span>
            </div>
          )}

          <a href={documentData.pdfUrl} download className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
            <Download size={20} /> <span className="hidden sm:inline">Download</span>
          </a>

          <a href={documentData.pdfUrl} target="_blank" rel="noopener" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
            <ExternalLink size={20} /> <span className="hidden sm:inline">Open</span>
          </a>
        </div>
      </div>

      {/* PDF */}
      <div className="flex-1">
        <iframe src={documentData.pdfUrl} className="w-full h-full border-0" title="PDF" />
      </div>

      {/* Footer */}
      <div className="bg-gray-800 py-2 text-center text-gray-500 text-sm border-t border-gray-700">
        Document ID: {id} • Viewed for {timeSpent} seconds
      </div>

      {/* Rating Modal - Shows after 30s, up to 3 times */}
      {showRating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-yellow-500" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Enjoying this document?</h2>
              <p className="text-gray-300 mb-6">
                How would you rate "<strong>{documentData.title}</strong>"?
                <br />
                <span className="text-sm text-gray-400">
                  (You've read for {Math.floor(timeSpent / 60)}m {timeSpent % 60}s)
                </span>
              </p>

              {/* Prompt counter display */}
              <div className="mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-1 rounded-full ${
                        i <= ratingPromptCount ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  Prompt {ratingPromptCount} of 3
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleRate(n)}
                    onMouseEnter={() => setTempRating(n)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      size={48}
                      className={tempRating >= n ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}
                    />
                  </button>
                ))}
              </div>

              {/* Star labels */}
              <div className="flex justify-between text-sm text-gray-400 mb-8 px-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Maybe later
                </button>
                
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                >
                  Don't ask again
                </button>

                <button
                  onClick={() => tempRating > 0 && handleRate(tempRating)}
                  disabled={tempRating === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 rounded-lg text-white font-bold flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Rate {tempRating > 0 ? `(${tempRating})` : ''}
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-6">
                {ratingPromptCount < 3 
                  ? `You can close this now • Will ask ${3 - ratingPromptCount} more time${3 - ratingPromptCount === 1 ? '' : 's'}`
                  : 'Last chance to rate!'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
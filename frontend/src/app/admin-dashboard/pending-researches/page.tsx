'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Publication {
  id: number;
  title: string;
  type: string;
  authors: string[];
  info: string;
  doi_url?: string;
  abstract?: string;
  pdf?: string;               // relative path e.g. /media/publications/pdfs/...
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  research_profile: number;
  research_profile_username?: string;   // added by serializer
  created_at: string;
  status_changed_at?: string;
}

export default function PendingPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingPublications();
  }, []);

  const fetchPendingPublications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/publications/pending/', {
        credentials: 'include',
      });

      if (res.ok) {
        setPublications(await res.json());
      } else if (res.status === 401) {
        window.location.href = '/login';
      } else {
        alert('Error loading publications');
      }
    } catch (err) {
      alert('Network error while loading publications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this publication?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/publications/${id}/approve/`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setPublications((prev) => prev.filter((p) => p.id !== id));
        alert('Publication approved!');
      } else {
        alert('Failed to approve publication');
      }
    } catch (err) {
      alert('Error approving publication');
    }
  };

  const handleReject = async (id: number) => {
    if (!feedback.trim()) return alert('Feedback is required for rejection');

    try {
      const res = await fetch(`http://localhost:8000/api/admin/publications/${id}/reject/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (res.ok) {
        setPublications((prev) => prev.filter((p) => p.id !== id));
        setFeedback('');
        setRejectingId(null);
        alert('Publication rejected');
      } else {
        alert('Failed to reject publication');
      }
    } catch (err) {
      alert('Error rejecting publication');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/publications/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setPublications((prev) => prev.filter((p) => p.id !== id));
        alert('Publication deleted');
      } else {
        alert('Failed to delete publication');
      }
    } catch (err) {
      alert('Error deleting publication');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32 text-3xl font-bold text-[#4a772e]">
        Loading Pending Publications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0F2FE] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#4a772e]">Pending Publications Review</h1>
          <a href="/admin" className="text-xl text-[#4a772e] hover:underline">
            Back to Dashboard
          </a>
        </div>

        {publications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl border-4 border-[#e0e0b7]">
            <p className="text-2xl text-gray-500">No pending publications to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-2xl shadow-xl border-2 border-[#e0e0b7] overflow-hidden hover:shadow-2xl transition"
              >
                {/* Header strip instead of photo */}
                <div className="bg-gradient-to-r from-[#4a772e] to-[#8c9c6f] px-6 py-4 text-white">
                  <h3 className="text-xl font-bold line-clamp-2">{pub.title}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {pub.type ? pub.type.replace(/-/g, ' ') : ''}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-2 text-gray-700 mb-5 text-sm">
                    <p>
                      <span className="font-semibold">Authors:</span>{' '}
                      {pub.authors.join(' • ') || '—'}
                    </p>
                    <p>
                      <span className="font-semibold">Submitted by:</span>{' '}
                      {pub.research_profile_username || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold">Submitted:</span>{' '}
                      {format(new Date(pub.created_at), 'dd MMM yyyy • HH:mm')}
                    </p>
                    {pub.info && (
                      <p className="text-gray-600">{pub.info}</p>
                    )}
                    {pub.doi_url && (
                      <p>
                        <a
                          href={pub.doi_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          DOI / Link ↗
                        </a>
                      </p>
                    )}
                  </div>

                  {pub.abstract && (
                    <p className="text-gray-600 line-clamp-4 mb-6 italic">
                      {pub.abstract}
                    </p>
                  )}

                  {pub.pdf && (
                    <p className="mb-4">
                      <a
                        href={`http://localhost:8000${pub.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
                      >
                        View PDF →
                      </a>
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(pub.id)}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(pub.id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDelete(pub.id, pub.title)}
                      className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Reject feedback area */}
                  {rejectingId === pub.id && (
                    <div className="mt-6 p-5 bg-red-50 rounded-xl border-2 border-red-300">
                      <textarea
                        placeholder="Reason for rejection (required for the researcher)..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-4 border-2 border-red-400 rounded-lg text-base resize-none focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleReject(pub.id)}
                          disabled={!feedback.trim()}
                          className={`flex-1 py-3 font-bold rounded-lg transition text-white ${
                            !feedback.trim()
                              ? 'bg-red-300 cursor-not-allowed'
                              : 'bg-red-700 hover:bg-red-800'
                          }`}
                        >
                          Send & Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setFeedback('');
                          }}
                          className="flex-1 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
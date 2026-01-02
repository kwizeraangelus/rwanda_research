'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function PendingInnovationsPage() {
  const [innovations, setInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchPendingInnovations();
  }, []);

  const fetchPendingInnovations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/innovations/pending/', {
        credentials: 'include'
      });
      if (res.ok) {
        setInnovations(await res.json());
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (err) {
      alert('Error loading innovations');
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this innovation?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/innovations/${id}/approve/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setInnovations(prev => prev.filter(i => i.id !== id));
        alert('Innovation approved!');
      } else {
        alert('Failed to approve');
      }
    } catch (err) {
      alert('Error approving innovation');
    }
  };

  const handleReject = async (id) => {
    if (!feedback.trim()) return alert('Feedback is required for rejection');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/innovations/${id}/reject/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (res.ok) {
        setInnovations(prev => prev.filter(i => i.id !== id));
        setFeedback('');
        setRejectingId(null);
        alert('Innovation rejected');
      } else {
        alert('Failed to reject');
      }
    } catch (err) {
      alert('Error rejecting innovation');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/innovations/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setInnovations(prev => prev.filter(i => i.id !== id));
        alert('Innovation deleted');
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      alert('Error deleting innovation');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32 text-3xl font-bold text-[#4a772e]">
        Loading Pending Innovations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0F2FE] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#4a772e]">Pending Innovations Review</h1>
          <a href="/admin" className="text-xl text-[#4a772e] hover:underline">
            Back to Dashboard
          </a>
        </div>

        {innovations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl border-4 border-[#e0e0b7]">
            <p className="text-2xl text-gray-500">No pending innovations to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {innovations.map(innovation => (
              <div
                key={innovation.id}
                className="bg-white rounded-2xl shadow-xl border-2 border-[#e0e0b7] overflow-hidden hover:shadow-2xl transition"
              >
                {/* Photo */}
                {innovation.photo ? (
                  <img
                    src={`http://localhost:8000${innovation.photo}`}
                    alt={innovation.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-[#8c9c6f] to-[#4a772e] h-48 flex items-center justify-center text-white text-5xl font-bold">
                    💡
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#4a772e] mb-3 line-clamp-2">
                    {innovation.name}
                  </h3>

                  <div className="space-y-2 text-gray-700 mb-5">
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Submitted by: {innovation.innovator_username || innovation.innovator}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {format(new Date(innovation.created_at), 'dd MMM yyyy • HH:mm')}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Sponsorship:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        innovation.sponsorship_needed === 'sponsored' ? 'bg-green-100 text-green-800' :
                        innovation.sponsorship_needed === 'unsponsored' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {innovation.sponsorship_needed.replace('-', ' ').charAt(0).toUpperCase() + 
                         innovation.sponsorship_needed.replace('-', ' ').slice(1)}
                      </span>
                    </p>
                  </div>

                  <p className="text-gray-600 line-clamp-4 mb-6">{innovation.description}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(innovation.id)}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(innovation.id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDelete(innovation.id, innovation.name)}
                      className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Reject Feedback Modal */}
                  {rejectingId === innovation.id && (
                    <div className="mt-6 p-5 bg-red-50 rounded-xl border-2 border-red-300">
                      <textarea
                        placeholder="Reason for rejection (required)..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-4 border-2 border-red-400 rounded-lg text-base resize-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleReject(innovation.id)}
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
'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function PendingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/events/pending/', { credentials: 'include' });
      if (res.ok) setEvents(await res.json());
      else if (res.status === 401) window.location.href = '/login';
    } catch (err) { alert('Error loading events'); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this event?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${id}/approve/`, {
        method: 'POST', credentials: 'include'
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        alert('Event approved!');
      }
    } catch (err) { alert('Error'); }
  };

  const handleReject = async (id) => {
    if (!feedback.trim()) return alert('Feedback required');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${id}/reject/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        setFeedback('');
        setRejectingId(null);
        alert('Event rejected');
      }
    } catch (err) { alert('Error'); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}" permanently?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${id}/`, {
        method: 'DELETE', credentials: 'include'
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        alert('Event deleted');
      }
    } catch (err) { alert('Error'); }
  };

  if (loading) return <div className="text-center py-32 text-3xl font-bold text-[#4a772e]">Loading Pending Events...</div>;

  return (
    <div className="min-h-screen bg-[#d8e5c7] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#4a772e]">Pending Events Review</h1>
          <a href="/admin" className="text-xl text-[#4a772e] hover:underline">Back to Dashboard</a>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl border-4 border-[#e0e0b7]">
            <p className="text-2xl text-gray-500">No pending events to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl shadow-xl border-2 border-[#e0e0b7] overflow-hidden hover:shadow-2xl transition">
                {/* Photo */}
                {event.photo ? (
                  <img src={`http://localhost:8000${event.photo}`} alt={event.title}
                    className="w-full h-48 object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-[#8c9c6f] to-[#4a772e] h-48 flex items-center justify-center text-white text-5xl font-bold">
                    {event.icon || 'Calendar'}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#4a772e] mb-3 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-gray-700 mb-5">
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(event.date), 'dd MMM yyyy • p')}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </p>
                  </div>

                  <p className="text-gray-600 line-clamp-3 mb-6">{event.description}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleApprove(event.id)}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">
                      Approve
                    </button>
                    <button onClick={() => setRejectingId(event.id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">
                      Reject
                    </button>
                    <button onClick={() => handleDelete(event.id, event.title)}
                      className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition">
                      Delete
                    </button>
                  </div>

                  {/* Reject Feedback */}
                  {rejectingId === event.id && (
                    <div className="mt-6 p-5 bg-red-50 rounded-xl border-2 border-red-300">
                      <textarea
                        placeholder="Reason for rejection (required)..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="w-full p-4 border-2 border-red-400 rounded-lg text-base resize-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                      />
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => handleReject(event.id)}
                          disabled={!feedback.trim()}
                          className={`flex-1 py-3 font-bold rounded-lg transition ${!feedback.trim() ? 'bg-red-300' : 'bg-red-700 hover:bg-red-800'} text-white`}>
                          Send & Reject
                        </button>
                        <button onClick={() => { setRejectingId(null); setFeedback(''); }}
                          className="flex-1 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition">
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
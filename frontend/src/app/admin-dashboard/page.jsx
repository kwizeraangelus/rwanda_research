'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [data, setData] = useState({ kpis: {}, pending: [] });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Add User Form
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '', email: '', phone_number: '', password: '', confirm_password: '', user_category: 'researcher', university_name: ''
  });

  // Add Event Form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', location: '', link: ''
  });

  useEffect(() => {
    if (activeTab === 'pending') fetchDashboard();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'events') fetchEvents();
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/api/admin/dashboard/', { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      setData(json);
    } else {
      window.location.href = '/login';
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/api/admin/users/', { credentials: 'include' });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/api/admin/events/', { credentials: 'include' });
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    if (action === 'reject' && !feedbackInput.trim()) return alert('Feedback required');
    const res = await fetch(`http://localhost:8000/api/admin/upload/${id}/update/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, feedback: action === 'reject' ? feedbackInput : '' }),
    });
    if (res.ok) {
      setData(prev => ({
        ...prev,
        pending: prev.pending.filter(p => p.id !== id),
        kpis: { ...prev.kpis, pending_count: prev.kpis.pending_count - 1 }
      }));
      setFeedbackInput('');
      setSelectedId(null);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete user?')) return;
    await fetch(`http://localhost:8000/api/admin/users/${id}/`, { method: 'DELETE', credentials: 'include' });
    fetchUsers();
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete event?')) return;
    await fetch(`http://localhost:8000/api/admin/events/${id}/`, { method: 'DELETE', credentials: 'include' });
    fetchEvents();
  };

  // === ADD USER ===
  const handleUserSubmit = async () => {
  if (userForm.password !== userForm.confirm_password) {
    alert('Passwords do not match');
    return;
  }

  const res = await fetch('http://localhost:8000/api/admin/users/create/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userForm),
  });

  if (res.ok) {
    alert('User created successfully!');
    setShowUserForm(false);
    setUserForm({ username: '', email: '', phone_number: '', password: '', confirm_password: '', user_category: 'researcher', university_name: '' });
    fetchUsers();
  } else {
    const err = await res.json();
    alert(err.username?.[0] || err.email?.[0] || err.password?.[0] || 'Error');
  }
};

  // === ADD EVENT ===
  const handleEventSubmit = async () => {
    const res = await fetch('http://localhost:8000/api/admin/events/create/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm),
    });

    if (res.ok) {
      setShowEventForm(false);
      setEventForm({ title: '', description: '', date: '', location: '', link: '' });
      fetchEvents();
    } else {
      alert('Error creating event');
    }
  };

  if (loading) return <div className="text-center py-10 text-[#4a772e] font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#d8e5c7] p-6">
      <h2 className="text-3xl font-bold text-[#4a772e] text-center mb-6">
        Website Management Dashboard
      </h2>

      {/* KPI */}
      {activeTab === 'pending' && (
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-[#8c9c6f] text-white p-6 rounded-lg shadow text-center flex-1 min-w-[200px]">
            <div className="text-4xl font-bold">{data.kpis.total_users}</div>
            <h3>Total Publishers</h3>
          </div>
          <div className="bg-[#8c9c6f] text-white p-6 rounded-lg shadow text-center flex-1 min-w-[200px]">
            <div className="text-4xl font-bold">{data.kpis.total_books}</div>
            <h3>Total Books</h3>
          </div>
          <div className="bg-[#8c9c6f] text-white p-6 rounded-lg shadow text-center flex-1 min-w-[200px]">
            <div className="text-4xl font-bold">{data.kpis.pending_count}</div>
            <h3>Pending</h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#f7f7e8] p-6 rounded-lg shadow">

          {/* PENDING TAB */}
          {/* PENDING TAB */}
{activeTab === 'pending' && (
  <>
    <h3 className="text-xl font-bold text-[#4a772e] mb-2">Pending Books/Projects</h3>
    <p className="text-red-600 text-sm font-bold mb-4">
      (Required Action: Review and Approve/Reject before publishing - FR5)
    </p>
    <div className="space-y-6">
      {data.pending.length === 0 ? (
        <p className="text-gray-600">No pending items.</p>
      ) : (
        data.pending.map(item => (
          <div key={item.id} className="bg-white border-2 border-[#e0e0b7] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              
              {/* COVER IMAGE */}
              <div className="md:w-48 md:h-64 bg-gray-100 flex items-center justify-center p-4">
                {item.cover_image_url && (
  <img
    src={`http://localhost:8000${item.cover_image_url}`}
    alt={item.title}
    className="max-w-full max-h-full object-contain rounded-lg shadow"
  />
)}
              </div>

              {/* CONTENT */}
              <div className="flex-1 p-6">
                <h4 className="text-xl font-bold text-[#4a772e] mb-1">{item.title}</h4>
                <p className="text-sm text-gray-700 mb-1">Author: {item.author_name}</p>
                <p className="text-sm text-gray-600 mb-3">Type: {item.submission_type}</p>

                {/* CLICKABLE PDF */}
                {item.file_url && (
  <a
    href={`http://localhost:8000${item.file_url}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition mb-4"
    // ADD THIS LINE TO PREVENT DOWNLOAD
    onClick={(e) => {
      e.preventDefault();
      const url = `http://localhost:8000${item.file_url}`;
      const ext = item.file_url.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        window.open(url, '_blank');
      } else {
        // For DOCX, XLSX, etc. → Google Docs Viewer
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        window.open(viewerUrl, '_blank');
      }
    }}
  >
    Read Full Document
  </a>
)}

                {/* ACTION BUTTONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'approve')}
                    className="px-5 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedId(item.id)}
                    className="px-5 py-2 bg-[#cc5555] text-white rounded-lg text-sm font-bold hover:bg-[#b33f3f]"
                  >
                    Reject
                  </button>
                </div>

                {/* REJECT FEEDBACK */}
                {selectedId === item.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <textarea
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      placeholder="Enter feedback for author..."
                      className="w-full p-3 border rounded-lg text-sm resize-none"
                      rows="3"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleAction(item.id, 'reject')}
                        className="px-4 py-1 bg-red-600 text-white rounded text-xs font-bold"
                      >
                        Send Feedback
                      </button>
                      <button
                        onClick={() => { setSelectedId(null); setFeedbackInput(''); }}
                        className="px-4 py-1 bg-gray-400 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </>
)}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">List of Publishers</h3>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="px-4 py-1 bg-[#4a772e] text-white rounded text-sm font-bold"
                >
                  + Add User
                </button>
              </div>

              {/* ADD USER FORM */}
              {showUserForm && (
                <div className="mb-6 p-6 bg-white rounded-lg border">
                  <h4 className="font-bold text-[#4a772e] mb-4">Add New User</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Username" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} className="p-2 border rounded" />
                    <input placeholder="Email" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="p-2 border rounded" />
                    <input placeholder="Phone" value={userForm.phone_number} onChange={e => setUserForm({ ...userForm, phone_number: e.target.value })} className="p-2 border rounded" />
                    <select value={userForm.user_category} onChange={e => setUserForm({ ...userForm, user_category: e.target.value })} className="p-2 border rounded">
                      <option value="researcher">Researcher</option>
                      <option value="university">University</option>
                      <option value="conference_organizer">Conference Organizer</option>
                      <option value="public_visitor">Public Visitor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {userForm.user_category === 'university' && (
                      <input placeholder="University Name" value={userForm.university_name} onChange={e => setUserForm({ ...userForm, university_name: e.target.value })} className="p-2 border rounded md:col-span-2" />
                    )}
                    <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="p-2 border rounded" />
                    <input type="password" placeholder="Confirm Password" value={userForm.confirm_password} onChange={e => setUserForm({ ...userForm, confirm_password: e.target.value })} className="p-2 border rounded" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleUserSubmit} className="px-4 py-1 bg-[#4a772e] text-white rounded text-sm">Save User</button>
                    <button onClick={() => setShowUserForm(false)} className="px-4 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* USER LIST */}
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-gray-600">No users found.</p>
                ) : (
                  users.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-white rounded border">
                      <div>
                        <p className="font-bold">{u.username}</p>
                        <p className="text-sm text-gray-600">{u.email} • {u.user_category}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 text-sm">Edit</button>
                        <button onClick={() => deleteUser(u.id)} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">Upcoming Events</h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="px-4 py-1 bg-[#4a772e] text-white rounded text-sm font-bold"
                >
                  + Add Event
                </button>
              </div>

              {/* ADD EVENT FORM */}
              {showEventForm && (
                <div className="mb-6 p-6 bg-white rounded-lg border">
                  <h4 className="font-bold text-[#4a772e] mb-4">Create New Event</h4>
                  <div className="space-y-3">
                    <input placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full p-2 border rounded" />
                    <textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full p-2 border rounded" rows="3" />
                    <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full p-2 border rounded" />
                    <input placeholder="Location" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="w-full p-2 border rounded" />
                    <input placeholder="Event Link (optional)" value={eventForm.link} onChange={e => setEventForm({ ...eventForm, link: e.target.value })} className="w-full p-2 border rounded" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleEventSubmit} className="px-4 py-1 bg-[#4a772e] text-white rounded text-sm">Create Event</button>
                    <button onClick={() => setShowEventForm(false)} className="px-4 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* EVENT LIST */}
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-gray-600">No events scheduled.</p>
                ) : (
                  events.map(e => (
                    <div
                      key={e.id}
                      onClick={() => e.link && window.open(e.link, '_blank')}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${e.link ? 'bg-white hover:bg-[#f7f7e8]' : 'bg-gray-50'}`}
                    >
                      <h4 className="font-bold text-[#4a772e]">{e.title}</h4>
                      <p className="text-sm text-gray-700">{e.location} • {format(new Date(e.date), 'PPP p')}</p>
                      <p className="text-xs mt-1 text-gray-600">{e.description}</p>
                      {e.link && <p className="text-xs text-blue-600 mt-2 underline">Click to open</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ADMIN MENU */}
        <div className="bg-[#f7f7e8] p-6 rounded-lg shadow space-y-3">
          <h3 className="text-xl font-bold text-[#4a772e] mb-4">Admin Tools</h3>
          <button onClick={() => setActiveTab('pending')} className={`w-full py-3 text-left font-bold border rounded transition ${activeTab === 'pending' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f]'}`}>
            Pending Books
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full py-3 text-left font-bold border rounded transition ${activeTab === 'users' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f]'}`}>
            List of Publishers
          </button>
          <button onClick={() => setActiveTab('events')} className={`w-full py-3 text-left font-bold border rounded transition ${activeTab === 'events' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f]'}`}>
            Upcoming Events
          </button>
        </div>
      </div>
    </div>
  );
}
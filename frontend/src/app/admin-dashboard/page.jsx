'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [data, setData] = useState({ kpis: {}, pending: [] });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [approvedBooks, setApprovedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  
  // User form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    user_category: 'researcher',
    university_name: '',
    is_active: true,
    is_staff: false
  });

  // Event form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    photo: null,
    photoPreview: null,
    photoUrl: null,
    icon: 'Calendar',
    link: ''
  });

  // Filter states for approved books
  const [filters, setFilters] = useState({
    title: '',
    university: '',
    author: '',
    category: ''
  });

  useEffect(() => {
    if (activeTab === 'pending') fetchDashboard();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'events') fetchEvents();
    else if (activeTab === 'approved') fetchApprovedBooks();
  }, [activeTab, filters]);

  // =========== FETCH FUNCTIONS ===========
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/dashboard/', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/users/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/events/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Error fetching events');
    }
    setLoading(false);
  };

  const fetchApprovedBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.title) queryParams.append('title', filters.title);
      if (filters.university) queryParams.append('university', filters.university);
      if (filters.author) queryParams.append('author', filters.author);
      if (filters.category) queryParams.append('category', filters.category);
      
      const res = await fetch(`http://localhost:8000/api/admin/approved-books/?${queryParams}`, { 
        credentials: 'include' 
      });
      
      if (res.ok) {
        const json = await res.json();
        setApprovedBooks(json.books || []);
      }
    } catch (error) {
      console.error('Error fetching approved books:', error);
    }
    setLoading(false);
  };

  // =========== PENDING BOOKS FUNCTIONS ===========
  const handleAction = async (id, action) => {
    if (action === 'reject' && !feedbackInput.trim()) {
      alert('Feedback required for rejection');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/upload/${id}/update/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          feedback: action === 'reject' ? feedbackInput : '' 
        }),
      });
      
      if (res.ok) {
        setData(prev => ({
          ...prev,
          pending: prev.pending.filter(p => p.id !== id),
          kpis: { ...prev.kpis, pending_count: prev.kpis.pending_count - 1 }
        }));
        setFeedbackInput('');
        setSelectedId(null);
        alert(`Book ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error handling book action:', error);
      alert('Error processing request');
    }
  };

  // =========== USER MANAGEMENT FUNCTIONS ===========
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      password: '',
      confirm_password: '',
      user_category: user.user_category || 'researcher',
      university_name: user.university_name || '',
      is_active: user.is_active,
      is_staff: user.is_staff || false
    });
    setShowUserForm(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    // Basic validation
    if (!userForm.username.trim()) {
      alert('Username is required');
      return;
    }
    if (!userForm.email.trim()) {
      alert('Email is required');
      return;
    }
    
    try {
      // Prepare data for update (don't send password if empty)
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirm_password;
      }
      
      const res = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'User updated successfully!');
        setShowUserForm(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'User deleted successfully!');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleCreateUser = async () => {
    // Validation
    if (!userForm.username.trim()) {
      alert('Username is required');
      return;
    }
    if (!userForm.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!userForm.password) {
      alert('Password is required');
      return;
    }
    if (userForm.password !== userForm.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/admin/users/create/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'User created successfully!');
        setShowUserForm(false);
        setUserForm({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          password: '',
          confirm_password: '',
          user_category: 'researcher',
          university_name: '',
          is_active: true,
          is_staff: false
        });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  // =========== EVENT MANAGEMENT FUNCTIONS ===========
  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('location', eventForm.location);
      formData.append('icon', eventForm.icon);
      formData.append('link', eventForm.link || '');
      
      if (eventForm.photo) {
        formData.append('photo', eventForm.photo);
      }
      
      const res = await fetch('http://localhost:8000/api/admin/events/create/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'Event created successfully!');
        setShowEventForm(false);
        setEventForm({
          title: '',
          description: '',
          date: '',
          location: '',
          photo: null,
          photoPreview: null,
          photoUrl: null,
          icon: 'Calendar',
          link: ''
        });
        fetchEvents();
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : '',
      location: event.location || '',
      photo: null,
      photoPreview: null,
      photoUrl: event.photo_url || null,
      icon: event.icon || 'Calendar',
      link: event.link || ''
    });
    setShowEventForm(true);
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('location', eventForm.location);
      formData.append('icon', eventForm.icon);
      formData.append('link', eventForm.link || '');
      
      if (eventForm.photo) {
        formData.append('photo', eventForm.photo);
      }
      
      const res = await fetch(`http://localhost:8000/api/admin/events/${editingEvent.id}/update/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'Event updated successfully!');
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm({
          title: '',
          description: '',
          date: '',
          location: '',
          photo: null,
          photoPreview: null,
          photoUrl: null,
          icon: 'Calendar',
          link: ''
        });
        fetchEvents();
      } else {
        alert(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${eventId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'Event deleted successfully!');
        fetchEvents();
      } else {
        alert(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  // =========== APPROVED BOOKS FUNCTIONS ===========
  const deleteBook = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/books/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Book deleted successfully!');
        fetchApprovedBooks();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  // =========== FILTER FUNCTIONS ===========
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      university: '',
      author: '',
      category: ''
    });
  };

  if (loading) return <div className="text-center py-10 text-[#4a772e] font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#E0F2FE] p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold text-[#4a772e] text-center mb-6">
        Website Management Dashboard
      </h2>

      {/* KPI SECTION */}
      {activeTab === 'pending' && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-[#8c9c6f] text-white p-4 md:p-6 rounded-lg shadow text-center flex-1 min-w-[150px] md:min-w-[200px]">
            <div className="text-2xl md:text-4xl font-bold">{data.kpis.total_users || 0}</div>
            <h3 className="text-sm md:text-base">Total Publishers</h3>
          </div>
          <div className="bg-[#8c9c6f] text-white p-4 md:p-6 rounded-lg shadow text-center flex-1 min-w-[150px] md:min-w-[200px]">
            <div className="text-2xl md:text-4xl font-bold">{data.kpis.total_books || 0}</div>
            <h3 className="text-sm md:text-base">Total Books</h3>
          </div>
          <div className="bg-[#8c9c6f] text-white p-4 md:p-6 rounded-lg shadow text-center flex-1 min-w-[150px] md:min-w-[200px]">
            <div className="text-2xl md:text-4xl font-bold">{data.kpis.pending_count || 0}</div>
            <h3 className="text-sm md:text-base">Pending Books</h3>
          </div>
          
          
          <div className="bg-[#8c9c6f] text-white p-4 md:p-6 rounded-lg shadow text-center flex-1 min-w-[150px] md:min-w-[200px]">
            <div className="text-2xl md:text-4xl font-bold">{data.kpis.pending_innovations_count || 0}</div>
            <h3 className="text-sm md:text-base">Pending Innovations</h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow">
          {/* PENDING BOOKS TAB */}
          {activeTab === 'pending' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#4a772e]">Pending Books/Projects</h3>
                  <p className="text-red-600 text-xs md:text-sm font-bold">
                    (Required Action: Review and Approve/Reject before publishing)
                  </p>
                </div>
                <div className="text-sm text-gray-600 mt-2 md:mt-0">
                  {data.pending?.length || 0} pending items
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {!data.pending || data.pending.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">No pending items to review.</p>
                  </div>
                ) : (
                  data.pending.map(item => (
                    <div key={item.id} className="bg-white border-2 border-[#e0e0b7] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* COVER IMAGE */}
                        <div className="md:w-48 md:h-64 bg-gray-100 flex items-center justify-center p-4">
                          {item.cover_image_url ? (
                            <img
                              src={`http://localhost:8000${item.cover_image_url}`}
                              alt={item.title}
                              className="max-w-full max-h-full object-contain rounded-lg shadow"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-gray-400">No Image</div>';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400">No Cover Image</div>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 p-4 md:p-6">
                          <h4 className="text-lg md:text-xl font-bold text-[#4a772e] mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Author:</span> {item.author_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Type:</span> {item.submission_type || 'Unknown'}
                          </p>

                          {/* CLICKABLE DOCUMENT */}
                          {item.file_url && (
                            <button
                              onClick={() => {
                                const url = `http://localhost:8000${item.file_url}`;
                                const ext = item.file_url.split('.').pop().toLowerCase();
                                
                                if (ext === 'pdf') {
                                  window.open(url, '_blank');
                                } else {
                                  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                                  window.open(viewerUrl, '_blank');
                                }
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition mb-4"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View Document
                            </button>
                          )}

                          {/* ACTION BUTTONS */}
                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              className="flex-1 sm:flex-none px-4 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedId(item.id)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-[#cc5555] text-white rounded-lg text-sm font-bold hover:bg-[#b33f3f] transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>

                          {/* REJECT FEEDBACK */}
                          {selectedId === item.id && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                              <label className="block text-sm font-medium text-red-800 mb-2">
                                Feedback for Rejection *
                              </label>
                              <textarea
                                value={feedbackInput}
                                onChange={e => setFeedbackInput(e.target.value)}
                                placeholder="Explain why this book is being rejected..."
                                className="w-full p-3 border border-red-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent "
                                rows="3"
                              />
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleAction(item.id, 'reject')}
                                  disabled={!feedbackInput.trim()}
                                  className={`px-4 py-2 rounded text-sm font-bold ${!feedbackInput.trim() ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
                                >
                                  Send Feedback & Reject
                                </button>
                                <button
                                  onClick={() => { setSelectedId(null); setFeedbackInput(''); }}
                                  className="px-4 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 transition-colors"
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

          {/* APPROVED BOOKS TAB */}
          {activeTab === 'approved' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">Approved Books/Projects</h3>
                <div className="text-sm text-gray-600 mt-1 md:mt-0">
                  Total: {approvedBooks.length} books
                </div>
              </div>

              {/* FILTERS */}
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="font-bold text-[#4a772e] mb-3">Filter Books</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <input 
                    placeholder="Search by title" 
                    value={filters.title}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                  />
                  <input 
                    placeholder="University" 
                    value={filters.university}
                    onChange={(e) => handleFilterChange('university', e.target.value)}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                  />
                  <input 
                    placeholder="Author name" 
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                  />
                  <input 
                    placeholder="Category" 
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="p-2 border rounded text-sm focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Filters
                  </button>
                  <div className="text-xs text-gray-500">
                    {Object.values(filters).some(f => f) ? 'Filtered results' : 'All approved books'}
                  </div>
                </div>
              </div>

              {/* APPROVED BOOKS LIST */}
              <div className="space-y-4">
                {approvedBooks.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">
                      {Object.values(filters).some(f => f) 
                        ? 'No books match your filters' 
                        : 'No approved books found'}
                    </p>
                    {Object.values(filters).some(f => f) && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 px-3 py-1 text-sm text-[#4a772e] hover:text-[#3a5f24]"
                      >
                        Clear filters to see all books
                      </button>
                    )}
                  </div>
                ) : (
                  approvedBooks.map(book => (
                    <div key={book.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Cover Image */}
                          <div className="md:w-32 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {book.cover_image_url ? (
                              <img
                                src={`http://localhost:8000${book.cover_image_url}`}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">No Cover</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Cover
                              </div>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <h4 className="text-lg font-bold text-[#4a772e]">{book.title}</h4>
                              <button
                                onClick={() => deleteBook(book.id, book.title)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-bold hover:bg-red-200 transition-colors flex items-center gap-1 self-start"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <span className="font-medium">Author:</span> {book.author || 'Unknown'}
                              </div>
                              <div>
                                <span className="font-medium">Supervisor:</span> {book.supervisor || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">University:</span> {book.university || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Year:</span> {book.year || 'Unknown'}
                              </div>
                              <div>
                                <span className="font-medium">Category:</span> {book.category || 'Unknown'}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Rating:</span>
                                <span className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < Math.floor(book.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-1 text-gray-600">({(book.rating || 0).toFixed(1)})</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                {book.likes_count || 0} Likes
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {book.views_count || 0} Views
                              </span>
                              {book.uploaded_at && (
                                <span className="text-xs text-gray-500">
                                  Approved: {format(new Date(book.uploaded_at), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">{book.description || 'No description available'}</p>
                            
                            {/* View Document Button */}
                            {book.file_url && (
                              <div className="mt-3">
                                <button
                                  onClick={() => {
                                    const url = `http://localhost:8000${book.file_url}`;
                                    const ext = book.file_url.split('.').pop().toLowerCase();
                                    if (ext === 'pdf') {
                                      window.open(url, '_blank');
                                    } else {
                                      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                                      window.open(viewerUrl, '_blank');
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  View Document
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">User Management</h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                      username: '',
                      email: '',
                      first_name: '',
                      last_name: '',
                      phone_number: '',
                      password: '',
                      confirm_password: '',
                      user_category: 'researcher',
                      university_name: '',
                      is_active: true,
                      is_staff: false
                    });
                    setShowUserForm(true);
                  }}
                  className="px-4 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition-colors flex items-center gap-2 mt-2 md:mt-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New User
                </button>
              </div>

              {/* EDIT/CREATE USER FORM */}
              {showUserForm && (
                <div className="mb-6 p-4 md:p-6 bg-white rounded-xl border-2 border-[#e0e0b7] shadow-lg">
                  <h4 className="text-lg font-bold text-[#4a772e] mb-4">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1 */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="Username" 
                          value={userForm.username} 
                          onChange={e => setUserForm({ ...userForm, username: e.target.value })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="email"
                          placeholder="Email address" 
                          value={userForm.email} 
                          onChange={e => setUserForm({ ...userForm, email: e.target.value })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input 
                          type="text"
                          placeholder="First name" 
                          value={userForm.first_name} 
                          onChange={e => setUserForm({ ...userForm, first_name: e.target.value })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input 
                          type="text"
                          placeholder="Last name" 
                          value={userForm.last_name} 
                          onChange={e => setUserForm({ ...userForm, last_name: e.target.value })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Column 2 */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                          type="tel"
                          placeholder="Phone number" 
                          value={userForm.phone_number} 
                          onChange={e => setUserForm({ ...userForm, phone_number: e.target.value })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User Category <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={userForm.user_category} 
                          onChange={e => setUserForm({ ...userForm, user_category: e.target.value, is_staff: e.target.value === 'admin' })} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        >
                          <option value="researcher">Researcher</option>
                          <option value="university">University</option>
                          <option value="conf_organizer">Conference Organizer</option>
                          <option value="public_visitor">Public Visitor</option>
                          <option value="admin">Admin</option>
                          <option value="innovator">Innovator</option>
                        </select>
                      </div>
                      
                      {userForm.user_category === 'university' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                          <input 
                            type="text"
                            placeholder="University name" 
                            value={userForm.university_name} 
                            onChange={e => setUserForm({ ...userForm, university_name: e.target.value })} 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      {!editingUser && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="password"
                              placeholder="Password" 
                              value={userForm.password} 
                              onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="password"
                              placeholder="Confirm password" 
                              value={userForm.confirm_password} 
                              onChange={e => setUserForm({ ...userForm, confirm_password: e.target.value })} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                              required
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={userForm.is_active} 
                            onChange={e => setUserForm({ ...userForm, is_active: e.target.checked })} 
                            className="w-4 h-4 text-[#4a772e] rounded focus:ring-[#4a772e]"
                          />
                          <span className="text-sm font-medium">Active Account</span>
                        </label>
                        
                        {userForm.user_category === 'admin' && (
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={userForm.is_staff} 
                              onChange={e => setUserForm({ ...userForm, is_staff: e.target.checked })} 
                              className="w-4 h-4 text-[#4a772e] rounded focus:ring-[#4a772e]"
                            />
                            <span className="text-sm font-medium">Staff Access</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                    <button 
                      onClick={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                        setUserForm({
                          username: '',
                          email: '',
                          first_name: '',
                          last_name: '',
                          phone_number: '',
                          password: '',
                          confirm_password: '',
                          user_category: 'researcher',
                          university_name: '',
                          is_active: true,
                          is_staff: false
                        });
                      }} 
                      className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={editingUser ? handleUpdateUser : handleCreateUser} 
                      className="px-5 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition-colors"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </div>
              )}

              {/* USER LIST */}
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">No users found.</p>
                  </div>
                ) : (
                  users.map(user => (
                    <div key={user.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-[#4a772e] text-lg">{user.username}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1">
                              
                              {user.is_staff && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  Staff
                                </span>
                              )}
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                {user.user_category }
                              </span>
                            </div>
                          </div>
                          
                          {/* User Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                            <div>
                              <span className="font-medium">Name:</span> {user.first_name || 'N/A'} {user.last_name || ''}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {user.phone_number || 'N/A'}
                            </div>
                            {user.university_name && (
                              <div>
                                <span className="font-medium">University:</span> {user.university_name}
                              </div>
                            )}
                          </div>
                          
                          {/* Dates */}
                          <div className="mt-2 text-xs text-gray-500">
                            <span>Joined: {format(new Date(user.date_joined), 'MMM d, yyyy')}</span>
                            {user.last_login && (
                              <span className="ml-3">Last login: {format(new Date(user.last_login), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3 md:mt-0">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EVENTS MANAGEMENT TAB */}
          {activeTab === 'events' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">Events Management</h3>
                <button
                  onClick={() => {
                    setShowEventForm(true);
                    setEditingEvent(null);
                    setEventForm({
                      title: '',
                      description: '',
                      date: '',
                      location: '',
                      photo: null,
                      photoPreview: null,
                      photoUrl: null,
                      icon: 'Calendar',
                      link: ''
                    });
                  }}
                  className="px-4 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition-colors flex items-center gap-2 mt-2 md:mt-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Event
                </button>
              </div>

              {/* ADD/EDIT EVENT FORM */}
              {showEventForm && (
                <div className="mb-6 p-4 md:p-6 bg-white rounded-xl border-2 border-[#e0e0b7] shadow-lg">
                  <h4 className="text-lg font-bold text-[#4a772e] mb-4">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Photo
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {(eventForm.photoPreview || eventForm.photoUrl) ? (
                          <div className="relative">
                            <img 
                              src={eventForm.photoPreview || eventForm.photoUrl} 
                              alt="Event preview" 
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEventForm(prev => ({ 
                                  ...prev, 
                                  photo: null, 
                                  photoPreview: null,
                                  photoUrl: null
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : null}
                        
                        <div className="flex-1">
                          <input
                            type="file"
                            id="event-photo"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                  alert('File size should be less than 5MB');
                                  return;
                                }
                                const previewUrl = URL.createObjectURL(file);
                                setEventForm(prev => ({ 
                                  ...prev, 
                                  photo: file, 
                                  photoPreview: previewUrl 
                                }));
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="event-photo"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {eventForm.photo || eventForm.photoUrl ? 'Change Photo' : 'Upload Photo'}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended: 800x400px, JPG or PNG format (max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Event title"
                          value={eventForm.title}
                          onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date & Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.date}
                          onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Event location"
                          value={eventForm.location}
                          onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <select
                          value={eventForm.icon}
                          onChange={e => setEventForm({ ...eventForm, icon: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        >
                          <option value="Calendar">Calendar</option>
                          <option value="Conference">Conference</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Seminar">Seminar</option>
                          <option value="Webinar">Webinar</option>
                          <option value="Party">Party</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Event description"
                        value={eventForm.description}
                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                        rows="4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Link (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://example.com/event"
                        value={eventForm.link}
                        onChange={e => setEventForm({ ...eventForm, link: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a772e] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                        setEventForm({
                          title: '',
                          description: '',
                          date: '',
                          location: '',
                          photo: null,
                          photoPreview: null,
                          photoUrl: null,
                          icon: 'Calendar',
                          link: ''
                        });
                      }}
                      className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                      className="px-5 py-2 bg-[#4a772e] text-white rounded-lg text-sm font-bold hover:bg-[#3a5f24] transition-colors"
                    >
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </div>
              )}

              {/* EVENT LIST */}
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">No events scheduled.</p>
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Event Photo */}
                        {event.photo_url && (
                          <div className="md:w-48 flex-shrink-0">
                            <img
                              src={`http://localhost:8000${event.photo_url}`}
                              alt={event.title}
                              className="w-full h-48 md:h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Photo</div>';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 p-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full self-start">
                                  {event.icon || 'Calendar'}
                                </span>
                                <h4 className="font-bold text-[#4a772e] text-lg">{event.title}</h4>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-700 mb-2">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {format(new Date(event.date), 'PPP p')}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-700 line-clamp-2 mb-3">{event.description}</p>
                              
                              {event.link && (
                                <a
                                  href={event.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Event Link
                                </a>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3 md:mt-0">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id, event.title)}
                                className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ADMIN SIDEBAR MENU */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-[#4a772e] mb-4">Admin Tools</h3>
  <button 
    onClick={() => setActiveTab('pending')} 
    className={`w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 ${activeTab === 'pending' ? 'bg-[#8c9c6f] text-white' : 'bg-white text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]'}`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Pending Books
  </button>
  <button 
  onClick={() => window.location.href = '/admin-dashboard/pending-innovations'}
  className="w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Pending Innovations
  </button>
  <button 
  onClick={() => window.location.href = '/admin-dashboard/pending-events'}
  className="w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Pending Events
  </button>
          <button 
            onClick={() => setActiveTab('approved')} 
            className={`w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 ${activeTab === 'approved' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Approved Books
          </button>
           <button 
  onClick={() => window.location.href = '/admin-dashboard/approved-innovation'}
  className="w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  approved Innovations
  </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 ${activeTab === 'users' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            className={`w-full py-3 px-4 text-left font-bold border rounded-lg transition flex items-center gap-3 ${activeTab === 'events' ? 'bg-[#8c9c6f] text-white' : 'bg-[#d8e5c7] text-[#4a772e] border-[#8c9c6f] hover:bg-[#c4d5b0]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events Management
          </button>
        </div>
      </div>
    </div>
  );
}
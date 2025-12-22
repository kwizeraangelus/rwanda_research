'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';

export default function EventDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Edit Profile States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null, national_id: '', age: '', phone: '', degree: '', university: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    link: '',
    photo: null,
    icon: 'Calendar'
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchUserAndEvents();
  }, []);

  const fetchUserAndEvents = async () => {
    try {
      const [userRes, eventsRes] = await Promise.all([
        fetch('http://localhost:8000/api/me/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/my-events/', { credentials: 'include' })
      ]);

      if (!userRes.ok) throw new Error();
      const userData = await userRes.json();
      const eventsData = await eventsRes.json();
      setUser(userData);
      setEvents(eventsData);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      const file = files[0];
      setFormData(prev => ({ ...prev, photo: file }));
      setPhotoPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      const res = await fetch('http://localhost:8000/api/events/create/', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      if (res.ok) {
        const newEvent = await res.json();
        setEvents(prev => [newEvent, ...prev]);
        setShowUploadForm(false);
        setFormData({ title: '', description: '', date: '', location: '', link: '', photo: null, icon: 'Calendar' });
        setPhotoPreview(null);
        alert('Event created successfully!');
      } else {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err));
      }
    } catch {
      alert('Network error');
    } finally {
      setUploading(false);
    }
  };

  // Edit Profile Functions
  const openEditProfile = () => {
    setProfileForm({
      profile_image: null,
      national_id: user?.national_id || '',
      age: user?.age || '',
      phone: user?.phone || '',
      degree: user?.degree || '',
      university: user?.university || '',
    });
    setImagePreview(user?.profile_image ? `http://localhost:8000${user.profile_image}` : null);
    setShowEditProfile(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(profileForm).forEach(([k, v]) => {
      if (v) data.append(k, v);
    });

    const res = await fetch('http://localhost:8000/api/update/', {
      method: 'PATCH',
      credentials: 'include',
      body: data,
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setShowEditProfile(false);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-2xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header - Same Blue/Purple Gradient as Before */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
            <h1 className="text-2xl font-bold text-gray-800">Event Manager</h1>
          </div>
          <div className="bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-medium">
            {user?.user?.username}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Create Amazing Events</h3>
            <p className="text-amber-800 leading-relaxed">
              Workshops, conferences, meetups, webinars — share them all with the community!
            </p>
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            {showUploadForm ? 'Cancel' : 'Create New Event'}
          </button>

          {/* Event Upload Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Create New Event</h3>

              {photoPreview && (
                <div className="flex justify-center mb-6">
                  <img src={photoPreview} alt="Preview" className="w-full max-w-lg h-64 object-cover rounded-xl shadow-lg" />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input name="title" placeholder="Event Title *" value={formData.title} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                <textarea name="description" placeholder="Description *" rows="5" value={formData.description} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl resize-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="datetime-local" name="date" value={formData.date} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="location" placeholder="Location (e.g. Zoom, Nairobi)" value={formData.location} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                </div>

                <input name="link" placeholder="Registration Link (optional)" value={formData.link} onChange={handleInputChange} className="w-full p-4 border border-gray-300 rounded-xl" />

                <div className="grid grid-cols-2 gap-4">
                  <select name="icon" value={formData.icon} onChange={handleInputChange} className="p-4 border border-gray-300 rounded-xl">
                    <option>Calendar</option>
                    <option>Laptop</option>
                    <option>Users</option>
                    <option>GraduationCap</option>
                    <option>Presentation</option>
                  </select>
                  <input type="file" accept="image/*" onChange={handleInputChange} className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 file:bg-blue-600 file:text-white file:py-3 file:px-8 file:rounded-lg" />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg disabled:opacity-70"
                >
                  {uploading ? 'Creating...' : 'Publish Event'}
                </button>
              </form>
            </div>
          )}

          {/* My Events */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">My Events</h3>
            
            {events.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">No events yet. Create your first one!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {events.map(event => {
                  // Safe fallback if status is missing
                  const status = event.status || 'pending';
                  const statusDisplay = event.status_display || 
                    (status === 'pending' ? 'Pending' : 
                     status === 'approved' ? 'Approved' : 
                     status === 'rejected' ? 'Rejected' : 'Pending');

                  return (
                    <div key={event.id} className="group bg-white border-2 border-blue-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105 cursor-pointer relative">
                      {event.photo ? (
                        <img src={`http://localhost:8000${event.photo}`} alt={event.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 h-48 flex items-center justify-center text-6xl text-white">
                          {event.icon || 'Calendar'}
                        </div>
                      )}

                      {/* Status Badge - Now 100% safe */}
                      <div className={`absolute top-4 right-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg
                        ${status === 'approved' ? 'bg-emerald-600' : 
                          status === 'rejected' ? 'bg-red-600' : 
                          'bg-amber-600'}`}
                      >
                        {statusDisplay}
                      </div>

                      <div className="p-6">
                        <h4 className="font-bold text-xl text-gray-800 line-clamp-2">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          {event.date ? format(new Date(event.date), 'PPP • p') : 'No date'}
                        </p>
                        <p className="text-gray-700">{event.location || 'No location'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Sidebar - Same as Before */}
        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">My Profile</h3>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} alt="Profile" width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                {user?.user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-4 text-gray-700">
            <div><strong>Name:</strong> {user?.user?.username}</div>
            <div><strong>Email:</strong> {user?.user?.email}</div>
            {user?.national_id && <div><strong>ID:</strong> {user.national_id}</div>}
            {user?.phone && <div><strong>Phone:</strong> {user.phone}</div>}
            {user?.degree && <div><strong>Degree:</strong> {user.degree}</div>}
            {user?.university && <div><strong>University:</strong> {user.university}</div>}
          </div>
          <button onClick={openEditProfile} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal - 100% Same as Original */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h3>
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> :
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">No Image</div>}
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Choose Photo</span>
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfileForm({...profileForm, profile_image: file});
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }} className="hidden" />
                </label>
              </div>
              <input type="text" placeholder="National ID" value={profileForm.national_id} onChange={e => setProfileForm(p => ({...p, national_id: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" />
              <input type="number" placeholder="Age" value={profileForm.age} onChange={e => setProfileForm(p => ({...p, age: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" />
              <input type="tel" placeholder="Phone" value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" />
              <input type="text" placeholder="Degree" value={profileForm.degree} onChange={e => setProfileForm(p => ({...p, degree: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" />
              <input type="text" placeholder="University" value={profileForm.university} onChange={e => setProfileForm(p => ({...p, university: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Save</button>
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
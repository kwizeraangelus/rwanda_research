'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';

export default function InnovationDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [innovations, setInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Edit Profile States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null, national_id: '', age: '', phone: '', degree: '', university: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Innovation Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null,
    sponsorship_needed: 'no-need', // default: no-need, sponsored, unsponsored
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchUserAndInnovations();
  }, []);

  const fetchUserAndInnovations = async () => {
    try {
      const [userRes, innovationsRes] = await Promise.all([
        fetch('http://localhost:8000/api/me/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/my-innovations/', { credentials: 'include' })
      ]);

      if (!userRes.ok) throw new Error();
      const userData = await userRes.json();
      const innovationsData = await innovationsRes.json();
      setUser(userData);
      setInnovations(innovationsData);
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
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await fetch('http://localhost:8000/api/innovations/create/', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      if (res.ok) {
        const newInnovation = await res.json();
        setInnovations(prev => [newInnovation, ...prev]);
        setShowUploadForm(false);
        setFormData({ name: '', description: '', photo: null, sponsorship_needed: 'no-need' });
        setPhotoPreview(null);
        alert('Innovation submitted successfully!');
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

  // Edit Profile Functions (same as before)
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

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg"></div>
            <h1 className="text-2xl font-bold text-gray-800">Innovation Hub</h1>
          </div>
          <div className="bg-purple-50 text-purple-700 px-5 py-2 rounded-full font-medium">
            {user?.user?.username}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-purple-900 mb-3">Share Your Innovation</h3>
            <p className="text-purple-800 leading-relaxed">
              Submit your groundbreaking ideas, prototypes, research, or projects to inspire and attract support!
            </p>
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            {showUploadForm ? 'Cancel' : 'Submit New Innovation'}
          </button>

          {/* Innovation Submission Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Submit Innovation</h3>

              {photoPreview && (
                <div className="flex justify-center mb-6">
                  <img src={photoPreview} alt="Preview" className="w-full max-w-lg h-64 object-cover rounded-xl shadow-lg" />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  name="name"
                  placeholder="Name of Innovation *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl"
                />
                <textarea
                  name="description"
                  placeholder="Detailed Description *"
                  rows="6"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sponsorship Needed?</label>
                    <select
                      name="sponsorship_needed"
                      value={formData.sponsorship_needed}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl"
                    >
                      <option value="no-need">No Need</option>
                      <option value="unsponsored">Seeking Sponsor</option>
                      <option value="sponsored">Already Sponsored</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Innovation Photo</label>
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 file:bg-purple-600 file:text-white file:py-3 file:px-8 file:rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg disabled:opacity-70"
                >
                  {uploading ? 'Submitting...' : 'Submit Innovation'}
                </button>
              </form>
            </div>
          )}

          {/* My Innovations List */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">My Innovations</h3>

            {innovations.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">No innovations submitted yet. Share your first idea!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {innovations.map(innovation => {
                  const status = innovation.status || 'pending';
                  const statusText = 
                    status === 'approved' ? 'Approved' :
                    status === 'rejected' ? 'Rejected' : 'Pending';

                  const sponsorshipStatus = 
                    innovation.sponsorship_needed === 'sponsored' ? 'Sponsored' :
                    innovation.sponsorship_needed === 'unsponsored' ? 'Seeking Sponsor' :
                    'No Need';

                  const sponsorshipColor =
                    innovation.sponsorship_needed === 'sponsored' ? 'bg-emerald-600' :
                    innovation.sponsorship_needed === 'unsponsored' ? 'bg-orange-600' :
                    'bg-gray-600';

                  return (
                    <div key={innovation.id} className="group bg-white border-2 border-purple-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105 relative">
                      {innovation.photo ? (
                        <img src={`http://localhost:8000${innovation.photo}`} alt={innovation.name} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="bg-gradient-to-br from-purple-400 to-pink-500 h-48 flex items-center justify-center text-6xl text-white font-bold">
                          💡
                        </div>
                      )}

                      {/* Admin Status Badge */}
                      <div className={`absolute top-4 left-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg
                        ${status === 'approved' ? 'bg-emerald-600' : 
                          status === 'rejected' ? 'bg-red-600' : 
                          'bg-amber-600'}`}
                      >
                        {statusText}
                      </div>

                      {/* Sponsorship Badge */}
                      <div className={`absolute top-4 right-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg ${sponsorshipColor}`}>
                        {sponsorshipStatus}
                      </div>

                      <div className="p-6">
                        <h4 className="font-bold text-xl text-gray-800 line-clamp-2">{innovation.name}</h4>
                       <p className="text-sm text-gray-600 mt-2">
  Submitted{' '}
  {innovation.created_at && !isNaN(new Date(innovation.created_at))
    ? format(new Date(innovation.created_at), 'PPP')
    : 'Unknown date'}
</p>

                        <p className="text-gray-700 mt-3 line-clamp-3">{innovation.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">My Profile</h3>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500 shadow-xl">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} alt="Profile" width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-full h-full flex items-center justify-center text-white text-5xl font-bold">
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
          <button onClick={openEditProfile} className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal (unchanged) */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h3>
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 mb-4">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> :
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">No Image</div>}
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">Choose Photo</span>
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
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl">Save</button>
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
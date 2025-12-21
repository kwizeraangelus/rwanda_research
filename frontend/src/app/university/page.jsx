'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ACADEMIC_FIELDS = [
  'Engineering', 'Medicine/Health Sciences', 'Arts & Humanities', 'Natural Sciences', 'Social Sciences',
  'Business & Economics', 'Computer Science/IT', 'Medicine', 'Agriculture', 'Education', 'IOT'
];

export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Step-by-step states
  const [degreeType, setDegreeType] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [showOtherField, setShowOtherField] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null, age: '', phone: '', location: '', university: '', details: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    submission_type: '',
    submission_type: '',
    university_name: '',
    title: '',
    authors: '',
    year: '',
    description: '',
    file: null,
    supervisor_name: '',
    other_field: ''
  });

  useEffect(() => {
    fetchUserAndUploads();
  }, []);

  const fetchUserAndUploads = async () => {
    try {
      const [userRes, uploadsRes] = await Promise.all([
        fetch('http://localhost:8000/api/me/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/my-uploads/', { credentials: 'include' })
      ]);
      if (!userRes.ok) throw new Error();
      setUser(await userRes.json());
      setUploads(await uploadsRes.json());
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    const value = e.target.value;
    setSelectedField(value);
    setShowOtherField(value === 'other');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  useEffect(() => {
    if (degreeType && selectedField && selectedField !== 'other') {
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${selectedField}`
      }));
    } else if (degreeType && selectedField === 'other' && formData.other_field) {
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${formData.other_field.toLowerCase().replace(/\s+/g, '_')}`
      }));
    }
  }, [degreeType, selectedField, formData.other_field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.submission_type) {
      alert('Please complete all steps');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('submission_type', formData.submission_type);
    data.append('university', formData.university_name);
    data.append('title', formData.title);
    data.append('authors', formData.authors);
    data.append('year', formData.year);
    data.append('description', formData.description);
    data.append('supervisor_name', formData.supervisor_name);
    if (formData.file) data.append('file', formData.file);

    try {
      const res = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      if (res.ok) {
        const newUpload = await res.json();
        setUploads(prev => [newUpload, ...prev]);
        setShowUploadForm(false);
        resetForm();
        alert('Research submitted successfully!');
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

  const resetForm = () => {
    setDegreeType('');
    setSelectedField('');
    setShowOtherField(false);
    setFormData({
      submission_type: '', university_name: '', title: '', authors: '',
      year: '', description: '', file: null, supervisor_name: '', other_field: ''
    });
  };

  const openEditProfile = () => {
    setProfileForm({
      profile_image: null,
      details: user?.details || '',
      age: user?.age || '',
      phone: user?.phone || '',
      location: user?.location || '',
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
      alert('Profile updated!');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-amber-600';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-semibold text-gray-600">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Research Portal</h1>
          <div className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full font-medium">
            {user?.user?.username}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 h-[calc(100vh-120px)]">

        {/* BODY — SCROLLABLE */}
        <div className="lg:col-span-2 space-y-10 overflow-y-auto pr-4">

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Important Guidelines</h3>
            <p className="text-amber-800">
              Submit original work only. Review within 48 hours.
            </p>
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition"
          >
            🎓 {showUploadForm ? 'Cancel' : 'Upload New Research'}
          </button>

          {/* Upload Form - unchanged for brevity */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Submit Your Research</h3>
              {/* ... your existing upload form steps ... */}
              {formData.submission_type && (
                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  {/* ... form fields ... */}
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg disabled:opacity-70"
                  >
                    {uploading ? 'Submitting...' : 'Submit Research'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* UPLOADS */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-center mb-8">My Uploads</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {uploads.map(upload => (
                <div key={upload.id} className="rounded-2xl shadow-lg border-2 border-emerald-200 bg-emerald-50">
                  <div className="p-6 text-center">
                    <h4 className="font-bold">{upload.title}</h4>
                    <span className={`inline-block mt-3 px-4 py-2 rounded-full text-white text-sm ${getStatusBadge(upload.status)}`}>
                      {upload.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROFILE — STATIC */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border sticky top-24 h-fit">
          <h3 className="text-2xl font-bold text-center mb-6">My Profile</h3>

          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-emerald-500">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} width={128} height={128} alt="Profile" unoptimized />
            ) : (
              <div className="bg-emerald-500 w-full h-full flex items-center justify-center text-white text-3xl">
                User
              </div>
            )}
          </div>

          <div className="space-y-3 text-gray-700">
            <div><strong>Name:</strong> {user?.user?.username}</div>
            <div><strong>Email:</strong> {user?.user?.email}</div>
            {user?.phone && <div><strong>Phone:</strong> {user.phone}</div>}
            {user?.location && <div><strong>Location:</strong> {user.location}</div>}
            {user?.university && <div><strong>University:</strong> {user.university}</div>}
            {user?.details && (
              <div>
                <strong>Descrition:</strong>
                <p className="mt-2 text-gray-600 leading-relaxed break-words whitespace-pre-wrap">
                  {user.details}
                </p>
              </div>
            )}
          </div>

          <button
            className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal - FIXED SCROLL ISSUE */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 max-h-screen overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h3>
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                    {imagePreview ? 
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> :
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    }
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Choose Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileForm({...profileForm, profile_image: file});
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <input 
                  type="number" 
                  placeholder="Age" 
                  value={profileForm.age} 
                  onChange={e => setProfileForm(p => ({...p, age: e.target.value}))} 
                  className="w-full p-4 border border-gray-300 rounded-xl" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={profileForm.phone} 
                  onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} 
                  className="w-full p-4 border border-gray-300 rounded-xl" 
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={profileForm.location} 
                  onChange={e => setProfileForm(p => ({...p, location: e.target.value}))} 
                  className="w-full p-4 border border-gray-300 rounded-xl" 
                />
                <input 
                  type="text" 
                  placeholder="University" 
                  value={profileForm.university} 
                  onChange={e => setProfileForm(p => ({...p, university: e.target.value}))} 
                  className="w-full p-4 border border-gray-300 rounded-xl" 
                />
                <textarea
                  placeholder="Short bio or research interests (will be shown publicly)"
                  rows="5"
                  value={profileForm.details}
                  onChange={e => setProfileForm(p => ({ ...p, details: e.target.value }))}
                  className="w-full p-5 text-lg border-2 border-gray-300 rounded-xl resize-none"
                />

                {/* Buttons always visible at bottom */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6 sticky bottom-0 bg-white -mx-8 px-8 pb-8">
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEditProfile(false)} 
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

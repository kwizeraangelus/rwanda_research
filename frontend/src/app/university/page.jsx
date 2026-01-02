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

  // Step-by-step upload states
  const [degreeType, setDegreeType] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [showOtherField, setShowOtherField] = useState(false);

  // Profile edit modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null,
    age: '',
    phone: '',
    location: '',
    university: '',
    details: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password1: '',
    new_password2: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Form data for submission
  const [formData, setFormData] = useState({
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
      if (!userRes.ok) throw new Error('Failed to fetch user data');
      const userData = await userRes.json();
      const uploadsData = await uploadsRes.json();
      setUser(userData);
      setUploads(uploadsData);
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/login');
  };

  const handleFieldChange = (value) => {
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

  // Auto-generate submission_type
  useEffect(() => {
    if (degreeType && selectedField && selectedField !== 'other') {
      const cleanField = selectedField.toLowerCase().replace(/\s+/g, '_');
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${cleanField}`
      }));
    } else if (degreeType && selectedField === 'other' && formData.other_field.trim()) {
      const cleanField = formData.other_field.toLowerCase().replace(/\s+/g, '_');
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${cleanField}`
      }));
    } else if (!degreeType || !selectedField) {
      setFormData(prev => ({ ...prev, submission_type: '' }));
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
        alert('Error: ' + (err.detail || JSON.stringify(err)));
      }
    } catch {
      alert('Network error - please try again');
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
      age: user?.age || '',
      phone: user?.phone || '',
      location: user?.location || '',
      university: user?.university || '',
      details: user?.details || '',
    });
    setImagePreview(user?.profile_image ? `http://localhost:8000${user.profile_image}` : null);
    setShowEditProfile(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(profileForm).forEach(([k, v]) => {
      if (v !== '' && v !== null) data.append(k, v);
    });

    try {
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
    } catch (err) {
      alert('Network error');
    }
  };

  // Password change handlers
  const openChangePassword = () => {
    setPasswordForm({ old_password: '', new_password1: '', new_password2: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowChangePassword(true);
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new_password1 !== passwordForm.new_password2) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.new_password1.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/change-password/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess('Password changed successfully!');
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordForm({ old_password: '', new_password1: '', new_password2: '' });
        }, 1800);
      } else {
        setPasswordError(
          data.old_password?.[0] ||
          data.new_password1?.[0] ||
          data.new_password2?.[0] ||
          data.detail ||
          'Failed to update password'
        );
      }
    } catch {
      setPasswordError('Network error - please try again');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-amber-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
            <h1 className="text-2xl font-bold text-gray-800">Research Portal</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-medium">
              {user?.user?.username || 'User'}
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Important Guidelines</h3>
            <p className="text-amber-800 leading-relaxed">
              Submit original work only. Include Abstract, Introduction, Methodology, Results, Conclusion & References. Review within 48 hours.
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              if (!showUploadForm) resetForm();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🎓</span> {showUploadForm ? 'Cancel Upload' : 'Upload New Research'}
          </button>

          {/* Smart Upload Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Submit Your Research</h3>

              {/* Step 1: Degree Type */}
              {!degreeType && (
                <div className="text-center mb-12">
                  <p className="text-xl font-semibold text-gray-700 mb-8">What type of academic work are you submitting?</p>
                  <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                    <button onClick={() => setDegreeType('thesis')} className="py-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-2xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition">
                      Thesis
                    </button>
                    <button onClick={() => setDegreeType('dissertation')} className="py-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition">
                      Dissertation
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Field Selection */}
              {degreeType && !selectedField && (
                <div className="text-center overflow-y-auto max-h-96 pb-4">
                  <p className="text-xl font-semibold text-gray-700 mb-8">Select your field of study</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {ACADEMIC_FIELDS.map(field => (
                      <button
                        key={field}
                        onClick={() => handleFieldChange(field.toLowerCase().replace(/\s+/g, '_'))}
                        className="py-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-500 text-blue-800 font-bold rounded-xl transition transform hover:scale-105 shadow-md"
                      >
                        {field}
                      </button>
                    ))}
                    <button
                      onClick={() => handleFieldChange('other')}
                      className="py-6 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-500 font-bold rounded-xl transition hover:scale-105"
                    >
                      Other
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Custom Field */}
              {showOtherField && !formData.other_field.trim() && (
                <div className="max-w-md mx-auto mt-8">
                  <input
                    type="text"
                    placeholder="Enter your field (e.g., Psychology)"
                    value={formData.other_field}
                    className="w-full p-5 text-lg border-2 border-blue-300 rounded-xl focus:border-blue-600 outline-none"
                    onChange={(e) => setFormData(prev => ({ ...prev, other_field: e.target.value }))}
                  />
                </div>
              )}

              {/* Final Form */}
              {formData.submission_type && (
                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center sticky top-0 z-10 -mx-8 px-8">
                    <p className="text-sm text-blue-600">Selected Category</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {degreeType.charAt(0).toUpperCase() + degreeType.slice(1)} -{' '}
                      {selectedField === 'other' ? formData.other_field : selectedField.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <input name="university_name" placeholder="University Name *" value={formData.university_name} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="title" placeholder="Title *" value={formData.title} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="authors" placeholder="Authors *" value={formData.authors} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="supervisor_name" placeholder="Supervisor Name *" value={formData.supervisor_name} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl bg-blue-50" />
                  <input name="year" type="number" placeholder="Year *" value={formData.year} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <textarea name="description" placeholder="Brief description / Abstract *" rows={4} value={formData.description} onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl resize-none" />
                  <input type="file" name="file" accept=".pdf,.doc,.docx" onChange={handleInputChange} required className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 file:bg-blue-600 file:text-white file:py-3 file:px-8 file:rounded-lg" />

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition"
                  >
                    {uploading ? 'Submitting...' : 'Submit Research'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* My Uploads */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">My Uploads</h3>
            {uploads.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">No uploads yet. Start sharing your research!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {uploads.map(upload => (
                  <div
                    key={upload.id}
                    onClick={() => router.push(`/book/${upload.id}`)}
                    className="cursor-pointer group transform transition-all hover:scale-105"
                  >
                    <div
                      className="rounded-2xl overflow-hidden shadow-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 relative"
                      style={{ borderColor: upload.status === 'approved' ? '#10b981' : upload.status === 'rejected' ? '#ef4444' : '#f59e0b' }}
                    >
                      <div className="h-64 flex flex-col items-center justify-center">
                        <span className="text-9xl">🎓</span>
                        <p className="text-2xl font-medium text-gray-600 mt-4">THESIS</p>
                      </div>
                      <div className={`absolute top-4 right-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg ${getStatusBadge(upload.status)}`}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <h4 className="font-bold text-gray-800 text-lg line-clamp-2">{upload.title}</h4>
                      <p className="text-gray-600 mt-1">{upload.year}</p>
                      {upload.supervisor_name && <p className="text-sm text-blue-700 mt-2">Supervisor: {upload.supervisor_name}</p>}

                      {upload.feedback && (
                        <div className={`mt-4 p-4 rounded-xl text-sm font-medium border-l-4 ${upload.status === 'rejected' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
                          <p className="font-bold">{upload.status === 'rejected' ? 'Reason:' : 'Note:'}</p>
                          <p className="mt-1 whitespace-pre-wrap">{upload.feedback}</p>
                        </div>
                      )}

                      {upload.status === 'approved' && !upload.feedback && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm">
                          Congratulations! Your work is now public.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border sticky top-24">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">My Profile</h3>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} alt="Profile" width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                {user?.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="space-y-4 text-gray-700">
            <div><strong>Name:</strong> {user?.user?.username}</div>
            <div><strong>Email:</strong> {user?.user?.email}</div>
            {user?.age && <div><strong>Age:</strong> {user.age}</div>}
            {user?.phone && <div><strong>Phone:</strong> {user.phone}</div>}
            {user?.location && <div><strong>campus:</strong> {user.location}</div>}
            {user?.university && <div><strong>University:</strong> {user.university}</div>}
            {user?.details && (
              <div>
                <strong>Bio:</strong>
                <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">{user.details}</p>
              </div>
            )}
          </div>

          <button
            onClick={openEditProfile}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
          >
            Edit Profile
          </button>

          <button
            onClick={openChangePassword}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h3>
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProfileForm(prev => ({ ...prev, profile_image: file }));
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <input 
                type="tel" 
                placeholder="Phone" 
                value={profileForm.phone} 
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} 
                className="w-full p-4 border border-gray-300 rounded-xl" 
              />
            
              <input 
                type="text" 
                placeholder="University" 
                value={profileForm.university} 
                onChange={e => setProfileForm(p => ({ ...p, university: e.target.value }))} 
                className="w-full p-4 border border-gray-300 rounded-xl" 
              />
              
              <input 
                type="text" 
                placeholder="campus/college" 
                value={profileForm.location} 
                onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} 
                className="w-full p-4 border border-gray-300 rounded-xl" 
              />
              
              <textarea
                placeholder="Short bio (optional)"
                rows={4}
                value={profileForm.details}
                onChange={e => setProfileForm(p => ({ ...p, details: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl resize-none"
              />

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Save Changes</button>
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Password</h3>

            {passwordSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-xl text-center">
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-xl">
                {passwordError}
              </div>
            )}

            <form onSubmit={submitPasswordChange} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  name="new_password1"
                  value={passwordForm.new_password1}
                  onChange={handlePasswordInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="new_password2"
                  value={passwordForm.new_password2}
                  onChange={handlePasswordInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-600 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition"
                >
                  Update Password
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowChangePassword(false)} 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
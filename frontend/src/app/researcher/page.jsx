'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [researcher, setResearcher] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Profile edit modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    picture: null,
    platforms: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [newPlatform, setNewPlatform] = useState('');

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password1: '',
    new_password2: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Publication form data
  const [pubForm, setPubForm] = useState({
    type: 'journal',
    title: '',
    authors: [],
    info: '',
    doi_url: '',
    abstract: '',
    pdf: null
  });
  const [newAuthor, setNewAuthor] = useState('');

  // Backend base URL (you can move this to .env later)
  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, researcherRes, pubsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/me/`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/researcher/me/`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/publications/`, { credentials: 'include' })
      ]);

      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userData = await userRes.json();
      const researcherData = await researcherRes.json();
      const pubsData = await pubsRes.json();

      setUser(userData);
      setResearcher(researcherData);
      setPublications(pubsData);
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/accounts/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/login');
  };

  const addPlatform = () => {
    if (newPlatform.trim()) {
      setProfileForm(prev => ({
        ...prev,
        platforms: [...prev.platforms, newPlatform.trim()]
      }));
      setNewPlatform('');
    }
  };

  const removePlatform = (index) => {
    setProfileForm(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const openEditProfile = () => {
    setProfileForm({
      bio: researcher?.bio || '',
      picture: null,
      platforms: researcher?.academic_platforms?.map(p => p.platform_id) || []
    });
    setImagePreview(
      researcher?.picture
        ? researcher.picture.startsWith('http')
          ? researcher.picture
          : `${BACKEND_URL}${researcher.picture.startsWith('/') ? '' : '/'}${researcher.picture}`
        : null
    );
    setShowEditProfile(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('bio', profileForm.bio);
    if (profileForm.picture) data.append('picture', profileForm.picture);

    try {
      const res = await fetch(`${BACKEND_URL}/api/researcher/me/`, {
        method: 'PATCH',
        credentials: 'include',
        body: data,
      });

      if (res.ok) {
        const updatedResearcher = await res.json();

        // Sync platforms
        const currentPlatforms = researcher?.academic_platforms || [];
        const newPlatforms = profileForm.platforms || [];

        // Remove old platforms
        for (const plat of currentPlatforms) {
          if (!newPlatforms.includes(plat.platform_id)) {
            await fetch(`${BACKEND_URL}/api/researcher/platforms/${plat.platform_id}/`, {
              method: 'DELETE',
              credentials: 'include',
            });
          }
        }

        // Add new platforms
        for (const plat of newPlatforms) {
          if (!currentPlatforms.some(p => p.platform_id === plat)) {
            await fetch(`${BACKEND_URL}/api/researcher/platforms/`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ platform_id: plat })
            });
          }
        }

        // Refresh researcher data
        const updatedRes = await fetch(`${BACKEND_URL}/api/researcher/me/`, {
          credentials: 'include',
        });
        const finalResearcherData = await updatedRes.json();
        
        setResearcher(finalResearcherData);
        setShowEditProfile(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await res.json();
        alert('Failed to update profile: ' + (errorData.detail || JSON.stringify(errorData)));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving profile');
    }
  };

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
      const res = await fetch(`${BACKEND_URL}/api/change-password/`, {
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

  const addAuthor = () => {
    if (newAuthor.trim()) {
      setPubForm(prev => ({
        ...prev,
        authors: [...prev.authors, newAuthor.trim()]
      }));
      setNewAuthor('');
    }
  };

  const removeAuthor = (index) => {
    setPubForm(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const handlePubInput = (e) => {
    const { name, value, files } = e.target;
    setPubForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleAddPublication = async (e) => {
    e.preventDefault();
    setUploading(true);
    const data = new FormData();
    data.append('type', pubForm.type);
    data.append('title', pubForm.title);
    data.append('authors', JSON.stringify(pubForm.authors));
    data.append('info', pubForm.info);
    data.append('doi_url', pubForm.doi_url);
    data.append('abstract', pubForm.abstract);
    if (pubForm.pdf) data.append('pdf', pubForm.pdf);

    try {
      const res = await fetch(`${BACKEND_URL}/api/publications/`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      if (res.ok) {
        const newPub = await res.json();
        setPublications(prev => [newPub, ...prev]);
        setShowUploadForm(false);
        resetPubForm();
        alert('Publication added successfully!');
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || JSON.stringify(err)));
      }
    } catch {
      alert('Network error while adding publication');
    } finally {
      setUploading(false);
    }
  };

  const resetPubForm = () => {
    setPubForm({
      type: 'journal',
      title: '',
      authors: [],
      info: '',
      doi_url: '',
      abstract: '',
      pdf: null
    });
    setNewAuthor('');
  };

  // Helper to get correct profile image URL
  const getProfileImageSrc = () => {
    if (!researcher?.picture) return null;
    if (researcher.picture.startsWith('http')) return researcher.picture;
    return `${BACKEND_URL}${researcher.picture.startsWith('/') ? '' : '/'}${researcher.picture}`;
  };

  const profileSrc = getProfileImageSrc();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
            <h1 className="text-2xl font-bold text-gray-800">Researcher Portal</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-medium">
              {user?.username || 'User'}
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
              Submit original publications only. Include title, authors, info, DOI/URL, abstract & PDF if available.
            </p>
          </div>

          {/* Add Publication Button */}
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              if (!showUploadForm) resetPubForm();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">📄</span> {showUploadForm ? 'Cancel Add' : 'Add New Publication'}
          </button>

          {/* Add Publication Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Add Publication</h3>
              <form onSubmit={handleAddPublication} className="space-y-6">
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-4">Publication Type</p>
                  <div className="flex flex-wrap gap-6">
                    {['journal', 'conference', 'symposium', 'book', 'patent'].map(type => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={type}
                          checked={pubForm.type === type}
                          onChange={handlePubInput}
                          name="type"
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  name="title"
                  placeholder="Publication Title *"
                  value={pubForm.title}
                  onChange={handlePubInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl"
                />

                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Add Authors in Order</p>
                  <div className="flex gap-2">
                    <input
                      placeholder="Author Name"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="flex-1 p-4 border border-gray-300 rounded-xl"
                    />
                    <button type="button" onClick={addAuthor} className="px-6 py-4 bg-blue-600 text-white rounded-xl">
                      Add
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {pubForm.authors.map((author, i) => (
                      <li key={i} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                        {author}
                        <button type="button" onClick={() => removeAuthor(i)} className="text-red-600 hover:text-red-800">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <input
                  name="info"
                  placeholder="Journal Name / Conference Info / Publisher *"
                  value={pubForm.info}
                  onChange={handlePubInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl"
                />
                <input
                  name="doi_url"
                  placeholder="DOI / URL"
                  value={pubForm.doi_url}
                  onChange={handlePubInput}
                  className="w-full p-4 border border-gray-300 rounded-xl"
                />
                <textarea
                  name="abstract"
                  placeholder="Abstract / Description *"
                  rows={6}
                  value={pubForm.abstract}
                  onChange={handlePubInput}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none"
                />
                <input
                  type="file"
                  name="pdf"
                  accept=".pdf"
                  onChange={handlePubInput}
                  className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 file:bg-blue-600 file:text-white file:py-3 file:px-8 file:rounded-lg file:border-0 file:cursor-pointer"
                />

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {uploading ? 'Adding...' : 'Add Publication'}
                </button>
              </form>
            </div>
          )}

          {/* My Publications */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">My Publications</h3>
            {publications.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">No publications yet. Start adding!</p>
            ) : (
              <div className="space-y-8">
                {publications.map(pub => (
                  <div key={pub.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6">
                    <h4 className="font-bold text-gray-800 text-xl mb-2">{pub.title}</h4>
                    <p className="text-gray-600 capitalize mb-1">{pub.type}</p>
                    <p className="text-gray-700 mb-1">Authors: {pub.authors?.join(', ') || '—'}</p>
                    <p className="text-gray-700 mb-1">Info: {pub.info || '—'}</p>
                    {/* Status badge */}
  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
    pub.status === 'approved' ? 'bg-green-100 text-green-800' :
    pub.status === 'rejected' ? 'bg-red-100 text-red-800' :
    'bg-yellow-100 text-yellow-800'
  }`}>
    {pub.status.charAt(0).toUpperCase() + pub.status.slice(1)}
  </div>

  {pub.status === 'rejected' && pub.feedback && (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="font-medium text-red-800">Feedback:</p>
      <p className="text-red-700">{pub.feedback}</p>
    </div>
  )}
                    {pub.doi_url && (
                      <a href={pub.doi_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">
                        DOI/URL
                      </a>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4">
                      {pub.abstract && (
                        <button
                          onClick={() => alert(pub.abstract)}
                          className="text-blue-600 hover:underline"
                        >
                          View Abstract
                        </button>
                      )}
                      {pub.pdf && (
                        <a
                          href={`${BACKEND_URL}${pub.pdf.startsWith('/') ? '' : '/'}${pub.pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          PDF
                        </a>
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
            {profileSrc ? (
              <Image
                src={profileSrc}
                alt="Profile picture"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="space-y-4 text-gray-700">
            <div><strong>Name:</strong> {user?.username || '—'}</div>
            <div><strong>Email:</strong> {user?.email || '—'}</div>
            {researcher?.bio && (
              <div>
                <strong>Bio:</strong>
                <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">{researcher.bio}</p>
              </div>
            )}
            {researcher?.academic_platforms?.length > 0 && (
              <div>
                <strong>Academic Platforms:</strong>
                <ul className="mt-2 space-y-1">
                  {researcher.academic_platforms.map((p, i) => (
                    <li key={i} className="text-gray-600">{p.platform_id}</li>
                  ))}
                </ul>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Researcher Profile</h3>
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-xl">
                      No Image
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                    Choose Picture
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProfileForm(prev => ({ ...prev, picture: file }));
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                placeholder="Bio / CV / Resume"
                rows={6}
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl resize-none"
              />

              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Academic Platforms</p>
                <div className="flex gap-2">
                  <input
                    placeholder="e.g. ORCID: 0000-0002-2587-7963"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="flex-1 p-4 border border-gray-300 rounded-xl"
                  />
                  <button type="button" onClick={addPlatform} className="px-6 py-4 bg-blue-600 text-white rounded-xl">
                    Add
                  </button>
                </div>
                <ul className="mt-4 space-y-2">
                  {profileForm.platforms.map((plat, i) => (
                    <li key={i} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                      {plat}
                      <button type="button" onClick={() => removePlatform(i)} className="text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl"
                >
                  Cancel
                </button>
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
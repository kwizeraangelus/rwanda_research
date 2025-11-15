'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CATEGORIES = [
  'Engineering', 'Law', 'Finance', 'Innovation', 'IoT', 'Electrical',
  'Computer Science', 'Medicine', 'Agriculture', 'Education'
];

export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showOther, setShowOther] = useState(false);

  // Edit Profile Modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null,
    national_id: '',
    age: '',
    phone: '',
    degree: '',
    university: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    submission_type: '',
    submission_type_other: '',
    university_name: '',
    cover_image: null,
    title: '',
    authors: '',
    year: '',
    description: '',
    file: null,
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
      const userData = await userRes.json();
      const uploadsData = await uploadsRes.json();
      setUser(userData);
      setUploads(uploadsData);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'submission_type') {
      setShowOther(value === 'other');
    }
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!user?.profile_complete) {
      alert('Please fill your profile first!');
      setUploading(false);
      return;
    }

    const data = new FormData();
    data.append('submission_type', formData.submission_type || '');
    if (formData.submission_type === 'other') {
      data.append('submission_type_other', formData.submission_type_other || '');
    }
    if (['thesis', 'masters', 'bachelor'].includes(formData.submission_type)) {
      data.append('university_name', formData.university_name || '');
    }
    if (formData.cover_image) data.append('cover_image', formData.cover_image);
    if (formData.title) data.append('title', formData.title);
    if (formData.authors) data.append('authors', formData.authors);
    if (formData.year) data.append('year', formData.year);
    if (formData.description) data.append('description', formData.description);
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
        e.target.reset();
        setFormData({
          submission_type: '',
          submission_type_other: '',
          university_name: '',
          cover_image: null,
          title: '',
          authors: '',
          year: '',
          description: '',
          file: null,
        });
        setShowOther(false);
        alert('Submitted!');
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

  const openFile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusColor = (status) => {
    const map = {
      approved: 'border-green-600 bg-green-100',
      pending: 'border-orange-500 bg-yellow-100',
      rejected: 'border-red-600 bg-red-100',
      draft: 'border-gray-500 bg-gray-200',
    };
    return map[status] || 'border-gray-400 bg-gray-100';
  };

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

    const res = await fetch('http://localhost:8000/api/update/', {  // Fixed URL
      method: 'PATCH',
      credentials: 'include',
      body: data,
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setShowEditProfile(false);
      alert('Profile saved!');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#d8e5c7] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#d8e5c7] p-5">
      {/* Header */}
      <div className="bg-[#8c9c6f] p-3 rounded-t-lg flex justify-between items-center mb-5">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="bg-[#d8e5c7] text-[#4a772e] px-4 py-1 rounded font-bold">
          Logged in as: {user?.user?.username}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Upload Form */}
        <div className="md:col-span-2 bg-[#f7f7e8] p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-[#4a772e] mb-4">Upload New Research/Project</h2>

          <div className="bg-[#ffffdd] border border-[#e0e0b7] p-4 rounded mb-5 text-[#4a772e] text-sm">
            <h4 className="font-bold text-[#7a885d]">Important Upload Guidelines</h4>
            <p className="mt-2">
              ⚠️ Important Upload Guidelines
All submitted materials must be original work belonging to you or your organization. Submitting material created by others is strictly prohibited. The uploaded book/project must contain all essential components (abstract, introduction, methodology, results, conclusion, and references) to be considered valid. After submission, the Management Team reviews and approves the content for eligibility and quality (FR5). Confirmation or rejection will be sent within 48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Category</label>
              <select
                name="submission_type"
                value={formData.submission_type}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat.toLowerCase().replace(' ', '_')}>{cat}</option>
                ))}
                <option value="other">Other (specify)</option>
              </select>
            </div>

            {showOther && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Specify Other</label>
                <input
                  type="text"
                  name="submission_type_other"
                  value={formData.submission_type_other}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Quantum Computing"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}

            {['thesis', 'masters', 'bachelor'].includes(formData.submission_type) && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">University Name</label>
                <input
                  type="text"
                  name="university_name"
                  value={formData.university_name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1">Cover Image</label>
              <input type="file" name="cover_image" accept="image/*" onChange={handleInputChange} required className="w-full" />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Authors</label>
              <input
                type="text"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1900"
                max="2099"
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description (max 500)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"

                required
                className="w-full p-2 border rounded resize-vertical"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">File (PDF/DOCX)</label>
              <input type="file" name="file" accept=".pdf,.doc,.docx" onChange={handleInputChange} required className="w-full" />
            </div>

            <button type="submit" disabled={uploading} className="w-full py-3 bg-[#8c9c6f] text-white font-bold rounded hover:bg-[#7a885d] disabled:opacity-50">
              {uploading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Profile Section */}
        <div className="bg-[#f7f7e8] p-6 rounded-lg shadow text-center relative">
          <h3 className="text-xl font-bold text-[#4a772e] mb-4">My Profile</h3>

          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#8c9c6f]">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} alt="Profile" width={80} height={80} className="w-full h-full object-cover" unoptimized/>
            ) : (
              <div className="bg-gray-300 w-full h-full"></div>
            )}
          </div>

          <div className="text-left text-sm space-y-2">
            <div><span className="inline-block w-20 font-bold">Name:</span> {user?.user?.username}</div>
            <div><span className="inline-block w-20 font-bold">Email:</span> {user?.user?.email}</div>
            {user?.national_id && <div><span className="inline-block w-20 font-bold">ID:</span> {user.national_id}</div>}
            {user?.phone && <div><span className="inline-block w-20 font-bold">Phone:</span> {user.phone}</div>}
            {user?.degree && <div><span className="inline-block w-20 font-bold">Degree:</span> {user.degree}</div>}
            {user?.university && <div><span className="inline-block w-20 font-bold">Uni:</span> {user.university}</div>}
          </div>

          <button
            onClick={openEditProfile}
            className="mt-4 w-full py-2 bg-[#8c9c6f] text-white font-bold rounded hover:bg-[#7a885d] transition"
          >
            Edit Profile
          </button>
        </div>
      </div>

     {/* My Uploads — NEW DESIGN, SAME FUNCTION */}
<div className="mt-6 bg-[#f7f7e8] p-6 rounded-lg shadow">
  <h3 className="text-xl font-bold text-[#4a772e] mb-4">My Uploads</h3>

  {uploads.length === 0 ? (
    <p className="text-center text-gray-600 py-8">No uploads yet.</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
      {uploads.map(upload => (
        <div
          key={upload.id}
          className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          onClick={() => router.push(`/book/${upload.id}`)}// SAME FUNCTION
          title={`Click to open: ${upload.title}`}
        >
          {/* Book Card */}
          <div className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow">
            {upload.cover_image ? (
              <Image
                src={`http://localhost:8000${upload.cover_image}`}
                alt={upload.title}
                width={200}
                height={300}
                className="w-full h-64 object-cover"
                unoptimized
              />
            ) : (
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed rounded-t-xl w-full h-64 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">No Cover</span>
              </div>
            )}

            {/* Status Badge */}
            <div
              className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md
                ${upload.status === 'approved' ? 'bg-green-600' :
                  upload.status === 'rejected' ? 'bg-red-600' :
                  'bg-orange-500'}`}
            >
              {upload.status_display}
            </div>
          </div>

          {/* Title */}
          <h4 className="mt-2 text-sm font-semibold text-[#4a772e] truncate px-1 line-clamp-2">
            {upload.title}
          </h4>

          {/* Year */}
          <p className="text-xs text-gray-600 px-1">{upload.year}</p>

          {/* Admin Feedback */}
          {upload.feedback && (
  <div
    className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border
      ${upload.status === 'rejected'
        ? 'bg-red-50 text-red-700 border-red-300'
        : 'bg-yellow-50 text-yellow-700 border-yellow-300'
      }`}
  >
    <p className="truncate">{upload.feedback}</p>
  </div>
)}
        </div>
      ))}
    </div>
  )}
</div>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-[#4a772e] mb-4">Edit Profile</h3>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8c9c6f] mb-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="px-6 py-2 bg-[#8c9c6f] text-white rounded-lg hover:bg-[#7a885d] transition">
                    Choose Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileForm({ ...profileForm, profile_image: file });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                placeholder="National ID"
                value={profileForm.national_id}
                onChange={(e) => setProfileForm({ ...profileForm, national_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Degree"
                value={profileForm.degree}
                onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="University (Optional)"
                value={profileForm.university}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-[#8c9c6f] text-white font-bold rounded hover:bg-[#7a885d]">
                  Save
                </button>
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-2 bg-gray-400 text-white font-bold rounded hover:bg-gray-500">
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
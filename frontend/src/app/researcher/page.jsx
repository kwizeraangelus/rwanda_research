'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ACADEMIC_FIELDS = [
  'Engineering', 'Medicine/Health Sciences', 'Arts & Humanities', 'Natural Sciences', 'Social Sciences',
  'Business & Economics', 'Computer Science/IT', 'Medicine', 'Agriculture', 'Education','IOT'
];



export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Step-by-step states
  const [degreeType, setDegreeType] = useState(''); // 'thesis' or 'dissertation'
  const [selectedField, setSelectedField] = useState('');
  const [showOtherField, setShowOtherField] = useState(false);

  // Profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null, national_id: '', age: '', phone: '', degree: '', university: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Final form data
  const [formData, setFormData] = useState({
    submission_type: '',     // Will be "thesis-law", "dissertation-medicine", etc.
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

  // Generate final submission_type like "thesis-law" or "dissertation-engineering"
  useEffect(() => {
    if (degreeType && selectedField && selectedField !== 'other') {
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${selectedField.toLowerCase().replace(/\s+/g, '_')}`
      }));
    } else if (degreeType && selectedField === 'other' && formData.other_field) {
      const cleanField = formData.other_field.toLowerCase().replace(/\s+/g, '_');
      setFormData(prev => ({
        ...prev,
        submission_type: `${degreeType}-${cleanField}`
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
            <h1 className="text-2xl font-bold text-gray-800">Research Portal</h1>
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
            <h3 className="text-xl font-bold text-amber-900 mb-3">Important Guidelines</h3>
            <p className="text-amber-800 leading-relaxed">
              Submit original work only. Include Abstract, Introduction, Methodology, Results, Conclusion & References.
              Review within 48 hours.
            </p>
          </div>

          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              if (!showUploadForm) resetForm();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            Graduation Cap {showUploadForm ? 'Cancel' : 'Upload New Research'}
          </button>

          {/* SMART UPLOAD FORM */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Submit Your Research</h3>

              {/* STEP 1: Thesis or Dissertation? */}
              {!degreeType && (
                <div className="text-center mb-12">
                  <p className="text-xl font-semibold text-gray-700 mb-8">
                    What type of academic work are you submitting?
                  </p>
                  <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                    <button
                      onClick={() => setDegreeType('thesis')}
                      className="py-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-2xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition"
                    >
                      Thesis
                    </button>
                    <button
                      onClick={() => setDegreeType('dissertation')}
                      className="py-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition"
                    >
                      Dissertation
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Select Field */}
              {degreeType && !selectedField && (
                <div className="animate-fadeIn">
                  <p className="text-center text-xl font-semibold text-gray-700 mb-8">
                    Select your field of study
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {ACADEMIC_FIELDS.map(field => (
                      <button
                        key={field}
                        onClick={() => setSelectedField(field.toLowerCase().replace(/\s+/g, '_'))}
                        className="py-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-500 text-blue-800 font-bold rounded-xl transition transform hover:scale-105 shadow-md"
                      >
                        {field}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedField('other')}
                      className="py-6 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-500 font-bold rounded-xl transition hover:scale-105"
                    >
                      Other
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Other Field Input */}
              {selectedField === 'other' && !formData.other_field && (
                <div className="max-w-md mx-auto mt-8">
                  <input
                    type="text"
                    placeholder="Enter your field (e.g., Psychology)"
                    className="w-full p-5 text-lg border-2 border-blue-300 rounded-xl focus:border-blue-600 outline-none"
                    onChange={(e) => setFormData(prev => ({ ...prev, other_field: e.target.value }))}
                  />
                </div>
              )}

              {/* FINAL FORM */}
              {formData.submission_type && (
                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-blue-600">Category</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {degreeType.charAt(0).toUpperCase() + degreeType.slice(1)} - {selectedField === 'other' ? formData.other_field : selectedField.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <input name="university_name" placeholder="University Name *" onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="title" placeholder="Title *" onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="authors" placeholder="Authors *" onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />
                  <input name="supervisor_name" placeholder="Supervisor Name *" onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl bg-blue-50 font-medium" />
                  <input name="year" type="number" placeholder="Year *" onChange={handleInputChange} required className="w-full p-4 border border-gray-300 rounded-xl" />

                  <textarea
                    name="description"
                    placeholder="Brief description"
                    rows="4"
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none"
                  />

                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 file:bg-blue-600 file:text-white file:py-3 file:px-8 file:rounded-lg"
                  />

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

          {/* My Uploads */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">My Uploads</h3>
            {uploads.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">No uploads yet. Start sharing your research!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {uploads.map(upload => (
                  <div key={upload.id} onClick={() => router.push(`/book/${upload.id}`)} className="cursor-pointer group transform transition-all hover:scale-105">
                    <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-blue-200 bg-blue-50">
                      <div className="h-64 bg-white flex flex-col items-center justify-center border-b-2 border-gray-100">
                        <span className="text-9xl text-gray-300">Graduation Cap</span>
                        <p className="text-2xl font-medium text-gray-500 mt-4 tracking-wider">THESIS</p>
                      </div>
                      <div className={`absolute top-4 right-4 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg ${getStatusBadge(upload.status)}`}>
                        {upload.status_display || upload.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h4 className="font-bold text-gray-800 text-lg line-clamp-2">{upload.title}</h4>
                      <p className="text-gray-600 mt-1">{upload.year}</p>
                      {upload.supervisor_name && (
                        <p className="text-sm font-medium text-blue-700 mt-2">Supervisor: {upload.supervisor_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">My Profile</h3>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl">
            {user?.profile_image ? (
              <Image src={`http://localhost:8000${user.profile_image}`} alt="Profile" width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white text-5xl font-bold">User</div>
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

      {/* Edit Profile Modal */}
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
              <input type="text" placeholder="National ID" value={profileForm.national_id} onChange={e => setProfileForm(p => ({...p, national_id: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" required />
              <input type="number" placeholder="Age" value={profileForm.age} onChange={e => setProfileForm(p => ({...p, age: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" required />
              <input type="tel" placeholder="Phone" value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" required />
              <input type="text" placeholder="Degree" value={profileForm.degree} onChange={e => setProfileForm(p => ({...p, degree: e.target.value}))} className="w-full p-4 border border-gray-300 rounded-xl" required />
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
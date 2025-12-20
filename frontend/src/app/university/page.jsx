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

  const [degreeType, setDegreeType] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [showOtherField, setShowOtherField] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profile_image: null, national_id: '', age: '', phone: '', degree: '', university: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

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
      if (!userRes.ok) throw new Error();
      setUser(await userRes.json());
      setUploads(await uploadsRes.json());
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
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
            {showUploadForm ? 'Cancel Upload' : 'Upload New Research'}
          </button>

          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-100 p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Submit Research</h3>

              {!degreeType && (
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => setDegreeType('thesis')}
                    className="py-8 bg-gradient-to-br from-teal-600 to-emerald-600 text-white font-bold text-2xl rounded-2xl shadow-lg"
                  >
                    Thesis
                  </button>
                  <button
                    onClick={() => setDegreeType('dissertation')}
                    className="py-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-2xl rounded-2xl shadow-lg"
                  >
                    Dissertation
                  </button>
                </div>
              )}

              {degreeType && !selectedField && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  {ACADEMIC_FIELDS.map(field => (
                    <button
                      key={field}
                      onClick={() => setSelectedField(field.toLowerCase().replace(/\s+/g, '_'))}
                      className="py-5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-800 font-bold rounded-xl"
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}

              {formData.submission_type && (
                <button
                  className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-5 rounded-xl shadow-lg"
                >
                  Ready to Submit
                </button>
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
          </div>

          <button
            className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

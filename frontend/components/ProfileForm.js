// components/ProfileForm.js
import { useState } from 'react';

export default function ProfileForm({ profile, onUpdate }) {
  const [formData, setFormData] = useState({
    profile_image: null,
    national_id: profile.national_id || '',
    age: profile.age || '',
    phone: profile.phone || '',
    degree: profile.degree || '',
    orcid: profile.orcid || '',
    university: profile.university || '',
  });

  const [imagePreview, setImagePreview] = useState(
    profile.profile_image ? `http://127.0.0.1:8000${profile.profile_image}` : null
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    const res = await fetch('http://127.0.0.1:8000/api/update/', {
      method: 'PATCH',
      credentials: 'include',
      body: data,
    });

    if (res.ok) {
      onUpdate(); // Refresh profile
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 mb-3">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Choose Photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="National ID"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Degree"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="ORCID"
            value={formData.orcid}
            onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="University (Optional)"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // <-- REMOVED: Caused resolution error

export default function RegisterPage() {
  // const router = useRouter(); // <-- REMOVED

  const [user_category, setCategory] = useState('');
  const [showUniversity, setShowUniversity] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    university_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setShowUniversity(user_category === 'university');
    if (user_category !== 'university') {
      setFormData(prev => ({ ...prev, university_name: '' }));
    }
  }, [user_category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setPasswordError(false);
    setSuccess(false);

    if (password !== confirmPassword) {
      setPasswordError(true);
      return;
    }

    // FIX: Include password and confirmPassword in the data payload
    const submitData = {
      ...formData,
      user_category,
      password,
      confirm_password: confirmPassword,
      university_name: user_category === 'university' ? formData.university_name : '',
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // FIX: Use window.location.href for redirection
        setTimeout(() => {
          window.location.href = '/login'; 
        }, 1500);
      } else {
        // Log the full error to the console for easier debugging
        console.error("API Error Response:", data);
        setApiError(data.password?.[0] || data.confirm_password?.[0] || data.user_category?.[0] || data.errors?.non_field_errors?.[0] || data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error("Network or JSON Error:", error);
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d8e5c7] p-4">
      <div className="bg-[#f7f7e8] p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <h2 className="text-2xl font-bold text-center text-[#4a772e] mb-6">Register Account</h2>

        {/* Success Toast */}
        {success && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top duration-300 z-10">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* === Form fields === */}
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <input type="text" id="username" name="username" required value={formData.username} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input type="tel" id="phone_number" name="phone_number" placeholder="e.g., +250788123456" required value={formData.phone_number} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
          </div>

          <div>
            <label htmlFor="user_category" className="block text-sm font-bold text-gray-700 mb-1">User Category</label>
            <select id="user_category" name="user_category" required value={user_category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]">
              <option value="" disabled>Select your category</option>
              <option value="researcher">Researcher</option>
              <option value="university">University</option>
              <option value="conference_organizer">Conference Organizer</option>
              <option value="public_visitor">Public Visitor</option>
            </select>
          </div>

          {showUniversity && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="university-name" className="block text-sm font-bold text-gray-700 mb-1">University Name</label>
              <input type="text" id="university-name" name="university_name" required value={formData.university_name} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
            <input type="password" id="confirm-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]" />
            {passwordError && <p className="text-red-600 text-sm mt-1">Passwords do not match.</p>}
          </div>

          {apiError && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 mt-5 bg-[#8c9c6f] text-white font-bold rounded-md hover:bg-[#7a885d] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : success ? 'Redirecting...' : 'Register'}
          </button>
        </form>

        {/* Optional: Link to login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#4a772e] font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

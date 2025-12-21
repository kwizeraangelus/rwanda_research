'use client';

import { useState, useEffect } from 'react';

export default function RegisterPage() {
  const [user_category, setCategory] = useState('');
  const [showUniversity, setShowUniversity] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',    // ← Add
    last_name: '',
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

    const submitData = {
      ...formData,
      user_category,
      password,
      confirm_password: confirmPassword,
      university_name:
        user_category === 'university' ? formData.university_name : '',
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
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setApiError(
          data.password?.[0] ||
            data.confirm_password?.[0] ||
            data.user_category?.[0] ||
            data.message ||
            'Registration failed.'
        );
      }
    } catch (error) {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d8e5c7] p-4">
      <div className="bg-[#f7f7e8] p-8 rounded-xl shadow-lg w-full max-w-md relative">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[#FFD700] mb-6">
          Register Account
        </h2>

        {/* Success Toast */}
        {success && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* === Form fields === */}


          <div>
  <label htmlFor="first_name" className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
  <input
    type="text"
    id="first_name"
    name="first_name"
    required
    value={formData.first_name || ''}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]"
  />
</div>

<div>
  <label htmlFor="last_name" className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
  <input
    type="text"
    id="last_name"
    name="last_name"
    required
    value={formData.last_name || ''}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c9c6f]"
  />
</div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            />
          </div>
          

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              User Category
            </label>
            <select
              required
              value={user_category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            >
              <option value="" disabled>Select your category</option>
              <option value="researcher">Researcher</option>
              <option value="university">University</option>
              <option value="conf_organizer">Conference Organizer</option>
              <option value="public_visitor">Public Visitor</option>
              <option value="innovator">Innovator</option>
            </select>
          </div>

          {/* University */}
          {showUniversity && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                University Name
              </label>
              <input
                type="text"
                name="university_name"
                required
                value={formData.university_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            />
            {passwordError && (
              <p className="text-red-600 text-sm mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {apiError}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-24 h-16 mx-auto block mt-5 bg-[#FFD700] text-black text-lg font-bold rounded-md hover:bg-[#FBC02D] transition duration-300 disabled:opacity-50 flex items-center justify-center"
          >
            {loading || success ? '...' : 'Register'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#FFD700] font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

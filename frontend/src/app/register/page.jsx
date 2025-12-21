'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [user_category, setCategory] = useState('');
  const [showUniversity, setShowUniversity] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    university_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Colors (same as Login)
  const SOFT_SKY_BLUE = '#e0f7fa';
  const STRONG_YELLOW = '#FFD700';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setShowUniversity(user_category === 'university');
    if (user_category !== 'university') {
      setFormData((prev) => ({ ...prev, university_name: '' }));
    }
  }, [user_category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setPasswordError(false);

    if (password !== confirmPassword) {
      setPasswordError(true);
      return;
    }

    const submitData = {
      ...formData,
      user_category,
      password,
      confirm_password: confirmPassword,
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
          data.message ||
            data.password?.[0] ||
            data.confirm_password?.[0] ||
            'Registration failed'
        );
      }
    } catch {
      setApiError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-[${SOFT_SKY_BLUE}] p-4`}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Register
        </h2>

        {success && (
          <p className="text-green-600 text-center font-bold mb-4">
            Registration successful! Redirecting…
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-bold mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-bold mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold mb-1">Phone</label>
            <input
              type="tel"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-1">
              User Category
            </label>
            <select
              required
              value={user_category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            >
              <option value="">Select category</option>
              <option value="researcher">Researcher</option>
              <option value="university">University</option>
              <option value="conf_organizer">Conference Organizer</option>
              <option value="public_visitor">Public Visitor</option>
              <option value="innovator">Innovator</option>
            </select>
          </div>

          {showUniversity && (
            <div>
              <label className="block text-sm font-bold mb-1">
                University Name
              </label>
              <input
                type="text"
                name="university_name"
                required
                value={formData.university_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md font-bold focus:ring-2 focus:ring-[${STRONG_YELLOW}]`}
            />
            {passwordError && (
              <p className="text-red-600 text-sm">
                Passwords do not match
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-red-600 text-sm">{apiError}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-24 h-16 mx-auto block bg-[#FFD700] text-black text-lg font-bold rounded-md hover:bg-[#FBC02D] transition flex items-center justify-center"
          >
            {loading ? '...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className={`text-[${STRONG_YELLOW}] font-bold hover:underline`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

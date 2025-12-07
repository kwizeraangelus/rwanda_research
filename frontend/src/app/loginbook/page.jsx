'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginBookPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Show message if user came from a protected book
  useEffect(() => {
    const intended = localStorage.getItem('intendedBookId');
    if (intended) {
      setMessage('Please log in or register to continue reading this research');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin
      ? 'http://127.0.0.1:8000/api/auth/login/'
      : 'http://127.0.0.1:8000/api/auth/register/';

    const body = isLogin
      ? { email, password }                                            // Login: email + password
      : { username, email, phone_number: phone, password };           // Register: all fields

    console.log("SENDING →", body);  // Debug: see exactly what’s sent

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("RESPONSE →", data);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to the book they wanted
        const intendedBookId = localStorage.getItem('intendedBookId');
        if (intendedBookId) {
          localStorage.removeItem('intendedBookId');
          router.push(`/book/${intendedBookId}`);
        } else {
          router.push('/');
        }
      } else {
        setMessage(data.error || data.detail || Object.values(data)[0] || 'Something went wrong');
      }
    } catch (err) {
      setMessage('Network error — is Django running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Join Research Hub'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Log in to continue reading' : 'Create account to access full research'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-center p-4 rounded-lg mb-6 ${message.includes('Please log in') || message.includes('continue reading')
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* LOGIN: Email | REGISTER: Username */}
            {isLogin ? (
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            ) : (
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            )}

            {/* Email field — only in Register */}
            {!isLogin && (
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            )}

            {/* Phone — only in Register */}
            {!isLogin && (
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            )}

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setUsername('');
                  setEmail('');
                  setPhone('');
                  setPassword('');
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'Register here' : 'Log in here'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Rwanda Research Hub © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
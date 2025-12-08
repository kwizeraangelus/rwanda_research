// components/AuthModal.tsx
'use client';

import { useState } from 'react';
import { X, LogIn, UserPlus, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

interface UserData {
  id: number;
  username: string;
  email: string;
  user_category: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: UserData;
}

type ModalType = 'login' | 'signup';

interface AuthModalProps {
  type: ModalType;
  onClose: (switchTo?: ModalType) => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({ type, onClose, onAuthSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = type === 'login';

  const loginUser = async (data: { username: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  };

  const signupUser = async (data: { username: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      let msg = 'Signup failed';
      if (err.username) msg = err.username.join(', ');
      if (err.email) msg = err.email.join(', ');
      if (err.password) msg = err.password.join(', ');
      throw new Error(msg);
    }
    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (!isLogin && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response: AuthResponse = isLogin
        ? await loginUser({ username: formData.username, password: formData.password })
        : await signupUser({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      onAuthSuccess();
      alert(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-20 overflow-y-auto"
      onClick={() => onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl m-6 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {isLogin ? (
              <>
                <LogIn className="text-blue-600" size={32} />
                Log In
              </>
            ) : (
              <>
                <UserPlus className="text-green-600" size={32} />
                Create Account
              </>
            )}
          </h2>
          <button type="button" onClick={() => onClose()} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-green-500"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-green-500"
                disabled={loading}
              />
            </>
          )}

          {isLogin && (
            <input
              type="text"
              placeholder="Username or Email"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-500"
              disabled={loading}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-500"
            disabled={loading}
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-green-500"
              disabled={loading}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold text-lg rounded-xl transition-all ${
              isLogin
                ? 'bg-[#FFD700] hover:bg-yellow-400 text-black'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Processing...
              </span>
            ) : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </div>

        <div className="px-6 pb-8 text-center text-gray-600">
          <p className="text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => onClose(isLogin ? 'signup' : 'login')}
              className="font-bold text-blue-600 hover:underline"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
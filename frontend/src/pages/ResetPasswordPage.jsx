import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. No token provided.');
        setVerifying(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          setError(data.detail || 'Invalid or expired reset link.');
        }
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 size={48} className="animate-spin text-[#2d6d4c] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Verifying Reset Link...</h2>
          <p className="text-gray-500 mt-2">Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#2d6d4c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#2d6d4c]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#2d6d4c] hover:bg-[#43A047] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Home & Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            {error || 'This password reset link is invalid or has expired. Please request a new one.'}
          </p>
          <Link
            to="/"
            className="inline-block bg-[#2d6d4c] hover:bg-[#43A047] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }


  // Reset password form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d6d4c] to-[#3d8b66] p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-white/80 mt-1">Enter your new password for {email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d6d4c] hover:bg-[#43A047] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <Link to="/" className="text-[#2d6d4c] font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import { AuthService } from '../../services/authService';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      // Use the enhanced authentication service
      const authResponse = await AuthService.login(email, password);

      if (!authResponse.success || !authResponse.user || !authResponse.token) {
        setError(authResponse.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Store user in auth store
      login(authResponse.user, authResponse.token);

      // Store user info for welcome modal
      sessionStorage.setItem('showWelcomeModal', 'true');
      sessionStorage.setItem('welcomeUsername', authResponse.user.name);

      // Log authentication source for debugging
      const roleLabel = authResponse.user.role === UserRole.SUPER_ADMIN 
        ? 'Super Admin' 
        : authResponse.user.role === UserRole.ADMIN 
        ? 'Admin' 
        : 'Moderator';
      
      const sourceLabel = authResponse.source === 'supabase_auth' 
        ? 'Authentication' 
        : 'Database';
      
      console.log(`✅ Authenticated via ${sourceLabel} as ${roleLabel}`);

      // Redirect based on role and source
      const redirectPath = AuthService.getRedirectPath(authResponse.user.role, authResponse.source);
      
      // Small delay for better UX
      setTimeout(() => {
        navigate(redirectPath);
      }, 500);

    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lucky Draw</h1>
            <p className="text-gray-600">Sign in to your admin account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            {/* Info Message */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Secure Authentication</p>
                <p className="text-xs text-blue-700">
                  Super Admin credentials verified via Authentication. Other admins verified via Database.
                </p>
              </div>
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-shake">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Supabase Info */}
          
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          © 2025 Lucky Draw. All rights reserved.
        </p>
        </div>
      </div>
    </>
  );
};

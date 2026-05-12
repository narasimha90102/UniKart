import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem('unikart_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('unikart_remembered_email'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('unikart_remembered_email', email);
      } else {
        localStorage.removeItem('unikart_remembered_email');
      }

      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockUser = {
        _id: 'mock_social_user',
        name: `User via ${provider}`,
        email: `user@${provider.toLowerCase()}.com`,
        role: 'user',
        wishlist: [],
        createdAt: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem('unikart_user', JSON.stringify(mockUser));
      localStorage.setItem('unikart_token', 'mock_token');
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50/50 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-6 bg-white pt-0 px-8 pb-8 md:px-10 md:pb-10 rounded-3xl shadow-xl border border-gray-100"
      >
        <div>
          <div className="flex justify-center -mt-2 -mb-5">
            <img src="/logo.png" alt="UniKart" className="h-40 w-auto object-contain" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-sm font-bold border ${
                error.includes('waiting') || error.includes('verify') 
                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                  : error.includes('rejected')
                  ? 'bg-red-50 text-red-700 border-red-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Email (.edu or student email)"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Password"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full rounded-xl text-base h-12 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 rounded-full">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 border-gray-200 hover:bg-gray-50 rounded-xl"
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                Google
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 border-gray-200 hover:bg-gray-50 rounded-xl"
                onClick={() => handleSocialLogin('Apple')}
                disabled={loading}
              >
                Apple
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

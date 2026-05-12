import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff, Hash, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    regNo: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'One uppercase letter', regex: /(?=.*[A-Z])/ },
    { label: 'One lowercase letter', regex: /(?=.*[a-z])/ },
    { label: 'One number', regex: /(?=.*\d)/ },
    { label: 'One special character (@$!%*?&)', regex: /(?=.*[@$!%*?&])/ }
  ];

  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        regNo: formData.regNo
      });

      // The /auth/register route already sends the OTP email via the backend

      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          userId: response.data.userId || response.data._id, 
          email: formData.email,
          message: response.data.isPending ? 'Your account is pending verification. A new code has been sent.' : 'Account created! Check your email for the OTP.'
        } 
      });

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Join UniKart
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                name="name"
                type="text"
                required
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Full Name"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                name="email"
                type="email"
                required
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Student Email (e.g. name@university.edu)"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                name="regNo"
                type="text"
                required
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Register Number (Reg No)"
                onChange={(e) => setFormData({...formData, regNo: e.target.value})}
              />
            </div>


            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="pl-11 pr-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Create Password"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {isPasswordFocused && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute left-0 lg:left-[calc(100%+1.5rem)] top-[110%] lg:top-0 w-full lg:w-64 z-[100]"
                  >
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Password Requirements</p>
                      {passwordRules.map((rule, index) => {
                        const isValid = rule.regex.test(formData.password);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            {isValid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-gray-300" />
                            )}
                            <span className={`text-[11px] font-bold ${isValid ? 'text-emerald-600' : 'text-gray-500'}`}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="pl-11 pr-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Confirm Password"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full rounded-xl text-base h-12 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 rounded-full">Or join with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 border-gray-200 hover:bg-gray-50 rounded-xl"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    const mockUser = { _id: 'mock_google', name: 'Google User', email: 'google@user.com', role: 'user', wishlist: [] };
                    setUser(mockUser);
                    localStorage.setItem('unikart_user', JSON.stringify(mockUser));
                    localStorage.setItem('unikart_token', 'mock_token');
                    navigate('/dashboard');
                  }, 1000);
                }}
                disabled={loading}
              >
                Google
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 border-gray-200 hover:bg-gray-50 rounded-xl"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    const mockUser = { _id: 'mock_apple', name: 'Apple User', email: 'apple@user.com', role: 'user', wishlist: [] };
                    setUser(mockUser);
                    localStorage.setItem('unikart_user', JSON.stringify(mockUser));
                    localStorage.setItem('unikart_token', 'mock_token');
                    navigate('/dashboard');
                  }, 1000);
                }}
                disabled={loading}
              >
                Apple
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff, Hash } from 'lucide-react';
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
    regNo: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailError, setEmailError] = useState('');

  const passwordRules = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'One uppercase letter', regex: /(?=.*[A-Z])/ },
    { label: 'One lowercase letter', regex: /(?=.*[a-z])/ },
    { label: 'One number', regex: /(?=.*\d)/ },
    { label: 'One special character (@$!%*?&)', regex: /(?=.*[@$!%*?&])/ }
  ];

  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setGoogleLoading(true);
    
    try {
      if (!window.google) {
        throw new Error('Google Sign-In is currently unavailable. Please reload the page.');
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              await googleLogin(tokenResponse.access_token, 'signup');
              navigate('/approval-pending');
            } catch (err) {
              console.error('Google backend auth error:', err);
              setErrorMsg(err.response?.data?.message || 'Authentication with Google failed.');
            } finally {
              setGoogleLoading(false);
            }
          } else {
            setErrorMsg('Google authentication was cancelled.');
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          console.error('Google Sign-In Error:', err);
          setErrorMsg('Google authentication failed. Please try again.');
          setGoogleLoading(false);
        }
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('Google client initialization failed:', err);
      setErrorMsg(err.message || 'Failed to initialize Google Sign-In.');
      setGoogleLoading(false);
    }
  };

  // Real-time format checking
  useEffect(() => {
    if (!formData.email) {
      setEmailValid(false);
      setEmailError('');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailValid(false);
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailValid(true);
    setEmailError('');
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailValid) {
      setErrorMsg('Please provide a valid email address');
      return;
    }

    // Check password rules before submitting
    const allRulesPassed = passwordRules.every(rule => rule.regex.test(formData.password));
    if (!allRulesPassed) {
      setErrorMsg('Please satisfy all password requirements');
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

      // Redirect to Login page with success message
      navigate('/login', {
        state: {
          message: 'Account created successfully! Your account is pending administrator approval.'
        }
      });

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white px-6 py-6 md:px-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col justify-center"
      >
        <div>
          <div className="flex justify-center -mb-2">
            <img src="/logo.png" alt="UniKart" className="h-16 w-auto object-contain animate-fade-in" />
          </div>
          <h2 className="text-center text-2xl font-black text-gray-900 tracking-tight leading-none mt-1">
            Join UniKart
          </h2>
          <p className="mt-1 text-center text-xs text-gray-500 font-bold">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Dedicated Message Area */}
        <div className="h-9 w-full mt-1.5 flex items-center justify-center shrink-0">
          <AnimatePresence mode="wait">
            {(errorMsg || emailError) ? (
              <motion.div
                key={errorMsg || emailError}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 overflow-hidden justify-center"
              >
                <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="truncate leading-none">{errorMsg || emailError}</span>
              </motion.div>
            ) : (
              <div className="h-full w-full opacity-0" />
            )}
          </AnimatePresence>
        </div>

        <form className="mt-2 space-y-2.5" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
             <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="name"
                type="text"
                required
                className="pl-11 h-11 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Full Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

             <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.email
                  ? emailValid
                    ? 'text-emerald-500'
                    : 'text-red-400'
                  : 'text-gray-400'
                }`} />
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                className={`pl-11 h-11 text-base rounded-xl transition-all ${formData.email
                    ? emailValid
                      ? 'border-emerald-500 bg-emerald-50/5 focus:border-emerald-600 focus:ring-emerald-200'
                      : 'border-red-300 bg-red-50/5 focus:border-red-400 focus:ring-red-200'
                    : 'bg-gray-50 border-gray-200 focus:bg-white'
                  }`}
                placeholder="Student Email (e.g. name@university.edu)"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>


             <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="regNo"
                type="text"
                required
                className="pl-11 h-11 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Register Number (Reg No)"
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              />
            </div>

             <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="pl-11 pr-11 h-11 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Create Password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isPasswordFocused && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute left-0 lg:left-[calc(100%+1.5rem)] top-[110%] lg:top-0 w-full lg:w-64 z-[100]"
                  >
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xl space-y-1.5">
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Password Requirements</p>
                      {passwordRules.map((rule, index) => {
                        const isValid = rule.regex.test(formData.password);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            {isValid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-300" />
                            )}
                            <span className={`text-[13px] font-bold ${isValid ? 'text-emerald-600' : 'text-gray-500'}`}>
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
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl text-base h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            disabled={loading || !emailValid || googleLoading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full rounded-xl text-base h-11 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 transition-colors"
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="text-[11px] leading-normal text-center text-gray-400 mt-2 px-2">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

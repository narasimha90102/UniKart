import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldAlert, CheckCircle2, Clock, HelpCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem('unikart_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('unikart_remembered_email'));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [modalState, setModalState] = useState(null); // null, 'not_found', 'pending', 'rejected'


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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

  const handleGoogleSignIn = () => {
    setError('');
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
              const userData = await googleLogin(tokenResponse.access_token, 'login');
              if (userData && userData.role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/dashboard');
              }
            } catch (err) {
              console.error('Google backend auth error:', err);
              const errorCode = err.response?.data?.code;
              if (errorCode === 'ACCOUNT_NOT_FOUND') {
                setModalState('not_found');
              } else if (errorCode === 'ACCOUNT_PENDING') {
                setModalState('pending');
              } else if (errorCode === 'ACCOUNT_REJECTED') {
                setModalState('rejected');
              } else {
                setError(err.response?.data?.message || 'Authentication with Google failed.');
              }
            } finally {
              setGoogleLoading(false);
            }
          } else {
            setError('Google authentication was cancelled.');
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          console.error('Google Sign-In Error:', err);
          setError('Google authentication failed. Please try again.');
          setGoogleLoading(false);
        }
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('Google client initialization failed:', err);
      setError(err.message || 'Failed to initialize Google Sign-In.');
      setGoogleLoading(false);
    }
  };

  const isEmailInvalid = error && (
    error.toLowerCase().includes('email') || 
    error.toLowerCase().includes('exist') || 
    error.toLowerCase().includes('does not')
  );
  
  const isPasswordInvalid = error && (
    error.toLowerCase().includes('password') || 
    error.toLowerCase().includes('incorrect')
  );

  return (
    <div className="h-[calc(100vh-56px)] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={error ? { x: [0, -10, 10, -10, 10, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white px-8 py-6 md:px-10 rounded-[2.5rem] shadow-xl border border-gray-100 max-h-[92vh] overflow-y-auto scrollbar-thin flex flex-col justify-center"
      >
        <div>
          <div className="flex justify-center -mb-2">
            <img src="/logo.png" alt="UniKart" className="h-20 w-auto object-contain animate-fade-in" />
          </div>
          <h2 className="text-center text-2xl font-black text-gray-900 tracking-tight leading-none mt-2">
            Welcome back
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Dedicated Message Area */}
        <div className="h-10 w-full mt-2 flex items-center justify-center shrink-0">
          <AnimatePresence mode="wait">
            {(error || successMsg) ? (
              <motion.div
                key={error || successMsg}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className={`w-full h-full px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 overflow-hidden justify-center ${
                  successMsg
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : error.toLowerCase().includes('waiting') || error.toLowerCase().includes('pending')
                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {successMsg ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : error.toLowerCase().includes('waiting') || error.toLowerCase().includes('pending') ? (
                  <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <span className="truncate leading-none">{successMsg || error}</span>
              </motion.div>
            ) : (
              <div className="h-full w-full opacity-0" />
            )}
          </AnimatePresence>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEmailInvalid ? 'text-red-400' : 'text-gray-400'}`} />
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-11 h-12 text-base rounded-xl transition-all ${
                  isEmailInvalid 
                    ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-200 focus:bg-white' 
                    : 'bg-gray-50 border-gray-200 focus:bg-white'
                }`}
                placeholder="Email (.edu or student email)"
              />
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isPasswordInvalid ? 'text-red-400' : 'text-gray-400'}`} />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-11 pr-11 h-12 text-base rounded-xl transition-all ${
                  isPasswordInvalid 
                    ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-200 focus:bg-white' 
                    : 'bg-gray-50 border-gray-200 focus:bg-white'
                }`}
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
            className="w-full rounded-xl text-base h-12 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                Sign in <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-bold">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full rounded-xl text-base h-12 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 transition-colors"
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

        </form>
      </motion.div>

      <AnimatePresence>
        {modalState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white max-w-md w-full rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setModalState(null)}
                className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6">
                {modalState === 'not_found' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 leading-none">Account Not Found</h3>
                      <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                        Account not found. Please create an account first.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline"
                        onClick={() => setModalState(null)}
                        className="flex-1 h-12 rounded-xl font-bold border-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          setModalState(null);
                          navigate('/signup');
                        }}
                        className="flex-1 h-12 rounded-xl font-black bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </>
                )}

                {modalState === 'pending' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 leading-none">Awaiting Approval</h3>
                      <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                        Your account is awaiting admin approval. You will be able to log in after approval.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button 
                        onClick={() => setModalState(null)}
                        className="w-full h-12 rounded-xl font-black bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10"
                      >
                        OK
                      </Button>
                    </div>
                  </>
                )}

                {modalState === 'rejected' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                      <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 leading-none">Request Rejected</h3>
                      <p className="text-sm font-semibold text-gray-500 leading-relaxed text-center">
                        Your account request was not approved. Please contact support for assistance.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button 
                        onClick={() => setModalState(null)}
                        className="w-full h-12 rounded-xl font-black bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/10"
                      >
                        OK
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState,useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

// --- REDUX & ROUTER IMPORTS (Uncomment in your project) ---
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPassword, requestPasswordReset, signIn } from '../../redux/slices/user';

const LoginPage = () => {
  // View State: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState('login'); 
  
  // Shared State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [devPin, setDevPin] = useState(null); // For Dev only

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  // Reset states when switching views
  const switchView = (newView) => {
    setMessage(null);
    setError(null);
    setDevPin(null);
    setView(newView);
  };

  // --- HANDLERS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
   await dispatch(signIn({ email, password })).unwrap();
  
        navigate('/dashboard');
 
    } catch (err) {
      setError(err?.message || err?.error || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };



  
  const handleRequestPin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const data = await dispatch(requestPasswordReset(email)).unwrap();
      setMessage(data.message || 'Pin generated sent to your email.');
      if (data.securityPin) setDevPin(data.securityPin); // Show PIN for dev
      // Optional: Auto switch to reset view after success?
      // switchView('reset'); 
    } catch (err) {
      setError(err?.message || err?.error || 'Error requesting pin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const payload = { email, securityPin: pin, newPassword: password };
      const data = await dispatch(resetPassword(payload)).unwrap();
      setMessage(data.message || 'Password reset successful. Redirecting...');
      setTimeout(() => {
        switchView('login');
        setPassword('');
        setPin('');
      }, 1500);
    } catch (err) {
      setError(err?.message || err?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-slate-800">
      
      {/* ================= LEFT SIDE: BRANDING (Consistent) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-pink-600 blur-3xl opacity-20"></div>

        {/* Logo */}
        <div className="z-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">JA</span>
            </div>
            <div className="flex flex-col">
               <h1 className="text-3xl font-bold tracking-tight leading-none flex">
                  <span className="text-pink-500">Job</span>
                  <span className="text-orange-500">Addah</span>
               </h1>
               <span className="text-[10px] font-bold text-slate-400 tracking-[0.15em] mt-1">THE NO.1 JOB PORTAL</span>
            </div>
        </div>

        {/* Hero Text */}
        <div className="z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            {view === 'login' ? 'Welcome Back!' : view === 'forgot' ? 'Forgot Password?' : 'Secure Reset'}
          </h2>
          <p className="text-slate-400 text-lg">
            {view === 'login' 
              ? 'Admin dashboard to manage jobs, admit cards, results, and admissions seamlessly.' 
              : 'Follow the steps to recover your account access securely.'}
          </p>
          
          <div className="space-y-4 pt-4">
            <FeatureItem text="Real-time Analytics Dashboard" />
            <FeatureItem text="Secure Admin Access" />
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-slate-500 text-sm">&copy; 2025 JobAddah Inc.</div>
      </div>

      {/* ================= RIGHT SIDE: DYNAMIC FORMS ================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-white relative">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">JA</span>
            </div>
            <span className="font-bold text-xl text-slate-800">JobAddah</span>
        </div>

        <div className="w-full max-w-md space-y-8 transition-all duration-300">
          
          {/* Header Section */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              {view === 'login' && 'Sign In'}
              {view === 'forgot' && 'Request Reset'}
              {view === 'reset' && 'New Password'}
            </h2>
            <p className="mt-2 text-slate-500">
              {view === 'login' && 'Please enter your details to sign in.'}
              {view === 'forgot' && 'Enter your email to receive a security PIN.'}
              {view === 'reset' && 'Enter the PIN sent to your email and set a new password.'}
            </p>
          </div>

          {/* ================= VIEW: LOGIN ================= */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputGroup icon={Mail} type="email" value={email} onChange={setEmail} placeholder="admin@jobaddah.com" label="Email Address" />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button type="button" onClick={() => switchView('forgot')} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </button>
                </div>
                <PasswordInput value={password} onChange={setPassword} show={showPassword} toggle={() => setShowPassword(!showPassword)} placeholder="••••••••" />
              </div>

              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

              <SubmitButton isLoading={isLoading} text="Sign in" />
            </form>
          )}

          {/* ================= VIEW: FORGOT (Request Reset) ================= */}
          {view === 'forgot' && (
            <form onSubmit={handleRequestPin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputGroup icon={Mail} type="email" value={email} onChange={setEmail} placeholder="registered@email.com" label="Registered Email" />
              
              <SubmitButton isLoading={isLoading} text="Request PIN" />

              {/* Messages */}
              {message && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2"><CheckCircle size={16}/> {message}</div>}
              {devPin && <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">DEV PIN: <strong>{devPin}</strong></div>}
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

              <div className="flex flex-col gap-3 text-center mt-4">
                 <button type="button" onClick={() => switchView('reset')} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
                    Have a PIN? Reset Password <ArrowRight size={16}/>
                 </button>
                 <button type="button" onClick={() => switchView('login')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2">
                    <ArrowLeft size={16}/> Back to Login
                 </button>
              </div>
            </form>
          )}

          {/* ================= VIEW: RESET (Set New Password) ================= */}
          {view === 'reset' && (
             <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Email (Read Only or Editable) */}
               <InputGroup icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Email" label="Email Address" />
               
               {/* PIN Input */}
               <InputGroup icon={KeyRound} type="text" value={pin} onChange={setPin} placeholder="Enter 6-digit PIN" label="Security PIN" />

               {/* New Password */}
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <PasswordInput value={password} onChange={setPassword} show={showPassword} toggle={() => setShowPassword(!showPassword)} placeholder="New secure password" />
               </div>

               <SubmitButton isLoading={isLoading} text="Set New Password" />

               {/* Messages */}
               {message && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2"><CheckCircle size={16}/> {message}</div>}
               {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

               <div className="text-center mt-4">
                 <button type="button" onClick={() => switchView('login')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2">
                    <ArrowLeft size={16}/> Back to Login
                 </button>
               </div>
             </form>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for Cleaner UI ---

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
    <span>{text}</span>
  </div>
);

const InputGroup = ({ icon: Icon, type, value, onChange, placeholder, label }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400 bg-white"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const PasswordInput = ({ value, onChange, show, toggle, placeholder }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Lock className="h-5 w-5 text-slate-400" />
    </div>
    <input
      type={show ? "text" : "password"}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400"
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={toggle}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
);

const SubmitButton = ({ isLoading, text }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={`
      w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
      bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
      transition-all duration-200 transform hover:-translate-y-0.5
      ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
    `}
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </span>
    ) : (
      <span className="flex items-center gap-2">
        {text} <ArrowRight size={18} />
      </span>
    )}
  </button>
);

export default LoginPage;
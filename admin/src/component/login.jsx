import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPassword, requestPasswordReset, signIn } from '../../redux/slices/user';

const LoginPage = () => {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [devPin, setDevPin] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const switchView = (newView) => {
    setMessage(null);
    setError(null);
    setDevPin(null);
    setView(newView);
  };

  const getErrorMessage = (err) => {
    if (!err) return 'Something went wrong.';
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.error && typeof err.error === 'string') return err.error;
    return 'An unexpected error occurred. Please try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await dispatch(signIn({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await dispatch(requestPasswordReset(email)).unwrap();
      setMessage(data?.message || 'Security PIN sent successfully!');
      if (data?.securityPin) setDevPin(data.securityPin);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!pin || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = { email, securityPin: pin, newPassword: password };
      const data = await dispatch(resetPassword(payload)).unwrap();
      setMessage(data?.message || 'Password reset successful!');
      setTimeout(() => {
        switchView('login');
        setPassword('');
        setPin('');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-slate-800">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-pink-600 blur-3xl opacity-20 animate-pulse" />

        <div className="z-10 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="text-white font-bold text-xl">JA</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight leading-none flex">
              <span className="text-white">Job</span>
              <span className="text-orange-500">Addah</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="z-10 space-y-6 max-w-lg">
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            {view === 'login' && 'Manage Your\nPortal Efficiently.'}
            {view === 'forgot' && 'Secure Account\nRecovery.'}
            {view === 'reset' && 'Set a Strong\nNew Password.'}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            {view === 'login'
              ? 'Streamline admissions, results, and job postings with our comprehensive admin dashboard.'
              : 'Don\'t worry, follow the simple steps to regain access to your dashboard securely.'}
          </p>
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <FeatureItem text="End-to-end Encryption" />
            <FeatureItem text="Real-time Data Updates" />
            <FeatureItem text="24/7 System Availability" />
          </div>
        </div>

        <div className="z-10 text-slate-500 text-sm flex justify-between items-center">
            <span>&copy; 2025 JobAddah Inc.</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-white relative">
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">JA</span>
          </div>
          <span className="font-bold text-xl text-slate-800">JobAddah</span>
        </div>

        <div className="w-full max-w-[420px] transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {view === 'login' && 'Sign In'}
              {view === 'forgot' && 'Reset Password'}
              {view === 'reset' && 'New Credentials'}
            </h2>
            <p className="mt-2 text-slate-500">
              {view === 'login' && 'Enter your credentials to access your account.'}
              {view === 'forgot' && 'Enter your email to receive a recovery PIN.'}
              {view === 'reset' && 'Create a new password for your account.'}
            </p>
          </div>

          <div className="mb-6 space-y-4 min-h-[20px]">
             {error && (
                <AlertMessage type="error" message={error} onClose={() => setError(null)} />
             )}
             {message && (
                <AlertMessage type="success" message={message} onClose={() => setMessage(null)} />
             )}
             {devPin && (
                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                   <div>
                       <span className="font-semibold block text-xs uppercase tracking-wider text-blue-500 mb-1">Development Mode</span>
                       <span className="font-mono text-lg font-bold tracking-widest">{devPin}</span>
                   </div>
                   <button type="button" onClick={() => setDevPin(null)} className="text-blue-400 hover:text-blue-600">
                       <X size={16} />
                   </button>
                </div>
             )}
          </div>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <InputGroup
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="admin@jobaddah.com"
                label="Email Address"
                disabled={isLoading}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  toggle={() => setShowPassword(!showPassword)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <SubmitButton isLoading={isLoading} text="Sign In" />
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleRequestPin} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <InputGroup
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="registered@email.com"
                label="Registered Email"
                disabled={isLoading}
              />

              <SubmitButton isLoading={isLoading} text="Send PIN" />

              <div className="pt-4 flex flex-col gap-3 text-center">
                <button
                  type="button"
                  onClick={() => switchView('reset')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2 group"
                  disabled={isLoading}
                >
                  Already have a PIN? Verify <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </div>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <InputGroup
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email Address"
                label="Email Address"
                disabled={isLoading}
              />

              <InputGroup
                icon={KeyRound}
                type="text"
                value={pin}
                onChange={setPin}
                placeholder="6-digit PIN"
                label="Security PIN"
                disabled={isLoading}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  toggle={() => setShowPassword(!showPassword)}
                  placeholder="New secure password"
                  disabled={isLoading}
                />
              </div>

              <SubmitButton isLoading={isLoading} text="Reset Password" />

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AlertMessage = ({ type, message, onClose }) => {
    const isError = type === 'error';
    const bgClass = isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700';
    const Icon = isError ? AlertTriangle : CheckCircle;
  
    return (
      <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${bgClass}`}>
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isError ? 'text-red-600' : 'text-green-600'}`} />
        <div className="flex-1 text-sm font-medium leading-relaxed break-words">
            {message}
        </div>
        <button 
            type="button"
            onClick={onClose} 
            className={`p-1 hover:bg-black/5 rounded-full transition-colors ${isError ? 'text-red-500' : 'text-green-500'}`}
        >
            <X size={16} />
        </button>
      </div>
    );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300 group">
    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
        <CheckCircle className="h-4 w-4 shrink-0" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

const InputGroup = ({ icon: Icon, type, value, onChange, placeholder, label, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
        <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        type={type}
        required
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-100 focus:bg-white"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const PasswordInput = ({ value, onChange, show, toggle, placeholder, disabled }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
    </div>
    <input
      type={show ? 'text' : 'password'}
      required
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-100 focus:bg-white"
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
);

const SubmitButton = ({ isLoading, text }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform active:scale-[0.98] ${
      isLoading ? 'opacity-80 cursor-wait' : 'hover:-translate-y-0.5'
    }`}
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <Loader2 className="animate-spin h-5 w-5" />
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
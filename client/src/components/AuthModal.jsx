"use client";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Smartphone,
  User,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AuthModal({ open, onClose, onSignedIn }) {
  const [step, setStep] = useState('email');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Handle smooth open/close animation
  useEffect(() => {
    if (open) setIsVisible(true);
    else setTimeout(() => setIsVisible(false), 200);
  }, [open]);

  if (!open && !isVisible) return null;

  // --- LOGIC (Unchanged) ---
  const sendOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      setStep('otp');
      setMessage('OTP sent — check your email');
    } catch (err) {
      setMessage(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create');
      if (data.token) localStorage.setItem('token', data.token);
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem('user', JSON.stringify(data.data));
      onSignedIn && onSignedIn(data.data);
      onClose && onClose();
    } catch (err) {
      setMessage(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Invalid');

      if (data.exists) {
        const token = data.token;
        const user = data.data;
        if (token) localStorage.setItem('token', token);
        localStorage.setItem('isSignedIn', 'true');
        if (user) localStorage.setItem('user', JSON.stringify(user));
        onSignedIn && onSignedIn(user);
        onClose && onClose();
      } else {
        if (isSigningUp) {
            await createUser();
        } else {
            setStep('create');
        }
      }
    } catch (err) {
      setMessage(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // --- UI HELPERS ---
  const getTitle = () => {
      if (step === 'signup-form') return 'Create Account';
      if (step === 'create') return 'Complete Profile';
      if (step === 'otp') return 'Verify Identity';
      return 'Welcome Back';
  };

  const getSubtitle = () => {
      if (step === 'signup-form') return 'Join us to get started';
      if (step === 'create') return 'Tell us a bit about yourself';
      if (step === 'otp') return `We sent a code to ${email}`;
      return 'Sign in to access your account';
  };

  // Reusable Input Component with Icon
  const InputField = ({ icon: Icon, value, onChange, placeholder, type = "text", autoFocus = false }) => (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input 
        value={value} 
        onChange={onChange}
        type={type}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-gray-400 text-gray-800"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    >
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden transition-all duration-300 transform ${open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-white to-gray-50/50">
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{getTitle()}</h3>
            <p className="text-sm text-gray-500 font-medium">{getSubtitle()}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-8 pb-8 pt-2">
          {/* ... UI steps omitted for brevity (kept as in provided code) ... */}
          {step === 'email' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField 
                icon={Mail} 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)} 
                placeholder="name@example.com" 
                autoFocus
              />

              <button 
                onClick={sendOtp} 
                disabled={loading || !email}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={18} /></>}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Or</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => { setStep('signup-form'); setIsSigningUp(true); setMessage(''); }} 
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Don't have an account? <span className="text-blue-600 underline decoration-blue-600/30 underline-offset-4 hover:decoration-blue-600">Sign up</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: SIGNUP FORM */}
          {step === 'signup-form' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField icon={User} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full Name" autoFocus />
              <InputField icon={Mail} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email Address" />
              <InputField icon={Smartphone} value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="Phone Number" />
              
              <button 
                onClick={sendOtp} 
                disabled={loading}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </button>

              <button 
                onClick={() => { setStep('email'); setIsSigningUp(false); setMessage(''); }} 
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}

          {/* STEP: OTP VERIFICATION */}
          {step === 'otp' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-center">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Lock className="text-blue-600" size={32} />
                </div>
              </div>
              
              <div className="space-y-2">
                 <input 
                    value={code} 
                    onChange={(e)=>setCode(e.target.value)} 
                    className="w-full text-center text-3xl font-bold tracking-widest py-3 border-b-2 border-gray-200 focus:border-blue-600 outline-none bg-transparent transition-all placeholder:text-gray-200 text-gray-800" 
                    placeholder="• • • • • •" 
                    maxLength={6}
                    autoFocus
                 />
                 <p className="text-xs text-center text-gray-400">Enter the 6-digit code received</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(isSigningUp ? 'signup-form' : 'email')} 
                  className="flex-1 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={verifyOtp} 
                  disabled={loading || code.length < 4}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (isSigningUp ? 'Verify & Create' : 'Verify Login')}
                </button>
              </div>

              <div className="text-center">
                <button onClick={sendOtp} disabled={loading} className="text-xs text-blue-600 hover:underline">
                    Resend Code
                </button>
              </div>
            </div>
          )}

          {/* STEP: COMPLETE PROFILE (New User via Login Flow) */}
          {step === 'create' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex gap-2 items-start">
                  <CheckCircle2 size={16} className="mt-0.5" />
                  <span>Email verified! Please finish setting up your profile.</span>
               </div>
              <InputField icon={User} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full Name" autoFocus />
              <InputField icon={Smartphone} value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="Phone Number" />
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep('email')} 
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={createUser} 
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Sign Up'}
                </button>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {message && (
            <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center animate-in fade-in slide-in-from-bottom-2">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Login Successful!'); // Replace with navigation logic
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-slate-800">
      
      {/* ================= LEFT SIDE: BRANDING (Hidden on mobile) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-pink-600 blur-3xl opacity-20"></div>

        {/* Logo Section */}
        <div className="z-10">
          <div className="flex items-center gap-3">
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
        </div>

        {/* Hero Content */}
        <div className="z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Manage Your <br />
            <span className="text-blue-400">Job Portal</span> Efficiently.
          </h2>
          <p className="text-slate-400 text-lg">
            Admin dashboard to manage jobs, admit cards, results, and admissions seamlessly.
          </p>
          
          <div className="space-y-4 pt-4">
            <FeatureItem text="Real-time Analytics Dashboard" />
            <FeatureItem text="Instant Notification Management" />
            <FeatureItem text="Secure Admin Access" />
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="z-10 text-slate-500 text-sm">
          &copy; 2025 JobAddah Inc. All rights reserved.
        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-white relative">
        
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">JA</span>
            </div>
            <span className="font-bold text-xl text-slate-800">JobAddah</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          
          {/* Form Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-slate-800 placeholder:text-slate-400"
                  placeholder="admin@jobaddah.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-slate-800 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
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
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
             <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact Super Admin
                </a>
             </p>
          </div>
          
          {/* Social Login (Optional - keeping it subtle) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex justify-center gap-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Secured by JobAddah Admin Panel</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper for list items
const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <CheckCircle className="h-5 w-5 text-green-400" />
    <span>{text}</span>
  </div>
);

export default LoginPage;
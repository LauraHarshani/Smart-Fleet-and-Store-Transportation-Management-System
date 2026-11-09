import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, CheckCircle2, X } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    // Save authentication state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    
    // Redirect directly to Dashboard as requested
    navigate('/dashboard');
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert('Please enter your registered corporate email.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#f8faf9]">
      {/* Left Banner Section */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0b2149] text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b2149] via-[#0b2149]/60 to-transparent"></div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#0fa979] p-2 rounded-xl text-white">
            <Truck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">LogiFleet</h2>
            <p className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">Fleet & Store Management</p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Move goods between stores, without the wait
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-10">
            Book transport, track your vehicle and confirm handover in one place.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#0fa979]/20 p-1.5 rounded-full text-[#0fa979] mt-0.5">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Book & Schedule Trips</h4>
                <p className="text-xs text-gray-400">Request and track your deliveries seamlessly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#0fa979]/20 p-1.5 rounded-full text-[#0fa979] mt-0.5">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Track in Real Time</h4>
                <p className="text-xs text-gray-400">Monitor vehicle location and trip progress.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#0fa979]/20 p-1.5 rounded-full text-[#0fa979] mt-0.5">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Manage Deliveries</h4>
                <p className="text-xs text-gray-400">Get updates on items and arrivals instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-400 font-medium">
          © 2026 LogiFleet Ops • Enterprise Logistics Core
        </div>
      </div>

      {/* Right Login Card Section */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in to your LogiFleet account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0fa979]/20 focus:border-[#0fa979] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0fa979]/20 focus:border-[#0fa979] transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0fa979] focus:ring-[#0fa979]" 
                />
                Remember me
              </label>
              <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setIsSubmitted(false); setForgotEmail(''); }}
                className="text-[#0fa979] hover:underline font-semibold bg-transparent border-none cursor-pointer p-0"
              >
                Forgot Password
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#0fa979] text-white rounded-xl font-bold text-sm hover:bg-[#0d9468] transition-colors shadow-[0_4px_12px_rgba(15,169,121,0.25)] mt-2 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <div>
                <div className="w-12 h-12 bg-[#e8f8f2] text-[#0fa979] rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h3>
                <p className="text-xs text-gray-500 mb-6">Enter your corporate email address and we'll dispatch a secure recovery token.</p>
                
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Corporate Email</label>
                    <input 
                      type="email" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. name@logifleet.lk" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#0fa979]"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 bg-[#113b2e] text-white font-bold rounded-xl text-xs hover:bg-[#0fa979] transition-colors shadow-sm"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#d1f4e0] text-[#0d9468] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recovery Link Dispatched</h3>
                <p className="text-xs text-gray-500 mb-6">We have sent a 48-hour secure cryptographic password reset token to <span className="font-semibold text-gray-800">{forgotEmail}</span>.</p>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3 bg-[#113b2e] text-white font-bold rounded-xl text-xs hover:bg-[#0fa979] transition-colors shadow-sm"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
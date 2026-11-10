import React, { useState } from 'react';
import { User, Mail, Shield, Lock, CheckCircle2, Key } from 'lucide-react';

export default function Profile() {
  const [name, setName] = useState('Laura Harshani');
  const [email, setEmail] = useState('harshi@gmail.com');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [role, setRole] = useState('System Administrator');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('userEmail', email);
    alert('Profile details successfully updated!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Get initials for avatar (e.g. "LH")
  const getInitials = (fullName) => {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
      
      {/* Header Path */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        <span>ADMIN</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">USER PROFILE</span>
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Admin Profile Settings</h1>
          <p className="text-xs text-gray-500 mt-2">Manage your personal credentials, system permissions, and security authentication parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px]">
        
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center relative overflow-hidden pb-10">
            <div className="absolute top-0 left-0 right-0 h-20 bg-[#113b2e]"></div>
            
            <div className="relative mt-6 mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#0fa979] text-white flex items-center justify-center text-3xl font-extrabold border-4 border-white shadow-md">
                {getInitials(name)}
              </div>
              <span className="absolute bottom-0 right-[38%] w-5 h-5 bg-[#0fa979] border-2 border-white rounded-full"></span>
            </div>

            <h2 className="text-lg font-bold text-[#113b2e]">{name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#d1f4e0] text-[#0d9468] text-[10px] font-bold rounded-full uppercase tracking-wider">
              <Shield size={12}/> {role}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-sm font-bold text-[#113b2e] mb-1 flex items-center gap-2">
              <User size={16} className="text-[#0fa979]"/> Personal & Contact Information
            </h3>
            <p className="text-[11px] text-gray-500 mb-6">Update your legal name, professional email address, and direct phone contact.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Full Legal Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><User size={14}/></div>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Corporate Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Mail size={14}/></div>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">📞</div>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2.5 bg-[#113b2e] text-white rounded-xl font-bold text-xs hover:bg-[#0fa979] transition-colors shadow-sm cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-sm font-bold text-[#113b2e] mb-1 flex items-center gap-2">
              <Key size={16} className="text-[#0fa979]"/> Change Password
            </h3>
            <p className="text-[11px] text-gray-500 mb-6">Ensure your account is using a secure, long password to prevent unauthorized access.</p>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Lock size={14}/></div>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Lock size={14}/></div>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Lock size={14}/></div>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#0fa979]" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2.5 bg-[#113b2e] text-white rounded-xl font-bold text-xs hover:bg-[#0fa979] transition-colors shadow-sm cursor-pointer">
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
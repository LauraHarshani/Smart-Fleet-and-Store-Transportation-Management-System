import React, { useState } from 'react';
import { User, Mail, Phone, Lock } from 'lucide-react';

const StoreProfile = () => {
  const [formData, setFormData] = useState({
    fullName: 'Harshi Rodrigo',
    email: 'harshi@logifleet.com',
    phone: '+94 77 123 4567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert("Profile information updated successfully!");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    if (names.length === 1) return names[0][0].toUpperCase();
    return 'SM';
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 border-b border-gray-200 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store manager credentials, contact details, and security.</p>
        </div>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-6 items-start max-w-6xl w-full">
        
        {/* Left Column: Avatar Card */}
        <div className="w-full md:w-[350px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <div className="h-32 bg-[#113b2e]"></div>
          <div className="flex flex-col items-center pb-8 -mt-16 relative">
            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-sm relative">
              <div className="w-full h-full bg-[#16a34a] rounded-full flex items-center justify-center text-4xl font-bold text-white tracking-wider">
                {getInitials(formData.fullName)}
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{formData.fullName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{formData.email}</p>
            <div className="mt-4 px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1.5 uppercase tracking-wider">
               <User size={12} /> Store Manager
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
          
          {/* Personal Info Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-green-700" size={18} />
              <h3 className="text-sm font-bold text-gray-900">Personal & Contact Information</h3>
            </div>
            <p className="text-[11px] text-gray-500 mb-6">Update your legal name, professional email address, and direct phone contact.</p>
            
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Full Legal Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Corporate Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3 text-green-600" />
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-[#113b2e] text-white text-sm font-semibold rounded-lg hover:bg-[#0c2a21] transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="text-green-700" size={18} />
              <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
            </div>
            <p className="text-[11px] text-gray-500 mb-6">Ensure your account is using a secure, long password to prevent unauthorized access.</p>
            
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input 
                      type="password" 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50/50 outline-none focus:ring-1 focus:ring-[#113b2e]" 
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-[#113b2e] text-white text-sm font-semibold rounded-lg hover:bg-[#0c2a21] transition-colors shadow-sm">
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
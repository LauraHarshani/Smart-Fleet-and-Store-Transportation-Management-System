import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Plus, Edit2, Trash2, Shield, Truck, Store, ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, Image as ImageIcon, History, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { getAllUsers, deactivateUser, createUser, updateUser } from '../../services/userService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [storeFilter, setStoreFilter] = useState('All Stores');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // State for Views: 'list', 'edit', 'add'
  const [currentView, setCurrentView] = useState('list');
  const [editingUser, setEditingUser] = useState(null);

  // Form State for Add/Edit User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserStore, setNewUserStore] = useState('');
  const [newUserStatus, setNewUserStatus] = useState('Active'); // For edit view
  
  // State for Uploaded Image Profile
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterData();
  }, [users, searchQuery, roleFilter, storeFilter, statusFilter]);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const filterData = () => {
    let filtered = users;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(u => 
            u.id.toLowerCase().includes(query) || 
            u.name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        );
    }
    if (roleFilter !== 'All Roles') filtered = filtered.filter(u => u.role === roleFilter);
    if (storeFilter !== 'All Stores') filtered = filtered.filter(u => u.store === storeFilter);
    if (statusFilter !== 'All Statuses') filtered = filtered.filter(u => u.status === statusFilter);
    setFilteredUsers(filtered);
  };

  const resetFilters = () => {
      setSearchQuery('');
      setRoleFilter('All Roles');
      setStoreFilter('All Stores');
      setStatusFilter('All Statuses');
  };

  const handleDelete = async (userId) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
          await deactivateUser(userId);
          setUsers(users.filter(u => u.id !== userId));
      }
  };

  const handleExportCSV = () => {
      const headers = ['System User ID', 'Full Name', 'Email', 'Role', 'Assigned Store', 'Status'];
      const csvData = filteredUsers.map(u => [u.id, u.name, u.email, u.role, u.store, u.status]);
      let csvContent = "data:text/csv;charset=utf-8," + [headers.join(",")].concat(csvData.map(e => e.join(","))).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "logifleet_users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-3 py-1 bg-gray-900 text-white text-[11px] font-bold rounded-full uppercase tracking-wider">{role}</span>;
      case 'STORE MANAGER':
        return <span className="px-3 py-1 bg-[#d1f4e0] text-[#0d9468] text-[11px] font-bold rounded-full uppercase tracking-wider">{role}</span>;
      case 'DRIVER':
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full uppercase tracking-wider">{role}</span>;
      case 'STORE EMPLOYEE':
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full uppercase tracking-wider">{role}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full uppercase tracking-wider">{role}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const openEditUser = (user) => {
      setEditingUser(user);
      setNewUserName(user.name);
      setNewUserEmail(user.email);
      setNewUserRole(user.role);
      setNewUserStore(user.store);
      setNewUserStatus(user.status);
      setUploadedImage(null);
      setCurrentView('edit');
  };

  const closeView = () => {
      setEditingUser(null);
      setCurrentView('list');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('');
      setNewUserStore('');
      setNewUserStatus('Active');
      setUploadedImage(null); 
  };

  const handleCreateUser = async (e) => {
      e.preventDefault();
      
      if (!newUserName || !newUserEmail || !newUserRole || !newUserStore) {
          alert('Please fill all required fields');
          return;
      }

      const newUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          store: newUserStore,
          status: 'Active',
          avatar: uploadedImage 
      };

      await createUser(newUser);
      setUsers(prev => [newUser, ...prev]);
      closeView();
  };

  const handleEditUser = async (e) => {
      e.preventDefault();
      
      if (!newUserName || !newUserEmail || !newUserRole || !newUserStore) {
          alert('Please fill all required fields');
          return;
      }

      const updatedUserData = {
          ...editingUser,
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          store: newUserStore,
          status: newUserStatus,
          avatar: uploadedImage || editingUser.avatar
      };

      await updateUser(editingUser.id, updatedUserData);
      
      setUsers(prevUsers => prevUsers.map(u => u.id === editingUser.id ? updatedUserData : u));
      closeView();
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              alert("File is too large. Max size is 5MB.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setUploadedImage(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current.click();
  };

  // -------------------------
  // 1. ADD NEW USER VIEW
  // -------------------------
  if (currentView === 'add') {
      return (
          <div className="p-8 bg-[#f8faf9] min-h-screen font-sans">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span>MASTER DATA</span> <span className="text-gray-400">&gt;</span> <span>USER MANAGEMENT</span> <span className="text-gray-400">&gt;</span> <span className="text-[#0fa979]">ADD NEW USER</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-4">
                  <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Add New User</h1>
                  <span className="bg-gray-200 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-1">● DRAFT / UNREGISTERED</span>
                </div>
                <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    <ArrowLeft size={16} /> Back to User List
                </button>
              </div>

              <div className="flex gap-6">
                  {/* Left Column - Form */}
                  <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-8">
                      {/* Photo & Name */}
                      <div className="flex items-center gap-5 pb-8 border-b border-gray-100 mb-8">
                          
                          {/* Image Upload Area */}
                          <div className="relative">
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  onChange={handleImageUpload} 
                                  accept="image/jpeg, image/png" 
                                  className="hidden" 
                              />
                              
                              <div 
                                  onClick={triggerFileInput}
                                  className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative
                                      ${uploadedImage ? 'bg-gray-100' : 'bg-gray-50 border-2 border-dashed border-gray-300 text-[#4f6782] hover:bg-gray-100'}`
                                  }
                              >
                                  {uploadedImage ? (
                                      <img src={uploadedImage} alt="Uploaded Profile" className="w-full h-full object-cover" />
                                  ) : (
                                      <>
                                          <ImageIcon size={24} strokeWidth={1.5} />
                                          <span className="text-[10px] font-bold mt-1 uppercase text-[#4f6782]">UPLOAD</span>
                                      </>
                                  )}
                              </div>
                              <span 
                                  onClick={triggerFileInput} 
                                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#113b2e] text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-[#0fa979] transition-colors"
                              >
                                  <Edit2 size={10} />
                              </span>
                          </div>
                          
                          <div className="flex-1">
                              <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Member Full Legal Name</span> <span className="text-[#0fa979] bg-[#d1f4e0] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Auto-Assigned Upon Creation</span></label>
                              <input 
                                type="text" 
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="e.g. Dinesh Wickremesinghe" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none" 
                              />
                              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1 font-medium">
                                  <Shield size={12}/> Max file size: 5MB • Formats: JPEG, PNG • Single sign-on profile linked
                              </div>
                          </div>
                      </div>

                      {/* Section 1 */}
                      <div className="mb-10 w-full max-w-4xl mx-auto">
                          <div className="mb-6">
                              <h3 className="text-lg font-bold text-[#113b2e] flex items-center gap-2">
                                <div className="p-1 bg-[#e8f8f2] rounded-md"><Shield size={16} className="text-[#0fa979]"/></div> 
                                Account Identity & Profile
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">Core operator identifiers, system handle mapping, and validated fleet communications.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>System User ID</span> <span className="text-gray-400 font-normal uppercase text-[10px] tracking-wider">IMMUTABLE</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Shield size={16} strokeWidth={2} /></div>
                                      <input type="text" disabled value="USR-2025-AUTO" className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-bold" />
                                      <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 italic">Generated on Save</span>
                                  </div>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Full Name <span className="text-red-500">*</span></span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                      </div>
                                      <input 
                                        type="text" 
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="e.g. Dinesh Wickremesinghe" 
                                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none transition-colors" 
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Corporate Email <span className="text-red-500">*</span></span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                      </div>
                                      <input 
                                        type="email" 
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="e.g. dinesh.w@logifleet.lk" 
                                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none transition-colors" 
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Primary Contact Number <span className="text-red-500">*</span></span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                      </div>
                                      <input type="text" placeholder="e.g. +94 77 123 4567" className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none transition-colors" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Section 2 */}
                      <div className="mb-10 w-full max-w-4xl mx-auto">
                          <div className="mb-6">
                              <h3 className="text-lg font-bold text-[#113b2e] flex items-center gap-2">
                                <div className="p-1 bg-[#e8f8f2] rounded-md"><Store size={16} className="text-[#0fa979]"/></div>
                                Roles, Territory & Status
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">Configure RBAC authorization scope, geofenced hub access, and activation lifecycle.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Access Role <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                      </div>
                                      <select 
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        className={`w-full pl-9 pr-10 py-3 border border-gray-200 rounded-lg text-sm outline-none appearance-none cursor-pointer transition-colors focus:border-[#0fa979] ${newUserRole === '' ? 'text-gray-500 bg-white' : 'text-gray-900 bg-white'}`}
                                      >
                                          <option value="" disabled hidden>Select user role (e.g. Fleet Dispatcher)...</option>
                                          <option value="ADMIN">System Administrator</option>
                                          <option value="STORE MANAGER">Store Manager</option>
                                          <option value="DRIVER">Driver</option>
                                          <option value="STORE EMPLOYEE">Store Employee</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={16}/></div>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Assigned Operating Hub / Store <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                          <Store size={16} />
                                      </div>
                                      <select 
                                        value={newUserStore}
                                        onChange={(e) => setNewUserStore(e.target.value)}
                                        className={`w-full pl-9 pr-10 py-3 border border-gray-200 rounded-lg text-sm outline-none appearance-none cursor-pointer transition-colors focus:border-[#0fa979] ${newUserStore === '' ? 'text-gray-500 bg-white' : 'text-gray-900 bg-white'}`}
                                      >
                                          <option value="" disabled hidden>Select operating facility (e.g. Colombo Main Hub)...</option>
                                          <option value="Colombo Main Store">Colombo Main Store</option>
                                          <option value="Kandy Branch">Kandy Branch</option>
                                          <option value="Galle Warehouse">Galle Warehouse</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={16}/></div>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Department / Unit <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                      </div>
                                      <select className="w-full pl-9 pr-10 py-3 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm outline-none appearance-none cursor-pointer">
                                          <option>Select functional department (e.g. Fleet Operations)...</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={16}/></div>
                                  </div>
                              </div>
                               <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Operational Dispatch Status</label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <CheckCircle2 size={16} />
                                      </div>
                                      <select className="w-full pl-9 pr-10 py-3 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm outline-none appearance-none cursor-not-allowed">
                                          <option>Pending Verification & Invite</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={16}/></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-[#f2fcf7] border border-[#d1f4e0] p-4 rounded-xl flex gap-4 mb-8 w-full max-w-4xl mx-auto">
                          <div className="bg-[#0fa979] w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          </div>
                          <div>
                              <h4 className="text-[13px] font-bold text-gray-900">Automated 48-Hour Zero-Trust Invitation Token</h4>
                              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Upon submission, an encrypted onboarding link with single-use cryptographic token will be dispatched to the corporate email address. FIDO2 / WebAuthn setup is required upon first login.</p>
                          </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-100 w-full max-w-4xl mx-auto">
                          <button className="text-gray-500 text-[13px] font-bold flex items-center gap-2 hover:text-gray-700 transition-colors">
                            <RotateCcw size={14} strokeWidth={2.5}/> Reset Form
                          </button>
                          <div className="flex gap-3">
                              <button onClick={closeView} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-[13px] hover:bg-gray-200 transition-colors">Cancel</button>
                              <button onClick={handleCreateUser} className="flex items-center gap-2 px-6 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-[13px] hover:bg-[#0fa979] transition-colors shadow-sm">
                                <Plus size={16} strokeWidth={2.5}/> Create User
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Right Column - Summaries */}
                  <div className="w-[320px] flex flex-col gap-6">
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-gray-900">User Summary</h3>
                              <span className="bg-[#d1f4e0] text-[#0d9468] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">DRAFT MEMBER</span>
                          </div>
                          <div className="space-y-4 text-[13px]">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Provision Readiness</span>
                                <span className="font-bold text-[#0fa979] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Ready to Provision</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Assigned Role</span>
                                <span className={`font-medium italic ${newUserRole ? 'text-gray-900 not-italic' : 'text-gray-400'}`}>{newUserRole || 'Not Assigned'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Operating Terminal</span>
                                <span className={`font-medium italic ${newUserStore ? 'text-gray-900 not-italic' : 'text-gray-400'}`}>{newUserStore || 'Unassigned Hub'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Identity Realm</span>
                                <span className="font-bold text-gray-900">SSO-LK-REGION</span>
                              </div>
                              <div className="flex justify-between items-start mt-2">
                                <span className="text-gray-500 font-medium">Provisioning SLA</span>
                                <span className="font-bold text-[#0fa979] text-right leading-tight">Instantaneous<br/><span className="text-[11px]">(&lt;500ms)</span></span>
                              </div>
                          </div>
                          <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-gray-500">Identity Cluster<br/>Capacity</span>
                                  <span className="text-gray-900 text-right">1,420 / 2,000<br/>Seats</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex mb-2">
                                  <div className="bg-[#0fa979] h-full" style={{ width: '71%' }}></div>
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">580 available enterprise operator licenses remaining</div>
                          </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2"><CheckCircle2 size={18} className="text-gray-400"/> Security Checklist</h3>
                              <span className="bg-[#d1f4e0] text-[#0d9468] px-2 py-1 rounded text-[10px] font-bold flex flex-col items-center leading-tight"><span>98.4%</span><span className="text-[8px]">SCORE</span></span>
                          </div>
                          <div className="space-y-5">
                              <div className="flex items-start gap-3">
                                  <CheckCircle2 size={16} className="text-[#0fa979] mt-0.5 shrink-0"/>
                                  <div>
                                      <div className="text-[12px] font-bold text-gray-900">Hardware MFA Enforcement</div>
                                      <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">Enforce mandatory Hardware MFA / Authenticator upon initial login.</div>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <CheckCircle2 size={16} className="text-[#0fa979] mt-0.5 shrink-0"/>
                                  <div>
                                      <div className="text-[12px] font-bold text-gray-900">Corporate VPN Telematics Routing</div>
                                      <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">Restrict telematics coordinates to corporate VPN gateway.</div>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <CheckCircle2 size={16} className="text-[#0fa979] mt-0.5 shrink-0"/>
                                  <div>
                                      <div className="text-[12px] font-bold text-gray-900">Audited Governance Trail</div>
                                      <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">Audit trail logged under ISO 27001 / SOC 2 compliance policy.</div>
                                  </div>
                              </div>
                          </div>
                          <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between items-center text-xs">
                              <span className="text-gray-500 flex items-center gap-1.5 font-medium"><RotateCcw size={14}/> System Node Sync Active</span>
                              <span className="font-bold text-gray-900 text-right leading-tight">AES-256 TLS<br/>1.3</span>
                          </div>
                      </div>

                      <div className="bg-[#113b2e] rounded-2xl p-6 text-white shadow-lg">
                          <h3 className="font-bold flex items-center gap-2 mb-3 text-[13px]">
                              <Shield size={16} className="text-[#0fa979]"/> LogiFleet Sentinel Assurance
                          </h3>
                          <p className="text-[11px] text-[#8ba29a] leading-relaxed mb-6">
                              Every modification, creation, and privilege upgrade in the fleet registry is permanently recorded to a SHA-256 tamper-proof ledger block, ensuring continuous regulatory compliance.
                          </p>
                          <div className="flex justify-between items-center text-[10px] text-[#8ba29a]">
                              <span>Ledger Block ID</span>
                              <span className="font-bold text-white tracking-wider">#BLK-890214-LK</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // -------------------------
  // 2. EDIT VIEW COMPONENT
  // -------------------------
  if (currentView === 'edit' && editingUser) {
      return (
          <div className="p-8 bg-[#f8faf9] min-h-screen font-sans">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span>MASTER DATA</span> <span className="text-gray-400">&gt;</span> <span>USER MANAGEMENT</span> <span className="text-gray-400">&gt;</span> <span className="text-[#0fa979]">EDIT USER DETAILS</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-4">
                  <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Edit User Details</h1>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-bold mt-2">{editingUser.id}</span>
                  <span className="bg-[#d1f4e0] text-[#0d9468] px-3 py-1 rounded-full text-sm font-bold mt-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0fa979]"></span> Active Account</span>
                </div>
                <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    <ArrowLeft size={16} /> Back to User List
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-8">
                  {/* Profile Header */}
                  <div className="flex justify-between items-center pb-8 border-b border-gray-100 mb-8 w-full max-w-4xl mx-auto">
                      <div className="flex items-center gap-5">
                          
                          {/* Image Upload Area for Edit */}
                          <div className="relative">
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  onChange={handleImageUpload} 
                                  accept="image/jpeg, image/png" 
                                  className="hidden" 
                              />
                              <div className="w-20 h-20 rounded-full bg-[#113b2e] text-white flex items-center justify-center text-2xl font-bold shadow-sm overflow-hidden border border-gray-200 relative">
                                  {uploadedImage || editingUser.avatar ? (
                                      <img src={uploadedImage || editingUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                      getInitials(editingUser.name)
                                  )}
                                  {/* Green Online Dot inside avatar corner matching image_476386.png */}
                                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#0fa979] border-2 border-white rounded-full"></span>
                              </div>
                              <button onClick={triggerFileInput} className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-2 hover:text-gray-700 cursor-pointer w-full justify-center">
                                  <ImageIcon size={12}/> Replace Photo
                              </button>
                          </div>
                          
                          <div>
                              <div className="flex items-center gap-3">
                                  <h2 className="text-xl font-bold text-gray-900">{editingUser.name}</h2>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">EMPLOYEE</span>
                              </div>
                              <div className="text-gray-500 text-sm mt-1 flex items-center gap-4">
                                  <span className="flex items-center gap-1"><Shield size={14}/> ID: EMP-9021</span>
                                  <span className="flex items-center gap-1"><Store size={14}/> Hub: {editingUser.store}</span>
                              </div>
                              <div className="text-[#0fa979] text-sm mt-1 flex items-center gap-1 font-medium">
                                  <Shield size={14}/> Depot Supervisor (Operations)
                              </div>
                          </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                          <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LAST ACTIVITY</div>
                              <div className="text-sm font-bold text-gray-900">Today, 08:42 AM<br/><span className="text-gray-500">IST</span></div>
                          </div>
                          <History className="text-gray-400" size={24} />
                      </div>
                  </div>

                  {/* Form Sections */}
                  <div className="w-full max-w-4xl mx-auto">
                      {/* Section 1 */}
                      <div className="mb-10">
                          <div className="flex justify-between items-end mb-4">
                              <div>
                                  <h3 className="text-lg font-bold text-gray-900">Account Identity & Profile</h3>
                                  <p className="text-sm text-gray-500">Update identity parameters, primary communication channels, and directory records.</p>
                              </div>
                              <div className="text-xs font-bold text-gray-400 tracking-wider">SECTION 01 / 02</div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>System User ID</span> <span className="text-gray-400 font-normal flex items-center gap-1"><Lock size={12}/> Read-only system key</span></label>
                                  <input type="text" disabled value={editingUser.id} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium" />
                                  <p className="text-xs text-gray-400 mt-1">Globally unique immutable reference assigned by LogiFleet identity core.</p>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Full Name <span className="text-red-500">*</span></span> <span className="text-[#0fa979] font-normal">Verified Profile</span></label>
                                  <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none pr-10" 
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">Shown across manifest sign-offs, freight waybills, and driver logs.</p>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Corporate Email <span className="text-red-500">*</span></span> <span className="text-gray-400 font-normal">SSO Enabled</span></label>
                                  <div className="relative">
                                    <input 
                                        type="email" 
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none pr-10" 
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Receives high-priority consignment exceptions and dispatch escalation pings.</p>
                              </div>
                              <div>
                                  <label className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Primary Contact Number</span> <span className="text-gray-400 font-normal">Direct Mobile</span></label>
                                  <div className="relative">
                                    <input type="text" defaultValue="+94 77 234 5678" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none pr-10" />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Used for driver-depot WhatsApp gateway alerts and field voice queries.</p>
                              </div>
                          </div>
                      </div>

                      {/* Section 2 */}
                      <div className="mb-10">
                          <div className="flex justify-between items-end mb-4">
                              <div>
                                  <h3 className="text-lg font-bold text-gray-900">Roles, Territory & Status</h3>
                                  <p className="text-sm text-gray-500">Designate clearance tiers, physical fulfillment hubs, and real-time operational availability.</p>
                              </div>
                              <div className="text-xs font-bold text-gray-400 tracking-wider">SECTION 02 / 02</div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Access Role & Permission Tier <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                    <select 
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="ADMIN">System Administrator</option>
                                        <option value="STORE MANAGER">Store Manager (Depot Lead)</option>
                                        <option value="STORE EMPLOYEE">Store Employee</option>
                                        <option value="DRIVER">Driver</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600"><ChevronDown size={16}/></div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Governs load approval authorization, driver dispatching, and rate overrides.</p>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Assigned Operational Store / Hub <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0fa979]">
                                          <Store size={16} />
                                      </div>
                                      <select 
                                        value={newUserStore}
                                        onChange={(e) => setNewUserStore(e.target.value)}
                                        className="w-full pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none appearance-none cursor-pointer"
                                      >
                                          <option value="Colombo Main Store">Colombo Main Store (Western Terminal)</option>
                                          <option value="Kandy Branch">Kandy Branch</option>
                                          <option value="Galle Warehouse">Galle Warehouse</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600"><ChevronDown size={16}/></div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Default staging dock for inventory scans and automated manifests.</p>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Department & Functional Team</label>
                                  <div className="relative">
                                      <select className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none appearance-none cursor-pointer pr-10">
                                          <option>Depot Operations & Inbound Staging</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                      </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Internal organizational mapping for payroll and dispatch shifts.</p>
                              </div>
                               <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-2">Operational Dispatch Status <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0d9468]">
                                        <span className="w-2 h-2 rounded-full bg-[#0d9468]"></span>
                                      </div>
                                      <select 
                                        value={newUserStatus}
                                        onChange={(e) => setNewUserStatus(e.target.value)}
                                        className="w-full pl-8 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#0fa979] outline-none appearance-none cursor-pointer"
                                      >
                                          <option value="Active">Active — In Station & Available</option>
                                          <option value="Inactive">Inactive</option>
                                          <option value="On Leave">On Leave</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600"><ChevronDown size={16}/></div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Changing to Inactive terminates live authenticated sessions instantly.</p>
                              </div>
                          </div>
                      </div>

                      <div className="bg-[#f2fcf7] border border-[#d1f4e0] p-4 rounded-xl flex gap-4 mb-8">
                          <div className="bg-[#0fa979] w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          </div>
                          <div className="flex-1">
                              <h4 className="text-[13px] font-bold text-gray-900">Automatic Dispatch Synchronization Notice</h4>
                              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Modifying store assignments or clearance levels updates in-transit EDI dispatch boards within <span className="font-bold text-gray-900">60 seconds.</span> Active shipments under route authorization will maintain current sign-offs until consignment handoff completes.</p>
                          </div>
                          <div className="text-gray-400 text-xs font-medium">EDI-SEC-V4</div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                          <button className="text-gray-500 text-sm font-bold flex items-center gap-2 hover:text-gray-700"><RotateCcw size={16}/> Reset Fields</button>
                          <div className="flex gap-3">
                              <button onClick={closeView} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200">Cancel</button>
                              <button onClick={handleEditUser} className="px-6 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-sm hover:bg-[#0fa979] flex items-center gap-2">
                                <CheckCircle2 size={16} strokeWidth={2.5}/> Save Changes
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // -------------------------
  // 3. MAIN LIST VIEW
  // -------------------------
  return (
    <div className="p-8 bg-[#f8faf9] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>MASTER DATA</span> <span className="text-gray-400">&gt;</span> <span className="text-[#0fa979]">USER MANAGEMENT</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                REGION: SRI LANKA CENTRAL (CMB/KDY/GAL)
            </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-gray-900 leading-tight">User Management</h1>
          <div className="flex gap-3 mt-3 text-xs font-bold uppercase tracking-wider">
            <span className="bg-gray-200 px-3 py-1.5 rounded-md text-gray-700">TOTAL USERS: {users.length}</span>
            <span className="bg-[#d1f4e0] px-3 py-1.5 rounded-md text-[#0d9468] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> ACTIVE: {users.filter(u=>u.status==='Active').length}
            </span>
            <span className="bg-gray-200 px-3 py-1.5 rounded-md text-gray-500">PENDING / INACTIVE: {users.length - users.filter(u=>u.status==='Active').length}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} /> Export Users CSV
          </button>
          <button onClick={() => setCurrentView('add')} className="flex items-center gap-2 bg-[#113b2e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0fa979] transition-colors shadow-sm">
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Active Fleet Drivers Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">ACTIVE FLEET DRIVERS</div>
              <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                {users.filter(u => u.role === 'DRIVER').length} <span className="text-sm font-medium text-gray-500">Drivers</span>
              </div>
            </div>
            <div className="bg-[#e8f8f2] p-2.5 rounded-xl text-[#0fa979]"><Truck size={20} strokeWidth={2.5} /></div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#0d9468]">
              <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  92.3% Dispatched / On-Route
              </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
              <div className="bg-[#113b2e] h-full" style={{ width: '92.3%' }}></div>
          </div>
        </div>
        
        {/* Store Personnel Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">STORE & DEPOT PERSONNEL</div>
              <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                {users.filter(u => u.role === 'STORE MANAGER' || u.role === 'STORE EMPLOYEE').length} <span className="text-sm font-medium text-gray-500">Managers & Staff</span>
              </div>
            </div>
            <div className="bg-[#e8f8f2] p-2.5 rounded-xl text-[#0fa979]"><Store size={20} strokeWidth={2.5} /></div>
          </div>
           <div className="flex items-center justify-between text-xs font-semibold text-[#0d9468]">
              <div className="flex items-center gap-1.5">
                 <Shield size={14} strokeWidth={2.5} /> Distributed across 3 hubs
              </div>
              <div className="text-gray-400 font-medium">CMB / KDY / GAL</div>
          </div>
           <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
              <div className="bg-[#113b2e] h-full" style={{ width: '40%' }}></div>
              <div className="bg-[#0fa979] h-full" style={{ width: '30%' }}></div>
              <div className="bg-gray-800 h-full" style={{ width: '20%' }}></div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">SECURITY & ACCESS COMPLIANCE</div>
              <div className="text-3xl font-bold text-[#0fa979] flex items-baseline gap-2">
                100% <span className="text-sm font-medium text-gray-500">2FA Enforced</span>
              </div>
            </div>
            <div className="bg-[#e8f8f2] p-2.5 rounded-xl text-[#0fa979]"><Shield size={20} strokeWidth={2.5} /></div>
          </div>
           <div className="flex items-center justify-between text-xs font-semibold text-[#113b2e]">
              <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#113b2e]"></span> Role-based SSO active
              </div>
              <div className="text-gray-500 font-medium">Azure AD / Okta Sync</div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
              <div className="bg-[#113b2e] h-full w-full"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] overflow-hidden">
        
        {/* Filters Section */}
        <div className="p-6 flex flex-wrap gap-4 items-center bg-white border-b border-gray-100">
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user ID, full name, email, employee badge" 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-[#0fa979]/20 focus:border-[#0fa979]/30 transition-all" 
            />
          </div>
          
          <div className="relative">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none bg-gray-50 border border-gray-100 rounded-xl pl-5 pr-10 py-2.5 text-[13px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0fa979]/20 hover:bg-gray-100 transition-colors cursor-pointer min-w-[140px]">
                  <option value="All Roles">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STORE MANAGER">Store Manager</option>
                  <option value="DRIVER">Driver</option>
                  <option value="STORE EMPLOYEE">Store Employee</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2.5}/>
              </div>
          </div>

           <div className="relative">
              <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="appearance-none bg-gray-50 border border-gray-100 rounded-xl pl-5 pr-10 py-2.5 text-[13px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0fa979]/20 hover:bg-gray-100 transition-colors cursor-pointer min-w-[140px]">
                  <option value="All Stores">All Stores</option>
                  <option value="Colombo Main Store">Colombo Main Store</option>
                  <option value="Kandy Branch">Kandy Branch</option>
                  <option value="Galle Warehouse">Galle Warehouse</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2.5}/>
              </div>
          </div>

           <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-gray-50 border border-gray-100 rounded-xl pl-5 pr-10 py-2.5 text-[13px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0fa979]/20 hover:bg-gray-100 transition-colors cursor-pointer min-w-[140px]">
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2.5}/>
              </div>
          </div>

          <button onClick={resetFilters} className="flex items-center gap-2 text-[#4f6782] bg-gray-50 border border-gray-100 px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-gray-100 transition-colors ml-auto">
              <RotateCcw size={14} strokeWidth={2.5} /> Reset Filters
          </button>
        </div>

        {/* Data Table */}
        <table className="w-full text-left">
          <thead className="bg-[#fcfdfc] border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 w-12 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0fa979] focus:ring-[#0fa979]" />
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SYSTEM USER ID</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">FULL NAME & CONTACT INFO</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ROLE</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ASSIGNED STORE</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">OPERATIONAL STATUS</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500 font-medium">No users found matching your filters.</td>
                </tr>
            ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-6 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0fa979] focus:ring-[#0fa979]" />
                    </td>
                    <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">{user.id}</span>
                            {user.role === 'ADMIN' && <span className="text-[10px] font-bold text-[#0fa979] uppercase tracking-wider">ROOT</span>}
                        </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                          {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : user.role === 'ADMIN' || user.role === 'DRIVER' ? (
                               <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold border border-gray-200">
                                  {getInitials(user.name)}
                              </div>
                          )}
                          
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                            <div className="text-gray-500 text-[11px] mt-0.5">
                                {user.role === 'ADMIN' ? 'Manager' : user.role === 'STORE MANAGER' ? 'Supervisor' : user.role === 'DRIVER' ? 'Driver' : 'Associate'} • {user.email}
                            </div>
                          </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            {user.store.includes('Store') ? <Store size={14} className="text-gray-400" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>}
                            {user.store}
                        </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Active' ? 'bg-[#d1f4e0]/50 text-[#0d9468]' : 
                          user.status === 'On Leave' ? 'bg-gray-100 text-gray-500' : 
                          'bg-gray-100 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-[#0fa979]' : 
                            user.status === 'On Leave' ? 'bg-gray-400' : 
                            'bg-gray-300'
                        }`}></span>
                        {user.status}
                      </div>
                    </td>
                    
                    <td className="py-5 px-6">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <button onClick={() => openEditUser(user)} className="p-1 hover:text-[#113b2e] hover:bg-gray-100 rounded transition-colors"><Edit2 size={16} strokeWidth={2.5} /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        <div className="p-5 border-t border-gray-100 flex flex-wrap items-center justify-between text-[13px] text-gray-600 font-medium bg-white">
            <div className="flex items-center gap-6">
                <span>Showing <span className="font-bold text-gray-900">1 - {filteredUsers.length < 8 ? filteredUsers.length : 8}</span> of {filteredUsers.length} users</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">PER PAGE:</span>
                    <select className="bg-gray-100 border-none rounded-lg px-3 py-1.5 outline-none text-gray-900 font-semibold cursor-pointer appearance-none">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"><ChevronLeft size={16} strokeWidth={2.5} /></button>
                <button className="w-8 h-8 rounded-lg bg-[#113b2e] text-white flex items-center justify-center font-bold shadow-sm">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-900 font-bold transition-colors">2</button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-900 font-bold transition-colors">3</button>
                <span className="px-1 text-gray-400 font-bold tracking-widest">...</span>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-900 font-bold transition-colors">6</button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={16} strokeWidth={2.5} /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
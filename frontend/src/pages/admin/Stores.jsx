import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Store as StoreIcon, MapPin, Clock, Shield, CheckCircle2, ArrowLeft, RotateCcw, Download, ChevronDown, Building2, Box, Truck, Maximize, Minus } from 'lucide-react';

export default function Stores() {
  const [stores, setStores] = useState([
    { 
      id: 'ST-CMB-01', 
      name: 'Colombo Main Store', 
      region: 'Western Province',
      subRegion: '(Colombo & Gampaha Districts)', 
      address: 'Primary Central Distribution & Cold Hub, Peliyagoda', 
      coordinates: '6.9742° N, 79.8893° E', 
      hours: '08:00 AM - 05:00 PM (Mon - Sat)', 
      capacity: '24,000 MT', 
      docks: '16 Active Docks',
      utilization: 69, 
      status: 'Active',
      phone: '+94 11 234 5678',
      rules: 'Max 2 trucks per hour / 45-min bay turnaround',
      operationalClass: 'Highlands Agro & Cold Transit Depot',
      operationalDetails: 'Tier-2 Cold storage certification with backup power integration.'
    },
    { 
      id: 'ST-KND-02', 
      name: 'Kandy Regional Depot', 
      region: 'Central Province',
      subRegion: '(Kandy District)', 
      address: 'Central Highlands Transit & Agro Hub, Katugastota', 
      coordinates: '7.3297° N, 80.6224° E', 
      hours: '08:00 AM - 05:00 PM (Mon - Sat)', 
      capacity: '12,500 MT', 
      docks: '8 Active Docks', 
      utilization: 45,
      status: 'Operational',
      phone: '+94 81 234 8840',
      rules: 'Max 2 trucks per hour',
      operationalClass: 'Highlands Agro & Cold Transit Depot',
      operationalDetails: 'Tier-2 Cold storage certification with backup power integration.'
    },
    { 
      id: 'ST-GAL-03', 
      name: 'Galle Coastal Staging', 
      region: 'Southern Province',
      subRegion: '(Galle District)', 
      address: 'Southern Maritime Corridor & Reefer Staging, Galle Port', 
      coordinates: '6.0535° N, 80.2210° E', 
      hours: '09:00 AM - 05:00 PM', 
      capacity: '18,200 MT', 
      docks: '10 Active Docks',
      utilization: 85, 
      status: 'Active',
      phone: '+94 91 222 3344',
      rules: 'Reefer priority scheduling',
      operationalClass: 'Coastal Maritime Staging Depot',
      operationalDetails: 'Tier-1 Port clearance staging with deep freeze capacity.'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [capacityFilter, setCapacityFilter] = useState('Capacity');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [currentView, setCurrentView] = useState('list');
  const [editingStore, setEditingStore] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(100);

  const [storeName, setStoreName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [rules, setRules] = useState('');
  const [capacity, setCapacity] = useState('');
  const [operationalClass, setOperationalClass] = useState('');
  const [operationalDetails, setOperationalDetails] = useState('');

  // Toggle states for regulatory checkboxes (Edit View)
  const [fireClearance, setFireClearance] = useState(true);
  const [councilApproval, setCouncilApproval] = useState(true);
  const [perimeterSecurity, setPerimeterSecurity] = useState(true);

  const filteredStores = stores.filter(s => 
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (regionFilter === 'All Regions' || s.region === regionFilter) &&
    (statusFilter === 'Status' || s.status === statusFilter)
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this store facility?')) {
      setStores(stores.filter(s => s.id !== id));
    }
  };

  const openEditStore = (store) => {
    setEditingStore(store);
    setStoreName(store.name);
    setDistrict(store.region);
    setAddress(store.address);
    setCoordinates(store.coordinates);
    setPhone(store.phone || '');
    setHours(store.hours);
    setRules(store.rules || '');
    setCapacity(store.capacity);
    setOperationalClass(store.operationalClass || '');
    setOperationalDetails(store.operationalDetails || '');
    setFireClearance(true);
    setCouncilApproval(true);
    setPerimeterSecurity(true);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
    setEditingStore(null);
    setStoreName('');
    setDistrict('');
    setAddress('');
    setCoordinates('');
    setPhone('');
    setHours('');
    setRules('');
    setCapacity('');
    setOperationalClass('');
    setOperationalDetails('');
    setZoomLevel(100);
  };

  const handleCreateStore = (e) => {
    e.preventDefault();
    if (!storeName || !address || !coordinates) {
      alert('Please fill in required fields.');
      return;
    }
    const newStore = {
      id: `ST-NEW-0${stores.length + 1}`,
      name: storeName,
      region: district || 'Western Province',
      subRegion: '',
      address: address,
      coordinates: coordinates,
      hours: hours || '08:00 AM - 05:00 PM',
      capacity: '10,000 MT',
      docks: '4 Active Docks',
      utilization: 0,
      status: 'Active',
      phone: phone,
      rules: rules,
      operationalClass: operationalClass || 'Standard Transit Depot',
      operationalDetails: operationalDetails || 'Standard storage operations.'
    };
    // Added to the end (bottom) of the list as requested
    setStores([...stores, newStore]); 
    closeView();
  };

  const handleUpdateStore = (e) => {
    e.preventDefault();
    const updatedStores = stores.map(s => 
      s.id === editingStore.id 
        ? { ...s, name: storeName, region: district, address: address, coordinates: coordinates, phone: phone, hours: hours, rules: rules, capacity: capacity, operationalClass: operationalClass, operationalDetails: operationalDetails }
        : s
    );
    setStores(updatedStores);
    closeView();
  };

  const handleExportCSV = () => {
    const headers = ['Store ID', 'Store Name', 'Region', 'Address', 'Coordinates', 'Operating Hours', 'Capacity', 'Docks', 'Status'];
    const csvRows = filteredStores.map(store => {
      return [
        store.id, `"${store.name}"`, `"${store.region} ${store.subRegion}"`, `"${store.address}"`, `"${store.coordinates}"`,
        `"${store.hours}"`, `"${store.capacity}"`, `"${store.docks}"`, store.status
      ].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logifleet_stores_export.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 50));
  const handleZoomReset = () => setZoomLevel(100);

  if (currentView === 'add') {
    return (
      <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">ADD NEW STORE</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Add New Store</h1>
            <span className="bg-[#f0f2f5] text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> DRAFT RECORD
            </span>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Store List
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-[1100px]">
          <div className="mb-8 flex flex-col items-start border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-[#0fa979] flex items-center gap-2">
              <StoreIcon size={18} /> New Store Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">Enter facility specifications and loading slot parameters for system registration.</p>
          </div>

          <form onSubmit={handleCreateStore} className="space-y-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Store Name <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">Facility Identifier</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><StoreIcon size={16} /></div>
                  <input 
                    type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g., Colombo Main Store, Kandy Depot" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Administrative District <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">SL Province</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                  <select 
                    value={district} onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none appearance-none"
                    required
                  >
                    <option value="">Select Western, Central or Southern District</option>
                    <option value="Western Province">Western Province</option>
                    <option value="Central Province">Central Province</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Full Postal Address <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">Delivery Gate / Access Route</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                  <input 
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., No. 45/2, Peliyagoda Logistics Park, Kandy Road, Kelaniya" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Coordinates (Latitude / Longitude)</span> 
                  <span className="text-[#0fa979] font-bold flex items-center gap-1">Detect GPS</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                  <input 
                    type="text" value={coordinates} onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g., 6.9742, 79.8893 (Colombo Central Grid)" 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#0fa979]"><CheckCircle2 size={14} /></div>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Facility Hotline / In-Charge Phone <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">Direct Dispatch</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><span className="text-lg leading-none">✆</span></div>
                  <input 
                    type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +94 11 234 5678" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Operating Hours <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">Receiving Windows</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Clock size={16} /></div>
                  <input 
                    type="text" value={hours} onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g., 08:00 AM - 05:00 PM (Mon - Sat)" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                  <span>Loading Slot Rules <span className="text-red-500">*</span></span> 
                  <span className="text-gray-400 font-normal">Throughput Constraints</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Truck size={16} /></div>
                  <input 
                    type="text" value={rules} onChange={(e) => setRules(e.target.value)}
                    placeholder="e.g., Max 2 trucks per hour / 45-min bay turnaround" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                  />
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-1.5">
                  <span>Facility Operational Class</span>
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield size={14} className="text-[#0d9468]"/></div>
                   <input 
                     type="text" value={operationalClass} onChange={(e) => setOperationalClass(e.target.value)} 
                     placeholder="e.g., Highlands Agro & Cold Transit Depot"
                     className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-700 outline-none focus:border-[#0fa979] shadow-sm"
                   />
                </div>
                <input 
                   type="text" value={operationalDetails} onChange={(e) => setOperationalDetails(e.target.value)} 
                   placeholder="e.g., Tier-2 Cold storage certification with backup power integration."
                   className="w-full mt-1.5 bg-transparent border border-gray-100 rounded-lg text-[10px] text-gray-500 outline-none focus:border-[#0fa979] p-2 leading-tight"
                />
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold text-[#113b2e] flex items-center gap-1.5"><Shield size={14} className="text-[#0fa979]"/> Geofence & Dispatch Terminal Coordinates</span>
                <span className="text-[10px] bg-[#f0f9f4] text-[#0d9468] px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1 border border-[#0d9468]/10"><RotateCcw size={10} strokeWidth={3}/> Auto-detect from Postal Address</span>
              </div>
              <div className="w-full h-[280px] bg-[#e4dfd9] rounded-xl relative overflow-hidden border border-gray-200">
                <div className="absolute inset-0 opacity-100 transition-transform duration-300" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', transform: `scale(${zoomLevel / 100})` }}></div>
                
                <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-2 rounded-full shadow font-bold text-[11px] text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0d9468]/10 flex items-center justify-center"><MapPin size={12} className="text-[#0d9468]"/></span> Target Grid: Peliyagoda Logistic Zone
                </div>
                <div className="absolute bottom-4 right-4 bg-[#113b2e] text-white px-4 py-2 rounded-full shadow-md font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                  <span className="text-[#0fa979]">●</span> LAT: 6.9749° | LON: 79.8813°
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#0fa979]/30 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-[#113b2e] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                           <StoreIcon size={14} className="text-white"/>
                        </div>
                    </div>
                    <div className="mt-2 bg-[#113b2e] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                        <span className="text-[#0fa979] mr-1">●</span> LK-PELIYAGODA-WH01
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                   <button type="button" onClick={handleZoomIn} className="w-8 h-8 bg-white rounded flex items-center justify-center shadow text-gray-700 hover:bg-gray-50 border border-gray-100 cursor-pointer"><Plus size={16} strokeWidth={2.5}/></button>
                   <button type="button" onClick={handleZoomOut} className="w-8 h-8 bg-white rounded flex items-center justify-center shadow text-gray-700 hover:bg-gray-50 border border-gray-100 cursor-pointer"><Minus size={16} strokeWidth={2.5}/></button>
                   <button type="button" onClick={handleZoomReset} className="w-8 h-8 bg-white rounded flex items-center justify-center shadow text-gray-700 hover:bg-gray-50 border border-gray-100 cursor-pointer">
                     <Maximize size={14} strokeWidth={2.5}/>
                   </button>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5">
                 <Shield size={12} className="text-gray-400"/> ENCRYPTED MASTER DATA RECORD • SRI LANKA NATIONAL LOGISTICS NETWORK
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setStoreName(''); setAddress(''); setCoordinates(''); }} className="text-gray-500 text-xs font-bold flex items-center gap-1.5 hover:text-gray-700">
                <RotateCcw size={14} strokeWidth={2} /> Reset Form
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={closeView} className="px-8 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-xs hover:bg-[#0fa979] flex items-center gap-2 shadow-sm">
                  <StoreIcon size={14} /> Save Store
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (currentView === 'edit' && editingStore) {
    return (
      <div className="bg-[#f8faf9] min-h-full font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">{editingStore.id}</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Edit Store Details</h1>
              <span className="text-sm font-bold text-[#0fa979]">({editingStore.id})</span>
              <span className="bg-[#d1f4e0] text-[#0d9468] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Operational & Active
              </span>
              <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46-3.04"/></svg> Synchronized
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Configure spatial geofencing, regulatory credentials, and depot throughput metrics for Ceylon island supply route.</p>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Store List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
              <div className="absolute top-6 right-6 bg-gray-100 text-gray-400 font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded">LK-HUB-CEN</div>
              
              <h3 className="text-sm font-bold text-[#113b2e] mb-1 flex items-center gap-2">
                <StoreIcon size={16} className="text-[#0fa979]" /> Store Identity & Location
              </h3>
              <p className="text-[11px] text-gray-500 mb-6">Facility operational identification and territorial logistics parameters.</p>
              
              <form id="editForm" onSubmit={handleUpdateStore} className="space-y-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      <span>STORE MASTER CODE</span> 
                      <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                    </label>
                    <div className="relative">
                      <input type="text" disabled value={editingStore.id} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none" />
                      <div className="absolute inset-y-0 right-2 flex items-center">
                         <span className="bg-gray-200 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">LOCKED</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Immutable enterprise registry identifier for Kandy Central.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Store Facility Name</span>
                    </label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-[#0fa979]" />
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Public depot signage & bill of lading name.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Administrative Region</span>
                    </label>
                    <div className="relative">
                      <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 outline-none appearance-none">
                        <option value="Central Province (Kandy District)">Central Province (Kandy District)</option>
                        <option value="Western Province (Colombo)">Western Province (Colombo)</option>
                        <option value="Southern Province (Galle)">Southern Province (Galle)</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Assigned regional fleet zoning: Sector LK-C2.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Nominal Storage Capacity</span>
                    </label>
                    <div className="relative">
                      <input type="text" value="500" readOnly className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#0fa979]" />
                      <div className="absolute inset-y-0 right-2 flex items-center">
                         <span className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">MT</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Certified dynamic static floor weight rating.</p>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-1.5">
                      <span>Facility Operational Class</span>
                    </label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield size={14} className="text-[#0d9468]"/></div>
                       <input 
                         type="text" value={operationalClass} onChange={(e) => setOperationalClass(e.target.value)} 
                         className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-700 outline-none focus:border-[#0fa979] shadow-sm"
                       />
                    </div>
                    <input 
                       type="text" value={operationalDetails} onChange={(e) => setOperationalDetails(e.target.value)} 
                       className="w-full mt-1.5 bg-transparent border-none text-[10px] text-gray-500 outline-none focus:ring-0 p-0 leading-tight"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Consolidated Physical Address</span>
                    </label>
                    <textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      rows="2"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-[#0fa979] resize-none"
                    />
                    <p className="text-[9px] text-gray-400 mt-1 leading-tight">Validated postal code routing anchor point.</p>
                  </div>

                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
              <div className="absolute top-6 right-6 text-gray-400 font-bold text-[9px] uppercase tracking-widest">METRICS SNAPSHOT</div>
              <h3 className="text-sm font-bold text-[#113b2e] mb-4 flex items-center gap-2">
                <Truck size={16} className="text-[#0fa979]" /> Dock & Operational Throughput
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#113b2e] rounded-lg flex items-center justify-center text-white"><Truck size={20}/></div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">LOADING BAYS</div>
                    <div className="text-lg font-bold text-gray-900 leading-none mb-1">8 Active<br/>Docks</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Bays #1-4 Heavy Trailer /<br/>#5-8 Box Van</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#113b2e] rounded-lg flex items-center justify-center text-white"><Clock size={20}/></div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">DISPATCH WINDOW</div>
                    <div className="text-sm font-bold text-gray-900 leading-tight mb-1">06:00 - 22:00 IST</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Daily Transit Window (16h<br/>Shift)</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700">
                     <Box size={12} className="text-[#0fa979]"/> Current Storage Utilization
                   </div>
                   <div className="text-[10px] font-bold text-gray-900">
                     340 MT / 500 MT (68.0%)
                   </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-[#113b2e] rounded-full w-[68%]"></div>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                   <span className="text-gray-500">Buffer Margin: 160 MT Reserve Capacity Available</span>
                   <span className="text-[#0d9468] font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#0fa979]"></span> Optimal Zone</span>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#113b2e] mb-1 flex items-center gap-2">
                <Shield size={16} className="text-[#0fa979]" /> Regulatory & Safety
              </h3>
              <p className="text-[10px] text-gray-500 mb-6 leading-tight">Statutory municipal permits, safety compliance, and depot physical security protocols.</p>
              
              <div className="space-y-6">
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 mb-0.5">Fire Safety Clearance</div>
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">Certified by Kandy<br/>Municipal Council &<br/>Central Fire Services<br/>through Dec 2026.</div>
                    <div className="text-[9px] text-[#0d9468] font-bold flex items-center gap-1"><CheckCircle2 size={10}/> Audited 12 Jan 2026</div>
                  </div>
                  <div 
                    onClick={() => setFireClearance(!fireClearance)}
                    className={`w-8 h-4 rounded-full relative cursor-pointer mt-1 transition-colors ${fireClearance ? 'bg-[#113b2e]' : 'bg-gray-300'}`}
                  >
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${fireClearance ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 mb-0.5">Local Council Approval</div>
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">Katugastota Pradeshiya<br/>Sabha commercial<br/>freight warehouse<br/>license active.</div>
                    <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1">↳ Lic. #KPS/FRT/8823</div>
                  </div>
                  <div 
                    onClick={() => setCouncilApproval(!councilApproval)}
                    className={`w-8 h-4 rounded-full relative cursor-pointer mt-1 transition-colors ${councilApproval ? 'bg-[#113b2e]' : 'bg-gray-300'}`}
                  >
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${councilApproval ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 mb-0.5">Perimeter Security Active</div>
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">24/7 static perimeter<br/>security and<br/>monitored CCTV telemetry<br/>linked to<br/>Central Command.</div>
                    <div className="text-[9px] text-[#0d9468] font-bold flex items-center gap-1"><Shield size={10}/> 16 IP Feeds Synchronized</div>
                  </div>
                  <div 
                    onClick={() => setPerimeterSecurity(!perimeterSecurity)}
                    className={`w-8 h-4 rounded-full relative cursor-pointer mt-1 transition-colors ${perimeterSecurity ? 'bg-[#113b2e]' : 'bg-gray-300'}`}
                  >
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${perimeterSecurity ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div className="bg-[#f0f9f4] p-3 rounded-lg border border-[#0fa979]/20 flex items-start gap-2">
                   <CheckCircle2 size={14} className="text-[#0fa979] shrink-0 mt-0.5"/>
                   <div>
                     <div className="text-[10px] font-bold text-[#113b2e] mb-0.5">National Plant Quarantine & Agro Clearance</div>
                     <div className="text-[9px] text-gray-600 leading-tight">Certified for Ceylon Spice & Tea Inland Staging.<br/>Periodic fumigation seal verified by Sri Lanka<br/>Export Development Board.</div>
                   </div>
                </div>

              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
              <div className="absolute top-6 right-6 bg-[#d1f4e0] text-[#0d9468] font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded">Active<br/>Mesh</div>
              
              <h3 className="text-sm font-bold text-[#113b2e] mb-6 flex items-center gap-2 w-2/3">
                <MapPin size={16} className="text-[#0fa979]" /> Facility Contact & Geofence
              </h3>
              
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#113b2e] rounded-full flex items-center justify-center text-white text-[10px] font-bold">RJ</div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">Rohan Jayasuriya</div>
                      <div className="text-[9px] text-gray-500">Depot Operations<br/>Manager</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                    <span className="text-gray-400">✆</span> +94 71 233<br/>8840
                 </div>
              </div>

              <div className="flex justify-between items-center mb-4 text-[10px]">
                 <div className="flex items-center gap-1 font-bold text-gray-700">
                    <MapPin size={12} className="text-gray-400"/> Coordinates:
                 </div>
                 <div className="font-extrabold text-gray-900">7.3297° N,<br/>80.6224° E</div>
                 <div className="text-gray-400 text-right leading-tight">Katugastota<br/>Gateway</div>
              </div>

              <div className="w-full h-[140px] bg-gray-100 rounded-xl relative overflow-hidden mb-3">
                <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-300" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')`, transform: `scale(${zoomLevel / 100})` }}></div>
                <div className="absolute bottom-3 left-3 bg-white/95 px-2 py-1.5 rounded-lg shadow-sm font-bold text-[9px] text-gray-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0d9468]/20 flex items-center justify-center"><MapPin size={8} className="text-[#0d9468]"/></span> 
                  Katugastota Depot<br/>Geofence
                </div>
                <div className="absolute bottom-3 right-3 bg-[#d1f4e0]/90 text-[#0d9468] px-2 py-1.5 rounded-lg shadow-sm font-bold text-[9px] text-right">
                  Radius 800m :<br/>ACTIVE
                </div>
              </div>

              <div className="flex justify-between items-end text-[9px]">
                 <div className="text-gray-500 leading-tight w-2/3">Auto-dispatch triggered upon perimeter<br/>crossing.</div>
                 <div className="text-[#0fa979] font-bold flex items-center gap-1 cursor-pointer">Recalibrate<br/>Mesh <ArrowLeft size={10} className="rotate-180"/></div>
              </div>

            </div>
          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto mt-6 bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex justify-between items-center">
           <div className="flex items-center gap-4 text-[9px] text-gray-400 font-medium">
             <div className="flex items-center gap-1"><span className="w-1 h-1 bg-[#0fa979] rounded-full"></span> Last synchronized by <span className="font-bold text-gray-700">Nuwan Perera</span> on 24 Feb 2025 at 09:15 IST</div>
             <div>•</div>
             <div>Audit Hash: #0xKND6829F</div>
           </div>
           
           <div className="flex gap-4 items-center">
              <button type="button" onClick={closeView} className="text-[11px] font-bold text-gray-500 hover:text-gray-700">Discard Changes</button>
              <button type="submit" form="editForm" className="px-5 py-2 bg-[#113b2e] text-white rounded-lg font-bold text-[11px] hover:bg-[#0fa979] flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={14} /> Save Store Changes
              </button>
           </div>
        </div>

      </div>
    );
  }

  return (
    <div className="bg-[#f8faf9] min-h-full font-sans text-gray-800">
      
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#173F35]">Store Management</h1>
            <span className="bg-[#d1f4e0] text-[#0d9468] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">3 Active Hubs</span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">Central freight distribution depots, cold-chain hubs, and coastal maritime staging points across Sri Lanka.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-all">
            <Download size={14} strokeWidth={2.5}/> Export CSV
          </button>
          <button 
            onClick={() => setCurrentView('add')} 
            className="flex items-center gap-2 bg-[#113b2e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0fa979] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Store
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL STORES</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">3 Stores</div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
               <Building2 size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-1/2 leading-tight">Western, Central & Southern<br/>Corridors</div>
             <div className="text-[10px] text-[#0d9468] font-bold flex flex-col items-end leading-tight">
               <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> +100%</div>
               <span>Operational</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL STORAGE CAPACITY</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">54,700 MT</div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
              <Box size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-2/3 leading-tight">38,200 MT Current Utilization<br/>(69.8%)</div>
             <div className="text-[10px] text-gray-400 font-bold flex flex-col items-end leading-tight">
               <span>Dry & Cold</span>
               <span>Storage</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ACTIVE DOCK UTILIZATION</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">82.4%</div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
              <Truck size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-2/3 leading-tight">28 of 34 Active Loading Bays<br/>in rotation</div>
             <div className="text-[10px] text-[#0d9468] font-bold flex items-center gap-1.5 leading-tight text-right">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
               <span>Nominal<br/>Flow</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
        <div className="p-3 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store ID, name, district, or facility type..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-[13px] text-gray-600 outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 border border-transparent transition-all" 
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-100 rounded-lg pl-4 pr-10 py-2 text-[13px] font-bold text-gray-600 outline-none cursor-pointer min-w-[140px]"
              >
                <option value="All Regions">All Regions</option>
                <option value="Western Province">Western Province</option>
                <option value="Central Province">Central Province</option>
                <option value="Southern Province">Southern Province</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>

            <div className="relative">
              <select 
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-100 rounded-lg pl-4 pr-10 py-2 text-[13px] font-bold text-gray-600 outline-none cursor-pointer min-w-[120px]"
              >
                <option value="Capacity">Capacity</option>
                <option value="<15000">&lt; 15,000 MT</option>
                <option value=">15000">&gt; 15,000 MT</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>

            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-100 rounded-lg pl-4 pr-10 py-2 text-[13px] font-bold text-gray-600 outline-none cursor-pointer min-w-[120px]"
              >
                <option value="Status">Status</option>
                <option value="Active">Active</option>
                <option value="Operational">Operational</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right leading-tight ml-4">
             SHOWING {filteredStores.length} OF {stores.length}<br/>CORE FACILITIES
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfdfc] border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[120px]">STORE ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">STORE NAME</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">REGION</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">CAPACITY</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-[120px]">STATUS</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-[100px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-500 font-medium">No stores found.</td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-6">
                    <span className="font-bold text-gray-700 bg-gray-100/80 px-2.5 py-1.5 rounded-lg text-xs tracking-wide">{store.id}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{store.name}</div>
                    <div className="text-gray-500 text-[10px] pr-8 leading-tight">{store.address}</div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={2.5}/>
                      <div>
                        <div className="font-medium text-gray-700 text-xs">{store.region}</div>
                        <div className="text-gray-500 text-[10px]">{store.subRegion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-between items-center mb-1.5 pr-6">
                       <span className="font-bold text-gray-900 text-xs">{store.capacity}</span>
                       <span className="text-gray-400 text-[10px] font-bold">{store.docks}</span>
                    </div>
                    <div className="w-[180px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#0fa979] rounded-full" style={{ width: `${store.utilization}%` }}></div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="px-3 py-1 bg-[#d1f4e0]/60 text-[#0d9468] text-[11px] font-bold rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> {store.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex justify-center gap-4 text-gray-400">
                      <button onClick={() => openEditStore(store)} className="hover:text-[#113b2e] transition-colors"><Edit2 size={14} strokeWidth={2.5} /></button>
                      <button onClick={() => handleDelete(store.id)} className="hover:text-red-500 transition-colors"><Trash2 size={14} strokeWidth={2.5} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-4">
             <span>Showing 1 to {filteredStores.length} of {stores.length} stores</span>
             <div className="flex items-center gap-2 uppercase tracking-widest font-bold text-[10px]">
                ROWS: 
                <select className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer text-xs p-0 border-none">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="text-gray-300 hover:text-gray-500"><ArrowLeft size={14} strokeWidth={3}/></button>
             <button className="w-7 h-7 bg-[#113b2e] text-white rounded-md flex items-center justify-center font-bold shadow-sm">1</button>
             <button className="text-gray-300 hover:text-gray-500 rotate-180"><ArrowLeft size={14} strokeWidth={3}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
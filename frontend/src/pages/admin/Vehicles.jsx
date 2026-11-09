import React, { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Store as StoreIcon, MapPin, Clock, Shield, CheckCircle2, ArrowLeft, RotateCcw, Download, ChevronDown, Box, Truck, Key, Activity, Snowflake, UploadCloud, Info, Calendar, Gauge, Battery, AlertTriangle, Camera } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([
    {
      id: 'VH-401',
      plate: 'WP-CAB-8492',
      model: 'Isuzu Forward FTR 850',
      type: 'Refrigerated Box',
      payload: '8.5',
      volume: '38.0 m³',
      store: 'Colombo Main Store',
      status: 'Active • En Route',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'VH-408',
      plate: 'WP-NC-2940',
      model: 'Hino 500 Series Wide Cab',
      type: 'Dry Freight Van',
      payload: '14.0',
      volume: '54.0 m³',
      store: 'Kandy Branch',
      status: 'In Depot • Ready',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: null
    },
    {
      id: 'VH-512',
      plate: 'CP-DA-5011',
      model: 'UD Trucks Quester GWE',
      type: 'Heavy Flatbed',
      payload: '22.5',
      volume: 'Flatbed Deck',
      store: 'Colombo Main Store',
      status: 'Active • En Route',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: null
    },
    {
      id: 'VH-620',
      plate: 'SP-GA-1194',
      model: 'Mitsubishi Fuso Fighter',
      type: 'Dry Freight Van',
      payload: '5.0',
      volume: '22.4 m³',
      store: 'Galle Warehouse',
      status: 'Maintenance',
      statusColor: 'bg-red-50 text-red-600 border-red-100',
      image: null
    },
    {
      id: 'VH-715',
      plate: 'WP-LY-7389',
      model: 'Scania R450 V8 Highline',
      type: 'Prime Mover',
      payload: '32.0',
      volume: 'Tractor Unit',
      store: 'Colombo Main Store',
      status: 'Active • En Route',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: null
    },
    {
      id: 'VH-802',
      plate: 'CP-NC-6344',
      model: 'Isuzu Giga CXZ Tipper',
      type: 'Heavy Flatbed',
      payload: '18.0',
      volume: '32.0 m³',
      store: 'Kandy Branch',
      status: 'Standby',
      statusColor: 'bg-gray-100 text-gray-600 border-gray-200',
      image: null
    },
    {
      id: 'VH-830',
      plate: 'WP-PD-9021',
      model: 'Thermo King ChillMaster FVR',
      type: 'Refrigerated Box',
      payload: '9.0',
      volume: '41.2 m³',
      store: 'Colombo Main Store',
      status: 'In Depot • Ready',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: null
    },
    {
      id: 'VH-914',
      plate: 'SP-ND-4412',
      model: 'Volvo FH16 750 Heavy Haul',
      type: 'Prime Mover',
      payload: '45.0',
      volume: 'Articulated Deck',
      store: 'Galle Warehouse',
      status: 'Active • En Route',
      statusColor: 'bg-[#d1f4e0]/60 text-[#0d9468] border-[#0d9468]/20',
      image: null
    }
  ]);

  const [currentView, setCurrentView] = useState('list');
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [storeFilter, setStoreFilter] = useState('All Stores');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [payload, setPayload] = useState('');
  const [volume, setVolume] = useState('');
  const [assignedStore, setAssignedStore] = useState('');
  const [driver, setDriver] = useState('');
  const [odometer, setOdometer] = useState('');
  const [opStatus, setOpStatus] = useState('');
  const [vehicleImage, setVehicleImage] = useState(null);

  const fileInputRef = useRef(null);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || v.type === categoryFilter;
    const matchesStore = storeFilter === 'All Stores' || v.store === storeFilter;
    const matchesStatus = statusFilter === 'All Statuses' || v.status.includes(statusFilter);
    return matchesSearch && matchesCategory && matchesStore && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All Categories');
    setStoreFilter('All Stores');
    setStatusFilter('All Statuses');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle from the fleet?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const openAddVehicle = () => {
    setPlate(''); setVin(''); setMakeModel(''); setBodyType('');
    setPayload(''); setVolume(''); setAssignedStore(''); setDriver('');
    setOdometer(''); setOpStatus(''); setVehicleImage(null);
    setCurrentView('add');
  };

  const openEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setPlate(vehicle.plate);
    setMakeModel(vehicle.model);
    setBodyType(vehicle.type);
    setPayload(vehicle.payload);
    setVolume(vehicle.volume.replace(' m³', ''));
    setAssignedStore(vehicle.store);
    setOpStatus(vehicle.status);
    setVehicleImage(vehicle.image || null);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
    setEditingVehicle(null);
  };

  const handleCreateVehicle = (e) => {
    e.preventDefault();
    if (!plate || !makeModel) {
      alert('Please fill in required fields (Registration Plate and Make & Model).');
      return;
    }
    const newVeh = {
      id: `VH-9${Math.floor(Math.random() * 90) + 10}`,
      plate: plate,
      model: makeModel,
      type: bodyType || 'Dry Freight Van',
      payload: payload || '10.0',
      volume: volume ? `${volume} m³` : 'Standard',
      store: assignedStore || 'Unallocated',
      status: 'Standby',
      statusColor: 'bg-gray-100 text-gray-600 border-gray-200',
      image: vehicleImage
    };
    setVehicles([...vehicles, newVeh]);
    closeView();
  };

  const handleUpdateVehicle = (e) => {
    e.preventDefault();
    const updated = vehicles.map(v => 
      v.id === editingVehicle.id 
        ? { ...v, plate, model: makeModel, type: bodyType, payload: payload, volume: `${volume} m³`, store: assignedStore, status: opStatus, image: vehicleImage }
        : v
    );
    setVehicles(updated);
    closeView();
  };

  const handleExportCSV = () => {
    const headers = ['Vehicle ID', 'Registration', 'Model', 'Type', 'Payload', 'Volume', 'Assigned Store', 'Status'];
    const csvRows = filteredVehicles.map(v => {
      return [v.id, `"${v.plate}"`, `"${v.model}"`, `"${v.type}"`, `"${v.payload} Tons"`, `"${v.volume}"`, `"${v.store}"`, `"${v.status}"`].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logifleet_vehicles_export.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    if(fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf, image/jpeg, image/png';
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        alert(`File selected: ${e.target.files[0].name}. (This is a frontend demo)`);
      }
    };
    input.click();
  };

  if (currentView === 'add') {
    return (
      <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span>VEHICLES</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">ADD NEW VEHICLE</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Add New Vehicle</h1>
            <span className="bg-[#f0f2f5] text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5">
               DRAFT / UNREGISTERED
            </span>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Vehicle List
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-8 -mt-6">Initialize tractor, rigid chassis, or commercial carrier record into LogiFleet TMS telemetry core.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="mb-8 flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Vehicle Specifications & Registry
                </h3>
                <p className="text-[11px] text-gray-500">Enter vehicle identification numbers, specifications, and primary hub allocations.</p>
              </div>
              <div className="bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">REG-DRAFT-2026</div>
            </div>

            <form id="addVehForm" onSubmit={handleCreateVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Registration Plate <span className="text-red-500">*</span></span> 
                    <span className="text-gray-400 font-normal">Format: WP-CAB-0000</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key size={14} /></div>
                    <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="e.g. WP-CAB-9821 (Province - Series - Number)" className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Chassis / VIN Number <span className="text-red-500">*</span></span> 
                    <span className="text-gray-400 font-normal">17-Char Standard</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key size={14} /></div>
                    <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="E.G., 17-DIGIT ALPHANUMERIC VIN (E.G. JALI..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Make & Model <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Truck size={14} /></div>
                    <input type="text" value={makeModel} onChange={(e) => setMakeModel(e.target.value)} placeholder="e.g. Isuzu Forward FTR 850 / Hino 500" className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Body Type & Category <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Box size={14} /></div>
                    <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none appearance-none" required>
                      <option value="">Select body type...</option>
                      <option value="Refrigerated Box">Refrigerated Box</option>
                      <option value="Heavy Flatbed">Heavy Flatbed</option>
                      <option value="Dry Freight Van">Dry Freight Van</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Maximum Net Payload <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Gauge size={14} /></div>
                    <input type="text" value={payload} onChange={(e) => setPayload(e.target.value)} placeholder="e.g. 10.0" className="w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px] font-bold">Tons</div>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Cargo Volume Capacity <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Box size={14} /></div>
                    <input type="text" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="e.g. 42.0" className="w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px] font-bold">m³</div>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Assigned Store / Hub <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><StoreIcon size={14} /></div>
                    <select value={assignedStore} onChange={(e) => setAssignedStore(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none appearance-none" required>
                      <option value="">Select operating facility...</option>
                      <option value="Colombo Main Store">Colombo Main Store</option>
                      <option value="Kandy Branch">Kandy Branch</option>
                      <option value="Galle Warehouse">Galle Warehouse</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Initial Odometer Reading <span className="text-red-500">*</span></span> 
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Gauge size={14} /></div>
                    <input type="text" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g. 0 km or current fleet odometer" className="w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]" required/>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px] font-bold">KM</div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                    <span>Primary Assigned Driver (Optional)</span> 
                    <span className="text-gray-400 font-normal">Can be scheduled on dispatch roster later</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">👤</div>
                    <select value={driver} onChange={(e) => setDriver(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs text-gray-600 outline-none appearance-none">
                      <option value="">None / General Pool Vehicle (Unallocated)</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                  </div>
                </div>

              </div>

              <div className="mt-8 bg-[#f0f9f4] p-4 rounded-xl border border-[#0fa979]/20 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#0fa979]/20 shadow-sm"><Activity size={18} className="text-[#113b2e]"/></div>
                    <div>
                      <div className="text-[11px] font-bold text-[#113b2e] mb-0.5 flex items-center gap-2">Telematics Gateway Provisioning <span className="bg-[#d1f4e0] text-[#0d9468] px-1.5 py-0.5 rounded text-[8px] uppercase">Automated</span></div>
                      <div className="text-[10px] text-gray-500 leading-tight">Upon creation, an OBD-II CAN-Bus QR pairing token and<br/>hardware certificate will be generated for the on-board unit.</div>
                    </div>
                 </div>
                 <div className="text-[9px] text-gray-400 font-bold tracking-widest text-right leading-tight">
                    AUTO-<br/>ENROLL:<br/>V3.2
                 </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-6">
                <button type="button" onClick={openAddVehicle} className="text-gray-500 text-xs font-bold flex items-center gap-1.5 hover:text-gray-700">
                  <RotateCcw size={12} strokeWidth={2.5} /> Reset Form
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={closeView} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-xs hover:bg-[#0fa979] flex items-center gap-2 shadow-sm">
                    <Truck size={14} /> Save Vehicle
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2"><Truck size={16} className="text-[#0fa979]"/> Vehicle Photo</h3>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight text-right">OPTIONAL<br/>PREVIEW</span>
                </div>
                
                {/* Working Image Upload Section for Add View[cite: 55] */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />
                
                {vehicleImage ? (
                  <div className="w-full h-32 relative rounded-xl overflow-hidden mb-4 border border-gray-200 group">
                    <img src={vehicleImage} alt="Vehicle Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={triggerImageUpload} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-50"><Edit2 size={12}/> Change Photo</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={triggerImageUpload} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-[#0fa979]"><UploadCloud size={16}/></div>
                    <div className="text-[11px] font-bold text-[#113b2e]">Upload Vehicle Image</div>
                    <div className="text-[9px] text-gray-500 mt-1 px-4">Drag & drop high-res JPEG or<br/>PNG (Max 10MB) or <span className="text-[#0fa979] underline">Browse Files</span></div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                   <div className="flex items-start gap-1.5 text-[9px] text-gray-500"><CheckCircle2 size={12} className="text-gray-300 shrink-0"/> Recommended 3/4 front angle displaying license plate</div>
                   <div className="flex items-start gap-1.5 text-[9px] text-gray-500"><CheckCircle2 size={12} className="text-gray-300 shrink-0"/> Min resolution: 1200 x 800px RGB color space</div>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2"><Shield size={16} className="text-[#0fa979]"/> Regulatory<br/>Certifications</h3>
                  <span className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">COMPLIANCE</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-5 leading-tight">Attach mandatory compliance documents for official transport clearance.</p>
                
                <div className="space-y-3">
                   {['National Revenue License', 'Fleet Insurance Policy', 'MOT / Fitness Certificate'].map((cert, i) => (
                     <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2.5">
                           <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-400 shadow-sm"><Box size={12}/></div>
                           <div>
                              <div className="text-[10px] font-bold text-gray-800">{cert}</div>
                              <div className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-0.5">PENDING UPLOAD</div>
                           </div>
                        </div>
                        <button onClick={triggerFileUpload} type="button" className="flex items-center gap-1 text-[9px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"><UploadCloud size={10}/> Upload</button>
                     </div>
                   ))}
                   <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                        <div className="flex items-center gap-2.5">
                           <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-400 shadow-sm"><Snowflake size={12}/></div>
                           <div>
                              <div className="text-[10px] font-bold text-gray-800">Cold-Chain Hygiene Cert</div>
                              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">OPTIONAL</div>
                           </div>
                        </div>
                        <button onClick={triggerFileUpload} type="button" className="flex items-center gap-1 text-[9px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"><UploadCloud size={10}/> Upload</button>
                   </div>
                </div>

                <div className="mt-5 flex items-start gap-2 text-[9px] text-gray-500 leading-tight">
                   <Shield size={12} className="text-gray-400 shrink-0 mt-0.5"/>
                   All documents are encrypted and archived into LogiFleet Vault for regulatory audit compliance.
                </div>
             </div>

             <div className="bg-[#113b2e] rounded-xl p-5 text-white shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-[#0fa979] opacity-20"><Info size={64}/></div>
                <div className="text-[9px] text-[#0fa979] font-bold uppercase tracking-widest mb-1.5 flex justify-between">LOGIFLEET STANDARD <Info size={12}/></div>
                <div className="text-xs font-bold mb-2">Asset Dispatch Validation</div>
                <div className="text-[10px] text-gray-300 leading-tight">Vehicles without verified Revenue Licenses and Fitness inspection clearance will remain locked in "Restricted / Maintenance Only" status until compliance clearance.</div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'edit' && editingVehicle) {
    return (
      <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span>VEHICLES</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">EDIT VEHICLE DETAILS</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Edit Vehicle Details</h1>
            <span className="text-sm font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">{editingVehicle.id}</span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${editingVehicle.statusColor}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${editingVehicle.statusColor.includes('red') ? 'bg-red-500' : editingVehicle.statusColor.includes('gray') ? 'bg-gray-400' : 'bg-[#0fa979]'}`}></span> {editingVehicle.status}
            </span>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Vehicle List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative">
              <div className="absolute top-6 right-6 text-gray-400"><Edit2 size={16}/></div>
              <h3 className="text-base font-bold text-[#113b2e] mb-1">Vehicle Specifications & Registry</h3>
              <p className="text-[11px] text-gray-500 mb-8">Update operational parameters, payload limits, and designated depot routing.</p>
              
              <form id="editVehForm" onSubmit={handleUpdateVehicle} className="space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  
                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                      <span>Registration Plate <span className="text-red-500">*</span></span> 
                      <span className="text-gray-400 font-normal">Western Province</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0fa979]"><Key size={14} /></div>
                      <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-[#0fa979]" required/>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                      <span>Cargo Volume Capacity <span className="text-red-500">*</span></span> 
                      <span className="text-gray-400 font-normal uppercase tracking-widest text-[9px]">CUBE SPACE</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Box size={14} /></div>
                      <input type="text" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-[#0fa979]" required/>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Make & Model <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Truck size={14} /></div>
                      <input type="text" value={makeModel} onChange={(e) => setMakeModel(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-[#0fa979]" required/>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Assigned Store/Hub <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><StoreIcon size={14} /></div>
                      <select value={assignedStore} onChange={(e) => setAssignedStore(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none appearance-none" required>
                        <option value="Colombo Main Store">Colombo Main Store (Western Terminal)</option>
                        <option value="Kandy Branch">Kandy Branch</option>
                        <option value="Galle Warehouse">Galle Warehouse</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Body Type & Category <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0fa979]"><Snowflake size={14} /></div>
                      <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none appearance-none" required>
                        <option value="Refrigerated Box">Refrigerated Box (Thermo Chill)</option>
                        <option value="Heavy Flatbed">Heavy Flatbed</option>
                        <option value="Dry Freight Van">Dry Freight Van</option>
                        <option value="Prime Mover">Prime Mover</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Current Operational Status <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0d9468]"><Activity size={14} /></div>
                      <select value={opStatus} onChange={(e) => setOpStatus(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none appearance-none" required>
                        <option value="Active • En Route">Active — On Route (Transit)</option>
                        <option value="In Depot • Ready">In Depot — Ready</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Standby">Standby</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Maximum Net Payload <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Gauge size={14} /></div>
                      <input type="text" value={payload} onChange={(e) => setPayload(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-[#0fa979]" required/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Primary Assigned Driver <span className="text-red-500">*</span></span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#113b2e]">👤</div>
                      <select className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#113b2e] outline-none appearance-none">
                        <option>Kasun Wickramasinghe (LIC-88219 • Grade A)</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>

                </div>
              </form>

              <div className="mt-8 grid grid-cols-3 gap-4">
                 <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-[#0fa979]"><Edit2 size={12}/></div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">ODOMETER READING</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">142,850 <span className="text-xs text-gray-500 font-medium">km</span></div>
                    <div className="text-[9px] text-[#0fa979] font-bold flex items-center gap-1.5 leading-tight"><span className="w-1 h-1 bg-[#0fa979] rounded-full"></span> Sync from CAN-bus<br/>(live)</div>
                 </div>
                 <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-gray-400"><Calendar size={12}/></div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">LAST SERVICE EVENT</div>
                    <div className="text-lg font-bold text-gray-900 mb-2 leading-tight">10 Oct 2026</div>
                    <div className="text-[9px] text-gray-500 flex items-center gap-1.5 leading-tight"><Clock size={10}/> Next overhaul <span className="font-bold text-gray-800">4,150<br/>km</span></div>
                 </div>
                 <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-[#0fa979]"><Battery size={14} className="rotate-90"/></div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">FUEL TANK LEVEL</div>
                    <div className="flex items-end gap-2 mb-2">
                       <div className="text-xl font-bold text-gray-900 leading-none">78%</div>
                       <div className="text-[9px] text-gray-500 font-bold leading-tight">Diesel<br/><span className="text-[#0fa979]">410 km Range</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                       <div className="h-full bg-[#113b2e] w-[78%]"></div>
                    </div>
                 </div>
              </div>

              <div className="mt-6 bg-[#f0f9f4] p-4 rounded-xl border border-[#0fa979]/20 flex items-start gap-3">
                 <div className="mt-0.5 text-[#0fa979]"><Activity size={16}/></div>
                 <div>
                   <div className="text-[11px] font-bold text-[#113b2e] mb-0.5 flex items-center gap-2">Telematics Auto-Sync Enabled</div>
                   <div className="text-[10px] text-gray-500 leading-relaxed pr-8">Engine diagnostics, GPS coordinates, Reefer cargo temperature, and tire pressure sensor data are synchronized via Geotab OBD-II gateway every 15 seconds.</div>
                 </div>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            
            {/* Working Edit View Image Upload[cite: 55] */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative overflow-hidden">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
               />
               
               {vehicleImage ? (
                  <div className="w-full h-40 relative rounded-lg overflow-hidden mb-4 border border-gray-200 group">
                    <img src={vehicleImage} alt="Vehicle Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={triggerImageUpload} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-50"><Camera size={12}/> Change Photo</button>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm text-gray-600"><Search size={12}/></div>
                    <div className="absolute bottom-3 left-3 bg-[#113b2e]/90 text-white px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                       <span className="text-[#0fa979]">●</span> {editingVehicle.id} • VIN: {vin || 'JAAL71829K00918'}
                    </div>
                  </div>
               ) : (
                  <div onClick={triggerImageUpload} className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-center mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-[#0fa979]"><UploadCloud size={16}/></div>
                     <div className="text-[11px] font-bold text-[#113b2e]">Upload Vehicle Image</div>
                     <div className="text-[9px] text-gray-500 mt-1 px-4">Click to browse or drag & drop<br/>JPEG/PNG (Max 10MB)</div>
                  </div>
               )}
               
               <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600"><Snowflake size={12} className="text-[#0fa979]"/> Reefer Unit</div>
                     <div className="text-[11px] font-bold text-gray-900">Thermo King T-880R</div>
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">🌡️ Dual-Zone Control</div>
                     <div className="text-[11px] font-bold text-gray-900">-20°C to +10°C</div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-sm font-bold text-[#113b2e] mb-0.5">Current Staging Base</h3>
                   <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">REAL-TIME TELEMATICS LOCK</div>
                 </div>
                 <div className="bg-[#e8f8f2] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded">Dock Bay #04</div>
               </div>
               
               <div className="w-full h-32 bg-[#e4dfd9] rounded-lg relative overflow-hidden border border-gray-200 mb-4">
                  <div className="absolute inset-0 opacity-100" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0fa979] rounded-full border-2 border-white shadow-md"></div>
                  
                  <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-1 rounded shadow-sm text-[9px] font-bold text-gray-800 flex items-center gap-1.5">
                     <span className="text-[#0fa979]">●</span> 6.9319° N, 79.8478° E
                  </div>
               </div>

               <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                     <span className="text-gray-500 flex items-center gap-1.5"><MapPin size={10} className="text-gray-400"/> Active Route:</span>
                     <span className="font-bold text-gray-900">R-402 (Colombo → Kandy)</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-500 flex items-center gap-1.5"><Gauge size={10} className="text-gray-400"/> Average Cruise Speed:</span>
                     <span className="font-bold text-gray-900">54 km/h</span>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-[#113b2e]">Regulatory Certifications</h3>
                  <div className="w-6 h-6 rounded-full bg-[#d1f4e0] text-[#0d9468] flex items-center justify-center"><CheckCircle2 size={12}/></div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">National Revenue License</div>
                        <div className="text-[9px] text-gray-500">Valid until 31 Mar 2025</div>
                      </div>
                      <div className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={10}/> Verified</div>
                   </div>
                   
                   <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">Fleet Insurance Policy</div>
                        <div className="text-[9px] text-gray-500">Sri Lanka Insurance Corp</div>
                      </div>
                      <div className="text-[#0fa979] text-[9px] font-bold px-2 py-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#0fa979] rounded-full"></span> Active</div>
                   </div>

                   <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">MOT / Fitness Certificate</div>
                        <div className="text-[9px] text-gray-500">Expires in 42 days</div>
                      </div>
                      <div className="text-gray-500 bg-gray-100 text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1"><Clock size={10}/> Inspected</div>
                   </div>

                   <div className="flex justify-between items-center pb-2">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">Cold-Chain Food Hygiene</div>
                        <div className="text-[9px] text-gray-500">SLSI 1542 Compliant</div>
                      </div>
                      <div className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={10}/> Certified</div>
                   </div>
                </div>

                <button type="button" onClick={() => alert("Downloading PDF Bundle...")} className="w-full mt-4 py-2.5 bg-[#f8faf9] border border-gray-200 rounded-lg text-[11px] font-bold text-[#113b2e] hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                   <Download size={14}/> Download Compliance Bundle (PDF)
                </button>
             </div>

          </div>
        </div>
        
        {/* Fixed Footer Bar Matching the final design request */}
        <div className="max-w-[1200px] mx-auto mt-6 bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex justify-between items-center">
           <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
             <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#0fa979] rounded-full"></span> Last synchronized by <span className="font-bold text-gray-700">Nuwan Perera</span> on 24 Feb 2025 at 09:15 IST</div>
             <div>•</div>
             <div>Audit Hash: #0xKND6829F</div>
           </div>
           
           <div className="flex gap-4 items-center">
              <button type="button" onClick={() => openEditVehicle(editingVehicle)} className="text-[11px] font-bold text-gray-500 hover:text-gray-700">Discard Changes</button>
              <button type="submit" form="editVehForm" className="px-5 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-[11px] hover:bg-[#0fa979] flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={14} /> Save Changes
              </button>
           </div>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // 3. MAIN VEHICLE LIST VIEW
  // ----------------------------------------------------
  return (
    <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
      
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">VEHICLE MANAGEMENT</span>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Vehicle Management</h1>
            <div className="flex gap-2">
               <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Total Vehicles: {vehicles.length}</span>
               <span className="bg-[#d1f4e0] text-[#0d9468] px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Active: {vehicles.filter(v => v.status.includes('Active')).length}</span>
               <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Maintenance: {vehicles.filter(v => v.status.includes('Maintenance')).length}</span>
               <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Standby: {vehicles.filter(v => v.status.includes('Standby')).length}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">
            <Download size={14} strokeWidth={2.5}/> Export CSV
          </button>
          <button 
            onClick={openAddVehicle} 
            className="flex items-center gap-2 bg-[#113b2e] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0fa979] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} /> Add New Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#e8f8f2] text-[#0fa979] flex items-center justify-center"><Box size={16}/></div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL FLEET GROSS CAPACITY</div>
          <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-6 flex items-baseline gap-2">482.5 <span className="text-sm text-gray-500 font-bold">Tons</span></div>
          
          <div className="flex justify-between items-end mb-1">
             <div className="text-[11px] font-bold text-gray-500">Current Load Utilization</div>
             <div className="text-[11px] font-bold text-[#113b2e]">86.4%</div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
             <div className="h-full bg-[#113b2e] rounded-full w-[86.4%]"></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
             <span>Allocated: 416.8 T</span>
             <span>Reserve: 65.7 T</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-800"><CheckCircle2 size={20}/></div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">FLEET AVAILABILITY</div>
          <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-6 flex items-baseline gap-2">83.3% <span className="text-[11px] text-[#0fa979] font-bold uppercase tracking-widest">Ready & Active</span></div>
          
          <div className="space-y-2.5 mt-2">
             <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2 text-gray-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Colombo Main Depot</div>
                <div className="font-bold text-gray-900">24 / 28 Units</div>
             </div>
             <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2 text-gray-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]/50"></span> Kandy Branch Hub</div>
                <div className="font-bold text-gray-900">10 / 12 Units</div>
             </div>
             <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2 text-gray-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Galle Regional Facility</div>
                <div className="font-bold text-gray-900">6 / 8 Units</div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center"><AlertTriangle size={14}/></div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">SCHEDULED MAINTENANCE</div>
          <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-6 flex items-baseline gap-2">5 <span className="text-sm text-red-500 font-bold">Pending Inspections</span></div>
          
          <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 flex justify-between items-center mb-3">
             <div className="flex items-center gap-2 text-xs font-bold text-red-600"><AlertTriangle size={14}/> 2 Critical Telemetry Alerts</div>
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">BRAKES / OBD-II</div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-medium text-gray-500 mt-4">
             <span>Next regulatory MOT audit in 4 days</span>
             <span className="text-[#0fa979] font-bold cursor-pointer hover:underline">View Garage Queue →</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-xl border border-gray-100 shadow-sm border-b-0">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-[300px]">
            <Search className="absolute left-4 top-2.5 text-gray-400" size={14} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by plate number, model, ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 outline-none focus:ring-1 focus:ring-[#0fa979]/30 transition-all" 
            />
          </div>
          
          <div className="flex gap-2 flex-1 justify-end">
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-medium text-gray-700 outline-none cursor-pointer min-w-[140px] hover:bg-gray-100 transition-colors">
                <option value="All Categories">All Categories</option>
                <option value="Refrigerated Box">Refrigerated Box</option>
                <option value="Dry Freight Van">Dry Freight Van</option>
                <option value="Heavy Flatbed">Heavy Flatbed</option>
                <option value="Prime Mover">Prime Mover</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14}/></div>
            </div>

            <div className="relative">
              <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-medium text-gray-700 outline-none cursor-pointer min-w-[140px] hover:bg-gray-100 transition-colors">
                <option value="All Stores">All Stores</option>
                <option value="Colombo Main Store">Colombo Main Store</option>
                <option value="Kandy Branch">Kandy Branch</option>
                <option value="Galle Warehouse">Galle Warehouse</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14}/></div>
            </div>

            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-medium text-gray-700 outline-none cursor-pointer min-w-[140px] hover:bg-gray-100 transition-colors">
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Ready">Ready</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Standby">Standby</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14}/></div>
            </div>

            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 ml-4 hover:text-gray-600 transition-colors">
               <RotateCcw size={12}/> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfdfc] border-y border-gray-100">
            <tr>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[100px]">VEHICLE ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">REGISTRATION & MODEL</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">TYPE / CATEGORY</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">PAYLOAD & VOLUME</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ASSIGNED STORE</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[140px]">STATUS</th>
              <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[100px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredVehicles.length === 0 ? (
              <tr><td colSpan="7" className="py-10 text-center text-gray-500 text-xs">No vehicles found.</td></tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <span className="font-bold text-gray-700 bg-gray-100/80 px-2 py-1 rounded text-xs tracking-wide">{v.id}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-[#113b2e] text-sm mb-0.5 tracking-wide">{v.plate}</div>
                    <div className="text-gray-500 text-[11px]">{v.model}</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="bg-[#e8f8f2] text-[#113b2e] text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border border-[#0fa979]/20">
                       <Snowflake size={12} className="text-[#0fa979]"/> {v.type}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-xs">
                     <span className="font-bold text-gray-700">{v.payload} Tons</span> <span className="text-gray-300 mx-1">•</span> <span className="text-gray-500">{v.volume}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <StoreIcon size={14} className="text-gray-400"/> {v.store}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1.5 border ${v.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.statusColor.includes('red') ? 'bg-red-500' : v.statusColor.includes('gray') ? 'bg-gray-400' : 'bg-[#0fa979]'}`}></span> {v.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex justify-center gap-4 text-gray-500">
                      <button onClick={() => openEditVehicle(v)} className="hover:text-[#113b2e] transition-colors p-1 cursor-pointer"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(v.id)} className="hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
             <span>Showing 1 - {filteredVehicles.length} of {vehicles.length} vehicles</span>
             <div className="flex items-center gap-1.5">
                Rows per page: 
                <select className="bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none font-bold text-gray-700">
                  <option>8</option>
                  <option>16</option>
                </select>
             </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50 text-gray-300">|&lt;</button>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50 text-gray-400">&lt;</button>
             <button className="w-7 h-7 rounded bg-[#113b2e] text-white flex items-center justify-center">1</button>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50">2</button>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50">3</button>
             <span>...</span>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50">6</button>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50">&gt;</button>
             <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-50">&gt;|</button>
          </div>
        </div>
      </div>
    </div>
  );
}
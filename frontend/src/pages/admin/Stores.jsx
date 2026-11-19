import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Store as StoreIcon, MapPin, Clock, Shield, CheckCircle2, ArrowLeft, RotateCcw, Download, ChevronDown, Building2, Box, Truck, Maximize, Minus } from 'lucide-react';
import { getAllStores, createStore, updateStore, deleteStore } from '../../services/storeService';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle'
];

const DISTRICT_TO_PROVINCE = {
  Colombo: 'Western Province',
  Gampaha: 'Western Province',
  Kalutara: 'Western Province',
  Kandy: 'Central Province',
  Matale: 'Central Province',
  'Nuwara Eliya': 'Central Province',
  Galle: 'Southern Province',
  Matara: 'Southern Province',
  Hambantota: 'Southern Province',
  Jaffna: 'Northern Province',
  Kilinochchi: 'Northern Province',
  Mannar: 'Northern Province',
  Vavuniya: 'Northern Province',
  Mullaitivu: 'Northern Province',
  Batticaloa: 'Eastern Province',
  Ampara: 'Eastern Province',
  Trincomalee: 'Eastern Province',
  Kurunegala: 'North Western Province',
  Puttalam: 'North Western Province',
  Anuradhapura: 'North Central Province',
  Polonnaruwa: 'North Central Province',
  Badulla: 'Uva Province',
  Monaragala: 'Uva Province',
  Ratnapura: 'Sabaragamuwa Province',
  Kegalle: 'Sabaragamuwa Province'
};

function SriLankaMapCanvas({ coordsText, labelText, zoomLevel = 100, heightClass = 'h-[280px]' }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const parseLatLng = (raw) => {
    if (!raw) return [7.8731, 80.7718];
    const nums = String(raw).match(/-?\d+(\.\d+)?/g);
    if (!nums || nums.length < 2) return [7.8731, 80.7718];
    let lat = parseFloat(nums[0]);
    let lng = parseFloat(nums[1]);
    if (/S/i.test(raw) && lat > 0) lat = -lat;
    if (/W/i.test(raw) && lng > 0) lng = -lng;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return [7.8731, 80.7718];
    return [lat, lng];
  };

  const [lat, lng] = parseLatLng(coordsText);

  useEffect(() => {
    let isMounted = true;
    const initLeaflet = async () => {
      try {
        const L = await import('leaflet');
        if (!isMounted || !mapContainerRef.current) return;

        if (!leafletMapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [lat, lng],
            zoom: 8,
            zoomControl: false,
            attributionControl: false
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
          }).addTo(map);

          const marker = L.circleMarker([lat, lng], {
            radius: 9,
            fillColor: '#0fa979',
            color: '#113b2e',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(map);

          if (labelText) {
            marker.bindPopup(`<strong>${labelText}</strong><br/>${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
          }

          leafletMapRef.current = map;
          markerRef.current = marker;
        } else {
          leafletMapRef.current.setView([lat, lng], 8);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            if (labelText) {
              markerRef.current.bindPopup(`<strong>${labelText}</strong><br/>${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
            }
          }
        }
      } catch (_) {
        // Fallback visual Sri Lanka map renders below when leaflet is not installed
      }
    };

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, labelText]);

  useEffect(() => {
    if (leafletMapRef.current) {
      const zoomDelta = Math.round((zoomLevel - 100) / 20);
      leafletMapRef.current.setZoom(Math.min(14, Math.max(6, 8 + zoomDelta)));
    }
  }, [zoomLevel]);

  return (
    <div className={`w-full ${heightClass} bg-[#e6f0ec] rounded-xl relative overflow-hidden border border-gray-200`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <svg
          viewBox="0 0 260 420"
          className="h-[86%] w-auto drop-shadow-sm opacity-90"
          aria-label="Sri Lanka Map"
        >
          <path
            d="M124 22 C136 28, 145 45, 148 66 C152 88, 168 104, 178 128 C188 152, 198 182, 194 214 C190 246, 174 276, 162 308 C150 340, 140 374, 122 396 C108 386, 98 364, 92 338 C86 312, 74 288, 66 260 C58 232, 54 198, 64 166 C74 134, 94 106, 102 74 C108 50, 112 28, 124 22 Z"
            fill="#d1f4e0"
            stroke="#113b2e"
            strokeWidth="3"
          />
          <circle cx="130" cy="70" r="3" fill="#0d9468" />
          <circle cx="145" cy="155" r="3" fill="#0d9468" />
          <circle cx="135" cy="215" r="3.5" fill="#113b2e" />
          <circle cx="88" cy="282" r="4" fill="#0fa979" />
          <circle cx="102" cy="355" r="3.5" fill="#0fa979" />
        </svg>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-full shadow font-bold text-[10px] text-gray-800 flex items-center gap-1.5 z-10">
        <span className="w-4 h-4 rounded-full bg-[#0d9468]/10 flex items-center justify-center">
          <MapPin size={10} className="text-[#0d9468]" />
        </span>
        {labelText || 'Sri Lanka Logistics Grid'}
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 bg-[#113b2e] text-white px-3 py-1.5 rounded-full shadow-md font-bold text-[10px] tracking-wider flex items-center gap-1.5 z-10">
        <span className="text-[#0fa979]">●</span> {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
      </div>
    </div>
  );
}

export default function Stores() {
  const [stores, setStores] = useState([]);
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
  const [docks, setDocks] = useState('');
  const [utilization, setUtilization] = useState(0);
  const [storeStatus, setStoreStatus] = useState('Active');
  const [operationalClass, setOperationalClass] = useState('');
  const [operationalDetails, setOperationalDetails] = useState('');

  // Toggle states for regulatory checkboxes (Edit View)
  const [fireClearance, setFireClearance] = useState(true);
  const [councilApproval, setCouncilApproval] = useState(true);
  const [perimeterSecurity, setPerimeterSecurity] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await getAllStores();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      alert(error.response?.data?.message || 'Failed to load stores');
    }
  };

  const parseCapacityNumber = (capStr) => {
    if (!capStr) return 0;
    const numeric = parseFloat(String(capStr).replace(/[^0-9.]/g, ''));
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  const getHubCode = (store) => {
    if (!store) return 'LK-HUB';
    const parts = (store.id || '').split('-');
    if (parts.length >= 2 && parts[1]) {
      return `LK-HUB-${parts[1]}`;
    }
    const cleanRegion = (store.region || 'HUB').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    return `LK-HUB-${cleanRegion}`;
  };

  const getStoreManagerName = (store) => {
    if (!store?.name) return 'Store In-Charge';
    return `${store.name} Lead`;
  };

  const getStoreInitials = (store) => {
    const label = store?.name || store?.id || 'ST';
    const words = label.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ''}${words[words.length - 1][0] || ''}`.toUpperCase();
  };

  const formatUpdatedTime = (store) => {
    const raw = store?.updatedAt || store?.createdAt;
    if (!raw) return 'Not recorded yet';
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return 'Not recorded yet';
    return dt.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = regionFilter === 'All Regions' || s.region === regionFilter;
    const matchesStatus = statusFilter === 'Status' || s.status === statusFilter;

    const capVal = parseCapacityNumber(s.capacity);
    const matchesCapacity =
      capacityFilter === 'Capacity' ||
      (capacityFilter === '<15000' && capVal < 15000) ||
      (capacityFilter === '>15000' && capVal > 15000);

    return matchesSearch && matchesRegion && matchesStatus && matchesCapacity;
  });

  const handleDelete = async (id) => {
    if (!id) {
      alert('Store ID not found');
      return;
    }
    if (window.confirm('Are you sure you want to delete this store facility?')) {
      try {
        await deleteStore(id);
        setStores((prev) => prev.filter((s) => s.id !== id && s._id !== id));
      } catch (error) {
        console.error('Error deleting store:', error);
        alert(error.response?.data?.message || 'Failed to delete store facility');
      }
    }
  };

  const openEditStore = (store) => {
    setEditingStore(store);
    setStoreName(store.name || '');
    setDistrict(store.region || '');
    setAddress(store.address || '');
    setCoordinates(store.coordinates || '');
    setPhone(store.phone || '');
    setHours(store.hours || '');
    setRules(store.rules || '');
    setCapacity(store.capacity || '');
    setDocks(store.docks || '');
    setUtilization(Number(store.utilization) || 0);
    setStoreStatus(store.status || 'Active');
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
    setDocks('');
    setUtilization(0);
    setStoreStatus('Active');
    setOperationalClass('');
    setOperationalDetails('');
    setZoomLevel(100);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!storeName || !address || !coordinates) {
      alert('Please fill in required fields.');
      return;
    }

    const districtName = district || 'Colombo';
    const provinceName = DISTRICT_TO_PROVINCE[districtName] || districtName;
    const distCode = districtName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'STR';
    const generatedId = `ST-${distCode}-0${stores.length + 1}`;

    const newStorePayload = {
      id: generatedId,
      name: storeName.trim(),
      region: provinceName,
      subRegion: `(${districtName} District)`,
      address: address.trim(),
      coordinates: coordinates.trim(),
      hours: (hours || '08:00 AM - 05:00 PM').trim(),
      capacity: (capacity || '10,000 MT').trim(),
      docks: (docks || '4 Active Docks').trim(),
      utilization: Number(utilization) || 0,
      status: storeStatus || 'Active',
      phone: (phone || '+94 11 000 0000').trim(),
      rules: (rules || 'Standard dock scheduling').trim(),
      operationalClass: (operationalClass || 'Standard Transit Depot').trim(),
      operationalDetails: (operationalDetails || 'Standard storage operations.').trim()
    };

    try {
      const created = await createStore(newStorePayload);
      setStores((prev) => [...prev, created]);
      closeView();
    } catch (error) {
      console.error('Error creating store:', error);
      alert(error.response?.data?.message || 'Error creating store');
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    if (!editingStore) return;

    const targetId = editingStore.id || editingStore._id;
    const updatedPayload = {
      name: storeName.trim(),
      region: district || editingStore.region,
      address: address.trim(),
      coordinates: coordinates.trim(),
      phone: phone.trim(),
      hours: hours.trim(),
      rules: rules.trim(),
      capacity: capacity || editingStore.capacity,
      docks: (docks || editingStore.docks || '4 Active Docks').trim(),
      utilization: Number(utilization) || 0,
      status: storeStatus || editingStore.status || 'Active',
      operationalClass: operationalClass.trim(),
      operationalDetails: operationalDetails.trim()
    };

    try {
      const saved = await updateStore(targetId, updatedPayload);
      setStores((prev) =>
        prev.map((s) =>
          (s._id && editingStore._id && s._id === editingStore._id) ||
          (s.id && editingStore.id && s.id === editingStore.id)
            ? { ...s, ...updatedPayload, ...saved }
            : s
        )
      );
      closeView();
    } catch (error) {
      console.error('Error updating store:', error);
      alert(error.response?.data?.message || 'Error updating store');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Store ID', 'Store Name', 'Region', 'Address', 'Coordinates', 'Operating Hours', 'Capacity', 'Docks', 'Status'];
    const csvRows = filteredStores.map(store => {
      return [
        store.id, `"${store.name}"`, `"${store.region} ${store.subRegion || ''}"`, `"${store.address}"`, `"${store.coordinates}"`,
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
                  <span className="text-gray-400 font-normal">SL Districts (25)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                  <select 
                    value={district} onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-700 outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Sri Lanka District</option>
                    {SRI_LANKA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
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
                  <span className="text-[#0fa979] font-bold flex items-center gap-1">Sri Lanka GPS</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                  <input 
                    type="text" value={coordinates} onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g., 6.9742° N, 79.8893° E" 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 outline-none focus:border-[#0fa979]"
                    required
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
                <span className="text-[11px] font-bold text-[#113b2e] flex items-center gap-1.5"><Shield size={14} className="text-[#0fa979]"/> Sri Lanka Geofence & Dispatch Terminal Map</span>
                <span className="text-[10px] bg-[#f0f9f4] text-[#0d9468] px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1 border border-[#0d9468]/10"><RotateCcw size={10} strokeWidth={3}/> {district ? `${district} District` : 'Sri Lanka Coverage'}</span>
              </div>

              <div className="relative">
                <SriLankaMapCanvas
                  coordsText={coordinates}
                  labelText={storeName || (district ? `${district} Depot` : 'Sri Lanka Logistics Hub')}
                  zoomLevel={zoomLevel}
                  heightClass="h-[280px]"
                />

                <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
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
              <button type="button" onClick={() => { setStoreName(''); setDistrict(''); setAddress(''); setCoordinates(''); setPhone(''); setHours(''); setRules(''); setCapacity(''); setDocks(''); setUtilization(0); setStoreStatus('Active'); setOperationalClass(''); setOperationalDetails(''); }} className="text-gray-500 text-xs font-bold flex items-center gap-1.5 hover:text-gray-700">
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
    const activeHubCode = getHubCode(editingStore);
    const totalCapNum = parseCapacityNumber(capacity || editingStore.capacity);
    const utilPct = Number(utilization) || 0;
    const usedCapNum = typeof editingStore.usedCapacityMT === 'number'
      ? editingStore.usedCapacityMT
      : Math.round((totalCapNum * utilPct) / 100);

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
                 <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> {storeStatus || editingStore.status || 'Active'}
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
              <div className="absolute top-6 right-6 bg-gray-100 text-gray-400 font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded">{activeHubCode}</div>
              
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
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Immutable enterprise registry identifier for {storeName || editingStore.name}.</p>
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
                        <option value="Western Province">Western Province</option>
                        <option value="Central Province">Central Province</option>
                        <option value="Southern Province">Southern Province</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Assigned regional fleet zoning: {district || editingStore.region}.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Nominal Storage Capacity</span>
                    </label>
                    <div className="relative">
                      <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#0fa979]" />
                      <div className="absolute inset-y-0 right-2 flex items-center">
                         <span className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">MT</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Certified dynamic static floor weight rating.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Active Loading Bays</span>
                    </label>
                    <input
                      type="text"
                      value={docks}
                      onChange={(e) => setDocks(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#0fa979]"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Storage Utilization (%)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={utilization}
                      onChange={(e) => setUtilization(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#0fa979]"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-900 mb-1.5">
                      <span>Facility Status</span>
                    </label>
                    <div className="relative">
                      <select
                        value={storeStatus}
                        onChange={(e) => setStoreStatus(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 outline-none appearance-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Operational">Operational</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
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
                    <div className="text-lg font-bold text-gray-900 leading-none mb-1">{docks || editingStore.docks || '0 Active Docks'}</div>
                    <div className="text-[9px] text-gray-500 leading-tight">{rules || editingStore.rules || 'No slot rule set'}</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#113b2e] rounded-lg flex items-center justify-center text-white"><Clock size={20}/></div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">DISPATCH WINDOW</div>
                    <div className="text-sm font-bold text-gray-900 leading-tight mb-1">{hours || editingStore.hours || 'Not set'}</div>
                    <div className="text-[9px] text-gray-500 leading-tight">{storeStatus || editingStore.status || 'Active'} Window</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700">
                     <Box size={12} className="text-[#0fa979]"/> Current Storage Utilization
                   </div>
                   <div className="text-[10px] font-bold text-gray-900">
                     {usedCapNum.toLocaleString()} MT / {totalCapNum.toLocaleString()} MT ({utilPct}%)
                   </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-[#113b2e] rounded-full" style={{ width: `${Math.min(100, Math.max(0, utilPct))}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                   <span className="text-gray-500">Utilization Rate: {utilPct}% Active Allocation</span>
                   <span className="text-[#0d9468] font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#0fa979]"></span> {storeStatus || editingStore.status || 'Active'}</span>
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
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">Certified municipal fire<br/>compliance for<br/>{storeName || editingStore.name}.</div>
                    <div className="text-[9px] text-[#0d9468] font-bold flex items-center gap-1"><CheckCircle2 size={10}/> {fireClearance ? 'Cleared' : 'Pending'}</div>
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
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">Commercial hub license<br/>for {district || editingStore.region}.</div>
                    <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1">↳ {editingStore.id}</div>
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
                    <div className="text-[9px] text-gray-500 leading-tight mb-1.5">24/7 static perimeter<br/>security and monitored<br/>CCTV telemetry.</div>
                    <div className="text-[9px] text-[#0d9468] font-bold flex items-center gap-1"><Shield size={10}/> {perimeterSecurity ? 'Synchronized' : 'Standby'}</div>
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
                     <div className="text-[9px] text-gray-600 leading-tight">{operationalDetails || 'Standard storage operations.'}</div>
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
                    <div className="w-8 h-8 bg-[#113b2e] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{getStoreInitials(editingStore)}</div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">{getStoreManagerName(editingStore)}</div>
                      <div className="text-[9px] text-gray-500">{district || editingStore.region}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                    <span className="text-gray-400">✆</span> {phone || editingStore.phone || 'N/A'}
                 </div>
              </div>

              <div className="flex justify-between items-center mb-4 text-[10px]">
                 <div className="flex items-center gap-1 font-bold text-gray-700">
                    <MapPin size={12} className="text-gray-400"/> Coordinates:
                 </div>
                 <div className="font-extrabold text-gray-900">{coordinates || editingStore.coordinates || 'N/A'}</div>
                 <div className="text-gray-400 text-right leading-tight">{storeName || editingStore.name}</div>
              </div>

              <SriLankaMapCanvas
                coordsText={coordinates || editingStore.coordinates}
                labelText={storeName || editingStore.name}
                zoomLevel={zoomLevel}
                heightClass="h-[140px]"
              />

              <div className="flex justify-between items-end text-[9px] mt-3">
                 <div className="text-gray-500 leading-tight w-2/3">Auto-dispatch triggered upon perimeter<br/>crossing.</div>
                 <div className="text-[#0fa979] font-bold flex items-center gap-1 cursor-pointer">Recalibrate<br/>Mesh <ArrowLeft size={10} className="rotate-180"/></div>
              </div>

            </div>
          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto mt-6 bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex justify-between items-center">
           <div className="flex items-center gap-4 text-[9px] text-gray-400 font-medium">
             <div className="flex items-center gap-1"><span className="w-1 h-1 bg-[#0fa979] rounded-full"></span> Last updated: <span className="font-bold text-gray-700">{formatUpdatedTime(editingStore)}</span></div>
             <div>•</div>
             <div>Store ID: {editingStore.id}</div>
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
            <span className="bg-[#d1f4e0] text-[#0d9468] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">{stores.length} Active Hubs</span>
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
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stores.length} Stores</div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
               <Building2 size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-1/2 leading-tight">Western, Central & Southern<br/>Corridors</div>
             <div className="text-[10px] text-[#0d9468] font-bold flex flex-col items-end leading-tight">
               <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> {stores.length}</div>
               <span>Registered</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL STORAGE CAPACITY</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {stores.reduce((sum, s) => sum + parseCapacityNumber(s.capacity), 0).toLocaleString()} MT
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
              <Box size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-2/3 leading-tight">
               {stores.reduce((sum, s) => sum + (typeof s.usedCapacityMT === 'number' ? s.usedCapacityMT : Math.round((parseCapacityNumber(s.capacity) * (Number(s.utilization) || 0)) / 100)), 0).toLocaleString()} MT Current Utilization
             </div>
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
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {stores.length > 0 ? (stores.reduce((sum, s) => sum + (Number(s.utilization) || 0), 0) / stores.length).toFixed(1) : '0.0'}%
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-400 border border-gray-100">
              <Truck size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="text-xs text-gray-500 font-medium w-2/3 leading-tight">
               {stores.reduce((sum, s) => sum + (parseInt(s.docks, 10) || 0), 0)} Active Loading Bays<br/>in rotation
             </div>
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
                <tr key={store._id || store.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-6">
                    <span className="font-bold text-gray-700 bg-gray-100/80 px-2.5 py-1.5 rounded-lg text-xs tracking-wide">{store.id || store._id}</span>
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
                       <div className="h-full bg-[#0fa979] rounded-full" style={{ width: `${store.utilization || 0}%` }}></div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="px-3 py-1 bg-[#d1f4e0]/60 text-[#0d9468] text-[11px] font-bold rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> {store.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex justify-center gap-4 text-gray-400">
                      <button type="button" onClick={() => openEditStore(store)} className="hover:text-[#113b2e] transition-colors"><Edit2 size={14} strokeWidth={2.5} /></button>
                      <button type="button" onClick={() => handleDelete(store.id || store._id)} className="hover:text-red-500 transition-colors"><Trash2 size={14} strokeWidth={2.5} /></button>
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
             <button type="button" className="text-gray-300 hover:text-gray-500"><ArrowLeft size={14} strokeWidth={3}/></button>
             <button type="button" className="w-7 h-7 bg-[#113b2e] text-white rounded-md flex items-center justify-center font-bold shadow-sm">1</button>
             <button type="button" className="text-gray-300 hover:text-gray-500 rotate-180"><ArrowLeft size={14} strokeWidth={3}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
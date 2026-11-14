import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Plus, Calendar, ChevronRight, Truck, 
  CheckCircle2, History, Edit2, ArrowLeft, 
  MapPin, Clock, Package, Trash2, ShieldAlert, Save, Send 
} from 'lucide-react';

// ==========================================
// 1. CREATE / EDIT BOOKING COMPONENT (FE-3)
// ==========================================
const CreateBookingView = ({ onBack, editData }) => {
  const [formData, setFormData] = useState({
    pickupStore: 'Colombo Main Store (Peliyagoda Central Hub - LK-WP)',
    destinationStore: '',
    dispatchDate: '',
    timeSlot: '',
    specialInstructions: '',
    directives: []
  });

  const [items, setItems] = useState([
    { id: 1, itemType: '', quantity: '', unit: 'Cartons', weight: '', weightUnit: 'kg' }
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        pickupStore: editData.from || 'Colombo Main Store (Peliyagoda Central Hub - LK-WP)',
        destinationStore: editData.to || '',
        dispatchDate: editData.date ? editData.date.split(' - ')[0] : '', 
        timeSlot: 'Morning Prime: 09:00 AM - 12:00 PM IST', 
        specialInstructions: editData.cargo || '', 
        directives: ['+ Keep Dry'] 
      });

      if (editData.consignments) {
        const mockItems = [];
        for (let i = 0; i < editData.consignments; i++) {
          mockItems.push({
            id: Date.now() + i,
            itemType: 'Pure Ceylon Black Tea (BOPF) - 25kg Cartons (Export Grade)',
            quantity: '10',
            unit: 'Cartons',
            weight: (parseInt(editData.totalWeight?.replace(/,/g, '')) / editData.consignments).toString() || '1000',
            weightUnit: 'kg'
          });
        }
        setItems(mockItems);
      }
    }
  }, [editData]);

  const itemTypes = [
    'Pure Ceylon Black Tea (BOPF) - 25kg Cartons (Export Grade)',
    'Organic Ceylon Cinnamon Quills - 20kg Bales (Alba Super)',
    'General Ambient FMCG Provisions'
  ];

  const quickDirectives = ['+ Keep Dry', '+ Tailgate Lift', '+ Export Priority', '+ Weighbridge Slip'];

  const handleAddItem = () => setItems([...items, { id: Date.now(), itemType: '', quantity: '', unit: 'Cartons', weight: '', weightUnit: 'kg' }]);
  
  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleDirective = (dir) => {
    const newDirectives = formData.directives.includes(dir)
      ? formData.directives.filter(d => d !== dir)
      : [...formData.directives, dir];
    setFormData({ ...formData, directives: newDirectives });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.destinationStore) newErrors.destinationStore = 'Required';
    if (!formData.dispatchDate) newErrors.dispatchDate = 'Required';
    if (!formData.timeSlot) newErrors.timeSlot = 'Required';

    let hasItemErrors = false;
    const itemErrs = items.map(item => {
      const err = {};
      if (!item.itemType) err.itemType = 'Required';
      if (!item.quantity || Number(item.quantity) <= 0) err.quantity = 'Invalid';
      if (!item.weight || Number(item.weight) <= 0) err.weight = 'Invalid';
      if (Object.keys(err).length > 0) hasItemErrors = true;
      return err;
    });

    if (hasItemErrors) newErrors.items = itemErrs;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(editData ? 'Valid Form Update:' : 'Valid Form Submit:', { formData, items });
      alert(editData ? "Booking updated successfully!" : "Booking created successfully!");
      onBack();
    }
  };

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  const payloadPercentage = Math.min((totalWeight / 5000) * 100, 100).toFixed(0);

  return (
    <div className="flex flex-col bg-white w-full min-h-full">
      {/* Header */}
      <div className="px-8 py-6 bg-white">
        <div className="flex items-center text-xs font-medium text-gray-400 mb-6">
          <button onClick={onBack} className="hover:text-gray-700 hover:underline">Bookings</button>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-green-700 font-semibold">{editData ? 'Edit Booking' : 'Create Booking'}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editData ? `Edit Booking #${editData.id}` : 'Create New Booking'}</h1>
            <p className="text-sm text-gray-400 mt-1">Modify transportation request and dispatch manifest specifications</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {editData ? 'Editing Booking' : 'Draft Booking #BKG-2026-0984'}
            </span>
            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-green-100">
              <CheckCircle2 size={14} /> TMS Tier-1 Node
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex-1">
        <form onSubmit={handleSubmit} id="create-booking-form" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Logistics Route */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-green-700" size={18} /> Logistics Route
              </h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Island Network (LK)</span>
            </div>
            
            <p className="text-[10px] text-gray-400 mb-6 -mt-4 pl-7">Select authorized distribution hubs and staging warehouses</p>

            <div className="grid grid-cols-2 gap-8 pl-7 mb-6">
              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full border-2 border-green-700"></div> Pickup Store / Hub</span>
                  <span className="text-gray-400 font-normal">Origin Gate 04</span>
                </label>
                <div className="relative">
                  <select className="w-full p-3.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 outline-none appearance-none">
                    <option>{formData.pickupStore}</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500"></span> Coordinates: 6.9491° N, 79.8887° E • Bay clearance standard
                </p>
              </div>
              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full border-2 border-red-500"></div> Destination Store / Depot</span>
                  <span className="text-gray-400 font-normal">Terminal Berth 2</span>
                </label>
                <div className="relative">
                  <select value={formData.destinationStore} onChange={(e) => setFormData({...formData, destinationStore: e.target.value})} className={`w-full p-3.5 border rounded-lg text-sm bg-white outline-none appearance-none focus:ring-1 focus:ring-green-700 ${errors.destinationStore ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">Select destination hub...</option>
                    <option value="Galle Coastal Staging Terminal (Dakshinapatha LK-SP)">Galle Coastal Staging Terminal (Dakshinapatha LK-SP)</option>
                    <option value="Kandy Regional Depot">Kandy Regional Depot</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                {errors.destinationStore && <p className="text-red-500 text-xs mt-1">{errors.destinationStore}</p>}
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500"></span> Deep-water export access • Bonded Customs clearance ready
                </p>
              </div>
            </div>
            
            {formData.destinationStore && (
              <div className="ml-7 bg-green-50/50 rounded-lg p-5 border border-green-100 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="bg-green-100 w-8 h-8 flex items-center justify-center rounded-md text-green-800 font-bold text-sm">A</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-0.5">Direct Route via Southern Expressway (E01) <span className="text-[9px] bg-gray-200/50 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Optimal ETA</span></p>
                    <p className="text-[11px] text-gray-500">Colombo Interchange (Kaduwela / Kottawa) → Galle Pinnaduwa Exit</p>
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Distance</p>
                    <p className="text-sm font-bold text-gray-900">118.4 km</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Est. Transit</p>
                    <p className="text-sm font-bold text-green-700">2h 15m</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Schedule */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-green-700" size={18} /> Dispatch Schedule
              </h2>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Timezone: UTC+05:30 (IST)</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-6 -mt-4 pl-7">Define pickup window compliance and driver arrival buffer</p>
            
            <div className="grid grid-cols-2 gap-8 pl-7">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Requested Pickup Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="date" value={formData.dispatchDate} onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})} className={`w-full pl-12 p-3.5 border rounded-lg text-sm text-gray-600 outline-none focus:ring-1 focus:ring-green-700 ${errors.dispatchDate ? 'border-red-500' : 'border-gray-200'}`} />
                </div>
                {errors.dispatchDate && <p className="text-red-500 text-xs mt-1">{errors.dispatchDate}</p>}
                <p className="text-[10px] text-gray-400 mt-2">Dispatch planned on operating business Sunday cycle</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Loading Dock Time Slot</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <select value={formData.timeSlot} onChange={(e) => setFormData({...formData, timeSlot: e.target.value})} className={`w-full pl-12 p-3.5 border rounded-lg text-sm bg-white text-gray-600 outline-none appearance-none focus:ring-1 focus:ring-green-700 ${errors.timeSlot ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">Select time slot...</option>
                    <option value="Morning Prime: 09:00 AM - 12:00 PM IST">Morning Prime: 09:00 AM - 12:00 PM IST</option>
                    <option value="Afternoon: 01:00 PM - 04:00 PM IST">Afternoon: 01:00 PM - 04:00 PM IST</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
                <p className="text-[10px] text-green-700 mt-2 flex items-center gap-1.5 font-medium"><ShieldAlert size={12}/> Driver must report 30 minutes ahead for chassis container seal checks</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Items to Transport */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-green-700" size={18} /> Items to Transport (Payload Manifest)
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 pl-7">Itemized consignment cargo breakdown with automated aggregate tare</p>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">{items.length} Consignments</span>
            </div>
            
            <div className="space-y-4 pl-7 mt-8">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-center bg-gray-50/30 border border-gray-100 rounded-xl p-4 transition-colors">
                  <div className="flex-1 relative">
                    <select value={item.itemType} onChange={(e) => handleItemChange(item.id, 'itemType', e.target.value)} className={`w-full p-3 border-b text-sm bg-transparent text-gray-600 outline-none appearance-none focus:border-green-700 ${errors.items?.[index]?.itemType ? 'border-red-500' : 'border-gray-200'}`}>
                      <option value="">Select item...</option>
                      {itemTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronRight className="absolute right-2 top-3.5 rotate-90 text-gray-400" size={16} />
                  </div>
                  
                  <div className="w-32 flex items-center border-b border-gray-200 pb-1">
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className={`w-full p-2 text-sm outline-none bg-transparent ${errors.items?.[index]?.quantity ? 'text-red-500 placeholder-red-300' : 'text-gray-600'}`} placeholder="Qty" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">{item.unit}</span>
                  </div>
                  
                  <div className="w-40 flex items-center border-b border-gray-200 pb-1 bg-green-50/30 px-3 rounded-t-lg">
                    <Package size={16} className="text-green-700 shrink-0" />
                    <input type="number" min="0.1" step="0.1" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)} className={`w-full p-2 text-sm text-right outline-none font-bold text-gray-800 bg-transparent ${errors.items?.[index]?.weight ? 'text-red-500 placeholder-red-300' : ''}`} placeholder="Weight" />
                    <span className="text-[10px] text-gray-500 font-bold ml-1">{item.weightUnit}</span>
                  </div>
                  
                  <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 ml-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={handleAddItem} className="mt-6 ml-7 flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-lg">
              <Plus size={16} /> Add Item
            </button>

            {/* Payload Summary */}
            <div className="mt-10 ml-7 bg-gray-50/50 rounded-xl p-6 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-5">
                <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 text-gray-400"><Truck size={24}/></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">Consolidated Net Payload</h3>
                    <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 tracking-wider uppercase">
                      <CheckCircle2 size={10} /> Within Axle Limit
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">Recommended Carrier Class: Rigid Body (Medium Heavy 4x2 / 6x2)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">Total Gross Weight</p>
                  <p className="text-xl font-bold text-gray-900">{totalWeight.toLocaleString()} kg</p>
                </div>
                <div className="text-right border-l border-gray-200 pl-10">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">Fleet Rating Limit</p>
                  <p className="text-sm font-bold text-gray-900">5,000 kg</p>
                </div>
                <div className="w-32 pl-4">
                  <div className="flex justify-between text-[9px] font-bold mb-2">
                    <span className="text-gray-400 uppercase tracking-widest">Load</span>
                    <span className="text-green-700">{payloadPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-700 rounded-full transition-all duration-500" style={{ width: `${payloadPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Additional Info */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="text-green-700" size={18} /> Additional Information
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 pl-7">Handling protocols, security seals, and destination gate access</p>
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">Optional Directives</span>
            </div>

            <div className="mb-6 pl-7">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-[11px] font-bold text-gray-700">Special Handling & Gate Instructions</label>
                <span className="text-[10px] text-gray-400 font-medium">Max 500 characters</span>
              </div>
              <textarea 
                rows="4"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                placeholder="Provide special handling, customs seal instructions, dock gate access requirements, or temperature restrictions (e.g., Do not double-stack tea cartons; Inspect Colombo Customs tamper seal serial COL-8891 upon arrival)..."
                className="w-full p-4 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-green-700 focus:border-green-700 outline-none text-gray-600 bg-gray-50/50 placeholder-gray-400 resize-none"
              ></textarea>
            </div>

            <div className="pl-7 flex items-center gap-4">
              <p className="text-[11px] font-bold text-gray-700">Add Quick Directives:</p>
              <div className="flex flex-wrap gap-2.5">
                {quickDirectives.map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => toggleDirective(dir)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                      formData.directives.includes(dir) 
                      ? 'bg-gray-100 border-gray-200 text-gray-800' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2 mt-4 mb-4" />

          {/* Footer inside the card */}
          <div className="px-8 pb-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-400 font-bold tracking-widest flex items-center gap-1.5 uppercase">
                <ShieldAlert size={14} className="text-gray-400"/> Encrypted Master Data Record • SLA Verified • ISO-28000 Security Compliant
              </p>
              <div className="flex gap-4">
                <button type="button" onClick={onBack} className="px-6 py-3 text-xs font-bold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="button" className="px-6 py-3 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Save size={16}/> Save Draft
                </button>
                <button type="submit" className="px-8 py-3 bg-[#0d3b2e] rounded-lg text-xs font-bold text-white hover:bg-[#092a21] transition-colors flex items-center gap-2 shadow-sm">
                  {editData ? 'Save Changes' : 'Submit Booking'} <Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 2. MAIN BOOKINGS LIST COMPONENT (FE-4)
// ==========================================
const StoreBookings = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null); 
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses'); 
  const [activeButtonFilter, setActiveButtonFilter] = useState('All'); 
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const bookings = [
    {
      id: 'BKG-2026-0842',
      status: 'In Transit',
      type: 'Outbound',
      date: 'Oct 28, 2026 - 09:30 AM IST',
      from: 'Colombo Main Store (Peliyagoda)',
      to: 'Galle Coastal Staging',
      cargo: 'Pure Ceylon BOPF Tea (2,000 kg) & Spices (700 kg)',
      consignments: 2,
      distance: '118.4 km',
      driver: 'Kapila Jayawardena',
      vehicle: 'LK-WP 8821',
      totalWeight: '2,700 kg',
      history: [
        { time: 'Oct 28, 08:30 AM IST', action: 'Status changed to In Transit', by: 'System' },
        { time: 'Oct 27, 18:30 IST', action: 'Vehicle LK-WP 8821 Assigned', by: 'Dispatcher N. Perera' },
        { time: 'Oct 27, 14:15 IST', action: 'Booking Created', by: 'Harshani' }
      ]
    },
    {
      id: 'BKG-2026-0841',
      status: 'Confirmed',
      type: 'Inbound',
      date: 'Oct 28, 2026 - 02:00 PM IST',
      from: 'Kandy Regional Depot',
      to: 'Colombo Main Store (Peliyagoda)',
      cargo: 'Highlands Arabica Coffee & Cardamom (1,850 kg)',
      consignments: 1,
      totalWeight: '1,850 kg',
      history: [
        { time: 'Oct 27, 09:00 AM IST', action: 'Booking Confirmed', by: 'Admin' }
      ]
    },
    {
      id: 'BKG-2026-0839',
      status: 'Pending Approval',
      type: 'Outbound',
      date: 'Oct 28, 2026 - 08:00 AM IST',
      from: 'Colombo Main Store',
      to: 'Kandy Regional Depot',
      cargo: 'Organic Coconut Oil & Desiccated Copra (3,200 kg)',
      consignments: 3,
      totalWeight: '3,200 kg',
      history: [
        { time: 'Oct 28, 07:15 AM IST', action: 'Booking Created', by: 'Harshani' }
      ]
    },
    {
      id: 'BKG-2026-0835',
      status: 'In Transit',
      type: 'Inbound',
      date: 'Oct 29, 2026 - 11:15 AM IST',
      from: 'Galle Coastal Staging',
      to: 'Kandy Regional Depot',
      cargo: 'Cinnamon Quills Alba Grade (1,400 kg)',
      consignments: 1,
      history: [
        { time: 'Oct 29, 10:15 AM IST', action: 'Vehicle Assigned', by: 'Admin' }
      ]
    },
    {
      id: 'BKG-2026-0830',
      status: 'Completed',
      type: 'Inbound',
      date: 'Oct 30, 2026 - 04:30 PM IST',
      from: 'Kandy Regional Depot',
      to: 'Colombo Main Store',
      cargo: 'General Ambient FMCG Provisions (4,100 kg)',
      consignments: 4,
      history: [
        { time: 'Oct 30, 04:30 PM IST', action: 'Booking Completed', by: 'System' }
      ]
    }
  ];

  // Modified Filtering Logic to include Button Filter and Date Filter
  const filteredBookings = bookings.filter(booking => {
    // 1. Search Filter
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cargo.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status Dropdown Filter
    const matchesDropdownStatus = 
      statusFilter === 'All Statuses' || booking.status === statusFilter;
      
    // 3. Status Button Filter
    const matchesButtonStatus = 
      activeButtonFilter === 'All' || booking.status === activeButtonFilter;

    // 4. Date Filter
    let matchesDate = true;
    if (startDate || endDate) {
      const datePart = booking.date.split(' - ')[0]; 
      const bDate = new Date(datePart);
      
      if (startDate) {
        const sDate = new Date(startDate);
        if (bDate < sDate) matchesDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        if (bDate > eDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDropdownStatus && matchesButtonStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-green-100 text-green-800';
      case 'Confirmed': return 'bg-gray-100 text-gray-800';
      case 'Pending Approval': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditOrCancel = (status) => status === 'Pending Approval' || status === 'Confirmed';

  const handleEditClick = () => {
    setBookingToEdit(selectedBooking);
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setIsCreating(false);
    setBookingToEdit(null);
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Status', 'Type', 'Date', 'From', 'To', 'Cargo', 'Consignments', 'Total Weight'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.status,
      b.type,
      `"${b.date}"`,
      `"${b.from}"`,
      `"${b.to}"`,
      `"${b.cargo}"`,
      b.consignments,
      b.totalWeight || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bookings_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = () => {
    alert("Downloading Booking Details...");
  };

  const handleCancelBookingClick = () => {
    setSelectedBooking(null);
  };

  if (isCreating) {
    return <CreateBookingView onBack={handleBackToList} editData={bookingToEdit} />;
  }

  // Calculate counts for the pill buttons dynamically based on filtered list or total list
  const countAll = bookings.length;
  const countInTransit = bookings.filter(b => b.status === 'In Transit').length;
  const countConfirmed = bookings.filter(b => b.status === 'Confirmed').length;
  const countPending = bookings.filter(b => b.status === 'Pending Approval').length;

  return (
    <div className="flex flex-col bg-gray-50"> 
      
      {/* Top Header - Removed the white card wrapper as requested */}
      <div className="flex justify-between items-start p-6 bg-transparent shrink-0">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Manage Booking</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage dispatch schedules, real-time consignment movements, and delivery milestones.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">24 Active Orders</span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => { setBookingToEdit(null); setIsCreating(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#113b2e] text-white rounded-md text-sm font-medium hover:bg-[#0c2a21]">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="flex px-6 pb-6 gap-6 items-start"> 
        
        {/* Left Column: List */}
        <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 space-y-4 shrink-0">
            <div className="flex gap-2">
               <button 
                  onClick={() => setActiveButtonFilter('All')} 
                  className={`px-4 py-1.5 text-xs rounded-full font-medium transition-colors ${activeButtonFilter === 'All' ? 'bg-[#0f3c2c] text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
               >
                 All {countAll}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('In Transit')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'In Transit' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'In Transit' ? 'bg-green-400' : 'bg-green-500'}`}></span> In Transit {countInTransit}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('Confirmed')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'Confirmed' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'Confirmed' ? 'bg-gray-300' : 'bg-gray-400'}`}></span> Confirmed {countConfirmed}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('Pending Approval')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'Pending Approval' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'Pending Approval' ? 'bg-gray-300' : 'bg-gray-300'}`}></span> Pending {countPending}
               </button>
            </div>

            <div className="flex gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search ID, destination, cargo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#113b2e]" 
                />
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => {
                   setStatusFilter(e.target.value);
                   if (e.target.value !== 'All Statuses') setActiveButtonFilter('All');
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Working Calendar / Date Filter */}
              <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden px-2 gap-1">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="py-1.5 text-xs text-gray-700 outline-none bg-transparent"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-1.5 text-xs text-gray-700 outline-none bg-transparent"
                />
                <Calendar size={14} className="text-gray-400 ml-1" />
              </div>

            </div>
          </div>

          <div>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} onClick={() => setSelectedBooking(booking)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedBooking?.id === booking.id ? 'bg-green-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">#{booking.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(booking.status)} flex items-center gap-1`}>
                         {booking.status === 'In Transit' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                         {booking.status}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={12}/> {booking.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-bold mb-1 truncate">
                        <span className="truncate">{booking.from}</span>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{booking.to}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Package size={12}/>
                        <span className="truncate max-w-[300px]">{booking.cargo}</span>
                        <span className="whitespace-nowrap ml-2 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">• {booking.consignments} Consignments</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No bookings found matching your criteria.
              </div>
            )}
            
            <div className="p-4 flex justify-between items-center text-xs text-gray-500">
               <span>Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings</span>
               <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100"><ChevronRight size={14} className="rotate-180"/></button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-[#113b2e] text-white font-bold">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold">2</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold">3</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"><ChevronRight size={14}/></button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        {selectedBooking && (
          <div className="w-[450px] shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sticky top-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">#{selectedBooking.id}</h2>
                  <p className="text-xs text-gray-500 mt-1">Created on {selectedBooking.date.split(' - ')[0]} by <span className="font-bold text-gray-700">Dispatcher N. Perera</span></p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)} flex items-center gap-1`}>
                    {selectedBooking.status === 'In Transit' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#113b2e] rounded text-white shrink-0"><Truck size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedBooking.from.split(' ')[0]} → {selectedBooking.to.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">via Southern Expy (E01)</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">{selectedBooking.distance}</p>
                  <p className="text-[10px] text-green-600 font-bold mt-0.5">Live GPS Active</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center px-6 pt-4 pb-2 border-b border-gray-200 shrink-0">
                <div className="flex gap-6">
                  <button onClick={() => setActiveTab('milestones')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'milestones' ? 'border-[#113b2e] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>Consignment Milestones</button>
                  <button onClick={() => setActiveTab('history')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'history' ? 'border-[#113b2e] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>Change History</button>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Step 3 of 4</span>
              </div>

              <div className="p-6">
                {activeTab === 'milestones' ? (
                  <div className="space-y-6">
                     <div className="relative pl-6 border-l-2 border-[#113b2e] space-y-6">
                        <div className="relative">
                          <CheckCircle2 className="absolute -left-[31px] bg-white text-[#113b2e]" size={18} />
                          <h4 className="text-sm font-bold text-gray-900">Request Created</h4>
                          <p className="text-xs text-gray-500 mt-1">Oct 27, 14:15 IST • Order confirmed & manifest verified</p>
                        </div>
                        <div className="relative">
                          <CheckCircle2 className="absolute -left-[31px] bg-white text-[#113b2e]" size={18} />
                          <h4 className="text-sm font-bold text-gray-900">Vehicle Assigned</h4>
                          <p className="text-xs text-gray-500 mt-1">Oct 27, 18:30 IST • Isuzu FVR 10-Wheeler ({selectedBooking.vehicle}), Driver Kapila J.</p>
                        </div>
                        {selectedBooking.status === 'In Transit' && (
                          <div className="relative border-l-2 border-dashed border-gray-200 -ml-[2px] pl-[26px]">
                            <Truck className="absolute -left-[27px] bg-white text-[#113b2e] p-0.5 border-2 border-[#113b2e] rounded-full" size={18} />
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">Departed Origin / In Transit <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span></h4>
                            <p className="text-xs text-gray-500 mt-1">Oct 28, 08:30 AM IST • Passed Kottawa Interchange</p>
                            <div className="mt-2 flex gap-2">
                               <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">Speed: 72 km/h</span>
                               <span className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">Lat: 6.840 - Lng: 79.998</span>
                            </div>
                          </div>
                        )}
                        <div className="relative border-l-2 border-transparent -ml-[2px] pl-[26px]">
                          <CheckCircle2 className="absolute -left-[27px] bg-white text-gray-300" size={18} />
                          <h4 className="text-sm font-bold text-gray-400">Gate Arrival & Offload</h4>
                          <p className="text-xs text-gray-400 mt-1">Est. Arrival Today, 12:45 PM IST at Galle Bay 04</p>
                        </div>
                     </div>

                     {/* Store Route & Asset */}
                     <div className="mt-8 border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Store Route & Asset</h4>
                        <div className="flex gap-2 mb-3">
                           <div className="bg-gray-50 border border-gray-100 flex-1 p-3 rounded text-xs">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Origin Hub</span>
                              <p className="font-bold text-gray-900 mt-1">{selectedBooking.from.split(' (')[0]}</p>
                              <p className="text-gray-500 mt-1 leading-tight">Peliyagoda Central Hub, Bay 08</p>
                           </div>
                           <div className="bg-gray-50 border border-gray-100 flex-1 p-3 rounded text-xs">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Destination Hub</span>
                              <p className="font-bold text-gray-900 mt-1">{selectedBooking.to}</p>
                              <p className="text-gray-500 mt-1 leading-tight">Dakshinapatha Berth 2</p>
                           </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#113b2e] rounded-full flex items-center justify-center text-white text-xs font-bold tracking-wider">KJ</div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 leading-none mb-1">{selectedBooking.driver}</p>
                                <p className="text-[10px] text-gray-500">+94 77 123 4567</p>
                              </div>
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded ml-2">Verified<br/>Driver</span>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-bold text-gray-900 leading-none mb-1">{selectedBooking.vehicle}</p>
                              <p className="text-[10px] text-gray-500">Isuzu FVR<br/>10-W</p>
                           </div>
                        </div>
                     </div>

                     {/* Manifest Items */}
                     <div className="mt-6">
                        <div className="flex justify-between items-end mb-3">
                           <h4 className="text-sm font-bold text-gray-900">Manifest Items ({selectedBooking.consignments})</h4>
                           <span className="text-[10px] font-bold text-gray-600">Total: {selectedBooking.totalWeight}</span>
                        </div>
                        <div className="border border-gray-200 rounded text-sm bg-white divide-y divide-gray-100">
                           <div className="p-3 flex justify-between items-center">
                              <div>
                                 <p className="font-bold text-gray-800 text-xs">Pure Ceylon BOPF Tea (Cartons)</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">Palletized - Sealed Grade A</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-gray-800 text-xs">2,000 kg</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">80 units</p>
                              </div>
                           </div>
                           <div className="p-3 flex justify-between items-center">
                              <div>
                                 <p className="font-bold text-gray-800 text-xs">Organic Ceylon Cinnamon Quills (Bales)</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">Export Certification Attached</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-gray-800 text-xs">700 kg</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">35 units</p>
                              </div>
                           </div>
                        </div>
                        <div className="mt-3 bg-green-50/50 border border-green-100 rounded p-2.5 flex items-start gap-2">
                           <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
                           <p className="text-[10px] font-bold text-green-800">Compliant: Current payload 2.7T within 5.0T gross axle rating.</p>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {selectedBooking.history?.map((log, idx) => (
                        <div key={idx} className="flex gap-4 text-sm">
                           <div className="text-gray-400 pt-1 shrink-0"><History size={16} /></div>
                           <div>
                              <p className="text-gray-900 font-medium">{log.action}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{log.time} • by <span className="font-semibold">{log.by}</span></p>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
               {/* 1. Download Button */}
               <button 
                  onClick={handleDownloadClick}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50 shrink-0 shadow-sm"
               >
                  <Download size={16} />
               </button>
               
               {/* 2. Cancel Button */}
               <button 
                  onClick={handleCancelBookingClick}
                  disabled={!canEditOrCancel(selectedBooking.status)} 
                  className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${canEditOrCancel(selectedBooking.status) ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}`}
               >
                  Cancel Booking
               </button>
               
               {/* 3. Edit Button */}
               <button 
                  onClick={handleEditClick}
                  disabled={!canEditOrCancel(selectedBooking.status)} 
                  className={`px-6 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm ${canEditOrCancel(selectedBooking.status) ? 'bg-[#0f3c2c] text-white hover:bg-[#0a2e21]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
               >
                  <Edit2 size={16} /> Edit Booking
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default StoreBookings;
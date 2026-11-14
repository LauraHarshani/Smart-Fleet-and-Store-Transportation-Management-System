import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Clock, ShieldCheck, Box, 
  MapPin, Phone, Info, Calendar, ChevronDown, CheckSquare, Loader2, X, AlertCircle
} from 'lucide-react';

const NewBooking = () => {
  const navigate = useNavigate();

  // Main Form States
  const [bookingType, setBookingType] = useState('inbound');
  const [selectedDate, setSelectedDate] = useState('12 Nov');
  const [selectedSlot, setSelectedSlot] = useState('09:30 - 11:00');
  const [selectedBay, setSelectedBay] = useState('Bay 02');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // 1. Confirm & Schedule Booking Action
  const handleConfirm = () => {
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('success', 'Booking BK-0845 successfully scheduled!');
      setTimeout(() => navigate('/store/schedule'), 1500);
    }, 1200);
  };

  // 2. Save Draft Action
  const handleSaveDraft = () => {
    const draftData = { bookingType, selectedDate, selectedSlot, selectedBay };
    localStorage.setItem('bookingDraft', JSON.stringify(draftData));
    showToast('info', 'Booking saved as draft. You can resume later.');
  };

  // 3. Clear Form Action
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all selected details?")) {
      setBookingType('inbound');
      setSelectedDate('12 Nov');
      setSelectedSlot('');
      setSelectedBay('');
      showToast('error', 'Form cleared successfully.');
    }
  };

  // Load Draft on Mount (Optional)
  useEffect(() => {
    const savedDraft = localStorage.getItem('bookingDraft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setBookingType(parsed.bookingType || 'inbound');
      setSelectedDate(parsed.selectedDate || '12 Nov');
      setSelectedSlot(parsed.selectedSlot || '09:30 - 11:00');
      setSelectedBay(parsed.selectedBay || 'Bay 02');
    }
  }, []);

  const dates = ['01 Nov', '02 Nov', '03 Nov', '12 Nov', '13 Nov'];
  const timeSlots = [
    { time: '08:00 - 09:30', status: 'Open' },
    { time: '09:30 - 11:00', status: 'Selected' },
    { time: '11:00 - 12:30', status: 'Open' },
    { time: '16:00 - 18:00', status: 'Open' }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl border animate-in slide-in-from-top-2 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-600" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-600" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-600" />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex justify-between items-start bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-2">
        <div>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">STORE OPERATIONS / SCHEDULE / NEW BOOKING</p>
          <h1 className="text-[26px] leading-tight font-bold text-[#173F35]">New Slot Booking</h1>
          <p className="text-sm text-gray-500 mt-1">Reserve loading bays and manage carrier appointments.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/store/schedule')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">Recent Bookings</button>
          <button onClick={() => showToast('info', 'Loading Live Grid...')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">Live Grid</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold">TODAY'S STORE SLOTS</p>
          <p className="text-2xl font-bold text-[#173F35] mt-1">16 Total</p>
          <p className="text-[10px] text-green-600 font-medium mt-1">• 8 slots remaining</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold">DOCK BAY 01</p>
          <p className="text-2xl font-bold text-[#173F35] mt-1">85% Full</p>
          <p className="text-[10px] text-gray-500 mt-1">Standard Cargo & Van Dock</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold">DOCK BAY 02</p>
          <p className="text-2xl font-bold text-[#15803D] mt-1">Active</p>
          <p className="text-[10px] text-gray-500 mt-1">Heavy Pallet / Forklift Open</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold">AVERAGE UNLOAD</p>
          <p className="text-2xl font-bold text-[#173F35] mt-1">42 Mins</p>
          <p className="text-[10px] text-gray-500 mt-1">Turnaround efficiency 94%</p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* Main Form Area (Left) */}
        <div className="flex-1 space-y-6">
          
          {/* Booking Type */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#173F35] text-sm">Booking Type</h3>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Required</span>
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={() => setBookingType('inbound')}
                 className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all ${bookingType === 'inbound' ? 'border-[#15803D] bg-[#F0FDF4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
               >
                 <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingType === 'inbound' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}><CheckCircle2 size={18}/></div>
                   <div className="text-left">
                     <p className={`font-bold text-sm ${bookingType === 'inbound' ? 'text-[#15803D]' : 'text-gray-700'}`}>Inbound Delivery</p>
                     <p className="text-[11px] text-gray-500 mt-0.5">Deliveries to store via standard hours</p>
                   </div>
                 </div>
               </button>

               <button 
                 onClick={() => setBookingType('outbound')}
                 className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all ${bookingType === 'outbound' ? 'border-[#1D4ED8] bg-[#EFF6FF]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
               >
                 <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingType === 'outbound' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}><ArrowRight size={18}/></div>
                   <div className="text-left">
                     <p className={`font-bold text-sm ${bookingType === 'outbound' ? 'text-[#1D4ED8]' : 'text-gray-700'}`}>Outbound Dispatch</p>
                     <p className="text-[11px] text-gray-500 mt-0.5">Outbound via dispatched windows</p>
                   </div>
                 </div>
               </button>
            </div>
          </div>

          {/* Schedule & Dock Allocation */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-bold text-[#173F35] text-sm mb-4">Schedule & Dock Allocation</h3>
             
             <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
               {dates.map((date) => (
                 <button 
                   key={date}
                   onClick={() => setSelectedDate(date)}
                   className={`px-6 py-2.5 rounded-lg border text-sm font-semibold transition-all min-w-[90px] ${selectedDate === date ? 'bg-[#173F35] text-white border-[#173F35] shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                 >
                   {date}
                 </button>
               ))}
             </div>

             <p className="text-xs text-gray-500 font-medium mb-3">Turnaround Window (IST)</p>

             <div className="grid grid-cols-4 gap-3 mb-6">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button 
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-lg border text-center transition-all ${isSelected ? 'border-[#15803D] bg-[#F0FDF4] shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                      <p className={`text-xs font-medium ${isSelected ? 'text-[#15803D]' : 'text-gray-500'}`}>{slot.time}</p>
                      <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-[#15803D]' : 'text-gray-800'}`}>{isSelected ? 'Selected' : slot.status}</p>
                    </button>
                  )
                })}
             </div>

             <p className="text-xs text-gray-500 font-medium mb-3">Assigned Bay</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedBay('Bay 01')} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selectedBay === 'Bay 01' ? 'border-[#15803D] bg-[#F0FDF4]' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedBay === 'Bay 01' ? 'border-[#15803D]' : 'border-gray-300'}`}>
                    {selectedBay === 'Bay 01' && <div className="w-2 h-2 bg-[#15803D] rounded-full"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Bay 01 <span className="font-normal text-xs text-gray-500">(General)</span></p>
                  </div>
                </button>
                <button onClick={() => setSelectedBay('Bay 02')} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selectedBay === 'Bay 02' ? 'border-[#15803D] bg-[#F0FDF4]' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedBay === 'Bay 02' ? 'border-[#15803D]' : 'border-gray-300'}`}>
                    {selectedBay === 'Bay 02' && <div className="w-2 h-2 bg-[#15803D] rounded-full"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Bay 02 <span className="font-normal text-xs text-gray-500">(Heavy)</span></p>
                  </div>
                </button>
             </div>
          </div>

          {/* Route & Facilities */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-bold text-[#173F35] text-sm mb-4">Route & Facilities</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Origin Hub / Depot</label>
                  <div className="relative">
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-800 appearance-none bg-white font-medium focus:outline-none focus:border-green-500">
                      <option>Kandy Regional Depot</option>
                      <option>Colombo Central Hub</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destination</label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-600 font-medium flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400"/> Colombo Central Store
                  </div>
                </div>
             </div>
          </div>

          {/* Vehicle & Operator */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-bold text-[#173F35] text-sm mb-4">Vehicle & Operator</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fleet Vehicle</label>
                  <div className="flex border border-gray-300 rounded-lg p-2.5 items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">WP LH-4521</span>
                    <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded font-bold">98% Health</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Driver</label>
                    <input type="text" defaultValue="Nimal Perera" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-800 font-medium" readOnly />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Summary Sidebar (Right) */}
        <div className="w-[340px] bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 p-6 flex flex-col sticky top-24">
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h3 className="font-bold text-[#173F35] text-lg">Summary</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold uppercase">Drafting</span>
          </div>
          
          <div className="mb-6">
            <p className="text-base font-bold text-gray-800">BK-0845</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{bookingType === 'inbound' ? 'Inbound' : 'Outbound'} • Loading</p>
            <p className="text-xs text-gray-500 font-medium">Thu, {selectedDate}</p>
          </div>

          <div className="bg-[#F0FDF4] p-4 rounded-xl border border-[#BBF7D0] mb-6">
             <p className="text-[10px] font-bold text-[#15803D] mb-1.5 tracking-wider">SELECTED SLOT</p>
             <p className="text-xl font-bold text-[#14532D] mb-1">{selectedSlot || 'Not Selected'}</p>
             <p className="text-xs text-[#15803D] font-medium">Colombo Central Hub - {selectedBay || 'No Bay'}</p>
          </div>

          <div className="text-sm space-y-3 mb-6 border-b border-gray-100 pb-6">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-medium">Cargo:</span> 
              <span className="font-semibold text-gray-800 text-right">Tea & Spices<br/><span className="text-xs text-gray-500">(1,850 kg)</span></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Vehicle:</span> 
              <span className="font-semibold text-gray-800">WP LH-4521</span>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            {/* CONFIRM BUTTON */}
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full py-3 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#173F35] hover:bg-[#0F2C25]'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin"/> Processing...</>
              ) : (
                <><CheckCircle2 size={18}/> Confirm & Schedule Booking</>
              )}
            </button>

            {/* SAVE DRAFT BUTTON */}
            <button 
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="w-full py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>

            {/* CLEAR FORM BUTTON */}
            <button 
              onClick={handleClearForm}
              disabled={isSubmitting}
              className="w-full py-2 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors mt-2 disabled:opacity-50"
            >
              Clear Form
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
             <p className="text-[10px] text-gray-400 font-medium">Slots are 15-min increments</p>
             <p className="text-[10px] text-gray-500 font-bold">Peliyagoda Hub</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewBooking;
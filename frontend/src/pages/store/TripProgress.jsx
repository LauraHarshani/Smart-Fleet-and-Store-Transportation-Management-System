import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Truck, MapPin, Phone, Activity, ShieldCheck, CheckCircle2, 
  RefreshCw, AlertTriangle, X, Loader2, Info, ArrowRight
} from 'lucide-react';

// Fix for default Leaflet marker icons missing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Vehicle Icon
const vehicleIcon = new L.DivIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="background-color: #173F35; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const TripProgress = () => {
  const navigate = useNavigate();

  // UI States
  const [toast, setToast] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map Coordinates (Simulated: Kandy -> Colombo)
  const originPos = [7.2906, 80.6337]; 
  const vehiclePos = [7.0917, 80.0117]; // Somewhere near Nittambuwa/Kegalle
  const destPos = [6.9271, 79.8612];
  const routePath = [originPos, vehiclePos, destPos];

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('success', 'GPS position refreshed successfully.');
    }, 1000);
  };

  const handleCallDriver = () => {
    window.location.href = "tel:+94772345678";
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReportModalOpen(false);
      showToast('error', 'Delay report submitted successfully. Admin notified.');
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-5 font-sans pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl border animate-in slide-in-from-top-2 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-600" />}
          {toast.type === 'error' && <AlertTriangle size={20} className="text-red-600" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-600" />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Every arrival, in view.</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Real-time telemetry precision GPS tracking, and receiving bay synchronization.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
             <div className="w-2 h-2 bg-[#15803D] rounded-full animate-pulse"></div> SOCKET.IO Connected
           </div>
           <button onClick={() => showToast('info', 'Opening GPS details...')} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 hover:text-black transition-colors">
             <MapPin size={14}/> GPS Active
           </button>
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing}
             className="flex items-center gap-1.5 text-[11px] font-bold text-[#173F35] hover:text-[#0F2C25] transition-colors disabled:opacity-50"
           >
             <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''}/> {isRefreshing ? 'Refreshing...' : 'Refresh position'}
           </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="border-r border-gray-100 pr-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">ESTIMATED ARRIVAL</p>
            <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">On Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">11:05 AM</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Bay 02 slot • 11:00 - 12:30</p>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">23 mins remaining</p>
        </div>
        <div className="border-r border-gray-100 px-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">DISTANCE TO HUB</p>
            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">74% Done</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">5.2 km</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#15803D] rounded-full w-[74%]"></div>
            </div>
            <span className="text-[9px] text-gray-500 font-medium">14.8 / 20.0 km</span>
          </div>
        </div>
        <div className="border-r border-gray-100 px-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">LAST GPS PING</p>
            <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">10:42:18</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Refreshed 23s ago</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">Accuracy: ±8m</p>
        </div>
        <div className="pl-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">CURRENT SPEED</p>
            <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">EtaExpressway</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">42 km/h</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1"><ArrowRight size={10} className="rotate-45"/> South-Westbound</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1 flex items-center gap-1">Cruising speed normal</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-5 items-start">
        
        {/* Left Panel: Map & Milestones */}
        <div className="flex-1 space-y-4">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#173F35]"/>
                <h3 className="font-bold text-gray-800 text-lg">Trip TRP-061</h3>
                <span className="text-xs font-medium text-gray-500">WP LH-4521</span>
              </div>
              <span className="text-[10px] bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#047857] rounded-full animate-pulse"></div> Live Telemetry Active
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <MapPin size={14} className="text-gray-500"/>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Route Schematic - Corridor A1</span>
            </div>

            {/* Real Map Container */}
            <div className="relative w-full h-[350px] rounded-lg overflow-hidden border border-gray-200 z-0">
               <MapContainer center={[7.0917, 80.0117]} zoom={9} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                 <Polyline positions={routePath} color="#173F35" weight={3} dashArray="5, 10" />
                 
                 <Marker position={originPos}>
                   <Popup><span className="text-xs font-bold text-gray-800">Kandy Depot (Origin)</span></Popup>
                 </Marker>
                 
                 <Marker position={destPos}>
                   <Popup><span className="text-xs font-bold text-gray-800">Colombo Central Hub</span></Popup>
                 </Marker>

                 <Marker position={vehiclePos} icon={vehicleIcon}>
                   <Popup>
                     <div className="text-center">
                       <p className="text-xs font-bold text-[#173F35]">WP LH-4521</p>
                       <p className="text-[10px] text-gray-500">42 km/h • South-Westbound</p>
                     </div>
                   </Popup>
                 </Marker>
               </MapContainer>

               {/* Map Overlay Info */}
               <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md border border-gray-200 flex items-center gap-3 text-[10px] font-bold text-gray-700">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Congestion: 4.4 km</div>
                 <div className="w-px h-3 bg-gray-300"></div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full"></div> Remaining: 5.2 km</div>
               </div>
            </div>
          </div>

          {/* Journey Milestones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-sm">Journey Milestones</h3>
              <span className="text-[10px] bg-[#ECFDF5] text-[#047857] font-bold px-2 py-0.5 rounded">74% Completed</span>
            </div>

            <div className="relative flex justify-between items-center">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
              <div className="absolute left-0 w-[60%] top-1/2 h-0.5 bg-[#173F35] -z-10"></div>

              <div className="flex flex-col items-center bg-white px-2">
                <div className="w-7 h-7 bg-[#173F35] rounded-full flex items-center justify-center text-white mb-2"><CheckCircle2 size={14}/></div>
                <p className="text-[10px] font-bold text-gray-800">Assigned</p>
              </div>
              <div className="flex flex-col items-center bg-white px-2">
                <div className="w-7 h-7 bg-[#173F35] rounded-full flex items-center justify-center text-white mb-2"><CheckCircle2 size={14}/></div>
                <p className="text-[10px] font-bold text-gray-800">Departed Kandy</p>
              </div>
              <div className="flex flex-col items-center bg-white px-2">
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2 border-4 border-blue-100 ring-2 ring-white"><Activity size={12}/></div>
                <p className="text-[10px] font-bold text-blue-600">Nittambuwa</p>
              </div>
              <div className="flex flex-col items-center bg-white px-2 opacity-50">
                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-2 border border-gray-300"><MapPin size={14}/></div>
                <p className="text-[10px] font-bold text-gray-500">Hub Bay 02</p>
                <span className="text-[8px] text-gray-400">11:05 AM</span>
              </div>
            </div>

            <div className="mt-6 bg-[#F0F9FF] p-3 rounded-lg border border-[#BAE6FD] text-[11px] text-[#0369A1] flex items-center gap-2">
              <Info size={16} className="shrink-0"/>
              <p>Receiving <strong>Bay 02</strong> reserved for 11:00 AM - 12:30 PM. Inbound unloading crew has been notified and bay staging is active.</p>
            </div>
          </div>

        </div>

        {/* Right Panel: Details Sidebar */}
        <div className="w-[340px] bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col shrink-0">
          
          <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Selected Trip</h3>
              <p className="text-xs text-gray-500 mt-0.5">TRP-061 <span className="mx-1">•</span> Inbound Cargo</p>
            </div>
            <span className="text-[10px] bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2 py-1 rounded font-bold">In Transit</span>
          </div>

          <div className="bg-[#F0FDF4] p-4 rounded-xl border border-[#BBF7D0] mb-5">
            <p className="text-[10px] font-bold text-[#15803D] mb-1 tracking-wider uppercase">Arrival at Colombo Hub</p>
            <p className="text-xl font-bold text-[#14532D] mb-1">11:05 AM</p>
            <p className="text-xs text-[#15803D] font-medium flex items-center gap-1"><MapPin size={12}/> Slot Bay #02</p>
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 mb-2 tracking-wider uppercase">Vehicle & Operator</p>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gray-500"/>
                <div>
                  <p className="text-sm font-bold text-gray-800">WP LH-4521</p>
                  <p className="text-[10px] text-gray-500">Isuzu ELF • 3.3t</p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">4.2°C Cold</span>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">NP</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Nimal Perera</p>
                  <p className="text-[10px] text-gray-500">+94 77 234 5678</p>
                </div>
              </div>
              <button 
                onClick={handleCallDriver}
                className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-green-600 hover:border-green-300 transition-colors"
              >
                <Phone size={14}/>
              </button>
            </div>
          </div>

          <div className="text-[11px] space-y-3 mb-5 border-b border-gray-100 pb-5">
            <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Route</span> <span className="font-semibold text-gray-800">Kandy Depot - Colombo Hub</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Manifest</span> <span className="font-semibold text-gray-800">Tea & Spices (1,850 kg)</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Security Seal</span> <span className="font-semibold text-[#047857] flex items-center gap-1"><ShieldCheck size={12}/> SL-89240 (Intact)</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Assigned Bay</span> <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">Bay #02 (Scheduled)</span></div>
          </div>

          <div className="space-y-2 mt-auto">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-2.5 bg-[#173F35] text-white rounded-lg text-sm font-semibold hover:bg-[#0F2C25] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
               View Booking Details
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-2 border border-gray-300 text-[#E11D48] rounded-lg text-xs font-bold hover:bg-[#FFF1F2] transition-colors flex items-center justify-center gap-2"
            >
               <AlertTriangle size={14}/> Report Delay or Bay Conflict
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Reefer Unit Status</p>
              <p className="text-[10px] font-semibold text-gray-600 mt-0.5">Setpoint: 4.0°C | Current: 4.2°C</p>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Normal</span>
          </div>

        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Booking Details Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Truck size={18}/> Booking BK-0841 Details</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">TRIP ID</p>
                    <p className="text-sm font-semibold text-gray-800">TRP-061</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">BOOKING ID</p>
                    <p className="text-sm font-semibold text-gray-800">BK-0841</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">ORIGIN</p>
                    <p className="text-sm font-semibold text-gray-800">Kandy Regional Depot</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">DESTINATION</p>
                    <p className="text-sm font-semibold text-gray-800">Colombo Central Hub</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">ESTIMATED ARRIVAL</p>
                    <p className="text-sm font-semibold text-[#15803D]">11:05 AM (On Time)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold">ASSIGNED BAY</p>
                    <p className="text-sm font-semibold text-gray-800">Bay #02</p>
                  </div>
               </div>
               <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4">
                 <p className="text-xs text-gray-600"><strong>Driver Note:</strong> All seals intact. Traffic moderate on expressway.</p>
               </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 bg-[#173F35] text-white font-semibold rounded-lg text-sm hover:bg-[#0F2C25]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Report Delay/Conflict Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[450px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50">
              <h3 className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={18}/> Report Issue</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-red-400 hover:text-red-700"><X size={20}/></button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Let the admin and fleet manager know about any delays or conflicts regarding <strong className="text-gray-800">TRP-061</strong>.</p>
                
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Issue Type</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-red-500 outline-none">
                    <option>Delayed due to Traffic</option>
                    <option>Bay Conflict at Destination</option>
                    <option>Vehicle Breakdown</option>
                    <option>Cargo / Seal Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Additional Details (Optional)</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24 resize-none focus:ring-1 focus:ring-red-500 outline-none" 
                    placeholder="Provide specific details here..."
                  ></textarea>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TripProgress;
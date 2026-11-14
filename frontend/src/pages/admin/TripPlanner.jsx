import React, { useState } from 'react';
import { 
  ArrowRight, Save, Send, Plus, MapPin, 
  Navigation, AlertTriangle, Truck, UserCircle2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { tripStats, stopsData, capacityData, historyData } from '../../Data/mockTripData';
import OverrideModal from './OverrideModal';

const TripPlanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stops, setStops] = useState(stopsData);
  const [isSaved, setIsSaved] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleSaveDraft = () => {
    setIsSaved(true);
    setIsDispatched(false);
  };

  const handleDispatchTrip = () => {
    setIsDispatched(true);
    setIsSaved(false);
  };

  const handleAddStop = () => {
    const nextStop = {
      id: Date.now(),
      type: 'DROP',
      location: 'New Delivery Point',
      time: 'ETA 09:45',
      window: '09:45 - 10:15',
      items: ['Additional stop added to route'],
    };

    setStops((currentStops) => [...currentStops, nextStop]);
  };

  const totalStops = stops.length;

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            Trip Planner & Allocation
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
              Draft
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select Colombo & Kelani Valley Multi-Drop • Target Dispatch: 06:15 AM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <Save size={16} />
            {isSaved ? 'Saved' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handleDispatchTrip}
            className="flex items-center gap-2 rounded-lg bg-[#0B2B26] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(11,43,38,0.22)] transition-all duration-200 hover:bg-[#123d36] hover:shadow-[0_6px_14px_rgba(11,43,38,0.25)] focus:outline-none focus:ring-2 focus:ring-[#0B2B26]/30"
          >
            <Send size={16} />
            {isDispatched ? 'Trip Dispatched' : 'Dispatch Trip'}
          </button>
        </div>
      </div>

      {(isSaved || isDispatched) && (
        <div className={`rounded-lg border px-3 py-2 text-sm ${isDispatched ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {isDispatched ? 'Trip dispatched successfully.' : 'Draft saved successfully.'}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "TOTAL DISTANCE", value: tripStats.distance },
          { label: "TRANSIT TIME", value: tripStats.transitTime },
          { label: "TOTAL STOPS", value: `${totalStops} Points` },
          { label: "FLEET CARBON", value: tripStats.carbon },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Multi-Stop Sequence */}
        <div className="col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Navigation size={18} className="text-gray-400"/> Multi-Stop Sequence
            </h3>
            <button
              type="button"
              onClick={handleAddStop}
              className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <Plus size={16} />
              Add Stop
            </button>
          </div>
          
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${idx === 0 || idx === stops.length - 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stop.type === 'ORIGIN' ? 'bg-gray-100 text-gray-700' : stop.type === 'RETURN' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                        {stop.type}
                      </span>
                      <h4 className="font-semibold text-gray-800">{stop.location}</h4>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      {stop.window && <p>Window: {stop.window} (Est. {stop.window.split(' - ')[1]})</p>}
                      {stop.items.map((item, i) => (
                        <p key={i} className="flex items-center gap-1 text-gray-600">
                          <ArrowRight size={12} className="text-gray-400" /> {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{stop.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Capacity & Vehicle */}
        <div className="col-span-5 space-y-6">
          
          {/* Payload & Capacity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Payload & Capacity</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-600">Weight Load ({capacityData.weight.percentage}%)</span>
                  <span className="text-gray-800 font-bold">{capacityData.weight.current.toLocaleString()} / {capacityData.weight.max.toLocaleString()} kg</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${capacityData.weight.percentage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-600">Volume Load ({capacityData.volume.percentage}%)</span>
                  <span className="text-gray-800 font-bold">{capacityData.volume.current} / {capacityData.volume.max} m³</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${capacityData.volume.percentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
               <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1"><MapPin size={12}/> 2°C Zone 1 Ambient</span>
               <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded flex items-center gap-1"><MapPin size={12}/> 2°C Zone 2 Chilled</span>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 space-y-3">
              {capacityData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-500 font-medium">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle & Driver Allocation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600"/> Vehicle & Driver Allocation
              </h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded"
              >
                Override
              </button>
            </div>

            <div className="space-y-3">
              {/* Vehicle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700"><Truck size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Fuso eCanter EV</p>
                    <p className="text-xs text-gray-500">LP-WD-5020 • 98% FE</p>
                  </div>
                </div>
              </div>

              {/* Driver */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700"><UserCircle2 size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Kamal Gunawardena</p>
                    <p className="text-xs text-gray-500">HGV, 7 yrs remaining • 4.9 ★ Rating</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Top Pick</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">2 alternative drivers and EV units available</p>
          </div>

        </div>
      </div>

      {/* Trip History Table (Bottom) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Trip Planning History</h3>
          <div className="flex gap-2">
            <button className="text-xs text-gray-600 hover:text-black">Last 7 Days</button>
            <button className="text-xs text-gray-600 hover:text-black">Export</button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium">TRIP ID</th>
              <th className="pb-3 font-medium">ROUTE & STOPS</th>
              <th className="pb-3 font-medium">DISPATCH</th>
              <th className="pb-3 font-medium">STATUS</th>
              <th className="pb-3 font-medium">DISTANCE</th>
              <th className="pb-3 font-medium">CARBON</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {historyData.map((trip) => (
              <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 font-semibold text-gray-800">{trip.id}<br/><span className="text-xs text-gray-400 font-normal">{trip.date}</span></td>
                <td className="py-3 text-gray-600">{trip.route}</td>
                <td className="py-3 text-gray-600">{trip.dispatch}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    trip.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    trip.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="py-3 text-gray-600">{trip.distance}</td>
                <td className="py-3 text-gray-600">{trip.carbon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Override Modal (Image 3) */}
      {isModalOpen && <OverrideModal onClose={() => setIsModalOpen(false)} />}

    </div>
  );
};

export default TripPlanner;
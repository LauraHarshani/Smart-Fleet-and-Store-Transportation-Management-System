import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Truck, UserCircle2, CheckCircle2 } from 'lucide-react';

const OverrideModal = ({ onClose }) => {
  const [reason, setReason] = useState('driver_rest');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[600px] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600" /> Manual Allocation Override
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
        </div>

        <div className="p-6">
          <p className="text-xs text-gray-500 mb-4">Trip TRP-LK-2026-884 • Audit Logged</p>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-green-200 bg-green-50 rounded-lg p-3">
              <p className="text-[10px] font-bold text-green-700 mb-2">SYSTEM MATCH</p>
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-gray-500"/> <span className="text-sm font-semibold text-gray-800">Fuso eCanter EV</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCircle2 size={14} className="text-gray-500"/> <span className="text-sm text-gray-600">Kamal Gunawardena</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-500 mb-2">MANUAL OVERRIDE</p>
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-gray-500"/> <span className="text-sm font-semibold text-gray-800">Isuzu Elf (Standby Unit)</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCircle2 size={14} className="text-gray-500"/> <span className="text-sm text-gray-600">Dinesh Priyantha</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded mb-6">
            <AlertTriangle size={14} /> Projected Variance: +14 mins transit • - Rs. 1,450 fuel delta
          </div>

          {/* Reasons */}
          <p className="text-xs font-bold text-gray-700 mb-3">REASON FOR OVERRIDE</p>
          <div className="space-y-2 mb-6">
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${reason === 'driver_rest' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="reason" value="driver_rest" checked={reason === 'driver_rest'} onChange={(e) => setReason(e.target.value)} className="mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><CheckCircle2 size={14} className="text-green-600"/> Driver Rest / HOS Compliance</p>
                <p className="text-xs text-gray-500">Kamal Gunawardena is mandated for mandatory rest cycle</p>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${reason === 'maintenance' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="reason" value="maintenance" checked={reason === 'maintenance'} onChange={(e) => setReason(e.target.value)} className="mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Vehicle Maintenance / Battery Check</p>
                <p className="text-xs text-gray-500">eCanter quick swapped for battery health calibration</p>
              </div>
            </label>
          </div>

          {/* Justification Note */}
          <p className="text-xs font-bold text-gray-700 mb-2">OPERATIONAL JUSTIFICATION NOTE</p>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none h-20 resize-none mb-6"
            placeholder="Type your justification here..."
            defaultValue="Assigned standby driver Dinesh Priyantha per Fleet Manager directive (FM-CO-4091). HOS window verified clean."
          ></textarea>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-[#0B2B26] rounded-lg hover:bg-[#164B41] flex items-center gap-2">
            <ShieldCheck size={16}/> Confirm Override & Log to Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideModal;
import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';

const TopNavbar = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 ml-64 fixed w-[calc(100%-16rem)] z-10">
      
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      {/* Right side actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell (SRS 7.1) */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
          >
            <Bell size={20} />
            {/* Unread indicator */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Dropdown Panel for Notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-sm text-gray-700">Notifications</h3>
                <button className="text-xs text-green-600 hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {/* Mock Notification Items */}
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <p className="text-xs font-semibold text-red-500 mb-1">COLD CHAIN CRITICAL</p>
                  <p className="text-sm text-gray-800 font-medium">Cold Chain Temperature Alert</p>
                  <p className="text-xs text-gray-500 mt-1">Trailer TRP-1042 reported 8.2°C.</p>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <p className="text-xs font-semibold text-amber-500 mb-1">ROUTE DEVIATION</p>
                  <p className="text-sm text-gray-800 font-medium">Driver route changed</p>
                  <p className="text-xs text-gray-500 mt-1">TRP-891 rerouted due to flooding.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile (SRS 3 - System Administrator) */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-green-800 text-white flex items-center justify-center rounded-full font-bold text-sm">
            AD
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
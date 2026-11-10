import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarCheck, Map, Clock, MapPin, 
  Truck, Users, Store, Package, UserCog, BarChart3, 
  Settings, LogOut 
} from 'lucide-react'; // Icons සඳහා lucide-react පාවිච්චි කරමු

const Sidebar = () => {
  // SRS Section 7.1 එකට අනුව menu items
  const menuItems = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' }
      ]
    },
    {
      title: 'TRANSPORT & OPERATIONS',
      items: [
        { name: 'Bookings', icon: <CalendarCheck size={18} />, path: '/bookings' },
        { name: 'Trip Planning', icon: <Map size={18} />, path: '/trip-planning' },
        { name: 'Schedules', icon: <Clock size={18} />, path: '/schedules' },
        { name: 'Live Tracking', icon: <MapPin size={18} />, path: '/tracking' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Vehicles', icon: <Truck size={18} />, path: '/vehicles' },
        { name: 'Drivers', icon: <Users size={18} />, path: '/drivers' },
        { name: 'Stores', icon: <Store size={18} />, path: '/stores' },
        { name: 'Items', icon: <Package size={18} />, path: '/items' },
        { name: 'Users', icon: <UserCog size={18} />, path: '/users' },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Reports', icon: <BarChart3 size={18} />, path: '/reports' },
      ]
    }
  ];

  return (
    <div className="w-64 bg-[#0B2B26] text-gray-300 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="px-6 py-6 border-b border-[#1A4038]">
        <h1 className="text-white text-xl font-bold tracking-wider">LogiFleet</h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Fleet & Store Management</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <p className="px-6 text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              {section.title}
            </p>
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                        isActive 
                          ? 'bg-[#164B41] text-[#4ADE80] border-l-4 border-[#4ADE80]' 
                          : 'hover:bg-[#164B41] hover:text-white border-l-4 border-transparent'
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-[#1A4038] py-4">
        <ul>
          <li>
            <NavLink to="/profile" className="flex items-center gap-3 px-6 py-2 text-sm hover:text-white">
              <UserCog size={18} /> Profile
            </NavLink>
          </li>
          <li>
            <button className="flex items-center gap-3 px-6 py-2 text-sm hover:text-white w-full text-left">
              <LogOut size={18} /> Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
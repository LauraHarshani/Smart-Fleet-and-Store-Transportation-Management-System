import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Truck, LayoutDashboard, CalendarCheck, Route as RouteIcon, 
    CalendarDays, MapPin, Users, Store, Package, UserCog, 
    LineChart, User, LogOut, Bell 
} from 'lucide-react';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/bookings': 'Bookings',
    '/trip-planning': 'Trip Planning',
    '/schedules': 'Vehicle Schedule',
    '/live-tracking': 'Live Tracking',
    '/vehicles': 'Vehicles',
    '/drivers': 'Drivers',
    '/stores': 'Stores',
    '/items': 'Items',
    '/users': 'User Management',
    '/reports': 'Reports',
    '/profile': 'Profile',
};

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-2.5 mx-3 rounded-lg font-medium transition-colors ${
            active
                ? 'bg-[#0fa979] text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
    </Link>
);

const NavCategory = ({ title }) => (
    <div className="px-7 mt-6 mb-2 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
        {title}
    </div>
);

const AdminLayout = () => {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] ?? '';

    // Helper function to check if the current path matches the link (for active state)
    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#f4f7f6]">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#113b2e] text-white flex flex-col overflow-hidden">
                {/* Logo Area */}
                <div className="p-6">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
                        LogiFleet <Truck size={24} className="mt-1" />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Fleet & Store Management</div>
                </div>

                {/* Navigation Links - Hidden scrollbar class added here */}
                <nav className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
                    <NavCategory title="Overview" />
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} />

                    <NavCategory title="Transport & Operations" />
                    <NavItem to="/bookings" icon={CalendarCheck} label="Bookings" active={isActive('/bookings')} />
                    <NavItem to="/trip-planning" icon={RouteIcon} label="Trip Planning" active={isActive('/trip-planning')} />
                    <NavItem to="/schedules" icon={CalendarDays} label="Schedules" active={isActive('/schedules')} />
                    <NavItem to="/live-tracking" icon={MapPin} label="Live Tracking" active={isActive('/live-tracking')} />

                    <NavCategory title="Management" />
                    <NavItem to="/vehicles" icon={Truck} label="Vehicles" active={isActive('/vehicles')} />
                    <NavItem to="/drivers" icon={Users} label="Drivers" active={isActive('/drivers')} />
                    <NavItem to="/stores" icon={Store} label="Stores" active={isActive('/stores')} />
                    <NavItem to="/items" icon={Package} label="Items" active={isActive('/items')} />
                    <NavItem to="/users" icon={UserCog} label="Users" active={isActive('/users')} />

                    <NavCategory title="Analytics" />
                    <NavItem to="/reports" icon={LineChart} label="Reports" active={isActive('/reports')} />
                </nav>

                {/* Bottom Profile Area */}
                <div className="py-4 border-t border-white/10 mt-auto">
                    <NavItem to="/profile" icon={User} label="Profile" active={isActive('/profile')} />
                    <button className="flex items-center gap-3 px-4 py-2.5 mx-3 w-[calc(100%-24px)] text-left rounded-lg font-medium text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-colors">
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <Bell size={22} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-[#113b2e] flex items-center justify-center text-white font-semibold text-sm">
                                AM
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 leading-tight">Admin</span>
                                <span className="text-xs text-gray-500">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content (Outlet) */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

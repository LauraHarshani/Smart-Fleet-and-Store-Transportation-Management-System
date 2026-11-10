import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Truck, LayoutDashboard, CalendarCheck, Route as RouteIcon, 
    CalendarDays, MapPin, Users, Store, Package, UserCog, 
    LineChart, User, LogOut, Bell, Check, ClipboardList
} from 'lucide-react';

const initialNotifications = [
    {
        id: 1,
        title: 'Booking awaiting approval',
        message: 'A new store replenishment booking is ready for review.',
        time: '10 minutes ago',
        icon: CalendarCheck,
        read: false,
    },
    {
        id: 2,
        title: 'Vehicle maintenance due',
        message: 'A vehicle in the fleet has scheduled maintenance coming up.',
        time: '1 hour ago',
        icon: Truck,
        read: false,
    },
    {
        id: 3,
        title: 'Inventory updated',
        message: 'Store inventory information has been updated.',
        time: 'Yesterday',
        icon: ClipboardList,
        read: true,
    },
];

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/bookings': 'Bookings',
    '/approval-log': 'Bookings',
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
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationPanelRef = useRef(null);
    const unreadCount = notifications.filter((notification) => !notification.read).length;

    // Helper function to check if the current path matches the link (for active state)
    const isActive = (path) =>
        location.pathname === path ||
        (path === '/bookings' && location.pathname === '/approval-log');

    useEffect(() => {
        if (!isNotificationsOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!notificationPanelRef.current?.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsNotificationsOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isNotificationsOpen]);

    return (
        <div className="flex h-screen bg-[#f4f7f6]">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#113b2e] text-white flex flex-col overflow-hidden">
                {/* Logo Area */}
                <div className="p-6 border-b border-white/10">
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
                        <div className="relative" ref={notificationPanelRef}>
                            <button
                                type="button"
                                onClick={() => setIsNotificationsOpen((open) => !open)}
                                className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                                aria-expanded={isNotificationsOpen}
                                aria-haspopup="dialog"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <section
                                    className="absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                                    role="dialog"
                                    aria-label="Notifications"
                                >
                                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifications((current) =>
                                                current.map((notification) => ({ ...notification, read: true }))
                                            )}
                                            disabled={unreadCount === 0}
                                            className="text-xs font-semibold text-[#0fa979] transition hover:text-[#113b2e] disabled:cursor-default disabled:text-gray-400"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>

                                    <div className="max-h-[min(420px,70vh)] overflow-y-auto">
                                        {notifications.map((notification) => {
                                            const NotificationIcon = notification.icon;

                                            return (
                                                <button
                                                    key={notification.id}
                                                    type="button"
                                                    onClick={() => setNotifications((current) =>
                                                        current.map((item) => item.id === notification.id
                                                            ? { ...item, read: true }
                                                            : item
                                                        )
                                                    )}
                                                    className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 last:border-b-0 ${
                                                        notification.read ? 'bg-white' : 'bg-emerald-50/40'
                                                    }`}
                                                >
                                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f8f2] text-[#0fa979]">
                                                        <NotificationIcon size={17} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {notification.title}
                                                            </span>
                                                            {!notification.read && (
                                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0fa979]" />
                                                            )}
                                                        </span>
                                                        <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                                                            {notification.message}
                                                        </span>
                                                        <span className="mt-1.5 block text-[11px] text-gray-400">
                                                            {notification.time}
                                                        </span>
                                                    </span>
                                                    {notification.read && (
                                                        <Check size={14} className="mt-1 shrink-0 text-gray-300" aria-label="Read" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>
                        
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

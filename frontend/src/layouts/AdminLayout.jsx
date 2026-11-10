import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Truck, LayoutDashboard, CalendarCheck, Route as RouteIcon, 
    CalendarDays, MapPin, Users, Store, Package, UserCog, 
    LineChart, User, LogOut, Bell, X, Settings, Check, ShieldAlert,
    TruckIcon, ClipboardCheck, Snowflake, Radio
} from 'lucide-react';

const initialNotifications = [
    {
        id: 1,
        category: 'Alerts',
        type: 'COLD CHAIN CRITICAL',
        title: 'Cold Chain Temperature Alert',
        description: 'Reefer container #REEF-042 exceeded +4.0°C threshold. Automated chiller boost triggered.',
        location: 'Peliyagoda Hub',
        time: '8 mins ago',
        action: 'Inspect Alert',
        to: '/live-tracking',
        icon: Snowflake,
        tone: 'red',
        unread: true,
    },
    {
        id: 2,
        category: 'Trips',
        type: 'ROUTE DEVIATION',
        title: 'Route Deviation Approved: TRP-884',
        description: 'Detour via Baseline Road authorized by Sara Lin due to waterlogging near Orugodawatta junction.',
        location: 'Dispatch #TRP-884',
        time: '24 mins ago',
        action: 'View Route',
        to: '/trip-planning',
        icon: TruckIcon,
        tone: 'green',
        unread: true,
    },
    {
        id: 3,
        category: 'Alerts',
        type: 'COMPLIANCE / HOS',
        title: 'Driver Rest Break Logged',
        description: 'Driver DRV-301 (Kamal Gunathilaka) initiated scheduled 45-min mandatory rest at Ambepussa Rest Area.',
        location: 'Route WP-08 · Ambepussa',
        time: '1 hour ago',
        action: 'View Schedule',
        to: '/schedules',
        icon: ClipboardCheck,
        tone: 'green',
        unread: true,
    },
    {
        id: 4,
        category: 'System',
        type: 'SEAL INTEGRITY',
        title: 'Digital Cryoseal Verified',
        description: 'Container SL-552 tamper-evident RFID passed verification at Colombo Port terminal 2.',
        location: 'Terminal 2 Checkpoint',
        time: '3 hours ago',
        action: 'View Verification',
        to: '/reports',
        icon: ShieldAlert,
        tone: 'green',
        unread: true,
    },
    {
        id: 5,
        category: 'System',
        type: 'SYSTEM SYNC',
        title: 'Fleet data synchronized',
        description: 'Vehicle telemetry and dispatch records were synchronized successfully.',
        location: 'All fleet depots',
        time: '5 hours ago',
        action: 'View Reports',
        to: '/reports',
        icon: Radio,
        tone: 'blue',
        unread: false,
    },
];

const notificationTabs = ['All', 'Alerts', 'Trips', 'System'];

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
        className={`flex items-center gap-3 px-4 py-2.5 mx-3 rounded-lg font-medium transition-all duration-200 ${
            active
                ? 'border border-[#87d3b1] bg-[#dff5eb] text-[#0b3f34] shadow-[0_0_0_1px_rgba(15,169,121,0.18)]' 
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
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeNotificationTab, setActiveNotificationTab] = useState('All');

    useEffect(() => {
        if (!notificationsOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setNotificationsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notificationsOpen]);

    const unreadCount = notifications.filter((notification) => notification.unread).length;
    const visibleNotifications = notifications.filter((notification) =>
        activeNotificationTab === 'All' || notification.category === activeNotificationTab
    );

    const markAllAsRead = () => {
        setNotifications((current) =>
            current.map((notification) => ({ ...notification, unread: false }))
        );
    };

    const markAsRead = (id) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id ? { ...notification, unread: false } : notification
            )
        );
    };

    // වත්මන් path සහ ලින්කය ගැළපේද යන්න පරීක්ෂා කරන උපකාරක ශ්‍රිතය (සක්‍රීය තත්වය සඳහා)
    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#f4f7f6]">
            {/* පැති තීරුව */}
            <aside className="w-[260px] bg-[#113b2e] text-white flex flex-col overflow-hidden">
                {/* ලාංඡනය ප්‍රදේශය */}
                <div className="p-6">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
                        LogiFleet <Truck size={24} className="mt-1" />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Fleet & Store Management</div>
                </div>

                {/* සංචාලන සබැඳි - සඟවා ඇති scroll bar class මෙතන එක් කර ඇත */}
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

                {/* පහළ පැති මාර්ගෝපදේශ ප්‍රදේශය */}
                <div className="py-4 border-t border-white/10 mt-auto">
                    <NavItem to="/profile" icon={User} label="Profile" active={isActive('/profile')} />
                    <button className="flex items-center gap-3 px-4 py-2.5 mx-3 w-[calc(100%-24px)] text-left rounded-lg font-medium text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-colors">
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ප්‍රධාන අන්තර්ගත ප්‍රදේශය */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* ඉහළ ශීර්ෂයක් */}
                <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
                    
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => setNotificationsOpen(true)}
                            aria-label={`Open notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                            aria-expanded={notificationsOpen}
                            className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#113b2e] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                            )}
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

                {/* පිටුවේ අන්තර්ගතය (Outlet) */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>

            {notificationsOpen && (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/25 backdrop-blur-[3px]"
                    />
                    <aside
                        aria-label="Notifications"
                        className="absolute inset-y-0 right-0 flex w-full max-w-[390px] flex-col border-l border-gray-200 bg-white shadow-2xl animate-[slide-in-right_220ms_ease-out]"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f4ed] text-[#0b654b]">
                                    <Bell size={16} />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-[#0b8d64] px-2 py-0.5 text-[10px] font-bold text-white">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    disabled={unreadCount === 0}
                                    className="text-xs font-semibold text-[#087653] hover:text-[#064e38] disabled:cursor-default disabled:text-gray-400"
                                >
                                    Mark all as read
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNotificationsOpen(false)}
                                    aria-label="Close notifications"
                                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 border-b border-gray-100 bg-slate-50 px-4 py-2">
                            {notificationTabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveNotificationTab(tab)}
                                    className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                                        activeNotificationTab === tab
                                            ? 'bg-[#087653] text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f9f8] p-3">
                            {visibleNotifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                                        <Check size={22} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-gray-700">You're all caught up</p>
                                    <p className="mt-1 text-xs text-gray-500">No notifications in this category.</p>
                                </div>
                            ) : visibleNotifications.map((notification) => {
                                const Icon = notification.icon;
                                const toneClasses = notification.tone === 'red'
                                    ? 'text-red-600 bg-red-50'
                                    : notification.tone === 'blue'
                                        ? 'text-sky-700 bg-sky-50'
                                        : 'text-emerald-700 bg-emerald-50';

                                return (
                                    <article
                                        key={notification.id}
                                        className={`rounded-xl border bg-white p-3 shadow-sm transition-colors ${
                                            notification.unread ? 'border-gray-200' : 'border-gray-100 opacity-75'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
                                                <Icon size={14} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`truncate text-[9px] font-bold tracking-wide ${notification.tone === 'red' ? 'text-red-700' : 'text-emerald-700'}`}>
                                                        {notification.type}
                                                    </p>
                                                    <span className="shrink-0 text-[10px] text-gray-400">{notification.time}</span>
                                                </div>
                                                <h3 className="mt-1 text-xs font-bold text-gray-900">{notification.title}</h3>
                                                <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{notification.description}</p>
                                                <div className="mt-3 flex items-center justify-between gap-2">
                                                    <span className="truncate text-[10px] text-gray-500">{notification.location}</span>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {notification.unread && (
                                                            <button
                                                                type="button"
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-[10px] font-medium text-gray-500 hover:text-[#087653]"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <Link
                                                            to={notification.to}
                                                            onClick={() => {
                                                                markAsRead(notification.id);
                                                                setNotificationsOpen(false);
                                                            }}
                                                            className="rounded-md bg-[#073f35] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#0b5b4b]"
                                                        >
                                                            {notification.action}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                            <button
                                type="button"
                                onClick={() => setNotifications([])}
                                disabled={notifications.length === 0}
                                className="text-xs font-medium text-gray-600 hover:text-red-600 disabled:cursor-default disabled:text-gray-400"
                            >
                                Clear all
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#087653]"
                            >
                                <Settings size={13} />
                                Notification settings
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;

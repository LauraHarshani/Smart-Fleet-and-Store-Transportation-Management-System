import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Truck, LayoutDashboard, CalendarCheck, Route as RouteIcon, 
    CalendarDays, MapPin, Store, Package, UserCog,
    LineChart, User, LogOut, Bell, X, Settings, Check, ShieldAlert,
    TruckIcon, ClipboardCheck, Radio, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const readStoredNotificationIds = (storageKey) => {
    const storedIds = localStorage.getItem(storageKey);
    if (!storedIds) return new Set();

    const parsedIds = JSON.parse(storedIds);
    if (!Array.isArray(parsedIds) || parsedIds.some((id) => typeof id !== 'string')) {
        throw new Error('Saved notification read state is invalid.');
    }

    return new Set(parsedIds);
};

const formatNotificationTime = (value) => {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return 'Recently';

    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes} min${elapsedMinutes === 1 ? '' : 's'} ago`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 7) return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;

    return new Date(timestamp).toLocaleDateString();
};

const toAdminNotifications = (bookings, trips, auditLogs) => {
    const bookingNotifications = bookings.flatMap((booking) => {
        const code = booking.bookingCode || booking._id;
        const history = booking.changeHistory?.length
            ? booking.changeHistory
            : [{
                action: booking.status?.toUpperCase().replace(/\s+/g, '_'),
                toStatus: booking.status,
                changedAt: booking.updatedAt || booking.createdAt,
            }];
        const getAction = (change) =>
            change.action ||
            change.toStatus?.toUpperCase().replace(/\s+/g, '_') ||
            booking.status?.toUpperCase().replace(/\s+/g, '_');
        const hasBeenSubmitted = history.some((change) => getAction(change) === 'SUBMITTED');

        return history
            .map((change, index) => ({ change, index }))
            .filter(({ change }) => !hasBeenSubmitted || getAction(change) !== 'CREATED')
            .map(({ change, index }) => {
                const action = getAction(change);
                const timestamp = change.changedAt || booking.updatedAt || booking.createdAt;
                const titles = {
                    CREATED: 'Booking created',
                    UPDATED: 'Booking updated',
                    SUBMITTED: 'Booking submitted',
                    APPROVED: 'Booking approved',
                    REJECTED: 'Booking rejected',
                    CHANGES_REQUESTED: 'Booking changes requested',
                    IN_PROGRESS: 'Booking in progress',
                    COMPLETED: 'Booking completed',
                    CANCELLED: 'Booking cancelled',
                };
                const isAlert = ['REJECTED', 'CHANGES_REQUESTED', 'CANCELLED'].includes(action);
                const pickup = booking.pickupStore?.name;
                const destination = booking.destinationStore?.name;

                return {
                    id: `booking-${booking._id}-${change._id || `${action}-${index}`}`,
                    category: 'Alerts',
                    type: `BOOKING ${action.replace(/_/g, ' ')}`,
                    title: titles[action] || 'Booking update',
                    description: change.reason || `Booking ${code} status: ${change.toStatus || booking.status}.`,
                    location: [pickup, destination].filter(Boolean).join(' → ') || `Booking ${code}`,
                    timestamp: new Date(timestamp).getTime() || 0,
                    time: formatNotificationTime(timestamp),
                    action: 'View Booking',
                    to: '/bookings',
                    icon: isAlert ? ShieldAlert : ClipboardCheck,
                    tone: isAlert ? 'red' : 'green',
                    unread: true,
                };
            });
    });

    const tripNotifications = trips.map((trip) => {
        const status = trip.status || 'Updated';
        const isAlert = ['Delayed', 'Cancelled'].includes(status);
        const timestamp = trip.updatedAt || trip.createdAt || trip.date;
        const tripCode = trip.id || trip._id;

        return {
            id: `trip-${trip._id}-${timestamp || status}`,
            category: isAlert ? 'Alerts' : 'Trips',
            type: `TRIP ${status.toUpperCase()}`,
            title: `Trip ${status.toLowerCase()}: ${tripCode}`,
            description: [trip.route, trip.vehicle && `Vehicle ${trip.vehicle}`].filter(Boolean).join(' · ') || `Trip status: ${status}.`,
            location: trip.route || `Trip ${tripCode}`,
            timestamp: new Date(timestamp).getTime() || 0,
            time: formatNotificationTime(timestamp),
            action: 'View Trip',
            to: '/trip-planning',
            icon: isAlert ? ShieldAlert : TruckIcon,
            tone: isAlert ? 'red' : 'green',
            unread: true,
        };
    });

    const auditNotifications = auditLogs.map((log) => {
        const action = (log.action || 'UPDATE').toUpperCase();
        const actionVerb = { CREATE: 'created', UPDATE: 'updated', DELETE: 'deleted' }[action] || action.toLowerCase();
        const entity = log.entityType || 'record';
        const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
        const timestamp = log.timestamp;
        const actorName = log.performedBy?.name;

        return {
            id: `audit-${log._id}`,
            category: 'System',
            type: `ADMIN ${action}`,
            title: `${entityName} ${actionVerb}`,
            description: `${actorName || 'An administrator'} ${actionVerb} ${entity} ${log.entityId}.`,
            location: `${entityName} · ${log.entityId}`,
            timestamp: new Date(timestamp).getTime() || 0,
            time: formatNotificationTime(timestamp),
            action: 'View Reports',
            to: '/reports',
            icon: Radio,
            tone: 'blue',
            unread: true,
        };
    });

    return [...bookingNotifications, ...tripNotifications, ...auditNotifications]
        .sort((left, right) => right.timestamp - left.timestamp)
        .slice(0, 30);
};

const notificationTabs = ['All', 'Alerts', 'Trips', 'System'];

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/bookings': 'Bookings',
    '/approval-log': 'Bookings',
    '/trip-planning': 'Trip Planning',
    '/schedules': 'Vehicle Schedule',
    '/live-tracking': 'Live Tracking',
    '/vehicles': 'Vehicles',
    // '/drivers': 'Drivers',
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
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const pageTitle = pageTitles[location.pathname] ?? '';
    const notificationOwnerId = user?.userId || user?.id || user?._id || 'admin';
    const readNotificationStorageKey = `admin-notification-read:${notificationOwnerId}`;
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState('');
    const [activeNotificationTab, setActiveNotificationTab] = useState('All');
    const dismissedNotificationIds = useRef(new Set());

    useEffect(() => {
        let active = true;
        let loading = false;

        const loadNotifications = async (initialLoad = false) => {
            if (loading) return;
            loading = true;
            if (initialLoad) setNotificationsLoading(true);

            try {
                const [bookingsResponse, tripsResponse, auditResponse] = await Promise.all([
                    api.get('/store-bookings'),
                    api.get('/trips'),
                    api.get('/audit-logs', { params: { page: 1, limit: 20 } }),
                ]);
                const bookings = bookingsResponse.data?.bookings;
                const trips = tripsResponse.data?.trips;
                const auditLogs = auditResponse.data?.data;

                if (!Array.isArray(bookings) || !Array.isArray(trips) || !Array.isArray(auditLogs)) {
                    throw new Error('Unexpected notification data received from the server.');
                }

                const readNotificationIds = readStoredNotificationIds(readNotificationStorageKey);
                const nextNotifications = toAdminNotifications(bookings, trips, auditLogs)
                    .filter((notification) => !dismissedNotificationIds.current.has(notification.id))
                    .map((notification) => ({
                        ...notification,
                        unread: !readNotificationIds.has(notification.id),
                    }));

                if (active) {
                    setNotifications(nextNotifications);
                    setNotificationsError('');
                }
            } catch (error) {
                if (active) {
                    setNotificationsError(
                        error.response?.data?.message ||
                        error.message ||
                        'Unable to load admin notifications.'
                    );
                }
            } finally {
                loading = false;
                if (active) setNotificationsLoading(false);
            }
        };

        void loadNotifications(true);
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') void loadNotifications();
        }, 30_000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') void loadNotifications();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [readNotificationStorageKey]);

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
        try {
            const readNotificationIds = readStoredNotificationIds(readNotificationStorageKey);
            notifications.forEach((notification) => readNotificationIds.add(notification.id));
            localStorage.setItem(
                readNotificationStorageKey,
                JSON.stringify([...readNotificationIds])
            );
            setNotificationsError('');
        } catch (error) {
            console.error('Unable to save notification read state:', error);
            setNotificationsError(error.message || 'Unable to save notification read state.');
        }
    };

    const markAsRead = (id) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id ? { ...notification, unread: false } : notification
            )
        );
        try {
            const readNotificationIds = readStoredNotificationIds(readNotificationStorageKey);
            readNotificationIds.add(id);
            localStorage.setItem(
                readNotificationStorageKey,
                JSON.stringify([...readNotificationIds])
            );
            setNotificationsError('');
        } catch (error) {
            console.error('Unable to save notification read state:', error);
            setNotificationsError(error.message || 'Unable to save notification read state.');
        }
    };

    const clearAllNotifications = () => {
        notifications.forEach((notification) =>
            dismissedNotificationIds.current.add(notification.id)
        );
        setNotifications([]);
    };

    const handleSignOut = async () => {
        try { await logout(); } finally { navigate('/login', { replace: true }); }
    };

    // Helper function to check if the current path matches the link (for active state)
    const isActive = (path) =>
        location.pathname === path ||
        (path === '/bookings' && location.pathname === '/approval-log');

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

                {/* Navigation links - the scrollbar-hide class hides the scroll bar here */}
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
                    {/* <NavItem to="/drivers" icon={Users} label="Drivers" active={isActive('/drivers')} /> */}
                    <NavItem to="/stores" icon={Store} label="Stores" active={isActive('/stores')} />
                    <NavItem to="/items" icon={Package} label="Items" active={isActive('/items')} />
                    <NavItem to="/users" icon={UserCog} label="Users" active={isActive('/users')} />

                    <NavCategory title="Analytics" />
                    <NavItem to="/reports" icon={LineChart} label="Reports" active={isActive('/reports')} />
                </nav>

                {/* Bottom sidebar area */}
                <div className="py-4 border-t border-white/10 mt-auto">
                    <NavItem to="/profile" icon={User} label="Profile" active={isActive('/profile')} />
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 mx-3 w-[calc(100%-24px)] text-left rounded-lg font-medium text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
                    
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => setNotificationsOpen(true)}
                            aria-label={`Open notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                            aria-expanded={notificationsOpen}
                            aria-haspopup="dialog"
                            className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#113b2e] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            aria-label="Open admin profile"
                            className="flex items-center gap-3 border-l pl-6 border-gray-200 text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#113b2e] flex items-center justify-center text-white font-semibold text-sm">
                                {(user?.name || 'Admin').trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 leading-tight">{user?.name || 'Admin'}</span>
                                <span className="text-xs text-gray-500">{user?.role || 'Administrator'}</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Page content (Outlet) */}
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
                            {notificationsLoading ? (
                                <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
                                    <Loader2 size={18} className="animate-spin" />
                                    Loading live notifications…
                                </div>
                            ) : notificationsError && notifications.length === 0 ? (
                                <div role="alert" className="flex h-full flex-col items-center justify-center px-6 text-center">
                                    <p className="text-sm font-semibold text-red-700">Notifications could not be loaded</p>
                                    <p className="mt-1 text-xs text-gray-500">{notificationsError}</p>
                                </div>
                            ) : visibleNotifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                                        <Check size={22} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-gray-700">You're all caught up</p>
                                    <p className="mt-1 text-xs text-gray-500">No notifications in this category.</p>
                                </div>
                            ) : (
                                <>
                                    {notificationsError && (
                                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                            {notificationsError}
                                        </p>
                                    )}
                                    {visibleNotifications.map((notification) => {
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
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                            <button
                                type="button"
                                onClick={clearAllNotifications}
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

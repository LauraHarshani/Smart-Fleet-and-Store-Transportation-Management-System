
import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CalendarCheck,
  CalendarClock,
  Route,
  Package,
  UserRound,
  LogOut,
  Bell,
  Truck,
  Store,
} from "lucide-react";

// Page titles
const pageTitles = {
  "/store/bookings": "Bookings",
  "/store/schedule": "Schedule",
  "/store/trip-progress": "Trip Progress",
  "/store/goods-handling": "Goods Handling",
  "/store/profile": "Profile",
};

// Sidebar navigation item
const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`mx-3 flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
      active
        ? "bg-[#0F9874] text-white"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`}
  >
    <Icon size={21} />
    <span className="text-base">{label}</span>
  </Link>
);

const StoreLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get logged-in user information
  const userName = localStorage.getItem("userName") || "Store User";
  const userRole = localStorage.getItem("role") || "Store User";
  const storeName = localStorage.getItem("storeName") || "Colombo Store";

  // Generate user initials
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Current page title
  // const pageTitle = pageTitles[location.pathname] || "Store";
  const pageTitle = location.pathname.startsWith(
    "/store/goods-confirmation/"
  )
    ? "Goods Confirmation"
    : pageTitles[location.pathname] || "Store";

  // Notification sample data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Booking update",
      message: "Your booking BK-256 is awaiting preparation.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Trip started",
      message: "Vehicle VH-020 has started its assigned trip.",
      time: "1 hour ago",
      read: false,
    },
  ]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationPanelRef = useRef(null);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!notificationPanelRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsNotificationsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationsOpen]);

  // Check active navigation item
  const isActive = (path) => {
  if (path === "/store/goods-handling") {
    return (
      location.pathname === path ||
      location.pathname.startsWith("/store/goods-confirmation/")
    );
  }

  return location.pathname === path;
};

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("storeName");

    navigate("/login", { replace: true });
  };

  // Mark one notification as read
  const markAsRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7F6]">

      {/* Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden bg-[#113B2E] text-white">

        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-wide">
            LogiFleet
            <Truck size={25} />
          </div>

          <p className="mt-1 text-xs text-gray-400">
            Fleet & Store Management
          </p>
        </div>

        {/* Store Information */}
        <div className="border-b border-white/10 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-[#0B3328] px-4 py-5">
            <Store size={22} />

            <span className="text-lg font-medium">
              {storeName}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto py-6">

          <NavItem
            to="/store/bookings"
            icon={CalendarCheck}
            label="Bookings"
            active={isActive("/store/bookings")}
          />

          <NavItem
            to="/store/schedule"
            icon={CalendarClock}
            label="Schedule"
            active={isActive("/store/schedule")}
          />

          <NavItem
            to="/store/trip-progress"
            icon={Route}
            label="Trip Progress"
            active={isActive("/store/trip-progress")}
          />

          <NavItem
            to="/store/goods-handling"
            icon={Package}
            label="Goods Handling"
            active={isActive("/store/goods-handling")}
          />

        </nav>

        {/* Bottom Navigation */}
        <div className="mt-auto space-y-2 border-t border-white/10 py-5">

          <NavItem
            to="/store/profile"
            icon={UserRound}
            label="Profile"
            active={isActive("/store/profile")}
          />

          <button
            type="button"
            onClick={handleSignOut}
            className="mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-300 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut size={21} />

            <span className="text-base">
              Sign Out
            </span>
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top Header */}
        <header className="z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">

          {/* Page Title */}
          <h1 className="text-xl font-bold text-gray-900">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-6">

            {/* Notifications */}
            <div className="relative" ref={notificationPanelRef}>

              <button
                type="button"
                onClick={() =>
                  setIsNotificationsOpen((open) => !open)
                }
                className="relative rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={isNotificationsOpen}
                aria-haspopup="dialog"
              >
                <Bell size={23} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-3 w-[340px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                  role="dialog"
                  aria-label="Notifications"
                >

                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">

                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        Notifications
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {unreadCount
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-[#0F9874] hover:text-[#113B2E] disabled:text-gray-400"
                    >
                      Mark all as read
                    </button>

                  </div>

                  {/* Notification List */}
                  <div className="max-h-[350px] overflow-y-auto">

                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                            notification.read
                              ? "bg-white"
                              : "bg-emerald-50/40"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <span className="text-sm font-semibold text-gray-800">
                              {notification.title}
                            </span>

                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0F9874]" />
                            )}

                          </div>

                          <p className="mt-1 text-xs leading-relaxed text-gray-600">
                            {notification.message}
                          </p>

                          <p className="mt-1.5 text-[11px] text-gray-400">
                            {notification.time}
                          </p>

                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications available.
                      </p>
                    )}

                  </div>
                </div>
              )}

            </div>

            {/* Store User Profile */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">

              {/* User Initials */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#113B2E] text-sm font-semibold text-white">
                {userInitials || "SU"}
              </div>

              {/* User Details */}
              <div className="flex flex-col">

                <span className="text-sm font-bold leading-tight text-gray-800">
                  {userName}
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  {userRole}
                </span>

              </div>

            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default StoreLayout;

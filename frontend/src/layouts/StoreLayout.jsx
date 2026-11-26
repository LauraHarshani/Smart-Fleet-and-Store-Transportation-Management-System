
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
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

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

const notificationActionCopy = {
  CREATED: { title: "Booking created", message: (code) => `Booking ${code} was created.` },
  UPDATED: { title: "Booking updated", message: (code) => `Booking ${code} was updated.` },
  SUBMITTED: { title: "Booking submitted", message: (code) => `Booking ${code} was submitted for review.` },
  APPROVED: { title: "Booking approved", message: (code) => `Booking ${code} was approved.` },
  REJECTED: { title: "Booking rejected", message: (code) => `Booking ${code} was rejected.` },
  CHANGES_REQUESTED: { title: "Changes requested", message: (code) => `Changes were requested for booking ${code}.` },
  IN_PROGRESS: { title: "Booking in progress", message: (code) => `Booking ${code} is now in progress.` },
  COMPLETED: { title: "Booking completed", message: (code) => `Booking ${code} was completed.` },
  CANCELLED: { title: "Booking cancelled", message: (code) => `Booking ${code} was cancelled.` },
  HANDOVER_RECEIPT_RECORDED: { title: "Goods updated", message: (code) => `Goods handover or receipt was updated for booking ${code}.` },
  STOP_UPDATED: { title: "Trip progress updated", message: (code) => `A stop was updated for booking ${code}.` },
};

const formatNotificationTime = (value) => {
  if (!value) return "Time unavailable";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Time unavailable";

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  return new Date(timestamp).toLocaleDateString();
};

const toStoreNotifications = (bookings) => bookings
  .flatMap((booking) => {
    const bookingCode = booking.bookingCode || booking._id;
    const history = booking.changeHistory?.length
      ? booking.changeHistory
      : [{
        action: booking.status?.toUpperCase().replace(/\s+/g, "_"),
        toStatus: booking.status,
        changedAt: booking.updatedAt || booking.createdAt,
      }];

    return history.map((change, index) => {
      const copy = notificationActionCopy[change.action] || notificationActionCopy[change.toStatus?.toUpperCase().replace(/\s+/g, "_")];
      const timestamp = change.changedAt || booking.updatedAt || booking.createdAt;

      return {
        id: `${booking._id}-${change._id || `${change.action || change.toStatus || "update"}-${index}`}`,
        title: copy?.title || "Booking update",
        message: change.reason || copy?.message(bookingCode) || `Booking ${bookingCode} was updated.`,
        time: formatNotificationTime(timestamp),
        timestamp: timestamp ? new Date(timestamp).getTime() : 0,
        read: false,
      };
    });
  })
  .sort((left, right) => right.timestamp - left.timestamp)
  .slice(0, 20);

const StoreLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get logged-in user information
  const userName = user?.name || "Store User";
  const userRole = user?.role || "Store User";
  const storeName = user?.store || "Store";

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

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationPanelRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");
      try {
        const { data } = await api.get("/store-bookings");
        if (!Array.isArray(data?.bookings)) {
          throw new Error("Unexpected bookings response.");
        }
        if (active) setNotifications(toStoreNotifications(data.bookings));
      } catch (error) {
        if (active) {
          setNotifications([]);
          setNotificationsError(error.response?.data?.message || "Unable to load store notifications.");
        }
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };

    void loadNotifications();
    return () => { active = false; };
  }, [user?.storeId, user?.id, user?._id]);

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
  const handleSignOut = async () => {
    try { await logout(); } finally {
      navigate("/login", { replace: true });
    }
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
                  <div className="max-h-[350px] overflow-y-auto px-4 pb-4">

                    {notificationsLoading ? (
                      <p className="px-0 py-8 text-center text-sm text-gray-500">
                        Loading notifications…
                      </p>
                    ) : notificationsError ? (
                      <p role="alert" className="px-0 py-8 text-center text-sm text-red-600">
                        {notificationsError}
                      </p>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full border-b border-gray-100 px-0 py-3 text-left transition hover:bg-gray-50 ${
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
                      <p className="px-0 py-8 text-center text-sm text-gray-500">
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

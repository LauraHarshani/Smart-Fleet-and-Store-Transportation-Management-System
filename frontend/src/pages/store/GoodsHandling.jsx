import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Check,
  Search,
  CalendarDays,
  ChevronDown,
  Eye,
  Package,
} from "lucide-react";

const sendingStatuses = [
  "Awaiting Preparation",
  "Prepared",
  "In Transit",
  "Awaiting Handover",
  "Handed Over",
];

const receivingStatuses = [
  "Awaiting Dispatch",
  "Awaiting Receipt",
  "Received",
  "Completed",
];

const statusStyles = {
  "Awaiting Preparation": "bg-[#FFF4D6] text-[#925C00]",
  Prepared: "bg-[#DCFCE7] text-[#15803D]",
  "Awaiting Handover": "bg-[#FFE8D5] text-[#A4490B]",
  "In Transit": "bg-[#CFFAFE] text-[#0E7490]",
  "Handed Over": "bg-[#DBEAFE] text-[#1D4ED8]",
  "Awaiting Dispatch": "bg-[#FFF4D6] text-[#925C00]",
  "Awaiting Receipt": "bg-[#FCE7F3] text-[#BE185D]",
  Received: "bg-[#DCFCE7] text-[#15803D]",
  Completed: "bg-[#DCFCE7] text-[#15803D]",
};

const tabs = [
  { id: "all", label: "All", icon: Layers },
  { id: "sending", label: "Sending", icon: ArrowUp },
  { id: "receiving", label: "Receiving", icon: ArrowDown },
  { id: "completed", label: "Completed", icon: Check },
];

const GoodsHandling = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedRoute, setSelectedRoute] = useState("All Routes");
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination: display 8 bookings per page.
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 8;

  useEffect(() => {
    let active = true;
    api.get("/store-bookings")
      .then(({ data }) => {
        if (!active) return;
        const storeId = String(user?.storeId || user?.store?._id || user?.store || "");
        const records = (data.bookings || []).map((record) => {
          const origin = record.pickupStore?.name || "Pickup store";
          const destination = record.destinationStore?.name || "Destination store";
          const direction = String(record.pickupStore?._id || record.pickupStore) === storeId ? "sending" : "receiving";
          const dropStop = record.stops?.find((stop) => stop.stopType === "DROP");
          const hasHandover = record.items?.some((line) => line.handedOverQuantity !== null && line.handedOverQuantity !== undefined);
          const hasReceived = record.items?.length > 0 && record.items.every((line) => line.receivedQuantity !== null && line.receivedQuantity !== undefined);
          const workflowStatus = record.status === "Completed"
            ? (direction === "sending" ? "Handed Over" : "Completed")
            : record.status === "In Progress"
              ? (direction === "sending"
                ? (dropStop?.status === "Completed" ? "Handed Over" : dropStop?.status === "Arrived" ? "Awaiting Handover" : hasHandover ? "In Transit" : "Prepared")
                : (hasReceived ? "Received" : "Awaiting Receipt"))
              : record.status === "Approved"
                ? (direction === "sending" ? "Awaiting Preparation" : "Awaiting Dispatch")
                : record.status === "Rejected" || record.status === "Cancelled" ? record.status
                  : direction === "sending" ? "Awaiting Preparation" : "Awaiting Receipt";
          const date = record.requestedPickupDate ? new Date(record.requestedPickupDate) : null;
          return {
            ...record,
            id: record._id,
            backendStatus: record.status,
            displayId: record.bookingCode || record._id,
            origin, destination,
            route: `${origin.replace(/ Store$/i, "")} → ${destination.replace(/ Store$/i, "")}`,
            direction,
            status: workflowStatus,
            itemCount: record.items?.length || 0,
            scheduledPickup: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
            pickupTime: record.requestedTimeWindow?.startTime || "",
            itemDetails: (record.items || []).map((line) => ({
              id: line._id, lineId: line._id, item: line.item?._id || line.item,
              name: line.item?.name || "Item", requested: line.quantity,
              prepared: line.handedOverQuantity, received: line.receivedQuantity,
              handedOver: line.handedOverQuantity,
            })),
          };
        });
        setBookings(records);
        setLoadError("");
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || "Unable to load goods handling bookings.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.storeId, user?.store]);

  const sendingCount = bookings.filter(
      (booking) =>
      booking.direction === "sending" && booking.backendStatus !== "Completed"
  ).length;

  const receivingCount = bookings.filter(
    (booking) =>
      booking.direction === "receiving" && booking.backendStatus !== "Completed"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.backendStatus === "Completed"
  ).length;

  const routes = useMemo(
    () => [...new Set(bookings.map((booking) => booking.route))],
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "sending" &&
          booking.direction === "sending" &&
          booking.backendStatus !== "Completed") ||
        (activeTab === "receiving" &&
          booking.direction === "receiving" &&
          booking.backendStatus !== "Completed") ||
        (activeTab === "completed" && booking.backendStatus === "Completed");

      const matchesSearch = booking.displayId
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        booking.status === selectedStatus;

      const matchesRoute =
        selectedRoute === "All Routes" ||
        booking.route === selectedRoute;

      const matchesDate =
        !selectedDate ||
        booking.scheduledPickup ===
          new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

      return (
        matchesTab &&
        matchesSearch &&
        matchesStatus &&
        matchesRoute &&
        matchesDate
      );
    });
  }, [
    bookings,
    activeTab,
    searchTerm,
    selectedStatus,
    selectedRoute,
    selectedDate,
  ]);

  // Pagination calculations are based on the filtered results.
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handleViewBooking = (booking) => {
    navigate(`/store/goods-confirmation/${booking.id}`, {
      state: { booking },
    });
  };

  const availableStatuses =
    activeTab === "sending"
      ? sendingStatuses
      : activeTab === "receiving"
        ? receivingStatuses
        : [...new Set([...sendingStatuses, ...receivingStatuses])];

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[26px] font-bold tracking-tight text-gray-950">
          Goods Dispatch & Receipt
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Manage goods preparation, handover and receipt confirmations.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          let count = 0;
          if (tab.id === "all") count = bookings.length;
          if (tab.id === "sending") count = sendingCount;
          if (tab.id === "receiving") count = receivingCount;
          if (tab.id === "completed") count = completedCount;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedStatus("All Statuses");
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "border-[#078A68] bg-[#078A68] text-white"
                  : "border-[#078A68] bg-transparent text-[#078A68] hover:bg-emerald-50"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{tab.label}</span>
              <span>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="min-h-[560px] rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        {loadError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}
        {loading && <p className="mb-4 text-sm text-slate-500">Loading bookings…</p>}
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-[283px]">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by booking ID..."
              className="h-10 w-full rounded-lg border border-[#078A68] bg-white pl-11 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-[#078A68]/15"
            />
          </div>

          <div className="relative w-full sm:w-[190px]">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="h-10 w-full appearance-none rounded-lg border border-[#078A68] bg-white px-3 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#078A68]/15"
            >
              <option value="All Statuses">All Statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
          </div>

          <div className="relative w-full sm:w-[165px]">
            <select
              value={selectedRoute}
              onChange={(e) => { setSelectedRoute(e.target.value); setCurrentPage(1); }}
              className="h-10 w-full appearance-none rounded-lg border border-[#078A68] bg-white px-3 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#078A68]/15"
            >
              <option value="All Routes">All Routes</option>
              {routes.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
          </div>

          <div className="relative w-full sm:w-[165px]">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              className="h-10 w-full rounded-lg border border-[#078A68] bg-white pl-10 pr-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#078A68]/15"
              aria-label="Filter by scheduled pickup date"
            />
          </div>

          {(searchTerm ||
            selectedStatus !== "All Statuses" ||
            selectedRoute !== "All Routes" ||
            selectedDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All Statuses");
                setSelectedRoute("All Routes");
                setSelectedDate("");
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Bookings Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F0F4F1] text-sm font-medium text-slate-600">
                <th className="px-4 py-4 font-medium">Booking ID</th>
                <th className="px-4 py-4 font-medium">Route</th>
                <th className="px-4 py-4 font-medium">Items</th>
                <th className="px-4 py-4 font-medium">Scheduled Pickup</th>
                <th className="px-4 py-4 font-medium">Current Status</th>
                <th className="w-14 px-4 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-200 text-sm transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                        {booking.displayId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-800">
                      {booking.route}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-800">
                      {booking.itemCount} Items
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-800">
                      {booking.scheduledPickup} &nbsp;{booking.pickupTime}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex min-w-[170px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                          statusStyles[booking.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewBooking(booking)}
                        title="View goods confirmation"
                        aria-label={`View ${booking.displayId} goods confirmation`}
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-emerald-50 hover:text-[#078A68]"
                      >
                        <Eye size={21} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Package size={32} className="mb-3 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-700">
                        No bookings found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try changing your search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <span className="text-xs text-gray-500">
            Showing {filteredBookings.length === 0 ? 0 : startIndex + 1}
            {" - "}
            {Math.min(endIndex, filteredBookings.length)}
            {" of "}
            {filteredBookings.length} bookings
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-[#078A68] text-white"
                      : "border border-slate-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsHandling;

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const CURRENT_STORE = "Colombo Store";

const initialBookings = [
  {
    id: "BK-256",
    origin: "Colombo Store",
    destination: "Kandy Store",
    route: "Colombo → Kandy",
    itemCount: 3,
    scheduledPickup: "06 Nov 2026",
    pickupTime: "10:00 AM",
    direction: "sending",
    status: "Awaiting Preparation",
    vehicle: "VH-020",
    driver: "Minindu Rajapaksha",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 8, requested: 10 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 20 },
      { id: 3, name: "Sugar", inventory: 60, requested: 15 },
    ],
  },
  {
    id: "BK-258",
    origin: "Colombo Store",
    destination: "Kandy Store",
    route: "Colombo → Kandy",
    itemCount: 3,
    scheduledPickup: "06 Nov 2026",
    pickupTime: "03:00 PM",
    direction: "sending",
    status: "Awaiting Handover",
    vehicle: "VH-021",
    driver: "Kasun Perera",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 10 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 15 },
      { id: 3, name: "Sugar", inventory: 60, requested: 12 },
    ],
  },
  {
    id: "BK-259",
    origin: "Galle Store",
    destination: "Colombo Store",
    route: "Galle → Colombo",
    itemCount: 3,
    scheduledPickup: "08 Nov 2026",
    pickupTime: "11:00 AM",
    direction: "receiving",
    status: "In Transit",
    vehicle: "VH-022",
    driver: "Nimal Fernando",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 12 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 25 },
      { id: 3, name: "Sugar", inventory: 60, requested: 18 },
    ],
  },
  {
    id: "BK-265",
    origin: "Colombo Store",
    destination: "Galle Store",
    route: "Colombo → Galle",
    itemCount: 3,
    scheduledPickup: "09 Nov 2026",
    pickupTime: "02:00 PM",
    direction: "sending",
    status: "Awaiting Handover",
    vehicle: "VH-023",
    driver: "Amila Silva",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 20 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 30 },
      { id: 3, name: "Sugar", inventory: 60, requested: 25 },
    ],
  },
  {
    id: "BK-285",
    origin: "Kandy Store",
    destination: "Colombo Store",
    route: "Kandy → Colombo",
    itemCount: 3,
    scheduledPickup: "10 Nov 2026",
    pickupTime: "08:00 AM",
    direction: "receiving",
    status: "Completed",
    vehicle: "VH-024",
    driver: "Ruwan Jayasinghe",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 10 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 20 },
      { id: 3, name: "Sugar", inventory: 60, requested: 15 },
    ],
  },
  {
    id: "BK-286",
    origin: "Galle Store",
    destination: "Colombo Store",
    route: "Galle → Colombo",
    itemCount: 3,
    scheduledPickup: "10 Nov 2026",
    pickupTime: "08:00 AM",
    direction: "receiving",
    status: "Awaiting Confirmation",
    vehicle: "VH-025",
    driver: "Dilan Perera",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 10 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 20 },
      { id: 3, name: "Sugar", inventory: 60, requested: 15 },
    ],
  },
  {
    id: "BK-287",
    origin: "Colombo Store",
    destination: "Kandy Store",
    route: "Colombo → Kandy",
    itemCount: 3,
    scheduledPickup: "10 Nov 2026",
    pickupTime: "08:00 AM",
    direction: "sending",
    status: "Awaiting Receipt",
    vehicle: "VH-026",
    driver: "Sahan Perera",
    itemDetails: [
      { id: 1, name: "Ceylon Tea", inventory: 80, requested: 10 },
      { id: 2, name: "Rice Bags", inventory: 50, requested: 20 },
      { id: 3, name: "Sugar", inventory: 60, requested: 15 },
    ],
  },
  {
    id: "BK-288",
    origin: "Kandy Store",
    destination: "Colombo Store",
    route: "Kandy → Colombo",
    itemCount: 3,
    scheduledPickup: "15 Nov 2026",
    pickupTime: "09:00 AM",
    direction: "receiving",
    status: "Awaiting Dispatch",
    vehicle: "VH-027",
    driver: "Kasun Perera",
    itemDetails: [
      { id: 1, name: "Rice 5kg", inventory: 20, requested: 20 },
      { id: 2, name: "Cooking Oil 1L", inventory: 15, requested: 15 },
      { id: 3, name: "Sugar 1kg", inventory: 25, requested: 25 },
    ],
  }
];

// Derive the direction from the route if it is not already present.
const getDirection = (booking) => {
  if (booking.origin === CURRENT_STORE) return "sending";
  if (booking.destination === CURRENT_STORE) return "receiving";
  return booking.direction || "sending";
};

// Convert older demo statuses to the new workflow.
const migrateBooking = (booking) => {
  const direction = getDirection(booking);
  let status = booking.status;

  if (direction === "sending") {
    const statusMap = {
      Prepared: "Awaiting Handover",
      "Handed Over": "Awaiting Receipt",
      "In Transit": "Awaiting Receipt",
    };

    status = statusMap[status] || status;
  } else {
    const statusMap = {
      "Awaiting Preparation": "Awaiting Dispatch",
      Prepared: "Awaiting Dispatch",
      "Awaiting Handover": "Awaiting Dispatch",
      "Handed Over": "In Transit",
      "Awaiting Receipt": "Awaiting Confirmation",
    };

    status = statusMap[status] || status;
  }

  return {
    ...booking,
    direction,
    route:
      direction === "sending"
        ? `${booking.origin.replace(" Store", "")} → ${booking.destination.replace(" Store", "")}`
        : `${booking.origin.replace(" Store", "")} → ${booking.destination.replace(" Store", "")}`,
    status,
  };
};

const getInitialBookings = () => {
  try {
    const saved = localStorage.getItem("goodsBookings");
    const source = saved ? JSON.parse(saved) : initialBookings;
    const migrated = source.map(migrateBooking);

    localStorage.setItem("goodsBookings", JSON.stringify(migrated));
    return migrated;
  } catch (error) {
    console.error("Unable to load goods bookings:", error);
    return initialBookings.map(migrateBooking);
  }
};

const sendingStatuses = [
  "Awaiting Preparation",
  "Awaiting Handover",
  "Awaiting Receipt",
  "Completed",
];

const receivingStatuses = [
  "Awaiting Dispatch",
  "In Transit",
  "Awaiting Confirmation",
  "Completed",
];

const statusStyles = {
  "Awaiting Preparation": "bg-[#FFF4D6] text-[#925C00]",
  "Awaiting Handover": "bg-[#FFE8D5] text-[#A4490B]",
  "Awaiting Receipt": "bg-[#DBEAFE] text-[#1D4ED8]",
  "Awaiting Dispatch": "bg-[#F3E8FF] text-[#7E22CE]",
  "In Transit": "bg-[#CFFAFE] text-[#0E7490]",
  "Awaiting Confirmation": "bg-[#FCE7F3] text-[#BE185D]",
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

  const [bookings, setBookings] = useState(getInitialBookings);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedRoute, setSelectedRoute] = useState("All Routes");
  const [selectedDate, setSelectedDate] = useState("");

  const sendingCount = bookings.filter(
    (booking) =>
      booking.direction === "sending" && booking.status !== "Completed"
  ).length;

  const receivingCount = bookings.filter(
    (booking) =>
      booking.direction === "receiving" && booking.status !== "Completed"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "Completed"
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
          booking.status !== "Completed") ||
        (activeTab === "receiving" &&
          booking.direction === "receiving" &&
          booking.status !== "Completed") ||
        (activeTab === "completed" && booking.status === "Completed");

      const matchesSearch = booking.id
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
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "border-[#078A68] bg-[#078A68] text-white"
                  : "border-[#078A68] bg-transparent text-[#078A68] hover:bg-emerald-50"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{tab.label}</span>
              {tab.id !== "all" && <span>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="min-h-[560px] rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by booking ID..."
              className="h-10 w-full rounded-lg border border-[#078A68] bg-white pl-11 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-[#078A68]/15"
            />
          </div>

          <div className="relative w-full sm:w-[190px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              onChange={(e) => setSelectedRoute(e.target.value)}
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
              onChange={(e) => setSelectedDate(e.target.value)}
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
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-200 text-sm transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                      {booking.id}
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
                        aria-label={`View ${booking.id} goods confirmation`}
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

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-gray-500">
          <span>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoodsHandling;

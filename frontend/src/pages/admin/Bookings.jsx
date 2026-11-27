import { generateBookingPDF } from "../../utils/generateBookingPDF";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Clock,
  CalendarDays,
  Package,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Printer,
  History,
  Warehouse,
  Store,
  ArrowRight,
  PlaneTakeoff,
  PlaneLanding,
  Weight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const mapBooking = (booking) => {
  const pickup = booking.pickupStore || {};
  const destination = booking.destinationStore || {};
  const pickupName = pickup.name || "Pickup store";
  const destinationName = destination.name || "Destination store";
  const totalWeightKg = (booking.items || []).reduce(
    (total, line) => total + Number(line.item?.weightKg || 0) * Number(line.quantity || 0),
    0,
  );
  const totalQuantity = (booking.items || []).reduce((total, line) => total + Number(line.quantity || 0), 0);
  const pickupDate = booking.requestedPickupDate ? new Date(booking.requestedPickupDate) : null;

  return {
    mongoId: booking._id,
    id: booking.bookingCode || booking._id,
    store: destinationName,
    pickupStore: pickupName,
    destinationStore: destinationName,
    pickupAddress: pickup.address || pickup.location?.address || "Address not provided",
    destinationAddress: destination.address || destination.location?.address || "Address not provided",
    date: pickupDate && !Number.isNaN(pickupDate.getTime()) ? pickupDate.toLocaleDateString() : "Date not set",
    scheduledTime: booking.requestedTimeWindow?.startTime || "Time not set",
    createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "",
    priority: "Normal",
    deliveryType: "Store transfer",
    distance: "—",
    transitTime: "—",
    vehicle: booking.assignedVehicle?.registrationNumber || "Not Assigned",
    backendStatus: booking.status,
    status: booking.status,
    weight: `${totalWeightKg.toLocaleString()} kg`,
    totalItems: totalQuantity,
    items: (booking.items || []).map((line) => {
      const quantity = Number(line.quantity) || 0;
      const lineWeight = Number(line.item?.weightKg || 0) * quantity;
      return {
        name: line.item?.name || "Item",
        quantity: `${quantity} ${line.unit || "units"}`,
        weight: `${lineWeight.toLocaleString()} kg`,
        description: line.item?.description || "",
      };
    }),
    reviewerNote: booking.reviewNote || "",
  };
};

const statusStyles = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-sky-50 text-sky-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  "Changes Requested": "bg-orange-50 text-orange-700",
};

const tabs = ["All", "Submitted", "Changes Requested"];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
        statusStyles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function BookingCard({ booking, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-[#27866A] bg-[#FAFCFA] shadow-[0_1px_4px_rgba(23,63,53,0.12)]"
          : "border-transparent bg-white hover:border-[#B5D6A7] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-[#205648]">
          {booking.id}
        </span>
        <StatusBadge status={booking.status} />
      </div>

      <h3 className="mt-2 text-[15px] font-semibold text-gray-800">
        {booking.store}
      </h3>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          {booking.date === "Today" ? (
            <Clock size={13} />
          ) : (
            <CalendarDays size={13} />
          )}
          {booking.date}, {booking.scheduledTime}
        </span>

        <span className="font-medium text-gray-600">
          {booking.weight}
        </span>
      </div>
    </button>
  );
}

function InfoCard({ icon: Icon, label, value, description }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-[#F1F4F2] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#27866A]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-800">
          {value}
        </p>
        <p className="mt-1 text-xs text-[#27866A]">
          {description}
        </p>
      </div>
    </div>
  );
}

function BookingDetails({ booking, onStatusChange, saving }) {
  const [reviewNote, setReviewNote] = useState(booking.reviewerNote || "");

  const handleAction = (status) => {
    onStatusChange(booking, status, reviewNote);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Booking Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {booking.id}
            </h2>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Created {booking.createdAt}
            </span>
            <span>•</span>
            <span>Priority: {booking.priority}</span>
            <span>•</span>
            <span>{booking.deliveryType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#F1F4F2] px-3 py-2 text-xs font-medium text-gray-600">
            {booking.vehicle}
          </span>

          <button
            type="button"
            onClick={() => generateBookingPDF(booking)}
            title="Print booking"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#27866A]"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Route and Stores */}
      <section className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-600">
            Route & Stores
          </h3>

          <span className="text-xs font-semibold text-[#27866A]">
            Estimated {booking.distance} • {booking.transitTime} transit
          </span>
        </div>

        <div className="grid grid-cols-1 items-center gap-3 rounded-xl bg-[#F1F4F2] p-3 sm:grid-cols-[1fr_36px_1fr]">
          <div className="rounded-lg bg-white p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#27866A]">
              <Warehouse size={14} />
              Pickup Store
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {booking.pickupStore}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {booking.pickupAddress}
            </p>
          </div>

          <div className="flex justify-center text-[#27866A]">
            <ArrowRight size={22} />
          </div>

          <div className="rounded-lg bg-white p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#27866A]">
              <Store size={14} />
              Destination Store
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {booking.destinationStore}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {booking.destinationAddress}
            </p>
          </div>
        </div>
      </section>

      {/* Requested and Expected Windows */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoCard
          icon={PlaneTakeoff}
          label="Requested Pickup Window"
          value={`${booking.date}, ${booking.scheduledTime}`}
          description="Store pickup request"
        />

        <InfoCard
          icon={PlaneLanding}
          label="Expected Delivery Window"
          value="To be confirmed"
          description="Confirm during trip planning"
        />
      </div>

      {/* Item Breakdown */}
      <section className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-600">
            Item Breakdown & Payload
          </h3>

          <span className="rounded-md bg-[#E8ECE9] px-2 py-1 text-[11px] font-medium text-gray-700">
            {booking.items.length} Commodity Lines
          </span>
        </div>

        <div className="overflow-hidden rounded-xl bg-[#F1F4F2]">
          {booking.items.map((item, index) => (
            <div
              key={`${booking.id}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white px-3 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#27866A]" />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-gray-800">
                  {item.quantity}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#27866A]">
                  {item.weight}
                </p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#E8ECE9] px-3 py-3">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Weight size={15} />
              Consolidated Cargo Total
            </span>

            <span className="text-xs font-bold text-[#205648]">
              {booking.totalItems} Total Items • {booking.weight} Gross Weight
            </span>
          </div>
        </div>
      </section>

      {/* Reviewer Note */}
      <section className="mt-5">
        <label
          htmlFor="reviewNote"
          className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-600"
        >
          Reviewer Handling Note (Optional)
        </label>

        <textarea
          id="reviewNote"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={2}
          placeholder="Add dispatch or handling note for this booking..."
          className="w-full resize-none rounded-lg border border-transparent bg-[#F1F4F2] px-3 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#27866A] focus:bg-white focus:ring-2 focus:ring-[#27866A]/10"
        />
      </section>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-3">
        <button
          type="button"
          disabled={booking.backendStatus !== "Submitted" || saving}
          onClick={() => handleAction("Approved")}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCircle2 size={17} />
          Approve
        </button>

        <button
          type="button"
          disabled={booking.backendStatus !== "Submitted" || saving}
          onClick={() => handleAction("Changes Requested")}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#E78300] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#C96F00] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCcw size={17} />
          Request Changes
        </button>

        <button
          type="button"
          disabled={booking.backendStatus !== "Submitted" || saving}
          onClick={() => handleAction("Rejected")}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <XCircle size={17} />
          Reject
        </button>
      </div>
    </div>
  );
}

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/store-bookings");
      const list = (data.bookings || []).map(mapBooking);
      setBookings(list);
      setSelectedId((current) => list.some((booking) => booking.id === current)
        ? current
        : (list[0]?.id || ""));
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load bookings from the server.");
      setBookings([]);
      setSelectedId("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadBookings(); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesTab =
        activeTab === "All" ||
        booking.status === activeTab;

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        booking.id.toLowerCase().includes(search) ||
        booking.store.toLowerCase().includes(search) ||
        booking.pickupStore.toLowerCase().includes(search) ||
        booking.destinationStore.toLowerCase().includes(search);

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchTerm]);

  const selectedBooking =
    bookings.find((booking) => booking.id === selectedId);

  const handleStatusChange = async (booking, newStatus, note) => {
    if (newStatus !== "Approved" && !note.trim()) {
      setError(`Add a reviewer note before marking this booking as ${newStatus.toLowerCase()}.`);
      return;
    }
    const endpoint = {
      Approved: "approve",
      "Changes Requested": "request-changes",
      Rejected: "reject",
    }[newStatus];
    if (!endpoint) return;

    setSavingId(booking.mongoId);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.patch(`/store-bookings/${booking.mongoId}/${endpoint}`, { reason: note.trim() });
      setSuccess(data.message || `Booking ${booking.id} updated to ${newStatus}.`);
      await loadBookings();
    } catch (actionError) {
      setError(actionError.response?.data?.message || `Unable to update booking ${booking.id}.`);
    } finally {
      setSavingId("");
    }
  };

  const getTabCount = (tab) => {
    if (tab === "All") return bookings.length;

    return bookings.filter((booking) => booking.status === tab).length;
  };

  return (
    <div className="min-h-full space-y-6">
      {/* Page Heading */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#173F35]">
              Booking Review
            </h1>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              ● {bookings.filter((b) => b.backendStatus === "Submitted").length} Pending Approvals
            </span>
          </div>

          <p className="mt-1 text-sm text-[#64748B]">
            Review and approve pending store replenishment dispatches across regional hubs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadBookings()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate("/approval-log")}
            className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <History size={15} />
            Approval Log
          </button>

          {/* <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#E5E8E6] px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-[#D9DFDB]"
          >
            <SlidersHorizontal size={15} />
            Preferences
          </button> */}
        </div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Search and Filters */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter bookings by ID, store or dock..."
                className="h-10 w-full rounded-lg bg-[#F1F4F2] pl-10 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#27866A]/20"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#073D2D] text-white"
                      : "bg-[#F1F4F2] text-gray-600 hover:bg-[#E4EEE8]"
                  }`}
                >
                  {tab} ({getTabCount(tab)})
                </button>
              ))}
            </div>
          </div>

          {/* Booking List */}
          <div className="space-y-2">
            {loading ? (
              <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Loading bookings…</div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  selected={selectedId === booking.id}
                  onClick={() => setSelectedId(booking.id)}
                />
              ))
            ) : (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <Package
                  size={30}
                  className="mx-auto text-gray-300"
                />
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  {error ? "Bookings could not be loaded" : "No bookings found"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Try changing your search or selected filter.
                </p>
              </div>
            )}
          </div>

          {/* SLA Information */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#DDF4E7] px-4 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#205648]">
              <ShieldCheck size={17} />
              Priority SLA Engine Active
            </div>

            <span className="text-xs font-bold text-[#205648]">
              3 Auto-Clearing
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {selectedBooking ? (
            <BookingDetails
              key={selectedBooking.id}
              booking={selectedBooking}
              onStatusChange={handleStatusChange}
              saving={savingId === selectedBooking.mongoId}
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
              <Package size={40} className="text-gray-300" />
              <h3 className="mt-3 text-base font-semibold text-gray-700">
                Select a booking
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a booking from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;

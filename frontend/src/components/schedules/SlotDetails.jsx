import {
  Store,
  Truck,
  UserRound,
  Package,
  CalendarDays,
  CalendarClock,
  Clock3,
  Route,
  X,
  ClipboardList,
} from "lucide-react";

const slotStatusStyles = {
  Reserved: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const SlotDetails = ({ slot, selectedDate, onClose }) => {
  if (!slot) return null;

  return (
    <div className="mt-3 rounded-2xl border border-[#E2E8E0] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDE9] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">
            {slot.id}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              slotStatusStyles[slot.status] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {slot.type}
          </span>
        </div>

        <button
          onClick={onClose}
          title="Close slot details"
          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200"
        >
          <X size={19} />
        </button>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 py-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          icon={Store}
          label="Store"
          value={slot.store}
        />

        <InfoItem
          icon={CalendarDays}
          label="Reservation Date"
          value={selectedDate}
        />

        <InfoItem
          icon={Truck}
          label="Vehicle"
          value={slot.vehicle}
        />

        <InfoItem
          icon={UserRound}
          label="Driver"
          value={slot.driver}
        />

        <InfoItem
          icon={CalendarClock}
          label="Time Slot"
          value={`${slot.start} – ${slot.end}`}
        />

        <InfoItem
          icon={ClipboardList}
          label="Purpose"
          value={slot.purpose}
        />

        <InfoItem
          icon={Clock3}
          label="Duration"
          value={slot.duration}
        />

        <InfoItem
          icon={Package}
          label="Total Quantity"
          value={slot.quantity}
        />

        <InfoItem
          icon={Route}
          label="Linked Booking"
          value={slot.booking}
        />
      </div>

      {/* Route */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E8EDE9] pt-4">
        <Route size={20} className="text-[#078B66]" />

        <span className="text-xs font-semibold text-gray-500">
          Trip Route
        </span>

        <span className="text-sm font-semibold text-[#173F35]">
          {slot.route}
        </span>

        <span className="ml-auto text-xs text-gray-500">
          {slot.status}
        </span>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <Icon size={21} className="mt-0.5 shrink-0 text-[#078B66]" />

    <div className="min-w-0">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#173F35]">
        {value || "—"}
      </p>
    </div>
  </div>
);

export default SlotDetails;

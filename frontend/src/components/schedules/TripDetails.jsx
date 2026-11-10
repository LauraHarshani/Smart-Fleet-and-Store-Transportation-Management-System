import {
  Truck,
  UserRound,
  Package,
  CalendarCheck,
  Clock3,
  Route,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const statusStyles = {
  Assigned: "bg-amber-100 text-amber-800",
  Scheduled: "bg-blue-100 text-blue-800",
  "In Progress": "bg-violet-100 text-violet-800",
  Delayed: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const TripDetails = ({
  trip,
  selectedDate,
  onClose,
  onUpdateStatus,
  statusOptions,
}) => {
  if (!trip) return null;

  const currentStatusIndex = trip.events.findIndex(
    (event) => event.label === trip.status
  );

  return (
    <div className="mt-3 rounded-2xl border border-[#E2E8E0] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDE9] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">
            {trip.id}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusStyles[trip.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {trip.status}
          </span>
        </div>

        <button
          onClick={onClose}
          title="Close trip details"
          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200"
        >
          <X size={19} />
        </button>
      </div>

      {/* Trip information */}
      <div className="grid grid-cols-1 gap-6 py-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
          <InfoItem
            icon={Truck}
            label="Vehicle"
            value={trip.vehicle}
          />

          <InfoItem
            icon={UserRound}
            label="Driver"
            value={trip.driver}
          />

          <InfoItem
            icon={Package}
            label="Load"
            value={trip.load}
          />

          <InfoItem
            icon={CalendarCheck}
            label="Trip Date"
            value={selectedDate}
          />

          <InfoItem
            icon={CalendarCheck}
            label="Trip Start"
            value={trip.start}
          />

          <InfoItem
            icon={Clock3}
            label="Expected Arrival"
            value={trip.end}
          />

          <InfoItem
            icon={Route}
            label="Duration"
            value={`${Math.max(
              0,
              (Number(trip.end.split(":")[0]) * 60 +
                Number(trip.end.split(":")[1]) -
                Number(trip.start.split(":")[0]) * 60 -
                Number(trip.start.split(":")[1])) /
                60
            ).toFixed(1)} hr`}
          />
        </div>

        {/* Route and bookings */}
        <div className="border-t border-[#E8EDE9] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#173F35]">
            <Route size={19} className="text-[#078B66]" />
            Trip Route
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {trip.route.split(" → ")[0]} Store
              </p>
              <p className="mt-1 text-xs text-[#078B66]">
                {trip.bookings[0] || "No booking"}
              </p>
            </div>

            <span className="text-2xl text-[#173F35]">→</span>

            <div>
              <p className="text-sm font-medium text-gray-800">
                {trip.route.split(" → ")[1]} Store
              </p>
              <p className="mt-1 text-xs text-[#078B66]">
                {trip.bookings[1] || "Destination"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-t border-[#E8EDE9] pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Trip Progress
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {trip.progress}% completed
            </p>
          </div>

          <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#27866A] transition-all"
              style={{
                width: `${trip.progress}%`,
              }}
            />
          </div>
        </div>

        <div className="relative flex justify-between gap-1">
          <div className="absolute left-[5%] right-[5%] top-[11px] h-[2px] bg-gray-200" />

          {trip.events.map((event, index) => {
            const done = event.completed;
            const current = event.current;

            return (
              <div
                key={`${event.label}-${index}`}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-[#27866A] bg-[#27866A] text-white"
                      : current
                      ? "border-violet-600 bg-white text-violet-600"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 size={15} />
                  ) : current ? (
                    <span className="h-2 w-2 rounded-full bg-violet-600" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                </div>

                <p
                  className={`mt-2 text-[10px] font-semibold sm:text-xs ${
                    done || current
                      ? "text-[#173F35]"
                      : "text-gray-400"
                  }`}
                >
                  {event.label}
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  {event.time}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status update */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EDE9] pt-4">
        <div>
          <p className="text-xs font-medium text-gray-600">
            Current trip status
          </p>
          <p className="mt-1 text-sm font-semibold text-[#173F35]">
            {trip.status}
          </p>
        </div>

        <div className="relative">
          <select
            value={trip.status}
            onChange={(event) =>
              onUpdateStatus(trip.id, event.target.value)
            }
            className="h-10 appearance-none rounded-xl border border-[#27866A] bg-[#E8F5EC] py-2 pl-4 pr-10 text-sm font-semibold text-[#205648] outline-none transition hover:bg-[#DCEBDD] focus:ring-2 focus:ring-[#B5D6A7]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-3 text-[#205648]"
          />
        </div>
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

export default TripDetails;

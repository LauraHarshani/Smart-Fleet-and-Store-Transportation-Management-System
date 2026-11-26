import {
  Truck,
  UserRound,
  Package,
  CalendarCheck,
  Clock3,
  Route,
  X,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { useState } from "react";

const statusStyles = {
  Assigned: "bg-amber-100 text-amber-800",
  Scheduled: "bg-blue-100 text-blue-800",
  "In Progress": "bg-violet-100 text-violet-800",
  Delayed: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const getTripDuration = (start, end) => {
  const toMinutes = (value) => {
    const [hours, minutes] = String(value || '').split(':').map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
  };
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  return startMinutes === null || endMinutes === null ? '—' : `${Math.max(0, (endMinutes - startMinutes) / 60).toFixed(1)} hr`;
};

const TripDetails = ({
  trip,
  selectedDate,
  onClose,
  onReportDelay,
  delayBusy,
}) => {
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  if (!trip) return null;

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
            value={getTripDuration(trip.start, trip.end)}
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
                {trip.route.split(" → ")[1] || trip.route.split(" → ")[0] || '—'} Store
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

      {/* Status and delay action */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EDE9] pt-4">
        <div>
          <p className="text-xs font-medium text-gray-600">
            Current trip status
          </p>
          <p className="mt-1 text-sm font-semibold text-[#173F35]">
            {trip.status}
          </p>
        </div>

        {!['Draft', 'Pending', 'Completed', 'Cancelled'].includes(trip.status) && <button type="button" onClick={() => setShowDelayForm((visible) => !visible)} className="flex h-10 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-800 hover:bg-amber-100"><Timer size={16} />Report delay</button>}
      </div>

      {showDelayForm && <form onSubmit={(event) => { event.preventDefault(); onReportDelay(trip._id, Number(delayMinutes)); }} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <label className="text-xs font-semibold text-gray-700">Delay duration (minutes)<input required type="number" min="1" step="1" value={delayMinutes} onChange={(event) => setDelayMinutes(event.target.value)} className="mt-1 block h-10 w-44 rounded-lg border border-gray-300 bg-white px-3 text-sm" /></label>
        <button type="submit" disabled={delayBusy || !trip._id} className="h-10 rounded-lg bg-amber-700 px-4 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-50">{delayBusy ? 'Revalidating…' : 'Apply delay and reschedule'}</button>
        <button type="button" onClick={() => setShowDelayForm(false)} className="h-10 rounded-lg px-3 text-sm font-semibold text-gray-600 hover:bg-white">Cancel</button>
        <p className="basis-full text-xs text-amber-900">Active store reservations will shift by this amount and be checked against store hours and dock capacity.</p>
      </form>}
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

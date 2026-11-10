
import { Truck, ChevronDown } from "lucide-react";

const HOURS = Array.from({ length: 13 }, (_, index) => index + 7);

// Keep all vehicle options independent of filtered trips
const VEHICLES = [
  "All Vehicles",
  "VH-020",
  "VH-031",
  "VH-026",
  "VH-034",
  "VH-036",
  "VH-038",
  "VH-040",
];

const statusStyles = {
  Assigned: {
    bg: "#FEF3C7",
    text: "#92400E",
    dot: "#D97706",
  },
  Scheduled: {
    bg: "#DBEAFE",
    text: "#1E40AF",
    dot: "#2563EB",
  },
  "In Progress": {
    bg: "#EDE9FE",
    text: "#5B21B6",
    dot: "#7C3AED",
  },
  Delayed: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    dot: "#DC2626",
  },
  Completed: {
    bg: "#DCFCE7",
    text: "#166534",
    dot: "#16A34A",
  },
};

const STATUSES = [
  "All Status",
  "Assigned",
  "Scheduled",
  "In Progress",
  "Delayed",
  "Completed",
];

const timeToPercent = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 7 * 60;
  const endMinutes = 19 * 60;

  return Math.max(
    0,
    Math.min(
      100,
      ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
    )
  );
};

const VehicleTimeline = ({
  trips,
  selectedTripId,
  onSelectTrip,
  vehicleFilter,
  setVehicleFilter,
  tripStatusFilter,
  setTripStatusFilter,
}) => {
  return (
    <div className="rounded-2xl border border-[#E2E8E0] bg-white p-5 shadow-sm">
      {/* Filters and legend */}
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {/* Vehicle Filter */}
          <div className="relative">
            <select
              value={vehicleFilter}
              onChange={(event) => setVehicleFilter(event.target.value)}
              className="h-10 min-w-[135px] appearance-none rounded-xl border border-[#27866A] bg-white py-2 pl-4 pr-9 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#B5D6A7]"
            >
              {VEHICLES.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3 text-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={tripStatusFilter}
              onChange={(event) =>
                setTripStatusFilter(event.target.value)
              }
              className="h-10 min-w-[135px] appearance-none rounded-xl border border-[#27866A] bg-white py-2 pl-4 pr-9 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#B5D6A7]"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3 text-gray-500"
            />
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {Object.entries(statusStyles).map(([status, style]) => (
            <div
              key={status}
              className="flex items-center gap-2 text-xs text-gray-700"
            >
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: style.dot }}
              />
              {status}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] overflow-hidden rounded-xl border border-[#E2E8E0]">
          {/* Time Header */}
          <div className="flex h-11 bg-[#E8F5EC]">
            <div className="w-[135px] shrink-0 border-r border-[#E2E8E0]" />

            <div className="relative flex flex-1">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs font-medium leading-[44px] text-[#205648]"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Rows */}
          {trips.length === 0 ? (
            <div className="flex h-28 items-center justify-center text-sm text-gray-500">
              No trips found for the selected filters.
            </div>
          ) : (
            trips.map((trip) => {
              const style =
                statusStyles[trip.status] || statusStyles.Scheduled;

              const left = timeToPercent(trip.start);
              const right = timeToPercent(trip.end);
              const width = right - left;

              const isSelected = selectedTripId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="flex h-[70px] border-t border-[#E2E8E0]"
                >
                  {/* Vehicle Information */}
                  <div className="flex w-[135px] shrink-0 items-center gap-2 border-r border-[#E2E8E0] px-3">
                    <Truck
                      size={20}
                      className="shrink-0 text-[#078B66]"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#173F35]">
                        {trip.vehicle}
                      </p>

                      <p className="mt-1 text-[10px] text-[#64748B]">
                        {trip.capacity}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Area */}
                  <div className="relative flex-1">
                    {/* Vertical Time Grid */}
                    <div
                      className="pointer-events-none absolute inset-0 grid"
                      style={{
                        gridTemplateColumns:
                          "repeat(12, minmax(0, 1fr))",
                      }}
                    >
                      {HOURS.slice(0, 12).map((hour) => (
                        <div
                          key={hour}
                          className="border-r border-[#E8EDE9]"
                        />
                      ))}
                    </div>

                    {/* Trip Block */}
                    <button
                      onClick={() => onSelectTrip(trip.id)}
                      title={`${trip.id} · ${trip.route} · ${trip.start}–${trip.end}`}
                      className={`absolute top-[12px] z-10 flex h-[46px] min-w-[55px] flex-col justify-center overflow-hidden rounded-lg px-3 text-left transition hover:brightness-[0.97] ${
                        isSelected
                          ? "ring-2 ring-[#173F35] ring-offset-1"
                          : ""
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 5)}%`,
                        backgroundColor: style.bg,
                        color: style.text,
                      }}
                    >
                      <span className="truncate text-xs font-bold">
                        {trip.id}
                      </span>

                      <span className="truncate text-[10px]">
                        {trip.route}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Select a trip to view its details and update its status.
      </p>
    </div>
  );
};

export default VehicleTimeline;

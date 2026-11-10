import { Store, ChevronDown } from "lucide-react";

const HOURS = Array.from({ length: 13 }, (_, index) => index + 7);

//for store filtering
const STORES = [
  "All Stores",
  "Colombo Store",
  "Kandy Store",
  "Galle Store",
];

const slotStyles = {
  Loading: {
    bg: "#DCFCE7",
    text: "#166534",
    dot: "#16A34A",
  },
  Unloading: {
    bg: "#DBEAFE",
    text: "#1E40AF",
    dot: "#2563EB",
  },
  Maintenance: {
    bg: "#FEF3C7",
    text: "#92400E",
    dot: "#D97706",
  },
};

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

const StoreTimeline = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  storeFilter,
  setStoreFilter,
  slotTypeFilter,
  setSlotTypeFilter,
}) => {
  const slotTypes = [
    "All Slot Types",
    "Loading",
    "Unloading",
    "Maintenance",
  ];

  const storeOrder = STORES.slice(1);

  const visibleStores = storeOrder.filter((store) =>
    slots.some((slot) => slot.store === store)
  );

  return (
    <div className="rounded-2xl border border-[#E2E8E0] bg-white p-5 shadow-sm">
      {/* Filters and legend */}
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={storeFilter}
              onChange={(event) => setStoreFilter(event.target.value)}
              className="h-10 min-w-[140px] appearance-none rounded-xl border border-[#27866A] bg-white py-2 pl-4 pr-9 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#B5D6A7]"
            >
              {STORES.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3 text-gray-500"
            />
          </div>

          <div className="relative">
            <select
              value={slotTypeFilter}
              onChange={(event) => setSlotTypeFilter(event.target.value)}
              className="h-10 min-w-[145px] appearance-none rounded-xl border border-[#27866A] bg-white py-2 pl-4 pr-9 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#B5D6A7]"
            >
              {slotTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3 text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {Object.entries(slotStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-gray-700">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: style.dot }}
              />
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] overflow-hidden rounded-xl border border-[#E2E8E0]">
          {/* Time header */}
          <div className="flex h-11 bg-[#E8F5EC]">
            <div className="w-[140px] shrink-0 border-r border-[#E2E8E0]" />

            <div className="flex flex-1">
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

          {/* Store rows */}
          {visibleStores.length === 0 ? (
            <div className="flex h-28 items-center justify-center text-sm text-gray-500">
              No reservations found for the selected filters.
            </div>
          ) : (
            visibleStores.map((store) => {
              const storeSlots = slots.filter(
                (slot) => slot.store === store
              );

              const dockCount = storeSlots[0]?.dock ?? "-";

              return (
                <div
                  key={store}
                  className="flex h-[73px] border-t border-[#E2E8E0]"
                >
                  {/* Store information */}
                  <div className="flex w-[140px] shrink-0 items-center gap-2 border-r border-[#E2E8E0] px-3">
                    <Store
                      size={20}
                      className="shrink-0 text-[#078B66]"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#173F35]">
                        {store}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748B]">
                        Loading Docks: {dockCount}
                      </p>
                    </div>
                  </div>

                  {/* Timeline area */}
                  <div className="relative flex-1">
                    <div
                      className="pointer-events-none absolute inset-0 grid"
                      style={{
                        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                      }}
                    >
                      {HOURS.slice(0, 12).map((hour) => (
                        <div
                          key={hour}
                          className="border-r border-[#E8EDE9]"
                        />
                      ))}
                    </div>

                    {storeSlots.map((slot) => {
                      const style = slotStyles[slot.type];
                      const left = timeToPercent(slot.start);
                      const right = timeToPercent(slot.end);
                      const width = right - left;
                      const isSelected = selectedSlotId === slot.id;
                      const formatTime = (time) => {
                        const [hours, minutes] = time.split(":");
                        return `${Number(hours)}:${minutes}`;
                      };

                      return (
                        <button
                          key={slot.id}
                          onClick={() => onSelectSlot(slot.id)}
                          title={`${slot.id} · ${slot.type} · ${slot.start}–${slot.end}`}
                          className={`absolute top-[13px] z-10 flex h-[46px] min-w-[55px] flex-col justify-center overflow-hidden rounded-lg px-3 text-left transition hover:brightness-[0.97] ${
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
                            {slot.type === "Maintenance" ? slot.type : slot.id}
                          </span>
                          <span className="truncate text-[10px]">
                            {slot.type === "Maintenance"
                              ? `${formatTime(slot.start)} - ${formatTime(slot.end)}`
                              : slot.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Select a reservation to view its details.
      </p>
    </div>
  );
};

export default StoreTimeline;

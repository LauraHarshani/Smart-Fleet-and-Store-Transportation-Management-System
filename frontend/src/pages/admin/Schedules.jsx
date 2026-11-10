
import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

import ScheduleTabs from "../../components/schedules/ScheduleTabs";
import VehicleTimeline from "../../components/schedules/VehicleTimeline";
import StoreTimeline from "../../components/schedules/StoreTimeline";
import TripDetails from "../../components/schedules/TripDetails";
import SlotDetails from "../../components/schedules/SlotDetails";

const today = new Date().toISOString().split("T")[0];

const initialTrips = [
  {
    id: "TR-160",
    vehicle: "VH-020",
    driver: "Minindu Rajapaksha",
    route: "Colombo → Kandy",
    start: "07:00",
    end: "10:00",
    status: "In Progress",
    load: "80 Units",
    stops: 2,
    capacity: "5 Tons · 35.0 m³",
    bookings: ["BK-259", "BK-260"],
    progress: 60,
    currentStep: 2,
    events: [
      { label: "Assigned", time: "06:00", completed: true },
      { label: "Departed", time: "07:00", completed: true },
      { label: "In Progress", time: "08:30", current: true },
      { label: "Arrived", time: "10:00" },
      { label: "Completed", time: "11:00" },
    ],
  },
  {
    id: "TR-161",
    vehicle: "VH-031",
    driver: "Kasun Perera",
    route: "Kandy → Galle",
    start: "12:00",
    end: "15:00",
    status: "Scheduled",
    load: "120 Units",
    stops: 2,
    capacity: "8 Tons · 42.0 m³",
    bookings: ["BK-261"],
    progress: 0,
    currentStep: 0,
    events: [
      { label: "Assigned", time: "11:30" },
      { label: "Departed", time: "12:00" },
      { label: "In Progress", time: "13:00" },
      { label: "Arrived", time: "14:30" },
      { label: "Completed", time: "15:00" },
    ],
  },
  {
    id: "TR-165",
    vehicle: "VH-026",
    driver: "Nimal Fernando",
    route: "Galle → Colombo",
    start: "15:00",
    end: "17:00",
    status: "Assigned",
    load: "56 Units",
    stops: 2,
    capacity: "5 Tons · 35.0 m³",
    bookings: ["BK-265"],
    progress: 0,
    currentStep: 0,
    events: [
      { label: "Assigned", time: "14:30" },
      { label: "Departed", time: "15:00" },
      { label: "In Progress", time: "16:00" },
      { label: "Arrived", time: "16:45" },
      { label: "Completed", time: "17:00" },
    ],
  },
  {
    id: "TR-166",
    vehicle: "VH-020",
    driver: "Minindu Rajapaksha",
    route: "Colombo → Kandy",
    start: "07:30",
    end: "10:30",
    status: "Completed",
    load: "80 Units",
    stops: 2,
    capacity: "5 Tons · 35.0 m³",
    bookings: ["BK-258"],
    progress: 100,
    currentStep: 5,
    events: [
      { label: "Assigned", time: "07:00", completed: true },
      { label: "Departed", time: "07:30", completed: true },
      { label: "In Progress", time: "08:30", completed: true },
      { label: "Arrived", time: "10:00", completed: true },
      { label: "Completed", time: "10:30", completed: true },
    ],
  },
  {
    id: "TR-168",
    vehicle: "VH-034",
    driver: "Sahan Silva",
    route: "Colombo → Galle",
    start: "08:00",
    end: "11:30",
    status: "Delayed",
    load: "95 Units",
    stops: 2,
    capacity: "8 Tons · 42.0 m³",
    bookings: ["BK-259"],
    progress: 40,
    currentStep: 2,
    events: [
      { label: "Assigned", time: "07:30", completed: true },
      { label: "Departed", time: "08:00", completed: true },
      { label: "In Progress", time: "09:00", current: true },
      { label: "Arrived", time: "11:00" },
      { label: "Completed", time: "11:30" },
    ],
  },
  {
    id: "TR-170",
    vehicle: "VH-036",
    driver: "Ruwan Jayasuriya",
    route: "Colombo → Kandy",
    start: "07:00",
    end: "10:30",
    status: "Completed",
    load: "70 Units",
    stops: 2,
    capacity: "5 Tons · 35.0 m³",
    bookings: ["BK-270"],
    progress: 100,
    currentStep: 5,
    events: [
      { label: "Assigned", time: "06:30", completed: true },
      { label: "Departed", time: "07:00", completed: true },
      { label: "In Progress", time: "08:00", completed: true },
      { label: "Arrived", time: "10:00", completed: true },
      { label: "Completed", time: "10:30", completed: true },
    ],
  },
  {
    id: "TR-171",
    vehicle: "VH-038",
    driver: "Kasun Perera",
    route: "Colombo → Kandy",
    start: "12:30",
    end: "15:30",
    status: "In Progress",
    load: "110 Units",
    stops: 2,
    capacity: "8 Tons · 42.0 m³",
    bookings: ["BK-271"],
    progress: 55,
    currentStep: 2,
    events: [
      { label: "Assigned", time: "12:00", completed: true },
      { label: "Departed", time: "12:30", completed: true },
      { label: "In Progress", time: "13:30", current: true },
      { label: "Arrived", time: "15:00" },
      { label: "Completed", time: "15:30" },
    ],
  },
  {
    id: "TR-172",
    vehicle: "VH-040",
    driver: "Nimal Fernando",
    route: "Kandy → Galle",
    start: "15:30",
    end: "19:00",
    status: "Scheduled",
    load: "65 Units",
    stops: 2,
    capacity: "5 Tons · 35.0 m³",
    bookings: ["BK-272"],
    progress: 0,
    currentStep: 0,
    events: [
      { label: "Assigned", time: "15:00" },
      { label: "Departed", time: "15:30" },
      { label: "In Progress", time: "16:30" },
      { label: "Arrived", time: "18:30" },
      { label: "Completed", time: "19:00" },
    ],
  },
];

const initialSlots = [
  {
    id: "TR-160",
    store: "Colombo Store",
    dock: 10,
    type: "Loading",
    start: "07:00",
    end: "09:00",
    status: "Reserved",
    vehicle: "VH-020",
    driver: "Minindu Rajapaksha",
    booking: "BK-259",
    route: "Colombo → Kandy",
    purpose: "Loading",
    duration: "02 hr",
    quantity: "80 Units",
  },
  {
    id: "TR-161",
    store: "Colombo Store",
    dock: 10,
    type: "Unloading",
    start: "10:00",
    end: "12:30",
    status: "Reserved",
    vehicle: "VH-031",
    driver: "Kasun Perera",
    booking: "BK-261",
    route: "Kandy → Galle",
    purpose: "Unloading",
    duration: "02.5 hr",
    quantity: "120 Units",
  },
  {
    id: "TR-166",
    store: "Kandy Store",
    dock: 6,
    type: "Unloading",
    start: "07:30",
    end: "09:30",
    status: "Reserved",
    vehicle: "VH-020",
    driver: "Minindu Rajapaksha",
    booking: "BK-258",
    route: "Colombo → Kandy",
    purpose: "Unloading",
    duration: "02 hr",
    quantity: "80 Units",
  },
  {
    id: "TR-167",
    store: "Kandy Store",
    dock: 6,
    type: "Loading",
    start: "10:30",
    end: "12:00",
    status: "Reserved",
    vehicle: "VH-026",
    driver: "Nimal Fernando",
    booking: "BK-265",
    route: "Kandy → Galle",
    purpose: "Loading",
    duration: "1.5 hr",
    quantity: "56 Units",
  },
  {
    id: "TR-168",
    store: "Galle Store",
    dock: 4,
    type: "Loading",
    start: "07:00",
    end: "09:00",
    status: "Reserved",
    vehicle: "VH-034",
    driver: "Sahan Silva",
    booking: "BK-259",
    route: "Colombo → Galle",
    purpose: "Loading",
    duration: "02 hr",
    quantity: "95 Units",
  },
  {
    id: "TR-169",
    store: "Galle Store",
    dock: 4,
    type: "Maintenance",
    start: "16:00",
    end: "19:00",
    status: "Reserved",
    vehicle: "—",
    driver: "—",
    booking: "—",
    route: "—",
    purpose: "Maintenance",
    duration: "03 hr",
    quantity: "—",
  },
];

const statusOptions = [
  "Assigned",
  "Scheduled",
  "In Progress",
  "Delayed",
  "Completed",
];

const Schedules = () => {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [selectedDate, setSelectedDate] = useState(today);

  const [trips, setTrips] = useState(initialTrips);
  const [slots] = useState(initialSlots);

  // No details are selected when the page first loads.
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [tripStatusFilter, setTripStatusFilter] = useState("All Status");

  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [slotTypeFilter, setSlotTypeFilter] = useState("All Slot Types");

  const detailsRef = useRef(null);

  const selectedTrip =
    trips.find((trip) => trip.id === selectedTripId) || null;

  const selectedSlot =
    slots.find((slot) => slot.id === selectedSlotId) || null;

  const filteredTrips = trips.filter((trip) => {
    const vehicleMatch =
      vehicleFilter === "All Vehicles" ||
      trip.vehicle === vehicleFilter;

    const statusMatch =
      tripStatusFilter === "All Status" ||
      trip.status === tripStatusFilter;

    return vehicleMatch && statusMatch;
  });

  const filteredSlots = slots.filter((slot) => {
    const storeMatch =
      storeFilter === "All Stores" ||
      slot.store === storeFilter;

    const typeMatch =
      slotTypeFilter === "All Slot Types" ||
      slot.type === slotTypeFilter;

    return storeMatch && typeMatch;
  });

  const updateTripStatus = (tripId, newStatus) => {
    setTrips((previousTrips) =>
      previousTrips.map((trip) =>
        trip.id === tripId
          ? { ...trip, status: newStatus }
          : trip
      )
    );
  };

  // Scroll to the details section after it has appeared in the page.
  useEffect(() => {
    if (!selectedTripId && !selectedSlotId) return;

    const animationFrame = requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [selectedTripId, selectedSlotId, activeTab]);

  // Select a trip and show its details.
  const handleTripSelect = (tripId) => {
    setSelectedSlotId(null);
    setSelectedTripId(tripId);
  };

  // Select a store slot and show its details.
  const handleSlotSelect = (slotId) => {
    setSelectedTripId(null);
    setSelectedSlotId(slotId);
  };

  // Clear selections when switching schedule tabs.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTripId(null);
    setSelectedSlotId(null);
  };

  return (
    <div className="min-h-full bg-[#F5F7F2]">
      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Slot Scheduling & Fleet Timeline
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            View and manage vehicle schedules and store time slots
          </p>
        </div>

        {/* Date controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#27866A] bg-white px-3 text-sm text-gray-600">
            <CalendarDays size={18} className="text-[#27866A]" />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-[145px] bg-transparent outline-none"
            />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <ScheduleTabs
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Vehicle Schedule */}
      {activeTab === "vehicles" && (
        <>
          <VehicleTimeline
            trips={filteredTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={handleTripSelect}
            vehicleFilter={vehicleFilter}
            setVehicleFilter={setVehicleFilter}
            tripStatusFilter={tripStatusFilter}
            setTripStatusFilter={setTripStatusFilter}
          />

          {selectedTrip && (
            <div
              ref={detailsRef}
              className="mt-6 scroll-mt-6"
            >
              <TripDetails
                trip={selectedTrip}
                selectedDate={selectedDate}
                onClose={() => setSelectedTripId(null)}
                onUpdateStatus={updateTripStatus}
                statusOptions={statusOptions}
              />
            </div>
          )}
        </>
      )}

      {/* Store Slots */}
      {activeTab === "stores" && (
        <>
          <StoreTimeline
            slots={filteredSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={handleSlotSelect}
            storeFilter={storeFilter}
            setStoreFilter={setStoreFilter}
            slotTypeFilter={slotTypeFilter}
            setSlotTypeFilter={setSlotTypeFilter}
          />

          {selectedSlot && (
            <div
              ref={detailsRef}
              className="mt-6 scroll-mt-6"
            >
              <SlotDetails
                slot={selectedSlot}
                selectedDate={selectedDate}
                onClose={() => setSelectedSlotId(null)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Schedules;

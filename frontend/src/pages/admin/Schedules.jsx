
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Loader2, Plus, RefreshCw, X } from "lucide-react";

import ScheduleTabs from "../../components/schedules/ScheduleTabs";
import VehicleTimeline from "../../components/schedules/VehicleTimeline";
import StoreTimeline from "../../components/schedules/StoreTimeline";
import TripDetails from "../../components/schedules/TripDetails";
import SlotDetails from "../../components/schedules/SlotDetails";
import { createStoreSlot, getStoreSlots, getTrips, reportTripDelay } from "../../services/slotService";
import { getAllStores } from "../../services/storeService";

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

const dateKey = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const toTripView = (trip) => ({
  ...trip,
  id: trip.id || trip._id,
  route: trip.route || [trip.origin, trip.destination].filter(Boolean).join(" → "),
  events: (trip.events || []).map((event) => ({
    ...event,
    time: event.time || (event.timestamp ? formatTime(event.timestamp) : ""),
  })),
  bookings: (trip.bookings || []).map((booking) => booking.id || booking.toString()),
  stops: Array.isArray(trip.stops) ? trip.stops : [],
});

const toSlotView = (slot) => {
  const start = formatTime(slot.startAt);
  const end = formatTime(slot.endAt);
  const totalQuantity = (slot.trip?.storeBookings || []).reduce(
    (total, booking) =>
      total +
      (booking.items || []).reduce(
        (bookingTotal, item) => bookingTotal + (Number(item.quantity) || 0),
        0
      ),
    0
  );

  return {
    ...slot,
    storeId: slot.store?._id || slot.store,
    store: slot.store?.name || slot.store?.code || "Store",
    driver: slot.trip?.driver,
    tripCode: slot.trip?.id || "Trip",
    type: slot.operationType,
    start,
    end,
    duration: `${Math.max(0, (new Date(slot.endAt) - new Date(slot.startAt)) / 3600000).toFixed(1)} hr`,
    booking: slot.trip?.id || "—",
    route: slot.trip?.route || "—",
    purpose: slot.operationType,
    quantity: totalQuantity || "—",
    dock: slot.store?.docks ?? "—",
    dockNumber: slot.dockNumber ?? null,
  };
};

const assignDisplayDocks = (slotData) => {
  const views = slotData.map(toSlotView);
  const storeGroups = new Map();
  views.forEach((slot) => {
    const key = String(slot.storeId || slot.store);
    if (!storeGroups.has(key)) storeGroups.set(key, []);
    storeGroups.get(key).push(slot);
  });

  storeGroups.forEach((storeSlots) => {
    const capacity = Math.max(1, Number(storeSlots[0]?.dock) || 1);
    const lanes = Array.from({ length: capacity }, () => []);
    const overlaps = (lane, slot) => lane.some((item) => new Date(item.startAt) < new Date(slot.endAt) && new Date(item.endAt) > new Date(slot.startAt));

    // Keep saved assignments fixed, then place older unnumbered reservations in free lanes.
    storeSlots.filter((slot) => Number.isInteger(Number(slot.dockNumber)) && Number(slot.dockNumber) > 0)
      .forEach((slot) => {
        const index = Number(slot.dockNumber) - 1;
        while (lanes.length <= index) lanes.push([]);
        lanes[index].push(slot);
        slot.displayDockNumber = Number(slot.dockNumber);
      });

    storeSlots.filter((slot) => slot.dockNumber == null || !Number.isInteger(Number(slot.dockNumber)))
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt) || new Date(a.endAt) - new Date(b.endAt))
      .forEach((slot) => {
        let index = lanes.findIndex((lane) => !overlaps(lane, slot));
        if (index < 0) { index = lanes.length; lanes.push([]); }
        lanes[index].push(slot);
        slot.displayDockNumber = index + 1;
        slot.displayDockInferred = true;
      });
  });

  return views;
};

const SlotReservationModal = ({ stores, trips, onClose, onCreated }) => {
  const [storeId, setStoreId] = useState(stores[0]?._id || "");
  const [tripId, setTripId] = useState(trips[0]?._id || "");
  const [stopId, setStopId] = useState("");
  const [vehicle, setVehicle] = useState(trips[0]?.vehicle || "");
  const [operationType, setOperationType] = useState("Loading");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedTrip = trips.find((trip) => trip._id === tripId);
  const selectedStopId = stopId || selectedTrip?.stops?.[0]?._id || "";

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createStoreSlot({
        store: storeId,
        trip: tripId,
        stopId: selectedStopId,
        vehicle: vehicle.trim(),
        operationType,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        notes,
      });
      await onCreated();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not reserve this store slot.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={submit} className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
    <header className="flex items-center justify-between border-b p-5"><div><h2 className="text-lg font-bold text-[#173F35]">Reserve a store slot</h2><p className="mt-1 text-xs text-gray-500">The reservation will be checked against hours and simultaneous dock capacity.</p></div><button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button></header>
    <div className="grid gap-4 p-5 sm:grid-cols-2">
      <label className="text-sm font-semibold text-gray-700">Store<select required value={storeId} onChange={(event) => setStoreId(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm">{stores.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}</select></label>
      <label className="text-sm font-semibold text-gray-700">Trip<select required value={tripId} onChange={(event) => { const nextTrip = trips.find((trip) => trip._id === event.target.value); setTripId(event.target.value); setStopId(nextTrip?.stops?.[0]?._id || ""); setVehicle(nextTrip?.vehicle || ""); }} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm">{trips.filter((trip) => !["Cancelled", "Completed"].includes(trip.status)).map((trip) => <option key={trip._id} value={trip._id}>{trip.id} · {trip.route}</option>)}</select></label>
      <label className="text-sm font-semibold text-gray-700">Trip stop<select required value={selectedStopId} onChange={(event) => setStopId(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm">{(selectedTrip?.stops || []).map((stop, index) => <option key={stop._id || index} value={stop._id}>{stop.location} · {stop.type}</option>)}</select></label>
      <label className="text-sm font-semibold text-gray-700">Operation<select value={operationType} onChange={(event) => setOperationType(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"><option>Loading</option><option>Unloading</option><option>Maintenance</option></select></label>
      <label className="text-sm font-semibold text-gray-700">Vehicle<input required value={vehicle} onChange={(event) => setVehicle(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm" /></label>
      <div />
      <label className="text-sm font-semibold text-gray-700">Start<input required type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm" /></label>
      <label className="text-sm font-semibold text-gray-700">End<input required type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm" /></label>
      <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm" /></label>
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
    </div>
    <footer className="flex justify-end gap-2 border-t bg-gray-50 p-4"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button disabled={saving || !stores.length || !selectedTrip?.stops?.length} className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-bold text-white hover:bg-[#0F2C25] disabled:opacity-50">{saving && <Loader2 size={15} className="animate-spin" />}Reserve slot</button></footer>
  </form></div>;
};

const Schedules = () => {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [selectedDate, setSelectedDate] = useState(today);

  const [trips, setTrips] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [toast, setToast] = useState("");
  const [delayBusy, setDelayBusy] = useState(false);
  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false);

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
    slots.find((slot) => slot._id === selectedSlotId) || null;

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setScheduleError("");
    try {
      const [tripData, slotData, storeData] = await Promise.all([getTrips(), getStoreSlots(), getAllStores()]);
      setTrips(tripData.map(toTripView));
      setSlots(assignDisplayDocks(slotData));
      setStores(storeData);
    } catch (error) {
      setScheduleError(error.response?.data?.message || "Unable to load live schedules. Check the backend connection and try again.");
      setTrips([]);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadSchedule(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSchedule]);

  const visibleTrips = trips.filter((trip) => !trip.date || dateKey(trip.date) === selectedDate);
  const visibleSlots = slots.filter((slot) => !slot.startAt || dateKey(slot.startAt) === selectedDate);

  const filteredTrips = visibleTrips.filter((trip) => {
    const vehicleMatch =
      vehicleFilter === "All Vehicles" ||
      trip.vehicle === vehicleFilter;

    const statusMatch =
      tripStatusFilter === "All Status" ||
      trip.status === tripStatusFilter;

    return vehicleMatch && statusMatch;
  });

  const filteredSlots = visibleSlots.filter((slot) => {
    const storeMatch =
      storeFilter === "All Stores" ||
      slot.store === storeFilter;

    const typeMatch =
      slotTypeFilter === "All Slot Types" ||
      slot.type === slotTypeFilter;

    return storeMatch && typeMatch;
  });

  const handleReportDelay = async (tripId, delayMinutes) => {
    setDelayBusy(true);
    setScheduleError("");
    try {
      const result = await reportTripDelay(tripId, delayMinutes);
      setToast(result.message || "Trip delay applied and store slots revalidated.");
      await loadSchedule();
    } catch (error) {
      setScheduleError(error.response?.data?.message || "Could not apply the trip delay.");
    } finally {
      setDelayBusy(false);
    }
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

  const handleSlotCreated = async () => {
    setIsCreateSlotOpen(false);
    setActiveTab("stores");
    setToast("Store slot reserved successfully.");
    await loadSchedule();
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
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#173F35]">
            Slot Scheduling & Fleet Timeline
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
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
          <button type="button" onClick={loadSchedule} className="flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"><RefreshCw size={16} />Refresh</button>
          <button type="button" onClick={() => setIsCreateSlotOpen(true)} disabled={!stores.length || !trips.some((trip) => trip._id && trip.stops?.length)} className="flex h-10 items-center gap-2 rounded-xl bg-[#173F35] px-4 text-sm font-semibold text-white hover:bg-[#0F2C25] disabled:opacity-50"><Plus size={16} />Reserve store slot</button>
        </div>
      </div>

      {toast && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{toast}</div>}
      {scheduleError && <div role="alert" className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{scheduleError}</span><button type="button" onClick={() => setScheduleError("")} className="ml-4 font-bold">Dismiss</button></div>}

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
          {loading ? <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-12"><Loader2 className="animate-spin text-[#27866A]" /></div> : <VehicleTimeline
            trips={filteredTrips}
            vehicles={trips.map((trip) => trip.vehicle).filter(Boolean)}
            selectedTripId={selectedTripId}
            onSelectTrip={handleTripSelect}
            vehicleFilter={vehicleFilter}
            setVehicleFilter={setVehicleFilter}
            tripStatusFilter={tripStatusFilter}
            setTripStatusFilter={setTripStatusFilter}
          />}

          {selectedTrip && (
            <div
              ref={detailsRef}
              className="mt-6 scroll-mt-6"
            >
              <TripDetails
                trip={selectedTrip}
                selectedDate={selectedDate}
                onClose={() => setSelectedTripId(null)}
                onReportDelay={handleReportDelay}
                delayBusy={delayBusy}
              />
            </div>
          )}
        </>
      )}

      {/* Store Slots */}
      {activeTab === "stores" && (
        <>
          {loading ? <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-12"><Loader2 className="animate-spin text-[#27866A]" /></div> : <StoreTimeline
            slots={filteredSlots}
            stores={stores.map((store) => store.name)}
            selectedSlotId={selectedSlotId}
            onSelectSlot={handleSlotSelect}
            storeFilter={storeFilter}
            setStoreFilter={setStoreFilter}
            slotTypeFilter={slotTypeFilter}
            setSlotTypeFilter={setSlotTypeFilter}
          />}

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
      {isCreateSlotOpen && <SlotReservationModal stores={stores} trips={trips} onClose={() => setIsCreateSlotOpen(false)} onCreated={handleSlotCreated} />}
    </div>
  );
};

export default Schedules;

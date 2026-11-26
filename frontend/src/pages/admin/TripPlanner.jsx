import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Loader2, PackageCheck, RefreshCw, Truck, Warehouse } from 'lucide-react';
import api from '../../services/api';
import { getAllVehicles } from '../../services/vehicleService';

const toLocalInput = (date) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const dateAtTime = (dateValue, timeValue) => {
  const date = new Date(dateValue || Date.now());
  const [hours, minutes] = String(timeValue || '08:00').split(':').map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const addMinutes = (value, minutes) => toLocalInput(new Date(new Date(value).getTime() + minutes * 60000));
const defaultTimes = (booking) => {
  const start = dateAtTime(booking?.requestedPickupDate, booking?.requestedTimeWindow?.startTime || '08:00');
  const pickupStart = toLocalInput(start);
  const pickupEnd = toLocalInput(dateAtTime(booking?.requestedPickupDate, booking?.requestedTimeWindow?.endTime || '08:45'));
  const deliveryStart = addMinutes(pickupEnd, 90);
  return { pickupStart, pickupEnd, deliveryStart, deliveryEnd: addMinutes(deliveryStart, 45) };
};

const TripPlanner = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [times, setTimes] = useState(() => defaultTimes(null));
  const [pickupDocks, setPickupDocks] = useState([]);
  const [destinationDocks, setDestinationDocks] = useState([]);
  const [pickupDock, setPickupDock] = useState('');
  const [destinationDock, setDestinationDock] = useState('');
  const [dockLoading, setDockLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedBooking = bookings.find((booking) => booking._id === bookingId);
  const availableVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.status === 'Available'), [vehicles]);
  const selectedVehicle = availableVehicles.find((vehicle) => vehicle._id === vehicleId);

  const loadOptions = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const [bookingResponse, vehicleData] = await Promise.all([
        api.get('/store-bookings', { params: { status: 'Approved' } }),
        getAllVehicles(),
      ]);
      const eligible = (bookingResponse.data.bookings || []).filter((booking) => !booking.assignedTrip);
      setBookings(eligible);
      setVehicles(vehicleData);
      setBookingId((current) => eligible.some((booking) => booking._id === current) ? current : (eligible[0]?._id || ''));
      setVehicleId((current) => vehicleData.some((vehicle) => vehicle._id === current && vehicle.status === 'Available')
        ? current
        : (vehicleData.find((vehicle) => vehicle.status === 'Available')?._id || ''));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load approved bookings and available vehicles.');
      setBookings([]);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadOptions(false); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOptions]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      if (!selectedBooking || !times.pickupStart || !times.pickupEnd || !times.deliveryStart || !times.deliveryEnd) {
        setPickupDocks([]);
        setDestinationDocks([]);
        setPickupDock('');
        setDestinationDock('');
        return;
      }
      setDockLoading(true);
      try {
        const [pickupResponse, destinationResponse] = await Promise.all([
          api.get('/store-slots/availability/docks', { params: { store: selectedBooking.pickupStore?._id, startAt: new Date(times.pickupStart).toISOString(), endAt: new Date(times.pickupEnd).toISOString() } }),
          api.get('/store-slots/availability/docks', { params: { store: selectedBooking.destinationStore?._id, startAt: new Date(times.deliveryStart).toISOString(), endAt: new Date(times.deliveryEnd).toISOString() } }),
        ]);
        if (!active) return;
        const pickupAvailable = pickupResponse.data.availableDockNumbers || [];
        const destinationAvailable = destinationResponse.data.availableDockNumbers || [];
        setPickupDocks(pickupAvailable);
        setDestinationDocks(destinationAvailable);
        setPickupDock((current) => pickupAvailable.includes(Number(current)) ? current : String(pickupAvailable[0] || ''));
        setDestinationDock((current) => destinationAvailable.includes(Number(current)) ? current : String(destinationAvailable[0] || ''));
      } catch (dockError) {
        if (!active) return;
        setPickupDocks([]);
        setDestinationDocks([]);
        setPickupDock('');
        setDestinationDock('');
        setError(dockError.response?.data?.message || 'Unable to check available store docks for these times.');
      } finally {
        if (active) setDockLoading(false);
      }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [selectedBooking, times.pickupStart, times.pickupEnd, times.deliveryStart, times.deliveryEnd]);
  const setTime = (key, value) => setTimes((current) => ({ ...current, [key]: value }));

  const selectBooking = (nextBookingId) => {
    setBookingId(nextBookingId);
    const nextBooking = bookings.find((booking) => booking._id === nextBookingId);
    if (nextBooking) setTimes(defaultTimes(nextBooking));
  };

  const allocate = async (event) => {
    event.preventDefault();
    if (!selectedBooking || !selectedVehicle) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/trips/allocate-store-booking', {
        bookingId,
        vehicleId,
        pickupSlot: { startAt: new Date(times.pickupStart).toISOString(), endAt: new Date(times.pickupEnd).toISOString(), dockNumber: Number(pickupDock) },
        destinationSlot: { startAt: new Date(times.deliveryStart).toISOString(), endAt: new Date(times.deliveryEnd).toISOString(), dockNumber: Number(destinationDock) },
      });
      setSuccess(`${data.trip.id} created for ${selectedBooking.bookingCode || 'the booking'} with ${selectedVehicle.registrationNumber}. Pickup and destination slots are reserved.`);
      await loadOptions();
    } catch (allocationError) {
      setError(allocationError.response?.data?.message || 'Unable to assign the vehicle and reserve store slots.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center text-[#173F35]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173F35]">Trip Planner & Allocation</h1>
          <p className="mt-1 text-sm text-slate-600">Assign an approved Store Booking to an available vehicle and reserve both store dock slots.</p>
        </div>
        <button type="button" onClick={() => void loadOptions()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" />{success}</div>}

      {!bookings.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <PackageCheck size={34} className="mx-auto text-slate-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-800">No approved bookings need allocation</h2>
          <p className="mt-1 text-sm text-slate-500">Once a store booking is approved, it will appear here for trip and vehicle allocation.</p>
        </div>
      ) : (
        <form onSubmit={allocate} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><PackageCheck className="text-[#27866A]" /><div><h2 className="font-bold text-slate-900">Approved Store Booking</h2><p className="text-xs text-slate-500">Select the booking to dispatch.</p></div></div>
            <label className="block text-sm font-semibold text-slate-700">Booking
              <select required value={bookingId} onChange={(event) => selectBooking(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
                {bookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.bookingCode || booking._id} · {booking.pickupStore?.name} → {booking.destinationStore?.name}</option>)}
              </select>
            </label>
            {selectedBooking && <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold text-slate-800">{selectedBooking.pickupStore?.name} → {selectedBooking.destinationStore?.name}</span><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">{selectedBooking.status}</span></div>
              <p className="mt-2 text-xs text-slate-500">Requested pickup: {new Date(selectedBooking.requestedPickupDate).toLocaleDateString()} {selectedBooking.requestedTimeWindow?.startTime || ''}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">{(selectedBooking.items || []).map((line) => <li key={line._id}>{line.item?.name || 'Item'} · {line.quantity} {line.unit || 'units'}</li>)}</ul>
            </div>}

            <label className="block text-sm font-semibold text-slate-700">Fleet vehicle
              <select required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
                {availableVehicles.map((vehicle) => <option key={vehicle._id} value={vehicle._id}>{vehicle.registrationNumber} · {vehicle.model} · {vehicle.capacityWeightKg} kg</option>)}
              </select>
            </label>
            {selectedVehicle && <p className="-mt-3 text-xs text-slate-500">Assigned driver: {selectedVehicle.assignedDriver?.name || selectedVehicle.assignedDriverName || 'No driver linked to this vehicle'}</p>}
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><CalendarClock className="text-[#27866A]" /><div><h2 className="font-bold text-slate-900">Reserve store slots</h2><p className="text-xs text-slate-500">Choose a free dock at each store. Availability is checked again when you save.</p></div></div>
            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800">Pickup · Loading</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Start<input required type="datetime-local" value={times.pickupStart} onChange={(event) => setTime('pickupStart', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800" /></label><label className="text-xs font-semibold text-slate-600">End<input required type="datetime-local" value={times.pickupEnd} onChange={(event) => setTime('pickupEnd', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800" /></label></div>
              <label className="mt-3 block text-xs font-semibold text-slate-600"><span className="inline-flex items-center gap-1"><Warehouse size={14} /> Loading dock</span><select required value={pickupDock} onChange={(event) => setPickupDock(event.target.value)} disabled={dockLoading || !pickupDocks.length} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 disabled:bg-slate-100"><option value="">{dockLoading ? 'Checking docks…' : pickupDocks.length ? 'Choose a dock' : 'No dock available for this time'}</option>{pickupDocks.map((dock) => <option key={dock} value={dock}>Dock {dock}</option>)}</select></label>
            </div>
            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800">Destination · Unloading</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Start<input required type="datetime-local" value={times.deliveryStart} onChange={(event) => setTime('deliveryStart', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800" /></label><label className="text-xs font-semibold text-slate-600">End<input required type="datetime-local" value={times.deliveryEnd} onChange={(event) => setTime('deliveryEnd', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800" /></label></div>
              <label className="mt-3 block text-xs font-semibold text-slate-600"><span className="inline-flex items-center gap-1"><Warehouse size={14} /> Unloading dock</span><select required value={destinationDock} onChange={(event) => setDestinationDock(event.target.value)} disabled={dockLoading || !destinationDocks.length} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 disabled:bg-slate-100"><option value="">{dockLoading ? 'Checking docks…' : destinationDocks.length ? 'Choose a dock' : 'No dock available for this time'}</option>{destinationDocks.map((dock) => <option key={dock} value={dock}>Dock {dock}</option>)}</select></label>
            </div>
            <button type="submit" disabled={saving || dockLoading || !selectedBooking || !selectedVehicle || !pickupDock || !destinationDock} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173F35] px-5 py-3 text-sm font-bold text-white hover:bg-[#0F2C25] disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Truck size={17} />}
              {saving ? 'Allocating trip and reserving slots…' : 'Allocate vehicle & reserve slots'}
            </button>
          </section>
        </form>
      )}
    </div>
  );
};

export default TripPlanner;

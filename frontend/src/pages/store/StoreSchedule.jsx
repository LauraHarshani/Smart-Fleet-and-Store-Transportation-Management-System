import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Download, Loader2, Pencil, RefreshCw, X } from 'lucide-react';
import { cancelStoreSlot, getStoreSlots, updateStoreSlot } from '../../services/slotService';

const toLocalInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatDate = (value) => value ? new Date(value).toLocaleString(undefined, {
  dateStyle: 'medium', timeStyle: 'short',
}) : '—';

const StoreSchedule = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStoreSlots(dateFilter ? { startDate: `${dateFilter}T00:00:00`, endDate: `${dateFilter}T23:59:59` } : {});
      setSlots(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load store reservations.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadSlots(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSlots]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeSlots = useMemo(() => slots.filter((slot) => !['Cancelled', 'Completed'].includes(slot.status)), [slots]);

  const beginEdit = (slot) => {
    setEditingSlot(slot);
    setEditStart(toLocalInput(slot.startAt));
    setEditEnd(toLocalInput(slot.endAt));
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (!editingSlot || !editStart || !editEnd) return;
    setBusy(true);
    try {
      await updateStoreSlot(editingSlot._id, {
        startAt: new Date(editStart).toISOString(),
        endAt: new Date(editEnd).toISOString(),
      });
      setEditingSlot(null);
      setToast('Reservation rescheduled. Store hours and dock availability were checked.');
      await loadSlots();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Could not reschedule this reservation.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (slot) => {
    if (!window.confirm(`Cancel reservation ${slot.id}?`)) return;
    setBusy(true);
    try {
      await cancelStoreSlot(slot._id);
      setToast(`Reservation ${slot.id} cancelled.`);
      await loadSlots();
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || 'Could not cancel this reservation.');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Reservation', 'Store', 'Trip', 'Operation', 'Start', 'End', 'Vehicle', 'Status'],
      ...slots.map((slot) => [slot.id, slot.store?.name || '', slot.trip?.id || '', slot.operationType, slot.startAt, slot.endAt, slot.vehicle, slot.status]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store-reservations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex flex-col gap-5 pb-10 font-sans">
      {toast && <div role="status" className="fixed right-6 top-6 z-40 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 shadow-lg"><CheckCircle2 size={18} />{toast}</div>}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Store Schedule</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">View and manage store stop reservations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><CalendarDays size={16} /><input aria-label="Filter reservations by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
          <button type="button" onClick={loadSlots} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><RefreshCw size={16} />Refresh</button>
          <button type="button" onClick={exportCsv} disabled={!slots.length} className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2C25] disabled:opacity-50"><Download size={16} />Export</button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-500">RESERVATIONS</p><p className="mt-1 text-2xl font-bold text-[#173F35]">{slots.length}</p></div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-500">ACTIVE</p><p className="mt-1 text-2xl font-bold text-emerald-700">{activeSlots.length}</p></div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-500">CANCELLED</p><p className="mt-1 text-2xl font-bold text-gray-600">{slots.filter((slot) => slot.status === 'Cancelled').length}</p></div>
      </section>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><h2 className="font-bold text-gray-900">Store Reservations</h2><span className="text-xs text-gray-500">{dateFilter || 'All dates'}</span></div>
        {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#27866A]" /></div> : slots.length === 0 ? <p className="p-10 text-center text-sm text-gray-500">No reservations found for this store.</p> : (
          <div className="divide-y divide-gray-100">
            {slots.map((slot) => {
              const editable = !['Cancelled', 'Completed'].includes(slot.status);
              return <article key={slot._id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#173F35]">{slot.id}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${slot.status === 'Cancelled' ? 'bg-red-50 text-red-700' : slot.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>{slot.status}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{slot.operationType}</span></div>
                  <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
                    <p><span className="font-semibold text-gray-800">Store:</span> {slot.store?.name || '—'}</p>
                    <p><span className="font-semibold text-gray-800">Trip:</span> {slot.trip?.id || '—'} {slot.trip?.route ? `· ${slot.trip.route}` : ''}</p>
                    <p><span className="font-semibold text-gray-800">Vehicle:</span> {slot.vehicle}</p>
                    <p className="flex items-center gap-1"><Clock3 size={14} />{formatDate(slot.startAt)} – {new Date(slot.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {slot.notes && <p className="mt-2 text-xs text-gray-500">{slot.notes}</p>}
                </div>
                {editable && <div className="flex shrink-0 gap-2"><button type="button" disabled={busy} onClick={() => beginEdit(slot)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Pencil size={15} />Reschedule</button><button type="button" disabled={busy} onClick={() => handleCancel(slot)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Cancel reservation</button></div>}
              </article>;
            })}
          </div>
        )}
      </section>

      {editingSlot && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={handleReschedule} className="w-full max-w-md rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-gray-900">Reschedule reservation</h2><p className="mt-1 text-xs text-gray-500">{editingSlot.id}</p></div><button type="button" aria-label="Close" onClick={() => setEditingSlot(null)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button></div><div className="space-y-4 p-5"><label className="block text-sm font-medium text-gray-700">Start time<input required type="datetime-local" value={editStart} onChange={(event) => setEditStart(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" /></label><label className="block text-sm font-medium text-gray-700">End time<input required type="datetime-local" value={editEnd} onChange={(event) => setEditEnd(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" /></label><p className="text-xs text-gray-500">The backend will reject times outside operating hours or when dock capacity is exceeded.</p></div><div className="flex justify-end gap-2 border-t bg-gray-50 p-4"><button type="button" onClick={() => setEditingSlot(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Back</button><button disabled={busy} className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-bold text-white hover:bg-[#0F2C25] disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin" />}Save changes</button></div></form></div>}
    </div>
  );
};

export default StoreSchedule;

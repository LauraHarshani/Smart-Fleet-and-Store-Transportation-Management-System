import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertCircle, Calendar, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Download, Info, Loader2, MapPin, Plus, RefreshCw, Truck, Warehouse, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
const pad = (value) => String(value).padStart(2, '0');

const getDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDate = (value, options = { month: 'short', day: '2-digit' }) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, options);
};

const formatTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
};

const minutesOfDay = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getHours() * 60 + date.getMinutes();
};

const toDateTimeLocal = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const shiftDate = (value, days) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const getMonday = (value) => {
  const monday = new Date(value);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
};

const getOperationLabel = (operationType) => {
  if (operationType === 'Loading') return 'Outbound';
  if (operationType === 'Unloading') return 'Inbound';
  return operationType || 'Reservation';
};

const getSlotTone = (slot) => {
  if (['Cancelled', 'Completed'].includes(slot.status)) return 'bg-gray-50 border-gray-200 text-gray-500';
  if (slot.operationType === 'Unloading') return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]';
  if (slot.operationType === 'Maintenance') return 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]';
  return 'bg-[#F0F7FF] border-[#D0E2F8] text-[#1D4ED8]';
};

const getTripStatusTone = (status) => ({
  Draft: 'bg-gray-100 text-gray-700',
  Pending: 'bg-gray-100 text-gray-700',
  Assigned: 'bg-amber-50 text-amber-700',
  Scheduled: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-violet-50 text-violet-700',
  Delayed: 'bg-red-50 text-red-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-500',
}[status] || 'bg-gray-100 text-gray-700');

const StoreSchedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.storeId || user?.store?._id || (isObjectId(user?.store) ? user.store : '');
  const storeName = user?.storeName || (typeof user?.store === 'object' ? user.store?.name : user?.store) || 'Your Store';

  const [scheduleData, setScheduleData] = useState([]);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('week');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [operationFilter, setOperationFilter] = useState('All Operations');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [newStartAt, setNewStartAt] = useState('');
  const [newEndAt, setNewEndAt] = useState('');

  const visibleDays = useMemo(() => {
    if (viewMode === 'day') return [new Date(anchorDate)];
    const monday = getMonday(anchorDate);
    return Array.from({ length: 5 }, (_, index) => shiftDate(monday, index));
  }, [anchorDate, viewMode]);

  const startOfView = useMemo(() => {
    const start = new Date(visibleDays[0]);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [visibleDays]);

  const endOfView = useMemo(() => {
    const end = new Date(visibleDays[visibleDays.length - 1]);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [visibleDays]);

  const fetchSchedule = useCallback(async ({ showLoading = true } = {}) => {
    if (!isObjectId(storeId)) {
      setScheduleData([]);
      setError('Your account does not have a valid assigned store. Please contact an administrator.');
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError('');
    try {
      const response = await api.get('/schedules', {
        params: {
          startDate: startOfView.toISOString(),
          endDate: endOfView.toISOString(),
        },
      });
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error(response.data?.message || 'Unexpected schedule response.');
      }
      setScheduleData(response.data.data);
    } catch (fetchError) {
      if (showLoading) setScheduleData([]);
      setError(fetchError.response?.data?.message || fetchError.message || 'Failed to load store schedule.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [endOfView, startOfView, storeId]);

  useEffect(() => {
    void fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    const refreshVisibleSchedule = () => {
      if (document.visibilityState === 'visible') void fetchSchedule({ showLoading: false });
    };
    const intervalId = window.setInterval(refreshVisibleSchedule, 30_000);
    window.addEventListener('focus', refreshVisibleSchedule);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshVisibleSchedule);
    };
  }, [fetchSchedule]);

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(null), 4000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  useEffect(() => {
    if (!scheduleData.some((slot) => slot._id === selectedSlotId)) {
      setSelectedSlotId(scheduleData[0]?._id || '');
    }
  }, [scheduleData, selectedSlotId]);

  const filteredSlots = useMemo(() => scheduleData.filter((slot) => (
    (statusFilter === 'All Statuses' || slot.status === statusFilter) &&
    (operationFilter === 'All Operations' || slot.operationType === operationFilter)
  )), [operationFilter, scheduleData, statusFilter]);

  const selectedSlot = scheduleData.find((slot) => slot._id === selectedSlotId) || null;
  const activeCount = scheduleData.filter((slot) => ['Reserved', 'Confirmed', 'Rescheduled'].includes(slot.status)).length;
  const inboundCount = scheduleData.filter((slot) => slot.operationType === 'Unloading').length;
  const outboundCount = scheduleData.filter((slot) => slot.operationType === 'Loading').length;
  const completedCount = scheduleData.filter((slot) => slot.status === 'Completed').length;

  const slotStartHours = filteredSlots.map((slot) => minutesOfDay(slot.startAt)).filter(Number.isFinite).map((minutes) => Math.floor(minutes / 60));
  const slotEndHours = filteredSlots.map((slot) => minutesOfDay(slot.endAt)).filter(Number.isFinite).map((minutes) => Math.ceil(minutes / 60));
  const timelineStartHour = Math.min(7, ...slotStartHours);
  const timelineEndHour = Math.max(19, ...slotEndHours);
  const timelinePixelsPerHour = 52;
  const timelineHeight = (timelineEndHour - timelineStartHour) * timelinePixelsPerHour;
  const hourLabels = Array.from({ length: timelineEndHour - timelineStartHour + 1 }, (_, index) => timelineStartHour + index);

  const dailyLayouts = useMemo(() => new Map(visibleDays.map((day) => {
    const dayKey = getDateKey(day);
    const placements = filteredSlots
      .filter((slot) => getDateKey(slot.startAt) === dayKey)
      .map((slot) => {
        const startMinute = minutesOfDay(slot.startAt);
        const endMinute = minutesOfDay(slot.endAt);
        return { slot, startMinute, endMinute };
      })
      .filter(({ startMinute, endMinute }) => Number.isFinite(startMinute) && Number.isFinite(endMinute) && endMinute > startMinute)
      .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);

    // Divide the day into independent overlap groups. A reservation that has no
    // simultaneous neighbor gets the full day column, regardless of other groups.
    const minimumVisualDuration = 24 * 60 / timelinePixelsPerHour;
    let group = [];
    let groupEndMinute = -Infinity;
    const finishGroup = () => {
      if (!group.length) return;
      const laneEnds = [];
      group.forEach((placement) => {
        const visualEndMinute = Math.max(placement.endMinute, placement.startMinute + minimumVisualDuration);
        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= placement.startMinute);
        if (lane < 0) lane = laneEnds.length;
        laneEnds[lane] = visualEndMinute;
        placement.lane = lane;
      });
      const laneCount = Math.max(1, laneEnds.length);
      group.forEach((placement) => { placement.laneCount = laneCount; });
      group = [];
      groupEndMinute = -Infinity;
    };

    placements.forEach((placement) => {
      const visualEndMinute = Math.max(placement.endMinute, placement.startMinute + minimumVisualDuration);
      if (group.length && placement.startMinute >= groupEndMinute) finishGroup();
      group.push(placement);
      groupEndMinute = Math.max(groupEndMinute, visualEndMinute);
    });
    finishGroup();

    return [dayKey, { placements }];
  })), [filteredSlots, timelinePixelsPerHour, visibleDays]);

  const exportSchedule = () => {
    const rows = [
      ['Date', 'Start', 'End', 'Trip', 'Operation', 'Status', 'Vehicle', 'Route'],
      ...filteredSlots.map((slot) => [
        getDateKey(slot.startAt),
        formatTime(slot.startAt),
        formatTime(slot.endAt),
        slot.trip?.id || '',
        getOperationLabel(slot.operationType),
        slot.status,
        slot.vehicle || '',
        slot.trip?.route || '',
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store-schedule.csv';
    link.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'info', message: 'Schedule exported successfully.' });
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (!selectedSlot) return;
    if (!newStartAt || !newEndAt || new Date(newEndAt) <= new Date(newStartAt)) {
      setToast({ type: 'error', message: 'Choose a valid end time after the start time.' });
      return;
    }

    setProcessing(true);
    try {
      await api.patch(`/store-slots/${selectedSlot._id}`, {
        startAt: new Date(newStartAt).toISOString(),
        endAt: new Date(newEndAt).toISOString(),
      });
      setShowReschedule(false);
      setToast({ type: 'success', message: 'Reservation rescheduled successfully.' });
      await fetchSchedule();
    } catch (requestError) {
      setToast({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to reschedule this reservation.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSlot) return;
    setProcessing(true);
    try {
      await api.patch(`/store-slots/${selectedSlot._id}/cancel`);
      setShowCancel(false);
      setToast({ type: 'success', message: 'Reservation cancelled successfully.' });
      await fetchSchedule();
    } catch (requestError) {
      setShowCancel(false);
      setToast({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to cancel this reservation.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const shiftView = (amount) => {
    setAnchorDate((current) => shiftDate(current, amount * (viewMode === 'week' ? 7 : 1)));
  };

  const viewLabel = viewMode === 'day'
    ? formatDate(anchorDate, { month: 'short', day: 'numeric', year: 'numeric' })
    : `${formatDate(visibleDays[0])} – ${formatDate(visibleDays[visibleDays.length - 1], { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="relative flex flex-col gap-5 pb-10 font-sans">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 flex max-w-lg items-center gap-3 rounded-lg border px-5 py-4 shadow-xl ${
          toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
            toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
              'border-blue-200 bg-blue-50 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100" aria-label="Dismiss message"><X size={16} /></button>
        </div>
      )}

      <header className="mb-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Store Schedule</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Plan, allocate and monitor inbound and outbound store reservations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportSchedule} disabled={!filteredSlots.length} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={16} /> Export Schedule
          </button>
          <button type="button" onClick={() => navigate('/store/bookings', { state: { openCreateBooking: true } })} className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F2C25]">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="TOTAL RESERVATIONS" value={scheduleData.length} note={storeName} icon={<Calendar size={16} />} tone="blue" />
        <KpiCard label="ACTIVE RESERVATIONS" value={activeCount} note="Reserved or confirmed" icon={<Clock size={16} />} tone="green" />
        <KpiCard label="INBOUND SLOTS" value={inboundCount} note="Unloading at this store" icon={<CheckCircle2 size={16} />} tone="emerald" />
        <KpiCard label="OUTBOUND SLOTS" value={outboundCount} note={`${completedCount} completed this week`} icon={<AlertCircle size={16} />} tone="amber" />
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-[#FAFBFC] p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">
                <button type="button" aria-label="Previous period" onClick={() => shiftView(-1)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><ChevronLeft size={16} /></button>
                <span className="min-w-36 text-center">{viewLabel}</span>
                <button type="button" aria-label="Next period" onClick={() => shiftView(1)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><ChevronRight size={16} /></button>
              </div>
              <button type="button" onClick={() => { setAnchorDate(new Date()); setViewMode('week'); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Today</button>
              <select aria-label="Filter reservations by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-600 outline-none">
                <option>All Statuses</option>
                {['Reserved', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}
              </select>
              <select aria-label="Filter reservations by operation" value={operationFilter} onChange={(event) => setOperationFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-600 outline-none">
                <option>All Operations</option>
                {['Loading', 'Unloading', 'Maintenance'].map((operation) => <option key={operation}>{operation}</option>)}
              </select>
              <button type="button" onClick={() => void fetchSchedule()} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"><RefreshCw size={14} /> Refresh</button>
            </div>
            <div className="flex rounded-lg bg-gray-200/70 p-1">
              {['week', 'day'].map((mode) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`rounded-md px-4 py-1.5 text-xs font-bold capitalize ${viewMode === mode ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>{mode}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-gray-500"><Loader2 size={20} className="animate-spin" /> Loading schedule…</div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <div className={viewMode === 'week' ? 'min-w-[1000px]' : 'min-w-[760px]'}>
                <div className="grid border-b border-gray-200 bg-[#FAFBFC] text-center text-xs font-bold text-gray-700" style={{ gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
                  <div className="border-r border-gray-200 py-3 text-[10px] font-medium text-gray-400">TIME</div>
                  {visibleDays.map((day) => {
                    const key = getDateKey(day);
                    const count = filteredSlots.filter((slot) => getDateKey(slot.startAt) === key).length;
                    const isToday = getDateKey(new Date()) === key;
                    return (
                      <div key={key} className={`border-r border-gray-200 py-2.5 last:border-r-0 ${isToday ? 'bg-blue-50/40 text-blue-900' : ''}`}>
                        {day.toLocaleDateString(undefined, { weekday: 'short' })} {pad(day.getDate())}
                        <span className={`mt-0.5 block text-[10px] font-medium ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>{isToday ? 'Today · ' : ''}{count} {count === 1 ? 'slot' : 'slots'}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="border-b border-gray-200 bg-white px-3 py-2 text-[10px] text-gray-500">
                  Reservation blocks span their full booked time. A reservation uses the full day column unless another reservation overlaps it.
                </p>

                <div className="grid text-xs" style={{ gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
                  <div className="relative border-r border-gray-200 bg-gray-50/50" style={{ height: `${timelineHeight}px` }}>
                    {hourLabels.slice(0, -1).map((hour) => (
                      <div key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-gray-500" style={{ top: `${(hour - timelineStartHour) * timelinePixelsPerHour}px` }}>
                        {`${pad(hour)}:00`}
                      </div>
                    ))}
                  </div>
                  {visibleDays.map((day) => {
                    const dayKey = getDateKey(day);
                    const layout = dailyLayouts.get(dayKey) || { placements: [] };
                    return (
                      <div key={dayKey} className="relative border-r border-gray-200 last:border-r-0" style={{ height: `${timelineHeight}px` }}>
                        {hourLabels.map((hour) => (
                          <div key={hour} className="pointer-events-none absolute inset-x-0 border-t border-gray-100" style={{ top: `${(hour - timelineStartHour) * timelinePixelsPerHour}px` }} />
                        ))}
                        {layout.placements.map(({ slot, startMinute, endMinute, lane, laneCount }) => {
                          const top = (startMinute - timelineStartHour * 60) * timelinePixelsPerHour / 60;
                          const height = Math.max(24, (endMinute - startMinute) * timelinePixelsPerHour / 60);
                          const laneWidth = 100 / laneCount;
                          return (
                            <button
                              key={slot._id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot._id)}
                              title={`${slot.trip?.id || 'Store slot'} · ${slot.operationType} · ${formatTime(slot.startAt)}–${formatTime(slot.endAt)} · ${slot.status}`}
                              className={`absolute z-10 overflow-hidden rounded-md border p-1.5 text-left transition-shadow hover:z-20 hover:shadow-md ${getSlotTone(slot)} ${selectedSlotId === slot._id ? 'ring-2 ring-[#173F35]/40' : ''}`}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `calc(${lane * laneWidth}% + 3px)`,
                                width: `calc(${laneWidth}% - 6px)`,
                              }}
                            >
                              <span className="flex items-center justify-between gap-1 text-[10px] font-bold">
                                <span className="truncate">{slot.trip?.id || 'Store slot'}</span>
                                <span className="shrink-0 rounded bg-white/80 px-1 py-0.5 text-[9px] font-semibold">{slot.status}</span>
                              </span>
                              <span className="block truncate text-[10px] text-gray-700">{slot.trip?.route || getOperationLabel(slot.operationType)}</span>
                              <span className="block truncate text-[9px] opacity-75">{formatTime(slot.startAt)}–{formatTime(slot.endAt)}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {!filteredSlots.length && <div className="p-10 text-center text-sm text-gray-500">No reservations match this period and filter.</div>}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 bg-gray-50/60 px-4 py-3 text-[10px] font-semibold text-gray-500">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-[#D0E2F8] bg-[#F0F7FF]" /> Outbound / Loading</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-[#A7F3D0] bg-[#ECFDF5]" /> Inbound / Unloading</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-[#FED7AA] bg-[#FFF7ED]" /> Maintenance</span>
          </div>
        </section>

        <aside className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-[#FAFBFC] px-5 py-4">
            <h2 className="font-bold text-gray-900">Reservation Details</h2>
            <p className="mt-1 text-xs text-gray-500">Select a calendar slot to see its trip information.</p>
          </div>
          {selectedSlot ? (
            <>
              <div className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Trip</p>
                    <h3 className="mt-1 text-lg font-bold text-[#173F35]">{selectedSlot.trip?.id || 'Reservation'}</h3>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">Reservation: {selectedSlot.status}</span>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 text-xs">
                  <DetailRow icon={<Calendar size={15} />} label="Date" value={formatDate(selectedSlot.startAt, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
                  <DetailRow icon={<Clock size={15} />} label="Time" value={`${formatTime(selectedSlot.startAt)} – ${formatTime(selectedSlot.endAt)}`} />
                  <DetailRow icon={<Activity size={15} />} label="Operation" value={getOperationLabel(selectedSlot.operationType)} />
                  <DetailRow icon={<Truck size={15} />} label="Vehicle" value={selectedSlot.vehicle || 'Not assigned'} />
                  <DetailRow icon={<Warehouse size={15} />} label="Reserved dock" value={selectedSlot.dockNumber ? `Dock ${selectedSlot.dockNumber}` : 'Not assigned'} />
                  <DetailRow icon={<MapPin size={15} />} label="Store" value={selectedSlot.store?.name || storeName} />
                </div>

                <div className="rounded-lg border border-gray-100 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Planned Route</p>
                  <p className="mt-1.5 text-sm font-semibold text-gray-800">{selectedSlot.trip?.route || 'Route details are not available.'}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
                    <span>Trip status:</span>
                    {selectedSlot.trip?.status ? (
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${getTripStatusTone(selectedSlot.trip.status)}`}>
                        {selectedSlot.trip.status}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-400">Unavailable</span>
                    )}
                  </div>
                </div>

                {selectedSlot.notes && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
                    <p className="mb-1 flex items-center gap-1 font-bold"><Info size={14} /> Instructions</p>
                    <p className="leading-relaxed">{selectedSlot.notes}</p>
                  </div>
                )}

                <button type="button" onClick={() => navigate('/store/trip-progress')} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173F35] py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F2C25]">
                  <Activity size={16} /> View Trip Progress
                </button>
                <div className="flex gap-2">
                  <button type="button" disabled={['Cancelled', 'Completed'].includes(selectedSlot.status) || processing} onClick={() => { setNewStartAt(toDateTimeLocal(selectedSlot.startAt)); setNewEndAt(toDateTimeLocal(selectedSlot.endAt)); setShowReschedule(true); }} className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Reschedule</button>
                  <button type="button" disabled={['Cancelled', 'Completed'].includes(selectedSlot.status) || processing} onClick={() => setShowCancel(true)} className="flex-1 rounded-lg border border-rose-200 bg-white py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel Slot</button>
                </div>
              </div>
              <div className="mt-auto border-t border-gray-100 bg-gray-50/60 px-5 py-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">This week at {storeName}</p>
                <div className="flex items-center justify-between text-xs text-gray-600"><span>Active reservations</span><span className="font-bold text-[#047857]">{activeCount}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#15803D]" style={{ width: `${scheduleData.length ? Math.min((activeCount / scheduleData.length) * 100, 100) : 0}%` }} /></div>
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center text-gray-400">
              <Calendar size={30} className="mb-3 opacity-50" />
              <p className="text-sm font-semibold text-gray-600">No reservation selected</p>
              <p className="mt-1 text-xs">Choose a slot in the calendar to view details.</p>
            </div>
          )}
        </aside>
      </div>

      {showReschedule && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleReschedule} className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <h3 className="font-bold text-gray-800">Reschedule reservation</h3>
              <button type="button" onClick={() => setShowReschedule(false)} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-gray-500">Choose a new time for <strong>{selectedSlot.trip?.id || 'this reservation'}</strong>. Store hours, capacity and overlapping slots will be checked by the server.</p>
              <label className="block text-xs font-bold text-gray-600">New start<input required type="datetime-local" value={newStartAt} onChange={(event) => setNewStartAt(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 p-2.5 text-sm font-normal" /></label>
              <label className="block text-xs font-bold text-gray-600">New end<input required type="datetime-local" value={newEndAt} onChange={(event) => setNewEndAt(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 p-2.5 text-sm font-normal" /></label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <button type="button" disabled={processing} onClick={() => setShowReschedule(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-bold text-white hover:bg-[#0F2C25] disabled:opacity-60">{processing && <Loader2 size={15} className="animate-spin" />}{processing ? 'Saving…' : 'Confirm Reschedule'}</button>
            </div>
          </form>
        </div>
      )}

      {showCancel && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertCircle size={28} /></div>
            <h3 className="text-lg font-bold text-gray-800">Cancel this reservation?</h3>
            <p className="my-3 text-sm text-gray-500">This will cancel the reservation for <strong>{selectedSlot.trip?.id || 'this trip'}</strong> and release its time slot.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={processing} onClick={() => setShowCancel(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Keep reservation</button>
              <button type="button" disabled={processing} onClick={() => void handleCancel()} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{processing && <Loader2 size={15} className="animate-spin" />}{processing ? 'Cancelling…' : 'Cancel Slot'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ label, value, note, icon, tone }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-bold tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-gray-800">{value}</p>
        <p className="mt-1 text-[10px] font-medium text-gray-400">{note}</p>
      </div>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex shrink-0 items-center gap-2 text-gray-500">{icon}{label}</span>
    <span className="text-right font-semibold text-gray-800">{value}</span>
  </div>
);

export default StoreSchedule;

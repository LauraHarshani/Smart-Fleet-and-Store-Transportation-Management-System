import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Download, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

const StoreSchedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = typeof user?.store === 'object' ? user.store?._id : user?.store;
  const [scheduleData, setScheduleData] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchedule = useCallback(async () => {
    if (!storeId) {
      setScheduleData([]);
      setError('No store is assigned to this account.');
      setLoading(false);
      return;
    }

    const params = { storeId };
    if (dateFilter) {
      params.startDate = `${dateFilter}T00:00:00`;
      params.endDate = `${dateFilter}T23:59:59`;
    }

    try {
      const response = await api.get('/schedules', { params });
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error(response.data?.message || 'Unexpected schedule response.');
      }
      setScheduleData(response.data.data);
      setError('');
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || fetchError.message || 'Failed to load schedule data.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, storeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSchedule();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSchedule]);

  const refreshSchedule = async () => {
    setLoading(true);
    setError('');
    await fetchSchedule();
  };

  const exportSchedule = () => {
    const rows = [
      ['Date', 'Start', 'End', 'Bay', 'Type', 'Status', 'Booking', 'Vehicle'],
      ...scheduleData.map((slot) => [
        slot.date,
        slot.startTime,
        slot.endTime,
        slot.bay,
        slot.type,
        slot.status,
        slot.booking?.bookingId || '',
        slot.booking?.vehicle?.registrationNumber || '',
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
  };

  const bookedCount = scheduleData.filter((slot) => slot.status === 'Booked').length;
  const availableCount = scheduleData.filter((slot) => slot.status === 'Available').length;

  return (
    <div className="relative flex flex-col gap-5 pb-10 font-sans">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Store Schedule</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            View your store&apos;s inbound and outbound time slots.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
            <CalendarDays size={16} />
            <input
              aria-label="Filter schedule by date"
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setLoading(true);
                setError('');
                setDateFilter(event.target.value);
              }}
            />
          </label>
          <button
            type="button"
            onClick={refreshSchedule}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportSchedule}
            disabled={!scheduleData.length}
            className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2C25] disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/store/new-booking')}
            className="rounded-lg bg-[#173F35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2C25]"
          >
            New Booking
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">TOTAL TIME SLOTS</p>
          <p className="mt-1 text-2xl font-bold text-[#173F35]">{scheduleData.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">BOOKED</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{bookedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">AVAILABLE</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{availableCount}</p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Scheduled Time Slots</h2>
          <span className="text-xs text-gray-500">{dateFilter || 'All dates'}</span>
        </div>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#27866A]" />
          </div>
        ) : scheduleData.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">No schedule slots found for this store.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {scheduleData.map((slot) => (
              <article key={slot._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#173F35]">{slot.booking?.bookingId || 'Store slot'}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {slot.type}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      slot.status === 'Booked'
                        ? 'bg-amber-50 text-amber-700'
                        : slot.status === 'Blocked'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {slot.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(slot.date)} · {slot.startTime}–{slot.endTime} · {slot.bay}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {slot.booking?.vehicle?.registrationNumber || 'Vehicle not assigned'}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StoreSchedule;

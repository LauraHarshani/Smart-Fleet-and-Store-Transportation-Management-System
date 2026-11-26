<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Download, Plus, Clock, CheckCircle2, AlertCircle, 
  ChevronLeft, ChevronRight, Info, Activity, X, AlertTriangle, Loader2
} from 'lucide-react';
=======
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Download, Loader2, Pencil, RefreshCw, X } from 'lucide-react';
import { cancelStoreSlot, getStoreSlots, updateStoreSlot } from '../../services/slotService';

const toLocalInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatDate = (value) => (value ? new Date(value).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}) : '—');
>>>>>>> Stashed changes

const StoreSchedule = () => {
  const navigate = useNavigate();

<<<<<<< Updated upstream
  // Modal & Toast States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // 1. Export Schedule
  const handleExport = () => {
    const scheduleData = [
      { date: '2026-11-09', time: '08:00 - 09:30', bookingId: 'BK-0830', bay: 'Bay 01', type: 'Inbound', route: 'From Kandy' },
      { date: '2026-11-11', time: '08:00 - 09:30', bookingId: 'BK-0835', bay: 'Bay 02', type: 'Inbound', route: 'From Kandy' },
      { date: '2026-11-12', time: '08:00 - 09:30', bookingId: 'BK-0839', bay: 'Bay 01', type: 'Outbound', route: 'To Jaffna' },
      { date: '2026-11-11', time: '09:30 - 11:00', bookingId: 'BK-0834', bay: 'Bay 01', type: 'Outbound', route: 'To Kandy' },
      { date: '2026-11-12', time: '09:30 - 11:00', bookingId: 'BK-0843', bay: 'Bay 03', type: 'Inbound', route: 'From Negombo' },
      { date: '2026-11-09', time: '11:00 - 12:30', bookingId: 'BK-0832', bay: 'Bay 02', type: 'Outbound', route: 'To Galle' },
      { date: '2026-11-10', time: '11:00 - 12:30', bookingId: 'BK-0837', bay: 'Bay 01', type: 'Outbound', route: 'To Negombo' },
      { date: '2026-11-11', time: '11:00 - 12:30', bookingId: 'BK-0841', bay: 'Bay 02', type: 'Inbound', route: 'From Kandy' },
      { date: '2026-11-10', time: '12:30 - 14:30', bookingId: 'BK-0836', bay: 'Bay 01', type: 'Inbound', route: 'From Galle' },
      { date: '2026-11-12', time: '12:30 - 14:30', bookingId: 'BK-0842', bay: 'Bay 01', type: 'Outbound', route: 'To Galle' },
    ];
    const headers = ['Date', 'Time Window', 'Booking ID', 'Assigned Bay', 'Type', 'Route Details'];
    const csvRows = scheduleData.map(row => [row.date, row.time, row.bookingId, row.bay, row.type, row.route]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
=======
  const fetchSlots = useCallback(async () => {
    try {
      const params = dateFilter
        ? { startDate: `${dateFilter}T00:00:00`, endDate: `${dateFilter}T23:59:59` }
        : {};
      setSlots(await getStoreSlots(params));
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load store reservations.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSlots();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSlots]);

  const refreshSlots = async () => {
    setLoading(true);
    setError('');
    await fetchSlots();
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeSlots = useMemo(
    () => slots.filter((slot) => !['Cancelled', 'Completed'].includes(slot.status)),
    [slots]
  );

  const beginEdit = (slot) => {
    setEditingSlot(slot);
    setEditStart(toLocalInput(slot.startAt));
    setEditEnd(toLocalInput(slot.endAt));
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (!editingSlot || !editStart || !editEnd) return;

    setBusy(true);
    setError('');
    try {
      await updateStoreSlot(editingSlot._id, {
        startAt: new Date(editStart).toISOString(),
        endAt: new Date(editEnd).toISOString(),
      });
      setEditingSlot(null);
      setToast('Reservation rescheduled. Store hours and dock availability were checked.');
      await fetchSlots();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Could not reschedule this reservation.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (slot) => {
    if (!window.confirm(`Cancel reservation ${slot.id}?`)) return;

    setBusy(true);
    setError('');
    try {
      await cancelStoreSlot(slot._id);
      setToast(`Reservation ${slot.id} cancelled.`);
      await fetchSlots();
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || 'Could not cancel this reservation.');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Reservation', 'Store', 'Trip', 'Operation', 'Start', 'End', 'Vehicle', 'Status'],
      ...slots.map((slot) => [
        slot.id,
        slot.store?.name || '',
        slot.trip?.id || '',
        slot.operationType,
        slot.startAt,
        slot.endAt,
        slot.vehicle,
        slot.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
>>>>>>> Stashed changes
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Store_Schedule_Nov_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Schedule exported successfully as CSV.');
  };

  const handleNewBooking = () => navigate('/store/new-booking');
  const handleViewProgress = () => navigate('/store/trip-progress');

  // 2. Reschedule Action
  const handleRescheduleConfirm = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsRescheduleOpen(false);
      showToast('success', 'Booking BK-0841 has been rescheduled successfully.');
    }, 1000);
  };

  // 3. Cancel Slot Action
  const handleCancelConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCancelOpen(false);
      showToast('error', 'Booking BK-0841 has been cancelled.');
      // In a real app, you would remove the booking from the state here
    }, 1000);
  };

  return (
<<<<<<< Updated upstream
    <div className="flex flex-col gap-5 font-sans pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl border animate-in slide-in-from-top-2 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-600" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-600" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-600" />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-5">
=======
    <div className="relative flex flex-col gap-5 pb-10 font-sans">
      {toast && (
        <div role="status" className="fixed right-6 top-6 z-40 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 shadow-lg">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
>>>>>>> Stashed changes
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Store Schedule</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Plan, allocate bays, and monitor inbound & outbound logistical time windows.</p>
        </div>
<<<<<<< Updated upstream
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <Download size={16} /> Export Schedule
          </button>
          <button 
            onClick={handleNewBooking}
            className="flex items-center gap-2 px-4 py-2 bg-[#173F35] text-white rounded-lg text-sm font-semibold hover:bg-[#0F2C25] transition-colors shadow-sm"
          >
            <Plus size={16} /> New Booking
=======
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
            <CalendarDays size={16} />
            <input
              aria-label="Filter reservations by date"
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
            onClick={refreshSlots}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!slots.length}
            className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2C25] disabled:opacity-50"
          >
            <Download size={16} />
            Export
>>>>>>> Stashed changes
          </button>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">TOTAL BOOKINGS</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-800">16</p>
              <span className="text-[11px] font-medium text-gray-500">(8 active)</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">9 - 15 Nov 2026</p>
=======
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">RESERVATIONS</p>
          <p className="mt-1 text-2xl font-bold text-[#173F35]">{slots.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">ACTIVE</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{activeSlots.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500">CANCELLED</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">
            {slots.filter((slot) => slot.status === 'Cancelled').length}
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Store Reservations</h2>
          <span className="text-xs text-gray-500">{dateFilter || 'All dates'}</span>
        </div>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#27866A]" />
          </div>
        ) : slots.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">No reservations found for this store.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {slots.map((slot) => {
              const editable = !['Cancelled', 'Completed'].includes(slot.status);
              const statusClass = slot.status === 'Cancelled'
                ? 'bg-red-50 text-red-700'
                : slot.status === 'Completed'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-emerald-50 text-emerald-700';

              return (
                <article key={slot._id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#173F35]">{slot.id}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{slot.status}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{slot.operationType}</span>
                    </div>
                    <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
                      <p><span className="font-semibold text-gray-800">Store:</span> {slot.store?.name || '—'}</p>
                      <p>
                        <span className="font-semibold text-gray-800">Trip:</span> {slot.trip?.id || '—'}
                        {slot.trip?.route ? ` · ${slot.trip.route}` : ''}
                      </p>
                      <p><span className="font-semibold text-gray-800">Vehicle:</span> {slot.vehicle || '—'}</p>
                      <p className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {formatDate(slot.startAt)} – {new Date(slot.endAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {slot.notes && <p className="mt-2 text-xs text-gray-500">{slot.notes}</p>}
                  </div>
                  {editable && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => beginEdit(slot)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Reschedule
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleCancel(slot)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel reservation
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
>>>>>>> Stashed changes
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Calendar size={16} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">INBOUND SCHEDULED</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#15803D]">07</p>
              <span className="text-[11px] font-medium text-gray-500">(4 active bays)</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Kandy & Negombo</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Clock size={16} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">OUTBOUND DISPATCHED</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#1D4ED8]">05</p>
              <span className="text-[11px] font-medium text-gray-500">(On schedule)</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Galle & Kandy routes</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">AVAILABLE CAPACITY</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-800">04</p>
              <span className="text-[11px] font-medium text-gray-500">(Open windows)</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Ready for allocation</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <AlertCircle size={16} />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-5 items-start">
        
        {/* Calendar Section */}
        <div className="flex-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
           
           <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-[#FAFBFC]">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft size={16}/></button>
                  <span>9 - 15 Nov 2026</span>
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={16}/></button>
                </div>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded-lg text-xs font-medium px-2 py-1.5 bg-white outline-none cursor-pointer text-gray-600"><option>Colombo Store</option></select>
                  <select className="border border-gray-300 rounded-lg text-xs font-medium px-2 py-1.5 bg-white outline-none cursor-pointer text-gray-600"><option>All Slots</option></select>
                  <select className="border border-gray-300 rounded-lg text-xs font-medium px-2 py-1.5 bg-white outline-none cursor-pointer text-gray-600"><option>All Bays</option></select>
                </div>
             </div>
             <div className="flex bg-gray-200/70 p-1 rounded-lg">
               <button className="px-4 py-1 bg-white shadow-sm rounded-md text-xs font-bold text-gray-800">Week</button>
               <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:text-gray-800">Day</button>
             </div>
           </div>

           <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-gray-200 bg-[#FAFBFC] text-xs font-bold text-gray-700 text-center">
              <div className="py-3 border-r border-gray-200 text-gray-400 font-medium">TIME</div>
              <div className="py-3 border-r border-gray-200">Mon 09<br/><span className="text-[10px] text-gray-400 font-medium mt-0.5 block">3 slots booked</span></div>
              <div className="py-3 border-r border-gray-200">Tue 10<br/><span className="text-[10px] text-gray-400 font-medium mt-0.5 block">2 slots booked</span></div>
              <div className="py-3 border-r border-gray-200">Wed 11<br/><span className="text-[10px] text-gray-400 font-medium mt-0.5 block">4 slots booked</span></div>
              <div className="py-3 border-r border-gray-200 bg-blue-50/40 text-blue-900">Thu 12 <span className="text-[9px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded ml-1">+</span><br/><span className="text-[10px] text-blue-500 font-medium mt-0.5 block">Today • 3 slots</span></div>
              <div className="py-3">Fri 13<br/><span className="text-[10px] text-gray-400 font-medium mt-0.5 block">-</span></div>
           </div>

           <div className="grid grid-cols-[70px_repeat(5,1fr)] text-xs relative">
              <div className="border-b border-r border-gray-200 p-2 text-gray-500 font-medium text-right bg-gray-50/30">08:00<br/><span className="text-[10px] text-gray-400 font-normal">|</span></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0830 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Kandy</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0835 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 02</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Kandy</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 02</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0839 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">To Jaffna</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Outbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-gray-200 p-1.5"></div>

              <div className="border-b border-r border-gray-200 p-2 text-gray-500 font-medium text-right bg-gray-50/30">09:30<br/><span className="text-[10px] text-gray-400 font-normal">|</span></div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                 <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0834 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">To Kandy</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Outbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                 <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0843 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 03</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Neg...</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 03</p>
                </div>
              </div>
              <div className="border-b border-gray-200 p-1.5"></div>

              <div className="border-b border-r border-gray-200 p-2 text-[#E11D48] font-bold text-right bg-[#FFF1F2] flex flex-col justify-center items-end">
                <span>11:00</span>
                <span className="text-[10px] font-medium opacity-80">|</span>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0832 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 02</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">To Galle</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Outbound x Bay 02</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0837 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">To Negombo</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Outbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                 <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#047857] text-[11px] flex justify-between">BK-0841 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#047857]">Bay 02</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Kandy</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 02</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-gray-200 p-1.5"></div>

              <div className="absolute top-[80px] left-0 w-[14px] h-[2px] bg-[#E11D48] z-10">
                <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full absolute -left-0.5 -top-[2px]"></div>
              </div>

              <div className="border-b border-r border-gray-200 p-2 text-gray-500 font-medium text-right bg-gray-50/30">12:30<br/><span className="text-[10px] text-gray-400 font-normal">|</span></div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0836 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Galle</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0842 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">To Galle</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Outbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-gray-200 p-1.5"></div>

              <div className="border-b border-r border-gray-200 p-2 text-gray-500 font-medium text-right bg-gray-50/30">14:30<br/><span className="text-[10px] text-gray-400 font-normal">|</span></div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0833 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 02</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Neg...</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 02</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                 <div className="border border-dashed border-gray-300 w-full h-full rounded-md flex items-center justify-center text-[10px] text-gray-400 cursor-pointer hover:bg-gray-50">+ Available</div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5">
                <div className="bg-[#F0F7FF] border border-[#D0E2F8] rounded-md p-2 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <p className="font-bold text-[#1D4ED8] text-[11px] flex justify-between">BK-0838 <span className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded text-[#1D4ED8]">Bay 01</span></p>
                  <p className="text-[10px] text-gray-700 mt-1.5 font-medium">From Galle</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Inbound x Bay 01</p>
                </div>
              </div>
              <div className="border-b border-r border-gray-200 p-1.5"></div>
              <div className="border-b border-gray-200 p-1.5"></div>
           </div>

           <div className="p-3 bg-[#FAFBFC] flex justify-between items-center text-[10px] text-gray-600 font-medium">
              <div className="flex gap-5 items-center">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#15803D] rounded-sm"></div> Inbound Delivery</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#1D4ED8] rounded-sm"></div> Outbound Pickup</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-300 rounded-sm"></div> Open Window</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#E11D48] rounded-sm"></div> Active Inspector</div>
              </div>
              <p className="text-gray-400">Store hours 08:00 - 17:00 • 90-minute booking windows</p>
           </div>
        </div>

        {/* Right Side Panel - Booking Details */}
        <div className="w-[320px] bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-5 flex flex-col shrink-0">
           
           <div className="border-b border-gray-100 pb-4">
             <div className="flex justify-between items-center mb-1.5">
               <h3 className="font-bold text-gray-800 text-lg">BK-0841</h3>
               <span className="text-[10px] bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-md font-bold">In Transit</span>
             </div>
             <p className="text-[11px] text-gray-500 font-medium">Thursday, 12 Nov 2026</p>
           </div>

           <div className="py-4 border-b border-gray-100">
             <p className="text-sm font-bold text-gray-800 mb-1">10:00 - 12:30</p>
             <p className="text-xs text-gray-500 font-medium">Mount Lavinia • Bay 02 • 90 min</p>
           </div>

           <div className="py-4 border-b border-gray-100">
             <p className="text-[10px] font-bold text-gray-400 mb-4 tracking-wider">ROUTE TIMELINE</p>
             <div className="text-sm text-gray-700 space-y-4 relative before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-200">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white ring-2 ring-white"></div> 
                  <span className="font-medium">Origin: Kandy Depot</span>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white ring-2 ring-white"></div> 
                  <span className="font-medium">Checkpoint #2: Nittambuwa</span>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white ring-2 ring-white"></div> 
                  <span className="font-medium text-green-700">Destination: Colombo Central</span>
                </div>
             </div>
           </div>

           <div className="text-[11px] space-y-2.5 border-b border-gray-100 py-4">
             <div className="flex justify-between"><span className="text-gray-400 font-medium">Vehicle</span> <span className="font-semibold text-gray-800">WP LH-4521 (Isuzu ELF)</span></div>
             <div className="flex justify-between"><span className="text-gray-400 font-medium">Assigned Driver</span> <span className="font-semibold text-gray-800">Nimal Perera</span></div>
             <div className="flex justify-between"><span className="text-gray-400 font-medium">Driver Phone</span> <span className="font-semibold text-gray-800">+94 77 234 5678</span></div>
             <div className="flex justify-between"><span className="text-gray-400 font-medium">Cargo/Manifest</span> <span className="font-semibold text-gray-800">Tea & Spices • 1,850 kg</span></div>
           </div>

           <div className="bg-[#F0F9FF] p-3 rounded-lg border border-[#BAE6FD] text-[11px] text-[#0369A1] my-4">
             <p className="font-bold mb-1 flex items-center gap-1"><Info size={14}/> Depot Instructions</p>
             <p className="leading-relaxed opacity-90">Keep Bay 02 clear 10 mins prior. Requires electric forklift with clamp attachment.</p>
           </div>

           {/* ACTION BUTTONS */}
           <div className="space-y-2 mt-auto">
             <button 
               onClick={handleViewProgress}
               className="w-full py-2.5 bg-[#173F35] text-white rounded-lg text-sm font-semibold hover:bg-[#0F2C25] transition-colors flex items-center justify-center gap-2 shadow-sm"
             >
               <Activity size={16}/> View Trip Progress
             </button>
             <div className="flex gap-2">
               <button 
                 onClick={() => setIsRescheduleOpen(true)} 
                 className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 bg-white transition-colors"
               >
                 Reschedule
               </button>
               <button 
                 onClick={() => setIsCancelOpen(true)} 
                 className="flex-1 py-2 border border-gray-300 text-[#E11D48] rounded-lg text-xs font-semibold hover:bg-[#FFF1F2] transition-colors"
               >
                 Cancel Slot
               </button>
             </div>
           </div>

           <div className="border-t border-gray-100 pt-4 mt-5">
             <div className="flex justify-between items-end mb-3">
               <p className="text-[10px] font-bold text-gray-500 tracking-wider">BAY LOAD (COLOMBO)</p>
               <span className="text-[10px] font-bold text-[#047857] bg-green-50 px-1.5 py-0.5 rounded">75% Utilized</span>
             </div>
             
             <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-[10px] font-medium text-gray-700 mb-1"><span>Bay 01 (Outbound)</span> <span className="text-gray-400">7/8 booked</span></div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#15803D] rounded-full w-[85%]"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[10px] font-medium text-gray-700 mb-1"><span>Bay 02 (Inbound)</span> <span className="text-gray-400">7/8 booked</span></div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full w-[75%]"></div></div>
               </div>
             </div>
           </div>

        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Reschedule Booking</h3>
              <button onClick={() => setIsRescheduleOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <form onSubmit={handleRescheduleConfirm}>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-500">Select a new date and time for <strong className="text-gray-800">BK-0841</strong>.</p>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">New Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" defaultValue="2026-11-13" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">New Time Slot</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                    <option>08:00 - 09:30</option>
                    <option>09:30 - 11:00</option>
                    <option>11:00 - 12:30</option>
                    <option>14:30 - 16:00</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRescheduleOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm font-bold text-white bg-[#173F35] rounded-lg hover:bg-[#0F2C25] flex items-center gap-2">
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Cancel Slot Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Slot?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to cancel <strong className="text-gray-800">BK-0841</strong>? This action cannot be undone and will free up the bay for other carriers.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCancelOpen(false)} 
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50"
                >
                  No, Keep it
                </button>
                <button 
                  onClick={handleCancelConfirm} 
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Cancel Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< Updated upstream
=======
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleReschedule} className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-bold text-gray-900">Reschedule reservation</h2>
                <p className="mt-1 text-xs text-gray-500">{editingSlot.id}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditingSlot(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-sm font-medium text-gray-700">
                Start time
                <input
                  required
                  type="datetime-local"
                  value={editStart}
                  onChange={(event) => setEditStart(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                End time
                <input
                  required
                  type="datetime-local"
                  value={editEnd}
                  onChange={(event) => setEditEnd(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
                />
              </label>
              <p className="text-xs text-gray-500">
                The backend will reject times outside operating hours or when dock capacity is exceeded.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-bold text-white hover:bg-[#0F2C25] disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
};

export default StoreSchedule;
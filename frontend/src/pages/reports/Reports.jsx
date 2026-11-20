import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronLeft,
  ChevronRight, Download, FileText, Search, ShieldCheck, Truck,
} from 'lucide-react';
import api from '../../services/api';

const auditPageSize = 10;

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const formatDetails = (details) => {
  if (!details) return '—';
  if (typeof details === 'string') return details;
  if (typeof details !== 'object') return String(details);
  return Object.entries(details).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`).join(' · ');
};

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function MetricCard({ title, value, description, icon: Icon, tone }) {
  const tones = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <div className={`rounded-lg p-2 ${tones[tone]}`}><Icon size={18} /></div>
    </div>
  );
}

function Reports() {
  const [summary, setSummary] = useState(null);
  const [bookingReport, setBookingReport] = useState(null);
  const [vehicleUtilization, setVehicleUtilization] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPages, setAuditPages] = useState(0);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState('');

  useEffect(() => {
    let active = true;
    const loadReportData = async () => {
      setReportLoading(true);
      setReportError('');
      const results = await Promise.allSettled([
        api.get('/reports/summary'),
        api.get('/reports/bookings'),
        api.get('/reports/vehicle-utilization'),
      ]);
      if (!active) return;
      const failures = [];
      if (results[0].status === 'fulfilled') setSummary(results[0].value.data.data);
      else failures.push('summary');
      if (results[1].status === 'fulfilled') setBookingReport(results[1].value.data.data);
      else failures.push('booking');
      if (results[2].status === 'fulfilled') setVehicleUtilization(results[2].value.data.data || []);
      else failures.push('vehicle utilization');
      if (failures.length) setReportError(`Unable to load ${failures.join(', ')} report data.`);
      setReportLoading(false);
    };
    loadReportData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuditPage(1);
      setAuditSearch(searchTerm.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;
    const loadAuditLogs = async () => {
      setAuditLoading(true);
      setAuditError('');
      try {
        const response = await api.get('/audit-logs', {
          params: { page: auditPage, limit: auditPageSize, search: auditSearch },
        });
        if (!active) return;
        setAuditLogs(response.data.data || []);
        setAuditTotal(response.data.total || 0);
        setAuditPages(response.data.pages || 0);
      } catch (error) {
        if (!active) return;
        setAuditError(error.response?.data?.message || 'Unable to load audit records.');
        setAuditLogs([]);
        setAuditTotal(0);
        setAuditPages(0);
      } finally {
        if (active) setAuditLoading(false);
      }
    };
    loadAuditLogs();
    return () => { active = false; };
  }, [auditPage, auditSearch]);

  const bookingBars = useMemo(() => {
    const rows = [
      ['Completed', bookingReport?.completed || 0, 'bg-emerald-700'],
      ['Approved', bookingReport?.approved || 0, 'bg-emerald-500'],
      ['Pending', bookingReport?.pending || 0, 'bg-amber-500'],
      ['Cancelled', bookingReport?.cancelled || 0, 'bg-slate-400'],
      ['Rejected', bookingReport?.rejected || 0, 'bg-rose-500'],
      ['Delayed trips', bookingReport?.delayed || 0, 'bg-orange-500'],
    ];
    return rows;
  }, [bookingReport]);

  const maxBookingCount = Math.max(1, ...bookingBars.map(([, value]) => value));
  const auditStart = auditTotal ? (auditPage - 1) * auditPageSize + 1 : 0;
  const auditEnd = Math.min(auditPage * auditPageSize, auditTotal);

  const exportCsv = () => {
    const columns = ['Timestamp', 'Action', 'Entity type', 'Entity ID', 'Operator', 'Details'];
    const rows = auditLogs.map((log) => [
      formatTimestamp(log.timestamp), log.action, log.entityType, log.entityId,
      log.performedBy?.name || log.performedBy?.email || 'System', formatDetails(log.details),
    ]);
    const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-page-${auditPage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">LogiFleet / Audit &amp; Reports</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-800">Reports &amp; Operational Audit</h1>
          <p className="text-sm text-gray-500">Live operational metrics and recorded audit activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} disabled={!auditLogs.length} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={14} /> Export current page
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-[#0B2B26] px-4 py-2 text-sm font-medium text-white hover:bg-[#164B41]">
            <FileText size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {reportError && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{reportError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard title="TOTAL OPERATIONS" value={reportLoading ? '…' : (summary?.totalOperations ?? 0).toLocaleString()} description="All bookings and trips" icon={CheckCircle2} tone="green" />
        <MetricCard title="ON-TIME TRIP RATE" value={reportLoading ? '…' : (summary?.onTimeSLA || '0.0%')} description="Completed vs delayed trips · 30 days" icon={ShieldCheck} tone="green" />
        <MetricCard title="FLEET UTILIZATION" value={reportLoading ? '…' : (summary?.fleetUtilization || '0.0%')} description="Average vehicle trip time · 30 days" icon={Truck} tone="blue" />
        <MetricCard title="AUDIT EXCEPTION RATE" value={reportLoading ? '…' : (summary?.auditExceptionRate || '0.0%')} description="Exceptions, deviations, and alerts" icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Booking &amp; Trip Outcomes</h2>
            <span className="text-xs text-gray-500">{bookingReport?.totalBookings ?? 0} bookings</span>
          </div>
          <p className="mb-5 text-xs text-gray-500">Current record counts by status.</p>
          <div className="space-y-3">
            {bookingBars.map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-gray-600">{label}</span><span className="font-semibold text-gray-800">{value}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${(value / maxBookingCount) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Vehicle Utilization</h2>
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <p className="mb-5 text-xs text-gray-500">Measured from recorded trip start and end times.</p>
          {vehicleUtilization.length ? (
            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {vehicleUtilization.map((vehicle) => (
                <div key={vehicle.vehicleId || vehicle.registrationNumber}>
                  <div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-gray-600">{vehicle.registrationNumber || vehicle.vehicleId} · {vehicle.type}</span><span className="shrink-0 font-semibold text-gray-800">{vehicle.utilizationPercentage}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#0B2B26]" style={{ width: `${Math.min(100, Math.max(0, vehicle.utilizationPercentage || 0))}%` }} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-center">
              <Activity size={20} className="mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">No vehicle trip data</p>
              <p className="mt-1 text-xs text-gray-400">Recorded trip start and end times are needed to calculate utilization.</p>
            </div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Audit Log</h2>
            <p className="mt-0.5 text-xs text-gray-500">{auditTotal.toLocaleString()} recorded events</p>
          </div>
          <label className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Search action, entity, or ID…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
          </label>
        </div>

        {auditError && <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{auditError}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3 font-bold">Timestamp</th><th className="px-4 py-3 font-bold">Action</th><th className="px-4 py-3 font-bold">Entity</th><th className="px-4 py-3 font-bold">Operator</th><th className="px-4 py-3 font-bold">Details</th>
            </tr></thead>
            <tbody className="text-sm">
              {auditLoading ? <tr><td colSpan="5" className="py-10 text-center text-sm text-gray-500">Loading audit records…</td></tr> : auditLogs.length === 0 ? <tr><td colSpan="5" className="py-10 text-center text-sm text-gray-500">{auditError ? 'Audit records could not be loaded.' : 'No matching audit records.'}</td></tr> : auditLogs.map((log) => {
                const isAlert = /exception|deviation|alert/i.test(log.action || '');
                return <tr key={log._id} className="border-b border-gray-50 align-top hover:bg-gray-50/70">
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-600">{formatTimestamp(log.timestamp)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${isAlert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{log.action || 'Event'}</span></td>
                  <td className="px-4 py-4"><div className="font-semibold text-gray-800">{log.entityType || 'Entity'}</div><div className="mt-0.5 text-xs text-gray-500">{log.entityId || '—'}</div></td>
                  <td className="px-4 py-4 text-gray-700">{log.performedBy?.name || log.performedBy?.email || 'System'}</td>
                  <td className="max-w-sm px-4 py-4 text-xs leading-relaxed text-gray-600">{formatDetails(log.details)}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 p-4">
          <p className="text-xs text-gray-500">Showing <span className="font-bold text-gray-800">{auditStart}–{auditEnd}</span> of <span className="font-bold text-gray-800">{auditTotal}</span></p>
          <div className="flex items-center gap-2">
            <button onClick={() => setAuditPage((page) => Math.max(1, page - 1))} disabled={auditPage <= 1 || auditLoading} className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40" aria-label="Previous audit page"><ChevronLeft size={18} /></button>
            <span className="min-w-20 text-center text-xs font-semibold text-gray-700">Page {auditPages ? auditPage : 0} of {auditPages}</span>
            <button onClick={() => setAuditPage((page) => Math.min(auditPages, page + 1))} disabled={auditPage >= auditPages || auditLoading} className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40" aria-label="Next audit page"><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;

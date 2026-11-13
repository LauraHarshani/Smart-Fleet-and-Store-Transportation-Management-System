import { useState } from 'react';
import jsPDF from 'jspdf';

const reportStats = [
  { label: 'TOTAL OPERATIONS', value: '1,482', trend: '+4.4% vs last period', tone: 'emerald' },
  { label: 'ON-TIME FLEET', value: '96.8%', trend: '+1.3% above target', tone: 'sky' },
  { label: 'FUEL CAPACITY UTILIZATION', value: '88.4%', trend: 'Balanced distribution', tone: 'amber' },
  { label: 'AUDIT EXCEPTION RATE', value: '1.2%', trend: '0.6% reduction', tone: 'rose' },
];

const slaTrend = [
  { label: 'Week 1', value: 94.2 },
  { label: 'Week 2', value: 96.1 },
  { label: 'Week 3', value: 97.4 },
  { label: 'Week 4', value: 96.8 },
];

const slaBenchmark = 95;

const activityRows = [
  { timestamp: '2026-10-28 14:32:04', type: 'Route Override', asset: 'R-884', operator: 'Dispatch', notes: 'Route deviation approved after traffic alert', status: 'Verified', tone: 'green' },
  { timestamp: '2026-10-28 18:12:22', type: 'Inspection Warning', asset: 'DRV-301', operator: 'Safety', notes: 'Inspection flagged due to brake temperature', status: 'Pending Review', tone: 'amber' },
  { timestamp: '2026-10-28 13:45:15', type: 'Capacity Exceeded', asset: 'TK-108', operator: 'System', notes: 'Capacity threshold exceeded by 14%', status: 'Verified', tone: 'green' },
  { timestamp: '2026-10-28 12:10:59', type: 'Driver Reassigned', asset: 'DRV-312', operator: 'Ops', notes: 'Driver reassigned for rest compliance', status: 'Logged', tone: 'blue' },
  { timestamp: '2026-10-28 10:05:08', type: 'Seal Integrity', asset: 'SL-552', operator: 'Gate', notes: 'Seal integrity confirmed at gate checkpoint', status: 'Verified', tone: 'green' },
];

const csvColumns = [
  { label: 'Timestamp', key: 'timestamp' },
  { label: 'Event Type', key: 'type' },
  { label: 'Asset', key: 'asset' },
  { label: 'Operator', key: 'operator' },
  { label: 'Operational Notes', key: 'notes' },
  { label: 'Status', key: 'status' },
];

const escapeCsvValue = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const pillClasses = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-sky-100 text-sky-700',
};

const Reports = () => {
  const [exportMessage, setExportMessage] = useState('');

  const handleExportCsv = () => {
    const csvRows = [
      csvColumns.map(({ label }) => escapeCsvValue(label)).join(','),
      ...activityRows.map((row) =>
        csvColumns.map(({ key }) => escapeCsvValue(row[key])).join(',')
      ),
    ];
    const csv = `\uFEFF${csvRows.join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logifleet-operational-audit.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportMessage('CSV report downloaded.');
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(23, 63, 53);
    doc.text('LogiFleet - Reports & Operational Audit', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    reportStats.forEach((stat) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 63, 53);
      doc.text(`${stat.label}: ${stat.value}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(stat.trend, margin + 75, y);
      y += 7;
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(23, 63, 53);
    doc.text('Operational Audit Log', margin, y);
    y += 8;

    const columns = [
      { key: 'timestamp', label: 'Timestamp', width: 36 },
      { key: 'type', label: 'Event Type', width: 37 },
      { key: 'asset', label: 'Asset', width: 25 },
      { key: 'operator', label: 'Operator', width: 28 },
      { key: 'notes', label: 'Operational Notes', width: 105 },
      { key: 'status', label: 'Status', width: 35 },
    ];
    const rowHeight = 12;

    const drawTableHeader = () => {
      doc.setFillColor(232, 242, 236);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(23, 63, 53);
      let x = margin + 2;
      columns.forEach((column) => {
        doc.text(column.label, x, y);
        x += column.width;
      });
      y += 9;
    };

    drawTableHeader();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);

    activityRows.forEach((row) => {
      if (y + rowHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 5;
        drawTableHeader();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(55, 65, 81);
      }

      let x = margin + 2;
      columns.forEach((column) => {
        const lines = doc.splitTextToSize(String(row[column.key]), column.width - 3);
        doc.text(lines[0] ?? '', x, y);
        x += column.width;
      });
      doc.setDrawColor(229, 235, 231);
      doc.line(margin, y + 3, pageWidth - margin, y + 3);
      y += rowHeight;
    });

    doc.save('logifleet-operational-audit.pdf');
    setExportMessage('PDF report downloaded.');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E2E8E0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              LogiFleet / Audit & Reports
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#173F35]">Reports & Operational Audit</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Comprehensive compliance review, delivery SLA monitoring, and operational logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg bg-[#0b3d34] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0d4d40]"
            >
              Download PDF
            </button>
          </div>
        </div>
        {exportMessage && (
          <p role="status" aria-live="polite" className="mt-3 text-xs font-medium text-emerald-700">
            {exportMessage}
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#E5EBE7] bg-[#F9FBFA] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">{stat.label}</p>
                <div className={`h-8 w-8 rounded-lg ${
                  stat.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  stat.tone === 'sky' ? 'bg-sky-100 text-sky-700' :
                  stat.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                } flex items-center justify-center`}>
                  <span className="text-[11px] font-bold">↗</span>
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-[#173F35]">{stat.value}</p>
              <p className="mt-2 text-xs text-[#64748B]">{stat.trend}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8E0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row">
          <div className="min-w-0 flex-1 rounded-xl border border-[#E2E8E0] bg-[#F9FBFA] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#173F35]">SLA Performance Trend</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                Target {slaBenchmark.toFixed(1)}%
              </span>
            </div>
            <div className="mt-5 flex h-52 gap-3" role="img" aria-label="Weekly on-time delivery SLA: Week 1 94.2%, Week 2 96.1%, Week 3 97.4%, Week 4 96.8%. Target is 95%.">
              <div className="flex w-8 shrink-0 flex-col justify-between pb-7 text-right text-[10px] text-[#64748B]" aria-hidden="true">
                {[100, 80, 60, 40, 20, 0].map((value) => (
                  <span key={value}>{value}%</span>
                ))}
              </div>
              <div className="relative min-w-0 flex-1">
                <div className="absolute inset-x-0 bottom-7 top-0">
                  <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                    {[100, 80, 60, 40, 20, 0].map((value) => (
                      <div key={value} className="border-t border-[#DCE5ED]" />
                    ))}
                  </div>
                  <div
                    className="absolute inset-x-0 z-10 border-t border-dashed border-emerald-600"
                    style={{ bottom: `${slaBenchmark}%` }}
                    aria-hidden="true"
                  >
                    <span className="absolute right-0 -top-4 rounded bg-white px-1 text-[9px] font-semibold text-emerald-700">
                      95% Benchmark
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-end justify-around">
                    {slaTrend.map((item) => (
                      <div key={item.label} className="relative flex h-full w-[15%] min-w-8 flex-col justify-end">
                        <span className="absolute left-1/2 z-10 -translate-x-1/2 text-[10px] font-bold text-white" style={{ top: `calc(100% - ${item.value}% + 5px)` }}>
                          {item.value}%
                        </span>
                        <div
                          className="w-full rounded-t-md bg-[#087653] shadow-sm"
                          style={{ height: `${item.value}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-around">
                  {slaTrend.map((item) => (
                    <span key={item.label} className="w-[15%] text-center text-[10px] font-medium text-[#52627A]">
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md rounded-xl border border-[#E2E8E0] bg-[#F9FBFA] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#173F35]">Fleet Capacity & Utilization</h3>
              <span className="text-xs text-[#64748B]">Live</span>
            </div>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Cold Chain Fleet', value: '96.8%', color: 'bg-emerald-500' },
                { label: 'Retail Store Pickup', value: '92.4%', color: 'bg-emerald-400' },
                { label: 'Emergency Support', value: '87.1%', color: 'bg-amber-400' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-[#475569]">
                    <span>{row.label}</span>
                    <span className="font-semibold text-[#173F35]">{row.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200">
                    <div className={`h-2.5 rounded-full ${row.color}`} style={{ width: row.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8E0] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value="Search operational, vehicle, operators..."
              readOnly
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none"
            />
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">Status</button>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">Event Type</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">All</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase text-gray-600">Verified</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase text-gray-600">Pending</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.1em] text-[#64748B]">
                <th className="px-3 py-2 font-semibold">Timestamp</th>
                <th className="px-3 py-2 font-semibold">Event Type</th>
                <th className="px-3 py-2 font-semibold">Asset</th>
                <th className="px-3 py-2 font-semibold">Operator</th>
                <th className="px-3 py-2 font-semibold">Operational Notes</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => (
                <tr key={row.timestamp} className="rounded-xl bg-[#F8FAF8] text-sm text-gray-700 shadow-sm">
                  <td className="rounded-l-xl px-3 py-3">{row.timestamp}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${pillClasses[row.tone]}`}>{row.type}</span></td>
                  <td className="px-3 py-3 font-medium text-[#173F35]">{row.asset}</td>
                  <td className="px-3 py-3">{row.operator}</td>
                  <td className="px-3 py-3 text-[#64748B]">{row.notes}</td>
                  <td className="rounded-r-xl px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${row.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState } from 'react';
import { 
  Download, FileText, Search, Filter, 
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const auditData = [
    { id: 1, time: "2026-10-28 14:32:04", type: "Route Override", target: "TRP-884", operator: "Sara Lin", note: "Closure on Galle Road. Reassigned to internal route via Battaramulla.", status: "Verified" },
    { id: 2, time: "2026-10-28 14:18:22", type: "Inspection Warning", target: "DRV-301", operator: "Policy Monitor", note: "Driver rest violation warning at 4h 12m.", status: "Pending Review" },
    { id: 3, time: "2026-10-28 13:45:10", type: "Capacity Exception", target: "TK-105", operator: "Nimal Perera", note: "+3.2% volume overage approved by duty manager.", status: "Verified" },
    { id: 4, time: "2026-10-28 12:10:55", type: "Driver Mismatch", target: "TRP-879", operator: "Dilshan Silva", note: "Shift swap: Kamal J. assigned to prime mover WP-879.", status: "Logged" },
    { id: 5, time: "2026-10-28 10:05:18", type: "Seal Integrity", target: "SL-852", operator: "Gate 03 Scanner", note: "NFC tamper seal verified intact on dispatch.", status: "Verified" },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">LogiFleet / Audit & Reports</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Reports & Operational Audit</h1>
          <p className="text-sm text-gray-500">Comprehensive compliance review, delivery SLA monitoring, and operational logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 bg-white">
            Oct 01 - Oct 31, 2026
          </button>
          <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium bg-white">
            <option>Western Province Hub</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 bg-white">
            <Download size={14} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#0B2B26] text-white rounded-lg text-sm font-medium hover:bg-[#164B41]">
            <FileText size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">TOTAL OPERATIONS</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">1,482</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ 4.2% vs last period</p>
          </div>
          <div className="p-2 bg-gray-50 text-gray-400 rounded-lg"><CheckCircle2 size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">ON-TIME SLA DELIVERY</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">96.8%</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ 1.2% above 95% target</p>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">FLEET CAPACITY UTILIZATION</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">88.4%</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ 2.1% vs last period</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Filter size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">AUDIT EXCEPTION RATE</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">1.2%</p>
            <p className="text-xs text-red-500 font-medium mt-1">↓ 0.3% reduction</p>
          </div>
          <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={18} /></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* SLA Trends Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-sm">SLA Performance Trends</h3>
            <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">Target 95.0%</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Weekly on-time delivery vs 95.0% target</p>
          
          <div className="flex items-end justify-between h-32 px-4 pb-2 border-b border-gray-100">
            {[94.2, 96.1, 97.4, 96.8].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-12">
                <div className="w-full bg-[#0B2B26] rounded-t-sm" style={{ height: `${val}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2 text-[10px] text-gray-400">
            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
          </div>
        </div>

        {/* Depot Capacity */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">Depot Capacity & Utilization</h3>
          <p className="text-xs text-gray-500 mb-6">Dock bay utilization and gate activity</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-700">Pelayagoda Logistics Center</span>
                <span className="text-gray-900 font-bold">84.6%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0B2B26] rounded-full w-[84.6%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-700">Colombo Central Depot</span>
                <span className="text-gray-900 font-bold">92.4%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0B2B26] rounded-full w-[92.4%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-700">Kelaniya Sorting Facility</span>
                <span className="text-gray-900 font-bold">85.1%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0B2B26] rounded-full w-[85.1%]"></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 w-1/2">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search operations, vehicles, operators..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none">
              <option>EVENT: ALL EVENTS</option>
              <option>EVENT: OVERRIDE</option>
              <option>EVENT: INSPECTION</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none">
              <option>STATUS: ALL STATUSES</option>
              <option>STATUS: VERIFIED</option>
              <option>STATUS: PENDING</option>
            </select>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button className="px-4 py-1 text-xs font-bold bg-[#0B2B26] text-white rounded-md">All (428)</button>
            <button className="px-4 py-1 text-xs font-medium text-gray-600 hover:text-gray-900">Overrides</button>
            <button className="px-4 py-1 text-xs font-medium text-gray-600 hover:text-gray-900">Pending</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-gray-400 bg-gray-50 border-b border-gray-100 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Event Type</th>
                <th className="py-3 px-4 font-bold">Target Entity</th>
                <th className="py-3 px-4 font-bold">Operator</th>
                <th className="py-3 px-4 font-bold">Operational Notes</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {auditData.filter(item => item.note.toLowerCase().includes(searchTerm.toLowerCase())).map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-600 font-medium">{row.time}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      row.type.includes('Override') ? 'bg-amber-100 text-amber-700' :
                      row.type.includes('Warning') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-800">{row.target}</td>
                  <td className="py-4 px-4 text-gray-700">{row.operator}</td>
                  <td className="py-4 px-4 text-gray-500 text-xs max-w-xs">{row.note}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      row.status === 'Verified' ? 'text-green-600' : 
                      row.status === 'Pending Review' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {row.status === 'Verified' && <CheckCircle2 size={14} />}
                      {row.status === 'Pending Review' && <AlertTriangle size={14} />}
                      {row.status === 'Logged' && <FileText size={14} />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <p className="text-xs text-gray-500">Showing <span className="font-bold text-gray-800">1 - 5</span> of <span className="font-bold text-gray-800">428</span> audit records</p>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-200 text-gray-500"><ChevronLeft size={16} /></button>
            <button className="w-6 h-6 rounded bg-[#0B2B26] text-white text-xs font-bold flex items-center justify-center">1</button>
            <button className="w-6 h-6 rounded hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center">2</button>
            <button className="w-6 h-6 rounded hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center">3</button>
            <span className="text-gray-400 text-xs px-1">...</span>
            <button className="w-6 h-6 rounded hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center">Next</button>
            <button className="p-1 rounded hover:bg-gray-200 text-gray-500"><ChevronRight size={16} /></button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;

import { useMemo, useState } from "react";
import {
  Search,
  ClipboardList,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  CalendarDays,
  Clock,
  Filter,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample approval history
const approvalHistory = [
  {
    id: 1,
    bookingId: "BK-10492",
    store: "Colombo Main Store",
    action: "Approved",
    previousStatus: "Pending",
    newStatus: "Approved",
    reviewedBy: "Admin User",
    date: "2026-11-10",
    time: "10:30 AM",
    note: "Booking approved for dispatch.",
  },
  {
    id: 2,
    bookingId: "BK-10488",
    store: "Kandy Branch",
    action: "Changes Requested",
    previousStatus: "Pending",
    newStatus: "Changes Requested",
    reviewedBy: "Admin User",
    date: "2026-11-10",
    time: "09:45 AM",
    note: "Please confirm the requested delivery time.",
  },
  {
    id: 3,
    bookingId: "BK-10485",
    store: "Galle Warehouse",
    action: "Rejected",
    previousStatus: "In Review",
    newStatus: "Rejected",
    reviewedBy: "Operations Manager",
    date: "2026-11-09",
    time: "03:20 PM",
    note: "Insufficient information provided for this booking.",
  },
  {
    id: 4,
    bookingId: "BK-10479",
    store: "Colombo Main Store",
    action: "Approved",
    previousStatus: "Pending",
    newStatus: "Approved",
    reviewedBy: "Operations Manager",
    date: "2026-11-09",
    time: "11:15 AM",
    note: "All booking details verified.",
  },
  {
    id: 5,
    bookingId: "BK-10475",
    store: "Kandy Branch",
    action: "Changes Requested",
    previousStatus: "In Review",
    newStatus: "Changes Requested",
    reviewedBy: "Admin User",
    date: "2026-11-08",
    time: "02:10 PM",
    note: "Please update the item quantities.",
  },
];

const actionStyles = {
  Approved: {
    color: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
  Rejected: {
    color: "bg-red-50 text-red-700",
    icon: XCircle,
  },
  "Changes Requested": {
    color: "bg-orange-50 text-orange-700",
    icon: RefreshCcw,
  },
};

function ActionBadge({ action }) {
  const config = actionStyles[action] || actionStyles.Approved;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.color}`}
    >
      <Icon size={13} />
      {action}
    </span>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-[#E2E8E0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

const BookingApprovalLog = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredLogs = useMemo(() => {
    return approvalHistory.filter((log) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        log.bookingId.toLowerCase().includes(search) ||
        log.store.toLowerCase().includes(search) ||
        log.reviewedBy.toLowerCase().includes(search);

      const matchesAction =
        selectedAction === "All" || log.action === selectedAction;

      const matchesDate =
        !selectedDate || log.date === selectedDate;

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [searchTerm, selectedAction, selectedDate]);

  const approvedCount = approvalHistory.filter(
    (log) => log.action === "Approved"
  ).length;

  const rejectedCount = approvalHistory.filter(
    (log) => log.action === "Rejected"
  ).length;

  const changesCount = approvalHistory.filter(
    (log) => log.action === "Changes Requested"
  ).length;

  return (
    <div className="min-h-full space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#173F35]">
            Approval Log
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Track booking approval decisions and review activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#27866A]"
        >
          <ArrowLeft size={16} />
          Back to Booking Review
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Decisions"
          value={approvalHistory.length}
          icon={ClipboardList}
          color="bg-[#E8F2ED] text-[#27866A]"
        />

        <SummaryCard
          title="Approved Bookings"
          value={approvedCount}
          icon={CheckCircle2}
          color="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Rejected Bookings"
          value={rejectedCount}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#E2E8E0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter size={16} />
          Filter Approval History
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search booking, store or admin..."
              className="h-10 w-full rounded-lg bg-[#F1F4F2] pl-10 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#27866A]/20"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 rounded-lg bg-[#F1F4F2] px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#27866A]/20"
          >
            <option value="All">All Actions</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Changes Requested">Changes Requested</option>
          </select>

          <div className="relative">
            <CalendarDays
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-full rounded-lg bg-[#F1F4F2] pl-10 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#27866A]/20"
            />
          </div>
        </div>
      </div>

      {/* Approval History Table */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8E0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              Approval History
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredLogs.length} records found
            </p>
          </div>

          <span className="rounded-lg bg-[#E8F2ED] px-3 py-1.5 text-xs font-semibold text-[#205648]">
            {changesCount} Changes Requested
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#F7F9F7]">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Status Change</th>
                <th className="px-5 py-3">Reviewed By</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Reviewer Note</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-[#FAFCFA]"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-[#205648]">
                        {log.bookingId}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-gray-700">
                      {log.store}
                    </td>

                    <td className="px-5 py-4">
                      <ActionBadge action={log.action} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                          {log.previousStatus}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-800">
                          {log.newStatus}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-gray-700">
                      {log.reviewedBy}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <CalendarDays size={13} className="text-gray-400" />
                        {log.date}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Clock size={12} />
                        {log.time}
                      </div>
                    </td>

                    <td className="max-w-[220px] px-5 py-4 text-xs leading-5 text-gray-600">
                      {log.note || "No note provided"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <ClipboardList
                      size={32}
                      className="mx-auto text-gray-300"
                    />
                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      No approval records found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingApprovalLog;

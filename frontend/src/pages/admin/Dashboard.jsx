
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardData } from '../../services/dataService';
import {
  Truck,
  Route,
  CalendarCheck,
  CircleCheck,
  AlertTriangle,
  MapPin,
  Store,
  MoreVertical,
} from "lucide-react";


// මෝක් දත්ත

const stats = [
  {
    title: "Active Vehicles",
    value: "10",
    description: "Currently on road",
    icon: Truck,
    iconColor: "text-[#07865F]",
    iconBg: "bg-[#E2F4EC]",
  },
  {
    title: "Today's Trips",
    value: "26",
    description: "Scheduled for today",
    icon: Route,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#E8F0FF]",
  },
  {
    title: "Pending Bookings",
    value: "12",
    description: "Awaiting approval",
    icon: CalendarCheck,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FFF1DB]",
  },
  {
    title: "Delayed Trips",
    value: "02",
    description: "Currently behind schedule",
    icon: AlertTriangle,
    iconColor: "text-[#DC2626]",
    iconBg: "bg-[#FEECEC]",
  },
  {
    title: "Completed Trips",
    value: "08",
    description: "Successfully completed",
    icon: CircleCheck,
    iconColor: "text-[#07865F]",
    iconBg: "bg-[#E2F4EC]",
  },
];

const tripStatus = [
  { label: "Completed", count: 14, color: "#087653" },
  { label: "In Progress", count: 6, color: "#B5D6A7" },
  { label: "Pending", count: 4, color: "#FFB765" },
  { label: "Delayed", count: 2, color: "#FF4848" },
];

const utilization = [
  { label: "Week 1", value: 40 },
  { label: "Week 2", value: 60 },
  { label: "Week 3", value: 70 },
  { label: "Week 4", value: 100 },
];

const upcomingTrips = [
  {
    id: "TR-159",
    route: "Colombo → Kandy",
    vehicle: "VH-020",
    time: "10:00 AM",
    status: "Scheduled",
  },
  {
    id: "TR-160",
    route: "Colombo → Galle",
    vehicle: "VH-031",
    time: "11:25 AM",
    status: "Delayed",
  },
  {
    id: "TR-152",
    route: "Kandy → Galle",
    vehicle: "VH-026",
    time: "05:10 PM",
    status: "Assigned",
  },
  {
    id: "TR-151",
    route: "Galle → Colombo",
    vehicle: "VH-016",
    time: "08:30 AM",
    status: "In Progress",
  },
  {
    id: "TR-150",
    route: "Galle → Kandy",
    vehicle: "VH-012",
    time: "03:45 PM",
    status: "Completed",
  },
];

const recentBookings = [
  {
    id: "BK-10490",
    store: "Colombo Store",
    items: "85 Units",
    date: "08 Nov 2026",
    status: "Approved",
  },
  {
    id: "BK-10489",
    store: "Kandy Store",
    items: "120 Units",
    date: "08 Nov 2026",
    status: "Cancelled",
  },
  {
    id: "BK-10485",
    store: "Galle Store",
    items: "56 Units",
    date: "15 Nov 2026",
    status: "Rejected",
  },
  {
    id: "BK-10482",
    store: "Colombo Store",
    items: "175 Units",
    date: "16 Nov 2026",
    status: "Pending",
  },
  {
    id: "BK-10480",
    store: "Kandy Store",
    items: "36 Units",
    date: "20 Nov 2026",
    status: "Pending",
  },
];

// නැවත භාවිතා කළ හැකි කොමපොනට්‌ස්

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-[#E2E8E0] rounded-xl shadow-[0_2px_5px_rgba(15,45,35,0.10)] ${className}`}
  >
    {children}
  </div>
);

const CardHeading = ({ title, action, to }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-semibold text-[#173F35]">
      {title}
    </h2>

    {action && (
      <Link
        to={to}
        className="text-xs font-semibold text-[#07865F] hover:text-[#065F46] transition-colors"
      >
        {action}
      </Link>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Scheduled: "bg-[#DCFCE7] text-[#166534]",
    Delayed: "bg-[#FEE2E2] text-[#B91C1C]",
    Assigned: "bg-[#DBEAFE] text-[#1D4ED8]",
    "In Progress": "bg-[#E0F2FE] text-[#0369A1]",
    Completed: "bg-[#D1FAE5] text-[#047857]",
    Approved: "bg-[#DCFCE7] text-[#166534]",
    Cancelled: "bg-[#E2E8F0] text-[#475569]",
    Rejected: "bg-[#FEE2E2] text-[#B91C1C]",
    Pending: "bg-[#FEF3C7] text-[#92400E]",
  };

  return (
    <span
      className={`inline-flex justify-center min-w-[82px] px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

// KPI කාඩ්‌ස්

const StatCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <Card className="p-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-[#40516A] whitespace-nowrap">
          {item.title}
        </h3>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
        >
          <Icon size={19} className={item.iconColor} />
        </div>
      </div>

      <p className="text-2xl font-bold text-[#173F35] mt-2">
        {item.value}
      </p>

      <p className="text-[11px] text-[#64748B] mt-4">
        {item.description}
      </p>
    </Card>
  );
};

// TRIP STATUS DONUT CHART

const TripStatusChart = ({ tripStatus = [] }) => {
  const total = tripStatus.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const gradient = tripStatus.reduce(
    (result, item) => {
      const start = result.currentPercentage;
      const end = start + (item.count / total) * 100;

      result.segments.push(
        `${item.color} ${start}% ${end}%`
      );

      return {
        currentPercentage: end,
        segments: result.segments,
      };
    },
    {
      currentPercentage: 0,
      segments: [],
    }
  ).segments.join(", ");

  return (
    <Card className="p-5 h-full">
      <CardHeading title="Trip Status (Today)" />

      <div className="flex items-center justify-center gap-8 py-2">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `conic-gradient(${gradient})`,
          }}
        >
          <div className="w-[98px] h-[98px] rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-base font-bold text-black">
              {total}
            </span>
            <span className="text-sm font-bold text-black">
              Trips
            </span>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          {tripStatus.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3"
            >
              <span
                className="w-3.5 h-3.5 rounded shrink-0"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-xs text-gray-800 min-w-[72px]">
                {item.label}
              </span>

              <span className="text-xs font-medium text-gray-800">
                {item.count}
              </span>

              <span className="text-xs text-[#64748B]">
                ({((item.count/total)*100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


// VEHICLE UTILIZATION CHART

const VehicleUtilizationChart = ({ utilization = [] }) => (
  <Card className="p-5 h-full">
    <CardHeading title="Vehicle Utilization" />

    <div className="relative h-[185px] mt-1 pl-10 pr-3">
      <div className="absolute inset-0 left-10 right-3 top-0 bottom-7 flex flex-col justify-between">
        {[100, 80, 60, 40, 20, 0].map((value) => (
          <div
            key={value}
            className="w-full border-t border-[#DCE5ED]"
          />
        ))}
      </div>

      <div className="absolute left-0 top-0 bottom-7 flex flex-col justify-between">
        {[100, 80, 60, 40, 20, 0].map((value) => (
          <span
            key={value}
            className="text-[10px] font-semibold text-[#52627A] -translate-y-1/2"
          >
            {value}%
          </span>
        ))}
      </div>

      <div className="absolute left-10 right-3 top-0 bottom-0 flex justify-around items-end">
        {utilization.map((item, index) => (
          <div
            key={item.label}
            className="flex flex-col items-center h-full justify-end w-12"
          >
            <div className="relative w-full flex-1 flex items-end">
              <div className="absolute inset-x-0 bottom-0 top-0 bg-[#E7F3EB] rounded-t-full" />

              <div
                className="relative w-full rounded-t-full flex items-start justify-center pt-2 z-10"
                style={{
                  height: `${item.value}%`,
                  backgroundColor:
                    index === 3
                      ? "#075D3E"
                      : index === 2
                      ? "#16A34A"
                      : index === 1
                      ? "#43B77F"
                      : "#27866A",
                }}
              >
                <span className="text-[10px] font-bold text-white">
                  {item.value}%
                </span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-[#52627A] mt-2 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

// LIVE TRACKING MAP

const LiveTrackingMap = () => (
  <Card className="p-5 h-full">
    <CardHeading
      title="Live Tracking"
      action="View Map"
      to="/live-tracking"
    />

    <div className="relative h-[250px] rounded-lg overflow-hidden bg-[#EAF1E9] border border-[#E2E8E0]">
      {/* Decorative map background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(35deg, transparent 46%, #FFFFFF 47%, #FFFFFF 49%, transparent 50%), linear-gradient(125deg, transparent 46%, #FFFFFF 47%, #FFFFFF 49%, transparent 50%)",
          backgroundSize: "100px 85px",
        }}
      />

      {/* Planned routes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 250"
        preserveAspectRatio="none"
      >
        <path
          d="M 70 190 Q 180 40 290 110 T 520 65"
          fill="none"
          stroke="#27866A"
          strokeWidth="4"
          strokeDasharray="8 6"
        />

        <path
          d="M 70 190 Q 230 210 370 140 T 520 65"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
      </svg>

      {/* Store markers */}
      {[
        { name: "Colombo", x: "12%", y: "72%" },
        { name: "Kandy", x: "46%", y: "36%" },
        { name: "Galle", x: "82%", y: "23%" },
      ].map((store) => (
        <div
          key={store.name}
          className="absolute flex flex-col items-center"
          style={{ left: store.x, top: store.y }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-[#27866A]">
            <MapPin size={17} className="text-[#27866A]" />
          </div>

          <span className="mt-1 text-xs font-semibold text-[#173F35] bg-white/90 px-2 py-1 rounded-md shadow-sm">
            {store.name}
          </span>
        </div>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow-sm px-3 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs text-[#475569]">
          Active vehicle route
        </span>
      </div>

      <div className="absolute top-3 right-3 bg-white rounded-lg shadow-sm px-3 py-2">
        <span className="text-xs font-medium text-[#173F35]">
          Map Preview
        </span>
      </div>
    </div>
  </Card>
);

// UPCOMING TRIPS TABLE

const UpcomingTrips = ({ trips = [] }) => (
  <Card className="p-5 h-full">
    <CardHeading
      title="Upcoming Trips"
      action="View All"
      to="/trip-planning"
    />

    <div className="overflow-x-auto">
      <table className="w-full min-w-[430px]">
        <tbody>
          {trips.map((trip) => (
            <tr
              key={trip.id}
              className="border-t border-[#E2E8E0] hover:bg-[#FAFCFA]"
            >
              <td className="py-2 pl-3 pr-2">
                <p className="text-[11px] font-semibold text-[#205648]">
                  {trip.id}
                </p>
                <p className="text-[10px] text-[#718096] mt-0.5">
                  {trip.route}
                </p>
              </td>

              <td className="py-2 px-2">
                <div className="flex items-center gap-1.5">
                  <Truck size={13} className="text-[#27866A]" />
                  <span className="text-[10px] text-[#475569] whitespace-nowrap">
                    {trip.vehicle}
                  </span>
                </div>
              </td>

              <td className="py-2 px-2 text-[10px] text-[#475569] whitespace-nowrap">
                {trip.time}
              </td>

              <td className="py-2 pl-2 pr-1 text-right">
                <StatusBadge status={trip.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// RECENT BOOKINGS TABLE

const RecentBookings = ({ bookings = [] }) => {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <Card className="p-5 h-full">
      <CardHeading
        title="Recent Bookings"
        action="View All"
        to="/bookings"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[570px] text-left">
          <thead>
            <tr className="bg-[#F0F4F1] text-[#52627A] text-[11px]">
              <th className="px-3 py-3 rounded-l-xl font-semibold">
                Booking ID
              </th>
              <th className="px-3 py-3 font-semibold">Store</th>
              <th className="px-3 py-3 font-semibold">Items</th>
              <th className="px-3 py-3 font-semibold">Schedule Date</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 rounded-r-xl" />
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5EBE6]">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-[#FAFCFA] transition-colors"
              >
                <td className="px-3 py-3 text-[11px] font-semibold text-[#07865F]">
                  {booking.id}
                </td>

                <td className="px-3 py-3 text-[11px] text-[#718096] whitespace-nowrap">
                  {booking.store}
                </td>

                <td className="px-3 py-3 text-[11px] text-[#718096] whitespace-nowrap">
                  {booking.items}
                </td>

                <td className="px-3 py-3 text-[11px] text-[#718096] whitespace-nowrap">
                  {booking.date}
                </td>

                <td className="px-3 py-3">
                  <StatusBadge status={booking.status} />
                </td>

                <td className="px-3 py-3 relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(
                        openMenu === booking.id ? null : booking.id
                      )
                    }
                    className="p-1 text-[#64748B] hover:text-[#173F35] rounded"
                    aria-label={`Actions for ${booking.id}`}
                  >
                    <MoreVertical size={17} />
                  </button>

                  {openMenu === booking.id && (
                    <div className="absolute right-7 top-7 z-20 bg-white border border-[#E2E8E0] rounded-lg shadow-lg w-32 py-1">
                      <Link
                        to="/bookings"
                        onClick={() => setOpenMenu(null)}
                        className="block px-3 py-2 text-xs text-[#475569] hover:bg-[#F5F7F2]"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// QUICK ACTIONS

const quickActions = [
  {
    title: "Create Booking",
    icon: CalendarCheck,
    to: "/bookings",
  },
  {
    title: "Plan a Trip",
    icon: Route,
    to: "/trip-planning",
  },
  {
    title: "Add Vehicle",
    icon: Truck,
    to: "/vehicles",
  },
  {
    title: "Add Store",
    icon: Store,
    to: "/stores",
  },
];

const QuickActions = () => (
  <Card className="p-5 h-full flex flex-col">
    <h2 className="text-sm font-semibold text-gray-900 mb-5">
      Quick Actions
    </h2>

    <div className="flex flex-col gap-3 flex-1">
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.title}
            to={action.to}
            className="flex items-center gap-3 w-full min-h-[58px] px-4 py-2.5 border border-[#07865F] bg-[#E8F4EC] hover:bg-[#D8EDE0] rounded-xl transition-colors"
          >
            <Icon
              size={19}
              className="text-[#07865F] shrink-0"
            />

            <span className="text-xs font-medium text-[#205648]">
              {action.title}
            </span>
          </Link>
        );
      })}
    </div>
  </Card>
);

// MAIN DASHBOARD

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats,
    tripStatus,
    utilization,
    upcomingTrips,
    recentBookings,
  });

  useEffect(() => {
    let active = true;

    fetchDashboardData().then((data) => {
      if (active && data) {
        setDashboardData({
          stats: data.stats ?? stats,
          tripStatus: data.tripStatus ?? tripStatus,
          utilization: data.utilization ?? utilization,
          upcomingTrips: data.upcomingTrips ?? upcomingTrips,
          recentBookings: data.recentBookings ?? recentBookings,
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-5 pb-4">

      {/* PAGE HEADING */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#173F35]">
            Dashboard Overview
          </h2>

          <p className="text-sm text-[#64748B] mt-1">
            Welcome back, Admin. Here's what's happening with your fleet today.
          </p>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3.5">
        {dashboardData.stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </section>

      {/* TRIP STATUS + UTILIZATION */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <TripStatusChart tripStatus={dashboardData.tripStatus} />
        <VehicleUtilizationChart utilization={dashboardData.utilization} />
      </section>

      {/* LIVE TRACKING + UPCOMING TRIPS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <LiveTrackingMap />
        <UpcomingTrips trips={dashboardData.upcomingTrips} />
      </section>

      {/* RECENT BOOKINGS + QUICK ACTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_0.8fr] gap-3.5">
        <RecentBookings bookings={dashboardData.recentBookings} />
        <QuickActions />
      </section>

    </div>
  );
};

export default Dashboard;

import api from './api';

const dashboardMock = {
  stats: [
    { title: 'Active Vehicles', value: '10', description: 'Currently on road', icon: 'Truck', iconColor: 'text-[#07865F]', iconBg: 'bg-[#E2F4EC]' },
    { title: "Today's Trips", value: '26', description: 'Scheduled for today', icon: 'Route', iconColor: 'text-[#2563EB]', iconBg: 'bg-[#E8F0FF]' },
    { title: 'Pending Bookings', value: '12', description: 'Awaiting approval', icon: 'CalendarCheck', iconColor: 'text-[#D97706]', iconBg: 'bg-[#FFF1DB]' },
    { title: 'Delayed Trips', value: '02', description: 'Currently behind schedule', icon: 'AlertTriangle', iconColor: 'text-[#DC2626]', iconBg: 'bg-[#FEECEC]' },
    { title: 'Completed Trips', value: '08', description: 'Successfully completed', icon: 'CircleCheck', iconColor: 'text-[#07865F]', iconBg: 'bg-[#E2F4EC]' },
  ],
  tripStatus: [
    { label: 'Completed', count: 14, color: '#087653' },
    { label: 'In Progress', count: 6, color: '#B5D6A7' },
    { label: 'Pending', count: 4, color: '#FFB765' },
    { label: 'Delayed', count: 2, color: '#FF4848' },
  ],
  utilization: [
    { label: 'Week 1', value: 40 },
    { label: 'Week 2', value: 60 },
    { label: 'Week 3', value: 70 },
    { label: 'Week 4', value: 100 },
  ],
  upcomingTrips: [
    { id: 'TR-159', route: 'Colombo → Kandy', vehicle: 'VH-020', time: '10:00 AM', status: 'Scheduled' },
    { id: 'TR-160', route: 'Colombo → Galle', vehicle: 'VH-031', time: '11:25 AM', status: 'Delayed' },
    { id: 'TR-152', route: 'Kandy → Galle', vehicle: 'VH-026', time: '05:10 PM', status: 'Assigned' },
    { id: 'TR-151', route: 'Galle → Colombo', vehicle: 'VH-016', time: '08:30 AM', status: 'In Progress' },
    { id: 'TR-150', route: 'Galle → Kandy', vehicle: 'VH-012', time: '03:45 PM', status: 'Completed' },
  ],
  recentBookings: [
    { id: 'BK-10490', store: 'Colombo Store', items: '85 Units', date: '08 Nov 2026', status: 'Approved' },
    { id: 'BK-10489', store: 'Kandy Store', items: '120 Units', date: '08 Nov 2026', status: 'Cancelled' },
    { id: 'BK-10485', store: 'Galle Store', items: '56 Units', date: '15 Nov 2026', status: 'Rejected' },
    { id: 'BK-10482', store: 'Colombo Store', items: '175 Units', date: '16 Nov 2026', status: 'Pending' },
    { id: 'BK-10480', store: 'Kandy Store', items: '36 Units', date: '20 Nov 2026', status: 'Pending' },
  ],
};

export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    if (response?.data?.stats) return response.data;
  } catch (error) {
    console.info('Dashboard API unavailable, using mock dashboard data.');
  }

  return dashboardMock;
};

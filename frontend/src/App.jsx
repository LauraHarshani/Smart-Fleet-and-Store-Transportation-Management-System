import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';

// Admin paths
import AdminLayout from './layouts/AdminLayout';

// Pages
import Dashboard from './pages/admin/Dashboard';
import TripPlanner from './pages/admin/TripPlanner';
import Reports from './pages/reports/Reports';
import Login from './pages/Login';
import Bookings from './pages/admin/Bookings';
import Users from './pages/admin/Users'; 
import Stores from './pages/admin/Stores';
import Vehicles from './pages/admin/Vehicles';
import Items from './pages/admin/Items';
import Profile from './pages/admin/Profile';
import Schedules from './pages/admin/Schedules';
import LiveTracking from './pages/admin/LiveTracking';
import BookingApprovalLog from './pages/admin/BookingApprovalLog';

// Store paths
import StoreLayout from './layouts/StoreLayout';
import StoreBookings from './pages/store/StoreBookings';
import GoodsHandling from './pages/store/GoodsHandling';
import GoodsConfirmation from './pages/store/GoodsConfirmation';

// Temporary page for sections that do not have a screen yet
const PlaceholderPage = ({ title }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-[#173F35]">{title}</h2>
    <p className="mt-3 text-sm text-gray-600">
      This section is ready for the next UI implementation step.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route element={<AuthGuard allowedRoles={['System Administrator']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/approval-log" element={<BookingApprovalLog />} />
            <Route path="/trip-planning" element={<TripPlanner />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/live-tracking" element={<LiveTracking />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<PlaceholderPage title="Drivers" />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/items" element={<Items />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Store routes */}
        <Route element={<AuthGuard allowedRoles={['Store Manager', 'Store Employee']} />}>
          <Route path="/store" element={<StoreLayout />}>
            <Route path="bookings" element={<StoreBookings />} />
            <Route path="goods-handling" element={<GoodsHandling />} />
            <Route path="goods-confirmation/:bookingId" element={<GoodsConfirmation />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
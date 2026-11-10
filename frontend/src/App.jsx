import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/Login';
import Bookings from './pages/admin/Bookings';
import Schedules from './pages/admin/Schedules';
import LiveTracking from './pages/admin/LiveTracking';
import BookingApprovalLog from './pages/admin/BookingApprovalLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard allowedRoles={['System Administrator']} />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path='bookings' element={<Bookings/>} />
            <Route path='schedules' element={<Schedules/>} />
            <Route path='live-tracking' element={<LiveTracking />} />
            <Route path='approval-log' element={<BookingApprovalLog/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;

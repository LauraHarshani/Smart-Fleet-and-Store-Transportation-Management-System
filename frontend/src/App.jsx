import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AuthGuard allowedRoles={['System Administrator']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/users" element={<Users />} /> 
            <Route path="/stores" element={<Stores />} />
            <Route path="/vehicles" element={<Vehicles />} /> 
            <Route path="/items" element={<Items />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path='bookings' element={<Bookings/>} />
            <Route path='schedules' element={<Schedules/>} />
            <Route path='live-tracking' element={<LiveTracking />} />
            <Route path='approval-log' element={<BookingApprovalLog/>} />
          </Route>
        </Route>

        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

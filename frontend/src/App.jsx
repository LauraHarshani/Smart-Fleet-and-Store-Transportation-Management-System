import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';

//admin paths
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

//Store paths
import StoreLayout from './layouts/StoreLayout';
import StoreBookings from './pages/store/StoreBookings';
import GoodsHandling from './pages/store/GoodsHandling';
import GoodsConfirmation from './pages/store/GoodsConfirmation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*default Routes*/}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/*Admin routes*/}
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

        {/*Store routes*/}
        <Route element={<AuthGuard allowedRoles={['Store Manager','Store Employee']} />}>
          <Route path='/store' element={<StoreLayout/>}>
            <Route path='bookings' element={<StoreBookings/>} />
            <Route path='goods-handling' element={<GoodsHandling/>} />
            <Route path='goods-confirmation/:bookingId' element={<GoodsConfirmation/>} />
          </Route>
        </Route>

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

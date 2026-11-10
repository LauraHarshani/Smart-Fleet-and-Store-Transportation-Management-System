import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Dashboard from './pages/admin/Dashboard';
import TripPlanner from './pages/admin/TripPlanner';
import Reports from './pages/reports/Reports';

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
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<PlaceholderPage title="Bookings" />} />
          <Route path="/trip-planning" element={<TripPlanner />} />
          <Route path="/schedules" element={<PlaceholderPage title="Vehicle Schedules" />} />
          <Route path="/live-tracking" element={<PlaceholderPage title="Live Tracking" />} />
          <Route path="/vehicles" element={<PlaceholderPage title="Vehicles" />} />
          <Route path="/drivers" element={<PlaceholderPage title="Drivers" />} />
          <Route path="/stores" element={<PlaceholderPage title="Stores" />} />
          <Route path="/items" element={<PlaceholderPage title="Items" />} />
          <Route path="/users" element={<PlaceholderPage title="Users" />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
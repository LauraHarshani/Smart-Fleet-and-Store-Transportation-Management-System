import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './layouts/AdminLayout';

const Login = () => <div className="p-10 text-2xl font-bold">Login Page</div>;
const Dashboard = () => <div className="text-2xl font-bold">Dashboard Content</div>;

function App() {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('role', 'System Administrator');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard allowedRoles={['System Administrator']} />}>
            <Route element={<AdminLayout />}><Route path="/dashboard" element={<Dashboard />} /></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
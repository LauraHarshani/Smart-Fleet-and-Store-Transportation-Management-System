import { Navigate, Outlet } from 'react-router-dom';
const AuthGuard = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); 
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/unauthorized" replace />;
    return <Outlet />;
};
export default AuthGuard;
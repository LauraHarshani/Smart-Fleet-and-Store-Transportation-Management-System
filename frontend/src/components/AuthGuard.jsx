import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Check whether the user is logged in.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user's role is permitted.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;

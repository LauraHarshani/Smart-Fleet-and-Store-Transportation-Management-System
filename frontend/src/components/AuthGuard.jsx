import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthGuard = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Check whether the user is logged in.
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Checking your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user's role is permitted.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;

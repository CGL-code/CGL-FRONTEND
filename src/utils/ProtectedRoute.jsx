import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  // Only allow admins to access "/admin" and "/write"
  if ((location.pathname === "/admin" || location.pathname === "/write") && user.userType !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;

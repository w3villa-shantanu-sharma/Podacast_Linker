import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect to unauthorized page if user is authenticated but not admin
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Redirect to login if not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and is admin
  return children;
}
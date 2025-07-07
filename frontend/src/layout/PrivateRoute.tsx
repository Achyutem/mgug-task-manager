import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom"; // Import useLocation
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Get the current location

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Pass the original location in the state
    // 'replace' prevents the login page from being added to the browser history
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

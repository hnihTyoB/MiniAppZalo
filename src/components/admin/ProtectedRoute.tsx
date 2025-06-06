import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, Spinner } from "zmp-ui";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log(
    "ProtectedRoute - isLoading:",
    isLoading,
    "isAuthenticated:",
    isAuthenticated,
    "user:",
    user
  );

  if (isLoading) {
    return (
      <Box
        flex
        justifyContent="center"
        alignItems="center"
        className="h-screen"
      >
        <Spinner visible />
      </Box>
    );
  }

  const allowedRoles: string[] = ["admin", "branch_manager"];
  if (!isAuthenticated || !user || !user.role || !allowedRoles.includes(user.role)) {
    console.log(
      "Redirecting to /login due to unauthorized access",
      "user:",
      user,
      "allowedRoles:",
      allowedRoles
    );
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
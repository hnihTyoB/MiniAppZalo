// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // <<< Import useAuth
import { Box, Spinner } from "zmp-ui"; // <<< Import Spinner để hiển thị trạng thái loading

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth(); // <<< Lấy state từ context

  if (isLoading) {
    // <<< Hiển thị loading indicator trong khi chờ kiểm tra auth
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

  // <<< Cho phép cả admin và branch_manager truy cập vào khu vực admin >>>
  const allowedRoles: string[] = ["admin", "branch_manager"];
  if (!isAuthenticated || !user?.role || !allowedRoles.includes(user.role)) {
    // Nếu chưa đăng nhập hoặc role không hợp lệ, chuyển hướng
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập và có role phù hợp, cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;

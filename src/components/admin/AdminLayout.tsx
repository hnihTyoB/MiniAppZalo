import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { API_BASE_URL } from "../../config/api"; 

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingBookingCount, setPendingBookingCount] = useState<number>(0);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
      roles: ["admin", "branch_manager"],
    },
    {
      icon: Users,
      label: "Nhân viên",
      path: "/admin/users",
      roles: ["admin", "branch_manager"],
    },
    {
      icon: Wrench,
      label: "Dịch vụ",
      path: "/admin/services",
      roles: ["admin", "branch_manager"],
    },
    {
      icon: Building2,
      label: "Chi nhánh",
      path: "/admin/branches",
      roles: ["admin", "branch_manager"], 
    },
    {
      icon: CalendarCheck,
      label: "Lịch hẹn",
      path: "/admin/bookings",
      roles: ["admin", "branch_manager"],
    },
    {
      icon: Settings,
      label: "Cấu hình",
      path: "/admin/settings",
      roles: ["admin", "branch_manager"],
    },
  ];

  const accessibleSidebarItems = sidebarItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user) return;

      console.log("Fetching pending booking count for role:", user.role);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token.");

        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu.");
        const data = await response.json();
        setPendingBookingCount(user.role === "admin" ? data.pendingBookings : data.pendingBookings || 0);
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    fetchPendingCount();
  }, [user]);

  return (
    <div className="relative flex h-screen bg-gray-100 overflow-hidden mt-4">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-lg flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="p-4 border-b flex flex-col items-center justify-center min-h-[65px] mt-4">
          <div className="text-sm text-gray-600 mt-1">
            Chào, <span className="font-medium">{user?.name || "Admin"}</span>!
          </div>
        </div>
        <nav className="flex-grow p-2 space-y-1">
          {accessibleSidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={clsx(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                location.pathname.startsWith(item.path)
                  ? "bg-orange-100 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{item.label}</span>
              {item.path === "/admin/bookings" && pendingBookingCount > 0 && (
                <span
                  className="ml-auto inline-block py-0.5 px-1.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded text-xs"
                  title={`${pendingBookingCount} lịch hẹn chờ`}
                >
                  {pendingBookingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-150 whitespace-nowrap"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {!isSidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
        ></div>
      )}

      <main
        className={clsx(
          "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ease-in-out",
          !isSidebarCollapsed ? "lg:pl-60" : ""
        )}
      >
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="relative">
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md transition-colors"
            >
              {isSidebarCollapsed ? (
                <Menu size={24} />
              ) : (
                <X size={24} />
              )}
            </button>
            {pendingBookingCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {pendingBookingCount}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {sidebarItems.find((item) =>
              location.pathname.startsWith(item.path)
            )?.label || "Admin Panel"}
          </h1>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
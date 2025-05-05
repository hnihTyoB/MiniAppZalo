// src/components/AdminLayout.tsx
import React, { useState, useEffect } from "react"; // <<< Thêm useEffect
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth
// import { Button } from "zmp-ui"; // <<< Không cần import Button nữa nếu thay thế hết
import {
  LayoutDashboard,
  Users,
  Wrench,
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  Menu, // <<< Thêm icon Menu
  X, // <<< Thêm icon X (hoặc ChevronsLeft/Right)
} from "lucide-react"; // Import icons
import clsx from "clsx"; // Import clsx for conditional classes

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate(); // <<< Sửa: Thêm khai báo navigate
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // <<< Thêm state
  const [pendingBookingCount, setPendingBookingCount] = useState<number>(0); // <<< THÊM: State đếm lịch hẹn chờ

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
    }, // BM chỉ thấy user chi nhánh mình
    {
      icon: Wrench,
      label: "Dịch vụ",
      path: "/admin/services",
      roles: ["admin", "branch_manager"], // <<< CHO PHÉP CẢ BM XEM DỊCH VỤ (tùy chỉnh nếu cần)
    }, // Giả sử chỉ admin quản lý dịch vụ gốc
    // Hoặc { icon: Wrench, label: "Dịch vụ Chi nhánh", path: "/admin/branch-services", roles: ["branch_manager"] }, // Nếu BM quản lý dịch vụ/giá riêng
    {
      icon: Building2,
      label: "Chi nhánh",
      path: "/admin/branches",
      roles: ["admin"],
    }, // BM không thấy mục này
    {
      icon: CalendarCheck,
      label: "Lịch hẹn",
      path: "/admin/bookings",
      roles: ["admin", "branch_manager"],
    }, // BM chỉ thấy lịch hẹn chi nhánh mình
    {
      icon: Settings,
      label: "Cấu hình",
      path: "/admin/settings",
      roles: ["admin", "branch_manager"], // <<< THÊM branch_manager nếu muốn BM thấy
    }, // BM không thấy mục này
  ];

  const accessibleSidebarItems = sidebarItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );
  const toggleSidebar = () => {
    // <<< Hàm toggle state
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // <<< THÊM: useEffect để fetch số lượng lịch hẹn chờ >>>
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user) return;

      console.log("Fetching pending booking count for role:", user.role);
      // --- TODO: Gọi API lấy số lượng lịch hẹn chờ ---
      // Backend cần trả về số lượng dựa trên role và branchId
      // Ví dụ:
      // let apiUrl = "/api/bookings/pending/count";
      // if (user.role === 'branch_manager' && user.branchId) {
      //   apiUrl += `?branchId=${user.branchId}`;
      // }
      // const count = await api.get(apiUrl);
      // setPendingBookingCount(count);

      // --- Giả lập fetch ---
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockCount = user.role === "admin" ? 5 : 2; // Giả sử admin thấy 5, BM thấy 2
      setPendingBookingCount(mockCount);
      // --- Hết giả lập ---
    };

    fetchPendingCount();
  }, [user]); // Fetch lại khi user thay đổi

  return (
    // <<< Thay đổi: Thêm relative để định vị absolute cho sidebar >>>
    <div className="relative flex h-screen bg-gray-100 overflow-hidden mt-4">
      {/* Sidebar */}
      {/* <<< Thay đổi: Định vị fixed, dùng translate để ẩn/hiện >>> */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-lg flex flex-col", // <<< Thêm fixed, inset-y-0, left-0, z-30, shadow-lg >>>
          "transition-transform duration-300 ease-in-out", // <<< Giữ transition >>>
          isSidebarCollapsed ? "-translate-x-full" : "translate-x-0" // <<< Dùng translate >>>
        )}
      >
        {/* Nút đóng sidebar bên trong sidebar (tùy chọn) */}
        {/* <button onClick={toggleSidebar} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 lg:hidden"> <X size={20}/> </button> */}
        {/* <<< Căn chỉnh lại header sidebar >>> */}
        <div className="p-4 border-b flex flex-col items-center justify-center min-h-[65px] mt-4">
          {/* <<< XÓA thẻ h2 chứa chữ "Admin" >>> */}
          {/* <<< CHUYỂN dòng chữ chào vào đây >>> */}
          <div className="text-sm text-gray-600 mt-1">
            {" "}
            {/* <<< Bỏ mb-3, text-center, thêm mt-1 nếu cần >>> */}
            Chào, <span className="font-medium">{user?.name || "Admin"}</span>!
          </div>
          {/* Có thể thêm logo hoặc icon ở đây khi thu gọn */}
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
                  ? "bg-orange-100 text-orange-600" // Giữ màu cam cho item active
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{item.label}</span>{" "}
              {/* <<< Luôn hiển thị label vì sidebar sẽ ẩn hoàn toàn >>> */}
              {/* <<< THÊM: Badge cho mục Lịch hẹn >>> */}
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
          {/* <<< THAY THẾ Button bằng button >>> */}
          <button
            onClick={handleLogout}
            // Style tương tự variant="secondary" fullWidth của zmp-ui
            // <<< Đổi lại thành kiểu nút primary màu cam >>>
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-150 whitespace-nowrap"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Optional: Overlay khi sidebar mở trên màn hình nhỏ */}
      {!isSidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/30 z-20 lg:hidden" // Chỉ hiện overlay trên màn hình nhỏ (dưới lg)
        ></div>
      )}

      {/* Main Content */}
      {/* <<< Thay đổi: Thêm padding-left động >>> */}
      <main
        className={clsx(
          "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ease-in-out",
          // Chỉ thêm padding trên màn hình lớn (lg trở lên) khi sidebar mở
          !isSidebarCollapsed ? "lg:pl-60" : ""
        )}
      >
        {/* Header - Thêm nút toggle */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          {/* <<< Thêm nút Toggle Sidebar >>> */}
          <div className="relative">
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md transition-colors" // <<< Thêm hover màu cam >>>
            >
              {isSidebarCollapsed ? (
                <Menu size={24} /> // Icon mở
              ) : (
                <X size={24} /> // Icon đóng
              )}
            </button>
            {/* <<< THÊM: Badge kế bên nút toggle >>> */}

            {pendingBookingCount > 0 && (
              // <<< THAY ĐỔI: Hiển thị số lượng >>>
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {pendingBookingCount}
              </span>
              // <<< KẾT THÚC THAY ĐỔI >>>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {/* TODO: Cập nhật tiêu đề động dựa trên route */}
            {sidebarItems.find((item) =>
              location.pathname.startsWith(item.path)
            )?.label || "Admin Panel"}
          </h1>
          {/* <<< Thêm div trống để cân bằng với nút toggle >>> */}
          <div className="w-10"></div>{" "}
          {/* Điều chỉnh width nếu cần (w-10 ~ 2.5rem) */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Outlet sẽ render component con tương ứng với route */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

// src/pages/Profile.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  User, // Icon cho avatar và menu
  Info,
  HelpCircle,
  LogOut,
  ChevronRight, // Thay thế dấu '>'
  Home as HomeIcon, // <<< Import icon cho Bottom Nav
  CalendarDays, // <<< Import icon cho Bottom Nav
  MessageCircle, // <<< Import icon cho Bottom Nav
} from "lucide-react";

// --- Định nghĩa kiểu dữ liệu cho mục điều hướng (Copy từ Home.tsx) ---
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

// --- Mảng dữ liệu tĩnh cho Bottom Navigation (Copy từ Home.tsx) ---
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" }, // Sử dụng User icon đã import
];

const Profile = () => {
  const navigate = useNavigate();
  // Lấy pathname hiện tại để xác định tab active cho Bottom Nav
  const currentPath = window.location.pathname;

  // Định nghĩa các mục menu
  const menuItems = [
    { icon: Clock, text: "Lịch sử", route: "/history" },
    { icon: User, text: "Thông tin tài khoản", route: "/account" },
    { icon: Info, text: "Phiên bản", route: "/version" },
    { icon: HelpCircle, text: "Trợ giúp", route: "/help" },
    { icon: LogOut, text: "Đăng xuất", route: "/login" }, // Cần thêm logic logout thực tế
  ];

  // Hàm xử lý khi click vào mục menu
  const handleMenuItemClick = (route: string) => {
    if (route === "/login") {
      // TODO: Thêm logic xử lý đăng xuất ở đây (ví dụ: xóa token, reset state)
      console.log("Đăng xuất...");
    }
    // TODO: Đảm bảo các route khác đã được định nghĩa trong App.tsx
    navigate(route);
  };

  return (
    // Sử dụng pb-20 để tránh bị che bởi bottom navigation
    <div className="h-screen flex flex-col bg-white pb-20 overflow-y-auto">
      {/* Phần nội dung chính */}
      <div className="p-4 flex-grow">
        {/* Header đơn giản */}
        <h1 className="text-center text-xl font-semibold mb-6">Profile</h1>

        {/* Thông tin User */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
            {/* Thay placeholder text bằng icon */}
            <User size={48} />
            {/* Hoặc dùng ảnh nếu có: <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> */}
          </div>
          {/* Thêm tên người dùng nếu có */}
          {/* <p className="font-semibold text-lg">Tên Người Dùng</p> */}
          {/* <p className="text-sm text-gray-500">user@example.com</p> */}
        </div>

        {/* Danh sách Menu */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            // Sử dụng button thay vì div để cải thiện accessibility
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.route)}
              className="w-full flex items-center justify-between text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex items-center gap-4">
                {/* Có thể bỏ background cho icon nếu muốn */}
                {/* <div className="bg-gray-100 p-2 rounded-full"> */}
                <item.icon size={20} className="text-gray-600" />
                {/* </div> */}
                <span className="text-sm font-medium text-gray-800">
                  {item.text}
                </span>
              </div>
              {/* Thay thế '>' bằng icon ChevronRight */}
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation (Giữ nguyên logic từ Home.tsx) */}
      <div className="fixed bottom-0 left-0 w-full border-t bg-white py-2 px-4 flex justify-around text-xs z-20">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 ${
              currentPath === item.path ? "text-orange-500" : "text-gray-500"
            } hover:text-orange-400 transition-colors duration-200`}
          >
            <item.icon
              className={`w-5 h-5 ${
                currentPath === item.path ? "stroke-[2.5]" : ""
              }`}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Profile;

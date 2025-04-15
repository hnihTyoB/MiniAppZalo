// src/pages/Profile.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  User,
  Info,
  HelpCircle,
  LogOut,
  ChevronRight,
  Home as HomeIcon,
  CalendarDays,
  MessageCircle,
  Car, // <<< THÊM ICON XE
} from "lucide-react";

// ... (interfaces và navItems giữ nguyên) ...
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const Profile = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // <<< THÊM MỤC QUẢN LÝ XE VÀO MENU >>>
  const menuItems = [
    { icon: Clock, text: "Lịch sử", route: "/booking-history" },
    { icon: User, text: "Thông tin tài khoản", route: "/account" },
    { icon: Car, text: "Quản lý phương tiện", route: "/vehicles" }, // <<< MỤC MỚI
    { icon: Info, text: "Phiên bản", route: "/version" },
    { icon: HelpCircle, text: "Trợ giúp", route: "/help" },
    { icon: LogOut, text: "Đăng xuất", route: "/login" },
  ];

  const handleMenuItemClick = (route: string) => {
    if (route === "/login") {
      console.log("Đăng xuất...");
      // TODO: Thêm logic logout
    }
    navigate(route);
  };

  return (
    <div className="h-screen flex flex-col bg-white pb-20 overflow-y-auto">
      {/* Phần nội dung chính */}
      <div className="p-4 flex-grow">
        <h1 className="text-center text-xl font-semibold mb-6">Profile</h1>

        {/* Thông tin User (giữ nguyên) */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
            <User size={48} />
          </div>
          {/* <p className="font-semibold text-lg">Tên Người Dùng</p> */}
        </div>

        {/* Danh sách Menu (giữ nguyên cách render) */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.route)}
              className="w-full flex items-center justify-between text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  {item.text}
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation (giữ nguyên) */}
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

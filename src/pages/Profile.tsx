import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openOAChat } from "@/utils/zalo";
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
  Car,
  AlertCircle,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Modal, Button } from "zmp-ui";

interface UserInfo {
  name: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  action?: () => void;
}
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat", action: openOAChat },
  { icon: User, label: "Profile", path: "/profile" },
];

const Profile = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra.");
          }
        } else {
          setError("Không thể kết nối đến server.");
        }
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const menuItems = [
    { icon: Clock, text: "Lịch sử", route: "/booking-history" },
    { icon: User, text: "Thông tin tài khoản", route: "/account" },
    { icon: Car, text: "Quản lý phương tiện", route: "/vehicles" },
    { icon: Info, text: "Phiên bản", route: "/version" },
    { icon: HelpCircle, text: "Trợ giúp", route: "/help" },
    { icon: LogOut, text: "Đăng xuất", route: "/login" },
  ];

  const handleMenuItemClick = (route: string) => {
    if (route === "/login") {
      console.log("Đăng xuất...");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } else {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 flex-grow flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white pb-20 overflow-y-auto">
      <div className="p-4 flex-grow">
        <h1 className="text-center text-xl font-semibold mb-6">Profile</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
            <User size={48} />
          </div>
          <p className="font-semibold text-lg">{userInfo?.name || "Tên Người Dùng"}</p>
        </div>

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

      <div className="fixed bottom-0 left-0 w-full border-t bg-white py-2 px-4 flex justify-around text-xs z-20">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                navigate(item.path);
              }
            }}
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

      <Modal
        visible={isModalOpen}
        title="Thông báo lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        zIndex={1200}
        className="rounded-xl"
      >
        <div className="p-6 text-center bg-white rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error || "Đã có lỗi xảy ra."}</p>
          <Button
            variant="primary"
            onClick={() => {
              setIsModalOpen(false);
              setError(null);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
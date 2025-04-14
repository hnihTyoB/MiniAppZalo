// src/pages/Chat.tsx
import React from "react";
import {
  Mic,
  Search,
  Home as HomeIcon,
  CalendarDays,
  MessageCircle,
  User,
  ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Interfaces ---
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
interface BranchActivity {
  id: number;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
}
// Hợp nhất định nghĩa MessagePreview
interface MessagePreview {
  id: number; // ID của cuộc trò chuyện (hoặc tin nhắn cuối)
  branchId: number | string; // ID của chi nhánh
  name: string;
  message: string;
  avatarUrl?: string;
  isUnreadByUser: boolean; // Tin nhắn này người dùng chưa đọc
  recipientReadAvatarUrl?: string; // Avatar của người nhận nếu họ đã đọc tin nhắn cuối của bạn
}

// --- Dữ liệu mẫu ---
const activeBranches: BranchActivity[] = [
  {
    id: 1,
    name: "Chi nhánh 1",
    isActive: true,
    avatarUrl: "/images/avatar-1.jpg",
  },
  {
    id: 2,
    name: "Chi nhánh 2",
    isActive: true,
    avatarUrl: "/images/avatar-2.jpg",
  },
  {
    id: 3,
    name: "Chi nhánh 3",
    isActive: false,
    avatarUrl: "/images/avatar-3.jpg",
  },
  {
    id: 4,
    name: "Chi nhánh 4",
    isActive: true,
    avatarUrl: "/images/avatar-4.jpg",
  },
  {
    id: 5,
    name: "Chi nhánh 5",
    isActive: false /* avatarUrl: '/images/avatar-5.jpg' */,
  },
];

const messages: MessagePreview[] = [
  {
    id: 101,
    branchId: 1,
    name: "Chi Nhánh 1 - Thủ Đức",
    message:
      "Bạn đã kết nối với Chi nhánh 1 - Thủ Đức. Chúng tôi có thể giúp gì cho bạn?",
    isUnreadByUser: true,
    avatarUrl: "/images/avatar-1.jpg",
    // recipientReadAvatarUrl: undefined
  },
  {
    id: 102,
    branchId: 2,
    name: "Chi Nhánh 2 - Gò Vấp",
    message: "Bạn đã kết nối với Chi nhánh 2 - Gò Vấp. Xin chào!",
    isUnreadByUser: false,
    avatarUrl: "/images/avatar-2.jpg",
    recipientReadAvatarUrl: "/images/avatar-2.jpg",
  },
  {
    id: 103,
    branchId: 3,
    name: "Chi Nhánh 3 - Quận 3",
    message:
      "Bạn đã kết nối với Chi nhánh 3 - Quận 3. Lịch hẹn của bạn đã được xác nhận.",
    isUnreadByUser: false,
    avatarUrl: "/images/avatar-3.jpg",
    // recipientReadAvatarUrl: undefined
  },
  {
    id: 104,
    branchId: 4,
    name: "Chi Nhánh 4 - Quận 10",
    message: "Bạn đã kết nối với Chi nhánh 4 - Quận 10. Cảm ơn bạn đã liên hệ.",
    isUnreadByUser: true,
    avatarUrl: "/images/avatar-4.jpg",
    recipientReadAvatarUrl: "/images/avatar-4.jpg",
  },
];

// --- Bottom Nav Items ---
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const Chat = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // Hàm xử lý khi click vào tin nhắn (điều hướng và truyền state)
  const handleMessageClick = (messageData: MessagePreview) => {
    console.log("Data being passed to navigate:", {
      branchId: messageData.branchId,
      branchInfoState: {
        id: messageData.branchId,
        name: messageData.name,
        avatarUrl: messageData.avatarUrl,
      },
    });
    // <<< SỬA ĐƯỜNG DẪN Ở ĐÂY >>>
    navigate(`/conversation/${messageData.branchId}`, {
      // Đổi "/chat/" thành "/conversation/"
      state: {
        branchInfo: {
          id: messageData.branchId,
          name: messageData.name,
          avatarUrl: messageData.avatarUrl,
          // Thêm isActive nếu cần và có trong messageData
        },
      },
    });
  };

  return (
    <div className="h-screen bg-white flex flex-col px-4 pt-4 pb-20">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-center mb-4">Chat</h1>

      {/* Search bar */}
      <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 mb-4">
        <Search className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="flex-1 ml-2 bg-transparent outline-none text-sm"
        />
        <Mic className="text-gray-500" size={18} />
      </div>

      {/* Hoạt động */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">Hoạt động</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2 flex-nowrap">
          {activeBranches.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-col items-center flex-shrink-0 w-16"
            >
              <div className="relative w-14 h-14">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {branch.avatarUrl ? (
                    <img
                      src={branch.avatarUrl}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={28} className="text-gray-400" />
                  )}
                </div>
                {branch.isActive && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-lime-400 rounded-full border-2 border-white" />
                )}
              </div>
              <p className="text-xs text-center mt-1.5 truncate w-full">
                {branch.name}
              </p>
            </div>
          ))}
          {activeBranches.length === 0 && (
            <p className="text-sm text-gray-400 pl-1">
              Không có ai đang hoạt động.
            </p>
          )}
        </div>
      </div>

      {/* Tin nhắn */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm font-medium mb-3">Tin nhắn</h2>
        <div className="space-y-3">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleMessageClick(msg)}
              className="flex items-center w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Avatar chính */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {msg.avatarUrl ? (
                    <img
                      src={msg.avatarUrl}
                      alt={msg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>
              </div>
              {/* Tên và tin nhắn */}
              <div className="ml-3 flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{msg.name}</p>
                <p className="text-xs text-gray-500 truncate">{msg.message}</p>
              </div>

              {/* Hiển thị avatar nhỏ nếu chi nhánh đã đọc hoặc chấm xanh nếu user chưa đọc */}
              {msg.recipientReadAvatarUrl ? (
                <div className="w-4 h-4 rounded-full ml-2 flex-shrink-0 overflow-hidden">
                  <img
                    src={msg.recipientReadAvatarUrl}
                    alt="Đã đọc"
                    className="w-full h-full object-cover"
                    title="Đã đọc"
                  />
                </div>
              ) : msg.isUnreadByUser ? (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
              ) : null}
            </button>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-8">
              Chưa có tin nhắn nào.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
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

export default Chat;

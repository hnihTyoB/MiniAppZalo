// src/pages/Notifications.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Filter,
  Image as ImageIcon,
  ChevronLeft,
  Clock,
  Gift,
  Info,
} from "lucide-react";

// --- Interfaces ---

// Định nghĩa các loại thông báo
type NotificationType = "appointment" | "promotion" | "system" | "other";

// Interface cơ sở cho mọi thông báo
interface BaseNotification {
  id: string; // ID duy nhất của thông báo
  type: NotificationType; // Loại thông báo
  timestamp: number; // Thời gian tạo (Unix timestamp)
  isRead: boolean; // Trạng thái đã đọc
  title?: string; // Tiêu đề (tùy chọn)
  message?: string; // Nội dung (tùy chọn)
  imageUrl?: string; // Ảnh chung (tùy chọn)
}

// Interface chi tiết cho một lịch hẹn
interface AppointmentDetails {
  branch: string;
  services: string[]; // Mảng các dịch vụ
  date: string; // Định dạng "DD / MM / YYYY"
  time: string; // Định dạng "HH:MM AM/PM"
  status: "upcoming" | "done"; // Trạng thái lịch hẹn
}

// Interface cho thông báo loại lịch hẹn
interface AppointmentNotification extends BaseNotification {
  type: "appointment";
  details: AppointmentDetails; // Chứa thông tin chi tiết lịch hẹn
}

// Interface cho thông báo loại khuyến mãi
interface PromotionNotification extends BaseNotification {
  type: "promotion";
  discountCode?: string; // Mã giảm giá (tùy chọn)
  link?: string; // Đường dẫn chi tiết (tùy chọn)
}

// Interface cho thông báo loại hệ thống
interface SystemNotification extends BaseNotification {
  type: "system";
}

// Kiểu Union cho tất cả các loại thông báo có thể có
type NotificationItem =
  | AppointmentNotification
  | PromotionNotification
  | SystemNotification; // Có thể thêm các loại khác

// Interface mô tả cấu trúc dữ liệu đọc từ localStorage ("newlyAddedBookings")
// Nó tương tự ScheduleItem trong Bookings.tsx
interface BookingDataFromStorage {
  id: string;
  branch: string;
  services: string[];
  date: string;
  time: string;
  status: "upcoming" | "done";
  imageUrl?: string;
  address?: string;
  vehicleId?: string;
  // ... các trường khác nếu có trong localStorage ...
}

// --- Dữ liệu mẫu ban đầu ---
const initialMockData: NotificationItem[] = [
  // Lịch hẹn sắp tới
  {
    id: "#549493",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 2, // 2 ngày trước
    isRead: false,
    details: {
      branch: "PTIT – Chi nhánh 1",
      services: ["Thay lốp"],
      date: "01 / 05 / 2025", // Ngày gần để test countdown
      time: "10:00 AM",
      status: "upcoming",
    },
    imageUrl: "/images/branch-1.jpg",
  },
  // Lịch hẹn sắp tới khác
  {
    id: "#64944",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 1, // 1 ngày trước
    isRead: true,
    details: {
      branch: "PTIT – Chi nhánh 2",
      services: ["Rửa xe", "Thay dầu"], // Ví dụ nhiều dịch vụ
      date: "25 / 07 / 2024", // Ngày gần
      time: "07:00 AM",
      status: "upcoming",
    },
    imageUrl: "/images/branch-2.jpg",
  },
  // Lịch hẹn đã hoàn thành
  {
    id: "#789101",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 10, // 10 ngày trước
    isRead: true,
    details: {
      branch: "PTIT – Chi nhánh 3",
      services: ["Thay nhớt"],
      date: "12 / 07 / 2024", // Ngày trong quá khứ
      time: "11:00 AM",
      status: "done",
    },
  },
  // Thông báo khuyến mãi
  {
    id: "promo-001",
    type: "promotion",
    timestamp: Date.now() - 3600000 * 5, // 5 giờ trước
    isRead: false,
    title: "Ưu đãi cuối tuần!",
    message: "Giảm 15% dịch vụ rửa xe vào Thứ 7 & Chủ Nhật.",
    imageUrl: "/images/promotion-ruaxe.jpg",
    link: "/promotions/rua-xe-cuoi-tuan",
  },
  // Thông báo hệ thống
  {
    id: "sys-001",
    type: "system",
    timestamp: Date.now() - 3600000 * 24, // 1 ngày trước
    isRead: true,
    title: "Cập nhật ứng dụng",
    message: "Phiên bản mới đã sẵn sàng với nhiều cải tiến. Cập nhật ngay!",
  },
];

// --- Component Countdown ---
const AppointmentCountdown: React.FC<{ date: string; time: string }> = ({
  date,
  time,
}) => {
  // Hàm tính toán thời gian còn lại
  const calculateRemainingTime = () => {
    try {
      const dateParts = date.split(" / ");
      if (dateParts.length !== 3) return null;
      const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) return null;
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[3].toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const targetDateTime = new Date(
        `${isoDate}T${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:00`
      );

      if (isNaN(targetDateTime.getTime())) return null;

      const now = Date.now();
      const diff = targetDateTime.getTime() - now;

      if (diff <= 0) return "Đã qua";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutesLeft = Math.floor((diff / 1000 / 60) % 60);

      if (days > 0) return `Còn ${days} ngày ${hoursLeft} giờ`;
      if (hoursLeft > 0) return `Còn ${hoursLeft} giờ ${minutesLeft} phút`;
      if (minutesLeft > 0) return `Còn ${minutesLeft} phút`;
      return "Sắp đến";
    } catch (error) {
      console.error("Lỗi tính toán thời gian:", error);
      return "Lỗi";
    }
  };

  const [remaining, setRemaining] = useState(calculateRemainingTime());

  // Cập nhật countdown mỗi phút
  useEffect(() => {
    const timerId = setInterval(() => {
      setRemaining(calculateRemainingTime());
    }, 60000);
    return () => clearInterval(timerId);
  }, [date, time]);

  if (remaining === null) {
    return <span className="text-xs text-red-500">Lỗi định dạng ngày/giờ</span>;
  }

  return (
    <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
      <Clock size={12} /> {remaining}
    </span>
  );
};

// --- Component Notifications ---
export default function Notifications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<NotificationItem[]>(initialMockData);

  // Load lịch hẹn mới từ localStorage khi component mount
  useEffect(() => {
    try {
      const newlyAddedBookingsRaw = localStorage.getItem("newlyAddedBookings");
      if (newlyAddedBookingsRaw) {
        const newlyAddedBookings: BookingDataFromStorage[] = JSON.parse(
          newlyAddedBookingsRaw
        );

        if (newlyAddedBookings.length > 0) {
          const newNotifications: AppointmentNotification[] =
            newlyAddedBookings.map((booking) => {
              const {
                id,
                imageUrl,
                branch,
                services,
                date,
                time,
                status,
                // Bỏ qua các trường không cần thiết cho details
                ...rest
              } = booking;

              const details: AppointmentDetails = {
                branch,
                services,
                date,
                time,
                status,
              };

              return {
                id,
                type: "appointment",
                timestamp: Date.now(),
                isRead: false,
                details,
                imageUrl,
              };
            });

          // Thêm thông báo mới vào đầu danh sách
          setItems((prevItems) => [...newNotifications, ...prevItems]);
          localStorage.removeItem("newlyAddedBookings");
        }
      }
      // TODO: Load các loại thông báo khác từ API hoặc nguồn khác
    } catch (error) {
      console.error("Lỗi khi đọc lịch hẹn từ localStorage:", error);
      localStorage.removeItem("newlyAddedBookings"); // Xóa nếu lỗi
    }
  }, []); // Chỉ chạy 1 lần

  // --- Handlers ---
  const goBack = () => navigate(-1);

  // Xóa các lịch hẹn đã hoàn thành
  const handleClearDoneAppointments = () => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.type === "appointment" && item.details.status === "done")
      )
    );
    // TODO: Có thể cần cập nhật trạng thái này lên server hoặc localStorage khác
  };

  // --- Logic lọc thông báo ---
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const searchTerm = search.toLowerCase();
        if (!searchTerm) return true;

        // Tìm kiếm chung
        if (item.title?.toLowerCase().includes(searchTerm)) return true;
        if (item.message?.toLowerCase().includes(searchTerm)) return true;

        // Tìm kiếm riêng cho lịch hẹn
        if (item.type === "appointment") {
          const details = item.details;
          const servicesString = Array.isArray(details.services)
            ? details.services.join(", ").toLowerCase()
            : "";
          if (details.branch.toLowerCase().includes(searchTerm)) return true;
          if (servicesString.includes(searchTerm)) return true;
          if (item.id.toLowerCase().includes(searchTerm)) return true;
        }

        // TODO: Thêm logic tìm kiếm cho các loại khác nếu cần

        return false;
      }),
    [items, search]
  );

  // --- Render ---
  return (
    <div className="h-full overflow-y-auto bg-white pb-20 max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Thông báo</h1>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="sticky top-16 flex gap-2 items-center bg-white z-10 px-4 py-2 border-b">
        <Input
          placeholder="Tìm kiếm thông báo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          size="icon"
          className="bg-orange-400 hover:bg-orange-500 text-white flex-shrink-0"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Nội dung cuộn */}
      <div className="p-4 space-y-4">
        {/* Danh sách thông báo */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            // --- Render cho Lịch hẹn ---
            if (item.type === "appointment") {
              const details = item.details;
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden shadow-sm ${
                    !item.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Thời gian & Trạng thái đọc */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(item.timestamp).toLocaleDateString("vi-VN")}
                      </div>
                      {!item.isRead && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="Chưa đọc"
                        ></div>
                      )}
                    </div>
                    {/* Ảnh & Thông tin */}
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={details.branch}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="font-medium truncate">
                          {details.branch}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {item.id}
                        </div>
                        <div className="text-sm font-semibold">
                          {Array.isArray(details.services)
                            ? details.services.join(", ")
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">{`${details.date} – ${details.time}`}</div>
                      </div>
                    </div>
                    {/* Đường kẻ */}
                    <hr className="my-2 border-gray-200" />
                    {/* Trạng thái / Countdown */}
                    <div className="flex justify-center items-center pt-1">
                      {details.status === "done" ? (
                        <span className="text-sm text-green-600 font-medium">
                          Hoàn thành
                        </span>
                      ) : (
                        <AppointmentCountdown
                          date={details.date}
                          time={details.time}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }
            // --- Render cho Khuyến mãi ---
            else if (item.type === "promotion") {
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden shadow-sm ${
                    !item.isRead ? "bg-orange-50/30" : ""
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(item.timestamp).toLocaleDateString("vi-VN")}
                      </div>
                      {!item.isRead && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="Chưa đọc"
                        ></div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-orange-100 flex items-center justify-center flex-shrink-0 rounded-full">
                        <Gift className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {item.title || "Khuyến mãi"}
                        </div>
                        {item.message && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.message}
                          </p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:underline mt-1 inline-block"
                          >
                            Xem chi tiết
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            // --- Render cho Thông báo hệ thống ---
            else if (item.type === "system") {
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden shadow-sm ${
                    !item.isRead
                      ? "bg-blue-50/30"
                      : "bg-blue-50/50 border-blue-200/50"
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(item.timestamp).toLocaleDateString("vi-VN")}
                      </div>
                      {!item.isRead && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="Chưa đọc"
                        ></div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 flex items-center justify-center flex-shrink-0 rounded-full">
                        <Info className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {item.title || "Thông báo hệ thống"}
                        </div>
                        {item.message && (
                          <p className="text-xs text-gray-700 mt-0.5">
                            {item.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            // --- Render mặc định ---
          })
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không có thông báo nào.
          </p>
        )}

        {/* Nút Dọn dẹp */}
        {items.some(
          (item) =>
            item.type === "appointment" && item.details.status === "done"
        ) && (
          <Button
            className="w-full bg-orange-400 hover:bg-orange-500 text-white rounded-xl mt-4 py-2.5"
            onClick={handleClearDoneAppointments}
          >
            Dọn dẹp lịch hẹn đã xong
          </Button>
        )}
      </div>
    </div>
  );
}

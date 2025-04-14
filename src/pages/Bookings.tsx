// src/pages/Bookings.tsx
import React, { useState, useEffect } from "react"; // <<< THÊM useEffect
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import clsx from "clsx";
import {
  Home as HomeIcon,
  CalendarDays,
  MessageCircle,
  User,
  Wrench,
  Square,
  Droplet,
  ShowerHead,
  ImageIcon,
  MapPin,
  Building,
  CheckCircle, // <<< THÊM ICON CHO POPUP
  X, // <<< THÊM ICON ĐÓNG POPUP
} from "lucide-react";

// --- Interfaces và Constants (giữ nguyên) ---
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
interface Service {
  name: string;
  icon: React.ElementType;
}
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
}
interface ScheduleItem {
  id: string;
  branch: string;
  service: string;
  date: string;
  time: string;
  reminder: boolean;
  status: "upcoming" | "done";
  imageUrl?: string;
}

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const services: Service[] = [
    { name: "Sửa xe", icon: Wrench },
    { name: "Thay kính", icon: Square },
    { name: "Thay dầu", icon: Droplet },
    { name: "Rửa xe", icon: ShowerHead },
  ];
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(
    services[0]?.name || null
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>({
    id: 1,
    name: "PTIT - Chi nhánh 1",
    address: "97 Man Thiện, Thủ Đức",
    imageUrl: "/images/branch-1.jpg",
  });
  const currentPath = window.location.pathname;
  const times = ["07:00 PM", "10:00 AM", "01:00 PM", "03:00 PM", "04:30 PM"];
  const availableBranches: Branch[] = [
    {
      id: 1,
      name: "PTIT - Chi nhánh 1",
      address: "97 Man Thiện, Thủ Đức",
      imageUrl: "/images/branch-1.jpg",
    },
    {
      id: 2,
      name: "PTIT - Chi nhánh 2",
      address: "122 Hoàng Diệu 2, Thủ Đức",
      imageUrl: "/images/branch-2.jpg",
    },
    { id: 3, name: "Chi nhánh Quận 9", address: "45 Lê Văn Việt, Quận 9" },
  ];

  // <<< THÊM: State cho popup >>>
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // --- Handlers ---
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  };

  // <<< SỬA: handleBooking để hiển thị popup >>>
  const handleBooking = () => {
    console.log("Checking booking readiness:", {
      selectedServiceName,
      selectedBranch,
      selectedDate,
      selectedTime,
      isBookingReady:
        !!selectedServiceName &&
        !!selectedBranch &&
        !!selectedDate &&
        !!selectedTime,
    });

    if (selectedServiceName && selectedBranch && selectedDate && selectedTime) {
      const newBooking: ScheduleItem = {
        id: `#${Date.now().toString().slice(-6)}`,
        branch: selectedBranch.name,
        service: selectedServiceName,
        date: selectedDate
          .toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, " / "),
        time: selectedTime,
        reminder: false,
        status: "upcoming",
        imageUrl: selectedBranch.imageUrl,
      };

      // 2. Chuẩn bị và hiển thị popup thành công
      const successMessage = `Đặt lịch ${newBooking.service} tại ${newBooking.branch} thành công vào ngày ${newBooking.date} lúc ${newBooking.time}`;
      setPopupMessage(successMessage);
      setShowSuccessPopup(true);

      // Tự động ẩn popup sau 3 giây
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000); // 3000ms = 3 giây

      // 3. Lưu vào localStorage
      try {
        const existingBookings = JSON.parse(
          localStorage.getItem("newlyAddedBookings") || "[]"
        );
        existingBookings.push(newBooking);
        localStorage.setItem(
          "newlyAddedBookings",
          JSON.stringify(existingBookings)
        );
      } catch (error) {
        console.error("Lỗi khi lưu lịch hẹn vào localStorage:", error);
      }
    } else {
      // Thông báo lỗi nếu thiếu thông tin (vẫn dùng alert cho lỗi)
      let missingFields = [];
      if (!selectedServiceName) missingFields.push("dịch vụ");
      if (!selectedBranch) missingFields.push("chi nhánh");
      if (!selectedDate) missingFields.push("ngày");
      if (!selectedTime) missingFields.push("giờ");
      alert(`Vui lòng chọn ${missingFields.join(", ")}.`);
    }
  };

  // --- Các handlers khác giữ nguyên ---
  const handleServiceClick = (serviceName: string) => {
    setSelectedServiceName(serviceName);
    console.log(`Selected service in Booking: ${serviceName}`);
  };

  const handleViewAllServices = () => {
    console.log("Clicked 'Thay đổi' for services");
    setSelectedServiceName(null);
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    console.log(`Selected branch: ${branch.name}`);
  };

  const handleChooseOrChangeBranch = () => {
    console.log("Clicked 'Chọn/Thay đổi' for branches - TODO: Open modal/page");
    const chosenBranchId = prompt(
      `Chọn ID chi nhánh:\n${availableBranches
        .map((b) => `${b.id}: ${b.name}`)
        .join("\n")}`
    );
    if (chosenBranchId) {
      const branch = availableBranches.find(
        (b) => b.id === parseInt(chosenBranchId)
      );
      if (branch) {
        handleSelectBranch(branch);
      } else {
        alert("ID chi nhánh không hợp lệ.");
      }
    }
  };

  const isBookingReady =
    !!selectedServiceName &&
    !!selectedBranch &&
    !!selectedDate &&
    !!selectedTime;

  // <<< THÊM: Hàm đóng popup thủ công >>>
  const closePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    // <<< THÊM: relative để popup định vị đúng >>>
    <div className="relative flex flex-col h-screen bg-white pb-36">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
        <h2 className="text-2xl font-semibold text-center">Đặt lịch</h2>
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Phần Dịch vụ */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Dịch vụ</h2>
            {selectedServiceName && (
              <button
                onClick={handleViewAllServices}
                className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
              >
                Thay đổi
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600">
            {services.map((service, index) => {
              const isSelected = service.name === selectedServiceName;
              return (
                <div
                  key={index}
                  onClick={() => handleServiceClick(service.name)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleServiceClick(service.name);
                    }
                  }}
                >
                  <div
                    className={clsx(
                      "p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-200",
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 group-hover:bg-orange-100 text-orange-500"
                    )}
                  >
                    <service.icon
                      className={clsx(
                        "w-6 h-6",
                        isSelected ? "text-white" : "text-orange-500"
                      )}
                    />
                  </div>
                  <span
                    className={clsx(
                      "font-medium",
                      isSelected ? "text-orange-600" : "text-gray-600"
                    )}
                  >
                    {service.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phần Chi nhánh */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Chi nhánh</h3>
            <button
              onClick={handleChooseOrChangeBranch}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              {selectedBranch ? "Thay đổi" : "Chọn"}
            </button>
          </div>
          {selectedBranch ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {selectedBranch.imageUrl ? (
                // <<< SỬA: Đổi lại aspect-video >>>
                <div className="w-full aspect-video bg-gray-100">
                  {" "}
                  {/* Tỷ lệ 16:9 */}
                  <img
                    src={selectedBranch.imageUrl}
                    alt={selectedBranch.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                // <<< SỬA: Đổi lại aspect-video >>>
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  {" "}
                  {/* Tỷ lệ 16:9 */}
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="p-3 space-y-0.5">
                <div className="font-semibold text-base truncate">
                  {selectedBranch.name}
                </div>
                {selectedBranch.address && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{selectedBranch.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <Building size={32} className="mb-1" />
              <span className="text-sm">Vui lòng chọn chi nhánh</span>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn ngày</h3>
          <style>{`
            /* ... CSS Calendar giữ nguyên ... */
            .react-calendar { border: none; border-radius: 0.5rem; font-family: inherit; width: 100%; background-color: #f9fafb; padding: 0.5rem; }
            .react-calendar__tile { border-radius: 9999px; height: 44px; display: flex; align-items: center; justify-content: center; padding: 0.25rem; }
            .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #fed7aa; }
            .react-calendar__tile--now { background-color: #fdba74; color: white; }
            .react-calendar__tile--now:enabled:hover, .react-calendar__tile--now:enabled:focus { background-color: #fb923c; }
            .react-calendar__tile--active { background-color: #f97316 !important; color: white !important; }
            .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background-color: #ea580c !important; }
            .react-calendar__navigation button { color: #f97316; font-weight: 600; min-height: 40px; }
            .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #fff7ed; }
            .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; font-weight: 600; color: #4b5563; }
          `}</style>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            locale="vi-VN"
          />
        </div>

        {/* Giờ */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn giờ</h3>
          <div className="grid grid-cols-3 gap-3">
            {times.map((time, i) => (
              <button
                key={i}
                className={clsx(
                  "py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  time === selectedTime
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                )}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nút Đặt lịch */}
      <div className="fixed bottom-16 left-0 w-full p-4 bg-white border-t z-10">
        <button
          onClick={handleBooking}
          className={clsx(
            "bg-orange-400 text-white w-full py-2 rounded-lg font-semibold text-lg transition-colors duration-200",
            !isBookingReady
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-500"
          )}
          disabled={!isBookingReady}
        >
          Đặt lịch
        </button>
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

      {/* ========== THÊM POPUP THÔNG BÁO ========== */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative">
            {/* Nút đóng popup */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
            {/* Icon thành công */}
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            {/* Tiêu đề */}
            <h3 className="text-lg font-semibold mb-2">Đặt lịch thành công!</h3>
            {/* Nội dung thông báo */}
            <p className="text-sm text-gray-600">{popupMessage}</p>
          </div>
        </div>
      )}
      {/* ========== KẾT THÚC POPUP THÔNG BÁO ========== */}
    </div>
  );
};

export default Booking;

// src/pages/Home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper modules
import { Autoplay, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import {
  Bell,
  Search,
  SlidersHorizontal,
  MapPin,
  Wrench,
  Square,
  Droplet,
  ShowerHead,
  ImageIcon,
  Home as HomeIcon,
  CalendarDays,
  MessageCircle,
  User,
} from "lucide-react";

// --- Định nghĩa kiểu dữ liệu cho dịch vụ và mục điều hướng ---
interface ServiceItem {
  icon: React.ElementType;
  label: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

// --- Mảng dữ liệu tĩnh ---
const services: ServiceItem[] = [
  { icon: Wrench, label: "Sửa xe" },
  { icon: Square, label: "Thay kính" },
  { icon: Droplet, label: "Thay dầu" },
  { icon: ShowerHead, label: "Rửa xe" },
];

const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewAll = (section: string) => {
    console.log(`Xem tất cả ${section}`);
    // navigate(`/list/${section.toLowerCase()}`);
  };
  const handleServiceClick = (serviceLabel: string) => {
    console.log(`Clicked on service: ${serviceLabel}`);
    // Sau này bạn có thể thêm logic điều hướng ở đây
    // navigate(`/service/${serviceLabel.toLowerCase().replace(' ', '-')}`);
  };

  const currentPath = window.location.pathname;

  // --- CSS tùy chỉnh cho Swiper Pagination ---
  const swiperPaginationStyle = `
    .swiper-pagination-bullet {
      background-color: #9ca3af; /* Màu cam nhạt cho chấm không active (orange-400) */
      opacity: 0.5; /* Làm mờ đi một chút */
    }
    .swiper-pagination-bullet-active {
      background-color: #f97316; /* Màu cam đậm hơn cho chấm active (orange-500) */
      opacity: 1;
    }
    .swiper-container-horizontal > .swiper-pagination-bullets, .swiper-pagination-custom, .swiper-pagination-fraction {
      bottom: 4px; /* Điều chỉnh vị trí của pagination lên một chút nếu cần */
    }
  `;
  // --- Kết thúc CSS tùy chỉnh ---

  return (
    <div className="flex flex-col h-screen bg-white pb-20 overflow-y-auto">
      {/* Thêm thẻ style vào đây */}
      <style>{swiperPaginationStyle}</style>

      {/* Phần nội dung chính có padding */}
      <div className="p-4 flex-grow">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Địa điểm</div>
            <div className="text-base font-semibold flex items-center gap-1">
              <MapPin className="w-4 h-4 text-orange-500" />
              TP. Hồ Chí Minh, Việt Nam
            </div>
          </div>
          <button onClick={() => navigate("/notifications")} className="p-1">
            {/* <<< THAY ĐỔI MÀU ICON CHUÔNG */}
            <Bell className="w-6 h-6 text-orange-500 hover:text-orange-600" />
            {/* <<< KẾT THÚC THAY ĐỔI */}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg flex-1">
            <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
            <input
              className="bg-transparent outline-none w-full text-sm"
              placeholder="Tìm kiếm dịch vụ, chi nhánh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Khuyến mãi */}
        <div className="mb-6 relative">
          {" "}
          {/* Giữ mb-6 và relative */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Khuyến mãi</h2>
            <button
              onClick={() => handleViewAll("Khuyến mãi")}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            pagination={{ clickable: true }}
            className="rounded-xl overflow-hidden pb-8" // Giữ padding-bottom
          >
            {/* Các SwiperSlide giữ nguyên */}
            <SwiperSlide>
              <div className="bg-orange-100 p-4 rounded-xl relative aspect-[2/1] flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-orange-600">
                    Khuyến mãi hôm nay
                  </span>
                  <h3 className="text-lg font-bold mt-2 text-gray-800">
                    Nhận khuyến mãi đặc biệt
                  </h3>
                  <p className="text-2xl font-bold text-orange-500">
                    Lên đến 20%
                  </p>
                </div>
                <button className="mt-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg self-start text-sm">
                  Nhận ngay
                </button>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-blue-100 p-4 rounded-xl relative aspect-[2/1] flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-blue-600">
                    Ưu đãi thành viên
                  </span>
                  <h3 className="text-lg font-bold mt-2 text-gray-800">
                    Giảm giá rửa xe cuối tuần
                  </h3>
                  <p className="text-2xl font-bold text-blue-500">Chỉ 50K</p>
                </div>
                <button className="mt-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg self-start text-sm">
                  Xem chi tiết
                </button>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-green-100 p-4 rounded-xl relative aspect-[2/1] flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-green-600">
                    Chào hè sang
                  </span>
                  <h3 className="text-lg font-bold mt-2 text-gray-800">
                    Kiểm tra điều hòa miễn phí
                  </h3>
                  <p className="text-2xl font-bold text-green-500">0đ</p>
                </div>
                <button className="mt-2 bg-green-400 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg self-start text-sm">
                  Đặt lịch
                </button>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Dịch vụ */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Dịch vụ</h2>
            <button
              onClick={() => handleViewAll("Dịch vụ")}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600">
            {services.map((service, index) => (
              // <<< THÊM onClick, cursor-pointer VÀO ĐÂY >>>
              <div
                key={index}
                onClick={() => handleServiceClick(service.label)} // Gọi hàm xử lý khi click
                className="flex flex-col items-center gap-1.5 cursor-pointer group" // Thêm cursor-pointer và group (cho hover effect nếu muốn)
                role="button" // Thêm role cho accessibility
                tabIndex={0} // Cho phép focus bằng bàn phím
                onKeyDown={(e) => {
                  // Cho phép kích hoạt bằng Enter/Space
                  if (e.key === "Enter" || e.key === " ") {
                    handleServiceClick(service.label);
                  }
                }}
              >
                {/* <<< KẾT THÚC THAY ĐỔI >>> */}
                <div className="bg-gray-100 group-hover:bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-200">
                  {" "}
                  {/* Thêm hiệu ứng hover */}
                  <service.icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="font-medium">{service.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chi nhánh */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Chi nhánh</h2>
            <button
              onClick={() => handleViewAll("Chi nhánh")}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 overflow-hidden"
              >
                <ImageIcon className="w-12 h-12 text-gray-400" />
                {/* <img src={`/images/branch-${item}.jpg`} alt={`Chi nhánh ${item}`} className="w-full h-full object-cover" /> */}
              </div>
            ))}
          </div>
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

export default Home;

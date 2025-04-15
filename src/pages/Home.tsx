// src/pages/Home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
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
  Settings, // <<< THÊM ICON NÀY
  Paintbrush, // <<< THÊM ICON NÀY
  SprayCan, // <<< THÊM ICON NÀY
  // Building, // <<< Không cần nữa nếu hiển thị list
} from "lucide-react";

// --- Interfaces ---
interface ServiceItem {
  icon: React.ElementType;
  label: string;
}
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
}

// --- Mảng dữ liệu tĩnh ---
const services: ServiceItem[] = [
  { icon: Wrench, label: "Sửa xe" },
  { icon: Square, label: "Thay kính" },
  { icon: Droplet, label: "Thay dầu" },
  { icon: ShowerHead, label: "Rửa xe" },
  { icon: Settings, label: "Bảo dưỡng" },
  { icon: Search, label: "Kiểm tra tổng quát" },
  { icon: Paintbrush, label: "Làm đồng sơn" },
  { icon: SprayCan, label: "Vệ sinh nội thất" },
];
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];
const availableBranches: Branch[] = [
  {
    id: 1,
    name: "PTIT - Chi nhánh 1",
    address: "97 Man Thiện, Thủ Đức",
    imageUrl: "/images/branch-1.jpg", // <<< Đảm bảo đường dẫn ảnh đúng
  },
  {
    id: 2,
    name: "PTIT - Chi nhánh 2",
    address: "122 Hoàng Diệu 2, Thủ Đức",
    imageUrl: "/images/branch-2.jpg", // <<< Đảm bảo đường dẫn ảnh đúng
  },
  { id: 3, name: "Chi nhánh Quận 9", address: "45 Lê Văn Việt, Quận 9" },
  // Thêm chi nhánh khác nếu cần
];
const normalizeServiceName = (name: string): string => {
  return (
    name
      .toLowerCase()
      // Bỏ dấu tiếng Việt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Thay khoảng trắng bằng gạch nối
      .replace(/\s+/g, "-")
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllHomeServices, setShowAllHomeServices] = useState(false);
  // <<< XÓA: State selectedBranch không cần thiết cho kiểu hiển thị này >>>
  // const [selectedBranch, setSelectedBranch] = useState<Branch | null>(
  //   availableBranches[0] || null
  // );

  // --- Handlers ---
  const handleViewAll = (section: string) => {
    console.log(`Xem tất cả ${section}`);
    if (section === "Chi nhánh") {
      navigate("/branches"); // <<< ĐIỀU HƯỚNG ĐẾN TRANG DANH SÁCH CHI NHÁNH >>>
    } else if (section === "Khuyến mãi") {
      // navigate('/promotions'); // Ví dụ điều hướng khác
    } else if (section === "Dịch vụ") {
      // navigate('/services'); // Ví dụ điều hướng khác
    }
  };
  // <<< THÊM HANDLER MỚI ĐỂ TOGGLE DỊCH VỤ >>>
  const handleToggleServices = () => {
    setShowAllHomeServices(!showAllHomeServices);
  };
  const handleServiceClick = (serviceLabel: string) => {
    const serviceId = normalizeServiceName(serviceLabel); // Chuẩn hóa tên thành ID
    console.log(`Navigating to service detail: ${serviceId}`);
    navigate(`/service/${serviceId}`); // Điều hướng đến trang chi tiết
  };

  // <<< SỬA: Handler khi click vào một chi nhánh >>>
  const handleBranchClick = (branch: Branch) => {
    console.log(`Clicked on branch: ${branch.name}`);
    // Điều hướng đến trang chi tiết và truyền ID (hoặc toàn bộ object) qua state
    navigate("/branch-detail", { state: { branchData: branch } });
    // Lưu ý: Trang BranchDetail.tsx hiện tại chưa sử dụng state này,
    // bạn cần cập nhật BranchDetail.tsx để lấy và hiển thị dữ liệu từ state.
  };

  // <<< XÓA: Các handler handleSelectBranch và handleChooseOrChangeBranch không cần nữa >>>

  const currentPath = window.location.pathname;
  const servicesToDisplay = showAllHomeServices
    ? services
    : services.slice(0, 4);

  // --- CSS Swiper (giữ nguyên) ---
  const swiperPaginationStyle = `
    .swiper-pagination-bullet { background-color: #9ca3af; opacity: 0.5; }
    .swiper-pagination-bullet-active { background-color: #f97316; opacity: 1; }
    .swiper-container-horizontal > .swiper-pagination-bullets, .swiper-pagination-custom, .swiper-pagination-fraction { bottom: 4px; }
  `;

  return (
    <div className="flex flex-col h-screen bg-white pb-20 overflow-y-auto">
      <style>{swiperPaginationStyle}</style>

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
            <Bell className="w-6 h-6 text-orange-500 hover:text-orange-600" />
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
            className="rounded-xl overflow-hidden pb-8"
          >
            {/* Slides khuyến mãi giữ nguyên */}
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
            {/* <<< CẬP NHẬT NÚT XEM TẤT CẢ / ẨN BỚT >>> */}
            <button
              onClick={handleToggleServices} // Gọi hàm toggle mới
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              {showAllHomeServices ? "Ẩn bớt" : "Xem tất cả"}
            </button>
          </div>
          {/* Grid dịch vụ giờ sẽ hiển thị dựa trên state */}
          <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600">
            {/* <<< SỬ DỤNG servicesToDisplay ĐỂ MAP >>> */}
            {servicesToDisplay.map((service, index) => (
              <div
                key={index}
                onClick={() => handleServiceClick(service.label)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleServiceClick(service.label);
                  }
                }}
              >
                <div className="bg-gray-100 group-hover:bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-200">
                  <service.icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="font-medium">{service.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/*CHI NHÁNH*/}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Chi nhánh</h2>
            {/* Nút này giờ sẽ điều hướng đúng */}
            <button
              onClick={() => handleViewAll("Chi nhánh")}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          {/* Hiển thị danh sách các chi nhánh (giữ nguyên) */}
          <div className="space-y-4">
            {availableBranches.slice(0, 3).map((branch) => (
              <div
                key={branch.id}
                onClick={() => handleBranchClick(branch)}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleBranchClick(branch);
                  }
                }}
              >
                {/* ... (code hiển thị ảnh và text chi nhánh giữ nguyên) ... */}
                {branch.imageUrl ? (
                  <div className="w-full aspect-video bg-gray-100">
                    <img
                      src={branch.imageUrl}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <div className="font-semibold text-base truncate mb-0.5">
                    {branch.name}
                  </div>
                  {branch.address && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {availableBranches.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                Chưa có chi nhánh nào.
              </p>
            )}
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

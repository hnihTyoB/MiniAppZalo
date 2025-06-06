import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { openOAChat } from "@/utils/zalo";
import {
  Bell,
  Search,
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
  Phone,
  Settings,
  Paintbrush,
  SprayCan,
} from "lucide-react";
import { Modal, Button } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

// --- Interfaces ---
interface ServiceItem {
  id: number;
  name: string;
  icon?: React.ElementType;
}
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  action?: () => void;
}
interface Branch {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  image_url?: string;
  description?: string; // Thêm description vào interface
}
interface Promotion {
  id: number;
  code: string;
  description: string;
  discount_value: number;
  discount_type: "percentage" | "fixed";
  service_id: number;
  start_date: string;
  end_date: string;
}

const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat", action: openOAChat },
  { icon: User, label: "Profile", path: "/profile" },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceIcons: { [key: string]: React.ElementType } = {
    "Sửa xe": Wrench,
    "Thay kính": Square,
    "Thay dầu": Droplet,
    "Rửa xe": ShowerHead,
    "Bảo dưỡng": Settings,
    "Kiểm tra tổng quát": Search,
    "Sơn xe": Paintbrush,
    "Vệ sinh nội thất": SprayCan,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [servicesResponse, branchesResponse, promotionsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/services`, { headers }).catch((err) => {
            console.error("Error fetching services:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/api/branches`, { headers }).catch((err) => {
            console.error("Error fetching branches:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/api/promotions`, { headers }).catch((err) => {
            console.error("Error fetching promotions:", err);
            return { data: [] };
          }),
        ]);

        const fetchedServices = servicesResponse.data.map((service: any) => ({
          id: service.id,
          name: service.name,
          icon: serviceIcons[service.name] || Wrench,
        }));
        setServices(fetchedServices);

        setBranches(branchesResponse.data);

        const validPromotions = Array.isArray(promotionsResponse.data)
          ? promotionsResponse.data.filter(
              (promo: Promotion) =>
                promo.description != null &&
                promo.discount_value != null &&
                promo.discount_type != null
            )
          : [];
        console.log("Valid Promotions:", validPromotions);
        setPromotions(validPromotions);

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
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const handleViewAll = (section: string) => {
    if (section === "Chi nhánh") {
      navigate("/branches");
    } else if (section === "Khuyến mãi") {
      navigate("/promotions");
    } else if (section === "Dịch vụ") {
      navigate("/services");
    }
  };

  const handleServiceClick = (serviceId: number) => {
    navigate(`/service/${serviceId}`);
  };

  const handleBranchClick = (branch: Branch) => {
    navigate("/branch-detail", { state: { branchData: branch } });
  };

  const handlePromotionClick = (promotionId: number) => {
    navigate(`/promotion/${promotionId}`);
  };

  const toggleShowAllServices = () => {
    setShowAllServices(!showAllServices);
  };

  const servicesToDisplay = showAllServices ? services : services.slice(0, 4);

  const currentPath = window.location.pathname;

  const slideColors = [
    {
      background: "#FFDBD5",
      tagText: "#D94A3D",
      discountText: "#F2695C",
      button: "#FF8A80",
      buttonHover: "#F2695C",
    },
    {
      background: "#D4F4E2",
      tagText: "#2E8B57",
      discountText: "#3CB371",
      button: "#66CDAA",
      buttonHover: "#3CB371",
    },
    {
      background: "#E6E1FF",
      tagText: "#6A5ACD",
      discountText: "#7B68EE",
      button: "#B0A8FF",
      buttonHover: "#7B68EE",
    },
  ];

  const swiperPaginationStyle = `
    .swiper-pagination-bullet { background-color: #9ca3af; opacity: 0.5; }
    .swiper-pagination-bullet-active { background-color: #f97316; opacity: 1; }
    .swiper-container-horizontal > .swiper-pagination-bullets, .swiper-pagination-custom, .swiper-pagination-fraction { bottom: 4px; }
  `;

  return (
    <div className="flex flex-col h-screen bg-white pb-20 overflow-y-auto mt-3">
      <style>{swiperPaginationStyle}</style>
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-3 border-b">
        <div className="relative flex justify-center items-center mb-4">
          <h1 className="text-2xl font-bold text-orange-500">
            G2 Schedule a car repair
          </h1>
        </div>
        {/* Search Bar */}
        <div className="sticky top-[56px] bg-white z-10 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg flex-1">
              <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
              <input
                className="bg-transparent outline-none w-full text-sm"
                placeholder="Tìm kiếm dịch vụ, chi nhánh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg flex-shrink-0"
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex-grow">
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
          {loading ? (
            <p className="text-center text-gray-500">Đang tải khuyến mãi...</p>
          ) : promotions.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có khuyến mãi nào.</p>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop
              pagination={{ clickable: true }}
              className="rounded-xl overflow-hidden pb-8"
            >
              {promotions.map((promotion, index) => {
                const color = slideColors[index % slideColors.length];
                const discountText =
                  promotion.discount_type === "percentage"
                    ? `${promotion.discount_value}%`
                    : `${promotion.discount_value.toLocaleString()}đ`;

                return (
                  <SwiperSlide key={promotion.id}>
                    <div
                      style={{ backgroundColor: color.background }}
                      className="p-4 rounded-xl relative aspect-[2/1] flex flex-col justify-between cursor-pointer"
                      onClick={() => handlePromotionClick(promotion.id)}
                    >
                      <div>
                        <span
                          style={{ color: color.tagText, backgroundColor: "#FFFFFF" }}
                          className="text-xs px-2 py-1 rounded-full font-medium"
                        >
                          {promotion.code}
                        </span>
                        <h3 className="text-lg font-bold mt-2 text-gray-800">
                          {promotion.description}
                        </h3>
                        <p
                          style={{ color: color.discountText }}
                          className="text-2xl font-bold"
                        >
                          {discountText}
                        </p>
                      </div>
                      <button
                        style={{ backgroundColor: color.button }}
                        className="mt-2 text-white px-4 py-1.5 rounded-lg self-start text-sm hover:bg-[var(--buttonHover)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromotionClick(promotion.id);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color.buttonHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color.button)}
                      >
                        Nhận ngay
                      </button>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>

        {/* Dịch vụ */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Dịch vụ</h2>
            <button
              onClick={toggleShowAllServices}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              {showAllServices ? "Ẩn bớt" : "Xem tất cả"}
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dịch vụ...</p>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có dịch vụ nào.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600">
              {servicesToDisplay.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleServiceClick(service.id);
                    }
                  }}
                >
                  <div className="bg-gray-100 group-hover:bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-200">
                    {service.icon && <service.icon className="w-6 h-6 text-orange-500" />}
                  </div>
                  <span className="font-medium">{service.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chi nhánh */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Chi nhánh</h2>
            <button
              onClick={() => handleViewAll("Chi nhánh")}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Đang tải chi nhánh...</p>
          ) : branches.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có chi nhánh nào.</p>
          ) : (
            <div className="space-y-4">
              {branches.slice(0, 3).map((branch) => (
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
                  <div className="w-full aspect-video bg-gray-100">
                    {branch.image_url ? (
                      <img
                        src={branch.image_url}
                        alt={branch.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-base truncate mb-1">
                      {branch.name}
                    </div>
                    {branch.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                        {branch.description}
                      </p>
                    )}
                    {branch.address && (
                      <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{branch.address}</span>
                      </div>
                    )}
                    {branch.phone_number && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="truncate">{branch.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
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

      {/* Modal để hiển thị lỗi */}
      <Modal
        visible={isModalOpen}
        title="Lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        description={error || "Đã có lỗi xảy ra."}
      >
        <Button
          variant="primary"
          onClick={() => {
            setIsModalOpen(false);
            setError(null);
          }}
        >
          OK
        </Button>
      </Modal>
    </div>
  );
};

export default Home;
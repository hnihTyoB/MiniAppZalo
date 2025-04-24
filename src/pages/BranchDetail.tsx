// src/pages/BranchDetail.tsx
import React, { useState } from "react";
import {
  ChevronLeft,
  Share2,
  Heart,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  ImageIcon,
  Clock, // <<< THÊM ICON GIỜ
  Mail, // <<< THÊM ICON MAIL
  Globe, // <<< THÊM ICON WEBSITE
  Wrench, // <<< THÊM ICON DỊCH VỤ
  Square, // <<< THÊM ICON DỊCH VỤ
  Droplet, // <<< THÊM ICON DỊCH VỤ
  ShowerHead, // <<< THÊM ICON DỊCH VỤ
  Edit, // <<< THÊM ICON VIẾT ĐÁNH GIÁ
  User, // <<< THÊM ICON QUẢN LÝ
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { openOAChat } from "@/utils/zalo";

// Interface Branch (giống Home.tsx và Bookings.tsx)
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
  description?: string; // <<< THÊM MÔ TẢ
  rating?: number; // <<< THÊM ĐÁNH GIÁ TRUNG BÌNH
  reviewCount?: number; // <<< THÊM SỐ LƯỢNG ĐÁNH GIÁ
  phone?: string; // <<< THÊM SĐT
  email?: string; // <<< THÊM EMAIL
  website?: string; // <<< THÊM WEBSITE
  openingHours?: string; // <<< THÊM GIỜ MỞ CỬA
  managerName?: string; // <<< THÊM TÊN QUẢN LÝ
  managerAvatar?: string; // <<< THÊM AVATAR QUẢN LÝ
  // Thêm các thuộc tính khác nếu cần
}

// <<< THÊM Interface ServiceItem (giống Home.tsx) >>>
interface ServiceItem {
  icon: React.ElementType;
  label: string;
  description?: string; // Mô tả ngắn gọn (tùy chọn)
}

// <<< THÊM Interface ReviewItem >>>
interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1 đến 5 sao
  comment: string;
  timestamp: number; // Thời gian đăng
}

// --- Dữ liệu mẫu (Nên lấy từ API hoặc state) ---
const defaultBranch: Branch = {
  id: 0,
  name: "Trung tâm sửa chữa ô tô PTIT",
  address: "97 Man Thiện, Hiệp Phú, Thủ Đức, TP.HCM",
  imageUrl: "/images/branch-1.jpg",
  description:
    "Trung tâm sửa chữa ô tô PTIT tự hào là địa chỉ uy tín cung cấp các dịch vụ chăm sóc, bảo dưỡng và sửa chữa ô tô chuyên nghiệp tại Thủ Đức. Với đội ngũ kỹ thuật viên lành nghề, trang thiết bị hiện đại và phụ tùng chính hãng, chúng tôi cam kết mang đến sự hài lòng tuyệt đối cho khách hàng.",
  rating: 4.8,
  reviewCount: 234,
  phone: "0987 654 321",
  email: "contact@ptit-auto.com",
  website: "www.ptit-auto.com",
  openingHours: "Thứ 2 - Chủ Nhật: 08:00 - 18:00",
  managerName: "Nguyễn Văn A",
  managerAvatar: "/images/avatar-placeholder.png",
};

// <<< Dữ liệu mẫu cho Dịch vụ >>>
const sampleServices: ServiceItem[] = [
  {
    icon: Wrench,
    label: "Sửa chữa chung",
    description: "Kiểm tra, chẩn đoán và sửa chữa các vấn đề máy, gầm, điện.",
  },
  {
    icon: Droplet,
    label: "Thay dầu nhớt",
    description: "Thay dầu động cơ, hộp số, dầu phanh chính hãng.",
  },
  {
    icon: ShowerHead,
    label: "Rửa xe, dọn nội thất",
    description: "Rửa xe công nghệ cao, hút bụi, khử mùi nội thất.",
  },
  {
    icon: Square,
    label: "Sơn xe",
    description: "Xử lý vết móp, trầy xước, sơn lại xe.",
  },
  // Thêm các dịch vụ khác...
];

// <<< Dữ liệu mẫu cho Đánh giá >>>
const sampleReviews: ReviewItem[] = [
  {
    id: "r1",
    reviewerName: "Trần Thị B",
    reviewerAvatar: "/images/avatar-2.jpg",
    rating: 5,
    comment: "Dịch vụ rất tốt, nhân viên nhiệt tình, xe sửa xong chạy êm hẳn.",
    timestamp: Date.now() - 86400000 * 2, // 2 ngày trước
  },
  {
    id: "r2",
    reviewerName: "Lê Văn C",
    // reviewerAvatar: undefined, // Ví dụ không có avatar
    rating: 4,
    comment: "Giá cả hợp lý, làm khá nhanh. Sẽ quay lại.",
    timestamp: Date.now() - 86400000 * 5, // 5 ngày trước
  },
  {
    id: "r3",
    reviewerName: "Phạm Thị D",
    reviewerAvatar: "/images/avatar-3.jpg",
    rating: 5,
    comment: "Rửa xe sạch, bóng loáng, rất hài lòng!",
    timestamp: Date.now() - 86400000 * 10, // 10 ngày trước
  },
];

// <<< Giả sử bạn có map từ branch.id sang OA ID (hoặc dùng OA ID chính) >>>
const branchOaIdMap: { [key: number]: string } = {
  1: "3103109239621189141", // Thay thế bằng OA ID thực tế
};

// --- Component hiển thị sao ---
const RatingStars: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 14,
}) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="text-yellow-400 fill-yellow-400"
        />
      ))}
      {/* Hiện tại chưa xử lý nửa sao, bạn có thể thêm icon half-star nếu cần */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
    </div>
  );
};

// --- Component BranchDetail ---
const BranchDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("thông tin");

  const branchData: Branch | null = location.state?.branchData;
  const branch = branchData || defaultBranch;

  const goBack = () => {
    navigate(-1);
  };

  const tabs = ["Thông tin", "Dịch vụ", "Đánh giá", "Liên hệ"];

  // Hàm định dạng thời gian đánh giá
  const formatReviewTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleOpenBranchChat = () => {
    // Lấy OA ID cụ thể cho chi nhánh này, hoặc dùng OA ID chính nếu không có
    const targetOaId = branchOaIdMap[branch.id] || undefined; // Lấy OA ID riêng nếu có
    openOAChat(targetOaId, `Tôi cần hỗ trợ tại chi nhánh ${branch.name}`); // Truyền OA ID riêng (nếu có) và tin nhắn mở đầu
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header image + icons */}
      <div className="relative h-48 bg-gray-300 group">
        {branch.imageUrl ? (
          <img
            src={branch.imageUrl}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
        <div className="absolute top-0 left-0 right-0 p-4 pt-7 flex justify-between items-center z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-white hover:opacity-80 py-1 rounded transition-opacity"
            aria-label="Quay lại"
          >
            <ChevronLeft size={25} />
            <span className="text-lg font-medium">Quay lại</span>
          </button>
          <div className="flex space-x-2">
            <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-white">
              <Share2 size={18} />
            </button>
            <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-orange-500 hover:bg-white">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Phần nội dung chính */}
      <div className="flex-1 overflow-y-auto pb-36">
        {/* Info cơ bản */}
        <div className="px-4 pt-4 pb-3 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-orange-100 text-orange-500 px-2 py-0.5 rounded-md text-xs font-medium">
              Sửa xe ô tô
            </span>
            {branch.rating && branch.reviewCount && (
              <div className="flex items-center text-sm text-gray-600 ml-auto">
                <Star
                  size={14}
                  className="text-yellow-400 mr-1 fill-yellow-400"
                />
                <span className="font-medium">{branch.rating.toFixed(1)}</span>
                <span className="text-gray-400 ml-1">
                  ({branch.reviewCount} đánh giá)
                </span>
              </div>
            )}
          </div>
          <h1 className="font-semibold text-lg mb-0.5">{branch.name}</h1>
          {branch.address && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span>{branch.address}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mt-3 bg-white border-y border-gray-200 sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors duration-150",
                activeTab === tab.toLowerCase()
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {/* <<< BỌC NỘI DUNG TAB TRONG DIV RIÊNG ĐỂ CÓ PADDING >>> */}
        <div className="p-4">
          {activeTab === "thông tin" && (
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div>
                <h2 className="font-semibold mb-1 text-base">Về chúng tôi</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {branch.description || "Chưa có mô tả về chi nhánh này."}
                </p>
              </div>
              {branch.openingHours && (
                <div>
                  <h3 className="font-semibold mb-1 text-sm flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500" /> Giờ mở cửa
                  </h3>
                  <p className="text-sm text-gray-600">{branch.openingHours}</p>
                </div>
              )}
              {/* Thêm các thông tin khác nếu cần: Tiện ích,... */}
            </div>
          )}

          {activeTab === "dịch vụ" && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-3 text-base">Dịch vụ nổi bật</h2>
              {sampleServices.length > 0 ? (
                <div className="space-y-4">
                  {sampleServices.map((service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-orange-50 p-2 rounded-full mt-0.5">
                        <service.icon
                          className="w-5 h-5 text-orange-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.label}</p>
                        {service.description && (
                          <p className="text-xs text-gray-500">
                            {service.description}
                          </p>
                        )}
                      </div>
                      {/* Có thể thêm nút "Đặt lịch" cho từng dịch vụ */}
                      {/* <button className="text-orange-500 text-xs font-medium ml-auto self-center">Đặt lịch</button> */}
                    </div>
                  ))}
                  {/* Nút xem tất cả dịch vụ */}
                  <button
                    onClick={() => navigate("/services")} // Hoặc route phù hợp
                    className="w-full mt-4 text-center text-orange-500 text-sm font-medium py-2 rounded-lg border border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    Xem tất cả dịch vụ
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có thông tin dịch vụ.
                </p>
              )}
            </div>
          )}

          {activeTab === "đánh giá" && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-base">
                  Đánh giá ({branch.reviewCount || 0})
                </h2>
                <button className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:bg-orange-50 px-2 py-1 rounded-md">
                  <Edit size={14} /> Viết đánh giá
                </button>
              </div>
              {sampleReviews.length > 0 ? (
                <div className="space-y-5">
                  {sampleReviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                        {review.reviewerAvatar ? (
                          <img
                            src={review.reviewerAvatar}
                            alt={review.reviewerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={18} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="font-medium text-sm">
                            {review.reviewerName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatReviewTime(review.timestamp)}
                          </p>
                        </div>
                        <RatingStars rating={review.rating} size={12} />
                        <p className="text-sm text-gray-700 mt-1 leading-snug">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Nút xem thêm đánh giá */}
                  {(branch.reviewCount || 0) > sampleReviews.length && (
                    <button className="w-full mt-4 text-center text-orange-500 text-sm font-medium py-2 rounded-lg border border-orange-300 hover:bg-orange-50 transition-colors">
                      Xem thêm{" "}
                      {(branch.reviewCount || 0) - sampleReviews.length} đánh
                      giá
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                </p>
              )}
            </div>
          )}

          {activeTab === "liên hệ" && (
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
              <h2 className="font-semibold mb-2 text-base">
                Thông tin liên hệ
              </h2>
              {branch.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-500 flex-shrink-0" />
                  <a
                    href={`tel:${branch.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {branch.phone}
                  </a>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-500 flex-shrink-0" />
                  <a
                    href={`mailto:${branch.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {branch.email}
                  </a>
                </div>
              )}
              {branch.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe size={16} className="text-gray-500 flex-shrink-0" />
                  <a
                    href={
                      branch.website.startsWith("http")
                        ? branch.website
                        : `https://${branch.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {branch.website}
                  </a>
                </div>
              )}
              {branch.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin
                    size={16}
                    className="text-gray-500 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-700">{branch.address}</span>
                  {/* Có thể thêm nút chỉ đường */}
                  {/* <button className="text-orange-500 text-xs font-medium ml-auto self-center">Chỉ đường</button> */}
                </div>
              )}
              {/* TODO: Thêm bản đồ nhúng nếu cần */}
            </div>
          )}
        </div>
        {/* <<< KẾT THÚC BỌC NỘI DUNG TAB >>> */}
      </div>

      {/* Footer cố định */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 space-y-3 z-10">
        {/* Phần liên hệ */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 mr-3 overflow-hidden">
            {branch.managerAvatar ? (
              <img
                src={branch.managerAvatar}
                alt={branch.managerName || "Quản lý"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {branch.managerName || "Chưa có tên"}
            </p>
            <p className="text-xs text-gray-500">Quản lý</p>
          </div>
          <div className="flex ml-auto space-x-2">
            {/* Nút gọi điện */}
            <button
              onClick={() => branch.phone && window.open(`tel:${branch.phone}`)}
              disabled={!branch.phone}
              className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone size={18} className="text-orange-500" />
            </button>
            {/* Nút nhắn tin */}
            <button
              // onClick={() =>
              //   navigate(`/conversation/${branch.id}`, {
              //     state: {
              //       branchInfo: {
              //         id: branch.id,
              //         name: branch.name,
              //         avatarUrl: branch.imageUrl,
              //         // isActive: branch.isActive // Cần thêm isActive vào Branch interface nếu có
              //       },
              //     },
              //   })
              // }
              onClick={handleOpenBranchChat}
              className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-100 transition-colors"
            >
              <MessageCircle size={18} className="text-orange-500" />
            </button>
          </div>
        </div>

        {/* Nút đặt lịch */}
        <button
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors"
          onClick={() => navigate("/bookings")}
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
};

export default BranchDetail;

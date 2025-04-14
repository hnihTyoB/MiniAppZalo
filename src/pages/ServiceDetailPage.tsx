// src/pages/ServiceDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  DollarSign,
  Image as ImageIcon,
  Wrench,
  Square,
  Droplet,
  ShowerHead,
} from "lucide-react"; // Thêm các icon dịch vụ để map

// --- Interface cho chi tiết dịch vụ ---
interface ServiceDetail {
  id: string; // ID hoặc slug định danh dịch vụ (ví dụ: 'sua-xe', 'thay-kinh')
  name: string;
  description: string;
  priceRange?: string; // Ví dụ: "Từ 500.000đ", "Liên hệ"
  imageUrl?: string; // Ảnh minh họa chính
  gallery?: string[]; // Danh sách ảnh/video khác (optional)
  icon: React.ElementType; // Icon tương ứng
  // Thêm các thuộc tính khác nếu cần: Lợi ích, quy trình, sản phẩm liên quan...
}

// --- Dữ liệu mẫu (Nên lấy từ API dựa trên serviceId) ---
const allServiceDetails: ServiceDetail[] = [
  {
    id: "sua-xe",
    name: "Sửa xe",
    icon: Wrench,
    description:
      "Dịch vụ sửa chữa ô tô tổng quát, bao gồm kiểm tra, chẩn đoán và khắc phục các sự cố về máy móc, điện, gầm, phanh, và các hệ thống khác. Đội ngũ kỹ thuật viên chuyên nghiệp, trang thiết bị hiện đại.",
    priceRange: "Liên hệ báo giá",
    imageUrl: "/images/service-suaxe.jpg", // <<< Cần có ảnh mẫu
    gallery: ["/images/service-suaxe-1.jpg", "/images/service-suaxe-2.jpg"],
  },
  {
    id: "thay-kinh",
    name: "Thay kính",
    icon: Square,
    description:
      "Thay thế kính chắn gió, kính cửa, kính hậu cho các dòng xe ô tô. Sử dụng kính chính hãng hoặc tương đương chất lượng cao, đảm bảo an toàn và tầm nhìn rõ ràng. Quy trình nhanh chóng, chuyên nghiệp.",
    priceRange: "Từ 1.500.000đ",
    imageUrl: "/images/service-thaykinh.jpg", // <<< Cần có ảnh mẫu
  },
  {
    id: "thay-dau",
    name: "Thay dầu",
    icon: Droplet,
    description:
      "Dịch vụ thay dầu nhớt động cơ, hộp số, dầu phanh,... theo đúng tiêu chuẩn của nhà sản xuất. Sử dụng các loại dầu nhớt chất lượng cao, phù hợp với từng loại xe. Giúp bảo vệ động cơ và vận hành êm ái.",
    priceRange: "Từ 300.000đ",
    imageUrl: "/images/service-thaydau.jpg", // <<< Cần có ảnh mẫu
  },
  {
    id: "rua-xe",
    name: "Rửa xe",
    icon: ShowerHead,
    description:
      "Rửa xe công nghệ cao, bao gồm rửa thân vỏ, hút bụi nội thất, vệ sinh khe cửa, dưỡng lốp. Sử dụng dung dịch chuyên dụng, an toàn cho sơn xe. Mang lại vẻ ngoài sạch bóng cho xế yêu của bạn.",
    priceRange: "Từ 50.000đ",
    imageUrl: "/images/service-ruaxe.jpg", // <<< Cần có ảnh mẫu
  },
];

// --- Helper function để tìm icon dựa trên id/name ---
// (Cách này đơn giản, bạn có thể tối ưu nếu cần)
const getIconById = (id: string): React.ElementType => {
  switch (id) {
    case "sua-xe":
      return Wrench;
    case "thay-kinh":
      return Square;
    case "thay-dau":
      return Droplet;
    case "rua-xe":
      return ShowerHead;
    default:
      return Wrench; // Icon mặc định
  }
};

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(
    null
  );

  const serviceId = params.serviceId; // Lấy serviceId từ URL (ví dụ: 'sua-xe')

  useEffect(() => {
    console.log("Fetching service detail for ID:", serviceId);
    // --- Mô phỏng lấy dữ liệu dịch vụ ---
    // TODO: Thay bằng logic fetch API thực tế
    if (serviceId) {
      const foundService = allServiceDetails.find((s) => s.id === serviceId);
      if (foundService) {
        // Gán icon nếu chưa có trong dữ liệu tìm thấy (ví dụ)
        setServiceDetail({ ...foundService, icon: getIconById(serviceId) });
      } else {
        // Xử lý trường hợp không tìm thấy dịch vụ
        console.error("Service not found for ID:", serviceId);
        // Có thể điều hướng về trang lỗi hoặc trang trước đó
        // navigate('/not-found');
      }
    }
  }, [serviceId]);

  const goBack = () => {
    navigate(-1);
  };

  // --- Handler nút Đặt lịch ---
  const handleBookNow = () => {
    if (serviceDetail) {
      console.log(`Navigating to booking for service: ${serviceDetail.name}`);
      // Điều hướng đến trang đặt lịch và truyền tên dịch vụ qua state
      navigate("/bookings", {
        state: { preselectedService: serviceDetail.name },
      });
    }
  };

  // --- Render ---
  if (!serviceDetail) {
    // Hiển thị trạng thái loading hoặc thông báo lỗi
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 h-16 px-4 flex items-center bg-white z-20 border-b">
          <button onClick={goBack} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft size={25} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 mx-auto">
            Đang tải...
          </h1>
          <div className="w-6"></div> {/* Placeholder */}
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Đang tải thông tin dịch vụ...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2 text-gray-600"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 truncate px-12">
          {serviceDetail.name}
        </h1>
      </div>

      {/* Nội dung chính (cho phép cuộn và có padding đáy) */}
      <div className="flex-1 overflow-y-auto pb-24">
        {" "}
        {/* Thêm pb cho nút Đặt lịch */}
        {/* Ảnh chính của dịch vụ */}
        <div className="w-full aspect-video bg-gray-200">
          {serviceDetail.imageUrl ? (
            <img
              src={serviceDetail.imageUrl}
              alt={serviceDetail.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        {/* Thông tin chi tiết */}
        <div className="p-4 bg-white mt-[-1rem] rounded-t-2xl relative z-10 shadow-sm">
          {" "}
          {/* Kéo lên và bo góc */}
          {/* Tên và Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <serviceDetail.icon className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold">{serviceDetail.name}</h2>
          </div>
          {/* Mô tả */}
          <div className="mb-4">
            <h3 className="font-semibold text-base mb-1 flex items-center gap-1.5">
              <Info size={16} className="text-gray-500" /> Mô tả
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {serviceDetail.description}
            </p>
          </div>
          {/* Giá cả (nếu có) */}
          {serviceDetail.priceRange && (
            <div className="mb-4">
              <h3 className="font-semibold text-base mb-1 flex items-center gap-1.5">
                <DollarSign size={16} className="text-gray-500" /> Chi phí dự
                kiến
              </h3>
              <p className="text-sm text-orange-600 font-medium">
                {serviceDetail.priceRange}
              </p>
            </div>
          )}
          {/* Thư viện ảnh (nếu có) */}
          {serviceDetail.gallery && serviceDetail.gallery.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-base mb-2">Hình ảnh</h3>
              <div className="grid grid-cols-3 gap-2">
                {serviceDetail.gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-md overflow-hidden"
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Thêm các phần khác nếu cần */}
        </div>
      </div>

      {/* Nút Đặt lịch cố định */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t p-4 z-10">
        <button
          onClick={handleBookNow}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Đặt lịch dịch vụ này
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;

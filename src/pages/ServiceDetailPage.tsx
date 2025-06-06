import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  DollarSign,
  Image as ImageIcon,
  Wrench,
  Square,
  Droplet,
  ShowerHead,
  Settings as SettingsIcon,
  Search,
  Paintbrush,
  SprayCan,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Modal, Button } from "zmp-ui"; // Thêm Modal và Button

interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  priceRange?: string;
  imageUrl?: string;
  gallery?: string[];
}

const serviceIcons: { [key: string]: React.ElementType } = {
  "Sửa xe": Wrench,
  "Thay kính": Square,
  "Thay dầu": Droplet,
  "Rửa xe": ShowerHead,
  "Bảo dưỡng": SettingsIcon,
  "Kiểm tra tổng quát": Search,
  "Sơn xe": Paintbrush,
  "Vệ sinh nội thất": SprayCan,
};

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ServiceIcon, setServiceIcon] = useState<React.ElementType>(Wrench);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceId = params.serviceId;

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        if (!serviceId || isNaN(Number(serviceId))) {
          setError("ID dịch vụ không hợp lệ.");
          setLoading(false);
          return;
        }

        const serviceDetailResponse = await axios.get(`${API_BASE_URL}/api/services/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedServiceDetail: ServiceDetail = serviceDetailResponse.data;
        const icon = serviceIcons[fetchedServiceDetail.name] || Wrench;
        setServiceIcon(icon);
        setServiceDetail(fetchedServiceDetail);
        setLoading(false);

        console.log("Service detail:", fetchedServiceDetail);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else if (status === 404) {
            setError("Dịch vụ không tồn tại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchServiceDetail();
  }, [serviceId, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const goBack = () => {
    navigate(-1);
  };

  const handleBookNow = () => {
    if (serviceDetail) {
      console.log(`Navigating to booking for service: ${serviceDetail.name}`);
      navigate("/bookings", {
        state: { preselectedService: serviceDetail.name },
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 h-16 px-4 flex items-center bg-white z-20 border-b">
          <button onClick={goBack} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft size={25} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 mx-auto">
            Đang tải...
          </h1>
          <div className="w-6"></div>
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
          {serviceDetail?.name || "Dịch vụ"}
        </h1>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Ảnh chính của dịch vụ */}
        <div className="w-full aspect-video bg-gray-200">
          {serviceDetail?.imageUrl ? (
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
          {/* Tên và Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <ServiceIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold">{serviceDetail?.name}</h2>
          </div>
          {/* Mô tả */}
          <div className="mb-4">
            <h3 className="font-semibold text-base mb-1 flex items-center gap-1.5">
              <Info size={16} className="text-gray-500" /> Mô tả
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {serviceDetail?.description}
            </p>
          </div>
          {/* Giá cả */}
          {serviceDetail?.priceRange && (
            <div className="mb-4">
              <h3 className="font-semibold text-base mb-1 flex items-center gap-1.5">
                <DollarSign size={16} className="text-gray-500" /> Chi phí dự kiến
              </h3>
              <p className="text-sm text-orange-600 font-medium">
                {serviceDetail.priceRange}
              </p>
            </div>
          )}
          {/* Thư viện ảnh */}
          {serviceDetail?.gallery && serviceDetail.gallery.length > 0 && (
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

export default ServiceDetailPage;
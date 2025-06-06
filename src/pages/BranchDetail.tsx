import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Share2,
  Heart,
  Phone,
  MessageCircle,
  MapPin,
  Star,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Modal, Button } from "zmp-ui";

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  image_url?: string; // Thêm image_url
  description?: string; // Thêm description
}

interface Service {
  id: number;
  name: string;
}

const BranchDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("thông tin");
  const [branch, setBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const branchId = location.state?.branchData?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        if (!branchId) {
          setError("Không tìm thấy chi nhánh.");
          setLoading(false);
          return;
        }

        const [branchResponse, servicesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/branches/${branchId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch((err) => {
            console.error("Error fetching branch:", err);
            return { data: null };
          }),
          axios.get(`${API_BASE_URL}/api/services`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch((err) => {
            console.error("Error fetching services:", err);
            return { data: [] };
          }),
        ]);

        if (!branchResponse.data) {
          setError("Chi nhánh không tồn tại.");
          setLoading(false);
          return;
        }

        setBranch(branchResponse.data);
        setServices(servicesResponse.data);
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
          } else if (status === 404) {
            setError("Chi nhánh không tồn tại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchData();
  }, [branchId, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const goBack = () => {
    navigate(-1);
  };

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceName)
        ? prevSelected.filter((name) => name !== serviceName)
        : [...prevSelected, serviceName]
    );
  };

  const handleBooking = () => {
    navigate("/bookings", {
      state: {
        selectedBranch: branch,
        selectedServices: selectedServices,
      },
    });
  };

  const tabs = ["Thông tin", "Dịch vụ", "Đánh giá", "Liên hệ"];

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 justify-center items-center">
        <p className="text-gray-500">Đang tải chi tiết chi nhánh...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="relative h-48 bg-orange-100">
        {branch?.image_url ? (
          <img
            src={branch.image_url}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-orange-100" />
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

      <div className="flex-1 overflow-y-auto pb-36">
        <div className="px-4 pt-4 pb-3 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-orange-100 text-orange-500 px-2 py-0.5 rounded-md text-xs font-medium">
              Sửa xe ô tô
            </span>
            <div className="flex items-center text-sm text-gray-600 ml-auto">
              <Star size={14} className="text-yellow-400 mr-1 fill-yellow-400" />
              <span className="font-medium">4.8</span>
              <span className="text-gray-400 ml-1">(234 đánh giá)</span>
            </div>
          </div>
          <h1 className="font-semibold text-lg mb-0.5">{branch?.name || "N/A"}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span>{branch?.address || "Chưa có thông tin"}</span>
          </div>
          {branch?.phone_number && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Phone size={14} className="mr-1 flex-shrink-0" />
              <span>{branch.phone_number}</span>
            </div>
          )}
        </div>

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

        <div className="px-4 py-4 bg-white mt-3">
          {activeTab === "thông tin" && (
            <>
              <h2 className="font-semibold mb-2 text-base">Về chúng tôi</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {branch?.description || "Chưa có thông tin mô tả về chi nhánh này."}
              </p>
            </>
          )}
          {activeTab === "dịch vụ" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">Dịch vụ</h2>
              {services.length > 0 ? (
                <div className="space-y-2">
                  {services.map((service) => {
                    const isSelected = selectedServices.includes(service.name);
                    return (
                      <div
                        key={service.id}
                        className={clsx(
                          "flex items-center p-2 border rounded-lg transition-colors duration-150 cursor-pointer",
                          isSelected
                            ? "bg-orange-50 border-orange-200"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => handleServiceToggle(service.name)}
                      >
                        <span
                          className={clsx(
                            "text-sm",
                            isSelected ? "text-orange-600 font-medium" : "text-gray-700"
                          )}
                        >
                          {service.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Chưa có dịch vụ nào.
                </p>
              )}
            </div>
          )}
          {activeTab === "đánh giá" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">Đánh giá</h2>
              <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
            </div>
          )}
          {activeTab === "liên hệ" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">
                Thông tin liên hệ
              </h2>
              {branch?.phone_number ? (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={14} />
                    <span>{branch.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{branch.address}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Chi tiết liên hệ của chi nhánh.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 space-y-3 z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 mr-3">
            <img
              src="/images/avatar-placeholder.png"
              alt="Quản lý"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <p className="font-medium text-sm">Chí Thịnh</p>
            <p className="text-xs text-gray-500">Quản lý</p>
          </div>
          <div className="flex ml-auto space-x-2">
            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-200 transition-colors">
              <Phone size={18} className="text-orange-500" />
            </button>
            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-200 transition-colors">
              <MessageCircle size={18} className="text-orange-500" />
            </button>
          </div>
        </div>
        <button
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors"
          onClick={handleBooking}
        >
          Đặt lịch ngay
        </button>
      </div>

      {/* Modal hiển thị lỗi */}
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

export default BranchDetail;
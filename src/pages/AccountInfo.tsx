import React, { useState, useEffect } from "react";
import { ChevronLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api"; 
import { Modal, Button } from "zmp-ui"; // Thêm Modal và Button

interface UserInfo {
  name: string;
  dob: string | null;
  phone: string;
  address: string | null;
  gender: string | null;
}

const AccountInfo = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string; error?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(
              error.response.data?.message || error.response.data?.error || "Đã có lỗi xảy ra khi lấy thông tin."
            );
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const handleEditClick = () => {
    navigate("/edit-profile");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white mt-3">
      {/* Header */}
      <div className="flex items-center p-4 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-1 mr-2 -ml-1">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1">
          Thông tin tài khoản
        </h2>
        <div className="w-8"></div>
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow overflow-y-auto p-6 pb-20">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <User size={48} />
          </div>
        </div>

        {/* Thông tin */}
        <div className="space-y-4">
          {[
            { label: "Họ và tên", value: userInfo?.name || "Chưa cập nhật" },
            {
              label: "Ngày sinh",
              value: userInfo?.dob || "Chưa cập nhật",
            },
            { label: "Số điện thoại", value: userInfo?.phone || "Chưa cập nhật" },
            {
              label: "Địa chỉ",
              value: userInfo?.address || "Chưa cập nhật",
            },
            {
              label: "Giới tính",
              value: userInfo?.gender || "Chưa cập nhật",
            },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-sm text-gray-600 mb-1 font-bold">
                {field.label}
              </p>
              <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nút cố định ở dưới */}
      <div className="fixed bottom-0 left-0 w-full z-10">
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full"
          onClick={handleEditClick}
        >
          Chỉnh sửa
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

export default AccountInfo;
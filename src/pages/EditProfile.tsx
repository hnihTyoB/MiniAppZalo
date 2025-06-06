import React, { useState, useEffect } from "react";
import { ChevronLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, Modal, Button } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

interface UserInfo {
  name: string;
  dob: string | null;
  phone: string;
  address: string | null;
  gender: string | null;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
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

        const userData = response.data;
        setUserInfo(userData);
        setName(userData.name || "");
        setDob(userData.dob || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setGender(userData.gender || "");
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

  const handleGenderChange = (selectedValue: string | number) => {
    setGender(String(selectedValue));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const updatedInfo = {
        name,
        dob,
        address,
        gender,
      };

      await axios.put(`${API_BASE_URL}/api/users/me`, updatedInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Cập nhật thông tin thành công!");
      navigate("/account");
    } catch (err) {
      const error = err as AxiosError<{ message?: string; error?: string }>;
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(
            error.response.data?.message || error.response.data?.error || "Đã có lỗi xảy ra khi cập nhật thông tin."
          );
        }
      } else {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-1 mr-2 -ml-1">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1">
          Chỉnh sửa thông tin
        </h2>
        <div className="w-8"></div>
      </div>

      {/* Phần nội dung chính */}
      <div className="flex-grow overflow-y-auto p-6 pb-20">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <User size={48} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="dob"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Ngày sinh
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Số điện thoại
            </label>
            <div className="w-full bg-gray-100 rounded-lg p-3 text-gray-800">
              {phone || "Chưa cập nhật"}
            </div>
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Địa chỉ
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-bold">
              Giới tính
            </label>
            <Select
              value={gender}
              onChange={handleGenderChange}
              placeholder="Chọn giới tính"
            >
              <Select.Option value="Nam" title="Nam" />
              <Select.Option value="Nữ" title="Nữ" />
              <Select.Option value="Khác" title="Khác" />
            </Select>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-10">
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full"
          onClick={handleSaveChanges}
        >
          Lưu thay đổi
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

export default EditProfile;
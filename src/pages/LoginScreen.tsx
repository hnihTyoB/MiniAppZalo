import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Button } from "zmp-ui";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  const handleNavigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  const goBack = () => {
    navigate("/");
  };

  const handleLogin = async () => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        phone_number: phoneNumber,
        password: password,
      });
      if (response.status === 200) {
        const { token, role, userId, full_name, branchId } = response.data;

        const userData = {
          id: userId ? userId.toString() : "unknown",
          name: full_name || "User",
          phone: phoneNumber,
          role: role || "customer",
          branchId: branchId ? branchId.toString() : "unknown",
        };
        console.log("User data being saved:", userData);
        login(userData, token);
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "branch_manager") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        const message = error.response.data?.message || "Đã có lỗi xảy ra";
        setError(message);
      } else {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
      }
    }
  };

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  return (
    <div className="relative flex flex-col h-full">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-white hover:text-gray-200 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium" style={{ color: "GrayText" }}>
          Quay lại
        </span>
      </button>

      <div className="bg-gray-200 flex items-center justify-center h-[50%]">
        <img
          src="/images/bg_start.jpg"
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          alt="Ảnh"
          className="h-full w-full"
        />
      </div>

      <div className="bg-white flex-1 rounded-t-3xl p-4 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Đăng nhập</h1>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border-b w-full p-2 mb-4 outline-none focus:border-orange-400"
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-b w-full p-2 pr-20 outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <button
            onClick={handleNavigateToRegister}
            className="hover:underline font-bold text-orange-500"
          >
            Đăng ký
          </button>
          <button
            onClick={handleNavigateToForgotPassword}
            className="hover:underline font-bold"
          >
            Quên mật khẩu?
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="bg-orange-400 hover:bg-orange-500 text-white py-2 w-full rounded"
        >
          Đăng nhập
        </button>
        <div className="text-center my-4 text-sm text-gray-400">
          hoặc đăng nhập với
        </div>
        <div className="flex justify-center gap-4">
          <button aria-label="Đăng nhập Zalo">
            <img
              src="/images/Icons/zalo_icon.webp"
              alt="Zalo"
              className="w-8 h-8"
            />
          </button>
          <button aria-label="Đăng nhập Facebook">
            <img
              src="/images/Icons/facebook_icon.png"
              alt="Facebook"
              className="w-8 h-8"
            />
          </button>
        </div>
      </div>

      <Modal
        visible={isModalOpen}
        title="Thông báo lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        zIndex={1200}
        className="rounded-xl"
      >
        <div className="p-6 text-center bg-white rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error || "Đã có lỗi xảy ra."}</p>
          <Button
            variant="primary"
            onClick={() => {
              setIsModalOpen(false);
              setError(null);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginScreen;
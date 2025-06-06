// src/pages/ResetPasswordScreen.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = location.state?.phoneNumber;
  const verifiedOtp = location.state?.otp; // Nhận OTP từ màn hình trước

  // Redirect if phone number or OTP is missing
  useEffect(() => {
    if (!phoneNumber || !verifiedOtp) {
      console.warn("Thiếu thông tin cần thiết, chuyển hướng về forgot password.");
      navigate("/forgot-password", { replace: true });
    }
  }, [phoneNumber, verifiedOtp, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          phoneNumber,
          newPassword,
          otp: verifiedOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(error.response.data.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
        }
      } else {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      <div className="bg-gray-200 flex items-center justify-center h-[60%]">
        <img
          src="/images/bg_app.png"
          alt="Ảnh nền đặt lại mật khẩu"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      <form
        onSubmit={handleResetPassword}
        className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-6"
      >
        <h1 className="text-3xl font-bold text-center mb-4">
          Đặt lại mật khẩu
        </h1>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="border-b w-full p-2 pr-16 outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Xác nhận"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordScreen;
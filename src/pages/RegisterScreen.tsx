// src/pages/RegisterScreen.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const RegisterScreen = () => {
  // ... (state declarations remain the same) ...
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    console.log("Đăng ký với:", { fullName, phoneNumber, password });
    // navigate('/some-other-page');
  };

  const goBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    // 2. Thêm 'relative'
    <div className="relative flex flex-col h-full">
      {/* 3. Thêm nút Quay lại */}
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded" // Styling cho nút
      >
        <ChevronLeft size={25} /> {/* Icon lớn hơn */}
        <span className="text-lg font-medium">Quay lại</span>{" "}
        {/* Chữ lớn hơn */}
      </button>

      {/* Phần ảnh */}
      <div className="bg-gray-200 flex items-center justify-center h-[28%] overflow-hidden">
        <img
          src="/images/bg_app.png"
          alt="Ảnh nền đăng ký"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      {/* Phần form đăng ký */}
      <div className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-5">
        {/* ... (rest of the form code remains the same) ... */}
        <h1 className="text-3xl font-bold mb-4 text-center">Đăng ký</h1>
        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <p className="text-xs text-gray-500 text-center px-4 pt-2">
          Bằng cách đăng ký, bạn đồng ý với các{" "}
          <a
            href="/terms"
            className="text-orange-500 hover:underline font-medium"
          >
            Điều khoản
          </a>{" "}
          &{" "}
          <a
            href="/policy"
            className="text-orange-500 hover:underline font-medium"
          >
            Chính sách
          </a>{" "}
          của chúng tôi.
        </p>
        <button
          onClick={handleRegister}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4"
        >
          Đăng ký
        </button>
        <div className="text-center text-sm pt-2">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-orange-500 hover:underline font-medium"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

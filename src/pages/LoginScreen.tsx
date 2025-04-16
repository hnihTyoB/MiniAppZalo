// src/pages/LoginScreen.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState(""); // Thêm state cho số điện thoại
  const [password, setPassword] = useState(""); // Thêm state cho mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    navigate(-1);
  };

  // --- Hàm xử lý đăng nhập ---
  const handleLogin = () => {
    // --- BẮT ĐẦU PHẦN GIẢ LẬP XÁC THỰC ---
    // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây để kiểm tra phoneNumber và password
    console.log("Đăng nhập với:", { phoneNumber, password });
    // Giả sử đăng nhập thành công
    const isLoggedIn = true; // Thay bằng logic kiểm tra thực tế
    // --- KẾT THÚC PHẦN GIẢ LẬP XÁC THỰC ---

    if (isLoggedIn) {
      // Nếu đăng nhập thành công, chuyển đến trang Home
      navigate("/home"); // Điều hướng đến trang Home
    } else {
      // Xử lý khi đăng nhập thất bại (ví dụ: hiển thị thông báo lỗi)
      alert("Số điện thoại hoặc mật khẩu không đúng!");
    }
  };
  // --- Kết thúc hàm xử lý đăng nhập ---

  return (
    <div className="relative flex flex-col h-full">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      <div className="bg-gray-200 flex items-center justify-center h-[50%]">
        <img
          src="/images/bg_app.png"
          alt="Ảnh"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      <div className="bg-white flex-1 rounded-t-3xl p-4 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Đăng nhập</h1>
        {/* Cập nhật input số điện thoại */}
        <input
          type="tel" // Nên dùng type="tel" cho số điện thoại
          placeholder="Số điện thoại"
          value={phoneNumber} // Liên kết với state
          onChange={(e) => setPhoneNumber(e.target.value)} // Cập nhật state khi thay đổi
          className="border-b w-full p-2 mb-4 outline-none focus:border-orange-400" // Thêm focus style
        />
        {/* Cập nhật input mật khẩu */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password} // Liên kết với state
            onChange={(e) => setPassword(e.target.value)} // Cập nhật state khi thay đổi
            className="border-b w-full p-2 pr-20 outline-none focus:border-orange-400" // Thêm focus style
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

        {/* Cập nhật nút Đăng nhập */}
        <button
          onClick={handleLogin} // Gắn hàm xử lý đăng nhập vào sự kiện onClick
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded"
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
    </div>
  );
};

export default LoginScreen;

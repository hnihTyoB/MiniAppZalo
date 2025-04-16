// src/pages/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const ForgotPasswordScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const handleSendOtp = () => {
    // --- BẮT ĐẦU PHẦN GIẢ LẬP GỌI API ---
    // Kiểm tra SĐT hợp lệ (ví dụ đơn giản)
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }
    console.log("Yêu cầu đặt lại mật khẩu cho SĐT:", phoneNumber);
    // Giả lập gọi API thành công
    const isSuccess = true; // Thay đổi thành false để test trường hợp lỗi
    // --- KẾT THÚC PHẦN GIẢ LẬP GỌI API ---

    if (isSuccess) {
      // Điều hướng đến trang nhập OTP và truyền số điện thoại qua state
      navigate("/verify-otp", { state: { phoneNumber: phoneNumber } });
    } else {
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Nút Quay lại */}
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} /> {/* Icon lớn hơn */}
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      {/* Phần ảnh */}
      <div className="bg-gray-200 flex items-center justify-center h-[60%]">
        <img
          src="/images/bg_app.png"
          alt="Ảnh nền quên mật khẩu"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      {/* Phần form */}
      <div className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Quên mật khẩu</h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          Nhập số điện thoại đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
        </p>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <button
          onClick={handleSendOtp}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;

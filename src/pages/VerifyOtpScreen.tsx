// src/pages/VerifyOtpScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const VerifyOtpScreen = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = location.state?.phoneNumber || "số điện thoại của bạn";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Logic đếm lùi ---
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  // --- Logic xử lý input OTP ---
  const handleOtpChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- Logic nút ---
  const goBack = () => {
    navigate(-1);
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      alert("Vui lòng nhập đủ 4 chữ số OTP.");
      return;
    }
    console.log("Xác thực OTP:", enteredOtp, "cho SĐT:", phoneNumber);
    alert("Đã gửi OTP (Kiểm tra console log)");
    // navigate('/reset-password', { state: { phoneNumber, otp: enteredOtp } });
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    console.log("Gửi lại OTP cho SĐT:", phoneNumber);
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
    alert("Đã gửi lại OTP (Kiểm tra console log)");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    // Thêm relative vào container chính
    <div className="relative flex flex-col h-full">
      {/* Nút Quay lại (giữ nguyên vị trí absolute) */}
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-white hover:text-gray-200 px-3 py-2 rounded" // Giữ màu trắng để nổi trên ảnh
      >
        <ChevronLeft size={25} /> {/* Icon lớn hơn */}
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      {/* Phần ảnh */}
      <div className="bg-gray-200 flex items-center justify-center h-[52%]">
        {" "}
        {/* Đặt chiều cao cho ảnh */}
        <img
          src="/images/taoanhdep_ghibli_15139.jpeg" // Sử dụng cùng ảnh hoặc ảnh khác
          alt="Ảnh nền OTP"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Phần form OTP */}
      <div className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto flex flex-col items-center space-y-6">
        {" "}
        {/* Thêm flex flex-col items-center */}
        {/* Nội dung form giữ nguyên nhưng nằm trong div này */}
        <h1 className="text-2xl font-bold text-center">Nhập mã OTP</h1>
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Nhập mã xác minh 4 chữ số được gửi đến số điện thoại di động{" "}
          <span className="font-medium">{phoneNumber}</span>.
        </p>
        <div className="flex justify-center gap-3 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          ))}
        </div>
        <div className="text-center text-sm">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="text-orange-500 hover:underline font-medium"
            >
              Gửi lại mã
            </button>
          ) : (
            <span className="text-gray-500">
              Gửi lại mã trong {formatTime(timer)} giây
            </span>
          )}
        </div>
        <button
          onClick={handleVerifyOtp}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full max-w-xs rounded-lg text-lg font-semibold mt-4 disabled:opacity-50"
          disabled={otp.join("").length !== 4}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpScreen;

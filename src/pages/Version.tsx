// src/pages/Version.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react"; // Thêm Info icon

const Version = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  // --- Thông tin phiên bản (Có thể lấy từ biến môi trường hoặc file config) ---
  const appName = "G2 Schedual a car repair"; // <<< Tên ứng dụng của bạn
  const appVersion = "1.0.0"; // <<< Phiên bản hiện tại
  const buildNumber = "20240726.1"; // <<< Số bản dựng (tùy chọn)
  const copyrightYear = new Date().getFullYear();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-2xl font-semibold text-center flex-1 text-gray-800">
          Phiên bản ứng dụng
        </h2>
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-4">
        {/* Logo (Thay bằng logo thực tế của bạn) */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Info size={40} className="text-orange-500" />
        </div>

        {/* Tên ứng dụng */}
        <h1 className="text-2xl font-bold text-gray-800">{appName}</h1>

        {/* Số phiên bản */}
        <p className="text-base text-gray-600">Phiên bản {appVersion}</p>

        {/* Số bản dựng (tùy chọn) */}
        {buildNumber && (
          <p className="text-sm text-gray-500">Bản dựng: {buildNumber}</p>
        )}

        {/* Thông tin bản quyền */}
        <p className="text-xs text-gray-400 mt-8">
          © {copyrightYear} PTIT. All rights reserved.
        </p>

        {/* Liên kết (tùy chọn) */}
        <div className="flex gap-4 text-xs text-orange-500">
          <button
            onClick={() => navigate("/terms")} // <<< Cần tạo route và trang Terms
            className="hover:underline"
          >
            Điều khoản dịch vụ
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => navigate("/policy")} // <<< Cần tạo route và trang Policy
            className="hover:underline"
          >
            Chính sách bảo mật
          </button>
        </div>
      </div>
    </div>
  );
};

export default Version;

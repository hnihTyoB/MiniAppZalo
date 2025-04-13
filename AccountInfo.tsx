// src/pages/AccountInfo.tsx
import React from "react";
import { ChevronLeft, User } from "lucide-react"; // Đổi lại thứ tự import cho nhất quán
import { useNavigate } from "react-router-dom";

const AccountInfo = () => {
  const navigate = useNavigate();

  // TODO: Lấy thông tin người dùng từ state/context/API thay vì hardcode
  const userInfo = {
    name: "Nguyễn Chí Thịnh",
    dob: "11/08/2004",
    phone: "1234509876",
    address: "97 Man Thiện, Hiệp Phú, Thủ Đức, TP.HCM",
    gender: "Nam",
  };

  const handleEditClick = () => {
    // TODO: Điều hướng đến trang chỉnh sửa thông tin
    navigate("/edit-profile");
    // navigate('/edit-profile'); // Ví dụ
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-1 mr-2 -ml-1">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1">
          Thông tin tài khoản
        </h2>
        <div className="w-8"></div> {/* Placeholder for balance */}
      </div>

      {/* Phần nội dung chính: Thêm pb-20 */}
      <div className="flex-grow overflow-y-auto p-6 pb-20">
        {" "}
        {/* <<< THÊM pb-20 */}
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <User size={48} />
          </div>
        </div>
        {/* Thông tin */}
        <div className="space-y-4">
          {[
            { label: "Họ và tên", value: userInfo.name },
            { label: "Ngày sinh", value: userInfo.dob },
            { label: "Số điện thoại", value: userInfo.phone },
            { label: "Địa chỉ", value: userInfo.address },
            { label: "Giới tính", value: userInfo.gender },
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

      {/* Button: Chuyển thành fixed bottom */}
      {/* <<< THAY ĐỔI CONTAINER VÀ NÚT >>> */}
      <div className="fixed bottom-0 left-0 w-full z-10">
        {" "}
        {/* Container cố định */}
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full" // Style giống nút Bắt đầu
          onClick={handleEditClick}
        >
          Chỉnh sửa
        </button>
      </div>
      {/* <<< KẾT THÚC THAY ĐỔI >>> */}
    </div>
  );
};

export default AccountInfo;

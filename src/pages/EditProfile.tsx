// src/pages/EditProfile.tsx
import React, { useState, useRef, ChangeEvent } from "react";
import { ChevronLeft, User, Camera } from "lucide-react"; // Thêm Camera icon
import { useNavigate } from "react-router-dom";
import { Select } from "zmp-ui"; // Hoặc tên component tương ứng

const EditProfile = () => {
  const navigate = useNavigate();

  // --- State cho thông tin người dùng (lấy từ props/context/API hoặc hardcode) ---
  // TODO: Lấy thông tin người dùng hiện tại để khởi tạo state
  const initialUserInfo = {
    name: "Nguyễn Chí Thịnh",
    dob: "2004-08-11", // Sử dụng định dạng YYYY-MM-DD cho input type="date"
    phone: "1234509876",
    address: "97 Man Thiện, Hiệp Phú, Thủ Đức, TP.HCM",
    gender: "Nam",
    avatarUrl: null as string | null, // Thêm avatarUrl
  };

  const [name, setName] = useState(initialUserInfo.name);
  const [dob, setDob] = useState(initialUserInfo.dob);
  const [phone, setPhone] = useState(initialUserInfo.phone);
  const [address, setAddress] = useState(initialUserInfo.address);
  const [gender, setGender] = useState(initialUserInfo.gender);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialUserInfo.avatarUrl
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Ref cho input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Xử lý thay đổi ảnh đại diện ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Kích hoạt input file khi nhấn vào avatar
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Tạo URL tạm thời để xem trước ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGenderChange = (selectedValue: string | number) => {
    // Chuyển đổi selectedValue thành string nếu cần
    setGender(String(selectedValue));
  };

  // --- Xử lý lưu thay đổi ---
  const handleSaveChanges = () => {
    // TODO: Xử lý logic lưu thay đổi (gọi API)
    const updatedInfo = {
      name,
      dob,
      phone,
      address,
      gender,
      // avatarFile // Gửi file này lên server nếu có thay đổi
    };
    console.log("Lưu thông tin:", updatedInfo);
    if (avatarFile) {
      console.log("Ảnh đại diện mới:", avatarFile.name);
      // Thêm logic upload file ở đây
    }

    // Sau khi lưu thành công, quay lại trang thông tin
    alert("Đã lưu thay đổi (Kiểm tra console log)");
    navigate("/account"); // Hoặc navigate(-1) để quay lại trang trước
  };

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
        <div className="w-8"></div> {/* Placeholder for balance */}
      </div>

      {/* Phần nội dung chính: Thêm pb-20 */}
      <div className="flex-grow overflow-y-auto p-6 pb-20">
        {/* Avatar có thể chỉnh sửa */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            {/* Nút/Icon để thay đổi ảnh */}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-orange-400 hover:bg-orange-500 text-white p-1.5 rounded-full border-2 border-white"
              aria-label="Thay đổi ảnh đại diện"
            >
              <Camera size={16} />
            </button>
            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" // Chỉ chấp nhận file ảnh
              className="hidden"
            />
          </div>
        </div>

        {/* Form chỉnh sửa thông tin */}
        <div className="space-y-4">
          {/* Họ và tên */}
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
          {/* Ngày sinh */}
          <div>
            <label
              htmlFor="dob"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Ngày sinh
            </label>
            <input
              id="dob"
              type="date" // Sử dụng input date
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          {/* Số điện thoại */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          {/* Địa chỉ */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm text-gray-600 mb-1 font-bold"
            >
              Địa chỉ
            </label>
            <input // Hoặc dùng <textarea> nếu muốn nhập nhiều dòng
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          {/* Giới tính */}
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-bold">
              Giới tính
            </label>
            <Select
              value={gender}
              onChange={handleGenderChange}
              placeholder="Chọn giới tính"
              // <<< XÓA className khỏi đây >>>
            >
              <Select.Option value="Nam" title="Nam" />
              <Select.Option value="Nữ" title="Nữ" />
              <Select.Option value="Khác" title="Khác" />
            </Select>
          </div>
        </div>
      </div>

      {/* Nút Lưu thay đổi */}
      <div className="fixed bottom-0 left-0 w-full z-10">
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full"
          onClick={handleSaveChanges}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default EditProfile;

// src/pages/BranchDetail.tsx
import React, { useState } from "react";
import {
  ChevronLeft,
  Share2,
  Heart,
  Phone,
  MessageCircle,
  MapPin, // <<< THÊM ICON
  Star, // <<< THÊM ICON SAO
  ImageIcon, // <<< THÊM ICON PLACEHOLDER
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // <<< THÊM useLocation
import clsx from "clsx"; // <<< THÊM clsx

// <<< THÊM Interface Branch (giống Home.tsx và Bookings.tsx) >>>
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
  // Thêm các thuộc tính khác nếu cần (mô tả, đánh giá chi tiết,...)
}

const BranchDetail = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <<< Lấy location
  const [activeTab, setActiveTab] = useState("thông tin"); // <<< Đổi state mặc định

  // <<< Lấy dữ liệu chi nhánh từ state truyền qua >>>
  const branchData: Branch | null = location.state?.branchData;

  // <<< Dữ liệu mẫu nếu không có state (dùng để test) >>>
  const defaultBranch: Branch = {
    id: 0,
    name: "Trung tâm sửa chữa ô tô PTIT",
    address: "97 Man Thiện, Hiệp Phú, Thủ Đức",
    imageUrl: "/images/branch-1.jpg", // <<< Cần có ảnh mẫu
  };

  const branch = branchData || defaultBranch; // Ưu tiên dữ liệu từ state

  const goBack = () => {
    navigate(-1);
  };

  // <<< Danh sách tabs >>>
  const tabs = ["Thông tin", "Dịch vụ", "Đánh giá", "Liên hệ"];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {" "}
      {/* Đổi nền sang xám nhạt */}
      {/* Header image + icons */}
      {/* <<< SỬA HEADER >>> */}
      <div className="relative h-48 bg-gray-300 group">
        {/* Ảnh nền */}
        {branch.imageUrl ? (
          <img
            src={branch.imageUrl}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Lớp phủ mờ nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
        {/* Các nút điều khiển */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-7 flex justify-between items-center z-10">
          {/* Nút Quay lại */}
          <button
            onClick={goBack}
            // Thêm flex, gap, padding và text, bỏ background, làm tròn
            className="flex items-center gap-1 text-white hover:opacity-80 py-1 rounded transition-opacity"
            aria-label="Quay lại" // Giữ lại aria-label
          >
            <ChevronLeft size={25} />
            {/* Thêm chữ Quay lại */}
            <span className="text-lg font-medium">Quay lại</span>
          </button>
          {/* Các nút bên phải */}
          <div className="flex space-x-2">
            <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-white">
              <Share2 size={18} />
            </button>
            <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-orange-500 hover:bg-white">
              {/* TODO: Thêm logic xử lý yêu thích */}
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>
      {/* <<< KẾT THÚC SỬA HEADER >>> */}
      {/* Phần nội dung chính (cho phép cuộn và có padding đáy) */}
      {/* <<< SỬA CONTAINER NỘI DUNG >>> */}
      <div className="flex-1 overflow-y-auto pb-36">
        {" "}
        {/* Tăng pb để chứa footer */}
        {/* Info cơ bản */}
        <div className="px-4 pt-4 pb-3 bg-white shadow-sm">
          {/* <<< SỬA LAYOUT RATING >>> */}
          <div className="flex items-center justify-between mb-1">
            <span className="bg-orange-100 text-orange-500 px-2 py-0.5 rounded-md text-xs font-medium">
              Sửa xe ô tô {/* TODO: Lấy loại hình từ data */}
            </span>
            {/* Đẩy rating sang phải */}
            <div className="flex items-center text-sm text-gray-600 ml-auto">
              <Star
                size={14}
                className="text-yellow-400 mr-1 fill-yellow-400"
              />
              <span className="font-medium">4.8</span>
              <span className="text-gray-400 ml-1">(234)</span>{" "}
              {/* TODO: Lấy rating từ data */}
            </div>
          </div>
          {/* <<< KẾT THÚC SỬA LAYOUT RATING >>> */}
          <h1 className="font-semibold text-lg mb-0.5">{branch.name}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span>{branch.address}</span>
          </div>
        </div>
        {/* Tabs */}
        {/* <<< SỬA LAYOUT TABS >>> */}
        <div className="flex mt-3 bg-white border-y border-gray-200 sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              // Chia đều chiều rộng, căn giữa text
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors duration-150",
                activeTab === tab.toLowerCase()
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* <<< KẾT THÚC SỬA LAYOUT TABS >>> */}
        {/* Tab content */}
        <div className="px-4 py-4 bg-white mt-3">
          {" "}
          {/* Thêm nền trắng và margin top */}
          {activeTab === "thông tin" && (
            <>
              <h2 className="font-semibold mb-2 text-base">Về chúng tôi</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
                {/* Nút xem thêm có thể làm component riêng nếu phức tạp */}
                {/* <span className="text-orange-400 font-medium cursor-pointer hover:underline"> Xem thêm</span> */}
              </p>
              {/* Thêm các thông tin khác nếu cần: Giờ mở cửa, Tiện ích,... */}
            </>
          )}
          {activeTab === "dịch vụ" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">Dịch vụ</h2>
              <p className="text-sm text-gray-500">
                Chưa có thông tin dịch vụ.
              </p>
              {/* TODO: Hiển thị danh sách dịch vụ */}
            </div>
          )}
          {activeTab === "đánh giá" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">Đánh giá</h2>
              <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
              {/* TODO: Hiển thị danh sách đánh giá */}
            </div>
          )}
          {activeTab === "liên hệ" && (
            <div>
              <h2 className="font-semibold mb-2 text-base">
                Thông tin liên hệ
              </h2>
              <p className="text-sm text-gray-500">
                Chi tiết liên hệ của chi nhánh.
              </p>
              {/* TODO: Hiển thị thông tin liên hệ chi tiết */}
            </div>
          )}
        </div>
      </div>
      {/* <<< KẾT THÚC SỬA CONTAINER NỘI DUNG >>> */}
      {/* <<< THÊM FOOTER CỐ ĐỊNH >>> */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 space-y-3 z-10">
        {/* Phần liên hệ (đã được rút gọn) */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 mr-3">
            {/* Avatar quản lý */}
            <img
              src="/images/avatar-placeholder.png"
              alt="Quản lý"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <p className="font-medium text-sm">Chí Thịnh</p>{" "}
            {/* TODO: Lấy tên quản lý */}
            <p className="text-xs text-gray-500">Quản lý</p>
          </div>
          {/* Đẩy nút sang phải */}
          <div className="flex ml-auto space-x-2">
            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-200 transition-colors">
              <Phone size={18} className="text-orange-500" />
            </button>
            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-orange-200 transition-colors">
              <MessageCircle size={18} className="text-orange-500" />
            </button>
          </div>
        </div>

        {/* Nút đặt lịch */}
        <button
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors"
          onClick={() => navigate("/bookings")} // <<< SỬA ĐƯỜNG DẪN
        >
          Đặt lịch ngay
        </button>
      </div>
      {/* <<< KẾT THÚC FOOTER CỐ ĐỊNH >>> */}
    </div>
  );
};

export default BranchDetail;

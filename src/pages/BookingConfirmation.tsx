// src/pages/BookingConfirmation.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  Home,
  ListChecks,
  ChevronLeft,
  Copy, // <<< THÊM ICON COPY
} from "lucide-react";
import { toast } from "react-toastify"; // <<< THÊM: Import toast (nếu bạn dùng react-toastify)
import "react-toastify/dist/ReactToastify.css"; // <<< THÊM: CSS cho toast

// --- Interface (giữ nguyên) ---
interface BookingConfirmationData {
  id: string;
  branch: string;
  service: string;
  date: string;
  time: string;
  imageUrl?: string;
  address?: string;
}

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingData: BookingConfirmationData | null =
    location.state?.bookingDetails;

  const goBack = () => {
    navigate(-1);
  };

  // <<< THÊM: Hàm xử lý copy ID >>>
  const handleCopyId = () => {
    if (bookingData?.id) {
      navigator.clipboard
        .writeText(bookingData.id)
        .then(() => {
          // Hiển thị thông báo thành công (ví dụ dùng react-toastify)
          // Bạn có thể thay bằng alert hoặc cách khác nếu không dùng toast
          toast.success("Đã sao chép ID!", {
            position: "bottom-center",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
          });
          console.log("Copied ID:", bookingData.id);
        })
        .catch((err) => {
          console.error("Lỗi khi sao chép ID:", err);
          alert("Không thể sao chép ID."); // Thông báo lỗi đơn giản
        });
    }
  };

  if (!bookingData) {
    React.useEffect(() => {
      navigate("/home");
    }, [navigate]);
    return null;
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-6 text-center">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white/50 backdrop-blur-sm flex items-center gap-2"
        aria-label="Quay lại"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      <CheckCircle size={64} className="text-green-500 mb-5 animate-pulse" />

      <h1 className="text-2xl font-bold text-gray-800 mb-3">
        Đặt lịch thành công!
      </h1>
      <p className="text-sm text-gray-600 mb-6 max-w-xs">
        Lịch hẹn của bạn đã được xác nhận. Vui lòng kiểm tra thông tin chi tiết
        bên dưới.
      </p>

      {/* Khung tóm tắt thông tin */}
      <div className="bg-white rounded-xl shadow-md p-5 w-full max-w-md space-y-3 text-left mb-8 border border-gray-100">
        <h2 className="font-semibold text-center text-base mb-2 border-b pb-4">
          {" "}
          {/* Giảm mb */}
          Chi tiết lịch hẹn
        </h2>

        {/* <<< THÊM: Hiển thị ID và nút Copy >>> */}
        <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
          {" "}
          {/* Căn giữa, thêm mb */}
          <span>ID: {bookingData.id}</span>
          <button
            onClick={handleCopyId}
            className="ml-1.5 text-gray-400 hover:text-orange-500 transition-colors"
            title="Sao chép ID"
          >
            <Copy size={14} />
          </button>
        </div>
        {/* <<< KẾT THÚC THÊM ID >>> */}

        {/* Thông tin còn lại */}
        <div className="flex items-center text-sm">
          <Wrench size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20">Dịch vụ:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.service}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <MapPin size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20">Chi nhánh:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.branch}
          </span>
        </div>
        {bookingData.address && (
          <div className="flex items-start text-sm pl-[34px]">
            <span className="text-xs text-gray-500">{bookingData.address}</span>
          </div>
        )}
        <div className="flex items-center text-sm">
          <Calendar
            size={16}
            className="text-orange-500 mr-2.5 flex-shrink-0"
          />
          <span className="text-gray-500 w-20">Ngày:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.date}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20">Giờ:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.time}
          </span>
        </div>

        {/* <<< BỎ ID Ở ĐÂY >>> */}
        {/* <div className="text-xs text-gray-400 text-center pt-2">
          ID: {bookingData.id}
        </div> */}
      </div>

      {/* Các nút hành động */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => navigate("/notifications")}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ListChecks size={18} />
          Xem lịch hẹn của tôi
        </button>
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Quay về Trang chủ
        </button>
      </div>

      {/* <<< THÊM: Container cho Toastify >>> */}
      {/* Đảm bảo bạn đã cài đặt react-toastify: npm install react-toastify */}
      {/* Và import ToastContainer ở file App.tsx hoặc layout chính */}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default BookingConfirmation;

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
  Copy,
  Car,
  StickyNote,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";

// Cập nhật Interface: service thành services (array), thêm notes
interface BookingConfirmationData {
  id: string;
  branch: string;
  // service: string; // Thay đổi
  services: string[]; // Mảng tên dịch vụ
  date: string;
  time: string;
  imageUrl?: string;
  address?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
  notes?: string;
}

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu booking từ state, đảm bảo đúng kiểu
  const bookingData = location.state
    ?.bookingDetails as BookingConfirmationData | null;

  const goBack = () => navigate(-1);

  const handleCopyId = () => {
    if (bookingData?.id) {
      navigator.clipboard
        .writeText(bookingData.id)
        .then(() =>
          toast.success("Đã sao chép ID!", {
            autoClose: 2000,
            hideProgressBar: true,
          })
        )
        .catch((err) => {
          console.error("Lỗi khi sao chép ID:", err);
          toast.error("Không thể sao chép ID.");
        });
    }
  };

  // Nếu không có dữ liệu booking, quay về trang chủ
  React.useEffect(() => {
    if (!bookingData) {
      console.warn("Không tìm thấy bookingDetails, điều hướng về /home");
      navigate("/home", { replace: true });
    }
  }, [bookingData, navigate]);

  // Render null hoặc loading nếu chưa có data
  if (!bookingData) {
    return null; // Hoặc một component loading
  }

  // Ghép các dịch vụ thành chuỗi để hiển thị
  const servicesString = bookingData.services?.join(", ") || "N/A";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Nút quay lại */}
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white/50 backdrop-blur-sm flex items-center gap-2"
        aria-label="Quay lại"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      {/* Icon và Tiêu đề */}
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
          Chi tiết lịch hẹn
        </h2>

        {/* ID và nút Copy */}
        <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
          <span>ID: {bookingData.id}</span>
          <button
            onClick={handleCopyId}
            className="ml-1.5 text-gray-400 hover:text-orange-500 transition-colors"
            title="Sao chép ID"
          >
            <Copy size={14} />
          </button>
        </div>

        {/* --- Thông tin Xe --- */}
        {bookingData.vehicleMake &&
          bookingData.vehicleModel &&
          bookingData.vehicleLicensePlate && (
            <div className="flex items-center text-sm">
              <Car size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
              <span className="text-gray-500 w-20 shrink-0">Xe:</span>
              {/* Thêm truncate để xử lý tràn */}
              <span className="font-medium text-gray-800 ml-2 truncate">
                {bookingData.vehicleMake} {bookingData.vehicleModel} (
                {bookingData.vehicleLicensePlate})
              </span>
            </div>
          )}

        {/* --- Thông tin Dịch vụ --- */}
        <div className="flex items-start text-sm">
          {" "}
          {/* items-start nếu dịch vụ quá dài */}
          <Wrench
            size={16}
            className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5"
          />
          <span className="text-gray-500 w-20 shrink-0">Dịch vụ:</span>
          {/* Không dùng truncate ở đây vì có thể nhiều dịch vụ */}
          <span className="font-medium text-gray-800 ml-2">
            {servicesString}
          </span>
        </div>

        {/* --- Ghi chú --- */}
        {bookingData.notes && (
          <div className="flex items-start text-sm">
            <StickyNote
              size={16}
              className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5"
            />
            <span className="text-gray-500 w-20 shrink-0">Ghi chú:</span>
            {/* Sử dụng truncate để hiển thị ... khi quá dài */}
            <span className="text-sm text-gray-700 ml-2 italic truncate">
              {bookingData.notes}
            </span>
          </div>
        )}

        {/* --- Thông tin Chi nhánh --- */}
        <div className="flex items-start text-sm">
          {" "}
          {/* items-start nếu tên chi nhánh dài */}
          <MapPin
            size={16}
            className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5"
          />
          <span className="text-gray-500 w-20 shrink-0">Chi nhánh:</span>
          {/* Thêm truncate */}
          <span className="font-medium text-gray-800 ml-2 truncate">
            {bookingData.branch}
          </span>
        </div>
        {bookingData.address && (
          // Hiển thị địa chỉ, cho phép xuống dòng
          <div className="flex items-start text-sm pl-[26px]">
            {" "}
            {/* Căn lề với icon */}
            <span className="text-xs text-gray-500 whitespace-pre-wrap">
              {bookingData.address}
            </span>
          </div>
        )}

        {/* --- Ngày & Giờ --- */}
        <div className="flex items-center text-sm">
          <Calendar
            size={16}
            className="text-orange-500 mr-2.5 flex-shrink-0"
          />
          <span className="text-gray-500 w-20 shrink-0">Ngày:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.date}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20 shrink-0">Giờ:</span>
          <span className="font-medium text-gray-800 ml-2">
            {bookingData.time}
          </span>
        </div>
      </div>

      {/* --- Các nút hành động --- */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => navigate("/schedule")}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ListChecks size={18} /> Xem lịch hẹn của tôi
        </button>
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} /> Quay về Trang chủ
        </button>
      </div>

      {/* Container cho Toastify */}
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
};

export default BookingConfirmation;

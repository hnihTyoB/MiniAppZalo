// src/components/admin/BookingManagement.tsx
import React, { useState } from "react";
import { Modal, Select, Button } from "zmp-ui"; // <<< THÊM LẠI Button
import { Search, Check, X, Eye, CalendarCheck } from "lucide-react";
// <<< THÊM: Import dữ liệu người dùng mẫu (Tạm thời) >>>
import { mockUsers } from "./UserManagement"; // Giả sử UserManagement ở cùng cấp

// Interface mẫu cho Booking
interface BookingData {
  id: string;
  customerId: string; // <<< THÊM ID KHÁCH HÀNG
  customerName: string; // Lấy từ user hoặc lưu trực tiếp
  vehicleInfo: string; // Ví dụ: "Toyota Vios (51K-111.11)"
  services: string[];
  branchName: string;
  branchId: string; // <<< THÊM: ID chi nhánh để lọc KTV
  dateTime: string; // Ví dụ: "20/07/2024 - 10:00 AM - 12:00 PM"
  technicianName?: string; // <<< THÊM: Tên kỹ thuật viên được phân công
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

// Dữ liệu mẫu
const mockBookings: BookingData[] = [
  {
    id: "bk001",
    customerId: "u001", // <<< Ví dụ
    customerName: "Nguyễn Văn A",
    vehicleInfo: "Toyota Vios (51K-111.11)",
    services: ["Thay dầu", "Rửa xe"],
    branchName: "PTIT - Chi nhánh 1",
    branchId: "b001", // <<< Ví dụ
    dateTime: "28/07/2024 - 10:00 AM - 12:00 PM",
    technicianName: "Lý Văn Kỹ Thuật", // <<< Ví dụ
    status: "pending",
  },
  {
    id: "bk002",
    customerId: "u002", // <<< Ví dụ
    customerName: "Trần Thị B",
    vehicleInfo: "Honda City (51K-222.22)",
    services: ["Bảo dưỡng"],
    branchName: "PTIT - Chi nhánh 2",
    branchId: "b001", // <<< Ví dụ
    dateTime: "29/07/2024 - 09:00 AM - 11:00 AM",
    technicianName: "Lý Văn Kỹ Thuật", // <<< Ví dụ
    status: "confirmed",
  },
  {
    id: "bk003",
    customerId: "u003", // <<< Ví dụ
    customerName: "Lê Văn C",
    vehicleInfo: "Ford Ranger (51K-333.33)",
    services: ["Sửa chữa"],
    branchName: "PTIT - Chi nhánh 1",
    branchId: "b001", // <<< Ví dụ
    dateTime: "27/07/2024 - 14:00 PM - 16:00 PM",
    technicianName: "Lý Văn Kỹ Thuật", // <<< Ví dụ
    status: "completed",
  },
  {
    id: "bk004",
    customerId: "u004", // <<< Ví dụ
    customerName: "Phạm Thị D",
    vehicleInfo: "Kia Seltos (51K-444.44)",
    services: ["Kiểm tra tổng quát"],
    branchName: "Chi nhánh Quận 9",
    branchId: "b001", // <<< Ví dụ (Giả sử có chi nhánh này)
    dateTime: "30/07/2024 - 11:00 AM - 01:00 PM",
    // technicianName: undefined,
    status: "cancelled",
  },
  // Thêm lịch hẹn khác...
];

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // <<< THÊM STATE CHO MODALS >>>
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [bookingToAction, setBookingToAction] = useState<string | null>(null);

  // Lọc lịch hẹn
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (id: string) => {
    // TODO: Mở modal/trang chi tiết lịch hẹn
    console.log("Xem chi tiết lịch hẹn:", id);
  };

  // <<< MỞ MODAL XÁC NHẬN >>>
  const requestConfirmBooking = (id: string) => {
    setBookingToAction(id);
    setShowConfirmModal(true);
  };

  // <<< MỞ MODAL HỦY >>>
  const requestCancelBooking = (id: string) => {
    setBookingToAction(id);
    setShowCancelModal(true);
  };

  // <<< MỞ MODAL HOÀN THÀNH >>>
  const requestCompleteBooking = (id: string) => {
    setBookingToAction(id);
    setShowCompleteModal(true);
  };

  // <<< HÀM XỬ LÝ KHI XÁC NHẬN TRONG MODAL >>>
  const executeConfirm = () => {
    if (bookingToAction) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToAction ? { ...b, status: "confirmed" } : b
        )
      );
      console.log("Đã xác nhận lịch hẹn:", bookingToAction);
    }
    setShowConfirmModal(false);
    setBookingToAction(null);
  };

  const executeCancel = () => {
    if (bookingToAction) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToAction ? { ...b, status: "cancelled" } : b
        )
      );
      console.log("Đã hủy lịch hẹn:", bookingToAction);
    }
    setShowCancelModal(false);
    setBookingToAction(null);
  };

  const executeComplete = () => {
    if (bookingToAction) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToAction ? { ...b, status: "completed" } : b
        )
      );
      console.log("Đã hoàn thành lịch hẹn:", bookingToAction);
    }
    setShowCompleteModal(false);
    setBookingToAction(null);
  };

  // <<< THÊM: Hàm xử lý phân công KTV >>>
  const handleAssignTechnician = (
    bookingId: string,
    techName: string | null
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, technicianName: techName || undefined } // Cập nhật tên KTV, nếu null thì thành undefined
          : b
      )
    );
    console.log(
      `Phân công KTV "${
        techName || "Chưa phân công"
      }" cho lịch hẹn ${bookingId}`
    );
  };

  return (
    <div>
      {/* Thanh công cụ: Tìm kiếm và Lọc */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        {/* <<< THAY THẾ Input bằng input >>> */}
        <div className="relative flex-grow w-full md:w-auto">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo ID, tên KH, xe, chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <Select
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(value) => setStatusFilter(String(value))}
          className="w-full md:w-52"
        >
          {statusOptions.map((opt) => (
            <Select.Option
              key={opt.value}
              value={opt.value}
              title={opt.label}
            />
          ))}
        </Select>
      </div>

      {/* Bảng lịch hẹn */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col" // <<< THÊM CỘT ID >>>
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20" // Giới hạn chiều rộng
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Khách hàng
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]" // <<< TĂNG ĐỘ RỘNG TỐI THIỂU
              >
                Xe / Dịch vụ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]" // <<< TĂNG ĐỘ RỘNG TỐI THIỂU
              >
                Thời gian nhận
              </th>
              <th
                scope="col" // <<< THÊM CỘT KỸ THUẬT VIÊN >>>
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]" // <<< TĂNG ĐỘ RỘNG >>>
              >
                Kỹ thuật viên
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* TODO: Render các hàng dữ liệu lịch hẹn */}
            {/* Ví dụ một hàng */}
            {filteredBookings.map((booking) => {
              // <<< Lọc danh sách KTV cho chi nhánh này >>>
              const techniciansForBranch = mockUsers.filter(
                (u) =>
                  u.role === "technician" && u.branchId === booking.branchId
              );

              return (
                <tr key={booking.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.customerId}
                    </div>{" "}
                    {/* <<< HIỂN THỊ ID KH Ở ĐÂY >>> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.vehicleInfo}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {booking.services.join(", ")}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {" "}
                    {/* <<< Hiển thị ngày và giờ trên 2 dòng >>> */}
                    <div className="text-sm text-gray-900">
                      {/* <<< Tách ngày và giờ >>> */}
                      {booking.dateTime.split(" - ")[0]} {/* Ngày */}
                    </div>
                    <div className="text-xs text-gray-500">
                      {/* <<< XÓA console.log ở đây >>> */}
                      {/* <<< Lấy phần giờ bắt đầu và kết thúc >>> */}
                      {booking.dateTime.split(" - ").slice(1).join(" - ")}
                      {/* Giờ */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* <<< THAY THẾ BẰNG SELECT >>> */}
                    <Select
                      placeholder="Chọn KTV..."
                      value={booking.technicianName || ""} // Giá trị hiện tại hoặc chuỗi rỗng
                      onChange={(value) =>
                        handleAssignTechnician(
                          booking.id,
                          String(value) || null
                        )
                      }
                      className="w-full text-sm" // <<< THÊM: Cho Select chiếm hết chiều rộng và đảm bảo text-sm >>>
                      disabled={
                        booking.status === "completed" ||
                        booking.status === "cancelled"
                      } // <<< Vô hiệu hóa nếu đã hoàn thành hoặc hủy >>>
                      // status={!booking.technicianName ? "warning" : "default"} // Đánh dấu nếu chưa chọn
                    >
                      {/* Option mặc định */}
                      <Select.Option value="" title="Chưa phân công">
                        Chưa phân công
                      </Select.Option>
                      {/* Lặp qua danh sách KTV đã lọc */}
                      {techniciansForBranch.map((tech) => (
                        <Select.Option
                          key={tech.id}
                          value={tech.name} // Lưu tên KTV
                          title={tech.name}
                        />
                      ))}
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* TODO: Style trạng thái đẹp hơn */}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusOptions.find((opt) => opt.value === booking.status)
                        ?.label || booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                    <button
                      onClick={() => handleViewDetails(booking.id)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => requestConfirmBooking(booking.id)} // <<< Mở modal
                          className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed" // <<< Thêm style disable
                          title="Xác nhận"
                          disabled={!booking.technicianName} // <<< Vô hiệu hóa nếu chưa có KTV
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => requestCancelBooking(booking.id)} // <<< Mở modal
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Hủy"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {/* <<< THÊM NÚT HOÀN THÀNH CHO TRẠNG THÁI ĐÃ XÁC NHẬN >>> */}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => requestCompleteBooking(booking.id)} // <<< Mở modal
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Đánh dấu hoàn thành"
                      >
                        <CalendarCheck size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan={7} // <<< CẬP NHẬT COLSPAN >>>
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Không tìm thấy lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* <<< THÊM CÁC MODAL XÁC NHẬN >>> */}
      <Modal
        visible={showConfirmModal}
        title="Xác nhận lịch hẹn"
        onClose={() => setShowConfirmModal(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowConfirmModal(false) },
          { text: "Xác nhận", onClick: executeConfirm, highLight: true },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn xác nhận lịch hẹn này không?
        </div>
      </Modal>

      <Modal
        visible={showCancelModal}
        title="Xác nhận hủy lịch hẹn"
        onClose={() => setShowCancelModal(false)}
        zIndex={1200}
        actions={[
          { text: "Không", onClick: () => setShowCancelModal(false) },
          { text: "Hủy lịch hẹn", onClick: executeCancel, danger: true },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn hủy lịch hẹn này không?
        </div>
      </Modal>

      <Modal
        visible={showCompleteModal}
        title="Xác nhận hoàn thành"
        onClose={() => setShowCompleteModal(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowCompleteModal(false) },
          { text: "Hoàn thành", onClick: executeComplete, highLight: true },
        ]}
      >
        <div className="p-4 text-center">
          Đánh dấu lịch hẹn này là đã hoàn thành?
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;

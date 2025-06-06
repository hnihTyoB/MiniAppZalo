import React, { useState, useEffect, useCallback } from "react";
import { Modal, Select, Button } from "zmp-ui";
import { Search, Check, X, Eye, CalendarCheck, User } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { useSnackbar } from "zmp-ui";

interface BookingData {
  id: string;
  customerId: string;
  customerName: string;
  vehicleInfo: string;
  services: string[];
  branchName: string;
  branchId: string;
  dateTime: string;
  technicianName?: string;
  technicianId?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

interface UserData {
  id: string;
  name: string;
  role: "technician" | "receptionist";
  branchId: string;
}

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [technicians, setTechnicians] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [bookingToAction, setBookingToAction] = useState<string | null>(null);
  const [technicianToAssign, setTechnicianToAssign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const snackbar = useSnackbar();

  const isPastAppointment = (dateTime: string) => {
    const [dateStr] = dateTime.split(" - ");
    const appointmentDate = new Date(dateStr);
    const now = new Date("2025-05-19T08:40:00+07:00"); // Thời gian hiện tại
    return appointmentDate < now;
  };

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setShowErrorModal(true);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/employees`, {
          params: { role: "technician" },
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedTechnicians = response.data.map((tech: any) => ({
          id: tech.id.toString(),
          name: tech.name,
          role: tech.role,
          branchId: tech.branchId?.toString(),
        }));
        setTechnicians(formattedTechnicians);
        console.log("Technicians state:", formattedTechnicians);
      } catch (error: any) {
        setError(error.response?.data?.message || "Không thể tải danh sách kỹ thuật viên.");
        setShowErrorModal(true);
      }
    };

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setShowErrorModal(true);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedBookings = await Promise.all(
          response.data.map(async (booking: any) => {
            let customerName = "Khách hàng không xác định";
            try {
              const userResponse = await axios.get(`${API_BASE_URL}/api/users/${booking.user_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              customerName = userResponse.data.name || customerName;
            } catch (error: any) {
              console.error(`Error fetching customer name for user ${booking.user_id}:`, error.message);
            }

            return {
              id: booking.id.toString(),
              customerId: booking.user_id,
              customerName,
              vehicleInfo: booking.vehicle_license_plate || "Không xác định",
              services: booking.services.map((s: any) => s.name),
              branchName: booking.branch_name,
              branchId: booking.branch_id?.toString(),
              dateTime: `${booking.appointment_date.split("T")[0]} - ${booking.time_slot_display}`,
              technicianName: booking.technician_name,
              technicianId: booking.technician_id?.toString(),
              status: booking.status,
            };
          })
        );

        setBookings(formattedBookings);
        console.log("Bookings state:", formattedBookings);
      } catch (error: any) {
        setError(error.response?.data?.message || "Không thể tải danh sách lịch hẹn.");
        setShowErrorModal(true);
      }
    };

    fetchTechnicians();
    fetchBookings();
  }, []);

  const filteredBookings = bookings.map((booking) => {
    const displayStatus =
      booking.status === "cancelled"
        ? "Đã hủy"
        : booking.status === "pending" && isPastAppointment(booking.dateTime)
        ? "Đã bỏ lỡ cuộc hẹn"
        : statusOptions.find((opt) => opt.value === booking.status)?.label || booking.status;

    return {
      ...booking,
      displayStatus,
    };
  }).filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setShowErrorModal(true);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let customerName = response.data.customer_name || "Khách hàng không xác định";
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/${response.data.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        customerName = userResponse.data.name || customerName;
      } catch (error: any) {
        console.error(`Error fetching customer name for user ${response.data.user_id}:`, error.message);
      }

      const bookingDetails = {
        id: response.data.id.toString(),
        customerId: response.data.user_id,
        customerName,
        vehicleInfo: response.data.vehicle_license_plate || "Không xác định",
        services: response.data.services.map((s: any) => s.name),
        branchName: response.data.branch_name,
        branchId: response.data.branch_id?.toString(),
        dateTime: `${response.data.appointment_date.split("T")[0]} - ${response.data.time_slot_display}`,
        technicianName: response.data.technician_name,
        technicianId: response.data.technician_id?.toString(),
        status: response.data.status,
      };

      setSelectedBooking(bookingDetails);
      setShowDetailsModal(true);
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể tải chi tiết lịch hẹn.");
      setShowErrorModal(true);
    }
  };

  const requestConfirmBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking?.technicianId) {
      setError("Vui lòng chọn kỹ thuật viên trước khi xác nhận.");
      setShowErrorModal(true);
      return;
    }
    setBookingToAction(id);
    setShowConfirmModal(true);
  };

  const requestCancelBooking = (id: string) => {
    setBookingToAction(id);
    setShowCancelModal(true);
  };

  const requestCompleteBooking = (id: string) => {
    setBookingToAction(id);
    setShowCompleteModal(true);
  };

  const executeConfirm = async () => {
    if (bookingToAction) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setShowErrorModal(true);
          return;
        }

        const booking = bookings.find((b) => b.id === bookingToAction);
        if (!booking) {
          setError("Lịch hẹn không tồn tại.");
          setShowErrorModal(true);
          return;
        }

        await axios.put(
          `${API_BASE_URL}/api/appointments/${bookingToAction}`,
          { 
            status: "confirmed",
            technician_id: booking.technicianId || null
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setBookings((prev) =>
          prev.map((b) => (b.id === bookingToAction ? { ...b, status: "confirmed" } : b))
        );
        setSuccessMessage("Xác nhận lịch hẹn thành công!");
        showSnackbar();
      } catch (error: any) {
        setError(error.response?.data?.message || "Không thể xác nhận lịch hẹn.");
        setShowErrorModal(true);
      }
    }
    setShowConfirmModal(false);
    setBookingToAction(null);
  };

  const executeCancel = async () => {
    if (bookingToAction) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setShowErrorModal(true);
          return;
        }

        await axios.put(
          `${API_BASE_URL}/api/appointments/${bookingToAction}`,
          { status: "cancelled" },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setBookings((prev) =>
          prev.map((b) => (b.id === bookingToAction ? { ...b, status: "cancelled" } : b))
        );
        setSuccessMessage("Hủy lịch hẹn thành công!");
        showSnackbar();
      } catch (error: any) {
        setError(error.response?.data?.message || "Không thể hủy lịch hẹn.");
        setShowErrorModal(true);
      }
    }
    setShowCancelModal(false);
    setBookingToAction(null);
  };

  const executeComplete = async () => {
    if (bookingToAction) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setShowErrorModal(true);
          return;
        }

        await axios.put(
          `${API_BASE_URL}/api/appointments/${bookingToAction}`,
          { status: "completed" },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setBookings((prev) =>
          prev.map((b) => (b.id === bookingToAction ? { ...b, status: "completed" } : b))
        );
        setSuccessMessage("Đánh dấu hoàn thành lịch hẹn thành công!");
        showSnackbar();
      } catch (error: any) {
        setError(error.response?.data?.message || "Không thể hoàn thành lịch hẹn.");
        setShowErrorModal(true);
      }
    }
    setShowCompleteModal(false);
    setBookingToAction(null);
  };

  const handleAssignTechnician = async (bookingId: string, techId: string | null) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      setError("Lịch hẹn không tồn tại.");
      setShowErrorModal(true);
      return;
    }

    if (booking.status === "confirmed" && techId !== booking.technicianId) {
      setBookingToAction(bookingId);
      setTechnicianToAssign(techId);
      setShowReassignModal(true);
      return;
    }

    await executeAssignTechnician(bookingId, techId);
  };

  const executeAssignTechnician = async (bookingId: string, techId: string | null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setShowErrorModal(true);
        return;
      }

      const techName = techId ? technicians.find((t) => t.id === techId)?.name : null;
      await axios.put(
        `${API_BASE_URL}/api/appointments/${bookingId}`,
        { technician_id: techId || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, technicianId: techId || undefined, technicianName: techName || undefined } : b
        )
      );
      setSuccessMessage(`Phân công kỹ thuật viên ${techName || "không"} thành công!`);
      showSnackbar();
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể phân công kỹ thuật viên.");
      setShowErrorModal(true);
    }
  };

  const confirmReassignTechnician = async () => {
    if (bookingToAction && technicianToAssign !== null) {
      await executeAssignTechnician(bookingToAction, technicianToAssign);
    }
    setShowReassignModal(false);
    setBookingToAction(null);
    setTechnicianToAssign(null);
  };

  const showSnackbar = useCallback(() => {
    if (successMessage) {
      snackbar.openSnackbar({
        text: successMessage,
        type: "success",
        duration: 3000,
      });
      setTimeout(() => setSuccessMessage(null), 3100);
    }
  }, [successMessage, snackbar]);

  useEffect(() => {
    showSnackbar();
  }, [successMessage, showSnackbar]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-grow w-full md:w-1/2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo ID, tên KH, xe, chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm transition-all duration-200"
          />
        </div>
        <Select
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(value) => setStatusFilter(String(value))}
          className="w-full md:w-52 text-sm"
        >
          {statusOptions.map((opt) => (
            <Select.Option key={opt.value} value={opt.value} title={opt.label} />
          ))}
        </Select>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Xe / Dịch vụ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Thời gian nhận
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Kỹ thuật viên
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => {
              const techniciansForBranch = technicians.filter((u) => String(u.branchId) === String(booking.branchId));
              console.log("Technicians for branch", booking.branchId, techniciansForBranch);
              return (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.vehicleInfo}</div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">{booking.services.join(", ")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-sm text-gray-900">{booking.dateTime.split(" - ")[0]}</div>
                    <div className="text-xs text-gray-500">{booking.dateTime.split(" - ").slice(1).join(" - ")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Select
                      placeholder="Chọn KTV..."
                      value={booking.technicianId || ""}
                      onChange={(value) => handleAssignTechnician(booking.id, String(value) || null)}
                      className="w-full text-sm rounded-lg border-gray-300 focus:ring-orange-300"
                      disabled={booking.status === "completed" || booking.status === "cancelled"}
                    >
                      <Select.Option value="" title="Chưa phân công">
                        Chưa phân công
                      </Select.Option>
                      {techniciansForBranch.length > 0 ? (
                        techniciansForBranch.map((tech) => (
                          <Select.Option key={tech.id} value={tech.id} title={tech.name}>
                            {tech.name}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option value="" disabled title="Không có kỹ thuật viên">
                          Không có kỹ thuật viên
                        </Select.Option>
                      )}
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        booking.status === "pending" && isPastAppointment(booking.dateTime)
                          ? "bg-red-100 text-red-800"
                          : booking.status === "pending"
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
                      {booking.displayStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                    <button
                      onClick={() => handleViewDetails(booking.id)}
                      className="text-gray-500 hover:text-gray-700 p-1 transition-colors duration-150"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {booking.status === "pending" && !isPastAppointment(booking.dateTime) && (
                      <>
                        <button
                          onClick={() => requestConfirmBooking(booking.id)}
                          className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          title="Xác nhận"
                          disabled={!booking.technicianId}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => requestCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-900 p-1 transition-colors duration-150"
                          title="Hủy"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => requestCompleteBooking(booking.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 transition-colors duration-150"
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
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Không tìm thấy lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        visible={showConfirmModal}
        title="Xác nhận lịch hẹn"
        onClose={() => setShowConfirmModal(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowConfirmModal(false), className: "text-gray-600" },
          { text: "Xác nhận", onClick: executeConfirm, highLight: true, className: "text-green-600 font-semibold" },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <p className="text-gray-700 text-lg mb-4">Bạn có chắc chắn muốn xác nhận lịch hẹn này không?</p>
        </div>
      </Modal>

      <Modal
        visible={showCancelModal}
        title="Xác nhận hủy lịch hẹn"
        onClose={() => setShowCancelModal(false)}
        zIndex={1200}
        actions={[
          { text: "Không", onClick: () => setShowCancelModal(false), className: "text-gray-600" },
          { text: "Hủy lịch hẹn", onClick: executeCancel, danger: true, className: "text-red-600 font-semibold" },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <p className="text-gray-700 text-lg mb-4">Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
        </div>
      </Modal>

      <Modal
        visible={showCompleteModal}
        title="Xác nhận hoàn thành"
        onClose={() => setShowCompleteModal(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowCompleteModal(false), className: "text-gray-600" },
          { text: "Hoàn thành", onClick: executeComplete, highLight: true, className: "text-blue-600 font-semibold" },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <CalendarCheck size={32} className="text-blue-500" />
          </div>
          <p className="text-gray-700 text-lg mb-4">Đánh dấu lịch hẹn này là đã hoàn thành?</p>
        </div>
      </Modal>

      <Modal
        visible={showReassignModal}
        title="Xác nhận thay đổi kỹ thuật viên"
        onClose={() => {
          setShowReassignModal(false);
          setBookingToAction(null);
          setTechnicianToAssign(null);
        }}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => {
            setShowReassignModal(false);
            setBookingToAction(null);
            setTechnicianToAssign(null);
          }, className: "text-gray-600" },
          { text: "Xác nhận", onClick: confirmReassignTechnician, highLight: true, className: "text-orange-600 font-semibold" },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <User size={32} className="text-orange-500" />
          </div>
          <p className="text-gray-700 text-lg mb-4">
            Lịch hẹn đã được xác nhận. Bạn có chắc chắn muốn thay đổi kỹ thuật viên không?
          </p>
        </div>
      </Modal>

      <Modal
        visible={showDetailsModal}
        title="Chi tiết lịch hẹn"
        onClose={() => setShowDetailsModal(false)}
        zIndex={1200}
        actions={[
          { text: "Đóng", onClick: () => setShowDetailsModal(false), highLight: true, className: "text-gray-600 font-semibold" },
        ]}
        className="rounded-lg max-w-2xl"
      >
        <div className="p-6 bg-white rounded-lg shadow-lg">
          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-800">ID Lịch hẹn: {selectedBooking.id}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBooking.status === "pending" && isPastAppointment(selectedBooking.dateTime)
                      ? "bg-red-100 text-red-800"
                      : selectedBooking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedBooking.status === "confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : selectedBooking.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : selectedBooking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedBooking.status === "cancelled"
                    ? "Đã hủy"
                    : selectedBooking.status === "pending" && isPastAppointment(selectedBooking.dateTime)
                    ? "Đã bỏ lỡ cuộc hẹn"
                    : statusOptions.find((opt) => opt.value === selectedBooking.status)?.label || selectedBooking.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Khách hàng:</strong> {selectedBooking.customerName}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">ID:</span> {selectedBooking.customerId}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Xe:</strong> {selectedBooking.vehicleInfo}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Dịch vụ:</strong> {selectedBooking.services.join(", ")}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Chi nhánh:</strong> {selectedBooking.branchName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Thời gian:</strong> {selectedBooking.dateTime}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
                  <p className="text-base text-gray-700 mb-2"><strong className="text-gray-900">Kỹ thuật viên:</strong> {selectedBooking.technicianName || "Chưa phân công"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        visible={showErrorModal}
        title="Thông báo lỗi"
        onClose={() => setShowErrorModal(false)}
        zIndex={1200}
        actions={[
          { text: "Đóng", onClick: () => setShowErrorModal(false), highLight: true, className: "text-red-600 font-semibold" },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;
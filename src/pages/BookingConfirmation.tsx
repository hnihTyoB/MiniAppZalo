import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

interface Appointment {
  id: string;
  branch_name: string;
  branch_address: string;
  branch_image_url?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_license_plate?: string;
  appointment_date: string;
  appointment_time: string;
  time_slot_display: string;
  notes?: string;
  services: { id: string; name: string }[];
  status?: string;
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId } = location.state || {};

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (!data || !data.appointment_date || !data.appointment_time) {
          throw new Error("Dữ liệu lịch hẹn không đầy đủ.");
        }

        console.log("appointment_date từ API:", data.appointment_date);

        setAppointment({
          ...data,
          id: data.id.toString(),
          services: Array.isArray(data.services) ? data.services : [],
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data.message || "Đã có lỗi xảy ra khi lấy chi tiết lịch hẹn.");
          }
        } else {
          setError(error.message || "Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    } else {
      setError("Không tìm thấy ID lịch hẹn.");
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") {
      console.error("Invalid date format (empty or not a string):", dateString);
      return "N/A";
    }

    let formattedDateString = dateString;

    // Nếu dateString chứa "T" (định dạng ISO 8601), trích xuất phần YYYY-MM-DD
    if (dateString.includes("T")) {
      formattedDateString = dateString.split("T")[0];
    }

    // Kiểm tra định dạng YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDateString)) {
      console.error("Invalid date format after processing:", formattedDateString);
      return "N/A";
    }

    const [year, month, day] = formattedDateString.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      console.error("Invalid date values:", { year, month, day });
      return "N/A";
    }

    return `${String(day).padStart(2, "0")} / ${String(month).padStart(2, "0")} / ${year}`;
  };

  const handleCopyId = () => {
    if (appointment?.id) {
      navigator.clipboard
        .writeText(appointment.id)
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

  const goBack = () => {
    navigate("/schedule");
  };

  const goToSchedule = () => {
    navigate("/schedule", { state: { refresh: true } });
  };

  const goToHome = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-semibold text-center flex-1">Xác nhận đặt lịch</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-semibold text-center flex-1">Xác nhận đặt lịch</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  const servicesString = appointment.services.length > 0
    ? appointment.services.map((service) => service.name).join(", ")
    : "Không có dịch vụ";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-6 text-center">
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
        Lịch hẹn của bạn đã được xác nhận. Vui lòng kiểm tra thông tin chi tiết bên dưới.
      </p>

      <div className="bg-white rounded-xl shadow-md p-5 w-full max-w-md space-y-3 text-left mb-8 border border-gray-100">
        <h2 className="font-semibold text-center text-base mb-2 border-b pb-4">
          Chi tiết lịch hẹn
        </h2>

        <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
          <span>ID: {appointment.id}</span>
          <button
            onClick={handleCopyId}
            className="ml-1.5 text-gray-400 hover:text-orange-500 transition-colors"
            title="Sao chép ID"
          >
            <Copy size={14} />
          </button>
        </div>

        {appointment.vehicle_make && appointment.vehicle_model && appointment.vehicle_license_plate && (
          <div className="flex items-center text-sm">
            <Car size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
            <span className="text-gray-500 w-20 shrink-0">Xe:</span>
            <span className="font-medium text-gray-800 ml-2 truncate">
              {appointment.vehicle_make} {appointment.vehicle_model} ({appointment.vehicle_license_plate})
            </span>
          </div>
        )}

        <div className="flex items-start text-sm">
          <Wrench size={16} className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5" />
          <span className="text-gray-500 w-20 shrink-0">Dịch vụ:</span>
          <span className="font-medium text-gray-800 ml-2">
            {servicesString}
          </span>
        </div>

        {appointment.notes && (
          <div className="flex items-start text-sm">
            <StickyNote size={16} className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5" />
            <span className="text-gray-500 w-20 shrink-0">Ghi chú:</span>
            <span className="text-sm text-gray-700 ml-2 italic truncate">
              {appointment.notes}
            </span>
          </div>
        )}

        <div className="flex items-start text-sm">
          <MapPin size={16} className="text-orange-500 mr-2.5 flex-shrink-0 mt-0.5" />
          <span className="text-gray-500 w-20 shrink-0">Chi nhánh:</span>
          <span className="font-medium text-gray-800 ml-2 truncate">
            {appointment.branch_name || "N/A"}
          </span>
        </div>
        {appointment.branch_address && (
          <div className="flex items-start text-sm pl-[26px]">
            <span className="text-xs text-gray-500 whitespace-pre-wrap">
              {appointment.branch_address}
            </span>
          </div>
        )}

        <div className="flex items-center text-sm">
          <Calendar size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20 shrink-0">Ngày:</span>
          <span className="font-medium text-gray-800 ml-2">
            {formatDate(appointment.appointment_date)}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock size={16} className="text-orange-500 mr-2.5 flex-shrink-0" />
          <span className="text-gray-500 w-20 shrink-0">Giờ:</span>
          <span className="font-medium text-gray-800 ml-2">
            {appointment.time_slot_display || "N/A"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <button
          onClick={goToSchedule}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ListChecks size={18} /> Xem lịch hẹn của tôi
        </button>
        <button
          onClick={goToHome}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} /> Quay về Trang chủ
        </button>
      </div>

      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
}
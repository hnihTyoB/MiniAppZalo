import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Image as ImageIcon, ChevronLeft, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

interface Branch {
  id: string;
  image_url?: string;
}

interface ScheduleItem {
  id: string;
  branch: string;
  services: string[];
  date: string;
  time: string;
  time_slot_display: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  imageUrl?: string;
  branch_id?: string;
}

export default function Schedule() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const isPastAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}+07:00`);
    const now = new Date(); // Sử dụng thời gian hiện tại
    return appointmentDateTime < now;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const branchesResponse = await axios.get(`${API_BASE_URL}/api/branches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const branchesData = branchesResponse.data.map((branch: any) => ({
          id: branch.id.toString(),
          image_url: branch.image_url || undefined,
        }));
        setBranches(branchesData);

        const appointmentsResponse = await axios.get(`${API_BASE_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const appointments = appointmentsResponse.data;

        const formattedItems: ScheduleItem[] = appointments.map((appt: any) => {
          const branch = branchesData.find((b: Branch) => b.id === appt.branch_id?.toString());
          const imageUrl = branch?.image_url || undefined;

          return {
            id: `#${appt.id}`,
            branch: appt.branch_name || "N/A",
            services: appt.services.map((service: any) => service.name),
            date: formatDate(appt.appointment_date),
            time: appt.appointment_time,
            time_slot_display: appt.time_slot_display,
            status: appt.status,
            imageUrl: imageUrl,
            branch_id: appt.branch_id?.toString(),
          };
        });

        setItems(formattedItems);
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
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy danh sách lịch hẹn.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
        setShowErrorModal(true);
      }
    };

    fetchData();
  }, [navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const goToHome = () => {
    navigate("/home");
  };

  const handleClearDone = () => {
    setItems((prev) => prev.filter((item) => item.status !== "completed"));
  };

  const requestCancelAppointment = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item?.status === "pending" && !isPastAppointment(item.date, item.time)) {
      setAppointmentToCancel(id);
      setShowCancelConfirm(true);
    } else {
      setError("Chỉ có thể hủy lịch hẹn chưa được xác nhận (trạng thái 'pending') và chưa quá hạn.");
      setShowErrorModal(true);
    }
  };

  const confirmCancelAppointment = async () => {
    if (appointmentToCancel) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const appointmentId = appointmentToCancel.replace("#", "");

        await axios.delete(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setItems((prev) => prev.filter((item) => item.id !== appointmentToCancel));
        console.log(`Đã hủy lịch hẹn (Schedule) có ID: ${appointmentToCancel}`);
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi hủy lịch hẹn.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
        setShowErrorModal(true);
      }
    }
    setShowCancelConfirm(false);
    setAppointmentToCancel(null);
  };

  const closeCancelModal = () => {
    setShowCancelConfirm(false);
    setAppointmentToCancel(null);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleFilterSelect = (status: string) => {
    setFilterStatus(status);
    setShowFilterModal(false);
  };

  const filteredItems = items.map((item) => {
    const displayStatus =
      item.status === "cancelled"
        ? "Đã hủy"
        : item.status === "pending" && isPastAppointment(item.date, item.time)
        ? "Đã bỏ lỡ cuộc hẹn"
        : item.status === "completed"
        ? "Hoàn thành"
        : item.status === "confirmed"
        ? "Đã xác nhận"
        : "Chưa xác nhận";

    return { ...item, displayStatus };
  }).filter((item) => {
    const servicesString = Array.isArray(item.services)
      ? item.services.join(", ").toLowerCase()
      : "";
    const matchesSearch =
      item.branch.toLowerCase().includes(search.toLowerCase()) ||
      servicesString.includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filterOptions = [
    { value: "all", label: "Tất cả", color: "gray-500", bgColor: "gray-100", hoverBgColor: "gray-200" },
    { value: "pending", label: "Chưa xác nhận", color: "yellow-600", bgColor: "yellow-50", hoverBgColor: "yellow-100" },
    { value: "confirmed", label: "Đã xác nhận", color: "blue-600", bgColor: "blue-50", hoverBgColor: "blue-100" },
    { value: "completed", label: "Hoàn thành", color: "green-600", bgColor: "green-50", hoverBgColor: "green-100" },
    { value: "cancelled", label: "Đã hủy", color: "red-600", bgColor: "red-50", hoverBgColor: "red-100" },
  ];

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-semibold text-center flex-1">Lịch hẹn</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white pb-20 max-w-md mx-auto relative">
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Lịch hẹn</h1>
        <button
          onClick={goToHome}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
          aria-label="Quay về Trang chủ"
        >
          <Home size={25} />
        </button>
      </div>

      <div className="sticky top-16 flex gap-2 items-center bg-white z-10 px-4 py-2 border-b">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          size="icon"
          className="bg-orange-400 hover:bg-orange-500 text-white flex-shrink-0"
          onClick={() => setShowFilterModal(true)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">{`${item.date} – ${item.time_slot_display}`}</div>
                </div>
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.services.join(", ")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="font-medium truncate">{item.branch}</div>
                    <div className="text-xs text-gray-500">ID: {item.id}</div>
                    <div className="text-sm font-semibold">
                      {item.services.join(", ")}
                    </div>
                  </div>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-center items-center pt-1">
                  <span
                    className={`text-sm font-medium ${
                      item.status === "pending" && isPastAppointment(item.date, item.time)
                        ? "text-red-600"
                        : item.status === "pending"
                        ? "text-yellow-600"
                        : item.status === "confirmed"
                        ? "text-blue-600"
                        : item.status === "completed"
                        ? "text-green-600"
                        : item.status === "cancelled"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.displayStatus}
                  </span>
                  {item.status === "pending" && !isPastAppointment(item.date, item.time) && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-red-500 text-sm font-medium hover:text-red-600 ml-4"
                      onClick={() => requestCancelAppointment(item.id)}
                    >
                      Hủy lịch hẹn
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không tìm thấy lịch hẹn nào.
          </p>
        )}

        {items.some((item) => item.status === "completed") && (
          <Button
            className="w-full bg-orange-400 hover:bg-orange-500 text-white rounded-xl mt-4 py-2.5"
            onClick={handleClearDone}
          >
            Dọn dẹp
          </Button>
        )}

        <Button
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl mt-4 py-2.5 flex items-center justify-center gap-2"
          onClick={goToHome}
        >
          <Home size={18} /> Quay về Trang chủ
        </Button>
      </div>

      <Modal
        visible={showCancelConfirm}
        title="Xác nhận hủy lịch hẹn"
        onClose={closeCancelModal}
        zIndex={1200}
        className="rounded-xl"
      >
        <div className="p-6 text-center bg-white rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận hủy</h3>
          <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={closeCancelModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Không
            </Button>
            <Button
              onClick={confirmCancelAppointment}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Hủy lịch hẹn
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        visible={showErrorModal}
        title="Thông báo lỗi"
        onClose={closeErrorModal}
        zIndex={1200}
        className="rounded-xl"
      >
        <div className="p-6 text-center bg-white rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error || "Đã có lỗi xảy ra."}</p>
          <Button
            onClick={closeErrorModal}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Đóng
          </Button>
        </div>
      </Modal>

      <Modal
        visible={showFilterModal}
        title="Lọc lịch hẹn"
        onClose={closeFilterModal}
        zIndex={1200}
        className="rounded-xl"
      >
        <div className="p-4 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Chọn trạng thái để lọc
          </h3>
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg bg-${option.bgColor} hover:bg-${option.hoverBgColor} text-${option.color} transition-colors duration-200`}
              >
                <span className="font-medium">{option.label}</span>
                {filterStatus === option.value && (
                  <CheckCircle2 size={20} className={`text-${option.color}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
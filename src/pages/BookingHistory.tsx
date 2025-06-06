import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Image as ImageIcon,
  CalendarCheck2,
  Search,
  Car,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

type NotificationType = "appointment";

interface BaseNotification {
  id: string;
  type: NotificationType;
  timestamp: number;
  isRead: boolean;
  title?: string;
  message?: string;
  imageUrl?: string;
}

interface AppointmentDetails {
  branch: string;
  services: string[];
  date: string;
  time: string;
  status: "upcoming" | "done";
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
  vehicleId?: string;
}

interface AppointmentNotification extends BaseNotification {
  type: "appointment";
  details: AppointmentDetails;
}

type NotificationItem = AppointmentNotification;

export default function BookingHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allItems, setAllItems] = useState<NotificationItem[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const isPastAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}+07:00`);
    const now = new Date("2025-05-19T08:40:00+07:00"); // Thời gian hiện tại
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

        // Lấy danh sách xe
        const vehiclesResponse = await axios.get(`${API_BASE_URL}/api/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const vehicles: Vehicle[] = vehiclesResponse.data.map((vehicle: any) => ({
          id: vehicle.id.toString(),
          make: vehicle.make || vehicle.make_name || "N/A",
          model: vehicle.model || vehicle.model_name || "N/A",
          licensePlate: vehicle.license_plate || "N/A",
        }));
        setUserVehicles(vehicles);

        // Lấy tất cả lịch hẹn (bao gồm cả pending và completed)
        const historyResponse = await axios.get(`${API_BASE_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const appointments = historyResponse.data;

        // Chỉ định dạng và hiển thị mà không cập nhật trạng thái
        const formattedItems: NotificationItem[] = appointments.map((appt: any) => {
          const vehicle = vehicles.find((v) => v.id === appt.vehicle_id?.toString());
          const appointmentDateTime = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
          return {
            id: `#${appt.id}`,
            type: "appointment",
            timestamp: appointmentDateTime.getTime(),
            isRead: true,
            imageUrl: appt.branch_image_url || undefined,
            details: {
              branch: appt.branch_name || "N/A",
              services: appt.services.map((service: any) => service.name),
              date: formatDate(appt.appointment_date),
              time: formatTime(appt.appointment_time),
              status: appt.status === "completed" ? "done" : "upcoming",
              vehicleId: appt.vehicle_id ? appt.vehicle_id.toString() : undefined,
              vehicleMake: vehicle ? vehicle.make : "N/A",
              vehicleModel: vehicle ? vehicle.model : "N/A",
              vehicleLicensePlate: vehicle ? vehicle.licensePlate : "N/A",
            },
          };
        });

        setAllItems(formattedItems);
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
            setError(error.response.data.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const filteredHistory = useMemo(() => {
    return allItems.filter((item) => {
      // Chỉ hiển thị các lịch hẹn đã hoàn thành
      if (item.type !== "appointment" || item.details.status !== "done") {
        return false;
      }

      if (selectedVehicleFilter !== "all" && item.details.vehicleId !== selectedVehicleFilter) {
        return false;
      }

      const searchTerm = search.toLowerCase();
      if (!searchTerm) return true;

      const details = item.details;
      const servicesString = Array.isArray(details.services)
        ? details.services.join(", ").toLowerCase()
        : "";
      const vehicleString = `${details.vehicleMake || ""} ${details.vehicleModel || ""} ${details.vehicleLicensePlate || ""}`.toLowerCase();

      return (
        details.branch.toLowerCase().includes(searchTerm) ||
        servicesString.includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        vehicleString.includes(searchTerm)
      );
    });
  }, [allItems, search, selectedVehicleFilter]);

  const goBack = () => navigate(-1);

  const handleVehicleFilterChange = (value: string | number) => {
    setSelectedVehicleFilter(String(value));
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-semibold text-center flex-1">Lịch sử đặt lịch</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-semibold text-center flex-1">Lịch sử đặt lịch</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-5 max-w-md mx-auto relative mt-3">
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Lịch sử đặt lịch
        </h1>
      </div>

      <div className="sticky top-16 bg-white z-10 px-4 py-3 border-b mb-4 space-y-3">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Tìm theo xe, chi nhánh, dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 w-full"
          />
        </div>

        {userVehicles.length > 0 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="vehicle-filter-select"
              className="text-sm font-medium text-gray-700 flex-shrink-0"
            >
              Lọc theo:
            </label>
            <div className="flex-grow">
              <Select
                placeholder="Tất cả xe"
                value={selectedVehicleFilter}
                onChange={handleVehicleFilterChange}
              >
                <Select.Option value="all" title="Tất cả xe">
                  Tất cả xe
                </Select.Option>
                {userVehicles.map((vehicle) => (
                  <Select.Option
                    key={vehicle.id}
                    value={vehicle.id}
                    title={`${vehicle.make} ${vehicle.model}`}
                  >
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => {
            const details = item.details;
            return (
              <Card
                key={item.id}
                className="overflow-hidden shadow-sm bg-white"
              >
                <CardContent className="p-4 space-y-3">
                  {details.vehicleMake &&
                    details.vehicleModel &&
                    details.vehicleLicensePlate && (
                      <div className="text-sm font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b mb-2">
                        <Car
                          size={16}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <span>
                          {details.vehicleMake} {details.vehicleModel} (
                          {details.vehicleLicensePlate})
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {details.status === "done" ? "Hoàn thành" : "Chưa hoàn thành"}: {details.date} - {details.time}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-16 h-16 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={details.branch}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="font-medium truncate">
                        {details.branch}
                      </div>
                      <div className="text-xs text-gray-500">ID: {item.id}</div>
                      <div className="text-sm font-semibold">
                        {Array.isArray(details.services)
                          ? details.services.join(", ")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-gray-500 mt-10 py-10">
            <CalendarCheck2 size={48} className="mx-auto mb-2 text-gray-400" />
            <p>
              {selectedVehicleFilter !== "all" || search
                ? "Không tìm thấy lịch sử phù hợp."
                : "Chưa có lịch hẹn đã hoàn thành."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
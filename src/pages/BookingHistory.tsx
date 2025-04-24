// src/pages/BookingHistory.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Image as ImageIcon,
  CalendarCheck2,
  Search,
  Car,
  Filter, // <<< THÊM ICON Filter (nếu cần cho nút reset)
} from "lucide-react";
import { Input } from "@/components/ui/input";
// <<< THÊM Select từ thư viện UI bạn dùng (ví dụ zmp-ui) >>>
import { Select } from "zmp-ui";
// <<< THÊM Vehicle interface (nếu chưa có) >>>
import { Vehicle } from "@/interfaces/Vehicle";

// --- Interfaces (Giữ nguyên hoặc đảm bảo có vehicleId) ---

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
  vehicleId?: string; // <<< ĐẢM BẢO CÓ vehicleId >>>
}

interface AppointmentNotification extends BaseNotification {
  type: "appointment";
  details: AppointmentDetails;
}

type NotificationItem = AppointmentNotification;

interface BookingDataFromStorage {
  id: string;
  branch: string;
  services: string[];
  date: string;
  time: string;
  status: "upcoming" | "done";
  imageUrl?: string;
  address?: string;
  vehicleId?: string; // <<< ĐẢM BẢO CÓ vehicleId >>>
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
}

// --- Helper lấy xe (Copy từ VehicleManagement) ---
const getVehiclesFromStorage = (): Vehicle[] => {
  try {
    const storedVehicles = localStorage.getItem("userVehicles");
    return storedVehicles ? JSON.parse(storedVehicles) : [];
  } catch (error) {
    console.error("Error reading vehicles from localStorage:", error);
    return [];
  }
};

// --- Dữ liệu mẫu (Thêm vehicleId nếu muốn) ---
const initialMockHistory: NotificationItem[] = [
  {
    id: "#789101",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 10,
    isRead: true,
    details: {
      branch: "PTIT – Chi nhánh 3",
      services: ["Thay nhớt"],
      date: "12 / 07 / 2024",
      time: "11:00 AM",
      status: "done",
      vehicleId: "vehicle_1", // <<< Ví dụ vehicleId
      vehicleMake: "Toyota",
      vehicleModel: "Vios",
      vehicleLicensePlate: "51K-111.11",
    },
  },
  {
    id: "#989103",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 20,
    isRead: true,
    details: {
      branch: "PTIT – Chi nhánh 4",
      services: ["Kiểm tra tổng quát"],
      date: "01 / 07 / 2024",
      time: "02:00 PM",
      status: "done",
      vehicleId: "vehicle_2", // <<< Ví dụ vehicleId
      vehicleMake: "Honda",
      vehicleModel: "City",
      vehicleLicensePlate: "51K-222.22",
    },
  },
  {
    // Thêm 1 lịch sử nữa cho cùng xe 1 để test filter
    id: "#101112",
    type: "appointment",
    timestamp: Date.now() - 86400000 * 5,
    isRead: true,
    details: {
      branch: "PTIT – Chi nhánh 1",
      services: ["Rửa xe"],
      date: "15 / 07 / 2024",
      time: "03:00 PM",
      status: "done",
      vehicleId: "vehicle_1", // <<< Cùng vehicleId với mục đầu
      vehicleMake: "Toyota",
      vehicleModel: "Vios",
      vehicleLicensePlate: "51K-111.11",
    },
  },
];

// --- Component BookingHistory ---
export default function BookingHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allItems, setAllItems] =
    useState<NotificationItem[]>(initialMockHistory);
  // <<< THÊM STATE CHO BỘ LỌC XE >>>
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleFilter, setSelectedVehicleFilter] =
    useState<string>("all"); // 'all' hoặc vehicle.id

  // Load dữ liệu và danh sách xe
  useEffect(() => {
    // Load danh sách xe của người dùng
    setUserVehicles(getVehiclesFromStorage());

    // Load lịch sử từ localStorage
    try {
      const newlyAddedBookingsRaw = localStorage.getItem("newlyAddedBookings");
      let loadedItems: NotificationItem[] = [...initialMockHistory];

      if (newlyAddedBookingsRaw) {
        const newlyAddedBookings: BookingDataFromStorage[] = JSON.parse(
          newlyAddedBookingsRaw
        );

        if (newlyAddedBookings.length > 0) {
          const newNotifications: AppointmentNotification[] =
            newlyAddedBookings.map((booking) => {
              const {
                id,
                imageUrl,
                branch,
                services,
                date,
                time,
                status,
                vehicleId, // <<< LẤY vehicleId >>>
                vehicleMake,
                vehicleModel,
                vehicleLicensePlate,
                ...rest
              } = booking;

              const details: AppointmentDetails = {
                branch,
                services,
                date,
                time,
                status,
                vehicleId, // <<< THÊM vehicleId vào details >>>
                vehicleMake,
                vehicleModel,
                vehicleLicensePlate,
              };

              return {
                id,
                type: "appointment",
                timestamp: Date.now(),
                isRead: false,
                details,
                imageUrl,
              };
            });
          loadedItems = [...newNotifications, ...loadedItems];
        }
      }
      setAllItems(loadedItems);
    } catch (error) {
      console.error("Lỗi khi đọc lịch hẹn từ localStorage:", error);
    }
  }, []);

  // --- Lọc lịch sử (Thêm bộ lọc xe) ---
  const filteredHistory = useMemo(() => {
    return allItems.filter((item) => {
      // Chỉ lấy lịch hẹn đã hoàn thành
      if (!(item.type === "appointment" && item.details.status === "done")) {
        return false;
      }

      // Lọc theo xe đã chọn
      if (
        selectedVehicleFilter !== "all" &&
        item.details.vehicleId !== selectedVehicleFilter
      ) {
        return false;
      }

      // Áp dụng bộ lọc tìm kiếm
      const searchTerm = search.toLowerCase();
      if (!searchTerm) return true; // Hiển thị nếu không tìm kiếm

      const details = item.details;
      const servicesString = Array.isArray(details.services)
        ? details.services.join(", ").toLowerCase()
        : "";
      const vehicleString = `${details.vehicleMake || ""} ${
        details.vehicleModel || ""
      } ${details.vehicleLicensePlate || ""}`.toLowerCase();

      return (
        details.branch.toLowerCase().includes(searchTerm) ||
        servicesString.includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        vehicleString.includes(searchTerm)
      );
    });
  }, [allItems, search, selectedVehicleFilter]); // <<< Thêm selectedVehicleFilter vào dependencies

  // --- Handlers ---
  const goBack = () => navigate(-1);
  const handleVehicleFilterChange = (value: string | number) => {
    setSelectedVehicleFilter(String(value)); // Cập nhật state lọc xe
  };

  // --- Render ---
  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-5 max-w-md mx-auto mt-3">
      {/* Header */}
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

      {/* Tìm kiếm và Bộ lọc */}
      <div className="sticky top-16 bg-white z-10 px-4 py-3 border-b mb-4 space-y-3">
        {/* Thanh tìm kiếm */}
        <div className="relative flex-grow">
          {" "}
          {/* Thêm relative và flex-grow */}
          {/* Đặt icon vào trong div */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          {/* Thêm padding trái cho Input */}
          <Input
            type="text" // Nên thêm type="text"
            placeholder="Tìm theo xe, chi nhánh, dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 w-full" // Thêm pl-10, pr-3, py-2 và w-full
            // Bỏ prop prefix không hợp lệ
          />
        </div>
        {/* Nút Reset Filter (nếu có) */}
        {/* <button onClick={() => { setSearch(''); setSelectedVehicleFilter('all'); }} className="p-2 text-gray-500 hover:text-orange-500 flex-shrink-0"><Filter size={16} /></button> */}

        {/* Bộ lọc xe */}
        {userVehicles.length > 0 && (
          // <<< Sử dụng Flexbox để sắp xếp >>>
          <div className="flex items-center gap-2">
            {/* Label riêng */}
            <label
              htmlFor="vehicle-filter-select" // Kết nối với id của Select nếu có
              className="text-sm font-medium text-gray-700 flex-shrink-0" // Ngăn label co lại
            >
              Lọc theo:
            </label>
            {/* Select chiếm phần còn lại */}
            <div className="flex-grow">
              {" "}
              {/* Cho phép Select co giãn */}
              <Select
                // id="vehicle-filter-select" // Thêm id nếu cần cho label
                // label="" // Bỏ label prop của Select
                placeholder="Tất cả xe"
                value={selectedVehicleFilter}
                onChange={handleVehicleFilterChange}
                // className="w-full" // Đảm bảo Select chiếm hết chiều rộng của div cha
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

      {/* Nội dung cuộn */}
      <div className="px-4 space-y-4">
        {/* Danh sách lịch sử */}
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => {
            const details = item.details;
            return (
              <Card
                key={item.id}
                className="overflow-hidden shadow-sm bg-white"
              >
                <CardContent className="p-4 space-y-3">
                  {/* <<< ĐƯA THÔNG TIN XE LÊN ĐẦU >>> */}
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
                  {/* Thời gian hoàn thành */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Hoàn thành: {details.date} - {details.time}
                    </div>
                  </div>
                  {/* Ảnh & Thông tin còn lại */}
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
                      {/* Thông tin xe đã được chuyển lên trên */}
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
                : "Chưa có lịch hẹn nào hoàn thành."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

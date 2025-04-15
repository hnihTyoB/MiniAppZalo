import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import clsx from "clsx";
import {
  Home as HomeIcon,
  CalendarDays,
  MessageCircle,
  User,
  Wrench,
  Square,
  Droplet,
  ShowerHead,
  ImageIcon,
  MapPin,
  Building,
  Car,
  PlusCircle,
  Settings,
  StickyNote,
  ChevronDown, // Icon cho nút thay đổi dịch vụ
  Search, // <<< Thêm nếu dùng
  Paintbrush, // <<< Thêm nếu dùng
  SprayCan, // <<< Thêm nếu dùng
} from "lucide-react";
import { Select, Checkbox } from "zmp-ui";
import { Vehicle } from "@/interfaces/Vehicle";

// --- Interfaces ---
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
interface Service {
  name: string;
  icon: React.ElementType;
}
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
}

// Cập nhật ScheduleItem: service thành services (array), thêm notes
interface ScheduleItem {
  id: string;
  branch: string;
  // service: string; // Thay đổi thành services
  services: string[]; // Lưu danh sách dịch vụ đã chọn
  date: string;
  time: string;
  reminder: boolean;
  status: "upcoming" | "done";
  imageUrl?: string;
  address?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
  notes?: string;
}

// --- Constants ---
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarDays, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];
const allServices: Service[] = [
  { name: "Sửa xe", icon: Wrench },
  { name: "Thay kính", icon: Square },
  { name: "Thay dầu", icon: Droplet },
  { name: "Rửa xe", icon: ShowerHead },
  { name: "Bảo dưỡng", icon: Settings }, // Ví dụ thêm
  { name: "Kiểm tra tổng quát", icon: Search }, // Ví dụ thêm
  { name: "Làm đồng sơn", icon: Paintbrush }, // Ví dụ thêm (cần import icon Paintbrush từ lucide-react)
  { name: "Vệ sinh nội thất", icon: SprayCan }, // Ví dụ thêm (cần import icon CarSeat từ lucide-react)
  // Thêm các dịch vụ khác nếu cần
];
const availableBranches: Branch[] = [
  {
    id: 1,
    name: "PTIT - Chi nhánh 1",
    address: "97 Man Thiện, Hiệp Phú, Thủ Đức, Thành phố Hồ Chí Minh",
    imageUrl: "/images/branch-1.jpg",
  },
  {
    id: 2,
    name: "PTIT - Chi nhánh 2",
    address: "122 Hoàng Diệu 2, Linh Chiểu, Thủ Đức, Thành phố Hồ Chí Minh",
    imageUrl: "/images/branch-2.jpg",
  },
  {
    id: 3,
    name: "Chi nhánh Quận 9",
    address: "45 Lê Văn Việt, Tăng Nhơn Phú A, Quận 9, Thành phố Hồ Chí Minh",
  },
];
const times = ["07:00 PM", "10:00 AM", "01:00 PM", "03:00 PM", "04:30 PM"];

// --- Helper functions for localStorage (Vehicles & Default Vehicle) ---

/**
 * Lấy danh sách xe từ localStorage.
 * @returns Mảng các đối tượng Vehicle hoặc mảng rỗng nếu không có hoặc lỗi.
 */
const getVehiclesFromStorage = (): Vehicle[] => {
  try {
    const storedVehicles = localStorage.getItem("userVehicles");
    // Nếu có dữ liệu và không phải là chuỗi rỗng/null/undefined
    if (storedVehicles) {
      const parsedVehicles = JSON.parse(storedVehicles);
      // Kiểm tra xem kết quả parse có phải là mảng không
      if (Array.isArray(parsedVehicles)) {
        return parsedVehicles;
      } else {
        console.error(
          "Dữ liệu 'userVehicles' trong localStorage không phải là mảng:",
          parsedVehicles
        );
        return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
      }
    }
    return []; // Trả về mảng rỗng nếu không có dữ liệu
  } catch (error) {
    console.error("Lỗi khi đọc 'userVehicles' từ localStorage:", error);
    // Có thể xóa dữ liệu lỗi nếu cần
    // localStorage.removeItem("userVehicles");
    return []; // Trả về mảng rỗng khi có lỗi parse
  }
};

/**
 * Lấy ID của xe mặc định từ localStorage.
 * @returns ID xe mặc định (string) hoặc null nếu không có.
 */
const getDefaultVehicleIdFromStorage = (): string | null => {
  try {
    return localStorage.getItem("defaultVehicleId");
  } catch (error) {
    console.error("Lỗi khi đọc 'defaultVehicleId' từ localStorage:", error);
    return null;
  }
};

/**
 * Lưu ID của xe mặc định vào localStorage.
 * @param vehicleId ID xe cần lưu làm mặc định, hoặc null để xóa.
 */
const saveDefaultVehicleIdToStorage = (vehicleId: string | null) => {
  try {
    if (vehicleId) {
      localStorage.setItem("defaultVehicleId", vehicleId);
      console.log("Đã lưu defaultVehicleId:", vehicleId);
    } else {
      localStorage.removeItem("defaultVehicleId");
      console.log("Đã xóa defaultVehicleId khỏi localStorage.");
    }
  } catch (error) {
    console.error("Lỗi khi lưu 'defaultVehicleId' vào localStorage:", error);
  }
};

// --- Hàm lưu danh sách xe (bạn đã có ở AddEditVehicle và VehicleManagement) ---
/**
 * Lưu danh sách xe vào localStorage.
 * @param vehicles Mảng các đối tượng Vehicle cần lưu.
 */
const saveVehiclesToStorage = (vehicles: Vehicle[]) => {
  try {
    localStorage.setItem("userVehicles", JSON.stringify(vehicles));
  } catch (error) {
    console.error("Lỗi khi lưu 'userVehicles' vào localStorage:", error);
  }
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [defaultVehicleId, setDefaultVehicleId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // State cho dịch vụ (mảng các tên dịch vụ)
  const preselectedService = location.state?.preselectedService;
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>(
    preselectedService ? [preselectedService] : [] // Khởi tạo với dịch vụ được chọn trước (nếu có)
  );
  const [showAllServices, setShowAllServices] = useState(!preselectedService); // Hiển thị tất cả nếu không có preselected

  const currentPath = window.location.pathname;

  // --- Effects ---
  useEffect(() => {
    // Load xe
    const vehicles = getVehiclesFromStorage();
    setUserVehicles(vehicles);
    const storedDefaultId = getDefaultVehicleIdFromStorage();
    setDefaultVehicleId(storedDefaultId);
    if (vehicles.length > 0) {
      const defaultVehicle = storedDefaultId
        ? vehicles.find((v) => v.id === storedDefaultId)
        : null;
      setSelectedVehicle(defaultVehicle || vehicles[0]);
    } else {
      setSelectedVehicle(null);
    }

    // Chọn chi nhánh đầu tiên làm mặc định nếu chưa có
    if (!selectedBranch && availableBranches.length > 0) {
      setSelectedBranch(availableBranches[0]);
    }
  }, []); // Chạy 1 lần

  // --- Handlers ---
  const handleDateChange = (value: any) => {
    if (value instanceof Date) setSelectedDate(value);
    else if (Array.isArray(value) && value[0] instanceof Date)
      setSelectedDate(value[0]);
    else setSelectedDate(null);
  };

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServiceNames(
      (prevSelected) =>
        prevSelected.includes(serviceName)
          ? prevSelected.filter((name) => name !== serviceName) // Bỏ chọn
          : [...prevSelected, serviceName] // Chọn thêm
    );
  };

  const handleToggleShowServices = () => {
    setShowAllServices(!showAllServices);
  };

  const handleBranchSelectChange = (branchId: string | number) => {
    const branch = availableBranches.find((b) => b.id === Number(branchId));
    if (branch) setSelectedBranch(branch);
  };

  const handleVehicleChange = (vehicleId: string | number) => {
    const vehicle = userVehicles.find((v) => v.id === vehicleId);
    if (vehicle) setSelectedVehicle(vehicle);
  };

  const handleSetDefaultVehicle = (checked: boolean) => {
    if (selectedVehicle) {
      const newDefaultId = checked ? selectedVehicle.id : null;
      setDefaultVehicleId(newDefaultId);
      saveDefaultVehicleIdToStorage(newDefaultId);
    }
  };

  const navigateToVehicleManagement = () => navigate("/vehicles");
  const navigateToAddVehicle = () => navigate("/add-vehicle");

  const handleBooking = () => {
    if (
      selectedServiceNames.length > 0 && // Kiểm tra có chọn ít nhất 1 dịch vụ
      selectedBranch &&
      selectedVehicle &&
      selectedDate &&
      selectedTime
    ) {
      const newBooking: ScheduleItem = {
        id: `#${Date.now().toString().slice(-6)}`,
        branch: selectedBranch.name,
        services: selectedServiceNames, // Lưu mảng dịch vụ
        date: selectedDate
          .toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, " / "),
        time: selectedTime,
        reminder: false,
        status: "upcoming",
        imageUrl: selectedBranch.imageUrl,
        address: selectedBranch.address,
        vehicleId: selectedVehicle.id,
        vehicleMake: selectedVehicle.make,
        vehicleModel: selectedVehicle.model,
        vehicleLicensePlate: selectedVehicle.licensePlate,
        notes: notes.trim() || undefined,
      };

      try {
        const existingBookings = JSON.parse(
          localStorage.getItem("newlyAddedBookings") || "[]"
        );
        existingBookings.push(newBooking);
        localStorage.setItem(
          "newlyAddedBookings",
          JSON.stringify(existingBookings)
        );
      } catch (error) {
        console.error("Lỗi khi lưu lịch hẹn:", error);
      }

      navigate("/booking-confirmation", {
        state: { bookingDetails: newBooking },
      });
    } else {
      let missingFields = [];
      if (selectedServiceNames.length === 0) missingFields.push("dịch vụ");
      if (!selectedBranch) missingFields.push("chi nhánh");
      if (!selectedVehicle) missingFields.push("phương tiện");
      if (!selectedDate) missingFields.push("ngày");
      if (!selectedTime) missingFields.push("giờ");
      alert(`Vui lòng chọn ${missingFields.join(", ")}.`);
    }
  };

  // --- Derived State ---
  const isBookingReady =
    selectedServiceNames.length > 0 &&
    !!selectedBranch &&
    !!selectedVehicle &&
    !!selectedDate &&
    !!selectedTime;

  // Lọc danh sách dịch vụ để hiển thị (tất cả hoặc chỉ những cái đã chọn)
  const servicesToShow = showAllServices
    ? allServices
    : allServices.filter((s) => selectedServiceNames.includes(s.name));

  return (
    <div className="flex flex-col h-screen bg-white pb-36">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
        <h2 className="text-xl font-semibold text-center">Đặt lịch</h2>
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* --- Phần Phương tiện --- */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Phương tiện</h3>
            {userVehicles.length > 0 && (
              <button
                onClick={navigateToVehicleManagement}
                className="text-orange-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <Settings size={14} /> Quản lý
              </button>
            )}
          </div>
          {userVehicles.length > 0 ? (
            <div className="space-y-3">
              <Select
                label="Chọn xe của bạn"
                placeholder="Chọn xe..."
                value={selectedVehicle?.id || ""}
                onChange={handleVehicleChange}
                status={!selectedVehicle ? "error" : "default"}
              >
                {userVehicles.map((vehicle) => (
                  <Select.Option
                    key={vehicle.id}
                    value={vehicle.id}
                    title={`${vehicle.make} ${vehicle.model}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Span chứa thông tin xe, cho phép co giãn */}
                      <span className="flex-grow truncate pr-2">
                        {" "}
                        {/* Thêm pr-2 để có khoảng cách nếu text dài */}
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </span>
                      {/* Span chứa chữ "Mặc định", không co lại và có margin phải */}
                      {vehicle.id === defaultVehicleId && (
                        <span className="text-green-600 text-xs font-medium ml-2 mr-4 flex-shrink-0">
                          {" "}
                          {/* Thêm mr-4 */}
                          Mặc định
                        </span>
                      )}
                    </div>
                  </Select.Option>
                ))}
              </Select>
              {selectedVehicle && (
                <Checkbox
                  value="default"
                  checked={selectedVehicle.id === defaultVehicleId}
                  onChange={(e) => handleSetDefaultVehicle(e.target.checked)}
                >
                  <span className="text-sm text-gray-700">
                    Đặt làm xe mặc định
                  </span>
                </Checkbox>
              )}
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col items-center text-center">
              <Car size={32} className="text-orange-400 mb-2" />
              <p className="text-sm text-orange-700 mb-3">
                Bạn chưa thêm phương tiện nào.
              </p>
              <button
                onClick={navigateToAddVehicle}
                className="bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle size={16} /> Thêm xe ngay
              </button>
            </div>
          )}
        </div>

        {/* --- Phần Dịch vụ --- */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">
              Dịch vụ ({selectedServiceNames.length} đã chọn)
            </h2>
            {/* Nút để luôn hiển thị tất cả dịch vụ */}
            {!showAllServices && ( // Chỉ hiển thị nút khi đang ẩn bớt
              <button
                // Khi nhấn, luôn đặt showAllServices thành true
                onClick={() => setShowAllServices(true)}
                className="text-orange-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                Thêm dịch vụ
                <ChevronDown size={16} /> {/* Có thể giữ hoặc bỏ icon này */}
              </button>
            )}
            {/* Có thể thêm nút "Ẩn bớt" nếu muốn */}
            {showAllServices &&
              allServices.length > 4 && ( // Chỉ hiện nút ẩn nếu đang show all và có nhiều hơn 4 dịch vụ
                <button
                  onClick={() => setShowAllServices(false)}
                  className="text-orange-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
                >
                  Ẩn bớt
                  <ChevronDown size={16} className="rotate-180" />
                </button>
              )}
          </div>
          {/* Grid chọn dịch vụ */}
          <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600 mb-6">
            {/* Lặp qua danh sách dịch vụ cần hiển thị */}
            {(showAllServices ? allServices : servicesToShow).map((service) => {
              const isSelected = selectedServiceNames.includes(service.name);
              return (
                <div
                  key={service.name}
                  onClick={() => handleServiceToggle(service.name)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleServiceToggle(service.name);
                  }}
                >
                  <div
                    className={clsx(
                      "p-3 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 border-2",
                      isSelected
                        ? "bg-orange-500 text-white border-orange-600 scale-105"
                        : "bg-gray-100 group-hover:bg-orange-100 text-orange-500 border-transparent group-hover:border-orange-200"
                    )}
                  >
                    <service.icon
                      className={clsx(
                        "w-6 h-6",
                        isSelected ? "text-white" : "text-orange-500"
                      )}
                    />
                  </div>
                  <span
                    className={clsx(
                      "font-medium",
                      isSelected ? "text-orange-600" : "text-gray-600"
                    )}
                  >
                    {service.name}
                  </span>
                </div>
              );
            })}
            {/* Hiển thị thông báo nếu không có dịch vụ nào được chọn và đang ẩn bớt */}
            {!showAllServices && selectedServiceNames.length === 0 && (
              <div className="col-span-4 text-center text-gray-500 text-sm py-4">
                Bạn chưa chọn dịch vụ nào. Nhấn "Xem tất cả" để chọn.
              </div>
            )}
          </div>

          {/* Phần Ghi chú (giữ nguyên) */}
          <div>
            <label
              htmlFor="serviceNotes"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
            >
              <StickyNote size={14} /> Ghi chú cho dịch vụ (không bắt buộc)
            </label>
            <textarea
              id="serviceNotes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả yêu cầu cụ thể của bạn..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
            />
          </div>
        </div>

        {/* --- Phần Chi nhánh --- */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Chi nhánh</h3>
          {availableBranches.length > 0 ? (
            <Select
              label="Chọn chi nhánh"
              placeholder="Chọn chi nhánh..."
              value={selectedBranch?.id || ""}
              onChange={handleBranchSelectChange}
              status={!selectedBranch ? "error" : "default"}
            >
              {availableBranches.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  title={branch.name} // title vẫn có thể giữ nguyên hoặc cập nhật nếu muốn
                >
                  {/* Hiển thị tên và địa chỉ đầy đủ, cho phép xuống dòng tự nhiên */}
                  <div>
                    {" "}
                    {/* Bọc trong div để kiểm soát layout tốt hơn nếu cần */}
                    <span className="font-medium">{branch.name}</span>
                    {branch.address && (
                      <span className="block text-xs text-gray-500">
                        {" "}
                        {/* Dùng block để xuống hàng */}({branch.address})
                      </span>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          ) : (
            <div className="h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <Building size={32} className="mb-1" />
              <span className="text-sm">Chưa có chi nhánh nào</span>
            </div>
          )}
          {/* Hiển thị ảnh và địa chỉ đầy đủ của chi nhánh đã chọn */}
          {selectedBranch && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {selectedBranch.imageUrl ? (
                <div className="w-full aspect-video bg-gray-100">
                  <img
                    src={selectedBranch.imageUrl}
                    alt={selectedBranch.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="p-3 space-y-0.5">
                <div className="font-semibold text-base truncate">
                  {selectedBranch.name}
                </div>
                {selectedBranch.address && (
                  <div className="text-sm text-gray-500 flex items-start gap-1">
                    {" "}
                    {/* items-start để icon thẳng hàng với dòng đầu */}
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                    {/* Không dùng truncate ở đây để hiển thị đầy đủ */}
                    <span>{selectedBranch.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- Calendar --- */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn ngày</h3>
          <style>{`
    /* CSS Calendar */
    .react-calendar {
      border: none;
      border-radius: 0.5rem; /* bo góc */
      font-family: inherit; /* dùng font của trang */
      width: 100%;
      background-color: #f9fafb; /* màu nền xám rất nhạt (gray-50) */
      padding: 0.5rem; /* khoảng đệm nhỏ xung quanh */
    }

    /* Các ô ngày tháng */
    .react-calendar__tile {
      border-radius: 9999px; /* bo tròn */
      height: 47px; /* chiều cao cố định */
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      transition: background-color 0.2s ease, color 0.2s ease; /* hiệu ứng chuyển màu */
    }

    /* Khi hover hoặc focus vào ô ngày (chưa chọn) */
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
      background-color: #fed7aa; /* màu orange-200 */
    }

    /* Ô ngày hiện tại (today) */
    .react-calendar__tile--now {
      background-color: #fdba74; /* màu orange-300 */
      color: white; /* chữ trắng */
    }
    .react-calendar__tile--now:enabled:hover,
    .react-calendar__tile--now:enabled:focus {
      background-color: #fb923c; /* màu orange-400 đậm hơn khi hover */
    }

    /* Ô ngày được chọn (active) */
    .react-calendar__tile--active {
      background-color: #f97316 !important; /* màu orange-500 */
      color: white !important; /* chữ trắng */
    }
    .react-calendar__tile--active:enabled:hover,
    .react-calendar__tile--active:enabled:focus {
      background-color: #ea580c !important; /* màu orange-600 đậm hơn khi hover */
    }

    /* Các nút điều hướng tháng/năm */
    .react-calendar__navigation button {
      color: #f97316; /* màu orange-500 */
      font-weight: 600; /* chữ đậm */
      min-height: 40px;
      border-radius: 0.375rem; /* bo góc nhẹ */
    }
    .react-calendar__navigation button:enabled:hover,
    .react-calendar__navigation button:enabled:focus {
      background-color: #fff7ed; /* màu orange-50 rất nhạt khi hover */
    }

    /* Tên các ngày trong tuần (T2, T3,...) */
    .react-calendar__month-view__weekdays__weekday abbr {
      text-decoration: none; /* bỏ gạch chân */
      font-weight: 600; /* chữ đậm */
      color: #4b5563; /* màu gray-600 */
    }

    /* Ẩn các ngày của tháng trước/sau (nếu có) */
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #d1d5db; /* màu gray-300 */
    }
  `}</style>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            locale="vi-VN"
          />
        </div>

        {/* --- Giờ --- */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn giờ</h3>
          <div className="grid grid-cols-3 gap-3">
            {times.map((time, i) => (
              <button
                key={i}
                className={clsx(
                  "py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  time === selectedTime
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                )}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Nút Đặt lịch --- */}
      <div className="fixed bottom-16 left-0 w-full p-4 bg-white border-t z-10">
        <button
          onClick={handleBooking}
          className={clsx(
            "bg-orange-400 text-white w-full py-3 rounded-lg font-semibold text-lg transition-colors duration-200",
            !isBookingReady
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-500"
          )}
          disabled={!isBookingReady}
        >
          Đặt lịch
        </button>
      </div>

      {/* --- Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full border-t bg-white py-2 px-4 flex justify-around text-xs z-20">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 ${
              currentPath === item.path ? "text-orange-500" : "text-gray-500"
            } hover:text-orange-400 transition-colors duration-200`}
          >
            <item.icon
              className={`w-5 h-5 ${
                currentPath === item.path ? "stroke-[2.5]" : ""
              }`}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Booking;

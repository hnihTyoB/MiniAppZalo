import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import clsx from "clsx";
import {
  Home as HomeIcon,
  CalendarDays as CalendarIcon,
  ListChecks,
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
  ChevronDown,
  Search,
  Paintbrush,
  SprayCan,
} from "lucide-react";
import { Select, Checkbox, Modal, Button } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { openOAChat } from "@/utils/zalo";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  action?: () => void;
}
interface Service {
  id: string;
  name: string;
  icon?: React.ElementType;
}
interface Branch {
  id: number;
  name: string;
  image_url?: string;
  address?: string;
}
interface Vehicle {
  id: string;
  make: string;
  model: string;
  license_plate: string;
  type_name: string;
  make_name: string;
  model_name: string;
}

const serviceIcons: { [key: string]: React.ElementType } = {
  "Sửa xe": Wrench,
  "Thay kính": Square,
  "Thay dầu": Droplet,
  "Rửa xe": ShowerHead,
  "Bảo dưỡng": Settings,
  "Kiểm tra tổng quát": Search,
  "Sơn xe": Paintbrush,
  "Vệ sinh nội thất": SprayCan,
};

const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: CalendarIcon, label: "Bookings", path: "/bookings" },
  { icon: MessageCircle, label: "Chat", path: "/chat", action: openOAChat },
  { icon: User, label: "Profile", path: "/profile" },
];

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize current date to midnight local time
  const getNormalizedDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(getNormalizedDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [defaultVehicleId, setDefaultVehicleId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Safely access location.state
  const preselectedBranch = location.state?.selectedBranch || null;
  const preselectedServices = Array.isArray(location.state?.selectedServices) ? location.state.selectedServices : [];
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>(preselectedServices);
  const [showAllServices, setShowAllServices] = useState(!preselectedServices.length);

  const currentPath = window.location.pathname;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch data concurrently
        const [servicesResponse, vehiclesResponse, branchesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/services`, { headers }).catch((err) => {
            console.error("Error fetching services:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/api/vehicles`, { headers }).catch((err) => {
            console.error("Error fetching vehicles:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/api/branches`, { headers }).catch((err) => {
            console.error("Error fetching branches:", err);
            return { data: [] };
          }),
        ]);

        // Process services
        const servicesData = Array.isArray(servicesResponse.data)
          ? servicesResponse.data.map((service: any) => ({
              id: service.id?.toString() || "",
              name: service.name || "",
              icon: serviceIcons[service.name] || Wrench,
            })).filter((s: Service) => s.id && s.name)
          : [];
        setServices(servicesData);

        if (preselectedServices.length > 0) {
          setSelectedServiceNames(preselectedServices);
        }

        // Process vehicles
        const vehicles = Array.isArray(vehiclesResponse.data) ? vehiclesResponse.data : [];
        setUserVehicles(vehicles);

        const storedDefaultId = localStorage.getItem("defaultVehicleId");
        setDefaultVehicleId(storedDefaultId);

        if (isInitialMount && vehicles.length > 0) {
          const defaultVehicle = storedDefaultId
            ? vehicles.find((v: Vehicle) => v.id === storedDefaultId)
            : vehicles[0];
          setSelectedVehicle(defaultVehicle || null);
        }

        // Process branches
        const branchesData = Array.isArray(branchesResponse.data) ? branchesResponse.data : [];
        setBranches(branchesData);

        if (isInitialMount) {
          if (preselectedBranch && typeof preselectedBranch === "object" && preselectedBranch.id) {
            const branch = branchesData.find((b: Branch) => b.id === preselectedBranch.id);
            setSelectedBranch(branch || (branchesData.length > 0 ? branchesData[0] : null));
          } else {
            setSelectedBranch(branchesData.length > 0 ? branchesData[0] : null);
          }
          setIsInitialMount(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Unexpected error in fetchData:", err);
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchData();

    if (location.state?.refresh) {
      fetchData();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [navigate, location.state?.refresh]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedDate || !selectedBranch) {
        setAvailableTimes([]);
        setSelectedTime(null);
        return;
      }

      try {
        setTimesLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Định dạng appointmentDate thủ công để tránh lệch múi giờ
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const appointmentDate = `${year}-${month}-${day}`;

        const response = await axios.get(`${API_BASE_URL}/api/available-times`, {
          params: {
            branch_id: selectedBranch.id,
            appointment_date: appointmentDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const times = Array.isArray(response.data) ? response.data : [];
        setAvailableTimes(times);

        if (selectedTime && !times.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (err) {
        console.error("Error fetching available times:", err);
        setAvailableTimes([]);
        setSelectedTime(null);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy các khoảng thời gian khả dụng.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      } finally {
        setTimesLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, selectedBranch?.id, navigate]);

  // Mở Modal khi có lỗi
  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const normalizedDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      setSelectedDate(normalizedDate);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      const normalizedDate = new Date(value[0].getFullYear(), value[0].getMonth(), value[0].getDate());
      setSelectedDate(normalizedDate);
    } else {
      setSelectedDate(null);
    }
  };

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServiceNames((prevSelected) =>
      prevSelected.includes(serviceName)
        ? prevSelected.filter((name) => name !== serviceName)
        : [...prevSelected, serviceName]
    );
  };

  const handleToggleShowServices = () => {
    setShowAllServices(!showAllServices);
  };

  const handleBranchSelectChange = (branchId: string | number) => {
    const branch = branches.find((b) => b.id === Number(branchId));
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
      if (newDefaultId) {
        localStorage.setItem("defaultVehicleId", newDefaultId);
      } else {
        localStorage.removeItem("defaultVehicleId");
      }
    }
  };

  const navigateToVehicleManagement = () => navigate("/vehicles");
  const navigateToAddVehicle = () => navigate("/add-vehicle");

  const handleBooking = async () => {
    if (isBookingReady) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const serviceIds = selectedServiceNames
          .map((name) => {
            const service = services.find((s) => s.name === name);
            return service ? parseInt(service.id, 10) : null;
          })
          .filter((id) => id !== null) as number[];

        if (serviceIds.length === 0) {
          setError("Không tìm thấy dịch vụ nào hợp lệ.");
          return;
        }

        const startTime = selectedTime!.split("-")[0].trim();
        const formattedTime = `${startTime}:00`;

        const year = selectedDate!.getFullYear();
        const month = String(selectedDate!.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate!.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        const appointmentData = {
          service_ids: serviceIds,
          branch_id: selectedBranch!.id,
          vehicle_id: selectedVehicle?.id || null,
          appointment_date: formattedDate,
          appointment_time: formattedTime,
          notes: notes.trim() || undefined,
        };

        console.log("Dữ liệu gửi lên:", appointmentData);

        const response = await axios.post(
          `${API_BASE_URL}/api/appointments`,
          appointmentData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const appointmentId = response.data.appointmentId.toString();
        navigate("/booking-confirmation", {
          state: { appointmentId },
        });
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            console.error("Lỗi từ backend:", error.response.data?.message);
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi đặt lịch.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    } else {
      const missingFields: string[] = [];
      if (selectedServiceNames.length === 0) missingFields.push("dịch vụ");
      if (!selectedBranch) missingFields.push("chi nhánh");
      if (!selectedVehicle) missingFields.push("phương tiện");
      if (!selectedDate) missingFields.push("ngày");
      if (!selectedTime) missingFields.push("giờ");

      if (missingFields.length > 0) {
        setError(`Vui lòng chọn đầy đủ các thông tin bắt buộc: ${missingFields.join(", ")}.`);
      } else {
        setError("Vui lòng kiểm tra lại các thông tin đặt lịch.");
      }
    }
  };

  const isBookingReady =
    selectedServiceNames.length > 0 &&
    !!selectedBranch &&
    !!selectedVehicle &&
    !!selectedDate &&
    !!selectedTime;

  const servicesToShow = showAllServices
    ? services
    : services.filter((s) => selectedServiceNames.includes(s.name));

  if (loading) {
    return (
      <div className="h-screen flex flex-col mt-3">
        <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
          <h2 className="text-2xl font-semibold text-center flex-1">Đặt lịch</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white pb-36 mt-3">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-center p-4 border-b bg-white z-10">
        <h2 className="text-2xl font-semibold text-center flex-1">Đặt lịch</h2>
        <button
          onClick={() => navigate("/schedule")}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:bg-orange-50 rounded-full"
          aria-label="Xem lịch hẹn"
        >
          <ListChecks size={22} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Phương tiện */}
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
                    title={`${vehicle.type_name}: ${vehicle.make_name} ${vehicle.model_name}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex-grow truncate pr-2">
                        {vehicle.type_name}: {vehicle.make_name} {vehicle.model_name} ({vehicle.license_plate})
                      </span>
                      {vehicle.id === defaultVehicleId && (
                        <span className="text-green-600 text-xs font-medium ml-2 mr-4 flex-shrink-0">
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

        {/* Chi nhánh */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Chi nhánh</h3>
          {branches.length > 0 ? (
            <Select
              label="Chọn chi nhánh"
              placeholder="Chọn chi nhánh..."
              value={selectedBranch?.id || ""}
              onChange={handleBranchSelectChange}
              status={!selectedBranch ? "error" : "default"}
            >
              {branches.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  title={branch.name}
                >
                  <div>
                    <span className="font-medium">{branch.name}</span>
                    {branch.address && (
                      <span className="block text-xs text-gray-500 whitespace-normal">
                        ({branch.address})
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
          {selectedBranch && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {selectedBranch.image_url ? (
                <div className="w-full aspect-video bg-gray-100">
                  <img
                    src={selectedBranch.image_url}
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
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{selectedBranch.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dịch vụ */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">
              Dịch vụ ({selectedServiceNames.length} đã chọn)
            </h2>
            {!showAllServices && (
              <button
                onClick={() => setShowAllServices(true)}
                className="text-orange-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                Thêm dịch vụ
                <ChevronDown size={16} />
              </button>
            )}
            {showAllServices && services.length > 4 && (
              <button
                onClick={() => setShowAllServices(false)}
                className="text-orange-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                Ẩn bớt
                <ChevronDown size={16} className="rotate-180" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-xs sm:text-sm text-gray-600 mb-6">
            {(showAllServices ? services : servicesToShow).map((service) => {
              const isSelected = selectedServiceNames.includes(service.name);
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceToggle(service.name)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleServiceToggle(service.name);
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
                    {service.icon && (
                      <service.icon
                        className={clsx("w-6 h-6", isSelected ? "text-white" : "text-orange-500")}
                      />
                    )}
                  </div>
                  <span
                    className={clsx("font-medium", isSelected ? "text-orange-600" : "text-gray-600")}
                  >
                    {service.name}
                  </span>
                </div>
              );
            })}
            {!showAllServices && selectedServiceNames.length === 0 && (
              <div className="col-span-4 text-center text-gray-500 text-sm py-4">
                Bạn chưa chọn dịch vụ nào. Nhấn "Thêm dịch vụ" để chọn.
              </div>
            )}
          </div>

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

        {/* Chọn ngày */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn ngày</h3>
          <style>{`
            .react-calendar {
              border: none;
              border-radius: 0.5rem;
              font-family: inherit;
              width: 100%;
              background-color: #f9fafb;
              padding: 0.5rem;
            }
            .react-calendar__tile {
              border-radius: 9999px;
              height: 47px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0.25rem;
              transition: background-color 0.2s ease, color 0.2s ease;
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: #fed7aa;
            }
            .react-calendar__tile--now {
              background-color: #fdba74;
              color: white;
            }
            .react-calendar__tile--now:enabled:hover,
            .react-calendar__tile--now:enabled:focus {
              background-color: #fb923c;
            }
            .react-calendar__tile--active {
              background-color: #f97316 !important;
              color: white !important;
            }
            .react-calendar__tile--active:enabled:hover,
            .react-calendar__tile--active:enabled:focus {
              background-color: #ea580c !important;
            }
            .react-calendar__navigation button {
              color: #f97316;
              font-weight: 600;
              min-height: 40px;
              border-radius: 0.375rem;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background-color: #fff7ed;
            }
            .react-calendar__month-view__weekdays__weekday abbr {
              text-decoration: none;
              font-weight: 600;
              color: #4b5563;
            }
            .react-calendar__month-view__days__day--neighboringMonth {
              color: #d1d5db;
            }
          `}</style>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={getNormalizedDate()}
            locale="vi-VN"
          />
        </div>

        {/* Chọn giờ */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Chọn giờ</h3>
          {timesLoading ? (
            <div className="text-center text-gray-500">Đang tải giờ khả dụng...</div>
          ) : availableTimes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availableTimes.map((time, i) => (
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
          ) : (
            <div className="text-center text-gray-500">
              Không có giờ nào khả dụng cho ngày và chi nhánh đã chọn.
            </div>
          )}
        </div>
      </div>

      {/* Nút Đặt lịch */}
      <div className="fixed bottom-16 left-0 w-full p-4 bg-white border-t z-10">
        <button
          onClick={handleBooking}
          className={clsx(
            "bg-orange-400 text-white w-full py-3 rounded-lg font-semibold text-lg transition-colors duration-200",
            !isBookingReady ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-500"
          )}
          disabled={!isBookingReady}
        >
          Đặt lịch
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full border-t bg-white py-2 px-4 flex justify-around text-xs z-20">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-0.5 ${
              currentPath === item.path ? "text-orange-500" : "text-gray-500"
            } hover:text-orange-400 transition-colors duration-200`}
          >
            <item.icon
              className={`w-5 h-5 ${currentPath === item.path ? "stroke-[2.5]" : ""}`}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Modal để hiển thị lỗi */}
      <Modal
        visible={isModalOpen}
        title="Lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        description={error || "Đã có lỗi xảy ra."}
        className="custom-error-modal"
      >
        <style>{`
          .custom-error-modal .zaui-modal-content {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background-color: #fff;
            max-width: 320px;
            margin: 0 auto;
            padding: 20px;
          }
          .custom-error-modal .zaui-modal-title {
            font-size: 20px;
            font-weight: 600;
            color: #d32f2f;
            text-align: center;
            margin-bottom: 12px;
          }
          .custom-error-modal .zaui-modal-description {
            font-size: 16px;
            color: #333;
            text-align: center;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .custom-error-modal .zaui-btn-primary {
            margin-top: 15px;
            background-color: #f97316;
            border-color: #f97316;
            color: #fff;
            border-radius: 8px;
            padding: 10px 0;
            font-size: 16px;
            font-weight: 500;
            transition: background-color 0.2s ease;
            width: 100%;
          }
          .custom-error-modal .zaui-btn-primary:hover {
            background-color: #ea580c;
            border-color: #ea580c;
          }
        `}</style>
        <Button
          variant="primary"
          onClick={() => {
            setIsModalOpen(false);
            setError(null);
          }}
        >
          OK
        </Button>
      </Modal>
    </div>
  );
};

export default Booking;
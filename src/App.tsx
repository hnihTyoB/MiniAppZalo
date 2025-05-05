// src/App.tsx
import { App as ZMPApp } from "zmp-ui";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { ToastContainer } from "react-toastify"; // Bạn có thể giữ lại nếu dùng Toastify
// import "react-toastify/dist/ReactToastify.css"; // Bạn có thể giữ lại nếu dùng Toastify
import StartScreen from "./pages/StartScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import VerifyOtpScreen from "./pages/VerifyOtpScreen";
import Home from "./pages/Home";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BranchListPage from "./pages/BranchListPage";
import BranchDetail from "./pages/BranchDetail";
import Notifications from "./pages/Notifications";
import Booking from "./pages/Bookings";
import Schedule from "./pages/Schedule";
import BookingConfirmation from "./pages/BookingConfirmation";
// import Chat from "./pages/Chat";
// import Conversation from "./pages/Conversation";
import Profile from "./pages/Profile";
import BookingHistory from "./pages/BookingHistory";
import AccountInfo from "./pages/AccountInfo";
import VehicleManagement from "./pages/VehicleManagement";
import AddEditVehicle from "./pages/AddEditVehicle";
import Version from "./pages/Version";
import Help from "./pages/Help";
import EditProfile from "./pages/EditProfile";
import AdminLayout from "./components/admin/AdminLayout"; // Layout chung cho trang admin
import ProtectedRoute from "./components/admin/ProtectedRoute"; // Component bảo vệ route admin
import AdminDashboard from "./components/admin/AdminDashboard"; // Trang Dashboard admin (ví dụ)
import UserManagement from "./components/admin/UserManagement"; // Trang quản lý người dùng
import ServiceManagement from "./components/admin/ServiceManagement"; // <<< THÊM IMPORT
import BookingManagement from "./components/admin/BookingManagement";
import BranchConfiguration from "./components/admin/BranchConfiguration"; // <<< ĐỔI TÊN IMPORT VÀ FILE >>>
import AddEditUser from "./components/admin/AddEditUser"; // <<< THÊM IMPORT TRANG MỚI >>>
import AddEditService from "./components/admin/AddEditService"; // <<< THÊM IMPORT TRANG DỊCH VỤ MỚI >>>
import ResetPasswordScreen from "./pages/ResetPasswordScreen"; // <<< THÊM IMPORT TRANG MỚI >>>
import { AuthProvider } from "./contexts/AuthContext"; // <<< Import AuthProvider
// --- Xác định basename một cách có điều kiện ---
const ZALO_APP_ID = "3103109239621189141";
// Mặc định basename là '/' cho môi trường development
let baseName = "/";

// Kiểm tra biến môi trường NODE_ENV
// Nếu là 'production' (khi build cho Zalo), thì mới đặt basename đặc biệt
if (process.env.NODE_ENV === "production") {
  baseName = `/zapps/${ZALO_APP_ID}`;
  console.log("Running in production mode, setting basename to:", baseName);
} else {
  console.log("Running in development mode, basename is '/'");
}

// --- Lưu ý với Vite ---
// Nếu bạn dùng Vite, bạn có thể cần dùng import.meta.env.MODE thay vì process.env.NODE_ENV
// Ví dụ:
// if (import.meta.env.MODE === 'production') {
//   baseName = `/zapps/${ZALO_APP_ID}`;
// }
// console.log("Vite Mode:", import.meta.env.MODE);

const MainApp = () => {
  return (
    // <<< Bọc toàn bộ ứng dụng bằng AuthProvider >>>
    <AuthProvider>
      <ZMPApp>
        {/* <<< THÊM basename VÀO BrowserRouter >>> */}
        <BrowserRouter basename={baseName}>
          <Routes>
            {/* Các Route của bạn giữ nguyên */}
            <Route path="/" element={<StartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/verify-otp" element={<VerifyOtpScreen />} />
            <Route
              path="/reset-password"
              element={<ResetPasswordScreen />}
            />{" "}
            {/* <<< THÊM ROUTE MỚI >>> */}
            <Route path="/home" element={<Home />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/branches" element={<BranchListPage />} />
            <Route path="/branch-detail" element={<BranchDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route
              path="/booking-confirmation"
              element={<BookingConfirmation />}
            />
            {/* <Route path="/chat" element={<Chat />} /> */}
            {/* <Route path="/conversation/:branchId" element={<Conversation />} /> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking-history" element={<BookingHistory />} />
            <Route path="/account" element={<AccountInfo />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/add-vehicle" element={<AddEditVehicle />} />
            <Route
              path="/edit-vehicle/:vehicleId"
              element={<AddEditVehicle />}
            />
            <Route path="/version" element={<Version />} />
            <Route path="/help" element={<Help />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            {/* --- Routes cho Admin --- */}
            <Route element={<ProtectedRoute />}>
              {" "}
              {/* Bọc các route admin bằng ProtectedRoute */}
              <Route path="/admin" element={<AdminLayout />}>
                {" "}
                {/* Sử dụng AdminLayout */}
                {/* Index route cho /admin (trang mặc định khi vào /admin) */}
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />{" "}
                {/* Quản lý người dùng */}
                <Route path="users/add" element={<AddEditUser />} />{" "}
                {/* <<< THÊM ROUTE THÊM MỚI >>> */}
                <Route
                  path="users/edit/:userId"
                  element={<AddEditUser />}
                />{" "}
                {/* <<< THÊM ROUTE SỬA >>> */}
                <Route path="services" element={<ServiceManagement />} />{" "}
                <Route path="services/add" element={<AddEditService />} />{" "}
                {/* <<< THÊM ROUTE THÊM DỊCH VỤ >>> */}
                <Route
                  path="services/edit/:serviceId"
                  element={<AddEditService />}
                />{" "}
                {/* <<< THÊM ROUTE SỬA DỊCH VỤ >>> */}
                {/* <<< THÊM ROUTE */}
                <Route path="bookings" element={<BookingManagement />} />{" "}
                {/* <<< THÊM ROUTE */}
                <Route path="settings" element={<BranchConfiguration />} />{" "}
                {/* <<< SỬ DỤNG COMPONENT MỚI >>> */}
                {/* <<< THÊM ROUTE */}
                {/* Thêm các route admin khác tại đây */}
              </Route>
            </Route>
          </Routes>
          {/* Bạn có thể đặt ToastContainer ở đây nếu muốn nó hiển thị trên mọi trang */}
          {/* <ToastContainer /> */}
        </BrowserRouter>
      </ZMPApp>
    </AuthProvider>
  );
};

export default MainApp;

import { App as ZMPApp } from "zmp-ui";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import Chat from "./pages/Chat";
import Conversation from "./pages/Conversation";
import Profile from "./pages/Profile";
import BookingHistory from "./pages/BookingHistory";
import AccountInfo from "./pages/AccountInfo";
import VehicleManagement from "./pages/VehicleManagement";
import AddEditVehicle from "./pages/AddEditVehicle";
import Version from "./pages/Version";
import Help from "./pages/Help";
import EditProfile from "./pages/EditProfile";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import ServiceManagement from "./components/admin/ServiceManagement";
import BookingManagement from "./components/admin/BookingManagement";
import BranchConfiguration from "./components/admin/BranchConfiguration";
import GeneralSettings from "./components/admin/GeneralSettings"; // Thêm import
import AddEditUser from "./components/admin/AddEditUser";
import AddEditService from "./components/admin/AddEditService";
import { AuthProvider } from "./contexts/AuthContext";

const ZALO_APP_ID = "3103109239621189141";
let baseName = "/";
if (process.env.NODE_ENV === "production") {
  baseName = `/zapps/${ZALO_APP_ID}`;
}

const MainApp = () => {
  return (
    <AuthProvider>
      <ZMPApp>
        <BrowserRouter basename={baseName}>
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/verify-otp" element={<VerifyOtpScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/branches" element={<BranchListPage />} />
            <Route path="/branch-detail" element={<BranchDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/conversation/:branchId" element={<Conversation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking-history" element={<BookingHistory />} />
            <Route path="/account" element={<AccountInfo />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/add-vehicle" element={<AddEditVehicle />} />
            <Route path="/edit-vehicle/:vehicleId" element={<AddEditVehicle />} />
            <Route path="/version" element={<Version />} />
            <Route path="/help" element={<Help />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            {/* Comment route admin để kiểm tra */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/add" element={<AddEditUser />} />
                <Route path="users/edit/:userId" element={<AddEditUser />} />
                <Route path="services" element={<ServiceManagement />} />
                <Route path="services/add" element={<AddEditService />} />
                <Route path="services/edit/:serviceId" element={<AddEditService />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="settings" element={<GeneralSettings />} />
                <Route path="branches" element={<BranchConfiguration />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ZMPApp>
    </AuthProvider>
  );
};

export default MainApp;
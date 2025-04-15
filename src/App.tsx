// src/App.tsx
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
import BookingConfirmation from "./pages/BookingConfirmation"; // Đường dẫn đến component BookingConfirmation
import Chat from "./pages/Chat";
import Conversation from "./pages/Conversation";
import Profile from "./pages/Profile";
import BookingHistory from "./pages/BookingHistory"; // Đường dẫn đến component BookingHistory
import VehicleManagement from "./pages/VehicleManagement"; // <<< Import trang quản lý xe
import AddEditVehicle from "./pages/AddEditVehicle";
import AccountInfo from "./pages/AccountInfo";
import EditProfile from "./pages/EditProfile";

const MainApp = () => {
  return (
    <ZMPApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/verify-otp" element={<VerifyOtpScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/branches" element={<BranchListPage />} />
          <Route path="/branch-detail" element={<BranchDetail />} />{" "}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bookings" element={<Booking />} />{" "}
          <Route path="/schedule" element={<Schedule />} />{" "}
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />{" "}
          <Route path="/chat" element={<Chat />} />
          <Route path="/conversation/:branchId" element={<Conversation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking-history" element={<BookingHistory />} />{" "}
          <Route path="/vehicles" element={<VehicleManagement />} />{" "}
          <Route path="/add-vehicle" element={<AddEditVehicle />} />{" "}
          <Route path="/edit-vehicle/:vehicleId" element={<AddEditVehicle />} />{" "}
          <Route path="/account" element={<AccountInfo />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          {/* Thêm các route khác nếu cần */}
        </Routes>
      </BrowserRouter>
    </ZMPApp>
  );
};

export default MainApp;

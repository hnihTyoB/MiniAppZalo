// src/App.tsx
import { App as ZMPApp } from "zmp-ui";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "./pages/StartScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import VerifyOtpScreen from "./pages/VerifyOtpScreen";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AccountInfo from "./pages/AccountInfo";
import EditProfile from "./pages/EditProfile";
import Booking from "./pages/Bookings"; // Đảm bảo đã import
import BranchDetail from "./pages/BranchDetail";
import Chat from "./pages/Chat";

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
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<AccountInfo />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/bookings" element={<Booking />} />{" "}
          <Route path="/branch-detail" element={<BranchDetail />} />{" "}
          <Route path="/chat" element={<Chat />} />
          {/* Thêm các route khác nếu cần */}
        </Routes>
      </BrowserRouter>
    </ZMPApp>
  );
};

export default MainApp;

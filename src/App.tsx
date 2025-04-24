// // src/App.tsx
// import { App as ZMPApp } from "zmp-ui";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import StartScreen from "./pages/StartScreen";
// import LoginScreen from "./pages/LoginScreen";
// import RegisterScreen from "./pages/RegisterScreen";
// import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
// import VerifyOtpScreen from "./pages/VerifyOtpScreen";
// import Home from "./pages/Home";
// import ServiceDetailPage from "./pages/ServiceDetailPage";
// import BranchListPage from "./pages/BranchListPage";
// import BranchDetail from "./pages/BranchDetail";
// import Notifications from "./pages/Notifications";
// import Booking from "./pages/Bookings";
// import Schedule from "./pages/Schedule";
// import BookingConfirmation from "./pages/BookingConfirmation"; // Đường dẫn đến component BookingConfirmation
// import Chat from "./pages/Chat";
// import Conversation from "./pages/Conversation";
// import Profile from "./pages/Profile";
// import BookingHistory from "./pages/BookingHistory"; // Đường dẫn đến component BookingHistory
// import AccountInfo from "./pages/AccountInfo";
// import VehicleManagement from "./pages/VehicleManagement"; // <<< Import trang quản lý xe
// import AddEditVehicle from "./pages/AddEditVehicle";
// import Version from "./pages/Version"; // <<< Import trang phiên bản
// import Help from "./pages/Help";
// import EditProfile from "./pages/EditProfile";

// const MainApp = () => {
//   return (
//     <ZMPApp>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<StartScreen />} />
//           <Route path="/login" element={<LoginScreen />} />
//           <Route path="/register" element={<RegisterScreen />} />
//           <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
//           <Route path="/verify-otp" element={<VerifyOtpScreen />} />
//           <Route path="/home" element={<Home />} />
//           <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
//           <Route path="/branches" element={<BranchListPage />} />
//           <Route path="/branch-detail" element={<BranchDetail />} />{" "}
//           <Route path="/notifications" element={<Notifications />} />
//           <Route path="/bookings" element={<Booking />} />{" "}
//           <Route path="/schedule" element={<Schedule />} />{" "}
//           <Route
//             path="/booking-confirmation"
//             element={<BookingConfirmation />}
//           />{" "}
//           <Route path="/chat" element={<Chat />} />
//           <Route path="/conversation/:branchId" element={<Conversation />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/booking-history" element={<BookingHistory />} />{" "}
//           <Route path="/account" element={<AccountInfo />} />
//           <Route path="/vehicles" element={<VehicleManagement />} />{" "}
//           <Route path="/add-vehicle" element={<AddEditVehicle />} />{" "}
//           <Route path="/edit-vehicle/:vehicleId" element={<AddEditVehicle />} />{" "}
//           <Route path="/version" element={<Version />} />{" "}
//           <Route path="/help" element={<Help />} />
//           <Route path="/edit-profile" element={<EditProfile />} />
//           {/* Thêm các route khác nếu cần */}
//         </Routes>
//       </BrowserRouter>
//     </ZMPApp>
//   );
// };

// export default MainApp;

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
          <Route path="/edit-vehicle/:vehicleId" element={<AddEditVehicle />} />
          <Route path="/version" element={<Version />} />
          <Route path="/help" element={<Help />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          {/* Thêm các route khác nếu cần */}
        </Routes>
        {/* Bạn có thể đặt ToastContainer ở đây nếu muốn nó hiển thị trên mọi trang */}
        {/* <ToastContainer /> */}
      </BrowserRouter>
    </ZMPApp>
  );
};

export default MainApp;

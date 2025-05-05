// src/pages/LoginScreen.tsx
import React, { useState, FormEvent } from "react"; // <<< Thêm FormEvent
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { loginApi } from "../api/auth"; // <<< Corrected the path to src/api/auth.ts
import { Loader2 } from "lucide-react"; // <<< THAY THẾ: Import Loader2 thay vì Spinner

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState(""); // Thêm state cho số điện thoại
  const [password, setPassword] = useState(""); // Thêm state cho mật khẩu
  const [error, setError] = useState<string | null>(null); // <<< Thêm state cho lỗi
  const [loading, setLoading] = useState(false); // <<< Thêm state cho loading
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  const handleNavigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  const goBack = () => {
    navigate("/");
  };

  // --- Hàm xử lý đăng nhập ---
  const { login } = useAuth(); // <<< Lấy hàm login từ context

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault(); // <<< Ngăn form submit mặc định
    setError(null); // Xóa lỗi cũ
    setLoading(true); // Bắt đầu loading

    try {
      // Gọi API backend để xác thực
      // Giả sử API trả về { user: User, token?: string }
      // và ném lỗi nếu thất bại
      const response = await loginApi({ phone: phoneNumber, password }); // <<< Gọi API thật

      if (response && response.user) {
        // <<< Gọi hàm login từ context để cập nhật state và localStorage
        login(
          { ...response.user, branchId: response.user.branchId || "" },
          response.token
        );

        // <<< Điều hướng sau khi đăng nhập thành công
        // <<< SỬA LẠI: Kiểm tra cả admin và branch_manager >>>
        if (
          response.user.role === "admin" ||
          response.user.role === "branch_manager"
        ) {
          navigate("/admin/dashboard", { replace: true }); // Chuyển đến trang admin
        } else if (response.user.role === "customer") {
          // <<< Thêm kiểm tra customer >>>
          navigate("/home", { replace: true }); // Chuyển đến trang chủ user
        } else {
          navigate("/", { replace: true }); // <<< Chuyển về trang mặc định nếu role không xác định >>>
        }
      } else {
        // Trường hợp API thành công nhưng không trả về user (ít xảy ra)
        setError("Thông tin đăng nhập không hợp lệ.");
      }
    } catch (err: any) {
      // Xử lý lỗi từ API
      setError(err.message || "Số điện thoại hoặc mật khẩu không đúng.");
      console.error("Login failed:", err);
    } finally {
      setLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      <div className="bg-gray-200 flex items-center justify-center h-[40%]">
        <img
          src="/images/bg_app.png"
          alt="Ảnh"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      {/* <<< Bọc nội dung form bằng thẻ <form> và thêm onSubmit >>> */}
      <form
        onSubmit={handleLogin}
        className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-5" // <<< Tăng padding và space
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Đăng nhập</h1>
        {/* Cập nhật input số điện thoại */}
        <input
          type="tel" // Nên dùng type="tel" cho số điện thoại
          placeholder="Số điện thoại"
          value={phoneNumber} // Liên kết với state
          onChange={(e) => setPhoneNumber(e.target.value)}
          required // <<< Thêm required
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        {/* Cập nhật input mật khẩu */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password} // Liên kết với state
            onChange={(e) => setPassword(e.target.value)}
            required // <<< Thêm required
            className="border-b w-full p-2 pr-16 outline-none focus:border-orange-400" // <<< Điều chỉnh pr
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700" // <<< Căn giữa nút Hiện/Ẩn
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {/* <<< Hiển thị lỗi nếu có >>> */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-between items-center text-sm">
          <button
            type="button" // <<< Thêm type="button" để không submit form
            onClick={handleNavigateToRegister} // Giữ nguyên
            className="text-orange-500 hover:underline font-medium" // <<< Style lại
          >
            Đăng ký
          </button>
          <button
            type="button" // <<< Thêm type="button"
            onClick={handleNavigateToForgotPassword} // Giữ nguyên
            className="text-gray-500 hover:underline font-medium" // <<< Style lại
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Cập nhật nút Đăng nhập */}
        <button
          type="submit" // <<< Đổi thành type="submit"
          disabled={loading} // <<< Disable nút khi đang loading
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center" // <<< Style lại và thêm disable style, flex
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" /> // <<< THAY THẾ: Sử dụng Loader2 với animate-spin
          ) : (
            "Đăng nhập"
          )}
        </button>
        <div className="text-center text-sm text-gray-400 pt-2">
          hoặc đăng nhập với
        </div>
        <div className="flex justify-center gap-4">
          <button aria-label="Đăng nhập Zalo">
            <img
              src="/images/Icons/zalo_icon.webp"
              alt="Zalo"
              className="w-8 h-8"
            />
          </button>
          <button aria-label="Đăng nhập Facebook">
            <img
              src="/images/Icons/facebook_icon.png"
              alt="Facebook"
              className="w-8 h-8"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;

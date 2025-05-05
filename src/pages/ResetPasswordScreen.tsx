// src/pages/ResetPasswordScreen.tsx
import React, { useState, FormEvent, useEffect } from "react"; // <<< THÊM useEffect >>>
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get phone number (and potentially OTP/token) from previous screen
  const phoneNumber = location.state?.phoneNumber;
  // const verifiedOtp = location.state?.otp; // You might receive the OTP or a verification token

  // Redirect if phone number is missing
  useEffect(() => {
    if (!phoneNumber) {
      console.warn("Phone number missing, redirecting to forgot password.");
      navigate("/forgot-password", { replace: true });
    }
    // You might also want to validate the OTP/token here if needed
  }, [phoneNumber, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goBack = () => {
    navigate(-1); // Go back to OTP screen or forgot password
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      // Example: Add password length validation
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    console.log("Attempting to reset password for:", phoneNumber);
    // --- SIMULATE API CALL ---
    try {
      // Replace with your actual API call
      // await api.resetPassword(phoneNumber, newPassword, verifiedOtp); // Pass necessary data
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

      console.log("Password reset successful for:", phoneNumber);
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true }); // Navigate to login screen
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
    // --- END SIMULATE API CALL ---
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-gray-800 hover:text-gray-600 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium">Quay lại</span>
      </button>

      {/* Background Image */}
      <div className="bg-gray-200 flex items-center justify-center h-[60%]">
        <img
          src="/images/bg_app.png"
          alt="Ảnh nền đặt lại mật khẩu"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>

      {/* Form Area */}
      <form
        onSubmit={handleResetPassword}
        className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-6"
      >
        <h1 className="text-3xl font-bold text-center mb-4">
          Đặt lại mật khẩu
        </h1>

        {/* New Password Input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6} // Add minLength for basic validation
            className="border-b w-full p-2 pr-16 outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {/* Confirm Password Input */}
        <input
          type="password" // Keep as password type
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />

        {/* Error Display */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Xác nhận"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordScreen;

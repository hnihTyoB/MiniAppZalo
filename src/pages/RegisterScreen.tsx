import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Modal, Button } from "zmp-ui";

const RegisterScreen = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (): Promise<void> => {
    try {
      setError(null);

      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        setError("Số điện thoại phải bắt đầu bằng 0, có đúng 10 chữ số và không chứa ký tự đặc biệt hoặc chữ cái!");
        return;
      }

      if (password !== confirmPassword) {
        setError("Mật khẩu nhập lại không khớp!");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        full_name: fullName,
        phone_number: phoneNumber,
        email: email,
        password: password,
      });

      if (response.status === 201) {
        console.log("Đăng ký thành công:", response.data);
        setSuccessMessage("Đăng ký thành công! Mời bạn đăng nhập...");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        const message = error.response.data?.message || "Đã có lỗi xảy ra";
        setError(message);
      } else {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative flex flex-col h-full">
      <button
        onClick={goBack}
        className="absolute top-7 left-4 z-10 flex items-center gap-2 text-base text-white hover:text-gray-200 px-3 py-2 rounded"
      >
        <ChevronLeft size={25} />
        <span className="text-lg font-medium " style={{ color: "GrayText" }}>
          Quay lại
        </span>
      </button>

      <div className="bg-gray-200 flex items-center justify-center h-[28%]">
        <img
          src="/images/bg_start.jpg"
          style={{ backgroundSize: "contain", backgroundRepeat: "no-repeat" }}
          alt="Ảnh nền đăng ký"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="bg-white flex-1 rounded-t-3xl p-6 overflow-y-auto space-y-5">
        <h1 className="text-3xl font-bold mb-4 text-center">Đăng ký</h1>

        {successMessage && (
          <div className="text-green-500 text-center mb-4">{successMessage}</div>
        )}

        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-b w-full p-2 outline-none focus:border-orange-400"
        />
        <p className="text-xs text-gray-500 text-center px-4 pt-2">
          Bằng cách đăng ký, bạn đồng ý với các{" "}
          <a
            href="/terms"
            className="text-orange-500 hover:underline font-medium"
          >
            Điều khoản
          </a>{" "}
          &{" "}
          <a
            href="/policy"
            className="text-orange-500 hover:underline font-medium"
          >
            Chính sách
          </a>{" "}
          của chúng tôi.
        </p>
        <button
          onClick={handleRegister}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 w-full rounded-lg text-lg font-semibold mt-4"
        >
          Đăng ký
        </button>
        <div className="text-center text-sm pt-2">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-orange-500 hover:underline font-medium"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>

      <Modal
        visible={isModalOpen}
        title="Lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        description={error || "Đã có lỗi xảy ra."}
      >
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

export default RegisterScreen;
// src/pages/StartScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    // Giữ lại relative và h-full
    <div
      className="relative h-full w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg_app.png')" }}
    >
      {/* Nút button giờ sẽ định vị đúng theo div này */}
      <button
        onClick={() => navigate("/login")}
        className="absolute bottom-0 left-0 bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full"
      >
        Bắt đầu
      </button>
    </div>
  );
};

export default StartScreen;

// src/pages/Help.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input"; // Giả sử dùng shadcn/ui
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Giả sử dùng shadcn/ui

// --- Dữ liệu FAQ mẫu ---
const faqData = [
  {
    id: "faq1",
    question: "Làm thế nào để đặt lịch hẹn?",
    answer:
      "Bạn có thể đặt lịch hẹn bằng cách vào mục 'Đặt lịch' (Bookings) ở thanh điều hướng dưới cùng. Chọn dịch vụ, chi nhánh, ngày giờ mong muốn và xác nhận thông tin.",
  },
  {
    id: "faq2",
    question: "Làm sao để thêm hoặc sửa thông tin xe?",
    answer:
      "Vào mục 'Hồ sơ' (Profile), chọn 'Quản lý phương tiện'. Tại đây bạn có thể nhấn nút 'Thêm xe mới' hoặc chọn xe đã có để 'Chỉnh sửa' hoặc 'Xóa'.",
  },
  {
    id: "faq3",
    question: "Tôi quên mật khẩu, phải làm sao?",
    answer:
      "Tại màn hình đăng nhập, nhấn vào liên kết 'Quên mật khẩu?'. Nhập số điện thoại đã đăng ký, hệ thống sẽ gửi mã OTP để bạn xác nhận và tạo mật khẩu mới.",
  },
  {
    id: "faq4",
    question: "Làm thế nào để xem lại lịch sử đặt lịch?",
    answer:
      "Vào mục 'Hồ sơ' (Profile), chọn 'Lịch sử'. Trang này sẽ hiển thị các lịch hẹn đã hoàn thành của bạn.",
  },
  // Thêm các câu hỏi khác...
];

const Help = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const goBack = () => {
    navigate(-1);
  };

  // Lọc FAQ dựa trên searchTerm
  const filteredFaq = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1 text-gray-800">
          Trợ giúp & Hỗ trợ
        </h2>
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* Thanh tìm kiếm */}
      <div className="sticky top-[65px] bg-gray-50 z-10 px-4 py-3 border-b">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full bg-white" // Thêm bg-white
          />
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Phần FAQ */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Câu hỏi thường gặp
          </h3>
          {filteredFaq.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {filteredFaq.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pt-2 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Không tìm thấy câu hỏi phù hợp.
            </p>
          )}
        </div>

        {/* Phần Liên hệ hỗ trợ */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Liên hệ hỗ trợ
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            {/* Hotline */}
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Hotline</p>
                <a
                  href="tel:19001234" // <<< Thay bằng số hotline thực tế
                  className="text-sm font-medium hover:underline"
                >
                  1900 1234
                </a>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a
                  href="mailto:support@ptit-auto.com" // <<< Thay bằng email thực tế
                  className="text-sm font-medium hover:underline"
                >
                  support@ptit-auto.com
                </a>
              </div>
            </div>
            {/* Chat (Tùy chọn) */}
            <button
              onClick={() => navigate("/chat")} // <<< Điều hướng đến trang chat chung hoặc chat hỗ trợ riêng
              className="w-full mt-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-orange-200"
            >
              <MessageCircle size={16} /> Gửi tin nhắn hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

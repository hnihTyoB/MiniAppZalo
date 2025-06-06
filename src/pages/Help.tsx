import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import supportConfig from "../config/support";
import { openOAChat } from "@/utils/zalo"; // Import hàm tiện ích để mở Zalo OA Chat

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const Help = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy danh sách FAQ từ API (giữ nguyên logic backend)
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/faqs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFaqs(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string; error?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(
              error.response.data.message || error.response.data.error || "Đã có lỗi xảy ra khi lấy danh sách FAQ."
            );
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchFaqs();
  }, [navigate]);

  // Lọc FAQ dựa trên searchTerm
  const filteredFaq = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 mt-3">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-2xl font-semibold text-center flex-1 text-gray-800">
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
            className="pl-10 pr-3 py-2 w-full bg-white"
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
                  value={`faq-${item.id}`}
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
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">
                Không tìm thấy câu hỏi phù hợp.
              </p>
              <button
                onClick={() => openOAChat()} // Sử dụng openOAChat thay vì navigate("/chat")
                className="text-sm text-orange-600 hover:underline"
              >
                Liên hệ hỗ trợ ngay
              </button>
            </div>
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
                  href={supportConfig.hotlineLink}
                  className="text-sm font-medium hover:underline"
                >
                  {supportConfig.hotline}
                </a>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a
                  href={supportConfig.emailLink}
                  className="text-sm font-medium hover:underline"
                >
                  {supportConfig.email}
                </a>
              </div>
            </div>
            {/* Chat */}
            <button
              onClick={() => openOAChat()} // Sử dụng openOAChat thay vì navigate("/chat")
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
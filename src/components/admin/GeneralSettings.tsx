import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Edit,
  PlusCircle,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../config/api";
import { Modal, Button, Input } from "zmp-ui";

// Interface cho FAQ
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Interface cho thông tin hệ thống
interface SystemInfo {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
}

const GeneralSettings: React.FC = () => {
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFaqModalOpen, setIsAddFaqModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  // Lấy thông tin hệ thống (giả lập vì không có API thực tế)
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Giả lập dữ liệu hệ thống (có thể thay bằng API thực tế)
        const mockSystemInfo: SystemInfo = {
          siteName: "Hệ Thống Đặt Lịch",
          contactEmail: "contact@system.com",
          contactPhone: "0123 456 789",
          description: "Hệ thống đặt lịch dịch vụ bảo dưỡng xe.",
        };
        setSystemInfo(mockSystemInfo);
        setNewSiteName(mockSystemInfo.siteName);
        setNewContactEmail(mockSystemInfo.contactEmail);
        setNewContactPhone(mockSystemInfo.contactPhone);
        setNewDescription(mockSystemInfo.description);

        // Lấy danh sách FAQ từ API
        const faqResponse = await axios.get(`${API_BASE_URL}/api/faqs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFaqs(faqResponse.data);

        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra.");
          }
        } else {
          setError("Không thể kết nối đến server.");
        }
      }
    };

    fetchSystemInfo();
  }, [navigate]);

  // Hiển thị modal lỗi nếu có
  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  // Xử lý cập nhật thông tin hệ thống
  const handleUpdateSystemInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Giả lập API cập nhật thông tin hệ thống (thay bằng API thực tế nếu có)
      const updatedInfo: SystemInfo = {
        siteName: newSiteName,
        contactEmail: newContactEmail,
        contactPhone: newContactPhone,
        description: newDescription,
      };
      setSystemInfo(updatedInfo);
      setIsEditModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Đã có lỗi khi cập nhật thông tin.");
    }
  };

  // Xử lý thêm FAQ mới
  const handleAddFaq = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!newFaqQuestion || !newFaqAnswer) {
        setError("Vui lòng điền đầy đủ câu hỏi và câu trả lời.");
        return;
      }

      // Giả lập API thêm FAQ (thay bằng API thực tế nếu có)
      const newFaq: FAQ = {
        id: (faqs.length + 1).toString(),
        question: newFaqQuestion,
        answer: newFaqAnswer,
      };
      setFaqs([...faqs, newFaq]);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setIsAddFaqModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Đã có lỗi khi thêm FAQ.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 flex-grow flex items-center justify-center text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6">
      {/* Tiêu đề */}
      <h1 className="text-center text-2xl font-semibold mb-6 text-gray-800">
        Cấu Hình Hệ Thống
      </h1>

      {/* Thông tin hệ thống */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-700">
            Thông Tin Hệ Thống
          </h2>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <Edit size={16} />
            <span className="text-sm">Chỉnh sửa</span>
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tên hệ thống:</span>{" "}
            {systemInfo?.siteName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email liên hệ:</span>{" "}
            {systemInfo?.contactEmail}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Số điện thoại:</span>{" "}
            {systemInfo?.contactPhone}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Mô tả:</span> {systemInfo?.description}
          </p>
        </div>
      </div>

      {/* Danh sách FAQ */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-700">Câu Hỏi Thường Gặp (FAQ)</h2>
          <button
            onClick={() => setIsAddFaqModalOpen(true)}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <PlusCircle size={16} />
            <span className="text-sm">Thêm FAQ</span>
          </button>
        </div>
        {faqs.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có FAQ nào.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b pb-2">
                <p className="text-sm font-medium text-gray-700">
                  {faq.question}
                </p>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút làm mới dữ liệu */}
      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150"
      >
        <RefreshCw size={16} />
        Làm mới dữ liệu
      </button>

      {/* Modal chỉnh sửa thông tin hệ thống */}
      <Modal
        visible={isEditModalOpen}
        title="Chỉnh Sửa Thông Tin Hệ Thống"
        onClose={() => setIsEditModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên hệ thống
            </label>
            <Input
              value={newSiteName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewSiteName(e.target.value)
              }
              placeholder="Nhập tên hệ thống"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email liên hệ
            </label>
            <Input
              value={newContactEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewContactEmail(e.target.value)
              }
              placeholder="Nhập email liên hệ"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <Input
              value={newContactPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewContactPhone(e.target.value)
              }
              placeholder="Nhập số điện thoại"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              value={newDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewDescription(e.target.value)
              }
              placeholder="Nhập mô tả hệ thống"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
              rows={4}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleUpdateSystemInfo}
            className="w-full"
          >
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal thêm FAQ */}
      <Modal
        visible={isAddFaqModalOpen}
        title="Thêm FAQ Mới"
        onClose={() => setIsAddFaqModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Câu hỏi
            </label>
            <Input
              value={newFaqQuestion}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewFaqQuestion(e.target.value)
              }
              placeholder="Nhập câu hỏi"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Câu trả lời
            </label>
            <textarea
              value={newFaqAnswer}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewFaqAnswer(e.target.value)
              }
              placeholder="Nhập câu trả lời"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
              rows={4}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleAddFaq}
            className="w-full"
          >
            Thêm
          </Button>
        </div>
      </Modal>

      {/* Modal hiển thị lỗi */}
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

export default GeneralSettings;
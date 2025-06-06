// src/pages/Conversation.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Send, ImageIcon, Phone, Video } from "lucide-react";
import clsx from "clsx";

// --- Interfaces ---
interface BranchInfo {
  id: number | string;
  name: string;
  avatarUrl?: string;
  isActive?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "branch";
  timestamp: number;
}

const Conversation = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const branchId = params.branchId;
  const initialBranchInfo: BranchInfo | null = location.state?.branchInfo;

  // --- State ---
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(
    initialBranchInfo
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Fetch/Load Data (Mô phỏng) ---
  useEffect(() => {
    console.log("--- Conversation useEffect START ---");
    console.log("Received branchId:", branchId);
    console.log("Received initialBranchInfo from state:", initialBranchInfo);
    console.log("Current branchInfo before fetch/mock:", branchInfo);

    // Mô phỏng lấy thông tin chi nhánh nếu chưa có từ state
    let currentBranch = branchInfo; // Sử dụng biến tạm để tránh lỗi race condition
    if (!currentBranch && branchId) {
      console.log("Fetching branch info for ID:", branchId);
      // Giả sử bạn có hàm fetchBranchInfo(branchId)
      const fetchedBranch: BranchInfo = {
        id: branchId,
        name: `Chi nhánh ${branchId}`,
        avatarUrl: `/images/avatar-${branchId}.jpg`, // Đường dẫn ảnh mẫu
        isActive: Math.random() > 0.3,
      };
      console.log("Setting fetched/mocked branch info:", fetchedBranch);
      setBranchInfo(fetchedBranch);
      currentBranch = fetchedBranch; // Cập nhật biến tạm
    }

    // Mô phỏng tải lịch sử tin nhắn (sử dụng currentBranch để lấy tên)
    const mockMessages: ChatMessage[] = [
      {
        id: "m1",
        text: `Xin chào! Chúng tôi có thể giúp gì cho bạn tại ${
          currentBranch?.name || `Chi nhánh ${branchId}`
        }?`,
        sender: "branch",
        timestamp: Date.now() - 500000,
      },
      {
        id: "m2",
        text: "Tôi muốn hỏi về dịch vụ sửa xe.",
        sender: "user",
        timestamp: Date.now() - 400000,
      },
      {
        id: "m3",
        text: "Vâng, bạn cần sửa cụ thể bộ phận nào ạ?",
        sender: "branch",
        timestamp: Date.now() - 300000,
      },
      {
        id: "m4",
        text: "Tôi nghĩ là lốp xe có vấn đề.",
        sender: "user",
        timestamp: Date.now() - 200000,
      },
      {
        id: "m5",
        text: "Bạn có thể mang xe đến chi nhánh để kỹ thuật viên kiểm tra ạ.",
        sender: "branch",
        timestamp: Date.now() - 100000,
      },
    ];
    console.log("Setting mock messages:", mockMessages);
    setMessages(mockMessages);

    console.log("--- Conversation useEffect END ---");
    // Chỉ phụ thuộc vào branchId, vì branchInfo chỉ cần lấy 1 lần nếu chưa có
  }, [branchId]);

  // --- Tự động cuộn xuống tin nhắn mới nhất ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
  const goBack = () => {
    navigate(-1);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageToSend: ChatMessage = {
      id: `m${Date.now()}`,
      text: newMessage.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    // TODO: Gửi tin nhắn lên server ở đây
    console.log("Sending message:", messageToSend);

    setMessages((prevMessages) => [...prevMessages, messageToSend]);
    setNewMessage("");

    // Mô phỏng phản hồi
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `m${Date.now() + 1}`,
        text: `Chúng tôi đã nhận được tin nhắn: "${messageToSend.text}". Sẽ phản hồi sớm!`,
        sender: "branch",
        timestamp: Date.now() + 1000,
      };
      setMessages((prevMessages) => [...prevMessages, replyMessage]);
    }, 1500);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Render ---
  // Thêm kiểm tra loading hoặc lỗi nếu cần
  // if (!branchInfo) {
  //   return <div className="p-4">Đang tải thông tin cuộc trò chuyện...</div>;
  // }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm flex items-center p-3 border-b z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative w-9 h-9 flex-shrink-0 mr-2.5">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {branchInfo?.avatarUrl ? (
                <img
                  src={branchInfo.avatarUrl}
                  alt={branchInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={18} className="text-gray-400" />
              )}
            </div>
            {branchInfo?.isActive && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime-400 rounded-full border border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {branchInfo?.name || "Đang tải..."}
            </p>
            <p className="text-xs text-gray-500">
              {branchInfo?.isActive === undefined
                ? ""
                : branchInfo.isActive
                ? "Đang hoạt động"
                : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 ml-2">
          <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-full">
            <Phone size={20} />
          </button>
          <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-full">
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex",
              msg.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[75%] px-3 py-1.5 rounded-xl",
                msg.sender === "user"
                  ? "bg-orange-400 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none shadow-sm"
              )}
            >
              <p className="text-sm leading-snug">{msg.text}</p>
              <p
                className={clsx(
                  "text-xs mt-1 text-right",
                  msg.sender === "user"
                    ? "text-orange-100 opacity-80"
                    : "text-gray-400"
                )}
              >
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t p-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm focus:ring-1 focus:ring-orange-300"
        />
        <button
          onClick={handleSendMessage}
          className="bg-orange-400 text-white rounded-full p-2.5 hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={newMessage.trim() === ""}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Conversation;
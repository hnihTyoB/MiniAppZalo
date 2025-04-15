// src/pages/Notifications.tsx
import React, { useState, useEffect } from "react"; // <<< THÊM useEffect
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Image as ImageIcon, ChevronLeft } from "lucide-react";
import { Modal } from "zmp-ui";

// --- interface ScheduleItem ---
interface ScheduleItem {
  id: string;
  branch: string;
  services: string[];
  date: string;
  time: string;
  reminder: boolean;
  status: "upcoming" | "done";
  imageUrl?: string;
}

// --- Dữ liệu mẫu ban đầu ---
const initialMockData: ScheduleItem[] = [
  {
    id: "#549493",
    branch: "PTIT – Chi nhánh 1",
    services: ["Thay lốp"], // <<< SỬA Ở ĐÂY: Đổi thành services và đặt trong mảng
    date: "20 / 03 / 2025",
    time: "10:00 AM",
    reminder: false,
    status: "upcoming",
  },
  {
    id: "#64944",
    branch: "PTIT – Chi nhánh 2",
    services: ["Rửa xe"], // <<< SỬA Ở ĐÂY
    date: "22 / 03 / 2025",
    time: "07:00 AM",
    reminder: true,
    status: "upcoming",
  },
  {
    id: "#789101",
    branch: "PTIT – Chi nhánh 3",
    services: ["Thay nhớt"], // <<< SỬA Ở ĐÂY
    date: "12 / 03 / 2024",
    time: "11:00 AM",
    reminder: false,
    status: "done",
  },
  {
    id: "#889102",
    branch: "PTIT – Chi nhánh 1",
    services: ["Bảo dưỡng định kỳ"], // <<< SỬA Ở ĐÂY
    date: "15 / 04 / 2024",
    time: "09:00 AM",
    reminder: true,
    status: "upcoming",
  },
  {
    id: "#989103",
    branch: "PTIT – Chi nhánh 4",
    services: ["Kiểm tra tổng quát"], // <<< SỬA Ở ĐÂY
    date: "01 / 02 / 2024",
    time: "02:00 PM",
    reminder: false,
    status: "done",
  },
];

export default function Schedule() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  // <<< SỬA: Khởi tạo state với dữ liệu mẫu ban đầu >>>
  const [items, setItems] = useState<ScheduleItem[]>(initialMockData);
  // <<< THÊM STATE CHO MODAL XÁC NHẬN HỦY >>>
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );

  // <<< THÊM: useEffect để đọc và thêm lịch hẹn mới từ localStorage >>>
  useEffect(() => {
    try {
      const newlyAddedBookingsRaw = localStorage.getItem("newlyAddedBookings");
      if (newlyAddedBookingsRaw) {
        const newlyAddedBookings: ScheduleItem[] = JSON.parse(
          newlyAddedBookingsRaw
        );
        if (newlyAddedBookings.length > 0) {
          // Thêm lịch hẹn mới vào đầu danh sách hiện tại
          setItems((prevItems) => [...newlyAddedBookings, ...prevItems]);
          // Xóa dữ liệu đã đọc khỏi localStorage
          localStorage.removeItem("newlyAddedBookings");
        }
      }
    } catch (error) {
      console.error("Lỗi khi đọc lịch hẹn từ localStorage:", error);
      // Xóa nếu dữ liệu bị lỗi
      localStorage.removeItem("newlyAddedBookings");
    }
  }, []); // Chỉ chạy một lần khi component mount

  // --- Các hàm xử lý khác (giữ nguyên) ---
  const goBack = () => {
    navigate(-1);
  };
  const handleClearDone = () => {
    setItems((prev) => prev.filter((item) => item.status !== "done"));
  };
  const handleCancelAppointment = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    console.log(`Hủy lịch hẹn có ID: ${id}`);
  };
  const handleReminderChange = (id: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reminder: checked } : item
      )
    );
    console.log(`Thay đổi nhắc nhở cho ID ${id} thành ${checked}`);
  };
  // <<< MỞ MODAL KHI NHẤN NÚT HỦY >>>
  const requestCancelAppointment = (id: string) => {
    setAppointmentToCancel(id);
    setShowCancelConfirm(true);
  };

  // <<< HÀM HỦY THỰC SỰ KHI XÁC NHẬN TRÊN MODAL >>>
  const confirmCancelAppointment = () => {
    if (appointmentToCancel) {
      // Cập nhật state items
      setItems((prev) =>
        prev.filter((item) => item.id !== appointmentToCancel)
      );
      // TODO: Cập nhật lại localStorage nếu cần thiết sau khi hủy
      console.log(`Đã hủy lịch hẹn (Schedule) có ID: ${appointmentToCancel}`);
    }
    // Đóng modal và reset state
    setShowCancelConfirm(false);
    setAppointmentToCancel(null);
  };

  // <<< HỦY THAO TÁC KHI NHẤN HỦY TRÊN MODAL >>>
  const closeCancelModal = () => {
    setShowCancelConfirm(false);
    setAppointmentToCancel(null);
  };

  // --- Logic lọc (giữ nguyên) ---
  const filteredItems = items.filter((item) => {
    // Kiểm tra xem services có phải là mảng không và nối thành chuỗi
    const servicesString = Array.isArray(item.services)
      ? item.services.join(", ").toLowerCase()
      : ""; // Nếu không phải mảng, coi như chuỗi rỗng

    return (
      item.branch.toLowerCase().includes(search.toLowerCase()) ||
      servicesString.includes(search.toLowerCase()) || // <<< SỬA Ở ĐÂY
      item.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="h-full overflow-y-auto bg-white pb-20 max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Lịch hẹn</h1>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="sticky top-16 flex gap-2 items-center bg-white z-10 px-4 py-2 border-b">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          size="icon"
          className="bg-orange-400 hover:bg-orange-500 text-white flex-shrink-0"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Nội dung cuộn */}
      <div className="p-4 space-y-4">
        {/* Danh sách lịch hẹn */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm">
              <CardContent className="p-4 space-y-3">
                {/* Hàng 1 */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">{`${item.date} – ${item.time}`}</div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Nhắc tôi</span>
                    <Switch
                      checked={item.reminder}
                      onCheckedChange={(checked) =>
                        handleReminderChange(item.id, checked)
                      }
                      disabled={item.status === "done"}
                      className="data-[state=checked]:bg-orange-400"
                    />
                  </div>
                </div>
                {/* Hàng 2 */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        // <<< SỬA ALT TEXT >>>
                        alt={
                          Array.isArray(item.services)
                            ? item.services.join(", ")
                            : "Dịch vụ"
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="font-medium truncate">{item.branch}</div>
                    <div className="text-xs text-gray-500">ID: {item.id}</div>
                    <div className="text-sm font-semibold">
                      {/* <<< SỬA HIỂN THỊ DỊCH VỤ >>> */}
                      {Array.isArray(item.services)
                        ? item.services.join(", ")
                        : "N/A"}
                    </div>
                  </div>
                </div>
                {/* Đường kẻ */}
                <hr className="my-2 border-gray-200" />
                {/* Hàng 3 */}
                <div className="flex justify-center items-center pt-1">
                  {item.status === "done" ? (
                    <span className="text-sm text-green-600 font-medium">
                      Hoàn thành
                    </span>
                  ) : (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-red-500 text-sm font-medium hover:text-red-600"
                      onClick={() => requestCancelAppointment(item.id)}
                    >
                      Hủy lịch hẹn
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không tìm thấy lịch hẹn nào.
          </p>
        )}

        {/* Nút Dọn dẹp */}
        {items.some((item) => item.status === "done") && (
          <Button
            className="w-full bg-orange-400 hover:bg-orange-500 text-white rounded-xl mt-4 py-2.5"
            onClick={handleClearDone}
          >
            Dọn dẹp
          </Button>
        )}
      </div>
      {/* <<< THÊM MODAL XÁC NHẬN HỦY >>> */}
      <Modal
        visible={showCancelConfirm}
        title="Xác nhận hủy lịch hẹn"
        onClose={closeCancelModal} // Đóng modal khi nhấn ra ngoài hoặc nút X
        zIndex={1200}
        actions={[
          {
            text: "Không",
            onClick: closeCancelModal,
            highLight: false, // Nút thường
          },
          {
            text: "Hủy lịch hẹn",
            onClick: confirmCancelAppointment,
            highLight: true, // Nút nổi bật
            danger: true, // Đánh dấu là hành động nguy hiểm
          },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn hủy lịch hẹn này không?
        </div>
      </Modal>
    </div>
  );
}

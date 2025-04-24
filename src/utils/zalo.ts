// src/utils/zalo.ts (Ví dụ)
import { openChat } from "zmp-sdk/apis";

// <<< --- THAY THẾ BẰNG OA ID THỰC TẾ CỦA BẠN --- >>>
const YOUR_MAIN_ZALO_OA_ID = "2372716140535025833";
// <<< ------------------------------------------ >>>

export const openOAChat = async (
  oaId: string = YOUR_MAIN_ZALO_OA_ID,
  initialMessage?: string
) => {
  try {
    console.log(`Attempting to open chat with OA ID: ${oaId}`);
    await openChat({
      type: "oa",
      id: oaId,
      message: initialMessage, // Có thể thêm tin nhắn mở đầu nếu muốn
    });
    console.log("Opened Zalo OA Chat successfully");
  } catch (error) {
    // Xử lý lỗi nếu không mở được chat (ví dụ: trên web, chưa cài Zalo)
    console.error("Error opening Zalo OA Chat:", error);
    // Hiển thị thông báo lỗi thân thiện với người dùng
    alert(
      "Không thể mở cửa sổ chat Zalo OA. Vui lòng đảm bảo bạn đã cài đặt Zalo và thử lại."
    );
  }
};

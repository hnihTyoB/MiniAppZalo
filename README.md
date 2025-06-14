# 🚗 G2 Schedule a Car Repair – Zalo Mini App

**G2 Schedule a Car Repair** là một ứng dụng đặt lịch sửa chữa ô tô được xây dựng trên nền tảng **Zalo Mini App**. Ứng dụng giúp khách hàng dễ dàng tìm kiếm dịch vụ, đặt lịch sửa xe và nhận thông báo trực tiếp từ garage thông qua Zalo OA.

> ✅ Đây là sản phẩm đồ án học phần, bao gồm cả **frontend Mini App** và **backend API**.

## 📺 Demo

🎥 Xem video giới thiệu và demo sử dụng Mini App tại:  
👉 [https://youtu.be/wFBR3SgraXY](https://youtu.be/wFBR3SgraXY)

📦 Source code:  
👉 [https://github.com/hnihTyoB/MiniAppZalo](https://github.com/hnihTyoB/MiniAppZalo)

📘 Facebook tác giả:  
👉 [https://facebook.com/thinhnguyen.dev](https://facebook.com/thinhnguyen.dev)

---

## 🔧 Tính năng chính

- Đăng ký, đăng nhập người dùng (xác thực bằng JWT)
- Quản lý tài khoản cá nhân và phương tiện
- Tìm kiếm, xem thông tin chi nhánh và dịch vụ
- Đặt lịch hẹn sửa chữa (chọn xe – chi nhánh – dịch vụ – thời gian – ghi chú)
- Xem lịch sử hẹn và hủy lịch khi cần
- Mô phỏng thông báo từ garage qua Zalo OA

---

## 🛠️ Công nghệ sử dụng

### Frontend – Zalo Mini App (ZMP)
- React + TypeScript
- Tailwind CSS
- ZMP UI + Lucide React
- React Router DOM

### Backend – REST API
- Node.js + Express.js
- MySQL (qua `mysql2`)
- JSON Web Token (JWT), Bcrypt, Dotenv, Cors

---

## ⚙️ Development Guide

### Sử dụng Zalo Mini App CLI

1. [Cài Node.js](https://nodejs.org/en/download)
2. [Cài Zalo Mini App CLI](https://mini.zalo.me/docs/dev-tools/cli/intro/)
3. Cài đặt các thư viện phụ thuộc:

   ```bash
   npm install
4. Khởi động server:

   ```bash
   zmp start
5. Mở trình duyệt tại:

   ```bash
   http://localhost:3000

---

## 🚀 Triển khai

1. Tạo Mini App ID trên Zalo Developer Console  
   (Xem hướng dẫn: [Coffee Shop Tutorial](https://mini.zalo.me/tutorial/coffee-shop/step-1/))

2. Deploy bằng một trong hai cách:

### 🔸 Dùng Zalo Mini App Extension:
- Mở tab **Deploy**
- Đăng nhập
- Nhấn **Deploy**

### 🔸 Dùng CLI:

   ```bash
   zmp login
   zmp deploy
   ```
---

## 📚 Tài liệu & Cộng đồng

- [Zalo Mini App Developer Site](https://mini.zalo.me/)
- [ZMP SDK API Docs](https://mini.zalo.me/documents/api/)
- [ZMP UI (ZaUI) Docs](https://mini.zalo.me/documents/zaui/)
- [Dev Tools & CLI Docs](https://mini.zalo.me/docs/dev-tools/)
- [Template Mini Apps](https://mini.zalo.me/zaui-templates)
- [Cộng đồng hỗ trợ](https://mini.zalo.me/community)

---

> 🧠 Đây là tài liệu README chính thức của đồ án. Nếu bạn thấy dự án hữu ích, đừng quên ⭐️ repo để ủng hộ!

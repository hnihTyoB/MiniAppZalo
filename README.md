# 🚗 G2 Schedule a Car Repair – Zalo Mini App

**G2 Schedule a Car Repair** là một ứng dụng đặt lịch sửa chữa ô tô được xây dựng trên nền tảng **Zalo Mini App**. Ứng dụng giúp khách hàng dễ dàng tìm kiếm dịch vụ, đặt lịch sửa xe và nhận thông báo trực tiếp từ garage thông qua Zalo OA.

> ✅ Đây là sản phẩm đồ án học phần, bao gồm cả **frontend Mini App** và **backend API**.

## 📺 Demo

🎥 Xem video giới thiệu và demo sử dụng Mini App tại:  
[![Xem video demo trên YouTube](https://img.youtube.com/vi/wFBR3SgraXY/0.jpg)](https://youtu.be/wFBR3SgraXY)

📘 Facebook:  
👉 [https://facebook.com/thinhnguyen.dev](https://www.facebook.com/nguyen.chi.thinh.74213)

---

## 👥 Người đóng góp

- 👨‍💻 [@hnihTyoB](https://github.com/hnihTyoB) – Frontend, UI/UX, tích hợp Mini App Zalo  
- 🧠 [@HaiTrieu186](https://github.com/HaiTrieu186) – Backend API, MySQL, xử lý xác thực  

---

## 🔧 Tính năng chính

### Khách hàng:
- Quản lý tài khoản, phương tiện cá nhân.
- Xem danh sách dịch vụ, chi nhánh và chi tiết.
- Đặt lịch hẹn dịch vụ, Xem lịch sử đặt lịch.
- Nhận thông báo, chat qua Zalo OA.
### Quản lý chi nhánh:
- Xem tổng quan hoạt động.
- Quản lý nhân viên.
- Quản lý và duyệt lịch hẹn.
- Cấu hình thông tin chi nhánh.
### Phân quyền người dùng:
- Customer.
- Branch Manager.

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

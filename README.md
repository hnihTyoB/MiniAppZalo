# ĐỒ ÁN: G2 Schedule a Car Repair – Zalo Mini App (2024–2025)

G2 Schedule a Car Repair là một ứng dụng đặt lịch sửa chữa ô tô phát triển dưới dạng Zalo Mini App. Ứng dụng cung cấp trải nghiệm đặt lịch nhanh gọn cho khách hàng và công cụ quản lý cho nhân viên/chi nhánh, bao gồm cả frontend Mini App và backend REST API.

---

## Demo
Video giới thiệu và demo sử dụng Mini App:  
[![Xem video demo trên YouTube](https://img.youtube.com/vi/oYO3Z7oaFR0/0.jpg)](https://youtu.be/oYO3Z7oaFR0?si=1mclkfvUetOcawQl)

---

## Tóm tắt nội dung
Dự án nhằm xây dựng hệ thống đặt lịch sửa chữa ô tô, tập trung vào:

- Trải nghiệm người dùng (UI/UX) trên Zalo Mini App: tìm dịch vụ, chọn chi nhánh, đặt lịch.
- Hệ thống quản lý chi nhánh: quản lý nhân sự, xem/duyệt lịch hẹn, báo cáo cơ bản.
- Hệ thống phân quyền: khách hàng (Customer) và quản lý chi nhánh (Branch Manager).
- Tích hợp thông báo và chat qua Zalo Official Account (OA).

---

## Người thực hiện
- Loại dự án: Đồ án học phần (frontend + backend)  
- Thành viên:
  - Nguyễn Chí Thịnh — [hnihTyoB](https://github.com/hnihTyoB) — Frontend, UI/UX, tích hợp Mini App Zalo  
  - Hải Triều — [HaiTrieu186](https://github.com/HaiTrieu186) — Backend API, MySQL, xác thực

---

## Các thành phần chính
- Danh mục dịch vụ: danh sách dịch vụ sửa chữa, mô tả, giá tham khảo.  
- Quản lý phương tiện: khách hàng quản lý thông tin xe (biển số, loại xe).  
- Đặt lịch: chọn dịch vụ, chi nhánh, khung giờ — tạo/huỷ/tra cứu lịch hẹn.  
- Quản lý chi nhánh: duyệt/chỉnh sửa lịch, quản lý nhân viên, xem lịch theo ngày.  
- Xác thực & bảo mật: đăng nhập/đăng ký, JWT cho API, bcrypt cho hash mật khẩu.  
- Thông báo & chat: tích hợp gửi thông báo và tương tác qua Zalo OA.

---

## Kỹ thuật & ý tưởng triển khai
- Kiến trúc tách biệt: Frontend (Zalo Mini App) giao tiếp với Backend qua REST API.  
- Phân quyền rõ ràng: middleware xác thực xử lý JWT cho các endpoint bảo mật.  
- Truy vấn & lưu trữ: MySQL cho dữ liệu người dùng, xe, lịch hẹn.  
- UX hướng di động: giao diện tối ưu cho trải nghiệm trên Zalo/thiết bị di động.  
- Mở rộng: backend được thiết kế để dễ bổ sung tính năng (ví dụ: thanh toán, lịch làm việc nhân viên).

---

## Công nghệ sử dụng
- Frontend – Zalo Mini App (ZMP)
  - React + TypeScript
  - Tailwind CSS
  - ZMP UI (ZaUI) + Lucide React
  - React Router DOM
- Backend – REST API
  - Node.js + Express.js
  - MySQL (mysql2)
  - JSON Web Token (JWT)
  - bcrypt (hash mật khẩu)
  - dotenv, cors

---

## Hướng dẫn cài đặt & chạy

1. Chuẩn bị môi trường
   - Cài Node.js (phiên bản LTS được khuyến nghị): https://nodejs.org/
   - Cài Zalo Mini App CLI (nếu làm việc với frontend): https://mini.zalo.me/docs/dev-tools/cli/intro/

2. Thiết lập repository (mỗi phần frontend/backend nằm ở folder tương ứng)
   - Sao chép repository:
     ```bash
     git clone https://github.com/hnihTyoB/MiniAppZalo.git
     cd MiniAppZalo
     ```
   - Ví dụ: vào thư mục frontend hoặc backend để cài đặt

3. Cài đặt phụ thuộc
   - Frontend:
     ```bash
     cd frontend
     npm install
     ```
   - Backend:
     ```bash
     cd backend
     npm install
     ```

4. Cấu hình biến môi trường
   - Tạo file `.env` trong thư mục backend với các biến tối thiểu:
     ```
     PORT=3001
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=<db_user>
     DB_PASSWORD=<db_password>
     DB_NAME=<db_name>
     JWT_SECRET=<your_jwt_secret>
     ```
   - Nếu sử dụng các dịch vụ Zalo (OA, webhook), bổ sung credential tương ứng theo file cấu hình.

5. Thiết lập cơ sở dữ liệu
   - Tạo database MySQL và chạy migration / script khởi tạo (nếu có).
   - Ví dụ (nếu dự án cung cấp script SQL):
     ```bash
     mysql -u root -p < db/init.sql
     ```

6. Chạy ứng dụng trong môi trường phát triển
   - Backend:
     ```bash
     cd backend
     npm run dev     # hoặc npm start
     ```
   - Frontend (Zalo Mini App):
     ```bash
     cd frontend
     npm run dev     # hoặc zmp start nếu sử dụng ZMP CLI
     zmp start
     ```
   - Truy cập frontend tại:
     ```
     http://localhost:3000
     ```

LƯU Ý: Hướng dẫn trên là ví dụ tổng quát. Kiểm tra README riêng trong từng thư mục (frontend/backend) để biết lệnh và cấu hình chi tiết.

---

## Triển khai
1. Tạo Mini App ID trên Zalo Developer Console (tham khảo tutorial chính thức).  
   - Hướng dẫn: [Coffee Shop Tutorial](https://mini.zalo.me/tutorial/coffee-shop/step-1/)

2. Hai cách triển khai frontend:
   - Dùng Zalo Mini App Extension (Deploy từ giao diện web Zalo Developer).
   - Dùng CLI:
     ```bash
     zmp login
     zmp deploy
     ```

3. Triển khai backend:
   - Deploy lên server/VM hoặc dịch vụ PaaS (Heroku, Render, Vercel — nếu hỗ trợ Node.js backend), thiết lập biến môi trường và kết nối MySQL.

---

## Tài liệu tham khảo
- [Zalo Mini App Developer Site](https://mini.zalo.me/)  
- [ZMP SDK API Docs](https://mini.zalo.me/documents/api/)  
- [ZaUI (ZMP UI) Docs](https://mini.zalo.me/documents/zaui/)  
- [Node.js](https://nodejs.org/)  
- [MySQL](https://www.mysql.com/)  

---

Nếu bạn thấy dự án hữu ích, vui lòng đánh dấu ⭐️ repository để ủng hộ.

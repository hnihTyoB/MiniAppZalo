// src/api/auth.ts

// Định nghĩa kiểu User (có thể import từ AuthContext nếu đã định nghĩa ở đó)
interface User {
  id: string;
  name: string;
  phone: string; // <<< Đổi thành phone là chính
  email?: string; // Email có thể tùy chọn
  role: "admin" | "customer" | "branch_manager"; // <<< Thêm role branch_manager
  branchId?: string; // <<< Thêm branchId cho Branch Manager
}

// Định nghĩa kiểu dữ liệu đầu vào cho hàm loginApi
interface LoginCredentials {
  phone: string;
  password?: string; // Mật khẩu có thể không bắt buộc nếu dùng đăng nhập khác
}

// --- TÀI KHOẢN MẪU ---
const mockAdminUser: User = {
  id: "admin001",
  name: "Admin Quản Trị",
  phone: "0900000001", // <<< Dùng phone làm định danh chính
  role: "admin",
  branchId: "", // <<< Gán chuỗi rỗng cho admin
};

const mockCustomerUser: User = {
  id: "customer123",
  name: "Khách Hàng A",
  phone: "0900000003", // <<< Dùng phone làm định danh chính
  branchId: "", // <<< Gán chuỗi rỗng cho customer
  role: "customer",
};

// <<< Thêm tài khoản mẫu cho Branch Manager >>>
const mockBranchManagerUser: User = {
  id: "bm001", // ID này nên khớp với ID trong UserManagement.tsx
  name: "Quản lý Chi Nhánh 1",
  phone: "0900000002", // <<< Số điện thoại để đăng nhập
  role: "branch_manager",
  branchId: "b001", // <<< ID chi nhánh quản lý
};

// --- HÀM LOGIN GIẢ LẬP ---
export const loginApi = (
  credentials: LoginCredentials
): Promise<{ user: User; token?: string }> => {
  console.log("Mock login attempt with:", credentials);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập độ trễ mạng
      // --- Logic kiểm tra tài khoản mẫu ---
      // Lưu ý: Trong thực tế, không nên dùng username/password cố định như "admin"/"admin"

      if (
        credentials.phone === mockCustomerUser.phone &&
        credentials.password === "customer" // <<< Giữ pass đơn giản cho demo
      ) {
        console.log("Mock login successful as CUSTOMER");
        resolve({
          user: {
            ...mockCustomerUser,
            branchId: mockCustomerUser.branchId || "",
          },
          token: "mockCustomerToken456",
        }); // Đảm bảo branchId là string
      } else if (
        // <<< Thêm kiểm tra cho Branch Manager >>>
        credentials.phone === mockBranchManagerUser.phone && // <<< Dùng SĐT của Branch Manager cũ
        credentials.password === "manager" // <<< Đặt mật khẩu demo cho manager
      ) {
        console.log(
          "Mock login successful as BRANCH MANAGER" // <<< Log đúng vai trò
        );
        resolve({
          user: {
            ...mockBranchManagerUser,
            branchId: mockBranchManagerUser.branchId || "",
          }, // Đảm bảo branchId là string
          token: "mockManagerToken789", // <<< Có thể dùng token riêng cho manager
        });
      } else {
        console.log("Mock login failed: Invalid credentials");
        reject(new Error("Số điện thoại hoặc mật khẩu không đúng."));
      }
    }, 500); // Giả lập 0.5 giây chờ
  });
};

// Có thể thêm các hàm API giả lập khác ở đây (register, forgotPassword,...)

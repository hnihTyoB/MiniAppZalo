// src/components/admin/UserManagement.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "zmp-ui"; // <<< Bỏ useNavigate từ zmp-ui
import { useNavigate } from "react-router-dom"; // <<< THÊM useNavigate từ react-router-dom
import { Search, Plus, Edit, Trash2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Interface mẫu cho User
export interface UserData {
  // <<< THÊM export >>>
  id: string;
  name: string;
  phone: string; // <<< Đổi phone thành bắt buộc, bỏ email
  role: "admin" | "branch_manager" | "customer" | "technician" | "receptionist"; // <<< Thêm các vai trò nhân viên
  branchId?: string; // <<< Thêm ID chi nhánh nhân viên thuộc về (có thể null/undefined cho admin)
  createdAt: string; // Ngày tạo (ví dụ)
}

// Dữ liệu mẫu
export const mockUsers: UserData[] = [
  // <<< THÊM export >>>
  {
    id: "admin01",
    name: "Quản lý Chi Nhánh 1", // <<< Đổi tên cho phù hợp vai trò
    phone: "090555666",
    branchId: "b001", // <<< Quản lý của chi nhánh b001
    role: "branch_manager",
    createdAt: "2024-07-19",
  },
  // <<< Thêm nhân viên mẫu >>>
  {
    id: "tech001",
    name: "Lý Văn Kỹ Thuật",
    phone: "090777888",
    branchId: "b001", // Thuộc chi nhánh b001
    role: "technician",
    createdAt: "2024-07-22",
  },
  {
    id: "recep001",
    name: "Hồ Thị Lễ Tân",
    phone: "090666777",
    branchId: "b001", // Thuộc chi nhánh b001
    role: "receptionist", // Added missing role
    createdAt: "2024-07-19",
  },
  // <<< Thêm nhân viên và quản lý khác >>>
  {
    id: "tech002",
    name: "Võ Thị Sửa Chữa",
    phone: "090222333",
    branchId: "b001", // Thuộc chi nhánh b002
    role: "technician",
    createdAt: "2024-07-23",
  },
  {
    id: "recep002",
    name: "Đặng Văn Tiếp Đón",
    phone: "090444555",
    branchId: "b001", // Thuộc chi nhánh b002
    role: "receptionist",
    createdAt: "2024-07-20",
  },
  // Thêm user khác...
];

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]); // <<< Khởi tạo rỗng, fetch từ API
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const navigate = useNavigate(); // <<< THÊM hook navigate

  // Lọc nhân viên
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || // <<< Bỏ tìm theo email
      user.phone.includes(searchTerm)
  );

  useEffect(() => {
    const fetchUsers = async () => {
      // TODO: Gọi API để lấy danh sách nhân viên
      // Backend sẽ tự động lọc dựa trên role và branchId của user đang đăng nhập
      // Ví dụ: const fetchedUsers = await api.getUsers();
      // setUsers(fetchedUsers);

      // --- Giả lập fetch và lọc phía client (KHÔNG KHUYẾN KHÍCH cho production) ---
      let filteredMockUsers = mockUsers;
      // <<< DANH SÁCH CÁC VAI TRÒ ĐƯỢC COI LÀ NHÂN VIÊN (BỎ ĐI VÌ YÊU CẦU HIỂN THỊ HẾT) >>>
      // const employeeRoles: UserData["role"][] = ["technician", "receptionist"];

      if (user?.role === "branch_manager" && user.branchId) {
        filteredMockUsers = mockUsers.filter(
          (u) => u.branchId === user.branchId // <<< CHỈ LỌC THEO CHI NHÁNH (HIỂN THỊ HẾT) >>>
        );
      } else if (user?.role !== "admin") {
        filteredMockUsers = []; // Không phải admin/BM thì không thấy ai
      }
      setUsers(filteredMockUsers);
      // --- Hết phần giả lập ---
    };

    if (user) {
      // Chỉ fetch khi có thông tin user
      fetchUsers();
    }
  }, [user]); // Fetch lại khi user thay đổi

  // Lọc client-side dựa trên searchTerm
  const displayedUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm)
  );

  const handleAddUser = () => {
    // Nếu user.role === 'branch_manager', form cần tự điền branchId
    console.log(
      "Thêm nhân viên mới" +
        (user?.role === "branch_manager"
          ? ` vào chi nhánh ${user.branchId}`
          : "")
    ); // <<< SỬA: Điều hướng đến trang thêm mới >>>
    navigate("/admin/users/add");
  };

  const handleEditUser = (id: string) => {
    const userToEdit = users.find((u) => u.id === id);
    // Kiểm tra quyền trước khi cho sửa (ví dụ: BM chỉ sửa user cùng branchId)
    if (
      user?.role === "branch_manager" &&
      userToEdit?.branchId !== user.branchId
    ) {
      console.error("Không có quyền sửa nhân viên này.");
      alert("Bạn không có quyền sửa nhân viên này.");
      return;
    }
    console.log("Sửa nhân viên:", id);
    navigate(`/admin/users/edit/${id}`); // <<< SỬA: Điều hướng đến trang sửa với ID >>>
  };

  const requestDeleteUser = (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    // Kiểm tra quyền trước khi cho xóa
    if (
      user?.role === "branch_manager" &&
      userToDelete?.branchId !== user.branchId
    ) {
      console.error("Không có quyền xóa nhân viên này.");
      alert("Bạn không có quyền xóa nhân viên này.");
      return;
    }
    // Không cho xóa chính mình
    if (user?.id === id) {
      alert("Bạn không thể xóa chính mình.");
      return;
    }
    // Có thể thêm các luật khác (vd: không cho BM xóa BM khác...)
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      console.log("Xóa nhân viên:", userToDelete);
    }
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  return (
    <div>
      {/* Thanh công cụ: Tìm kiếm và Thêm mới */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* <<< THAY THẾ Input bằng input >>> */}
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..." // <<< Bỏ email khỏi placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        {/* <<< THAY THẾ Button bằng button >>> */}
        <button
          onClick={handleAddUser}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap"
        >
          <Plus size={16} />
          Thêm mới
        </button>
      </div>

      {/* Bảng hiển thị nhân viên */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col" // <<< THÊM CỘT ID >>>
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20" // Giới hạn chiều rộng
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Họ & Tên
              </th>
              <th // <<< Đổi tên cột Email / SĐT thành SĐT >>>
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                SĐT
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vai trò
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ngày tạo
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedUsers.map(
              (
                u // <<< SỬA: Dùng displayedUsers
              ) => (
                <tr key={u.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                    {u.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {u.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {" "}
                    {/* <<< Chỉ hiển thị SĐT >>> */}
                    <div className="text-sm text-gray-500">{u.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === "admin" || u.role === "branch_manager" // <<< Style cho admin và BM
                          ? "bg-red-100 text-red-800"
                          : u.role === "customer" // <<< Style cho customer
                          ? "bg-green-100 text-green-800" // <<< Sửa: Thêm ?
                          : "bg-blue-100 text-blue-800" // <<< Style mặc định cho nhân viên (technician, receptionist,...)
                      }`}
                    >
                      {/* <<< Hiển thị tên vai trò phù hợp >>> */}
                      {u.role === "admin"
                        ? "Quản trị viên"
                        : u.role === "branch_manager"
                        ? "Quản lý chi nhánh"
                        : u.role === "customer"
                        ? "Khách hàng"
                        : u.role === "technician"
                        ? "Kỹ thuật viên"
                        : u.role === "receptionist"
                        ? "Lễ tân"
                        : u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(u.id)}
                      // Disable nút sửa nếu không có quyền
                      disabled={
                        user?.role === "branch_manager" &&
                        u.branchId !== user.branchId
                      }
                      className="text-indigo-600 hover:text-indigo-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    {(user?.role === "admin" ||
                      (user?.role === "branch_manager" &&
                        u.branchId === user.branchId)) &&
                      u.id !== user?.id && (
                        <button
                          onClick={() => requestDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                  </td>
                </tr>
              )
            )}
            {displayedUsers.length === 0 && ( // <<< SỬA: Dùng displayedUsers
              <tr>
                <td
                  colSpan={5} // <<< CẬP NHẬT COLSPAN >>>
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        visible={showDeleteConfirm}
        title="Xác nhận xóa nhân viên"
        onClose={() => setShowDeleteConfirm(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowDeleteConfirm(false) },
          { text: "Xóa", onClick: confirmDeleteUser, danger: true },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn xóa nhân viên này không?
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;

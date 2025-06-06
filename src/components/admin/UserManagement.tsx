// src/components/admin/UserManagement.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config/api";

export interface UserData {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "branch_manager" | "customer" | "technician" | "receptionist";
  branchId?: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token.");
        }

        const response = await fetch(`${API_BASE_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách người dùng.");
        const data = await response.json();
        let filteredUsers = data;

        if (user?.role === "branch_manager" && user.branchId) {
          filteredUsers = data.filter((u: UserData) => u.branchId === user.branchId);
        } else if (user?.role !== "admin") {
          filteredUsers = [];
        }

        setUsers(filteredUsers.map((u: any) => ({
          ...u,
          id: u.id.toString(),
          createdAt: u.createdAt || new Date().toISOString().split('T')[0],
        })));
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Không thể tải danh sách nhân viên.");
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm)
  );

  const handleAddUser = () => {
    navigate("/admin/users/add");
  };

  const handleEditUser = (id: string) => {
    const userToEdit = users.find((u) => u.id === id);
    if (
      user?.role === "branch_manager" &&
      userToEdit?.branchId !== user.branchId
    ) {
      alert("Bạn không có quyền sửa nhân viên này.");
      return;
    }
    navigate(`/admin/users/edit/${id}`);
  };

  const requestDeleteUser = (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    if (
      user?.role === "branch_manager" &&
      userToDelete?.branchId !== user.branchId
    ) {
      alert("Bạn không có quyền xóa nhân viên này.");
      return;
    }
    if (user?.id === id) {
      alert("Bạn không thể xóa chính mình.");
      return;
    }
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token.");

        await fetch(`${API_BASE_URL}/api/employees/${userToDelete}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
        alert("Xóa nhân viên thành công!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Không thể xóa nhân viên.");
      }
    }
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap"
        >
          <Plus size={16} />
          Thêm mới
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Họ & Tên
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SĐT
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => (
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
                  <div className="text-sm text-gray-500">{u.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.role === "admin" || u.role === "branch_manager"
                        ? "bg-red-100 text-red-800"
                        : u.role === "customer"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
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
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
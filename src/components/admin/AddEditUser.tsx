// src/components/admin/AddEditUser.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Select } from "zmp-ui"; // Giả sử dùng Select từ zmp-ui
import { ChevronLeft, Save } from "lucide-react";
import { UserData, mockUsers } from "./UserManagement"; // Import interface và mock data (tạm thời)

// Định nghĩa các vai trò có thể thêm/sửa
const editableRoles: UserData["role"][] = ["technician", "receptionist"];

const AddEditUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Lấy thông tin người dùng hiện tại
  const { userId } = useParams<{ userId?: string }>(); // Lấy userId từ URL nếu là edit
  const isEditing = !!userId;

  // State cho form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserData["role"] | "">(""); // Khởi tạo rỗng
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dữ liệu nếu là edit (tạm thời dùng mock data)
  useEffect(() => {
    if (isEditing && userId) {
      // TODO: Fetch user data by userId from API in real app
      const userToEdit = mockUsers.find((u) => u.id === userId);
      if (userToEdit) {
        // Kiểm tra quyền sửa
        if (
          currentUser?.role === "branch_manager" &&
          userToEdit.branchId !== currentUser.branchId
        ) {
          alert("Bạn không có quyền sửa nhân viên này.");
          navigate("/admin/users");
          return;
        }
        setName(userToEdit.name);
        setPhone(userToEdit.phone);
        setRole(userToEdit.role);
        setBranchId(userToEdit.branchId);
      } else {
        alert("Không tìm thấy nhân viên.");
        navigate("/admin/users");
      }
    } else if (currentUser?.role === "branch_manager") {
      // Nếu là thêm mới và người dùng là BM, tự điền branchId
      setBranchId(currentUser.branchId);
    }
  }, [isEditing, userId, currentUser, navigate]);

  const handleRoleChange = (value: string | number) => {
    // Đảm bảo giá trị là một trong các role hợp lệ
    const selectedRole = String(value) as UserData["role"];
    if (editableRoles.includes(selectedRole)) {
      setRole(selectedRole);
    } else {
      setRole(""); // Reset nếu không hợp lệ
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation cơ bản
    if (!name || !phone || !role) {
      setError("Vui lòng điền đầy đủ tên, SĐT và vai trò.");
      return;
    }
    if (currentUser?.role === "branch_manager" && !branchId) {
      setError("Lỗi: Không xác định được chi nhánh.");
      return;
    }
    // TODO: Thêm validation SĐT nếu cần

    setIsLoading(true);

    const userData: Partial<UserData> = {
      name: name.trim(),
      phone: phone.trim(),
      role: role,
      branchId: branchId, // Sẽ là undefined nếu admin thêm và chưa chọn chi nhánh (cần thêm input chọn chi nhánh cho admin)
    };

    console.log(
      isEditing ? "Cập nhật nhân viên:" : "Thêm nhân viên:",
      userData
    );

    // --- TODO: Gọi API để thêm/sửa nhân viên ---
    // try {
    //   if (isEditing && userId) {
    //     await api.updateUser(userId, userData);
    //     alert("Cập nhật nhân viên thành công!");
    //   } else {
    //     await api.addUser(userData);
    //     alert("Thêm nhân viên thành công!");
    //   }
    //   navigate("/admin/users"); // Quay lại danh sách
    // } catch (apiError: any) {
    //   setError(apiError.message || "Đã xảy ra lỗi khi lưu.");
    // } finally {
    //   setIsLoading(false);
    // }
    // --- Giả lập thành công ---
    setTimeout(() => {
      setIsLoading(false);
      alert(isEditing ? "Đã cập nhật (giả lập)" : "Đã thêm mới (giả lập)");
      navigate("/admin/users");
    }, 1000);
  };

  const goBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header đơn giản */}
      <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10 mb-6">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1 text-gray-800">
          {isEditing ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        </h2>
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        {/* Tên nhân viên */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>

        {/* Vai trò */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vai trò <span className="text-red-500">*</span>
          </label>
          <Select
            id="role"
            placeholder="Chọn vai trò..."
            value={role}
            onChange={handleRoleChange}
            status={!role && error ? "error" : "default"} // Hiển thị lỗi nếu chưa chọn
          >
            <Select.Option value="" title="-- Chọn vai trò --" disabled>
              -- Chọn vai trò --
            </Select.Option>
            {editableRoles.map((r) => (
              <Select.Option
                key={r}
                value={r}
                title={
                  r === "technician"
                    ? "Kỹ thuật viên"
                    : r === "receptionist"
                    ? "Lễ tân"
                    : r
                }
              />
            ))}
          </Select>
        </div>

        {/* Chi nhánh (Hiển thị nếu là BM và không cho sửa) */}
        {currentUser?.role === "branch_manager" && branchId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chi nhánh
            </label>
            <input
              type="text"
              value={`Chi nhánh ${branchId}`} // Hiển thị tên hoặc ID
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm"
            />
          </div>
        )}
        {/* TODO: Nếu là Admin, cần thêm Select để chọn chi nhánh */}

        {/* Hiển thị lỗi */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Nút Lưu */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save size={16} />
                {isEditing ? "Lưu thay đổi" : "Thêm nhân viên"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditUser;

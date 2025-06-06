import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Select, Modal } from "zmp-ui";
import { ChevronLeft, Save } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

interface UserData {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "branch_manager" | "customer" | "technician" | "receptionist";
  branchId?: string;
}

const AddEditUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const isEditing = !!userId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserData["role"] | "">("");
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (isEditing && userId) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
            setShowErrorModal(true);
            return;
          }

          const response = await axios.get(`${API_BASE_URL}/api/employees/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
         });

          const userToEdit: UserData = response.data;
          if (
            currentUser?.role === "branch_manager" &&
            userToEdit.branchId !== currentUser.branchId
          ) {
            setError("Bạn không có quyền sửa nhân viên này.");
            setShowErrorModal(true);
            return;
          }
          setName(userToEdit.name);
          setPhone(userToEdit.phone);
          setRole(userToEdit.role);
          setBranchId(userToEdit.branchId);
        } catch (err: any) {
          setError(err.response?.data?.message || "Không tìm thấy nhân viên.");
          setShowErrorModal(true);
        }
      };
      fetchUser();
    } else if (currentUser?.role === "branch_manager") {
      setBranchId(currentUser.branchId);
    }
  }, [isEditing, userId, currentUser, navigate]);

  const handleRoleChange = (value: string | number) => {
    setRole(String(value) as UserData["role"]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !phone || !role) {
      setError("Vui lòng điền đầy đủ tên, SĐT và vai trò.");
      setShowErrorModal(true);
      return;
    }
    if (currentUser?.role === "branch_manager" && !branchId) {
      setError("Lỗi: Không xác định được chi nhánh.");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    const userData: Partial<UserData> = {
      name: name.trim(),
      phone: phone.trim(),
      role: role,
      branchId: branchId,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setShowErrorModal(true);
        navigate("/login");
        return;
      }

      if (isEditing && userId) {
        await axios.put(`${API_BASE_URL}/api/employees/${userId}`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật nhân viên thành công!");
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/employees`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm nhân viên thành công!");
      }
      navigate("/admin/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10 mb-6">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1 text-gray-800">
          {isEditing ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        </h2>
        <div className="w-8"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <Select
            id="role"
            placeholder="Chọn vai trò..."
            value={role}
            onChange={handleRoleChange}
            className="w-full"
          >
            <Select.Option value="" title="-- Chọn vai trò --" disabled>
              -- Chọn vai trò --
            </Select.Option>
            {["admin", "branch_manager", "customer", "technician", "receptionist"].map((r) => (
              <Select.Option
                key={r}
                value={r}
                title={r === "technician" ? "Kỹ thuật viên" : r === "receptionist" ? "Lễ tân" : r === "branch_manager" ? "Quản lý chi nhánh" : r === "customer" ? "Khách hàng" : r}
              />
            ))}
          </Select>
        </div>

        {currentUser?.role === "branch_manager" && branchId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chi nhánh
            </label>
            <input
              type="text"
              value={`Chi nhánh ${branchId}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm"
            />
          </div>
        )}

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

      <Modal
        visible={showErrorModal}
        title="Lỗi"
        onClose={() => setShowErrorModal(false)}
        zIndex={1200}
        actions={[
          { text: "Đóng", onClick: () => setShowErrorModal(false), highLight: true },
        ]}
        className="rounded-lg"
      >
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <p className="text-red-600 text-lg mb-4">{error}</p>
        </div>
      </Modal>
    </div>
  );
};

export default AddEditUser;
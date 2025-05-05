// src/components/admin/BranchConfiguration.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // <<< THÊM: Import useAuth
import { Modal } from "zmp-ui"; // <<< THÊM: Import Modal

// <<< THAY ĐỔI: Interface cho cấu hình chi nhánh >>>
interface BranchConfigData {
  id: string; // ID của chi nhánh
  name: string;
  address: string;
  description: string;
  hotline: string;
}

const BranchConfiguration: React.FC = () => {
  const { user } = useAuth(); // <<< THÊM: Lấy thông tin user
  // <<< THAY ĐỔI: State cho cấu hình chi nhánh, khởi tạo là null >>>
  const [branchConfig, setBranchConfig] = useState<BranchConfigData | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <<< THÊM: State loading
  const [showSaveConfirm, setShowSaveConfirm] = useState(false); // <<< THÊM: State cho modal xác nhận lưu

  // <<< THÊM: useEffect để fetch dữ liệu chi nhánh >>>
  useEffect(() => {
    const fetchBranchData = async () => {
      if (user?.role === "branch_manager" && user.branchId) {
        setIsLoading(true);
        console.log("Fetching data for branch:", user.branchId);
        // --- TODO: Gọi API lấy thông tin chi nhánh bằng user.branchId ---
        // const data = await api.getBranchDetails(user.branchId);
        // setBranchConfig(data);

        // --- Giả lập fetch ---
        await new Promise((resolve) => setTimeout(resolve, 500));
        setBranchConfig({
          id: user.branchId,
          name: `Chi nhánh ${user.branchId}`, // Tên mẫu
          address: `Địa chỉ mẫu cho chi nhánh ${user.branchId}`,
          description: `Mô tả mẫu cho chi nhánh ${user.branchId}.`,
          hotline: `090888999`, // Hotline mẫu
        });
        // --- Hết giả lập ---
        setIsLoading(false);
      }
    };
    fetchBranchData();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBranchConfig((prev) => (prev ? { ...prev, [name]: value } : null));
  };
  // <<< THAY ĐỔI: Hàm cập nhật state branchConfig >>>
  const handleBranchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBranchConfig((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // <<< THÊM: Hàm mở modal xác nhận lưu >>>
  const requestSave = () => {
    setShowSaveConfirm(true);
  };

  // <<< THAY ĐỔI: Hàm này sẽ được gọi từ modal >>>
  const confirmSave = () => {
    if (!branchConfig) return;
    setIsSaving(true);
    console.log("Lưu cấu hình chi nhánh:", branchConfig);
    // --- TODO: Gọi API để lưu cấu hình chi nhánh với branchConfig.id ---
    // await api.updateBranchDetails(branchConfig.id, branchConfig);
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu thông tin chi nhánh!");
      setShowSaveConfirm(false); // <<< Đóng modal sau khi lưu
    }, 1000); // Giả lập lưu
  };

  // <<< THÊM: Hiển thị loading nếu đang fetch dữ liệu >>>
  if (isLoading) {
    return <div className="text-center p-10">Đang tải cấu hình...</div>;
  }

  // <<< THÊM: Hiển thị thông báo nếu không có dữ liệu (ví dụ user không phải BM) >>>
  if (!branchConfig) {
    return (
      <div className="text-center p-10 text-red-500">
        Không thể tải cấu hình chi nhánh hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        {/* <<< THAY ĐỔI: Các trường input cho thông tin chi nhánh >>> */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tên chi nhánh
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={branchConfig.name}
            onChange={handleBranchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hotline hỗ trợ
          </label>
          <input
            type="tel" // <<< Đổi type thành tel
            id="hotline"
            name="address"
            value={branchConfig.address}
            onChange={handleBranchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Thông tin
          </label>
          {/* <<< THAY ĐỔI: Dùng textarea cho mô tả >>> */}
          <textarea
            id="description"
            name="description"
            rows={4}
            value={branchConfig.description}
            onChange={handleBranchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="hotline"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hotline chi nhánh
          </label>
          <input
            type="tel"
            id="hotline"
            name="hotline"
            value={branchConfig.hotline}
            onChange={handleBranchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>

        <div className="pt-4">
          {/* <<< THAY THẾ Button bằng button >>> */}
          <button
            onClick={requestSave} // <<< THAY ĐỔI: Gọi hàm mở modal >>>
            disabled={isSaving} // <<< Dùng disabled thay cho loading
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* <<< THÊM: Modal xác nhận lưu >>> */}
      <Modal
        visible={showSaveConfirm}
        title="Xác nhận lưu thay đổi"
        onClose={() => setShowSaveConfirm(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowSaveConfirm(false) },
          {
            text: "Lưu",
            onClick: confirmSave,
            highLight: true,
            // loading: isSaving, // Removed as it is not supported
          }, // <<< Thêm loading vào nút Lưu >>>
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn lưu các thay đổi này không?
        </div>
      </Modal>
    </div>
  );
};

// <<< THAY ĐỔI: Export tên component mới >>>
export default BranchConfiguration;

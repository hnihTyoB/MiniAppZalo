import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Modal, Select } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../config/api";

interface BranchConfigData {
  id: number;
  name: string;
  address: string;
  description: string;
  phone_number: string;
}

interface Branch {
  id: string;
  name: string;
}

const BranchConfiguration: React.FC = () => {
  const { user } = useAuth();
  const [branchConfig, setBranchConfig] = useState<BranchConfigData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formattedBranches = response.data.map((branch: any) => ({
          id: branch.id.toString(),
          name: branch.name,
        }));
        setBranches(formattedBranches);
      } catch (err: any) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Không thể tải danh sách chi nhánh.");
      }
    };

    const fetchBranchData = async (branchId: string) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/branches/${branchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranchConfig(response.data);
      } catch (err: any) {
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data.message || "Không thể tải thông tin chi nhánh.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchBranches();
      if (selectedBranchId) {
        fetchBranchData(selectedBranchId);
      } else {
        setIsLoading(false);
      }
    } else if (user?.role === "branch_manager" && user.branchId) {
      setSelectedBranchId(user.branchId);
      fetchBranchData(user.branchId);
    } else {
      setIsLoading(false);
      setError("Bạn không có quyền truy cập hoặc chi nhánh chưa được gán.");
    }
  }, [user, selectedBranchId]);

  const handleBranchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBranchConfig((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const requestSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!branchConfig) return;
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setIsSaving(false);
        setShowSaveConfirm(false);
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/branches/${branchConfig.id}`,
        {
          name: branchConfig.name,
          address: branchConfig.address,
          phone_number: branchConfig.phone_number,
          description: branchConfig.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Đã lưu thông tin chi nhánh!");
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(error.response.data.message || "Lưu thông tin chi nhánh thất bại.");
        }
      } else {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
      }
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Đang tải cấu hình...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {user?.role === "admin" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn chi nhánh
          </label>
          <Select
            placeholder="Chọn chi nhánh..."
            value={selectedBranchId || ""}
            onChange={(value) => setSelectedBranchId(String(value))}
            className="w-full text-sm rounded-lg border-gray-300 focus:ring-orange-300"
          >
            {branches.length > 0 ? (
              branches.map((branch) => (
                <Select.Option key={branch.id} value={branch.id} title={branch.name}>
                  {branch.name}
                </Select.Option>
              ))
            ) : (
              <Select.Option value="" disabled title="Không có chi nhánh">
                Không có chi nhánh
              </Select.Option>
            )}
          </Select>
        </div>
      )}

      {!branchConfig && !error ? (
        <div className="text-center p-10 text-red-500">
          Vui lòng chọn chi nhánh để chỉnh sửa.
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
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
                value={branchConfig?.name || ""}
                onChange={handleBranchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Địa chỉ chi nhánh
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={branchConfig?.address || ""}
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
              <textarea
                id="description"
                name="description"
                rows={4}
                value={branchConfig?.description || ""}
                onChange={handleBranchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại chi nhánh
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={branchConfig?.phone_number || ""}
                onChange={handleBranchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}

            <div className="pt-4">
              <button
                onClick={requestSave}
                disabled={isSaving || !branchConfig}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <Modal
            visible={showSaveConfirm}
            title="Xác nhận lưu thay đổi"
            onClose={() => setShowSaveConfirm(false)}
            zIndex={1200}
            actions={[
              { text: "Hủy", onClick: () => setShowSaveConfirm(false) },
              { text: "Lưu", onClick: confirmSave, highLight: true },
            ]}
          >
            <div className="p-4 text-center">
              Bạn có chắc chắn muốn lưu các thay đổi này không?
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default BranchConfiguration;
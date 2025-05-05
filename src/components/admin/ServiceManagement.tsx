// src/components/admin/ServiceManagement.tsx
import React, { useState } from "react";
import { Modal } from "zmp-ui"; // <<< Bỏ import Button và Input
import { useNavigate } from "react-router-dom"; // <<< THÊM useNavigate
import { Search, Plus, Edit, Trash2, Wrench } from "lucide-react";

// Interface mẫu cho Service
interface ServiceData {
  id: string;
  name: string;
  description: string;
  priceRange?: string; // Ví dụ: "Từ 500.000đ", "Liên hệ"
  imageUrl?: string;
  isActive: boolean; // Trạng thái hoạt động
}

// Dữ liệu mẫu
const mockServices: ServiceData[] = [
  {
    id: "sv001",
    name: "Sửa xe tổng quát",
    description: "Kiểm tra và sửa chữa các lỗi thông thường.",
    priceRange: "Liên hệ",
    isActive: true,
  },
  {
    id: "sv002",
    name: "Thay dầu nhớt",
    description: "Thay dầu động cơ, hộp số.",
    priceRange: "Từ 300.000đ",
    isActive: true,
  },
  {
    id: "sv003",
    name: "Rửa xe cơ bản",
    description: "Rửa thân vỏ, hút bụi.",
    priceRange: "Từ 50.000đ",
    isActive: true,
  },
  {
    id: "sv004",
    name: "Bảo dưỡng định kỳ",
    description: "Kiểm tra theo km.",
    priceRange: "Từ 500.000đ",
    isActive: false,
  }, // Ví dụ dịch vụ không hoạt động
  // Thêm dịch vụ khác...
];

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const navigate = useNavigate(); // <<< THÊM hook navigate

  // Lọc dịch vụ
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = () => {
    console.log("Thêm dịch vụ mới");
    navigate("/admin/services/add"); // <<< SỬA: Điều hướng đến trang thêm mới
  };

  const handleEditService = (id: string) => {
    console.log("Sửa dịch vụ:", id);
    navigate(`/admin/services/edit/${id}`); // <<< SỬA: Điều hướng đến trang sửa với ID
  };

  const requestDeleteService = (id: string) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      setServices((prev) =>
        prev.filter((service) => service.id !== serviceToDelete)
      );
      console.log("Xóa dịch vụ:", serviceToDelete);
    }
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
  };

  return (
    <div>
      {/* Thanh công cụ */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* <<< THAY THẾ Input bằng input >>> */}
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        {/* <<< THAY THẾ Button bằng button >>> */}
        <button
          onClick={handleAddService}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors duration-150 whitespace-nowrap"
        >
          <Plus size={16} />
          Thêm mới
        </button>
      </div>

      {/* Bảng dịch vụ */}
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
                Tên dịch vụ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Mô tả
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Giá
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* TODO: Render các hàng dữ liệu dịch vụ tương tự UserManagement */}
            {/* Ví dụ một hàng */}
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                  {service.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {service.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.priceRange || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {service.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEditService(service.id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="Sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => requestDeleteService(service.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td
                  colSpan={6} // <<< CẬP NHẬT COLSPAN >>>
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Không tìm thấy dịch vụ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        visible={showDeleteConfirm}
        title="Xác nhận xóa dịch vụ"
        onClose={() => setShowDeleteConfirm(false)}
        zIndex={1200}
        actions={[
          { text: "Hủy", onClick: () => setShowDeleteConfirm(false) },
          { text: "Xóa", onClick: confirmDeleteService, danger: true },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn xóa dịch vụ này không?
        </div>
      </Modal>
    </div>
  );
};

export default ServiceManagement;

// src/components/admin/ServiceManagement.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Wrench } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

interface ServiceData {
  id: string;
  name: string;
  description: string;
  priceRange?: string;
  imageUrl?: string;
  isActive: boolean;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }

        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setServices(response.data.map((service: any) => ({
          ...service,
          id: service.id.toString(),
          priceRange: service.price_range,
          isActive: service.is_active,
        })));
      } catch (error: any) {
        console.error("Error fetching services:", error);
        alert(error.response?.data?.message || "Không thể tải danh sách dịch vụ.");
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = () => {
    navigate("/admin/services/add");
  };

  const handleEditService = (id: string) => {
    navigate(`/admin/services/edit/${id}`);
  };

  const requestDeleteService = (id: string) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }

        await axios.delete(`${API_BASE_URL}/api/services/${serviceToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setServices((prev) => prev.filter((service) => service.id !== serviceToDelete));
        alert("Xóa dịch vụ thành công!");
      } catch (error: any) {
        console.error("Error deleting service:", error);
        alert(error.response?.data?.message || "Không thể xóa dịch vụ.");
      }
    }
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
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
            placeholder="Tìm theo tên, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>
        <button
          onClick={handleAddService}
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
                Tên dịch vụ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{service.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{service.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.priceRange || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Không tìm thấy dịch vụ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
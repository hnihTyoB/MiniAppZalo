// src/components/admin/AddEditService.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

const AddEditService: React.FC = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId?: string }>();
  const isEditing = !!serviceId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data if editing
  useEffect(() => {
    if (isEditing && serviceId) {
      const fetchService = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
            navigate("/login");
            return;
          }

          const response = await axios.get(`${API_BASE_URL}/api/services/${serviceId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const serviceToEdit: ServiceData = response.data;
          setName(serviceToEdit.name);
          setDescription(serviceToEdit.description);
          setPriceRange(serviceToEdit.priceRange || "");
          setIsActive(serviceToEdit.isActive);
        } catch (err: any) {
          setError(err.response?.data?.message || "Không thể tải thông tin dịch vụ.");
          navigate("/admin/services");
        }
      };
      fetchService();
    }
  }, [isEditing, serviceId, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !description) {
      setError("Vui lòng điền đầy đủ Tên dịch vụ và Mô tả.");
      return;
    }

    setIsLoading(true);

    const serviceData: Omit<ServiceData, "id"> & { id?: string } = {
      name: name.trim(),
      description: description.trim(),
      priceRange: priceRange.trim() || undefined,
      isActive: isActive,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      if (isEditing && serviceId) {
        serviceData.id = serviceId;
        await axios.put(`${API_BASE_URL}/api/services/${serviceId}`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật dịch vụ thành công!");
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/services`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm dịch vụ thành công!");
        serviceData.id = response.data.serviceId; // Giả sử API trả về ID
      }
      navigate("/admin/services");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
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
          {isEditing ? "Sửa thông tin dịch vụ" : "Thêm dịch vụ mới"}
        </h2>
        <div className="w-8"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên dịch vụ <span className="text-red-500">*</span>
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
            Giá (Ví dụ: Từ 500.000đ, Liên hệ)
          </label>
          <input
            id="priceRange"
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Trạng thái hoạt động
          </label>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
                {isEditing ? "Lưu thay đổi" : "Thêm dịch vụ"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditService;
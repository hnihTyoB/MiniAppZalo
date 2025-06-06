import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Car, Bike, Edit, Trash2 } from "lucide-react";
import { Vehicle } from "@/interfaces/Vehicle";
import { Modal, Button } from "zmp-ui";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";

const VehicleManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehicles(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(error.response.data?.message || "Đã có lỗi xảy ra.");
        }
      } else {
        setError("Không thể kết nối đến server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchVehicles();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const goBack = () => {
    navigate(-1);
  };

  const handleAddVehicle = () => {
    navigate("/add-vehicle");
  };

  const handleEditVehicle = (vehicleId: string) => {
    navigate(`/edit-vehicle/${vehicleId}`);
  };

  const requestDeleteVehicle = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteVehicle = async () => {
    if (vehicleToDelete) {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        await axios.delete(`${API_BASE_URL}/api/vehicles/${vehicleToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete));
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra.");
          }
        } else {
          setError("Không thể kết nối đến server.");
        }
      } finally {
        setLoading(false);
        setShowDeleteConfirm(false);
        setVehicleToDelete(null);
      }
    }
  };

  const cancelDeleteVehicle = () => {
    setShowDeleteConfirm(false);
    setVehicleToDelete(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-2xl font-semibold text-center flex-1 text-gray-800">
          Quản lý phương tiện
        </h2>
        <div className="w-8"></div>
      </div>

      {/* Danh sách xe */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => {
            // Kiểm tra loại xe để chọn icon: xe máy hoặc xe ô tô
            const isBike = vehicle.type_id === 2 || (vehicle.type_name && vehicle.type_name.toLowerCase().includes("xe máy"));
            const Icon = isBike ? Bike : Car;

            return (
              <div
                key={vehicle.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4"
              >
                <div className="bg-orange-100 p-3 rounded-full">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">
                    {(vehicle.make || vehicle.make_name || "") + " " + 
                     (vehicle.model || vehicle.model_name || "")}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {vehicle.license_plate + 
                     (vehicle.year ? ` - ${vehicle.year}` : "")}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditVehicle(vehicle.id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                    aria-label="Chỉnh sửa xe"
                    disabled={loading}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => requestDeleteVehicle(vehicle.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    aria-label="Xóa xe"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <Car size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Bạn chưa thêm xe nào.</p>
            <p>Nhấn nút "+" để thêm xe mới.</p>
          </div>
        )}
      </div>

      {/* Nút Thêm Xe Mới (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-10 flex justify-center">
        <button
          onClick={handleAddVehicle}
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          disabled={loading}
        >
          <Plus size={20} />
          Thêm xe mới
        </button>
      </div>

      {/* Modal Xác Nhận Xóa */}
      <Modal
        visible={showDeleteConfirm}
        title="Xác nhận xóa"
        onClose={cancelDeleteVehicle}
        zIndex={1200}
        actions={[
          {
            text: "Hủy",
            onClick: cancelDeleteVehicle,
            highLight: false,
          },
          {
            text: "Xóa",
            onClick: confirmDeleteVehicle,
            highLight: true,
            danger: true,
          },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn
          tác.
        </div>
      </Modal>

      {/* Modal hiển thị lỗi */}
      <Modal
        visible={isModalOpen}
        title="Lỗi"
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        description={error || "Đã có lỗi xảy ra."}
      >
        <Button
          variant="primary"
          onClick={() => {
            setIsModalOpen(false);
            setError(null);
          }}
        >
          OK
        </Button>
      </Modal>
    </div>
  );
};

export default VehicleManagement;
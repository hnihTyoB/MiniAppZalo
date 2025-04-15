// src/pages/VehicleManagement.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Car, Edit, Trash2 } from "lucide-react";
import { Vehicle } from "@/interfaces/Vehicle"; // <<< Import interface Vehicle
import { Modal, Button } from "zmp-ui";

// --- Helper functions for localStorage ---
const getVehiclesFromStorage = (): Vehicle[] => {
  try {
    const storedVehicles = localStorage.getItem("userVehicles");
    return storedVehicles ? JSON.parse(storedVehicles) : [];
  } catch (error) {
    console.error("Error reading vehicles from localStorage:", error);
    return [];
  }
};

const saveVehiclesToStorage = (vehicles: Vehicle[]) => {
  try {
    localStorage.setItem("userVehicles", JSON.stringify(vehicles));
  } catch (error) {
    console.error("Error saving vehicles to localStorage:", error);
  }
};
// --- End Helper functions ---

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // <<< THÊM STATE CHO MODAL XÁC NHẬN XÓA >>>
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Load vehicles from storage on mount
  useEffect(() => {
    setVehicles(getVehiclesFromStorage());
  }, []);

  const goBack = () => {
    navigate(-1); // Quay lại trang trước (Profile)
  };

  const handleAddVehicle = () => {
    navigate("/add-vehicle"); // Điều hướng đến trang thêm xe
  };

  const handleEditVehicle = (vehicleId: string) => {
    navigate(`/edit-vehicle/${vehicleId}`); // Điều hướng đến trang sửa xe với ID
  };
  // <<< MỞ MODAL KHI NHẤN NÚT XÓA >>>
  const requestDeleteVehicle = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteConfirm(true);
  };
  // <<< HÀM XÓA THỰC SỰ KHI XÁC NHẬN TRÊN MODAL >>>
  const confirmDeleteVehicle = () => {
    if (vehicleToDelete) {
      const updatedVehicles = vehicles.filter((v) => v.id !== vehicleToDelete);
      setVehicles(updatedVehicles);
      saveVehiclesToStorage(updatedVehicles);
      console.log("Deleted vehicle with ID:", vehicleToDelete);
    }
    // Đóng modal và reset state
    setShowDeleteConfirm(false);
    setVehicleToDelete(null);
  };

  // <<< HỦY XÓA KHI NHẤN HỦY TRÊN MODAL >>>
  const cancelDeleteVehicle = () => {
    setShowDeleteConfirm(false);
    setVehicleToDelete(null);
  };

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
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* Danh sách xe */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4"
            >
              <div className="bg-orange-100 p-3 rounded-full">
                <Car className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">
                  {vehicle.make} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600">
                  {vehicle.licensePlate}
                  {vehicle.year && ` - ${vehicle.year}`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditVehicle(vehicle.id)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                  aria-label="Chỉnh sửa xe"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => requestDeleteVehicle(vehicle.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  aria-label="Xóa xe"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
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
        >
          <Plus size={20} />
          Thêm xe mới
        </button>
      </div>
      {/* <<< MODAL XÁC NHẬN XÓA >>> */}
      <Modal
        visible={showDeleteConfirm}
        title="Xác nhận xóa"
        onClose={cancelDeleteVehicle} // Đóng modal khi nhấn ra ngoài hoặc nút X
        zIndex={1200}
        actions={[
          {
            text: "Hủy",
            onClick: cancelDeleteVehicle,
            highLight: false, // Nút thường
          },
          {
            text: "Xóa",
            onClick: confirmDeleteVehicle,
            highLight: true, // Nút nổi bật (thường là màu đỏ hoặc màu chính)
            danger: true, // Đánh dấu là hành động nguy hiểm (có thể đổi màu nút)
          },
        ]}
      >
        <div className="p-4 text-center">
          Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn
          tác.
        </div>
      </Modal>
    </div>
  );
};

export default VehicleManagement;

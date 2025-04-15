// src/pages/AddEditVehicle.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Car, Trash2 } from "lucide-react";
import { Vehicle } from "@/interfaces/Vehicle"; // <<< Import interface Vehicle

// --- Helper functions (Copy từ VehicleManagement hoặc import) ---
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

const AddEditVehicle = () => {
  const navigate = useNavigate();
  const params = useParams();
  const vehicleId = params.vehicleId; // Lấy ID từ URL nếu là edit
  const isEditing = !!vehicleId;

  // State cho form
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState<number | string>(""); // Dùng string để input dễ xử lý hơn
  const [vin, setVin] = useState("");
  const [notes, setNotes] = useState("");

  // Load data nếu là edit
  useEffect(() => {
    if (isEditing && vehicleId) {
      const vehicles = getVehiclesFromStorage();
      const vehicleToEdit = vehicles.find((v) => v.id === vehicleId);
      if (vehicleToEdit) {
        setMake(vehicleToEdit.make);
        setModel(vehicleToEdit.model);
        setLicensePlate(vehicleToEdit.licensePlate);
        setYear(vehicleToEdit.year?.toString() || "");
        setVin(vehicleToEdit.vin || "");
        setNotes(vehicleToEdit.notes || "");
      } else {
        console.error("Vehicle not found for editing:", vehicleId);
        alert("Không tìm thấy thông tin xe để chỉnh sửa.");
        navigate("/vehicles"); // Quay lại danh sách nếu không tìm thấy
      }
    }
  }, [isEditing, vehicleId, navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    // Validation cơ bản
    if (!make || !model || !licensePlate) {
      alert("Vui lòng nhập Hãng xe, Dòng xe và Biển số.");
      return;
    }

    const currentVehicles = getVehiclesFromStorage();
    const vehicleData: Vehicle = {
      id: isEditing && vehicleId ? vehicleId : `vehicle_${Date.now()}`, // Tạo ID mới nếu là add
      make: make.trim(),
      model: model.trim(),
      licensePlate: licensePlate.trim().toUpperCase(), // Chuẩn hóa biển số
      year: year ? parseInt(String(year), 10) : undefined,
      vin: vin.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    let updatedVehicles: Vehicle[];
    if (isEditing) {
      // Cập nhật xe hiện có
      updatedVehicles = currentVehicles.map((v) =>
        v.id === vehicleId ? vehicleData : v
      );
      console.log("Updating vehicle:", vehicleData);
    } else {
      // Thêm xe mới vào đầu danh sách
      updatedVehicles = [vehicleData, ...currentVehicles];
      console.log("Adding new vehicle:", vehicleData);
    }

    saveVehiclesToStorage(updatedVehicles);
    alert(isEditing ? "Đã cập nhật thông tin xe!" : "Đã thêm xe thành công!");
    navigate("/vehicles"); // Quay lại trang danh sách sau khi lưu
  };

  const handleDelete = () => {
    if (!isEditing || !vehicleId) return;

    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác."
      )
    ) {
      const currentVehicles = getVehiclesFromStorage();
      const updatedVehicles = currentVehicles.filter((v) => v.id !== vehicleId);
      saveVehiclesToStorage(updatedVehicles);
      alert("Đã xóa xe thành công.");
      console.log("Deleted vehicle with ID:", vehicleId);
      navigate("/vehicles"); // Quay lại danh sách
    }
  };

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho phép số hoặc rỗng
    if (/^\d*$/.test(value)) {
      setYear(value);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1 text-gray-800">
          {isEditing ? "Chỉnh sửa xe" : "Thêm xe mới"}
        </h2>
        {/* Nút xóa chỉ hiển thị khi chỉnh sửa */}
        {isEditing ? (
          <button
            onClick={handleDelete}
            className="p-1 text-red-500"
            aria-label="Xóa xe"
          >
            <Trash2 size={20} />
          </button>
        ) : (
          <div className="w-8"></div> /* Placeholder */
        )}
      </div>

      {/* Form nhập liệu */}
      <div className="flex-grow overflow-y-auto p-6 space-y-5 pb-24">
        {/* Icon xe ở trên */}
        <div className="flex justify-center mb-4">
          <Car size={48} className="text-orange-400" />
        </div>

        {/* Hãng xe */}
        <div>
          <label
            htmlFor="make"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hãng xe <span className="text-red-500">*</span>
          </label>
          <input
            id="make"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="VD: Toyota, Honda, Ford..."
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Dòng xe */}
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dòng xe <span className="text-red-500">*</span>
          </label>
          <input
            id="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="VD: Camry, Civic, Ranger..."
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Biển số xe */}
        <div>
          <label
            htmlFor="licensePlate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Biển số xe <span className="text-red-500">*</span>
          </label>
          <input
            id="licensePlate"
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="VD: 51K-123.45"
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Năm sản xuất */}
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Năm sản xuất
          </label>
          <input
            id="year"
            type="number" // Dùng number nhưng xử lý state như string để dễ dàng hơn
            value={year}
            onChange={handleYearChange}
            placeholder="VD: 2020"
            min="1900"
            max={new Date().getFullYear() + 1} // Giới hạn năm
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Số VIN (Optional) */}
        <div>
          <label
            htmlFor="vin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Số VIN (Nếu có)
          </label>
          <input
            id="vin"
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Nhập số VIN của xe"
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Ghi chú (Optional) */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thêm ghi chú về xe (VD: màu sắc, tình trạng đặc biệt...)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
          />
        </div>
      </div>

      {/* Nút Lưu thay đổi (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full z-10 border-t bg-white p-4">
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full rounded-lg font-semibold transition-colors"
          onClick={handleSave}
        >
          {isEditing ? "Lưu thay đổi" : "Thêm xe"}
        </button>
      </div>
    </div>
  );
};

export default AddEditVehicle;

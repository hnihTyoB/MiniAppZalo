// src/pages/AddEditVehicle.tsx
import Select, { StylesConfig } from "react-select";
import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Car, Trash2 } from "lucide-react";
import { Vehicle } from "@/interfaces/Vehicle"; // <<< Import interface Vehicle

const popularCarMakes = [
  "Toyota",
  "Honda",
  "Ford",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mitsubishi",
  "Nissan",
  "Suzuki",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "VinFast",
  "Chevrolet",
  "Peugeot",
  "Lexus",
  "Subaru",
  "Volkswagen",
].map((make) => ({ value: make, label: make }));
// --- Dữ liệu dòng xe theo hãng (Ví dụ) ---
// Trong ứng dụng thực tế, dữ liệu này nên lấy từ API
// --- Kiểu dữ liệu cho option của react-select ---
type SelectOptionType = { value: string; label: string } | null;

// --- Danh sách hãng xe ---
const carModelsByMake: { [key: string]: SelectOptionType[] } = {
  Toyota: [
    "Vios",
    "Camry",
    "Corolla Altis",
    "Fortuner",
    "Innova",
    "Hilux",
    "Raize",
    "Veloz Cross",
    "Yaris",
    "Avanza",
    "Wigo",
  ].map((m) => ({ value: m, label: m })),
  Honda: ["City", "Civic", "CR-V", "HR-V", "Accord", "Brio"].map((m) => ({
    value: m,
    label: m,
  })),
  Ford: ["Ranger", "Everest", "Territory", "Explorer", "Transit"].map((m) => ({
    value: m,
    label: m,
  })),
  Hyundai: [
    "Accent",
    "Grand i10",
    "Creta",
    "Tucson",
    "Santa Fe",
    "Stargazer",
    "Elantra",
    "Venue",
  ].map((m) => ({ value: m, label: m })),
  Kia: [
    "Morning",
    "Soluto",
    "K3",
    "K5",
    "Seltos",
    "Sonet",
    "Sportage",
    "Carnival",
    "Carens",
  ].map((m) => ({ value: m, label: m })),
  Mazda: [
    "Mazda2",
    "Mazda3",
    "Mazda6",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-8",
    "BT-50",
  ].map((m) => ({ value: m, label: m })),
  Mitsubishi: ["Xpander", "Attrage", "Outlander", "Pajero Sport", "Triton"].map(
    (m) => ({ value: m, label: m })
  ),
  VinFast: [
    "Fadil",
    "Lux A2.0",
    "Lux SA2.0",
    "VF e34",
    "VF 5",
    "VF 6",
    "VF 7",
    "VF 8",
    "VF 9",
  ].map((m) => ({ value: m, label: m })),
  // Thêm các hãng và dòng xe khác nếu cần...
};
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
  const [make, setMake] = useState<SelectOptionType>(null);
  const [model, setModel] = useState<SelectOptionType>(null); // <<< THAY ĐỔI: State cho model
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState<number | string>("");
  const [vin, setVin] = useState("");
  const [notes, setNotes] = useState("");

  // Load data nếu là edit
  useEffect(() => {
    if (isEditing && vehicleId) {
      const vehicles = getVehiclesFromStorage();
      const vehicleToEdit = vehicles.find((v) => v.id === vehicleId);
      if (vehicleToEdit) {
        const makeOption = popularCarMakes.find(
          (option) => option?.value === vehicleToEdit.make
        );
        setMake(makeOption || null);

        // <<< THAY ĐỔI: Tìm và set model option >>>
        const modelsForMake = makeOption
          ? carModelsByMake[makeOption.value] || []
          : [];
        const modelOption = modelsForMake.find(
          (option) => option?.value === vehicleToEdit.model
        );
        setModel(modelOption || null);
        // Nếu không tìm thấy model trong danh sách gợi ý, có thể set giá trị thô (tùy chọn)
        // if (!modelOption && vehicleToEdit.model) {
        //   setModel({ value: vehicleToEdit.model, label: vehicleToEdit.model });
        // }

        setLicensePlate(vehicleToEdit.licensePlate);
        setYear(vehicleToEdit.year?.toString() || "");
        setVin(vehicleToEdit.vin || "");
        setNotes(vehicleToEdit.notes || "");
      } else {
        console.error("Vehicle not found for editing:", vehicleId);
        alert("Không tìm thấy thông tin xe để chỉnh sửa.");
        navigate("/vehicles");
      }
    }
  }, [isEditing, vehicleId, navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    const makeValue = make?.value;
    const modelValue = model?.value; // <<< THAY ĐỔI: Lấy giá trị model
    // Validation cơ bản
    if (!makeValue || !modelValue || !licensePlate) {
      alert("Vui lòng nhập Hãng xe, Dòng xe và Biển số.");
      return;
    }

    const currentVehicles = getVehiclesFromStorage();
    const vehicleData: Vehicle = {
      id: isEditing && vehicleId ? vehicleId : `vehicle_${Date.now()}`, // Tạo ID mới nếu là add
      make: makeValue.trim(),
      model: modelValue.trim(), // <<< THAY ĐỔI: Sử dụng modelValue
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
  // --- Lọc danh sách dòng xe dựa trên hãng đã chọn ---
  const availableModels = useMemo(() => {
    if (!make) return [];
    return carModelsByMake[make.value] || [];
  }, [make]);

  // --- Style cho react-select (có thể dùng chung) ---
  const selectStyles: StylesConfig<SelectOptionType, false> = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#F9A826" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 1px #F9A826" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#F9A826" : "#9CA3AF",
      },
      padding: "0.3rem",
      borderRadius: "0.5rem",
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected
        ? "#F9A826"
        : state.isFocused
        ? "#FEF3C7"
        : "white",
      color: state.isSelected ? "white" : "black",
      "&:active": {
        backgroundColor: "#FDBA74",
      },
    }),
    // Thêm các tùy chỉnh khác nếu cần
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
            htmlFor="make-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hãng xe <span className="text-red-500">*</span>
          </label>
          <Select
            id="make-select"
            options={popularCarMakes}
            value={make}
            // <<< THAY ĐỔI: Reset model khi đổi hãng >>>
            onChange={(selectedOption) => {
              setMake(selectedOption);
              setModel(null); // Reset dòng xe khi hãng thay đổi
            }}
            placeholder="Chọn hoặc nhập hãng xe..."
            isClearable
            isSearchable
            styles={selectStyles} // <<< Sử dụng style chung
          />
        </div>

        {/* Dòng xe (SỬ DỤNG react-select) */}
        <div>
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dòng xe <span className="text-red-500">*</span>
          </label>
          <Select
            id="model-select"
            options={availableModels} // <<< Sử dụng danh sách đã lọc
            value={model}
            onChange={(selectedOption) => setModel(selectedOption)}
            placeholder={
              make ? "Chọn hoặc nhập dòng xe..." : "Vui lòng chọn hãng xe trước"
            }
            isClearable
            isSearchable
            isDisabled={!make} // <<< Vô hiệu hóa nếu chưa chọn hãng
            styles={selectStyles} // <<< Sử dụng style chung
            noOptionsMessage={() =>
              make ? "Không tìm thấy dòng xe" : "Chưa chọn hãng xe"
            }
            // (Tùy chọn) Cho phép tạo mới nếu không có trong danh sách
            // formatCreateLabel={(inputValue) => `Thêm "${inputValue}"`}
            // onCreateOption={(inputValue) => {
            //   const newOption = { value: inputValue, label: inputValue };
            //   // Cập nhật danh sách tạm thời hoặc state nếu cần
            //   setModel(newOption);
            // }}
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

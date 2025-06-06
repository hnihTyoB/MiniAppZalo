import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Car, Bike } from "lucide-react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Select, Modal, Button } from "zmp-ui";

interface Vehicle {
  id: string;
  type_id: number;
  make_id?: number | null;
  model_id?: number | null;
  make?: string | null;
  model?: string | null;
  license_plate: string;
  year?: number | null;
  vin?: string | null;
  notes?: string | null;
  type_name?: string;
  make_name?: string;
  model_name?: string;
}

interface VehicleType {
  id: number;
  name: string;
}

interface Make {
  id: number;
  name: string;
  vehicle_type_id: number;
}

interface Model {
  id: number;
  name: string;
}

const AddEditVehicle = () => {
  const navigate = useNavigate();
  const params = useParams();
  const vehicleId = params.vehicleId;
  const isEditing = !!vehicleId;

  const [typeId, setTypeId] = useState<number | null>(null);
  const [makeId, setMakeId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [showCustomMake, setShowCustomMake] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState<number | string>("");
  const [vin, setVin] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [filteredMakes, setFilteredMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const [typesRes, makesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/vehicle-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error("Error fetching vehicle types:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/api/makes`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error("Error fetching makes:", err);
            return { data: [] };
          }),
        ]);
        setVehicleTypes(typesRes.data);
        setMakes(makesRes.data);
      } catch (error) {
        setError("Đã có lỗi xảy ra khi lấy dữ liệu loại xe và hãng xe.");
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (typeId) {
      const filtered = makes.filter((make) => make.vehicle_type_id === typeId);
      setFilteredMakes(filtered);
      if (!isEditing) {
        setMakeId(null);
        setModelId(null);
        setCustomMake("");
        setCustomModel("");
        setShowCustomMake(false);
        setShowCustomModel(false);
      }
    } else {
      setFilteredMakes([]);
      setMakeId(null);
      setModelId(null);
      setCustomMake("");
      setCustomModel("");
      setShowCustomMake(false);
      setShowCustomModel(false);
    }
  }, [typeId, makes, isEditing]);

  useEffect(() => {
    if (makeId && !showCustomMake) {
      const fetchModels = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/login");
            return;
          }
          const response = await axios.get(`${API_BASE_URL}/api/models/${makeId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { vehicle_type_id: typeId },
          });
          setModels(response.data);
        } catch (error) {
          setError("Đã có lỗi xảy ra khi lấy danh sách dòng xe.");
        }
      };
      fetchModels();
    } else {
      setModels([]);
      setModelId(null);
      setShowCustomModel(showCustomMake);
      if (!isEditing) {
        setCustomModel("");
      }
    }
  }, [makeId, showCustomMake, typeId, navigate, isEditing]);

  useEffect(() => {
    if (isEditing && vehicleId) {
      const fetchVehicle = async () => {
        try {
          setLoading(true);
          setError("");
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/login");
            return;
          }

          const response = await axios.get(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const vehicleToEdit: Vehicle = response.data;
          setTypeId(vehicleToEdit.type_id || null);
          setMakeId(vehicleToEdit.make_id || null);
          setModelId(vehicleToEdit.model_id || null);
          setCustomMake(vehicleToEdit.make || "");
          setCustomModel(vehicleToEdit.model || "");
          setShowCustomMake(!!vehicleToEdit.make);
          setShowCustomModel(!!vehicleToEdit.model);
          setLicensePlate(vehicleToEdit.license_plate || "");
          setYear(vehicleToEdit.year?.toString() || "");
          setVin(vehicleToEdit.vin || "");
          setNotes(vehicleToEdit.notes || "");
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
          setTimeout(() => navigate("/vehicles"), 1500);
        } finally {
          setLoading(false);
        }
      };

      fetchVehicle();
    }
  }, [isEditing, vehicleId, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const goBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (!typeId || !licensePlate) {
      setError("Vui lòng nhập Loại xe và Biển số.");
      return;
    }
    if (!makeId && !customMake) {
      setError("Vui lòng chọn hoặc nhập Hãng xe.");
      return;
    }
    if (!modelId && !customModel) {
      setError("Vui lòng chọn hoặc nhập Dòng xe.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const vehicleData = {
        type_id: typeId,
        make_id: showCustomMake ? null : makeId,
        model_id: showCustomModel ? null : modelId,
        make: showCustomMake ? customMake.trim() : null,
        model: showCustomModel ? customModel.trim() : null,
        license_plate: licensePlate.trim().toUpperCase(),
        year: year ? parseInt(String(year), 10) : undefined,
        vin: vin.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing && vehicleId) {
        await axios.put(`${API_BASE_URL}/api/vehicles/${vehicleId}`, vehicleData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Đã cập nhật thông tin xe!");
      } else {
        await axios.post(`${API_BASE_URL}/api/vehicles`, vehicleData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Đã thêm xe thành công!");
      }

      navigate("/vehicles", { state: { refresh: true } });
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

  const handleDelete = async () => {
    if (!isEditing || !vehicleId) return;

    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        await axios.delete(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Đã xóa xe thành công.");
        navigate("/vehicles", { state: { refresh: true } });
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
    }
  };

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setYear(value);
    }
  };

  const handleMakeChange = (value: string | number) => {
    if (value === "custom") {
      setShowCustomMake(true);
      setMakeId(null);
      setShowCustomModel(true);
      setCustomModel("");
    } else {
      setShowCustomMake(false);
      setCustomMake("");
      setMakeId(Number(value));
      setShowCustomModel(false);
      setModelId(null);
      setCustomModel("");
    }
  };

  const handleModelChange = (value: string | number) => {
    if (value === "custom") {
      setShowCustomModel(true);
      setModelId(null);
    } else {
      setShowCustomModel(false);
      setCustomModel("");
      setModelId(Number(value));
    }
  };

  // Xác định icon dựa trên typeId
  const selectedType = vehicleTypes.find((type) => type.id === typeId);
  const isBike = typeId === 2 || (selectedType && selectedType.name.toLowerCase().includes("xe máy"));
  const Icon = isBike ? Bike : Car;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white mt-3">
      {/* Header */}
      <div className="sticky top-0 flex items-center p-4 border-b bg-white z-10">
        <button onClick={goBack} className="p-1 mr-2 -ml-1 text-gray-600">
          <ChevronLeft size={25} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1 text-gray-800">
          {isEditing ? "Chỉnh sửa xe" : "Thêm xe mới"}
        </h2>
        <div className="w-8"></div>
      </div>

      {/* Form nhập liệu */}
      <div className="flex-grow overflow-y-auto p-6 space-y-5 pb-24">
        <div className="flex justify-center mb-4">
          <Icon size={48} className="text-orange-400" />
        </div>

        <div>
          <label
            htmlFor="typeId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Loại xe <span className="text-red-500">*</span>
          </label>
          <Select
            id="typeId"
            placeholder="Chọn loại xe..."
            value={typeId !== null ? typeId.toString() : ""}
            onChange={(value: string | number) => setTypeId(Number(value))}
            status={!typeId ? "error" : "default"}
          >
            {vehicleTypes.length > 0 ? (
              vehicleTypes.map((type) => (
                <Select.Option
                  key={type.id}
                  value={type.id.toString()}
                  title={type.name}
                />
              ))
            ) : (
              <Select.Option
                value=""
                disabled
                title="Không có loại xe nào"
              />
            )}
          </Select>
        </div>

        <div>
          <label
            htmlFor="make"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hãng xe <span className="text-red-500">*</span>
          </label>
          {!showCustomMake ? (
            <Select
              id="make"
              placeholder="Chọn hãng xe..."
              value={makeId !== null ? makeId.toString() : ""}
              onChange={handleMakeChange}
              status={!makeId && !customMake ? "error" : "default"}
              disabled={!typeId}
            >
              {filteredMakes.length > 0 ? (
                [
                  ...filteredMakes.map((make) => (
                    <Select.Option
                      key={make.id}
                      value={make.id.toString()}
                      title={make.name}
                    />
                  )),
                  <Select.Option
                    key="custom"
                    value="custom"
                    title="Nhập thủ công..."
                  />,
                ]
              ) : (
                <Select.Option
                  value=""
                  disabled
                  title={typeId ? "Không có hãng xe nào" : "Chọn loại xe trước"}
                />
              )}
            </Select>
          ) : (
            <input
              id="make"
              type="text"
              value={customMake}
              onChange={(e) => setCustomMake(e.target.value)}
              placeholder="Nhập hãng xe..."
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              disabled={loading}
            />
          )}
          {showCustomMake && (
            <button
              onClick={() => {
                setShowCustomMake(false);
                setCustomMake("");
                setShowCustomModel(false);
                setCustomModel("");
              }}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer mt-1"
            >
              Chọn từ danh sách
            </button>
          )}
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dòng xe <span className="text-red-500">*</span>
          </label>
          {!showCustomModel ? (
            <Select
              id="model"
              placeholder="Chọn dòng xe..."
              value={modelId !== null ? modelId.toString() : ""}
              onChange={handleModelChange}
              status={!modelId && !customModel ? "error" : "default"}
              disabled={!(makeId || showCustomMake)}
            >
              {models.length > 0 ? (
                [
                  ...models.map((model) => (
                    <Select.Option
                      key={model.id}
                      value={model.id.toString()}
                      title={model.name}
                    />
                  )),
                  <Select.Option
                    key="custom"
                    value="custom"
                    title="Nhập thủ công..."
                  />,
                ]
              ) : (
                <Select.Option
                  value=""
                  disabled
                  title={makeId || showCustomMake ? "Không có dòng xe nào" : "Chọn hãng xe trước"}
                />
              )}
            </Select>
          ) : (
            <input
              id="model"
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Nhập dòng xe..."
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              disabled={loading}
            />
          )}
          {showCustomModel && (
            <button
              onClick={() => {
                setShowCustomModel(false);
                setCustomModel("");
              }}
              className="text-orange-400 text-sm font-medium hover:underline cursor-pointer mt-1"
            >
              Chọn từ danh sách
            </button>
          )}
        </div>

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
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Năm sản xuất
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={handleYearChange}
            placeholder="VD: 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full border border-gray-300 rounded-lg p-3 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            disabled={loading}
          />
        </div>

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
            disabled={loading}
          />
        </div>

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
            disabled={loading}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-10 border-t bg-white p-4">
        <button
          className={`bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg w-full rounded-lg font-semibold transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSave}
          disabled={loading}
        >
          {isEditing ? "Lưu thay đổi" : "Thêm xe"}
        </button>
      </div>

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

export default AddEditVehicle;
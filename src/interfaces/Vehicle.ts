// src/interfaces/Vehicle.ts (hoặc định nghĩa trong component)
export interface Vehicle {
  id: string; // ID duy nhất cho mỗi xe (có thể dùng Date.now() hoặc UUID)
  make: string; // Hãng xe (e.g., Toyota, Honda)
  model: string; // Dòng xe (e.g., Camry, Civic)
  licensePlate: string; // Biển số xe
  year?: number; // Năm sản xuất (optional)
  vin?: string; // Số VIN (optional)
  notes?: string; // Ghi chú thêm (optional)
}

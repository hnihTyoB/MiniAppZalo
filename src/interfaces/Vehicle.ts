export interface Vehicle {
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
    make_name?: string; // Thêm make_name
    model_name?: string; // Thêm model_name
  }
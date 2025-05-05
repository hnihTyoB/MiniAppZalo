// src/components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Wrench,
  CalendarCheck,
  DollarSign,
  BarChart3,
  Download,
} from "lucide-react"; // <<< Thêm icon BarChart3, Download
import { useAuth } from "../../contexts/AuthContext"; // <<< Import useAuth

// Component Card thống kê đơn giản
const StatCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string; // Tailwind color class (e.g., 'text-blue-500', 'bg-blue-100')
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
    <div
      className={`p-2 rounded-full ${color.replace(
        "text-",
        "bg-"
      )} bg-opacity-20`}
    >
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// Interface cho dữ liệu thống kê
interface DashboardStats {
  totalUsers: number | string; // Có thể là 'N/A' nếu không có quyền xem
  totalServices?: number | string; // Admin mới thấy
  pendingBookings: number | string;
  monthlyRevenue: string;
  totalEmployees?: number | string; // <<< Thêm số lượng nhân viên (cho BM)
  branchName?: string; // Tên chi nhánh cho Branch Manager
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  console.log("Current User:", user); // <<< DEBUG: Kiểm tra user hiện tại
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      // --- TODO: Gọi API để lấy dữ liệu thống kê ---
      // Backend cần trả về dữ liệu phù hợp dựa trên role và branchId của user
      // Ví dụ:
      // let apiUrl = "/api/dashboard/stats";
      // if (user?.role === 'branch_manager' && user.branchId) {
      //   apiUrl += `?branchId=${user.branchId}`;
      // }
      // try {
      //   const response = await fetch(apiUrl); // Thêm headers xác thực nếu cần
      //   const data: DashboardStats = await response.json();
      //   setStats(data);
      // } catch (error) {
      //   console.error("Error fetching dashboard stats:", error);
      //   setStats(null); // Hoặc set state lỗi
      // } finally {
      //   setIsLoading(false);
      // }

      // --- Giả lập fetch dữ liệu ---
      await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập độ trễ mạng
      if (user?.role === "admin") {
        setStats({
          totalUsers: 150,
          totalServices: 15,
          pendingBookings: 5,
          monthlyRevenue: "15.000.000đ",
        });
      } else if (user?.role === "branch_manager") {
        // Giả sử lấy được tên chi nhánh từ user hoặc API
        setStats({
          totalUsers: `25`,
          pendingBookings: 2,
          totalEmployees: 8, // <<< Thêm số liệu nhân viên giả lập
          monthlyRevenue: "3.500.000đ",
          branchName: `Chi nhánh ${user.branchId}`,
        });
      }
      setIsLoading(false);
      // --- Hết phần giả lập ---
    };

    if (user) {
      fetchStats();
    } else {
      setIsLoading(false); // Nếu không có user, không cần load gì cả
    }
  }, [user]); // Fetch lại khi user thay đổi

  if (isLoading) {
    return <div className="text-center p-10">Đang tải dữ liệu...</div>; // Hoặc dùng Spinner
  }

  if (!stats) {
    return (
      <div className="text-center p-10 text-red-500">
        Không thể tải dữ liệu tổng quan.
      </div>
    );
  }

  const handleExportReport = async (format: "excel" | "csv" = "excel") => {
    console.log(`Yêu cầu xuất báo cáo dạng: ${format}`);
    alert(`Chức năng xuất báo cáo (${format}) đang được phát triển!`);

    // --- Logic thực tế sẽ như sau: ---
    // 1. Hiển thị loading indicator (nếu cần)
    // setLoadingExport(true);

    try {
      // 2. Chuẩn bị các tham số (ngày bắt đầu, kết thúc, chi nhánh nếu là BM,...)
      const params = new URLSearchParams();
      params.append("format", format);
      if (user?.role === "branch_manager" && user.branchId) {
        params.append("branchId", user.branchId);
      }
      // Thêm các params khác nếu cần (dateRange, reportType,...)

      // 3. Gọi API backend
      // const response = await fetch(`/api/reports/export?${params.toString()}`, {
      //   method: 'GET',
      //   headers: {
      //     // Thêm headers xác thực nếu cần
      //     'Authorization': `Bearer ${your_auth_token}`,
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error(`Lỗi khi xuất báo cáo: ${response.statusText}`);
      // }

      // 4. Nhận file Blob từ backend
      // const blob = await response.blob();

      // 5. Lấy tên file từ header 'Content-Disposition' (nếu có) hoặc tạo tên mặc định
      // const contentDisposition = response.headers.get('content-disposition');
      // let filename = `bao_cao_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      // if (contentDisposition) {
      //   const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      //   if (filenameMatch && filenameMatch[1]) {
      //     filename = filenameMatch[1];
      //   }
      // }

      // 6. Tạo URL tạm thời và kích hoạt tải xuống
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = filename;
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
      // window.URL.revokeObjectURL(url); // Giải phóng bộ nhớ

      // console.log("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo:", error);
      alert(
        `Đã xảy ra lỗi khi xuất báo cáo: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      // 7. Ẩn loading indicator
      // setLoadingExport(false);
    }
  };
  // <<< KẾT THÚC HÀM XỬ LÝ >>>

  console.log("Dashboard Stats:", stats); // <<< DEBUG: Kiểm tra stats sau khi fetch
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Tổng quan {stats.branchName ? `- ${stats.branchName}` : ""}
      </h2>
      {/* <<< Thay ghi chú bằng nút Xuất báo cáo >>> */}
      <div className="mb-4 text-right">
        <button
          onClick={() => handleExportReport()} // <<< Gọi hàm xử lý xuất báo cáo
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-xs transition-colors duration-150 whitespace-nowrap ml-auto" // <<< Style nút màu xanh lá
        >
          <Download size={14} />
          Xuất báo cáo (Excel)
        </button>
        {/* Có thể thêm nút xuất CSV riêng nếu muốn */}
        {/* <button
          onClick={() => handleExportReport('csv')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-xs transition-colors duration-150 whitespace-nowrap ml-2"
        >
          <Download size={14} />
          Xuất CSV
        </button> */}
      </div>

      {/* Phần thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          title={
            user?.role === "branch_manager" ? "Khách hàng" : "Tổng người dùng"
          }
          value={stats.totalUsers}
          color="text-blue-500"
        />
        {/* Chỉ Admin mới thấy tổng dịch vụ toàn hệ thống */}
        {user?.role === "admin" && stats.totalServices !== undefined && (
          <StatCard
            icon={Wrench}
            title="Tổng dịch vụ"
            value={stats.totalServices}
            color="text-green-500"
          />
        )}
        {/* Chỉ Branch Manager mới thấy số lượng nhân viên chi nhánh */}
        {user?.role === "branch_manager" &&
          stats.totalEmployees !== undefined && (
            <StatCard
              icon={Users} // Hoặc dùng icon khác như Briefcase
              title="Nhân viên"
              value={stats.totalEmployees}
              color="text-cyan-500" // <<< Màu khác
            />
          )}

        <StatCard
          icon={CalendarCheck}
          title="Lịch hẹn chờ duyệt"
          value={stats.pendingBookings}
          color="text-yellow-500"
        />
        <StatCard
          icon={DollarSign}
          title="Doanh thu tháng"
          value={stats.monthlyRevenue}
          color="text-purple-500"
        />
      </div>

      {/* Phần báo cáo (Ví dụ: Biểu đồ) - Chỉ hiển thị cho Branch Manager theo yêu cầu */}
      {user?.role === "branch_manager" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">
              Doanh thu theo tháng
            </h3>
            {/* <<< Cải thiện biểu đồ cột doanh thu >>> */}
            <div className="h-64 bg-gray-50 p-4 flex flex-col justify-end rounded border border-gray-200">
              <div className="flex items-end justify-around h-full space-x-2">
                {/* Giả lập các cột với tooltip */}
                <div
                  className="w-10 bg-blue-300 hover:bg-blue-400 transition-colors"
                  style={{ height: "60%" }}
                  title="Tháng 1: 6.000.000đ"
                ></div>
                <div
                  className="w-10 bg-blue-400 hover:bg-blue-500 transition-colors"
                  style={{ height: "80%" }}
                  title="Tháng 2: 8.000.000đ"
                ></div>
                <div
                  className="w-10 bg-blue-300 hover:bg-blue-400 transition-colors"
                  style={{ height: "50%" }}
                  title="Tháng 3: 5.000.000đ"
                ></div>
                <div
                  className="w-10 bg-blue-500 hover:bg-blue-600 transition-colors"
                  style={{ height: "90%" }}
                  title="Tháng 4: 9.000.000đ"
                ></div>
                <div
                  className="w-10 bg-blue-400 hover:bg-blue-500 transition-colors"
                  style={{ height: "70%" }}
                  title="Tháng 5 (Hiện tại): 7.000.000đ"
                ></div>
              </div>
              {/* Thêm nhãn tháng */}
              <div className="flex justify-around mt-1 text-xs text-gray-500">
                <span className="w-10 text-center">T1</span>
                <span className="w-10 text-center">T2</span>
                <span className="w-10 text-center">T3</span>
                <span className="w-10 text-center">T4</span>
                <span className="w-10 text-center">T5</span>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                (Cần thư viện biểu đồ để hiển thị chi tiết hơn)
              </p>
            </div>
          </div>
          {/* <<< Thay thế Lịch hẹn gần đây bằng Dịch vụ phổ biến >>> */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">
              <BarChart3 size={16} className="inline mr-1 mb-0.5" />
              Dịch vụ phổ biến (Tháng)
            </h3>
            {/* <<< Minh họa biểu đồ ngang đơn giản >>> */}
            <div className="space-y-3 text-sm">
              {/* Giả lập dữ liệu và thanh bar */}
              <div className="flex items-center gap-2">
                <span className="w-32 truncate text-gray-600">
                  Thay dầu nhớt
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: "70%" }}
                    title="35 lượt"
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">35</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 truncate text-gray-600">Bảo dưỡng</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: "56%" }}
                    title="28 lượt"
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">28</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 truncate text-gray-600">Rửa xe</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: "40%" }}
                    title="20 lượt"
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">20</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 truncate text-gray-600">
                  Sửa chữa chung
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: "30%" }}
                    title="15 lượt"
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">15</span>
              </div>
              {/* ... thêm các dịch vụ khác ... */}
              <p className="text-xs text-gray-400 text-center pt-2">
                (Cần tích hợp thư viện biểu đồ để trực quan hơn)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

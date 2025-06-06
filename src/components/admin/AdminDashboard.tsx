// src/components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { Users, Wrench, CalendarCheck, DollarSign, BarChart3, Download } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const StatCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string;
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
    <div className={`p-2 rounded-full ${color.replace("text-", "bg-")} bg-opacity-20`}>
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

interface DashboardStats {
  totalUsers: number | string;
  totalServices?: number | string;
  pendingBookings: number | string;
  monthlyRevenue: string;
  totalEmployees?: number | string;
  branchName?: string;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface PopularService {
  name: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }

        let apiUrl = `${API_BASE_URL}/api/dashboard/stats`;
        if (user?.role === "branch_manager" && user.branchId) {
          apiUrl += `?branchId=${user.branchId}`;
        }

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);

        // Fetch revenue and popular services for branch managers
        if (user?.role === "branch_manager") {
          const revenueResponse = await axios.get(`${API_BASE_URL}/api/reports/revenue`, {
            params: { branchId: user.branchId },
            headers: { Authorization: `Bearer ${token}` },
          });
          setRevenueData(revenueResponse.data);

          const popularServicesResponse = await axios.get(`${API_BASE_URL}/api/reports/popular-services`, {
            params: { branchId: user.branchId },
            headers: { Authorization: `Bearer ${token}` },
          });
          setPopularServices(popularServicesResponse.data);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleExportReport = async (format: "excel" | "csv" = "excel") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const params = new URLSearchParams();
      params.append("format", format);
      if (user?.role === "branch_manager" && user.branchId) {
        params.append("branchId", user.branchId);
      }

      const response = await axios.get(`${API_BASE_URL}/api/reports/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao_cao_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Lỗi khi xuất báo cáo:", error);
      alert(`Đã xảy ra lỗi khi xuất báo cáo: ${error.message || String(error)}`);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;
  }

  if (!stats) {
    return <div className="text-center p-10 text-red-500">Không thể tải dữ liệu tổng quan.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Tổng quan {stats.branchName ? `- ${stats.branchName}` : ""}
      </h2>
      <div className="mb-4 text-right">
        <button
          onClick={() => handleExportReport()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-xs transition-colors duration-150 whitespace-nowrap ml-auto"
        >
          <Download size={14} />
          Xuất báo cáo (Excel)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          title={user?.role === "branch_manager" ? "Khách hàng" : "Tổng người dùng"}
          value={stats.totalUsers}
          color="text-blue-500"
        />
        {user?.role === "admin" && stats.totalServices !== undefined && (
          <StatCard icon={Wrench} title="Tổng dịch vụ" value={stats.totalServices} color="text-green-500" />
        )}
        {user?.role === "branch_manager" && stats.totalEmployees !== undefined && (
          <StatCard icon={Users} title="Nhân viên" value={stats.totalEmployees} color="text-cyan-500" />
        )}
        <StatCard
          icon={CalendarCheck}
          title="Lịch hẹn chờ duyệt"
          value={stats.pendingBookings}
          color="text-yellow-500"
        />
        <StatCard icon={DollarSign} title="Doanh thu tháng" value={stats.monthlyRevenue} color="text-purple-500" />
      </div>

      {user?.role === "branch_manager" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">Doanh thu theo tháng</h3>
            <div className="h-64 bg-gray-50 p-4 flex flex-col justify-end rounded border border-gray-200">
              <div className="flex items-end justify-around h-full space-x-2">
                {revenueData.map((data, index) => {
                  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
                  const height = (data.revenue / maxRevenue) * 100 || 0;
                  return (
                    <div
                      key={index}
                      className="w-10 bg-blue-300 hover:bg-blue-400 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${data.month}: ${data.revenue.toLocaleString()}đ`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex justify-around mt-1 text-xs text-gray-500">
                {revenueData.map((data, index) => (
                  <span key={index} className="w-10 text-center">{data.month}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                (Cần thư viện biểu đồ để hiển thị chi tiết hơn)
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">
              <BarChart3 size={16} className="inline mr-1 mb-0.5" />
              Dịch vụ phổ biến (Tháng)
            </h3>
            <div className="space-y-3 text-sm">
              {popularServices.map((service, index) => {
                const maxCount = Math.max(...popularServices.map((s) => s.count));
                const width = (service.count / maxCount) * 100 || 0;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-32 truncate text-gray-600">{service.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-400 h-3 rounded-full"
                        style={{ width: `${width}%` }}
                        title={`${service.count} lượt`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{service.count}</span>
                  </div>
                );
              })}
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
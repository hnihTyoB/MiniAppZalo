import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Filter, MapPin, Phone, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/api";
import { Modal, Button as ZmpButton } from "zmp-ui";

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  image_url?: string; // Thêm image_url
  description?: string; // Thêm description
}

const BranchListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/branches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBranches(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError(error.response.data?.message || "Đã có lỗi xảy ra khi lấy dữ liệu.");
          }
        } else {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.");
        }
      }
    };

    fetchBranches();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const goBack = () => {
    navigate(-1);
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBranchClick = (branch: Branch) => {
    console.log(`Navigating to detail for branch: ${branch.name}`);
    navigate("/branch-detail", { state: { branchData: branch } });
  };

  const handleFilterClick = () => {
    console.log("Filter button clicked - TODO: Implement filter logic/modal");
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 h-16 px-4 flex items-center justify-center bg-white z-20 border-b">
        <button
          onClick={goBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 -ml-2 text-gray-600"
        >
          <ChevronLeft size={25} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Danh sách Chi nhánh
        </h1>
      </div>

      {/* Thanh tìm kiếm và Filter */}
      <div className="sticky top-16 flex gap-2 items-center bg-white z-10 px-4 py-2 border-b">
        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg flex-1">
          <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          size="icon"
          variant="outline"
          className="bg-orange-400 hover:bg-orange-500 text-white flex-shrink-0"
          onClick={handleFilterClick}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Danh sách chi nhánh */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Đang tải chi nhánh...</p>
        ) : filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => (
            <div
              key={branch.id}
              onClick={() => handleBranchClick(branch)}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150 shadow-sm"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBranchClick(branch);
                }
              }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {branch.image_url ? (
                  <img
                    src={branch.image_url}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="font-semibold text-base truncate">
                  {branch.name}
                </div>
                {branch.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {branch.description}
                  </p>
                )}
                {branch.address && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </div>
                )}
                {branch.phone_number && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone size={14} className="flex-shrink-0" />
                    <span className="truncate">{branch.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không tìm thấy chi nhánh nào phù hợp.
          </p>
        )}
      </div>

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
        <ZmpButton
          variant="primary"
          onClick={() => {
            setIsModalOpen(false);
            setError(null);
          }}
        >
          OK
        </ZmpButton>
      </Modal>
    </div>
  );
};

export default BranchListPage;
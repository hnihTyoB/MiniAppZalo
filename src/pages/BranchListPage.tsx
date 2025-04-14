// src/pages/BranchListPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Filter, MapPin, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input"; // Giả sử bạn có component Input từ shadcn/ui
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button từ shadcn/ui

// --- Interface Branch (Copy từ Home.tsx) ---
interface Branch {
  id: number;
  name: string;
  imageUrl?: string;
  address?: string;
  // Thêm các thuộc tính khác nếu cần (ví dụ: khoảng cách, đánh giá...)
}

// --- Dữ liệu mẫu (Nên lấy từ API trong thực tế) ---
// Có thể mở rộng danh sách này
const allAvailableBranches: Branch[] = [
  {
    id: 1,
    name: "PTIT - Chi nhánh 1",
    address: "97 Man Thiện, Hiệp Phú, Thủ Đức",
    imageUrl: "/images/branch-1.jpg",
  },
  {
    id: 2,
    name: "PTIT - Chi nhánh 2",
    address: "122 Hoàng Diệu 2, Linh Chiểu, Thủ Đức",
    imageUrl: "/images/branch-2.jpg",
  },
  {
    id: 3,
    name: "Chi nhánh Quận 9",
    address: "45 Lê Văn Việt, Tăng Nhơn Phú A, Quận 9",
    // imageUrl: undefined, // Ví dụ không có ảnh
  },
  {
    id: 4,
    name: "Chi nhánh Bình Thạnh",
    address: "200 Xô Viết Nghệ Tĩnh, Phường 21, Bình Thạnh",
    imageUrl: "/images/branch-default.jpg", // Ảnh mặc định
  },
  {
    id: 5,
    name: "Chi nhánh Quận 1",
    address: "50 Nguyễn Huệ, Bến Nghé, Quận 1",
    imageUrl: "/images/branch-q1.jpg",
  },
  // Thêm nhiều chi nhánh hơn...
];

const BranchListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const goBack = () => {
    navigate(-1);
  };

  // --- Logic lọc chi nhánh ---
  const filteredBranches = allAvailableBranches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Handler khi click vào chi nhánh ---
  const handleBranchClick = (branch: Branch) => {
    console.log(`Navigating to detail for branch: ${branch.name}`);
    navigate("/branch-detail", { state: { branchData: branch } });
  };

  // --- Handler cho nút Filter (TODO) ---
  const handleFilterClick = () => {
    console.log("Filter button clicked - TODO: Implement filter logic/modal");
    // Có thể mở một modal hoặc bottom sheet để chọn bộ lọc
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
        {/* Sử dụng component Input nếu có */}
        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg flex-1">
          <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Sử dụng component Button nếu có */}
        <Button
          size="icon"
          variant="outline" // Hoặc style khác
          className="bg-orange-400 hover:bg-orange-500 text-white flex-shrink-0"
          onClick={handleFilterClick}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Danh sách chi nhánh (cho phép cuộn) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredBranches.length > 0 ? (
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
              {/* Ảnh chi nhánh */}
              <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded-md overflow-hidden">
                {branch.imageUrl ? (
                  <img
                    src={branch.imageUrl}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {/* Thông tin chi nhánh */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="font-semibold text-base truncate">
                  {branch.name}
                </div>
                {branch.address && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="line-clamp-2">{branch.address}</span>{" "}
                    {/* Hiển thị tối đa 2 dòng */}
                  </div>
                )}
                {/* Có thể thêm thông tin khác như khoảng cách, đánh giá... */}
                {/* <div className="text-xs text-gray-400">Cách bạn 1.2 km</div> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không tìm thấy chi nhánh nào phù hợp.
          </p>
        )}
      </div>
    </div>
  );
};

export default BranchListPage;

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string; // Hoặc number, tùy thuộc vào backend của bạn
  name: string;
  phone: string;
  role: "admin" | "customer" | "branch_manager";
  branchId: string;
  // Thêm các trường thông tin người dùng khác nếu cần
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // Trạng thái chờ kiểm tra auth ban đầu
  login: (userData: User, token?: string) => void; // Thêm token nếu bạn dùng JWT
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Bắt đầu ở trạng thái loading

  useEffect(() => {
    // Kiểm tra thông tin đăng nhập đã lưu khi component mount
    try {
      const storedUser = localStorage.getItem("user");
      // const storedToken = localStorage.getItem("token"); // Nếu dùng token
      if (storedUser /* && storedToken */) {
        const parsedUser: User = JSON.parse(storedUser);
        // TODO: Có thể thêm bước xác thực token với backend ở đây nếu cần
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
      // localStorage.removeItem("token");
    } finally {
      setIsLoading(false); // Kết thúc loading sau khi kiểm tra xong
    }
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token); // Lưu token nếu có
    }
    setIsLoading(false); // Đảm bảo không còn loading sau khi login
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Xóa token nếu có
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

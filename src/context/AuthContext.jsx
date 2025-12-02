import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Loader from "../utils/Loader";
import { loginUser, getProfile } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🌐 Load user profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getProfile()
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔐 Login function using service API
  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      toast.success("Login Successful");

      const redirectPath = res.data.user.userType === "ADMIN" ? "/admin" : "/dashboard";
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  // 🚪 Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged Out");
    navigate("/login");
  };

  // ⏳ Global loader during initial auth check
  if (loading) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

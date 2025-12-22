import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false); // <-- new

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setInitialized(true);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      if (response.status === 200 && response.data.employee) {
        setUser(response.data.employee);
        localStorage.setItem("user", JSON.stringify(response.data.employee));
        return { success: true };
      }
    } catch (error) {
      if (error.response) {
        return { success: false, message: error.response.data.message };
      }
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

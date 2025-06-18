import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import { Loader } from "lucide-react";

const PrivateRoute = () => {
  const [isAuthServer, setIsAuthServer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cek token di browser
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkAuth = async () => {
      // Jika tidak ada token, langsung set tidak terautentikasi
      if (!token) {
        setIsAuthServer(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Private Route");
        const response = await axios.get(
          "http://localhost:3000/private-route",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        // Set auth status berdasarkan response server
        if (response.data.isAuthServer) {
          setIsAuthServer(true);
        } else {
          setIsAuthServer(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthServer(false);

        // Jika error 401/403, hapus token yang tidak valid
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoading(false); // Set loading selesai
      }
    };

    checkAuth();
  }, [token]); // Dependency pada token

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/5 bg-opacity-80 z-50">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!token || !isAuthServer) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Optional: redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

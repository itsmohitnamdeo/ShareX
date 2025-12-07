import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LinkAccessPage from "./pages/LinkAccessPage";

export default function App() {
  const [token, setTokenState] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    const handleStorage = () => setTokenState(sessionStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" replace /> : <Login onLogin={setTokenState} />
          }
        />
        <Route
          path="/login"
          element={
            token ? <Navigate to="/dashboard" replace /> : <Login onLogin={setTokenState} />
          }
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard onLogout={() => setTokenState(null)} /> : <Navigate to="/login" replace />}
        />
        <Route path="/api/files/link/:token" element={<LinkAccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

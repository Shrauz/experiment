import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar"; // ✅ import navbar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";

export default function App() {
  return (
    <>
      {/* Navbar will always show, except on Login/Register */}
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        
        {/* Auth pages (without navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All other pages wrapped with navbar */}
        <Route
          path="/dashboard"
          element={
            <>
              <Navbar />
              <Dashboard />
            </>
          }
        />
        <Route
          path="/interview"
          element={
            <>
              <Navbar />
              <Interview />
            </>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </>
  );
}

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import InterviewGenerator from "./pages/InterviewGenerator";
import GenerateInterview from "./pages/GenerateInterview";
import Home from "./pages/Home"; // ✅ new home

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected-like routes with navbar */}
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
        <Route
          path="/generate-interview"
          element={
            <>
              <Navbar />
              <GenerateInterview />
            </>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </>
  );
}

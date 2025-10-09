import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserInterviews from "./pages/UserInterviews"; // ✅ new page
import VoiceInterview from "./components/VoiceInterview"; // Interview page
import InterviewGenerator from "./pages/InterviewGenerator";
import GenerateInterview from "./pages/GenerateInterview";
import Home from "./pages/Home";
import TakeInterview from "./pages/TakeInterview";

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
          path="/my-interviews"
          element={
            <>
              <Navbar />
              <UserInterviews />
            </>
          }
        />
        <Route
          path="/interview"
          element={
            <>
              <Navbar />
              <VoiceInterview />
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
        <Route
          path="/take-interview"
          element={
            <>
              <Navbar />
              <TakeInterview />
            </>
          }
        />


        {/* Catch-all */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </>
  );
}

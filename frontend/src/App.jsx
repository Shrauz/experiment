import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserInterviews from "./pages/UserInterviews";
import VoiceInterview from "./components/VoiceInterview";
import InterviewGenerator from "./pages/InterviewGenerator";
import GenerateInterview from "./pages/GenerateInterview";
import Home from "./pages/Home";
import TakeInterview from "./pages/TakeInterview";

export default function App() {
  return (
    <>
      {/* Navbar is global */}
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected-like routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-interviews" element={<UserInterviews />} />
        <Route path="/interview" element={<VoiceInterview />} />
        <Route path="/generate-interview" element={<GenerateInterview />} />
        <Route path="/take-interview" element={<TakeInterview />} />

        {/* Catch-all */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </>
  );
}

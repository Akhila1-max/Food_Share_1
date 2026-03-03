import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminPanel from "./pages/AdminPanel";

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/donor" element={
              <ProtectedRoute role="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/volunteer" element={
              <ProtectedRoute role="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

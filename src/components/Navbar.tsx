import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Heart, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight">FoodShare</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : user.role === "donor" ? "/donor" : "/volunteer"}
                  className="flex items-center gap-2 text-stone-600 hover:text-emerald-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Dashboard</span>
                </Link>
                <div className="h-4 w-px bg-stone-200 mx-2" />
                <div className="flex items-center gap-2 text-stone-900">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

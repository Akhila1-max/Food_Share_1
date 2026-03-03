import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight } from "lucide-react";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "donor") navigate("/donor");
      else navigate("/volunteer");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-stone-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-stone-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-900">Welcome Back</h2>
          <p className="text-stone-500 mt-2">Sign in to continue sharing food</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center mt-8 text-stone-500">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-emerald-600 font-bold hover:underline">
            Register
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

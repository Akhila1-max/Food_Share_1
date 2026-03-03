import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: searchParams.get("role") || "donor",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Registration failed");
      toast.success("Account created! Please login.");
      navigate("/login");
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
          <h2 className="text-3xl font-bold text-stone-900">Create Account</h2>
          <p className="text-stone-500 mt-2">Join the FoodShare community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              {["donor", "volunteer"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role as any })}
                  className={`py-3 rounded-xl border-2 font-bold capitalize transition-all ${
                    formData.role === role
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Sign Up"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center mt-8 text-stone-500">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-emerald-600 font-bold hover:underline">
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

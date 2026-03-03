import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Users, Utensils, Heart, Trash2, ShieldAlert, BarChart3, Loader2 } from "lucide-react";

const AdminPanel: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (error) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User removed");
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
    </div>
  );

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm">
            <ShieldAlert className="w-4 h-4" /> System Secure
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: "Total Donations", value: stats?.totalDonations, icon: Utensils, color: "emerald" },
            { label: "Active Volunteers", value: stats?.activeVolunteers, icon: Users, color: "blue" },
            { label: "Food Saved (Meals)", value: stats?.foodSaved, icon: Heart, color: "rose" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50`}>
                <stat.icon className={`text-${stat.color}-600 w-6 h-6`} />
              </div>
              <p className="text-stone-500 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-stone-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* User Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Users className="text-stone-400 w-5 h-5" /> User Management
            </h2>
            <BarChart3 className="text-stone-300 w-5 h-5" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-stone-900">{user.name}</td>
                    <td className="px-6 py-4 text-stone-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                        user.role === 'donor' ? 'bg-blue-50 text-blue-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

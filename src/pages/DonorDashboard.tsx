import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Utensils, MapPin, Clock, Plus, Package, CheckCircle, Truck, Loader2 } from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { io } from "socket.io-client";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DonorDashboard: React.FC = () => {
  const { token } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    food_type: "",
    quantity: "",
    expiry_time: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    fetchDonations();
    const socket = io();
    socket.on("donation_updated", (updated) => {
      setDonations(prev => prev.map(d => d.id === parseInt(updated.id) ? { ...d, status: updated.status } : d));
    });

    // Get current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      },
      (err) => toast.error("Could not get location. Please enable GPS.")
    );

    return () => { socket.disconnect(); };
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDonations(data);
    } catch (error) {
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.latitude === 0) return toast.error("Waiting for location...");
    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to list food");
      const newDonation = await res.json();
      setDonations([newDonation, ...donations]);
      setFormData({ food_type: "", quantity: "", expiry_time: "", latitude: formData.latitude, longitude: formData.longitude });
      toast.success("Food listed successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "picked_up": return <Truck className="w-4 h-4 text-emerald-500" />;
      case "delivered": return <Package className="w-4 h-4 text-emerald-600" />;
      default: return null;
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* List Food Form */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 sticky top-24"
          >
            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Plus className="text-emerald-600" /> List New Food
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Food Type</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Rice & Curry, Sandwiches"
                  value={formData.food_type}
                  onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Quantity</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 10 meals, 5kg"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Expiry Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.expiry_time}
                  onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                />
              </div>
              
              <div className="h-48 rounded-2xl overflow-hidden border border-stone-200">
                {GOOGLE_MAPS_API_KEY && formData.latitude !== 0 ? (
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      center={{ lat: formData.latitude, lng: formData.longitude }}
                      zoom={15}
                      gestureHandling={'none'}
                      disableDefaultUI={true}
                    >
                      <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                    {formData.latitude === 0 ? "Detecting location..." : "Map Preview"}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "List Food Now"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Tracking List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">Your Donations</h2>
            <span className="px-3 py-1 bg-stone-200 text-stone-600 rounded-full text-xs font-bold">
              {donations.length} Total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
          ) : donations.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-stone-100 shadow-sm">
              <Utensils className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No donations yet. Start by listing some food!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {donations.map((donation) => (
                <motion.div
                  key={donation.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Utensils className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-lg">{donation.food_type}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-stone-500 text-sm flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" /> {donation.quantity}
                        </span>
                        <span className="text-stone-500 text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Expires: {new Date(donation.expiry_time).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 capitalize ${
                      donation.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      donation.status === 'accepted' ? 'bg-blue-50 text-blue-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {getStatusIcon(donation.status)}
                      {donation.status.replace('_', ' ')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

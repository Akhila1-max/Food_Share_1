import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { MapPin, Navigation, CheckCircle, Truck, Utensils, Loader2, Package } from "lucide-react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { io } from "socket.io-client";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const VolunteerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchDonations();
    const socket = io();
    socket.on("new_donation", (donation) => {
      setDonations(prev => [donation, ...prev]);
      toast("New food donation available!", { icon: "🍲" });
    });
    socket.on("donation_updated", (updated) => {
      setDonations(prev => prev.map(d => d.id === parseInt(updated.id) ? { ...d, status: updated.status, volunteer_id: updated.volunteer_id } : d));
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Could not get your location")
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

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Donation marked as ${status.replace('_', ' ')}`);
      fetchDonations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const myDonations = donations.filter(d => d.volunteer_id === user?.id && d.status !== 'delivered');

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-stone-100 overflow-hidden h-[500px] relative">
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultCenter={userLocation || { lat: 0, lng: 0 }}
                  defaultZoom={13}
                  mapId="foodshare_map"
                >
                  {pendingDonations.map(d => (
                    <Marker
                      key={d.id}
                      position={{ lat: d.latitude, lng: d.longitude }}
                      onClick={() => setSelectedDonation(d)}
                    />
                  ))}
                  {selectedDonation && (
                    <InfoWindow
                      position={{ lat: selectedDonation.latitude, lng: selectedDonation.longitude }}
                      onCloseClick={() => setSelectedDonation(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-bold text-stone-900">{selectedDonation.food_type}</h3>
                        <p className="text-xs text-stone-500 mb-2">{selectedDonation.quantity}</p>
                        <button
                          onClick={() => updateStatus(selectedDonation.id, 'accepted')}
                          className="w-full bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold"
                        >
                          Accept Pickup
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                Google Maps API Key Required
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-600 w-5 h-5" /> Available Pickups
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {pendingDonations.length === 0 ? (
                  <p className="text-stone-400 text-sm">No pending donations nearby.</p>
                ) : (
                  pendingDonations.map(d => (
                    <div key={d.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-800">{d.food_type}</h4>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{d.quantity}</span>
                      </div>
                      <button
                        onClick={() => updateStatus(d.id, 'accepted')}
                        className="w-full mt-2 bg-white border border-emerald-600 text-emerald-600 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Truck className="text-blue-600 w-5 h-5" /> Your Active Tasks
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {myDonations.length === 0 ? (
                  <p className="text-stone-400 text-sm">You have no active deliveries.</p>
                ) : (
                  myDonations.map(d => (
                    <div key={d.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-stone-800">{d.food_type}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{d.status.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => getDirections(d.latitude, d.longitude)}
                          className="flex items-center justify-center gap-1 bg-white border border-stone-200 text-stone-600 py-2 rounded-xl text-xs font-bold hover:bg-stone-50"
                        >
                          <Navigation className="w-3 h-3" /> Directions
                        </button>
                        {d.status === 'accepted' ? (
                          <button
                            onClick={() => updateStatus(d.id, 'picked_up')}
                            className="bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700"
                          >
                            Mark Picked Up
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(d.id, 'delivered')}
                            className="bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200"
          >
            <h3 className="text-xl font-bold mb-4">Volunteer Impact</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">Meals Delivered</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">Active Deliveries</p>
                  <p className="text-3xl font-bold">{myDonations.length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h4 className="font-bold text-stone-900 mb-4">Community Feed</h4>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-400">V</div>
                  <div>
                    <p className="text-sm text-stone-800 font-medium">Volunteer {i} delivered food to NGO</p>
                    <p className="text-[10px] text-stone-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
